#!/usr/bin/env python3
"""Mix QA for a rendered soundtrack (WAV or the audio of an MP4 via ffmpeg).

    python3 scripts/analyze_mix.py out/passenger63_audio_preview.wav

Reports integrated loudness, true-ish peak, dialogue vs. ambience levels (using the
timeline markers), stereo balance, the level of the final whisper and checks that
the last two seconds are silent.
"""
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts' / 'voice'))
import dsp  # noqa: E402


def load(path: str):
    if path.lower().endswith('.wav'):
        return dsp.read_wav(path)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', '48000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float64).reshape(-1, 2) / 32768.0, 48000


def lufs(x, sr):
    try:
        import pyloudnorm as pyln

        return pyln.Meter(sr).integrated_loudness(x)
    except Exception:
        return dsp.loudness_lufs(x, sr)


def rms_db(x):
    return 20 * math.log10(math.sqrt(float(np.mean(x ** 2))) + 1e-12)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'out' / 'passenger63_audio_preview.wav')
    x, sr = load(path)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    subprocess.run(['node', str(ROOT / 'scripts' / 'check.mjs')], stdout=subprocess.DEVNULL, check=True)
    tl = json.loads(subprocess.run(
        ['node', '-e', "const {TIMELINE}=require('./build/timeline-cjs/timeline.cjs');console.log(JSON.stringify({lines:TIMELINE.lines.map(l=>({id:l.line.id,c:l.line.character,s:l.start,e:l.end,o:l.overlay})),total:TIMELINE.totalSeconds,scenes:TIMELINE.scenes.map(s=>({id:s.id,s:s.start,d:s.duration}))}))"],
        capture_output=True, text=True, cwd=ROOT, check=True).stdout)

    print(f'file: {path}  ({len(x) / sr:.1f}s, timeline {tl["total"]:.1f}s)')
    print(f'integrated loudness: {lufs(x, sr):6.1f} LUFS   peak: {20 * math.log10(np.max(np.abs(x)) + 1e-12):5.1f} dBFS')
    l, r = x[:, 0], x[:, 1]
    print(f'stereo balance (L-R RMS): {rms_db(l) - rms_db(r):+.2f} dB')

    speech = np.zeros(len(x), bool)
    for ln in tl['lines']:
        if ln['o']:
            continue
        a, b = int(ln['s'] * sr), int(ln['e'] * sr)
        speech[a:b] = True
    sp = x[speech]
    gaps = x[~speech]
    print(f'speech segments RMS: {rms_db(sp):6.1f} dB   non-speech (ambience/SFX) RMS: {rms_db(gaps):6.1f} dB   -> dialogue sits {rms_db(sp) - rms_db(gaps):.1f} dB above')

    per_char = {}
    for ln in tl['lines']:
        if ln['o']:
            continue
        seg = x[int(ln['s'] * sr): int(ln['e'] * sr)]
        if len(seg) < sr * 0.2:
            continue
        per_char.setdefault(ln['c'], []).append(rms_db(seg))
    print('average level while each character speaks (RMS dB):')
    for c, v in sorted(per_char.items()):
        print(f'   {c:10s} {np.mean(v):6.1f}  ({len(v)} lines)')

    fin = next(ln for ln in tl['lines'] if ln['id'] == 'oldwoman_final_64')
    seg = x[int(fin['s'] * sr): int(fin['e'] * sr)]
    print(f'final "Sixty-four" RMS: {rms_db(seg):.1f} dB (L {rms_db(seg[:, 0]):.1f} / R {rms_db(seg[:, 1]):.1f})')
    tail = x[-int(1.8 * sr):]
    print(f'last 1.8 s peak: {20 * math.log10(np.max(np.abs(tail)) + 1e-12):.1f} dBFS  -> {"SILENT" if np.max(np.abs(tail)) < 1e-3 else "NOT SILENT"}')

    print('scene loudness (short-term RMS dB):')
    for s in tl['scenes']:
        seg = x[int(s['s'] * sr): int((s['s'] + s['d']) * sr)]
        if len(seg):
            print(f'   {s["id"]:18s} {rms_db(seg):6.1f}')


if __name__ == '__main__':
    main()
