#!/usr/bin/env python3
"""Redraw every illustrated shot of the video with an image model, keeping the
stick-figure style, composition and poses - only the rendering quality goes up.

    .venv/bin/python scripts/images/restyle.py plan        # classify shots -> build/restyle_plan.json
    .venv/bin/python scripts/images/restyle.py gen [--only ids] [--limit N] [--workers 6]
    .venv/bin/python scripts/images/restyle.py manifest    # -> src/data/generated/restyle.json

Inputs: build/shotmap.json (scripts/images/shotmap.mjs) and build/keyframes/*.png
(scripts/images/keyframes.mjs - clean renders of each shot at 20/50/80%).
Text-heavy screens (manifest, phone, radio, documents...) and black frames are left
to the code renderer: image models garble small text. Shots that change a lot inside
get all three keyframes; shots where a visible character speaks also get a
"mouth open" variant that Remotion swaps in time with the voice.

Provider: OpenAI gpt-image (OPENAI_API_KEY, IMAGE_MODEL default gpt-image-2,
IMAGE_QUALITY default high). Output: public/restyle/*.jpg (cached - nothing is
generated twice for the same source frame and prompt).
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
SHOTMAP = ROOT / 'build' / 'shotmap.json'
KEYS = ROOT / 'build' / 'keyframes'
PLAN = ROOT / 'build' / 'restyle_plan.json'
OUT = ROOT / 'public' / 'restyle'
CACHE = OUT / '.cache.json'
MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'restyle.json'
PLATE_SRC = ROOT / 'build' / 'plates'
PLATE_OUT = ROOT / 'public' / 'plates'
PLATE_RAW = ROOT / 'build' / 'plates_raw'
# Where the animated characters touch the set (sit, stand, walk), in plate pixels (1920x1080).
# The redraw is registered to the code-drawn plate inside this box, so a seat or bench in the
# redraw lands exactly where the animated figure sits on it. None = the whole frame.
PLATE_ROI = {
    'cabinrow': (520, 600, 1400, 900),
    'deck_front_dark': (640, 640, 1280, 920),
    'deck_behind_woman': (640, 560, 1280, 900),
    'deck_behind_empty': (160, 560, 1760, 960),
    'deck_behind_red': (160, 560, 1760, 960),
}
PLATE_SHOTS = ROOT / 'build' / 'plate_shots.json'
PLATE_MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'plates.json'
PLATE_NOTE = (
    ' This is a background set for an animated shot: keep it exactly as shown - do not add any people; '
    'keep any seated passengers or seated figures that are already there exactly as they are.'
)
SCENE_FILES = {
    'hook': 'Hook', 'departure': 'Departure', 'recognition': 'Recognition', 'erasure': 'Erasure', 'hull': 'Hull',
    'navigation': 'Navigation', 'otherFerry': 'OtherFerry', 'grandmotherCalls': 'GrandmotherCalls',
    'peopleInWater': 'GrandmotherCalls', 'vanish': 'Vanish', 'police': 'Police', 'cctv': 'Cctv', 'finale': 'Finale', 'end': 'Finale',
}
UI_WORDS = (
    '<Evidence', 'PhoneShot', 'PhoneScreen', 'Clicker', 'PassengerCounter', '<Radio', 'Console', 'TimeCard', 'PassengerManifest',
    'DriverLicense', 'Reservation', 'BoardingPass', 'EmailInbox', 'NavScreen', 'RadarScreen', '<Compass', 'HarborControl',
    'PoliceCaseFile', 'DatabaseSearch', 'CivilRecord', 'MessageThread', 'ImageTransfer', 'PAPanel', 'GateCounter',
    'DeparturesBoard', 'WeatherPanel', 'WeddingRing', 'PhotoAlbum', 'IncomingCall', 'LockScreen', 'BigNumber',
)
WHO = {
    'daniel': 'Daniel (the man in the blue jacket)',
    'emma': 'Emma (the woman in the burgundy top)',
    'oldWoman': 'the old woman in the long black coat',
    'captain': 'the captain in the white captain hat',
    'crew1': 'the young crew member in the navy uniform',
    'crew2': 'the female crew member with the ponytail',
    'harbor': 'the man with glasses holding the phone handset',
    'police': 'the police officer in the yellow vest',
}

RESTYLE_PROMPT = (
    'Redraw this exact frame as a polished, high-quality 2D cartoon illustration in the SAME stick-figure character style: '
    'big round heads, simple dot eyes, small simple mouths, simple rounded bodies and tube-like arms and legs, thick clean dark outlines. '
    'Keep the composition, camera angle and framing, every character\'s position, pose, gaze, expression and clothing colours, '
    'the lighting mood and darkness level, and the whole scene layout exactly the same. '
    'Upgrade only the rendering quality: crisp confident line art, soft cel shading with subtle gradients, cinematic lighting with soft shadows, '
    'richer materials and textures and more depth in the environment, like a premium animated YouTube story. '
    'Do not add or remove any characters or objects. Keep any text exactly as it is. No subtitles, no captions, no watermark.'
)


SAFE_NOTE = (
    'Context: a family-friendly animated cartoon for a mildly spooky ghost story; simple stick-figure characters, '
    'nothing violent or graphic. '
)
CCTV_NOTE = ' This is a security-camera frame: keep the camera text overlays exactly, keep the high fixed camera angle.'


def mouth_prompt(char: str) -> str:
    who = WHO.get(char, 'the person speaking')
    return (
        f'Edit this image: {who} is talking - draw their mouth open mid-word (a small open oval mouth, same style). '
        'Change absolutely nothing else: same pose, same eyes, same everything, same framing, same lighting.'
    )


# ---------------------------------------------------------------------------
# plan
# ---------------------------------------------------------------------------
def shot_blocks(scene_src: str, marker: str, nth: int) -> str:
    """Source text of the nth shot entry cut on `marker` (best effort)."""
    pat = r"at: 0\b" if marker == '0' else r"at: '" + re.escape(marker) + "'"
    hits = [m.start() for m in re.finditer(pat, scene_src)]
    if not hits:
        return ''
    a = hits[min(nth, len(hits) - 1)]
    nxt = re.search(r"\n\t\t\t(\{\s*at:|\{\n\t\t\t\tat:)", scene_src[a + 5:])
    return scene_src[a: a + 5 + (nxt.start() if nxt else 4000)]


def small(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert('L').resize((192, 108))).astype(np.float32) / 255.0


def aligned_diff(a: np.ndarray, b: np.ndarray) -> float:
    """Difference between two frames after undoing a camera zoom/pan (so push-ins
    and drifts don't count as motion)."""
    h, w = a.shape
    best = float(np.mean(np.abs(a - b)))
    img_b = Image.fromarray((b * 255).astype('uint8'))
    for z in np.arange(0.84, 1.17, 0.02):
        zw, zh = int(round(w * z)), int(round(h * z))
        bz = np.asarray(img_b.resize((zw, zh), Image.BILINEAR)).astype(np.float32) / 255.0
        for dx in range(-14, 15, 2):
            for dy in range(-10, 11, 2):
                x0 = (zw - w) // 2 + dx
                y0 = (zh - h) // 2 + dy
                # overlap region
                ax0, ay0 = max(0, -x0), max(0, -y0)
                ax1, ay1 = min(w, zw - x0), min(h, zh - y0)
                if ax1 - ax0 < w * 0.7 or ay1 - ay0 < h * 0.7:
                    continue
                d = float(np.mean(np.abs(a[ay0:ay1, ax0:ax1] - bz[ay0 + y0: ay1 + y0, ax0 + x0: ax1 + x0])))
                best = min(best, d)
    return best


# shots that stay code-rendered: small legal text, the title card, counters that tick in sync with the voice
FORCE_SKIP = {'hook_00', 'hook_01', 'hook_26', 'departure_04', 'hull_25', 'otherFerry_04', 'otherFerry_07'}  # hull_25, otherFerry_04: the redraw invented people; otherFerry_07: it dropped the red evidence circle
# very dark shots that still matter (keep them dark - see DARK_NOTE)
FORCE_INCLUDE = {'finale_17', 'finale_18', 'vanish_03'}
DARK_NOTE = ' This is a very dark night scene: keep it just as dark and dim, only the faint light sources lit.'


def cmd_plan() -> None:
    sm = json.loads(SHOTMAP.read_text())
    timeline_lines = json.loads((ROOT / 'build' / 'timeline_lines.json').read_text())
    srcs = {k: (ROOT / 'src' / 'scenes' / f'{v}.tsx').read_text() for k, v in SCENE_FILES.items()}
    seen: dict[tuple, int] = {}
    animated = set(json.loads(PLATE_SHOTS.read_text())) if PLATE_SHOTS.exists() else set()
    plan = []
    for sh in sm['shots']:
        key = (sh['scene'], sh['marker'])
        nth = seen.get(key, 0)
        seen[key] = nth + 1
        code = shot_blocks(srcs[sh['scene']], sh['marker'], nth)
        k = [KEYS / f"{sh['id']}_k{i}.png" for i in range(3)]
        if not all(p.exists() for p in k):
            plan.append({**sh, 'mode': 'missing'})
            continue
        a, b, c = (small(p) for p in k)
        motion = float(max(aligned_diff(b, a), aligned_diff(b, c)))
        lum = float(np.mean(b))
        ui = [w for w in UI_WORDS if w in code]
        talk = []
        for lid in sorted(set(re.findall(r"(?:speak|talkOf)\(api, sf, '([a-z0-9_]+)'", code))):
            ln = timeline_lines.get(lid)
            if ln and ln['character'] in WHO and ln['from'] < sh['to'] and ln['to'] > sh['from']:
                talk.append({'line': lid, 'character': ln['character']})
        if sh['id'] in animated:
            mode = 'animate'
        elif sh['id'] in FORCE_SKIP:
            mode = 'skip-fixed'
        elif lum < 0.035 and sh['id'] not in FORCE_INCLUDE:
            mode = 'skip-dark'
        elif ui:
            mode = 'skip-ui'
        else:
            mode = 'multi' if motion > 0.035 else 'single'
        cctv = 'CCTVOverlay' in code or 'CabinCam' in code
        dark = lum < 0.05
        plan.append({**sh, 'mode': mode, 'motion': round(motion, 3), 'lum': round(lum, 3), 'ui': ui, 'cctv': cctv, 'dark': dark, 'talk': talk if mode == 'single' else []})
    PLAN.write_text(json.dumps(plan, indent=1))
    from collections import Counter

    cnt = Counter(p['mode'] for p in plan)
    gens = sum(1 if p['mode'] == 'single' else 3 if p['mode'] == 'multi' else 0 for p in plan)
    talks = sum(len({t['character'] for t in p.get('talk', [])}) for p in plan)
    print(f'{len(plan)} shots: {dict(cnt)} -> {gens} restyles + {talks} mouth variants')


# ---------------------------------------------------------------------------
# generation
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


def letterbox(img: Image.Image) -> bytes:
    im = img.convert('RGB').resize((1536, 864), Image.LANCZOS)
    canvas = Image.new('RGB', (1536, 1024), (0, 0, 0))
    canvas.paste(im, (0, 80))
    bio = io.BytesIO()
    canvas.save(bio, 'PNG')
    return bio.getvalue()


def openai_edit(png: bytes, prompt: str) -> Image.Image:
    key = os.environ['OPENAI_API_KEY']
    model = os.environ.get('IMAGE_MODEL', 'gpt-image-2')
    boundary = '----p63' + hashlib.md5(png[:2000] + prompt.encode()).hexdigest()
    buf = io.BytesIO()
    for n, v in [('model', model), ('prompt', prompt), ('size', '1536x1024'), ('quality', os.environ.get('IMAGE_QUALITY', 'high'))]:
        buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode())
    buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="src.png"\r\nContent-Type: image/png\r\n\r\n'.encode())
    buf.write(png)
    buf.write(f'\r\n--{boundary}--\r\n'.encode())
    delay = 10.0
    for attempt in range(7):
        req = urllib.request.Request(
            'https://api.openai.com/v1/images/edits',
            data=buf.getvalue(),
            headers={'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'},
        )
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                d = json.loads(r.read())
            out = Image.open(io.BytesIO(base64.b64decode(d['data'][0]['b64_json']))).convert('RGB')
            return out.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode(errors='replace')
            if 'credit_balance' in msg or 'insufficient_quota' in msg or 'billing' in msg:
                STOP.set()  # out of credit: no point retrying, stop the whole run
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


def job_list(plan: list, only: set | None) -> list:
    jobs = []
    if PLATE_SRC.exists():
        PLATE_RAW.mkdir(parents=True, exist_ok=True)
        for src in sorted(PLATE_SRC.glob('*.png')):
            if only and src.stem not in only:
                continue
            dark = 'red' in src.stem or 'dark' in src.stem
            jobs.append({'shot': src.stem, 'src': src, 'out': PLATE_RAW / f'{src.stem}.jpg', 'prompt': RESTYLE_PROMPT + PLATE_NOTE + (DARK_NOTE if dark else ''), 'kind': 'restyle'})
    for p in plan:
        if only and p['id'] not in only:
            continue
        if p['mode'] == 'single':
            jobs.append({'shot': p['id'], 'src': KEYS / f"{p['id']}_k1.png", 'out': OUT / f"{p['id']}_k1.jpg", 'prompt': RESTYLE_PROMPT + (CCTV_NOTE if p.get('cctv') else '') + (DARK_NOTE if p.get('dark') else ''), 'kind': 'restyle'})
            for ch in (sorted({t['character'] for t in p.get('talk', [])}) if os.environ.get('MOUTH_VARIANTS') else []):
                jobs.append({'shot': p['id'], 'src': OUT / f"{p['id']}_k1.jpg", 'out': OUT / f"{p['id']}_k1_talk_{ch}.jpg", 'prompt': mouth_prompt(ch), 'kind': 'mouth', 'after': OUT / f"{p['id']}_k1.jpg"})
        elif p['mode'] == 'multi':
            for i in range(3):
                jobs.append({'shot': p['id'], 'src': KEYS / f"{p['id']}_k{i}.png", 'out': OUT / f"{p['id']}_k{i}.jpg", 'prompt': RESTYLE_PROMPT + (CCTV_NOTE if p.get('cctv') else '') + (DARK_NOTE if p.get('dark') else ''), 'kind': 'restyle'})
    return jobs


def cmd_gen(only: set | None, limit: int, workers: int) -> None:
    load_env()
    if not os.environ.get('OPENAI_API_KEY'):
        print('OPENAI_API_KEY is not set (environment or .env).')
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)
    plan = json.loads(PLAN.read_text())
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    jobs = job_list(plan, only)
    restyles = [j for j in jobs if j['kind'] == 'restyle']
    mouths = [j for j in jobs if j['kind'] == 'mouth']
    state = {'done': 0, 'failed': 0, 'skipped': 0}

    def run(j: dict) -> None:
        if STOP.is_set():
            return
        if not j['src'].exists():
            state['failed'] += 1
            return
        src = j['src'].read_bytes()
        h = hashlib.sha1(src + j['prompt'].encode()).hexdigest()
        if j['out'].exists() and cache.get(j['out'].name) == h:
            state['skipped'] += 1
            return
        try:
            try:
                img = openai_edit(letterbox(Image.open(io.BytesIO(src))), j['prompt'])
            except RuntimeError as e:
                if 'moderation' not in str(e):
                    raise
                # false positives on spooky-but-harmless frames: say what it is and retry once
                img = openai_edit(letterbox(Image.open(io.BytesIO(src))), SAFE_NOTE + j['prompt'])
        except Exception as e:  # noqa: BLE001
            state['failed'] += 1
            print(f'  ! {j["out"].name}: {str(e)[:160]}', flush=True)
            return
        img.save(j['out'], 'JPEG', quality=90)
        with _lock:
            cache[j['out'].name] = h
            # merge with what other runs wrote meanwhile
            disk = json.loads(CACHE.read_text()) if CACHE.exists() else {}
            disk.update(cache)
            cache.update(disk)
            CACHE.write_text(json.dumps(disk, indent=1, sort_keys=True))
            state['done'] += 1
            print(f'  [{state["done"]}] {j["out"].name}', flush=True)

    for batch in (restyles, mouths):
        if limit:
            batch = batch[:limit]
        with ThreadPoolExecutor(max_workers=workers) as ex:
            list(ex.map(run, batch))
    print(f'restyle: generated {state["done"]}, cached {state["skipped"]}, failed {state["failed"]}')


# ---------------------------------------------------------------------------
# mouth positions (free lip sync over the redraws)
# ---------------------------------------------------------------------------
KEY_SEEDS = [37, 38, 63, 8, 11, 12, 21, 30, 13]
CHAR_SEED = {'daniel': 37, 'emma': 38, 'oldWoman': 63, 'captain': 8, 'crew1': 11, 'crew2': 12, 'police': 21, 'harbor': 30}


def cmd_mouths() -> None:
    plan = json.loads(PLAN.read_text())
    found = missing = 0
    for p in plan:
        if p['mode'] != 'single':
            continue
        f = KEYS / f"{p['id']}_mouth.png"
        if not p.get('talk') or not f.exists():
            continue
        a = np.asarray(Image.open(f).convert('RGB')).astype(np.int32)
        for t in p['talk']:
            seed = CHAR_SEED.get(t['character'])
            if seed is None:
                continue
            b = 24 * (KEY_SEEDS.index(seed) + 1)
            m = (np.abs(a[..., 0] - 255) < 40) & (a[..., 1] < 50) & (np.abs(a[..., 2] - b) < 8)
            ys, xs = np.nonzero(m)
            if len(xs) < 12:
                t.pop('mouth', None)
                missing += 1
                continue
            x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
            t['mouth'] = [round((x0 + x1) / 2, 1), round((y0 + y1) / 2, 1), int(x1 - x0 + 1), int(y1 - y0 + 1)]
            found += 1
    PLAN.write_text(json.dumps(plan, indent=1))
    print(f'mouths: located {found}, not visible {missing}')


# ---------------------------------------------------------------------------
# manifest for Remotion
# ---------------------------------------------------------------------------
FX = {
    'narrator_069_flickered': 'flicker', 'narrator_070_once_twice': 'flicker', 'narrator_184_lights_died': 'flicker',
    'thud_1': 'shake', 'thud_2': 'shake', 'thud_3': 'shake', 'narrator_103_hit': 'shake', 'narrator_188_struck': 'shake',
    'narrator_189_another_impact': 'shake', 'knocks_many': 'tremble', 'narrator_111_not_one': 'tremble', 'scratches': 'tremble',
    'narrator_112_moved_away': 'tremble', 'cctv_glitch': 'glitch',
}


def _edges(im: np.ndarray) -> np.ndarray:
    import cv2
    g = cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 2.0)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    m = cv2.magnitude(gx, gy)
    m = cv2.GaussianBlur(m, (0, 0), 3.0)
    return m / (m.max() + 1e-6)


def align_plate(pid: str) -> dict:
    """Register the redraw onto the code-drawn plate (scale + shift, per axis) around the
    area the animated characters use, and write the aligned plate to public/plates/."""
    import cv2
    src = np.asarray(Image.open(PLATE_SRC / f'{pid}.png').convert('RGB'))
    raw = np.asarray(Image.open(PLATE_RAW / f'{pid}.jpg').convert('RGB').resize((src.shape[1], src.shape[0]), Image.LANCZOS))
    H, W = src.shape[:2]
    x0, y0, x1, y1 = PLATE_ROI.get(pid) or (0, 0, W, H)
    warp = np.eye(2, 3, dtype=np.float32)
    # coarse to fine
    for scale in (0.25, 0.5):
        a = _edges(cv2.resize(src, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA))
        b = _edges(cv2.resize(raw, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA))
        mask = np.zeros(a.shape, np.uint8)
        mask[int(y0 * scale): int(y1 * scale), int(x0 * scale): int(x1 * scale)] = 1
        w = warp.copy()
        w[:, 2] *= scale
        try:
            _, w = cv2.findTransformECC(a, b, w, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), mask, 5)
        except cv2.error:
            break
        w[:, 2] /= scale
        warp = w
    # keep it to scale + shift per axis (no shear/rotation): the redraw only drifts and zooms
    sx, sy, tx, ty = float(warp[0, 0]), float(warp[1, 1]), float(warp[0, 2]), float(warp[1, 2])
    if not (0.8 < sx < 1.25 and 0.8 < sy < 1.25 and abs(tx) < 250 and abs(ty) < 250):
        sx, sy, tx, ty = 1.0, 1.0, 0.0, 0.0  # implausible - keep the redraw as it is
    def fit(sx_, sy_, tx_, ty_):
        mm = np.array([[sx_, 0, tx_], [0, sy_, ty_]], np.float32)
        o = cv2.warpAffine(raw, mm, (W, H), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
        return o, float(np.abs(_edges(src)[y0:y1, x0:x1] - _edges(o)[y0:y1, x0:x1]).mean())
    if fit(sx, sy, tx, ty)[1] >= fit(1.0, 1.0, 0.0, 0.0)[1]:
        sx, sy, tx, ty = 1.0, 1.0, 0.0, 0.0  # registration did not help (very dark plates) - keep as drawn
    m = np.array([[sx, 0, tx], [0, sy, ty]], np.float32)
    out = cv2.warpAffine(raw, m, (W, H), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    PLATE_OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out).save(PLATE_OUT / f'{pid}.jpg', 'JPEG', quality=92)
    # residual misfit inside the box, before and after
    ea, eb, ec = _edges(src), _edges(raw), _edges(out)
    sl = (slice(y0, y1), slice(x0, x1))
    before = float(np.abs(ea[sl] - eb[sl]).mean())
    after = float(np.abs(ea[sl] - ec[sl]).mean())
    return {'id': pid, 'sx': round(sx, 4), 'sy': round(sy, 4), 'tx': round(tx, 1), 'ty': round(ty, 1), 'misfit_before': round(before, 4), 'misfit_after': round(after, 4)}


def cmd_align() -> None:
    rows = [align_plate(p.stem) for p in sorted(PLATE_RAW.glob('*.jpg')) if (PLATE_SRC / f'{p.stem}.png').exists()]
    for r in rows:
        print(f"  {r['id']:<20} scale {r['sx']:.3f} x {r['sy']:.3f}  shift {r['tx']:+6.1f},{r['ty']:+6.1f}  misfit {r['misfit_before']:.4f} -> {r['misfit_after']:.4f}")
    (ROOT / 'build' / 'plate_align.json').write_text(json.dumps(rows, indent=1))
    print(f'align: {len(rows)} plates -> {PLATE_OUT.relative_to(ROOT)}')


def cmd_manifest() -> None:
    plan = json.loads(PLAN.read_text())
    shots = []
    for p in plan:
        if p['mode'] not in ('single', 'multi'):
            continue
        ks = [1] if p['mode'] == 'single' else [0, 1, 2]
        frames = []
        for k in ks:
            f = OUT / f"{p['id']}_k{k}.jpg"
            if not f.exists():
                frames = []
                break
            fr = {'src': f'restyle/{f.name}'}
            if p['mode'] == 'single':
                talk = {}
                for t in p.get('talk', []):
                    m = OUT / f"{p['id']}_k1_talk_{t['character']}.jpg"
                    entry = talk.setdefault(t['character'], {'lines': []})
                    entry['lines'].append(t['line'])
                    if m.exists():
                        entry['src'] = f'restyle/{m.name}'
                    if t.get('mouth'):
                        entry['mouth'] = t['mouth']
                        # skin colour just above the mouth in the redraw, to cover its own closed mouth
                        try:
                            im = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
                            cx, cy, w, h = t['mouth']
                            yy = int(max(0, cy - h * 1.15))
                            patch = im[max(0, yy - 3): yy + 4, int(cx - w * 0.25): int(cx + w * 0.25) + 1].reshape(-1, 3)
                            r, g, b = np.median(patch, axis=0)
                            entry['skin'] = '#%02x%02x%02x' % (int(r), int(g), int(b))
                        except Exception:  # noqa: BLE001
                            pass
                talk = {k: v for k, v in talk.items() if v.get('src') or v.get('mouth')}
                if talk:
                    fr['talk'] = list(talk.values())
            frames.append(fr)
        if frames:
            shots.append({'id': p['id'], 'from': p['from'], 'to': p['to'], 'frames': frames, 'fx': FX.get(p['marker']) or ('cctv' if p.get('cctv') else None)})
    MANIFEST.write_text(json.dumps({'shots': shots}, indent=1))
    plates = sorted(p.stem for p in PLATE_OUT.glob('*.jpg')) if PLATE_OUT.exists() else []
    PLATE_MANIFEST.write_text(json.dumps({'plates': plates}, indent=1))
    print(f'manifest: {len(plates)} background plates -> {PLATE_MANIFEST.relative_to(ROOT)}')
    print(f'manifest: {len(shots)} restyled shots -> {MANIFEST.relative_to(ROOT)}')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['plan', 'gen', 'mouths', 'align', 'manifest'])
    ap.add_argument('--only')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--workers', type=int, default=6)
    a = ap.parse_args()
    if a.cmd == 'plan':
        cmd_plan()
    elif a.cmd == 'gen':
        cmd_gen(set(a.only.split(',')) if a.only else None, a.limit, a.workers)
    elif a.cmd == 'mouths':
        cmd_mouths()
    elif a.cmd == 'align':
        cmd_align()
    else:
        cmd_manifest()
    return 0


if __name__ == '__main__':
    sys.exit(main())
