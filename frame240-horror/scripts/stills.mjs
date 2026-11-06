#!/usr/bin/env node
// Render review stills at given marker names or frames (bundles once).
//   node scripts/stills.mjs narrator_014_turned:0.5 hook_title 1234 ...
// marker[:fraction] -> that fraction through the voice line / beat.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const compId = process.env.COMP || 'Frame240Horror';
const scale = Number(process.env.SCALE || 0.5);
execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], {stdio: 'ignore'});
const require = createRequire(import.meta.url);
const {TIMELINE, FPS} = require(path.join(root, 'build/timeline-cjs/timeline.cjs'));
const resolve = (a) => {
	if (/^\d+$/.test(a)) return Number(a);
	const [m, fr = '0.5'] = a.split(':');
	const s = TIMELINE.markers[m];
	if (!s) throw new Error(`unknown marker ${m}`);
	return Math.round((s.start + (s.end - s.start) * Number(fr)) * FPS);
};
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || (fs.existsSync('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell') ? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' : undefined);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, ...(process.env.PROPS ? JSON.parse(process.env.PROPS) : {})};
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable});
fs.mkdirSync(path.join(root, 'out/stills'), {recursive: true});
for (const a of args) {
	const frame = resolve(a);
	const out = path.join(root, 'out/stills', `${a.replace(/[^a-z0-9_.-]/gi, '_')}.png`);
	await renderStill({composition, serveUrl, frame, output: out, inputProps, scale, browserExecutable, logLevel: 'error'});
	console.log(`${a} -> frame ${frame} -> ${path.relative(root, out)}`);
}
