#!/usr/bin/env node
// Mouth-tracking frames for talking shots: renders each talking shot's middle frame with
// every mouth drawn as a flat marker in a per-character key colour
// -> build/keyframes/<shot>_mouth.png (read by `restyle.py mouths`).
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'build', 'restyle_plan.json'), 'utf8'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, subtitles: false, grain: false, restyled: false, mouthKey: true};
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'Frame240Horror', inputProps, browserExecutable, puppeteerInstance});
const jobs = plan.filter((p) => p.mode === 'single' && (p.talk || []).length);
for (const p of jobs) {
	const frame = Math.min(p.to - 1, p.from + Math.round((p.to - p.from) * 0.5));
	await renderStill({composition, serveUrl, inputProps, frame, output: path.join(root, 'build', 'keyframes', `${p.id}_mouth.png`), puppeteerInstance, logLevel: 'error'});
}
await puppeteerInstance.close({silent: true});
console.log(`${jobs.length} mouth-key frames`);
