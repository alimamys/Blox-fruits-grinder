#!/usr/bin/env python3
"""Painted puppets for the stick-figure "3:06" film.

The image model (gpt-image-2, quality low) paints each character as a sheet of separate cut-out parts on a
plain white background: three heads (front, three-quarter facing right, back) and three torsos (front, side,
back). The faces are left BLANK on purpose - eyes, brows and mouths are drawn by the code on top, so blinks,
looks and lip sync keep working. Arms and legs stay code-drawn tubes in matching colours.

    .venv/bin/python scripts/images/puppets.py gen sarah harris      # paint the sheets (costs money)
    .venv/bin/python scripts/images/puppets.py cut sarah harris      # cut them out (free)
Outputs: public/puppets/<who>_<part>.png (transparent) + src/data/generated/puppets.json
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restyle as R  # noqa: E402

ROOT = R.ROOT
RAW = ROOT / 'build' / 'puppets'
OUT = ROOT / 'public' / 'puppets'
MANIFEST = ROOT / 'src' / 'data' / 'generated' / 'puppets.json'
STYLE_REF = ROOT / 'references' / 'stick' / 'style_room.jpg'
PARTS = ['head', 'headSide', 'headBack', 'torso', 'torsoSide', 'torsoBack']

CHARS = {
    'sarah': (
        ROOT / 'references' / 'sheets' / 'sarah_turnaround.png',
        'SARAH, a woman in her late twenties: shoulder-length wavy auburn hair, pale skin with a few freckles; '
        'a faded sage-green long-sleeve pyjama top with small buttons down the front.',
    ),
    'harris': (
        ROOT / 'references' / 'sheets' / 'harris.png',
        'MR. HARRIS, a thin old man of about 75: thin white hair on a mostly bald head, white stubble; '
        'a long dark-brown cardigan worn open over a cream vest, reading glasses hanging on a cord on his chest.',
    ),
}

PROMPT = (
    'Image 1 shows the CHARACTER DESIGN (who they are, hair, colours, clothes). Image 2 is the ART STYLE reference. '
    'Draw a CUT-OUT PUPPET PARTS SHEET for a 2D cartoon in the art style of image 2: thick clean dark outlines, flat colours '
    'with soft cel shading, simple and cute like the round-headed characters of an animated YouTube story. '
    'CHARACTER: {desc} '
    'Draw exactly SIX separate pieces in a neat 3 x 2 grid on a plain flat pure WHITE background, with wide empty white space '
    'between all pieces - nothing touching, nothing overlapping, no ground shadows, no labels, no text. '
    'TOP ROW, left to right: (1) the HEAD seen from the FRONT, (2) the HEAD in three-quarter view facing to the RIGHT, '
    '(3) the BACK of the head. Every head is a big, nearly perfectly ROUND ball shape with the hair on it, and a short stub of neck. '
    'IMPORTANT: the faces are completely BLANK - smooth plain skin with NO eyes, NO eyebrows, NO nose and NO mouth '
    '(they are drawn later by the animation); ears are fine. '
    'BOTTOM ROW, left to right: (4) the TORSO from the FRONT, (5) the TORSO from the SIDE facing right, (6) the TORSO from the BACK: '
    'only the upper body in their clothes from the shoulders down to the hips, with just short sleeve stubs at the shoulders - '
    'NO arms, NO hands, NO head, NO neck, NO legs. Each torso is a simple rounded tapered shape. '
    'All six pieces the same scale, centred in their grid cells.'
)


def gen(who: str) -> None:
    sheet, desc = CHARS[who]
    os.environ['IMAGE_MODEL'] = os.environ.get('IMAGE_MODEL', 'gpt-image-2')
    os.environ['IMAGE_INPUT_FIDELITY'] = ''
    imgs = [R.png_bytes(R.ref_image(sheet)), R.png_bytes(R.ref_image(STYLE_REF))]
    img = R.openai_edit(imgs, PROMPT.format(desc=desc), 'puppet', f'{who}_puppet', quality='low')
    RAW.mkdir(parents=True, exist_ok=True)
    img.save(RAW / f'{who}.png')
    print('painted', RAW / f'{who}.png', img.size)


def cut(who: str) -> dict:
    im = Image.open(RAW / f'{who}.png').convert('RGB')
    a = np.asarray(im).astype(int)
    # background = near-white connected to the border
    white = (a.min(axis=2) > 232) & (a.max(axis=2) - a.min(axis=2) < 22)
    lab, n = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=1)
    flab, fn = ndimage.label(fg)
    sizes = ndimage.sum(fg, flab, range(1, fn + 1))
    keep = np.argsort(sizes)[::-1][:6] + 1
    boxes = []
    for k in keep:
        ys, xs = np.where(flab == k)
        boxes.append((k, xs.min(), ys.min(), xs.max(), ys.max()))
    # grid order: top row (heads) by x, then bottom row (torsos) by x
    boxes.sort(key=lambda b: (b[2] + b[4]) / 2)
    top = sorted(boxes[:3], key=lambda b: b[1])
    bottom = sorted(boxes[3:], key=lambda b: b[1])
    OUT.mkdir(parents=True, exist_ok=True)
    rgba = np.dstack([a, np.zeros(a.shape[:2], int)]).astype(np.uint8)
    info = {}
    for part, (k, x0, y0, x1, y1) in zip(PARTS, top + bottom):
        mask = ndimage.binary_fill_holes(flab == k)
        alpha = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
        rgba[..., 3] = np.asarray(alpha)
        pad = 4
        crop = Image.fromarray(rgba.copy()).crop((max(0, x0 - pad), max(0, y0 - pad), min(a.shape[1], x1 + pad + 1), min(a.shape[0], y1 + pad + 1)))
        path = OUT / f'{who}_{part}.png'
        crop.save(path)
        w, h = crop.size
        entry = {'src': f'puppets/{who}_{part}.png', 'w': w, 'h': h}
        if part.startswith('head') and part != 'headBack':
            # the face: the largest region of skin colour inside the head (skin = the colour around the middle of the face)
            ca = np.asarray(crop).astype(int)
            cx, cy = int(w * (0.45 if part == 'headSide' else 0.5)), int(h * 0.55)
            ref = ca[cy - 6:cy + 6, cx - 6:cx + 6, :3].reshape(-1, 3).mean(axis=0)
            skin = (np.abs(ca[..., :3] - ref).sum(axis=2) < 60) & (ca[..., 3] > 200)
            sl, sn = ndimage.label(skin)
            if sn:
                big = np.argmax(ndimage.sum(skin, sl, range(1, sn + 1))) + 1
                ys, xs = np.where(sl == big)
                # the face proper: skin below the top 30% of the head (a bald scalp is skin too) and above the neck
                top, bot = ys.min(), ys.max()
                sel = (ys > top + 0.3 * (bot - top)) & (ys < top + 0.85 * (bot - top))
                entry['face'] = {'x': float(xs[sel].mean()), 'y': float(ys[sel].mean()), 'r': float(np.sqrt(len(xs) / np.pi)), 'chin': float(bot)}
                entry['skin'] = '#%02x%02x%02x' % tuple(int(v) for v in ref)
        info[part] = entry
    print(who, {p: (e['w'], e['h'], e.get('face')) for p, e in info.items()})
    return info


def main() -> int:
    cmd, *who = sys.argv[1:]
    R.load_env()
    if cmd == 'gen':
        if not os.environ.get('OPENAI_API_KEY'):
            print('OPENAI_API_KEY is missing - add it to .env (not here in chat).')
            return 2
        for w in who:
            gen(w)
    elif cmd == 'cut':
        man = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
        for w in who:
            man[w] = cut(w)
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps(man, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
