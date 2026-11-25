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

/** lying on the pillow at px (pillow centre x). The painted bed stays exactly as painted; only what a body changes is
 *  drawn on top, all of it ABOVE the painted quilt's top edge (b.quilt): the head on the pillow (the stick figure
 *  clipped to its head, no arms), the shoulder in the pyjama colour, the mound the body raises in the quilt (in the
 *  painted quilt's own colour, from where the painted quilt starts to the foot), the sheet turned over at its top,
 *  and one arm resting on it with a round hand. */
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
	shirt?: string;
	skin?: string;
	arm?: boolean;
	dy?: number;
}> = ({b, is: P, px, s, child = false, light, frame, p = {}, id, wob = 0, x1, blanket = true, shirt = '#e7a9bb', skin = '#f1cfae', arm = true, dy = 0}) => {
	const k = child ? 0.62 : 1;
	const R = 36 * (child ? 1.08 : 1) * s;
	const hy = b.pillowY - 30 + dy;
	const headUp = 262 * k * s;
	const lw = 5.5 * s * 0.9;
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
	// the turned-over sheet along the top near the head
	const f0 = contour.slice(0, 3);
	const foldD = `M${f0[0][0]},${f0[0][1]}${smoothThrough(f0)} L${f0[2][0] + 0.04 * R},${f0[2][1] + 0.2 * R} ${smoothThrough([[f0[2][0] + 0.04 * R, f0[2][1] + 0.2 * R], [f0[1][0] + 0.08 * R, f0[1][1] + 0.22 * R], [f0[0][0] + 0.12 * R, base]]).trim()} Z`;
	// the shoulder between the chin and the mound
	const bodyD = `M${px + 0.25 * R},${base} C${px + 0.3 * R},${ySh + 0.25 * R} ${px + 0.5 * R},${ySh} ${xs + 0.3 * R},${ySh} L${xs + 0.3 * R},${base} Z`;
	// the arm resting on the mound
	const topAt = (x: number) => {
		let best = contour[0];
		for (const c of contour) if (Math.abs(c[0] - x) < Math.abs(best[0] - x)) best = c;
		return best[1];
	};
	const aw = 0.26 * R * (child ? 1 : 0.85);
	const sh: [number, number] = [xs + 0.05 * R, ySh + 0.3 * R];
	const el: [number, number] = [xs + 0.95 * R * ad, topAt(xs + 0.95 * R * ad) - aw * 0.3];
	const hd: [number, number] = [xs + 1.75 * R * ad, topAt(xs + 1.75 * R * ad) - aw * 0.4];
	const armD = `M${sh[0]},${sh[1]} Q${sh[0] + 0.35 * R},${ySh - 0.08 * R} ${el[0]},${el[1]} L${hd[0]},${hd[1]}`;
	return (
		<g>
			{blanket ? (
				<Tint light={light}>
					<path d={bodyD} fill={shirt} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
				</Tint>
			) : null}
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
					{b.sheet ? <path d={foldD} fill={b.sheet} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
					{arm ? (
						<Tint light={light}>
							<path d={armD} fill="none" stroke={INK} strokeWidth={aw + lw * 2} strokeLinecap="round" strokeLinejoin="round" />
							<path d={armD} fill="none" stroke={shirt} strokeWidth={aw} strokeLinecap="round" strokeLinejoin="round" />
							<circle cx={hd[0] + 0.12 * R} cy={hd[1]} r={0.19 * R * (child ? 1 : 0.85)} fill={skin} stroke={INK} strokeWidth={lw * 0.8} />
						</Tint>
					) : null}
				</g>
			) : null}
		</g>
	);
};

/** Her parents' double bed with Mom (back pillow) and Lily (front pillow) asleep under one blanket: the painted bed
 *  stays as painted; one mound rises over both bodies above the painted quilt's edge - the top sheet turned down over
 *  their chests, the quilt from the waist down - with Mom's arm and Lily's arm resting on it. */
export const ParentsBed: React.FC<{
	frame: number;
	mom: AnyPerson;
	lily: AnyPerson;
	momP?: Record<string, unknown>;
	lilyP?: Record<string, unknown>;
	momShirt: string;
	momSkin: string;
	lilyShirt: string;
	lilySkin: string;
	light?: Light;
}> = ({frame, mom: Mom, lily: Lily, momP = {}, lilyP = {}, momShirt, momSkin, lilyShirt, lilySkin, light}) => {
	const QUILT = '#c09e78';
	const SHEET = '#cdb9a5';
	// heads: Mom on the back pillow, Lily on the front one
	const mR = 36 * 1.3;
	const lR = 36 * 1.08 * 1.6;
	const mHy = 610;
	const lHy = 624;
	const head = (P: AnyPerson, px: number, hy: number, s: number, child: boolean, R: number, p: Record<string, unknown>, id: string) => (
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
	const contour: Array<[number, number]> = [
		[232, 742],
		[262, 668],
		[300, 650],
		[352, 664],
		[420, 676],
		[505, 664],
		[600, 672],
		[760, 688],
		[960, 684],
		[1100, 694],
		[1190, 688],
		[1248, 718],
	];
	const top = `M${contour[0][0]},${contour[0][1]}${smoothThrough(contour)}`;
	const mound = `${top} L1248,722 L300,724 Z`;
	// the turned-down sheet: the part over their chests, ending in a soft fold at x ~ 740
	const sheetD = `M232,742${smoothThrough(contour.slice(0, 8))} C752,700 742,712 738,722 L300,724 Z`;
	const arm = (pts: string, w: number, col: string, hand: [number, number], r: number) => (
		<g>
			<path d={pts} fill="none" stroke={INK} strokeWidth={w + 10} strokeLinecap="round" strokeLinejoin="round" />
			<path d={pts} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={hand[0]} cy={hand[1]} r={r} fill={momSkin === col ? lilySkin : col === momShirt ? momSkin : lilySkin} stroke={INK} strokeWidth={5} />
		</g>
	);
	return (
		<g>
			{head(Mom, 215, mHy, 1.3, false, mR, momP, 'pbMom')}
			<path d={mound} fill={QUILT} />
			<path d={sheetD} fill={SHEET} />
			<path d={top} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
			<path d="M752,700 C742,712 740,716 738,722" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
			<Tint light={light}>{arm('M296,676 Q330,654 372,660 L432,662', 12, momShirt, [446, 662], 9)}</Tint>
			{head(Lily, 430, lHy, 1.6, true, lR, lilyP, 'pbLily')}
			<Tint light={light}>{arm('M500,700 Q540,668 580,664 L640,664', 16, lilyShirt, [656, 664], 12)}</Tint>
		</g>
	);
};

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
