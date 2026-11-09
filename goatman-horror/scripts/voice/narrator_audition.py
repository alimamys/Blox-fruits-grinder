#!/usr/bin/env python3
"""Audition narrator voices / settings for expressiveness (the narration must not be monotone).

    .venv-chatterbox/bin/python scripts/voice/narrator_audition.py

Each option reads the same six narrator lines with the stronger per-line directions below.
For every take: Whisper accuracy, words per second, and how much the pitch MOVES (standard
deviation and 10-90 % range of f0 in semitones - a flat read barely moves). Writes one WAV per
option to build/narrator_audition/<option>.wav and a summary to build/narrator_audition/report.json.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402

import dsp  # noqa: E402
from generate_voices import build_job, load_env  # noqa: E402
from providers import FishProvider  # noqa: E402
from qa_voices import norm, similarity  # noqa: E402

ROOT = HERE.parent.parent
OUT = ROOT / 'build' / 'narrator_audition'
ONLY = sys.argv[1:]

LINES = {
    'narrator_005_seconds': '[conversational, puzzled]',
    'narrator_030_burst_out': '[urgent, fast, scared]',
    'narrator_036_back_to_them': '[whispering, terrified]',
    'narrator_040_gibbering': '[tense, low voice, creeped out]',
    'narrator_133_pretending': '[slowly, haunted, voice trembling]',
    'narrator_150_bathroom': '[whispering, terrified]',
}

OPTIONS = {}
VOICES = {
    'current': 'f547497123684d1b8f9f23ebbc915015',    # Black (young man, deep, smooth)
    'blackman': '929ef959fd224f23b93f26c09cf46e76',   # Black man (young, conversational)
    'horor': '400857cdad6947349972f4b18a08362f',      # HOROR (young, cinematic)
    'horror': 'abebd21a1e624fa7b67ac72ce371bc60',     # horror (middle-aged, dramatic)
    'adrian': 'bf322df2096a46f18c579d0baa36f41d',     # Adrian (deep, measured, dramatic)
    'horrorcalm': 'ef9c79b62ef34530bf452c0e50e3c260', # horror (deep, low, calm)
    'darkstory': '2832d3fa41e246589ffa41187dafa9b1',  # Dark Story (deep, calm)
    'storyteller': '792f7d9fbbd54f4890a4ed4f56b4c5ef',  # horror story teller (deep, cinematic)
    'struggles': 'b99f2c4a0012471cb32ab61152e7e48d',  # Black_struggles (calm storyteller)
    'narrator': '0327fdb5da9e4fd782899a8058c8ae2b',   # Narrator (young male, calm)
}
for model in ('drama-3', 's2.1-pro'):
    for vname, vid in VOICES.items():
        OPTIONS[f'{model}_{vname}'] = {'referenceId': vid, 'model': model, 'temperature': 0.9, 'topP': 0.9}


def f0_semitones(x: np.ndarray, sr: int) -> np.ndarray:
    import librosa

    y = librosa.resample(x.astype(np.float32), orig_sr=sr, target_sr=16000)
    f0, voiced, _ = librosa.pyin(y, fmin=60, fmax=400, sr=16000, frame_length=1024)
    f0 = f0[voiced & ~np.isnan(f0)]
    return 12 * np.log2(f0 / np.median(f0)) if len(f0) > 10 else np.zeros(1)


def main() -> int:
    load_env()
    data = json.loads((ROOT / 'build' / 'voice-data.json').read_text())
    lines = {l['id']: l for l in data['VOICE_LINES']}
    from asr import load

    asr = load('openai/whisper-base.en')
    fish = FishProvider()
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    for name, opt in OPTIONS.items():
        if ONLY and not any(o in name for o in ONLY):
            continue
        reel, rows = [], []
        for lid, tags in LINES.items():
            line = dict(lines[lid])
            if opt.get('tags') != 'original':
                line['fishTags'] = tags
            job = build_job(line, data, 0, 'fish')
            job['providers']['fish'] = {k: v for k, v in opt.items() if k != 'tags'}
            x, sr = fish.synthesize(job)
            x16 = dsp.resample(x, sr, 16000).astype(np.float32)
            heard = asr({'raw': x16, 'sampling_rate': 16000})['text'].strip()
            st = f0_semitones(x, sr)
            rows.append({'line': lid, 'sim': round(similarity(norm(line.get('spokenText') or line['text']), norm(heard)), 2),
                         'f0_sd': round(float(np.std(st)), 2), 'f0_range': round(float(np.percentile(st, 90) - np.percentile(st, 10)), 2),
                         'dur': round(len(x) / sr, 2), 'heard': heard})
            y = dsp.resample(x, sr, 24000)
            reel += [y / (np.max(np.abs(y)) + 1e-9) * 0.7, np.zeros(int(0.6 * 24000))]
        dsp.write_wav(str(OUT / f'{name}.wav'), np.concatenate(reel), 24000)
        sd = float(np.mean([r['f0_sd'] for r in rows]))
        rg = float(np.mean([r['f0_range'] for r in rows]))
        acc = float(np.mean([r['sim'] for r in rows]))
        report[name] = {'f0_sd': round(sd, 2), 'f0_range': round(rg, 2), 'accuracy': round(acc, 2), 'takes': rows}
        print(f'{name:30s} pitch movement sd {sd:4.2f} st, range {rg:4.2f} st   accuracy {acc:.2f}', flush=True)
    (OUT / 'report.json').write_text(json.dumps(report, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
