// The night drive: the truck at the bottom of the hill, the farmhouse window, Mr. Widemouth in it.
import React from 'react';
import {Dad, Eli} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import type {StickProps} from '../components/characters/StickPerson';
import {GEO, Tint, Truck, type Light} from './kit';

type KidProps = Partial<Omit<StickProps, 'palette'>>;

export const TRUCK = {x: 820, s: 0.85};
/** world position of the truck's passenger window centre */
export const truckWindow = (truckX: number, ground: number, s = TRUCK.s): [number, number] => [truckX - 245 * s, ground - 250 * s];

/** Eli inside the cab, face to the glass (truck-local coordinates). */
export const EliInCab: React.FC<{frame: number; p?: KidProps; night?: boolean}> = ({frame, p = {}, night = true}) => (
	<Tint light={night ? 'night' : 'day'}>
		<Eli x={-232} y={-148} s={0.78} frame={frame} pose="sit" look={[1, -0.7]} arms={{l: [10, 0], r: [96, -70]}} {...p} />
	</Tint>
);

/** The tiny figure in the lit upstairs window, seen from the bottom of the hill. */
export const HouseWindowFigure: React.FC<{frame: number | null; waving?: boolean; lightOff?: number}> = ({frame, waving = false, lightOff = 0}) => {
	const [x0, y0, x1, y1] = GEO.driveway_night.window;
	return (
		<g>
			<defs>
				<clipPath id="hwClip">
					<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
				</clipPath>
				<filter id="silh" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values="0.12 0 0 0 0.02  0 0.1 0 0 0.02  0 0 0.1 0 0.03  0 0 0 1 0" />
				</filter>
			</defs>
			<g clipPath="url(#hwClip)" opacity={1 - lightOff}>
				<g filter="url(#silh)">
					<Widemouth x={(x0 + x1) / 2} y={y1 - 2} s={0.2} frame={frame} knife arms={waving ? 'wave' : 'down'} />
				</g>
			</g>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#141a28" opacity={lightOff} />
		</g>
	);
};

/** The driveway at 4 a.m.: the truck (with Eli inside) and the house on the hill. */
export const DrivewayWorld: React.FC<{frame: number; truckX: number; dist: number; eli?: KidProps; wave?: boolean; still?: boolean; lightOff?: number; dad?: KidProps & {x: number}; eliInCab?: boolean; truck?: boolean}> = ({
	frame,
	truckX,
	dist,
	eli,
	wave = false,
	still = false,
	lightOff = 0,
	dad,
	eliInCab = true,
	truck = true,
}) => {
	const g = GEO.driveway_night.ground;
	return (
		<g>
			<HouseWindowFigure frame={still ? null : frame} waving={wave} lightOff={lightOff} />
			{truck ? (
				<Tint light="night">
					<Truck x={truckX} y={g} s={TRUCK.s} frame={frame} dist={dist} lights night inside={eliInCab ? <EliInCab frame={frame} p={eli} /> : null} />
				</Tint>
			) : null}
			{dad ? (
				<Tint light="night">
					<Dad s={1.55} y={g + 10} frame={frame} {...dad} />
				</Tint>
			) : null}
		</g>
	);
};

/** Close on the bedroom window from outside: Mr. Widemouth standing in it with the steak knife. */
export const WindowWorld: React.FC<{frame: number; still?: boolean; wave?: boolean; mouth?: 'smile' | 'grin' | 'flat'; look?: [number, number]; light?: Light}> = ({frame, still = false, wave = false, mouth = 'smile', look = [0, 0.3], light = 'night'}) => {
	const [x0, y0, x1, y1] = GEO.window_out_night.pane;
	return (
		<g>
			<defs>
				<clipPath id="paneClip">
					<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
				</clipPath>
				<radialGradient id="roomGlow" cx="0.5" cy="0.4" r="0.7">
					<stop offset="0" stopColor="#3a4258" stopOpacity={0.9} />
					<stop offset="1" stopColor="#0b0d14" stopOpacity={0} />
				</radialGradient>
			</defs>
			<g clipPath="url(#paneClip)">
				<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#roomGlow)" />
				<Tint light={light}>
					<Widemouth x={(x0 + x1) / 2} y={GEO.window_out_night.sill} s={1.25} frame={still ? null : frame} knife arms={wave ? 'wave' : 'down'} mouth={mouth} look={look} />
				</Tint>
				<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#9fb4d0" opacity={0.08} />
				<path d={`M${x0 + 30},${y1 - 60} L${x0 + 200},${y0 + 30} M${x0 + 90},${y1 - 20} L${x0 + 240},${y0 + 110}`} stroke="#d8e4ff" strokeOpacity={0.14} strokeWidth={16} strokeLinecap="round" />
			</g>
		</g>
	);
};
