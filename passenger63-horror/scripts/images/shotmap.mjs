#!/usr/bin/env node
// Exact shot list of the main composition (every cut, frame ranges) for the image
// restyle pipeline -> build/shotmap.json. Renders one tiny still per scene with the
// logShots flag; each scene's Shots component logs its cut points.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], {stdio: 'ignore'});
const require = createRequire(import.meta.url);
const {TIMELINE} = require(path.join(root, 'build/timeline-cjs/timeline.cjs'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, logShots: true, subtitles: false, restyled: false};
const composition = await selectComposition({serveUrl, id: 'Passenger63Horror', inputProps, browserExecutable});
const byScene = {};
for (const s of TIMELINE.scenes) {
	await renderStill({
		composition, serveUrl, inputProps, browserExecutable, frame: s.startFrame, scale: 0.1,
		output: path.join(root, 'build', '.shotmap.png'), logLevel: 'error',
		onBrowserLog: (log) => {
			const t = log.text || '';
			if (t.startsWith('P63SHOTS ')) {
				const d = JSON.parse(t.slice(9));
				byScene[d.scene] = d.shots;
			}
		},
	});
}
const shots = [];
for (const s of TIMELINE.scenes) {
	for (const [i, sh] of (byScene[s.id] || []).entries()) {
		if (sh.to > sh.from) shots.push({id: `${s.id}_${String(i).padStart(2, '0')}`, scene: s.id, marker: String(sh.at), from: sh.from, to: sh.to});
	}
}
fs.writeFileSync(path.join(root, 'build', 'shotmap.json'), JSON.stringify({totalFrames: TIMELINE.totalFrames, shots}, null, 1));
const lines = {};
for (const l of TIMELINE.lines) if (!l.overlay) lines[l.line.id] = {character: l.line.character, from: Math.round(l.start * 30), to: Math.round(l.end * 30)};
fs.writeFileSync(path.join(root, 'build', 'timeline_lines.json'), JSON.stringify(lines));
console.log(`${shots.length} shots -> build/shotmap.json`);
