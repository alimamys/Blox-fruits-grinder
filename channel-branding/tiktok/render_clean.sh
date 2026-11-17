#!/bin/sh
# Step 1 of the TikTok episodes: render the ORIGINAL Mr. Widemouth (widemouth-horror) again, identical but
# WITHOUT the burned-in subtitles (the vertical episodes get bigger captions of their own), in 6 segments,
# then join and master the sound exactly like scripts/render.mjs. Output: widemouth-horror/public/tiktok/clean.mp4
set -e
cd "$(dirname "$0")/../../widemouth-horror"
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
P=build/tiktok_parts
mkdir -p $P
npx remotion bundle src/index.ts --out-dir=build/bundle_tiktok --log=error > /dev/null
TOTAL=14944
PER=2491
i=0
for a in 0 2491 4982 7473 9964 12455; do
  b=$((a + PER - 1)); [ $b -ge $TOTAL ] && b=$((TOTAL - 1))
  out=$P/part_$i.mkv
  if [ ! -f $out.done ]; then
    npx remotion render build/bundle_tiktok WidemouthHorror $out --frames=$a-$b --codec=h264-mkv --crf=18 --pixel-format=yuv420p --audio-codec=pcm-16 --enforce-audio-track --props='{"subtitles":false}' --concurrency=4 --browser-executable=$B --log=error
    touch $out.done
  fi
  echo "file 'part_$i.mkv'" >> $P/list.tmp
  i=$((i + 1))
done
mv $P/list.tmp $P/list.txt
PRE='alimiter=limit=0.4:attack=3:release=80:level=0'
J=$(ffmpeg -hide_banner -f concat -safe 0 -i $P/list.txt -vn -af "$PRE,loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed -E 's/.*: "([^"]*)".*/\1/'; }
F="$PRE,loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.75:attack=1:release=50:level=0,aresample=48000"
ffmpeg -v error -y -f concat -safe 0 -i $P/list.txt -c:v copy -af "$F" -c:a aac -b:a 256k -video_track_timescale 24000 -movflags +faststart public/tiktok/clean.mp4
rm -rf $P build/bundle_tiktok
ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -show_entries format=duration -of compact public/tiktok/clean.mp4
echo CLEAN_DONE
