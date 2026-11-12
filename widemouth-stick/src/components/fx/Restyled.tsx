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
import {envelopeAt, wordsOf} from '../../data/speech';
import {FPS, type SceneTiming} from '../../data/timeline';
import {h01} from '../../utils/rough';

type Frame = {src: string; talk?: string; talkHalf?: string};
type Door = [number, number, number, number, 'l' | 'r']; // x0, y0, x1, y1 (pixels of 1920x1080), hinge side
type Entry = {frames: Frame[]; variants?: Record<string, string>; blink?: string; doors?: {open: string; rects: Door[]}};
const SHOTS = ((manifest as unknown as {shots?: Record<string, Entry>}).shots ?? {}) as Record<string, Entry>;

export const hasRestyle = (id: string, art: Art) => Boolean(SHOTS[id]?.frames?.length) && Boolean(art);

/** A generated frame of a shot (for code composites), or null. */
export const restyleSrc = (id: string, k = 0): string | null => SHOTS[id]?.frames?.[k]?.src ?? null;

const XFADE = 5; // frames, between keyframes
const DRAW_FADE = 0; // drawings change on a clean cut (no dissolve: blended drawings ghost)

const syllables = (w: string) => Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, '').match(/[aeiouy]+/g) ?? []).length);

/**
 * How open is the mouth at absolute time t: 0 shut, 1 half, 2 open. Talking animation on twos, like
 * TV animation: once per syllable (from the measured word timings) the mouth goes half - open - half,
 * and it stays shut between words and through pauses. A word's syllables are never shorter than 0.2 s,
 * so nothing pops for a single frame; a quiet stretch inside a word (a whisper tail, a pause the
 * aligner swallowed) keeps it shut. Without word timings it falls back to the loudness.
 */
const mouthLevel = (scene: SceneTiming, lines: string[], t: number): 0 | 1 | 2 => {
	const tq = (Math.floor((t * FPS) / 2) * 2) / FPS; // on twos
	for (const id of lines) {
		const m = scene.markers[id];
		if (!m || tq < m.start || tq >= m.end) continue;
		const lt = tq - m.start;
		const words = wordsOf(id);
		if (!words.length) {
			const e = envelopeAt(id, lt);
			return (e === null ? Math.sin(lt * 19) > 0 : e > 0.24) ? 2 : 0;
		}
		for (const [w, a, b] of words) {
			if (lt < a || lt >= b) continue;
			const e = envelopeAt(id, lt);
			if (e !== null && e < 0.1) return 0;
			const n = Math.max(1, Math.min(syllables(w), Math.floor((b - a) / 0.2)));
			const sd = (b - a) / n;
			const ph = ((lt - a) % sd) / sd;
			return ph < 0.12 || ph >= 0.72 ? 0 : ph < 0.27 || ph >= 0.57 ? 1 : 2;
		}
		return 0;
	}
	return 0;
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

/** One door panel, cut from `panel` (the frame where this door is shut), turned in 3D around its
 *  hinge. angle 0 = shut, ~85 = wide open (seen almost edge-on). It swings away from us, into the flat. */
const SwingingDoor: React.FC<{panel: string; r: Door; angle: number}> = ({panel, r, angle}) => {
	const [x0, y0, x1, y1, hinge] = r;
	const w = x1 - x0;
	const h = y1 - y0;
	const k = Math.min(1, angle / 85);
	return (
		<div style={{position: 'absolute', left: x0, top: y0, width: w, height: h, perspective: `${Math.max(900, h * 2.4)}px`, perspectiveOrigin: hinge === 'l' ? '0% 50%' : '100% 50%'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					overflow: 'hidden',
					transformOrigin: `${hinge === 'l' ? 'left' : 'right'} center`,
					transform: `rotateY(${hinge === 'l' ? angle : -angle}deg)`,
					filter: `brightness(${1 - 0.6 * k})`,
					boxShadow: k > 0.02 ? `${hinge === 'l' ? '' : '-'}12px 0 24px rgba(0,0,0,${0.5 * k})` : undefined,
				}}
			>
				<Img src={staticFile(panel)} style={{position: 'absolute', left: -x0, top: -y0, width: 1920, height: 1080, maxWidth: 'none'}} />
			</div>
		</div>
	);
};

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
	if (frame.talk && art.talk?.length && src === frame.src) {
		const lv = mouthLevel(scene, art.talk, tt);
		if (lv === 2) src = frame.talk;
		else if (lv === 1) src = frame.talkHalf ?? frame.talk; // no half drawing (the people): open as before
	}
	// blinks (only on the base drawing - the eyes-closed drawing was made from it)
	if (art.blink && entry.blink && src === frame.src && blinking(g, seed)) src = entry.blink;
	const prev = idx > 0 && fade < 1 ? frames[idx - 1] : null;
	// the picture must always cover the frame: an off-centre move at low zoom (plus the handheld
	// drift and any shake) may never pull an edge into view
	const zz = Math.max(z, 1.015);
	const lim = (v: number, m: number) => Math.max(-m, Math.min(m, v));
	const tx = lim((0.5 - cx) * 1920 * zz + hx + sx, (zz - 1) * 960);
	const ty = lim((0.5 - cy) * 1080 * zz + hy + sy, (zz - 1) * 540);
	const glitch = art.fx === 'glitch' && h01(Math.floor(f / 2), 5) > 0.55;
	const plate: React.CSSProperties = {
		position: 'absolute',
		left: 0,
		top: 0,
		width: 1920,
		height: 1080,
		transform: `translate(${tx}px, ${ty}px) scale(${zz})`,
		filter: bright * (art.grade ?? 1) !== 1 ? `brightness(${bright * (art.grade ?? 1)})` : undefined,
	};
	const full: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1920, height: 1080};
	// doors: the open drawing underneath, each door swinging open on its own cue
	const doors = entry.doors && art.doors ? entry.doors : null;
	let doorLayer: React.ReactNode = null;
	if (doors) {
		const start = Math.round((art.doors?.start ?? 0.05) * d);
		const stagger = (art.doors?.stagger ?? 0.28) * FPS;
		const swing = (art.doors?.swing ?? 0.9) * FPS;
		// a seeded opening order, so the doors do not open in a neat row
		const order = doors.rects.map((_, i) => i).sort((a, b) => h01(a + 3, 17) - h01(b + 3, 17));
		// each door: the panel from the shut frame swings open on its hinge (into the flat) over the
		// doors-open drawing; with `close`, the shut panel swings closed over the open frame instead.
		// Regions too wide to be one door (a doorway with people) fade instead of swinging.
		const closing = Boolean(art.doors?.close);
		const shut = closing ? doors.open : frame.src;
		const under = closing ? frame.src : doors.open;
		doorLayer = (
			<>
				<Img src={staticFile(under)} style={full} />
				{order.map((i, k) => {
					const p = easeInOut((f - start - k * stagger) / swing);
					const r = doors.rects[i];
					const wide = r[2] - r[0] > 0.2 * 1920;
					const openness = closing ? 1 - p : p; // 0 shut .. 1 open
					if (wide) {
						const [x0, y0, x1, y1] = r;
						return <Img key={i} src={staticFile(shut)} style={{...full, clipPath: `inset(${y0}px ${1920 - x1}px ${1080 - y1}px ${x0}px)`, opacity: 1 - openness}} />;
					}
					if (openness >= 0.995) return null;
					return <SwingingDoor key={i} panel={shut} r={r} angle={85 * openness} />;
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
