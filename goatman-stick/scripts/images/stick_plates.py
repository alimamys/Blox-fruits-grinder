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
EMPTY = ' EMPTY SCENE: no people, no creatures, no animals, no vehicles, no text, no letters, no signs.'
TRAILER = ('the inside of a small, cramped, old camping trailer deep in the Alabama pine woods, seen straight-on like a stage set: low ceiling; '
           'on the LEFT a tiny kitchenette with wooden cabinets, a pale counter and a two-burner stove with a cooking pot on it; '
           'in the MIDDLE a built-in bench seat with worn maroon cushions along the back wall, a window with closed horizontal blinds above it; '
           'on the RIGHT the trailer front door with a small square window and a round knob, and at the far right a narrow wooden bathroom door; '
           'worn brown floor. ')
CLEARING = ('a clearing deep in tall Alabama pine woods: in the middle-right an old cream-and-brown camping trailer with rounded corners, '
            'its door and a few metal steps, a window on its side; a second older grey trailer far back on the LEFT; '
            'bare dirt ground; in the front middle a stone fire ring full of grey ashes (no fire), two fallen logs as seats either side of it. ')
SETS = {
    'trailer_night': 'Night: ' + TRAILER + 'Lit warm and dim by one small ceiling lamp, deep shadows in the corners, the window black behind the blinds. Cosy but tense.' + EMPTY,
    'trailer_day': 'Afternoon: ' + TRAILER + 'Grey daylight leaking through the blinds and the door window, no lamp on. Quiet, stale, uneasy.' + EMPTY,
    'clearing_night': 'Night: ' + CLEARING + 'Black sky, black pine silhouettes, the main trailer window glowing warm yellow; cold blue moonlight on the dirt. Eerie and silent.' + EMPTY,
    'clearing_day': 'A hazy summer day: ' + CLEARING + 'Green pines, pale sky, soft sunlight. Peaceful but lonely.' + EMPTY,
    'trail_night': 'Night in the Alabama pine woods, seen from the side like a stage: a narrow dirt trail runs straight across the picture from left to right; tall dark pine trunks behind it with black gaps between them; two thick trunks framing the left and right edges. Nearly black, deep blue shadows.' + EMPTY,
    'trail_day': 'Early morning in the Alabama pine woods, seen from the side like a stage: a narrow dirt trail with pine needles runs straight across the picture from left to right; tall pine trunks behind it; two thick trunks framing the left and right edges. Pale misty sunrise light.' + EMPTY,
    'creek_day': 'A summer afternoon at a slow creek in the Alabama woods, seen from the side: green-brown water running across the middle of the picture, a sandy near bank at the bottom, a grassy far bank with thick dark bushes on the right side, tall pines behind. Bright and calm.' + EMPTY,
    'farm_day': 'A small country farmyard at the edge of pine woods on a summer day: a little white wooden farmhouse with a red roof and a porch step on the RIGHT; on the LEFT a muddy pigpen with a wooden fence that has one rail broken and hanging; grass, pines behind.' + EMPTY,
    'bathroom_night': 'The tiny bathroom of an old camping trailer at night, seen straight-on: a small sink cabinet on the left, a toilet on the right, and in the middle of the back wall a window that is WIDE OPEN with NO glass and NO screen, only black pine woods outside. Dim, cold.' + EMPTY,
    'apartment_night': 'A modern Chicago apartment living room at night, seen straight-on: a big window on the left showing the lit city skyline, a blue-grey couch in the middle with a low wooden coffee table in front of it (empty), and on the right a short hallway ending in a closed white bathroom door. Warm lamp light, cosy.' + EMPTY,
    'city_night': 'The Chicago skyline at night seen from street level: tall buildings with many lit yellow windows, a dark street at the bottom, deep blue night sky. Calm.' + EMPTY,
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
