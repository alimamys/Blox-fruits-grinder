#!/usr/bin/env python3
"""Background plates for the stick-figure "The Rake": a rough code layout of the empty set is
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
EMPTY = ' EMPTY SCENE: no people, no creatures, no animals, no text, no letters, no numbers, no signs.'
SETS = {
    'bedroom_night': "A child's small bedroom in an old family house at four in the morning, seen straight-on from the side like a stage set: "
                     'a single bed along the floor with the headboard on the LEFT and the footboard on the RIGHT, a dark purple patchwork quilt and a white pillow, '
                     'a white bed skirt down to the wooden floor; a small nightstand by the headboard with an alarm clock whose face is BLANK; '
                     'a window with curtains above the bed showing a full moon; a closed wooden door on the RIGHT wall; a toy chest. '
                     'Cold blue moonlight, deep soft shadows, quiet and still.' + EMPTY,
    'bedroom_pov_night': 'The view from a pillow in a small dark bedroom at night, looking down the length of the bed: a dark purple patchwork quilt fills the '
                         'bottom of the picture and runs away from us in perspective to a wooden footboard; beyond it the dark room, a closed wooden door in the '
                         'middle of the far wall, a window with moonlight on the LEFT. Cold blue moonlight, deep shadows, very still.' + EMPTY,
    'master_night': "Parents' bedroom in an old family house at night, seen straight-on from the side like a stage set: a double bed along the floor with "
                    'the headboard on the LEFT, two white pillows, a beige quilt, a bed skirt; a nightstand with a small lamp (off); a window on the right '
                    'with moonlight; a framed picture on the right-hand wall. Cold blue moonlight, deep shadows.' + EMPTY,
    'kitchen_day': 'The back wall of a homely old-fashioned family kitchen on a sunny summer morning, seen straight-on like a stage set: a window over the sink '
                   'with bright daylight, a counter and wooden cabinets, wall cupboards on the LEFT, a doorway to the hall on the far LEFT, a white fridge on '
                   'the RIGHT, a round wall clock with a BLANK face. Warm, cosy, ordinary. Nothing in the foreground.' + EMPTY,
    'attic_day': 'An old dusty attic under a steep sloping wooden roof, seen straight-on: a small round window at the top in the middle letting in a '
                 'dusty beam of sunlight, stacks of cardboard boxes on the LEFT, an old wooden trunk and a box fan on the RIGHT, wooden floorboards with a '
                 'square hatch. Warm dim light, floating dust, quiet and forgotten.' + EMPTY,
    'hallway_night': 'The upstairs hallway of an old family house at night, seen straight-on from the side like a stage set: a closed bedroom door on the LEFT, '
                     'a small hall table with an unlit lamp and three framed photos (BLANK, no faces) on the wall in the middle, a long red runner carpet on '
                     'the wooden floor, and at the far RIGHT end the closed door of a little bedroom. Dark blue night light, very still.' + EMPTY,
    'exterior_night': 'An old two-storey wooden family house on a quiet country road at night, seen straight-on: a steep roof with a small round attic window, '
                      'a front porch, dark windows, one small upstairs window on the right; trees on both sides; a full moon in a deep blue sky. Quiet and lonely.' + EMPTY,
    'exterior_day': 'The same old two-storey wooden family house on a bright summer day, seen straight-on: a steep roof with a small round attic window, a front '
                    'porch, windows, trees on both sides, blue sky, green grass. Calm and ordinary.' + EMPTY,
    'sonroom_night': "A nine-year-old boy's bedroom in a small modern house at four in the morning, seen straight-on from the side like a stage set: "
                     'a single bed along the floor with the headboard on the LEFT and the footboard on the RIGHT, a dark green quilt and a white pillow, a white '
                     'bed skirt down to a light wooden floor; a small white nightstand by the headboard with an alarm clock whose face is BLANK; a window with '
                     'half-open white blinds above the bed showing the night; two plain space posters (no words) on the wall; a bookshelf and a closed white door '
                     'on the RIGHT. Cold blue-green night light, deep soft shadows, very still.' + EMPTY,
    'sonroom_day': "The same nine-year-old boy's bedroom in a small modern house in the early morning, seen straight-on from the side like a stage set: "
                   'a single bed along the floor with the headboard on the LEFT and the footboard on the RIGHT, a dark green quilt and a white pillow, a white '
                   'bed skirt, a light wooden floor; a small white nightstand with an alarm clock whose face is BLANK; a window with half-open white blinds above '
                   'the bed letting in pale morning light; two plain space posters (no words); a bookshelf and a closed white door on the RIGHT. '
                   'Soft grey-gold morning light, quiet.' + EMPTY,
    'kitchen2_day': 'The back wall of a bright modern family kitchen on a sunny morning, seen straight-on like a stage set: a wide window in the middle, a '
                    'light counter and plain white cabinets, a tall grey fridge on the LEFT, white wall cupboards on the RIGHT, a round wall clock with a BLANK '
                    'face, mint-green walls. Clean, fresh, ordinary. Nothing in the foreground.' + EMPTY,
    'newhouse_day': 'A small single-storey light-blue bungalow in a sunny warm suburb far from anywhere old, seen straight-on: a low grey roof, a white front '
                    'door, four windows, a carport on the right, a palm tree on the left, a green lawn, blue sky with a sun. Bright, new, safe-looking.' + EMPTY,
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('sets', nargs='+')
    ap.add_argument('--workers', type=int, default=4)
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
    out = ROOT / 'public' / 'plates'
    out.mkdir(parents=True, exist_ok=True)
    styles = [R.png_bytes(R.ref_image(p)) for p in STYLE_REFS]

    def one(name: str) -> str:
        layout = ROOT / 'build' / 'layouts' / f'{name}.png'
        imgs = [R.png_bytes(R.frame_canvas(R.Image.open(layout)))] + styles
        prompt = (
            'Image 1 is a ROUGH LAYOUT made of flat blocks: copy its camera, composition and the position and size of every object exactly, '
            'but redraw everything properly. Images 2 and 3 are STYLE REFERENCES ONLY (do not copy their content). ' + STYLE + 'SCENE: ' + SETS[name] +
            ' Keep the wide 16:9 picture in the middle band of the canvas; extend it naturally into the top and bottom edges.'
        )
        tag = f'{name}{("_" + a.tag) if a.tag else ""}'
        try:
            img = R.openai_edit(imgs, prompt, 'stick_plate', tag, quality=a.quality)
        except Exception as e:  # noqa: BLE001
            return f'FAILED {tag}: {e}'
        R.uncanvas(img).save(out / f'{tag}.jpg', quality=92)
        return f'saved {tag}'

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(a.workers) as ex:
        for msg in ex.map(one, a.sets):
            print(msg, flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
