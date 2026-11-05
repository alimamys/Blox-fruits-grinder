// The one stick figure every character is built from. Intentionally crude:
// round head, dot eyes, block body, thick uneven black outlines, flat colours.
// Coordinates are relative to the figure's feet (0,0); a standing adult is ~300 px.
import React from 'react';
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
export type Eyes = 'dot' | 'wide' | 'closed' | 'squint' | 'gray' | 'none';
export type Brows = 'none' | 'flat' | 'worried' | 'angry' | 'raised' | 'sad';
export type Mouth = 'smile' | 'faint' | 'grin' | 'flat' | 'frown' | 'o' | 'scream' | 'wobbly' | 'open' | 'shout' | 'laugh';
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
	arms?: ArmPreset | {l: [number, number]; r: [number, number]};
	eyes?: Eyes;
	brows?: Brows;
	mouth?: Mouth;
	/** 0..1 mouth opening for talking */
	talk?: number;
	/** eye direction -1..1 */
	look?: [number, number];
	/** head tilt in degrees */
	tilt?: number;
	/** -1..1 head turn (features slide sideways) */
	turn?: number;
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
	/** frame for line boil; pass null for a figure whose lines never move */
	frame: number | null;
	seed?: number;
	/** walking phase (radians) */
	phase?: number;
	shiver?: number;
	opacity?: number;
	/** age lines etc */
	wrinkles?: boolean;
	/** stroke width multiplier */
	line?: number;
	female?: boolean;
	child?: boolean;
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

const ARM_PRESETS: Record<ArmPreset, {l: [number, number]; r: [number, number]}> = {
	down: {l: [10, 0], r: [10, 0]},
	relaxed: {l: [16, -12], r: [16, -12]},
	wave: {l: [10, 0], r: [150, 25]},
	tinyWave: {l: [12, -70], r: [40, 95]},
	point: {l: [10, 0], r: [92, 0]},
	pointLeft: {l: [92, 0], r: [10, 0]},
	armsUp: {l: [168, 6], r: [168, 6]},
	oneArmUp: {l: [10, 0], r: [168, 4]},
	hold: {l: [22, -105], r: [22, -105]},
	holdOne: {l: [10, 0], r: [22, -105]},
	folded: {l: [10, -80], r: [10, -80]},
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

const rad = (d: number) => (d * Math.PI) / 180;

export const StickPerson: React.FC<StickProps> = (p) => {
	const {
		x = 0,
		y = 0,
		s = 1,
		flip = false,
		pose = 'stand',
		eyes = 'dot',
		brows = 'none',
		mouth = 'flat',
		talk = 0,
		look = [0, 0],
		tilt = 0,
		turn = 0,
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
	const boil = frame === null ? 0 : boilOf(frame);
	const sd = seed * 31 + boil * 7;
	const amp = frame === null ? 0.6 : 1.6;
	const lw = 5.5 * line;
	const skin = p.pale ? mixHex(palette.skin, '#dfe6dc', p.pale) : palette.skin;

	const sitting = pose === 'sit';
	const k = p.child ? 0.62 : 1;
	const headR = 36 * (p.child ? 1.08 : 1);
	const headY = (sitting ? -232 : -262) * k;
	const shY = (sitting ? -190 : -219) * k;
	const hipY = (sitting ? -95 : -120) * k;
	const shW = (female ? 29 : 33) * k;
	const hipW = (female ? 27 : 27) * k;

	const shx = shiver ? Math.sin((frame ?? 0) * 2.3) * shiver : 0;

	// ---- arms
	const armSpec = typeof p.arms === 'string' || p.arms === undefined ? ARM_PRESETS[(p.arms as ArmPreset) ?? 'relaxed'] : p.arms;
	let {l: la, r: ra} = armSpec;
	const t = (frame ?? 0) / 30;
	if (p.arms === 'wave') ra = [150, 25 + Math.sin(t * 9) * 28];
	if (pose === 'walk' || pose === 'run') {
		const sw = (pose === 'run' ? 38 : 20) * Math.sin(phase);
		if (p.arms === undefined || p.arms === 'relaxed' || p.arms === 'down') {
			la = [14 + sw, -10 - Math.max(0, sw)];
			ra = [14 - sw, -10 - Math.max(0, -sw)];
		}
	}
	const U = 54 * k;
	const F = 50 * k;
	const armPts = (side: -1 | 1, a: [number, number]): Pt[] => {
		const sx = side * (shW - 3);
		const sy = shY + 6;
		const a1 = rad(a[0]);
		const a2 = rad(a[0] + a[1]);
		const ex = sx + side * Math.sin(a1) * U;
		const ey = sy + Math.cos(a1) * U;
		const hx = ex + side * Math.sin(a2) * F;
		const hy = ey + Math.cos(a2) * F;
		return [
			[sx, sy],
			[ex, ey],
			[hx, hy],
		];
	};
	const L = armPts(-1, la);
	const R = armPts(1, ra);

	// ---- legs
	const legs: Pt[][] = [];
	if (sitting) {
		for (const side of [-1, 1]) {
			legs.push([
				[side * 13 * k, hipY],
				[side * 25 * k, -58 * k],
				[side * 25 * k, 0],
			]);
		}
	} else {
		const sw = pose === 'walk' ? 24 : pose === 'run' ? 40 : 0;
		for (const side of [-1, 1]) {
			const ang = rad(sw * Math.sin(phase + (side === 1 ? Math.PI : 0)));
			const hx = side * 13 * k;
			const len = -hipY;
			const kx = hx + Math.sin(ang) * len * 0.5 + side * 3;
			const ky = hipY + Math.cos(ang) * len * 0.5;
			const fx = hx + Math.sin(ang) * len + side * 8;
			const fy = hipY + Math.cos(ang) * len - (pose !== 'stand' ? Math.max(0, Math.sin(phase + (side === 1 ? Math.PI : 0))) * 10 : 0);
			legs.push([
				[hx, hipY],
				[kx, ky],
				[fx, fy],
			]);
		}
	}

	// ---- body
	const coat = Boolean(p.longCoat);
	const bodyPts: Pt[] = coat
		? [
				[-shW - 2, shY],
				[shW + 2, shY],
				[shW + 14, (sitting ? -40 : -22) * k],
				[-shW - 14, (sitting ? -40 : -22) * k],
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
		for (const side of [-1, 1]) {
			const ex = hx0 + side * eyeDX + faceDX + (Math.abs(turn) > 0.6 && Math.sign(turn) !== side ? -turn * 4 : 0);
			if (Math.abs(turn) > 0.85 && Math.sign(turn) === -side) continue;
			if (eyes === 'wide') {
				eyesEl.push(<path key={`ew${side}`} d={wobCircle(ex, eyeY, 9.5, sd + side, 0.8, 8)} fill="#fff" stroke={INK} strokeWidth={3} />);
				eyesEl.push(<circle key={`ep${side}`} cx={ex + lx} cy={eyeY + ly} r={4} fill={INK} />);
			} else if (eyes === 'closed') {
				eyesEl.push(<path key={`ec${side}`} d={`M${ex - 7},${eyeY} Q${ex},${eyeY + 6} ${ex + 7},${eyeY}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
			} else if (eyes === 'squint') {
				eyesEl.push(<path key={`es${side}`} d={wobLine(ex - 6, eyeY, ex + 6, eyeY, sd + side, 0.6, 1)} stroke={INK} strokeWidth={4} strokeLinecap="round" />);
			} else {
				eyesEl.push(<circle key={`ed${side}`} cx={ex + lx} cy={eyeY + ly} r={eyes === 'gray' ? 5 : 5.2} fill={eyeFill} />);
			}
		}
	}
	const browsEl: React.ReactNode[] = [];
	if (!back && brows !== 'none') {
		for (const side of [-1, 1]) {
			const bx = hx0 + side * eyeDX + faceDX;
			const by = eyeY - 13 - (brows === 'raised' ? 6 : 0);
			const inner = brows === 'worried' || brows === 'sad' ? -5 : brows === 'angry' ? 5 : 0;
			const outer = brows === 'sad' ? 3 : 0;
			browsEl.push(
				<path
					key={`b${side}`}
					d={wobLine(bx - side * 8, by + inner, bx + side * 8, by + outer, sd + side * 3, 0.7, 1)}
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
		switch (open > 0.15 && (mouth === 'flat' || mouth === 'smile' || mouth === 'frown' || mouth === 'faint') ? 'open' : mouth) {
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
				mouthEl = mk(wobEllipse(mx, my + 2, 6, 8, sd + 5, 0.6, 8), '#3a1414', 3.5);
				break;
			case 'scream':
			case 'shout':
				mouthEl = mk(wobEllipse(mx, my + 4, 11, mouth === 'scream' ? 15 : 10, sd + 6, 1, 10), '#2a0d0d', 4);
				break;
			case 'wobbly':
				mouthEl = mk(`M${mx - 12},${my + 2} L${mx - 6},${my - 2} L${mx},${my + 2} L${mx + 6},${my - 2} L${mx + 12},${my + 2}`);
				break;
			case 'open':
				mouthEl = mk(wobEllipse(mx, my + 1, 8, 2 + open * 7, sd + 7, 0.5, 8), '#3a1414', 3.5);
				break;
			default:
				mouthEl = mk(wobLine(mx - 10, my, mx + 10, my, sd + 8, 0.6, 1));
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
		hairFront.push(<path key="hb" d={wobCircle(cx, cy - 2, hr + 1, sd + 40, 1.2)} fill={hc} stroke={INK} strokeWidth={lw} />);
		if (hair === 'bun') hairFront.push(<path key="bunb" d={wobCircle(cx, cy - hr * 0.78, hr * 0.36, sd + 41, 0.6)} fill={mixHex(hc, '#000000', 0.1)} stroke={INK} strokeWidth={lw * 0.7} />);
		if (hair === 'medium' || hair === 'long') hairFront.push(<path key="hbm" d={wobPoly([[cx - hr - 2, cy], [cx + hr + 2, cy], [cx + hr + 6, cy + hr * 1.35], [cx - hr - 6, cy + hr * 1.35]], sd + 42, 1.5)} fill={hc} stroke={INK} strokeWidth={lw} />);
		if (hair === 'ponytail') hairFront.push(<path key="hbp" d={wobEllipse(cx + 4, cy + hr * 0.9, 10, 24, sd + 43, 1)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />);
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
							1.4,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'grayShort':
				hairFront.push(
					<path key="hg" d={wob([[cx - hr - 3, cy + 4], [cx - hr, cy - hr * 0.6], [cx - hr * 0.6, cy - hr * 0.55], [cx - hr * 0.7, cy - 2]], sd + 51, 1.2)} fill={hc} stroke={INK} strokeWidth={lw * 0.7} />,
					<path key="hg2" d={wob([[cx + hr + 3, cy + 4], [cx + hr, cy - hr * 0.6], [cx + hr * 0.6, cy - hr * 0.55], [cx + hr * 0.7, cy - 2]], sd + 52, 1.2)} fill={hc} stroke={INK} strokeWidth={lw * 0.7} />,
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
							1.6,
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
							1.4,
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
					<path key="hbun" d={wobCircle(cx + 2, cy - hr - 10, hr * 0.42, sd + 55, 0.5)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />,
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
							0.8,
						)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'ponytail':
				hairBack.push(<path key="hpt" d={wobEllipse(cx + hr + 6, cy + 8, 11, 26, sd + 57, 1)} fill={hc} stroke={INK} strokeWidth={lw * 0.8} />);
				hairFront.push(
					<path
						key="hpf"
						d={wob([[cx - hr - 2, cy - 2], [cx - hr * 0.8, cy - hr * 0.8], [cx, cy - hr - 5], [cx + hr * 0.85, cy - hr * 0.75], [cx + hr + 2, cy - 4], [cx + hr * 0.5, cy - hr * 0.6], [cx - hr * 0.5, cy - hr * 0.55]], sd + 58, 1.2)}
						fill={hc}
						stroke={INK}
						strokeWidth={lw * 0.8}
					/>,
				);
				break;
			case 'curly':
				for (let i = 0; i < 7; i++) {
					const a = Math.PI + (i / 6) * Math.PI;
					hairFront.push(<path key={`hc${i}`} d={wobCircle(cx + Math.cos(a) * hr * 0.95, cy + Math.sin(a) * hr * 0.9, 11, sd + 60 + i, 1)} fill={hc} stroke={INK} strokeWidth={lw * 0.6} />);
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
			<path key="hat1" d={wobPoly([[cx - hr - 6, cy - hr * 0.55], [cx + hr + 6, cy - hr * 0.55], [cx + hr + 12, cy - hr - 18], [cx - hr - 12, cy - hr - 18]], sd + 70, 1.2)} fill={top} stroke={INK} strokeWidth={lw} />,
			<path key="hat2" d={wobPoly([[cx - hr - 4, cy - hr * 0.6], [cx + hr + 4, cy - hr * 0.6], [cx + hr + 2, cy - hr * 0.3], [cx - hr - 2, cy - hr * 0.3]], sd + 71, 1)} fill={hat === 'captain' ? '#111' : '#0c0f18'} stroke={INK} strokeWidth={lw * 0.7} />,
		);
		if (hat === 'captain') hatEl.push(<path key="hat3" d={wobCircle(cx, cy - hr * 0.95, 7, sd + 72, 0.6, 6)} fill="#d8b23a" stroke={INK} strokeWidth={2.5} />);
		if (hat === 'police') hatEl.push(<rect key="hat4" x={cx - hr - 8} y={cy - hr * 0.85} width={hr * 2 + 16} height={7} fill="#e8e8e8" opacity={0.85} />);
	}
	if (hat === 'beanie') {
		hatEl.push(<path key="bn" d={wob([[cx - hr - 3, cy - hr * 0.35], [cx - hr, cy - hr * 0.9], [cx, cy - hr - 12], [cx + hr, cy - hr * 0.9], [cx + hr + 3, cy - hr * 0.35]], sd + 73, 1.2)} fill="#6b2d2d" stroke={INK} strokeWidth={lw * 0.8} />);
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
				{p.propGlow ? <ellipse cx={at[0]} cy={at[1] - 40} rx={70} ry={80} fill={p.propGlow} opacity={0.18} /> : null}
				<path d={wobPoly([[at[0] - w / 2, at[1] - hh], [at[0] + w / 2, at[1] - hh], [at[0] + w / 2, at[1]], [at[0] - w / 2, at[1]]], sd + 80, 0.8)} fill="#1d1d22" stroke={INK} strokeWidth={3.5} />
				<rect x={at[0] - w / 2 + 4} y={at[1] - hh + 4} width={w - 8} height={hh - 8} fill={p.propGlow ?? '#5b7fb3'} opacity={0.9} />
			</g>,
		);
	}
	if (prop === 'clicker') propEl.push(<path key="cl" d={wobRect(at[0] - 8, at[1] - 16, 16, 20, sd + 81, 0.8)} fill="#b9bcc2" stroke={INK} strokeWidth={3} />);
	if (prop === 'card') propEl.push(<path key="cd" d={wobRect(at[0] - 18, at[1] - 26, 36, 24, sd + 82, 0.8)} fill="#e9e4d4" stroke={INK} strokeWidth={3} />);
	if (prop === 'handset') propEl.push(<path key="hs" d={wobRect(at[0] - 9, at[1] - 30, 18, 34, sd + 83, 0.8)} fill="#222" stroke={INK} strokeWidth={3} />);
	if (prop === 'notebook') propEl.push(<path key="nb" d={wobRect(at[0] - 16, at[1] - 30, 32, 38, sd + 84, 0.8)} fill="#f2efe6" stroke={INK} strokeWidth={3} />);
	if (p.arms === 'fingerLips' && !back) propEl.push(<path key="fl" d={`M${hand[0]},${hand[1] - 6} L${hand[0] - 1},${hand[1] - 30}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />, <path key="fl2" d={`M${hand[0]},${hand[1] - 6} L${hand[0] - 1},${hand[1] - 30}`} stroke={skin} strokeWidth={4} strokeLinecap="round" />);
	if (prop === 'ring') propEl.push(<circle key="rg" cx={at[0]} cy={at[1] - 10} r={7} fill="none" stroke="#d4af37" strokeWidth={4} />);
	if (prop === 'flashlight') {
		propEl.push(
			<g key="fl">
				<path d={`M${at[0]},${at[1] - 6} L${at[0] + 520},${at[1] - 120} L${at[0] + 520},${at[1] + 110} Z`} fill="#fff6c8" opacity={0.12} />
				<path d={wobRect(at[0] - 10, at[1] - 12, 26, 13, sd + 85, 0.6)} fill="#333" stroke={INK} strokeWidth={3} />
			</g>,
		);
	}

	const armPath = (pts: Pt[], sdo: number) => wob(pts, sd + sdo, amp * 0.6, false);
	const lum = parseInt(palette.shirt.slice(1, 3), 16) + parseInt(palette.shirt.slice(3, 5), 16) + parseInt(palette.shirt.slice(5, 7), 16);
	const sleeve = lum < 90 ? mixHex(palette.shirt, '#5a5f68', 0.35) : palette.shirt;
	const armsEl = [L, R].map((arm, i) => (
		<g key={`arm${i}`}>
			<path d={armPath(arm, 30 + i)} stroke={INK} strokeWidth={17 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={armPath(arm, 30 + i)} stroke={sleeve} strokeWidth={9 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={wobCircle(arm[2][0], arm[2][1], 9 * k, sd + 35 + i, 0.8, 7)} fill={skin} stroke={INK} strokeWidth={3.5} />
		</g>
	));

	return (
		<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={opacity}>
			{/* shadow */}
			{!sitting ? <ellipse cx={0} cy={2} rx={46 * k} ry={9 * k} fill="#000" opacity={0.22} /> : null}
			{hairBack}
			{/* legs */}
			{!coat || sitting
				? legs.map((lg, i) => (
						<g key={`leg${i}`}>
							<path d={wob(lg, sd + 20 + i, amp * 0.6, false)} stroke={INK} strokeWidth={26 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							<path d={wob(lg, sd + 20 + i, amp * 0.6, false)} stroke={palette.pants} strokeWidth={16 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					))
				: null}
			{/* shoes */}
			{legs.map((lg, i) => (
				<path key={`sh${i}`} d={wobEllipse(lg[2][0] + (i === 0 ? -5 : 5), lg[2][1] - 2, 16 * k, 8 * k, sd + 25 + i, 1, 8)} fill={palette.shoes} stroke={INK} strokeWidth={3} />
			))}
			{back ? armsEl : null}
			{/* body */}
			<path d={wobPoly(bodyPts, sd + 10, amp)} fill={palette.shirt} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
			{coat ? <path d={wobLine(0, shY + 18, 0, (sitting ? -44 : -26) * k, sd + 11, 1, 3)} stroke="#000" strokeWidth={2.5} opacity={0.6} /> : null}
			{p.stripe && !back ? <path d={wobLine(-shW + 3, shY + 34, shW - 3, shY + 34, sd + 12, 1, 2)} stroke={p.stripe} strokeWidth={9} /> : null}
			{p.vest && !back ? (
				<g>
					<path d={wobPoly([[-shW + 6, shY + 4], [shW - 6, shY + 4], [hipW - 2, hipY], [-hipW + 2, hipY]], sd + 13, 1)} fill={p.vest} stroke={INK} strokeWidth={3} />
					<path d={wobLine(-hipW + 4, hipY - 26, hipW - 4, hipY - 26, sd + 14, 0.8, 2)} stroke="#e9eef2" strokeWidth={5} opacity={0.9} />
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
			{/* arms */}
			{!back ? armsEl : null}
			{/* head */}
			<g transform={headTransform}>
				<path d={wobCircle(cx, cy, hr, sd + 1, amp * 0.9, 11)} fill={back ? palette.hair : skin} stroke={INK} strokeWidth={lw} />
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
					<path d={wob([[mx - 18, my - 2], [mx - 8, my - 9], [mx, my - 6], [mx + 8, my - 9], [mx + 18, my - 2], [mx, my - 3]], sd + 90, 0.8)} fill={p.mustache} stroke={INK} strokeWidth={2.5} />
				) : null}
				{mouthEl}
				{hairFront}
				{hatEl}
				{!back && p.sweat ? <path d={`M${cx + hr * 0.75},${cy - hr * 0.5} q6,10 0,14 q-6,-4 0,-14`} fill="#8fc3ff" stroke={INK} strokeWidth={2} /> : null}
				{!back && p.tears
					? [-1, 1].map((side) => {
							const ty = eyeY + 8 + ((((frame ?? 0) * 1.4 + (side > 0 ? 9 : 0)) % 26) * (p.tears ?? 0));
							return <path key={`t${side}`} d={`M${cx + side * eyeDX + faceDX},${ty} q4,7 0,10 q-4,-3 0,-10`} fill="#7fb6ff" stroke="#2b4d7a" strokeWidth={1.5} opacity={Math.min(1, p.tears ?? 0)} />;
						})
					: null}
			</g>
			{propEl}
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
