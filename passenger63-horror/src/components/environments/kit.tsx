// Shared drawing kit for the environments: calm hand-drawn lines, colour/lighting
// helpers, per-instance gradient ids and one-point-perspective primitives
// (extruded boxes, soft contact shadows, glows).
//
// Line style: every outline keeps a FIXED hand-drawn wobble (seeded, never moves)
// plus a small "boil" that re-jitters every 4 frames at ~25% of the wobble, so the
// world reads as hand-drawn but stable (the characters still boil more than the
// sets, which keeps the eye on them).
import React from 'react';
import {boilOf, h1, type Pt} from '../../utils/rough';

export type {Pt};
export const INK = '#121214';

export type Lights = 'on' | 'dim' | 'off' | 'red';

/* ------------------------------------------------------------------ ids */

/** Unique, url()-safe id per component instance (several instances of one
 *  environment can be on screen at once, e.g. reflections / picture-in-picture). */
export const useUid = (prefix: string): string => {
	const raw = React.useId();
	return prefix + raw.replace(/[^a-zA-Z0-9_-]/g, '');
};

/* ---------------------------------------------------------------- lines */

const BOIL_EVERY = 4;
const BOIL = 0.25;
const r1 = (n: number) => Math.round(n * 10) / 10;

export interface Ink {
	/** straight-edged polygon / polyline with slightly bowed edges */
	poly: (pts: Pt[], k: number, amp?: number, closed?: boolean) => string;
	rect: (x: number, y: number, w: number, h: number, k: number, amp?: number) => string;
	/** smooth curve through points */
	curve: (pts: Pt[], k: number, amp?: number, closed?: boolean) => string;
	line: (x1: number, y1: number, x2: number, y2: number, k: number, amp?: number, segs?: number) => string;
	ellipse: (cx: number, cy: number, rx: number, ry: number, k: number, amp?: number, n?: number) => string;
}

/** Line factory for one component instance. `f` = frame (null = never boils). */
export const makeInk = (f: number | null, seed: number): Ink => {
	const b = f === null ? 0 : boilOf(f, BOIL_EVERY);
	const bs = b * 37.17;
	const jit = (p: Pt, s: number, i: number, amp: number): Pt => [
		p[0] + (h1(s, i, 1) + h1(s + bs, i, 4) * BOIL) * amp,
		p[1] + (h1(s, i, 2) + h1(s + bs, i, 5) * BOIL) * amp,
	];
	const poly: Ink['poly'] = (pts, k, amp = 1.3, closed = true) => {
		const s = seed + k * 13.1;
		const j = pts.map((p, i) => jit(p, s, i, amp));
		const n = j.length;
		let d = `M${r1(j[0][0])},${r1(j[0][1])}`;
		const edges = closed ? n : n - 1;
		for (let i = 1; i <= edges; i++) {
			const a = j[i - 1];
			const c = j[i % n];
			const bow = (h1(s, i, 9) + h1(s + bs, i, 8) * BOIL) * amp * 0.8;
			const dx = c[0] - a[0];
			const dy = c[1] - a[1];
			const len = Math.hypot(dx, dy) || 1;
			d += `Q${r1((a[0] + c[0]) / 2 - (dy / len) * bow)},${r1((a[1] + c[1]) / 2 + (dx / len) * bow)} ${r1(c[0])},${r1(c[1])}`;
		}
		return closed ? d + 'Z' : d;
	};
	const curve: Ink['curve'] = (pts, k, amp = 1.3, closed = false) => {
		const s = seed + k * 13.1;
		const j = pts.map((p, i) => jit(p, s, i, amp));
		const n = j.length;
		if (n < 2) return '';
		if (!closed) {
			if (n === 2) return `M${r1(j[0][0])},${r1(j[0][1])}L${r1(j[1][0])},${r1(j[1][1])}`;
			let d = `M${r1(j[0][0])},${r1(j[0][1])}`;
			for (let i = 1; i < n - 1; i++) {
				const mx = (j[i][0] + j[i + 1][0]) / 2;
				const my = (j[i][1] + j[i + 1][1]) / 2;
				d += `Q${r1(j[i][0])},${r1(j[i][1])} ${r1(mx)},${r1(my)}`;
			}
			return d + `L${r1(j[n - 1][0])},${r1(j[n - 1][1])}`;
		}
		let d = `M${r1((j[n - 1][0] + j[0][0]) / 2)},${r1((j[n - 1][1] + j[0][1]) / 2)}`;
		for (let i = 0; i < n; i++) {
			const nx = j[(i + 1) % n];
			d += `Q${r1(j[i][0])},${r1(j[i][1])} ${r1((j[i][0] + nx[0]) / 2)},${r1((j[i][1] + nx[1]) / 2)}`;
		}
		return d + 'Z';
	};
	return {
		poly,
		curve,
		rect: (x, y, w, h, k, amp = 1.3) =>
			poly(
				[
					[x, y],
					[x + w, y],
					[x + w, y + h],
					[x, y + h],
				],
				k,
				amp,
			),
		line: (x1, y1, x2, y2, k, amp = 1.2, segs = 2) => {
			const pts: Pt[] = [];
			for (let i = 0; i <= segs; i++) pts.push([x1 + ((x2 - x1) * i) / segs, y1 + ((y2 - y1) * i) / segs]);
			return curve(pts, k, amp, false);
		},
		ellipse: (cx, cy, rx, ry, k, amp = 1.2, n = 12) => {
			const rot = h1(seed + k, 3) * 0.4;
			const pts: Pt[] = Array.from({length: n}, (_, i) => {
				const a = rot + (i / n) * Math.PI * 2;
				return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
			});
			return curve(pts, k, amp, true);
		},
	};
};

/** Plain (non-wobbly) polygon path - for overlays, gradients, clip paths. */
export const qd = (pts: Pt[]): string => 'M' + pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L') + 'Z';

/* --------------------------------------------------------------- colour */

const rgb = (c: string): [number, number, number] => {
	let h = c.replace('#', '');
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	const n = parseInt(h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hex = (r: number, g: number, b: number) =>
	`#${((1 << 24) | (Math.round(Math.max(0, Math.min(255, r))) << 16) | (Math.round(Math.max(0, Math.min(255, g))) << 8) | Math.round(Math.max(0, Math.min(255, b))))
		.toString(16)
		.slice(1)}`;

export const mix = (a: string, b: string, t: number): string => {
	const A = rgb(a);
	const B = rgb(b);
	return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
};

/** t > 0 lightens toward white, t < 0 darkens toward black. */
export const shade = (c: string, t: number): string => (t >= 0 ? mix(c, '#ffffff', t) : mix(c, '#000000', -t));

export const lum = (c: string): number => {
	const [r, g, b] = rgb(c);
	return (0.3 * r + 0.59 * g + 0.11 * b) / 255;
};

/** Re-light a colour for a lighting state (dimmed, blackout, red emergency). */
export const tone = (c: string, L: Lights): string => {
	if (L === 'on') return c;
	if (L === 'dim') return mix(c, '#0a0c13', 0.45);
	if (L === 'off') return mix(c, '#020307', 0.86);
	return mix('#140303', '#d4402f', Math.min(1, lum(c) * 0.95));
};

/** Light colour of lamps for a lighting state. */
export const lampOf = (L: Lights, warm = '#fff3cf'): string => (L === 'red' ? '#ff3a28' : L === 'off' ? '#2a2c33' : L === 'dim' ? mix(warm, '#a07a40', 0.35) : warm);

/* -------------------------------------------------------------- shading */

export interface Shades {
	/** darken toward bottom */
	dn: string;
	/** darken toward top */
	up: string;
	/** darken toward left */
	lt: string;
	/** darken toward right */
	rt: string;
	/** white highlight fading downward */
	hl: string;
	/** soft round contact shadow (radial) */
	sh: string;
	/** soft round glow in the lamp colour (radial) */
	gl: string;
	/** diagonal specular streak for glass / metal */
	sp: string;
	/** horizontal metal tube: highlight band near the top */
	tube: string;
	/** vertical metal pole: highlight band left of centre */
	pole: string;
	/** vertical light cone fading downward, in the lamp colour */
	cone: string;
}

export const shadeUrls = (id: string): Shades => ({
	dn: `url(#${id}dn)`,
	up: `url(#${id}up)`,
	lt: `url(#${id}lt)`,
	rt: `url(#${id}rt)`,
	hl: `url(#${id}hl)`,
	sh: `url(#${id}sh)`,
	gl: `url(#${id}gl)`,
	sp: `url(#${id}sp)`,
	tube: `url(#${id}tb)`,
	pole: `url(#${id}pl)`,
	cone: `url(#${id}cn)`,
});

/** One set of reusable overlay gradients (objectBoundingBox units, so one def
 *  serves every face). Render once per component instance. */
export const ShadeDefs: React.FC<{id: string; glow?: string; strength?: number}> = ({id, glow = '#fff3cf', strength = 1}) => {
	const k = strength;
	return (
		<defs>
			<linearGradient id={`${id}dn`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.5 * k} />
			</linearGradient>
			<linearGradient id={`${id}up`} x1="0" y1="1" x2="0" y2="0">
				<stop offset="0" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.5 * k} />
			</linearGradient>
			<linearGradient id={`${id}lt`} x1="1" y1="0" x2="0" y2="0">
				<stop offset="0" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.5 * k} />
			</linearGradient>
			<linearGradient id={`${id}rt`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.5 * k} />
			</linearGradient>
			<linearGradient id={`${id}hl`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#fff" stopOpacity={0.32 * k} />
				<stop offset="0.6" stopColor="#fff" stopOpacity={0} />
			</linearGradient>
			<radialGradient id={`${id}sh`}>
				<stop offset="0" stopColor="#000" stopOpacity={0.62} />
				<stop offset="0.55" stopColor="#000" stopOpacity={0.36} />
				<stop offset="1" stopColor="#000" stopOpacity={0} />
			</radialGradient>
			<radialGradient id={`${id}gl`}>
				<stop offset="0" stopColor={glow} stopOpacity={0.55} />
				<stop offset="0.4" stopColor={glow} stopOpacity={0.2} />
				<stop offset="1" stopColor={glow} stopOpacity={0} />
			</radialGradient>
			<linearGradient id={`${id}sp`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0.25" stopColor="#fff" stopOpacity={0} />
				<stop offset="0.42" stopColor="#fff" stopOpacity={0.16} />
				<stop offset="0.5" stopColor="#fff" stopOpacity={0.04} />
				<stop offset="0.58" stopColor="#fff" stopOpacity={0.12} />
				<stop offset="0.7" stopColor="#fff" stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${id}tb`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#000" stopOpacity={0.15} />
				<stop offset="0.3" stopColor="#fff" stopOpacity={0.55} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.45} />
			</linearGradient>
			<linearGradient id={`${id}pl`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor="#000" stopOpacity={0.2} />
				<stop offset="0.3" stopColor="#fff" stopOpacity={0.5} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.45} />
			</linearGradient>
			<linearGradient id={`${id}cn`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={glow} stopOpacity={0.42} />
				<stop offset="1" stopColor={glow} stopOpacity={0} />
			</linearGradient>
		</defs>
	);
};

/* ---------------------------------------------------------- perspective */

/** Point p pulled toward the vanishing point: k = 1 stays, k < 1 recedes. */
export const toward = (p: Pt, vp: Pt, k: number): Pt => [vp[0] + (p[0] - vp[0]) * k, vp[1] + (p[1] - vp[1]) * k];

export interface BoxSpec {
	/** front (nearest) face, axis aligned */
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	/** back face scale toward the vanishing point (0 < k < 1) */
	k: number;
	vp: Pt;
	fill: string;
	top?: string;
	side?: string;
	bottom?: string;
	sw?: number;
	amp?: number;
	/** optional overlay gradient on the front face (e.g. shades.dn) */
	frontShade?: string;
	/** optional overlay on the top face */
	topShade?: string;
	/** draw the front face? (false for open shelves etc.) */
	front?: boolean;
	stroke?: string;
}

/** Extruded box in one-point perspective: only the faces the camera can see
 *  are drawn (top if below eye level, side facing the vanishing point, front). */
export const Box: React.FC<{ink: Ink; k0: number; b: BoxSpec}> = ({ink, k0, b}) => {
	const {x0, y0, x1, y1, k, vp, fill, sw = 4, amp = 1, stroke = INK} = b;
	const top = b.top ?? shade(fill, 0.16);
	const side = b.side ?? shade(fill, -0.3);
	const bottom = b.bottom ?? shade(fill, -0.45);
	const P = (x: number, y: number) => toward([x, y], vp, k);
	const faces: React.ReactNode[] = [];
	if (y0 > vp[1] + 0.5) {
		const d = ink.poly([[x0, y0], [x1, y0], P(x1, y0), P(x0, y0)], k0 + 1, amp);
		faces.push(<path key="t" d={d} fill={top} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
		if (b.topShade) faces.push(<path key="ts" d={qd([[x0, y0], [x1, y0], P(x1, y0), P(x0, y0)])} fill={b.topShade} />);
	}
	if (y1 < vp[1] - 0.5) faces.push(<path key="b" d={ink.poly([[x0, y1], [x1, y1], P(x1, y1), P(x0, y1)], k0 + 2, amp)} fill={bottom} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
	if (x0 > vp[0] + 0.5) faces.push(<path key="l" d={ink.poly([[x0, y0], P(x0, y0), P(x0, y1), [x0, y1]], k0 + 3, amp)} fill={side} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
	if (x1 < vp[0] - 0.5) faces.push(<path key="r" d={ink.poly([[x1, y0], P(x1, y0), P(x1, y1), [x1, y1]], k0 + 4, amp)} fill={side} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
	if (b.front !== false) {
		faces.push(<path key="f" d={ink.rect(x0, y0, x1 - x0, y1 - y0, k0 + 5, amp)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
		if (b.frontShade) faces.push(<path key="fs" d={qd([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])} fill={b.frontShade} />);
	}
	return <g>{faces}</g>;
};

/** Soft contact shadow (cheap radial gradient, no blur filter). */
export const Shadow: React.FC<{S: Shades; cx: number; cy: number; rx: number; ry: number; o?: number}> = ({S, cx, cy, rx, ry, o = 1}) => (
	<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={S.sh} fillOpacity={o} />
);

/** Smooth seeded 0..1 noise for idle motion (no snapping). */
export const smooth = (t: number, seed: number): number =>
	0.5 + 0.25 * Math.sin(t * 1.0 + seed * 1.7) + 0.15 * Math.sin(t * 2.31 + seed * 4.1) + 0.1 * Math.sin(t * 4.07 + seed * 2.9);

/* ------------------------------------------------------------ 3D camera */

/** Simple pinhole camera for one-point perspective rooms. World: X right,
 *  H height above the floor, Z distance from the camera. Screen point =
 *  (vx + X*F/Z, vy + (eye - H)*F/Z): every receding line meets (vx, vy). */
export interface Cam3 {
	vx: number;
	vy: number;
	F: number;
	/** camera height above the floor (world units) */
	eye: number;
}

export const P3 = (c: Cam3, X: number, H: number, Z: number): Pt => [c.vx + (X * c.F) / Z, c.vy + ((c.eye - H) * c.F) / Z];

export interface Box3Spec {
	X0: number;
	X1: number;
	H0: number;
	H1: number;
	Z0: number;
	Z1: number;
	fill: string;
	top?: string;
	side?: string;
	bottom?: string;
	sw?: number;
	amp?: number;
	nearShade?: string;
	topShade?: string;
	sideShade?: string;
	stroke?: string;
	/** skip the near face (open shelf) */
	open?: boolean;
	/** draw the side face (default true; false when a neighbour always hides it) */
	sides?: boolean;
}

/** Axis-aligned box in world space; draws only the faces the camera sees. */
export const Box3: React.FC<{ink: Ink; k0: number; c: Cam3; b: Box3Spec}> = ({ink, k0, c, b}) => {
	const {X0, X1, H0, H1, Z0, Z1, fill, sw = 4, amp = 1, stroke = INK} = b;
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const top = b.top ?? shade(fill, 0.16);
	const side = b.side ?? shade(fill, -0.28);
	const bottom = b.bottom ?? shade(fill, -0.42);
	const out: React.ReactNode[] = [];
	const face = (key: string, pts: Pt[], col: string, ov?: string, k = 0) => {
		out.push(<path key={key} d={ink.poly(pts, k0 + k, amp)} fill={col} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />);
		if (ov) out.push(<path key={key + 'o'} d={qd(pts)} fill={ov} />);
	};
	if (c.eye > H1) face('t', [p(X0, H1, Z0), p(X1, H1, Z0), p(X1, H1, Z1), p(X0, H1, Z1)], top, b.topShade, 1);
	if (c.eye < H0) face('b', [p(X0, H0, Z0), p(X1, H0, Z0), p(X1, H0, Z1), p(X0, H0, Z1)], bottom, undefined, 2);
	const sides = b.sides !== false;
	if (sides && X0 > 0) face('l', [p(X0, H1, Z0), p(X0, H1, Z1), p(X0, H0, Z1), p(X0, H0, Z0)], side, b.sideShade, 3);
	if (sides && X1 < 0) face('r', [p(X1, H1, Z0), p(X1, H1, Z1), p(X1, H0, Z1), p(X1, H0, Z0)], side, b.sideShade, 4);
	if (!b.open) face('n', [p(X0, H1, Z0), p(X1, H1, Z0), p(X1, H0, Z0), p(X0, H0, Z0)], fill, b.nearShade, 5);
	return <g>{out}</g>;
};

/** A world-space quad (4 corners given as [X, H, Z]). */
export const quad3 = (c: Cam3, pts: Array<[number, number, number]>): Pt[] => pts.map(([X, H, Z]) => P3(c, X, H, Z));

/** Vertical (default) or custom linear gradient def from colour stops. */
export const LinGrad: React.FC<{id: string; stops: Array<[number, string, number?]>; x1?: number; y1?: number; x2?: number; y2?: number}> = ({id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1}) => (
	<linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
		{stops.map(([o, c, a], i) => (
			<stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
		))}
	</linearGradient>
);

/** Face outlines of a world box (same visibility rules as <Box3/>), as path data,
 *  so many boxes can be batched into a few <path> elements. `q` = plain quads for
 *  gradient overlays. */
export const box3Faces = (ink: Ink, k0: number, c: Cam3, b: Omit<Box3Spec, 'fill'>) => {
	const {X0, X1, H0, H1, Z0, Z1, amp = 1} = b;
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const out: {top?: string; side?: string; near?: string; topQ?: string; nearQ?: string} = {};
	if (c.eye > H1) {
		const pts = [p(X0, H1, Z0), p(X1, H1, Z0), p(X1, H1, Z1), p(X0, H1, Z1)];
		out.top = ink.poly(pts, k0 + 1, amp);
		out.topQ = qd(pts);
	}
	if (b.sides !== false) {
		if (X0 > 0) out.side = ink.poly([p(X0, H1, Z0), p(X0, H1, Z1), p(X0, H0, Z1), p(X0, H0, Z0)], k0 + 3, amp);
		else if (X1 < 0) out.side = ink.poly([p(X1, H1, Z0), p(X1, H1, Z1), p(X1, H0, Z1), p(X1, H0, Z0)], k0 + 4, amp);
	}
	if (!b.open) {
		const pts = [p(X0, H1, Z0), p(X1, H1, Z0), p(X1, H0, Z0), p(X0, H0, Z0)];
		out.near = ink.poly(pts, k0 + 5, amp);
		out.nearQ = qd(pts);
	}
	return out;
};
