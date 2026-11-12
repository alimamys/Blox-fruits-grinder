// MR. WIDEMOUTH as a stick-figure-world creature, drawn with the same wobbly ink lines as StickPerson:
// cat-sized, a huge round grey head on a tiny furry body, two big glossy black eyes, crooked ears (the left
// one bent over), and a mouth from ear to ear. Everything is code, so he can walk, wave, hold the knife and
// talk - the mouth opens along its WHOLE width with the voice.
import React from 'react';
import {boilOf, h1, wob, wobCircle, wobEllipse, wobLine, type Pt} from '../../utils/rough';

const INK = '#141414';
const FUR = '#9a9890';
const FUR_DARK = '#7d7b74';

export type WMouth = 'smile' | 'grin' | 'flat' | 'sad' | 'snarl';
export type WArms = 'down' | 'wave' | 'waveB' | 'reach' | 'up' | 'hold';

export interface WidemouthProps {
	x?: number;
	y?: number;
	/** scale: 1 = about 150 px tall (a cat next to a 300 px adult) */
	s?: number;
	frame: number | null;
	mouth?: WMouth;
	/** 0..1 mouth opening while he talks */
	talk?: number;
	arms?: WArms;
	knife?: boolean;
	/** eye direction -1..1 */
	look?: [number, number];
	/** walking phase (radians) */
	phase?: number;
	walking?: boolean;
	/** only the head, cut off by something in front (peeking from under a bed skirt) */
	peek?: boolean;
	flip?: boolean;
	opacity?: number;
	/** ears flat back (the snarl) */
	earsBack?: boolean;
	/** eyes glow faintly in the dark */
	glow?: boolean;
	/** head tilt in degrees */
	tilt?: number;
}

export const Widemouth: React.FC<WidemouthProps> = ({
	x = 0,
	y = 0,
	s = 1,
	frame,
	mouth = 'smile',
	talk = 0,
	arms = 'down',
	knife = false,
	look = [0, 0],
	phase = 0,
	walking = false,
	peek = false,
	flip = false,
	opacity = 1,
	earsBack = false,
	glow = false,
	tilt = 0,
}) => {
	const fr = frame ?? 0;
	const boil = frame === null ? 0 : boilOf(fr, 4);
	const sd = 77 + boil * 7;
	const amp = frame === null ? 0.5 : 0.9;
	const lw = 5.5;
	const breath = frame === null ? 0 : Math.sin(fr / 24 * 2 * Math.PI / 3.2);
	const bob = walking ? -Math.abs(Math.sin(phase)) * 5 : 0;
	const headR = 62;
	const hy = -138 + bob - breath * 1.2;
	const parts: React.ReactNode[] = [];

	if (!peek) parts.push(<ellipse key="shadow" cx={0} cy={-2} rx={44} ry={9} fill="#000" opacity={0.25} />);
	if (!peek) {
		// legs
		const lg = (side: number, k: number) => {
			const sw = walking ? Math.sin(phase + (side > 0 ? 0 : Math.PI)) * 9 : 0;
			const x0 = side * 13, y0 = -48 + bob;
			const d = wobLine(x0, y0, x0 + sw, -6, sd + k, amp * 0.6, 2);
			return (
				<g key={`leg${k}`}>
					<path d={d} stroke={INK} strokeWidth={22} strokeLinecap="round" />
					<path d={d} stroke={FUR_DARK} strokeWidth={12} strokeLinecap="round" />
				</g>
			);
		};
		parts.push(lg(-1, 1), lg(1, 2));
		// body
		parts.push(<path key="body" d={wobEllipse(0, -62 + bob - breath, 30, 34, sd + 3, amp)} fill={FUR} stroke={INK} strokeWidth={lw} />);
		parts.push(<path key="belly" d={wobEllipse(0, -56 + bob - breath, 17, 19, sd + 4, amp * 0.6)} fill="#b3b1a9" stroke="none" />);
		// arms
		const shoulder = (side: number): Pt => [side * 26, -78 + bob - breath];
		const arm = (side: number, hand: Pt, k: number) => {
			const [sx, sy] = shoulder(side);
			return (
				<g key={`arm${k}`}>
					<path d={wobLine(sx, sy, hand[0], hand[1], sd + 10 + k, amp * 0.6)} stroke={INK} strokeWidth={14} strokeLinecap="round" />
					<path d={wobLine(sx, sy, hand[0], hand[1], sd + 10 + k, amp * 0.6)} stroke={FUR} strokeWidth={7} strokeLinecap="round" />
					<path d={wobCircle(hand[0], hand[1], 8, sd + 20 + k, 0.8, 7)} fill={FUR} stroke={INK} strokeWidth={4} />
				</g>
			);
		};
		const w = Math.sin(fr / 24 * 2 * Math.PI * 1.6);
		const R: Pt =
			arms === 'wave' || arms === 'waveB' ? [92 + w * 6, -128 + bob - Math.abs(w) * 6] : arms === 'reach' ? [70, -86 + bob] : arms === 'up' ? [86, -140 + bob] : [34, -36 + bob];
		const L: Pt = arms === 'up' ? [-86, -140 + bob] : arms === 'hold' ? [-30, -70 + bob] : [-34, -36 + bob];
		parts.push(arm(-1, L, 1));
		if (knife) {
			// a big kitchen knife in his left hand, point down
			const [kx, ky] = L;
			parts.push(
				<g key="knife">
					<path d={`M${kx - 6},${ky - 4} L${kx + 6},${ky - 4} L${kx + 5},${ky + 18} L${kx - 5},${ky + 18} Z`} fill="#6b4a2b" stroke={INK} strokeWidth={3} />
					<path d={`M${kx - 7},${ky + 18} L${kx + 8},${ky + 18} L${kx + 2},${ky + 92} Z`} fill="#dfe4e8" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
				</g>,
			);
		}
		parts.push(arm(1, R, 2));
	}

	const headStart = parts.length;
	// ears twitch now and then (a quick flick, never both at once)
	const flick = (off: number) => {
		if (frame === null) return 0;
		const c = (fr + off) % 89;
		return c < 6 ? Math.sin((c / 6) * Math.PI) * 14 : 0;
	};
	// ears: right one pointed, left one bent over at the tip
	const earR: Pt[] = earsBack ? [[34, hy - 44], [80, hy - 64], [58, hy - 22]] : [[30, hy - 46], [56, hy - 104], [62, hy - 36]];
	const earL: Pt[] = earsBack ? [[-34, hy - 44], [-80, hy - 64], [-58, hy - 22]] : [[-30, hy - 46], [-44, hy - 96], [-82, hy - 84], [-60, hy - 34]];
	parts.push(<path key="earR" transform={`rotate(${flick(0)} 44 ${hy - 40})`} d={wob(earR, sd + 30, amp)} fill={FUR} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />);
	parts.push(<path key="earL" transform={`rotate(${-flick(41)} -44 ${hy - 40})`} d={wob(earL, sd + 31, amp)} fill={FUR} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />);
	// head
	parts.push(<path key="head" d={wobCircle(0, hy, headR, sd + 32, 1.2, 12)} fill={FUR} stroke={INK} strokeWidth={lw} />);
	parts.push(<path key="shade" d={wobEllipse(10, hy + 18, headR * 0.82, headR * 0.6, sd + 33, 1)} fill={FUR_DARK} opacity={0.35} />);
	// eyes: big, glossy, black - no whites
	const ex = 24, ey = hy - 12, er = 15;
	for (const side of [-1, 1]) {
		const cx = side * ex + look[0] * 2;
		if (glow) parts.push(<circle key={`g${side}`} cx={cx} cy={ey} r={er * 1.9} fill="#dfe8ff" opacity={0.18} />);
		parts.push(<path key={`e${side}`} d={wobCircle(cx, ey + look[1] * 2, er, sd + 40 + side, 0.5, 9)} fill="#060606" stroke={INK} strokeWidth={3} />);
		parts.push(<circle key={`h${side}`} cx={cx + 5 + look[0] * 3} cy={ey - 5 + look[1] * 2} r={4.2} fill="#ffffff" />);
	}
	// the mouth, ear to ear
	const mw = 52, my = hy + 22;
	const open = Math.max(0, Math.min(1, talk));
	if (mouth === 'snarl') {
		parts.push(<path key="m" d={`M${-mw},${my - 4} Q0,${my + 30} ${mw},${my - 4} Q0,${my + 2} ${-mw},${my - 4} Z`} fill="#2a0e0e" stroke={INK} strokeWidth={4} />);
		const teeth = [];
		for (let i = -5; i <= 5; i++) {
			const tx = i * 9;
			const ty = my - 3 + Math.abs(i) * 0.6;
			teeth.push(<path key={`t${i}`} d={`M${tx - 4},${ty} L${tx},${ty + 9} L${tx + 4},${ty} Z`} fill="#f2ede2" />);
		}
		parts.push(<g key="teeth">{teeth}</g>);
	} else if (mouth === 'grin' || open > 0.05) {
		const depth = mouth === 'grin' ? 22 : 6 + open * 16;
		parts.push(<path key="m" d={`M${-mw},${my} Q0,${my + 12 + depth} ${mw},${my} Q0,${my + 8} ${-mw},${my} Z`} fill="#2a0e0e" stroke={INK} strokeWidth={4} strokeLinejoin="round" />);
		if (mouth === 'grin' || open > 0.4) {
			const teeth = [];
			for (let i = -4; i <= 4; i++) teeth.push(<path key={`t${i}`} d={`M${i * 10.5 - 5},${my + 1 - Math.abs(i) * 0.8} L${i * 10.5 + 5},${my + 1 - Math.abs(i) * 0.8} L${i * 10.5},${my + 12 - Math.abs(i) * 1.2} Z`} fill="#f2ede2" stroke={INK} strokeWidth={1.2} />);
			parts.push(<g key="teeth">{teeth}</g>);
		}
	} else if (mouth === 'flat') {
		parts.push(<path key="m" d={wobLine(-mw * 0.8, my + 4, mw * 0.8, my + 4, sd + 50, 0.6)} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />);
	} else if (mouth === 'sad') {
		parts.push(<path key="m" d={`M${-mw * 0.5},${my + 10} Q0,${my} ${mw * 0.5},${my + 10}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />);
	} else {
		parts.push(<path key="m" d={`M${-mw - 6},${my - 14} C${-mw * 0.55},${my + 22} ${mw * 0.55},${my + 22} ${mw + 6},${my - 14}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />);
		for (const sg of [-1, 1]) parts.push(<path key={`c${sg}`} d={`M${sg * (mw + 6)},${my - 14} l${sg * 5},${-6}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
	}
	const headParts = parts.splice(headStart);
	return (
		<g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`} opacity={opacity}>
			{parts}
			<g transform={`rotate(${tilt} 0 ${hy + 50})`}>{headParts}</g>
		</g>
	);
};
