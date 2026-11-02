// Simple flat-colour furniture shared by the sets.
import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import {useBoil, wobEllipse, wobLine, wobPath, wobPoly, wobRect} from '../utils/wobble';

/** Small SVG noise block (TV static inside a scene). Cheap enough for screen-sized areas. */
export const SvgStatic: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; tint?: string}> = ({x, y, w, h, opacity = 1, tint}) => {
	const f = useCurrentFrame();
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	return (
		<g opacity={opacity}>
			<defs>
				<filter id={`st${id}`} x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 97} />
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncR type="linear" slope={2.4} intercept={-0.7} />
						<feFuncG type="linear" slope={2.4} intercept={-0.7} />
						<feFuncB type="linear" slope={2.4} intercept={-0.7} />
					</feComponentTransfer>
				</filter>
			</defs>
			<rect x={x} y={y} width={w} height={h} filter={`url(#st${id})`} />
			{tint && <rect x={x} y={y} width={w} height={h} fill={tint} opacity={0.25} />}
			{/* rolling bar */}
			<rect x={x} y={y + ((f * 7) % h)} width={w} height={h * 0.08} fill="#fff" opacity={0.12} />
		</g>
	);
};

export const Desk: React.FC<{x: number; y: number; w?: number; h?: number; color?: string; seed?: number}> = ({x, y, w = 440, h = 160, color = C.wood, seed = 21}) => {
	const b = useBoil();
	const sd = seed + b;
	return (
		<g>
			<path d={wobRect(x + 20, y + 26, 26, h - 26, sd, 1.5)} fill={C.brownDark} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(x + w - 46, y + 26, 26, h - 26, sd + 1, 1.5)} fill={C.brownDark} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(x, y, w, 30, sd + 2, 2)} fill={color} stroke={C.ink} strokeWidth={6} />
			<path d={wobRect(x + w * 0.5, y + 30, w * 0.4, 60, sd + 3, 1.5)} fill={color} stroke={C.ink} strokeWidth={5} />
			<circle cx={x + w * 0.7} cy={y + 60} r={5} fill={C.ink} />
		</g>
	);
};

/** Side-view wooden chair, facing right by default. (x, y) = floor under the seat front. */
export const Chair: React.FC<{x: number; y: number; scale?: number; facing?: 1 | -1; color?: string; seed?: number; rotate?: number}> = ({
	x,
	y,
	scale = 1,
	facing = 1,
	color = C.wood,
	seed = 31,
	rotate = 0,
}) => {
	const b = useBoil();
	const sd = seed + b;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) rotate(${rotate})`}>
			<path d={wobLine(-70, 0, -70, -80, sd, 1.5)} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
			<path d={wobLine(-70, 0, -70, -80, sd, 1.5)} stroke={color} strokeWidth={7} strokeLinecap="round" />
			<path d={wobLine(0, 0, 0, -80, sd + 1, 1.5)} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
			<path d={wobLine(0, 0, 0, -80, sd + 1, 1.5)} stroke={color} strokeWidth={7} strokeLinecap="round" />
			<path d={wobRect(-84, -92, 96, 18, sd + 2, 1.5)} fill={color} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(-84, -230, 16, 140, sd + 3, 1.5)} fill={color} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(-84, -230, 50, 22, sd + 4, 1.5)} fill={color} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(-84, -170, 40, 16, sd + 5, 1.5)} fill={color} stroke={C.ink} strokeWidth={5} />
		</g>
	);
};

/** Table lamp. (x, y) = base centre on the table. */
export const Lamp: React.FC<{x: number; y: number; on?: number; scale?: number; shade?: string; seed?: number}> = ({x, y, on = 1, scale = 1, shade = C.yellow, seed = 41}) => {
	const b = useBoil();
	const sd = seed + b;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			{on > 0 && <ellipse cx={0} cy={-120} rx={340} ry={300} fill={C.lamp} opacity={0.13 * on} />}
			{on > 0 && <ellipse cx={0} cy={-110} rx={170} ry={150} fill={C.lamp} opacity={0.12 * on} />}
			<path d={wobRect(-40, -14, 80, 14, sd, 1.5)} fill={C.grayDark} stroke={C.ink} strokeWidth={5} />
			<path d={wobLine(0, -14, 0, -110, sd + 1, 1.5)} stroke={C.ink} strokeWidth={8} />
			<path d={wobPoly([[-60, -100], [60, -100], [36, -190], [-36, -190]], sd + 2, 2)} fill={on > 0.5 ? shade : '#6e5d22'} stroke={C.ink} strokeWidth={6} />
		</g>
	);
};

/** Bare ceiling bulb on a cord. */
export const CeilingBulb: React.FC<{x: number; y: number; on?: number; seed?: number; swing?: number}> = ({x, y, on = 1, seed = 51, swing = 0}) => {
	const b = useBoil();
	return (
		<g transform={`rotate(${swing} ${x} 0)`}>
			<path d={wobLine(x, 0, x, y - 30, seed + b, 1.5)} stroke={C.ink} strokeWidth={5} />
			{on > 0 && <circle cx={x} cy={y} r={180} fill={C.lamp} opacity={0.1 * on} />}
			<path d={wobRect(x - 14, y - 34, 28, 16, seed + b + 1, 1)} fill={C.grayDark} stroke={C.ink} strokeWidth={4} />
			<path d={wobEllipse(x, y, 24, 28, seed + b + 2, 1.5)} fill={on > 0.5 ? '#fff6c8' : '#5c5a52'} stroke={C.ink} strokeWidth={5} />
		</g>
	);
};

export type WindowProps = {
	x: number;
	y: number;
	w?: number;
	h?: number;
	/** 0 = curtains open, 1 = closed. */
	curtains?: number;
	curtainColor?: string;
	/** Sky colour behind the glass. */
	sky?: string;
	cityLights?: boolean;
	/** Faint pale figure reflected in the glass (rewatch detail). */
	ghost?: number;
	/** 0..1 progress of claw marks scraping across the glass. */
	scratch?: number;
	/** 0..1 long finger shadows on closed curtains moving across. */
	fingerShadow?: number;
	day?: number;
	blinds?: boolean;
	seed?: number;
	moon?: boolean;
};

export const Window: React.FC<WindowProps> = ({
	x,
	y,
	w = 360,
	h = 340,
	curtains = 0,
	curtainColor = C.maroon,
	sky = C.night,
	cityLights = true,
	ghost = 0,
	scratch = 0,
	fingerShadow = 0,
	day = 0,
	blinds = false,
	seed = 61,
	moon = false,
}) => {
	const b = useBoil();
	const sd = seed + b;
	const half = (w / 2) * curtains;
	return (
		<g>
			<path d={wobRect(x - 14, y - 14, w + 28, h + 28, sd, 2)} fill={C.white} stroke={C.ink} strokeWidth={6} />
			<rect x={x} y={y} width={w} height={h} fill={day > 0 ? `rgba(255,190,120,${day})` : sky} />
			{day <= 0 && cityLights && (
				<g>
					<path d={wobPoly([[x, y + h], [x, y + h * 0.45], [x + w * 0.25, y + h * 0.45], [x + w * 0.25, y + h * 0.6], [x + w * 0.5, y + h * 0.6], [x + w * 0.5, y + h * 0.3], [x + w * 0.75, y + h * 0.3], [x + w * 0.75, y + h * 0.55], [x + w, y + h * 0.55], [x + w, y + h]], sd + 1, 2)} fill="#0c1230" />
					{Array.from({length: 14}).map((_, i) => {
						if (hash1(i, seed) < 0.35) {
							return null;
						}
						const col = i % 7;
						const row = Math.floor(i / 7);
						return <rect key={i} x={x + 14 + col * (w / 7.4)} y={y + h * 0.62 + row * 40} width={14} height={18} fill={C.yellow} opacity={0.75} />;
					})}
				</g>
			)}
			{moon && <path d={wobEllipse(x + w * 0.78, y + h * 0.2, 26, 26, sd + 9, 1.5)} fill="#f2efd8" />}
			{ghost > 0 && (
				<g opacity={ghost}>
					<ellipse cx={x + w * 0.3} cy={y + h * 0.42} rx={18} ry={22} fill="#dfe6ee" />
					<path d={`M ${x + w * 0.3 - 16} ${y + h * 0.5} L ${x + w * 0.3 - 20} ${y + h} L ${x + w * 0.3 + 20} ${y + h} L ${x + w * 0.3 + 16} ${y + h * 0.5} Z`} fill="#c9d2dc" />
				</g>
			)}
			{scratch > 0 && (
				<g>
					{[0, 1, 2, 3].map((i) => {
						const yy = y + h * 0.3 + i * 22;
						return <path key={i} d={wobLine(x + 10, yy - i * 4, x + 10 + (w - 20) * scratch, yy + 8 - i * 3, sd + 10 + i, 1.5)} stroke="#e8eef8" strokeWidth={3} opacity={0.85} />;
					})}
				</g>
			)}
			{/* frame cross */}
			<path d={wobLine(x + w / 2, y, x + w / 2, y + h, sd + 2, 1.5)} stroke={C.white} strokeWidth={10} />
			<path d={wobLine(x, y + h / 2, x + w, y + h / 2, sd + 3, 1.5)} stroke={C.white} strokeWidth={10} />
			{blinds &&
				Array.from({length: 12}).map((_, i) => (
					<line key={i} x1={x} y1={y + 8 + i * (h / 12)} x2={x + w} y2={y + 8 + i * (h / 12)} stroke="#d8cfb0" strokeWidth={10} opacity={0.9} />
				))}
			{/* curtains */}
			<path d={wobPoly([[x - 40, y - 30], [x + 30 + half, y - 30], [x + 10 + half, y + h + 30], [x - 40, y + h + 30]], sd + 4, 3)} fill={curtainColor} stroke={C.ink} strokeWidth={6} />
			<path d={wobPoly([[x + w - 30 - half, y - 30], [x + w + 40, y - 30], [x + w + 40, y + h + 30], [x + w - 10 - half, y + h + 30]], sd + 5, 3)} fill={curtainColor} stroke={C.ink} strokeWidth={6} />
			{fingerShadow > 0 && curtains > 0.8 && (
				<g opacity={0.7}>
					{[0, 1, 2, 3].map((i) => {
						const fx = x - 60 + (w + 120) * fingerShadow;
						return <path key={i} d={wobPath([[fx - 160, y + h * 0.25 + i * 26], [fx - 40, y + h * 0.28 + i * 24], [fx, y + h * 0.33 + i * 20]], sd + 20 + i, 2)} stroke="#000" strokeWidth={12} strokeLinecap="round" fill="none" />;
					})}
				</g>
			)}
			<path d={wobLine(x - 60, y - 34, x + w + 60, y - 34, sd + 6, 1.5)} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
		</g>
	);
};

export const Nightstand: React.FC<{x: number; y: number; w?: number; h?: number; seed?: number}> = ({x, y, w = 150, h = 120, seed = 71}) => {
	const b = useBoil();
	return (
		<g>
			<path d={wobRect(x, y - h, w, h, seed + b, 2)} fill={C.wood} stroke={C.ink} strokeWidth={6} />
			<path d={wobRect(x + 14, y - h + 22, w - 28, 36, seed + b + 1, 1.5)} fill="none" stroke={C.brownDark} strokeWidth={4} />
			<circle cx={x + w / 2} cy={y - h + 40} r={5} fill={C.ink} />
		</g>
	);
};

export type TVProps = {
	x: number;
	y: number;
	scale?: number;
	/** 0..1 screen power. */
	on?: number;
	/** Show static when on. */
	staticAmount?: number;
	/** Text on screen (radio voice through the TV). */
	text?: string;
	textColor?: string;
	/** Content drawn faintly in the dark glass (reflection) – screen coords 320×240. */
	reflection?: React.ReactNode;
	/** Arbitrary screen content (screen coords 320×240). */
	children?: React.ReactNode;
	seed?: number;
};

/** Old CRT television. Body 400×330 at scale 1. Screen area: (40,40) 320×240. */
export const TV: React.FC<TVProps> = ({x, y, scale = 1, on = 0, staticAmount = 1, text, textColor = '#f4f4f4', reflection, children, seed = 81}) => {
	const b = useBoil();
	const f = useCurrentFrame();
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const sd = seed + b;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			{on > 0 && <ellipse cx={200} cy={160} rx={420} ry={340} fill="#cfe3ff" opacity={0.12 * on} />}
			{/* rabbit ears */}
			<path d={wobLine(200, 0, 120, -120, sd, 1.5)} stroke="#9aa0aa" strokeWidth={6} strokeLinecap="round" />
			<path d={wobLine(200, 0, 300, -110, sd + 1, 1.5)} stroke="#9aa0aa" strokeWidth={6} strokeLinecap="round" />
			<path d={wobRect(0, 0, 400, 330, sd + 2, 3)} fill="#5a4630" stroke={C.ink} strokeWidth={8} />
			<defs>
				<clipPath id={`tv${id}`}>
					<rect x={40} y={40} width={320} height={240} rx={26} />
				</clipPath>
			</defs>
			<rect x={40} y={40} width={320} height={240} rx={26} fill="#0b0d10" />
			<g clipPath={`url(#tv${id})`}>
				{reflection && <g transform="translate(40 40)">{reflection}</g>}
				{on > 0 && (
					<g opacity={on}>
						<rect x={40} y={40} width={320} height={240} fill="#20242c" />
						{staticAmount > 0 && <SvgStatic x={40} y={40} w={320} h={240} opacity={staticAmount} />}
						{children && <g transform="translate(40 40)">{children}</g>}
						{text && (
							<text x={200} y={168} fontFamily={FONT.radio} fontSize={text.length > 16 ? 19 : 30} fill={textColor} textAnchor="middle" letterSpacing={2} opacity={0.75 + 0.25 * hash1(f, seed)}>
								{text}
							</text>
						)}
					</g>
				)}
				{/* glass sheen */}
				<path d="M 60 60 Q 120 48 200 52 L 190 80 Q 120 76 70 92 Z" fill="#fff" opacity={0.07} />
			</g>
			<rect x={40} y={40} width={320} height={240} rx={26} fill="none" stroke={C.ink} strokeWidth={6} />
			<circle cx={330} cy={306} r={9} fill="#2b2b2b" stroke={C.ink} strokeWidth={3} />
			<circle cx={300} cy={306} r={9} fill="#2b2b2b" stroke={C.ink} strokeWidth={3} />
		</g>
	);
};

/** A framed picture on the wall (slightly crooked, of course). */
export const Picture: React.FC<{x: number; y: number; w?: number; h?: number; tilt?: number; seed?: number; kind?: 'mountain' | 'boat'}> = ({x, y, w = 140, h = 100, tilt = -4, seed = 91, kind = 'mountain'}) => {
	const b = useBoil();
	return (
		<g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
			<path d={wobRect(x, y, w, h, seed + b, 1.5)} fill="#7fb0d8" stroke={C.brownDark} strokeWidth={8} />
			{kind === 'mountain' ? (
				<path d={wobPoly([[x + 6, y + h - 6], [x + w * 0.4, y + h * 0.3], [x + w * 0.6, y + h * 0.6], [x + w * 0.75, y + h * 0.45], [x + w - 6, y + h - 6]], seed + b + 1, 1.5)} fill={C.green} stroke={C.ink} strokeWidth={3} />
			) : (
				<path d={wobPoly([[x + w * 0.25, y + h * 0.65], [x + w * 0.75, y + h * 0.65], [x + w * 0.65, y + h * 0.8], [x + w * 0.35, y + h * 0.8]], seed + b + 1, 1.5)} fill={C.red} stroke={C.ink} strokeWidth={3} />
			)}
		</g>
	);
};

/** Light switch. */
export const LightSwitch: React.FC<{x: number; y: number; on?: boolean}> = ({x, y, on = true}) => (
	<g>
		<rect x={x} y={y} width={34} height={52} rx={4} fill="#e9e4d4" stroke={C.ink} strokeWidth={4} />
		<rect x={x + 11} y={on ? y + 10 : y + 26} width={12} height={16} rx={2} fill="#bdb6a2" stroke={C.ink} strokeWidth={3} />
	</g>
);
