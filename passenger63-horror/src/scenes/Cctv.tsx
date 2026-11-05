// 12. CCTV EVIDENCE - Emma beside an empty seat. ONE frame: Daniel, and the old
//     woman behind him with both hands on his shoulders. (Pause on it.)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Emma} from '../components/characters/Cast';
import {PALETTES} from '../components/characters/Cast';
import {CrowdHead, PassengerCabin, seatPos} from '../components/environments/Interior';
import {CCTVOverlay} from '../components/evidence/CCTV';
import {PoliceCaseFile} from '../components/evidence/Documents';
import {Evidence} from '../components/fx/Fx';
import {clamp, fmtClock, lerpF} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {Cam, Shots, Stage, Svg} from '../utils/scene';

type EmmaAct = 'talk' | 'laugh' | 'rest' | 'still';

const ROW = 1;
const SIDE = 1 as const;

/** Fixed, absolutely static cabin camera 04. */
const CabinCam: React.FC<{f: number; emma: EmmaAct; daniel?: boolean; hands?: boolean}> = ({f, emma, daniel = false, hands = false}) => {
	const e = seatPos(ROW, SIDE, 1);
	const dn = seatPos(ROW, SIDE, 0);
	const sc = e.s;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Cam f={0} d={1} from={{z: 2.5, cx: (e.x + dn.x) / 2 + 10, cy: e.y - 75}}>
				<Svg>
					<PassengerCabin
						f={0}
						facing="aft"
						empty={[`${ROW}:${SIDE}:0`, `${ROW}:${SIDE}:2`, `${ROW + 1}:${SIDE}:0`, `${ROW + 1}:${SIDE}:1`, `${ROW}:-1:2`]}
						special={[
							{
								row: ROW,
								side: SIDE,
								col: 1,
								render: ({x, y, s}) => (
									<g transform={`rotate(${emma === 'rest' ? -16 : 0} ${x} ${y})`}>
										<CrowdHead
											x={x - (emma === 'rest' ? 20 * s : 0)}
											y={y - 32 * s}
											s={s * 1.05}
											id={38}
											f={0}
											skin={PALETTES.emma.skin}
											shirt={PALETTES.emma.shirt}
											hair={PALETTES.emma.hair}
											look={-0.8}
											mouth={emma === 'talk' ? (Math.floor(f / 4) % 2 ? 'o' : 'flat') : emma === 'laugh' ? 'smile' : 'flat'}
										/>
									</g>
								),
							},
							...(daniel || hands
								? [
										{
											row: ROW,
											side: SIDE,
											col: 0,
											render: ({x, y, s}: {x: number; y: number; s: number}) => (
												<g>
													{daniel ? (
														<g>
															{/* the old woman, standing behind his seat */}
															<path d={`M${x - 60 * s},${y - 150 * s} Q${x},${y - 175 * s} ${x + 60 * s},${y - 150 * s}`} fill="#0e0e10" stroke="#111" strokeWidth={4 * s} />
															<circle cx={x} cy={y - 205 * s} r={30 * s} fill="#e6e1d8" stroke="#111" strokeWidth={5 * s} />
															<circle cx={x} cy={y - 240 * s} r={12 * s} fill="#b5b5b2" stroke="#111" strokeWidth={3 * s} />
															<circle cx={x - 10 * s} cy={y - 207 * s} r={4 * s} fill="#6f777c" />
															<circle cx={x + 10 * s} cy={y - 207 * s} r={4 * s} fill="#6f777c" />
															<path d={`M${x - 8 * s},${y - 190 * s} Q${x},${y - 186 * s} ${x + 8 * s},${y - 190 * s}`} stroke="#111" strokeWidth={2.5 * s} fill="none" />
															<CrowdHead x={x} y={y - 32 * s} s={s * 1.05} id={37} f={0} skin={PALETTES.daniel.skin} shirt={PALETTES.daniel.shirt} hair={PALETTES.daniel.hair} look={0} mouth="flat" />
														</g>
													) : null}
													{/* both hands on his shoulders (on the frame before: just two faint hands on the seat) */}
													<g opacity={daniel ? 1 : 0.28}>
														<path d={`M${x - 50 * s},${y - 150 * s} L${x - 46 * s},${y - 40 * s}`} stroke="#0e0e10" strokeWidth={14 * s} />
														<path d={`M${x + 50 * s},${y - 150 * s} L${x + 46 * s},${y - 40 * s}`} stroke="#0e0e10" strokeWidth={14 * s} />
														<ellipse cx={x - 44 * s} cy={y - 36 * s} rx={14 * s} ry={10 * s} fill="#e6e1d8" stroke="#111" strokeWidth={3 * s} />
														<ellipse cx={x + 44 * s} cy={y - 36 * s} rx={14 * s} ry={10 * s} fill="#e6e1d8" stroke="#111" strokeWidth={3 * s} />
													</g>
												</g>
											),
										},
									]
								: []),
						]}
					/>
				</Svg>
			</Cam>
		</AbsoluteFill>
	);
};

const T0 = 23 * 3600 + 31 * 60 + 5; // 23:31:05
const GLITCH = 17 * 60 + 32; // 00:17:32
const FRAME_NO = 31562;

export const Cctv: React.FC = () => (
	<Shots
		shots={[
			{
				at: 0,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#0d1117', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui}}>
						<div style={{width: 1300, background: '#151c27', border: '2px solid #2b3b52', borderRadius: 12, padding: 50, color: '#cfe0f5'}}>
							<div style={{fontSize: 26, color: '#7f97b6', fontWeight: 700, letterSpacing: 3}}>PORT MASON POLICE SERVICE · DIGITAL EVIDENCE</div>
							<div style={{fontSize: 52, fontWeight: 800, marginTop: 20}}>ITEM 7 · CCTV EXPORT</div>
							<div style={{fontSize: 34, marginTop: 20, fontFamily: FONT.mono}}>NORTH STAR 8 · CABIN CAMERA 04</div>
							<div style={{fontSize: 34, marginTop: 8, fontFamily: FONT.mono}}>23:28:00 → 01:04:59 · 15 fps</div>
							<div style={{marginTop: 34, height: 14, background: '#22324a', borderRadius: 7, overflow: 'hidden'}}>
								<div style={{width: `${clamp(f / d) * 100}%`, height: '100%', background: '#4f8fe0'}} />
							</div>
						</div>
					</AbsoluteFill>
				),
			},
			// For most of the crossing... Emma sitting beside an empty seat. (fast forward)
			{
				at: 'narrator_226_most',
				render: ({f, d}) => {
					const t = T0 + lerpF(f, 0, d, 0, 18 * 60);
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(t)} speed="▶▶ x32">
							<CabinCam f={f} emma={Math.floor(f / 20) % 2 ? 'talk' : 'still'} />
						</CCTVOverlay>
					);
				},
			},
			// Talking. Laughing. Resting her head against nothing.
			{
				at: 'narrator_227_talking',
				render: ({f, d}) => {
					const k = Math.min(2, Math.floor((f / d) * 3));
					const t = T0 + 18 * 60 + lerpF(f, 0, d, 0, 25 * 60);
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(t % 86400)} speed="▶▶ x32">
							<CabinCam f={f} emma={(['talk', 'laugh', 'rest'] as EmmaAct[])[k]} />
						</CCTVOverlay>
					);
				},
			},
			// At 12:17 AM... the footage distorted. (real time)
			{
				at: 'narrator_228_1217',
				render: ({f, d}) => {
					const t = GLITCH - Math.max(1, Math.round((d - f) / 30) + 1);
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(t)} speed="▶ x1">
							<CabinCam f={f} emma="rest" />
						</CCTVOverlay>
					);
				},
			},
			// I. THE ONE FRAME - brief digital glitch, a single frame with Daniel + the old woman
			{
				at: 'cctv_glitch',
				render: ({f}) => {
					const ONE = 6; // exactly one video frame
					const before = f === ONE - 1;
					const glitch = f >= 2 && f <= 11 ? 1 - Math.abs(f - ONE) / 8 : 0;
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} speed="▶ x1" glitch={f === ONE ? 0.15 : glitch}>
							<CabinCam f={f} emma="rest" daniel={f === ONE} hands={before} />
						</CCTVOverlay>
					);
				},
			},
			// One frame. Just one. (paused)
			{
				at: 'narrator_229_one_frame',
				render: ({f}) => (
					<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} paused frameNo={FRAME_NO + 3}>
						<CabinCam f={0} emma="rest" />
					</CCTVOverlay>
				),
			},
			// investigators step back frame by frame
			{
				at: 'cctv_scrub',
				render: ({f, d}) => {
					const step = Math.min(3, Math.floor((f / d) * 4));
					const no = FRAME_NO + 3 - step;
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} paused frameNo={no}>
							<CabinCam f={0} emma="rest" daniel={no === FRAME_NO} hands={false} />
						</CCTVOverlay>
					);
				},
			},
			// Daniel appeared beside her. Looking directly into the camera.
			{
				at: 'narrator_230_appeared',
				render: ({f, d}) => (
					<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} paused frameNo={FRAME_NO}>
						<Cam f={f} d={d} from={{z: 1.0}} to={{z: 1.25, cx: 1000, cy: 470}}>
							<CabinCam f={0} emma="rest" daniel />
						</Cam>
					</CCTVOverlay>
				),
			},
			// Behind his seat... the old woman, both hands on his shoulders.
			{
				at: 'narrator_231_behind',
				render: ({f, d}) => (
					<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} paused frameNo={FRAME_NO}>
						<Cam f={f} d={d} from={{z: 1.25, cx: 1000, cy: 470}} to={{z: 1.9, cx: 960, cy: 420}}>
							<CabinCam f={0} emma="rest" daniel />
						</Cam>
					</CCTVOverlay>
				),
			},
			// The next frame... he was gone again.
			{
				at: 'narrator_232_next_frame',
				render: ({f, d}) => {
					const next = f > d * 0.55;
					return (
						<CCTVOverlay f={f} timestamp={fmtClock(GLITCH)} paused frameNo={next ? FRAME_NO + 1 : FRAME_NO}>
							<CabinCam f={0} emma="rest" daniel={!next} hands={false} />
						</CCTVOverlay>
					);
				},
			},
			{at: 'narrator_233_never', render: ({f, d}) => <Evidence f={f} title="CASE FILE" lines={['UNRESOLVED']}><PoliceCaseFile f={f} stamp="UNRESOLVED" stampAt={Math.round(d * 0.45)} /></Evidence>},
			// The ferry company replaced the camera system.
			{
				at: 'narrator_234_replaced',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} bg="#b9bfc7">
						<rect x={-200} y={-200} width={2400} height={1600} fill="#b9bfc7" />
						<rect x={760} y={200} width={400} height={60} fill="#555" stroke="#111" strokeWidth={8} />
						<path d="M860,260 L1060,260 L1100,420 L820,420 Z" fill="#f2f2f2" stroke="#111" strokeWidth={10} />
						<circle cx={960} cy={400} r={70} fill="#111" stroke="#333" strokeWidth={14} />
						<circle cx={960} cy={400} r={22} fill="#2a4a7a" />
						<rect x={1080} y={300} width={140} height={60} fill="#ffd34d" stroke="#111" strokeWidth={6} transform="rotate(12 1150 330)" />
						<text x={1150} y={342} textAnchor="middle" fontFamily={FONT.hand} fontSize={40} transform="rotate(12 1150 330)">
							NEW
						</text>
					</Stage>
				),
			},
			// The crew refused to work overnight crossings.
			{
				at: 'narrator_235_refused',
				render: ({f}) => (
					<AbsoluteFill style={{background: '#0a0a0c', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{width: 1650, background: '#111', border: '14px solid #2a2a2e', borderRadius: 14, padding: 30, fontFamily: FONT.mono}}>
							<div style={{color: '#ffcc33', fontSize: 40, letterSpacing: 6, marginBottom: 20}}>BELL ISLAND · DEPARTURES</div>
							{[
								['21:05', 'PORT MASON', 'NORTH STAR 5', 'ON TIME'],
								['23:28', 'PORT MASON', 'NORTH STAR 8', 'CANCELLED'],
							].map((r, i) => (
								<div key={i} style={{display: 'grid', gridTemplateColumns: '180px 1fr 380px 300px', padding: '14px 0', borderTop: '2px solid #222', fontSize: 46, color: '#ffcc33'}}>
									<div>{r[0]}</div>
									<div>{r[1]}</div>
									<div>{r[2]}</div>
									<div style={{color: r[3] === 'CANCELLED' ? '#ff4d4d' : '#7fe07f', opacity: r[3] === 'CANCELLED' && Math.floor(f / 15) % 2 ? 0.6 : 1}}>{r[3]}</div>
								</div>
							))}
						</div>
					</AbsoluteFill>
				),
			},
			// Emma stopped taking ferries entirely.
			{
				at: 'narrator_236_stopped',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.06}} bg="#c9cdd2">
						<rect x={-200} y={-200} width={2400} height={1600} fill="#c9cdd2" />
						<rect x={460} y={140} width={1000} height={620} fill="#9fb8cf" stroke="#111" strokeWidth={14} />
						<rect x={460} y={520} width={1000} height={240} fill="#6d8fb0" />
						<rect x={1180} y={505} width={60} height={14} fill="#f4f4f2" />
						<line x1={960} y1={140} x2={960} y2={760} stroke="#111" strokeWidth={12} />
						<Emma x={960} y={1220} s={1.6} frame={f} back />
					</Stage>
				),
			},
		]}
	/>
);
