import {Easing, interpolate} from 'remotion';
import {h01} from './rough';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** interpolate with clamping on both sides. */
export const lerpF = (f: number, f0: number, f1: number, v0: number, v1: number, ease: (t: number) => number = (t) => t) => {
	if (f1 <= f0) return f >= f1 ? v1 : v0;
	const t = clamp((f - f0) / (f1 - f0));
	return v0 + (v1 - v0) * ease(t);
};

export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

export const ramp = (f: number, f0: number, dur: number) => clamp((f - f0) / Math.max(1, dur));

/** Smooth 0->1 step around frame `at`. */
export const stepAt = (f: number, at: number, dur = 6) => interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});

/** Pulse that is 1 during [a, b) and 0 otherwise. */
export const between = (f: number, a: number, b: number) => (f >= a && f < b ? 1 : 0);

/** Flicker helper: returns 0/1 light state with a deterministic stutter pattern. */
export const flicker = (f: number, seed = 1, rate = 0.25) => (h01(Math.floor(f / 2), seed) > rate ? 1 : 0);

/** Damped shake offset for impacts at given frames. */
export const shake = (f: number, hits: number[], amp = 14, decay = 10): [number, number] => {
	let x = 0;
	let y = 0;
	for (const at of hits) {
		const d = f - at;
		if (d < 0 || d > decay * 4) continue;
		const k = Math.exp(-d / decay) * amp;
		x += Math.sin(d * 2.1 + at) * k;
		y += Math.cos(d * 2.7 + at * 0.3) * k * 0.8;
	}
	return [x, y];
};

/** Gentle ferry rocking (degrees, px). */
export const rocking = (f: number, amp = 1) => ({
	rot: Math.sin(f / 52) * 0.55 * amp + Math.sin(f / 23) * 0.12 * amp,
	dy: Math.sin(f / 41) * 5 * amp,
});

export const fmtClock = (totalSeconds: number, withSeconds = true) => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const hh = Math.floor(s / 3600) % 24;
	const mm = Math.floor(s / 60) % 60;
	const ss = s % 60;
	const p = (n: number) => String(n).padStart(2, '0');
	return withSeconds ? `${p(hh)}:${p(mm)}:${p(ss)}` : `${p(hh)}:${p(mm)}`;
};
