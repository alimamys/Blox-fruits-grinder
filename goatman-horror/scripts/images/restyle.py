#!/usr/bin/env python3
"""Final art for "11 of Us Went Camping. 12 Came Back." (goatman) from the image model (gpt-image-2 edits, quality high).

STYLE=semi2d (default): every shot is drawn in code first as a LAYOUT GUIDE; the final
frame is generated from several reference images at once:
    1. the layout keyframe        - composition, camera, poses, positions, props ONLY
    2. the character sheet(s)     - everyone in the shot must match exactly
    3. the location reference(s)  - room layout, materials, light
    4. the style reference        - references/style/animated2d.png
STYLE=stick keeps the old single-image redraw of "The 63rd Passenger".

    .venv/bin/python scripts/images/restyle.py lookdev            # character sheets + locations (checkpoint)
    .venv/bin/python scripts/images/restyle.py plan               # build/restyle_plan.json from build/shotmap.json
    .venv/bin/python scripts/images/restyle.py pictures           # canvas pictures shown on screens
    .venv/bin/python scripts/images/restyle.py gen [--only ids] [--limit N] [--workers 4]
    .venv/bin/python scripts/images/restyle.py mouths             # mouth-open variants (MOUTH_VARIANTS=1)
    .venv/bin/python scripts/images/restyle.py parallax           # optional foreground layers (local, free)
    .venv/bin/python scripts/images/restyle.py manifest           # -> src/data/generated/restyle.json + pictures.json
    .venv/bin/python scripts/images/restyle.py cost               # spending so far

Inputs: build/shotmap.json (scripts/images/shotmap.mjs), build/keyframes/*.png
(scripts/images/keyframes.mjs), build/refs/*.png (scripts/images/refs.mjs).
Every API call is logged with its token usage to logs/image_costs.jsonl; the run stops
before the estimated spend passes IMAGE_BUDGET_USD (default 50). Outputs are cached: the
same inputs and prompt are never paid for twice.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent
SHOTMAP = ROOT / 'build' / 'shotmap.json'
KEYS = ROOT / 'build' / 'keyframes'
REFS = ROOT / 'build' / 'refs'
PLAN = ROOT / 'build' / 'restyle_plan.json'
OUT = ROOT / 'public' / 'restyle'
PICS = ROOT / 'public' / 'pictures'
CACHE = ROOT / 'logs' / 'image_cache.json'
LEDGER = ROOT / 'logs' / 'image_costs.jsonl'
MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'restyle.json'
PIC_MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'pictures.json'
SHEETS = ROOT / 'references' / 'sheets'
LOCS = ROOT / 'references' / 'locations'
STYLE_REF = ROOT / 'references' / 'style' / 'animated2d.png'
STYLE = os.environ.get('STYLE', 'semi2d')

STYLE_TEXT = (
    'semi-realistic 2D animated series for adults - clean line art, cel-shaded characters with natural proportions '
    'and very expressive eyes, painted atmospheric backgrounds, cinematic moody lighting'
)

# ---------------------------------------------------------------------------
# look bible
# ---------------------------------------------------------------------------
MARCUS_SPEC = (
    'Marcus: a 16-year-old Black American boy from Chicago, slim, average height, warm dark-brown skin, a round youthful face with large '
    'expressive dark-brown eyes, short black hair in a neat low fade, no facial hair; a plain dark-RED pullover hoodie over a white T-shirt, '
    'dark-blue jeans, clean white sneakers - a city kid who looks out of place in the woods.'
)
MARCUS_ADULT_SPEC = (
    'Marcus twelve years later: the SAME man at 28 - same warm dark-brown skin, same round face and large dark-brown eyes, now with a short '
    'neat beard and short black hair; a plain heather-GREY crewneck sweatshirt and dark jeans; tired eyes that have seen something.'
)
WYATT_SPEC = (
    'Wyatt Dawes: a 16-year-old white Southern country boy, skinny and tall, pale sunburnt skin with freckles, a narrow face, light-blue '
    'eyes, messy dirty-blond hair; a faded OLIVE-GREEN T-shirt, worn light-blue jeans, muddy brown work boots.'
)
COUSINS_SPEC = (
    'Marcus\'s three cousins from Alabama, all Black American teenagers: (1) DEZ, 17, tall, broad-shouldered and muscular, close-cropped '
    'hair, a heather-grey sleeveless basketball top, black athletic shorts over black leggings, slides with socks; (2) RAY, 15, small and '
    'skinny, big round glasses, short twists, an oversized mustard-YELLOW T-shirt, khaki shorts, sneakers; (3) NIA, 16, a girl, slim, dark-'
    'brown skin, long thin box braids tied back in a ponytail, a LAVENDER zip-up hoodie, black leggings, white sneakers.'
)
OTHERS_SPEC = (
    'The six other teenagers on the camping trip, all 15-17: (1) TASHA, a tall Black girl with a high curly puff, an ORANGE tank top and '
    'jean shorts; (2) JADA, a short Black girl with a pixie cut, an oversized PINK sweatshirt; (3) KAYLA, a Latina girl with long straight '
    'black hair in a ponytail, a GREEN flannel shirt; (4) ANDRE, a chubby Black boy with a RED baseball cap worn backwards, a white tee; '
    '(5) JAMAL, a lanky Black boy with cornrows, a BLUE basketball jersey; (6) TREY, a tall light-skinned Black boy with a flat-top, a '
    'charcoal-grey hoodie.'
)
ADULTS_SPEC = (
    'Two locals: (1) MR. DAWES, Wyatt\'s father, a white man of about 50, weathered sun-tanned face, grey stubble, a faded green cap '
    '(no logo), a brown canvas work jacket over a plaid shirt, jeans, boots, a shotgun broken open and resting in the crook of his arm, '
    'barrels pointing down; (2) COLE, Wyatt\'s 19-year-old cousin, white, stocky, a brown buzz cut and a patchy young beard, a red-and-black '
    'buffalo-check flannel jacket, jeans, boots, carrying a big heavy-duty lantern flashlight and a hunting rifle slung on his shoulder.'
)
THING_SPEC = (
    'The thing in the woods is NEVER seen clearly. It is only ever: (a) a tall, thin human figure standing perfectly still among the trees '
    'with its BACK to the viewer, its arms slightly too long and its head held at a slightly wrong tilt; (b) a person whose face it is '
    'wearing - identical to that person except the skin is a shade too grey, the eyes are fixed and never blink, the jaw hangs slack and '
    'the body stands far too still; (c) in the old legend, a dark silhouette of a tall man with a GOAT\'S head and long curved horns, '
    'half lost in mist and darkness; (d) a low, wrong shape crawling on too-long limbs through the brush, mostly in shadow.'
)
CHAR_NOTE = {
    'marcus': 'Marcus must match his character sheet EXACTLY: 16, warm dark-brown skin, round face, large dark-brown eyes, short black low '
              'fade, the dark-RED hoodie over a white T-shirt, dark-blue jeans, white sneakers.',
    'marcusAdult': 'Adult Marcus must match his sheet EXACTLY: 28, the same face with a short neat beard, heather-grey crewneck sweatshirt.',
    'wyatt': 'Wyatt must match his sheet EXACTLY: skinny white 16-year-old, freckles, messy dirty-blond hair, faded olive-green T-shirt, '
             'worn jeans, muddy work boots.',
    'cousins': 'The cousins must match their sheet EXACTLY: DEZ (big and muscular, grey sleeveless top), RAY (small, round glasses, '
               'twists, mustard-yellow T-shirt), NIA (long box braids in a ponytail, lavender hoodie).',
    'others': 'The other teenagers must match their line-up sheet EXACTLY (Tasha orange tank top and curly puff, Jada pink sweatshirt and '
              'pixie cut, Kayla green flannel and ponytail, Andre red backwards cap, Jamal blue jersey and cornrows, Trey grey hoodie and flat-top).',
    'adults': 'The adults must match their sheet EXACTLY: Mr. Dawes (about 50, grey stubble, green cap, brown work jacket, shotgun broken '
              'open in the crook of his arm) and Cole (19, buzz cut, patchy beard, red-and-black check flannel, lantern, rifle on his shoulder).',
    'thing': 'The thing must follow its design sheet EXACTLY and stay mostly hidden: a still figure seen from behind, a familiar person '
             'gone subtly wrong (grey skin, fixed unblinking eyes, slack jaw), or a shape in shadow - never a full, clear monster, never '
             'cartoonish, never gory.',
}
LOC_NOTE = {
    'clearing': 'A small clearing deep in the Alabama pine woods: two OLD camping trailers from the 1980s (white-and-tan aluminium bodies with a '
                'brown stripe, small windows with yellowed blinds, a metal door with two metal steps) parked at angles to each other; a ring-'
                'of-stones FIRE PIT with three log benches in the middle; a small weathered wooden shed between the trailers; a dirt track '
                'leading out between the trees; tall straight pine trunks all around and a floor of rust-brown pine needles.',
    'trailer': 'Inside one of the old camping trailers: a cramped living area with a built-in brown corduroy bench couch along one wall and a '
               'second bench opposite, a small fold-out table, dark wood-panelled walls, a tiny kitchenette with a two-burner stove and a '
               'dented pot, a small window with a yellowed roll-down blind beside the metal front door, a narrow BATHROOM door at the far end, '
               'worn brown linoleum floor, one weak ceiling light.',
    'trail': 'A narrow dirt footpath winding through dense pine-and-oak forest: ferns and thick undergrowth on both sides, low branches, '
             'tree trunks close together, a small hollow among the trees just off the path.',
    'creek': 'A small shallow creek in the woods: clear amber-brown water running over pebbles, a sandy bank, tangled bushes and tall trees '
             'leaning over the water.',
    'farm': 'The Dawes farmyard at the edge of the woods: a weathered white wooden farmhouse with a porch in the background, a muddy PIG PEN '
            'with a BROKEN wooden fence rail and a feed trough, the edge of a red barn, the dark woods behind.',
    'apartment': 'A small modern apartment living room in Chicago at night: a grey fabric couch facing a big TV, a low wooden coffee table, a '
                 'big window with city lights, and a short hallway leading to a CLOSED white bathroom door.',
}
SHEET_TAIL = (' Natural proportions, five fingers on each hand, clear readable silhouette, soft even studio light so every detail '
              'of face, hair and clothes is visible. No text, no labels, no captions.')
LOC_TAIL = ' Wide establishing view, no people at all, no text, letters, numbers or logos anywhere.'
SHEET = 'Character model sheet for an animated horror film, in exactly the style of the style reference image.'
LOOKDEV = {
    'marcus_turnaround': {
        'out': SHEETS / 'marcus_turnaround.png', 'refs': [],
        'prompt': (f'{SHEET} {MARCUS_SPEC} Show him full body three times side by side on a plain light-grey background, same scale, standing in '
                   'a neutral pose: FRONT view, THREE-QUARTER view, SIDE (profile) view.' + SHEET_TAIL),
    },
    'marcus_expressions': {
        'out': SHEETS / 'marcus_expressions.png', 'refs': ['sheet:marcus_turnaround'],
        'prompt': ('Expression sheet for the SAME boy as in the character sheet image (identical face, low fade, dark-red hoodie), in exactly the '
                   'style of the style reference. Five head-and-shoulders portraits in a row on a plain dark-grey background, each lit by a '
                   'strong key light on the face with deep shadow around it: 1 RELAXED, a small grin, 2 UNEASY, 3 TERRIFIED (eyes very wide, '
                   'brows pulled up, mouth tense), 4 SHOUTING, 5 COUNTING in disbelief (lips parted, eyes moving). Very expressive eyes, '
                   'readable on a phone screen. No text, no labels.'),
    },
    'marcus_adult': {
        'out': SHEETS / 'marcus_adult.png', 'refs': ['sheet:marcus_turnaround'],
        'prompt': (f'{SHEET} {MARCUS_ADULT_SPEC} He is the grown-up version of the boy in the character sheet image (keep the face recognisably '
                   'the same). On a plain light-grey background: his full body in FRONT and THREE-QUARTER view, and two head-and-shoulders '
                   'portraits: QUIET and haunted, and FROZEN with dread.' + SHEET_TAIL),
    },
    'wyatt': {
        'out': SHEETS / 'wyatt.png', 'refs': [],
        'prompt': (f'{SHEET} {WYATT_SPEC} On a plain light-grey background: his full body in FRONT, THREE-QUARTER and SIDE view at the same '
                   'scale, a fourth full-body view holding a bolt-action hunting rifle pointed at the ground, and two head-and-shoulders '
                   'portraits: TERRIFIED and out of breath, and WHISPERING, pale as a sheet.' + SHEET_TAIL),
    },
    'cousins': {
        'out': SHEETS / 'cousins.png', 'refs': [],
        'prompt': (f'{SHEET} {COUSINS_SPEC} Show the three cousins standing side by side in FRONT view on a plain light-grey background, at '
                   'their true relative heights (Dez tallest, Ray smallest), and under them a head-and-shoulders portrait of each one: Dez '
                   'CRYING, Ray WHISPERING with wide eyes behind his glasses, Nia SCREAMING.' + SHEET_TAIL),
    },
    'others': {
        'out': SHEETS / 'others.png', 'refs': [],
        'prompt': (f'Character line-up sheet for an animated horror film, in exactly the style of the style reference image. {OTHERS_SPEC} '
                   'Show the six of them standing side by side in FRONT view on a plain light-grey background, same scale, each clearly '
                   'different, relaxed summer-camp faces.' + SHEET_TAIL),
    },
    'adults': {
        'out': SHEETS / 'adults.png', 'refs': [],
        'prompt': (f'{SHEET} {ADULTS_SPEC} On a plain light-grey background: Mr. Dawes in FRONT and THREE-QUARTER view, Cole in FRONT and '
                   'THREE-QUARTER view, all at the same scale, plus a head-and-shoulders portrait of each: Mr. Dawes SERIOUS and wary, Cole '
                   'CONFUSED.' + SHEET_TAIL),
    },
    'thing': {
        'out': SHEETS / 'thing.png', 'refs': ['sheet:cousins'],
        'prompt': (f'Design sheet for the unseen threat of an animated horror film, in exactly the style of the style reference image. {THING_SPEC} '
                   'On a plain dark-grey background show four panels: (1) the tall thin figure standing among pine trunks at night, seen from '
                   'BEHIND, perfectly still; (2) the girl NIA from the cousins sheet image (same braids and lavender hoodie) as the thing wears '
                   'her: skin a shade too grey, fixed glassy unblinking eyes, slack jaw, standing too still; (3) the goat-headed silhouette with '
                   'curved horns in mist between the trees; (4) the low shape crawling through the brush on too-long limbs, mostly in shadow. '
                   'Frightening but not gory: no blood, no wounds. No text, no labels.'),
    },
    'loc_clearing': {'out': LOCS / 'clearing.png', 'refs': [], 'loc': 'clearing', 'prompt': (
        'Location reference: ' + LOC_NOTE['clearing'] + ' Late afternoon: warm low sunlight slanting through the pines, long shadows.' + LOC_TAIL)},
    'loc_trailer': {'out': LOCS / 'trailer.png', 'refs': ['loc:clearing'], 'loc': 'trailer', 'prompt': (
        'Location reference, inside one of the trailers of the clearing location reference: ' + LOC_NOTE['trailer'] + ' Seen from the kitchenette end '
        'toward the front door and the window, the bathroom door on the side. Night: the weak ceiling light on, warm and dim, black outside '
        'the window.' + LOC_TAIL)},
    'loc_trail': {'out': LOCS / 'trail.png', 'refs': [], 'loc': 'trail', 'prompt': (
        'Location reference: ' + LOC_NOTE['trail'] + ' Dusk, almost dark: deep blue light, the path fading into black between the trunks.' + LOC_TAIL)},
    'loc_creek': {'out': LOCS / 'creek.png', 'refs': [], 'loc': 'creek', 'prompt': (
        'Location reference: ' + LOC_NOTE['creek'] + ' A hot afternoon: dappled sunlight on the water, green and gold.' + LOC_TAIL)},
    'loc_farm': {'out': LOCS / 'farm.png', 'refs': [], 'loc': 'farm', 'prompt': (
        'Location reference: ' + LOC_NOTE['farm'] + ' Overcast late afternoon, flat grey light, the woods dark behind. The pen is EMPTY: no animals.'
        + LOC_TAIL)},
    'loc_apartment': {'out': LOCS / 'apartment.png', 'refs': [], 'loc': 'apartment', 'prompt': (
        'Location reference: ' + LOC_NOTE['apartment'] + ' Night: the room lit by the TV glow and one warm lamp, city lights outside.' + LOC_TAIL)},
}

SAFE_NOTE = (
    'Context: one frame of an animated horror story for a general audience, like a TV horror cartoon - suspense and dread among teenagers '
    'camping in the woods; nothing gory or graphic, no blood, no wounds. Hunting rifles may be carried, held pointing down or fired into '
    'the sky, never aimed at a person. '
)

RULES = (
    'RULES: natural anatomy and natural, relaxed-but-tense poses; exactly five fingers on every hand; people sit ON chairs and floors, '
    'never through them; faces expressive and readable on a small phone screen - wide eyes, tense mouths, strong light on the face and '
    'deep shadows around it; a mouth is closed unless the description says the person is talking or screaming. Add NOTHING that is not '
    'described: no extra people, no faces in the background, no reflections of people, no ghosts, no text, letters, numbers, captions, '
    'logos or watermarks. 16:9 film frame: keep everything important inside the middle horizontal band (the top and bottom 8% are cropped).'
)

STICK_PROMPT = (
    'Redraw this exact frame as a polished, high-quality 2D cartoon illustration in the SAME stick-figure character style. Keep the '
    'composition, camera angle, framing, characters, poses and lighting exactly the same. No text, no captions, no watermark.'
)

# ---------------------------------------------------------------------------
# env, cache, ledger, budget
# ---------------------------------------------------------------------------
_lock = threading.Lock()
STOP = threading.Event()


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if raw and not raw.startswith('#') and '=' in raw:
                k, v = raw.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def price(usage: dict) -> float:
    """Estimated USD for one call from the API's token usage. Rates per 1M tokens are
    configurable (IMAGE_PRICE_TEXT_IN / IMAGE_PRICE_IMAGE_IN / IMAGE_PRICE_OUT); the
    defaults are deliberately conservative."""
    t_in = float(os.environ.get('IMAGE_PRICE_TEXT_IN', 5))
    i_in = float(os.environ.get('IMAGE_PRICE_IMAGE_IN', 10))
    out = float(os.environ.get('IMAGE_PRICE_OUT', 40))
    det = usage.get('input_tokens_details') or {}
    text = det.get('text_tokens', 0)
    img = det.get('image_tokens', max(0, usage.get('input_tokens', 0) - text))
    return (text * t_in + img * i_in + usage.get('output_tokens', 0) * out) / 1e6


def spent() -> float:
    if not LEDGER.exists():
        return 0.0
    return sum(json.loads(x).get('usd', 0) for x in LEDGER.read_text().splitlines() if x.strip())


def budget() -> float:
    return float(os.environ.get('IMAGE_BUDGET_USD', 30))  # approved cap for this film ($30)


def log_cost(kind: str, out: str, usage: dict) -> float:
    usd = price(usage) if usage else float(os.environ.get('IMAGE_FALLBACK_USD', 0.25))
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        with LEDGER.open('a') as fh:
            fh.write(json.dumps({'t': time.strftime('%Y-%m-%dT%H:%M:%S'), 'kind': kind, 'out': out, 'usage': usage, 'usd': round(usd, 4)}) + '\n')
    return usd


def cache_get() -> dict:
    return json.loads(CACHE.read_text()) if CACHE.exists() else {}


def cache_put(name: str, h: str) -> None:
    with _lock:
        c = cache_get()
        c[name] = h
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps(c, indent=1, sort_keys=True))


# ---------------------------------------------------------------------------
# images
# ---------------------------------------------------------------------------
def png_bytes(img: Image.Image) -> bytes:
    bio = io.BytesIO()
    img.save(bio, 'PNG')
    return bio.getvalue()


def frame_canvas(img: Image.Image) -> Image.Image:
    """16:9 frame -> 1536x1024 canvas: the frame in the middle, the extra top/bottom filled
    with a blurred stretch of the frame's own edges (never black bars the model could copy)."""
    im = img.convert('RGB').resize((1536, 864), Image.LANCZOS)
    canvas = im.resize((1536, 1024), Image.BILINEAR).filter(ImageFilter.GaussianBlur(24))
    canvas.paste(im, (0, 80))
    return canvas


def uncanvas(img: Image.Image) -> Image.Image:
    return img.convert('RGB').resize((1536, 1024), Image.LANCZOS).crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def ref_image(path: Path, long_side: int = 1024) -> Image.Image:
    im = Image.open(path).convert('RGB')
    k = long_side / max(im.size)
    return im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS) if k < 1 else im


_fidelity_ok = [True]


def openai_edit(images: list[bytes], prompt: str, kind: str, out_name: str, quality: str | None = None) -> Image.Image:
    """POST /v1/images/edits with one or more input images (image[] fields)."""
    key = os.environ['OPENAI_API_KEY']
    if STOP.is_set():
        raise RuntimeError('stopped')
    if spent() >= budget():
        STOP.set()
        raise RuntimeError(f'budget reached (${spent():.2f} of ${budget():.2f}) - stopping')
    model = os.environ.get('IMAGE_MODEL', 'gpt-image-2')
    fields = [('model', model), ('prompt', prompt), ('size', '1536x1024'), ('quality', quality or os.environ.get('IMAGE_QUALITY', 'high')), ('n', '1')]
    fid = os.environ.get('IMAGE_INPUT_FIDELITY', 'high')
    delay = 10.0
    for attempt in range(7):
        use_fid = fid and _fidelity_ok[0]
        boundary = '----f240' + hashlib.md5(prompt.encode() + str(attempt).encode()).hexdigest()
        buf = io.BytesIO()
        for n, v in fields + ([('input_fidelity', fid)] if use_fid else []):
            buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode())
        for i, png in enumerate(images):
            buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="in{i}.png"\r\nContent-Type: image/png\r\n\r\n'.encode())
            buf.write(png)
            buf.write(b'\r\n')
        buf.write(f'--{boundary}--\r\n'.encode())
        req = urllib.request.Request(
            'https://api.openai.com/v1/images/edits',
            data=buf.getvalue(),
            headers={'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'},
        )
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                d = json.loads(r.read())
            usd = log_cost(kind, out_name, d.get('usage') or {})
            print(f'    ${usd:.3f}  {out_name}  (total ${spent():.2f})', flush=True)
            return Image.open(io.BytesIO(base64.b64decode(d['data'][0]['b64_json']))).convert('RGB')
        except urllib.error.HTTPError as e:
            msg = e.read()[:400].decode(errors='replace')
            if e.code == 400 and 'input_fidelity' in msg and use_fid:
                _fidelity_ok[0] = False  # this model does not take the parameter
                continue
            if 'credit_balance' in msg or 'insufficient_quota' in msg or 'billing' in msg:
                STOP.set()
                raise RuntimeError(f'HTTP {e.code}: {msg}') from e
            if e.code in (429, 500, 502, 503, 504) and attempt < 6:
                time.sleep(delay)
                delay = min(120, delay * 2)
                continue
            raise RuntimeError(f'HTTP {e.code}: {msg}') from e
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError) as e:
            if attempt < 6:
                time.sleep(delay)
                delay = min(120, delay * 2)
                continue
            raise RuntimeError(f'connection: {e}') from e
    raise RuntimeError('too many retries')


# ---------------------------------------------------------------------------
# references
# ---------------------------------------------------------------------------
CHAR_SHEET = {
    'marcus': ('marcus_board', "MARCUS'S CHARACTER SHEET (turnaround and expressions)"),
    'marcusAdult': ('marcus_adult', "ADULT MARCUS'S CHARACTER SHEET"),
    'wyatt': ('wyatt', "WYATT'S CHARACTER SHEET"),
    'cousins': ('cousins', "THE COUSINS' CHARACTER SHEET (Dez, Ray, Nia)"),
    'others': ('others', "THE OTHER TEENAGERS' LINE-UP SHEET"),
    'adults': ('adults', "THE ADULTS' CHARACTER SHEET (Mr. Dawes, Cole)"),
    'thing': ('thing', "THE THING'S DESIGN SHEET"),
}


def marcus_board() -> Path:
    """One reference image for Marcus: the turnaround above the expressions."""
    out = SHEETS / 'marcus_board.jpg'
    a, b = SHEETS / 'marcus_turnaround.png', SHEETS / 'marcus_expressions.png'
    if a.exists() and b.exists() and (not out.exists() or out.stat().st_mtime < max(a.stat().st_mtime, b.stat().st_mtime)):
        ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
        w = 1536
        ia = ia.resize((w, int(ia.height * w / ia.width)), Image.LANCZOS)
        ib = ib.resize((w, int(ib.height * w / ib.width)), Image.LANCZOS)
        board = Image.new('RGB', (w, ia.height + ib.height), (40, 40, 40))
        board.paste(ia, (0, 0))
        board.paste(ib, (0, ia.height))
        board.save(out, quality=92)
    return out


def resolve_ref(tag: str) -> tuple[Path, str]:
    kind, name = tag.split(':', 1)
    if kind == 'sheet':
        return SHEETS / f'{name}.png', f'the character sheet "{name}"'
    if kind == 'char':
        stem, label = CHAR_SHEET[name]
        if stem == 'marcus_board':
            return marcus_board(), label
        return SHEETS / f'{stem}.png', label
    if kind == 'loc':
        return LOCS / f'{name}.png', f'the LOCATION REFERENCE for {name}'
    if kind == 'ref':
        return REFS / f'{name}.png', 'the LAYOUT GUIDE'
    if kind == 'pic':
        return PICS / f'{name}.jpg', 'the EXISTING FRAME to edit'
    if kind == 'frame':
        return OUT / name, 'the PREVIOUS KEYFRAME of this same shot (keep its camera, room, light and characters)'
    raise KeyError(tag)


def build_request(layout: Path | None, refs: list[str], body: str, layout_is_frame: bool = True) -> tuple[list[bytes], str]:
    """Images in a fixed order + a prompt that names each image by position."""
    imgs: list[bytes] = []
    names: list[str] = []
    if layout is not None:
        im = Image.open(layout)
        imgs.append(png_bytes(frame_canvas(im) if layout_is_frame else ref_image(layout)))
        names.append('the LAYOUT GUIDE - a rough code-drawn mock-up. Take ONLY the composition, camera angle, framing, the positions and '
                     'poses of the people, the props and the direction of the light from it. Do NOT copy its flat simple shapes, its '
                     'drawing style or its colours')
    for tag in refs:
        p, label = resolve_ref(tag)
        if not p.exists():
            raise FileNotFoundError(f'missing reference {tag}: {p}')
        imgs.append(png_bytes(ref_image(p)))
        names.append(label)
    imgs.append(png_bytes(ref_image(STYLE_REF)))
    names.append(f'the STYLE REFERENCE - draw in exactly this style: {STYLE_TEXT}. It shows a ferry deck with a young couple and an old woman: '
                 'they are NOT in this film and must NEVER appear; take ONLY the drawing style (line art, cel shading, painted light) from it')
    intro = ' '.join(f'Image {i + 1} is {n}.' for i, n in enumerate(names))
    return imgs, f'{intro}\n\n{body}\n\n{RULES}'


# ---------------------------------------------------------------------------
# lookdev: character sheets + locations
# ---------------------------------------------------------------------------
def cmd_lookdev(only: set | None) -> None:
    load_env()
    require_key()
    SHEETS.mkdir(parents=True, exist_ok=True)
    LOCS.mkdir(parents=True, exist_ok=True)
    order = list(LOOKDEV)
    for name in order:
        if only and name not in only:
            continue
        spec = LOOKDEV[name]
        if STOP.is_set():
            break
        layout = None
        refs = []
        for r in spec['refs']:
            if r.startswith('ref:'):
                layout = REFS / f'{r[4:]}.png'
            else:
                refs.append(r)
        body = spec['prompt'] + (' Use the layout guide only for the room\'s geometry and camera; paint it fully in the style.' if layout else '')
        imgs, prompt = build_request(layout, refs, body, layout_is_frame=True)
        h = hashlib.sha1(b''.join(imgs) + prompt.encode()).hexdigest()
        if spec['out'].exists() and cache_get().get(spec['out'].name) == h:
            print(f'  cached {spec["out"].name}')
            continue
        img = openai_edit(imgs, prompt, 'lookdev', spec['out'].name)
        if layout is not None:
            img = uncanvas(img)
        img.save(spec['out'])
        cache_put(spec['out'].name, h)
        print(f'  -> {spec["out"].relative_to(ROOT)}')
    marcus_board()


def require_key() -> None:
    if not os.environ.get('OPENAI_API_KEY'):
        print('OPENAI_API_KEY is not set (environment or .env) - nothing generated.')
        sys.exit(2)


# ---------------------------------------------------------------------------
# plan
# ---------------------------------------------------------------------------
def as_list(v) -> list:
    return [] if v is None else v if isinstance(v, list) else [v]


def cmd_plan() -> None:
    sm = json.loads(SHOTMAP.read_text())
    plan = []
    for sh in sm['shots']:
        art = sh.get('art')
        if not art:
            plan.append({**sh, 'mode': 'code'})
            continue
        kind = art['kind']
        if kind == 'reuse':
            plan.append({**sh, 'mode': 'reuse'})
            continue
        n = art.get('keys', 3) if kind == 'action' else 1
        keys = list(range(n)) if kind == 'action' else [1]
        refs = [f'char:{c}' for c in as_list(art.get('chars'))] + [f'loc:{l}' for l in as_list(art.get('loc'))]
        plan.append({**sh, 'mode': kind, 'keys': keys, 'refs': refs, 'talk': art.get('talk') or [], 'mouth': kind == 'talk'})
    PLAN.write_text(json.dumps(plan, indent=1))
    from collections import Counter

    cnt = Counter(p['mode'] for p in plan)
    gens = sum(len(p.get('keys', [])) for p in plan)
    mouths = sum(1 for p in plan if p.get('mouth'))
    print(f'{len(plan)} shots: {dict(cnt)} -> {gens} frames + {mouths} mouth variants')


def shot_prompt(p: dict, k: int) -> str:
    art = p['art']
    who = ' '.join(CHAR_NOTE[c] for c in as_list(art.get('chars')))
    where = ' '.join(LOC_NOTE[l] for l in as_list(art.get('loc')))
    keytxt = ''
    if p['mode'] == 'action':
        n = len(p['keys'])
        keytxt = (f' This image is KEYFRAME {k + 1} of {n} of one continuous action shot - draw exactly the moment described for keyframe {k + 1}; '
                  'the other keyframes show the same place, camera and characters at other moments.')
    dark = ' This is a very dark frame: keep it just as dark, only the described light sources lit.' if art.get('dark') else ''
    talk = ' The speaking person\'s mouth is CLOSED in this frame.' if p['mode'] == 'talk' else ''
    nobody = ('THIS FRAME CONTAINS NO PEOPLE AT ALL: no man, no woman, no couple, no faces, no hands or arms - '
              'do not copy the people of the style reference. ' if art.get('noPeople') else '')
    chain = (' Another reference image is the PREVIOUS KEYFRAME of this same shot: keep exactly its camera, framing, room, light '
             'and the look of everything in it; change only what this keyframe describes.' if art.get('chainKeys') and k > 0 else '')
    return (f'{nobody}Draw one frame of the animated horror film "11 of Us Went Camping. 12 Came Back.". FRAME: {art.get("prompt", "")}{keytxt}{talk}{chain} '
            f'MOOD AND LIGHT: {art.get("mood", "")}{dark} '
            f'{who} SETTING: {where}')


# ---------------------------------------------------------------------------
# canvas pictures (on screens)
# ---------------------------------------------------------------------------
def cmd_pictures(only: set | None) -> None:
    load_env()
    require_key()
    meta = json.loads((ROOT / 'build' / 'refs.json').read_text())['pictures']
    PICS.mkdir(parents=True, exist_ok=True)
    done: set = set()

    def make(pid: str) -> None:
        if pid in done or STOP.is_set():
            return
        spec = meta[pid]
        if spec.get('base'):
            make(spec['base'])
        if only and pid not in only:
            done.add(pid)
            return
        refs = []
        if spec.get('base'):
            refs.append(f'pic:{spec["base"]}')
        if spec.get('figure'):
            refs.append('char:figure')
        refs.append('loc:hallway')
        body = ('Draw a single frame of MARA\'S OWN 2D ANIMATION - a painted picture shown on her computer screen, filling the whole frame '
                '(no screen, no computer, no interface around it). ' + spec['prompt'])
        if spec.get('base'):
            body += (' Start from the EXISTING FRAME image and keep everything in it exactly the same - same hallway, same perspective, same '
                     'light, same brushwork - changing only what is described.')
        imgs, prompt = build_request(REFS / f'pic_{pid}.png', refs, body)
        out = PICS / f'{pid}.jpg'
        h = hashlib.sha1(b''.join(imgs) + prompt.encode()).hexdigest()
        if not (out.exists() and cache_get().get(out.name) == h):
            img = uncanvas(openai_edit(imgs, prompt, 'picture', out.name))
            img.save(out, quality=92)
            cache_put(out.name, h)
        done.add(pid)

    for pid in meta:
        make(pid)
    write_pic_manifest()


def write_pic_manifest() -> None:
    pics = {p.stem: f'pictures/{p.name}' for p in sorted(PICS.glob('*.jpg'))} if PICS.exists() else {}
    PIC_MANIFEST.write_text(json.dumps({'pictures': pics}, indent=1))
    print(f'pictures: {len(pics)} -> {PIC_MANIFEST.relative_to(ROOT)}')


# ---------------------------------------------------------------------------
# frames
# ---------------------------------------------------------------------------
def frame_jobs(plan: list, only: set | None) -> list:
    jobs = []
    for p in plan:
        if p['mode'] not in ('still', 'action', 'talk'):
            continue
        if only and p['id'] not in only:
            continue
        for k in p['keys']:
            jobs.append({'p': p, 'k': k, 'src': KEYS / f"{p['id']}_k{k}.png", 'out': OUT / f"{p['id']}_k{k}.jpg"})
    return jobs


def cmd_gen(only: set | None, limit: int, workers: int) -> None:
    load_env()
    require_key()
    OUT.mkdir(parents=True, exist_ok=True)
    plan = json.loads(PLAN.read_text())
    jobs = frame_jobs(plan, only)
    if limit:
        jobs = jobs[:limit]
    state = {'done': 0, 'failed': 0, 'cached': 0}

    def run(j: dict) -> None:
        if STOP.is_set():
            return
        if not j['src'].exists():
            print(f'  ! missing layout {j["src"].name}')
            state['failed'] += 1
            return
        if STYLE == 'stick':
            imgs, prompt = [png_bytes(frame_canvas(Image.open(j['src'])))], STICK_PROMPT
        else:
            refs = list(j['p']['refs'])
            art = j['p'].get('art') or {}
            if art.get('chainKeys') and j['k'] > 0:
                prev = OUT / f"{j['p']['id']}_k{j['k'] - 1}.jpg"
                if not prev.exists():
                    print(f'  ! {j["out"].name}: previous keyframe missing - run again after it exists')
                    state['failed'] += 1
                    return
                refs.append(f'frame:{prev.name}')
            imgs, prompt = build_request(j['src'], refs, shot_prompt(j['p'], j['k']))
        q = (j['p'].get('art') or {}).get('quality') or os.environ.get('IMAGE_QUALITY', 'high')
        h = hashlib.sha1(b''.join(imgs) + prompt.encode() + q.encode()).hexdigest()
        if j['out'].exists() and cache_get().get(j['out'].name) == h:
            state['cached'] += 1
            return
        try:
            try:
                img = uncanvas(openai_edit(imgs, prompt, 'frame', j['out'].name, quality=q))
            except RuntimeError as e:
                if 'safety system' not in str(e) and 'moderation' not in str(e):
                    raise
                # false positives on quiet, spooky-but-harmless frames: say what it is and retry once
                img = uncanvas(openai_edit(imgs, SAFE_NOTE + prompt, 'frame', j['out'].name, quality=q))
        except Exception as e:  # noqa: BLE001
            state['failed'] += 1
            print(f'  ! {j["out"].name}: {str(e)[:200]}', flush=True)
            return
        img.save(j['out'], 'JPEG', quality=92)
        cache_put(j['out'].name, h)
        state['done'] += 1

    for k in sorted({j['k'] for j in jobs}):
        # keyframes in order, so a chained keyframe always finds the previous one
        batch = [j for j in jobs if j['k'] == k]
        with ThreadPoolExecutor(max_workers=workers) as ex:
            list(ex.map(run, batch))
    print(f'frames: generated {state["done"]}, cached {state["cached"]}, failed {state["failed"]}; spent so far ${spent():.2f} of ${budget():.2f}')


# ---------------------------------------------------------------------------
# mouth-open variants (lip sync): only the mouth region is taken from the variant
# ---------------------------------------------------------------------------
MOUTH_PROMPT = (
    'Edit this image: the person in the middle of the frame is talking. Change ONLY their mouth: open it slightly, mid-word, a small '
    'natural opening with the teeth barely visible. Do not change anything else at all - same face, eyes, expression, hair, clothes, '
    'hands, background, framing, light and colours, pixel for pixel.'
)


def mouth_window(pid: str, shape: tuple[int, int]) -> tuple[int, int, int, int]:
    """Search window for the mouth in the generated frame: around the magenta marker in the
    mouth-key layout (the generated frame keeps the layout's composition), else the face area."""
    H, W = shape
    f = KEYS / f'{pid}_mouth.png'
    if f.exists():
        a = np.asarray(Image.open(f).convert('RGB').resize((W, H))).astype(int)
        m = (a[..., 0] > 220) & (a[..., 1] < 50) & (a[..., 2] > 220)
        ys, xs = np.nonzero(m)
        if len(xs) > 10:
            cx, cy = xs.mean(), ys.mean()
            r = max(120, 4 * (xs.max() - xs.min()))
            return int(max(0, cx - r)), int(max(0, cy - r)), int(min(W, cx + r)), int(min(H, cy + r))
    return int(W * 0.2), int(H * 0.15), int(W * 0.8), int(H * 0.9)


def merge_mouth(base: Image.Image, var: Image.Image, win: tuple[int, int, int, int], max_box: tuple[int, int] | None = None) -> tuple[Image.Image, float]:
    """Paste the variant's mouth onto the base: the largest changed blob inside the window,
    feathered. Returns the merged image and the changed area (px) for QA."""
    import cv2

    b = np.asarray(base.convert('RGB')).astype(np.float32)
    v = np.asarray(var.convert('RGB').resize(base.size, Image.LANCZOS)).astype(np.float32)
    d = np.abs(b - v).mean(axis=2)
    x0, y0, x1, y1 = win
    mask = np.zeros(d.shape, np.uint8)
    sub = (cv2.GaussianBlur(d[y0:y1, x0:x1], (0, 0), 3) > 18).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(sub, 8)
    if n <= 1:
        return base, 0.0
    cand = [c for c in range(1, n) if not max_box or (stats[c, cv2.CC_STAT_WIDTH] <= max_box[0] and stats[c, cv2.CC_STAT_HEIGHT] <= max_box[1])]
    if not cand:
        return base, 0.0
    i = max(cand, key=lambda c: stats[c, cv2.CC_STAT_AREA])
    mask[y0:y1, x0:x1] = (lab == i).astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((15, 15), np.uint8))
    alpha = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 6)[..., None]
    out = b * (1 - alpha) + v * alpha
    return Image.fromarray(out.clip(0, 255).astype(np.uint8)), float(mask.sum())


def cmd_mouths(only: set | None) -> None:
    load_env()
    require_key()
    plan = json.loads(PLAN.read_text())
    report = []
    for p in plan:
        if not p.get('mouth') or (only and p['id'] not in only) or STOP.is_set():
            continue
        base_p = OUT / f"{p['id']}_k1.jpg"
        out = OUT / f"{p['id']}_k1_talk.jpg"
        raw = ROOT / 'build' / 'mouth_raw' / f"{p['id']}.jpg"
        if not base_p.exists():
            print(f'  ! no base frame for {p["id"]}')
            continue
        base = Image.open(base_p).convert('RGB')
        imgs = [png_bytes(frame_canvas(base))]
        h = hashlib.sha1(imgs[0] + MOUTH_PROMPT.encode()).hexdigest()
        if not (raw.exists() and cache_get().get('mouth_' + raw.name) == h):
            var = uncanvas(openai_edit(imgs, MOUTH_PROMPT, 'mouth', out.name))
            raw.parent.mkdir(parents=True, exist_ok=True)
            var.save(raw, quality=95)
            cache_put('mouth_' + raw.name, h)
        var_img = Image.open(raw)
        merged, area = merge_mouth(base, var_img, mouth_window(p['id'], (base.height, base.width)))
        if area < 200:
            # the generated frame placed the face elsewhere than the layout: search the whole frame
            merged, area = merge_mouth(base, var_img, (0, 0, base.width, base.height), max_box=(320, 260))
        merged.save(out, quality=92)
        report.append({'id': p['id'], 'changed_px': area})
        print(f'  {p["id"]}: mouth region {area:.0f} px' + ('  <- NO CHANGE, check' if area < 200 else ''))
    (ROOT / 'build' / 'mouths.json').write_text(json.dumps(report, indent=1))


# ---------------------------------------------------------------------------
# animation drawings (limited animation): edits of the finished frame, merged back onto it
# ---------------------------------------------------------------------------
EDIT_RULE = (
    'EDIT THIS EXACT IMAGE (image 1 is the finished frame). Change ONLY what is described below and keep everything else '
    'IDENTICAL, pixel for pixel: the camera, framing, composition, background, light, colours, and every person\'s face, hair, '
    'clothes and pose. Same drawing style. No text, no new people. CHANGE: '
)
BLINK_PROMPT = ('The main person\'s eyes are CLOSED, as in the middle of a blink: eyelids fully down, lashes visible, the brows and the '
                'rest of the face unchanged. Nothing else changes.')


def edit_request(base: Image.Image, chars: list, body: str) -> tuple[list[bytes], str]:
    imgs = [png_bytes(frame_canvas(base))]
    names = ['the FINISHED FRAME to edit']
    for c in chars:
        pth, label = resolve_ref(f'char:{c}')
        imgs.append(png_bytes(ref_image(pth)))
        names.append(label + ' (for reference only)')
    intro = ' '.join(f'Image {i + 1} is {n}.' for i, n in enumerate(names))
    return imgs, f'{intro}\n\n{EDIT_RULE}{body}'


def merge_variant(base: Image.Image, var: Image.Image, thr: float = 20, min_frac: float = 0.00012, eyes_only: bool = False) -> tuple[Image.Image, np.ndarray, float]:
    """Keep the base frame and take from the variant only what really changed (so the
    background never boils between drawings). Returns merged image, mask (0/1) and the
    changed fraction of the frame."""
    import cv2

    b = np.asarray(base.convert('RGB')).astype(np.float32)
    v = np.asarray(var.convert('RGB').resize(base.size, Image.LANCZOS)).astype(np.float32)
    d = cv2.GaussianBlur(np.abs(b - v).mean(axis=2), (0, 0), 4)
    m = (d > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    area_min = min_frac * m.size
    comps = [c for c in range(1, n) if st[c, cv2.CC_STAT_AREA] >= area_min]
    if eyes_only and comps:
        # a blink: keep only the eye pair - the strongest change and anything level with it
        H, W = m.shape
        score = {c: st[c, cv2.CC_STAT_AREA] * float(d[lab == c].mean()) for c in comps}
        top = max(comps, key=lambda c: score[c])
        ty = st[top, cv2.CC_STAT_TOP] + st[top, cv2.CC_STAT_HEIGHT] / 2
        tx = st[top, cv2.CC_STAT_LEFT] + st[top, cv2.CC_STAT_WIDTH] / 2
        comps = [c for c in comps if abs(st[c, cv2.CC_STAT_TOP] + st[c, cv2.CC_STAT_HEIGHT] / 2 - ty) < 0.035 * H
                 and abs(st[c, cv2.CC_STAT_LEFT] + st[c, cv2.CC_STAT_WIDTH] / 2 - tx) < 0.2 * W and st[c, cv2.CC_STAT_HEIGHT] < 0.12 * H]
    for c in comps:
        keep[lab == c] = 1
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    keep = cv2.dilate(keep, np.ones((17, 17), np.uint8))
    if not eyes_only:
        # a pose change (a head turning, shoulders rising): take each changed area WHOLE - its filled
        # convex outline plus a margin - from the new drawing. A per-pixel merge keeps the old drawing
        # wherever old and new happen to match (skin on skin, dark on dark) and shows two faces / two
        # pairs of glasses at once.
        cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hull = np.zeros_like(keep)
        for c in cnts:
            cv2.fillConvexPoly(hull, cv2.convexHull(c), 1)
        keep = cv2.dilate(hull, np.ones((31, 31), np.uint8))
    if not eyes_only and keep.mean() > 0.12:
        # a big change (people turning, a pose change): take the whole drawing - a partial merge
        # would cut people in half or leave ghosts
        return Image.fromarray(v.clip(0, 255).astype(np.uint8)), np.ones_like(keep), 1.0
    alpha = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 7 if eyes_only else 11)[..., None]
    out = b * (1 - alpha) + v * alpha
    return Image.fromarray(out.clip(0, 255).astype(np.uint8)), keep, float(keep.mean())


def merge_doors(base: Image.Image, var: Image.Image, loose: bool = False) -> tuple[Image.Image, list, float]:
    """Doors: the open doorway is nearly as dark as the closed wood, so a pixel diff only finds
    patches. Find each changed DOOR as a whole (tall blob after a generous close), take its full
    rectangle from the doors-open drawing, and paste that onto the base."""
    import cv2

    b = np.asarray(base.convert('RGB')).astype(np.float32)
    v = np.asarray(var.convert('RGB').resize(base.size, Image.LANCZOS)).astype(np.float32)
    H, W = b.shape[:2]
    d = cv2.GaussianBlur(np.abs(b - v).mean(axis=2), (0, 0), 4)
    m = (d > 10).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((45, 45), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    rects = []
    if loose:
        # doorways with people in them run together into one wide region: split it into vertical
        # bands wherever a column of the change mask thins out (the gaps between people/doors)
        m2 = (d > 10).astype(np.uint8)
        m2 = cv2.morphologyEx(m2, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        col = cv2.GaussianBlur(m2[: int(0.85 * H)].mean(axis=0).astype(np.float32).reshape(1, -1), (0, 0), 6).ravel()
        on = col > 0.22
        x = 0
        while x < W:
            if not on[x]:
                x += 1
                continue
            x0 = x
            while x < W and on[x]:
                x += 1
            if x - x0 >= 0.035 * W:
                ys = np.nonzero(m2[:, x0:x].mean(axis=1) > 0.15)[0]
                if len(ys) and (ys[-1] - ys[0]) > 0.3 * H:
                    rects.append([max(0, x0 - 4), max(0, int(ys[0]) - 6), min(W, x + 4), min(H, int(ys[-1]) + 6)])
        n = 1  # skip the blob pass below
    for c in range(1, n):
        x, y, w, h, a = st[c]
        if loose:  # doorways with people in them: any big changed region that reaches up the wall
            if h < 0.15 * H or a < 0.004 * H * W or y > 0.45 * H:
                continue
        elif h < 0.18 * H or h < 1.1 * w or a < 0.004 * H * W or y > 0.45 * H:  # a door reaches up the wall
            continue
        rects.append([max(0, x - 6), max(0, y - 6), min(W, x + w + 6), min(H, y + h + 6)])
    alpha = np.zeros((H, W), np.float32)
    for x0, y0, x1, y1 in rects:
        alpha[y0:y1, x0:x1] = 1
    alpha = cv2.GaussianBlur(alpha, (0, 0), 3)[..., None]
    out = b * (1 - alpha) + v * alpha
    sx, sy = 1920 / W, 1080 / H
    vl = v.mean(axis=2)

    def hinge(x0: int, y0: int, x1: int, y1: int) -> str:
        # 1) read it from the doors-open drawing: the swung-back panel is the lit strip on the hinge
        #    side, the dark gap is on the latch side
        mid = (x0 + x1) // 2
        left, right = vl[y0:y1, x0:mid].mean(), vl[y0:y1, mid:x1].mean()
        if abs(left - right) > 0.15 * max(left, right, 1):
            return 'l' if left > right else 'r'
        # 2) a fully dark doorway: the doorknob is on the INNER edge in these corridors, so the hinge
        #    is on the OUTER edge
        c = (x0 + x1) / 2
        return 'l' if c < W / 2 else 'r'

    door_list = [[round(x0 * sx), round(y0 * sy), round(x1 * sx), round(y1 * sy), hinge(x0, y0, x1, y1)] for x0, y0, x1, y1 in rects]
    return Image.fromarray(out.clip(0, 255).astype(np.uint8)), door_list, float(alpha.mean())


def door_rects(mask: np.ndarray) -> list:
    """Doors = tall changed blobs in the doors-open edit. Hinge on the side nearer the frame
    centre, so each door swings away from us into its flat."""
    import cv2

    H, W = mask.shape
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    out = []
    for c in range(1, n):
        x, y, w, h, a = st[c]
        if h < 0.18 * H or h < 1.15 * w or a < 0.004 * H * W:
            continue
        sx, sy = 1920 / W, 1080 / H
        hinge = 'r' if x + w / 2 < W / 2 else 'l'
        out.append([round(x * sx), round(y * sy), round((x + w) * sx), round((y + h) * sy), hinge])
    return out


def anim_jobs(plan: list, only: set | None) -> list:
    jobs = []
    for p in plan:
        art = p.get('art') or {}
        if p['mode'] not in ('still', 'talk') or (only and p['id'] not in only):
            continue
        base = OUT / f"{p['id']}_k1.jpg"
        chars = as_list(art.get('chars'))
        for v in art.get('variants') or []:
            jobs.append({'p': p, 'base': base, 'kind': 'variant', 'name': v['name'], 'body': v['prompt'], 'chars': chars,
                         'out': OUT / f"{p['id']}_k1_v{v['name']}.jpg"})
        if art.get('blink'):
            jobs.append({'p': p, 'base': base, 'kind': 'blink', 'name': 'blink', 'body': BLINK_PROMPT, 'chars': [], 'out': OUT / f"{p['id']}_k1_blink.jpg"})
        if art.get('doors'):
            jobs.append({'p': p, 'base': base, 'kind': 'doors', 'name': 'open', 'body': art['doors']['prompt'], 'chars': [],
                         'out': OUT / f"{p['id']}_k1_open.jpg"})
    return jobs


def cmd_anim(only: set | None, workers: int) -> None:
    load_env()
    require_key()
    plan = json.loads(PLAN.read_text())
    jobs = anim_jobs(plan, only)
    raw_dir = ROOT / 'build' / 'anim_raw'
    raw_dir.mkdir(parents=True, exist_ok=True)
    report = []

    def run(j: dict) -> None:
        if STOP.is_set():
            return
        if not j['base'].exists():
            print(f'  ! {j["out"].name}: base frame missing')
            return
        base = Image.open(j['base']).convert('RGB')
        imgs, prompt = edit_request(base, j['chars'], j['body'])
        q = (j['p'].get('art') or {}).get('quality') or 'high'
        h = hashlib.sha1(b''.join(imgs) + prompt.encode() + q.encode()).hexdigest()
        raw = raw_dir / j['out'].name
        if not (raw.exists() and cache_get().get('anim_' + raw.name) == h):
            try:
                try:
                    var = uncanvas(openai_edit(imgs, prompt, 'anim', j['out'].name, quality=q))
                except RuntimeError as e:
                    if 'safety system' not in str(e) and 'moderation' not in str(e):
                        raise
                    var = uncanvas(openai_edit(imgs, SAFE_NOTE + prompt, 'anim', j['out'].name, quality=q))
            except Exception as e:  # noqa: BLE001
                print(f'  ! {j["out"].name}: {str(e)[:200]}', flush=True)
                return
            var.save(raw, quality=95)
            cache_put('anim_' + raw.name, h)
        var = Image.open(raw).convert('RGB')
        row = {'id': j['p']['id'], 'drawing': j['name']}
        if j['kind'] == 'doors':
            merged, rects, frac = merge_doors(base, var, loose=bool(((j['p'].get('art') or {}).get('doors') or {}).get('loose')))
            (OUT / f"{j['p']['id']}_doors.json").write_text(json.dumps(rects))
            row['doors'] = len(rects)
        else:
            merged, mask, frac = merge_variant(base, var, eyes_only=j['kind'] == 'blink')
        merged.save(j['out'], quality=92)
        row['changed'] = round(frac, 4)
        flag = '  <- NO CHANGE' if frac < 0.0003 else '  <- REDRAWN (>55% changed), check' if frac > 0.55 else ''
        print(f'  {j["out"].name}: {frac * 100:.1f}% of the frame changed{" , doors " + str(row.get("doors")) if "doors" in row else ""}{flag}', flush=True)
        report.append(row)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(run, jobs))
    (ROOT / 'build' / 'anim_report.json').write_text(json.dumps(report, indent=1))
    print(f'animation drawings: {len(report)} of {len(jobs)}; spent so far ${spent():.2f} of ${budget():.2f}')


# ---------------------------------------------------------------------------
# peephole: a door viewer's fisheye lens + round vignette, baked into the frame files
# ---------------------------------------------------------------------------
def peephole(img: Image.Image) -> Image.Image:
    import cv2

    a = np.asarray(img.convert('RGB')).astype(np.float32)
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H / 2
    R = 0.62 * H  # radius of the viewer's circle
    dx, dy = (xx - cx) / R, (yy - cy) / R
    r = np.sqrt(dx * dx + dy * dy)
    k = 0.70 + 0.55 * r * r  # magnified centre, squeezed rim
    mx = cx + dx * k * R * 1.12
    my = cy + dy * k * R * 1.12
    out = cv2.remap(a, mx, my, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    # glass: slight softness and darkening toward the rim, black outside the circle
    soft = cv2.GaussianBlur(out, (0, 0), 2.2)
    edge = np.clip((r - 0.72) / 0.28, 0, 1)[..., None]
    out = out * (1 - edge) + soft * edge
    vign = np.clip(1 - (r - 0.80) / 0.2, 0, 1) ** 1.5
    out = out * (vign[..., None] * (1 - 0.35 * edge))
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


def peep_file(name: str) -> str:
    """restyle/<x>.jpg -> restyle/<x>_peep.jpg (made once per source file)."""
    src = OUT / Path(name).name
    dst = OUT / (src.stem + '_peep.jpg')
    if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        peephole(Image.open(src)).save(dst, quality=92)
    return f'restyle/{dst.name}'


# ---------------------------------------------------------------------------
# parallax (optional, local): foreground layer = the person, background = inpainted
# ---------------------------------------------------------------------------
def cmd_parallax() -> None:
    """Parallax layers for shots marked `parallax` (art.ts): the foreground (Mara, her chair)
    is cut out with rembg (local, free) -> <frame>_fg.png; the background gets the hole filled
    (OpenCV inpainting) -> <frame>_bg.jpg, so the two layers can drift at different rates
    without a doubled edge. Skipped when the cut-out is implausible (tiny or most of the frame)."""
    try:
        from rembg import new_session, remove  # type: ignore
    except ImportError:
        print('parallax: `pip install "rembg[cpu]"` into .venv first (free, local). Skipped.')
        return
    import cv2

    sess = new_session('u2net')
    plan = json.loads(PLAN.read_text())
    n = 0
    for p in plan:
        if not (p.get('art') or {}).get('parallax'):
            continue
        for k in p.get('keys', []):
            src = OUT / f"{p['id']}_k{k}.jpg"
            if not src.exists():
                continue
            im = Image.open(src).convert('RGB')
            cut = remove(im, session=sess)
            a = np.asarray(cut.split()[-1]).astype(np.float32) / 255.0
            # hard mask, largest shape only (drops half-transparent ghosts of the background)
            hard = (a > 0.85).astype(np.uint8)
            n_cc, lab, stats, _ = cv2.connectedComponentsWithStats(hard, 8)
            if n_cc <= 1:
                print(f'  {src.name}: no foreground - no parallax')
                continue
            big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
            x0, y0, w0, h0 = stats[big, :4]
            H, W = hard.shape
            cover = stats[big, cv2.CC_STAT_AREA] / float(H * W)
            touches = y0 + h0 >= H - 2 or x0 <= 1 or x0 + w0 >= W - 2
            # only a TRUE foreground layer (an over-the-shoulder body cut by the frame edge): a person
            # in the middle of the set would be split from her own legs/chair when the layers drift
            if not touches or not 0.05 < cover < 0.5:
                print(f'  {src.name}: foreground {cover:.0%}, touches edge {touches} - no parallax')
                continue
            a = np.where(lab == big, a, 0.0).astype(np.float32)
            # soften the matte edge a little, keep the fully opaque core
            a = cv2.GaussianBlur(a, (0, 0), 1.2)
            fg = np.dstack([np.asarray(im), (a * 255).astype(np.uint8)])
            Image.fromarray(fg, 'RGBA').save(OUT / f"{p['id']}_k{k}_fg.png")
            hole = cv2.dilate((a > 0.08).astype(np.uint8) * 255, np.ones((25, 25), np.uint8))
            bg = cv2.inpaint(np.asarray(im)[:, :, ::-1], hole, 9, cv2.INPAINT_TELEA)[:, :, ::-1]
            Image.fromarray(bg).save(OUT / f"{p['id']}_k{k}_bg.jpg", quality=92)
            n += 1
            print(f'  {src.name}: foreground {cover:.0%}')
    print(f'parallax: {n} layered frames')


# ---------------------------------------------------------------------------
# manifest for Remotion
# ---------------------------------------------------------------------------
def cmd_manifest() -> None:
    plan = json.loads(PLAN.read_text())
    by_id = {p['id']: p for p in plan}
    shots: dict = {}

    def frames_of(p: dict) -> list:
        fr = []
        for k in p.get('keys', []):
            f = OUT / f"{p['id']}_k{k}.jpg"
            if not f.exists():
                return []
            e = {'src': f'restyle/{f.name}'}
            bg = OUT / f"{p['id']}_k{k}_bg.jpg"
            t = OUT / f"{p['id']}_k{k}_talk.jpg"
            if p.get('mouth') and t.exists():
                e['talk'] = f'restyle/{t.name}'
            fg = OUT / f"{p['id']}_k{k}_fg.png"
            if fg.exists() and bg.exists() and not p.get('mouth'):
                e['src'] = f'restyle/{bg.name}'  # hole filled behind the foreground
                e['fg'] = f'restyle/{fg.name}'
            fr.append(e)
        return fr

    def extras(p: dict) -> dict:
        art = p.get('art') or {}
        e: dict = {}
        vs = {}
        for v in art.get('variants') or []:
            f = OUT / f"{p['id']}_k1_v{v['name']}.jpg"
            if f.exists():
                vs[v['name']] = f'restyle/{f.name}'
        if vs:
            e['variants'] = vs
        b = OUT / f"{p['id']}_k1_blink.jpg"
        if art.get('blink') and b.exists():
            e['blink'] = f'restyle/{b.name}'
        o, r = OUT / f"{p['id']}_k1_open.jpg", OUT / f"{p['id']}_doors.json"
        if art.get('doors') and o.exists() and r.exists():
            e['doors'] = {'open': f'restyle/{o.name}', 'rects': json.loads(r.read_text())}
        if art.get('peephole'):
            for fr in e.get('variants', {}):
                e['variants'][fr] = peep_file(e['variants'][fr])
            if 'blink' in e:
                e['blink'] = peep_file(e['blink'])
        return e

    def peep(p: dict, fr: list) -> list:
        if not (p.get('art') or {}).get('peephole'):
            return fr
        return [{**x, 'src': peep_file(x['src']), **({'talk': peep_file(x['talk'])} if x.get('talk') else {})} for x in fr]

    for p in plan:
        if p['mode'] in ('still', 'action', 'talk'):
            fr = frames_of(p)
            if fr:
                shots[p['id']] = {'frames': peep(p, fr), **extras(p)}
    for p in plan:
        if p['mode'] == 'reuse':
            src = by_id.get(p['art']['reuse'])
            fr = frames_of(src) if src else []
            if fr:
                k = p['art'].get('key')
                if k is not None and k < len(fr):
                    fr = [fr[k]]
                elif len(fr) > 1 and k is None:
                    fr = [fr[len(fr) // 2]]
                shots[p['id']] = {'frames': peep(src, fr), **extras(src)}
    MANIFEST.write_text(json.dumps({'shots': shots}, indent=1))
    want = sum(1 for p in plan if p['mode'] in ('still', 'action', 'talk', 'reuse'))
    print(f'manifest: {len(shots)} of {want} art shots have frames -> {MANIFEST.relative_to(ROOT)}')


def cmd_cost() -> None:
    rows = [json.loads(x) for x in LEDGER.read_text().splitlines()] if LEDGER.exists() else []
    from collections import defaultdict

    by = defaultdict(lambda: [0, 0.0])
    for r in rows:
        by[r['kind']][0] += 1
        by[r['kind']][1] += r['usd']
    for k, (n, usd) in sorted(by.items()):
        print(f'  {k:<9} {n:4d} images  ${usd:7.2f}  (${usd / max(1, n):.3f} each)')
    print(f'  total     {len(rows):4d} images  ${spent():7.2f} of ${budget():.2f} budget')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['lookdev', 'plan', 'pictures', 'gen', 'anim', 'mouths', 'parallax', 'manifest', 'cost'])
    ap.add_argument('--only')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--workers', type=int, default=4)
    a = ap.parse_args()
    only = set(a.only.split(',')) if a.only else None
    {
        'lookdev': lambda: cmd_lookdev(only),
        'plan': cmd_plan,
        'pictures': lambda: cmd_pictures(only),
        'gen': lambda: cmd_gen(only, a.limit, a.workers),
        'anim': lambda: cmd_anim(only, a.workers),
        'mouths': lambda: cmd_mouths(only),
        'parallax': cmd_parallax,
        'manifest': cmd_manifest,
        'cost': cmd_cost,
    }[a.cmd]()
    return 0


if __name__ == '__main__':
    sys.exit(main())
