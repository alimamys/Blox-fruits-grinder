// Full-screen "signal analyser" used whenever the station speaks: dark screen,
// waveform, frequency read-out, signal bars, static and analog glitches.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {FONT} from '../utils/fonts';
import {hash1, noise1} from '../utils/random';
import {CRTNoise} from './CRTNoise';
import {SpeechWave} from './SpeechWave';
import {StaticOverlay} from './StaticOverlay';

export type RadioVoiceScreenProps = {
	/** 0..1 voice level. */
	level: number;
	mode?: 'speech' | 'beep' | 'noise';
	/** Frequency read-out, e.g. "07.117". */
	freq?: string;
	theme?: 'green' | 'amber' | 'red';
	/** Clock shown bottom-right, e.g. "01:17". */
	clock?: string;
	staticAmount?: number;
	/** 0..1 hidden face in the static. */
	face?: number;
	seed?: number;
	/** Freeze waveform (repetition / recording effect). */
	frozenAt?: number;
	label?: string;
	children?: React.ReactNode;
};

const THEMES = {
	green: {fg: '#7dff9a', dim: 'rgba(125,255,154,0.18)', bg: '#030805'},
	amber: {fg: '#ffb347', dim: 'rgba(255,179,71,0.18)', bg: '#0a0502'},
	red: {fg: '#ff4a3d', dim: 'rgba(255,74,61,0.2)', bg: '#0b0202'},
};

export const RadioVoiceScreen: React.FC<RadioVoiceScreenProps> = ({
	level,
	mode = 'speech',
	freq = '07.117',
	theme = 'green',
	clock = '01:17',
	staticAmount = 0.12,
	face = 0,
	seed = 1,
	frozenAt,
	label = 'RX — UNLISTED CARRIER',
	children,
}) => {
	const f = useCurrentFrame();
	const t = THEMES[theme];
	const bars = Math.round(2 + level * 3 + noise1(f * 0.2, seed) * 0.8);
	const blink = Math.floor(f / 12) % 2 === 0;
	return (
		<AbsoluteFill style={{background: t.bg}}>
			<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} style={{position: 'absolute'}}>
				{/* grid */}
				{Array.from({length: 13}).map((_, i) => (
					<line key={`v${i}`} x1={160 + i * 133} y1={180} x2={160 + i * 133} y2={820} stroke={t.dim} strokeWidth={1.5} />
				))}
				{Array.from({length: 7}).map((_, i) => (
					<line key={`h${i}`} x1={160} y1={180 + i * 106.6} x2={1760} y2={180 + i * 106.6} stroke={t.dim} strokeWidth={i === 3 ? 3 : 1.5} />
				))}
				<SpeechWave x={160} y={410} w={1600} h={380} level={level} mode={mode} color={t.fg} seed={seed} frozenAt={frozenAt} strokeWidth={5} points={220} />
				{/* spectrum */}
				{Array.from({length: 48}).map((_, i) => {
					const v = Math.max(0.04, (Math.abs(noise1(i * 0.6 + f * 0.35, seed + 4)) * 0.9 + 0.1) * (0.15 + level));
					const hgt = v * 70;
					return <rect key={i} x={160 + i * 33.4} y={975 - hgt} width={24} height={hgt} fill={t.fg} opacity={0.55} />;
				})}
			</svg>
			<div style={{position: 'absolute', left: 160, top: 70, fontFamily: FONT.vcr, fontSize: 52, color: t.fg, letterSpacing: 3}}>
				{blink ? '●' : '○'} {freq} MHz <span style={{opacity: 0.6, fontSize: 40}}>AM · BW 6k</span>
			</div>
			<div style={{position: 'absolute', left: 160, top: 128, fontFamily: FONT.vcr, fontSize: 34, color: t.fg, opacity: 0.6, letterSpacing: 4}}>{label}</div>
			<div style={{position: 'absolute', right: 160, top: 80, display: 'flex', alignItems: 'flex-end', gap: 10}}>
				<span style={{fontFamily: FONT.vcr, fontSize: 38, color: t.fg, marginRight: 12}}>SIG</span>
				{[0, 1, 2, 3, 4].map((i) => (
					<div key={i} style={{width: 18, height: 18 + i * 12, background: i < bars ? t.fg : t.dim}} />
				))}
			</div>
			<div style={{position: 'absolute', right: 160, bottom: 50, fontFamily: FONT.vcr, fontSize: 46, color: t.fg, opacity: 0.8}}>
				{clock}:{String(Math.floor(f / 30) % 60).padStart(2, '0')}
			</div>
			{children}
			<StaticOverlay opacity={staticAmount + (hash1(Math.floor(f / 3), seed) > 0.92 ? 0.25 : 0)} face={face} blend="screen" seed={seed + 3} tear={0.5} />
			<CRTNoise scanlines={0.35} roll={0.08} vignette={0.75} />
		</AbsoluteFill>
	);
};
