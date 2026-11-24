#!/usr/bin/env python3
"""The "unfinished drawing" versions of the sets (free, made in code): only the ink outlines of the
painted plate survive, as soft grey pencil lines on flat off-white paper. Same geometry as the plate,
so the film can fade from one into the other.
    python3 scripts/images/white_plates.py [sets]  -> public/plates/<set>_white.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PL = ROOT / 'public' / 'plates'
PAPER = (244, 243, 238)


def white(name: str) -> Image.Image:
    im = Image.open(PL / f'{name}.jpg').convert('RGB')
    g = im.convert('L')
    # ink = clearly darker than its surroundings (works on dark and light plates alike)
    local = g.filter(ImageFilter.GaussianBlur(9))
    diff = ImageChops.subtract(local, g).filter(ImageFilter.MedianFilter(5))  # >0 where darker than the neighbourhood; no paper grain
    ink = diff.point(lambda v: 255 if v > 16 else int(v * 255 / 16) if v > 6 else 0)
    ink = ink.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    # pencil: grey lines, a little lighter than black
    out = Image.new('RGB', im.size, PAPER)
    pencil = Image.new('RGB', im.size, (150, 150, 146))
    out.paste(pencil, (0, 0), ink.point(lambda v: int(v * 0.85)))
    return out


if __name__ == '__main__':
    for n in sys.argv[1:] or ['hall_side_night', 'hall_persp_night', 'room_front_night', 'room_side_night', 'closet_night']:
        white(n).save(PL / f'{n}_white.jpg', quality=90)
        print('white', n)
