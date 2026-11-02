// Deterministic randomness. Remotion renders frames in parallel and out of
// order, so nothing may use Math.random(): every value is derived from a seed.

/** mulberry32 PRNG – returns a function producing floats in [0, 1). */
export const prng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Hash of an integer (or two) to a float in [0, 1). */
export const hash1 = (n: number, seed = 0): number => {
	let h = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35);
	h ^= h >>> 13;
	h = Math.imul(h, 0x27d4eb2f);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
};

export const hashString = (s: string): number => {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Smooth 1D value noise in [-1, 1]. */
export const noise1 = (x: number, seed = 0): number => {
	const i = Math.floor(x);
	const f = x - i;
	const a = hash1(i, seed) * 2 - 1;
	const b = hash1(i + 1, seed) * 2 - 1;
	return a + (b - a) * smooth(f);
};

/** Fractal noise (2 octaves) in roughly [-1, 1]. */
export const fbm1 = (x: number, seed = 0): number =>
	noise1(x, seed) * 0.66 + noise1(x * 2.13 + 17.1, seed + 7) * 0.34;
