#!/bin/sh
# Step 2: the six vertical TikTok episodes from widemouth-horror/public/tiktok/clean.mp4.
# Parts end at scene breaks, each on a cliffhanger.
set -e
cd "$(dirname "$0")/../../widemouth-horror"
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
OUT=../channel-branding/tiktok
npx remotion bundle src/index.ts --out-dir=build/bundle_tt --log=error > /dev/null
n=0
for range in "0 116.5" "116.5 220.8" "220.8 344.6" "344.6 480.4" "480.4 543.0" "543.0 622.6"; do
  n=$((n + 1))
  set -- $range
  npx remotion render build/bundle_tt TikTokPart $OUT/raw_$n.mp4 --props="{\"part\":$n,\"total\":6,\"from\":$1,\"to\":$2}" --codec=h264 --crf=16 --concurrency=4 --browser-executable=$B --log=error
  # TikTok-friendly file: H.264 high, 30 Mbit cap, AAC 192k, faststart, loudness kept from the film's master
  ffmpeg -v error -y -i $OUT/raw_$n.mp4 -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 12M -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 -movflags +faststart $OUT/mr_widemouth_part_${n}_of_6.mp4
  rm $OUT/raw_$n.mp4
  echo "part $n done"
done
rm -rf build/bundle_tt
ls -la $OUT/*.mp4
echo PARTS_DONE
