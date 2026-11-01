/**
 * Reusable, deterministic motion FX. They sit on top of any plate — real
 * artwork or placeholder — so shots stay alive after the art is replaced.
 */
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {ramp} from '../lib/motion';

const range = (n: number) => Array.from({length: n}, (_, i) => i);

/** Smooth pseudo-handheld offset (px / deg) for a frame. */
export const handheld = (frame: number, amp = 1, seed = 0) => {
	const t = frame + seed * 97;
	const n = (a: number, b: number, c: number) => Math.sin(t * a + seed) * 0.55 + Math.sin(t * b + seed * 2.3) * 0.3 + Math.sin(t * c + seed * 4.1) * 0.15;
	return {x: n(0.043, 0.11, 0.27) * 6 * amp, y: n(0.037, 0.093, 0.31) * 4 * amp, r: n(0.029, 0.071, 0.19) * 0.22 * amp};
};

/** Wraps children in a gentle handheld camera (with overscan so edges never show). */
export const Handheld: React.FC<{amp?: number; seed?: number; shake?: number; children: React.ReactNode}> = ({amp = 1, seed = 0, shake = 0, children}) => {
	const f = useCurrentFrame();
	const h = handheld(f, amp, seed);
	// optional high-frequency vibration (e.g. a bus on a rough road)
	const jx = shake ? (random(`jx${f}`) - 0.5) * shake : 0;
	const jy = shake ? (random(`jy${f}`) - 0.5) * shake * 1.4 : 0;
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${h.x + jx}px, ${h.y + jy}px) rotate(${h.r}deg) scale(${1 + 0.012 * amp + shake * 0.002})`}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Floating dust / ash motes catching the light. */
export const Motes: React.FC<{count?: number; color?: string; seed?: string; drift?: [number, number]; size?: number; opacity?: number; area?: [number, number, number, number]}> = ({
	count = 60,
	color = '#f3c27a',
	seed = 'm',
	drift = [0.25, -0.35],
	size = 3,
	opacity = 0.7,
	area = [0, 0, 1920, 1080],
}) => {
	const f = useCurrentFrame();
	const [ax, ay, aw, ah] = area;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<svg width="1920" height="1080" viewBox="0 0 1920 1080">
				{range(count).map((i) => {
					const depth = 0.4 + random(`${seed}d${i}`) * 0.9;
					const x = ax + ((random(`${seed}x${i}`) * aw + f * drift[0] * depth + Math.sin(f * 0.05 + i) * 6) % aw + aw) % aw;
					const y = ay + ((random(`${seed}y${i}`) * ah + f * drift[1] * depth) % ah + ah) % ah;
					const tw = 0.5 + 0.5 * Math.sin(f * (0.08 + random(`${seed}t${i}`) * 0.12) + i);
					return <circle key={i} cx={x} cy={y} r={size * depth} fill={color} opacity={opacity * tw * depth * 0.8} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Soft diagonal band of light passing across the frame every `period` frames. */
export const LightSweep: React.FC<{period?: number; offset?: number; color?: string; strength?: number; angle?: number; width?: number}> = ({
	period = 90,
	offset = 0,
	color = '255,214,150',
	strength = 0.25,
	angle = 105,
	width = 12,
}) => {
	const f = useCurrentFrame();
	const p = (((f + offset) % period) + period) % period / period;
	const pos = -30 + p * 160;
	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				mixBlendMode: 'screen',
				background: `linear-gradient(${angle}deg, rgba(${color},0) ${pos - width}%, rgba(${color},${strength}) ${pos}%, rgba(${color},0) ${pos + width}%)`,
			}}
		/>
	);
};

/** Drifting haze bands (sea mist, smoke, chamber haze). */
export const Haze: React.FC<{y?: number; h?: number; color?: string; opacity?: number; speed?: number; seed?: number}> = ({y = 500, h = 140, color = '230,170,120', opacity = 0.18, speed = 0.4, seed = 0}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{range(3).map((i) => {
				const x = ((f * speed * (0.6 + i * 0.3) + seed * 300 + i * 700) % 2600) - 700;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y + i * h * 0.35 + Math.sin(f * 0.02 + i) * 8,
							width: 1300,
							height: h,
							borderRadius: '50%',
							background: `radial-gradient(ellipse at center, rgba(${color},${opacity}) 0%, rgba(${color},0) 70%)`,
							filter: 'blur(6px)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** Anime concentration lines radiating from a point; redrawn every 2 frames. */
export const SpeedLines: React.FC<{cx?: number; cy?: number; opacity?: number; inner?: number; count?: number; color?: string}> = ({
	cx = 960,
	cy = 470,
	opacity = 0.35,
	inner = 330,
	count = 90,
	color = '#f3e6cf',
}) => {
	const f = useCurrentFrame();
	const k = Math.floor(f / 2);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity}}>
			<svg width="1920" height="1080" viewBox="0 0 1920 1080">
				{range(count).map((i) => {
					const a = (i / count) * Math.PI * 2 + random(`sa${i}-${k}`) * 0.05;
					const r0 = inner + random(`sr${i}-${k}`) * 260;
					const w = 1.5 + random(`sw${i}-${k}`) * 5;
					const x0 = cx + Math.cos(a) * r0;
					const y0 = cy + Math.sin(a) * r0;
					const x1 = cx + Math.cos(a) * 1400;
					const y1 = cy + Math.sin(a) * 1400;
					const nx = -Math.sin(a) * w;
					const ny = Math.cos(a) * w;
					return <polygon key={i} points={`${x0},${y0} ${x1 + nx},${y1 + ny} ${x1 - nx},${y1 - ny}`} fill={color} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Short full-frame impact flash that decays over `dur` frames. */
export const Flash: React.FC<{at: number; dur?: number; color?: string; strength?: number}> = ({at, dur = 5, color = '#fff4e0', strength = 0.45}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + dur) return null;
	return <AbsoluteFill style={{background: color, opacity: ramp(f, at, at + dur, strength, 0), mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

/** Rising embers / sparks. */
export const Embers: React.FC<{count?: number; seed?: string; opacity?: number}> = ({count = 40, seed = 'e', opacity = 0.8}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<svg width="1920" height="1080" viewBox="0 0 1920 1080">
				{range(count).map((i) => {
					const sp = 0.8 + random(`${seed}s${i}`) * 2.2;
					const life = 1080 + 200;
					const y = 1100 - (((random(`${seed}y${i}`) * life + f * sp) % life));
					const x = random(`${seed}x${i}`) * 1920 + Math.sin(f * 0.04 * sp + i) * 30;
					const r = 1.2 + random(`${seed}r${i}`) * 2.6;
					const tw = 0.6 + 0.4 * Math.sin(f * 0.3 + i * 2);
					return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? '#ffb45c' : '#ff6a3d'} opacity={opacity * tw} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Blink curve: 0 open … 1 closed. Deterministic, irregular intervals. */
export const blinkAt = (frame: number, seed = 0, minGap = 58, maxGap = 110) => {
	let t = 0;
	let i = 0;
	// walk the deterministic blink schedule up to this frame
	while (t <= frame) {
		const gap = minGap + Math.floor(random(`blink${seed}-${i}`) * (maxGap - minGap));
		const start = t + gap;
		const d = frame - start;
		if (d >= 0 && d < 6) return [0.45, 1, 1, 0.7, 0.35, 0.1][d];
		t = start;
		i++;
		if (i > 200) break;
	}
	return 0;
};

export const breathe = (frame: number, seed = 0, period = 100) => Math.sin((frame / period) * Math.PI * 2 + seed);
