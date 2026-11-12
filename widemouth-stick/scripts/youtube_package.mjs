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
	wave: 'The wave',
	house: 'The house on the hill',
	underBed: 'Under the bed',
	trampoline: 'The secret game',
	box: 'The box',
	nights: 'The nights',
	trail: 'The trail',
	fourAm: 'Moving day',
	end: 'Twenty-five years later',
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
	.map((l) => l.replace(/^\s*-\s*/, '• ').replace(/\*\*/g, '').replace(/`/g, ''))
	// short form for YouTube's 5,000-character limit: title, author, source and licence stay; the licence URL
	// is given once below the list and the "used in" notes stay in CREDITS.md
	.map((l) => l.replace(/ - used in:.*$/, '').replace(/https:\/\/freesound\.org\/s\//, 'freesound.org/s/').replace(/ \(https:\/\/creativecommons\.org\/licenses\/[^)]*\)/, ''));
const licences = [...new Set(credits.match(/https:\/\/creativecommons\.org\/licenses\/by\/[0-9.]+\//g) || [])];

// Title: a curiosity hook that is literally true (the trampoline game), then the classic's name for search;
// under ~60 characters so it is not cut off on phones.
const title = 'My Imaginary Friend Wanted Me to Jump | Mr. Widemouth';
const alternatives = ['My Imaginary Friend Brought Me a Box of Knives | Animated Horror', 'Mr. Widemouth | Animated Horror Story'];
const thumbnails = [
	'MYSTERY SET (shows nothing of what happens - upload these three to Test & Compare in YouTube Studio):',
	'thumbnail_A_never_left.jpg - the bed skirt at night, two tiny glints in the dark underneath - "HE NEVER LEFT"',
	'thumbnail_B_waved.jpg - the farmhouse at night, a tiny silhouette with crooked ears in the lit upstairs window - "HE WAVED GOODBYE"',
	'thumbnail_C_trail.jpg - a child\'s sneaker prints and tiny clawed prints side by side, into the dark woods - "WHERE DOES IT GO?"',
];
const pinned = 'Did you have an imaginary friend when you were little? Be honest - do you remember where it went?';
const tags = [
	'mr widemouth',
	'mr. widemouth',
	'animated horror story',
	'horror animation',
	'scary story',
	'creepypasta',
	'creepypasta animated',
	'imaginary friend horror story',
	'imaginary friend',
	'under the bed',
	'monster under the bed',
	'2d animation',
	'horror short film',
	'scary animation',
	'horror narration',
	'animated short',
];

const description = [
	'The last time I saw him, it was four in the morning. He was standing in my bedroom window, waving goodbye.',
	'In his other hand, he was holding a steak knife. He had been my best friend for two weeks.',
	'',
	'A 10-minute animated horror story about a sick little boy, an empty farmhouse on a hill, and the friend who lived under his bed - and the games he wanted to play. Watch it with headphones.',
	'',
	'Did you have an imaginary friend? Tell me in the comments.',
	'',
	'CHAPTERS',
	...chapters,
	'',
	'This story is fiction. All characters and events are invented; any resemblance to real people or events is coincidental.',
	'',
	'#horrorstory #animatedhorror #creepypasta',
	'',
	'CREDITS',
	'Based on "Mr. Widemouth" by PerfectCircle35 (Creepypasta.com, 2010), as archived on the Creepypasta Wiki: https://creepypasta.fandom.com/wiki/Mr._Widemouth - retold in our own words, with the family named, a new cold open and a new ending.',
	'Animation and sound design: Mr. Widemouth production. Music box theme: an original waltz composed and synthesised for this film.',
	'Voices: Fish Audio (text-to-speech).',
	'Illustrations: generated with an image model from the film\'s own layouts and character designs, animated in code.',
	'Fonts: Inter, IBM Plex Mono, Patrick Hand (SIL Open Font License).',
	'Sound effects: built from CC0 and CC-BY field recordings (FSD50K / Freesound, VSCO-2 CE, Kenney.nl, bank-sfx).',
	...(ccby.length
		? ['Sound effects used under Creative Commons Attribution (CC BY):', ...ccby, `Licence: ${licences.join(' ')}`]
		: ['(CC-BY attributions: run the SFX build first - public/audio/sfx/CREDITS.md)']),
	'',
].join('\n');

fs.writeFileSync(path.join(out, 'DESCRIPTION.txt'), description);
fs.writeFileSync(
	path.join(out, 'TITLE_AND_TAGS.txt'),
	[
		`TITLE (${title.length} chars)\n${title}`,
		`\nALTERNATIVE TITLES (for a title test)\n${alternatives.map((a) => `- ${a}`).join('\n')}`,
		`\nTHUMBNAILS\n${thumbnails.map((a) => (a.endsWith(':') ? a : `- ${a}`)).join('\n')}`,
		`\nPINNED COMMENT\n${pinned}`,
		`\nTAGS (comma separated, ${tags.join(', ').length} chars)\n${tags.join(', ')}`,
		'',
	].join('\n'),
);
if (description.length > 5000) throw new Error(`description is ${description.length} characters - YouTube allows 5,000`);
console.log(`youtube/DESCRIPTION.txt (${description.length} chars, ${chapters.length} chapters, ${ccby.length} CC-BY credits), youtube/TITLE_AND_TAGS.txt`);
