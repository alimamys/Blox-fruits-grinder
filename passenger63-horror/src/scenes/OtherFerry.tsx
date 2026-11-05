// 7. THE OTHER FERRY - the harbour-control photograph. Emma alone. Daniel missing.
//    The old woman at the very end of the gangway, watching the camera.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Daniel} from '../components/characters/Cast';
import {OceanNight} from '../components/environments/Outdoor';
import {ImageTransfer} from '../components/evidence/Navigation';
import {HARBOR_PHOTO_SPOTS, HarborPhoto, PhotoLook} from '../components/evidence/Photos';
import {Evidence} from '../components/fx/Fx';
import {clamp, easeInOut} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Cam, type CamPos, Shots, Stage} from '../utils/scene';
import {Closeup, headY} from './common';

const S = HARBOR_PHOTO_SPOTS;

/** The photo on the bridge terminal, with a camera move inside it. */
const Photo: React.FC<{f: number; d: number; from: CamPos; to?: CamPos; children?: React.ReactNode; ease?: (t: number) => number}> = ({f, d, from, to, children, ease}) => (
	<Evidence f={f} title="HARBOR PHOTO 00:26:14" lines={['EMMA - ALONE', 'DANIEL - MISSING']}>
		<AbsoluteFill style={{background: '#000'}}>
			<Cam f={f} d={d} from={from} to={to} ease={ease}>
				<PhotoLook f={f} night>
					<HarborPhoto f={f} />
				</PhotoLook>
				{children}
			</Cam>
			<div style={{position: 'absolute', left: 30, top: 24, fontFamily: FONT.mono, fontSize: 26, color: '#cfe0f5', background: 'rgba(0,0,0,0.5)', padding: '6px 14px'}}>
				IMG_PMVTS_0026.jpg · ZOOM {Math.round((from.z ?? 1) * 100)}%
			</div>
		</AbsoluteFill>
	</Evidence>
);

const BridgeBg: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1600} fill="#161b24" />
		<g transform="translate(0,-120)">
			<OceanNight f={f} horizon={560} mood="dark" stars={false} />
		</g>
		<rect x={-200} y={700} width={2400} height={600} fill="#2b313c" />
	</g>
);

export const OtherFerry: React.FC = () => (
	<Shots
		shots={[
			{
				at: 0,
				render: ({f, d}) => (
					<Closeup who="captain" f={f} d={d} s={3.0} cy={460} color="#161b24" bg={<BridgeBg f={f} />} props={{tilt: Math.sin(f / 6) * 4, brows: 'flat', mouth: 'frown', look: [-0.5, 0]}} />
				),
			},
			{at: 'narrator_142_photograph', render: ({f, d}) => <ImageTransfer f={f} progress={clamp((f - d * 0.6) / (d * 2)) * 0.12} />},
			{
				at: 'image_loading',
				off: -0.6,
				render: ({f, d}) => (
					<Evidence f={f} title="INCOMING IMAGE" lines={['PORT MASON VTS']}>
						<ImageTransfer f={f} progress={0.12 + 0.88 * easeInOut(clamp(f / (d - 4)))}>
							<div style={{position: 'absolute', left: -210, top: -160, width: 1920, height: 1080, transform: 'scale(0.78)', transformOrigin: '210px 160px'}}>
								<HarborPhoto f={f} />
							</div>
						</ImageTransfer>
					</Evidence>
				),
			},
			// The North Star. Docked at Port Mason. Passengers walking off.
			{at: 'narrator_144_north_star', render: ({f, d}) => <Photo f={f} d={d} from={{z: 1.0}} to={{z: 1.08, cx: 900, cy: 600}} />},
			// Timestamp: 12:26 AM
			{at: 'narrator_145_timestamp', render: ({f, d}) => <Photo f={f} d={d} from={{z: 1.6, cx: 1480, cy: 900}} to={S.stamp} />},
			// The current time was 12:49.
			{
				at: 'narrator_146_current_time',
				render: ({f}) => (
					<AbsoluteFill style={{background: '#090b0e', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{fontFamily: FONT.mono, fontSize: 280, color: '#ff4a3d', textShadow: '0 0 40px rgba(255,60,40,0.5)', background: '#050505', padding: '20px 60px', border: '12px solid #2b2f36', borderRadius: 20}}>
							00:49
						</div>
						<div style={{position: 'absolute', top: 90, fontFamily: FONT.mono, fontSize: 36, color: '#7f97b6', letterSpacing: 6}}>BRIDGE CLOCK · NORTH STAR 8</div>
						<div style={{display: 'none'}}>{f}</div>
					</AbsoluteFill>
				),
			},
			// The captain zoomed in.
			{at: 'narrator_147_zoomed', render: ({f, d}) => <Photo f={f} d={d} from={{z: 1.0}} to={S.captain} />},
			// There he was. Same uniform. Same face.
			{at: 'narrator_148_there_he_was', render: ({f, d}) => <Photo f={f} d={d} from={S.captain} to={{...S.captain, z: S.captain.z * 1.12}} />},
			// Beside him the same crew. Then the passengers.
			{at: 'narrator_149_same_crew', render: ({f, d}) => <Photo f={f} d={d} from={S.crew} to={{cx: 800, cy: 600, z: 2.8}} />},
			// Emma.
			{at: 'narrator_150_emma', render: ({f, d}) => <Photo f={f} d={d} from={{cx: 800, cy: 600, z: 2.8}} to={S.emma} />},
			// Daniel stared over the captain's shoulder.
			{
				at: 'narrator_151_shoulder',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.25, cy: 520}} to={{z: 1.3}} bg="#161b24">
						<BridgeBg f={f} />
						<rect x={330} y={330} width={620} height={380} fill="#0a0f16" stroke="#111" strokeWidth={10} />
						<rect x={350} y={350} width={580} height={340} fill="#1c2430" />
						<Captain x={760} y={1220} s={1.6} frame={f} back />
						<Daniel x={1180} y={1200} s={1.55} frame={f} look={[-1, 0.2]} eyes="wide" brows="worried" pale={0.5} />
					</Stage>
				),
			},
			// Emma was in the photograph. Alone.
			{
				at: 'narrator_152_alone',
				render: ({f, d}) => (
					<Photo f={f} d={d} from={S.emma} to={{...S.emma, z: S.emma.z * 1.08}}>
						<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
							<ellipse cx={700} cy={655} rx={30} ry={58} fill="none" stroke="#e32b2b" strokeWidth={4} opacity={clamp((f - d * 0.45) / 6)} strokeDasharray={`${clamp((f - d * 0.45) / 10) * 330} 400`} />
						</svg>
					</Photo>
				),
			},
			{at: 'narrator_153_missing', render: ({f, d}) => <Closeup who="daniel" f={f} d={d} s={3.4} cy={460} color="#161b24" bg={<BridgeBg f={f} />} push={0.1} props={{pale: 0.8, eyes: 'wide', mouth: 'wobbly', brows: 'worried', look: [-0.6, 0.2]}} />},
			// Then somebody pointed.
			{
				at: 'narrator_154_pointed',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.25, cy: 520}} to={{z: 1.3}} bg="#161b24">
						<BridgeBg f={f} />
						<rect x={330} y={330} width={620} height={380} fill="#0a0f16" stroke="#111" strokeWidth={10} />
						<rect x={350} y={350} width={580} height={340} fill="#1c2430" />
						<Crew1 x={1300} y={headY(470, 1.7)} s={1.7} frame={f} arms="pointLeft" flip look={[1, 0]} eyes="wide" mouth="o" />
					</Stage>
				),
			},
			// At the very end of the gangway... stood the old woman.
			{at: 'narrator_155_end_gangway', render: ({f, d}) => <Photo f={f} d={d} from={{cx: 700, cy: 720, z: 2.0}} to={S.woman} ease={(t) => t} />},
			// Black coat. Watching the camera.
			{at: 'narrator_156_watching', render: ({f, d}) => <Photo f={f} d={d} from={S.woman} to={{cx: 470, cy: 772, z: 7.5}} ease={(t) => t * t * (3 - 2 * t)} />},
		]}
	/>
);
