// Edit selection.
//
// 'short' - the YouTube cut (default, ~10 min): every line of the script, with pauses
//           tightened and silent beats shortened so it never stops moving. Lines can be
//           dropped here if the voiced cut runs long (see the candidates below).
// 'full'  - every line at its written pacing, all beats at full length.
//
// Compositions: Frame240Horror (short) and Frame240HorrorFull (full).
export type EditMode = 'full' | 'short';

/**
 * Voice lines dropped from the short edit. Empty while the voiced cut fits ~10 minutes.
 * First candidates if it runs past ~10:15 (approved in PLAN.md):
 *   'narrator_045_no_movement'      - repeats "He didn't walk."
 *   'narrator_059_another_second'
 *   'narrator_096_nothing_happened'
 */
export const CUT_IN_SHORT = new Set<string>([]);

/** Scenes left out of the short edit. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a shorter time in the short edit (seconds). */
export const SHORT_BEAT_HOLD: Record<string, number> = {
	open_black: 2.2,
	playback_1: 3.6,
	scratch_1: 1.4,
	silence_call: 0.9,
	finger_line: 1.6,
	taps: 2.2,
	painting: 1.4,
	silence_waited: 1.6,
	long_silence: 1.1,
	peel: 1.3,
	fingers: 1.6,
	impact: 1.3,
	closet_silence: 3.4,
	bulge: 1.4,
};

/** Lines whose pause after them is a deliberate dramatic hold - kept (up to 0.9 s). */
export const DRAMATIC_PAUSE = new Set<string>([
	'narrator_004_hadnt_drawn',
	'narrator_005_closer',
	'narrator_018_extra_frame',
	'narrator_021_man_standing',
	'narrator_033_part_of_picture',
	'narrator_035_he_had_moved',
	'narrator_043_closer',
	'narrator_047_drawing_him',
	'narrator_055_like_my_animation',
	'mara_003_no',
	'mara_004_gets_closer',
	'narrator_064_pencil_mark',
	'narrator_070_paper',
	'narrator_077_copying_animation',
	'narrator_100_worse_mistake',
	'narrator_105_unfinished',
	'hana_013_against_wall',
	'narrator_111_white',
	'mara_011_oh_god',
	'narrator_130_pushing_outward',
	'narrator_135_white_rectangle',
	'mara_013_closet',
	'mara_019_finger_paper',
	'mara_022_not_once',
	'mara_028_touching_door',
	'mara_029_a_face',
	'mara_033_looking_at_me',
	'mara_040_selection_box',
	'mara_042_selecting_me',
	'mara_043_not_drawing',
]);

/** Pause after a line in the short edit. */
export const shortPause = (id: string, pause: number) => (DRAMATIC_PAUSE.has(id) ? Math.min(pause, 0.9) : Math.min(pause, 0.32));

/** Silence after a scene's last step in the short edit. */
export const shortTail = (tail: number) => Math.min(tail, 0.2);
