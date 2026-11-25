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
import {getInputProps} from 'remotion';
import {staticFile} from 'remotion';
import {boilOf, h1, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../../utils/rough';

export type Pose = 'stand' | 'sit' | 'walk' | 'run' | 'floor';
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
	| 'phoneEar'
	| 'hugKnees';
export type ArmSpec = {l: [number, number]; r: [number, number]};
export type Eyes = 'dot' | 'wide' | 'closed' | 'squint' | 'gray' | 'none' | 'glow';
export type Brows = 'none' | 'flat' | 'worried' | 'angry' | 'raised' | 'sad';
export type Mouth = 'smile' | 'faint' | 'grin' | 'flat' | 'frown' | 'o' | 'scream' | 'wobbly' | 'open' | 'shout' | 'laugh';
export type Viseme = 'a' | 'e' | 'o' | 'm';
export type Hair = 'short' | 'medium' | 'bun' | 'ponytail' | 'grayShort' | 'none' | 'curly' | 'long' | 'buzz';
export type Hat = 'none' | 'captain' | 'police' | 'cap' | 'beanie';
export type Prop = 'none' | 'phone' | 'clicker' | 'tablet' | 'card' | 'ring' | 'flashlight' | 'handset' | 'notebook' | 'rifle' | 'shotgun' | 'lantern' | 'stick' | 'plate' | 'hotdog' | 'tar' | 'tabl' | 'finjan' | 'dallah' | 'receiver';

export interface Palette {
	skin: string;
	shirt: string;
	pants: string;
	hair: string;
	shoes: string;
}

/** A painted puppet part (public/puppets/*.png, cut out by scripts/images/puppets.py). */
export type PaintPart = {src: string; w: number; h: number; face?: {x: number; y: number; r: number; chin?: number; w?: number}; skin?: string};
export type Paint = {head: PaintPart; headSide: PaintPart; headBack: PaintPart; torso: PaintPart; torsoSide: PaintPart; torsoBack: PaintPart; headScale?: number; faceDy?: number};

export interface StickProps {
	/** painted puppet parts: replace the code-drawn head, hair and torso (eyes, brows, mouth stay code-drawn) */
	paint?: Paint;
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
	hatColor?: string;
	prop?: Prop;
	propGlow?: string;
	mustache?: string;
	glasses?: boolean;
	brooch?: boolean;
	stripe?: string;
	/** an open cardigan / robe / blanket in this colour over the shirt (sleeves take this colour too) */
	open?: string;
	/** a V-neck sweater vest in this colour over the shirt */
	sweater?: string;
	/** pyjamas: stripes of this colour across the top and the legs */
	pj?: string;
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
	/** draw no arms (a sleeper whose arms are drawn by the bed) */
	noArms?: boolean;
	/** draw only the head with its full hair - no body, arms, legs or shadow (a sleeper whose body is under a blanket) */
	headOnly?: boolean;
	/** draw only the eyes (glowing eyes in the dark) */
	eyesOnly?: boolean;
	/** a long garment from the shoulders down (daraa, gown, abaya, dishdasha): hides the legs; only the feet show */
	robe?: {color: string; trim?: string; to?: 'floor' | 'ankle'; flare?: number; shine?: boolean};
	/** lift the hem of the robe (0..1) - when dancing, the feet show */
	hemLift?: number;
	/** hooves instead of feet (goat-like, dark) */
	hooves?: boolean;
	/** head covering: shayla (women's scarf), ghutra (men's headdress with agal), veil (bride: sheer, over the face) */
	headwear?: 'shayla' | 'ghutra' | 'veil';
	headwearColor?: string;
	/** gold jewellery on the forehead/neck (a wedding guest, the bride) */
	gold?: boolean;
	/** only the hair on the head itself: no ponytail or hair hanging behind the head (a sleeper on a pillow) */
	hairCapOnly?: boolean;
	/** with headOnly: draw ONLY the hair hanging behind the head (so a neck can be drawn between it and the face) */
	hairBackOnly?: boolean;
}

const INK = '#141414';
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

/** Mouth-tracking render mode (scripts/images/mouthkeys.mjs): every mouth becomes a flat
 *  marker in a colour unique to the character, so it can be located in the frame. */
export const MOUTH_KEY_SEEDS = [37, 38, 63, 8, 11, 12, 21, 30, 13];
const mouthKeyMode = () => Boolean((getInputProps() as {mouthKey?: boolean}).mouthKey);
export const mouthKeyColor = (seed: number) => {
	const i = MOUTH_KEY_SEEDS.indexOf(seed);
	return i < 0 ? null : `rgb(255,0,${24 * (i + 1)})`;
};

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
	hugKnees: {l: [-6, -78], r: [-6, -78]},
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
	phoneEar: {l: [10, 0], r: [70, 139]}, // elbow out, the phone beside the head (not over the mouth)
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
	const tsec = fr / 24;
	const ph = seed * 1.37;
	const boil = frame === null ? 0 : boilOf(frame, 4);
	const sd = seed * 31 + boil * 7;
	const amp = frame === null ? 0.5 : 0.9;
	const lw = 5.5 * line;
	const skin = p.pale ? mixHex(palette.skin, '#dfe6dc', p.pale) : palette.skin;

	const sitting = pose === 'sit';
	// on the floor, knees pulled up to the chest
	const floor = pose === 'floor';
	const walking = pose === 'walk' || pose === 'run';
	const side = Math.abs(turn) >= 0.5 && !back;
	const dir = turn >= 0 ? 1 : -1;
	const k = p.child ? 0.62 : 1;
	const headR = 36 * (p.child ? 1.08 : 1);

	// ---- idle motion
	const breath = live ? Math.sin((tsec * 2 * Math.PI) / (3.6 + (seed % 5) * 0.25) + ph) : 0;
	const bob = walking ? -Math.abs(Math.sin(phase)) * (pose === 'run' ? 9 : 5) * k : 0;
	const hipY = (floor ? -18 : sitting ? -72 : -120) * k + bob;
	const shY = (floor ? -113 : sitting ? -167 : -219) * k + bob - breath * 1.5 * k;
	const headY = (floor ? -155 : sitting ? -209 : -262) * k + bob - breath * 1.8 * k;
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
	if (floor && p.arms === undefined) armSpec = p.robe ? ARM_PRESETS.lap : ARM_PRESETS.hugKnees;
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
	if (floor) {
		for (const sg of [-1, 1]) {
			// knees apart and up at chest height, feet together on the floor: reads as hugging the knees
			legs.push([
				[sg * 15 * k, hipY],
				[sg * 36 * k, -98 * k],
				[sg * 12 * k, -2],
			]);
		}
	} else if (sitting) {
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
	const robe = p.robe;
	const coat = Boolean(p.longCoat) || Boolean(robe);
	const hemY = robe ? ((robe.to === 'ankle' ? -20 : -7) - (p.hemLift ?? 0) * 34) * k : -22 * k;
	const hemW = robe ? (shW + (robe.flare ?? 22) * k) : 0;
	const bodyPts: Pt[] = robe
		? sitting || floor
			? [
					[-shW - 2, shY],
					[shW + 2, shY],
					[shW + 8, hipY + 4],
					[-shW - 8, hipY + 4],
				]
			: [
					[-shW - 2, shY],
					[shW + 2, shY],
					[shW + 6, shY + (hipY - shY) * 0.55],
					[hemW, hemY],
					[-hemW, hemY],
					[-shW - 6, shY + (hipY - shY) * 0.55],
				]
		: coat
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
	// painted heads already turn (three-quarter drawing): only a small shift of the features
	const faceDX = p.paint ? turn * (Math.abs(turn) >= 0.5 ? 3 : 7) : turn * 15;
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
			const ex = hx0 + sg * (p.paint && Math.abs(turn) >= 0.5 ? 11 : eyeDX) + faceDX + (Math.abs(turn) > 0.6 && Math.sign(turn) !== sg ? -turn * (p.paint ? 2 : 4) : 0);
			if (Math.abs(turn) > 0.85 && Math.sign(turn) === -sg) continue;
			if (eyes === 'wide') {
				eyesEl.push(<path key={`ew${sg}`} d={wobCircle(ex, eyeY, 9.5, sd + sg, 0.6, 8)} fill="#fff" stroke={INK} strokeWidth={3} />);
				eyesEl.push(<circle key={`ep${sg}`} cx={ex + lx} cy={eyeY + ly} r={4} fill={INK} />);
			} else if (eyes === 'closed') {
				eyesEl.push(<path key={`ec${sg}`} d={`M${ex - 7},${eyeY} Q${ex},${eyeY + 6} ${ex + 7},${eyeY}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
			} else if (eyes === 'glow') {
				eyesEl.push(<circle key={`eg${sg}`} cx={ex + lx} cy={eyeY + ly} r={12} fill="#d9ff7a" opacity={0.35} />);
				eyesEl.push(<circle key={`ed${sg}`} cx={ex + lx} cy={eyeY + ly} r={6.5} fill="#f2ffb0" stroke="#9fbf2a" strokeWidth={1.5} />);
				eyesEl.push(<ellipse key={`es${sg}`} cx={ex + lx} cy={eyeY + ly} rx={1.6} ry={5} fill="#1c2208" />);
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

	if (!back && mouthKeyMode()) {
		const kc = mouthKeyColor(seed);
		mouthEl = kc ? <ellipse cx={mx} cy={my + 1} rx={11} ry={7} fill={kc} /> : mouthEl;
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

	// ---- head coverings: shayla (a woman's scarf framing the face, falling behind to the shoulders),
	// ghutra (a man's white headdress with the black agal cords), veil (a bride: sheer, over the whole face)
	const hw = p.headwear;
	const hwc = p.headwearColor ?? (hw === 'ghutra' ? '#f4f2ec' : hw === 'veil' ? '#fbf8f2' : '#1d1d24');
	const veilEl: React.ReactNode[] = [];
	if (hw === 'shayla' || hw === 'ghutra') {
		hairBack.length = 0;
		hairFront.length = 0;
		const R0 = hr + 9;
		// behind the head: the cloth round the back of the head and down onto the shoulders
		hairBack.push(
			<path key="hwb" d={wobPoly([[cx - R0, cy - 2], [cx - R0 * 0.7, cy - R0 * 0.75], [cx, cy - R0 - 2], [cx + R0 * 0.7, cy - R0 * 0.75], [cx + R0, cy - 2], [cx + R0 + 4, cy + hr * 0.9], [shW + 12, shY + 34 * k], [-shW - 12, shY + 34 * k], [cx - R0 - 4, cy + hr * 0.9]], sd + 74, 0.9)} fill={hwc} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />,
		);
		if (!back) {
			// in front: the band over the forehead and down both sides of the face
			const fb = hw === 'ghutra' ? -0.5 : -0.62;
			hairFront.push(
				<path
					key="hwf"
					d={`M${cx - R0},${cy + hr * 0.55} A${R0},${R0 + 2} 0 0 1 ${cx + R0},${cy + hr * 0.55} L${cx + hr * 0.9},${cy + hr * 0.42} Q${cx + hr * 0.86},${cy + hr * fb} ${cx},${cy + hr * (fb - 0.08)} Q${cx - hr * 0.86},${cy + hr * fb} ${cx - hr * 0.9},${cy + hr * 0.42} Z`}
					fill={hwc}
					stroke={INK}
					strokeWidth={lw}
					strokeLinejoin="round"
				/>,
			);
			if (hw === 'ghutra') {
				// the flaps hanging down beside the face, and the agal (two black cords) on top
				for (const sg of [-1, 1])
					hairFront.push(
						<path key={`gf${sg}`} d={wobPoly([[cx + sg * hr * 0.92, cy + hr * 0.3], [cx + sg * (R0 + 2), cy + hr * 0.4], [cx + sg * (R0 + 6), cy + hr * 1.5], [cx + sg * hr * 0.98, cy + hr * 1.45]], sd + 75 + sg, 0.6)} fill={hwc} stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />,
					);
				hairFront.push(
					<ellipse key="ag1" cx={cx} cy={cy - hr * 0.72} rx={hr * 0.95} ry={hr * 0.2} fill="none" stroke="#111" strokeWidth={6} />,
					<ellipse key="ag2" cx={cx} cy={cy - hr * 0.6} rx={hr * 0.98} ry={hr * 0.2} fill="none" stroke="#111" strokeWidth={5} />,
				);
			}
		}
	}
	if (hw === 'veil') {
		// a sheer bridal veil over the whole head and face, falling to the shoulders, a gold band on top
		veilEl.push(
			<path key="vl" d={wobPoly([[cx - hr - 6, cy - hr * 0.2], [cx - hr * 0.75, cy - hr - 6], [cx + hr * 0.75, cy - hr - 6], [cx + hr + 6, cy - hr * 0.2], [cx + hr + 16, cy + hr * 1.6], [cx - hr - 16, cy + hr * 1.6]], sd + 77, 0.8)} fill={hwc} opacity={0.93} stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />,
			<path key="vlb" d={`M${cx - hr * 0.8},${cy - hr * 0.78} Q${cx},${cy - hr * 1.08} ${cx + hr * 0.8},${cy - hr * 0.78}`} fill="none" stroke="#d9b24a" strokeWidth={5} />,
		);
	}
	if (p.gold && !back) {
		veilEl.push(<path key="gn" d={`M${-shW * 0.55},${shY + 4} Q0,${shY + 22 * k} ${shW * 0.55},${shY + 4}`} fill="none" stroke="#e0b53c" strokeWidth={4} />);
		if (hw !== 'veil') veilEl.push(<circle key="gf" cx={cx + faceDX * 0.5} cy={cy - hr * 0.55} r={4} fill="#e0b53c" stroke={INK} strokeWidth={1.5} />);
	}

	// ---- hat
	const hatEl: React.ReactNode[] = [];
	if (hat === 'captain' || hat === 'police' || hat === 'cap') {
		const top = p.hatColor ?? (hat === 'captain' ? '#f4f4f0' : hat === 'police' ? '#1b2233' : '#24406e');
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
	const at = p.arms === 'hold' || p.arms === 'handsForward' || (prop === 'rifle' && p.arms === 'folded') ? both : hand;
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
	if (prop === 'tar') {
		// a frame drum held up in front of the chest: wooden rim, goatskin
		const c: Pt = [both[0], both[1] - 10 * k];
		const r = 30 * Math.max(0.75, k);
		propEl.push(
			<g key="tar">
				<ellipse cx={c[0]} cy={c[1]} rx={r * 0.9} ry={r} fill="#8a5a2e" stroke={INK} strokeWidth={4} />
				<ellipse cx={c[0]} cy={c[1]} rx={r * 0.72} ry={r * 0.82} fill="#ecd9ad" stroke={INK} strokeWidth={2.5} />
				<ellipse cx={c[0] - r * 0.15} cy={c[1] - r * 0.2} rx={r * 0.25} ry={r * 0.18} fill="#fff" opacity={0.35} />
			</g>,
		);
	}
	if (prop === 'tabl') {
		// the tabl: a barrel drum held across the body, rope zigzag
		const c: Pt = [both[0], both[1] + 4 * k];
		const w = 64 * Math.max(0.75, k);
		const h = 34 * Math.max(0.75, k);
		propEl.push(
			<g key="tabl">
				<path d={wobRect(c[0] - w / 2, c[1] - h / 2, w, h, sd + 85, 0.5)} fill="#9a6a3a" stroke={INK} strokeWidth={4} />
				<path d={`M${c[0] - w / 2 + 6},${c[1] - h / 2} l8,${h} l8,${-h} l8,${h} l8,${-h} l8,${h} l8,${-h}`} fill="none" stroke="#e8dcc0" strokeWidth={2} />
				<ellipse cx={c[0] - w / 2} cy={c[1]} rx={6} ry={h / 2} fill="#ecd9ad" stroke={INK} strokeWidth={3} />
				<ellipse cx={c[0] + w / 2} cy={c[1]} rx={6} ry={h / 2} fill="#ecd9ad" stroke={INK} strokeWidth={3} />
			</g>,
		);
	}
	if (prop === 'finjan') propEl.push(<path key="fj" d={`M${hand[0] - 9},${hand[1] - 16} L${hand[0] + 9},${hand[1] - 16} L${hand[0] + 6},${hand[1] - 2} L${hand[0] - 6},${hand[1] - 2} Z`} fill="#f4efe2" stroke={INK} strokeWidth={3} />);
	if (prop === 'dallah')
		propEl.push(
			<g key="dl">
				<path d={`M${hand[0] - 14},${hand[1] + 8} Q${hand[0] - 18},${hand[1] - 22} ${hand[0]},${hand[1] - 30} Q${hand[0] + 18},${hand[1] - 22} ${hand[0] + 14},${hand[1] + 8} Z`} fill="#d9a83a" stroke={INK} strokeWidth={3.5} />
				<path d={`M${hand[0] + 12},${hand[1] - 16} Q${hand[0] + 30},${hand[1] - 28} ${hand[0] + 34},${hand[1] - 40}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
				<path d={`M${hand[0] + 12},${hand[1] - 16} Q${hand[0] + 30},${hand[1] - 28} ${hand[0] + 34},${hand[1] - 40}`} fill="none" stroke="#d9a83a" strokeWidth={3.5} strokeLinecap="round" />
				<path d={`M${hand[0]},${hand[1] - 30} L${hand[0]},${hand[1] - 40}`} stroke={INK} strokeWidth={4} />
			</g>,
		);
	if (prop === 'receiver')
		propEl.push(<path key="rc" d={`M${hand[0] - 4},${hand[1] - 30} q-10,15 0,32 l10,2 q-6,-16 2,-32 z`} fill="#2a2420" stroke={INK} strokeWidth={3} />);
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

	// long guns: a rifle held across the body at port arms, a shotgun resting in the crook of the arm
	if (prop === 'rifle' || prop === 'shotgun') {
		const [ux, uy] = prop === 'rifle' ? [-0.42, -0.91] : [0.93, 0.36];
		const g0: Pt = [at[0] - ux * 52 * k, at[1] - uy * 52 * k];
		const g1: Pt = [at[0] + ux * (prop === 'rifle' ? 150 : 120) * k, at[1] + uy * (prop === 'rifle' ? 150 : 120) * k];
		const mid: Pt = [lerpN(g0[0], g1[0], 0.42), lerpN(g0[1], g1[1], 0.42)];
		propEl.push(
			<g key="gun">
				<path d={`M${g0[0]},${g0[1]} L${mid[0]},${mid[1]}`} stroke={INK} strokeWidth={17 * k} strokeLinecap="round" />
				<path d={`M${g0[0]},${g0[1]} L${mid[0]},${mid[1]}`} stroke="#6b4426" strokeWidth={11 * k} strokeLinecap="round" />
				<path d={`M${mid[0]},${mid[1]} L${g1[0]},${g1[1]}`} stroke={INK} strokeWidth={9 * k} strokeLinecap="round" />
				<path d={`M${mid[0]},${mid[1]} L${g1[0]},${g1[1]}`} stroke="#5d6166" strokeWidth={4.5 * k} strokeLinecap="round" />
			</g>,
		);
	}
	if (prop === 'lantern') {
		propEl.push(
			<g key="lt">
				<circle cx={hand[0]} cy={hand[1] + 34 * k} r={150 * k} fill="#ffd98a" opacity={0.16} />
				<path d={`M${hand[0] - 10 * k},${hand[1] + 6 * k} Q${hand[0]},${hand[1] - 6 * k} ${hand[0] + 10 * k},${hand[1] + 6 * k}`} fill="none" stroke={INK} strokeWidth={3} />
				<path d={wobRect(hand[0] - 13 * k, hand[1] + 8 * k, 26 * k, 38 * k, sd + 86, 0.5)} fill="#ffe7a0" stroke={INK} strokeWidth={3.5} />
				<rect x={hand[0] - 15 * k} y={hand[1] + 4 * k} width={30 * k} height={7 * k} fill="#3a3a3a" stroke={INK} strokeWidth={2} />
				<rect x={hand[0] - 15 * k} y={hand[1] + 44 * k} width={30 * k} height={7 * k} fill="#3a3a3a" stroke={INK} strokeWidth={2} />
			</g>,
		);
	}
	if (prop === 'stick') propEl.push(<path key="stk" d={wobLine(hand[0] - 10 * k, hand[1] + 30 * k, hand[0] + 30 * k, hand[1] - 110 * k, sd + 87, 1.2)} stroke="#7a5532" strokeWidth={10 * k} strokeLinecap="round" />);
	if (prop === 'plate') propEl.push(<ellipse key="pl" cx={at[0]} cy={at[1] - 4} rx={30 * k} ry={9 * k} fill="#f4f1e8" stroke={INK} strokeWidth={3} />);
	if (prop === 'hotdog') {
		propEl.push(
			<g key="hd" transform={`rotate(-20 ${at[0]} ${at[1]})`}>
				<rect x={at[0] - 22 * k} y={at[1] - 10 * k} width={44 * k} height={14 * k} rx={7 * k} fill="#e8b862" stroke={INK} strokeWidth={2.5} />
				<rect x={at[0] - 25 * k} y={at[1] - 7 * k} width={50 * k} height={7 * k} rx={3.5 * k} fill="#b5482f" stroke={INK} strokeWidth={2} />
			</g>,
		);
	}

	const armPath = (pts: Pt[], sdo: number) => wob(pts, sd + sdo, amp * 0.5, false);
	const lum = parseInt(palette.shirt.slice(1, 3), 16) + parseInt(palette.shirt.slice(3, 5), 16) + parseInt(palette.shirt.slice(5, 7), 16);
	const sleeveBase = p.open ?? palette.shirt;
	const sleeve = lum < 90 && !p.open ? mixHex(palette.shirt, '#5a5f68', 0.35) : sleeveBase;
	const armEl = (arm: Pt[], i: number, far = false) => (
		<g key={`arm${i}`}>
			<path d={armPath(arm, 30 + i)} stroke={INK} strokeWidth={17 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={armPath(arm, 30 + i)} stroke={far ? mixHex(sleeve, '#000000', 0.25) : sleeve} strokeWidth={9 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={wobCircle(arm[2][0], arm[2][1], 9 * k, sd + 35 + i, 0.6, 7)} fill={far ? mixHex(skin, '#000000', 0.15) : skin} stroke={INK} strokeWidth={3.5} />
		</g>
	);
	const farArm = side && walking;
	const lapArms = (sitting && !back && (p.arms === undefined || p.arms === 'folded' || p.arms === 'lap')) || (floor && !back);
	if (p.hairCapOnly) hairBack.length = 0;
	const backArms = p.noArms ? [] : back || farArm ? (farArm ? [armEl(L, 0, true)] : [armEl(L, 0), armEl(R, 1)]) : [];
	const frontArms = p.noArms || back ? [] : farArm ? [armEl(R, 1)] : [armEl(L, 0), armEl(R, 1)];

	// ---- legs
	const pantsShade = mixHex(palette.pants, '#000000', 0.22);
	const showLegs = !(sitting && back) && (!coat || sitting);
	const legCol = robe ? robe.color : palette.pants;
	const legEls = legs.map((lg, i) => {
		const shade = side && walking && i === 0;
		return (
			<g key={`leg${i}`}>
				<path d={wob(lg, sd + 20 + i, amp * 0.5, false)} stroke={INK} strokeWidth={26 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d={wob(lg, sd + 20 + i, amp * 0.5, false)} stroke={shade ? (robe ? mixHex(legCol, '#000000', 0.2) : pantsShade) : legCol} strokeWidth={16 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				{p.pj ? <path d={wob(lg, sd + 20 + i, amp * 0.5, false)} stroke={p.pj} strokeWidth={15 * k} fill="none" strokeDasharray={`${5 * Math.max(0.75, k)} ${8 * Math.max(0.75, k)}`} opacity={shade ? 0.7 : 1} /> : null}
			</g>
		);
	});
	const hoofEl = (fx: number, fy: number, i: number, w = 1) => (
		<g key={`hf${i}`}>
			<path d={wobPoly([[fx - 9 * k * w, fy - 13 * k], [fx + 9 * k * w, fy - 13 * k], [fx + 12 * k * w, fy], [fx - 12 * k * w, fy]], sd + 25 + i, 0.4)} fill="#1c1611" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
			<path d={`M${fx},${fy - 9 * k} L${fx},${fy}`} stroke="#5a4a3c" strokeWidth={2.5} />
		</g>
	);
	const shoeEls = legs.map((lg, i) => {
		const [fx, fy] = lg[2];
		if (p.hooves) {
			// a thin furred leg from under the hem down to the hoof (only what the hem doesn't cover shows)
			const top = robe && !sitting ? hemY - 4 : fy - 40 * k;
			return (
				<g key={`hl${i}`}>
					<path d={`M${fx},${top} L${fx + 3 * k},${fy - 22 * k} L${fx - 1 * k},${fy - 11 * k}`} stroke={INK} strokeWidth={15 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					<path d={`M${fx},${top} L${fx + 3 * k},${fy - 22 * k} L${fx - 1 * k},${fy - 11 * k}`} stroke="#4a3a2e" strokeWidth={8 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					{hoofEl(fx - 1 * k, fy, i)}
				</g>
			);
		}
		if (sitting) return <path key={`sh${i}`} d={wobEllipse(fx, fy - 5 * k, 15 * k, 9 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
		if (side && walking) return <path key={`sh${i}`} d={wobEllipse(fx + dir * 8 * k, fy - 4 * k, 18 * k, 7 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
		return <path key={`sh${i}`} d={wobEllipse(fx + (i === 0 ? -5 : 5), fy - 2, 16 * k, 8 * k, sd + 25 + i, 0.6, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />;
	});
	// seated: the lap (thighs coming toward us, lit from above) + knee caps
	const lapTop = mixHex(robe ? robe.color : coat ? palette.shirt : palette.pants, '#ffffff', 0.13);
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
				{coat ? <path d={wobPoly([[-shW - 4, hipY - 4], [shW + 4, hipY - 4], [36 * k, -30 * k], [-36 * k, -30 * k]], sd + 28, 0.5)} fill={robe ? robe.color : palette.shirt} stroke={INK} strokeWidth={lw * 0.8} /> : null}
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
			{p.paint ? null : hairBack}
			{backArms}
			{p.headOnly ? null : (
				<>
			{/* body */}
			{p.paint ? (
				(() => {
					const part = back ? p.paint.torsoBack : side ? p.paint.torsoSide : p.paint.torso;
					const bw = (side ? shW * 2.4 : shW * 2 + 18) * (part === p.paint.torsoBack ? 1.02 : 1);
					const top = shY - 10;
					const bh = hipY + 12 - top;
					const mirror = side && dir < 0;
					return <image href={staticFile(part.src)} x={-bw / 2} y={top} width={bw} height={bh} preserveAspectRatio="none" transform={mirror ? 'scale(-1 1)' : undefined} />;
				})()
			) : (
				<path d={bodyD} fill={robe ? robe.color : back && p.open ? p.open : palette.shirt} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
			)}
			{p.open && !back && !p.paint ? (
				<g>
					{(side ? [1] : [-1, 1]).map((sg) => (
						<path
							key={`op${sg}`}
							d={wobPoly(side ? [[-shW, shY], [shW * 0.35, shY], [hipW * 0.3, hipY + 2], [-hipW, hipY + 2]] : [[sg * shW, shY], [sg * shW * 0.28, shY], [sg * hipW * 0.22, hipY + 2], [sg * hipW, hipY + 2]], sd + 15 + sg, 0.6)}
							fill={p.open}
							stroke={INK}
							strokeWidth={lw * 0.7}
							strokeLinejoin="round"
						/>
					))}
				</g>
			) : null}
			{robe && robe.trim && !back && !p.paint ? (
				<g>
					<path d={`M${-12 * Math.max(0.7, k)},${shY + 1} L0,${shY + 30 * k} L${12 * Math.max(0.7, k)},${shY + 1}`} fill="none" stroke={robe.trim} strokeWidth={5 * Math.max(0.7, k)} strokeLinejoin="round" />
					{!sitting ? <path d={`M${-hemW + 4},${hemY - 7 * k} L${hemW - 4},${hemY - 7 * k}`} stroke={robe.trim} strokeWidth={6 * Math.max(0.7, k)} /> : null}
				</g>
			) : null}
			{robe && robe.shine && !back && !p.paint ? (
				<g fill="#fff7d0" opacity={0.85}>
					{[0, 1, 2, 3, 4].map((i) => {
						const tw = 0.5 + 0.5 * Math.sin(tsec * 3 + i * 1.7 + seed);
						const yy = shY + 30 * k + i * ((sitting ? hipY : hemY) - shY - 40 * k) / 5;
						const xx = (h1(i, seed, 7) * 0.8) * (shW + 6);
						return <circle key={`sp${i}`} cx={xx} cy={yy} r={2.6 * tw + 0.6} />;
					})}
				</g>
			) : null}
			{p.sweater && !back && !p.paint ? (
				<path d={wobPoly([[-shW + 5, shY + 3], [-9, shY + 3], [0, shY + 30 * k], [9, shY + 3], [shW - 5, shY + 3], [hipW - 1, hipY], [-hipW + 1, hipY]], sd + 16, 0.6)} fill={p.sweater} stroke={INK} strokeWidth={lw * 0.65} strokeLinejoin="round" />
			) : null}
			{p.pj && !back && !p.paint ? (
				<g clipPath={`url(#bc${uid})`}>
					{Array.from({length: 12}, (_, i) => (
						<path key={i} d={wobLine(-shW - 12, shY + 4 + i * 13 * Math.max(0.75, k), shW + 12, shY + 4 + i * 13 * Math.max(0.75, k), sd + 60 + i, 0.6, 2)} stroke={p.pj} strokeWidth={5.5 * Math.max(0.75, k)} />
					))}
				</g>
			) : null}
			{p.paint ? null : shadeBody}
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
				</>
			)}
			{/* head */}
			<g transform={headTransform}>
				{p.paint ? (
					(() => {
						const P = p.paint;
						const part = back ? P.headBack : side ? P.headSide : P.head;
						// size from the front head's width, so every view has the same scale
						// the same face width for every character (long curly hair or bald), from the front head
						const sc = P.head.face?.w ? (hr * 1.45 * (P.headScale ?? 1)) / P.head.face.w : (hr * 2.55 * (P.headScale ?? 1)) / P.head.w;
						const face = part.face ?? {x: part.w / 2, y: (P.head.face?.y ?? P.head.h * 0.55) * (part.h / P.head.h), r: 1};
						const fx = cx + (side ? 0 : faceDX * 0.35);
						const fy = cy + 4 + (P.faceDy ?? 0) * hr;
						const mirror = side && dir < 0;
						const tf = `translate(${fx} ${fy}) scale(${mirror ? -sc : sc} ${sc}) translate(${-face.x} ${-face.y})`;
						return <image href={staticFile(part.src)} x={0} y={0} width={part.w} height={part.h} transform={tf} />;
					})()
				) : (
					<>
						<path d={headD} fill={back ? palette.hair : skin} stroke={INK} strokeWidth={lw} />
						{!back ? <ellipse cx={cx + hr * 0.5} cy={cy + hr * 0.12} rx={hr * 0.55} ry={hr * 0.92} fill="#000" opacity={0.07} clipPath={`url(#hc${uid})`} /> : null}
						{!back ? <ellipse cx={cx - hr * 0.42} cy={cy - hr * 0.42} rx={hr * 0.26} ry={hr * 0.16} fill="#fff" opacity={0.18} /> : null}
					</>
				)}
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
				{p.paint ? null : hairFront}
				{hatEl}
				{veilEl}
				{!back && p.sweat ? <path d={`M${cx + hr * 0.75},${cy - hr * 0.5} q6,10 0,14 q-6,-4 0,-14`} fill="#8fc3ff" stroke={INK} strokeWidth={2} /> : null}
				{!back && p.tears
					? [-1, 1].map((sg) => {
							const ty = eyeY + 8 + ((fr * 1.4 + (sg > 0 ? 9 : 0)) % 26) * (p.tears ?? 0);
							return <path key={`t${sg}`} d={`M${cx + sg * eyeDX + faceDX},${ty} q4,7 0,10 q-4,-3 0,-10`} fill="#7fb6ff" stroke="#2b4d7a" strokeWidth={1.5} opacity={Math.min(1, p.tears ?? 0)} />;
						})
					: null}
			</g>
			{lapArms ? null : frontArms}
			{back ? null : propEl}
		</g>
	);

	if (p.eyesOnly)
		// only the eyes (glowing eyes left in the dark after everything else has gone black)
		return (
			<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={opacity}>
				<g transform={`rotate(${bodyRot} 0 ${hipY})`}>
					<g transform={headTransform}>{eyesEl}</g>
				</g>
			</g>
		);
	if (p.headOnly && p.hairBackOnly)
		return (
			<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={opacity}>
				<g transform={`rotate(${bodyRot} 0 ${hipY})`}>{hairBack}</g>
			</g>
		);
	if (p.headOnly)
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
			{upper}
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
			{!sitting && !floor ? <ellipse cx={0} cy={2} rx={(walking ? 40 : 46) * k} ry={9 * k} fill="#000" opacity={0.22} /> : <ellipse cx={0} cy={-1} rx={(floor ? 52 : 40) * k} ry={(floor ? 9 : 7) * k} fill="#000" opacity={0.2} />}
			{/* legs behind the body when standing/walking; in front of it (over the seat) when sitting */}
			{!sitting && !floor && showLegs ? legEls : null}
			{!sitting && !floor ? shoeEls : null}
			{floor && robe ? (
				// sitting on the floor cushions, legs folded under the robe: the skirt spreads in a low mound
				<g>
					<path d={wobPoly([[-hipW - 46 * k, -2], [-hipW - 38 * k, -30 * k], [-hipW - 8 * k, -46 * k], [hipW + 8 * k, -46 * k], [hipW + 38 * k, -30 * k], [hipW + 46 * k, -2]], sd + 29, 0.5)} fill={robe.color} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
					<path d={`M${-hipW - 4 * k},${-40 * k} Q0,${-30 * k} ${hipW + 4 * k},${-40 * k}`} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.4} />
					{robe.trim ? <path d={`M${-hipW - 44 * k},${-8 * k} L${hipW + 44 * k},${-8 * k}`} stroke={robe.trim} strokeWidth={6 * Math.max(0.7, k)} /> : null}
				</g>
			) : null}
			{upper}
			{/* on the floor: the raised knees in front of the body, the arms wrapped round them */}
			{floor && !robe ? (
				<>
					{legEls}
					{shoeEls}
					{legs.map((lg, i) => (
						<path key={`kc${i}`} d={wobCircle(lg[1][0], lg[1][1], 14 * k, sd + 70 + i, 0.5, 8)} fill={mixHex(palette.pants, '#ffffff', 0.14)} stroke={INK} strokeWidth={3.5} />
					))}
				</>
			) : null}
			{sitting ? lap : null}
			{sitting && showLegs && robe ? (
				// a long dress seated: it falls from the knees to the ankles in one panel; only the shoes peek out
				<>
					{shoeEls}
					<path
						d={wobPoly([[-34 * k, -53 * k], [34 * k, -53 * k], [40 * k + (robe.flare ?? 0) * 0.3 * k, -10 * k], [-40 * k - (robe.flare ?? 0) * 0.3 * k, -10 * k]], sd + 31, 0.5)}
						fill={robe.color}
						stroke={INK}
						strokeWidth={lw * 0.9}
						strokeLinejoin="round"
					/>
					<path d={`M${-6 * k},${-48 * k} L${-9 * k},${-14 * k} M${12 * k},${-48 * k} L${15 * k},${-14 * k}`} stroke={INK} strokeWidth={2.5} opacity={0.35} />
					{robe.trim ? <path d={`M${-38 * k},${-16 * k} L${38 * k},${-16 * k}`} stroke={robe.trim} strokeWidth={6 * Math.max(0.7, k)} /> : null}
					<path d={`M${-31 * k},${-51 * k} L${31 * k},${-51 * k}`} stroke={INK} strokeWidth={lw * 0.9} strokeLinecap="round" />
				</>
			) : null}
			{sitting && showLegs && !robe ? (
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
