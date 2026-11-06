// LAYOUT GUIDE: Mara's apartment hallway, seen from the living-room end in one-point
// perspective. Mara's animation shows exactly this composition, so the canvas and the
// real hallway match-cut.
//   - old beige carpet runner with one brown stain (or the stain repeated in a perfect
//     pattern once the hallway starts copying the animation)
//   - white walls with faint wallpaper texture, one dome ceiling light, a brown water
//     stain on the ceiling beside it
//   - a hairline crack above the frame of the closed bedroom door at the far end
//   - front door on the left wall near the camera, storage-closet door on the right wall
import React from 'react';
import {TallFigure, WhiteFigure} from './Figure';

export type HallLight = 'night' | 'lit' | 'dim' | 'flash' | 'white' | 'black';

// screen geometry of the box (1920x1080)
const NEAR = {l: -60, r: 1980, t: -40, b: 1120};
const FAR = {l: 812, r: 1108, t: 318, b: 708};
const Z = (NEAR.r - NEAR.l) / (FAR.r - FAR.l); // depth ratio

/** screen interpolation for depth t (0 near .. 1 far), perspective-correct */
const k = (t: number) => (1 - 1 / (1 + t * (Z - 1))) / (1 - 1 / Z);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** A point on a surface. side: 'L' | 'R' wall (v = height 0..1), 'F' floor / 'C' ceiling (v = -1..1 across) */
export const hp = (side: 'L' | 'R' | 'F' | 'C', t: number, v: number): [number, number] => {
	const u = k(t);
	const l = lerp(NEAR.l, FAR.l, u);
	const r = lerp(NEAR.r, FAR.r, u);
	const top = lerp(NEAR.t, FAR.t, u);
	const bot = lerp(NEAR.b, FAR.b, u);
	if (side === 'L') return [l, lerp(bot, top, v)];
	if (side === 'R') return [r, lerp(bot, top, v)];
	const x = lerp(l, r, (v + 1) / 2);
	return [x, side === 'F' ? bot : top];
};

/** height in px of the room (floor to ceiling) at depth t */
export const roomH = (t: number) => {
	const u = k(t);
	return lerp(NEAR.b, FAR.b, u) - lerp(NEAR.t, FAR.t, u);
};

const poly = (pts: Array<[number, number]>) => pts.map((p) => p.join(',')).join(' ');

const PAL: Record<HallLight, {wall: string; wallFar: string; floor: string; ceil: string; carpet: string; door: string; fog: string}> = {
	night: {wall: '#2b3346', wallFar: '#1a2030', floor: '#20232c', ceil: '#141a26', carpet: '#5a4c3c', door: '#3a3f4d', fog: 'rgba(8,12,24,0.35)'},
	dim: {wall: '#3a3b44', wallFar: '#25262e', floor: '#2a2a30', ceil: '#1d1f26', carpet: '#6a5a46', door: '#4a4a52', fog: 'rgba(10,10,18,0.25)'},
	lit: {wall: '#cfc6b2', wallFar: '#a89f8b', floor: '#8f8574', ceil: '#bdb4a0', carpet: '#a08a6a', door: '#d8d1c1', fog: 'rgba(0,0,0,0)'},
	flash: {wall: '#2a3040', wallFar: '#161a26', floor: '#1d2029', ceil: '#121722', carpet: '#4f4436', door: '#343946', fog: 'rgba(5,8,16,0.4)'},
	white: {wall: '#ecebe6', wallFar: '#e4e3de', floor: '#e6e5e0', ceil: '#efeee9', carpet: '#e2e0da', door: '#eeede8', fog: 'rgba(0,0,0,0)'},
	black: {wall: '#0b0d12', wallFar: '#06070a', floor: '#08090c', ceil: '#050608', carpet: '#121212', door: '#0d0f14', fog: 'rgba(0,0,0,0.6)'},
};

export interface HallProps {
	light?: HallLight;
	/** ceiling bulb on (warm glow) */
	bulb?: number;
	/** stains repeated in a perfect pattern down the carpet */
	pattern?: boolean;
	/** the crack above the bedroom door is a crisp black pencil line */
	pencilCrack?: boolean;
	/** a red line across the right wall (0..1 drawn) */
	redLine?: number;
	/** the tall man standing in the hall at depth t (0 near .. 1 at the bedroom door) */
	man?: number | null;
	/** the man painted white (only faint outline) */
	manWhite?: boolean;
	/** a flashlight cone hitting the scene at (x, y) */
	flash?: [number, number] | null;
	/** the white version: no shadows, no textures */
	flat?: boolean;
	/** the front door has become a smooth white rectangle */
	noDoor?: boolean;
	/** a shadow cast behind the man (for the zoomed screenshot) with a pale shape where it ends */
	shadowShape?: boolean;
}

export const Hallway: React.FC<HallProps> = ({
	light = 'night',
	bulb = 0,
	pattern = false,
	pencilCrack = false,
	redLine = 0,
	man = null,
	manWhite = false,
	flash = null,
	flat = false,
	noDoor = false,
	shadowShape = false,
}) => {
	const c = PAL[light];
	const white = light === 'white';
	const C0 = hp('C', 0, -1);
	const C1 = hp('C', 0, 1);
	const F0 = hp('F', 0, -1);
	const F1 = hp('F', 0, 1);
	const fc0 = hp('C', 1, -1);
	const fc1 = hp('C', 1, 1);
	const ff0 = hp('F', 1, -1);
	const ff1 = hp('F', 1, 1);
	const door = {l: 884, r: 1036, t: 392, b: 708};
	const runner = (t: number, side: -1 | 1) => hp('F', t, side * 0.42);
	const stains = pattern ? [0.12, 0.3, 0.48, 0.66, 0.84] : [0.55];
	const lightPos = hp('C', 0.42, 0);
	const stainPos = hp('C', 0.5, 0.35);
	// front door on the left wall (near), closet door on the right wall (middle)
	const fd = [hp('L', 0.12, 0), hp('L', 0.3, 0), hp('L', 0.3, 0.8), hp('L', 0.12, 0.8)];
	const cd = [hp('R', 0.45, 0), hp('R', 0.6, 0), hp('R', 0.6, 0.8), hp('R', 0.45, 0.8)];
	return (
		<g>
			{/* ceiling, walls, floor */}
			<polygon points={poly([C0, C1, fc1, fc0])} fill={c.ceil} />
			<polygon points={poly([C0, fc0, ff0, F0])} fill={c.wall} />
			<polygon points={poly([C1, fc1, ff1, F1])} fill={c.wall} opacity={0.92} />
			<polygon points={poly([F0, F1, ff1, ff0])} fill={c.floor} />
			<rect x={FAR.l} y={FAR.t} width={FAR.r - FAR.l} height={FAR.b - FAR.t} fill={c.wallFar} />
			{/* skirting boards */}
			{!flat ? (
				<>
					<polygon points={poly([hp('L', 0, 0), hp('L', 1, 0), hp('L', 1, 0.04), hp('L', 0, 0.04)])} fill="rgba(0,0,0,0.18)" />
					<polygon points={poly([hp('R', 0, 0), hp('R', 1, 0), hp('R', 1, 0.04), hp('R', 0, 0.04)])} fill="rgba(0,0,0,0.18)" />
				</>
			) : null}
			{/* faint wallpaper stripes */}
			{!flat && !white
				? [0.08, 0.2, 0.34, 0.5, 0.68, 0.86].map((t) => (
						<g key={t} opacity={0.12}>
							<line x1={hp('L', t, 0)[0]} y1={hp('L', t, 0.04)[1]} x2={hp('L', t, 1)[0]} y2={hp('L', t, 1)[1]} stroke="#000" strokeWidth={2} />
							<line x1={hp('R', t, 0)[0]} y1={hp('R', t, 0.04)[1]} x2={hp('R', t, 1)[0]} y2={hp('R', t, 1)[1]} stroke="#000" strokeWidth={2} />
						</g>
					))
				: null}
			{/* carpet runner */}
			<polygon points={poly([runner(0, -1), runner(0, 1), runner(0.98, 1), runner(0.98, -1)])} fill={c.carpet} opacity={white ? 0.5 : 1} />
			{!flat
				? stains.map((t, i) => {
						const [x, y] = hp('F', t, 0.08);
						const s = 1 / (1 + t * (Z - 1)) ** 0.85;
						return <ellipse key={i} cx={x} cy={y} rx={90 * s + 6} ry={26 * s + 2} fill="#4a3424" opacity={0.75} />;
					})
				: null}
			{/* front door (left wall) */}
			<polygon points={poly(fd as Array<[number, number]>)} fill={noDoor ? c.wall : c.door} stroke={noDoor ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.5)'} strokeWidth={3} />
			{!noDoor ? <circle cx={hp('L', 0.27, 0.42)[0]} cy={hp('L', 0.27, 0.42)[1]} r={9} fill="#b9a36a" /> : null}
			{/* closet door (right wall) */}
			<polygon points={poly(cd as Array<[number, number]>)} fill={c.door} stroke="rgba(0,0,0,0.45)" strokeWidth={3} />
			<circle cx={hp('R', 0.47, 0.42)[0]} cy={hp('R', 0.47, 0.42)[1]} r={6} fill="#b9a36a" />
			{/* bedroom door at the far end */}
			<rect x={door.l - 10} y={door.t - 10} width={door.r - door.l + 20} height={door.b - door.t + 10} fill="rgba(0,0,0,0.25)" />
			<rect x={door.l} y={door.t} width={door.r - door.l} height={door.b - door.t} fill={c.door} stroke="rgba(0,0,0,0.6)" strokeWidth={3} />
			<rect x={door.l + 20} y={door.t + 26} width={door.r - door.l - 40} height={120} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
			<rect x={door.l + 20} y={door.t + 170} width={door.r - door.l - 40} height={120} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
			<circle cx={door.r - 22} cy={door.t + 168} r={6} fill="#b9a36a" />
			{/* crack above the doorframe */}
			{!flat ? (
				pencilCrack ? (
					<path d={`M${door.l + 30},${door.t - 24} L${door.l + 70},${door.t - 30} L${door.l + 112},${door.t - 22} L${door.r - 18},${door.t - 34}`} stroke="#050505" strokeWidth={4.5} fill="none" strokeLinecap="round" />
				) : (
					<path d={`M${door.l + 40},${door.t - 20} l12,-6 l9,4 l14,-9 l8,3`} stroke="rgba(30,25,20,0.8)" strokeWidth={2} fill="none" />
				)
			) : null}
			{/* ceiling light + stain */}
			{!flat ? <ellipse cx={stainPos[0] + 40} cy={stainPos[1] + 26} rx={46} ry={14} fill="#6e5236" opacity={0.55} /> : null}
			<ellipse cx={lightPos[0]} cy={lightPos[1] + 28} rx={56} ry={20} fill={bulb > 0 ? '#fff1c9' : white ? '#f2f1ec' : '#cfd3da'} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
			{bulb > 0 ? <ellipse cx={lightPos[0]} cy={lightPos[1] + 120} rx={520} ry={360} fill="#ffcf7a" opacity={0.16 * bulb} /> : null}
			{/* red line across the right wall */}
			{redLine > 0 ? (
				<line x1={hp('R', 0.25, 0.55)[0]} y1={hp('R', 0.25, 0.55)[1]} x2={lerp(hp('R', 0.25, 0.55)[0], hp('R', 0.75, 0.55)[0], redLine)} y2={lerp(hp('R', 0.25, 0.55)[1], hp('R', 0.75, 0.55)[1], redLine)} stroke="#d0141c" strokeWidth={9} strokeLinecap="round" />
			) : null}
			{/* the man */}
			{man !== null ? (
				(() => {
					const [x, y] = hp('F', man, 0.02);
					const h = roomH(man) * 0.93;
					if (shadowShape) {
						const [wx, wy] = hp('R', Math.min(1, man + 0.08), 0);
						return (
							<g>
								<path d={`M${x + 30},${y} L${wx},${wy - 40} L${wx},${wy - h * 0.82} L${x + 40},${y - h * 0.6} Z`} fill="rgba(0,0,0,0.35)" />
								<WhiteFigure x={wx - 12} y={wy} h={h * 0.9} strength={0.35} />
								<TallFigure x={x} y={y} h={h} color="#141418" />
							</g>
						);
					}
					return manWhite ? <WhiteFigure x={x} y={y} h={h} strength={white ? 0.25 : 0.4} /> : <TallFigure x={x} y={y} h={h} />;
				})()
			) : null}
			{/* atmosphere */}
			<rect x={0} y={0} width={1920} height={1080} fill={c.fog} />
			{flash ? (
				<>
					<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.45)" />
					<ellipse cx={flash[0]} cy={flash[1]} rx={330} ry={250} fill="#f4f2ea" opacity={0.42} />
					<ellipse cx={flash[0]} cy={flash[1]} rx={170} ry={130} fill="#ffffff" opacity={0.35} />
				</>
			) : null}
		</g>
	);
};

/** The hallway seen from Mara's desk, through the dark doorway of the workroom. */
export const HallThroughDoor: React.FC<HallProps & {wall?: string}> = ({wall = '#0e121b', ...p}) => (
	<g>
		<g transform="translate(560 250) scale(0.42)">
			<Hallway {...p} />
		</g>
		{/* workroom wall around the doorway */}
		<path d="M0,0 H1920 V1080 H0 Z M560,250 V704 H1366 V250 Z" fill={wall} fillRule="evenodd" />
		<rect x={540} y={232} width={846} height={474} fill="none" stroke="#2a2f3a" strokeWidth={22} />
	</g>
);
