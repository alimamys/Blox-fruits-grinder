#!/usr/bin/env python3
"""Channel art for "Daddy Tales": one purpose-drawn picture in the films' semi-realistic 2D style, then
the channel icon (800x800, safe inside YouTube's round crop) and the banner (2560x1440, the name inside
the 1546x423 area every device shows). The name is set in code (Inter Black, the films' thumbnail
font) - never drawn by the image model.

    ../widemouth-horror/.venv/bin/python make_channel_art.py          # draws the art once ($0.25), then lays out
    ../widemouth-horror/.venv/bin/python make_channel_art.py --layout # only the layout (no new drawing)

Uses the widemouth-horror image pipeline (style reference, API key from its .env, cost ledger, budget cap).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'widemouth-horror' / 'scripts' / 'images'))
import restyle as R  # noqa: E402

ART = HERE / 'art' / 'daddy_tales_art.jpg'
BLACK = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
SEMI = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
WHITE, RED, CREAM = (255, 255, 255), (232, 40, 36), (236, 226, 205)

PROMPT = (
    'A picture for a storytelling channel, in exactly the drawing style of the style reference image (semi-realistic 2D, painted light, '
    'cel shading). No people\'s faces. THE IMAGE: a child\'s bedroom at night, seen low at the level of the bed. In the CENTRE of the '
    'frame, an old open storybook lies on a patchwork quilt, lit by the warm golden circle of a small bedside lamp; its pages glow '
    'softly and show a painted illustration of a dark forest path. A father\'s large hand (a plaid flannel shirt cuff) rests on the '
    'edge of the page, about to turn it. Everything outside the lamp\'s circle falls into deep blue-black shadow - and in that dark, '
    'just above the book and a little to the right, beyond the end of the bed, two small round glossy eyes catch the lamplight, '
    'watching. Nothing else of what owns them is visible. Cozy and creepy at once. The book is centred both ways; the upper third '
    'of the frame is dark and simple (for the channel name). No text, no letters, no numbers, no logos anywhere.'
)


def draw_art() -> None:
    R.load_env()
    R.require_key()
    ART.parent.mkdir(parents=True, exist_ok=True)
    imgs, prompt = R.build_request(None, [], PROMPT)
    img = R.openai_edit(imgs, prompt, 'channel', ART.name, quality='high')
    R.uncanvas(img).save(ART, quality=95)
    print(f'  -> {ART.relative_to(HERE.parent)}   (image spend so far ${R.spent():.2f} of ${R.budget():.2f})')


def lift(im: Image.Image, gamma=0.85, contrast=1.12, color=1.12) -> Image.Image:
    lut = [int(255 * (v / 255) ** gamma) for v in range(256)]
    im = im.point(lut * 3)
    return ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(contrast)).enhance(color)


def shadow_text(im: Image.Image, xy, text, font, fill, stroke=0, blur=10, dark=210) -> None:
    sh = Image.new('L', im.size, 0)
    ImageDraw.Draw(sh).text(xy, text, font=font, fill=dark, stroke_width=stroke + 6, stroke_fill=dark)
    im.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(im).text(xy, text, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))


def fit_font(path, text, width, start):
    size = start
    while size > 10:
        f = ImageFont.truetype(path, size)
        if ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f) <= width:
            return f
        size -= 2
    return ImageFont.truetype(path, size)


def icon(art: Image.Image) -> Image.Image:
    """800x800; everything that matters inside the circle YouTube crops to: the two eyes up in the dark,
    the name low over the glowing book."""
    S = 800
    # a square a little right of centre, so both eyes (art ~1412,300 and ~1478,305) sit inside the circle
    x0, y0, side = 770, 100, 920
    sq = lift(art.crop((x0, y0, x0 + side, y0 + side)).resize((S, S), Image.LANCZOS))
    # darken the lower part so the name reads over the bright pages
    grad = Image.linear_gradient('L').resize((S, S)).point(lambda v: int(min(255, max(0, (v - 70) * 1.35))))
    sq = Image.composite(Image.new('RGB', (S, S), (0, 0, 0)), sq, grad.point(lambda v: int(v * 0.72)))
    d = ImageDraw.Draw(sq)
    f = fit_font(BLACK, 'DADDY', 500, 168)
    for text, y, col in (('DADDY', 400, WHITE), ('TALES', 400 + f.size * 0.95, RED)):
        tw = d.textlength(text, font=f)
        shadow_text(sq, ((S - tw) / 2, y), text, f, col, stroke=4)
    return sq


def banner(art: Image.Image) -> Image.Image:
    """2560x1440; the name and line inside the centre 1546x423 shown on every device."""
    W, H = 2560, 1440
    w, h = art.size
    scale = max(W / w, H / h)
    b = art.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    b = b.crop(((b.width - W) // 2, (b.height - H) // 2, (b.width - W) // 2 + W, (b.height - H) // 2 + H))
    b = lift(b)
    # a soft dark band behind the safe area so the name reads on any device
    band = Image.new('L', (W, H), 0)
    ImageDraw.Draw(band).rectangle((0, 470, W, 970), fill=150)
    b = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), b, band.filter(ImageFilter.GaussianBlur(90)))
    d = ImageDraw.Draw(b)
    f = fit_font(BLACK, 'DADDY TALES', 1300, 230)
    t1, t2 = 'DADDY ', 'TALES'
    w1, w2 = d.textlength(t1, font=f), d.textlength(t2, font=f)
    x = (W - w1 - w2) / 2
    y = 560
    shadow_text(b, (x, y), t1, f, WHITE, stroke=5)
    shadow_text(b, (x + w1, y), t2, f, RED, stroke=5)
    g = ImageFont.truetype(SEMI, 54)
    line = 'ANIMATED HORROR STORIES  ·  LIGHTS OFF'
    lw = d.textlength(line, font=g)
    shadow_text(b, ((W - lw) / 2, y + f.size + 40), line, g, CREAM, stroke=0, blur=6, dark=230)
    return b


def main() -> int:
    if '--layout' not in sys.argv and not ART.exists():
        draw_art()
    art = Image.open(ART).convert('RGB')
    ic = icon(art)
    ic.save(HERE / 'daddy_tales_icon_800.png')
    ba = banner(art)
    ba.save(HERE / 'daddy_tales_banner_2560x1440.jpg', quality=92)
    # previews: the icon as YouTube shows it (round, large and tiny) and the banner's safe area
    m = Image.new('L', (800, 800), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 799, 799), fill=255)
    pv = Image.new('RGB', (1300, 820), (15, 15, 15))
    pv.paste(ic, (10, 10), m)
    for k, s in enumerate((176, 88, 40)):
        small = ic.resize((s, s), Image.LANCZOS)
        pv.paste(small, (860, 30 + sum((176, 88, 40)[:k]) + 30 * k), m.resize((s, s)))
    pv.save(HERE / 'preview_icon_round.jpg', quality=90)
    sa = ba.copy()
    ImageDraw.Draw(sa).rectangle(((2560 - 1546) // 2, (1440 - 423) // 2, (2560 + 1546) // 2, (1440 + 423) // 2), outline=(0, 255, 0), width=6)
    sa.resize((1280, 720)).save(HERE / 'preview_banner_safe_area.jpg', quality=88)
    print('daddy_tales_icon_800.png, daddy_tales_banner_2560x1440.jpg (+ previews)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
