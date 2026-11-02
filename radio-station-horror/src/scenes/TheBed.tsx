// ~3:12 – The bed. Chair against the door, lights off, the voice moves to the
// alarm clock, "Do not look underneath", breathing. Nothing is ever shown.
import React from 'react';
import {BreathDust} from '../components/Bed';
import {CHAIR_AT_DOOR, CHAIR_HOME} from '../components/sets/ApartmentRoom';
import {BED_FLOOR, BED_SIT_Y, CLOCK_POS} from '../components/sets/Bedroom';
import {camKeys} from '../components/Stage';
import {mixPose, POSES, runPose, walkPose} from '../components/StickPerson';
import {EASE, hit, ramp} from '../utils/anim';
import {C} from '../utils/palette';
import {Shot, useShot} from '../utils/timeline-context';
import {AutoRadioText, radioLevel} from './shared';
import {BedroomShot, MarkerNote, RADIO_C, Room, VoiceShot} from './rooms';

const CLOCK_SPK: [number, number] = [CLOCK_POS.x + 314 * CLOCK_POS.scale, CLOCK_POS.y + 120 * CLOCK_POS.scale];
const FEET: [number, number] = [985, 800];

const B01OneNight: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Room
			cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1], zoom: 2.4}], [dur, {x: RADIO_C[0], y: RADIO_C[1], zoom: 2.7}]], EASE.linear)}
			room={{radio: {power: 1, speaking: 0.7, readout: '01.17'}}}
			adam={false}
		/>
	);
};

const B02Chair: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const did = api.at('did1');
	const t = ramp(f, did - 10, dur - 4, 0, 1, EASE.inOut);
	const chairX = CHAIR_HOME + (CHAIR_AT_DOOR - CHAIR_HOME) * t;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: 1400, y: 560, zoom: 1.5}], [dur, {x: 1520, y: 560, zoom: 1.65}]])}
				room={{radio: {power: 1, speaking: radioLevel(api)}, chairAtDoor: t}}
				adam={{x: chairX - 100, pose: t > 0 && t < 1 ? mixPose(walkPose(f * 0.25, 0.6), POSES.reachLow, 0.6) : POSES.stand, facing: 1, expression: 'determined', look: [1, 0.4]}}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B03Lights: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const did = api.at('did2');
	const light = f < did + 2 ? 1 : 0;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: 1300, y: 540, zoom: 1.5}], [dur, {x: 1260, y: 540, zoom: 1.4}]])}
				room={{radio: {power: 1, speaking: radioLevel(api)}, chairAtDoor: 1, light, nightDarkness: 0.72}}
				adam={{x: 1380, pose: f > did - 8 && f < did + 6 ? POSES.reach : POSES.stand, facing: 1, expression: 'determined', look: [1, -0.2]}}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B04Phone: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const hes = api.at('hesitated');
	const obeyed = f > api.at('obeyed') + 6;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: 300, y: 560, zoom: 1.7}], [hes, {x: 330, y: 500, zoom: 2.2}], [dur, {x: 250, y: 560, zoom: 1.8}]])}
				room={{radio: {power: 1, speaking: radioLevel(api)}, chairAtDoor: 1, light: 0, nightDarkness: 0.6, kitchenLight: 0, phoneInKitchen: obeyed}}
				adam={{x: 420, pose: obeyed ? POSES.stand : f > hes ? POSES.holdPhone : POSES.holdPhoneLow, facing: -1, expression: f > hes && !obeyed ? 'worried' : 'determined', look: [0.5, -0.4]}}
				top={!obeyed ? <ellipse cx={f > hes ? 390 : 440} cy={f > hes ? 440 : 560} rx={50} ry={40} fill="#bfe0ff" opacity={0.25} /> : null}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B05Walked: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const walk = ramp(f, api.at('walked'), dur, 0, 1, EASE.linear);
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: 1400, y: 560, zoom: 1.35}], [dur, {x: 1250, y: 560, zoom: 1.4}]])}
				room={{light: 0, nightDarkness: 0.55, door: {open: 1, beyond: '#0a0d1c'}, lurk: 0.7}}
				adam={{x: 1700 - walk * 420, y: 830, pose: walkPose(f * 0.22), facing: -1, expression: 'worried', look: [1, 0]}}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B06Close: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const open = ramp(f, api.at('closed') - 6, api.at('closed') + 8, 1, 0);
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: 1600, y: 560, zoom: 1.7}], [dur, {x: 1620, y: 560, zoom: 1.85}]])}
				room={{light: 0, nightDarkness: 0.55, door: {open, beyond: '#0a0d1c'}, lurk: 0.7}}
				adam={{x: 1450, y: 830, pose: POSES.reach, facing: 1, expression: 'worried', look: [1, 0]}}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B07Sat: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const sat = api.at('sat');
	const sit = ramp(f, sat, sat + 12);
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: 1000, y: 600, zoom: 1.3}], [dur, {x: 960, y: 620, zoom: 1.5}]])}
				room={{light: 0, nightDarkness: 0.55, lurk: 0.7}}
				adam={{x: 900, y: BED_SIT_Y, pose: mixPose(POSES.stand, POSES.sit, sit), facing: 1, expression: 'worried', look: [1, 0.3]}}
			/>
			<AutoRadioText top={14} size={68} />
		</>
	);
};

const B08Final: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 960, y: 600, zoom: 1.6}], [dur, {x: 930, y: 560, zoom: 2.1}]], EASE.linear)}
			room={{light: 0, nightDarkness: 0.55, lurk: 0.7}}
			adam={{expression: 'scared', look: [1, 0.4]}}
		/>
	);
};

const B10Cold: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 905, y: 585, zoom: 3.4}], [dur, {x: 905, y: 585, zoom: 3.9}]], EASE.linear)}
			room={{light: 0, nightDarkness: 0.45, lurk: 0.7}}
			adam={{expression: 'terrified', look: [0, 0.6], pale: ramp(f, 0, dur * 0.7, 0, 1), tremble: 0.5}}
		/>
	);
};

const B11LivingRoom: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1000, y: 580, zoom: 1.8}], [dur, {x: RADIO_C[0], y: RADIO_C[1], zoom: 2.4}]], EASE.linear)}
			room={{radio: {power: 0}, chairAtDoor: 1, light: 0, nightDarkness: 0.75}}
			adam={false}
		/>
	);
};

/** The voice moves to the bedside alarm clock. */
const B12Clock: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const speaking = api.current?.speaker === 'radio' ? Math.max(0.4, radioLevel(api)) : f > dur * 0.4 ? 0.6 : 0;
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: 1050, y: 560, zoom: 2.0}], [dur * 0.4, {x: 1250, y: 620, zoom: 2.6}], [dur, {x: CLOCK_SPK[0] - 40, y: CLOCK_SPK[1] - 20, zoom: 5.2}]])}
				room={{light: 0, nightDarkness: 0.5, lurk: 0.7, clockSpeaking: speaking}}
				adam={{expression: 'terrified', look: [1, 0.3]}}
			/>
			<AutoRadioText top={80} size={84} />
		</>
	);
};

/** Feet, the edge of the bed and the dark gap. */
const GapShot: React.FC<{mode: 'stare' | 'shift' | 'feet' | 'creak' | 'breath'}> = ({mode}) => {
	const api = useShot();
	const {f, dur} = api;
	const lift = mode === 'feet' ? ramp(f, 4, dur * 0.7, 0, 1, EASE.out) : mode === 'stare' || mode === 'shift' ? 0 : 1;
	const breathAt = mode === 'breath' ? api.at('breathed') : 99999;
	const breath = f >= breathAt ? Math.sin(Math.min(1, (f - breathAt) / 40) * Math.PI) : 0;
	const shiftAmt = mode === 'shift' ? ramp(f, 6, 24) : mode === 'stare' ? 0 : 1;
	const creak = mode === 'creak' ? hit(f, 2, 6) : 0;
	const cam =
		mode === 'breath'
			? camKeys(f, [[0, {x: 930, y: 805, zoom: 3.4}], [dur, {x: 930, y: 812, zoom: 4.6}]], EASE.linear)
			: camKeys(f, [[0, {x: FEET[0] - 40, y: FEET[1] - 20, zoom: 3}], [dur, {x: FEET[0] - 40, y: FEET[1] - 10, zoom: 3.4}]], EASE.linear);
	return (
		<BedroomShot
			cam={cam}
			shake={creak * 0.15}
			room={{light: 0, nightDarkness: 0.4, lurk: 0.7 + shiftAmt * 0.05, sink: breath * 0.25 + (mode === 'shift' ? Math.sin(f * 0.3) * 0.06 : 0), rattle: creak * 3}}
			adam={{pose: mixPose(POSES.sit, POSES.sitHug, lift), expression: 'terrified', look: [0.6, 1]}}
			top={<BreathDust x={880} y={BED_FLOOR - 16} scale={1.2} breath={breath} opacity={0.9} />}
			overlay={mode === 'creak' && f < 18 ? <MarkerNote text="*creak*" x={1180} y={240} size={70} color="#ddd" /> : null}
		/>
	);
};

const B19Covered: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 920, y: 560, zoom: 2.8}], [dur, {x: 920, y: 560, zoom: 3.2}]], EASE.linear)}
			room={{light: 0, nightDarkness: 0.4, lurk: 0.75}}
			adam={{pose: POSES.coverMouthHug, expression: 'terrified', look: [0.4, 1], tremble: 0.6, pale: 0.8}}
		/>
	);
};

const B20Good: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: CLOCK_SPK[0] - 60, y: CLOCK_SPK[1] - 20, zoom: 4.4}], [dur, {x: CLOCK_SPK[0] - 60, y: CLOCK_SPK[1] - 20, zoom: 5}]], EASE.linear)}
				room={{light: 0, nightDarkness: 0.5, lurk: 0.75, clockSpeaking: radioLevel(api) || 0.3}}
				adam={false}
			/>
			<AutoRadioText top={78} size={110} glitch={0.2} />
		</>
	);
};

const B21Nothing: React.FC = () => {
	const {f, dur} = useShot();
	const mins = Math.floor(ramp(f, 0, dur, 79, 358, EASE.linear));
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 960, y: 580, zoom: 1.2}], [dur, {x: 960, y: 580, zoom: 1.3}]], EASE.linear)}
			room={{light: 0, nightDarkness: 0.5, lurk: 0.75, clock: `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`}}
			adam={{pose: POSES.sitHug, expression: 'scared', look: [0.5, 0.6], blink: false, tremble: 0.2}}
		/>
	);
};

const B22Sunrise: React.FC = () => {
	const {f, dur} = useShot();
	const run = ramp(f, dur * 0.3, dur, 0, 1, EASE.in);
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.15}], [dur, {x: 1100, y: 560, zoom: 1.2}]])}
			room={{light: 0.3, nightDarkness: 0.4, day: ramp(f, 0, dur * 0.3, 0.3, 1), curtains: 0, door: {open: run > 0.2 ? 1 : 0}, lurk: 0.2}}
			adam={run > 0 ? {x: 960 + run * 900, y: 830, pose: runPose(f * 0.45), facing: 1, expression: 'scream', look: [1, 0]} : {pose: POSES.sitHug, expression: 'scared', look: [-1, -0.3]}}
			extra={
				run > 0 ? (
					<g opacity={0.6}>
						{[0, 1, 2].map((i) => (
							<line key={i} x1={960 + run * 900 - 140 - i * 30} y1={600 + i * 50} x2={960 + run * 900 - 260 - i * 30} y2={600 + i * 50} stroke={C.white} strokeWidth={6} strokeLinecap="round" />
						))}
					</g>
				) : null
			}
		/>
	);
};

export const TheBed: React.FC = () => (
	<>
		<Shot from="oneNight" name="One night">
			<B01OneNight />
		</Shot>
		<Shot from="chair" to="did1" name="Chair to the door">
			<B02Chair />
		</Shot>
		<Shot from="lights" to="did2" name="Lights off">
			<B03Lights />
		</Shot>
		<Shot from="phone" to="obeyed" name="Phone in the kitchen">
			<B04Phone />
		</Shot>
		<Shot from="bedroom" to="walked" name="Into the bedroom">
			<B05Walked />
		</Shot>
		<Shot from="closeDoor" to="closed" name="Closes the door">
			<B06Close />
		</Shot>
		<Shot from="dontLeave" to="sat" name="Sits on the bed">
			<B07Sat />
		</Shot>
		<Shot from="finalInstruction" name="Final instruction">
			<B08Final />
		</Shot>
		<Shot from="dontLook" name="DO NOT LOOK UNDERNEATH">
			<VoiceShot theme="red" seed={41} glitch={0.6} />
		</Shot>
		<Shot from="cold" name="Body went cold">
			<B10Cold />
		</Shot>
		<Shot from="livingRoom" name="The radio is in the living room">
			<B11LivingRoom />
		</Shot>
		<Shot from="alarmClock" to="dontLookBed" name="Voice from the alarm clock">
			<B12Clock />
		</Shot>
		<Shot from="staredFloor" name="Stares at the floor">
			<GapShot mode="stare" />
		</Shot>
		<Shot from="shifted" to="slightly" name="Something shifted">
			<GapShot mode="shift" />
		</Shot>
		<Shot from="feet" name="SPECIAL D – feet retreat">
			<GapShot mode="feet" />
		</Shot>
		<Shot from="creaked" name="Creak">
			<GapShot mode="creak" />
		</Shot>
		<Shot from="underneath" to="breathed" name="SPECIAL D – it breathed">
			<GapShot mode="breath" />
		</Shot>
		<Shot from="covered" name="Covers his mouth">
			<B19Covered />
		</Shot>
		<Shot from="voiceSaid" to="good" name="GOOD (clock)">
			<B20Good />
		</Shot>
		<Shot from="nothingElse" name="Nothing else happened">
			<B21Nothing />
		</Shot>
		<Shot from="sunrise" name="Sunrise – runs out">
			<B22Sunrise />
		</Shot>
	</>
);

