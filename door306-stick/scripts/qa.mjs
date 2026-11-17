#!/usr/bin/env node
// Frame QA for the stick film: evaluates every Nth frame of the composition (no screenshots) with
// inputProps {qa: true}; the stage reports characters with heads cut off, bodies cut by the frame
// sides, people mostly hidden behind someone else, or too small to read. Uses the bundle in build/bundle.
//   node scripts/qa.mjs [--every=4] [--from=0] [--to=end]
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => {
	const a = process.argv.find((x) => x.startsWith(`--${n}=`));
	return a ? a.split('=')[1] : d;
};
const every = parseInt(arg('every', '4'), 10);
const serveUrl = path.join(root, 'build', 'bundle');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const inputProps = {qa: true, audio: false};
const composition = await selectComposition({serveUrl, id: arg('comp', 'Door306Horror'), inputProps, browserExecutable});
const from = parseInt(arg('from', '0'), 10);
const to = Math.min(composition.durationInFrames - 1, parseInt(arg('to', String(composition.durationInFrames - 1)), 10));
const lines = [];
await renderFrames({
	composition,
	serveUrl,
	inputProps,
	imageFormat: 'none',
	outputDir: null,
	everyNthFrame: every,
	frameRange: [from, to],
	concurrency: 4,
	browserExecutable,
	onStart: () => {},
	onFrameUpdate: () => {},
	onBrowserLog: (l) => {
		if ((l.text || '').startsWith('GQA ')) lines.push(l.text.slice(4));
	},
});
fs.mkdirSync(path.join(root, 'logs'), {recursive: true});
fs.writeFileSync(path.join(root, 'logs', 'qa.txt'), lines.join('\n') + '\n');
// summary: group by scene + issue, with frame ranges
const groups = new Map();
for (const l of lines) {
	const m = l.match(/^(\S+) f=(\d+) (.*)$/);
	if (!m) continue;
	const key = `${m[1]} | ${m[3]}`;
	if (!groups.has(key)) groups.set(key, []);
	groups.get(key).push(parseInt(m[2], 10));
}
console.log(`QA: ${lines.length} findings in frames ${from}-${to} (every ${every})`);
for (const [k, fr] of groups) console.log(`${k}  [scene frames ${fr[0]}..${fr[fr.length - 1]}, ${fr.length}x]`);
