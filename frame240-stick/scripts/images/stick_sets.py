#!/usr/bin/env python3
"""Rough flat layouts of the stick-figure "Frame 240" sets (front-on stage views); the image model repaints them.
Characters are never in the plates: Mara and the man are drawn and animated in code on top.
    .venv/bin/python scripts/images/stick_sets.py [names]  -> build/layouts/<set>.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'build' / 'layouts'
INK = (20, 20, 20)


def rain(d, box, n=40, col=(150, 170, 210)):
    x0, y0, x1, y1 = box
    for i in range(n):
        x = x0 + (i * 97) % (x1 - x0)
        y = y0 + (i * 53) % (y1 - y0 - 40)
        d.line([x, y, x - 6, y + 34], fill=col, width=2)


def room_front_night():
    """Mara's workroom seen from her monitor: the wall behind her chair, a rainy window on the left,
    the open doorway to the dark hallway on the right. The desk and Mara are drawn in code."""
    im = Image.new('RGB', (1920, 1080), (36, 46, 78))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 800, 1920, 1080], fill=(66, 50, 40))  # wooden floor
    d.line([0, 800, 1920, 800], fill=INK, width=6)
    d.rectangle([0, 780, 1920, 800], fill=(52, 60, 86), outline=INK, width=3)  # skirting
    # rainy window (left)
    d.rectangle([200, 160, 640, 540], fill=(20, 28, 50), outline=INK, width=8)
    d.line([420, 160, 420, 540], fill=INK, width=6)
    d.line([200, 350, 640, 350], fill=INK, width=6)
    for x in (250, 300, 360, 470, 520, 590):
        d.rectangle([x, 470 - (x % 7) * 12, x + 26, 540], fill=(14, 18, 32))  # far buildings
        d.rectangle([x + 8, 490 - (x % 5) * 8, x + 16, 498 - (x % 5) * 8], fill=(220, 190, 110))
    rain(d, (206, 166, 634, 534))
    d.rectangle([180, 540, 660, 560], fill=(70, 72, 92), outline=INK, width=4)  # sill
    # pinned sketches on the wall (blank paper, no drawings that read as text)
    for x, y in ((760, 230), (880, 200), (800, 360)):
        d.rectangle([x, y, x + 100, y + 120], fill=(200, 200, 190), outline=INK, width=3)
    # the open doorway to the hallway (right): a dark corridor with a closed door far away
    d.rectangle([1160, 210, 1500, 800], fill=(90, 82, 70), outline=INK, width=6)  # frame
    d.rectangle([1180, 230, 1480, 800], fill=(12, 15, 26))
    d.polygon([(1180, 800), (1480, 800), (1380, 660), (1280, 660)], fill=(30, 28, 32))  # corridor floor
    d.line([1180, 230, 1280, 330], fill=(28, 32, 46), width=4)
    d.line([1480, 230, 1380, 330], fill=(28, 32, 46), width=4)
    d.rectangle([1280, 330, 1380, 660], fill=(22, 26, 40), outline=(40, 44, 60), width=3)  # far door
    d.ellipse([1300, 250, 1360, 270], fill=(60, 60, 60))  # corridor ceiling light (off)
    # a light switch
    d.rectangle([1530, 480, 1560, 530], fill=(150, 150, 150), outline=INK, width=3)
    return im


def room_side_night():
    """The same workroom from the side: the doorway to the hallway on the left, the desk on the right with the
    monitor turned toward the room, a rainy window above the desk."""
    im = Image.new('RGB', (1920, 1080), (36, 46, 78))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 860, 1920, 1080], fill=(66, 50, 40))
    d.line([0, 860, 1920, 860], fill=INK, width=6)
    d.rectangle([0, 840, 1920, 860], fill=(52, 60, 86), outline=INK, width=3)
    # doorway (left)
    d.rectangle([130, 220, 480, 862], fill=(90, 82, 70), outline=INK, width=6)
    d.rectangle([150, 240, 460, 862], fill=(12, 15, 26))
    d.rectangle([260, 380, 350, 720], fill=(22, 26, 40), outline=(40, 44, 60), width=3)
    # window above the desk
    d.rectangle([1150, 130, 1600, 500], fill=(20, 28, 50), outline=INK, width=8)
    d.line([1375, 130, 1375, 500], fill=INK, width=6)
    rain(d, (1156, 136, 1594, 494))
    # desk (right)
    d.rectangle([1040, 610, 1760, 645], fill=(110, 76, 50), outline=INK, width=5)
    d.rectangle([1060, 645, 1085, 860], fill=(96, 66, 44), outline=INK, width=4)
    d.rectangle([1560, 645, 1740, 860], fill=(100, 70, 46), outline=INK, width=4)  # drawers
    d.line([1560, 715, 1740, 715], fill=INK, width=3)
    d.line([1560, 785, 1740, 785], fill=INK, width=3)
    # monitor turned three-quarters toward the room (left), screen glowing pale blue
    d.polygon([(1160, 340), (1420, 365), (1420, 555), (1160, 580)], fill=(200, 222, 245), outline=INK)
    d.line([(1160, 340), (1420, 365), (1420, 555), (1160, 580), (1160, 340)], fill=INK, width=8)
    d.rectangle([1280, 568, 1310, 610], fill=(40, 40, 44), outline=INK, width=3)
    d.ellipse([1240, 600, 1350, 618], fill=(40, 40, 44), outline=INK, width=3)
    # pen tablet + stylus, mug
    d.polygon([(1080, 600), (1220, 600), (1230, 610), (1070, 610)], fill=(30, 30, 34), outline=INK)
    d.rectangle([1480, 560, 1530, 610], fill=(200, 200, 196), outline=INK, width=4)
    return im


def hall_persp_night():
    """The apartment hallway in one-point perspective, seen from the living-room end."""
    im = Image.new('RGB', (1920, 1080), (60, 66, 86))
    d = ImageDraw.Draw(im)
    vp = (960, 520)
    far = (760, 300, 1160, 760)  # end wall
    # ceiling, walls, floor as trapezoids
    d.polygon([(0, 0), (1920, 0), (far[2], far[1]), (far[0], far[1])], fill=(48, 52, 70))
    d.polygon([(0, 0), (far[0], far[1]), (far[0], far[3]), (0, 1080)], fill=(70, 76, 98))
    d.polygon([(1920, 0), (far[2], far[1]), (far[2], far[3]), (1920, 1080)], fill=(62, 68, 90))
    d.polygon([(0, 1080), (1920, 1080), (far[2], far[3]), (far[0], far[3])], fill=(56, 48, 40))
    d.rectangle(far, fill=(66, 72, 94), outline=INK, width=4)
    for a, b in (((0, 0), (far[0], far[1])), ((1920, 0), (far[2], far[1])), ((0, 1080), (far[0], far[3])), ((1920, 1080), (far[2], far[3]))):
        d.line([a, b], fill=INK, width=5)
    # the bedroom door at the far end, a hairline crack above its frame
    d.rectangle([860, 400, 1060, 760], fill=(88, 92, 110), outline=INK, width=5)
    d.ellipse([1030, 580, 1044, 594], fill=(180, 170, 120))
    d.line([980, 392, 1000, 360, 1030, 345], fill=INK, width=2)
    # carpet runner with ONE stain
    d.polygon([(640, 1080), (1280, 1080), (1030, 760), (890, 760)], fill=(150, 126, 90), outline=INK)
    d.ellipse([920, 880, 1010, 910], fill=(110, 80, 56))
    # dome ceiling light with a water stain beside it
    d.ellipse([900, 150, 1020, 190], fill=(220, 200, 150), outline=INK, width=4)
    d.ellipse([1060, 140, 1150, 175], fill=(70, 66, 70))
    # the front door on the left wall (near), the closet door on the right wall (middle)
    d.polygon([(110, 150), (400, 260), (400, 900), (110, 1040)], fill=(96, 84, 70), outline=INK)
    d.line([(110, 150), (400, 260), (400, 900), (110, 1040), (110, 150)], fill=INK, width=6)
    d.ellipse([340, 560, 370, 590], fill=(190, 170, 100), outline=INK)  # handle
    d.rectangle([330, 470, 360, 490], fill=(190, 170, 100), outline=INK)  # deadbolt
    d.polygon([(1440, 260), (1580, 200), (1580, 950), (1440, 860)], fill=(190, 192, 200), outline=INK)
    d.line([(1440, 260), (1580, 200), (1580, 950), (1440, 860), (1440, 260)], fill=INK, width=5)
    d.ellipse([1450, 560, 1470, 580], fill=(180, 170, 120), outline=INK)
    return im


def hall_side_night():
    """The hallway's long side wall as a stage set: the closet door on the left, a long empty wall,
    the bedroom door on the right with a hairline crack above its frame."""
    im = Image.new('RGB', (1920, 1080), (150, 150, 140))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1920, 90], fill=(120, 120, 116))  # ceiling strip
    d.line([0, 90, 1920, 90], fill=INK, width=5)
    d.ellipse([900, 70, 1020, 110], fill=(230, 210, 160), outline=INK, width=4)  # dome light
    d.rectangle([0, 845, 1920, 1080], fill=(150, 126, 90))  # carpet runner
    d.line([0, 845, 1920, 845], fill=INK, width=6)
    d.rectangle([0, 820, 1920, 845], fill=(200, 196, 186), outline=INK, width=3)  # skirting
    d.ellipse([820, 930, 960, 970], fill=(110, 80, 56))  # the stain
    # closet door (left): a plain white panel door
    d.rectangle([170, 270, 440, 846], fill=(226, 226, 222), outline=INK, width=6)
    d.rectangle([155, 255, 455, 270], fill=(210, 210, 206), outline=INK, width=3)
    d.ellipse([400, 550, 422, 572], fill=(180, 170, 120), outline=INK)
    # bedroom door (right)
    d.rectangle([1420, 250, 1700, 846], fill=(200, 200, 196), outline=INK, width=6)
    d.rectangle([1405, 235, 1715, 250], fill=(190, 190, 186), outline=INK, width=3)
    d.rectangle([1460, 300, 1660, 520], outline=(150, 150, 146), width=4)
    d.rectangle([1460, 570, 1660, 800], outline=(150, 150, 146), width=4)
    d.ellipse([1440, 550, 1462, 572], fill=(180, 170, 120), outline=INK)
    d.line([1520, 233, 1545, 200, 1590, 185, 1610, 160], fill=INK, width=3)  # hairline crack above the frame
    return im


def closet_night():
    """Inside a small dark storage closet: shelves with boxes on the left, two coats on hooks, the closed door on the right
    with light leaking under it."""
    im = Image.new('RGB', (1920, 1080), (44, 50, 64))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 1920, 1080], fill=(40, 40, 46))
    d.line([0, 900, 1920, 900], fill=INK, width=6)
    for y in (300, 480, 660):  # shelves
        d.rectangle([40, y, 640, y + 18], fill=(96, 70, 48), outline=INK, width=4)
    for x, y, w, h in ((70, 200, 170, 100), (280, 220, 140, 80), (90, 390, 140, 90), (300, 380, 200, 100), (120, 570, 180, 90)):
        d.rectangle([x, y, x + w, y + h], fill=(120, 92, 62), outline=INK, width=4)
    # hooks + two coats
    for x, col in ((760, (40, 50, 70)), (930, (90, 70, 50))):
        d.ellipse([x + 50, 230, x + 70, 250], fill=(150, 150, 150), outline=INK)
        d.polygon([(x + 60, 245), (x + 120, 300), (x + 110, 640), (x + 10, 640), (x, 300)], fill=col, outline=INK)
    # the closed door (inside view), white, a knob; light under the door
    d.rectangle([1300, 200, 1650, 900], fill=(200, 202, 206), outline=INK, width=6)
    d.rectangle([1285, 185, 1665, 200], fill=(180, 182, 186), outline=INK, width=3)
    d.ellipse([1320, 540, 1346, 566], fill=(180, 170, 120), outline=INK)
    d.rectangle([1300, 896, 1650, 904], fill=(250, 240, 200))
    # a vacuum cleaner in the corner
    d.rectangle([1720, 600, 1760, 890], fill=(30, 30, 34), outline=INK, width=4)
    d.ellipse([1690, 860, 1800, 900], fill=(30, 30, 34), outline=INK, width=4)
    return im


def exterior_night():
    """A plain five-storey apartment block at night in the rain; one lit window."""
    im = Image.new('RGB', (1920, 1080), (18, 24, 44))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 1920, 1080], fill=(30, 32, 38))  # street
    d.line([0, 900, 1920, 900], fill=INK, width=5)
    d.rectangle([560, 160, 1360, 902], fill=(70, 62, 58), outline=INK, width=8)
    d.rectangle([540, 140, 1380, 165], fill=(60, 54, 50), outline=INK, width=4)
    for r in range(5):
        for c in range(5):
            x = 620 + c * 150
            y = 210 + r * 135
            lit = (r, c) == (2, 3)
            d.rectangle([x, y, x + 80, y + 90], fill=(230, 220, 170) if lit else (24, 28, 40), outline=INK, width=4)
    d.rectangle([900, 790, 1020, 902], fill=(40, 34, 30), outline=INK, width=5)  # entrance
    for x in (150, 300, 1600, 1760):  # trees
        d.ellipse([x - 120, 520, x + 120, 820], fill=(22, 34, 30), outline=INK, width=4)
        d.rectangle([x - 14, 800, x + 14, 902], fill=(40, 30, 24), outline=INK, width=3)
    d.rectangle([1480, 560, 1494, 902], fill=(50, 50, 54), outline=INK, width=3)  # street lamp
    d.ellipse([1462, 540, 1512, 570], fill=(240, 220, 150), outline=INK, width=3)
    rain(d, (0, 0, 1920, 900), n=120)
    return im


SETS = {f.__name__: f for f in (room_front_night, room_side_night, hall_persp_night, hall_side_night, closet_night, exterior_night)}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or list(SETS)
    for n in names:
        SETS[n]().save(OUT / f'{n}.png')
        print('layout', n)
