// 4. DANIEL DISAPPEARS FROM THE MANIFEST - the identity starts disappearing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Crew2, Daniel, Emma, Purser} from '../components/characters/Cast';
import {CabinRow, EngineRoomDoor, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {DeckPlan, DriverLicense} from '../components/evidence/Documents';
import {PassengerManifest} from '../components/evidence/Manifest';
import {BoardingPass, EmailInbox, PhoneScreen, Reservation} from '../components/evidence/Phone';
import {BigText, CrudeLabel, Evidence, PassengerCounter} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, speak, talkOf} from './common';

const Room: React.FC<{color?: string}> = ({color = '#7f8b9c'}) => <rect x={-200} y={-200} width={2400} height={1600} fill={color} />;

const PhoneShot: React.FC<{f: number; d: number; children: React.ReactNode; service?: boolean}> = ({f, d, children, service = false}) => (
	<AbsoluteFill style={{background: '#1b2433'}}>
		<div style={{position: 'absolute', inset: 0, transform: `scale(${lerpF(f, 0, d, 1.0, 1.06)})`}}>
			<PhoneScreen x={960} y={560} scale={1.05} service={service} time="00:33">
				{children}
			</PhoneScreen>
		</div>
	</AbsoluteFill>
);

export const Erasure: React.FC = () => (
	<Shots
		shots={[
			// Crew checked the rear deck. Nothing.
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.1}} to={{z: 1.15, cx: 900}} rock={0.3}>
						<RearDeck f={f} view="behind" fog={0.2} />
						<Crew1 x={lerpF(f, 0, d, 400, 620)} y={1020} s={0.95} frame={f} prop="flashlight" arms="point" pose="walk" phase={f * 0.3} />
					</Stage>
				),
			},
			{at: 'narrator_077_bathrooms', render: ({f, d}) => <Stage f={f} d={d}><EngineRoomDoor f={f} label="WC" sub="PASSENGERS" open={clamp(f / 10)} beam /></Stage>},
			{at: 'narrator_078_storage', render: ({f, d}) => <Stage f={f} d={d}><EngineRoomDoor f={f} label="STORAGE" sub="CREW ONLY" open={clamp(f / 10)} beam /></Stage>},
			{at: 'narrator_079_searched', render: ({f, d}) => <Evidence f={f} title="SEARCH" lines={['ALL CLEAR']}><DeckPlan f={f} progress={clamp(f / (d * 0.8))} /></Evidence>},
			// The captain ordered another passenger count.
			{
				at: 'narrator_080_another_count',
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.06}} rock={0.5}>
						<PassengerCabin f={f} facing="aft" />
						<Captain x={760} y={1160} s={1.3} frame={f} arms="point" mouth="flat" talk={talkOf(api, sf, 'narrator_080_another_count') * 0.3} look={[1, 0]} />
						<Crew1 x={1240} y={1180} s={1.25} frame={f} arms="clicker" prop="clicker" />
					</Stage>
				),
			},
			{at: 'narrator_081_sixty_two', off: -0.1, render: ({f}) => <AbsoluteFill style={{background: '#06080d'}}><PassengerCounter f={f} value="62" color="#7ff09a" label="PASSENGER COUNT" /></AbsoluteFill>},
			{
				at: 'narrator_082_relaxed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.2, cy: 460}} to={{z: 1.25}} bg="#2a3446">
						<Room color="#2a3446" />
						<Crew2 x={620} y={1060} s={1.45} frame={f} mouth="smile" eyes={f > 10 ? 'closed' : 'dot'} />
						<Captain x={960} y={1060} s={1.45} frame={f} mouth="smile" />
						<Crew1 x={1300} y={1060} s={1.45} frame={f} mouth="smile" arms="hipsHands" />
					</Stage>
				),
			},
			// The purser looked at the manifest - and went completely still.
			{
				at: 'narrator_083_purser',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.6, cy: 430}} to={{z: 1.9, cy: 400}} bg="#101622">
						<Room color="#1a2232" />
						<rect x={560} y={760} width={800} height={400} fill="#2b313c" stroke="#111" strokeWidth={8} />
						<Purser x={960} y={headY(400, 2.1)} s={2.1} frame={f > d * 0.5 ? null : f} look={[0, 1]} brows={f > d * 0.5 ? 'raised' : 'flat'} eyes={f > d * 0.5 ? 'wide' : 'dot'} />
						<rect x={700} y={700} width={520} height={240} fill="#e6eef8" stroke="#111" strokeWidth={8} opacity={0.95} />
					</Stage>
				),
			},
			// There were now... sixty-one names.
			{
				at: 'narrator_084_sixty_one',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="MANIFEST" lines={['61 NAMES']}>
							<PassengerManifest f={f} scroll={30} refreshAt={Math.round(d * 0.62)} visibleRows={11} glitch={f > d * 0.55 && f < d * 0.7} />
						</Evidence>
						<BigText f={f} text="61 NAMES" appear={Math.round(d * 0.7)} y={150} size={96} color="#ff5a4d" />
					</AbsoluteFill>
				),
			},
			// E. MANIFEST DISAPPEARANCE - 36 Sarah Mills / 37 Daniel Clarke / 38 Emma Clarke -> row gone
			{
				at: 'narrator_085_daniel_gone',
				render: ({f, d}) => (
					<Evidence f={f} title="37 — DANIEL CLARKE" lines={['(gone)']}>
						<PassengerManifest f={f} device="tablet" scroll={33} visibleRows={9} highlight="Daniel Clarke" refreshAt={Math.round(d * 0.45)} zoom={1.2} focusY={560} glitch={Math.abs(f - d * 0.45) < 4} />
					</Evidence>
				),
			},
			// Not physically. Daniel was standing right there.
			{
				at: 'narrator_086_not_physically',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<CabinRow f={f}>
							<Emma x={860} y={900} s={1.15} frame={f} pose="sit" brows="worried" look={[1, -0.6]} />
							<Daniel x={1080} y={1010} s={1.25} frame={f} look={[1, 0]} mouth="flat" brows="worried" />
							<Purser x={1480} y={1010} s={1.25} frame={f} look={[-1, 0]} eyes="wide" />
						</CabinRow>
						<CrudeLabel x={1080} y={300} text="STILL HERE" f={f} ax={1080} ay={600} appear={10} />
					</Stage>
				),
			},
			{
				at: 'narrator_087_disappeared',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="PASSENGER LIST" lines={['NO DANIEL CLARKE']}>
							<PassengerManifest f={f} device="tablet" scroll={33} visibleRows={9} erased zoom={1.2} focusY={560} />
						</Evidence>
						<AbsoluteFill>
							<Svg>
								<ellipse cx={760} cy={lerpF(f, 0, 1, 588, 588)} rx={340} ry={56} fill="none" stroke="#e32b2b" strokeWidth={8} opacity={clamp((f - 6) / 6)} strokeDasharray={`${clamp((f - 6) / 12) * 1400} 2000`} />
							</Svg>
						</AbsoluteFill>
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_088_refreshed',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="REFRESHED" lines={['61 PASSENGERS']}>
							<PassengerManifest f={f} scroll={lerpF(f, 0, d, 50, 52, easeInOut)} visibleRows={11} erased refreshAt={Math.round(d * 0.35)} />
						</Evidence>
						<BigText f={f} text="61 PASSENGERS" appear={Math.round(d * 0.6)} y={150} size={88} color="#ff5a4d" />
					</AbsoluteFill>
				),
			},
			// digital ticket -> blank QR
			{
				at: 'narrator_089_ticket',
				render: ({f, d}) => (
					<Evidence f={f} title="DIGITAL TICKET" lines={['QR: BLANK']}>
						<PhoneShot f={f} d={d}>
							<BoardingPass blank={clamp((f - d * 0.6) / (d * 0.25))} nameGone={clamp((f - d * 0.75) / (d * 0.2))} />
						</PhoneShot>
					</Evidence>
				),
			},
			{
				at: 'narrator_090_email',
				render: ({f, d}) => (
					<Evidence f={f} title="BOOKING EMAIL" lines={['GONE']}>
						<PhoneShot f={f} d={d}>
							<EmailInbox gone={clamp((f - d * 0.55) / 8)} />
						</PhoneShot>
					</Evidence>
				),
			},
			{
				at: 'narrator_091_reservation',
				render: ({f, d}) => (
					<Evidence f={f} title="RESERVATION" lines={['ONE PASSENGER']}>
						<PhoneShot f={f} d={d}>
							<Reservation onePassenger={f > d * 0.8 ? 1 : 0} />
						</PhoneShot>
					</Evidence>
				),
			},
			{
				at: 'narrator_092_one_passenger',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="ONE PASSENGER" lines={['EMMA CLARKE']}>
							<PhoneShot f={f} d={d}>
								<Reservation onePassenger={1} />
							</PhoneShot>
						</Evidence>
						<BigText f={f} text="ONE PASSENGER" appear={2} y={150} size={90} color="#ff5a4d" />
					</AbsoluteFill>
				),
			},
			// Daniel stared at the screen. "That's impossible."
			{
				at: 'narrator_093_stared',
				render: ({f, d, sf, api}) => (
					<Closeup
						who="daniel"
						f={f}
						d={d}
						s={3.2}
						push={0.12}
						color="#7f8b9c"
						bg={<Room />}
						props={{eyes: 'wide', brows: 'worried', sweat: true, look: [0, 0.8], ...speak(api, sf, 'daniel_005_impossible'), mouth: 'wobbly', shiver: 1.5}}
					/>
				),
			},
			// The captain asked for identification. Daniel handed over his licence.
			{
				at: 'narrator_094_identification',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.15, cy: 470}} to={{z: 1.2}} rock={0.4}>
						<Room />
						<Captain x={700} y={1080} s={1.45} frame={f} arms={f > d * 0.5 ? 'point' : 'relaxed'} look={[1, 0]} />
						<Daniel x={1240} y={1080} s={1.45} frame={f} look={[-1, 0]} brows="worried" arms={f > d * 0.9 ? 'grabLeft' : 'relaxed'} />
					</Stage>
				),
			},
			{
				at: 'narrator_095_license',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.4, cy: 520}} to={{z: 1.5}} rock={0.4}>
						<Room />
						<Captain x={780} y={1080} s={1.45} frame={f} arms={f > d * 0.5 ? 'holdOne' : 'relaxed'} prop={f > d * 0.5 ? 'card' : 'none'} look={[1, 0.3]} />
						<Daniel x={1180} y={1080} s={1.45} frame={f} look={[-1, 0.3]} brows="worried" flip arms={f < d * 0.5 ? 'grabRight' : 'relaxed'} prop={f < d * 0.5 ? 'card' : 'none'} />
					</Stage>
				),
			},
			// He looked at it. Then at Daniel. Then back at the card.
			{
				at: 'narrator_096_looked',
				render: ({f, d}) => {
					const k = Math.floor((f / d) * 3);
					const look: [number, number] = k === 1 ? [1, 0] : [0, 1];
					return <Closeup who="captain" f={f} d={d} s={3.0} cy={440} color="#7f8b9c" bg={<Room />} props={{look, arms: 'hold', prop: 'card', brows: k === 2 ? 'raised' : 'flat'}} />;
				},
			},
			// F. DRIVER'S LICENSE - photo stays, the name changes to UNKNOWN
			{
				at: 'narrator_097_photo',
				render: ({f, d, sf, api}) => (
					<Evidence f={f} title="DRIVER LICENCE" lines={['NAME: UNKNOWN']}>
						<DriverLicense f={sf} unknownAt={api.at('narrator_099_unknown', -0.05)} scale={lerpF(f, 0, d, 0.9, 1.0)} />
					</Evidence>
				),
			},
			{
				at: 'narrator_099_unknown',
				off: -0.05,
				render: ({f, d}) => (
					<Evidence f={f} title="NAME" lines={['UNKNOWN']}>
						<DriverLicense f={f + 1000} unknownAt={1000} scale={lerpF(f, 0, d, 1.0, 1.12)} />
					</Evidence>
				),
			},
			// Daniel grabbed it. The name was gone.
			{
				at: 'narrator_100_grabbed',
				render: ({f, d}) => (
					<Evidence f={f} title="NAME" lines={['______']}>
						<DriverLicense f={f + 1000} unknownAt={0} eraseFrom={1000 + Math.round(d * 0.45)} eraseDur={Math.round(d * 0.35)} tilt={4} scale={1.1} />
					</Evidence>
				),
			},
			{
				at: 'narrator_101_shouting',
				render: ({f, d, sf, api}) => (
					<Closeup who="emma" f={f} d={d} s={3.2} push={0.1} color="#7f8b9c" bg={<Room />} props={{brows: 'angry', mouth: 'shout', ...speak(api, sf, 'emma_006_not_funny'), look: [-1, 0], arms: 'shrug'}} />
				),
			},
			{
				at: 'narrator_102_nobody_laughing',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1}} rock={0.4}>
						<PassengerCabin f={f} facing="aft" crowdEyes="wide" headsLook={-0.3} />
						<Daniel x={980} y={1200} s={1.3} frame={f} back />
					</Stage>
				),
			},
		]}
	/>
);
