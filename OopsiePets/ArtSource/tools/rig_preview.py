#!/usr/bin/env python3
"""Compose a pet rig from its parts using rig_layout.json and render it next to the
reference portrait, so the layout can be tuned by eye before it goes into Unity.

Usage: python3 -I rig_preview.py <art dir with Characters/...> <rig_layout.json> <pet> <out.png> [expression]
Rig space: pixels, origin at the bottom-center of the pet, +y up. Each part's (x, y) is
where its pivot sits; pivot is given in normalized sprite coords (0..1, origin bottom-left).
"""
import json, sys
from PIL import Image

FACE = {"neutral": ("eye_open", "mouth_smile"), "happy": ("eye_happy", "mouth_laugh"),
        "surprised": ("eye_wide", "mouth_o"), "blink": ("eye_blink", "mouth_smile")}


def place(canvas, img, x, y, scale, pivot, origin, flip=False, rot=0):
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    w, h = img.size
    img = img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    if rot:
        img = img.rotate(rot, resample=Image.BICUBIC, expand=False)
    px, py = pivot
    left = origin[0] + x - px * img.width
    top = origin[1] - y - (1 - py) * img.height
    canvas.alpha_composite(img, (int(left), int(top)))


def render(art, layout, pet, expression="neutral"):
    L = layout[pet]
    W, H = 900, 900
    origin = (W // 2, H - 60)
    canvas = Image.new("RGBA", (W, H), (205, 235, 220, 255))
    parts = sorted(L["parts"].items(), key=lambda kv: kv[1]["order"])
    head = L["parts"]["head"]
    for name, p in parts:
        if name in ("eyes", "mouth"):
            continue
        img = Image.open(f"{art}/Characters/{L['folder']}/{p['file']}.png").convert("RGBA")
        place(canvas, img, p["x"], p["y"], p["scale"], p["pivot"], origin, p.get("flip", False))
        if name == "head":
            eye, mouth = FACE[expression]
            f = L["face"]
            e = Image.open(f"{art}/Characters/Shared/{eye}.png").convert("RGBA")
            for sx in (-1, 1):
                place(canvas, e, head["x"] + sx * f["eye_dx"], head["y"] + f["eye_y"], f["eye_scale"], (0.5, 0.5), origin, flip=sx > 0)
            m = Image.open(f"{art}/Characters/Shared/{L.get('mouth', mouth) if expression == 'neutral' else mouth}.png").convert("RGBA")
            place(canvas, m, head["x"], head["y"] + f["mouth_y"], f["mouth_scale"], (0.5, 1.0), origin)
    return canvas


def main():
    art, layout_path, pet, out = sys.argv[1:5]
    layout = json.load(open(layout_path))
    exprs = ["neutral", "happy", "surprised"]
    tiles = [render(art, layout, pet, e) for e in exprs]
    ref = Image.open(f"{art}/Characters/{layout[pet]['folder']}/{pet}_portrait.png").convert("RGBA")
    ref.thumbnail((900, 900))
    rt = Image.new("RGBA", (900, 900), (235, 215, 235, 255))
    rt.alpha_composite(ref, ((900 - ref.width) // 2, 900 - 60 - ref.height))
    sheet = Image.new("RGBA", (900 * 4, 900))
    sheet.paste(rt, (0, 0))
    for i, t in enumerate(tiles):
        sheet.paste(t, (900 * (i + 1), 0))
    sheet.convert("RGB").resize((1800, 450)).save(out)


if __name__ == "__main__":
    main()
