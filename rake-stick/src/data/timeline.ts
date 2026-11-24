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
// Sound: an old house at night - the hall clock, crickets, the house settling - and silence. The clock and the
// crickets stop dead before every visit; the only "score" is a low drone and a heartbeat on the worst moments.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'firstNight',
		name: 'The first night',
		steps: [
			b('open_black', 2.2, 'black; the hall clock; one owl outside'),
			'narrator_001_woke_up',
			'narrator_002_not_the_end',
			'narrator_003_thin_man',
			'narrator_004_claws',
			'narrator_005_looking',
			b('stare', 2.0, 'it watches; nothing moves; silence'),
			'narrator_006_watched',
			'narrator_007_counted',
			b('count', 2.6, 'under the covers: her breathing, counting'),
			'narrator_008_gone',
			b('title', 3.0, 'THE RAKE'),
		],
		tail: 0.1,
		beds: {house: 0.14, clock: 0.12, night: 0.08, drone: 0},
		bedFade: 0.8,
		bedAutomation: [
			{at: 'narrator_001_woke_up', offset: 2.0, fade: 0.6, set: {clock: 0, night: 0, drone: 0.08}},
			{at: 'stare', fade: 0.3, set: {house: 0.06, drone: 0.12, heart: 0.12}},
			{at: 'count', fade: 0.4, set: {heart: 0.2}},
			{at: 'narrator_008_gone', fade: 1.2, set: {heart: 0, drone: 0.04, clock: 0.1, night: 0.06, house: 0.12}},
			{at: 'title', fade: 0.5, set: {drone: 0.1, clock: 0, night: 0}},
		],
		sfx: [
			{sound: 'owl_hoot', at: 'open_black', offset: 0.6, volume: 0.25},
			{sound: 'bed_creak', at: 'narrator_002_not_the_end', offset: 1.6, volume: 0.35},
			{sound: 'creature_rasp', at: 'stare', offset: 0.9, volume: 0.12, maxDuration: 1.0},
			{sound: 'cloth_rustle', at: 'narrator_007_counted', offset: 0.5, volume: 0.45},
			{sound: 'breath_exhale_f', at: 'count', offset: 0.4, volume: 0.35},
			{sound: 'breath_exhale_f', at: 'count', offset: 1.5, volume: 0.3},
			{sound: 'cloth_rustle', at: 'narrator_008_gone', offset: 0.1, volume: 0.35},
		],
		overlays: [],
	},
	{
		id: 'breakfast',
		name: "Grandma's house",
		steps: [
			b('morning', 1.6, 'the house in daylight; birds'),
			'narrator_009_moved',
			'narrator_010_his_room',
			'narrator_011_told_him',
			'lily_001_man_on_bed',
			'dad_001_nightmare',
			'lily_002_four',
			'narrator_012_stopped',
			'narrator_013_smiled',
			'narrator_014_didnt',
		],
		tail: 0.2,
		beds: {house: 0.1, night: 0, clock: 0.05, drone: 0},
		bedFade: 1.0,
		bedAutomation: [{at: 'narrator_012_stopped', fade: 0.4, set: {drone: 0.06}}, {at: 'narrator_013_smiled', fade: 1.0, set: {drone: 0}}],
		sfx: [
			{sound: 'morning_street', at: 'morning', volume: 0.25, maxDuration: 6.5},
			{sound: 'mug_set', at: 'narrator_011_told_him', offset: 0.6, volume: 0.35},
			{sound: 'pot_lid', at: 'dad_001_nightmare', offset: -0.3, volume: 0.15},
		],
		overlays: [],
	},
	{
		id: 'diary',
		name: 'The diary',
		steps: [
			'narrator_015_attic',
			b('attic', 1.4, 'up the ladder into the attic; dust in the light'),
			'narrator_016_notebook',
			'narrator_017_changed',
			b('page', 1.0, 'a page turns'),
			'grandma_001_june',
			'grandma_002_danny',
			'grandma_003_mother',
			'grandma_004_rule',
			'grandma_005_our_room',
			'narrator_018_last_page',
			'narrator_019_daniel',
			'narrator_020_mine_now',
			b('realize', 1.6, 'the diary in her lap; the room at the end of the hall'),
		],
		tail: 0.2,
		beds: {attic: 0.12, house: 0.04, drone: 0.03},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'grandma_001_june', fade: 1.5, set: {drone: 0.08}},
			{at: 'grandma_004_rule', fade: 1.0, set: {drone: 0.12}},
			{at: 'narrator_020_mine_now', fade: 0.8, set: {drone: 0.14, heart: 0.1}},
		],
		sfx: [
			{sound: 'stairs_steps', at: 'narrator_015_attic', offset: 1.2, volume: 0.35, maxDuration: 2.2},
			{sound: 'drawer_search', at: 'attic', offset: 0.3, volume: 0.25, maxDuration: 1.2},
			{sound: 'page_turn', at: 'page', offset: 0.1, volume: 0.5},
			{sound: 'page_turn', at: 'narrator_018_last_page', offset: 0.2, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'dadReads',
		name: 'Dad reads it',
		steps: [
			'narrator_021_showed',
			'dad_002_where',
			'lily_003_closer',
			'dad_003_i_know',
			'narrator_022_not_a_dream',
			'narrator_023_sleep_with_mom',
			'lily_004_what_if',
			'dad_004_find_me',
			b('night_falls', 1.8, 'evening; the light goes; the little bedroom door'),
		],
		tail: 0.2,
		beds: {house: 0.1, clock: 0.06, drone: 0.05, heart: 0},
		bedFade: 1.0,
		bedAutomation: [{at: 'night_falls', fade: 1.5, set: {clock: 0.1, night: 0.08, drone: 0.08}}],
		sfx: [
			{sound: 'page_turn', at: 'narrator_021_showed', offset: 1.2, volume: 0.35},
			{sound: 'door_close', at: 'night_falls', offset: 0.9, volume: 0.3},
		],
		overlays: [],
	},
	{
		id: 'thirdNight',
		name: 'The third night',
		steps: [
			'narrator_024_couldnt',
			'narrator_025_four',
			b('clock_400', 1.6, 'the clock says 4:00'),
			'narrator_026_silent',
			b('silence', 1.8, 'nothing at all'),
			'narrator_027_voice',
			'rake_001_danny',
			'narrator_028_mom',
			'narrator_029_ran',
			'narrator_030_empty',
			b('torn', 2.2, 'the torn blanket: three long lines'),
			'narrator_031_torn',
			'narrator_032_never_found',
		],
		tail: 0.3,
		beds: {house: 0.1, clock: 0.1, night: 0.07, drone: 0.05},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'narrator_026_silent', offset: 0.2, fade: 0.05, set: {clock: 0, night: 0, house: 0.03, drone: 0.04}},
			{at: 'rake_001_danny', fade: 0.2, set: {drone: 0.14}},
			{at: 'narrator_029_ran', fade: 0.3, set: {heart: 0.22, drone: 0.12}},
			{at: 'torn', fade: 0.6, set: {heart: 0, drone: 0.16}},
			{at: 'narrator_032_never_found', fade: 1.5, set: {drone: 0.05, house: 0.06}},
		],
		sfx: [
			{sound: 'clock_tick', at: 'clock_400', offset: 0.2, volume: 0.4},
			{sound: 'nails_scrape', at: 'rake_001_danny', offset: 0.9, volume: 0.16, maxDuration: 1.4},
			{sound: 'bed_creak', at: 'narrator_028_mom', offset: 0.2, volume: 0.25},
			{sound: 'running_carpet', at: 'narrator_029_ran', offset: 0.1, volume: 0.45, maxDuration: 2.6},
			{sound: 'door_open', at: 'narrator_029_ran', offset: 2.4, volume: 0.35},
			{sound: 'cloth_rustle', at: 'torn', offset: 0.3, volume: 0.25},
		],
		overlays: [],
	},
	{
		id: 'pages',
		name: 'The missing pages',
		steps: [
			'narrator_038_wallet',
			b('unfold', 1.2, 'his wallet; the folded pages, torn along one edge'),
			'grandma_006_june14',
			'grandma_007_name',
			'grandma_008_rule',
			'narrator_039_knew',
			'narrator_040_anyway',
		],
		tail: 0.2,
		beds: {house: 0.06, drone: 0.06, clock: 0, night: 0, heart: 0},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'grandma_007_name', fade: 1.0, set: {drone: 0.1}},
			{at: 'narrator_040_anyway', fade: 1.2, set: {drone: 0.04}},
		],
		sfx: [
			{sound: 'cloth_rustle', at: 'unfold', offset: 0.1, volume: 0.3},
			{sound: 'page_turn', at: 'unfold', offset: 0.6, volume: 0.45},
		],
		overlays: [],
	},
	{
		id: 'today',
		name: 'Twenty-five years later',
		steps: [
			'narrator_041_moved',
			'narrator_042_grew_up',
			'narrator_043_sam',
			'son_001_skinny_man',
			'son_002_watches',
			'narrator_044_never_house',
			'narrator_045_us',
		],
		tail: 0.2,
		beds: {house: 0.08, clock: 0.05, drone: 0.02, heart: 0},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'son_002_watches', offset: 1.0, fade: 0.5, set: {clock: 0, drone: 0.1}},
			{at: 'narrator_045_us', fade: 0.4, set: {house: 0.04, drone: 0.16}},
		],
		sfx: [
			{sound: 'morning_street', at: 'narrator_043_sam', volume: 0.18, maxDuration: 5},
			{sound: 'mug_set', at: 'son_001_skinny_man', offset: -0.4, volume: 0.25},
		],
		overlays: [],
	},
	{
		id: 'lastNight',
		name: 'The third night, again',
		steps: [
			'son_003_closer',
			'narrator_046_third',
			'narrator_047_lay_down',
			b('clock', 2.2, 'his room; she lies in his bed, eyes open; 3:59 -> 4:00'),
			'narrator_048_blanket',
			'narrator_049_climbed',
			'narrator_050_looked',
			b('face', 1.6, 'face to face; its mouth opens'),
			'rake_002_lily',
			b('black', 2.4, 'smash to black; nothing'),
		],
		tail: 0,
		beds: {house: 0.06, clock: 0.08, night: 0.05, drone: 0.06, heart: 0, tension: 0},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'clock', fade: 0.3, set: {clock: 0.12, drone: 0.08}},
			{at: 'narrator_048_blanket', fade: 0.05, set: {clock: 0, night: 0, house: 0.02, drone: 0.1, heart: 0.12}},
			{at: 'narrator_049_climbed', fade: 1.5, set: {heart: 0.24, drone: 0.16, tension: 0.06}},
			{at: 'face', fade: 0.3, set: {heart: 0.3, tension: 0.1, drone: 0.2}},
			{at: 'black', fade: 0.02, set: {house: 0, heart: 0, tension: 0, drone: 0}},
		],
		sfx: [
			{sound: 'clock_tick', at: 'clock', offset: 1.4, volume: 0.45},
			{sound: 'bed_creak', at: 'narrator_048_blanket', offset: 0.6, volume: 0.35},
			{sound: 'cloth_rustle', at: 'narrator_049_climbed', offset: 0.3, volume: 0.3},
			{sound: 'bed_creak', at: 'narrator_049_climbed', offset: 2.2, volume: 0.3},
			{sound: 'nails_scrape', at: 'narrator_049_climbed', offset: 3.4, volume: 0.18, maxDuration: 1.6},
			{sound: 'creature_rasp', at: 'face', offset: 0.4, volume: 0.14, maxDuration: 1.0},
		],
		overlays: [],
	},
	{
		id: 'letter',
		name: 'The letter',
		steps: [
			b('morning', 2.8, 'morning light; Sam in the doorway; the bed empty, raked open; the notebook on the pillow'),
			'narrator_051_glad',
			'narrator_052_never_wanted',
			'narrator_053_someone',
			'narrator_054_starve',
			'narrator_055_couldnt',
			'narrator_056_decide',
			b('last', 2.8, 'Sam alone with the notebook; the end of his bed'),
		],
		tail: 0,
		beds: {house: 0.07, clock: 0, night: 0, drone: 0.03, heart: 0, tension: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'narrator_054_starve', fade: 2.0, set: {drone: 0.07}},
			{at: 'last', fade: 1.0, set: {drone: 0.12, house: 0.03}},
		],
		sfx: [
			{sound: 'morning_street', at: 'morning', offset: 0.2, volume: 0.12, maxDuration: 3},
			{sound: 'door_open', at: 'morning', offset: 0.3, volume: 0.3},
			{sound: 'page_turn', at: 'narrator_051_glad', offset: -0.4, volume: 0.4},
		],
		overlays: [],
	},
	{
		id: 'end',
		name: 'Black',
		steps: [b('end_black', 2.5, 'black, silence')],
		tail: 0,
		sfx: [],
		overlays: [],
		beds: {house: 0, clock: 0, night: 0, drone: 0, tension: 0, heart: 0, attic: 0},
		bedFade: 0.01,
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - kept sparse on purpose (the brief: silence beats a score). Low booms
// and sub drops land on the reveals; no whooshes between chapters except where a scene
// starts on a jolt. Cues on lines cut from an edit are skipped automatically.
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	diary: {sound: 'whoosh_1', volume: 0.18},
	thirdNight: {sound: 'whoosh_2', volume: 0.2},
	lastNight: {sound: 'whoosh_1', volume: 0.16},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	firstNight: [hit('sub_drop', 'narrator_001_woke_up', 2.6, 0.3), hit('bass_hit', 'narrator_005_looking', 0.1, 0.32), hit('boom_hit', 'title', 0.1, 0.35)],
	breakfast: [hit('sub_drop', 'narrator_012_stopped', 0.2, 0.22)],
	diary: [hit('bass_hit', 'grandma_002_danny', 0.4, 0.3), hit('sub_drop', 'grandma_004_rule', 4.0, 0.3), hit('boom_hit', 'narrator_020_mine_now', 0.3, 0.38)],
	dadReads: [hit('sub_drop', 'dad_004_find_me', 0.5, 0.28)],
	thirdNight: [hit('riser_short', 'rake_001_danny', -1.8, 0.2), hit('boom_hit', 'narrator_030_empty', 0.3, 0.42), hit('stinger', 'torn', 0.05, 0.3)],
	pages: [hit('bass_hit', 'grandma_007_name', 0.2, 0.3), hit('sub_drop', 'narrator_040_anyway', 0.1, 0.26)],
	today: [hit('sub_drop', 'son_002_watches', 0.3, 0.3), hit('boom_hit', 'narrator_045_us', 0.15, 0.4)],
	lastNight: [hit('bass_hit', 'narrator_048_blanket', 0.0, 0.35), hit('riser_long', 'narrator_050_looked', 0.0, 0.22), hit('stinger', 'rake_002_lily', 0.05, 0.38), hit('boom_hit', 'black', 0.0, 0.5)],
	letter: [hit('sub_drop', 'narrator_056_decide', 0.2, 0.28)],
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
const FEMALE = new Set(['narrator', 'lily', 'grandma']);

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

const BED_NAMES: BedName[] = ['house', 'clock', 'night', 'drone', 'tension', 'heart', 'attic'];

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

/** The main composition's edit (RakeHorror): the ~10 minute YouTube cut. */
export const TIMELINE: Timeline = buildTimeline('short');
/** Every line at its written pacing (composition RakeHorrorFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
