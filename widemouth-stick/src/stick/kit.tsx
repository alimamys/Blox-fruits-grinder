// The stick-figure "Mr. Widemouth": shared kit for every scene.
//  - timing helpers on the scene's markers (lines + beats), lip sync per character
//  - Stage: one repainted background plate + the code-drawn characters, under a camera
//  - set geometry measured on the plates, light filters, and the little props
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../data/timeline';
import {envelopeAt, visemeAt, wordsOf, type Viseme} from '../data/speech';
import {LINE_BY_ID} from '../data/voiceLines';
import {useScene} from '../utils/scene';
import {boilOf, h1, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';

export const INK = '#141414';

// ---------------------------------------------------------------- maths
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
export const ramp = (t: number, a: number, b: number) => smooth(clamp01((t - a) / Math.max(1e-4, b - a)));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-4, b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0 -> 1 between a..a+inD, 1 until b, -> 0 by b+outD */
export const pulse = (t: number, a: number, b: number, inD = 0.25, outD = 0.25) => ramp(t, a, a + inD) * (1 - ramp(t, b, b + outD));
export const lerpPt = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export type Who = 'eli' | 'widemouth' | 'mom' | 'dad' | 'leo';

// ---------------------------------------------------------------- scene timing
export const useStick = () => {
	const f = useCurrentFrame();
	const api = useScene();
	const t = f / FPS;
	const ids = Object.keys(api.scene.markers);
	/** start (s, scene time) of a marker, + offset */
	const at = (id: string, off = 0) => api.at(id) / FPS + off;
	const end = (id: string, off = 0) => api.end(id) / FPS + off;
	/** time of a spoken word inside a line (first match, or a fraction of the line as a fallback) */
	const word = (id: string, w: string, fallback = 0.5) => {
		const hit = wordsOf(id).find((x) => x[0].toLowerCase().replace(/[^a-z']/g, '') === w.toLowerCase());
		return hit ? at(id) + hit[1] : lerp(at(id), end(id), fallback);
	};
	/** mouth for a character: opening 0..1 + shape, from the real voice, on twos like drawn animation */
	const talk = (who: Who): {talk: number; viseme: Viseme} => {
		const tq = (Math.floor((t * FPS) / 2) * 2) / FPS;
		for (const id of ids) {
			if (LINE_BY_ID[id]?.character !== who) continue;
			const s = at(id);
			const e = end(id);
			if (tq < s || tq >= e) continue;
			const env = envelopeAt(id, tq - s) ?? 0;
			return {talk: env > 0.12 ? Math.min(1, env * 1.25) : 0, viseme: visemeAt(id, tq - s)};
		}
		return {talk: 0, viseme: 'm'};
	};
	const speaking = (who: Who) => ids.some((id) => LINE_BY_ID[id]?.character === who && t >= at(id) && t < end(id));
	return {f, t, api, at, end, word, talk, speaking, total: api.total / FPS};
};

// ---------------------------------------------------------------- sets (measured on the repainted plates)
export type SetId =
	| 'bedroom_night'
	| 'bedroom_day'
	| 'leoroom_day'
	| 'driveway_night'
	| 'window_out_night'
	| 'farmhouse_day'
	| 'road_day'
	| 'porch_day'
	| 'woods_edge'
	| 'woods_trail'
	| 'ruins_day'
	| 'cemetery_day'
	| 'hallway'
	| 'emptyroom'
	| 'window_down'
	| 'kitchen_night'
	| 'black';

export type BedGeo = {x0: number; x1: number; pillow: [number, number]; quilt: number; edge: number; skirtTop: number; skirtBottom: number; gap: number; floor: number; front: number; quiltCols: string[]; hem: string};
export const BEDS: Record<'bedroom_night' | 'bedroom_day' | 'leoroom_day', BedGeo> = {
	bedroom_night: {x0: 228, x1: 985, pillow: [232, 405], quilt: 608, edge: 610, skirtTop: 698, skirtBottom: 866, gap: 884, floor: 818, front: 960, quiltCols: ['#3b2c4f', '#4a3156', '#2e2c47', '#3a3550'], hem: '#8a93ad'},
	bedroom_day: {x0: 182, x1: 988, pillow: [182, 424], quilt: 612, edge: 604, skirtTop: 710, skirtBottom: 888, gap: 900, floor: 840, front: 975, quiltCols: ['#92503c', '#a78660', '#6e7682', '#87503a'], hem: '#ece6d6'},
	leoroom_day: {x0: 178, x1: 990, pillow: [180, 383], quilt: 630, edge: 629, skirtTop: 728, skirtBottom: 884, gap: 895, floor: 848, front: 980, quiltCols: ['#2f6fc0', '#3a7dd0', '#2f6fc0', '#3a7dd0'], hem: '#9cc3ee'},
};
export const GEO = {
	window_out_night: {pane: [690, 524, 1236, 896] as const, sill: 892},
	driveway_night: {window: [1524, 304, 1574, 364] as const, ground: 985},
	farmhouse_day: {door: [1120, 530, 1200, 680] as const, steps: [1050, 690, 1270, 750] as const, ground: 995},
	road_day: {ground: 890},
	porch_day: {door: [230, 230, 410, 660] as const, deck: 690, steps: [[880, 750], [940, 815], [1000, 880]] as Pt[], ground: 975},
	woods_edge: {trail: [960, 560] as const, ground: 965},
	woods_trail: {ground: 948},
	ruins_day: {ground: 960},
	cemetery_day: {ground: 1010},
	hallway: {vp: [960, 552] as const, near: 1065, far: 690, door: [900, 480, 1020, 690] as const},
	emptyroom: {opening: [760, 150, 1170, 720] as const, sill: 726, floor: 810, ground: 965},
	window_down: {target: [1060, 560] as const},
	kitchen_night: {table: [280, 690, 900, 730] as const, drawer: [1320, 600, 1500, 670] as const, ground: 955, counter: 570},
};
/** hallway perspective: scale of a figure standing at floor height y (1 at the near edge) */
export const hallScale = (y: number) => clamp01((y - GEO.hallway.vp[1]) / (GEO.hallway.near - GEO.hallway.vp[1]));

// ---------------------------------------------------------------- camera
export type Shot = {t: number; set: SetId; z0: number; z1: number; f0: Pt; f1: Pt; light?: Light; shake?: number; track?: (t: number) => Pt; tag?: string};
export const shot = (t: number, set: SetId, z0: number, z1: number, f0: Pt, f1: Pt = f0, extra: Partial<Shot> = {}): Shot => ({t, set, z0, z1, f0, f1, ...extra});
export const pickShot = (shots: Shot[], t: number, total: number) => {
	let i = 0;
	for (let k = 0; k < shots.length; k++) if (t >= shots[k].t) i = k;
	const s = shots[i];
	const e = i + 1 < shots.length ? shots[i + 1].t : total;
	return {i, s, k: smooth(clamp01((t - s.t) / Math.max(0.01, e - s.t))), local: t - s.t, dur: e - s.t};
};
export const camOf = (z: number, f: Pt, t = 0, shake = 0) => {
	const hw = 960 / z;
	const hh = 540 / z;
	// a faint breathing drift so no shot is ever dead still
	let fx = f[0] + Math.sin(t * 0.7) * 3 + (shake ? h1(Math.floor(t * 24), 3) * shake : 0);
	let fy = f[1] + Math.sin(t * 0.53 + 1) * 2 + (shake ? h1(Math.floor(t * 24), 4) * shake : 0);
	fx = Math.max(hw, Math.min(1920 - hw, fx));
	fy = Math.max(hh, Math.min(1080 - hh, fy));
	return `translate(${960 - fx * z} ${540 - fy * z}) scale(${z})`;
};

// ---------------------------------------------------------------- light
export type Light = 'day' | 'night' | 'dark' | 'grey' | 'warm' | 'dawn';
/** colour matrices: [plate, characters] */
const MATS: Record<Light, [string | null, string | null]> = {
	day: [null, null],
	// plates that are already night: characters cooled and dimmed to sit in the moonlight
	night: [null, '0.8 0 0 0 0  0 0.8 0 0 0.005  0 0 0.9 0 0.03  0 0 0 1 0'],
	// a day plate turned into a dark night (empty room, hallway at night, Leo's room at night)
	dark: ['0.3 0 0 0 0  0 0.36 0 0 0.01  0 0 0.55 0 0.05  0 0 0 1 0', '0.55 0 0 0 0  0 0.6 0 0 0.01  0 0 0.78 0 0.04  0 0 0 1 0'],
	// overcast present day
	grey: ['0.9 0.06 0.04 0 0  0.05 0.9 0.05 0 0  0.04 0.06 0.92 0 0.01  0 0 0 1 0', '0.92 0.04 0.04 0 0  0.04 0.92 0.04 0 0  0.04 0.04 0.94 0 0.01  0 0 0 1 0'],
	// lamp-lit kitchen
	warm: [null, '0.95 0 0 0 0.02  0 0.86 0 0 0.01  0 0 0.7 0 0  0 0 0 1 0'],
	// grey dawn in the bedroom
	dawn: ['0.72 0 0 0 0.03  0 0.76 0 0 0.04  0 0 0.86 0 0.06  0 0 0 1 0', '0.85 0 0 0 0.01  0 0.85 0 0 0.02  0 0 0.9 0 0.03  0 0 0 1 0'],
};
export const Tint: React.FC<{light?: Light; children: React.ReactNode}> = ({light = 'day', children}) =>
	MATS[light][1] ? <g filter={`url(#ch_${light})`}>{children}</g> : <>{children}</>;

const Defs: React.FC = () => (
	<defs>
		{(Object.keys(MATS) as Light[]).map((k) => (
			<React.Fragment key={k}>
				{MATS[k][0] ? (
					<filter id={`pl_${k}`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values={MATS[k][0]!} />
					</filter>
				) : null}
				{MATS[k][1] ? (
					<filter id={`ch_${k}`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values={MATS[k][1]!} />
					</filter>
				) : null}
			</React.Fragment>
		))}
		<radialGradient id="glowWarm">
			<stop offset="0" stopColor="#ffd98a" stopOpacity={0.5} />
			<stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
		</radialGradient>
		<radialGradient id="glowCold">
			<stop offset="0" stopColor="#cfe0ff" stopOpacity={0.45} />
			<stop offset="1" stopColor="#cfe0ff" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="moonBeam" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#9fb8ff" stopOpacity={0} />
			<stop offset="0.5" stopColor="#9fb8ff" stopOpacity={0.1} />
			<stop offset="1" stopColor="#9fb8ff" stopOpacity={0.18} />
		</linearGradient>
	</defs>
);

/** camera as numbers: translate + scale (same maths as camOf) */
const camNums = (z: number, f: Pt, t = 0, shake = 0) => {
	const hw = 960 / z;
	const hh = 540 / z;
	let fx = f[0] + Math.sin(t * 0.7) * 3 + (shake ? h1(Math.floor(t * 24), 3) * shake : 0);
	let fy = f[1] + Math.sin(t * 0.53 + 1) * 2 + (shake ? h1(Math.floor(t * 24), 4) * shake : 0);
	fx = Math.max(hw, Math.min(1920 - hw, fx));
	fy = Math.max(hh, Math.min(1080 - hh, fy));
	return {tx: 960 - fx * z, ty: 540 - fy * z, z};
};

/** One shot: the plate (an <Img>, so the render waits for it to load) and the drawing on top, under one camera. */
export const Stage: React.FC<{set: SetId; z: number; f: Pt; t: number; light?: Light; shake?: number; children?: React.ReactNode; over?: React.ReactNode}> = ({set, z, f, t, light, shake = 0, children, over}) => {
	const lt: Light = light ?? (set.endsWith('_night') ? 'night' : 'day');
	const pf = MATS[lt][0];
	const c = camNums(z, f, t, shake);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<Defs />
			</svg>
			{set !== 'black' ? (
				<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${c.tx}px, ${c.ty}px) scale(${c.z})`}}>
					<Img src={staticFile(`plates/${set}.jpg`)} style={{width: 1920, height: 1080, display: 'block', filter: pf ? `url(#pl_${lt})` : undefined}} />
				</div>
			) : null}
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
				<Defs />
				<g transform={`translate(${c.tx} ${c.ty}) scale(${c.z})`}>{children}</g>
			</svg>
			{over}
		</AbsoluteFill>
	);
};

/** Draw a scene from its shot list: picks the shot, frames it, calls world(set, t, shot). */
export const Shots: React.FC<{shots: Shot[]; world: (s: Shot, local: number) => React.ReactNode; over?: (s: Shot) => React.ReactNode}> = ({shots, world, over}) => {
	const {t, total} = useStick();
	const p = pickShot(shots, t, total);
	const z = lerp(p.s.z0, p.s.z1, p.k);
	const fp = p.s.track ? p.s.track(t) : lerpPt(p.s.f0, p.s.f1, p.k);
	return (
		<Stage set={p.s.set} z={z} f={fp} t={t} light={p.s.light} shake={p.s.shake}>
			{world(p.s, p.local)}
			{over ? over(p.s) : null}
		</Stage>
	);
};

// ---------------------------------------------------------------- the bed skirt (lifted from beneath in an arch)
export const holePath = (b: BedGeo, cx: number, w: number, h: number) =>
	`M${cx - w / 2},${b.gap + 2} L${cx - w / 2},${b.skirtBottom} Q${cx},${b.skirtBottom - 2 * h} ${cx + w / 2},${b.skirtBottom} L${cx + w / 2},${b.gap + 2} Z`;
export const SkirtHole: React.FC<{b: BedGeo; cx: number; w?: number; h: number}> = ({b, cx, w = 210, h}) => (h > 0.5 ? <path d={holePath(b, cx, w, h)} fill="#06060a" /> : null);
export const SkirtHem: React.FC<{b: BedGeo; cx: number; w?: number; h: number}> = ({b, cx, w = 210, h}) => {
	if (h < 3) return null;
	const d = `M${cx - w / 2 - 8},${b.skirtBottom + 1} Q${cx},${b.skirtBottom - 2 * h} ${cx + w / 2 + 8},${b.skirtBottom + 1}`;
	return (
		<g opacity={clamp01((h - 3) / 10)}>
			<path d={d} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
			<path d={d} fill="none" stroke={b.hem} strokeWidth={6} strokeLinecap="round" />
			{[-1, 1].map((sg) => (
				<path key={sg} d={`M${cx + sg * 34},${b.skirtBottom - h * 0.92} Q${cx + sg * 30},${(b.skirtBottom - h + b.skirtTop) / 2} ${cx + sg * 22},${b.skirtTop + 6}`} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={3} />
			))}
		</g>
	);
};
/** a skirt that is pushed up (lift 0..1 times 105 px) and drops back with a swing after `drop` */
export const skirtArch = (t: number, events: Array<{up: number; down: number; h?: number}>) => {
	let h = 0;
	for (const e of events) {
		const hh = e.h ?? 105;
		h += ramp(t, e.up, e.up + 0.28) * (1 - ramp(t, e.down, e.down + 0.14)) * hh;
		const st = t - (e.down + 0.14);
		if (st > 0 && st < 2.5) h += Math.max(0, Math.sin(st * 15)) * Math.exp(-st * 3.5) * 22;
	}
	return h;
};
export const Clip: React.FC<{id: string; d: string}> = ({id, d}) => (
	<defs>
		<clipPath id={id}>
			<path d={d} />
		</clipPath>
	</defs>
);

// ---------------------------------------------------------------- blankets
export const Quilt: React.FC<{d: string; cols: string[]; id: string}> = ({d, cols, id}) => (
	<g>
		<defs>
			<pattern id={id} width={70} height={60} patternUnits="userSpaceOnUse">
				<rect width={35} height={30} fill={cols[0]} />
				<rect x={35} width={35} height={30} fill={cols[1]} />
				<rect y={30} width={35} height={30} fill={cols[2]} />
				<rect x={35} y={30} width={35} height={30} fill={cols[3]} />
				<path d="M35,0 V60 M0,30 H70" stroke="#000" strokeOpacity={0.35} strokeWidth={2} />
			</pattern>
		</defs>
		<path d={d} fill={`url(#${id})`} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
	</g>
);
/** the blanket over a child's legs when he sits up in bed (lap at `lapY`) */
export const lapBlanket = (b: BedGeo, x0: number, x1: number, lapY: number) =>
	`M${x0},${b.skirtTop} L${x0 + 2},${lapY + 22} C${x0 + 8},${lapY + 4} ${x0 + 40},${lapY - 4} ${x0 + 80},${lapY - 2} C${(x0 + x1) / 2},${lapY - 6} ${x1 - 60},${lapY + 2} ${x1},${lapY + 14} L${x1 + 4},${b.skirtTop} Z`;
/** the blanket over a lying child, up to his chin */
export const lyingBlanket = (b: BedGeo, chinX: number, x1: number, wob0 = 0) => {
	const top = b.quilt - 46 + wob0;
	return `M${chinX - 20},${b.skirtTop} L${chinX - 24},${top + 16} C${chinX - 10},${top - 6} ${chinX + 70},${top - 10} ${chinX + 160},${top - 2} C${(chinX + x1) / 2 + 60},${top + 6} ${x1 - 120},${top - 6} ${x1 - 40},${top + 8} C${x1 - 10},${top + 14} ${x1},${top + 30} ${x1 + 2},${b.skirtTop} Z`;
};

// ---------------------------------------------------------------- props
/** An open picture book, seen from above-front; `turn` 0..1 flips one page right -> left. */
export const Book: React.FC<{x: number; y: number; w?: number; turn?: number; page?: number; frame: number}> = ({x, y, w = 160, turn = 0, page = 0, frame}) => {
	const h = w * 0.62;
	const sd = 500 + boilOf(frame, 4) * 7;
	const pic = (px: number, k: number) => {
		const c = ['#e2b84a', '#5f9b62', '#d0674f', '#5a86c4'][k % 4];
		return (
			<g key={`p${px}${k}`}>
				<circle cx={px} cy={y - h * 0.62} r={w * 0.07} fill={c} />
				<path d={`M${px - w * 0.15},${y - h * 0.22} L${px},${y - h * 0.48} L${px + w * 0.15},${y - h * 0.22} Z`} fill={['#5f9b62', '#d0674f', '#5a86c4', '#e2b84a'][k % 4]} />
			</g>
		);
	};
	const sx = Math.cos(turn * Math.PI);
	return (
		<g>
			<path d={wobPoly([[x - w / 2 - 6, y + 6], [x + w / 2 + 6, y + 6], [x + w / 2 + 6, y - h - 2], [x - w / 2 - 6, y - h - 2]], sd, 0.6)} fill="#7a3b2e" stroke={INK} strokeWidth={3.5} />
			<rect x={x - w / 2} y={y - h} width={w / 2} height={h} fill="#f3ead6" stroke={INK} strokeWidth={2.5} />
			<rect x={x} y={y - h} width={w / 2} height={h} fill="#f6efdd" stroke={INK} strokeWidth={2.5} />
			{pic(x - w / 4, page)}
			{pic(x + w / 4, page + 1)}
			{turn > 0.01 && turn < 0.99 ? (
				<g transform={`translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`}>
					<rect x={x} y={y - h} width={w / 2} height={h} fill={sx > 0 ? '#f6efdd' : '#efe4cc'} stroke={INK} strokeWidth={2.5} />
				</g>
			) : null}
		</g>
	);
};

/** A small cardboard box; `open` 0..1 opens the flaps; `knives` fills it with blades and handles. */
export const KnifeBox: React.FC<{x: number; y: number; s?: number; open?: number; knives?: boolean; frame: number; inside?: boolean}> = ({x, y, s = 1, open = 0, knives = true, frame, inside = false}) => {
	const sd = 610 + boilOf(frame, 4) * 7;
	const w = 120;
	const h = 82;
	const fl = open * 70;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{knives && open > 0.3
				? [-38, -16, 6, 28, 44].map((kx, i) => (
						<g key={i} transform={`rotate(${(i - 2) * 7} ${kx} ${-h})`}>
							<rect x={kx - 5} y={-h - 40 - (i % 2) * 10} width={10} height={36} rx={3} fill={i % 2 ? '#5b3a22' : '#2b2b2b'} stroke={INK} strokeWidth={2} />
							{inside ? <path d={`M${kx - 6},${-h - 4} L${kx + 6},${-h - 4} L${kx},${-h + 40} Z`} fill="#dfe4e8" stroke={INK} strokeWidth={2} /> : null}
						</g>
					))
				: null}
			<path d={wobPoly([[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]], sd, 0.7)} fill="#b5895a" stroke={INK} strokeWidth={4} />
			<path d={wobLine(-w / 2 + 6, -h * 0.45, w / 2 - 6, -h * 0.45, sd + 1, 0.4)} stroke="#000" strokeOpacity={0.15} strokeWidth={3} />
			<path d={wobPoly([[-w / 2, -h], [-w / 2 - 10 - fl * 0.2, -h - 30 - fl * 0.2], [-6, -h - 30 + fl * 0.5], [0, -h]], sd + 2, 0.6)} fill="#c69a68" stroke={INK} strokeWidth={3.5} opacity={open > 0.02 ? 1 : 0} />
			<path d={wobPoly([[w / 2, -h], [w / 2 + 10 + fl * 0.2, -h - 30 - fl * 0.2], [6, -h - 30 + fl * 0.5], [0, -h]], sd + 3, 0.6)} fill="#c69a68" stroke={INK} strokeWidth={3.5} opacity={open > 0.02 ? 1 : 0} />
			{open <= 0.02 ? <path d={wobLine(-w / 2, -h, w / 2, -h, sd + 4, 0.5)} stroke={INK} strokeWidth={4} /> : null}
		</g>
	);
};

/** The box seen from above: full of knives. */
export const KnivesTopDown: React.FC<{frame: number}> = ({frame}) => {
	const sd = 640 + boilOf(frame, 4) * 7;
	const blades: Array<[number, number, number, number]> = [
		[620, 400, 1250, 520], [700, 640, 1320, 560], [660, 520, 1280, 700], [760, 330, 1180, 420], [640, 720, 1200, 760], [820, 460, 1340, 380],
	];
	return (
		<g>
			<rect x={0} y={0} width={1920} height={1080} fill="#2a1d14" />
			<path d={wobPoly([[480, 200], [1440, 200], [1440, 900], [480, 900]], sd, 1.2)} fill="#8a6038" stroke={INK} strokeWidth={8} />
			<path d={wobPoly([[540, 260], [1380, 260], [1380, 840], [540, 840]], sd + 1, 1)} fill="#3a2716" />
			{blades.map(([x0, y0, x1, y1], i) => {
				const ang = Math.atan2(y1 - y0, x1 - x0);
				const nx = -Math.sin(ang) * 16;
				const ny = Math.cos(ang) * 16;
				const mx = lerp(x0, x1, 0.38);
				const my = lerp(y0, y1, 0.38);
				return (
					<g key={i}>
						<path d={`M${x0 + nx},${y0 + ny} L${mx + nx},${my + ny} L${mx - nx},${my - ny} L${x0 - nx},${y0 - ny} Z`} fill={i % 2 ? '#5b3a22' : '#262626'} stroke={INK} strokeWidth={4} />
						<path d={`M${mx + nx * 1.2},${my + ny * 1.2} L${x1},${y1} L${mx - nx * 1.2},${my - ny * 1.2} Z`} fill="#d9dee3" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
						<path d={`M${lerp(mx, x1, 0.15)},${lerp(my, y1, 0.15)} L${lerp(mx, x1, 0.8)},${lerp(my, y1, 0.8)}`} stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
					</g>
				);
			})}
		</g>
	);
};

/** A birthday cake with five candles. */
export const Cake: React.FC<{x: number; y: number; s?: number; frame: number; lit?: boolean}> = ({x, y, s = 1, frame, lit = true}) => {
	const sd = 700 + boilOf(frame, 4) * 7;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d={wobEllipse(0, 0, 110, 16, sd, 0.6)} fill="#e8e8ea" stroke={INK} strokeWidth={4} />
			<path d={wobPoly([[-80, -6], [80, -6], [80, -76], [-80, -76]], sd + 1, 0.6)} fill="#f2c7d6" stroke={INK} strokeWidth={4.5} />
			<path d={`M-80,-56 Q-60,-40 -40,-56 Q-20,-40 0,-56 Q20,-40 40,-56 Q60,-40 80,-56`} fill="none" stroke="#fff" strokeWidth={7} />
			{[-48, -24, 0, 24, 48].map((cx, i) => (
				<g key={i}>
					<rect x={cx - 4} y={-108} width={8} height={32} fill={['#6aa6e0', '#e0c56a', '#7cc28a', '#e07a6a', '#b38ae0'][i]} stroke={INK} strokeWidth={2} />
					{lit ? <path d={`M${cx},${-124 - (frame % 6 < 3 ? 2 : 0)} Q${cx + 6},${-114} ${cx},${-108} Q${cx - 6},${-114} ${cx},${-124 - (frame % 6 < 3 ? 2 : 0)} Z`} fill="#ffcf4a" stroke="#d07a1a" strokeWidth={1.5} /> : null}
				</g>
			))}
		</g>
	);
};

/** The imagined trampoline far below, black mat, blue padding. */
export const Trampoline: React.FC<{x: number; y: number; s?: number; opacity?: number; frame: number}> = ({x, y, s = 1, opacity = 1, frame}) => {
	const sd = 720 + boilOf(frame, 4) * 7;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
			{[-80, -30, 30, 80].map((lx) => (
				<path key={lx} d={wobLine(lx, 8, lx * 1.1, 40, sd + lx, 0.5)} stroke={INK} strokeWidth={5} />
			))}
			<path d={wobEllipse(0, 0, 110, 34, sd, 0.8)} fill="#3d7ec9" stroke={INK} strokeWidth={4} />
			<path d={wobEllipse(0, -2, 88, 24, sd + 1, 0.6)} fill="#151515" />
		</g>
	);
};

/** A kitchen drawer pulled open (front-on): the dark slot and the front panel lowered toward us. */
export const OpenDrawer: React.FC<{x0: number; y0: number; x1: number; y1: number; open: number}> = ({x0, y0, x1, y1, open}) => {
	if (open < 0.02) return null;
	const d = open * 26;
	return (
		<g>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#140d08" />
			<rect x={x0 - d * 0.4} y={y0 + d} width={x1 - x0 + d * 0.8} height={y1 - y0} fill="#9a6b45" stroke={INK} strokeWidth={4} />
			<rect x={(x0 + x1) / 2 - 18} y={y0 + d + (y1 - y0) / 2 - 4} width={36} height={8} rx={4} fill="#d8c8a0" stroke={INK} strokeWidth={2} />
			{[0.2, 0.45, 0.7].map((k) => (
				<path key={k} d={`M${lerp(x0, x1, k)},${y0 + d - 2} l18,-6`} stroke="#d9dee3" strokeWidth={5} strokeLinecap="round" />
			))}
		</g>
	);
};

/** The empty room's window sash (glass), `up` 0..1 slides it up out of the opening. */
export const Sash: React.FC<{up: number}> = ({up}) => {
	const [x0, y0, x1, y1] = GEO.emptyroom.opening;
	const h = (y1 - y0) * 0.52;
	const y = y1 - h - up * (y1 - y0 - h);
	return (
		<g>
			<defs>
				<clipPath id="sashClip">
					<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
				</clipPath>
			</defs>
			<g clipPath="url(#sashClip)">
				{/* the fixed upper sash */}
				<rect x={x0} y={y0} width={x1 - x0} height={h} fill="#bcd2e6" fillOpacity={0.25} stroke="#ecebe5" strokeWidth={16} />
				<line x1={(x0 + x1) / 2} y1={y0} x2={(x0 + x1) / 2} y2={y0 + h} stroke="#ecebe5" strokeWidth={10} />
				{/* the lower sash that moves */}
				<rect x={x0 + 4} y={y} width={x1 - x0 - 8} height={h} fill="#bcd2e6" fillOpacity={0.3} stroke="#ecebe5" strokeWidth={18} />
				<line x1={(x0 + x1) / 2} y1={y} x2={(x0 + x1) / 2} y2={y + h} stroke="#ecebe5" strokeWidth={10} />
				<path d={`M${x0 + 40},${y + h - 40} L${x0 + 140},${y + 40}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={10} />
			</g>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={INK} strokeWidth={4} />
		</g>
	);
};

/** Side view of an old moving truck, facing LEFT. The passenger window shows `inside`. ground = wheel bottoms. */
export const Truck: React.FC<{x: number; y: number; s?: number; frame: number; dist?: number; lights?: boolean; inside?: React.ReactNode; night?: boolean}> = ({x, y, s = 1, frame, dist = 0, lights = false, inside, night = false}) => {
	const sd = 800 + boilOf(frame, 4) * 7;
	const rot = (dist / 50) * (180 / Math.PI);
	const idle = dist === 0 ? Math.sin(frame * 1.7) * 0.8 : 0;
	const wheel = (wx: number, k: number) => (
		<g key={`w${k}`}>
			<path d={wobCircle(wx, -48, 48, sd + k, 0.8, 12)} fill="#1c1c1c" stroke={INK} strokeWidth={5} />
			<g transform={`rotate(${-rot} ${wx} -48)`}>
				<circle cx={wx} cy={-48} r={20} fill="#8f949a" stroke={INK} strokeWidth={3} />
				{[0, 72, 144, 216, 288].map((a) => (
					<circle key={a} cx={wx + Math.cos((a * Math.PI) / 180) * 11} cy={-48 + Math.sin((a * Math.PI) / 180) * 11} r={3} fill="#3a3a3a" />
				))}
			</g>
		</g>
	);
	const win: Pt[] = [[-300, -300], [-160, -300], [-160, -200], [-330, -200]];
	return (
		<g transform={`translate(${x} ${y + idle}) scale(${s})`}>
			<ellipse cx={60} cy={-2} rx={460} ry={16} fill="#000" opacity={0.3} />
			{/* cargo box */}
			<path d={wobPoly([[-130, -80], [500, -80], [500, -420], [-130, -420]], sd + 10, 1.2)} fill={night ? '#c9ccd2' : '#e9e6dc'} stroke={INK} strokeWidth={6} />
			<path d={wobLine(-120, -380, 490, -380, sd + 11, 0.8)} stroke="#000" strokeOpacity={0.12} strokeWidth={8} />
			<path d={wobLine(-120, -120, 490, -120, sd + 12, 0.8)} stroke="#b9472f" strokeWidth={12} />
			{/* cab */}
			<path d={wobPoly([[-140, -80], [-140, -320], [-300, -320], [-345, -205], [-430, -190], [-440, -90], [-420, -80]], sd + 13, 1)} fill="#2f5d8f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
			<defs>
				<clipPath id={`tw${sd % 7}`}>
					<path d={wobPoly(win, sd + 14, 0.5)} />
				</clipPath>
			</defs>
			<path d={wobPoly(win, sd + 14, 0.5)} fill={night ? '#0e1420' : '#b7cde0'} stroke={INK} strokeWidth={5} />
			{night ? <path d={wobPoly(win, sd + 14, 0.5)} fill="#7bd48a" opacity={0.08} /> : null}
			<g clipPath={`url(#tw${sd % 7})`}>{inside}</g>
			<path d={wobPoly(win, sd + 14, 0.5)} fill="#bcd2e6" opacity={night ? 0.12 : 0.2} />
			<path d={`M-210,-292 L-250,-206 M-185,-292 L-212,-232`} stroke="#fff" strokeOpacity={0.35} strokeWidth={7} strokeLinecap="round" />
			<path d={wobLine(-240, -190, -240, -95, sd + 15, 0.6)} stroke={INK} strokeWidth={3} opacity={0.6} />
			<rect x={-215} y={-170} width={30} height={8} rx={3} fill="#d9d9d9" stroke={INK} strokeWidth={2} />
			{/* bumper, light */}
			<path d={wobPoly([[-450, -98], [-410, -98], [-410, -72], [-450, -72]], sd + 16, 0.4)} fill="#9aa0a6" stroke={INK} strokeWidth={4} />
			<path d={wobCircle(-432, -165, 13, sd + 17, 0.5, 8)} fill={lights ? '#fff4c8' : '#d8d2b0'} stroke={INK} strokeWidth={3} />
			{lights ? <path d="M-440,-175 L-900,-260 L-900,-40 L-440,-150 Z" fill="#fff4c8" opacity={0.12} /> : null}
			{wheel(-330, 1)}
			{wheel(300, 2)}
			{wheel(410, 3)}
		</g>
	);
};

/** A small present-day hatchback, facing LEFT (adult Eli driving). */
export const Car: React.FC<{x: number; y: number; s?: number; frame: number; dist?: number; inside?: React.ReactNode}> = ({x, y, s = 1, frame, dist = 0, inside}) => {
	const sd = 860 + boilOf(frame, 4) * 7;
	const rot = (dist / 40) * (180 / Math.PI);
	const wheel = (wx: number, k: number) => (
		<g key={k}>
			<path d={wobCircle(wx, -38, 38, sd + k, 0.7, 12)} fill="#1c1c1c" stroke={INK} strokeWidth={5} />
			<g transform={`rotate(${-rot} ${wx} -38)`}>
				<circle cx={wx} cy={-38} r={16} fill="#a9aeb3" stroke={INK} strokeWidth={3} />
				<path d={`M${wx - 12},-38 H${wx + 12} M${wx},-50 V-26`} stroke="#555" strokeWidth={3} />
			</g>
		</g>
	);
	const win: Pt[] = [[-180, -150], [60, -150], [130, -230], [-120, -230]];
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<ellipse cx={0} cy={-2} rx={290} ry={13} fill="#000" opacity={0.3} />
			<path d={wobPoly([[-290, -60], [-280, -150], [-130, -250], [150, -250], [250, -150], [280, -70], [270, -50], [-280, -50]], sd + 10, 1)} fill="#8a3a32" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
			<defs>
				<clipPath id={`cw${sd % 7}`}>
					<path d={wobPoly(win, sd + 11, 0.5)} />
				</clipPath>
			</defs>
			<path d={wobPoly(win, sd + 11, 0.5)} fill="#9fb4c6" stroke={INK} strokeWidth={5} />
			<g clipPath={`url(#cw${sd % 7})`}>{inside}</g>
			<path d={wobPoly(win, sd + 11, 0.5)} fill="#dfe8f0" opacity={0.18} />
			<path d={wobLine(-30, -230, -30, -150, sd + 12, 0.5)} stroke={INK} strokeWidth={6} />
			<path d={wobCircle(-270, -110, 12, sd + 13, 0.5, 8)} fill="#f2ead0" stroke={INK} strokeWidth={3} />
			{wheel(-180, 1)}
			{wheel(170, 2)}
		</g>
	);
};

/** Big title / end card, in the hand-drawn look of the earlier films: MR. WIDEMOUTH with his eyes. */
export const TitleCardStick: React.FC<{f: number; d: number}> = ({f, d}) => {
	const o = clamp01((f - 3) / 8) * clamp01((d - f) / 10);
	const blink = f % 70 > 66;
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', opacity: o}}>
				<g transform={`translate(960 ${300 + Math.sin(f / 9) * 2})`}>
					{[-1, 1].map((sg) => (
						<g key={sg}>
							<path d={wobCircle(sg * 70, 0, blink ? 4 : 44, 900 + sg + boilOf(f, 4) * 7, 1, 10)} fill="#050505" stroke="#d8d8d8" strokeWidth={4} />
							{!blink ? <circle cx={sg * 70 + 14} cy={-14} r={11} fill="#fff" /> : null}
						</g>
					))}
					<path d={`M-190,64 C-110,150 110,150 190,64`} fill="none" stroke="#d8d8d8" strokeWidth={8} strokeLinecap="round" />
				</g>
			</svg>
			<div style={{opacity: o, marginTop: 300, textAlign: 'center', fontFamily: '"Permanent Marker", "Patrick Hand", cursive', color: '#f1ede2'}}>
				<div style={{fontSize: 150, letterSpacing: 6, textShadow: '0 6px 0 #000, 0 0 30px rgba(255,255,255,0.12)'}}>MR. WIDEMOUTH</div>
			</div>
		</AbsoluteFill>
	);
};

/** wobble line helper re-export for scenes */
export {wob, wobCircle, wobEllipse, wobLine, wobPoly};

/** walking from x0 to x1 between t0 and t1 (eased at both ends); phase for StickPerson legs */
export const walk = (t: number, t0: number, t1: number, x0: number, x1: number, s = 1) => {
	const k = clamp01((t - t0) / Math.max(1e-3, t1 - t0));
	const e = k < 0.15 ? (k * k) / 0.3 : k > 0.85 ? 1 - ((1 - k) * (1 - k)) / 0.3 : (k - 0.075) / 0.85;
	const x = lerp(x0, x1, Math.max(0, Math.min(1, e)));
	const moving = t > t0 && t < t1;
	return {x, moving, phase: Math.abs(x - x0) / (30 * s), dir: x1 >= x0 ? 1 : -1};
};
/** StickPerson props for a walk() result */
export const gait = (w: ReturnType<typeof walk>) => (w.moving ? {pose: 'walk' as const, turn: w.dir * 0.8, phase: w.phase} : {pose: 'stand' as const});
/** A plain cardboard moving box (front view), bottom-centre at x,y */
export const MovingBox: React.FC<{x: number; y: number; w?: number; h?: number; frame: number; seed?: number}> = ({x, y, w = 150, h = 110, frame, seed = 0}) => {
	const sd = 950 + seed * 13 + boilOf(frame, 4) * 7;
	return (
		<g>
			<path d={wobPoly([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], sd, 0.8)} fill="#b98c5c" stroke={INK} strokeWidth={4.5} />
			<path d={wobLine(x - 12, y - h, x - 12, y - h + 36, sd + 1, 0.4)} stroke="#e3cf9e" strokeWidth={14} />
			<path d={wobLine(x - w / 2 + 8, y - h * 0.5, x + w / 2 - 8, y - h * 0.5, sd + 2, 0.5)} stroke="#000" strokeOpacity={0.12} strokeWidth={3} />
		</g>
	);
};

export const boilOfF = (frame: number) => boilOf(frame, 4) * 7;
