// Phone screens and overlays - crisp code UI (final art). Pictures inside them (the
// screenshot) are drawn in the film's style.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../../utils/fonts';
import {clamp} from '../../utils/anim';

const W = 560;
const H = 1120;

/** A phone held up in the dark, its screen glowing. Children = screen content (W x H). */
export const PhoneFrame: React.FC<{f: number; d: number; children: React.ReactNode; tilt?: number; y?: number; scale?: number}> = ({f, d, children, tilt = -3, y = 0, scale = 0.86}) => {
	const t = clamp(f / Math.max(1, d - 1));
	const z = scale * (1 + 0.05 * t);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #1a2233 0%, #07090d 60%, #020304 100%)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<div style={{position: 'absolute', width: 900, height: 900, borderRadius: 450, background: 'radial-gradient(circle, rgba(170,200,255,0.18) 0%, rgba(0,0,0,0) 70%)'}} />
			<div
				style={{
					width: W,
					height: H,
					borderRadius: 70,
					background: '#0b0c0f',
					padding: 16,
					boxShadow: '0 0 0 3px #2a2c31, 0 30px 80px rgba(0,0,0,0.8)',
					transform: `translateY(${y + 40 - 30 * t}px) rotate(${tilt}deg) scale(${z})`,
				}}
			>
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 56, overflow: 'hidden', background: '#0f1115'}}>
					{children}
					<div style={{position: 'absolute', top: 14, left: '50%', marginLeft: -60, width: 120, height: 34, borderRadius: 17, background: '#000'}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

const StatusBar: React.FC<{time?: string; dark?: boolean}> = ({time = '2:47', dark = false}) => (
	<div style={{position: 'absolute', top: 18, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.ui, fontWeight: 600, fontSize: 24, color: dark ? '#111' : '#fff'}}>
		<span>{time}</span>
		<span style={{fontSize: 20}}>▮▮▮ 23%</span>
	</div>
);

/** Outgoing call / in-call screen. */
export const CallScreen: React.FC<{f: number; name?: string; connected?: number | null; time?: string}> = ({f, name = 'Hana', connected = null, time}) => {
	const secs = connected === null ? null : Math.max(0, Math.floor(connected));
	return (
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2b3a55 0%, #121a28 100%)', fontFamily: FONT.ui, color: '#fff', textAlign: 'center'}}>
			<StatusBar time={time} />
			<div style={{marginTop: 170, width: 170, height: 170, borderRadius: 85, background: '#5b6b8c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 600}}>{name[0]}</div>
			<div style={{fontSize: 54, fontWeight: 600, marginTop: 34}}>{name}</div>
			<div style={{fontSize: 28, marginTop: 14, color: '#c3cde0', fontFamily: secs === null ? FONT.ui : FONT.mono}}>
				{secs === null ? `calling${'.'.repeat(1 + (Math.floor(f / 10) % 3))}` : `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`}
			</div>
			<div style={{position: 'absolute', bottom: 110, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 70px'}}>
				{['mute', 'keypad', 'speaker'].map((k) => (
					<div key={k} style={{width: 104, height: 104, borderRadius: 52, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#dfe6f3'}}>
						{k}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 0}} />
			<div style={{position: 'absolute', bottom: -10, left: '50%', marginLeft: -52, width: 104, height: 104, borderRadius: 52, background: '#ff3b30', transform: 'translateY(-200px)'}} />
		</div>
	);
};

/** Lock screen: the time, big. `glow` 0..1 fades the screen on. */
export const LockScreen: React.FC<{time: string; date?: string; glow?: number}> = ({time, date = 'Saturday, November 3', glow = 1}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2236 0%, #0c0f18 100%)', fontFamily: FONT.ui, color: '#fff', textAlign: 'center', opacity: glow}}>
		<StatusBar time="" />
		<div style={{marginTop: 150, fontSize: 30, color: '#c8d0e4'}}>{date}</div>
		<div style={{fontSize: 190, fontWeight: 300, letterSpacing: -4, lineHeight: 1.05}}>{time}</div>
		<div style={{position: 'absolute', bottom: 70, left: 0, right: 0, fontSize: 24, color: '#9aa4bd'}}>Swipe up to open</div>
	</div>
);

/** Emergency call that will not go through: "No service". */
export const NoSignalScreen: React.FC<{f: number; attempt?: number}> = ({f, attempt = 1}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2b3a55 0%, #121a28 100%)', fontFamily: FONT.ui, color: '#fff', textAlign: 'center'}}>
		<div style={{position: 'absolute', top: 18, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 24}}>
			<span>3:08</span>
			<span style={{fontSize: 22, color: '#ff8a80'}}>No Service</span>
		</div>
		<div style={{marginTop: 200, fontSize: 64, fontWeight: 600}}>911</div>
		<div style={{fontSize: 32, marginTop: 22, color: f % 24 < 14 ? '#ff6b60' : '#c3cde0'}}>{attempt > 1 ? 'Call failed' : 'No signal'}</div>
		<div style={{fontSize: 24, marginTop: 14, color: '#9aa4bd'}}>Wi-Fi: not connected</div>
		<div style={{position: 'absolute', bottom: 190, left: '50%', marginLeft: -52, width: 104, height: 104, borderRadius: 52, background: '#ff3b30'}} />
	</div>
);

/** One new text message on the lock screen, sliding in. */
export const MessageScreen: React.FC<{from: string; text: string; time?: string; t?: number}> = ({from, text, time = '3:11', t = 1}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2236 0%, #0c0f18 100%)', fontFamily: FONT.ui, color: '#fff'}}>
		<div style={{marginTop: 120, textAlign: 'center', fontSize: 150, fontWeight: 300}}>{time}</div>
		<div
			style={{
				position: 'absolute',
				top: 420,
				left: 22,
				right: 22,
				padding: '26px 28px',
				borderRadius: 30,
				background: 'rgba(235,238,245,0.16)',
				backdropFilter: 'blur(8px)',
				opacity: clamp(t),
				transform: `translateY(${(1 - clamp(t)) * -40}px)`,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#c8d0e4'}}>
				<span style={{fontWeight: 700, letterSpacing: 1}}>MESSAGES</span>
				<span>now</span>
			</div>
			<div style={{fontSize: 30, fontWeight: 700, marginTop: 12}}>{from}</div>
			<div style={{fontSize: 32, marginTop: 8, lineHeight: 1.3}}>{text}</div>
		</div>
	</div>
);

/** The REC overlay of her phone camera (the closet recording). The timer keeps running. */
export const RecHud: React.FC<{seconds: number; opacity?: number}> = ({seconds, opacity = 1}) => {
	const s = Math.max(0, Math.floor(seconds));
	const blink = Math.floor(seconds * 2) % 2 === 0;
	return (
		<AbsoluteFill style={{opacity, pointerEvents: 'none', fontFamily: FONT.mono}}>
			<div style={{position: 'absolute', top: 54, left: 70, display: 'flex', alignItems: 'center', gap: 14, fontSize: 36, color: '#fff', textShadow: '0 2px 6px #000'}}>
				<div style={{width: 24, height: 24, borderRadius: 12, background: '#ff3b30', opacity: blink ? 1 : 0.25}} />
				REC
			</div>
			<div style={{position: 'absolute', top: 54, right: 70, fontSize: 36, color: '#fff', textShadow: '0 2px 6px #000'}}>
				{String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}
			</div>
			<div style={{position: 'absolute', bottom: 60, right: 70, fontSize: 26, color: '#ffd28a', textShadow: '0 2px 6px #000'}}>4%</div>
			{[
				[60, 40],
				[1860, 40],
				[60, 1040],
				[1860, 1040],
			].map(([x, y], i) => (
				<div key={i} style={{position: 'absolute', left: x - (i % 2 ? 40 : 0), top: y - (i > 1 ? 40 : 0), width: 40, height: 40, borderLeft: i % 2 ? 'none' : '3px solid rgba(255,255,255,0.7)', borderRight: i % 2 ? '3px solid rgba(255,255,255,0.7)' : 'none', borderTop: i > 1 ? 'none' : '3px solid rgba(255,255,255,0.7)', borderBottom: i > 1 ? '3px solid rgba(255,255,255,0.7)' : 'none'}} />
			))}
		</AbsoluteFill>
	);
};

/** Marching ants: a selection rectangle (screen px) with animated dashes and handles. */
export const MarchingAnts: React.FC<{f: number; box: [number, number, number, number]; handles?: boolean; opacity?: number; segments?: number}> = ({f, box, handles = false, opacity = 1, segments = 1}) => {
	const [x0, y0, x1, y1] = box;
	const per = 2 * (x1 - x0 + y1 - y0);
	return (
		<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}}>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#000" strokeWidth={5} strokeDasharray={`${per * segments} ${per}`} />
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="16 12" strokeDashoffset={-f * 2.2} style={{clipPath: 'none'}} opacity={1} />
			{handles
				? [
						[x0, y0],
						[(x0 + x1) / 2, y0],
						[x1, y0],
						[x1, (y0 + y1) / 2],
						[x1, y1],
						[(x0 + x1) / 2, y1],
						[x0, y1],
						[x0, (y0 + y1) / 2],
					].map(([x, y], i) => <rect key={i} x={x - 10} y={y - 10} width={20} height={20} fill="#fff" stroke="#000" strokeWidth={3} />)
				: null}
		</svg>
	);
};

/** Small dashed lines crawling over a surface (the selection forming). */
export const CrawlingDashes: React.FC<{f: number; amount: number; seed?: number}> = ({f, amount, seed = 1}) => {
	const n = Math.round(60 * amount);
	return (
		<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
			{Array.from({length: n}, (_, i) => {
				const x = (i * 173 + seed * 97) % 1880;
				const y = (i * 311 + seed * 53) % 1040;
				const horiz = i % 2 === 0;
				const len = 60 + ((i * 37) % 80);
				const off = (f * 3 + i * 11) % 28;
				return horiz ? (
					<line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="#fff" strokeWidth={4} strokeDasharray="12 9" strokeDashoffset={-off} opacity={0.85} />
				) : (
					<line key={i} x1={x} y1={y} x2={x} y2={y + len} stroke="#fff" strokeWidth={4} strokeDasharray="12 9" strokeDashoffset={-off} opacity={0.85} />
				);
			})}
		</svg>
	);
};

/** The huge white arrow cursor. (x, y) = tip position in screen px. */
export const BigCursor: React.FC<{x: number; y: number; size?: number; press?: number}> = ({x, y, size = 520, press = 0}) => (
	<svg width={size} height={size * 1.3} viewBox="0 0 20 26" style={{position: 'absolute', left: x - size * 0.05, top: y - size * 0.05, transform: `scale(${1 - press * 0.06})`, transformOrigin: '5% 5%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))'}}>
		<path d="M1,1 L1,20 L6,15 L9.5,23 L12.5,21.8 L9,14 L16,14 Z" fill="#fbfbf8" stroke="#111" strokeWidth={0.5} strokeLinejoin="round" />
	</svg>
);

/** A pencil line following a fingertip (code-drawn so it keeps moving). */
export const PencilTrail: React.FC<{from: [number, number]; to: [number, number]; t: number; width?: number}> = ({from, to, t, width = 5}) => (
	<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
		<path d={`M${from[0]},${from[1]} L${from[0] + (to[0] - from[0]) * t},${from[1] + (to[1] - from[1]) * t}`} stroke="#0b0b0b" strokeWidth={width} strokeLinecap="round" opacity={0.85} />
	</svg>
);

/** Title card: NEVER OPEN YOUR DOOR / AT 3:06 AM, over black. The fluorescent tube
 *  flickers the words on; "3:06" is red. */
export const TitleCard: React.FC<{f: number; d: number}> = ({f, d}) => {
	const on = f < 4 ? 0 : f < 6 ? 1 : f < 8 ? 0.15 : f < 10 ? 1 : f < 11 ? 0.4 : 1;
	const o = on * clamp((d - f) / 8);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: o, textAlign: 'center', fontFamily: FONT.ui, color: '#ece9df', textShadow: '0 0 24px rgba(214,232,170,0.25)'}}>
				<div style={{fontSize: 92, fontWeight: 800, letterSpacing: 12, lineHeight: 1.05}}>
					<span style={{color: '#ece9df'}}>11</span> OF US WENT CAMPING.
				</div>
				<div style={{fontSize: 92, fontWeight: 800, letterSpacing: 12, marginTop: 22}}>
					<span style={{color: '#ff3b30'}}>12</span> CAME BACK.
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** End card: the credit for the story this film retells. */
export const CreditCard: React.FC<{f: number; d: number}> = ({f, d}) => {
	const o = clamp((f - 6) / 14) * clamp((d - f) / 12);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: o, textAlign: 'center', fontFamily: FONT.ui, color: 'rgba(236,233,223,0.9)'}}>
				<div style={{fontSize: 30, letterSpacing: 3, color: 'rgba(236,233,223,0.6)'}}>BASED ON</div>
				<div style={{fontSize: 52, fontWeight: 700, marginTop: 14}}>"Anansi's Goatman Story"</div>
				<div style={{fontSize: 30, marginTop: 14, color: 'rgba(236,233,223,0.7)'}}>by Anansi (4chan /x/, 2012) · Creepypasta Wiki</div>
			</div>
		</AbsoluteFill>
	);
};

/** One-line fiction disclaimer riding over the opening. */
export const Disclaimer: React.FC<{f: number; d: number}> = ({f, d}) => (
	<div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.ui, fontSize: 26, color: 'rgba(235,238,245,0.85)', opacity: clamp((f - 2) / 8) * clamp((d - f) / 10)}}>
		A work of fiction. All characters and events are invented.
	</div>
);
