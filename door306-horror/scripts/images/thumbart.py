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
    # --- mystery set: nothing is shown, only the question (no creature, no faces of what is coming) ---
    # Scene 1: 3:06 AM - every door on the floor stands open; the corridor is empty; one door stays shut.
    'doors': {
        'refs': ['loc:hallway'],
        'chars': [],
        'loc': 'hallway',
        'nobody': True,
        'prompt': (
            'The fourth-floor corridor at 3 a.m., one-point perspective from the window end, looking down the corridor to the stairwell. '
            'EVERY apartment door on both sides stands wide OPEN onto pitch-black rooms - except ONE door, the second door on the RIGHT, '
            'which is firmly CLOSED, a thin line of warm light under it. The corridor is completely EMPTY and still: nobody anywhere, no '
            'shapes, no shadows of people. At the far end the stairwell opening is pure black. One fluorescent tube flickers. Silent, '
            'eerie, wrong. Keep the lower quarter of the frame (the carpet runner) simple and calm for a title.'
        ),
        'mood': 'Sickly yellow-green fluorescent light, deep black inside every open doorway and in the stairwell.',
    },
    # Scene 4: three soft knocks - from inside, only the light under the door and the shadows of two feet.
    'under': {
        'refs': ['loc:flat'],
        'chars': [],
        'loc': 'flat',
        'nobody': True,
        'prompt': (
            'Extreme close-up at floor level inside a pitch-dark apartment, looking at the BOTTOM of the closed dark wooden front door. '
            'The thin gap under the door glows bright, sickly yellow-green with corridor light, spilling a fan of light across the dark '
            'floorboards toward the camera. In the middle of that strip, the light is broken by the dark SHADOWS of two feet standing right '
            'outside the door - unnaturally long and thin. We see ONLY the two shadows, nothing else of whoever stands there. The rest of the '
            'frame is near-black dark wood. Keep the TOP half of the frame dark and empty for a title.'
        ),
        'mood': 'Near-total darkness; the only light is the glowing strip under the door.',
    },
    # Scenes 3-4: the neighbours from behind, facing the black stairwell; Mr. Harris turns back - "shh".
    'shh': {
        'refs': ['char:harris', 'char:mother', 'char:residents', 'loc:hallway'],
        'chars': ['harris', 'mother', 'residents'],
        'loc': 'hallway',
        'prompt': (
            'The yellow-green fourth-floor corridor at 3 a.m., seen from BEHIND the neighbours: they stand perfectly still in a loose line in '
            'their night clothes, their BACKS to the camera, all facing the far end of the corridor, where the stairwell opening is PURE '
            'BLACK - nothing at all is visible in it. We do NOT see their faces (the little boy\'s face is hidden against his mother\'s '
            'shoulder). Only Mr. Harris, in the RIGHT foreground and large in frame (head and shoulders), has turned his head back over his '
            'shoulder toward the viewer, his eyes wide and wet with fear, pressing one finger to his lips: "shh". Keep the LEFT third of '
            'the frame (the wall and the backs of the neighbours) simple for a title.'
        ),
        'mood': 'Sickly yellow-green fluorescent light; the stairwell at the end is an absolute black hole; Mr. Harris\'s face is clearly lit.',
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
