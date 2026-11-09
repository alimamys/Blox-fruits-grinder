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
	twelve: 'Twelve hot dogs',
	woods: 'The woods',
	facingAway: 'Facing away',
	goatman: 'The legend',
	oneTooMany: 'One too many',
	seven: 'Seven',
	letMeIn: 'Let me in',
	nine: 'Nine',
	plates: 'Twelve years later',
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

// Title: a direct warning to the viewer + an oddly exact time (curiosity), under ~60 characters so it
// is not cut off on phones. The thumbnail text adds the stakes instead of repeating the title.
// Title: a count that does not add up (curiosity) and is literally true by the end; under ~60 characters.
const title = '11 of Us Went Camping. 12 Came Back. | Animated Horror Story';
const alternatives = ['Something Ate Dinner With Us in the Woods | Animated Horror', 'Count Your Friends Before You Fall Asleep | Animated Horror Story'];
const thumbnails = [
	'MYSTERY SET (shows nothing of what happens - upload these three to Test & Compare in YouTube Studio):',
	'thumbnail_A_count_them.jpg - the trailer packed with teenagers at night; one face at the end of the bench lost in shadow (circled) - "COUNT THEM"',
	'thumbnail_B_facing_away.jpg - a flashlight beam in black woods finds a man standing still with his back turned - "DON\'T LOOK BACK"',
	'thumbnail_C_twelve.jpg - a paper plate with one hot dog; a grey hand with too-long fingers reaching for it - "WHO ATE IT?"',
];
const pinned = 'Be honest - would YOU have noticed the extra one? How many people were really in that trailer?';
const tags = [
	'animated horror story',
	'horror animation',
	'scary story',
	'creepypasta',
	'goatman',
	'anansi goatman story',
	'camping horror story',
	'woods horror story',
	'scary camping story',
	'cryptid horror',
	'2d animation',
	'horror short film',
	'scary animation',
	'horror narration',
	'thriller',
	'animated short',
];

const description = [
	'There were eleven of us in that trailer. Twelve hot dogs were gone.',
	'Something had been sitting with us - eating with us - for a whole day. And not one of us could tell you whose face it was wearing.',
	'',
	'A 10-minute animated horror story about a camping trip in the Alabama woods, a legend nobody wanted to hear, and the night we finally counted. Watch it with headphones.',
	'',
	'Would you have noticed the extra one? Tell me in the comments.',
	'',
	'CHAPTERS',
	...chapters,
	'',
	'This story is fiction. All characters and events are invented; any resemblance to real people or events is coincidental.',
	'',
	'#horrorstory #animatedhorror #goatman',
	'',
	'CREDITS',
	'Based on "Anansi\'s Goatman Story" by Anansi (4chan /x/, 2012), as archived on the Creepypasta Wiki: https://creepypasta.fandom.com/wiki/Anansi%27s_Goatman_Story - retold in our own words, characters renamed. Creepypasta Wiki text is available under CC BY-SA 3.0.',
	'Animation and sound design: 11 of Us Went Camping production.',
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
