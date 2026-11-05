// <CCTVOverlay/> - fixed-angle security camera look: desaturated, soft, noisy,
// compression blocks, scanlines, timestamp. Absolutely static framing.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {FONT} from '../../utils/fonts';
import {h01} from '../../utils/rough';
import {useSettings} from '../../data/settings';

export const CCTVOverlay: React.FC<{
	f: number;
	children: React.ReactNode;
	camera?: string;
	timestamp: string;
	date?: string;
	paused?: boolean;
	frameNo?: number;
	speed?: string;
	glitch?: number;
	tint?: string;
}> = ({f, children, camera = 'NORTH STAR 8\nCABIN CAMERA 04', timestamp, date = '— — —', paused = false, frameNo, speed, glitch = 0, tint = 'rgba(40,70,60,0.12)'}) => {
	const {cctvOverlay} = useSettings();
	const bx = Math.floor(h01(Math.floor(f / 2), 1) * 64);
	const by = Math.floor(h01(Math.floor(f / 2), 2) * 64);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					filter: cctvOverlay ? `grayscale(0.6) contrast(1.2) brightness(0.92) blur(${1.3 + glitch * 2}px)` : undefined,
					transform: glitch ? `translateX(${(h01(f, 5) - 0.5) * 40 * glitch}px)` : undefined,
				}}
			>
				{children}
			</AbsoluteFill>
			{cctvOverlay ? (
				<>
					<AbsoluteFill style={{background: tint, mixBlendMode: 'screen'}} />
					<AbsoluteFill
						style={{
							backgroundImage: `url(${staticFile(`textures/grain_${f % 4}.png`)})`,
							backgroundSize: '320px 320px',
							opacity: 0.22 + glitch * 0.3,
							mixBlendMode: 'overlay',
						}}
					/>
					<AbsoluteFill
						style={{
							backgroundImage: `url(${staticFile('textures/blocks.png')})`,
							backgroundSize: '256px 256px',
							backgroundPosition: `${bx}px ${by}px`,
							opacity: 0.06 + glitch * 0.25,
							mixBlendMode: 'overlay',
						}}
					/>
					<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)'}} />
					<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)'}} />
					<div style={{position: 'absolute', left: 50, top: 40, fontFamily: FONT.mono, fontSize: 40, color: '#f2f2f2', whiteSpace: 'pre-line', textShadow: '2px 2px 0 #000', lineHeight: 1.2}}>{camera}</div>
					<div style={{position: 'absolute', right: 50, top: 40, fontFamily: FONT.mono, fontSize: 40, color: '#f2f2f2', textShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', gap: 14}}>
						{paused ? (
							<span>❚❚ PAUSED</span>
						) : (
							<>
								<span style={{width: 24, height: 24, borderRadius: 12, background: '#ff3030', opacity: Math.floor(f / 15) % 2 ? 1 : 0.2, display: 'inline-block'}} /> REC
							</>
						)}
					</div>
					<div style={{position: 'absolute', left: 50, bottom: 40, fontFamily: FONT.mono, fontSize: 44, color: '#f2f2f2', textShadow: '2px 2px 0 #000'}}>
						{date} {timestamp}
					</div>
					<div style={{position: 'absolute', right: 50, bottom: 40, fontFamily: FONT.mono, fontSize: 36, color: '#f2f2f2', textShadow: '2px 2px 0 #000'}}>
						{speed ? `${speed}  ` : ''}
						{frameNo !== undefined ? `FRAME ${frameNo.toLocaleString('en-US')}` : ''}
					</div>
				</>
			) : (
				<div style={{position: 'absolute', left: 50, bottom: 40, fontFamily: FONT.mono, fontSize: 40, color: '#fff'}}>{timestamp}</div>
			)}
		</AbsoluteFill>
	);
};
