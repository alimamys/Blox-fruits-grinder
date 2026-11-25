// Edit selection.
//
// 'short' - the YouTube cut (default, ~10 min): every line of the script, with pauses
//           tightened and silent beats shortened so it never stops moving. Lines can be
//           dropped here if the voiced cut runs long (see the candidates below).
// 'full'  - every line at its written pacing, all beats at full length.
//
// Compositions: JinnWedding (short) and JinnWeddingFull (full).
export type EditMode = 'full' | 'short';

/**
 * Voice lines dropped from the short edit . Shots cut on a dropped line fall away; the previous shot runs on.
 */
export const CUT_IN_SHORT = new Set<string>([]);

/** Scenes left out of the short edit. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a shorter time in the short edit (seconds). */
export const SHORT_BEAT_HOLD: Record<string, number> = {};

/** Lines whose pause after them is a deliberate dramatic hold - kept (up to 0.9 s). */
export const DRAMATIC_PAUSE = new Set<string>([
	'narrator_001_once',
	'yadda_002_sabahiya',
	'mother_002_dinars',
	'yadda_009_never_seen',
	'mother_003_play',
	'yadda_014_eyes',
	'drummer_001_feet',
	'yadda_016_hooves',
	'yadda_017_where',
	'noura_002_keep',
	'yadda_018_sounds',
	'yadda_020_veil',
	'yadda_021_silent',
	'mother_004_enough',
	'man_001_empty',
	'yadda_024_turned',
	'yadda_026_hoofprints',
	'yadda_029_nobody',
	'yadda_031_whose',
]);

/** Pause after a line in the short edit. */
export const shortPause = (id: string, pause: number) => (DRAMATIC_PAUSE.has(id) ? Math.min(pause, 1.0) : Math.min(pause, 0.4));

/** Silence after a scene's last step in the short edit. */
export const shortTail = (tail: number) => Math.min(tail, 0.2);
