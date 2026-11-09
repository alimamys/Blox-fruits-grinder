// Every spoken line of "11 of Us Went Camping. 12 Came Back.", in story order, word for word
// from SCRIPT.md.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the
//    TTS engine reads.
//  - pauseBefore / pauseAfter are deliberately NOT uniform: the one-word lines ("Eleven."
//    "Six." "Eight.") get longer holds so the counting lands.
//  - fearLevel: 1 unease, 2 dread, 3 controlled fear, 4 panic, 5 terror.
//  - 'narrator' = Marcus at 28 telling it (close, dry, no subtitle tag); 'marcus' = Marcus at 16
//    inside the scene (tagged MARCUS). 'thing' is Wyatt's voice with the rhythm taken out.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	marcus: 'trailer',
	wyatt: 'trailer',
	ray: 'trailer',
	nia: 'trailer',
	dawes: 'outdoor',
	cole: 'trailer',
	thing: 'thing',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'serious',
	marcus: 'afraid',
	wyatt: 'terrified',
	ray: 'whispering',
	nia: 'terrified',
	dawes: 'serious',
	cole: 'confused',
	thing: 'unnaturally_calm',
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
	pauseAfter: o.pauseAfter ?? 0.35,
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

/** A scene's line makers; `d` holds that scene's defaults for the narration. */
const scene = (s: string, d: Opts = {}) => ({
	n: (id: string, text: string, o: Opts = {}) => line(s, 'narrator', id, text, {...d, ...o}),
	m: (id: string, text: string, o: Opts = {}) => line(s, 'marcus', id, text, o),
	w: (id: string, text: string, o: Opts = {}) => line(s, 'wyatt', id, text, o),
	r: (id: string, text: string, o: Opts = {}) => line(s, 'ray', id, text, o),
	ni: (id: string, text: string, o: Opts = {}) => line(s, 'nia', id, text, o),
	d: (id: string, text: string, o: Opts = {}) => line(s, 'dawes', id, text, o),
	c: (id: string, text: string, o: Opts = {}) => line(s, 'cole', id, text, o),
	t: (id: string, text: string, o: Opts = {}) => line(s, 'thing', id, text, o),
});

/** A one-word / fragment line that should land like a beat. */
const BEAT: Opts = {pauseAfter: 0.6};
/** A count: the film's heartbeat - hold after it. */
const COUNT: Opts = {pauseAfter: 0.9, fishTags: '[quietly, slowly]'};

// ---------------------------------------------------------------------------
// 1. TWELVE (cold open) - quiet, haunted; told years later
// ---------------------------------------------------------------------------
const s1 = scene('twelve', {emotion: 'serious', intensity: 0.4, fearLevel: 2, fishTags: '[quietly, haunted]'});
const TWELVE: VoiceLine[] = [
	s1.n('narrator_001_three_packs', 'Three packs of hot dogs. Four in each pack.', {pauseAfter: 0.5, direction: 'Quiet, close, like he has said it to himself a thousand times.'}),
	s1.n('narrator_002_twelve', 'Twelve.', {pauseAfter: 0.7}),
	s1.n('narrator_003_cooked_myself', 'I know, because I cooked every one of them myself.', {pauseAfter: 0.4}),
	s1.n('narrator_004_everybody_one', 'Everybody got one.', {pauseAfter: 0.55}),
	s1.n('narrator_005_seconds', "An hour later, my cousin walked to the stove for seconds, looked into the empty pot, and asked me why I'd taken two.", {pauseAfter: 0.5}),
	s1.n('narrator_006_hadnt', "I hadn't.", {fishTags: '[slowly, clearly, firmly]', spokenText: 'I... hadn\'t.', pauseAfter: 0.8}),
	s1.n('narrator_007_eleven_of_us', 'There were eleven of us in that trailer.', {pauseAfter: 0.5}),
	s1.n('narrator_008_twelve_gone', 'Twelve hot dogs were gone.', {pauseAfter: 0.8}),
	s1.n('narrator_009_sitting_with_us', 'Something had been sitting with us.', {pauseAfter: 0.45}),
	s1.n('narrator_010_eating_with_us', 'Eating with us.', BEAT),
	s1.n('narrator_011_whole_day', 'For a whole day.', {pauseAfter: 0.7}),
	s1.n('narrator_012_whose_face', 'And not one of us could tell you whose face it was wearing.', {fishTags: '[quietly, haunted, slowly]', pauseAfter: 0.8}),
];

// ---------------------------------------------------------------------------
// 2. THE WOODS - warm memory turning uneasy
// ---------------------------------------------------------------------------
const s2 = scene('woods', {emotion: 'casual', intensity: 0.3, fearLevel: 1, fishTags: '[calm, reflective]'});
const WOODS: VoiceLine[] = [
	s2.n('narrator_013_sixteen', 'I was sixteen the summer my mom sent me down from Chicago to stay with family in Alabama.', {pauseAfter: 0.4}),
	s2.n('narrator_014_land', 'My uncle owned miles of pine woods out there, with two old camping trailers parked deep in the trees.', {pauseAfter: 0.4}),
	s2.n('narrator_015_city_boy', "My cousins couldn't wait to drag the city boy out into the wilderness.", {fishTags: '[amused, warm]', pauseAfter: 0.5}),
	s2.n('narrator_016_smell', 'The second we got to the clearing, I noticed the smell.', {emotion: 'uneasy', fishTags: '[uneasy, quietly]', pauseAfter: 0.45}),
	s2.n('narrator_017_lightning', 'Sharp. Metallic. Like the air right before lightning hits.', {emotion: 'uneasy', fishTags: '[uneasy, quietly]', pauseAfter: 0.5}),
	s2.n('narrator_018_let_it_go', 'Nobody else seemed to care, so I let it go.', {pauseAfter: 0.55}),
	s2.n('narrator_019_creek', 'That afternoon, we were swimming in the creek when the bushes moved.', {pauseAfter: 0.4}),
	s2.n('narrator_020_shotgun', 'A man stepped out with a shotgun resting in the crook of his arm. A skinny kid about my age was right behind him.', {emotion: 'uneasy', pauseAfter: 0.4}),
	s2.d('dawes_001_stick_together', "You're Earl's people? Good. Listen. Something big's been killing livestock around here. You stick together. And don't go wandering after dark.", {
		fishTags: '[calm, serious, Southern drawl]',
		pauseAfter: 0.45,
		direction: 'A farmer, unhurried, serious; a warning, not a threat.',
	}),
	s2.n('narrator_021_hang_out', 'His son, Wyatt, asked if he could hang out with us.', {pauseAfter: 0.45}),
	s2.n('narrator_022_eleven', 'By sunset, there were eleven of us.', {pauseAfter: 0.55}),
	s2.n('narrator_023_remember', 'Remember that number.', {fishTags: '[quietly, pointed]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 3. FACING AWAY - the first night
// ---------------------------------------------------------------------------
const s3 = scene('facingAway', {emotion: 'uneasy', intensity: 0.4, fearLevel: 2, fishTags: '[uneasy]'});
const s3f = scene('facingAway', {emotion: 'afraid', intensity: 0.45, fearLevel: 3, fishTags: '[quietly, frightened]'});
const FACING_AWAY: VoiceLine[] = [
	s3.n('narrator_024_around_seven', 'Around seven, Wyatt wanted to run home and ask his dad if he could sleep over.', {fishTags: '[calm]', pauseAfter: 0.35}),
	s3.n('narrator_025_dez_nia', 'My cousin Dez and a girl named Nia went with him. The rest of us stayed by the fire.', {fishTags: '[calm]', pauseAfter: 0.55}),
	s3.n('narrator_026_forty_minutes', 'About forty minutes later, the smell came back.', {pauseAfter: 0.45}),
	s3.n('narrator_027_copper', 'Stronger this time. Like copper. Like the back of your throat after a nosebleed.', {pauseAfter: 0.45}),
	s3.n('narrator_028_stoves', 'We checked the stoves in both trailers. Nothing was on.', {pauseAfter: 0.6}),
	s3f.n('narrator_029_running', 'Then we heard running.', {pauseAfter: 0.4}),
	s3f.n('narrator_030_burst_out', 'Wyatt, Dez and Nia burst out of the dark, sprinted straight past the fire, and threw themselves into the trailer.', {pace: 1.05, pauseAfter: 0.5}),
	s3f.n('narrator_031_dez_crying', 'Dez was crying.', BEAT),
	s3f.n('narrator_032_toughest', 'Dez. The toughest person I knew.', {pauseAfter: 0.5}),
	s3f.w('wyatt_001_lock_door', 'Lock the door. Nobody goes outside. Nobody!', {
		emotion: 'panicked',
		fishTags: '[panicked, out of breath, Southern accent]',
		breath: 'fastBreathing',
		pauseAfter: 0.5,
	}),
	s3f.n('narrator_033_pig', "A few days earlier, one of Wyatt's pigs had been torn open in his yard.", {pauseAfter: 0.45}),
	s3f.n('narrator_034_flashlight', "Tonight, halfway back through the woods, Nia's flashlight had caught a man standing in the trees.", {pauseAfter: 0.4}),
	s3f.n('narrator_035_just_standing', 'Just standing there.', BEAT),
	s3f.n('narrator_036_back_to_them', 'With his back to them.', {fishTags: '[quietly, frightened, clearly]', pauseAfter: 0.8}),
	s3f.n('narrator_037_another', 'Then another, on the other side of the trail.', {pauseAfter: 0.4}),
	s3f.n('narrator_038_closer', 'Closer.', BEAT),
	s3f.n('narrator_039_facing_away', 'Also facing away.', {pauseAfter: 0.8}),
	s3f.n('narrator_040_gibbering', "Then a sound started up from both sides of the woods. A low, wet gibbering. Like someone trying to talk with a mouth that wasn't made for it.", {pauseAfter: 0.5}),
	s3f.n('narrator_041_jerking', 'Nia swung her light toward it and saw something jerking itself between the trees.', {pauseAfter: 0.5}),
	s3f.n('narrator_042_stepped_out', 'And when they finally saw our campfire, something stepped out onto the trail behind them.', {fishTags: '[quietly, frightened, slowly]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 4. THE GOATMAN - the legend
// ---------------------------------------------------------------------------
const s4 = scene('goatman', {emotion: 'uneasy', intensity: 0.4, fearLevel: 2, fishTags: '[quietly, uneasy]'});
const GOATMAN: VoiceLine[] = [
	s4.n('narrator_043_ray_quiet', 'My little cousin Ray had gone very quiet.', {pauseAfter: 0.45}),
	s4.r('ray_001_goatman', "It's the Goatman.", {emotion: 'whispering', fishTags: '[whispering, scared]', pauseAfter: 0.6}),
	s4.n('narrator_044_shut_up', 'Everybody told him to shut up.', {pauseAfter: 0.35}),
	s4.n('narrator_045_kept_going', 'But he kept going.', {pauseAfter: 0.45}),
	s4.n('narrator_046_stories', "People around there told stories about something in those woods. A man's body. A goat's head.", {pauseAfter: 0.5}),
	s4.n('narrator_047_never_see', 'Except you never see it like that.', {pauseAfter: 0.45}),
	s4.n('narrator_048_wears_faces', 'It wears faces.', {fishTags: '[quietly, slowly]', pauseAfter: 0.8}),
	s4.n('narrator_049_walks_into', "It walks into a group of people, sits down among them, and waits for somebody to notice there's one too many.", {pauseAfter: 0.6}),
	s4.n('narrator_050_smell_stopped', 'And then, while Ray was still talking, the smell just stopped.', {pauseAfter: 0.45}),
	s4.n('narrator_051_didnt_fade', "It didn't fade.", {pauseAfter: 0.4}),
	s4.n('narrator_052_gone', 'It was there one second and gone the next.', {pauseAfter: 0.6}),
	s4.n('narrator_053_local_guys', "By morning, we'd decided it was some local guys messing with the city kid.", {emotion: 'casual', fishTags: '[calm, wry]', pauseAfter: 0.45}),
	s4.n('narrator_054_normal', 'The next day was perfectly normal.', {pauseAfter: 0.5}),
	s4.n('narrator_055_worst_part', 'That was the worst part.', {fishTags: '[quietly, haunted]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 5. ONE TOO MANY - the count
// ---------------------------------------------------------------------------
const s5 = scene('oneTooMany', {emotion: 'afraid', intensity: 0.45, fearLevel: 3, fishTags: '[quietly, frightened]'});
const ONE_TOO_MANY: VoiceLine[] = [
	s5.n('narrator_056_second_night', 'The second night, around one in the morning, we were telling ghost stories by the fire.', {emotion: 'casual', fishTags: '[calm]', pauseAfter: 0.4}),
	s5.n('narrator_057_gagging', 'The smell came back so thick that one of the girls started gagging.', {pauseAfter: 0.45}),
	s5.n('narrator_058_crowded', 'We crowded into the trailer and nobody wanted to go back out.', {pauseAfter: 0.45}),
	s5.n('narrator_059_so_i_cooked', 'So I cooked.', {pauseAfter: 0.45}),
	s5.n('narrator_060_three_packs', 'Three packs. Twelve hot dogs.', {pauseAfter: 0.45}),
	s5.n('narrator_061_you_know', 'You already know how that went.', {fishTags: '[quietly, grim]', pauseAfter: 0.6}),
	s5.r('ray_002_took_two', "Yo, why'd you take two?", {emotion: 'casual', fishTags: '[annoyed, casual]', pauseAfter: 0.3}),
	s5.m('marcus_001_twelve', "I didn't. There were twelve. One each for—", {emotion: 'confused', fishTags: '[confused, then trailing off]', pauseAfter: 0.5}),
	s5.n('narrator_062_stopped', 'I stopped.', BEAT),
	s5.n('narrator_063_counted', 'And I counted.', {pauseAfter: 0.7}),
	s5.n('narrator_064_eleven', 'Eleven.', COUNT),
	s5.n('narrator_065_nia_screaming', "That's when Nia started screaming.", {pauseAfter: 0.25}),
	s5.ni('nia_001_get_it_out', 'Get it out! Get it out of here!', {emotion: 'screaming', fishTags: '[screaming, hysterical, crying]', intensity: 0.8, pauseAfter: 0.5}),
	s5.n('narrator_066_crashed', 'We crashed through the door and spilled out into the clearing.', {emotion: 'panicked', fishTags: '[breathless, frightened]', pace: 1.05, pauseAfter: 0.45}),
	s5.n('narrator_067_counted_again', 'I counted again.', {fishTags: '[quietly, clearly]', pauseAfter: 0.6}),
	s5.n('narrator_068_eleven', 'Eleven.', COUNT),
	s5.n('narrator_069_sticks', 'We went back in with sticks and flashlights.', {pauseAfter: 0.45}),
	s5.n('narrator_070_empty', 'The trailer was empty.', {pauseAfter: 0.8}),
	s5.n('narrator_071_knee', 'Nia told us that just before she screamed, the person beside her had grabbed her knee and whispered into her ear.', {pauseAfter: 0.45}),
	s5.n('narrator_072_not_words', "It wasn't words.", {pauseAfter: 0.6}),
	s5.n('narrator_073_its_face', "She couldn't remember its face.", {pauseAfter: 0.45}),
	s5.n('narrator_074_neither', 'Neither could any of us.', {fishTags: '[quietly, haunted]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 6. SEVEN - the next afternoon
// ---------------------------------------------------------------------------
const s6 = scene('seven', {emotion: 'uneasy', intensity: 0.4, fearLevel: 2, fishTags: '[uneasy]'});
const s6f = scene('seven', {emotion: 'afraid', intensity: 0.5, fearLevel: 3, fishTags: '[quietly, frightened]'});
const SEVEN: VoiceLine[] = [
	s6.n('narrator_075_sunrise', 'At sunrise, Nia and three others walked out of those woods and went home.', {pauseAfter: 0.4}),
	s6.n('narrator_076_keys', "I had my uncle's keys, so I had to stay. The others still thought it was a prank.", {pauseAfter: 0.4}),
	s6.n('narrator_077_rifle', 'Wyatt went home to get his rifle.', {pauseAfter: 0.45}),
	s6.n('narrator_078_seven_left', 'That left seven of us in the clearing.', {pauseAfter: 0.5}),
	s6.n('narrator_079_at_least', "At least, that's what we all said.", {fishTags: '[quietly, pointed]', pauseAfter: 0.9}),
	s6f.n('narrator_080_nia_back', 'At five-thirty, somebody said Nia was back.', {pauseAfter: 0.45}),
	s6f.n('narrator_081_fire_pit', 'She was standing by the dead fire pit.', {pauseAfter: 0.4}),
	s6f.n('narrator_082_back_to_us', 'Her back to the trailer.', {pauseAfter: 0.7}),
	s6f.n('narrator_083_faint', 'The smell was back too. Faint.', {pauseAfter: 0.5}),
	s6f.n('narrator_084_silent', 'And the woods had gone completely silent. No birds. No insects. Nothing.', {pauseAfter: 0.8}),
	s6f.n('narrator_085_shoulders', 'Then her shoulders started to shake.', {pauseAfter: 0.45}),
	s6f.n('narrator_086_laughing', 'Like she was laughing.', BEAT),
	s6f.n('narrator_087_no_sound', 'Without making a sound.', {pauseAfter: 0.8}),
	s6f.n('narrator_088_froze', 'One of the girls started walking out to her, then froze halfway.', {pauseAfter: 0.3}),
	s6f.m('marcus_002_get_back', 'Get back inside. Now!', {emotion: 'angry', fishTags: '[shouting, urgent, scared]', audioEffect: 'outdoor', pauseAfter: 0.5}),
	s6f.n('narrator_089_blinds', 'We pulled every blind except one and watched her through it.', {pauseAfter: 0.45}),
	s6f.n('narrator_090_twenty', "She didn't move for twenty minutes.", {pauseAfter: 0.8}),
	s6f.n('narrator_091_slammed', 'Then something slammed against the door.', {pauseAfter: 0.25}),
	s6f.w('wyatt_002_let_me_in', 'Let me in! Stop playing!', {emotion: 'screaming', fishTags: '[shouting, panicked, Southern accent]', audioEffect: 'door', pauseAfter: 0.5}),
	s6f.n('narrator_092_with_rifle', 'It was Wyatt, with his rifle.', {fishTags: '[relieved, quietly, clearly]', pauseAfter: 0.45}),
	s6f.n('narrator_093_turned_to_watch', 'He said a girl by the fire had turned to watch him cross the clearing.', {pauseAfter: 0.4}),
	s6f.n('narrator_094_never_saw', 'He never saw her move.', {pauseAfter: 0.4}),
	s6f.n('narrator_095_closer', 'But every time he looked back, she was closer.', {pauseAfter: 0.7}),
	s6f.n('narrator_096_went_pale', 'He stepped inside, looked around the room, and went pale.', {pauseAfter: 0.45}),
	s6f.w('wyatt_003_only_six', 'Marcus. Why are there only six of you?', {emotion: 'whispering', fishTags: '[whispering, terrified, Southern accent]', pauseAfter: 0.8}),
	s6f.n('narrator_097_math', 'Eleven of us. Four went home. Wyatt left.', {fishTags: '[quietly, slowly, counting]', pauseAfter: 0.5}),
	s6f.n('narrator_098_six', 'Six.', COUNT),
	s6f.n('narrator_099_all_afternoon', 'All afternoon, we had been seven.', {pauseAfter: 0.5}),
	s6f.n('narrator_100_math', 'None of us had done the math.', {pauseAfter: 0.6}),
	s6f.n('narrator_101_inside_again', 'It had been inside with us again.', {pauseAfter: 0.45}),
	s6f.n('narrator_102_when_it_left', 'And none of us had noticed when it left.', {fishTags: '[quietly, haunted]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 7. LET ME IN - the second night
// ---------------------------------------------------------------------------
const s7 = scene('letMeIn', {emotion: 'afraid', intensity: 0.5, fearLevel: 3, fishTags: '[quietly, frightened]'});
const s7t = scene('letMeIn', {emotion: 'terrified', intensity: 0.55, fearLevel: 4, fishTags: '[terrified, quietly]'});
const LET_ME_IN: VoiceLine[] = [
	s7.n('narrator_103_cole', "At sundown, Wyatt's cousin Cole showed up with a lantern and a second rifle.", {pauseAfter: 0.4}),
	s7.c('cole_001_little_friend', "Where's your little friend at? She was standing in the middle of the trail. Kept lagging behind me. Just smiling.", {
		fishTags: '[confused, casual, Southern accent]',
		pauseAfter: 0.6,
	}),
	s7.n('narrator_104_reached', "He'd reached out to touch her shoulder.", {pauseAfter: 0.4}),
	s7.n('narrator_105_empty_air', 'His hand closed on empty air.', {pauseAfter: 0.45}),
	s7.n('narrator_106_foot_left', 'She was standing a foot to the left.', {pauseAfter: 0.9}),
	s7t.n('narrator_107_eleven', 'At eleven, the smell changed.', {pauseAfter: 0.45}),
	s7t.n('narrator_108_burnt', 'Burnt hair. Cooked blood.', {pauseAfter: 0.6}),
	s7t.n('narrator_109_scraped', 'Something scraped at the door. Half knocking. Half clawing.', {pauseAfter: 0.6}),
	s7t.n('narrator_110_voice', 'Then a voice.', {pauseAfter: 0.5}),
	s7t.t('thing_001_let_me_in', 'Let... me... in. Stop... playing.', {
		spokenText: 'Let me in. Stop playing.',
		fishTags: '[flat, monotone]',
		pauseAfter: 0.8,
		direction: "Wyatt's own words, generated with Wyatt's voice, then broken into syllables and re-timed with no human rhythm.",
	}),
	s7t.n('narrator_111_wyatts_words', "Wyatt's own words.", {fishTags: '[quietly, clearly]', pauseAfter: 0.4}),
	s7t.n('narrator_112_wrong', 'But wrong.', {pauseAfter: 0.5}),
	s7t.n('narrator_113_no_rhythm', 'It had no rhythm at all. Like something that had listened to people for a very long time, but had never been one.', {pauseAfter: 0.7}),
	s7t.n('narrator_114_two_am', 'At two in the morning, Cole kicked the door open and fired into the sky.', {pauseAfter: 0.3}),
	s7t.c('cole_002_get_gone', 'Whatever you are... get gone!', {emotion: 'angry', fishTags: '[shouting, angry, scared, Southern accent]', audioEffect: 'outdoor', pauseAfter: 0.6}),
	s7t.n('narrator_115_answered', 'The treeline answered.', {pauseAfter: 0.45}),
	s7t.n('narrator_116_hooting', 'Hooting. Gibbering.', {pauseAfter: 0.5}),
	s7t.n('narrator_117_scream', 'Then a scream, like a woman and an animal screaming at the same time.', {pauseAfter: 0.6}),
	s7t.n('narrator_118_crawled', 'Something low crawled out of the brush, straight toward the trailer.', {pauseAfter: 0.4}),
	s7t.n('narrator_119_fired', 'Cole fired, and it scrambled back into the dark.', {pauseAfter: 0.6}),
	s7t.n('narrator_120_until_dawn', 'It screamed until almost dawn.', {pauseAfter: 0.45}),
	s7t.n('narrator_121_never_door', 'But it never came back to the door.', {fishTags: '[quietly, haunted]', pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 8. NINE - what Wyatt saw
// ---------------------------------------------------------------------------
const s8 = scene('nine', {emotion: 'afraid', intensity: 0.45, fearLevel: 3, fishTags: '[quietly, haunted]'});
const NINE: VoiceLine[] = [
	s8.n('narrator_122_sunrise', 'We walked out at sunrise.', {pauseAfter: 0.4}),
	s8.n('narrator_123_wouldnt_look', "Wyatt stayed behind to lock up. When he caught up with us, he was white as a sheet, and he wouldn't look at any of us.", {pauseAfter: 0.5}),
	s8.n('narrator_124_two_days', 'Two days later, he told me why.', {pauseAfter: 0.8}),
	s8.n('narrator_125_four_am', 'Around four that morning, he was fighting sleep in the chair by the door.', {pauseAfter: 0.45}),
	s8.n('narrator_126_bathroom', 'Then the bathroom door creaked open.', {pauseAfter: 0.7}),
	s8.n('narrator_127_lay_down', 'Someone stepped out, picked its way between the sleeping bodies, and lay down right next to me.', {pauseAfter: 0.45}),
	s8.n('narrator_128_closed_eyes', 'And closed its eyes.', {fishTags: '[quietly, haunted, clearly]', pauseAfter: 0.8}),
	s8.n('narrator_129_counted', 'Wyatt counted.', {pauseAfter: 0.6}),
	s8.n('narrator_130_eight', 'Eight of us in that trailer.', {pauseAfter: 0.6}),
	s8.n('narrator_131_nine', 'Nine on the floor.', COUNT),
	s8.n('narrator_132_didnt_scream', "He didn't scream. In a trailer that small, in the dark, he could have shot any one of us.", {pauseAfter: 0.5}),
	s8.n('narrator_133_pretending', 'So he sat there until morning, pretending to sleep, while every so often the thing beside me sat up, looked around at each of us... and shook with that silent laugh.', {pauseAfter: 0.8}),
	s8.n('narrator_134_window', 'When he went back to lock up, the bathroom window was wide open.', {pauseAfter: 0.4}),
	s8.n('narrator_135_no_screen', 'No screen.', BEAT),
	s8.n('narrator_136_never_break_in', 'It never had to break in.', {pauseAfter: 0.9}),
	s8.n('narrator_137_walked_out', 'And when we walked out of those woods, it walked out with us.', {pauseAfter: 0.5}),
	s8.n('narrator_138_back_of_line', "Right at the back of the line. All the way to Wyatt's house.", {pauseAfter: 0.5}),
	s8.n('narrator_139_eyes', 'Then it stopped, looked Wyatt dead in the eyes...', {pauseAfter: 0.6}),
	s8.n('narrator_140_trees', 'and stepped back into the trees.', {pauseAfter: 1.0}),
];

// ---------------------------------------------------------------------------
// 9. PLATES - present day
// ---------------------------------------------------------------------------
const s9 = scene('plates', {emotion: 'serious', intensity: 0.35, fearLevel: 2, fishTags: '[very quietly, calm]'});
const PLATES: VoiceLine[] = [
	s9.n('narrator_141_twelve_years', 'That was twelve years ago.', {pauseAfter: 0.5}),
	s9.n('narrator_142_chicago', 'I live in Chicago now. No woods. No trailers.', {pauseAfter: 0.5}),
	s9.n('narrator_143_six_friends', 'Last weekend, I had six friends over to watch the game.', {pauseAfter: 0.4}),
	s9.n('narrator_144_plates', 'I ordered pizza and set out the paper plates myself.', {pauseAfter: 0.5}),
	s9.n('narrator_145_cleaning', 'When the game ended, I started cleaning up.', {pauseAfter: 0.6}),
	s9.n('narrator_146_seven_couch', 'Seven of us on the couch.', {pauseAfter: 0.6}),
	s9.n('narrator_147_eight_plates', 'Eight greasy plates on the table.', {pauseAfter: 0.9}),
	s9.n('narrator_148_again', 'I counted again.', {fishTags: '[quietly, clearly]', pauseAfter: 0.6}),
	s9.n('narrator_149_eight', 'Eight.', COUNT),
	s9.n('narrator_150_bathroom', 'And from down the hall, behind the bathroom door I always keep shut...', {fishTags: '[whispering, frightened]', pauseAfter: 0.5}),
	s9.n('narrator_151_that_smell', 'came that smell.', {fishTags: '[quietly, frightened, clearly]', pauseAfter: 0.5}),
	s9.n('narrator_152_lightning', 'Like the air right before lightning.', {fishTags: '[whispering, frightened]', pauseAfter: 1.2}),
	s9.n('narrator_153_next_time', 'So the next time you eat with your friends...', {fishTags: '[quietly, close]', pauseAfter: 0.5}),
	s9.n('narrator_154_count_them', 'count them.', {fishTags: '[quietly, close]', pauseAfter: 0.7}),
	s9.n('narrator_155_count_plates', 'Then count the plates.', {fishTags: '[whispering, close]', pauseAfter: 0.8}),
];

export const VOICE_LINES: VoiceLine[] = [...TWELVE, ...WOODS, ...FACING_AWAY, ...GOATMAN, ...ONE_TOO_MANY, ...SEVEN, ...LET_ME_IN, ...NINE, ...PLATES];

export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
