#!/bin/sh
# After `node scripts/render.mjs`: verify the master (already loudness-mastered and fast-start), name it the upload copy, a 720p preview under 50 MB, loudness numbers and contact sheets every 4 s.
set -e
cd "$(dirname "$0")/.."
echo "== master"
ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets,width,height,r_frame_rate -show_entries format=duration -of compact out/widemouth.mp4
mv out/widemouth.mp4 out/widemouth_1080p_upload.mp4   # render.mjs already wrote it with +faststart
echo "== upload copy"; ls -la out/widemouth_1080p_upload.mp4
ffmpeg -hide_banner -nostats -i out/widemouth_1080p_upload.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"
P=out/x264pass
ffmpeg -v error -y -i out/widemouth_1080p_upload.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v 480k -x264-params aq-mode=3 -pass 1 -passlogfile $P -an -f mp4 /dev/null
ffmpeg -v error -y -i out/widemouth_1080p_upload.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v 480k -x264-params aq-mode=3 -pass 2 -passlogfile $P -c:a aac -b:a 112k -movflags +faststart previews/widemouth_stick_720p.mp4
rm -f $P*
echo "== preview"; ls -la previews/widemouth_stick_720p.mp4
rm -f previews/check_contact_*.jpg
ffmpeg -v error -y -i out/widemouth_1080p_upload.mp4 -vf "fps=1/4,scale=320:180,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x4:padding=4:color=black" -q:v 4 -start_number 1 previews/check_contact_%02d.jpg
ls previews/check_contact_*.jpg | wc -l
echo POST_DONE
