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
// Sound philosophy: an old house that is never quite silent - wind on the hill, long creaks, small
// taps inside the walls. Mr. Widemouth has a music box: it plays while he is sweet and winds down,
// out of tune, when he turns. Under the bed there is always a faint scurry.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'wave',
		name: 'The wave',
		steps: [
			b('open_black', 1.8, 'black; a diesel engine idling, wipers once; fiction disclaimer'),
			'narrator_001_four_am',
			'narrator_002_truck',
			'narrator_003_window',
			'narrator_004_still',
			'narrator_005_waved',
			'narrator_006_knife',
			'narrator_007_didnt_wave',
			'narrator_008_best_friend',
			b('cut_black', 0.6, 'hard black'),
			b('title', 3.4, 'MR. WIDEMOUTH'),
		],
		tail: 0.2,
		beds: {truck: 0.08, drone: 0},
		bedFade: 0.6,
		bedAutomation: [
			{at: 'narrator_003_window', fade: 1.2, set: {drone: 0.06}},
			{at: 'narrator_006_knife', fade: 0.6, set: {tension: 0.05}},
			{at: 'cut_black', fade: 0.04, set: {truck: 0, drone: 0, tension: 0}},
			{at: 'title', offset: 0.3, fade: 1.2, set: {musicbox: 0.07}},
		],
		sfx: [
			{sound: 'gravel_roll', at: 'narrator_005_waved', offset: 0.2, volume: 0.35, maxDuration: 4},
		],
		overlays: [],
	},
	{
		id: 'house',
		name: 'The empty house',
		steps: [
			b('farmhouse', 1.3, 'the white farmhouse alone on its hill'),
			'narrator_009_never_stayed',
			'narrator_010_chased_jobs',
			'narrator_011_farmhouse',
			'narrator_012_too_big',
			'narrator_013_noises',
			'narrator_014_settle',
			'narrator_015_sick',
			'narrator_016_fever',
			'narrator_017_boxes',
			'narrator_018_empty_room',
			'narrator_019_bored',
			'narrator_020_showed_up',
			b('bed_skirt', 1.2, 'the bed skirt stirs'),
		],
		tail: 0.3,
		beds: {wind: 0.06, day: 0.04, musicbox: 0, house: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_012_too_big', fade: 1.2, set: {wind: 0.03, house: 0.06}},
			{at: 'narrator_013_noises', fade: 0.8, set: {drone: 0.04}},
			{at: 'narrator_015_sick', fade: 1.5, set: {drone: 0, day: 0.02}},
			{at: 'narrator_020_showed_up', fade: 0.8, set: {musicbox: 0.06, drone: 0.04}},
		],
		sfx: [
			{sound: 'floor_creak', at: 'narrator_013_noises', offset: 1.8, volume: 0.45},
			{sound: 'wall_tap', at: 'narrator_013_noises', offset: 3.6, volume: 0.4},
			{sound: 'page_turn', at: 'narrator_018_empty_room', offset: 2.0, volume: 0.25},
			{sound: 'scurry', at: 'bed_skirt', offset: 0.2, volume: 0.45},
		],
		overlays: [],
	},
	{
		id: 'underBed',
		name: 'Under the bed',
		steps: [
			'narrator_021_first_time',
			'widemouth_001_call_me',
			'narrator_022_suited',
			'narrator_023_size_of_cat',
			'narrator_024_mouth',
			'narrator_025_toy_pets',
			'eli_001_a_toy',
			'widemouth_002_friend',
			'widemouth_003_other_friends',
			'eli_002_move',
			'widemouth_004_good',
			'narrator_026_slid',
			'widemouth_005_parents',
			'narrator_027_books',
			'narrator_028_pages',
			'narrator_029_too_fast',
			'mom_001_who',
			'eli_003_nobody',
			'narrator_030_lied',
			'narrator_031_huge_smile',
			'widemouth_006_secret_game',
		],
		tail: 0.3,
		beds: {house: 0.06, musicbox: 0.05, day: 0.02},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'narrator_024_mouth', fade: 0.6, set: {musicbox: 0.02, drone: 0.04}},
			{at: 'narrator_025_toy_pets', fade: 1.2, set: {musicbox: 0.05, drone: 0}},
			{at: 'widemouth_004_good', fade: 0.4, set: {musicbox: 0, tension: 0.03}},
			{at: 'narrator_026_slid', fade: 1.0, set: {tension: 0, musicbox: 0.04}},
			{at: 'narrator_029_too_fast', fade: 0.3, set: {musicbox: 0, heart: 0.06}},
			{at: 'narrator_030_lied', fade: 1.2, set: {heart: 0}},
			{at: 'widemouth_006_secret_game', fade: 0.6, set: {musicbox: 0.06}},
		],
		sfx: [
			{sound: 'scurry', at: 'narrator_026_slid', offset: 2.6, volume: 0.5},
			{sound: 'stairs_steps', at: 'narrator_026_slid', offset: 0.6, volume: 0.3},
			{sound: 'page_turn', at: 'narrator_028_pages', offset: 1.0, volume: 0.35},
			{sound: 'stairs_steps', at: 'narrator_029_too_fast', offset: 0.1, volume: 0.35},
			{sound: 'door_open', at: 'narrator_029_too_fast', offset: 2.6, volume: 0.4},
			{sound: 'cloth_rustle', at: 'narrator_029_too_fast', offset: 3.2, volume: 0.35},
		],
		overlays: [],
	},
	{
		id: 'trampoline',
		name: 'Trampoline',
		steps: [
			'narrator_032_hall',
			'narrator_033_not_allowed',
			'narrator_034_room_empty',
			'narrator_035_pushed_open',
			'narrator_036_long_way',
			'widemouth_007_how_to_play',
			'narrator_037_almost_see',
			'eli_004_far_down',
			'narrator_038_face_changed',
			'narrator_039_snarled',
			'narrator_040_disappointed',
			'narrator_041_rest_of_day',
		],
		tail: 0.3,
		beds: {house: 0.06, musicbox: 0.03, drone: 0.02},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'narrator_035_pushed_open', fade: 0.5, set: {wind: 0.08, house: 0.03}},
			{at: 'widemouth_007_how_to_play', fade: 1.0, set: {musicbox: 0.06, drone: 0.05}},
			{at: 'narrator_037_almost_see', fade: 1.5, set: {tension: 0.05}},
			{at: 'narrator_038_face_changed', fade: 0.05, set: {musicbox: 0, wind: 0.02, tension: 0}},
			{at: 'narrator_040_disappointed', fade: 1.5, set: {wind: 0, house: 0.06, drone: 0.03}},
		],
		sfx: [
			{sound: 'small_feet', at: 'narrator_032_hall', offset: 2.4, volume: 0.35, maxDuration: 3},
			{sound: 'small_feet', at: 'narrator_035_pushed_open', offset: 0.2, volume: 0.4, maxDuration: 1.2},
			{sound: 'sash_window', at: 'narrator_035_pushed_open', offset: 1.4, volume: 0.6},
			{sound: 'creature_rasp', at: 'narrator_039_snarled', offset: 2.6, volume: 0.35, maxDuration: 1.2},
			{sound: 'scurry', at: 'narrator_041_rest_of_day', offset: 1.0, volume: 0.35},
		],
		overlays: [],
	},
	{
		id: 'box',
		name: 'The box',
		steps: [
			'narrator_042_cardboard_box',
			'widemouth_008_juggle',
			'narrator_043_looked_inside',
			'narrator_044_knives',
			'eli_005_mom_kill_me',
			'widemouth_009_more_fun',
			'narrator_045_smile_gone',
			'narrator_046_slid_back',
			'narrator_047_wondering',
			'narrator_048_underneath',
			b('under', 1.4, 'the dark under the bed'),
		],
		tail: 0.3,
		beds: {house: 0.05, musicbox: 0.05, drone: 0},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'narrator_044_knives', fade: 0.1, set: {musicbox: 0, drone: 0.07}},
			{at: 'widemouth_009_more_fun', fade: 0.3, set: {tension: 0.05}},
			{at: 'narrator_047_wondering', fade: 1.5, set: {tension: 0, heart: 0.06}},
			{at: 'under', fade: 1.0, set: {heart: 0, drone: 0.05}},
		],
		sfx: [
			{sound: 'box_knives', at: 'narrator_042_cardboard_box', offset: 1.6, volume: 0.45},
			{sound: 'box_knives', at: 'narrator_044_knives', offset: 0.1, volume: 0.6},
			{sound: 'box_knives', at: 'narrator_046_slid_back', offset: 0.6, volume: 0.35},
			{sound: 'scurry', at: 'narrator_046_slid_back', offset: 1.2, volume: 0.45},
		],
		overlays: [],
	},
	{
		id: 'nights',
		name: 'The nights',
		steps: [
			'narrator_049_woke_me',
			'narrator_050_grin',
			'widemouth_010_real_trampoline',
			'narrator_051_squeeze',
			'narrator_052_didnt_leave',
			'narrator_053_until_grey',
			'narrator_054_not_fun',
			b('night_room', 1.0, 'the dark bedroom, curtains moving'),
			'narrator_055_woke_cold',
			'narrator_056_not_in_bed',
			'narrator_057_sill',
			'narrator_058_dont_know',
			'narrator_059_whispered',
			'widemouth_011_almost',
			'narrator_060_ran_back',
		],
		tail: 0.3,
		beds: {night: 0.05, house: 0.05, drone: 0.03},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'widemouth_010_real_trampoline', fade: 0.8, set: {musicbox: 0.03}},
			{at: 'narrator_053_until_grey', fade: 1.5, set: {musicbox: 0}},
			{at: 'narrator_055_woke_cold', fade: 0.4, set: {wind: 0.09, night: 0.03, house: 0, drone: 0.06}},
			{at: 'narrator_057_sill', fade: 1.0, set: {heart: 0.08}},
			{at: 'narrator_059_whispered', fade: 0.3, set: {wind: 0.02, heart: 0}},
			{at: 'narrator_060_ran_back', fade: 0.4, set: {heartFast: 0.1, wind: 0}},
		],
		sfx: [
			{sound: 'bed_creak', at: 'narrator_050_grin', offset: 0.4, volume: 0.35},
			{sound: 'scurry', at: 'narrator_052_didnt_leave', offset: 0.2, volume: 0.3},
			{sound: 'small_feet', at: 'narrator_060_ran_back', offset: 0.2, volume: 0.5, maxDuration: 2},
			{sound: 'cloth_rustle', at: 'narrator_060_ran_back', offset: 2.0, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'trail',
		name: 'The trail',
		steps: [
			b('porch_day', 1.0, 'a pale spring morning at the back porch'),
			'narrator_061_better',
			'narrator_062_porch',
			'widemouth_012_show_you',
			'narrator_063_deer_trail',
			'narrator_064_silent',
			'widemouth_013_important_path',
			'narrator_065_black_eyes',
			'widemouth_014_not_ready',
			b('trail_dark', 1.2, 'the trail disappearing into the trees'),
		],
		tail: 0.3,
		beds: {day: 0.1, heartFast: 0, house: 0},
		bedFade: 1.4,
		bedAutomation: [
			{at: 'narrator_062_porch', fade: 0.8, set: {musicbox: 0.05}},
			{at: 'narrator_064_silent', fade: 1.0, set: {day: 0, musicbox: 0.02, drone: 0.05}},
			{at: 'widemouth_014_not_ready', fade: 0.5, set: {musicbox: 0, tension: 0.05}},
			{at: 'trail_dark', fade: 1.0, set: {tension: 0}},
		],
		sfx: [
			{sound: 'door_close', at: 'narrator_061_better', offset: 2.6, volume: 0.25},
			{sound: 'footsteps_leaves', at: 'narrator_063_deer_trail', offset: 0.6, volume: 0.3, maxDuration: 3},
			{sound: 'small_feet', at: 'narrator_064_silent', offset: 2.2, volume: 0.3, maxDuration: 2},
		],
		overlays: [],
	},
	{
		id: 'fourAm',
		name: 'Four A.M.',
		steps: [
			'narrator_066_moving_day',
			'narrator_067_didnt_tell',
			'narrator_068_searched',
			'mom_002_steak_knife',
			'narrator_069_nobody',
			'narrator_070_lay_awake',
			'narrator_071_four_am',
			'dad_001_last_move',
			'narrator_072_backed_out',
			'narrator_073_there_he_was',
			'narrator_074_you_know',
			'narrator_075_little_wave',
			'narrator_076_the_knife',
		],
		tail: 0.4,
		beds: {house: 0.05, day: 0.02, drone: 0.02},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_068_searched', fade: 0.8, set: {day: 0}},
			{at: 'narrator_069_nobody', fade: 0.5, set: {drone: 0.06}},
			{at: 'narrator_070_lay_awake', fade: 1.0, set: {house: 0.03, night: 0.03}},
			{at: 'narrator_071_four_am', fade: 1.5, set: {truck: 0.08, house: 0, night: 0.02, drone: 0.03}},
			{at: 'narrator_073_there_he_was', fade: 0.4, set: {tension: 0.06, musicbox: 0.04}},
			{at: 'narrator_076_the_knife', fade: 1.5, set: {tension: 0, truck: 0.04}},
		],
		sfx: [
			{sound: 'drawer_search', at: 'narrator_068_searched', offset: 1.2, volume: 0.45},
			{sound: 'drawer_search', at: 'mom_002_steak_knife', offset: -0.3, volume: 0.3},
			{sound: 'truck_start', at: 'narrator_071_four_am', offset: 2.6, volume: 0.45},
			{sound: 'gravel_roll', at: 'narrator_072_backed_out', offset: 0.3, volume: 0.35, maxDuration: 4},
		],
		overlays: [],
	},
	{
		id: 'end',
		name: 'The end of the trail',
		steps: [
			b('ruins', 1.4, 'the hilltop, years later: the burned foundation'),
			'narrator_077_drove_back',
			'narrator_078_house_gone',
			'narrator_079_found_trail',
			'narrator_080_expected',
			'narrator_081_deeper',
			'narrator_082_cemetery',
			'narrator_083_headstones',
			'narrator_084_children',
			'narrator_085_not_ready',
			'narrator_086_had_been',
			b('cut_black_end', 1.0, 'hard black'),
			'narrator_087_son_five',
			'narrator_088_trampoline',
			'narrator_089_who_told',
			'leo_001_new_friend',
			'leo_002_under_bed',
			b('credit', 4.6, 'black; the credit for the original story'),
		],
		tail: 0.6,
		beds: {wind: 0.08, truck: 0, drone: 0},
		bedFade: 1.5,
		bedAutomation: [
			{at: 'narrator_079_found_trail', fade: 1.5, set: {wind: 0.03, day: 0.04}},
			{at: 'narrator_082_cemetery', fade: 1.0, set: {day: 0, drone: 0.06}},
			{at: 'narrator_084_children', fade: 0.6, set: {tension: 0.04}},
			{at: 'cut_black_end', fade: 0.05, set: {wind: 0, drone: 0, tension: 0}},
			{at: 'narrator_087_son_five', fade: 1.0, set: {house: 0.03}},
			{at: 'leo_001_new_friend', fade: 0.6, set: {musicbox: 0.06}},
			{at: 'credit', offset: 1.0, fade: 3.0, set: {musicbox: 0, house: 0}},
		],
		sfx: [
			{sound: 'footsteps_leaves', at: 'narrator_079_found_trail', offset: 0.2, volume: 0.3, maxDuration: 3},
			{sound: 'crow_caw', at: 'narrator_082_cemetery', offset: 0.8, volume: 0.35},
		],
		overlays: [],
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - sparse on purpose
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	trampoline: {sound: 'whoosh_1', volume: 0.12},
	nights: {sound: 'whoosh_2', volume: 0.12},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	wave: [hit('bass_hit', 'narrator_004_still', 0.1, 0.3), hit('boom_hit', 'narrator_006_knife', 0.6, 0.45), hit('sub_drop', 'title', 0.15, 0.25)],
	house: [hit('sub_drop', 'narrator_020_showed_up', 0.4, 0.3)],
	underBed: [hit('bass_hit', 'narrator_024_mouth', 0.6, 0.25), hit('stinger', 'widemouth_004_good', 0.6, 0.2)],
	trampoline: [hit('sub_drop', 'narrator_036_long_way', 0.4, 0.3), hit('boom_hit', 'narrator_038_face_changed', 0.0, 0.5)],
	box: [hit('boom_hit', 'narrator_044_knives', 0.05, 0.45), hit('sub_drop', 'narrator_048_underneath', 0.3, 0.35)],
	nights: [hit('bass_hit', 'narrator_056_not_in_bed', 0.0, 0.35), hit('riser_short', 'widemouth_011_almost', -1.2, 0.25), hit('boom_hit', 'widemouth_011_almost', 0.0, 0.5)],
	trail: [hit('sub_drop', 'widemouth_014_not_ready', 0.5, 0.35)],
	fourAm: [hit('bass_hit', 'narrator_069_nobody', 0.0, 0.3), hit('boom_hit', 'narrator_073_there_he_was', 0.1, 0.45), hit('sub_drop', 'narrator_076_the_knife', 0.2, 0.35)],
	end: [hit('boom_hit', 'narrator_084_children', 0.1, 0.45), hit('boom_hit', 'cut_black_end', 0.0, 0.4), hit('riser_short', 'leo_002_under_bed', -1.0, 0.2), hit('boom_hit', 'leo_002_under_bed', 0.2, 0.5)],
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
const FEMALE = new Set(['mom']);

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

const BED_NAMES: BedName[] = ['house', 'day', 'night', 'truck', 'wind', 'musicbox', 'drone', 'tension', 'heart', 'heartFast'];

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
