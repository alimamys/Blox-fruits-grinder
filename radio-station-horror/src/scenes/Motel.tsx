// ~4:52 – The motel. The TV speaks, "Subject has left designated location",
// Victor in the TV reflection, SUBJECT LOCATED, the bed lifts, escape.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Adam, Victor} from '../components/Characters';
import {Flash, Vignette} from '../components/CRTNoise';
import {VictorPortrait} from '../components/EvidencePhoto';
import {Chair, TV} from '../components/Furniture';
import {Phone} from '../components/Phone';
import {RadioText} from '../components/RadioText';
import {MotelExterior, Street} from '../components/sets/Exteriors';
import {MOTEL_BED, MOTEL_FLOOR, MOTEL_TV, MotelRoom, UnderBedThing} from '../components/sets/MotelRoom';
import type {Cam} from '../components/Stage';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import type {StickPersonProps} from '../components/StickPerson';
import {mixPose, POSES, runPose, walkPose} from '../components/StickPerson';
import {EASE, hit, keys, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import type {ShotApi} from '../utils/timeline-context';
import {Shot, useShot} from '../utils/timeline-context';
import {AutoRadioText, CartoonFinish, radioLevel} from './shared';
import {Room, VoiceShot} from './rooms';

const TV_SCREEN: [number, number] = [MOTEL_TV.x + 200 * MOTEL_TV.scale, MOTEL_TV.y + 160 * MOTEL_TV.scale];
const CLOCK_C: [number, number] = [1662, 706];
const HANDLE: [number, number] = [324, 615];

type AdamP = Partial<StickPersonProps> | false;

/** The motel room with a camera and Adam. */
const MRoom: React.FC<{
	cam: Cam;
	adam?: AdamP;
	room?: Partial<React.ComponentProps<typeof MotelRoom>>;
	shake?: number;
	handheld?: number;
	extra?: React.ReactNode;
	overlay?: React.ReactNode;
}> = ({cam, adam = {}, room = {}, shake = 0, handheld = 0, extra, overlay}) => (
	<Stage cam={cam} shake={shake} handheld={handheld} bg="#1a160c" overlay={<>{overlay}<CartoonFinish vignette={0.6} /></>}>
		<Layer>
			<MotelRoom {...room}>
				{adam !== false && <Adam x={1150} y={MOTEL_FLOOR - 6} pose={POSES.sit} facing={-1} {...adam} />}
				{extra}
			</MotelRoom>
		</Layer>
	</Stage>
);

/** Text the TV is "saying" right now (short lines appear on the TV glass itself). */
const tvText = (api: ShotApi): string | undefined => {
	const b = api.current;
	if (!b || b.speaker !== 'radio' || !b.onScreen) {
		return undefined;
	}
	return b.onScreen.length <= 16 ? b.onScreen : undefined;
};

// ----------------------------------------------------------------------------
const M01Arrive: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const x = ramp(f, 0, dur, 1500, 900, EASE.linear);
	return (
		<Stage cam={camKeys(f, [[0, {x: 900, y: 560, zoom: 1.05}], [dur, {x: 820, y: 560, zoom: 1.15}]])} overlay={<CartoonFinish />}>
			<Layer>
				<MotelExterior flicker={hash1(Math.floor(f / 3), 5) > 0.15 ? 1 : 0.3} />
				<Adam x={x} y={980} scale={0.45} pose={walkPose(f * 0.25)} facing={-1} expression="worried" />
			</Layer>
		</Stage>
	);
};

const M02LeftRadio: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Room
			cam={camKeys(f, [[0, {x: 1050, y: 580, zoom: 1.6}], [dur, {x: 990, y: 567, zoom: 2.2}]], EASE.linear)}
			room={{radio: {power: 0}, light: 0, nightDarkness: 0.65, clock: '11:48'}}
			adam={false}
		/>
	);
};

const M03PhoneOff: React.FC = () => {
	const {f, dur} = useShot();
	const off = ramp(f, dur * 0.45, dur * 0.6);
	return (
		<Stage cam={{x: 960, y: 560, zoom: 1.1}} bg="#1a160c" overlay={<CartoonFinish vignette={0.7} />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill="#3a2e18" />
				<Phone x={810} y={150} scale={1.3} screen={1 - off}>
					<rect width={260} height={500} fill="#20263a" />
					<text x={130} y={90} fontFamily={FONT.ui} fontSize={44} fill="#fff" textAnchor="middle" fontWeight={600}>
						12:31
					</text>
					<rect x={40} y={220} width={180} height={60} rx={30} fill="#e5484d" />
					<text x={130} y={258} fontFamily={FONT.ui} fontSize={22} fill="#fff" textAnchor="middle">
						slide to power off
					</text>
				</Phone>
			</Layer>
		</Stage>
	);
};

/** 1:16 → 1:17 → nothing → he almost laughs. */
const M04Clock: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const t117 = api.at('t117');
	const nothing = api.at('nothing');
	const laugh = api.at('almostLaughed');
	const time = f < t117 + 8 ? '1:16' : '1:17';
	let cam: Cam;
	if (f < t117) {
		cam = camKeys(f, [[0, {x: 1250, y: 600, zoom: 1.5}], [t117, {x: 1300, y: 620, zoom: 1.8}]], EASE.linear);
	} else if (f < nothing) {
		cam = {x: CLOCK_C[0], y: CLOCK_C[1], zoom: 6 + (f - t117) * 0.02};
	} else if (f < laugh) {
		cam = {x: 960, y: 560, zoom: 1.0 + (f - nothing) * 0.002};
	} else {
		cam = camKeys(f, [[laugh, {x: 1160, y: 540, zoom: 3}], [dur, {x: 1160, y: 540, zoom: 3.2}]], EASE.linear);
	}
	return <MRoom cam={cam} room={{clock: time}} adam={{expression: f >= laugh ? 'nervous' : 'worried', look: [-1, 0.2], headTurn: 0.3, sweat: f >= laugh}} />;
};

const M05TvOn: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const on = ramp(f, 2, 6);
	const snap = ramp(f, 0, 6, 0, 1, EASE.out);
	return (
		<MRoom
			cam={camKeys(snap, [[0, {x: 1100, y: 560, zoom: 1.6}], [1, {x: TV_SCREEN[0] + 120, y: TV_SCREEN[1], zoom: 1.8 + f * 0.003}]], EASE.linear)}
			room={{clock: '1:17', tv: {on, staticAmount: 1}}}
			adam={{expression: 'scared', look: [1, 0], headTurn: 0.4}}
			overlay={<Flash amount={hit(f, 2, 5) * 0.15} color="#cfe3ff" />}
		/>
	);
};

const M06Beep: React.FC<{which: 1 | 2 | 3}> = ({which}) => {
	const api = useShot();
	const {f} = api;
	const flash = hit(f, 0, 7);
	if (which === 2) {
		return <MRoom cam={{x: 1150, y: 520, zoom: 3.6 + f * 0.02}} room={{clock: '1:17', tv: {on: 1}}} adam={{expression: 'terrified', look: [1, 0]}} />;
	}
	return (
		<MRoom
			cam={{x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: (which === 1 ? 3.2 : 4.2) + f * 0.02}}
			room={{clock: '1:17', tv: {on: 1, staticAmount: 0.6, text: flash > 0.3 ? '●' : undefined}}}
			adam={false}
			overlay={<Flash amount={flash * 0.12} color="#e8f0ff" />}
		/>
	);
};

/** TV close-up that shows short radio lines on the glass. */
const TvTalk: React.FC<{zoom?: [number, number]; staticAmount?: number; shake?: number; textColor?: string; overlayText?: boolean}> = ({zoom = [2.6, 3.0], staticAmount = 0.35, shake = 0, textColor, overlayText = true}) => {
	const api = useShot();
	const {f, dur} = api;
	const text = tvText(api);
	return (
		<>
			<MRoom
				cam={camKeys(f, [[0, {x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: zoom[0]}], [dur, {x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: zoom[1]}]], EASE.linear)}
				shake={shake}
				room={{clock: '1:17', tv: {on: 1, staticAmount: staticAmount + radioLevel(api) * 0.1, text, textColor}}}
				adam={false}
			/>
			{overlayText && !text && <AutoRadioText top={82} size={76} />}
		</>
	);
};

const M08Backed: React.FC = () => {
	const {f, dur} = useShot();
	const t = ramp(f, 0, dur, 0, 1, EASE.inOut);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: 900, y: 560, zoom: 1.2}], [dur, {x: 700, y: 560, zoom: 1.3}]])}
			room={{clock: '1:17', tv: {on: 1, staticAmount: 0.5}}}
			adam={{x: 1100 - t * 640, y: MOTEL_FLOOR, pose: mixPose(walkPose(-f * 0.22, 0.6), POSES.recoil, 0.5), facing: 1, expression: 'terrified', look: [-1, 0], headTurn: -0.5}}
		/>
	);
};

const AdamClose: React.FC<{expr: StickPersonProps['expression']; shakeHead?: boolean; note?: string; zoom?: number; x?: number}> = ({expr, shakeHead, note, zoom = 3.6, x = 470}) => {
	const {f, dur} = useShot();
	const turn = shakeHead ? Math.sin(f * 0.6) * 0.7 * ramp(f, 0, 6) * ramp(f, dur - 6, dur, 1, 0) : 0;
	return (
		<MRoom
			cam={camKeys(f, [[0, {x, y: 520, zoom}], [dur, {x, y: 520, zoom: zoom + 0.4}]], EASE.linear)}
			room={{clock: '1:17', tv: {on: 1, staticAmount: 0.6}}}
			adam={{x, y: MOTEL_FLOOR, pose: POSES.standStiff, facing: 1, expression: expr, look: [-1, 0], headTurn: turn, tremble: 0.3}}
			overlay={note ? <div style={{position: 'absolute', left: 1180, top: 200, fontFamily: FONT.marker, fontSize: 90, color: C.white, transform: 'rotate(6deg)'}}>{note}</div> : null}
		/>
	);
};

/** Door handle won't move. */
const M17Handle: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const pulled = api.at('pulled');
	const jiggle = Math.sin(f * 1.4) * (f >= pulled ? 1 : 0.5);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: HANDLE[0] + 80, y: HANDLE[1] - 40, zoom: 2.6}], [pulled, {x: HANDLE[0] + 80, y: HANDLE[1] - 40, zoom: 2.8}], [dur, {x: HANDLE[0] + 60, y: HANDLE[1] - 30, zoom: 3.3}]])}
			shake={f >= pulled ? 0.08 : 0}
			room={{clock: '1:17', tv: {on: 1, staticAmount: 0.4}, door: {handleTurn: 0.3 + jiggle * 0.3, rattle: f >= pulled ? jiggle * 4 : 0}}}
			adam={{x: 470, y: MOTEL_FLOOR, pose: f >= pulled ? POSES.pull : POSES.reach, facing: -1, expression: f >= pulled ? 'scream' : 'scared', look: [1, 0]}}
			overlay={f >= api.at('lockedDoor') && f < pulled ? <div style={{position: 'absolute', left: 180, top: 160, fontFamily: FONT.marker, fontSize: 110, color: C.red, transform: 'rotate(-6deg)'}}>LOCKED</div> : null}
		/>
	);
};

/** The mattress sinks behind him. Nobody is there. */
const M20Sink: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const sink = ramp(f, api.at('shiftedBed'), api.at('satDown') + 20, 0, 1, EASE.inOut);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: 960, y: 600, zoom: 1.15}], [api.at('sank'), {x: 1150, y: 680, zoom: 1.6}], [dur, {x: 1200, y: 700, zoom: 2.1}]], EASE.slowIn)}
			room={{clock: '1:17', tv: {on: 0}, bedSink: sink * 2.4, bedRattle: f >= api.at('shiftedBed') && f < api.at('shiftedBed') + 6 ? 2 : 0}}
			adam={{x: 470, y: MOTEL_FLOOR, pose: POSES.reach, facing: -1, expression: 'terrified', look: [1, 0], tremble: 0.3}}
		/>
	);
};

// ----------------------------------------------------------- SPECIAL G -----
/** What the dark TV glass reflects: Adam's face, the bed behind him, and (eventually) Victor. */
const Reflection: React.FC<{victor: number; victorPose?: StickPersonProps['pose']; finger?: 'up' | 'point'; victorExpr?: StickPersonProps['expression']; victorTremble?: number; adamExpr?: StickPersonProps['expression']}> = ({
	victor,
	victorPose = POSES.stand,
	finger,
	victorExpr = 'blank',
	victorTremble = 0,
	adamExpr = 'terrified',
}) => (
	<g opacity={0.62} style={{filter: 'blur(0.6px) saturate(0.45)'}}>
		<rect width={320} height={240} fill="#2b2517" />
		<rect y={160} width={320} height={80} fill="#1f1a10" />
		<rect x={120} y={40} width={60} height={42} fill="#3b3524" />
		{/* bed behind him */}
		<rect x={140} y={150} width={180} height={40} fill="#5a4622" />
		<rect x={290} y={110} width={14} height={80} fill="#3a2a12" />
		{victor > 0 && (
			<g opacity={victor}>
				<Victor x={222} y={207} scale={0.28} pose={victorPose} upperOnly finger={finger} expression={victorExpr} tremble={victorTremble} look={[0, 0]} />
			</g>
		)}
		<rect x={140} y={176} width={180} height={30} fill="#6a5228" />
		{/* Adam, facing the screen */}
		<Adam x={92} y={560} scale={1.25} upperOnly expression={adamExpr} look={[0, 0]} blink={false} />
	</g>
);

const TV_S = 3.2;
const TV_X = 960 - 200 * TV_S;
const TV_Y = 540 - 165 * TV_S;
/** Screen coords (0..320, 0..240) → world. */
const scr = (sx: number, sy: number): [number, number] => [TV_X + (40 + sx) * TV_S, TV_Y + (40 + sy) * TV_S];

const ReflectionShot: React.FC<{mode: 'reveal' | 'face' | 'shush' | 'whisper' | 'tremble' | 'vanish' | 'adamEyes'}> = ({mode}) => {
	const api = useShot();
	const {f, dur} = api;
	let victor = 1;
	let cam: Cam;
	let pose = POSES.stand;
	let finger: 'up' | 'point' | undefined;
	let vExpr: StickPersonProps['expression'] = 'blank';
	let vTremble = 0;
	const vHead = scr(222, 117);
	const aHead = scr(92, 155);
	if (mode === 'reveal') {
		// one continuous shot: stare at the glass, slow push, Victor fades in – no cut
		const sit = api.at('sittingOnIt');
		victor = ramp(f, sit, api.at('wasAMan') + 12, 0, 1, EASE.inOut);
		cam = camKeys(f, [[0, {x: 960, y: 560, zoom: 0.92}], [sit, {x: 1010, y: 540, zoom: 1.25}], [api.at('thin'), {x: vHead[0] - 40, y: vHead[1] + 80, zoom: 1.7}], [dur, {x: vHead[0], y: vHead[1] + 50, zoom: 2.3}]], EASE.inOut);
	} else if (mode === 'face') {
		cam = camKeys(f, [[0, {x: vHead[0], y: vHead[1] + 20, zoom: 3.0}], [dur, {x: vHead[0], y: vHead[1] + 20, zoom: 3.4}]], EASE.linear);
	} else if (mode === 'shush') {
		const point = api.at('pointed');
		pose = f < point ? mixPose(POSES.stand, POSES.coverMouth, ramp(f, 4, 16)) : mixPose(POSES.coverMouth, {...POSES.stand, armR: [40, 4]}, ramp(f, point, point + 10));
		finger = f < point ? 'up' : 'point';
		vExpr = f < point ? 'shush' : 'blank';
		cam = camKeys(f, [[0, {x: vHead[0], y: vHead[1] + 80, zoom: 2.4}], [point, {x: vHead[0], y: vHead[1] + 110, zoom: 2.3}], [dur, {x: vHead[0] + 30, y: vHead[1] + 220, zoom: 2.1}]], EASE.inOut);
	} else if (mode === 'whisper') {
		vExpr = 'worried';
		cam = camKeys(f, [[0, {x: vHead[0], y: vHead[1] + 20, zoom: 3.2}], [dur, {x: vHead[0], y: vHead[1] + 20, zoom: 3.8}]], EASE.linear);
	} else if (mode === 'tremble') {
		vExpr = 'scared';
		vTremble = 0.6;
		cam = camKeys(f, [[0, {x: vHead[0], y: vHead[1] + 20, zoom: 3.4}], [dur, {x: vHead[0], y: vHead[1] + 20, zoom: 4.0}]], EASE.linear);
	} else if (mode === 'vanish') {
		victor = f < 8 ? (f % 2 ? 1 : 0.2) : 0;
		cam = {x: vHead[0] - 60, y: vHead[1] + 80, zoom: 2.2};
	} else {
		cam = camKeys(f, [[0, {x: aHead[0], y: aHead[1], zoom: 2.4}], [dur, {x: aHead[0], y: aHead[1], zoom: 2.8}]], EASE.linear);
	}
	const fgVisible = (cam.zoom ?? 1) < 1.6;
	return (
		<Stage cam={cam} bg="#120f08" overlay={<CartoonFinish vignette={0.75} grain={0.08} />}>
			<Layer>
				<rect x={-400} y={-400} width={2720} height={1900} fill="#5e5126" />
				<rect x={-400} y={TV_Y + 330 * TV_S - 40} width={2720} height={400} fill="#6a4a26" />
				<TV x={TV_X} y={TV_Y} scale={TV_S} on={0} reflection={<Reflection victor={victor} victorPose={pose} finger={finger} victorExpr={vExpr} victorTremble={vTremble} adamExpr={mode === 'adamEyes' ? 'terrified' : 'scared'} />} />
				{/* Adam's own head in the foreground (over-the-shoulder) */}
				{fgVisible && (
					<g>
						<circle cx={330} cy={1060} r={190} fill={C.hair} stroke={C.ink} strokeWidth={10} />
						<path d="M 120 1100 Q 330 900 540 1100 L 600 1500 L 60 1500 Z" fill={C.blue} stroke={C.ink} strokeWidth={10} />
					</g>
				)}
			</Layer>
		</Stage>
	);
};

const WhisperText: React.FC = () => {
	const api = useShot();
	const b = api.current;
	if (!b || b.speaker !== 'victor' || !b.onScreen) {
		return null;
	}
	return <RadioText key={b.id} text={b.onScreen} start={api.at(b.id)} end={api.end(b.id)} top={84} size={84} font={FONT.scrawl} letterSpacing="0.06em" color="#d9dfe6" glitch={0.12} panel />;
};

/** Flash insert: the newspaper photograph. */
const M22Photo: React.FC = () => {
	const {f, dur} = useShot();
	const z = 1 + (f / dur) * 0.08;
	return (
		<AbsoluteFill style={{background: '#0e0d0b', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${z}) rotate(-2deg)`, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '14px solid #e7dcc0'}}>
				<VictorPortrait width={640} height={800} sepia={0} blur={1.6} />
			</div>
			<Vignette strength={0.7} />
		</AbsoluteFill>
	);
};

/** SUBJECT LOCATED. */
const M27Located: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const at = api.at('located');
	return (
		<>
			<MRoom
				cam={{x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: f < at ? 2.6 : 3.4}}
				shake={f >= at ? 0.25 : 0.05}
				room={{clock: '1:17', tv: {on: 1, staticAmount: 1}}}
				adam={false}
				overlay={<Flash amount={hit(f, at, 6) * 0.5} color="#ff2a2a" />}
			/>
			{f >= at && <RadioText text="SUBJECT LOCATED." start={at} top={50} size={130} color="#ff3b30" glitch={0.9} seed={99} panel />}
		</>
	);
};

const M28HitFloor: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const k = hit(f, 2, 8);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: 1100, y: 640, zoom: 1.5}], [dur, {x: 1150, y: 680, zoom: 1.7}]])}
			shake={k * 0.9}
			room={{clock: '1:17', tv: {on: 0.3, staticAmount: 1}, bedRattle: k * 14, lurk: 1}}
			adam={{x: 470, y: MOTEL_FLOOR, pose: POSES.recoil, facing: 1, expression: 'scream', look: [1, 0]}}
			overlay={<Flash amount={k * 0.35} />}
		/>
	);
};

const M30Run: React.FC = () => {
	const {f, dur} = useShot();
	const x = ramp(f, 0, dur, 470, 1560, EASE.in);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: 800, y: 560, zoom: 1.1}], [dur, {x: 1200, y: 560, zoom: 1.15}]])}
			handheld={0.6}
			room={{clock: '1:17', tv: {on: 0.4, staticAmount: 1}, lurk: 1}}
			adam={{x, y: MOTEL_FLOOR + 60, pose: runPose(f * 0.5), facing: 1, expression: 'scream', look: [1, 0]}}
		/>
	);
};

/** SPECIAL H: the bed lifts. Only dark limbs and shadow are ever seen. */
const M31Lift: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const lift = keys(f, [[0, 0], [api.at('notTipped'), 70], [api.at('lifted'), 110], [api.at('standingUp'), 150], [dur, 250]], EASE.inOut);
	const flick = hash1(Math.floor(f / 2), 11) > 0.2 ? 1 : 0.3;
	const cut = f >= api.at('lifted');
	return (
		<MRoom
			cam={cut ? camKeys(f, [[api.at('lifted'), {x: 1280, y: 700, zoom: 1.8}], [dur, {x: 1280, y: 640, zoom: 2.2}]], EASE.linear) : camKeys(f, [[0, {x: 1250, y: 620, zoom: 1.2}], [api.at('lifted'), {x: 1250, y: 640, zoom: 1.4}]])}
			handheld={0.7}
			shake={0.05 + hit(f, api.at('lifted'), 8) * 0.3}
			room={{clock: '1:17', tv: {on: 0.4, staticAmount: 1}, bedLift: lift, light: flick, lurk: 0}}
			adam={{x: 1700, y: MOTEL_FLOOR + 40, pose: POSES.recoil, facing: -1, expression: 'scream', look: [1, 0.3], tremble: 0.6}}
			extra={<UnderBedThing x={MOTEL_BED.x} y={MOTEL_FLOOR} w={MOTEL_BED.w} rise={lift} />}
		/>
	);
};

const M32Explode: React.FC = () => {
	const {f, dur} = useShot();
	const k = hit(f, 0, 6);
	return (
		<MRoom
			cam={{x: 1300, y: 560, zoom: 1.3}}
			shake={k * 0.8}
			room={{clock: '1:17', tv: {on: 0.4, staticAmount: 1}, bedLift: 250, blown: true, light: f < 3 ? 1 : 0.25}}
			adam={{x: 1700, y: MOTEL_FLOOR + 40, pose: POSES.handsOnHead, facing: -1, expression: 'scream', tremble: 0.6}}
			extra={
				<>
					<UnderBedThing x={MOTEL_BED.x} y={MOTEL_FLOOR} w={MOTEL_BED.w} rise={250} />
					{Array.from({length: 14}).map((_, i) => {
						const a = (i / 14) * Math.PI * 2;
						const r = 40 + ramp(f, 0, dur, 0, 260);
						return <line key={i} x1={1700 + Math.cos(a) * r} y1={560 + Math.sin(a) * r} x2={1700 + Math.cos(a) * (r + 20)} y2={560 + Math.sin(a) * (r + 20)} stroke="#fff6c8" strokeWidth={4} opacity={1 - f / dur} />;
					})}
				</>
			}
			overlay={<Flash amount={k} />}
		/>
	);
};

const M33Smash: React.FC = () => {
	const {f, dur} = useShot();
	const impact = Math.round(0.5 * 30);
	const broken = f >= impact;
	const swing = ramp(f, 0, impact, -60, 20, EASE.in);
	const climb = ramp(f, impact + 20, dur, 0, 1, EASE.inOut);
	return (
		<MRoom
			cam={camKeys(f, [[0, {x: 1650, y: 520, zoom: 1.7}], [dur, {x: 1700, y: 480, zoom: 1.9}]])}
			handheld={0.6}
			shake={hit(f, impact, 8) * 0.7}
			room={{clock: '1:17', tv: {on: 0.4, staticAmount: 1}, bedLift: 250, blown: true, light: 0.3, windowBroken: broken}}
			adam={{x: 1640 + climb * 150, y: MOTEL_FLOOR - climb * 250, pose: POSES.armsUp, facing: 1, expression: 'scream', look: [1, -0.4]}}
			extra={
				<>
					{!broken && (
						<g transform={`rotate(${swing} 1640 400)`}>
							<Chair x={1700} y={330} scale={0.9} facing={1} rotate={180} color="#5a4a2a" />
						</g>
					)}
					{broken &&
						Array.from({length: 12}).map((_, i) => {
							const t = Math.min(1, (f - impact) / 20);
							return <path key={i} d={`M ${1750 + i * 9} ${380 + (i % 4) * 30} l ${8 + i} ${12}`} stroke="#cfe3ff" strokeWidth={4} transform={`translate(${t * (80 + i * 14)} ${t * t * 200})`} opacity={1 - t * 0.7} />;
						})}
				</>
			}
		/>
	);
};

const M34DoNotLeave: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const at = api.at('dontLeave');
	return (
		<>
			<MRoom
				cam={f < at ? camKeys(f, [[0, {x: 900, y: 520, zoom: 1.4}], [at, {x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: 2.4}]], EASE.slowIn) : {x: TV_SCREEN[0], y: TV_SCREEN[1], zoom: 3.6}}
				shake={f >= at ? 0.35 : 0.05}
				room={{clock: '1:17', tv: {on: 1, staticAmount: 1}, bedLift: 250, blown: true, light: 0.3, windowBroken: true}}
				adam={false}
				overlay={<StaticOverlay opacity={f >= at ? 0.25 : 0.08} blend="screen" seed={77} />}
			/>
			{f >= at && <RadioText text="DO NOT LEAVE." start={at} top={50} size={150} color="#ff3b30" glitch={1} seed={98} panel />}
		</>
	);
};

const M35Escape: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const ran = api.at('ran');
	const stop = api.at('didntStop');
	if (f < stop) {
		// down the fire escape and across the lot
		const path: Array<[number, number, number]> = [
			[0, 1700, 610],
			[ran - 4, 1650, 760],
			[ran, 1760, 900],
			[stop, 1400, 960],
		];
		const x = keys(f, path.map(([t, px]) => [t, px] as [number, number]), EASE.linear);
		const y = keys(f, path.map(([t, , py]) => [t, py] as [number, number]), EASE.linear);
		return (
			<Stage cam={camKeys(f, [[0, {x: 1500, y: 700, zoom: 1.6}], [stop, {x: 1450, y: 800, zoom: 1.4}]])} handheld={0.4} overlay={<CartoonFinish />}>
				<Layer>
					<MotelExterior roomLit={false} escape={1} />
					<Adam x={x} y={y} scale={0.4} pose={runPose(f * 0.5)} facing={f < ran ? 1 : -1} expression="scream" />
				</Layer>
			</Stage>
		);
	}
	const t = ramp(f, stop, dur, 0, 1, EASE.linear);
	return (
		<Stage cam={{x: 960, y: 560, zoom: 1}} overlay={<CartoonFinish vignette={0.8} />}>
			<Layer>
				<Street ground={860} />
				<Adam x={900 + t * 300} y={860 - t * 40} scale={1 - t * 0.75} pose={runPose(f * 0.5)} facing={1} expression="scream" />
			</Layer>
		</Stage>
	);
};

export const Motel: React.FC = () => (
	<>
		<Shot from="didntGoHome" to="booked" name="Motel across town">
			<M01Arrive />
		</Shot>
		<Shot from="leftRadio" name="Left the radio">
			<M02LeftRadio />
		</Shot>
		<Shot from="phoneOff" name="Phone off">
			<M03PhoneOff />
		</Shot>
		<Shot from="at116" to="almostLaughed" name="1:16 → 1:17 → nothing">
			<M04Clock />
		</Shot>
		<Shot from="tvOn" to="static" name="TV turns on">
			<M05TvOn />
		</Shot>
		<Shot from="beep1" name="BEEP 1">
			<M06Beep which={1} />
		</Shot>
		<Shot from="beep2" name="BEEP 2">
			<M06Beep which={2} />
		</Shot>
		<Shot from="beep3" name="BEEP 3">
			<M06Beep which={3} />
		</Shot>
		<Shot from="filled" to="adam" name="ADAM (TV)">
			<TvTalk />
		</Shot>
		<Shot from="backed" name="Backs toward the door">
			<M08Backed />
		</Shot>
		<Shot from="returnHome" name="RETURN HOME">
			<TvTalk zoom={[3, 3.4]} />
		</Shot>
		<Shot from="shook" to="no1" name="Shakes head – No.">
			<AdamClose expr="determined" shakeHead />
		</Shot>
		<Shot from="sharpened" to="returnHome2" name="RETURN HOME (sharper)">
			<TvTalk zoom={[3.4, 4.2]} staticAmount={0.9} shake={0.2} textColor="#ff6b6b" />
		</Shot>
		<Shot from="no2" name="No.">
			<AdamClose expr="determined" zoom={4} />
		</Shot>
		<Shot from="changed" to="disappointed" name="The voice changes">
			<TvTalk zoom={[2.2, 3.2]} staticAmount={0.08} />
		</Shot>
		<Shot from="subjectLeft" name="SUBJECT HAS LEFT DESIGNATED LOCATION">
			<VoiceShot theme="amber" seed={51} label="SUBJECT TRACKING — STATUS" />
		</Shot>
		<Shot from="froze" to="subjectQ" name="Subject?">
			<AdamClose expr="confused" note="subject?" />
		</Shot>
		<Shot from="continued" to="correction" name="CORRECTION REQUIRED">
			<VoiceShot theme="red" seed={52} label="SUBJECT TRACKING — STATUS" glitch={0.5} />
		</Shot>
		<Shot from="handle" to="nothing2" name="Locked">
			<M17Handle />
		</Shot>
		<Shot from="tvSaid" to="dontTurn" name="DO NOT TURN AROUND">
			<VoiceShot theme="red" seed={53} glitch={0.4} />
		</Shot>
		<Shot from="breathStopped" name="Breathing stopped">
			<AdamClose expr="terrified" zoom={4.4} x={470} />
		</Shot>
		<Shot from="behindHim" to="satDown" name="The mattress sinks">
			<M20Sink />
		</Shot>
		<Shot from="staredTv" to="clothes" name="SPECIAL G – reflection (no cut)">
			<ReflectionShot mode="reveal" />
		</Shot>
		<Shot from="recognizedPhoto" name="Newspaper photograph">
			<M22Photo />
		</Shot>
		<Shot from="victorHale" name="Victor Hale">
			<ReflectionShot mode="face" />
		</Shot>
		<Shot from="finger" to="pointed" name="Finger to lips / points">
			<ReflectionShot mode="shush" />
		</Shot>
		<Shot from="didntMove" name="Didn't move">
			<ReflectionShot mode="adamEyes" />
		</Shot>
		<Shot from="whispered" to="notWarning" name="It isn't warning you">
			<ReflectionShot mode="whisper" />
			<WhisperText />
		</Shot>
		<Shot from="staredHim" name="Stared at him">
			<ReflectionShot mode="adamEyes" />
		</Shot>
		<Shot from="trembled" to="tellingIt" name="It's telling it where you are">
			<ReflectionShot mode="tremble" />
			<WhisperText />
		</Shot>
		<Shot from="crackled" to="located" name="SUBJECT LOCATED">
			<M27Located />
		</Shot>
		<Shot from="hitFloor" to="hard" name="Hit the floor">
			<M28HitFloor />
		</Shot>
		<Shot from="vanished" name="Victor vanished">
			<ReflectionShot mode="vanish" />
		</Shot>
		<Shot from="ranWindow" name="Runs for the window">
			<M30Run />
		</Shot>
		<Shot from="bedLifted" to="standingUp" name="SPECIAL H – the bed lifts">
			<M31Lift />
		</Shot>
		<Shot from="lightsExploded" name="Lights explode">
			<M32Explode />
		</Shot>
		<Shot from="smashed" name="Smashes the window">
			<M33Smash />
		</Shot>
		<Shot from="behindTv" to="dontLeave" name="DO NOT LEAVE">
			<M34DoNotLeave />
		</Shot>
		<Shot from="jumped" to="didntStop" name="Escape">
			<M35Escape />
		</Shot>
	</>
);

