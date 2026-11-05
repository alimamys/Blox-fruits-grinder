// Shared data types for the voice + timeline system.
// Everything that controls timing lives in src/data - scenes never hardcode
// their own durations; they read them from the computed timeline.

export type CharacterId =
	| 'narrator'
	| 'daniel'
	| 'emma'
	| 'oldWoman'
	| 'captain'
	| 'crew1'
	| 'crew2'
	| 'harbor'
	| 'pa'
	| 'police'
	| 'crowd';

/** Emotional performance tags. Providers translate these into whatever they support. */
export type Emotion =
	| 'neutral'
	| 'warm'
	| 'serious'
	| 'tired'
	| 'sleepy'
	| 'affectionate'
	| 'casual'
	| 'amused'
	| 'confused'
	| 'uneasy'
	| 'afraid'
	| 'panicked'
	| 'grieving'
	| 'whispering'
	| 'authoritative'
	| 'professional'
	| 'unnaturally_calm'
	| 'matter_of_fact'
	| 'comforting'
	| 'distressed'
	| 'breathless'
	| 'angry'
	| 'protective'
	| 'hypnotized'
	| 'screaming';

/**
 * Post-processing chain applied to the raw TTS take (see scripts/voice/postprocess.py).
 * The effect is baked into the WAV so Remotion only has to place the file.
 */
export type AudioEffect =
	| 'none'
	| 'marineRadio' // VHF: HP ~300 Hz, LP ~3.4 kHz, compression, static bed, TX clicks
	| 'pa' // ferry PA: LP, metallic room echo, mild distortion, hiss
	| 'paSoft' // PA with half the processing - the voice is getting closer
	| 'paIntimate' // almost dry - the PA filter has nearly vanished
	| 'multiSpeaker' // the same voice from every speaker, radio and phone at once
	| 'phone' // narrow band phone speaker
	| 'distant' // outside / behind a door, low-passed with a long tail
	| 'whisper' // noise-vocoded breathy whisper blended with the voice
	| 'whisperClose' // final line: whisper, dry, close, slightly right/behind
	| 'room' // small steel cabin room tone
	| 'shout' // a shouted line: saturation + room
	| 'crowdRoom'; // background passenger fragments: room, low-passed, quieter

export type BreathCue =
	| 'none'
	| 'shakyInhale'
	| 'sharpInhale'
	| 'fastBreathing'
	| 'raggedBreathing'
	| 'exhale'
	| 'cryingBreath';

export type FearLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface VoiceLine {
	/** Stable id - equals the filename stem. */
	id: string;
	character: CharacterId;
	/** Script text exactly as written. */
	text: string;
	/** Optional pronunciation-friendly text sent to the TTS engine. */
	spokenText?: string;
	emotion: Emotion;
	/** 0..1 how strongly the emotion is played. */
	intensity: number;
	/** Speed multiplier on top of the character's base speed. */
	pace: number;
	/** Linear gain applied in the mix (1 = normalised level). */
	volume: number;
	/** Seconds of silence before the line (negative = overlap/interrupt the previous line). */
	pauseBefore: number;
	/** Seconds of silence after the line before the next step starts. */
	pauseAfter: number;
	audioEffect: AudioEffect;
	/** Stereo position baked into the file: -1 left .. 0 centre .. 1 right. */
	pan: number;
	/** Path relative to public/audio, e.g. "narrator/narrator_001_hook.wav". */
	filename: string;
	scene: string;
	fearLevel: FearLevel;
	/** Breath sound placed right before (or for some cues after) the line. */
	breath: BreathCue;
	/** For the PA voice morph: blend the speaker's voice towards another character. */
	blendTo?: {character: CharacterId; amount: number};
	/** Free-form performance direction (used by expressive TTS providers + human actors). */
	direction: string;
	/** Optional tremor/age/youth tweaks for the post chain. */
	voiceTweak?: 'younger' | 'none';
}

/** A placed sound effect. `at` is a marker name: a voice line id or a beat id. */
export interface SfxCue {
	sound: string; // file stem in public/audio/sfx
	at: string;
	/** Seconds offset from the marker start (or from its end if fromEnd). */
	offset?: number;
	fromEnd?: boolean;
	volume?: number;
	/** Trim the sound to this many seconds (fades out over the last 0.3 s). */
	maxDuration?: number;
	note?: string;
}

/** A voice line that is placed on top of the main sequence without moving it (crowd fragments etc). */
export interface OverlayVoiceCue {
	line: string;
	at: string;
	offset?: number;
	fromEnd?: boolean;
	volume?: number;
}

export interface Beat {
	beat: string;
	/** Seconds this silent/visual beat holds the timeline. */
	hold: number;
	note?: string;
}

export type Step = string | Beat;

export type BedName = 'ocean' | 'engine' | 'wind' | 'drone' | 'crowd' | 'bridge' | 'emergency' | 'room' | 'daylight';

/** Ambience automation point: set bed levels at a marker, ramping over `fade` seconds. */
export interface BedAutomation {
	at: string;
	offset?: number;
	fromEnd?: boolean;
	fade: number;
	set: Partial<Record<BedName, number>>;
}

export interface SceneDef {
	id: string;
	name: string;
	/** Ordered spoken lines and silent beats. */
	steps: Step[];
	/** Silence added after the last step before the next scene. */
	tail: number;
	sfx: SfxCue[];
	overlays: OverlayVoiceCue[];
	/** Bed levels at the start of the scene (ramped from the previous scene). */
	beds: Partial<Record<BedName, number>>;
	bedAutomation?: BedAutomation[];
	/** How long (s) the beds take to move to this scene's levels. */
	bedFade?: number;
}
