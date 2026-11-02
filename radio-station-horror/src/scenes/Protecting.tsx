// ~2:20 – It starts protecting him: curtains, the sixth-floor scratch, the
// nightly instructions (split screens), the bathroom, the elevator.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Adam, BlueCoatWoman} from '../components/Characters';
import {Phone} from '../components/Phone';
import {RadioText} from '../components/RadioText';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {FLOOR_Y} from '../components/sets/ApartmentRoom';
import {BED_SIT_Y, Bedroom} from '../components/sets/Bedroom';
import {ADAM_WINDOW, Building, Street} from '../components/sets/Exteriors';
import {Elevator} from '../components/sets/Interiors';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import {mixPose, POSES, walkPose} from '../components/StickPerson';
import {EASE, hit, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobPath} from '../utils/wobble';
import {Shot, useShot} from '../utils/timeline-context';
import {AutoRadioText, CartoonFinish, radioLevel} from './shared';
import {ADAM_HEAD, BedroomShot, DISPLAY, MarkerNote, Room, VoiceShot} from './rooms';

/** Waiting for 1:17. */
const P01Waited: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1180, y: 560, zoom: 1.4}], [dur, {x: 1150, y: 560, zoom: 1.75}]], EASE.linear)}
			room={{radio: {power: 0}, clock: f < dur * 0.75 ? '1:16' : '1:17', light: 0.6}}
			adam={{expression: 'worried', look: [1, 0.25], pose: mixPose(POSES.sit, POSES.reach, 0.15)}}
		/>
	);
};

const P02Beep: React.FC<{which: 1 | 2 | 3}> = ({which}) => {
	const {f} = useShot();
	const flash = hit(f, 0, 7);
	if (which === 1) {
		return <Room cam={{x: DISPLAY[0], y: DISPLAY[1], zoom: 6 + f * 0.03}} room={{radio: {power: 0.6 + flash * 0.4, readout: '01.17'}, light: 0.6}} adam={false} />;
	}
	if (which === 2) {
		return <Room cam={{x: ADAM_HEAD[0] - 30, y: ADAM_HEAD[1] + 10, zoom: 3.6 + f * 0.02}} room={{radio: {power: 1}, light: 0.6}} adam={{expression: 'determined', look: [1, 0.2]}} />;
	}
	return <RadioVoiceScreen level={0.3 + flash * 0.7} mode="beep" theme="amber" seed={21} />;
};

/** Living room instruction + action: the text shows while the radio speaks, then Adam obeys. */
const P03Curtains: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const did = api.at('did1');
	const closing = ramp(f, did - 4, did + 12);
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: 620, y: 470, zoom: 1.7}], [dur, {x: 600, y: 470, zoom: 1.9}]])}
				room={{radio: {power: 1, speaking: radioLevel(api)}, curtains: closing, light: 0.6}}
				adam={{x: 600, pose: closing > 0 && closing < 1 ? POSES.armsUp : POSES.stand, facing: 1, expression: 'determined', look: [0, -0.5]}}
			/>
			<AutoRadioText top={16} size={76} />
		</>
	);
};

const P04Kitchen: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const did = api.at('did2');
	const on = f < did + 4 ? 1 : 0;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: 260, y: 520, zoom: 1.8}], [dur, {x: 280, y: 520, zoom: 2}]])}
				room={{radio: {power: 1, speaking: radioLevel(api)}, kitchenLight: on, curtains: 1, light: 0.6}}
				adam={{x: 430, pose: f > did - 6 && f < did + 8 ? POSES.reach : POSES.stand, facing: -1, expression: 'determined', look: [1, 0]}}
				extra={<rect x={334} y={520} width={30} height={46} rx={4} fill="#e9e4d4" stroke={C.ink} strokeWidth={4} />}
			/>
			<AutoRadioText top={16} size={76} />
		</>
	);
};

/** Close-up of the bedroom door's deadbolt turning. */
const P05Lock: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const did = api.at('did3');
	const locked = ramp(f, did - 2, did + 6);
	return (
		<>
			<BedroomShot
				cam={camKeys(f, [[0, {x: 1770, y: 560, zoom: 3.4}], [dur, {x: 1770, y: 560, zoom: 3.8}]])}
				room={{light: 0.6, door: {locked}, lurk: 0.05}}
				adam={false}
				top={
					f > did - 10 ? (
						<g>
							<path d={`M 2100 760 Q 1900 650 ${1790 + (1 - locked) * 6} 572`} stroke={C.ink} strokeWidth={26} fill="none" strokeLinecap="round" />
							<path d={`M 2100 760 Q 1900 650 ${1790 + (1 - locked) * 6} 572`} stroke={C.blue} strokeWidth={17} fill="none" strokeLinecap="round" />
							<circle cx={1792} cy={570} r={11} fill={C.skin} stroke={C.ink} strokeWidth={4} />
						</g>
					) : null
				}
				overlay={locked > 0.9 ? <MarkerNote text="*click*" x={1100} y={240} size={80} /> : null}
			/>
			<AutoRadioText top={16} size={76} />
		</>
	);
};

const P07Didnt: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 760, y: 560, zoom: 1.5}], [dur, {x: 820, y: 560, zoom: 1.75}]], EASE.linear)}
			room={{light: 0.4, curtains: 1, lurk: 0.12}}
			adam={{pose: POSES.sitHug, facing: 1, expression: 'sleep', tremble: 0.4}}
		/>
	);
};

const P08FiveMin: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 1361, y: 683, zoom: 5}], [dur, {x: 1361, y: 683, zoom: 5.6}]], EASE.linear)}
			room={{light: 0.4, clock: f < dur * 0.5 ? '1:21' : '1:22'}}
			adam={false}
		/>
	);
};

/** SPECIAL C: outside, six floors up – something drags its fingers across Adam's window. */
const P10Outside: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const scratch = ramp(f, 4, dur - 6, 0, 1, EASE.linear);
	return (
		<Stage cam={camKeys(f, [[0, {x: ADAM_WINDOW.x - 60, y: ADAM_WINDOW.y - 40, zoom: 2.4}], [dur, {x: ADAM_WINDOW.x - 30, y: ADAM_WINDOW.y - 30, zoom: 2.7}]], EASE.linear)} overlay={<CartoonFinish vignette={0.7} />}>
			<Layer>
				<Building scratch={scratch} hand={1} />
			</Layer>
		</Stage>
	);
};

/** "He lived on the sixth floor." – pull back and tilt down to the street. */
const P11SixthFloor: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage
			cam={camKeys(f, [[0, {x: ADAM_WINDOW.x, y: ADAM_WINDOW.y, zoom: 2.4}], [dur * 0.7, {x: 960, y: 320, zoom: 0.5}], [dur, {x: 960, y: 330, zoom: 0.49}]], EASE.inOut)}
			overlay={<CartoonFinish vignette={0.6} />}
		>
			<Layer>
				<Building scratch={1} hand={ramp(f, 0, 10, 1, 0)} annotate={ramp(f, dur * 0.5, dur * 0.7)} />
			</Layer>
		</Stage>
	);
};

const P12Obeying: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const second = f >= api.at('everyNight');
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.05}], [dur, {x: 960, y: 580, zoom: 1.2}]], EASE.linear)}
			room={{light: 0.5, lurk: second ? 0.22 : 0.15, clock: '1:17'}}
			adam={{pose: POSES.sit, facing: 1, expression: second ? 'determined' : 'neutral', look: [1, 0]}}
			overlay={<MarkerNote text={second ? 'NIGHT 5' : 'NIGHT 4'} x={90} y={80} size={70} />}
		/>
	);
};

/** Split screen: the instruction on the left, the bedroom (shadow under the bed growing) on the right. */
const Split: React.FC<{left: React.ReactNode; right: React.ReactNode; label?: string}> = ({left, right, label}) => (
	<AbsoluteFill style={{background: '#000'}}>
		{[left, right].map((node, i) => (
			<div key={i} style={{position: 'absolute', left: i * 960, top: 270, width: 1920, height: 1080, transform: 'scale(0.5)', transformOrigin: '0 0', overflow: 'hidden'}}>
				{node}
			</div>
		))}
		<div style={{position: 'absolute', left: 957, top: 270, width: 6, height: 540, background: '#111'}} />
		{label && <MarkerNote text={label} x={70} y={110} size={64} />}
	</AbsoluteFill>
);

const InstructionHalf: React.FC<{seed: number}> = ({seed}) => {
	const api = useShot();
	const b = api.current;
	return (
		<RadioVoiceScreen level={radioLevel(api)} theme="green" seed={seed}>
			{b?.onScreen && <RadioText text={b.onScreen} start={0} top={60} size={110} glitch={0.3} seed={seed} />}
		</RadioVoiceScreen>
	);
};

const P13Montage: React.FC<{kind: 'phone' | 'stairs' | 'coat' | 'sunset'; lurk: number; night: number}> = ({kind, lurk, night}) => {
	const {f, dur} = useShot();
	const boil = useBoil();
	let right: React.ReactNode;
	if (kind === 'phone') {
		right = (
			<Stage cam={{x: 1100, y: 600, zoom: 1.25 + f * 0.002}} overlay={<CartoonFinish />}>
				<Layer>
					<Bedroom light={0.5} lurk={lurk}>
						<Adam x={900} y={BED_SIT_Y} pose={POSES.sitHug} expression="determined" look={[-1, 0]} />
						<Phone x={1320} y={600} scale={0.16} rotate={-80} buzz={f % 20 < 10 ? 3 : 0} screen={1}>
							<rect width={260} height={500} fill="#2ea043" />
						</Phone>
					</Bedroom>
				</Layer>
			</Stage>
		);
	} else if (kind === 'stairs') {
		const t = ramp(f, 0, dur, 0, 1, EASE.linear);
		right = (
			<Stage cam={{x: 960, y: 540, zoom: 1}} bg="#5c5a4a" overlay={<CartoonFinish />}>
				<Layer>
					<rect x={-200} y={-200} width={2400} height={1500} fill="#6b6a55" />
					{Array.from({length: 9}).map((_, i) => (
						<path key={i} d={wobPath([[300 + i * 150, 200 + i * 90], [450 + i * 150, 200 + i * 90], [450 + i * 150, 290 + i * 90]], 3000 + i + boil, 2)} stroke={C.ink} strokeWidth={8} fill="none" />
					))}
					<rect x={300} y={60} width={160} height={60} fill="#2c6e3a" stroke={C.ink} strokeWidth={5} />
					<text x={380} y={104} fontFamily={FONT.paint} fontWeight={700} fontSize={36} fill="#fff" textAnchor="middle">
						STAIRS
					</text>
					<Adam x={420 + t * 900} y={200 + 90 + t * 540} pose={walkPose(f * 0.3)} facing={1} expression="determined" />
				</Layer>
			</Stage>
		);
	} else if (kind === 'coat') {
		right = (
			<Stage cam={{x: 960, y: 560, zoom: 1.05}} overlay={<CartoonFinish />}>
				<Layer>
					<Street day scroll={f * 3} />
					<BlueCoatWoman x={1250} y={860} expression="blank" look={[-1, 0]} />
					<Adam x={500 + f * 2.5} y={860} pose={walkPose(f * 0.25)} facing={1} expression="worried" look={[-1, 0.3]} headTurn={-0.3} />
				</Layer>
			</Stage>
		);
	} else {
		right = (
			<Stage cam={{x: 900, y: 560, zoom: 1.15 + f * 0.002}} overlay={<CartoonFinish />}>
				<Layer>
					<Bedroom light={0.8} lurk={lurk} curtains={0.2} day={0.9}>
						<Adam x={1500} y={830} pose={POSES.reach} facing={1} expression="determined" />
					</Bedroom>
				</Layer>
			</Stage>
		);
	}
	return <Split left={<InstructionHalf seed={30 + night} />} right={right} label={`NIGHT ${night}`} />;
};

/** "And every time Adam ignored one... something happened." */
const P14Ignored: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const hap = api.at('somethingHappened');
	const after = f >= hap;
	const flick = after && f % 6 < 3 ? 1 : 0;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1250, y: 560, zoom: 1.6}], [hap, {x: 1250, y: 560, zoom: 1.7}], [hap + 1, {x: 1300, y: 520, zoom: 2.6}], [dur, {x: 1300, y: 520, zoom: 2.8}]])}
			room={{radio: {power: after ? 1 : 0.6}, light: after ? flick * 0.6 + 0.2 : 0.7}}
			adam={{x: 1300, pose: after ? POSES.recoil : POSES.shrug, facing: -1, expression: after ? 'terrified' : 'nervous', look: [1, 0]}}
		/>
	);
};

/** The unanswered call, then breathing from the bathroom. */
const P15Call: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const nobody = api.at('nobodySpoke');
	if (f < nobody) {
		return (
			<Room
				cam={camKeys(f, [[0, {x: 1250, y: 520, zoom: 2}], [nobody, {x: 1250, y: 500, zoom: 2.3}]])}
				room={{radio: {power: 0}, light: 0.7}}
				adam={{x: 1260, pose: POSES.holdPhone, facing: -1, expression: 'worried', look: [1, 0]}}
				top={<rect x={1286} y={404} width={26} height={44} rx={4} fill="#2ea043" stroke={C.ink} strokeWidth={4} />}
			/>
		);
	}
	const secs = Math.floor((f - nobody) / 30) + 3;
	return (
		<AbsoluteFill style={{background: '#11131c'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<Phone x={760} y={140} scale={1.35}>
					<rect width={260} height={500} fill="#1d2233" />
					<text x={130} y={110} fontFamily={FONT.ui} fontSize={22} fill="#aab" textAnchor="middle">
						UNKNOWN
					</text>
					<text x={130} y={160} fontFamily={FONT.ui} fontSize={38} fill="#fff" textAnchor="middle" fontWeight={600}>
						00:0{Math.min(9, secs)}
					</text>
					<circle cx={130} cy={420} r={34} fill="#e5484d" />
				</Phone>
			</svg>
			<MarkerNote text="(silence)" x={1240} y={420} size={60} color="#ddd" rot={3} opacity={ramp(f, nobody + 8, nobody + 16)} />
			<CartoonFinish vignette={0.7} />
		</AbsoluteFill>
	);
};

const P16Bathroom: React.FC = () => {
	const {f, dur} = useShot();
	const breathe = ramp(f, 36, 44) * (0.5 + 0.5 * Math.sin(f * 0.12));
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 1500, y: 560, zoom: 1.5}], [dur, {x: 1660, y: 560, zoom: 2.1}]], EASE.slowIn)}
			room={{light: 0.6, door: {open: 0.28, label: 'BATH', color: '#c9c4b0'}, lurk: 0.3}}
			adam={{x: 1260, y: 830, pose: POSES.recoil, facing: 1, expression: 'terrified', look: [1, 0], sweat: true}}
			overlay={<MarkerNote text="hhhhh..." x={1500} y={300} size={58} color="#cfd6e0" rot={-2} opacity={breathe * 0.8} />}
		/>
	);
};

/** The elevator: stops between floors, the lights die, a whisper from the ceiling hatch. */
const P17Elevator: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const stop = api.at('betweenFloors');
	const dark = api.at('lightsOut');
	const whisper = api.at('whispered');
	const floorText = f < stop ? String(1 + Math.min(3, Math.floor(f / 18))) : f % 20 < 10 ? '4' : '--';
	const light = f < dark ? 1 : f < dark + 6 ? (f % 2 ? 1 : 0) : 0.04;
	const panel = ramp(f, whisper + 20, whisper + 50, 0, 0.5);
	const eyes = light < 0.5;
	return (
		<Stage
			cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.1}], [stop, {x: 960, y: 560, zoom: 1.2}], [whisper, {x: 960, y: 520, zoom: 1.6}], [dur, {x: 960, y: 260, zoom: 2.2}]])}
			shake={hit(f, stop, 6) * 0.6}
			overlay={
				<>
					{f >= whisper + 30 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: FONT.scrawl, fontSize: 64, color: '#d8dde6', opacity: 0.55 * ramp(f, whisper + 30, whisper + 40), letterSpacing: 6}}>
							adam...
						</div>
					)}
					<CartoonFinish vignette={0.6} />
				</>
			}
		>
			<Layer>
				<Elevator floorText={floorText} light={light} panel={panel} dust={f > whisper + 20 ? 1 : 0} />
				{!eyes && <Adam x={960} y={860} expression={f < stop ? 'neutral' : 'scared'} look={[0, f > whisper ? -1 : 0]} />}
				{eyes && (
					<g>
						{[944, 976].map((x) => (
							<g key={x}>
								<circle cx={x} cy={534} r={11} fill="#fff" />
								<circle cx={x} cy={f > whisper ? 527 : 534} r={4} fill="#000" />
							</g>
						))}
					</g>
				)}
			</Layer>
		</Stage>
	);
};

const P18Trusted: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1150, y: 600, zoom: 1.5}], [dur, {x: 1120, y: 590, zoom: 1.9}]], EASE.linear)}
			room={{radio: {power: 1}, light: 0.5}}
			adam={{x: 1300, y: FLOOR_Y, pose: POSES.sitUp, facing: -1, expression: 'smile', look: [1, -0.3]}}
		/>
	);
};

/** "That was the mistake." – the darkness under the bed, bigger than ever. */
const P19Mistake: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 960, y: 760, zoom: 1.8}], [dur, {x: 1000, y: 805, zoom: 3.2}]], EASE.slowIn)}
			room={{light: 0, lurk: 0.75, clock: '1:17', nightDarkness: 0.45}}
			adam={false}
			overlay={<StaticOverlay opacity={ramp(f, dur - 10, dur, 0, 0.3)} blend="screen" seed={71} />}
		/>
	);
};

export const Protecting: React.FC = () => (
	<>
		<Shot from="waited" name="Waiting for 1:17">
			<P01Waited />
		</Shot>
		<Shot from="beep1" name="BEEP 1">
			<P02Beep which={1} />
		</Shot>
		<Shot from="beep2" name="BEEP 2">
			<P02Beep which={2} />
		</Shot>
		<Shot from="beep3" name="BEEP 3">
			<P02Beep which={3} />
		</Shot>
		<Shot from="curtains" to="did1" name="Curtains">
			<P03Curtains />
		</Shot>
		<Shot from="kitchen" to="did2" name="Kitchen light">
			<P04Kitchen />
		</Shot>
		<Shot from="lockDoor" to="did3" name="Lock bedroom door">
			<P05Lock />
		</Shot>
		<Shot from="then" to="dontLook" name="DO NOT LOOK OUTSIDE">
			<VoiceShot theme="red" seed={22} />
		</Shot>
		<Shot from="didnt" name="He didn't">
			<P07Didnt />
		</Shot>
		<Shot from="fiveMin" name="Five minutes later">
			<P08FiveMin />
		</Shot>
		<Shot from="scratched" to="slowly" name="Finger shadows on curtain">
			<P09ScratchCurtain />
		</Shot>
		<Shot from="oneSide" to="toOther" name="SPECIAL C – outside the 6th floor">
			<P10Outside />
		</Shot>
		<Shot from="sixthFloor" name="Sixth floor pull-back">
			<P11SixthFloor />
		</Shot>
		<Shot from="obeying" to="everyNight" name="Obeying">
			<P12Obeying />
		</Shot>
		<Shot from="noPhone" name="Montage – phone">
			<P13Montage kind="phone" lurk={0.3} night={6} />
		</Shot>
		<Shot from="stairs" name="Montage – stairs">
			<P13Montage kind="stairs" lurk={0.38} night={7} />
		</Shot>
		<Shot from="blueCoat" name="Montage – blue coat">
			<P13Montage kind="coat" lurk={0.45} night={8} />
		</Shot>
		<Shot from="sunset" name="Montage – sunset">
			<P13Montage kind="sunset" lurk={0.55} night={9} />
		</Shot>
		<Shot from="ignoredOne" to="somethingHappened" name="Ignored one">
			<P14Ignored />
		</Shot>
		<Shot from="answeredCall" to="nobodySpoke" name="Answered a call">
			<P15Call />
		</Shot>
		<Shot from="bathroom" name="Breathing in the bathroom">
			<P16Bathroom />
		</Shot>
		<Shot from="elevator" to="whispered" name="Elevator">
			<P17Elevator />
		</Shot>
		<Shot from="stoppedQuestioning" to="trusted" name="Trusted it">
			<P18Trusted />
		</Shot>
		<Shot from="mistake" name="That was the mistake">
			<P19Mistake />
		</Shot>
	</>
);

/** Interior: the shadow of long fingers dragging across the closed curtains. */
const P09ScratchCurtain: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<BedroomShot
			cam={camKeys(f, [[0, {x: 330, y: 400, zoom: 2.2}], [dur, {x: 330, y: 400, zoom: 2.5}]], EASE.linear)}
			room={{light: 0.4, curtains: 1, lurk: 0.12}}
			adam={false}
			handheld={0.2}
			extra={
				<g opacity={0.75}>
					{[0, 1, 2, 3].map((i) => {
						const fx = 120 + ramp(f, 6, dur, 0, 420, EASE.linear);
						return (
							<path
								key={i}
								d={`M ${fx - 200} ${300 + i * 26} Q ${fx - 60} ${310 + i * 24} ${fx} ${330 + i * 22}`}
								stroke="#000"
								strokeWidth={13}
								strokeLinecap="round"
								fill="none"
							/>
						);
					})}
				</g>
			}
		/>
	);
};

