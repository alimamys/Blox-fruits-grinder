#!/usr/bin/env node
// YouTube package: title + alternatives, description (spoiler-free hook, chapters from the
// real timeline, fiction disclaimer, 3 hashtags, full sound credits incl. every CC-BY
// attribution) and tags -> youtube/TITLE_AND_TAGS.txt, youtube/DESCRIPTION.txt
//   node scripts/check.mjs && node scripts/youtube_package.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'src/data/generated/timeline.report.json'), 'utf8'));
const creditsFile = path.join(root, 'public/audio/sfx/CREDITS.md');
const out = path.join(root, 'youtube');
fs.mkdirSync(out, {recursive: true});

// spoiler-free chapter titles (the scene names in the timeline give away twists)
const CHAPTER = {
	coldOpen: 'The extra frame',
	normalNight: 'A normal night',
	stranger: 'The stranger',
	closer: 'One step closer',
	warning: 'The warning',
	hallway: 'The hallway',
	erase: 'The white brush',
	whiteOnWhite: 'White on white',
	insideWall: 'Inside the walls',
	recording: 'The recording',
	lastSelection: 'The last selection',
};
// same rounding as `npm run check` (scripts/check.mjs), so the chapters match its printout
const ts = (s) => {
	const r = Math.round(s * 10) / 10;
	return `${Math.floor(r / 60)}:${String(Math.floor(r % 60)).padStart(2, '0')}`;
};
const chapters = report.scenes.filter((s) => CHAPTER[s.id]).map((s) => `${ts(s.start)} ${CHAPTER[s.id]}`);

const credits = fs.existsSync(creditsFile) ? fs.readFileSync(creditsFile, 'utf8') : '';
// keep the attribution lines of the credits file (CC-BY sources must be credited)
const ccby = credits
	.split('\n')
	.filter((l) => /CC[- ]BY/i.test(l) && !/CC0/i.test(l) && l.trim().startsWith('-'))
	.map((l) => l.replace(/^\s*-\s*/, '• ').replace(/\*\*/g, '').replace(/`/g, ''));

const title = 'Frame 240 | Animated Horror Story';
const alternatives = ["Frame 240 - There's a Frame in My Animation I Didn't Draw", 'Every Time I Pressed Play, He Was Closer | Animated Horror'];
const tags = [
	'animated horror story',
	'horror animation',
	'scary story',
	'creepypasta',
	'animator horror',
	'analog horror',
	'2d animation',
	'horror short film',
	'scary animation',
	'frame 240',
	'paranormal story',
	'horror narration',
	'mystery',
	'thriller',
	'animated short',
];

const description = [
	'There were 239 frames in my animation when I went to bed. When I opened it again, there were 240.',
	'In the extra frame, a man was standing in my hallway. I hadn\'t drawn him. And every time I pressed play, he was closer.',
	'',
	'A 10-minute animated horror story. Headphones recommended - and maybe leave a light on.',
	'',
	'CHAPTERS',
	...chapters,
	'',
	'This story is fiction. All characters and events are invented; any resemblance to real people or events is coincidental.',
	'',
	'#horrorstory #animation #scary',
	'',
	'CREDITS',
	'Story, animation and sound design: Frame 240 production.',
	'Voices: Fish Audio (text-to-speech).',
	'Illustrations: generated with an image model from the film\'s own layouts and character designs.',
	'Fonts: Inter, IBM Plex Mono (SIL Open Font License).',
	'Sound effects: built from CC0 and CC-BY field recordings (FSD50K / Freesound, VSCO-2 CE, Kenney.nl).',
	...(ccby.length
		? ['Sound effects used under Creative Commons Attribution (CC BY):', ...ccby]
		: ['(CC-BY attributions: run the SFX build first - public/audio/sfx/CREDITS.md)']),
	'',
].join('\n');

fs.writeFileSync(path.join(out, 'DESCRIPTION.txt'), description);
fs.writeFileSync(
	path.join(out, 'TITLE_AND_TAGS.txt'),
	[`TITLE\n${title}`, `\nALTERNATIVE TITLES\n${alternatives.map((a) => `- ${a}`).join('\n')}`, `\nTAGS (comma separated, ${tags.join(', ').length} chars)\n${tags.join(', ')}`, ''].join('\n'),
);
console.log(`youtube/DESCRIPTION.txt (${chapters.length} chapters, ${ccby.length} CC-BY credits), youtube/TITLE_AND_TAGS.txt`);
