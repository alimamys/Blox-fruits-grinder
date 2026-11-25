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
    'yadda': [
        ('a338ee4b05a34d0eae617dd8f649eb39', 'Old woman (raspy, storytelling)'),
        ('98d1974a78da46f9bad528667241cb70', 'Old woman (deep, authoritative)'),
        ('61168b9b4f35486cae1cddb8a644f372', 'Ron (female, middle-aged, storytelling)'),
        ('7f0c9ee0fa3b478a8f49456e5facc3fb', 'Warm storyteller (female)'),
    ],
    'narrator': [
        ('0d5a7ad85f8e4dc19935b734ddbdd22a', 'V Khaleeji (female, warm narration)'),
        ('8c476d81a36a40d68975b5cd6640f028', 'Abeer (Khaleeji, soft, warm)'),
        ('7255e8e666ef4fc7a2a327215bdb96fc', 'Girl (Khaleeji, soft, breathy)'),
    ],
    'girl': [
        ('0f6ee259d0894c019f4b1c5056e65a3e', 'Little girl (Arabic, bright)'),
        ('60ddaa0fb7b74bd78928135b0ff7819d', 'Cheerful Arab little girl'),
        ('2ed3ece1a4f94ddabed35ced0193d650', 'Small child'),
    ],
    'noura': [
        ('c7ad74ba54bb42389e1501850697959e', 'Saudi woman 3 (middle-aged)'),
        ('779cda8570924a0aa7b965840c097ab1', 'Saudi woman (serious, confident)'),
        ('8d152d169872454ba01e16eaf307b11b', 'Kuwait (female, calm)'),
        ('8c476d81a36a40d68975b5cd6640f028', 'Abeer (Khaleeji, soft, warm)'),
    ],
    'mother': [
        ('98d1974a78da46f9bad528667241cb70', 'Old woman (deep, authoritative)'),
        ('f85aca8cd5334a87aadef3aa7315635d', 'Firm woman (middle-aged)'),
        ('a338ee4b05a34d0eae617dd8f649eb39', 'Old woman (raspy, storytelling)'),
    ],
    'drummer': [
        ('7255e8e666ef4fc7a2a327215bdb96fc', 'Girl (Khaleeji, soft, breathy)'),
        ('0ef625d613804bfea4c7b760afdc4558', 'Layan (soft, breathy)'),
        ('66f29adb3a954c529a0a9823cd12ad4e', 'Ya galbi (Gulf, soft)'),
    ],
    'man': [
        ('e1c27b5f09a64a2480bc168473710be1', 'Old man (deep, Arabic)'),
        ('c961db045a4e454cae0bad518350677c', 'Old Arab man (warm)'),
        ('1c573c29512a49738f0e4b3c06b30223', 'Abu Zaidan (old, raspy)'),
    ],
}

SAMPLE_LINES = {
    'yadda': ['yadda_002_sabahiya', 'yadda_016_hooves'],
    'narrator': ['narrator_001_once', 'narrator_001_once'],
    'girl': ['girl_001_scary', 'girl_002_run'],
    'noura': ['noura_001_booked', 'noura_002_keep'],
    'mother': ['mother_001_tomorrow', 'mother_003_play'],
    'drummer': ['drummer_001_feet', 'drummer_002_go'],
    'man': ['man_001_empty', 'man_001_empty'],
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
