// Generated frames (scripts/images/restyle.py) brought to life.
//
// Every shot with `art` has a code-drawn layout; once its final frame(s) exist in
// public/restyle (listed in src/data/generated/restyle.json), this component shows them
// instead of the layout, and animates them:
//   - camera: a slow push and a handheld drift on every frame (or the shot's own `move`)
//   - action shots: 2-3 keyframes joined by short crossfades
//   - limited animation: extra DRAWINGS (variants merged onto the base frame, so the
//     background never boils) swap in on the shot's `seq`, with a 2-frame dissolve
//   - blinks: the eyes-closed drawing for 3 frames every 2.5-4.5 s (seeded, never in sync)
//   - doors: per door, the doors-open drawing is revealed from the latch edge toward the hinge
//     (the dark gap widening), one door after another
//   - talking shots: the mouth-open drawing swaps in while the line is loud (lip sync)
//   - flicker / shake / tremble / glitch / pulse / whiteout on the right beats
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import manifest from '../../data/generated/restyle.json';
import type {Art} from '../../data/art';
import {envelopeAt} from '../../data/speech';
import {FPS, type SceneTiming} from '../../data/timeline';
import {h01} from '../../utils/rough';

type Frame = {src: string; talk?: string};
type Door = [number, number, number, number, 'l' | 'r']; // x0, y0, x1, y1 (pixels of 1920x1080), hinge side
type Entry = {frames: Frame[]; variants?: Record<string, string>; blink?: string; doors?: {open: string; rects: Door[]}};
const SHOTS = ((manifest as {shots?: Record<string, Entry>}).shots ?? {}) as Record<string, Entry>;

export const hasRestyle = (id: string, art: Art) => Boolean(SHOTS[id]?.frames?.length) && Boolean(art);

/** A generated frame of a shot (for code composites), or null. */
export const restyleSrc = (id: string, k = 0): string | null => SHOTS[id]?.frames?.[k]?.src ?? null;

const XFADE = 5; // frames, between keyframes
const DRAW_FADE = 2; // frames, between drawings of a limited-animation sequence

/** Is any of `lines` loud at absolute time t? (smoothed over two frames so a mouth never pops for one frame) */
const speaking = (scene: SceneTiming, lines: string[], t: number) => {
	for (const id of lines) {
		const m = scene.markers[id];
		if (!m || t < m.start || t >= m.end) continue;
		const a = envelopeAt(id, t - m.start);
		const b = envelopeAt(id, Math.max(0, t - m.start - 1 / FPS));
		const e = a === null ? 0.5 + 0.5 * Math.sin(t * 19) : (a + (b ?? a)) / 2;
		if (e > 0.24) return true;
	}
	return false;
};

/** Seeded natural blinking: true while the eyes are closed (3 frames every 2.5-4.5 s). */
const blinking = (g: number, seed: number) => {
	let t = Math.floor(seed * 40); // first blink somewhere in the first 1.7 s
	let i = 0;
	while (t <= g) {
		if (g < t + 3) return true;
		t += Math.round(FPS * (2.5 + 2 * h01(i + Math.floor(seed * 997), 13)));
		i++;
	}
	return false;
};

const easeInOut = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

export const RestyledStill: React.FC<{id: string; art: Art; f: number; d: number; sceneFrame: number; scene: SceneTiming}> = ({id, art, f, d, sceneFrame, scene}) => {
	const entry = SHOTS[id];
	const g = scene.startFrame + sceneFrame; // global frame
	const t = Math.min(1, f / Math.max(1, d - 1));
	const seed = h01(g - f, 7);
	// camera: the shot's own move, or a slow push to a seeded point
	const mv = art.move ?? {};
	const z0 = mv.z0 ?? 1.03;
	const z1 = mv.z1 ?? 1.075;
	const ease = easeInOut(t);
	const z = z0 + (z1 - z0) * (art.fx === 'pulse' ? 0.5 + 0.5 * Math.sin((f / FPS) * 1.4) : ease);
	const cx = (mv.x0 ?? 0.5) + ((mv.x1 ?? mv.x0 ?? 0.5 + (seed - 0.5) * 0.03) - (mv.x0 ?? 0.5)) * ease;
	const cy = (mv.y0 ?? 0.5) + ((mv.y1 ?? mv.y0 ?? 0.5) - (mv.y0 ?? 0.5)) * ease;
	const tt = g / FPS;
	const hx = Math.sin(tt * 0.71 + seed * 6) * 3 + Math.sin(tt * 1.83) * 1.2;
	const hy = Math.sin(tt * 0.57 + seed * 4) * 2.4 + Math.sin(tt * 1.37 + 0.4) * 1;
	let sx = 0;
	let sy = 0;
	let bright = 1;
	if (art.fx === 'shake') {
		const k = Math.exp(-f / 8) * 18;
		sx = Math.sin(f * 2.1) * k;
		sy = Math.cos(f * 2.7) * k * 0.8;
	} else if (art.fx === 'tremble') {
		sx = (h01(f, 3) - 0.5) * 6;
		sy = (h01(f, 4) - 0.5) * 5;
	} else if (art.fx === 'flicker') {
		bright = h01(Math.floor(f / 2), 11) > 0.32 ? 1 : 0.22;
	}
	// keyframes
	const frames = entry.frames;
	const n = frames.length;
	const cuts = art.cuts && art.cuts.length === n ? art.cuts : frames.map((_, i) => i / n);
	let idx = 0;
	for (let i = 0; i < n; i++) if (f >= Math.round(cuts[i] * d)) idx = i;
	const into = f - Math.round(cuts[idx] * d);
	const fade = idx > 0 ? Math.min(1, into / XFADE) : 1;
	const frame = frames[idx];
	// limited animation: which drawing is up, and the one before it (for a short dissolve)
	const drawing = (name: string) => (name === 'base' ? frame.src : name === 'open' ? entry.doors?.open : entry.variants?.[name]) ?? frame.src;
	let src = frame.src;
	let before: string | null = null;
	let drawFade = 1;
	if (art.seq?.length) {
		let k = 0;
		for (let i = 0; i < art.seq.length; i++) if (f >= Math.round(art.seq[i][1] * d)) k = i;
		src = drawing(art.seq[k][0]);
		const since = f - Math.round(art.seq[k][1] * d);
		if (k > 0 && since < DRAW_FADE) {
			before = drawing(art.seq[k - 1][0]);
			drawFade = (since + 1) / (DRAW_FADE + 1);
		}
	} else if (art.show) {
		src = drawing(art.show);
	}
	// lip sync: the lines are this shot's own (a reused talking frame can speak other lines)
	if (frame.talk && art.talk?.length && speaking(scene, art.talk, tt) && src === frame.src) src = frame.talk;
	// blinks (only on the base drawing - the eyes-closed drawing was made from it)
	if (art.blink && entry.blink && src === frame.src && blinking(g, seed)) src = entry.blink;
	const prev = idx > 0 && fade < 1 ? frames[idx - 1] : null;
	const tx = (0.5 - cx) * 1920 * z + hx + sx;
	const ty = (0.5 - cy) * 1080 * z + hy + sy;
	const glitch = art.fx === 'glitch' && h01(Math.floor(f / 2), 5) > 0.55;
	const plate: React.CSSProperties = {
		position: 'absolute',
		left: 0,
		top: 0,
		width: 1920,
		height: 1080,
		transform: `translate(${tx}px, ${ty}px) scale(${z})`,
		filter: bright < 1 ? `brightness(${bright})` : undefined,
	};
	const full: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1920, height: 1080};
	// doors: the open drawing underneath, each door swinging open on its own cue
	const doors = entry.doors && art.doors ? entry.doors : null;
	let doorLayer: React.ReactNode = null;
	if (doors) {
		const start = Math.round((art.doors?.start ?? 0.05) * d);
		const stagger = (art.doors?.stagger ?? 0.28) * FPS;
		const swing = (art.doors?.swing ?? 0.55) * FPS;
		// a seeded opening order, so the doors do not open in a neat row
		const order = doors.rects.map((_, i) => i).sort((a, b) => h01(a + 3, 17) - h01(b + 3, 17));
		// each door: the dark gap opens at the latch edge and widens toward the hinge, revealing the
		// doors-open drawing inside that door's area only
		doorLayer = (
			<>
				<Img src={staticFile(frame.src)} style={full} />
				{order.map((i, k) => {
					const r = easeInOut((f - start - k * stagger) / swing);
					if (r <= 0) return null;
					const [x0, y0, x1, y1, hinge] = doors.rects[i];
					const w = x1 - x0;
					const clip =
						hinge === 'r'
							? `inset(${y0}px ${1920 - (x0 + w * r)}px ${1080 - y1}px ${x0}px)`
							: `inset(${y0}px ${1920 - x1}px ${1080 - y1}px ${x1 - w * r}px)`;
					return <Img key={i} src={staticFile(doors.open)} style={{...full, clipPath: clip}} />;
				})}
			</>
		);
	}
	const white = art.fx === 'whiteout' ? Math.max(0, (t - 0.35) / 0.65) : 0;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={plate}>
				{doorLayer ?? (
					<>
						{prev ? <Img src={staticFile(prev.src)} style={full} /> : null}
						{before ? <Img src={staticFile(before)} style={full} /> : null}
						<Img src={staticFile(src)} style={{...full, opacity: Math.min(fade, drawFade)}} />
					</>
				)}
				{glitch ? (
					<>
						<Img src={staticFile(src)} style={{...full, mixBlendMode: 'screen', opacity: 0.5, transform: 'translateX(14px)', filter: 'hue-rotate(160deg) saturate(3)'}} />
						<div style={{...full, background: `linear-gradient(180deg, transparent ${(h01(f, 9) * 80) | 0}%, rgba(255,255,255,0.12) ${((h01(f, 9) * 80) | 0) + 2}%, transparent ${((h01(f, 9) * 80) | 0) + 5}%)`}} />
					</>
				) : null}
			</div>
			{white > 0 ? <AbsoluteFill style={{background: '#f4f4f2', opacity: white}} /> : null}
		</AbsoluteFill>
	);
};
