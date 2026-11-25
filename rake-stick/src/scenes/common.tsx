// Shared set-ups of "The Rake": the bedroom (clock, someone in bed, the thing), the kitchen table, the title card,
// grandmother's diary page.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dad, Lily, LilyAdult, PAL, Son} from '../components/characters/Cast';
import type {StickProps} from '../components/characters/StickPerson';
import {Person} from '../stick/goat';
import {clamp01, GEO} from '../stick/kit';
import {BedClock, Table} from '../stick/props';
import {FONT} from '../utils/fonts';
import {boilOf, wobLine} from '../utils/rough';

type PP = Partial<StickProps> & Record<string, unknown>;

/** where people sit at the kitchen table (seen from the front, the table along the bottom) */
export const SEAT = {left: {x: 620, y: 1150, s: 2.0}, right: {x: 1180, y: 995, s: 2.0}};

/** the bedside clock in Lily's little bedroom */
export const RoomClock: React.FC<{f: number; text?: string}> = ({f, text = '4:00'}) => <BedClock x={GEO.room.clock[0]} y={GEO.room.clock[1] + 20} text={text} frame={f} />;

/** the kitchen: two people at the table (left: Dad or Lily grown up; right: Lily or her son) */
export const Kitchen: React.FC<{f: number; left?: 'dad' | 'adult' | null; right?: 'lily' | 'son' | null; l?: PP; r?: PP; diary?: boolean; dusk?: boolean}> = ({f, left = 'dad', right = 'lily', l = {}, r = {}, diary = false, dusk = false}) => {
	const L = left === 'adult' ? LilyAdult : Dad;
	const R = right === 'son' ? Son : Lily;
	return (
		<g>
			{left ? <Person is={L} name={left} x={SEAT.left.x} y={SEAT.left.y} s={SEAT.left.s} pose="sit" frame={f} arms={{l: [28, -64], r: [28, -64]}} {...l} /> : null}
			{right ? <Person is={R} name={right} x={SEAT.right.x} y={SEAT.right.y} s={SEAT.right.s} child pose="sit" frame={f} palette={right === 'lily' ? PAL.lilyDay : undefined} arms={{l: [28, -64], r: [28, -64]}} {...r} /> : null}
			<Table
				y={GEO.kitchen.table}
				frame={f}
				items={[{kind: 'plate', x: SEAT.left.x}, {kind: 'mug', x: SEAT.left.x + 230}, ...(diary ? [{kind: 'diary' as const, x: 900}] : []), {kind: 'plate', x: SEAT.right.x}]}
				tint={dusk ? '#3a2a4a' : undefined}
			/>
		</g>
	);
};

/** THE RAKE, scratched on black */
export const TitleCard: React.FC<{f: number; d: number}> = ({f, d}) => {
	const o = clamp01((f - 3) / 8) * clamp01((d - f) / 10);
	const k = clamp01((f - 6) / 10);
	const sd = 5600 + boilOf(f, 4) * 7;
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: o, textAlign: 'center', fontFamily: '"Permanent Marker", "Patrick Hand", cursive', color: '#ebe6d6'}}>
				<div style={{fontSize: 190, letterSpacing: 10, textShadow: '0 8px 0 #000, 0 0 40px rgba(235,230,214,0.15)'}}>THE RAKE</div>
				<div style={{fontFamily: FONT.ui, fontSize: 34, letterSpacing: 14, color: '#9a958a', marginTop: 10}}>IT VISITS THREE TIMES</div>
			</div>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
				{[0, 1, 2].map((i) => (
					<path key={i} d={wobLine(560 + i * 46, 330, 560 + i * 46 + 820 * k, 700, sd + i, 1.5)} stroke="#8a1c18" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
				))}
			</svg>
		</AbsoluteFill>
	);
};

/** grandmother's diary page, full screen: the date, then the lines appear in her handwriting as she reads them;
 *  `lines` = text so far (each with 0..1 reveal); `torn` shows the torn-out stubs of the following pages */
export const DiaryPage: React.FC<{
	f: number;
	lines: Array<[string, number]>;
	torn?: boolean;
	z?: number;
	/** heading (default the 1984 date) */
	date?: string;
	/** a page torn OUT of the book: ragged left edge, folded small (creases) */
	tornOut?: boolean;
	/** ink colour + size (Lily's letter is in blue ballpoint) */
	ink?: string;
	size?: number;
	rot?: number;
}> = ({f, lines, torn = false, z = 1, date = 'June 11th, 1984', tornOut = false, ink = '#2a2a48', size = 50, rot = -2}) => (
	<AbsoluteFill style={{background: '#1a1410', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
		<div
			style={{
				width: 1180,
				height: 980,
				backgroundColor: '#efe7cf',
				border: '6px solid #141414',
				borderRadius: 10,
				boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
				transform: `rotate(${rot}deg) scale(${z})`,
				padding: '70px 90px',
				position: 'relative',
				backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 63px, rgba(90,110,160,0.35) 63px 65px), linear-gradient(180deg, #f3ecd8 0%, #e6dcc0 100%)',
				backgroundPosition: '0 112px, 0 0',
				fontFamily: '"Patrick Hand", cursive',
				color: ink,
				clipPath: tornOut ? 'polygon(3% 0, 100% 0, 100% 100%, 2% 100%, 4% 92%, 1% 84%, 4% 75%, 1.5% 66%, 4% 57%, 1% 48%, 3.5% 39%, 1% 30%, 4% 21%, 1.5% 12%, 4% 5%)' : undefined,
			}}
		>
			<div style={{fontSize: size + 2, marginBottom: 26}}>{date}</div>
			{lines.map(([t, k], i) => (
				<div key={i} style={{fontSize: size, lineHeight: `${Math.round(size * 1.28)}px`, clipPath: `inset(0 ${100 - k * 100}% 0 0)`}}>
					{t}
				</div>
			))}
			{torn ? (
				<svg viewBox="0 0 60 980" width={60} height={980} style={{position: 'absolute', right: -60, top: 0}}>
					<path d="M0,0 L18,40 L4,90 L22,150 L6,210 L26,280 L8,350 L24,420 L4,500 L20,580 L6,650 L26,720 L8,800 L22,880 L0,980 Z" fill="#e6dcc0" stroke="#141414" strokeWidth={3} />
				</svg>
			) : null}
			{tornOut ? (
				<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg, transparent 32.8%, rgba(0,0,0,0.16) 33.3%, transparent 34%, transparent 65.8%, rgba(0,0,0,0.16) 66.3%, transparent 67%), linear-gradient(180deg, transparent 49.3%, rgba(0,0,0,0.18) 50%, transparent 50.8%)'}} />
			) : null}
			<div style={{position: 'absolute', inset: 0, opacity: 0.08 + 0.02 * Math.sin(f / 7), background: '#000', pointerEvents: 'none'}} />
		</div>
	</AbsoluteFill>
);

/** reveal 0..1 of a line between t0 and t1 */
export const reveal = (t: number, t0: number, t1: number) => clamp01((t - t0) / Math.max(0.1, t1 - t0));

/** a page's lines written in sync with the voice, strictly ONE LINE AT A TIME: [line id, text, from, to] where
 *  from/to are a word of the line ('' = the line's start/end) or a fraction 0..1 of the line. A line never starts
 *  before the previous one is finished, so two lines are never being written at once. */
export type PageLine = [string, string, string | number, string | number];
export const pageLines = (
	spec: PageLine[],
	t: number,
	at: (id: string) => number,
	end: (id: string) => number,
	word: (id: string, w: string, fallback?: number) => number,
): Array<[string, number]> => {
	let prevEnd = -Infinity;
	return spec.map(([id, txt, a, b]) => {
		const raw0 = typeof a === 'number' ? at(id) + a * (end(id) - at(id)) : a ? word(id, a, 0) - 0.1 : at(id);
		const raw1 = typeof b === 'number' ? at(id) + b * (end(id) - at(id)) : b ? word(id, b, 1) + 0.25 : end(id);
		const t0 = Math.max(raw0, prevEnd);
		const t1 = Math.max(raw1, t0 + 0.35);
		prevEnd = t1;
		return [txt, reveal(t, t0, t1)];
	});
};
