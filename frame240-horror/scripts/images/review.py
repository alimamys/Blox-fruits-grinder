#!/usr/bin/env python3
"""Contact sheets for checking the image pipeline by eye.

    .venv/bin/python scripts/images/review.py sources   # every shot's middle source frame, labelled
    .venv/bin/python scripts/images/review.py pairs      # source | redraw side by side, labelled
    .venv/bin/python scripts/images/review.py talk       # redraw | mouth-open variant

Sheets go to build/review/<kind>_NN.jpg (4 columns, labelled with the shot id and
classification from build/restyle_plan.json when it exists).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent.parent
KEYS = ROOT / 'build' / 'keyframes'
OUT = ROOT / 'public' / 'restyle'
REV = ROOT / 'build' / 'review'


def label(im: Image.Image, text: str) -> Image.Image:
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, min(im.width, 9 * len(text) + 12), 22), fill=(0, 0, 0))
    d.text((6, 4), text, fill=(255, 230, 80))
    return im


def sheets(tiles: list[Image.Image], kind: str, cols: int = 4) -> None:
    REV.mkdir(parents=True, exist_ok=True)
    for old in REV.glob(f'{kind}_*.jpg'):
        old.unlink()
    per = cols * 5
    for n in range(0, len(tiles), per):
        chunk = tiles[n: n + per]
        w, h = chunk[0].size
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * h + (rows - 1) * 6), (40, 40, 40))
        for i, t in enumerate(chunk):
            sheet.paste(t, ((i % cols) * (w + 6), (i // cols) * (h + 6)))
        sheet.save(REV / f'{kind}_{n // per:02d}.jpg', quality=82)
    print(f'{len(tiles)} tiles -> {REV.relative_to(ROOT)}/{kind}_*.jpg')


def main() -> int:
    kind = sys.argv[1] if len(sys.argv) > 1 else 'sources'
    plan_path = ROOT / 'build' / 'restyle_plan.json'
    plan = json.loads(plan_path.read_text()) if plan_path.exists() else json.loads((ROOT / 'build' / 'shotmap.json').read_text())['shots']
    tiles = []
    for p in plan:
        if kind == 'sources':
            f = KEYS / f"{p['id']}_k1.png"
            if f.exists():
                tiles.append(label(Image.open(f).convert('RGB').resize((480, 270)), f"{p['id']} {p.get('mode', '')}"))
        elif kind == 'pairs':
            if p.get('mode') not in ('single', 'multi'):
                continue
            for k in ([1] if p['mode'] == 'single' else [0, 1, 2]):
                a, b = KEYS / f"{p['id']}_k{k}.png", OUT / f"{p['id']}_k{k}.jpg"
                if a.exists() and b.exists():
                    t = Image.new('RGB', (964, 270))
                    t.paste(Image.open(a).convert('RGB').resize((480, 270)), (0, 0))
                    t.paste(Image.open(b).convert('RGB').resize((480, 270)), (484, 0))
                    tiles.append(label(t, f"{p['id']}_k{k}"))
        elif kind == 'talk':
            for t in {x['character'] for x in p.get('talk', [])}:
                a, b = OUT / f"{p['id']}_k1.jpg", OUT / f"{p['id']}_k1_talk_{t}.jpg"
                if a.exists() and b.exists():
                    tile = Image.new('RGB', (964, 270))
                    tile.paste(Image.open(a).convert('RGB').resize((480, 270)), (0, 0))
                    tile.paste(Image.open(b).convert('RGB').resize((480, 270)), (484, 0))
                    tiles.append(label(tile, f"{p['id']} talk {t}"))
    if not tiles:
        print('nothing to show')
        return 0
    sheets(tiles, kind, cols=2 if kind in ('pairs', 'talk') else 4)
    return 0


if __name__ == '__main__':
    sys.exit(main())
