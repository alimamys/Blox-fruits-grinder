// Scene id (src/data/timeline.ts) -> component.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Call} from './Call';
import {Dawn} from './Dawn';
import {Drive} from './Drive';
import {Ending} from './Ending';
import {Feet} from './Feet';
import {Hall} from './Hall';
import {Majlis} from './Majlis';
import {Outside} from './Outside';

const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	majlis: Majlis,
	call: Call,
	drive: Drive,
	hall: Hall,
	feet: Feet,
	dawn: Dawn,
	outside: Outside,
	ending: Ending,
	end: Black,
};
