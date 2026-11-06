#!/usr/bin/env node
// Exact shot list of the main composition (every cut, frame ranges, stable shot ids and
// art metadata) for the image pipeline -> build/shotmap.json. Renders one tiny still per
// scene with the logShots flag; each scene's Shots component logs its cut points.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserExecutable} from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], {stdio: 'ignore'});
const require = createRequire(import.meta.url);
const {TIMELINE, FPS} = require(path.join(root, 'build/timeline-cjs/timeline.cjs'));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, logShots: true, subtitles: false, restyled: false};
const composition = await selectComposition({serveUrl, id: 'Frame240Horror', inputProps, browserExecutable});
const byScene = {};
for (const s of TIMELINE.scenes) {
	await renderStill({
		composition, serveUrl, inputProps, browserExecutable, frame: s.startFrame, scale: 0.1,
		output: path.join(root, 'build', '.shotmap.png'), logLevel: 'error',
		onBrowserLog: (log) => {
			const t = log.text || '';
			if (t.startsWith('F240SHOTS ')) {
				const d = JSON.parse(t.slice(10));
				byScene[d.scene] = d.shots;
			}
		},
	});
}
const shots = [];
const seen = new Set();
for (const s of TIMELINE.scenes) {
	for (const [i, sh] of (byScene[s.id] || []).entries()) {
		if (sh.to <= sh.from) continue;
		const id = sh.id || `${s.id}_${String(i).padStart(2, '0')}`;
		if (seen.has(id)) throw new Error(`duplicate shot id ${id}`);
		seen.add(id);
		shots.push({id, scene: s.id, marker: String(sh.at), from: sh.from, to: sh.to, art: sh.art, overlay: sh.overlay});
	}
}
fs.mkdirSync(path.join(root, 'build'), {recursive: true});
fs.writeFileSync(path.join(root, 'build', 'shotmap.json'), JSON.stringify({fps: FPS, totalFrames: TIMELINE.totalFrames, shots}, null, 1));
const lines = {};
for (const l of TIMELINE.lines) if (!l.overlay) lines[l.line.id] = {character: l.line.character, from: Math.round(l.start * FPS), to: Math.round(l.end * FPS)};
fs.writeFileSync(path.join(root, 'build', 'timeline_lines.json'), JSON.stringify(lines));
const kinds = {};
for (const s of shots) kinds[s.art ? s.art.kind : 'code'] = (kinds[s.art ? s.art.kind : 'code'] || 0) + 1;
console.log(`${shots.length} shots -> build/shotmap.json`, kinds);
