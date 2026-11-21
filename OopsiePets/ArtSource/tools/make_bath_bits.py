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


def mouth_teeth(w=400, h=250):
    """A friendly open smile: a D-shaped mouth with a soft pink inside, a neat row of six small rounded
    baby teeth along the top, four tiny ones at the bottom, and a pink tongue. Pivot: top centre."""
    W, H = w * SS, h * SS
    pad = 10 * SS
    box = (pad, -H + 2 * pad, W - pad, H - pad)          # lower half of an ellipse: flat top, round bottom
    shape = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shape).pieslice(box, 0, 180, fill=255)
    inner = Image.new("RGBA", (W, H), (214, 96, 132, 255))  # soft rose, not a dark hole
    d = ImageDraw.Draw(inner)
    cx = W / 2
    d.ellipse((cx - W * 0.2, H * 0.42, cx + W * 0.2, H * 0.98), fill=(255, 150, 188, 255))  # tongue
    d.line([(cx, H * 0.55), (cx, H * 0.75)], fill=(230, 110, 155, 255), width=4 * SS)
    teeth = []
    tw, th = W * 0.105, H * 0.24
    gap = W * 0.012
    total = 6 * tw + 5 * gap
    x0 = cx - total / 2
    for i in range(6):                                       # top row: six small rounded baby teeth
        x = x0 + i * (tw + gap)
        d.rounded_rectangle((x, -tw * 0.5, x + tw, th), radius=tw * 0.48, fill=WHITE, outline=(205, 186, 214, 255), width=3 * SS)
        d.ellipse((x + tw * 0.2, th * 0.25, x + tw * 0.42, th * 0.55), fill=(255, 255, 255, 255))
        teeth.append((x + tw / 2, th * 0.5))
    a, b = (box[2] - box[0]) / 2, (box[3] - box[1]) / 2
    cy0 = (box[1] + box[3]) / 2
    bw, bh = W * 0.085, H * 0.15
    for i in range(4):                                       # bottom row: four tiny teeth along the curve
        x = cx + (i - 1.5) * (bw + gap * 1.5)
        k = max(0.0, 1 - ((x - cx) / a) ** 2)
        yb = cy0 + b * math.sqrt(k) - 3 * SS
        d.rounded_rectangle((x - bw / 2, yb - bh, x + bw / 2, yb + bw * 0.5), radius=bw * 0.48, fill=WHITE, outline=(205, 186, 214, 255), width=3 * SS)
        teeth.append((x, yb - bh * 0.45))
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.paste(inner, (0, 0), shape)
    od = ImageDraw.Draw(im)
    od.arc(box, 0, 180, fill=INK, width=9 * SS)
    yl = cy0
    od.line([(box[0] + 4 * SS, yl), (box[2] - 4 * SS, yl)], fill=INK, width=9 * SS)
    for xe in (box[0] + 4 * SS, box[2] - 4 * SS):
        od.ellipse((xe - 4.5 * SS, yl - 4.5 * SS, xe + 4.5 * SS, yl + 4.5 * SS), fill=INK)
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
