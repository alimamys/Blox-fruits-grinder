#!/usr/bin/env node
// Background plates for the animated shots.
// 1) finds which shots use which <PlateBg id> (tiny renders with the logPlates flag)
//    -> build/plate_shots.json  {shotId: [plateIds]}
// 2) renders each plate's source frame (fixed wide camera, characters hidden)
//    -> build/plates/<id>.png, redrawn by `restyle.py plates`.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'build', 'shotmap.json'), 'utf8'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const base = {audio: false, subtitles: false, grain: false, restyled: false};
const comp = async (props) => selectComposition({serveUrl, id: 'Passenger63Horror', inputProps: props, browserExecutable, puppeteerInstance});
const scan = await comp({...base, logPlates: true});
const shotPlates = {};
const firstFrame = {};
for (const sh of map.shots) {
	const frame = Math.min(sh.to - 1, sh.from + Math.round((sh.to - sh.from) * 0.5));
	const ids = new Set();
	await renderStill({
		composition: scan, serveUrl, inputProps: {...base, logPlates: true}, frame, scale: 0.1, puppeteerInstance, logLevel: 'error',
		output: path.join(root, 'build', '.plate-scan.png'),
		onBrowserLog: (log) => {
			if ((log.text || '').startsWith('P63PLATE ')) ids.add(log.text.slice(9));
		},
	});
	if (ids.size) {
		shotPlates[sh.id] = [...ids];
		for (const id of ids) if (firstFrame[id] === undefined) firstFrame[id] = sh.from;
	}
}
fs.writeFileSync(path.join(root, 'build', 'plate_shots.json'), JSON.stringify(shotPlates, null, 1));
fs.mkdirSync(path.join(root, 'build', 'plates'), {recursive: true});
for (const [id, frame] of Object.entries(firstFrame)) {
	const props = {...base, plate: id};
	await renderStill({composition: await comp(props), serveUrl, inputProps: props, frame, puppeteerInstance, logLevel: 'error', output: path.join(root, 'build', 'plates', `${id}.png`)});
}
await puppeteerInstance.close({silent: true});
console.log(`${Object.keys(shotPlates).length} animated shots, ${Object.keys(firstFrame).length} plates -> build/plates/`);
