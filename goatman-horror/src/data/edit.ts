// Edit selection.
//
// The approved length is 12-13 minutes with the WHOLE script: the main edit ('short') keeps
// every line and only tightens the gaps between them; 'full' keeps the written pauses.
//
// Compositions: Door306Horror (main) and Door306HorrorFull (identical).
export type EditMode = 'full' | 'short';

/** Voice lines dropped from the main edit: none - the user asked to keep the full script. */
export const CUT_IN_SHORT = new Set<string>([]);

/** Scenes left out of the main edit: none. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a different time in the main edit: none. */
export const SHORT_BEAT_HOLD: Record<string, number> = {};

/** Pause after a line in the main edit: dramatic holds (written as 0.8 s or more) stay up to
 *  0.65 s; every other gap runs at 45 % so the whole script fits 12-13 minutes. */
export const shortPause = (_id: string, pause: number) => (pause >= 0.8 ? Math.min(pause, 0.65) : pause * 0.45);

/** Silence after a scene's last step in the main edit: as written. */
export const shortTail = (tail: number) => tail;
