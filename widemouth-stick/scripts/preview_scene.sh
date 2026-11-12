#!/bin/sh
# Render one scene of the stick film at half size and make a contact sheet of frames.
#   sh scripts/preview_scene.sh <sceneId> [every_seconds]
set -e
cd "$(dirname "$0")/.."
SC=$1; EVERY=${2:-2}
RANGE=$(.venv/bin/python -c "
import json,math
r=json.load(open('src/data/generated/timeline.report.json'))
for s in r['scenes']:
    if s['id']=='$SC':
        a=round(s['start']*24); b=round((s['start']+s['duration'])*24)-1; print(f'{a}-{b}')
")
mkdir -p previews/scenes
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  npx remotion render src/index.ts WidemouthHorror previews/scenes/$SC.mp4 --frames=$RANGE --scale=0.5 --concurrency=4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell 2>&1 | grep -E "rror|previews" | tail -3
.venv/bin/python scripts/contact.py previews/scenes/$SC.mp4 $EVERY
