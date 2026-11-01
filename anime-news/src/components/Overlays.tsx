import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {ALL_CUES, media, narrationTempKinds} from '../lib/timeline';
import {ramp} from '../lib/motion';
import {C, FONT, SAFE, SUB_BAND_H} from '../lib/theme';

/** Yellow sentence-case subtitles on a dark lower band, timed from the narration audio. */
export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = ALL_CUES.find((c) => f >= c.captionStart && f < c.captionEnd);
	// The band cuts in with the first caption, stays up through any pause
	// shorter than 2 s, and otherwise fades out after a short hold.
	let near = cue ? 1 : 0;
	if (!cue) {
		const prev = [...ALL_CUES].reverse().find((c) => c.captionEnd <= f);
		const next = ALL_CUES.find((c) => c.captionStart > f);
		if (prev && next && next.captionStart - prev.captionEnd <= 48) near = 1;
		else if (prev) near = 1 - Math.min(1, Math.max(0, f - prev.captionEnd - 24) / 6);
	}
	if (near <= 0) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: SUB_BAND_H,
					background: 'linear-gradient(180deg, rgba(4,5,8,0.78) 0%, rgba(4,5,8,0.9) 100%)',
					opacity: near,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{cue ? (
					<div
						style={{
							maxWidth: 1600,
							padding: `0 ${SAFE.x}px`,
							textAlign: 'center',
							fontFamily: FONT.body,
							fontWeight: 700,
							fontSize: 46,
							lineHeight: 1.24,
							color: C.subtitle,
							textShadow: '0 2px 0 rgba(0,0,0,0.85)',
							// at most two lines
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{cue.text}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

/** Small persistent mark required by the brief. */
export const IllustrationMark: React.FC<{from: number}> = ({from}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	return (
		<div
			style={{
				position: 'absolute',
				right: SAFE.x,
				top: SAFE.top,
				fontFamily: FONT.display,
				fontWeight: 600,
				fontSize: 19,
				letterSpacing: '0.24em',
				color: C.paper,
				opacity: 0.78,
				border: `1.5px solid rgba(237,230,214,0.55)`,
				padding: '5px 12px 5px 14px',
			}}
		>
			ANIMATED ILLUSTRATION
		</div>
	);
};

/** Production flag listing what is still temporary in this render. Disappears once everything is final. */
export const TempFlag: React.FC<{from: number; to: number; assetIds: string[]}> = ({from, to, assetIds}) => {
	const f = useCurrentFrame();
	const items: string[] = [];
	const missing = assetIds.filter((id) => !media.assets[id]?.file);
	if (missing.length) items.push(`PLACEHOLDER ART (${missing.join(' ')})`);
	const kinds = narrationTempKinds(from, to);
	if (kinds.has('tts')) items.push('AI NARRATION (Kokoro TTS)');
	if (kinds.has('scratch')) items.push('SCRATCH TTS VOICE');
	if (kinds.has('missing')) items.push('NARRATION MISSING');
	if (Object.values(media.sfx).some((s) => s.temp)) items.push('PROCEDURAL TEMP SFX');
	if (!items.length || f < from) return null;
	return (
		<div
			style={{
				position: 'absolute',
				right: SAFE.x,
				top: SAFE.top + 46,
				fontFamily: FONT.mono,
				fontWeight: 500,
				fontSize: 15,
				lineHeight: 1.45,
				color: '#fff',
				background: 'rgba(120,10,10,0.72)',
				padding: '6px 12px',
				textAlign: 'right',
			}}
		>
			<div style={{fontWeight: 500, letterSpacing: '0.12em'}}>ANIMATIC · TEMPORARY</div>
			{items.map((t) => (
				<div key={t}>{t}</div>
			))}
		</div>
	);
};

/** Film grain from pre-generated tiles (deterministic per frame) plus vignette. */
export const FilmTexture: React.FC = () => {
	const f = useCurrentFrame();
	const tile = f % 8;
	const ox = Math.floor(random(`gx${f}`) * 512);
	const oy = Math.floor(random(`gy${f}`) * 512);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: 0, overflow: 'hidden', mixBlendMode: 'overlay', opacity: 0.16}}>
				{Array.from({length: 15}, (_, i) => (
					<Img
						key={i}
						src={staticFile(`textures/grain_${tile}.png`)}
						style={{position: 'absolute', width: 512, height: 512, left: (i % 5) * 512 - ox, top: Math.floor(i / 5) * 512 - oy}}
					/>
				))}
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
		</AbsoluteFill>
	);
};

/** Short location / date label, kept above the subtitle band. */
export const LocationLabel: React.FC<{text: string; from: number; to: number}> = ({text, from, to}) => {
	const f = useCurrentFrame();
	if (f < from || f >= to) return null;
	const o = ramp(f, from, from + 6, 0, 1) * ramp(f, to - 6, to, 1, 0);
	const w = ramp(f, from, from + 8, 0, 100);
	return (
		<div style={{position: 'absolute', left: SAFE.x, top: SAFE.top + 60, opacity: o, display: 'flex', alignItems: 'stretch'}}>
			<div style={{width: 6, background: C.amber}} />
			<div
				style={{
					fontFamily: FONT.display,
					fontWeight: 600,
					fontSize: 34,
					letterSpacing: '0.12em',
					color: C.paper,
					background: 'rgba(7,9,13,0.72)',
					padding: '6px 18px 7px',
					clipPath: `inset(0 ${100 - w}% 0 0)`,
				}}
			>
				{text}
			</div>
		</div>
	);
};
