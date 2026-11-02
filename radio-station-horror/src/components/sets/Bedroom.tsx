// Adam's bedroom. Floor at y = 830. Bed from x = 640, 620 wide; mattress top at y = 750.
import React from 'react';
import {C} from '../../utils/palette';
import {useBoil, wobLine, wobRect} from '../../utils/wobble';
import {Bed} from '../Bed';
import type {DoorProps} from '../Door';
import {Door} from '../Door';
import {DigitalClock} from '../DigitalClock';
import {Lamp, Nightstand, Picture, Window} from '../Furniture';

export const BED_FLOOR = 830;
export const BED_X = 640;
export const BED_W = 620;
/** y to pass to a sitting StickPerson (scale 1) so they sit on the mattress. */
export const BED_SIT_Y = BED_FLOOR - 6;
export const CLOCK_POS = {x: 1300, y: 654, scale: 0.34};

export type BedroomProps = {
	light?: number;
	curtains?: number;
	door?: Partial<DoorProps>;
	clock?: string;
	clockSpeaking?: number;
	/** Shadow in the gap under the bed (grows night after night). */
	lurk?: number;
	sink?: number;
	rattle?: number;
	children?: React.ReactNode;
	/** Darkness level when lights are off. */
	nightDarkness?: number;
	day?: number;
	/** Extra elements drawn above the darkness (e.g. glowing eyes – unused, less is more). */
	overDark?: React.ReactNode;
};

export const Bedroom: React.FC<BedroomProps> = ({
	light = 1,
	curtains = 1,
	door = {},
	clock = '1:17',
	clockSpeaking = 0,
	lurk = 0,
	sink = 0,
	rattle = 0,
	children,
	nightDarkness = 0.66,
	day = 0,
	overDark,
}) => {
	const b = useBoil();
	const darkness = (1 - light) * nightDarkness;
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={BED_FLOOR + 400} fill="#1c2147" />
			<rect x={-400} y={BED_FLOOR} width={2720} height={700} fill="#2c2236" />
			<path d={wobLine(-400, BED_FLOOR, 2320, BED_FLOOR, 500 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			{[900, 990].map((y, i) => (
				<path key={y} d={wobLine(-400, y, 2320, y + 3, 501 + i + b, 2)} stroke={C.floorLine} strokeWidth={4} />
			))}
			<Window x={170} y={230} w={300} h={300} curtains={curtains} day={day} curtainColor="#2d4f8a" />
			<Picture x={860} y={300} w={130} h={100} tilt={4} kind="boat" />
			<Door x={1580} y={330} w={240} h={500} {...door} />
			<Bed x={BED_X} y={BED_FLOOR} w={BED_W} blanket={C.red} lurk={lurk} sink={sink} rattle={rattle} />
			<Nightstand x={1290} y={BED_FLOOR} />
			<Lamp x={1440} y={BED_FLOOR - 120} scale={0.6} on={light} />
			{/* rug */}
			<path d={wobRect(380, 900, 260, 60, 510 + b, 3)} fill="#3b5f9c" stroke={C.ink} strokeWidth={5} />
			{children}
			{darkness > 0 && <rect x={-400} y={-400} width={2720} height={1900} fill={C.night} opacity={darkness} />}
			<DigitalClock x={CLOCK_POS.x} y={CLOCK_POS.y} scale={CLOCK_POS.scale} time={clock} speaking={clockSpeaking} glow={0.8} />
			{overDark}
		</g>
	);
};
