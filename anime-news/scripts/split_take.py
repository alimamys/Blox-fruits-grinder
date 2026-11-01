#!/usr/bin/env python3
"""Split one continuous narration take for a chapter into per-line files.

    python3 scripts/split_take.py S01 path/to/S01_take.wav [--noise -40] [--dry-run]

Finds the (N-1) longest pauses in the take (N = number of caption cues in
the chapter, see src/data/script.json), cuts there, trims each piece and
writes public/audio/narration/<CUE_ID>.wav at 48 kHz. Listen to the result
(or run with --dry-run first): if the narrator paused mid-line, adjust the
take or the cue split in script.json.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def choose_cuts(pauses, cues, total):
    """Pick N-1 pauses, in order, closest to where each line should end
    (word-count proportions), preferring longer pauses. Sentence breaks
    inside a line are therefore not mistaken for line breaks."""
    words = [len(re.split(r"[\s\-]+", c["text"].strip())) for c in cues]
    cum = [sum(words[: i + 1]) for i in range(len(words) - 1)]
    expected = [total * w / sum(words) for w in cum]
    cand = sorted(pauses, key=lambda p: p[1])  # (length, midpoint) by time
    n, m = len(expected), len(cand)
    cost = lambda k, i: abs(cand[i][1] - expected[k]) - 0.5 * min(cand[i][0], 1.0)
    INF = float("inf")
    dp = [[INF] * m for _ in range(n)]
    back = [[-1] * m for _ in range(n)]
    for i in range(m):
        dp[0][i] = cost(0, i)
    for k in range(1, n):
        best, arg = INF, -1
        for i in range(m):
            if i > 0 and dp[k - 1][i - 1] < best:
                best, arg = dp[k - 1][i - 1], i - 1
            if arg >= 0:
                dp[k][i] = best + cost(k, i)
                back[k][i] = arg
    i = min(range(m), key=lambda j: dp[n - 1][j])
    picks = []
    for k in range(n - 1, -1, -1):
        picks.append(cand[i][1])
        i = back[k][i]
    return sorted(picks)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scene")
    ap.add_argument("take")
    ap.add_argument("--noise", type=float, default=-40.0, help="silence threshold in dB")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    script = json.loads((ROOT / "src/data/script.json").read_text(encoding="utf-8"))
    scene = next(s for s in script["scenes"] if s["id"] == a.scene)
    cues = scene["cues"]
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", a.take, "-af", f"silencedetect=n={a.noise}dB:d=0.12", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    total = int(h) * 3600 + int(m) * 60 + float(sec)
    pauses = [(e - s, (s + e) / 2) for s, e in zip(starts, ends) if s > 0.05 and e < total - 0.05]
    if len(pauses) < len(cues) - 1:
        raise SystemExit(f"Only {len(pauses)} pauses found for {len(cues)} lines; try --noise -35")
    cuts = choose_cuts(pauses, cues, total)
    bounds = [0.0] + cuts + [total]
    dst = ROOT / "public/audio/narration"
    dst.mkdir(parents=True, exist_ok=True)
    trim = (
        f"silenceremove=start_periods=1:start_threshold={a.noise}dB:start_silence=0.02,areverse,"
        f"silenceremove=start_periods=1:start_threshold={a.noise}dB:start_silence=0.05,areverse"
    )
    for cue, s, e in zip(cues, bounds, bounds[1:]):
        print(f"{cue['id']}: {s:7.2f}-{e:7.2f}s  {cue['text']}")
        if not a.dry_run:
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.3f}", "-to", f"{e:.3f}", "-i", a.take,
                 "-af", trim, "-ar", "48000", str(dst / f"{cue['id']}.wav")],
                check=True,
            )
    print("dry run" if a.dry_run else "written; now run: npm run timeline")


if __name__ == "__main__":
    main()
