/**
 * Anime background-painting helpers (SVG, deterministic). Background art in
 * anime is painted without outlines: gradient skies, sculpted cumulus clouds
 * with lit rims and cool shadows, glints on water, god rays and lens flares.
 */
import React from 'react';
import {random} from 'remotion';

export const range = (n: number) => Array.from({length: n}, (_, i) => i);

/** Sculpted anime cumulus: shadow mass, lit mass toward the light, bright rim. */
export const Cumulus: React.FC<{
	id: string;
	x: number;
	y: number; // flat base line
	w: number;
	h: number;
	shadow: string;
	lit: string;
	rim: string;
	light?: [number, number]; // direction toward the light (unit-ish)
	puffs?: number;
	opacity?: number;
}> = ({id, x, y, w, h, shadow, lit, rim, light = [0.5, -0.6], puffs = 9, opacity = 1}) => {
	const pts = range(puffs).map((i) => {
		const t = (i + 0.5) / puffs;
		const dome = Math.sin(t * Math.PI);
		const r = (h * (0.35 + 0.65 * dome)) * (0.75 + 0.4 * random(`${id}r${i}`));
		return {cx: x + (t - 0.5) * w, cy: y - dome * h * 0.55 - r * 0.15, r};
	});
	const extra = range(Math.floor(puffs / 2)).map((i) => {
		const p = pts[1 + ((i * 2) % (puffs - 2))];
		return {cx: p.cx + (random(`${id}ex${i}`) - 0.5) * w * 0.12, cy: p.cy - p.r * 0.55, r: p.r * 0.6};
	});
	const all = [...pts, ...extra];
	const [lx, ly] = light;
	return (
		<g opacity={opacity}>
			<clipPath id={`cl-${id}`}>
				<rect x={x - w} y={y - h * 3} width={w * 2} height={h * 3} />
			</clipPath>
			<g clipPath={`url(#cl-${id})`}>
				{all.map((p, i) => (
					<circle key={`s${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={shadow} />
				))}
				{all.map((p, i) => (
					<circle key={`l${i}`} cx={p.cx + lx * p.r * 0.28} cy={p.cy + ly * p.r * 0.28} r={p.r * 0.8} fill={lit} />
				))}
				{all.map((p, i) => (
					<circle key={`h${i}`} cx={p.cx + lx * p.r * 0.5} cy={p.cy + ly * p.r * 0.5} r={p.r * 0.45} fill={rim} />
				))}
			</g>
		</g>
	);
};

/** Four-point anime sparkle that twinkles. */
export const Sparkle: React.FC<{x: number; y: number; r: number; phase: number; color?: string}> = ({x, y, r, phase, color = '#fffaf0'}) => {
	const s = Math.max(0, Math.sin(phase));
	if (s < 0.05) return null;
	const R = r * s;
	const k = R * 0.16;
	return (
		<g>
			<path d={`M${x},${y - R} L${x + k},${y - k} L${x + R},${y} L${x + k},${y + k} L${x},${y + R} L${x - k},${y + k} L${x - R},${y} L${x - k},${y - k} Z`} fill={color} />
			<circle cx={x} cy={y} r={R * 0.35} fill={color} opacity={0.6} />
		</g>
	);
};

/** Fan of god rays from a light source. */
export const GodRays: React.FC<{id: string; x: number; y: number; angle: number; spread: number; length: number; count?: number; color: string; opacity: number; frame: number}> = ({
	id,
	x,
	y,
	angle,
	spread,
	length,
	count = 7,
	color,
	opacity,
	frame,
}) => (
	<g style={{mixBlendMode: 'screen'}}>
		<defs>
			<radialGradient id={`gr-${id}`} cx={x} cy={y} r={length} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor={color} stopOpacity={opacity} />
				<stop offset="1" stopColor={color} stopOpacity={0} />
			</radialGradient>
		</defs>
		{range(count).map((i) => {
			const a = angle - spread / 2 + (spread * (i + 0.5)) / count + Math.sin(frame * 0.01 + i) * 0.01;
			const w = 0.018 + random(`${id}w${i}`) * 0.03;
			const flick = 0.65 + 0.35 * Math.sin(frame * 0.04 + i * 1.9);
			return (
				<polygon
					key={i}
					points={`${x},${y} ${x + Math.cos(a - w) * length},${y + Math.sin(a - w) * length} ${x + Math.cos(a + w) * length},${y + Math.sin(a + w) * length}`}
					fill={`url(#gr-${id})`}
					opacity={flick}
				/>
			);
		})}
	</g>
);

/** Anime lens flare: glare star at the source plus ghosts toward frame centre. */
export const LensFlare: React.FC<{x: number; y: number; frame: number; strength?: number}> = ({x, y, frame, strength = 1}) => {
	const cx = 960;
	const cy = 540;
	const ghosts = [
		{t: 0.35, r: 26, c: '#ffd59a', o: 0.22},
		{t: 0.6, r: 14, c: '#9fe3ff', o: 0.25},
		{t: 0.85, r: 48, c: '#ff9ad2', o: 0.12},
		{t: 1.2, r: 20, c: '#c6ffb0', o: 0.18},
		{t: 1.45, r: 70, c: '#ffcf7a', o: 0.08},
	];
	const pulse = 0.9 + 0.1 * Math.sin(frame * 0.08);
	return (
		<g style={{mixBlendMode: 'screen'}} opacity={strength * pulse}>
			<rect x={x - 260} y={y - 1.5} width={520} height={3} fill="#fff1d6" opacity={0.6} />
			<rect x={x - 1.2} y={y - 120} width={2.4} height={240} fill="#fff1d6" opacity={0.4} />
			{ghosts.map((g, i) => {
				const gx = x + (cx - x) * g.t * 2;
				const gy = y + (cy - y) * g.t * 2;
				const sides = 6;
				const pts = range(sides)
					.map((k) => `${gx + Math.cos((k / sides) * Math.PI * 2 + 0.3) * g.r},${gy + Math.sin((k / sides) * Math.PI * 2 + 0.3) * g.r}`)
					.join(' ');
				return <polygon key={i} points={pts} fill={g.c} opacity={g.o} />;
			})}
		</g>
	);
};

/** Water glints: a field of twinkling sparkles inside a band. */
export const WaterGlints: React.FC<{frame: number; seed: string; count: number; x0: number; x1: number; y0: number; y1: number; size: number; color?: string}> = ({
	frame,
	seed,
	count,
	x0,
	x1,
	y0,
	y1,
	size,
	color,
}) => (
	<g>
		{range(count).map((i) => {
			const depth = random(`${seed}d${i}`);
			const y = y0 + Math.pow(depth, 1.6) * (y1 - y0);
			const x = x0 + random(`${seed}x${i}`) * (x1 - x0) + Math.sin(frame * 0.02 + i) * 4;
			const sp = 0.12 + random(`${seed}s${i}`) * 0.18;
			return <Sparkle key={i} x={x} y={y} r={size * (0.4 + depth)} phase={frame * sp + random(`${seed}p${i}`) * 20} color={color} />;
		})}
	</g>
);
