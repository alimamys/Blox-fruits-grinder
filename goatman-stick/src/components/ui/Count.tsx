// The film's motif: whenever someone counts, the number is scratched onto the frame - a rough
// marker digit that flickers in like a thought you can't shake, then sinks away.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';

export const CountMark: React.FC<{f: number; d: number; n: string; x?: number; y?: number; size?: number; red?: boolean; from?: number}> = ({
	f,
	d,
	n,
	x = 0.78,
	y = 0.42,
	size = 300,
	red = false,
	from = 0,
}) => {
	const t = f - from;
	if (t < 0) return null;
	const flick = t < 2 ? 0.5 : t < 3 ? 0.15 : t < 5 ? 0.9 : 1;
	const o = flick * clamp((d - f) / 10) * 0.88;
	const jitter = Math.sin(t * 1.7) * 1.2;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: `${x * 100}%`,
					top: `${y * 100}%`,
					transform: `translate(-50%, -50%) rotate(${-4 + jitter}deg) scale(${1 + 0.04 * clamp(t / 40)})`,
					fontFamily: FONT.hand,
					fontSize: size,
					lineHeight: 1,
					color: red ? '#e0332b' : '#f1ece0',
					opacity: o,
					textShadow: '0 0 30px rgba(0,0,0,0.85), 0 6px 18px rgba(0,0,0,0.9)',
					WebkitTextStroke: '5px rgba(0,0,0,0.6)',
					fontWeight: 400,
					letterSpacing: -6,
				}}
			>
				{n}
			</div>
		</AbsoluteFill>
	);
};
