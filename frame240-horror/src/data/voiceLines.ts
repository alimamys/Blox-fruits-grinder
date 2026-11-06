// Every spoken line in "Frame 240", in story order.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the
//    TTS engine reads (numbers spelled out, pauses written as "..." etc).
//  - pauseBefore / pauseAfter are deliberately NOT uniform. Normal sentences get
//    0.2-0.45 s, reveals 0.7-1.3 s; the big suspense holds are timeline beats.
//  - fearLevel: 1 confusion, 2 unease, 3 controlled fear, 4 panic, 5 terror.
//  - Mara tells her own story. 'narrator' = her voice-over (close, dry, no subtitle tag);
//    'mara' = her voice inside the scene (phone calls, "Oh God", the closet recording),
//    lip-synced and tagged MARA. Both use the same Fish voice. Hana is voice only, on the phone.
//  - Script change (approved): scene 8's third-person lines are told in the first person
//    ("I turned toward my own wall..."). Scene 11's "The white surface begins to bulge
//    inward." is a stage direction - shown, not spoken.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	mara: 'room',
	hana: 'phone',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'serious',
	mara: 'afraid',
	hana: 'casual',
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
});

/** A scene's line makers; `d` holds that scene's default options for the narrator. */
const scene = (s: string, d: Opts = {}) => ({
	n: (id: string, text: string, o: Opts = {}) => line(s, 'narrator', id, text, {...d, ...o}),
	m: (id: string, text: string, o: Opts = {}) => line(s, 'mara', id, text, o),
	// Hana is a phone voice: she sits a little under the narration in the mix
	h: (id: string, text: string, o: Opts = {}) => line(s, 'hana', id, text, {volume: 0.7, ...o}),
});

// ---------------------------------------------------------------------------
// 1. COLD OPEN - the frame that shouldn't exist
// ---------------------------------------------------------------------------
const c1 = scene('coldOpen', {emotion: 'uneasy', intensity: 0.35, fearLevel: 2});
const COLD_OPEN: VoiceLine[] = [
	c1.n('narrator_001_239_frames', 'There were 239 frames in my animation when I went to bed.', {
		spokenText: 'There were two hundred and thirty-nine frames in my animation... when I went to bed.',
		pace: 0.95,
		pauseAfter: 0.45,
		direction: 'Quiet, close, almost a confession. Someone telling you something they know you will not believe.',
	}),
	c1.n('narrator_002_240', 'When I opened it again, there were 240.', {spokenText: 'When I opened it again, there were two hundred and forty.', pauseAfter: 0.6}),
	c1.n('narrator_003_extra_frame', 'In the extra frame, a man was standing in my hallway.', {pace: 0.95, pauseAfter: 0.55}),
	c1.n('narrator_004_hadnt_drawn', "I hadn't drawn him.", {pace: 0.92, pauseAfter: 0.7}),
	c1.n('narrator_005_closer', 'And the next time I pressed play, he was closer.', {pace: 0.95, pauseAfter: 0.8, direction: 'A little lower on "he was closer".'}),
	c1.n('narrator_006_ridiculous', 'I know how ridiculous that sounds.', {emotion: 'tired', pauseAfter: 0.35}),
	c1.n('narrator_007_cant_move', "A drawing can't move by itself. An animation can't create new frames.", {emotion: 'serious', pauseAfter: 0.4}),
	c1.n('narrator_008_believed', "At least, that's what I believed.", {pauseAfter: 0.35}),
	c1.n('narrator_009_until_that_night', 'Until that night.', {pace: 0.9, volume: 0.9, pauseAfter: 0.5}),
];

// ---------------------------------------------------------------------------
// 2. A NORMAL NIGHT
// ---------------------------------------------------------------------------
const c2 = scene('normalNight', {emotion: 'casual', intensity: 0.3, fearLevel: 0});
const NORMAL_NIGHT: VoiceLine[] = [
	c2.n('narrator_010_name_mara', "My name is Mara. I'm a freelance animator.", {emotion: 'warm', pauseAfter: 0.4, direction: 'Ordinary, a little self-deprecating. The calm before.'}),
	c2.n('narrator_011_most_nights', "Most nights, I work until two or three in the morning. It's quieter then. No phone calls. No interruptions.", {
		emotion: 'tired',
		pauseAfter: 0.4,
	}),
	c2.n('narrator_012_finishing', 'That night, I was finishing a short animation of an empty apartment hallway.', {pauseAfter: 0.3}),
	c2.n('narrator_013_nothing_complicated', 'Nothing complicated. A flickering ceiling light, a few shadows, and a slow movement toward a closed bedroom door.', {pauseAfter: 0.4}),
	c2.n('narrator_014_own_hallway', "I'd used my own hallway as a reference.", {pauseAfter: 0.3}),
	c2.n('narrator_015_crack_carpet_stain', 'The little crack above the doorframe, the old carpet, even the stain on the ceiling. It was all there.', {pace: 0.97, pauseAfter: 0.4}),
	c2.n('narrator_016_three_hours', "I'd been staring at the same ten seconds of animation for nearly three hours.", {emotion: 'tired', pauseAfter: 0.35}),
	c2.n('narrator_017_saved', 'Eventually, I saved the project, closed my eyes for a moment, and checked the timeline one last time.', {emotion: 'tired', pauseAfter: 0.45}),
	c2.n('narrator_018_extra_frame', "That's when I noticed the extra frame.", {emotion: 'uneasy', intensity: 0.4, fearLevel: 1, pace: 0.94, pauseAfter: 0.7}),
];

// ---------------------------------------------------------------------------
// 3. THE STRANGER
// ---------------------------------------------------------------------------
const c3 = scene('stranger', {emotion: 'serious', intensity: 0.35, fearLevel: 1});
const STRANGER: VoiceLine[] = [
	c3.n('narrator_019_duplicated', "At first, I thought I'd accidentally duplicated something.", {pauseAfter: 0.3}),
	c3.n('narrator_020_clicked', 'I clicked on the final frame.', {pauseAfter: 0.45}),
	c3.n('narrator_021_man_standing', 'There was a man standing at the far end of the hallway.', {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.6}),
	c3.n('narrator_022_very_tall', 'He was very tall. Taller than the doorframe.', {emotion: 'uneasy', pauseAfter: 0.4}),
	c3.n('narrator_023_arms_hung', 'His arms hung straight down, and his head tilted slightly forward, as though he were examining something on the floor.', {
		emotion: 'uneasy',
		pace: 0.96,
		pauseAfter: 0.4,
	}),
	c3.n('narrator_024_face_hidden', 'His face was almost completely hidden.', {emotion: 'uneasy', pauseAfter: 0.55}),
	c3.n('narrator_025_bothered', 'But something about the drawing bothered me.', {pauseAfter: 0.3}),
	c3.n('narrator_026_my_style', 'It matched my animation style perfectly.', {pauseAfter: 0.3}),
	c3.n('narrator_027_same_brush', 'The same brush texture. The same lighting. Even the same shadows.', {pace: 0.97, pauseAfter: 0.4}),
	c3.n('narrator_028_layers', 'I checked the layers.', {pauseAfter: 0.25}),
	c3.n('narrator_029_background_door', 'Background. Lighting. Ceiling. Door.', {pace: 0.9, pauseAfter: 0.35, direction: 'Each word a click through the layer list.'}),
	c3.n('narrator_030_no_layer', 'There was no layer containing a man.', {emotion: 'uneasy', fearLevel: 2, pauseAfter: 0.5}),
	c3.n('narrator_031_selecting', 'I tried selecting him.', {pauseAfter: 0.3}),
	c3.n('narrator_032_nothing', 'Nothing.', {emotion: 'uneasy', pauseAfter: 0.45}),
	c3.n('narrator_033_part_of_picture', 'He was part of the picture.', {emotion: 'uneasy', fearLevel: 2, pace: 0.94, pauseAfter: 0.5}),
	c3.n('narrator_034_pressed_play', 'Then I pressed play again.', {pauseAfter: 0.3}),
	c3.n('narrator_035_he_had_moved', 'He had moved.', {
		emotion: 'whispering',
		intensity: 0.5,
		fearLevel: 3,
		pace: 0.9,
		pauseAfter: 0.8,
		fishTags: '[whispering]',
		direction: 'Whispered, as if he could hear her.',
	}),
];

// ---------------------------------------------------------------------------
// 4. ONE STEP CLOSER
// ---------------------------------------------------------------------------
const c4 = scene('closer', {emotion: 'afraid', intensity: 0.4, fearLevel: 3});
const CLOSER: VoiceLine[] = [
	c4.n('narrator_036_stared', 'I stared at the screen for a long time.', {emotion: 'uneasy', pauseAfter: 0.4}),
	c4.n('narrator_037_played_again', 'Then I played the animation again.', {emotion: 'uneasy', pauseAfter: 0.3}),
	c4.n('narrator_038_man_closer', 'The man was closer.', {pace: 0.93, pauseAfter: 0.45}),
	c4.n('narrator_039_a_meter', 'Not much. Maybe a meter.', {pauseAfter: 0.4}),
	c4.n('narrator_040_third_time', 'I played it a third time.', {pauseAfter: 0.25}),
	c4.n('narrator_041_closer', 'Closer.', {pace: 0.9, pauseAfter: 0.45}),
	c4.n('narrator_042_fourth_time', 'A fourth time.', {pauseAfter: 0.25}),
	c4.n('narrator_043_closer', 'Closer.', {pace: 0.88, volume: 0.92, pauseAfter: 0.6, direction: 'Quieter than the first "Closer".'}),
	c4.n('narrator_044_didnt_walk', "He didn't walk.", {pauseAfter: 0.3}),
	c4.n('narrator_045_no_movement', 'There was no movement between positions.', {pauseAfter: 0.3}),
	c4.n('narrator_046_appeared', 'He simply appeared somewhere new every time the animation reached its final frame.', {pauseAfter: 0.35}),
	c4.n('narrator_047_drawing_him', 'Like someone was drawing him in a different place.', {pace: 0.94, pauseAfter: 0.55}),
	c4.n('narrator_048_stopped', 'I stopped the playback.', {pauseAfter: 0.3}),
	c4.n('narrator_049_didnt_move', "For several seconds, I didn't move.", {pauseAfter: 0.4}),
	c4.n('narrator_050_heard_something', 'Then I heard something from my actual hallway.', {volume: 0.92, pauseAfter: 0.3}),
	c4.n('narrator_051_pencil_wall', 'It sounded like someone dragging a pencil across a wall.', {pace: 0.95, pauseAfter: 0.45}),
	c4.n('narrator_052_turned_around', 'I turned around.', {pauseAfter: 0.5}),
	c4.n('narrator_053_empty', 'The hallway was empty.', {pauseAfter: 0.35}),
	c4.n('narrator_054_flickering', 'But the ceiling light was flickering.', {pauseAfter: 0.35}),
	c4.n('narrator_055_like_my_animation', 'Exactly like the one in my animation.', {pace: 0.94, pauseAfter: 0.7}),
];

// ---------------------------------------------------------------------------
// 5. THE WARNING - Hana on the phone
// ---------------------------------------------------------------------------
const c5 = scene('warning', {emotion: 'afraid', intensity: 0.35, fearLevel: 3});
const WARNING: VoiceLine[] = [
	c5.n('narrator_056_called_hana', 'I called Hana.', {pauseAfter: 0.25}),
	c5.n('narrator_057_hana_worked', "She'd worked with me on animation projects before. If anyone could explain this, she could.", {emotion: 'serious', pauseAfter: 0.45}),
	c5.h('hana_001_three_am', "Mara? It's almost three in the morning.", {
		emotion: 'sleepy',
		intensity: 0.4,
		pauseAfter: 0.3,
		fishTags: '[sleepy, groggy]',
		direction: 'Just woken up by the phone. Groggy, a bit annoyed, still fond.',
	}),
	c5.m('mara_001_look_at_something', "I need you to look at something. I'm sending you a screenshot.", {
		emotion: 'afraid',
		intensity: 0.45,
		fearLevel: 3,
		pauseAfter: 0.35,
		fishTags: '[tense, quiet]',
		direction: 'Tight, trying to sound calm and not managing it.',
	}),
	c5.h('hana_002_whats_this', "What's this?", {emotion: 'confused', intensity: 0.35, pauseBefore: 0.2, pauseAfter: 0.3}),
	c5.m('mara_002_see_the_man', 'Tell me if you can see the man in the hallway.', {emotion: 'afraid', intensity: 0.45, fearLevel: 3, pauseAfter: 0.3, fishTags: '[tense, quiet]'}),
	c5.h('hana_003_creepy', "Yeah. He's creepy. Did you draw him?", {emotion: 'casual', intensity: 0.35, pauseAfter: 0.3, fishTags: '[casual, a little amused]'}),
	c5.m('mara_003_no', 'No.', {emotion: 'afraid', intensity: 0.5, fearLevel: 3, pauseAfter: 0.4, fishTags: '[quietly]'}),
	c5.h('hana_004_what_do_you_mean', 'What do you mean, no?', {emotion: 'confused', intensity: 0.45, pauseAfter: 0.25}),
	c5.m('mara_004_gets_closer', "He wasn't there before. And every time I play the animation, he gets closer.", {
		emotion: 'afraid',
		intensity: 0.55,
		fearLevel: 3,
		pauseAfter: 0.5,
		fishTags: '[scared, voice shaking slightly]',
	}),
	c5.h('hana_005_stop_playing', 'Okay. Stop playing it. Close the program.', {
		emotion: 'serious',
		intensity: 0.55,
		pauseBefore: 0.6,
		pauseAfter: 0.3,
		fishTags: '[serious, now fully awake]',
		direction: 'Suddenly awake and serious. Calm, firm instructions.',
	}),
	c5.m('mara_005_reopening', 'I already tried. It keeps reopening the same frame.', {emotion: 'afraid', intensity: 0.55, fearLevel: 3, pauseAfter: 0.3, fishTags: '[scared]'}),
	c5.h('hana_006_get_out', 'Then turn the computer off. And get out of that apartment.', {
		emotion: 'protective',
		intensity: 0.6,
		pauseAfter: 0.5,
		fishTags: '[urgent, worried]',
	}),
];

// ---------------------------------------------------------------------------
// 6. THE HALLWAY CHANGES
// ---------------------------------------------------------------------------
const c6 = scene('hallway', {emotion: 'afraid', intensity: 0.45, fearLevel: 3});
const HALLWAY: VoiceLine[] = [
	c6.n('narrator_058_keys', 'I grabbed my keys.', {pauseAfter: 0.25}),
	c6.n('narrator_059_another_second', "I wasn't going to spend another second trying to understand it.", {pauseAfter: 0.35}),
	c6.n('narrator_060_something_wrong', 'But when I reached the hallway, something was wrong.', {pauseAfter: 0.45}),
	c6.n('narrator_061_carpet', 'The carpet looked different.', {pauseAfter: 0.3}),
	c6.n('narrator_062_same_stain', 'The same stain appeared every few feet, repeating in a perfect pattern.', {pauseAfter: 0.45}),
	c6.n('narrator_063_crack', 'The crack above the bedroom door was no longer just a crack.', {pauseAfter: 0.3}),
	c6.n('narrator_064_pencil_mark', 'It was a thin, black line. Almost like a pencil mark.', {pace: 0.95, pauseAfter: 0.5}),
	c6.n('narrator_065_moved_closer', 'I moved closer.', {volume: 0.92, pauseAfter: 0.3}),
	c6.n('narrator_066_wall_wrong', 'The entire wall looked wrong.', {pauseAfter: 0.25}),
	c6.n('narrator_067_too_smooth', 'Too smooth. Too flat.', {pace: 0.93, pauseAfter: 0.3}),
	c6.n('narrator_068_photograph', 'Like someone had painted over a photograph.', {pauseAfter: 0.4}),
	c6.n('narrator_069_touched', 'I reached out and touched the surface.', {volume: 0.92, pauseAfter: 0.4}),
	c6.n('narrator_070_paper', 'It felt like paper.', {pace: 0.92, pauseAfter: 0.6}),
	c6.n('narrator_071_behind_door', 'Then, from behind the bedroom door, I heard a sound.', {pauseAfter: 0.3}),
	c6.n('narrator_072_three_taps', 'Three gentle taps.', {emotion: 'whispering', fishTags: '[whispering]', pace: 0.92, pauseAfter: 0.2}),
	c6.n('narrator_073_same_scratching', "The same scratching noise I'd heard through my computer speakers.", {emotion: 'terrified', intensity: 0.5, fearLevel: 4, pauseAfter: 0.35}),
	c6.n('narrator_074_ran_back', 'I ran back to the desk.', {emotion: 'panicked', fearLevel: 4, pauseAfter: 0.3}),
	c6.n('narrator_075_understood', 'And for the first time, I understood.', {emotion: 'uneasy', pace: 0.95, pauseAfter: 0.4}),
	c6.n('narrator_076_not_copying', "The animation wasn't copying my hallway anymore.", {emotion: 'uneasy', pauseAfter: 0.3}),
	c6.n('narrator_077_copying_animation', 'My hallway was copying the animation.', {emotion: 'uneasy', pace: 0.92, pauseAfter: 0.8}),
];

// ---------------------------------------------------------------------------
// 7. TRYING TO ERASE HIM
// ---------------------------------------------------------------------------
const c7 = scene('erase', {emotion: 'afraid', intensity: 0.5, fearLevel: 4});
const ERASE: VoiceLine[] = [
	c7.n('narrator_078_change_it', 'I needed to know whether I could change it.', {pauseAfter: 0.3}),
	c7.n('narrator_079_red_line', 'I picked up my stylus and drew a red line across the hallway wall in the animation.', {pauseAfter: 0.35}),
	c7.n('narrator_080_scraping', 'Immediately, I heard a long scraping noise.', {pauseAfter: 0.4}),
	c7.n('narrator_081_looked_behind', 'I looked behind me.', {pauseAfter: 0.45}),
	c7.n('narrator_082_real_wall', 'A red line had appeared on my real wall.', {emotion: 'terrified', pauseAfter: 0.4}),
	c7.n('narrator_083_same_length', 'The exact same length.', {pauseAfter: 0.2}),
	c7.n('narrator_084_same_position', 'The exact same position.', {pauseAfter: 0.4}),
	c7.n('narrator_085_hands_shaking', 'My hands started shaking.', {emotion: 'shaking', pauseAfter: 0.35}),
	c7.n('narrator_086_stop_the_man', 'If the animation could change the apartment, maybe I could use it to stop the man.', {emotion: 'serious', intensity: 0.5, pauseAfter: 0.35}),
	c7.n('narrator_087_white_brush', 'I selected a thick white brush.', {emotion: 'serious', pauseAfter: 0.25}),
	c7.n('narrator_088_painting_over', 'Then I started painting over him.', {emotion: 'serious', pauseAfter: 0.3}),
	c7.n('narrator_089_legs', 'First his legs.', {emotion: 'breathless', pauseAfter: 0.2}),
	c7.n('narrator_090_arms', 'Then his arms.', {emotion: 'breathless', pauseAfter: 0.2}),
	c7.n('narrator_091_head', 'Then the strange angle of his head.', {emotion: 'breathless', pauseAfter: 0.3}),
	c7.n('narrator_092_disappeared', 'I kept painting until the entire figure disappeared into the white background.', {emotion: 'breathless', pauseAfter: 0.4}),
	c7.n('narrator_093_flattened', 'I flattened the layer.', {emotion: 'serious', pauseAfter: 0.2}),
	c7.n('narrator_094_saved', 'Saved the project.', {emotion: 'serious', pauseAfter: 0.25}),
	c7.n('narrator_095_waited', 'And waited.', {emotion: 'uneasy', pace: 0.9, pauseAfter: 0.3}),
	c7.n('narrator_096_nothing_happened', 'For a few seconds, nothing happened.', {emotion: 'uneasy', pauseAfter: 0.4}),
	c7.n('narrator_097_done_it', "I thought I'd done it.", {emotion: 'tired', intensity: 0.3, fearLevel: 2, pauseAfter: 0.3, direction: 'A breath of relief.'}),
	c7.n('narrator_098_erased_him', "I thought I'd erased him.", {emotion: 'tired', intensity: 0.3, fearLevel: 2, pauseAfter: 0.5}),
	c7.n('narrator_099_hadnt_erased', "But I hadn't erased him.", {emotion: 'uneasy', fearLevel: 3, pace: 0.94, pauseAfter: 0.35}),
	c7.n('narrator_100_worse_mistake', "I'd made a much worse mistake.", {emotion: 'uneasy', fearLevel: 3, pace: 0.9, pauseAfter: 0.9}),
];

// ---------------------------------------------------------------------------
// 8. WHITE ON WHITE
// ---------------------------------------------------------------------------
const c8 = scene('whiteOnWhite', {emotion: 'uneasy', intensity: 0.4, fearLevel: 3, volume: 0.95});
const WHITE: VoiceLine[] = [
	c8.n('narrator_101_changes', 'I noticed the changes slowly.', {pauseAfter: 0.35}),
	c8.n('narrator_102_wallpaper', 'The wallpaper had lost its texture.', {pauseAfter: 0.3}),
	c8.n('narrator_103_shadows_gone', 'The shadows around the doorframe had disappeared.', {pauseAfter: 0.3}),
	c8.n('narrator_104_stains_gone', 'Even the stains were gone.', {pauseAfter: 0.35}),
	c8.n('narrator_105_unfinished', 'My apartment looked like an unfinished drawing.', {pace: 0.95, pauseAfter: 0.5}),
	c8.n('narrator_106_called_again', 'I called Hana again.', {pauseAfter: 0.35}),
	c8.m('mara_006_got_rid', 'I think I got rid of him.', {emotion: 'tired', intensity: 0.35, fearLevel: 2, pauseAfter: 0.3, fishTags: '[shaky relief]'}),
	c8.h('hana_007_what_did_you_do', 'What did you do?', {emotion: 'uneasy', intensity: 0.4, pauseAfter: 0.3}),
	c8.m('mara_007_painted_over', "I painted over him. He's gone.", {emotion: 'tired', intensity: 0.35, fearLevel: 2, pauseAfter: 0.3}),
	c8.h('hana_008_listen', 'Mara, listen to me.', {
		emotion: 'afraid',
		intensity: 0.45,
		pauseBefore: 1.1,
		pauseAfter: 0.3,
		fishTags: '[quiet, serious]',
		direction: 'After a long silence. Very quiet.',
	}),
	c8.m('mara_008_what', 'What?', {emotion: 'uneasy', intensity: 0.4, fearLevel: 3, pauseAfter: 0.3}),
	c8.h('hana_009_screenshot', "I'm looking at the screenshot you sent earlier.", {emotion: 'afraid', intensity: 0.4, pauseAfter: 0.25, fishTags: '[quiet, careful]'}),
	c8.m('mara_009_okay', 'Okay?', {emotion: 'uneasy', intensity: 0.4, fearLevel: 3, pauseAfter: 0.25}),
	c8.h('hana_010_zoomed', 'I zoomed in on the man.', {emotion: 'afraid', intensity: 0.45, pauseAfter: 0.3, fishTags: '[quiet, careful]'}),
	c8.h('hana_011_shadow', 'The light is casting a shadow behind him.', {emotion: 'afraid', intensity: 0.45, pauseAfter: 0.25, fishTags: '[quiet, careful]'}),
	c8.m('mara_010_so', 'So?', {emotion: 'uneasy', intensity: 0.45, fearLevel: 3, pauseAfter: 0.25}),
	c8.h('hana_012_shadow_ends', 'Look at where the shadow ends.', {emotion: 'afraid', intensity: 0.5, pauseAfter: 0.45, fishTags: '[quietly, scared]'}),
	c8.h('hana_013_against_wall', "He's standing right against the white wall.", {
		emotion: 'whispering',
		intensity: 0.55,
		pauseAfter: 0.7,
		fishTags: '[almost whispering, terrified]',
		direction: 'Quietly. She understands before Mara does.',
	}),
	c8.n('narrator_107_turned_wall', 'I turned toward my own wall.', {emotion: 'afraid', pauseAfter: 0.35}),
	c8.n('narrator_108_faint_outline', 'For the first time, I noticed a faint outline.', {emotion: 'afraid', pauseAfter: 0.4}),
	c8.n('narrator_109_not_black', 'Not black.', {emotion: 'afraid', pace: 0.92, pauseAfter: 0.25}),
	c8.n('narrator_110_not_gray', 'Not gray.', {emotion: 'afraid', pace: 0.92, pauseAfter: 0.3}),
	c8.n('narrator_111_white', 'White.', {emotion: 'afraid', fishTags: '[quietly, breathless]', pace: 0.88, pauseAfter: 0.5, direction: 'Quiet but clearly articulated - the key word must be understood.'}),
	c8.n('narrator_112_same_color', 'Almost the exact same color as the paint.', {emotion: 'afraid', pace: 0.95, pauseAfter: 0.4}),
	c8.m('mara_011_oh_god', 'Oh God.', {
		emotion: 'breathless',
		intensity: 0.6,
		fearLevel: 4,
		pauseAfter: 0.5,
		fishTags: '[breathless, terrified]',
		direction: 'Barely a voice. The breath goes out of her.',
	}),
];

// ---------------------------------------------------------------------------
// 9. INSIDE THE WALL
// ---------------------------------------------------------------------------
const c9 = scene('insideWall', {emotion: 'terrified', intensity: 0.55, fearLevel: 4});
const INSIDE: VoiceLine[] = [
	c9.n('narrator_113_backed_away', 'I backed away.', {pauseAfter: 0.3}),
	c9.n('narrator_114_shape_moved', 'The shape moved.', {pauseAfter: 0.35}),
	c9.n('narrator_115_not_walking', 'Not like a person walking.', {pauseAfter: 0.2}),
	c9.n('narrator_116_stretched', 'More like a drawing being stretched across paper.', {pauseAfter: 0.4}),
	c9.n('narrator_117_hand', 'The outline of a hand appeared near the ceiling.', {pauseAfter: 0.3}),
	c9.n('narrator_118_elbow', 'Then an elbow.', {pauseAfter: 0.25}),
	c9.n('narrator_119_head', 'Then the curve of a head.', {pauseAfter: 0.35}),
	c9.n('narrator_120_flashlight', 'I could barely see it unless I tilted my phone flashlight sideways.', {pauseAfter: 0.35}),
	c9.n('narrator_121_quietly', 'And the worst part was how quietly it moved.', {emotion: 'whispering', fishTags: '[whispering, scared]', pauseAfter: 0.3}),
	c9.n('narrator_122_no_breathing', 'No breathing.', {pauseAfter: 0.2}),
	c9.n('narrator_123_no_footsteps', 'No footsteps.', {pauseAfter: 0.25}),
	c9.n('narrator_124_scratching', 'Just that horrible scratching sound.', {pauseAfter: 0.3}),
	c9.n('narrator_125_inside_walls', 'It was coming from inside the walls now.', {pauseAfter: 0.4}),
	c9.n('narrator_126_smash', 'I grabbed the computer and tried to smash the screen.', {emotion: 'panicked', fearLevel: 5, pauseAfter: 0.3}),
	c9.n('narrator_127_image_stayed', 'But the image stayed there.', {pauseAfter: 0.35}),
	c9.n('narrator_128_gone_from_drawing', 'The man was gone from the drawing.', {pauseAfter: 0.25}),
	c9.n('narrator_129_blank_space', 'In his place was a blank white space.', {pauseAfter: 0.3}),
	c9.n('narrator_130_pushing_outward', 'And through that blank space, something was slowly pushing outward.', {pace: 0.95, pauseAfter: 0.5}),
	c9.n('narrator_131_hana_shouting', 'I heard Hana shouting through my phone.', {pauseAfter: 0.15}),
	c9.h('hana_014_get_out', 'Mara! Get out! Get out right now!', {
		emotion: 'screaming',
		intensity: 0.9,
		audioEffect: 'shout',
		volume: 0.8,
		pauseAfter: 0.35,
		fishTags: '[screaming, panicked]',
		direction: 'Screaming through a phone lying on the floor.',
	}),
	c9.n('narrator_132_front_door', 'I ran for the front door.', {emotion: 'panicked', fearLevel: 5, pauseAfter: 0.3}),
	c9.n('narrator_133_no_handle', 'There was no handle.', {pauseAfter: 0.35}),
	c9.n('narrator_134_no_door', "There wasn't even a door anymore.", {pauseAfter: 0.3}),
	c9.n('narrator_135_white_rectangle', 'Just a smooth white rectangle where the entrance had been.', {pace: 0.95, pauseAfter: 0.8}),
];

// ---------------------------------------------------------------------------
// 10. THE RECORDING - on camera, whispering into her phone in the closet
// ---------------------------------------------------------------------------
const c10 = scene('recording');
const W = {emotion: 'whispering' as const, intensity: 0.5, fearLevel: 4 as const, audioEffect: 'closet' as const, fishTags: '[whispering, scared]'};
const RECORDING: VoiceLine[] = [
	c10.m('mara_012_where_i_am', "That's where I am now.", {...W, pauseAfter: 0.35, direction: 'Whispering into her phone. Almost no voice.'}),
	c10.m('mara_013_closet', 'Inside the storage closet.', {...W, pauseAfter: 0.5}),
	c10.m('mara_014_recording', "I started recording this because I don't know what else to do.", {...W, pauseAfter: 0.4}),
	c10.m('mara_015_moving_outside', 'I can still hear it moving around outside.', {...W, pauseAfter: 0.45}),
	c10.m('mara_016_scratching_stops', 'Sometimes the scratching stops.', {...W, pauseAfter: 0.3}),
	c10.m('mara_017_even_worse', 'And when it does, I hear something even worse.', {...W, pauseAfter: 0.35}),
	c10.m('mara_018_dragging', 'A soft dragging sound.', {...W, pauseAfter: 0.3}),
	c10.m('mara_019_finger_paper', 'Like someone tracing a finger over paper.', {...W, pauseAfter: 0.55}),
	c10.m('mara_020_gap', "I've been watching the gap beneath the closet door.", {...W, pauseAfter: 0.3}),
	c10.m('mara_021_no_shadow', "There hasn't been a shadow.", {...W, pauseAfter: 0.25}),
	c10.m('mara_022_not_once', 'Not once.', {...W, pauseAfter: 0.55}),
	c10.m('mara_023_understand', 'I think I finally understand why.', {...W, pauseAfter: 0.4}),
	c10.m('mara_024_didnt_destroy', "When I painted over that man, I didn't destroy him.", {...W, pauseAfter: 0.3, fishTags: '[whispering, voice breaking]'}),
	c10.m('mara_025_changed_color', 'I changed his color.', {...W, pauseAfter: 0.35, fishTags: '[whispering, voice breaking]'}),
	c10.m('mara_026_invisible', 'I made him invisible against anything white.', {...W, pauseAfter: 0.3, fishTags: '[whispering, crying]'}),
	c10.m('mara_027_every_wall', 'And nearly every wall in this apartment is white.', {...W, pauseAfter: 0.4, fishTags: '[whispering, crying]'}),
	c10.m('mara_028_touching_door', "There's something touching the closet door.", {...W, intensity: 0.65, fearLevel: 5, pauseAfter: 0.6, fishTags: '[whispering, terrified]'}),
];

// ---------------------------------------------------------------------------
// 11. THE LAST SELECTION
// ---------------------------------------------------------------------------
const c11 = scene('lastSelection');
const S = {emotion: 'shaking' as const, intensity: 0.65, fearLevel: 5 as const, audioEffect: 'closet' as const, fishTags: '[whispering, trembling]'};
const LAST: VoiceLine[] = [
	c11.m('mara_029_a_face', "There's a face.", {...S, pauseAfter: 0.45}),
	c11.m('mara_030_see_it_now', 'I can see it now.', {...S, pauseAfter: 0.35}),
	c11.m('mara_031_pressed', "It's pressed against the other side.", {...S, pauseAfter: 0.35}),
	c11.m('mara_032_not_coming_through', "But it's not coming through.", {...S, pauseAfter: 0.4}),
	c11.m('mara_033_looking_at_me', "It's just... looking at me.", {...S, pace: 0.92, pauseAfter: 0.6}),
	c11.m('mara_034_wait', 'Wait.', {...S, pauseBefore: 0.2, pauseAfter: 0.4}),
	c11.m('mara_035_little_lines', 'There are little lines appearing around me.', {...S, pauseAfter: 0.3}),
	c11.m('mara_036_floor', 'On the floor.', {...S, pauseAfter: 0.2}),
	c11.m('mara_037_walls', 'On the walls.', {...S, pauseAfter: 0.25}),
	c11.m('mara_038_moving', "They're moving.", {...S, pauseAfter: 0.4}),
	c11.m('mara_039_like', 'Like...', {...S, pauseAfter: 0.35}),
	c11.m('mara_040_selection_box', 'Like a selection box.', {...S, pauseAfter: 0.6}),
	c11.m('mara_041_oh_no', 'Oh no.', {...S, fishTags: '[whispering, terrified]', pauseAfter: 0.35}),
	c11.m('mara_042_selecting_me', "Someone's selecting me.", {...S, fishTags: '[whispering, crying]', pauseAfter: 0.5}),
	c11.m('mara_043_not_drawing', "I'm not the one drawing anymore.", {
		...S,
		intensity: 0.5,
		volume: 0.85,
		fishTags: '[barely audible whisper]',
		pauseBefore: 0.4,
		pauseAfter: 0.6,
		direction: 'Barely audible. Resigned.',
	}),
];

export const VOICE_LINES: VoiceLine[] = [
	...COLD_OPEN,
	...NORMAL_NIGHT,
	...STRANGER,
	...CLOSER,
	...WARNING,
	...HALLWAY,
	...ERASE,
	...WHITE,
	...INSIDE,
	...RECORDING,
	...LAST,
];

export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
