#!/usr/bin/env python3
"""Lip-sync check on the rendered film.

For each picked talking shot (build/review/lipsync_pick.json, frames at 24 fps):
grab the frame at the loudest point of the line (mouth should be OPEN) and a
frame in a pause or just after the line (mouth should be CLOSED), side by side,
with the word being spoken and the subtitle visible. Also reports how much the
two frames differ (a talk-swap shows a clear difference in the face area).

  .venv/bin/python scripts/lipsync_sheet.py out/frame240.mp4 build/review/lipsync_sheet.jpg
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FPS = 24
video, out = sys.argv[1], sys.argv[2]
rows = json.load(open('build/review/lipsync_pick.json'))
font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Black.otf', 22)


def grab(frame: int) -> Image.Image:
    t = (frame + 0.5) / FPS
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', video, '-frames:v', '1', '-vf', 'scale=640:360', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        capture_output=True, check=True,
    ).stdout
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(360, 640, 3))


sheet = Image.new('RGB', (1280, 360 * len(rows)), 'black')
for i, r in enumerate(rows):
    a, b = grab(r['fOpen']), grab(r['fClosed'])
    diff = float(np.abs(np.asarray(a, float) - np.asarray(b, float)).mean())
    for j, (im, lab) in enumerate([(a, f"OPEN  '{r['word']}'  f{r['fOpen']}"), (b, f"CLOSED ({r['closedWhy']})  f{r['fClosed']}")]):
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 640, 30], fill=(0, 0, 0))
        d.text((8, 3), f"{r['shot']}  {lab}", fill=(255, 220, 0) if j == 0 else (120, 220, 255), font=font)
        sheet.paste(im, (j * 640, i * 360))
    print(f"{r['shot']:<22} open f{r['fOpen']} '{r['word']}'  closed f{r['fClosed']}  mean frame diff {diff:.1f}")
sheet.save(out, quality=85)
print('wrote', out)
