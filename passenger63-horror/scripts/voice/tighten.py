#!/usr/bin/env python3
"""Tighten expressive takes to the film's pacing.

Fish Audio's Drama 3 model acts well but runs slower than the cut was built for: longer
silence at the end of a line, longer pauses inside it, and it does not apply the
narrator's speed setting. This keeps the performance and restores the pacing:

  1. trims dead air before (to 50 ms) and after (to 120 ms) the voice,
  2. shortens pauses inside a line to at most --max-gap seconds (equal-power crossfade),
  3. if the line is still longer than the pacing reference (the earlier take of the same
     line) by more than 3 %, time-stretches it with Rubber Band (pitch kept), up to
     --max-tempo.

It always reads the untouched takes from --raw-dir (copied there on the first run), so it
can be re-run with other settings. Usage:

    .venv/bin/python scripts/voice/tighten.py --ids build/short_edit_lines.txt
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
AUDIO = ROOT / 'public' / 'audio'
HOP = 0.01  # analysis frame, seconds


def voiced_frames(a: np.ndarray, sr: int) -> np.ndarray:
    mono = a.mean(1) if a.ndim > 1 else a
    hop = int(sr * HOP)
    n = len(mono) // hop
    rms = np.sqrt(np.mean(mono[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms + 1e-9)
    return db > max(db.max() - 35, -60)


def tighten(a: np.ndarray, sr: int, max_gap: float, lead: float = 0.05, tail: float = 0.12) -> np.ndarray:
    v = voiced_frames(a, sr)
    idx = np.nonzero(v)[0]
    if len(idx) == 0:
        return a
    hop = int(sr * HOP)
    start = max(0, int((idx[0] * HOP - lead) * sr))
    end = min(len(a), int(((idx[-1] + 1) * HOP + tail) * sr))
    # pauses inside the line: keep max_gap of each (half from each side), crossfade the join
    keep: list[tuple[int, int]] = []
    cur = start
    run_start = None
    xf = int(0.015 * sr)
    for i in range(idx[0], idx[-1] + 1):
        if not v[i]:
            if run_start is None:
                run_start = i
        elif run_start is not None:
            gap = (i - run_start) * HOP
            if gap > max_gap:
                cut_a = run_start * hop + int(max_gap / 2 * sr)
                cut_b = i * hop - int(max_gap / 2 * sr)
                keep.append((cur, cut_a + xf))
                cur = cut_b
            run_start = None
    keep.append((cur, end))
    out = a[keep[0][0]: keep[0][1]].copy()
    for s, e in keep[1:]:
        seg = a[s:e]
        n = min(xf, len(out), len(seg))
        if n > 0:
            t = np.linspace(0, np.pi / 2, n)
            fo, fi = np.cos(t), np.sin(t)
            if a.ndim > 1:
                fo, fi = fo[:, None], fi[:, None]
            out[-n:] = out[-n:] * fo + seg[:n] * fi
            seg = seg[n:]
        out = np.concatenate([out, seg])
    # short fade at the very end so the trim never clicks
    nf = min(int(0.05 * sr), len(out))
    fade = np.linspace(1, 0, nf)
    out[-nf:] *= fade[:, None] if out.ndim > 1 else fade
    return out


def active_len(path: Path) -> float:
    a, sr = sf.read(path, always_2d=False)
    v = voiced_frames(a, sr)
    idx = np.nonzero(v)[0]
    return (idx[-1] - idx[0] + 1) * HOP if len(idx) else len(a) / sr


def stretch(a: np.ndarray, sr: int, tempo: float, subtype: str) -> np.ndarray:
    with tempfile.TemporaryDirectory() as td:
        src, dst = Path(td) / 'in.wav', Path(td) / 'out.wav'
        sf.write(src, a, sr, subtype=subtype)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'rubberband=tempo={tempo:.4f}:transients=smooth', '-ar', str(sr), str(dst)], check=True)
        b, _ = sf.read(dst, always_2d=False)
    return b


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', required=True, help='file with comma separated line ids (or the list itself)')
    ap.add_argument('--raw-dir', default=str(ROOT / 'build' / 'audio_drama3_raw'))
    ap.add_argument('--ref-dir', default=str(ROOT / 'build' / 'audio_free_backup' / 'audio'), help='pacing reference: earlier takes of the same lines')
    ap.add_argument('--max-gap', type=float, default=0.45, help='longest pause kept inside a narrator line (s)')
    ap.add_argument('--max-gap-dialogue', type=float, default=0.5)
    ap.add_argument('--max-tempo', type=float, default=1.15)
    a = ap.parse_args()
    ids_arg = Path(a.ids).read_text().strip() if Path(a.ids).exists() else a.ids
    ids = [i for i in ids_arg.split(',') if i]
    lines = {l['id']: l for l in json.loads((ROOT / 'build' / 'voice-data.json').read_text())['VOICE_LINES']}
    raw, ref = Path(a.raw_dir), Path(a.ref_dir)
    before = after = 0.0
    stretched = 0
    for i in ids:
        fn = lines[i]['filename']
        dst = AUDIO / fn
        src = raw / fn
        if not src.exists():
            src.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dst, src)
        info = sf.info(src)
        x, sr = sf.read(src, always_2d=False)
        before += len(x) / sr
        gap = a.max_gap if lines[i]['character'] == 'narrator' else a.max_gap_dialogue
        y = tighten(x, sr, gap)
        tempo = 1.0
        if (ref / fn).exists():
            want = active_len(ref / fn) * 1.03
            have = active_len_arr(y, sr)
            tempo = float(np.clip(have / max(want, 0.2), 1.0, a.max_tempo))
        if tempo > 1.01:
            y = stretch(y, sr, tempo, info.subtype)
            stretched += 1
        sf.write(dst, y, sr, subtype=info.subtype)
        after += len(y) / sr
    print(f'tighten: {len(ids)} lines, {before / 60:.2f} -> {after / 60:.2f} min of audio, {stretched} time-stretched')
    return 0


def active_len_arr(a: np.ndarray, sr: int) -> float:
    v = voiced_frames(a, sr)
    idx = np.nonzero(v)[0]
    return (idx[-1] - idx[0] + 1) * HOP if len(idx) else len(a) / sr


if __name__ == '__main__':
    sys.exit(main())
