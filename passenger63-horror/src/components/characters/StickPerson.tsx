// The one stick figure every character is built from: round head, dot eyes, block
// body, thick black outlines, flat colours with a soft shadow side for depth.
// Coordinates are relative to the figure's feet (0,0); a standing adult is ~300 px.
//
// Animation built in (only when `frame` is a number - figures with frame={null}
// never move, which is how the old woman stays unnaturally still):
//   - breathing (shoulders/head rise and fall), blinks, small eye saccades
//   - walking: from the front the feet step up and down (no sideways leg swing);
//     side-on (|turn| >= 0.5) the legs and arms swing with bending knees/elbows
//   - `lean` tilts the whole upper body over the hips (Emma resting on Daniel)
//   - `talk` (0..1, from the real voice envelope) + `viseme` shape the mouth
// Seated pose: hips on the seat at -72, knees forward at -60, shins down to the floor
// (head centre at -209). Seats are drawn with their cushion top at y - 72*s.
import React, {useId} from 'react';
import {boilOf, h1, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../../utils/rough';

export type Pose = 'stand' | 'sit' | 'walk' | 'run';
export type ArmPreset =
	| 'down'
	| 'relaxed'
	| 'wave'
	| 'tinyWave'
	| 'point'
	| 'pointLeft'
	| 'armsUp'
	| 'oneArmUp'
	| 'hold'
	| 'holdOne'
	| 'folded'
	| 'lap'
	| 'coverEars'
	| 'fingerLips'
	| 'shrug'
	| 'grabRight'
	| 'grabLeft'
	| 'clicker'
	| 'slap'
	| 'handsForward'
	| 'hug'
	| 'hipsHands'
	| 'phoneEar';
export type ArmSpec = {l: [number, number]; r: [number, number]};
export type Eyes = 'dot' | 'wide' | 'closed' | 'squint' | 'gray' | 'none';
export type Brows = 'none' | 'flat' | 'worried' | 'angry' | 'raised' | 'sad';
export type Mouth = 'smile' | 'faint' | 'grin' | 'flat' | 'frown' | 'o' | 'scream' | 'wobbly' | 'open' | 'shout' | 'laugh';
export type Viseme = 'a' | 'e' | 'o' | 'm';
export type Hair = 'short' | 'medium' | 'bun' | 'ponytail' | 'grayShort' | 'none' | 'curly' | 'long' | 'buzz';
export type Hat = 'none' | 'captain' | 'police' | 'cap' | 'beanie';
export type Prop = 'none' | 'phone' | 'clicker' | 'tablet' | 'card' | 'ring' | 'flashlight' | 'handset' | 'notebook';

export interface Palette {
	skin: string;
	shirt: string;
	pants: string;
	hair: string;
	shoes: string;
}

export interface StickProps {
	x?: number;
	y?: number;
	s?: number;
	flip?: boolean;
	pose?: Pose;
	arms?: ArmPreset | ArmSpec;
	eyes?: Eyes;
	brows?: Brows;
	mouth?: Mouth;
	/** 0..1 mouth opening for talking (use talkOf() - it follows the real voice) */
	talk?: number;
	/** mouth shape while talking */
	viseme?: Viseme;
	/** eye direction -1..1 */
	look?: [number, number];
	/** head tilt in degrees */
	tilt?: number;
	/** -1..1 head/body turn; |turn| >= 0.5 draws the figure side-on (for walking across) */
	turn?: number;
	/** upper body lean over the hips, degrees (+ = toward +x) */
	lean?: number;
	/** show the back of the head / body */
	back?: boolean;
	palette: Palette;
	hair?: Hair;
	hat?: Hat;
	prop?: Prop;
	propGlow?: string;
	mustache?: string;
	glasses?: boolean;
	brooch?: boolean;
	stripe?: string;
	vest?: string;
	vestText?: string;
	longCoat?: boolean;
	tears?: number;
	sweat?: boolean;
	pale?: number;
	blush?: boolean;
	/** frame for animation + line boil; pass null for a figure that never moves */
	frame: number | null;
	seed?: number;
	/** walking phase (radians) - use walkPhase(distance, s) so feet don't slide */
	phase?: number;
	shiver?: number;
	opacity?: number;
	/** age lines etc */
	wrinkles?: boolean;
	/** stroke width multiplier */
	line?: number;
	female?: boolean;
	child?: boolean;
	/** set false to switch off breathing/blinking */
	idle?: boolean;
}

const INK = '#141414';

const mixHex = (a: string, b: string, t: number) => {
	const pa = parseInt(a.slice(1), 16);
	const pb = parseInt(b.slice(1), 16);
	const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
	const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
	const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
	return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
};

/** [upper-arm angle from straight down (+ = out to that side), forearm bend] in degrees */
export const ARM_PRESETS: Record<ArmPreset, ArmSpec> = {
	down: {l: [8, 4], r: [8, 4]},
	relaxed: {l: [14, -14], r: [14, -14]},
	wave: {l: [10, 0], r: [150, 25]},
	tinyWave: {l: [12, -70], r: [40, 95]},
	point: {l: [10, 0], r: [92, 0]},
	pointLeft: {l: [92, 0], r: [10, 0]},
	armsUp: {l: [168, 6], r: [168, 6]},
	oneArmUp: {l: [10, 0], r: [168, 4]},
	hold: {l: [22, -105], r: [22, -105]},
	holdOne: {l: [10, 0], r: [22, -105]},
	folded: {l: [10, -80], r: [10, -80]},
	lap: {l: [4, -46], r: [4, -46]},
	coverEars: {l: [128, -160], r: [128, -160]},
	fingerLips: {l: [10, 0], r: [-20, -160]},
	shrug: {l: [55, 85], r: [55, 85]},
	grabRight: {l: [10, 0], r: [75, 10]},
	grabLeft: {l: [75, 10], r: [10, 0]},
	clicker: {l: [10, 0], r: [30, -60]},
	slap: {l: [10, 0], r: [100, 35]},
	handsForward: {l: [35, -60], r: [35, -60]},
	hug: {l: [60, -110], r: [60, -110]},
	hipsHands: {l: [40, -110], r: [40, -110]},
	phoneEar: {l: [10, 0], r: [30, -165]},
};

const specOf = (a: ArmPreset | ArmSpec | undefined): ArmSpec => (typeof a === 'object' ? a : ARM_PRESETS[a ?? 'relaxed']);

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Arm keyframes -> a smoothly blended arm spec. keys: [frame, preset][], each change
 * eases over `dur` frames starting at its frame. Use it instead of switching presets
 * with a ternary (which snaps).
 */
export const armTween = (f: number, keys: Array<[number, ArmPreset | ArmSpec]>, dur = 8): ArmSpec => {
	let cur = specOf(keys[0][1]);
	for (let i = 1; i < keys.length; i++) {
		const [at, a] = keys[i];
		if (f <= at) break;
		const t = smooth(Math.min(1, (f - at) / Math.max(1, dur)));
		const nx = specOf(a);
		cur = {
			l: [cur.l[0] + (nx.l[0] - cur.l[0]) * t, cur.l[1] + (nx.l[1] - cur.l[1]) * t],
			r: [cur.r[0] + (nx.r[0] - cur.r[0]) * t, cur.r[1] + (nx.r[1] - cur.r[1]) * t],
		};
	}
	return cur;
};

/** Walking phase for a figure that has moved `distance` px at scale s - keeps the feet planted. */
export const walkPhase = (distance: number, s = 1, pose: Pose = 'walk') => Math.abs(distance) / ((pose === 'run' ? 46 : 30) * s);

const rad = (d: number) => (d * Math.PI) / 180;

/** Two-bone leg: knee position for hip -> foot with segment length L, bending toward bend (unit-ish x). */
const knee = (hx: number, hy: number, fx: number, fy: number, L: number, bendX: number): Pt => {
	const dx = fx - hx;
	const dy = fy - hy;
	const d = Math.hypot(dx, dy) || 1;
	const mx = (hx + fx) / 2;
	const my = (hy + fy) / 2;
	if (d >= 2 * L) return [mx, my];
	const off = Math.sqrt(L * L - (d / 2) * (d / 2));
	// perpendicular to the leg, pick the side that points along bendX
	let px = -dy / d;
	let py = dx / d;
	if (px * bendX < 0) {
		px = -px;
		py = -py;
	}
	return [mx + px * off * Math.abs(bendX), my + py * off * Math.abs(bendX)];
};

export const StickPerson: React.FC<StickProps> = (p) => {
	const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
	const {
		x = 0,
		y = 0,
		s = 1,
		flip = false,
		pose = 'stand',
		brows = 'none',
		mouth = 'flat',
		talk = 0,
		viseme = 'a',
		tilt: tilt0 = 0,
		turn = 0,
		lean = 0,
		back = false,
		palette,
		hair = 'short',
		hat = 'none',
		prop = 'none',
		frame,
		seed = 1,
		phase = 0,
		shiver = 0,
		opacity = 1,
		line = 1,
		female = false,
	} = p;
	const live = frame !== null && p.idle !== false;
	const fr = frame ?? 0;
	const tsec = fr / 30;
	const ph = seed * 1.37;
	const boil = frame === null ? 0 : boilOf(frame, 4);
	const sd = seed * 31 + boil * 7;
	const amp = frame === null ? 0.5 : 0.9;
	const lw = 5.5 * line;
	const skin = p.pale ? mixHex(palette.skin, '#dfe6dc', p.pale) : palette.skin;

	const sitting = pose === 'sit';
	const walking = pose === 'walk' || pose === 'run';
	const side = Math.abs(turn) >= 0.5 && !back;
	const dir = turn >= 0 ? 1 : -1;
	const k = p.child ? 0.62 : 1;
	const headR = 36 * (p.child ? 1.08 : 1);

	// ---- idle motion
	const breath = live ? Math.sin((tsec * 2 * Math.PI) / (3.6 + (seed % 5) * 0.25) + ph) : 0;
	const bob = walking ? -Math.abs(Math.sin(phase)) * (pose === 'run' ? 9 : 5) * k : 0;
	const hipY = (sitting ? -72 : -120) * k + bob;
	const shY = (sitting ? -167 : -219) * k + bob - breath * 1.5 * k;
	const headY = (sitting ? -209 : -262) * k + bob - breath * 1.8 * k;
	const shW = (female ? 29 : 33) * k * (side ? 0.74 : 1);
	const hipW = 27 * k * (side ? 0.78 : 1);
	const shx = shiver ? Math.sin(fr * 2.3) * shiver : 0;
	const walkRot = walking ? (side ? dir * (pose === 'run' ? 9 : 3) : Math.sin(phase) * 1.4) : 0;
	const bodyRot = lean + walkRot;
	const talkNod = live && talk > 0.05 ? Math.sin(tsec * 5.1 + ph) * 2.2 * Math.min(1, talk * 1.5) : 0;
	const tilt = tilt0 + talkNod + (live ? Math.sin(tsec * 0.45 + ph) * 1.2 : 0);

	// blinks + eye saccades
	const period = 96 + ((seed * 29) % 70);
	const blinking = live && (fr + seed * 17) % period < 4;
	let eyes: Eyes = p.eyes ?? 'dot';
	if (blinking && (eyes === 'dot' || eyes === 'wide')) eyes = 'closed';
	let look: [number, number] = p.look ?? [0, 0];
	if (live && !p.look) {
		const seg = Math.floor((fr + seed * 11) / 70);
		look = [h1(seg, seed, 1) * 0.45, h1(seg, seed, 2) * 0.25];
	}

	// ---- arms
	let armSpec = specOf(p.arms);
	if (sitting && (p.arms === 'folded' || p.arms === undefined)) armSpec = ARM_PRESETS[p.arms === 'folded' ? 'lap' : 'lap'];
	let {l: la, r: ra} = armSpec;
	if (p.arms === 'wave') ra = [150, 25 + Math.sin(tsec * 9) * 28];
	if (live && !walking) {
		// arms are never perfectly frozen
		const sway = Math.sin(tsec * 0.9 + ph) * 1.6;
		la = [la[0] + sway, la[1]];
		ra = [ra[0] - sway, ra[1]];
	}
	const defaultArms = p.arms === undefined || p.arms === 'relaxed' || p.arms === 'down';
	const U = 54 * k;
	const F = 50 * k;
	const armPts = (sideSign: -1 | 1, a: [number, number]): Pt[] => {
		const sx = sideSign * (shW - 3);
		const sy = shY + 6;
		const a1 = rad(a[0]);
		const a2 = rad(a[0] + a[1]);
		const ex = sx + sideSign * Math.sin(a1) * U;
		const ey = sy + Math.cos(a1) * U;
		const hx = ex + sideSign * Math.sin(a2) * F;
		const hy = ey + Math.cos(a2) * F;
		return [
			[sx, sy],
			[ex, ey],
			[hx, hy],
		];
	};
	let L = armPts(-1, la);
	let R = armPts(1, ra);
	if (walking && defaultArms) {
		const amt = pose === 'run' ? 40 : 22;
		if (side) {
			// arms swing forward/back in the picture plane, elbows bent forward
			const swingArm = (o: number): Pt[] => {
				const a = rad(amt * Math.sin(phase + o));
				const sx = dir * 3;
				const sy = shY + 8;
				const ex = sx + dir * Math.sin(a) * U;
				const ey = sy + Math.cos(a) * U;
				const b = a + rad(pose === 'run' ? 70 : 25);
				return [
					[sx, sy],
					[ex, ey],
					[ex + dir * Math.sin(b) * F, ey + Math.cos(b) * F],
				];
			};
			L = swingArm(0); // far arm (drawn behind the body)
			R = swingArm(Math.PI);
		} else {
			// from the front an arm swinging forward reads as the hand rising
			const sw = Math.sin(phase);
			L = armPts(-1, [10 + Math.max(0, sw) * 6, -8 - Math.max(0, sw) * amt * 1.4]);
			R = armPts(1, [10 + Math.max(0, -sw) * 6, -8 - Math.max(0, -sw) * amt * 1.4]);
		}
	}

	// ---- legs: [hip, knee, foot]
	const legs: Pt[][] = [];
	const legLen = 120 * k;
	if (sitting) {
		for (const sg of [-1, 1]) {
			legs.push([
				[sg * 13 * k, hipY + 6 * k],
				[sg * 21 * k, -54 * k],
				[sg * 23 * k, -1],
			]);
		}
	} else if (walking && side) {
		const sw = pose === 'run' ? 34 : 22;
		for (let i = 0; i < 2; i++) {
			const o = i === 0 ? 0 : Math.PI;
			const ang = rad(sw * Math.sin(phase + o));
			const hx = dir * (i === 0 ? -3 : 3);
			const fx = hx + dir * Math.sin(ang) * legLen * 0.92;
			// the leg swinging forward lifts its foot
			const lift = Math.max(0, Math.cos(phase + o)) * (pose === 'run' ? 26 : 13) * k;
			const fy = -lift;
			legs.push([[hx, hipY], knee(hx, hipY, fx, fy, legLen / 2 + 1, dir), [fx, fy]]);
		}
	} else if (walking) {
		// toward / away from the camera: alternate stepping, feet stay under the hips
		for (const sg of [-1, 1] as const) {
			const o = sg === 1 ? Math.PI : 0;
			const lift = Math.max(0, Math.sin(phase + o)) * (pose === 'run' ? 30 : 16) * k;
			const hx = sg * 13 * k;
			const fx = hx + sg * 3;
			const fy = -lift;
			legs.push([[hx, hipY], knee(hx, hipY, fx, fy, legLen / 2 + 1, sg * 0.35), [fx, fy]]);
		}
	} else {
		for (const sg of [-1, 1] as const) {
			const hx = sg * 13 * k;
			const fx = hx + sg * 7;
			legs.push([[hx, hipY], knee(hx, hipY, fx, 0, legLen / 2 + 1, sg * 0.12), [fx, 0]]);
		}
	}

	// ---- body
	const coat = Boolean(p.longCoat);
	const bodyPts: Pt[] = coat
		? [
				[-shW - 2, shY],
				[shW + 2, shY],
				[shW + (sitting ? 6 : 14), sitting ? hipY + 4 : -22 * k],
				[-shW - (sitting ? 6 : 14), sitting ? hipY + 4 : -22 * k],
			]
		: [
				[-shW, shY],
				[shW, shY],
				[hipW, hipY + 2],
				[-hipW, hipY + 2],
			];

	const hx0 = shx;
	const faceDX = turn * 15;
	const headTransform = `rotate(${tilt} ${hx0} ${headY + headR})`;

	// ---- face pieces
	const eyeY = headY - 4;
	const eyeDX = 13;
	const lx = look[0] * 4;
	const ly = look[1] * 3;
	const eyeFill = eyes === 'gray' ? '#7c8388' : INK;
	const eyesEl: React.ReactNode[] = [];
	if (!back && eyes !== 'none') {
		for (const sg of [-1, 1]) {
			const ex = hx0 + sg * eyeDX + faceDX + (Math.abs(turn) > 0.6 && Math.sign(turn) !== sg ? -turn * 4 : 0);
			if (Math.abs(turn) > 0.85 && Math.sign(turn) === -sg) continue;
			if (eyes === 'wide') {
				eyesEl.push(<path key={`ew${sg}`} d={wobCircle(ex, eyeY, 9.5, sd + sg, 0.6, 8)} fill="#fff" stroke={INK} strokeWidth={3} />);
				eyesEl.push(<circle key={`ep${sg}`} cx={ex + lx} cy={eyeY + ly} r={4} fill={INK} />);
			} else if (eyes === 'closed') {
				eyesEl.push(<path key={`ec${sg}`} d={`M${ex - 7},${eyeY} Q${ex},${eyeY + 6} ${ex + 7},${eyeY}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
			} else if (eyes === 'squint') {
				eyesEl.push(<path key={`es${sg}`} d={wobLine(ex - 6, eyeY, ex + 6, eyeY, sd + sg, 0.5, 1)} stroke={INK} strokeWidth={4} strokeLinecap="round" />);
			} else {
				eyesEl.push(<circle key={`ed${sg}`} cx={ex + lx} cy={eyeY + ly} r={eyes === 'gray' ? 5 : 5.2} fill={eyeFill} />);
				eyesEl.push(<circle key={`eh${sg}`} cx={ex + lx + 1.6} cy={eyeY + ly - 1.8} r={1.4} fill="#fff" opacity={eyes === 'gray' ? 0.35 : 0.8} />);
			}
		}
	}
	const browsEl: React.ReactNode[] = [];
	if (!back && brows !== 'none') {
		const lift = live && talk > 0.6 ? 2 : 0;
		for (const sg of [-1, 1]) {
			const bx = hx0 + sg * eyeDX + faceDX;
			const by = eyeY - 13 - (brows === 'raised' ? 6 : 0) - lift;
			const inner = brows === 'worried' || brows === 'sad' ? -5 : brows === 'angry' ? 5 : 0;
			const outer = brows === 'sad' ? 3 : 0;
			browsEl.push(
				<path
					key={`b${sg}`}
					d={wobLine(bx - sg * 8, by + inner, bx + sg * 8, by + outer, sd + sg * 3, 0.5, 1)}
					stroke={INK}
					strokeWidth={4}
					strokeLinecap="round"
					fill="none"
				/>,
			);
		}
	}
	const mx = hx0 + faceDX * 1.05;
	const my = headY + 18;
	let mouthEl: React.ReactNode = null;
	if (!back) {
		const open = Math.max(0, Math.min(1, talk));
		const mk = (d: string, fill = 'none', w = 4) => <path d={d} fill={fill} stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
		const speaking = open > 0.08 && (mouth === 'flat' || mouth === 'smile' || mouth === 'frown' || mouth === 'faint' || mouth === 'wobbly' || mouth === 'open');
		if (speaking) {
			if (viseme === 'm' || open < 0.16) {
				mouthEl = mk(`M${mx - 9},${my} Q${mx},${my + 2} ${mx + 9},${my}`, 'none', 4);
			} else {
				const w = viseme === 'e' ? 12 : viseme === 'o' ? 6.5 : 9.5;
				const h = (viseme === 'e' ? 1.5 + open * 4.5 : 2 + open * 8.5) * (viseme === 'o' ? 1.1 : 1);
				mouthEl = (
					<g>
						{mk(wobEllipse(mx, my + 1 + h * 0.3, w, h, sd + 7, 0.3, 10), '#3a1414', 3.5)}
						{open > 0.45 && viseme !== 'o' ? <path d={`M${mx - w * 0.6},${my - h * 0.35 + 1.5} L${mx + w * 0.6},${my - h * 0.35 + 1.5}`} stroke="#f4efe6" strokeWidth={2.5} strokeLinecap="round" /> : null}
					</g>
				);
			}
		} else {
			switch (mouth) {
				case 'smile':
					mouthEl = mk(`M${mx - 12},${my - 2} Q${mx},${my + 10} ${mx + 12},${my - 2}`);
					break;
				case 'faint':
					mouthEl = mk(`M${mx - 8},${my} Q${mx},${my + 3.5} ${mx + 8},${my}`, 'none', 3);
					break;
				case 'grin':
				case 'laugh':
					mouthEl = mk(`M${mx - 14},${my - 4} Q${mx},${my + 16} ${mx + 14},${my - 4} Z`, '#5a1d1d');
					break;
				case 'frown':
					mouthEl = mk(`M${mx - 11},${my + 5} Q${mx},${my - 5} ${mx + 11},${my + 5}`);
					break;
				case 'o':
					mouthEl = mk(wobEllipse(mx, my + 2, 6, 8, sd + 5, 0.5, 8), '#3a1414', 3.5);
					break;
				case 'scream':
				case 'shout': {
					const g = mouth === 'scream' ? 15 + open * 4 : 10 + open * 4;
					mouthEl = mk(wobEllipse(mx, my + 4, 11, g, sd + 6, 0.8, 10), '#2a0d0d', 4);
					break;
				}
				case 'wobbly':
					mouthEl = mk(`M${mx - 12},${my + 2} L${mx - 6},${my - 2} L${mx},${my + 2} L${mx + 6},${my - 2} L${mx + 12},${my + 2}`);
					break;
				case 'open':
					mouthEl = mk(wobEllipse(mx, my + 1, 8, 2 + open * 7, sd + 7, 0.4, 8), '#3a1414', 3.5);
					break;
				default:
					mouthEl = mk(wobLine(mx - 10, my, mx + 10, my, sd + 8, 0.5, 1));
			}
		}
	}

	// ---- hair
	const hairBack: React.ReactNode[] = [];
	const hairFront: React.ReactNode[] = [];
	const hc = palette.hair;
	const hr = headR;
	const cx = hx0;
	const cy = headY;
	if (back) {
		hairFront.push(<path key="hb" d={wobCircle(cx, cy - 2, hr + 1, sd + 40, 1)} fill={hc} stroke={INK} strokeWidth={lw} />);
		if (hair === 'bun') hairFront.push(<path key="bunb" d={wobCircle(cx, cy - hr * 0.78, hr * 0.36, sd + 41, 0.5)} fill={mixHex(hc, '#000000', 0.1)} stroke={INK} strokeWidth={lw * 0.7} />);
		if (hair === 'medium' || hair === 'long') hairFront.push(<path key="hbm" d={wobPoly([[cx - hr - 2, cy], [cx + hr + 2, cy], [cx + hr + 6, cy + hr * 1.35], [cx - hr - 6, cy + hr * 1.35]], sd + 42, 1.2)} fill={hc} stroke={INK} strokeWidth={lw} />);
		if (hair === 'ponytail') hairFront.push(<path key="hbp" d={wobEllipse(cx + 4, cy + hr * 0.9, 10, 24, sd + 43, 0.8)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />);
	} else {
		switch (hair) {
			case 'short':
			case 'buzz':
				hairFront.push(
					<path
						key="hs"
						d={wob(
							[
								[cx - hr - 2, cy - 2],
								[cx - hr * 0.9, cy - hr * 0.75],
								[cx - hr * 0.3, cy - hr - 6],
								[cx + hr * 0.4, cy - hr - 5],
								[cx + hr * 0.95, cy - hr * 0.6],
								[cx + hr + 2, cy - 4],
								[cx + hr * 0.6, cy - hr * 0.55],
								[cx + hr * 0.1, cy - hr * 0.6],
								[cx - hr * 0.4, cy - hr * 0.5],
								[cx - hr * 0.8, cy - hr * 0.35],
							],
							sd + 50,
							1.1,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'grayShort':
				hairFront.push(
					<path key="hg" d={wob([[cx - hr - 3, cy + 4], [cx - hr, cy - hr * 0.6], [cx - hr * 0.6, cy - hr * 0.55], [cx - hr * 0.7, cy - 2]], sd + 51, 1)} fill={hc} stroke={INK} strokeWidth={lw * 0.7} />,
					<path key="hg2" d={wob([[cx + hr + 3, cy + 4], [cx + hr, cy - hr * 0.6], [cx + hr * 0.6, cy - hr * 0.55], [cx + hr * 0.7, cy - 2]], sd + 52, 1)} fill={hc} stroke={INK} strokeWidth={lw * 0.7} />,
				);
				break;
			case 'medium':
			case 'long': {
				const len = hair === 'long' ? 1.7 : 1.3;
				hairBack.push(
					<path
						key="hmb"
						d={wobPoly(
							[
								[cx - hr - 6, cy - hr * 0.2],
								[cx + hr + 6, cy - hr * 0.2],
								[cx + hr + 10, cy + hr * len],
								[cx - hr - 10, cy + hr * len],
							],
							sd + 53,
							1.2,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw}
					/>,
				);
				hairFront.push(
					<path
						key="hmf"
						d={wob(
							[
								[cx - hr - 4, cy + hr * 0.3],
								[cx - hr * 0.95, cy - hr * 0.7],
								[cx - hr * 0.2, cy - hr - 6],
								[cx + hr * 0.6, cy - hr - 4],
								[cx + hr + 4, cy - hr * 0.3],
								[cx + hr + 4, cy + hr * 0.3],
								[cx + hr * 0.75, cy - hr * 0.45],
								[cx + hr * 0.1, cy - hr * 0.62],
								[cx - hr * 0.55, cy - hr * 0.5],
								[cx - hr * 0.8, cy - hr * 0.1],
							],
							sd + 54,
							1.1,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			}
			case 'bun':
				hairFront.push(
					<path key="hbun" d={wobCircle(cx + 2, cy - hr - 10, hr * 0.42, sd + 55, 0.4)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />,
					<path
						key="hbuncap"
						d={wob(
							[
								[cx - hr - 2, cy + 2],
								[cx - hr * 0.9, cy - hr * 0.72],
								[cx - hr * 0.2, cy - hr - 3],
								[cx + hr * 0.5, cy - hr - 2],
								[cx + hr + 2, cy - hr * 0.5],
								[cx + hr + 2, cy + 2],
								[cx + hr * 0.7, cy - hr * 0.5],
								[cx, cy - hr * 0.72],
								[cx - hr * 0.7, cy - hr * 0.5],
							],
							sd + 56,
							0.6,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'ponytail':
				hairBack.push(<path key="hpt" d={wobEllipse(cx + hr + 6, cy + 8, 11, 26, sd + 57, 0.8)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />);
				hairFront.push(
					<path
						key="hpf"
						d={wob([[cx - hr - 2, cy - 2], [cx - hr * 0.8, cy - hr * 0.8], [cx, cy - hr - 5], [cx + hr * 0.85, cy - hr * 0.75], [cx + hr + 2, cy - 4], [cx + hr * 0.5, cy - hr * 0.6], [cx - hr * 0.5, cy - hr * 0.55]], sd + 58, 1)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'curly':
				for (let i = 0; i < 7; i++) {
					const a = Math.PI + (i / 6) * Math.PI;
					hairFront.push(<path key={`hc${i}`} d={wobCircle(cx + Math.cos(a) * hr * 0.95, cy + Math.sin(a) * hr * 0.9, 11, sd + 60 + i, 0.8)} fill={hc} stroke={INK} strokeWidth={lw * 0.6} />);
				}
				break;
			default:
				break;
		}
	}

	// ---- hat
	const hatEl: React.ReactNode[] = [];
	if (hat === 'captain' || hat === 'police' || hat === 'cap') {
		const top = hat === 'captain' ? '#f4f4f0' : hat === 'police' ? '#1b2233' : '#24406e';
		hatEl.push(
			<path key="hat1" d={wobPoly([[cx - hr - 6, cy - hr * 0.55], [cx + hr + 6, cy - hr * 0.55], [cx + hr + 12, cy - hr - 18], [cx - hr - 12, cy - hr - 18]], sd + 70, 1)} fill={top} stroke={INK} strokeWidth={lw} />,
			<path key="hat2" d={wobPoly([[cx - hr - 4, cy - hr * 0.6], [cx + hr + 4, cy - hr * 0.6], [cx + hr + 2, cy - hr * 0.3], [cx - hr - 2, cy - hr * 0.3]], sd + 71, 0.8)} fill={hat === 'captain' ? '#111' : '#0c0f18'} stroke={INK} strokeWidth={lw * 0.7} />,
		);
		if (hat === 'captain') hatEl.push(<path key="hat3" d={wobCircle(cx, cy - hr * 0.95, 7, sd + 72, 0.5, 6)} fill="#d8b23a" stroke={INK} strokeWidth={2.5} />);
		if (hat === 'police') hatEl.push(<rect key="hat4" x={cx - hr - 8} y={cy - hr * 0.85} width={hr * 2 + 16} height={7} fill="#e8e8e8" opacity={0.85} />);
	}
	if (hat === 'beanie') {
		hatEl.push(<path key="bn" d={wob([[cx - hr - 3, cy - hr * 0.35], [cx - hr, cy - hr * 0.9], [cx, cy - hr - 12], [cx + hr, cy - hr * 0.9], [cx + hr + 3, cy - hr * 0.35]], sd + 73, 1)} fill="#6b2d2d" stroke={INK} strokeWidth={lw * 0.8} />);
	}

	// ---- props at the hands
	const propEl: React.ReactNode[] = [];
	const hand = R[2];
	const both: Pt = [(L[2][0] + R[2][0]) / 2, (L[2][1] + R[2][1]) / 2];
	const at = p.arms === 'hold' || p.arms === 'handsForward' ? both : hand;
	if (prop === 'phone' || prop === 'tablet') {
		const w = prop === 'phone' ? 22 : 60;
		const hh = prop === 'phone' ? 38 : 44;
		propEl.push(
			<g key="ph">
				<path d={wobPoly([[at[0] - w / 2, at[1] - hh], [at[0] + w / 2, at[1] - hh], [at[0] + w / 2, at[1]], [at[0] - w / 2, at[1]]], sd + 80, 0.6)} fill="#1d1d22" stroke={INK} strokeWidth={3.5} />
				<rect x={at[0] - w / 2 + 4} y={at[1] - hh + 4} width={w - 8} height={hh - 8} fill={p.propGlow ?? '#5b7fb3'} opacity={0.9} />
			</g>,
		);
	}
	if (prop === 'clicker') propEl.push(<path key="cl" d={wobRect(at[0] - 8, at[1] - 16, 16, 20, sd + 81, 0.6)} fill="#b9bcc2" stroke={INK} strokeWidth={3} />);
	if (prop === 'card') propEl.push(<path key="cd" d={wobRect(at[0] - 18, at[1] - 26, 36, 24, sd + 82, 0.6)} fill="#e9e4d4" stroke={INK} strokeWidth={3} />);
	if (prop === 'handset') propEl.push(<path key="hs" d={wobRect(at[0] - 9, at[1] - 30, 18, 34, sd + 83, 0.6)} fill="#222" stroke={INK} strokeWidth={3} />);
	if (prop === 'notebook') propEl.push(<path key="nb" d={wobRect(at[0] - 16, at[1] - 30, 32, 38, sd + 84, 0.6)} fill="#f2efe6" stroke={INK} strokeWidth={3} />);
	if (p.arms === 'fingerLips' && !back) propEl.push(<path key="fl" d={`M${hand[0]},${hand[1] - 6} L${hand[0] - 1},${hand[1] - 30}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />, <path key="fl2" d={`M${hand[0]},${hand[1] - 6} L${hand[0] - 1},${hand[1] - 30}`} stroke={skin} strokeWidth={4} strokeLinecap="round" />);
	if (prop === 'ring') propEl.push(<circle key="rg" cx={at[0]} cy={at[1] - 10} r={7} fill="none" stroke="#d4af37" strokeWidth={4} />);
	if (prop === 'flashlight') {
		propEl.push(
			<g key="fl">
				<path d={`M${at[0]},${at[1] - 6} L${at[0] + 520},${at[1] - 120} L${at[0] + 520},${at[1] + 110} Z`} fill="#fff6c8" opacity={0.12} />
				<path d={wobRect(at[0] - 10, at[1] - 12, 26, 13, sd + 85, 0.5)} fill="#333" stroke={INK} strokeWidth={3} />
			</g>,
		);
	}

	const armPath = (pts: Pt[], sdo: number) => wob(pts, sd + sdo, amp * 0.5, false);
	const lum = parseInt(palette.shirt.slice(1, 3), 16) + parseInt(palette.shirt.slice(3, 5), 16) + parseInt(palette.shirt.slice(5, 7), 16);
	const sleeve = lum < 90 ? mixHex(palette.shirt, '#5a5f68', 0.35) : palette.shirt;
	const armEl = (arm: Pt[], i: number, far = false) => (
		<g key={`arm${i}`}>
			<path d={armPath(arm, 30 + i)} stroke={INK} strokeWidth={17 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={armPath(arm, 30 + i)} stroke={far ? mixHex(sleeve, '#000000', 0.25) : sleeve} strokeWidth={9 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={wobCircle(arm[2][0], arm[2][1], 9 * k, sd + 35 + i, 0.6, 7)} fill={far ? mixHex(skin, '#000000', 0.15) : skin} stroke={INK} strokeWidth={3.5} />
		</g>
	);
	const farArm = side && walking;
	const lapArms = sitting && !back && (p.arms === undefined || p.arms === 'folded' || p.arms === 'lap');
	const backArms = back || farArm ? (farArm ? [armEl(L, 0, true)] : [armEl(L, 0), armEl(R, 1)]) : [];
	const frontArms = back ? [] : farArm ? [armEl(R, 1)] : [armEl(L, 0), armEl(R, 1)];

	// ---- legs
	const pantsShade = mixHex(palette.pants, '#000000', 0.22);
	const showLegs = !(sitting && back) && (!coat || sitting);
	const legEls = legs.map((lg, i) => {
		const shade = side && walking && i === 0;
		return (
			<g key={`leg${i}`}>
				<path d={wob(lg, sd + 20 + i, amp * 0.5, false)} stroke={INK} strokeWidth={26 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d={wob(lg, sd + 20 + i, amp * 0.5, false)} stroke={shade ? pantsShade : palette.pants} strokeWidth={16 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			</g>
		);
	});
	const shoeEls = legs.map((lg, i) => {
		const [fx, fy] = lg[2];
		if (sitting) return <path key={`sh${i}`} d={wobEllipse(fx, fy - 5 * k, 15 * k, 9 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
		if (side && walking) return <path key={`sh${i}`} d={wobEllipse(fx + dir * 8 * k, fy - 4 * k, 18 * k, 7 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
		return <path key={`sh${i}`} d={wobEllipse(fx + (i === 0 ? -5 : 5), fy - 2, 16 * k, 8 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
	});
	// seated: the lap (thighs coming toward us, lit from above) + knee caps
	const lapTop = mixHex(coat ? palette.shirt : palette.pants, '#ffffff', 0.13);
	const lap =
		sitting && !back ? (
			<g key="lap">
				<path
					d={wobPoly(
						[
							[-hipW - 3, hipY - 3],
							[hipW + 3, hipY - 3],
							[35 * k, -63 * k],
							[32 * k, -51 * k],
							[-32 * k, -51 * k],
							[-35 * k, -63 * k],
						],
						sd + 27,
						0.5,
					)}
					fill={lapTop}
					stroke={INK}
					strokeWidth={lw * 0.9}
					strokeLinejoin="round"
				/>
				<path d={`M0,${hipY + 2} L0,${-53 * k}`} stroke={INK} strokeWidth={2.5} opacity={0.55} />
				{[-1, 1].map((sg) => (
					<ellipse key={sg} cx={sg * 18 * k} cy={-57 * k} rx={12 * k} ry={4.5 * k} fill="#fff" opacity={0.12} />
				))}
				{coat ? <path d={wobPoly([[-shW - 4, hipY - 4], [shW + 4, hipY - 4], [36 * k, -30 * k], [-36 * k, -30 * k]], sd + 28, 0.5)} fill={palette.shirt} stroke={INK} strokeWidth={lw * 0.8} /> : null}
			</g>
		) : null;

	// ---- shading (one light from the upper left)
	const shadeBody = !back ? (
		<g clipPath={`url(#bc${uid})`}>
			<path d={`M${shW * 0.3},${shY - 10} L${shW + 30},${shY - 10} L${shW + 30},${hipY + 40} L${hipW * 0.2},${hipY + 40} Z`} fill="#000" opacity={0.13} />
			<path d={`M${-shW - 10},${shY + 4} L${shW + 10},${shY + 4}`} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
		</g>
	) : null;

	const bodyD = wobPoly(bodyPts, sd + 10, amp);
	const headD = wobCircle(cx, cy, hr, sd + 1, amp * 0.8, 11);
	const upper = (
		<g transform={`rotate(${bodyRot} 0 ${hipY})`}>
			{hairBack}
			{backArms}
			{/* body */}
			<path d={bodyD} fill={palette.shirt} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
			{shadeBody}
			{coat && !sitting ? <path d={wobLine(0, shY + 18, 0, -26 * k, sd + 11, 0.8, 3)} stroke="#000" strokeWidth={2.5} opacity={0.6} /> : null}
			{p.stripe && !back ? <path d={wobLine(-shW + 3, shY + 34, shW - 3, shY + 34, sd + 12, 0.8, 2)} stroke={p.stripe} strokeWidth={9} /> : null}
			{p.vest && !back ? (
				<g>
					<path d={wobPoly([[-shW + 6, shY + 4], [shW - 6, shY + 4], [hipW - 2, hipY], [-hipW + 2, hipY]], sd + 13, 0.8)} fill={p.vest} stroke={INK} strokeWidth={3} />
					<path d={wobLine(-hipW + 4, hipY - 26, hipW - 4, hipY - 26, sd + 14, 0.6, 2)} stroke="#e9eef2" strokeWidth={5} opacity={0.9} />
					{p.vestText ? (
						<text x={0} y={shY + 36} textAnchor="middle" fontFamily="Patrick Hand" fontSize={15} fontWeight={700} fill="#14213a">
							{p.vestText}
						</text>
					) : null}
				</g>
			) : null}
			{p.brooch && !back ? (
				<g transform={`translate(${-shW * 0.45}, ${shY + 26})`}>
					<ellipse cx={0} cy={0} rx={9} ry={8} fill="#c9ced3" stroke="#6f767c" strokeWidth={2} />
					{/* the filigree reads as "37" if you look closely */}
					<text x={0} y={3.5} textAnchor="middle" fontFamily="Patrick Hand" fontSize={10} fill="#5d646a">
						37
					</text>
				</g>
			) : null}
			{/* head */}
			<g transform={headTransform}>
				<path d={headD} fill={back ? palette.hair : skin} stroke={INK} strokeWidth={lw} />
				{!back ? <ellipse cx={cx + hr * 0.5} cy={cy + hr * 0.12} rx={hr * 0.55} ry={hr * 0.92} fill="#000" opacity={0.07} clipPath={`url(#hc${uid})`} /> : null}
				{!back ? <ellipse cx={cx - hr * 0.42} cy={cy - hr * 0.42} rx={hr * 0.26} ry={hr * 0.16} fill="#fff" opacity={0.18} /> : null}
				{!back && p.blush ? (
					<>
						<ellipse cx={cx - 20 + faceDX} cy={cy + 8} rx={7} ry={4} fill="#e88" opacity={0.5} />
						<ellipse cx={cx + 20 + faceDX} cy={cy + 8} rx={7} ry={4} fill="#e88" opacity={0.5} />
					</>
				) : null}
				{!back && p.wrinkles ? (
					<g stroke="#9a8f86" strokeWidth={1.6} fill="none" opacity={0.7}>
						<path d={`M${cx - 25 + faceDX},${eyeY - 4} l-6,-3 M${cx - 25 + faceDX},${eyeY + 1} l-7,1 M${cx - 25 + faceDX},${eyeY + 5} l-6,4`} />
						<path d={`M${cx + 25 + faceDX},${eyeY - 4} l6,-3 M${cx + 25 + faceDX},${eyeY + 1} l7,1 M${cx + 25 + faceDX},${eyeY + 5} l6,4`} />
						<path d={`M${cx - 10 + faceDX},${cy - hr * 0.62} q10,-3 20,0`} />
					</g>
				) : null}
				{eyesEl}
				{browsEl}
				{p.glasses && !back ? (
					<g fill="none" stroke={INK} strokeWidth={2.5}>
						<circle cx={cx - eyeDX + faceDX} cy={eyeY} r={9} />
						<circle cx={cx + eyeDX + faceDX} cy={eyeY} r={9} />
						<path d={`M${cx - 4 + faceDX},${eyeY} L${cx + 4 + faceDX},${eyeY}`} />
					</g>
				) : null}
				{p.mustache && !back ? (
					<path d={wob([[mx - 18, my - 2], [mx - 8, my - 9], [mx, my - 6], [mx + 8, my - 9], [mx + 18, my - 2], [mx, my - 3]], sd + 90, 0.6)} fill={p.mustache} stroke={INK} strokeWidth={2.5} />
				) : null}
				{mouthEl}
				{hairFront}
				{hatEl}
				{!back && p.sweat ? <path d={`M${cx + hr * 0.75},${cy - hr * 0.5} q6,10 0,14 q-6,-4 0,-14`} fill="#8fc3ff" stroke={INK} strokeWidth={2} /> : null}
				{!back && p.tears
					? [-1, 1].map((sg) => {
							const ty = eyeY + 8 + ((fr * 1.4 + (sg > 0 ? 9 : 0)) % 26) * (p.tears ?? 0);
							return <path key={`t${sg}`} d={`M${cx + sg * eyeDX + faceDX},${ty} q4,7 0,10 q-4,-3 0,-10`} fill="#7fb6ff" stroke="#2b4d7a" strokeWidth={1.5} opacity={Math.min(1, p.tears ?? 0)} />;
						})
					: null}
			</g>
			{lapArms ? null : frontArms}
			{propEl}
		</g>
	);

	return (
		<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={opacity}>
			<defs>
				<clipPath id={`bc${uid}`}>
					<path d={bodyD} />
				</clipPath>
				<clipPath id={`hc${uid}`}>
					<path d={headD} />
				</clipPath>
			</defs>
			{/* contact shadow */}
			{!sitting ? <ellipse cx={0} cy={2} rx={(walking ? 40 : 46) * k} ry={9 * k} fill="#000" opacity={0.22} /> : <ellipse cx={0} cy={-1} rx={40 * k} ry={7 * k} fill="#000" opacity={0.18} />}
			{/* legs behind the body when standing/walking; in front of it (over the seat) when sitting */}
			{!sitting && showLegs ? legEls : null}
			{!sitting ? shoeEls : null}
			{upper}
			{sitting ? lap : null}
			{sitting && showLegs ? (
				<>
					{legs.map((lg, i) => (
						// only the shins - the thighs are the lap shape
						<g key={`shin${i}`}>
							<path d={wob([lg[1], lg[2]], sd + 22 + i, amp * 0.4, false)} stroke={INK} strokeWidth={24 * k} fill="none" strokeLinecap="round" />
							<path d={wob([lg[1], lg[2]], sd + 22 + i, amp * 0.4, false)} stroke={i === 1 ? pantsShade : palette.pants} strokeWidth={14 * k} fill="none" strokeLinecap="round" />
						</g>
					))}
					{shoeEls}
					{/* re-draw the knee edge over the tops of the shins so the knees read */}
					<path d={`M${-31 * k},${-51 * k} L${31 * k},${-51 * k}`} stroke={INK} strokeWidth={lw * 0.9} strokeLinecap="round" />
				</>
			) : null}
			{lapArms ? <g transform={`rotate(${bodyRot} 0 ${hipY})`}>{frontArms}</g> : null}
		</g>
	);
};

function wobRect(x: number, y: number, w: number, h: number, seed: number, amp: number) {
	return wobPoly(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
		],
		seed,
		amp,
	);
}

export const jitterSeed = (n: number) => Math.round((h1(n, 4) + 1) * 1000);
