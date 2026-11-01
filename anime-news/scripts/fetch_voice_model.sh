#!/usr/bin/env bash
# Fetches the open-weight Kokoro-82M v0.19 TTS model (Apache-2.0, int8 ONNX,
# sherpa-onnx packaging: model + 11 voices + tokens + espeak-ng data) and a
# Python runtime for it into .voice-model/ (git-ignored, ~140 MB).
#
# Hugging Face / GitHub release downloads are blocked in the cloud sandbox,
# so the files are taken from the npm package n8n-nodes-ttsbro@0.1.6, which
# vendors sherpa-onnx's kokoro-int8-en-v0_19 bundle unchanged. `npm pack`
# only downloads the tarball; no package scripts are run.
set -euo pipefail
cd "$(dirname "$0")/.."
DIR=.voice-model
mkdir -p "$DIR/tmp"
if [ ! -f "$DIR/kokoro-int8-en-v0_19/model.int8.onnx" ]; then
  (cd "$DIR/tmp" && npm pack n8n-nodes-ttsbro@0.1.6 --silent >/dev/null)
  tar xzf "$DIR/tmp/n8n-nodes-ttsbro-0.1.6.tgz" -C "$DIR" --strip-components=1 package/kokoro-int8-en-v0_19
fi
rm -rf "$DIR/tmp"
if [ ! -x "$DIR/venv/bin/python" ]; then
  python3 -m venv "$DIR/venv"
  # sherpa-onnx 2.x removed the built-in espeak phonemiser this bundle needs
  "$DIR/venv/bin/pip" install -q "sherpa-onnx==1.13.8" numpy soundfile
fi
echo "Kokoro model ready in $DIR"
