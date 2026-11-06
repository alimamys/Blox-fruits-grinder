#!/usr/bin/env python3
"""Thumbnail scenes drawn by gpt-image-2 in the film's own style.

Frames from the film are passed as references (characters + look), the prompt asks for a
clickable composition (strong emotion, one clear mystery, bright contrast). The result is
cropped to 16:9 and saved to youtube/gen_<name>.png; text is added afterwards by
scripts/make_thumbnails.py so the lettering is crisp and correctly spelled.

    .venv/bin/python scripts/images/thumbnail_gen.py counter behind   (~$0.20 per image)
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / 'public' / 'restyle'
OUT = ROOT / 'youtube'

STYLE = (
    'Draw a YouTube thumbnail in EXACTLY the same art style as the reference images: the same simple '
    'stick-figure cartoon characters (round heads, dot eyes, simple brows and mouths, thick dark outlines, '
    'clean soft shading), the same character designs and colours. 16:9 composition: keep every important '
    'element inside the middle horizontal band, nothing important in the top or bottom 8% of the canvas. '
    'Bold, high contrast, bright enough to read at a small size, cinematic lighting. '
    'Do not write any words, captions or logos anywhere in the image. '
)

SCENES = {
    'counter': {
        'refs': ['hook_12_k1.jpg', 'peopleInWater_08_k1.jpg', 'hook_08_k1.jpg'],
        'prompt': STYLE + (
            'Scene: night, on the rear deck of a ferry under a warm deck lamp, dark sea behind. '
            'RIGHT side, large in the foreground (chest up, filling about 45% of the frame height or more): the '
            'ferry crew member from the first reference (navy uniform with a yellow stripe), terrified - eyes wide, '
            'mouth open in shock, sweat drop - holding up a small handheld tally counter towards the viewer. The '
            'counter display shows the number 63 in large clear digits (the only characters allowed in the image). '
            'LEFT-CENTRE background, smaller: the old woman from the second reference (grey hair bun, pale face, '
            'black coat with a round 37 badge) sitting alone on a wooden deck bench, turned towards the viewer, '
            'smiling a calm, unsettling smile. A thick bright red hand-drawn circle around the old woman. '
            'Leave the upper-left area fairly empty and dark for a title to be added later.'
        ),
    },
    'behind': {
        'refs': ['hull_17_k1.jpg', 'peopleInWater_08_k1.jpg', 'recognition_19_k1.jpg'],
        'prompt': STYLE + (
            'Scene: inside a dim ferry passenger cabin at night, rows of blue seats with sleeping passengers in '
            'the background, cold blue light with one warm light. RIGHT-CENTRE, large in the foreground (chest up): '
            'Daniel from the first reference (brown hair, blue long-sleeve shirt), frozen in fear, eyes very wide, '
            'looking towards the viewer, not seeing what is behind him. Directly behind his shoulder, half in '
            'shadow, leaning close: the old woman from the second reference (grey hair bun, pale face, black coat '
            'with a round 37 badge), smiling a calm, unsettling smile at the viewer. A thick bright red hand-drawn '
            'arrow pointing at the old woman. Leave the left third of the image fairly empty and dark for a title '
            'to be added later.'
        ),
    },
}


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if raw and not raw.startswith('#') and '=' in raw:
                k, v = raw.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def edit(images: list[bytes], prompt: str) -> Image.Image:
    key = os.environ['OPENAI_API_KEY']
    boundary = '----thumb' + hashlib.md5(prompt.encode()).hexdigest()
    buf = io.BytesIO()
    for n, v in [('model', os.environ.get('IMAGE_MODEL', 'gpt-image-2')), ('prompt', prompt), ('size', '1536x1024'), ('quality', 'high')]:
        buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode())
    for i, png in enumerate(images):
        buf.write(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="ref{i}.png"\r\nContent-Type: image/png\r\n\r\n'.encode())
        buf.write(png)
        buf.write(b'\r\n')
    buf.write(f'--{boundary}--\r\n'.encode())
    import time
    for attempt in range(5):
        req = urllib.request.Request('https://api.openai.com/v1/images/edits', data=buf.getvalue(), headers={'Authorization': f'Bearer {key}', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                d = json.loads(r.read())
            break
        except urllib.error.HTTPError as e:
            raise SystemExit(f'HTTP {e.code}: {e.read()[:400].decode(errors="replace")}')
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            if attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))  # dropped connection through the proxy - retry
    return Image.open(io.BytesIO(base64.b64decode(d['data'][0]['b64_json']))).convert('RGB')


def png_of(path: Path) -> bytes:
    im = Image.open(path).convert('RGB').resize((1536, 864))
    canvas = Image.new('RGB', (1536, 1024), (0, 0, 0))
    canvas.paste(im, (0, 80))
    b = io.BytesIO()
    canvas.save(b, 'PNG')
    return b.getvalue()


def main() -> int:
    load_env()
    names = sys.argv[1:] or list(SCENES)
    OUT.mkdir(exist_ok=True)
    for name in names:
        sc = SCENES[name]
        img = edit([png_of(REF / r) for r in sc['refs']], sc['prompt'])
        w, h = img.size
        ch = int(w * 9 / 16)
        img = img.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch)).resize((1280, 720), Image.LANCZOS)
        img.save(OUT / f'gen_{name}.png')
        print(f'{name} -> youtube/gen_{name}.png')
    return 0


if __name__ == '__main__':
    sys.exit(main())
