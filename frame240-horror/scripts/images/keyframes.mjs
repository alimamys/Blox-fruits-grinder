#!/usr/bin/env node
// Render clean source frames (no subtitles, no grain) for every shot in
// build/shotmap.json at 20/50/80% through the shot -> build/keyframes/<shot>_k{0,1,2}.png
// and measure how much each shot changes internally (build/keyframes/motion.json).
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'build', 'shotmap.json'), 'utf8'));
const outDir = path.join(root, 'build', 'keyframes');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, subtitles: false, grain: false, restyled: false};
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'Frame240Horror', inputProps, browserExecutable, puppeteerInstance});
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
const jobs = [];
for (const sh of map.shots) {
	if (only && !only.has(sh.id)) continue;
	const len = sh.to - sh.from;
	[0.2, 0.5, 0.8].forEach((fr, k) => jobs.push({sh, k, frame: Math.min(sh.to - 1, sh.from + Math.round(len * fr))}));
}
let done = 0;
const worker = async () => {
	while (jobs.length) {
		const j = jobs.shift();
		const out = path.join(outDir, `${j.sh.id}_k${j.k}.png`);
		if (!fs.existsSync(out)) {
			await renderStill({composition, serveUrl, inputProps, frame: j.frame, output: out, puppeteerInstance, logLevel: 'error'});
		}
		if (++done % 50 === 0) console.log(`${done} frames`);
	}
};
await Promise.all([worker(), worker(), worker()]);
await puppeteerInstance.close({silent: true});
console.log('keyframes done');
