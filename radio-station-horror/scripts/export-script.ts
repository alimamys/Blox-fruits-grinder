/*
 * npm run script:export
 *
 * Writes, from the current timings in src/data/script.ts:
 *   narration-script.md  – timecoded recording script (who says what, when, how long)
 *   captions.srt         – subtitles you can upload to YouTube
 */
import fs from 'node:fs';
import path from 'node:path';
import {FPS} from '../src/config';
import {TIMELINE, TOTAL_FRAMES} from '../src/data/timeline';

const root = path.resolve(__dirname, '..');

const tc = (frame: number, sep = '.') => {
	const ms = Math.round((frame / FPS) * 1000);
	const h = Math.floor(ms / 3600000);
	const m = Math.floor((ms % 3600000) / 60000);
	const s = Math.floor((ms % 60000) / 1000);
	const r = ms % 1000;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(r).padStart(3, '0')}`;
};

const SPEAKER: Record<string, string> = {
	narrator: 'NARRATOR',
	radio: 'RADIO VOICE (female, calm, mechanical)',
	neighbor: 'NEIGHBOR',
	adam: 'ADAM',
	seller: 'SELLER',
	victor: 'VICTOR (whisper)',
	sfx: 'SFX',
	silence: '(silence)',
};

let md = `# The Radio Station That Knew His Name — narration script\n\n`;
md += `Total length: ${tc(TOTAL_FRAMES)} (${TOTAL_FRAMES} frames @ ${FPS} fps)\n\n`;
md += `Per-line voice files go in \`public/audio/voice/<chapter>/<beat>.wav\`.\n\n`;

let srt = '';
let n = 1;

for (const ch of TIMELINE) {
	md += `## ${ch.title}  \`${ch.id}\` — starts ${tc(ch.start)}\n\n`;
	md += `| start | dur (s) | beat | speaker | line |\n|---|---|---|---|---|\n`;
	for (const b of ch.beats) {
		md += `| ${tc(b.absStart)} | ${b.dur.toFixed(2)} | \`${b.id}\` | ${SPEAKER[b.speaker]} | ${b.text.replace(/\|/g, '\\|') || '—'} |\n`;
		if (b.text && b.speaker !== 'silence') {
			srt += `${n++}\n${tc(b.absStart, ',')} --> ${tc(b.absStart + b.frames, ',')}\n${b.text}\n\n`;
		}
	}
	md += '\n';
}

fs.writeFileSync(path.join(root, 'narration-script.md'), md);
fs.writeFileSync(path.join(root, 'captions.srt'), srt);
console.log(`Wrote narration-script.md and captions.srt (${n - 1} captions, total ${tc(TOTAL_FRAMES)}).`);
