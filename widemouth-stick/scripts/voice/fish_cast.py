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
    'eli': [
        ('829184c635314c9485e48690116ff8ad', 'Child voice boy'),
        ('b9011feb3c6f46ddaeb90043fab0eb4a', 'Kid (bright)'),
        ('0c0f9d7d87e44e2dabb53ebb092f5f53', 'Child (soft, gentle)'),
    ],
    'widemouth': [
        ('a53517d5d4dc43248e4436b599a34c26', 'Gremlin (high, playful)'),
        ('0cb4497cb68b451b89d9480945dbd441', 'Gremmie (relaxed)'),
        ('de9d48bf9b0e466a85f27d3e678ad94e', 'Twinko (soft, bright)'),
        ('a3d61f39b5114be3bffb345159077528', 'Cute (playful)'),
    ],
    'mom': [
        ('f6a19fe5ab494e1fa51bb1476d583a44', 'Abby (US, warm)'),
        ('57d4a7fa3d944ca5b2407f916ce5f4d5', 'Woman (warm, friendly)'),
        ('b347db033a6549378b48d00acb0d06cd', 'Selene (soft, calm)'),
    ],
    'dad': [
        ('536d3a5e000945adb7038665781a4aca', 'Ethan (middle-aged, clear)'),
        ('8a5a849eff184046ae6bdb9a1825165c', 'sleep (calm, gentle)'),
        ('beb44e5fac1e4b33a15dfcdcc2a9421d', 'Sleepless historian (calm)'),
    ],
    'leo': [
        ('4fcb3a423c61415fb35604eba567d95f', 'Energetic Child'),
        ('b9011feb3c6f46ddaeb90043fab0eb4a', 'Kid (bright)'),
        ('829184c635314c9485e48690116ff8ad', 'Child voice boy'),
    ],
}

SAMPLE_LINES = {
    'eli': ['eli_004_far_down', 'eli_005_mom_kill_me'],
    'widemouth': ['widemouth_007_how_to_play', 'widemouth_011_almost'],
    'mom': ['mom_001_who', 'mom_002_steak_knife'],
    'dad': ['dad_001_last_move'],
    'leo': ['leo_001_new_friend', 'leo_002_under_bed'],
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
