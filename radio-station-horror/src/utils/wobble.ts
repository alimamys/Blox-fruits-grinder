// "Bad MS Paint" geometry: every shape is drawn as a slightly wobbly,
// hand-made path. Seeds keep shapes stable; the boil index (changing every few
// frames) makes the lines gently crawl like hand-drawn animation.
import {useCurrentFrame} from 'remotion';
import {LINE_BOIL} from '../config';
import {prng} from './random';

export type Pt = [number, number];

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

/** Current boil variant (0..variants-1). Add it to a seed to make a shape boil. */
export const useBoil = (): number => {
	const frame = useCurrentFrame();
	if (!LINE_BOIL.enabled) {
		return 0;
	}
	return Math.floor(frame / LINE_BOIL.holdFrames) % LINE_BOIL.variants;
};

/** Smooth path through points using quadratic curves between midpoints. */
const smoothPath = (pts: Pt[], closed: boolean): string => {
	if (pts.length < 2) {
		return '';
	}
	if (pts.length === 2) {
		return `M${fmt(pts[0][0])} ${fmt(pts[0][1])}L${fmt(pts[1][0])} ${fmt(pts[1][1])}`;
	}
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	if (closed) {
		const n = pts.length;
		const start = mid(pts[n - 1], pts[0]);
		let d = `M${fmt(start[0])} ${fmt(start[1])}`;
		for (let i = 0; i < n; i++) {
			const p = pts[i];
			const m = mid(p, pts[(i + 1) % n]);
			d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
		}
		return d + 'Z';
	}
	let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
	for (let i = 1; i < pts.length - 1; i++) {
		const m = mid(pts[i], pts[i + 1]);
		d += `Q${fmt(pts[i][0])} ${fmt(pts[i][1])} ${fmt(m[0])} ${fmt(m[1])}`;
	}
	const last = pts[pts.length - 1];
	return d + `L${fmt(last[0])} ${fmt(last[1])}`;
};

/**
 * Wobbly polyline / polygon through the given points.
 * @param amp jitter amplitude in px
 * @param segLen subdivide segments longer than this
 */
export const wobPath = (pts: Pt[], seed: number, amp = 2.5, closed = false, segLen = 46): string => {
	const rnd = prng(seed * 7919 + 13);
	const out: Pt[] = [];
	const n = pts.length;
	const segCount = closed ? n : n - 1;
	for (let i = 0; i < segCount; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const len = Math.hypot(dx, dy) || 1;
		const nx = -dy / len;
		const ny = dx / len;
		const steps = Math.max(1, Math.ceil(len / segLen));
		// vertex itself (keep corners crisp-ish by duplicating with small jitter)
		const j = (rnd() - 0.5) * amp;
		out.push([a[0] + j, a[1] + (rnd() - 0.5) * amp]);
		for (let s = 1; s < steps; s++) {
			const t = s / steps;
			const off = (rnd() - 0.5) * 2 * amp;
			out.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
		}
	}
	if (!closed) {
		const last = pts[n - 1];
		out.push([last[0] + (rnd() - 0.5) * amp, last[1] + (rnd() - 0.5) * amp]);
	}
	// Corners: re-insert exact-ish vertices twice so quadratic smoothing doesn't round them away.
	return closed ? polyClosed(out) : smoothPath(out, false);
};

/** For closed shapes we use straight segments: MS Paint polygons are angular. */
const polyClosed = (pts: Pt[]): string => {
	let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
	for (let i = 1; i < pts.length; i++) {
		d += `L${fmt(pts[i][0])} ${fmt(pts[i][1])}`;
	}
	return d + 'Z';
};

export const wobLine = (x1: number, y1: number, x2: number, y2: number, seed: number, amp = 2.5): string =>
	wobPath(
		[
			[x1, y1],
			[x2, y2],
		],
		seed,
		amp,
	);

export const wobRect = (x: number, y: number, w: number, h: number, seed: number, amp = 2.5): string =>
	wobPath(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
		],
		seed,
		amp,
		true,
		Math.max(40, Math.min(w, h) / 2),
	);

export const wobPoly = (pts: Pt[], seed: number, amp = 2.5): string => wobPath(pts, seed, amp, true);

/** Wobbly ellipse – a hand-drawn circle. */
export const wobEllipse = (
	cx: number,
	cy: number,
	rx: number,
	ry: number,
	seed: number,
	amp = 2.5,
	points?: number,
): string => {
	const rnd = prng(seed * 104729 + 7);
	const n = points ?? Math.max(10, Math.min(28, Math.round((rx + ry) / 7)));
	const pts: Pt[] = [];
	const rot = rnd() * Math.PI * 2;
	for (let i = 0; i < n; i++) {
		const a = rot + (i / n) * Math.PI * 2;
		const j = 1 + ((rnd() - 0.5) * 2 * amp) / Math.max(4, (rx + ry) / 2);
		pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
	}
	return smoothPath(pts, true);
};

/** Smooth open curve through points with jitter (for hair, scribbles, limbs). */
export const wobCurve = (pts: Pt[], seed: number, amp = 2): string => {
	const rnd = prng(seed * 3571 + 5);
	return smoothPath(
		pts.map(([x, y]) => [x + (rnd() - 0.5) * amp * 2, y + (rnd() - 0.5) * amp * 2] as Pt),
		false,
	);
};
