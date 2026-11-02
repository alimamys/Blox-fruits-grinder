// Reusable "set + camera + cast" shots used by several chapters.
import React from 'react';
import {Adam} from '../components/Characters';
import type {ApartmentRoomProps} from '../components/sets/ApartmentRoom';
import {ApartmentRoom, FLOOR_Y} from '../components/sets/ApartmentRoom';
import type {BedroomProps} from '../components/sets/Bedroom';
import {BED_SIT_Y, Bedroom} from '../components/sets/Bedroom';
import type {Cam} from '../components/Stage';
import {Layer, Stage} from '../components/Stage';
import type {StickPersonProps} from '../components/StickPerson';
import {POSES} from '../components/StickPerson';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useShot} from '../utils/timeline-context';
import {AutoRadioText, CartoonFinish, radioLevel} from './shared';

export type AdamProps = Partial<StickPersonProps> | false;

// Key world positions in the living room
export const ADAM_X = 1390;
export const ADAM_HEAD: [number, number] = [ADAM_X, 554];
export const RADIO_C: [number, number] = [990, 567];
export const DISPLAY: [number, number] = [1047, 534];
export const GRILLE: [number, number] = [935, 571];
export const DIAL: [number, number] = [1053, 597];
export const DOOR_PLATE: [number, number] = [1630, 490];
export const DOOR_GAP: [number, number] = [1630, 770];
export const DOOR_C: [number, number] = [1630, 560];
export const CLOCK_C: [number, number] = [1166, 613];

type ShotBase = {
	cam: Cam;
	handheld?: number;
	shake?: number;
	extra?: React.ReactNode;
	/** Drawn above everything in the set (incl. glowing props). */
	top?: React.ReactNode;
	overlay?: React.ReactNode;
	adam?: AdamProps;
};

/** The living room with Adam sitting at the desk by default. */
export const Room: React.FC<ShotBase & {room?: Partial<ApartmentRoomProps>}> = ({cam, room = {}, adam = {}, handheld = 0, shake = 0, extra, top, overlay}) => (
	<Stage cam={cam} handheld={handheld} shake={shake} bg={C.night} overlay={<>{overlay}<CartoonFinish /></>}>
		<Layer>
			<ApartmentRoom light={1} {...room}>
				{adam !== false && <Adam x={ADAM_X} y={FLOOR_Y} pose={POSES.sit} facing={-1} {...adam} />}
				{extra}
			</ApartmentRoom>
			{top}
		</Layer>
	</Stage>
);

/** Adam's bedroom with Adam sitting on the bed by default. */
export const BedroomShot: React.FC<ShotBase & {room?: Partial<BedroomProps>}> = ({cam, room = {}, adam = {}, handheld = 0, shake = 0, extra, top, overlay}) => (
	<Stage cam={cam} handheld={handheld} shake={shake} bg={C.night} overlay={<>{overlay}<CartoonFinish /></>}>
		<Layer>
			<Bedroom {...room}>
				{adam !== false && <Adam x={900} y={BED_SIT_Y} pose={POSES.sit} facing={1} {...adam} />}
				{extra}
			</Bedroom>
			{top}
		</Layer>
	</Stage>
);

/** Full-screen signal analyser + the current radio line as text. */
export const VoiceShot: React.FC<{theme?: 'green' | 'amber' | 'red'; freq?: string; glitch?: number; seed?: number; face?: number; label?: string}> = ({
	theme = 'green',
	freq = '07.117',
	glitch = 0.35,
	seed = 7,
	face = 0,
	label,
}) => {
	const api = useShot();
	return (
		<RadioVoiceScreen level={radioLevel(api)} theme={theme} freq={freq} seed={seed} face={face} label={label}>
			<AutoRadioText top={66} size={104} glitch={glitch} />
		</RadioVoiceScreen>
	);
};

/** Crude red marker annotation (the "documentary drawn in MS Paint" look). */
export const MarkerNote: React.FC<{text: string; x: number; y: number; size?: number; rot?: number; color?: string; opacity?: number}> = ({
	text,
	x,
	y,
	size = 72,
	rot = -4,
	color = C.red,
	opacity = 1,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			fontFamily: FONT.marker,
			fontSize: size,
			color,
			transform: `rotate(${rot}deg)`,
			opacity,
			whiteSpace: 'nowrap',
			textShadow: '3px 3px 0 rgba(0,0,0,0.35)',
		}}
	>
		{text}
	</div>
);
