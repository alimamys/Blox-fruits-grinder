#!/usr/bin/env python3
"""Remove the small mouths the image model drew on the 'blank' heads, so the code-driven
mouth overlays are the only mouth. Inpaints dark line pixels inside a box under the nose.

Usage: python3 -I clean_faces.py <sliced dir>
"""
import sys
import cv2
import numpy as np
from PIL import Image

# head file -> (x0, y0, x1, y1) box (in head pixels) holding the mouth lines, below the nose
BOXES = {
    "Characters/Puppy/puppy_head.png": (218, 391, 346, 426),
    "Characters/Bunny/bunny_head.png": (140, 197, 198, 219),
}


def clean(path, box):
    im = np.array(Image.open(path).convert("RGBA"))
    rgb = im[:, :, :3].copy()
    x0, y0, x1, y1 = box
    region = rgb[y0:y1, x0:x1].astype(np.int32)
    lum = 0.299 * region[:, :, 0] + 0.587 * region[:, :, 1] + 0.114 * region[:, :, 2]
    mask = np.zeros(rgb.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = (lum < 170).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    out = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)
    im[:, :, :3] = cv2.cvtColor(out, cv2.COLOR_BGR2RGB)
    Image.fromarray(im).save(path)
    return int((mask > 0).sum())


if __name__ == "__main__":
    root = sys.argv[1]
    for rel, box in BOXES.items():
        print(rel, "inpainted px:", clean(f"{root}/{rel}", box))
