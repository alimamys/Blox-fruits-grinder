#!/usr/bin/env node
// npm run check - timing + asset report computed with the SAME timeline code the
// video uses. Flags missing audio, unused lines, overlapping dialogue, missing SFX
// files and prints every scene's real start time and duration.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build', 'timeline-cjs');
fs.mkdirSync(path.join(out, 'generated'), {recursive: true});
for (const f of ['types', 'voiceConfig', 'voiceLines', 'edit', 'timeline']) {
	const src = fs.readFileSync(path.join(root, 'src', 'data', `${f}.ts`), 'utf8');
	let {outputText} = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true}});
	outputText = outputText.replace(/require\("\.\/(\w+)"\)/g, 'require("./$1.cjs")');
	fs.writeFileSync(path.join(out, `${f}.cjs`), outputText);
}
fs.copyFileSync(path.join(root, 'src/data/generated/audioManifest.json'), path.join(out, 'generated/audioManifest.json'));

const require = createRequire(import.meta.url);
const {TIMELINE, SCENES, FPS} = require(path.join(out, 'timeline.cjs'));
const {VOICE_LINES} = require(path.join(out, 'voiceLines.cjs'));

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log('\nTHE 63RD PASSENGER - timeline report\n');
console.log('  #  scene              start    length  lines  missing');
let warnings = 0;
for (const s of TIMELINE.scenes) {
	const missing = s.lines.filter((l) => !l.exists).length;
	console.log(`${String(s.index).padStart(3)}  ${s.id.padEnd(18)} ${fmt(s.start).padStart(7)}  ${s.duration.toFixed(1).padStart(6)}s  ${String(s.lines.length).padStart(5)}  ${missing ? missing : ''}`);
}
console.log(`\nTOTAL ${fmt(TIMELINE.totalSeconds)}  (${TIMELINE.totalFrames} frames @ ${FPS} fps)`);

const used = new Set(TIMELINE.lines.map((l) => l.line.id));
const unused = VOICE_LINES.filter((l) => !used.has(l.id));
if (unused.length) {
	warnings++;
	console.log(`\n! ${unused.length} voice line(s) not placed in the timeline: ${unused.map((l) => l.id).join(', ')}`);
}
const missing = TIMELINE.lines.filter((l) => !l.exists);
if (missing.length) {
	warnings++;
	console.log(`\n! ${missing.length} line(s) have no audio yet (timed from estimates): ${missing.slice(0, 10).map((l) => l.line.id).join(', ')}${missing.length > 10 ? ' ...' : ''}`);
}
const main = TIMELINE.lines.filter((l) => !l.overlay).sort((a, b) => a.start - b.start);
for (let i = 1; i < main.length; i++) {
	const ov = main[i - 1].end - main[i].start;
	if (ov > 0.12) {
		warnings++;
		console.log(`! overlap ${ov.toFixed(2)}s: ${main[i - 1].line.id} -> ${main[i].line.id}`);
	}
}
const sfxDir = path.join(root, 'public/audio/sfx');
const sounds = new Set(TIMELINE.sfx.map((s) => s.sound));
for (const s of ['ocean_ambience', 'ferry_engine', 'wind', 'low_horror_drone', 'crowd_murmur', 'bridge_electronics', 'emergency_hum', 'room_tone', 'daylight_ambience']) sounds.add(s);
const missingSfx = [...sounds].filter((s) => !fs.existsSync(path.join(sfxDir, `${s}.wav`)));
if (missingSfx.length) {
	warnings++;
	console.log(`\n! missing SFX files (they will simply be silent): ${missingSfx.join(', ')}`);
}
const nar = TIMELINE.lines.filter((l) => !l.overlay && l.line.character === 'narrator');
const words = nar.reduce((a, l) => a + (l.line.spokenText ?? l.line.text).split(/\s+/).length, 0);
const secs = nar.reduce((a, l) => a + (l.end - l.start), 0);
console.log(`\nNarrator: ${nar.length} lines, ${words} words, ${(secs / 60).toFixed(1)} min of voice -> ${((words / secs) * 60).toFixed(0)} wpm while speaking.`);
const last = TIMELINE.scenes[TIMELINE.scenes.length - 1];
console.log(`Final scene "${last.id}" (${last.duration.toFixed(1)}s) ends the video on black.`);
console.log(`Scenes defined: ${SCENES.length}. Warnings: ${warnings}.\n`);
fs.writeFileSync(
	path.join(root, 'src/data/generated/timeline.report.json'),
	JSON.stringify(
		{
			total: TIMELINE.totalSeconds,
			scenes: TIMELINE.scenes.map((s) => ({id: s.id, name: s.name, start: +s.start.toFixed(3), duration: +s.duration.toFixed(3), narrationText: s.narrationText, dialogueIds: s.dialogueIds})),
		},
		null,
		1,
	),
);
