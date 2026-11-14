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
    # Marcus at 28 telling it (the narration carries the film)
    'narrator': [
        ('f547497123684d1b8f9f23ebbc915015', 'Black (young man, deep, smooth)'),
        ('929ef959fd224f23b93f26c09cf46e76', 'Black man (young, conversational)'),
        ('b99f2c4a0012471cb32ab61152e7e48d', 'Black_struggles (calm storyteller)'),
        ('0327fdb5da9e4fd782899a8058c8ae2b', 'Narrator (young male, calm)'),
        ('792f7d9fbbd54f4890a4ed4f56b4c5ef', 'horror story teller (deep)'),
    ],
    'marcus': [
        ('b841aacef7dc48f9b18b6e89bf573e80', 'Young teenager (boy, deep)'),
        ('d9ce1833c191476db346efb50aa20722', 'boy (young, relaxed)'),
        ('929ef959fd224f23b93f26c09cf46e76', 'Black man (young, conversational)'),
    ],
    'wyatt': [
        ('17079d6adb8b4ecc8e42c8e6f489492b', 'Chill southern child'),
        ('4fbed27c40e3465f98bc777fd0cc35ff', 'boy (young)'),
        ('73c18cf2f929465d803b901f30e989bb', 'E-Boy (young, calm)'),
    ],
    'ray': [
        ('829184c635314c9485e48690116ff8ad', 'Child voice boy'),
        ('b9011feb3c6f46ddaeb90043fab0eb4a', 'Kid (bright)'),
        ('d9ce1833c191476db346efb50aa20722', 'boy (young, relaxed)'),
    ],
    'nia': [
        ('ffd05ab81f184e10b6767e52342dd244', 'black girl talking'),
        ('5ecd89ee97ea434c984a3fe6420e22d8', 'Teen girl (soft)'),
        ('ee2fa25a56364be9a80d0028eecc6ea4', 'Girl (energetic)'),
    ],
    'dawes': [
        ('fee420f4813d4318bfea84f8f6cac53f', 'redneck (old, Southern)'),
        ('061d766c12fb468ba644fda015e237fc', 'HillBilly (middle-aged)'),
        ('5755f5c3448444968a83ce277148ad8a', 'Bubba (old, deep)'),
    ],
    'cole': [
        ('061d766c12fb468ba644fda015e237fc', 'HillBilly (middle-aged)'),
        ('802e3bc2b27e49c2995d23ef70e6ac89', 'Energetic Male (young)'),
        ('17079d6adb8b4ecc8e42c8e6f489492b', 'Chill southern child'),
    ],
}

SAMPLE_LINES = {
    'narrator': ['narrator_005_seconds', 'narrator_049_walks_into'],
    'marcus': ['marcus_001_twelve', 'marcus_002_get_back'],
    'wyatt': ['wyatt_001_lock_door', 'wyatt_003_only_six'],
    'ray': ['ray_001_goatman', 'ray_002_took_two'],
    'nia': ['nia_001_get_it_out'],
    'dawes': ['dawes_001_stick_together'],
    'cole': ['cole_001_little_friend', 'cole_002_get_gone'],
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
