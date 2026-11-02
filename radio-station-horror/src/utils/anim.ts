// Small animation helpers on top of Remotion's interpolate().
import {Easing, interpolate} from 'remotion';
import {hash1, noise1} from './random';

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const EASE = {
	inOut: Easing.bezier(0.45, 0, 0.55, 1),
	out: Easing.bezier(0.16, 1, 0.3, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	slowIn: Easing.bezier(0.6, 0, 0.9, 0.5),
	linear: (t: number) => t,
};

/** interpolate() with clamping on both sides and an optional easing. */
export const ramp = (
	f: number,
	from: number,
	to: number,
	outFrom = 0,
	outTo = 1,
	easing: (t: number) => number = EASE.inOut,
): number => {
	if (to <= from) {
		return f >= from ? outTo : outFrom;
	}
	return interpolate(f, [from, to], [outFrom, outTo], {
		easing,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

/** Piecewise keyframes: [[frame, value], ...] with clamped ends. */
export const keys = (
	f: number,
	kf: Array<[number, number]>,
	easing: (t: number) => number = EASE.inOut,
): number => {
	if (kf.length === 0) {
		return 0;
	}
	if (f <= kf[0][0]) {
		return kf[0][1];
	}
	for (let i = 0; i < kf.length - 1; i++) {
		const [f0, v0] = kf[i];
		const [f1, v1] = kf[i + 1];
		if (f >= f0 && f <= f1) {
			if (f1 === f0) {
				return v1;
			}
			return lerp(v0, v1, easing((f - f0) / (f1 - f0)));
		}
	}
	return kf[kf.length - 1][1];
};

/** 1 during [start, start+dur), else 0. */
export const between = (f: number, start: number, end: number) => (f >= start && f < end ? 1 : 0);

/** A quick attack / exponential decay envelope starting at `start`. */
export const hit = (f: number, start: number, decayFrames = 10): number => {
	if (f < start) {
		return 0;
	}
	return Math.exp(-(f - start) / decayFrames);
};

/** Fade in over `inF` frames at `start`, fade out over `outF` frames before `end`. */
export const fadeInOut = (f: number, start: number, end: number, inF = 6, outF = 6): number =>
	Math.min(ramp(f, start, start + inF, 0, 1, EASE.linear), ramp(f, end - outF, end, 1, 0, EASE.linear));

/** Random on/off flicker, deterministic. `density` = probability of "on". */
export const flicker = (f: number, seed = 0, density = 0.5, holdFrames = 2): number =>
	hash1(Math.floor(f / holdFrames), seed) < density ? 1 : 0;

/** Smooth wandering value in [-1, 1] – used for handheld cameras, swaying, etc. */
export const wander = (f: number, speed = 0.02, seed = 0): number => noise1(f * speed, seed);

/** Typewriter: number of characters visible. */
export const typed = (f: number, start: number, charsPerFrame = 1): number =>
	Math.max(0, Math.floor((f - start) * charsPerFrame));

/** Hold a value on N-frame steps (choppy CCTV / stop-motion feel). */
export const stepFrame = (f: number, step: number) => Math.floor(f / step) * step;
