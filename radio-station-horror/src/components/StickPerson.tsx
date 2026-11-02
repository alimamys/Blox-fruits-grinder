// Deliberately crude MS-Paint stick person: big round head, dot eyes, tiny
// mouth, thick wobbly outlines. Poses are joint angles so they can be blended.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import type {Pt} from '../utils/wobble';
import {useBoil, wobCurve, wobEllipse, wobPath, wobPoly} from '../utils/wobble';

// ------------------------------------------------------------------ poses ---
/** Angles in degrees. 0 = straight down, +90 = pointing right (+x), 180 = up. Lower limb angle is relative. */
export type Pose = {
	armL: [number, number];
	armR: [number, number];
	legL: [number, number];
	legR: [number, number];
	/** Torso lean, degrees (+ = toward +x). */
	lean: number;
	/** How far the hip drops from standing height (px at scale 1). 76 = sitting on a seat. */
	hipY: number;
	headTilt: number;
};

const P = (armL: [number, number], armR: [number, number], legL: [number, number], legR: [number, number], lean = 0, hipY = 0, headTilt = 0): Pose => ({
	armL,
	armR,
	legL,
	legR,
	lean,
	hipY,
	headTilt,
});

export const POSES = {
	stand: P([-12, 6], [12, -6], [-5, 2], [5, -2]),
	standStiff: P([-6, 2], [6, -2], [-3, 0], [3, 0]),
	sit: P([-10, 25], [15, 40], [84, -84], [90, -90], 0, 76),
	sitHug: P([40, 75], [55, 60], [125, -172], [132, -178], 4, 76),
	sitUp: P([-20, 10], [25, 20], [88, 0], [92, 0], 0, 150),
	reach: P([-14, 10], [96, -8], [-6, 2], [8, -2], 4),
	reachLow: P([-14, 10], [70, 10], [-6, 2], [8, -2], 6),
	coverMouth: P([-12, 30], [160, 123], [-5, 2], [5, -2], -2),
	coverMouthSit: P([-10, 25], [160, 123], [84, -84], [90, -90], -2, 76),
	coverMouthHug: P([40, 75], [160, 123], [125, -172], [132, -178], 2, 76),
	handsOnHead: P([-150, -110], [150, 110], [-6, 2], [6, -2]),
	armsUp: P([-150, -20], [150, 20], [-14, 4], [14, -4]),
	recoil: P([-115, 75], [115, -75], [-12, 6], [10, -4], -8),
	pointDown: P([-10, 25], [38, 6], [84, -84], [90, -90], 0, 76),
	shush: P([-10, 25], [155, 128], [84, -84], [90, -90], 0, 76),
	pull: P([-20, 15], [80, 10], [-14, 8], [6, 0], -12),
	holdPhone: P([-12, 6], [150, 140], [-5, 2], [5, -2]),
	holdPhoneLow: P([-12, 6], [40, 110], [-5, 2], [5, -2]),
	carry: P([30, 80], [-30, -80], [-5, 2], [5, -2]),
	shrug: P([-60, -90], [60, 90], [-5, 2], [5, -2]),
	clutchStomach: P([-10, 100], [10, -100], [-5, 2], [5, -2], 4, 4, 6),
	tiptoeBack: P([-40, -30], [40, 30], [-14, 6], [8, -2], -10),
};

export type PoseName = keyof typeof POSES;

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
	const m = (x: number, y: number) => x + (y - x) * t;
	const m2 = (x: [number, number], y: [number, number]): [number, number] => [m(x[0], y[0]), m(x[1], y[1])];
	return {
		armL: m2(a.armL, b.armL),
		armR: m2(a.armR, b.armR),
		legL: m2(a.legL, b.legL),
		legR: m2(a.legR, b.legR),
		lean: m(a.lean, b.lean),
		hipY: m(a.hipY, b.hipY),
		headTilt: m(a.headTilt, b.headTilt),
	};
};

/** Walk cycle. `phase` in radians (advance ~0.25 per frame for a normal walk). */
export const walkPose = (phase: number, amount = 1): Pose => {
	const s = Math.sin(phase);
	const c = Math.cos(phase);
	return P(
		[-s * 20 * amount - 8, 8],
		[s * 20 * amount + 8, -8],
		[s * 24 * amount, Math.min(0, c) * 28 * amount],
		[-s * 24 * amount, Math.min(0, -c) * 28 * amount],
		3 * amount,
		-Math.abs(s) * 5 * amount,
	);
};

/** Run cycle. Advance phase ~0.45 per frame. */
export const runPose = (phase: number): Pose => {
	const s = Math.sin(phase);
	const c = Math.cos(phase);
	return P([-s * 50 - 10, 75], [s * 50 + 10, 75], [s * 45 + 10, Math.min(0, c) * 70 - 10], [-s * 45 + 10, Math.min(0, -c) * 70 - 10], 14, -Math.abs(s) * 10 + 6);
};

// -------------------------------------------------------------- the figure --
export type Expression =
	| 'neutral'
	| 'worried'
	| 'scared'
	| 'terrified'
	| 'scream'
	| 'confused'
	| 'nervous'
	| 'smile'
	| 'creepy'
	| 'blank'
	| 'sleep'
	| 'shush'
	| 'determined'
	| 'sad';

export type HairStyle = 'short' | 'messy' | 'slick' | 'curly' | 'long' | 'bald' | 'sideTufts' | 'cap' | 'police' | 'bedhead';
export type Outfit = 'tee' | 'longSleeve' | 'cardigan' | 'hoodie' | 'coat' | 'pajamas' | 'uniform' | 'vest';

export type StickPersonProps = {
	/** Ground point under the hips. */
	x: number;
	y: number;
	scale?: number;
	pose?: Pose;
	facing?: 1 | -1;
	expression?: Expression;
	/** Pupil offset, each -1..1. */
	look?: [number, number];
	/** -1..1: fake head turn (shifts the face sideways). */
	headTurn?: number;
	blink?: boolean;
	shirt?: string;
	pants?: string;
	skin?: string;
	hair?: HairStyle;
	hairColor?: string;
	outfit?: Outfit;
	build?: 'normal' | 'thin' | 'stocky';
	barefoot?: boolean;
	glasses?: boolean;
	mustache?: boolean;
	beard?: boolean;
	sweat?: boolean;
	/** 0..1 jitter (fear). */
	tremble?: number;
	/** Extra rotation of the whole figure around the hip (lying down etc.). */
	rotate?: number;
	opacity?: number;
	seed?: number;
	/** Draw only from the waist up (for close-ups behind furniture). */
	upperOnly?: boolean;
	/** Overall stroke colour (Victor in reflections uses a lighter ink). */
	ink?: string;
	/** Pale-out amount 0..1 (face drains of colour). */
	pale?: number;
	/** Draw an index finger on the right hand: 'up' (shush) or 'point' (along the forearm). */
	finger?: 'up' | 'point';
	/** Draw legs in front of the torso (default: when sitting). */
	legsFront?: boolean;
};

const UA = 62; // upper arm
const LA = 58; // lower arm
const TH = 76; // thigh
const SH = 74; // shin
const TORSO = 118;
const HEAD_R = 46;

const dir = (deg: number): Pt => {
	const r = (deg * Math.PI) / 180;
	return [Math.sin(r), Math.cos(r)];
};
const addP = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];
const rot = (p: Pt, deg: number): Pt => {
	const r = (deg * Math.PI) / 180;
	return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)];
};

const Outlined: React.FC<{d: string; color: string; width: number; ink: string}> = ({d, color, width, ink}) => (
	<>
		<path d={d} stroke={ink} strokeWidth={width + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		<path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</>
);

const mixColor = (a: string, b: string, t: number): string => {
	const pa = parseInt(a.slice(1), 16);
	const pb = parseInt(b.slice(1), 16);
	const ch = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
	return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

export const StickPerson: React.FC<StickPersonProps> = ({
	x,
	y,
	scale = 1,
	pose = POSES.stand,
	facing = 1,
	expression = 'neutral',
	look = [0, 0],
	headTurn = 0,
	blink = false,
	shirt = C.blue,
	pants = C.pants,
	skin = C.skin,
	hair = 'short',
	hairColor = C.hair,
	outfit = 'tee',
	build = 'normal',
	barefoot = false,
	glasses = false,
	mustache = false,
	beard = false,
	sweat = false,
	tremble = 0,
	rotate = 0,
	opacity = 1,
	seed = 1,
	upperOnly = false,
	ink = C.ink,
	pale = 0,
	finger,
	legsFront,
}) => {
	const boil = useBoil();
	const frame = useCurrentFrame();
	const sd = seed * 31 + boil;
	const faceSkin = pale > 0 ? mixColor(skin, '#dfe4ea', pale) : skin;

	const tw = build === 'thin' ? 0.72 : build === 'stocky' ? 1.25 : 1;
	const limbW = build === 'thin' ? 11 : build === 'stocky' ? 18 : 14;
	const tlen = build === 'thin' ? TORSO * 1.12 : TORSO;

	const tx = tremble * (hash1(frame, seed + 5) - 0.5) * 6;
	const ty = tremble * (hash1(frame, seed + 9) - 0.5) * 3;

	// skeleton (facing right, ground at y = 0)
	const hip: Pt = [0, -(TH + SH) + pose.hipY];
	const neck = addP(hip, rot([0, -tlen], pose.lean));
	const headC = addP(neck, rot([0, -(8 + HEAD_R)], pose.lean + pose.headTilt));
	const shL = addP(neck, rot([-30 * tw, 12], pose.lean));
	const shR = addP(neck, rot([30 * tw, 12], pose.lean));
	const hipL: Pt = [hip[0] - 13 * tw, hip[1]];
	const hipR: Pt = [hip[0] + 13 * tw, hip[1]];

	const limb = (root: Pt, a: [number, number], l1: number, l2: number): [Pt, Pt, Pt] => {
		const j = addP(root, dir(a[0]), l1);
		const e = addP(j, dir(a[0] + a[1]), l2);
		return [root, j, e];
	};
	const armL = limb(shL, pose.armL, UA, LA);
	const armR = limb(shR, pose.armR, UA, LA);
	const legL = limb(hipL, pose.legL, TH, SH);
	const legR = limb(hipR, pose.legR, TH, SH);

	const longSleeves = outfit !== 'tee' && outfit !== 'vest';
	const sleeveColor = outfit === 'vest' ? skin : shirt;

	// torso shape
	const bottomExtra = outfit === 'coat' ? 70 : outfit === 'hoodie' || outfit === 'cardigan' ? 16 : 8;
	const torsoPts: Pt[] = [
		addP(shL, rot([-6, -6], pose.lean)),
		addP(shR, rot([6, -6], pose.lean)),
		addP(hipR, [8 * tw + (outfit === 'coat' ? 10 : 0), bottomExtra]),
		addP(hipL, [-8 * tw - (outfit === 'coat' ? 10 : 0), bottomExtra]),
	];

	const drawLeg = (leg: [Pt, Pt, Pt], i: number) => {
		const d = wobCurve(leg, sd + 40 + i, 1.2);
		const foot = leg[2];
		return (
			<g key={`leg${i}`}>
				<Outlined d={d} color={pants} width={limbW + 2} ink={ink} />
				<path
					d={wobEllipse(foot[0] + 9, foot[1] - 2, 16, 8, sd + 60 + i, 1.2, 10)}
					fill={barefoot ? faceSkin : C.ink}
					stroke={ink}
					strokeWidth={4}
				/>
			</g>
		);
	};

	const drawArm = (arm: [Pt, Pt, Pt], i: number) => {
		const upper = wobCurve([arm[0], arm[1]], sd + 70 + i, 1);
		const full = wobCurve(arm, sd + 80 + i, 1.2);
		const hand = arm[2];
		return (
			<g key={`arm${i}`}>
				{longSleeves ? (
					<Outlined d={full} color={sleeveColor} width={limbW} ink={ink} />
				) : (
					<>
						<path d={full} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						<Outlined d={upper} color={sleeveColor} width={limbW} ink={ink} />
					</>
				)}
				{finger && i === 1 && (() => {
					const fd: Pt = finger === 'up' ? [0, -1] : (() => {
						const dx = arm[2][0] - arm[1][0];
						const dy = arm[2][1] - arm[1][1];
						const l = Math.hypot(dx, dy) || 1;
						return [dx / l, dy / l] as Pt;
					})();
					return (
						<path
							d={wobPath([hand, addP(hand, fd, 24)], sd + 95, 0.8)}
							stroke={ink}
							strokeWidth={6}
							strokeLinecap="round"
							fill="none"
						/>
					);
				})()}
				<path d={wobEllipse(hand[0], hand[1], 9, 9, sd + 90 + i, 1, 8)} fill={faceSkin} stroke={ink} strokeWidth={4} />
			</g>
		);
	};

	const body = (
		<g>
			{!upperOnly && !(legsFront ?? pose.hipY > 40) && [legL, legR].map(drawLeg)}
			{/* torso */}
			<path d={wobPoly(torsoPts, sd + 20, 2.2)} fill={shirt} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
			{outfit === 'cardigan' && (
				<>
					<path d={wobPath([addP(neck, [0, 6]), addP(hip, [0, bottomExtra])], sd + 23, 1.5)} stroke={ink} strokeWidth={4} fill="none" />
					{[0.35, 0.55, 0.75].map((t, k) => (
						<circle key={k} cx={neck[0] + (hip[0] - neck[0]) * t + 7} cy={neck[1] + (hip[1] + bottomExtra - neck[1]) * t} r={3.5} fill={ink} />
					))}
				</>
			)}
			{outfit === 'pajamas' &&
				[0.25, 0.5, 0.75].map((t, k) => (
					<path
						key={k}
						d={wobPath(
							[
								[shL[0] + 4, neck[1] + (hip[1] - neck[1]) * t],
								[shR[0] - 4, neck[1] + (hip[1] - neck[1]) * t],
							],
							sd + 25 + k,
							1.5,
						)}
						stroke="rgba(255,255,255,0.55)"
						strokeWidth={5}
						fill="none"
					/>
				))}
			{outfit === 'uniform' && <circle cx={shR[0] - 14} cy={shR[1] + 24} r={7} fill={C.yellow} stroke={ink} strokeWidth={3} />}
			{outfit === 'hoodie' && (
				<path d={wobPath([addP(neck, [-14, 18]), addP(neck, [-10, 46]), addP(neck, [10, 46]), addP(neck, [14, 18])], sd + 27, 1.5)} stroke={ink} strokeWidth={4} fill="none" />
			)}
			{!upperOnly && (legsFront ?? pose.hipY > 40) && [legL, legR].map(drawLeg)}
			{outfit === 'vest' && (
				<path d={wobPath([addP(neck, [-10, 4]), addP(neck, [0, 40]), addP(neck, [10, 4])], sd + 28, 1.5)} stroke={ink} strokeWidth={4} fill="none" />
			)}
		</g>
	);

	// ---------------------------------------------------------------- head ---
	const fx = headTurn * 14;
	const eyeY = -4;
	const lx = look[0] * 4.5;
	const ly = look[1] * 4.5;
	const R = HEAD_R;

	const hairBack = hair === 'long' ? (
		<path
			d={wobPoly(
				[
					[-R - 8, -10],
					[-R - 12, 70],
					[-R + 10, 90],
					[R - 10, 90],
					[R + 12, 70],
					[R + 8, -10],
				],
				sd + 100,
				3,
			)}
			fill={hairColor}
			stroke={ink}
			strokeWidth={5}
		/>
	) : null;

	const hairFront = (() => {
		const arc = (from: number, to: number, r: number, n: number): Pt[] => {
			const out: Pt[] = [];
			for (let i = 0; i <= n; i++) {
				const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
				out.push([Math.cos(a) * r, Math.sin(a) * r]);
			}
			return out;
		};
		switch (hair) {
			case 'short':
			case 'messy':
			case 'bedhead': {
				const spikes = hair === 'short' ? 4 : 7;
				const top = arc(195, 345, R + 5, 10);
				const fringe: Pt[] = [];
				for (let i = 0; i <= spikes * 2; i++) {
					const t = i / (spikes * 2);
					const xx = R * 0.92 - t * R * 1.84;
					const yy = -R * (i % 2 === 0 ? 0.36 : 0.58) + (hair === 'short' ? 0 : -6);
					fringe.push([xx, yy]);
				}
				const extra: Pt[] = hair === 'messy' || hair === 'bedhead' ? [[-R * 0.2, -R - 22], [0, -R - 6], [R * 0.3, -R - 24]] : [];
				return <path d={wobPoly([...top.slice(0, 5), ...extra, ...top.slice(5), ...fringe], sd + 110, 2)} fill={hairColor} stroke={ink} strokeWidth={5} strokeLinejoin="round" />;
			}
			case 'slick': {
				const top = arc(200, 340, R + 2, 10);
				return (
					<>
						<path d={wobPoly([...top, [R * 0.85, -R * 0.38], [-R * 0.1, -R * 0.62], [-R * 0.9, -R * 0.42]], sd + 111, 1.5)} fill={hairColor} stroke={ink} strokeWidth={4} />
						<path d={wobPath([[-R * 0.25, -R * 1.0], [-R * 0.2, -R * 0.62]], sd + 112, 1)} stroke={C.ink} strokeWidth={2.5} fill="none" opacity={0.6} />
					</>
				);
			}
			case 'curly': {
				const bumps: React.ReactNode[] = [];
				for (let i = 0; i < 9; i++) {
					const a = ((200 + i * 17.5) * Math.PI) / 180;
					bumps.push(<path key={i} d={wobEllipse(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2), 17, 17, sd + 120 + i, 1.5, 9)} fill={hairColor} stroke={ink} strokeWidth={4} />);
				}
				return <g>{bumps}</g>;
			}
			case 'long': {
				const top = arc(190, 350, R + 6, 10);
				return <path d={wobPoly([...top, [R * 0.6, -R * 0.45], [0, -R * 0.62], [-R * 0.6, -R * 0.45]], sd + 113, 2)} fill={hairColor} stroke={ink} strokeWidth={5} />;
			}
			case 'sideTufts':
				return (
					<>
						<path d={wobEllipse(-R + 2, -6, 10, 18, sd + 114, 2, 9)} fill={hairColor} stroke={ink} strokeWidth={4} />
						<path d={wobEllipse(R - 2, -6, 10, 18, sd + 115, 2, 9)} fill={hairColor} stroke={ink} strokeWidth={4} />
					</>
				);
			case 'cap':
				return (
					<>
						<path d={wobPoly([...arc(185, 355, R + 6, 10), [R + 34, -R * 0.12], [R + 34, -R * 0.02], [-R - 4, -R * 0.08]], sd + 116, 2)} fill={hairColor} stroke={ink} strokeWidth={5} />
					</>
				);
			case 'police':
				return (
					<>
						<path d={wobPoly([[-R - 8, -R * 0.35], [-R - 2, -R - 18], [R + 2, -R - 18], [R + 8, -R * 0.35]], sd + 117, 2)} fill={C.navy} stroke={ink} strokeWidth={5} />
						<path d={wobPoly([[-R - 14, -R * 0.38], [R + 14, -R * 0.38], [R + 4, -R * 0.2], [-R - 4, -R * 0.2]], sd + 118, 1.5)} fill={C.ink} stroke={ink} strokeWidth={3} />
						<circle cx={0} cy={-R * 0.85} r={7} fill={C.yellow} stroke={ink} strokeWidth={3} />
					</>
				);
			default:
				return null;
		}
	})();

	const eyeL: Pt = [-16 + fx, eyeY];
	const eyeR: Pt = [16 + fx, eyeY];

	const eyes = (() => {
		if (blink || expression === 'sleep') {
			return [eyeL, eyeR].map((e, i) => (
				<path key={i} d={wobPath([[e[0] - 8, e[1] + (expression === 'sleep' ? 0 : 1)], [e[0] + 8, e[1] + 1]], sd + 130 + i, 1)} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
			));
		}
		const big = expression === 'scared' || expression === 'terrified' || expression === 'scream';
		if (big) {
			const r = expression === 'scared' ? 11 : 14;
			const pr = expression === 'scared' ? 4.5 : 3.2;
			return [eyeL, eyeR].map((e, i) => (
				<g key={i}>
					<path d={wobEllipse(e[0], e[1], r, r * 1.08, sd + 132 + i, 1, 10)} fill="#ffffff" stroke={ink} strokeWidth={3.5} />
					<circle cx={e[0] + lx * 1.4} cy={e[1] + ly * 1.4} r={pr} fill={C.ink} />
				</g>
			));
		}
		const r = expression === 'creepy' ? 4 : 5.8;
		return [eyeL, eyeR].map((e, i) => <circle key={i} cx={e[0] + lx} cy={e[1] + ly} r={r} fill={C.ink} />);
	})();

	const brows = (() => {
		const b = (e: Pt, side: number, inner: number, outer: number, i: number) => (
			<path
				key={i}
				d={wobPath(
					[
						[e[0] - 10 * side, e[1] - outer],
						[e[0] + 8 * side, e[1] - inner],
					],
					sd + 140 + i,
					1,
				)}
				stroke={ink}
				strokeWidth={4}
				fill="none"
				strokeLinecap="round"
			/>
		);
		switch (expression) {
			case 'worried':
			case 'sad':
			case 'nervous':
				return [b(eyeL, 1, 22, 15, 0), b(eyeR, -1, 22, 15, 1)];
			case 'scared':
				return [b(eyeL, 1, 26, 20, 0), b(eyeR, -1, 26, 20, 1)];
			case 'terrified':
			case 'scream':
				return [b(eyeL, 1, 31, 25, 0), b(eyeR, -1, 31, 25, 1)];
			case 'confused':
				return [b(eyeL, 1, 14, 14, 0), b(eyeR, -1, 22, 28, 1)];
			case 'determined':
				return [b(eyeL, 1, 10, 18, 0), b(eyeR, -1, 10, 18, 1)];
			default:
				return null;
		}
	})();

	const mouth = (() => {
		const mx = fx;
		const my = 21;
		switch (expression) {
			case 'scared':
				return <path d={wobEllipse(mx, my + 2, 5, 7, sd + 150, 0.8, 8)} fill={C.ink} />;
			case 'terrified':
				return <path d={wobEllipse(mx, my + 4, 8, 12, sd + 150, 1, 9)} fill={C.ink} />;
			case 'scream':
				return (
					<g>
						<path d={wobEllipse(mx, my + 6, 13, 19, sd + 150, 1.2, 10)} fill={C.ink} />
						<path d={wobEllipse(mx, my + 17, 7, 5, sd + 151, 0.8, 8)} fill={C.red} />
					</g>
				);
			case 'smile':
				return <path d={wobCurve([[mx - 12, my - 2], [mx, my + 8], [mx + 12, my - 2]], sd + 152, 0.8)} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
			case 'nervous':
				return <path d={wobCurve([[mx - 13, my], [mx - 6, my + 5], [mx, my], [mx + 6, my + 5], [mx + 13, my - 1]], sd + 153, 0.6)} stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
			case 'worried':
			case 'sad':
				return <path d={wobCurve([[mx - 10, my + 5], [mx, my], [mx + 10, my + 5]], sd + 154, 0.6)} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
			case 'confused':
				return <path d={wobCurve([[mx - 10, my + 3], [mx - 2, my - 1], [mx + 4, my + 4], [mx + 11, my - 2]], sd + 155, 0.6)} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
			case 'creepy':
				return (
					<g>
						<path d={wobCurve([[mx - 27, my - 8], [mx, my + 9], [mx + 27, my - 8]], sd + 156, 0.5)} stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
						{[-16, -8, 0, 8, 16].map((t, i) => (
							<line key={i} x1={mx + t} y1={my + (Math.abs(t) > 10 ? -2 : 3)} x2={mx + t} y2={my + (Math.abs(t) > 10 ? 3 : 9)} stroke={ink} strokeWidth={2} />
						))}
					</g>
				);
			case 'shush':
				return <path d={wobEllipse(mx, my, 4, 4, sd + 157, 0.5, 8)} fill={C.ink} />;
			case 'sleep':
				return <path d={wobEllipse(mx, my, 4, 3, sd + 158, 0.5, 8)} fill="none" stroke={ink} strokeWidth={3} />;
			default:
				return <path d={wobPath([[mx - 8, my], [mx + 8, my + 1]], sd + 159, 0.8)} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
		}
	})();

	const extras = (
		<>
			{glasses && (
				<g stroke={ink} strokeWidth={3.5} fill="rgba(255,255,255,0.15)">
					<path d={wobEllipse(eyeL[0], eyeL[1], 13, 11, sd + 160, 0.8, 10)} />
					<path d={wobEllipse(eyeR[0], eyeR[1], 13, 11, sd + 161, 0.8, 10)} />
					<line x1={eyeL[0] + 13} y1={eyeY} x2={eyeR[0] - 13} y2={eyeY} />
				</g>
			)}
			{mustache && <path d={wobPoly([[fx - 16, 14], [fx, 10], [fx + 16, 14], [fx + 12, 19], [fx, 15], [fx - 12, 19]], sd + 162, 1)} fill={hairColor} stroke={ink} strokeWidth={3} />}
			{beard && (
				<path
					d={wobPoly([[-R * 0.8, 6], [-R * 0.5, 36], [0, R + 14], [R * 0.5, 36], [R * 0.8, 6], [R * 0.4, 30], [0, 36], [-R * 0.4, 30]], sd + 163, 2)}
					fill={hairColor}
					stroke={ink}
					strokeWidth={4}
				/>
			)}
			{sweat && (
				<path
					d={`M ${R * 0.78} ${-R * 0.5} q 9 14 0 20 q -9 -6 0 -20 z`}
					fill="#7cc4ff"
					stroke={ink}
					strokeWidth={2.5}
					transform={`translate(0 ${(frame % 30) * 0.4})`}
				/>
			)}
		</>
	);

	const head = (
		<g transform={`translate(${headC[0]} ${headC[1]}) rotate(${pose.lean + pose.headTilt})`}>
			{hairBack}
			<path d={wobEllipse(0, 0, R, R * 1.02, sd + 170, 2.2, 18)} fill={faceSkin} stroke={ink} strokeWidth={5.5} />
			{hairFront}
			{eyes}
			{brows}
			{mouth}
			{extras}
		</g>
	);

	return (
		<g
			transform={`translate(${(x + tx).toFixed(1)} ${(y + ty).toFixed(1)}) scale(${scale * facing} ${scale}) rotate(${rotate}, ${hip[0]}, ${hip[1]})`}
			opacity={opacity}
		>
			{body}
			{head}
			{[armL, armR].map(drawArm)}
		</g>
	);
};
