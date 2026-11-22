#!/usr/bin/env python3
"""Draw the padlock shown on friends that need the full version, and the star lock shown (in the full
version) on friends that are earned by playing: an empty star and a gold star with the same outline, so
the game can fill the big star from the bottom up and use small stars as progress marks. Drawn in
code, supersampled for smooth edges.

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


def star(fill, size=256, glint=False):
    """A plump five-point star (rounded by a thick outline); the shape spans 4%..96% of the height."""
    import math
    S = size * SS
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    o = 11 * SS
    top, bottom = 0.04 * S + o / 2, 0.96 * S - o / 2
    R = (bottom - top) / (1 + math.cos(math.radians(36)))
    cx, cy = S / 2, top + R
    pts = []
    for i in range(10):
        r = R if i % 2 == 0 else R * 0.52
        a = math.radians(-90 + i * 36)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0], pts[1]], fill=PLUM, width=o, joint="curve")
    if glint:
        d.ellipse([cx - R * 0.36, cy - R * 0.3, cx - R * 0.14, cy - R * 0.04], fill=(255, 246, 214, 255))
    return im.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    out = os.path.join(sys.argv[1], "UI")
    padlock().save(os.path.join(out, "lock_padlock.png"))
    star((238, 230, 246, 255)).save(os.path.join(out, "lock_star_empty.png"))
    star((255, 206, 92, 255), glint=True).save(os.path.join(out, "lock_star_full.png"))
    print("padlock + stars written")
