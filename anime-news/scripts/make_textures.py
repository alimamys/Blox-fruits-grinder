#!/usr/bin/env python3
"""Film-grain tiles (final, not placeholder): 8 deterministic 512x512 PNGs."""
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "textures"
OUT.mkdir(parents=True, exist_ok=True)
for i in range(8):
    rng = np.random.default_rng(100 + i)
    n = rng.standard_normal((512, 512))
    # slight clumping so grain reads as film, not digital noise
    n = (n + np.roll(n, 1, 0) * 0.35 + np.roll(n, 1, 1) * 0.35) / 1.5
    g = np.clip(128 + n * 38, 0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(OUT / f"grain_{i}.png", optimize=True)
print("grain tiles written")
