// On-screen text for the station's voice: uppercase, cold, slightly unstable.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {hash1} from '../utils/random';

export type RadioTextProps = {
	text: string;
	/** Local frame where the text appears (default 0). */
	start?: number;
	/** Local frame where it disappears. */
	end?: number;
	size?: number;
	/** Vertical position in % of the frame height. */
	top?: number;
	color?: string;
	/** 0..1 glitchiness. */
	glitch?: number;
	/** Reveal letters one by one (per frame). */
	typeOn?: number;
	font?: string;
	letterSpacing?: string;
	seed?: number;
	/** Background panel behind the text for readability. */
	panel?: boolean;
	weight?: number;
	italic?: boolean;
};

export const RadioText: React.FC<RadioTextProps> = ({
	text,
	start = 0,
	end = Infinity,
	size = 88,
	top = 50,
	color = '#f1f3f0',
	glitch = 0.3,
	typeOn = 0,
	font = FONT.radio,
	letterSpacing = '0.22em',
	seed = 1,
	panel = false,
	weight = 400,
	italic = false,
}) => {
	const f = useCurrentFrame();
	if (f < start || f >= end) {
		return null;
	}
	const local = f - start;
	const shown = typeOn > 0 ? text.slice(0, Math.floor(local * typeOn) + 1) : text;
	const appear = ramp(local, 0, 3, 0, 1);
	const r = hash1(f, seed);
	const jitterX = r > 1 - glitch * 0.35 ? (hash1(f, seed + 1) - 0.5) * 24 * glitch : 0;
	const op = appear * (r > 1 - glitch * 0.12 ? 0.35 : 0.92 + 0.08 * hash1(f, seed + 2));
	const ab = 2 + glitch * 6 * hash1(f, seed + 3);
	const base: React.CSSProperties = {
		position: 'absolute',
		left: 0,
		right: 0,
		top: `${top}%`,
		transform: `translate(${jitterX}px, -50%)`,
		textAlign: 'center',
		fontFamily: font,
		fontSize: size,
		letterSpacing,
		whiteSpace: 'pre-wrap',
		padding: '0 120px',
		lineHeight: 1.15,
		fontWeight: weight,
		fontStyle: italic ? 'italic' : 'normal',
	};
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity: op}}>
			{panel && (
				<div
					style={{
						position: 'absolute',
						left: '10%',
						right: '10%',
						top: `${top}%`,
						height: size * 2.1,
						transform: 'translateY(-50%)',
						background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0) 72%)',
					}}
				/>
			)}
			<div style={{...base, color: 'rgba(255,40,40,0.55)', marginLeft: -ab, mixBlendMode: 'screen'}}>{shown}</div>
			<div style={{...base, color: 'rgba(40,220,255,0.5)', marginLeft: ab, mixBlendMode: 'screen'}}>{shown}</div>
			<div style={{...base, color, textShadow: '0 0 18px rgba(255,255,255,0.35)'}}>{shown}</div>
		</AbsoluteFill>
	);
};
