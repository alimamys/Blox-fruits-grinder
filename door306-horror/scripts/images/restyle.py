#!/usr/bin/env python3
"""Final art for "Never Open Your Door at 3:06 AM" (door306) from the image model (gpt-image-2 edits, quality high).

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
SARAH_SPEC = (
    'Sarah: a 28-year-old woman, slim, average height, pale skin with light freckles across her nose and cheeks, a soft heart-shaped face, '
    'large expressive green-grey eyes, straight AUBURN (copper red-brown) hair just below the shoulders, worn loose with a side parting; '
    'a faded SAGE-GREEN long-sleeved pyjama top with small white buttons, loose light-GREY sweatpants, BAREFOOT, no jewellery.'
)
HARRIS_SPEC = (
    'Mr. Harris: a 76-year-old man, thin and slightly stooped, pale wrinkled skin, a narrow kind face, watery pale-blue eyes, short white hair '
    'thinning on top, short white stubble; a long BROWN knitted cardigan over a white vest and grey striped pyjama trousers, brown slippers, '
    'thin wire reading glasses hanging on a cord around his neck.'
)
MOTHER_SPEC = (
    'The mother: an EAST ASIAN woman of about 40 - she must look NOTHING like Sarah: a round face with high cheekbones, narrow dark '
    'eyes, a small nose, NO freckles, straight jet-BLACK hair cut in a short chin-length BOB with blunt straight BANGS; a long PALE-BLUE '
    'nightgown under a grey cardigan, barefoot. THE BOY, her son: about 6 years old, East Asian, round cheeks, a black BOWL-CUT, big '
    'frightened dark eyes, DARK-BLUE pyjamas with small yellow stars, barefoot. She always holds him close against her chest.'
)
RESIDENTS_SPEC = (
    'The other residents of the fourth floor - always the SAME five people: (1) THE OLD MAN, about 85, bald with age spots, frail and trembling, '
    'grey striped pyjamas, one hand pressed flat against the wall to stay standing; (2) a heavy-set man in his 50s with light skin and a grey '
    'moustache, in a NAVY-BLUE bathrobe; (3) a man of about 30 with dark-brown skin and a short black beard, white T-shirt and red plaid '
    'pyjama trousers; (4) a woman of about 30 with light-brown skin and curly black hair, wrapped in a CREAM knitted blanket; (5) a woman in '
    'her 60s with short grey hair, a LILAC dressing gown over a white nightgown.'
)
LANDLORD_SPEC = (
    'The landlord: a man of about 55, broad and soft, a round clean-shaven friendly face with ruddy cheeks, thinning sandy-grey hair combed '
    'neatly to the side, small pale eyes; a GREY knitted SWEATER VEST over a light-blue shirt with the sleeves rolled up, brown trousers, '
    'a gold wedding ring. His smile is warm but never reaches his eyes.'
)
CREATURE_SPEC = (
    'The creature: nearly SEVEN FEET tall, an emaciated human-like body with GREY, waxy skin stretched tightly over its bones (ribs, knobbly '
    'joints), smooth and sexless like a mannequin, partly lost in shadow; extremely long thin arms that hang down to its shins; hands with five '
    'impossibly long, thin grey fingers; its head is bent forward and to one side at an impossible angle, as if its neck were broken; sparse '
    'lank dark hair; small sunken pale eyes; its jaw hangs open FAR too wide - a dark, hollow, toothless mouth. It moves hunched, its '
    'shoulders scraping the walls. It drags a large, coarse BURLAP SACK, grimy and darkly stained, tied at the neck with rope.'
)
CHAR_NOTE = {
    'sarah': 'Sarah must match her character sheet EXACTLY: same pale freckled face and green-grey eyes, the loose AUBURN hair with a side parting, '
             'the faded SAGE-GREEN pyjama top with white buttons, light-grey sweatpants, barefoot.',
    'harris': 'Mr. Harris must match his sheet EXACTLY: the thin stooped old man with white stubble, long BROWN cardigan over a white vest, '
              'striped pyjama trousers, slippers, reading glasses on a cord.',
    'mother': 'The mother and her little boy must match their sheet EXACTLY: the East Asian woman with the short black bob and straight '
              'bangs, pale-blue nightgown and grey cardigan; the boy with the black bowl-cut in dark-blue pyjamas with yellow stars; she '
              'holds him against her chest. She looks nothing like Sarah.',
    'residents': 'The other residents must be EXACTLY the five people of the residents sheet (the bald old man in grey pyjamas, the moustached '
                 'man in the navy bathrobe, the bearded man in the white T-shirt, the curly-haired woman in the cream blanket, the grey-haired '
                 'woman in the lilac dressing gown) - no other people.',
    'landlord': 'The landlord must match his sheet EXACTLY: round ruddy friendly face, thinning sandy-grey hair combed to the side, grey '
                'sweater vest over a light-blue shirt with rolled sleeves, wedding ring.',
    'creature': 'The creature must match its design sheet EXACTLY: nearly seven feet tall, grey skin tight over bone, head bent at an '
                'impossible angle, arms hanging to its shins, impossibly long fingers, jaw hanging open far too wide; never cute, never '
                'cartoonish, never gory.',
}
LOC_NOTE = {
    'hallway': 'The fourth-floor corridor of an old 1960s apartment building: long and narrow, a worn MOSS-GREEN carpet runner, yellowed cream '
               'walls with a dark-brown wooden dado rail, dark-brown wooden apartment doors on both sides (three on each side) each with a '
               'small brass peephole and a brass knob, flat FLUORESCENT TUBE fixtures on the ceiling; at the FAR end the opening to the '
               'STAIRWELL with a black metal railing going down; behind the camera a tall window.',
    'hallway_cross': 'The SAME fourth-floor corridor seen straight across from Sarah\'s front door: directly opposite is Mr. Harris\'s door; the '
                     'stairwell opening with the black metal railing is at the LEFT end of the corridor, the tall window at the RIGHT end; '
                     'moss-green carpet runner, cream walls, dark-brown doors, fluorescent tubes.',
    'flat': 'Sarah\'s small one-bedroom flat: the dark-wood front door (brass peephole, a brass security chain and a deadbolt) opens into a small '
            'living room: an old MUSTARD-YELLOW two-seat sofa, a small round wooden dining table with two chairs, a floor lamp, a window with '
            'half-open blinds through which orange streetlight falls in stripes, a short narrow corridor to the bedroom door, old wooden '
            'floorboards with a faded rug.',
    'bedroom': 'Sarah\'s small bedroom: a single bed with a rumpled white duvet, a nightstand with her phone, a window with blinds striped by '
               'orange streetlight, a wardrobe; the bedroom door opens onto the short corridor to the living room.',
    'stairwell': 'The building\'s stairwell: grey concrete steps in a switchback, a black metal railing, scuffed pale-green painted walls, a '
                 'caged bulb on each landing; seen from the fourth floor looking down to the third-floor landing.',
    'exterior': 'An old four-storey red-brick apartment building on a quiet residential street with bare trees, a small entrance with a glass '
                'door and three steps, rows of tall windows.',
    'lobby': 'The small ground-floor lobby: a wall of old brass mailboxes with small blank name-card holders, a chipped black-and-white tiled '
             'floor, the bottom of the staircase, the glass entrance door.',
    'office': 'The landlord\'s small cluttered office: a heavy wooden desk with a green-shaded banker\'s lamp, an old leather-bound notebook, '
              'a laptop, an old beige desk phone, a filing cabinet, a window with daylight through dusty blinds.',
}

SHEET_TAIL = (' Natural adult proportions, five fingers on each hand, clear readable silhouette, soft even studio light so every detail '
              'of face, hair and clothes is visible. No text, no labels, no captions.')
LOC_TAIL = ' Wide establishing view, no people at all, no text or numbers anywhere (door plates and labels are blank).'

LOOKDEV = {
    'sarah_turnaround': {
        'out': SHEETS / 'sarah_turnaround.png', 'refs': [],
        'prompt': (f'Character model sheet for an animated horror film, in exactly the style of the style reference image. {SARAH_SPEC} '
                   'Show her full body three times side by side on a plain light-grey background, same scale, standing in a neutral pose: '
                   'FRONT view, THREE-QUARTER view, SIDE (profile) view.' + SHEET_TAIL),
    },
    'sarah_expressions': {
        'out': SHEETS / 'sarah_expressions.png', 'refs': ['sheet:sarah_turnaround'],
        'prompt': ('Expression sheet for the SAME woman as in the character sheet image (identical freckled face, loose auburn hair with a side '
                   'parting, sage-green pyjama top), in exactly the style of the style reference. Five head-and-shoulders portraits in a row on '
                   'a plain dark-grey background, each lit by a strong key light on the face with deep shadow around it: 1 NEUTRAL, 2 UNEASY, '
                   '3 TERRIFIED (eyes very wide, brows pulled up, mouth tense), 4 SCREAMING, 5 CRYING (tears, trembling lip). Very expressive '
                   'eyes, readable on a phone screen. No text, no labels.'),
    },
    'harris': {
        'out': SHEETS / 'harris.png', 'refs': [],
        'prompt': (f'Character model sheet for an animated horror film, in exactly the style of the style reference image. {HARRIS_SPEC} '
                   'On a plain light-grey background: his full body in FRONT, THREE-QUARTER and SIDE view at the same scale, and next to them '
                   'three head-and-shoulders portraits: AFRAID (pale, eyes wide), a trembling finger raised to his lips (SHUSHING), CRYING '
                   '(tears streaming down his cheeks).' + SHEET_TAIL),
    },
    'mother_boy': {
        'out': SHEETS / 'mother_boy.png', 'refs': [],
        'prompt': (f'Character model sheet for an animated horror film, in exactly the style of the style reference image. {MOTHER_SPEC} '
                   'On a plain light-grey background: (1) the mother standing in FRONT view holding the boy against her chest, (2) the same in '
                   'THREE-QUARTER view, (3) the boy alone standing in front view, (4) a close-up of the mother pressing her hand gently over '
                   'the crying boy\'s mouth while she looks away, frightened.' + SHEET_TAIL),
    },
    'residents': {
        'out': SHEETS / 'residents.png', 'refs': [],
        'prompt': (f'Character line-up sheet for an animated horror film, in exactly the style of the style reference image. {RESIDENTS_SPEC} '
                   'Show the five residents standing side by side in FRONT view on a plain light-grey background, same scale, each one '
                   'clearly different, all with tense frightened faces.' + SHEET_TAIL),
    },
    'landlord': {
        'out': SHEETS / 'landlord.png', 'refs': [],
        'prompt': (f'Character model sheet for an animated horror film, in exactly the style of the style reference image. {LANDLORD_SPEC} '
                   'On a plain light-grey background: his full body in FRONT, THREE-QUARTER and SIDE view at the same scale, and two '
                   'head-and-shoulders portraits: a warm FRIENDLY SMILE, and the same smile widening while his eyes stay cold.' + SHEET_TAIL),
    },
    'creature': {
        'out': SHEETS / 'creature.png', 'refs': [],
        'prompt': (f'Creature design sheet for an animated horror film, in exactly the style of the style reference image. {CREATURE_SPEC} '
                   'On a plain mid-grey background show: (1) front view, full body, with a door frame beside it that only reaches its shoulders; '
                   '(2) side view, hunched, dragging the sack; (3) three-quarter view, head bent hard to one side, jaw hanging open; '
                   '(4) a close-up of its long grey fingers curling around a black metal stair railing. Frightening but not gory: no blood, '
                   'no wounds. No text, no labels.'),
    },
    'loc_hallway': {'out': LOCS / 'hallway.png', 'refs': [], 'loc': 'hallway', 'prompt': (
        'Location reference: ' + LOC_NOTE['hallway'] + ' One-point perspective from the window end, looking down the corridor to the stairwell at '
        'the far end. Night: sickly yellow-green fluorescent light, cold blue shadows, the stairwell opening black.' + LOC_TAIL)},
    'loc_hallway_cross': {'out': LOCS / 'hallway_cross.png', 'refs': ['loc:hallway'], 'loc': 'hallway_cross', 'prompt': (
        'Location reference of the SAME corridor as the hallway location reference (same carpet, walls, doors, lights): ' + LOC_NOTE['hallway_cross']
        + ' The camera stands just inside Sarah\'s doorway at eye height, looking straight across the corridor at Mr. Harris\'s closed door. '
        'Night: sickly yellow-green fluorescent light, cold blue shadows.' + LOC_TAIL)},
    'loc_flat': {'out': LOCS / 'flat.png', 'refs': [], 'loc': 'flat', 'prompt': (
        'Location reference: ' + LOC_NOTE['flat'] + ' Seen from the living room towards the front door on the back wall, the corridor to the '
        'bedroom on the right. Night, lights off: dark blue shadows, orange streetlight stripes through the blinds, a thin line of '
        'yellow-green corridor light under the front door.' + LOC_TAIL)},
    'loc_bedroom': {'out': LOCS / 'bedroom.png', 'refs': ['loc:flat'], 'loc': 'bedroom', 'prompt': (
        'Location reference in the SAME flat as the flat location reference: ' + LOC_NOTE['bedroom'] + ' Night, dark blue, orange stripes of '
        'streetlight on the bed.' + LOC_TAIL)},
    'loc_stairwell': {'out': LOCS / 'stairwell.png', 'refs': ['loc:hallway'], 'loc': 'stairwell', 'prompt': (
        'Location reference of the stairwell at the end of the corridor in the hallway location reference (same black railing): '
        + LOC_NOTE['stairwell'] + ' Night: one dim flickering caged bulb, the lower flights fading into black.' + LOC_TAIL)},
    'loc_exterior': {'out': LOCS / 'exterior.png', 'refs': [], 'loc': 'exterior', 'prompt': (
        'Location reference: ' + LOC_NOTE['exterior'] + ' Night, about 3 am: deep blue, one sodium streetlight, every window dark except a '
        'faint yellow-green glow in the fourth-floor stairwell window.' + LOC_TAIL)},
    'loc_lobby': {'out': LOCS / 'lobby.png', 'refs': [], 'loc': 'lobby', 'prompt': (
        'Location reference: ' + LOC_NOTE['lobby'] + ' Morning: clean pale sunlight through the glass door.' + LOC_TAIL)},
    'loc_office': {'out': LOCS / 'office.png', 'refs': [], 'loc': 'office', 'prompt': (
        'Location reference: ' + LOC_NOTE['office'] + ' Morning: warm daylight through the blinds, the desk lamp on.' + LOC_TAIL)},
}

SAFE_NOTE = (
    'Context: one frame of an animated horror story for a general audience, like a TV horror cartoon - suspense and dread in an old '
    'apartment building at night; nothing gory or graphic, no blood, no wounds, no weapons. '
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
    return float(os.environ.get('IMAGE_BUDGET_USD', 40))  # approved cap for this film


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
    'sarah': ('sarah_board', "SARAH'S CHARACTER SHEET (turnaround and expressions)"),
    'harris': ('harris', "MR. HARRIS'S CHARACTER SHEET"),
    'mother': ('mother_boy', "THE MOTHER AND BOY'S CHARACTER SHEET"),
    'residents': ('residents', "THE RESIDENTS' LINE-UP SHEET"),
    'landlord': ('landlord', "THE LANDLORD'S CHARACTER SHEET"),
    'creature': ('creature', "THE CREATURE'S DESIGN SHEET"),
}


def sarah_board() -> Path:
    """One reference image for Sarah: the turnaround above the expressions."""
    out = SHEETS / 'sarah_board.jpg'
    a, b = SHEETS / 'sarah_turnaround.png', SHEETS / 'sarah_expressions.png'
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
        if stem == 'sarah_board':
            return sarah_board(), label
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
    sarah_board()


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
    return (f'{nobody}Draw one frame of the animated horror film "Never Open Your Door at 3:06 AM". FRAME: {art.get("prompt", "")}{keytxt}{talk}{chain} '
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
    alpha = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 7)[..., None]
    out = b * (1 - alpha) + v * alpha
    return Image.fromarray(out.clip(0, 255).astype(np.uint8)), keep, float(keep.mean())


def merge_doors(base: Image.Image, var: Image.Image) -> tuple[Image.Image, list, float]:
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
    for c in range(1, n):
        x, y, w, h, a = st[c]
        if h < 0.18 * H or h < 1.1 * w or a < 0.004 * H * W or y > 0.45 * H:  # a door reaches up the wall
            continue
        rects.append([max(0, x - 6), max(0, y - 6), min(W, x + w + 6), min(H, y + h + 6)])
    alpha = np.zeros((H, W), np.float32)
    for x0, y0, x1, y1 in rects:
        alpha[y0:y1, x0:x1] = 1
    alpha = cv2.GaussianBlur(alpha, (0, 0), 3)[..., None]
    out = b * (1 - alpha) + v * alpha
    sx, sy = 1920 / W, 1080 / H
    door_list = [[round(x0 * sx), round(y0 * sy), round(x1 * sx), round(y1 * sy), 'r' if (x0 + x1) / 2 < W / 2 else 'l'] for x0, y0, x1, y1 in rects]
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
            merged, rects, frac = merge_doors(base, var)
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
