// A scanned page from Victor Hale's 1987 notebook. 1300×1700 px.
import React, {useId} from 'react';
import {FONT} from '../utils/fonts';

export const NOTEBOOK_W = 1300;
export const NOTEBOOK_H = 1700;

type Entry = {text: string; x: number; y: number; size?: number; rot?: number; font?: 'hand' | 'scrawl'; color?: string; strike?: boolean; opacity?: number};

// Most of this is meaningless on purpose. A few things are not.
const ENTRIES: Entry[] = [
	{text: '3.330  —  0117  — "seven four two nine"', x: 150, y: 120, size: 50},
	{text: '4.625 kHz   carrier steady 22:00 → 04:00', x: 150, y: 200, size: 44},
	{text: '6.840   numbers again. same woman.', x: 150, y: 275, size: 46},
	{text: '7.117 !!', x: 960, y: 275, size: 62, rot: -6, color: '#7a1414'},
	{text: '09/14  01:17  M. KOWALSKI  — located', x: 150, y: 360, size: 44},
	{text: '10/02  01:17  J. ABARA  — located', x: 150, y: 430, size: 44},
	{text: '10/21  01:17  S. LINDQVIST — ???', x: 150, y: 500, size: 44},
	{text: 'V. HALE   1:17   NOV 6', x: 170, y: 575, size: 46, strike: true, opacity: 0.75},
	{text: "it doesn't warn. it TELLS.", x: 640, y: 600, size: 48, rot: -4, font: 'scrawl', color: '#3a2a8a'},
	{text: '7  4  2  9   7  4  2  9   7  4  2  9', x: 150, y: 690, size: 44},
	{text: 'don\'t look under', x: 820, y: 760, size: 46, rot: 5, font: 'scrawl'},
	{text: '555-0117', x: 230, y: 860, size: 74},
	{text: 'ADAM RAHMAN', x: 230, y: 985, size: 84},
	{text: '1:17 AM', x: 780, y: 950, size: 62, rot: -2},
	{text: 'NOVEMBER 6', x: 780, y: 1025, size: 62, rot: -2},
	{text: 'who is he?', x: 330, y: 1105, size: 40, rot: -3, opacity: 0.8},
	{text: '11.2   faint. 5 bars at 01:17 only', x: 150, y: 1190, size: 42},
	{text: 'DANIEL — rm 204', x: 760, y: 1300, size: 40, rot: 3, opacity: 0.45},
	{text: '12/30  01:17  — ?', x: 150, y: 1320, size: 42, opacity: 0.8},
	{text: 'it moves with the radio', x: 150, y: 1430, size: 48, font: 'scrawl', rot: -2},
	{text: '0117 0117 0117', x: 700, y: 1540, size: 42, opacity: 0.6, rot: 4},
];

export const NotebookPage: React.FC<{
	/** 0..1 highlight sweeps over the phone number, name and date. */
	highlightPhone?: number;
	highlightName?: number;
	highlightDate?: number;
	/** 0..1 red circle around the name. */
	circle?: number;
}> = ({highlightPhone = 0, highlightName = 0, highlightDate = 0, circle = 0}) => {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const hl = (x: number, y: number, w: number, h: number, amt: number) =>
		amt > 0 ? <div style={{position: 'absolute', left: x, top: y, width: w * amt, height: h, background: 'rgba(255,230,40,0.55)', mixBlendMode: 'multiply', transform: 'rotate(-1deg)'}} /> : null;
	return (
		<div
			style={{
				position: 'absolute',
				width: NOTEBOOK_W,
				height: NOTEBOOK_H,
				background: '#ebe6d6',
				backgroundImage:
					'linear-gradient(to right, transparent 118px, rgba(200,60,60,0.55) 118px, rgba(200,60,60,0.55) 121px, transparent 121px), repeating-linear-gradient(to bottom, transparent 0px, transparent 70px, rgba(90,120,170,0.45) 70px, rgba(90,120,170,0.45) 72px)',
				backgroundPosition: '0 0, 0 48px',
				boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
				overflow: 'hidden',
			}}
		>
			<svg width={NOTEBOOK_W} height={NOTEBOOK_H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply'}}>
				<defs>
					<filter id={`nb${id}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={4} seed={21} />
						<feColorMatrix type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.5  0 0 0 0 0.35  0 0 0 0.3 0" />
					</filter>
				</defs>
				<rect width="100%" height="100%" filter={`url(#nb${id})`} />
				{/* coffee ring */}
				<circle cx={1080} cy={1240} r={120} fill="none" stroke="rgba(120,70,25,0.3)" strokeWidth={16} />
				<circle cx={1086} cy={1236} r={108} fill="none" stroke="rgba(120,70,25,0.12)" strokeWidth={6} />
				{/* scanner shadow on the binding side */}
				<rect x={0} y={0} width={60} height={NOTEBOOK_H} fill="rgba(0,0,0,0.18)" />
			</svg>
			{/* punch holes */}
			{[200, 850, 1500].map((y) => (
				<div key={y} style={{position: 'absolute', left: 30, top: y, width: 44, height: 44, borderRadius: 22, background: '#1a1a1a', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8)'}} />
			))}
			{hl(214, 838, 330, 96, highlightPhone)}
			{hl(214, 975, 500, 110, highlightName)}
			{hl(764, 940, 240, 80, Math.min(1, highlightDate * 2))}
			{hl(764, 1015, 360, 80, Math.max(0, highlightDate * 2 - 1))}
			{ENTRIES.map((e, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: e.x,
						top: e.y,
						fontFamily: e.font === 'scrawl' ? FONT.scrawl : FONT.hand,
						fontWeight: e.font === 'scrawl' ? 400 : 700,
						fontSize: e.size ?? 46,
						color: e.color ?? '#23201c',
						transform: `rotate(${e.rot ?? (i % 2 ? -0.8 : 0.6)}deg)`,
						opacity: e.opacity ?? 0.92,
						whiteSpace: 'nowrap',
						textDecoration: e.strike ? 'line-through' : undefined,
						textDecorationThickness: e.strike ? 4 : undefined,
					}}
				>
					{e.text}
				</div>
			))}
			{circle > 0 && (
				<svg width={NOTEBOOK_W} height={NOTEBOOK_H} viewBox={`0 0 ${NOTEBOOK_W} ${NOTEBOOK_H}`} style={{position: 'absolute', inset: 0}}>
					<path
						d="M 200 1060 C 180 960 680 930 730 1010 C 760 1080 420 1120 250 1095 C 160 1080 190 990 320 975"
						stroke="rgba(200,20,20,0.85)"
						strokeWidth={9}
						fill="none"
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray={1}
						strokeDashoffset={1 - circle}
					/>
				</svg>
			)}
		</div>
	);
};
