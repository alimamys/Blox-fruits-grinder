#!/usr/bin/env python3
"""Neural narration with Kokoro-82M (open weights, Apache-2.0), fully offline.

Writes public/audio/narration_tts/<CUE_ID>.wav for every caption cue, using
the narrator settings in src/data/script.json ("narrator"). A human/approved
recording in public/audio/narration/<CUE_ID>.wav always takes priority.

Setup once:   bash scripts/fetch_voice_model.sh
Run:          .voice-model/venv/bin/python scripts/make_narration_kokoro.py [--scenes S01] [--voice bm_george] [--force]
Voice reel:   .voice-model/venv/bin/python scripts/make_narration_kokoro.py --reel
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / ".voice-model" / "kokoro-int8-en-v0_19"
OUT = ROOT / "public" / "audio" / "narration_tts"
VOICES = ["af", "af_bella", "af_nicole", "af_sarah", "af_sky", "am_adam", "am_michael",
          "bf_emma", "bf_isabella", "bm_george", "bm_lewis"]

# Broadcast-narrator polish: rumble cut, warmth, presence, gentle compression,
# a touch of early reflections so the voice sits in the mix, loudness target.
POLISH = (
    "highpass=f=70,"
    "equalizer=f=140:t=q:w=0.9:g=2.5,"
    "equalizer=f=3200:t=q:w=1.2:g=2.0,"
    "equalizer=f=7500:t=q:w=2:g=-1.5,"
    "acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=2,"
    "aecho=0.92:0.5:23|41:0.10|0.06,"
    "loudnorm=I=-16:TP=-1.5:LRA=8,"
    "afade=t=in:d=0.008,areverse,afade=t=in:d=0.03,areverse"
)


def load_tts():
    if not (MODEL / "model.int8.onnx").exists():
        raise SystemExit("Model missing: run  bash scripts/fetch_voice_model.sh")
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=str(MODEL / "model.int8.onnx"),
                voices=str(MODEL / "voices.bin"),
                tokens=str(MODEL / "tokens.txt"),
                data_dir=str(MODEL / "espeak-ng-data"),
            ),
            num_threads=4,
        )
    )
    return sherpa_onnx.OfflineTts(cfg)


def tts_text(cue):
    # Same words as the caption; typography normalised for the phonemiser.
    return cue.get("tts", cue["text"]).replace("’", "'").replace("—", ", ")


def render(tts, text, voice, speed, dst):
    audio = tts.generate(text, sid=VOICES.index(voice), speed=speed)
    with tempfile.TemporaryDirectory() as td:
        raw = Path(td) / "raw.wav"
        sf.write(str(raw), np.asarray(audio.samples, dtype=np.float32), audio.sample_rate)
        trim = (
            "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,"
            "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,"
        )
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", trim + POLISH,
                        "-ar", "24000", "-ac", "1", str(dst)], check=True)


def duration(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(p)]).decode())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default="")
    ap.add_argument("--voice", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--reel", action="store_true", help="write out/voice_samples.wav comparing voices")
    a = ap.parse_args()
    data = json.loads((ROOT / "src/data/script.json").read_text(encoding="utf-8"))
    nar = data["narrator"]
    voice = a.voice or nar["voice"]
    tts = load_tts()

    if a.reel:
        out = ROOT / "out" / "voice_samples"
        out.mkdir(parents=True, exist_ok=True)
        parts = []
        for v in nar["reelVoices"]:
            dst = out / f"{v}.wav"
            render(tts, f"Voice {v.split('_')[1].capitalize()}. " + " ".join(c["text"] for c in data["scenes"][0]["cues"][:3]),
                   v, nar["sceneSpeed"].get("S01", nar["speed"]), dst)
            parts.append(dst)
            print(v, f"{duration(dst):.1f}s")
        lst = out / "list.txt"
        gap = out / "gap.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "0.8", str(gap)], check=True)
        lst.write_text("".join(f"file '{p}'\nfile '{gap}'\n" for p in parts))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "libmp3lame", "-q:a", "3", str(ROOT / "out" / "voice_samples.mp3")], check=True)
        print("out/voice_samples.mp3 written")
        return

    wanted = set(filter(None, a.scenes.split(",")))
    OUT.mkdir(parents=True, exist_ok=True)
    for scene in data["scenes"]:
        if wanted and scene["id"] not in wanted:
            continue
        speed = nar["sceneSpeed"].get(scene["id"], nar["speed"])
        for cue in scene["cues"]:
            dst = OUT / f"{cue['id']}.wav"
            if dst.exists() and not a.force:
                continue
            render(tts, tts_text(cue), voice, cue.get("ttsSpeed", speed), dst)
            words = len(cue["text"].replace("-", " ").split())
            d = duration(dst)
            print(f"{cue['id']}: {d:5.2f}s  {words / d * 60:4.0f} wpm  ({voice} x{cue.get('ttsSpeed', speed)})")
    print(f"Kokoro narration written to {OUT.relative_to(ROOT)} (voice {voice}).")


if __name__ == "__main__":
    main()
