// "3:06" helpers: the peephole, the residents' places in the hallway, doors, flicker, Sarah on the floor.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Boy, Harris, Mother, OldMan, RobeMan, RobeWoman, Sarah, Shawl, TShirt} from '../components/characters/Cast';
import {Person, QAShape} from './goat';
import {GEO, INK, perspS, perspX, type Shot} from './kit';
import type {Spec} from './places';

/** The peephole: everything outside a round lens is black; a faint glass ring and a cold vignette inside. */
export const Peephole: React.FC<{r?: number}> = ({r = 505}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${r - 70}px, rgba(0,0,0,0.55) ${r - 12}px, #000 ${r}px)`}} />
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
			<circle cx={960} cy={540} r={r - 4} fill="none" stroke="#3a4048" strokeWidth={6} opacity={0.6} />
			<path d={`M${960 - r * 0.55},${540 - r * 0.6} A${r * 0.85},${r * 0.85} 0 0 1 ${960 + r * 0.3},${540 - r * 0.78}`} fill="none" stroke="#fff" strokeOpacity={0.07} strokeWidth={22} />
		</svg>
	</AbsoluteFill>
);
export const peepOverlay = (s: Shot) => (s.tag === 'peep' ? <Peephole /> : null);

/** Lights flickering: a dark overlay that stutters (k 0..1 strength). */
export const Flicker: React.FC<{f: number; k: number}> = ({f, k}) => {
	if (k <= 0) return null;
	const on = [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1][Math.floor(f / 2) % 16];
	return <rect x={-200} y={-200} width={2320} height={1480} fill="#05060a" opacity={(on ? 0.05 : 0.78) * k} />;
};

// ---- the residents' places in the perspective hallway (feet y, side k): nobody hides anybody
type Res = {name: string; is: React.FC<Record<string, unknown>>; y: number; k: number; child?: boolean};
export const RES: Res[] = [
	{name: 'robeman', is: RobeMan as never, y: 680, k: -0.35},
	{name: 'oldman', is: OldMan as never, y: 700, k: 0.65},
	{name: 'robewoman', is: RobeWoman as never, y: 700, k: -0.65},
	{name: 'mother', is: Mother as never, y: 720, k: 0.25},
	{name: 'boy', is: Boy as never, y: 732, k: 0.35, child: true},
	{name: 'tshirt', is: TShirt as never, y: 740, k: -0.75},
	{name: 'harris', is: Harris as never, y: 800, k: 0.65},
	{name: 'shawl', is: Shawl as never, y: 860, k: -0.65},
];
/** the residents in the peephole view: facing the stairs (backs to us) or turned to face Sarah's door */
export const residentsPersp = (frame: number, facing: 'stairs' | 'door', over: Record<string, Record<string, unknown>> = {}, omit: string[] = []): Spec[] =>
	RES.filter((r) => !omit.includes(r.name)).map((r) => {
		const s = perspS(r.y) * (r.child ? 1.02 : 1);
		const o: Record<string, unknown> = {
			frame,
			back: facing === 'stairs',
			look: [0, 0.1],
			mouth: 'flat',
			eyes: 'dot',
			...(r.name === 'mother' ? {arms: 'hug', overlapOk: true} : {}),
			...(r.name === 'boy' ? {overlapOk: true} : {}),
			...(r.name === 'oldman' ? {shiver: 1.4, lean: -6} : {}),
		};
		return {is: r.is, name: r.name, x: perspX(r.y, r.k), y: r.y, s, ...o, ...(over[r.name] ?? {})} as Spec;
	});

/** A door in the side hallway (rect) swung open into the flat: dark gap + the door panel edge-on. */
export const HallDoor: React.FC<{r: readonly [number, number, number, number]; open: number; dark?: string}> = ({r, open, dark = '#0a0b10'}) => {
	if (open <= 0.01) return null;
	const [x0, y0, x1, y1] = r;
	const w = (x1 - x0) * open;
	return (
		<g>
			<rect x={x0 + 6} y={y0 + 6} width={x1 - x0 - 12} height={y1 - y0 - 8} fill={dark} />
			<path d={`M${x0 + 6},${y0 + 6} L${x0 + 6 + w * 0.22},${y0 + 22} L${x0 + 6 + w * 0.22},${y1 - 14} L${x0 + 6},${y1 - 2} Z`} fill="#6e4a30" stroke={INK} strokeWidth={4} />
		</g>
	);
};

/** Sarah lying on the floor, head toward `dir` (-1 = left), being pulled by the ankle the other way.
 *  The standing figure is turned 90 degrees around the middle of its body; her back rests on y. */
export const SarahDown: React.FC<{x: number; y: number; s?: number; frame: number; dir?: 1 | -1; reach?: boolean; face?: Record<string, unknown>; qa?: boolean}> = ({x, y, s = 1.6, frame, dir = -1, reach = true, face = {}, qa = true}) => {
	const half = 154; // (262 + 45) / 2, body units
	const cy = y - 48 * s;
	return (
		<g>
			{qa ? <QAShape name="sarah (lying)" x0={x - half * s} y0={cy - 52 * s} x1={x + half * s} y1={cy + 52 * s} small overlapOk /> : null}
			<g transform={`translate(${x} ${cy}) rotate(${dir * 90}) translate(0 ${half * s})`}>
				<Person is={Sarah} name="sarah" x={0} y={0} s={s} frame={frame} arms={reach ? 'armsUp' : 'down'} eyes="wide" brows="worried" mouth="scream" noqa {...face} />
			</g>
		</g>
	);
};
export {GEO};

// ---- the conversation through the door gap (scenes 4 and 5)
export const GAP_SARAH_X = 1392;
export const GAP_HARRIS_X = 1080;
/** inside the flat: Sarah at her door, the door open an inch on the chain (gap 0..1) */
export const SarahAtGap: React.FC<{f: number; gap: number; p?: Record<string, unknown>; x?: number}> = ({f, gap, p = {}, x = GAP_SARAH_X}) => {
	const F = GEO.flat;
	return (
		<g>
			{gap > 0 ? (
				<g>
					<rect x={F.door[0] + 6} y={F.door[1] + 6} width={30 * gap} height={F.door[3] - F.door[1] - 12} fill="#d9e2a0" opacity={0.75} />
					<path d={`M${F.door[0] + 4},${490} q${16 * gap},12 ${30 * gap},0`} fill="none" stroke="#c9c9c9" strokeWidth={4} />
				</g>
			) : null}
			<Person is={Sarah} name="sarah" x={x} y={F.floor} s={1.6} frame={f} turn={0.6} look={[1, -0.1]} eyes="wide" brows="worried" mouth="flat" arms={{l: [8, 4], r: [24, -14]}} {...p} />
		</g>
	);
};
/** in the hallway: Mr. Harris at Sarah's door (her eye and the chain in the inch-wide gap) */
export const HarrisAtGap: React.FC<{f: number; gap: number; p?: Record<string, unknown>; x?: number}> = ({f, gap, p = {}, x = GAP_HARRIS_X}) => {
	const d = GEO.hall.doors[1];
	return (
		<g>
			{gap > 0 ? (
				<g>
					<rect x={d[0] + 8} y={d[1] + 8} width={30 * gap} height={d[3] - d[1] - 16} fill="#0b0d14" />
					<path d={`M${d[0] + 8},${560} q${15 * gap},12 ${30 * gap},0`} fill="none" stroke="#c9c9c9" strokeWidth={4} />
					<circle cx={d[0] + 24} cy={505} r={5} fill="#fff" opacity={0.85 * gap} />
					<circle cx={d[0] + 25} cy={505} r={2.6} fill="#111" opacity={gap} />
				</g>
			) : null}
			<Person is={Harris} name="harris" x={x} y={GEO.hall.floor + 25} s={1.6} frame={f} shiver={1.0} turn={-0.25} look={[-1, 0]} eyes="wide" brows="worried" mouth="frown" pale={0.25} {...p} />
		</g>
	);
};
