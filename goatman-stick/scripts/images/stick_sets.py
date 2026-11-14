#!/usr/bin/env python3
"""Rough flat layouts for every set of the stick-figure Goatman film (front-on stage views).
    .venv/bin/python scripts/images/stick_sets.py   -> build/layouts/<set>.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)


def sh(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def pines(d, x0, x1, base, hmin, hmax, col, step=70, seed=1):
    for i, px in enumerate(range(x0, x1, step)):
        h = hmin + ((i * 37 + seed * 11) % max(1, hmax - hmin))
        d.polygon([(px - 42, base), (px, base - h), (px + 42, base)], fill=col)


def trailer_inside(night):
    wall = (120, 96, 70) if night else (176, 160, 130)
    im = Image.new('RGB', (1920, 1080), wall)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 760, 1920, 1080], fill=(96, 76, 56) if night else (140, 116, 88))
    d.line([0, 760, 1920, 760], fill=INK, width=6)
    d.rectangle([0, 0, 1920, 60], fill=sh(wall, 0.85), outline=INK)  # low ceiling
    # kitchenette, left: cabinets, counter, two-burner stove with a pot
    d.rectangle([40, 90, 540, 260], fill=(150, 120, 86), outline=INK, width=4)
    d.rectangle([40, 560, 540, 760], fill=(150, 120, 86), outline=INK, width=4)
    d.rectangle([30, 540, 550, 566], fill=(214, 206, 186), outline=INK, width=4)
    d.rectangle([170, 500, 390, 540], fill=(70, 70, 74), outline=INK, width=4)
    d.ellipse([220, 470, 330, 510], fill=(150, 154, 160), outline=INK, width=3)
    # built-in bench along the back wall, window with blinds above it
    d.rectangle([600, 560, 1360, 700], fill=(120, 60, 50), outline=INK, width=4)
    d.rectangle([590, 690, 1370, 770], fill=(104, 52, 44), outline=INK, width=4)
    d.rectangle([760, 210, 1200, 470], fill=(20, 26, 40) if night else (200, 214, 222), outline=INK, width=6)
    for y in range(225, 465, 22):
        d.line([766, y, 1194, y], fill=(220, 214, 196), width=6)
    # the front door (with a small window), then the narrow bathroom door at the far right
    d.rectangle([1440, 220, 1640, 760], fill=(196, 190, 176), outline=INK, width=5)
    d.rectangle([1490, 280, 1590, 380], fill=(20, 26, 40) if night else (200, 214, 222), outline=INK, width=4)
    d.ellipse([1600, 480, 1622, 502], fill=(200, 180, 90), outline=INK)
    d.rectangle([1720, 250, 1890, 760], fill=(170, 150, 120), outline=INK, width=5)
    d.ellipse([1730, 500, 1750, 520], fill=(200, 180, 90), outline=INK)
    if night:
        d.polygon([(900, 60), (1020, 60), (1000, 100), (920, 100)], fill=(240, 210, 130), outline=INK)  # ceiling lamp
    return im


def clearing(night):
    sky = (14, 22, 40) if night else (176, 200, 214)
    im = Image.new('RGB', (1920, 1080), sky)
    d = ImageDraw.Draw(im)
    pines(d, -40, 1980, 560, 260, 420, (10, 16, 18) if night else (56, 86, 62), step=80, seed=3)
    d.rectangle([0, 560, 1920, 1080], fill=(36, 34, 28) if night else (120, 108, 76))  # dirt clearing
    # second trailer, small, far left; main trailer centre-right with its door and steps
    d.rounded_rectangle([60, 400, 560, 640], radius=40, fill=(150, 150, 140), outline=INK, width=4)
    d.rounded_rectangle([880, 300, 1720, 780], radius=60, fill=(196, 190, 170) if not night else (110, 108, 100), outline=INK, width=6)
    d.rectangle([880, 560, 1720, 600], fill=(150, 120, 80), outline=INK)
    d.rectangle([1100, 420, 1230, 760], fill=(160, 150, 130), outline=INK, width=5)  # door
    d.rectangle([1300, 400, 1600, 520], fill=(240, 210, 130) if night else (60, 70, 80), outline=INK, width=5)  # window
    for i in range(3):
        d.rectangle([1080 - i * 0, 760 + i * 36, 1250, 790 + i * 36], fill=(110, 110, 114), outline=INK, width=3)  # metal steps
    # stone fire ring with ashes, front centre
    d.ellipse([640, 880, 900, 960], fill=(60, 54, 48), outline=INK, width=4)
    for a in range(0, 360, 30):
        import math
        x = 770 + 130 * math.cos(math.radians(a))
        y = 920 + 40 * math.sin(math.radians(a))
        d.ellipse([x - 18, y - 12, x + 18, y + 12], fill=(130, 126, 120), outline=INK, width=2)
    # a couple of logs to sit on
    d.rounded_rectangle([300, 900, 560, 940], radius=18, fill=(110, 76, 46), outline=INK, width=4)
    d.rounded_rectangle([980, 930, 1240, 970], radius=18, fill=(110, 76, 46), outline=INK, width=4)
    return im


def trail(night):
    im = Image.new('RGB', (1920, 1080), (12, 16, 22) if night else (150, 170, 160))
    d = ImageDraw.Draw(im)
    for i, x in enumerate(range(-40, 1960, 140)):
        w = 34 + (i * 17) % 30
        d.rectangle([x, 0, x + w, 860], fill=(26, 26, 24) if night else (90, 74, 60), outline=INK, width=3)
    pines(d, -40, 1980, 520, 300, 460, (14, 20, 18) if night else (60, 90, 66), step=95, seed=5)
    d.rectangle([0, 820, 1920, 1080], fill=(30, 28, 22) if night else (96, 84, 60))
    d.rectangle([0, 880, 1920, 960], fill=(54, 46, 34) if night else (150, 126, 90))  # the trail
    for x in (40, 1740):
        d.rectangle([x, 0, x + 140, 1080], fill=(18, 16, 14) if night else (60, 48, 40), outline=INK, width=4)
    return im


def creek():
    im = Image.new('RGB', (1920, 1080), (170, 200, 214))
    d = ImageDraw.Draw(im)
    pines(d, -40, 1980, 520, 220, 380, (60, 92, 66), step=80, seed=7)
    d.rectangle([0, 520, 1920, 700], fill=(110, 140, 80))  # far bank
    d.rectangle([0, 700, 1920, 900], fill=(80, 130, 140))  # the water
    for y in range(720, 900, 30):
        d.line([0, y, 1920, y], fill=(120, 170, 180), width=3)
    d.rectangle([0, 900, 1920, 1080], fill=(150, 130, 90))  # near bank
    for x in range(1300, 1900, 90):
        d.ellipse([x - 70, 560, x + 70, 720], fill=(60, 100, 56), outline=INK, width=3)  # bushes on the far bank
    return im


def farm():
    im = Image.new('RGB', (1920, 1080), (180, 200, 214))
    d = ImageDraw.Draw(im)
    pines(d, -40, 1980, 560, 220, 380, (56, 86, 62), step=80, seed=9)
    d.rectangle([0, 560, 1920, 1080], fill=(126, 140, 86))
    d.polygon([(1300, 300), (1560, 160), (1820, 300)], fill=(120, 60, 50), outline=INK)
    d.rectangle([1320, 300, 1800, 640], fill=(220, 214, 196), outline=INK, width=5)
    d.rectangle([1500, 460, 1590, 640], fill=(110, 80, 56), outline=INK, width=4)
    d.rectangle([1360, 360, 1450, 440], fill=(70, 90, 110), outline=INK, width=4)
    d.rectangle([1650, 360, 1740, 440], fill=(70, 90, 110), outline=INK, width=4)
    d.rectangle([1440, 640, 1650, 680], fill=(150, 120, 90), outline=INK, width=3)  # porch step
    # pigpen with a broken fence, left of centre; muddy ground
    d.ellipse([200, 760, 900, 900], fill=(100, 80, 56))
    for x in range(200, 900, 70):
        if 480 < x < 640:
            continue
        d.rectangle([x, 700, x + 14, 840], fill=(130, 100, 70), outline=INK, width=2)
    d.line([200, 730, 470, 730], fill=(130, 100, 70), width=10)
    d.line([650, 730, 900, 730], fill=(130, 100, 70), width=10)
    d.line([470, 730, 520, 800], fill=(130, 100, 70), width=10)  # the broken rail
    return im


def bathroom():
    im = Image.new('RGB', (1920, 1080), (170, 170, 160))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 800, 1920, 1080], fill=(120, 120, 116))
    d.rectangle([700, 180, 1220, 600], fill=(220, 220, 214), outline=INK, width=8)
    d.rectangle([740, 220, 1180, 560], fill=(10, 14, 20))  # wide open, no screen: dark woods
    pines(d, 740, 1180, 560, 120, 240, (4, 6, 8), step=60, seed=11)
    d.rectangle([680, 600, 1240, 630], fill=(230, 230, 224), outline=INK, width=4)  # sill
    d.rectangle([220, 520, 520, 800], fill=(236, 236, 230), outline=INK, width=4)  # sink cabinet
    d.ellipse([1400, 620, 1660, 760], fill=(236, 236, 230), outline=INK, width=4)  # toilet
    d.rectangle([1440, 460, 1620, 640], fill=(236, 236, 230), outline=INK, width=4)
    return im


def apartment():
    im = Image.new('RGB', (1920, 1080), (130, 120, 108))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 780, 1920, 1080], fill=(110, 80, 56))
    d.line([0, 780, 1920, 780], fill=INK, width=6)
    d.rectangle([180, 160, 640, 520], fill=(20, 30, 50), outline=INK, width=6)  # big window: city at night
    for i, x in enumerate(range(200, 640, 60)):
        h = 120 + (i * 53) % 180
        d.rectangle([x, 520 - h, x + 40, 520], fill=(40, 46, 64))
        d.rectangle([x + 10, 520 - h + 20, x + 18, 520 - h + 30], fill=(240, 210, 120))
    d.rounded_rectangle([560, 560, 1320, 760], radius=40, fill=(70, 86, 110), outline=INK, width=5)  # couch
    d.rectangle([520, 740, 1360, 800], fill=(60, 74, 96), outline=INK, width=5)
    d.rectangle([620, 830, 1260, 880], fill=(130, 96, 66), outline=INK, width=5)  # coffee table
    d.rectangle([640, 880, 660, 960], fill=(100, 70, 46))
    d.rectangle([1220, 880, 1240, 960], fill=(100, 70, 46))
    # the hallway on the right, the bathroom door at its end, shut
    d.polygon([(1460, 140), (1900, 0), (1900, 1080), (1460, 800)], fill=(110, 100, 90), outline=INK)
    d.rectangle([1560, 300, 1700, 720], fill=(200, 194, 180), outline=INK, width=5)
    d.ellipse([1672, 500, 1690, 518], fill=(200, 180, 90), outline=INK)
    return im


def city():
    im = Image.new('RGB', (1920, 1080), (16, 22, 44))
    d = ImageDraw.Draw(im)
    for i, x in enumerate(range(0, 1920, 120)):
        h = 300 + (i * 97) % 420
        d.rectangle([x, 1080 - h - 200, x + 100, 1080], fill=(30, 36, 56), outline=INK, width=3)
        for wy in range(1080 - h - 180, 1000, 50):
            for wx in range(x + 14, x + 90, 30):
                if (wx + wy + i) % 3 == 0:
                    d.rectangle([wx, wy, wx + 14, wy + 22], fill=(240, 210, 120))
    d.rectangle([0, 980, 1920, 1080], fill=(40, 40, 46))
    return im


SETS = {
    'trailer_night': lambda: trailer_inside(True),
    'trailer_day': lambda: trailer_inside(False),
    'clearing_night': lambda: clearing(True),
    'clearing_day': lambda: clearing(False),
    'trail_night': lambda: trail(True),
    'trail_day': lambda: trail(False),
    'creek_day': creek,
    'farm_day': farm,
    'bathroom_night': bathroom,
    'apartment_night': apartment,
    'city_night': city,
}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n, fn in SETS.items():
        fn().save(OUT / f'{n}.png')
    print('ok', len(SETS))
