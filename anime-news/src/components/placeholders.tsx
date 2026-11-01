/**
 * TEMPORARY PLACEHOLDER PLATES — animated, code-drawn anime-style stand-ins,
 * NOT the final commissioned/generated artwork.
 *
 * Drawn in Japanese anime conventions: painted backgrounds without outlines
 * (gradient skies, sculpted cumulus, glints on water, god rays), characters with
 * thin lineart, layered eyes, clumped hair with shine and two-tone cel shading.
 * Each plate keeps the composition/anchors/layer split from src/data/assets.json
 * so camera moves keep working when the real illustration is dropped in.
 * The real public figure (A03/A05) is only a backlit silhouette — no likeness.
 */
import React from 'react';
import {random} from 'remotion';
import {Analyst, CrowdPerson, Evacuee} from './anime/characters';
import {Cumulus, GodRays, LensFlare, Sparkle, WaterGlints, range} from './anime/paint';
import {breathe} from './fx';
import {arrival, capitol, corridor, knesset, policeLights, polling, servers} from './plates2';
import {C} from '../lib/theme';

export type LayerSpec = {depth: number; node: (frame: number) => React.ReactNode};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{children}
	</svg>
);

const LINE = '#2a1a1c';
const wrap = (v: number, m: number) => ((v % m) + m) % m;

const gull = (x: number, y: number, s: number, flap: number, key: string, color = '#2a1c33') => {
	const w = 18 * s;
	const lift = Math.sin(flap) * 9 * s;
	return <path key={key} d={`M${x - w},${y - lift} Q${x - w / 2},${y - 6 * s - lift / 2} ${x},${y} Q${x + w / 2},${y - 6 * s - lift / 2} ${x + w},${y - lift}`} stroke={color} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
};

// ============================================================ A01 Gulf (anime dusk)
const gulf: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a01sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#15183f" />
						<stop offset="0.22" stopColor="#3b2a63" />
						<stop offset="0.36" stopColor="#9a4470" />
						<stop offset="0.45" stopColor="#ef7f52" />
						<stop offset="0.515" stopColor="#ffd890" />
						<stop offset="1" stopColor="#ffd890" />
					</linearGradient>
					<radialGradient id="a01sun" cx="1380" cy="548" r="560" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff2c8" stopOpacity="1" />
						<stop offset="0.12" stopColor="#ffc777" stopOpacity="0.75" />
						<stop offset="0.45" stopColor="#ff8a5c" stopOpacity="0.25" />
						<stop offset="1" stopColor="#ff8a5c" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a01sky)" />
				{range(14).map((i) => (
					<Sparkle key={i} x={random(`st${i}`) * 1920} y={20 + random(`sy${i}`) * 200} r={3 + random(`sr${i}`) * 4} phase={f * 0.08 + i * 2.1} color="#fff6e0" />
				))}
				{/* high cirrus streaks */}
				{range(6).map((i) => {
					const x = wrap(random(`ci${i}`) * 2400 - f * 0.25, 2400) - 300;
					return <ellipse key={i} cx={x} cy={150 + i * 34} rx={260 + i * 30} ry={4 + (i % 3)} fill="#ffb3a0" opacity={0.35} />;
				})}
				<rect width="1920" height="1080" fill="url(#a01sun)" opacity={0.95 + 0.05 * Math.sin(f * 0.05)} />
				{/* sculpted cumulus, lit from the low sun */}
				<g transform={`translate(${-f * 0.18},0)`}>
					<Cumulus id="g1" x={1560} y={430} w={760} h={250} shadow="#6b3d6e" lit="#f08a6c" rim="#ffd8a6" light={[0.25, 0.75]} puffs={10} />
					<Cumulus id="g2" x={560} y={360} w={640} h={190} shadow="#5a3566" lit="#d9726f" rim="#ffc49a" light={[0.5, 0.7]} puffs={8} />
					<Cumulus id="g3" x={980} y={470} w={420} h={90} shadow="#80456a" lit="#f59a72" rim="#ffe0b0" light={[0.4, 0.8]} puffs={7} />
					<Cumulus id="g4" x={180} y={500} w={360} h={70} shadow="#7d4468" lit="#ee9070" rim="#ffd2a8" light={[0.6, 0.6]} puffs={6} />
				</g>
				<circle cx="1380" cy="552" r={40 + Math.sin(f * 0.07) * 1.5} fill="#fff6dc" />
				{/* distant shore and cranes */}
				<path d="M0,548 C120,538 240,544 360,536 C480,530 600,546 760,552 L760,560 L0,560 Z" fill="#3a2440" />
				{[280, 330, 395].map((x, i) => (
					<g key={x} stroke="#3a2440" strokeWidth="4">
						<line x1={x} y1={540} x2={x} y2={486 - i * 6} />
						<line x1={x - 32} y1={490 - i * 6} x2={x + 48} y2={490 - i * 6} />
					</g>
				))}
				{range(4).map((i) => gull(wrap(f * (1.1 + i * 0.25) + i * 420, 2300) - 200, 290 + i * 36 + Math.sin(f * 0.03 + i) * 12, 0.85 + i * 0.15, f * 0.32 + i * 1.7, `g${i}`))}
			</Svg>
		),
	},
	{
		depth: 0.35,
		node: (f) => {
			const sx = -f * 0.09;
			const cols = [
				['#a3483a', '#6a2b2e'],
				['#3f6a8a', '#2a3e5e'],
				['#c78a3e', '#7a4a2e'],
				['#5b7a4a', '#34482e'],
				['#8a8fa8', '#4e526a'],
			];
			return (
				<Svg>
					<g transform={`translate(${sx},${Math.sin(f * 0.05) * 1.2})`}>
						{range(12).map((i) => {
							const age = ((f + i * 11) % 130) / 130;
							return <circle key={i} cx={1046 - age * 170} cy={420 - age * 74} r={6 + age * 28} fill="#7a5a78" opacity={(1 - age) * 0.5} />;
						})}
						{/* accommodation block: white superstructure, warm-lit face, glowing windows */}
						<path d="M1010,522 L1010,440 L1078,440 L1084,522 Z" fill="#cfc4d4" />
						<path d="M1050,440 L1078,440 L1084,522 L1058,522 Z" fill="#ffc890" />
						<path d="M1010,440 L1030,440 L1030,522 L1010,522 Z" fill="#8a7c98" />
						{range(4).map((i) => (
							<rect key={i} x={1016 + i * 15} y={454} width={9} height={6} fill="#fff1b8" opacity={0.75 + 0.25 * Math.sin(f * 0.2 + i * 2)} />
						))}
						<rect x="1034" y="418" width="18" height="24" fill="#3a2a40" />
						<rect x="1034" y="418" width="18" height="5" fill="#d0473a" />
						<line x1="1040" y1="440" x2="1040" y2="400" stroke="#3a2a40" strokeWidth="4" />
						<circle cx="1040" cy="398" r="3.4" fill="#fff9e8" />
						<circle cx="1452" cy="510" r="3.6" fill="#ff3b30" opacity={(f % 36) < 18 ? 1 : 0.25} />
						{range(9).map((i) => {
							const x = 1094 + i * 38;
							const tiers = 3 - (i === 0 || i === 8 ? 1 : 0);
							return range(tiers).map((t) => {
								const [lit, sh] = cols[(i * 3 + t) % cols.length];
								return (
									<g key={`${i}-${t}`}>
										<rect x={x} y={506 - t * 17} width={36} height={16} fill={lit} />
										<rect x={x} y={506 - t * 17} width={12} height={16} fill={sh} />
										<rect x={x} y={506 - t * 17} width={36} height={2.5} fill="#ffe0a8" opacity="0.8" />
									</g>
								);
							});
						})}
						{/* hull: navy with a warm lit sheer line */}
						<path d="M992,522 L1452,522 L1490,526 L1462,560 L1004,560 Z" fill="#1f2340" />
						<path d="M992,522 L1452,522 L1490,526 L1486,532 L996,530 Z" fill="#ffb27a" opacity="0.85" />
						<path d="M1004,548 L1470,548 L1462,560 L1004,560 Z" fill="#7a2a36" />
						<path d={`M1462,558 q22,${-4 - Math.sin(f * 0.3) * 2} 46,2`} stroke="#ffe2b8" strokeWidth="2.4" fill="none" opacity="0.7" />
					</g>
				</Svg>
			);
		},
	},
	{
		depth: 0.6,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a01sea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#f2a57a" />
						<stop offset="0.07" stopColor="#8a5a7c" />
						<stop offset="0.3" stopColor="#3a3a6a" />
						<stop offset="0.7" stopColor="#1a2346" />
						<stop offset="1" stopColor="#0c1230" />
					</linearGradient>
					<linearGradient id="a01col" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff0c0" stopOpacity="0.95" />
						<stop offset="1" stopColor="#ffb070" stopOpacity="0" />
					</linearGradient>
				</defs>
				<rect x="0" y="556" width="1920" height="524" fill="url(#a01sea)" />
				{/* golden sun column on the water */}
				<path d="M1340,558 L1420,558 L1560,1080 L1200,1080 Z" fill="url(#a01col)" opacity="0.35" />
				{range(30).map((i) => {
					const y = 566 + i * i * 0.4 + i * 4;
					const w = (70 - i * 1.6) * (0.55 + 0.45 * Math.sin(f * 0.35 + i * 1.9));
					return <rect key={i} x={1380 - w / 2 + Math.sin(f * 0.12 + i) * 8} y={y} width={Math.max(6, w)} height={2.5 + i * 0.15} rx={1.5} fill="#ffe9b0" opacity={0.85 - i * 0.022} />;
				})}
				{/* water layer 1: slow swell highlights */}
				{range(8).map((i) => {
					const y = 600 + i * 58 + Math.sin(f * 0.04 + i) * 10;
					return <rect key={`s${i}`} x={0} y={y} width={1920} height={3 + i * 1.5} fill="#8a7ab8" opacity={0.12 + 0.08 * Math.sin(f * 0.05 + i * 1.3)} />;
				})}
				{/* water layer 2: ripples, far slow / near fast */}
				{range(80).map((i) => {
					const y = 566 + Math.pow(random(`wy${i}`), 1.8) * 500;
					const d = (y - 556) / 524;
					const w = 30 + d * 220 * random(`ww${i}`);
					const x = wrap(random(`wx${i}`) * 2200 + f * (0.35 + d * 1.8), 2200) - 140;
					return <rect key={i} x={x} y={y} width={w} height={1.2 + d * 3} rx={1} fill={i % 4 ? '#7d8fd0' : '#ffc79a'} opacity={0.18 + d * 0.3} />;
				})}
				{/* anime sparkle glints */}
				<WaterGlints frame={f} seed="sg1" count={26} x0={1220} x1={1540} y0={570} y1={820} size={9} color="#fff6d8" />
				<WaterGlints frame={f} seed="sg2" count={18} x0={0} x1={1920} y0={600} y1={1000} size={6} color="#e8eaff" />
			</Svg>
		),
	},
	{
		depth: 1,
		node: (f) => {
			const ph = f % 48;
			const flash = 0.62 + 0.55 * Math.exp(-ph / 7);
			const bob = Math.sin(f * 0.07) * 3;
			const lift = Math.sin(f * 0.07 + 1.1) * 5;
			return (
				<Svg>
					<defs>
						<radialGradient id="a01lamp" cx="460" cy="690" r="170" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ff6a5a" stopOpacity="1" />
							<stop offset="0.2" stopColor="#ff2a3a" stopOpacity="0.55" />
							<stop offset="1" stopColor="#ff2a3a" stopOpacity="0" />
						</radialGradient>
					</defs>
					<g transform={`translate(0,${lift}) rotate(${bob},460,800)`}>
						{/* red channel buoy, cel shaded with a warm rim */}
						<path d="M420,800 L500,800 L488,722 L432,722 Z" fill="#b8262f" stroke={LINE} strokeWidth="2.6" />
						<path d="M420,800 L446,800 L440,722 L432,722 Z" fill="#6a1320" />
						<path d="M482,722 L488,722 L500,800 L494,800 Z" fill="#ffb07a" />
						<rect x="426" y="760" width="70" height="10" fill="#f0e6e0" opacity="0.9" />
						<path d="M440,722 L480,722 L472,700 L448,700 Z" fill="#2a1a2a" stroke={LINE} strokeWidth="2" />
						<line x1="448" y1="700" x2="460" y2="676" stroke="#2a1a2a" strokeWidth="5" />
						<line x1="472" y1="700" x2="460" y2="676" stroke="#2a1a2a" strokeWidth="5" />
						<circle cx="460" cy="690" r={170 * (0.85 + 0.25 * flash)} fill="url(#a01lamp)" opacity={Math.min(1, flash)} />
						<Sparkle x={460} y={690} r={70 * flash} phase={Math.PI / 2} color="#ffd8d0" />
						<circle cx="460" cy="690" r="10" fill="#fff4f0" />
						<path d="M418,800 L502,800 L508,808 L412,808 Z" fill="#2a2a5a" opacity="0.8" />
					</g>
					{range(24).map((i) => {
						const y = 812 + i * 9.5 + lift * 0.5;
						const w = (8 + i * 2.2) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.3 + i * 1.3)));
						return <rect key={i} x={460 - w / 2 + Math.sin(f * 0.17 + i * 0.7) * (3 + i * 0.6)} y={y} width={w} height={3.5} rx={1.5} fill="#ff4a4a" opacity={Math.min(1, (0.8 - i * 0.028) * flash)} />;
					})}
					{range(3).map((k) => {
						const off = ((f * (0.9 + k * 0.6)) % 320) - 320;
						const base = 960 + k * 44 + Math.sin(f * 0.06 + k) * 6;
						const pts = range(9)
							.map((j) => {
								const x = off + j * 320;
								return `${x},${base} ${x + 120},${base - 26 + k * 4} ${x + 200},${base - 8}`;
							})
							.join(' ');
						return (
							<g key={k}>
								<polygon points={`${pts} 2600,1080 -400,1080`} fill={k === 2 ? '#070a1e' : '#0e1430'} opacity={0.95} />
								<polyline points={pts} fill="none" stroke="#9aa6ff" strokeWidth="2" opacity={0.35} />
							</g>
						);
					})}
					{flash > 0.9 ? <LensFlare x={460} y={690} frame={f} strength={(flash - 0.9) * 2.5} /> : null}
				</Svg>
			);
		},
	},
];

// =================================== backlit silhouette portrait (A03 / A05)
const silhouette = (glow: string, key: string): LayerSpec[] => [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<radialGradient id={`bl${key}`} cx="1180" cy="330" r="780" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff2cf" />
						<stop offset="0.16" stopColor="#ffc06a" />
						<stop offset="0.42" stopColor={glow} />
						<stop offset="0.75" stopColor="#3a1c2a" />
						<stop offset="1" stopColor="#120a14" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill={`url(#bl${key})`} />
				<GodRays id={`sr${key}`} x={1180} y={330} angle={0} spread={Math.PI * 2} length={1500} count={18} color="#fff0c8" opacity={0.35} frame={f} />
				{range(16).map((i) => (
					<Sparkle key={i} x={random(`ps${key}${i}`) * 1920} y={random(`py${key}${i}`) * 1080} r={4 + random(`pr${i}`) * 7} phase={f * 0.1 + i * 1.7} color="#fff3d0" />
				))}
			</Svg>
		),
	},
	{
		depth: 1,
		node: (f) => {
			const br = breathe(f, 0, 110) * 3;
			const turn = Math.sin(f * 0.018) * 1.6;
			const rim = 0.85 + 0.15 * Math.sin(f * 0.23) * Math.sin(f * 0.07);
			return (
				<Svg>
					<g transform={`translate(0,${br})`}>
						<path d="M600,1080 C620,940 660,860 760,790 C820,750 880,712 960,700 L1110,690 L1260,700 C1340,712 1400,750 1460,790 C1560,860 1600,940 1620,1080 Z" fill="#0e0a12" stroke={LINE} strokeWidth="3" />
						{/* lapels / tie read only as rim-lit edges */}
						<path d="M1050,700 L1110,860 L1170,700" stroke="#3a2a32" strokeWidth="6" fill="none" />
						<path d="M1260,700 C1340,712 1400,750 1460,790 C1560,860 1600,940 1620,1080" stroke={C.amber} strokeWidth={8} fill="none" opacity={rim} />
						<path d="M1270,704 C1340,716 1396,752 1450,792" stroke="#fff3d6" strokeWidth={3} fill="none" opacity={0.7 * rim} />
					</g>
					<g transform={`rotate(${turn},1110,650)`}>
						<path d="M1046,560 L1172,560 L1182,700 L1038,700 Z" fill="#0e0a12" />
						<path d="M985,250 C1010,190 1070,170 1130,172 C1200,176 1250,214 1262,300 C1270,370 1252,450 1214,520 C1186,570 1150,600 1110,602 C1070,598 1030,560 1000,480 C976,410 966,320 985,250 Z" fill="#0e0a12" stroke={LINE} strokeWidth="3" />
						<path d="M970,290 C980,190 1060,140 1140,140 C1220,142 1280,190 1286,262 C1270,232 1240,200 1190,190 C1120,180 1040,200 994,300 Z" fill="#08060a" />
						<path d="M1140,140 C1220,142 1280,190 1286,262 C1290,330 1270,420 1246,480 C1228,520 1210,550 1180,574" stroke={C.amber} strokeWidth={9} fill="none" strokeLinecap="round" opacity={rim} />
						<path d="M1190,150 C1240,166 1276,204 1284,250" stroke="#fff6dc" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85 * rim} />
					</g>
				</Svg>
			);
		},
	},
];

// ============================================== A15 parliament chamber (anime interior)
const chamber: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a15wall" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2a1620" />
						<stop offset="0.5" stopColor="#6a3426" />
						<stop offset="1" stopColor="#2a1410" />
					</linearGradient>
					<linearGradient id="a15win" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff6d8" />
						<stop offset="1" stopColor="#ffc56a" />
					</linearGradient>
					<radialGradient id="a15pool" cx="960" cy="760" r="460" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#ffb85a" stopOpacity="0.6" />
						<stop offset="1" stopColor="#ffb85a" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a15wall)" />
				{/* tall windows and god rays */}
				{[300, 960, 1620].map((x) => (
					<g key={x}>
						<rect x={x - 46} y={30} width={92} height={250} rx={46} fill="url(#a15win)" />
						<rect x={x - 3} y={30} width={6} height={250} fill="#c08a4a" />
						<rect x={x - 46} y={150} width={92} height={5} fill="#c08a4a" />
					</g>
				))}
				{[300, 960, 1620].map((x, i) => (
					<GodRays key={x} id={`cr${i}`} x={x} y={160} angle={Math.PI / 2 + (i - 1) * 0.18} spread={0.5} length={900} count={6} color="#ffd88a" opacity={0.42} frame={f} />
				))}
				{/* three separate desk groups divided by aisles */}
				{[
					[90, 640],
					[720, 1200],
					[1280, 1830],
				].map(([x0, x1], g) =>
					range(3).map((r) => {
						const y = 380 + r * 62;
						const bow = 26 + r * 6;
						return (
							<g key={`${g}-${r}`}>
								{range(9).map((k) => {
									const t = (k + 0.5) / 9;
									const cx = x0 - r * 18 + t * (x1 - x0 + r * 36);
									const cy = y + 2 + bow * 4 * t * (1 - t);
									return (
										<g key={k}>
											<rect x={cx - 15} y={cy - 12} width={30} height={34} rx={8} fill="#7a1f24" />
											<rect x={cx - 15} y={cy - 12} width={10} height={34} rx={5} fill="#4a1016" />
											<rect x={cx + 6} y={cy - 10} width={4} height={26} rx={2} fill="#ff9a7a" opacity="0.6" />
										</g>
									);
								})}
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24} L${x1 + r * 18},${y + 44} Q${(x0 + x1) / 2},${y + bow + 44} ${x0 - r * 18},${y + 44} Z`} fill="#6b3b22" />
								<path d={`M${x0 - r * 18},${y + 34} Q${(x0 + x1) / 2},${y + bow + 34} ${x1 + r * 18},${y + 34} L${x1 + r * 18},${y + 44} Q${(x0 + x1) / 2},${y + bow + 44} ${x0 - r * 18},${y + 44} Z`} fill="#3a1d12" />
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24}`} stroke="#ffcf8a" strokeWidth="3" fill="none" opacity={0.75 + 0.25 * Math.sin(f * 0.05 + g + r)} />
							</g>
						);
					}),
				)}
				{/* polished floor with reflections */}
				<rect x="0" y="600" width="1920" height="480" fill="#24120e" />
				{range(10).map((i) => (
					<rect key={i} x={0} y={610 + i * 46} width={1920} height={2} fill="#ffb86a" opacity={0.05 + i * 0.006} />
				))}
				<rect width="1920" height="1080" fill="url(#a15pool)" opacity={0.85 + 0.15 * Math.sin(f * 0.09)} />
			</Svg>
		),
	},
	{
		depth: 0.9,
		node: (f) => {
			const creak = Math.sin(f * 0.03) * 0.8;
			return (
				<Svg>
					<ellipse cx="960" cy="900" rx="210" ry="22" fill="#000" opacity="0.4" />
					<g transform={`rotate(${creak},960,840)`}>
						{/* tufted leather chair, cel shaded */}
						<rect x="846" y="460" width="228" height="312" rx="40" fill="#7a1f24" stroke={LINE} strokeWidth="3" />
						<path d="M846,500 Q846,460 886,460 L930,460 Q900,600 912,772 L886,772 Q846,772 846,732 Z" fill="#4a1016" />
						{range(3).map((r) =>
							range(3).map((c) => <circle key={`${r}${c}`} cx={900 + c * 50} cy={530 + r * 70} r="4" fill="#3a0c10" />),
						)}
						<path d="M1062,500 Q1068,620 1060,750" stroke="#ffb27a" strokeWidth="6" fill="none" strokeLinecap="round" />
						<path d={`M${990 + Math.sin(f * 0.05) * 20},486 q10,0 6,40`} stroke="#fff0dc" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
						<rect x="790" y="640" width="64" height="130" rx="22" fill="#5a1418" stroke={LINE} strokeWidth="3" />
						<rect x="1066" y="640" width="64" height="130" rx="22" fill="#7a1f24" stroke={LINE} strokeWidth="3" />
						<rect x="1112" y="652" width="8" height="100" rx="4" fill="#ffb27a" opacity="0.8" />
						<rect x="816" y="740" width="288" height="58" rx="18" fill="#6a1a20" stroke={LINE} strokeWidth="3" />
						<rect x="816" y="740" width="288" height="8" rx="4" fill="#ff9a7a" opacity="0.7" />
					</g>
					<rect x="950" y="798" width="20" height="90" fill="#9a9aaa" stroke={LINE} strokeWidth="2" />
					<rect x="964" y="798" width="4" height="90" fill="#fff" opacity="0.6" />
					<path d="M870,888 L1050,888 L1084,906 L836,906 Z" fill="#6a6a7a" stroke={LINE} strokeWidth="2" />
				</Svg>
			);
		},
	},
];

// ================================================ A06 bus at dawn (anime)
const bus: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a06sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#4a5f94" />
						<stop offset="0.24" stopColor="#8fa2cc" />
						<stop offset="0.37" stopColor="#e8c6c4" />
						<stop offset="0.43" stopColor="#ffd8a6" />
						<stop offset="0.44" stopColor="#7d8fb8" />
						<stop offset="1" stopColor="#4a5676" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a06sky)" />
				<g transform={`translate(${-f * 0.3},0)`}>
					<Cumulus id="b1" x={1500} y={300} w={520} h={120} shadow="#9a9ac4" lit="#f4d0d4" rim="#fff2e6" light={[0.4, 0.6]} puffs={8} />
					<Cumulus id="b2" x={1860} y={250} w={380} h={90} shadow="#9a9ac4" lit="#f4d0d4" rim="#fff2e6" light={[0.4, 0.6]} puffs={6} />
				</g>
				<circle cx="1560" cy="462" r="60" fill="#fff4dc" opacity="0.55" />
				{/* far hills (slow) */}
				{range(8).map((i) => {
					const x = wrap(1950 - f * 0.8 - i * 300, 2400) - 300;
					return <ellipse key={`h${i}`} cx={x} cy={478} rx={220} ry={34 + (i % 3) * 8} fill="#6a7cab" />;
				})}
				{/* tree line (mid) */}
				{range(34).map((i) => {
					const x = 1950 - wrap(f * 2.2 + i * 64, 2100);
					return (
						<g key={`t${i}`}>
							<path d={`M${x},486 C${x - 14},460 ${x + 4},${430 - (i % 3) * 12} ${x + 22},${436 - (i % 3) * 10} C${x + 40},440 ${x + 48},470 ${x + 40},486 Z`} fill="#3e4f78" />
							<path d={`M${x + 22},${436 - (i % 3) * 10} C${x + 40},440 ${x + 48},470 ${x + 40},486 L${x + 28},486 Z`} fill="#56689a" />
						</g>
					);
				})}
				<path d="M1080,640 L1840,640 L1510,476 L1440,476 Z" fill="#5a6488" />
				{range(4).map((i) => {
					const d = ((f * 2.4 + i * 30) % 120) / 120;
					return <rect key={`l${i}`} x={1474 - d * 30} y={482 + d * 150} width={4 + d * 10} height={6 + d * 22} fill="#f2ead8" opacity={0.75} />;
				})}
				{/* poles and wires passing fast */}
				{range(5).map((i) => {
					const x = 1900 - ((f * 14 + i * 260) % 1300);
					return (
						<g key={i}>
							<rect x={x} y={290} width={12} height={360} fill="#2a3150" />
							<rect x={x + 8} y={290} width={4} height={360} fill="#8fa2cc" />
							<rect x={x - 22} y={306} width={56} height={6} fill="#2a3150" />
						</g>
					);
				})}
				<path d={`M1080,${318 + Math.sin(f * 0.15) * 8} Q1450,${352 + Math.sin(f * 0.15) * 12} 1840,${318 + Math.sin(f * 0.15) * 8}`} stroke="#2a3150" strokeWidth="2" fill="none" />
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: (f) => {
			const sweep = ((f * 9) % 2400) - 400;
			return (
				<Svg>
					<defs>
						<linearGradient id="a06wall" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stopColor="#1e2740" />
							<stop offset="1" stopColor="#2c3a5a" />
						</linearGradient>
						<radialGradient id="a06lamp" cx="420" cy="60" r="900" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ffb86a" stopOpacity="0.4" />
							<stop offset="1" stopColor="#ffb86a" stopOpacity="0" />
						</radialGradient>
					</defs>
					<path d="M0,0 H1920 V1080 H0 Z M1100,140 Q1090,130 1110,130 H1800 Q1820,130 1820,150 V610 Q1820,630 1800,630 H1110 Q1090,630 1090,610 Z" fill="url(#a06wall)" fillRule="evenodd" />
					<rect x="1080" y="120" width="750" height="520" rx="26" fill="none" stroke="#45527a" strokeWidth="22" />
					<rect x="1072" y="112" width="766" height="536" rx="30" fill="none" stroke={LINE} strokeWidth="3" />
					<rect x="1086" y="124" width="740" height="10" rx="5" fill="#a9b8dc" opacity="0.6" />
					<line x1="1455" y1="130" x2="1455" y2="630" stroke="#45527a" strokeWidth="16" />
					{/* glass reflections sliding */}
					<polygon points={`${1150 + ((f * 3) % 700)},140 ${1200 + ((f * 3) % 700)},140 ${1130 + ((f * 3) % 700)},620 ${1080 + ((f * 3) % 700)},620`} fill="#fff" opacity="0.1" />
					<polygon points={`${1230 + ((f * 3) % 700)},140 ${1244 + ((f * 3) % 700)},140 ${1174 + ((f * 3) % 700)},620 ${1160 + ((f * 3) % 700)},620`} fill="#fff" opacity="0.12" />
					{/* seat backs in front, handrail */}
					<path d="M1240,1080 L1290,720 Q1300,690 1340,690 L1660,690 Q1700,690 1704,720 L1760,1080 Z" fill="#2e4470" stroke={LINE} strokeWidth="3" />
					<path d="M1290,720 Q1300,690 1340,690 L1400,690 L1360,1080 L1240,1080 Z" fill="#1e2e52" />
					<path d="M1340,700 L1660,700" stroke="#7d93c8" strokeWidth="4" opacity="0.6" />
					<rect x="1380" y="640" width="14" height="440" fill="#c8d2e8" stroke={LINE} strokeWidth="2" />
					<rect x="1384" y="640" width="4" height="440" fill="#fff" />
					<rect width="1920" height="1080" fill="url(#a06lamp)" opacity={0.9 + 0.1 * Math.sin(f * 0.6) * Math.sin(f * 0.13)} />
					<polygon points={`${sweep},0 ${sweep + 160},0 ${sweep - 200},1080 ${sweep - 360},1080`} fill="#e6eeff" opacity="0.08" />
					<rect x="0" y="40" width="1920" height="12" fill="#151c2e" />
				</Svg>
			);
		},
	},
	{depth: 1, node: (f) => <Svg><Evacuee f={f} /></Svg>},
];

// ============================================= A08 France march (anime daylight)
const march: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a08sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#3a74c8" />
						<stop offset="0.35" stopColor="#7fb0e8" />
						<stop offset="0.6" stopColor="#d6e8f6" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a08sky)" />
				<g transform={`translate(${-f * 0.35},0)`}>
					<Cumulus id="m1" x={980} y={360} w={700} h={260} shadow="#a9b9de" lit="#f4f7ff" rim="#ffffff" light={[0.4, -0.7]} puffs={10} />
					<Cumulus id="m2" x={300} y={260} w={420} h={140} shadow="#a9b9de" lit="#f4f7ff" rim="#ffffff" light={[0.4, -0.7]} puffs={7} />
					<Cumulus id="m3" x={1700} y={300} w={460} h={150} shadow="#a9b9de" lit="#f4f7ff" rim="#ffffff" light={[0.4, -0.7]} puffs={7} />
				</g>
				{/* Haussmann facades: sunlit left, cool shade right */}
				<polygon points="0,40 820,410 820,620 0,830" fill="#ecd8b4" />
				<polygon points="0,40 820,410 820,430 0,92" fill="#6a7896" />
				<polygon points="1920,40 1100,410 1100,620 1920,830" fill="#a49ab8" />
				<polygon points="1920,40 1100,410 1100,430 1920,92" fill="#4a5674" />
				{range(6).map((r) =>
					range(10).map((k) => {
						const t = k / 10;
						const xL = t * 760;
						const yTop = 110 + t * 330 + r * (108 - t * 68);
						const h = 46 - t * 30;
						const w = 40 - t * 26;
						return (
							<g key={`${r}-${k}`}>
								<rect x={xL + 10} y={yTop} width={w} height={h} fill="#5d76a8" />
								<rect x={xL + 10} y={yTop} width={w * 0.35} height={h} fill="#c8dcf6" opacity="0.7" />
								<rect x={xL + 6} y={yTop + h} width={w + 8} height={3} fill="#2a2a34" />
								<rect x={1920 - xL - 10 - w} y={yTop} width={w} height={h} fill="#3e4a6a" />
								<rect x={1920 - xL - 14 - w} y={yTop + h} width={w + 8} height={3} fill="#1e1e28" />
							</g>
						);
					}),
				)}
				{/* plane trees */}
				{[120, 380, 600, 1320, 1540, 1800].map((x, i) => (
					<g key={x}>
						<rect x={x - 6} y={600 - i * 0} width={12} height={120} fill="#5a4636" />
						<circle cx={x} cy={560} r={70 - (i % 3) * 10} fill="#3d6a46" />
						<circle cx={x - 20} cy={540} r={50 - (i % 3) * 8} fill="#5f9a52" />
						<circle cx={x - 30} cy={528} r={24} fill="#a8d06a" opacity="0.8" />
					</g>
				))}
				<polygon points="0,830 820,620 1100,620 1920,830 1920,1080 0,1080" fill="#b8ad9e" />
				<polygon points="900,620 1020,620 1180,1080 740,1080" fill="#a89e90" />
				{range(6).map((i) => gull(wrap(f * 2.2 + i * 40, 2400) - 300, 210 + Math.sin(f * 0.05 + i) * 30 + i * 8, 0.75, f * 0.5 + i, `p${i}`, '#3a3a4a'))}
			</Svg>
		),
	},
	{
		depth: 0.8,
		node: (f) => {
			const advance = f * 0.0009;
			const people = range(150).map((i) => {
				const row = Math.floor(i / 15);
				const depth = Math.min(1.15, row / 9 + advance * (1 + row * 0.1));
				const scale = 0.35 + depth * 1.25;
				const x = ((i % 15) + random(`mx${i}`) * 0.8) * (1920 / 14) - 60 + (row % 2) * 40 + Math.sin(f * 0.05 + i) * 3;
				const y = 600 + Math.pow(depth, 1.3) * 520 + random(`my${i}`) * 20;
				return {i, x, y, scale};
			});
			return (
				<Svg>
					{people.map(({i, x, y, scale}) => {
						const step = Math.abs(Math.sin(f * 0.21 + i * 1.7));
						const bob = -step * 6 * scale;
						const sign = random(`ms${i}`) < 0.16;
						const tilt = Math.sin(f * 0.1 + i) * 4;
						return (
							<g key={i} transform={`translate(${x},${y + bob}) scale(${scale})`}>
								{sign ? (
									<g transform={`rotate(${tilt},0,-40)`}>
										<rect x={-3} y={-150} width={6} height={110} fill="#6a4a32" stroke={LINE} strokeWidth="1.5" />
										<rect x={-44} y={-200} width={88} height={60} rx={3} fill="#fbf6ea" stroke={LINE} strokeWidth="2.2" />
										<rect x={-44} y={-200} width={26} height={60} fill="#d8d0e6" />
									</g>
								) : null}
								<CrowdPerson i={i} />
							</g>
						);
					})}
					{/* pedestrian crossing signal, showing red (match-cut light into the markets chapter) */}
					<rect x="1800" y="400" width="18" height="700" fill="#2a2e3a" stroke={LINE} strokeWidth="2" />
					<rect x="1764" y="290" width="92" height="140" rx="10" fill="#1a1c24" stroke={LINE} strokeWidth="3" />
					<circle cx="1810" cy="330" r="42" fill="#ff2a2a" opacity={0.25 + 0.1 * Math.sin(f * 0.2)} />
					<path d="M1810,306 a7,7 0 1,0 0.1,0 Z M1798,318 L1822,318 L1824,346 L1816,346 L1816,366 L1804,366 L1804,346 L1796,346 Z" fill="#ff4a3a" />
					<rect x="1776" y="384" width="68" height="34" rx="4" fill="#0e1016" />
				</Svg>
			);
		},
	},
];

// ============================================== A11 market analyst (anime night office)
const analyst: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a11night" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0c1230" />
						<stop offset="1" stopColor="#1e1a3a" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="#0b0e1c" />
				{/* window with a night skyline in soft bokeh, seen through blinds */}
				<rect x="0" y="40" width="800" height="600" fill="url(#a11night)" />
				{range(16).map((i) => (
					<rect key={`b${i}`} x={40 + i * 50} y={300 - (i % 4) * 60} width={44} height={340 + (i % 4) * 60} fill="#141a3a" />
				))}
				{range(60).map((i) => (
					<circle
						key={`k${i}`}
						cx={30 + random(`kx${i}`) * 760}
						cy={120 + random(`ky${i}`) * 500}
						r={4 + random(`kr${i}`) * 10}
						fill={['#ffb45c', '#ff6a8a', '#7ab8ff', '#ffe08a'][i % 4]}
						opacity={0.18 + 0.28 * Math.abs(Math.sin(f * (0.02 + random(`ks${i}`) * 0.04) + i))}
					/>
				))}
				{range(22).map((i) => (
					<rect key={i} x={0} y={60 + i * 26} width={800} height={9} fill="#0b0e1c" opacity="0.85" />
				))}
				<rect x="800" y="40" width="20" height="600" fill="#05060c" />
				<rect x="0" y="840" width="1920" height="240" fill="#090a12" />
				<rect x="0" y="836" width="1920" height="6" fill="#ff5a4a" opacity="0.25" />
				{/* coffee cup with rising steam */}
				<path d="M700,790 L770,790 L764,850 L706,850 Z" fill="#e8e2ea" stroke={LINE} strokeWidth="2.6" />
				<path d="M700,790 L722,790 L718,850 L706,850 Z" fill="#a8a2b8" />
				{range(3).map((i) => {
					const a = ((f + i * 25) % 75) / 75;
					return <path key={`st${i}`} d={`M${725 + i * 10},${786 - a * 90} q${12 * Math.sin(f * 0.1 + i)},-15 0,-30`} stroke="#e6e0f0" strokeWidth="3" fill="none" opacity={(1 - a) * 0.4} />;
				})}
			</Svg>
		),
	},
	{
		depth: 0.5,
		node: (f) => {
			const flick = 0.85 + 0.15 * Math.sin(f * 1.3) * Math.sin(f * 0.21);
			return (
				<Svg>
					<defs>
						<linearGradient id="a11screen" x1="0" y1="1" x2="0" y2="0">
							<stop offset="0" stopColor="#9a1422" />
							<stop offset="0.5" stopColor="#3a0a14" />
							<stop offset="1" stopColor="#12060c" />
						</linearGradient>
						<radialGradient id="a11glow" cx="1290" cy="560" r="700" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ff3a3a" stopOpacity="0.35" />
							<stop offset="1" stopColor="#ff3a3a" stopOpacity="0" />
						</radialGradient>
					</defs>
					<rect width="1920" height="1080" fill="url(#a11glow)" opacity={flick} />
					<rect x="846" y="156" width="888" height="618" rx="12" fill="#14141c" stroke={LINE} strokeWidth="3" />
					<rect x="852" y="162" width="876" height="6" rx="3" fill="#6a6a80" />
					<rect x="866" y="176" width="848" height="578" fill="url(#a11screen)" opacity={flick} />
					{/* the analyst's own reflection, mirrored and tinted by the red glow */}
					<clipPath id="a11scr">
						<rect x="866" y="176" width="848" height="578" />
					</clipPath>
					<g clipPath="url(#a11scr)">
						<g opacity={0.3 + 0.04 * Math.sin(f * 0.3)} transform={`translate(${1556 + Math.sin(f * 0.02) * 4},-40) scale(-1,1)`}>
							<Analyst f={f} />
						</g>
						<rect x="866" y="176" width="848" height="578" fill="#ff2a3a" opacity="0.22" style={{mixBlendMode: 'multiply'}} />
					</g>
					{range(48).map((i) => (
						<rect key={i} x="866" y={176 + ((i * 12 + f * 1.5) % 578)} width="848" height="1" fill="#fff" opacity="0.035" />
					))}
					<rect x="866" y={176 + ((f * 4) % 578)} width="848" height="26" fill="#ff6a5a" opacity="0.06" />
					<path d="M880,190 L1000,190 L900,330 Z" fill="#fff" opacity="0.05" />
					<rect x="1260" y="774" width="60" height="70" fill="#1a1a24" />
					<rect x="1180" y="840" width="220" height="14" rx="4" fill="#24242e" />
				</Svg>
			);
		},
	},
	{depth: 1, node: (f) => <Svg><Analyst f={f} /></Svg>},
];

// ===================================================== generic fallback
export const genericPlate = (id: string, key: string): LayerSpec[] => [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id={`gen${id}`} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor={C.navy} />
						<stop offset="1" stopColor={C.charcoal} />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill={`url(#gen${id})`} />
				<polygon points={`0,${780 + Math.sin(f * 0.03) * 20} 1920,${420 + Math.sin(f * 0.03) * 20} 1920,${520 + Math.sin(f * 0.03) * 20} 0,${880 + Math.sin(f * 0.03) * 20}`} fill={C.rust} opacity="0.35" />
				<text x="960" y="520" fill={C.paper} opacity="0.5" fontSize="150" textAnchor="middle" fontFamily="Oswald" fontWeight="700">
					{id}
				</text>
				<text x="960" y="600" fill={C.paper} opacity="0.45" fontSize="44" textAnchor="middle" fontFamily="JetBrains Mono">
					{key}.png
				</text>
			</Svg>
		),
	},
];

export const PLACEHOLDERS: Record<string, LayerSpec[]> = {
	A01: gulf,
	A03: silhouette('#a8784a', 'a03'),
	A05: silhouette('#d2603a', 'a05'),
	A06: bus,
	A08: march,
	A11: analyst,
	A15: chamber,
	A02: corridor,
	A04: knesset,
	A07: arrival,
	A09: policeLights,
	A10: servers,
	A12: capitol,
	A13: polling,
};
