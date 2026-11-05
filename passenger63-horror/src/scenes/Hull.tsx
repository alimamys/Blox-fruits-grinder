// 5. SOMETHING UNDER THE FERRY - THUD THUD THUD, the knocking, the PA, the phones.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Daniel, Emma, Passenger} from '../components/characters/Cast';
import {FerryExterior, OceanNight, Underwater} from '../components/environments/Outdoor';
import {CabinRow, CeilingSpeaker, PassengerCabin} from '../components/environments/Interior';
import {MarineRadio, RadarScreen} from '../components/evidence/Navigation';
import {LockAlert, NoServiceScreen, PhoneScreen} from '../components/evidence/Phone';
import {Evidence, PAOverlay} from '../components/fx/Fx';
import {clamp, lerpF, shake} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {h01, wobLine, wobRect} from '../utils/rough';
import {Cam, Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, talkOf, speak} from './common';

const Room: React.FC<{color?: string}> = ({color = '#7f8b9c'}) => <rect x={-200} y={-200} width={2400} height={1600} fill={color} />;

/** Wide exterior with ripples at given (frame, x) hits. */
const HullWide: React.FC<{f: number; d: number; hits: Array<{at: number; x: number}>; z?: number}> = ({f, d, hits, z = 1}) => (
	<Stage f={f} d={d} from={{z, cy: 560}} to={{z: z * 1.04, cy: 570}} shakeAt={hits.map((h) => h.at)} shakeAmp={10}>
		<OceanNight f={f} horizon={460} />
		<FerryExterior f={f} x={960} y={640} s={0.62} ripples={hits} />
	</Stage>
);

const PAPanel: React.FC<{f: number; on: boolean; unplugged?: number; level?: number}> = ({f, on, unplugged = 0, level = 0}) => (
	<AbsoluteFill style={{background: '#20252d'}}>
		<Svg>
			<rect x={360} y={160} width={1200} height={760} rx={30} fill="#3a414c" stroke="#111" strokeWidth={10} />
			<text x={960} y={250} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={54} fill="#e9eef5">
				PA SYSTEM · ALL DECKS
			</text>
			<rect x={520} y={330} width={300} height={420} rx={20} fill="#1d2128" stroke="#111" strokeWidth={8} />
			<rect x={600} y={on ? 380 : 560} width={140} height={150} rx={16} fill={on ? '#e8c547' : '#8a8f96'} stroke="#111" strokeWidth={8} />
			<text x={670} y={800} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={48} fill={on ? '#3cf08a' : '#ff5a4d'}>
				{on ? 'ON' : 'OFF'}
			</text>
			{/* level meter keeps moving even when OFF */}
			{Array.from({length: 12}, (_, i) => (
				<rect key={i} x={980 + i * 40} y={560 - (level * (40 + 300 * Math.abs(Math.sin(f * 0.5 + i))) * h01(i, Math.floor(f / 2)))} width={28} height={level * (40 + 300 * Math.abs(Math.sin(f * 0.5 + i))) * h01(i, Math.floor(f / 2))} fill={i > 8 ? '#ff5a4d' : '#3cf08a'} />
			))}
			<line x1={960} y1={560} x2={1480} y2={560} stroke="#111" strokeWidth={4} />
			<text x={1220} y={640} textAnchor="middle" fontFamily={FONT.mono} fontSize={30} fill="#9aa8bb">
				OUTPUT LEVEL
			</text>
			{/* power cable */}
			<path d={`M1460,860 Q1600,${900 + unplugged * 60} 1760,${1000 + unplugged * 120}`} stroke="#111" strokeWidth={26} fill="none" />
			<rect x={1400 + unplugged * 180} y={830 + unplugged * 90} width={90} height={60} rx={10} fill="#222" stroke="#000" strokeWidth={6} transform={`rotate(${unplugged * 30} ${1445 + unplugged * 180} ${860 + unplugged * 90})`} />
			{unplugged > 0 && unplugged < 0.6
				? Array.from({length: 8}, (_, i) => <path key={i} d={wobLine(1460, 860, 1460 + Math.cos(i) * 80, 860 + Math.sin(i * 1.3) * 80, f + i, 6, 2)} stroke="#ffe36b" strokeWidth={5} />)
				: null}
		</Svg>
	</AbsoluteFill>
);

const PhoneGrid: React.FC<{f: number; d: number}> = ({f, d}) => (
	<AbsoluteFill style={{background: '#05070b'}}>
		{Array.from({length: 6}, (_, i) => {
			const col = i % 3;
			const row = Math.floor(i / 3);
			return (
				<div key={i} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
					<PhoneScreen x={360 + col * 600} y={300 + row * 520} scale={0.52} rot={h01(i, 3) * 10 - 5} service={false} hand={false} time="00:44">
						<LockAlert f={f} appear={i * 2} title="PASSENGER 37" lines={['RETURN TO DECK', 'LOST AT SEA']} sender="NO NETWORK" />
					</PhoneScreen>
				</div>
			);
		})}
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: clamp((f - 14) / 6)}}>
			<div style={{background: 'rgba(0,0,0,0.78)', padding: '30px 70px', border: '4px solid #fff', fontFamily: FONT.ui, fontWeight: 800, fontSize: 84, color: '#fff', textAlign: 'center', letterSpacing: 4, lineHeight: 1.2}}>
				PASSENGER 37
				<br />
				RETURN TO DECK
			</div>
		</AbsoluteFill>
		<div style={{display: 'none'}}>{d}</div>
	</AbsoluteFill>
);

export const Hull: React.FC = () => (
	<Shots
		shots={[
			// G. HULL KNOCKING - THUD 1 (centre)
			{
				at: 0,
				render: ({f, d, api, from}) => <HullWide f={f} d={d} hits={[{at: api.at('thud_1') - from, x: 0}]} />,
			},
			{
				at: 'narrator_104_stopped',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.02}}>
						<PassengerCabin f={f} facing="aft" crowdEyes="wide" headsLook={0} crowdMouth="o" />
					</Stage>
				),
			},
			// THUD 2 (left)
			{at: 'narrator_105_another', render: ({f, d, api, from}) => <HullWide f={f} d={d} z={1.15} hits={[{at: api.at('thud_2') - from, x: -380}]} />},
			// THUD 3 (right)
			{at: 'narrator_106_then_another', render: ({f, d, api, from}) => <HullWide f={f} d={d} z={1.3} hits={[{at: api.at('thud_3') - from, x: 360}]} />},
			// From beneath them. (Nothing is visible. Nothing.)
			{at: 'narrator_107_beneath', render: ({f, d}) => <Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}}><Underwater f={f} /></Stage>},
			{
				at: 'narrator_108_captain_crew',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.3, cy: 470}} to={{z: 1.35}} bg="#2a3446">
						<Room color="#2a3446" />
						<Captain x={760} y={1080} s={1.5} frame={f} look={[f > 10 ? 1 : 0, 0]} brows="worried" />
						<Crew1 x={1220} y={1080} s={1.5} frame={f} look={[-1, 0]} brows="worried" mouth="wobbly" />
					</Stage>
				),
			},
			{
				at: 'narrator_109_radar',
				render: ({f, d}) => (
					<Evidence f={f} title="RADAR" lines={['NO TARGETS', 'DEPTH 212 M']}>
						<AbsoluteFill style={{background: '#0a0d10', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 60}}>
							<RadarScreen f={f} state="empty" size={700} />
							<div style={{fontFamily: FONT.mono, color: '#3cf08a', fontSize: 50, lineHeight: 1.6, background: '#050a07', border: '8px solid #1d2321', padding: '30px 40px', borderRadius: 16}}>
								<div style={{color: '#7fae8f', fontSize: 30}}>ECHO SOUNDER</div>
								<div>DEPTH 212 m</div>
								<div style={{color: '#ffb02e'}}>NO DEBRIS</div>
								<div style={{color: '#ffb02e'}}>NO SHOAL</div>
							</div>
							<div style={{display: 'none'}}>{d}</div>
						</AbsoluteFill>
					</Evidence>
				),
			},
			// Then the knocking started.
			{
				at: 'narrator_110_knocking',
				render: ({f, d, api, from}) => {
					const k0 = api.at('knocks_start') - from;
					const hits = Array.from({length: 8}, (_, i) => ({at: k0 + i * 6 + Math.round(h01(i, 4) * 4), x: -480 + h01(i, 7) * 960}));
					return <HullWide f={f} d={d} hits={hits} z={1.05} />;
				},
			},
			// Not one knock. Many. All along the hull.
			{
				at: 'narrator_111_not_one',
				render: ({f, d}) => {
					const pulses = Array.from({length: 26}, (_, i) => Math.round(i * (d / 26) + h01(i, 2) * 5));
					return (
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.15}} shakeAt={pulses.filter((_, i) => i % 3 === 0)} shakeAmp={5}>
							<Underwater f={f} pulse={pulses} />
						</Stage>
					);
				},
			},
			// Passengers moved away from the windows.
			{
				at: 'narrator_112_moved_away',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.06}} shakeAt={[4, 20, 34, 52]} shakeAmp={4}>
						<PassengerCabin f={f} facing="aft" shiftAway={clamp(f / (d * 0.6))} crowdEyes="wide" crowdMouth="o" />
					</Stage>
				),
			},
			// Somebody screamed.
			{
				at: 'narrator_113_screamed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.12}} bg="#7f8b9c">
						<Room />
						<Passenger id={6} x={960} y={headY(470, 3.2)} s={3.2} frame={f} mouth="scream" eyes="wide" brows="worried" shiver={2} />
					</Stage>
				),
			},
			// PA switches on
			{
				at: 'pa_static_1',
				off: -0.25,
				render: ({f, d, api, from}) => {
					const on = api.at('pa_static_1') - from;
					return (
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1}}>
							<CeilingSpeaker f={f} active={f >= on ? 1 : 0} level={f >= on ? 0.6 : 0} />
						</Stage>
					);
				},
			},
			{
				at: 'pa_001_passenger37',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.1}} to={{z: 1.2}}>
							<CeilingSpeaker f={f} active={1} level={0.8} />
						</Stage>
						<PAOverlay f={f} text="PASSENGER 37" />
					</AbsoluteFill>
				),
			},
			{at: 'pa_001_passenger37', frac: 0.62, render: ({f, d}) => <Closeup who="daniel" f={f} d={d} s={3.2} color="#7f8b9c" bg={<Room />} push={0.1} props={{pale: clamp(f / 15), eyes: 'wide', brows: 'worried', look: [0, -0.8]}} />},
			{
				at: 'pa_002_proceed',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}}>
							<PassengerCabin f={f} facing="aft" headsLook={0.8} crowdEyes="wide" />
						</Stage>
						<PAOverlay f={f} text="PLEASE PROCEED TO THE REAR DECK" />
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_117_grabbed',
				render: ({f, d, sf, api}) => (
					<Closeup who="emma" f={f} d={d} s={3.2} color="#7f8b9c" bg={<Room />} push={0.08} props={{arms: 'grabRight', brows: 'worried', look: [1, 0], ...speak(api, sf, 'emma_007_no'), mouth: 'frown'}} />
				),
			},
			{
				at: 'pa_static_2',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.2}} to={{z: 1.35}}>
							<CeilingSpeaker f={f} active={0.6} level={0.5} />
						</Stage>
						{f > 8 ? <PAOverlay f={f} appear={10} text="PASSENGER 37…" intimacy={0.3} /> : null}
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_118_voice_changed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.35}} to={{z: 2.2}}>
						<CeilingSpeaker f={f} active={0.8} level={0.2} />
					</Stage>
				),
			},
			{
				at: 'pa_004_daniel',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Closeup who="daniel" f={f} d={d} s={3.6} cy={440} color="#7f8b9c" bg={<Room />} push={0.08} props={{pale: 0.6, eyes: 'wide', brows: 'worried', mouth: 'o', look: [0, -1]}} />
						<PAOverlay f={f} text="DANIEL." intimacy={0.7} />
					</AbsoluteFill>
				),
			},
			{at: 'pa_005_family', frac: 0.55, render: ({f, d}) => <Closeup who="daniel" f={f} d={d} s={3.6} cy={440} color="#7f8b9c" bg={<Room />} push={0.04} props={{pale: 0.7, eyes: 'wide', brows: 'worried', mouth: 'wobbly', shiver: 3, sweat: true}} />},
			{
				at: 'pa_005_family',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Closeup who="daniel" f={f} d={d} s={5.0} cy={420} color="#7f8b9c" bg={<Room />} push={0.12} props={{pale: 0.7, eyes: 'wide', brows: 'sad', mouth: 'wobbly', shiver: 1.5}} />
						<PAOverlay f={f} text="Your family is waiting." intimacy={1} />
					</AbsoluteFill>
				),
			},
			// The captain turned the PA off. The voice continued.
			{
				at: 'narrator_120_turned_off',
				render: ({f, d, sf, api}) => <PAPanel f={f} on={f < d * 0.38} level={talkOf(api, sf, 'pa_006_daniel_2') > 0 ? 0.8 : 0.1} />,
			},
			{at: 'pa_006_daniel_2', off: -0.1, render: ({f}) => <AbsoluteFill><PAPanel f={f} on={false} level={0.9} /><PAOverlay f={f} text="Daniel…" intimacy={1} /></AbsoluteFill>},
			// He pulled the power cable. Still:
			{at: 'narrator_121_cable', render: ({f, d}) => <PAPanel f={f} on={false} unplugged={clamp((f - d * 0.45) / 8)} level={0} />},
			{at: 'pa_007_daniel_3', off: -0.1, render: ({f}) => <AbsoluteFill><PAPanel f={f} on={false} unplugged={1} level={0.9} /><PAOverlay f={f} text="Daniel…" intimacy={1} /></AbsoluteFill>},
			// every speaker. every radio. every passenger's phone.
			{
				at: 'narrator_122_every_speaker',
				render: ({f, d}) => {
					const k = Math.min(2, Math.floor((f / d) * 3));
					if (k === 0) return <Stage f={f} d={d}><CeilingSpeaker f={f} active={1} level={0.7} /></Stage>;
					if (k === 1)
						return (
							<AbsoluteFill style={{background: '#14181e', alignItems: 'center', justifyContent: 'center'}}>
								<MarineRadio f={f} mode="rx" level={0.8} scale={1.2} />
							</AbsoluteFill>
						);
					return (
						<AbsoluteFill style={{background: '#1b2433'}}>
							<PhoneScreen x={960} y={560} service={false} time="00:44" dark>
								<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT.ui, fontSize: 30}}>🔊 Audio playing</AbsoluteFill>
							</PhoneScreen>
						</AbsoluteFill>
					);
				},
			},
			{
				at: 'pa_008_daniel_4',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 540, overflow: 'hidden'}}>
							<div style={{transform: 'scale(0.5)', transformOrigin: '0 0', width: 1920, height: 1080}}>
								<Stage f={f} d={d}>
									<CeilingSpeaker f={f} active={1} level={0.8} />
								</Stage>
							</div>
						</div>
						<div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 540, overflow: 'hidden', background: '#14181e'}}>
							<div style={{transform: 'scale(0.62)', transformOrigin: '0 0', position: 'absolute', left: 70, top: 70}}>
								<MarineRadio f={f} mode="rx" level={0.9} />
							</div>
						</div>
						<div style={{position: 'absolute', left: 0, top: 540, width: 1920, height: 540, overflow: 'hidden', background: '#1b2433'}}>
							{[0, 1, 2, 3].map((i) => (
								<div key={i} style={{position: 'absolute', left: 0, top: -270, width: 1920, height: 1080}}>
									<PhoneScreen x={300 + i * 440} y={560} scale={0.5} service={false} hand={false} time="00:44" dark>
										<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', color: '#9fd0ff', fontFamily: FONT.ui, fontSize: 40}}>▮▮▮▮▮</AbsoluteFill>
									</PhoneScreen>
								</div>
							))}
						</div>
						<PAOverlay f={f} text="Daniel…" intimacy={1} />
					</AbsoluteFill>
				),
			},
			// H. PHONE MESSAGE - phones light up one by one
			{
				at: 'narrator_123_phones',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} bg="#000">
							<PassengerCabin f={f} facing="aft" lights="off" phones={clamp(f / (d * 0.9))} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_124_no_signal',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#0b0f18'}}>
						<PhoneScreen x={960} y={560} service={false} time="00:44" dark>
							{f < d * 0.6 ? <NoServiceScreen /> : <LockAlert f={f} appear={Math.round(d * 0.6)} title="PASSENGER 37" lines={['RETURN TO DECK', 'LOST AT SEA']} sender="NO NETWORK" />}
						</PhoneScreen>
					</AbsoluteFill>
				),
			},
			{at: 'phone_message', render: ({f, d}) => <PhoneGrid f={f} d={d} />},
			// Daniel backed away. Emma held him.
			{
				at: 'narrator_125_backed_away',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<CabinRow f={f}>
							<Daniel x={lerpF(f, 0, d * 0.5, 1180, 1000)} y={1010} s={1.25} frame={f} eyes="wide" brows="worried" mouth="wobbly" shiver={2} pale={0.6} />
							<Emma x={lerpF(f, 0, d * 0.5, 760, 850)} y={1010} s={1.25} frame={f} arms={f > d * 0.4 ? 'hug' : 'relaxed'} brows="worried" look={[1, 0]} />
						</CabinRow>
					</Stage>
				),
			},
		]}
	/>
);

export const _keep = [Cam, shake, wobRect];
