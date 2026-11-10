// "MS Paint" line generator. Every shape is built from a few jittered points so
// outlines look hand-drawn and uneven. Passing a `boil` value that changes every
// few frames makes the lines gently re-draw themselves (classic line boil).

export type Pt = [number, number];

/** Deterministic hash -> [-1, 1]. */
export const h1 = (a: number, b = 0, c = 0): number => {
	let x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453123;
	x = x - Math.floor(x);
	return x * 2 - 1;
};

/** Deterministic hash -> [0, 1). */
export const h01 = (a: number, b = 0, c = 0): number => (h1(a, b, c) + 1) / 2;

export const jitter = (p: Pt, seed: number, i: number, amp: number): Pt => [p[0] + h1(seed, i, 1) * amp, p[1] + h1(seed, i, 2) * amp];

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth path through points (quadratic through midpoints). */
export const smoothPath = (pts: Pt[], closed: boolean): string => {
	if (pts.length < 2) return '';
	if (!closed) {
		if (pts.length === 2) return `M${f(pts[0][0])},${f(pts[0][1])}L${f(pts[1][0])},${f(pts[1][1])}`;
		let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
		for (let i = 1; i < pts.length - 1; i++) {
			const m = mid(pts[i], pts[i + 1]);
			d += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(m[0])},${f(m[1])}`;
		}
		const last = pts[pts.length - 1];
		return d + `L${f(last[0])},${f(last[1])}`;
	}
	const n = pts.length;
	const m0 = mid(pts[n - 1], pts[0]);
	let d = `M${f(m0[0])},${f(m0[1])}`;
	for (let i = 0; i < n; i++) {
		const m = mid(pts[i], pts[(i + 1) % n]);
		d += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(m[0])},${f(m[1])}`;
	}
	return d + 'Z';
};

/** Wobbly polygon / polyline. */
export const wob = (pts: Pt[], seed: number, amp = 2, closed = true): string =>
	smoothPath(
		pts.map((p, i) => jitter(p, seed, i, amp)),
		closed,
	);

/** Straight-edged wobbly polygon (corners stay sharp - for furniture, screens, hulls). */
export const wobPoly = (pts: Pt[], seed: number, amp = 2, closed = true): string => {
	const j = pts.map((p, i) => jitter(p, seed, i, amp));
	let d = `M${f(j[0][0])},${f(j[0][1])}`;
	for (let i = 1; i < j.length; i++) {
		// a slight bow in each edge
		const a = j[i - 1];
		const b = j[i];
		const m = mid(a, b);
		const bow = h1(seed, i, 9) * amp * 0.8;
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const len = Math.hypot(dx, dy) || 1;
		d += `Q${f(m[0] - (dy / len) * bow)},${f(m[1] + (dx / len) * bow)} ${f(b[0])},${f(b[1])}`;
	}
	if (closed) {
		const a = j[j.length - 1];
		const b = j[0];
		const m = mid(a, b);
		d += `Q${f(m[0])},${f(m[1])} ${f(b[0])},${f(b[1])}Z`;
	}
	return d;
};

export const circlePts = (cx: number, cy: number, rx: number, ry = rx, n = 10, rot = 0): Pt[] =>
	Array.from({length: n}, (_, i) => {
		const a = rot + (i / n) * Math.PI * 2;
		return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
	});

export const wobCircle = (cx: number, cy: number, r: number, seed: number, amp = r * 0.05, n = 10): string => wob(circlePts(cx, cy, r, r, n, h1(seed, 3) * 0.5), seed, amp, true);

export const wobEllipse = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 2, n = 12): string =>
	wob(circlePts(cx, cy, rx, ry, n, h1(seed, 3) * 0.4), seed, amp, true);

export const wobLine = (x1: number, y1: number, x2: number, y2: number, seed: number, amp = 2, segs = 2): string => {
	const pts: Pt[] = [];
	for (let i = 0; i <= segs; i++) {
		const t = i / segs;
		pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
	}
	return wob(pts, seed, amp, false);
};

export const wobRect = (x: number, y: number, w: number, h: number, seed: number, amp = 2): string =>
	wobPoly(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
		],
		seed,
		amp,
	);

/** Boil value - changes every `every` frames so outlines subtly redraw. */
export const boilOf = (frame: number, every = 3): number => Math.floor(frame / every);
