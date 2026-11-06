#!/usr/bin/env python3
"""Word timings + mouth envelopes for every voice line (drives subtitles and lip sync).

    .venv-chatterbox/bin/python scripts/voice/speech_timing.py          # all lines
    .venv-chatterbox/bin/python scripts/voice/speech_timing.py --only narrator_001_hook,emma_009_stop

For each WAV in public/audio this
  1. transcribes it with Whisper (word timestamps),
  2. aligns the recognised words to the SCRIPT words (so subtitles always show the
     script text, never Whisper's guesses) - unmatched words are interpolated,
  3. measures the voice level per video frame (30 fps) and stores it as a digit
     string 0..9 (mouth openness for lip sync).
Writes src/data/generated/speechTiming.json:
    {"<line id>": {"w": [["word", start_s, end_s], ...], "e": "0137..."}}
Re-run after regenerating voices (cached by file size + mtime).
"""
from __future__ import annotations

import argparse
import difflib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402

import dsp  # noqa: E402
from qa_voices import norm  # noqa: E402

ROOT = HERE.parent.parent
DATA = ROOT / 'build' / 'voice-data.json'
OUT = ROOT / 'src' / 'data' / 'generated' / 'speechTiming.json'
FPS = 30


def envelope(x: np.ndarray, sr: int) -> str:
    """Per-frame mouth openness 0..9 from the speech-band level."""
    if x.ndim == 2:
        x = x.mean(axis=1)
    y = dsp.bp(x, 200, 3800, sr, 2) if hasattr(dsp, 'bp') else x
    hop = sr / FPS
    n = int(np.ceil(len(y) / hop))
    rms = np.array([np.sqrt(np.mean(y[int(i * hop): int((i + 1) * hop)] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9)
    ref = np.percentile(db, 95) if n else -20
    # -30 dB below the loud parts = closed, loud parts = wide open
    v = np.clip((db - (ref - 30)) / 30, 0, 1) ** 1.3
    # light smoothing so the mouth does not flutter
    if n > 2:
        v = np.convolve(v, [0.25, 0.5, 0.25], mode='same')
    return ''.join(str(int(round(a * 9))) for a in v)


def display_tokens(text: str) -> list[str]:
    return [t for t in text.replace('—', ' — ').split() if t.strip()]


def align(script: str, heard: list[tuple[str, float, float]], dur: float) -> list[list]:
    toks = display_tokens(script)
    flat: list[tuple[str, int]] = []  # normalised word -> display token index
    for i, t in enumerate(toks):
        for w in norm(t):
            flat.append((w, i))
    hflat: list[tuple[str, float, float]] = []
    for w, a, b in heard:
        parts = norm(w)
        if not parts:
            continue
        step = (b - a) / len(parts)
        for k, p in enumerate(parts):
            hflat.append((p, a + k * step, a + (k + 1) * step))
    starts: list[float | None] = [None] * len(toks)
    ends: list[float | None] = [None] * len(toks)
    sm = difflib.SequenceMatcher(None, [w for w, _ in flat], [w for w, _, _ in hflat], autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal' or (tag == 'replace' and (i2 - i1) == (j2 - j1)):
            for k in range(i2 - i1):
                ti = flat[i1 + k][1]
                _, a, b = hflat[j1 + k]
                starts[ti] = a if starts[ti] is None else min(starts[ti], a)
                ends[ti] = b if ends[ti] is None else max(ends[ti], b)
    # interpolate the gaps by character length
    known = [i for i in range(len(toks)) if starts[i] is not None]
    lead = heard[0][1] if heard else 0.05
    tail = heard[-1][2] if heard else max(0.1, dur - 0.1)
    i = 0
    while i < len(toks):
        if starts[i] is not None:
            i += 1
            continue
        j = i
        while j < len(toks) and starts[j] is None:
            j += 1
        a = ends[i - 1] if i > 0 and ends[i - 1] is not None else lead
        b = starts[j] if j < len(toks) and starts[j] is not None else tail
        if b <= a:
            b = a + 0.12 * (j - i)
        weights = [max(1, len(t)) for t in toks[i:j]]
        tot = sum(weights)
        cur = a
        for k in range(i, j):
            span = (b - a) * weights[k - i] / tot
            starts[k], ends[k] = cur, cur + span
            cur += span
        i = j
    out = []
    for k, t in enumerate(toks):
        a = max(0.0, float(starts[k]))
        b = max(a + 0.05, float(ends[k]))
        out.append([t, round(min(a, dur), 3), round(min(b, dur), 3)])
    # monotonic
    for k in range(1, len(out)):
        if out[k][1] < out[k - 1][1]:
            out[k][1] = out[k - 1][1]
        if out[k][2] < out[k][1]:
            out[k][2] = out[k][1] + 0.05
    del known
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='comma separated line ids')
    ap.add_argument('--model', default='openai/whisper-base.en')
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()
    data = json.loads(DATA.read_text())
    prev = json.loads(OUT.read_text()) if OUT.exists() else {}
    only = set(args.only.split(',')) if args.only else None

    from transformers import pipeline  # type: ignore

    asr = pipeline('automatic-speech-recognition', model=args.model, device='cpu')
    result = dict(prev)
    lines = [l for l in data['VOICE_LINES'] if not only or l['id'] in only]
    for n, line in enumerate(lines):
        f = ROOT / 'public' / 'audio' / line['filename']
        if not f.exists():
            continue
        st = f.stat()
        stamp = f'{st.st_size}:{int(st.st_mtime)}'
        if not args.force and prev.get(line['id'], {}).get('k') == stamp:
            continue
        x, sr = dsp.read_wav(str(f))
        mono = x.mean(axis=1) if x.ndim == 2 else x
        dur = len(mono) / sr
        x16 = dsp.resample(mono, sr, 16000).astype(np.float32)
        try:
            r = asr({'raw': x16, 'sampling_rate': 16000}, return_timestamps='word')
            heard = [(c['text'].strip(), float(c['timestamp'][0] or 0), float(c['timestamp'][1] or c['timestamp'][0] or 0)) for c in r.get('chunks', [])]
        except Exception as e:  # noqa: BLE001
            print(f'  ! {line["id"]}: {e}', flush=True)
            heard = []
        words = align(line['text'], heard, dur)
        result[line['id']] = {'k': stamp, 'w': words, 'e': envelope(x, sr)}
        if n % 20 == 0:
            print(f'{n + 1}/{len(lines)} {line["id"]}: ' + ' '.join(f'{w}@{a:.2f}' for w, a, _ in words[:8]), flush=True)
    OUT.write_text(json.dumps(result, separators=(',', ':')))
    print(f'wrote {OUT.relative_to(ROOT)} ({len(result)} lines)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
