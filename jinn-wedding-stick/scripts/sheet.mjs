#!/usr/bin/env node
// Review sheet: one small frame every N frames of each scene (from build/bundle), tiled by scripts/tile.py.
//   node scripts/sheet.mjs <sceneId,...> [--every=36]
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => {
	const a = process.argv.find((x) => x.startsWith(`--${n}=`));
	return a ? a.split('=')[1] : d;
};
const every = parseInt(arg('every', '36'), 10);
const ids = (process.argv[2] || '').split(',').filter(Boolean);
const rep = JSON.parse(fs.readFileSync(path.join(root, 'src/data/generated/timeline.report.json'), 'utf8'));
const serveUrl = path.join(root, 'build', 'bundle');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const inputProps = {audio: false};
const composition = await selectComposition({serveUrl, id: 'JinnWedding', inputProps, browserExecutable});
for (const id of ids) {
	const sc = rep.scenes.find((s) => s.id === id);
	const a = Math.round(sc.start * 24) + 6;
	const b = Math.round((sc.start + sc.duration) * 24) - 2;
	const out = path.join(root, 'build', 'sheets', id);
	fs.rmSync(out, {recursive: true, force: true});
	fs.mkdirSync(out, {recursive: true});
	await renderFrames({composition, serveUrl, inputProps, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.25, outputDir: out, everyNthFrame: every, frameRange: [a, b], concurrency: 4, browserExecutable, onStart: () => {}, onFrameUpdate: () => {}});
	console.log('frames', id, fs.readdirSync(out).length);
}
