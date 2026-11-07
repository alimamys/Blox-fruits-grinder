#!/usr/bin/env python3
"""Thumbnail artwork for "Never Open Your Door at 3:06 AM", drawn on purpose for small-screen clicks.

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
    # Scene 8: the door forced open - Mr. Harris with the master key, the creature behind him.
    'key': {
        'refs': ['char:harris', 'char:creature', 'char:sarah', 'loc:hallway_cross'],
        'chars': ['harris', 'creature', 'sarah'],
        'loc': 'hallway_cross',
        'prompt': (
            'Seen from INSIDE Sarah\'s dark flat, looking out through her front door, which has been forced half open. In the doorway, in '
            'the yellow-green light of the corridor: Mr. Harris, crying, tears on his cheeks, guilty eyes looking down and away, holding up '
            'a brass master key in one hand. Right BEHIND him and towering over him, filling the top of the doorway, the CREATURE: its grey '
            'head bent sideways almost onto its shoulder, its jaw hanging open far too wide, small pale eyes fixed on the viewer, one '
            'impossibly long thin grey arm reaching forward past Mr. Harris toward the viewer. On the far RIGHT edge of the frame, in the '
            'dark foreground, Sarah\'s terrified face in profile and her two hands pushing against the edge of the door. Keep the LEFT '
            'third of the frame dark and empty (dark wood and shadow) for the title.'
        ),
        'mood': 'Sarah\'s flat is pitch dark; the only light is the sickly yellow-green corridor light pouring through the doorway, '
                'rim-lighting the creature and Mr. Harris.',
    },
    # Scenes 4-7: through the peephole - every neighbour standing in the corridor, facing her door.
    'peep': {
        'refs': ['char:mother', 'char:harris', 'char:residents', 'char:creature', 'loc:hallway'],
        'chars': ['mother', 'harris', 'residents', 'creature'],
        'loc': 'hallway',
        'prompt': (
            'POINT OF VIEW straight out of an apartment door\'s peephole into the corridor at 3 a.m. All the neighbours stand close together '
            'in the corridor in their night clothes, every one of them FACING THE CAMERA and staring straight into the peephole with blank, '
            'hollow, guilty eyes: Mr. Harris in the centre front with tears on his cheeks; the East Asian mother holding her little boy '
            'against her chest; and the five residents of the residents sheet around them. Their faces are large and clearly lit. Far '
            'behind them, at the very end of the corridor, at the top of the stairwell, the tall grey CREATURE stands in shadow, its head '
            'bent sideways, barely visible - a pale shape with long arms. Everything important is inside the CENTRE of the frame (the '
            'image will be cut into a round peephole view).'
        ),
        'mood': 'Sickly yellow-green fluorescent corridor light, one tube flickering; deep shadows at the far end by the stairs.',
    },
    # Scene 4/8: Sarah inside, back against her door, hand over her mouth - the hallway light under the door.
    'door': {
        'refs': ['char:sarah', 'loc:flat'],
        'chars': ['sarah'],
        'loc': 'flat',
        'prompt': (
            'Medium close-up in the dark flat: Sarah stands with her back pressed flat against her front door, one hand clamped over her '
            'own mouth, her eyes huge with terror, looking sideways toward the door. Her face fills the RIGHT half of the frame and is '
            'clearly lit. Through the narrow gap UNDER the door, sickly yellow-green corridor light spills across the floor, and in that '
            'strip of light, the shadows of two long, impossibly thin feet stand right outside her door. The brass security chain is '
            'fastened. Keep the LEFT HALF of the frame dark (the door\'s dark wood) for the title.'
        ),
        'mood': 'Near darkness; a cold blue rim light on Sarah\'s face and hair; the yellow-green strip of corridor light under the door.',
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
        body = (f'{R.SAFE_NOTE}{THUMB} FRAME: {c["prompt"]} MOOD AND LIGHT: {c["mood"]} {who} SETTING: {R.LOC_NOTE[c["loc"]]}')
        imgs, prompt = R.build_request(None, c['refs'], body)
        img = R.openai_edit(imgs, prompt, 'thumb', f'thumb_{name}.jpg', quality='high')
        R.uncanvas(img).save(dst, quality=94)
        print(f'  -> {dst.relative_to(R.ROOT)}')
    print(f'image spend so far: ${R.spent():.2f} of ${R.budget():.2f}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
