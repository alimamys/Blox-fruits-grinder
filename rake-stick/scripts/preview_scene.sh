#!/bin/sh
# Bundle once into build/bundle (no temp bundles in /tmp), render one scene at half size, make a contact
# sheet, and run the frame QA on it.   sh scripts/preview_scene.sh <sceneId> [every_seconds] [--no-video]
set -e
cd "$(dirname "$0")/.."
SC=$1; EVERY=${2:-2}
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
RANGE=$(.venv/bin/python -c "
import json
r=json.load(open('src/data/generated/timeline.report.json'))
for s in r['scenes']:
    if s['id']=='$SC':
        a=round(s['start']*24); b=round((s['start']+s['duration'])*24)-1; print(f'{a} {b}')
")
A=${RANGE% *}; Z=${RANGE#* }
npx remotion bundle src/index.ts --out-dir=build/bundle --log=error > /dev/null
mkdir -p previews/scenes
if [ "$3" != "--no-video" ]; then
  npx remotion render build/bundle RakeHorror previews/scenes/$SC.mp4 --frames=$A-$Z --scale=0.5 --concurrency=4 --browser-executable=$B --log=error
  .venv/bin/python scripts/contact.py previews/scenes/$SC.mp4 $EVERY
fi
REMOTION_BROWSER_EXECUTABLE=$B node scripts/qa.mjs --from=$A --to=$Z --every=3 2>&1 | grep -v "^$" | tail -40
