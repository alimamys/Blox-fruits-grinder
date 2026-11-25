// The Rake, drawn in code in the stick look: a starved, hairless, waxy-pale man-shape with huge empty black eyes,
// a lipless slit of a mouth and long fingers that end in curved yellow claws. It never breathes and never blinks;
// now and then its head jerks a few degrees. Poses:
//   'front' - crouched facing us, knees up and wide, hands flat on the surface between them (the pillow view, close-ups)
//   'side'  - the same crouch side-on, head jutting forward (the bedroom stage view); dir 1 faces right
//   'stand' - standing hunched, arms hanging to the knees (rarely seen)
// x,y = where it touches the surface (between its feet); s = scale (1 = a crouch about 260 px tall).
import React from 'react';
import {boilOf, wob, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';
import {INK, qaAdd, Tint, useStageCtx} from './kit';

const SKIN = '#e2dccb';
const SHADE = '#b6ae98';
const CLAW = '#cdbb7a';

export type RakePose = 'front' | 'side' | 'stand';

const limb = (pts: Pt[], sd: number, w: number, fill = SKIN) => (
	<g>
		<path d={wob(pts, sd, 0.5, false)} stroke={INK} strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		<path d={wob(pts, sd, 0.5, false)} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);

/** a bony hand at h: a narrow palm and four long fingers, each bent at a knuckle and curling down toward the surface
 *  it grips, ending in a solid hooked yellow-grey claw. a = the direction the fingers point (degrees, 90 = down). */
const claws = (h: Pt, a: number, sd: number, spread = 16, len = 34, far = false) => {
	const skin = far ? SHADE : SKIN;
	const claw = far ? '#a99a63' : CLAW;
	const rad = (d: number) => (d * Math.PI) / 180;
	// fingertips curl toward "down" (90 deg)
	const curl = (d: number) => d + (90 - d) * 0.45;
	const palm: Pt = [h[0] + Math.cos(rad(a)) * 6, h[1] + Math.sin(rad(a)) * 6];
	return (
		<g>
			<ellipse cx={palm[0]} cy={palm[1]} rx={11} ry={7} transform={`rotate(${a} ${palm[0]} ${palm[1]})`} fill={skin} stroke={INK} strokeWidth={4} />
			{[-1.5, -0.5, 0.5, 1.5].map((i, n) => {
				const d1 = a + i * spread;
				const L = len * (1 - Math.abs(i) * 0.12) * (1 + 0.05 * Math.sin(sd + n));
				const base: Pt = [palm[0] + Math.cos(rad(d1)) * 6, palm[1] + Math.sin(rad(d1)) * 6];
				const kn: Pt = [base[0] + Math.cos(rad(d1)) * L * 0.55, base[1] + Math.sin(rad(d1)) * L * 0.55];
				const d2 = curl(d1);
				const tip: Pt = [kn[0] + Math.cos(rad(d2)) * L * 0.42, kn[1] + Math.sin(rad(d2)) * L * 0.42];
				// the claw: a hooked crescent continuing from the fingertip, bending further down
				const d3 = curl(d2);
				const cl = L * 0.42;
				const pt: Pt = [tip[0] + Math.cos(rad(d3)) * cl, tip[1] + Math.sin(rad(d3)) * cl];
				const nx = -Math.sin(rad(d2));
				const ny = Math.cos(rad(d2));
				const w = 3.2;
				const c1: Pt = [tip[0] + Math.cos(rad(d2)) * cl * 0.7, tip[1] + Math.sin(rad(d2)) * cl * 0.7];
				const clawD = `M${tip[0] + nx * w},${tip[1] + ny * w} Q${c1[0] + nx * w * 0.6},${c1[1] + ny * w * 0.6} ${pt[0]},${pt[1]} Q${c1[0] - nx * w * 0.9},${c1[1] - ny * w * 0.9} ${tip[0] - nx * w},${tip[1] - ny * w} Z`;
				const finger = `M${base[0]},${base[1]} L${kn[0]},${kn[1]} L${tip[0]},${tip[1]}`;
				return (
					<g key={n}>
						<path d={finger} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						<path d={finger} stroke={skin} strokeWidth={4.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						<circle cx={kn[0]} cy={kn[1]} r={3.4} fill={skin} stroke={INK} strokeWidth={1.6} />
						<path d={clawD} fill={claw} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
					</g>
				);
			})}
		</g>
	);
};

/** the head: a long bald skull, two big almond-shaped empty eyes with a pinprick of light, a long lipless slit; mouth 0..1 opens it */
const Head: React.FC<{cx: number; cy: number; sd: number; tilt: number; mouth?: number; side?: boolean}> = ({cx, cy, sd, tilt, mouth = 0, side = false}) => (
	<g transform={`rotate(${tilt} ${cx} ${cy})`}>
		{side ? (
			<path d={wobEllipse(cx + 4, cy, 30, 44, sd, 0.6)} fill={SKIN} stroke={INK} strokeWidth={6} />
		) : (
			<path
				d={wobPoly([[cx - 30, cy - 36], [cx, cy - 52], [cx + 30, cy - 36], [cx + 34, cy], [cx + 22, cy + 34], [cx, cy + 46], [cx - 22, cy + 34], [cx - 34, cy]], sd, 0.8)}
				fill={SKIN}
				stroke={INK}
				strokeWidth={6}
				strokeLinejoin="round"
			/>
		)}
		<path d={wobEllipse(cx + (side ? 4 : 12), cy + 8, 16, 32, sd + 1, 0.4)} fill={SHADE} opacity={0.5} />
		{(side ? [[18, 14]] : [[-14, -14], [14, 14]]).map(([ex, rot]) => (
			<g key={ex} transform={`rotate(${rot} ${cx + ex} ${cy - 6})`}>
				<path d={wobEllipse(cx + ex, cy - 6, side ? 8 : 10, 17, sd + 2 + ex, 0.5)} fill="#050505" />
				<circle cx={cx + ex + 2} cy={cy - 14} r={1.7} fill="#fff" opacity={0.8} />
			</g>
		))}
		{mouth > 0.05 ? (
			<path d={wobEllipse(cx + (side ? 20 : 0), cy + 28, side ? 7 : 13, 4 + 16 * mouth, sd + 3, 0.5)} fill="#140c0c" stroke={INK} strokeWidth={3} />
		) : (
			<path d={`M${cx + (side ? 6 : -16)},${cy + 27} Q${cx + (side ? 20 : 0)},${cy + 31} ${cx + (side ? 32 : 16)},${cy + 27}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
		)}
	</g>
);

export const Rake: React.FC<{
	x: number;
	y: number;
	s?: number;
	frame: number;
	pose?: RakePose;
	dir?: 1 | -1;
	/** extra head tilt, degrees */
	tilt?: number;
	/** mouth 0..1 (the whisper) */
	mouth?: number;
	/** lean the head + shoulders toward the viewer / forward (0..1) */
	lean?: number;
	opacity?: number;
	name?: string;
	qa?: boolean;
	/** side pose only: crawl cycle position (cycles); undefined = still */
	crawl?: number;
}> = ({x, y, s = 1, frame, pose = 'front', dir = 1, tilt = 0, mouth = 0, lean = 0, opacity = 1, name = 'rake', qa = true, crawl}) => {
	const ctx = useStageCtx();
	const sd = 4200 + boilOf(frame, 4) * 7;
	// it never breathes; every few seconds the head jumps, like a puppet's
	const jerk = frame % 83 < 2 ? 8 : frame % 131 < 2 ? -6 : 0;
	const h = pose === 'stand' ? 400 : 262;
	if (qa) qaAdd(ctx, {name, x0: x - 105 * s, x1: x + 105 * s, y0: y - h * s, y1: y, head: y - (h - 90) * s, overlapOk: true});
	let body: React.ReactNode;
	if (pose === 'front') {
		const sh = -186 + lean * 34; // shoulders hunched up high
		const hy = -196 + lean * 46; // the head sunk between them
		body = (
			<g>
				{/* thin legs: thighs up and out past the arms to sharp knees, shins down to splayed clawed feet */}
				{[-1, 1].map((g) => (
					<g key={`l${g}`}>
						{limb([[g * 20, -96], [g * 104, -158], [g * 78, -4]], sd + 10 + g, 12)}
						{claws([g * 80, -4], g > 0 ? 10 : 170, sd + 14 + g, 18, 24)}
					</g>
				))}
				{/* the torso: a narrow, curved, starved trunk; ribs only along the sides */}
				<path d={wobPoly([[-50, sh + 6], [-30, sh - 6], [30, sh - 6], [50, sh + 6], [34, sh + 44], [22, -96], [-22, -96], [-34, sh + 44]], sd + 20, 0.9)} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
				<path d={wobPoly([[8, sh], [40, sh + 8], [28, -100], [6, -100]], sd + 21, 0.5)} fill={SHADE} opacity={0.45} />
				{[0, 1, 2].map((i) => (
					<g key={`r${i}`}>
						<path d={`M-34,${sh + 40 + i * 16} q10,-6 16,2`} stroke={SHADE} strokeWidth={4} fill="none" />
						<path d={`M34,${sh + 40 + i * 16} q-10,-6 -16,2`} stroke={SHADE} strokeWidth={4} fill="none" />
					</g>
				))}
				{/* long arms hang straight down between the knees; hands flat on the surface */}
				{[-1, 1].map((g) => (
					<g key={`a${g}`}>
						{limb([[g * 46, sh + 4], [g * 58, -92], [g * 28, -10]], sd + 30 + g, 11)}
						{claws([g * 28, -10], 90 - g * 14, sd + 34 + g, 14, 40)}
					</g>
				))}
				<Head cx={-2} cy={hy} sd={sd + 50} tilt={tilt + jerk - 8} mouth={mouth} />
			</g>
		);
	} else if (pose === 'side') {
		// facing +x; head jutting forward and low. `crawl` (cycles) walks it forward on hands and knees:
		// near hand + far knee step together, then far hand + near knee; the lifted limb rises a little
		const hx = 92 + lean * 40;
		const c = crawl === undefined ? 0 : Math.sin(crawl * 2 * Math.PI);
		const up = (v: number) => -Math.max(0, v) * 12;
		const bob = crawl === undefined ? 0 : Math.abs(Math.sin(crawl * 2 * Math.PI)) * -5;
		const hy = -168 + lean * 20 + bob;
		const nearHand: [number, number] = [96 + 16 * c, -8 + up(c)];
		const farHand: [number, number] = [76 - 16 * c, -8 + up(-c)];
		const nearFoot: [number, number] = [-30 - 12 * c, -2 + up(-c)];
		const farFoot: [number, number] = [-40 + 12 * c, -4 + up(c)];
		body = (
			<g transform={`translate(0 ${bob})`}>
				{/* far leg + arm (darker) */}
				{limb([[-52, -112], [-6, -150], farFoot], sd + 10, 11, SHADE)}
				{claws(farFoot, 0, sd + 13, 14, 26, true)}
				{limb([[34, -160], [58 - 8 * c, -96], farHand], sd + 11, 9, SHADE)}
				{claws(farHand, 20, sd + 18, 13, 38, true)}
				{/* spine: hips high and back, shoulders forward */}
				<path d={wobPoly([[-70, -128], [-40, -150], [40, -182], [56, -160], [20, -126], [-50, -100]], sd + 20, 0.8)} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
				{[0, 1, 2].map((i) => (
					<path key={`r${i}`} d={`M${-14 + i * 16},${-156 - i * 6} q4,20 -2,30`} stroke={SHADE} strokeWidth={4} fill="none" />
				))}
				{/* near leg folded under, near arm planted forward */}
				{limb([[-46, -108], [4, -138], nearFoot], sd + 12, 12)}
				{claws(nearFoot, 0, sd + 14, 14, 26)}
				{limb([[40, -168], [70 + 8 * c, -100], nearHand], sd + 15, 10)}
				{claws(nearHand, 20, sd + 16, 13, 38)}
				{limb([[46, -172], [hx - 18, hy + 24 - bob]], sd + 17, 10)}
				<Head cx={hx} cy={hy - bob} sd={sd + 50} tilt={tilt + jerk + 14} mouth={mouth} side />
			</g>
		);
	} else {
		// standing, hunched, arms to the knees
		body = (
			<g>
				{[-1, 1].map((g) => (
					<g key={`l${g}`}>
						{limb([[g * 18, -200], [g * 26, -100], [g * 22, -4]], sd + 10 + g, 15)}
						{claws([g * 22, -4], g > 0 ? 20 : 160, sd + 12 + g, 16, 22)}
					</g>
				))}
				<path d={wobPoly([[-44, -330], [44, -330], [22, -196], [-22, -196]], sd + 20, 0.8)} fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
				{[0, 1, 2, 3].map((i) => (
					<path key={`r${i}`} d={`M-28,${-300 + i * 22} Q0,${-290 + i * 22} 28,${-300 + i * 22}`} stroke={SHADE} strokeWidth={4} fill="none" />
				))}
				{[-1, 1].map((g) => (
					<g key={`a${g}`}>
						{limb([[g * 42, -322], [g * 62, -230], [g * 58, -140]], sd + 30 + g, 12)}
						{claws([g * 58, -140], 90 + g * 8, sd + 34 + g, 14, 44)}
					</g>
				))}
				<path d={wobLine(0, -330, 6, -352, sd + 40, 0.4)} stroke={INK} strokeWidth={22} strokeLinecap="round" />
				<path d={wobLine(0, -330, 6, -352, sd + 40, 0.4)} stroke={SKIN} strokeWidth={13} strokeLinecap="round" />
				<Head cx={8} cy={-370 + lean * 30} sd={sd + 50} tilt={tilt + jerk + 10} mouth={mouth} />
			</g>
		);
	}
	return (
		<g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`} opacity={opacity}>
			<ellipse cx={0} cy={2} rx={110} ry={10} fill="#000" opacity={0.25} />
			<Tint>{body}</Tint>
		</g>
	);
};
