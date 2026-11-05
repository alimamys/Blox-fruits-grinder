// Every spoken line in "The 63rd Passenger", in story order.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script; `spokenText` (optional) is what the TTS engine reads
//    (numbers spelled out, pauses written as "..." etc).
//  - pauseBefore / pauseAfter are deliberately NOT uniform. Normal sentences get
//    0.2-0.5 s, reveals 0.75-1.5 s, big suspense moments use timeline beats.
//  - fearLevel follows the escalation plan: 1 confusion, 2 unease, 3 controlled
//    fear, 4 panic, 5 terror.
//  - The narrator never reads a line of dialogue: whenever a character speaks, the
//    character's own voice is used.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	daniel: 'room',
	emma: 'room',
	oldWoman: 'none',
	captain: 'room',
	crew1: 'room',
	crew2: 'room',
	harbor: 'marineRadio',
	pa: 'pa',
	police: 'room',
	crowd: 'crowdRoom',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'serious',
	daniel: 'casual',
	emma: 'casual',
	oldWoman: 'unnaturally_calm',
	captain: 'authoritative',
	crew1: 'professional',
	crew2: 'professional',
	harbor: 'professional',
	pa: 'professional',
	police: 'professional',
	crowd: 'confused',
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
});

const scene = (s: string) => ({
	n: (id: string, text: string, o: Opts = {}) => line(s, 'narrator', id, text, o),
	c: (character: CharacterId, id: string, text: string, o: Opts = {}) => line(s, character, id, text, o),
});

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------
const h = scene('hook');
const HOOK: VoiceLine[] = [
	h.n('narrator_001_hook', 'At 12:17 in the morning, the crew of the North Star ferry counted the passengers for the third time.', {
		spokenText: 'At twelve seventeen in the morning, the crew of the North Star ferry counted the passengers... for the third time.',
		emotion: 'serious',
		pace: 0.98,
		pauseAfter: 0.55,
		direction: 'Calm, close, conversational. A storyteller leaning in, not a trailer voice.',
	}),
	h.n('narrator_002_sixty_three', 'Sixty-three.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 1.1, direction: 'Subtle weight on the number. Do not punch it.'}),
	h.n('narrator_003_manifest', 'The captain looked at the manifest.', {pauseAfter: 0.3}),
	h.n('narrator_004_sixty_two_names', 'Sixty-two names.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.9}),
	h.n('narrator_005_counted_again', 'He counted again.', {pauseAfter: 0.4}),
	h.n('narrator_006_sixty_three_people', 'Sixty-three people.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.8}),
	h.n('narrator_007_nobody_boarded', 'Nobody had boarded since departure. Nobody had fallen overboard.', {pauseAfter: 0.45}),
	h.n('narrator_008_one_conclusion', 'There was only one conclusion.', {pace: 0.95, pauseAfter: 0.6}),
	h.n('narrator_009_someone', "Someone on the ferry... wasn't supposed to be there.", {
		emotion: 'uneasy',
		intensity: 0.45,
		pace: 0.88,
		volume: 0.86,
		pauseAfter: 1.3,
		direction: 'Lower the voice slightly on the second half. Restraint. Do not shout.',
	}),
	h.n('narrator_010_found_her', 'They found her sitting alone at the very back.', {pauseAfter: 0.45}),
	h.n('narrator_011_old_woman', 'An old woman. Black coat. Hands folded in her lap. Staring out at the ocean.', {
		pace: 0.9,
		pauseAfter: 0.75,
		direction: 'Each fragment its own small picture. Unhurried.',
	}),
	h.n('narrator_012_approached', 'A crew member approached her.', {pauseAfter: 0.3}),
	h.c('crew1', 'crew_001_ticket', "Ma'am, can I see your ticket?", {
		emotion: 'professional',
		intensity: 0.3,
		pauseAfter: 0.55,
		fearLevel: 0,
		direction: 'Normal customer-service voice, a little tired. End of a long shift.',
	}),
	h.n('narrator_013_didnt_move', "She didn't move.", {pauseAfter: 0.7}),
	h.c('crew1', 'crew_002_maam', "Ma'am?", {emotion: 'uneasy', intensity: 0.35, pace: 0.95, pauseAfter: 0.9, fearLevel: 1, direction: 'Slight uncertainty.'}),
	h.n('narrator_014_turned', 'Slowly... the woman turned around.', {pace: 0.88, pauseAfter: 0.6}),
	h.n('narrator_015_pale', 'Her face was pale. Her eyes looked almost gray.', {pace: 0.93, pauseAfter: 0.5}),
	h.n('narrator_016_smiled', 'She smiled. And said:', {pace: 0.95, pauseAfter: 0.45}),
	h.c('oldWoman', 'oldwoman_001_not_passenger', "I'm not a passenger.", {
		emotion: 'matter_of_fact',
		intensity: 0.3,
		pauseAfter: 0.95,
		direction: 'Matter-of-fact. Mild. Like correcting a small misunderstanding.',
	}),
	h.n('narrator_017_swallowed', 'The crew member swallowed.', {pauseAfter: 0.3}),
	h.c('crew1', 'crew_003_why', 'Then why are you on the ferry?', {
		emotion: 'uneasy',
		intensity: 0.45,
		pauseAfter: 0.55,
		fearLevel: 2,
		breath: 'shakyInhale',
		direction: 'Now uncomfortable. Trying to stay polite.',
	}),
	h.n('narrator_018_looked_past', 'The woman looked past him... toward the people inside.', {pace: 0.93, pauseAfter: 0.55}),
	h.c('oldWoman', 'oldwoman_002_waiting', "I'm waiting for someone.", {
		spokenText: "I'm waiting for... someone.",
		emotion: 'unnaturally_calm',
		intensity: 0.35,
		pace: 0.97,
		pauseAfter: 0.7,
		direction: 'Tiny pause before "someone". Warm, patient.',
	}),
	h.c('crew1', 'crew_004_who', 'Who?', {emotion: 'uneasy', intensity: 0.4, pauseAfter: 1.0, fearLevel: 2}),
	h.n('narrator_019_smile_gone', 'Her smile disappeared.', {pace: 0.95, pauseAfter: 0.55}),
	h.c('oldWoman', 'oldwoman_003_passenger37', 'Passenger thirty-seven.', {
		emotion: 'neutral',
		intensity: 0.25,
		pauseAfter: 1.0,
		direction: 'Neutral. No menace. A fact.',
	}),
	h.n('narrator_020_checked', 'The crew member checked the manifest.', {pauseAfter: 0.3}),
	h.n('narrator_021_daniel_clarke', 'Passenger 37. Daniel Clarke. Seat 18B.', {
		spokenText: 'Passenger thirty-seven. Daniel Clarke. Seat eighteen B.',
		pace: 0.95,
		pauseAfter: 0.5,
	}),
	h.n('narrator_022_alive', 'Alive. Thirty-two years old. Traveling with his wife.', {pace: 0.95, pauseAfter: 0.6}),
	h.n('narrator_023_looked_back', 'The crew member looked back at the old woman. She was still smiling.', {pauseAfter: 0.55}),
	h.n('narrator_024_then_she_said', 'Then she said:', {pace: 0.92, pauseAfter: 0.55}),
	h.c('oldWoman', 'oldwoman_004_shouldnt', "He shouldn't have come back.", {
		emotion: 'unnaturally_calm',
		intensity: 0.3,
		pace: 0.95,
		volume: 0.82,
		pauseAfter: 1.25,
		direction: 'Very quiet. Almost to herself. A little sad.',
	}),
];

// ---------------------------------------------------------------------------
// EARLIER THAT NIGHT (departure + first count)
// ---------------------------------------------------------------------------
const d = scene('departure');
const DEPARTURE: VoiceLine[] = [
	d.n('narrator_025_left', 'The North Star left Bell Island at 11:28 PM.', {
		spokenText: 'The North Star left Bell Island at eleven twenty-eight P.M.',
		emotion: 'neutral',
		pace: 1.0,
		pauseAfter: 0.35,
		direction: 'Lighter. Plain exposition, conversational.',
	}),
	d.n('narrator_026_last_ferry', 'It was the last ferry of the night.', {emotion: 'neutral', pauseAfter: 0.45}),
	d.n('narrator_027_counts', 'Sixty-two passengers. Six crew.', {emotion: 'neutral', pauseAfter: 0.4}),
	d.n('narrator_028_weather', 'Weather was calm. Visibility was good.', {emotion: 'neutral', pauseAfter: 0.3}),
	d.n('narrator_029_crossing', 'The crossing normally took fifty minutes.', {emotion: 'neutral', pauseAfter: 0.55}),
	d.n('narrator_030_daniel_emma', 'Daniel and his wife, Emma, had spent three days visiting friends on the island.', {
		emotion: 'warm',
		pauseAfter: 0.3,
	}),
	d.n('narrator_031_tired', 'They were tired.', {emotion: 'warm', pauseAfter: 0.35}),
	d.n('narrator_032_window', 'Daniel sat by the window. Emma fell asleep against his shoulder.', {emotion: 'warm', pauseAfter: 0.5}),
	d.c('emma', 'emma_001_wake_me', "Wake me up when we're home.", {
		emotion: 'sleepy',
		intensity: 0.3,
		pace: 0.9,
		volume: 0.8,
		pauseAfter: 0.25,
		direction: 'Half asleep, mumbled into his shoulder, affectionate.',
	}),
	d.c('daniel', 'daniel_001_go_sleep', 'Mm-hm. Go to sleep.', {
		emotion: 'tired',
		intensity: 0.25,
		pace: 0.92,
		volume: 0.85,
		pauseAfter: 0.7,
		direction: 'Tired, gentle, normal. A man at the end of a holiday.',
	}),
	d.n('narrator_033_nothing_unusual', 'Nothing unusual happened for the first thirty minutes.', {emotion: 'neutral', pauseAfter: 0.4}),
	d.n('narrator_034_routine_count', 'Then one of the crew members began the routine passenger count.', {emotion: 'neutral', pauseAfter: 0.3}),
	d.n('narrator_035_reached_62', 'He reached sixty-two. Normal.', {emotion: 'neutral', pauseAfter: 0.6}),
	d.n('narrator_036_few_minutes', 'A few minutes later... he counted again.', {pace: 0.96, pauseAfter: 0.35}),
	d.n('narrator_037_sixty_three', 'Sixty-three.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.6}),
	d.n('narrator_038_frowned', 'He frowned. Started over.', {pauseAfter: 0.4}),
	d.n('narrator_039_sixty_three_b', 'Sixty-three.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.5}),
	d.n('narrator_040_called', 'He called another crew member. She counted.', {pauseAfter: 0.3}),
	d.c('crew2', 'crew2_001_count', 'Sixty-one... sixty-two... sixty-three.', {
		emotion: 'uneasy',
		intensity: 0.3,
		pace: 0.95,
		volume: 0.8,
		pauseAfter: 0.55,
		fearLevel: 1,
		direction: 'Counting under her breath; the last number slows down.',
	}),
	d.n('narrator_041_boarding_list', 'They checked the boarding list. Sixty-two.', {pauseAfter: 0.5}),
	d.n('narrator_042_nobody_understood', 'Nobody understood it.', {pace: 0.95, pauseAfter: 0.7}),
	d.n('narrator_043_noticed', 'Then they noticed the woman.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.5}),
	d.n('narrator_044_bench', 'She was sitting on a bench at the rear of the ferry. Alone.', {emotion: 'uneasy', pauseAfter: 0.5}),
	d.n('narrator_045_nobody_remembered', 'Nobody remembered seeing her board.', {emotion: 'uneasy', pauseAfter: 0.4}),
	d.n('narrator_046_no_luggage', 'No luggage. No handbag. No ticket in her hand.', {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.4}),
	d.n('narrator_047_just_coat', 'Just the black coat. And those folded hands.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// DANIEL RECOGNIZES HER
// ---------------------------------------------------------------------------
const r = scene('recognition');
const RECOGNITION: VoiceLine[] = [
	r.n('narrator_048_approached', 'The first crew member approached her. That was when she said she was waiting for Passenger 37.', {
		spokenText: 'The first crew member approached her. That was when she said she was waiting for Passenger thirty-seven.',
		pauseAfter: 0.3,
	}),
	r.n('narrator_049_daniel', 'Daniel Clarke.', {pauseAfter: 0.45}),
	r.n('narrator_050_looking', 'The crew immediately went looking for him.', {pauseAfter: 0.3}),
	r.n('narrator_051_found_daniel', 'They found Daniel still sitting beside Emma.', {pauseAfter: 0.3}),
	r.c('crew1', 'crew_005_sir', 'Sir, do you know an elderly woman in a black coat?', {
		emotion: 'professional',
		intensity: 0.35,
		pauseAfter: 0.3,
		fearLevel: 1,
		direction: 'Polite, procedural, a bit embarrassed to ask.',
	}),
	r.n('narrator_052_laughed', 'Daniel laughed.', {emotion: 'neutral', pauseAfter: 0.15}),
	r.c('daniel', 'daniel_002_no', 'No.', {
		spokenText: 'Ha. No.',
		emotion: 'amused',
		intensity: 0.3,
		pauseAfter: 0.5,
		fearLevel: 0,
		direction: 'Easy, amused. Who would he know on a ferry at midnight?',
	}),
	r.n('narrator_053_saw_her', 'Then he saw her.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.6}),
	r.n('narrator_054_face_changed', 'His face changed instantly. Emma noticed.', {pauseAfter: 0.3}),
	r.c('emma', 'emma_002_daniel', 'Daniel?', {emotion: 'confused', intensity: 0.3, pauseAfter: 0.5, fearLevel: 1, direction: 'Soft concern.'}),
	r.n('narrator_055_didnt_answer', "He didn't answer.", {pauseAfter: 0.5}),
	r.n('narrator_056_wave', 'The woman lifted one hand. And gave him a tiny wave.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.65}),
	r.n('narrator_057_stood', 'Daniel stood up. Emma grabbed his arm.', {pace: 1.02, pauseAfter: 0.2}),
	r.c('emma', 'emma_003_what_is_it', 'What is it?', {emotion: 'confused', intensity: 0.4, pauseAfter: 0.35, fearLevel: 1}),
	r.n('narrator_058_whispered', 'Daniel whispered:', {pauseAfter: 0.25}),
	r.c('daniel', 'daniel_003_grandmother', 'That looks like my grandmother.', {
		emotion: 'confused',
		intensity: 0.45,
		pace: 0.92,
		volume: 0.85,
		audioEffect: 'whisper',
		breath: 'shakyInhale',
		pauseAfter: 0.5,
		fearLevel: 2,
		direction: 'Confused, not theatrical. Half whispered, as if saying it out loud makes it real.',
	}),
	r.n('narrator_059_stared', 'Emma stared at him.', {pauseAfter: 0.2}),
	r.c('emma', 'emma_004_so', 'So?', {emotion: 'confused', intensity: 0.3, pauseAfter: 0.85, fearLevel: 1, direction: 'Normal confusion.'}),
	r.n('narrator_060_sick', 'Daniel looked sick.', {pauseAfter: 0.35}),
	r.c('daniel', 'daniel_004_died', 'She died twelve years ago.', {
		emotion: 'afraid',
		intensity: 0.4,
		pace: 0.9,
		volume: 0.8,
		pauseAfter: 1.0,
		fearLevel: 3,
		direction: 'Quiet. Flat with shock.',
	}),
	r.n('narrator_061_laughed', 'Emma laughed because she thought he was joking.', {pauseAfter: 0.25}),
	r.n('narrator_062_wasnt', "Daniel wasn't.", {pace: 0.95, pauseAfter: 0.7}),
	r.n('narrator_063_raised', 'His grandmother had practically raised him.', {emotion: 'warm', pauseAfter: 0.3}),
	r.n('narrator_064_knew', 'He knew her face. Her posture. The way she tilted her head when she smiled. Everything.', {
		emotion: 'warm',
		pace: 0.95,
		pauseAfter: 0.6,
	}),
	r.n('narrator_065_only_difference', 'The only difference... was that she looked exactly as she had on the day she died.', {
		emotion: 'uneasy',
		pace: 0.93,
		pauseAfter: 0.55,
	}),
	r.n('narrator_066_same', 'Same coat. Same hairstyle. Same silver brooch.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.65}),
	r.n('narrator_067_step', 'Daniel took one step toward her. Emma pulled him back.', {pace: 1.0, pauseAfter: 0.1}),
	r.c('emma', 'emma_005_no', 'No.', {emotion: 'protective', intensity: 0.6, pauseAfter: 0.6, fearLevel: 2, direction: 'Immediate survival reaction. Low, firm.'}),
	r.n('narrator_068_smiled', 'The old woman smiled again.', {emotion: 'uneasy', pauseAfter: 0.5}),
	r.n('narrator_069_flickered', 'Then every light on the ferry flickered.', {pauseAfter: 0.35}),
	r.n('narrator_070_once_twice', 'Once. Twice.', {spokenText: 'Once... Twice.', pace: 0.9, pauseAfter: 0.35}),
	r.n('narrator_071_darkness', 'Darkness.', {emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 0.25}),
	r.n('narrator_072_screamed', 'People screamed.', {pauseAfter: 0.35}),
	r.n('narrator_073_three_seconds', 'Three seconds later... the lights returned.', {pauseAfter: 0.55}),
	r.n('narrator_074_bench_empty', 'The bench was empty.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.7}),
	r.n('narrator_075_gone', 'The woman was gone.', {emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 1.0}),
];

// ---------------------------------------------------------------------------
// DANIEL DISAPPEARS FROM THE MANIFEST
// ---------------------------------------------------------------------------
const e = scene('erasure');
const ERASURE: VoiceLine[] = [
	e.n('narrator_076_rear_deck', 'Crew checked the rear deck. Nothing.', {pace: 1.02, pauseAfter: 0.25}),
	e.n('narrator_077_bathrooms', 'Bathrooms. Nothing.', {pace: 1.02, pauseAfter: 0.25}),
	e.n('narrator_078_storage', 'Storage rooms. Nothing.', {pace: 1.02, pauseAfter: 0.3}),
	e.n('narrator_079_searched', 'They searched the entire vessel. She had vanished.', {pauseAfter: 0.5}),
	e.n('narrator_080_another_count', 'The captain ordered another passenger count.', {pauseAfter: 0.3}),
	e.n('narrator_081_sixty_two', 'Sixty-two.', {emotion: 'neutral', pauseAfter: 0.4}),
	e.n('narrator_082_relaxed', 'Everyone relaxed.', {emotion: 'neutral', pauseAfter: 0.55}),
	e.n('narrator_083_purser', 'Then the purser looked at the manifest. And went completely still.', {emotion: 'uneasy', pauseAfter: 0.6}),
	e.n('narrator_084_sixty_one', 'There were now... sixty-one names.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.9}),
	e.n('narrator_085_daniel_gone', 'Daniel Clarke was gone.', {emotion: 'uneasy', pace: 0.93, pauseAfter: 0.5}),
	e.n('narrator_086_not_physically', 'Not physically. Daniel was standing right there.', {pauseAfter: 0.3}),
	e.n('narrator_087_disappeared', 'But his name had disappeared from the passenger list.', {pauseAfter: 0.4}),
	e.n('narrator_088_refreshed', 'They refreshed the system. Sixty-one passengers.', {pauseAfter: 0.5}),
	e.n('narrator_089_ticket', 'Daniel showed them his digital ticket. The QR code was blank.', {
		spokenText: 'Daniel showed them his digital ticket. The Q.R. code was blank.',
		pauseAfter: 0.4,
	}),
	e.n('narrator_090_email', 'He opened the booking email. Gone.', {pauseAfter: 0.4}),
	e.n('narrator_091_reservation', 'Emma opened the reservation on her phone. Her booking showed:', {pauseAfter: 0.3}),
	e.n('narrator_092_one_passenger', 'One passenger. Emma Clarke.', {pace: 0.93, pauseAfter: 0.5}),
	e.n('narrator_093_stared', 'Daniel stared at the screen.', {pauseAfter: 0.2}),
	e.c('daniel', 'daniel_005_impossible', "That's impossible.", {
		emotion: 'afraid',
		intensity: 0.6,
		pace: 1.08,
		breath: 'fastBreathing',
		pauseAfter: 0.4,
		fearLevel: 3,
		direction: 'Sharper. Faster breathing. Controlled fear starting to slip.',
	}),
	e.n('narrator_094_identification', 'The captain asked for identification.', {pauseAfter: 0.25}),
	e.n('narrator_095_license', "Daniel handed over his driver's license.", {pauseAfter: 0.3}),
	e.n('narrator_096_looked', 'The captain looked at it. Then at Daniel. Then back at the card.', {pace: 0.96, pauseAfter: 0.5}),
	e.n('narrator_097_photo', 'The photograph was Daniel.', {pauseAfter: 0.35}),
	e.n('narrator_098_name_said', 'The name said:', {pauseAfter: 0.35}),
	e.n('narrator_099_unknown', 'Unknown.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.8}),
	e.n('narrator_100_grabbed', 'Daniel grabbed it. The name was gone.', {pauseAfter: 0.4}),
	e.n('narrator_101_shouting', 'Emma started shouting.', {pace: 1.02, pauseAfter: 0.1}),
	e.c('emma', 'emma_006_not_funny', "This isn't funny!", {
		emotion: 'angry',
		intensity: 0.75,
		pace: 1.08,
		audioEffect: 'shout',
		pauseAfter: 0.55,
		fearLevel: 3,
		direction: 'Angry and scared, aimed at the crew. Not a scream.',
	}),
	e.n('narrator_102_nobody_laughing', 'Nobody was laughing.', {pace: 0.93, pauseAfter: 1.0}),
];

// ---------------------------------------------------------------------------
// SOMETHING UNDER THE FERRY (hull knocks, PA, phones)
// ---------------------------------------------------------------------------
const u = scene('hull');
const HULL: VoiceLine[] = [
	u.n('narrator_103_hit', 'Then something hit the underside of the ferry.', {pauseAfter: 0.15}),
	u.n('narrator_104_stopped', 'Everyone stopped.', {pauseAfter: 0.5}),
	u.n('narrator_105_another', 'Another impact.', {pauseAfter: 0.1}),
	u.n('narrator_106_then_another', 'Then another.', {pauseAfter: 0.1}),
	u.n('narrator_107_beneath', 'From beneath them.', {emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 0.6}),
	u.n('narrator_108_captain_crew', 'The captain looked toward the crew.', {pauseAfter: 0.3}),
	u.n('narrator_109_radar', 'There was nothing on radar. No debris. No shallow water. They were in open sea.', {pauseAfter: 0.6}),
	u.n('narrator_110_knocking', 'Then the knocking started.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.2}),
	u.n('narrator_111_not_one', 'Not one knock. Many. All along the hull.', {emotion: 'uneasy', pauseAfter: 0.2}),
	u.n('narrator_112_moved_away', 'Passengers moved away from the windows.', {pauseAfter: 0.25}),
	u.n('narrator_113_screamed', 'Somebody screamed.', {pauseAfter: 0.55}),
	u.n('narrator_114_pa_on', 'Then the PA system switched on.', {spokenText: 'Then the P.A. system switched on.', pauseAfter: 0.15}),
	u.n('narrator_115_womans_voice', "A woman's voice filled the ferry.", {pauseAfter: 0.3}),
	u.c('pa', 'pa_001_passenger37', 'Passenger thirty-seven.', {
		emotion: 'professional',
		intensity: 0.25,
		audioEffect: 'pa',
		pauseAfter: 0.7,
		direction: 'A normal recorded ferry announcement.',
	}),
	u.n('narrator_116_pale', 'Daniel went pale.', {pauseAfter: 0.3}),
	u.c('pa', 'pa_002_proceed', 'Please proceed to the rear deck.', {
		emotion: 'professional',
		intensity: 0.25,
		audioEffect: 'pa',
		pauseAfter: 0.35,
		direction: 'Still normal. Polite routine announcement.',
	}),
	u.n('narrator_117_grabbed', 'Emma grabbed him.', {pace: 1.02, pauseAfter: 0.1}),
	u.c('emma', 'emma_007_no', 'No.', {emotion: 'afraid', intensity: 0.55, pauseAfter: 0.5, fearLevel: 3, breath: 'sharpInhale'}),
	u.c('pa', 'pa_003_passenger37_soft', 'Passenger thirty-seven...', {
		emotion: 'warm',
		intensity: 0.3,
		pace: 0.92,
		audioEffect: 'pa',
		blendTo: {character: 'oldWoman', amount: 0.35},
		pauseAfter: 0.5,
		direction: 'Softer. The announcement voice is starting to sound like someone.',
	}),
	u.n('narrator_118_voice_changed', 'Then the voice changed. It became softer. Almost affectionate.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.45}),
	u.c('pa', 'pa_004_daniel', 'Daniel.', {
		emotion: 'affectionate',
		intensity: 0.35,
		pace: 0.9,
		audioEffect: 'paSoft',
		blendTo: {character: 'oldWoman', amount: 0.75},
		pauseAfter: 0.6,
		direction: 'Personal. Saying his name like family.',
	}),
	u.n('narrator_119_shaking', 'He started shaking.', {pauseAfter: 0.3}),
	u.c('pa', 'pa_005_family', 'Your family is waiting.', {
		emotion: 'affectionate',
		intensity: 0.35,
		pace: 0.9,
		audioEffect: 'paIntimate',
		blendTo: {character: 'oldWoman', amount: 0.95},
		pauseAfter: 0.8,
		direction: 'Almost no PA filter now. Close and kind.',
	}),
	u.n('narrator_120_turned_off', 'The captain turned the PA system off. The voice continued.', {
		spokenText: 'The captain turned the P.A. system off. The voice continued.',
		pauseAfter: 0.25,
	}),
	u.c('oldWoman', 'pa_006_daniel_2', 'Daniel...', {
		emotion: 'affectionate',
		intensity: 0.3,
		audioEffect: 'paIntimate',
		pan: 0,
		pauseAfter: 0.45,
		direction: 'Patient. Calling a child in for dinner.',
	}),
	u.n('narrator_121_cable', 'The captain pulled the power cable. Still:', {pauseAfter: 0.3}),
	u.c('oldWoman', 'pa_007_daniel_3', 'Daniel...', {
		emotion: 'affectionate',
		intensity: 0.3,
		pace: 0.95,
		audioEffect: 'paIntimate',
		pan: 0,
		pauseAfter: 0.4,
	}),
	u.n('narrator_122_every_speaker', "Now the voice was coming from every speaker. Every radio. Every passenger's phone.", {pace: 1.02, pauseAfter: 0.2}),
	u.c('oldWoman', 'pa_008_daniel_4', 'Daniel...', {
		emotion: 'affectionate',
		intensity: 0.3,
		audioEffect: 'multiSpeaker',
		pan: 0,
		pauseAfter: 0.5,
		direction: 'The same tender voice from everywhere at once.',
	}),
	u.n('narrator_123_phones', 'One by one, phone screens lit up.', {pauseAfter: 0.35}),
	u.n('narrator_124_no_signal', 'No signal. No network. But every screen displayed the same message:', {pauseAfter: 0.2}),
	u.n('narrator_125_backed_away', 'Daniel backed away. Emma held him.', {pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// NAVIGATION FAILURE + MARINE RADIO
// ---------------------------------------------------------------------------
const v = scene('navigation');
const NAVIGATION: VoiceLine[] = [
	v.n('narrator_126_engines', "Then the ferry's engines slowed.", {pauseAfter: 0.4}),
	v.n('narrator_127_rushed', 'The captain rushed to the bridge.', {pace: 1.03, pauseAfter: 0.35}),
	v.n('narrator_128_nav_blank', 'The navigation screen had gone blank.', {pauseAfter: 0.3}),
	v.n('narrator_129_gps', 'GPS lost. Compass spinning. Radar empty.', {spokenText: 'G.P.S. lost. Compass spinning. Radar empty.', pauseAfter: 0.5}),
	v.n('narrator_130_windshield', 'He looked out through the windshield.', {pauseAfter: 0.3}),
	v.n('narrator_131_no_coast', 'No coastline. No lights. Nothing.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.6}),
	v.n('narrator_132_ten_minutes', 'They should have been ten minutes from port.', {pauseAfter: 0.3}),
	v.n('narrator_133_instead', 'Instead... there was black ocean in every direction.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.7}),
	v.n('narrator_134_radioed', 'The captain radioed the harbor.', {pauseAfter: 0.3}),
	v.c('captain', 'captain_001_radio_call', 'Port Mason Control, this is North Star Eight. Do you copy?', {
		emotion: 'professional',
		intensity: 0.3,
		pauseAfter: 0.2,
		fearLevel: 1,
		direction: 'Professional marine-radio cadence. Calm, procedural.',
	}),
	v.c('captain', 'captain_002_radio_again', 'Port Mason, North Star Eight.', {
		emotion: 'professional',
		intensity: 0.35,
		pauseBefore: 0.3,
		pauseAfter: 0.4,
		fearLevel: 1,
	}),
	v.n('narrator_135_answered', 'A voice answered.', {pauseAfter: 0.25}),
	v.c('harbor', 'harbor_001_go_ahead', 'North Star Eight, go ahead.', {emotion: 'professional', intensity: 0.2, pauseAfter: 0.3}),
	v.n('narrator_136_exhaled', 'The captain exhaled.', {pauseAfter: 0.2}),
	v.c('captain', 'captain_003_lost_nav', 'We appear to have lost navigation. Request position check.', {
		emotion: 'professional',
		intensity: 0.3,
		breath: 'exhale',
		pauseAfter: 0.3,
		fearLevel: 1,
	}),
	v.c('harbor', 'harbor_002_confirm', 'North Star Eight... confirm vessel identification.', {
		emotion: 'confused',
		intensity: 0.25,
		pauseAfter: 0.4,
		direction: 'Slight hesitation. Checking something on a screen.',
	}),
	v.c('captain', 'captain_004_ns8', 'North Star Eight.', {emotion: 'confused', intensity: 0.3, pauseAfter: 0.5, fearLevel: 1}),
	v.n('narrator_137_another_pause', 'Another pause. The harbor operator sounded confused.', {pauseAfter: 0.35}),
	v.c('harbor', 'harbor_003_captain', 'Captain...', {emotion: 'confused', intensity: 0.3, pace: 0.95, pauseAfter: 0.5}),
	v.c('harbor', 'harbor_004_docked', 'North Star Eight docked twenty-three minutes ago.', {
		emotion: 'confused',
		intensity: 0.35,
		pace: 0.96,
		pauseAfter: 1.5,
		direction: 'Genuinely confused. Realistic. Not spooky.',
	}),
	v.n('narrator_138_nobody_spoke', 'Nobody on the bridge spoke.', {pace: 0.95, pauseAfter: 0.4}),
	v.n('narrator_139_looked_out', 'The captain looked out at the black ocean.', {pauseAfter: 0.3}),
	v.c('captain', 'captain_005_negative', "Negative. We're still at sea.", {
		emotion: 'confused',
		intensity: 0.4,
		pace: 0.95,
		pauseAfter: 0.45,
		fearLevel: 2,
		direction: 'Controlled confusion. He does not raise his voice.',
	}),
	v.n('narrator_140_operator', 'The operator answered:', {pauseAfter: 0.2}),
	v.c('harbor', 'harbor_005_looking', "Sir, I'm looking at your vessel right now.", {
		emotion: 'confused',
		intensity: 0.35,
		pauseAfter: 1.4,
		direction: 'Plain, a little worried for him.',
	}),
];

// ---------------------------------------------------------------------------
// THE OTHER FERRY
// ---------------------------------------------------------------------------
const o = scene('otherFerry');
const OTHER_FERRY: VoiceLine[] = [
	o.n('narrator_141_radio_error', 'The captain thought it was some kind of radio error.', {pauseAfter: 0.3}),
	o.n('narrator_142_photograph', 'Then harbor control sent a photograph through the marine system.', {pauseAfter: 0.3}),
	o.n('narrator_143_loaded', 'The image loaded slowly.', {pace: 0.95, pauseAfter: 0.2}),
	o.n('narrator_144_north_star', 'The North Star. Docked at Port Mason. Passengers walking off.', {pauseAfter: 0.4}),
	o.n('narrator_145_timestamp', 'Timestamp: 12:26 AM.', {spokenText: 'Timestamp... twelve twenty-six A.M.', pauseAfter: 0.4}),
	o.n('narrator_146_current_time', 'The current time was 12:49.', {spokenText: 'The current time was twelve forty-nine.', emotion: 'uneasy', pauseAfter: 0.7}),
	o.n('narrator_147_zoomed', 'The captain zoomed in.', {pauseAfter: 0.3}),
	o.n('narrator_148_there_he_was', 'There he was. Walking down the gangway. Same uniform. Same face.', {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.4}),
	o.n('narrator_149_same_crew', 'Beside him were the same crew. Then the passengers.', {pauseAfter: 0.4}),
	o.n('narrator_150_emma', 'Emma.', {pauseAfter: 0.6}),
	o.n('narrator_151_shoulder', "Daniel stared over the captain's shoulder.", {pauseAfter: 0.3}),
	o.n('narrator_152_alone', 'Emma was in the photograph. Alone.', {emotion: 'uneasy', pauseAfter: 0.45}),
	o.n('narrator_153_missing', 'Daniel was missing.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.8}),
	o.n('narrator_154_pointed', 'Then somebody pointed.', {pauseAfter: 0.4}),
	o.n('narrator_155_end_gangway', 'At the very end of the gangway... stood the old woman.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.5}),
	o.n('narrator_156_watching', 'Black coat. Watching the camera.', {emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 1.2}),
];

// ---------------------------------------------------------------------------
// THE GRANDMOTHER CALLS
// ---------------------------------------------------------------------------
const g = scene('grandmotherCalls');
const GRANDMOTHER: VoiceLine[] = [
	g.n('narrator_157_turned', 'Daniel suddenly turned toward the rear of the ferry. Emma grabbed him.', {pace: 1.02, pauseAfter: 0.15}),
	g.c('emma', 'emma_008_where', 'Where are you going?', {emotion: 'protective', intensity: 0.55, pace: 1.06, pauseAfter: 0.4, fearLevel: 3}),
	g.n('narrator_158_didnt_answer', "He didn't answer. He could hear something.", {pauseAfter: 0.3}),
	g.n('narrator_159_not_announcement', "Not the announcement. A voice. His grandmother's voice.", {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.3}),
	g.n('narrator_160_quiet', 'Quiet. Coming from outside.', {emotion: 'uneasy', pace: 0.92, volume: 0.9, pauseAfter: 0.6}),
	g.c('oldWoman', 'oldwoman_005_daniel', 'Daniel.', {
		emotion: 'warm',
		intensity: 0.3,
		audioEffect: 'distant',
		pan: -0.3,
		pauseAfter: 0.6,
		direction: 'From outside, behind him. Calm, like calling him in from the garden.',
	}),
	g.n('narrator_161_walking', 'He began walking. Emma pulled harder.', {pace: 1.03, pauseAfter: 0.05}),
	g.c('emma', 'emma_009_stop', 'Stop!', {emotion: 'protective', intensity: 0.7, audioEffect: 'shout', pauseAfter: 0.35, fearLevel: 4}),
	g.n('narrator_162_looked_at_her', 'He looked at her. Tears in his eyes.', {pace: 0.95, pauseAfter: 0.3}),
	g.c('daniel', 'daniel_006_used_to_say', 'She used to say that.', {
		emotion: 'grieving',
		intensity: 0.55,
		pace: 0.88,
		breath: 'cryingBreath',
		pauseAfter: 0.15,
		fearLevel: 3,
		direction: 'Voice cracking slightly. Vulnerable, not dramatic.',
	}),
	g.c('emma', 'emma_010_what', 'What?', {emotion: 'afraid', intensity: 0.45, pace: 1.05, pauseAfter: 0.3, fearLevel: 3}),
	g.c('daniel', 'daniel_007_exactly', 'Exactly like that.', {
		emotion: 'hypnotized',
		intensity: 0.4,
		pace: 0.85,
		volume: 0.78,
		audioEffect: 'whisper',
		pauseAfter: 0.35,
		fearLevel: 3,
		direction: 'Almost a whisper.',
	}),
	g.c('emma', 'emma_011_shes_dead', "Daniel, she's dead.", {
		emotion: 'afraid',
		intensity: 0.6,
		pauseBefore: -0.05,
		breath: 'fastBreathing',
		pauseAfter: 0.4,
		fearLevel: 4,
		direction: 'Firm but frightened. Trying to pull him back to reality.',
	}),
	g.n('narrator_163_nodded', 'He nodded.', {pauseAfter: 0.25}),
	g.c('daniel', 'daniel_008_i_know', 'I know.', {emotion: 'grieving', intensity: 0.45, pace: 0.85, volume: 0.8, pauseAfter: 0.8, fearLevel: 3}),
	g.n('narrator_164_again', "Then the old woman's voice came again.", {pauseAfter: 0.3}),
	g.c('oldWoman', 'oldwoman_006_daniel_2', 'Daniel...', {
		emotion: 'warm',
		intensity: 0.3,
		audioEffect: 'distant',
		pan: -0.2,
		pauseAfter: 0.5,
		direction: 'Closer than before. Still unhurried.',
	}),
	g.n('narrator_165_covered', 'He covered his ears.', {pauseAfter: 0.35}),
	g.n('narrator_166_changed', 'The voice changed. Now it sounded younger. Kinder.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.45}),
	g.c('oldWoman', 'oldwoman_007_sweetheart', 'Come here, sweetheart.', {
		emotion: 'comforting',
		intensity: 0.4,
		pace: 1.04,
		voiceTweak: 'younger',
		pan: -0.12,
		pauseAfter: 0.8,
		direction: 'Genuinely comforting. Loving. Younger and kinder than before.',
	}),
	g.n('narrator_167_crying', 'Daniel started crying.', {pauseAfter: 0.3}),
	g.n('narrator_168_slapped', 'Emma slapped him. Hard.', {pace: 1.02, pauseAfter: 0.4}),
	g.n('narrator_169_blinked', 'He blinked. For a second... the voice stopped.', {pace: 0.95, pauseAfter: 0.6}),
	g.n('narrator_170_screamed', 'Then someone screamed from the rear deck.', {pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// PEOPLE IN THE WATER
// ---------------------------------------------------------------------------
const p = scene('peopleInWater');
const PEOPLE: VoiceLine[] = [
	p.n('narrator_171_back', 'The old woman was back. Standing beside the railing.', {emotion: 'uneasy', pauseAfter: 0.5}),
	p.n('narrator_172_not_alone', "This time... she wasn't alone.", {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.8}),
	p.n('narrator_173_people', 'There were people in the water.', {emotion: 'uneasy', pace: 0.9, volume: 0.92, pauseAfter: 0.7}),
	p.n('narrator_174_dozens', 'Dozens of them. Floating upright.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.4}),
	p.n('narrator_175_not_swimming', 'Not swimming. Just standing in the black ocean.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.4}),
	p.n('narrator_176_heads', 'Their heads and shoulders above the surface. All facing the ferry.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.6}),
	p.n('narrator_177_still', 'The sea was perfectly still.', {emotion: 'uneasy', pace: 0.88, volume: 0.88, pauseAfter: 0.4}),
	p.n('narrator_178_raised', 'One of them raised an arm.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.8}),
	p.n('narrator_179_another', 'Then another.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.6}),
	p.n('narrator_180_all', 'Then all of them.', {emotion: 'uneasy', pace: 0.88, volume: 0.9, pauseAfter: 1.5}),
	p.n('narrator_181_stared', 'Daniel stared.', {pauseAfter: 0.4}),
	p.n('narrator_182_smiled', 'The old woman smiled.', {pauseAfter: 0.5}),
	p.c('oldWoman', 'oldwoman_008_see', 'See?', {emotion: 'warm', intensity: 0.3, pauseAfter: 0.8, direction: 'Soft. Pleased, like showing a child a surprise.'}),
	p.n('narrator_183_pointed', 'She pointed toward the water.', {pauseAfter: 0.45}),
	p.c('oldWoman', 'oldwoman_009_everyone', 'Everyone came back.', {
		emotion: 'unnaturally_calm',
		intensity: 0.3,
		pace: 0.95,
		pauseAfter: 1.6,
		direction: 'Calm. Content. As if this is good news.',
	}),
];

// ---------------------------------------------------------------------------
// DANIEL DISAPPEARS
// ---------------------------------------------------------------------------
const x = scene('vanish');
const VANISH: VoiceLine[] = [
	x.n('narrator_184_lights_died', 'The ferry lights died.', {pace: 1.0, pauseAfter: 0.15}),
	x.n('narrator_185_darkness', 'Total darkness.', {volume: 0.9, pauseAfter: 0.35}),
	x.n('narrator_186_screamed', 'Passengers screamed.', {pauseAfter: 0.2}),
	x.n('narrator_187_held', "Emma held Daniel's arm with both hands.", {pauseAfter: 0.35}),
	x.n('narrator_188_struck', 'Something struck the side of the ferry. Hard.', {pace: 1.02, pauseAfter: 0.5}),
	x.n('narrator_189_another_impact', 'Then another impact.', {pauseAfter: 0.45}),
	x.n('narrator_190_climbing', 'Then something began climbing.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.1}),
	x.n('narrator_191_against', 'Against the metal hull. From below. All around them.', {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.3}),
	x.n('narrator_192_ran', 'People ran.', {pace: 1.05, pauseAfter: 0.4}),
	x.n('narrator_193_emergency', 'Emergency lights switched on. Red.', {pauseAfter: 0.9}),
	x.n('narrator_194_gone', 'Daniel was gone.', {emotion: 'uneasy', pace: 0.9, volume: 0.92, pauseAfter: 1.1}),
	x.n('narrator_195_looked_down', 'Emma looked down. Her hands were empty.', {pace: 0.94, pauseAfter: 0.5}),
	x.c('emma', 'emma_012_scream', 'Daniel?!', {
		spokenText: 'Daniel?!',
		emotion: 'screaming',
		intensity: 1,
		audioEffect: 'shout',
		breath: 'raggedBreathing',
		pauseAfter: 0.25,
		fearLevel: 5,
		direction: 'One of the rare real screams. Raw. Ragged breathing afterwards.',
	}),
	x.n('narrator_196_screamed_name', 'She screamed his name.', {pauseAfter: 0.15}),
	x.c('emma', 'emma_013_daniel_2', 'Daniel!', {
		emotion: 'panicked',
		intensity: 0.85,
		audioEffect: 'shout',
		volume: 0.85,
		pauseAfter: 0.4,
		fearLevel: 5,
		direction: 'Turning in the dark, calling into the ship.',
	}),
	x.n('narrator_197_no_answer', 'No answer.', {pace: 0.92, pauseAfter: 0.6}),
	x.n('narrator_198_railing', 'She ran to the railing.', {pace: 1.02, pauseAfter: 0.3}),
	x.n('narrator_199_gone_too', 'The old woman was gone too.', {pauseAfter: 0.4}),
	x.n('narrator_200_ocean_empty', 'The ocean was empty. No floating people. No splash. No Daniel.', {emotion: 'uneasy', pace: 0.93, pauseAfter: 0.5}),
	x.n('narrator_201_nothing', 'Nothing.', {emotion: 'uneasy', pace: 0.9, volume: 0.88, pauseAfter: 1.4}),
	x.n('narrator_202_engines', 'Then the engines suddenly roared back to life.', {pace: 1.03, pauseAfter: 0.3}),
	x.n('narrator_203_gps', 'GPS returned. Radar returned.', {spokenText: 'G.P.S. returned. Radar returned.', pauseAfter: 0.3}),
	x.n('narrator_204_nav_showed', 'The navigation screen showed: PORT MASON — 4.7 KM.', {
		spokenText: 'The navigation screen showed... Port Mason. Four point seven kilometers.',
		pauseAfter: 0.6,
	}),
	x.n('narrator_205_harbor_lights', 'Five minutes later... they saw the harbor lights.', {pace: 0.95, pauseAfter: 1.2}),
];

// ---------------------------------------------------------------------------
// POLICE INVESTIGATION
// ---------------------------------------------------------------------------
const q = scene('police');
const POLICE: VoiceLine[] = [
	q.n('narrator_206_police_waiting', 'Police were waiting when the ferry docked.', {emotion: 'neutral', pauseAfter: 0.3}),
	q.n('narrator_207_told', 'Emma told them everything.', {emotion: 'neutral', pauseAfter: 0.3}),
	q.n('narrator_208_list', 'Daniel. The woman. The passenger count. The announcement. The people in the water.', {emotion: 'neutral', pace: 1.02, pauseAfter: 0.5}),
	q.n('narrator_209_checked', 'The officers checked the manifest. Sixty-one passengers. No Daniel Clarke.', {pauseAfter: 0.5}),
	q.n('narrator_210_database', 'They searched the booking database. Nothing.', {pauseAfter: 0.5}),
	q.n('narrator_211_photographs', 'Emma showed them photographs. Wedding photos. Holiday pictures. Birthdays.', {pauseAfter: 0.4}),
	q.n('narrator_212_every', 'In every photograph... Emma was alone.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.7}),
	q.n('narrator_213_wedding', 'At their wedding... she stood by herself at the altar.', {pace: 0.95, pauseAfter: 0.4}),
	q.n('narrator_214_honeymoon', 'On their honeymoon... she sat alone at dinner.', {pace: 0.95, pauseAfter: 0.4}),
	q.n('narrator_215_christmas', 'At Christmas... an empty chair beside her.', {pace: 0.93, pauseAfter: 0.6}),
	q.n('narrator_216_emma_screamed', 'Emma screamed:', {pauseAfter: 0.1}),
	q.c('emma', 'emma_014_husband', "He's my husband!", {
		emotion: 'grieving',
		intensity: 0.85,
		audioEffect: 'shout',
		breath: 'cryingBreath',
		pauseAfter: 0.6,
		fearLevel: 4,
		direction: 'Grief and frustration. Nobody believes her.',
	}),
	q.n('narrator_217_records', 'Police checked government records.', {pauseAfter: 0.3}),
	q.n('narrator_218_record', 'Emma Clarke. Thirty years old. Single. Never married.', {pace: 0.95, pauseAfter: 0.6}),
	q.n('narrator_219_ring', "She pulled Daniel's wedding ring from her pocket.", {pauseAfter: 0.3}),
	q.n('narrator_220_uncomfortable', 'The officer looked uncomfortable.', {pauseAfter: 0.2}),
	q.c('police', 'police_001_whose', 'Whose is that?', {emotion: 'professional', intensity: 0.3, pauseAfter: 0.15, direction: 'Careful, gentle, uncomfortable.'}),
	q.c('emma', 'emma_015_husbands', "My husband's!", {emotion: 'grieving', intensity: 0.75, audioEffect: 'shout', pauseBefore: -0.05, pauseAfter: 0.45, fearLevel: 4}),
	q.c('police', 'police_002_maam', "Ma'am...", {emotion: 'professional', intensity: 0.3, pace: 0.9, pauseAfter: 0.5, direction: 'Sympathetic. He does not know what to say.'}),
	q.n('narrator_221_turned_ring', 'He turned the ring over. There was an engraving inside.', {pauseAfter: 0.4}),
	q.n('narrator_222_expected', 'Emma expected: D + E.', {spokenText: 'Emma expected... D, and E.', pauseAfter: 0.5}),
	q.n('narrator_223_instead', 'Instead it said:', {pace: 0.93, pauseAfter: 0.2}),
	q.n('narrator_224_37', '37.', {spokenText: 'Thirty-seven.', emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 1.4}),
];

// ---------------------------------------------------------------------------
// CCTV EVIDENCE
// ---------------------------------------------------------------------------
const c = scene('cctv');
const CCTV: VoiceLine[] = [
	c.n('narrator_225_security', 'Security footage from the ferry was reviewed the next morning.', {emotion: 'neutral', pauseAfter: 0.4}),
	c.n('narrator_226_most', 'For most of the crossing... Emma could be seen sitting beside an empty seat.', {pauseAfter: 0.4}),
	c.n('narrator_227_talking', 'Talking. Laughing. Resting her head against nothing.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.7}),
	c.n('narrator_228_1217', 'At 12:17 AM... the footage distorted.', {spokenText: 'At twelve seventeen A.M.... the footage distorted.', pauseAfter: 0.4}),
	c.n('narrator_229_one_frame', 'One frame. Just one.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.8}),
	c.n('narrator_230_appeared', 'Daniel appeared beside her. Looking directly into the camera.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.5}),
	c.n('narrator_231_behind', 'Behind his seat... the old woman stood with both hands on his shoulders.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.7}),
	c.n('narrator_232_next_frame', 'The next frame... he was gone again.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 1.0}),
	c.n('narrator_233_never', 'Investigators never found an explanation.', {emotion: 'neutral', pauseAfter: 0.3}),
	c.n('narrator_234_replaced', 'The ferry company replaced the camera system.', {emotion: 'neutral', pauseAfter: 0.3}),
	c.n('narrator_235_refused', 'The crew refused to work overnight crossings.', {emotion: 'neutral', pauseAfter: 0.3}),
	c.n('narrator_236_stopped', 'Emma stopped taking ferries entirely.', {emotion: 'warm', pace: 0.95, pauseAfter: 1.2}),
];

// ---------------------------------------------------------------------------
// FINAL CLIFFHANGER
// ---------------------------------------------------------------------------
const f = scene('finale');
const FINALE: VoiceLine[] = [
	f.n('narrator_237_year', 'For almost a year... nothing happened.', {emotion: 'neutral', pace: 0.95, pauseAfter: 0.6}),
	f.n('narrator_238_afternoon', 'Then one afternoon... Emma received a photograph from an unknown number.', {pauseAfter: 0.4}),
	f.n('narrator_239_showed', 'It showed the North Star ferry. Bright daylight. Crowded deck.', {emotion: 'neutral', pauseAfter: 0.4}),
	f.n('narrator_240_almost_deleted', 'Emma almost deleted it.', {pauseAfter: 0.3}),
	f.n('narrator_241_zoomed', 'Then she zoomed in.', {pace: 0.95, pauseAfter: 0.6}),
	f.n('narrator_242_very_back', 'At the very back... the old woman was sitting on the same bench.', {emotion: 'uneasy', pace: 0.93, pauseAfter: 0.5}),
	f.n('narrator_243_beside', 'And beside her... was Daniel.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.8}),
	f.n('narrator_244_same_clothes', 'Same clothes. Same face. Exactly as he had looked the night he vanished.', {emotion: 'uneasy', pace: 0.94, pauseAfter: 0.4}),
	f.n('narrator_245_staring', 'He was staring directly at the camera. One finger pressed against his lips.', {emotion: 'uneasy', pace: 0.93, pauseAfter: 0.8}),
	f.n('narrator_246_message', 'A message arrived.', {pauseAfter: 0.2}),
	f.n('narrator_247_dont_let', "DON'T LET HER COUNT YOU.", {
		spokenText: "Don't let her count you.",
		emotion: 'whispering',
		intensity: 0.4,
		pace: 0.88,
		volume: 0.78,
		pauseAfter: 1.0,
		direction: 'Read the message quietly, almost under the breath.',
	}),
	f.n('narrator_248_rang', "Emma's phone rang. Unknown number.", {pauseAfter: 0.4}),
	f.n('narrator_249_didnt_answer', "She didn't answer.", {pauseAfter: 0.6}),
	f.n('narrator_250_stopped', 'It stopped.', {pauseAfter: 0.7}),
	f.n('narrator_251_again', 'Then rang again.', {pauseAfter: 0.6}),
	f.n('narrator_252_switched_off', 'She switched the phone off.', {pauseAfter: 0.35}),
	f.n('narrator_253_black', 'The screen went black.', {pauseAfter: 0.5}),
	f.n('narrator_254_several', 'For several seconds... nothing.', {emotion: 'uneasy', pace: 0.9, volume: 0.9, pauseAfter: 0.3}),
	f.n('narrator_255_turned_on', 'Then the screen turned itself back on.', {emotion: 'uneasy', pauseAfter: 0.4}),
	f.n('narrator_256_no_call', 'No call. No message. Just one number.', {emotion: 'uneasy', pace: 0.93, pauseAfter: 0.2}),
	f.n('narrator_257_behind', "And from somewhere behind Emma... an old woman's voice whispered:", {
		emotion: 'uneasy',
		intensity: 0.4,
		pace: 0.9,
		volume: 0.82,
		pauseAfter: 0,
		direction: 'Lowest, quietest narration in the piece.',
	}),
	f.c('oldWoman', 'oldwoman_final_64', 'Sixty-four.', {
		emotion: 'whispering',
		intensity: 0.35,
		pace: 0.9,
		volume: 0.9,
		audioEffect: 'whisperClose',
		pan: 0.35,
		pauseAfter: 0,
		direction: 'Whispered very close to Emma, slightly behind and to the right. Calm. Not a monster. A grandmother counting.',
	}),
];

// ---------------------------------------------------------------------------
// BACKGROUND PASSENGERS (placed as overlays, never move the timeline)
// ---------------------------------------------------------------------------
const k = scene('crowd');
const CROWD: VoiceLine[] = [
	k.c('crowd', 'crowd_001_who_is_she', 'Who is she?', {volume: 0.55, pan: 0.4, pauseAfter: 0}),
	k.c('crowd', 'crowd_002_what_happened', 'What happened?', {volume: 0.6, pan: -0.45, pauseAfter: 0}),
	k.c('crowd', 'crowd_003_whats_going_on', "What's going on?", {volume: 0.55, pan: 0.5, pauseAfter: 0}),
	k.c('crowd', 'crowd_004_feel_that', 'Did you feel that?', {volume: 0.6, pan: -0.35, pauseAfter: 0}),
	k.c('crowd', 'crowd_005_lights', 'Why did the lights go out?', {volume: 0.55, pan: 0.3, pauseAfter: 0}),
	k.c('crowd', 'crowd_006_oh_god', 'Oh my God...', {emotion: 'afraid', volume: 0.5, pan: -0.55, pauseAfter: 0}),
	k.c('crowd', 'crowd_007_windows', 'Get away from the windows!', {emotion: 'panicked', audioEffect: 'shout', volume: 0.5, pan: 0.45, pauseAfter: 0}),
	k.c('crowd', 'crowd_008_crew', "Where's the crew? Somebody get the crew!", {emotion: 'panicked', audioEffect: 'shout', volume: 0.45, pan: -0.5, pauseAfter: 0}),
	k.c('crowd', 'crowd_009_help', 'Help! Somebody help!', {emotion: 'panicked', audioEffect: 'shout', volume: 0.45, pan: 0.6, pauseAfter: 0}),
	k.c('crowd', 'crowd_010_what_is_that', 'What is that?', {emotion: 'afraid', volume: 0.5, pan: 0.25, pauseAfter: 0}),
	k.c('crowd', 'crowd_011_under_us', "It's under us. It's under us!", {emotion: 'panicked', volume: 0.5, pan: -0.3, pauseAfter: 0}),
	k.c('crowd', 'crowd_012_stay_calm', 'Everyone stay calm, please. Stay in your seats.', {emotion: 'authoritative', volume: 0.45, pan: 0.55, pauseAfter: 0}),
	k.c('crowd', 'crowd_013_phone', "My phone... what is this? It says thirty-seven.", {emotion: 'confused', volume: 0.45, pan: -0.6, pauseAfter: 0}),
	k.c('crowd', 'crowd_014_look', 'Look... look at the water.', {emotion: 'afraid', volume: 0.5, pan: 0.35, pauseAfter: 0}),
	k.c('crowd', 'crowd_015_mum', 'Mum? Mum!', {emotion: 'panicked', volume: 0.4, pan: -0.4, pauseAfter: 0}),
];

export const VOICE_LINES: VoiceLine[] = [
	...HOOK,
	...DEPARTURE,
	...RECOGNITION,
	...ERASURE,
	...HULL,
	...NAVIGATION,
	...OTHER_FERRY,
	...GRANDMOTHER,
	...PEOPLE,
	...VANISH,
	...POLICE,
	...CCTV,
	...FINALE,
	...CROWD,
];

export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
