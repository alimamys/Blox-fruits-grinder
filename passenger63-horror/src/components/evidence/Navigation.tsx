// Bridge electronics + harbour control: <RadarScreen/>, <NavScreen/>, <Compass/>,
// <MarineRadio/>, <HarborControl/>, <ImageTransfer/>. All fictional branding.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01} from '../../utils/rough';

const GREEN = '#3cf08a';

export const RadarScreen: React.FC<{f: number; state?: 'ok' | 'empty'; size?: number; label?: boolean}> = ({f, state = 'empty', size = 760, label = true}) => {
	const r = size / 2;
	const ang = (f * 4) % 360;
	return (
		<div style={{position: 'relative', width: size + 120, height: size + 140, background: '#060a08', borderRadius: 20, border: '10px solid #1d2321', padding: 50, boxSizing: 'border-box'}}>
			<svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`} style={{position: 'absolute', left: 50, top: 60}}>
				<circle r={r - 4} fill="#03140a" stroke={GREEN} strokeWidth={3} opacity={0.9} />
				{[0.25, 0.5, 0.75].map((k) => (
					<circle key={k} r={(r - 4) * k} fill="none" stroke={GREEN} strokeWidth={1.5} opacity={0.35} />
				))}
				<line x1={-r} y1={0} x2={r} y2={0} stroke={GREEN} opacity={0.25} />
				<line x1={0} y1={-r} x2={0} y2={r} stroke={GREEN} opacity={0.25} />
				<g transform={`rotate(${ang})`}>
					<path d={`M0,0 L${r - 6},0 A${r - 6},${r - 6} 0 0,0 ${(r - 6) * Math.cos(-0.5)},${(r - 6) * Math.sin(-0.5)} Z`} fill={GREEN} opacity={0.18} />
					<line x1={0} y1={0} x2={r - 6} y2={0} stroke={GREEN} strokeWidth={3} />
				</g>
				{state === 'ok'
					? [0, 1, 2].map((i) => <circle key={i} cx={Math.cos(i * 2) * r * 0.6} cy={Math.sin(i * 2) * r * 0.5} r={6} fill={GREEN} opacity={0.8} />)
					: null}
				<polygon points="0,-14 9,10 -9,10" fill="#fff" />
			</svg>
			{label ? (
				<div style={{position: 'absolute', left: 30, top: 14, right: 30, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 22, color: GREEN}}>
					<span>X-BAND · 6 NM</span>
					<span style={{color: state === 'empty' ? '#ffb02e' : GREEN}}>{state === 'empty' ? 'NO TARGETS' : 'TGT 3'}</span>
				</div>
			) : null}
		</div>
	);
};

export const Compass: React.FC<{f: number; spinning?: boolean; size?: number; heading?: number}> = ({f, spinning = false, size = 520, heading = 92}) => {
	const r = size / 2;
	const a = spinning ? f * 23 + Math.sin(f / 4) * 40 : heading + Math.sin(f / 30) * 2;
	return (
		<svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}>
			<circle r={r - 6} fill="#efe8d6" stroke="#2a2a2a" strokeWidth={12} />
			{Array.from({length: 36}, (_, i) => (
				<line key={i} x1={0} y1={-(r - 20)} x2={0} y2={-(r - (i % 9 === 0 ? 60 : 38))} stroke="#222" strokeWidth={i % 9 === 0 ? 6 : 3} transform={`rotate(${i * 10})`} />
			))}
			{['N', 'E', 'S', 'W'].map((t, i) => (
				<text key={t} x={0} y={-(r - 95)} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={44} fill={t === 'N' ? '#b3261e' : '#222'} transform={`rotate(${i * 90})`}>
					{t}
				</text>
			))}
			<g transform={`rotate(${a})`}>
				<polygon points={`0,${-(r - 70)} 18,0 0,${r - 70} -18,0`} fill="#222" />
				<polygon points={`0,${-(r - 70)} 18,0 -18,0`} fill="#c62828" />
				<circle r={14} fill="#999" stroke="#222" strokeWidth={4} />
			</g>
		</svg>
	);
};

/** ECDIS-style chart display. */
export const NavScreen: React.FC<{f: number; state?: 'normal' | 'blank' | 'lost' | 'restored' | 'void'; width?: number; height?: number; clock?: string}> = ({
	f,
	state = 'normal',
	width = 1300,
	height = 820,
	clock = '00:49:07',
}) => {
	const blank = state === 'blank';
	const shipX = width * 0.42 + (state === 'normal' ? f * 0.2 : 0);
	return (
		<div style={{position: 'relative', width, height, background: blank ? '#020304' : '#0b1626', borderRadius: 14, border: '12px solid #1d222b', overflow: 'hidden', fontFamily: FONT.mono}}>
			{!blank ? (
				<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
					{Array.from({length: 14}, (_, i) => (
						<line key={`g${i}`} x1={(i * width) / 13} y1={0} x2={(i * width) / 13} y2={height} stroke="#1e3350" strokeWidth={1} />
					))}
					{Array.from({length: 9}, (_, i) => (
						<line key={`h${i}`} x1={0} y1={(i * height) / 8} x2={width} y2={(i * height) / 8} stroke="#1e3350" strokeWidth={1} />
					))}
					{state !== 'void' && state !== 'lost' ? (
						<>
							<path d={`M0,${height * 0.15} C${width * 0.1},${height * 0.25} ${width * 0.12},${height * 0.55} 0,${height * 0.7} Z`} fill="#c9b27a" opacity={0.85} />
							<path d={`M${width},${height * 0.1} C${width * 0.82},${height * 0.3} ${width * 0.8},${height * 0.6} ${width},${height * 0.85} Z`} fill="#c9b27a" opacity={0.85} />
							<text x={30} y={height * 0.45} fill="#14213a" fontSize={24} fontWeight={700}>
								BELL IS.
							</text>
							<text x={width - 210} y={height * 0.48} fill="#14213a" fontSize={24} fontWeight={700}>
								PORT MASON
							</text>
							<path d={`M${width * 0.08},${height * 0.45} L${width * 0.86},${height * 0.47}`} stroke="#e8c547" strokeWidth={3} strokeDasharray="14 10" />
						</>
					) : null}
					<g transform={`translate(${shipX}, ${height * 0.46})`}>
						<polygon points="26,0 -14,-12 -14,12" fill="#ffffff" />
						<line x1={26} y1={0} x2={160} y2={0} stroke="#fff" strokeWidth={2} opacity={0.6} />
					</g>
				</svg>
			) : null}
			<div style={{position: 'absolute', left: 20, top: 14, color: blank ? '#334' : '#9fc4ff', fontSize: 22}}>ECDIS · NS8 · {clock}</div>
			{state === 'lost' || state === 'void' ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: height * 0.36, textAlign: 'center'}}>
					<div style={{display: 'inline-block', background: '#7a0d0d', color: '#fff', padding: '18px 40px', fontSize: 46, fontWeight: 700, opacity: Math.floor(f / 10) % 2 ? 1 : 0.65}}>GPS: NO FIX — SIGNAL LOST</div>
				</div>
			) : null}
			{blank ? <div style={{position: 'absolute', left: 0, right: 0, top: height * 0.45, textAlign: 'center', color: '#2b3442', fontSize: 34}}>NO SIGNAL</div> : null}
			{state === 'restored' ? (
				<div style={{position: 'absolute', right: 30, bottom: 30, background: 'rgba(10,30,60,0.92)', border: '3px solid #9fc4ff', padding: '20px 30px', color: '#fff', fontSize: 52, fontWeight: 700}}>PORT MASON — 4.7 KM</div>
			) : null}
			<div style={{position: 'absolute', left: 20, bottom: 14, color: state === 'lost' || state === 'void' ? '#ff6b6b' : '#7fa7d8', fontSize: 22}}>
				{state === 'lost' || state === 'void' ? 'POS ---°--.---N ---°--.---W   SOG --.-' : blank ? '' : 'POS 51°24.118N 004°12.903W   SOG 14.2 KN'}
			</div>
		</div>
	);
};

/** VHF marine radio panel. tx/rx light + waveform level 0..1. */
export const MarineRadio: React.FC<{f: number; mode?: 'tx' | 'rx' | 'idle' | 'static'; level?: number; scale?: number}> = ({f, mode = 'idle', level = 0, scale = 1}) => {
	const bars = 40;
	return (
		<div style={{width: 1300, height: 620, transform: `scale(${scale})`, background: 'linear-gradient(#2b2f35,#1b1e22)', borderRadius: 30, border: '6px solid #0c0d0f', position: 'relative', fontFamily: FONT.mono, boxShadow: '0 30px 80px rgba(0,0,0,0.7)'}}>
			<div style={{position: 'absolute', left: 40, top: 30, color: '#c9ced6', fontFamily: FONT.ui, fontWeight: 800, fontSize: 30, letterSpacing: 3}}>SEAWARD VHF-9</div>
			<div style={{position: 'absolute', left: 60, top: 100, width: 640, height: 300, background: mode === 'static' ? '#6f7d55' : '#9fb07a', borderRadius: 12, border: '8px solid #111', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)'}}>
				<div style={{position: 'absolute', left: 30, top: 10, fontSize: 32, color: '#1a2410'}}>CH</div>
				<div style={{position: 'absolute', left: 90, top: -20, fontSize: 230, color: '#1a2410', fontFamily: FONT.mono, fontWeight: 700}}>16</div>
				<div style={{position: 'absolute', right: 26, top: 22, fontSize: 30, color: '#1a2410'}}>{mode === 'tx' ? 'TX' : mode === 'rx' ? 'RX' : ''}</div>
				<div style={{position: 'absolute', right: 26, bottom: 18, fontSize: 24, color: '#1a2410'}}>25W · DSC</div>
			</div>
			<svg width={500} height={300} style={{position: 'absolute', right: 60, top: 100}}>
				<rect width={500} height={300} rx={12} fill="#05080a" stroke="#111" strokeWidth={8} />
				{Array.from({length: bars}, (_, i) => {
					const noise = mode === 'static' ? 0.25 + 0.3 * h01(i, f) : 0;
					const v = mode === 'idle' ? 0.03 : clamp(noise + level * Math.abs(Math.sin(f * 0.7 + i * 0.6)) * h01(i, Math.floor(f / 2)));
					const hh = 10 + v * 250;
					return <rect key={i} x={20 + i * 11.6} y={150 - hh / 2} width={7} height={hh} fill={mode === 'tx' ? '#ffb02e' : '#3cf08a'} opacity={0.85} />;
				})}
			</svg>
			{[
				['TX', mode === 'tx' ? '#ff3b30' : '#3a1414'],
				['RX', mode === 'rx' ? '#2fe06a' : '#123a1f'],
				['SQ', mode === 'static' ? '#ffb02e' : '#3a2a10'],
			].map(([t, c], i) => (
				<div key={t} style={{position: 'absolute', left: 80 + i * 150, top: 450, display: 'flex', alignItems: 'center', gap: 14, color: '#c9ced6', fontSize: 30}}>
					<div style={{width: 34, height: 34, borderRadius: 17, background: c, boxShadow: `0 0 20px ${c}`}} />
					{t}
				</div>
			))}
			<div style={{position: 'absolute', right: 80, top: 440, width: 120, height: 120, borderRadius: 60, background: '#111', border: '6px solid #3a3e44'}} />
			<div style={{position: 'absolute', right: 240, top: 440, width: 120, height: 120, borderRadius: 60, background: '#111', border: '6px solid #3a3e44'}} />
		</div>
	);
};

/** Port Mason harbour control (VTS) vessel list. */
export const HarborControl: React.FC<{f: number; highlight?: boolean; live?: React.ReactNode; clock?: string}> = ({f, highlight = true, live, clock = '00:49:31'}) => {
	const vessels = [
		['NORTH STAR 8', 'PASSENGER FERRY', 'ALONGSIDE · BERTH 3', '00:26:14', true],
		['CORMORANT', 'PILOT', 'MOORED · PILOT JETTY', '22:10:02', false],
		['ANNA MAE', 'FISHING', 'MOORED · BASIN 2', '19:44:51', false],
		['NORTH STAR 5', 'PASSENGER FERRY', 'LAID UP · BERTH 1', '—', false],
		['MV KESTREL', 'CARGO', 'ANCHORED · OUTER ROADS', '17:02:33', false],
	] as const;
	return (
		<AbsoluteFill style={{background: '#0a0f15', fontFamily: FONT.ui, color: '#d9e2ee'}}>
			<div style={{display: 'flex', alignItems: 'center', padding: '22px 40px', background: '#111a26', borderBottom: '2px solid #22324a'}}>
				<div style={{fontWeight: 800, fontSize: 32, letterSpacing: 2}}>PORT MASON HARBOR CONTROL</div>
				<div style={{marginLeft: 24, fontSize: 22, color: '#7f97b6'}}>Vessel Traffic Service · Sector 2</div>
				<div style={{marginLeft: 'auto', fontFamily: FONT.mono, fontSize: 30, color: '#9fc4ff'}}>{clock}</div>
			</div>
			<div style={{display: 'flex', gap: 30, padding: 40}}>
				<div style={{flex: 1.2, background: '#0f1722', border: '2px solid #22324a', borderRadius: 10}}>
					<div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.5fr 0.8fr', padding: '16px 24px', fontSize: 20, color: '#7f97b6', fontWeight: 700, borderBottom: '2px solid #22324a'}}>
						<div>VESSEL</div>
						<div>TYPE</div>
						<div>STATUS</div>
						<div>ARRIVED</div>
					</div>
					{vessels.map(([name, type, status, arr, key]) => (
						<div
							key={name}
							style={{
								display: 'grid',
								gridTemplateColumns: '1.3fr 1fr 1.5fr 0.8fr',
								padding: '20px 24px',
								fontSize: 26,
								borderBottom: '1px solid #1a2636',
								background: key && highlight ? `rgba(255,190,60,${0.18 + 0.08 * Math.sin(f / 6)})` : 'transparent',
								color: key ? '#fff' : '#b9c6d8',
								fontWeight: key ? 800 : 500,
							}}
						>
							<div>{name}</div>
							<div style={{fontSize: 22}}>{type}</div>
							<div style={{color: key ? '#ffcf6b' : undefined}}>{status}</div>
							<div style={{fontFamily: FONT.mono}}>{arr}</div>
						</div>
					))}
				</div>
				<div style={{flex: 1, background: '#0f1722', border: '2px solid #22324a', borderRadius: 10, position: 'relative', overflow: 'hidden', minHeight: 520}}>
					<div style={{position: 'absolute', left: 20, top: 14, fontSize: 20, color: '#7f97b6', fontWeight: 700}}>CAM 2 · BERTH 3 · LIVE</div>
					<div style={{position: 'absolute', left: 20, right: 20, top: 52, bottom: 20, background: '#000', overflow: 'hidden'}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.39)', transformOrigin: '0 0'}}>{live}</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** "Incoming image" panel on the bridge terminal. */
export const ImageTransfer: React.FC<{f: number; progress: number; children?: React.ReactNode}> = ({progress, children}) => (
	<AbsoluteFill style={{background: '#0a0d12', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui}}>
		<div style={{width: 1500, background: '#121821', border: '2px solid #2a3a52', borderRadius: 12, overflow: 'hidden'}}>
			<div style={{padding: '18px 28px', display: 'flex', justifyContent: 'space-between', color: '#cfe0f5', fontSize: 26, fontWeight: 700, background: '#172131'}}>
				<span>MARINE DATA LINK · INCOMING IMAGE</span>
				<span style={{fontFamily: FONT.mono, color: '#9fc4ff'}}>FROM: PORT MASON VTS</span>
			</div>
			<div style={{position: 'relative', height: 760, background: '#000', overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${100 - progress * 100}% 0)`, filter: `blur(${(1 - clamp(progress * 1.3)) * 6}px)`}}>{children}</div>
				{progress < 1 ? <div style={{position: 'absolute', left: 0, right: 0, top: `${progress * 100}%`, height: 4, background: '#9fc4ff', opacity: 0.8}} /> : null}
			</div>
			<div style={{padding: '14px 28px', display: 'flex', gap: 20, alignItems: 'center', color: '#9fb2c8', fontSize: 22}}>
				<span>RECEIVING</span>
				<div style={{flex: 1, height: 14, background: '#1d2939', borderRadius: 7, overflow: 'hidden'}}>
					<div style={{width: `${progress * 100}%`, height: '100%', background: '#4f8fe0'}} />
				</div>
				<span style={{fontFamily: FONT.mono}}>{Math.round(progress * 100)}%</span>
			</div>
		</div>
	</AbsoluteFill>
);
