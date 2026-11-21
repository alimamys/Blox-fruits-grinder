#!/usr/bin/env python3
"""Copy processed sprites into the Unity project at mobile-friendly sizes.

Usage: python3 -I finalize_art.py <sliced dir> <ArtSource dir> <Assets/OopsiePets/Art dir> [--no-backgrounds]
"""
import glob, os, shutil, sys
from PIL import Image

MAX = {  # longest edge in pixels, by name prefix (first match wins)
    "bg_": 1536, "bathtub": 900, "sponge": 420, "brush": 460, "bubble": 256, "hand_pointer": 300,
    "star_icon": 256, "btn_": 256, "sticker_": 420, "acc_": 400, "pet_bed": 448, "toy_": 360,
    "mud_splat": 300, "fx_": 128, "fur_tuft": 220, "_portrait": 512, "gift_box": 512, "eye_": 256, "mouth_": 256,
}


def limit(name):
    for k, v in MAX.items():
        if name.startswith(k) or k in name:
            return v
    return 1024


def main():
    sliced, src, dst = sys.argv[1:4]
    n = 0
    for f in glob.glob(os.path.join(sliced, "**", "*.png"), recursive=True):
        rel = os.path.relpath(f, sliced)
        name = os.path.basename(rel)
        if name.startswith("_"):
            continue  # rejected pieces (e.g. a clipped head)
        im = Image.open(f).convert("RGBA")
        m = limit(name[:-4])
        if max(im.size) > m:
            s = m / max(im.size)
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        out = os.path.join(dst, rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, optimize=True)
        n += 1
    if "--no-backgrounds" in sys.argv:
        print("wrote", n)
        return
    for raw, name in [("bg_clubhouse_raw", "bg_clubhouse"), ("bg_washroom_raw", "bg_washroom"),
                      ("bg_dressup_raw", "bg_dressup"), ("bg_album_raw", "bg_album")]:
        Image.open(os.path.join(src, "Backgrounds", raw + ".png")).convert("RGB").save(
            os.path.join(dst, "Backgrounds", name + ".png"), optimize=True)
        n += 1
    print("wrote", n)


if __name__ == "__main__":
    main()
