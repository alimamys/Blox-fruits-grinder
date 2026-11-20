// The stick-figure "Frame 240": shared kit for every scene.
//  - timing helpers on the scene's markers (lines + beats), lip sync per character
//  - Stage: one repainted background plate + the code-drawn characters, under a camera;
//    `wash` fades a plate into its "unfinished drawing" version (public/plates/<set>_white.jpg)
//  - Shots: picks the shot for the scene time; a shot with `ui` shows a full-screen code UI instead
//  - set geometry measured on the plates, light filters
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, getInputProps, Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS, SCENES} from '../data/timeline';
import {envelopeAt, visemeAt, wordsOf, type Viseme} from '../data/speech';
import {LINE_BY_ID} from '../data/voiceLines';
import {useScene} from '../utils/scene';
import {boilOf, h1, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';

export const INK = '#141414';

// ---------------------------------------------------------------- maths
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
export const ramp = (t: number, a: number, b: number) => smooth(clamp01((t - a) / Math.max(1e-4, b - a)));
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-4, b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0 -> 1 between a..a+inD, 1 until b, -> 0 by b+outD */
export const pulse = (t: number, a: number, b: number, inD = 0.25, outD = 0.25) => ramp(t, a, a + inD) * (1 - ramp(t, b, b + outD));
export const lerpPt = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export type Who = string;

// ---------------------------------------------------------------- scene timing
export const useStick = () => {
	const f = useCurrentFrame();
	const api = useScene();
	const t = f / FPS;
	const ids = Object.keys(api.scene.markers);
	// a line dropped from this edit takes the time of the next step that is still in it, so a shot cut on it falls away
	const steps = (SCENES.find((x) => x.id === api.scene.id)?.steps ?? []).map((x) => (typeof x === 'string' ? x : x.beat));
	const nextKept = (id: string) => {
		for (let j = steps.indexOf(id) + 1; j < steps.length && j > 0; j++) if (api.has(steps[j])) return api.at(steps[j]);
		return api.total;
	};
	/** start (s, scene time) of a marker, + offset */
	const at = (id: string, off = 0) => (api.has(id) ? api.at(id) : nextKept(id)) / FPS + off;
	const end = (id: string, off = 0) => (api.has(id) ? api.end(id) : nextKept(id)) / FPS + off;
	/** time of a spoken word inside a line (first match, or a fraction of the line as a fallback) */
	const word = (id: string, w: string, fallback = 0.5) => {
		const hit = wordsOf(id).find((x) => x[0].toLowerCase().replace(/[^a-z']/g, '') === w.toLowerCase());
		return hit ? at(id) + hit[1] : lerp(at(id), end(id), fallback);
	};
	/** mouth for a character: opening 0..1 + shape, from the real voice, on twos like drawn animation */
	const talk = (who: Who): {talk: number; viseme: Viseme} => {
		const tq = (Math.floor((t * FPS) / 2) * 2) / FPS;
		for (const id of ids) {
			if (LINE_BY_ID[id]?.character !== who) continue;
			const s = at(id);
			const e = end(id);
			if (tq < s || tq >= e) continue;
			const env = envelopeAt(id, tq - s) ?? 0;
			return {talk: env > 0.12 ? Math.min(1, env * 1.25) : 0, viseme: visemeAt(id, tq - s)};
		}
		return {talk: 0, viseme: 'm'};
	};
	const speaking = (who: Who) => ids.some((id) => LINE_BY_ID[id]?.character === who && t >= at(id) && t < end(id));
	return {f, t, api, at, end, word, talk, speaking, total: api.total / FPS};
};

// ---------------------------------------------------------------- sets (measured on the repainted plates)
export type SetId = 'room_front_night' | 'room_side_night' | 'hall_persp_night' | 'hall_side_night' | 'closet_night' | 'exterior_night' | 'black' | 'paper';

/** sets that have an "unfinished drawing" version for the wash */
const WHITE_SETS = new Set<SetId>(['room_front_night', 'room_side_night', 'hall_persp_night', 'hall_side_night', 'closet_night']);

/** measured on the painted plates (1920x1080) */
export const GEO = {
	// Mara's workroom seen from her monitor: window left, the open doorway to the hallway right
	front: {window: [90, 35, 655, 700] as const, papers: [752, 150, 1035, 585] as const, door: [1277, 130, 1700, 968] as const, farDoor: [1330, 285, 1525, 835] as const, floor: 968, switch: [1785, 508, 1830, 600] as const},
	// the same room from the side: doorway left, the desk + monitor right
	side: {door: [10, 65, 455, 960] as const, window: [975, 15, 1620, 555] as const, screen: [820, 385, 1145, 645] as const, deskTop: 760, desk: [615, 720, 1730, 840] as const, floor: 1040, tablet: [1075, 720, 1330, 765] as const},
	// the hallway in one-point perspective (vanishing point ~ (908, 540))
	persp: {vp: [908, 540] as Pt, end: [628, 240, 1185, 830] as const, bedDoor: [790, 360, 1025, 828] as const, crack: [[980, 332], [1000, 300], [1035, 250]] as Pt[], light: [900, 55] as Pt, stain: [905, 1000] as Pt, front: [180, 60, 430, 1080] as const, frontHandle: [415, 600] as Pt, closet: [1340, 100, 1570, 1080] as const, floorFar: 830},
	// the hallway's side wall: closet door left, the long wall, the bedroom door right
	hallSide: {closet: [215, 240, 497, 897] as const, closetKnob: [458, 595] as Pt, bed: [1262, 240, 1577, 897] as const, crack: [[1480, 205], [1510, 160], [1540, 120]] as Pt[], wall: [525, 60, 1230, 860] as const, floor: 990, stain: [875, 1040] as Pt, light: [900, 20] as Pt},
	// inside the storage closet: shelves left, coats, the door right (light under it)
	closet: {door: [1120, 60, 1580, 985] as const, knob: [1173, 540] as Pt, gap: [1120, 985, 1580, 995] as const, floor: 1040, coats: [570, 170, 955, 750] as const},
	ext: {window: [1040, 424, 1136, 530] as const},
};
/** scale of a person standing with their feet at height y in the perspective hallway */
export const perspS = (y: number) => (y - 540) * 0.00467;
/** x of a point on the corridor floor at height y, k = -1 (left wall) .. 1 (right wall) */
export const perspX = (y: number, k: number) => GEO.persp.vp[0] + k * (y - 540) * 1.0;

// ---------------------------------------------------------------- camera
export type Shot = {t: number; set: SetId; z0: number; z1: number; f0: Pt; f1: Pt; light?: Light; shake?: number; track?: (t: number) => Pt; tag?: string; ui?: (f: number, d: number) => React.ReactNode; wash?: number | ((t: number) => number)};
export const shot = (t: number, set: SetId, z0: number, z1: number, f0: Pt, f1: Pt = f0, extra: Partial<Shot> = {}): Shot => ({t, set, z0, z1, f0, f1, ...extra});
export const pickShot = (shots: Shot[], t: number, total: number) => {
	let i = 0;
	for (let k = 0; k < shots.length; k++) if (t >= shots[k].t) i = k;
	const s = shots[i];
	const e = i + 1 < shots.length ? shots[i + 1].t : total;
	return {i, s, k: smooth(clamp01((t - s.t) / Math.max(0.01, e - s.t))), local: t - s.t, dur: e - s.t};
};
export const camOf = (z: number, f: Pt, t = 0, shake = 0) => {
	const hw = 960 / z;
	const hh = 540 / z;
	// a faint breathing drift so no shot is ever dead still
	let fx = f[0] + Math.sin(t * 0.7) * 3 + (shake ? h1(Math.floor(t * 24), 3) * shake : 0);
	let fy = f[1] + Math.sin(t * 0.53 + 1) * 2 + (shake ? h1(Math.floor(t * 24), 4) * shake : 0);
	fx = Math.max(hw, Math.min(1920 - hw, fx));
	fy = Math.max(hh, Math.min(1080 - hh, fy));
	return `translate(${960 - fx * z} ${540 - fy * z}) scale(${z})`;
};

// ---------------------------------------------------------------- light
export type Light = 'day' | 'night' | 'dark' | 'grey' | 'warm' | 'dawn' | 'dusk' | 'torch' | 'dim' | 'fluoro' | 'screen' | 'flash' | 'canvas' | 'black';
/** colour matrices: [plate, characters] */
const MATS: Record<Light, [string | null, string | null]> = {
	day: [null, null],
	// plates that are already night: characters cooled and dimmed to sit in the moonlight
	night: [null, '0.8 0 0 0 0  0 0.8 0 0 0.005  0 0 0.9 0 0.03  0 0 0 1 0'],
	// a day plate turned into a dark night (empty room, hallway at night, Leo's room at night)
	dark: ['0.3 0 0 0 0  0 0.36 0 0 0.01  0 0 0.55 0 0.05  0 0 0 1 0', '0.55 0 0 0 0  0 0.6 0 0 0.01  0 0 0.78 0 0.04  0 0 0 1 0'],
	// overcast present day
	grey: ['0.9 0.06 0.04 0 0  0.05 0.9 0.05 0 0  0.04 0.06 0.92 0 0.01  0 0 0 1 0', '0.92 0.04 0.04 0 0  0.04 0.92 0.04 0 0  0.04 0.04 0.94 0 0.01  0 0 0 1 0'],
	// lamp-lit kitchen
	warm: [null, '0.95 0 0 0 0.02  0 0.86 0 0 0.01  0 0 0.7 0 0  0 0 0 1 0'],
	// the hallway at 3:06: sickly yellow-green fluorescent light on the people
	fluoro: [null, '0.9 0 0 0 0.01  0 0.95 0 0 0.03  0 0 0.74 0 0  0 0 0 1 0'],
	// the trailer at four in the morning: lamp off, but readable
	dim: ['0.5 0 0 0 0  0 0.52 0 0 0.01  0 0 0.68 0 0.04  0 0 0 1 0', '0.72 0 0 0 0  0 0.74 0 0 0.01  0 0 0.88 0 0.04  0 0 0 1 0'],
	// sunset in the clearing
	dusk: ['0.82 0 0 0 0.04  0 0.62 0 0 0.02  0 0 0.55 0 0.04  0 0 0 1 0', '0.95 0 0 0 0.03  0 0.82 0 0 0.01  0 0 0.74 0 0  0 0 0 1 0'],
	// the night trail: the plate is already black; people lit a little by the torch
	torch: [null, '0.72 0 0 0 0.02  0 0.7 0 0 0.02  0 0 0.72 0 0.03  0 0 0 1 0'],
	// lit by her monitor: cold and bright on the face
	screen: [null, '0.86 0 0 0 0.02  0 0.92 0 0 0.03  0 0 1.04 0 0.07  0 0 0 1 0'],
	// her phone torch: the plate a little brighter, people lit
	flash: ['1.12 0 0 0 0.02  0 1.12 0 0 0.02  0 0 1.1 0 0.02  0 0 0 1 0', '0.98 0 0 0 0.02  0 0.98 0 0 0.02  0 0 1 0 0.03  0 0 0 1 0'],
	// the lights off: the plate nearly black, people only just visible
	black: ['0.34 0 0 0 0  0 0.38 0 0 0  0 0 0.52 0 0.01  0 0 0 1 0', '0.5 0 0 0 0  0 0.54 0 0 0  0 0 0.7 0 0.02  0 0 0 1 0'],
	// Mara's own animation (the canvas picture): the night hallway warmed to a dim yellow bulb
	canvas: ['0.62 0.5 0.06 0 0.02  0.42 0.62 0.04 0 0.01  0.2 0.32 0.2 0 0  0 0 0 1 0', '0.92 0.08 0 0 0.02  0.05 0.85 0.02 0 0.01  0 0.1 0.62 0 0  0 0 0 1 0'],
	// grey dawn in the bedroom
	dawn: ['0.72 0 0 0 0.03  0 0.76 0 0 0.04  0 0 0.86 0 0.06  0 0 0 1 0', '0.85 0 0 0 0.01  0 0.85 0 0 0.02  0 0 0.9 0 0.03  0 0 0 1 0'],
};
export const Tint: React.FC<{light?: Light; children: React.ReactNode}> = ({light, children}) => {
	const stageLight = useContext(StageCtxR)?.light ?? 'day';
	const l = light ?? stageLight;
	return MATS[l][1] ? <g filter={`url(#ch_${l})`}>{children}</g> : <>{children}</>;
};

const Defs: React.FC = () => (
	<defs>
		{(Object.keys(MATS) as Light[]).map((k) => (
			<React.Fragment key={k}>
				{MATS[k][0] ? (
					<filter id={`pl_${k}`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values={MATS[k][0]!} />
					</filter>
				) : null}
				{MATS[k][1] ? (
					<filter id={`ch_${k}`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values={MATS[k][1]!} />
					</filter>
				) : null}
			</React.Fragment>
		))}
		<radialGradient id="glowWarm">
			<stop offset="0" stopColor="#ffd98a" stopOpacity={0.5} />
			<stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
		</radialGradient>
		<radialGradient id="glowCold">
			<stop offset="0" stopColor="#cfe0ff" stopOpacity={0.45} />
			<stop offset="1" stopColor="#cfe0ff" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="moonBeam" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#9fb8ff" stopOpacity={0} />
			<stop offset="0.5" stopColor="#9fb8ff" stopOpacity={0.1} />
			<stop offset="1" stopColor="#9fb8ff" stopOpacity={0.18} />
		</linearGradient>
	</defs>
);

/** camera as numbers: translate + scale (same maths as camOf) */
const camNums = (z: number, f: Pt, t = 0, shake = 0) => {
	const hw = 960 / z;
	const hh = 540 / z;
	let fx = f[0] + Math.sin(t * 0.7) * 3 + (shake ? h1(Math.floor(t * 24), 3) * shake : 0);
	let fy = f[1] + Math.sin(t * 0.53 + 1) * 2 + (shake ? h1(Math.floor(t * 24), 4) * shake : 0);
	fx = Math.max(hw, Math.min(1920 - hw, fx));
	fy = Math.max(hh, Math.min(1080 - hh, fy));
	return {tx: 960 - fx * z, ty: 540 - fy * z, z};
};

// ---------------------------------------------------------------- frame QA
// Every character registers its box; the last child of the stage checks them against the camera:
// heads cut by the top edge, bodies cut by the sides, people mostly hidden behind someone drawn later,
// people too small to read. Only logs when rendered with inputProps {qa: true} (scripts/qa.mjs).
export type QABox = {name: string; x0: number; y0: number; x1: number; y1: number; head: number; edge?: boolean; overlapOk?: boolean; small?: boolean};
type StageCtx = {tx: number; ty: number; z: number; light: Light; boxes: QABox[]};
const StageCtxR = createContext<StageCtx | null>(null);
export const useStageCtx = () => useContext(StageCtxR);
export const useLight = (): Light => useContext(StageCtxR)?.light ?? 'day';
export const qaAdd = (ctx: StageCtx | null, b: QABox) => {
	if (ctx) ctx.boxes.push(b);
};
const QAReport: React.FC<{scene: string}> = ({scene}) => {
	const ctx = useContext(StageCtxR);
	const f = useCurrentFrame();
	if (!ctx || !(getInputProps() as {qa?: boolean}).qa) return null;
	const S = (b: QABox) => ({x0: ctx.tx + b.x0 * ctx.z, x1: ctx.tx + b.x1 * ctx.z, y0: ctx.ty + b.y0 * ctx.z, y1: ctx.ty + b.y1 * ctx.z, head: ctx.ty + b.head * ctx.z});
	const out: string[] = [];
	const vis = ctx.boxes.map((b) => ({b, r: S(b)})).filter(({r}) => r.x1 > 0 && r.x0 < 1920 && r.y1 > 0 && r.y0 < 1080);
	for (const {b, r} of vis) {
		const w = r.x1 - r.x0;
		const hh = r.head - r.y0;
		if (r.y0 < -0.3 * hh && r.head > 0) out.push(`${b.name}: head cut by the top edge`);
		if (r.head > 1080 + 0.25 * hh && r.y0 < 1080) out.push(`${b.name}: head cut by the bottom edge`);
		// someone lying down (wider than tall): most of them must be inside top to bottom
		const bh = r.y1 - r.y0;
		if (r.x1 - r.x0 > 1.3 * bh) {
			const below = Math.max(0, r.y1 - 1080) / bh;
			const above = Math.max(0, -r.y0) / bh;
			if (below > 0.35 && below < 1) out.push(`${b.name}: cut by the bottom edge (${Math.round(below * 100)}%)`);
			if (above > 0.35 && above < 1) out.push(`${b.name}: cut by the top edge (${Math.round(above * 100)}%)`);
		}
		const outL = Math.max(0, -r.x0);
		const outR = Math.max(0, r.x1 - 1920);
		const outF = Math.max(outL, outR) / w;
		if (!b.edge && outF > 0.18 && outF < 0.88) out.push(`${b.name}: cut by the ${outL > outR ? 'left' : 'right'} edge (${Math.round((Math.max(outL, outR) / w) * 100)}%)`);
		if (!b.small && r.y1 - r.y0 < 46) out.push(`${b.name}: tiny (${Math.round(r.y1 - r.y0)} px)`);
	}
	for (let i = 0; i < vis.length; i++) {
		for (let j = i + 1; j < vis.length; j++) {
			const a = vis[i];
			const c = vis[j];
			if (a.b.overlapOk || c.b.overlapOk) continue;
			const ix = Math.max(0, Math.min(a.r.x1, c.r.x1) - Math.max(a.r.x0, c.r.x0));
			const iy = Math.max(0, Math.min(a.r.y1, c.r.y1) - Math.max(a.r.y0, c.r.y0));
			const areaA = (a.r.x1 - a.r.x0) * (a.r.y1 - a.r.y0);
			// head of the one behind covered by the one in front
			const hx = Math.max(0, Math.min(a.r.x1, c.r.x1) - Math.max(a.r.x0 + (a.r.x1 - a.r.x0) * 0.25, c.r.x0));
			const hy = Math.max(0, Math.min(a.r.head, c.r.y1) - Math.max(a.r.y0, c.r.y0));
			const headArea = (a.r.x1 - a.r.x0) * 0.5 * (a.r.head - a.r.y0);
			if ((ix * iy) / areaA > 0.6) out.push(`${a.b.name}: mostly hidden behind ${c.b.name}`);
			else if (headArea > 0 && (hx * hy) / headArea > 0.55 && c.r.y0 < a.r.y0) out.push(`${a.b.name}: head covered by ${c.b.name}`);
		}
	}
	for (const o of out) console.log(`GQA ${scene} f=${f} ${o}`);
	return null;
};

/** One shot: the plate (an <Img>, so the render waits for it to load) and the drawing on top, under one camera.
 *  wash 0..1: the colours drain (0..0.5), then the plate becomes its pencil-outline "unfinished drawing" (0.4..1). */
export const Stage: React.FC<{set: SetId; z: number; f: Pt; t: number; light?: Light; shake?: number; wash?: number; children?: React.ReactNode; over?: React.ReactNode; qaScene?: string}> = ({set, z, f, t, light, shake = 0, wash = 0, children, over, qaScene = ''}) => {
	const lt: Light = light ?? (set.endsWith('_night') ? 'night' : 'day');
	const pf = MATS[lt][0];
	const c = camNums(z, f, t, shake);
	const w = clamp01(wash);
	const drain = clamp01(w / 0.5);
	const css = [pf ? `url(#pl_${lt})` : '', w > 0 ? `saturate(${1 - 0.9 * drain}) brightness(${1 + 1.1 * drain}) contrast(${1 - 0.45 * drain})` : ''].filter(Boolean).join(' ');
	const lineK = WHITE_SETS.has(set) ? clamp01((w - 0.4) / 0.6) : 0;
	return (
		<AbsoluteFill style={{background: set === 'paper' ? '#f4f3ee' : '#000', overflow: 'hidden'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<Defs />
			</svg>
			{set !== 'black' && set !== 'paper' ? (
				<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${c.tx}px, ${c.ty}px) scale(${c.z})`}}>
					<Img src={staticFile(`plates/${set}.jpg`)} style={{width: 1920, height: 1080, display: 'block', filter: css || undefined}} />
					{lineK > 0 ? <Img src={staticFile(`plates/${set}_white.jpg`)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: lineK}} /> : null}
				</div>
			) : null}
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
				<Defs />
				<StageCtxR.Provider value={{...c, light: lt, boxes: []}}>
					<g transform={`translate(${c.tx} ${c.ty}) scale(${c.z})`}>{children}</g>
					<QAReport scene={qaScene} />
				</StageCtxR.Provider>
			</svg>
			{over}
		</AbsoluteFill>
	);
};

export type ShotUi = (f: number, d: number) => React.ReactNode;

/** Draw a scene from its shot list: picks the shot, frames it, calls world(shot, local seconds).
 *  A shot with `ui` is a full-screen code UI (the editor, the phone), called with shot-local frame + length. */
export const Shots: React.FC<{shots: Shot[]; world: (s: Shot, local: number) => React.ReactNode; over?: (s: Shot) => React.ReactNode; overlay?: (s: Shot, local: number) => React.ReactNode}> = ({shots, world, over, overlay}) => {
	const {t, total, api} = useStick();
	const p = pickShot(shots, t, total);
	if (p.s.ui) {
		const fl = Math.round(p.local * FPS);
		const d = Math.max(1, Math.round(p.dur * FPS));
		return (
			<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
				{p.s.ui(fl, d)}
				{overlay ? overlay(p.s, p.local) : null}
			</AbsoluteFill>
		);
	}
	const z = lerp(p.s.z0, p.s.z1, p.k);
	const fp = p.s.track ? p.s.track(t) : lerpPt(p.s.f0, p.s.f1, p.k);
	const wash = typeof p.s.wash === 'function' ? p.s.wash(t) : p.s.wash ?? 0;
	return (
		<Stage set={p.s.set} z={z} f={fp} t={t} light={p.s.light} shake={p.s.shake} wash={wash} qaScene={api.scene.id} over={overlay ? overlay(p.s, p.local) : undefined}>
			{world(p.s, p.local)}
			{over ? over(p.s) : null}
		</Stage>
	);
};
/** a full-screen UI shot (the editor, the phone, a title) starting at scene time t */
export const ui = (t: number, draw: ShotUi, tag?: string): Shot => ({t, set: 'black', z0: 1, z1: 1, f0: [960, 540], f1: [960, 540], ui: draw, tag});

/** wobble line helper re-export for scenes */
export {wob, wobCircle, wobEllipse, wobLine, wobPoly};

/** walking from x0 to x1 between t0 and t1 (eased at both ends); phase for StickPerson legs */
export const walk = (t: number, t0: number, t1: number, x0: number, x1: number, s = 1) => {
	const k = clamp01((t - t0) / Math.max(1e-3, t1 - t0));
	const e = k < 0.15 ? (k * k) / 0.3 : k > 0.85 ? 1 - ((1 - k) * (1 - k)) / 0.3 : (k - 0.075) / 0.85;
	const x = lerp(x0, x1, Math.max(0, Math.min(1, e)));
	const moving = t > t0 && t < t1;
	return {x, moving, phase: Math.abs(x - x0) / (30 * s), dir: x1 >= x0 ? 1 : -1};
};
/** StickPerson props for a walk() result */
export const gait = (w: ReturnType<typeof walk>) => (w.moving ? {pose: 'walk' as const, turn: w.dir * 0.8, phase: w.phase} : {pose: 'stand' as const});
export const boilOfF = (frame: number) => boilOf(frame, 4) * 7;

/**
 * Framing solver: nudge a close shot (zoom +-12 %, focus +-spread px) so the left/right frame edges fall
 * BETWEEN people, never through them (each person is >= 88 % in or <= 12 % in), and lower the focus if a
 * visible head would be cut by the top edge. boxes: [x0, x1, headTop].
 */
export const fitFrame = (boxes: Array<[number, number, number]>, z: number, f: Pt, spread = 170, zr = 0.12): {z: number; f: Pt} => {
	let best = {z, f, score: Infinity};
	for (let dz = -zr; dz <= zr + 0.0001; dz += 0.02) {
		const zz = z * (1 + dz);
		const hw = 960 / zz;
		for (let dx = -spread; dx <= spread; dx += 4) {
			const fx = Math.max(hw, Math.min(1920 - hw, f[0] + dx));
			const L = fx - hw;
			const R = fx + hw;
			let bad = 0;
			for (const [a, b] of boxes) {
				const inside = Math.max(0, Math.min(b, R) - Math.max(a, L)) / (b - a);
				if (inside > 0.12 && inside < 0.88) bad += 1 + Math.min(inside, 1 - inside);
			}
			const score = bad * 10 + Math.abs(fx - f[0]) / spread + Math.abs(dz) * 2;
			if (score < best.score) best = {z: zz, f: [fx, f[1]], score};
		}
	}
	// nothing clean nearby: look further (wider spread and zoom range)
	if (best.score >= 10 && spread < 400) return fitFrame(boxes, z, f, 420, 0.24);
	// keep every visible head inside the top edge
	const hw = 960 / best.z;
	const hh = 540 / best.z;
	let fy = best.f[1];
	for (const [a, b, top] of boxes) {
		const inside = Math.max(0, Math.min(b, best.f[0] + hw) - Math.max(a, best.f[0] - hw)) / (b - a);
		if (inside >= 0.5 && fy - hh > top - 12) fy = top - 12 + hh;
	}
	return {z: best.z, f: [best.f[0], Math.max(hh, Math.min(1080 - hh, fy))]};
};
/** a static, fitted shot */
export const fshot = (boxes: Array<[number, number, number]>, t: number, set: SetId, z: number, f: Pt, extra: Partial<Shot> = {}): Shot => {
	const r = fitFrame(boxes, z, f);
	return {t, set, z0: r.z, z1: r.z, f0: r.f, f1: r.f, ...extra};
};
