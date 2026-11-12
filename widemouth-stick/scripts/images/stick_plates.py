#!/usr/bin/env python3
"""Background plates for the stick-figure "Mr. Widemouth": a rough code layout of the empty set is
repainted by the image model in the look of the earlier stick-figure films (The Missing Passenger).
Characters are NOT in the plates - they are drawn and animated in code on top.

    .venv/bin/python scripts/images/stick_plates.py <set> [--model gpt-image-1-mini] [--quality low|medium|high] [--tag x]

Costs go to logs/image_costs.jsonl (same ledger and budget guard as restyle.py; IMAGE_BUDGET_USD).
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restyle as R  # noqa: E402

ROOT = R.ROOT
STYLE_REFS = [ROOT / 'references' / 'stick' / 'style_night.jpg', ROOT / 'references' / 'stick' / 'style_room.jpg']

# real per-1M-token rates per model (text in, image in, image out)
RATES = {'gpt-image-1-mini': (2, 2.5, 8), 'gpt-image-2': (5, 10, 40)}

STYLE = (
    'ART STYLE - match the reference pictures exactly: a clean, polished 2D cartoon background for an animated YouTube story '
    'with simple stick-figure characters; flat shapes, thick clean dark outlines, soft cel shading, gentle gradients, '
    'a faint paper grain; simple and readable, never photographic, never painterly, no tiny clutter. '
)
SETS = {
    'bedroom_night': (
        'A little boy\'s bare attic bedroom in an old farmhouse at night, seen straight-on from the front like a stage set. '
        'Sloped attic ceiling at the top left. On the LEFT a narrow old wooden bed seen from the side: tall round-topped headboard post on the '
        'left, lower footboard post on the right, a white pillow, a patchwork quilt, and a long white ruffled bed skirt hanging almost to the '
        'floor with a thin strip of pitch-black shadow under the bed. Beside the bed a small round wooden stool with a stack of picture books '
        'and a glass of ginger ale. In the middle-right of the back wall a tall window with a white cross frame and pale curtains, a moonlit '
        'night outside with a round moon and black pine trees. Stacked cardboard moving boxes on the RIGHT. Old faded wallpaper, wooden floorboards. '
        'Cold blue moonlight, deep navy shadows, cosy but eerie. EMPTY ROOM: no people, no creatures, no animals, no text, no letters.'
    ),
    'bedroom_day': (
        'The same little boy\'s bare attic bedroom in an old farmhouse on a grey afternoon, seen straight-on from the front like a stage set. '
        'Sloped attic ceiling at the top left. On the LEFT a narrow old wooden bed seen from the side: tall round-topped headboard post on the '
        'left, lower footboard post on the right, a white pillow, a patchwork quilt, and a long white ruffled bed skirt hanging almost to the floor '
        'with a thin strip of dark shadow under the bed. Beside the bed a small round wooden stool with a stack of picture books and a glass of '
        'ginger ale. A tall window with a white cross frame and pale curtains, grey sky and pine trees outside. Stacked cardboard moving boxes '
        'on the RIGHT. Old faded floral wallpaper, wooden floorboards. Soft grey daylight. EMPTY ROOM: no people, no animals, no text.'
    ),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('set')
    ap.add_argument('--model', default='gpt-image-1-mini')
    ap.add_argument('--quality', default='medium')
    ap.add_argument('--tag', default='')
    a = ap.parse_args()
    R.load_env()
    if not os.environ.get('OPENAI_API_KEY'):
        print('OPENAI_API_KEY is missing - add it to .env (not here in chat).')
        return 2
    os.environ['IMAGE_MODEL'] = a.model
    os.environ.setdefault('IMAGE_INPUT_FIDELITY', '')
    t, i, o = RATES.get(a.model, RATES['gpt-image-2'])
    os.environ['IMAGE_PRICE_TEXT_IN'], os.environ['IMAGE_PRICE_IMAGE_IN'], os.environ['IMAGE_PRICE_OUT'] = str(t), str(i), str(o)
    layout = ROOT / 'build' / 'layouts' / f'{a.set}.png'
    imgs = [R.png_bytes(R.frame_canvas(R.Image.open(layout)))] + [R.png_bytes(R.ref_image(p)) for p in STYLE_REFS]
    prompt = (
        'Image 1 is a ROUGH LAYOUT made of flat blocks: copy its camera, composition and the position and size of every object exactly '
        '(the bed, the window, the stool, the boxes, the floor line), but redraw everything properly. Images 2 and 3 are STYLE REFERENCES ONLY '
        '(do not copy their content). ' + STYLE + 'SCENE: ' + SETS[a.set] +
        ' Keep the wide 16:9 picture in the middle band of the canvas; extend the room naturally into the top and bottom edges.'
    )
    name = f'{a.set}{("_" + a.tag) if a.tag else ""}'
    img = R.openai_edit(imgs, prompt, 'stick_plate', name, quality=a.quality)
    out = ROOT / 'public' / 'plates'
    out.mkdir(parents=True, exist_ok=True)
    R.uncanvas(img).save(out / f'{name}.jpg', quality=92)
    print('saved', out / f'{name}.jpg')
    return 0


if __name__ == '__main__':
    sys.exit(main())
