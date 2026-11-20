// Scene id (src/data/timeline.ts) -> component.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Closer} from './Closer';
import {ColdOpen} from './ColdOpen';
import {Erase} from './Erase';
import {HallwayScene} from './HallwayScene';
import {NormalNight} from './NormalNight';
import {Stranger} from './Stranger';
import {Warning} from './Warning';

const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	coldOpen: ColdOpen,
	normalNight: NormalNight,
	stranger: Stranger,
	closer: Closer,
	warning: Warning,
	hallway: HallwayScene,
	erase: Erase,
	end: Black,
};
