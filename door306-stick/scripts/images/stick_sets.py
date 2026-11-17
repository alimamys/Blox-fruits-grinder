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


def flat_bare(night=True):
    wall = (40, 52, 84) if night else (196, 186, 160)
    im = Image.new('RGB', (1920, 1080), wall)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 800, 1920, 1080], fill=(70, 56, 46) if night else (150, 112, 80))
    d.line([0, 800, 1920, 800], fill=INK, width=6)
    # the bedroom doorway at the far LEFT (open, the bed corner inside)
    d.rectangle([80, 250, 330, 805], fill=(14, 18, 30) if night else (120, 110, 96), outline=INK, width=6)
    d.rectangle([90, 640, 300, 760], fill=(140, 150, 180) if not night else (40, 44, 70), outline=INK, width=3)
    # window with blinds in the middle-left
    d.rectangle([620, 200, 1000, 560], fill=(30, 30, 40) if night else (220, 230, 236), outline=INK, width=6)
    for y in range(215, 555, 24):
        d.line([626, y, 994, y], fill=(200, 130, 60) if night else (236, 232, 216), width=8)
    # a worn rug on the floor in the middle
    d.rectangle([520, 860, 1300, 960], fill=(120, 60, 60) if night else (170, 80, 70), outline=INK, width=4)
    # the front door on the RIGHT with peephole, chain, deadbolt
    d.rectangle([1440, 250, 1700, 805], fill=(150, 120, 90), outline=INK, width=6)
    d.rectangle([1425, 235, 1715, 250], fill=(120, 96, 72), outline=INK, width=3)
    d.ellipse([1563, 390, 1577, 404], fill=(240, 230, 200), outline=INK, width=2)
    d.ellipse([1460, 540, 1480, 560], fill=(200, 180, 90), outline=INK)
    d.line([1462, 470, 1520, 500], fill=(200, 200, 200), width=4)
    return im


def hallway_persp_night():
    im = Image.new('RGB', (1920, 1080), (120, 120, 90))
    d = ImageDraw.Draw(im)
    vx, vy = 960, 520
    d.polygon([(0, 1080), (1920, 1080), (1080, 600), (840, 600)], fill=(56, 84, 56))  # green carpet
    d.polygon([(0, 0), (1920, 0), (1080, 420), (840, 420)], fill=(176, 176, 150))  # ceiling
    d.polygon([(0, 0), (840, 420), (840, 600), (0, 1080)], fill=(150, 146, 108), outline=INK)
    d.polygon([(1920, 0), (1080, 420), (1080, 600), (1920, 1080)], fill=(140, 136, 100), outline=INK)
    d.rectangle([840, 420, 1080, 600], fill=(16, 18, 22), outline=INK, width=4)  # the dark staircase opening at the end
    d.line([860, 520, 1060, 580], fill=(150, 150, 150), width=6)  # railing
    for a in (0.25, 0.5, 0.72):  # doors along both walls
        for side in (-1, 1):
            xo = vx + side * 960 * (1 - a)
            xi = vx + side * 960 * (1 - a - 0.12)
            yt0, yb0 = vy - 460 * (1 - a), vy + 560 * (1 - a)
            yt1, yb1 = vy - 460 * (1 - a - 0.12), vy + 560 * (1 - a - 0.12)
            d.polygon([(xo, yt0 * 0.9 + vy * 0.1), (xi, yt1 * 0.9 + vy * 0.1), (xi, yb1), (xo, yb0)], fill=(110, 74, 50), outline=INK)
    for k in (0.2, 0.45, 0.7):  # fluorescent tubes on the ceiling
        y = 420 * k
        d.rectangle([vx - 120 * (1 - k) - 40, y, vx + 120 * (1 - k) + 40, y + 14], fill=(240, 250, 210), outline=INK)
    return im


def hallway_day():
    im = hallway_night()
    return im


def stairwell_night():
    im = Image.new('RGB', (1920, 1080), (110, 120, 110))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 640, 1080], fill=(120, 120, 116))  # 3rd-floor landing (bottom left)
    d.rectangle([1360, 0, 1920, 380], fill=(110, 120, 110))
    d.rectangle([1360, 380, 1920, 1080], fill=(130, 130, 126))  # 4th-floor landing (top right)
    for i in range(12):  # the flight of concrete steps rising to the right
        x0 = 640 + i * 60
        y0 = 900 - i * 43
        d.rectangle([x0, y0 - 43, x0 + 60, y0], fill=(150, 150, 146), outline=INK, width=2)
        d.rectangle([x0, y0, x0 + 60, 1080], fill=(126, 126, 122))
    d.line([600, 760, 1380, 230], fill=(150, 150, 150), width=12)  # metal railing
    for i in range(14):
        x = 640 + i * 55
        d.line([x, 760 - (x - 600) * 0.68, x, 900 - (x - 640) * 0.717], fill=(140, 140, 140), width=5)
    d.rectangle([180, 380, 420, 900], fill=(110, 74, 50), outline=INK, width=5)  # a 3rd-floor apartment door
    d.rectangle([1500, 40, 1760, 60], fill=(240, 250, 210), outline=INK)  # light
    return im


def exterior(night=True):
    im = Image.new('RGB', (1920, 1080), (16, 22, 44) if night else (176, 204, 226))
    d = ImageDraw.Draw(im)
    d.rectangle([460, 80, 1460, 900], fill=(120, 60, 48), outline=INK, width=6)  # four-storey brick block
    for r in range(4):
        for c in range(5):
            x = 520 + c * 190
            y = 140 + r * 190
            lit = night and r == 0 and c == 2
            d.rectangle([x, y, x + 110, y + 130], fill=(240, 210, 130) if lit else ((20, 24, 40) if night else (150, 180, 200)), outline=INK, width=4)
    d.rectangle([880, 760, 1040, 900], fill=(60, 40, 30), outline=INK, width=4)  # entrance
    d.rectangle([0, 900, 1920, 1080], fill=(60, 60, 64))  # street + sidewalk
    d.rectangle([0, 900, 1920, 940], fill=(140, 140, 136))
    d.line([300, 300, 300, 900], fill=INK, width=10)  # street lamp
    d.ellipse([270, 270, 330, 320], fill=(255, 210, 120) if night else (200, 200, 190), outline=INK)
    return im


def lobby_day():
    im = Image.new('RGB', (1920, 1080), (190, 180, 160))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 820, 1920, 1080], fill=(150, 140, 126))
    for x in range(0, 1920, 80):
        d.line([x, 820, x, 1080], fill=(120, 112, 100), width=2)
    d.rectangle([300, 260, 1100, 700], fill=(150, 154, 160), outline=INK, width=6)  # wall of mailboxes
    for r in range(4):
        for c in range(6):
            x = 320 + c * 130
            y = 280 + r * 104
            d.rectangle([x, y, x + 116, y + 90], fill=(170, 174, 180), outline=INK, width=3)
            d.rectangle([x + 30, y + 14, x + 86, y + 30], fill=(230, 226, 210), outline=INK, width=1)
    d.rectangle([1380, 220, 1700, 820], fill=(150, 190, 210), outline=INK, width=6)  # glass entrance door
    return im


def office_day():
    im = Image.new('RGB', (1920, 1080), (170, 150, 120))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 820, 1920, 1080], fill=(110, 80, 56))
    d.rectangle([1260, 180, 1700, 560], fill=(200, 220, 230), outline=INK, width=6)  # window
    d.rectangle([380, 600, 1240, 640], fill=(110, 76, 50), outline=INK, width=5)  # desk top
    d.rectangle([400, 640, 1220, 830], fill=(100, 68, 44), outline=INK, width=5)
    d.rectangle([600, 470, 860, 600], fill=(60, 60, 66), outline=INK, width=4)  # laptop
    d.polygon([(1000, 600), (1060, 470), (1090, 480), (1040, 600)], fill=(200, 160, 90), outline=INK)  # desk lamp
    d.rectangle([100, 360, 300, 830], fill=(140, 140, 136), outline=INK, width=5)  # filing cabinet
    d.ellipse([740, 160, 860, 280], fill=(240, 236, 220), outline=INK, width=5)  # wall clock (blank face)
    return im


SETS.update({
    'flat_night_bare': lambda: flat_bare(True),
    'flat_day_bare': lambda: flat_bare(False),
    'hallway_persp_night': hallway_persp_night,
    'hallway_day': hallway_day,
    'stairwell_night': stairwell_night,
    'exterior_night': lambda: exterior(True),
    'exterior_day': lambda: exterior(False),
    'lobby_day': lobby_day,
    'office_day': office_day,
})

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n in (sys.argv[1:] or SETS):
        SETS[n]().save(OUT / f'{n}.png')
    print('ok')
