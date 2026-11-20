// "Frame 240" pieces for the stick film: the tall man (dark, painted white, or only an outline in the wall),
// embossed shapes under a white surface, the desk seen from the monitor, an office chair, rain on the glass,
// the light flicker, the selection box and the giant cursor in world coordinates.
import React from 'react';
import {boilOf, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';
import {clamp01, INK, lerp, qaAdd, useStageCtx} from './kit';

// ------------------------------------------------------------------ the tall man
/** Geometry of the man at s = 1, feet at (0,0): about 405 px tall (a person is about 300). */
export const manGeom = (stoop = 0) => {
	const body: Pt[] = [
		[-24, -336],
		[24, -336],
		[29, -220],
		[33, -90],
		[34, -6],
		[-34, -6],
		[-33, -90],
		[-29, -220],
	];
	const armL: Pt[] = [
		[-23, -328],
		[-36, -244],
		[-39, -152],
	];
	const armR: Pt[] = [
		[23, -328],
		[36, -244],
		[39, -152],
	];
	// the head hangs to one side and forward; stooping lowers it toward the shoulder
	const rot = -34 - stoop * 50;
	const r = (rot * Math.PI) / 180;
	// a point `len` up the neck line, turned by rot around the neck base (0, -334)
	const up = (len: number): Pt => [len * Math.sin(r), -334 - len * Math.cos(r)];
	const neck: Pt[] = [[0, -334], up(12)];
	const hc = up(34);
	return {body, armL, armR, neck, head: {cx: hc[0], cy: hc[1], rx: 22, ry: 26, rot}};
};

export type ManLook = 'dark' | 'white' | 'ghost' | 'paint';

/**
 * The man. Very tall and thin, arms hanging straight down, the head bent unnaturally to one side,
 * no face. look: 'dark' (the drawing on her canvas, the figure in the hallway), 'white' (painted over:
 * white on white), 'ghost' (only a faint pale outline), 'paint' (flat white paint with rough edges).
 * He never breathes or shifts; now and then the head jumps a few degrees, like a drawing re-positioned.
 */
export const TallMan: React.FC<{x: number; y: number; s?: number; frame: number; look?: ManLook; stoop?: number; opacity?: number; twitch?: boolean; name?: string; qa?: boolean; flip?: boolean; arms?: 'down' | 'up'}> = ({
	x,
	y,
	s = 1,
	frame,
	look = 'dark',
	stoop = 0,
	opacity = 1,
	twitch = true,
	name = 'man',
	qa = true,
	flip = false,
	arms = 'down',
}) => {
	const ctx = useStageCtx();
	if (qa && look === 'dark') qaAdd(ctx, {name, x0: x - 46 * s, x1: x + 46 * s, y0: y - (405 - stoop * 60) * s, y1: y, head: y - (330 - stoop * 40) * s, edge: false});
	const g = manGeom(stoop);
	const sd = 2400 + boilOf(frame, 4) * 7;
	const jump = twitch && frame % 67 < 2 ? 7 : 0;
	const pal =
		look === 'dark'
			? {fill: '#16171c', line: '#030304', w: 5, rim: '#55607a'}
			: look === 'white'
				? {fill: '#f3f2ed', line: '#d6d5ce', w: 2.5, rim: '#ffffff'}
				: look === 'paint'
					? {fill: '#f7f6f1', line: '#f7f6f1', w: 9, rim: '#ffffff'}
					: {fill: 'none', line: '#dcdad2', w: 2.2, rim: 'none'};
	const armsPts = arms === 'up' ? [g.armL.map(([a, b]) => [a, b - (b + 328) * 1.9] as Pt), g.armR] : [g.armL, g.armR];
	const fingers = (h: Pt, dir: number) =>
		[-6, -1, 4, 8].map((dx, i) => (
			<path key={i} d={wobLine(h[0] + dx * 0.5, h[1] - 2, h[0] + dx * dir * 0.2 + dx, h[1] + 34 + (i === 1 ? 8 : 0), sd + 40 + i + dir, 0.6)} stroke={pal.line === 'none' ? pal.fill : pal.line} strokeWidth={look === 'dark' ? 4 : 2.5} strokeLinecap="round" />
		));
	const head = g.head;
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
			{look === 'dark' ? <ellipse cx={0} cy={0} rx={46} ry={8} fill="#000" opacity={0.3} /> : null}
			{/* arms behind the body edge */}
			{armsPts.map((a, i) => (
				<g key={i}>
					<path d={wob(a, sd + 10 + i, 0.6, false)} stroke={pal.line} strokeWidth={look === 'ghost' ? 11 : 15} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={look === 'ghost' ? 0.7 : 1} />
					{look !== 'ghost' ? <path d={wob(a, sd + 10 + i, 0.6, false)} stroke={pal.fill} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d={wob(a, sd + 10 + i, 0.6, false)} stroke="#f4f3ee" strokeWidth={7} fill="none" strokeLinecap="round" />}
					{fingers(a[2], i ? 1 : -1)}
				</g>
			))}
			{/* body, ragged hem */}
			<path
				d={wobPoly(
					[...g.body.slice(0, 4), ...Array.from({length: 9}, (_, i): Pt => [34 - i * 8.5, i % 2 ? -26 : -2]), ...g.body.slice(5)],
					sd,
					0.9,
				)}
				fill={pal.fill}
				stroke={pal.line}
				strokeWidth={pal.w}
				strokeLinejoin="round"
			/>
			{look === 'dark' ? <path d={wobLine(27, -320, 33, -40, sd + 3, 0.6)} stroke={pal.rim} strokeWidth={3} opacity={0.45} /> : null}
			{/* neck + head, bent to the side */}
			<g transform={`rotate(${jump} 0 -334)`}>
				<path d={wob(g.neck, sd + 4, 0.4, false)} stroke={pal.line} strokeWidth={14} strokeLinecap="round" fill="none" />
				<path d={wob(g.neck, sd + 4, 0.4, false)} stroke={look === 'ghost' ? '#f4f3ee' : pal.fill} strokeWidth={7} strokeLinecap="round" fill="none" />
				<g transform={`rotate(${head.rot} ${head.cx} ${head.cy})`}>
					<path d={wobEllipse(head.cx, head.cy, head.rx, head.ry, sd + 5, 0.7)} fill={pal.fill} stroke={pal.line} strokeWidth={pal.w} />
					{look === 'dark' ? <path d={`M${head.cx - 14},${head.cy + 12} Q${head.cx},${head.cy + 22} ${head.cx + 14},${head.cy + 12}`} stroke={pal.rim} strokeWidth={2.5} fill="none" opacity={0.35} /> : null}
				</g>
			</g>
		</g>
	);
};

/** A drawn shape (any path d) pressing out from under a white surface: soft shadow below, light above. */
export const Emboss: React.FC<{d: string; k: number; w?: number}> = ({d, k, w = 8}) => {
	if (k <= 0.01) return null;
	return (
		<g>
			<defs>
				<filter id="embBlur" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="3.2" />
				</filter>
			</defs>
			<path d={d} transform="translate(5 7)" stroke="#5a5a56" strokeOpacity={0.42 * k} strokeWidth={w * 1.4} fill="none" filter="url(#embBlur)" strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} transform="translate(-3 -3)" stroke="#ffffff" strokeOpacity={0.9 * k} strokeWidth={w} fill="none" filter="url(#embBlur)" strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} stroke="#bdbcb5" strokeOpacity={0.55 * k} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</g>
	);
};

/** outline paths of the man (for Emboss): body, two arms, the head */
export const manOutline = (x: number, y: number, s: number, stoop = 0, parts: Array<'body' | 'armL' | 'armR' | 'head' | 'shoulder'> = ['body', 'armL', 'armR', 'head']) => {
	const g = manGeom(stoop);
	const P = (p: Pt): Pt => [x + p[0] * s, y + p[1] * s];
	const out: string[] = [];
	if (parts.includes('body')) out.push(wobPoly(g.body.map(P), 2600, 0.6));
	if (parts.includes('shoulder')) out.push(wob([P([-60, -250]), P([-30, -330]), P([24, -336]), P([40, -300])], 2601, 0.5, false));
	if (parts.includes('armL')) out.push(wob(g.armL.map(P), 2602, 0.5, false));
	if (parts.includes('armR')) out.push(wob(g.armR.map(P), 2603, 0.5, false));
	if (parts.includes('head')) {
		const h = g.head;
		const c = P([h.cx, h.cy]);
		out.push(wobEllipse(c[0], c[1], h.rx * s, h.ry * s, 2604, 0.6));
	}
	return out;
};

/** A long-fingered hand outline (palm + five fingers), pointing up, centred at x,y */
export const handPath = (x: number, y: number, s: number, rot = 0): string => {
	const pts: Pt[] = [];
	const R = (px: number, py: number): Pt => {
		const a = (rot * Math.PI) / 180;
		return [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
	};
	pts.push(R(-26, 40), R(-30, 0));
	[-22, -9, 4, 17].forEach((fx, i) => {
		const L = [62, 74, 70, 58][i];
		pts.push(R(fx - 5, -6), R(fx - 3, -L), R(fx + 3, -L), R(fx + 5, -6));
	});
	pts.push(R(27, -2), R(44, -30), R(50, -24), R(30, 18), R(26, 40));
	return `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L')} Z`;
};

// ------------------------------------------------------------------ the workroom
/** The desk seen from her monitor, along the bottom of the frame: top edge at y, keyboard, pen tablet, mug. */
export const DeskFront: React.FC<{y: number; frame: number; x0?: number; x1?: number; glow?: number; phone?: boolean}> = ({y, frame, x0 = -200, x1 = 2120, glow = 1, phone = true}) => {
	const sd = 2700 + boilOf(frame, 4) * 7;
	return (
		<g>
			<path d={wobPoly([[x0, y], [x1, y], [x1, 1300], [x0, 1300]], sd, 1)} fill="#5c3f2a" stroke={INK} strokeWidth={7} />
			<path d={wobPoly([[x0, y], [x1, y], [x1, y + 26], [x0, y + 26]], sd + 1, 0.8)} fill="#7a5638" stroke={INK} strokeWidth={6} />
			<path d={wobLine(x0, y + 4, x1, y + 4, sd + 2, 0.5)} stroke="#9fc4ff" strokeOpacity={0.35 * glow} strokeWidth={5} />
			{/* keyboard, pen tablet + stylus, mug */}
			<path d={wobPoly([[700, y - 26], [1120, y - 26], [1140, y + 6], [680, y + 6]], sd + 3, 0.5)} fill="#2a2b30" stroke={INK} strokeWidth={4} />
			{Array.from({length: 3}, (_, r) => (
				<path key={r} d={wobLine(700 + r * 4, y - 18 + r * 8, 1120 - r * 4, y - 18 + r * 8, sd + 4 + r, 0.3)} stroke="#4a4c54" strokeWidth={3} strokeDasharray="14 5" />
			))}
			<path d={wobPoly([[1220, y - 12], [1500, y - 12], [1515, y + 8], [1205, y + 8]], sd + 8, 0.5)} fill="#1c1d22" stroke={INK} strokeWidth={4} />
			<path d={wobLine(1300, y - 20, 1440, y - 4, sd + 9, 0.3)} stroke="#111" strokeWidth={9} strokeLinecap="round" />
			<path d={wobPoly([[420, y - 70], [482, y - 70], [478, y + 2], [424, y + 2]], sd + 10, 0.5)} fill="#d8d8d2" stroke={INK} strokeWidth={4.5} />
			<path d={`M482,${y - 56} q22,4 18,24 q-4,12 -18,10`} fill="none" stroke={INK} strokeWidth={5} />
			{phone ? <path d={wobPoly([[548, y - 8], [640, y - 8], [646, y + 4], [542, y + 4]], sd + 11, 0.3)} fill="#16171b" stroke={INK} strokeWidth={4} /> : null}
			{/* the monitor's cold light spilling over the desk */}
			<ellipse cx={960} cy={y} rx={900} ry={60} fill="#9fc4ff" opacity={0.08 * glow} />
		</g>
	);
};

/** An office chair. view 'front': only the backrest behind her shoulders; 'side': seat, backrest, gas lift, star base. */
export const OfficeChair: React.FC<{x: number; y: number; s?: number; frame: number; view: 'front' | 'side'; dir?: 1 | -1}> = ({x, y, s = 1, frame, view, dir = 1}) => {
	const sd = 2800 + boilOf(frame, 4) * 7;
	const seat = y - 72 * s;
	if (view === 'front')
		return <path d={wobPoly([[x - 46 * s, seat - 150 * s], [x - 22 * s, seat - 160 * s], [x + 22 * s, seat - 160 * s], [x + 46 * s, seat - 150 * s], [x + 48 * s, seat - 70 * s], [x - 48 * s, seat - 70 * s]], sd, 0.8)} fill="#23262e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
	const bx = x - dir * 40 * s;
	return (
		<g>
			<path d={wobPoly([[bx - 14 * s, seat - 210 * s], [bx + 14 * s, seat - 210 * s], [bx + 12 * s, seat - 10 * s], [bx - 12 * s, seat - 10 * s]], sd, 0.6)} fill="#23262e" stroke={INK} strokeWidth={5} />
			<path d={wobLine(x, seat + 8 * s, x, y - 18 * s, sd + 1, 0.3)} stroke={INK} strokeWidth={10 * s} />
			<path d={wobLine(x - 50 * s, y - 10 * s, x + 50 * s, y - 10 * s, sd + 2, 0.4)} stroke={INK} strokeWidth={9 * s} strokeLinecap="round" />
			{[-50, 0, 50].map((dx) => (
				<circle key={dx} cx={x + dx * s} cy={y - 4 * s} r={7 * s} fill="#2a2a2a" stroke={INK} strokeWidth={3} />
			))}
		</g>
	);
};
/** the seat cushion, drawn OVER her (front of the seat) when side-on */
export const ChairSeat: React.FC<{x: number; y: number; s?: number; frame: number}> = ({x, y, s = 1, frame}) => {
	const seat = y - 72 * s;
	return <path d={wobPoly([[x - 58 * s, seat - 6 * s], [x + 58 * s, seat - 6 * s], [x + 54 * s, seat + 12 * s], [x - 54 * s, seat + 12 * s]], 2810 + boilOf(frame, 4) * 7, 0.5)} fill="#2b2f38" stroke={INK} strokeWidth={5} />;
};

/** rain running down a window pane (rect), animated */
export const Rain: React.FC<{box: readonly [number, number, number, number]; frame: number; n?: number; opacity?: number}> = ({box, frame, n = 34, opacity = 0.55}) => {
	const [x0, y0, x1, y1] = box;
	const h = y1 - y0;
	return (
		<g opacity={opacity}>
			<defs>
				<clipPath id={`rain${x0}${y0}`}>
					<rect x={x0} y={y0} width={x1 - x0} height={h} />
				</clipPath>
			</defs>
			<g clipPath={`url(#rain${x0}${y0})`}>
				{Array.from({length: n}, (_, i) => {
					const x = x0 + ((i * 137.5) % (x1 - x0));
					const sp = 22 + (i % 5) * 6;
					const y = y0 + ((frame * sp + i * 71) % (h + 80)) - 60;
					return <path key={i} d={`M${x},${y} l-7,${30 + (i % 3) * 8}`} stroke="#c8d8f4" strokeWidth={2.4} strokeLinecap="round" />;
				})}
			</g>
		</g>
	);
};

/** Lights flickering: a dark overlay that stutters (k 0..1 strength). */
export const Flicker: React.FC<{f: number; k: number}> = ({f, k}) => {
	if (k <= 0) return null;
	const on = [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1][Math.floor(f / 2) % 16];
	return <rect x={-400} y={-400} width={2720} height={1880} fill="#05060a" opacity={(on ? 0.04 : 0.72) * k} />;
};

/** soft light pool (monitor, phone, ceiling bulb) */
export const Glow: React.FC<{cx: number; cy: number; r: number; color?: string; k?: number}> = ({cx, cy, r, color = '#9fc4ff', k = 1}) => {
	const id = `g${Math.round(cx)}${Math.round(cy)}${Math.round(r)}`;
	return (
		<g>
			<defs>
				<radialGradient id={id}>
					<stop offset="0" stopColor={color} stopOpacity={0.5 * k} />
					<stop offset="1" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
		</g>
	);
};

/** a hand-drawn line growing from a to b (pencil black, or the red brush) */
export const DrawnLine: React.FC<{a: Pt; b: Pt; k: number; color?: string; w?: number; seed?: number}> = ({a, b, k, color = '#111', w = 5, seed = 1}) => {
	if (k <= 0) return null;
	const e: Pt = [lerp(a[0], b[0], clamp01(k)), lerp(a[1], b[1], clamp01(k))];
	return <path d={wobLine(a[0], a[1], e[0], e[1], 2900 + seed, 0.8)} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" />;
};

/** the selection box ("marching ants") in world coordinates */
export const Ants: React.FC<{box: readonly [number, number, number, number]; f: number; k?: number; w?: number}> = ({box, f, k = 1, w = 4}) => {
	const [x0, y0, x1, y1] = box;
	return (
		<g opacity={k}>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#000" strokeWidth={w} />
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#fff" strokeWidth={w} strokeDasharray={`${w * 3} ${w * 3}`} strokeDashoffset={-f * w * 0.75} />
		</g>
	);
};

/** the giant white mouse cursor (arrow), tip at x,y, size = height in px */
export const WorldCursor: React.FC<{x: number; y: number; size: number; press?: number}> = ({x, y, size, press = 0}) => {
	const k = (size / 26) * (1 - press * 0.06);
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`}>
			<path d="M1,1 L1,20 L6,15 L9.5,23 L12.5,21.8 L9,14 L16,14 Z" transform="translate(0.6 1.2)" fill="#000" opacity={0.35} />
			<path d="M0,0 L0,19 L5,14 L8.5,22 L11.5,20.8 L8,13 L15,13 Z" fill="#fbfbf8" stroke="#111" strokeWidth={0.5} strokeLinejoin="round" />
		</g>
	);
};

/** carpet stain (perspective ellipse) */
export const Stain: React.FC<{x: number; y: number; w: number; k?: number; frame: number}> = ({x, y, w, k = 1, frame}) => (
	<path d={wobEllipse(x, y, w / 2, w / 10, 3000 + Math.round(x) + boilOf(frame, 4) * 7, 0.6)} fill="#5a3f28" opacity={0.55 * k} />
);

/** a round head silhouette helper for the face pressing through the closet door */
export const facePaths = (cx: number, cy: number, s: number): string[] => [
	wobEllipse(cx, cy, 90 * s, 120 * s, 3100, 0.6),
	wob([[cx - 50 * s, cy - 25 * s], [cx - 18 * s, cy - 34 * s]], 3101, 0.4, false),
	wob([[cx + 18 * s, cy - 34 * s], [cx + 50 * s, cy - 25 * s]], 3102, 0.4, false),
	wob([[cx, cy - 20 * s], [cx - 8 * s, cy + 22 * s], [cx + 8 * s, cy + 28 * s]], 3103, 0.4, false),
	wob([[cx - 26 * s, cy + 62 * s], [cx, cy + 56 * s], [cx + 26 * s, cy + 62 * s]], 3104, 0.4, false),
];

export {wobCircle};
