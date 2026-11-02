// A chunky cartoon smartphone. Screen content is passed as children drawn in
// screen coordinates (0..260 × 0..500).
import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobRect} from '../utils/wobble';

export type PhoneProps = {
	x: number;
	y: number;
	scale?: number;
	rotate?: number;
	/** 0..1 screen brightness. */
	screen?: number;
	/** px of buzz jitter. */
	buzz?: number;
	seed?: number;
	children?: React.ReactNode;
};

export const PHONE_W = 300;
export const PHONE_H = 580;

export const Phone: React.FC<PhoneProps> = ({x, y, scale = 1, rotate = 0, screen = 1, buzz = 0, seed = 8, children}) => {
	const f = useCurrentFrame();
	const boil = useBoil();
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const bx = buzz ? Math.sin(f * 2.7) * buzz : 0;
	return (
		<g transform={`translate(${x + bx} ${y}) rotate(${rotate}) scale(${scale})`}>
			{screen > 0 && <ellipse cx={150} cy={290} rx={260} ry={330} fill="#bfe0ff" opacity={0.08 * screen} />}
			<path d={wobRect(0, 0, PHONE_W, PHONE_H, seed * 3 + boil, 3)} fill="#141418" stroke={C.ink} strokeWidth={8} />
			<defs>
				<clipPath id={`scr${id}`}>
					<rect x={20} y={44} width={260} height={500} rx={8} />
				</clipPath>
			</defs>
			<rect x={20} y={44} width={260} height={500} rx={8} fill="#05060a" />
			<g clipPath={`url(#scr${id})`} opacity={screen}>
				<g transform="translate(20 44)">{children}</g>
			</g>
			<rect x={120} y={18} width={60} height={10} rx={5} fill="#2a2a30" />
		</g>
	);
};

/** Lock-screen style notification card for the phone screen. */
export const PhoneNotification: React.FC<{y: number; app: string; title: string; body: string; color?: string; opacity?: number; dx?: number}> = ({
	y,
	app,
	title,
	body,
	color = C.red,
	opacity = 1,
	dx = 0,
}) => (
	<g transform={`translate(${10 + dx} ${y})`} opacity={opacity}>
		<rect width={240} height={96} rx={14} fill="rgba(240,240,245,0.93)" />
		<rect x={12} y={12} width={22} height={22} rx={6} fill={color} />
		<text x={42} y={29} fontFamily={FONT.ui} fontSize={13} fill="#555" fontWeight={600}>
			{app}
		</text>
		<text x={228} y={29} fontFamily={FONT.ui} fontSize={12} fill="#888" textAnchor="end">
			now
		</text>
		<text x={14} y={56} fontFamily={FONT.ui} fontSize={15} fill="#111" fontWeight={600}>
			{title}
		</text>
		<text x={14} y={78} fontFamily={FONT.ui} fontSize={13} fill="#333">
			{body}
		</text>
	</g>
);
