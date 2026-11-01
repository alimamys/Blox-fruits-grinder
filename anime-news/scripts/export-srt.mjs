#!/usr/bin/env node
// Writes SRT captions from src/generated/timeline.json — the exact same
// caption windows the video burns in (timed from the narration audio).
// Usage: node scripts/export-srt.mjs <OpeningPreview|Main> <out.srt>
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [id = 'Main', out = `out/${id}.srt`] = process.argv.slice(2);
const tl = JSON.parse(readFileSync(join(ROOT, 'src/generated/timeline.json'), 'utf8'));
const cues = tl.scenes.flatMap((s) => s.cues);

// keep in sync with PREVIEW_FRAMES in src/lib/timeline.ts
let end = tl.totalFrames;
if (id === 'OpeningPreview') {
	const target = 20 * tl.fps;
	const running = cues.find((c) => c.startFrame < target && c.endFrame > target);
	end = running ? running.endFrame + 8 : target;
}

const ts = (frame) => {
	const ms = Math.round((frame / tl.fps) * 1000);
	const h = Math.floor(ms / 3600000);
	const m = Math.floor((ms % 3600000) / 60000);
	const s = Math.floor((ms % 60000) / 1000);
	const r = ms % 1000;
	const p = (n, w = 2) => String(n).padStart(w, '0');
	return `${p(h)}:${p(m)}:${p(s)},${p(r, 3)}`;
};

const lines = cues
	.filter((c) => c.captionStart < end)
	.map((c, i) => `${i + 1}\n${ts(c.captionStart)} --> ${ts(Math.min(c.captionEnd, end))}\n${c.text}\n`);
mkdirSync(dirname(join(ROOT, out)), {recursive: true});
writeFileSync(join(ROOT, out), lines.join('\n'));
console.log(`${out}: ${lines.length} captions, ends ${ts(end)}`);
