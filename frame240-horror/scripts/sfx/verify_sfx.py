#!/usr/bin/env python3
"""Measure every WAV in public/audio/sfx (or the files given): format, peak/clipping, DC,
first/last samples (click risk), loop-seam continuity for beds, LUFS, energy above 150 Hz,
and the largest sample-to-sample jump relative to the signal (click detector).

  .venv/bin/python scripts/sfx/verify_sfx.py [files...] [--beds name,name] [--json out.json]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent.parent
BED_TAIL = 0.5
MUSIC = {'tension_pulse'}  # rhythmic: the loop starts on a downbeat, so no RMS-continuity check
BEDS = {'ocean_ambience', 'ferry_engine', 'wind', 'low_horror_drone', 'crowd_murmur', 'bridge_electronics',
        'emergency_hum', 'room_tone', 'daylight_ambience', 'tension_pulse',
        # Frame 240
        'computer_fan', 'rain_window', 'apartment_tone', 'light_buzz_bed', 'closet_tone'}


def measure(path: Path) -> dict:
    info = sf.info(str(path))
    x, sr = sf.read(str(path), always_2d=True)
    m = x.mean(axis=1)
    name = path.stem
    d = dict(name=name, sr=sr, ch=info.channels, subtype=info.subtype, dur=round(len(x) / sr, 3))
    pk = float(np.max(np.abs(x)))
    d['peak_db'] = round(20 * np.log10(pk + 1e-12), 2)
    d['clipped'] = int(np.sum(np.abs(x) >= 0.9999))
    d['dc'] = float(np.max(np.abs(x.mean(axis=0))))
    meter = pyln.Meter(sr)
    xx = x if len(x) > 0.45 * sr else np.concatenate([x, np.zeros((int(0.45 * sr) - len(x), x.shape[1]))])
    d['lufs'] = round(float(meter.integrated_loudness(xx)), 1)
    f, p = signal.welch(m, sr, nperseg=min(8192, len(m)))
    tot = p.sum() + 1e-30
    d['e150'] = round(float(p[f > 150].sum() / tot * 100), 1)
    d['e80'] = round(float(p[f < 80].sum() / tot * 100), 1)
    diffs = np.abs(np.diff(x, axis=0))
    p999 = float(np.percentile(diffs, 99.9)) + 1e-9
    d['first'] = float(np.max(np.abs(x[0])))
    d['last'] = float(np.max(np.abs(x[-1])))
    d['max_jump_ratio'] = round(float(diffs.max() / p999), 2)
    if name in BEDS:
        # beds = loop of length Lp followed by a BED_TAIL copy of the head (see AudioLayer.tsx)
        tail = int(round(BED_TAIL * sr))
        lp_ = len(x) - tail
        d['loop_len'] = round(lp_ / sr, 3)
        d['tail_match'] = float(np.max(np.abs(x[lp_:] - x[:tail])))  # ~1-2 LSB of dither
        seam = float(np.max(np.abs(x[0] - x[lp_ - 1])))
        d['seam_ratio'] = round(seam / p999, 3)  # < 1: the wrap is smoother than 99.9 % of normal steps
        k = int(0.05 * sr)
        d['seam_rms_db'] = round(float(20 * np.log10((np.sqrt(np.mean(x[:k] ** 2)) + 1e-12) / (np.sqrt(np.mean(x[lp_ - k:lp_] ** 2)) + 1e-12))), 2)
    return d


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='*')
    ap.add_argument('--json')
    a = ap.parse_args()
    files = [Path(f) for f in a.files] or sorted((ROOT / 'public' / 'audio' / 'sfx').glob('*.wav'))
    rows = [measure(f) for f in files]
    bad = 0
    for d in rows:
        flags = []
        if d['sr'] != 48000 or d['ch'] != 2 or d['subtype'] != 'PCM_16':
            flags.append('FORMAT')
        if d['clipped']:
            flags.append(f"CLIP{d['clipped']}")
        if d['dc'] > 0.002:
            flags.append('DC')
        if d['name'] in BEDS:
            if d['seam_ratio'] > 1.0 or (abs(d['seam_rms_db']) > 3 and d['name'] not in MUSIC):
                flags.append('SEAM')
            if d['tail_match'] > 0.001:
                flags.append('TAIL')
        elif d['first'] > 0.002 or d['last'] > 0.002:
            flags.append('EDGE')
        if d['max_jump_ratio'] > 25:
            flags.append('JUMP?')
        bad += bool(flags)
        seam = f" loop {d['loop_len']}s seam {d['seam_ratio']:.2f}/{d['seam_rms_db']:+.1f}dB" if 'seam_ratio' in d else ''
        print(f"{d['name']:24s} {d['dur']:6.2f}s {d['sr']} {d['ch']}ch pk {d['peak_db']:6.1f} {d['lufs']:6.1f} LUFS "
              f">150Hz {d['e150']:5.1f}% <80Hz {d['e80']:5.1f}% jump {d['max_jump_ratio']:5.1f}{seam} {' '.join(flags)}")
    print(f'{len(rows)} files, {bad} flagged')
    if a.json:
        Path(a.json).write_text(json.dumps(rows, indent=1))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
