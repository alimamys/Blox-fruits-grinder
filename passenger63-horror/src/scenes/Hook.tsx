// 0. DISCLAIMER and 1. HOOK - 63 passengers, 62 names, the old woman, Passenger 37.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Crew2, Daniel, Emma, OldWoman, Purser} from '../components/characters/Cast';
import {FerryExterior, OceanNight} from '../components/environments/Outdoor';
import {CabinRow, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {PassengerManifest, PassengerRecord} from '../components/evidence/Manifest';
import {BigText, CrudeLabel, Evidence, Flash, PassengerCounter} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Cam, Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, SeaBg, talkOf} from './common';

export const Disclaimer: React.FC = () => (
	<Shots
		shots={[
			{
				at: 0,
				render: ({f, d}) => {
					const o = clamp(f / 8) * clamp((d - f) / 4);
					return (
						<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', padding: 200}}>
							<div style={{opacity: o, textAlign: 'center', color: '#f2f2f2', fontFamily: FONT.ui}}>
								<div style={{fontWeight: 800, fontSize: 64, letterSpacing: 12, marginBottom: 46}}>DISCLAIMER</div>
								<div style={{fontSize: 40, lineHeight: 1.55, color: '#d6d6d6', maxWidth: 1350}}>
									This story is fictional and created for entertainment purposes.
									<br />
									All characters, events, recordings, documents and CCTV footage shown are fictional or dramatized.
								</div>
							</div>
						</AbsoluteFill>
					);
				},
			},
		]}
	/>
);

/** Woman on the bench, seen from behind, tiny against the black sea. */
const DeckWide: React.FC<{f: number; d: number; push?: number; crewX?: number | null; crewWalk?: boolean; crewTalk?: number; womanTurn?: number}> = ({
	f,
	d,
	push = 0.25,
	crewX = null,
	crewWalk = false,
	crewTalk = 0,
	womanTurn = 0,
}) => (
	<Stage f={f} d={d} from={{z: 1, cy: 560}} to={{z: 1 + push, cy: 640, cx: 960}} rock={0.4}>
		<RearDeck f={f} view="behind" fog={0.18}>
			<OldWoman x={0} y={860} s={0.62} pose="sit" back={womanTurn < 0.5} turn={womanTurn >= 0.5 ? (1 - womanTurn) * 1.2 : 0} />
		</RearDeck>
		{crewX !== null ? <Crew1 x={crewX} y={1000} s={0.95} frame={f} pose={crewWalk ? 'walk' : 'stand'} phase={f * 0.32} back={false} talk={crewTalk} arms="relaxed" /> : null}
	</Stage>
);

export const Hook: React.FC = () => (
	<Shots
		shots={[
			// SMASH CUT: the ferry alone in the black sea, 12:17 AM
			{
				at: 0,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.25, cx: 960, cy: 520}} to={{z: 1.05}}>
							<OceanNight f={f} horizon={520} />
							<FerryExterior f={f} x={980} y={600} s={0.62} tinyWoman />
						</Stage>
						<div style={{position: 'absolute', left: 70, bottom: 60, fontFamily: FONT.mono, fontSize: 46, color: '#e9eef5', opacity: clamp(f / 6)}}>12:17 AM</div>
					</AbsoluteFill>
				),
			},
			// crew counting heads with a clicker
			{
				at: 'narrator_001_hook',
				frac: 0.45,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.05}} to={{z: 1.12, cx: 900}} rock={0.5}>
							<PassengerCabin f={f} facing="aft" />
							<Crew1 x={760} y={1150} s={1.3} frame={f} arms="clicker" prop="clicker" look={[0.5, -0.3]} />
						</Stage>
						<AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-start', padding: 60}}>
							<div style={{fontFamily: FONT.marker, fontSize: 140, color: '#fff', textShadow: '6px 6px 0 #000'}}>{f < d * 0.55 ? '61' : '62'}</div>
						</AbsoluteFill>
					</AbsoluteFill>
				),
			},
			// "Sixty-three."
			{
				at: 'narrator_002_sixty_three',
				off: -0.08,
				render: ({f}) => (
					<AbsoluteFill style={{background: '#06080d'}}>
						<PassengerCounter f={f} prev="62" value="63" switchAt={3} color="#ff3b30" label="PASSENGER COUNT" />
					</AbsoluteFill>
				),
			},
			// The captain looks at the manifest
			{
				at: 'narrator_003_manifest',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.6, cx: 960, cy: 420}} to={{z: 1.75, cy: 440}} bg="#0d1220">
						<rect x={-200} y={-200} width={2400} height={1600} fill="#1a2232" />
						<Captain x={960} y={headY(380, 2.2)} s={2.2} frame={f} arms="hold" prop="tablet" propGlow="#bcd6ff" look={[0, 1]} brows="flat" />
					</Stage>
				),
			},
			// "Sixty-two names."
			{
				at: 'narrator_004_sixty_two_names',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Evidence f={f} title="MANIFEST" lines={['62 NAMES']}>
							<PassengerManifest f={f} scroll={lerpF(f, 0, d, 44, 50.5, easeInOut)} visibleRows={11} countLabel="62" highlight="" />
						</Evidence>
						<BigText f={f} text="62 NAMES" appear={4} y={980} size={96} />
					</AbsoluteFill>
				),
			},
			// He counted again
			{
				at: 'narrator_005_counted_again',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.06}} rock={0.5}>
						<PassengerCabin f={f} facing="fore" headsLook={0} />
						<Captain x={1300 - f * 6} y={1120} s={1.1} frame={f} back arms="point" />
					</Stage>
				),
			},
			// 63 PEOPLE vs 62 NAMES
			{
				at: 'narrator_006_sixty_three_people',
				off: -0.08,
				render: ({f}) => (
					<AbsoluteFill style={{background: '#05070b', flexDirection: 'row'}}>
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '4px solid #222'}}>
							<div style={{fontFamily: FONT.marker, fontSize: 300, color: '#ff3b30', textShadow: '8px 8px 0 #000', transform: `scale(${0.9 + 0.1 * clamp(f / 5)})`}}>63</div>
							<div style={{fontFamily: FONT.hand, fontSize: 70, color: '#ddd'}}>PEOPLE</div>
						</div>
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: clamp((f - 4) / 5)}}>
							<div style={{fontFamily: FONT.marker, fontSize: 300, color: '#f2f2f2', textShadow: '8px 8px 0 #000'}}>62</div>
							<div style={{fontFamily: FONT.hand, fontSize: 70, color: '#ddd'}}>NAMES</div>
						</div>
					</AbsoluteFill>
				),
			},
			// Nobody boarded. Nobody fell overboard. The ferry alone.
			{
				at: 'narrator_007_nobody_boarded',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cx: 760}} to={{z: 1.0, cx: 1160}}>
						<OceanNight f={f} horizon={470} />
						<FerryExterior f={f} x={980} y={560} s={0.35} />
					</Stage>
				),
			},
			// crew look at each other
			{
				at: 'narrator_008_one_conclusion',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.15, cy: 470}} to={{z: 1.2, cy: 480}} bg="#121a28">
						<rect x={-200} y={-200} width={2400} height={1600} fill="#2a3446" />
						<Crew2 x={560} y={1080} s={1.35} frame={f} look={[f < d / 2 ? 1 : 0.6, 0]} brows="worried" mouth="flat" />
						<Captain x={960} y={1080} s={1.35} frame={f} look={[f < d / 2 ? -1 : 1, 0]} brows="flat" mouth="frown" />
						<Crew1 x={1360} y={1080} s={1.35} frame={f} look={[-1, 0]} brows="worried" mouth="flat" />
					</Stage>
				),
			},
			// Someone on the ferry... wasn't supposed to be there. (push down the aisle toward the rear doors)
			{
				at: 'narrator_009_someone',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 2.6, cx: 1000, cy: 470}} rock={0.4}>
						<PassengerCabin f={f} facing="aft" lights="dim" doorFigure doorFigureOpacity={0.55} />
					</Stage>
				),
			},
			// B. OLD WOMAN INTRODUCTION - wide empty rear deck, tiny woman, slow push
			{
				at: 'narrator_010_found_her',
				render: ({f, d}) => <DeckWide f={f} d={d} push={0.3} />,
			},
			{
				at: 'narrator_011_old_woman',
				frac: 0.55,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.4, cx: 960, cy: 760}} to={{z: 2.7, cy: 770}} rock={0.2}>
						<RearDeck f={f} view="behind" fog={0.12}>
							<OldWoman x={0} y={860} s={0.62} pose="sit" back />
						</RearDeck>
					</Stage>
				),
			},
			// A crew member approached her
			{
				at: 'narrator_012_approached',
				render: ({f, d}) => <DeckWide f={f} d={d} push={0.15} crewX={lerpF(f, 0, d, 120, 520)} crewWalk />,
			},
			// "Ma'am, can I see your ticket?"
			{
				at: 'crew_001_ticket',
				off: -0.1,
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.5, cx: 820, cy: 700}} to={{z: 1.6, cx: 840}} rock={0.3}>
						<RearDeck f={f} view="behind" fog={0.1}>
							<OldWoman x={0} y={860} s={0.62} pose="sit" back />
						</RearDeck>
						<Crew1 x={560} y={1000} s={0.95} frame={f} talk={talkOf(api, sf, 'crew_001_ticket')} arms="relaxed" look={[1, 0]} />
					</Stage>
				),
			},
			// She didn't move.
			{
				at: 'narrator_013_didnt_move',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.9, cx: 960, cy: 720}} to={{z: 3.0}}>
						<RearDeck f={f} view="behind" fog={0.1}>
							<OldWoman x={0} y={860} s={0.62} pose="sit" back />
						</RearDeck>
					</Stage>
				),
			},
			// "Ma'am?"
			{
				at: 'crew_002_maam',
				off: -0.1,
				render: ({f, d, sf, api}) => <Closeup who="crew1" f={f} d={d} bg={<SeaBg f={f} />} props={{brows: 'worried', talk: talkOf(api, sf, 'crew_002_maam'), look: [1, 0]}} />,
			},
			// Slowly... the woman turned around.
			{
				at: 'narrator_014_turned',
				render: ({f, d}) => {
					const t = easeInOut(clamp((f - 8) / (d - 14)));
					return (
						<AbsoluteFill style={{background: '#0a0f19'}}>
							<Cam f={f} d={d} from={{z: 1}} to={{z: 1.08}}>
								<Svg>
									<SeaBg f={f} />
									<OldWoman x={960} y={headY(470, 3.4, true)} s={3.4} pose="sit" back={t < 0.45} turn={t < 0.45 ? 0 : (1 - t) * 1.6} />
								</Svg>
							</Cam>
						</AbsoluteFill>
					);
				},
			},
			// Her face was pale. Her eyes looked almost gray.
			{
				at: 'narrator_015_pale',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.12} bg={<SeaBg f={f} />} props={{mouth: 'flat', pose: 'stand'}} />,
			},
			// She smiled. And said:
			{
				at: 'narrator_016_smiled',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.04} bg={<SeaBg f={f} />} props={{mouth: f > 10 ? 'faint' : 'flat'}} />,
			},
			// "I'm not a passenger."
			{
				at: 'oldwoman_001_not_passenger',
				off: -0.1,
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.05} bg={<SeaBg f={f} />} props={{mouth: 'faint'}} />,
			},
			// The crew member swallowed.
			{
				at: 'narrator_017_swallowed',
				render: ({f, d}) => <Closeup who="crew1" f={f} d={d} bg={<SeaBg f={f} />} props={{brows: 'worried', sweat: true, mouth: 'wobbly', look: [1, 0]}} />,
			},
			// "Then why are you on the ferry?" - two-shot
			{
				at: 'crew_003_why',
				off: -0.3,
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.35, cx: 980, cy: 640}} to={{z: 1.4}} rock={0.2}>
						<RearDeck f={f} view="front" doorsLit>
							<OldWoman x={-60} y={912} s={0.75} pose="sit" look={[-0.6, 0]} />
						</RearDeck>
						<Crew1 x={560} y={1050} s={1.0} frame={f} talk={talkOf(api, sf, 'crew_003_why')} brows="worried" look={[1, 0]} />
					</Stage>
				),
			},
			// The woman looked past him... toward the people inside. (POV: the lit cabin through the doors)
			{
				at: 'narrator_018_looked_past',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 440}} to={{z: 1.35, cy: 400}}>
						<RearDeck f={f} view="front" doorsLit />
						<g opacity={0.7}>
							{[0, 1, 2, 3].map((i) => (
								<circle key={i} cx={870 + i * 55} cy={350 + (i % 2) * 18} r={14} fill="#2a2a2a" />
							))}
						</g>
					</Stage>
				),
			},
			// "I'm waiting for... someone."
			{
				at: 'oldwoman_002_waiting',
				off: -0.1,
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.06} bg={<SeaBg f={f} />} props={{mouth: 'faint', look: [-0.5, 0]}} />,
			},
			// "Who?"
			{
				at: 'crew_004_who',
				off: -0.05,
				render: ({f, d, sf, api}) => <Closeup who="crew1" f={f} d={d} bg={<SeaBg f={f} />} props={{brows: 'worried', talk: talkOf(api, sf, 'crew_004_who'), look: [1, 0]}} />,
			},
			// Her smile disappeared.
			{
				at: 'narrator_019_smile_gone',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.05} bg={<SeaBg f={f} />} props={{mouth: f < 12 ? 'faint' : 'flat'}} />,
			},
			// "Passenger thirty-seven."
			{
				at: 'oldwoman_003_passenger37',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill>
						<Closeup who="woman" f={f} d={d} s={5.6} cy={380} push={0.08} bg={<SeaBg f={f} />} props={{mouth: 'flat'}} />
						<BigText f={f} text="PASSENGER 37" appear={10} y={960} size={88} font={FONT.mono} spacing={10} />
					</AbsoluteFill>
				),
			},
			// The crew member checked the manifest.
			{
				at: 'narrator_020_checked',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.6, cy: 520}} to={{z: 1.7}} bg="#0a0f19">
						<SeaBg f={f} />
						<Crew1 x={960} y={headY(420, 2.2)} s={2.2} frame={f} arms="hold" prop="tablet" propGlow="#cfe1ff" look={[0, 1]} brows="worried" />
					</Stage>
				),
			},
			// Passenger 37. Daniel Clarke. Seat 18B.
			{
				at: 'narrator_021_daniel_clarke',
				render: ({f, d}) => (
					<Evidence f={f} title="PASSENGER 37" lines={['DANIEL CLARKE', 'SEAT 18B']}>
						<PassengerManifest f={f} device="tablet" scroll={lerpF(f, 0, 14, 30, 31.5, easeInOut)} visibleRows={10} highlight="Daniel Clarke" zoom={lerpF(f, 0, d, 1, 1.15)} focusY={520} />
					</Evidence>
				),
			},
			// Alive. Thirty-two. Travelling with his wife. -> cut to Daniel and Emma in 18A/18B
			{
				at: 'narrator_022_alive',
				render: ({f}) => (
					<Evidence f={f} title="DANIEL CLARKE" lines={['AGE 32', 'STATUS: ON BOARD']}>
						<PassengerRecord f={f} />
					</Evidence>
				),
			},
			{
				at: 'narrator_022_alive',
				frac: 0.62,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} rock={0.5}>
						<CabinRow f={f}>
							<Emma x={790} y={900} s={1.15} frame={f} pose="sit" eyes="closed" tilt={24} mouth="flat" />
							<Daniel x={960} y={900} s={1.15} frame={f} pose="sit" look={[0.8, -0.2]} mouth="flat" />
						</CabinRow>
					</Stage>
				),
			},
			// The crew member looked back at the old woman. She was still smiling.
			{
				at: 'narrator_023_looked_back',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.05} bg={<SeaBg f={f} />} props={{mouth: 'faint'}} />,
			},
			// Then she said:
			{
				at: 'narrator_024_then_she_said',
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.18} bg={<SeaBg f={f} />} props={{mouth: 'faint'}} />,
			},
			// "He shouldn't have come back." - extreme close-up, very still
			{
				at: 'oldwoman_004_shouldnt',
				off: -0.15,
				render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={7.2} cy={360} push={0.06} bg={<SeaBg f={f} />} props={{mouth: 'faint', look: [-0.3, 0]}} />,
			},
			// TITLE HIT
			{
				at: 'hook_title',
				render: ({f, d}) => {
					const o = clamp(f / 3);
					return (
						<AbsoluteFill style={{background: '#000'}}>
							<Stage f={f} d={d} from={{z: 1.08}} to={{z: 1.0}}>
								<OceanNight f={f} horizon={700} stars={false} mood="dark" />
								<FerryExterior f={f} x={1500} y={760} s={0.22} />
							</Stage>
							<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o * clamp((d - f) / 6)}}>
								<div style={{fontFamily: FONT.marker, fontSize: 150, color: '#f4f4f4', letterSpacing: 6, textShadow: '8px 8px 0 #000', transform: `scale(${1.04 - 0.04 * clamp(f / 40)})`}}>
									THE <span style={{color: '#e2231a'}}>63</span>RD PASSENGER
								</div>
							</AbsoluteFill>
							<Flash f={f} at={0} dur={3} />
						</AbsoluteFill>
					);
				},
			},
		]}
	/>
);

export const _unused = [Emma, Purser, CrudeLabel];
