// 10. DANIEL DISAPPEARS - blackout, something climbs the hull, red emergency
//     light... and the space beside Emma is empty. No disappearance effect.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Daniel, Emma} from '../components/characters/Cast';
import {FerryExterior, Harbor, OceanNight} from '../components/environments/Outdoor';
import {FerryCorridor, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {NavScreen, RadarScreen} from '../components/evidence/Navigation';
import {EmergencyLights, Evidence, Flash} from '../components/fx/Fx';
import {clamp, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {h01, wobLine} from '../utils/rough';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, speak, talkOf} from './common';

const RedRoom: React.FC = () => <rect x={-200} y={-200} width={2400} height={1600} fill="#3c1010" />;

/** Dark hull plating seen up close; scratch marks appear, climbing from the waterline. */
const HullScratches: React.FC<{f: number; groups: number[]; dur?: number}> = ({f, groups, dur = 24}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#0b0e14" />
		{Array.from({length: 7}, (_, i) => (
			<line key={`seam${i}`} x1={-100} y1={120 + i * 150} x2={2020} y2={120 + i * 150 + 6} stroke="#151a22" strokeWidth={6} />
		))}
		{Array.from({length: 60}, (_, i) => (
			<circle key={`rv${i}`} cx={(i % 12) * 170 + 40} cy={120 + Math.floor(i / 12) * 150} r={6} fill="#1b212b" />
		))}
		{/* waterline */}
		<rect x={-200} y={930} width={2400} height={300} fill="#03050a" />
		<path d={wobLine(-200, 930, 2120, 930, Math.floor(f / 4), 3, 12)} stroke="#1d2d48" strokeWidth={4} />
		{groups.map((g0, gi) => {
			const p = clamp((f - g0) / dur);
			if (p <= 0) return null;
			const baseX = 360 + gi * 520 + h01(gi, 3) * 120;
			return (
				<g key={gi}>
					{[0, 1, 2, 3].map((k) => {
						const x = baseX + k * 34;
						const y0 = 930;
						const y1 = 930 - p * (420 + h01(gi, k) * 160);
						return <path key={k} d={wobLine(x, y0, x + (h01(gi, k, 2) - 0.5) * 40, y1, gi * 10 + k, 4, 6)} stroke="#c9d2de" strokeWidth={4} opacity={0.75} strokeLinecap="round" />;
					})}
				</g>
			);
		})}
	</g>
);

export const Vanish: React.FC = () => (
	<Shots
		shots={[
			// The ferry lights died. (every window goes dark at once)
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}}>
						<OceanNight f={f} horizon={470} calm={0.6} />
						<FerryExterior f={f} x={960} y={600} s={0.6} lights={f < d * 0.7 ? 'on' : 'off'} />
					</Stage>
				),
			},
			// hard black ~15 frames
			{at: 'blackout_2', render: () => <AbsoluteFill style={{background: '#000'}} />},
			// Total darkness. (screams) - only a couple of phone glows
			{
				at: 'narrator_185_darkness',
				off: 0.4,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<Stage f={f} d={d} bg="#000">
							<PassengerCabin f={f} facing="aft" lights="off" phones={0.08} crowdMouth="scream" crowdEyes="wide" />
						</Stage>
						<AbsoluteFill style={{background: 'rgba(0,0,0,0.8)'}} />
					</AbsoluteFill>
				),
			},
			// Emma held Daniel's arm with both hands. (lit only by a phone)
			{
				at: 'narrator_187_held',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<Stage f={f} d={d} from={{z: 1.3, cy: 520}} to={{z: 1.35}} bg="#000">
							<rect x={-200} y={-200} width={2400} height={1600} fill="#05060a" />
							<Emma x={820} y={1080} s={1.45} frame={f} arms="grabRight" eyes="wide" brows="worried" mouth="o" />
							<Daniel x={1120} y={1080} s={1.45} frame={f} eyes="wide" brows="worried" mouth="wobbly" />
						</Stage>
						<AbsoluteFill style={{background: 'radial-gradient(ellipse at 52% 62%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.96) 55%)'}} />
					</AbsoluteFill>
				),
			},
			// Something struck the side of the ferry. Hard.
			{
				at: 'narrator_188_struck',
				render: ({f, d, api, from}) => {
					const hit = api.at('narrator_188_struck', 1.25) - from;
					return (
						<Stage f={f} d={d} shakeAt={[hit]} shakeAmp={24}>
							<OceanNight f={f} horizon={470} mood="dark" />
							<FerryExterior f={f} x={960} y={600} s={0.6} lights="off" ripples={[{at: hit, x: -200}]} reflections={false} />
						</Stage>
					);
				},
			},
			{
				at: 'narrator_189_another_impact',
				render: ({f, d, api, from}) => {
					const hit = api.at('narrator_189_another_impact', 0.9) - from;
					return (
						<Stage f={f} d={d} from={{z: 1.2}} shakeAt={[hit]} shakeAmp={24}>
							<OceanNight f={f} horizon={470} mood="dark" />
							<FerryExterior f={f} x={960} y={600} s={0.6} lights="off" ripples={[{at: hit, x: 250}]} reflections={false} />
						</Stage>
					);
				},
			},
			// Then something began climbing. SCRATCH. SCRATCH. SCRATCH.
			{
				at: 'narrator_190_climbing',
				render: ({f, d, api, from}) => {
					const s0 = api.at('scratches') - from;
					return (
						<Stage f={f} d={d} from={{z: 1.0, cy: 600}} to={{z: 1.15, cy: 520}}>
							<HullScratches f={f} groups={[s0 + 1, s0 + 28, s0 + 55]} />
						</Stage>
					);
				},
			},
			{
				at: 'narrator_191_against',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.4, cx: 700, cy: 560}} to={{z: 1.4, cx: 1250, cy: 560}}>
						<HullScratches f={f + 200} groups={[0, 10, 20, 150, 170]} />
					</Stage>
				),
			},
			// People ran.
			{
				at: 'narrator_192_ran',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<Stage f={f} d={d} shakeAt={[3, 14, 26]} shakeAmp={8} bg="#000">
							<PassengerCabin f={f} facing="aft" lights="off" shiftAway={Math.sin(f / 3)} crowdMouth="scream" phones={0.1} />
						</Stage>
						<AbsoluteFill style={{background: 'rgba(0,0,0,0.75)'}} />
					</AbsoluteFill>
				),
			},
			// K. EMERGENCY LIGHTING - red. (Daniel is simply not there.)
			{
				at: 'narrator_193_emergency',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.03}}>
							<PassengerCabin f={f} facing="aft" lights="red" crowdEyes="wide" crowdMouth="o" />
						</Stage>
						<EmergencyLights f={f} intensity={0.6} />
						<Flash f={f} at={0} dur={2} color="#ff2a1a" />
					</AbsoluteFill>
				),
			},
			// Daniel was gone.
			{
				at: 'narrator_194_gone',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.3, cy: 680}} to={{z: 1.32, cy: 680}}>
							<RedRoom />
							<Emma x={820} y={1080} s={1.45} frame={f} arms="grabRight" eyes="wide" brows="worried" mouth="o" />
						</Stage>
						<EmergencyLights f={f} intensity={0.5} />
					</AbsoluteFill>
				),
			},
			// Emma looked down. Her hands were empty.
			{
				at: 'narrator_195_looked_down',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1}}>
							<RedRoom />
							{[-1, 1].map((side) => (
								<g key={side} transform={`translate(${960 + side * 190},${560}) rotate(${side * -12})`}>
									<path d="M-90,320 L-60,40 Q0,-20 60,40 L90,320 Z" fill="#7c1f33" stroke="#111" strokeWidth={10} />
									<ellipse cx={0} cy={-10} rx={110} ry={130} fill="#f3d3bd" stroke="#111" strokeWidth={10} />
									{[-60, -20, 20, 60].map((fx, i) => (
										<rect key={i} x={fx - 18} y={-200} width={36} height={110} rx={18} fill="#f3d3bd" stroke="#111" strokeWidth={8} />
									))}
								</g>
							))}
						</Stage>
						<EmergencyLights f={f} intensity={0.5} />
					</AbsoluteFill>
				),
			},
			{
				at: 'emma_012_scream',
				off: -0.1,
				render: ({f, d, sf, api}) => (
					<AbsoluteFill>
						<Closeup who="emma" f={f} d={d} s={3.6} cy={440} color="#3c1010" bg={<RedRoom />} push={0.12} props={{mouth: 'scream', eyes: 'wide', brows: 'worried', ...speak(api, sf, 'emma_012_scream'), shiver: 2}} />
						<EmergencyLights f={f} intensity={0.45} />
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_196_screamed_name',
				render: ({f, d, sf, api}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1, cy: 500}}>
							<FerryCorridor f={f} lights="red" />
							<Emma x={960} y={1200} s={1.6} frame={f} back={f > d * 0.3} mouth="shout" {...speak(api, sf, 'emma_013_daniel_2')} arms="shrug" />
						</Stage>
						<EmergencyLights f={f} intensity={0.4} />
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_197_no_answer',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.3, cy: 500}}>
							<FerryCorridor f={f} lights="red" />
						</Stage>
						<EmergencyLights f={f} intensity={0.4} />
					</AbsoluteFill>
				),
			},
			// She ran to the railing.
			{
				at: 'narrator_198_railing',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0, cy: 600}} to={{z: 1.1}}>
							<RearDeck f={f} view="behind" lights="red" fog={0.05} />
							<Emma x={lerpF(f, 0, d, 700, 1000)} y={lerpF(f, 0, d, 1060, 740)} s={lerpF(f, 0, d, 1.1, 0.7)} frame={f} back pose="run" phase={f * 0.45} />
						</Stage>
					</AbsoluteFill>
				),
			},
			{
				at: 'narrator_199_gone_too',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.2, cy: 600}} to={{z: 1.25}}>
						<RearDeck f={f} view="behind" lights="red" fog={0.05} />
						<Emma x={1000} y={740} s={0.7} frame={f} back arms="hipsHands" />
					</Stage>
				),
			},
			// The ocean was empty. No floating people. No splash. No Daniel. Nothing.
			{
				at: 'narrator_200_ocean_empty',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cx: 760}} to={{z: 1.0, cx: 1160}}>
						<OceanNight f={f} horizon={430} mood="red" />
					</Stage>
				),
			},
			{at: 'narrator_201_nothing', render: ({f, d}) => <Stage f={f} d={d}><OceanNight f={f} horizon={430} mood="dark" /></Stage>},
			// Then the engines roared back to life.
			{
				at: 'narrator_202_engines',
				render: ({f, d, api, from}) => {
					const on = api.at('narrator_202_engines', 0.6) - from;
					return (
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} shakeAt={[on]} shakeAmp={6}>
							<OceanNight f={f} horizon={470} />
							<FerryExterior f={f} x={960} y={600} s={0.6} lights={f >= on ? 'on' : 'off'} wake={f >= on ? clamp((f - on) / 30) : 0} />
						</Stage>
					);
				},
			},
			// GPS returned. Radar returned.
			{
				at: 'narrator_203_gps',
				render: ({f}) => (
					<Evidence f={f} title="NAVIGATION" lines={['GPS OK', 'RADAR OK']}>
						<AbsoluteFill style={{background: '#090b0e', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 40}}>
							<div style={{transform: 'scale(0.62)', margin: -180}}>
								<NavScreen f={f} state="normal" clock="00:53:40" />
							</div>
							<div style={{transform: 'scale(0.75)', margin: -100}}>
								<RadarScreen f={f} state="ok" size={600} />
							</div>
						</AbsoluteFill>
					</Evidence>
				),
			},
			// PORT MASON — 4.7 KM
			{
				at: 'narrator_204_nav_showed',
				render: ({f}) => (
					<Evidence f={f} title="PORT MASON" lines={['4.7 KM']}>
						<AbsoluteFill style={{background: '#090b0e', alignItems: 'center', justifyContent: 'center'}}>
							<NavScreen f={f} state="restored" clock="00:53:52" />
						</AbsoluteFill>
					</Evidence>
				),
			},
			// Five minutes later... they saw the harbor lights.
			{
				at: 'narrator_205_harbor_lights',
				render: ({f, d}) => (
					<AbsoluteFill>
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.12, cy: 500}}>
							<OceanNight f={f} horizon={520} />
							<Harbor f={f} horizon={520} distant />
							<FerryExterior f={f} x={lerpF(f, 0, d, 700, 860)} y={720} s={0.5} />
						</Stage>
						<div style={{position: 'absolute', left: 70, top: 60, fontFamily: FONT.mono, fontSize: 46, color: '#e9eef5'}}>00:59 AM</div>
					</AbsoluteFill>
				),
			},
		]}
	/>
);

export const _keep = [Svg, headY];
