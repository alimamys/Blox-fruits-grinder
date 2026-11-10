// Simple flat mannequins for the LAYOUT GUIDES. They only say who stands where, how big,
// which way they face and roughly what they do; the generated frame draws the real people
// from their character sheets. Colours follow the sheets so the model can tell them apart.
import React from 'react';

export type Who =
	| 'marcus' | 'marcusAdult' | 'wyatt' | 'dez' | 'ray' | 'nia' | 'wrongNia'
	| 'tasha' | 'jada' | 'kayla' | 'andre' | 'jamal' | 'trey' | 'dawes' | 'cole' | 'figure';
type Facing = 'front' | 'back' | 'left' | 'right';
export type Pose = 'stand' | 'holdChild' | 'fingerLips' | 'coverMouth' | 'handOnWall' | 'carryBox' | 'reach';

const PAL: Record<Who, {hair: string; skin: string; top: string; bottom: string; long?: boolean; bald?: boolean}> = {
	marcus: {hair: '#141414', skin: '#6e4630', top: '#8a1f22', bottom: '#1f2b4d'},
	marcusAdult: {hair: '#141414', skin: '#6e4630', top: '#9a9a9a', bottom: '#1f2b4d'},
	wyatt: {hair: '#c8a65a', skin: '#efc9ad', top: '#6b6f3a', bottom: '#8aa0b8'},
	dez: {hair: '#141414', skin: '#5a3a28', top: '#9a9a9a', bottom: '#151515'},
	ray: {hair: '#141414', skin: '#6e4630', top: '#d9a521', bottom: '#b8a479'},
	nia: {hair: '#141414', skin: '#5f3c2a', top: '#b7a4d6', bottom: '#151515', long: true},
	wrongNia: {hair: '#141414', skin: '#6a6a66', top: '#a49cb3', bottom: '#151515', long: true},
	tasha: {hair: '#141414', skin: '#6e4630', top: '#e07a2a', bottom: '#6d8fb4'},
	jada: {hair: '#141414', skin: '#5f3c2a', top: '#e48aa0', bottom: '#2b2b2b'},
	kayla: {hair: '#121212', skin: '#c8956b', top: '#2f6b3a', bottom: '#2b2b2b', long: true},
	andre: {hair: '#141414', skin: '#5f3c2a', top: '#f0ece0', bottom: '#2b2b2b'},
	jamal: {hair: '#141414', skin: '#5a3a28', top: '#2a4b9a', bottom: '#2b2b2b'},
	trey: {hair: '#141414', skin: '#9a6a48', top: '#3a3a3e', bottom: '#2b2b2b'},
	dawes: {hair: '#7a7a72', skin: '#d9a982', top: '#6b4a2b', bottom: '#2f4a6b'},
	cole: {hair: '#5a4030', skin: '#e7bfa0', top: '#9a2020', bottom: '#2f4a6b'},
	figure: {hair: '#0d0d0f', skin: '#2a2a2e', top: '#1a1a1e', bottom: '#1a1a1e'},
};

/**
 * A standing person. (x, y) = the point between the feet, h = height in pixels.
 */
export const Person: React.FC<{who: Who; x: number; y: number; h: number; facing?: Facing; pose?: Pose; tilt?: number; opacity?: number}> = ({
	who,
	x,
	y,
	h,
	facing = 'front',
	pose = 'stand',
	tilt = 0,
	opacity = 1,
}) => {
	const p = PAL[who];
	const u = h / 100; // body units
	const headR = 6.5 * u;
	const headY = y - 93 * u;
	const shoulderY = y - 82 * u;
	const hipY = y - 47 * u;
	const side = facing === 'left' || facing === 'right';
	const w = side ? 13 * u : 22 * u;
	const dir = facing === 'left' ? -1 : 1;
	const arm = (sx: number, ex: number, ey: number) => <path d={`M${sx},${shoulderY + 2 * u} L${ex},${ey}`} stroke={p.top} strokeWidth={5 * u} strokeLinecap="round" />;
	const hand = (hx: number, hy: number) => <circle cx={hx} cy={hy} r={2.6 * u} fill={p.skin} />;
	let arms: React.ReactNode;
	if (pose === 'holdChild') {
		arms = (
			<>
				{/* the boy against her chest */}
				<ellipse cx={x + (side ? dir * 8 * u : 0)} cy={shoulderY + 14 * u} rx={9 * u} ry={14 * u} fill="#1d2a52" />
				<circle cx={x + (side ? dir * 9 * u : 0)} cy={shoulderY - 1 * u} r={5 * u} fill="#e7c49e" />
				<path d={`M${x - 8 * u},${shoulderY + 2 * u} Q${x - 10 * u},${shoulderY + 22 * u} ${x + 6 * u},${shoulderY + 24 * u}`} stroke={p.top} strokeWidth={5 * u} fill="none" strokeLinecap="round" />
			</>
		);
	} else if (pose === 'fingerLips') {
		arms = (
			<>
				{arm(x - w / 2, x - w / 2 - 1 * u, hipY)}
				{arm(x + w / 2, x + 3 * u, headY + 8 * u)}
				{hand(x + 2 * u, headY + 6 * u)}
			</>
		);
	} else if (pose === 'coverMouth') {
		arms = (
			<>
				{arm(x - w / 2, x - 2 * u, headY + 8 * u)}
				{hand(x - 1 * u, headY + 5 * u)}
				{arm(x + w / 2, x + w / 2 + 1 * u, hipY)}
			</>
		);
	} else if (pose === 'handOnWall') {
		arms = (
			<>
				{arm(x - w / 2, x - w / 2 - 14 * u, shoulderY - 4 * u)}
				{hand(x - w / 2 - 14 * u, shoulderY - 4 * u)}
				{arm(x + w / 2, x + w / 2 + 1 * u, hipY)}
			</>
		);
	} else if (pose === 'carryBox') {
		arms = (
			<>
				<rect x={x - 14 * u} y={shoulderY + 8 * u} width={28 * u} height={20 * u} fill="#b88b55" stroke="#6b4b28" strokeWidth={u} />
			</>
		);
	} else if (pose === 'reach') {
		arms = (
			<>
				{arm(x + dir * w / 2, x + dir * 34 * u, shoulderY + 2 * u)}
				{hand(x + dir * 34 * u, shoulderY + 2 * u)}
				{arm(x - dir * w / 2, x - dir * (w / 2 + 1 * u), hipY)}
			</>
		);
	} else {
		arms = (
			<>
				{arm(x - w / 2, x - w / 2 - 1 * u, hipY + 2 * u)}
				{arm(x + w / 2, x + w / 2 + 1 * u, hipY + 2 * u)}
			</>
		);
	}
	return (
		<g opacity={opacity} transform={`rotate(${tilt}, ${x}, ${y})`}>
			{/* legs */}
			<rect x={x - (side ? 4 : 8) * u} y={hipY} width={(side ? 8 : 7) * u} height={47 * u} fill={p.bottom} />
			{side ? null : <rect x={x + 1 * u} y={hipY} width={7 * u} height={47 * u} fill={p.bottom} />}
			{/* torso */}
			<rect x={x - w / 2} y={shoulderY} width={w} height={hipY - shoulderY + 4 * u} rx={4 * u} fill={p.top} />
			{arms}
			{/* head + hair */}
			<circle cx={x} cy={headY} r={headR} fill={facing === 'back' && !p.bald ? p.hair : p.skin} />
			{p.bald ? null : facing === 'back' ? null : (
				<path d={`M${x - headR},${headY} A${headR},${headR} 0 0 1 ${x + headR},${headY} L${x + headR * 0.8},${headY - headR * 0.3} Z`} fill={p.hair} />
			)}
			{p.long ? <rect x={x - headR * 1.05} y={headY} width={headR * 2.1} height={headR * 1.7} fill={p.hair} opacity={facing === 'front' ? 0.55 : 1} /> : null}
			{facing === 'front' ? (
				<>
					<circle cx={x - 2.2 * u} cy={headY - 0.5 * u} r={0.9 * u} fill="#111" />
					<circle cx={x + 2.2 * u} cy={headY - 0.5 * u} r={0.9 * u} fill="#111" />
				</>
			) : null}
			{side ? <circle cx={x + dir * 3.5 * u} cy={headY - 0.5 * u} r={0.9 * u} fill="#111" /> : null}
		</g>
	);
};

/** The creature mannequin: nearly seven feet, grey, head bent hard to one side, arms to the shins. */
export const CreatureFig: React.FC<{x: number; y: number; h: number; lean?: number; opacity?: number}> = ({x, y, h, lean = 0, opacity = 1}) => {
	const u = h / 100;
	const g = '#8d8f8a';
	return (
		<g opacity={opacity} transform={`rotate(${lean}, ${x}, ${y})`} fill={g} stroke={g}>
			<rect x={x - 5 * u} y={y - 52 * u} width={3.5 * u} height={52 * u} />
			<rect x={x + 1.5 * u} y={y - 52 * u} width={3.5 * u} height={52 * u} />
			<rect x={x - 7 * u} y={y - 86 * u} width={14 * u} height={36 * u} rx={3 * u} />
			<path d={`M${x - 7 * u},${y - 84 * u} L${x - 11 * u},${y - 12 * u}`} strokeWidth={2.6 * u} strokeLinecap="round" fill="none" />
			<path d={`M${x + 7 * u},${y - 84 * u} L${x + 11 * u},${y - 12 * u}`} strokeWidth={2.6 * u} strokeLinecap="round" fill="none" />
			<ellipse cx={x + 9 * u} cy={y - 86 * u} rx={5 * u} ry={6.5 * u} transform={`rotate(-55, ${x + 9 * u}, ${y - 86 * u})`} />
			<ellipse cx={x + 11 * u} cy={y - 84 * u} rx={1.6 * u} ry={2.6 * u} fill="#111" stroke="none" />
		</g>
	);
};
