#!/usr/bin/env python3
"""Make the cow's spots black (the image model drew them pale lavender-grey).

Each pixel's "spottiness" is measured along the colour line from the cream fur to the lavender spot
colour; pixels off that line (pink ears, nose, blush, the plum outline) are left alone, and so are the
back feet and front hooves (masked by position). Spot pixels are darkened toward a soft warm black,
keeping their shading and soft edges. Pixels that are already dark are off the line, so running the
tool again only touches a few soft edge pixels. Run it once, after finalize_art.py / pad_to_4.py.

Usage: python3 -I recolor_cow_spots.py <Assets/OopsiePets/Art> [out_preview.png]
"""
import sys
import numpy as np
from PIL import Image

CREAM = np.array([255.0, 250.0, 242.0])
SPOT = np.array([204.0, 192.0, 220.0])      # the lavender-grey the spots were drawn in
BLACK = np.array([58.0, 50.0, 64.0])        # soft warm black (the outlines are dark plum)

# sprite -> list of (cx, cy, rx, ry) ellipses in normalized sprite coords (origin top-left) to keep as is
KEEP = {
    "Characters/Cow/cow_body.png": [(0.15, 0.80, 0.16, 0.17), (0.84, 0.80, 0.16, 0.17), (0.5, 0.93, 0.3, 0.13)],
    "Characters/Cow/cow_head.png": [],
    "Characters/Cow/cow_tail.png": [],
    "Stickers/sticker_cow_slide.png": [],
}


def recolor(path, keep):
    im = np.array(Image.open(path).convert("RGBA")).astype(float)
    rgb, a = im[..., :3], im[..., 3]
    H, W = a.shape
    d = SPOT - CREAM
    v = rgb - CREAM
    t = (v @ d) / (d @ d)                                   # 0 = cream, 1 = spot colour
    resid = np.linalg.norm(v - t[..., None] * d, axis=-1)  # distance from the cream-to-spot line
    w = np.clip((t - 0.15) / 0.6, 0, 1) * np.clip(1 - (resid - 6) / 16, 0, 1)
    w[a < 10] = 0
    yy, xx = np.mgrid[0:H, 0:W]
    for cx, cy, rx, ry in keep:
        w[((xx / W - cx) / rx) ** 2 + ((yy / H - cy) / ry) ** 2 <= 1] = 0
    # Darken toward black but keep each pixel's shading relative to the spot colour.
    shade = np.clip(rgb / SPOT, 0.7, 1.2)
    target = np.clip(BLACK * shade, 0, 255)
    out = rgb * (1 - w[..., None]) + target * w[..., None]
    im[..., :3] = out
    Image.fromarray(im.round().astype(np.uint8)).save(path, optimize=True)
    return int((w > 0.5).sum())


if __name__ == "__main__":
    art = sys.argv[1]
    for rel, keep in KEEP.items():
        print(rel, "spot pixels darkened:", recolor(f"{art}/{rel}", keep))
