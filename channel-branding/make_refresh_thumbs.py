#!/usr/bin/env python3
"""Fresh thumbnails for the four Daddy Tales films - each in its OWN look, made from real frames of the
film it advertises (no new generated art), with real-world typography and a printed/photographed finish
instead of the glossy shared template (same font, white+red text, red circles) the first sets used.

    ../widemouth-horror/.venv/bin/python make_refresh_thumbs.py   ->  refresh/*.jpg (1280x720) + refresh/preview_all.jpg

Read-only use of the film projects' frames (frame240-horror is never modified).
"""
from __future__ import annotations

import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / 'refresh'
W, H = 1280, 720
F = {
    'hand': str(HERE / 'fonts' / 'Caveat-Bold.ttf'),
    'type': str(HERE / 'fonts' / 'SpecialElite-Regular.ttf'),
    'ui': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    'uib': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'mono': '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
    'serif': '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
    'serif_i': '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf',
}


def font(k: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(F[k], size)


def frame(project: str, shot: str) -> Image.Image:
    return Image.open(ROOT / project / 'public' / 'restyle' / f'{shot}.jpg').convert('RGB')


def grain(im: Image.Image, amount: float = 7.0, seed: int = 1) -> Image.Image:
    r = np.random.default_rng(seed)
    a = np.asarray(im).astype(np.float32)
    n = r.normal(0, amount, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def soften(im: Image.Image, sat=0.82, con=0.95, bright=1.0) -> Image.Image:
    """Take the 'rendered' edge off: a little less colour and contrast, like a print or a screen photo."""
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(con)
    return ImageEnhance.Brightness(im).enhance(bright)


def cover(im: Image.Image, w: int, h: int, cx=0.5, cy=0.5) -> Image.Image:
    s = max(w / im.width, h / im.height)
    im = im.resize((math.ceil(im.width * s), math.ceil(im.height * s)), Image.LANCZOS)
    x = int((im.width - w) * cx)
    y = int((im.height - h) * cy)
    return im.crop((x, y, x + w, y + h))


# ---------------------------------------------------------------------------
# 1. FRAME 240 - a screenshot of the animation app: the extra frame on the timeline
# ---------------------------------------------------------------------------
def frame240() -> Image.Image:
    im = Image.new('RGB', (W, H), (30, 31, 34))
    d = ImageDraw.Draw(im)
    # menu bar
    d.rectangle((0, 0, W, 34), fill=(43, 44, 48))
    x = 14
    for t in ('File', 'Edit', 'Layer', 'Timeline', 'View', 'Help'):
        d.text((x, 8), t, font=font('ui', 17), fill=(196, 198, 204))
        x += d.textlength(t, font=font('ui', 17)) + 22
    t = 'hallway_loop_v7.anim'
    d.text((W - d.textlength(t, font=font('ui', 16)) - 16, 9), t, font=font('ui', 16), fill=(140, 142, 150))
    # viewer
    vx0, vy0, vw, vh = 22, 50, 960, 540
    shot = soften(frame('frame240-horror', 'co_10_figure_real_k1'), 0.85, 1.0, 1.12)
    im.paste(cover(shot, vw, vh, 0.5, 0.45), (vx0, vy0))
    d.rectangle((vx0 - 1, vy0 - 1, vx0 + vw, vy0 + vh), outline=(70, 72, 78), width=1)
    # side panel: layers
    px = vx0 + vw + 16
    d.rectangle((px, 50, W - 16, 590), fill=(37, 38, 42))
    d.text((px + 12, 60), 'LAYERS', font=font('uib', 15), fill=(150, 152, 160))
    rows = [('Background', (180, 182, 190)), ('Hallway', (180, 182, 190)), ('Lighting', (180, 182, 190)), ('Layer 4', (235, 80, 70))]
    for i, (name, col) in enumerate(rows):
        y = 92 + i * 46
        d.rectangle((px + 8, y, W - 24, y + 38), fill=(48, 49, 54) if i < 3 else (64, 40, 40))
        d.ellipse((px + 18, y + 13, px + 30, y + 25), outline=(150, 152, 160), width=2)
        d.text((px + 42, y + 9), name, font=font('ui', 18), fill=col)
    d.text((px + 12, 300), 'Layer 4', font=font('uib', 16), fill=(235, 80, 70))
    d.text((px + 12, 324), 'created: 3:41 AM', font=font('ui', 15), fill=(150, 152, 160))
    d.text((px + 12, 346), 'author: (none)', font=font('ui', 15), fill=(150, 152, 160))
    # timeline
    ty = 606
    d.rectangle((0, ty - 6, W, H), fill=(37, 38, 42))
    thumb = cover(soften(frame('frame240-horror', 'co_09_hall_dark_k1'), 0.8), 96, 54)
    thumb_fig = cover(shot, 96, 54, 0.5, 0.45)
    for i, n in enumerate(range(233, 241)):
        x = 22 + i * 108
        im.paste(thumb_fig if n == 240 else thumb, (x, ty + 26))
        d.text((x + 30, ty + 2), str(n), font=font('mono', 16), fill=(255, 214, 90) if n == 240 else (150, 152, 160))
        if n == 240:
            d.rectangle((x - 3, ty + 23, x + 99, ty + 83), outline=(255, 214, 90), width=3)
    d.line((22 + 7 * 108 + 48, ty - 6, 22 + 7 * 108 + 48, H), fill=(235, 80, 70), width=2)
    d.text((22 + 8 * 108 + 10, ty + 40), '240 / 239 frames', font=font('mono', 18), fill=(235, 80, 70))
    # a note scribbled on the screen grab
    d.rounded_rectangle((418, 82, 616, 404), radius=18, outline=(255, 226, 120), width=4)
    d.text((630, 96), "I didn't", font=font('hand', 76), fill=(255, 226, 120))
    d.text((630, 168), 'draw this.', font=font('hand', 76), fill=(255, 226, 120))
    return grain(im, 3.0, 11)


# ---------------------------------------------------------------------------
# 2. 3:06 AM - the peephole, every door open, a red bedside clock
# ---------------------------------------------------------------------------
SEG = {'0': 'abcdef', '3': 'abcdg', '6': 'acdefg'}


def seven(d: ImageDraw.ImageDraw, x, y, ch, s, col, off):
    """One 7-segment digit like a bedside clock (hexagonal bars, slight forward slant); s = digit height."""
    w, t, g = s * 0.56, s * 0.13, s * 0.012
    sl = 0.07  # slant

    def P(px, py):
        return (px + (y + s - py) * sl, py)

    def hor(yc):
        xl, xr = x + t / 2, x + w - t / 2
        return [P(xl + g, yc), P(xl + t / 2 + g, yc - t / 2), P(xr - t / 2 - g, yc - t / 2), P(xr - g, yc), P(xr - t / 2 - g, yc + t / 2), P(xl + t / 2 + g, yc + t / 2)]

    def ver(xc, ys, ye):
        return [P(xc, ys + g), P(xc + t / 2, ys + t / 2 + g), P(xc + t / 2, ye - t / 2 - g), P(xc, ye - g), P(xc - t / 2, ye - t / 2 - g), P(xc - t / 2, ys + t / 2 + g)]

    ya, yg, yd = y + t / 2, y + s / 2, y + s - t / 2
    pts = {'a': hor(ya), 'g': hor(yg), 'd': hor(yd), 'f': ver(x + t / 2, ya, yg), 'b': ver(x + w - t / 2, ya, yg),
           'e': ver(x + t / 2, yg, yd), 'c': ver(x + w - t / 2, yg, yd)}
    for k, p in pts.items():
        d.polygon(p, fill=col if k in SEG[ch] else off)
    return w


def fisheye(img: np.ndarray, k: float = 0.42) -> np.ndarray:
    h, w = img.shape[:2]
    yy, xx = np.indices((h, w), dtype=np.float32)
    nx, ny = (xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)
    r2 = nx * nx + ny * ny
    f = 1 / (1 + k * r2)
    mx = (nx * f) * (w / 2) + w / 2
    my = (ny * f) * (h / 2) + h / 2
    return cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


def door306() -> Image.Image:
    im = Image.new('RGB', (W, H), (6, 6, 8))
    D = 600
    src = cover(frame('door306-horror', 'd_01_corridor_doors_k1_open'), D, D, 0.5, 0.42)
    src = soften(src, 0.75, 1.02, 1.05)
    a = fisheye(np.asarray(src), 0.55).astype(np.float32)
    yy, xx = np.indices((D, D))
    r = np.sqrt((xx - D / 2) ** 2 + (yy - D / 2) ** 2) / (D / 2)
    vig = np.clip(1.15 - r ** 3 * 0.9, 0, 1)[..., None]
    a = a * vig * np.array([0.92, 1.0, 0.86])  # old glass, a sickly green
    mask = Image.fromarray((np.clip((1 - r) * 60, 0, 1) * 255).astype(np.uint8))
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (90, 60), mask)
    d = ImageDraw.Draw(im)
    d.ellipse((86, 56, 90 + D + 4, 60 + D + 4), outline=(40, 34, 26), width=10)  # the brass rim
    # the clock
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    g = ImageDraw.Draw(glow)
    x, y, s = 770, 220, 170
    red, off = (255, 46, 32), (34, 8, 8)
    for ch in '3':
        x += seven(g, x, y, ch, s, red, off) + 26
    g.ellipse((x, y + s * 0.28, x + 16, y + s * 0.28 + 16), fill=red)
    g.ellipse((x, y + s * 0.66, x + 16, y + s * 0.66 + 16), fill=red)
    x += 44
    for ch in '06':
        x += seven(g, x, y, ch, s, red, off) + 26
    g.text((x - 6, y + s - 30), 'AM', font=font('uib', 28), fill=red)
    im = Image.composite(glow, im, glow.convert('L').point(lambda v: 255 if v > 40 else 0))
    im = Image.fromarray(np.clip(np.asarray(im).astype(np.float32) + np.asarray(glow.filter(ImageFilter.GaussianBlur(18))).astype(np.float32) * 0.8, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.text((772, 440), 'every door', font=font('type', 58), fill=(226, 222, 210))
    d.text((772, 506), 'opened.', font=font('type', 58), fill=(226, 222, 210))
    return grain(im, 5.0, 12)


# ---------------------------------------------------------------------------
# 3. GOATMAN - a camp photo on the table, someone wrote on it
# ---------------------------------------------------------------------------
def wood(seed=3) -> Image.Image:
    r = np.random.default_rng(seed)
    y = np.arange(H)[:, None].astype(np.float32)
    x = np.arange(W)[None, :].astype(np.float32)
    n = r.normal(0, 1, (H // 8 + 1, 1)).repeat(8, 0)[:H]
    rings = np.sin(y / 9.0 + np.sin(x / 140.0) * 2.2 + n * 0.6) * 0.5 + 0.5
    base = np.stack([52 + rings * 30, 34 + rings * 20, 22 + rings * 12], -1)
    base += r.normal(0, 4, (H, W, 1))
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def goatman() -> Image.Image:
    im = wood()
    # the instant photo
    pw, ph, side, bottom = 560, 420, 26, 110
    photo = cover(frame('goatman-horror', 't_09_bench_k1'), pw, ph, 0.62, 0.5)
    photo = soften(photo, 0.7, 0.9, 1.08)
    photo = Image.blend(photo, Image.new('RGB', photo.size, (236, 210, 160)), 0.12)  # an old print
    card = Image.new('RGB', (pw + 2 * side, ph + side + bottom), (238, 234, 222))
    card.paste(photo, (side, side))
    cd = ImageDraw.Draw(card)
    cd.text((side + 8, ph + side + 14), 'camp, night 2 - all 11 of us', font=font('hand', 52), fill=(28, 44, 92))
    card = grain(card, 4.0, 13).convert('RGBA')
    rot = card.rotate(-5, resample=Image.BICUBIC, expand=True)
    sh = Image.new('L', rot.size, 0)
    sh.paste(rot.split()[3].point(lambda v: 150 if v else 0), (0, 0))
    im.paste((0, 0, 0), (98, 46), sh.filter(ImageFilter.GaussianBlur(16)))
    im.paste(rot, (80, 30), rot)
    # a sticky note
    note = Image.new('RGB', (330, 290), (240, 214, 92))
    nd = ImageDraw.Draw(note)
    nd.text((26, 30), 'count', font=font('hand', 88), fill=(150, 30, 26))
    nd.text((26, 128), 'again.', font=font('hand', 88), fill=(150, 30, 26))
    note = grain(note, 5.0, 14).convert('RGBA').rotate(6, resample=Image.BICUBIC, expand=True)
    sh = Image.new('L', note.size, 0)
    sh.paste(note.split()[3].point(lambda v: 130 if v else 0), (0, 0))
    im.paste((0, 0, 0), (902, 214), sh.filter(ImageFilter.GaussianBlur(12)))
    im.paste(note, (890, 200), note)
    return grain(im, 3.0, 15)


# ---------------------------------------------------------------------------
# 4. MR. WIDEMOUTH - the cover of an old children's book
# ---------------------------------------------------------------------------
def widemouth() -> Image.Image:
    r = np.random.default_rng(4)
    paper = np.full((H, W, 3), (234, 223, 198), np.float32)
    paper += r.normal(0, 5, (H, W, 1))
    yy, xx = np.indices((H, W))
    edge = np.clip(1 - (np.minimum(np.minimum(xx, W - xx), np.minimum(yy, H - yy)) / 90.0), 0, 1)[..., None]
    paper -= edge * np.array([60, 66, 70])  # the worn edges of a cover
    im = Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    # the illustration plate
    px0, py0, pw, ph = 640, 70, 560, 560
    plate = cover(frame('widemouth-horror', 'u_05_mouth_k1_vwide'), pw, ph, 0.5, 0.35)
    plate = soften(plate, 0.78, 0.92, 1.08)
    plate = Image.blend(plate, Image.new('RGB', plate.size, (226, 206, 168)), 0.14)
    im.paste(plate, (px0, py0))
    ink = (52, 38, 28)
    d.rectangle((px0 - 10, py0 - 10, px0 + pw + 10, py0 + ph + 10), outline=ink, width=3)
    d.rectangle((px0 - 18, py0 - 18, px0 + pw + 18, py0 + ph + 18), outline=ink, width=1)
    # the title
    size = 120
    while d.textlength('Widemouth', font=font('serif', size)) > 520:
        size -= 2
    d.text((84, 190), 'Mr.', font=font('serif', 78), fill=ink)
    d.text((78, 280), 'Widemouth', font=font('serif', size), fill=ink)
    d.line((88, 290 + size + 26, 520, 290 + size + 26), fill=ink, width=2)
    d.text((90, 290 + size + 44), 'a bedtime story', font=font('serif_i', 48), fill=(120, 40, 30))
    return grain(im, 4.0, 16)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    made = {
        'frame240_thumbnail_v2.jpg': frame240(),
        'door306_thumbnail_v2.jpg': door306(),
        'goatman_thumbnail_v2.jpg': goatman(),
        'widemouth_thumbnail_v2.jpg': widemouth(),
    }
    for name, im in made.items():
        im.save(OUT / name, quality=92)
    S = Image.new('RGB', (W, H), (0, 0, 0))
    for k, im in enumerate(made.values()):
        S.paste(im.resize((W // 2, H // 2), Image.LANCZOS), ((k % 2) * W // 2, (k // 2) * H // 2))
    S.save(OUT / 'preview_all.jpg', quality=88)
    print(', '.join(made))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
