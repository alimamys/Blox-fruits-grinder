// 0:05 – Cold open: the radio says Adam's name, knocking, the repeating neighbour, "Good."
// Very fast cutting for the first 30 seconds.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Neighbor} from '../components/Characters';
import {camKeys} from '../components/Stage';
import type {StickPersonProps} from '../components/StickPerson';
import {Flash} from '../components/CRTNoise';
import {RadioText} from '../components/RadioText';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {SpeechWave} from '../components/SpeechWave';
import {StaticOverlay} from '../components/StaticOverlay';
import {mixPose, POSES, walkPose} from '../components/StickPerson';
import {DigitalClock} from '../components/DigitalClock';
import {EASE, hit, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import {wobEllipse} from '../utils/wobble';
import {Shot, useShot} from '../utils/timeline-context';
import {AutoRadioText, CartoonFinish, knockHit, radioLevel} from './shared';

import {ADAM_HEAD, DIAL, DISPLAY, DOOR_C, DOOR_GAP, DOOR_PLATE, GRILLE, RADIO_C, Room} from './rooms';

const radioOn = (api: ReturnType<typeof useShot>, extra: Record<string, unknown> = {}) => ({
	power: 1,
	speaking: radioLevel(api),
	flicker: 0.15,
	...extra,
});

// ----------------------------------------------------------------------------
const S01Music: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const music = ramp(f, dur * 0.55, dur * 0.8, 1, 0);
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1100, y: 560, zoom: 1.05}], [dur, {x: 1120, y: 560, zoom: 1.3}]], EASE.linear)}
			room={{radio: {power: 1, music, tuning: 0.3 + ramp(f, dur * 0.6, dur, 0, 0.05)}}}
			adam={{expression: 'neutral', look: [0.9, 0.2], headTilt: 0} as Partial<StickPersonProps>}
		/>
	);
};

const S02Static: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Room
			cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.4}], [dur, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.7}]])}
			room={{radio: {power: 1, flicker: 0.8, tuning: 0.35 + Math.sin(f * 0.9) * 0.02, readout: '--.--'}}}
			adam={false}
			overlay={<StaticOverlay opacity={0.3} blend="screen" seed={11} />}
		/>
	);
};

const S03AdamHears: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: ADAM_HEAD[0], y: ADAM_HEAD[1] + 30, zoom: 2.8}], [dur, {x: ADAM_HEAD[0], y: ADAM_HEAD[1] + 20, zoom: 3.1}]])}
			room={{radio: {power: 1}}}
			adam={{expression: f < dur * 0.4 ? 'neutral' : 'worried', look: [ramp(f, 0, 10, 0, 1), 0.2]}}
		/>
	);
};

/** BEEP / BEEP / BEEP – three hard cuts. */
const BeepShot: React.FC<{which: 1 | 2 | 3}> = ({which}) => {
	const api = useShot();
	const {f} = api;
	const flash = hit(f, 0, 7);
	if (which === 1) {
		return (
			<Room
				cam={{x: DISPLAY[0], y: DISPLAY[1], zoom: 6 + f * 0.02}}
				room={{radio: {power: 0.6 + flash * 0.4, readout: '07.11'}}}
				adam={false}
				overlay={<Flash amount={flash * 0.12} color="#ff8a3a" />}
			/>
		);
	}
	if (which === 2) {
		return (
			<Room
				cam={{x: ADAM_HEAD[0], y: ADAM_HEAD[1], zoom: 4.2 + f * 0.02}}
				room={{radio: {power: 1}}}
				adam={{expression: 'scared', look: [1, 0.1]}}
			/>
		);
	}
	return (
		<RadioVoiceScreen level={0.3 + flash * 0.7} mode="beep" theme="amber" freq="07.117" seed={3}>
			<Flash amount={flash * 0.08} />
		</RadioVoiceScreen>
	);
};

const S05Numbers: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const nStart = api.at('numbers');
	if (f < nStart) {
		// radio starts "speaking": sound arcs, slow push
		return (
			<Room
				cam={camKeys(f, [[0, {x: RADIO_C[0] - 20, y: RADIO_C[1], zoom: 2.6}], [nStart, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.0}]])}
				room={{radio: {power: 1, speaking: 0.8}}}
				adam={false}
			/>
		);
	}
	const local = f - nStart;
	const len = api.len('numbers');
	const digits = ['7', '4', '2', '9'];
	const shown = digits.filter((_, i) => local >= (i * len) / 4.3);
	return (
		<RadioVoiceScreen level={radioLevel(api)} theme="green" freq="07.117" seed={5}>
			<RadioText text={shown.join('…  ') + '…'} start={nStart} top={66} size={92} glitch={0.3} />
		</RadioVoiceScreen>
	);
};

/** Adam's hand reaching for the tuning dial – then freezing. */
const HandShot: React.FC<{frozen?: boolean}> = ({frozen = false}) => {
	const api = useShot();
	const {f, dur} = api;
	const reach = frozen ? 1 : ramp(f, 0, dur * 0.8, 0, 1, EASE.out);
	const tremble = frozen ? (hash1(f, 4) - 0.5) * 4 : 0;
	const hx = DIAL[0] + 160 - reach * 125 + tremble;
	const hy = DIAL[1] + 30 - reach * 10 + tremble * 0.5;
	const arm = (
		<g>
			<path d={`M 1400 760 Q ${hx + 120} ${hy + 90} ${hx} ${hy}`} stroke={C.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
			<path d={`M 1400 760 Q ${hx + 120} ${hy + 90} ${hx + 26} ${hy + 14}`} stroke={C.blue} strokeWidth={24} fill="none" strokeLinecap="round" />
			<path d={wobEllipse(hx, hy, 15, 15, 9, 1)} fill={C.skin} stroke={C.ink} strokeWidth={5} />
			<path d={`M ${hx - 10} ${hy - 4} L ${hx - 30} ${hy - 10}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
		</g>
	);
	return (
		<Room
			cam={camKeys(f, [[0, {x: DIAL[0] + 40, y: DIAL[1] - 10, zoom: 3.6}], [dur, {x: DIAL[0] + 30, y: DIAL[1] - 10, zoom: frozen ? 4.2 : 3.9}]])}
			room={{radio: radioOn(api, {speaking: radioLevel(api) || (frozen ? 0 : 0.6)})}}
			adam={false}
			top={arm}
		/>
	);
};

/** SPECIAL A: extreme close-up, the station says ADAM. The static almost forms a face. */
const S07Adam: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const faceAmt = f > dur * 0.35 && f < dur * 0.35 + 9 ? 0.32 : 0;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: GRILLE[0] + 30, y: GRILLE[1] - 10, zoom: 6.2}], [dur, {x: GRILLE[0] + 30, y: GRILLE[1] - 10, zoom: 7.2}]], EASE.linear)}
				room={{radio: {power: 1, speaking: radioLevel(api), readout: '01.17'}}}
				adam={false}
				overlay={<StaticOverlay opacity={0.22 + faceAmt * 0.6} blend="screen" seed={21} face={faceAmt ? 0.9 : 0} res={256} tear={0.2} />}
			/>
			<AutoRadioText top={74} size={120} />
		</>
	);
};

const S09Hiss: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Room
			cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1] - 10, zoom: 2.5}], [dur, {x: RADIO_C[0], y: RADIO_C[1] - 10, zoom: 2.9}]])}
			room={{radio: {power: 1, flicker: 0.6}}}
			adam={false}
			overlay={<StaticOverlay opacity={0.18 + 0.12 * Math.sin(f * 0.7)} blend="screen" seed={31} />}
		/>
	);
};

const VoiceShot: React.FC<{theme?: 'green' | 'amber' | 'red'; freq?: string; glitch?: number; seed?: number; face?: number}> = ({theme = 'green', freq = '07.117', glitch = 0.35, seed = 7, face = 0}) => {
	const api = useShot();
	return (
		<RadioVoiceScreen level={radioLevel(api)} theme={theme} freq={freq} seed={seed} face={face}>
			<AutoRadioText top={66} size={110} glitch={glitch} />
		</RadioVoiceScreen>
	);
};

/** Adam slowly turns his head toward the door, then the camera drifts to the door. */
const S11LookDoor: React.FC = () => {
	const {f, dur} = useShot();
	const turn = ramp(f, 4, dur * 0.6, 0, 1);
	return (
		<Room
			cam={camKeys(f, [[0, {x: ADAM_HEAD[0], y: ADAM_HEAD[1] + 60, zoom: 2.4}], [dur * 0.55, {x: ADAM_HEAD[0] + 20, y: ADAM_HEAD[1] + 60, zoom: 2.4}], [dur, {x: DOOR_C[0] - 40, y: DOOR_C[1], zoom: 1.9}]])}
			room={{radio: {power: 1}}}
			adam={{expression: 'scared', look: [1 - turn * 2, 0], headTurn: -turn * 0.5}}
		/>
	);
};

const S12DoorPlate: React.FC = () => {
	const {f, dur} = useShot();
	return <Room cam={camKeys(f, [[0, {x: DOOR_PLATE[0], y: DOOR_PLATE[1] + 30, zoom: 3.4}], [dur, {x: DOOR_PLATE[0], y: DOOR_PLATE[1] + 20, zoom: 3.9}]])} room={{radio: {power: 1}}} adam={false} />;
};

const S13OneSeventeen: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: RADIO_C[0] + 30, y: RADIO_C[1] - 20, zoom: 4.2}], [dur, {x: RADIO_C[0] + 50, y: RADIO_C[1] - 25, zoom: 5}]])}
				room={{radio: {power: 1, speaking: radioLevel(api), readout: '01.17'}}}
				adam={false}
			/>
			<AutoRadioText top={76} size={96} />
		</>
	);
};

const S14LookClock: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: ADAM_HEAD[0] - 60, y: ADAM_HEAD[1] + 20, zoom: 2.6}], [dur, {x: ADAM_HEAD[0] - 90, y: ADAM_HEAD[1] + 30, zoom: 2.4}]])}
			room={{radio: {power: 1}}}
			adam={{expression: 'worried', look: [ramp(f, 0, 8, -0.3, 1), ramp(f, 0, 8, 0, 0.9)]}}
		/>
	);
};

/** 1:17 AM – full-frame LED clock. Silence. */
const S15Clock: React.FC = () => {
	const {f, dur} = useShot();
	const z = 1 + f / dur * 0.12;
	return (
		<AbsoluteFill style={{background: '#050304'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
					<DigitalClock x={420} y={300} scale={3} time="1:17" glow={1} />
				</g>
			</svg>
			<CartoonFinish vignette={0.8} />
		</AbsoluteFill>
	);
};

const S17ThreeSeconds: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1250, y: 560, zoom: 1.25}], [dur, {x: 1400, y: 560, zoom: 1.5}]], EASE.linear)}
			room={{radio: {power: 0.9}, door: {gapLight: 0.9}}}
			adam={{expression: 'scared', look: [-1, 0], headTurn: -0.4, tremble: 0.2}}
		/>
	);
};

/** SPECIAL B: first knock – the camera snaps toward the door. */
const S18Knock: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const kStart = api.at('knock1');
	const k = knockHit(api, 'knock1');
	const snap = ramp(f, kStart - 2, kStart + 4, 0, 1, EASE.out);
	return (
		<Room
			cam={camKeys(snap, [[0, {x: ADAM_HEAD[0] - 40, y: ADAM_HEAD[1] + 60, zoom: 2.2}], [1, {x: DOOR_C[0], y: DOOR_C[1] + 20, zoom: 1.9}]], EASE.linear)}
			shake={k * 0.35}
			room={{radio: {power: 0.9}, door: {gapLight: 0.9, rattle: k * 6}}}
			adam={{expression: f < kStart ? 'worried' : 'terrified', look: [-1, 0], headTurn: -0.4}}
		/>
	);
};

const S19StaredRadio: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: ADAM_HEAD[0] - 30, y: ADAM_HEAD[1] + 10, zoom: 3.4}], [dur, {x: ADAM_HEAD[0] - 30, y: ADAM_HEAD[1] + 10, zoom: 3.7}]])}
			room={{radio: {power: 0.9}}}
			adam={{expression: 'terrified', look: [1, 0.3], sweat: true, tremble: 0.3}}
		/>
	);
};

const S20Again: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const harder = api.at('harder');
	return (
		<Room
			cam={camKeys(f, [[0, {x: DOOR_C[0], y: DOOR_C[1], zoom: 1.7}], [harder, {x: DOOR_C[0], y: DOOR_C[1], zoom: 1.9}], [harder + 4, {x: DOOR_C[0], y: DOOR_C[1] - 20, zoom: 2.4}], [dur, {x: DOOR_C[0], y: DOOR_C[1] - 20, zoom: 2.5}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 0.9}}}
			adam={false}
		/>
	);
};

const S21Knock2: React.FC = () => {
	const api = useShot();
	const k = knockHit(api, 'knock2');
	return (
		<Room
			cam={{x: DOOR_C[0], y: DOOR_C[1] - 30, zoom: 2.6}}
			shake={k * 0.75}
			room={{radio: {power: 0.9}, door: {gapLight: 0.9, rattle: k * 12, feet: 0.9}}}
			adam={false}
			overlay={<Flash amount={k * 0.08} />}
		/>
	);
};

/** The light under the door – two shadows of feet. */
const S22Gap: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Room
			cam={camKeys(f, [[0, {x: DOOR_GAP[0], y: DOOR_GAP[1], zoom: 3.2}], [dur, {x: DOOR_GAP[0], y: DOOR_GAP[1] + 10, zoom: 3.8}]], EASE.linear)}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: ramp(f, 0, 12, 0.5, 1), feetX: Math.sin(f * 0.04) * 4}}}
			adam={false}
		/>
	);
};

/** "Adam knew that voice." – thought bubble with the neighbour. */
const S24Bubble: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const pop = ramp(f, api.at('itWasNeighbor') - 2, api.at('itWasNeighbor') + 6, 0, 1, EASE.out);
	const bubble = (
		<g opacity={pop} transform={`translate(1180 330) scale(${0.6 + pop * 0.4}) translate(-1180 -330)`}>
			<path d={wobEllipse(1180, 330, 150, 110, 3, 4)} fill={C.white} stroke={C.ink} strokeWidth={7} />
			<path d={wobEllipse(1300, 450, 22, 16, 4, 2)} fill={C.white} stroke={C.ink} strokeWidth={5} />
			<path d={wobEllipse(1330, 490, 12, 9, 5, 1.5)} fill={C.white} stroke={C.ink} strokeWidth={4} />
			<Neighbor x={1180} y={420} scale={0.45} expression="smile" outfit="tee" />
		</g>
	);
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1300, y: 500, zoom: 2.0}], [dur, {x: 1290, y: 480, zoom: 2.15}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1}}}
			adam={{expression: 'confused', look: [-0.6, -0.6], headTurn: -0.3}}
			extra={bubble}
		/>
	);
};

const S25OpenUp: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: DOOR_C[0] - 60, y: DOOR_C[1] + 60, zoom: 2.0}], [dur, {x: DOOR_C[0] - 40, y: DOOR_C[1] + 80, zoom: 2.3}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1, feetX: Math.sin(f * 0.1) * 6}}}
			adam={false}
		/>
	);
};

const S26Moves: React.FC = () => {
	const {f, dur} = useShot();
	const t = ramp(f, 2, dur, 0, 1, EASE.linear);
	const x = 1390 + t * 70;
	const pose = t < 0.15 ? mixPose(POSES.sit, POSES.stand, t / 0.15) : mixPose(walkPose(f * 0.22, 0.7), POSES.reach, ramp(t, 0.6, 1));
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1340, y: 560, zoom: 1.5}], [dur, {x: 1440, y: 560, zoom: 1.7}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1}, noChair: false}}
			adam={{x, pose, facing: 1, expression: 'worried', look: [1, 0]}}
		/>
	);
};

const S27Crackle: React.FC = () => {
	const {f} = useShot();
	const burst = hit(f, 0, 10);
	return (
		<Room
			cam={{x: RADIO_C[0], y: RADIO_C[1], zoom: 3.8 + f * 0.01}}
			shake={burst * 0.3}
			room={{radio: {power: 1, flicker: 0.9, readout: 'ERR'}}}
			adam={false}
			overlay={<StaticOverlay opacity={0.25 + burst * 0.5} blend="screen" seed={41} tear={1} />}
		/>
	);
};

const S29Stopped: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1470, y: 530, zoom: 2.6}], [dur, {x: 1470, y: 530, zoom: 2.8}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1}}}
			adam={{x: 1460, pose: POSES.reach, facing: 1, expression: 'scared', look: [-1, 0], tremble: 0.4}}
		/>
	);
};

const S30KnockedAgain: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const k = knockHit(api, 'knockedAgain', 0.9);
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1560, y: 560, zoom: 1.9}], [dur, {x: 1580, y: 580, zoom: 2.2}]])}
			shake={k * 0.3}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1, rattle: k * 6}}}
			adam={{x: 1460, pose: POSES.reach, facing: 1, expression: 'scared', look: [1, 0]}}
		/>
	);
};

const S31Strange: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const second = f >= api.at('repeated');
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1460, y: 520, zoom: 3.2}], [dur, {x: 1460, y: 520, zoom: 3.8}]], EASE.linear)}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1}}}
			adam={{x: 1460, pose: POSES.reach, facing: 1, expression: second ? 'scared' : 'confused', look: [1, -0.1]}}
		/>
	);
};

/** Split-screen evidence: three identical waveforms of "Adam, please." */
const S32Recording: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const rows = [
		{label: 'TAKE 1  01:17:31', from: 0},
		{label: 'TAKE 2  01:17:36', from: api.at('please2')},
		{label: 'TAKE 3  01:17:39', from: api.at('please3')},
	];
	const toneMark = f >= api.at('sameTone');
	const pauseMark = f >= api.at('samePause');
	const match = f >= api.at('recording');
	return (
		<AbsoluteFill style={{background: '#08090c'}}>
			<div style={{position: 'absolute', left: 120, top: 60, fontFamily: FONT.vcr, fontSize: 44, color: '#9fe3b0', letterSpacing: 4}}>HALLWAY AUDIO — VOICE COMPARISON</div>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				{rows.map((r, i) => {
					const y = 280 + i * 260;
					const on = f >= r.from;
					return (
						<g key={i} opacity={on ? 1 : 0.12}>
							<rect x={120} y={y - 100} width={1680} height={200} fill="#0f1218" stroke="#2a3a30" strokeWidth={2} />
							<SpeechWave x={140} y={y} w={1640} h={170} level={on ? 0.9 : 0} frozenAt={1234} seed={42} color="#7dff9a" strokeWidth={3} />
							{toneMark && on && <rect x={520} y={y - 100} width={8} height={200} fill="#ffd859" opacity={0.8} />}
							{pauseMark && on && <rect x={980} y={y - 100} width={200} height={200} fill="#ff4a3d" opacity={0.18} />}
						</g>
					);
				})}
			</svg>
			{rows.map((r, i) => (
				<div key={i} style={{position: 'absolute', left: 140, top: 190 + i * 260, fontFamily: FONT.vcr, fontSize: 30, color: '#9fe3b0', opacity: f >= r.from ? 0.9 : 0.2}}>
					{r.label}
				</div>
			))}
			{match && (
				<div style={{position: 'absolute', right: 120, top: 50, fontFamily: FONT.vcr, fontSize: 64, color: '#ff4a3d', letterSpacing: 6, opacity: f % 20 < 14 ? 1 : 0.4}}>MATCH 100%</div>
			)}
			<StaticOverlay opacity={0.06} blend="screen" seed={52} />
			<CartoonFinish vignette={0.7} grain={0.04} />
		</AbsoluteFill>
	);
};

const S33SteppedBack: React.FC = () => {
	const {f, dur} = useShot();
	const t = ramp(f, 0, dur * 0.8, 0, 1, EASE.out);
	// Rewatch detail: a pale figure in the window reflection for a few frames.
	const ghost = f > dur * 0.45 && f < dur * 0.45 + 10 ? 0.22 : 0;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1200, y: 540, zoom: 1.2}], [dur, {x: 1180, y: 540, zoom: 1.12}]])}
			room={{radio: {power: 0.9}, door: {gapLight: 1, feet: 1}, ghost}}
			adam={{x: 1460 - t * 150, pose: mixPose(walkPose(-f * 0.25, 0.6), POSES.recoil, 0.6), facing: 1, expression: 'terrified', look: [1, 0]}}
		/>
	);
};

const S34Silent: React.FC = () => {
	const {f, dur} = useShot();
	const lightOff = f > dur * 0.75;
	return (
		<Room
			cam={camKeys(f, [[0, {x: DOOR_GAP[0], y: DOOR_GAP[1] - 40, zoom: 2.4}], [dur, {x: DOOR_GAP[0], y: DOOR_GAP[1] - 30, zoom: 2.9}]], EASE.linear)}
			room={{radio: {power: 0.9}, door: {gapLight: lightOff ? 0 : 1, feet: lightOff ? 0 : 1}}}
			adam={false}
		/>
	);
};

const S35Good: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<>
			<Room
				cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1], zoom: 2.8}], [dur, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.3}]], EASE.linear)}
				room={{radio: {power: 1, speaking: radioLevel(api)}}}
				adam={false}
			/>
			<AutoRadioText top={78} size={110} glitch={0.2} />
		</>
	);
};

const S36Off: React.FC = () => {
	const {f, dur} = useShot();
	const power = f < 10 ? 1 - (f % 4 < 2 ? 0 : 0.7) : ramp(f, 10, 16, 0.6, 0);
	return (
		<Room
			cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1], zoom: 2.2}], [dur, {x: 1180, y: 560, zoom: 1.25}]], EASE.inOut)}
			room={{radio: {power}, light: ramp(f, 14, 20, 1, 0.35), nightDarkness: 0.8}}
			adam={{x: 1310, pose: POSES.recoil, facing: 1, expression: 'scared', look: [-1, 0]}}
		/>
	);
};

export const ColdOpen: React.FC = () => (
	<>
		<Shot from="stoppedMusic" name="Wide – music stops">
			<S01Music />
		</Shot>
		<Shot from="static" name="Radio – static">
			<S02Static />
		</Shot>
		<Shot from="threeBeeps" name="Adam hears">
			<S03AdamHears />
		</Shot>
		<Shot from="beep1" name="BEEP 1">
			<BeepShot which={1} />
		</Shot>
		<Shot from="beep2" name="BEEP 2">
			<BeepShot which={2} />
		</Shot>
		<Shot from="beep3" name="BEEP 3">
			<BeepShot which={3} />
		</Shot>
		<Shot from="numbersIntro" to="numbers" name="Numbers">
			<S05Numbers />
		</Shot>
		<Shot from="almostChanged" to="voiceSaid" name="Hand reaches">
			<HandShot />
		</Shot>
		<Shot from="adam" name="SPECIAL A – ADAM">
			<S07Adam />
		</Shot>
		<Shot from="handFroze" name="Hand froze">
			<HandShot frozen />
		</Shot>
		<Shot from="hissed" to="then1" name="Hiss">
			<S09Hiss />
		</Shot>
		<Shot from="apartment" name="APARTMENT 6B">
			<VoiceShot seed={8} />
		</Shot>
		<Shot from="lookedDoor" name="Looks at door">
			<S11LookDoor />
		</Shot>
		<Shot from="hisApartment" name="6B plate">
			<S12DoorPlate />
		</Shot>
		<Shot from="continued" to="oneSeventeen" name="ONE SEVENTEEN">
			<S13OneSeventeen />
		</Shot>
		<Shot from="lookedClock" name="Looks at clock">
			<S14LookClock />
		</Shot>
		<Shot from="clockTime" name="1:17 AM">
			<S15Clock />
		</Shot>
		<Shot from="womanSaid" to="doNotOpen" name="DO NOT OPEN THE DOOR">
			<VoiceShot theme="red" glitch={0.5} seed={9} />
		</Shot>
		<Shot from="threeSeconds" name="Three seconds later">
			<S17ThreeSeconds />
		</Shot>
		<Shot from="someoneKnocked" to="knock1" name="SPECIAL B – first knock">
			<S18Knock />
		</Shot>
		<Shot from="staredRadio" name="Stares at radio">
			<S19StaredRadio />
		</Shot>
		<Shot from="knockAgain" to="harder" name="Again. Harder.">
			<S20Again />
		</Shot>
		<Shot from="knock2" name="Knock 2">
			<S21Knock2 />
		</Shot>
		<Shot from="mansVoice" to="adamQ" name="Feet under the door">
			<S22Gap />
		</Shot>
		<Shot from="knewVoice" to="itWasNeighbor" name="Thought bubble">
			<S24Bubble />
		</Shot>
		<Shot from="openUp" name="Open up">
			<S25OpenUp />
		</Shot>
		<Shot from="movedDoor" name="Moves to door">
			<S26Moves />
		</Shot>
		<Shot from="crackled" name="Crackle">
			<S27Crackle />
		</Shot>
		<Shot from="doNot" name="DO NOT">
			<VoiceShot theme="red" glitch={0.9} seed={10} />
		</Shot>
		<Shot from="stopped" name="He stopped">
			<S29Stopped />
		</Shot>
		<Shot from="knockedAgain" to="please1" name="Knocked again">
			<S30KnockedAgain />
		</Shot>
		<Shot from="strange" to="repeated" name="Something strange">
			<S31Strange />
		</Shot>
		<Shot from="exactly" to="recording" name="Waveform comparison">
			<S32Recording />
		</Shot>
		<Shot from="steppedBack" name="Steps back (ghost in window)">
			<S33SteppedBack />
		</Shot>
		<Shot from="silent" name="Silence">
			<S34Silent />
		</Shot>
		<Shot from="radioSaid" to="good" name="GOOD">
			<S35Good />
		</Shot>
		<Shot from="switchedOff" name="Switched off">
			<S36Off />
		</Shot>
	</>
);

