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


# ---- the present day: Lily's home 800 miles from that house (Sam's room, the kitchen, the house)
def sonroom(day: bool):
    """Sam's bedroom in their new home, side stage view, laid out like the little bedroom (bed headboard left in the same
    place, nightstand with a clock) but a different room: blinds, a bookshelf, space posters, a door on the right."""
    wall = (150, 190, 170) if day else (40, 62, 70)
    im = Image.new('RGB', (1920, 1080), wall)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 880, 1920, 1080], fill=(170, 140, 110) if day else (70, 56, 46))
    d.line([0, 880, 1920, 880], fill=INK, width=6)
    d.rectangle([540, 140, 900, 450], fill=(200, 230, 250) if day else (16, 24, 46), outline=INK, width=8)  # window
    for y in range(160, 450, 34):
        d.line([548, y, 892, y], fill=(230, 230, 225) if day else (60, 66, 80), width=5)  # blinds, half open
    for x, y in ((980, 220), (1160, 260)):
        d.rectangle([x, y, x + 130, y + 170], fill=(60, 70, 120), outline=INK, width=4)  # posters (blank)
    side_bed(d, 260, 1100, 600, 880, quilt=(60, 110, 80))
    d.rectangle([90, 660, 230, 880], fill=(230, 230, 225), outline=INK, width=5)  # white nightstand
    d.rectangle([115, 610, 205, 660], fill=(40, 40, 46), outline=INK, width=4)  # alarm clock, blank face
    d.rectangle([1440, 230, 1720, 882], fill=(235, 235, 230), outline=INK, width=6)  # white door (closed)
    d.ellipse([1462, 560, 1484, 582], fill=(160, 160, 160), outline=INK)
    d.rectangle([1200, 560, 1400, 880], fill=(200, 170, 130), outline=INK, width=5)  # bookshelf
    for y in (640, 720, 800):
        d.line([1200, y, 1400, y], fill=INK, width=4)
    return im


def sonroom_night():
    return sonroom(False)


def sonroom_day():
    return sonroom(True)


def kitchen2_day():
    """Their kitchen today, back wall in the morning: bright modern white cabinets, a big window, the fridge on the LEFT."""
    im = Image.new('RGB', (1920, 1080), (190, 225, 215))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 900, 1920, 1080], fill=(200, 190, 175))
    d.line([0, 900, 1920, 900], fill=INK, width=6)
    d.rectangle([660, 120, 1260, 470], fill=(180, 220, 245), outline=INK, width=8)  # wide window
    d.line([960, 120, 960, 470], fill=INK, width=6)
    d.rectangle([520, 520, 1500, 610], fill=(225, 225, 225), outline=INK, width=5)  # counter
    d.rectangle([520, 610, 1500, 900], fill=(245, 245, 240), outline=INK, width=5)  # white cabinets
    for x in (520, 765, 1010, 1255):
        d.rectangle([x + 10, 630, x + 235, 880], outline=INK, width=3)
    d.rectangle([140, 220, 420, 900], fill=(200, 205, 210), outline=INK, width=6)  # fridge, LEFT
    d.rectangle([1560, 90, 1880, 330], fill=(245, 245, 240), outline=INK, width=5)  # wall cupboards, RIGHT
    d.ellipse([1640, 400, 1760, 520], fill=(250, 250, 250), outline=INK, width=5)  # wall clock, blank face
    return im


def newhouse_day():
    """Their house today: a small single-storey light-blue bungalow far from the old house, a carport, palm and lawn."""
    im = Image.new('RGB', (1920, 1080), (170, 210, 240))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 860, 1920, 1080], fill=(120, 170, 80))
    d.rectangle([420, 470, 1440, 862], fill=(150, 190, 215), outline=INK, width=8)  # walls
    d.polygon([(380, 480), (1480, 480), (1300, 360), (560, 360)], fill=(120, 110, 110), outline=INK)  # low roof
    d.rectangle([860, 640, 980, 862], fill=(230, 230, 225), outline=INK, width=5)  # door
    for x in (520, 680, 1100, 1260):
        d.rectangle([x, 560, x + 120, 700], fill=(200, 230, 250), outline=INK, width=5)  # windows (the right one is Sam's)
    d.rectangle([1440, 560, 1760, 862], fill=(170, 170, 170), outline=INK, width=5)  # carport
    d.ellipse([1600, 80, 1720, 200], fill=(255, 240, 170))
    d.rectangle([180, 420, 210, 862], fill=(120, 90, 60), outline=INK, width=4)  # palm trunk
    d.ellipse([90, 330, 300, 470], fill=(70, 140, 60), outline=INK, width=4)
    return im


def master_night_covered():
    """Her parents' room at night, laid out like master_night, but the double bed is made up as if two people were
    asleep in it: the quilt pulled up to the pillows, rising in two long humps (a grown-up behind, a child in front).
    The pillows stay empty - the faces are drawn in code."""
    im = Image.new('RGB', (1920, 1080), (50, 58, 88))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 885, 1920, 1080], fill=(84, 62, 48))
    d.line([0, 885, 1920, 885], fill=INK, width=6)
    d.rectangle([1250, 150, 1580, 450], fill=(20, 28, 54), outline=INK, width=8)  # window
    d.line([1415, 150, 1415, 450], fill=INK, width=6)
    d.rectangle([350, 380, 380, 885], fill=(110, 80, 60), outline=INK, width=6)  # headboard
    d.rectangle([1140, 520, 1170, 885], fill=(110, 80, 60), outline=INK, width=6)  # footboard
    d.ellipse([390, 540, 560, 610], fill=(235, 235, 240), outline=INK, width=4)  # back pillow
    d.ellipse([430, 566, 600, 640], fill=(235, 235, 240), outline=INK, width=4)  # front pillow
    quilt = (140, 120, 90)
    # the quilt pulled up over the pillows' lower edge, two long humps where the bodies lie
    d.polygon([(470, 600), (560, 570), (760, 560), (980, 572), (1120, 590), (1140, 610), (1140, 885 - 18), (380, 885 - 18), (380, 640)], fill=quilt, outline=INK)
    d.polygon([(500, 640), (600, 612), (800, 606), (960, 622), (1130, 640), (1130, 700), (500, 700)], fill=(150, 130, 98), outline=INK)
    d.rectangle([380, 700, 1140, 885 - 18], fill=(130, 110, 84), outline=INK, width=4)  # quilt front, falling to the skirt
    d.rectangle([200, 670, 350, 885], fill=(110, 80, 60), outline=INK, width=5)  # nightstand + lamp
    d.rectangle([255, 600, 295, 670], fill=(90, 90, 96), outline=INK, width=3)
    d.polygon([(235, 600), (315, 600), (300, 550), (250, 550)], fill=(210, 190, 140), outline=INK)
    d.rectangle([1700, 260, 1840, 420], fill=(150, 130, 100), outline=INK, width=4)  # picture on the wall
    return im



# ---- The Jinn Wedding (Kuwait, 1997; the majlis today) ---------------------------------------------------------
def majlis_night():
    """Yadda's majlis on a winter evening, front stage view: floor cushions along the back wall, a red carpet, a low tray
    with the dallah and cups in the middle, an incense burner, a window with the night, a side table with an old phone."""
    im = Image.new('RGB', (1920, 1080), (196, 160, 120))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 820, 1920, 1080], fill=(150, 40, 40))  # carpet
    d.line([0, 820, 1920, 820], fill=INK, width=6)
    d.rectangle([0, 700, 1920, 822], fill=(120, 30, 40), outline=INK, width=5)  # long floor cushions (sadu) along the wall
    for x in range(0, 1920, 160):
        d.rectangle([x + 10, 600, x + 140, 700], fill=(170, 60, 50), outline=INK, width=4)  # back cushions
    d.rectangle([760, 120, 1160, 420], fill=(20, 26, 50), outline=INK, width=8)  # window, night
    d.line([960, 120, 960, 420], fill=INK, width=6)
    d.rectangle([700, 880, 1220, 940], fill=(120, 80, 40), outline=INK, width=5)  # low tray
    d.polygon([(860, 880), (900, 800), (940, 880)], fill=(210, 170, 60), outline=INK)  # dallah
    d.rectangle([1400, 700, 1600, 880], fill=(110, 70, 40), outline=INK, width=5)  # side table
    d.rectangle([1440, 650, 1560, 700], fill=(220, 210, 190), outline=INK, width=4)  # old phone
    d.rectangle([380, 840, 470, 900], fill=(90, 60, 30), outline=INK, width=4)  # mabkhara
    return im


def noura_house():
    """Noura's living room in 1997, front stage view: a sofa, two frame drums hanging on the wall, a side table with a
    phone, curtains, a lamp. Warm evening light."""
    im = Image.new('RGB', (1920, 1080), (214, 196, 160))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 860, 1920, 1080], fill=(150, 120, 90))
    d.line([0, 860, 1920, 860], fill=INK, width=6)
    d.rectangle([200, 600, 1000, 860], fill=(110, 60, 60), outline=INK, width=6)  # sofa
    for cx in (480, 720):
        d.ellipse([cx - 90, 180, cx + 90, 360], fill=(230, 210, 170), outline=INK, width=8)  # frame drums on the wall
    d.rectangle([1300, 680, 1500, 860], fill=(110, 70, 40), outline=INK, width=5)  # side table
    d.rectangle([1340, 630, 1460, 680], fill=(230, 225, 210), outline=INK, width=4)  # phone
    d.rectangle([1560, 100, 1880, 600], fill=(140, 60, 60), outline=INK, width=5)  # curtains
    return im


def wedding_happy():
    """An ordinary, happy Kuwaiti wedding hall in the 1990s, front view: a flower-covered stage with the bride's chair
    in the middle, strings of lights, round tables; bright and festive."""
    im = Image.new('RGB', (1920, 1080), (240, 220, 200))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 860, 1920, 1080], fill=(220, 200, 180))
    d.rectangle([560, 360, 1360, 640], fill=(250, 240, 230), outline=INK, width=6)  # stage
    d.rectangle([860, 300, 1060, 560], fill=(250, 200, 210), outline=INK, width=6)  # bride's chair
    for x in range(100, 1900, 120):
        d.ellipse([x, 120, x + 30, 150], fill=(255, 230, 120))
    for x in (200, 1600):
        d.ellipse([x, 760, x + 200, 840], fill=(250, 250, 250), outline=INK, width=4)
    return im


def street_night():
    """A quiet street outside a Kuwaiti house at night: a high wall with a gate, a palm tree, a street lamp, an empty road."""
    im = Image.new('RGB', (1920, 1080), (20, 26, 50))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 860, 1920, 1080], fill=(60, 60, 66))
    d.rectangle([0, 420, 1920, 860], fill=(196, 176, 140), outline=INK, width=6)  # wall
    d.rectangle([300, 520, 560, 860], fill=(110, 80, 50), outline=INK, width=6)  # gate
    d.rectangle([1500, 200, 1530, 860], fill=(60, 60, 60), outline=INK, width=4)  # lamp post
    d.ellipse([1470, 170, 1560, 230], fill=(255, 220, 140))
    d.rectangle([900, 200, 940, 520], fill=(110, 80, 50), outline=INK, width=4)  # palm
    d.ellipse([800, 120, 1040, 260], fill=(40, 80, 40), outline=INK, width=4)
    return im


def desert_road_night():
    """An empty two-lane desert road at night running across the picture, sand dunes, a few tiny lights of the last
    houses far away on the left, a sky full of stars, no moon."""
    im = Image.new('RGB', (1920, 1080), (14, 18, 36))
    d = ImageDraw.Draw(im)
    d.polygon([(0, 640), (500, 560), (1100, 610), (1920, 560), (1920, 1080), (0, 1080)], fill=(70, 56, 44), outline=INK)  # dunes
    d.rectangle([0, 800, 1920, 900], fill=(40, 40, 44), outline=INK, width=5)  # road
    for x in range(0, 1920, 200):
        d.rectangle([x + 40, 846, x + 140, 854], fill=(220, 200, 120))
    for x in (80, 140, 190):
        d.ellipse([x, 600, x + 10, 610], fill=(255, 220, 140))
    return im


def mansion_night():
    """A huge white house alone in the desert at night, every window blazing with warm light, lanterns along the wall,
    sand all around, a black sky."""
    im = Image.new('RGB', (1920, 1080), (10, 12, 26))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 820, 1920, 1080], fill=(90, 72, 54))
    d.rectangle([360, 300, 1560, 822], fill=(230, 220, 200), outline=INK, width=8)  # house
    d.polygon([(330, 310), (1590, 310), (1500, 250), (420, 250)], fill=(200, 190, 170), outline=INK)
    for y in (380, 600):
        for x in range(440, 1500, 160):
            d.rectangle([x, y, x + 90, y + 130], fill=(255, 210, 120), outline=INK, width=5)  # lit windows
    d.rectangle([880, 600, 1040, 822], fill=(255, 190, 90), outline=INK, width=6)  # lit doorway
    return im


def hall_gold():
    """The women's wedding hall: gold walls and pillars from floor to ceiling, crystal chandeliers, a shining marble
    floor, a stage at the far end with an ornate gold bride's chair in the middle, tables of food along the sides,
    blue incense haze."""
    im = Image.new('RGB', (1920, 1080), (190, 150, 60))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 700, 1920, 1080], fill=(230, 225, 215), outline=INK, width=6)  # marble floor
    d.rectangle([620, 380, 1300, 700], fill=(200, 160, 70), outline=INK, width=6)  # stage
    d.rectangle([880, 300, 1040, 560], fill=(230, 200, 90), outline=INK, width=6)  # bride's chair
    for x in (200, 500, 1420, 1720):
        d.rectangle([x, 80, x + 60, 700], fill=(210, 170, 70), outline=INK, width=5)  # pillars
    for x in (400, 960, 1520):
        d.ellipse([x - 90, 40, x + 90, 160], fill=(250, 240, 200), outline=INK, width=5)  # chandeliers
    d.rectangle([40, 740, 380, 800], fill=(250, 250, 250), outline=INK, width=4)  # food table left
    d.rectangle([1540, 740, 1880, 800], fill=(250, 250, 250), outline=INK, width=4)  # food table right
    return im


def ruin_dawn():
    """The same big house at grey dawn, but a burned ruin: broken black windows, walls scorched black by an old fire,
    sand drifting through the empty doorway, no lights; flat sand in the foreground."""
    im = Image.new('RGB', (1920, 1080), (150, 150, 160))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 820, 1920, 1080], fill=(170, 150, 120))
    d.rectangle([360, 300, 1560, 822], fill=(120, 110, 100), outline=INK, width=8)
    for y in (380, 600):
        for x in range(440, 1500, 160):
            d.rectangle([x, y, x + 90, y + 130], fill=(20, 20, 20), outline=INK, width=5)
    d.rectangle([880, 600, 1040, 822], fill=(30, 26, 22), outline=INK, width=6)
    d.polygon([(860, 822), (1060, 822), (1120, 880), (800, 880)], fill=(190, 170, 130))  # sand drift
    return im


SETS = {f.__name__: f for f in (majlis_night, noura_house, wedding_happy, street_night, desert_road_night, mansion_night, hall_gold, ruin_dawn)}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n in sys.argv[1:] or list(SETS):
        SETS[n]().save(OUT / f'{n}.png')
        print('layout', n)
