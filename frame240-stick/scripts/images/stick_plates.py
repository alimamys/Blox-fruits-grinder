#!/usr/bin/env python3
"""Background plates for the stick-figure "Frame 240": a rough code layout of the empty set is
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
    'room_front_night': 'A small, modest apartment workroom at two in the morning, seen straight-on like a stage set, looking at the wall behind the '
                        'animator\'s chair (the desk and the person are NOT in the picture): on the LEFT a window with rain streaming down the glass '
                        'and dark city buildings with a few tiny lit windows outside; a few blank sheets of sketch paper pinned to the wall; on the '
                        'RIGHT an open doorway into a pitch-dark narrow hallway, a closed door barely visible at the far end of it; a light switch. '
                        'Plain dark blue walls, worn wooden floor. Cold blue night light, the doorway almost black. Lonely and quiet.' + EMPTY,
    'room_side_night': 'The same small apartment workroom at two in the morning, seen from the side like a stage set: on the far LEFT an open doorway '
                       'into a pitch-dark hallway; on the RIGHT a simple wooden desk with a drawer unit, a computer monitor turned three-quarters '
                       'toward the room with a softly glowing pale-blue screen (the screen is blank, no picture on it), a pen tablet and a mug; '
                       'above the desk a window with rain streaming down the glass. Plain dark blue walls, worn wooden floor, the monitor glow '
                       'the only warm-cold light. Quiet and lonely.' + EMPTY,
    'hall_persp_night': 'A narrow apartment hallway at night in one-point perspective, seen from the living-room end: an old beige carpet runner '
                        'with ONE brown stain down the middle, plain pale walls, a white dome ceiling light glowing weak warm yellow with a brown '
                        'water stain on the ceiling beside it; at the far end a closed bedroom door with a hairline crack above its frame; the '
                        'apartment front door (brown wood, a handle and a deadbolt) on the LEFT wall near us; a white closet door on the RIGHT wall. '
                        'Dim and moody, soft shadows, cold blue night in the corners.' + EMPTY,
    'hall_side_night': 'The same apartment hallway at night, seen straight-on from the side like a stage set: one long plain pale wall with faint '
                       'wallpaper texture; on the LEFT a plain white closet door with a round knob; on the RIGHT the closed bedroom door with two '
                       'panels and a hairline crack in the wall above its frame; a white dome ceiling light at the top; an old beige carpet '
                       'runner with ONE brown stain on the floor. Dim, cold blue-grey night light, soft shadows. Quiet and wrong.' + EMPTY,
    'closet_night': 'Inside a small dark storage closet at night, seen straight-on like a stage set: wooden shelves with cardboard boxes on the '
                    'LEFT, two coats hanging on hooks in the middle, the closed white closet door on the RIGHT seen from inside, with a thin line '
                    'of light leaking under it onto the floor; a vacuum cleaner in the corner. Very dark and cramped, cold grey-blue shadows, the '
                    'line of light under the door the only bright thing.' + EMPTY,
    'exterior_night': 'A plain five-storey apartment block on a quiet street at night in heavy rain, seen straight-on: rows of dark windows, '
                      'only ONE window lit (third floor, second from the right), a plain entrance door, dark trees on both sides, a street lamp '
                      'with a warm glow, wet street reflecting the light, deep blue night sky with rain streaks. Lonely and quiet.' + EMPTY,
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
