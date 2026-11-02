// ~6:26 – Aftermath: the empty room, then the motel hallway CCTV (SPECIAL I).
// Fixed camera, real-time timestamp, Victor exits exactly 11 seconds after Adam.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Police} from '../components/Characters';
import {CCTVOverlay, CCTV_FILTER} from '../components/CCTVOverlay';
import {CCTVFigure, CCTVHallway} from '../components/sets/CCTVHallway';
import {Street} from '../components/sets/Exteriors';
import {MOTEL_FLOOR, MotelRoom} from '../components/sets/MotelRoom';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import {POSES} from '../components/StickPerson';
import {EASE, keys, ramp, stepFrame} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import {useBoil, wobLine, wobRect} from '../utils/wobble';
import {Shot, useShot} from '../utils/timeline-context';
import {CartoonFinish} from './shared';

const A01Police: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const siren = Math.floor(f / 8) % 2 === 0 ? 'rgba(255,40,40,0.16)' : 'rgba(40,90,255,0.16)';
	return (
		<Stage
			cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.05}], [api.at('overturned'), {x: 1260, y: 700, zoom: 1.7}], [api.at('tvStillOn'), {x: 610, y: 500, zoom: 2.6}], [dur, {x: 610, y: 500, zoom: 2.8}]])}
			overlay={
				<>
					<AbsoluteFill style={{background: siren, mixBlendMode: 'screen'}} />
					<CartoonFinish vignette={0.6} />
				</>
			}
		>
			<Layer>
				<MotelRoom overturned windowBroken blown light={0.55} clock="3:02" tv={{on: 1, staticAmount: 1}} door={{open: 1}}>
					<Police x={760} y={MOTEL_FLOOR} expression="confused" look={[1, 0]} />
					<Police x={1680} y={MOTEL_FLOOR} facing={-1} expression="blank" pose={POSES.handsOnHead} />
				</MotelRoom>
			</Layer>
		</Stage>
	);
};

/** "No one could explain the recording…" – playback rewinds. */
const A02Rewind: React.FC = () => {
	const {f, dur} = useShot();
	const s = Math.max(0, 52 - Math.floor(f * 1.7));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{filter: CCTV_FILTER}}>
				<CCTVHallway doorOpen={0.6} lightFlicker={0.8} />
			</AbsoluteFill>
			<CCTVOverlay camera="MOTEL CAMERA 03" date="NOV-06" time={`01:${String(18 + Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`} rec={false} />
			<StaticOverlay opacity={0.18} blend="screen" seed={201} tear={1} />
			{/* tracking bands */}
			{[0, 1].map((i) => (
				<div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((f * 23 + i * 520) % 1200) - 60, height: 40, background: 'rgba(255,255,255,0.25)', filter: 'blur(3px)'}} />
			))}
			<div style={{position: 'absolute', right: 70, top: 120, fontFamily: FONT.vcr, fontSize: 64, color: '#fff', textShadow: '2px 2px 0 #000'}}>◀◀ REW</div>
			<div style={{position: 'absolute', left: 70, top: 120, fontFamily: FONT.vcr, fontSize: 40, color: '#fff', opacity: f > dur - 20 ? 1 : 0.6, textShadow: '2px 2px 0 #000'}}>PLAYBACK — EVIDENCE COPY</div>
		</AbsoluteFill>
	);
};

const pad = (n: number) => String(n).padStart(2, '0');

/** SPECIAL I: one fixed security camera, real time. */
const A03CCTV: React.FC = () => {
	const api = useShot();
	const {f: rawF} = api;
	const f = stepFrame(rawF, 2); // choppy CCTV frame rate (15 fps)
	const adamExit = api.at('adamRan') + api.s(0.7);
	const victorExit = adamExit + api.s(11); // exactly 11 seconds later
	const stood = api.at('stood');
	const looked = api.at('looked');
	const smiled = api.at('smiled');

	// burned-in clock: 01:17:42 when Adam leaves the room
	const total = 1 * 3600 + 17 * 60 + 42 + Math.floor((rawF - adamExit) / 30);
	const time = `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;

	// door
	const doorOpen = keys(f, [[adamExit - 6, 0], [adamExit - 2, 0.85], [adamExit + 60, 0.7], [victorExit - 10, 0.55], [victorExit, 0.85], [victorExit + 90, 0.8]], EASE.out);

	// Adam: bursts out and runs under the camera
	const adamT = ramp(f, adamExit - 2, adamExit + 34, 0, 1, EASE.linear);
	const adamZ = 5.5 - adamT * 4.4;
	const adamX = -1.25 + adamT * 1.6;
	const adamVisible = f >= adamExit - 2 && adamT < 1;

	// Victor: walks out slowly, stops mid-hallway, turns, looks up, smiles
	const vWalk = ramp(f, victorExit, stood, 0, 1, EASE.inOut);
	const victorX = -1.3 + vWalk * 1.2;
	const victorZ = 5.5 - vWalk * 0.5;
	const facing = ramp(f, stood - 6, stood + 14);
	const lookUp = ramp(f, looked, looked + 30);
	const smile = ramp(f, smiled + 6, smiled + 44, 0, 1, EASE.inOut);
	const victorVisible = f >= victorExit;

	// light flicker during the empty 11 seconds
	const flicker = f > adamExit + 120 && f < victorExit ? (hash1(Math.floor(f / 4), 7) > 0.85 ? 0.25 : 1) : 1;

	// documentary "digital zoom" steps (crops of the fixed frame, not camera moves)
	const at = (id: string) => api.at(id);
	let zoom = 1;
	let zx = 0;
	let zy = 0;
	let label = '';
	if (f >= at('thinMan') && f < at('victor')) {
		zoom = f >= at('bareFeet') ? 2.4 : 1.7;
		zx = 960 + (820 * (victorX - 0.9)) / victorZ;
		zy = f >= at('bareFeet') ? 250 + (820 * 2.45) / victorZ - 30 : 250 + (820 * (2.45 - 1.0)) / victorZ;
		label = `DIGITAL ZOOM ${zoom.toFixed(1)}x`;
	} else if (f >= looked) {
		zoom = f >= smiled ? 3.4 : 2.6;
		zx = 960 + (820 * (victorX - 0.9)) / victorZ;
		zy = 250 - (820 * (1.66 - 2.45)) / victorZ;
		label = `DIGITAL ZOOM ${zoom.toFixed(1)}x`;
	}
	const transform = zoom > 1 ? `translate(${960 - zx * zoom}px, ${540 - zy * zoom}px) scale(${zoom})` : undefined;

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{transformOrigin: '0 0', transform, filter: zoom > 1 ? `${CCTV_FILTER} blur(${(zoom - 1) * 0.35}px)` : CCTV_FILTER}}>
				<CCTVHallway doorOpen={doorOpen} lightFlicker={flicker} />
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					{victorVisible && <CCTVFigure kind="victor" X={victorX} Z={victorZ} gait={vWalk > 0 && vWalk < 1 ? 1 : 0} phase={f * 0.16} facing={facing} lookUp={lookUp} smile={smile} blur={1.4} />}
					{adamVisible && <CCTVFigure kind="adam" X={adamX} Z={adamZ} gait={2} phase={f * 0.5} facing={1} blur={2.6} />}
				</svg>
			</AbsoluteFill>
			<CCTVOverlay camera="MOTEL CAMERA 03" date="NOV-06" time={time} />
			{label && <div style={{position: 'absolute', left: 70, top: 130, fontFamily: FONT.vcr, fontSize: 40, color: '#f2f5ee', textShadow: '2px 2px 0 #000'}}>{label}</div>}
		</AbsoluteFill>
	);
};

const A04Static: React.FC = () => {
	const {f} = useShot();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{f < 5 && (
				<AbsoluteFill style={{filter: CCTV_FILTER, transform: `translateX(${(f % 2) * 30}px)`}}>
					<CCTVHallway doorOpen={0.8} />
				</AbsoluteFill>
			)}
			<StaticOverlay opacity={1} seed={303} tear={1} res={320} />
			<div style={{position: 'absolute', left: 70, top: 50, fontFamily: FONT.vcr, fontSize: 52, color: '#fff', opacity: 0.7}}>MOTEL CAMERA 03</div>
		</AbsoluteFill>
	);
};

/** "Adam was never found." – a missing poster on a lamp post. */
const A05Missing: React.FC = () => {
	const {f, dur} = useShot();
	const b = useBoil();
	const flap = Math.sin(f * 0.15) * 2;
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 520, zoom: 1.1}], [dur, {x: 960, y: 500, zoom: 1.45}]], EASE.linear)} overlay={<CartoonFinish vignette={0.8} />}>
			<Layer>
				<Street ground={980} />
				<path d={wobLine(960, 1000, 960, -200, 7000 + b, 2)} stroke="#2a2a30" strokeWidth={60} />
				<ellipse cx={960} cy={420} rx={420} ry={520} fill={C.lamp} opacity={0.08} />
				<g transform={`rotate(${flap - 2} 960 260)`}>
					<path d={wobRect(760, 250, 400, 520, 7001 + b, 3)} fill="#f2efe2" stroke={C.ink} strokeWidth={6} />
					<text x={960} y={340} fontFamily={FONT.headline} fontWeight={700} fontSize={96} fill={C.red} textAnchor="middle">
						MISSING
					</text>
					<rect x={860} y={370} width={200} height={200} fill="#cfd8e8" stroke={C.ink} strokeWidth={5} />
					<circle cx={960} cy={450} r={46} fill={C.skin} stroke={C.ink} strokeWidth={5} />
					<path d="M 913 448 Q 912 400 960 398 Q 1008 400 1007 448 Q 986 424 960 428 Q 934 424 913 448 Z" fill={C.hair} />
					<circle cx={944} cy={454} r={5} fill={C.ink} />
					<circle cx={976} cy={454} r={5} fill={C.ink} />
					<path d="M 950 478 L 970 478" stroke={C.ink} strokeWidth={4} />
					<rect x={900} y={500} width={120} height={70} fill={C.blue} />
					<text x={960} y={620} fontFamily={FONT.paint} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
						ADAM RAHMAN
					</text>
					<text x={960} y={670} fontFamily={FONT.paint} fontWeight={700} fontSize={26} fill={C.ink} textAnchor="middle">
						LAST SEEN NOV 6 · 1:17 AM
					</text>
					<text x={960} y={720} fontFamily={FONT.paint} fontWeight={700} fontSize={26} fill={C.ink} textAnchor="middle">
						CALL 555-0100
					</text>
				</g>
			</Layer>
		</Stage>
	);
};

export const Aftermath: React.FC = () => (
	<>
		<Shot from="policeFound" to="tvStillOn" name="Police in the empty room">
			<A01Police />
		</Shot>
		<Shot from="noOne" name="Playback (rewind)">
			<A02Rewind />
		</Shot>
		<Shot from="adamRan" to="smiled" name="SPECIAL I – CCTV (fixed camera)">
			<A03CCTV />
		</Shot>
		<Shot from="cutStatic" name="Static">
			<A04Static />
		</Shot>
		<Shot from="neverFound" name="Missing poster">
			<A05Missing />
		</Shot>
	</>
);

