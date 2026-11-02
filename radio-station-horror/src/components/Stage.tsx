// A 1920×1080 SVG "set" with a virtual camera.
//
// <Stage cam={{x: 900, y: 500, zoom: 1.4}} handheld={0.3} shake={hit(f, knock)}>
//   <Layer depth={0.4}>{background}</Layer>   ← moves less = parallax
//   <Layer>{foreground}</Layer>
// </Stage>
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {keys} from '../utils/anim';
import {hash1, noise1} from '../utils/random';

export type Cam = {
	/** World point the camera looks at (default centre). */
	x?: number;
	y?: number;
	zoom?: number;
	/** Degrees. */
	rot?: number;
};

type StageValue = {transformFor: (depth: number) => string};
const StageCtx = createContext<StageValue>({transformFor: () => ''});

type StageProps = {
	cam?: Cam;
	/** 0..1 subtle handheld drift (use during panic, not everywhere). */
	handheld?: number;
	/** 0..1 impulse shake for this frame (e.g. hit(f, knockFrame)). */
	shake?: number;
	bg?: string;
	seed?: number;
	children: React.ReactNode;
	/** HTML rendered above the SVG (text, overlays) – not affected by the camera. */
	overlay?: React.ReactNode;
	style?: React.CSSProperties;
};

export const Stage: React.FC<StageProps> = ({cam = {}, handheld = 0, shake = 0, bg = '#000', seed = 1, children, overlay, style}) => {
	const f = useCurrentFrame();
	const x = cam.x ?? WIDTH / 2;
	const y = cam.y ?? HEIGHT / 2;
	const zoom = cam.zoom ?? 1;
	const rot = cam.rot ?? 0;

	const hx = handheld * (noise1(f * 0.035, seed) * 14 + noise1(f * 0.11, seed + 3) * 3);
	const hy = handheld * (noise1(f * 0.03, seed + 9) * 10 + noise1(f * 0.13, seed + 5) * 3);
	const hr = handheld * noise1(f * 0.025, seed + 21) * 0.6;
	const sx = shake * (hash1(f, seed + 101) * 2 - 1) * 34;
	const sy = shake * (hash1(f, seed + 202) * 2 - 1) * 26;
	const sr = shake * (hash1(f, seed + 303) * 2 - 1) * 1.2;

	const value: StageValue = {
		transformFor: (d) => {
			const z = 1 + (zoom - 1) * d;
			const fx = WIDTH / 2 + (x - WIDTH / 2) * d;
			const fy = HEIGHT / 2 + (y - HEIGHT / 2) * d;
			const ox = WIDTH / 2 + (hx + sx) * Math.max(0.4, d);
			const oy = HEIGHT / 2 + (hy + sy) * Math.max(0.4, d);
			return `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) rotate(${((rot + hr + sr) * Math.max(0.5, d)).toFixed(3)}) scale(${z.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`;
		},
	};

	return (
		<AbsoluteFill style={{backgroundColor: bg, overflow: 'hidden', ...style}}>
			<StageCtx.Provider value={value}>
				<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
					{children}
				</svg>
			</StageCtx.Provider>
			{overlay}
		</AbsoluteFill>
	);
};

/** A parallax layer. depth 1 = moves with the camera, 0 = fixed to screen. */
export const Layer: React.FC<{depth?: number; children: React.ReactNode; opacity?: number}> = ({depth = 1, children, opacity}) => {
	const {transformFor} = useContext(StageCtx);
	return (
		<g transform={transformFor(depth)} opacity={opacity}>
			{children}
		</g>
	);
};

/** Interpolate camera keyframes: [[frame, {x, y, zoom, rot}], ...]. Missing fields default to centre / 1. */
export const camKeys = (f: number, kf: Array<[number, Cam]>, easing?: (t: number) => number): Cam => {
	const pick = (k: keyof Cam, def: number) => keys(f, kf.map(([fr, c]) => [fr, c[k] ?? def] as [number, number]), easing);
	return {
		x: pick('x', WIDTH / 2),
		y: pick('y', HEIGHT / 2),
		zoom: pick('zoom', 1),
		rot: pick('rot', 0),
	};
};
