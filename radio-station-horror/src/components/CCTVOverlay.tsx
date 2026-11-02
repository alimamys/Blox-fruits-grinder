// Security-camera treatment: desaturated grey-green image, low frame rate,
// grain, interlacing, burned-in camera label and timestamp.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {hash1} from '../utils/random';
import {CRTNoise, Vignette} from './CRTNoise';
import {StaticOverlay} from './StaticOverlay';

export const CCTV_FILTER = 'grayscale(1) sepia(0.45) hue-rotate(58deg) saturate(0.55) contrast(1.18) brightness(0.92) blur(0.9px)';

const shadow = '2px 2px 0 rgba(0,0,0,0.85), -1px -1px 0 rgba(0,0,0,0.6)';

export const CCTVOverlay: React.FC<{
	camera: string;
	date: string;
	/** hh:mm:ss */
	time: string;
	rec?: boolean;
	grain?: number;
}> = ({camera, date, time, rec = true, grain = 0.2}) => {
	const f = useCurrentFrame();
	const label: React.CSSProperties = {
		position: 'absolute',
		fontFamily: FONT.vcr,
		color: '#f2f5ee',
		textShadow: shadow,
		letterSpacing: 2,
	};
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<StaticOverlay opacity={grain} res={640} tear={0.15} blend="overlay" seed={33} step={2} />
			<StaticOverlay opacity={0.05} res={320} tear={0.4} blend="screen" seed={34} step={2} />
			<CRTNoise scanlines={0.32} roll={0.05} flicker={0.06} vignette={0} />
			<Vignette strength={0.8} />
			<div style={{...label, left: 70, top: 50, fontSize: 52}}>{camera}</div>
			<div style={{...label, right: 70, top: 50, fontSize: 52}}>{date}</div>
			<div style={{...label, left: 70, bottom: 54, fontSize: 64}}>{time}</div>
			{rec && (
				<div style={{...label, right: 70, bottom: 58, fontSize: 52, display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{color: '#ff4040', opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0.15}}>●</span>REC
				</div>
			)}
			{/* occasional interlace jitter line */}
			{hash1(Math.floor(f / 2), 9) > 0.8 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: hash1(f, 10) * 1080, height: 3, background: 'rgba(255,255,255,0.35)'}} />
			)}
		</AbsoluteFill>
	);
};
