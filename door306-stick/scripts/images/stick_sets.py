#!/usr/bin/env python3
"""Rough flat layouts of the stick-figure "3:06" sets (front-on stage views); the image model repaints them.
    .venv/bin/python scripts/images/stick_sets.py [names]  -> build/layouts/<set>.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)


def flat_night():
    im = Image.new('RGB', (1920, 1080), (40, 52, 84))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 800, 1920, 1080], fill=(70, 56, 46))
    d.line([0, 800, 1920, 800], fill=INK, width=6)
    # window with blinds, orange streetlight stripes (left)
    d.rectangle([150, 180, 560, 560], fill=(30, 30, 40), outline=INK, width=6)
    for y in range(195, 555, 24):
        d.line([156, y, 554, y], fill=(200, 130, 60), width=8)
    # dining table + two chairs (left)
    d.rectangle([90, 640, 560, 670], fill=(110, 76, 50), outline=INK, width=4)
    for x in (110, 520):
        d.rectangle([x, 670, x + 20, 800], fill=(96, 66, 44), outline=INK, width=3)
    # sofa (middle)
    d.rounded_rectangle([700, 560, 1200, 700], radius=30, fill=(110, 90, 120), outline=INK, width=5)
    d.rectangle([680, 690, 1220, 800], fill=(96, 78, 106), outline=INK, width=5)
    # the front door (right) with a peephole, a chain and a deadbolt
    d.rectangle([1440, 250, 1700, 805], fill=(150, 120, 90), outline=INK, width=6)
    d.rectangle([1425, 235, 1715, 250], fill=(120, 96, 72), outline=INK, width=3)
    d.ellipse([1563, 390, 1577, 404], fill=(240, 230, 200), outline=INK, width=2)
    d.ellipse([1460, 540, 1480, 560], fill=(200, 180, 90), outline=INK)
    d.line([1462, 470, 1520, 500], fill=(200, 200, 200), width=4)
    d.rectangle([1458, 500, 1474, 520], fill=(200, 180, 90), outline=INK)
    # corridor opening to the bedroom (far right)
    d.rectangle([1780, 250, 1920, 805], fill=(18, 22, 36), outline=INK, width=4)
    return im


def hallway_night():
    im = Image.new('RGB', (1920, 1080), (150, 150, 110))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1920, 120], fill=(200, 200, 180))  # ceiling strip
    for x in (300, 900, 1500):
        d.rectangle([x, 120, x + 260, 142], fill=(240, 250, 210), outline=INK, width=3)  # fluorescent tubes
    d.rectangle([0, 830, 1920, 1080], fill=(60, 90, 60))  # worn green carpet
    d.line([0, 830, 1920, 830], fill=INK, width=6)
    d.rectangle([0, 800, 1920, 830], fill=(110, 96, 70), outline=INK, width=3)  # skirting
    # three apartment doors on the wall, Sarah's in the middle
    for x0 in (120, 760, 1240):
        d.rectangle([x0, 280, x0 + 250, 830], fill=(120, 80, 54), outline=INK, width=6)
        d.rectangle([x0 - 16, 264, x0 + 266, 280], fill=(90, 62, 44), outline=INK, width=3)
        d.ellipse([x0 + 118, 400, x0 + 132, 414], fill=(230, 220, 190), outline=INK, width=2)  # peephole
        d.ellipse([x0 + 205, 560, x0 + 225, 580], fill=(200, 180, 90), outline=INK)
        d.rectangle([x0 + 95, 320, x0 + 155, 350], fill=(200, 190, 150), outline=INK, width=2)  # number plate (blank)
    # the staircase at the far right: an opening with a metal railing going down
    d.rectangle([1640, 200, 1920, 830], fill=(20, 22, 26), outline=INK, width=5)
    for i in range(6):
        d.line([1660 + i * 40, 600 + i * 40, 1700 + i * 40, 600 + i * 40], fill=(90, 90, 90), width=10)
    d.line([1640, 560, 1920, 760], fill=(160, 160, 160), width=12)  # railing
    for x in range(1660, 1920, 50):
        d.line([x, 574 + (x - 1640) * 0.71, x, 690 + (x - 1640) * 0.71], fill=(150, 150, 150), width=5)
    return im


SETS = {'flat_night': flat_night, 'hallway_night': hallway_night}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n in (sys.argv[1:] or SETS):
        SETS[n]().save(OUT / f'{n}.png')
    print('ok')
