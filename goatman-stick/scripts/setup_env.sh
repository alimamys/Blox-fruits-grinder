#!/usr/bin/env bash
# One-time setup for a fresh container (cloud sessions start empty).
#   bash scripts/setup_env.sh          # npm + light Python venv (images, SFX, DSP)
#   bash scripts/setup_env.sh --asr    # + Whisper venv for voice QA and word timing (~1 GB)
set -euo pipefail
cd "$(dirname "$0")/.."

npm install --no-audit --no-fund

python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q numpy scipy soundfile pyloudnorm pillow opencv-python-headless

if [[ "${1:-}" == "--asr" ]]; then
	# Whisper (transformers, CPU) for scripts/voice/qa_voices.py, speech_timing.py, fish_cast.py
	python3 -m venv .venv-chatterbox
	.venv-chatterbox/bin/pip install -q --upgrade pip
	.venv-chatterbox/bin/pip install -q --index-url https://download.pytorch.org/whl/cpu torch
	.venv-chatterbox/bin/pip install -q transformers numpy scipy soundfile pyloudnorm librosa
fi

# Remotion cannot download its own browser here: use the pre-installed headless Chromium.
if [[ -x /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell ]]; then
	echo "export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
fi
echo "setup done"
