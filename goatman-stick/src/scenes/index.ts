// Scene id (src/data/timeline.ts) -> component.
import type React from 'react';
import {FacingAway} from './FacingAway';
import {Goatman} from './Goatman';
import {LetMeIn} from './LetMeIn';
import {Nine} from './Nine';
import {OneTooMany} from './OneTooMany';
import {Plates} from './Plates';
import {Seven} from './Seven';
import {Twelve} from './Twelve';
import {Woods} from './Woods';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	twelve: Twelve,
	woods: Woods,
	facingAway: FacingAway,
	goatman: Goatman,
	oneTooMany: OneTooMany,
	seven: Seven,
	letMeIn: LetMeIn,
	nine: Nine,
	plates: Plates,
};
