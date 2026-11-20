#!/usr/bin/env python3
"""Slice generated sprite sheets into separate trimmed sprites.

Usage: python3 -I slice_sheets.py <ArtSource dir> <out dir>
Each sheet is split into its alpha "islands" (nearby bits merged by dilation), ordered
row-major, and saved under the names listed in SHEETS.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SHEETS = {
    "Effects/mud_sheet_raw.png": ("Effects", ["mud_splat_01", "mud_splat_02", "mud_splat_03", "mud_splat_04", "mud_splat_05", "mud_splat_06"], 18),
    "Effects/fx_sheet_raw.png": ("Effects", ["fx_sparkle_yellow", "fx_sparkle_pink", "fx_heart", "fx_glow_dot", "fx_star", "fx_foam_puff"], 18),
    "Effects/fur_tufts_raw.png": ("Effects", ["fur_tuft_01", "fur_tuft_02", "fur_tuft_03", "fur_tuft_04", "fur_tuft_05", "fur_tuft_06"], 14),
    "UI/ui_icons_sheet_raw.png": ("UI", ["btn_home", "btn_back", "btn_done", "btn_album", "btn_settings", "btn_play", "btn_music", "btn_close"], 6),
    "Accessories/accessories_sheet_raw.png": ("Accessories", ["acc_party_hat", "acc_bow", "acc_sunglasses", "acc_collar", "acc_flower_crown", "acc_funny_glasses"], 14),
    "Objects/clubhouse_objects_raw.png": ("Objects", ["pet_bed", "toy_basket", "toy_ball"], 20),
    "Stickers/stickers_generic_raw.png": ("Stickers", ["sticker_paw", "sticker_rainbow", "sticker_star", "sticker_heart"], 10),
    "Characters/Puppy/puppy_parts_raw.png": ("Characters/Puppy", ["_puppy_head_clipped", "puppy_body", "puppy_ear_left", "puppy_ear_right", "puppy_tail"], 6),
    "Characters/Kitten/kitten_parts_raw.png": ("Characters/Kitten", ["kitten_head", "kitten_body", "kitten_tail"], 10),
    "Characters/Bunny/bunny_parts_raw.png": ("Characters/Bunny", ["bunny_head", "bunny_body", "bunny_ear_left", "bunny_ear_right", "bunny_tail"], 8),
}

SINGLES = {
    "Objects/bathtub_raw.png": "Objects/bathtub",
    "Objects/sponge_raw.png": "Objects/sponge",
    "Objects/brush_raw.png": "Objects/brush",
    "Effects/bubble_raw.png": "Effects/bubble",
    "UI/hand_pointer_raw.png": "UI/hand_pointer",
    "UI/star_icon_raw.png": "UI/star_icon",
    "Characters/Puppy/puppy_head_raw.png": "Characters/Puppy/puppy_head",
    "Characters/Puppy/puppy_reference.png": "Characters/Puppy/puppy_portrait",
    "Characters/Kitten/kitten_reference.png": "Characters/Kitten/kitten_portrait",
    "Characters/Bunny/bunny_reference.png": "Characters/Bunny/bunny_portrait",
    "Stickers/sticker_puppy_happy_raw.png": "Stickers/sticker_puppy_happy",
    "Stickers/sticker_kitten_sleeping_raw.png": "Stickers/sticker_kitten_sleeping",
    "Stickers/sticker_bunny_dancing_raw.png": "Stickers/sticker_bunny_dancing",
}

PAD = 6


def clean_alpha(im):
    a = np.array(im)
    alpha = a[:, :, 3]
    alpha[alpha < 6] = 0  # kill near-invisible haze
    a[:, :, 3] = alpha
    return Image.fromarray(a)


def trim(im):
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 0)
    if len(xs) == 0:
        return im
    x0, x1, y0, y1 = max(xs.min() - PAD, 0), min(xs.max() + PAD + 1, im.width), max(ys.min() - PAD, 0), min(ys.max() + PAD + 1, im.height)
    return im.crop((x0, y0, x1, y1))


def islands(im, dilate):
    a = np.array(im)[:, :, 3] > 10
    big = ndimage.binary_dilation(a, iterations=dilate)
    lab, n = ndimage.label(big)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), start=1):
        if sl is None:
            continue
        area = (lab[sl] == i).sum()
        if area < 900:
            continue
        boxes.append((sl, i, area))
    return lab, boxes


def order_row_major(boxes):
    # Cluster by vertical center into rows, then sort each row by x.
    items = [(((sl[0].start + sl[0].stop) / 2), ((sl[1].start + sl[1].stop) / 2), sl, i) for sl, i, _ in boxes]
    items.sort(key=lambda t: t[0])
    rows, cur = [], []
    for it in items:
        if cur and abs(it[0] - np.mean([c[0] for c in cur])) > 120:
            rows.append(cur)
            cur = []
        cur.append(it)
    if cur:
        rows.append(cur)
    out = []
    for r in rows:
        out.extend(sorted(r, key=lambda t: t[1]))
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    report = {}
    for rel, (folder, names, dilate) in SHEETS.items():
        im = clean_alpha(Image.open(os.path.join(src, rel)).convert("RGBA"))
        lab, boxes = islands(im, dilate)
        if rel.startswith("Characters/"):
            ordered = sorted([(((sl[0].start + sl[0].stop) / 2), ((sl[1].start + sl[1].stop) / 2), sl, i) for sl, i, _ in boxes], key=lambda t: t[1])
        else:
            ordered = order_row_major(boxes)
        if len(ordered) != len(names):
            report[rel] = f"EXPECTED {len(names)} GOT {len(ordered)}"
        a = np.array(im)
        for (cy, cx, sl, i), name in zip(ordered, names):
            mask = (lab == i)
            part = a.copy()
            part[~mask] = 0
            piece = trim(Image.fromarray(part).crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
            os.makedirs(os.path.join(dst, folder), exist_ok=True)
            piece.save(os.path.join(dst, folder, name + ".png"))
            report[f"{folder}/{name}"] = list(piece.size)
    for rel, name in SINGLES.items():
        im = trim(clean_alpha(Image.open(os.path.join(src, rel)).convert("RGBA")))
        os.makedirs(os.path.dirname(os.path.join(dst, name)), exist_ok=True)
        im.save(os.path.join(dst, name + ".png"))
        report[name] = list(im.size)
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
