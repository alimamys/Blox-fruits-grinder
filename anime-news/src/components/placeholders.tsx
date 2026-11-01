/**
 * TEMPORARY PLACEHOLDER PLATES — code-drawn, animated stand-ins, NOT the
 * final anime artwork.
 *
 * Each plate mirrors the composition requested in src/data/assets.json (same
 * anchors, same layer split) so camera moves, crops and parallax can be timed
 * now and keep working when the real illustration is dropped into
 * public/assets/. Anonymous characters are simple animated rigs (blink, glance,
 * breathing, hand movement). The real public figure (A03/A05) is shown only as
 * a backlit silhouette — deliberately no likeness.
 */
import React from 'react';
import {random} from 'remotion';
import {C} from '../lib/theme';
import {blinkAt, breathe} from './fx';

export type LayerSpec = {depth: number; node: (frame: number) => React.ReactNode};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{children}
	</svg>
);

const range = (n: number) => Array.from({length: n}, (_, i) => i);
const INK = '#0d0b0e';
const SKIN = '#b98b72';
const SKIN_SH = '#76503f';
const HAIR = '#15161c';
const HAIR_HI = '#3b4258';

// =============================================================== A01 Gulf
const gull = (x: number, y: number, s: number, flap: number, key: string) => {
	const w = 18 * s;
	const lift = Math.sin(flap) * 9 * s;
	return <path key={key} d={`M${x - w},${y - lift} Q${x - w / 2},${y - 6 * s - lift / 2} ${x},${y} Q${x + w / 2},${y - 6 * s - lift / 2} ${x + w},${y - lift}`} stroke="#1a1418" strokeWidth={2.4 * s} fill="none" strokeLinecap="round" />;
};

const gulf: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
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
				<rect width="1920" height="1080" fill="url(#a01sun)" opacity={0.9 + 0.1 * Math.sin(f * 0.05)} />
				<circle cx="1380" cy="566" r={44 + Math.sin(f * 0.07) * 1.5} fill="#f7cf86" />
				{/* drifting hard-edged cloud bands with amber undersides */}
				{[
					[180, 360, 760, 18, 0.18],
					[900, 420, 640, 14, 0.28],
					[1260, 300, 560, 20, 0.12],
					[420, 470, 520, 10, 0.34],
				].map(([x0, y, w, h, sp], i) => {
					const x = ((x0 - f * sp) % 2600 + 2600) % 2600 - 500;
					return (
						<g key={i}>
							<polygon points={`${x},${y} ${x + w},${y - 6} ${x + w - 60},${y + h} ${x + 40},${y + h + 4}`} fill="#241d2c" />
							<polygon points={`${x + 40},${y + h + 4} ${x + w - 60},${y + h} ${x + w - 90},${y + h + 4} ${x + 70},${y + h + 7}`} fill="#c06a36" opacity="0.8" />
						</g>
					);
				})}
				<polygon points="0,546 160,538 330,544 520,536 700,548 760,556 0,556" fill="#1d1519" />
				{[280, 330, 395].map((x, i) => (
					<g key={x} stroke="#1d1519" strokeWidth="4">
						<line x1={x} y1={540} x2={x} y2={488 - i * 6} />
						<line x1={x - 30} y1={492 - i * 6} x2={x + 46} y2={492 - i * 6} />
					</g>
				))}
				{/* gulls gliding across */}
				{range(4).map((i) => gull(((f * (1.1 + i * 0.25) + i * 420) % 2300) - 200, 300 + i * 34 + Math.sin(f * 0.03 + i) * 12, 0.8 + i * 0.15, f * 0.32 + i * 1.7, `g${i}`))}
			</Svg>
		),
	},
	{
		depth: 0.35,
		node: (f) => {
			const sx = -f * 0.09; // the ship creeps along the horizon
			return (
				<Svg>
					<g transform={`translate(${sx},${Math.sin(f * 0.05) * 1.2})`}>
						{/* funnel smoke */}
						{range(12).map((i) => {
							const age = ((f + i * 11) % 130) / 130;
							return <circle key={i} cx={1046 - age * 160} cy={426 - age * 70} r={6 + age * 26} fill="#2b2430" opacity={(1 - age) * 0.55} />;
						})}
						<polygon points="1012,522 1012,436 1076,436 1082,522" fill="#0c1018" />
						<polygon points="1060,436 1076,436 1082,522 1066,522" fill="#c0703a" opacity="0.55" />
						{range(4).map((i) => (
							<rect key={i} x={1020 + i * 13} y={452} width={7} height={5} fill="#f2b25e" opacity={0.7 + 0.3 * Math.sin(f * 0.2 + i * 2)} />
						))}
						<rect x="1036" y="418" width="16" height="20" fill="#0c1018" />
						<line x1="1040" y1="436" x2="1040" y2="404" stroke="#0c1018" strokeWidth="4" />
						<circle cx="1040" cy="402" r="3" fill="#fff4dc" />
						<circle cx="1450" cy="512" r="3.5" fill="#ff3b30" opacity={(f % 36) < 18 ? 1 : 0.2} />
						{range(9).map((i) => {
							const x = 1094 + i * 38;
							const tiers = 3 - (i === 0 || i === 8 ? 1 : 0);
							const cols = ['#5a2c22', '#2b3b45', '#6b5a3a', '#3a2a2a', '#40494a'];
							return range(tiers).map((t) => (
								<g key={`${i}-${t}`}>
									<rect x={x} y={506 - t * 17} width={36} height={16} fill={cols[(i * 3 + t) % cols.length]} stroke={INK} strokeWidth="1.2" />
									<rect x={x} y={506 - t * 17} width={11} height={16} fill="#000" opacity="0.4" />
									<rect x={x} y={506 - t * 17} width={36} height={2} fill="#e8a24a" opacity="0.55" />
								</g>
							));
						})}
						<polygon points="992,522 1452,522 1490,526 1462,560 1004,560" fill="#0a0d14" stroke={INK} strokeWidth="2" />
						<polyline points="992,522 1452,522 1490,526" stroke="#e8a24a" strokeWidth="2" fill="none" opacity="0.7" />
						{/* bow wave */}
						<path d={`M1462,558 q20,${-4 - Math.sin(f * 0.3) * 2} 44,2`} stroke="#9fc6c8" strokeWidth="2" fill="none" opacity="0.5" />
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
						<stop offset="0" stopColor="#3b3a3c" />
						<stop offset="0.06" stopColor="#123038" />
						<stop offset="0.45" stopColor="#0a1e25" />
						<stop offset="1" stopColor="#040b10" />
					</linearGradient>
				</defs>
				<rect x="0" y="556" width="1920" height="524" fill="url(#a01sea)" />
				{/* slow swell bands (water motion, layer 1) */}
				{range(7).map((i) => {
					const y = 600 + i * 64 + Math.sin(f * 0.04 + i) * 10;
					return <rect key={`s${i}`} x={0} y={y} width={1920} height={10 + i * 4} fill="#16404a" opacity={0.18 + 0.12 * Math.sin(f * 0.05 + i * 1.3)} />;
				})}
				{range(26).map((i) => {
					const y = 566 + i * i * 0.42 + i * 4;
					const w = (60 - i * 1.6) * (0.6 + 0.4 * Math.sin(f * 0.35 + i * 1.9));
					return <rect key={i} x={1380 - w / 2 + Math.sin(f * 0.12 + i) * 6} y={y} width={Math.max(4, w)} height={2 + i * 0.12} fill="#f0b05a" opacity={0.75 - i * 0.025} />;
				})}
				{/* ripples (water motion, layer 2): far slow, near fast */}
				{range(80).map((i) => {
					const y = 566 + Math.pow(random(`wy${i}`), 1.8) * 500;
					const depth = (y - 556) / 524;
					const w = 30 + depth * 220 * random(`ww${i}`);
					const speed = 0.35 + depth * 1.8;
					const x = ((random(`wx${i}`) * 2200 + f * speed) % 2200) - 140;
					return <rect key={i} x={x} y={y + Math.sin(f * 0.1 + i) * 2 * depth} width={w} height={1 + depth * 3} fill="#3e7480" opacity={0.25 + depth * 0.35} />;
				})}
			</Svg>
		),
	},
	{
		depth: 1,
		node: (f) => {
			// navigation light: bright flash every 2 s, decaying glow between
			const ph = f % 48;
			const flash = 0.62 + 0.55 * Math.exp(-ph / 7);
			const bob = Math.sin(f * 0.07) * 3;
			const lift = Math.sin(f * 0.07 + 1.1) * 5;
			return (
				<Svg>
					<defs>
						<radialGradient id="a01lamp" cx="460" cy="690" r="150" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ff4a3d" stopOpacity="0.95" />
							<stop offset="0.18" stopColor="#e02a2a" stopOpacity="0.5" />
							<stop offset="1" stopColor="#e02a2a" stopOpacity="0" />
						</radialGradient>
					</defs>
					<g transform={`translate(0,${lift}) rotate(${bob},460,800)`}>
						<polygon points="420,800 500,800 488,722 432,722" fill="#0a0c10" stroke={INK} strokeWidth="3" />
						<polygon points="476,722 488,722 500,800 486,800" fill={C.rust} opacity="0.75" />
						<polygon points="440,722 480,722 472,700 448,700" fill="#0d1015" stroke={INK} strokeWidth="2" />
						<line x1="448" y1="700" x2="460" y2="676" stroke="#0d1015" strokeWidth="5" />
						<line x1="472" y1="700" x2="460" y2="676" stroke="#0d1015" strokeWidth="5" />
						<circle cx="460" cy="690" r={150 * (0.85 + 0.25 * flash)} fill="url(#a01lamp)" opacity={Math.min(1, flash)} />
						<rect x={460 - 90 * flash} y="688" width={180 * flash} height="3" fill="#ff6a5a" opacity={0.55 * flash} />
						<rect x="458.5" y={690 - 60 * flash} width="3" height={120 * flash} fill="#ff6a5a" opacity={0.25 * flash} />
						<circle cx="460" cy="690" r="9" fill="#ffd2c8" />
						<polygon points="420,800 500,800 506,808 414,808" fill="#0e2a31" opacity="0.8" />
					</g>
					{/* red reflection, broken by the water */}
					{range(24).map((i) => {
						const y = 812 + i * 9.5 + lift * 0.5;
						const w = (8 + i * 2.2) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.3 + i * 1.3)));
						return <rect key={i} x={460 - w / 2 + Math.sin(f * 0.17 + i * 0.7) * (3 + i * 0.6)} y={y} width={w} height={3.5} fill="#ff3b30" opacity={Math.min(1, (0.8 - i * 0.028) * flash)} />;
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
						return <polygon key={k} points={`${pts} 2600,1080 -400,1080`} fill={k === 2 ? '#03070a' : '#061016'} opacity={0.92} />;
					})}
				</Svg>
			);
		},
	},
];

// ===================================== backlit silhouette portrait (A03/A05)
// Real public figure: shown only as a dramatic backlit silhouette, no face.
const silhouette = (glow: string, key: string): LayerSpec[] => [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<radialGradient id={`bl${key}`} cx="1180" cy="330" r="760" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#f7c27a" stopOpacity="0.95" />
						<stop offset="0.22" stopColor={glow} stopOpacity="0.75" />
						<stop offset="0.6" stopColor="#2a1a1c" stopOpacity="0.6" />
						<stop offset="1" stopColor="#0d0e12" stopOpacity="1" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="#0d0e12" />
				<rect width="1920" height="1080" fill={`url(#bl${key})`} opacity={0.92 + 0.08 * Math.sin(f * 0.11) * Math.sin(f * 0.037)} />
				{/* slowly turning light rays behind the figure */}
				<g transform={`rotate(${f * 0.06},1180,330)`} opacity="0.16">
					{range(14).map((i) => (
						<polygon key={i} points={`1180,330 ${1180 + Math.cos((i / 14) * 6.283) * 1500},${330 + Math.sin((i / 14) * 6.283) * 1500} ${1180 + Math.cos((i / 14) * 6.283 + 0.12) * 1500},${330 + Math.sin((i / 14) * 6.283 + 0.12) * 1500}`} fill="#ffd9a0" />
					))}
				</g>
				{range(9).map((i) => (
					<rect key={i} x={0} y={i * 120 + ((f * 0.4) % 120)} width={1920} height={18} fill="#000" opacity="0.12" />
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
						<polygon points="600,1080 690,815 900,700 1110,688 1320,700 1530,815 1620,1080" fill="#08090c" stroke={INK} strokeWidth="4" />
						<polyline points="1320,700 1530,815 1620,1080" stroke={C.amber} strokeWidth={7} fill="none" opacity={rim} />
						<polyline points="900,700 1110,688 1320,700" stroke="#ffcf8a" strokeWidth={3} fill="none" opacity={0.6 * rim} />
						<polygon points="1050,700 1110,820 1170,700" fill="#14151a" />
					</g>
					<g transform={`rotate(${turn},1110,650)`}>
						<polygon points="1050,560 1170,560 1180,700 1040,700" fill="#0a0b0e" />
						<polygon points="980,250 1060,180 1180,175 1250,240 1262,360 1240,470 1180,570 1110,600 1040,560 990,470 970,360" fill="#0a0b0e" stroke={INK} strokeWidth="4" />
						<polygon points="960,280 1000,170 1110,130 1230,150 1280,250 1250,240 1180,190 1060,200 990,300" fill="#060709" />
						{/* hard rim light along the lit side of head and hair */}
						<polyline points="1110,130 1230,150 1280,250 1262,360 1240,470 1180,570" stroke={C.amber} strokeWidth={8} fill="none" strokeLinejoin="round" opacity={rim} />
						<polyline points="1230,150 1280,250" stroke="#fff0d0" strokeWidth={3} fill="none" opacity={0.8 * rim} />
						<polyline points="1000,170 1110,130" stroke="#ffcf8a" strokeWidth={3} fill="none" opacity={0.5 * rim} />
					</g>
				</Svg>
			);
		},
	},
];

// ================================================= A15 parliament chamber
const chamber: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
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
				{[300, 960, 1620].map((x, i) => {
					const sway = Math.sin(f * 0.012 + i) * 40;
					return <polygon key={x} points={`${x - 40},0 ${x + 40},0 ${x + 220 + sway},700 ${x - 140 + sway},700`} fill={C.amber} opacity={0.07 + 0.03 * Math.sin(f * 0.05 + i * 2)} />;
				})}
				{[
					[90, 640],
					[720, 1200],
					[1280, 1830],
				].map(([x0, x1], g) =>
					range(3).map((r) => {
						const y = 380 + r * 62;
						const bow = 26 + r * 6;
						const glow = 0.6 + 0.4 * Math.sin(f * 0.04 + g * 2.1 + r);
						return (
							<g key={`${g}-${r}`}>
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24} L${x1 + r * 18},${y + 42} Q${(x0 + x1) / 2},${y + bow + 42} ${x0 - r * 18},${y + 42} Z`} fill="#2a1a14" stroke={INK} strokeWidth="2" />
								<path d={`M${x0 - r * 18},${y + 24} Q${(x0 + x1) / 2},${y + bow + 24} ${x1 + r * 18},${y + 24}`} stroke={C.amber} strokeWidth="2.5" fill="none" opacity={0.8 * glow} />
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
				<rect width="1920" height="1080" fill="url(#a15pool)" opacity={0.85 + 0.15 * Math.sin(f * 0.09)} />
			</Svg>
		),
	},
	{
		depth: 0.9,
		node: (f) => {
			const creak = Math.sin(f * 0.03) * 0.8; // the empty chair turns a fraction
			return (
				<Svg>
					<g transform={`rotate(${creak},960,840)`}>
						<rect x="850" y="470" width="220" height="300" rx="26" fill="#1c1210" stroke={INK} strokeWidth="4" />
						<rect x="850" y="470" width="96" height="300" rx="26" fill="#0e0807" />
						<path d="M1070,500 L1070,760" stroke={C.amber} strokeWidth="6" />
						<path d={`M${1000 + Math.sin(f * 0.05) * 30},500 l12,0 l-30,250 l-12,0 z`} fill="#ffd9a0" opacity="0.12" />
						<rect x="820" y="740" width="280" height="56" rx="14" fill="#160e0c" stroke={INK} strokeWidth="4" />
						<rect x="820" y="740" width="280" height="6" fill={C.amber} opacity="0.75" />
					</g>
					<rect x="950" y="796" width="20" height="90" fill="#0a0605" />
					<polygon points="880,890 1040,890 1080,910 840,910" fill="#0a0605" />
				</Svg>
			);
		},
	},
];

// ======================================================= A06 bus (rigged)
const bus: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
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
				{/* far tree line (slow) and roadside poles (fast): the bus is moving */}
				{range(30).map((i) => {
					const x = 1950 - (((f * 2.2 + i * 70) % 2100));
					return <polygon key={`t${i}`} points={`${x},476 ${x + 26},${430 - (i % 3) * 10} ${x + 52},476`} fill="#1a2028" />;
				})}
				<polygon points="1100,620 1820,620 1500,470 1430,470" fill="#2a2f36" />
				{range(4).map((i) => {
					const d = ((f * 2.4 + i * 30) % 120) / 120;
					return <rect key={`l${i}`} x={1465 - d * 30} y={480 + d * 140} width={4 + d * 10} height={6 + d * 20} fill="#c9c3b2" opacity={0.6} />;
				})}
				{range(5).map((i) => {
					const x = 1900 - ((f * 14 + i * 260) % 1300);
					return <rect key={i} x={x} y={300} width={12} height={340} fill="#151a21" />;
				})}
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: (f) => {
			const sweep = ((f * 9) % 2400) - 400; // passing light across the cabin
			return (
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
					{/* reflections sliding on the glass */}
					<polygon points={`${1150 + ((f * 3) % 700)},140 ${1190 + ((f * 3) % 700)},140 ${1120 + ((f * 3) % 700)},620 ${1080 + ((f * 3) % 700)},620`} fill="#fff" opacity="0.06" />
					<rect width="1920" height="1080" fill="url(#a06lamp)" opacity={0.9 + 0.1 * Math.sin(f * 0.6) * Math.sin(f * 0.13)} />
					<polygon points={`${sweep},0 ${sweep + 160},0 ${sweep - 200},1080 ${sweep - 360},1080`} fill="#cfe0ff" opacity="0.07" />
					<rect x="0" y="40" width="1920" height="10" fill="#1d2633" />
					<polygon points="1250,1080 1330,700 1700,700 1760,1080" fill="#0b1018" />
				</Svg>
			);
		},
	},
	{
		depth: 1,
		node: (f) => {
			const blink = blinkAt(f, 6, 50, 90);
			const br = breathe(f, 1, 96);
			const jolt = Math.sin(f * 1.7) * 0.8 + Math.sin(f * 0.9) * 0.6; // road vibration
			// glance: looks out of the window, then down to the bag, then back
			const cyc = (f % 150) / 150;
			const look = cyc < 0.55 ? 1 : cyc < 0.75 ? 1 - (cyc - 0.55) / 0.2 : (cyc - 0.75) / 0.25;
			const irisX = -2 + 8 * look;
			const irisY = 3 * (1 - look);
			const headTilt = -2 + 3 * look;
			const grip = Math.max(0, Math.sin(f * 0.07)) ** 3; // hand tightens on the strap
			const bagSwing = Math.sin(f * 0.11) * 1.4 + jolt * 0.3;
			return (
				<Svg>
					<g transform={`translate(0,${jolt})`}>
						{/* coat and shoulders (breathing) */}
						<g transform={`translate(0,${br * 2.5})`}>
							<polygon points="480,1080 520,720 640,580 860,560 980,640 1060,1080" fill="#1b2230" stroke={INK} strokeWidth="5" />
							<polygon points="480,1080 520,720 640,580 700,580 660,1080" fill="#0f141d" />
							<polyline points="860,560 980,640 1060,1080" stroke={C.amber} strokeWidth="4" fill="none" opacity="0.6" />
							<polygon points="700,560 770,600 840,560 820,620 770,650 720,620" fill="#3a2a2c" stroke={INK} strokeWidth="3" />
						</g>
						{/* head: 3/4 view facing the window */}
						<g transform={`translate(770,360) rotate(${headTilt}) translate(0,${br * 1.5})`}>
							<polygon points="-20,95 30,95 35,170 -25,170" fill={SKIN_SH} />
							<polygon points="-70,-110 10,-128 75,-95 95,-30 100,10 92,52 60,100 20,112 -30,95 -62,40 -80,-30" fill={SKIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
							<polygon points="-70,-110 10,-128 20,-60 0,20 15,110 -30,95 -62,40 -80,-30" fill={SKIN_SH} />
							<polyline points="95,-30 100,10 92,52 60,100" stroke={C.amber} strokeWidth="4" fill="none" opacity="0.85" />
							{/* nose + mouth */}
							<polyline points="96,0 106,24 94,28" stroke={INK} strokeWidth="3" fill="none" strokeLinejoin="round" />
							<line x1="70" y1="62" x2="88" y2="60" stroke={INK} strokeWidth="3" strokeLinecap="round" />
							{/* eye: lash line, white, iris, highlight — blinks and glances */}
							<clipPath id="a06eye">
								<ellipse cx="58" cy="-10" rx="21" ry={13 * (1 - 0.92 * blink)} />
							</clipPath>
							<ellipse cx="58" cy="-10" rx="21" ry={13 * (1 - 0.92 * blink)} fill="#ece6da" />
							<g clipPath="url(#a06eye)">
								<ellipse cx={60 + irisX} cy={-9 + irisY} rx="9.5" ry="12" fill="#5a3a26" />
								<ellipse cx={60 + irisX} cy={-6 + irisY} rx="5" ry="6" fill="#1a0f0b" />
								<circle cx={64 + irisX} cy={-14 + irisY} r="3.4" fill="#fff" />
							</g>
							<polygon points={`32,${-22 + 12 * blink} 80,${-28 + 13 * blink} 84,${-20 + 11 * blink} 34,${-15 + 11 * blink}`} fill={INK} />
							<polygon points={`30,${-46 + 3 * (1 - look)} 82,-52 84,-46 32,${-40 + 3 * (1 - look)}`} fill={HAIR} />
							{/* hair with swaying strands */}
							<polygon points="-95,-40 -90,-110 -40,-152 40,-150 100,-112 112,-62 95,-55 80,-84 68,-52 48,-80 30,-46 8,-84 -20,-34 -60,-10 -80,60 -96,90" fill={HAIR} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
							<polyline points="-40,-152 40,-150 100,-112" stroke={HAIR_HI} strokeWidth="6" fill="none" />
							{range(4).map((i) => (
								<polygon key={i} transform={`rotate(${Math.sin(f * 0.09 + i) * 3 + jolt},${-80 + i * 10},${40 + i * 12})`} points={`${-84 + i * 10},${30 + i * 12} ${-74 + i * 10},${30 + i * 12} ${-88 + i * 8},${100 + i * 6}`} fill={HAIR} />
							))}
						</g>
						{/* bag + hand: the grip tightens, the bag swings with the road */}
						<g transform={`rotate(${bagSwing},575,700)`}>
							<path d="M520,780 Q575,700 640,780" stroke="#2a1d16" strokeWidth="12" fill="none" />
							<rect x="440" y="780" width="270" height="170" rx="22" fill="#3a2a20" stroke={INK} strokeWidth="5" />
							<rect x="440" y="780" width="90" height="170" rx="22" fill="#24190f" />
							<rect x="440" y="780" width="270" height="6" fill={C.amber} opacity="0.6" />
							<line x1="470" y1="850" x2="690" y2="850" stroke="#1d140e" strokeWidth="4" />
						</g>
						<g transform={`translate(${grip * -2},${grip * 3})`}>
							<polygon points="552,694 612,690 628,736 596,762 552,744" fill={SKIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
							<polygon points="552,694 576,694 572,752 552,744" fill={SKIN_SH} />
							{range(3).map((i) => (
								<path key={i} d={`M${574 + i * 14},${738 - grip * 8} q6,${12 + grip * 6} ${-2},${20}`} stroke={INK} strokeWidth="3" fill="none" />
							))}
						</g>
					</g>
				</Svg>
			);
		},
	},
];

// ================================================= A08 France march (crowd)
const march: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a08sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#c7c4bb" />
						<stop offset="1" stopColor="#efe6d1" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a08sky)" />
				{range(3).map((i) => {
					const x = ((f * (0.3 + i * 0.1) + i * 600) % 2400) - 400;
					return <ellipse key={i} cx={x} cy={110 + i * 60} rx={220} ry={26} fill="#fff" opacity="0.5" />;
				})}
				<polygon points="0,60 820,420 820,610 0,820" fill="#b39f82" stroke={INK} strokeWidth="3" />
				<polygon points="1920,60 1100,420 1100,610 1920,820" fill="#6d604f" stroke={INK} strokeWidth="3" />
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
				{/* pigeons wheeling over the street */}
				{range(6).map((i) => gull(((f * 2.2 + i * 40) % 2400) - 300, 230 + Math.sin(f * 0.05 + i) * 30 + i * 8, 0.7, f * 0.5 + i, `p${i}`))}
			</Svg>
		),
	},
	{
		depth: 0.8,
		node: (f) => {
			const cols = ['#2b3b45', '#5a2c22', '#4a4a3a', '#22262d', '#5c6675', '#6b4a32'];
			const advance = f * 0.0009; // the march moves toward camera
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
						const step = Math.abs(Math.sin(f * 0.21 + i * 1.7)); // walking bounce
						const bob = -step * 6 * scale;
						const c = cols[i % cols.length];
						const sign = random(`ms${i}`) < 0.16;
						const tilt = Math.sin(f * 0.1 + i) * 4;
						return (
							<g key={i} transform={`translate(${x},${y + bob}) scale(${scale})`}>
								{sign ? (
									<g transform={`rotate(${tilt},0,-40)`}>
										<rect x={-3} y={-150} width={6} height={110} fill="#3a2f25" />
										<rect x={-44} y={-200} width={88} height={60} fill="#e6dcc6" stroke={INK} strokeWidth="2.5" />
										<rect x={-44} y={-200} width={30} height={60} fill="#c5b89c" />
									</g>
								) : null}
								<path d="M-46,60 Q-44,-10 0,-14 Q44,-10 46,60 Z" fill={c} stroke={INK} strokeWidth="2.5" />
								<path d="M-46,60 Q-44,-10 0,-14 L-6,60 Z" fill="#000" opacity="0.3" />
								<circle cx={0} cy={-40} r={24} fill="#5b4840" stroke={INK} strokeWidth="2.5" />
								<path d="M-24,-40 A24,24 0 0 1 0,-64 L0,-16 A24,24 0 0 1 -24,-40" fill="#33272a" />
							</g>
						);
					})}
				</Svg>
			);
		},
	},
];

// ================================================ A11 market analyst (rigged)
const analyst: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<rect width="1920" height="1080" fill="#0a0c11" />
				{range(22).map((i) => (
					<rect key={i} x={0} y={60 + i * 26} width={760} height={6} fill="#141c2a" />
				))}
				{/* city lights twinkling through the blinds */}
				{range(40).map((i) => (
					<rect key={`c${i}`} x={30 + random(`cx${i}`) * 700} y={70 + Math.floor(random(`cy${i}`) * 21) * 26 + 7} width={4} height={10} fill={i % 4 ? '#e59a3b' : '#9fb6d8'} opacity={0.25 + 0.5 * Math.abs(Math.sin(f * (0.03 + random(`cs${i}`) * 0.05) + i))} />
				))}
				<circle cx="1820" cy="220" r="240" fill={C.amber} opacity="0.06" />
				<rect x="0" y="840" width="1920" height="240" fill="#07080b" />
				{/* coffee cup with rising steam */}
				<rect x="700" y="790" width="70" height="60" rx="8" fill="#1a1416" stroke={INK} strokeWidth="3" />
				{range(3).map((i) => {
					const a = ((f + i * 25) % 75) / 75;
					return <path key={`st${i}`} d={`M${725 + i * 10},${786 - a * 90} q${12 * Math.sin(f * 0.1 + i)},-15 0,-30`} stroke="#c9c0b4" strokeWidth="3" fill="none" opacity={(1 - a) * 0.35} />;
				})}
			</Svg>
		),
	},
	{
		depth: 0.5,
		node: (f) => {
			const blink = blinkAt(f, 11, 46, 84);
			const flick = 0.85 + 0.15 * Math.sin(f * 1.3) * Math.sin(f * 0.21);
			return (
				<Svg>
					<defs>
						<linearGradient id="a11screen" x1="0" y1="1" x2="0" y2="0">
							<stop offset="0" stopColor="#6a1414" stopOpacity="0.95" />
							<stop offset="0.5" stopColor="#1a0b0c" />
							<stop offset="1" stopColor="#0b0809" />
						</linearGradient>
					</defs>
					<rect x="846" y="156" width="888" height="618" rx="10" fill="#040405" stroke={INK} strokeWidth="4" />
					<rect x="866" y="176" width="848" height="578" fill="url(#a11screen)" opacity={flick} />
					{/* the analyst's reflection in the blank screen (blinks with the analyst) */}
					<g opacity={0.52 + 0.06 * Math.sin(f * 0.3)} transform={`translate(${Math.sin(f * 0.02) * 4},0)`}>
						<polygon points="1080,330 1160,300 1230,340 1240,430 1210,510 1150,540 1100,500 1075,420" fill="#2a1b1d" />
						<polygon points="980,754 1010,620 1100,560 1200,560 1290,620 1320,754" fill="#1e1416" />
						<polyline points="1230,340 1240,430 1210,510" stroke={C.red} strokeWidth="4" fill="none" opacity="0.7" />
						<rect x="1168" y={398 + blink * 4} width="40" height={Math.max(1.5, 7 * (1 - blink))} fill="#3a2426" />
					</g>
					{/* scanlines rolling down */}
					{range(48).map((i) => (
						<rect key={i} x="866" y={176 + ((i * 12 + f * 1.5) % 578)} width="848" height="1" fill="#fff" opacity="0.03" />
					))}
					<rect x="866" y={176 + ((f * 4) % 578)} width="848" height="26" fill="#ff6a5a" opacity="0.05" />
					<rect x="1260" y="774" width="60" height="70" fill="#050506" />
					<rect x="1180" y="840" width="220" height="14" fill="#050506" />
				</Svg>
			);
		},
	},
	{
		depth: 1,
		node: (f) => {
			const blink = blinkAt(f, 11, 46, 84);
			const br = breathe(f, 2, 120);
			const scan = Math.sin(f * 0.045) * 3; // eyes scan the screen
			const furrow = 0.5 + 0.5 * Math.sin(f * 0.02);
			const tap = Math.max(0, Math.sin(f * 0.35)) ** 4; // fingers tapping the chin
			const glow = 0.8 + 0.2 * Math.sin(f * 1.3) * Math.sin(f * 0.21);
			return (
				<Svg>
					<g transform={`translate(0,${br * 2})`}>
						<polygon points="120,1080 160,760 300,650 520,640 640,740 700,1080" fill="#101218" stroke={INK} strokeWidth="5" />
						<polyline points="520,640 640,740 700,1080" stroke={C.red} strokeWidth="4" fill="none" opacity={0.6 * glow} />
						<polygon points="380,640 450,690 520,640 500,700 450,720 400,700" fill="#d8d2c4" stroke={INK} strokeWidth="3" />
					</g>
					<g transform={`translate(0,${br * 1.2}) rotate(${Math.sin(f * 0.015) * 1.2},450,600)`}>
						<polygon points="420,560 500,560 505,650 410,650" fill={SKIN_SH} />
						{/* profile head facing the monitor */}
						<polygon points="330,330 430,290 520,330 556,402 600,452 572,474 584,536 548,598 452,620 380,580 340,480" fill={SKIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
						<polygon points="330,330 400,300 384,450 414,612 380,580 340,480" fill={SKIN_SH} />
						<polyline points="520,330 556,402 600,452 572,474 584,536 548,598" stroke={C.red} strokeWidth="6" fill="none" opacity={glow} strokeLinejoin="round" />
						<line x1="548" y1="560" x2="568" y2="556" stroke={INK} strokeWidth="3" strokeLinecap="round" />
						{/* profile eye */}
						<clipPath id="a11eye">
							<polygon points={`512,${418 - 9 * (1 - blink)} 548,${414 - 7 * (1 - blink)} 550,${420 + 7 * (1 - blink)} 514,${424 + 4 * (1 - blink)}`} />
						</clipPath>
						<polygon points={`512,${418 - 9 * (1 - blink)} 548,${414 - 7 * (1 - blink)} 550,${420 + 7 * (1 - blink)} 514,${424 + 4 * (1 - blink)}`} fill="#ece6da" />
						<g clipPath="url(#a11eye)">
							<ellipse cx={538 + scan} cy="418" rx="8" ry="10" fill="#3b2a22" />
							<circle cx={541 + scan} cy="414" r="2.6" fill="#fff" />
						</g>
						<polygon points={`508,${410 + 9 * blink} 550,${405 + 9 * blink} 552,${411 + 8 * blink} 510,${416 + 8 * blink}`} fill={INK} />
						<polygon points={`500,${388 + 6 * furrow} 556,${384 + 8 * furrow} 558,${392 + 8 * furrow} 502,${396 + 6 * furrow}`} fill={HAIR} />
						<polygon points="310,360 330,280 430,250 540,300 560,360 520,352 500,318 470,340 430,312 400,340 360,330" fill={HAIR} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
						<polyline points="430,250 540,300" stroke={HAIR_HI} strokeWidth="5" fill="none" />
						<polyline points="430,290 520,330" stroke={C.amber} strokeWidth="4" fill="none" opacity="0.8" />
					</g>
					{/* hand at the chin, fingers tapping */}
					<g transform={`translate(0,${br * 1.2})`}>
						<polygon points="470,700 560,600 600,612 590,650 520,720" fill={SKIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
						<polygon points={`560,600 ${598 + tap * 4},${584 - tap * 10} ${610 + tap * 4},${596 - tap * 10} 600,612`} fill={SKIN} stroke={INK} strokeWidth="3" />
						<polyline points="560,600 600,612 590,650" stroke={C.red} strokeWidth="3" fill="none" opacity={0.7 * glow} />
						<polygon points="380,1080 470,700 530,712 520,1080" fill="#101218" stroke={INK} strokeWidth="4" />
					</g>
				</Svg>
			);
		},
	},
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
	A03: silhouette('#6b5a3a', 'a03'),
	A05: silhouette(C.rust, 'a05'),
	A06: bus,
	A08: march,
	A11: analyst,
	A15: chamber,
};
