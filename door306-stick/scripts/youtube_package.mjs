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
	.map((l) => l.replace(/^\s*-\s*/, '• ').replace(/\*\*/g, '').replace(/`/g, ''))
	// short form for YouTube's 5,000-character limit: title, author, source and licence stay; the licence URL
	// is given once below the list and the "used in" notes stay in CREDITS.md
	.map((l) => l.replace(/ - used in:.*$/, '').replace(/https:\/\/freesound\.org\/s\//, 'freesound.org/s/').replace(/ \(https:\/\/creativecommons\.org\/licenses\/[^)]*\)/, ''));
const licences = [...new Set(credits.match(/https:\/\/creativecommons\.org\/licenses\/by\/[0-9.]+\//g) || [])];

// Title: a direct warning to the viewer + an oddly exact time (curiosity), under ~60 characters so it
// is not cut off on phones. The thumbnail text adds the stakes instead of repeating the title.
const title = 'Never Open Your Door at 3:06 AM | Animated Horror Story';
const alternatives = ['Every Door in My Building Opens at 3:06 AM | Horror Animation', 'My Rent Was Too Cheap... Now I Know Why | Animated Horror'];
const thumbnails = [
	'MYSTERY SET (shows nothing of what happens - upload these three to Test & Compare in YouTube Studio):',
	'thumbnail_D_every_door.jpg - the empty corridor at 3 a.m., every door open onto black rooms except one (circled) - "EVERY DOOR OPENED..."',
	'thumbnail_E_whos_there.jpg - from inside, only the light under her door and the shadows of two long feet - "WHO\'S THERE?"',
	'thumbnail_F_dont_make_a_sound.jpg - the neighbours from behind, facing a pitch-black stairwell; Mr. Harris looks back, finger on his lips - "DON\'T MAKE A SOUND"',
	'REVEAL SET (shows the creature / the twist - keep as a fallback):',
	'thumbnail_A_they_chose_me.jpg - Mr. Harris with the master key, the creature behind him - "THEY CHOSE ME"',
	'thumbnail_B_306am.jpg - through the peephole, every neighbour staring, the creature at the stairs - "3:06 AM"',
	'thumbnail_C_dont_open.jpg - Sarah against her door, hand over her mouth, feet under the door - "DON\'T OPEN IT"',
];
const pinned = 'Be honest - if your neighbor knocked at 3:06 AM and whispered your name... would you have opened the door?';
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
	'never open your door',
	'3:06 am',
	'scary apartment story',
];

const description = [
	'At 3:06 AM, every door in my building opened - and my neighbors stepped into the hallway like they had done it a hundred times before.',
	'They stood completely still, facing the stairs. Then something started coming up. And I was the only one who didn\'t know what it was.',
	'',
	'A 13-minute animated horror story about a new apartment, a rent that was too cheap, and the one rule nobody told me. Watch it with headphones - and check that your door is locked.',
	'',
	'Would you have opened the door? Tell me in the comments.',
	'',
	'CHAPTERS',
	...chapters,
	'',
	'This story is fiction. All characters and events are invented; any resemblance to real people or events is coincidental.',
	'',
	'#horrorstory #animatedhorror #scarystories',
	'',
	'CREDITS',
	'Story, animation and sound design: Never Open Your Door at 3:06 AM production.',
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
