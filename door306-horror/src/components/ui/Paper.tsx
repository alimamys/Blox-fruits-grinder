// Code-drawn paper and screens for the last scene: the landlord's notebook, the advert on
// his laptop, the clock, THE END. Text is typeset in code, so it is always legible.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01} from '../../utils/rough';

const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Neue', cursive";

/** Invented first names only (no surnames, nobody real). */
const NAMES = [
	'Ellen', 'Marcus', 'Joan', 'Peter', 'Ruth', 'Daniel', 'Iris', 'Walter', 'Nadia', 'Tom', 'Grace', 'Luis', 'Hazel', 'Owen', 'Mira', 'Frank', 'Alice', 'Victor', 'June', 'Simon',
	'Clara', 'Ben', 'Rosa', 'Henry', 'Lena', 'Paul', 'Edith', 'Sam', 'Vera', 'Noah', 'Ada', 'Leo', 'Maud', 'Ivan', 'Elsie', 'Karl', 'Nina', 'Hugo', 'Sarah',
];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER'];

const Page: React.FC<{children: React.ReactNode; z?: number}> = ({children, z = 1}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2c1e 0%, #1a120b 100%)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
		<div
			style={{
				width: 1180,
				height: 1500,
				background: 'linear-gradient(180deg, #efe6cf 0%, #e6dbbf 100%)',
				boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
				transform: `rotate(-2deg) scale(${z})`,
				position: 'relative',
				backgroundImage: 'repeating-linear-gradient(180deg, transparent 0, transparent 61px, rgba(80,110,160,0.35) 62px)',
			}}
		>
			<div style={{position: 'absolute', left: 120, top: 0, bottom: 0, width: 2, background: 'rgba(190,60,60,0.45)'}} />
			{children}
		</div>
	</AbsoluteFill>
);

/** The old notebook: dozens of names, every one crossed out. `strike` 0..1 animates the last line through. */
export const NamesPage: React.FC<{f: number; d: number; strike?: number}> = ({f, d, strike = 1}) => {
	const rows = NAMES.slice(0, 26);
	return (
		<Page z={1 + 0.06 * clamp(f / d)}>
			{rows.map((n, i) => {
				const month = MONTHS[i % MONTHS.length];
				const last = i === rows.length - 1;
				const k = last ? strike : 1;
				return (
					<div key={i} style={{position: 'absolute', left: 150, top: 54 + i * 54, fontFamily: HAND, fontSize: 34, color: '#2a2f45', whiteSpace: 'nowrap'}}>
						{month} {3 + (i % 3)} - {['2nd', '3rd', '4th', '2nd', '1st'][i % 5]} floor - {n}
						<div style={{position: 'absolute', left: -10, top: 22 + (h01(i, 3) - 0.5) * 6, height: 4, width: `${(420 + h01(i, 5) * 160) * k}px`, background: '#1b1b22', transform: `rotate(${(h01(i, 7) - 0.5) * 3}deg)`}} />
					</div>
				);
			})}
		</Page>
	);
};

/** A new page: the next date, the next floor. Written line by line. */
export const NewPage: React.FC<{f: number; d: number}> = ({f, d}) => {
	const a = clamp((f - 4) / 16);
	const b = clamp((f - 26) / 18);
	return (
		<Page z={1.05 + 0.06 * clamp(f / d)}>
			<div style={{position: 'absolute', left: 170, top: 220, fontFamily: HAND, fontSize: 58, color: '#23283c', clipPath: `inset(0 ${100 - a * 100}% 0 0)`}}>DECEMBER 3 - 3:06 AM</div>
			<div style={{position: 'absolute', left: 170, top: 360, fontFamily: HAND, fontSize: 50, color: '#8a1d1d', clipPath: `inset(0 ${100 - b * 100}% 0 0)`}}>FOURTH FLOOR - ONE REPLACEMENT NEEDED</div>
		</Page>
	);
};

/** The advert going up on the landlord's laptop. */
export const AdScreen: React.FC<{f: number; d: number}> = ({f, d}) => {
	const typed = 'Beautiful One-Bedroom Apartment. Recently Renovated. Affordable Rent. Available Immediately.';
	const n = Math.round(clamp((f - 6) / Math.max(1, d * 0.7 - 6)) * typed.length);
	const posted = f > d * 0.8;
	return (
		<AbsoluteFill style={{background: '#16130f', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: 1500, height: 900, borderRadius: 18, background: '#f4f5f7', boxShadow: '0 0 0 18px #2a2a2e, 0 40px 120px rgba(0,0,0,0.7)', fontFamily: FONT.ui, color: '#1d2433', padding: '60px 80px', position: 'relative', transform: `scale(${1 + 0.04 * clamp(f / d)})`}}>
				<div style={{fontSize: 26, color: '#6b7488', letterSpacing: 2}}>NEW LISTING</div>
				<div style={{marginTop: 24, height: 300, borderRadius: 12, background: 'linear-gradient(135deg, #f3d9a4 0%, #e9b77a 45%, #c98f5a 100%)', display: 'flex', alignItems: 'flex-end', padding: 24, fontSize: 24, color: '#fff'}}>
					4B - sunny, quiet, newly painted
				</div>
				<div style={{marginTop: 36, fontSize: 46, fontWeight: 700, lineHeight: 1.3, minHeight: 180}}>
					{typed.slice(0, n)}
					<span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span>
				</div>
				<div style={{position: 'absolute', right: 80, bottom: 60, padding: '20px 44px', borderRadius: 12, background: posted ? '#1e9e5a' : '#2f6df6', color: '#fff', fontSize: 30, fontWeight: 700}}>{posted ? 'Posted' : 'Publish'}</div>
			</div>
		</AbsoluteFill>
	);
};

/** 3:05:58 -> 3:06:00 on a bedside clock in the dark. */
export const Clock: React.FC<{time: string; f: number}> = ({time, f}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT.mono, fontSize: 230, color: '#ff3b30', letterSpacing: 10, textShadow: '0 0 40px rgba(255,59,48,0.55)', opacity: f < 2 ? 0.6 : 1}}>{time}</div>
	</AbsoluteFill>
);

export const TheEnd: React.FC<{f: number; d: number}> = ({f, d}) => (
	<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT.ui, fontSize: 96, fontWeight: 800, letterSpacing: 24, color: '#ece9df', opacity: clamp((f - 4) / 12) * clamp((d - f) / 10)}}>THE END</div>
	</AbsoluteFill>
);
