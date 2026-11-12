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

EMPTY = ' EMPTY SCENE: no people, no creatures, no animals, no vehicles, no text, no letters, no signs.'
SETS.update({
    'driveway_night': 'Night at 4 a.m. in rural Maine, seen from the side of a gravel driveway at the bottom of a hill. Up on the hill on the RIGHT stands a big old white two-storey farmhouse with a grey roof and a porch, dark, with only ONE upstairs window (the middle one) faintly lit warm from inside. Black pine trees on the left, a round moon high on the left, deep blue starry sky. A wide grey gravel driveway runs straight across the whole bottom of the picture. Cold, still, quiet.' + EMPTY,
    'window_out_night': "Close view from outside of one upstairs window of an old white clapboard farmhouse at night, cold blue moonlight on the painted siding. White window trim; the UPPER sash has four small dark glass panes; the LOWER sash is ONE large clear glass pane with no bars, showing the dark inside of a child's bedroom (faint wallpaper, deep shadow). A white wooden sill at the bottom. Nobody in the window." + EMPTY,
    'farmhouse_day': 'A big old white two-storey farmhouse with a grey roof, a front porch and steps, alone on a grassy hill in spring, seen straight-on from its front yard. Pine woods behind, soft blue sky with a few clouds, a wide dirt driveway and yard across the bottom. Sunny but a bit lonely.' + EMPTY,
    'road_day': 'A quiet two-lane country road running straight across the picture from left to right, seen from the side; pine forests and rolling green hills of Maine behind, pale spring sky; a grass verge in front. Empty road.' + EMPTY,
    'porch_day': 'The back porch of an old white farmhouse on a cool spring day, seen from the side: on the LEFT the house wall with white clapboards and a wooden back door, a wooden porch deck with a white railing, and wooden steps going down to the right into the back yard; on the RIGHT the grassy yard and, further back, the dark edge of a pine forest.' + EMPTY,
    'woods_edge': 'The edge of a dense, dark pine-and-birch forest behind a farmhouse on an overcast spring day: a flat grassy meadow in front, the wall of trees across the back, and in the very middle a narrow dirt deer trail that leads into a dark gap between the trees and disappears. Quiet, grey, slightly ominous.' + EMPTY,
    'woods_trail': 'Inside a quiet forest on a grey day, seen from the side like a stage: a narrow dirt deer trail covered in dead brown leaves runs straight across the picture from left to right; tall bare tree trunks behind it, and two thick dark trunks framing the left and right edges in the foreground. Muted colours, no birds, still and silent.' + EMPTY,
    'ruins_day': 'Present day, overcast: on top of a grassy hill, the ruins of a farmhouse that burned down long ago - only a low rectangular stone foundation half buried in tall weeds, and three charred wooden posts sticking up. Pine woods on the right, grey sky. Lonely and quiet.' + EMPTY,
    'cemetery_day': 'A small, very old, forgotten cemetery in a clearing deep in the woods on an overcast day: rows and rows of small, weathered, rounded headstones of different sizes in the grass, receding into the distance in neat rows, all completely blank (no writing, no names, no crosses). Dark pine trees all around. Grey, sad, eerie.' + EMPTY,
    'leoroom_day': "A cheerful modern little boy's bedroom on a sunny morning, seen straight-on from the front like a stage set: on the LEFT a small white wooden bed seen from the side with a blue duvet, a white pillow and a long light-blue bed skirt hanging almost to the floor with a thin strip of dark shadow under the bed; a sunny window on the back wall, a little wall shelf with three toy dinosaurs, a round orange rug on the wooden floor. Pale blue walls. Bright, safe, ordinary." + EMPTY,
    'hallway': 'A long, narrow upstairs hallway in an old farmhouse, seen straight down its length in one-point perspective: faded wallpaper, old wooden floorboards with a long dark red runner rug, closed doors along both side walls, and at the very end of the hall a single closed wooden door. Dim grey light, long shadows. Unsettling.' + EMPTY,
    'emptyroom': 'A completely empty upstairs room in an old farmhouse: bare faded walls, bare wooden floorboards, no furniture at all. In the middle of the back wall one tall window whose sash is fully raised out of view, so the opening is EMPTY - no glass and no bars in it, just the white frame and a white sill; through it the pale sky and, far below, the tops of pine trees. Dim, grey, hollow.' + EMPTY,
    'window_down': 'Looking steeply DOWN out of a high upstairs window of a farmhouse on a hill: the white painted window sill fills the bottom of the picture very close to the viewer, and far, far below is the steep grassy hillside with a few grey rocks and small bushes; the white clapboard wall of the house drops away down the left side. A dizzying, long way down. Daylight.' + EMPTY,
    'kitchen_night': 'An old farmhouse kitchen at night, lit warmly by one hanging lamp over a wooden table, seen straight-on from the front like a stage set: on the RIGHT a row of wooden base cabinets with a pale counter top and a row of closed drawers just below it, upper cabinets, and a dark window over the sink; on the LEFT the wooden kitchen table. Worn floorboards. Warm, quiet.' + EMPTY,
})


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
