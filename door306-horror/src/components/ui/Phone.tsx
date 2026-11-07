// Phone screens and overlays - crisp code UI (final art). Pictures inside them (the
// screenshot) are drawn in the film's style.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../../utils/fonts';
import {PictureBox, type PicId} from '../../layout/pictures';
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

/** Message thread with the screenshot Mara sent. `zoom` pinch-zooms into the screenshot. */
export const ThreadScreen: React.FC<{
	f: number;
	picture?: PicId;
	sent?: number;
	delivered?: boolean;
	reply?: string | null;
	typing?: boolean;
	time?: string;
}> = ({f, picture = 'canvas_man_1m', sent = 1, delivered = true, reply = null, typing = false, time = '2:48'}) => (
	<div style={{position: 'absolute', inset: 0, background: '#0f1115', fontFamily: FONT.ui, color: '#fff'}}>
		<StatusBar time={time} />
		<div style={{position: 'absolute', top: 70, left: 0, right: 0, height: 110, borderBottom: '1px solid #262a31', display: 'flex', alignItems: 'center', gap: 18, padding: '0 34px'}}>
			<div style={{width: 64, height: 64, borderRadius: 32, background: '#5b6b8c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600}}>H</div>
			<div style={{fontSize: 32, fontWeight: 600}}>Hana</div>
		</div>
		<div style={{position: 'absolute', top: 210, right: 30, width: 400, opacity: clamp(sent), transform: `translateY(${(1 - clamp(sent)) * 40}px)`}}>
			<div style={{borderRadius: 26, overflow: 'hidden', border: '3px solid #2f6df6', height: 225}}>
				<PictureBox id={picture} />
			</div>
			<div style={{textAlign: 'right', fontSize: 20, color: '#8b93a1', marginTop: 8}}>{delivered ? 'Delivered' : 'Sending…'}</div>
		</div>
		{typing ? (
			<div style={{position: 'absolute', top: 520, left: 30, padding: '18px 26px', borderRadius: 30, background: '#262a31', fontSize: 34, letterSpacing: 6}}>{'•••'.slice(0, 1 + (Math.floor(f / 6) % 3))}</div>
		) : null}
		{reply ? <div style={{position: 'absolute', top: 520, left: 30, maxWidth: 380, padding: '18px 26px', borderRadius: 30, background: '#262a31', fontSize: 30}}>{reply}</div> : null}
	</div>
);

/** The screenshot opened full-screen on the phone, pinch-zoomed (z) into (cx, cy). */
export const ScreenshotView: React.FC<{picture: PicId; z?: number; cx?: number; cy?: number}> = ({picture, z = 1, cx = 0.5, cy = 0.5}) => (
	<div style={{position: 'absolute', inset: 0, background: '#000'}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: (W - 32) * (9 / 16) * 2.1, marginTop: -((W - 32) * (9 / 16) * 2.1) / 2, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: `${cx * 100}% ${cy * 100}%`, transform: `scale(${z})`}}>
				<PictureBox id={picture} />
			</div>
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
				<div style={{fontSize: 104, fontWeight: 800, letterSpacing: 14, lineHeight: 1.05}}>NEVER OPEN YOUR DOOR</div>
				<div style={{fontSize: 104, fontWeight: 800, letterSpacing: 14, marginTop: 18}}>
					AT <span style={{color: '#ff3b30'}}>3:06</span> AM
				</div>
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
