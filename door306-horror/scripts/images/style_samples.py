#!/usr/bin/env python3
"""The same story moment drawn in several art styles, to compare looks for future films.

    .venv/bin/python scripts/images/style_samples.py            # all styles (~$0.20 each)
    .venv/bin/python scripts/images/style_samples.py ink clay   # some of them
Writes style-samples/<style>.png (1280x720).
"""
from __future__ import annotations

import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'style-samples'

SCENE = (
    'Night, the open rear deck of a small passenger ferry at sea, one deck lamp, dark ocean and sky. '
    'An elderly woman in a long black coat, grey hair in a neat bun, a small round white badge with the number 37 '
    'pinned to her coat, sits alone on a wooden bench in the middle distance, hands folded, smiling faintly and '
    'looking straight at the viewer. In the foreground on the left, a young couple stand close together and stare '
    'at her, frightened: the man has short brown hair and a blue long-sleeve shirt; the woman has long dark brown '
    'hair and a dark red top and is gripping his arm. Wide 16:9 cinematic composition, everything important in the '
    'middle band of the frame. No text, captions or logos anywhere except the number 37 on the badge.'
)

STYLES = {
    'ink': 'Style: dark graphic-novel illustration - bold black ink lines, heavy solid black shadows, limited muted '
           'palette (deep blues, sickly yellow lamp light, one red accent), subtle cross-hatching, dramatic contrast. '
           'Expressive, slightly exaggerated faces.',
    'animated2d': 'Style: semi-realistic 2D animated series for adults - clean line art, cel-shaded characters with '
                  'natural proportions and very expressive eyes, painted atmospheric backgrounds, cinematic moody '
                  'lighting, cold blue night with warm lamp light.',
    'clay': 'Style: handmade stop-motion animation - characters are clay and felt puppets with slightly oversized '
            'heads, glass-bead eyes and visible fingerprints in the clay, a miniature handmade set with real wood and '
            'fabric, practical miniature lighting, shallow depth of field. Uncanny and eerie.',
    'storybook': 'Style: dark painted storybook illustration - gouache and watercolour textures, soft edges, muted '
                 'desaturated colours, fog drifting over the deck, gentle vignette, eerie and melancholy.',
    'papercut': 'Style: layered paper cut-out theatre - characters and set cut from textured black and dark-blue '
                'card in several depth layers, backlit so edges glow, the old woman partly a silhouette with a pale '
                'paper face, shadow-puppet feel.',
    'ps1': 'Style: retro 1990s low-poly 3D horror game - chunky low-polygon characters, blurry low-resolution '
           'textures, slight texture warping, heavy distance fog, dithered dark colours, one harsh light source.',
}


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if raw and not raw.startswith('#') and '=' in raw:
                k, v = raw.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def generate(prompt: str) -> Image.Image:
    body = json.dumps({'model': os.environ.get('IMAGE_MODEL', 'gpt-image-2'), 'prompt': prompt, 'size': '1536x1024', 'quality': 'high'}).encode()
    for attempt in range(5):
        req = urllib.request.Request('https://api.openai.com/v1/images/generations', data=body, headers={'Authorization': f'Bearer {os.environ["OPENAI_API_KEY"]}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                d = json.loads(r.read())
            return Image.open(io.BytesIO(base64.b64decode(d['data'][0]['b64_json']))).convert('RGB')
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'HTTP {e.code}: {e.read()[:300].decode(errors="replace")}')
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            if attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError('unreachable')


def run(name: str) -> str:
    img = generate(f'{STYLES[name]} {SCENE}')
    w, h = img.size
    ch = int(w * 9 / 16)
    img.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch)).resize((1280, 720), Image.LANCZOS).save(OUT / f'{name}.png')
    return name


def main() -> int:
    load_env()
    OUT.mkdir(exist_ok=True)
    names = sys.argv[1:] or list(STYLES)
    with ThreadPoolExecutor(len(names)) as ex:
        for fut in [ex.submit(run, n) for n in names]:
            try:
                print('done', fut.result(), flush=True)
            except Exception as e:  # noqa: BLE001
                print('failed', e, flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
