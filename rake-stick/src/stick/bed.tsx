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

/** the dent a head makes in a pillow: a soft shadow under it and the pillow pushed up on both sides */
const PillowDent: React.FC<{cx: number; cy: number; R: number}> = ({cx, cy, R}) => (
	<g>
		<ellipse cx={cx + 0.12 * R} cy={cy + 0.62 * R} rx={1.12 * R} ry={0.34 * R} fill="#000" opacity={0.2} />
		<path d={`M${cx - 1.22 * R},${cy + 0.12 * R} Q${cx - 1.32 * R},${cy + 0.5 * R} ${cx - 1.02 * R},${cy + 0.78 * R}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
		<path d={`M${cx + 1.08 * R},${cy + 0.05 * R} Q${cx + 1.3 * R},${cy + 0.38 * R} ${cx + 1.12 * R},${cy + 0.7 * R}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
	</g>
);

/** a short neck from under the chin to where it goes under the blanket (skin colour, thick outline) */
const Neck: React.FC<{a: [number, number]; b: [number, number]; w: number; skin: string; lw: number}> = ({a, b, w, skin, lw}) => (
	<g>
		<path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={INK} strokeWidth={w + lw * 2} strokeLinecap="round" />
		<path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={skin} strokeWidth={w} strokeLinecap="round" />
	</g>
);

/** the sleeper's head on the pillow: the stick figure drawn head-only, so the face and the hair on the head keep their
 *  usual style. part='front' draws the face with only the hair on the head (no ponytail or hair hanging behind it);
 *  part='back' draws only the hair hanging behind the head (for long hair kept on the pillow, under the neck). */
const PillowHead: React.FC<{is: AnyPerson; px: number; hy: number; s: number; child: boolean; frame: number; p: Record<string, unknown>; light?: Light; part?: 'front' | 'back'}> = ({is: P, px, hy, s, child, frame, p, light, part = 'front'}) => (
	<Tint light={light}>
		<P x={px} y={hy + 262 * (child ? 0.62 : 1) * s} s={s} frame={frame} tilt={-14} arms="down" noArms headOnly hairCapOnly={part === 'front'} hairBackOnly={part === 'back'} {...p} />
	</Tint>
);

/** someone lying in one of the single beds: the head on the pillow (with the pillow dented under it), a short neck going
 *  under the blanket, and the blanket pulled up to the shoulders - drawn over the painted quilt in the painted quilt's
 *  own colours (top surface, front face), with the sheet turned down at the head end, the body's shape under it
 *  (shoulder, chest, knees, feet) and soft folds. Arms, hands and legs stay under the blanket. */
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
	/** skin colour (for the neck) */
	skin?: string;
	/** false: only the head */
	blanket?: boolean;
	dy?: number;
	/** long hair: spread out on the pillow behind the head, in this colour */
	longHair?: string;
	/** show the top of the shoulder (in this shirt colour) between the neck and the blanket */
	shoulder?: string;
}> = ({b, is, px, s, child = false, light, frame, p = {}, id, wob = 0, skin = '#f1cfae', blanket = true, dy = 0, longHair, shoulder}) => {
	const R = 36 * (child ? 1.08 : 1) * s;
	const hy = b.pillowY - 30 + dy;
	const hcx = px - 0.24 * R;
	const hcy = hy + 0.03 * R;
	const lw = 5.5 * s * 0.85;
	const farY = b.farY ?? b.quilt;
	const nearY = b.nearY ?? b.quilt + 60;
	const botY = b.botY ?? b.skirtTop;
	const xR = b.xR ?? b.x1;
	const Bs = R * (child ? 1 : 1.45); // body size
	// the neck leaves the chin and runs (lying down) toward the feet, into the blanket
	const neckY = hy + 0.86 * R;
	const xe = px + (child ? 0.67 : 0.8) * R + (shoulder ? 0.16 * R : 0); // the blanket's head end: just past the chin, so only a sliver of neck shows (a little more when the shoulder shows)
	const top0: [number, number] = [xe, neckY - 0.34 * R];
	const foot = xR - 40;
	const L = foot - xe;
	const contour: Array<[number, number]> = [
		top0,
		[xe + 0.05 * L, Math.min(neckY - 0.38 * R, farY - 0.12 * Bs)], // shoulder
		[xe + 0.15 * L, farY - 0.28 * Bs], // chest
		[xe + 0.36 * L, farY - 0.14 * Bs], // waist
		[xe + 0.6 * L, farY - 0.36 * Bs - wob], // knees
		[xe + 0.8 * L, farY - 0.13 * Bs], // shins
		[xe + 0.93 * L, farY - 0.3 * Bs], // feet
		[xR - 8, farY + 6],
	];
	const topLine = `M${top0[0]},${top0[1]}${smoothThrough(contour)}`;
	const headEdge = `L${xR},${nearY} L${xR},${botY - 16} Q${xR},${botY} ${xR - 18},${botY} L${xe - 0.1 * R},${botY} L${xe - 0.05 * R},${nearY} Z`;
	const topSurface = `${topLine} L${xR},${nearY} L${xe - 0.05 * R},${nearY} Z`;
	const front = `M${xe - 0.05 * R},${nearY} L${xR},${nearY} L${xR},${botY - 16} Q${xR},${botY} ${xR - 18},${botY} L${xe - 0.1 * R},${botY} Z`;
	const outline = `${topLine} ${headEdge}`;
	// the sheet turned down over the blanket at the head end
	const sw = 0.42 * R * (child ? 1 : 1.25);
	const yAt = (x: number) => {
		let best = contour[0];
		for (const c of contour) if (Math.abs(c[0] - x) < Math.abs(best[0] - x)) best = c;
		return best[1];
	};
	const sheetD = `M${top0[0]},${top0[1]} Q${xe + sw * 0.5},${top0[1] - 0.1 * R} ${xe + sw},${Math.min(yAt(xe + sw), top0[1]) + 2} L${xe + sw - 0.06 * R},${nearY} L${xe + sw - 0.1 * R},${botY} L${xe - 0.1 * R},${botY} L${xe - 0.05 * R},${nearY} Z`;
	// soft folds where the body lies
	const kx = xe + 0.6 * L;
	const folds = [
		`M${xe + 0.2 * L},${nearY - 4} Q${xe + 0.28 * L},${farY + 18} ${xe + 0.34 * L},${farY + 8}`,
		`M${kx - 0.08 * L},${nearY + 30} Q${kx - 0.02 * L},${nearY - 10} ${kx + 0.03 * L},${farY + 10}`,
		`M${kx + 0.1 * L},${nearY - 6} Q${kx + 0.16 * L},${farY + 22} ${kx + 0.22 * L},${farY + 12}`,
		`M${xe + 0.45 * L},${botY - 10} Q${xe + 0.5 * L},${nearY + 40} ${xe + 0.47 * L},${nearY + 6}`,
	];
	return (
		<g>
			<PillowDent cx={hcx} cy={hcy} R={R} />
			{longHair ? (
				<Tint light={light}>
					{/* long hair fanned out on the pillow, above and behind the head */}
					<path
						d={`M${hcx - 0.9 * R},${hcy + 0.55 * R} C${hcx - 1.45 * R},${hcy + 0.1 * R} ${hcx - 1.3 * R},${hcy - 0.85 * R} ${hcx - 0.55 * R},${hcy - 1.12 * R} C${hcx + 0.1 * R},${hcy - 1.35 * R} ${hcx + 0.9 * R},${hcy - 1.2 * R} ${hcx + 1.2 * R},${hcy - 0.7 * R} C${hcx + 1.32 * R},${hcy - 0.45 * R} ${hcx + 1.2 * R},${hcy - 0.15 * R} ${hcx + 1.0 * R},${hcy} Z`}
						fill={longHair}
						stroke={INK}
						strokeWidth={lw}
						strokeLinejoin="round"
					/>
				</Tint>
			) : null}
			{blanket ? (
				<Tint light={light}>
					<Neck a={[px + 0.05 * R, neckY - 0.04 * R]} b={[xe + 0.25 * R, neckY - 0.02 * R]} w={0.36 * R} skin={skin} lw={lw} />
				</Tint>
			) : null}
			{blanket && shoulder ? (
				<Tint light={light}>
					<path
						d={`M${px + 0.3 * R},${neckY + 0.32 * R} C${px + 0.4 * R},${neckY + 0.02 * R} ${xe - 0.25 * R},${neckY - 0.12 * R} ${xe + 0.2 * R},${neckY - 0.1 * R} L${xe + 0.2 * R},${neckY + 0.4 * R} Z`}
						fill={shoulder}
						stroke={INK}
						strokeWidth={lw}
						strokeLinejoin="round"
					/>
				</Tint>
			) : null}
			<PillowHead is={is} px={px} hy={hy} s={s} child={child} frame={frame} p={p} light={light} />
			{blanket ? (
				<g>
					<path d={topSurface} fill={b.topCol ?? b.quiltCols[0]} />
					<path d={front} fill={b.frontCol ?? b.quiltCols[2]} />
					<path d={`M${xe - 0.05 * R},${nearY} L${xR},${nearY}`} stroke={INK} strokeWidth={3} opacity={0.55} />
					{folds.map((d, i) => (
						<path key={i} d={d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.3} />
					))}
					<path d={sheetD} fill={b.sheet ?? '#d8d4cc'} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
					<path d={`M${xe + 0.25 * sw},${top0[1] + 0.25 * R} Q${xe + 0.35 * sw},${nearY - 10} ${xe + 0.3 * sw},${botY - 12}`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.3} />
					<path d={outline} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			) : null}
		</g>
	);
};

/** Her parents' double bed (plate master_night: the quilt painted pulled up to the pillows over the two of them): their
 *  heads on the pillows (pillows dented), short necks going under the sheet turned down along the quilt's top edge, the
 *  shape of Mom's body raising the quilt along the back and a soft ridge where Lily lies in front. */
export const ParentsBed: React.FC<{
	frame: number;
	mom: AnyPerson;
	lily: AnyPerson;
	momP?: Record<string, unknown>;
	lilyP?: Record<string, unknown>;
	momSkin?: string;
	lilySkin?: string;
	light?: Light;
}> = ({frame, mom, lily, momP = {}, lilyP = {}, momSkin = '#f0c9a6', lilySkin = '#f1cfae', light}) => {
	const QUILT = '#a58765';
	const SHEET = '#bda07b'; // the quilt turned over at its top edge, a shade lighter
	const [mx, my] = PARENTS_BED.mom;
	const [lx, ly] = PARENTS_BED.lily;
	const mR = 36 * 1.3;
	const lR = 36 * 1.08 * 1.6;
	// the quilt's painted top edge near the pillows, front-left to back-right
	const edge: Array<[number, number]> = [
		[430, 716],
		[520, 686],
		[600, 663],
		[700, 650],
		[820, 642],
	];
	const sheetTop = edge.map(([x, y]) => [x, y - 7] as [number, number]);
	const sheetBot = [...edge].reverse().map(([x, y]) => [x, y + 12] as [number, number]);
	const sheetD = `M${sheetTop[0][0]},${sheetTop[0][1]}${smoothThrough(sheetTop)} L${sheetBot[0][0]},${sheetBot[0][1]}${smoothThrough(sheetBot)} Z`;
	// Mom's body under the quilt along the back edge: shoulder, chest, hips, knees, feet
	const back: Array<[number, number]> = [
		[800, 648],
		[880, 628],
		[980, 630],
		[1080, 640],
		[1170, 624],
		[1260, 640],
		[1340, 646],
		[1400, 676],
	];
	const backD = `M${back[0][0]},${back[0][1]}${smoothThrough(back)} L1400,690 L800,662 Z`;
	return (
		<g>
			<PillowDent cx={mx - 0.24 * mR} cy={my} R={mR} />
			<PillowDent cx={lx - 0.24 * lR} cy={ly} R={lR} />
			<path d={backD} fill={QUILT} />
			<path d={`M${back[0][0]},${back[0][1]}${smoothThrough(back)}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
			{/* a soft ridge where Lily lies, nearer to us */}
			<path d="M560,724 C700,706 900,700 1080,708 C1200,712 1300,724 1380,744" fill="none" stroke="#c9a983" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
			<path d="M560,732 C700,716 900,710 1080,718 C1200,722 1300,734 1380,754" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.3} />
			<Tint light={light}>
				<Neck a={[mx + 0.05 * mR, my + 0.84 * mR]} b={[mx + 0.62 * mR, my + 1.18 * mR]} w={0.36 * mR} skin={momSkin} lw={6} />
			</Tint>
			<PillowHead is={mom} px={mx} hy={my} s={1.3} child={false} frame={frame} p={momP} light={light} />
			<Tint light={light}>
				<Neck a={[lx + 0.05 * lR, ly + 0.84 * lR]} b={[lx + 0.55 * lR, ly + 1.12 * lR]} w={0.36 * lR} skin={lilySkin} lw={7} />
			</Tint>
			<PillowHead is={lily} px={lx} hy={ly} s={1.6} child frame={frame} p={lilyP} light={light} />
			{/* the sheet turned down along the quilt's top edge, over both necks */}
			<path d={sheetD} fill={SHEET} />
			<path d={`M${sheetTop[0][0]},${sheetTop[0][1]}${smoothThrough(sheetTop)}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
			<path d={`M${sheetBot[sheetBot.length - 1][0]},${sheetBot[sheetBot.length - 1][1]}${smoothThrough([...sheetBot].reverse())}`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
		</g>
	);
};
/** where the faces rest in the parents' bed (pillow-centre x, head-centre y) and its nightstand clock */
export const PARENTS_BED = {mom: [701, 585] as [number, number], lily: [455, 627] as [number, number], clock: [205, 745] as [number, number]};

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
