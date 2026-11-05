// Extra interiors: <Washroom/>, <StorageRoom/> (search montage) and <RoomBackdrop/>,
// a generic dimensional backdrop for character close-ups. All one-point
// perspective (kit.tsx Cam3), gradient-shaded, calm hand-drawn outlines.
import React from 'react';
import {h01} from '../../utils/rough';
import {Box3, INK, P3, ShadeDefs, lampOf, makeInk, qd, shade, shadeUrls, tone, useUid, type Cam3, type Lights, type Pt} from './kit';
import {OceanNight} from './Outdoor';

/** A flashlight beam in screen space: from the lamp to a lit spot. */
export interface Beam {
	from: Pt;
	to: Pt;
	/** radius of the lit spot (px), default 150 */
	spread?: number;
	/** 0..1, default 1 */
	strength?: number;
}

export const BeamFx: React.FC<{id: string; b: Beam}> = ({id, b}) => {
	const r = b.spread ?? 150;
	const k = b.strength ?? 1;
	const dx = b.to[0] - b.from[0];
	const dy = b.to[1] - b.from[1];
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const cone: Pt[] = [
		[b.from[0] + nx * 8, b.from[1] + ny * 8],
		[b.to[0] + nx * r, b.to[1] + ny * r],
		[b.to[0] - nx * r, b.to[1] - ny * r],
		[b.from[0] - nx * 8, b.from[1] - ny * 8],
	];
	return (
		<g>
			<defs>
				<linearGradient id={`${id}bm`} gradientUnits="userSpaceOnUse" x1={b.from[0]} y1={b.from[1]} x2={b.to[0]} y2={b.to[1]}>
					<stop offset="0" stopColor="#fff6c8" stopOpacity={0.42 * k} />
					<stop offset="1" stopColor="#fff6c8" stopOpacity={0.05 * k} />
				</linearGradient>
				<radialGradient id={`${id}bs`}>
					<stop offset="0" stopColor="#fff8d8" stopOpacity={0.55 * k} />
					<stop offset="0.6" stopColor="#fff2c0" stopOpacity={0.22 * k} />
					<stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
				</radialGradient>
			</defs>
			<path d={qd(cone)} fill={`url(#${id}bm)`} />
			<ellipse cx={b.to[0]} cy={b.to[1]} rx={r * 1.15} ry={r * 0.9} fill={`url(#${id}bs)`} />
		</g>
	);
};

/** Stand-alone flashlight beam + lit spot (screen coordinates), for shots that
 *  light up a set that has no `beam` prop. Draw it before the crew member. */
export const FlashlightBeam: React.FC<Beam> = (b) => {
	const id = useUid('fl');
	return <BeamFx id={id} b={b} />;
};

const lineSet = (c: Cam3, segs: Array<[[number, number, number], [number, number, number]]>): string =>
	segs
		.map(([a, b]) => {
			const p = P3(c, a[0], a[1], a[2]);
			const q = P3(c, b[0], b[1], b[2]);
			return `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`;
		})
		.join('');

const q3 = (c: Cam3, pts: Array<[number, number, number]>) => qd(pts.map(([X, H, Z]) => P3(c, X, H, Z)));

/* ================================================================ washroom */

/** Ferry passenger WC, one-point perspective: tiled walls/floor, a row of stall
 *  doors on the left (`openDoor` index swings open by `open` 0..1), sinks + mirrors
 *  on the right, flickering fluorescent tubes, optional flashlight `beam`.
 *  Floor at the near edge is y ~1080; a standing figure at s ~1 fits at y 980-1040. */
export const Washroom: React.FC<{
	f: number;
	lights?: Lights;
	/** fluorescent flicker (default true) */
	flicker?: boolean;
	openDoor?: number;
	open?: number;
	beam?: Beam;
	children?: React.ReactNode;
}> = ({f, lights = 'dim', flicker = true, openDoor = 1, open = 1, beam, children}) => {
	const uid = useUid('wc');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 2100);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const lamp = lampOf(L, '#eef7ff');
	const c: Cam3 = {vx: 960, vy: 470, F: 1000, eye: 560};
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const Wl = -900;
	const Wr = 720;
	const Hc = 1000;
	const Zn = 420;
	const Zb = 3300;
	const front = -560; // plane of the stall doors
	const tile = T('#c9d3d6');
	const tileD = T('#aeb9bd');
	const floorA = T('#6d7479');
	const floorB = T('#596066');
	// tubes: which are lit this frame
	const tubes = [1000, 1700, 2400, 3000];
	const on = tubes.map((_, i) => {
		if (L === 'off') return false;
		if (!flicker) return true;
		if (i === 1) return h01(Math.floor(f / 2), 77) > 0.28 && h01(Math.floor(f / 7), 78) > 0.15;
		if (i === 3) return h01(Math.floor(f / 3), 79) > 0.5;
		return h01(Math.floor(f / 11), 80 + i) > 0.06;
	});
	const litFrac = on.filter(Boolean).length / tubes.length;

	// tile grids
	const wallLines: Array<[[number, number, number], [number, number, number]]> = [];
	for (let H = 120; H < Hc; H += 120) {
		wallLines.push([[Wr, H, Zn], [Wr, H, Zb]], [[Wl, H, Zn], [Wl, H, Zb]], [[Wl, H, Zb], [Wr, H, Zb]]);
	}
	for (let Z = 600; Z < Zb; Z += 160) {
		wallLines.push([[Wr, 0, Z], [Wr, Hc, Z]]);
	}
	for (let X = Wl + 160; X < Wr; X += 160) wallLines.push([[X, 0, Zb], [X, Hc, Zb]]);
	const checker: string[] = [];
	const fl: Array<[[number, number, number], [number, number, number]]> = [];
	const fx0 = front;
	const tsz = 140;
	for (let i = 0; i * tsz + fx0 < Wr; i++) {
		for (let j = 0; Zn + j * tsz < Zb; j++) {
			if ((i + j) % 2) continue;
			const X0 = fx0 + i * tsz;
			const Z0 = Zn + j * tsz;
			checker.push(q3(c, [[X0, 0, Z0], [X0 + tsz, 0, Z0], [X0 + tsz, 0, Z0 + tsz], [X0, 0, Z0 + tsz]]));
		}
	}
	for (let X = fx0; X <= Wr; X += tsz) fl.push([[X, 0, Zn], [X, 0, Zb]]);

	// stalls
	const stalls = [900, 1350, 1800, 2250, 2700];
	const sd = 400;
	const theta = (Math.min(1, Math.max(0, open)) * Math.PI) / 2 * 0.92;
	const stallEls: React.ReactNode[] = [];
	stalls.forEach((Z0, i) => {
		const za = Z0 + 25;
		const zb = Z0 + sd - 25;
		// pilaster (between doors)
		stallEls.push(<path key={`pl${i}`} d={ink.poly([p(front, 920, Z0 - 25), p(front, 920, za), p(front, 0, za), p(front, 0, Z0 - 25)], 10 + i, 0.6)} fill={T('#7c8e9a')} stroke={INK} strokeWidth={Math.max(1.5, 3.4 * (1000 / Z0))} />);
		if (i === openDoor) return;
		const door = [p(front, 900, za), p(front, 900, zb), p(front, 70, zb), p(front, 70, za)];
		stallEls.push(<path key={`dr${i}`} d={ink.poly(door, 20 + i, 0.7)} fill={T('#5f7f94')} stroke={INK} strokeWidth={Math.max(1.5, 4 * (1000 / Z0))} />);
		stallEls.push(<path key={`ds${i}`} d={qd(door)} fill={S.rt} fillOpacity={0.3} />);
		const lk = p(front, 470, zb - 50);
		stallEls.push(<circle key={`lk${i}`} cx={lk[0]} cy={lk[1]} r={Math.max(2, 9 * (1000 / Z0))} fill={T('#c94a3a')} stroke={INK} strokeWidth={1.5} />);
	});
	// the open stall: interior first, then its swinging door
	const oz = stalls[openDoor];
	const hingeZ = (oz ?? 0) + sd - 25;
	const dw = sd - 50;
	const doorTip: [number, number] = [front - Math.sin(theta) * dw * 0.95, hingeZ - Math.cos(theta) * dw];
	const openDoorPts = [p(front, 900, hingeZ), p(doorTip[0], 900, doorTip[1]), p(doorTip[0], 70, doorTip[1]), p(front, 70, hingeZ)];
	const interior: React.ReactNode[] = [];
	if (oz !== undefined) {
		const za = oz + 25;
		const zb = oz + sd - 25;
		interior.push(<path key="in" d={q3(c, [[front, 920, za], [front, 920, zb], [front, 0, zb], [front, 0, za]])} fill={T('#24292e')} />);
		interior.push(<path key="ipw" d={q3(c, [[Wl, 920, oz + sd], [front, 920, oz + sd], [front, 0, oz + sd], [Wl, 0, oz + sd]])} fill={T('#6f818d')} stroke={INK} strokeWidth={3} />);
		interior.push(<path key="ipws" d={q3(c, [[Wl, 920, oz + sd], [front, 920, oz + sd], [front, 0, oz + sd], [Wl, 0, oz + sd]])} fill={S.dn} fillOpacity={0.6} />);
		interior.push(<path key="odr" d={ink.poly(openDoorPts, 91, 0.8)} fill={T('#6b8ca2')} stroke={INK} strokeWidth={4} />, <path key="odrs" d={qd(openDoorPts)} fill={S.dn} fillOpacity={0.5} />);
		interior.push(
			<Box3 key="cis" ink={ink} k0={40} c={c} b={{X0: Wl, X1: Wl + 120, H0: 420, H1: 640, Z0: oz + 150, Z1: oz + 300, fill: T('#e9eef0'), sw: 3}} />,
			<Box3 key="bowl" ink={ink} k0={46} c={c} b={{X0: Wl, X1: Wl + 300, H0: 0, H1: 330, Z0: oz + 170, Z1: oz + 280, fill: T('#f2f5f6'), top: T('#d7dee2'), sw: 3}} />,
		);
		const seat = [p(Wl + 290, 336, oz + 165), p(Wl + 290, 336, oz + 285), p(Wl + 60, 336, oz + 285), p(Wl + 60, 336, oz + 165)];
		interior.push(<path key="st" d={ink.poly(seat, 48, 0.6)} fill={T('#ffffff')} stroke={INK} strokeWidth={3} />);
		interior.push(<path key="dark" d={q3(c, [[front, 920, za], [front, 920, zb], [front, 0, zb], [front, 0, za]])} fill={S.lt} fillOpacity={0.8} />);
	}

	// sinks / counter / mirrors on the right wall
	const sinks = [1050, 1500, 1950, 2400];
	const tubeEls = tubes.map((Z, i) => (
		<g key={`tb${i}`}>
			{on[i] ? <ellipse cx={960} cy={p(0, Hc, Z + 60)[1] + 30 * (1000 / Z)} rx={700 * (1000 / Z)} ry={260 * (1000 / Z)} fill={S.gl} /> : null}
			<Box3 ink={ink} k0={60 + i * 6} c={c} b={{X0: -70, X1: 70, H0: Hc - 30, H1: Hc, Z0: Z, Z1: Z + 240, fill: T('#d9dde0'), bottom: on[i] ? '#f6fbff' : T('#4d5358'), sw: 2.5}} />
			{on[i] ? <ellipse cx={960} cy={p(0, Hc - 30, Z + 120)[1]} rx={200 * (1000 / Z)} ry={70 * (1000 / Z)} fill="#f6fbff" fillOpacity={0.25} /> : null}
		</g>
	));
	const floorPools = tubes.map((Z, i) =>
		on[i] ? <ellipse key={`fp${i}`} cx={960} cy={p(0, 0, Z + 120)[1]} rx={900 * (1000 / Z)} ry={170 * (1000 / Z)} fill={S.gl} fillOpacity={0.7} /> : null,
	);

	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#2a3036')} />
			{/* ceiling, floor, walls */}
			<path d={q3(c, [[Wl, Hc, Zn], [Wr, Hc, Zn], [Wr, Hc, Zb], [Wl, Hc, Zb]])} fill={T('#b8c0c4')} />
			<path d={q3(c, [[Wl, Hc, Zn], [Wr, Hc, Zn], [Wr, Hc, Zb], [Wl, Hc, Zb]])} fill={S.up} fillOpacity={0.6} />
			<path d={q3(c, [[Wl, 0, Zn], [Wr, 0, Zn], [Wr, 0, Zb], [Wl, 0, Zb]])} fill={floorA} />
			<path d={checker.join('')} fill={floorB} />
			<path d={lineSet(c, fl)} stroke="#000" strokeWidth={1.5} strokeOpacity={0.2} fill="none" />
			{floorPools}
			<path d={q3(c, [[Wl, 0, Zn], [Wr, 0, Zn], [Wr, 0, Zb], [Wl, 0, Zb]])} fill={S.dn} fillOpacity={0.6} />
			<path d={q3(c, [[Wl, Hc, Zn], [Wl, Hc, Zb], [Wl, 0, Zb], [Wl, 0, Zn]])} fill={tileD} />
			<path d={q3(c, [[Wr, Hc, Zn], [Wr, Hc, Zb], [Wr, 0, Zb], [Wr, 0, Zn]])} fill={tile} />
			<path d={q3(c, [[Wr, Hc, Zn], [Wr, Hc, Zb], [Wr, 0, Zb], [Wr, 0, Zn]])} fill={S.lt} fillOpacity={0.35} />
			<path d={q3(c, [[Wl, Hc, Zb], [Wr, Hc, Zb], [Wr, 0, Zb], [Wl, 0, Zb]])} fill={shade(tile, -0.05)} stroke={INK} strokeWidth={3} />
			<path d={q3(c, [[Wl, Hc, Zb], [Wr, Hc, Zb], [Wr, 0, Zb], [Wl, 0, Zb]])} fill={S.dn} fillOpacity={0.4} />
			<path d={lineSet(c, wallLines)} stroke="#000" strokeWidth={1.5} strokeOpacity={0.16} fill="none" />
			{/* wall-floor / wall-ceiling AO */}
			<path d={q3(c, [[Wr, 0, Zn], [Wr, 0, Zb], [Wr, 90, Zb], [Wr, 90, Zn]])} fill="#000" fillOpacity={0.18} />
			<path d={q3(c, [[Wr, Hc, Zn], [Wr, Hc, Zb], [Wr, Hc - 70, Zb], [Wr, Hc - 70, Zn]])} fill="#000" fillOpacity={0.14} />
			{/* small frosted window on the back wall */}
			<path d={ink.poly([p(-150, 900, Zb), p(150, 900, Zb), p(150, 760, Zb), p(-150, 760, Zb)], 5, 0.6)} fill={T('#33465a')} stroke={INK} strokeWidth={3} />
			{/* mirrors + counter + sinks */}
			<path d={ink.poly([p(Wr, 900, 950), p(Wr, 900, 2650), p(Wr, 560, 2650), p(Wr, 560, 950)], 6, 0.8)} fill={T('#7d97a8')} stroke={INK} strokeWidth={5} />
			<path d={q3(c, [[Wr, 900, 950], [Wr, 900, 2650], [Wr, 560, 2650], [Wr, 560, 950]])} fill={S.sp} />
			<path d={lineSet(c, [[[Wr, 880, 1300], [Wr, 600, 1150]], [[Wr, 880, 2000], [Wr, 600, 1850]]])} stroke="#fff" strokeWidth={6} strokeOpacity={0.18} fill="none" />
			<Box3 ink={ink} k0={70} c={c} b={{X0: 470, X1: Wr, H0: 0, H1: 380, Z0: 900, Z1: 2700, fill: T('#7c8e9a'), sw: 4, sideShade: S.dn}} />
			<Box3 ink={ink} k0={76} c={c} b={{X0: 440, X1: Wr, H0: 380, H1: 430, Z0: 880, Z1: 2720, fill: T('#d9dee2'), top: T('#eef1f3'), sw: 4}} />
			{sinks.map((Z, i) => {
				const pts: Pt[] = Array.from({length: 10}, (_, k) => {
					const a = (k / 10) * Math.PI * 2;
					return p(585 + Math.cos(a) * 85, 430, Z + Math.sin(a) * 120);
				});
				const tap = p(680, 430, Z);
				const tapT = p(680, 500, Z);
				const sp = Math.max(2, 10 * (1000 / Z));
				return (
					<g key={`sk${i}`}>
						<path d={ink.curve(pts, 80 + i, 0.5, true)} fill={T('#9aa7ae')} stroke={INK} strokeWidth={3} />
						<path d={ink.curve(pts.map(([x, y]) => [x + (960 - x) * 0.02, y + 3] as Pt), 84 + i, 0.4, true)} fill={T('#5d6a71')} fillOpacity={0.6} />
						<path d={`M${tap[0]},${tap[1]}L${tapT[0]},${tapT[1]}L${tapT[0] - sp * 2},${tapT[1]}`} stroke={INK} strokeWidth={sp + 3} fill="none" strokeLinecap="round" />
						<path d={`M${tap[0]},${tap[1]}L${tapT[0]},${tapT[1]}L${tapT[0] - sp * 2},${tapT[1]}`} stroke={T('#c9ced5')} strokeWidth={sp} fill="none" strokeLinecap="round" />
					</g>
				);
			})}
			{/* stall row: interior of the open stall, pilasters + doors, head rail */}
			{interior}
			{stallEls}
			{/* end panel of the stall row (faces the camera) */}
			<Box3 ink={ink} k0={95} c={c} b={{X0: Wl, X1: front + 12, H0: 70, H1: 920, Z0: stalls[0] - 40, Z1: stalls[0] - 20, fill: T('#7c8e9a'), sw: 4, nearShade: S.dn}} />
			<path d={ink.rect(p(Wl, 0, stalls[0] - 40)[0], p(0, 920, stalls[0] - 40)[1], p(front, 0, stalls[0] - 40)[0] - p(Wl, 0, stalls[0] - 40)[0], 26, 96, 0.5)} fill={T('#c9ced5')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([p(front, 930, 860), p(front, 930, stalls[stalls.length - 1] + sd), p(front, 910, stalls[stalls.length - 1] + sd), p(front, 910, 860)], 90, 0.6)} fill={T('#c9ced5')} stroke={INK} strokeWidth={3} />
			{tubeEls}
			{/* overall flicker: the room dims as tubes drop out */}
			<rect x={-200} y={-200} width={2320} height={1500} fill="#000" fillOpacity={(1 - litFrac) * 0.35} />
			{beam ? <BeamFx id={uid} b={beam} /> : null}
			{children}
		</g>
	);
};

/* ============================================================ storage room */

/** Crew storage room: deep shelving with boxes, life jackets and rope, pipes on
 *  the ceiling and one swinging bulb (its light pool swings with it).
 *  `swing` scales the bulb's swing (default 1). Optional flashlight `beam`. */
export const StorageRoom: React.FC<{f: number; lights?: Lights; swing?: number; beam?: Beam; children?: React.ReactNode}> = ({f, lights = 'dim', swing = 1, beam, children}) => {
	const uid = useUid('sto');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 2300);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const bulbC = lampOf(L, '#ffd98a');
	const c: Cam3 = {vx: 960, vy: 480, F: 1000, eye: 560};
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const W = 680;
	const Hc = 980;
	const Zn = 420;
	const Zb = 2900;
	const ang = Math.sin(f / 15) * 0.32 * swing;
	const cordL = 330;
	const bZ = 1500;
	const bX = Math.sin(ang) * cordL;
	const bH = Hc - Math.cos(ang) * cordL;
	const bulb = p(bX, bH, bZ);
	const top = p(0, Hc, bZ);
	const lit = L !== 'off';
	const shelves: React.ReactNode[] = [];
	const boxCols = ['#b88a5a', '#a87a4a', '#c79a66', '#9a7044'];
	for (const sd of [-1, 1]) {
		const Xo = sd * W;
		const Xi = sd * (W - 300);
		const X0 = Math.min(Xo, Xi);
		const X1 = Math.max(Xo, Xi);
		const units = [[700, 1350], [1450, 2100], [2200, 2800]];
		units.forEach(([z0, z1], u) => {
			const k0 = 100 + u * 50 + (sd > 0 ? 500 : 0);
			const items: Array<{Z: number; node: React.ReactNode}> = [];
			// boards
			[100, 360, 620, 860].forEach((H, b) => {
				items.push({Z: z1 + 1, node: <Box3 key={`bd${b}`} ink={ink} k0={k0 + b * 3} c={c} b={{X0, X1, H0: H - 14, H1: H, Z0: z0, Z1: z1, fill: T('#6b6f74'), sw: 2.5, open: false}} />});
				// stuff on the board
				let z = z0 + 20;
				let n = 0;
				while (z < z1 - 80 && n < 5) {
					const r = h01(u * 31 + b * 7 + n, sd * 3 + 11);
					const len = 120 + r * 170;
					const hgt = 90 + h01(n, b, u + sd) * 120;
					const kind = h01(n + b * 5, u * 9 + sd * 2) ;
					const inset = 20 + h01(n, u, b) * 50;
					const XA = sd < 0 ? X0 + 10 : X0 + inset;
					const XB = sd < 0 ? X1 - inset : X1 - 10;
					if (kind < 0.25 && b < 3) {
						// life jackets (orange, stacked)
						items.push({Z: z, node: <Box3 key={`lj${b}${n}`} ink={ink} k0={k0 + 20 + b * 7 + n} c={c} b={{X0: XA, X1: XB, H0: H, H1: H + Math.min(hgt, 150), Z0: z, Z1: z + len, fill: T('#e8742a'), sw: 2.5, nearShade: S.dn}} />});
					} else if (kind < 0.4 && b < 2) {
						// rope coil (seen as stacked ellipses)
						const cz = z + len / 2;
						const cx = (XA + XB) / 2;
						items.push({
							Z: z,
							node: (
								<g key={`rp${b}${n}`}>
									{[0, 1, 2].map((k) => {
										const pts: Pt[] = Array.from({length: 10}, (_, j) => {
											const a = (j / 10) * Math.PI * 2;
											return p(cx + Math.cos(a) * 95, H + 18 + k * 22, cz + Math.sin(a) * Math.min(95, len / 2));
										});
										return <path key={k} d={ink.curve(pts, k0 + 40 + k + n, 0.6, true)} fill="none" stroke={T('#c2a46c')} strokeWidth={Math.max(2, 14 * (1000 / cz))} />;
									})}
								</g>
							),
						});
					} else {
						const col = boxCols[Math.floor(kind * 40) % boxCols.length];
						items.push({Z: z, node: <Box3 key={`bx${b}${n}`} ink={ink} k0={k0 + 60 + b * 7 + n} c={c} b={{X0: XA, X1: XB, H0: H, H1: H + hgt, Z0: z, Z1: z + len, fill: T(col), sw: 2.5}} />});
					}
					z += len + 25 + h01(n, b, 5) * 60;
					n++;
				}
			});
			// posts
			for (const zz of [z0, z1]) {
				items.push({Z: zz - 1, node: <Box3 key={`ps${zz}`} ink={ink} k0={k0 + 90 + (zz === z0 ? 0 : 1)} c={c} b={{X0: Xi - 12, X1: Xi + 12, H0: 0, H1: 900, Z0: zz - 12, Z1: zz + 12, fill: T('#56595e'), sw: 2.5}} />});
			}
			items.sort((a, b) => b.Z - a.Z);
			shelves.push(<g key={`u${sd}${u}`}>{items.map((it) => it.node)}</g>);
		});
	}
	// draw far units first (they were pushed near->far per side, interleave by Z)
	const pipes = [-260, -150, 180].map((X, i) => {
		const r = 34 - i * 8;
		const H = Hc - 40 - i * 15;
		const pts = [p(X, H + r, Zn), p(X, H + r, Zb), p(X, H - r, Zb), p(X, H - r, Zn)];
		const hi = [p(X, H + r * 0.5, Zn), p(X, H + r * 0.5, Zb), p(X, H + r * 0.15, Zb), p(X, H + r * 0.15, Zn)];
		return (
			<g key={`pp${i}`}>
				<path d={ink.poly(pts, 300 + i, 0.6)} fill={T(['#6b7480', '#8a5a3a', '#5a6a5a'][i])} stroke={INK} strokeWidth={3} />
				<path d={qd(hi)} fill="#fff" fillOpacity={0.2} />
			</g>
		);
	});
	const pool = p(bX * 1.6, 0, bZ);
	const ordered = [...shelves].reverse();
	return (
		<g>
			<ShadeDefs id={uid} glow={bulbC} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#1d1f22')} />
			<path d={q3(c, [[-W, Hc, Zn], [W, Hc, Zn], [W, Hc, Zb], [-W, Hc, Zb]])} fill={T('#4a4e54')} />
			<path d={q3(c, [[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]])} fill={T('#4c4f53')} />
			<path
				d={lineSet(c, [
					...Array.from({length: 9}, (_, i) => [[-W + i * 170, 0, Zn], [-W + i * 170, 0, Zb]] as [[number, number, number], [number, number, number]]),
					...Array.from({length: 10}, (_, i) => [[-W, 0, 600 + i * 250], [W, 0, 600 + i * 250]] as [[number, number, number], [number, number, number]]),
				])}
				stroke="#000"
				strokeWidth={1.5}
				strokeOpacity={0.25}
				fill="none"
			/>
			{lit ? <ellipse cx={pool[0]} cy={pool[1]} rx={620} ry={150} fill={S.gl} /> : null}
			<path d={q3(c, [[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]])} fill={S.dn} fillOpacity={0.65} />
			{[-1, 1].map((sd) => (
				<g key={`w${sd}`}>
					<path d={q3(c, [[sd * W, Hc, Zn], [sd * W, Hc, Zb], [sd * W, 0, Zb], [sd * W, 0, Zn]])} fill={T('#6a6f76')} />
					<path d={q3(c, [[sd * W, Hc, Zn], [sd * W, Hc, Zb], [sd * W, 0, Zb], [sd * W, 0, Zn]])} fill={sd < 0 ? S.rt : S.lt} fillOpacity={0.4} />
				</g>
			))}
			<path d={q3(c, [[-W, Hc, Zb], [W, Hc, Zb], [W, 0, Zb], [-W, 0, Zb]])} fill={T('#5d6168')} stroke={INK} strokeWidth={3} />
			<Box3 ink={ink} k0={10} c={c} b={{X0: -170, X1: 170, H0: 0, H1: 720, Z0: Zb - 10, Z1: Zb, fill: T('#7b828b'), sw: 3, nearShade: S.dn}} />
			<path d={q3(c, [[-W, Hc, Zb], [W, Hc, Zb], [W, 0, Zb], [-W, 0, Zb]])} fill={S.dn} fillOpacity={0.4} />
			{ordered}
			{/* a few crates + coil on the floor */}
			<ellipse cx={p(250, 0, 1150)[0]} cy={p(250, 0, 1150)[1]} rx={180} ry={30} fill={S.sh} />
			<Box3 ink={ink} k0={20} c={c} b={{X0: 120, X1: 360, H0: 0, H1: 200, Z0: 1050, Z1: 1260, fill: T('#8a6a3e'), sw: 3, nearShade: S.dn}} />
			<Box3 ink={ink} k0={26} c={c} b={{X0: 150, X1: 330, H0: 200, H1: 330, Z0: 1080, Z1: 1230, fill: T('#a07a48'), sw: 3}} />
			{pipes}
			{/* the swinging bulb */}
			<path d={`M${top[0]},${top[1]}L${bulb[0]},${bulb[1]}`} stroke={INK} strokeWidth={3} />
			{lit ? <ellipse cx={bulb[0]} cy={bulb[1] + 60} rx={560} ry={460} fill={S.gl} /> : null}
			{lit ? <path d={qd([[bulb[0] - 14, bulb[1]], [bulb[0] + 14, bulb[1]], [pool[0] + 520, pool[1]], [pool[0] - 520, pool[1]]])} fill={S.cone} fillOpacity={0.35} /> : null}
			<path d={ink.rect(bulb[0] - 7, bulb[1] - 16, 14, 14, 30, 0.4)} fill="#333" stroke={INK} strokeWidth={2} />
			<path d={ink.ellipse(bulb[0], bulb[1] + 10, 13, 16, 31, 0.5, 9)} fill={lit ? bulbC : '#444'} stroke={INK} strokeWidth={3} />
			{beam ? <BeamFx id={uid} b={beam} /> : null}
			{children}
		</g>
	);
};

/* ============================================================ room backdrop */

export type RoomVariant = 'cabin' | 'crew' | 'police' | 'bridge' | 'dark';

/**
 * Generic dimensional backdrop for character close-ups / medium shots: back wall
 * and floor in one-point perspective, light falloff, a few props per variant.
 * Covers stage coords -260..2180 x -260..1340 (safe for Cam pushes / rocking).
 *
 * Props:
 *  - f        frame (line boil, small animations)
 *  - variant  'cabin' (passenger cabin wall: windows on the night sea, seat backs)
 *             'crew' (crew room: lockers, notice board, clock, warm lamp)
 *             'police' (station room: blinds, filing cabinet, cold light)
 *             'bridge' (night bridge: windows + glowing console)
 *             'dark' (black steel wall, one caged lamp)
 *  - lights   'on' | 'dim' | 'off' | 'red' (re-lights the whole set)
 *  - horizon  eye level / vanishing point y (default 520)
 *  - haze     0..1 depth fade toward the ambient colour so the character pops (default 0.22)
 *  - calm     0..1 still sea in the windows (cabin/bridge)
 * Usage: <Closeup ... bg={<RoomBackdrop f={f} variant="cabin" />} /> or as the first child of a Stage.
 */
export const RoomBackdrop: React.FC<{f: number; variant?: RoomVariant; lights?: Lights; horizon?: number; haze?: number; calm?: number}> = ({
	f,
	variant = 'cabin',
	lights = 'on',
	horizon = 520,
	haze = 0.22,
	calm = 0,
}) => {
	const uid = useUid('rbd');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 2600);
	const L = variant === 'bridge' && lights === 'on' ? 'dim' : lights;
	const T = (cc: string) => tone(cc, L);
	const pal = {
		cabin: {wall: '#8a96a6', floor: '#3b4252', ceil: '#c3c9d1', lamp: '#fff3cf', amb: '#7f8b9c'},
		crew: {wall: '#8f8a7c', floor: '#5a4e42', ceil: '#b8b2a4', lamp: '#ffd9a0', amb: '#5f5a50'},
		police: {wall: '#9aa6a8', floor: '#4a5052', ceil: '#d4dadb', lamp: '#eaf6ff', amb: '#7c888a'},
		bridge: {wall: '#2b313c', floor: '#1d2129', ceil: '#232832', lamp: '#7fd7ff', amb: '#161b24'},
		dark: {wall: '#2a2e33', floor: '#15171a', ceil: '#202327', lamp: '#ffe6b0', amb: '#0b0d10'},
	}[variant];
	const lamp = lampOf(L, pal.lamp);
	const c: Cam3 = {vx: 960, vy: horizon, F: 1000, eye: 560};
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const Zb = 2000;
	const Wx = 1500;
	const Hc = 1150;
	const Zn = 300;
	const els: React.ReactNode[] = [];
	const backQ = q3(c, [[-Wx, Hc, Zb], [Wx, Hc, Zb], [Wx, 0, Zb], [-Wx, 0, Zb]]);
	// shell
	els.push(<rect key="bg" x={-300} y={-300} width={2520} height={1700} fill={T(shade(pal.wall, -0.25))} />);
	els.push(<path key="ceil" d={q3(c, [[-Wx, Hc, Zn], [Wx, Hc, Zn], [Wx, Hc, Zb], [-Wx, Hc, Zb]])} fill={T(pal.ceil)} />);
	els.push(<path key="ceilS" d={q3(c, [[-Wx, Hc, Zn], [Wx, Hc, Zn], [Wx, Hc, 900], [-Wx, Hc, 900]])} fill="#000" fillOpacity={0.18} />);
	els.push(<path key="floor" d={q3(c, [[-Wx, 0, Zn], [Wx, 0, Zn], [Wx, 0, Zb], [-Wx, 0, Zb]])} fill={T(pal.floor)} />);
	const fl: Array<[[number, number, number], [number, number, number]]> = [];
	for (let X = -Wx; X <= Wx; X += 200) fl.push([[X, 0, Zn], [X, 0, Zb]]);
	for (let Z = 500; Z < Zb; Z += 260) fl.push([[-Wx, 0, Z], [Wx, 0, Z]]);
	els.push(<path key="fl" d={lineSet(c, fl)} stroke="#000" strokeWidth={2} strokeOpacity={0.18} fill="none" />);
	els.push(<path key="floorS" d={q3(c, [[-Wx, 0, Zn], [Wx, 0, Zn], [Wx, 0, 900], [-Wx, 0, 900]])} fill="#000" fillOpacity={0.25} />);
	for (const sd of [-1, 1]) {
		els.push(<path key={`sw${sd}`} d={q3(c, [[sd * Wx, Hc, Zn], [sd * Wx, Hc, Zb], [sd * Wx, 0, Zb], [sd * Wx, 0, Zn]])} fill={T(shade(pal.wall, -0.12))} />);
		els.push(<path key={`sws${sd}`} d={q3(c, [[sd * Wx, Hc, Zn], [sd * Wx, Hc, 1100], [sd * Wx, 0, 1100], [sd * Wx, 0, Zn]])} fill="#000" fillOpacity={0.18} />);
	}
	els.push(<path key="back" d={ink.poly(quadPts(c, -Wx, Wx, 0, Hc, Zb), 1, 1)} fill={T(pal.wall)} stroke={INK} strokeWidth={4} />);
	els.push(<path key="backS" d={q3(c, [[-Wx, 380, Zb], [Wx, 380, Zb], [Wx, 0, Zb], [-Wx, 0, Zb]])} fill="#000" fillOpacity={0.12} />);
	els.push(<path key="ao" d={q3(c, [[-Wx, 0, Zb], [Wx, 0, Zb], [Wx, 60, Zb], [-Wx, 60, Zb]])} fill="#000" fillOpacity={0.2} />);

	const props: React.ReactNode[] = [];
	if (variant === 'cabin') {
		for (const [X0, X1] of [[-1350, -500], [500, 1350]]) {
			const g = quadPts(c, X0, X1, 520, 900, Zb);
			const g0 = g[0];
			const g2 = g[2];
			props.push(
				<g key={`win${X0}`}>
					<defs>
						<clipPath id={`${uid}w${X0 < 0 ? 'l' : 'r'}`}>
							<path d={qd(g)} />
						</clipPath>
					</defs>
					<g clipPath={`url(#${uid}w${X0 < 0 ? 'l' : 'r'})`}>
						<g transform={`translate(0,${p(0, 700, Zb)[1] - 470})`}>
							<OceanNight f={f} horizon={470} mood={L === 'red' ? 'red' : L === 'off' ? 'dark' : 'night'} calm={calm} stars />
						</g>
						<path d={qd(g)} fill={S.sp} />
					</g>
					<path d={ink.poly(g, 10 + (X0 < 0 ? 0 : 1), 0.8)} fill="none" stroke={T('#c9ced6')} strokeWidth={12} />
					<path d={ink.poly(g, 10 + (X0 < 0 ? 0 : 1), 0.8)} fill="none" stroke={INK} strokeWidth={3} />
					<path d={ink.line(g0[0], g2[1] + 6, g2[0], g2[1] + 6, 12, 0.6, 3)} stroke={T('#dfe3e8')} strokeWidth={8} />
				</g>,
			);
		}
		props.push(<path key="rail" d={ink.line(p(-Wx, 0, Zb)[0], p(0, 470, Zb)[1], p(Wx, 0, Zb)[0], p(0, 470, Zb)[1], 20, 0.8, 6)} stroke={T('#c0c6ce')} strokeWidth={6} />);
		// light strip + seat backs in the foreground corners
		for (const sd of [-1, 1]) props.push(<path key={`ls${sd}`} d={q3(c, [[sd * 300, Hc, Zn], [sd * 360, Hc, Zn], [sd * 360, Hc, Zb], [sd * 300, Hc, Zb]])} fill={lamp} />);
		for (const [X0, X1, Z] of [[-1450, -1100, 1300], [-1050, -700, 1300], [700, 1050, 1300], [1100, 1450, 1300], [-1450, -1100, 900], [1100, 1450, 900]] as Array<[number, number, number]>) {
			props.push(<Box3 key={`seat${X0}${Z}`} ink={ink} k0={30 + Math.abs(X0) / 50 + Z / 100} c={c} b={{X0, X1, H0: 0, H1: 360, Z0: Z, Z1: Z + 60, fill: T('#2d4f86'), sw: 4, nearShade: S.dn}} />);
			props.push(<Box3 key={`hr${X0}${Z}`} ink={ink} k0={40 + Math.abs(X0) / 50 + Z / 100} c={c} b={{X0: X0 + 60, X1: X1 - 60, H0: 290, H1: 400, Z0: Z - 6, Z1: Z + 10, fill: T('#e8ebef'), sw: 3}} />);
		}
	}
	if (variant === 'crew') {
		for (let i = 0; i < 4; i++) {
			const X0 = -1450 + i * 170;
			props.push(<Box3 key={`lk${i}`} ink={ink} k0={50 + i * 6} c={c} b={{X0, X1: X0 + 165, H0: 0, H1: 800, Z0: Zb - 120, Z1: Zb, fill: T(['#5d7a8c', '#56738a', '#5d7a8c', '#56738a'][i]), sw: 3, nearShade: S.dn}} />);
			const v = quadPts(c, X0 + 40, X0 + 125, 600, 640, Zb - 120);
			props.push(<path key={`lv${i}`} d={qd(v)} fill="#000" fillOpacity={0.35} />);
		}
		const nb = quadPts(c, 450, 1150, 380, 820, Zb);
		props.push(<path key="nb" d={ink.poly(nb, 60, 0.8)} fill={T('#a8875a')} stroke={INK} strokeWidth={4} />);
		for (let i = 0; i < 6; i++) {
			const X0 = 500 + (i % 3) * 210;
			const H0 = 430 + Math.floor(i / 3) * 190 + h01(i, 3) * 20;
			props.push(<path key={`pn${i}`} d={ink.poly(quadPts(c, X0, X0 + 150, H0, H0 + 150, Zb - 2), 61 + i, 0.5)} fill={T(['#f4f1e6', '#fff7b0', '#f4f1e6'][i % 3])} stroke={INK} strokeWidth={2} />);
		}
		const ck = p(-820, 960, Zb);
		props.push(<circle key="ck" cx={ck[0]} cy={ck[1]} r={42} fill={T('#f4f1e6')} stroke={INK} strokeWidth={5} />);
		props.push(<path key="ckh" d={`M${ck[0]},${ck[1]}L${ck[0] + 18 * Math.cos(f / 300)},${ck[1] - 22}M${ck[0]},${ck[1]}L${ck[0] - 26},${ck[1] + 6}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />);
		const lp = p(900, Hc, 1300);
		props.push(<ellipse key="lg" cx={lp[0]} cy={lp[1] + 200} rx={700} ry={520} fill={S.gl} fillOpacity={L === 'off' ? 0.1 : 0.6} />);
	}
	if (variant === 'police') {
		const w = quadPts(c, 300, 1400, 380, 950, Zb);
		props.push(<path key="pw" d={ink.poly(w, 70, 0.8)} fill={T('#dfe9f0')} stroke={INK} strokeWidth={5} />);
		const slats: string[] = [];
		for (let H = 400; H < 950; H += 34) {
			const a = p(300, H, Zb);
			const b = p(1400, H, Zb);
			slats.push(`M${a[0]},${a[1]}L${b[0]},${b[1]}`);
		}
		props.push(<path key="sl" d={slats.join('')} stroke={T('#7c8a92')} strokeWidth={9} strokeOpacity={0.85}  fill="none" />);
		props.push(<Box3 key="fc" ink={ink} k0={80} c={c} b={{X0: -1400, X1: -1000, H0: 0, H1: 640, Z0: Zb - 260, Z1: Zb, fill: T('#7d8a8f'), sw: 4, nearShade: S.dn}} />);
		for (let i = 0; i < 3; i++) {
			const d = quadPts(c, -1370, -1030, 40 + i * 200, 210 + i * 200, Zb - 262);
			props.push(<path key={`dr${i}`} d={ink.poly(d, 84 + i, 0.5)} fill="none" stroke={INK} strokeWidth={3} />);
		}
		const mp = quadPts(c, -800, -150, 520, 900, Zb);
		props.push(<path key="map" d={ink.poly(mp, 90, 0.8)} fill={T('#cfd9c4')} stroke={INK} strokeWidth={4} />);
		props.push(<path key="mapl" d={`M${mp[0][0] + 40},${mp[2][1] - 60}Q${(mp[0][0] + mp[1][0]) / 2},${mp[0][1] + 40} ${mp[1][0] - 40},${mp[0][1] + 80}`} stroke="#c0392b" strokeWidth={4} fill="none" strokeDasharray="10 8" />);
		for (const sd of [-1, 1]) props.push(<path key={`ft${sd}`} d={ink.poly([P3(c, sd * 260, Hc, 700), P3(c, sd * 400, Hc, 700), P3(c, sd * 400, Hc, 1500), P3(c, sd * 260, Hc, 1500)], 95 + sd, 0.6)} fill={lamp} stroke={INK} strokeWidth={3} opacity={L === 'off' ? 0.2 : 0.9} />);
	}
	if (variant === 'bridge') {
		const g = quadPts(c, -Wx, Wx, 560, 1100, Zb);
		props.push(
			<g key="bwin">
				<defs>
					<clipPath id={`${uid}bw`}>
						<path d={qd(g)} />
					</clipPath>
				</defs>
				<g clipPath={`url(#${uid}bw)`}>
					<g transform={`translate(0,${p(0, 560, Zb)[1] - 470 - 30})`}>
						<OceanNight f={f} horizon={470} mood={L === 'red' ? 'red' : 'dark'} calm={calm} stars />
					</g>
					<path d={qd(g)} fill={S.sp} />
				</g>
				{[-1000, -350, 350, 1000].map((X, i) => (
					<Box3 key={i} ink={ink} k0={100 + i * 5} c={c} b={{X0: X - 30, X1: X + 30, H0: 560, H1: 1100, Z0: Zb - 40, Z1: Zb, fill: T('#3a4250'), sw: 4}} />
				))}
				<path d={ink.poly(g, 110, 0.8)} fill="none" stroke={INK} strokeWidth={6} />
			</g>,
		);
		props.push(<Box3 key="con" ink={ink} k0={120} c={c} b={{X0: -Wx, X1: Wx, H0: 0, H1: 480, Z0: 1300, Z1: 1700, fill: T('#2b313c'), top: T('#3c4452'), sw: 5, nearShade: S.dn}} />);
		for (const [X0, X1, col] of [[-1300, -900, '#0b2a4a'], [-700, -380, '#05140f'], [380, 700, '#05140f'], [900, 1300, '#0b2a4a']] as Array<[number, number, string]>) {
			props.push(<Box3 key={`sc${X0}`} ink={ink} k0={130 + X0 / 100} c={c} b={{X0, X1, H0: 480, H1: 640, Z0: 1620, Z1: 1650, fill: '#14171c', sw: 3}} />);
			const s0 = quadPts(c, X0 + 18, X1 - 18, 498, 624, 1618);
			props.push(<path key={`ss${X0}`} d={qd(s0)} fill={L === 'off' ? '#050608' : col} />);
			props.push(<ellipse key={`sg${X0}`} cx={(s0[0][0] + s0[1][0]) / 2} cy={s0[2][1] + 20} rx={160} ry={40} fill={S.gl} fillOpacity={0.4} />);
		}
	}
	if (variant === 'dark') {
		const lp = p(-700, 900, Zb);
		const pipe = (H: number, r: number, k: number, col: string) => {
			const pts = [p(-Wx, H + r, Zb - 40), p(Wx, H + r, Zb - 40), p(Wx, H - r, Zb - 40), p(-Wx, H - r, Zb - 40)];
			return <path key={`pi${k}`} d={ink.poly(pts, 140 + k, 0.6)} fill={T(col)} stroke={INK} strokeWidth={3} />;
		};
		props.push(pipe(1000, 30, 1, '#4a525c'), pipe(920, 20, 2, '#5a4a3a'));
		const seams: string[] = [];
		for (let X = -Wx; X <= Wx; X += 380) {
			const a = p(X, 0, Zb);
			const b = p(X, Hc, Zb);
			seams.push(`M${a[0]},${a[1]}L${b[0]},${b[1]}`);
		}
		props.push(<path key="se" d={seams.join('')} stroke="#000" strokeWidth={3} strokeOpacity={0.35}  fill="none" />);
		if (L !== 'off') props.push(<ellipse key="dg" cx={lp[0]} cy={lp[1] + 60} rx={420} ry={360} fill={S.gl} />);
		props.push(<Box3 key="dl" ink={ink} k0={150} c={c} b={{X0: -760, X1: -640, H0: 850, H1: 950, Z0: Zb - 60, Z1: Zb, fill: L === 'off' ? '#222' : lamp, sw: 3}} />);
	}
	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			{els}
			{props}
			{haze > 0 ? <rect x={-300} y={-300} width={2520} height={1700} fill={T(pal.amb)} fillOpacity={haze} /> : null}
		</g>
	);
};

/** Four screen corners of a world rectangle on a frontal plane Z. */
const quadPts = (c: Cam3, X0: number, X1: number, H0: number, H1: number, Z: number): Pt[] => [P3(c, X0, H1, Z), P3(c, X1, H1, Z), P3(c, X1, H0, Z), P3(c, X0, H0, Z)];

