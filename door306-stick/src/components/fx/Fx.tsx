// Overlays and text treatments: grain, vignette, lighting states, emergency
// lights, PA captions, big numbers, crude labels, glitch.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeOut, lerpF} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {boilOf, h01, h1, wobLine, wobPoly} from '../../utils/rough';
import {useSettings} from '../../data/settings';

export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.07}) => {
	const {grain} = useSettings();
	if (!grain) return null;
	const i = f % 4;
	const ox = Math.floor(h01(f, 1) * 256);
	const oy = Math.floor(h01(f, 2) * 256);
	return (
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile(`textures/grain_${i}.png`)})`,
				backgroundPosition: `${ox}px ${oy}px`,
				backgroundSize: '256px 256px',
				opacity,
				mixBlendMode: 'overlay',
				pointerEvents: 'none',
			}}
		/>
	);
};

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.55, color = '0,0,0'}) => {
	const {grain} = useSettings();
	if (!grain && strength < 0.8) return null;
	return <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)`, pointerEvents: 'none'}} />;
};

/** Lighting state on top of an interior. */
export const LightsOverlay: React.FC<{state: 'on' | 'dim' | 'off' | 'red' | 'black'; f: number; flickerOn?: boolean}> = ({state, f}) => {
	if (state === 'on') return null;
	if (state === 'black') return <AbsoluteFill style={{background: '#000'}} />;
	if (state === 'dim') return <AbsoluteFill style={{background: 'rgba(0,0,10,0.45)'}} />;
	if (state === 'off') return <AbsoluteFill style={{background: 'rgba(0,0,4,0.93)'}} />;
	return <EmergencyLights f={f} />;
};

/** Red emergency lighting with a slow rotating beacon pulse. */
export const EmergencyLights: React.FC<{f: number; intensity?: number}> = ({f, intensity = 1}) => {
	const pulse = 0.5 + 0.5 * Math.sin(f / 7);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: '#a80000', mixBlendMode: 'multiply', opacity: 0.85 * intensity}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse at ${30 + pulse * 40}% 0%, rgba(255,40,20,${0.35 * intensity}) 0%, rgba(0,0,0,0) 60%)`}} />
			<AbsoluteFill style={{background: `rgba(0,0,0,${0.25 + 0.15 * (1 - pulse)})`}} />
		</AbsoluteFill>
	);
};

/** Flash-to-white or flash-to-black for a few frames. */
export const Flash: React.FC<{f: number; at: number; dur?: number; color?: string}> = ({f, at, dur = 3, color = '#fff'}) => {
	if (f < at || f >= at + dur) return null;
	return <AbsoluteFill style={{background: color, opacity: 1 - (f - at) / dur}} />;
};

/** Hand-written crude label with an arrow - very "YouTube MS Paint". */
export const CrudeLabel: React.FC<{x: number; y: number; text: string; f: number; ax?: number; ay?: number; color?: string; size?: number; appear?: number}> = ({
	x,
	y,
	text,
	f,
	ax,
	ay,
	color = '#fff',
	size = 54,
	appear = 0,
}) => {
	const o = clamp((f - appear) / 6);
	const sd = boilOf(f, 4) * 3 + text.length;
	return (
		<g opacity={o}>
			<text x={x} y={y} fontFamily={FONT.hand} fontSize={size} fill={color} stroke="#000" strokeWidth={6} paintOrder="stroke" textAnchor="middle">
				{text}
			</text>
			{ax !== undefined && ay !== undefined ? (
				<g stroke={color} strokeWidth={6} fill="none" strokeLinecap="round">
					<path d={wobLine(x, y + 14, ax, ay, sd, 3, 3)} stroke="#000" strokeWidth={11} />
					<path d={wobLine(x, y + 14, ax, ay, sd, 3, 3)} />
					<path d={`M${ax},${ay} l${(x - ax) * 0.18 + 14},${(y - ay) * 0.18 - 6} M${ax},${ay} l${(x - ax) * 0.18 - 10},${(y - ay) * 0.18 + 12}`} />
				</g>
			) : null}
		</g>
	);
};

/** The huge passenger-count numbers. `prev` is scribbled out when `value` arrives. */
export const PassengerCounter: React.FC<{
	f: number;
	value: string;
	prev?: string;
	switchAt?: number;
	color?: string;
	label?: string;
	size?: number;
	bg?: string;
	y?: number;
}> = ({f, value, prev, switchAt = 0, color = '#ffffff', label, size = 360, bg = 'rgba(0,0,0,0)', y = 0}) => {
	const showNew = !prev || f >= switchAt;
	const k = showNew && prev ? easeOut(clamp((f - switchAt) / 6)) : 1;
	const scribble = prev && f >= switchAt - 10 ? clamp((f - (switchAt - 10)) / 8) : 0;
	const sd = boilOf(f, 3);
	return (
		<AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px)`}}>
			{label ? (
				<div style={{position: 'absolute', top: 230, fontFamily: FONT.hand, fontSize: 64, color: '#d7dde6', letterSpacing: 4}}>{label}</div>
			) : null}
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				{prev && !showNew ? (
					<text x={960} y={540 + size * 0.36} textAnchor="middle" fontFamily={FONT.marker} fontSize={size} fill={color} stroke="#000" strokeWidth={12} paintOrder="stroke">
						{prev}
					</text>
				) : null}
				{prev && !showNew && scribble > 0 ? (
					<path
						d={wobPoly(
							Array.from({length: 9}, (_, i) => [760 + i * 50 * scribble, 420 + (i % 2) * 220] as [number, number]),
							sd,
							10,
							false,
						)}
						stroke="#e32b2b"
						strokeWidth={26}
						fill="none"
						strokeLinecap="round"
					/>
				) : null}
				{showNew ? (
					<g transform={`translate(960 540) scale(${0.85 + 0.15 * k}) translate(-960 -540)`} opacity={k}>
						<text x={960} y={540 + size * 0.36} textAnchor="middle" fontFamily={FONT.marker} fontSize={size} fill={color} stroke="#000" strokeWidth={12} paintOrder="stroke">
							{value}
						</text>
					</g>
				) : null}
			</svg>
		</AbsoluteFill>
	);
};

/** Big caption for a major phrase (white, slightly uneven). */
export const BigText: React.FC<{f: number; text: string; appear?: number; size?: number; color?: string; y?: number; font?: string; spacing?: number; fadeIn?: number}> = ({
	f,
	text,
	appear = 0,
	size = 110,
	color = '#f2f2f2',
	y = 540,
	font = FONT.marker,
	spacing = 4,
	fadeIn = 5,
}) => {
	const o = clamp((f - appear) / Math.max(1, fadeIn));
	// punch in: overshoot then settle
	const pt = clamp((f - appear) / 7);
	const pop = 1 + 0.32 * (1 - pt) * (1 - pt) - 0.04 * Math.sin(pt * Math.PI);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start'}}>
			<div
				style={{
					position: 'absolute',
					top: y - size * 0.62,
					width: '100%',
					textAlign: 'center',
					fontFamily: font,
					fontSize: size,
					letterSpacing: spacing,
					color,
					opacity: o,
					textShadow: '0 0 18px rgba(0,0,0,0.9), 4px 4px 0 #000',
					transform: `rotate(${h1(text.length) * 0.8}deg) scale(${pop})`,
					lineHeight: 1.05,
					whiteSpace: 'pre-line',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

/** PA announcement caption with a speaker waveform. `intimacy` 0..1 fades the PA styling away. */
export const PAOverlay: React.FC<{f: number; text: string; appear?: number; intimacy?: number; red?: boolean}> = ({f, text, appear = 0, intimacy = 0, red = false}) => {
	const o = clamp((f - appear) / 5);
	const bars = 28;
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 70, opacity: o}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 26,
					padding: '22px 40px',
					background: `rgba(${red ? '40,0,0' : '6,10,18'},${0.78 - intimacy * 0.4})`,
					border: `3px solid rgba(255,255,255,${0.35 - intimacy * 0.25})`,
					borderRadius: 16,
				}}
			>
				<svg width={70} height={70} viewBox="0 0 70 70">
					<path d="M8,26 L22,26 L38,12 L38,58 L22,44 L8,44 Z" fill="#e9eef5" />
					{[0, 1, 2].map((i) => (
						<path key={i} d={`M${46 + i * 8},${22 - i * 6} Q${56 + i * 10},35 ${46 + i * 8},${48 + i * 6}`} stroke="#e9eef5" strokeWidth={4} fill="none" opacity={0.4 + 0.6 * h01(Math.floor(f / 3), i)} />
					))}
				</svg>
				<div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
					<div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: `rgba(200,215,235,${0.8 - intimacy * 0.6})`}}>PA · ALL DECKS</div>
					<div style={{fontFamily: intimacy > 0.6 ? FONT.hand : FONT.ui, fontWeight: intimacy > 0.6 ? 400 : 700, fontSize: intimacy > 0.6 ? 66 : 52, color: '#fff', letterSpacing: intimacy > 0.6 ? 2 : 3}}>
						{text}
					</div>
				</div>
				<svg width={180} height={60} viewBox="0 0 180 60">
					{Array.from({length: bars}, (_, i) => {
						const hh = 6 + 46 * Math.abs(Math.sin(f * 0.6 + i * 0.9)) * h01(i, Math.floor(f / 2));
						return <rect key={i} x={i * 6.4} y={30 - hh / 2} width={4} height={hh} fill="#9fd0ff" opacity={0.8} />;
					})}
				</svg>
			</div>
		</AbsoluteFill>
	);
};

/** Short digital glitch: horizontal slices offset + RGB tint. Wrap content. */
export const Glitch: React.FC<{f: number; active: boolean; children: React.ReactNode; strength?: number}> = ({f, active, children, strength = 1}) => {
	if (!active) return <>{children}</>;
	const slices = 7;
	return (
		<AbsoluteFill>
			{Array.from({length: slices}, (_, i) => {
				const top = (i / slices) * 100;
				const off = h1(f, i) * 60 * strength;
				return (
					<AbsoluteFill key={i} style={{clipPath: `inset(${top}% 0 ${100 - top - 100 / slices}% 0)`, transform: `translateX(${off}px)`}}>
						{children}
					</AbsoluteFill>
				);
			})}
			<AbsoluteFill style={{background: 'rgba(255,0,60,0.12)', mixBlendMode: 'screen', transform: `translateX(${6 * strength}px)`}} />
		</AbsoluteFill>
	);
};

/** Crude fallback card used when realistic evidence inserts are disabled. */
export const CrudeCard: React.FC<{f: number; title: string; lines?: string[]}> = ({f, title, lines = []}) => {
	const sd = boilOf(f, 4);
	return (
		<AbsoluteFill style={{background: '#0b0f18'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<path d={wobPoly([[360, 180], [1560, 180], [1560, 900], [360, 900]], sd, 4)} fill="#f2efe4" stroke="#111" strokeWidth={8} />
				<text x={960} y={330} textAnchor="middle" fontFamily={FONT.marker} fontSize={72} fill="#1a1a1a">
					{title}
				</text>
				{lines.map((l, i) => (
					<text key={i} x={960} y={460 + i * 90} textAnchor="middle" fontFamily={FONT.hand} fontSize={64} fill="#2a2a2a">
						{l}
					</text>
				))}
			</svg>
		</AbsoluteFill>
	);
};

/** Wrapper: realistic evidence when enabled, crude card otherwise. */
export const Evidence: React.FC<{f: number; title: string; lines?: string[]; children: React.ReactNode}> = ({f, title, lines, children}) => {
	const {evidenceInserts} = useSettings();
	if (!evidenceInserts) return <CrudeCard f={f} title={title} lines={lines} />;
	return <>{children}</>;
};

/** Fade helper for whole shots. */
export const FadeIn: React.FC<{f: number; dur?: number; children: React.ReactNode; from?: string}> = ({f, dur = 8, children, from = '#000'}) => (
	<AbsoluteFill>
		{children}
		<AbsoluteFill style={{background: from, opacity: 1 - clamp(f / dur), pointerEvents: 'none'}} />
	</AbsoluteFill>
);

export const ImgFill: React.FC<{src: string}> = ({src}) => <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

export const lerpOpacity = lerpF;
