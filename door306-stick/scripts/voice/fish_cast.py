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
    # Sarah: narration and her own lines share one voice (the narration is auditioned)
    'narrator': [
        ('933563129e564b19a115bedd57b7406a', 'Sarah (young, soft, breathy)'),
        ('ef4741fd388e42848acaea777b643703', 'horror (female, soft, breathy)'),
        ('836513f294d64aec8403226e69268b1b', 'STORYTELLING VOICE (young, measured)'),
        ('b347db033a6549378b48d00acb0d06cd', 'Selene (soft, calm, gentle)'),
    ],
    'harris': [
        ('d5b3a0954fba413b924daa64cf19fcf4', 'FINN (old, warm)'),
        ('61c186f011d8421096e05effee1c85eb', 'Elderly Wisdom (old, measured)'),
        ('86d2e997840443a1832c999ee71468b2', 'story teller old grandfather (warm)'),
        ('502eaf4758c348a6bf0b1686647f8c77', 'Analog Horror Voice (old, calm)'),
    ],
    'creature': [
        ('9ef1568dbcb041969b70f17a83a2d9a9', 'demon-monster (deep, raspy)'),
        ('e225bbe5f57e4498bea0b99cc83b7e82', 'demon (deep)'),
        ('7b3e7348f6a34afc91eff9dacce8a78a', 'Monster (deep)'),
        ('98544e744e754814a6aa22229f63f475', 'horror voice narrator 2 (deep, dark)'),
    ],
    'landlord': [
        ('536d3a5e000945adb7038665781a4aca', 'Ethan (middle-aged, clear)'),
        ('bf322df2096a46f18c579d0baa36f41d', 'Adrian (middle-aged, measured)'),
        ('beb44e5fac1e4b33a15dfcdcc2a9421d', 'Sleepless historian (middle-aged, calm)'),
    ],
    'caller': [
        ('b545c585f631496c914815291da4e893', 'Friendly Women (young, bright)'),
        ('bddf65d5a84c4a9aa36b7136bdac57a9', 'Women KatKat (young, friendly)'),
        ('57d4a7fa3d944ca5b2407f916ce5f4d5', 'Woman (warm, friendly)'),
    ],
    'womanBelow': [
        ('f6a19fe5ab494e1fa51bb1476d583a44', 'Abby (US, warm)'),
        ('2a9605eeafe84974b5b20628d42c0060', 'Female Voice (calm, reflective)'),
    ],
    'manBelow': [
        ('0327fdb5da9e4fd782899a8058c8ae2b', 'Narrator (male, young)'),
        ('ef9c79b62ef34530bf452c0e50e3c260', 'horror (male, middle-aged)'),
    ],
    'manThird': [
        ('beb44e5fac1e4b33a15dfcdcc2a9421d', 'Sleepless historian (middle-aged)'),
        ('bf322df2096a46f18c579d0baa36f41d', 'Adrian (middle-aged, measured)'),
    ],
}

SAMPLE_LINES = {
    'narrator': ['narrator_002_exactly_306', 'narrator_134_from_mine'],
    'harris': ['harris_002_listen_carefully', 'harris_008_last_time'],
    'creature': ['creature_001_promised'],
    'landlord': ['landlord_003_very_friendly', 'landlord_005_quiet_building'],
    'caller': ['caller_001_still_available', 'caller_004_noisy'],
    'womanBelow': ['woman_001_dont_take_him'],
    'manBelow': ['man_001_dont_look'],
    'manThird': ['man3_001_children'],
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
