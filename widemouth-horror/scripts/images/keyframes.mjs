#!/usr/bin/env node
// Clean LAYOUT keyframes (fixed camera, no overlays, subtitles or grain, mouths closed) for
// every shot that gets generated art -> build/keyframes/<shot>_k{n}.png
//   still / talk: k1 at the middle of the shot
//   action:       one key in the middle of each keyframe segment (art.cuts or equal parts)
//   node scripts/images/keyframes.mjs [id1,id2,...]
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {browserExecutable} from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'build', 'shotmap.json'), 'utf8'));
const outDir = path.join(root, 'build', 'keyframes');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false, subtitles: false, grain: false, restyled: false, layoutKey: true};
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'WidemouthHorror', inputProps, browserExecutable, puppeteerInstance});
const ids = process.argv.slice(2).find((a) => !a.startsWith('--'));
const only = ids ? new Set(ids.split(',')) : null;
const force = process.argv.includes('--force');
const jobs = [];
for (const sh of map.shots) {
	const art = sh.art;
	if (!art || art.kind === 'reuse') continue;
	if (only && !only.has(sh.id)) continue;
	const len = sh.to - sh.from;
	if (art.kind === 'action') {
		const n = art.keys ?? 3;
		const cuts = art.cuts && art.cuts.length === n ? art.cuts : Array.from({length: n}, (_, i) => i / n);
		cuts.forEach((c, k) => {
			const end = k + 1 < n ? cuts[k + 1] : 1;
			jobs.push({sh, k, frame: Math.min(sh.to - 1, sh.from + Math.round(len * (c + end) / 2))});
		});
	} else {
		jobs.push({sh, k: 1, frame: Math.min(sh.to - 1, sh.from + Math.round(len * 0.5))});
	}
}
let done = 0;
const worker = async () => {
	while (jobs.length) {
		const j = jobs.shift();
		const out = path.join(outDir, `${j.sh.id}_k${j.k}.png`);
		if (force || !fs.existsSync(out)) {
			await renderStill({composition, serveUrl, inputProps, frame: j.frame, output: out, puppeteerInstance, logLevel: 'error'});
		}
		if (++done % 25 === 0) console.log(`${done} keyframes`);
	}
};
await Promise.all([worker(), worker(), worker()]);
await puppeteerInstance.close({silent: true});
console.log(`keyframes done (${done})`);
