#!/usr/bin/env python3
"""Build the reference clips that Chatterbox clones each character's timbre from.

    .venv/bin/python scripts/voice/make_references.py          # uses the local Kokoro voices
    .venv/bin/python scripts/voice/make_references.py --force  # rebuild existing clips

Writes voice-references/<character>.wav (and crowd_<voice>.wav). Existing files are
NOT overwritten unless --force is given, so you can drop in real recordings instead
(10-20 s of one clean voice, no music, no reverb) and they will be used as-is.

The clips are synthesised with the same Kokoro casting as before (incl. the old
woman's slight pitch drop and age tremor), so each character keeps a consistent,
distinct timbre; Chatterbox then supplies natural, expressive delivery.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402

import dsp  # noqa: E402

ROOT = HERE.parent.parent
DATA = ROOT / 'build' / 'voice-data.json'
OUT = ROOT / 'voice-references'

TEXTS = {
    'narrator': "It was late, and the sea was very calm that night. Most of the passengers were tired, half asleep against the windows. Nobody expected anything unusual to happen. Not on a crossing this short.",
    'daniel': "Honestly, I'm just tired. Three days with friends on the island, it was great, but I can't wait to get home. Emma's already asleep. I'll wake her when we get in.",
    'emma': "I'm fine, really. I just want to sleep for about twelve hours. Daniel always says that, but this time I mean it. Are we nearly there yet? It feels like we've been out here forever.",
    'oldWoman': "Oh, you were always such a good boy. Do you remember the summers by the water? You used to sit right here beside me, and we would count the boats. One, and two, and three.",
    'captain': "Evening. Conditions are calm, visibility is good, and we expect to arrive on schedule. If anything changes, the crew will let you know. Please stay in your seats for now.",
    'crew1': "Good evening, sorry to bother you. I'm just doing the passenger count before we arrive. If you could keep your ticket handy, that would be great. Thanks very much.",
    'crew2': "Fifty-eight, fifty-nine, sixty. Sorry, one moment, I'm just counting. Sixty-one, sixty-two. Okay. That's everyone on this side, I think.",
    'harbor': "Port Mason Control. Traffic is light this evening, winds southwest at four knots. All vessels, please report your position and expected time of arrival on channel sixteen.",
    'pa': "Good evening, ladies and gentlemen, and welcome aboard. We will shortly be arriving at Port Mason. Please make sure you take all of your personal belongings with you.",
    'police': "Alright. I need you to take a breath for me and start from the beginning. Take your time. Nobody's in trouble here, we just need to understand what happened tonight.",
}
CROWD_TEXT = "Did you see that? I've never seen anything like it. We should have taken the earlier ferry, honestly. Are you okay? Hold on to me, it'll be fine."


def render(k, voice_blend, lang, speed, text, pitch=0.0, tremor=0.0):
    total = sum(w for _, w in voice_blend)
    style = None
    for name, w in voice_blend:
        v = k.get_voice_style(name) * (w / total)
        style = v if style is None else style + v
    tts_speed = speed * 2 ** (-pitch / 12)
    audio, sr = k.create(text, voice=style, speed=float(np.clip(tts_speed, 0.5, 1.8)), lang=lang, sentence_pause=0.3, clause_pause=0.12)
    x = dsp.resample(np.asarray(audio, dtype=np.float64), sr, dsp.SR)
    x = dsp.pitch_shift_resample(x, pitch)
    if tremor > 0:
        x = dsp.vibrato(x, rate=5.3, cents=16 * tremor, amp_depth=0.07 * tremor, seed=5)
    x = dsp.trim_silence(x, dsp.SR, -46, 0.05, 0.2)
    x = dsp.hp(x, 70, dsp.SR, 2)
    x = dsp.normalize_lufs(x, -20)
    return dsp.limit(x, -1.0)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--models-dir', default=str(ROOT / '.voice-models'))
    args = ap.parse_args()
    if not DATA.exists():
        print('Run `node scripts/export-voice-data.mjs` first.')
        return 1
    data = json.loads(DATA.read_text())
    from kokoro_onnx import Kokoro  # type: ignore

    md = Path(args.models_dir)
    k = Kokoro(str(md / 'kokoro-v1.0.onnx'), str(md / 'voices-v1.0.bin'))
    OUT.mkdir(exist_ok=True)
    for c, text in TEXTS.items():
        out = OUT / f'{c}.wav'
        if out.exists() and not args.force:
            print(f'  keep   {out.relative_to(ROOT)}')
            continue
        vc = data['VOICES'][c]
        kv = vc['providers']['kokoro']
        x = render(k, kv['blend'], kv['lang'], vc['baseSpeed'], text, vc['post']['pitchSemitones'], vc['post']['tremor'])
        dsp.write_wav(str(out), dsp.resample(x, dsp.SR, 24000), 24000)
        print(f'  wrote  {out.relative_to(ROOT)}  {len(x) / dsp.SR:.1f}s')
    for pick in data['CROWD_VOICE_POOL']:
        out = OUT / f"crowd_{pick['voice']}.wav"
        if out.exists() and not args.force:
            continue
        x = render(k, [[pick['voice'], 1]], pick['lang'], 1.0, CROWD_TEXT)
        dsp.write_wav(str(out), dsp.resample(x, dsp.SR, 24000), 24000)
        print(f'  wrote  {out.relative_to(ROOT)}  {len(x) / dsp.SR:.1f}s')
    return 0


if __name__ == '__main__':
    sys.exit(main())
