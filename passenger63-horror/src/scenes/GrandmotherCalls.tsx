// 8. THE GRANDMOTHER CALLS - "Come here, sweetheart."  9. PEOPLE IN THE WATER.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Daniel, Emma, OldWoman, Passenger} from '../components/characters/Cast';
import {OceanNight} from '../components/environments/Outdoor';
import {CabinRow, PassengerCabin, RearDeck} from '../components/environments/Interior';
import {GrandmaKidPhoto, PhotoEvidence} from '../components/evidence/Photos';
import {Flash} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {h01} from '../utils/rough';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, SeaBg, talkOf} from './common';

const Room: React.FC = () => <rect x={-200} y={-200} width={2400} height={1600} fill="#7f8b9c" />;

const DanielC: React.FC<{f: number; d: number; props?: any; s?: number; push?: number}> = ({f, d, props = {}, s = 3.3, push = 0.06}) => (
	<Closeup who="daniel" f={f} d={d} s={s} cy={460} color="#7f8b9c" bg={<Room />} push={push} props={props} />
);
const EmmaC: React.FC<{f: number; d: number; props?: any}> = ({f, d, props = {}}) => <Closeup who="emma" f={f} d={d} s={3.3} cy={460} color="#7f8b9c" bg={<Room />} props={props} />;

/** Inside the cabin, looking at the rear doors: fog outside, a warm glow when the voice is "kind". */
const RearDoors: React.FC<{f: number; d: number; warm?: number; z?: [number, number]}> = ({f, d, warm = 0, z = [2.2, 2.6]}) => (
	<AbsoluteFill>
		<Stage f={f} d={d} from={{z: z[0], cx: 960, cy: 470}} to={{z: z[1], cx: 960, cy: 470}}>
			<PassengerCabin f={f} facing="aft" lights="dim" />
			<rect x={865} y={402} width={76} height={110} fill={`rgba(255,200,120,${0.35 * warm})`} />
			<rect x={980} y={402} width={76} height={110} fill={`rgba(255,200,120,${0.35 * warm})`} />
			{[0, 1, 2].map((i) => (
				<ellipse key={i} cx={900 + ((f * (0.4 + i * 0.2)) % 160)} cy={450 + i * 22} rx={60} ry={14} fill="#b9c3cf" opacity={0.12} />
			))}
		</Stage>
	</AbsoluteFill>
);

export const GrandmotherCalls: React.FC = () => (
	<Shots
		shots={[
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.05}} rock={0.5}>
						<CabinRow f={f}>
							<Emma x={860} y={1010} s={1.25} frame={f} arms={f > d * 0.6 ? 'grabRight' : 'relaxed'} brows="worried" look={[1, 0]} />
							<Daniel x={1120} y={1010} s={1.25} frame={f} back={f > d * 0.25} look={[1, 0]} />
						</CabinRow>
					</Stage>
				),
			},
			{at: 'emma_008_where', off: -0.1, render: ({f, d, sf, api}) => <EmmaC f={f} d={d} props={{brows: 'worried', arms: 'grabRight', talk: talkOf(api, sf, 'emma_008_where'), look: [1, 0]}} />},
			{at: 'narrator_158_didnt_answer', render: ({f, d}) => <DanielC f={f} d={d} push={0.1} props={{tilt: lerpF(f, 0, 20, 0, -10), look: [-0.8, -0.3], mouth: 'flat', brows: 'raised'}} />},
			{at: 'narrator_159_not_announcement', render: ({f, d}) => <RearDoors f={f} d={d} z={[1.6, 2.2]} />},
			{at: 'narrator_160_quiet', render: ({f, d}) => <RearDoors f={f} d={d} z={[2.2, 2.7]} />},
			// "Daniel." - from outside. The deck is empty, only fog.
			{
				at: 'oldwoman_005_daniel',
				off: -0.3,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 600}} to={{z: 1.08}}>
						<RearDeck f={f} view="behind" fog={0.45} />
					</Stage>
				),
			},
			{
				at: 'narrator_161_walking',
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.2, cy: 520}} rock={0.4}>
						<PassengerCabin f={f} facing="aft" lights="dim" />
						<Daniel x={lerpF(f, 0, d, 1000, 980)} y={lerpF(f, 0, d, 1160, 1060)} s={lerpF(f, 0, d, 1.3, 1.15)} frame={f} back pose="walk" phase={f * 0.25} />
						<Emma x={lerpF(f, 0, d, 760, 830)} y={1180} s={1.35} frame={f} arms="grabRight" brows="angry" talk={talkOf(api, sf, 'emma_009_stop')} mouth="shout" look={[1, -0.5]} />
					</Stage>
				),
			},
			{at: 'narrator_162_looked_at_her', render: ({f, d}) => <DanielC f={f} d={d} push={0.08} props={{tears: clamp(f / 12), brows: 'sad', look: [-0.8, 0], mouth: 'wobbly'}} />},
			{at: 'daniel_006_used_to_say', off: -0.1, render: ({f, d, sf, api}) => <DanielC f={f} d={d} push={0.06} props={{tears: 1, brows: 'sad', look: [-0.8, 0], talk: talkOf(api, sf, 'daniel_006_used_to_say')}} />},
			{at: 'emma_010_what', off: -0.05, render: ({f, d, sf, api}) => <EmmaC f={f} d={d} props={{brows: 'worried', look: [1, 0], talk: talkOf(api, sf, 'emma_010_what')}} />},
			{at: 'daniel_007_exactly', off: -0.1, render: ({f, d, sf, api}) => <DanielC f={f} d={d} s={4.2} push={0.08} props={{tears: 1, brows: 'sad', look: [0, 0], eyes: 'dot', talk: talkOf(api, sf, 'daniel_007_exactly') * 0.5}} />},
			{at: 'emma_011_shes_dead', off: -0.1, render: ({f, d, sf, api}) => <EmmaC f={f} d={d} props={{brows: 'angry', look: [1, 0], talk: talkOf(api, sf, 'emma_011_shes_dead'), arms: 'grabRight'}} />},
			{at: 'narrator_163_nodded', render: ({f, d, sf, api}) => <DanielC f={f} d={d} push={0.05} props={{tears: 1, brows: 'sad', tilt: Math.sin(f / 5) * 5, look: [-0.6, 0.3], talk: talkOf(api, sf, 'daniel_008_i_know')}} />},
			{at: 'narrator_164_again', render: ({f, d}) => <RearDoors f={f} d={d} z={[2.5, 2.8]} warm={0.2} />},
			{at: 'narrator_165_covered', render: ({f, d}) => <DanielC f={f} d={d} push={0.06} props={{arms: f > 6 ? 'coverEars' : 'relaxed', eyes: 'closed', tears: 1, brows: 'sad', mouth: 'wobbly'}} />},
			// The voice changed. Younger. Kinder.
			{at: 'narrator_166_changed', render: ({f, d}) => <RearDoors f={f} d={d} z={[2.6, 3.4]} warm={clamp(f / (d * 0.8))} />},
			// "Come here, sweetheart." - a memory flash, warm, not sepia
			{
				at: 'oldwoman_007_sweetheart',
				off: -0.1,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#2a2018'}}>
						{f < d * 0.55 ? (
							<PhotoEvidence f={f} rot={-2} sepia={0.15} w={1300} h={800} scale={lerpF(f, 0, d, 1, 1.06)}>
								<GrandmaKidPhoto f={f} />
							</PhotoEvidence>
						) : (
							<DanielC f={f} d={d} push={0.04} props={{arms: 'relaxed', eyes: 'dot', tears: 1, brows: 'sad', mouth: 'faint', look: [0.8, -0.2]}} />
						)}
						<Flash f={f} at={0} dur={3} color="#fff4dc" />
					</AbsoluteFill>
				),
			},
			{at: 'narrator_167_crying', render: ({f, d}) => <DanielC f={f} d={d} push={0.05} props={{tears: 1.4, brows: 'sad', mouth: 'wobbly', eyes: 'closed', shiver: 1}} />},
			// Emma slapped him. Hard.
			{
				at: 'narrator_168_slapped',
				render: ({f, d, sf, api}) => {
					const hit = api.at('narrator_168_slapped', 0.62) - api.at('narrator_168_slapped');
					const after = f >= hit;
					return (
						<AbsoluteFill>
							<Stage f={f} d={d} from={{z: 1.3, cy: 660}} to={{z: 1.34, cy: 660}} shakeAt={[hit]} shakeAmp={22} bg="#7f8b9c">
								<Room />
								<Emma x={720} y={1080} s={1.5} frame={f} arms={f > hit - 6 && f < hit + 8 ? 'slap' : 'relaxed'} brows="angry" mouth="frown" look={[1, 0]} />
								<Daniel x={1160} y={1080} s={1.5} frame={f} tilt={after ? lerpF(f, hit, hit + 4, 0, 18) - lerpF(f, hit + 10, hit + 30, 0, 12) : 0} eyes={after ? 'wide' : 'closed'} tears={1} brows={after ? 'raised' : 'sad'} blush={after} />
							</Stage>
							<Flash f={f} at={hit} dur={2} />
						</AbsoluteFill>
					);
				},
			},
			{at: 'narrator_169_blinked', render: ({f, d}) => <DanielC f={f} d={d} push={0.04} props={{eyes: f % 40 < 4 ? 'closed' : 'wide', blush: true, brows: 'raised', mouth: 'flat', look: [-0.6, 0]}} />},
			{at: 'voice_stopped', render: ({f, d}) => <RearDoors f={f} d={d} z={[2.4, 2.45]} />},
			// Then someone screamed from the rear deck.
			{
				at: 'narrator_170_screamed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.15, cy: 500}} shakeAt={[Math.round(d * 0.4)]} shakeAmp={6}>
						<PassengerCabin f={f} facing="aft" crowdEyes="wide" crowdMouth="o" headsLook={0.5} />
						<Passenger id={9} x={1040} y={700} s={0.55} frame={f} arms="pointLeft" flip mouth="scream" eyes="wide" back={false} />
					</Stage>
				),
			},
		]}
	/>
);

/* ------------------------------------------------------------------------ */
/* J. PEOPLE IN THE WATER                                                    */
/* ------------------------------------------------------------------------ */

interface Figure {
	x: number;
	y: number;
	s: number;
	id: number;
	daniel?: boolean;
}

const FIGURES: Figure[] = (() => {
	const out: Figure[] = [];
	const rows = [
		{y: 470, s: 0.3, n: 14},
		{y: 545, s: 0.44, n: 11},
		{y: 650, s: 0.64, n: 8},
		{y: 800, s: 0.92, n: 6},
	];
	let id = 0;
	rows.forEach((r, ri) => {
		for (let i = 0; i < r.n; i++) {
			const x = 140 + ((i + 0.5) / r.n) * 1640 + (h01(id, ri) - 0.5) * 70;
			out.push({x, y: r.y + (h01(id, 9) - 0.5) * 16, s: r.s, id: id++});
		}
	});
	// one of them looks like Daniel (blue shoulders, dark hair) - never mentioned
	out[27].daniel = true;
	return out;
})();

/** Dozens of simplified pale heads/shoulders, upright and perfectly still. */
export const SeaPeople: React.FC<{raised: (fig: Figure, i: number) => number; f: number; opacity?: number}> = ({raised, opacity = 1}) => (
	<g opacity={opacity}>
		{FIGURES.map((fg, i) => {
			const r = raised(fg, i);
			const s = fg.s;
			const sh = fg.daniel ? '#2f63c4' : ['#2a2d33', '#3a3530', '#30363f', '#3d3a44'][fg.id % 4];
			const hair = fg.daniel ? '#2b1b12' : ['#1c1a18', '#5a5048', '#888', '#2b2420'][fg.id % 4];
			const armUp = r > 0;
			return (
				<g key={fg.id} transform={`translate(${fg.x},${fg.y}) scale(${s})`}>
					{/* reflection on the dead-calm water */}
					<ellipse cx={0} cy={18} rx={64} ry={10} fill="#d9dcd6" opacity={0.05} />
					{armUp ? (
						<g>
							<path d={`M38,-30 L${44 + r * 6},${-30 - r * 150}`} stroke="#111" strokeWidth={18} strokeLinecap="round" />
							<path d={`M38,-30 L${44 + r * 6},${-30 - r * 150}`} stroke={sh} strokeWidth={10} strokeLinecap="round" />
							<circle cx={44 + r * 6} cy={-30 - r * 150} r={10} fill="#d9dcd6" stroke="#111" strokeWidth={4} />
						</g>
					) : null}
					<path d="M-60,0 Q-58,-52 0,-56 Q58,-52 60,0 Z" fill={sh} stroke="#111" strokeWidth={5} />
					<circle cx={0} cy={-92} r={38} fill="#d9dcd6" stroke="#111" strokeWidth={5} />
					<path d="M-38,-98 Q-34,-136 0,-132 Q34,-136 38,-98 Q20,-114 0,-112 Q-20,-114 -38,-98 Z" fill={hair} stroke="#111" strokeWidth={4} />
					<circle cx={-12} cy={-92} r={5} fill="#1a1a1a" />
					<circle cx={12} cy={-92} r={5} fill="#1a1a1a" />
					{/* water line hides everything below the shoulders */}
					<rect x={-80} y={0} width={160} height={40} fill="#05080d" />
				</g>
			);
		})}
	</g>
);

const Sea: React.FC<{f: number; children?: React.ReactNode}> = ({f, children}) => (
	<g>
		<OceanNight f={f} horizon={430} calm={1} stars mood="night" />
		{children}
	</g>
);

export const PeopleInWater: React.FC = () => (
	<Shots
		shots={[
			// The old woman was back. Standing beside the railing.
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 560}} to={{z: 1.06}}>
						<RearDeck f={f} view="behind" calm={0.8} fog={0.12}>
							<g />
						</RearDeck>
						<OldWoman x={1380} y={712} s={0.62} back />
					</Stage>
				),
			},
			// This time... she wasn't alone. (push past her, to the sea)
			{
				at: 'narrator_172_not_alone',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cx: 1200, cy: 560}} to={{z: 1.6, cx: 1100, cy: 470}}>
						<RearDeck f={f} view="behind" calm={0.95} fog={0.1} seaChildren={<SeaPeople f={f} raised={() => 0} opacity={clamp((f - d * 0.6) / (d * 0.4)) * 0.7} />} />
						<OldWoman x={1380} y={712} s={0.62} back />
					</Stage>
				),
			},
			// There were people in the water. (wide, unnaturally calm sea, all still)
			{
				at: 'narrator_173_people',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}}>
						<Sea f={f}>
							<SeaPeople f={f} raised={() => 0} />
						</Sea>
					</Stage>
				),
			},
			{
				at: 'narrator_174_dozens',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.5, cx: 760, cy: 560}} to={{z: 1.55, cx: 800}}>
						<Sea f={f}>
							<SeaPeople f={f} raised={() => 0} />
						</Sea>
					</Stage>
				),
			},
			{
				at: 'narrator_176_heads',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.1, cx: 1120, cy: 600}} to={{z: 2.15}}>
						<Sea f={f}>
							<SeaPeople f={f} raised={() => 0} />
						</Sea>
					</Stage>
				),
			},
			// The sea was perfectly still. (hold - almost silence)
			{
				at: 'narrator_177_still',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.0}}>
						<Sea f={f}>
							<SeaPeople f={f} raised={() => 0} />
						</Sea>
					</Stage>
				),
			},
			// One of them raised an arm. Then another. Then all of them.
			{
				at: 'narrator_178_raised',
				render: ({f, d, sf, api}) => {
					const t1 = api.at('narrator_178_raised', 0.5);
					const t2 = api.at('narrator_179_another', 0.3);
					const t3 = api.at('narrator_180_all', 0.25);
					return (
						<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.0}}>
							<Sea f={f}>
								<SeaPeople
									f={f}
									raised={(fg, i) => {
										if (i === 41) return clamp((sf - t1) / 24);
										if (i === 27) return clamp((sf - t2) / 24);
										return clamp((sf - t3 - (fg.id % 7) * 2) / 30);
									}}
								/>
							</Sea>
						</Stage>
					);
				},
			},
			{at: 'narrator_181_stared', render: ({f, d}) => <Closeup who="daniel" f={f} d={d} s={3.4} cy={460} bg={<SeaBg f={f} calm={1} />} push={0.1} props={{eyes: 'wide', pale: 0.9, mouth: 'o', brows: 'worried', shiver: 1.2}} />},
			{at: 'narrator_182_smiled', render: ({f, d}) => <Closeup who="woman" f={f} d={d} s={4.4} cy={420} bg={<SeaBg f={f} calm={1} />} push={0.04} props={{mouth: f > 8 ? 'smile' : 'faint', pose: 'stand', look: [-0.4, 0]}} />},
			// She pointed toward the water.
			{
				at: 'narrator_183_pointed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.6, cx: 1250, cy: 560}} to={{z: 1.65}}>
						<RearDeck f={f} view="behind" calm={1} fog={0.05} seaChildren={<SeaPeople f={f} raised={() => 1} />} />
						<OldWoman x={1380} y={712} s={0.62} arms={{l: [10, -80], r: [lerpF(f, 4, 26, 10, 92, easeInOut), 0]}} turn={0.4} />
					</Stage>
				),
			},
			// "Everyone came back."
			{
				at: 'oldwoman_009_everyone',
				off: -0.2,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0, cy: 560}} to={{z: 1.08}}>
						<RearDeck f={f} view="behind" calm={1} fog={0.05} seaChildren={<SeaPeople f={f} raised={() => 1} />} />
						<OldWoman x={1380} y={712} s={0.62} arms={{l: [10, -80], r: [92, 0]}} turn={0.4} />
					</Stage>
				),
			},
		]}
	/>
);

export const _keep = [Svg, headY];
