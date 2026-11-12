#!/usr/bin/env python3
"""Rough flat layouts for every set of the stick-figure "Mr. Widemouth" (front-on "stage" views, so the
code-drawn characters can walk, sit and hide in them). The image model repaints them (stick_plates.py);
the positions here are what the code uses, so they are also written to src/data/generated/sets.json.

    .venv/bin/python scripts/images/stick_sets.py      # -> build/layouts/<set>.png + sets.json
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)
GEO: dict[str, dict] = {}


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def canvas(top, bottom=None, split=1080):
    im = Image.new('RGB', (1920, 1080), top)
    d = ImageDraw.Draw(im)
    if bottom:
        d.rectangle([0, split, 1920, 1080], fill=bottom)
    return im, d


def pines(d, x0, x1, base, hmin, hmax, col, step=70, seed=1):
    for i, px in enumerate(range(x0, x1, step)):
        h = hmin + ((i * 37 + seed * 11) % max(1, hmax - hmin))
        d.polygon([(px - 40, base), (px, base - h), (px + 40, base)], fill=col)


def farmhouse(d, x0, y0, w, h, wall, roof, win, lit=None):
    """Two-storey farmhouse: body, gable roof, porch; returns window rects (upstairs)."""
    d.polygon([(x0 - 20, y0), (x0 + w // 2, y0 - h * 0.45), (x0 + w + 20, y0)], fill=roof, outline=INK)
    d.rectangle([x0, y0, x0 + w, y0 + h], fill=wall, outline=INK, width=4)
    wins = []
    n = 3
    for i in range(n):
        wx = x0 + w * (i + 0.5) / n - w * 0.06
        r = (int(wx), int(y0 + h * 0.12), int(wx + w * 0.12), int(y0 + h * 0.42))
        d.rectangle(r, fill=lit if (lit and i == 1) else win, outline=INK, width=3)
        wins.append(r)
    for i in range(n):
        wx = x0 + w * (i + 0.5) / n - w * 0.06
        if i == 1:
            d.rectangle([int(wx), int(y0 + h * 0.6), int(wx + w * 0.12), int(y0 + h)], fill=shade(wall, 0.6), outline=INK, width=3)  # door
        else:
            d.rectangle([int(wx), int(y0 + h * 0.58), int(wx + w * 0.12), int(y0 + h * 0.86)], fill=win, outline=INK, width=3)
    d.rectangle([x0 - 10, int(y0 + h * 0.52), x0 + w + 10, int(y0 + h * 0.56)], fill=roof, outline=INK)  # porch roof
    return wins


# ---------------------------------------------------------------- night drive
def driveway_night():
    im, d = canvas((16, 24, 48))
    d.ellipse([200, 90, 260, 150], fill=(230, 230, 210))
    pines(d, 0, 900, 720, 140, 260, (10, 16, 26))
    d.polygon([(600, 760), (1150, 470), (1500, 420), (1920, 400), (1920, 1080), (600, 1080)], fill=(22, 34, 40))
    wins = farmhouse(d, 1330, 250, 450, 220, (150, 156, 170), (52, 56, 66), (24, 30, 46), lit=(170, 150, 90))
    d.rectangle([0, 760, 1920, 1080], fill=(26, 34, 36))
    d.rectangle([0, 860, 1920, 990], fill=(84, 84, 86))  # gravel driveway
    for x in range(0, 1920, 23):
        d.point((x, 900 + (x * 7) % 70), fill=(120, 120, 120))
    GEO['driveway_night'] = {'ground': 975, 'window': list(wins[1]), 'night': True}
    return im


def window_out_night():
    im, d = canvas((70, 84, 110))
    for y in range(0, 1080, 46):
        d.line([0, y, 1920, y], fill=(48, 58, 80), width=4)  # clapboards
    d.rectangle([600, 90, 1320, 960], fill=(196, 200, 206), outline=INK, width=6)  # trim
    d.rectangle([660, 150, 1260, 500], fill=(18, 22, 34), outline=INK, width=5)  # upper sash, 4 panes
    d.line([960, 150, 960, 500], fill=(196, 200, 206), width=14)
    d.line([660, 325, 1260, 325], fill=(196, 200, 206), width=14)
    d.rectangle([660, 520, 1260, 860], fill=(30, 26, 32), outline=INK, width=5)  # lower sash, one clear pane
    d.rectangle([600, 860, 1320, 905], fill=(220, 222, 226), outline=INK, width=5)  # outside sill
    GEO['window_out_night'] = {'pane': [672, 532, 1248, 852], 'sill': 852, 'night': True}
    return im


# ---------------------------------------------------------------- day exteriors
def farmhouse_day():
    im, d = canvas((176, 204, 222))
    pines(d, 0, 1920, 640, 90, 200, (70, 100, 78), step=90, seed=3)
    d.polygon([(0, 700), (500, 600), (1100, 560), (1920, 620), (1920, 1080), (0, 1080)], fill=(120, 150, 90))
    farmhouse(d, 860, 260, 640, 380, (232, 230, 222), (96, 100, 110), (90, 110, 130))
    d.rectangle([1080, 640, 1280, 700], fill=(150, 120, 90), outline=INK, width=3)  # porch steps
    d.rectangle([0, 800, 1920, 1080], fill=(150, 126, 96))  # dirt driveway / yard
    GEO['farmhouse_day'] = {'ground': 930, 'door': [1150, 560], 'night': False}
    return im


def road_day():
    im, d = canvas((178, 200, 216))
    d.polygon([(0, 620), (400, 520), (900, 600), (1400, 500), (1920, 590), (1920, 1080), (0, 1080)], fill=(110, 140, 96))
    pines(d, 0, 1920, 700, 100, 220, (60, 90, 70), step=80, seed=5)
    d.rectangle([0, 760, 1920, 930], fill=(92, 92, 96))
    for x in range(0, 1920, 160):
        d.rectangle([x, 838, x + 80, 850], fill=(220, 210, 160))
    d.rectangle([0, 930, 1920, 1080], fill=(116, 140, 90))
    GEO['road_day'] = {'ground': 905, 'night': False}
    return im


def porch_day():
    im, d = canvas((222, 222, 212))
    for y in range(0, 700, 40):
        d.line([0, y, 820, y], fill=(196, 196, 186), width=3)
    d.rectangle([820, 0, 1920, 760], fill=(176, 200, 214))
    pines(d, 900, 1920, 700, 160, 300, (66, 92, 72), step=85, seed=7)
    d.rectangle([820, 700, 1920, 1080], fill=(120, 150, 90))
    d.rectangle([200, 260, 360, 620], fill=(120, 90, 66), outline=INK, width=4)  # back door
    d.rectangle([0, 620, 820, 680], fill=(150, 116, 84), outline=INK, width=4)  # porch deck
    for i in range(4):  # steps
        d.rectangle([820 + i * 40, 640 + i * 60, 1000 + i * 40, 680 + i * 60], fill=(150, 116, 84), outline=INK, width=3)
    for x in range(30, 800, 60):
        d.line([x, 470, x, 620], fill=(230, 230, 220), width=8)
    d.rectangle([0, 450, 800, 475], fill=(230, 230, 220), outline=INK, width=3)
    d.rectangle([0, 680, 820, 1080], fill=(100, 80, 60))
    GEO['porch_day'] = {'deck': 622, 'ground': 950, 'stepsX': [830, 1150], 'night': False}
    return im


def woods_edge():
    im, d = canvas((190, 196, 196))
    d.rectangle([0, 230, 1920, 780], fill=(44, 60, 48))
    for x in range(0, 1920, 55):
        d.line([x, 230, x + 10, 780], fill=(34, 40, 36), width=10)
    d.polygon([(900, 780), (1020, 780), (990, 420), (930, 420)], fill=(14, 18, 16))  # trail opening
    d.rectangle([0, 780, 1920, 1080], fill=(150, 150, 100))
    d.polygon([(880, 1080), (1060, 1080), (1010, 780), (920, 780)], fill=(120, 100, 76))  # the deer trail
    GEO['woods_edge'] = {'ground': 950, 'trail': [960, 780], 'night': False}
    return im


def woods_trail():
    im, d = canvas((150, 160, 150))
    for i, x in enumerate(range(-40, 1960, 150)):
        w = 30 + (i * 17) % 40
        d.rectangle([x, 0, x + w, 800], fill=(80, 74, 66), outline=INK, width=3)
    d.rectangle([0, 800, 1920, 1080], fill=(110, 90, 64))
    d.rectangle([0, 870, 1920, 950], fill=(140, 118, 84))  # the trail
    for x in (60, 1700):
        d.rectangle([x, 0, x + 120, 1080], fill=(56, 50, 44), outline=INK, width=4)
    GEO['woods_trail'] = {'ground': 920, 'night': False}
    return im


def ruins_day():
    im, d = canvas((176, 182, 186))
    pines(d, 1300, 1920, 640, 160, 280, (60, 80, 66), step=80, seed=9)
    d.rectangle([0, 640, 1920, 1080], fill=(126, 140, 96))
    d.polygon([(560, 720), (1360, 720), (1420, 840), (500, 840)], fill=(120, 116, 110), outline=INK)  # foundation
    d.polygon([(600, 740), (1320, 740), (1360, 820), (560, 820)], fill=(70, 80, 60))
    for x in (700, 980, 1210):
        d.rectangle([x, 560, x + 26, 740], fill=(40, 34, 30), outline=INK, width=3)  # charred posts
    GEO['ruins_day'] = {'ground': 950, 'night': False}
    return im


def cemetery_day():
    im, d = canvas((170, 176, 178))
    pines(d, 0, 1920, 560, 160, 300, (56, 70, 60), step=70, seed=11)
    d.rectangle([0, 560, 1920, 1080], fill=(110, 124, 92))
    rows = [(600, 0.45), (680, 0.6), (780, 0.8), (900, 1.0)]
    for y, k in rows:
        for x in range(int(160 * k), 1920, int(190 * k)):
            w, h = int(60 * k), int(90 * k)
            d.rounded_rectangle([x, y - h, x + w, y], radius=int(26 * k), fill=(150, 150, 146), outline=INK, width=3)
    GEO['cemetery_day'] = {'ground': 1000, 'night': False}
    return im


# ---------------------------------------------------------------- interiors
BED = dict(floor=760, bed_x0=150, bed_x1=990, mattress=610, skirt_bottom=868, feet=880)


def bed(d, quilt, skirt, wood=(110, 72, 46)):
    g = BED
    bx0, bx1, top, sk = g['bed_x0'], g['bed_x1'], g['mattress'], g['skirt_bottom']
    d.rectangle([bx0 - 30, 330, bx0 + 20, g['feet']], fill=wood, outline=INK, width=5)
    d.ellipse([bx0 - 40, 300, bx0 + 30, 350], fill=wood, outline=INK, width=4)
    d.rectangle([bx1 - 10, 520, bx1 + 30, g['feet']], fill=wood, outline=INK, width=5)
    d.ellipse([bx1 - 20, 490, bx1 + 40, 535], fill=wood, outline=INK, width=4)
    d.rounded_rectangle([bx0 + 30, top - 40, bx0 + 200, top + 6], radius=18, fill=(225, 225, 230), outline=INK, width=4)
    d.rectangle([bx0 + 20, top, bx1 - 10, top + 70], fill=quilt, outline=INK, width=5)
    d.rectangle([bx0 + 20, top + 70, bx1 - 10, sk], fill=skirt, outline=INK, width=4)
    for qx in range(bx0 + 40, bx1 - 10, 34):
        d.line([qx, top + 74, qx, sk], fill=shade(skirt, 0.8), width=2)
    d.rectangle([bx0 + 20, sk, bx1 - 10, g['feet']], fill=(10, 10, 14))


def leoroom_day():
    im, d = canvas((150, 190, 200))
    d.rectangle([0, BED['floor'], 1920, 1080], fill=(170, 130, 96))
    d.line([0, BED['floor'], 1920, BED['floor']], fill=INK, width=6)
    d.rectangle([1150, 160, 1500, 540], fill=(220, 236, 250), outline=INK, width=8)  # window, morning
    d.line([1325, 160, 1325, 540], fill=(250, 250, 250), width=12)
    d.rectangle([1600, 300, 1880, 330], fill=(120, 90, 60), outline=INK, width=3)  # shelf with toy dinosaurs
    for x in (1620, 1700, 1780):
        d.ellipse([x, 250, x + 60, 300], fill=(90, 160, 90), outline=INK, width=3)
    d.ellipse([1300, 880, 1800, 1000], fill=(220, 120, 90), outline=INK, width=4)  # rug
    bed(d, (60, 120, 190), (120, 170, 220), wood=(220, 220, 220))
    GEO['leoroom_day'] = {**BED, 'night': False}
    return im


def hallway():
    im, d = canvas((120, 104, 90))
    vx, vy = 960, 520
    d.polygon([(0, 1080), (1920, 1080), (1110, 660), (810, 660)], fill=(92, 66, 48))  # floor
    d.polygon([(0, 0), (1920, 0), (1110, 360), (810, 360)], fill=(150, 140, 126))  # ceiling
    d.polygon([(0, 0), (810, 360), (810, 660), (0, 1080)], fill=(128, 112, 96), outline=INK)  # left wall
    d.polygon([(1920, 0), (1110, 360), (1110, 660), (1920, 1080)], fill=(118, 102, 88), outline=INK)  # right wall
    d.rectangle([810, 360, 1110, 660], fill=(136, 120, 104), outline=INK, width=4)  # end wall
    d.rectangle([905, 440, 1015, 660], fill=(90, 64, 46), outline=INK, width=4)  # the door at the very end
    d.polygon([(860, 1080), (1060, 1080), (1000, 660), (920, 660)], fill=(120, 50, 46))  # runner rug
    for (a, b) in ((0.25, 0.4), (0.55, 0.68)):  # side doors in perspective
        for side in (-1, 1):
            xa = vx + side * (960 - (960 - 150) * a) * 1.0
            d.line([int(vx + side * 960 * (1 - a)), int(vy + 560 * (1 - a)), int(vx + side * 960 * (1 - a)), int(vy - 300 * (1 - a))], fill=INK, width=4)
    GEO['hallway'] = {'horizon': 520, 'near': 1060, 'far': 660, 'endDoor': [905, 440, 1015, 660], 'night': False}
    return im


def emptyroom():
    im, d = canvas((150, 142, 128))
    d.rectangle([0, 760, 1920, 1080], fill=(120, 92, 66))
    for y in range(790, 1080, 50):
        d.line([0, y, 1920, y], fill=(96, 72, 52), width=3)
    d.line([0, 760, 1920, 760], fill=INK, width=6)
    d.rectangle([700, 140, 1220, 735], fill=(220, 220, 214), outline=INK, width=6)  # trim
    d.rectangle([760, 180, 1160, 700], fill=(178, 196, 214))  # open (no glass): sky
    pines(d, 760, 1160, 700, 40, 90, (80, 110, 86), step=50, seed=13)  # treetops far below
    d.rectangle([680, 700, 1240, 740], fill=(230, 230, 224), outline=INK, width=4)  # sill
    GEO['emptyroom'] = {'opening': [760, 180, 1160, 700], 'sill': 700, 'floor': 760, 'ground': 960, 'night': False}
    return im


def window_down():
    im, d = canvas((110, 140, 90))
    d.polygon([(0, 0), (700, 0), (840, 900), (0, 900)], fill=(210, 210, 204))  # the house wall going down (left)
    for i in range(14):
        y = i * 64
        d.line([0, y, 700 + 140 * y / 900, y], fill=(170, 170, 164), width=3)
    for (x, y, r) in ((1300, 300, 40), (1500, 600, 60), (1000, 650, 30)):
        d.ellipse([x - r, y - r // 2, x + r, y + r // 2], fill=(130, 130, 124), outline=INK, width=3)  # rocks
    d.rectangle([0, 900, 1920, 1080], fill=(236, 236, 230), outline=INK, width=6)  # the sill, close
    d.rectangle([0, 0, 60, 900], fill=(230, 230, 224), outline=INK, width=4)
    d.rectangle([1860, 0, 1920, 900], fill=(230, 230, 224), outline=INK, width=4)
    GEO['window_down'] = {'ground': [1060, 520], 'sill': 900, 'night': False}
    return im


def kitchen_night():
    im, d = canvas((96, 78, 60))
    d.rectangle([0, 800, 1920, 1080], fill=(74, 58, 46))
    d.line([0, 800, 1920, 800], fill=INK, width=6)
    d.rectangle([1440, 200, 1760, 470], fill=(20, 26, 44), outline=INK, width=6)  # window over the sink
    d.line([1600, 200, 1600, 470], fill=(210, 200, 180), width=10)
    d.rectangle([1100, 80, 1920, 180], fill=(130, 96, 66), outline=INK, width=4)  # upper cabinets
    d.rectangle([1100, 580, 1920, 800], fill=(140, 104, 72), outline=INK, width=4)  # base cabinets
    d.rectangle([1090, 560, 1920, 590], fill=(200, 190, 170), outline=INK, width=4)  # counter top
    for x in range(1120, 1900, 200):
        d.rectangle([x, 605, x + 170, 650], fill=(150, 112, 78), outline=INK, width=3)  # drawers
    d.rectangle([300, 680, 900, 710], fill=(120, 84, 56), outline=INK, width=4)  # table
    for x in (330, 860):
        d.rectangle([x, 710, x + 20, 880], fill=(100, 70, 46), outline=INK, width=3)
    d.line([600, 0, 600, 300], fill=INK, width=4)
    d.polygon([(540, 300), (660, 300), (630, 260), (570, 260)], fill=(230, 200, 120), outline=INK)  # lamp
    GEO['kitchen_night'] = {'ground': 930, 'drawer': [1320, 605, 1490, 650], 'table': [300, 680, 900, 710], 'night': True}
    return im


def bedroom(night):
    from stick_layouts import bedroom as b  # noqa
    return b(night)


SETS = {
    'driveway_night': driveway_night,
    'window_out_night': window_out_night,
    'farmhouse_day': farmhouse_day,
    'road_day': road_day,
    'porch_day': porch_day,
    'woods_edge': woods_edge,
    'woods_trail': woods_trail,
    'ruins_day': ruins_day,
    'cemetery_day': cemetery_day,
    'leoroom_day': leoroom_day,
    'hallway': hallway,
    'emptyroom': emptyroom,
    'window_down': window_down,
    'kitchen_night': kitchen_night,
}

if __name__ == '__main__':
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in SETS.items():
        fn().save(OUT / f'{name}.png')
    GEO['bedroom_night'] = {**BED, 'night': True}
    GEO['bedroom_day'] = {**BED, 'night': False}
    gen = ROOT / 'src' / 'data' / 'generated' / 'sets.json'
    gen.write_text(json.dumps(GEO, indent=1))
    print('ok', len(SETS), 'layouts ->', OUT)
