// Red LED alarm clock with real seven-segment digits.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobEllipse, wobRect} from '../utils/wobble';

const SEGS: Record<string, string> = {
	'0': 'abcdef',
	'1': 'bc',
	'2': 'abged',
	'3': 'abgcd',
	'4': 'fgbc',
	'5': 'afgcd',
	'6': 'afgedc',
	'7': 'abc',
	'8': 'abcdefg',
	'9': 'abcdfg',
	' ': '',
};

/** One seven-segment digit, 60×100 box. */
export const SevenSeg: React.FC<{ch: string; x: number; y: number; on: string; off: string}> = ({ch, x, y, on, off}) => {
	const lit = SEGS[ch] ?? '';
	const t = 12;
	const L = 44;
	const seg = (id: string, sx: number, sy: number, horiz: boolean) => (
		<rect
			key={id}
			x={x + sx}
			y={y + sy}
			width={horiz ? L : t}
			height={horiz ? t : L}
			rx={t / 2}
			fill={lit.includes(id) ? on : off}
		/>
	);
	return (
		<g>
			{seg('a', 8, 0, true)}
			{seg('b', 52, 6, false)}
			{seg('c', 52, 52, false)}
			{seg('d', 8, 92, true)}
			{seg('e', 0, 52, false)}
			{seg('f', 0, 6, false)}
			{seg('g', 8, 46, true)}
		</g>
	);
};

export type DigitalClockProps = {
	x: number;
	y: number;
	scale?: number;
	/** e.g. "1:17" */
	time: string;
	ampm?: string;
	/** 0..1 glow of the speaker grille (the voice coming from the clock). */
	speaking?: number;
	/** Blink the colon. */
	blink?: boolean;
	body?: string;
	seed?: number;
	glow?: number;
};

/** Body is 360×170 at scale 1, (x, y) = top-left. */
export const DigitalClock: React.FC<DigitalClockProps> = ({x, y, scale = 1, time, ampm = 'AM', speaking = 0, blink = true, body = '#1b1b20', seed = 4, glow = 1}) => {
	const f = useCurrentFrame();
	const boil = useBoil();
	const sd = seed * 11 + boil;
	const [hh, mm] = time.split(':');
	const digits = `${hh.padStart(2, ' ')}${mm}`;
	const colon = !blink || Math.floor(f / 15) % 2 === 0;
	const on = C.red;
	const off = 'rgba(120,20,20,0.18)';
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<ellipse cx={180} cy={90} rx={230} ry={130} fill={C.red} opacity={0.1 * glow} />
			<path d={wobRect(0, 0, 360, 170, sd, 2.5)} fill={body} stroke={C.ink} strokeWidth={7} />
			<rect x={22} y={20} width={260} height={130} fill="#120405" />
			<g transform="scale(0.72) translate(36 48)">
				{digits.split('').map((d, i) => (
					<SevenSeg key={i} ch={d} x={i * 72 + (i >= 2 ? 26 : 0)} y={0} on={on} off={off} />
				))}
				<circle cx={150} cy={30} r={6} fill={colon ? on : off} />
				<circle cx={150} cy={70} r={6} fill={colon ? on : off} />
			</g>
			<text x={296} y={50} fontFamily={FONT.vcr} fontSize={26} fill={C.red}>
				{ampm}
			</text>
			{/* tiny speaker */}
			<g>
				{[0, 1, 2, 3].map((i) => (
					<line key={i} x1={296 + i * 12} y1={100} x2={296 + i * 12} y2={140} stroke={speaking > 0.05 ? '#ff8c40' : '#3a3a42'} strokeWidth={6} strokeLinecap="round" opacity={speaking > 0.05 ? 0.5 + 0.5 * Math.abs(Math.sin(f * 0.9 + i)) : 1} />
				))}
			</g>
			{speaking > 0.05 && <path d={wobEllipse(318, 120, 40, 34, sd + 3, 2)} fill="#ff8c40" opacity={0.2 * speaking} />}
		</g>
	);
};
