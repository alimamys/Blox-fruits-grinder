// Shared data types for the voice + timeline system ("Mr. Widemouth").
// Everything that controls timing lives in src/data - scenes never hardcode
// their own durations; they read them from the computed timeline.

export type CharacterId =
	| 'narrator' // Eli at 30, telling it (voice-over)
	| 'eli' // Eli at 5, inside the scene
	| 'widemouth' // Mr. Widemouth
	| 'mom'
	| 'dad'
	| 'leo'; // Eli's son, 5, in the present day

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
	| 'screaming'
	| 'terrified'
	| 'shaking';

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
	| 'crowdRoom' // background fragments: room, low-passed, quieter
	| 'closet' // tiny closet, almost dry, very close
	| 'door' // heard through a closed front door: muffled, low-passed
	| 'doorGap' // through a door opened an inch: slightly muffled, corridor air
	| 'creature' // the creature: pitched down, gritty, broken
	| 'outdoor' // outside at night: open air, a short soft slap-back off the trees
	| 'trailer' // inside the small trailer: tight, boxy room
	| 'thing'; // the voice at the door: chopped into syllables, re-timed with no rhythm, slightly detuned, behind a metal door

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
	/** Exact Fish Audio inline direction, e.g. "[whispering, trembling]" (overrides the emotion tag). */
	fishTags?: string;
	/** Optional tremor/age/youth tweaks for the post chain. */
	voiceTweak?: 'younger' | 'none';
	/** Not shown in the subtitles (screams, breaths). */
	noSubtitle?: boolean;
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

export type BedName = 'house' | 'day' | 'night' | 'truck' | 'wind' | 'musicbox' | 'drone' | 'tension' | 'heart' | 'heartFast';

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
	/** Transition sound played as the scene starts (e.g. a whoosh). */
	enter?: {sound: string; volume?: number; offset?: number};
}
