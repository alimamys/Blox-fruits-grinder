#!/bin/sh
# After `node scripts/render.mjs`: verify the master (already loudness-mastered), re-encode it as the upload copy, a 720p preview under 50 MB, loudness numbers and contact sheets every 4 s.
set -e
cd "$(dirname "$0")/.."
echo "== master"
ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets,width,height,r_frame_rate -show_entries format=duration -of compact out/rake.mp4
# re-encode the video (CRF 20, slow) so the upload copy is ~40% of the render's size; the mastered audio is copied as is
ffmpeg -v error -y -i out/rake.mp4 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -c:a copy -movflags +faststart out/rake_1080p_upload.mp4 && rm out/rake.mp4
echo "== upload copy"; ls -la out/rake_1080p_upload.mp4
ffmpeg -hide_banner -nostats -i out/rake_1080p_upload.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"
P=out/x264pass
ffmpeg -v error -y -i out/rake_1080p_upload.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v 360k -x264-params aq-mode=3 -pass 1 -passlogfile $P -an -f mp4 /dev/null
ffmpeg -v error -y -i out/rake_1080p_upload.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v 360k -x264-params aq-mode=3 -pass 2 -passlogfile $P -c:a aac -b:a 96k -movflags +faststart previews/rake_stick_720p.mp4
rm -f $P*
echo "== preview"; ls -la previews/rake_stick_720p.mp4
rm -f previews/check_contact_*.jpg
ffmpeg -v error -y -i out/rake_1080p_upload.mp4 -vf "fps=1/4,scale=320:180,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x4:padding=4:color=black" -q:v 4 -start_number 1 previews/check_contact_%02d.jpg
ls previews/check_contact_*.jpg | wc -l
echo POST_DONE
