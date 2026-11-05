// 2. EARLIER THAT NIGHT - departure, Daniel + Emma, the first count discrepancy.
// (The script heading said "four hours earlier", but the story's own clock - 11:28 PM
// departure, 12:17 AM count - makes it ~50 minutes, so the card reads EARLIER THAT NIGHT.)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crew1, Crew2, Daniel, Emma, OldWoman, Passenger} from '../components/characters/Cast';
import {walkPhase, armTween} from '../components/characters/StickPerson';
import {FerryExterior, Harbor, OceanNight} from '../components/environments/Outdoor';
import {CabinRow, FerryWindow, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {RoomBackdrop} from '../components/environments/Rooms';
import {DeparturesBoard, GateCounter, WeatherPanel} from '../components/evidence/Documents';
import {PassengerManifest} from '../components/evidence/Manifest';
import {CCTVOverlay} from '../components/evidence/CCTV';
import {BigText, CrudeLabel, Evidence} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {wordsOf} from '../data/speech';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, SeaBg, speak, talkOf, TimeCard} from './common';

/** Mechanical tally counter close-up. */
const Clicker: React.FC<{f: number; value: number; bump?: number}> = ({f, value, bump = -99}) => {
	const k = f - bump >= 0 && f - bump < 4 ? 1 : 0;
	return (
		<AbsoluteFill style={{background: '#1a2232', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: 760, height: 560, borderRadius: 120, background: 'linear-gradient(#d2d6dc,#9aa1aa)', border: '10px solid #111', position: 'relative', transform: `translateY(${k * 6}px)`}}>
				<div style={{position: 'absolute', left: 90, top: 150, width: 580, height: 240, background: '#111', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
					{String(value)
						.padStart(3, '0')
						.split('')
						.map((d, i) => (
							<div key={i} style={{width: 150, height: 200, background: '#f2f2f2', borderRadius: 8, fontFamily: FONT.mono, fontWeight: 700, fontSize: 170, textAlign: 'center', lineHeight: '200px', color: value === 63 ? '#c62828' : '#111'}}>
								{d}
							</div>
						))}
				</div>
				<div style={{position: 'absolute', right: 70, top: -70, width: 120, height: 100, background: '#8a9098', border: '10px solid #111', borderRadius: 20, transform: `translateY(${k * 20}px)`}} />
			</div>
			<div style={{position: 'absolute', top: 60, fontFamily: FONT.hand, fontSize: 48, color: '#cfd6e0'}}>HEAD COUNT</div>
		</AbsoluteFill>
	);
};

/** Daniel (window seat) and Emma in their row. `sleep` 0..1 lowers Emma's head onto his shoulder. */
const RowShot: React.FC<{
	f: number;
	d: number;
	sleep?: number;
	danielTalk?: {talk: number; viseme: 'a' | 'e' | 'o' | 'm'};
	emmaTalk?: {talk: number; viseme: 'a' | 'e' | 'o' | 'm'};
	labels?: boolean;
	push?: number;
	danielYawn?: boolean;
	seatEmpty?: boolean;
}> = ({f, d, sleep = 1, danielTalk, emmaTalk, labels = false, push = 0.06, danielYawn = false, seatEmpty = false}) => {
	const k = easeInOut(clamp(sleep));
	return (
		<Stage f={f} d={d} from={{z: 1.04, cy: 560}} to={{z: 1.04 + push, cx: 940, cy: 580}} rock={0.5}>
			<CabinRow f={f}>
				{/* easter egg: for two frames seat 18B is empty */}
				{seatEmpty ? null : (
					<Daniel x={1040} y={900} s={1.15} frame={f} pose="sit" look={k > 0.5 ? [-0.6, 0.4] : [0.9, -0.3]} tilt={4 * k} mouth={danielYawn ? 'o' : 'flat'} eyes={danielYawn ? 'squint' : 'dot'} {...danielTalk} />
				)}
				<Emma x={860 + 23 * k} y={900} s={1.15} frame={f} pose="sit" eyes={k > 0.4 ? 'closed' : 'dot'} lean={15 * k} tilt={40 * k} mouth={emmaTalk && emmaTalk.talk > 0 ? 'flat' : 'smile'} {...emmaTalk} />
			</CabinRow>
			{labels ? (
				<>
					<CrudeLabel x={480} y={330} text="EMMA" f={f} ax={800} ay={600} appear={4} />
					<CrudeLabel x={1440} y={330} text="DANIEL" f={f} ax={1090} ay={600} appear={14} />
				</>
			) : null}
		</Stage>
	);
};

export const Departure: React.FC = () => (
	<Shots
		shots={[
			{at: 'departure_card', render: ({f, d}) => <TimeCard f={f} d={d} title="EARLIER THAT NIGHT" sub="11:28 PM · BELL ISLAND" />},
			// The North Star left Bell Island at 11:28 PM.
			{
				at: 'narrator_025_left',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cx: 900}} to={{z: 1.04, cx: 1000}}>
						<OceanNight f={f} horizon={640} />
						<Harbor f={f} variant="island" horizon={640} />
						<FerryExterior f={f} x={lerpF(f, 0, d, 1180, 1420)} y={760} s={0.5} />
					</Stage>
				),
			},
			{at: 'narrator_026_last_ferry', render: ({f}) => <Evidence f={f} title="DEPARTURES" lines={['23:28 PORT MASON', 'NO FURTHER SAILINGS']}><DeparturesBoard f={f} /></Evidence>},
			// 62 passengers, 6 crew (the gate counter flashes 63 for two frames)
			{
				at: 'narrator_027_counts',
				render: ({f, d}) => (
					<Evidence f={f} title="BOARDED" lines={['62 PASSENGERS', '6 CREW']}>
						<GateCounter f={f} passengers={62} ghostAt={Math.round(d * 0.7)} />
					</Evidence>
				),
			},
			{
				at: 'narrator_028_weather',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}}>
							<OceanNight f={f} horizon={560} calm={0.4} moon />
							<FerryExterior f={f} x={960} y={660} s={0.4} rock={0.3} />
						</Stage>
						<div style={{position: 'absolute', right: 80, top: 80}}>
							<WeatherPanel f={f} />
						</div>
					</AbsoluteFill>
				),
			},
			// crossing: fifty minutes
			{
				at: 'narrator_029_crossing',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#0b1626'}}>
						<Svg>
							<path d="M120,620 C300,560 420,640 520,600 L520,1080 L120,1080 Z" fill="#c9b27a" opacity={0.85} />
							<path d="M1500,560 C1650,520 1760,600 1820,560 L1820,1080 L1500,1080 Z" fill="#c9b27a" opacity={0.85} />
							<path d="M480,560 Q960,440 1520,520" stroke="#e8c547" strokeWidth={8} strokeDasharray="30 20" fill="none" strokeDashoffset={-f * 3} />
							<circle cx={480 + 1040 * clamp(f / d)} cy={560 - Math.sin(clamp(f / d) * Math.PI) * 80} r={18} fill="#fff" />
							<text x={300} y={720} fill="#14213a" fontFamily={FONT.hand} fontSize={56}>
								BELL ISLAND
							</text>
							<text x={1500} y={680} fill="#14213a" fontFamily={FONT.hand} fontSize={56}>
								PORT MASON
							</text>
							<text x={960} y={380} fill="#fff" fontFamily={FONT.marker} fontSize={90} textAnchor="middle">
								50 MIN
							</text>
						</Svg>
					</AbsoluteFill>
				),
			},
			// Daniel and his wife Emma (labels)
			{at: 'narrator_030_daniel_emma', render: ({f, d}) => <RowShot f={f} d={d} sleep={0} labels />},
			{at: 'narrator_031_tired', render: ({f, d}) => <RowShot f={f} d={d} sleep={0} danielYawn={f > 8 && f < 30} seatEmpty={f >= d - 4 && f < d - 2} />},
			// Daniel sat by the window. Emma fell asleep against his shoulder.
			{at: 'narrator_032_window', render: ({f, d}) => <RowShot f={f} d={d} sleep={(f - d * 0.5) / 26} push={0.12} labels={f < d * 0.45} />},
			{
				at: 'emma_001_wake_me',
				off: -0.2,
				render: ({f, d, sf, api}) => <RowShot f={f} d={d} sleep={0.85} emmaTalk={speak(api, sf, 'emma_001_wake_me')} danielTalk={speak(api, sf, 'daniel_001_go_sleep')} push={0.04} />,
			},
			// Nothing unusual happened for the first thirty minutes.
			{
				at: 'narrator_033_nothing_unusual',
				render: ({f, d}) => {
					const mins = Math.floor(lerpF(f, 0, d, 28, 58));
					return (
						<AbsoluteFill>
							<Stage f={f} d={d} from={{z: 1.0, cx: 860}} to={{z: 1.0, cx: 1060}}>
								<OceanNight f={f * 3} horizon={520} />
								<FerryExterior f={f} x={960} y={620} s={0.42} />
							</Stage>
							<div style={{position: 'absolute', left: 70, top: 60, fontFamily: FONT.mono, fontSize: 52, color: '#e9eef5'}}>{`23:${String(Math.min(59, mins)).padStart(2, '0')}`}</div>
						</AbsoluteFill>
					);
				},
			},
			// routine passenger count
			{
				at: 'narrator_034_routine_count',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} rock={0.5}>
						<PassengerCabin f={f} facing="aft" />
						<Crew1 x={lerpF(f, 0, d, 620, 860)} y={1180} s={1.25} frame={f} pose="walk" phase={f * 0.3} arms="clicker" prop="clicker" />
					</Stage>
				),
			},
			{at: 'narrator_035_reached_62', render: ({f, d}) => <Clicker f={f} value={f < d * 0.25 ? 61 : 62} bump={Math.round(d * 0.25)} />},
			{
				at: 'narrator_036_few_minutes',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} rock={0.5}>
						<PassengerCabin f={f} facing="fore" />
						<Crew1 x={lerpF(f, 0, d, 1180, 980)} y={1180} s={1.25} frame={f} back pose="walk" phase={f * 0.3} />
					</Stage>
				),
			},
			{at: 'narrator_037_sixty_three', off: -0.1, render: ({f}) => <Clicker f={f} value={f < 3 ? 62 : 63} bump={3} />},
			{
				at: 'narrator_038_frowned',
				render: ({f, d}) =>
					f < d * 0.5 ? (
						<Closeup who="crew1" f={f} d={d} color="#2a3446" bg={<RoomBackdrop f={0} variant="crew" />} props={{brows: 'angry', mouth: 'frown', look: [0, 1]}} />
					) : (
						<Clicker f={f} value={Math.min(63, Math.floor((f - d * 0.5) * 3))} />
					),
			},
			{at: 'narrator_039_sixty_three_b', off: -0.1, render: ({f}) => <Clicker f={f} value={63} bump={0} />},
			// He called another crew member. She counted.
			{
				at: 'narrator_040_called',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<PassengerCabin f={f} facing="aft" />
						<Crew1 x={600} y={1160} s={1.2} frame={f} arms={armTween(f, [[0, 'wave'], [d * 0.4, 'relaxed']], 7)} look={[1, 0]} />
						<Crew2 x={lerpF(f, 0, d * 0.6, 1500, 1200)} y={1160} s={1.2} frame={f} pose={f < d * 0.6 ? 'walk' : 'stand'} turn={f < d * 0.6 ? -0.9 : 0} phase={walkPhase(lerpF(f, 0, d * 0.6, 1500, 1200), 1.2)} arms={armTween(f, [[0, 'relaxed'], [d * 0.6, 'point']], 7)} />
					</Stage>
				),
			},
			{
				at: 'crew2_001_count',
				off: -0.1,
				render: ({f, d, sf, api}) => {
					// the counter follows the spoken numbers
					const t0 = api.at('crew2_001_count');
					const words = wordsOf('crew2_001_count');
					let n = 60;
					words.forEach(([, a], i) => {
						if (sf >= t0 + a * 30) n = 61 + Math.min(2, i);
					});
					return (
						<AbsoluteFill>
							<Stage f={f} d={d} from={{z: 1.05, cy: 520}} to={{z: 1.18, cy: 500}} rock={0.5}>
								<PassengerCabin f={f} facing="aft" />
								<Crew2 x={980} y={1150} s={1.3} frame={f} arms="point" look={[0.4, -0.2]} brows="worried" {...speak(api, sf, 'crew2_001_count')} />
							</Stage>
							<AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-start', padding: 60}}>
								<div style={{fontFamily: FONT.marker, fontSize: 150, color: n >= 63 ? '#ff3b30' : '#fff', textShadow: '6px 6px 0 #000', transform: `scale(${n >= 63 ? 1.12 : 1})`}}>{n}</div>
							</AbsoluteFill>
						</AbsoluteFill>
					);
				},
			},
			// boarding list says 62
			{
				at: 'narrator_041_boarding_list',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="BOARDING LIST" lines={['62']}>
							<PassengerManifest f={f} device="tablet" scroll={lerpF(f, 0, d, 46, 51, easeInOut)} visibleRows={10} countLabel="62" ghost63 />
						</Evidence>
						<BigText f={f} text="62" appear={Math.round(d * 0.55)} y={150} size={130} />
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_042_nobody_understood',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.3, cy: 460}} to={{z: 1.35}} bg="#1a2232">
						<RoomBackdrop f={0} variant="crew" />
						<Crew1 x={760} y={1060} s={1.5} frame={f} look={[1, 0]} brows="worried" mouth="wobbly" arms="shrug" />
						<Crew2 x={1180} y={1060} s={1.5} frame={f} look={[-1, 0]} brows="worried" mouth="flat" />
						<CrudeLabel x={960} y={300} text="???" f={f} appear={6} size={90} />
					</Stage>
				),
			},
			// Then they noticed the woman (heads turn toward the rear doors)
			{
				at: 'narrator_043_noticed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.5, cy: 480}} rock={0.4}>
						<PassengerCabin f={f} facing="aft" doorFigure lights="on" />
						<Crew1 x={720} y={1180} s={1.3} frame={f} back />
						<Crew2 x={1220} y={1180} s={1.3} frame={f} back />
					</Stage>
				),
			},
			{
				at: 'narrator_044_bench',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 600}} to={{z: 1.2, cy: 640}} rock={0.3}>
						<RearDeck f={f} view="behind" fog={0.2}>
							<OldWoman x={0} y={860} s={0.62} pose="sit" back />
						</RearDeck>
					</Stage>
				),
			},
			// Nobody remembered seeing her board - boarding-gate camera, no woman.
			{
				at: 'narrator_045_nobody_remembered',
				render: ({f}) => (
					<CCTVOverlay f={f} camera={'BELL ISLAND TERMINAL\nGATE CAM 1'} timestamp={`23:${String(19 + Math.floor(f / 30)).padStart(2, '0')}:${String((14 + f * 3) % 60).padStart(2, '0')}`} date="—" speed="▶▶ x8">
						<Stage f={f} d={60}>
							<Harbor f={0} variant="island" horizon={700} />
							<rect x={0} y={700} width={1920} height={400} fill="#2a2c31" />
							{Array.from({length: 7}, (_, i) => (
								<Passenger key={i} id={i * 7 + 3} x={((i * 260 + f * 18) % 2200) - 140} y={980} s={0.75} frame={f} pose="walk" turn={0.9} phase={walkPhase(f * 18, 0.75) + i} />
							))}
						</Stage>
					</CCTVOverlay>
				),
			},
			// No luggage. No handbag. No ticket. (around the bench - just folded hands)
			{
				at: 'narrator_046_no_luggage',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.8, cx: 960, cy: 690}} to={{z: 2.0}} rock={0.2}>
						<RearDeck f={f} view="front" doorsLit>
							<OldWoman x={0} y={912} s={0.75} pose="sit" />
						</RearDeck>
					</Stage>
				),
			},
			// Just the black coat. And those folded hands. (the brooch reads 37)
			{
				at: 'narrator_047_just_coat',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={5.2} cy={-60} push={0.1} bg={<SeaBg f={f} />} props={{pose: 'stand'}} />,
			},
		]}
	/>
);

export const _keep = [Passenger];
