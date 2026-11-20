"""Contact sheet of a preview video: one frame every N seconds, timestamped."""
import subprocess, sys, json
from pathlib import Path
from PIL import Image, ImageDraw
vid = Path(sys.argv[1]); every = float(sys.argv[2]) if len(sys.argv) > 2 else 2
dur = float(json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(vid)]))['format']['duration'])
ts = [x * every + 0.3 for x in range(int(dur / every) + 1) if x * every + 0.3 < dur]
tiles = []
for t in ts:
    out = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', str(vid), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-vf', 'scale=384:216', '-'], capture_output=True).stdout
    im = Image.open(__import__('io').BytesIO(out)).convert('RGB')
    ImageDraw.Draw(im).text((4, 4), f'{t:.1f}s', fill=(255, 255, 0))
    tiles.append(im)
cols = 5
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 384, rows * 216))
for i, im in enumerate(tiles):
    sheet.paste(im, ((i % cols) * 384, (i // cols) * 216))
out = vid.with_suffix('.jpg')
sheet.save(out, quality=82)
print(out, len(tiles), 'frames')
