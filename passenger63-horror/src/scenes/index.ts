// Scene id (src/data/timeline.ts) -> component. Every major sequence is its own module.
import type React from 'react';
import {Cctv} from './Cctv';
import {Departure} from './Departure';
import {Erasure} from './Erasure';
import {End, Finale} from './Finale';
import {GrandmotherCalls, PeopleInWater} from './GrandmotherCalls';
import {Disclaimer, Hook} from './Hook';
import {Hull} from './Hull';
import {Navigation} from './Navigation';
import {OtherFerry} from './OtherFerry';
import {Police} from './Police';
import {Recognition} from './Recognition';
import {Vanish} from './Vanish';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	disclaimer: Disclaimer,
	hook: Hook,
	departure: Departure,
	recognition: Recognition,
	erasure: Erasure,
	hull: Hull,
	navigation: Navigation,
	otherFerry: OtherFerry,
	grandmotherCalls: GrandmotherCalls,
	peopleInWater: PeopleInWater,
	vanish: Vanish,
	police: Police,
	cctv: Cctv,
	finale: Finale,
	end: End,
};
