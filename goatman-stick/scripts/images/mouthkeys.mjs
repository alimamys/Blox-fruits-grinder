#!/usr/bin/env node
// Mouth positions for talking frames: renders each talking shot's layout with Mara's mouth
// drawn as a flat magenta marker -> build/keyframes/<shot>_mouth.png. `restyle.py mouths`
// uses it as the search window when it merges the generated mouth-open variant into the
// base frame (only the mouth region changes, so nothing else flickers while she talks).
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {browserExecutable} from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'build', 'shotmap.json'), 'utf8'));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, subtitles: false, grain: false, restyled: false, layoutKey: true, mouthKey: true};
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'GoatmanHorror', inputProps, browserExecutable, puppeteerInstance});
const jobs = map.shots.filter((s) => s.art && s.art.kind === 'talk');
fs.mkdirSync(path.join(root, 'build', 'keyframes'), {recursive: true});
for (const p of jobs) {
	const frame = Math.min(p.to - 1, p.from + Math.round((p.to - p.from) * 0.5));
	await renderStill({composition, serveUrl, inputProps, frame, output: path.join(root, 'build', 'keyframes', `${p.id}_mouth.png`), puppeteerInstance, logLevel: 'error'});
}
await puppeteerInstance.close({silent: true});
console.log(`${jobs.length} mouth-key frames`);
