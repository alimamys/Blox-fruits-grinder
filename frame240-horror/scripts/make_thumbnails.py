#!/usr/bin/env python3
"""YouTube thumbnails (1280x720) from the film's own redrawn shots + bold text.
    .venv/bin/python scripts/make_thumbnails.py   -> youtube/thumbnail_*.jpg"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'youtube'
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
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


def main() -> None:
    OUT.mkdir(exist_ok=True)
    # A - her smile: "62 NAMES. 63 PEOPLE."
    a = base('peopleInWater_08_k1', 1.0, 960, 470, (975, 330))
    a = vignette(a, 0.6, side='left')
    text(a, [('62 NAMES.', WHITE), ('63 PEOPLE.', RED)], 40, 175, 178, 700)
    a.save(OUT / 'thumbnail_A_smile.jpg', quality=92)
    # B - alone on the bench, seen from behind
    b = base('hook_08_k1', 0.9, 960, 640, (640, 575))
    b = vignette(b, 0.7)
    text(b, [("SHE WASN'T", WHITE), ('ON THE LIST', RED)], 70, 22, 124, 1140)
    b.save(OUT / 'thumbnail_B_bench.jpg', quality=92)
    # C - the people standing in the sea
    c = base('peopleInWater_10_k1', 1.1, 960, 520, (640, 430))
    c = vignette(c, 0.65)
    text(c, [('THEY ALL', WHITE), ('CAME BACK.', RED)], 60, 24, 140, 1160)
    c.save(OUT / 'thumbnail_C_water.jpg', quality=92)
    # D - the paused CCTV frame: who is she?
    dd = base('cctv_08_k1', 1280 / 1920, 0, 0, (0, 0))
    dd = ImageEnhance.Brightness(dd).enhance(1.18)
    dd = ImageEnhance.Contrast(dd).enhance(1.1)
    dd = bottom_shade(dd, 0.5, 0.8)
    red_circle(dd, 444, 262, 112, 104)
    red_arrow(dd, 760, 470, 560, 330)
    text(dd, [('WHO IS SHE?', WHITE)], 600, 520, 150, 660)
    dd.save(OUT / 'thumbnail_D_cctv.jpg', quality=92)
    # E / F - scenes drawn for the thumbnail (scripts/images/thumbnail_gen.py)
    if (OUT / 'gen_behind.png').exists():
        e = Image.open(OUT / 'gen_behind.png').convert('RGB')
        e = ImageEnhance.Brightness(e).enhance(1.06)
        text(e, [("DON'T", WHITE), ('TURN', WHITE), ('AROUND.', RED)], 44, 110, 158, 560)
        e.save(OUT / 'thumbnail_E_behind.jpg', quality=92)
    if (OUT / 'gen_counter.png').exists():
        f = Image.open(OUT / 'gen_counter.png').convert('RGB')
        f = ImageEnhance.Brightness(f).enhance(1.05)
        text(f, [('ONE TOO MANY.', RED)], 36, 22, 124, 760)
        f.save(OUT / 'thumbnail_F_counter.jpg', quality=92)
    for p in sorted(OUT.glob('thumbnail_*.jpg')):
        print(p.relative_to(ROOT), f'{p.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
