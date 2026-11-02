// Procedural TV static drawn on a small canvas and scaled up (cheap + deterministic).
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {prng} from '../utils/random';

export type StaticOverlayProps = {
	opacity?: number;
	seed?: number;
	/** Internal canvas width (height follows 16:9). Lower = chunkier. */
	res?: number;
	/** 0..1 strength of a barely-there face hidden in the noise (eyes + mouth). */
	face?: number;
	/** 0..1 number of bright horizontal tear lines. */
	tear?: number;
	/** CSS mix-blend-mode. */
	blend?: React.CSSProperties['mixBlendMode'];
	/** Multiply colour, e.g. '#9fe3b0' for green-ish static. */
	tint?: [number, number, number];
	/** Only redraw every N frames (choppy). */
	step?: number;
	style?: React.CSSProperties;
	/** 0..1 brightness bias. */
	brightness?: number;
};

const faceMask = (u: number, v: number): number => {
	const g = (cx: number, cy: number, rx: number, ry: number) => Math.exp(-(((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2));
	const head = g(0.5, 0.5, 0.17, 0.3) * 0.35;
	const eyes = g(0.44, 0.43, 0.035, 0.05) + g(0.56, 0.43, 0.035, 0.05);
	const mouth = g(0.5, 0.64, 0.028, 0.075);
	return head - (eyes + mouth) * 1.1;
};

export const StaticOverlay: React.FC<StaticOverlayProps> = ({
	opacity = 1,
	seed = 1,
	res = 384,
	face = 0,
	tear = 0.3,
	blend,
	tint = [1, 1, 1],
	step = 1,
	style,
	brightness = 0,
}) => {
	const frame = useCurrentFrame();
	const f = Math.floor(frame / step);
	const ref = useRef<HTMLCanvasElement>(null);
	const w = res;
	const h = Math.round((res * 9) / 16);

	useLayoutEffect(() => {
		const canvas = ref.current;
		if (!canvas || opacity <= 0) {
			return;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		const img = ctx.createImageData(w, h);
		const d = img.data;
		const rnd = prng(f * 7919 + seed * 104729);
		const tears: number[] = [];
		const tearCount = Math.floor(tear * 6 * rnd());
		for (let i = 0; i < tearCount; i++) {
			tears.push(Math.floor(rnd() * h));
		}
		for (let y = 0; y < h; y++) {
			const isTear = tears.includes(y) || tears.includes(y - 1);
			const rowBias = isTear ? 0.45 : 0;
			for (let x = 0; x < w; x++) {
				let v = rnd() + brightness;
				if (face > 0) {
					v += faceMask(x / w, y / h) * face;
				}
				v = Math.max(0, Math.min(1, v + rowBias)) * 255;
				const i = (y * w + x) * 4;
				d[i] = v * tint[0];
				d[i + 1] = v * tint[1];
				d[i + 2] = v * tint[2];
				d[i + 3] = 255;
			}
		}
		ctx.putImageData(img, 0, 0);
	}, [f, seed, w, h, face, tear, tint, opacity, brightness]);

	if (opacity <= 0) {
		return null;
	}
	return (
		<AbsoluteFill style={{opacity, mixBlendMode: blend, pointerEvents: 'none', ...style}}>
			<canvas ref={ref} width={w} height={h} style={{width: '100%', height: '100%', imageRendering: 'pixelated'}} />
		</AbsoluteFill>
	);
};

/** Subtle film grain used over the cartoon scenes. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => (
	<StaticOverlay opacity={opacity} res={480} tear={0} blend="overlay" seed={77} step={2} />
);
