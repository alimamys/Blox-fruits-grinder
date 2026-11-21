#!/usr/bin/env python3
"""Pad sprites to sizes that are multiples of 4 so GPU texture compression (DXT/BC on WebGL) can be
used; otherwise Unity stores them uncompressed (4x the memory and download).

Transparent pixels are added on the TOP and RIGHT only, so every pixel keeps its distance from the
bottom-left corner. Rig pivots (normalized) in both rig_layout.json files are rescaled to match, so
pets assemble exactly as before. Mud splats are skipped (read pixel by pixel at runtime, kept raw).

Usage: python3 -I pad_to_4.py <Assets/OopsiePets/Art> <Assets/OopsiePets/Data/rig_layout.json> <ArtSource/rig_layout.json>
"""
import glob, json, os, sys
from PIL import Image

SKIP = ("mud_splat",)


def pad_dir(art):
    changed = {}
    for f in glob.glob(os.path.join(art, "**", "*.png"), recursive=True):
        name = os.path.basename(f)
        if name.startswith(SKIP) or "/Backgrounds/" in f.replace("\\", "/"):
            continue
        im = Image.open(f)
        w, h = im.size
        W, H = (w + 3) // 4 * 4, (h + 3) // 4 * 4
        if (W, H) == (w, h):
            continue
        im = im.convert("RGBA")
        out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        out.paste(im, (0, H - h))  # keep bottom-left anchored: new rows on top, new columns on the right
        out.save(f, optimize=True)
        changed[name[:-4]] = (w, h, W, H)
    return changed


def fix_unity(path, changed):
    d = json.load(open(path))
    n = 0
    for pet in d["pets"]:
        for part in pet["parts"]:
            c = changed.get(part["file"])
            if c:
                w, h, W, H = c
                part["pivotX"] = round(part["pivotX"] * w / W, 5)
                part["pivotY"] = round(part["pivotY"] * h / H, 5)
                n += 1
    json.dump(d, open(path, "w"), indent=1)
    return n


def fix_authoring(path, changed):
    d = json.load(open(path))
    n = 0
    for pet in d.values():
        for part in pet["parts"].values():
            c = changed.get(part["file"])
            if c:
                w, h, W, H = c
                part["pivot"] = [round(part["pivot"][0] * w / W, 5), round(part["pivot"][1] * h / H, 5)]
                n += 1
    json.dump(d, open(path, "w"), indent=1)
    return n


if __name__ == "__main__":
    art, unity_rig, src_rig = sys.argv[1:4]
    changed = pad_dir(art)
    print("padded", len(changed), "sprites; rig pivots updated:", fix_unity(unity_rig, changed), fix_authoring(src_rig, changed))
