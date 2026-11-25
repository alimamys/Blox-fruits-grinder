// Beds seen side-on (headboard left, as painted on the plates): a person lies with the head on the pillow and the
// blanket drawn in code over the body up to the chin (the figure is drawn standing, clipped at the chin, so only the
// head shows), or the blanket pulled over the head, or sitting up out of the quilt. Ported from the stick Widemouth.
import React from 'react';
import {Tint, INK, type BedGeo, type Light} from './kit';

const Clip: React.FC<{id: string; d: string}> = ({id, d}) => (
	<defs>
		<clipPath id={id}>
			<path d={d} />
		</clipPath>
	</defs>
);

/** a patchwork quilt filling path d */
export const Quilt: React.FC<{d: string; cols: string[]; id: string}> = ({d, cols, id}) => (
	<g>
		<defs>
			<pattern id={id} width={84} height={60} patternUnits="userSpaceOnUse">
				<rect width={42} height={30} fill={cols[0]} />
				<rect x={42} width={42} height={30} fill={cols[1]} />
				<rect y={30} width={42} height={30} fill={cols[2]} />
				<rect x={42} y={30} width={42} height={30} fill={cols[3]} />
				<path d="M42,0 V60 M0,30 H84" stroke="#000" strokeOpacity={0.3} strokeWidth={2} />
			</pattern>
		</defs>
		<path d={d} fill={`url(#${id})`} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
	</g>
);

/** the blanket over someone lying down, from the chin (chinX) to the foot of the bed (x1); `bump` raises it over the knees */
export const lyingBlanket = (b: BedGeo, chinX: number, x1: number, wob = 0, lift = 46) => {
	const top = b.quilt - lift + wob;
	return `M${chinX - 20},${b.skirtTop} L${chinX - 24},${top + 16} C${chinX - 10},${top - 6} ${chinX + 70},${top - 10} ${chinX + 160},${top - 2} C${(chinX + x1) / 2 + 60},${top + 6} ${x1 - 120},${top - 6} ${x1 - 40},${top + 8} C${x1 - 10},${top + 14} ${x1},${top + 30} ${x1 + 2},${b.skirtTop} Z`;
};

type AnyPerson = React.FC<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** a smooth curve through points (Catmull-Rom as cubic Beziers), without the leading M */
const smoothThrough = (pts: Array<[number, number]>) => {
	let d = '';
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(pts.length - 1, i + 2)];
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
	}
	return d;
};

/** lying on the pillow at px (pillow centre x). The painted bed stays exactly as painted; only the face and what the
 *  body changes are drawn on top, all of it ABOVE the painted quilt's top edge (b.quilt): the head on the pillow (the
 *  stick figure clipped to its head - just the face, no arms or shoulders) and the mound the body raises under the
 *  quilt (in the painted quilt's own colour, from where the painted quilt starts to the foot), */
export const LieInBed: React.FC<{
	b: BedGeo;
	is: AnyPerson;
	px: number;
	s: number;
	child?: boolean;
	light?: Light;
	frame: number;
	p?: Record<string, unknown>;
	id: string;
	/** knees lift (px), for something pressing on the blanket */
	wob?: number;
	x1?: number;
	/** false: only the head */
	blanket?: boolean;
	dy?: number;
}> = ({b, is: P, px, s, child = false, light, frame, p = {}, id, wob = 0, x1, blanket = true, dy = 0}) => {
	const k = child ? 0.62 : 1;
	const R = 36 * (child ? 1.08 : 1) * s;
	const hy = b.pillowY - 30 + dy;
	const headUp = 262 * k * s;
	const hcx = px - 0.24 * R;
	const hcy = hy + 0.03 * R;
	const ad = child ? 1 : 1.3;
	const base = b.quilt + 3; // just over the painted quilt's top edge line
	const xs = Math.max(b.qx0 ?? b.x0 + 200, px + 0.35 * R); // where the mound starts (the painted quilt's start)
	const foot = x1 ?? b.qx1 ?? b.x1 - 40;
	const ySh = base - 0.34 * R * ad; // top of the shoulder
	const kneeX = xs + 0.45 * (foot - xs);
	const contour: Array<[number, number]> = [
		[xs - 0.05 * R, base],
		[xs + 0.22 * R, ySh + 0.04 * R],
		[xs + 1.0 * R * ad, ySh - 0.04 * R],
		[xs + 2.0 * R * ad, ySh + 0.12 * R],
		[kneeX, base - 0.55 * R * ad - wob],
		[foot - 170, base - 0.3 * R * ad],
		[foot - 60, base - 0.6 * R * ad],
		[foot - 4, base],
	];
	const topPath = `M${contour[0][0]},${contour[0][1]}${smoothThrough(contour)}`;
	const moundD = `${topPath} Z`;
	return (
		<g>
			<defs>
				<clipPath id={`${id}_head`}>
					{/* an oval round the head: hair falls onto the pillow with a soft edge, nothing shows below the chin */}
					<ellipse cx={hcx} cy={hcy - 0.04 * R} rx={(child ? 1.08 : 1.25) * R} ry={1.07 * R} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}_head)`}>
				<Tint light={light}>
					<P x={px} y={hy + headUp} s={s} frame={frame} tilt={-14} arms="down" noArms {...p} />
				</Tint>
			</g>
			{blanket ? (
				<g>
					<path d={moundD} fill={b.qcol ?? b.quiltCols[0]} />
					<path d={topPath} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			) : null}
		</g>
	);
};

/** Her parents' double bed (plate master_night: the quilt already painted pulled up to the pillows over two sleepers):
 *  only the two faces are drawn, Mom's on the back pillow and Lily's on the front one, just above the quilt's edge. */
export const ParentsBed: React.FC<{
	frame: number;
	mom: AnyPerson;
	lily: AnyPerson;
	momP?: Record<string, unknown>;
	lilyP?: Record<string, unknown>;
	light?: Light;
}> = ({frame, mom: Mom, lily: Lily, momP = {}, lilyP = {}, light}) => {
	const head = (P: AnyPerson, px: number, hy: number, s: number, child: boolean, p: Record<string, unknown>, id: string) => {
		const R = 36 * (child ? 1.08 : 1) * s;
		return (
			<g>
				<defs>
					<clipPath id={id}>
						<ellipse cx={px - 0.24 * R} cy={hy - 0.01 * R} rx={(child ? 1.08 : 1.25) * R} ry={1.07 * R} />
					</clipPath>
				</defs>
				<g clipPath={`url(#${id})`}>
					<Tint light={light}>
						<P x={px} y={hy + 262 * (child ? 0.62 : 1) * s} s={s} frame={frame} tilt={-14} arms="down" noArms {...p} />
					</Tint>
				</g>
			</g>
		);
	};
	return (
		<g>
			{head(Mom, PARENTS_BED.mom[0], PARENTS_BED.mom[1], 1.3, false, momP, 'pbMom')}
			{head(Lily, PARENTS_BED.lily[0], PARENTS_BED.lily[1], 1.6, true, lilyP, 'pbLily')}
		</g>
	);
};
/** where the faces rest in the parents' bed (pillow-centre x, head-centre y) and its nightstand clock */
export const PARENTS_BED = {mom: [701, 588] as [number, number], lily: [455, 620] as [number, number], clock: [205, 745] as [number, number]};

/** the blanket pulled over the head: a trembling lump in the painted quilt's colour, over the pillow */
export const HideInBed: React.FC<{b: BedGeo; px: number; light?: Light; shiver?: number; frame: number; id: string}> = ({b, px, shiver = 1, frame}) => {
	const j = Math.sin(frame * 2.1) * 2.5 * shiver;
	const base = b.quilt + 3;
	const foot = b.qx1 ?? b.x1 - 40;
	const top: Array<[number, number]> = [
		[b.x0 + 40, base + 70],
		[px - 90, base - 70 + j],
		[px + 40, base - 92 + j],
		[px + 190, base - 58 + j],
		[px + 420, base - 34 + j * 0.5],
		[foot - 160, base - 26],
		[foot - 60, base - 40],
		[foot - 4, base],
	];
	// the front edge where the blanket drapes over the pillow: a soft curve, not a box
	const q0 = (b.qx0 ?? px + 80) + 135;
	const drape = `M${q0},${base + 2} C${q0 - 50},${base + 30} ${q0 - 70},${base + 68} ${q0 - 120},${base + 72} C${px - 20},${base + 78} ${b.x0 + 120},${base + 74} ${top[0][0]},${top[0][1]}`;
	const d = `M${top[0][0]},${top[0][1]}${smoothThrough(top)} L${foot - 4},${base + 2} L${q0},${base + 2} ${drape.replace(/^M[^C]+/, '')} Z`;
	return (
		<g>
			<path d={d} fill={b.qcol ?? b.quiltCols[0]} />
			<path d={`M${top[0][0]},${top[0][1]}${smoothThrough(top)}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
			<path d={drape} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
		</g>
	);
};

/** sitting up in bed at x: the figure rises out of the quilt (cut along its top edge), the code blanket over the lap */
export const SitInBed: React.FC<{b: BedGeo; is: AnyPerson; x: number; s: number; child?: boolean; light?: Light; frame: number; p?: Record<string, unknown>; id: string; lap?: boolean}> = ({b, is: P, x, s, child = false, light, frame, p = {}, id, lap = true}) => {
	const k = child ? 0.62 : 1;
	const y = b.quilt - 10 + 72 * k * s;
	return (
		<g>
			<Clip id={`${id}_waist`} d={`M0,0 H1920 V${b.quilt + 4} H0 Z`} />
			<g clipPath={`url(#${id}_waist)`}>
				<Tint light={light}>
					<P x={x} y={y} s={s} frame={frame} pose="sit" {...p} />
				</Tint>
			</g>
			{lap ? <Tint light={light}>
				<Quilt id={`${id}_lap`} cols={b.quiltCols} d={`M${x - 70 * s * k},${b.skirtTop} L${x - 66 * s * k},${b.quilt - 18} C${x},${b.quilt - 34} ${x + 200},${b.quilt - 30} ${b.x1 - 40},${b.quilt - 8} C${b.x1 - 10},${b.quilt} ${b.x1},${b.quilt + 20} ${b.x1 + 2},${b.skirtTop} Z`} />
			</Tint> : null}
		</g>
	);
};
