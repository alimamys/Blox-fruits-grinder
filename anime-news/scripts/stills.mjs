#!/usr/bin/env node
// Render review stills: node scripts/stills.mjs <Composition> <outDir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const pi = args.indexOf('--props');
const inputProps = pi >= 0 ? JSON.parse(args.splice(pi, 2)[1]) : {};
const [id = 'OpeningPreview', outDir = 'out/stills', ...frames] = args;
const shell = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = existsSync(shell) ? shell : null;
mkdirSync(join(ROOT, outDir), {recursive: true});
const serveUrl = await bundle({entryPoint: join(ROOT, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable, inputProps});
for (const f of frames.map(Number)) {
	const tag = inputProps.assetId ? `_${inputProps.assetId}_${inputProps.z}` : '';
	const output = join(ROOT, outDir, `${id}${tag}_f${String(f).padStart(4, '0')}.png`);
	await renderStill({serveUrl, composition, frame: f, output, browserExecutable, imageFormat: 'png', inputProps});
	console.log(output);
}
