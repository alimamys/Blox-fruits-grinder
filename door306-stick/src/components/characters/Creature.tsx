// THE CREATURE: nearly seven feet of grey skin over bone, painted head and torso (cut-out parts), code-drawn
// limbs: arms that hang almost to the floor, fingers far too long, a head bent at an impossible angle.
import React from 'react';
import {staticFile} from 'remotion';
import puppets from '../../data/generated/puppets.json';
import {boilOf, wob, wobLine, type Pt} from '../../utils/rough';
import {qaAdd, useStageCtx} from '../../stick/kit';

const INK = '#141414';
const SKIN = '#8d8a84';
const SKIN_D = '#6f6c66';
type Part = {src: string; w: number; h: number};
const C = (puppets as unknown as Record<string, Record<string, Part>>).creature;

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
	const torso = view === 'back' ? C.torsoBack : view === 'side' ? C.torsoSide : C.torso;
	const head = view === 'back' ? C.headBack : view === 'side' ? C.headSide : C.head;
	const tw = view === 'side' ? 78 : 118;
	const th = hipY + 16 - (shY - 18);
	const hh = 150;
	const hw = (head.w / head.h) * hh;
	const neck: Pt = [hx + (view === 'side' ? 16 : 0), shY - 4];
	const jaw = talk > 0.05 ? 1 + talk * 0.12 : 1;
	return (
		<g transform={`translate(${x} ${y}) scale(${left ? -s : s} ${s})`} opacity={opacity}>
			<ellipse cx={0} cy={2} rx={70} ry={10} fill="#000" opacity={0.3} />
			{leg(-1, 0)}
			{leg(1, Math.PI)}
			{arm(shL, handL, -1, 0)}
			<g transform={`rotate(${hunch * (view === 'side' ? 18 : 0)} 0 ${hipY})`}>
				<image href={staticFile(torso.src)} x={hx - tw / 2} y={shY - 18} width={tw} height={th} preserveAspectRatio="none" />
			</g>
			<g transform={`rotate(${view === 'back' ? -tilt * 0.6 : tilt} ${neck[0]} ${neck[1]}) translate(${neck[0]} ${neck[1]}) scale(1 ${jaw})`}>
				<image href={staticFile(head.src)} x={-hw / 2 + (view === 'side' ? 10 : 0)} y={-hh + 18} width={hw} height={hh} />
			</g>
			{arm(shR, handR, 1, 1)}
		</g>
	);
};

/** the stained sack (cut-out prop); `moving` makes the lump inside shift */
export const Sack: React.FC<{x: number; y: number; s?: number; frame: number; moving?: number; flip?: boolean}> = ({x, y, s = 1, frame, moving = 0, flip = false}) => {
	const P = (puppets as unknown as Record<string, Record<string, Part>>).props;
	const part = moving > 0 && Math.floor(frame / 5) % 2 === 0 ? P.sackMove : P.sack;
	const w = 220 * s;
	const h = (part.h / part.w) * w;
	const j = moving > 0 ? Math.sin(frame * 1.3) * 3 * moving : 0;
	return (
		<g transform={`translate(${x + j} ${y}) scale(${flip ? -1 : 1} 1)`}>
			<ellipse cx={0} cy={-2} rx={w * 0.45} ry={8} fill="#000" opacity={0.28} />
			<image href={staticFile(part.src)} x={-w / 2} y={-h} width={w} height={h} />
		</g>
	);
};

/** any cut-out prop (sofa, table, chair, notebook) standing on y */
export const Prop: React.FC<{name: 'sofa' | 'table' | 'chair' | 'notebook'; x: number; y: number; w: number; tilt?: number}> = ({name, x, y, w, tilt = 0}) => {
	const P = (puppets as unknown as Record<string, Record<string, Part>>).props;
	const part = P[name];
	const h = (part.h / part.w) * w;
	return (
		<g transform={`rotate(${tilt} ${x} ${y})`}>
			<ellipse cx={x} cy={y - 2} rx={w * 0.48} ry={9} fill="#000" opacity={0.25} />
			<image href={staticFile(part.src)} x={x - w / 2} y={y - h} width={w} height={h} />
		</g>
	);
};
export const limbLine = wobLine;
