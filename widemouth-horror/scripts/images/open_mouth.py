#!/usr/bin/env python3
"""Open Mr. Widemouth's mouth in code - along its WHOLE width.

The image model's open-mouth drawings opened his ear-to-ear mouth only partly (the middle, or one
side), and the merge could take only part of what changed. Here the opening is built from the frame
itself: along the measured lip line (the split between upper and lower lip, or below the upper teeth),
the jaw below drops and/or the lip above lifts - widest in the middle, closing smoothly at both corners
like a real jaw - and the gap fills with the dark of his mouth. Two drawings per shot:

    public/restyle/<shot>_k1_talk_half.jpg   (half open)      public/restyle/<shot>_k1_talk.jpg   (open)

    .venv/bin/python scripts/images/open_mouth.py [shot ...]

No image-model call, no cost. The lip lines were measured on gridded crops of each frame.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'restyle'

# shot: lip line points (x, y) in 1920x1080 frame pixels, left corner to right corner; A = full opening
# in px; k = share of the opening made by the jaw dropping (the rest: the upper lip lifting);
# down / up = how far below / above the line the movement fades out (the chin / the cheeks stretch).
MOUTHS = {
    'u_02_wm': dict(pts=[(720, 658), (756, 675), (812, 694), (868, 707), (924, 712), (1000, 710), (1058, 703), (1103, 694),
                         (1148, 680), (1187, 661), (1212, 640)], A=17, k=0.85, down=95, up=40),
    'r_05_path': dict(pts=[(757, 527), (803, 552), (866, 576), (929, 586), (992, 588), (1034, 584), (1076, 574), (1105, 559),
                           (1124, 540)], A=14, k=0.85, down=80, up=36),
    't_06_play': dict(pts=[(885, 440), (905, 449), (930, 456), (970, 460), (1010, 457), (1035, 450), (1052, 438)],
                      A=7, k=0.9, down=34, up=14),
    # only the upper teeth show and the quilt hides his jaw: the upper lip and teeth lift instead
    'n_02_grin': dict(pts=[(634, 792), (660, 806), (700, 812), (800, 814), (900, 815), (1000, 815), (1100, 813), (1180, 806),
                           (1230, 792), (1265, 775), (1290, 755)], A=13, k=0.0, down=10, up=72),
}

INSIDE = np.array([16, 10, 10], np.float32)  # the dark of his mouth (RGB)


def open_mouth(img: np.ndarray, pts, A: float, k: float, down: float, up: float, amount: float) -> np.ndarray:
    H, W = img.shape[:2]
    xs = np.array([p[0] for p in pts], np.float32)
    ys = np.array([p[1] for p in pts], np.float32)
    X = np.arange(W, dtype=np.float32)
    s = np.interp(X, xs, ys).astype(np.float32)
    s = cv2.GaussianBlur(s[None, :], (0, 0), 4)[0]
    xl, xr = float(xs.min()), float(xs.max())
    u = np.clip((X - xl) / (xr - xl), 0, 1)
    o = amount * A * np.clip(np.sin(np.pi * u), 0, 1) ** 0.7
    o[(X < xl) | (X > xr)] = 0
    od, ou = k * o, (1 - k) * o
    Y = np.arange(H, dtype=np.float32)[:, None]
    S, OD, OU = s[None, :], od[None, :], ou[None, :]
    map_y = np.repeat(Y, W, axis=1)
    map_x = np.repeat(X[None, :], H, axis=0)
    # below the line: depth t moves to t' = t*(1 - OD/down) + OD  (fades to nothing at `down`)
    tb = Y - S
    below = (tb >= OD) & (tb < down)
    src_b = S + (tb - OD) / np.maximum(1e-3, 1 - OD / down)
    map_y = np.where(below, src_b, map_y)
    # above the line: height t moves to t' = t*(1 - OU/up) + OU
    ta = S - Y
    above = (ta >= OU) & (ta < up)
    src_a = S - (ta - OU) / np.maximum(1e-3, 1 - OU / up)
    map_y = np.where(above, src_a, map_y)
    out = cv2.remap(img.astype(np.float32), map_x, map_y.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    # the gap: soft-edged, darkest in the middle of the opening
    gap = np.clip(np.minimum(tb + OU + 0.5, OD - tb + 0.5) * np.where(OU + OD > 0.6, 1, 0), 0, None)
    alpha = np.clip(gap / 1.6, 0, 1)[..., None]
    depth = np.clip(np.minimum(tb + OU, OD - tb) / np.maximum(1, (OU + OD) / 2), 0, 1)[..., None]
    inside = INSIDE * (1.25 - 0.35 * depth)
    return np.clip(out * (1 - alpha) + inside * alpha, 0, 255).astype(np.uint8)


def main(names: list[str]) -> int:
    for shot in names or list(MOUTHS):
        g = MOUTHS[shot]
        base = np.asarray(Image.open(OUT / f'{shot}_k1.jpg').convert('RGB'))
        for amount, suffix in ((0.5, '_talk_half'), (1.0, '_talk')):
            im = open_mouth(base, g['pts'], g['A'], g['k'], g['down'], g['up'], amount)
            Image.fromarray(im).save(OUT / f'{shot}_k1{suffix}.jpg', quality=93)
        print(f'  {shot}: mouth opened along {g["pts"][-1][0] - g["pts"][0][0]} px (full {g["A"]} px, half {g["A"] / 2:.0f} px)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
