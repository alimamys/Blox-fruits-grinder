// THE TIMELINE - single source of truth for timing.
//
// Each scene lists its spoken lines (by voice-line id) and silent beats in order.
// Start times and durations are NOT typed in by hand: they are computed from the
// real WAV durations in src/data/generated/audioManifest.json (written by
// `npm run retime`) plus each line's pauseBefore/pauseAfter. Missing audio falls
// back to a words-per-minute estimate so the project always compiles and plays.
//
//   - Change a pause:        edit pauseBefore/pauseAfter in voiceLines.ts
//   - Hold a visual longer:  edit the `hold` of a beat below
//   - Move a sound effect:   edit the `sfx` cue's marker/offset below
//   - Re-voice a line:       regenerate it, then `npm run retime`
// Visuals read the computed markers, so every cut follows the voices automatically.
import manifest from './generated/audioManifest.json';
import {CUT_IN_SHORT, SCENES_CUT_IN_SHORT, SHORT_BEAT_HOLD, shortPause, shortTail, type EditMode} from './edit';
import type {BedAutomation, BedName, Beat, SceneDef, SfxCue, Step, VoiceLine} from './types';
import {LINE_BY_ID} from './voiceLines';
import {VOICES} from './voiceConfig';

export const FPS = 24; // the brief: 24 fps
export const WIDTH = 1920;
export const HEIGHT = 1080;

const b = (beat: string, hold: number, note?: string): Beat => ({beat, hold, note});

// ---------------------------------------------------------------------------
// SCENES
// Sound philosophy: real, small sounds and silence do the work - the fluorescent hum of the
// corridor, latches clicking, heavy steps on concrete, a sack dragged a floor below. Held
// breath means held sound: when the hallway goes silent, so does the film. The heartbeat and
// the tension pulse only come in once the creature reaches her floor.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'doors',
		name: 'The doors',
		steps: [
			b('open_black', 2.4, 'black; a single latch CLICK, then doors opening one after another down a corridor; fiction disclaimer'),
			'narrator_001_sleepwalking',
			'narrator_002_exactly_306',
			'narrator_003_not_one_or_two',
			'narrator_004_all_of_them',
			b('doors_wide', 1.3, 'the corridor: every door standing open'),
			'narrator_005_peephole',
			'narrator_006_every_neighbor',
			'narrator_007_still',
			'narrator_008_facing_stairs',
			'narrator_009_nobody_talking',
			'narrator_010_breathing',
			b('held_breath', 1.0, 'silence - only the fluorescent hum'),
			'narrator_011_coming_up',
			'narrator_012_heavy',
			'narrator_013_dragging',
			'narrator_014_finally_saw',
			'narrator_015_so_afraid',
			b('creature_glimpse', 1.2, 'long grey fingers curl over the stair railing'),
			b('cut_black', 0.8, 'hard black'),
			b('title', 3.2, 'NEVER OPEN YOUR DOOR / AT 3:06 AM'),
		],
		tail: 0.2,
		beds: {hum: 0.12, room: 0.05, drone: 0},
		bedFade: 0.8,
		bedAutomation: [
			{at: 'narrator_005_peephole', fade: 1.2, set: {hum: 0.16, drone: 0.05}},
			{at: 'held_breath', fade: 0.3, set: {room: 0, drone: 0.02}},
			{at: 'narrator_011_coming_up', fade: 1.5, set: {drone: 0.1, stair: 0.06}},
			{at: 'cut_black', fade: 0.04, set: {hum: 0, room: 0, drone: 0, stair: 0}},
			{at: 'title', offset: 0.5, fade: 1.6, set: {drone: 0.06}},
		],
		sfx: [
			{sound: 'door_latch', at: 'open_black', offset: 0.5, volume: 0.9, note: 'CLICK'},
			{sound: 'doors_cascade', at: 'open_black', offset: 0.9, volume: 0.7},
			{sound: 'door_open_far', at: 'narrator_004_all_of_them', offset: 0.25, volume: 0.35},
			{sound: 'fluorescent_flicker', at: 'doors_wide', offset: 0.3, volume: 0.25, maxDuration: 1.2},
			{sound: 'steps_heavy_climb', at: 'narrator_011_coming_up', offset: 0.6, volume: 0.45, maxDuration: 4.5},
			{sound: 'sack_drag', at: 'narrator_013_dragging', offset: 0.2, volume: 0.5},
			{sound: 'railing_creak', at: 'creature_glimpse', offset: 0.15, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'newApartment',
		name: 'The new apartment',
		steps: [
			b('exterior', 1.3, 'the old brick building at night'),
			'narrator_016_moved_in',
			'narrator_017_old_building',
			'narrator_018_nothing_special',
			'narrator_019_rent_cheap',
			'narrator_020_previous_tenant',
			'narrator_021_waived_deposit',
			'narrator_022_lucky',
			'narrator_023_no_idea',
			b('asleep', 1.1, 'Sarah asleep in the dark bedroom'),
			'narrator_024_clicking',
			'narrator_025_checked_phone',
			'narrator_026_306',
			'narrator_027_door_opening',
			'narrator_028_another',
			'narrator_029_and_another',
			'narrator_030_got_out_of_bed',
			'narrator_031_mr_harris',
			'narrator_032_door_wide_open',
			'narrator_033_several_others',
			'narrator_034_facing_stairs',
			'narrator_035_whispered',
			'sarah_001_is_everything_okay',
			'narrator_036_turned_eyes',
			'narrator_037_pale',
			'narrator_038_finger_lips',
			'narrator_039_be_quiet',
		],
		tail: 0.3,
		beds: {room: 0.08, hum: 0, drone: 0.03, stair: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'asleep', fade: 1.0, set: {room: 0.06, drone: 0.02}},
			{at: 'narrator_030_got_out_of_bed', fade: 1.5, set: {hum: 0.06, drone: 0.05}},
			{at: 'narrator_031_mr_harris', fade: 1.0, set: {hum: 0.12}},
		],
		sfx: [
			{sound: 'door_latch', at: 'narrator_024_clicking', offset: 1.1, volume: 0.35},
			{sound: 'door_latch', at: 'narrator_024_clicking', offset: 1.6, volume: 0.3},
			{sound: 'phone_vibrate', at: 'narrator_025_checked_phone', offset: 0.2, volume: 0.15},
			{sound: 'door_open_far', at: 'narrator_027_door_opening', offset: 0.9, volume: 0.45},
			{sound: 'door_open_far', at: 'narrator_028_another', offset: 0.5, volume: 0.4},
			{sound: 'door_open', at: 'narrator_029_and_another', offset: 0.5, volume: 0.35},
			{sound: 'footsteps_carpet', at: 'narrator_030_got_out_of_bed', offset: 0.6, volume: 0.25, maxDuration: 2.5},
		],
		overlays: [],
	},
	{
		id: 'footsteps',
		name: 'The footsteps',
		steps: [
			'narrator_040_footsteps',
			'narrator_041_downstairs',
			'narrator_042_slow',
			'narrator_043_heavy',
			'narrator_044_uneven',
			'narrator_045_one_step',
			'narrator_046_then_another',
			'narrator_047_scraping',
			'narrator_048_dragging_concrete',
			'narrator_049_ear_door',
			'narrator_050_stopped',
			'narrator_051_silence',
			b('silence_1', 1.3, 'complete silence: her ear against the door'),
			'narrator_052_womans_voice',
			'woman_001_dont_take_him',
			'narrator_053_man_whispering',
			'man_001_dont_look',
			'narrator_054_scream',
			b('scream_1', 1.9, 'a scream from below, cut off'),
			'narrator_055_terrible',
			'narrator_056_few_seconds',
			'narrator_057_stopped',
			'narrator_058_dragging_floor',
			'narrator_059_door_closing',
			'narrator_060_started_again',
			'narrator_061_closer',
			'narrator_062_coming_upstairs',
		],
		tail: 0.3,
		beds: {room: 0.05, hum: 0.08, stair: 0.08, drone: 0.06},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_050_stopped', fade: 0.5, set: {drone: 0.03, hum: 0.05}},
			{at: 'silence_1', fade: 0.3, set: {room: 0, hum: 0.02, stair: 0.03, drone: 0}},
			{at: 'narrator_054_scream', fade: 0.6, set: {drone: 0.08, hum: 0.06}},
			{at: 'narrator_060_started_again', fade: 1.5, set: {drone: 0.12}},
		],
		sfx: [
			{sound: 'step_heavy_1', at: 'narrator_042_slow', offset: 0.55, volume: 0.6},
			{sound: 'step_heavy_2', at: 'narrator_043_heavy', offset: 0.55, volume: 0.65},
			{sound: 'step_heavy_3', at: 'narrator_044_uneven', offset: 0.6, volume: 0.6},
			{sound: 'step_heavy_1', at: 'narrator_045_one_step', offset: 0.5, volume: 0.65},
			{sound: 'step_heavy_2', at: 'narrator_046_then_another', offset: 0.55, volume: 0.65},
			{sound: 'sack_drag', at: 'narrator_047_scraping', offset: 1.5, volume: 0.55},
			{sound: 'scream_far_f', at: 'scream_1', offset: 0.15, volume: 0.75},
			{sound: 'sack_drag_wet', at: 'narrator_058_dragging_floor', offset: 0.4, volume: 0.45},
			{sound: 'door_close_far', at: 'narrator_059_door_closing', offset: 0.9, volume: 0.6},
			{sound: 'steps_heavy_climb', at: 'narrator_060_started_again', offset: 0.5, volume: 0.5, maxDuration: 5},
			{sound: 'step_heavy_3', at: 'narrator_061_closer', offset: 0.9, volume: 0.8},
		],
		overlays: [],
	},
	{
		id: 'neighbors',
		name: 'The neighbors',
		steps: [
			'narrator_063_peephole_again',
			'narrator_064_same_positions',
			'narrator_065_mother',
			'narrator_066_crying_silently',
			'narrator_067_covered_mouth',
			'narrator_068_old_man',
			'narrator_069_nobody_moved',
			'narrator_070_nobody_escape',
			'narrator_071_occurred',
			'narrator_072_not_surprised',
			'narrator_073_expecting',
			'narrator_074_knew_exactly',
			'narrator_075_except_me',
			'narrator_076_called_police',
			'narrator_077_no_signal',
			'narrator_078_tried_again',
			'narrator_079_nothing',
			'narrator_080_wifi',
			'narrator_081_three_knocks',
			b('knocks', 1.2, 'three very soft knocks'),
			'narrator_082_froze',
			'harris_001_its_me',
			'narrator_083_hesitated',
			'narrator_084_chain',
			'narrator_085_trembling',
			'sarah_002_whats_happening',
			'narrator_086_looked_staircase',
			'harris_002_listen_carefully',
		],
		tail: 0.3,
		beds: {room: 0.05, hum: 0.12, stair: 0.04, drone: 0.06},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_076_called_police', fade: 1, set: {hum: 0.05, room: 0.07}},
			{at: 'knocks', fade: 0.2, set: {drone: 0.02, room: 0.04}},
			{at: 'narrator_084_chain', fade: 1, set: {hum: 0.12, drone: 0.06}},
		],
		sfx: [
			{sound: 'ui_error', at: 'narrator_077_no_signal', offset: -0.2, volume: 0.3},
			{sound: 'ui_error', at: 'narrator_079_nothing', offset: -0.2, volume: 0.3},
			{sound: 'knock_soft', at: 'knocks', offset: 0.15, volume: 0.8},
			{sound: 'chain_slide', at: 'narrator_084_chain', offset: 0.9, volume: 0.6},
			{sound: 'lock_turn', at: 'narrator_084_chain', offset: 0.4, volume: 0.45},
			{sound: 'door_open', at: 'narrator_084_chain', offset: 2.1, volume: 0.35, maxDuration: 0.9},
		],
		overlays: [],
	},
	{
		id: 'rule',
		name: 'The rule',
		steps: [
			'sarah_003_what_reaches',
			'harris_003_once_every_month',
			'sarah_004_what_does',
			'narrator_087_swallowed',
			'harris_004_dont_know',
			'sarah_005_what_does_it_want',
			'narrator_088_stared',
			'harris_005_one_person',
			'sarah_006_what',
			'harris_006_every_floor',
			'narrator_089_laughed',
			'sarah_007_what_agreement',
			'harris_007_leaves_others',
			'sarah_008_if_you_dont',
			'narrator_090_eyes_filled',
			'harris_008_last_time',
			'narrator_091_stepped_backward',
			'sarah_009_holding_breath',
			'harris_009_hears_breathing',
			'narrator_092_heavy_thud',
			'narrator_093_flinched',
			'harris_010_stay_calm',
			'narrator_094_stepped_away',
			'narrator_095_turned_lock',
			'narrator_096_hands_shaking',
			'narrator_097_lost_his_mind',
			'narrator_098_another_scream',
			b('scream_2', 1.4, 'a second scream from downstairs'),
			'narrator_099_wet_dragging',
			b('wet_drag', 1.6, 'the long wet drag'),
			'narrator_100_truth',
		],
		tail: 0.3,
		beds: {hum: 0.12, room: 0.04, drone: 0.05, stair: 0.04},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_095_turned_lock', fade: 1, set: {hum: 0.04, room: 0.07, drone: 0.07}},
			{at: 'scream_2', fade: 0.4, set: {drone: 0.1}},
		],
		sfx: [
			{sound: 'thud_heavy_far', at: 'narrator_092_heavy_thud', offset: -0.35, volume: 0.9},
			{sound: 'door_close', at: 'narrator_095_turned_lock', offset: 0.3, volume: 0.45},
			{sound: 'lock_turn', at: 'narrator_095_turned_lock', offset: 1.2, volume: 0.55},
			{sound: 'scream_far_f', at: 'scream_2', offset: 0.1, volume: 0.6},
			{sound: 'sack_drag_wet', at: 'wet_drag', offset: 0.0, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'creature',
		name: 'The creature',
		steps: [
			'narrator_101_back_to_peephole',
			'narrator_102_flickering',
			b('flicker', 1.3, 'the staircase lights strobe'),
			'narrator_103_moving_darkness',
			'narrator_104_mans_hand',
			'narrator_105_too_long',
			'narrator_106_curled',
			b('fingers_curl', 1.6, 'the fingers curl around the railing'),
			'narrator_107_head_appeared',
			b('head_rises', 1.3, 'the bent head rises into view'),
			'narrator_108_bent_forward',
			'narrator_109_seven_feet',
			'narrator_110_shoulders_scraped',
			'narrator_111_arms_low',
			'narrator_112_behind_it',
			'narrator_113_sack',
			'narrator_114_sack_moved',
			'narrator_115_covered_mouth',
			'narrator_116_another_step',
			'narrator_117_then_another',
			'narrator_118_grey_skin',
			'narrator_119_mouth_open',
			'narrator_120_too_wide',
			'narrator_121_third_floor',
			'narrator_122_begging',
			'man3_001_children',
			'narrator_123_sharp_cry',
			'narrator_124_silence',
			'narrator_125_sack_scraped',
			'narrator_126_continued',
			b('climb', 1.8, 'it climbs toward the fourth floor'),
			'narrator_127_fourth_floor',
			'narrator_128_toward_me',
		],
		tail: 0.3,
		beds: {hum: 0.14, stair: 0.08, drone: 0.1, room: 0.02},
		bedFade: 1,
		bedAutomation: [
			{at: 'flicker', fade: 0.2, set: {hum: 0.2}},
			{at: 'narrator_103_moving_darkness', fade: 1, set: {hum: 0.1, drone: 0.12}},
			{at: 'narrator_115_covered_mouth', fade: 1.5, set: {heart: 0.12}},
			{at: 'narrator_124_silence', fade: 0.3, set: {drone: 0.03, heart: 0.06, hum: 0.05}},
			{at: 'climb', fade: 1.5, set: {drone: 0.14, heart: 0.16, tension: 0.06}},
		],
		sfx: [
			{sound: 'fluorescent_flicker', at: 'narrator_102_flickering', offset: 0.8, volume: 0.5},
			{sound: 'fluorescent_flicker', at: 'flicker', offset: 0.1, volume: 0.6},
			{sound: 'railing_creak', at: 'narrator_106_curled', offset: 0.6, volume: 0.6},
			{sound: 'railing_creak', at: 'fingers_curl', offset: 0.3, volume: 0.7},
			{sound: 'creature_rasp', at: 'head_rises', offset: 0.3, volume: 0.45},
			{sound: 'wall_scrape', at: 'narrator_110_shoulders_scraped', offset: 0.6, volume: 0.6},
			{sound: 'sack_drag', at: 'narrator_113_sack', offset: 0.5, volume: 0.55},
			{sound: 'sack_move', at: 'narrator_114_sack_moved', offset: 0.6, volume: 0.6},
			{sound: 'step_heavy_1', at: 'narrator_116_another_step', offset: 0.7, volume: 0.75},
			{sound: 'step_heavy_2', at: 'narrator_117_then_another', offset: 0.5, volume: 0.8},
			{sound: 'creature_rasp', at: 'narrator_119_mouth_open', offset: 0.3, volume: 0.4},
			{sound: 'cry_sharp_far_m', at: 'narrator_123_sharp_cry', offset: -0.5, volume: 0.7},
			{sound: 'sack_drag', at: 'narrator_125_sack_scraped', offset: 0.4, volume: 0.6},
			{sound: 'steps_heavy_climb', at: 'climb', offset: 0.0, volume: 0.75, maxDuration: 5},
		],
		overlays: [],
	},
	{
		id: 'realization',
		name: 'The realization',
		steps: [
			'narrator_129_backed_away',
			'narrator_130_heart_pounding',
			'narrator_131_sofa',
			b('sofa', 1.1, 'she drags the sofa'),
			'narrator_132_thought',
			'narrator_133_every_floor',
			'narrator_134_from_mine',
			'narrator_135_peephole_again',
			'narrator_136_changed',
			'narrator_137_not_facing',
			'narrator_138_facing_mine',
			b('neighbors_turned', 1.6, 'every neighbour facing her door'),
			'narrator_139_every_one',
			'narrator_140_tears',
			'narrator_141_wouldnt_look',
			'narrator_142_landlord',
			'narrator_143_cheap_rent',
			'narrator_144_waived',
			'narrator_145_how_quickly',
			'narrator_146_grabbed_phone',
			'narrator_147_one_message',
			'narrator_148_from_landlord',
			b('message', 3.4, "the message on her phone: I'm sorry, Sarah. We all have families."),
			'narrator_149_stared',
			'narrator_150_sense',
			'narrator_151_not_randomly',
			'narrator_152_residents_chose',
			'narrator_153_chosen_me',
		],
		tail: 0.3,
		beds: {room: 0.06, heart: 0.18, drone: 0.08, hum: 0.04, tension: 0},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_135_peephole_again', fade: 1, set: {hum: 0.12, heart: 0.12}},
			{at: 'neighbors_turned', fade: 0.3, set: {heart: 0.2, drone: 0.12}},
			{at: 'narrator_142_landlord', fade: 1, set: {hum: 0.04, heart: 0.12}},
			{at: 'message', fade: 0.3, set: {heart: 0.06, drone: 0.05}},
			{at: 'narrator_152_residents_chose', fade: 1, set: {drone: 0.14, heart: 0.18}},
		],
		sfx: [
			{sound: 'sofa_drag', at: 'sofa', offset: 0.0, volume: 0.7},
			{sound: 'phone_vibrate', at: 'narrator_147_one_message', offset: -0.3, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'offering',
		name: 'The offering',
		steps: [
			'narrator_154_pushed_sofa',
			'narrator_155_dining_table',
			'narrator_156_pulled_handle',
			'narrator_157_footsteps_stopped',
			'narrator_158_silent',
			b('hall_silent', 1.1, 'total silence'),
			'narrator_159_blood_cold',
			'narrator_160_a_key',
			'narrator_161_sliding',
			b('key_in_lock', 1.0, 'the key slides into the lock'),
			'sarah_010_no_please',
			'narrator_162_lock_turned',
			'narrator_163_door_opening',
			'narrator_164_furniture_scraped',
			'narrator_165_pushed',
			'sarah_011_stop_please',
			'narrator_166_continued_opening',
			'narrator_167_saw_harris',
			'narrator_168_master_key',
			'narrator_169_behind_him',
			b('creature_reveal', 1.2, 'the creature behind Mr. Harris in the gap'),
			'narrator_170_head_sideways',
			'narrator_171_mouth_opened',
			'narrator_172_spoke',
			'creature_001_promised',
			'narrator_173_harris_crying',
			'sarah_012_dont_do_this',
			'narrator_174_couldnt_look',
			'harris_011_shes_yours',
			'narrator_175_bent_down',
			'narrator_176_arm_reached',
			b('arm_reach', 1.0, 'the long arm reaches through the doorway'),
			'narrator_177_screamed',
			'sarah_013_scream',
			'narrator_178_ran',
		],
		tail: 0.2,
		beds: {room: 0.05, heart: 0.18, drone: 0.1, hum: 0.03, tension: 0.05},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_157_footsteps_stopped', fade: 0.4, set: {tension: 0, heart: 0.1}},
			{at: 'hall_silent', fade: 0.2, set: {room: 0, hum: 0, drone: 0.02, heart: 0.05}},
			{at: 'key_in_lock', fade: 0.2, set: {drone: 0.08, heart: 0}, offset: 0.1},
			{at: 'sarah_010_no_please', fade: 0.2, set: {heartFast: 0.2, tension: 0.1, room: 0.05}},
			{at: 'creature_reveal', fade: 0.3, set: {tension: 0, heartFast: 0.08, drone: 0.16, hum: 0.12}},
			{at: 'narrator_175_bent_down', fade: 0.6, set: {heartFast: 0.2, tension: 0.12}},
		],
		sfx: [
			{sound: 'sofa_drag', at: 'narrator_154_pushed_sofa', offset: 0.3, volume: 0.6},
			{sound: 'table_drag', at: 'narrator_155_dining_table', offset: 0.2, volume: 0.6},
			{sound: 'key_insert', at: 'key_in_lock', offset: 0.1, volume: 0.9},
			{sound: 'lock_turn', at: 'narrator_162_lock_turned', offset: 0.1, volume: 0.9},
			{sound: 'door_force', at: 'narrator_163_door_opening', offset: 0.3, volume: 0.8},
			{sound: 'sofa_drag', at: 'narrator_164_furniture_scraped', offset: 0.2, volume: 0.6},
			{sound: 'door_force', at: 'narrator_166_continued_opening', offset: 0.2, volume: 0.7},
			{sound: 'creature_rasp', at: 'creature_reveal', offset: 0.3, volume: 0.5},
			{sound: 'creature_rasp', at: 'narrator_171_mouth_opened', offset: 0.4, volume: 0.55},
			{sound: 'creature_rasp', at: 'narrator_175_bent_down', offset: 0.5, volume: 0.5},
			{sound: 'running_carpet', at: 'narrator_178_ran', offset: 0.1, volume: 0.6, maxDuration: 2},
		],
		overlays: [],
	},
	{
		id: 'staircase',
		name: 'The staircase',
		steps: [
			'narrator_179_almost_bedroom',
			'narrator_180_ankle',
			'narrator_181_ice_cold',
			'narrator_182_fell',
			'narrator_183_carpet',
			'narrator_184_pulling',
			'narrator_185_fingernails',
			'narrator_186_doorframe',
			'narrator_187_hold_on',
			'narrator_188_harder',
			'narrator_189_corridor',
			b('dragged_out', 1.1, 'dragged out into the corridor'),
			'narrator_190_watching',
			'sarah_014_help_me',
			'narrator_191_nobody_moved',
			'narrator_192_mother_held',
			'narrator_193_old_man_floor',
			'narrator_194_reached_harris',
			'sarah_015_you_can_stop',
			'narrator_195_looked_at_me',
			'narrator_196_might_help',
			'harris_012_im_sorry',
			'narrator_197_stepped_aside',
			'narrator_198_toward_stairs',
			'narrator_199_sack_behind',
			'narrator_200_still_moving',
			'narrator_201_railing',
			'narrator_202_tightened',
			'sarah_016_dont_want_to_die',
			'narrator_203_first_step',
			'narrator_204_another',
			'narrator_205_looked_back',
			'narrator_206_still_standing',
			'narrator_207_watching',
			'narrator_208_not_a_word',
			'narrator_209_closing_doors',
			'narrator_210_one_by_one',
			b('doors_close', 2.6, 'the doors close one by one'),
			'narrator_211_my_screams',
			'narrator_212_dragging_down',
			'sarah_017_screams_fade',
			b('fade_dark', 1.9, 'her screams fade into the darkness of the stairwell'),
			b('silence_end', 1.6, 'silence'),
		],
		tail: 0.2,
		beds: {heartFast: 0.18, tension: 0.1, drone: 0.12, hum: 0.06, room: 0.03},
		bedFade: 0.6,
		bedAutomation: [
			{at: 'narrator_189_corridor', fade: 0.6, set: {hum: 0.16, room: 0, stair: 0.05}},
			{at: 'harris_012_im_sorry', fade: 0.5, set: {tension: 0.04, heartFast: 0.1}},
			{at: 'narrator_198_toward_stairs', fade: 1, set: {tension: 0.12, heartFast: 0.18, stair: 0.1}},
			{at: 'narrator_205_looked_back', fade: 1, set: {tension: 0.04, heartFast: 0.1}},
			{at: 'doors_close', fade: 2.5, set: {tension: 0, heartFast: 0, heart: 0, drone: 0.08, hum: 0.12}},
			{at: 'fade_dark', fade: 2.2, set: {drone: 0.03, hum: 0, stair: 0.04}},
			{at: 'silence_end', fade: 0.6, set: {drone: 0, stair: 0}},
		],
		sfx: [
			{sound: 'body_fall', at: 'narrator_182_fell', offset: -0.3, volume: 0.9},
			{sound: 'nails_scrape', at: 'narrator_185_fingernails', offset: 0.3, volume: 0.75},
			{sound: 'body_drag', at: 'narrator_184_pulling', offset: 0.3, volume: 0.7},
			{sound: 'body_drag', at: 'narrator_188_harder', offset: 0.3, volume: 0.8},
			{sound: 'body_drag', at: 'dragged_out', offset: 0.0, volume: 0.8},
			{sound: 'sack_drag', at: 'narrator_199_sack_behind', offset: 0.4, volume: 0.6},
			{sound: 'sack_move', at: 'narrator_200_still_moving', offset: 0.4, volume: 0.6},
			{sound: 'railing_creak', at: 'narrator_201_railing', offset: 0.5, volume: 0.6},
			{sound: 'step_heavy_1', at: 'narrator_203_first_step', offset: 0.6, volume: 0.8},
			{sound: 'body_drag', at: 'narrator_203_first_step', offset: 0.8, volume: 0.6, maxDuration: 1.2},
			{sound: 'step_heavy_3', at: 'narrator_204_another', offset: 0.4, volume: 0.8},
			{sound: 'door_close', at: 'doors_close', offset: 0.2, volume: 0.5},
			{sound: 'door_close', at: 'doors_close', offset: 0.95, volume: 0.42},
			{sound: 'door_close', at: 'doors_close', offset: 1.6, volume: 0.36},
			{sound: 'door_close', at: 'doors_close', offset: 2.3, volume: 0.3},
			{sound: 'door_close_far', at: 'doors_close', offset: 2.8, volume: 0.3},
			{sound: 'sack_drag', at: 'fade_dark', offset: 0.3, volume: 0.35},
		],
		overlays: [],
	},
	{
		id: 'nextTenant',
		name: 'The next tenant',
		steps: [
			b('morning_ext', 2.4, 'the following morning: sunlight on the brick building'),
			b('morning_kids', 2.1, 'children leave for school'),
			b('morning_greet', 1.8, 'neighbours greet each other on the stairs'),
			b('harris_coffee', 2.2, 'Mr. Harris by his window, drinking coffee'),
			b('landlord_enters', 2.1, "the landlord enters Sarah's empty apartment"),
			b('phone_found', 2.1, 'her cracked phone near the door'),
			b('phone_drawer', 2.2, 'he switches it off and puts it in a drawer'),
			b('mailbox', 2.4, "he removes Sarah's name from the mailbox"),
			b('notebook', 2.4, 'back in his office: the old notebook'),
			b('names_crossed', 2.4, 'dozens of names, every one crossed out'),
			b('new_page', 2.9, 'DECEMBER 3 - 3:06 AM / FOURTH FLOOR - ONE REPLACEMENT NEEDED'),
			b('laptop_ad', 3.2, 'the new advert'),
			b('phone_rings', 1.5, 'his phone rings'),
			'caller_001_still_available',
			'landlord_001_of_course',
			'caller_002_too_good',
			b('landlord_smiles', 0.8, 'the landlord smiles'),
			'landlord_002_lovely_place',
			'caller_003_neighbors',
			b('glance_notebook', 0.8, 'he glances at the notebook'),
			'landlord_003_very_friendly',
			'caller_004_noisy',
			b('smile_widens', 1.0, 'his smile widens'),
			'landlord_004_not_at_all',
			b('brief_pause', 0.8, 'a brief pause'),
			'landlord_005_quiet_building',
			b('cut_black_2', 1.0, 'cut to black'),
			b('clock_58', 1.0, '3:05:58'),
			b('clock_59', 1.0, '3:05:59'),
			b('clock_00', 1.2, '3:06:00'),
			b('click_1', 0.9, 'CLICK - one door opens'),
			b('click_2', 0.8, 'CLICK - another'),
			b('doors_all', 2.2, 'dozens of doors open at once'),
			b('the_end', 1.8, 'THE END'),
		],
		tail: 0,
		beds: {street: 0.2, room: 0, hum: 0, drone: 0, stair: 0},
		bedFade: 2.5,
		bedAutomation: [
			{at: 'landlord_enters', fade: 1.5, set: {street: 0.08, room: 0.05}},
			{at: 'notebook', fade: 1.5, set: {street: 0.06, room: 0.07}},
			{at: 'new_page', fade: 2, set: {drone: 0.05}},
			{at: 'cut_black_2', fade: 0.05, set: {street: 0, room: 0, drone: 0}},
			{at: 'clock_58', fade: 0.05, set: {clock: 0.5}},
			{at: 'click_1', fade: 0.05, set: {clock: 0}},
			{at: 'click_2', offset: 0.4, fade: 1.2, set: {hum: 0.14, drone: 0.08}},
			{at: 'the_end', fade: 2.0, set: {hum: 0, drone: 0}},
		],
		sfx: [
			{sound: 'door_open', at: 'landlord_enters', offset: 0.3, volume: 0.4},
			{sound: 'drawer_close', at: 'phone_drawer', offset: 2.2, volume: 0.6},
			{sound: 'mailbox_label', at: 'mailbox', offset: 1.4, volume: 0.6},
			{sound: 'page_turn', at: 'notebook', offset: 1.2, volume: 0.55},
			{sound: 'page_turn', at: 'names_crossed', offset: 0.8, volume: 0.45},
			{sound: 'page_turn', at: 'new_page', offset: 0.3, volume: 0.5},
			{sound: 'pencil_scratch', at: 'new_page', offset: 1.4, volume: 0.35, maxDuration: 1.8},
			{sound: 'typing_laptop', at: 'laptop_ad', offset: 0.4, volume: 0.45},
			{sound: 'mouse_click', at: 'laptop_ad', offset: 3.8, volume: 0.5},
			{sound: 'phone_ring_old', at: 'phone_rings', offset: 0.1, volume: 0.6, maxDuration: 2.1},
			{sound: 'door_latch', at: 'click_1', offset: 0.05, volume: 1.0},
			{sound: 'door_open', at: 'click_1', offset: 0.35, volume: 0.5},
			{sound: 'door_latch', at: 'click_2', offset: 0.05, volume: 0.95},
			{sound: 'door_open', at: 'click_2', offset: 0.35, volume: 0.45},
			{sound: 'doors_cascade', at: 'doors_all', offset: 0.0, volume: 0.9},
		],
		overlays: [],
	},
	{
		id: 'end',
		name: 'End',
		steps: [b('end_hold', 3.0, 'black, silence')],
		tail: 0,
		beds: {hum: 0, drone: 0},
		bedFade: 0.2,
		sfx: [],
		overlays: [],
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - sparse on purpose: low booms and sub drops land only on the reveals.
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	creature: {sound: 'whoosh_2', volume: 0.18},
	offering: {sound: 'whoosh_1', volume: 0.16},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	doors: [
		hit('sub_drop', 'narrator_004_all_of_them', 0.1, 0.3),
		hit('bass_hit', 'narrator_010_breathing', 0.2, 0.25),
		hit('boom_hit', 'creature_glimpse', 0.05, 0.45, {maxDuration: 1.45}),
		hit('sub_drop', 'title', 0.15, 0.25),
	],
	newApartment: [hit('sub_drop', 'narrator_023_no_idea', 0.6, 0.25), hit('bass_hit', 'narrator_026_306', 0.05, 0.3), hit('stinger', 'narrator_038_finger_lips', 0.6, 0.2)],
	footsteps: [hit('boom_hit', 'narrator_057_stopped', 0.0, 0.35), hit('sub_drop', 'narrator_062_coming_upstairs', 0.2, 0.35)],
	neighbors: [hit('sub_drop', 'narrator_073_expecting', 0.1, 0.3), hit('bass_hit', 'narrator_075_except_me', 0.0, 0.35)],
	rule: [hit('bass_hit', 'harris_005_one_person', 0.0, 0.3), hit('sub_drop', 'harris_008_last_time', 0.4, 0.3), hit('boom_hit', 'narrator_100_truth', 0.6, 0.35)],
	creature: [
		hit('stinger', 'narrator_105_too_long', 0.2, 0.3),
		hit('boom_hit', 'head_rises', 0.1, 0.45),
		hit('sub_drop', 'narrator_120_too_wide', 0.2, 0.35),
		hit('riser_short', 'narrator_128_toward_me', -1.5, 0.25),
		hit('boom_hit', 'narrator_128_toward_me', 0.4, 0.45),
	],
	realization: [hit('boom_hit', 'neighbors_turned', 0.05, 0.5), hit('sub_drop', 'message', 0.4, 0.35), hit('boom_hit', 'narrator_153_chosen_me', 0.5, 0.45)],
	offering: [
		hit('stinger', 'key_in_lock', 0.2, 0.35),
		hit('boom_hit', 'creature_reveal', 0.0, 0.5),
		hit('sub_drop', 'creature_001_promised', -0.1, 0.4),
		hit('riser_short', 'arm_reach', -1.0, 0.3),
		hit('boom_hit', 'arm_reach', 0.2, 0.55),
	],
	staircase: [hit('boom_hit', 'narrator_180_ankle', 0.4, 0.5), hit('sub_drop', 'harris_012_im_sorry', 0.5, 0.35), hit('sub_drop', 'doors_close', 2.8, 0.35)],
	nextTenant: [hit('sub_drop', 'new_page', 1.0, 0.25), hit('boom_hit', 'click_1', 0.0, 0.5), hit('boom_hit', 'doors_all', 0.0, 0.6), hit('sub_drop', 'the_end', 0.0, 0.3)],
};

// ---------------------------------------------------------------------------
// TIMING COMPUTATION
// ---------------------------------------------------------------------------
type ManifestEntry = {duration: number; peak?: number; provider?: string};
const FILES = (manifest as {files: Record<string, ManifestEntry>}).files ?? {};

export const audioExists = (file: string) => Boolean(FILES[file]);
export const audioDuration = (file: string): number | null => FILES[file]?.duration ?? null;

const WPS = 2.75; // fallback words per second at pace 1.0

/** Real duration of a voice line, or an estimate if the WAV has not been generated yet. */
export const lineDuration = (l: VoiceLine): number => {
	const real = audioDuration(l.filename);
	if (real !== null) return real;
	const words = (l.spokenText ?? l.text).split(/\s+/).filter(Boolean).length;
	const speed = VOICES[l.character].baseSpeed * l.pace;
	return Math.max(0.6, words / (WPS * speed) + 0.25);
};

const BREATH_BEFORE = new Set(['shakyInhale', 'sharpInhale', 'fastBreathing', 'exhale']);
const FEMALE = new Set(['narrator', 'sarah', 'caller', 'womanBelow']);

export const breathSound = (l: VoiceLine): string | null => {
	if (l.breath === 'none') return null;
	// expressive TTS / recorded takes perform the breath themselves - no synthetic breath on top
	const provider = FILES[l.filename]?.provider;
	if (provider && ['elevenlabs', 'openai', 'chatterbox', 'fish'].includes(provider)) return null;
	const g = FEMALE.has(l.character) ? 'f' : 'm';
	const map: Record<string, string> = {
		shakyInhale: 'breath_shaky_inhale',
		sharpInhale: 'breath_sharp_inhale',
		fastBreathing: 'breath_fast',
		raggedBreathing: 'breath_ragged',
		exhale: 'breath_exhale',
		cryingBreath: 'breath_crying',
	};
	return `${map[l.breath]}_${g}`;
};

export interface Span {
	start: number; // seconds, absolute
	end: number;
}

export interface TimedLine extends Span {
	line: VoiceLine;
	exists: boolean;
	volume: number;
	overlay: boolean;
}

export interface TimedSfx extends Span {
	sound: string;
	volume: number;
	maxDuration?: number;
}

export interface SceneTiming {
	id: string;
	name: string;
	index: number;
	start: number;
	duration: number;
	startFrame: number;
	durationInFrames: number;
	/** Concatenated narrator text of the scene (for reference / captions). */
	narrationText: string;
	/** Character dialogue line ids in order. */
	dialogueIds: string[];
	/** All markers (lines + beats) in absolute seconds. */
	markers: Record<string, Span>;
	lines: TimedLine[];
	sfx: TimedSfx[];
	def: SceneDef;
}

export interface BedKey {
	t: number; // seconds absolute
	v: number;
}

export interface Timeline {
	scenes: SceneTiming[];
	totalSeconds: number;
	totalFrames: number;
	lines: TimedLine[];
	sfx: TimedSfx[];
	beds: Record<BedName, BedKey[]>;
	markers: Record<string, Span & {scene: string}>;
}

const BED_NAMES: BedName[] = ['room', 'hum', 'stair', 'drone', 'tension', 'heart', 'heartFast', 'street', 'clock'];

const toFrame = (s: number) => Math.round(s * FPS);

const isBeat = (s: Step): s is Beat => typeof s !== 'string';

const stepsForEdit = (def: SceneDef, mode: EditMode): Step[] => {
	if (mode === 'full') return def.steps;
	return def.steps
		.filter((s) => !CUT_IN_SHORT.has(isBeat(s) ? s.beat : s))
		.map((s) => (isBeat(s) && SHORT_BEAT_HOLD[s.beat] !== undefined ? {...s, hold: SHORT_BEAT_HOLD[s.beat]} : s));
};

export const buildTimeline = (mode: EditMode = 'short'): Timeline => {
	const short = mode === 'short';
	let cursor = 0;
	const scenes: SceneTiming[] = [];
	const allLines: TimedLine[] = [];
	const allSfx: TimedSfx[] = [];
	const globalMarkers: Timeline['markers'] = {};
	const beds = Object.fromEntries(BED_NAMES.map((n) => [n, [{t: 0, v: 0}]])) as Record<BedName, BedKey[]>;
	const bedState = Object.fromEntries(BED_NAMES.map((n) => [n, 0])) as Record<BedName, number>;

	const pushBed = (t: number, fade: number, set: Partial<Record<BedName, number>>) => {
		for (const [name, value] of Object.entries(set) as Array<[BedName, number]>) {
			const keys = beds[name];
			// hold the current value until t, then ramp to the new one
			keys.push({t, v: bedState[name]});
			keys.push({t: t + Math.max(0.01, fade), v: value});
			bedState[name] = value;
		}
	};

	SCENES.filter((def) => !(short && SCENES_CUT_IN_SHORT.has(def.id))).forEach((def, index) => {
		// Scenes start on whole frames so Sequence boundaries are exact.
		const sceneStart = toFrame(cursor) / FPS;
		let t = sceneStart;
		const markers: Record<string, Span> = {};
		const lines: TimedLine[] = [];

		for (const step of stepsForEdit(def, mode)) {
			if (isBeat(step)) {
				markers[step.beat] = {start: t, end: t + step.hold};
				t += step.hold;
				continue;
			}
			const l = LINE_BY_ID[step];
			if (!l) throw new Error(`timeline: unknown voice line "${step}" in scene ${def.id}`);
			const breath = breathSound(l);
			const breathLead = breath && BREATH_BEFORE.has(l.breath) ? 0.45 : 0;
			const start = Math.max(sceneStart, t + l.pauseBefore + breathLead);
			const dur = lineDuration(l);
			const tl: TimedLine = {line: l, start, end: start + dur, exists: audioExists(l.filename), volume: l.volume, overlay: false};
			lines.push(tl);
			markers[l.id] = {start, end: start + dur};
			const breathTail = breath && !BREATH_BEFORE.has(l.breath) ? 0.9 : 0;
			t = start + dur + (short ? shortPause(l.id, l.pauseAfter) : l.pauseAfter) + breathTail;
			if (breath) {
				const bs = BREATH_BEFORE.has(l.breath) ? start - 0.55 : start + dur + 0.05;
				allSfx.push({sound: breath, start: bs, end: bs + 1.5, volume: l.character === 'narrator' ? 0.3 : 0.42});
			}
		}
		t += short ? shortTail(def.tail) : def.tail;
		const sceneEnd = toFrame(t) / FPS;

		const resolve = (at: string, offset = 0, fromEnd = false) => {
			const m = markers[at];
			if (!m) return null; // marker cut from this edit (or a typo) - cue is skipped
			return (fromEnd ? m.end : m.start) + offset;
		};

		// beds: move to this scene's levels at its start
		pushBed(sceneStart, def.bedFade ?? 1.5, def.beds);
		for (const a of (def.bedAutomation ?? []) as BedAutomation[]) {
			const at = resolve(a.at, a.offset, a.fromEnd);
			if (at !== null) pushBed(at, a.fade, a.set);
		}

		const sfx: TimedSfx[] = [];
		const enter = def.enter ?? ENTER[def.id];
		if (enter && audioExists(`sfx/${enter.sound}.wav`)) {
			const peak: Record<string, number> = {whoosh_1: 0.36, whoosh_2: 0.5, whoosh_3: 0.74};
			const at = Math.max(0, sceneStart + (enter.offset ?? -(peak[enter.sound] ?? 0.12)));
			sfx.push({sound: enter.sound, start: at, end: at + 3, volume: enter.volume ?? 0.5});
		}
		for (const cue of [...(def.sfx as SfxCue[]), ...(HITS[def.id] ?? [])]) {
			const at = resolve(cue.at, cue.offset, cue.fromEnd);
			if (at === null) continue;
			sfx.push({sound: cue.sound, start: Math.max(0, at), end: at + (cue.maxDuration ?? 12), volume: cue.volume ?? 1, maxDuration: cue.maxDuration});
		}
		for (const ov of def.overlays) {
			const l = LINE_BY_ID[ov.line];
			const at = resolve(ov.at, ov.offset, ov.fromEnd);
			if (!l || at === null) continue;
			const dur = lineDuration(l);
			lines.push({line: l, start: at, end: at + dur, exists: audioExists(l.filename), volume: (ov.volume ?? 1) * l.volume, overlay: true});
		}

		const narrationText = lines
			.filter((x) => !x.overlay && x.line.character === 'narrator')
			.map((x) => x.line.text)
			.join(' ');
		const dialogueIds = lines.filter((x) => !x.overlay && x.line.character !== 'narrator').map((x) => x.line.id);

		const st: SceneTiming = {
			id: def.id,
			name: def.name,
			index,
			start: sceneStart,
			duration: sceneEnd - sceneStart,
			startFrame: toFrame(sceneStart),
			durationInFrames: Math.max(1, toFrame(sceneEnd) - toFrame(sceneStart)),
			narrationText,
			dialogueIds,
			markers,
			lines,
			sfx,
			def,
		};
		scenes.push(st);
		allLines.push(...lines);
		allSfx.push(...sfx);
		for (const [k, v] of Object.entries(markers)) globalMarkers[k] = {...v, scene: def.id};
		cursor = sceneEnd;
	});

	const totalFrames = toFrame(cursor);
	return {scenes, totalSeconds: cursor, totalFrames, lines: allLines, sfx: allSfx, beds, markers: globalMarkers};
};

/** The main composition's edit (Door306Horror): the whole script, as written. */
export const TIMELINE: Timeline = buildTimeline('short');
/** Identical to TIMELINE (composition Door306HorrorFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
