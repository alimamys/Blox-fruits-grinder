#!/usr/bin/env python3
"""Generates the small noise textures used for film grain / CCTV noise (public/textures)."""
import struct
import zlib
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / 'public' / 'textures'


def png_gray_alpha(path, gray, alpha):
    h, w = gray.shape
    raw = b''.join(b'\x00' + np.dstack([gray, alpha]).astype(np.uint8)[y].tobytes() for y in range(h))

    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)

    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 4, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    path.write_bytes(data)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(63)
    for i in range(4):
        g = rng.integers(0, 256, (256, 256))
        a = np.full((256, 256), 255)
        png_gray_alpha(OUT / f'grain_{i}.png', g, a)
    # chunky 8x8 "compression block" texture for CCTV
    blocks = rng.integers(0, 256, (32, 32)).repeat(8, 0).repeat(8, 1)
    png_gray_alpha(OUT / 'blocks.png', blocks, np.full(blocks.shape, 255))
    print('textures written to', OUT)


if __name__ == '__main__':
    main()
