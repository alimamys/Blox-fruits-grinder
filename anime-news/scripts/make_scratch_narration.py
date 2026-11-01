#!/usr/bin/env python3
"""TEMPORARY scratch narration generator.

Synthesises one WAV per caption cue with the offline SVOX Pico engine
(pico2wave, en-GB), falling back to eSpeak NG. These files are a TIMING GUIDE
ONLY: robotic, not broadcast quality, and must be replaced by the final
narrator recording (see ASSETS.md). They are written to
public/audio/narration_scratch/<CUE_ID>.wav. A final recording placed at
public/audio/narration/<CUE_ID>.wav always takes priority.

Usage: python3 scripts/make_scratch_narration.py [--scenes S01,S02] [--force]
"""
import argparse
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "data" / "script.json"
OUT = ROOT / "public" / "audio" / "narration_scratch"
TARGET_WPM = 150.0  # brief: 145-155 wpm while speaking


def tts_text(cue):
    text = cue.get("tts", cue["text"])
    # Normalise typography that the old engines mis-read.
    return (
        text.replace("’", "'")
        .replace("—", ", ")
        .replace("–", " to ")
    )


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out.decode().strip())


def synth(text, wav):
    if shutil.which("pico2wave"):
        subprocess.run(["pico2wave", "-l", "en-GB", "-w", str(wav), text], check=True)
        return "pico2wave en-GB"
    subprocess.run(["espeak-ng", "-v", "en-gb", "-s", "150", "-w", str(wav), text], check=True)
    return "espeak-ng en-gb"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default="")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    wanted = set(filter(None, args.scenes.split(",")))
    data = json.loads(SCRIPT.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    engine = "?"
    n = 0
    for scene in data["scenes"]:
        if wanted and scene["id"] not in wanted:
            continue
        for cue in scene["cues"]:
            dst = OUT / f"{cue['id']}.wav"
            if dst.exists() and not args.force:
                continue
            with tempfile.TemporaryDirectory() as td:
                raw = Path(td) / "raw.wav"
                trimmed = Path(td) / "trim.wav"
                engine = synth(tts_text(cue), raw)
                # Trim leading/trailing silence so cue timing is exact.
                trim = (
                    "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.02,"
                    "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse"
                )
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", trim, str(trimmed)], check=True)
                # count hyphenated number words separately ("one-point-eight" = 3)
                words = len([w for w in re.split(r"[\s\-]+", tts_text(cue)) if w])
                wpm = words / duration(trimmed) * 60
                tempo = min(1.2, max(0.9, TARGET_WPM / wpm))
                chain = (
                    f"atempo={tempo:.3f},highpass=f=70,lowpass=f=7200,"
                    "acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
                    "loudnorm=I=-17:TP=-1.5:LRA=7,aresample=24000,"
                    "afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse"
                )
                subprocess.run(
                    ["ffmpeg", "-v", "error", "-y", "-i", str(trimmed), "-af", chain, "-ac", "1", "-ar", "24000", str(dst)],
                    check=True,
                )
            n += 1
            print(f"{cue['id']}: {duration(dst):5.2f}s  ({words} words, raw {wpm:.0f} wpm, tempo x{tempo:.2f})")
    print(f"Done: {n} scratch cue(s) via {engine}. TEMPORARY - replace with the final narrator recording.")


if __name__ == "__main__":
    main()
