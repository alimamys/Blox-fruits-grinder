// Every spoken line of "Never Open Your Door at 3:06 AM", in story order, word for word
// from SCRIPT.md (the full script is kept: no cuts).
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the
//    TTS engine reads (3:06 -> "three oh six", pauses as "...").
//  - pauseBefore / pauseAfter are deliberately NOT uniform: the script's one-word lines
//    ("Slow." "Heavy." "Uneven.") get longer holds so they land like footsteps.
//  - fearLevel: 1 unease, 2 dread, 3 controlled fear, 4 panic, 5 terror.
//  - 'narrator' = Sarah's voice-over (close, dry, no subtitle tag); 'sarah' = Sarah inside the
//    scene (lip-synced, tagged SARAH). Same Fish voice.
//  - Decisions: the landlord's text message is SHOWN on her phone, not read aloud. Scene 10
//    has no narration: its stage directions are pictures, the notebook / advert / clock are
//    drawn in code, and only the phone call is voiced. Sarah's two screams are voice takes
//    without subtitles.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	sarah: 'room',
	harris: 'door',
	creature: 'creature',
	landlord: 'room',
	caller: 'phone',
	womanBelow: 'distant',
	manBelow: 'distant',
	manThird: 'distant',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'afraid',
	sarah: 'afraid',
	harris: 'whispering',
	creature: 'unnaturally_calm',
	landlord: 'warm',
	caller: 'casual',
	womanBelow: 'distressed',
	manBelow: 'whispering',
	manThird: 'distressed',
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
	s: (id: string, text: string, o: Opts = {}) => line(s, 'sarah', id, text, o),
	h: (id: string, text: string, o: Opts = {}) => line(s, 'harris', id, text, o),
	c: (id: string, text: string, o: Opts = {}) => line(s, 'creature', id, text, o),
	l: (id: string, text: string, o: Opts = {}) => line(s, 'landlord', id, text, o),
	y: (id: string, text: string, o: Opts = {}) => line(s, 'caller', id, text, {volume: 0.8, ...o}),
	wb: (id: string, text: string, o: Opts = {}) => line(s, 'womanBelow', id, text, {volume: 0.75, ...o}),
	mb: (id: string, text: string, o: Opts = {}) => line(s, 'manBelow', id, text, {volume: 0.75, ...o}),
	m3: (id: string, text: string, o: Opts = {}) => line(s, 'manThird', id, text, {volume: 0.75, ...o}),
});

/** A one-word / fragment line that should land like a beat. */
const BEAT: Opts = {pauseAfter: 0.6};
const THREE_OH_SIX = 'three oh six';

// ---------------------------------------------------------------------------
// 1. THE DOORS (cold open) - quiet, frightened
// ---------------------------------------------------------------------------
const s1 = scene('doors', {emotion: 'afraid', intensity: 0.4, fearLevel: 3, fishTags: '[quietly, frightened]'});
const DOORS: VoiceLine[] = [
	s1.n('narrator_001_sleepwalking', 'I thought my neighbors were sleepwalking.', {pauseAfter: 0.5, direction: 'Quiet, close, almost a confession.'}),
	s1.n('narrator_002_exactly_306', 'It was exactly 3:06 in the morning when I heard every apartment door in my building open.', {
		spokenText: `It was exactly ${THREE_OH_SIX} in the morning... when I heard every apartment door in my building open.`,
		pauseAfter: 0.5,
	}),
	s1.n('narrator_003_not_one_or_two', 'Not one or two.', {pauseAfter: 0.45}),
	s1.n('narrator_004_all_of_them', 'All of them.', {pauseAfter: 0.8}),
	s1.n('narrator_005_peephole', "I looked through my peephole and saw something I'll never forget.", {pauseAfter: 0.5}),
	s1.n('narrator_006_every_neighbor', 'Every single neighbor was standing in the hallway.', {pauseAfter: 0.45}),
	s1.n('narrator_007_still', 'Completely still.', BEAT),
	s1.n('narrator_008_facing_stairs', 'Facing the staircase.', {pauseAfter: 0.6}),
	s1.n('narrator_009_nobody_talking', 'Nobody was talking. Nobody was moving.', {pauseAfter: 0.5}),
	s1.n('narrator_010_breathing', 'And none of them seemed to be breathing.', {pauseAfter: 0.9}),
	s1.n('narrator_011_coming_up', 'Then I heard something coming up the stairs.', {pauseAfter: 0.5}),
	s1.n('narrator_012_heavy', 'Something heavy.', BEAT),
	s1.n('narrator_013_dragging', 'Something dragging.', {fishTags: '[quietly, scared, clearly]', pauseAfter: 0.8}),
	s1.n('narrator_014_finally_saw', 'And when I finally saw what it was...', {pauseAfter: 0.55}),
	s1.n('narrator_015_so_afraid', 'I understood why everyone was so afraid.', {pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// 2. THE NEW APARTMENT - reflective, then unease
// ---------------------------------------------------------------------------
const s2 = scene('newApartment', {emotion: 'serious', intensity: 0.3, fearLevel: 1});
const s2n = scene('newApartment', {emotion: 'uneasy', intensity: 0.4, fearLevel: 2});
const NEW_APARTMENT: VoiceLine[] = [
	s2.n('narrator_016_moved_in', "I'd moved into the building three weeks earlier.", {pauseAfter: 0.4}),
	s2.n('narrator_017_old_building', 'It was an old, four-story apartment building on a quiet street.', {pauseAfter: 0.35}),
	s2.n('narrator_018_nothing_special', 'Nothing special.', {pauseAfter: 0.45}),
	s2.n('narrator_019_rent_cheap', 'But the rent was unbelievably cheap.', {pauseAfter: 0.55}),
	s2.n('narrator_020_previous_tenant', 'The landlord told me the previous tenant had moved out unexpectedly, and he wanted someone to take the apartment immediately.', {pauseAfter: 0.4}),
	s2.n('narrator_021_waived_deposit', 'He even waived the security deposit.', {pauseAfter: 0.45}),
	s2.n('narrator_022_lucky', "I thought I'd gotten lucky.", {pauseAfter: 0.65}),
	s2n.n('narrator_023_no_idea', 'I had no idea what happened to the woman who lived there before me.', {pauseAfter: 0.9}),
	s2n.n('narrator_024_clicking', 'That night, I was asleep when a strange clicking noise woke me.', {pauseAfter: 0.45}),
	s2n.n('narrator_025_checked_phone', 'I checked my phone.', {pauseAfter: 0.45}),
	s2n.n('narrator_026_306', '3:06 AM.', {spokenText: `${THREE_OH_SIX} A.M.`, pauseAfter: 0.8}),
	s2n.n('narrator_027_door_opening', 'Then I heard a door opening.', {pauseAfter: 0.45}),
	s2n.n('narrator_028_another', 'Followed by another.', BEAT),
	s2n.n('narrator_029_and_another', 'And another.', {pauseAfter: 0.7}),
	s2n.n('narrator_030_got_out_of_bed', 'I got out of bed and walked toward my front door.', {pauseAfter: 0.4}),
	s2n.n('narrator_031_mr_harris', 'When I looked through the peephole, I saw my elderly neighbor, Mr. Harris, standing directly across the hallway.', {pauseAfter: 0.45}),
	s2n.n('narrator_032_door_wide_open', 'His apartment door was wide open.', {pauseAfter: 0.4}),
	s2n.n('narrator_033_several_others', 'Behind him stood several other residents.', {pauseAfter: 0.4}),
	s2n.n('narrator_034_facing_stairs', 'All facing the stairs.', {pauseAfter: 0.6}),
	s2n.n('narrator_035_whispered', 'I whispered through the door.', {pauseAfter: 0.3}),
	s2.s('sarah_001_is_everything_okay', 'Mr. Harris? Is everything okay?', {emotion: 'whispering', fishTags: '[whispering, nervous]', audioEffect: 'room', pauseAfter: 0.7}),
	s2n.n('narrator_036_turned_eyes', 'He slowly turned his eyes toward my apartment.', {pauseAfter: 0.45}),
	s2n.n('narrator_037_pale', 'His face went pale.', {pauseAfter: 0.5}),
	s2n.n('narrator_038_finger_lips', 'Then he raised a trembling finger to his lips.', {pauseAfter: 0.5}),
	s2n.n('narrator_039_be_quiet', 'Telling me to be quiet.', {pauseAfter: 0.8}),
];

// ---------------------------------------------------------------------------
// 3. THE FOOTSTEPS
// ---------------------------------------------------------------------------
const s3 = scene('footsteps', {emotion: 'afraid', intensity: 0.45, fearLevel: 3});
const FOOTSTEPS: VoiceLine[] = [
	s3.n('narrator_040_footsteps', "That's when I heard the footsteps.", {pauseAfter: 0.5}),
	s3.n('narrator_041_downstairs', 'They were coming from downstairs.', {pauseAfter: 0.6}),
	s3.n('narrator_042_slow', 'Slow.', {pauseAfter: 0.7}),
	s3.n('narrator_043_heavy', 'Heavy.', {pauseAfter: 0.7}),
	s3.n('narrator_044_uneven', 'Uneven.', {pauseAfter: 0.8}),
	s3.n('narrator_045_one_step', 'One step.', {pauseAfter: 0.7}),
	s3.n('narrator_046_then_another', 'Then another.', {pauseAfter: 0.7}),
	s3.n('narrator_047_scraping', 'And after every few steps, there was a horrible scraping sound.', {pauseAfter: 0.45}),
	s3.n('narrator_048_dragging_concrete', 'Like someone dragging something heavy across concrete.', {pauseAfter: 0.6}),
	s3.n('narrator_049_ear_door', 'I pressed my ear against the door.', {pauseAfter: 0.5}),
	s3.n('narrator_050_stopped', 'The footsteps stopped.', {pauseAfter: 0.6}),
	s3.n('narrator_051_silence', 'For a few seconds, there was complete silence.', {pauseAfter: 0.4}),
	s3.n('narrator_052_womans_voice', "Then I heard a woman's voice from somewhere below.", {pauseAfter: 0.3}),
	s3.wb('woman_001_dont_take_him', "Please... please don't take him.", {fishTags: '[crying, begging]', pauseAfter: 0.5}),
	s3.n('narrator_053_man_whispering', 'A man started whispering frantically.', {pauseAfter: 0.3}),
	s3.mb('man_001_dont_look', "Don't look at it. Just don't look.", {fishTags: '[whispering frantically, terrified]', pauseAfter: 0.6}),
	s3.n('narrator_054_scream', 'Then came a scream.', {pauseAfter: 0.4}),
	s3.n('narrator_055_terrible', 'A terrible, desperate scream.', {pauseAfter: 0.45}),
	s3.n('narrator_056_few_seconds', 'It lasted only a few seconds.', {pauseAfter: 0.4}),
	s3.n('narrator_057_stopped', 'Suddenly, it stopped.', {pauseAfter: 0.8}),
	s3.n('narrator_058_dragging_floor', 'I heard something dragging across the floor.', {pauseAfter: 0.45}),
	s3.n('narrator_059_door_closing', 'Then the sound of a door closing.', {pauseAfter: 0.6}),
	s3.n('narrator_060_started_again', 'And the footsteps started again.', {pauseAfter: 0.5}),
	s3.n('narrator_061_closer', 'This time, they were closer.', {pauseAfter: 0.5}),
	s3.n('narrator_062_coming_upstairs', 'Whatever was down there was coming upstairs.', {emotion: 'terrified', pauseAfter: 0.8}),
];

// ---------------------------------------------------------------------------
// 4. THE NEIGHBORS
// ---------------------------------------------------------------------------
const s4 = scene('neighbors', {emotion: 'afraid', intensity: 0.4, fearLevel: 3});
const NEIGHBORS: VoiceLine[] = [
	s4.n('narrator_063_peephole_again', 'I looked through the peephole again.', {pauseAfter: 0.45}),
	s4.n('narrator_064_same_positions', 'My neighbors were still standing in the exact same positions.', {pauseAfter: 0.45}),
	s4.n('narrator_065_mother', 'A mother was holding her little boy against her chest.', {pauseAfter: 0.4}),
	s4.n('narrator_066_crying_silently', 'The boy was crying silently.', {pauseAfter: 0.45}),
	s4.n('narrator_067_covered_mouth', 'When he tried to speak, she immediately covered his mouth.', {pauseAfter: 0.5}),
	s4.n('narrator_068_old_man', 'An old man near the staircase was shaking so badly that he could barely stand.', {pauseAfter: 0.5}),
	s4.n('narrator_069_nobody_moved', 'But nobody moved.', {pauseAfter: 0.45}),
	s4.n('narrator_070_nobody_escape', 'Nobody tried to escape.', {pauseAfter: 0.7}),
	s4.n('narrator_071_occurred', "That's when something occurred to me.", {pauseAfter: 0.45}),
	s4.n('narrator_072_not_surprised', "They weren't surprised by any of this.", {pauseAfter: 0.45}),
	s4.n('narrator_073_expecting', 'They were expecting it.', {pauseAfter: 0.6}),
	s4.n('narrator_074_knew_exactly', 'Whatever was coming up those stairs, every person in that hallway knew exactly what it was.', {pauseAfter: 0.45}),
	s4.n('narrator_075_except_me', 'Except me.', {pauseAfter: 0.9}),
	s4.n('narrator_076_called_police', 'I grabbed my phone and called the police.', {pauseAfter: 0.5}),
	s4.n('narrator_077_no_signal', 'No signal.', {...BEAT, fishTags: '[quietly, clearly]'}),
	s4.n('narrator_078_tried_again', 'I tried again.', {pauseAfter: 0.5}),
	s4.n('narrator_079_nothing', 'Nothing.', BEAT),
	s4.n('narrator_080_wifi', 'My Wi-Fi was gone too.', {spokenText: 'My wifi was gone too.', pauseAfter: 0.7}),
	s4.n('narrator_081_three_knocks', 'Then there were three very soft knocks on my door.', {pauseAfter: 0.6}),
	s4.n('narrator_082_froze', 'I froze.', {pauseAfter: 0.7}),
	s4.h('harris_001_its_me', "Sarah. It's me. Open the door just a little.", {fishTags: '[whispering, scared]', pauseAfter: 0.6}),
	s4.n('narrator_083_hesitated', 'I hesitated.', {pauseAfter: 0.6}),
	s4.n('narrator_084_chain', 'Then I unlocked the chain and opened it barely an inch.', {pauseAfter: 0.5}),
	s4.n('narrator_085_trembling', 'Mr. Harris was trembling.', {pauseAfter: 0.4}),
	s4.s('sarah_002_whats_happening', "What's happening? What was that scream?", {emotion: 'whispering', fishTags: '[whispering, frightened]', pauseAfter: 0.5}),
	s4.n('narrator_086_looked_staircase', 'He looked toward the staircase.', {pauseAfter: 0.45}),
	s4.h('harris_002_listen_carefully', "Listen carefully. Whatever you do, don't make a sound when it reaches this floor.", {fishTags: '[whispering, urgent]', audioEffect: 'doorGap', pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// 5. THE RULE - a whispered conversation through the gap in the door
// ---------------------------------------------------------------------------
const s5 = scene('rule', {emotion: 'afraid', intensity: 0.45, fearLevel: 3});
const G: Opts = {audioEffect: 'doorGap'};
const SW: Opts = {emotion: 'whispering', fishTags: '[whispering, frightened]'};
const RULE: VoiceLine[] = [
	s5.s('sarah_003_what_reaches', 'What reaches this floor?', {...SW, pauseAfter: 0.4}),
	s5.h('harris_003_once_every_month', 'It comes once every month. Always at 3:06.', {
		...G,
		spokenText: `It comes once every month. Always at ${THREE_OH_SIX}.`,
		fishTags: '[whispering]',
		pauseAfter: 0.45,
	}),
	s5.s('sarah_004_what_does', 'What does?', {...SW, pauseAfter: 0.45}),
	s5.n('narrator_087_swallowed', 'He swallowed.', {pauseAfter: 0.45}),
	s5.h('harris_004_dont_know', "We don't know what it is. We only know what it wants.", {...G, fishTags: '[whispering, scared]', pauseAfter: 0.45}),
	s5.s('sarah_005_what_does_it_want', 'What does it want?', {...SW, pauseAfter: 0.4}),
	s5.n('narrator_088_stared', 'He stared at me.', {pauseAfter: 0.5}),
	s5.h('harris_005_one_person', 'One person.', {...G, fishTags: '[whispering]', pauseAfter: 0.6}),
	s5.s('sarah_006_what', 'What?', {...SW, pauseAfter: 0.4}),
	s5.h('harris_006_every_floor', "One person from every floor. That's the agreement.", {...G, fishTags: '[whispering]', pauseAfter: 0.5}),
	s5.n('narrator_089_laughed', 'I laughed nervously.', {pauseAfter: 0.3}),
	s5.s('sarah_007_what_agreement', 'What agreement? What are you talking about?', {emotion: 'uneasy', fishTags: '[nervous laugh, whispering]', pauseAfter: 0.45}),
	s5.h('harris_007_leaves_others', 'If we give it one person, it leaves the others alone.', {...G, fishTags: '[whispering]', pauseAfter: 0.45}),
	s5.s('sarah_008_if_you_dont', "And if you don't?", {...SW, pauseAfter: 0.5}),
	s5.n('narrator_090_eyes_filled', 'His eyes filled with tears.', {pauseAfter: 0.45}),
	s5.h('harris_008_last_time', 'The last time someone refused, it took everyone on that floor.', {...G, fishTags: '[whispering, voice breaking]', pauseAfter: 0.7}),
	s5.n('narrator_091_stepped_backward', 'I stepped backward.', {pauseAfter: 0.4}),
	s5.s('sarah_009_holding_breath', 'Why is everyone holding their breath?', {...SW, pauseAfter: 0.4}),
	s5.h('harris_009_hears_breathing', 'It hears breathing. Loud breathing, crying, screaming. Those things attract it. We stay quiet until it has taken its offering.', {
		...G,
		fishTags: '[whispering, urgent]',
		pauseAfter: 0.6,
	}),
	s5.n('narrator_092_heavy_thud', 'A heavy thud echoed from downstairs.', {pauseAfter: 0.4}),
	s5.n('narrator_093_flinched', 'Mr. Harris flinched.', {pauseAfter: 0.4}),
	s5.h('harris_010_stay_calm', 'Please, Sarah. Whatever happens, stay calm.', {...G, fishTags: '[whispering, pleading]', pauseAfter: 0.6}),
	s5.n('narrator_094_stepped_away', 'He stepped away from the door.', {pauseAfter: 0.4}),
	s5.n('narrator_095_turned_lock', 'I closed it and turned the lock.', {pauseAfter: 0.5}),
	s5.n('narrator_096_hands_shaking', 'My hands were shaking.', {emotion: 'shaking', pauseAfter: 0.5}),
	s5.n('narrator_097_lost_his_mind', 'I wanted to believe the old man had lost his mind.', {pauseAfter: 0.5}),
	s5.n('narrator_098_another_scream', 'But another scream came from downstairs.', {pauseAfter: 0.5}),
	s5.n('narrator_099_wet_dragging', 'Then a long, wet dragging sound.', {pauseAfter: 0.6}),
	s5.n('narrator_100_truth', 'And I knew he was telling the truth.', {pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 6. THE CREATURE - terror held under the breath
// ---------------------------------------------------------------------------
const s6 = scene('creature', {emotion: 'terrified', intensity: 0.5, fearLevel: 4, fishTags: '[terrified, quietly]'});
const CREATURE: VoiceLine[] = [
	s6.n('narrator_101_back_to_peephole', 'I went back to the peephole.', {pauseAfter: 0.45}),
	s6.n('narrator_102_flickering', 'The lights above the staircase began flickering.', {pauseAfter: 0.5}),
	s6.n('narrator_103_moving_darkness', 'Then I saw something moving in the darkness.', {pauseAfter: 0.6}),
	s6.n('narrator_104_mans_hand', "At first, it looked like a man's hand gripping the railing.", {pauseAfter: 0.45}),
	s6.n('narrator_105_too_long', 'Except the fingers were too long.', {pauseAfter: 0.5}),
	s6.n('narrator_106_curled', 'They slowly curled around the metal.', {pauseAfter: 0.7}),
	s6.n('narrator_107_head_appeared', 'Then a head appeared.', {pauseAfter: 0.6}),
	s6.n('narrator_108_bent_forward', 'It was bent forward at an impossible angle.', {pauseAfter: 0.5}),
	s6.n('narrator_109_seven_feet', 'The thing had to be nearly seven feet tall.', {pauseAfter: 0.45}),
	s6.n('narrator_110_shoulders_scraped', 'Its shoulders scraped against the walls as it climbed.', {pauseAfter: 0.45}),
	s6.n('narrator_111_arms_low', 'Its arms hung so low that its fingers almost touched the steps.', {pauseAfter: 0.6}),
	s6.n('narrator_112_behind_it', 'And behind it...', {pauseAfter: 0.55}),
	s6.n('narrator_113_sack', 'It was dragging a large, stained sack.', {pauseAfter: 0.6}),
	s6.n('narrator_114_sack_moved', 'Something inside the sack moved.', {pauseAfter: 0.8}),
	s6.n('narrator_115_covered_mouth', 'I covered my mouth.', {pauseAfter: 0.6}),
	s6.n('narrator_116_another_step', 'The creature climbed another step.', {pauseAfter: 0.5}),
	s6.n('narrator_117_then_another', 'Then another.', BEAT),
	s6.n('narrator_118_grey_skin', 'Its skin looked grey and stretched tightly over its bones.', {pauseAfter: 0.45}),
	s6.n('narrator_119_mouth_open', 'Its mouth hung open.', {pauseAfter: 0.45}),
	s6.n('narrator_120_too_wide', 'Far too wide for a human face.', {pauseAfter: 0.8}),
	s6.n('narrator_121_third_floor', 'It stopped at the third-floor landing.', {pauseAfter: 0.45}),
	s6.n('narrator_122_begging', 'A man began begging.', {pauseAfter: 0.3}),
	s6.m3('man3_001_children', 'Please! I have children!', {fishTags: '[begging, crying, desperate]', pauseAfter: 0.5}),
	s6.n('narrator_123_sharp_cry', 'There was a sharp cry.', {pauseAfter: 0.5}),
	s6.n('narrator_124_silence', 'Then silence.', {pauseAfter: 0.9}),
	s6.n('narrator_125_sack_scraped', 'The sack scraped across the concrete again.', {pauseAfter: 0.45}),
	s6.n('narrator_126_continued', 'The creature continued climbing.', {pauseAfter: 0.45}),
	s6.n('narrator_127_fourth_floor', 'Toward the fourth floor.', {pauseAfter: 0.6}),
	s6.n('narrator_128_toward_me', 'Toward me.', {fishTags: '[terrified, whispering]', pauseAfter: 1.0}),
];

// ---------------------------------------------------------------------------
// 7. THE REALIZATION
// ---------------------------------------------------------------------------
const s7 = scene('realization', {emotion: 'terrified', intensity: 0.5, fearLevel: 4});
const REALIZATION: VoiceLine[] = [
	s7.n('narrator_129_backed_away', 'I backed away from my door.', {pauseAfter: 0.4}),
	s7.n('narrator_130_heart_pounding', 'My heart was pounding so hard that I could barely hear anything else.', {emotion: 'breathless', pauseAfter: 0.45}),
	s7.n('narrator_131_sofa', 'I started dragging my sofa toward the entrance.', {pauseAfter: 0.5}),
	s7.n('narrator_132_thought', 'Then a thought crossed my mind.', {emotion: 'afraid', pauseAfter: 0.5}),
	s7.n('narrator_133_every_floor', 'If the creature took one person from every floor...', {emotion: 'afraid', pauseAfter: 0.5}),
	s7.n('narrator_134_from_mine', 'Who was it supposed to take from mine?', {emotion: 'afraid', pauseAfter: 1.0}),
	s7.n('narrator_135_peephole_again', 'I looked through the peephole again.', {pauseAfter: 0.45}),
	s7.n('narrator_136_changed', 'Something had changed.', {pauseAfter: 0.6}),
	s7.n('narrator_137_not_facing', "My neighbors weren't facing the staircase anymore.", {pauseAfter: 0.5}),
	s7.n('narrator_138_facing_mine', 'They were facing my apartment.', {pauseAfter: 0.7}),
	s7.n('narrator_139_every_one', 'Every single one of them.', {pauseAfter: 0.8}),
	s7.n('narrator_140_tears', 'Mr. Harris stood in the middle of the hallway with tears streaming down his cheeks.', {pauseAfter: 0.45}),
	s7.n('narrator_141_wouldnt_look', "The woman with the child wouldn't look at me.", {pauseAfter: 0.7}),
	s7.n('narrator_142_landlord', 'I suddenly remembered the landlord.', {pauseAfter: 0.5}),
	s7.n('narrator_143_cheap_rent', 'The cheap rent.', {pauseAfter: 0.5}),
	s7.n('narrator_144_waived', 'The waived deposit.', {fishTags: '[quietly, clearly]', pauseAfter: 0.5}),
	s7.n('narrator_145_how_quickly', "How quickly he'd wanted me to move in.", {pauseAfter: 0.7}),
	s7.n('narrator_146_grabbed_phone', 'I grabbed my phone.', {pauseAfter: 0.45}),
	s7.n('narrator_147_one_message', 'There was one message.', {pauseAfter: 0.45}),
	s7.n('narrator_148_from_landlord', 'From my landlord.', {pauseAfter: 0.4}),
	s7.n('narrator_149_stared', 'I stared at those words.', {pauseAfter: 0.6}),
	s7.n('narrator_150_sense', 'And everything finally made sense.', {pauseAfter: 0.6}),
	s7.n('narrator_151_not_randomly', "The creature didn't randomly choose someone.", {pauseAfter: 0.5}),
	s7.n('narrator_152_residents_chose', 'The residents chose.', {pauseAfter: 0.7}),
	s7.n('narrator_153_chosen_me', 'And they had chosen me.', {fishTags: '[voice breaking, terrified]', pauseAfter: 1.1}),
];

// ---------------------------------------------------------------------------
// 8. THE OFFERING - panic
// ---------------------------------------------------------------------------
const s8 = scene('offering', {emotion: 'panicked', intensity: 0.55, fearLevel: 4});
const OFFERING: VoiceLine[] = [
	s8.n('narrator_154_pushed_sofa', 'I pushed the sofa against the door.', {pauseAfter: 0.35}),
	s8.n('narrator_155_dining_table', 'Then the dining table.', {pauseAfter: 0.4}),
	s8.n('narrator_156_pulled_handle', 'I pulled as hard as I could on the handle to make sure it was locked.', {pauseAfter: 0.5}),
	s8.n('narrator_157_footsteps_stopped', 'Outside, the footsteps stopped.', {emotion: 'terrified', pauseAfter: 0.5}),
	s8.n('narrator_158_silent', 'The entire hallway went silent.', {emotion: 'terrified', pauseAfter: 0.8}),
	s8.n('narrator_159_blood_cold', 'Then I heard something that made my blood run cold.', {emotion: 'terrified', pauseAfter: 0.6}),
	s8.n('narrator_160_a_key', 'A key.', {emotion: 'terrified', pauseAfter: 0.6}),
	s8.n('narrator_161_sliding', 'Sliding into my lock.', {emotion: 'terrified', pauseAfter: 0.5}),
	s8.s('sarah_010_no_please', 'No. No, please!', {emotion: 'panicked', fishTags: '[panicked, breathless]', pauseAfter: 0.4}),
	s8.n('narrator_162_lock_turned', 'The lock turned.', {pauseAfter: 0.4}),
	s8.n('narrator_163_door_opening', 'The door began opening.', {pauseAfter: 0.35}),
	s8.n('narrator_164_furniture_scraped', 'The furniture scraped across the floor.', {pauseAfter: 0.35}),
	s8.n('narrator_165_pushed', 'I pushed against it with everything I had.', {pauseAfter: 0.3}),
	s8.s('sarah_011_stop_please', 'STOP! PLEASE!', {emotion: 'screaming', fishTags: '[screaming, desperate]', audioEffect: 'shout', pauseAfter: 0.4}),
	s8.n('narrator_166_continued_opening', 'But the door continued opening.', {pauseAfter: 0.45}),
	s8.n('narrator_167_saw_harris', 'Through the gap, I saw Mr. Harris.', {pauseAfter: 0.45}),
	s8.n('narrator_168_master_key', 'He was holding a master key.', {pauseAfter: 0.6}),
	s8.n('narrator_169_behind_him', 'Behind him stood the creature.', {emotion: 'terrified', pauseAfter: 0.6}),
	s8.n('narrator_170_head_sideways', 'Its head was bent sideways, almost touching its own shoulder.', {emotion: 'terrified', pauseAfter: 0.5}),
	s8.n('narrator_171_mouth_opened', 'Its mouth slowly opened.', {emotion: 'terrified', pauseAfter: 0.5}),
	s8.n('narrator_172_spoke', 'And for the first time, it spoke.', {emotion: 'terrified', pauseAfter: 0.6}),
	s8.c('creature_001_promised', 'You promised me one.', {fishTags: '[slow, deep, broken, menacing]', pace: 0.85, pauseAfter: 0.8}),
	s8.n('narrator_173_harris_crying', 'Mr. Harris began crying.', {pauseAfter: 0.4}),
	s8.s('sarah_012_dont_do_this', "Mr. Harris, please! Don't do this!", {emotion: 'panicked', fishTags: '[crying, begging, panicked]', audioEffect: 'shout', pauseAfter: 0.45}),
	s8.n('narrator_174_couldnt_look', "He couldn't look at me.", {pauseAfter: 0.5}),
	s8.h('harris_011_shes_yours', "She's yours.", {fishTags: '[whispering, crying]', audioEffect: 'doorGap', pauseAfter: 0.9}),
	s8.n('narrator_175_bent_down', 'The creature bent down.', {emotion: 'terrified', pauseAfter: 0.4}),
	s8.n('narrator_176_arm_reached', 'Its impossibly long arm reached through the doorway.', {emotion: 'terrified', pauseAfter: 0.4}),
	s8.n('narrator_177_screamed', 'I screamed.', {emotion: 'terrified', pauseAfter: 0.1}),
	s8.s('sarah_013_scream', 'Aaah!', {emotion: 'screaming', fishTags: '[screaming]', audioEffect: 'shout', noSubtitle: true, spokenText: 'Aaaaaah!', pauseAfter: 0.3}),
	s8.n('narrator_178_ran', 'And ran.', {emotion: 'panicked', pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// 9. THE STAIRCASE - terror
// ---------------------------------------------------------------------------
const s9 = scene('staircase', {emotion: 'terrified', intensity: 0.6, fearLevel: 5, fishTags: '[terrified, breathless]'});
const STAIRCASE: VoiceLine[] = [
	s9.n('narrator_179_almost_bedroom', 'I almost reached my bedroom.', {pauseAfter: 0.35}),
	s9.n('narrator_180_ankle', 'Then something wrapped around my ankle.', {pauseAfter: 0.45}),
	s9.n('narrator_181_ice_cold', 'The grip was ice cold.', {pauseAfter: 0.45}),
	s9.n('narrator_182_fell', 'I fell so hard that the air left my lungs.', {pauseAfter: 0.4}),
	s9.n('narrator_183_carpet', 'I grabbed the edge of the carpet.', {pauseAfter: 0.35}),
	s9.n('narrator_184_pulling', 'The creature began pulling me backward.', {pauseAfter: 0.35}),
	s9.n('narrator_185_fingernails', 'My fingernails scraped across the floor.', {pauseAfter: 0.4}),
	s9.n('narrator_186_doorframe', 'I grabbed the doorframe.', {fishTags: '[scared, clearly]', pauseAfter: 0.4}),
	s9.n('narrator_187_hold_on', 'For one second, I thought I could hold on.', {pauseAfter: 0.5}),
	s9.n('narrator_188_harder', 'Then it pulled harder.', {pauseAfter: 0.4}),
	s9.n('narrator_189_corridor', 'I was dragged out into the corridor.', {pauseAfter: 0.4}),
	s9.n('narrator_190_watching', 'Every neighbor was watching.', {pauseAfter: 0.4}),
	s9.s('sarah_014_help_me', 'HELP ME! SOMEBODY HELP ME!', {emotion: 'screaming', fishTags: '[screaming, desperate]', audioEffect: 'shout', pauseAfter: 0.5}),
	s9.n('narrator_191_nobody_moved', 'Nobody moved.', {pauseAfter: 0.5}),
	s9.n('narrator_192_mother_held', 'The mother held her child against her chest.', {pauseAfter: 0.4}),
	s9.n('narrator_193_old_man_floor', 'The old man stared at the floor.', {pauseAfter: 0.5}),
	s9.n('narrator_194_reached_harris', 'I reached toward Mr. Harris.', {pauseAfter: 0.3}),
	s9.s('sarah_015_you_can_stop', 'Please! You can stop this!', {emotion: 'panicked', fishTags: '[crying, begging]', audioEffect: 'shout', pauseAfter: 0.5}),
	s9.n('narrator_195_looked_at_me', 'He looked at me.', {pauseAfter: 0.5}),
	s9.n('narrator_196_might_help', 'And for one moment, I thought he might actually help.', {pauseAfter: 0.7}),
	s9.h('harris_012_im_sorry', "I'm sorry.", {fishTags: '[crying, whispering]', audioEffect: 'room', pauseAfter: 0.7}),
	s9.n('narrator_197_stepped_aside', 'Then he stepped aside.', {pauseAfter: 0.6}),
	s9.n('narrator_198_toward_stairs', 'The creature dragged me toward the stairs.', {pauseAfter: 0.4}),
	s9.n('narrator_199_sack_behind', 'I could hear the sack scraping behind it.', {pauseAfter: 0.4}),
	s9.n('narrator_200_still_moving', 'Something inside was still moving.', {pauseAfter: 0.5}),
	s9.n('narrator_201_railing', 'I tried to grab the railing.', {pauseAfter: 0.35}),
	s9.n('narrator_202_tightened', 'But its fingers tightened around my ankle.', {pauseAfter: 0.4}),
	s9.s('sarah_016_dont_want_to_die', "Please... I don't want to die...", {emotion: 'grieving', fishTags: '[crying, sobbing]', pauseAfter: 0.6}),
	s9.n('narrator_203_first_step', 'It pulled me down the first step.', {pauseAfter: 0.45}),
	s9.n('narrator_204_another', 'Then another.', {pauseAfter: 0.55}),
	s9.n('narrator_205_looked_back', 'I looked back.', {pauseAfter: 0.45}),
	s9.n('narrator_206_still_standing', 'My neighbors were still standing in the hallway.', {pauseAfter: 0.45}),
	s9.n('narrator_207_watching', 'Watching.', {pauseAfter: 0.6}),
	s9.n('narrator_208_not_a_word', 'Not one of them said a word.', {pauseAfter: 0.7}),
	s9.n('narrator_209_closing_doors', 'Then, slowly, they began closing their doors.', {pauseAfter: 0.5}),
	s9.n('narrator_210_one_by_one', 'One by one.', {pauseAfter: 0.8}),
	s9.n('narrator_211_my_screams', 'Until the only sounds left were my screams...', {pauseAfter: 0.5}),
	s9.n('narrator_212_dragging_down', 'And the thing dragging me down the staircase.', {pauseAfter: 0.4}),
	s9.s('sarah_017_screams_fade', 'Aaah!', {emotion: 'screaming', fishTags: '[screaming, far away]', audioEffect: 'distant', noSubtitle: true, spokenText: 'Aaaaaaah! Nooo!', volume: 0.7, pauseAfter: 0.4}),
];

// ---------------------------------------------------------------------------
// 10. THE NEXT TENANT - no narration; only the phone call is voiced
// ---------------------------------------------------------------------------
const s10 = scene('nextTenant', {});
const NEXT_TENANT: VoiceLine[] = [
	s10.y('caller_001_still_available', "Hi! I'm calling about the apartment. Is it still available?", {fishTags: '[cheerful]', pauseAfter: 0.35}),
	s10.l('landlord_001_of_course', 'Of course it is.', {fishTags: '[friendly, warm]', pauseAfter: 0.4}),
	s10.y('caller_002_too_good', 'The rent seems almost too good to be true.', {fishTags: '[cheerful, curious]', pauseAfter: 0.5}),
	s10.l('landlord_002_lovely_place', "Oh, don't worry. It's a lovely place.", {fishTags: '[friendly, reassuring]', pauseAfter: 0.4}),
	s10.y('caller_003_neighbors', 'And how are the neighbors?', {fishTags: '[cheerful]', pauseAfter: 0.7}),
	s10.l('landlord_003_very_friendly', 'Very friendly. Everyone looks after each other here.', {fishTags: '[friendly, warm]', pauseAfter: 0.4}),
	s10.y('caller_004_noisy', "That's wonderful! Is the building noisy?", {fishTags: '[cheerful]', pauseAfter: 0.7}),
	s10.l('landlord_004_not_at_all', 'Not at all.', {fishTags: '[friendly, calm]', pauseAfter: 0.9}),
	s10.l('landlord_005_quiet_building', "It's a very quiet building.", {fishTags: '[softly, calm, slightly sinister]', pace: 0.92, pauseAfter: 0.6}),
];

export const VOICE_LINES: VoiceLine[] = [
	...DOORS,
	...NEW_APARTMENT,
	...FOOTSTEPS,
	...NEIGHBORS,
	...RULE,
	...CREATURE,
	...REALIZATION,
	...OFFERING,
	...STAIRCASE,
	...NEXT_TENANT,
];

export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
