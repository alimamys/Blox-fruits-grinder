// Generated frames (scripts/images/restyle.py, STYLE=semi2d) played as a motion comic.
//
// Every shot with `art` has a code-drawn layout; once its final frame(s) exist in
// public/restyle (listed in src/data/generated/restyle.json), this component shows them
// instead of the layout:
//   - a slow push and a handheld drift on every still (or the shot's own `move`)
//   - action shots: 2-3 keyframes joined by short crossfades
//   - talking shots: the mouth-open variant swaps in while the line is loud (lip sync
//     from the measured voice envelope). No drawn mouth overlay in this style.
//   - parallax: an optional separated foreground layer drifts more than the background
//   - flicker / shake / tremble / glitch / pulse / whiteout on the right beats
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import manifest from '../../data/generated/restyle.json';
import type {Art} from '../../data/art';
import {envelopeAt} from '../../data/speech';
import {FPS, type SceneTiming} from '../../data/timeline';
import {h01} from '../../utils/rough';

type Frame = {src: string; fg?: string; talk?: string};
type Entry = {frames: Frame[]};
const SHOTS = ((manifest as {shots?: Record<string, Entry>}).shots ?? {}) as Record<string, Entry>;

export const hasRestyle = (id: string, art: Art) => Boolean(SHOTS[id]?.frames?.length) && Boolean(art);

/** A generated frame of a shot (for code composites such as split screens), or null. */
export const restyleSrc = (id: string, k = 0): string | null => SHOTS[id]?.frames?.[k]?.src ?? null;

const XFADE = 5; // frames

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

export const RestyledStill: React.FC<{id: string; art: Art; f: number; d: number; sceneFrame: number; scene: SceneTiming}> = ({id, art, f, d, sceneFrame, scene}) => {
	const entry = SHOTS[id];
	const g = scene.startFrame + sceneFrame; // global frame
	const t = Math.min(1, f / Math.max(1, d - 1));
	const seed = h01(g - f, 7);
	// camera: the shot's own move, or a slow push to a seeded point
	const mv = art.move ?? {};
	const z0 = mv.z0 ?? 1.03;
	const z1 = mv.z1 ?? 1.075;
	const ease = t * t * (3 - 2 * t);
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
	// lip sync: the lines are this shot's own (a reused talking frame can speak other lines)
	const src = frame.talk && art.talk?.length && speaking(scene, art.talk, tt) ? frame.talk : frame.src;
	const prev = idx > 0 && fade < 1 ? frames[idx - 1] : null;
	const tx = (0.5 - cx) * 1920 * z + hx + sx;
	const ty = (0.5 - cy) * 1080 * z + hy + sy;
	const glitch = art.fx === 'glitch' && h01(Math.floor(f / 2), 5) > 0.55;
	const layer = (s: string, extra = 1, opacity = 1): React.CSSProperties => ({
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity,
		transform: `translate(${tx * extra}px, ${ty * extra}px) scale(${z * (extra > 1 ? 1.02 : 1)})`,
		filter: bright < 1 ? `brightness(${bright})` : undefined,
	});
	const white = art.fx === 'whiteout' ? Math.max(0, (t - 0.35) / 0.65) : 0;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{prev ? <Img src={staticFile(prev.src)} style={layer(prev.src)} /> : null}
			<Img src={staticFile(src)} style={layer(src, 1, fade)} />
			{frame.fg ? <Img src={staticFile(frame.fg)} style={layer(frame.fg, 1.7, fade)} /> : null}
			{glitch ? (
				<>
					<Img src={staticFile(src)} style={{...layer(src), mixBlendMode: 'screen', opacity: 0.5, transform: `translate(${tx + 14}px, ${ty}px) scale(${z})`, filter: 'hue-rotate(160deg) saturate(3)'}} />
					<AbsoluteFill style={{background: `linear-gradient(180deg, transparent ${(h01(f, 9) * 80) | 0}%, rgba(255,255,255,0.12) ${((h01(f, 9) * 80) | 0) + 2}%, transparent ${((h01(f, 9) * 80) | 0) + 5}%)`}} />
				</>
			) : null}
			{white > 0 ? <AbsoluteFill style={{background: '#f4f4f2', opacity: white}} /> : null}
		</AbsoluteFill>
	);
};
