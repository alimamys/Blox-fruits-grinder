#!/usr/bin/env python3
"""Vertical Shorts (1080x1920) cut from the finished films: the frame big in the middle over a blurred
copy of itself, a two-line hook at the top (white + red), the film's own subtitles and sound.

    ../widemouth-horror/.venv/bin/python make_shorts.py
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / 'shorts'
BLACK = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
SEMI = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'

SHORTS = [
    # name, film file, start, end (s), hook line 1 (white), hook line 2 (red), YouTube title
    ('A_widemouth_wave', 'widemouth-horror/out/widemouth_1080p_upload.mp4', 1.6, 42.5,
     'He waved goodbye.', 'He was holding a knife.', 'He Waved Goodbye From My Window. He Had a Knife.'),
    ('B_camping_hotdogs', 'goatman-horror/out/goatman_1080p_upload.mp4', 1.6, 46.2,
     'There were 11 of us.', '12 hot dogs were gone.', 'There Were 11 of Us. 12 Hot Dogs Were Gone.'),
    ('C_widemouth_son', 'widemouth-horror/out/widemouth_1080p_upload.mp4', 591.2, 622.7,
     'My son made', 'a new friend.', "My Son's New Friend Lives Under His Bed"),
]


def main() -> None:
    OUT.mkdir(exist_ok=True)
    rows = []
    for name, film, a, b, l1, l2, title in SHORTS:
        dur = b - a
        t1, t2 = OUT / f'.{name}_1.txt', OUT / f'.{name}_2.txt'
        t1.write_text(l1)
        t2.write_text(l2)
        fc = (
            '[0:v]split=2[a][b];'
            '[a]crop=iw:ih*0.8:0:0,scale=-2:1920,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.20:saturation=1.15[bg];'
            '[b]scale=1440:810,crop=1080:810[fg];'
            '[bg][fg]overlay=0:620[v];'
            f"[v]drawtext=fontfile={BLACK}:textfile={t1}:fontsize=84:fontcolor=white:borderw=7:bordercolor=black@0.85:x=(w-text_w)/2:y=330,"
            f"drawtext=fontfile={BLACK}:textfile={t2}:fontsize=84:fontcolor=0xFF3B30:borderw=7:bordercolor=black@0.85:x=(w-text_w)/2:y=440,"
            f"drawtext=fontfile={SEMI}:text='DADDY TALES':fontsize=36:fontcolor=white@0.75:x=(w-text_w)/2:y=1580[out]"
        )
        out = OUT / f'short_{name}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a}', '-t', f'{dur}', '-i', str(ROOT / film),
                        '-filter_complex', fc, '-map', '[out]', '-map', '0:a',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '24',
                        '-af', f'loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:d=0.12,afade=t=out:st={dur - 0.5:.2f}:d=0.5', '-c:a', 'aac', '-b:a', '192k',
                        '-movflags', '+faststart', str(out)], check=True)
        t1.unlink()
        t2.unlink()
        rows.append(f'{out.name}: {dur:.1f} s  |  title: {title}')
        print(rows[-1])


if __name__ == '__main__':
    main()
