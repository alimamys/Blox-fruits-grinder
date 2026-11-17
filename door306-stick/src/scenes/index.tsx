// Scene id (src/data/timeline.ts) -> component.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Creature} from './Creature';
import {Doors} from './Doors';
import {Footsteps} from './Footsteps';
import {Neighbors} from './Neighbors';
import {NewApartment} from './NewApartment';
import {NextTenant} from './NextTenant';
import {Offering} from './Offering';
import {Realization} from './Realization';
import {Rule} from './Rule';
import {Staircase} from './Staircase';

const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	doors: Doors,
	newApartment: NewApartment,
	footsteps: Footsteps,
	neighbors: Neighbors,
	rule: Rule,
	creature: Creature,
	realization: Realization,
	offering: Offering,
	staircase: Staircase,
	nextTenant: NextTenant,
	end: Black,
};
