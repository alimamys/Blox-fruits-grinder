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
// Sound: the majlis is quiet (room tone, incense crackling, a coffee cup); Noura's night is a wedding: the drums and
// the clapping play under Yadda's voice and stop dead on the reveals; the desert wind outside; a low drone and a
// heartbeat only on the worst moments.
// ---------------------------------------------------------------------------
export const SCENES: SceneDef[] = [
	{
		id: 'majlis',
		name: 'The majlis',
		steps: [
			b('open_black', 2.0, 'black; incense smoke curls up; the majlis fades in'),
			'narrator_001_once',
			b('pour', 1.6, 'Yadda pours coffee from the dallah; the little girl on the cushions'),
			'girl_001_scary',
			'yadda_001_true',
			'yadda_002_sabahiya',
			b('title', 3.2, 'THE JINN WEDDING; the picture dives into the incense smoke, into 1997'),
		],
		tail: 0.2,
		beds: {room: 0.12, night: 0.1},
		bedFade: 1.0,
		bedAutomation: [{at: 'title', fade: 0.6, set: {room: 0, night: 0, drone: 0.3}}],
		sfx: [
			{sound: 'campfire', at: 'open_black', offset: 0.2, volume: 0.5, maxDuration: 12},
			{sound: 'coffee_pour', at: 'pour', offset: 0.1, volume: 0.9},
			{sound: 'mug_set', at: 'pour', offset: 1.3, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'call',
		name: 'The call',
		steps: [
			'yadda_003_famous',
			'yadda_004_phone',
			b('ring', 1.4, 'the phone rings in Noura\'s house'),
			'mother_001_tomorrow',
			'noura_001_booked',
			'mother_002_dinars',
			b('dinars', 1.2, 'Noura holds the receiver; silence on the line'),
			'yadda_005_fortune',
		],
		tail: 0.2,
		beds: {drums: 0.7, crowd: 0.9, drone: 0, room: 0},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'yadda_004_phone', fade: 1.2, set: {drums: 0, crowd: 0, room: 0.1}},
			{at: 'mother_002_dinars', fade: 0.4, set: {drone: 0.3}},
			{at: 'yadda_005_fortune', fade: 1.0, set: {drone: 0}},
		],
		sfx: [
			{sound: 'phone_ring_old', at: 'ring', offset: 0.0, volume: 0.85, maxDuration: 1.6},
			{sound: 'phone_pickup', at: 'ring', offset: 1.25, volume: 0.7},
		],
		overlays: [],
	},
	{
		id: 'drive',
		name: 'The drive',
		steps: [
			b('car', 1.6, 'night; a long black car waits outside; the band gets in with their drums'),
			'yadda_006_car',
			'yadda_007_dark',
			b('road', 1.8, 'the empty desert road; nothing but the headlights'),
			'yadda_008_house',
			'yadda_009_never_seen',
		],
		tail: 0.2,
		beds: {car: 0.6, night: 0.3, drone: 0.1},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'yadda_008_house', fade: 1.2, set: {car: 0.25, drone: 0.3}},
		],
		sfx: [{sound: 'door_close', at: 'car', offset: 1.1, volume: 0.8}],
		overlays: [],
	},
	{
		id: 'hall',
		name: 'The hall',
		steps: [
			b('doors', 1.6, 'the doors open: the golden hall'),
			'yadda_010_gold',
			'yadda_011_cold',
			'mother_003_play',
			b('play', 2.4, 'the band starts: drums; the guests rise to dance'),
			'yadda_012_danced',
			'yadda_013_one_person',
			'yadda_014_eyes',
			b('flicker', 1.6, 'the lights flicker; hundreds of eyes shine'),
		],
		tail: 0.2,
		beds: {crowd: 0, drone: 0.25, drums: 0},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'mother_003_play', fade: 0.3, set: {crowd: 0.0}},
			{at: 'play', offset: 0.2, fade: 0.1, set: {drums: 1.25}},
			{at: 'yadda_012_danced', fade: 0.8, set: {drums: 0.7}},
			{at: 'yadda_014_eyes', fade: 0.8, set: {drone: 0.4}},
		],
		sfx: [
			{sound: 'door_open', at: 'doors', offset: 0.1, volume: 0.9},
			{sound: 'light_flicker', at: 'yadda_014_eyes', offset: 4.74, volume: 0.7},
		],
		overlays: [],
	},
	{
		id: 'feet',
		name: 'Their feet',
		steps: [
			'yadda_015_youngest',
			'drummer_001_feet',
			b('look', 1.4, 'Noura looks down'),
			'yadda_016_hooves',
			b('hooves', 2.0, 'hooves under the dresses, clicking on the marble'),
			'girl_002_run',
			'yadda_017_where',
			'drummer_002_go',
			'noura_002_keep',
			'yadda_018_sounds',
		],
		tail: 0.2,
		beds: {drums: 0.7, drone: 0.3, heart: 0},
		bedFade: 0.8,
		bedAutomation: [
			{at: 'look', fade: 0.3, set: {drums: 0.45, heart: 0.6}},
			{at: 'hooves', fade: 0.2, set: {drums: 0.55, heart: 0.75}},
			{at: 'girl_002_run', fade: 0.4, set: {heart: 0, drums: 0, drone: 0.12, room: 0.12}},
			{at: 'drummer_002_go', fade: 0.3, set: {room: 0, drums: 0.6, drone: 0.3}},
			{at: 'yadda_018_sounds', fade: 1.5, set: {drums: 0.45, drone: 0.4, tension: 0.25}},
		],
		sfx: [
			{sound: 'hooves_click', at: 'yadda_016_hooves', offset: 3.7, volume: 0.9, grid: 0.3, gridOffset: -0.05},
			{sound: 'hooves_click', at: 'yadda_016_hooves', offset: 7.7, volume: 1.0, grid: 0.3, gridOffset: -0.05},
			{sound: 'hooves_click', at: 'hooves', offset: 0.6, volume: 0.9, grid: 0.3, gridOffset: -0.05},
			{sound: 'donkey_bray', at: 'yadda_018_sounds', offset: 3.9, volume: 0.6},
			{sound: 'wrong_laugh', at: 'yadda_018_sounds', offset: 5.9, volume: 0.6},
			{sound: 'wrong_singing', at: 'yadda_018_sounds', offset: 8.6, volume: 0.6},
		],
		overlays: [],
	},
	{
		id: 'dawn',
		name: 'Until dawn',
		steps: [
			'yadda_019_all_night',
			'yadda_020_veil',
			'yadda_021_silent',
			b('silence', 1.6, 'the hand goes up; the hall freezes; total silence'),
			'mother_004_enough',
			'yadda_022_paid',
		],
		tail: 0.2,
		beds: {drums: 0.45, drone: 0.3, tension: 0.2},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'yadda_021_silent', offset: 3.2, fade: 0.05, set: {drums: 0, tension: 0, drone: 0.1}},
			{at: 'yadda_022_paid', fade: 1.5, set: {night: 0.3, drone: 0.08}},
		],
		sfx: [],
		overlays: [],
	},
	{
		id: 'outside',
		name: 'The man at dawn',
		steps: [
			b('morning', 1.6, 'grey dawn; the band comes out into the sand'),
			'yadda_023_man',
			'man_001_empty',
			'yadda_024_turned',
			b('turn', 1.8, 'she turns: the house is a burned ruin'),
			'yadda_025_ruin',
			'yadda_026_hoofprints',
		],
		tail: 0.3,
		beds: {wind: 0.5, drone: 0.12},
		bedFade: 1.0,
		bedAutomation: [
			{at: 'turn', fade: 0.3, set: {drone: 0.5}},
			{at: 'yadda_026_hoofprints', fade: 1.5, set: {drone: 0.3, wind: 0.4}},
		],
		sfx: [],
		overlays: [],
	},
	{
		id: 'ending',
		name: 'The majlis again',
		steps: [
			'yadda_027_never',
			'yadda_028_newspaper',
			'girl_003_true',
			'yadda_029_nobody',
			'yadda_030_listen',
			'yadda_031_whose',
			b('phone', 3.0, 'the old phone in the majlis rings; they both look at it'),
		],
		tail: 0,
		beds: {room: 0.12, wind: 0, drone: 0.06},
		bedFade: 1.2,
		bedAutomation: [
			{at: 'yadda_030_listen', fade: 1.5, set: {drone: 0.3}},
			{at: 'phone', fade: 0.05, set: {room: 0.04, drone: 0.4}},
		],
		sfx: [{sound: 'phone_ring_old', at: 'phone', offset: 0.25, volume: 0.95, maxDuration: 2.6}],
		overlays: [],
	},
	{
		id: 'end',
		name: 'Black',
		steps: [b('end_black', 2.5, 'black, silence')],
		tail: 0,
		sfx: [],
		overlays: [],
		beds: {room: 0, night: 0, car: 0, drums: 0, crowd: 0, wind: 0, drone: 0, tension: 0, heart: 0},
		bedFade: 0.01,
	},
];

// ---------------------------------------------------------------------------
// CINEMATIC HITS - kept sparse on purpose (the brief: silence beats a score). Low booms
// and sub drops land on the reveals; no whooshes between chapters except where a scene
// starts on a jolt. Cues on lines cut from an edit are skipped automatically.
// ---------------------------------------------------------------------------
const ENTER: Record<string, {sound: string; volume?: number; offset?: number}> = {
	call: {sound: 'whoosh_1', volume: 0.16},
	hall: {sound: 'whoosh_2', volume: 0.16},
	ending: {sound: 'whoosh_1', volume: 0.14},
};

const hit = (sound: string, at: string, offset = 0, volume = 0.4, extra: Partial<SfxCue> = {}): SfxCue => ({sound, at, offset, volume, ...extra});

const HITS: Record<string, SfxCue[]> = {
	majlis: [hit('boom_hit', 'title', 0.1, 0.32)],
	call: [hit('sub_drop', 'mother_002_dinars', 0.0, 0.22)],
	drive: [hit('bass_hit', 'yadda_008_house', 1.0, 0.28)],
	hall: [hit('sub_drop', 'yadda_011_cold', 2.4, 0.22), hit('stinger', 'flicker', 0.15, 0.26)],
	feet: [hit('bass_hit', 'drummer_001_feet', 0.0, 0.28), hit('boom_hit', 'yadda_016_hooves', 2.9, 0.4), hit('riser_short', 'yadda_018_sounds', 2.0, 0.16)],
	dawn: [hit('sub_drop', 'silence', 0.0, 0.3)],
	outside: [hit('boom_hit', 'turn', 0.05, 0.45), hit('sub_drop', 'yadda_026_hoofprints', 2.2, 0.3)],
	ending: [hit('stinger', 'phone', 0.2, 0.3)],
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
const FEMALE = new Set(['narrator', 'yadda', 'girl', 'noura', 'mother', 'drummer']);

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

const BED_NAMES: BedName[] = ['room', 'night', 'car', 'drums', 'crowd', 'wind', 'drone', 'tension', 'heart'];

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
			let at = resolve(cue.at, cue.offset, cue.fromEnd);
			if (at === null) continue;
			if (cue.grid) {
				// the drums bed is tiled every loopF frames (AudioLayer: file length minus its 0.5 s crossfade tail),
				// so its beat grid restarts at each tile: snap to the grid of the tile playing at that moment
				const len = audioDuration('sfx/drums_wedding.wav');
				const loopF = len ? Math.round((len - 0.5) * FPS) : 0;
				const anchor = loopF ? (Math.floor((at * FPS) / loopF) * loopF) / FPS : 0;
				const off = cue.gridOffset ?? 0;
				at = anchor + Math.round((at - anchor - off) / cue.grid) * cue.grid + off;
			}
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

/** The main composition's edit (JinnWedding): the ~10 minute YouTube cut. */
export const TIMELINE: Timeline = buildTimeline('short');
/** Every line at its written pacing (composition JinnWeddingFull). */
export const TIMELINE_FULL: Timeline = buildTimeline('full');

export const sceneById = (id: string, tl: Timeline = TIMELINE): SceneTiming => {
	const s = tl.scenes.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};
