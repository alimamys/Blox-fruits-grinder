#!/usr/bin/env python3
"""YouTube thumbnails (1280x720) for "Frame 240": the scenes drawn in the film's 2D style by
scripts/images/thumbnail_gen.py + crisp text (max 4 words) and one clear mystery mark.
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


# where the mystery is in each generated scene (canvas px): set after looking at youtube/gen_*.png
MARKS = {
    'doorway': {'circle': (300, 330, 95, 190)},
    'screen': {'arrow': (520, 120, 330, 300)},
    'wall': {'circle': (930, 380, 170, 250)},
}


def main() -> None:
    OUT.mkdir(exist_ok=True)
    jobs = [
        ('doorway', 'thumbnail_A_doorway.jpg', [('WHO DREW', WHITE), ('HIM?', RED)], (40, 40, 150, 620)),
        ('screen', 'thumbnail_B_frame240.jpg', [('FRAME', WHITE), ('240', RED)], (40, 30, 170, 560)),
        ('wall', 'thumbnail_C_wall.jpg', [('LOOK', WHITE), ('CLOSER.', RED)], (700, 30, 150, 560)),
    ]
    for name, out, words, (x, y, size, max_w) in jobs:
        src = OUT / f'gen_{name}.png'
        if not src.exists():
            print(f'  (no {src.name} yet - run scripts/images/thumbnail_gen.py)')
            continue
        im = Image.open(src).convert('RGB').resize((W, H))
        im = ImageEnhance.Contrast(im).enhance(1.12)
        im = ImageEnhance.Color(im).enhance(1.12)
        im = ImageEnhance.Brightness(im).enhance(1.06)
        mk = MARKS.get(name, {})
        if 'circle' in mk:
            red_circle(im, *mk['circle'])
        if 'arrow' in mk:
            red_arrow(im, *mk['arrow'])
        text(im, words, x, y, size, max_w)
        im.save(OUT / out, quality=92)
    for p in sorted(OUT.glob('thumbnail_*.jpg')):
        print(p.relative_to(ROOT), f'{p.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
