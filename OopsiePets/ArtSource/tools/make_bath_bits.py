#!/usr/bin/env python3
"""Draw style-matched bath and tooth-brushing bits (same ink and colours as make_faces.py):
a wide-open mouth with teeth, a water drop, and two little "sugar speck" spots for dirty teeth.
Prints each tooth's centre (normalized, origin bottom-left) for TeethActivity.

Usage: python3 -I make_bath_bits.py <Assets/OopsiePets/Art dir>
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter

SS = 4
INK = (62, 35, 72, 255)
WHITE = (255, 255, 255, 255)
TONGUE = (255, 143, 184, 255)
MOUTH_IN = (122, 50, 88, 255)


def done(im, w, h):
    return im.resize((w, h), Image.LANCZOS)


def mouth_teeth(w=400, h=280):
    W, H = w * SS, h * SS
    cx, cy, a, b = W / 2, H * 0.5, W * 0.45, H * 0.44
    box = (cx - a, cy - b, cx + a, cy + b)
    shape = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shape).ellipse(box, fill=255)
    inner = Image.new("RGBA", (W, H), MOUTH_IN)
    d = ImageDraw.Draw(inner)
    d.ellipse((cx - a * 0.42, cy + b * 0.25, cx + a * 0.42, cy + b * 1.15), fill=TONGUE)       # tongue
    d.line([(cx, cy + b * 0.45), (cx, cy + b * 0.8)], fill=(225, 100, 150, 255), width=4 * SS)
    teeth = []

    def edge(x, top):
        k = max(0.0, 1 - ((x - cx) / a) ** 2)
        return cy - b * math.sqrt(k) if top else cy + b * math.sqrt(k)

    tw, th = W * 0.13, H * 0.2
    for i in range(-2, 3):                                     # top row: 5 teeth
        x = cx + i * tw * 1.08
        y0 = edge(x, True) - 6 * SS
        d.rounded_rectangle((x - tw / 2, y0, x + tw / 2, y0 + th + 10 * SS), radius=10 * SS, fill=WHITE, outline=INK, width=4 * SS)
        teeth.append((x, y0 + (th + 10 * SS) * 0.62))
    tb = H * 0.16
    for i in range(4):                                         # bottom row: 4 teeth
        x = cx + (i - 1.5) * tw * 1.1
        y1 = edge(x, False) + 6 * SS
        d.rounded_rectangle((x - tw / 2, y1 - tb - 10 * SS, x + tw / 2, y1), radius=10 * SS, fill=WHITE, outline=INK, width=4 * SS)
        teeth.append((x, y1 - (tb + 10 * SS) * 0.6))
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.paste(inner, (0, 0), shape)
    ImageDraw.Draw(im).ellipse(box, outline=INK, width=10 * SS)
    out = done(im, w, h)
    centres = [(round(x / W, 3), round(1 - y / H, 3)) for x, y in teeth]
    return out, centres


def water_drop(w=96, h=128):
    W, H = w * SS, h * SS
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = W * 0.36
    cx, cy = W / 2, H - r - 8 * SS
    pts = [(cx, 8 * SS)]
    for t in range(0, 181, 6):
        ang = math.radians(180 + t)
        pts.append((cx + r * math.cos(ang) * -1, cy - r * math.sin(ang) * -1 if False else cy + r * math.sin(math.radians(t))))
    # teardrop: point on top, round bottom
    poly = [(cx, 8 * SS)] + [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(-20, 201, 5)]
    d.polygon(poly, fill=(189, 224, 254, 255))
    d.ellipse((cx - r * 0.75, cy - r * 0.2, cx + r * 0.75, cy + r * 0.95), fill=(160, 231, 229, 255))
    d.line(poly + [poly[0]], fill=INK, width=5 * SS, joint="curve")
    d.ellipse((cx - r * 0.5, cy - r * 0.45, cx - r * 0.15, cy - r * 0.05), fill=WHITE)
    return done(im, w, h)


def speck(color, w=64, h=64, seed=0):
    W, H = w * SS, h * SS
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    blobs = [(0.5, 0.5, 0.3), (0.32, 0.4, 0.17), (0.66, 0.38, 0.15), (0.6, 0.66, 0.16)] if seed == 0 else \
            [(0.5, 0.5, 0.28), (0.36, 0.62, 0.16), (0.68, 0.58, 0.14)]
    dark = tuple(int(c * 0.72) for c in color[:3]) + (255,)
    for x, y, r in blobs:
        d.ellipse(((x - r) * W - 3 * SS, (y - r) * H - 3 * SS, (x + r) * W + 3 * SS, (y + r) * H + 3 * SS), fill=dark)
    for x, y, r in blobs:
        d.ellipse(((x - r) * W, (y - r) * H, (x + r) * W, (y + r) * H), fill=color)
    d.ellipse((0.38 * W, 0.34 * H, 0.48 * W, 0.44 * H), fill=(255, 255, 255, 170))
    return done(im, w, h)


def main(art):
    ui = os.path.join(art, "Effects")
    os.makedirs(ui, exist_ok=True)
    m, centres = mouth_teeth()
    m.save(os.path.join(art, "Characters", "Shared", "mouth_teeth_open.png"), optimize=True)
    water_drop().save(os.path.join(ui, "fx_water_drop.png"), optimize=True)
    speck((245, 214, 110, 255), seed=0).save(os.path.join(ui, "teeth_speck_01.png"), optimize=True)
    speck((190, 226, 140, 255), seed=1).save(os.path.join(ui, "teeth_speck_02.png"), optimize=True)
    print("tooth centres (normalized, origin bottom-left):", centres)


if __name__ == "__main__":
    main(sys.argv[1])
