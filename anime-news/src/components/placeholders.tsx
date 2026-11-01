/**
 * TEMPORARY PLACEHOLDER PLATES — code-drawn blockouts, NOT finished anime art.
 *
 * Each plate mirrors the composition requested in src/data/assets.json
 * (same anchors, same layer split) so camera moves, crops and parallax can
 * be timed now and keep working when the real illustration is dropped into
 * public/assets/. Portrait placeholders are deliberately generic silhouettes
 * with no attempt at a likeness.
 */
import React from 'react';
import {random} from 'remotion';
import {C} from '../lib/theme';

export type LayerSpec = {depth: number; node: (frame: number) => React.ReactNode};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg
		viewBox="0 0 1920 1080"
		width="100%"
		height="100%"
		preserveAspectRatio="none"
		style={{position: 'absolute', inset: 0, overflow: 'visible'}}
	>
		{children}
	</svg>
);

const range = (n: number) => Array.from({length: n}, (_, i) => i);

// ---------------------------------------------------------------- A01 Gulf
const gulf: LayerSpec[] = [
	{
		depth: 0,
		node: () => (
			<Svg>
				<defs>
					<linearGradient id="a01sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0b1221" />
						<stop offset="0.28" stopColor="#1b1f33" />
						<stop offset="0.4" stopColor="#47293a" />
						<stop offset="0.47" stopColor="#9a4630" />
						<stop offset="0.52" stopColor="#e3913f" />
						<stop offset="1" stopColor="#e3913f" />
					</linearGradient>
					<radialGradient id="a01sun" cx="1380" cy="560" r="420" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#f6c271" stopOpacity="0.85" />
						<stop offset="0.25" stopColor="#e07a35" stopOpacity="0.35" />
						<stop offset="1" stopColor="#e07a35" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a01sky)" />
				<rect width="1920" height="1080" fill="url(#a01sun)" />
				<circle cx="1380" cy="566" r="44" fill="#f7cf86" />
				{/* hard-edged cloud bands with amber undersides */}
				{[
					[180, 360, 760, 18],
					[900, 420, 640, 14],
					[1260, 300, 560, 20],
					[420, 470, 520, 10],
				].map(([x, y, w, h], i) => (
					<g key={i}>
						<polygon points={`${x},${y} ${x + w},${y - 6} ${x + w - 60},${y + h} ${x + 40},${y + h + 4}`} fill="#241d2c" />
						<polygon points={`${x + 40},${y + h + 4} ${x + w - 60},${y + h} ${x + w - 90},${y + h + 4} ${x + 70},${y + h + 7}`} fill="#c06a36" opacity="0.8" />
					</g>
				))}
				{/* distant shore and cranes */}
				<polygon points="0,546 160,538 330,544 520,536 700,548 760,556 0,556" fill="#1d1519" />
				{[280, 330, 395].map((x, i) => (
					<g key={x} stroke="#1d1519" strokeWidth="4">
						<line x1={x} y1={540} x2={x} y2={488 - i * 6} />
						<line x1={x - 30} y1={492 - i * 6} x2={x + 46} y2={492 - i * 6} />
					</g>
				))}
			</Svg>
		),
	},
	{
		depth: 0.35,
		node: () => (
			<Svg>
				<g>
					{/* accommodation block */}
					<polygon points="1012,522 1012,436 1076,436 1082,522" fill="#0c1018" />
					<polygon points="1060,436 1076,436 1082,522 1066,522" fill="#c0703a" opacity="0.55" />
					{range(4).map((i) => (
						<rect key={i} x={1020 + i * 13} y={452} width={7} height={5} fill="#f2b25e" />
					))}
					<line x1="1040" y1="436" x2="1040" y2="404" stroke="#0c1018" strokeWidth="4" />
					<circle cx="1040" cy="402" r="3" fill="#fff4dc" />
					{/* container stacks with hard cel shadow on the shaded side */}
					{range(9).map((i) => {
						const x = 1094 + i * 38;
						const tiers = 3 - (i === 0 || i === 8 ? 1 : 0);
						const cols = ['#5a2c22', '#2b3b45', '#6b5a3a', '#3a2a2a', '#40494a'];
						return range(tiers).map((t) => (
							<g key={`${i}-${t}`}>
								<rect x={x} y={506 - t * 17} width={36} height={16} fill={cols[(i * 3 + t) % cols.length]} />
								<rect x={x} y={506 - t * 17} width={11} height={16} fill="#000" opacity="0.4" />
								<rect x={x} y={506 - t * 17} width={36} height={2} fill="#e8a24a" opacity="0.55" />
							</g>
						));
					})}
					{/* hull */}
					<polygon points="992,522 1452,522 1490,526 1462,560 1004,560" fill="#0a0d14" />
					<polyline points="992,522 1452,522 1490,526" stroke="#e8a24a" strokeWidth="2" fill="none" opacity="0.7" />
				</g>
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: (frame) => (
			<Svg>
				<defs>
					<linearGradient id="a01sea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#3b3a3c" />
						<stop offset="0.06" stopColor="#123038" />
						<stop offset="0.45" stopColor="#0a1e25" />
						<stop offset="1" stopColor="#040b10" />
					</linearGradient>
				</defs>
				<rect x="0" y="556" width="1920" height="524" fill="url(#a01sea)" />
				{/* sun glitter column */}
				{range(26).map((i) => {
					const y = 566 + i * i * 0.42 + i * 4;
					const w = (60 - i * 1.6) * (0.6 + 0.4 * Math.sin(frame * 0.35 + i * 1.9));
					return <rect key={i} x={1380 - w / 2 + Math.sin(frame * 0.12 + i) * 6} y={y} width={Math.max(4, w)} height={2 + i * 0.12} fill="#f0b05a" opacity={0.75 - i * 0.025} />;
				})}
				{/* wave lines: far ones slow, near ones faster (water motion layer 1) */}
				{range(70).map((i) => {
					const y = 566 + Math.pow(random(`wy${i}`), 1.8) * 500;
					const depth = (y - 556) / 524;
					const w = 30 + depth * 220 * random(`ww${i}`);
					const speed = 0.25 + depth * 1.4;
					const x = ((random(`wx${i}`) * 2200 + frame * speed) % 2200) - 140;
					return <rect key={i} x={x} y={y} width={w} height={1 + depth * 3} fill="#3e7480" opacity={0.25 + depth * 0.35} />;
				})}
			</Svg>
		),
	},
	{
		depth: 1,
		node: (frame) => {
			const flick = 0.85 + 0.15 * Math.sin(frame * 0.9) * Math.sin(frame * 0.23);
			return (
				<Svg>
					<defs>
						<radialGradient id="a01lamp" cx="460" cy="690" r="150" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ff4a3d" stopOpacity="0.95" />
							<stop offset="0.18" stopColor="#e02a2a" stopOpacity="0.5" />
							<stop offset="1" stopColor="#e02a2a" stopOpacity="0" />
						</radialGradient>
					</defs>
					{/* buoy: dark body, hard cel shadow, rust rim light */}
					<polygon points="420,800 500,800 488,722 432,722" fill="#0a0c10" />
					<polygon points="476,722 488,722 500,800 486,800" fill={C.rust} opacity="0.75" />
					<polygon points="440,722 480,722 472,700 448,700" fill="#0d1015" />
					<line x1="448" y1="700" x2="460" y2="676" stroke="#0d1015" strokeWidth="5" />
					<line x1="472" y1="700" x2="460" y2="676" stroke="#0d1015" strokeWidth="5" />
					<circle cx="460" cy="690" r="150" fill="url(#a01lamp)" opacity={flick} />
					<rect x="380" y="688" width="160" height="3" fill="#ff6a5a" opacity={0.5 * flick} />
					<circle cx="460" cy="690" r="9" fill="#ffd2c8" />
					{/* red reflection streak broken by the water (water motion layer 2) */}
					{range(22).map((i) => {
						const y = 806 + i * 9.5;
						const w = (8 + i * 2.2) * (0.5 + 0.5 * Math.abs(Math.sin(frame * 0.3 + i * 1.3)));
						return <rect key={i} x={460 - w / 2 + Math.sin(frame * 0.17 + i * 0.7) * (3 + i * 0.6)} y={y} width={w} height={3.5} fill="#ff3b30" opacity={(0.85 - i * 0.03) * flick} />;
					})}
					{/* foreground crests */}
					{range(3).map((k) => {
						const off = ((frame * (0.8 + k * 0.5)) % 320) - 320;
						const base = 960 + k * 44;
						const pts = range(9)
							.map((j) => {
								const x = off + j * 320;
								return `${x},${base} ${x + 120},${base - 26 + k * 4} ${x + 200},${base - 8}`;
							})
							.join(' ');
						return <polygon key={k} points={`${pts} 2600,1080 -400,1080`} fill={k === 2 ? '#03070a' : '#061016'} opacity={0.92} />;
					})}
				</Svg>
			);
		},
	},
];

// ------------------------------------------------- generic portrait (A03/A05)
const portrait = (accent: string): LayerSpec[] => [
	{
		depth: 0,
		node: () => (
			<Svg>
				<rect width="1920" height="1080" fill="#15171c" />
				<polygon points="1240,0 1920,0 1920,1080 1540,1080" fill="#2a1f1c" />
				<polygon points="1420,0 1920,0 1920,620" fill={accent} opacity="0.45" />
				{range(14).map((i) => (
					<rect key={i} x={80 + i * 92} y={0} width={2} height={1080} fill="#1d2027" />
				))}
			</Svg>
		),
	},
	{
		depth: 1,
		node: () => (
			<Svg>
				{/* shoulders / suit */}
				<polygon points="620,1080 700,820 900,700 1110,690 1320,700 1520,820 1600,1080" fill="#14161c" />
				<polygon points="620,1080 700,820 900,700 1000,700 960,1080" fill="#0a0b0f" />
				<polygon points="1050,700 1110,840 1170,700" fill="#d8d2c4" />
				<polygon points="1094,720 1126,720 1140,980 1110,1010 1080,980" fill="#2a1418" />
				<polyline points="1320,700 1520,820 1600,1080" stroke={C.amber} strokeWidth="6" fill="none" />
				{/* neck */}
				<polygon points="1050,560 1170,560 1180,700 1040,700" fill="#4a3a34" />
				<polygon points="1050,560 1100,560 1090,700 1040,700" fill="#2a201d" />
				{/* head: angular blockout, hard cel shadow on the left half */}
				<polygon points="980,250 1060,180 1180,175 1250,240 1262,360 1240,470 1180,570 1110,600 1040,560 990,470 970,360" fill="#5b4840" />
				<polygon points="980,250 1060,180 1110,178 1080,300 1070,420 1100,600 1040,560 990,470 970,360" fill="#33272a" />
				<polygon points="1012,326 1240,326 1236,352 1016,356" fill="#2a2023" opacity="0.8" />
				{/* hair mass */}
				<polygon points="960,280 1000,170 1110,130 1230,150 1280,250 1250,240 1180,190 1060,200 990,300" fill="#121316" />
				<polyline points="1250,240 1262,360 1240,470 1180,570" stroke={C.amber} strokeWidth="7" fill="none" />
				<text x="1112" y="430" fill="#fff" opacity="0.18" fontSize="64" textAnchor="middle" fontFamily="Oswald" fontWeight="700">
					PORTRAIT
				</text>
			</Svg>
		),
	},
];

// --------------------------------------------------- A15 parliament chamber
const chamber: LayerSpec[] = [
	{
		depth: 0,
		node: (frame) => (
			<Svg>
				<defs>
					<linearGradient id="a15wall" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#120d0c" />
						<stop offset="0.45" stopColor="#3a2117" />
						<stop offset="0.75" stopColor="#1a100d" />
						<stop offset="1" stopColor="#0b0807" />
					</linearGradient>
					<radialGradient id="a15pool" cx="960" cy="760" r="420" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#f0a446" stopOpacity="0.55" />
						<stop offset="1" stopColor="#f0a446" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a15wall)" />
				{/* light shafts */}
				{[300, 960, 1620].map((x, i) => (
					<polygon key={x} points={`${x - 40},0 ${x + 40},0 ${x + 220},700 ${x - 140},700`} fill={C.amber} opacity={0.07 + 0.015 * Math.sin(frame * 0.05 + i)} />
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
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24} L${x1 + r * 18},${y + 42} Q${(x0 + x1) / 2},${y + bow + 42} ${x0 - r * 18},${y + 42} Z`} fill="#2a1a14" />
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24}`} stroke={C.amber} strokeWidth="2.5" fill="none" opacity="0.8" />
								{range(9).map((k) => {
									const t = (k + 0.5) / 9;
									const cx = x0 - r * 18 + t * (x1 - x0 + r * 36);
									const cy = y + 4 + bow * 4 * t * (1 - t);
									return <rect key={k} x={cx - 14} y={cy - 6} width={28} height={30} rx={5} fill="#120b09" />;
								})}
							</g>
						);
					}),
				)}
				<rect x="0" y="600" width="1920" height="480" fill="#0d0907" />
				<rect width="1920" height="1080" fill="url(#a15pool)" />
			</Svg>
		),
	},
	{
		depth: 0.9,
		node: () => (
			<Svg>
				{/* the empty chair */}
				<rect x="850" y="470" width="220" height="300" rx="26" fill="#1c1210" />
				<rect x="850" y="470" width="96" height="300" rx="26" fill="#0e0807" />
				<path d="M1070,500 L1070,760" stroke={C.amber} strokeWidth="6" />
				<rect x="820" y="740" width="280" height="56" rx="14" fill="#160e0c" />
				<rect x="820" y="740" width="280" height="6" fill={C.amber} opacity="0.75" />
				<rect x="950" y="796" width="20" height="90" fill="#0a0605" />
				<polygon points="880,890 1040,890 1080,910 840,910" fill="#0a0605" />
			</Svg>
		),
	},
];

// --------------------------------------------------------- A06 bus window
const bus: LayerSpec[] = [
	{
		depth: 0,
		node: (frame) => (
			<Svg>
				<defs>
					<linearGradient id="a06sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2c3a4e" />
						<stop offset="0.3" stopColor="#5d6d82" />
						<stop offset="0.4" stopColor="#a3a9ae" />
						<stop offset="0.43" stopColor="#d8b07a" />
						<stop offset="0.45" stopColor="#3b4553" />
						<stop offset="1" stopColor="#1f2630" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a06sky)" />
				<polygon points="1100,620 1820,620 1500,470 1430,470" fill="#2a2f36" />
				{/* passing roadside poles: the bus is moving */}
				{range(5).map((i) => {
					const x = 1900 - ((frame * 11 + i * 260) % 1300);
					return <rect key={i} x={x} y={300} width={10} height={340} fill="#151a21" />;
				})}
				{range(14).map((i) => (
					<polygon key={i} points={`${1080 + i * 60},476 ${1110 + i * 60},440 ${1140 + i * 60},476`} fill="#1a2028" />
				))}
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: () => (
			<Svg>
				<defs>
					<radialGradient id="a06lamp" cx="420" cy="80" r="900" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#e59a3b" stopOpacity="0.35" />
						<stop offset="1" stopColor="#e59a3b" stopOpacity="0" />
					</radialGradient>
				</defs>
				<path d="M0,0 H1920 V1080 H0 Z M1100,140 Q1090,130 1110,130 H1800 Q1820,130 1820,150 V610 Q1820,630 1800,630 H1110 Q1090,630 1090,610 Z" fill="#101722" fillRule="evenodd" />
				<rect x="1080" y="120" width="750" height="520" rx="26" fill="none" stroke="#25303e" strokeWidth="22" />
				<line x1="1455" y1="130" x2="1455" y2="630" stroke="#25303e" strokeWidth="16" />
				<rect x="1090" y="130" width="730" height="500" fill="#e59a3b" opacity="0.06" />
				<rect width="1920" height="1080" fill="url(#a06lamp)" />
				<rect x="0" y="40" width="1920" height="10" fill="#1d2633" />
				<polygon points="1250,1080 1330,700 1700,700 1760,1080" fill="#0b1018" />
			</Svg>
		),
	},
	{
		depth: 1,
		node: () => (
			<Svg>
				{/* seated anonymous civilian in coat, looking toward the window */}
				<polygon points="480,1080 520,720 640,580 860,560 980,640 1060,1080" fill="#1b2230" />
				<polygon points="480,1080 520,720 640,580 700,580 660,1080" fill="#0f141d" />
				<polygon points="700,250 800,230 860,290 870,380 840,450 780,480 720,460 690,380" fill="#4b3d38" />
				<polygon points="700,250 760,236 740,380 760,470 720,460 690,380" fill="#2a2224" />
				<polygon points="680,300 700,220 800,200 870,250 880,300 820,260 720,270" fill="#1b1a1d" />
				<polyline points="860,290 870,380 840,450" stroke={C.amber} strokeWidth="5" fill="none" />
				{/* hand holding a small unmarked travel bag */}
				<path d="M520,780 Q575,700 640,780" stroke="#2a1d16" strokeWidth="12" fill="none" />
				<rect x="440" y="780" width="270" height="170" rx="22" fill="#3a2a20" />
				<rect x="440" y="780" width="90" height="170" rx="22" fill="#24190f" />
				<rect x="440" y="780" width="270" height="6" fill={C.amber} opacity="0.6" />
				<polygon points="555,700 610,698 622,740 590,760 552,742" fill="#9a7a66" />
				<polygon points="555,700 578,700 572,752 552,742" fill="#6b4f42" />
			</Svg>
		),
	},
];

// ------------------------------------------------------- A08 France march
const march: LayerSpec[] = [
	{
		depth: 0,
		node: () => (
			<Svg>
				<defs>
					<linearGradient id="a08sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#c7c4bb" />
						<stop offset="1" stopColor="#efe6d1" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a08sky)" />
				<polygon points="0,60 820,420 820,610 0,820" fill="#b39f82" />
				<polygon points="1920,60 1100,420 1100,610 1920,820" fill="#6d604f" />
				{range(6).map((r) =>
					range(10).map((k) => {
						const t = k / 10;
						const xL = t * 760;
						const yTop = 60 + t * 360 + r * (110 - t * 70) + 40;
						const h = 46 - t * 30;
						return (
							<g key={`${r}-${k}`}>
								<rect x={xL + 10} y={yTop} width={40 - t * 26} height={h} fill="#4e4436" opacity="0.8" />
								<rect x={1920 - xL - 50 + t * 26} y={yTop} width={40 - t * 26} height={h} fill="#2e2822" opacity="0.8" />
							</g>
						);
					}),
				)}
				<polygon points="0,820 820,610 1100,610 1920,820 1920,1080 0,1080" fill="#8b8173" />
			</Svg>
		),
	},
	{
		depth: 0.8,
		node: (frame) => {
			const people = range(150).map((i) => {
				const row = Math.floor(i / 15);
				const depth = row / 9;
				const scale = 0.35 + depth * 1.25;
				const x = ((i % 15) + random(`mx${i}`) * 0.8) * (1920 / 14) - 60 + (row % 2) * 40;
				const y = 600 + Math.pow(depth, 1.3) * 520 + random(`my${i}`) * 20;
				return {i, x, y, scale, row};
			});
			const cols = ['#2b3b45', '#5a2c22', '#4a4a3a', '#22262d', '#5c6675', '#6b4a32'];
			return (
				<Svg>
					{people.map(({i, x, y, scale}) => {
						const bob = Math.sin(frame * 0.22 + i * 1.7) * 3 * scale;
						const c = cols[i % cols.length];
						const sign = random(`ms${i}`) < 0.16;
						return (
							<g key={i} transform={`translate(${x},${y + bob}) scale(${scale})`}>
								{sign ? (
									<g>
										<rect x={-3} y={-150} width={6} height={110} fill="#3a2f25" />
										<rect x={-44} y={-200} width={88} height={60} fill="#e6dcc6" />
										<rect x={-44} y={-200} width={30} height={60} fill="#c5b89c" />
									</g>
								) : null}
								<path d="M-46,60 Q-44,-10 0,-14 Q44,-10 46,60 Z" fill={c} />
								<path d="M-46,60 Q-44,-10 0,-14 L-6,60 Z" fill="#000" opacity="0.3" />
								<circle cx={0} cy={-40} r={24} fill="#5b4840" />
								<path d="M-24,-40 A24,24 0 0 1 0,-64 L0,-16 A24,24 0 0 1 -24,-40" fill="#33272a" />
							</g>
						);
					})}
				</Svg>
			);
		},
	},
];

// ---------------------------------------------------- A11 market analyst
const analyst: LayerSpec[] = [
	{
		depth: 0,
		node: () => (
			<Svg>
				<rect width="1920" height="1080" fill="#0a0c11" />
				{range(22).map((i) => (
					<rect key={i} x={0} y={60 + i * 26} width={760} height={6} fill="#141c2a" />
				))}
				<circle cx="1820" cy="220" r="240" fill={C.amber} opacity="0.06" />
				<rect x="0" y="840" width="1920" height="240" fill="#07080b" />
			</Svg>
		),
	},
	{
		depth: 0.5,
		node: (frame) => (
			<Svg>
				<defs>
					<linearGradient id="a11screen" x1="0" y1="1" x2="0" y2="0">
						<stop offset="0" stopColor="#5a1414" stopOpacity="0.9" />
						<stop offset="0.5" stopColor="#1a0b0c" />
						<stop offset="1" stopColor="#0b0809" />
					</linearGradient>
				</defs>
				<rect x="846" y="156" width="888" height="618" rx="10" fill="#040405" />
				<rect x="866" y="176" width="848" height="578" fill="url(#a11screen)" />
				{/* blank screen: the reflected face of the analyst */}
				<g opacity={0.5 + 0.04 * Math.sin(frame * 0.3)}>
					<polygon points="1080,330 1160,300 1230,340 1240,430 1210,510 1150,540 1100,500 1075,420" fill="#2a1b1d" />
					<polygon points="980,754 1010,620 1100,560 1200,560 1290,620 1320,754" fill="#1e1416" />
					<polyline points="1230,340 1240,430 1210,510" stroke={C.red} strokeWidth="4" fill="none" opacity="0.7" />
				</g>
				{range(48).map((i) => (
					<rect key={i} x="866" y={176 + i * 12} width="848" height="1" fill="#fff" opacity="0.025" />
				))}
				<rect x="1260" y="774" width="60" height="70" fill="#050506" />
				<rect x="1180" y="840" width="220" height="14" fill="#050506" />
			</Svg>
		),
	},
	{
		depth: 1,
		node: () => (
			<Svg>
				{/* foreground fictional analyst in profile, lit red by the screen */}
				<polygon points="120,1080 160,760 300,650 520,640 640,740 700,1080" fill="#101218" />
				<polygon points="330,330 430,290 520,330 560,410 600,460 570,480 580,540 540,600 450,620 380,580 340,480" fill="#3f3236" />
				<polygon points="330,330 400,300 380,450 410,610 380,580 340,480" fill="#1e1719" />
				<polygon points="310,360 330,280 430,250 540,300 560,360 500,320 400,320" fill="#121216" />
				<polyline points="520,330 560,410 600,460 570,480 580,540 540,600" stroke={C.red} strokeWidth="6" fill="none" />
				<polyline points="430,290 520,330" stroke={C.amber} strokeWidth="4" fill="none" />
			</Svg>
		),
	},
];

// -------------------------------------------------- generic fallback plate
export const genericPlate = (id: string, key: string): LayerSpec[] => [
	{
		depth: 0,
		node: () => (
			<Svg>
				<defs>
					<linearGradient id={`gen${id}`} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor={C.navy} />
						<stop offset="1" stopColor={C.charcoal} />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill={`url(#gen${id})`} />
				<polygon points="0,780 1920,420 1920,520 0,880" fill={C.rust} opacity="0.35" />
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
	A03: portrait('#6b5a3a'),
	A05: portrait(C.rust),
	A06: bus,
	A08: march,
	A11: analyst,
	A15: chamber,
};
