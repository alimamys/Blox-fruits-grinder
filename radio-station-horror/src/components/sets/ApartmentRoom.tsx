// Adam's living room (apartment 6B) at night. World coords 1920×1080, floor at y = 800.
// Characters go in `children` so they are darkened together with the room;
// the radio display and LED clock are drawn on top so they keep glowing.
import React from 'react';
import {C} from '../../utils/palette';
import {useBoil, wobLine, wobPoly, wobRect} from '../../utils/wobble';
import type {DoorProps} from '../Door';
import {Door} from '../Door';
import {DigitalClock} from '../DigitalClock';
import {CeilingBulb, Chair, Desk, Lamp, LightSwitch, Picture, Window} from '../Furniture';
import type {RadioProps} from '../Radio';
import {Radio} from '../Radio';

export const FLOOR_Y = 800;
export const RADIO_POS = {x: 872, y: 500, scale: 0.42};
export const DOOR_POS = {x: 1500, y: 300, w: 260, h: 500};
export const CHAIR_HOME = 1350;
export const CHAIR_AT_DOOR = 1680;

export type ApartmentRoomProps = {
	/** 0..1 room lights (lamp + ceiling). */
	light?: number;
	kitchenLight?: number;
	curtains?: number;
	radio?: Partial<RadioProps> | false;
	clock?: string | false;
	door?: Partial<DoorProps>;
	/** 0..1 desk chair dragged in front of the door. */
	chairAtDoor?: number;
	/** Hide the desk chair entirely. */
	noChair?: boolean;
	/** Rewatch detail: pale figure reflected in the window. */
	ghost?: number;
	scratch?: number;
	fingerShadow?: number;
	/** Phone lying on the kitchen counter. */
	phoneInKitchen?: boolean;
	children?: React.ReactNode;
	/** Darkness level when lights are off (default 0.62). */
	nightDarkness?: number;
	day?: number;
};

export const ApartmentRoom: React.FC<ApartmentRoomProps> = ({
	light = 1,
	kitchenLight = 0,
	curtains = 0,
	radio = {},
	clock = '1:17',
	door = {},
	chairAtDoor = 0,
	noChair = false,
	ghost = 0,
	scratch = 0,
	fingerShadow = 0,
	phoneInKitchen = false,
	children,
	nightDarkness = 0.62,
	day = 0,
}) => {
	const b = useBoil();
	const chairX = CHAIR_HOME + (CHAIR_AT_DOOR - CHAIR_HOME) * chairAtDoor;
	const darkness = (1 - light) * nightDarkness;
	return (
		<g>
			{/* wall + floor */}
			<rect x={-400} y={-400} width={2720} height={FLOOR_Y + 400} fill={C.navyWall} />
			<rect x={-400} y={-400} width={2720} height={460} fill={C.navy} opacity={0.6} />
			<rect x={-400} y={FLOOR_Y} width={2720} height={700} fill={C.floor} />
			{[860, 940, 1040].map((y, i) => (
				<path key={y} d={wobLine(-400, y, 2320, y + 4, 400 + i + b, 2)} stroke={C.floorLine} strokeWidth={4} />
			))}
			<path d={wobLine(-400, FLOOR_Y, 2320, FLOOR_Y, 410 + b, 1.5)} stroke={C.ink} strokeWidth={8} />

			{/* kitchen doorway */}
			<path d={wobRect(40, 250, 280, FLOOR_Y - 250, 420 + b, 2)} fill={kitchenLight > 0.5 ? '#c9a94a' : '#080a16'} stroke={C.ink} strokeWidth={7} />
			{kitchenLight > 0.5 && (
				<g>
					<path d={wobRect(60, 560, 240, 30, 421 + b, 1.5)} fill={C.grayLight} stroke={C.ink} strokeWidth={5} />
					<path d={wobRect(70, 590, 220, FLOOR_Y - 590, 422 + b, 1.5)} fill={C.white} stroke={C.ink} strokeWidth={5} />
					<path d={wobRect(200, 300, 90, 250, 423 + b, 1.5)} fill="#e8ecef" stroke={C.ink} strokeWidth={5} />
					<path d={`M 40 ${FLOOR_Y} L 320 ${FLOOR_Y} L 420 1080 L -40 1080 Z`} fill={C.lamp} opacity={0.15} />
				</g>
			)}
			{kitchenLight <= 0.5 && phoneInKitchen && <rect x={120} y={555} width={46} height={22} rx={4} fill="#3a4a7a" opacity={0.7} />}
			{kitchenLight > 0.5 && phoneInKitchen && <rect x={120} y={548} width={46} height={14} rx={3} fill={C.ink} />}

			<Window x={430} y={210} w={340} h={320} curtains={curtains} ghost={ghost} scratch={scratch} fingerShadow={fingerShadow} day={day} moon />

			<Picture x={980} y={230} w={150} h={110} tilt={-5} />
			<LightSwitch x={1420} y={520} on={light > 0.5} />
			<Door x={DOOR_POS.x} y={DOOR_POS.y} w={DOOR_POS.w} h={DOOR_POS.h} label="6B" chain {...door} />

			{/* rug */}
			<path d={wobPoly([[700, 900], [1300, 900], [1360, 1000], [640, 1000]], 430 + b, 3)} fill={C.maroon} stroke={C.ink} strokeWidth={6} opacity={0.9} />

			<Desk x={830} y={640} w={440} h={160} />
			<Lamp x={1215} y={640} on={light} scale={0.7} />
			<CeilingBulb x={640} y={110} on={light} />
			{!noChair && <Chair x={chairX} y={FLOOR_Y} facing={-1} rotate={chairAtDoor > 0 && chairAtDoor < 1 ? -4 : 0} />}

			{children}

			{/* darkness */}
			{darkness > 0 && <rect x={-400} y={-400} width={2720} height={1900} fill={C.night} opacity={darkness} />}
			{radio !== false && <Radio x={RADIO_POS.x} y={RADIO_POS.y} scale={RADIO_POS.scale} {...radio} />}
			{clock !== false && <DigitalClock x={1112} y={588} scale={0.3} time={clock} glow={0.6} />}
		</g>
	);
};
