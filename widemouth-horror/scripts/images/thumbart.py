#!/usr/bin/env python3
"""Thumbnail artwork for "11 of Us Went Camping. 12 Came Back.", drawn on purpose for small-screen clicks.

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
    # mystery set: nothing of the thing is shown, only the question
    # Scene 1: the trailer at night - everyone eating; one more at the end of the bench, face in shadow.
    'count': {
        'refs': ['char:cousins', 'char:others', 'char:thing', 'loc:trailer'],
        'chars': ['cousins', 'others', 'thing'],
        'loc': 'trailer',
        'prompt': (
            'Inside the cramped old camping trailer at night: the back bench is packed shoulder to shoulder with teenagers eating from '
            'paper plates on their knees - NIA, TASHA, KAYLA and JAMAL, their faces large, clear and warmly lit, glancing nervously at '
            'each other - and at the very RIGHT end of the bench sits ONE MORE figure whose face is completely lost in black shadow. '
            'Nobody looks at it. Keep the LEFT third of the frame (the dark wood-panelled wall) simple and dark for a title.'
        ),
        'mood': 'Night inside the trailer: one weak warm ceiling light, deep brown shadows, the windows black.',
    },
    # Scene 3: the flashlight finds a man in the trees, his back turned.
    'facing': {
        'refs': ['char:thing', 'loc:trail'],
        'chars': ['thing'],
        'loc': 'trail',
        'prompt': (
            'Night in the black pine woods: one hard white flashlight beam enters from the lower RIGHT and lands on a tall, thin man '
            'standing perfectly still among the trunks with his BACK to the viewer, arms a little too long, head at a slightly wrong '
            'tilt. No face. Everything outside the beam is pitch black. Keep the LEFT half of the frame dark for a title.'
        ),
        'mood': 'Night on the forest trail: black woods, only the cold white cone of the flashlight.',
    },
    # Scene 1/5: one hot dog left - and a grey hand reaching for it.
    'plate': {
        'refs': ['char:thing', 'loc:trailer'],
        'chars': ['thing'],
        'loc': 'trailer',
        'nobody': False,
        'prompt': (
            'Extreme close-up in the dim trailer: a white paper plate with ONE hot dog in a bun on a scuffed wooden table, warmly lit; '
            'from the dark right edge of the frame a GREY hand with impossibly long, thin fingers reaches slowly toward it. No face, no '
            'blood. Keep the TOP half of the frame dark for a title.'
        ),
        'mood': 'Near darkness: one warm pool of light on the plate, deep shadow all around.',
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
