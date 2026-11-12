#!/usr/bin/env python3
"""Fix the point of view in Mr. Widemouth's face-to-camera bedroom shots.

These shots are seen from Eli lying in his bed, but the model drew the room behind the creature with
the bed, the headboard and the bedside stool (books, ginger ale) across the room - as if from another
place. One image edit per shot redraws the BACKGROUND as the opposite wall (boxes, curtains, door).
The creature himself (and the knife) is kept pixel-for-pixel from the current frame, so his mouth
drawings and lip line stay valid; the same new background goes into the shot's other drawings.

    .venv/bin/python scripts/images/fix_pov.py [shot ...]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restyle as R  # noqa: E402

BG = ('This frame is seen from Eli\'s pillow - the viewer is lying in the bed. So the bed, its headboard, the patchwork quilt and the '
      'little bedside stool with the picture books and the glass of ginger ale must NOT appear anywhere behind the creature: they are '
      'under and beside the viewer, not across the room. Redraw ONLY the background behind the creature as the OPPOSITE wall of the '
      'same bedroom: the same faded floral wallpaper, stacked taped cardboard moving boxes, the thin white curtains, the bare '
      'floorboards and the closed wooden bedroom door. Keep the creature EXACTLY identical - same pose, face, eyes, mouth, teeth, '
      'fur, ears, hands and anything he holds - and keep the same camera, light and colours.')
SHOTS = {
    # shot: (point on the creature, extra instruction, drawings that share the frame)
    'u_02_wm': ((960, 560), ' Keep the patchwork quilt edge across the bottom of the frame exactly as it is.', ['_talk', '_talk_half']),
    'u_05_mouth': ((960, 450), '', ['_vwide']),
    'n_02_grin': ((1000, 650), ' It is night: cold blue moonlight, deep shadow. Keep the patchwork quilt edge across the bottom of the frame '
                                'exactly as it is.', ['_talk', '_talk_half']),
    'b_06_flat': ((1060, 620), ' The bed the viewer lies in shows ONLY as a strip of patchwork quilt along the bottom-left edge of the '
                                'frame - no headboard, no far end of the bed. Keep the open cardboard box at his feet.', []),
}
RAW = R.ROOT / 'build' / 'pov_fix'
# his face, for measuring how the repaint moved him
FACE = {'u_02_wm': (680, 330, 1260, 800), 'u_05_mouth': (300, 60, 1600, 900), 'n_02_grin': (560, 420, 1400, 860), 'b_06_flat': (880, 380, 1260, 760)}


def face_warp(old: np.ndarray, new: np.ndarray, win: tuple[int, int, int, int]) -> np.ndarray:
    """2x3 affine taking a point of the old frame to the same point of the repainted frame (ECC on his face)."""
    x0, y0, x1, y1 = win
    a = cv2.cvtColor(old, cv2.COLOR_RGB2GRAY).astype(np.float32)[y0:y1, x0:x1]
    b = cv2.cvtColor(new, cv2.COLOR_RGB2GRAY).astype(np.float32)[y0:y1, x0:x1]
    w = np.eye(2, 3, dtype=np.float32)
    cc, w = cv2.findTransformECC(a, b, w, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
    A, t = w[:, :2], w[:, 2]
    o = np.array([x0, y0], np.float32)
    full = np.hstack([A, (t + o - A @ o)[:, None]])
    print(f'    face match {cc:.3f}, scale {np.sqrt(abs(np.linalg.det(A))):.3f}, shift ({full[0, 2]:.1f}, {full[1, 2]:.1f})')
    return full


def main(names: list[str]) -> int:
    R.load_env()
    R.require_key()
    RAW.mkdir(parents=True, exist_ok=True)
    for shot in names or list(SHOTS):
        seed, extra, others = SHOTS[shot]
        base_p = R.OUT / f'{shot}_k1.jpg'
        keep = RAW / f'{shot}_k1_before.jpg'
        if not keep.exists():
            Image.open(base_p).save(keep, quality=95)  # the original, kept once
        old = np.asarray(Image.open(keep).convert('RGB'))
        raw = RAW / f'{shot}_bg.jpg'
        if not raw.exists():
            imgs, prompt = R.edit_request(Image.fromarray(old), ['widemouth'], BG + extra)
            var = R.uncanvas(R.openai_edit(imgs, prompt, 'anim', raw.name, quality='high'))
            var.save(raw, quality=95)
        new = np.asarray(Image.open(raw).convert('RGB').resize((old.shape[1], old.shape[0]), Image.LANCZOS))
        Image.fromarray(new).save(base_p, quality=93)
        M = face_warp(old, new, FACE[shot])
        (RAW / f'{shot}_warp.json').write_text(json.dumps(M.tolist()))
        for suf in others:
            if suf.startswith('_talk'):
                continue  # rebuilt from the new frame by open_mouth.py (lip line moved by the warp)
            src = RAW / f'{shot}_k1{suf}_before.jpg'
            cur = R.OUT / f'{shot}_k1{suf}.jpg'
            if not src.exists() and cur.exists():
                Image.open(cur).save(src, quality=95)
            v = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
            # the drawing differs from the old frame only in his mouth: move that area with him onto the new frame
            d = cv2.GaussianBlur(np.abs(v - old.astype(np.float32)).mean(axis=2), (0, 0), 3) > 14
            m = cv2.dilate(d.astype(np.uint8), np.ones((21, 21), np.uint8)).astype(np.float32)
            H, W = old.shape[:2]
            vw = cv2.warpAffine(v, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            mw = cv2.GaussianBlur(cv2.warpAffine(m, M, (W, H)), (0, 0), 5)[..., None]
            Image.fromarray((new * (1 - mw) + vw * mw).clip(0, 255).astype(np.uint8)).save(cur, quality=93)
            print(f'    + {cur.name} (mouth moved with him)')
    print(f'image spend so far: ${R.spent():.2f} of ${R.budget():.2f}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
