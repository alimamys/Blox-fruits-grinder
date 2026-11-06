#!/usr/bin/env python3
"""Audition Fish Audio library voices for each character.

    .venv-chatterbox/bin/python scripts/voice/fish_cast.py            # all characters
    .venv-chatterbox/bin/python scripts/voice/fish_cast.py narrator emma

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
    'narrator': [
        ('ef9c79b62ef34530bf452c0e50e3c260', 'horror (deep, low, serious)'),
        ('bf322df2096a46f18c579d0baa36f41d', 'Adrian (deep, measured)'),
        ('e686ae649ee44f219a108aacba206c1a', 'calm storyteller male'),
        ('c3958f083c2d407982263c77cfa831e3', 'Documentary (old, deep)'),
        ('d67524ad1936410896ad120583cb1117', 'Andrew (US storytelling)'),
    ],
    'daniel': [
        ('0327fdb5da9e4fd782899a8058c8ae2b', 'Narrator (young, calm)'),
        ('e4ffba2adbd7417b8fd2621f61b5d8ad', 'Hello (young)'),
        ('b7204d4e40ef4a548c7c8547b7f73492', 'Alok'),
        ('536d3a5e000945adb7038665781a4aca', 'Ethan'),
    ],
    'emma': [
        ('933563129e564b19a115bedd57b7406a', 'Sarah (young, soft)'),
        ('f3a2b90078d54a65af4b95f63bc7798e', 'Sheila (young, US)'),
        ('6ab4c6b0f37f4243a99046478647be94', 'Jade'),
    ],
    'oldWoman': [
        ('001262690f2a4eea84aa764cc536df24', 'Amy (old, calm, serious)'),
        ('ebb049b788714bd3ab399e95c6986b0d', 'Granny (old, slow)'),
        ('300683aa957b44dc860237a6aaa5f9ea', 'Granny (raspy, measured)'),
        ('f45f7cdfe47a4a55aeb1689030b94a32', 'Warm Storyteller (old woman)'),
    ],
    'captain': [
        ('d67524ad1936410896ad120583cb1117', 'Andrew (old, deep)'),
        ('1936333080804be19655c6749b2ae7b2', 'Voice DL (old, calm)'),
        ('f8dfe9c83081432386f143e2fe9767ef', 'Book Record (raspy, calm)'),
    ],
    'crew1': [
        ('536d3a5e000945adb7038665781a4aca', 'Ethan'),
        ('e4ffba2adbd7417b8fd2621f61b5d8ad', 'Hello (young)'),
        ('b23b88a8b7cc4482b0bcdc26beb461d7', 'NOLI'),
    ],
    'crew2': [
        ('f6a19fe5ab494e1fa51bb1476d583a44', 'Abby (US audiobook)'),
        ('06366bd48deb46d98e0df6160f798cb3', 'Middle Aged Woman'),
        ('b347db033a6549378b48d00acb0d06cd', 'Selene'),
    ],
    'harbor': [
        ('c5f56a6cc2ec4fa8920cb4c5889a3fb7', 'Slax (clear, crisp)'),
        ('b7204d4e40ef4a548c7c8547b7f73492', 'Alok'),
        ('7295a63f84f64fa29730719b83239ebd', 'SK1'),
    ],
    'pa': [
        ('06366bd48deb46d98e0df6160f798cb3', 'Middle Aged Woman'),
        ('b347db033a6549378b48d00acb0d06cd', 'Selene'),
        ('0af969cba6c24e74b5600d6df78e8975', 'Narration (female)'),
    ],
    'police': [
        ('b23b88a8b7cc4482b0bcdc26beb461d7', 'NOLI'),
        ('1936333080804be19655c6749b2ae7b2', 'Voice DL'),
        ('76b55591c758444cb95253708696dfad', 'Joe (deep, serious)'),
    ],
}

SAMPLE_LINES = {
    'narrator': ['narrator_001_hook', 'narrator_065_only_difference'],
    'daniel': ['daniel_003_grandmother', 'daniel_005_impossible'],
    'emma': ['emma_011_shes_dead', 'emma_001_wake_me'],
    'oldWoman': ['oldwoman_004_shouldnt', 'oldwoman_002_waiting'],
    'captain': ['captain_003_lost_nav', 'captain_005_negative'],
    'crew1': ['crew_001_ticket', 'crew_005_sir'],
    'crew2': ['crew2_001_count'],
    'harbor': ['harbor_004_docked', 'harbor_005_looking'],
    'pa': ['pa_002_proceed', 'pa_001_passenger37'],
    'police': ['police_001_whose', 'police_002_maam'],
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
    from transformers import pipeline  # type: ignore

    asr = pipeline('automatic-speech-recognition', model='openai/whisper-base.en', device='cpu')
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
