#!/usr/bin/env python3
"""High-impact thumbnails for the four Daddy Tales films (second refresh, from the user's hints):
  1. saturated light sources against the dark (electric blue, neon red, acid green, hot orange, cobalt);
  2. a character's reaction as the focus where the story allows;
  3. a huge, clean text punch of at most three words that adds a second mystery to the title.
Each film keeps its own palette and type treatment so the four never look like one template.

    ../widemouth-horror/.venv/bin/python make_punch_thumbs.py            # draws missing art ($0.25 each), lays out
    ../widemouth-horror/.venv/bin/python make_punch_thumbs.py --layout   # layout only

The art is drawn on purpose for the thumbnail (with each film's own character sheets and locations, read
only); the text is set in code.
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / 'widemouth-horror' / 'scripts' / 'images'))
import restyle as R  # noqa: E402

OUT = HERE / 'punch'
ART = OUT / 'art'
W, H = 1280, 720
FONTS = {
    'black': '/usr/share/fonts/opentype/inter/Inter-Black.otf',
    'black_i': '/usr/share/fonts/opentype/inter/Inter-BlackItalic.otf',
    'serif': '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
}

RULES = ('This is YouTube THUMBNAIL artwork, in exactly the drawing style of the style reference (semi-realistic 2D, clean line art, '
         'cel shading, painted light). ONE bold, simple image that reads instantly at phone size: strong, SATURATED, glowing coloured '
         'light sources against deep darkness, high contrast, crisp sharp shapes, an uncluttered background. Do NOT draw any text, '
         'letters, numbers, digits or logos anywhere.')

CONCEPTS = {
    'frame240': {
        'refs': [('frame240-horror', 'sheets/mara_board.jpg', 'the CHARACTER SHEET of MARA, the young animator'),
                 ('frame240-horror', 'sheets/figure.png', 'the CHARACTER SHEET of THE FIGURE (the thing in her animation)'),
                 ('frame240-horror', 'locations/workroom.png', 'the LOCATION REFERENCE: her small dark workroom')],
        'prompt': ('An EXTREME CLOSE-UP of MARA (exactly as on her character sheet) filling the RIGHT HALF of the frame, her face lit hard '
                   'by the glow of her computer monitor: huge horrified eyes, mouth open in a silent gasp, a tear on her cheek. On the LEFT, '
                   'the edge of the monitor, its screen blazing ELECTRIC BLUE-WHITE - and reaching OUT of the screen, from inside the picture, '
                   'a long grey distorted hand with impossibly long, too-many-jointed fingers, stretching past the monitor\'s edge toward her '
                   'face. Deep black room, saturated cold blue light, one small red standby light on the monitor. Keep the TOP-LEFT area dark '
                   'and simple for the title.'),
    },
    'door306': {
        'refs': [('door306-horror', 'sheets/sarah_board.jpg', 'the CHARACTER SHEET of SARAH'),
                 ('door306-horror', 'locations/flat.png', 'the LOCATION REFERENCE: her small apartment')],
        'prompt': ('Inside her dark apartment in the middle of the night: SARAH (exactly as on her character sheet) stands with her back pressed '
                   'flat against her closed front door, terrified, eyes huge, one hand clamped over her mouth, her face lit from the side by '
                   'the NEON-RED glow of a bedside alarm clock (its display turned away from us). At her feet, through the gap under the '
                   'door, a hard bar of sickly ACID-GREEN hallway light spills in - broken by the black shadows of MANY pairs of feet '
                   'standing just outside, side by side. Saturated neon red and acid green against blue-black. Keep the TOP area dark and '
                   'simple for the title.'),
    },
    'goatman': {
        'refs': [('goatman-horror', 'locations/trailer.png', 'the LOCATION REFERENCE: the old camping trailer'),
                 ('goatman-horror', 'locations/clearing.png', 'the LOCATION REFERENCE: the clearing in the pine woods'),
                 ('goatman-horror', 'sheets/thing.png', 'the CHARACTER SHEET of THE THING (only its silhouette may appear)')],
        'prompt': ('Night in the pitch-black pine woods: the old camping trailer seen from outside, close and side-on, its big side window and '
                   'its yellowed roll-down blind glowing a hot, saturated ORANGE from the light inside. On the glowing blind, the crisp black '
                   'SILHOUETTES of the teenagers sitting inside on the bench, shoulder to shoulder, heads and shoulders - and among them ONE '
                   'silhouette far too tall, its neck too long, its head bent hard to one side, one long arm hanging down past the others. '
                   'No faces, only silhouettes. Cold saturated blue moonlight on the pines and the trailer\'s metal skin around the glowing '
                   'window. Keep the TOP area dark and simple for the title.'),
    },
    'widemouth': {
        'refs': [('widemouth-horror', 'sheets/adult_eli_leo.png', 'the CHARACTER SHEET of ADULT ELI (and his son Leo - Leo is NOT in this image)'),
                 ('widemouth-horror', 'sheets/widemouth.png', 'the CHARACTER SHEET of MR. WIDEMOUTH'),
                 ('widemouth-horror', 'locations/leoroom.png', 'the LOCATION REFERENCE: his son\'s bedroom')],
        'prompt': ('Night in his son\'s bedroom, low by the floor: a big close-up of ADULT ELI (exactly as on his sheet - short beard, '
                   'dark-green flannel shirt) on the LEFT, kneeling beside the bed, frozen in terror, his wide eyes staring at the gap under '
                   'the bed, his face lit by the saturated COBALT-BLUE glow of a moon night-light. On the RIGHT, in the black gap under the '
                   'dinosaur bed skirt, MR. WIDEMOUTH\'s enormous ear-to-ear WHITE GRIN full of small teeth and his two glossy black eyes '
                   'shine out of the dark - only the grin and eyes visible. Nobody is in the bed. Saturated cobalt blue and teal light, the '
                   'grin bright white. Keep the TOP area dark and simple for the title.'),
    },
}


def png(path: Path) -> bytes:
    im = Image.open(path).convert('RGB')
    im.thumbnail((1536, 1536))
    b = io.BytesIO()
    im.save(b, 'PNG')
    return b.getvalue()


def draw_art(name: str) -> None:
    c = CONCEPTS[name]
    imgs, names = [], []
    for proj, rel, label in c['refs']:
        imgs.append(png(ROOT / proj / 'references' / rel))
        names.append(label)
    imgs.append(png(R.STYLE_REF))
    names.append(f'the STYLE REFERENCE - draw in exactly this style: {R.STYLE_TEXT}. Its people are NOT in this image; take ONLY the style')
    intro = ' '.join(f'Image {i + 1} is {n}.' for i, n in enumerate(names))
    prompt = f'{intro}\n\n{RULES}\n\nTHE IMAGE: {c["prompt"]}'
    img = R.openai_edit(imgs, prompt, 'thumb', f'punch_{name}.jpg', quality='high')
    ART.mkdir(parents=True, exist_ok=True)
    R.uncanvas(img).save(ART / f'{name}.jpg', quality=95)
    print(f'  -> punch/art/{name}.jpg   (image spend ${R.spent():.2f} of ${R.budget():.2f})')


def base(name: str) -> Image.Image:
    im = Image.open(ART / f'{name}.jpg').convert('RGB')
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    im = im.crop((x, y, x + W, y + H))
    return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.12)).enhance(1.06)


def punch(im: Image.Image, text: str, fkey: str, xy, max_w: int, fill, glow, size=200, align='left') -> Image.Image:
    """Huge clean text with a coloured glow and a soft dark shadow so it reads on anything."""
    d = ImageDraw.Draw(im)
    while d.textlength(text, font=ImageFont.truetype(FONTS[fkey], size)) > max_w:
        size -= 4
    f = ImageFont.truetype(FONTS[fkey], size)
    x, y = xy
    if align == 'center':
        x = (W - d.textlength(text, font=f)) / 2
    sh = Image.new('L', im.size, 0)
    ImageDraw.Draw(sh).text((x, y + 6), text, font=f, fill=235, stroke_width=10, stroke_fill=235)
    im.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(14)))
    gl = Image.new('RGB', im.size, (0, 0, 0))
    ImageDraw.Draw(gl).text((x, y), text, font=f, fill=glow, stroke_width=6, stroke_fill=glow)
    a = np.asarray(im).astype(np.float32) + np.asarray(gl.filter(ImageFilter.GaussianBlur(22))).astype(np.float32) * 0.9
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    ImageDraw.Draw(im).text((x, y), text, font=f, fill=fill, stroke_width=3, stroke_fill=(10, 10, 12))
    return im


LAYOUT = {
    'frame240': dict(text='NOT MINE.', font='black', xy=(46, 34), max_w=640, fill=(255, 255, 255), glow=(60, 150, 255)),
    # her face is top-centre and the feet are at the bottom: the words go on the dark wall above the lamp
    'door306': dict(text=['ALL OF', 'THEM.'], font='black', xy=(40, 28), max_w=440, fill=(255, 255, 255), glow=(255, 40, 40)),
    'goatman': dict(text='WHO IS HE?', font='black_i', xy=(0, 26), max_w=1140, fill=(255, 236, 190), glow=(255, 120, 20), align='center'),
    'widemouth': dict(text='HELLO AGAIN.', font='serif', xy=(0, 22), max_w=1160, fill=(244, 238, 222), glow=(40, 110, 255), align='center'),
}


def main() -> int:
    if '--layout' not in sys.argv:
        R.load_env()
        R.require_key()
        for name in CONCEPTS:
            if not (ART / f'{name}.jpg').exists():
                draw_art(name)
    made = []
    for name, L in LAYOUT.items():
        if not (ART / f'{name}.jpg').exists():
            continue
        im = base(name)
        lines = L['text'] if isinstance(L['text'], list) else [L['text']]
        x, y = L['xy']
        for ln in lines:
            im = punch(im, ln, L['font'], (x, y), L['max_w'], L['fill'], L['glow'], align=L.get('align', 'left'))
            y += 128
        out = OUT / f'{name}_thumbnail_v3.jpg'
        im.save(out, quality=93)
        made.append(im)
    S = Image.new('RGB', (W, H), (0, 0, 0))
    for k, im in enumerate(made):
        S.paste(im.resize((W // 2, H // 2), Image.LANCZOS), ((k % 2) * W // 2, (k // 2) * H // 2))
    S.save(OUT / 'preview_all.jpg', quality=88)
    print(f'{len(made)} thumbnails -> punch/')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
