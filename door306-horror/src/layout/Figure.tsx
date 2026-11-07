// LAYOUT GUIDE for "the man": impossibly tall and thin, head above the doorframe, long
// arms hanging straight down past the knees, head tilted forward and bent unnaturally to
// one side, face always in shadow. Painted in the same brush texture as Mara's hallway.
// After scene 7 he is painted WHITE: visible only as faint outlines and tiny shadows.
import React from 'react';

export const TallFigure: React.FC<{
	/** feet centre */
	x: number;
	y: number;
	/** total height in px */
	h: number;
	/** head bend to the side (deg) */
	bend?: number;
	color?: string;
	outline?: string;
	opacity?: number;
	/** 'down' arms hanging; 'up' one arm raised along a wall */
	arms?: 'down' | 'up';
}> = ({x, y, h, bend = 28, color = '#141418', outline = 'rgba(0,0,0,0.8)', opacity = 1, arms = 'down'}) => {
	const u = h / 100;
	const headR = 4.2 * u;
	const neckY = y - 86 * u;
	const shY = y - 82 * u;
	const shW = 9 * u;
	const hipY = y - 46 * u;
	const head = {x: x + Math.sin((bend * Math.PI) / 180) * 7 * u, y: neckY - Math.cos((bend * Math.PI) / 180) * 6 * u};
	return (
		<g opacity={opacity}>
			{/* shapeless long garment / body */}
			<path
				d={`M${x - shW},${shY} Q${x - shW * 1.15},${hipY} ${x - shW * 0.8},${y - 6 * u} L${x - 3 * u},${y - 6 * u} L${x - 2.4 * u},${y} L${x - 0.6 * u},${y} L${x},${y - 8 * u} L${x + 0.6 * u},${y} L${x + 2.4 * u},${y} L${x + 3 * u},${y - 6 * u} L${x + shW * 0.8},${y - 6 * u} Q${x + shW * 1.15},${hipY} ${x + shW},${shY} Q${x},${shY - 3 * u} ${x - shW},${shY} Z`}
				fill={color}
				stroke={outline}
				strokeWidth={2}
			/>
			{/* arms */}
			<path d={`M${x - shW},${shY + 1 * u} Q${x - shW * 1.5},${y - 50 * u} ${x - shW * 1.25},${y - 30 * u}`} stroke={color} strokeWidth={3.2 * u} fill="none" strokeLinecap="round" />
			{arms === 'down' ? (
				<path d={`M${x + shW},${shY + 1 * u} Q${x + shW * 1.5},${y - 50 * u} ${x + shW * 1.25},${y - 30 * u}`} stroke={color} strokeWidth={3.2 * u} fill="none" strokeLinecap="round" />
			) : (
				<path d={`M${x + shW},${shY + 1 * u} Q${x + shW * 1.8},${y - 98 * u} ${x + shW * 1.4},${y - 120 * u}`} stroke={color} strokeWidth={3.2 * u} fill="none" strokeLinecap="round" />
			)}
			{/* long fingers */}
			{[-1, 1].map((sd) =>
				[0, 1, 2, 3].map((i) => (
					<line key={`${sd}${i}`} x1={x + sd * shW * 1.25 + (i - 1.5) * 0.6 * u} y1={y - 30 * u} x2={x + sd * shW * 1.25 + (i - 1.5) * 0.9 * u} y2={y - 23 * u} stroke={color} strokeWidth={0.7 * u} strokeLinecap="round" />
				)),
			)}
			{/* neck bent to the side, head tilted forward, face hidden */}
			<path d={`M${x},${shY} L${head.x},${head.y}`} stroke={color} strokeWidth={2.6 * u} strokeLinecap="round" />
			<ellipse cx={head.x} cy={head.y} rx={headR} ry={headR * 1.25} fill={color} stroke={outline} strokeWidth={2} transform={`rotate(${bend} ${head.x} ${head.y})`} />
		</g>
	);
};

/** The same figure painted white on a white wall: only a faint outline and tiny shadows. */
export const WhiteFigure: React.FC<{x: number; y: number; h: number; bend?: number; strength?: number; arms?: 'down' | 'up'}> = ({x, y, h, bend = 28, strength = 0.35, arms}) => (
	<g>
		<g transform="translate(5 6)" opacity={strength * 0.6}>
			<TallFigure x={x} y={y} h={h} bend={bend} color="rgba(120,120,128,0.5)" outline="rgba(0,0,0,0)" arms={arms} />
		</g>
		<TallFigure x={x} y={y} h={h} bend={bend} color="#f3f2ee" outline={`rgba(90,90,100,${strength})`} arms={arms} />
	</g>
);
