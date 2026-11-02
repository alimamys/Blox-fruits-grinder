// ~7:00 – The radio is sold again. Daniel, room 204. The camera lowers toward
// the dark gap under the bed… breath… CUT TO BLACK.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BreathDust} from '../components/Bed';
import {Daniel as DanielP, Neighbor} from '../components/Characters';
import {DigitalClock} from '../components/DigitalClock';
import {Radio} from '../components/Radio';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {ApartmentRoom, FLOOR_Y} from '../components/sets/ApartmentRoom';
import {DORM_BED, DORM_FLOOR, DORM_RADIO, DormRoom, Market} from '../components/sets/Interiors';
import type {Cam} from '../components/Stage';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import type {StickPersonProps} from '../components/StickPerson';
import {mixPose, POSES, walkPose} from '../components/StickPerson';
import {EASE, hit, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobPoly, wobRect} from '../utils/wobble';
import {Shot, useShot} from '../utils/timeline-context';
import {AutoRadioText, CartoonFinish, radioLevel} from './shared';
import {MarkerNote, VoiceShot} from './rooms';

const RADIO_CENTER: [number, number] = [DORM_RADIO.x + 280 * DORM_RADIO.scale, DORM_RADIO.y + 160 * DORM_RADIO.scale];

/** Daniel's dorm with Daniel in bed. `lying` 1 = asleep, 0 = sitting up. */
const Dorm: React.FC<{
	cam: Cam;
	lying?: number;
	daniel?: Partial<StickPersonProps> | false;
	radio?: Partial<React.ComponentProps<typeof Radio>>;
	staticAmt?: number;
	overlay?: React.ReactNode;
	breath?: number;
	handheld?: number;
	lurk?: number;
}> = ({cam, lying = 0, daniel = {}, radio = {}, staticAmt = 0, overlay, breath = 0, handheld = 0, lurk = 0.85}) => {
	const b = useBoil();
	const sitting = lying < 0.5;
	const mattress = DORM_FLOOR - 80;
	return (
		<Stage cam={cam} handheld={handheld} bg={C.night} overlay={<>{staticAmt > 0 && <StaticOverlay opacity={staticAmt} blend="screen" seed={404} />}{overlay}<CartoonFinish vignette={0.65} /></>}>
			<Layer>
				<DormRoom
					light={0}
					lurk={lurk}
					overDark={
						<>
							<Radio x={DORM_RADIO.x} y={DORM_RADIO.y} scale={DORM_RADIO.scale} power={1} flicker={0.3} {...radio} />
							<BreathDust x={DORM_BED.x + 200} y={DORM_FLOOR - 14} scale={1.2} breath={breath} opacity={0.8} />
						</>
					}
				>
					{daniel !== false &&
						(sitting ? (
							<DanielP x={1080} y={mattress + 150 - 150} pose={POSES.sitUp} facing={-1} {...daniel} />
						) : (
							<DanielP x={1120} y={mattress - 22 + 150} pose={POSES.stand} rotate={90} facing={1} {...daniel} />
						))}
					{/* blanket over the legs */}
					<path
						d={wobPoly(
							sitting
								? [
										[DORM_BED.x + 30, mattress - 6],
										[1060, mattress - 14],
										[1090, mattress + 20],
										[DORM_BED.x + 20, mattress + 26],
									]
								: [
										[DORM_BED.x + 30, mattress - 26],
										[1260, mattress - 40],
										[1290, mattress + 20],
										[DORM_BED.x + 20, mattress + 26],
									],
							8000 + b,
							3,
						)}
						fill="#2f6b4a"
						stroke={C.ink}
						strokeWidth={6}
					/>
				</DormRoom>
			</Layer>
		</Stage>
	);
};

const D01Cleared: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const trash = f >= api.at('thrownAway');
	const b = useBoil();
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.05}], [dur, {x: 1000, y: 580, zoom: 1.25}]], EASE.linear)} overlay={<><MarkerNote text="3 WEEKS LATER" x={80} y={70} size={64} /><CartoonFinish /></>}>
			<Layer>
				<ApartmentRoom light={1} day={0.6} clock={false} radio={{power: 0}} noChair door={{open: 1, beyond: '#6b6a55'}}>
					{[0, 1, 2].map((i) => (
						<path key={i} d={wobRect(300 + i * 130, FLOOR_Y - 110 - (i % 2) * 100, 120, 110, 8100 + i + b, 2)} fill="#b08a54" stroke={C.ink} strokeWidth={5} />
					))}
					{trash &&
						[0, 1].map((i) => <path key={i} d={wobPoly([[1300 + i * 120, FLOOR_Y], [1290 + i * 120, FLOOR_Y - 90], [1340 + i * 120, FLOOR_Y - 130], [1390 + i * 120, FLOOR_Y - 90], [1380 + i * 120, FLOOR_Y]], 8110 + i + b, 3)} fill="#1a1a1e" stroke={C.ink} strokeWidth={5} />)}
					<Neighbor x={1630 - ramp(f, 0, dur, 0, 300)} y={FLOOR_Y} shirt="#7a7f8a" pose={mixPose(walkPose(f * 0.2), POSES.carry, 0.6)} facing={-1} expression="neutral" />
				</ApartmentRoom>
			</Layer>
		</Stage>
	);
};

const D02Sold: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const again = api.at('again');
	return (
		<Stage cam={camKeys(f, [[0, {x: 1150, y: 560, zoom: 1.6}], [again, {x: 1200, y: 600, zoom: 2.4}], [dur, {x: 1200, y: 600, zoom: 2.8}]], EASE.inOut)} overlay={<>{f >= again && <MarkerNote text="AGAIN." x={1150} y={200} size={110} />}<CartoonFinish /></>}>
			<Layer>
				<Market radioOnTable priceTag="$15" />
				<Radio x={1130} y={540} scale={0.2} />
			</Layer>
		</Stage>
	);
};

const MONTHS = ['DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL'];
const D03Months: React.FC = () => {
	const {f, dur} = useShot();
	const i = Math.min(MONTHS.length - 1, Math.floor((f / dur) * MONTHS.length));
	const b = useBoil();
	return (
		<Stage cam={{x: 960, y: 540, zoom: 1.05 + f * 0.002}} bg={C.navyWall} overlay={<CartoonFinish vignette={0.7} />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill={C.navyWall} />
				<path d={wobRect(660, 200, 600, 640, 8200 + b, 3)} fill={C.white} stroke={C.ink} strokeWidth={8} />
				<rect x={666} y={206} width={588} height={120} fill={[C.blue, C.blueDark, C.gray, C.green, C.yellow][i]} />
				<text x={960} y={292} fontFamily={FONT.marker} fontSize={78} fill={C.white} textAnchor="middle">
					{MONTHS[i]}
				</text>
				{Array.from({length: 28}).map((_, k) => (
					<text key={k} x={710 + (k % 7) * 80} y={400 + Math.floor(k / 7) * 100} fontFamily={FONT.paint} fontWeight={700} fontSize={34} fill={C.ink}>
						{k + 1}
					</text>
				))}
				{/* the page tearing off */}
				<g transform={`translate(${((f % Math.ceil(dur / MONTHS.length)) / Math.ceil(dur / MONTHS.length)) * 400} ${((f % Math.ceil(dur / MONTHS.length)) / Math.ceil(dur / MONTHS.length)) * -300}) rotate(${((f % Math.ceil(dur / MONTHS.length)) / Math.ceil(dur / MONTHS.length)) * 40} 960 520)`} opacity={0.8}>
					<path d={wobRect(660, 200, 600, 640, 8201 + b, 3)} fill="#efece2" stroke={C.ink} strokeWidth={6} />
				</g>
			</Layer>
		</Stage>
	);
};

const D04Clock: React.FC = () => {
	const {f, dur} = useShot();
	const z = 1 + (f / dur) * 0.1;
	return (
		<AbsoluteFill style={{background: '#050304'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
					<DigitalClock x={420} y={300} scale={3} time="1:17" glow={1} body="#2a2a33" />
				</g>
			</svg>
			<CartoonFinish vignette={0.8} />
		</AbsoluteFill>
	);
};

const D05Wakes: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Dorm
			cam={camKeys(f, [[0, {x: 900, y: 600, zoom: 1.15}], [dur, {x: 960, y: 620, zoom: 1.35}]], EASE.linear)}
			lying={1}
			daniel={{expression: f < dur * 0.45 ? 'sleep' : 'scared', look: [-1, 0]}}
			radio={{power: 0.8, flicker: 0.6}}
			staticAmt={0.12}
		/>
	);
};

/** Flashback: that afternoon. The back of the radio has initials scratched into it (rewatch detail). */
const D06Bought: React.FC = () => {
	const {f, dur} = useShot();
	const b = useBoil();
	const showBack = f > dur * 0.35 && f < dur * 0.35 + 20;
	return (
		<Stage cam={camKeys(f, [[0, {x: 1100, y: 520, zoom: 1.6}], [dur, {x: 1100, y: 520, zoom: 1.8}]], EASE.linear)} overlay={<><MarkerNote text="THAT AFTERNOON" x={80} y={900} size={60} /><CartoonFinish vignette={0.4} /></>}>
			<Layer>
				<Market />
				<DanielP x={1150} y={820} pose={POSES.carry} expression="smile" look={[-0.5, 0.5]} />
				{!showBack && <Radio x={1050} y={560} scale={0.2} />}
				{showBack && (
					<g>
						<path d={wobRect(1050, 560, 112, 64, 8300 + b, 2)} fill="#202024" stroke={C.ink} strokeWidth={4} />
						{[0, 1, 2, 3].map((i) => (
							<line key={i} x1={1062} y1={572 + i * 8} x2={1100} y2={572 + i * 8} stroke="#3a3a42" strokeWidth={3} />
						))}
						<text x={1110} y={594} fontFamily={FONT.scrawl} fontSize={16} fill="#d8d8d8" opacity={0.9}>
							V.H. 87
						</text>
						<text x={1112} y={614} fontFamily={FONT.scrawl} fontSize={16} fill="#d8d8d8" opacity={0.9}>
							A.R.
						</text>
						<circle cx={1056} cy={566} r={2.5} fill="#888" />
						<circle cx={1156} cy={566} r={2.5} fill="#888" />
					</g>
				)}
			</Layer>
		</Stage>
	);
};

const D07Beep: React.FC<{which: 1 | 2 | 3}> = ({which}) => {
	const {f} = useShot();
	const flash = hit(f, 0, 7);
	if (which === 1) {
		return <Dorm cam={{x: RADIO_CENTER[0], y: RADIO_CENTER[1], zoom: 3.6 + f * 0.03}} lying={1} radio={{power: 0.6 + flash * 0.4, readout: '01.17'}} />;
	}
	if (which === 2) {
		return <Dorm cam={{x: 1300, y: 740, zoom: 3.6 + f * 0.02}} lying={1} daniel={{expression: 'terrified', look: [-1, 0]}} />;
	}
	return <RadioVoiceScreen level={0.3 + flash * 0.7} mode="beep" theme="amber" seed={61} />;
};

const D08SatUp: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const up = f >= api.at('satUp');
	return (
		<Dorm
			cam={camKeys(f, [[0, {x: 760, y: 580, zoom: 1.3}], [dur, {x: 820, y: 590, zoom: 1.45}]], EASE.linear)}
			lying={up ? 0 : 1}
			daniel={{expression: 'scared', look: [1, 0]}}
			radio={{power: 1, speaking: 0.8}}
		/>
	);
};

const D10Froze: React.FC = () => {
	const {f, dur} = useShot();
	return <Dorm cam={camKeys(f, [[0, {x: 1080, y: 520, zoom: 3.4}], [dur, {x: 1080, y: 520, zoom: 3.8}]], EASE.linear)} daniel={{expression: 'terrified', look: [1, 0], tremble: 0.4}} />;
};

const D12LookDoor: React.FC = () => {
	const {f, dur} = useShot();
	const turn = ramp(f, 4, dur * 0.6);
	return (
		<Dorm
			cam={camKeys(f, [[0, {x: 1080, y: 520, zoom: 2.6}], [dur * 0.55, {x: 1100, y: 520, zoom: 2.6}], [dur, {x: 1660, y: 560, zoom: 2}]])}
			daniel={{expression: 'scared', look: [1 - turn * 2, 0], headTurn: -turn * 0.5}}
		/>
	);
};

/** SPECIAL J: radio close-up – DO NOT LOOK UNDERNEATH THE BED. */
const D13DontLook: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	return (
		<>
			<Dorm cam={camKeys(f, [[0, {x: RADIO_CENTER[0], y: RADIO_CENTER[1], zoom: 3}], [dur, {x: RADIO_CENTER[0], y: RADIO_CENTER[1], zoom: 3.8}]], EASE.linear)} radio={{power: 1, speaking: radioLevel(api), readout: '01.17'}} />
			<AutoRadioText top={80} size={92} />
		</>
	);
};

const D14Pale: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Dorm
			cam={camKeys(f, [[0, {x: 1080, y: 520, zoom: 3.6}], [dur, {x: 1080, y: 520, zoom: 4.1}]], EASE.linear)}
			daniel={{expression: 'terrified', look: [0, 0.4], pale: ramp(f, 0, dur * 0.8, 0, 1), tremble: 0.3, blink: false}}
		/>
	);
};

/** The camera lowers VERY slowly toward the dark gap… then the breath. */
const D15Lower: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const breathAt = api.at('breath');
	const breath = f >= breathAt ? Math.sin(Math.min(1, (f - breathAt) / 36) * Math.PI) : 0;
	return (
		<Dorm
			cam={camKeys(f, [[0, {x: 1080, y: 560, zoom: 2.6}], [breathAt, {x: 1000, y: DORM_FLOOR - 20, zoom: 3.4}], [dur, {x: 990, y: DORM_FLOOR - 18, zoom: 3.6}]], EASE.slowIn)}
			daniel={{expression: 'terrified', look: [0, 1], pale: 1, blink: false}}
			breath={breath}
			lurk={1}
		/>
	);
};

export const Daniel: React.FC = () => (
	<>
		<Shot from="cleared" to="thrownAway" name="Apartment cleared">
			<D01Cleared />
		</Shot>
		<Shot from="sold" to="again" name="Sold again">
			<D02Sold />
		</Shot>
		<Shot from="months" name="Months passed">
			<D03Months />
		</Shot>
		<Shot from="oneMorning" name="1:17">
			<D04Clock />
		</Shot>
		<Shot from="daniel" name="Daniel wakes">
			<D05Wakes />
		</Shot>
		<Shot from="bought" name="Bought that afternoon (initials)">
			<D06Bought />
		</Shot>
		<Shot from="beep1" name="BEEP 1">
			<D07Beep which={1} />
		</Shot>
		<Shot from="beep2" name="BEEP 2">
			<D07Beep which={2} />
		</Shot>
		<Shot from="beep3" name="BEEP 3">
			<D07Beep which={3} />
		</Shot>
		<Shot from="numbers" to="satUp" name="Sits up">
			<D08SatUp />
		</Shot>
		<Shot from="voiceSaid" to="danielName" name="DANIEL">
			<VoiceShot seed={62} />
		</Shot>
		<Shot from="froze" name="Froze">
			<D10Froze />
		</Shot>
		<Shot from="continued" to="room" name="ROOM 204">
			<VoiceShot seed={63} />
		</Shot>
		<Shot from="lookedDoor" name="Looks at the door">
			<D12LookDoor />
		</Shot>
		<Shot from="voiceSaid2" to="dontLook" name="SPECIAL J – DO NOT LOOK UNDERNEATH THE BED">
			<D13DontLook />
		</Shot>
		<Shot from="pale" name="Face went pale">
			<D14Pale />
		</Shot>
		<Shot from="because" to="breath" name="Lowering to the gap – BREATH">
			<D15Lower />
		</Shot>
	</>
);
