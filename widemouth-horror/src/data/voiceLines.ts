// Every spoken line of "Mr. Widemouth", in story order, word for word from SCRIPT.md.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the TTS reads.
//  - 'narrator' = Eli at 30 telling it (close, dry, no subtitle tag); 'eli' = Eli at 5 in the scene.
//  - Every narrator line carries its own Drama 3 direction (the read has to move: wistful -> uneasy
//    -> whispered dread), after the "monotone" note on the last film.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	eli: 'room',
	widemouth: 'room',
	mom: 'room',
	dad: 'room',
	leo: 'room',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'serious',
	eli: 'afraid',
	widemouth: 'warm',
	mom: 'warm',
	dad: 'tired',
	leo: 'casual',
};

type Opts = Partial<Omit<VoiceLine, 'id' | 'character' | 'text' | 'scene' | 'filename'>>;

const line = (scene: string, character: CharacterId, id: string, text: string, o: Opts = {}): VoiceLine => ({
	id,
	character,
	text,
	scene,
	emotion: o.emotion ?? DEFAULT_EMOTION[character],
	intensity: o.intensity ?? 0.4,
	pace: o.pace ?? 1,
	volume: o.volume ?? 1,
	pauseBefore: o.pauseBefore ?? 0,
	pauseAfter: o.pauseAfter ?? 0.4,
	audioEffect: o.audioEffect ?? DEFAULT_EFFECT[character],
	pan: o.pan ?? VOICES[character].post.pan,
	filename: `${VOICES[character].folder}/${id}.wav`,
	fearLevel: o.fearLevel ?? 0,
	breath: o.breath ?? 'none',
	direction: o.direction ?? '',
	spokenText: o.spokenText,
	blendTo: o.blendTo,
	voiceTweak: o.voiceTweak,
	fishTags: o.fishTags,
	noSubtitle: o.noSubtitle,
});

/** n(id, text, tags, pauseAfter) - a narrator line with its own direction. */
const scene = (s: string) => ({
	n: (id: string, text: string, fishTags: string, pauseAfter = 0.4, o: Opts = {}) => line(s, 'narrator', id, text, {fishTags, pauseAfter, ...o}),
	e: (id: string, text: string, o: Opts = {}) => line(s, 'eli', id, text, o),
	w: (id: string, text: string, o: Opts = {}) => line(s, 'widemouth', id, text, o),
	m: (id: string, text: string, o: Opts = {}) => line(s, 'mom', id, text, o),
	d: (id: string, text: string, o: Opts = {}) => line(s, 'dad', id, text, o),
	l: (id: string, text: string, o: Opts = {}) => line(s, 'leo', id, text, o),
});

// 1. THE WAVE - cold open
const s1 = scene('wave');
const WAVE: VoiceLine[] = [
	s1.n('narrator_001_four_am', 'The last time I saw him, it was four in the morning.', '[low voice, haunted]', 0.5),
	s1.n('narrator_002_truck', "I was five years old, sitting in the cab of my dad's moving truck with my face against the cold glass.", '[quietly, remembering]', 0.45),
	s1.n('narrator_003_window', 'And he was standing in my bedroom window.', '[low voice, tense]', 0.6),
	s1.n('narrator_004_still', 'Small. Perfectly still.', '[whispering]', 0.8),
	s1.n('narrator_005_waved', 'As we pulled away, he lifted one tiny hand and waved goodbye.', '[slowly, uneasy]', 0.5),
	s1.n('narrator_006_knife', 'In his other hand, he was holding a steak knife.', '[whispering, creeped out]', 0.9),
	s1.n('narrator_007_didnt_wave', "I didn't wave back.", '[quietly, firm]', 0.7),
	s1.n('narrator_008_best_friend', 'He had been my best friend for two weeks.', '[slowly, haunted]', 0.9),
];

// 2. THE EMPTY HOUSE
const s2 = scene('house');
const HOUSE: VoiceLine[] = [
	s2.n('narrator_009_never_stayed', 'When I was little, my family never stayed anywhere for long.', '[warm, wistful]'),
	s2.n('narrator_010_chased_jobs', 'My dad chased jobs, and we followed him, from one rented house to the next.', '[warm, conversational]'),
	s2.n('narrator_011_farmhouse', 'That spring, it was a big old farmhouse on a hill outside a tiny town in Maine.', '[conversational]', 0.45),
	s2.n('narrator_012_too_big', 'It was far too big for the three of us. There were rooms in that house I never even saw.', '[uneasy]', 0.5),
	s2.n('narrator_013_noises', 'At night, the house made noises. Long creaks in the hallway. Little taps inside the walls.', '[low voice, uneasy]', 0.5),
	s2.n('narrator_014_settle', 'My dad said old houses settle. My mom said I had a big imagination.', '[wry, warm]', 0.6),
	s2.n('narrator_015_sick', 'The day after my fifth birthday, I got sick.', '[quietly]', 0.4),
	s2.n('narrator_016_fever', "A fever that wouldn't break. The doctor said weeks in bed, no running, no playing.", '[tired, conversational]'),
	s2.n('narrator_017_boxes', 'And we were already packing for the next move, so everything I owned was taped up in cardboard boxes.', '[conversational]'),
	s2.n('narrator_018_empty_room', 'My room was empty except for my bed, a stack of picture books, and the ginger ale my mom brought me three times a day.', '[warm, wistful]'),
	s2.n('narrator_019_bored', 'I had never been so bored in my life.', '[amused, a little sad]', 0.6),
	s2.n('narrator_020_showed_up', "That's when he showed up.", '[low voice, ominous]', 0.9),
];

// 3. UNDER THE BED
const s3 = scene('underBed');
const UNDER_BED: VoiceLine[] = [
	s3.n('narrator_021_first_time', "I don't remember the first time I saw him. I only remember asking his name.", '[quietly, remembering]', 0.4),
	s3.w('widemouth_001_call_me', 'Call me Mr. Widemouth.', {fishTags: '[sweet, sing-song, clearly]', pauseAfter: 0.5, spokenText: 'Call me Mister Wide Mouth.'}),
	s3.n('narrator_022_suited', 'It suited him.', '[wry]', 0.4),
	s3.n('narrator_023_size_of_cat', 'He was about the size of a cat. Everything about him was too big for his body: his round head, his shiny black eyes, his crooked ears.', '[descriptive, uneasy]'),
	s3.n('narrator_024_mouth', 'But his mouth was the biggest thing of all. It stretched almost from one ear to the other.', '[low voice, creeped out]', 0.5),
	s3.n('narrator_025_toy_pets', 'He looked like one of those talking toy pets every kid wanted that year.', '[nostalgic]', 0.4),
	s3.e('eli_001_a_toy', 'Are you a toy?', {fishTags: '[curious, innocent]', pauseAfter: 0.3}),
	s3.w('widemouth_002_friend', "Toys can't be your friend. I can.", {fishTags: '[sweet, warm]', pauseAfter: 0.4}),
	s3.w('widemouth_003_other_friends', 'Do you have any other friends?', {fishTags: '[curious, sweet]', pauseAfter: 0.3}),
	s3.e('eli_002_move', 'We move too much.', {fishTags: '[sad, quietly]', pauseAfter: 0.4}),
	s3.w('widemouth_004_good', 'Good. Then you have me.', {fishTags: '[pleased, sweet, slightly sinister]', pauseAfter: 0.6}),
	s3.n('narrator_026_slid', 'Whenever my mom came up the stairs, he slid under my bed. Fast.', '[uneasy]', 0.4),
	s3.w('widemouth_005_parents', "If your parents see me, they won't let us play anymore.", {fishTags: '[whispering, urgent]', pauseAfter: 0.5}),
	s3.n('narrator_027_books', 'For the first few days, all he wanted to do was look at my books.', '[warm, remembering]'),
	s3.n('narrator_028_pages', 'He turned the pages slowly, staring at every picture, like he had never seen a story before.', '[quietly, curious]', 0.5),
	s3.n('narrator_029_too_fast', 'Once, my mom came in a little too fast. The bed skirt was still swinging when she opened the door.', '[tense]', 0.35),
	s3.m('mom_001_who', 'Who were you talking to, sweetheart?', {fishTags: '[gentle, curious]', pauseAfter: 0.4}),
	s3.e('eli_003_nobody', 'Nobody.', {fishTags: '[quietly, guilty]', pauseAfter: 0.6}),
	s3.n('narrator_030_lied', 'It was the first time I ever lied to her. He had asked me to.', '[quietly, regretful]', 0.6),
	s3.n('narrator_031_huge_smile', 'Then, one morning, he was waiting for me with a huge smile.', '[uneasy]', 0.4),
	s3.w('widemouth_006_secret_game', 'I have a new game. A secret game.', {fishTags: '[excited, whispering]', pauseAfter: 0.7}),
];

// 4. TRAMPOLINE
const s4 = scene('trampoline');
const TRAMPOLINE: VoiceLine[] = [
	s4.n('narrator_032_hall', 'He waited until my mom had come and gone. Then he tugged my hand and led me down the hall, to the room at the very end.', '[low voice, tense]'),
	s4.n('narrator_033_not_allowed', "I wasn't allowed out of bed. He kept tugging until I went anyway.", '[quietly, guilty]'),
	s4.n('narrator_034_room_empty', 'The room was completely empty. Bare floorboards. No furniture. Just one window.', '[low voice, uneasy]', 0.5),
	s4.n('narrator_035_pushed_open', 'He ran across the room and pushed it wide open.', '[tense]', 0.4),
	s4.n('narrator_036_long_way', 'The house sat on a hill, so the ground below that window was a long, long way down.', '[slowly, uneasy]', 0.6),
	s4.w('widemouth_007_how_to_play', "Here's how you play. You pretend there's a big, soft trampoline down there. Then you jump. And if you pretend hard enough... you bounce right back up. Light as a feather.", {
		fishTags: '[sweet, sing-song, persuasive]',
		pauseAfter: 0.6,
	}),
	s4.n('narrator_037_almost_see', 'I was five. I had a fever. For one second, I could almost see it.', '[quietly, haunted]', 0.6),
	s4.e('eli_004_far_down', "It's really far down. Maybe another time.", {fishTags: '[unsure, small voice]', pauseAfter: 0.6}),
	s4.n('narrator_038_face_changed', 'His face changed.', '[low voice, tense]', 0.5),
	s4.n('narrator_039_snarled', 'His lips peeled back over that enormous mouth, and for just a moment, my friend snarled at me.', '[tense, creeped out]', 0.6),
	s4.n('narrator_040_disappointed', 'Then it was gone. He just looked... disappointed.', '[slowly, uneasy]', 0.5),
	s4.n('narrator_041_rest_of_day', 'He spent the rest of the day under my bed, without making a sound.', '[quietly, ominous]', 0.8),
];

// 5. THE BOX
const s5 = scene('box');
const BOX: VoiceLine[] = [
	s5.n('narrator_042_cardboard_box', 'The next morning, he came back with a little cardboard box.', '[uneasy]', 0.4),
	s5.w('widemouth_008_juggle', "I'm going to teach you how to juggle.", {fishTags: '[cheerful, sing-song]', pauseAfter: 0.5}),
	s5.n('narrator_043_looked_inside', 'I looked inside.', '[quietly]', 0.5),
	s5.n('narrator_044_knives', 'It was full of knives.', '[whispering, horrified]', 0.8),
	s5.e('eli_005_mom_kill_me', "I can't! My mom will kill me!", {emotion: 'panicked', fishTags: '[panicked, whispering]', pauseAfter: 0.4}),
	s5.w('widemouth_009_more_fun', "It's more fun with these.", {fishTags: '[flat, cold]', pauseAfter: 0.7}),
	s5.n('narrator_045_smile_gone', 'When I pushed the box away, the smile was gone.', '[low voice, tense]', 0.5),
	s5.n('narrator_046_slid_back', 'He took his knives and slid back under my bed.', '[uneasy]', 0.5),
	s5.n('narrator_047_wondering', 'That was the night I started wondering how much of his time he spent down there.', '[quietly, creeped out]', 0.5),
	s5.n('narrator_048_underneath', 'Right underneath me.', '[whispering, ominous]', 0.9),
];

// 6. THE NIGHTS
const s6 = scene('nights');
const NIGHTS: VoiceLine[] = [
	s6.n('narrator_049_woke_me', 'After that, he woke me up at night.', '[low voice]', 0.4),
	s6.n('narrator_050_grin', "I'd open my eyes in the dark, and that wide grin would be right at the edge of my mattress.", '[whispering, creeped out]', 0.5),
	s6.w('widemouth_010_real_trampoline', "I put a real trampoline under the window. A big one. You just can't see it in the dark.", {fishTags: '[whispering, sweet, insistent]', pauseAfter: 0.6}),
	s6.n('narrator_051_squeeze', "I'd tell him no and squeeze my eyes shut.", '[quietly, scared]', 0.4),
	s6.n('narrator_052_didnt_leave', "But he didn't leave.", '[low voice]', 0.5),
	s6.n('narrator_053_until_grey', "He'd stay there, whispering about the window, until the sky outside turned grey.", '[tired, haunted]', 0.6),
	s6.n('narrator_054_not_fun', "He wasn't fun anymore.", '[quietly, sad]', 0.9),
	s6.n('narrator_055_woke_cold', 'Then, one night, I woke up cold.', '[tense, low voice]', 0.5),
	s6.n('narrator_056_not_in_bed', "I wasn't in my bed.", '[whispering, scared]', 0.6),
	s6.n('narrator_057_sill', 'I was standing in the empty room at the end of the hall. The window was wide open. The night air was on my face, and my bare toes were curled over the edge of the sill.', '[whispering, terrified]', 0.6),
	s6.n('narrator_058_dont_know', "I don't know how I got there.", '[quietly, shaken]', 0.6),
	s6.n('narrator_059_whispered', 'Behind me, in the dark, something whispered.', '[whispering, terrified]', 0.5),
	s6.w('widemouth_011_almost', 'Almost.', {fishTags: '[whispering, pleased]', pauseAfter: 0.9}),
	s6.n('narrator_060_ran_back', "I ran back to my bed and pulled the blanket over my head, and I didn't sleep again until morning.", '[breathless, scared]', 0.9),
];

// 7. THE TRAIL
const s7 = scene('trail');
const TRAIL: VoiceLine[] = [
	s7.n('narrator_061_better', 'When I finally got better, my mom said I could go outside.', '[relieved, warm]', 0.4),
	s7.n('narrator_062_porch', 'He was waiting for me on the back porch.', '[low voice, uneasy]', 0.4),
	s7.w('widemouth_012_show_you', "I want to show you something. It's safe. I promise.", {fishTags: '[sweet, gentle]', pauseAfter: 0.5}),
	s7.n('narrator_063_deer_trail', 'He led me to the edge of the woods behind the house, where a narrow deer trail disappeared into the trees.', '[uneasy]'),
	s7.n('narrator_064_silent', 'The woods were completely silent. No birds. Just the sound of his little feet on the dead leaves.', '[low voice, creeped out]', 0.5),
	s7.w('widemouth_013_important_path', "This is a very important path. I've had lots of friends your age. When they were ready, I took them down this trail, to a special place.", {
		fishTags: '[gentle, proud, sweet]',
		pauseAfter: 0.6,
	}),
	s7.n('narrator_065_black_eyes', 'He looked up at me with those shiny black eyes.', '[quietly, ominous]', 0.5),
	s7.w('widemouth_014_not_ready', "You're not ready yet. But soon.", {fishTags: '[sweet, whispering, sinister]', pauseAfter: 0.9}),
];

// 8. FOUR A.M.
const s8 = scene('fourAm');
const FOUR_AM: VoiceLine[] = [
	s8.n('narrator_066_moving_day', 'Moving day came two weeks after I met him.', '[quietly]', 0.4),
	s8.n('narrator_067_didnt_tell', "I didn't tell him we were leaving. Even at five, I'd figured out that the things he wanted for me were not good things.", '[low voice, serious]', 0.5),
	s8.n('narrator_068_searched', 'The night before we left, my mom searched the whole kitchen.', '[uneasy]', 0.35),
	s8.m('mom_002_steak_knife', 'Has anyone seen the big steak knife? It was right here in the drawer.', {fishTags: '[puzzled, calling out]', audioEffect: 'distant', pauseAfter: 0.5}),
	s8.n('narrator_069_nobody', 'Nobody had.', '[quietly, ominous]', 0.6),
	s8.n('narrator_070_lay_awake', "That night I lay awake, listening to the quiet underneath me. For the first time, he didn't say a word.", '[whispering, uneasy]', 0.7),
	s8.n('narrator_071_four_am', 'My dad woke me at four in the morning and carried me out to the truck.', '[quietly, tired]', 0.4),
	s8.d('dad_001_last_move', 'This is the last move, buddy. I promise. Then you can make some real friends.', {fishTags: '[tired, warm, soft]', pauseAfter: 0.6}),
	s8.n('narrator_072_backed_out', 'I looked up at the house as we backed out of the driveway.', '[low voice, tense]', 0.5),
	s8.n('narrator_073_there_he_was', 'And there he was. In my window.', '[whispering, chilled]', 0.7),
	s8.n('narrator_074_you_know', 'You already know the rest.', '[quietly]', 0.5),
	s8.n('narrator_075_little_wave', 'The little wave.', '[whispering]', 0.6),
	s8.n('narrator_076_the_knife', 'The steak knife.', '[whispering, haunted]', 1.0),
];

// 9. THE END OF THE TRAIL - present day
const s9 = scene('end');
const END: VoiceLine[] = [
	s9.n('narrator_077_drove_back', 'Twenty-five years later, I drove back.', '[calm, reflective]', 0.5),
	s9.n('narrator_078_house_gone', 'The house was gone. It had burned down a few years after we left. Only the stone foundation was still there, half buried in weeds.', '[quietly, reflective]', 0.5),
	s9.n('narrator_079_found_trail', 'I found the deer trail.', '[low voice]', 0.5),
	s9.n('narrator_080_expected', 'Part of me expected him to jump out from behind a tree. But I knew he was gone. Somehow, he had belonged to that house.', '[uneasy, reflective]', 0.6),
	s9.n('narrator_081_deeper', 'The trail went deeper into the woods than I remembered.', '[uneasy]', 0.5),
	s9.n('narrator_082_cemetery', 'It ended at a cemetery.', '[low voice, tense]', 0.7),
	s9.n('narrator_083_headstones', 'Rows and rows of small, old headstones.', '[slowly, uneasy]', 0.6),
	s9.n('narrator_084_children', 'Most of them belonged to children.', '[whispering, horrified, clearly]', 0.9, {spokenText: 'Most of them belonged... to children.'}),
	s9.n('narrator_085_not_ready', "He'd told me I wasn't ready.", '[quietly, haunted]', 0.6),
	s9.n('narrator_086_had_been', 'Every one of them had been ready.', '[whispering, haunted]', 1.2),
	s9.n('narrator_087_son_five', 'Last week, my son turned five.', '[very quietly, calm]', 0.6),
	s9.n('narrator_088_trampoline', 'This morning, he asked me if we could get a trampoline.', '[quietly, uneasy]', 0.6),
	s9.n('narrator_089_who_told', 'I asked him who told him about trampolines.', '[whispering, afraid]', 0.5),
	s9.l('leo_001_new_friend', 'My new friend. The one with the big smile.', {fishTags: '[happy, chatty]', pauseAfter: 0.5, volume: 0.55}),
	s9.l('leo_002_under_bed', 'The one who lives under my bed.', {fishTags: '[whispering, delighted]', pauseAfter: 1.0, volume: 0.45}),
	// the last shot: under Leo's bed, the eyes and the grin - and the voice we know
	s9.w('widemouth_015_hello_again', 'Hello again, Eli.', {fishTags: '[whispering, sweet, pleased, clearly]', pauseAfter: 1.0, volume: 0.5}),
];

export const VOICE_LINES: VoiceLine[] = [...WAVE, ...HOUSE, ...UNDER_BED, ...TRAMPOLINE, ...BOX, ...NIGHTS, ...TRAIL, ...FOUR_AM, ...END];

export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
