// Simple flat mannequins for the LAYOUT GUIDES. They only say who stands where, how big,
// which way they face and roughly what they do; the generated frame draws the real people
// from their character sheets. Colours follow the sheets so the model can tell them apart.
import React from 'react';

export type Who = 'eli' | 'eliAdult' | 'mom' | 'dad' | 'leo';
type Facing = 'front' | 'back' | 'left' | 'right';
export type Pose = 'stand' | 'holdChild' | 'fingerLips' | 'coverMouth' | 'handOnWall' | 'carryBox' | 'reach';

const PAL: Record<Who, {hair: string; skin: string; top: string; bottom: string; long?: boolean; bald?: boolean}> = {
	eli: {hair: '#8a6a40', skin: '#efcfb4', top: '#7f9cc0', bottom: '#7f9cc0'},
	eliAdult: {hair: '#7a5a34', skin: '#e9c4a4', top: '#2f4a32', bottom: '#1f2b3d'},
	mom: {hair: '#9a4a24', skin: '#efcfb4', top: '#e4d8bf', bottom: '#3b5a86', long: true},
	dad: {hair: '#3a2a1c', skin: '#e2b896', top: '#22314f', bottom: '#3b5a86'},
	leo: {hair: '#8a6a40', skin: '#f0d2b8', top: '#e6dcbc', bottom: '#e6dcbc'},
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

/**
 * Mr. Widemouth's mannequin: cat-sized, a huge round head on a small furry body, two big black
 * eyes, crooked ears (the left one bent), and the mouth line from ear to ear.
 * (x, y) = between the feet, h = total height in pixels. `mouth`: 'smile' | 'grin' | 'snarl'.
 * `peek`: only the head, cut off at the bottom (peeking from under the bed).
 */
export const WideFig: React.FC<{x: number; y: number; h: number; facing?: 'front' | 'left' | 'right' | 'back'; mouth?: 'smile' | 'grin' | 'snarl'; peek?: boolean; arm?: 'wave' | 'tug' | 'none'; opacity?: number}> = ({
	x,
	y,
	h,
	facing = 'front',
	mouth = 'smile',
	peek = false,
	arm = 'none',
	opacity = 1,
}) => {
	const u = h / 100;
	const fur = '#8e8c88';
	const headR = 30 * u;
	const hy = y - 64 * u;
	const side = facing === 'left' || facing === 'right';
	const dir = facing === 'left' ? -1 : 1;
	const ex = side ? dir * 10 * u : 0;
	return (
		<g opacity={opacity}>
			{peek ? null : (
				<>
					<ellipse cx={x} cy={y - 22 * u} rx={15 * u} ry={20 * u} fill={fur} />
					<rect x={x - 10 * u} y={y - 10 * u} width={7 * u} height={10 * u} rx={3 * u} fill={fur} />
					<rect x={x + 3 * u} y={y - 10 * u} width={7 * u} height={10 * u} rx={3 * u} fill={fur} />
					{arm === 'wave' ? (
						<path d={`M${x + 13 * u},${y - 32 * u} L${x + 26 * u},${y - 52 * u}`} stroke={fur} strokeWidth={6 * u} strokeLinecap="round" />
					) : arm === 'tug' ? (
						<path d={`M${x + dir * 13 * u},${y - 30 * u} L${x + dir * 30 * u},${y - 34 * u}`} stroke={fur} strokeWidth={6 * u} strokeLinecap="round" />
					) : (
						<>
							<path d={`M${x - 13 * u},${y - 32 * u} L${x - 17 * u},${y - 14 * u}`} stroke={fur} strokeWidth={6 * u} strokeLinecap="round" />
							<path d={`M${x + 13 * u},${y - 32 * u} L${x + 17 * u},${y - 14 * u}`} stroke={fur} strokeWidth={6 * u} strokeLinecap="round" />
						</>
					)}
				</>
			)}
			{/* ears: right one up, left one bent over */}
			<path d={`M${x + 16 * u},${hy - 20 * u} L${x + 26 * u},${hy - 46 * u} L${x + 28 * u},${hy - 14 * u} Z`} fill={fur} />
			<path d={`M${x - 16 * u},${hy - 20 * u} L${x - 22 * u},${hy - 40 * u} L${x - 38 * u},${hy - 30 * u} L${x - 28 * u},${hy - 14 * u} Z`} fill={fur} />
			<circle cx={x} cy={hy} r={headR} fill={fur} />
			{facing === 'back' ? null : (
				<>
					<circle cx={x + ex - (side ? 0 : 11 * u)} cy={hy - 6 * u} r={6.5 * u} fill="#050505" />
					{side ? null : <circle cx={x + 11 * u} cy={hy - 6 * u} r={6.5 * u} fill="#050505" />}
					{mouth === 'smile' ? (
						<path d={`M${x - 24 * u + ex},${hy + 8 * u} Q${x + ex},${hy + 18 * u} ${x + 24 * u + ex},${hy + 8 * u}`} stroke="#2a2522" strokeWidth={1.6 * u} fill="none" />
					) : (
						<path d={`M${x - 25 * u + ex},${hy + 6 * u} Q${x + ex},${hy + (mouth === 'grin' ? 30 : 22) * u} ${x + 25 * u + ex},${hy + 6 * u} Q${x + ex},${hy + 12 * u} ${x - 25 * u + ex},${hy + 6 * u} Z`} fill="#1c1210" stroke="#efe8d8" strokeWidth={1.2 * u} />
					)}
				</>
			)}
		</g>
	);
};
