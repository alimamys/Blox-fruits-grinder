// Motel room: sickly yellow/brown. Door + TV on the LEFT wall side, bed on the RIGHT,
// so Adam can face the door/TV while the bed is behind him. Floor at y = 840.
import React from 'react';
import {C} from '../../utils/palette';
import {useBoil, wobLine, wobPath, wobPoly, wobRect} from '../../utils/wobble';
import {Bed} from '../Bed';
import type {DoorProps} from '../Door';
import {Door} from '../Door';
import {DigitalClock} from '../DigitalClock';
import type {TVProps} from '../Furniture';
import {Chair, Lamp, Nightstand, Picture, TV, Window} from '../Furniture';

export const MOTEL_FLOOR = 840;
export const MOTEL_BED = {x: 980, w: 600};
export const MOTEL_TV = {x: 450, y: 384, scale: 0.78};
export const MOTEL_DOOR = {x: 120, y: 340, w: 240, h: 500};
export const MOTEL_WINDOW = {x: 1640, y: 250, w: 230, h: 290};

export type MotelRoomProps = {
	light?: number;
	/** Lights blown out: bulbs dark + broken. */
	blown?: boolean;
	tv?: Partial<TVProps>;
	door?: Partial<DoorProps>;
	clock?: string;
	bedLift?: number;
	bedRattle?: number;
	bedSink?: number;
	/** Bed flipped over (aftermath). */
	overturned?: boolean;
	windowBroken?: boolean;
	chair?: 'corner' | 'none';
	children?: React.ReactNode;
	/** Elements drawn between the bed and the characters (e.g. the thing under the bed). */
	underBed?: React.ReactNode;
	lurk?: number;
};

export const MotelRoom: React.FC<MotelRoomProps> = ({
	light = 1,
	blown = false,
	tv = {},
	door = {},
	clock = '1:16',
	bedLift = 0,
	bedRattle = 0,
	bedSink = 0,
	overturned = false,
	windowBroken = false,
	chair = 'none',
	children,
	underBed,
	lurk = 0,
}) => {
	const b = useBoil();
	const darkness = (1 - light) * 0.7;
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={MOTEL_FLOOR + 400} fill={C.motelWall} />
			{/* tired wallpaper stripes */}
			{Array.from({length: 22}).map((_, i) => (
				<rect key={i} x={-300 + i * 110} y={-400} width={36} height={MOTEL_FLOOR + 400} fill={C.motelWallDark} opacity={0.18} />
			))}
			<rect x={-400} y={MOTEL_FLOOR} width={2720} height={700} fill={C.motelFloor} />
			<path d={wobLine(-400, MOTEL_FLOOR, 2320, MOTEL_FLOOR, 600 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			{/* water stain */}
			<path d={wobPoly([[700, 40], [860, 30], [900, 110], [780, 150], [690, 110]], 601 + b, 6)} fill={C.motelWallDark} opacity={0.35} />

			<Door x={MOTEL_DOOR.x} y={MOTEL_DOOR.y} w={MOTEL_DOOR.w} h={MOTEL_DOOR.h} color="#6b5a3a" chain {...door} />
			<rect x={150} y={430} width={70} height={90} fill="#e5dcc0" stroke={C.ink} strokeWidth={3} opacity={0.85} />

			{/* dresser + TV */}
			<path d={wobRect(420, 640, 380, 200, 602 + b, 2)} fill="#6a4a26" stroke={C.ink} strokeWidth={6} />
			<path d={wobRect(440, 670, 340, 60, 603 + b, 1.5)} fill="none" stroke={C.brownDark} strokeWidth={4} />
			<path d={wobRect(440, 750, 340, 60, 604 + b, 1.5)} fill="none" stroke={C.brownDark} strokeWidth={4} />
			<TV x={MOTEL_TV.x} y={MOTEL_TV.y} scale={MOTEL_TV.scale} {...tv} />

			<Picture x={1150} y={260} w={180} h={120} tilt={2} kind="boat" />
			{windowBroken ? (
				<g>
					<path d={wobRect(MOTEL_WINDOW.x - 14, MOTEL_WINDOW.y - 14, MOTEL_WINDOW.w + 28, MOTEL_WINDOW.h + 28, 605 + b, 2)} fill={C.white} stroke={C.ink} strokeWidth={6} />
					<rect x={MOTEL_WINDOW.x} y={MOTEL_WINDOW.y} width={MOTEL_WINDOW.w} height={MOTEL_WINDOW.h} fill={C.motelNight} />
					<path d={wobPoly([[MOTEL_WINDOW.x, MOTEL_WINDOW.y], [MOTEL_WINDOW.x + 80, MOTEL_WINDOW.y], [MOTEL_WINDOW.x + 30, MOTEL_WINDOW.y + 90], [MOTEL_WINDOW.x, MOTEL_WINDOW.y + 140]], 606 + b, 2)} fill="#9fb8d8" opacity={0.7} stroke={C.ink} strokeWidth={3} />
					<path d={wobPoly([[MOTEL_WINDOW.x + MOTEL_WINDOW.w, MOTEL_WINDOW.y + MOTEL_WINDOW.h], [MOTEL_WINDOW.x + MOTEL_WINDOW.w - 90, MOTEL_WINDOW.y + MOTEL_WINDOW.h], [MOTEL_WINDOW.x + MOTEL_WINDOW.w, MOTEL_WINDOW.y + 160]], 607 + b, 2)} fill="#9fb8d8" opacity={0.7} stroke={C.ink} strokeWidth={3} />
				</g>
			) : (
				<Window x={MOTEL_WINDOW.x} y={MOTEL_WINDOW.y} w={MOTEL_WINDOW.w} h={MOTEL_WINDOW.h} curtains={0.15} curtainColor="#5a6a2a" sky={C.motelNight} cityLights={false} blinds />
			)}
			{chair === 'corner' && <Chair x={1560} y={MOTEL_FLOOR} facing={-1} color="#5a4a2a" />}

			{overturned ? (
				<g transform={`translate(${MOTEL_BED.x + MOTEL_BED.w / 2} ${MOTEL_FLOOR - 40}) rotate(172)`}>
					<path d={wobRect(-300, -50, 600, 90, 608 + b, 3)} fill="#6a4a26" stroke={C.ink} strokeWidth={6} />
					<path d={wobRect(-280, 40, 24, 50, 609 + b, 2)} fill="#6a4a26" stroke={C.ink} strokeWidth={5} />
					<path d={wobRect(256, 40, 24, 50, 610 + b, 2)} fill="#6a4a26" stroke={C.ink} strokeWidth={5} />
				</g>
			) : (
				<>
					{underBed}
					<Bed x={MOTEL_BED.x} y={MOTEL_FLOOR} w={MOTEL_BED.w} head="right" blanket="#8a6a2c" frame="#5a3c1c" lift={bedLift} rattle={bedRattle} sink={bedSink} lurk={lurk} />
				</>
			)}
			<Nightstand x={1600} y={MOTEL_FLOOR} w={130} h={110} />
			<Lamp x={1712} y={MOTEL_FLOOR - 110} scale={0.5} on={blown ? 0 : light} shade="#d8c070" />
			<DigitalClock x={1604} y={680} scale={0.3} time={clock} glow={0.6} />

			{children}

			{/* sickly yellow light */}
			{!blown && <rect x={-400} y={-400} width={2720} height={1900} fill="#c8b04a" opacity={0.12 * light} style={{mixBlendMode: 'multiply'}} />}
			{darkness > 0 && <rect x={-400} y={-400} width={2720} height={1900} fill="#0b0a12" opacity={darkness} />}
		</g>
	);
};

/** The thing under the bed: never shown – only long, thin dark limbs and shadow. */
export const UnderBedThing: React.FC<{x: number; y: number; w: number; rise: number; opacity?: number}> = ({x, y, w, rise, opacity = 1}) => {
	const b = useBoil();
	if (rise <= 0) {
		return null;
	}
	const limbs = [0.08, 0.2, 0.33, 0.46, 0.58, 0.7, 0.82, 0.93];
	return (
		<g opacity={opacity}>
			<ellipse cx={x + w / 2} cy={y - 6} rx={w * 0.6} ry={34} fill="#000" opacity={0.7} />
			<ellipse cx={x + w / 2} cy={y - rise * 0.75} rx={w * 0.42} ry={Math.max(10, rise * 0.22)} fill="#000" opacity={0.55} />
			{limbs.map((t, i) => {
				const lx = x + w * t;
				const out = i % 2 ? 1 : -1;
				const kneeX = lx + out * (30 + (i % 3) * 14);
				const kneeY = y - rise * (0.45 + (i % 3) * 0.08);
				const footX = lx + out * 10;
				return (
					<g key={i}>
						<path
							d={wobPath([[lx, y - rise + 6], [kneeX, kneeY], [footX, y]], 620 + i + b, 2)}
							stroke="#050507"
							strokeWidth={i % 3 === 0 ? 11 : 7}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path d={wobPath([[footX, y], [footX + out * 22, y + 2]], 640 + i + b, 1)} stroke="#050507" strokeWidth={5} strokeLinecap="round" />
					</g>
				);
			})}
		</g>
	);
};
