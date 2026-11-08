#!/usr/bin/env python3
"""YouTube thumbnails (1280x720) for "Never Open Your Door at 3:06 AM": purpose-drawn art (made by
scripts/images/thumbart.py from the film's own character sheets and locations, each a real moment of the
film) + crisp text in code (max 3 words) and at most one red mark.
    .venv/bin/python scripts/make_thumbnails.py   -> youtube/thumbnail_*.jpg
The circle/arrow positions are set per image after looking at the generated scene (MARKS)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'youtube'
FONT = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
W, H = 1280, 720
RED, WHITE = (255, 38, 38), (255, 255, 255)


def base(shot: str, scale: float, cx: float, cy: float, at: tuple[int, int]) -> Image.Image:
    """Place the redraw so that its point (cx, cy) (1920x1080 coords) lands on canvas point `at`."""
    im = Image.open(ROOT / 'public' / 'restyle' / f'{shot}.jpg').convert('RGB')
    im = im.resize((int(1920 * scale), int(1080 * scale)), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), (4, 6, 12))
    canvas.paste(im, (int(at[0] - cx * scale), int(at[1] - cy * scale)))
    canvas = ImageEnhance.Contrast(canvas).enhance(1.12)
    canvas = ImageEnhance.Color(canvas).enhance(1.1)
    return canvas


def vignette(im: Image.Image, strength: float = 0.75, side: str | None = None) -> Image.Image:
    mask = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-W * 0.25, -H * 0.3, W * 1.25, H * 1.3), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(160))
    dark = Image.new('RGB', (W, H), (0, 0, 0))
    out = Image.composite(im, Image.blend(im, dark, strength), mask)
    if side == 'left':  # darker left half for the text
        grad = Image.linear_gradient('L').rotate(90).resize((W, H))
        out = Image.composite(Image.blend(out, dark, 0.55), out, grad.point(lambda v: int(v * 0.9)))
    return out


def text(im: Image.Image, lines, x: int, y: int, size: int, max_w: int, gap: int = 6) -> None:
    d = ImageDraw.Draw(im)
    for words, color in lines:
        s = size
        f = ImageFont.truetype(FONT, s)
        while d.textlength(words, font=f) > max_w and s > 40:
            s -= 4
            f = ImageFont.truetype(FONT, s)
        stroke = max(6, s // 11)
        # soft shadow, then hard stroke
        sh = Image.new('L', (W, H), 0)
        ImageDraw.Draw(sh).text((x + 8, y + 10), words, font=f, fill=200, stroke_width=stroke, stroke_fill=200)
        im.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(10)))
        d.text((x, y), words, font=f, fill=color, stroke_width=stroke, stroke_fill=(0, 0, 0))
        y += int(s * 1.02) + gap


def red_circle(im: Image.Image, cx: float, cy: float, rx: float, ry: float, width: int = 12) -> None:
    """Hand-drawn looking red circle: two slightly offset strokes."""
    d = ImageDraw.Draw(im)
    for dx, dy, w in [(0, 0, width), (5, -4, width // 2)]:
        d.ellipse((cx - rx + dx, cy - ry + dy, cx + rx + dx, cy + ry + dy), outline=RED, width=w)


def red_arrow(im: Image.Image, x0: float, y0: float, x1: float, y1: float, width: int = 16) -> None:
    import math
    d = ImageDraw.Draw(im)
    d.line((x0, y0, x1, y1), fill=RED, width=width)
    a = math.atan2(y1 - y0, x1 - x0)
    head = 46
    pts = [(x1, y1), (x1 - head * math.cos(a - 0.45), y1 - head * math.sin(a - 0.45)), (x1 - head * math.cos(a + 0.45), y1 - head * math.sin(a + 0.45))]
    d.polygon(pts, fill=RED)


def bottom_shade(im: Image.Image, start: float = 0.55, amount: float = 0.75) -> Image.Image:
    grad = Image.linear_gradient('L').resize((W, H))  # 0 at top -> 255 at bottom
    grad = grad.point(lambda v: 0 if v < start * 255 else int((v - start * 255) / (255 * (1 - start)) * 255 * amount))
    return Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, grad)



def frame(name: str, scale: float, cx: float, cy: float, at: tuple[int, int], canvas: Image.Image | None = None, box=None) -> Image.Image:
    """Paste a film frame (public/restyle/<name>) so its point (cx, cy) (1920x1080) lands on `at`."""
    im = Image.open(ROOT / 'public' / 'restyle' / name).convert('RGB')
    im = im.resize((int(1920 * scale), int(1080 * scale)), Image.LANCZOS)
    c = canvas if canvas is not None else Image.new('RGB', (W, H), (4, 6, 12))
    layer = Image.new('RGB', (W, H), (4, 6, 12))
    layer.paste(im, (int(at[0] - cx * scale), int(at[1] - cy * scale)))
    if box is None:
        return layer
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rectangle(box, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(28))
    return Image.composite(layer, c, mask)


def pop(im: Image.Image) -> Image.Image:
    im = ImageEnhance.Brightness(im).enhance(1.18)
    im = ImageEnhance.Contrast(im).enhance(1.22)
    return ImageEnhance.Color(im).enhance(1.15)


def art(name: str) -> Image.Image:
    """Purpose-drawn thumbnail art (scripts/images/thumbart.py -> youtube/art/<name>.jpg), 1280x720."""
    return Image.open(ROOT / 'youtube' / 'art' / f'{name}.jpg').convert('RGB').resize((W, H), Image.LANCZOS)


def lift(im: Image.Image, gamma: float = 0.82, contrast: float = 1.18, color: float = 1.2) -> Image.Image:
    """Brighter mid-tones (thumbnails are seen small, often on a dark page), more contrast and colour."""
    lut = [int(255 * (v / 255) ** gamma) for v in range(256)]
    im = im.point(lut * 3)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    return ImageEnhance.Color(im).enhance(color)


def side_shade(im: Image.Image, until: float, amount: float = 0.7) -> Image.Image:
    """Darken the left part of the frame (0 -> until*W) so the title reads over it."""
    grad = Image.linear_gradient('L').rotate(90).resize((W, H))  # 255 at left -> 0 at right
    grad = grad.point(lambda v: int(min(255, max(0, (v - 255 * (1 - until)) / (255 * until) * 255)) * amount))
    return Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, grad)


def glow(im: Image.Image, box: tuple[int, int, int, int], gain: float = 1.6) -> Image.Image:
    """Brighten one region with a soft edge (the light under the door)."""
    bright = ImageEnhance.Brightness(im).enhance(gain)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rectangle(box, fill=255)
    return Image.composite(bright, im, mask.filter(ImageFilter.GaussianBlur(14)))


def centered(im: Image.Image, words: str, size: int) -> int:
    """x that centres one line of title text at this size."""
    return int((W - ImageDraw.Draw(im).textlength(words, font=ImageFont.truetype(FONT, size))) / 2)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    # A - THEY CHOSE ME: the door forced open; Mr. Harris with the master key, the creature towering behind him
    a = lift(art('key'))
    a = side_shade(a, 0.42, 0.55)
    text(a, [('THEY', WHITE), ('CHOSE', WHITE), ('ME', RED)], 30, 170, 136, 350, gap=-4)
    a.save(OUT / 'thumbnail_A_they_chose_me.jpg', quality=92)
    # B - 3:06 AM: through the peephole, every neighbour staring at her door; the creature at the top of the stairs
    b = lift(art('peep'), gamma=0.86)
    red_circle(b, 618, 158, 34, 72, width=9)  # the creature at the end of the corridor
    b = bottom_shade(b, 0.62, 0.85)
    f = ImageFont.truetype(FONT, 150)
    text(b, [('3:06 AM', RED)], int((W - ImageDraw.Draw(b).textlength('3:06 AM', font=f)) / 2), 548, 150, 900)
    b.save(OUT / 'thumbnail_B_306am.jpg', quality=92)
    # C - DON'T OPEN IT: Sarah against her door, hand over her mouth; feet in the light under the door
    c = lift(art('door'), gamma=0.8)
    c = glow(c, (205, 632, 420, 720), 1.7)
    red_arrow(c, 470, 520, 330, 640, width=12)
    text(c, [("DON'T", WHITE), ('OPEN IT', RED)], 40, 70, 140, 470, gap=-4)
    c.save(OUT / 'thumbnail_C_dont_open.jpg', quality=92)
    print('youtube/thumbnail_A_they_chose_me.jpg, thumbnail_B_306am.jpg, thumbnail_C_dont_open.jpg')

    # ---- mystery set: shows nothing of what is happening, only the question ----
    # D - EVERY DOOR OPENED: the empty corridor at 3:06, every door open onto black rooms - except one
    d = lift(art('doors'), gamma=0.85)
    red_circle(d, 862, 372, 62, 300, width=10)  # the one door that stayed shut
    d = bottom_shade(d, 0.55, 0.8)
    # bottom-left, two lines: clear of the circled door and of YouTube's duration badge (bottom-right)
    text(d, [('EVERY DOOR', WHITE), ('OPENED...', RED)], 34, 452, 118, 720, gap=-2)
    d.save(OUT / 'thumbnail_D_every_door.jpg', quality=92)
    # E - WHO'S THERE?: from inside, only the light under her door and the shadows of two feet
    e = lift(art('under'), gamma=0.72, contrast=1.15, color=1.25)
    e = glow(e, (280, 430, 1080, 720), 1.25)
    text(e, [("WHO'S THERE?", WHITE)], centered(e, "WHO'S THERE?", 150), 70, 150, 1200)
    e.save(OUT / 'thumbnail_E_whos_there.jpg', quality=92)
    # F - DON'T MAKE A SOUND: the neighbours from behind, facing the black stairwell; Mr. Harris turns back - "shh"
    f = lift(art('shh'), gamma=0.86)
    f = bottom_shade(f, 0.55, 0.8)
    text(f, [("DON'T MAKE", WHITE), ('A SOUND', RED)], 34, 476, 112, 640, gap=-2)
    f.save(OUT / 'thumbnail_F_dont_make_a_sound.jpg', quality=92)
    print('youtube/thumbnail_D_every_door.jpg, thumbnail_E_whos_there.jpg, thumbnail_F_dont_make_a_sound.jpg')


if __name__ == '__main__':
    main()
