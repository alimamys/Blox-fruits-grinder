#!/usr/bin/env python3
"""Vertical Shorts (1080x1920) from "The Jinn Wedding", in the same look as make_shorts.py: the frame big in the middle
over a blurred copy of itself, a two-line hook at the top (white + red), the film's own subtitles and sound, the channel
name at the bottom - plus a "full story" line over the last seconds. A Short can join two moments of the film
(a short dip to black between them).

    python3 make_jinn_shorts.py
"""
import subprocess
from pathlib import Path

from PIL import ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / 'shorts'
FILM = ROOT / 'jinn-wedding-stick/out/jinn_1080p_upload.mp4'
BLACK = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
SEMI = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
CHANNEL = 'DADDY TALES'
DIP = 0.17  # seconds of fade to / from black where two moments are joined

SHORTS = [
    # name, [(start, end) in the film, s], hook line 1 (white), hook line 2 (red)
    # the hall: eyes shining in the dark, "Look at their feet", the hooves, "Run? Where to?", "Keep playing."
    ('D_jinn_hooves', [(137.95, 186.0)], 'She sang at a wedding.', 'The guests had hooves.'),
    # dawn: the mother of the bride raises her hand, "You were everything they said", the man in the sand, the ruin
    ('E_jinn_ruin', [(211.85, 269.15)], 'They played all night.', "The house wasn't there."),
    # the call ("Five hundred dinars"), then Yadda's warning and the phone in the majlis ringing
    ('F_jinn_call', [(45.12, 74.05), (291.85, 306.62)], 'If a stranger calls you,', 'ask whose wedding it is.'),
]


def fit(text: str, size: int = 84, width: int = 980) -> int:
    """the largest font size (up to `size`) at which the hook line fits the frame"""
    w = ImageFont.truetype(BLACK, size).getlength(text)
    return size if w <= width else int(size * width / w)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, segs, l1, l2 in SHORTS:
        durs = [b - a for a, b in segs]
        dur = sum(durs)
        t1, t2 = OUT / f'.{name}_1.txt', OUT / f'.{name}_2.txt'
        t1.write_text(l1)
        t2.write_text(l2)
        cta = OUT / f'.{name}_3.txt'
        cta.write_text('Full story: The Jinn Wedding')
        args = []
        for a, b in segs:
            args += ['-ss', f'{a}', '-t', f'{b - a}', '-i', str(FILM)]
        n = len(segs)
        pre = ''
        for i, d in enumerate(durs):
            vf = []
            af = []
            if i > 0:
                vf.append(f'fade=t=in:d={DIP}')
                af.append('afade=t=in:d=0.08')
            if i < n - 1:
                vf.append(f'fade=t=out:st={d - DIP:.3f}:d={DIP}')
                af.append(f'afade=t=out:st={d - 0.12:.3f}:d=0.12')
            pre += f"[{i}:v]{','.join(vf) or 'null'}[v{i}];[{i}:a]{','.join(af) or 'anull'}[a{i}];"
        pre += ''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[cv][ca];'
        fc = (
            pre + '[cv]split=2[a][b];'
            '[a]crop=iw:ih*0.8:0:0,scale=-2:1920,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.20:saturation=1.15[bg];'
            '[b]scale=1440:810,crop=1080:810[fg];'
            '[bg][fg]overlay=0:620[v];'
            f"[v]drawtext=fontfile={BLACK}:textfile={t1}:fontsize={fit(l1)}:fontcolor=white:borderw=7:bordercolor=black@0.85:x=(w-text_w)/2:y=330,"
            f"drawtext=fontfile={BLACK}:textfile={t2}:fontsize={fit(l2)}:fontcolor=0xFF3B30:borderw=7:bordercolor=black@0.85:x=(w-text_w)/2:y=440,"
            f"drawtext=fontfile={SEMI}:textfile={cta}:fontsize=44:fontcolor=white:borderw=4:bordercolor=black@0.8:x=(w-text_w)/2:y=1480:"
            f"alpha='min(1,max(0,(t-{dur - 3.0:.2f})/0.4))':enable='gte(t,{dur - 3.0:.2f})',"
            f"drawtext=fontfile={SEMI}:text='{CHANNEL}':fontsize=36:fontcolor=white@0.75:x=(w-text_w)/2:y=1580[out];"
            f'[ca]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:d=0.12,afade=t=out:st={dur - 0.5:.2f}:d=0.5[aout]'
        )
        out = OUT / f'short_{name}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', fc, '-map', '[out]', '-map', '[aout]',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '24',
                        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', str(out)], check=True)
        for t in (t1, t2, cta):
            t.unlink()
        print(f'{out.name}: {dur:.1f} s')


if __name__ == '__main__':
    main()
