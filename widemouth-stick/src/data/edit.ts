// Edit selection.
//
// The whole script is kept: the main edit ('short') only tightens the gaps between lines so the
// film lands at about 10 minutes; 'full' keeps the written pauses (about 10:45).
//
// Compositions: WidemouthHorror (main) and WidemouthHorrorFull.
export type EditMode = 'full' | 'short';

/** Voice lines dropped from the main edit: none. */
export const CUT_IN_SHORT = new Set<string>([]);

/** Scenes left out of the main edit: none. */
export const SCENES_CUT_IN_SHORT = new Set<string>([]);

/** Silent beats held for a different time in the main edit: none. */
export const SHORT_BEAT_HOLD: Record<string, number> = {};

/** Pause after a line in the main edit: dramatic holds (written as 0.8 s or more) stay up to
 *  0.75 s - the counts need to land; every other gap runs at 60 %. */
export const shortPause = (_id: string, pause: number) => (pause >= 0.8 ? Math.min(pause, 0.75) : pause * 0.6);

/** Silence after a scene's last step in the main edit: as written. */
export const shortTail = (tail: number) => tail;
