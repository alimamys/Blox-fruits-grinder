// Scene id (src/data/timeline.ts) -> component.
import type React from 'react';
import {Box} from './Box';
import {End} from './End';
import {FourAm} from './FourAm';
import {House} from './House';
import {Nights} from './Nights';
import {Trail} from './Trail';
import {Trampoline} from './Trampoline';
import {UnderBed} from './UnderBed';
import {Wave} from './Wave';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	wave: Wave,
	house: House,
	underBed: UnderBed,
	trampoline: Trampoline,
	box: Box,
	nights: Nights,
	trail: Trail,
	fourAm: FourAm,
	end: End,
};
