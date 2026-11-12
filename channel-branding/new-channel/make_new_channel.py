#!/usr/bin/env python3
"""Branding for the new channel "Past Bedtime Tales" - drawn as graphic art in code (no generated images):

  icon:   an old twin-bell alarm clock stopped at 3:06, two small eyes glowing inside its face
  banner: a night sky, a crescent moon, and a skyline of silhouettes from the films (the farmhouse on its
          hill, the camping trailer, the apartment block) with a few lit windows; the name inside the
          1546x423 area every device shows

    ../../widemouth-horror/.venv/bin/python make_new_channel.py
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
SERIF_I = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
CREAM, RED, INK, AMBER = (239, 230, 210), (214, 48, 40), (8, 10, 20), (255, 196, 92)


def grain(im, amt=5.0, seed=1):
    r = np.random.default_rng(seed)
    a = np.asarray(im).astype(np.float32) + r.normal(0, amt, (im.height, im.width, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def radial(w, h, c0, c1, cx=0.5, cy=0.5, power=1.4):
    yy, xx = np.indices((h, w))
    d = np.sqrt(((xx - cx * w) / (w * 0.75)) ** 2 + ((yy - cy * h) / (h * 0.75)) ** 2)
    t = np.clip(d, 0, 1)[..., None] ** power
    a = np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t
    return Image.fromarray(a.astype(np.uint8))


def glow_dot(im, c, r, col, k=1.0, core=True):
    lay = Image.new('RGB', im.size, (0, 0, 0))
    ImageDraw.Draw(lay).ellipse((c[0] - r * 3, c[1] - r * 3, c[0] + r * 3, c[1] + r * 3), fill=col)
    lay = lay.filter(ImageFilter.GaussianBlur(r * 2.2))
    a = np.asarray(im).astype(np.float32) + np.asarray(lay).astype(np.float32) * k
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if core:
        ImageDraw.Draw(im).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=(255, 240, 200))
    return im


def hand(d, c, angle_deg, length, width, col):
    a = math.radians(angle_deg - 90)
    x, y = c[0] + math.cos(a) * length, c[1] + math.sin(a) * length
    d.line((c[0], c[1], x, y), fill=col, width=width)
    d.ellipse((x - width / 2, y - width / 2, x + width / 2, y + width / 2), fill=col)


# ---------------------------------------------------------------------------
def icon() -> Image.Image:
    S = 800
    im = radial(S, S, (24, 34, 72), (5, 7, 16), 0.5, 0.45)
    d = ImageDraw.Draw(im)
    r = np.random.default_rng(3)
    for _ in range(40):
        x, y = r.uniform(60, 740), r.uniform(60, 300)
        s = r.uniform(1.0, 2.6)
        d.ellipse((x - s, y - s, x + s, y + s), fill=(200, 205, 225))
    cx, cy, R = 400, 440, 205
    # bells, hammer, handle (behind the body)
    for bx in (cx - 150, cx + 150):
        d.pieslice((bx - 82, cy - 300, bx + 82, cy - 136), 180, 360, fill=CREAM)
        d.rectangle((bx - 82, cy - 220, bx + 82, cy - 206), fill=CREAM)
    d.rectangle((cx - 9, cy - 262, cx + 9, cy - 200), fill=CREAM)
    d.ellipse((cx - 22, cy - 286, cx + 22, cy - 244), fill=CREAM)
    # legs
    d.polygon([(cx - 150, cy + 150), (cx - 120, cy + 170), (cx - 175, cy + 255), (cx - 205, cy + 240)], fill=CREAM)
    d.polygon([(cx + 150, cy + 150), (cx + 120, cy + 170), (cx + 175, cy + 255), (cx + 205, cy + 240)], fill=CREAM)
    # body and face
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=CREAM)
    f = R - 26
    face = radial(2 * f, 2 * f, (34, 40, 66), (12, 14, 26), 0.5, 0.42)
    mask = Image.new('L', (2 * f, 2 * f), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 2 * f - 1, 2 * f - 1), fill=255)
    im.paste(face, (cx - f, cy - f), mask)
    d = ImageDraw.Draw(im)
    for i in range(12):
        a = math.radians(i * 30 - 90)
        r0, r1 = f - (34 if i % 3 == 0 else 22), f - 10
        d.line((cx + math.cos(a) * r0, cy + math.sin(a) * r0, cx + math.cos(a) * r1, cy + math.sin(a) * r1), fill=CREAM, width=9 if i % 3 == 0 else 5)
    # two eyes watching from inside the face
    im = glow_dot(im, (cx - 52, cy + 78), 13, AMBER, 1.1)
    im = glow_dot(im, (cx + 52, cy + 78), 13, AMBER, 1.1)
    d = ImageDraw.Draw(im)
    # 3:06
    hand(d, (cx, cy), (3 + 6 / 60) * 30, 92, 20, CREAM)
    hand(d, (cx, cy), 6 * 6, 140, 12, CREAM)
    hand(d, (cx, cy), 300, 150, 5, RED)
    d.ellipse((cx - 17, cy - 17, cx + 17, cy + 17), fill=RED)
    return grain(im, 4.0, 5)


# ---------------------------------------------------------------------------
def skyline(d, base, W):
    """Flat silhouettes along the bottom of the visible strip, with a few lit windows. Tall shapes only at
    the far left and right (desktop / TV); the middle stays low so the name and line read cleanly."""
    lit = []
    # far left: the farmhouse on its hill, pines
    d.polygon([(0, base), (0, base - 110), (300, base - 165), (470, base - 110), (560, base)], fill=INK)
    hx, hy = 300, base - 165
    d.rectangle((hx - 90, hy - 115, hx + 90, hy), fill=INK)
    d.polygon([(hx - 110, hy - 115), (hx, hy - 195), (hx + 110, hy - 115)], fill=INK)
    d.rectangle((hx + 38, hy - 236, hx + 60, hy - 150), fill=INK)
    d.rectangle((hx + 90, hy - 58, hx + 160, hy), fill=INK)
    lit += [((hx - 48, hy - 88, hx - 20, hy - 56), AMBER), ((hx + 18, hy - 88, hx + 46, hy - 56), (255, 120, 60))]
    for px, ph in ((60, 230), (140, 170), (470, 200)):
        d.polygon([(px, base - 60 - ph), (px - 45, base - 40), (px + 45, base - 40)], fill=INK)
    # the middle: low scrub and the camping trailer, all below the line of text
    d.polygon([(560, base), (800, base - 40), (1050, base - 20), (1500, base - 46), (1800, base - 18), (2060, base - 40), (2150, base)], fill=INK)
    for px, ph in ((700, 60), (760, 85), (1620, 70), (1700, 95), (1980, 70)):
        d.polygon([(px, base - 30 - ph), (px - 30, base - 20), (px + 30, base - 20)], fill=INK)
    tx = 1140
    d.rounded_rectangle((tx, base - 118, tx + 290, base - 6), radius=38, fill=INK)
    d.ellipse((tx + 195, base - 30, tx + 240, base + 15), fill=INK)
    lit += [((tx + 36, base - 92, tx + 140, base - 56), (255, 150, 50))]
    # far right: the apartment block, one window lit red; a bare tree
    ax, aw, ah = 2120, 360, 300
    d.rectangle((ax, base - ah, ax + aw, base), fill=INK)
    d.rectangle((ax + 50, base - ah - 36, ax + 100, base - ah), fill=INK)
    for row in range(4):
        for col in range(4):
            x0, y0 = ax + 30 + col * 84, base - ah + 30 + row * 68
            if (row, col) in ((0, 3), (1, 1), (2, 2)):
                lit.append(((x0, y0, x0 + 38, y0 + 40), RED if (row, col) == (2, 2) else AMBER))
    d.polygon([(2520, base), (2536, base - 230), (2552, base)], fill=INK)
    d.line((2536, base - 180, 2560, base - 220), fill=INK, width=9)
    d.rectangle((0, base, W, base + 600), fill=INK)
    return lit


def banner() -> Image.Image:
    W, H = 2560, 1440
    sky = np.zeros((H, W, 3), np.float32)
    t = np.linspace(0, 1, H)[:, None]
    sky[..., 0] = 7 + t * 22
    sky[..., 1] = 10 + t * 30
    sky[..., 2] = 24 + t * 60
    im = Image.fromarray(sky.astype(np.uint8))
    d = ImageDraw.Draw(im)
    r = np.random.default_rng(7)
    for _ in range(260):
        x, y = r.uniform(0, W), r.uniform(0, 900)
        s = r.uniform(0.8, 2.4)
        d.ellipse((x - s, y - s, x + s, y + s), fill=(205, 210, 230))
    # crescent moon (inside the visible strip on desktop, left of the name)
    mx, my, mr = 120, 590, 54
    im = glow_dot(im, (mx, my), 40, (90, 100, 150), 0.8, core=False)
    d = ImageDraw.Draw(im)
    moon = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(moon)
    md.ellipse((mx - mr, my - mr, mx + mr, my + mr), fill=255)
    md.ellipse((mx - mr + 34, my - mr - 16, mx + mr + 34, my + mr - 16), fill=0)  # cut away: a true crescent
    im.paste(CREAM, (0, 0), moon.filter(ImageFilter.GaussianBlur(0.8)))
    d = ImageDraw.Draw(im)
    lit = skyline(d, 905, W)
    for box, col in lit:
        x0, y0, x1, y1 = box
        im = glow_dot(im, ((x0 + x1) // 2, (y0 + y1) // 2), 6, col, 0.45)
        ImageDraw.Draw(im).rectangle(box, fill=col)
    d = ImageDraw.Draw(im)
    # the name and line, inside the 1546x423 safe area (x 507-2053, y 508-931)
    f = ImageFont.truetype(SERIF, 130)
    t1, t2 = 'PAST BEDTIME ', 'TALES'
    w1, w2 = d.textlength(t1, font=f), d.textlength(t2, font=f)
    x, y = (W - w1 - w2) / 2, 540
    sh = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sh).text((x, y), t1 + t2, font=f, fill=230, stroke_width=10, stroke_fill=230)
    im.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(im)
    d.text((x, y), t1, font=f, fill=CREAM)
    d.text((x + w1, y), t2, font=f, fill=RED)
    g = ImageFont.truetype(SERIF_I, 50)
    line = 'animated horror stories, for after lights out'
    d.text(((W - d.textlength(line, font=g)) / 2, y + 160), line, font=g, fill=(205, 198, 182))
    return grain(im, 4.0, 9)


def main() -> None:
    ic = icon()
    ic.save(HERE / 'past_bedtime_tales_icon_800.png')
    ba = banner()
    ba.save(HERE / 'past_bedtime_tales_banner_2560x1440.jpg', quality=92)
    m = Image.new('L', (800, 800), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 799, 799), fill=255)
    pv = Image.new('RGB', (1300, 820), (15, 15, 15))
    pv.paste(ic, (10, 10), m)
    y = 30
    for s in (176, 88, 40):
        pv.paste(ic.resize((s, s), Image.LANCZOS), (870, y), m.resize((s, s)))
        y += s + 30
    pv.save(HERE / 'preview_icon_round.jpg', quality=90)
    sa = ba.copy()
    ImageDraw.Draw(sa).rectangle((507, 508, 2053, 931), outline=(0, 255, 0), width=6)
    sa.resize((1280, 720)).save(HERE / 'preview_banner_safe_area.jpg', quality=88)
    print('icon + banner + previews written')


if __name__ == '__main__':
    main()
