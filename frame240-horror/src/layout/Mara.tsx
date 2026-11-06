// LAYOUT GUIDE figures (not final art). The image model takes only composition, pose and
// position from these; Mara's look comes from her character sheet. They are drawn with
// natural proportions (8 heads tall) so the model reads them as a person, not a cartoon.
//
// Mara: 32, slim, light olive skin, dark-brown hair in a messy low bun with a YELLOW
// PENCIL stuck through it, oversized BURNT-ORANGE sweatshirt (sleeves pushed up),
// charcoal sweatpants, grey wool socks.
import React from 'react';

export const MARA = {
	skin: '#d6a47e',
	skinShade: '#a8775a',
	hair: '#3b2519',
	sweat: '#c4571e',
	sweatShade: '#8f3d14',
	pants: '#3b3e44',
	socks: '#8b8d90',
	pencil: '#f2c230',
	eye: '#2a1a12',
};

export type Expr = 'neutral' | 'tired' | 'uneasy' | 'afraid' | 'terrified' | 'scream' | 'cry' | 'relief' | 'focused' | 'whisper' | 'shock';

export interface Pose {
	/** pelvis position and scale (s=1: about 880 px tall standing) */
	x: number;
	y: number;
	s?: number;
	/** torso lean in degrees (+ = towards screen right) */
	lean?: number;
	/** head tilt in degrees */
	tilt?: number;
	/** -1 facing screen left (profile) .. 0 facing camera .. 1 facing screen right */
	yaw?: number;
	/** seen from behind */
	back?: boolean;
	/** arm angles: 0 = hanging down, 90 = pointing right, -90 = pointing left, 180 = up */
	armL?: [number, number];
	armR?: [number, number];
	/** leg angles: [thigh, knee bend] */
	legL?: [number, number];
	legR?: [number, number];
	/** foreshortening of the thighs (sitting facing camera ~0.45) */
	thighK?: number;
	expr?: Expr;
	/** 0..1 mouth open */
	mouth?: number;
	/** eye direction -1..1 */
	gaze?: [number, number];
	eyesClosed?: boolean;
	/** coloured key light on the face/front (e.g. monitor blue, flashlight white) */
	light?: string;
	/** the phone in a hand: its screen glows */
	phoneIn?: 'L' | 'R' | null;
	stylusIn?: 'L' | 'R' | null;
	keysIn?: 'L' | 'R' | null;
}

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: [number, number], a: number, len: number): [number, number] => {
	const [dx, dy] = dir(a);
	return [p[0] + dx * len, p[1] + dy * len];
};

const Limb: React.FC<{a: [number, number]; b: [number, number]; w: number; color: string; stroke?: string}> = ({a, b, w, color, stroke = 'rgba(0,0,0,0.55)'}) => (
	<g>
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={w + 4} strokeLinecap="round" />
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
	</g>
);

/** A simple five-fingered hand at p, pointing along angle a (deg). */
export const HandShape: React.FC<{p: [number, number]; a: number; s: number; grip?: boolean; color?: string}> = ({p, a, s, grip = false, color = MARA.skin}) => {
	const fingers = [-26, -10, 4, 17];
	return (
		<g transform={`translate(${p[0]} ${p[1]}) rotate(${-a})`}>
			<ellipse cx={0} cy={18 * s} rx={15 * s} ry={20 * s} fill={color} stroke="rgba(0,0,0,0.55)" strokeWidth={2} />
			{fingers.map((fa, i) => {
				const len = (grip ? 16 : [30, 34, 32, 26][i]) * s;
				const base: [number, number] = [(-11 + i * 7.3) * s, 32 * s];
				const tip = add(base, fa * 0.3, len);
				return <Limb key={i} a={base} b={tip} w={6.5 * s} color={color} stroke="rgba(0,0,0,0.5)" />;
			})}
			{/* thumb */}
			<Limb a={[13 * s, 14 * s]} b={add([13 * s, 14 * s], grip ? 40 : 55, 24 * s)} w={7 * s} color={color} stroke="rgba(0,0,0,0.5)" />
		</g>
	);
};

const Phone: React.FC<{p: [number, number]; s: number; a: number}> = ({p, s, a}) => (
	<g transform={`translate(${p[0]} ${p[1]}) rotate(${-a})`}>
		<rect x={-20 * s} y={10 * s} width={40 * s} height={78 * s} rx={7 * s} fill="#15161a" stroke="#000" strokeWidth={2} />
		<rect x={-16 * s} y={15 * s} width={32 * s} height={68 * s} rx={4 * s} fill="#cfe3ff" opacity={0.9} />
	</g>
);

const Stylus: React.FC<{p: [number, number]; s: number; a: number}> = ({p, s, a}) => (
	<g transform={`translate(${p[0]} ${p[1]}) rotate(${-a})`}>
		<line x1={0} y1={-10 * s} x2={0} y2={95 * s} stroke="#111" strokeWidth={7 * s} strokeLinecap="round" />
	</g>
);

/** Mara's head (used by the full figure and by close-ups). Centre (cx, cy), head height 2*r*1.2. */
export const MaraHead: React.FC<{
	cx: number;
	cy: number;
	r: number;
	yaw?: number;
	back?: boolean;
	tilt?: number;
	expr?: Expr;
	mouth?: number;
	gaze?: [number, number];
	eyesClosed?: boolean;
	light?: string;
}> = ({cx, cy, r, yaw = 0, back = false, tilt = 0, expr = 'neutral', mouth = 0, gaze = [0, 0], eyesClosed = false, light}) => {
	const fx = yaw * r * 0.55; // face centre shift for turned heads
	const prof = Math.abs(yaw) > 0.85;
	const eyeW = r * 0.24 * (1 - Math.abs(yaw) * 0.35);
	const wide = {terrified: 1.5, scream: 1.45, shock: 1.55, afraid: 1.3, uneasy: 1.1, cry: 0.9, tired: 0.75, relief: 0.8, focused: 0.95, neutral: 1, whisper: 1.15}[expr];
	const eyeH = r * 0.12 * wide;
	const browLift = {terrified: -0.12, scream: -0.1, shock: -0.14, afraid: -0.08, uneasy: -0.04, cry: -0.06, tired: 0.02, relief: 0, focused: 0.03, neutral: 0, whisper: -0.05}[expr] * r;
	const browInner = {terrified: -0.1, scream: -0.06, shock: -0.04, afraid: -0.08, uneasy: -0.06, cry: -0.1, tired: 0, relief: 0, focused: 0.05, neutral: 0, whisper: -0.07}[expr] * r;
	const open = Math.max(mouth, expr === 'scream' ? 1 : expr === 'shock' ? 0.55 : expr === 'terrified' ? 0.3 : expr === 'cry' ? 0.35 : 0);
	const eyesY = cy - r * 0.05;
	const eyeXs = prof ? [cx + fx + Math.sign(yaw) * r * 0.25] : [cx + fx - r * 0.38 * (1 - Math.abs(yaw) * 0.3), cx + fx + r * 0.38 * (1 - Math.abs(yaw) * 0.3)];
	return (
		<g transform={`rotate(${tilt} ${cx} ${cy + r})`}>
			{/* hair behind */}
			<ellipse cx={cx - yaw * r * 0.1} cy={cy - r * 0.15} rx={r * 1.08} ry={r * 1.12} fill={MARA.hair} />
			{/* neck */}
			<rect x={cx - r * 0.3} y={cy + r * 0.7} width={r * 0.6} height={r * 0.7} fill={MARA.skinShade} />
			{/* face */}
			{back ? null : <ellipse cx={cx + fx * 0.3} cy={cy + r * 0.05} rx={r * 0.86} ry={r * 1.05} fill={MARA.skin} stroke="rgba(0,0,0,0.6)" strokeWidth={2.5} />}
			{/* hair front: parted, loose strands */}
			{back ? (
				<ellipse cx={cx} cy={cy} rx={r * 0.95} ry={r * 1.08} fill={MARA.hair} />
			) : (
				<path
					d={`M${cx - r * 0.95 + fx * 0.2},${cy + r * 0.15} Q${cx - r * 0.9},${cy - r * 1.25} ${cx + fx * 0.3},${cy - r * 1.08} Q${cx + r * 0.95},${cy - r * 1.2} ${cx + r * 0.95 + fx * 0.2},${cy + r * 0.2} Q${cx + r * 0.55},${cy - r * 0.75} ${cx + fx * 0.3},${cy - r * 0.72} Q${cx - r * 0.55},${cy - r * 0.75} ${cx - r * 0.95 + fx * 0.2},${cy + r * 0.15} Z`}
					fill={MARA.hair}
				/>
			)}
			{!back ? <path d={`M${cx - r * 0.86 + fx * 0.3},${cy - r * 0.2} q${-r * 0.12},${r * 0.6} ${r * 0.05},${r * 0.95}`} stroke={MARA.hair} strokeWidth={r * 0.08} fill="none" /> : null}
			{/* messy low bun + the yellow pencil */}
			<circle cx={cx - yaw * r * 0.9 + (back ? 0 : 0)} cy={cy + r * (back ? 0.55 : 0.25)} r={r * 0.42} fill={MARA.hair} stroke="rgba(0,0,0,0.5)" strokeWidth={2} opacity={prof || back ? 1 : 0.0} />
			{prof || back ? (
				<line
					x1={cx - yaw * r * 0.9 - r * 0.55}
					y1={cy + r * (back ? 0.4 : 0.05)}
					x2={cx - yaw * r * 0.9 + r * 0.6}
					y2={cy + r * (back ? 0.75 : 0.5)}
					stroke={MARA.pencil}
					strokeWidth={r * 0.1}
					strokeLinecap="round"
				/>
			) : (
				<line x1={cx + r * 0.55} y1={cy - r * 1.15} x2={cx + r * 1.15} y2={cy - r * 0.7} stroke={MARA.pencil} strokeWidth={r * 0.09} strokeLinecap="round" />
			)}
			{back ? null : (
				<g>
					{/* eyes */}
					{eyeXs.map((ex, i) => (
						<g key={i}>
							{eyesClosed ? (
								<path d={`M${ex - eyeW},${eyesY} q${eyeW},${eyeH * 0.8} ${eyeW * 2},0`} stroke="#2b1a12" strokeWidth={3} fill="none" />
							) : (
								<>
									<ellipse cx={ex} cy={eyesY} rx={eyeW} ry={eyeH} fill="#f6f1ea" stroke="#2b1a12" strokeWidth={3} />
									<circle cx={ex + gaze[0] * eyeW * 0.45} cy={eyesY + gaze[1] * eyeH * 0.4} r={Math.min(eyeW, eyeH) * (wide > 1.3 ? 0.55 : 0.78)} fill={MARA.eye} />
									<circle cx={ex + gaze[0] * eyeW * 0.45 - eyeW * 0.15} cy={eyesY + gaze[1] * eyeH * 0.4 - eyeH * 0.25} r={eyeW * 0.12} fill="#fff" />
								</>
							)}
							{/* brows */}
							<path
								d={`M${ex - eyeW * 1.1},${eyesY - eyeH - r * 0.12 + browLift + (i === 0 ? 0 : browInner)} L${ex + eyeW * 1.1},${eyesY - eyeH - r * 0.12 + browLift + (i === 0 ? browInner : 0)}`}
								stroke={MARA.hair}
								strokeWidth={r * 0.07}
								strokeLinecap="round"
							/>
							{expr === 'cry' ? <path d={`M${ex + eyeW * 0.3},${eyesY + eyeH} q${r * 0.03},${r * 0.25} 0,${r * 0.4}`} stroke="#9fd3ff" strokeWidth={3} fill="none" /> : null}
						</g>
					))}
					{/* nose */}
					<path d={`M${cx + fx * 0.9},${cy + r * 0.05} l${-r * 0.05 + yaw * r * 0.08},${r * 0.26} l${r * 0.1},0`} stroke="rgba(80,40,25,0.8)" strokeWidth={2.5} fill="none" />
					{/* mouth */}
					{open > 0.05 ? (
						<ellipse cx={cx + fx * 0.85} cy={cy + r * 0.62} rx={r * (0.16 + 0.06 * open)} ry={r * 0.05 + r * 0.22 * open} fill="#3a1414" stroke="#2b1a12" strokeWidth={2.5} />
					) : (
						<path
							d={`M${cx + fx * 0.85 - r * 0.18},${cy + r * 0.62} q${r * 0.18},${expr === 'relief' ? r * 0.06 : expr === 'uneasy' || expr === 'afraid' ? -r * 0.04 : 0} ${r * 0.36},0`}
							stroke="#6b2b22"
							strokeWidth={3.5}
							fill="none"
							strokeLinecap="round"
						/>
					)}
				</g>
			)}
			{light ? <ellipse cx={cx + fx * 0.3} cy={cy + r * 0.05} rx={r * 0.9} ry={r * 1.08} fill={light} opacity={0.28} style={{mixBlendMode: 'screen'}} /> : null}
		</g>
	);
};

/** Mara, full body. */
export const Mara: React.FC<Pose> = (p) => {
	const s = p.s ?? 1;
	const lean = p.lean ?? 0;
	const yaw = p.yaw ?? 0;
	const back = p.back ?? false;
	const prof = Math.abs(yaw);
	const pelvis: [number, number] = [p.x, p.y];
	const neck = add(pelvis, 180 + lean, 300 * s);
	const headC = add(neck, 180 + lean + (p.tilt ?? 0) * 0.3, 85 * s);
	const shoulderHalf = 82 * s * (1 - prof * 0.7);
	const hipHalf = 52 * s * (1 - prof * 0.6);
	const perp: [number, number] = [Math.cos(rad(lean)), Math.sin(rad(lean))];
	const shL: [number, number] = [neck[0] - perp[0] * shoulderHalf, neck[1] + 18 * s - perp[1] * shoulderHalf];
	const shR: [number, number] = [neck[0] + perp[0] * shoulderHalf, neck[1] + 18 * s + perp[1] * shoulderHalf];
	const hipL: [number, number] = [pelvis[0] - hipHalf, pelvis[1]];
	const hipR: [number, number] = [pelvis[0] + hipHalf, pelvis[1]];
	const armL = p.armL ?? [8, -4];
	const armR = p.armR ?? [-8, 4];
	const legL = p.legL ?? [3, 0];
	const legR = p.legR ?? [-3, 0];
	const tk = p.thighK ?? 1;
	const elbowL = add(shL, armL[0], 165 * s);
	const wristL = add(elbowL, armL[0] + armL[1], 145 * s);
	const elbowR = add(shR, armR[0], 165 * s);
	const wristR = add(elbowR, armR[0] + armR[1], 145 * s);
	const kneeL = add(hipL, legL[0], 215 * s * tk);
	const ankleL = add(kneeL, legL[0] + legL[1], 205 * s);
	const kneeR = add(hipR, legR[0], 215 * s * tk);
	const ankleR = add(kneeR, legR[0] + legR[1], 205 * s);
	const arm = (sh: [number, number], el: [number, number], wr: [number, number], a: number, side: 'L' | 'R') => {
		const mid = add(el, a, 70 * s);
		return (
			<g>
				<Limb a={sh} b={el} w={58 * s} color={MARA.sweat} />
				<Limb a={el} b={mid} w={50 * s} color={MARA.sweat} />
				<Limb a={mid} b={wr} w={34 * s} color={MARA.skin} />
				<HandShape p={wr} a={a} s={s} grip={Boolean((side === 'L' && (p.phoneIn === 'L' || p.stylusIn === 'L' || p.keysIn === 'L')) || (side === 'R' && (p.phoneIn === 'R' || p.stylusIn === 'R' || p.keysIn === 'R')))} />
				{p.phoneIn === side ? <Phone p={wr} s={s} a={a} /> : null}
				{p.stylusIn === side ? <Stylus p={wr} s={s} a={a + 40} /> : null}
				{p.keysIn === side ? <circle cx={wr[0]} cy={wr[1] + 40 * s} r={14 * s} fill="none" stroke="#c9c9c9" strokeWidth={4 * s} /> : null}
			</g>
		);
	};
	const leg = (hip: [number, number], knee: [number, number], ankle: [number, number], a: number) => (
		<g>
			<Limb a={hip} b={knee} w={66 * s} color={MARA.pants} />
			<Limb a={knee} b={ankle} w={54 * s} color={MARA.pants} />
			<Limb a={ankle} b={add(ankle, a + (yaw >= 0 ? 80 : -80), 62 * s)} w={34 * s} color={MARA.socks} />
		</g>
	);
	const armLa = armL[0] + armL[1];
	const armRa = armR[0] + armR[1];
	// draw the far side first when turned
	const farArmFirst = yaw > 0.3 ? 'L' : yaw < -0.3 ? 'R' : null;
	return (
		<g>
			{leg(hipL, kneeL, ankleL, legL[0] + legL[1])}
			{leg(hipR, kneeR, ankleR, legR[0] + legR[1])}
			{farArmFirst === 'L' ? arm(shL, elbowL, wristL, armLa, 'L') : null}
			{farArmFirst === 'R' ? arm(shR, elbowR, wristR, armRa, 'R') : null}
			{/* oversized sweatshirt torso */}
			<path
				d={`M${shL[0] - 10 * s},${shL[1] - 6 * s} L${shR[0] + 10 * s},${shR[1] - 6 * s} L${hipR[0] + 26 * s * (1 - prof * 0.5)},${pelvis[1] + 22 * s} L${hipL[0] - 26 * s * (1 - prof * 0.5)},${pelvis[1] + 22 * s} Z`}
				fill={MARA.sweat}
				stroke="rgba(0,0,0,0.55)"
				strokeWidth={3}
				strokeLinejoin="round"
			/>
			<path d={`M${hipL[0] - 20 * s},${pelvis[1] + 8 * s} L${hipR[0] + 20 * s},${pelvis[1] + 8 * s}`} stroke={MARA.sweatShade} strokeWidth={10 * s} />
			{farArmFirst !== 'L' ? arm(shL, elbowL, wristL, armLa, 'L') : null}
			{farArmFirst !== 'R' ? arm(shR, elbowR, wristR, armRa, 'R') : null}
			<MaraHead cx={headC[0]} cy={headC[1]} r={56 * s} yaw={yaw} back={back} tilt={(p.tilt ?? 0) + lean * 0.4} expr={p.expr} mouth={p.mouth} gaze={p.gaze} eyesClosed={p.eyesClosed} light={p.light} />
			{p.light && !back ? <path d={`M${shL[0]},${shL[1]} L${shR[0]},${shR[1]} L${hipR[0]},${pelvis[1]} L${hipL[0]},${pelvis[1]} Z`} fill={p.light} opacity={0.18} /> : null}
		</g>
	);
};

/** Close-up: head and shoulders filling the frame. (cx, cy) = face centre, r = head radius. */
export const MaraBust: React.FC<{
	cx: number;
	cy: number;
	r: number;
	yaw?: number;
	back?: boolean;
	tilt?: number;
	expr?: Expr;
	mouth?: number;
	gaze?: [number, number];
	eyesClosed?: boolean;
	light?: string;
	/** phone held to the ear on this side */
	phoneEar?: 'L' | 'R';
	/** phone held in front of the face (recording herself) */
	phoneFront?: boolean;
	/** hand over the mouth */
	handMouth?: boolean;
	/** chin resting on a hand */
	chinHand?: boolean;
}> = ({cx, cy, r, phoneEar, phoneFront, handMouth, chinHand, ...h}) => {
	const sh = r * 2.3;
	return (
		<g>
			{/* shoulders in the oversized sweatshirt */}
			<path
				d={`M${cx - sh},${cy + r * 4} Q${cx - sh},${cy + r * 1.55} ${cx - r * 0.6},${cy + r * 1.35} L${cx + r * 0.6},${cy + r * 1.35} Q${cx + sh},${cy + r * 1.55} ${cx + sh},${cy + r * 4} Z`}
				fill={MARA.sweat}
				stroke="rgba(0,0,0,0.6)"
				strokeWidth={3}
			/>
			<path d={`M${cx - r * 0.55},${cy + r * 1.38} Q${cx},${cy + r * 1.75} ${cx + r * 0.55},${cy + r * 1.38}`} stroke={MARA.sweatShade} strokeWidth={r * 0.12} fill="none" />
			<MaraHead cx={cx} cy={cy} r={r} {...h} />
			{phoneEar ? (
				<g>
					<HandShape p={[cx + (phoneEar === 'R' ? r * 0.95 : -r * 0.95), cy + r * 0.9]} a={180} s={r / 40} grip />
					<rect x={cx + (phoneEar === 'R' ? r * 0.72 : -r * 1.18)} y={cy - r * 0.55} width={r * 0.46} height={r * 1.35} rx={r * 0.08} fill="#15161a" />
				</g>
			) : null}
			{phoneFront ? (
				<g>
					<rect x={cx - r * 0.55} y={cy + r * 1.7} width={r * 1.1} height={r * 1.9} rx={r * 0.12} fill="#15161a" stroke="#000" strokeWidth={2} />
					<rect x={cx - r * 0.47} y={cy + r * 1.78} width={r * 0.94} height={r * 1.72} rx={r * 0.08} fill="#d8e8ff" opacity={0.9} />
					<HandShape p={[cx - r * 0.75, cy + r * 3.5]} a={160} s={r / 38} grip />
					<HandShape p={[cx + r * 0.75, cy + r * 3.5]} a={200} s={r / 38} grip />
				</g>
			) : null}
			{handMouth ? <HandShape p={[cx + r * 0.1, cy + r * 1.6]} a={175} s={r / 34} /> : null}
			{chinHand ? <HandShape p={[cx + r * 0.1, cy + r * 1.9]} a={180} s={r / 34} grip /> : null}
		</g>
	);
};
