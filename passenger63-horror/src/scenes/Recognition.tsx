// 3. DANIEL RECOGNIZES HER - the dead grandmother, the wave, the lights.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crew1, Daniel, Emma, OldWoman} from '../components/characters/Cast';
import {walkPhase, armTween} from '../components/characters/StickPerson';
import {CabinRow, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {PassengerManifest} from '../components/evidence/Manifest';
import {BroochCloseup, GrandmaKidPhoto, GrandmaPortrait, PhotoEvidence} from '../components/evidence/Photos';
import {CrudeLabel, Evidence, Flash, LightsOverlay} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, SeaBg, speak, talkOf} from './common';
import {Anim, PlateBg} from '../components/environments/Plates';

const CabinBg: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#7f8b9c" />
		<rect x={300} y={80} width={1300} height={420} rx={50} fill="#050a14" stroke="#111" strokeWidth={14} />
		<g opacity={0.8}>
			<rect x={300} y={330} width={1300} height={2} fill="#1d2d48" />
		</g>
		<rect x={-200} y={760} width={2400} height={600} fill="#2d4f86" opacity={0.85} />
		{f < -1 ? null : null}
	</g>
);

/** Daniel / Emma close-ups inside the cabin. */
const DanielClose: React.FC<{f: number; d: number; props?: any; push?: number}> = ({f, d, props = {}, push = 0.05}) => (
	<Closeup who="daniel" f={f} d={d} s={3.2} cy={470} push={push} bg={<CabinBg f={f} />} props={{pose: 'stand', ...props}} />
);
const EmmaClose: React.FC<{f: number; d: number; props?: any; push?: number}> = ({f, d, props = {}, push = 0.05}) => (
	<Closeup who="emma" f={f} d={d} s={3.2} cy={470} push={push} bg={<CabinBg f={f} />} props={{pose: 'stand', ...props}} />
);

const WomanWave: React.FC<{f: number; d: number; wave: number}> = ({f, d, wave}) => {
	// one hand lifts, a tiny wave, back down - almost no movement
	const lift = clamp(wave * 3) * clamp((1 - wave) * 4);
	const osc = wave > 0.3 && wave < 0.7 ? Math.sin(f * 0.5) * 8 : 0;
	return (
		<Stage f={f} d={d} from={{z: 2.1, cx: 960, cy: 770}} to={{z: 2.25, cy: 770}}>
			<PlateBg id="deck_front_dark">
				<RearDeck f={0} view="front" doorsLit={false} />
			</PlateBg>
			<Anim>
				<OldWoman x={960} y={912} s={0.75} pose="sit" arms={{l: [10, -80], r: [10 + lift * 30, -80 + lift * 175 + osc]}} />
			</Anim>
		</Stage>
	);
};

/** Cabin wide used for the flicker / blackout. */
const FlickerCabin: React.FC<{f: number; d: number; off: (f: number) => boolean; lights?: 'on' | 'off'}> = ({f, d, off}) => (
	<AbsoluteFill>
		<Stage f={f} d={d} from={{z: 1.05}} to={{z: 1.1}} rock={0.4}>
			<PassengerCabin f={f} facing="aft" headsLook={0.2} />
		</Stage>
		<LightsOverlay state={off(f) ? 'black' : 'on'} f={f} />
	</AbsoluteFill>
);

export const Recognition: React.FC = () => (
	<Shots
		shots={[
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.3, cx: 860, cy: 680}} to={{z: 1.35}} rock={0.3}>
						<RearDeck f={f} view="behind">
							<OldWoman x={0} y={860} s={0.62} pose="sit" back />
						</RearDeck>
						<Crew1 x={600} y={1000} s={0.95} frame={f} look={[1, 0]} brows="worried" />
					</Stage>
				),
			},
			{
				at: 'narrator_048_approached',
				frac: 0.55,
				render: ({f}) => (
					<Evidence f={f} title="PASSENGER 37" lines={['DANIEL CLARKE']}>
						<PassengerManifest f={f} device="tablet" scroll={31} visibleRows={10} highlight="Daniel Clarke" zoom={1.1} focusY={520} />
					</Evidence>
				),
			},
			{at: 'narrator_050_looking', render: ({f, d}) => (
				<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.15, cy: 520}} rock={0.5}>
					<PlateBg id="cabin_fore_labels">
						<PassengerCabin f={0} facing="fore" seatLabels />
					</PlateBg>
					<Anim>
						<Crew1 x={lerpF(f, 0, d, 1240, 1080)} y={lerpF(f, 0, d, 1180, 1120)} s={lerpF(f, 0, d, 1.3, 1.2)} frame={f} back pose="walk" phase={f * 0.28} />
					</Anim>
				</Stage>
			)},
			{
				at: 'narrator_051_found_daniel',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<PlateBg id="cabinrow">
							<CabinRow f={0} />
						</PlateBg>
						<Anim>
							<Emma x={860 + 23 * (1 - clamp((f - d * 0.5) / 12))} y={900} s={1.15} frame={f} pose="sit" eyes={f > d * 0.5 ? 'dot' : 'closed'} lean={15 * (1 - easeInOut(clamp((f - d * 0.5) / 12)))} tilt={40 * (1 - easeInOut(clamp((f - d * 0.5) / 12)))} />
							<Daniel x={1040} y={900} s={1.15} frame={f} pose="sit" look={[0.9, -0.2]} />
							<Crew1 x={lerpF(f, 0, d * 0.8, 1750, 1420)} y={1010} s={1.35} frame={f} pose={f < d * 0.8 ? 'walk' : 'stand'} turn={f < d * 0.8 ? -0.9 : -0.3} phase={walkPhase(lerpF(f, 0, d * 0.8, 1750, 1420), 1.35)} />
						</Anim>
					</Stage>
				),
			},
			{
				at: 'crew_005_sir',
				off: -0.1,
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.15, cx: 1150}} to={{z: 1.2}} rock={0.4}>
						<CabinRow f={f}>
							<Emma x={860} y={900} s={1.15} frame={f} pose="sit" look={[1, -0.3]} />
							<Daniel x={1040} y={900} s={1.15} frame={f} pose="sit" look={[1, -0.6]} brows="raised" />
							<Crew1 x={1420} y={1010} s={1.35} frame={f} {...speak(api, sf, 'crew_005_sir')} look={[-1, 0.4]} tilt={-6} />
						</CabinRow>
					</Stage>
				),
			},
			{
				at: 'narrator_052_laughed',
				render: ({f, d, sf, api}) => <DanielClose f={f} d={d} props={{mouth: 'laugh', look: [0.6, 0], ...speak(api, sf, 'daniel_002_no')}} />,
			},
			// Then he saw her (through the rear doors)
			{
				at: 'narrator_053_saw_her',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 3.2, cx: 1010, cy: 470}} rock={0.3}>
						<PassengerCabin f={f} facing="aft" doorFigure />
					</Stage>
				),
			},
			{
				at: 'narrator_054_face_changed',
				render: ({f, d}) => <DanielClose f={f} d={d} push={0.1} props={f < 8 ? {mouth: 'smile'} : {mouth: 'o', eyes: 'wide', brows: 'raised', look: [0.3, -0.1]}} />,
			},
			{at: 'emma_002_daniel', off: -0.1, render: ({f, d, sf, api}) => <EmmaClose f={f} d={d} props={{brows: 'worried', look: [1, 0], ...speak(api, sf, 'emma_002_daniel')}} />},
			{at: 'narrator_055_didnt_answer', render: ({f, d}) => <DanielClose f={f} d={d} push={0.12} props={{eyes: 'wide', mouth: 'flat', look: [0.4, -0.1]}} />},
			// The woman lifted one hand. And gave him a tiny wave.
			{at: 'narrator_056_wave', render: ({f, d}) => <WomanWave f={f} d={d} wave={clamp((f - 6) / (d - 6))} />},
			// Daniel stood up. Emma grabbed his arm.
			{
				at: 'narrator_057_stood',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}} rock={0.5}>
						<PlateBg id="cabinrow">
							<CabinRow f={0} />
						</PlateBg>
						<Anim>
							<Emma x={860} y={900} s={1.15} frame={f} pose="sit" arms={armTween(f, [[0, 'relaxed'], [d * 0.5, 'grabRight']], 7)} look={[1, -0.8]} brows="worried" />
							{/* Daniel rises: the seated pose rises and fades into the standing pose */}
							{(() => {
								const up = easeInOut(clamp((f - d * 0.22) / 10));
								return (
									<>
										{up < 1 ? <Daniel x={1040 + 10 * up} y={900 - 40 * up} s={1.15} frame={f} pose="sit" eyes="wide" look={[1, 0]} opacity={1 - up} /> : null}
										{up > 0 ? <Daniel x={1060 - 20 * (1 - up)} y={1010 + 30 * (1 - up)} s={1.25} frame={f} eyes="wide" look={[1, 0]} mouth="o" opacity={up} /> : null}
									</>
								);
							})()}
						</Anim>
					</Stage>
				),
			},
			{at: 'emma_003_what_is_it', off: -0.1, render: ({f, d, sf, api}) => <EmmaClose f={f} d={d} props={{brows: 'worried', look: [1, -0.5], ...speak(api, sf, 'emma_003_what_is_it'), arms: 'grabRight'}} />},
			{
				at: 'daniel_003_grandmother',
				off: -0.15,
				render: ({f, d, sf, api}) => <DanielClose f={f} d={d} push={0.1} props={{eyes: 'wide', brows: 'worried', look: [0.6, 0], talk: talkOf(api, sf, 'daniel_003_grandmother') * 0.5, mouth: 'flat'}} />,
			},
			{at: 'emma_004_so', off: -0.1, render: ({f, d, sf, api}) => <EmmaClose f={f} d={d} props={{brows: 'raised', look: [1, -0.3], ...speak(api, sf, 'emma_004_so')}} />},
			{
				at: 'daniel_004_died',
				off: -0.15,
				render: ({f, d, sf, api}) => (
					<DanielClose f={f} d={d} push={0.14} props={{pale: clamp(f / 20) * 0.8, sweat: f > 12, brows: 'worried', mouth: 'wobbly', look: [0.3, 0.2], talk: talkOf(api, sf, 'daniel_004_died') * 0.4}} />
				),
			},
			{at: 'narrator_061_laughed', render: ({f, d}) => <EmmaClose f={f} d={d} props={{mouth: 'laugh', look: [1, 0], eyes: f % 20 < 10 ? 'squint' : 'dot'}} />},
			{at: 'narrator_062_wasnt', render: ({f, d}) => <DanielClose f={f} d={d} push={0.08} props={{pale: 0.8, mouth: 'flat', brows: 'flat', look: [-0.6, 0]}} />},
			// C. DEAD GRANDMOTHER REVEAL - quick flash images
			{
				at: 'daniel_004_died',
				frac: 0.8,
				render: ({f}) => (
					<AbsoluteFill style={{background: '#2a2018'}}>
						<PhotoEvidence f={f} rot={-3} sepia={0.75} stamp="'97" w={1240} h={760}>
							<GrandmaKidPhoto f={f} />
						</PhotoEvidence>
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_064_knew',
				render: ({f, d}) => {
					const k = Math.floor((f / d) * 4);
					return (
						<AbsoluteFill style={{background: '#1e1812'}}>
							{k === 0 ? (
								<PhotoEvidence f={f} rot={2} sepia={0.6} w={900} h={1000}>
									<GrandmaPortrait f={f} tilt={0} />
								</PhotoEvidence>
							) : k === 1 ? (
								<PhotoEvidence f={f} rot={-2} sepia={0.6} w={1200} h={760}>
									<AbsoluteFill style={{background: '#cdbfa6'}}>
										<Svg>
											<rect width={1920} height={1080} fill="#cdbfa6" />
											<rect x={600} y={720} width={720} height={40} fill="#6b4a2b" />
											<OldWoman x={960} y={headY(380, 1.9, true)} s={1.9} pose="sit" mouth="smile" />
										</Svg>
									</AbsoluteFill>
								</PhotoEvidence>
							) : k === 2 ? (
								<PhotoEvidence f={f} rot={3} sepia={0.6} w={900} h={1000}>
									<GrandmaPortrait f={f} tilt={14} />
								</PhotoEvidence>
							) : (
								<Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.02} bg={<SeaBg f={f} />} props={{tilt: 14, mouth: 'faint'}} />
							)}
							<Flash f={f} at={Math.round(d / 4)} dur={2} />
							<Flash f={f} at={Math.round(d / 2)} dur={2} />
							<Flash f={f} at={Math.round((3 * d) / 4)} dur={2} />
						</AbsoluteFill>
					);
				},
			},
			// The only difference... she looked exactly as she had on the day she died.
			{
				at: 'narrator_065_only_difference',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#0d0d0f', flexDirection: 'row'}}>
						<div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
							<div style={{position: 'absolute', left: -480, top: 0, width: 1920, height: 1080, transform: 'scale(0.5)', transformOrigin: '960px 540px'}}>
								<PhotoEvidence f={f} rot={-2} sepia={0.35} w={1000} h={1200}>
									<GrandmaPortrait f={f} ribbon />
								</PhotoEvidence>
							</div>
							<div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center', fontFamily: FONT.hand, fontSize: 54, color: '#cfcfcf'}}>12 YEARS AGO</div>
						</div>
						<div style={{flex: 1, position: 'relative', overflow: 'hidden', opacity: clamp((f - d * 0.45) / 6)}}>
							<div style={{position: 'absolute', left: -480, top: 0, width: 1920, height: 1080}}>
								<Closeup who="woman" f={f} d={d} s={3.6} cy={400} push={0.02} bg={<SeaBg f={f} />} props={{mouth: 'faint'}} />
							</div>
							<div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center', fontFamily: FONT.hand, fontSize: 54, color: '#cfcfcf'}}>TONIGHT</div>
						</div>
					</AbsoluteFill>
				),
			},
			// Same coat. Same hairstyle. Same silver brooch.
			{
				at: 'narrator_066_same',
				render: ({f, d}) => {
					const k = Math.min(2, Math.floor((f / d) * 3));
					if (k === 2) return <BroochCloseup f={f} />;
					return (
						<Closeup
							who="woman"
							f={f}
							d={d}
							s={k === 0 ? 3.0 : 6.0}
							cy={k === 0 ? 120 : 520}
							push={0.04}
							bg={<SeaBg f={f} />}
							props={{mouth: 'faint'}}
						/>
					);
				},
			},
			// Daniel took one step toward her. Emma pulled him back.
			{
				at: 'narrator_067_step',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<CabinRow f={f}>
							<Emma x={lerpF(f, 0, d, 880, 960)} y={1010} s={1.25} frame={f} arms="grabRight" brows="worried" look={[1, 0]} />
							<Daniel x={lerpF(f, 0, d * 0.4, 1120, 1260) - lerpF(f, d * 0.55, d, 0, 90)} y={1010} s={1.25} frame={f} pose={f < d * 0.4 ? 'walk' : 'stand'} turn={f < d * 0.4 ? 0.9 : 0.3} phase={walkPhase(lerpF(f, 0, d * 0.4, 1120, 1260), 1.25)} eyes="wide" look={[1, 0]} />
						</CabinRow>
					</Stage>
				),
			},
			{at: 'emma_005_no', off: -0.1, render: ({f, d, sf, api}) => <EmmaClose f={f} d={d} push={0.08} props={{brows: 'angry', ...speak(api, sf, 'emma_005_no'), look: [1, 0], arms: 'grabRight'}} />},
			{at: 'narrator_068_smiled', render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.6} cy={420} push={0.06} bg={<SeaBg f={f} />} props={{mouth: f < 8 ? 'faint' : 'smile'}} />},
			// D. LIGHTS OUT - flicker, flicker, darkness
			{
				at: 'narrator_069_flickered',
				render: ({f, d, sf, api}) => {
					const once = api.at('narrator_070_once_twice') - api.at('narrator_069_flickered');
					return <FlickerCabin f={f} d={d} off={(x) => (x > d * 0.55 && x < d * 0.55 + 3) || (x > once - 2 && x < once + 3)} />;
				},
			},
			{
				at: 'narrator_070_once_twice',
				render: ({f, d}) => <FlickerCabin f={f} d={d} off={(x) => x < 4 || (x > 22 && x < 28)} />,
			},
			// Darkness. (hard black ~15 frames, then only a few phone glows)
			{
				at: 'narrator_071_darkness',
				off: -0.05,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						{f > 15 ? (
							<Stage f={f} d={d} bg="#000">
								<PassengerCabin f={f} facing="aft" lights="off" phones={0.15} crowdMouth="scream" />
							</Stage>
						) : null}
						{f > 15 ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.82)'}} /> : null}
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_073_three_seconds',
				render: ({f, d}) => {
					const on = f > d * 0.58;
					return (
						<AbsoluteFill style={{background: '#000'}}>
							{on ? (
								<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}}>
									<PassengerCabin f={f} facing="aft" crowdMouth="o" crowdEyes="wide" headsLook={0.4} />
								</Stage>
							) : (
								<AbsoluteFill style={{background: '#000'}} />
							)}
							<Flash f={f} at={Math.round(d * 0.58)} dur={3} color="#fffbe8" />
						</AbsoluteFill>
					);
				},
			},
			// The bench was empty.
			{
				at: 'narrator_074_bench_empty',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 600}} to={{z: 1.15, cy: 660}} rock={0.3}>
						<RearDeck f={f} view="behind" fog={0.25} />
					</Stage>
				),
			},
			{
				at: 'narrator_075_gone',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.4, cx: 960, cy: 760}} to={{z: 2.6}} rock={0.2}>
						<RearDeck f={f} view="behind" fog={0.25} />
					</Stage>
				),
			},
		]}
	/>
);

export const _keep = [CrudeLabel, Daniel, Emma];
