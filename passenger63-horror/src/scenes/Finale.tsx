// 13. FINAL CLIFFHANGER - the daylight photo, DON'T LET HER COUNT YOU, 63... "Sixty-four."
// 14. CUT TO BLACK - complete silence.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Emma} from '../components/characters/Cast';
import {BigNumberScreen, IncomingCall, MessageThread, PhoneScreen, PowerOff} from '../components/evidence/Phone';
import {DAYLIGHT_SPOTS, DaylightPhoto, PhotoLook} from '../components/evidence/Photos';
import {BigText} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Cam, type CamPos, Shots, Stage} from '../utils/scene';
import {headY} from './common';

const D = DAYLIGHT_SPOTS;

const Apartment: React.FC<{dark?: number}> = ({dark = 0}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#a9a29a" />
		<rect x={1240} y={120} width={520} height={560} fill="#cfe3f2" stroke="#111" strokeWidth={14} />
		<line x1={1500} y1={120} x2={1500} y2={680} stroke="#111" strokeWidth={10} />
		<rect x={-200} y={760} width={2400} height={600} fill="#6b4a3a" />
		<rect x={-200} y={-200} width={2400} height={1600} fill="#000" opacity={dark} />
	</g>
);

const Photo: React.FC<{f: number; d: number; from: CamPos; to?: CamPos}> = ({f, d, from, to}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Cam f={f} d={d} from={from} to={to}>
			<PhotoLook f={f} blur={0.6} grain={0.12}>
				<DaylightPhoto f={f} />
			</PhotoLook>
		</Cam>
	</AbsoluteFill>
);

/** Emma's face lit only by the phone. */
const EmmaLit: React.FC<{f: number; d: number; glow?: number; push?: number; eyes?: 'dot' | 'wide'}> = ({f, d, glow = 1, push = 0.05, eyes = 'dot'}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Stage f={f} d={d} from={{z: 1.0, cy: 470}} to={{z: 1 + push, cy: 470}} bg="#000">
			<Apartment dark={0.88} />
			<Emma x={960} y={headY(440, 3.2)} s={3.2} frame={f} eyes={eyes} mouth="flat" look={[0, 1]} brows={eyes === 'wide' ? 'raised' : 'flat'} arms="hold" prop="phone" propGlow="#cfe1ff" />
		</Stage>
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 70%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.45 + (1 - glow) * 0.5}) 30%, rgba(0,0,0,0.97) 62%)`}} />
	</AbsoluteFill>
);

const Phone: React.FC<{f: number; d: number; children?: React.ReactNode; dark?: boolean; screenOn?: number; reflection?: React.ReactNode; zoom?: [number, number]}> = ({f, d, children, dark = false, screenOn = 1, reflection, zoom = [1, 1.05]}) => (
	<AbsoluteFill style={{background: '#050608'}}>
		<div style={{position: 'absolute', inset: 0, transform: `scale(${lerpF(f, 0, d, zoom[0], zoom[1])})`}}>
			<PhoneScreen x={960} y={560} scale={1.05} dark={dark} screenOn={screenOn} time="15:42" reflection={reflection}>
				{children}
			</PhoneScreen>
		</div>
	</AbsoluteFill>
);

export const Finale: React.FC = () => (
	<Shots
		shots={[
			// For almost a year... nothing happened.
			{
				at: 0,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}}>
							<Apartment />
							<Emma x={760} y={1060} s={1.4} frame={f} pose="sit" mouth="flat" look={[1, -0.2]} />
						</Stage>
						<div style={{position: 'absolute', left: 70, bottom: 60, fontFamily: FONT.hand, fontSize: 64, color: '#fff', textShadow: '4px 4px 0 #000'}}>
							{['NOVEMBER', 'JANUARY', 'APRIL', 'JULY', 'SEPTEMBER'][Math.min(4, Math.floor((f / d) * 5))]}
						</div>
					</AbsoluteFill>
				),
			},
			// a photograph from an unknown number
			{
				at: 'narrator_238_afternoon',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1, cx: 900, cy: 480}}>
						<Apartment />
						<Emma x={760} y={1060} s={1.4} frame={f} pose="sit" arms={f > d * 0.6 ? 'hold' : 'relaxed'} prop={f > d * 0.6 ? 'phone' : 'none'} propGlow="#cfe1ff" look={[0.3, 0.8]} />
					</Stage>
				),
			},
			{
				at: 'narrator_239_showed',
				render: ({f, d}) =>
					f < d * 0.45 ? (
						<Phone f={f} d={d}>
							<MessageThread f={f} photo={<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.152)', transformOrigin: '0 0'}}><DaylightPhoto f={0} /></div>} />
						</Phone>
					) : (
						<Photo f={f} d={d} from={{z: 1.0}} to={{z: 1.03}} />
					),
			},
			// Emma almost deleted it.
			{
				at: 'narrator_240_almost_deleted',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Photo f={f} d={d} from={{z: 1.03}} />
						<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90}}>
							<div style={{background: 'rgba(30,30,34,0.92)', borderRadius: 26, padding: '26px 80px', fontFamily: FONT.ui, color: '#ff453a', fontSize: 44, fontWeight: 700, transform: `translateY(${(1 - clamp(f / 8)) * 200}px)`}}>
								Delete Photo
							</div>
						</AbsoluteFill>
					</AbsoluteFill>
				),
			},
			// Then she zoomed in. (slow zoom toward the back)
			{at: 'narrator_241_zoomed', render: ({f, d}) => <Photo f={f} d={d} from={{z: 1.03}} to={{cx: 1400, cy: 560, z: 1.6}} />},
			{at: 'zoom_hold', render: ({f, d}) => <Photo f={f} d={d} from={{cx: 1400, cy: 560, z: 1.6}} to={D.back} />},
			// At the very back... the old woman was sitting on the same bench.
			{at: 'narrator_242_very_back', render: ({f, d}) => <Photo f={f} d={d} from={D.back} to={{cx: 1540, cy: 540, z: 3.2}} />},
			// And beside her... was Daniel.
			{at: 'narrator_243_beside', render: ({f, d}) => <Photo f={f} d={d} from={{cx: 1540, cy: 540, z: 3.2}} to={D.pair} />},
			{at: 'narrator_244_same_clothes', render: ({f, d}) => <Photo f={f} d={d} from={D.pair} to={D.daniel} />},
			// He was staring directly at the camera. One finger against his lips.
			{at: 'narrator_245_staring', render: ({f, d}) => <Photo f={f} d={d} from={D.daniel} to={{...D.daniel, z: D.daniel.z * 1.15}} />},
			// A message arrived.
			{
				at: 'narrator_246_message',
				render: ({f, d, api, from}) => {
					const arrive = api.at('message_hold') - from;
					return (
						<Phone f={f} d={d}>
							<MessageThread f={f} showText={clamp((f - arrive) / 5)} photo={<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.152)', transformOrigin: '0 0'}}><DaylightPhoto f={0} /></div>} />
						</Phone>
					);
				},
			},
			{
				at: 'narrator_247_dont_let',
				off: -0.2,
				render: ({f}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<BigText f={f} text={"DON'T LET HER\nCOUNT YOU."} appear={0} fadeIn={8} y={470} size={130} font={FONT.ui} spacing={6} />
					</AbsoluteFill>
				),
			},
			// Emma's phone rang. Unknown number.
			{at: 'narrator_248_rang', render: ({f, d}) => <Phone f={f} d={d}><IncomingCall f={f} /></Phone>},
			{at: 'narrator_249_didnt_answer', render: ({f, d}) => <EmmaLit f={f} d={d} />},
			{at: 'narrator_250_stopped', render: ({f, d}) => <Phone f={f} d={d}><IncomingCall f={f} missed /></Phone>},
			{at: 'narrator_251_again', render: ({f, d}) => <Phone f={f} d={d}><IncomingCall f={f} /></Phone>},
			// She switched the phone off.
			{
				at: 'narrator_252_switched_off',
				render: ({f, d}) => (
					<Phone f={f} d={d}>
						<IncomingCall f={f} />
						<PowerOff f={f} progress={lerpF(f, d * 0.35, d * 0.85, 0, 1, easeInOut)} />
					</Phone>
				),
			},
			// The screen went black. (Emma's reflection - and something faint behind her)
			{
				at: 'narrator_253_black',
				render: ({f, d}) => (
					<Phone
						f={f}
						d={d}
						dark
						screenOn={0}
						zoom={[1.05, 1.12]}
						reflection={
							<div style={{position: 'absolute', inset: 0, opacity: 0.22}}>
								<div style={{position: 'absolute', left: 120, top: 260, width: 150, height: 150, borderRadius: 75, background: '#cbb7a8'}} />
								<div style={{position: 'absolute', left: 100, top: 230, width: 190, height: 110, borderRadius: '90px 90px 20px 20px', background: '#3a2a22'}} />
								<div style={{position: 'absolute', left: 270, top: 200, width: 44, height: 44, borderRadius: 22, background: '#d6d2cc', opacity: 0.35}} />
							</div>
						}
					/>
				),
			},
			{at: 'narrator_254_several', render: ({f, d}) => <EmmaLit f={f} d={d} glow={0} push={0.04} />},
			// Then the screen turned itself back on.
			{
				at: 'narrator_255_turned_on',
				render: ({f, d}) => (
					<Phone f={f} d={d} dark screenOn={clamp((f - d * 0.5) / 10)}>
						<BigNumberScreen value="" f={f} />
					</Phone>
				),
			},
			// No call. No message. Just one number. -> 63
			{
				at: 'narrator_256_no_call',
				render: ({f, d}) => (
					<Phone f={f} d={d} dark zoom={[1.0, 1.1]}>
						<BigNumberScreen value={f > d * 0.75 ? '63' : ''} f={f} />
					</Phone>
				),
			},
			{at: 'sixty_three', render: ({f, d}) => <Phone f={f} d={d} dark zoom={[1.1, 1.18]}><BigNumberScreen value="63" f={f} /></Phone>},
			// And from somewhere behind Emma... an old woman's voice whispered:
			{at: 'narrator_257_behind', render: ({f, d}) => <EmmaLit f={f} d={d} glow={1} push={0.06} />},
			// 2 seconds of silence
			{at: 'final_silence', render: ({f, d}) => <EmmaLit f={f} d={d} glow={1} push={0.03} eyes={f > d * 0.7 ? 'wide' : 'dot'} />},
			// "Sixty-four."
			{at: 'oldwoman_final_64', render: ({f, d}) => <Phone f={f} d={d} dark zoom={[1.18, 1.2]}><BigNumberScreen value="64" f={f} /></Phone>},
		]}
	/>
);

/** CUT TO BLACK. Nothing. Silence. */
export const End: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;
