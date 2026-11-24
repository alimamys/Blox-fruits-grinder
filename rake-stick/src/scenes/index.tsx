// Scene id (src/data/timeline.ts) -> component.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Breakfast} from './Breakfast';
import {DadReads} from './DadReads';
import {Diary} from './Diary';
import {FirstNight} from './FirstNight';
import {LastNight} from './LastNight';
import {Letter} from './Letter';
import {Pages} from './Pages';
import {ThirdNight} from './ThirdNight';
import {Today} from './Today';

const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	firstNight: FirstNight,
	breakfast: Breakfast,
	diary: Diary,
	dadReads: DadReads,
	thirdNight: ThirdNight,
	pages: Pages,
	today: Today,
	lastNight: LastNight,
	letter: Letter,
	end: Black,
};
