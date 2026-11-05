// 11. POLICE INVESTIGATION - Daniel removed from photos, records... the ring says 37.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Emma, PoliceOfficer} from '../components/characters/Cast';
import {FerryExterior, Harbor, OceanNight} from '../components/environments/Outdoor';
import {CivilRecord, DatabaseSearch, PoliceCaseFile} from '../components/evidence/Documents';
import {PhoneScreen} from '../components/evidence/Phone';
import {ChristmasPhoto, HoneymoonPhoto, PhotoEvidence, WeddingPhoto, WeddingRing} from '../components/evidence/Photos';
import {BigText, CrudeLabel, Evidence} from '../components/fx/Fx';
import {clamp, easeInOut, lerpF} from '../utils/anim';
import {Shots, Stage} from '../utils/scene';
import {Closeup, talkOf} from './common';

const Quay: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#0b0f18" />
		<g transform="translate(0,-200)">
			<Harbor f={f} variant="port" horizon={760} police />
		</g>
	</g>
);

const Table: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #4a3b2c, #1b140e 75%)'}}>{children}</AbsoluteFill>
);

const Gallery: React.FC<{f: number}> = ({f}) => (
	<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 6}}>
		{[WeddingPhoto, HoneymoonPhoto, ChristmasPhoto, WeddingPhoto, ChristmasPhoto, HoneymoonPhoto].map((P, i) => (
			<div key={i} style={{position: 'relative', height: 140, overflow: 'hidden', background: '#ddd'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.098)', transformOrigin: '0 0'}}>
					<P f={f} />
				</div>
			</div>
		))}
	</div>
);

export const Police: React.FC = () => (
	<Shots
		shots={[
			// Police were waiting when the ferry docked.
			{
				at: 0,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.06}}>
						<OceanNight f={f} horizon={560} />
						<FerryExterior f={f} x={1500} y={640} s={0.55} wake={0} rock={0.2} />
						<g transform="translate(0,-40)">
							<Harbor f={f} variant="port" horizon={640} police />
						</g>
						<PoliceOfficer x={620} y={940} s={0.8} frame={f} arms="hipsHands" />
						<PoliceOfficer x={760} y={950} s={0.8} frame={f} look={[1, 0]} />
					</Stage>
				),
			},
			// Emma told them everything.
			{
				at: 'narrator_207_told',
				render: ({f, d, sf, api}) => (
					<Stage f={f} d={d} from={{z: 1.15, cy: 520}} to={{z: 1.2}}>
						<Quay f={f} />
						<Emma x={760} y={1080} s={1.5} frame={f} talk={talkOf(api, sf, 'narrator_207_told', 'narrator_208_list') * 0.6} arms="shrug" brows="worried" tears={0.6} look={[1, 0]} />
						<PoliceOfficer x={1180} y={1080} s={1.5} frame={f} arms="holdOne" prop="notebook" look={[-1, 0.3]} />
					</Stage>
				),
			},
			{
				at: 'narrator_208_list',
				render: ({f, d, sf, api}) => {
					const step = d / 5;
					const items = ['DANIEL', 'THE WOMAN', '63?', 'THE PA', 'PEOPLE IN THE WATER'];
					return (
						<Stage f={f} d={d} from={{z: 1.15, cy: 520}} to={{z: 1.18}}>
							<Quay f={f} />
							<Emma x={760} y={1080} s={1.5} frame={f} talk={talkOf(api, sf, 'narrator_208_list') * 0.6} arms="shrug" brows="worried" tears={0.6} look={[1, 0]} />
							<PoliceOfficer x={1180} y={1080} s={1.5} frame={f} arms="holdOne" prop="notebook" look={[-1, 0.3]} brows="raised" />
							{items.map((t, i) => (
								<CrudeLabel key={t} x={420 + (i % 3) * 540} y={230 + Math.floor(i / 3) * 120} text={t} f={f} appear={i * step} size={56} />
							))}
						</Stage>
					);
				},
			},
			// manifest: 61 passengers, no Daniel Clarke
			{at: 'narrator_209_checked', render: ({f}) => <Evidence f={f} title="CASE FILE" lines={['61 PASSENGERS', 'NO DANIEL CLARKE']}><PoliceCaseFile f={f} /></Evidence>},
			// F. DATABASE SEARCH - NO RECORD FOUND
			{
				at: 'narrator_210_database',
				render: ({f, d}) => (
					<Evidence f={f} title="DATABASE" lines={['NO RECORD FOUND']}>
						<DatabaseSearch f={f} query="SURNAME=CLARKE  FIRST=DANIEL  SAILING=NS8-2328" typeStart={2} resultAt={Math.round(d * 0.66)} />
					</Evidence>
				),
			},
			// Emma showed them photographs.
			{
				at: 'narrator_211_photographs',
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#11161f'}}>
						<div style={{position: 'absolute', inset: 0, transform: `scale(${lerpF(f, 0, d, 1, 1.08)})`}}>
							<PhoneScreen x={960} y={560} scale={1.05} time="02:14">
								<Gallery f={f} />
							</PhoneScreen>
						</div>
					</AbsoluteFill>
				),
			},
			// In every photograph... Emma was alone.
			{
				at: 'narrator_212_every',
				render: ({f, d}) => (
					<Table>
						<PhotoEvidence f={f} rot={-8} x={620} y={480} w={760} h={500}>
							<ChristmasPhoto f={f} />
						</PhotoEvidence>
						<PhotoEvidence f={f} rot={6} x={1300} y={520} w={760} h={500}>
							<HoneymoonPhoto f={f} />
						</PhotoEvidence>
						<PhotoEvidence f={f} rot={-1} x={960} y={600} w={820} h={540} scale={lerpF(f, 0, d, 1, 1.06)}>
							<WeddingPhoto f={f} />
						</PhotoEvidence>
					</Table>
				),
			},
			// L. PHOTO ERASURE - wedding / honeymoon / christmas
			{at: 'narrator_213_wedding', render: ({f, d}) => <Table><PhotoEvidence f={f} rot={-2} w={1400} h={860} scale={lerpF(f, 0, d, 1, 1.05)} stamp="06 14 '22"><WeddingPhoto f={f} /></PhotoEvidence></Table>},
			{at: 'narrator_214_honeymoon', render: ({f, d}) => <Table><PhotoEvidence f={f} rot={2} w={1400} h={860} scale={lerpF(f, 0, d, 1, 1.05)} stamp="06 21 '22"><HoneymoonPhoto f={f} /></PhotoEvidence></Table>},
			{at: 'narrator_215_christmas', render: ({f, d}) => <Table><PhotoEvidence f={f} rot={-3} w={1400} h={860} scale={lerpF(f, 0, d, 1, 1.05)} stamp="12 25 '24"><ChristmasPhoto f={f} /></PhotoEvidence></Table>},
			// "He's my husband!"
			{
				at: 'narrator_216_emma_screamed',
				render: ({f, d, sf, api}) => (
					<Closeup who="emma" f={f} d={d} s={3.4} cy={450} color="#0b0f18" bg={<Quay f={f} />} push={0.1} props={{mouth: 'shout', brows: 'angry', tears: 1.2, talk: talkOf(api, sf, 'emma_014_husband'), look: [1, 0]}} />
				),
			},
			// government records: single, never married
			{at: 'narrator_217_records', render: ({f, d}) => <Evidence f={f} title="CIVIL REGISTRY" lines={['EMMA CLARKE, 30', 'SINGLE · NEVER MARRIED']}><CivilRecord f={f} reveal={clamp(f / (d * 2.5))} /></Evidence>},
			{
				at: 'narrator_218_record',
				render: ({f, d}) => (
					<Evidence f={f} title="CIVIL REGISTRY" lines={['EMMA CLARKE, 30', 'SINGLE · NEVER MARRIED']}>
						<CivilRecord f={f} reveal={0.4 + clamp(f / (d * 0.8)) * 0.6} />
					</Evidence>
				),
			},
			// She pulled Daniel's wedding ring from her pocket.
			{
				at: 'narrator_219_ring',
				render: ({f, d}) => (
					<Closeup who="emma" f={f} d={d} s={2.6} cy={360} color="#0b0f18" bg={<Quay f={f} />} push={0.08} props={{arms: f > d * 0.5 ? 'holdOne' : 'relaxed', prop: f > d * 0.5 ? 'ring' : 'none', tears: 1, brows: 'sad', look: [0.4, 0.8]}} />
				),
			},
			{at: 'narrator_220_uncomfortable', render: ({f, d, sf, api}) => <Closeup who="crew1" f={f} d={d} s={3.2} cy={450} color="#0b0f18" bg={<Quay f={f} />} props={{palette: {skin: '#e3b894', shirt: '#1b2233', pants: '#151a26', hair: '#3a2a1f', shoes: '#0d0d0d'}, hat: 'police', vest: '#c9e23d', vestText: 'POLICE', stripe: undefined, brows: 'worried', look: [-0.8, 0.4], talk: talkOf(api, sf, 'police_001_whose')}} />},
			{at: 'emma_015_husbands', off: -0.05, render: ({f, d, sf, api}) => <Closeup who="emma" f={f} d={d} s={3.4} cy={450} color="#0b0f18" bg={<Quay f={f} />} push={0.06} props={{mouth: 'shout', brows: 'angry', tears: 1.2, talk: talkOf(api, sf, 'emma_015_husbands'), arms: 'holdOne', prop: 'ring', look: [1, 0]}} />},
			{at: 'police_002_maam', off: -0.05, render: ({f, d, sf, api}) => <Closeup who="crew1" f={f} d={d} s={3.2} cy={450} color="#0b0f18" bg={<Quay f={f} />} props={{palette: {skin: '#e3b894', shirt: '#1b2233', pants: '#151a26', hair: '#3a2a1f', shoes: '#0d0d0d'}, hat: 'police', vest: '#c9e23d', vestText: 'POLICE', stripe: undefined, brows: 'sad', look: [-0.8, 0.4], talk: talkOf(api, sf, 'police_002_maam'), arms: 'holdOne', prop: 'ring'}} />},
			// M. WEDDING RING - extreme close-up, the camera rotates
			{at: 'narrator_221_turned_ring', render: ({f, d}) => <WeddingRing f={f} turn={lerpF(f, 0, d, 0, 0.12, easeInOut)} />},
			{at: 'narrator_222_expected', render: ({f, d}) => <WeddingRing f={f} turn={0.12} expected={clamp((f - 6) / 10)} />},
			{at: 'narrator_223_instead', render: ({f, d, api, from}) => {
				const end = api.end('ring_rotate') - from;
				return <WeddingRing f={f} turn={lerpF(f, 0, end, 0.12, 1, easeInOut)} expected={clamp(1 - f / 12)} />;
			}},
			{
				at: 'narrator_224_37',
				off: -0.05,
				render: ({f, d}) => (
					<AbsoluteFill>
						<div style={{position: 'absolute', inset: 0, transform: `scale(${lerpF(f, 0, d, 1.0, 1.15)})`}}>
							<WeddingRing f={f} turn={1} />
						</div>
						<BigText f={f} text="37" appear={4} y={940} size={120} color="#f2e2b0" />
					</AbsoluteFill>
				),
			},
		]}
	/>
);
