#!/usr/bin/env node
// Review tool: render every Nth frame of a composition (small) and tile them into
// contact sheets with timecodes.   node scripts/contact.mjs [every=120] [scale=0.25] [from] [to]
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [every = '120', scale = '0.25', from = '0', to = ''] = process.argv.slice(2);
const compId = process.env.COMP || 'WidemouthHorror';
const out = path.join(root, 'out', 'contact');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(path.join(out, 'frames'), {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: false};
const composition = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable});
const last = to ? Number(to) : composition.durationInFrames - 1;
await renderFrames({
	composition,
	serveUrl,
	inputProps,
	outputDir: path.join(out, 'frames'),
	imageFormat: 'jpeg',
	jpegQuality: 70,
	scale: Number(scale),
	everyNthFrame: Number(every),
	frameRange: [Number(from), last],
	browserExecutable,
	concurrency: 3,
	onStart: () => {},
	onFrameUpdate: () => {},
	logLevel: 'error',
});
const files = fs.readdirSync(path.join(out, 'frames')).filter((f) => f.endsWith('.jpeg')).sort();
// label each frame with its time, then tile 4x4
for (const f of files) {
	const n = Number(f.match(/(\d+)\.jpeg$/)[1]);
	const fr = Number(from) + n * Number(every) - (Number(from) % Number(every) ? 0 : 0);
	const fps = composition.fps;
	const t = `${Math.floor(fr / (fps * 60))}:${String(Math.floor((fr / fps) % 60)).padStart(2, '0')}`;
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(out, 'frames', f), '-vf', `drawtext=text='${t}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6`, path.join(out, 'frames', f.replace('.jpeg', '.png'))]);
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-pattern_type', 'glob', '-i', path.join(out, 'frames', '*.png'), '-vf', 'tile=4x4:padding=4', path.join(out, 'sheet_%02d.png')]);
console.log(`${files.length} frames -> ${fs.readdirSync(out).filter((f) => f.startsWith('sheet')).length} sheets in out/contact`);
