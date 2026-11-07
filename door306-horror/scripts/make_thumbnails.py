#!/usr/bin/env python3
"""YouTube thumbnails (1280x720) for "Never Open Your Door at 3:06 AM": composed from the film's own
frames (no extra image cost) + crisp text (max 4 words) and one clear mystery mark.
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


def main() -> None:
    OUT.mkdir(exist_ok=True)
    # A - THEY CHOSE ME: every neighbour staring through the peephole + Sarah's terrified face
    a = frame('d_07_peephole_pov_k1_vturned_peep.jpg', 0.86, 960, 560, (860, 360))
    a = frame('c_08_dread_k1.jpg', 0.78, 640, 470, (300, 400), canvas=a, box=(0, 0, 560, H))
    a = pop(vignette(a, 0.55))
    red_circle(a, 792, 128, 62, 80)  # Mr. Harris, crying, in the middle of them
    a = bottom_shade(a, 0.6, 0.8)
    text(a, [('THEY CHOSE', WHITE), ('ME', RED)], 600, 470, 118, 640, gap=0)
    a.save(OUT / 'thumbnail_A_they_chose_me.jpg', quality=92)
    # B - 3:06 AM: the creature looming behind Mr. Harris
    b = pop(vignette(frame('h_17_creature_k1_vjaw.jpg', 1.05, 1050, 470, (760, 380)), 0.5))
    red_arrow(b, 1210, 300, 965, 118)  # the creature's head
    b = bottom_shade(b, 0.55, 0.85)
    text(b, [('3:06 AM', RED)], 60, 520, 170, 620)
    b.save(OUT / 'thumbnail_B_306am.jpg', quality=92)
    # C - DON'T OPEN IT: her eye at the peephole, wide with terror
    c = pop(vignette(frame('d_14_eye_wide_k1_vwide.jpg', 0.9, 1000, 520, (560, 360)), 0.45))
    red_circle(c, 1010, 340, 70, 150)  # the light of the peephole
    c = bottom_shade(c, 0.6, 0.85)
    text(c, [("DON'T OPEN IT", WHITE)], 60, 560, 128, 1150)
    c.save(OUT / 'thumbnail_C_dont_open.jpg', quality=92)
    print('youtube/thumbnail_A_they_chose_me.jpg, thumbnail_B_306am.jpg, thumbnail_C_dont_open.jpg')


if __name__ == '__main__':
    main()
