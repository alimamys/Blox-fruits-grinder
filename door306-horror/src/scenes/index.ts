// Scene id (src/data/timeline.ts) -> component.
import type React from 'react';
import {End, LastSelection, Recording} from './Closet';
import {Closer} from './Closer';
import {ColdOpen} from './ColdOpen';
import {Erase} from './Erase';
import {HallwayScene} from './HallwayScene';
import {InsideWall} from './InsideWall';
import {NormalNight} from './NormalNight';
import {Stranger} from './Stranger';
import {Warning} from './Warning';
import {WhiteOnWhite} from './WhiteOnWhite';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	coldOpen: ColdOpen,
	normalNight: NormalNight,
	stranger: Stranger,
	closer: Closer,
	warning: Warning,
	hallway: HallwayScene,
	erase: Erase,
	whiteOnWhite: WhiteOnWhite,
	insideWall: InsideWall,
	recording: Recording,
	lastSelection: LastSelection,
	end: End,
};
