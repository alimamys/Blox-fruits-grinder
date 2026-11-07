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
	doors: 'Every door opened',
	newApartment: 'The new apartment',
	footsteps: 'The footsteps',
	neighbors: 'The neighbors',
	rule: 'The rule',
	creature: 'On the stairs',
	realization: 'The message',
	offering: 'A key in the lock',
	staircase: 'The staircase',
	nextTenant: 'The next tenant',
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

const title = 'Never Open Your Door at 3:06 AM | Animated Horror Story';
const alternatives = ['My Rent Was Too Cheap... Now I Know Why | Animated Horror', 'My Neighbors Chose Me | Animated Horror Story'];
const tags = [
	'animated horror story',
	'horror animation',
	'scary story',
	'creepypasta',
	'apartment horror',
	'3am horror story',
	'neighbors horror story',
	'2d animation',
	'horror short film',
	'scary animation',
	'landlord horror story',
	'horror narration',
	'creature horror',
	'thriller',
	'animated short',
];

const description = [
	'At 3:06 in the morning, every apartment door in my building opened.',
	'My neighbors stepped into the hallway and stood there - completely still, facing the stairs, not breathing. Then something started coming up.',
	'',
	'A 13-minute animated horror story. Headphones recommended - and maybe check that your door is locked.',
	'',
	'CHAPTERS',
	...chapters,
	'',
	'This story is fiction. All characters and events are invented; any resemblance to real people or events is coincidental.',
	'',
	'#horrorstory #animation #scary',
	'',
	'CREDITS',
	'Story, animation and sound design: Never Open Your Door at 3:06 AM production.',
	'Voices: Fish Audio (text-to-speech).',
	'Illustrations: generated with an image model from the film\'s own layouts and character designs, animated in code.',
	'Fonts: Inter, IBM Plex Mono, Patrick Hand (SIL Open Font License).',
	'Sound effects: built from CC0 and CC-BY field recordings (FSD50K / Freesound, VSCO-2 CE, Kenney.nl, bank-sfx).',
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
