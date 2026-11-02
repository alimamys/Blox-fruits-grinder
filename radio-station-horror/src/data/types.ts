// Types for the editable script / timing data.

/** Every sound-effect hook. Files are looked up as public/audio/<name>.wav (see src/audio/audioFiles.ts). */
export type SfxName =
	| 'low_ambient_hum'
	| 'radio_static'
	| 'three_beeps'
	| 'knocking'
	| 'breathing'
	| 'electrical_buzz'
	| 'impact'
	| 'glass_break'
	| 'motel_ambience'
	// Extra optional hooks (not required, procedural placeholders are generated for them too)
	| 'scratching'
	| 'creak'
	| 'whisper'
	| 'phone_buzz'
	| 'tv_on'
	| 'train';

export type Speaker =
	| 'narrator'
	| 'radio' // the mysterious female station voice (also used when it speaks through the TV / alarm clock)
	| 'neighbor'
	| 'adam'
	| 'seller'
	| 'victor'
	| 'sfx' // no spoken words – a beep, a knock, a pause
	| 'silence';

export type SfxCue = {
	sfx: SfxName;
	/** Seconds after the start of the beat. Default 0. */
	at?: number;
	/** 0..1 (values > 1 amplify). Default 1. */
	volume?: number;
	/** Play only this many seconds of the file. */
	dur?: number;
	loop?: boolean;
	/** Fade-in / fade-out in seconds. */
	fadeIn?: number;
	fadeOut?: number;
	playbackRate?: number;
};

export type Beat = {
	/** Unique inside its chapter. Scenes reference beats by this id. */
	id: string;
	speaker: Speaker;
	/** The narration / dialogue line exactly as it should be spoken. */
	text: string;
	/** Duration in seconds. Change this to re-time the video – visuals follow automatically. */
	dur: number;
	/** Text flashed on screen (radio messages, key reveals). Most narration has none. */
	onScreen?: string;
	sfx?: SfxCue[];
};

/** A looping background bed that spans part (or all) of a chapter. */
export type AmbienceCue = {
	sfx: SfxName;
	volume: number;
	/** Beat id where the bed starts (default: chapter start). */
	from?: string;
	/** Beat id where the bed ends – it stops at the START of this beat (default: chapter end). */
	until?: string;
	fadeIn?: number;
	fadeOut?: number;
};

export type ChapterId =
	| 'disclaimer'
	| 'coldOpen'
	| 'titleCard'
	| 'radioReturns'
	| 'protecting'
	| 'theBed'
	| 'victorHale'
	| 'motel'
	| 'aftermath'
	| 'daniel'
	| 'endCard';

export type Chapter = {
	id: ChapterId;
	/** Name shown in the Remotion Studio timeline. */
	title: string;
	/** Small on-screen chapter label (optional). */
	label?: string;
	beats: Beat[];
	ambience?: AmbienceCue[];
};
