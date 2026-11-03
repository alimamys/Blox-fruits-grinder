// YouTube thumbnail (render: npm run thumbnail → out/thumbnail.png, 1280×720).
// Same MS Paint style as the video: the glowing radio, Adam's terrified face,
// and – circled in red – the pale man in the doorway behind him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Adam, Victor} from './components/Characters';
import {Vignette} from './components/CRTNoise';
import {Radio} from './components/Radio';
import {Layer, Stage} from './components/Stage';
import {StaticOverlay} from './components/StaticOverlay';
import {POSES} from './components/StickPerson';
import {FONT, FontLoader} from './utils/fonts';
import {C} from './utils/palette';
import {wobEllipse, wobPath, wobRect} from './utils/wobble';

const outline = (px: number, color = '#000') => ({
	WebkitTextStroke: `${px}px ${color}`,
	paintOrder: 'stroke fill' as const,
	textShadow: `0 ${px}px 0 ${color}, 0 0 40px rgba(0,0,0,0.8)`,
});

export const Thumbnail: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.night}}>
			<FontLoader />
			<Stage
				bg={C.night}
				overlay={
					<>
						<StaticOverlay opacity={0.07} blend="screen" seed={7} tear={0} />
						<Vignette strength={0.75} />
						{/* title */}
						<div style={{position: 'absolute', left: 64, top: 36, fontFamily: FONT.headline, fontWeight: 700, lineHeight: 0.92, letterSpacing: -2}}>
							<div style={{fontSize: 210, color: '#ffffff', ...outline(14)}}>IT KNEW</div>
							<div style={{fontSize: 210, color: '#ffd23b', ...outline(14)}}>HIS NAME</div>
						</div>
						{/* time tag */}
						<div
							style={{
								position: 'absolute',
								left: 76,
								top: 470,
								padding: '6px 22px',
								background: '#120405',
								border: '6px solid #000',
								fontFamily: FONT.vcr,
								fontSize: 92,
								color: '#ff3b30',
								textShadow: '0 0 18px rgba(255,60,40,0.9)',
								transform: 'rotate(-3deg)',
							}}
						>
							1:17 AM
						</div>
					</>
				}
			>
				<Layer>
					{/* room */}
					<rect x={-200} y={-200} width={2400} height={1500} fill={C.navyWall} />
					<rect x={-200} y={880} width={2400} height={400} fill={C.floor} />
					{/* dark doorway behind Adam, with the pale man */}
					<path d={wobRect(1040, 120, 300, 780, 11, 3)} fill="#04050c" stroke={C.ink} strokeWidth={10} />
					<defs>
						<linearGradient id="doorFade" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0.35" stopColor="#04050c" stopOpacity={0} />
							<stop offset="0.75" stopColor="#04050c" stopOpacity={1} />
						</linearGradient>
					</defs>
					<g opacity={0.75}>
						<Victor x={1190} y={880} scale={1.15} pose={POSES.standStiff} expression="creepy" look={[0, 0]} ink="#2a2e3a" />
					</g>
					<rect x={1046} y={126} width={288} height={768} fill="url(#doorFade)" />
					{/* red MS Paint circle + arrow */}
					<path d={wobEllipse(1192, 478, 118, 132, 21, 6)} fill="none" stroke={C.red} strokeWidth={14} />
					<path d={wobPath([[880, 300], [970, 360], [1050, 420]], 22, 3)} stroke={C.red} strokeWidth={16} fill="none" strokeLinecap="round" />
					<path d={wobPath([[1000, 428], [1058, 426], [1046, 370]], 23, 2)} stroke={C.red} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					{/* the radio, glowing, talking */}
					<Radio x={150} y={640} scale={1.0} power={1} speaking={1} readout="01.17" tuning={0.4} />
					{/* Adam, terrified, looking at the radio */}
					<Adam x={1640} y={1800} scale={3.7} pose={POSES.standStiff} facing={-1} expression="terrified" look={[1, 0.15]} sweat pale={0.3} blink={false} />
				</Layer>
			</Stage>
		</AbsoluteFill>
	);
};
