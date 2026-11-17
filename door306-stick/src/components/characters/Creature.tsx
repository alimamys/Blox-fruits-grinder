// THE CREATURE: nearly seven feet of grey skin over bone, painted head and torso (cut-out parts), code-drawn
// limbs: arms that hang almost to the floor, fingers far too long, a head bent at an impossible angle.
import React from 'react';
import {boilOf, wob, wobLine, wobPoly, type Pt} from '../../utils/rough';
import {qaAdd, useStageCtx} from '../../stick/kit';

const INK = '#141414';
const SKIN = '#8d8a84';
const SKIN_D = '#6f6c66';

export type CreatureProps = {
	x: number;
	y: number;
	s?: number;
	frame: number;
	view?: 'front' | 'side' | 'back';
	/** facing left in side view */
	left?: boolean;
	/** head tilt in degrees (sideways bend) */
	tilt?: number;
	/** walking / climbing phase (radians) */
	phase?: number;
	walking?: boolean;
	/** right hand reach target (world coords, relative to x,y in creature units), or a preset */
	reach?: Pt | null;
	/** the other hand grips something at this point (the sack, an ankle) */
	grip?: Pt | null;
	/** hunched forward 0..1 */
	hunch?: number;
	/** jaw opening 0..1 (it talks once) */
	talk?: number;
	opacity?: number;
	/** shoulders hunched, head ducked (going through a doorway) */
	bend?: number;
	/** register with the frame QA (off where it is hidden on purpose behind a landing or in a gap) */
	qa?: boolean;
};

const limb = (a: Pt, b: Pt, c: Pt, sd: number, w = 11) => {
	const d = wob([a, b, c], sd, 1.2, false);
	return (
		<g>
			<path d={d} fill="none" stroke={INK} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} fill="none" stroke={SKIN} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
		</g>
	);
};
/** two-bone IK: elbow between shoulder s and hand h with bone length L each, bending to `side` */
const ik = (s: Pt, h: Pt, L: number, side: number): Pt => {
	const dx = h[0] - s[0];
	const dy = h[1] - s[1];
	const d = Math.min(Math.hypot(dx, dy), L * 1.98);
	const mx = s[0] + (dx / Math.max(1, Math.hypot(dx, dy))) * d * 0.5;
	const my = s[1] + (dy / Math.max(1, Math.hypot(dx, dy))) * d * 0.5;
	const off = Math.sqrt(Math.max(0, L * L - (d * d) / 4));
	const nx = -dy / Math.max(1, Math.hypot(dx, dy));
	const ny = dx / Math.max(1, Math.hypot(dx, dy));
	return [mx + nx * off * side, my + ny * off * side];
};
const Fingers: React.FC<{h: Pt; dir: number; curl: number; sd: number}> = ({h, dir, curl, sd}) => (
	<g>
		{[-2, -1, 0, 1].map((i) => {
			const a = (dir + i * 0.16) ;
			const L = 46 + (i === 0 ? 6 : 0);
			const mid: Pt = [h[0] + Math.cos(a) * L * 0.55, h[1] + Math.sin(a) * L * 0.55];
			const tip: Pt = [mid[0] + Math.cos(a + curl * 1.4) * L * 0.5, mid[1] + Math.sin(a + curl * 1.4) * L * 0.5];
			const d = wob([h, mid, tip], sd + i, 0.6, false);
			return (
				<g key={i}>
					<path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
					<path d={d} fill="none" stroke={SKIN} strokeWidth={3.5} strokeLinecap="round" />
				</g>
			);
		})}
		<circle cx={h[0]} cy={h[1]} r={9} fill={SKIN_D} stroke={INK} strokeWidth={3} />
	</g>
);

export const Creature: React.FC<CreatureProps> = ({x, y, s = 1, frame, view = 'front', left = false, tilt = 32, phase = 0, walking = false, reach = null, grip = null, hunch = 0.3, talk = 0, opacity = 1, bend = 0, qa = true}) => {
	const ctx = useStageCtx();
	if (qa) qaAdd(ctx, {name: 'creature', x0: x - 75 * s, x1: x + 75 * s, y0: y - (470 - bend * 40) * s, y1: y, head: y - (330 - bend * 40) * s, overlapOk: true});
	const sd = 1900 + boilOf(frame, 4) * 7;
	const breath = Math.sin(frame / 24 * 2 * Math.PI / 3.4) * 2;
	const bob = walking ? -Math.abs(Math.sin(phase)) * 8 : 0;
	const hipY = -205 + bob;
	const shY = -340 + bob - breath + bend * 40;
	const shW = view === 'side' ? 18 : 48;
	const hx = view === 'side' ? 30 * hunch + 20 * bend : 0;
	// legs
	const leg = (side: number, o: number) => {
		const sw = walking ? Math.sin(phase + o) * 34 : 0;
		const hp: Pt = [side * (view === 'side' ? 6 : 20), hipY];
		const ft: Pt = [side * (view === 'side' ? 4 : 26) + sw, 0];
		const kn: Pt = [(hp[0] + ft[0]) / 2 + (view === 'side' ? 16 : side * 6), (hipY) / 2 + (walking ? -Math.max(0, Math.sin(phase + o)) * 18 : 0)];
		return (
			<g key={`l${side}`}>
				{limb(hp, kn, ft, sd + 3 + o, 12)}
				<path d={wob([[ft[0] - 6, ft[1] - 4], [ft[0] + (view === 'side' ? 34 : side * 18), ft[1] - 2], [ft[0] + (view === 'side' ? 30 : side * 16), ft[1] + 4], [ft[0] - 8, ft[1] + 4]], sd + 8 + o, 0.5)} fill={SKIN_D} stroke={INK} strokeWidth={4} />
			</g>
		);
	};
	// arms: hang to the knees, or reach / grip
	const shL: Pt = [hx - shW, shY + 14];
	const shR: Pt = [hx + shW, shY + 14];
	const sway = Math.sin(frame / 24 * 1.7) * 6;
	const handR: Pt = reach ?? [hx + shW + 16 + sway, -60];
	const handL: Pt = grip ?? [hx - shW - 14 - sway, -54];
	const L = 128;
	const arm = (sh: Pt, hd: Pt, side: number, k: number) => (
		<g key={`a${k}`}>
			{limb(sh, ik(sh, hd, L, side), hd, sd + 20 + k, 10)}
			<Fingers h={hd} dir={reach && k === 1 ? Math.atan2(hd[1] - sh[1], hd[0] - sh[0]) : Math.PI / 2} curl={grip && k === 0 ? 1 : 0.35} sd={sd + 30 + k * 5} />
		</g>
	);
	const neck: Pt = [hx + (view === 'side' ? 16 : 0), shY - 4];
	const jaw = Math.max(0, Math.min(1, talk));
	// torso: narrow and skeletal, ribs and a hollow belly (front), spine and shoulder blades (back)
	const tW = view === 'side' ? 22 : 46;
	const hW = view === 'side' ? 16 : 24;
	const torsoD = wob(
		view === 'side'
			? [[hx - tW, shY - 6], [hx + tW + 8, shY - 2], [hx + hW + 4, (shY + hipY) / 2], [hx + hW, hipY + 10], [hx - hW, hipY + 10], [hx - tW - 6, (shY + hipY) / 2]]
			: [[hx - tW, shY - 4], [hx + tW, shY - 4], [hx + tW - 8, shY + 60], [hx + hW, hipY - 30], [hx + hW + 2, hipY + 10], [hx - hW - 2, hipY + 10], [hx - hW, hipY - 30], [hx - tW + 8, shY + 60]],
		sd + 40,
		1,
	);
	const ribs = view === 'back'
		? [<path key="sp" d={wobLine(hx, shY + 4, hx, hipY, sd + 41, 1, 4)} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={3} />,
			...[-1, 1].map((sg) => <path key={`bl${sg}`} d={`M${hx + sg * 12},${shY + 18} q${sg * 22},10 ${sg * 18},40`} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={3} />)]
		: Array.from({length: 5}, (_, i) => {
				const yy = shY + 22 + i * 17;
				const w = (view === 'side' ? 16 : 34) - i * 3;
				return view === 'side' ? (
					<path key={i} d={`M${hx - 4},${yy} q${w},4 ${w + 6},14`} fill="none" stroke={INK} strokeOpacity={0.5} strokeWidth={3} />
				) : (
					<path key={i} d={`M${hx - w},${yy + 6} Q${hx},${yy - 6} ${hx + w},${yy + 6}`} fill="none" stroke={INK} strokeOpacity={0.5} strokeWidth={3} />
				);
			});
	// head: a long bald skull, deep black eye sockets, a mouth that hangs open far too wide
	const headEl = (
		<g>
			<path d={wobLine(0, 6, 0, -20, sd + 50, 0.6)} stroke={INK} strokeWidth={22} strokeLinecap="round" />
			<path d={wobLine(0, 6, 0, -20, sd + 50, 0.6)} stroke={SKIN} strokeWidth={13} strokeLinecap="round" />
			<path d={wob([[-30, -40], [-36, -95], [-24, -138], [0, -150], [24, -138], [36, -95], [30, -40], [16, -14], [-16, -14]], sd + 51, 1.2)} fill={view === 'back' ? SKIN_D : SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			{view !== 'back' ? (
				<g transform={view === 'side' ? 'translate(9 0)' : undefined}>
					{(view === 'side' ? [1] : [-1, 1]).map((sg) => (
						<path key={`e${sg}`} d={wob([[sg * 6, -104], [sg * 24, -110], [sg * 26, -92], [sg * 10, -86]], sd + 52 + sg, 0.8)} fill="#050505" />
					))}
					<path d={`M${view === 'side' ? 2 : -7},-70 L${view === 'side' ? 10 : 7},-70 L${view === 'side' ? 6 : 0},-60 Z`} fill="#3a3a3a" />
					<path d={wob([[-13, -56], [13, -56], [16 + jaw * 4, -10 + jaw * 40], [0, 8 + jaw * 50], [-16 - jaw * 4, -10 + jaw * 40]], sd + 54, 0.8)} fill="#120707" stroke={INK} strokeWidth={4} />
				</g>
			) : (
				<path d={wobLine(-14, -120, 10, -70, sd + 55, 1)} stroke={INK} strokeOpacity={0.3} strokeWidth={3} />
			)}
			{[-1, 1].map((sg) => (view === 'side' && sg < 0 ? null : <path key={`ear${sg}`} d={`M${sg * 33},-96 q${sg * 10},6 ${sg * 2},20`} fill={SKIN} stroke={INK} strokeWidth={3.5} />))}
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${left ? -s : s} ${s})`} opacity={opacity}>
			<ellipse cx={0} cy={2} rx={70} ry={10} fill="#000" opacity={0.3} />
			{leg(-1, 0)}
			{leg(1, Math.PI)}
			{arm(shL, handL, -1, 0)}
			<g transform={`rotate(${hunch * (view === 'side' ? 18 : 0)} 0 ${hipY})`}>
				<path d={torsoD} fill={SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
				<path d={torsoD} fill={SKIN_D} opacity={0.35} transform={`translate(${view === 'side' ? -6 : 8} 0) scale(${view === 'side' ? 1 : 0.6} 1)`} style={{transformOrigin: `${hx}px ${shY}px`}} />
				{ribs}
			</g>
			<g transform={`rotate(${view === 'back' ? -tilt * 0.6 : tilt} ${neck[0]} ${neck[1]}) translate(${neck[0]} ${neck[1]})`}>{headEl}</g>
			{arm(shR, handR, 1, 1)}
		</g>
	);
};

/** the stained burlap sack, tied at the neck; `moving` makes the lump inside shift */
export const Sack: React.FC<{x: number; y: number; s?: number; frame: number; moving?: number; flip?: boolean}> = ({x, y, s = 1, frame, moving = 0, flip = false}) => {
	const sd = 2100 + boilOf(frame, 4) * 7;
	const bulge = moving > 0 ? Math.sin(frame / 3) * 14 * moving : 0;
	const w = 110;
	return (
		<g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
			<ellipse cx={0} cy={-2} rx={w * 0.95} ry={9} fill="#000" opacity={0.28} />
			<path d={wob([[-w, -6], [-w + 6, -70 - bulge * 0.3], [-30, -118 - bulge], [30, -112 + bulge * 0.4], [w - 20, -70], [w, -40], [w - 4, -6]], sd, 2)} fill="#8a6a44" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			<path d={wob([[w - 4, -40], [w + 26, -58], [w + 44, -46], [w + 30, -30], [w + 4, -24]], sd + 1, 1.2)} fill="#8a6a44" stroke={INK} strokeWidth={4} />
			<path d={wobLine(w - 6, -46, w + 6, -28, sd + 2, 0.6)} stroke="#4a3622" strokeWidth={6} />
			<ellipse cx={-30} cy={-40} rx={26} ry={12} fill="#4a2a1c" opacity={0.55} />
			<ellipse cx={24} cy={-70} rx={14} ry={8} fill="#4a2a1c" opacity={0.45} />
			{[-60, -20, 20, 60].map((xx) => (
				<path key={xx} d={`M${xx},-12 l6,-${40 + (xx % 3) * 6}`} stroke="#000" strokeOpacity={0.15} strokeWidth={3} />
			))}
		</g>
	);
};

/** furniture and the notebook, drawn in code, standing on y (w = width) */
export const Prop: React.FC<{name: 'sofa' | 'table' | 'chair' | 'notebook'; x: number; y: number; w: number; tilt?: number}> = ({name, x, y, w, tilt = 0}) => {
	const sd = 2200 + name.length * 13;
	const el = (() => {
		if (name === 'sofa') {
			const h = w * 0.58;
			const L = x - w / 2;
			const fab = '#6e6080';
			const dark = '#584c68';
			return (
				<g>
					<path d={wobPoly([[L + 20, y - h], [L + w - 20, y - h], [L + w - 14, y - h * 0.45], [L + 14, y - h * 0.45]], sd, 1)} fill={dark} stroke={INK} strokeWidth={5} />
					<path d={wobPoly([[L + 30, y - h * 0.55], [L + w - 30, y - h * 0.55], [L + w - 30, y - h * 0.25], [L + 30, y - h * 0.25]], sd + 1, 1)} fill={fab} stroke={INK} strokeWidth={4} />
					<path d={wobLine(x, y - h * 0.55, x, y - h * 0.25, sd + 2, 0.6)} stroke={INK} strokeWidth={3} />
					{[-1, 1].map((sg) => (
						<path key={sg} d={wobPoly([[sg > 0 ? L + w - 46 : L, y - h * 0.62], [sg > 0 ? L + w : L + 46, y - h * 0.62], [sg > 0 ? L + w : L + 46, y - 10], [sg > 0 ? L + w - 46 : L, y - 10]], sd + 3 + sg, 1)} fill={dark} stroke={INK} strokeWidth={5} />
					))}
					<path d={wobPoly([[L + 20, y - h * 0.25], [L + w - 20, y - h * 0.25], [L + w - 20, y - 10], [L + 20, y - 10]], sd + 5, 1)} fill={dark} stroke={INK} strokeWidth={5} />
					{[L + 40, L + w - 48].map((lx) => <rect key={lx} x={lx} y={y - 10} width={8} height={10} fill="#2a1d14" />)}
				</g>
			);
		}
		if (name === 'table') {
			const h = w * 0.62;
			const L = x - w / 2;
			return (
				<g>
					<path d={wobPoly([[L, y - h], [L + w, y - h], [L + w, y - h + 18], [L, y - h + 18]], sd, 0.8)} fill="#8a5a36" stroke={INK} strokeWidth={5} />
					{[L + 14, L + w - 30].map((lx) => <path key={lx} d={wobPoly([[lx, y - h + 18], [lx + 16, y - h + 18], [lx + 16, y], [lx, y]], sd + lx, 0.6)} fill="#74492a" stroke={INK} strokeWidth={4} />)}
				</g>
			);
		}
		if (name === 'chair') {
			const h = w * 1.8;
			const L = x - w / 2;
			return (
				<g>
					<path d={wobPoly([[L + 6, y - h], [L + w - 6, y - h], [L + w - 6, y - h * 0.5], [L + 6, y - h * 0.5]], sd, 0.6)} fill="#8a5a36" stroke={INK} strokeWidth={4} />
					<path d={wobPoly([[L + 18, y - h + 14], [L + w - 18, y - h + 14], [L + w - 18, y - h * 0.5], [L + 18, y - h * 0.5]], sd + 9, 0.4)} fill="#000" opacity={0.25} />
					<path d={wobPoly([[L, y - h * 0.5], [L + w, y - h * 0.5], [L + w, y - h * 0.44], [L, y - h * 0.44]], sd + 1, 0.6)} fill="#8a5a36" stroke={INK} strokeWidth={4} />
					{[L + 4, L + w - 12].map((lx) => <rect key={lx} x={lx} y={y - h * 0.44} width={8} height={h * 0.44} fill="#74492a" stroke={INK} strokeWidth={3} />)}
				</g>
			);
		}
		const h = w * 0.6;
		return <path d={wobPoly([[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 6, y - h * 0.25], [x - w / 2 + 6, y - h * 0.25]], sd, 0.6)} fill="#7a4a2a" stroke={INK} strokeWidth={4} />;
	})();
	return (
		<g transform={`rotate(${tilt} ${x} ${y})`}>
			<ellipse cx={x} cy={y - 2} rx={w * 0.48} ry={9} fill="#000" opacity={0.25} />
			{el}
		</g>
	);
};
export const limbLine = wobLine;
