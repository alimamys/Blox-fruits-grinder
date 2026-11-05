// Interior environments: <PassengerCabin/>, <CabinRow/>, <RearDeck/>, <Bridge/>,
// <FerryCorridor/>, <FerryWindow/>, <EngineRoomDoor/>, <CeilingSpeaker/> plus the
// lightweight <CrowdHead/> used for the 62 passengers (grouped, not individually
// animated beyond a little idle life).
//
// Every room is built in one-point perspective (see kit.tsx: Cam3/P3/Box3) with
// gradient shading, contact shadows and calm hand-drawn outlines.
//
// SEATING CONTRACT (matches the seated StickPerson rig). For an occupant drawn
// with feet at (x, y) and scale s:
//   seat cushion top surface  y - 72*s   (top face ~y-80s..y-70s, front face y-70s..y-46s)
//   seat back                 from the cushion up to y - 165*s (shoulder height)
//   headrest                  y - 165*s .. y - 190*s, always drawn BEHIND the head
//   render order              seat back -> cushion -> OCCUPANT -> only true foreground
import React from 'react';
import {h01, wobEllipse} from '../../utils/rough';
import {
	Box,
	Box3,
	INK,
	P3,
	ShadeDefs,
	lampOf,
	makeInk,
	mix,
	qd,
	shade,
	shadeUrls,
	smooth,
	tone,
	toward,
	useUid,
	LinGrad,
	box3Faces,
	type Cam3,
	type Lights,
	type Pt,
} from './kit';
import {OceanNight} from './Outdoor';

export type {Lights} from './kit';

/** Seated rig geometry in units of the occupant's scale, measured UP from the feet line. */
export const SEAT = {
	cushion: 72,
	topBack: 80,
	topFront: 70,
	frontBottom: 46,
	knee: 64,
	back: 165,
	headrest: 190,
	shoulder: 167,
	head: 209,
	width: 150,
} as const;

const SKINS = ['#f1cfb0', '#d9a67c', '#8d5b3d', '#f3d3bd', '#c99772', '#e8bfa0', '#6b4630'];
const HAIRS = ['#2b1b12', '#111', '#6b4a2b', '#b08a4a', '#3a2a1f', '#999', '#5a2a1a'];
const SHIRTS = ['#6d8f4e', '#b8743a', '#5e5a8a', '#8a3b3b', '#3d7a7a', '#9a8a4a', '#4f5f74', '#7a5a7a', '#a66', '#567'];
const PANTS = ['#2a2a30', '#3b4a6b', '#2f3338', '#4a3f35'];

/* =================================================================== crowd */

/** Circle as path data (so several dots can share one <path>). */
const dot = (cx: number, cy: number, r: number) => `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;

/** Cheap passenger: head + shoulders. Used in grouped crowds.
 *  Idle life (on by default): slow breathing, occasional small head turns/tilts
 *  and blinks, all seeded by `id` - never any sideways sliding. */
export const CrowdHead: React.FC<{
	x: number;
	y: number;
	s?: number;
	id: number;
	back?: boolean;
	look?: number;
	mouth?: 'flat' | 'o' | 'scream' | 'smile';
	phone?: boolean;
	f: number;
	skin?: string;
	shirt?: string;
	hair?: string;
	dim?: number;
	eyes?: 'dot' | 'wide';
	/** breathing / head motion / blinks (default true) */
	idle?: boolean;
	/** skip the small shading touches (far-away crowds) */
	lite?: boolean;
}> = ({x, y, s = 1, id, back = false, look = 0, mouth = 'flat', phone = false, f, skin, shirt, hair, dim = 0, eyes = 'dot', idle = true, lite = false}) => {
	const ink = makeInk(f, id * 17 + 3);
	const sk = skin ?? SKINS[(id * 3) % SKINS.length];
	const sh = shirt ?? SHIRTS[(id * 7) % SHIRTS.length];
	const hr = hair ?? HAIRS[(id * 5) % HAIRS.length];
	const r = 30;
	const long = id % 3 === 0;
	// --- idle life
	const t = f / 30;
	const period = 3.5 + h01(id, 21) * 1.0;
	const breath = idle ? 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2 + id * 1.37) : 0.5;
	const rise = breath * 1.7;
	const tn = idle ? (smooth(t * 0.33, id) - 0.5) * 2 : 0;
	const turn = Math.sign(tn) * tn * tn * 0.55;
	const tilt = idle ? (smooth(t * 0.26, id + 40) - 0.5) * 7 : 0;
	const blinkP = Math.round(90 + h01(id, 23) * 90);
	const blink = idle && (f + Math.round(h01(id, 24) * blinkP)) % blinkP < (eyes === 'wide' ? 3 : 4);
	const lk = look + turn;
	const headT = `translate(${turn * 3},${-rise}) rotate(${tilt} 0 -4)`;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{long ? (
				<g transform={headT}>
					<path d={ink.rect(-r - 6, -r - 50, 2 * r + 12, 60, 1, 1.4)} fill={hr} stroke={INK} strokeWidth={4} />
				</g>
			) : null}
			<g transform={`translate(0,${-rise * 0.55})`}>
				<path d={ink.ellipse(0, 22, 52, 34, 2, 1.4, 10)} fill={sh} stroke={INK} strokeWidth={5} />
				{lite ? null : <path d={ink.ellipse(0, 36, 42, 14, 12, 1, 8)} fill="#000" fillOpacity={0.16} />}
				{lite ? null : <ellipse cx={0} cy={-3} rx={20} ry={7} fill="#000" fillOpacity={0.22} />}
			</g>
			<g transform={headT}>
				<path d={ink.ellipse(0, -30, r, r, 3, 1, 10)} fill={back ? hr : sk} stroke={INK} strokeWidth={5} />
				{back && !lite ? <path d="M-15,-50 Q0,-58 15,-50" stroke="#fff" strokeWidth={4} fill="none" strokeOpacity={0.18} strokeLinecap="round" /> : null}
				{!back ? (
					<>
						<path
							d={ink.curve([[-r - 2, -32], [-r * 0.8, -r - 18], [0, -r - 34], [r * 0.8, -r - 18], [r + 2, -32], [r * 0.4, -r - 8], [-r * 0.4, -r - 8]], 4, 1, true)}
							fill={hr}
							stroke={INK}
							strokeWidth={4}
						/>
						{blink ? (
							<path d={`M${-15 + lk * 5},-30 L${-5 + lk * 5},-30 M${5 + lk * 5},-30 L${15 + lk * 5},-30`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
						) : eyes === 'wide' ? (
							<>
								<path d={`${dot(-10 + lk * 4, -30, 7)}${dot(10 + lk * 4, -30, 7)}`} fill="#fff" stroke={INK} strokeWidth={2.5} />
								<path d={`${dot(-10 + lk * 6, -30, 3)}${dot(10 + lk * 6, -30, 3)}`} fill={INK} />
							</>
						) : (
							<path d={`${dot(-10 + lk * 5, -31, 4)}${dot(10 + lk * 5, -31, 4)}`} fill={INK} />
						)}
						{mouth === 'o' ? <ellipse cx={lk * 4} cy={-14} rx={5} ry={6} fill="#3a1414" stroke={INK} strokeWidth={2.5} /> : null}
						{mouth === 'scream' ? <ellipse cx={lk * 4} cy={-12} rx={8} ry={11} fill="#2a0d0d" stroke={INK} strokeWidth={3} /> : null}
						{mouth === 'smile' ? <path d={`M${-8 + lk * 4},-16 Q${lk * 4},-9 ${8 + lk * 4},-16`} stroke={INK} strokeWidth={3} fill="none" /> : null}
						{mouth === 'flat' ? <path d={ink.line(-7 + lk * 4, -14, 7 + lk * 4, -14, 5, 0.5, 1)} stroke={INK} strokeWidth={3} /> : null}
					</>
				) : null}
			</g>
			{dim > 0 ? <ellipse cx={0} cy={-10} rx={72} ry={82} fill="#000" fillOpacity={phone ? dim * 0.35 : dim} /> : null}
			{phone ? (
				<g>
					<ellipse cx={0} cy={-20} rx={80} ry={70} fill="#bfe0ff" fillOpacity={0.28} />
					<path d={ink.rect(-12, 0, 24, 36, 6, 0.6)} fill="#dff0ff" stroke={INK} strokeWidth={3} />
				</g>
			) : null}
		</g>
	);
};

/** A whole seated crowd passenger, feet at (x, y): legs, lap, torso, arms and a
 *  <CrowdHead/> whose head centre sits at y - 209*s (same as the seated rig). */
export const SeatedCrowd: React.FC<{
	x: number;
	y: number;
	s: number;
	id: number;
	f: number;
	back?: boolean;
	/** upper-body lean in px (leaning away etc.) */
	lean?: number;
	look?: number;
	mouth?: 'flat' | 'o' | 'scream' | 'smile';
	phone?: boolean;
	eyes?: 'dot' | 'wide';
	dim?: number;
	lights?: Lights;
	legs?: boolean;
	/** draw the lap block (skip when a seat back in front always hides it) */
	lap?: boolean;
}> = ({x, y, s, id, f, back = false, lean = 0, look = 0, mouth = 'flat', phone = false, eyes = 'dot', dim = 0, lights = 'on', legs = true, lap = true}) => {
	const ink = makeInk(f, id * 29 + 7);
	// people keep their own colours under red emergency light (just tinted), so faces stay readable
	const L = lights === 'off' ? 'on' : lights;
	const tn = (cc: string) => (L === 'red' ? mix(mix(cc, '#000', 0.25), '#d0301f', 0.42) : tone(cc, L));
	const sh = tn(SHIRTS[(id * 7) % SHIRTS.length]);
	const pa = tn(PANTS[id % PANTS.length]);
	const sk = tn(SKINS[(id * 3) % SKINS.length]);
	const hr = tn(HAIRS[(id * 5) % HAIRS.length]);
	const ln = lean / s;
	const sleeve = mix(sh, '#000', 0.12);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{!back && legs ? (
				<g>
					<path d={`M-19,-62 L-21,-4 M19,-62 L21,-4`} stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
					<path d={`M-19,-62 L-21,-4 M19,-62 L21,-4`} stroke={pa} strokeWidth={13} strokeLinecap="round" fill="none" />
				</g>
			) : null}
			{!back && lap ? <path d={ink.rect(-36, -86, 72, 26, 1, 1)} fill={pa} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
			<path d={ink.poly([[-33 + ln, -165], [33 + ln, -165], [31, -76], [-31, -76]], 2, 1.2)} fill={sh} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			{s > 0.6 && !back ? <path d={qd([[-31 + ln * 0.5, -120], [31 + ln * 0.5, -120], [31, -76], [-31, -76]])} fill="#000" fillOpacity={0.14} /> : null}
			{!back ? (
				<g>
					<path d={`M${-36 + ln},-150 Q${-42 + ln * 0.5},-110 -22,-82 M${36 + ln},-150 Q${42 + ln * 0.5},-110 22,-82`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
					<path d={`M${-36 + ln},-150 Q${-42 + ln * 0.5},-110 -22,-82 M${36 + ln},-150 Q${42 + ln * 0.5},-110 22,-82`} stroke={sleeve} strokeWidth={8} fill="none" strokeLinecap="round" />
					<path d={`${ink.ellipse(-18, -80, 9, 7, 3, 0.6, 7)}${ink.ellipse(18, -80, 9, 7, 4, 0.6, 7)}`} fill={sk} stroke={INK} strokeWidth={3} />
				</g>
			) : null}
			<CrowdHead x={ln} y={-177.5} s={1.05} id={id} f={f} back={back} look={look} mouth={mouth} phone={phone} eyes={eyes} dim={0} skin={sk} shirt={sh} hair={hr} lite={s < 0.45} />
			{dim > 0 ? <path d={qd([[-60, -260], [60, -260], [50, 0], [-50, 0]])} fill="#000" fillOpacity={phone ? dim * 0.35 : dim} /> : null}
		</g>
	);
};

/* ========================================================= passenger cabin */

/** Geometry of the cabin perspective, shared by all cabin shots. */
export const CABIN = {vpx: 960, vpy: 470, rows: 10, cols: 3};
export const rowScale = (row: number) => 1 / (1 + row * 0.36);
/** Seat position: x = seat centre, y = the FLOOR line at that row (= the occupant's
 *  feet), s = row scale. A seated StickPerson drawn at (x, y, s) sits exactly on
 *  the cushion. */
export const seatPos = (row: number, side: -1 | 1, col: number) => {
	const sc = rowScale(row);
	const aisle = 95 * sc;
	const seatW = 150 * sc;
	const x = CABIN.vpx + side * (aisle + seatW * (col + 0.5));
	const y = CABIN.vpy + 640 * sc;
	return {x, y, s: sc};
};
/** Seat + rig landmarks for a cabin seat (all screen px). */
export const seatGeom = (row: number, side: -1 | 1, col: number) => {
	const {x, y, s} = seatPos(row, side, col);
	return {x, feetY: y, s, seatY: y - SEAT.cushion * s, headY: y - SEAT.head * s, crowdY: y - 177.5 * s};
};

export interface Occupant {
	row: number;
	side: -1 | 1;
	col: number;
	/** y is the occupant's FEET (the floor in front of the seat); a seated StickPerson
	 *  at ({x, y, s}) sits exactly on the cushion. seatY = cushion top, headY = seated
	 *  head centre, crowdY = where a <CrowdHead s={s*1.05}/> lines up with the rig. */
	render: (pos: {x: number; y: number; s: number; seatY: number; headY: number; crowdY: number}) => React.ReactNode;
}

const CAB: Cam3 = {vx: 960, vy: 470, F: 1000, eye: 640};
const CAB_W = 900;
const CAB_H = 1200;
const CAB_ZN = 560;
const CAB_ZB = 4450;
const rowZ = (row: number) => 1000 * (1 + row * 0.36);

/** The passenger cabin, seen down the length of the ferry.
 *  facing 'aft'  - camera at the bow end looking back toward the rear doors (faces visible)
 *  facing 'fore' - camera at the stern end looking forward (backs of heads, front wall + screen)
 *  `special` occupants get feet-anchored positions (see Occupant). `frontScreen`
 *  ('fore') is drawn inside the front TV in a 260x150 box. */
export const PassengerCabin: React.FC<{
	f: number;
	facing?: 'aft' | 'fore';
	lights?: Lights;
	occupancy?: number;
	empty?: string[];
	special?: Occupant[];
	doorFigure?: boolean;
	doorFigureOpacity?: number;
	headsLook?: number;
	crowdMouth?: 'flat' | 'o' | 'scream';
	phones?: number;
	shiftAway?: number;
	frontScreen?: React.ReactNode;
	seatLabels?: boolean;
	rows?: number;
	crowdEyes?: 'dot' | 'wide';
}> = ({
	f,
	facing = 'aft',
	lights = 'on',
	occupancy = 0.86,
	empty = [],
	special = [],
	doorFigure = false,
	doorFigureOpacity = 1,
	headsLook = 0,
	crowdMouth = 'flat',
	phones = 0,
	shiftAway = 0,
	frontScreen,
	seatLabels = false,
	rows = CABIN.rows,
	crowdEyes = 'dot',
}) => {
	const uid = useUid('cab');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 300);
	const L = lights;
	const T = (c: string) => tone(c, L);
	const lamp = lampOf(L);
	const c = CAB;
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const W = CAB_W;
	const Hc = CAB_H;
	const Zn = CAB_ZN;
	const Zb = CAB_ZB;
	const aft = facing === 'aft';
	const specialMap = new Map(special.map((o) => [`${o.row}:${o.side}:${o.col}`, o]));
	const emptySet = new Set(empty);
	const haze = T('#8f99a8');
	const hz = (Z: number) => Math.min(0.55, Math.max(0, (Z - 1100) / 5200));

	const wallC = T('#8a96a6');
	const wallLow = T('#6f7b8c');
	const ceilC = T('#c9ced5');
	const floorC = T('#3a414e');
	const aisleC = T('#2b4573');
	const seatC = T('#2d4f86');
	const coverC = T('#e6e9ee');
	const baseC = T('#1a1e27');

	/* ---------- room shell (flat fills + translucent falloff bands, batched windows: cheap to render) */
	const shell: React.ReactNode[] = [];
	const P = (X: number, H: number, Z: number) => p(X, H, Z);
	const quadZ = (pts: Array<[number, number, number]>) => qd(pts.map(([X, H, Z]) => P(X, H, Z)));
	shell.push(<path key="ceil" d={quadZ([[-W, Hc, Zn], [W, Hc, Zn], [W, Hc, Zb], [-W, Hc, Zb]])} fill={ceilC} />);
	shell.push(<path key="floor" d={quadZ([[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]])} fill={floorC} />);
	shell.push(<path key="aisle" d={quadZ([[-88, 0, Zn], [88, 0, Zn], [88, 0, Zb], [-88, 0, Zb]])} fill={aisleC} />);
	for (const sd of [-1, 1]) shell.push(<path key={`w${sd}`} d={quadZ([[sd * W, Hc, Zn], [sd * W, Hc, Zb], [sd * W, 0, Zb], [sd * W, 0, Zn]])} fill={wallC} />);
	// light falloff: darker toward the camera (floor, ceiling, walls), lower wall panels, seam AO
	shell.push(
		<path
			key="fall"
			d={[
				quadZ([[-W, 0, Zn], [W, 0, Zn], [W, 0, 1250], [-W, 0, 1250]]),
				quadZ([[-W, 0, Zn], [W, 0, Zn], [W, 0, 900], [-W, 0, 900]]),
				quadZ([[-W, Hc, Zn], [W, Hc, Zn], [W, Hc, 900], [-W, Hc, 900]]),
				...[-1, 1].map((sd) => quadZ([[sd * W, Hc, Zn], [sd * W, Hc, 1100], [sd * W, 0, 1100], [sd * W, 0, Zn]])),
			].join('')}
			fill="#000"
			fillOpacity={0.13}
		/>,
	);
	shell.push(<path key="lw" d={[-1, 1].map((sd) => quadZ([[sd * W, 300, Zn], [sd * W, 300, Zb], [sd * W, 0, Zb], [sd * W, 0, Zn]])).join('')} fill={wallLow} fillOpacity={0.75} />);
	shell.push(
		<path
			key="ao"
			d={[-1, 1]
				.map((sd) => quadZ([[sd * W, Hc, Zn], [sd * W, Hc, Zb], [sd * W, Hc - 70, Zb], [sd * W, Hc - 70, Zn]]) + quadZ([[sd * W, 0, Zn], [sd * W, 0, Zb], [sd * W - sd * 90, 0, Zb], [sd * W - sd * 90, 0, Zn]]))
				.join('')}
			fill="#000"
			fillOpacity={0.2}
		/>,
	);
	// windows: one per row, recessed 34 units (batched by kind)
	const glassNear: string[] = [];
	const glassFar: string[] = [];
	const hor: string[] = [];
	const sheen: string[] = [];
	const jambs: string[] = [];
	const sills: string[] = [];
	for (const sd of [-1, 1]) {
		const X = sd * W;
		const Xg = X + sd * 34;
		const lo = 300;
		const hi = 760;
		for (let i = 0; i < 10; i++) {
			const z0 = rowZ(i) + 70;
			const z1 = z0 + 230 + i * 12;
			if (z1 > Zb - 40) continue;
			const glass = [P(Xg, hi, z0), P(Xg, hi, z1), P(Xg, lo, z1), P(Xg, lo, z0)];
			(i < 3 ? glassNear : glassFar).push(ink.poly(glass, 40 + i * 2 + sd, 0.8));
			hor.push(quadZ([[Xg, 470, z0], [Xg, 470, z1], [Xg, 466, z1], [Xg, 466, z0]]));
			sheen.push(qd([glass[0], [glass[0][0] + (glass[1][0] - glass[0][0]) * 0.3, glass[1][1] + (glass[0][1] - glass[1][1]) * 0.7], [glass[3][0] + (glass[2][0] - glass[3][0]) * 0.12, glass[2][1] + (glass[3][1] - glass[2][1]) * 0.88], glass[3]]));
			jambs.push(quadZ([[X, hi, z1], [Xg, hi, z1], [Xg, lo, z1], [X, lo, z1]]));
			sills.push(quadZ([[X, lo, z0], [X, lo, z1], [Xg, lo, z1], [Xg, lo, z0]]));
		}
	}
	shell.push(<path key="gN" d={glassNear.join('')} fill={T('#08111f')} stroke={INK} strokeWidth={3.2} />);
	shell.push(<path key="gF" d={glassFar.join('')} fill={T('#08111f')} stroke={INK} strokeWidth={1.6} />);
	shell.push(<path key="gH" d={hor.join('')} fill="#2a3f5c" fillOpacity={0.6} />);
	shell.push(<path key="gS" d={sheen.join('')} fill="#fff" fillOpacity={0.035} />);
	shell.push(<path key="gJ" d={jambs.join('')} fill={shade(wallC, -0.18)} stroke={INK} strokeWidth={1.8} />);
	shell.push(<path key="gL" d={sills.join('')} fill={shade(wallC, 0.25)} stroke={INK} strokeWidth={1.8} />);
	shell.push(<path key="dr" d={ink.poly([P(-W, 300, Zn), P(-W, 300, Zb)], 59, 1, false) + ink.poly([P(W, 300, Zn), P(W, 300, Zb)], 61, 1, false)} stroke={INK} strokeWidth={4} fill="none" />);
	// luggage racks (open boxes running the length of the cabin) + their light strips
	for (const sd of [-1, 1]) {
		shell.push(
			<Box3
				key={`rack${sd}`}
				ink={ink}
				k0={70 + sd * 5}
				c={c}
				b={{X0: sd < 0 ? -W : W - 120, X1: sd < 0 ? -W + 120 : W, H0: 880, H1: 940, Z0: Zn, Z1: Zb - 10, fill: T('#b9c0ca'), open: true, sw: 4}}
			/>,
		);
	}
	shell.push(<path key="rl" d={[-1, 1].map((sd) => quadZ([[sd * (W - 120), 880, Zn], [sd * (W - 120), 880, Zb], [sd * (W - 100), 880, Zb], [sd * (W - 100), 880, Zn]])).join('')} fill={lamp} fillOpacity={L === 'off' ? 0.15 : 0.85} />);
	// ceiling light strips + ribs
	const ribs: string[] = [];
	for (let i = 0; i < 11; i++) {
		const Z = rowZ(i) + 180;
		if (Z > Zb) break;
		const a = P(-W, Hc, Z);
		const b = P(W, Hc, Z);
		ribs.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
	}
	shell.push(<path key="ribs" d={ribs.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.18} fill="none" />);
	shell.push(<path key="lsg" d={[-1, 1].map((sd) => quadZ([[sd * 210, Hc, Zn], [sd * 450, Hc, Zn], [sd * 450, Hc, Zb], [sd * 210, Hc, Zb]])).join('')} fill={lamp} fillOpacity={L === 'on' ? 0.16 : 0.07} />);
	shell.push(<path key="ls" d={[-1, 1].map((sd) => ink.poly([P(sd * 300, Hc, Zn), P(sd * 360, Hc, Zn), P(sd * 360, Hc, Zb), P(sd * 300, Hc, Zb)], 80 + sd, 1)).join('')} fill={L === 'off' ? '#222' : lamp} stroke={INK} strokeWidth={3} />);

	/* ---------- end wall */
	const bw0 = p(-W, Hc, Zb);
	const bw1 = p(W, 0, Zb);
	const endWall: React.ReactNode[] = [
		<path key="bw" d={ink.rect(bw0[0], bw0[1], bw1[0] - bw0[0], bw1[1] - bw0[1], 9, 1)} fill={T(aft ? '#9aa4b2' : '#8d97a6')} stroke={INK} strokeWidth={3} />,
		<path key="bws" d={qd([[bw0[0], bw1[1] - (bw1[1] - bw0[1]) * 0.35], [bw1[0], bw1[1] - (bw1[1] - bw0[1]) * 0.35], bw1, [bw0[0], bw1[1]]])} fill="#000" fillOpacity={0.12} />,
	];
	if (aft) {
		// rear double doors, recessed, with glass onto the dark deck
		const d0 = p(-175, 470, Zb);
		const d1 = p(175, 0, Zb);
		const r0 = p(-175, 470, Zb + 50);
		const r1 = p(175, 0, Zb + 50);
		endWall.push(<path key="dr" d={qd([d0, [d1[0], d0[1]], d1, [d0[0], d1[1]]])} fill={T('#2b3038')} />);
		endWall.push(<path key="dj" d={qd([d0, r0, [r0[0], r1[1]], [d0[0], d1[1]]])} fill={T('#6b7482')} />);
		endWall.push(<path key="dj2" d={qd([[d1[0], d0[1]], [r1[0], r0[1]], r1, d1])} fill={T('#6b7482')} />);
		for (const sd of [-1, 1]) {
			const g0 = p(sd < 0 ? -160 : 12, 420, Zb + 50);
			const g1 = p(sd < 0 ? -12 : 160, 0, Zb + 50);
			const gw0 = p(sd < 0 ? -140 : 32, 420, Zb + 50);
			const gw1 = p(sd < 0 ? -32 : 140, 250, Zb + 50);
			endWall.push(<path key={`dg${sd}`} d={qd([gw0, [gw1[0], gw0[1]], gw1, [gw0[0], gw1[1]]])} fill={T('#0a1322')} />);
			if (sd > 0 && doorFigure) {
				const hx = (gw0[0] + gw1[0]) / 2 + 3;
				const hy = gw1[1] - 9;
				endWall.push(
					<g key="fig" opacity={doorFigureOpacity}>
						<path d={`M${hx - 9},${gw1[1] + 1} Q${hx},${hy - 6} ${hx + 9},${gw1[1] + 1} Z`} fill="#050506" />
						<circle cx={hx} cy={hy - 6} r={6.5} fill="#e2ddd5" />
						<circle cx={hx} cy={hy - 13} r={3.6} fill="#aaa" />
						<circle cx={hx - 2} cy={hy - 6} r={0.9} fill="#555" />
						<circle cx={hx + 2} cy={hy - 6} r={0.9} fill="#555" />
					</g>,
				);
			}
			endWall.push(
				<path
					key={`dl${sd}`}
					d={`${qd([g0, [g1[0], g0[1]], g1, [g0[0], g1[1]]])}${qd([gw0, [gw0[0], gw1[1]], gw1, [gw1[0], gw0[1]]])}`}
					fill={T('#b7bec7')}
					fillRule="evenodd"
					stroke={INK}
					strokeWidth={2.5}
				/>,
			);

		}
		// EXIT sign (lit box) + label
		endWall.push(<ellipse key="exg" cx={960} cy={p(0, 560, Zb)[1]} rx={60} ry={26} fill="#2bd06a" fillOpacity={L === 'off' ? 0.25 : 0.18} />);
		endWall.push(<Box3 key="ex" ink={ink} k0={90} c={c} b={{X0: -120, X1: 120, H0: 525, H1: 600, Z0: Zb - 40, Z1: Zb, fill: L === 'red' ? '#2b4a2b' : '#1f9a4b', sw: 2.5}} />);
		const ex = p(0, 545, Zb - 40);
		endWall.push(
			<text key="ext" x={ex[0]} y={ex[1]} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={12} fill="#eaffea">
				EXIT
			</text>,
		);
		const rd = p(0, 655, Zb);
		endWall.push(
			<text key="rdt" x={rd[0]} y={rd[1]} textAnchor="middle" fontFamily="Patrick Hand" fontSize={11} fill={T('#222')}>
				REAR DECK
			</text>,
		);
	} else {
		// front wall: TV screen + exit signs
		const t0 = p(-330, 960, Zb - 50);
		const t1 = p(330, 620, Zb - 50);
		endWall.push(<Box3 key="tv" ink={ink} k0={95} c={c} b={{X0: -350, X1: 350, H0: 600, H1: 980, Z0: Zb - 50, Z1: Zb, fill: '#15181e', sw: 3}} />);
		endWall.push(<path key="tvs" d={qd([t0, [t1[0], t0[1]], t1, [t0[0], t1[1]]])} fill={L === 'off' ? '#05070b' : L === 'red' ? '#2a0606' : '#173156'} />);
		if (frontScreen) {
			endWall.push(
				<g key="tvc" transform={`translate(${t0[0]},${t0[1]}) scale(${(t1[0] - t0[0]) / 260})`}>
					{frontScreen}
				</g>,
			);
		} else if (L !== 'off') {
			const cx = (t0[0] + t1[0]) / 2;
			const cy = (t0[1] + t1[1]) / 2;
			const w = t1[0] - t0[0];
			endWall.push(
				<g key="tvd" opacity={0.85}>
					<path d={`M${cx - w * 0.38},${cy + 10} Q${cx},${cy - 22} ${cx + w * 0.38},${cy - 2}`} stroke="#6fb2ff" strokeWidth={2} fill="none" strokeDasharray="4 3" />
					<circle cx={cx - w * 0.38} cy={cy + 10} r={3} fill="#9fd0ff" />
					<circle cx={cx + w * 0.38} cy={cy - 2} r={3} fill="#ffcf6b" />
					<text x={cx} y={t0[1] + 14} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={9} fill="#cfe3ff">
						BELL ISLAND → PORT MASON
					</text>
				</g>,
			);
		}

		for (const sd of [-1, 1]) {
			endWall.push(<Box3 key={`es${sd}`} ink={ink} k0={97 + sd} c={c} b={{X0: sd * 560 - 70, X1: sd * 560 + 70, H0: 820, H1: 880, Z0: Zb - 30, Z1: Zb, fill: L === 'red' ? '#2b4a2b' : '#1f9a4b', sw: 2}} />);
		}
	}

	/* ---------- seats + passengers (seat faces batched per row: few <path>s) */
	const rowEls: React.ReactNode[] = [];
	const seatW = 73;
	type Bucket = {d: string[]; fill: string; ov?: string; ovd?: string[]; w: number};
	for (let row = rows - 1; row >= 0; row--) {
		const Zf = rowZ(row);
		const sc = 1000 / Zf;
		const hzk = hz(Zf);
		const col = (cc: string) => (hzk > 0 ? mix(cc, haze, hzk) : cc);
		const sw = Math.max(1.3, 4.2 * sc);
		const near = false;
		const mk = (fill: string, w = sw, ov?: string): Bucket => ({d: [], fill, w, ov, ovd: ov ? [] : undefined});
		const B = {
			backSide: mk(shade(col(seatC), -0.28)),
			backTop: mk(shade(col(seatC), 0.16)),
			backNear: mk(col(seatC), sw, near ? S.hl : undefined),
			hrTop: mk(shade(col(coverC), 0.05), sw * 0.8),
			hrNear: mk(col(coverC), sw * 0.8),
			baseNear: mk(col(baseC), sw * 0.8),
			cuSide: mk(shade(col(seatC), -0.4)),
			cuTop: mk(col(shade(seatC, 0.14))),
			cuNear: mk(col(shade(seatC, -0.12)), sw, near ? S.dn : undefined),
		};
		const add = (bk: Bucket, d?: string, q?: string) => {
			if (!d) return;
			bk.d.push(d);
			if (bk.ovd && q) bk.ovd.push(q);
		};
		const labels: React.ReactNode[] = [];
		const people: React.ReactNode[] = [];
		for (const side of [-1, 1] as const) {
			for (const cIdx of [2, 1, 0]) {
				const Xc = side * (95 + 150 * (cIdx + 0.5));
				const key = `${row}:${side}:${cIdx}`;
				const id = row * 6 + (side > 0 ? 3 : 0) + cIdx;
				const k0 = 1000 + id * 20;
				const zc = aft ? 1 : -1; // seat depth direction relative to the feet
				const cz = [Zf + zc * 6, Zf + zc * 66];
				const bz = [Zf + zc * 66, Zf + zc * 80];
				const cu = box3Faces(ink, k0, c, {X0: Xc - seatW, X1: Xc + seatW, H0: 46, H1: 72, Z0: Math.min(...cz), Z1: Math.max(...cz), amp: 0.8, sides: cIdx === 0});
				add(B.cuSide, cu.side);
				add(B.cuTop, cu.top);
				add(B.cuNear, cu.near, cu.nearQ);
				const bk = box3Faces(ink, k0 + 8, c, {X0: Xc - seatW, X1: Xc + seatW, H0: 64, H1: SEAT.back, Z0: Math.min(...bz), Z1: Math.max(...bz), amp: 0.8, sides: cIdx === 0});
				add(B.backSide, bk.side);
				add(B.backTop, bk.top);
				add(B.backNear, bk.near, bk.nearQ);
				if (aft) {
					const hr = box3Faces(ink, k0 + 12, c, {X0: Xc - 48, X1: Xc + 48, H0: 158, H1: SEAT.headrest, Z0: bz[0] - 4, Z1: bz[0] + 2, amp: 0.6, sides: false});
					add(B.hrTop, hr.top);
					add(B.hrNear, hr.near);
					if (row <= 1) add(B.baseNear, box3Faces(ink, k0 + 6, c, {X0: Xc - seatW + 14, X1: Xc + seatW - 14, H0: 0, H1: 46, Z0: Zf + 26, Z1: Zf + 66, amp: 0.6, sides: false}).near);
				}
				if (seatLabels && !aft && row < 6) {
					const lp = p(Xc, 120, Math.min(...bz));
					labels.push(
						<text key={`lb${key}`} x={lp[0]} y={lp[1]} textAnchor="middle" fontFamily="Patrick Hand" fontSize={26 * sc} fill="#fff">
							{`${14 + (5 - row)}${side < 0 ? 'ABC'[cIdx] : 'DEF'[cIdx]}`}
						</text>,
					);
				}
				// occupant
				const sp = specialMap.get(key);
				const occupied = !emptySet.has(key) && (sp || h01(id, 77) < occupancy);
				const fx = c.vx + Xc * sc;
				const fy = c.vy + c.eye * sc;
				if (sp) {
					people.push(<g key={`sp${key}`}>{sp.render({x: fx, y: fy, s: sc, seatY: fy - SEAT.cushion * sc, headY: fy - SEAT.head * sc, crowdY: fy - 177.5 * sc})}</g>);
				} else if (occupied) {
					const lean = shiftAway * (side * -1) * 40 * sc * (cIdx === 2 ? 1 : cIdx === 1 ? 0.6 : 0.3);
					people.push(
						<SeatedCrowd
							key={`p${key}`}
							x={fx}
							y={fy}
							s={sc}
							id={id}
							f={f}
							back={!aft}
							lean={lean}
							look={headsLook + (aft ? h01(id, 3) * 0.6 - 0.3 : 0)}
							mouth={crowdMouth === 'flat' ? (h01(id, 9) > 0.8 ? 'smile' : 'flat') : h01(id, 8) > 0.5 ? crowdMouth : 'o'}
							phone={phones > 0 && h01(id, 5) < phones}
							eyes={crowdEyes}
							dim={L === 'off' ? 0.7 : hzk * 0.5}
							lights={L}
							legs={aft && row <= 1}
							lap={!aft || row <= 2}
						/>,
					);
				}
			}
		}
		const draw = (k: string, bk: Bucket) =>
			bk.d.length ? (
				<g key={k}>
					<path d={bk.d.join('')} fill={bk.fill} stroke={row >= 3 && !k.endsWith('n') ? 'none' : INK} strokeWidth={bk.w} strokeLinejoin="round" />
					{bk.ov && bk.ovd && bk.ovd.length ? <path d={bk.ovd.join('')} fill={bk.ov} /> : null}
				</g>
			) : null;
		const backEls = [draw('bs', B.backSide), draw('bt', B.backTop), draw('bn', B.backNear), draw('ht', B.hrTop), draw('hn', B.hrNear)];
		const seatEls = [draw('ba', B.baseNear), draw('cs', B.cuSide), draw('ct', B.cuTop), draw('cn', B.cuNear)];
		if (aft) {
			const shd = [-1, 1]
				.map((side) => {
					const sp0 = p(side * 320, 0, Zf + 50);
					const rx = 250 * sc;
					const ry = 24 * sc;
					return `M${(sp0[0] - rx).toFixed(1)},${sp0[1].toFixed(1)}a${rx.toFixed(1)},${ry.toFixed(1)} 0 1,0 ${(2 * rx).toFixed(1)},0a${rx.toFixed(1)},${ry.toFixed(1)} 0 1,0 ${(-2 * rx).toFixed(1)},0`;
				})
				.join('');
			rowEls.push(<path key={`sh${row}`} d={shd} fill="#000" fillOpacity={0.22} />);
			rowEls.push(<g key={`r${row}`}>{backEls}{seatEls}</g>, <g key={`pp${row}`}>{people}</g>);
		} else {
			rowEls.push(<g key={`r${row}`}>{seatEls}</g>, <g key={`pp${row}`}>{people}</g>, <g key={`rb${row}`}>{backEls}{labels}</g>);
		}
	}

	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			{shell}
			{endWall}
			{rowEls}
		</g>
	);
};

/* =============================================================== cabin row */

/** Close view of one seat row (4 seats, centres x = 680/860/1040/1220) by a big
 *  window. Occupants are passed as children with feet at y = 900, s = 1.15:
 *  cushion top = 817, seat backs up to ~710, headrests 682-716 behind the heads.
 *  The seats form one continuous row (armrests only at the two ends) so a
 *  passenger can lean on her neighbour. */
export const CabinRow: React.FC<{
	f: number;
	lights?: Lights;
	labels?: [string, string];
	children?: React.ReactNode;
	reflection?: React.ReactNode;
	horizon?: number;
	calm?: number;
}> = ({f, lights = 'on', labels = ['18A', '18B'], children, reflection, horizon = 470, calm = 0}) => {
	const uid = useUid('crow');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 700);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const lamp = lampOf(L);
	const vy = horizon - 60;
	const vp: Pt = [960, vy];
	const Y = 900;
	const s = 1.15;
	const yF = Y - SEAT.topFront * s; // cushion top, front edge
	const yB = Y - SEAT.topBack * s - 6; // cushion top, back edge
	const yFB = Y - SEAT.frontBottom * s; // bottom of the cushion front face
	const rB = (yB - vy) / (yF - vy);
	const rF = 1.03; // feet plane, relative to the cushion front plane
	const floorY = (r: number) => vy + (Y - vy) * (r / rF);
	const rW = 0.9;
	const seamY = floorY(rW);
	const X = (x: number, r: number) => 960 + (x - 960) * r;
	const backTop = Y - SEAT.back * s;
	const hrTop = Y - SEAT.headrest * s;

	const wallC = T('#7f8b9c');
	const seatC = T('#2d4f86');
	const coverC = T('#e8ebef');
	const centres = [680, 860, 1040, 1220];
	const half = 88;

	// window: frame on the wall plane, glass recessed toward the vanishing point
	const wx0 = 360;
	const wx1 = 1560;
	const wy0 = 150;
	const wy1 = 590;
	const kg = 0.94;
	const g0 = toward([wx0, wy0], vp, kg);
	const g1 = toward([wx1, wy1], vp, kg);

	const carpet: string[] = [];
	for (let x = -1500; x <= 3420; x += 70) {
		const xb = 960 + (x - 960) * ((1300 - vy) / (seamY - vy));
		if (xb < -1500 || xb > 3400) continue;
		carpet.push(`M${x},${seamY.toFixed(1)}L${xb.toFixed(1)},1300`);
	}
	for (const r of [0.94, 0.99, 1.06, 1.15, 1.27, 1.43, 1.65]) {
		const y = floorY(r);
		carpet.push(`M-200,${y.toFixed(1)}L2120,${y.toFixed(1)}`);
	}

	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			<defs>
				<clipPath id={`${uid}g`}>
					<rect x={g0[0]} y={g0[1]} width={g1[0] - g0[0]} height={g1[1] - g0[1]} />
				</clipPath>
				<LinGrad id={`${uid}wl`} stops={[[0, L === 'off' ? wallC : mix(wallC, lamp, 0.35)], [0.28, shade(wallC, 0.05)], [0.55, wallC], [1, shade(wallC, -0.38)]]} />
				<LinGrad id={`${uid}fl`} stops={[[0, T('#3b4252')], [1, shade(T('#3b4252'), -0.55)]]} />
				<linearGradient id={`${uid}rf`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0.45" stopColor={lamp} stopOpacity={0} />
					<stop offset="1" stopColor={lamp} stopOpacity={L === 'off' ? 0.02 : 0.1} />
				</linearGradient>
			</defs>
			{/* wall */}
			<rect x={-200} y={30} width={2320} height={seamY - 30} fill={`url(#${uid}wl)`} />
			{/* ceiling + luggage rack with a cove light */}
			<rect x={-200} y={-200} width={2320} height={236} fill={T('#5d6571')} />
			<Box ink={ink} k0={10} b={{x0: -200, y0: 36, x1: 2120, y1: 78, k: rW / 0.985, vp, fill: T('#c3c9d1'), sw: 5}} />
			<path d={qd([[-200, 98], [2120, 98], [2120, 106], [-200, 106]])} fill={lamp} fillOpacity={L === 'off' ? 0.2 : 0.95} />
			{/* window trim, glass + sea, reveals */}
			<path
				d={ink.poly([[wx0 - 22, wy0 - 4], [wx0 - 4, wy0 - 22], [wx1 + 4, wy0 - 22], [wx1 + 22, wy0 - 4], [wx1 + 22, wy1 + 4], [wx1 + 4, wy1 + 22], [wx0 - 4, wy1 + 22], [wx0 - 22, wy1 + 4]], 20, 1.2)}
				fill={T('#c9ced6')}
				stroke={INK}
				strokeWidth={6}
			/>
			<g clipPath={`url(#${uid}g)`}>
				<g transform="translate(0,-60)">
					<OceanNight f={f} horizon={horizon} mood={L === 'red' ? 'red' : L === 'off' ? 'dark' : 'night'} calm={calm} stars moon />
				</g>
				{reflection}
				<path d={qd([[g0[0] + 120, g0[1]], [g0[0] + 330, g0[1]], [g0[0] + 110, g1[1]], [g0[0] - 100, g1[1]]]) + qd([[g0[0] + 380, g0[1]], [g0[0] + 430, g0[1]], [g0[0] + 210, g1[1]], [g0[0] + 160, g1[1]]]) + qd([[960 + 260, g0[1]], [960 + 420, g0[1]], [960 + 200, g1[1]], [960 + 40, g1[1]]])} fill="#fff" fillOpacity={L === 'off' ? 0.015 : 0.035} />
				<rect x={g0[0]} y={g1[1] - 60} width={g1[0] - g0[0]} height={60} fill={lamp} fillOpacity={L === 'off' ? 0.01 : 0.04} />
			</g>
			<path d={ink.poly([[wx0, wy0], [wx1, wy0], [g1[0], g0[1]], g0], 21, 0.8)} fill={T('#7d8590')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([[wx0, wy1], [wx1, wy1], g1, [g0[0], g1[1]]], 22, 0.8)} fill={T('#dfe3e8')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([[wx0, wy0], g0, [g0[0], g1[1]], [wx0, wy1]], 23, 0.8)} fill={T('#a3abb6')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([[wx1, wy0], [g1[0], g0[1]], g1, [wx1, wy1]], 24, 0.8)} fill={T('#a3abb6')} stroke={INK} strokeWidth={3} />
			<path d={ink.rect(951, g0[1], 18, g1[1] - g0[1], 25, 0.8)} fill={T('#aeb5bf')} stroke={INK} strokeWidth={4} />
			<rect x={955} y={g0[1] + 4} width={4} height={g1[1] - g0[1] - 8} fill="#fff" fillOpacity={0.35} />
			{/* chrome handrail with its shadow on the wall */}
			<path d={ink.line(200, 640, 1720, 640, 30, 1, 6)} stroke="#000" strokeWidth={10} strokeOpacity={0.18} fill="none" />
			{[300, 760, 1160, 1620].map((bx, i) => (
				<path key={`br${i}`} d={ink.rect(bx - 5, 626, 10, 14, 31 + i, 0.5)} fill={T('#8a929c')} stroke={INK} strokeWidth={2.5} />
			))}
			<path d={ink.line(200, 626, 1720, 626, 32, 1, 6)} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
			<path d={ink.line(200, 626, 1720, 626, 32, 1, 6)} stroke={T('#c0c6ce')} strokeWidth={10} fill="none" strokeLinecap="round" />
			<path d={ink.line(206, 623, 1714, 623, 32, 1, 6)} stroke="#fff" strokeWidth={2.5} strokeOpacity={L === 'off' ? 0.15 : 0.7} fill="none" />
			{/* seat labels on the sill */}
			{labels.map((l, i) => {
				const cx = [860, 1040][i];
				return (
					<g key={l}>
						<Box ink={ink} k0={40 + i * 6} b={{x0: cx - 38, y0: 548, x1: cx + 38, y1: 578, k: 0.97, vp, fill: T('#f2f2f2'), sw: 3}} />
						<text x={cx} y={571} textAnchor="middle" fontFamily="Patrick Hand" fontSize={24} fill="#111">
							{l}
						</text>
					</g>
				);
			})}
			{/* carpet floor */}
			<rect x={-200} y={seamY} width={2320} height={1400 - seamY} fill={`url(#${uid}fl)`} />
			<path d={carpet.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.16} fill="none" />
			<path d={`M-200,${seamY - 30}h2320v30h-2320Z M-200,${seamY - 14}h2320v14h-2320Z M-200,${seamY}h2320v12h-2320Z`} fill="#000" fillOpacity={0.12} />
			<path d={ink.line(-200, seamY, 2120, seamY, 33, 1, 8)} stroke={INK} strokeWidth={4} fill="none" />
			{/* soft shadow of the whole row */}
			<ellipse cx={955} cy={floorY(0.99)} rx={470} ry={34} fill={S.sh} />
			{/* seat backs + headrests (behind the occupants), batched */}
			{(() => {
				const tops: string[] = [];
				const faces: string[] = [];
				const faceQ: string[] = [];
				const seams: string[] = [];
				const hTops: string[] = [];
				const hFaces: string[] = [];
				const hQ: string[] = [];
				centres.forEach((cx, i) => {
					const x0 = X(cx - half + 1, rB);
					const x1 = X(cx + half - 1, rB);
					const face: Pt[] = [[x0, yB], [x0, backTop + 12], [x0 + 12, backTop], [x1 - 12, backTop], [x1, backTop + 12], [x1, yB]];
					tops.push(ink.poly([[x0 + 12, backTop], [x1 - 12, backTop], toward([x1 - 12, backTop], vp, 0.955), toward([x0 + 12, backTop], vp, 0.955)], 50 + i, 0.8));
					faces.push(ink.poly(face, 55 + i, 0.9));
					faceQ.push(qd(face));
					seams.push(ink.line(X(cx, rB), backTop + 40, X(cx, rB), yB - 10, 60 + i, 0.6, 2));
					const hx0 = X(cx - 56, rB * 1.004);
					const hx1 = X(cx + 56, rB * 1.004);
					const hb = backTop + 8;
					const hface: Pt[] = [[hx0, hb], [hx0, hrTop + 9], [hx0 + 9, hrTop], [hx1 - 9, hrTop], [hx1, hrTop + 9], [hx1, hb]];
					hTops.push(ink.poly([[hx0 + 9, hrTop], [hx1 - 9, hrTop], toward([hx1 - 9, hrTop], vp, 0.96), toward([hx0 + 9, hrTop], vp, 0.96)], 65 + i, 0.6));
					hFaces.push(ink.poly(hface, 70 + i, 0.7));
					hQ.push(qd(hface));
				});
				return (
					<g>
						<path d={tops.join('')} fill={shade(seatC, 0.18)} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
						<path d={faces.join('')} fill={seatC} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
						<path d={faceQ.join('')} fill="#fff" fillOpacity={0.06} />
						<path d={seams.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.18} fill="none" />
						<path d={hTops.join('')} fill={shade(coverC, 0.05)} stroke={INK} strokeWidth={3} />
						<path d={hFaces.join('')} fill={coverC} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />

					</g>
				);
			})()}
			{/* shared base under the cushions */}
			<path d={ink.rect(X(604, 0.975), yFB - 4, X(1296, 0.975) - X(604, 0.975), floorY(0.975) - yFB + 4, 80, 0.8)} fill={T('#171b24')} stroke={INK} strokeWidth={4} />

			{[0.12, 0.88].map((u, i) => {
				const lx = X(604 + u * 692, 0.975);
				return <path key={`lg${i}`} d={ink.rect(lx - 7, floorY(0.975) - 6, 14, 10, 81 + i, 0.5)} fill={T('#9aa2ad')} stroke={INK} strokeWidth={2.5} />;
			})}
			{/* cushions: top face + front face (the occupant sits ON these), batched */}
			{(() => {
				const tops: string[] = [];
				const topQ: string[] = [];
				const fronts: string[] = [];
				const frontQ: string[] = [];
				const lips: string[] = [];
				centres.forEach((cx, i) => {
					const x0 = cx - half + 1;
					const x1 = cx + half - 1;
					const top: Pt[] = [[x0 + 6, yF], [x1 - 6, yF], [X(x1, rB), yB], [X(x0, rB), yB]];
					const front: Pt[] = [[x0, yF + 5], [x0 + 6, yF], [x1 - 6, yF], [x1, yF + 5], [x1 - 1, yFB], [x0 + 1, yFB]];
					tops.push(ink.poly(top, 90 + i, 0.8));
					topQ.push(qd(top));
					fronts.push(ink.poly(front, 95 + i, 0.8));
					frontQ.push(qd(front));
					lips.push(ink.line(x0 + 10, yF + 3, x1 - 10, yF + 3, 99 + i, 0.4, 2));
				});
				return (
					<g>
						<path d={tops.join('')} fill={shade(seatC, 0.2)} stroke={INK} strokeWidth={4} strokeLinejoin="round" />

						<path d={fronts.join('')} fill={shade(seatC, -0.12)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
						<path d={frontQ.join('')} fill="#000" fillOpacity={0.12} />
						<path d={lips.join('')} stroke="#fff" strokeWidth={2} strokeOpacity={L === 'off' ? 0.05 : 0.25} fill="none" />
					</g>
				);
			})()}
			{/* low end armrests */}
			{[-1, 1].map((sd) => {
				const ax0 = sd < 0 ? 556 : 1306;
				const ax1 = sd < 0 ? 594 : 1344;
				return (
					<g key={`ar${sd}`}>
						<Box ink={ink} k0={110 + sd} b={{x0: ax0 + 4, y0: 790, x1: ax1 - 4, y1: floorY(1.0), k: rB, vp, fill: shade(seatC, -0.2), sw: 4}} />
						<Box ink={ink} k0={120 + sd} b={{x0: ax0, y0: 766, x1: ax1, y1: 790, k: rB * 0.99, vp, fill: T('#2a2f3a'), top: T('#4a5262'), sw: 4}} />
					</g>
				);
			})}
			{children}
		</g>
	);
};

/* =============================================================== rear deck */

/** The rear deck: bench, railing, open black sea.
 *  view 'behind' - from behind the bench, facing the open sea (her back to us).
 *                  Occupant at local (0, 860), s = 0.62 -> seat top 815; the backrest
 *                  slats are drawn IN FRONT of the children (top ~776, ~40px above the seat, so shoulders + upper back show).
 *  view 'front'  - from the stern railing looking back at the bench and the lit
 *                  cabin doors. Occupant at local (0, 912), s = 0.75 -> seat top 858;
 *                  backrest behind her, children after the bench.
 *  The bench is translated by benchX (local x = 0 is the bench centre). */
export const RearDeck: React.FC<{
	f: number;
	view?: 'behind' | 'front';
	lights?: Lights;
	calm?: number;
	fog?: number;
	children?: React.ReactNode;
	benchX?: number;
	seaChildren?: React.ReactNode;
	horizon?: number;
	doorsLit?: boolean;
}> = (props) => (props.view === 'front' ? <DeckFront {...props} /> : <DeckBehind {...props} />);

type DeckProps = React.ComponentProps<typeof RearDeck>;

const WOOD = {top: '#8f6539', face: '#6e4a29', dark: '#4a311b', iron: '#1c1c1f'};

const DeckBehind: React.FC<DeckProps> = ({f, lights = 'on', calm = 0, fog = 0.15, children, benchX = 960, seaChildren, horizon = 470}) => {
	const uid = useUid('rdb');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 800);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const lamp = lampOf(L, '#fff2c4');
	const vy = horizon;
	const edge = 700; // far edge of the deck (stern)
	const railC = T('#c9ced5');

	// deck planks converge on the vanishing point
	const planks: string[] = [];
	const alt: string[] = [];
	const ext = (x: number) => 960 + (x - 960) * ((1160 - vy) / (edge - vy));
	for (let i = 0, x = -1600; x <= 3520; x += 46, i++) {
		const xb = ext(x);
		planks.push(`M${x},${edge}L${xb.toFixed(1)},1160`);
		if (i % 2 === 1) alt.push(`M${x - 46},${edge}L${x},${edge}L${xb.toFixed(1)},1160L${ext(x - 46).toFixed(1)},1160Z`);
	}
	// staggered butt joints
	for (let i = 0; i < 70; i++) {
		const x = -1600 + Math.floor(h01(i, 4) * 111) * 46;
		const t = 0.08 + h01(i, 5) * 0.9;
		const y = edge + (1160 - edge) * t * t;
		const xa = 960 + (x - 960) * ((y - vy) / (edge - vy));
		const xb = 960 + (x + 46 - 960) * ((y - vy) / (edge - vy));
		if (xb < -80 || xa > 2000) continue;
		planks.push(`M${xa.toFixed(1)},${y.toFixed(1)}L${xb.toFixed(1)},${y.toFixed(1)}`);
	}

	// ---- bench (3D, local coordinates)
	const s = 0.62;
	const D = 1600;
	const feet = 860;
	const hc = (feet - vy) / s;
	const xc = (benchX - 960) / s;
	const kz = (z: number) => (s * D) / (D + z);
	const pb = (X: number, H: number, z: number): Pt => [(xc + X) * kz(z) - xc * s, vy + (hc - H) * kz(z)];
	const Lb = 330;
	const q = (pts: Pt[], k: number, fill: string, w = 3) => <path key={`b${k}`} d={ink.poly(pts, 300 + k, 0.7)} fill={fill} stroke={INK} strokeWidth={w} strokeLinejoin="round" />;
	const seat: React.ReactNode[] = [];
	// front legs (far side, toward the sea)
	for (const sx of [-1, 1]) {
		const X = sx * (Lb - 30);
		seat.push(q([pb(X - 6, 66, 30), pb(X + 6, 66, 30), pb(X + 6, 0, 30), pb(X - 6, 0, 30)], 1 + sx, T(WOOD.iron), 2.5));
		seat.push(q([pb(sx * Lb - 5, 112, 32), pb(sx * Lb + 5, 112, 32), pb(sx * Lb + 5, 0, 32), pb(sx * Lb - 5, 0, 32)], 5 + sx, T(WOOD.iron), 2.5));
	}
	// seat slats (top faces) + rear edge
	seat.push(
		<path
			key="slats"
			d={[[30, 12], [9, -9], [-12, -30]].map(([za, zb], i) => ink.poly([pb(-Lb, SEAT.cushion, za), pb(Lb, SEAT.cushion, za), pb(Lb, SEAT.cushion, zb), pb(-Lb, SEAT.cushion, zb)], 310 + i, 0.7)).join('')}
			fill={T(WOOD.top)}
			stroke={INK}
			strokeWidth={2.5}
			strokeLinejoin="round"
		/>,
	);
	seat.push(q([pb(-Lb, SEAT.cushion, -30), pb(Lb, SEAT.cushion, -30), pb(Lb, 64, -30), pb(-Lb, 64, -30)], 14, T(WOOD.dark), 2.5));
	// backrest in FRONT of the occupant (we are behind the bench)
	const front: React.ReactNode[] = [];
	for (const sx of [-1, 1]) {
		const X = sx * (Lb - 22);
		// armrest bar from the front post to the back post
		front.push(q([pb(sx * Lb - 6, 116, 34), pb(sx * Lb + 6, 116, 34), pb(sx * Lb + 6, 108, -40), pb(sx * Lb - 6, 108, -40)], 20 + sx, T(WOOD.iron), 2.5));
		front.push(q([pb(X - 7, 150, -38), pb(X + 7, 150, -38), pb(X + 7, 0, -38), pb(X - 7, 0, -38)], 24 + sx, T(WOOD.iron), 2.5));
	}
	{
		const sl = [[78, 96], [104, 122], [130, 147]].map(([h0, h1]) => [pb(-Lb + 6, h1, -36), pb(Lb - 6, h1, -36), pb(Lb - 6, h0, -36), pb(-Lb + 6, h0, -36)] as Pt[]);
		front.push(<path key="bsl" d={sl.map((fc, i) => ink.poly(fc, 330 + i, 0.7)).join('')} fill={T(WOOD.face)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />);
		front.push(<path key="bss" d={sl.map((fc) => qd(fc)).join('')} fill="#000" fillOpacity={0.18} />);
		front.push(<path key="bsh" d={sl.map((fc, i) => ink.line(fc[0][0] + 4, fc[0][1] + 2, fc[1][0] - 4, fc[1][1] + 2, 40 + i, 0.4, 3)).join('')} stroke="#e6c08a" strokeWidth={2} strokeOpacity={L === 'off' ? 0.1 : 0.45} fill="none" />);
	}

	const lit = L !== 'off';
	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			<OceanNight f={f} horizon={horizon} calm={calm} fog={fog} mood={L === 'red' ? 'red' : L === 'off' ? 'dark' : 'night'} moon />
			{seaChildren}
			{/* deck */}
			<defs>
				<LinGrad id={`${uid}dk`} stops={[[0, T('#4d535d')], [1, shade(T('#4d535d'), -0.4)]]} />
			</defs>
			<rect x={-200} y={edge} width={2320} height={600} fill={`url(#${uid}dk)`} />
			<path d={alt.join('')} fill="#fff" fillOpacity={0.035} />
			<path d={planks.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.38} fill="none" />
			{lit ? <ellipse cx={300} cy={780} rx={560} ry={150} fill={S.gl} fillOpacity={0.75} /> : null}
			{lit ? <ellipse cx={262} cy={835} rx={34} ry={140} fill={lamp} fillOpacity={0.06} /> : null}
			<path d={`M-200,${edge}h2320v12h-2320Z M-200,${edge}h2320v26h-2320Z`} fill="#000" fillOpacity={0.18} />
			{/* toe board + railing */}
			<Box ink={ink} k0={60} b={{x0: -200, y0: 688, x1: 2120, y1: 704, k: 0.985, vp: [960, vy], fill: T('#aab1ba'), sw: 3}} />
			<path d={Array.from({length: 13}, (_, i) => ink.rect(-25 + i * 165, 606, 10, 86, 70 + i, 0.6)).join('')} fill={railC} stroke={INK} strokeWidth={3} />
			<path d={Array.from({length: 13}, (_, i) => `M${-17 + i * 165},608L${-17 + i * 165},690`).join('')} stroke="#fff" strokeWidth={2.5} strokeOpacity={lit ? 0.45 : 0.1}  fill="none" />
			<path d={ink.line(-200, 655, 2120, 655, 90, 1, 8) + ink.line(-200, 610, 2120, 610, 91, 1, 8)} stroke={INK} strokeWidth={15} fill="none" />
			<path d={ink.line(-200, 655, 2120, 655, 90, 1, 8) + ink.line(-200, 610, 2120, 610, 91, 1, 8)} stroke={railC} strokeWidth={9} fill="none" />
			<path d={ink.line(-200, 652, 2120, 652, 90, 1, 8) + ink.line(-200, 607, 2120, 607, 91, 1, 8)} stroke="#fff" strokeWidth={2} strokeOpacity={lit ? 0.6 : 0.15} fill="none" />
			{/* mooring bitts + rope coil */}
			<ellipse cx={560} cy={748} rx={78} ry={12} fill="#000" fillOpacity={0.25} />
			<Box ink={ink} k0={100} b={{x0: 500, y0: 728, x1: 620, y1: 746, k: 0.96, vp: [960, vy], fill: T('#2b2f36'), sw: 3}} />
			<path d={ink.rect(514, 694, 22, 40, 104, 0.6) + ink.rect(584, 694, 22, 40, 105, 0.6)} fill={T('#31363e')} stroke={INK} strokeWidth={3} />
			<path d={ink.ellipse(525, 694, 13, 5, 108, 0.4, 8) + ink.ellipse(595, 694, 13, 5, 109, 0.4, 8)} fill={T('#4a505a')} stroke={INK} strokeWidth={2.5} />
			<path d={[0, 1, 2].map((i) => ink.ellipse(690, 745 - i * 5, 46 - i * 9, 12 - i * 2, 112 + i, 0.8, 10)).join('')} fill="none" stroke={T('#b59a62')} strokeWidth={6} />
			{/* deck locker (right) */}
			<ellipse cx={1720} cy={808} rx={150} ry={18} fill="#000" fillOpacity={0.25} />
			<Box ink={ink} k0={120} b={{x0: 1610, y0: 735, x1: 1840, y1: 806, k: 0.86, vp: [960, vy], fill: T('#c9cdd3'), sw: 4}} />
			<text x={1725} y={780} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={17} fill={T('#c0392b')}>
				LIFE JACKETS
			</text>
			{/* lifebuoy on the railing */}
			<g transform="translate(1440, 640)">
				<path d={ink.ellipse(4, 6, 46, 46, 130, 1, 12)} fill="none" stroke="#000" strokeWidth={22} strokeOpacity={0.25} />
				<path d={ink.ellipse(0, 0, 42, 42, 131, 1, 12)} fill="none" stroke={INK} strokeWidth={26} />
				<path d={ink.ellipse(0, 0, 42, 42, 131, 1, 12)} fill="none" stroke={T('#e8521d')} strokeWidth={19} />
				<path d={ink.ellipse(0, 0, 42, 42, 131, 1, 12)} fill="none" stroke={T('#f4f4f4')} strokeWidth={19} strokeDasharray="22 44" />
				<path d="M-30,-22 Q-10,-40 18,-36" stroke="#fff" strokeWidth={4} strokeOpacity={lit ? 0.5 : 0.1} fill="none" strokeLinecap="round" />
			</g>
			{/* stern lamp: pole, head, light cone */}
			{lit ? <path d={qd([[244, 392], [280, 392], [470, edge + 10], [60, edge + 10]])} fill={S.cone} fillOpacity={0.75} /> : null}
			<path d={ink.rect(255, 384, 12, edge + 6 - 384, 140, 0.6)} fill={T('#2a2c30')} stroke={INK} strokeWidth={3} />
			<rect x={258} y={388} width={3} height={edge - 390} fill="#fff" fillOpacity={0.3} />
			<path d={ink.poly([[240, 356], [282, 356], [276, 392], [246, 392]], 141, 0.6)} fill={L === 'off' ? '#222' : lamp} stroke={INK} strokeWidth={3} />
			<path d={ink.rect(236, 348, 50, 10, 142, 0.5)} fill={T('#2a2c30')} stroke={INK} strokeWidth={3} />
			{lit ? <ellipse cx={261} cy={378} rx={240} ry={240} fill={S.gl} /> : null}
			{/* bench: shadow, legs, seat -> occupant -> backrest */}
			<g transform={`translate(${benchX},0)`}>
				<ellipse cx={pb(0, 0, 0)[0]} cy={pb(0, 0, 0)[1] + 4} rx={Lb * s * 1.12} ry={32} fill={S.sh} />
				{seat}
				{children}
				{front}
			</g>
		</g>
	);
};

const DeckFront: React.FC<DeckProps> = ({f, lights = 'on', children, benchX = 960, doorsLit = true}) => {
	const uid = useUid('rdf');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 850);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const warm = L === 'red' ? '#ff3a28' : L === 'off' ? '#111' : '#ffe39a';
	const lamp = lampOf(L, '#ffe2a0');
	const vy = 520;
	const feet = 912;
	const s = 0.75;
	const D = 1600;
	const hc = (feet - vy) / s;
	const kw = (800 - vy) / hc; // wall plane
	const pw = (X: number, H: number, k: number): Pt => [960 + X * k, vy + (hc - H) * k];
	const Wd = 1150;
	const lit = L !== 'off';
	const doorLight = L === 'on' || L === 'dim';
	const winFill = (on: boolean) => (L === 'off' ? '#0c0d10' : L === 'red' ? (on ? '#8a1a1a' : '#3a0c0c') : on ? warm : '#2f3746');
	const rectW = (X0: number, X1: number, H0: number, H1: number, k: number): Pt[] => [pw(X0, H1, k), pw(X1, H1, k), pw(X1, H0, k), pw(X0, H0, k)];

	// deck planks along the ship (converging)
	const planks: string[] = [];
	for (let X = -Wd; X <= Wd; X += 62) {
		const a = pw(X, 0, kw);
		const b = pw(X, 0, 2.4);
		planks.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
	}
	for (let i = 0; i < 46; i++) {
		const X = -Wd + Math.floor(h01(i, 7) * 37) * 62;
		const k = kw + (2.2 - kw) * Math.pow(h01(i, 8), 1.8);
		const a = pw(X, 0, k);
		const b = pw(X + 62, 0, k);
		planks.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
	}
	// side railings (receding)
	const sidePosts: string[] = [];
	for (const sd of [-1, 1]) {
		for (const k of [kw, 0.6, 0.68, 0.78, 0.9, 1.04, 1.2, 1.4]) {
			const a = pw(sd * Wd - 5, 110, k);
			const b = pw(sd * Wd + 5, 0, k);
			sidePosts.push(qd([a, [b[0], a[1]], b, [a[0], b[1]]]));
		}
	}
	const upWin: Array<[number, number]> = [[-900, -600], [-540, -280], [-240, 240], [280, 540], [600, 900]];
	const lowWin: Array<[number, number]> = [[-1060, -760], [-690, -390], [-320, -175], [175, 320], [390, 690], [760, 1060]];

	// ---- bench (3D, local coordinates), occupant sits ON it
	const xc = (benchX - 960) / s;
	const kz = (z: number) => (s * D) / (D + z);
	const pb = (X: number, H: number, z: number): Pt => [(xc + X) * kz(z) - xc * s, vy + (hc - H) * kz(z)];
	const Lb = 300;
	const q = (pts: Pt[], k: number, fill: string, w = 3) => <path key={`q${k}`} d={ink.poly(pts, 400 + k, 0.7)} fill={fill} stroke={INK} strokeWidth={w} strokeLinejoin="round" />;
	const bench: React.ReactNode[] = [];
	// cast shadow thrown toward the camera by the door light + contact shadow
	if (doorLight) bench.push(<path key="cast" d={qd([pb(-Lb, 0, 70), pb(Lb, 0, 70), pb(Lb * 1.45, 0, -330), pb(-Lb * 1.45, 0, -330)])} fill={S.up} fillOpacity={0.9} />);
	bench.push(<ellipse key="ao" cx={pb(0, 0, 30)[0]} cy={pb(0, 0, 30)[1]} rx={Lb * s * 1.1} ry={22} fill="#000" fillOpacity={0.3} />);
	// back legs / posts (far)
	for (const sx of [-1, 1]) {
		const X = sx * (Lb - 24);
		bench.push(q([pb(X - 7, 0, 68), pb(X + 7, 0, 68), pb(X + 7, 168, 96), pb(X - 7, 168, 96)], 1 + sx, T(WOOD.iron), 2.5));
	}
	// backrest slats (reclined, behind her torso)
	{
		const faces: string[] = [];
		const tops: string[] = [];
		const hls: string[] = [];
		[[86, 108], [116, 138], [146, 166]].forEach(([h0, h1], i) => {
			const zA = 66 + ((h0 - 80) / 90) * 30;
			const zB = 66 + ((h1 - 80) / 90) * 30;
			const face: Pt[] = [pb(-Lb, h1, zB), pb(Lb, h1, zB), pb(Lb, h0, zA), pb(-Lb, h0, zA)];
			faces.push(ink.poly(face, 410 + i, 0.7));
			hls.push(qd([face[0], face[1], [face[1][0], face[1][1] + 6], [face[0][0], face[0][1] + 6]]));
			tops.push(ink.poly([pb(-Lb, h1, zB), pb(Lb, h1, zB), pb(Lb, h1, zB + 6), pb(-Lb, h1, zB + 6)], 414 + i, 0.7));
		});
		bench.push(<path key="bkf" d={faces.join('')} fill={T(WOOD.face)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />);
		bench.push(<path key="bkh" d={hls.join('')} fill="#fff" fillOpacity={0.12} />);
		bench.push(<path key="bkt" d={tops.join('')} fill={T(WOOD.top)} stroke={INK} strokeWidth={2} strokeLinejoin="round" />);
		// seat slats (top)
		bench.push(
			<path
				key="sst"
				d={[[-4, 18], [22, 42], [46, 64]].map(([za, zb], i) => ink.poly([pb(-Lb, SEAT.topFront + i * 2 + 1, zb), pb(Lb, SEAT.topFront + i * 2 + 1, zb), pb(Lb, SEAT.topFront + i * 2, za), pb(-Lb, SEAT.topFront + i * 2, za)], 420 + i, 0.7)).join('')}
				fill={T(WOOD.top)}
				stroke={INK}
				strokeWidth={2.5}
				strokeLinejoin="round"
			/>,
		);
	}
	const apron: Pt[] = [pb(-Lb, SEAT.topFront, -4), pb(Lb, SEAT.topFront, -4), pb(Lb, SEAT.frontBottom, -4), pb(-Lb, SEAT.frontBottom, -4)];
	bench.push(q(apron, 30, T(WOOD.face), 3));
	bench.push(<path key="apS" d={qd([apron[3], apron[2], [apron[2][0], apron[2][1] - 8], [apron[3][0], apron[3][1] - 8]])} fill="#000" fillOpacity={0.2} />);
	// end frames: front legs + armrests (at the ends, never in front of the occupant)
	for (const sx of [-1, 1]) {
		const X = sx * Lb;
		bench.push(q([pb(X - 7, 124, -6), pb(X + 7, 124, -6), pb(X + 7, 0, -6), pb(X - 7, 0, -6)], 40 + sx, T(WOOD.iron), 2.5));
		bench.push(q([pb(X - 7, 128, -10), pb(X + 7, 128, -10), pb(X + 7, 120, 72), pb(X - 7, 120, 72)], 44 + sx, T('#2a2a2e'), 2.5));
	}

	const dLeft = rectW(-130, 130, 0, 425, kw);
	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			<defs>
				<LinGrad id={`${uid}dk`} stops={[[0, T('#4d535d')], [1, shade(T('#4d535d'), -0.38)]]} />
				<LinGrad id={`${uid}lw`} stops={[[0, T('#c8ccd2')], [1, shade(T('#c8ccd2'), -0.22)]]} />
				<LinGrad id={`${uid}uw`} stops={[[0, T('#d3d8de')], [1, shade(T('#d3d8de'), -0.18)]]} />
			</defs>
			<OceanNight f={f} horizon={vy} mood={L === 'red' ? 'red' : 'dark'} stars />
			{/* side railings far ends */}
			<path d={sidePosts.join('')} fill={T('#b9bfc7')} stroke={INK} strokeWidth={2} />
			{[-1, 1].map((sd) => (
				<g key={`srl${sd}`}>
					<path d={ink.poly([pw(sd * Wd, 110, kw), pw(sd * Wd, 110, 2.4)], 10 + sd, 1, false)} stroke={INK} strokeWidth={14} fill="none" />
					<path d={ink.poly([pw(sd * Wd, 110, kw), pw(sd * Wd, 110, 2.4)], 10 + sd, 1, false)} stroke={T('#c9ced5')} strokeWidth={8} fill="none" />
					<path d={ink.poly([pw(sd * Wd, 55, kw), pw(sd * Wd, 55, 2.4)], 12 + sd, 1, false)} stroke={T('#aab0b8')} strokeWidth={6} fill="none" />
				</g>
			))}
			{/* superstructure: upper level (set back), slab, lower level */}
			<path d={ink.poly(rectW(-1020, 1020, 1060, 1095, 0.5), 20, 1)} fill={T('#e6e9ed')} stroke={INK} strokeWidth={4} />
			<path d={ink.line(960, 252, 960, 140, 21, 0.6, 2)} stroke={T('#30343a')} strokeWidth={6} fill="none" />
			<circle cx={960} cy={136} r={6} fill={lit ? '#fff' : '#333'} />
			{lit ? <circle cx={960} cy={136} r={26} fill="#fff" fillOpacity={0.12} /> : null}
			<path d={ink.poly(rectW(-1000, 1000, 600, 1060, 0.5), 22, 1)} fill={`url(#${uid}uw)`} stroke={INK} strokeWidth={5} />
			<path d={upWin.map(([a, b], i) => ink.poly(rectW(a, b, 700, 900, 0.5), 30 + i, 0.8)).join('')} fill={winFill(doorsLit)} stroke={INK} strokeWidth={4} />
			{/* upper deck railing on the slab */}
			<path
				d={Array.from({length: 17}, (_, i) => {
					const X = -1150 + i * 143.75;
					const a = pw(X, 600, 0.548);
					const b = pw(X, 700, 0.548);
					return `M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
				}).join('')}
				stroke={T('#c9ced5')}
				strokeWidth={3}
				fill="none"
			/>
			<path d={ink.poly([pw(-1150, 700, 0.548), pw(1150, 700, 0.548)], 40, 0.8, false)} stroke={T('#c9ced5')} strokeWidth={5} fill="none" />
			<Box ink={ink} k0={41} b={{x0: pw(-1170, 0, 0.548)[0], y0: pw(0, 600, 0.548)[1], x1: pw(1170, 0, 0.548)[0], y1: pw(0, 560, 0.548)[1], k: kw / 0.548, vp: [960, vy], fill: T('#e3e6ea'), sw: 4}} />
			<path d={ink.poly(rectW(-Wd, Wd, 0, 560, kw), 42, 1.2)} fill={`url(#${uid}lw)`} stroke={INK} strokeWidth={5} />
			<path d={qd(rectW(-Wd, Wd, 520, 560, kw))} fill="#000" fillOpacity={0.2} />
			<path d={lowWin.map(([a, b], i) => ink.poly(rectW(a, b, 210, 410, kw), 50 + i, 0.8)).join('')} fill={winFill(doorsLit)} stroke={INK} strokeWidth={4} />
			<path d={lowWin.map(([a, b]) => qd(rectW(a - 8, b + 8, 198, 210, kw))).join('')} fill={T('#e5e8ec')} stroke={INK} strokeWidth={2} />
			<path d={[...lowWin.map(([a, b]) => qd(rectW(a + 20, a + (b - a) * 0.35, 260, 410, kw))), ...upWin.map(([a, b]) => qd(rectW(a + 20, a + (b - a) * 0.35, 750, 900, 0.5)))].join('')} fill="#fff" fillOpacity={0.08} />
			{/* recessed double doors with lit glass */}
			<path d={qd(dLeft)} fill={T('#1a1d22')} />
			<path d={ink.poly([pw(-130, 425, kw), pw(-130, 425, 0.53), pw(-130, 0, 0.53), pw(-130, 0, kw)], 60, 0.6)} fill={T('#8d96a1')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([pw(130, 425, kw), pw(130, 425, 0.53), pw(130, 0, 0.53), pw(130, 0, kw)], 61, 0.6)} fill={T('#8d96a1')} stroke={INK} strokeWidth={3} />
			{[-1, 1].map((sd) => {
				const leaf = rectW(sd < 0 ? -128 : 2, sd < 0 ? -2 : 128, 0, 412, 0.53);
				const glass = rectW(sd < 0 ? -110 : 20, sd < 0 ? -20 : 110, 230, 385, 0.53);
				return (
					<g key={`door${sd}`}>
						<path d={ink.poly(leaf, 62 + sd, 0.6)} fill={T('#9aa3ae')} stroke={INK} strokeWidth={3.5} />

						<path d={ink.poly(glass, 64 + sd, 0.5)} fill={L === 'off' ? '#111' : L === 'red' ? '#a02020' : '#ffe39a'} stroke={INK} strokeWidth={3} />

						<path d={ink.rect(pw(sd * 14, 0, 0.53)[0] - 3, pw(0, 200, 0.53)[1], 6, 22, 66 + sd, 0.4)} fill={T('#3a3f46')} stroke={INK} strokeWidth={2} />
					</g>
				);
			})}
			{/* lamp over the doors */}
			<Box ink={ink} k0={70} b={{x0: 944, y0: pw(0, 470, kw)[1] - 8, x1: 976, y1: pw(0, 470, kw)[1] + 6, k: 0.97, vp: [960, vy], fill: lit ? lamp : '#333', sw: 2.5}} />
			{lit ? <ellipse cx={960} cy={pw(0, 470, kw)[1]} rx={180} ry={120} fill={S.gl} /> : null}
			{/* deck */}
			<path d={qd([pw(-Wd, 0, kw), pw(Wd, 0, kw), pw(Wd, 0, 1.6), pw(-Wd, 0, 1.6)])} fill={`url(#${uid}dk)`} />
			<path d={planks.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.35} fill="none" />
			{doorLight ? <path d={qd([pw(-140, 0, kw), pw(140, 0, kw), pw(330, 0, 1.15), pw(-330, 0, 1.15)])} fill={S.cone} fillOpacity={0.6} /> : null}
			{doorsLit && doorLight ? <path d={lowWin.map(([a, b]) => qd([pw(a, 0, kw), pw(b, 0, kw), pw(b * 1.15, 0, 0.75), pw(a * 1.15, 0, 0.75)])).join('')} fill={lamp} fillOpacity={0.07} /> : null}
			<path d={qd([pw(-Wd, 0, kw), pw(Wd, 0, kw), pw(Wd, 0, kw * 1.05), pw(-Wd, 0, kw * 1.05)]) + qd(rectW(-Wd, Wd, 0, 40, kw))} fill="#000" fillOpacity={0.2} />
			<path d={ink.line(pw(-Wd, 0, kw)[0], 800, pw(Wd, 0, kw)[0], 800, 80, 1, 6)} stroke={INK} strokeWidth={4} fill="none" />
			{/* bench (everything before the occupant) */}
			<g transform={`translate(${benchX},0)`}>
				{bench}
				{children}
			</g>
			{/* foreground stern railing (below the bench, close to camera) */}
			{(() => {
				const kn = 1.31;
				const top = pw(0, 110, kn)[1];
				return (
					<g>
						<path d={Array.from({length: 15}, (_, i) => ink.rect(pw(-1050 + i * 150, 110, kn)[0] - 8, top, 16, 200, 90 + i, 0.6)).join('')} fill={T('#c9ced5')} stroke={INK} strokeWidth={4} />
						<path d={Array.from({length: 15}, (_, i) => `M${pw(-1050 + i * 150, 110, kn)[0] - 3},${top + 4}L${pw(-1050 + i * 150, 110, kn)[0] - 3},${top + 200}`).join('')} stroke="#fff" strokeWidth={3} strokeOpacity={lit ? 0.4 : 0.1}  fill="none" />
						<path d={ink.line(-200, top, 2120, top, 110, 1, 8)} stroke={INK} strokeWidth={24} fill="none" />
						<path d={ink.line(-200, top, 2120, top, 110, 1, 8)} stroke={T('#c9ced5')} strokeWidth={16} fill="none" />
						<path d={ink.line(-200, top - 4, 2120, top - 4, 110, 1, 8)} stroke="#fff" strokeWidth={3} strokeOpacity={lit ? 0.55 : 0.15} fill="none" />
					</g>
				);
			})()}
		</g>
	);
};

/* ================================================================== bridge */

/** The bridge: wraparound windows over a console of navigation electronics.
 *  `outside` replaces the sea in the windows; `screens` and `children` are drawn
 *  on top in stage coordinates. */
export const Bridge: React.FC<{
	f: number;
	lights?: Lights;
	screens?: React.ReactNode;
	outside?: React.ReactNode;
	calm?: number;
	children?: React.ReactNode;
}> = ({f, lights = 'on', screens, outside, calm = 0, children}) => {
	const uid = useUid('brg');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 1100);
	const L = lights;
	const T = (cc: string) => tone(cc, L === 'on' ? 'dim' : L);
	const red = L === 'red';
	const c: Cam3 = {vx: 960, vy: 330, F: 1000, eye: 640};
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const Zf = 1200;
	const Zs = 520;
	const Wb = 960;
	const lo = 450;
	const hi = 880;
	const band: Pt[] = [p(-Wb, hi, Zs), p(-Wb, hi, Zf), p(Wb, hi, Zf), p(Wb, hi, Zs), p(Wb, lo, Zs), p(Wb, lo, Zf), p(-Wb, lo, Zf), p(-Wb, lo, Zs)];
	const frame = T('#3a4250');
	const glowC = red ? '#ff4a3a' : '#7fd7ff';
	const posts: Array<[number, number, number]> = [
		[-Wb, -Wb + 40, Zf],
		[-560, -520, Zf],
		[-180, -140, Zf],
		[140, 180, Zf],
		[520, 560, Zf],
		[Wb - 40, Wb, Zf],
	];
	const sidePosts = [700, 880, 1040];
	const monitors: Array<{X0: number; X1: number; kind: 'radar' | 'chart' | 'eng' | 'radio'}> = [
		{X0: -760, X1: -460, kind: 'chart'},
		{X0: -300, X1: -60, kind: 'radar'},
		{X0: 60, X1: 300, kind: 'radar'},
		{X0: 460, X1: 760, kind: 'eng'},
	];
	return (
		<g>
			<ShadeDefs id={uid} glow={glowC} />
			<defs>
				<clipPath id={`${uid}w`}>
					<path d={qd(band)} />
				</clipPath>
			</defs>
			<rect x={-200} y={-200} width={2320} height={1500} fill={red ? '#1c0606' : '#11151d'} />
			<g clipPath={`url(#${uid}w)`}>
				{outside ?? <OceanNight f={f} horizon={330} calm={calm} mood={red ? 'red' : 'dark'} />}
				<path d={qd(band)} fill={S.sp} />
			</g>
			{/* ceiling + header above the windows */}
			<path d={qd([p(-Wb, 960, Zs), p(Wb, 960, Zs), p(Wb, 960, Zf), p(-Wb, 960, Zf)])} fill={T('#2a303a')} />
			<path d={qd([p(-Wb, 960, Zf), p(Wb, 960, Zf), p(Wb, hi, Zf), p(-Wb, hi, Zf)])} fill={frame} stroke={INK} strokeWidth={5} />
			{[-1, 1].map((sd) => (
				<path key={`hd${sd}`} d={qd([p(sd * Wb, 960, Zs), p(sd * Wb, 960, Zf), p(sd * Wb, hi, Zf), p(sd * Wb, hi, Zs)])} fill={shade(frame, -0.15)} stroke={INK} strokeWidth={5} />
			))}
			{[-480, 0, 480].map((X, i) => {
				const a = p(X, 960, 700);
				return (
					<g key={`dl${i}`}>
						<ellipse cx={a[0]} cy={a[1] + 6} rx={26} ry={8} fill={red ? '#ff3a28' : '#ffcf8a'} fillOpacity={0.8} />
						<ellipse cx={a[0]} cy={a[1] + 40} rx={110} ry={60} fill={red ? '#ff3a28' : '#ffcf8a'} fillOpacity={0.06} />
					</g>
				);
			})}
			{/* window posts with depth */}
			{posts.map(([X0, X1], i) => (
				<Box3 key={`post${i}`} ink={ink} k0={10 + i * 6} c={c} b={{X0, X1, H0: lo, H1: hi, Z0: Zf - 30, Z1: Zf, fill: frame, sw: 5}} />
			))}
			{[-1, 1].map((sd) =>
				sidePosts.map((Z, i) => {
					const a = p(sd * Wb, hi, Z);
					const b = p(sd * Wb, lo, Z);
					return <path key={`sp${sd}${i}`} d={ink.poly([[a[0] - 14, a[1]], [a[0] + 14, a[1]], [b[0] + 14, b[1]], [b[0] - 14, b[1]]], 60 + i + sd * 5, 0.8)} fill={frame} stroke={INK} strokeWidth={5} />;
				}),
			)}
			<path d={ink.poly(band, 70, 1)} fill="none" stroke={INK} strokeWidth={8} />
			{/* sill ledge + side walls below the windows */}
			<Box3 ink={ink} k0={80} c={c} b={{X0: -Wb, X1: Wb, H0: 420, H1: lo, Z0: 1000, Z1: Zf, fill: T('#2e3540'), sw: 5, open: true}} />
			{[-1, 1].map((sd) => (
				<path key={`lw${sd}`} d={qd([p(sd * Wb, lo, Zs), p(sd * Wb, lo, Zf), p(sd * Wb, 0, Zf), p(sd * Wb, 0, Zs)])} fill={T('#262c35')} stroke={INK} strokeWidth={5} />
			))}
			{/* console: big 3D desk with a slanted top */}
			<Box3 ink={ink} k0={90} c={c} b={{X0: -900, X1: 900, H0: 0, H1: 420, Z0: 700, Z1: 1000, fill: T('#2b313c'), top: T('#3c4452'), sw: 6, nearShade: S.dn, topShade: S.up}} />
			{monitors.map((m, i) => {
				const n0 = p(m.X0 + 14, 600, 905);
				const n1 = p(m.X1 - 14, 440, 905);
				const cx = (n0[0] + n1[0]) / 2;
				const cy = (n0[1] + n1[1]) / 2;
				const w = n1[0] - n0[0];
				const h = n1[1] - n0[1];
				const on = L !== 'off';
				return (
					<g key={`mon${i}`}>
						<Box3 ink={ink} k0={100 + i * 8} c={c} b={{X0: m.X0, X1: m.X1, H0: 425, H1: 615, Z0: 895, Z1: 935, fill: '#16191f', sw: 4}} />
						<rect x={n0[0]} y={n0[1]} width={w} height={h} fill={on ? (red ? '#240505' : '#05140f') : '#050608'} />
						{on && m.kind === 'radar' ? (
							<g>
								<ellipse cx={cx} cy={cy} rx={h * 0.42} ry={h * 0.42} fill="none" stroke={red ? '#ff5a4a' : '#3cf08a'} strokeWidth={2} strokeOpacity={0.7} />
								<ellipse cx={cx} cy={cy} rx={h * 0.22} ry={h * 0.22} fill="none" stroke={red ? '#ff5a4a' : '#3cf08a'} strokeWidth={1.5} strokeOpacity={0.5} />
								<path d={`M${cx},${cy} L${cx + Math.cos(f / 9 + i) * h * 0.42},${cy + Math.sin(f / 9 + i) * h * 0.42}`} stroke={red ? '#ff8a7a' : '#7dffb0'} strokeWidth={2.5} />
							</g>
						) : null}
						{on && m.kind === 'chart' ? (
							<g opacity={0.85}>
								<rect x={n0[0]} y={n0[1]} width={w} height={h} fill="#0b2a4a" />
								<path d={`M${n0[0] + w * 0.1},${cy + h * 0.2} Q${cx},${cy - h * 0.3} ${n1[0] - w * 0.1},${cy}`} stroke="#9fd0ff" strokeWidth={2} fill="none" strokeDasharray="5 4" />
								<circle cx={cx} cy={cy - h * 0.05} r={4} fill="#ffcf6b" />
							</g>
						) : null}
						{on && m.kind === 'eng' ? (
							<g>
								{[0, 1, 2, 3].map((b) => (
									<rect key={b} x={n0[0] + w * (0.12 + b * 0.2)} y={n1[1] - h * (0.25 + 0.5 * h01(b, i))} width={w * 0.12} height={h * (0.25 + 0.5 * h01(b, i)) - 6} fill={b === 3 ? '#ffb02e' : '#35d06a'} fillOpacity={0.8} />
								))}
							</g>
						) : null}
						{on ? <ellipse cx={cx} cy={n1[1] + 30} rx={w * 0.5} ry={30} fill={glowC} fillOpacity={0.08} /> : null}
					</g>
				);
			})}
			{/* console front: panels, vents, switches */}
			{[-1, 1].map((sd) =>
				[0, 1, 2].map((i) => {
					const X0 = sd < 0 ? -840 + i * 250 : 340 + i * 250;
					const a = p(X0, 380, 700);
					const b = p(X0 + 200, 120, 700);
					return (
						<g key={`cp${sd}${i}`}>
							<path d={ink.rect(a[0], a[1], b[0] - a[0], b[1] - a[1], 200 + i + sd * 7, 0.8)} fill={T('#262b34')} stroke={INK} strokeWidth={4} />
							<path d={Array.from({length: 5}, (_, k) => `M${a[0] + 24},${a[1] + 30 + k * 26}L${b[0] - 24},${a[1] + 30 + k * 26}`).join('')} stroke="#000" strokeWidth={5} strokeOpacity={0.35}  fill="none" />
							{[0, 1, 2].map((k) => (
								<circle key={k} cx={a[0] + 40 + k * 50} cy={b[1] - 40} r={9} fill={L === 'off' ? '#222' : h01(k, i, Math.floor(f / 25) + sd) > 0.4 ? (k === 2 ? '#ff5a4a' : '#35d06a') : '#1a1f1a'} stroke={INK} strokeWidth={2} />
							))}
						</g>
					);
				}),
			)}
			{/* throttle levers */}
			{[-1, 1].map((sd) => {
				const a = p(sd * 60, 425, 800);
				const b = p(sd * 60 + sd * 10, 520, 830);
				return (
					<g key={`lev${sd}`}>
						<path d={`M${a[0]},${a[1]}L${b[0]},${b[1]}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
						<path d={`M${a[0]},${a[1]}L${b[0]},${b[1]}`} stroke="#8a929c" strokeWidth={7} strokeLinecap="round" />
						<circle cx={b[0]} cy={b[1]} r={12} fill={sd < 0 ? '#c0392b' : '#27ae60'} stroke={INK} strokeWidth={3} />
					</g>
				);
			})}
			{screens}
			{/* indicator lights on the console front */}
			{Array.from({length: 18}, (_, i) => (
				<circle key={`led${i}`} cx={120 + i * 95} cy={1040} r={7} fill={h01(i, Math.floor(f / 20)) > 0.5 ? (i % 3 ? '#35d06a' : '#ffb02e') : '#1a1f1a'} />
			))}
			{children}
		</g>
	);
};

/* ================================================================ corridor */

/** Metal corridor below decks (one-point perspective, steel doors, pipes, lamps). */
export const FerryCorridor: React.FC<{f: number; lights?: Lights; children?: React.ReactNode}> = ({f, lights = 'on', children}) => {
	const uid = useUid('cor');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 1200);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const lamp = lampOf(L, '#fffbe0');
	const c: Cam3 = {vx: 960, vy: 500, F: 1000, eye: 560};
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const W = 600;
	const Hc = 1100;
	const Zn = 420;
	const Zb = 3333;
	const wall = T('#8d96a1');
	const plates: string[] = [];
	for (let Z = 600; Z < Zb; Z += 260) {
		const a = p(-W, 0, Z);
		const b = p(W, 0, Z);
		plates.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
		for (const sd of [-1, 1]) {
			const u = p(sd * W, Hc, Z);
			const d = p(sd * W, 0, Z);
			plates.push(`M${u[0].toFixed(1)},${u[1].toFixed(1)}L${d[0].toFixed(1)},${d[1].toFixed(1)}`);
		}
	}
	for (const X of [-300, 0, 300]) {
		const a = p(X, 0, Zn);
		const b = p(X, 0, Zb);
		plates.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
	}
	const b0 = p(-W, Hc, Zb);
	const b1 = p(W, 0, Zb);
	return (
		<g>
			<ShadeDefs id={uid} glow={lamp} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#5f6772')} />
			<path d={qd([p(-W, Hc, Zn), p(W, Hc, Zn), p(W, Hc, Zb), p(-W, Hc, Zb)])} fill={T('#a7aeb7')} />

			<path d={qd([p(-W, 0, Zn), p(W, 0, Zn), p(W, 0, Zb), p(-W, 0, Zb)])} fill={T('#4b525d')} />
			{[-1, 1].map((sd) => (
				<g key={`w${sd}`}>
					<path d={qd([p(sd * W, Hc, Zn), p(sd * W, Hc, Zb), p(sd * W, 0, Zb), p(sd * W, 0, Zn)])} fill={wall} />
					<path d={qd([p(sd * W, 260, Zn), p(sd * W, 260, Zb), p(sd * W, 0, Zb), p(sd * W, 0, Zn)])} fill={shade(wall, -0.18)} />

					<path d={qd([p(sd * W, 0, Zn), p(sd * W, 0, Zb), p(sd * (W - 70), 0, Zb), p(sd * (W - 70), 0, Zn)])} fill="#000" fillOpacity={0.25} />
				</g>
			))}
			<path d={plates.join('')} stroke="#000" strokeWidth={2} strokeOpacity={0.22} fill="none" />
			<path d={qd([p(-W, 0, Zn), p(W, 0, Zn), p(W, 0, 900), p(-W, 0, 900)])} fill="#000" fillOpacity={0.3} />
			{/* end wall + door to the bridge */}
			<path d={ink.rect(b0[0], b0[1], b1[0] - b0[0], b1[1] - b0[1], 5, 1)} fill={T('#c0c6cd')} stroke={INK} strokeWidth={4} />
			<path d={qd([[b0[0], b1[1] - 60], [b1[0], b1[1] - 60], b1, [b0[0], b1[1]]])} fill="#000" fillOpacity={0.15} />
			<Box3 ink={ink} k0={6} c={c} b={{X0: -200, X1: 200, H0: 0, H1: 780, Z0: Zb - 10, Z1: Zb, fill: T('#8a939e'), sw: 4, nearShade: S.dn}} />
			{(() => {
				const a = p(0, 600, Zb - 10);
				return <path d={ink.ellipse(a[0], a[1], 22, 22, 7, 0.6, 10)} fill={T('#0c1018')} stroke={INK} strokeWidth={4} />;
			})()}
			<text x={960} y={p(0, 860, Zb)[1]} textAnchor="middle" fontFamily="Patrick Hand" fontSize={24} fill={L === 'red' ? '#ffb3a8' : '#1a2230'}>
				BRIDGE
			</text>
			{/* side doors, recessed in their frames */}
			{[-1, 1].map((sd) =>
				[900, 1700, 2500].map((Z, i) => {
					const Zd = Z + 380;
					const Xr = sd * (W + 30);
					return (
						<g key={`sd${sd}${i}`}>
							<path d={qd([p(sd * W, 820, Z), p(sd * W, 820, Zd), p(sd * W, 0, Zd), p(sd * W, 0, Z)])} fill={T('#2a2f36')} />
							<path d={ink.poly([p(Xr, 800, Z + 20), p(Xr, 800, Zd - 20), p(Xr, 0, Zd - 20), p(Xr, 0, Z + 20)], 20 + i + sd * 7, 0.8)} fill={T('#727c88')} stroke={INK} strokeWidth={4} />
							<path d={qd([p(Xr, 800, Z + 20), p(Xr, 800, Zd - 20), p(Xr, 0, Zd - 20), p(Xr, 0, Z + 20)])} fill={sd < 0 ? S.rt : S.lt} fillOpacity={0.4} />
							<path d={qd([p(sd * W, 820, Zd), p(Xr, 820, Zd), p(Xr, 0, Zd), p(sd * W, 0, Zd)])} fill={T('#9aa3ad')} stroke={INK} strokeWidth={3} />
							<path d={ink.poly([p(sd * W, 830, Z - 10), p(sd * W, 830, Zd + 10), p(sd * W, 0, Zd + 10), p(sd * W, 0, Z - 10)], 30 + i + sd * 7, 0.8)} fill="none" stroke={INK} strokeWidth={5} />
							{(() => {
								const h = p(Xr, 420, Zd - 70);
								return <circle cx={h[0]} cy={h[1]} r={Math.max(3, 9000 / Zd / 1.2)} fill={T('#3a3f46')} stroke={INK} strokeWidth={2} />;
							})()}
						</g>
					);
				}),
			)}
			{/* pipes along the upper left wall + ceiling */}
			{[0, 1, 2].map((i) => {
				const X = -W + 30;
				const H = Hc - 60 - i * 70;
				const r = 26 - i * 5;
				const pipe = [p(X, H + r, Zn), p(X, H + r, Zb), p(X, H - r, Zb), p(X, H - r, Zn)];
				const hi = [p(X, H + r * 0.55, Zn), p(X, H + r * 0.55, Zb), p(X, H + r * 0.2, Zb), p(X, H + r * 0.2, Zn)];
				return (
					<g key={`pipe${i}`}>
						<path d={ink.poly(pipe, 50 + i, 0.6)} fill={T(['#6b7480', '#8a6a3a', '#5a6a5a'][i])} stroke={INK} strokeWidth={4} />
						<path d={qd(hi)} fill="#fff" fillOpacity={0.22} />
						<path d={qd([pipe[0], pipe[1], hi[1], hi[0]])} fill="#000" fillOpacity={0.0} />
					</g>
				);
			})}
			{/* caged ceiling lamps with light pools */}
			{[900, 1500, 2200, 2900].map((Z, i) => {
				const a = p(-90, Hc, Z);
				const b = p(90, Hc - 40, Z + 90);
				const fl = p(0, 0, Z + 40);
				const on = L !== 'off';
				return (
					<g key={`cl${i}`}>
						{on ? <ellipse cx={fl[0]} cy={fl[1]} rx={520 * (1000 / Z)} ry={110 * (1000 / Z)} fill={S.gl} fillOpacity={0.8} /> : null}
						<Box3 ink={ink} k0={40 + i * 6} c={c} b={{X0: -90, X1: 90, H0: Hc - 40, H1: Hc, Z0: Z, Z1: Z + 90, fill: on ? lamp : '#222', sw: 3}} />
						{on ? <ellipse cx={(a[0] + b[0]) / 2} cy={b[1] + 20 * (1000 / Z)} rx={260 * (1000 / Z)} ry={110 * (1000 / Z)} fill={lamp} fillOpacity={0.1} /> : null}
					</g>
				);
			})}
			{children}
		</g>
	);
};

/* ============================================================ ferry window */

/** Close view of a cabin window with the passenger's reflection in the glass. */
export const FerryWindow: React.FC<{f: number; reflection?: React.ReactNode; reflectionOpacity?: number; lights?: Lights; children?: React.ReactNode}> = ({
	f,
	reflection,
	reflectionOpacity = 0.22,
	lights = 'on',
	children,
}) => {
	const uid = useUid('fw');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 1300);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const vp: Pt = [960, 540];
	const k = 0.93;
	const o0: Pt = [180, 90];
	const o1: Pt = [1740, 990];
	const g0 = toward(o0, vp, k);
	const g1 = toward(o1, vp, k);
	const rr = (x0: number, y0: number, x1: number, y1: number, r: number) =>
		`M${x0 + r},${y0}L${x1 - r},${y0}Q${x1},${y0} ${x1},${y0 + r}L${x1},${y1 - r}Q${x1},${y1} ${x1 - r},${y1}L${x0 + r},${y1}Q${x0},${y1} ${x0},${y1 - r}L${x0},${y0 + r}Q${x0},${y0} ${x0 + r},${y0}Z`;
	const bolts: string[] = [];
	for (let i = 0; i < 16; i++) {
		const t = i / 16;
		const a = t * Math.PI * 2;
		const bx = 960 + Math.cos(a) * 860;
		const by = 540 + Math.sin(a) * 505;
		bolts.push(`M${bx - 6},${by}a6,6 0 1,0 12,0a6,6 0 1,0 -12,0`);
	}
	return (
		<g>
			<ShadeDefs id={uid} glow={lampOf(L)} />
			<defs>
				<clipPath id={`${uid}c`}>
					<path d={rr(g0[0], g0[1], g1[0], g1[1], 100)} />
				</clipPath>
				<linearGradient id={`${uid}rv`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity={0.55} />
					<stop offset="0.5" stopColor="#000" stopOpacity={0.15} />
					<stop offset="1" stopColor="#fff" stopOpacity={0.25} />
				</linearGradient>
			</defs>
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#7f8b9c')} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={S.dn} fillOpacity={0.5} />
			<path d={bolts.join('')} fill={T('#5d6672')} stroke={INK} strokeWidth={2} />
			{/* frame + reveal (the wall's thickness) */}
			<path d={rr(o0[0] - 30, o0[1] - 30, o1[0] + 30, o1[1] + 30, 140)} fill={T('#b9c0c9')} stroke={INK} strokeWidth={8} />
			<path d={rr(o0[0], o0[1], o1[0], o1[1], 110)} fill={T('#9aa3ae')} stroke={INK} strokeWidth={6} />
			<path d={rr(o0[0], o0[1], o1[0], o1[1], 110)} fill={`url(#${uid}rv)`} />
			<g clipPath={`url(#${uid}c)`}>
				<rect x={0} y={0} width={1920} height={1080} fill="#03060c" />
				<g transform="translate(-200,-80) scale(1.2)">
					<OceanNight f={f} horizon={520} mood={L === 'red' ? 'red' : 'night'} moon />
				</g>
				<g opacity={reflectionOpacity}>{reflection}</g>
				{children}
				<rect x={g0[0]} y={g0[1]} width={g1[0] - g0[0]} height={g1[1] - g0[1]} fill={S.sp} />
				<path d={`M${g0[0] + 60},${g1[1] - 30} Q960,${g1[1] - 70} ${g1[0] - 60},${g1[1] - 30}`} stroke="#cfe0f0" strokeWidth={30} strokeOpacity={0.04} fill="none" />
			</g>
			<path d={ink.curve([[g0[0] + 100, g0[1]], [g1[0] - 100, g0[1]], [g1[0], g0[1] + 100], [g1[0], g1[1] - 100], [g1[0] - 100, g1[1]], [g0[0] + 100, g1[1]], [g0[0], g1[1] - 100], [g0[0], g0[1] + 100]], 3, 1.2, true)} fill="none" stroke={INK} strokeWidth={7} />
		</g>
	);
};

/* ======================================================== engine room door */

/** A labelled steel door (storage, WC, engine room) recessed in its frame.
 *  `open` 0..1 swings it inward (away from camera) on its left hinge. */
export const EngineRoomDoor: React.FC<{f: number; label?: string; sub?: string; open?: number; lights?: Lights; beam?: boolean}> = ({
	f,
	label = 'ENGINE ROOM',
	sub = 'CREW ONLY',
	open = 0,
	lights = 'on',
	beam = false,
}) => {
	const uid = useUid('erd');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 1400);
	const L = lights;
	const T = (cc: string) => tone(cc, L);
	const c: Cam3 = {vx: 960, vy: 520, F: 1000, eye: 360};
	// door plane at Z = 1000 (1 unit = 1 px); opening x 620..1300, y 160..1020
	const Zd = 1000;
	const p = (X: number, H: number, Z: number) => P3(c, X, H, Z);
	const H0 = 360 - (1020 - 520);
	const Hh = H0 + 860;
	const th = (open * Math.PI) / 2.3;
	const rec = 70;
	const leaf = (u: number, v: number): Pt => p(-340 + u * Math.cos(th), H0 + v, Zd + rec + u * Math.sin(th));
	const aff = (u0: number, v0: number, u1: number, v1: number) => {
		const a = leaf(u0, v0);
		const b = leaf(u1, v0);
		const d = leaf(u0, v1);
		return `matrix(${(b[0] - a[0]) / (u1 - u0)},${(b[1] - a[1]) / (u1 - u0)},${(d[0] - a[0]) / (v1 - v0)},${(d[1] - a[1]) / (v1 - v0)},${a[0]},${a[1]})`;
	};
	const rivets: string[] = [];
	for (let i = 0; i < 14; i++) {
		for (const yy of [110, 1060]) {
			const x = 470 + i * 75;
			rivets.push(`M${x - 6},${yy}a6,6 0 1,0 12,0a6,6 0 1,0 -12,0`);
		}
	}
	for (let i = 0; i < 12; i++) {
		for (const xx of [560, 1360]) {
			const y = 160 + i * 75;
			rivets.push(`M${xx - 6},${y}a6,6 0 1,0 12,0a6,6 0 1,0 -12,0`);
		}
	}
	const o0 = p(-340, Hh, Zd);
	const o1 = p(340, H0, Zd);
	const i0 = p(-340, Hh, Zd + rec);
	const i1 = p(340, H0, Zd + rec);
	const leafPts: Pt[] = [leaf(0, 860), leaf(680, 860), leaf(680, 0), leaf(0, 0)];
	return (
		<g>
			<ShadeDefs id={uid} glow="#fff6c8" />
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#6c7580')} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={S.dn} fillOpacity={0.5} />
			<path d={`M-200,600L2120,600`} stroke="#000" strokeWidth={2} strokeOpacity={0.2}  fill="none" />
			<path d={rivets.join('')} fill={T('#4a515b')} stroke={INK} strokeWidth={2} />
			{/* door frame (raised) */}
			<path d={ink.rect(o0[0] - 50, o0[1] - 50, o1[0] - o0[0] + 100, o1[1] - o0[1] + 70, 1, 1.2)} fill={T('#8b949f')} stroke={INK} strokeWidth={7} />
			<path d={qd([[o0[0] - 50, o0[1] - 50], [o1[0] + 50, o0[1] - 50], [o1[0] + 50, o1[1] + 20], [o0[0] - 50, o1[1] + 20]])} fill={S.hl} />
			{/* dark room beyond */}
			<path d={qd([o0, [o1[0], o0[1]], o1, [o0[0], o1[1]]])} fill="#04060a" />
			{beam ? <path d={qd([[960, 1100], [i0[0] + 80, i0[1] + 120], [i1[0] - 80, i0[1] + 120]])} fill="#fff6c8" fillOpacity={0.07} /> : null}
			{/* reveals */}
			<path d={ink.poly([o0, i0, [i0[0], i1[1]], [o0[0], o1[1]]], 2, 0.6)} fill={T('#5d6570')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([[o1[0], o0[1]], [i1[0], i0[1]], i1, o1], 3, 0.6)} fill={T('#5d6570')} stroke={INK} strokeWidth={3} />
			<path d={ink.poly([o0, [o1[0], o0[1]], [i1[0], i0[1]], i0], 4, 0.6)} fill={T('#3d444d')} stroke={INK} strokeWidth={3} />
			{/* the leaf */}
			<path d={ink.poly(leafPts, 5, 1)} fill={T('#9aa3ad')} stroke={INK} strokeWidth={7} />
			<path d={qd(leafPts)} fill={S.dn} fillOpacity={0.35 + open * 0.3} />
			<g transform={aff(0, 0, 680, 860)}>
				<path d={ink.ellipse(340, 630, 80, 80, 6, 1.5, 12)} fill="#0c1018" stroke={INK} strokeWidth={8} />
				<path d="M290,620 Q320,580 370,575" stroke="#fff" strokeWidth={6} strokeOpacity={0.18} fill="none" />
				<path d={ink.rect(110, 320, 460, 120, 7, 1.2)} fill="#f2c94c" stroke={INK} strokeWidth={5} />
				<g transform="translate(340,380) scale(1,-1)">
					<text x={0} y={-14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill="#1a1a1a">
						{label}
					</text>
					<text x={0} y={42} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill="#1a1a1a">
						{sub}
					</text>
				</g>
				<path d={ink.line(600, 340, 650, 340, 8, 0.6, 1)} stroke={INK} strokeWidth={16} />
				<path d={ink.line(600, 340, 650, 340, 8, 0.6, 1)} stroke="#c9ced5" strokeWidth={8} />
			</g>
			{beam ? <path d={qd([[960, 1120], [700, 300], [1220, 300]])} fill="#fff6c8" fillOpacity={0.1} /> : null}
		</g>
	);
};

/* ========================================================= ceiling speaker */

/** Ceiling PA speaker close-up (looking up). `active` 0..1 lights the grille. */
export const CeilingSpeaker: React.FC<{f: number; active?: number; lights?: Lights; level?: number}> = ({f, active = 0, lights = 'on', level = 0}) => {
	const uid = useUid('spk');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 1500);
	const red = lights === 'red';
	const T = (cc: string) => tone(cc, lights);
	const vp: Pt = [960, -1500];
	const tiles: string[] = [];
	for (let x = -2400; x <= 4320; x += 300) {
		const t = (1300 - vp[1]) / (-200 - vp[1]);
		tiles.push(`M${x},-200L${(vp[0] + (x - vp[0]) * t).toFixed(1)},1300`);
	}
	for (const y of [-120, 30, 200, 395, 615, 865, 1150]) tiles.push(`M-200,${y}L2120,${y}`);
	const rx = 330;
	const ry = 290;
	const glow = red ? '#ff3a2a' : '#fff1c2';
	return (
		<g>
			<ShadeDefs id={uid} glow={glow} />
			<rect x={-200} y={-200} width={2320} height={1500} fill={T('#b9bfc7')} />
			<rect x={-200} y={-200} width={2320} height={520} fill="#000" fillOpacity={0.18} />
			<path d={tiles.join('')} stroke="#000" strokeWidth={3} strokeOpacity={0.22} fill="none" />
			<ellipse cx={975} cy={600} rx={rx + 60} ry={ry + 50} fill={S.sh} />
			{/* housing: ring on the ceiling, side band, grille cap */}
			<path d={ink.ellipse(960, 515, rx + 18, ry + 14, 10, 1.5, 16)} fill={T('#c9ced4')} stroke={INK} strokeWidth={8} />
			<path d={qd([[960 - rx - 2, 515], [960 + rx + 2, 515], [960 + rx + 2, 560], [960 - rx - 2, 560]])} fill={T('#8b939d')} />
			<path d={`M${960 - rx - 2},515 L${960 - rx - 2},560 M${960 + rx + 2},515 L${960 + rx + 2},560`} stroke={INK} strokeWidth={8} />
			<path d={ink.ellipse(960, 560, rx, ry, 11, 1.5, 16)} fill={red ? '#3c1010' : '#d6dade'} stroke={INK} strokeWidth={10} />
			<path d={ink.ellipse(960, 560, rx - 60, ry - 52, 12, 1.5, 16)} fill={red ? '#1f0606' : '#2d3138'} stroke={INK} strokeWidth={8} />
			<ellipse cx={960} cy={560} rx={rx - 60} ry={ry - 52} fill={S.dn} fillOpacity={0.6} />
			{Array.from({length: 13}, (_, r) =>
				Array.from({length: 13}, (_, cc) => {
					const x = 960 + (cc - 6) * 38;
					const y = 560 + (r - 6) * 33;
					if (((x - 960) / (rx - 70)) ** 2 + ((y - 560) / (ry - 62)) ** 2 > 1) return null;
					const pulse = level * (0.5 + 0.5 * Math.sin(f * 0.9 + r * 0.7 + cc));
					return <ellipse key={`${r}-${cc}`} cx={x} cy={y} rx={9 + pulse * 3} ry={8 + pulse * 2.6} fill={active > 0 ? `rgba(255,${red ? 80 : 230},${red ? 60 : 170},${0.15 + active * 0.5})` : '#111'} />;
				}),
			)}
			<path d={`M${960 - rx + 40},${560 - ry * 0.55} Q${960 - rx * 0.3},${560 - ry - 6} ${960 + rx * 0.35},${560 - ry + 12}`} stroke="#fff" strokeWidth={8} strokeOpacity={0.35} fill="none" strokeLinecap="round" />
			{active > 0 ? <ellipse cx={960} cy={560} rx={520} ry={470} fill={S.gl} fillOpacity={0.5 * active} /> : null}
		</g>
	);
};

export const Ellipsis = wobEllipse;

