#!/usr/bin/env python3
"""Draw the padlock shown on friends that can't be played with yet, and the little progress dots under
it (filled = an earlier friend already completed). Drawn in code, supersampled for smooth edges.

Usage: python3 -I make_lock.py <Assets/OopsiePets/Art>
"""
import os, sys
from PIL import Image, ImageDraw

SS = 4
PLUM = (92, 58, 110, 255)


def padlock(size=256):
    S = size * SS
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    o = 9 * SS
    # Shackle: a thick rounded arch.
    cx = S // 2
    sw, top = int(S * 0.27), int(S * 0.08)
    bot = int(S * 0.52)
    d.rounded_rectangle([cx - sw - o, top - o // 2, cx + sw + o, bot], radius=sw + o, fill=PLUM)
    d.rounded_rectangle([cx - sw, top + o // 2, cx + sw, bot], radius=sw, fill=(214, 206, 226, 255))
    inner = int(sw * 0.52)
    d.rounded_rectangle([cx - inner, top + int(S * 0.11), cx + inner, bot + o], radius=inner, fill=PLUM)
    d.rounded_rectangle([cx - inner + o, top + int(S * 0.11) + o, cx + inner - o, bot + 2 * o], radius=inner - o, fill=(0, 0, 0, 0))
    # Body: a soft golden rounded block.
    bx0, by0, bx1, by1 = int(S * 0.14), int(S * 0.42), int(S * 0.86), int(S * 0.94)
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=int(S * 0.12), fill=PLUM)
    d.rounded_rectangle([bx0 + o, by0 + o, bx1 - o, by1 - o], radius=int(S * 0.12) - o, fill=(255, 211, 110, 255))
    # Shine and a heart-shaped keyhole.
    d.rounded_rectangle([bx0 + 2 * o, by0 + 2 * o, bx0 + 5 * o, by1 - 4 * o], radius=int(1.5 * o), fill=(255, 238, 186, 255))
    hx, hy, r = cx, int(S * 0.64), int(S * 0.055)
    d.ellipse([hx - 2 * r, hy - r, hx, hy + r], fill=PLUM)
    d.ellipse([hx, hy - r, hx + 2 * r, hy + r], fill=PLUM)
    d.polygon([(hx - 2 * r + 2, hy + int(r * 0.35)), (hx + 2 * r - 2, hy + int(r * 0.35)), (hx, hy + int(r * 2.6))], fill=PLUM)
    return im.resize((size, size), Image.LANCZOS)


def pip(fill, size=64):
    S = size * SS
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    o = 7 * SS
    d.ellipse([o, o, S - o, S - o], fill=PLUM)
    d.ellipse([2 * o, 2 * o, S - 2 * o, S - 2 * o], fill=fill)
    return im.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    out = os.path.join(sys.argv[1], "UI")
    padlock().save(os.path.join(out, "lock_padlock.png"))
    pip((255, 211, 110, 255)).save(os.path.join(out, "lock_pip_on.png"))
    pip((236, 228, 244, 255)).save(os.path.join(out, "lock_pip_off.png"))
    print("padlock + pips written")
