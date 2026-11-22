#!/usr/bin/env python3
"""Rebuild an ear that the image model cut off at the edge of a parts sheet, by mirroring the pet's
other ear across the face's centre line. Only the band of rows holding the ear, left of `xcut`, is
replaced, so the rest of the head (spots, blush) stays as drawn. The sprite grows by `pad` columns on
the left; the rig pivot in both rig_layout.json files is moved to match.

Runs only if the left edge is still clipped (opaque pixels in column 0), so it is safe to run twice.
Usage: python3 -I fix_clipped_ear.py <Assets/OopsiePets/Art> <Assets/OopsiePets/Data/rig_layout.json> <ArtSource/rig_layout.json>
"""
import json, sys
import numpy as np
from PIL import Image

# sprite (relative to Art/) -> (axis x in the sprite, extra columns on the left, xcut, first row, last row)
FIXES = {"Characters/Cow/cow_head.png": (222.0, 60, 58, 30, 275)}


def fix(path, ax, pad, xcut, r0, r1):
    a = np.array(Image.open(path).convert("RGBA"))
    if (a[:, 0, 3] > 40).sum() == 0:
        return None  # already whole
    H, W = a.shape[:2]
    out = np.zeros((H, W + pad, 4), np.uint8)
    out[:, pad:] = a
    m = np.zeros_like(out)
    for X in range(W + pad):
        xs = int(round(2 * (ax + pad) - X)) - pad
        if 0 <= xs < W:
            m[:, X] = a[:, xs]
    out[r0:r1, :pad + xcut] = m[r0:r1, :pad + xcut]
    Image.fromarray(out).save(path, optimize=True)
    return W, W + pad


def main():
    art, unity_rig, authoring_rig = sys.argv[1:4]
    for rel, (ax, pad, xcut, r0, r1) in FIXES.items():
        res = fix(f"{art}/{rel}", ax, pad, xcut, r0, r1)
        if not res:
            print(rel, "already fixed")
            continue
        w0, w1 = res
        name = rel.split("/")[-1][:-4]
        u = json.load(open(unity_rig))
        for pet in u["pets"]:
            for part in pet["parts"]:
                if part["file"] == name:
                    part["pivotX"] = round((part["pivotX"] * w0 + pad) / w1, 5)
        json.dump(u, open(unity_rig, "w"), indent=1)
        a = json.load(open(authoring_rig))
        for pet in a.values():
            for part in pet["parts"].values():
                if part["file"] == name:
                    # authoring pivots refer to the sliced (unpadded) width; same shift applies
                    part["pivot"][0] = round((part["pivot"][0] * w0 + pad) / w1, 5)
        json.dump(a, open(authoring_rig, "w"), indent=1)
        print(rel, f"rebuilt ear: {w0} -> {w1} px wide")


if __name__ == "__main__":
    main()
