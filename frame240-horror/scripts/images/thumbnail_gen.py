#!/usr/bin/env python3
"""Thumbnail scenes for "Frame 240", drawn by gpt-image-2 in the film's semi-realistic 2D style.

References sent with every request: Mara's character board, the figure's sheet (when he is
in it), the location reference and the style reference (references/style/animated2d.png).
The prompt asks for a clickable composition: a terrified face, one clear mystery, bright
contrast, space left for at most 4 words. Text, red circles and arrows are added afterwards
by scripts/make_thumbnails.py so the lettering is crisp and correctly spelled.

    .venv/bin/python scripts/images/thumbnail_gen.py [doorway screen wall]   (~$0.25 each, logged and budget-capped)
"""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import restyle as R  # noqa: E402

OUT = R.ROOT / 'youtube'

BRIEF = (
    'Draw a YouTube THUMBNAIL in exactly the style of the style reference (semi-realistic 2D animated series for adults). '
    'It must read instantly on a small phone screen: one big terrified face, strong bright key light on the face, high contrast, '
    'saturated but moody colour, deep shadows. 16:9 composition; keep everything important inside the middle horizontal band. '
    'Do not write any words, letters, numbers, captions or logos anywhere. '
)

SCENES = {
    'doorway': {
        'refs': ['char:mara', 'char:figure', 'loc:workroom'],
        'prompt': BRIEF + (
            'RIGHT HALF, large in the foreground (head and shoulders, filling most of the frame height): Mara, exactly as on her character '
            'sheet (dark-brown messy bun with the yellow pencil, oversized burnt-orange sweatshirt), lit cold blue-white by her monitor which '
            'is just off-camera, eyes huge with terror, mouth tense, looking straight at the viewer. LEFT, in the background behind her: the '
            'open doorway to the pitch-black hallway, and in it, barely visible, the impossibly tall faceless man with his head bent to one side. '
            'Leave the upper left fairly dark and empty for a title.'
        ),
    },
    'screen': {
        'refs': ['char:mara', 'char:figure', 'loc:workroom'],
        'prompt': BRIEF + (
            'RIGHT, large: Mara\'s terrified face in three-quarter view, lit bright by her computer screen, a tear on her cheek. LEFT: her '
            'monitor seen at an angle, showing a painted animation frame of a dim apartment hallway with the tall faceless man standing '
            'close in it, head bent to one side - the picture fills the screen, no software interface, no text. Leave the top of the image '
            'fairly dark and empty for a title.'
        ),
    },
    'wall': {
        'refs': ['char:mara', 'char:figure', 'loc:white'],
        'prompt': BRIEF + (
            'LEFT, large in the foreground: Mara pressed back against a flat white wall, screaming in terror, lit by the harsh white light of the '
            'phone she holds. RIGHT, on the same flat white wall: the faint raised outline of the tall man painted white - white on white, only '
            'his edges and a thin shadow give him away, his head bent to one side, a long white hand reaching towards her. Leave the top right '
            'fairly empty for a title.'
        ),
    },
}


def main() -> int:
    R.load_env()
    R.require_key()
    OUT.mkdir(exist_ok=True)
    for name in sys.argv[1:] or list(SCENES):
        sc = SCENES[name]
        imgs, prompt = R.build_request(None, sc['refs'], sc['prompt'])
        img = R.openai_edit(imgs, prompt, 'thumbnail', f'gen_{name}.png')
        w, h = img.size
        ch = int(w * 9 / 16)
        img = img.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch)).resize((1280, 720), R.Image.LANCZOS)
        img.save(OUT / f'gen_{name}.png')
        print(f'{name} -> youtube/gen_{name}.png')
    return 0


if __name__ == '__main__':
    sys.exit(main())
