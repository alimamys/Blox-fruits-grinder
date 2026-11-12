#!/usr/bin/env python3
"""Repair Mr. Widemouth's left ear in the window shot (w_04_still): the model drew it as a flat,
squared-off block that looks cut off. One image edit redraws the ear; only the ear region is patched
back - into the base frame AND the two wave drawings (they share the base outside the arm), so the
rest of the frame stays pixel-identical.

    .venv/bin/python scripts/images/fix_ear.py
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restyle as R  # noqa: E402

SHOT = 'w_04_still_k1'
WIN = (700, 400, 900, 640)  # x0, y0, x1, y1: the left ear and around it (1920x1080 pixels)
RAW = R.ROOT / 'build' / 'ear_fix' / f'{SHOT}_ear.jpg'


def main() -> int:
    R.load_env()
    R.require_key()
    base = Image.open(R.OUT / f'{SHOT}.jpg').convert('RGB')
    if not RAW.exists():
        body = ('Fix ONLY the creature\'s LEFT ear (on the left side of the image, above his left eye): it is drawn as a flat, '
                'squared-off block that looks cut off. Redraw it as a soft, furry, pointed ear with the same fur and colour as his '
                'right ear, but bent over halfway so the tip flops down to the side - his crooked ear from the character sheet. '
                'Same size and place. Nothing else changes: the eyes, smile, body, hand, window and light stay identical.')
        imgs, prompt = R.edit_request(base, ['widemouth'], body)
        var = R.uncanvas(R.openai_edit(imgs, prompt, 'anim', RAW.name, quality='high'))
        RAW.parent.mkdir(parents=True, exist_ok=True)
        var.save(RAW, quality=95)
    var = np.asarray(Image.open(RAW).convert('RGB').resize(base.size, Image.LANCZOS)).astype(np.float32)
    b = np.asarray(base).astype(np.float32)
    x0, y0, x1, y1 = WIN
    d = cv2.GaussianBlur(np.abs(b - var).mean(axis=2), (0, 0), 3)
    m = np.zeros(d.shape, np.uint8)
    m[y0:y1, x0:x1] = (d[y0:y1, x0:x1] > 9).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    hull = np.zeros_like(m)
    for c in cnts:
        if cv2.contourArea(c) > 60:
            cv2.fillConvexPoly(hull, cv2.convexHull(c), 1)
    hull = cv2.dilate(hull, np.ones((15, 15), np.uint8))
    hull[:y0, :] = 0
    hull[y1:, :] = 0
    hull[:, :x0] = 0
    hull[:, x1:] = 0
    alpha = cv2.GaussianBlur(hull.astype(np.float32), (0, 0), 5)[..., None]
    print(f'  ear patch: {int(hull.sum())} px')
    for suffix in ('', '_vup', '_vtilt'):
        p = R.OUT / f'{SHOT}{suffix}.jpg'
        im = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
        out = im * (1 - alpha) + var * alpha
        Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(p, quality=93)
        print(f'  -> {p.relative_to(R.ROOT)}')
    print(f'image spend so far: ${R.spent():.2f} of ${R.budget():.2f}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
