#!/usr/bin/env python3
"""Audition Fish Audio library voices for each character.

    .venv-chatterbox/bin/python scripts/voice/fish_cast.py            # all characters
    .venv-chatterbox/bin/python scripts/voice/fish_cast.py narrator hana

Every candidate reads two real lines of its character. Each take is transcribed with
Whisper and measured (accuracy, words per second, median pitch). Results go to
build/fish_cast/<character>.json plus one WAV reel per character (candidates in order,
1 s apart) so the casting can be heard and compared. Only generic library voices are
listed - no celebrity or film-character clones.
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
OUT = ROOT / 'build' / 'fish_cast'

CANDIDATES: dict[str, list[tuple[str, str]]] = {
    # Lily at nine
    'lily': [
        ('f0dab824efbe4b14abb5bff39d9ae124', 'Little Girl #1 (child, girl)'),
        ('0c0f9d7d87e44e2dabb53ebb092f5f53', 'Child (female, soft)'),
        ('60ae5c99efb0425bb50586aff16d3c58', 'Child (female, soft, narration)'),
        ('085081f7c97c4c478f70f59bd8049f2a', 'little girl (storytelling, bright)'),
    ],
    # her grandmother reading her 1984 diary
    'grandma': [
        ('fb4f0464f53e4f939d00a7c20d17d143', 'Grandma (old, narration, warm)'),
        ('0b6770770baf4db5b13c78c3091584a0', 'Old grandma (warm, gentle)'),
        ('7e4baf13677e4b95b5e25a60b9a717b4', 'Old Woman Audio (old, deep)'),
        ('8db547ea044f44838bf2f8a039f05b5a', 'Old woman (old, warm)'),
    ],
    # one whispered word through the wall
    'rake': [
        ('9ef1568dbcb041969b70f17a83a2d9a9', 'demon-monster (deep, raspy)'),
        ('709bee9ed5084eb2a16dd5ad6cf6c8c5', 'Grandpa (old, raspy)'),
        ('20523e7e21d947169026870bd5354bbb', 'Scary little girl voice (breathy)'),
    ],
}

SAMPLE_LINES = {
    'lily': ['lily_001_man_on_bed', 'lily_003_closer'],
    'grandma': ['grandma_002_danny', 'grandma_004_rule'],
    'rake': ['rake_001_danny', 'rake_001_danny'],
}


def median_f0(x: np.ndarray, sr: int) -> float:
    import librosa

    y = librosa.resample(x.astype(np.float32), orig_sr=sr, target_sr=16000)
    f0 = librosa.yin(y, fmin=60, fmax=500, sr=16000)
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
    n = min(len(f0), len(rms))
    voiced = f0[:n][rms[:n] > np.percentile(rms[:n], 60)]
    return float(np.median(voiced)) if len(voiced) else 0.0


def main() -> int:
    load_env()
    data = json.loads((ROOT / 'build' / 'voice-data.json').read_text())
    lines = {l['id']: l for l in data['VOICE_LINES']}
    chars = sys.argv[1:] or list(CANDIDATES)
    from asr import load

    asr = load('openai/whisper-base.en')
    fish = FishProvider()
    OUT.mkdir(parents=True, exist_ok=True)
    for ch in chars:
        report = []
        reel = []
        for vid, label in CANDIDATES[ch]:
            row = {'id': vid, 'label': label, 'takes': []}
            for lid in SAMPLE_LINES[ch]:
                job = build_job(lines[lid], data, 0, 'fish')
                job['providers']['fish'] = {'referenceId': vid}
                x, sr = fish.synthesize(job)
                x16 = dsp.resample(x, sr, 16000).astype(np.float32)
                heard = asr({'raw': x16, 'sampling_rate': 16000})['text'].strip()
                want = norm(lines[lid].get('spokenText') or lines[lid]['text'])
                words = max(1, len(want))
                # speaking time without leading/trailing silence
                env = np.abs(x) > 0.02 * np.max(np.abs(x))
                idx = np.where(env)[0]
                spoken = (idx[-1] - idx[0]) / sr if len(idx) else len(x) / sr
                row['takes'].append({
                    'line': lid,
                    'similarity': round(similarity(want, norm(heard)), 2),
                    'wps': round(words / max(0.3, spoken), 2),
                    'f0': round(median_f0(x, sr), 1),
                    'heard': heard,
                })
                y = dsp.resample(x, sr, 24000)
                reel.append(y / (np.max(np.abs(y)) + 1e-9) * 0.7)
                reel.append(np.zeros(int(0.35 * 24000)))
            reel.append(np.zeros(int(1.0 * 24000)))
            row['similarity'] = round(float(np.mean([t['similarity'] for t in row['takes']])), 2)
            row['wps'] = round(float(np.mean([t['wps'] for t in row['takes']])), 2)
            row['f0'] = round(float(np.mean([t['f0'] for t in row['takes']])), 1)
            report.append(row)
            print(f"{ch:9s} {label:32s} sim {row['similarity']:.2f}  wps {row['wps']:.2f}  f0 {row['f0']:6.1f}  | {row['takes'][0]['heard'][:60]}", flush=True)
        (OUT / f'{ch}.json').write_text(json.dumps(report, indent=1))
        dsp.write_wav(str(OUT / f'{ch}_reel.wav'), np.concatenate(reel), 24000)
    return 0


if __name__ == '__main__':
    sys.exit(main())
