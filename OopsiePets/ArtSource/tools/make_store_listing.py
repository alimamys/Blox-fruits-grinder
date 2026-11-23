#!/usr/bin/env python3
"""Make the Google Play store listing graphics from the game's own art and screenshots.

  icon_512.png              512 x 512, full square (Google Play rounds the corners itself)
  feature_graphic.png       1024 x 500, no transparency
  screenshot_N_<name>.jpg   1080 x 1920 phone screenshots with a short caption for parents

Usage: python3 -I make_store_listing.py <Assets/OopsiePets/Art> <raw screenshots dir> <out dir>
Raw screenshots: 1080x1920 captures named raw_1_clubhouse.png ... raw_6_album.png.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PLUM = (92, 58, 110)
PINK = (255, 122, 172)
LAV_TOP, LAV_BOTTOM = (243, 233, 252), (220, 236, 247)
BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf"
SEMI = "/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf"


def font(path, size):
    for p in (path, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def gradient(w, h, top, bottom):
    g = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    return g


def outlined_text(d, xy, text, f, fill, stroke=(255, 255, 255), sw=8, anchor="mm"):
    d.text(xy, text, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke, anchor=anchor)


def icon(art, out):
    s = 512
    im = gradient(s, s, (250, 232, 246), (226, 214, 250)).convert("RGBA")
    pup = Image.open(f"{art}/Stickers/sticker_puppy_happy.png").convert("RGBA")
    k = 470 / max(pup.size)
    pup = pup.resize((round(pup.width * k), round(pup.height * k)), Image.LANCZOS)
    im.alpha_composite(pup, ((s - pup.width) // 2, (s - pup.height) // 2 + 8))
    im.convert("RGB").save(f"{out}/icon_512.png", optimize=True)


def feature(art, out):
    w, h = 1024, 500
    bg = Image.open(f"{art}/Backgrounds/bg_clubhouse.png").convert("RGB")
    k = w / bg.width
    bg = bg.resize((w, round(bg.height * k)), Image.LANCZOS)
    top = int(bg.height * 0.18)
    im = bg.crop((0, top, w, top + h)).filter(ImageFilter.GaussianBlur(3)).convert("RGBA")
    veil = Image.new("RGBA", (w, h), (255, 248, 252, 120))
    im.alpha_composite(veil)
    # A cluster of friends' stickers on the right.
    names = ["puppy_happy", "kitten_sleeping", "bunny_dancing", "panda_bamboo", "piglet_puddle", "unicorn_rainbow"]
    spots = [(700, 70, 200), (860, 60, 190), (610, 250, 200), (780, 245, 210), (900, 270, 185), (700, 160, 0)]
    for (x, y, size), n in zip(spots, names):
        if size == 0:
            continue
        st = Image.open(f"{art}/Stickers/sticker_{n}.png").convert("RGBA")
        k = size / max(st.size)
        st = st.resize((round(st.width * k), round(st.height * k)), Image.LANCZOS)
        im.alpha_composite(st, (x - st.width // 2 + 40, y))
    d = ImageDraw.Draw(im)
    title = font(BOLD, 112)
    outlined_text(d, (300, 200), "Oopsie", title, PLUM, sw=10)
    outlined_text(d, (300, 315), "Pets!", title, PINK, sw=10)
    outlined_text(d, (300, 410), "Wash, play & dress up!", font(SEMI, 40), PLUM, sw=6)
    im.convert("RGB").save(f"{out}/feature_graphic.png", optimize=True)


SHOTS = [
    ("1_clubhouse", "11 cute pets to care for"),
    ("2_garden", "Play outside and get muddy!"),
    ("3_bath", "Splashy bubble baths"),
    ("4_teeth", "Brush little teeth"),
    ("5_dressup", "Dress up, then earn a rainbow coat"),
    ("6_album", "A sticker for every friend"),
]


def rounded(img, r):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.width - 1, img.height - 1], r, fill=255)
    out = img.convert("RGBA")
    out.putalpha(m)
    return out


def screenshot(raw, out, name, caption):
    W, H = 1080, 1920
    canvas = gradient(W, H, LAV_TOP, LAV_BOTTOM).convert("RGBA")
    d = ImageDraw.Draw(canvas)
    f = font(BOLD, 74)
    # Wrap the caption to two lines if needed.
    words, lines, cur = caption.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) > W - 120 and cur:
            lines.append(cur); cur = wd
        else:
            cur = t
    lines.append(cur)
    y0 = 150 if len(lines) == 1 else 110
    for i, ln in enumerate(lines):
        outlined_text(d, (W // 2, y0 + i * 90), ln, f, PLUM, sw=8)
    shot = Image.open(f"{raw}/raw_{name}.png").convert("RGB")
    sh = 1560
    sw_ = round(shot.width * sh / shot.height)
    shot = rounded(shot.resize((sw_, sh), Image.LANCZOS), 48)
    x, y = (W - sw_) // 2, H - sh - 70
    shadow = Image.new("RGBA", (sw_ + 60, sh + 60), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([30, 36, sw_ + 30, sh + 36], 52, fill=(92, 58, 110, 70))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(16)), (x - 30, y - 30))
    border = Image.new("RGBA", (sw_ + 20, sh + 20), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle([0, 0, sw_ + 19, sh + 19], 56, fill=(255, 255, 255, 255))
    canvas.alpha_composite(border, (x - 10, y - 10))
    canvas.alpha_composite(shot, (x, y))
    canvas.convert("RGB").save(f"{out}/screenshot_{name}.jpg", quality=90, optimize=True)


if __name__ == "__main__":
    art, raw, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    icon(art, out)
    feature(art, out)
    for n, c in SHOTS:
        if os.path.exists(f"{raw}/raw_{n}.png"):
            screenshot(raw, out, n, c)
    print("store listing graphics written to", out)
