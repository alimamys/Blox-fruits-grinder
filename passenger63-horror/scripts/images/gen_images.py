#!/usr/bin/env python3
"""Generate the video's illustrations with an image model (Nano Banana / Gemini image,
or OpenAI gpt-image) from the art list in scripts/images/art.json.

    .venv/bin/python scripts/images/gen_images.py                 # everything missing
    .venv/bin/python scripts/images/gen_images.py --only sheet_daniel,bg_cabin_aft
    .venv/bin/python scripts/images/gen_images.py --group sheets  # one group
    .venv/bin/python scripts/images/gen_images.py --provider openai

Keys come from the environment or the git-ignored .env: GEMINI_API_KEY (default
provider "gemini", model IMAGE_MODEL or gemini-3.1-flash-image) or OPENAI_API_KEY
(provider "openai", model gpt-image-2).

Each art entry:
  {"id": "bg_cabin_aft", "group": "backgrounds", "prompt": "...",
   "refs": ["sheet_daniel"],      # earlier art ids sent as reference images (consistency)
   "aspect": "16:9",              # 16:9 | 9:16 | 1:1 | 4:3 | 3:4
   "cutout": false}               # true: generated on flat green, keyed to a transparent PNG
Every prompt is prefixed with the shared STYLE from art.json. Output goes to
public/images/<id>.png. A cache (public/images/.art-cache.json) skips entries whose
prompt/refs/model did not change, so nothing is paid for twice.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
ART = ROOT / 'scripts' / 'images' / 'art.json'
OUT = ROOT / 'public' / 'images'
CACHE = OUT / '.art-cache.json'


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if raw and not raw.startswith('#') and '=' in raw:
                k, v = raw.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def _post(url: str, body: bytes, headers: dict, timeout: int = 300) -> dict:
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def gemini_generate(prompt: str, refs: list[bytes], aspect: str, model: str, key: str) -> bytes:
    parts: list[dict] = [{'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(r).decode()}} for r in refs]
    parts.append({'text': prompt})
    body = {
        'contents': [{'parts': parts}],
        'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}},
    }
    if os.environ.get('IMAGE_SIZE'):
        body['generationConfig']['imageConfig']['imageSize'] = os.environ['IMAGE_SIZE']
    d = _post(
        f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        json.dumps(body).encode(),
        {'x-goog-api-key': key, 'Content-Type': 'application/json'},
    )
    for c in d.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                return base64.b64decode(p['inlineData']['data'])
    raise RuntimeError(f'no image in response: {json.dumps(d)[:300]}')


OPENAI_SIZES = {'16:9': '1536x1024', '4:3': '1536x1024', '1:1': '1024x1024', '9:16': '1024x1536', '3:4': '1024x1536'}


def openai_generate(prompt: str, refs: list[bytes], aspect: str, model: str, key: str) -> bytes:
    size = OPENAI_SIZES.get(aspect, '1536x1024')
    if not refs:
        body = {'model': model, 'prompt': prompt, 'size': size, 'quality': os.environ.get('IMAGE_QUALITY', 'high'), 'n': 1}
        d = _post('https://api.openai.com/v1/images/generations', json.dumps(body).encode(), {'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    else:
        # multipart edit request with the reference images
        boundary = '----p63' + hashlib.md5(prompt.encode()).hexdigest()
        buf = io.BytesIO()

        def field(name: str, value: str) -> None:
            buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())

        field('model', model)
        field('prompt', prompt)
        field('size', size)
        field('quality', os.environ.get('IMAGE_QUALITY', 'high'))
        for i, r in enumerate(refs):
            buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="ref{i}.png"\r\nContent-Type: image/png\r\n\r\n'.encode())
            buf.write(r)
            buf.write(b'\r\n')
        buf.write(f'--{boundary}--\r\n'.encode())
        d = _post('https://api.openai.com/v1/images/edits', buf.getvalue(), {'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
    return base64.b64decode(d['data'][0]['b64_json'])


def chroma_key(png: bytes) -> bytes:
    """Flat green background -> transparent PNG (soft edge, green spill removed)."""
    import numpy as np
    from PIL import Image

    im = Image.open(io.BytesIO(png)).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1.0 - (greenness - 0.12) / 0.25, 0.0, 1.0)
    # despill: pull green down to the max of red/blue where it dominates
    g2 = np.where(greenness > 0, np.maximum(r, b) + 0.15 * greenness, g)
    rgba = np.dstack([r, g2, b, alpha])
    out = Image.fromarray((rgba * 255).round().astype('uint8'), 'RGBA')
    bio = io.BytesIO()
    out.save(bio, 'PNG', optimize=True)
    return bio.getvalue()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--provider', default=os.environ.get('IMAGE_PROVIDER', 'gemini'), choices=['gemini', 'openai'])
    ap.add_argument('--model')
    ap.add_argument('--only', help='comma separated art ids')
    ap.add_argument('--group', help='only this group')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--dry-run', action='store_true', help='list what would be generated')
    args = ap.parse_args()
    load_env()
    art = json.loads(ART.read_text())
    style = art['style']
    items = art['items']
    model = args.model or (os.environ.get('IMAGE_MODEL') or ('gemini-3.1-flash-image' if args.provider == 'gemini' else 'gpt-image-2'))
    key = os.environ.get('GEMINI_API_KEY' if args.provider == 'gemini' else 'OPENAI_API_KEY')
    if not key and not args.dry_run:
        print(f'[images] {"GEMINI_API_KEY" if args.provider == "gemini" else "OPENAI_API_KEY"} is not set (environment or .env).')
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    only = set(args.only.split(',')) if args.only else None
    todo = [it for it in items if (not only or it['id'] in only) and (not args.group or it.get('group') == args.group)]
    made = 0
    for it in todo:
        prompt = style['cutout' if it.get('cutout') else 'scene'] + ' ' + it['prompt']
        refs = [(OUT / f'{r}.png').read_bytes() for r in it.get('refs', []) if (OUT / f'{r}.png').exists()]
        h = hashlib.md5(json.dumps([prompt, it.get('refs', []), it.get('aspect', '16:9'), model, it.get('cutout', False)]).encode()).hexdigest()
        out = OUT / f'{it["id"]}.png'
        if not args.force and out.exists() and cache.get(it['id']) == h:
            continue
        if args.dry_run:
            print(f'  would generate {it["id"]:28s} refs={it.get("refs", [])}')
            continue
        delay = 5.0
        for attempt in range(6):
            try:
                gen = gemini_generate if args.provider == 'gemini' else openai_generate
                data = gen(prompt, refs, it.get('aspect', '16:9'), model, key)
                break
            except urllib.error.HTTPError as e:
                msg = e.read()[:400].decode(errors='replace')
                if e.code in (429, 500, 503) and attempt < 5 and 'limit: 0' not in msg:
                    time.sleep(delay)
                    delay *= 2
                    continue
                print(f'[images] {it["id"]}: HTTP {e.code} {msg}')
                return 1
        if it.get('cutout'):
            data = chroma_key(data)
        out.write_bytes(data)
        cache[it['id']] = h
        CACHE.write_text(json.dumps(cache, indent=1, sort_keys=True))
        made += 1
        print(f'  [{made}] {it["id"]} -> {out.relative_to(ROOT)}', flush=True)
    print(f'[images] generated {made} of {len(todo)} with {args.provider}/{model}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
