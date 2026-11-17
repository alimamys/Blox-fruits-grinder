// Scene id (src/data/timeline.ts) -> component.
import type React from 'react';
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
import {Black} from './common';

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
