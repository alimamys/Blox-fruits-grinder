// Apartment / dorm / motel door with an optional lit gap underneath where
// shadows of feet can appear.
import React from 'react';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobEllipse, wobLine, wobRect} from '../utils/wobble';

export type DoorProps = {
	/** Top-left of the door frame. */
	x: number;
	y: number;
	w?: number;
	h?: number;
	label?: string;
	color?: string;
	/** 0..1 how far it is open (hinge on the left). */
	open?: number;
	/** Horizontal rattle in px (knocking). */
	rattle?: number;
	/** 0..1 light from the hallway shining through the gap. */
	gapLight?: number;
	/** 0..1 opacity of two feet shadows in the gap. */
	feet?: number;
	/** Horizontal shift of the feet shadows (px). */
	feetX?: number;
	chain?: boolean;
	/** Deadbolt turned (locked). */
	locked?: number;
	seed?: number;
	/** Darkness overlay 0..1 (lights off). */
	dark?: number;
	/** What is beyond the door when open. */
	beyond?: string;
	handleTurn?: number;
};

export const Door: React.FC<DoorProps> = ({
	x,
	y,
	w = 260,
	h = 500,
	label,
	color = C.wood,
	open = 0,
	rattle = 0,
	gapLight = 0,
	feet = 0,
	feetX = 0,
	chain = false,
	locked = 0,
	seed = 5,
	dark = 0,
	beyond = '#05060c',
	handleTurn = 0,
}) => {
	const boil = useBoil();
	const sd = seed * 13 + boil;
	const panelW = w * (1 - open * 0.82);
	return (
		<g>
			{/* frame */}
			<path d={wobRect(x - 18, y - 18, w + 36, h + 18, sd, 2)} fill={C.brownDark} stroke={C.ink} strokeWidth={6} />
			{/* opening */}
			<rect x={x} y={y} width={w} height={h} fill={beyond} />
			{/* gap under door + hallway light */}
			<rect x={x} y={y + h - 4} width={w} height={12} fill={C.ink} />
			{gapLight > 0 && <rect x={x + 4} y={y + h - 3} width={w - 8} height={9} fill={C.lamp} opacity={gapLight} />}
			{gapLight > 0 && (
				<path d={`M ${x - 20} ${y + h + 8} L ${x + w + 20} ${y + h + 8} L ${x + w + 120} ${y + h + 70} L ${x - 120} ${y + h + 70} Z`} fill={C.lamp} opacity={gapLight * 0.12} />
			)}
			{feet > 0 &&
				[0, 1].map((i) => (
					<ellipse key={i} cx={x + w / 2 - 36 + i * 72 + feetX} cy={y + h + 2} rx={26} ry={6} fill={C.black} opacity={feet} />
				))}
			{/* door panel */}
			<g transform={`translate(${rattle} 0)`}>
				<path d={wobRect(x, y, panelW, h - 4, sd + 1, 2.5)} fill={color} stroke={C.ink} strokeWidth={6} />
				{open < 0.5 && (
					<>
						<path d={wobRect(x + panelW * 0.14, y + h * 0.08, panelW * 0.72, h * 0.34, sd + 2, 2)} fill="none" stroke={C.brownDark} strokeWidth={5} />
						<path d={wobRect(x + panelW * 0.14, y + h * 0.52, panelW * 0.72, h * 0.38, sd + 3, 2)} fill="none" stroke={C.brownDark} strokeWidth={5} />
						{/* peephole */}
						<circle cx={x + panelW / 2} cy={y + h * 0.26} r={7} fill="#cfd6e0" stroke={C.ink} strokeWidth={3} />
						{label && (
							<g>
								<path d={wobRect(x + panelW / 2 - 46, y + h * 0.33, 92, 50, sd + 4, 1.5)} fill="#d8c27a" stroke={C.ink} strokeWidth={4} />
								<text x={x + panelW / 2} y={y + h * 0.33 + 38} fontFamily={FONT.paint} fontWeight={700} fontSize={36} fill={C.ink} textAnchor="middle">
									{label}
								</text>
							</g>
						)}
						{/* handle */}
						<g transform={`rotate(${handleTurn * -35} ${x + panelW * 0.85} ${y + h * 0.55})`}>
							<path d={wobEllipse(x + panelW * 0.85, y + h * 0.55, 13, 13, sd + 5, 1)} fill={C.yellow} stroke={C.ink} strokeWidth={4} />
							<path d={wobLine(x + panelW * 0.85, y + h * 0.55, x + panelW * 0.85 - 30, y + h * 0.55, sd + 6, 1)} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
						</g>
						{/* deadbolt */}
						<circle cx={x + panelW * 0.85} cy={y + h * 0.46} r={10} fill="#c7c7c7" stroke={C.ink} strokeWidth={3} />
						<line
							x1={x + panelW * 0.85}
							y1={y + h * 0.46}
							x2={x + panelW * 0.85 + Math.sin(locked * Math.PI / 2) * 9}
							y2={y + h * 0.46 - Math.cos(locked * Math.PI / 2) * 9}
							stroke={C.ink}
							strokeWidth={4}
						/>
						{chain && (
							<path d={`M ${x + panelW - 6} ${y + h * 0.4} q -30 26 -64 6`} stroke="#c7c7c7" strokeWidth={5} fill="none" strokeDasharray="8 4" />
						)}
					</>
				)}
			</g>
			{dark > 0 && <rect x={x - 20} y={y - 20} width={w + 40} height={h + 20} fill={C.night} opacity={dark} />}
		</g>
	);
};
