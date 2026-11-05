#!/usr/bin/env node
// npm run render                 -> out/passenger63.mp4   (render + loudness master)
// npm run render -- --full       -> out/passenger63_full.mp4 (complete story, ~16 min)
// npm run audio-preview          -> out/passenger63_audio_preview.wav (audio only, mastered)
// npm run render -- --segments=1 -> one single Remotion pass (needs ~15 GB of temp space)
//
// 1) The project is bundled once, then Remotion renders the film in N consecutive
//    segments (default 6): H.264 video + uncompressed PCM audio in .mkv parts.
//    Remotion mixes all ~660 voice/SFX/bed files itself, and its mixdown writes one
//    full-length temp WAV per 10 files - for the whole film at once that is >12 GB of
//    temp files. Per segment it is a small fraction, and a failed or interrupted run
//    resumes from the last finished segment.
// 2) ffmpeg joins the parts (video stream copied, PCM audio sample-exact, so no
//    seams) and masters the soundtrack in the same pass: two-pass loudnorm to
//    -15 LUFS integrated, -1.5 dBTP, AAC 256k. Parts are deleted afterwards.
//
// Any other flag is passed to `remotion render` (e.g. --concurrency=4, --crf=23).
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const full = args.includes('--full');
const audioOnly = args.includes('--audio-only');
const segArg = args.find((a) => a.startsWith('--segments='));
const segments = Math.max(1, parseInt(segArg ? segArg.split('=')[1] : '6', 10) || 6);
const comp = full ? 'Passenger63HorrorFull' : 'Passenger63Horror';
const base = full ? 'passenger63_full' : 'passenger63';
const extra = args.filter((a) => !['--full', '--audio-only'].includes(a) && !a.startsWith('--segments='));
const outDir = path.join(root, 'out');
const partsDir = path.join(outDir, `.parts-${base}${audioOnly ? '-audio' : ''}`);
const bundleDir = path.join(root, 'build', 'bundle');
fs.mkdirSync(partsDir, {recursive: true});

const run = (cmd, a, opts = {}) => {
	console.log(`\n$ ${cmd} ${a.join(' ')}`);
	const r = spawnSync(cmd, a, {stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
	if (r.status !== 0 && !opts.allowFail) {
		if (opts.capture) console.error(r.stderr || r.stdout);
		process.exit(r.status ?? 1);
	}
	return r;
};

// Optional local browser (e.g. offline machines): REMOTION_BROWSER_EXECUTABLE=/path/to/chrome
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
const browserArgs = browser ? [`--browser-executable=${browser}`] : [];
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// --- fingerprint of everything that affects the picture/sound, so a resumed run never
// reuses parts rendered from an older version of the project
const hash = crypto.createHash('sha1');
const walk = (dir) => {
	for (const e of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p);
		else hash.update(p + fs.readFileSync(p));
	}
};
walk(path.join(root, 'src'));
for (const f of ['public/audio/.voice-cache.json', 'remotion.config.ts']) {
	const p = path.join(root, f);
	if (fs.existsSync(p)) hash.update(fs.readFileSync(p));
}
const listPublic = (dir) => {
	for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) listPublic(p);
		else hash.update(`${p}:${fs.statSync(p).size}:${fs.statSync(p).mtimeMs}`);
	}
};
listPublic(path.join(root, 'public'));
hash.update(JSON.stringify({comp, audioOnly, segments, extra}));
const fingerprint = hash.digest('hex').slice(0, 16);
const stampFile = path.join(partsDir, 'fingerprint');
if (!fs.existsSync(stampFile) || fs.readFileSync(stampFile, 'utf8') !== fingerprint) {
	fs.rmSync(partsDir, {recursive: true, force: true});
	fs.mkdirSync(partsDir, {recursive: true});
	fs.writeFileSync(stampFile, fingerprint);
}

// --- bundle once, read the composition length
run(npx, ['remotion', 'bundle', 'src/index.ts', `--out-dir=${path.relative(root, bundleDir)}`, '--log=warn']);
const listing = run(npx, ['remotion', 'compositions', path.relative(root, bundleDir), ...browserArgs], {capture: true});
const row = (listing.stdout + listing.stderr).split('\n').find((l) => l.trim().startsWith(comp + ' '));
const totalFrames = row ? parseInt(row.trim().split(/\s+/)[3], 10) : NaN;
if (!Number.isFinite(totalFrames)) {
	console.error(`Could not read the length of ${comp} from:\n${listing.stdout}`);
	process.exit(1);
}

// --- render the segments (frame ranges are inclusive)
const ext = audioOnly ? 'wav' : 'mkv';
const codecArgs = audioOnly
	? ['--codec=wav', '--audio-codec=pcm-16', '--enforce-audio-track']
	: ['--codec=h264-mkv', '--crf=20', '--pixel-format=yuv420p', '--audio-codec=pcm-16', '--enforce-audio-track'];
// --enforce-audio-track: a silent segment (the disclaimer) must still carry an audio
// track, or the join would drop the soundtrack of every following segment
const userFlags = new Set(extra.map((a) => a.split('=')[0]));
const defaults = codecArgs.filter((a) => !userFlags.has(a.split('=')[0]));
const per = Math.ceil(totalFrames / segments);
const parts = [];
for (let i = 0; i < segments; i++) {
	const a = i * per;
	const b = Math.min(totalFrames, (i + 1) * per) - 1;
	if (a > b) break;
	const part = path.join(partsDir, `part_${String(i).padStart(3, '0')}.${ext}`);
	parts.push(part);
	if (fs.existsSync(part + '.done')) {
		console.log(`\nsegment ${i + 1}/${segments} (frames ${a}-${b}) already rendered - skipping`);
		continue;
	}
	console.log(`\n=== segment ${i + 1}/${segments}: frames ${a}-${b} of ${totalFrames} ===`);
	run(npx, ['remotion', 'render', path.relative(root, bundleDir), comp, path.relative(root, part), `--frames=${a}-${b}`, ...defaults, ...browserArgs, ...extra]);
	fs.writeFileSync(part + '.done', `${a}-${b}`);
}

// --- join + master in one ffmpeg pass
const list = path.join(partsDir, 'concat.txt');
fs.writeFileSync(list, parts.map((p) => `file '${path.basename(p)}'`).join('\n') + '\n');
const hasSystemFfmpeg = spawnSync('ffmpeg', ['-version'], {stdio: 'ignore'}).status === 0;
const ff = (a, opts) => (hasSystemFfmpeg ? run('ffmpeg', a, opts) : run(npx, ['remotion', 'ffmpeg', ...a], opts));
const input = ['-f', 'concat', '-safe', '0', '-i', path.relative(root, list)];
const final = path.join('out', audioOnly ? `${base}_audio_preview.wav` : `${base}.mp4`);

const measure = ff(['-hide_banner', ...input, '-vn', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {capture: true});
const json = (measure.stderr || '').slice((measure.stderr || '').lastIndexOf('{'));
let filter = 'aresample=48000';
try {
	const m = JSON.parse(json);
	console.log(`measured: ${m.input_i} LUFS, TP ${m.input_tp} dBTP, LRA ${m.input_lra}`);
	filter = `loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
} catch {
	console.warn('Could not measure loudness; joining without mastering.');
}
if (audioOnly) {
	ff(['-hide_banner', '-y', ...input, '-af', filter, '-c:a', 'pcm_s16le', final]);
} else {
	ff(['-hide_banner', '-y', ...input, '-c:v', 'copy', '-af', filter, '-c:a', 'aac', '-b:a', '256k', '-video_track_timescale', '30000', '-movflags', '+faststart', final]);
}
fs.rmSync(partsDir, {recursive: true, force: true});
console.log(`\nDone -> ${final}`);
