"""Tile build/sheets/<scene>/*.jpeg into previews/scenes/<scene>.jpg (5 across, labelled with scene seconds)."""
import sys, glob, re
from pathlib import Path
from PIL import Image, ImageDraw
every = float(sys.argv[2]) if len(sys.argv) > 2 else 36
for sc in sys.argv[1].split(','):
    fs = sorted(glob.glob(f'build/sheets/{sc}/*.jpeg'))
    tiles = []
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGB')
        ImageDraw.Draw(im).text((4, 4), f'{(6 + i * every) / 24:.1f}s', fill=(255, 255, 0))
        tiles.append(im)
    w, h = tiles[0].size
    cols = 5
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * h))
    for i, im in enumerate(tiles):
        sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    Path('previews/scenes').mkdir(parents=True, exist_ok=True)
    sheet.save(f'previews/scenes/{sc}.jpg', quality=82)
    print(sc, len(tiles))
