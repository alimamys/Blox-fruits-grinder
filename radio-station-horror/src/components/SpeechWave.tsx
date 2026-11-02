// Oscilloscope-style waveform for the station's voice (SVG, ~160 points).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {noise1} from '../utils/random';

export type SpeechWaveProps = {
	x: number;
	y: number;
	w: number;
	h: number;
	/** 0..1 overall level (0 = flat line with hiss). */
	level: number;
	/** 'speech' = syllable-like bursts, 'beep' = clean sine, 'noise' = static hash. */
	mode?: 'speech' | 'beep' | 'noise';
	color?: string;
	seed?: number;
	/** Freeze the wave (identical repeated recordings). */
	frozenAt?: number;
	strokeWidth?: number;
	points?: number;
};

export const SpeechWave: React.FC<SpeechWaveProps> = ({x, y, w, h, level, mode = 'speech', color = '#7dff9a', seed = 1, frozenAt, strokeWidth = 4, points = 160}) => {
	const frame = useCurrentFrame();
	const f = frozenAt ?? frame;
	const pts: string[] = [];
	for (let i = 0; i <= points; i++) {
		const t = i / points;
		const edge = Math.sin(Math.PI * t);
		let v = 0;
		if (mode === 'beep') {
			v = Math.sin(t * 60 + f * 0.9) * level;
		} else if (mode === 'noise') {
			v = noise1(i * 1.7 + f * 13.1, seed) * level;
		} else {
			// speech: carrier modulated by a syllable envelope travelling across the screen
			const syll = Math.max(0, noise1(t * 6 - f * 0.22, seed)) * 1.4;
			const carrier = Math.sin(t * 140 + f * 1.7) * 0.6 + Math.sin(t * 57 - f * 0.9) * 0.4;
			v = carrier * syll * level;
		}
		const hiss = noise1(i * 3.1 + f * 7.7, seed + 9) * 0.04;
		const yy = y + (v * edge + hiss) * (h / 2);
		pts.push(`${(x + t * w).toFixed(1)},${yy.toFixed(1)}`);
	}
	const d = pts.join(' ');
	return (
		<g>
			<polyline points={d} fill="none" stroke={color} strokeWidth={strokeWidth * 4} opacity={0.15} strokeLinejoin="round" />
			<polyline points={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
		</g>
	);
};
