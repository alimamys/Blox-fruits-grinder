// Where everybody stands and sits, per set, and a back-to-front group renderer.
import React from 'react';
import {Andre, Dez, Jalen, Kayla, Lucia, Malik, Marcus, Nia, Ray, Stranger, Tasha, Wyatt} from '../components/characters/Cast';
import type {Pt} from '../utils/rough';
import {GEO} from './kit';
import {Person} from './goat';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyP = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spec = AnyP & {is: React.FC<any>; name: string; x: number; y: number; s: number};

export const CAST = {marcus: Marcus, dez: Dez, ray: Ray, nia: Nia, wyatt: Wyatt, tasha: Tasha, kayla: Kayla, lucia: Lucia, jalen: Jalen, andre: Andre, malik: Malik, thing: Stranger} as unknown as Record<string, React.FC<AnyP>>;
const BIG: Record<string, number> = {dez: 1.1, ray: 0.9};

/** head-top position of a spec (for counting badges, camera framing) */
export const headOf = (p: Spec): Pt => [p.x, p.y - ((p.pose === 'sit' ? 209 : 262) + 45) * p.s];

// ---- inside the trailer: 6 on the bench, 6 standing
const T = GEO.trailer;
const SIT_S = 1.3;
const STAND_S = 1.45;
const BENCH = [640, 780, 920, 1060, 1200, 1340];
const STAND: Record<string, number> = {ray: 140, marcus: 330, wyatt: 500, dez: 1490, jalen: 1620, malik: 1790};
const ON_BENCH = ['nia', 'thing', 'kayla', 'lucia', 'tasha', 'andre'];
export const trailerSpec = (name: string, over: AnyP = {}): Spec => {
	const bi = ON_BENCH.indexOf(name);
	const s = (bi >= 0 ? SIT_S : STAND_S) * (BIG[name] ?? 1);
	if (bi >= 0) return {is: CAST[name], name, x: BENCH[bi], y: T.seat + 72 * s, s, pose: 'sit', ...over};
	return {is: CAST[name], name, x: STAND[name] ?? 960, y: 990, s, ...over};
};
export const TRAILER_ALL = ['ray', 'marcus', 'wyatt', 'nia', 'thing', 'kayla', 'lucia', 'tasha', 'andre', 'dez', 'jalen', 'malik'];

// ---- the clearing: two rows with a gap at the fire; the back row stands between the front row's heads
export const CLEAR_S = 1.28;
const BACK_S = 1.08;
const ROWS: Record<string, [number, 'front' | 'back']> = {
	marcus: [350, 'front'],
	ray: [550, 'front'],
	dez: [1110, 'front'],
	nia: [1310, 'front'],
	kayla: [1510, 'front'],
	tasha: [250, 'back'],
	jalen: [450, 'back'],
	malik: [650, 'back'],
	lucia: [1010, 'back'],
	andre: [1210, 'back'],
	wyatt: [1410, 'back'],
};
export const clearingSpec = (name: string, over: AnyP = {}): Spec => {
	const [x, row] = ROWS[name] ?? [960, 'front'];
	const s = (row === 'front' ? CLEAR_S : BACK_S) * (BIG[name] ?? 1);
	return {is: CAST[name], name, x, y: row === 'front' ? 1045 : 920, s, ...over};
};

/** draw a group back-to-front (lower y = further back = drawn first) */
export const Group: React.FC<{people: Spec[]}> = ({people}) => (
	<>
		{[...people]
			.sort((a, b) => a.y - b.y)
			.map((p) => {
				const {is, name, ...rest} = p;
				return <Person key={name} is={is} name={name} {...rest} />;
			})}
	</>
);

/** QA-style boxes of a group: [x0, x1, headTop] (same maths as Person) */
export const boxesOf = (people: Spec[]): Array<[number, number, number]> => people.map((p) => [p.x - 52 * p.s, p.x + 52 * p.s, p.y - ((p.pose === 'sit' ? 209 : 262) + 45) * p.s]);
