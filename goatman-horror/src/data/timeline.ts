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
// Sound philosophy: the woods do the work. Crickets, the fire, the creek by day; the thin walls
// of the trailer. When the thing is near, the insects STOP - silence is the scariest sound in the
// film. The heartbeat and the tension pulse only come in when someone starts counting.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'twelve',
		name: 'Twelve',
		steps: [
			b('open_black', 1.8, 'black; a pot sizzling on a camp stove; fiction disclaimer'),
			'narrator_001_three_packs',
			'narrator_002_twelve',
			'narrator_003_cooked_myself',
			'narrator_004_everybody_one',
			'narrator_005_seconds',
			'narrator_006_hadnt',
			'narrator_007_eleven_of_us',
			'narrator_008_twelve_gone',
			'narrator_009_sitting_with_us',
			'narrator_010_eating_with_us',
			'narrator_011_whole_day',
			'narrator_012_whose_face',
			b('faces', 1.4, 'slow pan along the faces crammed into the trailer; one face at the end is in shadow'),
			b('cut_black', 0.6, 'hard black'),
			b('title', 3.4, 'ELEVEN OF US WENT CAMPING / TWELVE CAME BACK'),
		],
		tail: 0.2,
		beds: {trailer: 0.06, drone: 0.0},
		bedFade: 0.6,
		bedAutomation: [
			{at: 'narrator_007_eleven_of_us', fade: 1.5, set: {drone: 0.06}},
			{at: 'narrator_009_sitting_with_us', fade: 1.0, set: {tension: 0.05}},
			{at: 'cut_black', fade: 0.04, set: {trailer: 0, drone: 0, tension: 0}},
			{at: 'title', offset: 0.4, fade: 1.6, set: {night: 0.06, drone: 0.05}},
		],
		sfx: [
			{sound: 'sizzle_pot', at: 'open_black', offset: 0.3, volume: 0.55, maxDuration: 6},
			{sound: 'pot_lid', at: 'narrator_005_seconds', offset: 2.6, volume: 0.45},
			{sound: 'cloth_rustle', at: 'faces', offset: 0.2, volume: 0.2},
		],
		overlays: [],
	},
	{
		id: 'woods',
		name: 'The woods',
		steps: [
			b('arrive', 1.4, 'a dirt track into the pines; the trailers in the clearing'),
			'narrator_013_sixteen',
			'narrator_014_land',
			'narrator_015_city_boy',
			'narrator_016_smell',
			'narrator_017_lightning',
			'narrator_018_let_it_go',
			b('creek', 1.2, 'the cousins splashing in the creek'),
			'narrator_019_creek',
			'narrator_020_shotgun',
			'dawes_001_stick_together',
			'narrator_021_hang_out',
			'narrator_022_eleven',
			'narrator_023_remember',
			b('sunset', 1.4, 'the eleven of them around the first fire at sunset'),
		],
		tail: 0.3,
		beds: {day: 0.12, night: 0, drone: 0},
		bedFade: 1.4,
		bedAutomation: [
			{at: 'narrator_016_smell', fade: 1.2, set: {day: 0.07, drone: 0.04}},
			{at: 'narrator_018_let_it_go', fade: 1.5, set: {day: 0.12, drone: 0}},
			{at: 'creek', fade: 1.0, set: {creek: 0.12, day: 0.08}},
			{at: 'narrator_020_shotgun', fade: 0.8, set: {creek: 0.05, day: 0.05}},
			{at: 'narrator_022_eleven', fade: 2.0, set: {creek: 0, day: 0.03, night: 0.06, fire: 0.08}},
			{at: 'narrator_023_remember', fade: 1.0, set: {drone: 0.05}},
		],
		sfx: [
			{sound: 'trailer_door_open', at: 'arrive', offset: 0.7, volume: 0.35},
			{sound: 'water_splash', at: 'creek', offset: 0.1, volume: 0.45},
			{sound: 'water_splash', at: 'narrator_019_creek', offset: 1.0, volume: 0.3},
			{sound: 'brush_rustle', at: 'narrator_019_creek', fromEnd: true, offset: -0.6, volume: 0.6},
			{sound: 'footsteps_leaves', at: 'narrator_020_shotgun', offset: 0.2, volume: 0.35, maxDuration: 3},
			{sound: 'stick_crack', at: 'narrator_020_shotgun', offset: 0.4, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'facingAway',
		name: 'Facing away',
		steps: [
			b('dusk_leave', 1.2, 'Wyatt, Dez and Nia walk off down the trail with flashlights'),
			'narrator_024_around_seven',
			'narrator_025_dez_nia',
			'narrator_026_forty_minutes',
			'narrator_027_copper',
			'narrator_028_stoves',
			'narrator_029_running',
			'narrator_030_burst_out',
			'narrator_031_dez_crying',
			'narrator_032_toughest',
			'wyatt_001_lock_door',
			b('locked', 0.8, 'the lock turns; everyone crammed inside'),
			'narrator_033_pig',
			'narrator_034_flashlight',
			'narrator_035_just_standing',
			'narrator_036_back_to_them',
			'narrator_037_another',
			'narrator_038_closer',
			'narrator_039_facing_away',
			'narrator_040_gibbering',
			'narrator_041_jerking',
			'narrator_042_stepped_out',
			b('stepped_out', 1.3, 'something on the trail behind them, at the edge of the firelight'),
		],
		tail: 0.3,
		beds: {night: 0.1, fire: 0.09, day: 0, drone: 0.02},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_026_forty_minutes', fade: 1.5, set: {drone: 0.06}},
			{at: 'narrator_029_running', fade: 0.4, set: {tension: 0.06}},
			{at: 'locked', fade: 0.6, set: {fire: 0, night: 0.04, trailer: 0.06}},
			{at: 'narrator_034_flashlight', fade: 1.0, set: {night: 0.1, trailer: 0, drone: 0.08}},
			{at: 'narrator_036_back_to_them', fade: 0.3, set: {night: 0.03}},
			{at: 'narrator_040_gibbering', fade: 0.5, set: {night: 0, heart: 0.08}},
			{at: 'stepped_out', fade: 0.1, set: {tension: 0, heart: 0}},
		],
		sfx: [
			{sound: 'footsteps_leaves', at: 'dusk_leave', offset: 0.1, volume: 0.3, maxDuration: 2.5},
			{sound: 'running_leaves', at: 'narrator_029_running', offset: 0.4, volume: 0.55},
			{sound: 'trailer_door_slam', at: 'narrator_030_burst_out', fromEnd: true, offset: -0.4, volume: 0.7},
			{sound: 'lock_turn', at: 'locked', offset: 0.1, volume: 0.5},
			{sound: 'flashlight_on', at: 'narrator_034_flashlight', offset: 0.6, volume: 0.4},
			{sound: 'brush_rustle', at: 'narrator_037_another', offset: 0.3, volume: 0.35},
			{sound: 'gibbering', at: 'narrator_040_gibbering', offset: 1.2, volume: 0.5, maxDuration: 5},
			{sound: 'brush_crash', at: 'narrator_041_jerking', offset: 1.4, volume: 0.45},
			{sound: 'stick_crack', at: 'stepped_out', offset: 0.15, volume: 0.55},
		],
		overlays: [],
	},
	{
		id: 'goatman',
		name: 'The Goatman',
		steps: [
			'narrator_043_ray_quiet',
			'ray_001_goatman',
			'narrator_044_shut_up',
			'narrator_045_kept_going',
			'narrator_046_stories',
			'narrator_047_never_see',
			'narrator_048_wears_faces',
			'narrator_049_walks_into',
			'narrator_050_smell_stopped',
			'narrator_051_didnt_fade',
			'narrator_052_gone',
			b('morning', 1.2, 'morning sun on the trailers; everyone laughing'),
			'narrator_053_local_guys',
			'narrator_054_normal',
			'narrator_055_worst_part',
		],
		tail: 0.3,
		beds: {trailer: 0.06, night: 0.03, drone: 0.05},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'narrator_046_stories', fade: 1.5, set: {drone: 0.09, trailer: 0.03}},
			{at: 'narrator_049_walks_into', fade: 1.0, set: {tension: 0.05}},
			{at: 'narrator_050_smell_stopped', fade: 0.05, set: {drone: 0, tension: 0}},
			{at: 'morning', fade: 1.0, set: {trailer: 0, night: 0, day: 0.12}},
			{at: 'narrator_055_worst_part', fade: 1.5, set: {day: 0.05, drone: 0.05}},
		],
		sfx: [
			{sound: 'owl_hoot', at: 'narrator_045_kept_going', offset: 0.4, volume: 0.3},
			{sound: 'whoosh_2', at: 'narrator_048_wears_faces', offset: -0.2, volume: 0.15},
		],
		overlays: [],
	},
	{
		id: 'oneTooMany',
		name: 'One too many',
		steps: [
			b('ghost_stories', 1.2, 'one in the morning: faces around the fire'),
			'narrator_056_second_night',
			'narrator_057_gagging',
			'narrator_058_crowded',
			'narrator_059_so_i_cooked',
			'narrator_060_three_packs',
			'narrator_061_you_know',
			'ray_002_took_two',
			'marcus_001_twelve',
			'narrator_062_stopped',
			'narrator_063_counted',
			b('counting', 1.8, "Marcus's eyes move from face to face"),
			'narrator_064_eleven',
			'narrator_065_nia_screaming',
			'nia_001_get_it_out',
			'narrator_066_crashed',
			'narrator_067_counted_again',
			'narrator_068_eleven',
			'narrator_069_sticks',
			'narrator_070_empty',
			'narrator_071_knee',
			'narrator_072_not_words',
			'narrator_073_its_face',
			'narrator_074_neither',
		],
		tail: 0.3,
		beds: {fire: 0.1, night: 0.09, day: 0, drone: 0.02},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_057_gagging', fade: 1.0, set: {drone: 0.07, night: 0.04}},
			{at: 'narrator_058_crowded', fade: 0.8, set: {fire: 0, night: 0.03, trailer: 0.07}},
			{at: 'narrator_063_counted', fade: 0.6, set: {tension: 0.06}},
			{at: 'counting', fade: 0.5, set: {heart: 0.1, trailer: 0.02}},
			{at: 'nia_001_get_it_out', fade: 0.05, set: {heart: 0, tension: 0}},
			{at: 'narrator_066_crashed', fade: 0.3, set: {trailer: 0, night: 0.08, heartFast: 0.1}},
			{at: 'narrator_069_sticks', fade: 1.0, set: {heartFast: 0, trailer: 0.05, night: 0.02}},
			{at: 'narrator_071_knee', fade: 1.0, set: {drone: 0.08}},
		],
		sfx: [
			{sound: 'sizzle_pot', at: 'narrator_059_so_i_cooked', offset: 0.2, volume: 0.45, maxDuration: 5},
			{sound: 'pot_lid', at: 'ray_002_took_two', offset: -0.4, volume: 0.5},
			{sound: 'trailer_door_slam', at: 'narrator_066_crashed', offset: 0.1, volume: 0.6},
			{sound: 'running_leaves', at: 'narrator_066_crashed', offset: 0.4, volume: 0.45, maxDuration: 2.5},
			{sound: 'trailer_door_open', at: 'narrator_069_sticks', offset: 0.6, volume: 0.45},
		],
		overlays: [],
	},
	{
		id: 'seven',
		name: 'Seven',
		steps: [
			b('sunrise', 1.2, 'dawn mist over the clearing; four teenagers walking away'),
			'narrator_075_sunrise',
			'narrator_076_keys',
			'narrator_077_rifle',
			'narrator_078_seven_left',
			'narrator_079_at_least',
			b('afternoon', 1.0, 'late afternoon light, the dead fire pit'),
			'narrator_080_nia_back',
			'narrator_081_fire_pit',
			'narrator_082_back_to_us',
			'narrator_083_faint',
			'narrator_084_silent',
			'narrator_085_shoulders',
			'narrator_086_laughing',
			'narrator_087_no_sound',
			'narrator_088_froze',
			'marcus_002_get_back',
			'narrator_089_blinds',
			'narrator_090_twenty',
			b('watch', 1.3, 'through the one open blind: her still back'),
			'narrator_091_slammed',
			'wyatt_002_let_me_in',
			'narrator_092_with_rifle',
			'narrator_093_turned_to_watch',
			'narrator_094_never_saw',
			'narrator_095_closer',
			'narrator_096_went_pale',
			'wyatt_003_only_six',
			'narrator_097_math',
			'narrator_098_six',
			'narrator_099_all_afternoon',
			'narrator_100_math',
			'narrator_101_inside_again',
			'narrator_102_when_it_left',
		],
		tail: 0.3,
		beds: {day: 0.1, drone: 0, night: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_079_at_least', fade: 1.0, set: {drone: 0.05}},
			{at: 'afternoon', fade: 1.0, set: {day: 0.09, drone: 0.03}},
			{at: 'narrator_083_faint', fade: 1.0, set: {drone: 0.06}},
			{at: 'narrator_084_silent', offset: 1.0, fade: 0.4, set: {day: 0}},
			{at: 'narrator_087_no_sound', fade: 1.0, set: {tension: 0.06}},
			{at: 'narrator_089_blinds', fade: 1.0, set: {trailer: 0.05}},
			{at: 'narrator_091_slammed', fade: 0.05, set: {tension: 0, heartFast: 0.1}},
			{at: 'narrator_092_with_rifle', fade: 1.5, set: {heartFast: 0, drone: 0.04}},
			{at: 'wyatt_003_only_six', fade: 0.3, set: {heart: 0.1}},
			{at: 'narrator_101_inside_again', fade: 1.5, set: {heart: 0, drone: 0.08}},
		],
		sfx: [
			{sound: 'footsteps_leaves', at: 'sunrise', offset: 0.2, volume: 0.3, maxDuration: 3},
			{sound: 'blind_roll', at: 'narrator_089_blinds', offset: 0.5, volume: 0.45},
			{sound: 'trailer_door_bang', at: 'narrator_091_slammed', offset: -0.1, volume: 0.8},
			{sound: 'trailer_door_open', at: 'narrator_092_with_rifle', offset: 0.1, volume: 0.5},
		],
		overlays: [],
	},
	{
		id: 'letMeIn',
		name: 'Let me in',
		steps: [
			b('sundown', 1.2, 'Cole walking up through the trees with a lantern'),
			'narrator_103_cole',
			'cole_001_little_friend',
			'narrator_104_reached',
			'narrator_105_empty_air',
			'narrator_106_foot_left',
			b('night_wait', 1.2, 'the trailer at night, rifles across knees'),
			'narrator_107_eleven',
			'narrator_108_burnt',
			'narrator_109_scraped',
			'narrator_110_voice',
			'thing_001_let_me_in',
			'narrator_111_wyatts_words',
			'narrator_112_wrong',
			'narrator_113_no_rhythm',
			b('two_am', 0.8, 'the clock ticks over; Cole stands up'),
			'narrator_114_two_am',
			'cole_002_get_gone',
			'narrator_115_answered',
			'narrator_116_hooting',
			'narrator_117_scream',
			'narrator_118_crawled',
			'narrator_119_fired',
			'narrator_120_until_dawn',
			'narrator_121_never_door',
			b('dawn_quiet', 1.2, 'grey dawn; the trailer door shut'),
		],
		tail: 0.3,
		beds: {day: 0.05, night: 0.04, drone: 0.03},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'night_wait', fade: 1.0, set: {day: 0, night: 0.04, trailer: 0.06}},
			{at: 'narrator_107_eleven', fade: 1.0, set: {drone: 0.08, night: 0}},
			{at: 'narrator_109_scraped', fade: 0.4, set: {heart: 0.1}},
			{at: 'thing_001_let_me_in', fade: 0.1, set: {heart: 0, trailer: 0.02}},
			{at: 'narrator_113_no_rhythm', fade: 1.0, set: {tension: 0.05}},
			{at: 'narrator_114_two_am', fade: 0.3, set: {trailer: 0, night: 0.04, tension: 0}},
			{at: 'narrator_118_crawled', fade: 0.3, set: {heartFast: 0.12}},
			{at: 'narrator_120_until_dawn', fade: 1.5, set: {heartFast: 0, drone: 0.06}},
			{at: 'dawn_quiet', fade: 1.5, set: {night: 0, day: 0.04, drone: 0.03}},
		],
		sfx: [
			{sound: 'footsteps_leaves', at: 'sundown', offset: 0.1, volume: 0.35, maxDuration: 3},
			{sound: 'metal_claw', at: 'narrator_109_scraped', offset: 0.5, volume: 0.6},
			{sound: 'metal_claw', at: 'narrator_110_voice', offset: -0.3, volume: 0.35},
			{sound: 'trailer_door_slam', at: 'narrator_114_two_am', offset: 2.0, volume: 0.6},
			{sound: 'rifle_shot', at: 'narrator_114_two_am', fromEnd: true, offset: -0.2, volume: 0.75},
			{sound: 'gibbering', at: 'narrator_116_hooting', offset: -0.2, volume: 0.45, maxDuration: 4},
			{sound: 'owl_hoot', at: 'narrator_116_hooting', offset: 0.2, volume: 0.25},
			{sound: 'animal_scream', at: 'narrator_117_scream', offset: 1.4, volume: 0.6},
			{sound: 'brush_crash', at: 'narrator_118_crawled', offset: 0.6, volume: 0.55},
			{sound: 'rifle_shot', at: 'narrator_119_fired', offset: 0.35, volume: 0.8},
			{sound: 'animal_scream', at: 'narrator_120_until_dawn', offset: 0.4, volume: 0.25},
		],
		overlays: [],
	},
	{
		id: 'nine',
		name: 'Nine',
		steps: [
			b('walk_out', 1.0, 'the group walking up the trail in the morning, Wyatt last'),
			'narrator_122_sunrise',
			'narrator_123_wouldnt_look',
			'narrator_124_two_days',
			b('four_am', 1.2, 'the dark trailer at 4 a.m.; Wyatt in the chair by the door'),
			'narrator_125_four_am',
			'narrator_126_bathroom',
			'narrator_127_lay_down',
			'narrator_128_closed_eyes',
			'narrator_129_counted',
			'narrator_130_eight',
			'narrator_131_nine',
			'narrator_132_didnt_scream',
			'narrator_133_pretending',
			'narrator_134_window',
			'narrator_135_no_screen',
			'narrator_136_never_break_in',
			'narrator_137_walked_out',
			'narrator_138_back_of_line',
			'narrator_139_eyes',
			'narrator_140_trees',
			b('trees', 1.6, 'the woods, empty'),
		],
		tail: 0.4,
		beds: {day: 0.08, drone: 0.02},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'four_am', fade: 1.0, set: {day: 0, trailer: 0.04, drone: 0.05}},
			{at: 'narrator_126_bathroom', fade: 0.5, set: {heart: 0.08}},
			{at: 'narrator_129_counted', fade: 0.6, set: {tension: 0.05}},
			{at: 'narrator_132_didnt_scream', fade: 1.0, set: {heart: 0.05, tension: 0}},
			{at: 'narrator_134_window', fade: 1.0, set: {heart: 0, day: 0.04, trailer: 0, drone: 0.07}},
			{at: 'narrator_137_walked_out', fade: 1.5, set: {day: 0.08}},
			{at: 'narrator_139_eyes', fade: 0.3, set: {day: 0, tension: 0.06}},
			{at: 'trees', fade: 1.2, set: {tension: 0, drone: 0.04, day: 0.03}},
		],
		sfx: [
			{sound: 'footsteps_leaves', at: 'walk_out', offset: 0.1, volume: 0.35, maxDuration: 3},
			{sound: 'door_open', at: 'narrator_126_bathroom', offset: 0.9, volume: 0.45},
			{sound: 'cloth_rustle', at: 'narrator_127_lay_down', offset: 2.2, volume: 0.35},
			{sound: 'footsteps_leaves', at: 'narrator_137_walked_out', offset: 0.3, volume: 0.35, maxDuration: 4},
		],
		overlays: [],
	},
	{
		id: 'plates',
		name: 'Plates',
		steps: [
			b('city', 1.4, 'Chicago at night; his apartment window'),
			'narrator_141_twelve_years',
			'narrator_142_chicago',
			'narrator_143_six_friends',
			'narrator_144_plates',
			'narrator_145_cleaning',
			'narrator_146_seven_couch',
			'narrator_147_eight_plates',
			'narrator_148_again',
			'narrator_149_eight',
			'narrator_150_bathroom',
			'narrator_151_that_smell',
			'narrator_152_lightning',
			b('cut_black_end', 1.0, 'hard black'),
			'narrator_153_next_time',
			'narrator_154_count_them',
			'narrator_155_count_plates',
			b('credit', 4.6, 'black; the credit for the original story; the title'),
		],
		tail: 0.6,
		beds: {city: 0.1, drone: 0},
		bedFade: 1.5,
		bedAutomation: [
			{at: 'narrator_146_seven_couch', fade: 1.0, set: {city: 0.05, drone: 0.05}},
			{at: 'narrator_147_eight_plates', fade: 0.2, set: {city: 0.02, tension: 0.05}},
			{at: 'narrator_149_eight', fade: 0.5, set: {heart: 0.09}},
			{at: 'narrator_150_bathroom', fade: 1.5, set: {drone: 0.1, city: 0, tension: 0}},
			{at: 'cut_black_end', fade: 0.05, set: {heart: 0, drone: 0.03}},
			{at: 'credit', offset: 1.5, fade: 2.5, set: {drone: 0}},
		],
		sfx: [
			{sound: 'paper_drag', at: 'narrator_145_cleaning', offset: 0.6, volume: 0.35},
			{sound: 'paper_drag', at: 'narrator_146_seven_couch', offset: 0.4, volume: 0.25},
		],
		overlays: [],
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - sparse on purpose: low booms and sub drops land on the counts and the reveals.
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	facingAway: {sound: 'whoosh_1', volume: 0.12},
	oneTooMany: {sound: 'whoosh_2', volume: 0.14},
	letMeIn: {sound: 'whoosh_1', volume: 0.14},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	twelve: [
		hit('bass_hit', 'narrator_006_hadnt', 0.1, 0.3),
		hit('sub_drop', 'narrator_008_twelve_gone', 0.2, 0.3),
		hit('boom_hit', 'narrator_012_whose_face', 0.4, 0.4, {fromEnd: true}),
		hit('sub_drop', 'title', 0.15, 0.25),
	],
	woods: [hit('sub_drop', 'narrator_017_lightning', 0.3, 0.2), hit('bass_hit', 'narrator_023_remember', 0.1, 0.3)],
	facingAway: [
		hit('bass_hit', 'narrator_031_dez_crying', 0.0, 0.25),
		hit('boom_hit', 'narrator_036_back_to_them', 0.2, 0.4),
		hit('bass_hit', 'narrator_039_facing_away', 0.1, 0.3),
		hit('riser_short', 'narrator_042_stepped_out', -1.0, 0.25),
		hit('boom_hit', 'stepped_out', 0.1, 0.5),
	],
	goatman: [hit('sub_drop', 'narrator_048_wears_faces', 0.2, 0.35), hit('stinger', 'narrator_052_gone', 0.4, 0.2), hit('bass_hit', 'narrator_055_worst_part', 0.3, 0.3)],
	oneTooMany: [
		hit('boom_hit', 'narrator_064_eleven', 0.05, 0.5),
		hit('sub_drop', 'narrator_068_eleven', 0.1, 0.4),
		hit('bass_hit', 'narrator_072_not_words', 0.1, 0.3),
	],
	seven: [
		hit('sub_drop', 'narrator_079_at_least', 0.4, 0.3),
		hit('sub_drop', 'narrator_084_silent', 1.2, 0.3),
		hit('bass_hit', 'narrator_087_no_sound', 0.1, 0.3),
		hit('boom_hit', 'narrator_091_slammed', -0.05, 0.45),
		hit('boom_hit', 'narrator_098_six', 0.05, 0.5),
		hit('sub_drop', 'narrator_101_inside_again', 0.2, 0.35),
	],
	letMeIn: [
		hit('sub_drop', 'narrator_106_foot_left', 0.3, 0.3),
		hit('boom_hit', 'thing_001_let_me_in', -0.05, 0.4),
		hit('sub_drop', 'narrator_113_no_rhythm', 0.5, 0.3),
		hit('riser_short', 'narrator_118_crawled', -1.2, 0.25),
	],
	nine: [
		hit('bass_hit', 'narrator_126_bathroom', 0.4, 0.3),
		hit('boom_hit', 'narrator_131_nine', 0.05, 0.55),
		hit('sub_drop', 'narrator_136_never_break_in', 0.3, 0.35),
		hit('boom_hit', 'narrator_139_eyes', 0.5, 0.45),
	],
	plates: [
		hit('boom_hit', 'narrator_147_eight_plates', 0.1, 0.45),
		hit('sub_drop', 'narrator_149_eight', 0.1, 0.4),
		hit('riser_short', 'narrator_152_lightning', -0.8, 0.2),
		hit('boom_hit', 'cut_black_end', 0.0, 0.5),
		hit('sub_drop', 'credit', 0.0, 0.25),
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
const FEMALE = new Set(['nia']);

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

const BED_NAMES: BedName[] = ['day', 'night', 'fire', 'creek', 'trailer', 'drone', 'tension', 'heart', 'heartFast', 'city'];

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

/** The main composition's edit (GoatmanHorror): the whole script, as written. */
export const TIMELINE: Timeline = buildTimeline('short');
/** Identical to TIMELINE (composition GoatmanHorrorFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
