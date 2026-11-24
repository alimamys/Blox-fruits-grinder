#!/usr/bin/env node
// Render the YouTube thumbnails (compositions ThumbA/B/C in src/dev/Thumbs.tsx) to youtube/*.jpg.
//   node scripts/thumbs.mjs
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(root, 'build/thumb-bundle'), publicDir: path.join(root, 'public')});
const names = {A: 'thumbnail_A_its_on_my_bed', B: 'thumbnail_B_dont_wake_up', C: 'thumbnail_C_i_took_his_place'};
fs.mkdirSync(path.join(root, 'youtube'), {recursive: true});
for (const [v, name] of Object.entries(names)) {
	const composition = await selectComposition({serveUrl, id: `Thumb${v}`, browserExecutable});
	const output = path.join(root, 'youtube', `${name}.jpg`);
	await renderStill({composition, serveUrl, frame: 0, output, imageFormat: 'jpeg', jpegQuality: 92, browserExecutable, logLevel: 'error'});
	console.log(path.relative(root, output), fs.statSync(output).size);
}
