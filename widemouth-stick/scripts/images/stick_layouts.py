#!/usr/bin/env python3
"""Rough flat layouts of the stick-figure film's sets (front-on "stage" views, so code-drawn
characters can walk, sit and hide in them). Only positions matter; the image model repaints them.

    .venv/bin/python scripts/images/stick_layouts.py      # -> build/layouts/<set>.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)

# set geometry shared with the code (src/components/environments/sets.ts): floor seam, bed, window
BEDROOM = dict(floor=760, bed_x0=150, bed_x1=990, mattress=610, skirt_bottom=868, feet=880, win=(1060, 160, 1440, 560))


def bedroom(night: bool = True) -> Image.Image:
    g = BEDROOM
    wall = (58, 70, 98) if night else (170, 165, 150)
    floor = (52, 40, 34) if night else (128, 96, 70)
    im = Image.new('RGB', (1920, 1080), wall)
    d = ImageDraw.Draw(im)
    # sloped attic ceiling at the top left
    d.polygon([(0, 0), (560, 0), (0, 300)], fill=tuple(int(c * 0.7) for c in wall), outline=INK)
    d.rectangle([0, g['floor'], 1920, 1080], fill=floor)
    d.line([0, g['floor'], 1920, g['floor']], fill=INK, width=6)
    for y in range(g['floor'] + 50, 1080, 70):
        d.line([0, y, 1920, y], fill=tuple(int(c * 0.8) for c in floor), width=3)
    d.rectangle([0, g['floor'] - 22, 1920, g['floor']], fill=tuple(int(c * 0.85) for c in wall), outline=INK, width=3)  # skirting board
    # window with night sky, moon, pines; curtains either side
    x0, y0, x1, y1 = g['win']
    d.rectangle([x0, y0, x1, y1], fill=(22, 30, 58) if night else (190, 205, 215), outline=INK, width=8)
    d.ellipse([x1 - 120, y0 + 40, x1 - 60, y0 + 100], fill=(230, 230, 210))
    for i, px in enumerate(range(x0 + 20, x1, 70)):
        h = 120 + (i * 37) % 80
        d.polygon([(px, y1), (px + 35, y1 - h), (px + 70, y1)], fill=(14, 22, 30) if night else (60, 90, 70))
    d.line([(x0 + x1) // 2, y0, (x0 + x1) // 2, y1], fill=(220, 220, 214), width=14)
    d.line([x0, (y0 + y1) // 2, x1, (y0 + y1) // 2], fill=(220, 220, 214), width=14)
    d.rectangle([x0 - 30, y1, x1 + 30, y1 + 26], fill=(220, 220, 214), outline=INK, width=4)  # sill
    for cx in (x0 - 80, x1 + 10):
        d.rectangle([cx, y0 - 30, cx + 70, y1 + 70], fill=(200, 196, 186) if not night else (110, 118, 140), outline=INK, width=4)
    d.line([x0 - 120, y0 - 34, x1 + 120, y0 - 34], fill=INK, width=8)  # rod
    # stacked moving boxes on the right
    for bx, by, bw, bh in [(1560, 600, 300, 280), (1600, 380, 240, 220), (1490, 760, 160, 160)]:
        d.rectangle([bx, by, bx + bw, by + bh], fill=(150, 110, 70) if not night else (92, 70, 52), outline=INK, width=5)
        d.line([bx + bw // 2, by, bx + bw // 2, by + 40], fill=(200, 180, 140), width=10)
    # the bed, side-on: headboard left, footboard right, patchwork quilt, white bed skirt to the floor
    bx0, bx1, top, sk = g['bed_x0'], g['bed_x1'], g['mattress'], g['skirt_bottom']
    d.rectangle([bx0 - 30, 330, bx0 + 20, g['feet']], fill=(96, 62, 40), outline=INK, width=5)  # headboard post
    d.rounded_rectangle([bx0 - 30, 360, bx0 + 20, top], radius=10, fill=(110, 72, 46), outline=INK, width=5)
    d.ellipse([bx0 - 40, 300, bx0 + 30, 350], fill=(110, 72, 46), outline=INK, width=4)
    d.rectangle([bx1 - 10, 520, bx1 + 30, g['feet']], fill=(96, 62, 40), outline=INK, width=5)  # footboard
    d.ellipse([bx1 - 20, 490, bx1 + 40, 535], fill=(110, 72, 46), outline=INK, width=4)
    d.rounded_rectangle([bx0 + 30, top - 40, bx0 + 200, top + 6], radius=18, fill=(225, 225, 230), outline=INK, width=4)  # pillow
    d.rectangle([bx0 + 20, top, bx1 - 10, top + 70], fill=(120, 80, 110) if night else (170, 90, 80), outline=INK, width=5)  # quilt
    for qx in range(bx0 + 20, bx1 - 10, 70):
        d.line([qx, top, qx, top + 70], fill=INK, width=2)
    d.rectangle([bx0 + 20, top + 70, bx1 - 10, sk], fill=(200, 200, 205) if night else (236, 232, 222), outline=INK, width=4)  # bed skirt
    for qx in range(bx0 + 40, bx1 - 10, 34):
        d.line([qx, top + 74, qx, sk], fill=(150, 150, 160), width=2)
    d.rectangle([bx0 + 20, sk, bx1 - 10, g['feet']], fill=(10, 10, 14))  # the dark gap under the bed
    # little wooden stool by the bed: picture books and a glass of ginger ale
    d.ellipse([1040, 690, 1200, 730], fill=(110, 72, 46), outline=INK, width=4)
    for lx in (1060, 1170):
        d.line([lx, 715, lx, 900], fill=INK, width=14)
    d.rectangle([1055, 660, 1150, 700], fill=(170, 60, 50), outline=INK, width=3)
    d.rectangle([1160, 640, 1188, 705], fill=(220, 180, 90), outline=INK, width=3)
    return im


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    bedroom(True).save(OUT / 'bedroom_night.png')
    bedroom(False).save(OUT / 'bedroom_day.png')
    print('ok', sorted(p.name for p in OUT.glob('*.png')))
