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
    'majlis_night': "A traditional Kuwaiti majlis (sitting room) on a winter evening, seen straight-on like a stage set: long low floor cushions "
                    'with red-and-black sadu woven patterns along the back wall, a red Persian carpet on the floor, a low wooden tray in the middle '
                    'with a brass Arabic coffee pot (dallah) and small cups, a carved wooden incense burner (mabkhara) with a thin curl of smoke on '
                    'the left, a window with the night sky in the middle of the wall, a small side table on the RIGHT with an old beige landline '
                    'telephone. Warm lamp light, cosy, a little mysterious.' + EMPTY,
    'noura_house': 'A Kuwaiti living room in the 1990s on a warm evening, seen straight-on like a stage set: a long patterned sofa on the left, two '
                   'round frame drums (daf) hanging on the wall above it, a small side table on the RIGHT with an old cream-coloured landline phone, '
                   'heavy curtains on the right, a floor lamp. Warm, homely.' + EMPTY,
    'wedding_happy': 'A happy Kuwaiti wedding hall in the 1990s, seen straight-on: a stage covered in white and pink flowers with an ornate bride\'s '
                     'chair in the middle, strings of warm fairy lights across the ceiling, round tables with white cloths on both sides, a shiny '
                     'floor. Bright, joyful, festive.' + EMPTY,
    'street_night': 'A quiet residential street in Kuwait at night, seen straight-on: a high sand-coloured wall with a big wooden gate on the left, '
                    'a palm tree behind the wall, an orange street lamp on the right, an empty asphalt road in the foreground, a dark blue sky.' + EMPTY,
    'desert_road_night': 'An empty two-lane road crossing the desert at night, seen from the side: soft sand dunes, a dashed yellow centre line, a few '
                         'tiny lights of the last houses far away on the LEFT, a huge sky full of stars, no moon, deep blue darkness. Lonely and eerie.' + EMPTY,
    'mansion_night': 'A huge white Arabian palace-house standing completely alone in the desert at night, seen straight-on: every window blazing '
                     'with warm golden light, an open lit doorway in the middle, lanterns along the walls, sand all around, a black starless sky. '
                     'Beautiful and wrong, as if it should not be there.' + EMPTY,
    'hall_gold': 'Inside a lavish women\'s wedding hall, seen straight-on like a stage set: gold walls and gold pillars from floor to ceiling, '
                 'three huge crystal chandeliers, a shining cream marble floor in the foreground, a raised stage at the far end with an ornate gold '
                 'bride\'s chair (kosha) in the middle, long tables of untouched food along both sides, a thin blue haze of incense in the air. '
                 'Rich, glowing, too perfect.' + EMPTY,
    'ruin_dawn': 'The same big Arabian house in the desert at grey dawn, seen straight-on, but now a burned-out ruin: broken black empty windows, '
                 'walls scorched black by an old fire, a collapsed corner of the roof, sand drifting in through the empty doorway, no lights at all, '
                 'flat pale sand in the foreground. Cold grey morning light, desolate.' + EMPTY,
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
