// Side-view bed with the all-important dark gap underneath.
// Local origin: (x, y) = left end of the bed on the floor. Mattress top is at y - 80*scale,
// which is exactly where a <StickPerson pose={POSES.sit}> with y = floor - 6*scale sits.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../utils/palette';
import {useBoil, wobEllipse, wobPath, wobRect} from '../utils/wobble';

export type BedProps = {
	x: number;
	y: number;
	scale?: number;
	w?: number;
	blanket?: string;
	frame?: string;
	pillow?: string;
	/** Headboard at the left or right end. */
	head?: 'left' | 'right';
	/** 0..1 extra darkness/size of the shadow lurking in the gap (rewatch detail: grows each night). */
	lurk?: number;
	/** Mattress sink 0..1 (someone sits down). */
	sink?: number;
	/** px the whole bed is lifted off the floor (motel). */
	lift?: number;
	/** px rattle. */
	rattle?: number;
	/** Dim the bed (lights off) 0..1. */
	dark?: number;
	seed?: number;
};

export const BED_SEAT = 80;

export const Bed: React.FC<BedProps> = ({
	x,
	y,
	scale = 1,
	w = 560,
	blanket = C.red,
	frame = C.brown,
	pillow = C.white,
	head = 'left',
	lurk = 0,
	sink = 0,
	lift = 0,
	rattle = 0,
	dark = 0,
	seed = 9,
}) => {
	const boil = useBoil();
	const f = useCurrentFrame();
	const sd = seed * 7 + boil;
	const hbX = head === 'left' ? -10 : w - 26;
	const pillowX = head === 'left' ? 30 : w - 150;
	const sinkMid = sink * 10;
	return (
		<g transform={`translate(${x + rattle} ${y - lift}) scale(${scale})`}>
			{/* the gap: pure darkness under the bed */}
			<rect x={6} y={-36} width={w - 12} height={36 + lift / scale} fill={C.black} opacity={lift > 0 ? 0 : 1} />
			{lurk > 0 && (
				<path
					d={wobEllipse(w * 0.55, -14, 60 + lurk * 150, 10 + lurk * 9, sd + 1, 4)}
					fill="#000"
					opacity={0.6 + lurk * 0.4}
				/>
			)}
			{lurk > 0.25 && (
				<path d={wobEllipse(w * 0.55, -14, 40 + lurk * 120, 6 + lurk * 7, sd + 2, 5)} fill="#0b0b10" opacity={0.25 + 0.15 * Math.sin(f * 0.05)} />
			)}
			{/* legs */}
			<path d={wobRect(0, -40, 22, 40, sd + 3, 1.5)} fill={frame} stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(w - 22, -40, 22, 40, sd + 4, 1.5)} fill={frame} stroke={C.ink} strokeWidth={5} />
			{/* frame */}
			<path d={wobRect(-4, -56, w + 8, 20, sd + 5, 2)} fill={frame} stroke={C.ink} strokeWidth={6} />
			{/* headboard */}
			<path d={wobRect(hbX, -190, 36, 154, sd + 6, 2)} fill={frame} stroke={C.ink} strokeWidth={6} />
			{/* mattress */}
			<path
				d={wobPath(
					[
						[0, -56],
						[0, -84],
						[w * 0.35, -84 + sinkMid * 0.6],
						[w * 0.6, -84 + sinkMid],
						[w, -84],
						[w, -56],
					],
					sd + 7,
					2,
					true,
				)}
				fill="#e9e6dc"
				stroke={C.ink}
				strokeWidth={6}
			/>
			{/* pillow */}
			<path d={wobEllipse(pillowX + 60, -96, 62, 20, sd + 8, 2)} fill={pillow} stroke={C.ink} strokeWidth={5} />
			{/* blanket */}
			<path
				d={wobPath(
					head === 'left'
						? [
								[150, -90 + sinkMid * 0.3],
								[w * 0.6, -90 + sinkMid],
								[w + 8, -88],
								[w + 10, -30],
								[w - 30, -26],
								[150, -40],
							]
						: [
								[-10, -88],
								[w * 0.45, -90 + sinkMid],
								[w - 160, -90],
								[w - 160, -40],
								[30, -26],
								[-10, -30],
							],
					sd + 9,
					2.5,
					true,
				)}
				fill={blanket}
				stroke={C.ink}
				strokeWidth={6}
			/>
			{dark > 0 && <rect x={-20} y={-200} width={w + 40} height={210} fill={C.night} opacity={dark} />}
		</g>
	);
};

/** Two dust specks drifting in the dark gap, nudged by a breath. */
export const BreathDust: React.FC<{x: number; y: number; scale?: number; breath: number; opacity?: number}> = ({x, y, scale = 1, breath, opacity = 1}) => {
	const f = useCurrentFrame();
	const drift = Math.sin(f * 0.03) * 3;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
			<circle cx={0 + breath * 26 + drift} cy={-breath * 10} r={2.6} fill="#c9c6bb" opacity={0.85} />
			<circle cx={34 + breath * 38 - drift} cy={-8 - breath * 16} r={2} fill="#c9c6bb" opacity={0.7} />
		</g>
	);
};
