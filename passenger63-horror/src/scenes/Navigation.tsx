// 6. NAVIGATION FAILURE + MARINE RADIO - "North Star Eight docked twenty-three minutes ago."
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, HarborOperator, Purser} from '../components/characters/Cast';
import {FerryExterior, OceanNight} from '../components/environments/Outdoor';
import {Bridge, FerryCorridor} from '../components/environments/Interior';
import {CCTVOverlay} from '../components/evidence/CCTV';
import {Compass, HarborControl, MarineRadio, NavScreen, RadarScreen} from '../components/evidence/Navigation';
import {HarborPhoto} from '../components/evidence/Photos';
import {Evidence} from '../components/fx/Fx';
import {clamp, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Shots, Stage, Svg} from '../utils/scene';
import {Closeup, headY, talkOf} from './common';

const BridgeBg: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#161b24" />
		<g transform="translate(0,-120)">
			<OceanNight f={f} horizon={560} mood="dark" stars={false} />
		</g>
		<rect x={-200} y={700} width={2400} height={600} fill="#2b313c" />
	</g>
);

const Console: React.FC<{children: React.ReactNode; label?: string}> = ({children, label}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at center,#1d232c,#090b0e 75%)', alignItems: 'center', justifyContent: 'center'}}>
		{children}
		{label ? <div style={{position: 'absolute', bottom: 50, fontFamily: FONT.mono, fontSize: 30, color: '#7f97b6', letterSpacing: 4}}>{label}</div> : null}
	</AbsoluteFill>
);

const Radio: React.FC<{f: number; mode: 'tx' | 'rx' | 'idle' | 'static'; level?: number; caption?: string}> = ({f, mode, level = 0.8, caption}) => (
	<Console label="VHF CH 16 · PORT MASON VTS">
		<MarineRadio f={f} mode={mode} level={level} />
		{caption ? <div style={{position: 'absolute', top: 70, fontFamily: FONT.mono, fontSize: 34, color: '#cfe0f5'}}>{caption}</div> : null}
	</Console>
);

const CaptainClose: React.FC<{f: number; d: number; talk?: number; props?: any}> = ({f, d, talk = 0, props = {}}) => (
	<Closeup who="captain" f={f} d={d} s={3.0} cy={460} color="#161b24" bg={<BridgeBg f={f} />} push={0.05} props={{arms: 'phoneEar', prop: 'handset', talk, look: [0.4, 0], ...props}} />
);

export const Navigation: React.FC = () => (
	<Shots
		shots={[
			// the engines slow - the wake dies away
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}}>
						<OceanNight f={f} horizon={470} />
						<FerryExterior f={f} x={960} y={600} s={0.55} wake={lerpF(f, 0, d, 1, 0.1)} />
					</Stage>
				),
			},
			// The captain rushed to the bridge.
			{
				at: 'narrator_127_rushed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.25, cy: 520}}>
						<FerryCorridor f={f} />
						<Captain x={lerpF(f, 0, d, 760, 960)} y={lerpF(f, 0, d, 1120, 760)} s={lerpF(f, 0, d, 1.35, 0.7)} frame={f} back pose="run" phase={f * 0.5} />
					</Stage>
				),
			},
			// The navigation screen had gone blank.
			{at: 'narrator_128_nav_blank', render: ({f}) => <Evidence f={f} title="NAVIGATION" lines={['BLANK']}><Console label="BRIDGE · ECDIS"><NavScreen f={f} state={f < 10 ? 'normal' : 'blank'} /></Console></Evidence>},
			// GPS lost. Compass spinning. Radar empty.
			{
				at: 'narrator_129_gps',
				render: ({f, d}) => {
					const k = Math.min(2, Math.floor((f / d) * 3));
					if (k === 0) return <Evidence f={f} title="GPS" lines={['NO FIX']}><Console label="GPS"><NavScreen f={f} state="lost" /></Console></Evidence>;
					if (k === 1)
						return (
							<Console label="MAGNETIC COMPASS">
								<Compass f={f} spinning size={760} />
							</Console>
						);
					return (
						<Evidence f={f} title="RADAR" lines={['EMPTY']}>
							<Console label="RADAR">
								<RadarScreen f={f} state="empty" size={720} />
							</Console>
						</Evidence>
					);
				},
			},
			// He looked out through the windshield.
			{
				at: 'narrator_130_windshield',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08, cy: 500}}>
						<Bridge f={f} calm={0.2} />
						<Captain x={960} y={1260} s={1.6} frame={f} back />
					</Stage>
				),
			},
			// No coastline. No lights. Nothing.
			{
				at: 'narrator_131_no_coast',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.1, cx: 760}} to={{z: 1.1, cx: 1160}}>
						<OceanNight f={f} horizon={520} mood="dark" stars={false} />
					</Stage>
				),
			},
			{at: 'narrator_132_ten_minutes', render: ({f}) => <Evidence f={f} title="POSITION" lines={['UNKNOWN']}><Console label="ECDIS"><NavScreen f={f} state="void" /></Console></Evidence>},
			// black ocean in every direction
			{
				at: 'narrator_133_instead',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.5}} to={{z: 0.95}}>
						<OceanNight f={f} horizon={420} mood="dark" stars={false} />
						<FerryExterior f={f} x={960} y={560} s={0.16} wake={0} />
					</Stage>
				),
			},
			// The captain radioed the harbor.
			{
				at: 'narrator_134_radioed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.1, cy: 520}} to={{z: 1.2}}>
						<Bridge f={f} calm={0.2} />
						<Captain x={760} y={1120} s={1.5} frame={f} arms={f > d * 0.4 ? 'phoneEar' : 'relaxed'} prop={f > d * 0.4 ? 'handset' : 'none'} look={[0.5, 0]} />
						<Crew1 x={1300} y={1140} s={1.4} frame={f} look={[-1, 0]} brows="worried" />
					</Stage>
				),
			},
			{at: 'captain_001_radio_call', off: -0.25, render: ({f}) => <Radio f={f} mode="tx" level={0.85} caption="NORTH STAR 8 → PORT MASON CONTROL" />},
			{at: 'radio_static_1', render: ({f}) => <Radio f={f} mode="static" level={0.4} />},
			{at: 'captain_002_radio_again', off: -0.2, render: ({f, d, sf, api}) => <CaptainClose f={f} d={d} talk={talkOf(api, sf, 'captain_002_radio_again')} props={{brows: 'worried'}} />},
			{at: 'narrator_135_answered', frac: 0.5, render: ({f}) => <Radio f={f} mode="rx" level={0.8} caption="PORT MASON CONTROL" />},
			{at: 'narrator_136_exhaled', render: ({f, d, sf, api}) => <CaptainClose f={f} d={d} talk={talkOf(api, sf, 'captain_003_lost_nav')} props={{eyes: f < 15 ? 'closed' : 'dot'}} />},
			// Silence.
			{at: 'radio_silence', render: ({f}) => <Radio f={f} mode="idle" level={0} />},
			{at: 'harbor_002_confirm', off: -0.2, render: ({f}) => <Radio f={f} mode="rx" level={0.7} caption="PORT MASON CONTROL" />},
			{at: 'captain_004_ns8', off: -0.2, render: ({f, d, sf, api}) => <CaptainClose f={f} d={d} talk={talkOf(api, sf, 'captain_004_ns8')} props={{brows: 'raised'}} />},
			// Another pause. The harbor operator sounded confused.
			{
				at: 'narrator_137_another_pause',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.2, cy: 520}} to={{z: 1.3}} bg="#0e141c">
						<rect x={-200} y={-200} width={2400} height={1600} fill="#1c2531" />
						<rect x={380} y={220} width={520} height={320} fill="#0a1220" stroke="#111" strokeWidth={10} />
						<rect x={1020} y={220} width={520} height={320} fill="#0a1220" stroke="#111" strokeWidth={10} />
						<rect x={1060} y={260} width={440} height={50} fill="#5a4a1e" />
						<text x={1280} y={296} textAnchor="middle" fontFamily={FONT.mono} fontSize={30} fill="#ffcf6b">
							NORTH STAR 8 · ALONGSIDE
						</text>
						<rect x={200} y={760} width={1520} height={500} fill="#3a414c" stroke="#111" strokeWidth={8} />
						<HarborOperator x={960} y={headY(560, 1.9)} s={1.9} frame={f} arms="phoneEar" prop="handset" brows="raised" look={[0.6, -0.4]} mouth="frown" />
					</Stage>
				),
			},
			// "Captain... North Star Eight docked twenty-three minutes ago."
			{
				at: 'harbor_003_captain',
				off: -0.2,
				render: ({f}) => (
					<Evidence f={f} title="NORTH STAR 8" lines={['DOCKED 00:26', 'BERTH 3']}>
						<HarborControl f={f} live={<HarborPhoto f={0} stamp={false} people={false} />} clock="00:49:22" />
					</Evidence>
				),
			},
			{at: 'harbor_004_docked', frac: 0.6, render: ({f}) => <Evidence f={f} title="DOCKED" lines={['23 MINUTES AGO']}><Console label=""><div style={{fontFamily: FONT.mono, fontSize: 90, color: '#ffcf6b', textAlign: 'center', lineHeight: 1.4}}>NORTH STAR 8<br />ARRIVED 00:26:14</div></Console></Evidence>},
			// Nobody on the bridge spoke.
			{
				at: 'narrator_138_nobody_spoke',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}}>
						<Bridge f={f} calm={0.3} />
						<Captain x={700} y={1120} s={1.45} frame={null} arms="phoneEar" prop="handset" look={[0.2, 0]} brows="flat" />
						<Crew1 x={1150} y={1140} s={1.4} frame={null} look={[-1, 0]} brows="worried" />
						<Purser x={1500} y={1150} s={1.35} frame={null} look={[-1, 0]} eyes="wide" />
					</Stage>
				),
			},
			// The captain looked out at the black ocean. "Negative. We're still at sea."
			{
				at: 'narrator_139_looked_out',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.1, cy: 480}}>
						<Bridge f={f} calm={0.3} />
						<Captain x={960} y={1260} s={1.6} frame={f} back arms="phoneEar" />
					</Stage>
				),
			},
			{at: 'captain_005_negative', off: -0.2, render: ({f, d, sf, api}) => <CaptainClose f={f} d={d} talk={talkOf(api, sf, 'captain_005_negative')} props={{brows: 'worried', look: [0.8, -0.2]}} />},
			// "Sir, I'm looking at your vessel right now." - the live berth camera
			{
				at: 'narrator_140_operator',
				render: ({f}) => (
					<Evidence f={f} title="LIVE CAMERA" lines={['NORTH STAR 8 · BERTH 3']}>
						<CCTVOverlay f={f} camera={'PORT MASON VTS\nCAM 2 · BERTH 3 · LIVE'} timestamp={`00:49:${String(40 + Math.floor(f / 30)).padStart(2, '0')}`} date="">
							<HarborPhoto f={f} stamp={false} people={false} />
						</CCTVOverlay>
					</Evidence>
				),
			},
			{
				at: 'harbor_005_looking',
				frac: 1,
				render: ({f, d}) => <CaptainClose f={f} d={d} props={{brows: 'worried', eyes: 'wide', mouth: 'flat', pale: clamp(f / 30) * 0.5}} />,
			},
		]}
	/>
);

export const _keep = [Svg];
