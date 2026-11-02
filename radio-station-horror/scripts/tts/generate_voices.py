#!/usr/bin/env python3
"""
Generates the narration and character voices with Kokoro TTS (open-weight,
Apache-2.0, runs offline on CPU) and writes:

  public/audio/voice/<chapterId>/<beatId>.mp3   one clip per spoken line
  src/data/voice-durations.json                 clip lengths (the timeline grows
                                                each beat to fit its clip)

Usage (from the project folder):

  python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile
  # model files (≈350 MB) from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
  #   kokoro-v1.0.onnx  voices-v1.0.bin
  npx tsx scripts/export-beats.ts > beats.json
  .tts/bin/python scripts/tts/generate_voices.py --beats beats.json --model kokoro-v1.0.onnx --voices voices-v1.0.bin

Needs ffmpeg on PATH. Replace any clip with a real recording of the same name at any
time – real voice acting will always beat TTS.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# speaker -> (kokoro voice, language, speed)
VOICES = {
    'narrator': ('am_michael', 'en-us', 1.3),  # brisk YouTube-horror pace (keeps the video under 8 min)
    'radio': ('bf_emma', 'en-gb', 1.0),  # calm, even, never afraid
    'neighbor': ('am_puck', 'en-us', 1.05),
    'adam': ('am_fenrir', 'en-us', 1.05),
    'seller': ('bm_george', 'en-gb', 1.0),
    'victor': ('bm_fable', 'en-gb', 0.9),
}

# Lines that must be byte-identical (the neighbour's voice repeating "like a recording").
IDENTICAL = {('coldOpen', 'please2'): ('coldOpen', 'please1'), ('coldOpen', 'please3'): ('coldOpen', 'please1')}

NUMBER_WORDS = [
    (r'\b1:17 AM\b', 'one seventeen A M'),
    (r'\b1:16 AM\b', 'one sixteen A M'),
    (r'\b1:17\b', 'one seventeen'),
    (r'\b6B\b', 'six B'),
    (r'\b1987\b', 'nineteen eighty-seven'),
    (r'\b204\b', 'two oh four'),
    (r'\bNOVEMBER 6\b', 'November sixth'),
    (r'^AM\.$', 'A M.'),
    (r'^FM\.$', 'F M.'),
    (r'\bTV\b', 'T V'),
]


def speakable(text: str) -> str:
    t = text
    for pat, rep in NUMBER_WORDS:
        t = re.sub(pat, rep, t)
    letters = re.sub(r'[^A-Za-z]', '', t)
    # ALL-CAPS lines ("DO NOT LEAVE.") -> sentence case, so they are not spelled out
    if len(letters) > 3 and letters.isupper():
        t = t.lower()
        t = re.sub(r'(^|[.!?]\s+)([a-z])', lambda m: m.group(1) + m.group(2).upper(), t)
        t = re.sub(r'\badam rahman\b', 'Adam Rahman', t, flags=re.I)
        t = re.sub(r'\badam\b', 'Adam', t)
    return t


def ffmpeg(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def fx_for(speaker: str, chapter: str) -> str:
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
    if speaker == 'radio':
        # band-limited "broadcast": thin, a little compressed, faint room
        return f'{trim},highpass=f=300,lowpass=f=3400,acompressor=threshold=-22dB:ratio=4:attack=4:release=90:makeup=3,aecho=0.8:0.55:42:0.16'
    if speaker == 'neighbor' and chapter == 'coldOpen':
        # through the apartment door
        return f'{trim},lowpass=f=1300,highpass=f=120,aecho=0.8:0.7:28:0.28'
    if speaker == 'victor':
        # breathy, trembling, close
        return f'{trim},highpass=f=420,lowpass=f=5200,vibrato=f=5.5:d=0.22,aecho=0.8:0.6:55:0.22'
    return f'{trim},highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2'


PEAK_DB = {'narrator': -1.5, 'radio': -3.0, 'neighbor': -4.0, 'adam': -2.5, 'seller': -2.5, 'victor': -5.0}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--beats', required=True)
    ap.add_argument('--model', required=True)
    ap.add_argument('--voices', required=True)
    ap.add_argument('--espeak-data', default=None, help='espeak-ng data dir (if the bundled path is too long)')
    ap.add_argument('--only', default=None, help='regenerate a single chapter id')
    args = ap.parse_args()

    from kokoro_onnx import EspeakConfig, Kokoro

    cfg = EspeakConfig(data_path=args.espeak_data) if args.espeak_data else None
    kokoro = Kokoro(args.model, args.voices, espeak_config=cfg)

    beats = json.load(open(args.beats))
    out_dir = os.path.join(ROOT, 'public', 'audio', 'voice')
    dur_path = os.path.join(ROOT, 'src', 'data', 'voice-durations.json')
    durations = json.load(open(dur_path)) if os.path.exists(dur_path) else {}

    tmp = tempfile.mkdtemp()
    for i, b in enumerate(beats):
        ch, bid, spk = b['chapter'], b['id'], b['speaker']
        if args.only and ch != args.only:
            continue
        if (ch, bid) in IDENTICAL:
            continue
        voice, lang, speed = VOICES[spk]
        text = speakable(b['text'])
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
        raw = os.path.join(tmp, 'raw.wav')
        sf.write(raw, samples, sr)
        proc = os.path.join(tmp, 'proc.wav')
        ffmpeg(['-i', raw, '-af', fx_for(spk, ch), '-ar', '44100', '-ac', '1', proc])
        audio, sr2 = sf.read(proc)
        peak = np.max(np.abs(audio)) or 1.0
        audio = audio / peak * (10 ** (PEAK_DB[spk] / 20))
        pad = np.zeros(int(0.03 * sr2))
        audio = np.concatenate([pad, audio, pad])
        sf.write(proc, audio, sr2)
        os.makedirs(os.path.join(out_dir, ch), exist_ok=True)
        dest = os.path.join(out_dir, ch, f'{bid}.mp3')
        ffmpeg(['-i', proc, '-codec:a', 'libmp3lame', '-b:a', '96k', dest])
        durations[f'{ch}/{bid}'] = round(len(audio) / sr2 + 0.03, 3)
        print(f'[{i + 1}/{len(beats)}] {ch}/{bid} ({spk}) {durations[ch + "/" + bid]:.2f}s  {text}', flush=True)

    for (ch, bid), (sch, sbid) in IDENTICAL.items():
        if args.only and ch != args.only:
            continue
        shutil.copyfile(os.path.join(out_dir, sch, f'{sbid}.mp3'), os.path.join(out_dir, ch, f'{bid}.mp3'))
        durations[f'{ch}/{bid}'] = durations[f'{sch}/{sbid}']

    with open(dur_path, 'w') as fh:
        json.dump(dict(sorted(durations.items())), fh, indent=1)
    print(f'wrote {dur_path} ({len(durations)} clips, {sum(durations.values()):.1f}s of speech)')


if __name__ == '__main__':
    sys.exit(main())
