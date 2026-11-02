// ~1:23 – The radio returns: the market flashback, the neighbour denies it,
// the radio turns on while unplugged, the red-train warning.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Adam, Neighbor, Seller} from '../components/Characters';
import {Flash} from '../components/CRTNoise';
import {Phone, PhoneNotification} from '../components/Phone';
import {Radio} from '../components/Radio';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {Hallway, Market} from '../components/sets/Interiors';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import {mixPose, POSES, walkPose} from '../components/StickPerson';
import {PLATFORM_Y, TrainScene} from '../components/TrainScene';
import {EASE, hit, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {Shot, useShot} from '../utils/timeline-context';
import {CartoonFinish} from './shared';
import {ADAM_HEAD, CLOCK_C, DISPLAY, MarkerNote, RADIO_C, Room, VoiceShot} from './rooms';

const pad = (n: number) => String(n).padStart(2, '0');

/** "Adam didn't sleep." – time-lapse on the clock while he stares at the dead radio. */
const R01NoSleep: React.FC = () => {
	const {f, dur} = useShot();
	const mins = Math.floor(ramp(f, 0, dur, 80, 359, EASE.linear));
	const time = `${Math.floor(mins / 60)}:${pad(mins % 60)}`;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1150, y: 560, zoom: 1.6}], [dur, {x: 1200, y: 560, zoom: 1.8}]], EASE.linear)}
			room={{radio: {power: 0}, clock: time, light: 0.35, day: ramp(f, dur * 0.6, dur, 0, 0.35)}}
			adam={{expression: 'scared', look: [1, 0.2], blink: false}}
		/>
	);
};

/** Flashback: three days earlier at the market. */
const R02Market: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const buy = api.at('boughtIt');
	const carrying = f > buy + 40;
	const walk = carrying ? ramp(f, buy + 40, dur, 0, 1, EASE.linear) : 0;
	const adamX = 1000 + walk * 520;
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.15}], [dur, {x: 1060, y: 580, zoom: 1.25}]])} overlay={<><MarkerNote text="3 DAYS EARLIER" x={80} y={900} size={64} /><CartoonFinish vignette={0.35} /></>}>
			<Layer>
				<Market behindTable={<Seller x={880} y={735} scale={0.9} upperOnly expression="smile" look={[0.6, 0.2]} />} />
				{!carrying && <Radio x={1100} y={503} scale={0.17} />}
				<Adam
					x={adamX}
					y={820}
					pose={carrying ? mixPose(walkPose(f * 0.25), POSES.carry, 0.6) : POSES.stand}
					facing={carrying ? 1 : -1}
					expression="smile"
					look={[0.5, 0]}
				/>
				{carrying && <Radio x={adamX - 50} y={600} scale={0.18} />}
			</Layer>
		</Stage>
	);
};

/** Shortwave. AM. FM. – three quick labelled inserts. */
const R03Bands: React.FC<{label: string; zoom: number; tune: number}> = ({label, zoom, tune}) => {
	const {f} = useShot();
	return (
		<Room
			cam={{x: DISPLAY[0] - 30, y: DISPLAY[1] + 20, zoom: zoom + f * 0.015}}
			room={{radio: {power: 0.9, tuning: tune}, day: 0.3, clock: '3:05'}}
			adam={false}
			overlay={<MarkerNote text={label} x={130} y={110} size={110} rot={-6} />}
		/>
	);
};

const R04Nothing: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const thought = api.at('thought');
	const blip = f > thought + 18 && f < thought + 24 ? 1 : 0;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1150, y: 560, zoom: 1.4}], [thought, {x: 1100, y: 560, zoom: 1.6}], [dur, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.2}]], EASE.inOut)}
			room={{radio: {power: blip, readout: '01.17'}, light: 1, day: 0.4, clock: '4:12'}}
			adam={{pose: f < thought ? POSES.shrug : POSES.stand, x: 1420, facing: -1, expression: f < thought ? 'smile' : 'neutral', look: [1, 0]}}
		/>
	);
};

/** Next morning: Adam peeks into the empty hallway. */
const R05Hallway: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const nobody = api.at('nobody');
	return (
		<Stage cam={camKeys(f, [[0, {x: 1400, y: 560, zoom: 1.5}], [nobody, {x: 1400, y: 560, zoom: 1.5}], [dur, {x: 700, y: 540, zoom: 1.05}]])} overlay={<CartoonFinish />}>
			<Layer>
				<Hallway doorB={{open: 0.6}} />
				<Adam x={1460} y={820} pose={POSES.stand} expression="worried" look={[Math.sin(f * 0.08), 0]} headTurn={Math.sin(f * 0.08) * 0.5} upperOnly={false} />
			</Layer>
		</Stage>
	);
};

const R06Neighbor: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const answer = api.at('pajamas');
	const ask = api.at('askedCome');
	const opened = ramp(f, answer, answer + 10);
	const knock = f < answer ? Math.max(hit(f, 8, 4), hit(f, 22, 4), hit(f, 36, 4)) : 0;
	const confused = f >= api.at('confused');
	const shake = f >= api.at('no') && f < api.at('laughed') ? Math.sin(f * 0.9) * 0.6 : 0;
	const laughing = f >= api.at('laughed') && f < api.at('asleep');
	const close = confused;
	return (
		<Stage
			cam={camKeys(f, [[0, {x: 560, y: 560, zoom: 1.5}], [ask, {x: 520, y: 560, zoom: 1.6}], [ask + 1, {x: 470, y: 470, zoom: 2.3}], [dur, {x: 470, y: 470, zoom: 2.5}]])}
			overlay={<CartoonFinish />}
		>
			<Layer>
				<Hallway doorA={{open: opened}} />
				{opened > 0.3 && (
					<Neighbor
						x={420}
						y={820}
						outfit="pajamas"
						shirt="#4a7ab8"
						expression={confused ? 'confused' : 'sleep'}
						look={[0.8, 0]}
						headTurn={shake}
						pose={POSES.standStiff}
					/>
				)}
				<Adam
					x={close ? 640 : 700}
					y={820}
					pose={knock > 0.2 ? POSES.reach : POSES.stand}
					facing={-1}
					expression={laughing ? 'nervous' : 'worried'}
					sweat={laughing}
					look={[1, 0]}
				/>
			</Layer>
		</Stage>
	);
};

const R07DidntTell: React.FC = () => {
	const {f, dur} = useShot();
	const x = 700 + ramp(f, 0, dur, 0, 520, EASE.linear);
	return (
		<Stage cam={camKeys(f, [[0, {x: 900, y: 560, zoom: 1.4}], [dur, {x: 1150, y: 560, zoom: 1.5}]], EASE.linear)} overlay={<CartoonFinish />}>
			<Layer>
				<Hallway doorB={{open: 0.6}} />
				<Neighbor x={420} y={820} outfit="pajamas" shirt="#4a7ab8" expression="blank" look={[1, 0]} />
				<Adam x={x} y={820} pose={walkPose(f * 0.24)} facing={1} expression="worried" look={[-1, 0]} headTurn={-0.5} />
			</Layer>
		</Stage>
	);
};

/** Pulling the plug. */
const R08Unplug: React.FC = () => {
	const {f, dur} = useShot();
	const pulled = f > dur * 0.45;
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1250, y: 680, zoom: 2.6}], [dur, {x: 1250, y: 680, zoom: 2.8}]])}
			room={{radio: {power: 0, cable: pulled ? 'unplugged' : 'plugged'}, light: 1, clock: '9:48'}}
			adam={false}
			top={
				<g>
					<path d={`M 1600 900 Q 1420 800 ${pulled ? 1236 : 1260} ${pulled ? 650 : 643}`} stroke={C.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
					<path d={`M 1600 900 Q 1420 800 ${pulled ? 1236 : 1260} ${pulled ? 650 : 643}`} stroke={C.blue} strokeWidth={20} fill="none" strokeLinecap="round" />
					<circle cx={pulled ? 1226 : 1250} cy={pulled ? 646 : 640} r={13} fill={C.skin} stroke={C.ink} strokeWidth={5} />
				</g>
			}
			overlay={pulled && f < dur * 0.45 + 10 ? <MarkerNote text="*click*" x={760} y={300} size={70} /> : null}
		/>
	);
};

/** 1:17 AM – the clock, then the radio switches itself on with the cable lying on the floor. */
const R09TurnsOn: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const on = api.at('turnedOn');
	const power = f < on + 8 ? 0 : f < on + 14 ? (f % 3 === 0 ? 1 : 0.2) : 1;
	return (
		<Room
			cam={camKeys(f, [[0, {x: CLOCK_C[0], y: CLOCK_C[1], zoom: 5}], [on - 1, {x: CLOCK_C[0] - 40, y: CLOCK_C[1], zoom: 4.6}], [on, {x: 1110, y: 610, zoom: 2.6}], [dur, {x: 1120, y: 615, zoom: 2.9}]], EASE.linear)}
			room={{radio: {power, cable: 'unplugged', readout: '07.11'}, light: 0, nightDarkness: 0.7}}
			adam={false}
			overlay={
				<>
					{f >= on && f < on + 6 && <Flash amount={0.15} color="#ff8a3a" />}
					{f >= on + 10 && <MarkerNote text="← UNPLUGGED!" x={1180} y={640} size={64} rot={-3} />}
				</>
			}
		/>
	);
};

const R10Beep: React.FC<{which: 1 | 2 | 3}> = ({which}) => {
	const {f} = useShot();
	const flash = hit(f, 0, 7);
	if (which === 1) {
		return <Room cam={{x: DISPLAY[0], y: DISPLAY[1] + 30, zoom: 4.5 + f * 0.03}} room={{radio: {power: 0.6 + flash * 0.4, cable: 'unplugged'}, light: 0}} adam={false} />;
	}
	if (which === 2) {
		return (
			<Room
				cam={{x: ADAM_HEAD[0] - 120, y: ADAM_HEAD[1], zoom: 3.8 + f * 0.02}}
				room={{radio: {power: 1, cable: 'unplugged'}, light: 0, nightDarkness: 0.45}}
				adam={{x: 1270, pose: POSES.stand, facing: -1, expression: 'terrified', look: [1, 0.2], hair: 'bedhead', outfit: 'pajamas', shirt: C.blue}}
			/>
		);
	}
	return <RadioVoiceScreen level={0.3 + flash * 0.7} mode="beep" theme="amber" seed={13} />;
};

const R11Stomach: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1270, y: 520, zoom: 3.6}], [dur, {x: 1270, y: 520, zoom: 4.2}]], EASE.linear)}
			room={{radio: {power: 1, cable: 'unplugged'}, light: 0, nightDarkness: 0.45}}
			adam={{x: 1270, pose: POSES.clutchStomach, facing: -1, expression: 'terrified', look: [1, 0.2], hair: 'bedhead', outfit: 'pajamas', pale: ramp(f, 0, dur, 0, 0.8)}}
		/>
	);
};

const R12StaticOff: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const allAt = api.at('thatWasAll');
	return (
		<Room
			cam={camKeys(f, [[0, {x: RADIO_C[0], y: RADIO_C[1], zoom: 3.2}], [dur, {x: RADIO_C[0], y: RADIO_C[1] + 40, zoom: 2.4}]])}
			room={{radio: {power: f < allAt + 6 ? 1 : 0, cable: 'unplugged', flicker: 0.6}, light: 0}}
			adam={false}
			overlay={<StaticOverlay opacity={f < allAt ? 0.3 : 0} blend="screen" seed={61} />}
		/>
	);
};

const R13Minutes: React.FC = () => {
	const {f, dur} = useShot();
	const m = Math.floor(ramp(f, 0, dur, 18, 31, EASE.linear));
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1150, y: 580, zoom: 1.5}], [dur, {x: 1130, y: 580, zoom: 1.9}]], EASE.linear)}
			room={{radio: {power: 0, cable: 'unplugged'}, light: 0, nightDarkness: 0.5, clock: `1:${pad(m)}`}}
			adam={{x: 1270, pose: POSES.standStiff, facing: -1, expression: 'scared', look: [1, 0.3], hair: 'bedhead', outfit: 'pajamas', blink: false}}
		/>
	);
};

/** Next morning on the RED LINE platform. */
const R14Platform: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const stop = api.at('atStation');
	const stopped = f >= api.at('heStopped');
	const trainX = ramp(f, 0, api.at('ridiculous'), 2600, 0, EASE.out);
	const doors = ramp(f, api.at('ridiculous') + 10, api.at('ridiculous') + 22);
	const walking = f >= stop && !stopped;
	const ax = 760 + ramp(f, stop, api.at('heStopped'), 0, 120, EASE.linear);
	const memory = stopped ? ramp(f, api.at('heStopped') + 4, api.at('heStopped') + 10, 0, 0.6) : 0;
	return (
		<Stage
			cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1}], [stop, {x: 900, y: 560, zoom: 1.15}], [api.at('heStopped'), {x: 880, y: 500, zoom: 2.2}], [dur, {x: 880, y: 470, zoom: 2.6}]])}
			overlay={
				<>
					{memory > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${memory * 0.5})`}} />}
					{memory > 0 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: FONT.radio, fontSize: 60, letterSpacing: 10, color: '#fff', opacity: memory}}>
							DO NOT TAKE THE RED TRAIN
						</div>
					)}
					<CartoonFinish />
				</>
			}
		>
			<Layer>
				<TrainScene train="red" trainX={trainX} doorsOpen={doors} />
				<Adam
					x={ax}
					y={PLATFORM_Y + 70}
					pose={walking ? walkPose(f * 0.25) : f >= api.at('ridiculous') && f < stop ? POSES.shrug : POSES.stand}
					facing={1}
					expression={stopped ? 'scared' : f >= api.at('ridiculous') ? 'nervous' : 'neutral'}
					look={[0.4, -0.3]}
				/>
			</Layer>
		</Stage>
	);
};

const R15Slower: React.FC = () => {
	const {f, dur} = useShot();
	const ax = 640 + ramp(f, 0, dur * 0.8, 0, 260, EASE.linear);
	return (
		<Stage cam={camKeys(f, [[0, {x: 900, y: 560, zoom: 1.1}], [dur, {x: 960, y: 560, zoom: 1.2}]])} overlay={<CartoonFinish />}>
			<Layer>
				<TrainScene train="gray" trainX={0} doorsOpen={1} sign="GRAY LINE" signColor="#7d8794" />
				<Adam x={ax} y={PLATFORM_Y + 70} pose={walkPose(f * 0.22)} facing={1} expression="worried" look={[0.6, 0]} />
			</Layer>
		</Stage>
	);
};

/** Phone fills with alerts – a realistic UI over the cartoon hand. */
const R16Alerts: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const n = [0.5, 1.05, 1.55].map((s) => api.s(s));
	const vis = (i: number) => ramp(f, n[i], n[i] + 6);
	const buzz = Math.max(...n.map((s) => (f >= s && f < s + 10 ? 4 : 0)));
	return (
		<Stage cam={{x: 960, y: 560, zoom: 1.05 + f * 0.0015}} bg="#1b2347" overlay={<CartoonFinish />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill="#1b2347" />
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={-400 + ((f * 18 + i * 600) % 2600)} y={220} width={340} height={200} fill="#2a3466" stroke={C.ink} strokeWidth={6} />
				))}
				<path d="M 1300 1200 Q 1200 900 1080 820" stroke={C.ink} strokeWidth={70} fill="none" strokeLinecap="round" />
				<path d="M 1300 1200 Q 1200 900 1080 820" stroke={C.blue} strokeWidth={56} fill="none" strokeLinecap="round" />
				<Phone x={810} y={140} scale={1.35} buzz={buzz}>
					<rect width={260} height={500} fill="#20263a" />
					<text x={130} y={70} fontFamily={FONT.ui} fontSize={44} fill="#fff" textAnchor="middle" fontWeight={600}>
						8:41
					</text>
					<PhoneNotification y={110} app="CITY TRANSIT" title="Red Line suspended" body="Emergency at Central. Avoid." opacity={vis(0)} dx={(1 - vis(0)) * 40} />
					<PhoneNotification y={216} app="THE MORNING RECORD" title="Fire on Red Line train" body="Several injured, crews on scene" color="#222" opacity={vis(1)} dx={(1 - vis(1)) * 40} />
					<PhoneNotification y={322} app="MESSAGES" title="Mom" body="are you ok?? call me" color="#2ea043" opacity={vis(2)} dx={(1 - vis(2)) * 40} />
				</Phone>
				<circle cx={1080} cy={820} r={30} fill={C.skin} stroke={C.ink} strokeWidth={6} />
			</Layer>
		</Stage>
	);
};

/** News insert: crude drawing of the burning red train with a breaking banner. */
const R17Fire: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<Stage
			cam={camKeys(f, [[0, {x: 960, y: 540, zoom: 1.05}], [dur, {x: 960, y: 520, zoom: 1.2}]])}
			overlay={
				<>
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 90, height: 120, background: C.red, display: 'flex', alignItems: 'center', paddingLeft: 60, gap: 30}}>
						<div style={{background: '#fff', color: C.red, fontFamily: FONT.headline, fontWeight: 700, fontSize: 52, padding: '4px 20px'}}>BREAKING</div>
						<div style={{color: '#fff', fontFamily: FONT.headline, fontWeight: 500, fontSize: 50}}>
							{f < api.at('injured') ? 'ELECTRICAL FIRE SHUTS DOWN RED LINE' : 'SEVERAL PASSENGERS INJURED'}
						</div>
					</div>
					<CartoonFinish />
				</>
			}
		>
			<Layer>
				<TrainScene train="red" trainX={0} doorsOpen={0} fire={1} />
			</Layer>
		</Stage>
	);
};

const R18Stared: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 470, zoom: 2.4}], [dur, {x: 960, y: 470, zoom: 2.8}]], EASE.linear)} bg="#2a3040" overlay={<CartoonFinish vignette={0.7} />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill="#3a4258" />
				{[0, 1].map((i) => (
					<rect key={i} x={-400 + ((f * 30 + i * 1200) % 2600)} y={250} width={500} height={240} fill="#c9a640" opacity={0.25} />
				))}
				<ellipse cx={960} cy={520} rx={260} ry={260} fill="#bfe0ff" opacity={0.12} />
				<Adam x={960} y={900} pose={POSES.holdPhoneLow} expression="terrified" look={[0, 1]} pale={0.4} />
			</Layer>
		</Stage>
	);
};

export const RadioReturns: React.FC = () => (
	<>
		<Shot from="didntSleep" name="Didn't sleep (time-lapse)">
			<R01NoSleep />
		</Shot>
		<Shot from="radioOld" to="boughtIt" name="Market flashback">
			<R02Market />
		</Shot>
		<Shot from="shortwave" name="SHORTWAVE">
			<R03Bands label="SHORTWAVE." zoom={3.2} tune={0.2} />
		</Shot>
		<Shot from="am" name="AM">
			<R03Bands label="AM." zoom={4} tune={0.5} />
		</Shot>
		<Shot from="fm" name="FM">
			<R03Bands label="FM." zoom={4.8} tune={0.8} />
		</Shot>
		<Shot from="nothingSpecial" to="thought" name="Nothing special">
			<R04Nothing />
		</Shot>
		<Shot from="checkedHall" to="nobody" name="Empty hallway">
			<R05Hallway />
		</Shot>
		<Shot from="knockedNeighbor" to="asleep" name="Neighbour in pajamas">
			<R06Neighbor />
		</Shot>
		<Shot from="didntTell" name="Didn't tell him">
			<R07DidntTell />
		</Shot>
		<Shot from="unplugged" name="Unplugged">
			<R08Unplug />
		</Shot>
		<Shot from="at117" to="turnedOn" name="Turns on unplugged">
			<R09TurnsOn />
		</Shot>
		<Shot from="beep1" name="BEEP 1">
			<R10Beep which={1} />
		</Shot>
		<Shot from="beep2" name="BEEP 2">
			<R10Beep which={2} />
		</Shot>
		<Shot from="beep3" name="BEEP 3">
			<R10Beep which={3} />
		</Shot>
		<Shot from="sameVoice" to="adam" name="ADAM">
			<VoiceShot seed={14} />
		</Shot>
		<Shot from="stomach" name="Stomach dropped">
			<R11Stomach />
		</Shot>
		<Shot from="then" to="redTrain" name="RED TRAIN">
			<VoiceShot theme="red" seed={15} glitch={0.45} />
		</Shot>
		<Shot from="static" to="thatWasAll" name="Static / off">
			<R12StaticOff />
		</Shot>
		<Shot from="severalMinutes" name="Several minutes">
			<R13Minutes />
		</Shot>
		<Shot from="almostIgnored" to="heStopped" name="Red Line platform">
			<R14Platform />
		</Shot>
		<Shot from="slowerLine" name="Gray line">
			<R15Slower />
		</Shot>
		<Shot from="alerts" name="Phone alerts">
			<R16Alerts />
		</Shot>
		<Shot from="fire" to="injured" name="Breaking news">
			<R17Fire />
		</Shot>
		<Shot from="staredScreen" name="Stared at the screen">
			<R18Stared />
		</Shot>
	</>
);

