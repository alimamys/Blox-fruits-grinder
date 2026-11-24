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

/** lying on the pillow at px (pillow centre x): the head on the pillow (the stick figure clipped to its head, so no
 *  arm stubs show under the chin), the neck and shoulder in the pyjama colour, the blanket drawn over the body from
 *  the shoulder (it follows chest, knees and feet), and one arm resting on top of it with a round hand.
 *  `matte`: instead of the patchwork quilt, a plain band in the painted quilt's own colour that only raises the body
 *  above the plate's quilt (for beds whose painted quilt should stay visible, e.g. the parents' bed). */
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
	wob?: number;
	x1?: number;
	/** false: only the head (something else covers the body) */
	blanket?: boolean;
	shirt?: string;
	skin?: string;
	arm?: boolean;
	cols?: string[];
	matte?: string;
	/** move the whole sleeper down (the one nearer the camera in a double bed) */
	dy?: number;
}> = ({b, is: P, px, s, child = false, light, frame, p = {}, id, wob = 0, x1, blanket = true, shirt = '#e7a9bb', skin = '#f1cfae', arm = true, cols, matte, dy = 0}) => {
	const k = child ? 0.62 : 1;
	const R = 36 * (child ? 1.08 : 1) * s;
	const hy = b.pillowY - 30 + dy;
	const headUp = 262 * k * s;
	const lw = 5.5 * s * 0.9;
	const hcx = px - 0.24 * R;
	const hcy = hy + 0.03 * R;
	const ad = child ? 1 : 1.3;
	const foot = x1 ?? b.x1 - 30;
	const xe = px + 0.78 * R * ad; // the blanket's edge, just past the chin
	const ySh = hy + (matte ? 0.42 : 0.1) * R; // over the shoulder
	const kneeY = Math.min(b.quilt - 42 + dy, ySh + 0.25 * R) + wob;
	const flat = b.quilt - 6 + dy * 0.3;
	const contour: Array<[number, number]> = matte
		? [
				[xe - 0.06 * R, ySh + 0.32 * R],
				[xe + 0.22 * R, ySh + 0.04 * R],
				[xe + 0.95 * R * ad, ySh + 0.16 * R],
				[xe + 1.9 * R * ad, (ySh + flat) / 2 + 6],
				[xe + 3.0 * R * ad, flat - 4],
				[foot - 200, flat - 2],
				[foot - 6, flat],
			]
		: [
		[xe - 0.06 * R, ySh + 0.3 * R],
		[xe + 0.22 * R, ySh],
		[xe + 1.0 * R * ad, ySh - 0.07 * R],
		[xe + 2.1 * R * ad, ySh + 0.1 * R],
		[xe + 0.55 * (foot - xe), kneeY - 6],
		[foot - 170, kneeY + 10],
		[foot - 60, kneeY - 8],
		[foot - 6, kneeY + 18],
			];
	const bottom = matte ? b.quilt + 16 + dy : b.skirtTop;
	const topPath = `M${contour[0][0]},${contour[0][1]}${smoothThrough(contour)}`;
	const edgeX = xe - (matte ? 0.5 : 0.04) * R; // the blanket's near edge slants down toward the pillow
	const blanketD = `M${edgeX},${bottom} Q${contour[0][0] - 0.1 * R},${(bottom + contour[0][1]) / 2} ${contour[0][0]},${contour[0][1]}${smoothThrough(contour)} L${foot + 2},${bottom} Z`;
	// the sheet turned down over the blanket's top edge, near the head
	const foldPts = contour.slice(0, 3);
	const foldD = `M${foldPts[0][0]},${foldPts[0][1]}${smoothThrough(foldPts)} L${foldPts[2][0] + 0.05 * R},${foldPts[2][1] + 0.26 * R} ${smoothThrough([[foldPts[2][0] + 0.05 * R, foldPts[2][1] + 0.26 * R], [foldPts[1][0] + 0.06 * R, foldPts[1][1] + 0.3 * R], [foldPts[0][0] + 0.04 * R, foldPts[0][1] + 0.34 * R]]).trim().replace(/^C/, 'C')} Z`;
	// the arm resting on the blanket: out from under its edge at the shoulder, along the chest, the hand on the tummy
	const topAt = (x: number) => {
		let best = contour[0];
		for (const c of contour) if (Math.abs(c[0] - x) < Math.abs(best[0] - x)) best = c;
		return best[1];
	};
	const aw = 0.26 * R * (child ? 1 : 0.85);
	const sh: [number, number] = [xe + 0.12 * R, ySh + 0.28 * R];
	const el: [number, number] = [xe + 0.95 * R * ad, topAt(xe + 0.95 * R * ad) - aw * 0.35];
	const hd: [number, number] = [xe + 1.75 * R * ad, topAt(xe + 1.75 * R * ad) - aw * 0.45];
	const armD = `M${sh[0]},${sh[1]} Q${sh[0] + 0.35 * R},${ySh - 0.05 * R} ${el[0]},${el[1]} L${hd[0]},${hd[1]}`;
	// neck + shoulder between the chin and the blanket edge
	const bodyD = `M${px + 0.35 * R},${hy + 1.05 * R} C${px + 0.45 * R},${hy + 0.7 * R} ${px + 0.6 * R},${ySh + 0.02 * R} ${xe + 0.4 * R},${ySh - 0.05 * R} L${xe + 0.4 * R},${hy + 1.4 * R} L${px + 0.35 * R},${hy + 1.4 * R} Z`;
	const fill = matte ?? undefined;
	const quilt = matte ? (
		<g>
			<path d={blanketD} fill={fill} />
			<path d={topPath} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
			<path d={`M${edgeX},${bottom - 4} Q${contour[0][0] - 0.1 * R},${(bottom + contour[0][1]) / 2} ${contour[0][0]},${contour[0][1]}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
		</g>
	) : (
		<Quilt id={`${id}_q`} cols={cols ?? b.quiltCols} d={blanketD} />
	);
	const foldEl = <path d={foldD} fill={matte ? '#d8d0c6' : '#c9cfe6'} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />;
	const armEl = arm ? (
		<g>
			<path d={armD} fill="none" stroke={INK} strokeWidth={aw + lw * 2} strokeLinecap="round" strokeLinejoin="round" />
			<path d={armD} fill="none" stroke={shirt} strokeWidth={aw} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={hd[0] + 0.12 * R} cy={hd[1]} r={0.19 * R * (child ? 1 : 0.85)} fill={skin} stroke={INK} strokeWidth={lw * 0.8} />
		</g>
	) : null;
	return (
		<g>
			{blanket ? (
				<Tint light={light}>
					<path d={bodyD} fill={shirt} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
				</Tint>
			) : null}
			<defs>
				<clipPath id={`${id}_head`}>
					<rect x={0} y={0} width={1920} height={hy + 0.3 * R} />
					<circle cx={hcx} cy={hcy} r={R + 2.8 * s} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}_head)`}>
				<Tint light={light}>
					<P x={px} y={hy + headUp} s={s} frame={frame} tilt={-14} arms="down" noArms {...p} />
				</Tint>
			</g>
			{blanket ? (matte ? quilt : <Tint light={light}>{quilt}</Tint>) : null}
			{blanket ? (matte ? foldEl : <Tint light={light}>{foldEl}</Tint>) : null}
			{blanket ? <Tint light={light}>{armEl}</Tint> : null}
		</g>
	);
};

/** the blanket pulled over the head: a trembling lump */
export const HideInBed: React.FC<{b: BedGeo; px: number; light?: Light; shiver?: number; frame: number; id: string}> = ({b, px, light, shiver = 1, frame, id}) => {
	const j = Math.sin(frame * 2.1) * 2.5 * shiver;
	const top = b.quilt - 90 + j;
	const d = `M${b.x0 + 30},${b.skirtTop} L${b.x0 + 32},${top + 50} C${px - 60},${top - 10} ${px + 40},${top - 20} ${px + 120},${top + 30} C${px + 220},${top + 40} ${b.x1 - 160},${top + 26} ${b.x1 - 50},${top + 44} C${b.x1 - 20},${top + 50} ${b.x1 - 10},${top + 70} ${b.x1 - 8},${b.skirtTop} Z`;
	return (
		<Tint light={light}>
			<Quilt id={`${id}_q`} cols={b.quiltCols} d={d} />
		</Tint>
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
