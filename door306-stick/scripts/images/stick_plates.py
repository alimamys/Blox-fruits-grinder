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
EMPTY = ' EMPTY SCENE: no people, no creatures, no animals, no text, no letters, no numbers, no signs.'
SETS = {
    'flat_night': 'A small, slightly shabby studio apartment in an old city building at three in the morning, seen straight-on like a stage set: '
                  'on the LEFT a window with closed horizontal blinds striped by orange streetlight from outside, and a small wooden dining table with two chairs; '
                  'in the MIDDLE a worn purple-grey sofa; on the RIGHT the apartment front door (plain wood) with a tiny round peephole at eye height, '
                  'a door chain and a brass deadbolt; at the far right edge a dark doorway to a short corridor. Worn floorboards. '
                  'Dark blue night light with warm orange stripes from the blinds, deep shadows. Quiet and tense.' + EMPTY,
    'hallway_night': 'The 4th-floor hallway of an old apartment building at three in the morning, seen straight-on from the side like a stage set: '
                     'a long wall with THREE plain wooden apartment doors in a row, each with a tiny peephole, a brass knob and a small BLANK number plate; '
                     'old yellowed wallpaper, a worn green carpet runner on the floor, buzzing fluorescent tube lights on the ceiling giving a sickly '
                     'yellow-green light with cold blue shadows; at the far RIGHT the dark opening of the staircase with a grey metal railing going down. '
                     'Eerie and silent.' + EMPTY,
    'flat_night_bare': 'The same small, slightly shabby studio apartment in an old city building at three in the morning, seen straight-on like a stage set, '
                       'with NO furniture except a worn rug: on the far LEFT an open doorway into a dark bedroom (the corner of a bed just visible inside); '
                       'in the middle-left a window with closed horizontal blinds striped by orange streetlight; a worn red rug in the middle of the floorboards; '
                       'on the RIGHT the apartment front door (plain wood) with a tiny round peephole at eye height, a door chain and a brass deadbolt. '
                       'Dark blue night light with warm orange stripes from the blinds, deep shadows.' + EMPTY,
    'flat_day_bare': 'The same small studio apartment on a bright, calm morning, seen straight-on like a stage set, with NO furniture except a worn red rug: '
                     'on the far LEFT an open doorway into a bedroom (the corner of a made bed inside); in the middle-left a window with the blinds raised '
                     'and soft morning sunlight streaming in; on the RIGHT the apartment front door (plain wood) with a tiny peephole and a door chain. '
                     'Warm, clean sunlight, which makes it feel even emptier.' + EMPTY,
    'hallway_persp_night': 'The 4th-floor hallway of an old apartment building at three in the morning, seen from one apartment door looking straight down '
                           'the long narrow corridor in one-point perspective: worn green carpet, yellowed walls, plain wooden apartment doors along both '
                           'walls, buzzing fluorescent tubes on the ceiling with a sickly yellow-green light, and at the far end the dark opening of the '
                           'staircase with a grey metal railing. Cold blue shadows. Eerie and silent.' + EMPTY,
    'hallway_day': 'The 4th-floor hallway of an old apartment building on a bright ordinary morning, seen straight-on from the side like a stage set: '
                   'a long wall with THREE plain wooden apartment doors in a row, each with a tiny peephole, a brass knob and a small BLANK number plate; '
                   'yellowed wallpaper, a worn green carpet runner, ceiling lights off, warm daylight from a window off to the side; at the far RIGHT '
                   'the staircase opening with a grey metal railing going down. Calm and ordinary.' + EMPTY,
    'stairwell_night': 'The concrete stairwell of an old apartment building at three in the morning, seen from the side like a stage set: a straight '
                       'flight of grey concrete steps rising from the 3rd-floor landing at the bottom LEFT up to the 4th-floor landing at the top RIGHT, '
                       'with a grey metal railing along the steps; a plain wooden apartment door on the 3rd-floor landing; a single flickering '
                       'fluorescent light; grey-green painted walls with grime. Cold and sinister.' + EMPTY,
    'exterior_night': 'An old four-storey red-brick apartment building on a quiet city street at three in the morning, seen straight-on: rows of dark '
                      'windows, only ONE window lit on the top floor, a plain entrance door at street level, an empty sidewalk, a single street lamp '
                      'on the left, deep blue night sky. Lonely and quiet.' + EMPTY,
    'exterior_day': 'The same old four-storey red-brick apartment building on a quiet street on a bright sunny morning, seen straight-on: rows of '
                    'windows, a plain entrance door, an empty sidewalk, a street lamp on the left, clear blue sky. Calm and ordinary.' + EMPTY,
    'lobby_day': 'The small entrance lobby of an old apartment building in the morning, seen straight-on: a wall of small metal mailboxes in rows, '
                 'each with a BLANK little name slot, a tiled floor, a glass entrance door on the right with daylight. Plain and quiet.' + EMPTY,
    'office_day': 'A small, cosy landlord\'s office in the morning, seen straight-on: a wooden desk in the middle with a closed laptop and a brass '
                  'desk lamp, a grey filing cabinet on the left, a window on the right with daylight, a round wall clock with a BLANK face. '
                  'Warm and tidy.' + EMPTY,
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
