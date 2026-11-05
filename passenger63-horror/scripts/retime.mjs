#!/usr/bin/env node
// npm run retime
// Measures every WAV in public/audio (reads the RIFF header - no ffprobe needed)
// and writes src/data/generated/audioManifest.json. src/data/timeline.ts reads that
// manifest, so every scene start/duration, cut, reveal and SFX cue is recomputed
// from the REAL voice durations. Visuals follow the voices.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = path.join(root, 'public', 'audio');
const outFile = path.join(root, 'src', 'data', 'generated', 'audioManifest.json');

export const wavInfo = (file) => {
	const fd = fs.openSync(file, 'r');
	try {
		const head = Buffer.alloc(12);
		fs.readSync(fd, head, 0, 12, 0);
		if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') return null;
		let pos = 12;
		let fmt = null;
		const size = fs.fstatSync(fd).size;
		while (pos + 8 <= size) {
			const ch = Buffer.alloc(8);
			fs.readSync(fd, ch, 0, 8, pos);
			const id = ch.toString('ascii', 0, 4);
			const len = ch.readUInt32LE(4);
			if (id === 'fmt ') {
				const b = Buffer.alloc(16);
				fs.readSync(fd, b, 0, 16, pos + 8);
				fmt = {channels: b.readUInt16LE(2), sampleRate: b.readUInt32LE(4), byteRate: b.readUInt32LE(8), bits: b.readUInt16LE(14)};
			} else if (id === 'data' && fmt) {
				const dataLen = Math.min(len, size - pos - 8);
				return {duration: dataLen / fmt.byteRate, channels: fmt.channels, sampleRate: fmt.sampleRate};
			}
			pos += 8 + len + (len % 2);
		}
		return null;
	} finally {
		fs.closeSync(fd);
	}
};

const walk = (dir) =>
	fs.existsSync(dir)
		? fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) => {
				const p = path.join(dir, e.name);
				return e.isDirectory() ? walk(p) : e.name.toLowerCase().endsWith('.wav') ? [p] : [];
			})
		: [];

const files = {};
for (const f of walk(audioDir).sort()) {
	const info = wavInfo(f);
	if (!info) continue;
	const rel = path.relative(audioDir, f).split(path.sep).join('/');
	files[rel] = {duration: Math.round(info.duration * 1000) / 1000, channels: info.channels, sampleRate: info.sampleRate};
}

fs.mkdirSync(path.dirname(outFile), {recursive: true});
fs.writeFileSync(outFile, JSON.stringify({generatedAt: new Date().toISOString(), files}, null, 1) + '\n');

const voiceFiles = Object.keys(files).filter((f) => !f.startsWith('sfx/'));
const speech = voiceFiles.reduce((a, f) => a + files[f].duration, 0);
console.log(`retime: ${Object.keys(files).length} audio files (${voiceFiles.length} voice, ${(speech / 60).toFixed(1)} min of speech)`);
console.log(`retime: wrote ${path.relative(root, outFile)} - the timeline now uses the real durations.`);
console.log('retime: run `npm run check` for a scene-by-scene timing report.');
