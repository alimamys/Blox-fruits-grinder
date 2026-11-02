/**
 * Video thumbnail (brief §7): one strong anime close-up, with a ship, a
 * parliamentary light and a red trading display as small secondary elements;
 * show name + small date. Implies no attack, agreement or election result.
 * Render: node scripts/stills.mjs Thumbnail out/thumbnail 40
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Plate} from './components/Plate';
import {ensureFonts} from './lib/fonts';
import {C, FONT} from './lib/theme';
import scriptJson from './data/script.json';

ensureFonts();

const Inset: React.FC<{id: string; x: number; y: number; z: number; left: number; children?: React.ReactNode}> = ({id, x, y, z, left, children}) => (
	<div style={{position: 'absolute', left, top: 742, width: 300, height: 190, outline: `4px solid ${C.amber}`, boxShadow: '0 12px 30px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
		<Plate assetId={id} cam={{x, y, z}} width={300} height={190} tag="none" />
		{children}
	</div>
);

export const Thumbnail: React.FC = () => {
	const [first, ...rest] = scriptJson.showName.split(' ');
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* main close-up: the anonymous evacuee at the bus window */}
			<Plate assetId="A06" cam={{x: 0.27, y: 0.36, z: 2.25}} tag="none" />
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,14,0.96) 0%, rgba(5,7,14,0.85) 38%, rgba(5,7,14,0.15) 62%, rgba(5,7,14,0) 75%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 78% 40%, rgba(255,200,140,0.18), rgba(0,0,0,0) 45%)', mixBlendMode: 'screen'}} />
			{/* title block */}
			<div style={{position: 'absolute', left: 90, top: 120}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18}}>
					<div style={{width: 64, height: 12, background: C.red}} />
					<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 40, letterSpacing: '0.3em', color: C.amberSoft}}>1 NOV 2026</div>
				</div>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 196, lineHeight: 0.92, color: C.paper, textShadow: `8px 8px 0 ${C.ink}`, letterSpacing: '0.01em'}}>
					{first}
					<br />
					{rest.join(' ')}
				</div>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 58, letterSpacing: '0.14em', color: C.amber, marginTop: 26, textShadow: `4px 4px 0 ${C.ink}`}}>POWER UNDER PRESSURE</div>
			</div>
			{/* secondary elements: ship, parliament light, red trading display */}
			<Inset id="A01" x={0.6} y={0.48} z={2.2} left={90} />
			<Inset id="A15" x={0.5} y={0.2} z={2.6} left={414} />
			<Inset id="A11" x={0.62} y={0.45} z={2.0} left={738}>
				<svg width="300" height="190" style={{position: 'absolute', inset: 0}}>
					<path d="M110,62 L190,62 L150,128 Z" fill="#ff4a4a" stroke="#1a0608" strokeWidth="4" />
				</svg>
			</Inset>
		</AbsoluteFill>
	);
};
