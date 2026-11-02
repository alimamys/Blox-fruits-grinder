// Scanlines, vignette, brightness flicker and a rolling bar – the analog layer.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {hash1} from '../utils/random';

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.7, color = '0,0,0'}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse at center, rgba(${color},0) 45%, rgba(${color},${strength}) 100%)`,
		}}
	/>
);

export const CRTNoise: React.FC<{
	scanlines?: number;
	flicker?: number;
	roll?: number;
	vignette?: number;
	seed?: number;
}> = ({scanlines = 0.25, flicker = 0.05, roll = 0.06, vignette = 0.6, seed = 3}) => {
	const f = useCurrentFrame();
	const flick = flicker * hash1(f, seed);
	const rollY = ((f * 3.3) % 1300) - 200;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{scanlines > 0 && (
				<AbsoluteFill
					style={{
						opacity: scanlines,
						background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px)',
					}}
				/>
			)}
			{roll > 0 && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: rollY,
						height: 160,
						background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1), rgba(255,255,255,0))',
						opacity: roll,
						mixBlendMode: 'overlay',
					}}
				/>
			)}
			{flick > 0 && <AbsoluteFill style={{background: '#000', opacity: flick}} />}
			{vignette > 0 && <Vignette strength={vignette} />}
		</AbsoluteFill>
	);
};

/** Full-frame flash (white or any colour) that decays. */
export const Flash: React.FC<{amount: number; color?: string}> = ({amount, color = '#fff'}) =>
	amount > 0.003 ? <AbsoluteFill style={{background: color, opacity: Math.min(1, amount), pointerEvents: 'none'}} /> : null;

/** Horizontal slice displacement glitch applied to children. */
export const GlitchSlices: React.FC<{amount: number; seed?: number; children: React.ReactNode}> = ({amount, seed = 1, children}) => {
	const f = useCurrentFrame();
	if (amount <= 0.01) {
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}
	const slices = 6;
	return (
		<AbsoluteFill>
			{Array.from({length: slices}).map((_, i) => {
				const top = (i / slices) * 100;
				const bottom = 100 - ((i + 1) / slices) * 100;
				const r = hash1(f * 31 + i, seed);
				const dx = r > 0.6 ? (hash1(f * 17 + i, seed + 1) - 0.5) * 120 * amount : 0;
				return (
					<AbsoluteFill key={i} style={{clipPath: `inset(${top}% 0 ${bottom}% 0)`, transform: `translateX(${dx}px)`}}>
						{children}
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
