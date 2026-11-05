#!/usr/bin/env node
// npm run render            -> out/passenger63.mp4   (render + loudness master)
// npm run render -- --tight -> out/passenger63_tight.mp4
// npm run audio-preview     -> out/passenger63_audio_preview.wav (audio only, mastered)
//
// 1) Remotion renders the composition (all voices/SFX/beds are mixed by Remotion).
// 2) ffmpeg two-pass loudnorm masters the soundtrack to -15 LUFS integrated,
//    -1.5 dBTP, video stream copied untouched.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tight = args.includes('--tight');
const audioOnly = args.includes('--audio-only');
const comp = tight ? 'Passenger63HorrorTight' : 'Passenger63Horror';
const base = tight ? 'passenger63_tight' : 'passenger63';
const extra = args.filter((a) => !['--tight', '--audio-only'].includes(a));
fs.mkdirSync(path.join(root, 'out'), {recursive: true});

const run = (cmd, a, opts = {}) => {
	console.log(`\n$ ${cmd} ${a.join(' ')}`);
	const r = spawnSync(cmd, a, {stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', cwd: root, encoding: 'utf8'});
	if (r.status !== 0 && !opts.allowFail) {
		if (opts.capture) console.error(r.stderr);
		process.exit(r.status ?? 1);
	}
	return r;
};

// Optional local browser (e.g. offline machines): REMOTION_BROWSER_EXECUTABLE=/path/to/chrome
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
const browserArgs = browser ? [`--browser-executable=${browser}`] : [];
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const raw = path.join('out', audioOnly ? `${base}_audio_raw.wav` : `${base}_raw.mp4`);
const final = path.join('out', audioOnly ? `${base}_audio_preview.wav` : `${base}.mp4`);
const codecArgs = audioOnly
	? ['--codec=wav', '--audio-codec=pcm-16']
	: ['--codec=h264', '--crf=20', '--pixel-format=yuv420p', '--audio-codec=aac', '--audio-bitrate=320k'];
// flags passed by the user (e.g. --crf=23) override the defaults above
const userFlags = new Set(extra.map((a) => a.split('=')[0]));
const defaults = codecArgs.filter((a) => !userFlags.has(a.split('=')[0]));
run(npx, ['remotion', 'render', 'src/index.ts', comp, raw, ...defaults, ...browserArgs, ...extra]);

// ffmpeg: system one, or the copy bundled with Remotion
const hasSystemFfmpeg = spawnSync('ffmpeg', ['-version'], {stdio: 'ignore'}).status === 0;
const ff = (a, opts) => (hasSystemFfmpeg ? run('ffmpeg', a, opts) : run(npx, ['remotion', 'ffmpeg', ...a], opts));

const measure = ff(['-hide_banner', '-i', raw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {capture: true});
const json = (measure.stderr || '').slice((measure.stderr || '').lastIndexOf('{'));
let m;
try {
	m = JSON.parse(json);
} catch {
	console.warn('Could not measure loudness; copying the raw render.');
	fs.copyFileSync(path.join(root, raw), path.join(root, final));
	process.exit(0);
}
console.log(`measured: ${m.input_i} LUFS, TP ${m.input_tp} dBTP, LRA ${m.input_lra}`);
const filter = `loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
if (audioOnly) {
	ff(['-hide_banner', '-y', '-i', raw, '-af', filter, '-c:a', 'pcm_s16le', final]);
} else {
	ff(['-hide_banner', '-y', '-i', raw, '-c:v', 'copy', '-af', filter, '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', final]);
}
fs.rmSync(path.join(root, raw), {force: true});
console.log(`\nDone -> ${final}`);
