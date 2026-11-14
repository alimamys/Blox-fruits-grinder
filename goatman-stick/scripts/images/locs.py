#!/usr/bin/env python3
"""Location references -> layout plates.

    .venv/bin/python scripts/images/locs.py

references/locations/<name>.png (1536x1024, sometimes with drawn-in letterbox bars) ->
public/locs/<name>.jpg: bars cropped, then cover-cropped to 16:9 and scaled to 1920x1080.
The plates are the backgrounds of the code layouts (src/layout/Plate.tsx).
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'references' / 'locations'
DST = ROOT / 'public' / 'locs'


def bars(a: np.ndarray) -> tuple[int, int]:
    """Rows of near-black, flat letterbox at the top and bottom."""
    lum = a.mean(axis=2)
    flat = (lum.mean(axis=1) < 14) & (lum.std(axis=1) < 6)
    top = 0
    while top < len(flat) // 4 and flat[top]:
        top += 1
    bot = len(flat)
    while bot > len(flat) * 3 // 4 and flat[bot - 1]:
        bot -= 1
    return top, bot


def main() -> int:
    DST.mkdir(parents=True, exist_ok=True)
    for p in sorted(SRC.glob('*.png')):
        im = Image.open(p).convert('RGB')
        a = np.asarray(im)
        top, bot = bars(a)
        if top > 4 or bot < im.height - 4:
            im = im.crop((0, top + 2 if top else 0, im.width, bot - 2 if bot < im.height else im.height))
        w, h = im.size
        if w / h > 16 / 9:
            nw = int(h * 16 / 9)
            im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w * 9 / 16)
            im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        im.resize((1920, 1080), Image.LANCZOS).save(DST / f'{p.stem}.jpg', quality=92)
        print(f'  {p.name}: bars top {top}px bottom {a.shape[0] - bot}px -> public/locs/{p.stem}.jpg')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
