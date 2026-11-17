#!/usr/bin/env node
// Reference layouts for the image model -> build/refs/<kind>_<id>.png + build/refs.json
//   pic_<id>  canvas pictures shown on screens (src/layout/pictures.tsx)
//   loc_<id>  composition guides for the location references (lookdev)
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {browserExecutable} from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'build', 'refs');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
let meta = null;
const inputProps = {logRefs: true};
const composition = await selectComposition({serveUrl, id: 'RefLayouts', inputProps, browserExecutable, puppeteerInstance});
for (let i = 0; i < composition.durationInFrames; i++) {
	await renderStill({
		composition, serveUrl, inputProps, frame: i, puppeteerInstance, logLevel: 'error',
		output: path.join(out, `.tmp.png`),
		onBrowserLog: (log) => {
			const t = log.text || '';
			if (t.startsWith('F240REFS ')) meta = JSON.parse(t.slice(9));
		},
	});
	const id = meta ? meta.ids[i] : String(i);
	fs.renameSync(path.join(out, '.tmp.png'), path.join(out, `${id.replace(':', '_')}.png`));
}
await puppeteerInstance.close({silent: true});
fs.writeFileSync(path.join(root, 'build', 'refs.json'), JSON.stringify(meta, null, 1));
console.log(`${composition.durationInFrames} reference layouts -> build/refs`);
