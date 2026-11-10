#!/usr/bin/env python3
"""Thumbnail artwork for "Mr. Widemouth", drawn on purpose for small-screen clicks.

Each concept is a real moment of the film. It is drawn tighter, brighter and simpler than the film
frame, with big readable faces and an empty area kept for the title text (added later in code by
scripts/make_thumbnails.py, never drawn by the model).

    .venv/bin/python scripts/images/thumbart.py [name ...]   -> youtube/art/<name>.jpg (1920x1080, no text)

It uses the same references, cost ledger and budget cap as restyle.py, and skips a concept whose
output already exists (delete the file to redraw it).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restyle as R  # noqa: E402

OUT = R.ROOT / 'youtube' / 'art'

THUMB = (
    'This is the YouTube THUMBNAIL artwork of the film, in exactly the film\'s drawing style: ONE bold image that reads instantly at '
    'tiny phone size. Big faces with strong, clear expressions; strong contrast; a little brighter and more saturated than the film\'s '
    'night frames, with a cold rim light that separates each figure from the background; a simple, uncluttered background. '
    'Do NOT draw any text, letters, numbers or logos - the title is added later.'
)

CONCEPTS = {
    # mystery set: nothing of what happens is shown, only the question
    # The bed skirt and the dark under the bed - two tiny glints, nothing else.
    'under': {
        'refs': ['loc:bedroom'],
        'chars': [],
        'loc': 'bedroom',
        'nobody': True,
        'prompt': (
            'Low, close to the floorboards of a child\'s bedroom at night: the white ruffled bed skirt of a small bed hangs almost to the '
            'floor, lifted a little at one spot, and in the pitch-black gap beneath the bed two tiny round points of light catch the '
            'moonlight, close together - like eyes. Nothing else is visible under the bed. A child\'s sock lies on the floor in front of '
            'it. Cold blue moonlight across the floorboards. Keep the TOP third of the frame (the quilt and the wall) simple and dark '
            'for a title.'
        ),
        'mood': 'Night in a child\'s bedroom: cold blue moonlight on the floor, pitch black under the bed.',
    },
    # The upstairs window of the farmhouse at night - a tiny silhouette in it, one small hand raised.
    'window': {
        'refs': ['char:widemouth', 'loc:farmhouse'],
        'chars': ['widemouth'],
        'loc': 'farmhouse',
        'prompt': (
            'Night: the white clapboard farmhouse seen from below, dark against a deep blue sky with a thin moon; ONE upstairs window glows '
            'warm amber, and standing in it is a small black SILHOUETTE only - a huge round head with two crooked ears, a tiny body, one '
            'small hand raised in a wave. No features visible, just the shape against the glow. Keep the LEFT half of the frame (dark '
            'sky and pines) simple for a title.'
        ),
        'mood': 'Deep blue night, one warm amber window, strong contrast.',
    },
    # The deer trail into the woods - a child's sneaker prints beside tiny clawed prints, leading in.
    'trail': {
        'refs': ['loc:woods'],
        'chars': [],
        'loc': 'woods',
        'nobody': True,
        'prompt': (
            'Ground-level view of a narrow deer trail leading into dark, still woods: in the soft mud between the dead leaves, a small '
            'child\'s sneaker prints walk INTO the woods side by side with a line of tiny clawed footprints, and the trail ahead disappears '
            'into black shadow between the trunks. No people, no animals. Cold grey-green light. Keep the TOP third of the frame simple '
            'and dark for a title.'
        ),
        'mood': 'Cold grey-green light in still woods, the trail ahead swallowed by shadow.',
    },
}


def main(names: list[str]) -> int:
    R.load_env()
    R.require_key()
    OUT.mkdir(parents=True, exist_ok=True)
    for name in names or list(CONCEPTS):
        c = CONCEPTS[name]
        dst = OUT / f'{name}.jpg'
        if dst.exists():
            print(f'  {dst.name} exists - skipped')
            continue
        who = ' '.join(R.CHAR_NOTE[x] for x in c['chars'])
        nobody = ('THIS IMAGE CONTAINS NO PEOPLE AT ALL: no man, no woman, no faces, no hands - do not copy the people of the style '
                  'reference. ' if c.get('nobody') else '')
        body = (f'{nobody}{R.SAFE_NOTE}{THUMB} FRAME: {c["prompt"]} MOOD AND LIGHT: {c["mood"]} {who} SETTING: {R.LOC_NOTE[c["loc"]]}')
        imgs, prompt = R.build_request(None, c['refs'], body)
        img = R.openai_edit(imgs, prompt, 'thumb', f'thumb_{name}.jpg', quality='high')
        R.uncanvas(img).save(dst, quality=94)
        print(f'  -> {dst.relative_to(R.ROOT)}')
    print(f'image spend so far: ${R.spent():.2f} of ${R.budget():.2f}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
