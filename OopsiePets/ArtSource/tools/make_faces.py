#!/usr/bin/env python3
"""Draw the shared eye and mouth overlay sprites (style-matched to the generated art).

Usage: python3 -I make_faces.py <out dir>
Drawn at 4x and downsampled for clean anti-aliasing.
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter

SS = 4
INK = (62, 35, 72, 255)        # eye fill top / mouth ink (deep plum)
INK_LIGHT = (112, 74, 132, 255)
OUTLINE = (91, 69, 101, 255)   # #5B4565
WHITE = (255, 255, 255, 255)
TONGUE = (255, 143, 184, 255)  # candy pink
MOUTH_IN = (122, 50, 88, 255)


def canvas(w, h):
    return Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))


def done(im, w, h):
    return im.resize((w, h), Image.LANCZOS)


def stroke_arc(d, box, start, end, width, color):
    d.arc(box, start, end, fill=color, width=width)
    # round caps
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    rx, ry = (box[2] - box[0]) / 2 - width / 2, (box[3] - box[1]) / 2 - width / 2
    for a in (start, end):
        r = math.radians(a)
        x, y = cx + rx * math.cos(r), cy + ry * math.sin(r)
        d.ellipse((x - width / 2, y - width / 2, x + width / 2, y + width / 2), fill=color)


def eye_open(w=110, h=136, wide=False, star=False):
    im = canvas(w, h)
    W, H = w * SS, h * SS
    # vertical gradient oval
    grad = Image.new("RGBA", (W, H))
    gd = ImageDraw.Draw(grad)
    for y in range(H):
        t = y / H
        c = tuple(int(INK[i] * (1 - t) + INK_LIGHT[i] * t) for i in range(3)) + (255,)
        gd.line([(0, y), (W, y)], fill=c)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    pad = 6 * SS
    box = (pad, pad, W - pad, H - pad) if not wide else (pad, pad + 4 * SS, W - pad, H - pad - 4 * SS)
    md.ellipse(box, fill=255)
    im.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.ellipse(box, outline=(46, 26, 56, 255), width=3 * SS)
    # lilac reflection crescent at the bottom
    cres = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cres)
    cd.ellipse((box[0] + 14 * SS, box[3] - 40 * SS, box[2] - 14 * SS, box[3] - 8 * SS), fill=(190, 150, 220, 150))
    cd.ellipse((box[0] + 10 * SS, box[3] - 56 * SS, box[2] - 10 * SS, box[3] - 18 * SS), fill=(0, 0, 0, 0))
    cres = cres.filter(ImageFilter.GaussianBlur(2 * SS))
    im.alpha_composite(Image.composite(cres, Image.new("RGBA", (W, H), (0, 0, 0, 0)), mask))
    d = ImageDraw.Draw(im)
    # highlights
    if star:
        cx, cy, r = W * 0.36, H * 0.33, 22 * SS
        pts = []
        for k in range(10):
            a = math.radians(-90 + k * 36)
            rr = r if k % 2 == 0 else r * 0.45
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        d.polygon(pts, fill=WHITE)
    else:
        d.ellipse((W * 0.2, H * 0.17, W * 0.2 + 40 * SS, H * 0.17 + 46 * SS), fill=WHITE)
    d.ellipse((W * 0.62, H * 0.6, W * 0.62 + 16 * SS, H * 0.6 + 16 * SS), fill=WHITE)
    return done(im, w, h)


def eye_happy(w=110, h=136):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    stroke_arc(d, (10 * SS, H * 0.38, W - 10 * SS, H * 0.38 + (W - 20 * SS) * 0.9), 200, 340, 13 * SS, INK)
    return done(im, w, h)


def eye_blink(w=110, h=136):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    stroke_arc(d, (12 * SS, H * 0.2, W - 12 * SS, H * 0.62), 25, 155, 12 * SS, INK)
    # tiny lashes
    for x0, ang in ((16, 200), (W / SS - 16, -20)):
        pass
    return done(im, w, h)


def mouth_smile_w(w=120, h=70):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W = w * SS
    r = W * 0.24
    stroke_arc(d, (W / 2 - 2 * r, -r * 0.9, W / 2, r * 1.1), 20, 160, 9 * SS, INK)
    stroke_arc(d, (W / 2, -r * 0.9, W / 2 + 2 * r, r * 1.1), 20, 160, 9 * SS, INK)
    return done(im, w, h)


def mouth_laugh(w=120, h=90, teeth=False):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    box = (14 * SS, -H * 0.55, W - 14 * SS, H - 8 * SS)
    shape = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(shape)
    sd.pieslice(box, 0, 180, fill=255)
    fill = Image.new("RGBA", (W, H), MOUTH_IN)
    tongue = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    td = ImageDraw.Draw(tongue)
    td.ellipse((W * 0.28, H * 0.48, W * 0.72, H * 1.05), fill=TONGUE)
    fill.alpha_composite(tongue)
    im.paste(fill, (0, 0), shape)
    d = ImageDraw.Draw(im)
    d.arc(box, 0, 180, fill=INK, width=8 * SS)
    d.line([(box[0] + 2 * SS, 4 * SS), (box[2] - 2 * SS, 4 * SS)], fill=INK, width=8 * SS)
    if teeth:
        tw, th = W * 0.13, H * 0.26
        for sx in (-1, 1):
            x0 = W / 2 + (0 if sx > 0 else -tw) + sx * 1 * SS
            d.rounded_rectangle((x0, 6 * SS, x0 + tw, 6 * SS + th), radius=3 * SS, fill=WHITE, outline=INK, width=3 * SS)
    return done(im, w, h)


def mouth_o(w=70, h=80):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    box = (10 * SS, 8 * SS, W - 10 * SS, H - 8 * SS)
    d.ellipse(box, fill=MOUTH_IN, outline=INK, width=7 * SS)
    d.ellipse((W * 0.32, H * 0.55, W * 0.68, H * 0.82), fill=TONGUE)
    return done(im, w, h)


def mouth_sneeze(w=120, h=60):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    pts = []
    for i in range(41):
        t = i / 40
        pts.append((12 * SS + t * (W - 24 * SS), H / 2 + math.sin(t * math.pi * 3) * H * 0.22))
    d.line(pts, fill=INK, width=8 * SS, joint="curve")
    for p in (pts[0], pts[-1]):
        d.ellipse((p[0] - 4 * SS, p[1] - 4 * SS, p[0] + 4 * SS, p[1] + 4 * SS), fill=INK)
    return done(im, w, h)


def mouth_bunny(w=120, h=80):
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    W, H = w * SS, h * SS
    tw, th = W * 0.12, H * 0.42
    for sx in (-1, 1):
        x0 = W / 2 + (1 * SS if sx > 0 else -tw - 1 * SS)
        d.rounded_rectangle((x0, H * 0.28, x0 + tw, H * 0.28 + th), radius=4 * SS, fill=WHITE, outline=INK, width=4 * SS)
    r = W * 0.22
    stroke_arc(d, (W / 2 - 2 * r, -r * 0.8, W / 2, r * 0.9), 25, 160, 8 * SS, INK)
    stroke_arc(d, (W / 2, -r * 0.8, W / 2 + 2 * r, r * 0.9), 20, 155, 8 * SS, INK)
    return done(im, w, h)


def mouth_tongue(w=120, h=90):
    im = mouth_smile_w(w, 70)
    big = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    t = canvas(w, h)
    d = ImageDraw.Draw(t)
    W, H = w * SS, h * SS
    d.rounded_rectangle((W * 0.36, H * 0.3, W * 0.64, H * 0.92), radius=W * 0.14, fill=TONGUE, outline=INK, width=5 * SS)
    d.line([(W * 0.5, H * 0.45), (W * 0.5, H * 0.7)], fill=(225, 100, 150, 255), width=3 * SS)
    big.alpha_composite(done(t, w, h))
    big.alpha_composite(im, (0, 0))
    return big


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    sprites = {
        "eye_open": eye_open(),
        "eye_wide": eye_open(wide=True),
        "eye_sparkle": eye_open(star=True),
        "eye_happy": eye_happy(),
        "eye_blink": eye_blink(),
        "mouth_smile": mouth_smile_w(),
        "mouth_laugh": mouth_laugh(),
        "mouth_o": mouth_o(),
        "mouth_sneeze": mouth_sneeze(),
        "mouth_bunny": mouth_bunny(),
        "mouth_bunny_laugh": mouth_laugh(teeth=True),
        "mouth_tongue": mouth_tongue(),
    }
    for name, im in sprites.items():
        im.save(os.path.join(out, name + ".png"))
    print("wrote", len(sprites))


if __name__ == "__main__":
    main()
