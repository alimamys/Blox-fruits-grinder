// Global video settings. Everything else (timing, narration, sound cues)
// lives in src/data/script.ts so it can be edited without touching scenes.

export const COMPOSITION_ID = 'RadioStationHorror';
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/**
 * Spacing between the three beeps in the recurring BEEP. BEEP. BEEP. motif.
 * The procedural placeholder `three_beeps.wav` uses the same spacing, and every
 * "beep" beat in the script lasts exactly this long, so visuals stay in sync.
 * If you drop in your own three_beeps.wav, set this to match its spacing.
 */
export const BEEP_SPACING_S = 0.8;

/** Spacing between the knocks inside one KNOCK. KNOCK. KNOCK. group. */
export const KNOCK_SPACING_S = 0.55;

/**
 * "Line boil": hand-drawn shapes are re-jittered every few frames so the
 * MS Paint drawings never look frozen, even in held shots.
 */
export const LINE_BOIL = {
	enabled: true,
	/** Frames each drawing variant is held for (classic boil is 3–4). */
	holdFrames: 4,
	/** Number of variants cycled through. */
	variants: 3,
};

/** Default input props for the composition (editable in Remotion Studio). */
export const DEFAULT_PROPS = {
	/** Burn narration subtitles into the video. Off by default: the brief asks for minimal on-screen text. */
	showSubtitles: false,
	/** Show small chapter labels at the start of each chapter. */
	showChapterLabels: true,
	/** Master volume for sound effects + ambience (narration is unaffected). */
	sfxVolume: 1,
	/** Master volume for narration / voice files. */
	voiceVolume: 1,
};

export type VideoProps = typeof DEFAULT_PROPS;
