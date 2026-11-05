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
import {CUT_IN_SHORT, SHORT_BEAT_HOLD, shortPause, shortTail, type EditMode} from './edit';
import type {BedAutomation, BedName, Beat, SceneDef, SfxCue, Step, VoiceLine} from './types';
import {LINE_BY_ID} from './voiceLines';
import {VOICES} from './voiceConfig';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const b = (beat: string, hold: number, note?: string): Beat => ({beat, hold, note});

// ---------------------------------------------------------------------------
// SCENES
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'disclaimer',
		name: 'Disclaimer',
		steps: [b('disclaimer_hold', 4.5)],
		tail: 0,
		sfx: [],
		overlays: [],
		beds: {},
	},
	{
		id: 'hook',
		name: 'Hook - 63 passengers, 62 names',
		steps: [
			b('hook_open', 0.35, 'smash cut from the disclaimer'),
			'narrator_001_hook',
			'narrator_002_sixty_three',
			'narrator_003_manifest',
			'narrator_004_sixty_two_names',
			'narrator_005_counted_again',
			'narrator_006_sixty_three_people',
			'narrator_007_nobody_boarded',
			'narrator_008_one_conclusion',
			'narrator_009_someone',
			'narrator_010_found_her',
			'narrator_011_old_woman',
			'narrator_012_approached',
			'crew_001_ticket',
			'narrator_013_didnt_move',
			'crew_002_maam',
			'narrator_014_turned',
			'narrator_015_pale',
			'narrator_016_smiled',
			'oldwoman_001_not_passenger',
			'narrator_017_swallowed',
			'crew_003_why',
			'narrator_018_looked_past',
			'oldwoman_002_waiting',
			'crew_004_who',
			'narrator_019_smile_gone',
			'oldwoman_003_passenger37',
			'narrator_020_checked',
			'narrator_021_daniel_clarke',
			'narrator_022_alive',
			'narrator_023_looked_back',
			'narrator_024_then_she_said',
			'oldwoman_004_shouldnt',
			b('hook_title', 3.6, 'TITLE HIT: THE 63RD PASSENGER'),
		],
		tail: 0.2,
		beds: {ocean: 0.32, engine: 0.18, wind: 0.08, drone: 0.1},
		bedFade: 0.05,
		bedAutomation: [
			// rear deck: engine falls away, wind comes up
			{at: 'narrator_010_found_her', fade: 1.2, set: {engine: 0.07, wind: 0.24, drone: 0.12}},
			// woman speaks: almost nothing but ocean and wind
			{at: 'oldwoman_001_not_passenger', offset: -0.3, fade: 0.4, set: {drone: 0.03}},
			{at: 'narrator_020_checked', fade: 0.6, set: {drone: 0.1, engine: 0.12}},
			{at: 'oldwoman_004_shouldnt', offset: -0.3, fade: 0.5, set: {drone: 0.0, engine: 0.05}},
			{at: 'hook_title', fade: 0.2, set: {drone: 0.22, ocean: 0.18, wind: 0.12, engine: 0}},
		],
		sfx: [
			{sound: 'cctv_static', at: 'hook_open', volume: 0.35, maxDuration: 0.4, note: 'smash-cut texture'},
			{sound: 'ui_click', at: 'narrator_001_hook', offset: 1.6, volume: 0.5, note: 'clicker'},
			{sound: 'ui_click', at: 'narrator_001_hook', offset: 2.3, volume: 0.5},
			{sound: 'bass_hit', at: 'narrator_002_sixty_three', offset: -0.05, volume: 0.55},
			{sound: 'ui_refresh', at: 'narrator_004_sixty_two_names', offset: -0.15, volume: 0.35},
			{sound: 'bass_hit', at: 'narrator_006_sixty_three_people', offset: -0.05, volume: 0.35},
			{sound: 'metal_creak', at: 'narrator_009_someone', offset: 0.6, volume: 0.35},
			{sound: 'footsteps_walk', at: 'narrator_012_approached', volume: 0.45, maxDuration: 2.2},
			{sound: 'metal_creak', at: 'narrator_014_turned', offset: 0.3, volume: 0.22},
			{sound: 'ui_click', at: 'narrator_020_checked', offset: 0.5, volume: 0.35},
			{sound: 'title_hit', at: 'hook_title', volume: 0.75},
		],
		overlays: [],
	},
	{
		id: 'departure',
		name: 'Earlier that night - departure and the first count',
		steps: [
			b('departure_card', 2.6, 'EARLIER THAT NIGHT 11:28 PM'),
			'narrator_025_left',
			'narrator_026_last_ferry',
			'narrator_027_counts',
			'narrator_028_weather',
			'narrator_029_crossing',
			'narrator_030_daniel_emma',
			'narrator_031_tired',
			'narrator_032_window',
			'emma_001_wake_me',
			'daniel_001_go_sleep',
			'narrator_033_nothing_unusual',
			'narrator_034_routine_count',
			'narrator_035_reached_62',
			'narrator_036_few_minutes',
			'narrator_037_sixty_three',
			'narrator_038_frowned',
			'narrator_039_sixty_three_b',
			'narrator_040_called',
			'crew2_001_count',
			'narrator_041_boarding_list',
			'narrator_042_nobody_understood',
			'narrator_043_noticed',
			'narrator_044_bench',
			'narrator_045_nobody_remembered',
			'narrator_046_no_luggage',
			'narrator_047_just_coat',
		],
		tail: 0.3,
		beds: {ocean: 0.24, engine: 0.26, wind: 0.03, drone: 0, crowd: 0.16, room: 0.2},
		bedFade: 0.8,
		bedAutomation: [
			{at: 'narrator_030_daniel_emma', fade: 1, set: {crowd: 0.12, engine: 0.2}},
			{at: 'narrator_037_sixty_three', fade: 2, set: {drone: 0.06}},
			{at: 'narrator_043_noticed', fade: 1.5, set: {crowd: 0.07, drone: 0.1, wind: 0.08}},
		],
		sfx: [
			{sound: 'ferry_horn', at: 'departure_card', offset: 0.3, volume: 0.55},
			{sound: 'ui_click', at: 'narrator_035_reached_62', offset: 0.2, volume: 0.45},
			{sound: 'ui_click', at: 'narrator_037_sixty_three', offset: -0.15, volume: 0.5},
			{sound: 'ui_click', at: 'narrator_038_frowned', offset: 0.8, volume: 0.4},
			{sound: 'ui_click', at: 'narrator_039_sixty_three_b', offset: -0.15, volume: 0.5},
			{sound: 'ui_refresh', at: 'narrator_041_boarding_list', offset: 0.2, volume: 0.3},
			{sound: 'metal_creak', at: 'narrator_044_bench', offset: 0.4, volume: 0.25},
		],
		overlays: [{line: 'crowd_001_who_is_she', at: 'narrator_044_bench', offset: 2.6, volume: 0.6}],
	},
	{
		id: 'recognition',
		name: 'Daniel recognizes her',
		steps: [
			'narrator_048_approached',
			'narrator_049_daniel',
			'narrator_050_looking',
			'narrator_051_found_daniel',
			'crew_005_sir',
			'narrator_052_laughed',
			'daniel_002_no',
			'narrator_053_saw_her',
			'narrator_054_face_changed',
			'emma_002_daniel',
			'narrator_055_didnt_answer',
			'narrator_056_wave',
			'narrator_057_stood',
			'emma_003_what_is_it',
			'narrator_058_whispered',
			'daniel_003_grandmother',
			'narrator_059_stared',
			'emma_004_so',
			'narrator_060_sick',
			'daniel_004_died',
			'narrator_061_laughed',
			'narrator_062_wasnt',
			'narrator_063_raised',
			'narrator_064_knew',
			'narrator_065_only_difference',
			'narrator_066_same',
			'narrator_067_step',
			'emma_005_no',
			'narrator_068_smiled',
			'narrator_069_flickered',
			'narrator_070_once_twice',
			'narrator_071_darkness',
			b('blackout_1', 1.1, 'full black, screams'),
			'narrator_072_screamed',
			'narrator_073_three_seconds',
			'narrator_074_bench_empty',
			'narrator_075_gone',
		],
		tail: 0.2,
		beds: {ocean: 0.2, engine: 0.24, crowd: 0.12, room: 0.2, drone: 0.06, wind: 0},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_053_saw_her', fade: 1.2, set: {crowd: 0.06, drone: 0.12}},
			// "She died twelve years ago." - drop the ambience slightly
			{at: 'daniel_004_died', offset: -0.2, fade: 0.5, set: {engine: 0.12, crowd: 0.02, ocean: 0.12, drone: 0.05}},
			{at: 'narrator_063_raised', fade: 1.5, set: {engine: 0.2, ocean: 0.18, drone: 0.12}},
			// blackout: cut almost everything instantly
			{at: 'narrator_071_darkness', fade: 0.03, set: {engine: 0.05, crowd: 0, room: 0, drone: 0.05, ocean: 0.1}},
			{at: 'narrator_073_three_seconds', offset: 1.0, fade: 0.05, set: {engine: 0.22, room: 0.18, crowd: 0.1, drone: 0.14}},
		],
		sfx: [
			{sound: 'footsteps_walk', at: 'narrator_050_looking', volume: 0.4, maxDuration: 2.4},
			{sound: 'heartbeat', at: 'narrator_054_face_changed', volume: 0.3, maxDuration: 4},
			{sound: 'light_flicker', at: 'narrator_069_flickered', offset: 0.6, volume: 0.45},
			{sound: 'light_flicker', at: 'narrator_070_once_twice', offset: 0.0, volume: 0.6, maxDuration: 0.6},
			{sound: 'light_flicker', at: 'narrator_070_once_twice', offset: 0.75, volume: 0.65, maxDuration: 0.6},
			{sound: 'lights_off', at: 'narrator_071_darkness', offset: -0.1, volume: 0.8},
			{sound: 'screams_crowd', at: 'blackout_1', offset: -0.2, volume: 0.55},
			{sound: 'lights_on', at: 'narrator_073_three_seconds', offset: 1.0, volume: 0.7},
			{sound: 'wind', at: 'narrator_074_bench_empty', volume: 0.3, maxDuration: 4},
		],
		overlays: [
			{line: 'crowd_005_lights', at: 'narrator_072_screamed', offset: 0.6, volume: 0.6},
			{line: 'crowd_002_what_happened', at: 'narrator_073_three_seconds', offset: 2.0, volume: 0.55},
		],
	},
	{
		id: 'erasure',
		name: 'Daniel disappears from the manifest',
		steps: [
			'narrator_076_rear_deck',
			'narrator_077_bathrooms',
			'narrator_078_storage',
			'narrator_079_searched',
			'narrator_080_another_count',
			'narrator_081_sixty_two',
			'narrator_082_relaxed',
			'narrator_083_purser',
			'narrator_084_sixty_one',
			'narrator_085_daniel_gone',
			'narrator_086_not_physically',
			'narrator_087_disappeared',
			'narrator_088_refreshed',
			'narrator_089_ticket',
			'narrator_090_email',
			'narrator_091_reservation',
			'narrator_092_one_passenger',
			'narrator_093_stared',
			'daniel_005_impossible',
			'narrator_094_identification',
			'narrator_095_license',
			'narrator_096_looked',
			'narrator_097_photo',
			'narrator_098_name_said',
			'narrator_099_unknown',
			'narrator_100_grabbed',
			'narrator_101_shouting',
			'emma_006_not_funny',
			'narrator_102_nobody_laughing',
		],
		tail: 0.3,
		beds: {ocean: 0.18, engine: 0.24, crowd: 0.1, room: 0.2, drone: 0.08},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_082_relaxed', fade: 1, set: {drone: 0.02, crowd: 0.14}},
			{at: 'narrator_083_purser', fade: 1.2, set: {drone: 0.12, crowd: 0.08}},
			{at: 'narrator_093_stared', fade: 1, set: {drone: 0.16}},
			{at: 'narrator_102_nobody_laughing', fade: 0.4, set: {crowd: 0, drone: 0.1}},
		],
		sfx: [
			{sound: 'metal_door', at: 'narrator_077_bathrooms', volume: 0.45},
			{sound: 'metal_door', at: 'narrator_078_storage', volume: 0.5},
			{sound: 'ui_click', at: 'narrator_081_sixty_two', offset: -0.1, volume: 0.4},
			{sound: 'glitch', at: 'narrator_084_sixty_one', offset: 1.1, volume: 0.4},
			{sound: 'glitch', at: 'narrator_085_daniel_gone', offset: 0.5, volume: 0.35},
			{sound: 'ui_refresh', at: 'narrator_088_refreshed', offset: 0.1, volume: 0.4},
			{sound: 'glitch', at: 'narrator_089_ticket', offset: 2.2, volume: 0.35},
			{sound: 'ui_click', at: 'narrator_090_email', offset: 0.2, volume: 0.35},
			{sound: 'glitch', at: 'narrator_090_email', offset: 1.5, volume: 0.3},
			{sound: 'ui_click', at: 'narrator_091_reservation', offset: 0.6, volume: 0.35},
			{sound: 'glitch', at: 'narrator_099_unknown', offset: -0.1, volume: 0.35},
			{sound: 'glitch', at: 'narrator_100_grabbed', offset: 1.0, volume: 0.3},
		],
		overlays: [],
	},
	{
		id: 'hull',
		name: 'Something under the ferry',
		steps: [
			'narrator_103_hit',
			b('thud_1', 1.3, 'THUD 1 - centre'),
			'narrator_104_stopped',
			'narrator_105_another',
			b('thud_2', 2.2, 'THUD 2 - left'),
			'narrator_106_then_another',
			b('thud_3', 2.0, 'THUD 3 - right'),
			'narrator_107_beneath',
			'narrator_108_captain_crew',
			'narrator_109_radar',
			'narrator_110_knocking',
			b('knocks_start', 1.3),
			'narrator_111_not_one',
			b('knocks_many', 2.4),
			'narrator_112_moved_away',
			'narrator_113_screamed',
			b('hull_scream', 0.7),
			'narrator_114_pa_on',
			b('pa_static_1', 1.2, 'static click + crackle'),
			'narrator_115_womans_voice',
			'pa_001_passenger37',
			'narrator_116_pale',
			'pa_002_proceed',
			'narrator_117_grabbed',
			'emma_007_no',
			b('pa_static_2', 0.7),
			'pa_003_passenger37_soft',
			'narrator_118_voice_changed',
			'pa_004_daniel',
			'narrator_119_shaking',
			'pa_005_family',
			'narrator_120_turned_off',
			'pa_006_daniel_2',
			'narrator_121_cable',
			'pa_007_daniel_3',
			'narrator_122_every_speaker',
			'pa_008_daniel_4',
			'narrator_123_phones',
			'narrator_124_no_signal',
			b('phone_message', 3.0, 'PASSENGER 37 - RETURN TO DECK'),
			'narrator_125_backed_away',
		],
		tail: 0.3,
		beds: {ocean: 0.2, engine: 0.24, crowd: 0.08, room: 0.18, drone: 0.08},
		bedFade: 0.8,
		bedAutomation: [
			{at: 'thud_1', fade: 0.05, set: {crowd: 0, drone: 0.04}},
			{at: 'narrator_108_captain_crew', fade: 1.5, set: {drone: 0.12}},
			{at: 'knocks_start', fade: 0.5, set: {drone: 0.18, crowd: 0.1}},
			{at: 'pa_static_1', fade: 0.3, set: {crowd: 0.03, drone: 0.08}},
			{at: 'pa_004_daniel', offset: -0.3, fade: 0.5, set: {engine: 0.14, drone: 0.12}},
			{at: 'narrator_123_phones', fade: 1, set: {crowd: 0.08, drone: 0.16}},
			{at: 'phone_message', fade: 0.3, set: {crowd: 0.02}},
		],
		sfx: [
			// AUDIO CUE: heavy knock beneath hull (x3, moving across the stereo field)
			{sound: 'impact_hull', at: 'thud_1', volume: 1.0},
			{sound: 'metal_creak', at: 'thud_1', offset: 0.5, volume: 0.25},
			{sound: 'impact_hull_l', at: 'thud_2', volume: 1.0},
			{sound: 'impact_hull_r', at: 'thud_3', volume: 1.05},
			{sound: 'metal_creak', at: 'thud_3', offset: 0.7, volume: 0.3},
			// AUDIO CUE: many knocks all along the hull
			{sound: 'knocking_hull', at: 'knocks_start', volume: 0.55, maxDuration: 1.3},
			{sound: 'knocking_hull', at: 'narrator_111_not_one', volume: 0.75, maxDuration: 9},
			{sound: 'scream_distant', at: 'hull_scream', offset: -0.4, volume: 0.45},
			{sound: 'pa_static', at: 'pa_static_1', volume: 0.7},
			{sound: 'pa_static', at: 'pa_static_2', volume: 0.5, maxDuration: 0.8},
			{sound: 'pa_click', at: 'narrator_120_turned_off', offset: 0.9, volume: 0.6},
			{sound: 'cable_pull', at: 'narrator_121_cable', offset: 0.9, volume: 0.6},
			{sound: 'marine_radio', at: 'pa_008_daniel_4', offset: -0.2, volume: 0.25, maxDuration: 0.5},
			{sound: 'phone_alert', at: 'narrator_123_phones', offset: 0.5, volume: 0.35},
			{sound: 'phone_alert', at: 'narrator_123_phones', offset: 1.0, volume: 0.3},
			{sound: 'phone_alert', at: 'narrator_123_phones', offset: 1.4, volume: 0.32},
			{sound: 'phone_vibrate', at: 'narrator_124_no_signal', volume: 0.3},
			{sound: 'phone_alert', at: 'phone_message', volume: 0.45},
			{sound: 'phone_vibrate', at: 'phone_message', offset: 0.3, volume: 0.35},
		],
		overlays: [
			{line: 'crowd_004_feel_that', at: 'thud_1', offset: 0.55, volume: 0.65},
			{line: 'crowd_010_what_is_that', at: 'thud_2', offset: 0.9, volume: 0.6},
			{line: 'crowd_011_under_us', at: 'knocks_many', offset: 0.6, volume: 0.6},
			{line: 'crowd_007_windows', at: 'narrator_112_moved_away', offset: 0.7, volume: 0.55},
			{line: 'crowd_003_whats_going_on', at: 'pa_static_1', offset: 0.5, volume: 0.5},
			{line: 'crowd_013_phone', at: 'phone_message', offset: 1.2, volume: 0.45},
		],
	},
	{
		id: 'navigation',
		name: 'Navigation failure and marine radio',
		steps: [
			'narrator_126_engines',
			b('engine_down', 1.0),
			'narrator_127_rushed',
			'narrator_128_nav_blank',
			'narrator_129_gps',
			'narrator_130_windshield',
			'narrator_131_no_coast',
			'narrator_132_ten_minutes',
			'narrator_133_instead',
			'narrator_134_radioed',
			'captain_001_radio_call',
			b('radio_static_1', 1.5, 'static, no answer'),
			'captain_002_radio_again',
			'narrator_135_answered',
			'harbor_001_go_ahead',
			'narrator_136_exhaled',
			'captain_003_lost_nav',
			b('radio_silence', 1.7, 'Silence.'),
			'harbor_002_confirm',
			'captain_004_ns8',
			'narrator_137_another_pause',
			'harbor_003_captain',
			'harbor_004_docked',
			'narrator_138_nobody_spoke',
			'narrator_139_looked_out',
			'captain_005_negative',
			'narrator_140_operator',
			'harbor_005_looking',
		],
		tail: 0.2,
		beds: {ocean: 0.2, engine: 0.24, drone: 0.1, crowd: 0, room: 0.05},
		bedFade: 0.5,
		bedAutomation: [
			{at: 'engine_down', fade: 3.5, set: {engine: 0.06}},
			{at: 'narrator_128_nav_blank', fade: 1, set: {bridge: 0.22, room: 0, ocean: 0.12}},
			{at: 'narrator_131_no_coast', fade: 1.5, set: {drone: 0.16}},
			{at: 'narrator_134_radioed', fade: 1, set: {drone: 0.08}},
			// "docked twenty-three minutes ago" - remove nearly all music, only bridge electronics
			{at: 'harbor_003_captain', offset: -0.4, fade: 0.6, set: {drone: 0, ocean: 0.06, engine: 0.03}},
			{at: 'narrator_139_looked_out', fade: 2, set: {drone: 0.08, ocean: 0.12}},
			{at: 'harbor_005_looking', offset: -0.2, fade: 0.4, set: {drone: 0}},
		],
		sfx: [
			{sound: 'engine_slowdown', at: 'narrator_126_engines', offset: 0.3, volume: 0.6},
			{sound: 'footsteps_running', at: 'narrator_127_rushed', volume: 0.45, maxDuration: 2.2},
			{sound: 'metal_door', at: 'narrator_127_rushed', offset: 1.6, volume: 0.4},
			{sound: 'glitch', at: 'narrator_128_nav_blank', offset: 0.4, volume: 0.25},
			{sound: 'marine_radio', at: 'captain_001_radio_call', offset: -0.25, volume: 0.45},
			{sound: 'radio_static', at: 'radio_static_1', volume: 0.5, maxDuration: 1.5},
			{sound: 'marine_radio', at: 'captain_002_radio_again', offset: -0.25, volume: 0.4},
			{sound: 'marine_radio', at: 'harbor_001_go_ahead', offset: -0.2, volume: 0.4},
			{sound: 'marine_radio', at: 'captain_003_lost_nav', offset: -0.25, volume: 0.35},
			{sound: 'marine_radio', at: 'harbor_002_confirm', offset: -0.2, volume: 0.4},
			{sound: 'marine_radio', at: 'captain_004_ns8', offset: -0.25, volume: 0.35},
			{sound: 'marine_radio', at: 'harbor_003_captain', offset: -0.2, volume: 0.4},
			{sound: 'marine_radio', at: 'captain_005_negative', offset: -0.25, volume: 0.35},
			{sound: 'marine_radio', at: 'harbor_005_looking', offset: -0.2, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'otherFerry',
		name: 'The other ferry',
		steps: [
			'narrator_141_radio_error',
			'narrator_142_photograph',
			'narrator_143_loaded',
			b('image_loading', 2.2, 'image loads line by line'),
			'narrator_144_north_star',
			'narrator_145_timestamp',
			'narrator_146_current_time',
			'narrator_147_zoomed',
			'narrator_148_there_he_was',
			'narrator_149_same_crew',
			'narrator_150_emma',
			'narrator_151_shoulder',
			'narrator_152_alone',
			'narrator_153_missing',
			'narrator_154_pointed',
			'narrator_155_end_gangway',
			'narrator_156_watching',
		],
		tail: 0.3,
		beds: {ocean: 0.1, engine: 0.04, bridge: 0.2, drone: 0.08},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_150_emma', fade: 2, set: {drone: 0.14}},
			{at: 'narrator_155_end_gangway', fade: 2, set: {drone: 0.2, bridge: 0.1}},
		],
		sfx: [
			{sound: 'data_transfer', at: 'narrator_142_photograph', offset: 1.4, volume: 0.35},
			{sound: 'data_transfer', at: 'image_loading', volume: 0.3},
			{sound: 'ui_click', at: 'narrator_147_zoomed', offset: 0.3, volume: 0.35},
			{sound: 'ui_click', at: 'narrator_150_emma', offset: -0.2, volume: 0.3},
			{sound: 'ui_click', at: 'narrator_155_end_gangway', offset: 0.8, volume: 0.3},
		],
		overlays: [],
	},
	{
		id: 'grandmotherCalls',
		name: 'The grandmother calls',
		steps: [
			'narrator_157_turned',
			'emma_008_where',
			'narrator_158_didnt_answer',
			'narrator_159_not_announcement',
			'narrator_160_quiet',
			'oldwoman_005_daniel',
			'narrator_161_walking',
			'emma_009_stop',
			'narrator_162_looked_at_her',
			'daniel_006_used_to_say',
			'emma_010_what',
			'daniel_007_exactly',
			'emma_011_shes_dead',
			'narrator_163_nodded',
			'daniel_008_i_know',
			'narrator_164_again',
			'oldwoman_006_daniel_2',
			'narrator_165_covered',
			'narrator_166_changed',
			'oldwoman_007_sweetheart',
			'narrator_167_crying',
			'narrator_168_slapped',
			'narrator_169_blinked',
			b('voice_stopped', 1.0, 'silence'),
			'narrator_170_screamed',
		],
		tail: 0.2,
		beds: {ocean: 0.16, engine: 0.06, wind: 0.1, crowd: 0.04, drone: 0.1, room: 0.1},
		bedFade: 1.5,
		bedAutomation: [
			{at: 'narrator_160_quiet', fade: 1, set: {crowd: 0, drone: 0.06, room: 0.06}},
			{at: 'oldwoman_007_sweetheart', offset: -0.4, fade: 0.6, set: {drone: 0.0, wind: 0.06}},
			{at: 'narrator_168_slapped', fade: 0.05, set: {drone: 0.1, wind: 0.1}},
			{at: 'voice_stopped', fade: 0.1, set: {drone: 0, wind: 0.04, ocean: 0.08}},
		],
		sfx: [
			{sound: 'wind', at: 'oldwoman_005_daniel', offset: -0.8, volume: 0.25, maxDuration: 3},
			{sound: 'footsteps_walk', at: 'narrator_161_walking', volume: 0.4, maxDuration: 1.6},
			{sound: 'slap', at: 'narrator_168_slapped', offset: 0.62, volume: 0.9},
			{sound: 'scream_distant', at: 'narrator_170_screamed', offset: 1.5, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'peopleInWater',
		name: 'People in the water',
		steps: [
			'narrator_171_back',
			'narrator_172_not_alone',
			'narrator_173_people',
			b('people_reveal', 2.6, 'wide: dozens of still heads'),
			'narrator_174_dozens',
			'narrator_175_not_swimming',
			'narrator_176_heads',
			'narrator_177_still',
			b('stillness', 2.4, 'almost total silence, Daniel breathing'),
			'narrator_178_raised',
			b('arm_1', 0.6),
			'narrator_179_another',
			b('arm_2', 0.5),
			'narrator_180_all',
			b('all_arms', 1.6),
			'narrator_181_stared',
			'narrator_182_smiled',
			'oldwoman_008_see',
			'narrator_183_pointed',
			'oldwoman_009_everyone',
		],
		tail: 0.3,
		// PEOPLE IN WATER: remove most ambience. Almost silent.
		beds: {ocean: 0.06, engine: 0, wind: 0.05, drone: 0.04, crowd: 0, room: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'people_reveal', fade: 2, set: {ocean: 0.02, wind: 0.03, drone: 0.02}},
			{at: 'oldwoman_008_see', offset: -0.5, fade: 1, set: {drone: 0}},
		],
		sfx: [
			{sound: 'water_lap', at: 'people_reveal', volume: 0.35},
			{sound: 'breath_fast_m', at: 'stillness', offset: 0.2, volume: 0.35},
			{sound: 'water_lap', at: 'narrator_180_all', volume: 0.25},
			{sound: 'breath_fast_m', at: 'narrator_181_stared', offset: 0.6, volume: 0.3},
		],
		overlays: [{line: 'crowd_014_look', at: 'narrator_172_not_alone', offset: 1.6, volume: 0.5}],
	},
	{
		id: 'vanish',
		name: 'Daniel disappears',
		steps: [
			'narrator_184_lights_died',
			b('blackout_2', 0.5, 'hard black 15 frames'),
			'narrator_185_darkness',
			b('dark_screams', 1.2),
			'narrator_186_screamed',
			'narrator_187_held',
			'narrator_188_struck',
			'narrator_189_another_impact',
			'narrator_190_climbing',
			b('scratches', 2.8, 'SCRATCH SCRATCH SCRATCH'),
			'narrator_191_against',
			'narrator_192_ran',
			b('running', 0.9),
			'narrator_193_emergency',
			'narrator_194_gone',
			'narrator_195_looked_down',
			'emma_012_scream',
			b('emma_breathing', 1.0),
			'narrator_196_screamed_name',
			'emma_013_daniel_2',
			'narrator_197_no_answer',
			'narrator_198_railing',
			'narrator_199_gone_too',
			'narrator_200_ocean_empty',
			'narrator_201_nothing',
			'narrator_202_engines',
			b('engines_back', 1.0),
			'narrator_203_gps',
			'narrator_204_nav_showed',
			'narrator_205_harbor_lights',
		],
		tail: 0.3,
		beds: {ocean: 0.05, wind: 0.05, drone: 0.03, engine: 0, crowd: 0, room: 0},
		bedFade: 0.03,
		bedAutomation: [
			// BLACKOUT: cut most audio instantly
			{at: 'narrator_184_lights_died', offset: 1.0, fade: 0.02, set: {ocean: 0.03, wind: 0.02, drone: 0.0}},
			{at: 'narrator_188_struck', fade: 0.5, set: {drone: 0.14, ocean: 0.1}},
			{at: 'narrator_193_emergency', fade: 0.1, set: {emergency: 0.2, drone: 0.12}},
			{at: 'narrator_194_gone', fade: 0.8, set: {drone: 0.06}},
			{at: 'narrator_198_railing', fade: 1, set: {ocean: 0.12, wind: 0.14}},
			{at: 'narrator_201_nothing', fade: 0.6, set: {drone: 0, wind: 0.08}},
			{at: 'engines_back', fade: 0.6, set: {engine: 0.26, emergency: 0, ocean: 0.2, wind: 0.06, bridge: 0.1}},
			{at: 'narrator_205_harbor_lights', fade: 2, set: {bridge: 0}},
		],
		sfx: [
			{sound: 'power_down', at: 'narrator_184_lights_died', offset: 0.7, volume: 0.9},
			{sound: 'screams_crowd', at: 'dark_screams', offset: -0.3, volume: 0.6},
			{sound: 'breath_fast_f', at: 'narrator_187_held', offset: 0.4, volume: 0.35},
			{sound: 'impact_hull_l', at: 'narrator_188_struck', offset: 1.25, volume: 1.0},
			{sound: 'impact_hull_r', at: 'narrator_189_another_impact', offset: 0.9, volume: 1.0},
			// AUDIO CUE: scratching against the metal hull, from below, all around
			{sound: 'scratch_hull', at: 'scratches', volume: 0.85},
			{sound: 'scratch_hull', at: 'narrator_191_against', offset: 0.6, volume: 0.5},
			{sound: 'footsteps_running', at: 'narrator_192_ran', volume: 0.55},
			{sound: 'screams_crowd', at: 'narrator_192_ran', offset: 0.2, volume: 0.35, maxDuration: 2},
			{sound: 'emergency_alarm', at: 'narrator_193_emergency', offset: 0.1, volume: 0.18, maxDuration: 7},
			{sound: 'lights_on', at: 'narrator_193_emergency', offset: 0.05, volume: 0.5},
			{sound: 'footsteps_running', at: 'narrator_198_railing', volume: 0.35, maxDuration: 1.6},
			{sound: 'engine_roar', at: 'narrator_202_engines', offset: 0.6, volume: 0.75},
			{sound: 'ui_refresh', at: 'narrator_203_gps', offset: 0.2, volume: 0.35},
			{sound: 'ferry_horn', at: 'narrator_205_harbor_lights', offset: 1.4, volume: 0.35},
		],
		overlays: [
			{line: 'crowd_006_oh_god', at: 'narrator_186_screamed', offset: 0.9, volume: 0.6},
			{line: 'crowd_009_help', at: 'narrator_189_another_impact', offset: 1.5, volume: 0.55},
			{line: 'crowd_008_crew', at: 'running', offset: 0.0, volume: 0.5},
			{line: 'crowd_015_mum', at: 'narrator_192_ran', offset: 0.4, volume: 0.45},
			{line: 'crowd_012_stay_calm', at: 'narrator_194_gone', offset: 0.2, volume: 0.3},
		],
	},
	{
		id: 'police',
		name: 'Police investigation',
		steps: [
			'narrator_206_police_waiting',
			'narrator_207_told',
			'narrator_208_list',
			'narrator_209_checked',
			'narrator_210_database',
			'narrator_211_photographs',
			'narrator_212_every',
			'narrator_213_wedding',
			'narrator_214_honeymoon',
			'narrator_215_christmas',
			'narrator_216_emma_screamed',
			'emma_014_husband',
			'narrator_217_records',
			'narrator_218_record',
			'narrator_219_ring',
			'narrator_220_uncomfortable',
			'police_001_whose',
			'emma_015_husbands',
			'police_002_maam',
			'narrator_221_turned_ring',
			'narrator_222_expected',
			'narrator_223_instead',
			b('ring_rotate', 1.4, 'camera rotates around the ring'),
			'narrator_224_37',
		],
		tail: 0.3,
		beds: {ocean: 0.08, room: 0.16, drone: 0.05, engine: 0, wind: 0.04},
		bedFade: 2,
		bedAutomation: [
			{at: 'narrator_212_every', fade: 1.5, set: {drone: 0.12}},
			{at: 'narrator_221_turned_ring', fade: 1, set: {drone: 0.08, room: 0.08}},
			{at: 'ring_rotate', fade: 0.6, set: {drone: 0.16}},
		],
		sfx: [
			{sound: 'ui_click', at: 'narrator_210_database', offset: 0.3, volume: 0.3},
			{sound: 'glitch', at: 'narrator_210_database', offset: 1.7, volume: 0.25},
			{sound: 'page_flip', at: 'narrator_211_photographs', offset: 0.4, volume: 0.4},
			{sound: 'page_flip', at: 'narrator_213_wedding', volume: 0.35},
			{sound: 'page_flip', at: 'narrator_214_honeymoon', volume: 0.35},
			{sound: 'page_flip', at: 'narrator_215_christmas', volume: 0.35},
			{sound: 'page_flip', at: 'narrator_217_records', offset: 0.2, volume: 0.35},
			{sound: 'ring_clink', at: 'narrator_219_ring', offset: 1.2, volume: 0.45},
			{sound: 'ring_clink', at: 'ring_rotate', offset: 0.2, volume: 0.3},
		],
		overlays: [],
	},
	{
		id: 'cctv',
		name: 'CCTV evidence',
		steps: [
			'narrator_225_security',
			'narrator_226_most',
			'narrator_227_talking',
			'narrator_228_1217',
			b('cctv_glitch', 0.9, 'the one frame'),
			'narrator_229_one_frame',
			b('cctv_scrub', 1.2, 'step back frame by frame'),
			'narrator_230_appeared',
			'narrator_231_behind',
			'narrator_232_next_frame',
			'narrator_233_never',
			'narrator_234_replaced',
			'narrator_235_refused',
			'narrator_236_stopped',
		],
		tail: 0.4,
		// CCTV: mostly room ambience
		beds: {room: 0.14, ocean: 0.03, drone: 0.04},
		bedFade: 1,
		bedAutomation: [
			{at: 'narrator_228_1217', fade: 1, set: {drone: 0.1}},
			{at: 'narrator_233_never', fade: 2, set: {drone: 0.04, room: 0.1}},
		],
		sfx: [
			{sound: 'cctv_static', at: 'narrator_225_security', offset: 1.2, volume: 0.25, maxDuration: 1.2},
			{sound: 'glitch', at: 'cctv_glitch', offset: 0.05, volume: 0.35, maxDuration: 0.35, note: 'only a brief digital glitch - no sting'},
			{sound: 'ui_click', at: 'cctv_scrub', offset: 0.1, volume: 0.3},
			{sound: 'ui_click', at: 'cctv_scrub', offset: 0.5, volume: 0.3},
			{sound: 'ui_click', at: 'cctv_scrub', offset: 0.9, volume: 0.3},
			{sound: 'ui_click', at: 'narrator_232_next_frame', offset: 1.0, volume: 0.3},
		],
		overlays: [],
	},
	{
		id: 'finale',
		name: 'Final cliffhanger',
		steps: [
			'narrator_237_year',
			'narrator_238_afternoon',
			'narrator_239_showed',
			'narrator_240_almost_deleted',
			'narrator_241_zoomed',
			b('zoom_hold', 1.3),
			'narrator_242_very_back',
			'narrator_243_beside',
			'narrator_244_same_clothes',
			'narrator_245_staring',
			'narrator_246_message',
			b('message_hold', 1.6, "DON'T LET HER COUNT YOU"),
			'narrator_247_dont_let',
			'narrator_248_rang',
			b('ring_1', 1.8),
			'narrator_249_didnt_answer',
			'narrator_250_stopped',
			'narrator_251_again',
			b('ring_2', 1.2),
			'narrator_252_switched_off',
			'narrator_253_black',
			'narrator_254_several',
			b('several_seconds', 2.0),
			'narrator_255_turned_on',
			'narrator_256_no_call',
			b('sixty_three', 1.6, '63 on the screen'),
			'narrator_257_behind',
			b('final_silence', 2.0, '2 seconds of silence'),
			'oldwoman_final_64',
		],
		tail: 0.05,
		beds: {daylight: 0.16, room: 0.1, ocean: 0, drone: 0, engine: 0, wind: 0},
		bedFade: 2,
		bedAutomation: [
			{at: 'narrator_241_zoomed', fade: 2, set: {daylight: 0.08, drone: 0.06}},
			{at: 'narrator_243_beside', fade: 1, set: {drone: 0.12, daylight: 0.04}},
			{at: 'narrator_248_rang', fade: 1, set: {drone: 0.05, daylight: 0.0, room: 0.1}},
			{at: 'narrator_253_black', fade: 1, set: {drone: 0.0}},
			// FINAL: no music. Silence. Only a breath of room tone.
			{at: 'sixty_three', fade: 0.5, set: {room: 0.05, drone: 0}},
			{at: 'final_silence', fade: 0.4, set: {room: 0.025}},
		],
		sfx: [
			{sound: 'phone_alert', at: 'narrator_238_afternoon', offset: 1.8, volume: 0.45},
			{sound: 'ui_click', at: 'narrator_241_zoomed', offset: 0.3, volume: 0.25},
			{sound: 'phone_alert', at: 'message_hold', offset: 0.05, volume: 0.5},
			{sound: 'phone_ring', at: 'narrator_248_rang', offset: 0.1, volume: 0.45, maxDuration: 4.6},
			{sound: 'phone_ring', at: 'narrator_251_again', offset: 0.1, volume: 0.45, maxDuration: 3.3},
			{sound: 'phone_off', at: 'narrator_252_switched_off', offset: 1.2, volume: 0.45},
			{sound: 'phone_on', at: 'narrator_255_turned_on', offset: 0.9, volume: 0.35},
			{sound: 'phone_alert', at: 'sixty_three', offset: 0.0, volume: 0.35, note: 'phone notification, then silence'},
		],
		overlays: [],
	},
	{
		id: 'end',
		name: 'Cut to black',
		// CUT EVERYTHING. 2 seconds of complete silence.
		steps: [b('end_black', 2.0)],
		tail: 0,
		sfx: [],
		overlays: [],
		beds: {ocean: 0, engine: 0, wind: 0, drone: 0, crowd: 0, bridge: 0, emergency: 0, room: 0, daylight: 0},
		bedFade: 0.01,
	},
];

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
const FEMALE = new Set(['emma', 'oldWoman', 'crew2', 'pa']);

export const breathSound = (l: VoiceLine): string | null => {
	if (l.breath === 'none') return null;
	// expressive TTS / recorded takes perform the breath themselves - no synthetic breath on top
	const provider = FILES[l.filename]?.provider;
	if (provider && ['elevenlabs', 'openai', 'chatterbox'].includes(provider)) return null;
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

const BED_NAMES: BedName[] = ['ocean', 'engine', 'wind', 'drone', 'crowd', 'bridge', 'emergency', 'room', 'daylight'];

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

	SCENES.forEach((def, index) => {
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
		for (const cue of def.sfx as SfxCue[]) {
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

/** The main composition's edit: the ~10 minute YouTube cut. */
export const TIMELINE: Timeline = buildTimeline('short');
/** The complete story at its original pacing (composition Passenger63HorrorFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
