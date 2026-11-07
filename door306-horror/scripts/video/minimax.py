#!/usr/bin/env python3
"""Image-to-video clips from MiniMax (Hailuo) for the key motion shots.

Every clip starts from one of OUR approved frames (public/restyle/*.jpg, made with the
image model from the layouts + sheets), so the film keeps one look; the prompt only
describes the motion. Clips are muted, converted to 1920x1080 / 24 fps, and land in
public/clips/<id>.mp4, listed in src/data/generated/clips.json.

    .venv/bin/python scripts/video/minimax.py probe                 # free: is the API reachable with the key?
    .venv/bin/python scripts/video/minimax.py gen [--only id,id]    # build/video_plan.json -> clips
    .venv/bin/python scripts/video/minimax.py cost                  # spend so far

Key: MINIMAX_API_KEY (environment or the git-ignored .env). Every task is logged to
logs/video_costs.jsonl with its price; the run stops before VIDEO_BUDGET_USD (default
30) would be passed. A clip whose inputs (image, prompt, model, length) did not change
is never generated twice. Prices per clip are the published list prices as far as we
could check them (third-party sources, Nov 2026) - override with VIDEO_PRICES_JSON.

API flow (https://platform.minimax.io/docs): POST /v1/video_generation -> task_id;
GET /v1/query/video_generation?task_id= -> status / file_id; GET /v1/files/retrieve
?file_id= -> download_url.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
API = os.environ.get('MINIMAX_API_BASE', 'https://api.minimax.io')
PLAN = ROOT / 'build' / 'video_plan.json'
OUT = ROOT / 'public' / 'clips'
RAW = ROOT / 'build' / 'clips_raw'
LEDGER = ROOT / 'logs' / 'video_costs.jsonl'
CACHE = ROOT / 'logs' / 'video_cache.json'
MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'clips.json'

# USD per clip: (model, resolution, seconds). Unverified list prices - see docstring.
DEFAULT_PRICES = {
    'MiniMax-Hailuo-2.3|768P|6': 0.28, 'MiniMax-Hailuo-2.3|768P|10': 0.56, 'MiniMax-Hailuo-2.3|1080P|6': 0.49,
    'MiniMax-Hailuo-2.3-Fast|768P|6': 0.19, 'MiniMax-Hailuo-2.3-Fast|768P|10': 0.32, 'MiniMax-Hailuo-2.3-Fast|1080P|6': 0.33,
    'MiniMax-Hailuo-02|768P|6': 0.28, 'MiniMax-Hailuo-02|768P|10': 0.56, 'MiniMax-Hailuo-02|1080P|6': 0.49,
}

STYLE_LOCK = ('Keep EXACTLY the look of the first frame: the same 2D animated illustration style (clean line art, cel shading, '
              'painted backgrounds), the same characters, faces, clothes, room and light. No new people, no text. ')


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for ln in env.read_text().splitlines():
            if '=' in ln and not ln.strip().startswith('#'):
                k, v = ln.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def prices() -> dict:
    p = dict(DEFAULT_PRICES)
    if os.environ.get('VIDEO_PRICES_JSON'):
        p.update(json.loads(os.environ['VIDEO_PRICES_JSON']))
    return p


def spent() -> float:
    if not LEDGER.exists():
        return 0.0
    return sum(json.loads(l).get('usd', 0) for l in LEDGER.read_text().splitlines() if l.strip())


def budget() -> float:
    return float(os.environ.get('VIDEO_BUDGET_USD', 30))


def call(method: str, path: str, body: dict | None = None) -> dict:
    key = os.environ.get('MINIMAX_API_KEY')
    if not key:
        raise SystemExit('MINIMAX_API_KEY is not set (environment or .env) - nothing generated.')
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    delay = 5.0
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read())
            code = (d.get('base_resp') or {}).get('status_code', 0)
            if code == 1002 and attempt < 5:  # rate limit
                time.sleep(delay)
                delay *= 2
                continue
            if code not in (0, None):
                raise RuntimeError(f'MiniMax error {code}: {(d.get("base_resp") or {}).get("status_msg")}')
            return d
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(delay)
                delay *= 2
                continue
            raise RuntimeError(f'HTTP {e.code}: {e.read()[:300].decode(errors="replace")}') from e
        except urllib.error.URLError as e:
            raise RuntimeError(f'MiniMax not reachable ({e.reason}). Is api.minimax.io allowed in the network settings?') from e
    raise RuntimeError('too many retries')


def data_url(path: Path) -> str:
    mime = 'image/png' if path.suffix.lower() == '.png' else 'image/jpeg'
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def cache() -> dict:
    return json.loads(CACHE.read_text()) if CACHE.exists() else {}


def job_hash(j: dict) -> str:
    h = hashlib.sha1()
    for k in ('image', 'last_image'):
        if j.get(k):
            h.update((ROOT / j[k]).read_bytes())
    h.update(json.dumps({k: j.get(k) for k in ('prompt', 'model', 'duration', 'resolution')}, sort_keys=True).encode())
    return h.hexdigest()


def finish(raw: Path, out: Path, seconds: float | None) -> None:
    """Mute, scale/pad to 1920x1080, 24 fps constant frame rate, H.264."""
    vf = 'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,fps=24'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-an', '-vf', vf, '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p']
    if seconds:
        cmd += ['-t', f'{seconds:.3f}']
    subprocess.run(cmd + [str(out)], check=True)


def generate(j: dict) -> None:
    model = j.get('model', 'MiniMax-Hailuo-2.3')
    res = j.get('resolution', '768P')
    dur = int(j.get('duration', 6))
    usd = prices().get(f'{model}|{res}|{dur}')
    if usd is None:
        raise RuntimeError(f'no price known for {model} {res} {dur}s - set VIDEO_PRICES_JSON')
    if spent() + usd > budget():
        raise SystemExit(f'budget: ${spent():.2f} spent, this clip ${usd:.2f} would pass ${budget():.2f} - stopping')
    body = {'model': model, 'prompt': (STYLE_LOCK + j['prompt'])[:2000], 'first_frame_image': data_url(ROOT / j['image']),
            'duration': dur, 'resolution': res, 'prompt_optimizer': False}
    if j.get('last_image'):
        body['last_frame_image'] = data_url(ROOT / j['last_image'])
    d = call('POST', '/v1/video_generation', body)
    task = d['task_id']
    with LEDGER.open('a') as f:  # billed per submitted task
        f.write(json.dumps({'t': time.strftime('%Y-%m-%dT%H:%M:%S'), 'id': j['id'], 'task': task, 'model': model, 'res': res, 'dur': dur, 'usd': usd}) + '\n')
    print(f'  {j["id"]}: task {task} (${usd:.2f}, total ${spent():.2f})', flush=True)
    t0 = time.time()
    while True:
        time.sleep(10)
        q = call('GET', f'/v1/query/video_generation?task_id={task}')
        st = q.get('status')
        if st == 'Success':
            break
        if st == 'Fail':
            raise RuntimeError(f'{j["id"]}: generation failed: {q}')
        if time.time() - t0 > 1800:
            raise RuntimeError(f'{j["id"]}: still {st} after 30 min')
    f = call('GET', f'/v1/files/retrieve?file_id={q["file_id"]}')
    url = f['file']['download_url']
    RAW.mkdir(parents=True, exist_ok=True)
    raw = RAW / f'{j["id"]}.mp4'
    with urllib.request.urlopen(url, timeout=300) as r:
        raw.write_bytes(r.read())
    OUT.mkdir(parents=True, exist_ok=True)
    finish(raw, OUT / f'{j["id"]}.mp4', j.get('trim'))
    c = cache()
    c[j['id']] = job_hash(j)
    CACHE.write_text(json.dumps(c, indent=1))
    print(f'  -> public/clips/{j["id"]}.mp4 ({time.time() - t0:.0f} s)', flush=True)


def write_manifest() -> None:
    clips = sorted(p.stem for p in OUT.glob('*.mp4')) if OUT.exists() else []
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({'clips': {c: f'clips/{c}.mp4' for c in clips}}, indent=1))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['probe', 'gen', 'cost', 'manifest'])
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    load_env()
    if a.cmd == 'probe':
        try:
            call('GET', '/v1/query/video_generation?task_id=0')
        except RuntimeError as e:
            msg = str(e)
            if 'not reachable' in msg or 'HTTP 401' in msg or ' 1004:' in msg or ' 2049:' in msg:
                print(msg)
                return 1
            # any other answer (e.g. "invalid task id") means the API is reachable and the key was accepted
        print('MiniMax reachable, key accepted')
        return 0
    if a.cmd == 'cost':
        print(f'video spend ${spent():.2f} of ${budget():.2f}')
        return 0
    if a.cmd == 'manifest':
        write_manifest()
        return 0
    plan = json.loads(PLAN.read_text())
    only = set(filter(None, a.only.split(',')))
    for j in plan:
        if only and j['id'] not in only:
            continue
        if (OUT / f'{j["id"]}.mp4').exists() and cache().get(j['id']) == job_hash(j):
            print(f'  cached {j["id"]}')
            continue
        generate(j)
    write_manifest()
    return 0


if __name__ == '__main__':
    sys.exit(main())
