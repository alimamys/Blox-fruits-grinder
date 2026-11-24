#!/usr/bin/env python3
"""Rough flat layouts of the stick-figure "The Rake" sets (front-on stage views); the image model repaints them.
Characters are never in the plates: Lily, her family and the thing are drawn and animated in code on top.
    .venv/bin/python scripts/images/stick_sets.py [names]  -> build/layouts/<set>.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)


def side_bed(d, x0, x1, top, floor, quilt=(70, 60, 110)):
    """a bed seen from the side: headboard at x0 (left), footboard at x1 (right), quilt, skirt to the floor"""
    d.rectangle([x0 - 30, top - 230, x0, floor], fill=(110, 80, 60), outline=INK, width=6)  # headboard
    d.rectangle([x1 - 10, top - 90, x1 + 20, floor], fill=(110, 80, 60), outline=INK, width=6)  # footboard
    d.rectangle([x0, top, x1 - 10, top + 70], fill=quilt, outline=INK, width=6)  # mattress + quilt
    d.rectangle([x0, top + 70, x1 - 10, floor - 18], fill=(225, 220, 205), outline=INK, width=4)  # bed skirt
    d.ellipse([x0 + 10, top - 34, x0 + 170, top + 14], fill=(235, 235, 240), outline=INK, width=4)  # pillow


def bedroom_night():
    """Lily's little bedroom (it used to be her dad's), side stage view: the bed along the floor, a nightstand, a window, the door."""
    im = Image.new('RGB', (1920, 1080), (52, 62, 96))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 880, 1920, 1080], fill=(80, 60, 46))
    d.line([0, 880, 1920, 880], fill=INK, width=6)
    d.rectangle([520, 150, 860, 460], fill=(20, 28, 54), outline=INK, width=8)  # window
    d.line([690, 150, 690, 460], fill=INK, width=6)
    d.ellipse([560, 190, 640, 270], fill=(230, 230, 210))  # moon
    d.rectangle([480, 130, 900, 150], fill=(90, 70, 60), outline=INK, width=3)  # curtain rod
    for x in (480, 860):
        d.rectangle([x, 150, x + 40, 520], fill=(120, 90, 130), outline=INK, width=3)  # curtains
    side_bed(d, 260, 1100, 600, 880)
    d.rectangle([90, 660, 230, 880], fill=(110, 80, 60), outline=INK, width=5)  # nightstand
    d.rectangle([115, 610, 205, 660], fill=(40, 40, 46), outline=INK, width=4)  # alarm clock, blank face
    d.rectangle([1420, 230, 1700, 882], fill=(130, 100, 76), outline=INK, width=6)  # door (closed)
    d.ellipse([1440, 560, 1462, 582], fill=(200, 180, 90), outline=INK)
    d.rectangle([1260, 700, 1380, 880], fill=(150, 110, 80), outline=INK, width=4)  # toy chest
    return im


def bedroom_pov_night():
    """Looking down the bed from the pillow: the quilt fills the bottom of the frame and runs away to the footboard;
    beyond it the dark room, the closed door, a window with moonlight."""
    im = Image.new('RGB', (1920, 1080), (40, 48, 78))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 640, 1920, 1080], fill=(70, 52, 40))  # floor beyond the bed
    d.polygon([(-200, 1080), (2120, 1080), (1320, 640), (600, 640)], fill=(70, 60, 110), outline=INK)  # quilt in perspective
    for t in (0.25, 0.5, 0.75):
        y = 640 + (1080 - 640) * t
        xl = 600 + (-200 - 600) * t
        xr = 1320 + (2120 - 1320) * t
        d.line([xl, y, xr, y], fill=(50, 44, 86), width=4)
    d.rectangle([560, 560, 1360, 650], fill=(110, 80, 60), outline=INK, width=6)  # footboard
    d.rectangle([840, 180, 1080, 560], fill=(120, 92, 70), outline=INK, width=6)  # door far away
    d.rectangle([140, 160, 460, 440], fill=(20, 28, 54), outline=INK, width=8)  # window, left
    d.ellipse([200, 200, 270, 270], fill=(230, 230, 210))
    return im


def master_night():
    """Her parents' bedroom at night, side stage view: a double bed, nightstands, a window; the right-hand wall is the one
    her little bedroom is behind."""
    im = Image.new('RGB', (1920, 1080), (50, 58, 88))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 885, 1920, 1080], fill=(84, 62, 48))
    d.line([0, 885, 1920, 885], fill=INK, width=6)
    d.rectangle([1250, 150, 1580, 450], fill=(20, 28, 54), outline=INK, width=8)  # window
    d.line([1415, 150, 1415, 450], fill=INK, width=6)
    side_bed(d, 380, 1150, 610, 885, quilt=(140, 120, 90))
    d.ellipse([400, 576, 560, 624], fill=(235, 235, 240), outline=INK, width=4)  # second pillow
    d.rectangle([200, 670, 350, 885], fill=(110, 80, 60), outline=INK, width=5)  # nightstand + lamp
    d.rectangle([255, 600, 295, 670], fill=(90, 90, 96), outline=INK, width=3)
    d.polygon([(235, 600), (315, 600), (300, 550), (250, 550)], fill=(210, 190, 140), outline=INK)
    d.rectangle([1700, 260, 1840, 420], fill=(150, 130, 100), outline=INK, width=4)  # picture on the wall
    return im


def kitchen_day():
    """The kitchen's back wall in the morning (the table and the family are drawn in code in front of it)."""
    im = Image.new('RGB', (1920, 1080), (238, 226, 190))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 1920, 1080], fill=(150, 120, 90))
    d.line([0, 900, 1920, 900], fill=INK, width=6)
    d.rectangle([700, 140, 1160, 470], fill=(170, 210, 240), outline=INK, width=8)  # window over the sink
    d.line([930, 140, 930, 470], fill=INK, width=6)
    d.rectangle([560, 520, 1320, 620], fill=(200, 200, 205), outline=INK, width=5)  # counter
    d.rectangle([560, 620, 1320, 900], fill=(170, 130, 90), outline=INK, width=5)  # cabinets
    for x in (560, 750, 940, 1130):
        d.rectangle([x + 10, 640, x + 180, 880], outline=INK, width=3)
    d.rectangle([60, 100, 520, 330], fill=(170, 130, 90), outline=INK, width=5)  # wall cabinets
    d.rectangle([1440, 240, 1720, 900], fill=(230, 232, 236), outline=INK, width=6)  # fridge
    d.ellipse([1480, 60, 1600, 180], fill=(250, 250, 250), outline=INK, width=5)  # wall clock, blank face
    d.rectangle([160, 400, 420, 900], fill=(150, 120, 90), outline=INK, width=6)  # doorway to the hall
    return im


def attic_day():
    """The attic under the sloping roof: a small round window with a dusty beam of light, boxes, an old trunk, a box fan."""
    im = Image.new('RGB', (1920, 1080), (120, 96, 74))
    d = ImageDraw.Draw(im)
    d.polygon([(0, 0), (960, 0), (0, 700)], fill=(90, 70, 54), outline=INK)  # sloped roof left
    d.polygon([(1920, 0), (960, 0), (1920, 700)], fill=(90, 70, 54), outline=INK)  # sloped roof right
    d.rectangle([0, 880, 1920, 1080], fill=(140, 110, 80))
    d.line([0, 880, 1920, 880], fill=INK, width=6)
    d.ellipse([880, 160, 1040, 320], fill=(230, 220, 170), outline=INK, width=8)  # round window
    d.polygon([(900, 300), (1020, 300), (1300, 880), (700, 880)], fill=(200, 180, 130))  # light beam
    for x, y, w, h in ((140, 700, 220, 180), (180, 560, 160, 140), (380, 740, 180, 140), (1500, 720, 260, 160)):
        d.rectangle([x, y, x + w, y + h], fill=(170, 130, 90), outline=INK, width=5)  # boxes
    d.rectangle([1280, 760, 1480, 880], fill=(100, 70, 50), outline=INK, width=6)  # trunk
    d.ellipse([1600, 520, 1740, 660], fill=(200, 200, 205), outline=INK, width=5)  # box fan
    d.rectangle([620, 940, 860, 1000], fill=(60, 44, 34), outline=INK, width=4)  # hatch
    return im


def hallway_night():
    """The upstairs hallway at night, side stage view: her parents' door on the left, a little table and photos, the
    door of the little bedroom at the far right end."""
    im = Image.new('RGB', (1920, 1080), (60, 66, 92))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 890, 1920, 1080], fill=(90, 66, 50))
    d.rectangle([0, 920, 1920, 1000], fill=(120, 60, 60))  # runner carpet
    d.line([0, 890, 1920, 890], fill=INK, width=6)
    d.rectangle([180, 260, 440, 892], fill=(140, 108, 80), outline=INK, width=6)  # parents' door
    d.rectangle([760, 700, 1000, 720], fill=(110, 80, 60), outline=INK, width=4)  # hall table
    for x in (775, 980):
        d.rectangle([x, 720, x + 12, 890], fill=(110, 80, 60), outline=INK, width=3)
    d.rectangle([820, 600, 860, 700], fill=(200, 190, 150), outline=INK, width=3)  # lamp (off)
    for x, y in ((640, 380), (860, 340), (1080, 400)):
        d.rectangle([x, y, x + 120, y + 150], fill=(170, 150, 120), outline=INK, width=4)  # photos
    d.rectangle([1500, 280, 1760, 892], fill=(140, 108, 80), outline=INK, width=6)  # the little bedroom's door
    d.ellipse([1520, 580, 1542, 602], fill=(200, 180, 90), outline=INK)
    return im


def exterior(day: bool):
    """Grandma's old two-storey wooden house: a porch, one small upstairs window on the right (the little bedroom)."""
    im = Image.new('RGB', (1920, 1080), (160, 200, 240) if day else (20, 26, 50))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 1920, 1080], fill=(90, 150, 70) if day else (30, 44, 34))
    d.ellipse([1600, 80, 1720, 200], fill=(255, 240, 170) if day else (230, 230, 210))
    d.rectangle([560, 300, 1360, 902], fill=(190, 175, 150) if day else (120, 110, 100), outline=INK, width=8)
    d.polygon([(500, 310), (1420, 310), (960, 80)], fill=(110, 70, 60) if day else (70, 50, 46), outline=INK)
    d.ellipse([920, 170, 1000, 250], fill=(30, 30, 40), outline=INK, width=4)  # attic window
    for x, y in ((640, 380), (860, 380), (1170, 380), (640, 640), (1170, 640)):
        d.rectangle([x, y, x + 120, y + 150], fill=(150, 190, 220) if day else (30, 34, 50), outline=INK, width=5)
    d.rectangle([900, 680, 1020, 902], fill=(80, 60, 50), outline=INK, width=5)
    d.rectangle([600, 860, 1320, 902], fill=(140, 120, 100), outline=INK, width=4)
    for x in (150, 1700):
        d.ellipse([x - 130, 560, x + 130, 860], fill=(60, 120, 50) if day else (22, 34, 30), outline=INK, width=4)
    return im


def exterior_night():
    return exterior(False)


def exterior_day():
    return exterior(True)


SETS = {f.__name__: f for f in (bedroom_night, bedroom_pov_night, master_night, kitchen_day, attic_day, hallway_night, exterior_night, exterior_day)}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n in sys.argv[1:] or list(SETS):
        SETS[n]().save(OUT / f'{n}.png')
        print('layout', n)
