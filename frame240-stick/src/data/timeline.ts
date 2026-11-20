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
// Sound philosophy (from the brief): no constant horror score. Small real sounds - the
// computer fan, rain, a mouse click, a pencil on a wall - and SILENCE do the work. The
// tension pulse only runs under the painting frenzy and the wall sequence.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'coldOpen',
		name: "Cold open - the frame that shouldn't exist",
		steps: [
			b('open_black', 2.6, 'black, fan hum, double click, a 3-frame flash of the figure; fiction disclaimer'),
			'narrator_001_239_frames',
			'narrator_002_240',
			'narrator_003_extra_frame',
			'narrator_004_hadnt_drawn',
			'narrator_005_closer',
			'narrator_006_ridiculous',
			'narrator_007_cant_move',
			'narrator_008_believed',
			'narrator_009_until_that_night',
			b('figure_reveal', 1.5, 'the figure at the end of the REAL hallway, head bent sideways'),
			b('cut_black', 1.1, 'hard black - one dry scratch, no musical sting'),
			b('title', 2.8, 'FRAME 240'),
		],
		tail: 0.1,
		beds: {fan: 0.2, room: 0.08, drone: 0},
		bedFade: 0.6,
		bedAutomation: [
			{at: 'narrator_003_extra_frame', fade: 1.5, set: {drone: 0.06}},
			{at: 'narrator_009_until_that_night', fade: 1.2, set: {fan: 0.1, drone: 0.12, hum: 0.08}},
			{at: 'cut_black', fade: 0.04, set: {fan: 0, room: 0, drone: 0, hum: 0}},
			{at: 'title', offset: 0.6, fade: 1.6, set: {fan: 0.08}},
		],
		sfx: [
			{sound: 'mouse_click', at: 'open_black', offset: 0.7, volume: 0.6, note: 'double click in the dark'},
			{sound: 'mouse_click', at: 'open_black', offset: 0.86, volume: 0.55},
			{sound: 'glitch', at: 'open_black', offset: 1.45, volume: 0.25, maxDuration: 0.25, note: 'subliminal flash'},
			{sound: 'mouse_click', at: 'narrator_002_240', offset: 0.6, volume: 0.45},
			{sound: 'glitch', at: 'narrator_003_extra_frame', offset: 0.55, volume: 0.3, maxDuration: 0.3},
			{sound: 'spacebar', at: 'narrator_005_closer', offset: 0.9, volume: 0.5},
			{sound: 'pen_draw', at: 'narrator_007_cant_move', offset: 0.2, volume: 0.25, maxDuration: 2.0},
			{sound: 'scratch_dry', at: 'cut_black', offset: 0.12, volume: 0.85, note: 'AUDIO CUE: the single dry scratch'},
		],
		overlays: [],
	},
	{
		id: 'normalNight',
		name: 'A normal night',
		steps: [
			'narrator_010_name_mara',
			'narrator_011_most_nights',
			'narrator_012_finishing',
			'narrator_013_nothing_complicated',
			'narrator_014_own_hallway',
			'narrator_015_crack_carpet_stain',
			'narrator_016_three_hours',
			'narrator_017_saved',
			'narrator_018_extra_frame',
		],
		tail: 0.2,
		beds: {rain: 0.26, fan: 0.16, room: 0.1, drone: 0, hum: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_010_name_mara', offset: 2.2, fade: 1.2, set: {rain: 0.16, fan: 0.2}},
			{at: 'narrator_018_extra_frame', fade: 1.5, set: {rain: 0.08, drone: 0.05}},
		],
		sfx: [
			{sound: 'chair_creak', at: 'narrator_011_most_nights', offset: 0.6, volume: 0.35},
			{sound: 'mug_set', at: 'narrator_011_most_nights', offset: 2.6, volume: 0.35},
			{sound: 'pen_draw', at: 'narrator_012_finishing', offset: 0.4, volume: 0.25, maxDuration: 2.5},
			{sound: 'light_flicker', at: 'narrator_013_nothing_complicated', offset: 1.2, volume: 0.12, maxDuration: 1.2, note: 'the animation through her speakers'},
			{sound: 'key_tap', at: 'narrator_017_saved', offset: 0.9, volume: 0.45},
			{sound: 'key_tap', at: 'narrator_017_saved', offset: 1.02, volume: 0.4},
			{sound: 'chair_creak', at: 'narrator_017_saved', offset: 2.2, volume: 0.3},
			{sound: 'mouse_click', at: 'narrator_018_extra_frame', offset: 0.9, volume: 0.5},
		],
		overlays: [],
	},
	{
		id: 'stranger',
		name: 'The stranger',
		steps: [
			'narrator_019_duplicated',
			'narrator_020_clicked',
			'narrator_021_man_standing',
			'narrator_022_very_tall',
			'narrator_023_arms_hung',
			'narrator_024_face_hidden',
			'narrator_025_bothered',
			'narrator_026_my_style',
			'narrator_027_same_brush',
			'narrator_028_layers',
			'narrator_029_background_door',
			'narrator_030_no_layer',
			'narrator_031_selecting',
			'narrator_032_nothing',
			'narrator_033_part_of_picture',
			'narrator_034_pressed_play',
			b('playback_1', 4.4, 'the animation plays; at the last frame the man is halfway down the hall'),
			'narrator_035_he_had_moved',
		],
		tail: 0.2,
		beds: {fan: 0.18, rain: 0.08, room: 0.08, drone: 0.04},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_030_no_layer', fade: 2, set: {drone: 0.08}},
			{at: 'playback_1', fade: 0.5, set: {rain: 0.04, drone: 0.03}},
			{at: 'narrator_035_he_had_moved', offset: -0.3, fade: 0.3, set: {fan: 0.1, drone: 0.12}},
		],
		sfx: [
			{sound: 'mouse_click', at: 'narrator_019_duplicated', offset: 0.5, volume: 0.35},
			{sound: 'mouse_click', at: 'narrator_019_duplicated', offset: 1.4, volume: 0.35},
			{sound: 'stylus_tap', at: 'narrator_020_clicked', offset: 0.75, volume: 0.6},
			{sound: 'mouse_click', at: 'narrator_028_layers', offset: 0.5, volume: 0.4},
			{sound: 'mouse_click', at: 'narrator_029_background_door', offset: 0.05, volume: 0.35},
			{sound: 'mouse_click', at: 'narrator_029_background_door', offset: 0.75, volume: 0.35},
			{sound: 'mouse_click', at: 'narrator_029_background_door', offset: 1.45, volume: 0.35},
			{sound: 'mouse_click', at: 'narrator_029_background_door', offset: 2.05, volume: 0.35},
			{sound: 'pen_draw', at: 'narrator_031_selecting', offset: 0.3, volume: 0.3, maxDuration: 1.2},
			{sound: 'ui_error', at: 'narrator_032_nothing', offset: -0.1, volume: 0.35},
			{sound: 'spacebar', at: 'narrator_034_pressed_play', offset: 0.8, volume: 0.55},
			{sound: 'light_flicker', at: 'playback_1', offset: 0.6, volume: 0.1, maxDuration: 2.5, note: 'the animation, quietly through her speakers'},
		],
		overlays: [],
	},
	{
		id: 'closer',
		name: 'One step closer',
		steps: [
			'narrator_036_stared',
			'narrator_037_played_again',
			'narrator_038_man_closer',
			'narrator_039_a_meter',
			'narrator_040_third_time',
			'narrator_041_closer',
			'narrator_042_fourth_time',
			'narrator_043_closer',
			'narrator_044_didnt_walk',
			'narrator_045_no_movement',
			'narrator_046_appeared',
			'narrator_047_drawing_him',
			'narrator_048_stopped',
			'narrator_049_didnt_move',
			'narrator_050_heard_something',
			b('scratch_1', 1.8, 'AUDIO CUE: a faint, slow scratch against a hard surface'),
			'narrator_051_pencil_wall',
			'narrator_052_turned_around',
			'narrator_053_empty',
			'narrator_054_flickering',
			'narrator_055_like_my_animation',
		],
		tail: 0.2,
		beds: {fan: 0.18, room: 0.08, drone: 0.06, rain: 0.05},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_048_stopped', offset: 0.4, fade: 0.8, set: {fan: 0.12, drone: 0.08}},
			{at: 'scratch_1', offset: -0.3, fade: 0.3, set: {fan: 0.05, drone: 0.02, rain: 0, room: 0.05}},
			{at: 'narrator_052_turned_around', fade: 1, set: {drone: 0.1}},
			{at: 'narrator_054_flickering', fade: 0.4, set: {hum: 0.22}},
		],
		sfx: [
			{sound: 'spacebar', at: 'narrator_037_played_again', offset: 0.9, volume: 0.5},
			{sound: 'spacebar', at: 'narrator_040_third_time', offset: 0.7, volume: 0.5},
			{sound: 'spacebar', at: 'narrator_042_fourth_time', offset: 0.5, volume: 0.5},
			{sound: 'spacebar', at: 'narrator_048_stopped', offset: 0.6, volume: 0.6},
			{sound: 'pencil_scratch', at: 'scratch_1', offset: 0.1, volume: 0.55},
			{sound: 'chair_creak', at: 'narrator_052_turned_around', offset: 0.1, volume: 0.45},
			{sound: 'light_flicker', at: 'narrator_054_flickering', offset: 0.1, volume: 0.45, maxDuration: 3.4},
		],
		overlays: [],
	},
	{
		id: 'warning',
		name: 'The warning',
		steps: [
			'narrator_056_called_hana',
			'narrator_057_hana_worked',
			'hana_001_three_am',
			'mara_001_look_at_something',
			b('notification', 1.1, 'screenshot sent - notification'),
			'hana_002_whats_this',
			'mara_002_see_the_man',
			'hana_003_creepy',
			'mara_003_no',
			'hana_004_what_do_you_mean',
			'mara_004_gets_closer',
			b('silence_call', 1.3, 'silence on the line'),
			'hana_005_stop_playing',
			'mara_005_reopening',
			'hana_006_get_out',
			b('scratch_2', 1.8, 'AUDIO CUE: the scratching again, louder'),
		],
		tail: 0.15,
		beds: {fan: 0.14, room: 0.08, drone: 0.05, hum: 0.06, rain: 0.04},
		bedFade: 1,
		bedAutomation: [
			{at: 'silence_call', fade: 0.4, set: {fan: 0.08, drone: 0.03}},
			{at: 'hana_005_stop_playing', fade: 1, set: {fan: 0.14, drone: 0.07}},
			{at: 'scratch_2', offset: -0.2, fade: 0.2, set: {fan: 0.04, hum: 0.02, rain: 0}},
		],
		sfx: [
			{sound: 'phone_ringback', at: 'narrator_056_called_hana', offset: 0.3, volume: 0.35, maxDuration: 3.6},
			{sound: 'phone_pickup', at: 'hana_001_three_am', offset: -0.25, volume: 0.4},
			{sound: 'phone_alert', at: 'notification', offset: 0.25, volume: 0.45},
			{sound: 'mouse_click', at: 'mara_005_reopening', offset: 0.3, volume: 0.45},
			{sound: 'mouse_click', at: 'mara_005_reopening', offset: 1.1, volume: 0.45},
			{sound: 'ui_refresh', at: 'mara_005_reopening', offset: 1.5, volume: 0.35},
			{sound: 'pencil_scratch', at: 'scratch_2', offset: 0.05, volume: 0.95},
		],
		overlays: [],
	},
	{
		id: 'hallway',
		name: 'The hallway changes',
		steps: [
			'narrator_058_keys',
			'narrator_059_another_second',
			'narrator_060_something_wrong',
			'narrator_061_carpet',
			'narrator_062_same_stain',
			'narrator_063_crack',
			'narrator_064_pencil_mark',
			'narrator_065_moved_closer',
			'narrator_066_wall_wrong',
			'narrator_067_too_smooth',
			'narrator_068_photograph',
			'narrator_069_touched',
			'narrator_070_paper',
			b('finger_line', 2.0, 'a faint black line follows her fingertip'),
			'narrator_071_behind_door',
			'narrator_072_three_taps',
			b('taps', 2.6, 'AUDIO CUE: tap. tap. tap.'),
			'narrator_073_same_scratching',
			'narrator_074_ran_back',
			'narrator_075_understood',
			'narrator_076_not_copying',
			'narrator_077_copying_animation',
		],
		tail: 0.2,
		beds: {fan: 0.06, room: 0.1, hum: 0.14, drone: 0.07},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_065_moved_closer', fade: 2, set: {hum: 0.1, drone: 0.1}},
			{at: 'taps', offset: -0.2, fade: 0.3, set: {fan: 0.02, hum: 0.04, drone: 0.02, room: 0.05}},
			{at: 'narrator_074_ran_back', fade: 0.5, set: {fan: 0.16, hum: 0.06, drone: 0.08, room: 0.08}},
			{at: 'narrator_077_copying_animation', fade: 1.5, set: {drone: 0.14}},
		],
		sfx: [
			{sound: 'keys_grab', at: 'narrator_058_keys', offset: 0.15, volume: 0.6},
			{sound: 'chair_creak', at: 'narrator_059_another_second', offset: 0.1, volume: 0.4},
			{sound: 'footsteps_carpet', at: 'narrator_059_another_second', offset: 0.9, volume: 0.45, maxDuration: 3.2},
			{sound: 'flashlight_on', at: 'narrator_060_something_wrong', offset: -0.2, volume: 0.45},
			{sound: 'footsteps_carpet', at: 'narrator_065_moved_closer', volume: 0.35, maxDuration: 2.2},
			{sound: 'cloth_rustle', at: 'narrator_069_touched', offset: 0.4, volume: 0.35},
			{sound: 'paper_drag', at: 'finger_line', offset: 0.2, volume: 0.55, maxDuration: 1.8},
			{sound: 'door_tap', at: 'taps', offset: 0.3, volume: 0.8},
			{sound: 'door_tap', at: 'taps', offset: 1.0, volume: 0.75},
			{sound: 'door_tap', at: 'taps', offset: 1.7, volume: 0.8},
			{sound: 'pencil_scratch', at: 'narrator_073_same_scratching', offset: 0.4, volume: 0.5},
			{sound: 'running_carpet', at: 'narrator_074_ran_back', offset: 0.05, volume: 0.6, maxDuration: 2.2},
			{sound: 'chair_creak', at: 'narrator_074_ran_back', offset: 1.4, volume: 0.45},
		],
		overlays: [],
	},
	{
		id: 'erase',
		name: 'Trying to erase him',
		steps: [
			'narrator_078_change_it',
			'narrator_079_red_line',
			'narrator_080_scraping',
			'narrator_081_looked_behind',
			'narrator_082_real_wall',
			'narrator_083_same_length',
			'narrator_084_same_position',
			'narrator_085_hands_shaking',
			'narrator_086_stop_the_man',
			'narrator_087_white_brush',
			'narrator_088_painting_over',
			'narrator_089_legs',
			'narrator_090_arms',
			'narrator_091_head',
			b('painting', 1.6, 'the last strokes cover his head'),
			'narrator_092_disappeared',
			'narrator_093_flattened',
			'narrator_094_saved',
			'narrator_095_waited',
			b('silence_waited', 2.4, 'AUDIO CUE: the scratching stops. Absolute silence.'),
			'narrator_096_nothing_happened',
			'narrator_097_done_it',
			'narrator_098_erased_him',
			'narrator_099_hadnt_erased',
			'narrator_100_worse_mistake',
		],
		tail: 0.2,
		beds: {fan: 0.16, room: 0.08, drone: 0.06, hum: 0.04},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_088_painting_over', fade: 1.5, set: {tension: 0.14}},
			{at: 'narrator_095_waited', fade: 0.6, set: {tension: 0, drone: 0.03}},
			{at: 'silence_waited', fade: 0.05, set: {fan: 0, room: 0, drone: 0, hum: 0, tension: 0}},
			{at: 'narrator_097_done_it', fade: 2.5, set: {fan: 0.1, room: 0.06}},
			{at: 'narrator_099_hadnt_erased', fade: 1.5, set: {drone: 0.12}},
		],
		sfx: [
			{sound: 'pen_draw', at: 'narrator_079_red_line', offset: 1.0, volume: 0.45, maxDuration: 2.4},
			{sound: 'scrape_long', at: 'narrator_080_scraping', offset: 0.4, volume: 0.8},
			{sound: 'chair_creak', at: 'narrator_081_looked_behind', offset: 0.05, volume: 0.4},
			{sound: 'mouse_click', at: 'narrator_087_white_brush', offset: 0.6, volume: 0.45},
			{sound: 'pen_draw', at: 'narrator_088_painting_over', offset: 0.5, volume: 0.45},
			{sound: 'pencil_scratch', at: 'narrator_088_painting_over', offset: 0.8, volume: 0.22, note: 'the scratching continues from the hallway'},
			{sound: 'pen_draw', at: 'narrator_089_legs', volume: 0.45},
			{sound: 'pen_draw', at: 'narrator_090_arms', volume: 0.45},
			{sound: 'pencil_scratch', at: 'narrator_090_arms', offset: 0.3, volume: 0.25},
			{sound: 'pen_draw', at: 'narrator_091_head', volume: 0.5},
			{sound: 'pen_draw', at: 'painting', volume: 0.55},
			{sound: 'pencil_scratch', at: 'painting', volume: 0.3, maxDuration: 1.5},
			{sound: 'pen_draw', at: 'narrator_092_disappeared', volume: 0.4, maxDuration: 2.5},
			{sound: 'pencil_scratch', at: 'narrator_093_flattened', offset: -0.4, volume: 0.25, maxDuration: 2.6},
			{sound: 'mouse_click', at: 'narrator_093_flattened', offset: 0.7, volume: 0.45},
			{sound: 'key_tap', at: 'narrator_094_saved', offset: 0.5, volume: 0.45},
			{sound: 'key_tap', at: 'narrator_094_saved', offset: 0.62, volume: 0.4},
			{sound: 'pencil_scratch', at: 'narrator_095_waited', offset: -0.2, volume: 0.3, maxDuration: 1.6, note: '...and stops dead at the silence'},
			{sound: 'breath_exhale_f', at: 'narrator_097_done_it', offset: -0.7, volume: 0.25},
		],
		overlays: [],
	},
	{
		id: 'whiteOnWhite',
		name: 'White on white',
		steps: [
			'narrator_101_changes',
			'narrator_102_wallpaper',
			'narrator_103_shadows_gone',
			'narrator_104_stains_gone',
			'narrator_105_unfinished',
			'narrator_106_called_again',
			'mara_006_got_rid',
			'hana_007_what_did_you_do',
			'mara_007_painted_over',
			'hana_008_listen',
			'mara_008_what',
			'hana_009_screenshot',
			'mara_009_okay',
			'hana_010_zoomed',
			'hana_011_shadow',
			'mara_010_so',
			'hana_012_shadow_ends',
			'hana_013_against_wall',
			'narrator_107_turned_wall',
			'narrator_108_faint_outline',
			'narrator_109_not_black',
			'narrator_110_not_gray',
			'narrator_111_white',
			'narrator_112_same_color',
			'mara_011_oh_god',
			b('peel', 1.8, 'AUDIO CUE: a slow, wet peeling sound'),
		],
		tail: 0.2,
		beds: {fan: 0.05, room: 0.07, hum: 0.05, drone: 0.08},
		bedFade: 2,
		bedAutomation: [
			{at: 'hana_008_listen', offset: -1.2, fade: 0.4, set: {drone: 0.03, fan: 0.02}},
			{at: 'hana_012_shadow_ends', fade: 1.5, set: {drone: 0.1}},
			{at: 'narrator_111_white', offset: -0.2, fade: 0.2, set: {drone: 0.02, room: 0.03, fan: 0, hum: 0}},
			{at: 'mara_011_oh_god', fade: 0.6, set: {drone: 0.14}},
		],
		sfx: [
			{sound: 'phone_ringback', at: 'narrator_106_called_again', offset: 0.5, volume: 0.3, maxDuration: 1.6},
			{sound: 'phone_pickup', at: 'mara_006_got_rid', offset: -0.3, volume: 0.35},
			{sound: 'ui_click', at: 'hana_010_zoomed', offset: 0.6, volume: 0.3},
			{sound: 'ui_click', at: 'hana_012_shadow_ends', offset: 0.5, volume: 0.3},
			{sound: 'cloth_rustle', at: 'narrator_107_turned_wall', offset: 0.1, volume: 0.35},
			{sound: 'wet_peel', at: 'peel', offset: 0.1, volume: 0.85},
		],
		overlays: [],
	},
	{
		id: 'insideWall',
		name: 'Inside the wall',
		steps: [
			'narrator_113_backed_away',
			'narrator_114_shape_moved',
			'narrator_115_not_walking',
			'narrator_116_stretched',
			'narrator_117_hand',
			'narrator_118_elbow',
			'narrator_119_head',
			'narrator_120_flashlight',
			'narrator_121_quietly',
			'narrator_122_no_breathing',
			'narrator_123_no_footsteps',
			'narrator_124_scratching',
			'narrator_125_inside_walls',
			'narrator_126_smash',
			'narrator_127_image_stayed',
			'narrator_128_gone_from_drawing',
			'narrator_129_blank_space',
			'narrator_130_pushing_outward',
			b('fingers', 1.8, 'white fingers push out through the blank space, casting tiny shadows'),
			'narrator_131_hana_shouting',
			'hana_014_get_out',
			'narrator_132_front_door',
			'narrator_133_no_handle',
			'narrator_134_no_door',
			'narrator_135_white_rectangle',
			b('impact', 1.6, 'AUDIO CUE: a low impact from inside the wall'),
		],
		tail: 0.2,
		beds: {drone: 0.12, room: 0.05, hum: 0.04, tension: 0.1},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_121_quietly', fade: 0.6, set: {tension: 0, drone: 0.06}},
			{at: 'narrator_125_inside_walls', fade: 1, set: {drone: 0.14, tension: 0.12}},
			{at: 'narrator_130_pushing_outward', fade: 0.8, set: {tension: 0.04}},
			{at: 'narrator_132_front_door', fade: 0.3, set: {tension: 0.16, drone: 0.16}},
			{at: 'impact', offset: 0.05, fade: 0.1, set: {tension: 0, drone: 0.06, hum: 0, room: 0.02}},
		],
		sfx: [
			{sound: 'footsteps_carpet', at: 'narrator_113_backed_away', offset: 0.2, volume: 0.35, maxDuration: 1.4},
			{sound: 'paper_stretch', at: 'narrator_114_shape_moved', offset: 0.2, volume: 0.5},
			{sound: 'paper_stretch', at: 'narrator_116_stretched', offset: 0.6, volume: 0.45},
			{sound: 'pencil_scratch', at: 'narrator_117_hand', offset: 0.3, volume: 0.3, maxDuration: 2},
			{sound: 'pencil_scratch', at: 'narrator_124_scratching', offset: 0.2, volume: 0.6},
			{sound: 'pencil_scratch', at: 'narrator_125_inside_walls', offset: 0.5, volume: 0.45, note: 'second layer, other side'},
			{sound: 'monitor_smash', at: 'narrator_126_smash', offset: 1.25, volume: 1.0},
			{sound: 'glitch', at: 'narrator_127_image_stayed', offset: 0.2, volume: 0.25, maxDuration: 0.4},
			{sound: 'paper_stretch', at: 'narrator_130_pushing_outward', offset: 1.4, volume: 0.6},
			{sound: 'paper_stretch', at: 'fingers', offset: 0.1, volume: 0.65},
			{sound: 'running_carpet', at: 'narrator_132_front_door', volume: 0.6, maxDuration: 1.9},
			{sound: 'hand_slap', at: 'narrator_133_no_handle', offset: -0.15, volume: 1.0},
			{sound: 'wall_thud', at: 'impact', offset: 0.05, volume: 0.95},
		],
		overlays: [],
	},
	{
		id: 'recording',
		name: 'The recording',
		steps: [
			'mara_012_where_i_am',
			'mara_013_closet',
			'mara_014_recording',
			'mara_015_moving_outside',
			'mara_016_scratching_stops',
			'mara_017_even_worse',
			'mara_018_dragging',
			'mara_019_finger_paper',
			'mara_020_gap',
			'mara_021_no_shadow',
			'mara_022_not_once',
			'mara_023_understand',
			'mara_024_didnt_destroy',
			'mara_025_changed_color',
			'mara_026_invisible',
			'mara_027_every_wall',
			b('closet_silence', 4.0, 'AUDIO CUE: the scratching stops. Four seconds of silence.'),
			'mara_028_touching_door',
		],
		tail: 0.2,
		beds: {closet: 0.2, drone: 0.05, hum: 0, fan: 0, room: 0, tension: 0},
		bedFade: 1.5,
		bedAutomation: [
			{at: 'mara_024_didnt_destroy', fade: 3, set: {drone: 0.09}},
			{at: 'closet_silence', offset: 0.2, fade: 0.08, set: {closet: 0.03, drone: 0}},
			{at: 'mara_028_touching_door', fade: 1.2, set: {closet: 0.14, drone: 0.1}},
		],
		sfx: [
			{sound: 'pencil_scratch_far', at: 'mara_015_moving_outside', offset: 0.6, volume: 0.45},
			{sound: 'pencil_scratch_far', at: 'mara_016_scratching_stops', offset: -0.3, volume: 0.4, maxDuration: 1.8},
			{sound: 'paper_drag', at: 'mara_018_dragging', offset: 0.9, volume: 0.25, maxDuration: 2.4, note: 'muffled, behind the door'},
			{sound: 'pencil_scratch_far', at: 'mara_023_understand', offset: -0.2, volume: 0.3, maxDuration: 6},
			{sound: 'pencil_scratch_far', at: 'mara_027_every_wall', offset: 0.2, volume: 0.35, maxDuration: 2.4},
			{sound: 'door_touch', at: 'mara_028_touching_door', offset: -0.5, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'lastSelection',
		name: 'The last selection',
		steps: [
			'mara_029_a_face',
			'mara_030_see_it_now',
			'mara_031_pressed',
			'mara_032_not_coming_through',
			'mara_033_looking_at_me',
			b('bulge', 1.6, 'the white surface bulges inward'),
			'mara_034_wait',
			'mara_035_little_lines',
			'mara_036_floor',
			'mara_037_walls',
			'mara_038_moving',
			'mara_039_like',
			'mara_040_selection_box',
			'mara_041_oh_no',
			'mara_042_selecting_me',
			b('click_far', 1.1, 'AUDIO CUE: a distant mouse click'),
			'mara_043_not_drawing',
			b('cursor', 2.2, 'a huge white cursor glides over the dark wall and stops above her'),
			b('final_click', 0.3, 'AUDIO CUE: one final click'),
		],
		tail: 0,
		beds: {closet: 0.14, drone: 0.08},
		bedFade: 0.5,
		bedAutomation: [
			{at: 'bulge', fade: 0.6, set: {drone: 0.12}},
			{at: 'mara_035_little_lines', fade: 2, set: {drone: 0.08}},
			{at: 'click_far', fade: 0.2, set: {closet: 0.06, drone: 0.04}},
			{at: 'cursor', fade: 1.5, set: {drone: 0.16}},
			{at: 'final_click', fade: 0.02, set: {closet: 0, drone: 0}},
		],
		sfx: [
			{sound: 'paper_stretch', at: 'bulge', offset: 0.1, volume: 0.55},
			{sound: 'mouse_click_far', at: 'click_far', offset: 0.25, volume: 0.6},
			{sound: 'mouse_click', at: 'final_click', offset: 0.02, volume: 0.85},
		],
		overlays: [],
	},
	{
		id: 'end',
		name: 'Pure white - three seconds of silence',
		steps: [b('end_white', 3.0, 'cut to pure white, complete silence')],
		tail: 0,
		sfx: [],
		overlays: [],
		beds: {fan: 0, rain: 0, room: 0, hum: 0, drone: 0, tension: 0, closet: 0},
		bedFade: 0.01,
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - kept sparse on purpose (the brief: silence beats a score). Low booms
// and sub drops land on the reveals; no whooshes between chapters except where a scene
// starts on a jolt. Cues on lines cut from an edit are skipped automatically.
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	stranger: {sound: 'whoosh_1', volume: 0.22},
	hallway: {sound: 'whoosh_2', volume: 0.2},
	insideWall: {sound: 'whoosh_3', volume: 0.25},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	coldOpen: [
		hit('sub_drop', 'narrator_003_extra_frame', 0.5, 0.3),
		hit('sub_drop', 'figure_reveal', 0.0, 0.4, {maxDuration: 1.45}), // ends with the cut: the black is silent until the scratch
		hit('sub_drop', 'title', 0.15, 0.22),
	],
	normalNight: [hit('sub_drop', 'narrator_018_extra_frame', 1.0, 0.3)],
	stranger: [
		hit('bass_hit', 'narrator_021_man_standing', 0.05, 0.3),
		hit('sub_drop', 'narrator_030_no_layer', 0.4, 0.25),
		hit('glitch', 'playback_1', 4.1, 0.3, {maxDuration: 0.3}),
		hit('boom_hit', 'playback_1', 4.12, 0.45),
	],
	closer: [
		hit('bass_hit', 'narrator_038_man_closer', -0.1, 0.3),
		hit('bass_hit', 'narrator_041_closer', -0.1, 0.38),
		hit('boom_hit', 'narrator_043_closer', -0.1, 0.45),
		hit('stinger', 'narrator_053_empty', 0.4, 0.22),
		hit('sub_drop', 'narrator_055_like_my_animation', 0.6, 0.35),
	],
	warning: [hit('sub_drop', 'mara_003_no', 0.0, 0.25), hit('boom_hit', 'scratch_2', 0.1, 0.35)],
	hallway: [
		hit('stinger', 'narrator_064_pencil_mark', 0.3, 0.25),
		hit('sub_drop', 'narrator_070_paper', 0.0, 0.3),
		hit('boom_hit', 'narrator_073_same_scratching', 0.0, 0.35),
		hit('riser_short', 'narrator_077_copying_animation', -2.2, 0.25),
		hit('boom_hit', 'narrator_077_copying_animation', 0.1, 0.5),
	],
	erase: [
		hit('stinger', 'narrator_082_real_wall', 0.1, 0.35),
		hit('sub_drop', 'narrator_099_hadnt_erased', 0.2, 0.3),
		hit('boom_hit', 'narrator_100_worse_mistake', 1.2, 0.45),
	],
	whiteOnWhite: [
		hit('sub_drop', 'hana_013_against_wall', 0.2, 0.3),
		hit('bass_hit', 'narrator_111_white', 0.0, 0.3),
		hit('boom_hit', 'mara_011_oh_god', 0.4, 0.4),
	],
	insideWall: [
		hit('stinger', 'narrator_117_hand', 0.0, 0.3),
		hit('boom_hit', 'narrator_126_smash', 1.25, 0.4),
		hit('riser_short', 'fingers', -0.8, 0.3),
		hit('stinger', 'fingers', 0.6, 0.35),
		hit('boom_hit', 'impact', 0.05, 0.5),
	],
	recording: [hit('sub_drop', 'mara_028_touching_door', 0.0, 0.35)],
	lastSelection: [
		hit('sub_drop', 'mara_029_a_face', 0.0, 0.3),
		hit('boom_hit', 'mara_040_selection_box', 0.3, 0.35),
		hit('riser_long', 'cursor', -2.5, 0.22),
	],
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
const FEMALE = new Set(['narrator', 'mara', 'hana']);

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

const BED_NAMES: BedName[] = ['fan', 'rain', 'room', 'hum', 'drone', 'tension', 'closet'];

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

/** The main composition's edit (Frame240Horror): the ~10 minute YouTube cut. */
export const TIMELINE: Timeline = buildTimeline('short');
/** Every line at its written pacing (composition Frame240HorrorFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
