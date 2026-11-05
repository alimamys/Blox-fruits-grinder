// <PhoneScreen/> and the phone UIs: boarding pass, email, reservation, alerts,
// incoming calls, gallery, messages, the final "63".
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01} from '../../utils/rough';

/** Phone hardware frame; children fill the screen (390x844 logical). */
export const PhoneScreen: React.FC<{
	children?: React.ReactNode;
	x?: number;
	y?: number;
	scale?: number;
	rot?: number;
	screenOn?: number;
	time?: string;
	service?: boolean;
	glow?: boolean;
	dark?: boolean;
	hand?: boolean;
	reflection?: React.ReactNode;
}> = ({children, x = 960, y = 540, scale = 1, rot = 0, screenOn = 1, time = '00:41', service = true, glow = true, dark = false, hand = true, reflection}) => (
	<div style={{position: 'absolute', left: x - 215 * scale, top: y - 450 * scale, width: 430, height: 900, transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: '0 0'}}>
		{glow && screenOn > 0 ? <div style={{position: 'absolute', inset: -160, background: 'radial-gradient(ellipse at center, rgba(150,190,255,0.22), rgba(0,0,0,0) 65%)', opacity: screenOn}} /> : null}
		{hand ? <div style={{position: 'absolute', left: -60, top: 520, width: 300, height: 520, borderRadius: 140, background: '#e6bf9c', border: '7px solid #141414'}} /> : null}
		<div style={{position: 'absolute', inset: 0, borderRadius: 64, background: '#121316', border: '6px solid #050505', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}} />
		<div style={{position: 'absolute', left: 20, top: 20, width: 390, height: 860, borderRadius: 48, overflow: 'hidden', background: '#000'}}>
			<div style={{position: 'absolute', inset: 0, opacity: screenOn, background: dark ? '#000' : '#f4f5f7'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', fontFamily: FONT.ui, fontWeight: 700, fontSize: 19, color: dark ? '#fff' : '#111', zIndex: 3}}>
					<span>{time}</span>
					<span style={{fontSize: 15, fontWeight: 600}}>{service ? '▂▄▆█  5G' : 'No Service  ✕'}</span>
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0}}>{children}</div>
			</div>
			<div style={{position: 'absolute', left: 140, top: 14, width: 110, height: 30, borderRadius: 16, background: '#000', zIndex: 4}} />
			{reflection}
		</div>
		{hand ? <div style={{position: 'absolute', left: 330, top: 600, width: 130, height: 70, borderRadius: 40, background: '#e6bf9c', border: '7px solid #141414'}} /> : null}
	</div>
);

/** Fake (non-functional) QR pattern. `blank` 0..1 wipes it white. */
export const FakeQR: React.FC<{size?: number; blank?: number; seed?: number}> = ({size = 240, blank = 0, seed = 37}) => {
	const n = 25;
	const c = size / n;
	const finder = (x: number, y: number) => {
		const inF = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
		for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
			if (inF(fx, fy)) {
				const dx = x - fx;
				const dy = y - fy;
				return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
			}
		}
		return -1;
	};
	const cells: React.ReactNode[] = [];
	for (let y = 0; y < n; y++)
		for (let x = 0; x < n; x++) {
			const fv = finder(x, y);
			const on = fv === -1 ? h01(x, y, seed) > 0.5 : fv === 1;
			const gone = h01(x, y, 99) < blank;
			if (on && !gone) cells.push(<rect key={`${x}-${y}`} x={x * c} y={y * c} width={c + 0.5} height={c + 0.5} fill="#111" />);
		}
	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<rect width={size} height={size} fill="#fff" />
			{cells}
		</svg>
	);
};

export const BoardingPass: React.FC<{blank?: number; nameGone?: number}> = ({blank = 0, nameGone = 0}) => (
	<div style={{fontFamily: FONT.ui, padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
		<div style={{background: '#0f2c57', borderRadius: 22, color: '#fff', padding: 22}}>
			<div style={{fontSize: 16, opacity: 0.7, fontWeight: 600}}>NORTH STAR FERRIES · BOARDING PASS</div>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 34, fontWeight: 800}}>
				<span>BELL IS.</span>
				<span>⟶</span>
				<span>PT MASON</span>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 18}}>
				<span>23:28 · NS8</span>
				<span>SEAT 18B</span>
			</div>
		</div>
		<div style={{background: '#fff', borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px solid #e2e5ea'}}>
			<div style={{fontSize: 15, color: '#6b7686', fontWeight: 600, alignSelf: 'flex-start'}}>PASSENGER</div>
			<div style={{fontSize: 30, fontWeight: 800, color: '#111', alignSelf: 'flex-start', opacity: 1 - nameGone, minHeight: 36}}>DANIEL CLARKE</div>
			<FakeQR size={250} blank={blank} />
			<div style={{fontFamily: FONT.mono, fontSize: 16, color: '#555', opacity: 1 - blank}}>NS8-049582</div>
		</div>
	</div>
);

export const EmailInbox: React.FC<{gone?: number}> = ({gone = 0}) => (
	<div style={{fontFamily: FONT.ui, padding: '10px 0'}}>
		<div style={{padding: '8px 22px 16px', fontSize: 34, fontWeight: 800, color: '#111'}}>Inbox</div>
		{[
			{from: 'North Star Ferries', subj: 'Your booking confirmation NS8-2328', body: 'Daniel Clarke · 2 passengers · Bell Island → Port…', key: true},
			{from: 'Mum', subj: 'Did you get home ok?', body: 'Let me know when you land x'},
			{from: 'Island Cottages', subj: 'Thanks for staying with us!', body: 'We hope you enjoyed your three nights…'},
			{from: 'Bank', subj: 'Your statement is ready', body: 'View your latest statement in the app'},
		].map((m, i) => {
			const o = m.key ? 1 - gone : 1;
			const hgt = m.key ? 108 * (1 - gone) : 108;
			return (
				<div key={i} style={{height: hgt, overflow: 'hidden', opacity: o, borderBottom: '1px solid #e2e5ea', padding: m.key ? `${14 * (1 - gone)}px 22px` : '14px 22px', background: m.key ? '#eef4ff' : '#fff'}}>
					<div style={{fontWeight: 700, fontSize: 20, color: '#111'}}>{m.from}</div>
					<div style={{fontSize: 18, color: '#222', fontWeight: 600}}>{m.subj}</div>
					<div style={{fontSize: 16, color: '#6b7686'}}>{m.body}</div>
				</div>
			);
		})}
	</div>
);

export const Reservation: React.FC<{onePassenger?: number}> = ({onePassenger = 1}) => (
	<div style={{fontFamily: FONT.ui, padding: 22, display: 'flex', flexDirection: 'column', gap: 16}}>
		<div style={{fontSize: 30, fontWeight: 800, color: '#111'}}>My Booking</div>
		<div style={{background: '#fff', borderRadius: 20, padding: 22, border: '1px solid #e2e5ea', display: 'flex', flexDirection: 'column', gap: 10}}>
			<div style={{fontSize: 16, color: '#6b7686', fontWeight: 600}}>BOOKING REF</div>
			<div style={{fontFamily: FONT.mono, fontSize: 24, fontWeight: 700}}>NSF-7Q3K9</div>
			<div style={{fontSize: 16, color: '#6b7686', fontWeight: 600, marginTop: 10}}>PASSENGERS</div>
			<div style={{fontSize: 42, fontWeight: 800, color: '#b3261e'}}>{onePassenger > 0.5 ? 'ONE PASSENGER' : 'TWO PASSENGERS'}</div>
			<div style={{fontSize: 24, fontWeight: 600, color: '#111'}}>1. Emma Clarke</div>
			<div style={{fontSize: 24, fontWeight: 600, color: '#111', opacity: 1 - onePassenger, height: 30 * (1 - onePassenger), overflow: 'hidden'}}>2. Daniel Clarke</div>
		</div>
	</div>
);

/** Lock-screen style alert (the PASSENGER 37 message, the final message). */
export const LockAlert: React.FC<{title: string; lines: string[]; time?: string; f?: number; appear?: number; tint?: string; sender?: string}> = ({title, lines, time = '00:43', f = 99, appear = 0, tint = '#1b1b1f', sender = 'NORTH STAR 8'}) => {
	const o = clamp((f - appear) / 5);
	return (
		<div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${tint}, #000)`, fontFamily: FONT.ui}}>
			<div style={{textAlign: 'center', color: '#fff', marginTop: 50, fontSize: 92, fontWeight: 300}}>{time}</div>
			<div
				style={{
					margin: '40px 18px 0',
					background: 'rgba(245,245,250,0.92)',
					borderRadius: 26,
					padding: '18px 20px',
					transform: `translateY(${(1 - o) * -30}px)`,
					opacity: o,
				}}
			>
				<div style={{fontSize: 15, color: '#555', fontWeight: 700, letterSpacing: 1}}>{sender} · now</div>
				<div style={{fontSize: 26, color: '#111', fontWeight: 800, marginTop: 6}}>{title}</div>
				{lines.map((l, i) => (
					<div key={i} style={{fontSize: 24, color: '#222', fontWeight: 700}}>
						{l}
					</div>
				))}
			</div>
		</div>
	);
};

export const IncomingCall: React.FC<{f: number; missed?: boolean}> = ({f, missed = false}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#26303d,#0b0e13)', fontFamily: FONT.ui, color: '#fff', textAlign: 'center'}}>
		<div style={{marginTop: 90, fontSize: 24, opacity: 0.7}}>{missed ? 'Missed call' : 'incoming call…'}</div>
		<div style={{marginTop: 18, fontSize: 52, fontWeight: 600}}>Unknown</div>
		<div style={{marginTop: 8, fontSize: 22, opacity: 0.6}}>No caller ID</div>
		{!missed ? (
			<div style={{position: 'absolute', bottom: 110, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>
				<div style={{width: 100, height: 100, borderRadius: 50, background: '#e5383b', transform: `scale(${1 + 0.05 * Math.sin(f / 3)})`}} />
				<div style={{width: 100, height: 100, borderRadius: 50, background: '#2fbf71', transform: `scale(${1 + 0.05 * Math.sin(f / 3 + 1)})`}} />
			</div>
		) : null}
	</div>
);

export const BigNumberScreen: React.FC<{value: string; f: number}> = ({value, f}) => (
	<div style={{position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT.ui, fontWeight: 300, fontSize: 210, color: '#f2f2f2', letterSpacing: -4, textShadow: `0 0 ${20 + 6 * Math.sin(f / 9)}px rgba(255,255,255,0.35)`}}>{value}</div>
	</div>
);

export const NoServiceScreen: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#0b0d12', color: '#fff', fontFamily: FONT.ui, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
		<div style={{fontSize: 80}}>✕</div>
		<div style={{fontSize: 34, fontWeight: 700}}>No Service</div>
		<div style={{fontSize: 22, opacity: 0.6}}>No network available</div>
	</div>
);

export const PowerOff: React.FC<{f: number; progress: number}> = ({progress}) => (
	<div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{width: 320, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.18)', position: 'relative', fontFamily: FONT.ui, color: '#fff'}}>
			<div style={{position: 'absolute', left: 8 + progress * 228, top: 8, width: 68, height: 68, borderRadius: 34, background: '#fff', color: '#e5383b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>⏻</div>
			<div style={{position: 'absolute', left: 90, top: 26, fontSize: 24, opacity: 1 - progress}}>slide to power off</div>
		</div>
	</div>
);

export const MessageThread: React.FC<{photo?: React.ReactNode; showText?: number; f: number}> = ({photo, showText = 0}) => (
	<div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT.ui}}>
		<div style={{padding: '12px 20px', borderBottom: '1px solid #e5e5e5', textAlign: 'center'}}>
			<div style={{width: 54, height: 54, borderRadius: 27, background: '#b8bec8', margin: '0 auto'}} />
			<div style={{fontSize: 18, fontWeight: 600, marginTop: 6}}>Unknown number</div>
		</div>
		<div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: 14}}>
			<div style={{width: 290, height: 220, borderRadius: 22, overflow: 'hidden', background: '#ddd', position: 'relative'}}>{photo}</div>
			{showText > 0 ? (
				<div style={{alignSelf: 'flex-start', background: '#e9e9eb', borderRadius: 22, padding: '14px 18px', fontSize: 25, fontWeight: 800, color: '#111', opacity: showText, maxWidth: 300}}>DON'T LET HER COUNT YOU.</div>
			) : null}
		</div>
	</div>
);
