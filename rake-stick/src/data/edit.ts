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
 * Voice lines dropped from the short edit . Shots cut on a dropped line fall away; the previous shot runs on.
 */
export const CUT_IN_SHORT = new Set<string>(['narrator_017_changed', 'narrator_028_mom']);

/** Scenes left out of the short edit. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a shorter time in the short edit (seconds). */
export const SHORT_BEAT_HOLD: Record<string, number> = {open_black: 1.6, title: 2.4, stare: 1.5, count: 2.0, realize: 1.2, silence: 1.4, torn: 1.8, clock_400: 1.3, unfold: 1.0};

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
	'grandma_007_name',
	'grandma_008_rule',
	'narrator_040_anyway',
	'son_002_watches',
	'narrator_044_never_house',
	'narrator_045_us',
	'son_003_closer',
	'narrator_046_third',
	'narrator_048_blanket',
	'narrator_050_looked',
	'narrator_051_glad',
	'narrator_055_couldnt',
	'narrator_056_decide',
]);

/** Pause after a line in the short edit. */
export const shortPause = (id: string, pause: number) => (DRAMATIC_PAUSE.has(id) ? Math.min(pause, 1.0) : Math.min(pause, 0.4));

/** Silence after a scene's last step in the short edit. */
export const shortTail = (tail: number) => Math.min(tail, 0.2);
