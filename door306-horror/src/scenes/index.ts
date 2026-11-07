// Scene id (src/data/timeline.ts) -> component. Scenes without a component yet render black.
import type React from 'react';
import {Doors} from './Doors';
import {NewApartment} from './NewApartment';
import {Black} from './common';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	doors: Doors,
	newApartment: NewApartment,
	end: Black,
};
