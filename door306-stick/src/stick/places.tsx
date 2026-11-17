// A person to draw (any cast component + its props), and a back-to-front group renderer.
import React from 'react';
import {Person} from './goat';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spec = Record<string, any> & {is: React.FC<any>; name: string; x: number; y: number; s: number};

/** head-top position of a spec (for framing) */
export const headOf = (p: Spec): [number, number] => [p.x, p.y - ((p.pose === 'sit' ? 209 : 262) * (p.child ? 0.62 : 1) + 45) * p.s];

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
/** QA-style boxes of a group: [x0, x1, headTop] (for the framing solver) */
export const boxesOf = (people: Spec[]): Array<[number, number, number]> => people.map((p) => [p.x - 52 * p.s * (p.child ? 0.62 : 1), p.x + 52 * p.s * (p.child ? 0.62 : 1), headOf(p)[1]]);
