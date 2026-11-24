// Edit selection.
//
// 'short' - the YouTube cut (default, ~10 min): every line of the script, with pauses
//           tightened and silent beats shortened so it never stops moving. Lines can be
//           dropped here if the voiced cut runs long (see the candidates below).
// 'full'  - every line at its written pacing, all beats at full length.
//
// Compositions: RakeHorror (short) and RakeHorrorFull (full).
export type EditMode = 'full' | 'short';

/**
 * Voice lines dropped from the short edit (the Drama 3 performance runs 11:29 uncut; this
 * edit brings it to about 10:30). Shots cut on a dropped line fall away; the previous shot runs on.
 */
export const CUT_IN_SHORT = new Set<string>([]);

/** Scenes left out of the short edit. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a shorter time in the short edit (seconds). */
export const SHORT_BEAT_HOLD: Record<string, number> = {};

/** Lines whose pause after them is a deliberate dramatic hold - kept (up to 0.9 s). */
export const DRAMATIC_PAUSE = new Set<string>([
	'narrator_001_woke_up',
	'narrator_005_looking',
	'narrator_008_gone',
	'lily_002_four',
	'narrator_012_stopped',
	'narrator_014_didnt',
	'grandma_004_rule',
	'grandma_005_our_room',
	'narrator_020_mine_now',
	'dad_003_i_know',
	'dad_004_find_me',
	'narrator_025_four',
	'narrator_027_voice',
	'rake_001_danny',
	'narrator_030_empty',
	'narrator_032_never_found',
	'son_002_watches',
	'narrator_037_first_time',
]);

/** Pause after a line in the short edit. */
export const shortPause = (id: string, pause: number) => (DRAMATIC_PAUSE.has(id) ? Math.min(pause, 1.0) : Math.min(pause, 0.4));

/** Silence after a scene's last step in the short edit. */
export const shortTail = (tail: number) => Math.min(tail, 0.2);
