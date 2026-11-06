#!/usr/bin/env python3
"""Final art for "Frame 240" from the image model (gpt-image-2 edits, quality high).

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
MARA_SPEC = (
    'Mara: a 32-year-old woman, slim, average height, light olive skin, oval face, large expressive dark-brown eyes, '
    'thick dark eyebrows, faint tired shadows under her eyes; dark-brown shoulder-length hair pulled up into a MESSY LOW BUN '
    'with loose strands framing her face and a YELLOW PENCIL stuck through the bun (always visible); an OVERSIZED '
    'BURNT-ORANGE crew-neck sweatshirt with the sleeves pushed up to her forearms, charcoal-grey sweatpants, thick grey '
    'wool socks, no shoes, no jewellery.'
)
FIGURE_SPEC = (
    'The figure ("the man"): impossibly tall and thin - his head is above the top of a door frame - with long arms that '
    'hang straight down past his knees, narrow sloped shoulders, his head tilted forward and bent unnaturally to one side. '
    'His face is ALWAYS hidden in shadow: no eyes, no features. He looks painted rather than solid: a smoky charcoal '
    'silhouette in a shapeless dark garment, soft brush edges, no clothing details. Later he is painted over in flat '
    'white and is visible only as faint outlines and tiny cast shadows.'
)
CHAR_NOTE = {
    'mara': 'Mara must match her character sheet EXACTLY: same face, same dark-brown messy low bun with the yellow pencil through it, '
            'the oversized burnt-orange sweatshirt with pushed-up sleeves, charcoal sweatpants, grey socks.',
    'figure': 'The tall man must match his sheet: impossibly tall and thin, head bent to one side, arms hanging straight down, '
              'face always hidden in shadow, painted brush texture - never a detailed or realistic person, never a face.',
}
LOC_NOTE = {
    'workroom': 'Mara\'s cramped workroom (living-room corner): desk with a big monitor and pen tablet under a rainy window, office chair, '
                'the open doorway to the hallway behind the chair.',
    'hallway': 'Mara\'s narrow apartment hallway in one-point perspective: old beige carpet runner with a brown stain, white walls with faint '
               'wallpaper texture, one dome ceiling light with a brown water stain beside it, a hairline crack above the closed bedroom '
               'door at the far end, the front door on the left wall, the closet door on the right wall.',
    'closet': 'The tiny storage closet: white walls, shelves with cardboard boxes, coats on hooks, a vacuum cleaner, a white door with a thin '
              'line of light under it.',
    'white': 'The same apartment drained into an unfinished drawing: flat white surfaces, no textures, almost no shadows, only faint thin outlines.',
    'exterior': 'The modest apartment block where Mara lives, at night in the rain.',
}

LOOKDEV = {
    'mara_turnaround': {
        'out': SHEETS / 'mara_turnaround.png',
        'refs': [],
        'prompt': (
            f'Character model sheet for an animated film, in exactly the style of the style reference image. {MARA_SPEC} '
            'Show her full body three times side by side on a plain light-grey background, same scale, standing in a neutral pose: '
            'FRONT view, THREE-QUARTER view, SIDE (profile) view. Natural adult proportions, five fingers on each hand, clear readable '
            'silhouette, soft even studio light so every detail of face, hair, pencil and clothes is visible. No text, no labels, no captions.'
        ),
    },
    'mara_expressions': {
        'out': SHEETS / 'mara_expressions.png',
        'refs': ['sheet:mara_turnaround'],
        'prompt': (
            'Expression sheet for the SAME woman as in the character sheet image (identical face, hair bun with the yellow pencil, '
            'burnt-orange sweatshirt), in exactly the style of the style reference. Five head-and-shoulders portraits in a row on a '
            'plain dark-grey background, each lit by a strong key light on the face with deep shadow around it: 1 NEUTRAL, 2 UNEASY, '
            '3 TERRIFIED (eyes very wide, brows pulled up, mouth tense), 4 SCREAMING, 5 CRYING (tears, trembling lip). Very expressive '
            'eyes, readable on a phone screen. No text, no labels.'
        ),
    },
    'figure': {
        'out': SHEETS / 'figure.png',
        'refs': [],
        'prompt': (
            f'Creature design sheet for an animated horror film, in exactly the style of the style reference image. {FIGURE_SPEC} '
            'On a plain mid-grey background show: (1) front view, full body, standing in a doorway that only reaches his shoulders; '
            '(2) side view; (3) three-quarter view with the head bent hard to one side; (4) the same figure painted flat white against a '
            'white wall - only faint outlines and a thin shadow give it away; (5) a close-up of long thin white fingers pushing out '
            'through a white paper-like surface. Faceless in every view. No text, no labels.'
        ),
    },
    'loc_workroom': {'out': LOCS / 'workroom.png', 'refs': ['ref:loc_workroom'], 'loc': 'workroom', 'prompt': 'Location reference, empty of people: ' + LOC_NOTE['workroom'] + ' Night: cold blue moonlight through the rainy window against the cool glow of the monitor; deep shadows; the doorway to the hallway black.'},
    'loc_hallway': {'out': LOCS / 'hallway.png', 'refs': ['ref:loc_hallway'], 'loc': 'hallway', 'prompt': 'Location reference, empty of people: ' + LOC_NOTE['hallway'] + ' Night, the ceiling light off: cold blue moonlight, deep shadows.'},
    'loc_closet': {'out': LOCS / 'closet.png', 'refs': ['ref:loc_closet'], 'loc': 'closet', 'prompt': 'Location reference, empty of people: ' + LOC_NOTE['closet'] + ' Dark; a cold phone light in the middle lights the white walls softly.'},
    'loc_white': {'out': LOCS / 'white.png', 'refs': ['ref:loc_white', 'loc:hallway'], 'loc': 'white', 'prompt': 'Location reference, empty of people: the SAME hallway as the hallway reference image, but drained into an unfinished drawing: flat white walls, floor and ceiling, no textures, no stains, almost no shadows - only faint thin pencil-like outlines of the doors, the carpet runner and the ceiling light.'},
    'loc_exterior': {'out': LOCS / 'exterior.png', 'refs': ['ref:loc_exterior'], 'loc': 'exterior', 'prompt': 'Location reference: ' + LOC_NOTE['exterior'] + ' A modest four-storey building, most windows dark, one third-floor window glowing with monitor light, heavy rain, wet street.'},
}

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
    return float(os.environ.get('IMAGE_BUDGET_USD', 50))


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


def openai_edit(images: list[bytes], prompt: str, kind: str, out_name: str) -> Image.Image:
    """POST /v1/images/edits with one or more input images (image[] fields)."""
    key = os.environ['OPENAI_API_KEY']
    if STOP.is_set():
        raise RuntimeError('stopped')
    if spent() >= budget():
        STOP.set()
        raise RuntimeError(f'budget reached (${spent():.2f} of ${budget():.2f}) - stopping')
    model = os.environ.get('IMAGE_MODEL', 'gpt-image-2')
    fields = [('model', model), ('prompt', prompt), ('size', '1536x1024'), ('quality', os.environ.get('IMAGE_QUALITY', 'high')), ('n', '1')]
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
def mara_board() -> Path:
    """One reference image for Mara: the turnaround above the expressions."""
    out = SHEETS / 'mara_board.jpg'
    a, b = SHEETS / 'mara_turnaround.png', SHEETS / 'mara_expressions.png'
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
        if name == 'mara':
            return mara_board(), 'MARA\'S CHARACTER SHEET (turnaround and expressions)'
        return SHEETS / 'figure.png', 'THE TALL MAN\'S DESIGN SHEET'
    if kind == 'loc':
        return LOCS / f'{name}.png', f'the LOCATION REFERENCE for {name}'
    if kind == 'ref':
        return REFS / f'{name}.png', 'the LAYOUT GUIDE'
    if kind == 'pic':
        return PICS / f'{name}.jpg', 'the EXISTING FRAME to edit'
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
    names.append(f'the STYLE REFERENCE - draw in exactly this style: {STYLE_TEXT}. Its people and setting are unrelated to this film: take ONLY the drawing style from it')
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
    order = ['mara_turnaround', 'mara_expressions', 'figure', 'loc_hallway', 'loc_workroom', 'loc_closet', 'loc_exterior', 'loc_white']
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
    mara_board()


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
    talk = ' Her mouth is CLOSED in this frame.' if p['mode'] == 'talk' else ''
    return (f'Draw one frame of the animated horror film "Frame 240". FRAME: {art.get("prompt", "")}{keytxt}{talk} '
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
            imgs, prompt = build_request(j['src'], j['p']['refs'], shot_prompt(j['p'], j['k']))
        h = hashlib.sha1(b''.join(imgs) + prompt.encode()).hexdigest()
        if j['out'].exists() and cache_get().get(j['out'].name) == h:
            state['cached'] += 1
            return
        try:
            img = uncanvas(openai_edit(imgs, prompt, 'frame', j['out'].name))
        except Exception as e:  # noqa: BLE001
            state['failed'] += 1
            print(f'  ! {j["out"].name}: {str(e)[:200]}', flush=True)
            return
        img.save(j['out'], 'JPEG', quality=92)
        cache_put(j['out'].name, h)
        state['done'] += 1

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(run, jobs))
    print(f'frames: generated {state["done"]}, cached {state["cached"]}, failed {state["failed"]}; spent so far ${spent():.2f} of ${budget():.2f}')


# ---------------------------------------------------------------------------
# mouth-open variants (lip sync): only the mouth region is taken from the variant
# ---------------------------------------------------------------------------
MOUTH_PROMPT = (
    'Edit this image: Mara is talking (whispering). Change ONLY her mouth: open it slightly, mid-word, a small natural opening with '
    'the teeth barely visible. Do not change anything else at all - same face, eyes, expression, hair, pencil, clothes, hands, '
    'background, framing, light and colours, pixel for pixel.'
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


def merge_mouth(base: Image.Image, var: Image.Image, win: tuple[int, int, int, int]) -> tuple[Image.Image, float]:
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
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
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
        merged, area = merge_mouth(base, Image.open(raw), mouth_window(p['id'], (base.height, base.width)))
        merged.save(out, quality=92)
        report.append({'id': p['id'], 'changed_px': area})
        print(f'  {p["id"]}: mouth region {area:.0f} px' + ('  <- NO CHANGE, check' if area < 200 else ''))
    (ROOT / 'build' / 'mouths.json').write_text(json.dumps(report, indent=1))


# ---------------------------------------------------------------------------
# parallax (optional, local): foreground layer = the person, background = inpainted
# ---------------------------------------------------------------------------
def cmd_parallax() -> None:
    try:
        from rembg import remove  # type: ignore
    except ImportError:
        print('parallax: `pip install rembg onnxruntime` into .venv first (free, local). Skipped.')
        return
    plan = json.loads(PLAN.read_text())
    n = 0
    for p in plan:
        if not (p.get('art') or {}).get('parallax'):
            continue
        for k in p.get('keys', []):
            src = OUT / f"{p['id']}_k{k}.jpg"
            if not src.exists():
                continue
            fg = remove(Image.open(src).convert('RGB'))
            fg.save(OUT / f"{p['id']}_k{k}_fg.png")
            n += 1
    print(f'parallax: {n} foreground layers')


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
            t = OUT / f"{p['id']}_k{k}_talk.jpg"
            if p.get('mouth') and t.exists():
                e['talk'] = f'restyle/{t.name}'
            fg = OUT / f"{p['id']}_k{k}_fg.png"
            if fg.exists():
                e['fg'] = f'restyle/{fg.name}'
            fr.append(e)
        return fr

    for p in plan:
        if p['mode'] in ('still', 'action', 'talk'):
            fr = frames_of(p)
            if fr:
                shots[p['id']] = {'frames': fr}
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
                shots[p['id']] = {'frames': fr}
    MANIFEST.write_text(json.dumps({'shots': shots}, indent=1))
    write_pic_manifest()
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
    ap.add_argument('cmd', choices=['lookdev', 'plan', 'pictures', 'gen', 'mouths', 'parallax', 'manifest', 'cost'])
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
        'mouths': lambda: cmd_mouths(only),
        'parallax': cmd_parallax,
        'manifest': cmd_manifest,
        'cost': cmd_cost,
    }[a.cmd]()
    return 0


if __name__ == '__main__':
    sys.exit(main())
