import {Easing, interpolate} from 'remotion';

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const easeInOut = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.4);

/** Clamped interpolation with an easing, deterministic per frame. */
export const ramp = (frame: number, from: number, to: number, a: number, b: number, easing = easeInOut) =>
	interpolate(frame, [from, to], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Camera framing: x/y = focus point in normalised plate space, z = zoom (1 = full plate). */
export type Cam = {x: number; y: number; z: number};

export const camLerp = (frame: number, from: number, to: number, a: Cam, b: Cam, easing = easeInOut): Cam => ({
	x: ramp(frame, from, to, a.x, b.x, easing),
	y: ramp(frame, from, to, a.y, b.y, easing),
	z: ramp(frame, from, to, a.z, b.z, easing),
});

export const at = (anchor: number[] | undefined, z: number, fallback: number[] = [0.5, 0.5]): Cam => {
	const [x, y] = anchor ?? fallback;
	return {x, y, z};
};

/** Smooth deterministic wobble in [-1, 1] (sum of incommensurate sines). */
export const drift = (frame: number, seed = 0, speed = 1) =>
	(Math.sin((frame * 0.031 + seed * 1.7) * speed) * 0.6 + Math.sin((frame * 0.017 + seed * 3.1) * speed) * 0.4);
