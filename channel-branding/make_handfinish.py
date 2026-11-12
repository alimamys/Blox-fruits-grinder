#!/usr/bin/env python3
"""v5 "hand-finished" thumbnails: the bright v4 compositions with the tell-tale generated look taken
off - flatter painted colour patches instead of airbrushed gradients, a faint inked outline, paper
texture and film grain, less HDR glow - and lettering that looks printed, not typeset: warm off-white,
a slight tilt, worn edges.

    ../widemouth-horror/.venv/bin/python make_handfinish.py   -> punch/*_thumbnail_v5.jpg + punch/preview_all_v5.jpg
"""
import importlib.util
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('punch', HERE / 'make_punch_thumbs.py')
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)
W, H = P.W, P.H


def noise(shape, scale, seed):
    r = np.random.default_rng(seed)
    n = r.normal(0, 1, (shape[0] // scale + 2, shape[1] // scale + 2)).astype(np.float32)
    return cv2.resize(n, (shape[1], shape[0]), interpolation=cv2.INTER_CUBIC)


def handfinish(im: Image.Image, seed: int) -> Image.Image:
    rgb = np.asarray(im)
    a = rgb.astype(np.float32) / 255
    # 1. painted patches: mean-shift flattens airbrushed gradients into brush-like areas of colour
    painted = cv2.pyrMeanShiftFiltering(rgb, sp=7, sr=22).astype(np.float32) / 255
    a = a * 0.45 + painted * 0.55
    # 2. take some of the glossy HDR off: compress the brightest highlights a little
    a = np.where(a > 0.8, 0.8 + (a - 0.8) * 0.7, a)
    # 3. a faint inked outline on the main shapes
    g = cv2.cvtColor((a * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    e = cv2.Canny(cv2.GaussianBlur(g, (0, 0), 1.6), 35, 95).astype(np.float32) / 255
    e = cv2.GaussianBlur(e, (0, 0), 0.8)
    a = a * (1 - 0.28 * e[..., None])
    # 4. paper texture (two scales) and film grain
    tex = 0.6 * noise(a.shape, 3, seed) + 0.4 * noise(a.shape, 40, seed + 1)
    a = a * (1 + 0.035 * tex[..., None])
    r = np.random.default_rng(seed + 2)
    a = a + r.normal(0, 0.022, a.shape[:2])[..., None] + r.normal(0, 0.006, a.shape)
    # 5. a touch of lens: 1 px colour fringe toward the edges, soft vignette
    out = a.copy()
    out[..., 0] = np.roll(a[..., 0], 1, axis=1)
    out[..., 2] = np.roll(a[..., 2], -1, axis=1)
    yy, xx = np.indices(a.shape[:2])
    rr = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    out = out * (1 - 0.18 * np.clip(rr - 0.55, 0, 1)[..., None])
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))


def printed_text(im: Image.Image, text: str, fkey: str, xy, max_w: int, glow, seed: int, align='left', tilt=-1.6) -> Image.Image:
    """Lettering that looks printed/painted: warm off-white, slightly tilted, worn edges, softer glow."""
    d = ImageDraw.Draw(im)
    size = 200
    while d.textlength(text, font=ImageFont.truetype(P.FONTS[fkey], size)) > max_w:
        size -= 4
    f = ImageFont.truetype(P.FONTS[fkey], size)
    x, y = xy
    if align == 'center':
        x = (W - d.textlength(text, font=f)) / 2
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).text((x, y), text, font=f, fill=255)
    border = Image.new('L', (W, H), 0)
    ImageDraw.Draw(border).text((x, y), text, font=f, fill=255, stroke_width=5, stroke_fill=255)
    # worn edges: knock small specks out of the letters
    wear = (noise((H, W), 2, seed) > 1.55).astype(np.uint8) * 255
    fill = np.clip(np.asarray(layer).astype(np.int16) - wear, 0, 255).astype(np.uint8)
    fill, border = Image.fromarray(fill), border
    fill = fill.rotate(tilt, resample=Image.BICUBIC, center=(x, y))
    border = border.rotate(tilt, resample=Image.BICUBIC, center=(x, y))
    shadow = border.filter(ImageFilter.GaussianBlur(10))
    im.paste((0, 0, 0), (0, 0), shadow.point(lambda v: int(v * 0.85)))
    glow_l = border.filter(ImageFilter.GaussianBlur(16))
    gl = Image.new('RGB', (W, H), glow)
    a = np.asarray(im).astype(np.float32) + np.asarray(gl).astype(np.float32) * (np.asarray(glow_l).astype(np.float32)[..., None] / 255) * 0.55
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    im.paste((14, 12, 12), (0, 0), border)
    im.paste((246, 240, 226), (0, 0), fill)
    return im


def main() -> None:
    made = []
    for k, (name, L) in enumerate(P.LAYOUT.items()):
        im = handfinish(P.bright(name, P.base(name)), seed=31 + k)
        lines = L['text'] if isinstance(L['text'], list) else [L['text']]
        x, y = L['xy']
        for j, ln in enumerate(lines):
            im = printed_text(im, ln, L['font'], (x, y), L['max_w'], L['glow'], seed=70 + 7 * k + j, align=L.get('align', 'left'))
            y += 128
        im.save(P.OUT / f'{name}_thumbnail_v5.jpg', quality=90)
        made.append(im)
    S = Image.new('RGB', (W, H))
    for k, im in enumerate(made):
        S.paste(im.resize((W // 2, H // 2), Image.LANCZOS), ((k % 2) * W // 2, (k // 2) * H // 2))
    S.save(P.OUT / 'preview_all_v5.jpg', quality=88)
    print('v5:', ', '.join(f'{n}_thumbnail_v5.jpg' for n in P.LAYOUT))


if __name__ == '__main__':
    main()
