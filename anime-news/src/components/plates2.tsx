/**
 * TEMPORARY PLACEHOLDER PLATES (continued) — anime-style, code-drawn stand-ins
 * for A02, A04, A07, A09, A10, A12, A13. Same rules as placeholders.tsx:
 * painted backgrounds without outlines, cel-shaded props with thin lines,
 * no insignia, no legible text, no real people.
 */
import React from 'react';
import {random} from 'remotion';
import {Cumulus, GodRays, Sparkle, range} from './anime/paint';
import {Reunion, Volunteer, Walker} from './anime/people';
import type {LayerSpec} from './placeholders';

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{children}
	</svg>
);
const LINE = '#2a1a1c';
const wrap = (v: number, m: number) => ((v % m) + m) % m;

// ============================================ A02 diplomatic corridor + table
export const corridor: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a02wall" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#24160f" />
						<stop offset="0.55" stopColor="#4e2e1c" />
						<stop offset="1" stopColor="#1c110b" />
					</linearGradient>
					<linearGradient id="a02far" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff1cf" />
						<stop offset="1" stopColor="#ffc777" />
					</linearGradient>
					<linearGradient id="a02win" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#ffe9bf" />
						<stop offset="1" stopColor="#e9a35c" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a02wall)" />
				{/* corridor in one-point perspective (vanishing point 430,470) */}
				<polygon points="120,150 740,150 480,420 380,420" fill="#2e1c12" />
				<polygon points="120,900 740,900 480,520 380,520" fill="#5a3a24" />
				<polygon points="120,150 380,420 380,520 120,900" fill="#3f2616" />
				<polygon points="740,150 480,420 480,520 740,900" fill="#6a4026" />
				<rect x="380" y="420" width="100" height="100" fill="url(#a02far)" />
				{/* doors and sconces receding */}
				{range(4).map((i) => {
					const t = i / 4;
					const xL = 120 + (380 - 120) * (0.15 + t * 0.7);
					const xR = 740 - (740 - 480) * (0.15 + t * 0.7);
					const top = 150 + (420 - 150) * (0.15 + t * 0.7) + 60 * (1 - t);
					const bot = 900 - (900 - 520) * (0.15 + t * 0.7);
					const w = 60 * (1 - t * 0.7);
					const glow = 0.75 + 0.25 * Math.sin(f * 0.07 + i);
					return (
						<g key={i}>
							<polygon points={`${xL},${top} ${xL + w * 0.6},${top + 14 * (1 - t)} ${xL + w * 0.6},${bot - 14 * (1 - t)} ${xL},${bot}`} fill="#2a180e" />
							<polygon points={`${xR},${top} ${xR - w},${top + 14 * (1 - t)} ${xR - w},${bot - 14 * (1 - t)} ${xR},${bot}`} fill="#4a2a18" />
							<circle cx={xR - w * 1.4} cy={top - 10} r={24 * (1 - t * 0.6)} fill="#ffc777" opacity={0.35 * glow} />
							<circle cx={xR - w * 1.4} cy={top - 10} r={7 * (1 - t * 0.6)} fill="#fff1cf" opacity={glow} />
						</g>
					);
				})}
				{range(6).map((i) => (
					<polygon key={`r${i}`} points={`${410 + i * 4},520 ${416 + i * 4},520 ${300 + i * 60},900 ${280 + i * 60},900`} fill="#ffd89a" opacity={0.06} />
				))}
				<rect x="112" y="142" width="636" height="766" fill="none" stroke="#1a0f08" strokeWidth="18" />
				{/* tall window with heavy curtains (no insignia) */}
				<rect x="1150" y="80" width="360" height="520" fill="url(#a02win)" />
				<rect x="1326" y="80" width="8" height="520" fill="#a8703a" />
				<rect x="1150" y="320" width="360" height="8" fill="#a8703a" />
				<path d="M1110,60 C1150,200 1130,420 1160,620 L1100,620 L1090,60 Z" fill="#5a1a1e" />
				<path d="M1550,60 C1510,200 1530,420 1500,620 L1560,620 L1570,60 Z" fill="#5a1a1e" />
				<path d="M1112,60 C1140,200 1128,420 1150,620" stroke="#a83a3a" strokeWidth="6" fill="none" opacity="0.6" />
				<GodRays id="a02r" x={1330} y={300} angle={Math.PI * 0.62} spread={0.6} length={800} count={6} color="#ffd89a" opacity={0.3} frame={f} />
				{/* empty high-back chairs behind the table */}
				{[1060, 1700].map((x) => (
					<g key={x}>
						<rect x={x - 70} y={470} width={140} height={230} rx={30} fill="#4a1a18" stroke={LINE} strokeWidth="2.6" />
						<rect x={x - 70} y={470} width={45} height={230} rx={22} fill="#2e0e0e" />
						<path d={`M${x + 56},${492} L${x + 56},${680}`} stroke="#ff9a6a" strokeWidth="4" opacity="0.6" />
					</g>
				))}
				{/* the table */}
				<polygon points="860,690 1920,670 1920,1080 800,1080" fill="#3a1d10" />
				<polygon points="860,690 1920,670 1920,700 856,722" fill="#7a4424" />
				<path d="M860,690 L1920,670" stroke="#ffcf8a" strokeWidth="3" opacity="0.8" />
				{range(5).map((i) => (
					<path key={i} d={`M${880 + i * 10},${740 + i * 60} L1920,${720 + i * 62}`} stroke="#5a2e18" strokeWidth="3" opacity="0.6" />
				))}
			</Svg>
		),
	},
	{
		depth: 0.7,
		node: () => (
			<Svg>
				{/* closed, blank folder */}
				<g transform="rotate(-6,1267,713)">
					<rect x="1112" y="640" width="310" height="200" rx="8" fill="#000" opacity="0.35" transform="translate(10,12)" />
					<rect x="1112" y="640" width="310" height="200" rx="8" fill="#5a1e24" stroke={LINE} strokeWidth="3" />
					<rect x="1112" y="640" width="310" height="10" rx="4" fill="#9a3a3e" />
					<rect x="1118" y="652" width="300" height="182" rx="6" fill="none" stroke="#7a2a30" strokeWidth="2" />
					<rect x="1394" y="700" width="26" height="40" rx="4" fill="#3a1014" stroke={LINE} strokeWidth="2" />
					<path d="M1130,650 L1400,650" stroke="#ffcf8a" strokeWidth="2" opacity="0.6" />
				</g>
			</Svg>
		),
	},
	{
		depth: 0.9,
		node: (f) => {
			const flick = 0.92 + 0.08 * Math.sin(f * 0.21) * Math.sin(f * 0.05);
			return (
				<Svg>
					<defs>
						<radialGradient id="a02glow" cx="1498" cy="500" r="520" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#fff0c8" stopOpacity="0.95" />
							<stop offset="0.2" stopColor="#ffc06a" stopOpacity="0.5" />
							<stop offset="1" stopColor="#ffa040" stopOpacity="0" />
						</radialGradient>
					</defs>
					<circle cx="1498" cy="500" r="520" fill="url(#a02glow)" opacity={flick} style={{mixBlendMode: 'screen'}} />
					<polygon points="1440,500 1556,500 1700,690 1300,700" fill="#ffd89a" opacity={0.16 * flick} />
					{/* brass desk lamp */}
					<ellipse cx="1560" cy="700" rx="56" ry="12" fill="#6a4a1a" stroke={LINE} strokeWidth="2.4" />
					<path d="M1556,696 L1530,560 L1512,520" stroke="#b8862e" strokeWidth="9" fill="none" strokeLinecap="round" />
					<path d="M1556,696 L1530,560 L1512,520" stroke="#ffe0a0" strokeWidth="2.4" fill="none" opacity="0.6" />
					<path d="M1428,500 L1568,500 L1540,450 L1456,450 Z" fill="#3a5a3a" stroke={LINE} strokeWidth="2.6" />
					<path d="M1456,450 L1540,450 L1548,466 L1450,466 Z" fill="#5a8a5a" />
					<rect x="1440" y="500" width="116" height="8" fill="#fff4d6" />
				</Svg>
			);
		},
	},
];

// ======================================================= A04 Knesset exterior
export const knesset: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a04sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#4f7cc0" />
						<stop offset="0.45" stopColor="#a9c3e2" />
						<stop offset="0.75" stopColor="#f6dcaa" />
					</linearGradient>
					<radialGradient id="a04sun" cx="960" cy="230" r="520" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff6dc" stopOpacity="1" />
						<stop offset="0.15" stopColor="#ffd79a" stopOpacity="0.6" />
						<stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a04sky)" />
				<g transform={`translate(${-f * 0.2},0)`}>
					<Cumulus id="k1" x={420} y={260} w={520} h={150} shadow="#9fb0d4" lit="#fff0dc" rim="#ffffff" light={[0.6, -0.5]} puffs={8} />
					<Cumulus id="k2" x={1600} y={300} w={600} h={170} shadow="#9fb0d4" lit="#ffeccf" rim="#ffffff" light={[-0.5, -0.5]} puffs={9} />
				</g>
				<rect width="1920" height="1080" fill="url(#a04sun)" />
				<circle cx="960" cy="230" r="34" fill="#fffaf0" />
				{/* hill and lawn */}
				<path d="M0,640 C300,600 700,610 960,600 C1240,590 1600,610 1920,640 L1920,1080 L0,1080 Z" fill="#6f9a52" />
				<path d="M0,700 C400,680 900,690 1920,720 L1920,1080 L0,1080 Z" fill="#5a8444" />
				<path d="M0,820 C600,790 1300,800 1920,840 L1920,1080 L0,1080 Z" fill="#4a7038" />
				{range(14).map((i) => (
					<path key={i} d={`M${100 + i * 130},${860 + (i % 3) * 20} l10,-22 l6,22`} stroke="#8fc06a" strokeWidth="3" fill="none" />
				))}
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: () => (
			<Svg>
				{/* cypress trees */}
				{[380, 440, 1700, 1760].map((x, i) => (
					<g key={x}>
						<path d={`M${x},${640} C${x - 26},${560} ${x - 14},${440 + (i % 2) * 30} ${x},${400 + (i % 2) * 30} C${x + 14},${440 + (i % 2) * 30} ${x + 26},560 ${x},640 Z`} fill="#2e4a2a" />
						<path d={`M${x},${400 + (i % 2) * 30} C${x + 14},${440 + (i % 2) * 30} ${x + 26},560 ${x},640 Z`} fill="#46683a" />
					</g>
				))}
				{/* the building: a long low block, flat roof slab, a colonnade of tall square pillars */}
				<rect x="520" y="360" width="1100" height="270" fill="#3a3c4c" />
				<rect x="500" y="330" width="1140" height="34" fill="#efe4cc" />
				<rect x="500" y="356" width="1140" height="10" fill="#b0a48e" />
				{range(15).map((i) => {
					const x = 528 + i * 72.5;
					return (
						<g key={i}>
							<rect x={x} y={366} width={40} height={264} fill="#efe4cc" />
							<rect x={x + 26} y={366} width={14} height={264} fill="#b3a68f" />
							<rect x={x + 40} y={366} width={32.5} height={264} fill="#2a2c3a" opacity={0.25} />
						</g>
					);
				})}
				<rect x="480" y="628" width="1180" height="22" fill="#d8ccb2" />
				<rect x="460" y="648" width="1220" height="16" fill="#b8ac92" />
				<rect x="440" y="662" width="1260" height="12" fill="#9a8e78" />
			</Svg>
		),
	},
];

// ============================================ A07 arrival point + reunion
export const arrival: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a07sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#8a9cba" />
						<stop offset="0.35" stopColor="#c9d2de" />
						<stop offset="0.5" stopColor="#f2dcc0" />
					</linearGradient>
					<radialGradient id="a07sun" cx="140" cy="420" r="700" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#ffe2b0" stopOpacity="0.85" />
						<stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a07sky)" />
				<g transform={`translate(${-f * 0.15},0)`}>
					<Cumulus id="r1" x={700} y={230} w={600} h={120} shadow="#a9b0c6" lit="#f2eef0" rim="#ffffff" light={[-0.6, -0.4]} puffs={8} />
				</g>
				<rect width="1920" height="1080" fill="url(#a07sun)" />
				{/* distant trees and ground */}
				<path d="M0,500 C200,470 400,480 600,470 C800,462 1000,476 1200,468 C1500,460 1700,474 1920,470 L1920,520 L0,520 Z" fill="#7a8aa0" />
				<rect x="0" y="516" width="1920" height="564" fill="#8a8c92" />
				<path d="M0,516 L1920,516 L1920,560 L0,600 Z" fill="#9a9ca4" />
				{/* puddles reflecting the sky */}
				{[
					[300, 900, 180],
					[1180, 960, 240],
					[640, 780, 120],
				].map(([x, y, w], i) => (
					<g key={i}>
						<ellipse cx={x} cy={y} rx={w} ry={w * 0.12} fill="#c9d4e4" opacity="0.8" />
						<ellipse cx={x - w * 0.3} cy={y - 2} rx={w * 0.3} ry={w * 0.03} fill="#fff" opacity={0.5 + 0.3 * Math.sin(f * 0.06 + i)} />
					</g>
				))}
				{/* two buses parked */}
				{[0, 1].map((b) => {
					const x = 1380 + b * 300;
					const y = 360 + b * 14;
					return (
						<g key={b}>
							<rect x={x} y={y} width={420} height={210} rx={22} fill={b ? '#e8ecf2' : '#f4f6fa'} stroke={LINE} strokeWidth="2.6" />
							<rect x={x} y={y + 150} width={420} height={60} rx={14} fill="#3d5a8a" />
							{range(5).map((w) => (
								<rect key={w} x={x + 20 + w * 78} y={y + 30} width={64} height={70} rx={6} fill="#9fb4d8" />
							))}
							{range(5).map((w) => (
								<rect key={`h${w}`} x={x + 24 + w * 78} y={y + 34} width={16} height={62} fill="#fff" opacity="0.5" />
							))}
							<circle cx={x + 80} cy={y + 212} r={30} fill="#1a1a22" />
							<circle cx={x + 340} cy={y + 212} r={30} fill="#1a1a22" />
							<circle cx={x + 80} cy={y + 212} r={12} fill="#8a8a96" />
							<circle cx={x + 340} cy={y + 212} r={12} fill="#8a8a96" />
						</g>
					);
				})}
				{/* canopy, tea table, volunteers, unbranded aid boxes */}
				<polygon points="1180,430 1640,430 1680,470 1140,470" fill="#f4f2ec" stroke={LINE} strokeWidth="2.4" />
				<rect x="1160" y="470" width="8" height="200" fill="#6a6a74" />
				<rect x="1652" y="470" width="8" height="200" fill="#6a6a74" />
				<Volunteer x={1300} y={548} s={0.95} f={f} hair="#4a2c22" vest="#e8a23a" offer seed={1} />
				<Volunteer x={1470} y={552} s={0.95} f={f} hair="#1d1a20" vest="#e8a23a" seed={4} />
				<rect x="1180" y="640" width="440" height="20" fill="#d8d2c6" stroke={LINE} strokeWidth="2.2" />
				<rect x="1190" y="660" width="420" height="70" fill="#b8b2a6" />
				<rect x="1420" y="590" width="44" height="52" rx="6" fill="#9aa2ae" stroke={LINE} strokeWidth="2" />
				{range(6).map((i) => (
					<rect key={i} x={1220 + i * 30} y={624} width={20} height={18} rx={3} fill="#f4efe6" stroke={LINE} strokeWidth="1.4" />
				))}
				{range(3).map((i) => (
					<path key={`st${i}`} d={`M${1232 + i * 60},${616 - ((f + i * 20) % 60) * 0.8} q6,-10 0,-20`} stroke="#fff" strokeWidth="2" fill="none" opacity={0.5 * (1 - ((f + i * 20) % 60) / 60)} />
				))}
				{[
					[1520, 700, 120, 80, '#c89a62'],
					[1650, 700, 110, 80, '#b8884e'],
					[1580, 630, 120, 72, '#d4a86e'],
					[1720, 720, 100, 60, '#f0eee8'],
					[1740, 668, 80, 54, '#f0eee8'],
				].map(([x, y, w, h, c], i) => (
					<g key={`bx${i}`}>
						<rect x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} stroke={LINE} strokeWidth="2.2" />
						<rect x={(x as number) + (w as number) * 0.45} y={y as number} width={(w as number) * 0.1} height={h as number} fill="#000" opacity="0.08" />
						<rect x={x as number} y={y as number} width={w as number} height={5} fill="#fff" opacity="0.35" />
					</g>
				))}
				{/* background arrivals walking with bags */}
				{[
					[300, 520, 0.9, '#5a6a7a'],
					[420, 530, 0.85, '#7a4a3a'],
					[1040, 515, 0.8, '#4a5a4a'],
				].map(([x, y, s, c], i) => (
					<Walker key={i} x={x as number} y={y as number} s={s as number} f={f} coat={c as string} seed={i} />
				))}
			</Svg>
		),
	},
	{depth: 0.8, node: (f) => <Svg><Reunion f={f} /></Svg>},
];

// ================================= A09 Paris at dusk, distant police lights
export const policeLights: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => {
			const blue = (f % 16) < 8;
			return (
				<Svg>
					<defs>
						<linearGradient id="a09sky" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#1e2050" />
							<stop offset="0.45" stopColor="#5a4a7a" />
							<stop offset="0.6" stopColor="#c88a72" />
						</linearGradient>
					</defs>
					<rect width="1920" height="1080" fill="url(#a09sky)" />
					<polygon points="0,0 820,430 820,640 0,900" fill="#1e1a2e" />
					<polygon points="1920,0 1100,430 1100,640 1920,900" fill="#16142a" />
					{range(40).map((i) => {
						const side = i % 2;
						const t = random(`pw${i}`);
						const x = side ? 1920 - t * 780 : t * 780;
						const yb = 60 + t * 360 + random(`py${i}`) * (700 - t * 420);
						const s = 1 - t * 0.6;
						return <rect key={i} x={x} y={yb} width={22 * s} height={30 * s} fill="#ffb45c" opacity={random(`po${i}`) < 0.5 ? 0.85 : 0.15} />;
					})}
					<polygon points="0,900 820,640 1100,640 1920,900 1920,1080 0,1080" fill="#2a2638" />
					<polygon points="900,640 1020,640 1200,1080 720,1080" fill="#34304a" />
					{/* streetlights */}
					{[300, 600, 1320, 1620].map((x, i) => (
						<g key={x}>
							<rect x={x} y={400 + (i % 2) * 20} width="6" height={300 - (i % 2) * 20} fill="#0e0c18" />
							<circle cx={x + 3} cy={400 + (i % 2) * 20} r="40" fill="#ffb45c" opacity="0.25" />
							<circle cx={x + 3} cy={400 + (i % 2) * 20} r="7" fill="#ffe0a8" />
						</g>
					))}
					{/* distant police lights and their reflections on the wet street */}
					<circle cx="940" cy="612" r="90" fill={blue ? '#3a7aff' : '#ff3a4a'} opacity="0.22" />
					<circle cx="990" cy="612" r="70" fill={blue ? '#ff3a4a' : '#3a7aff'} opacity="0.14" />
					<rect x="926" y="606" width="14" height="8" fill="#6aa0ff" opacity={blue ? 1 : 0.25} />
					<rect x="944" y="606" width="14" height="8" fill="#ff5a6a" opacity={blue ? 0.25 : 1} />
					<rect x="984" y="610" width="12" height="7" fill="#6aa0ff" opacity={blue ? 0.3 : 1} />
					<rect x="998" y="610" width="12" height="7" fill="#ff5a6a" opacity={blue ? 1 : 0.3} />
					<rect x="930" y="640" width="24" height="120" fill={blue ? '#3a7aff' : '#ff3a4a'} opacity="0.12" />
					{/* a few small, distant, anonymous silhouettes */}
					{[860, 900, 1040, 1080, 1120].map((x, i) => (
						<g key={x} transform={`translate(${x},${630 + (i % 2) * 6}) scale(0.5)`}>
							<rect x="-8" y="-10" width="16" height="36" rx="6" fill="#0a0812" />
							<circle cx="0" cy="-18" r="8" fill="#0a0812" />
						</g>
					))}
				</Svg>
			);
		},
	},
	{
		depth: 0.7,
		node: (f) => (
			<Svg>
				{range(7).map((i) => {
					const x = wrap(i * 380 + f * (0.6 + i * 0.1), 2400) - 300;
					return <ellipse key={i} cx={x} cy={560 + (i % 3) * 40} rx={360} ry={70} fill="#8a8aa8" opacity={0.16} />;
				})}
			</Svg>
		),
	},
];

// ===================================================== A10 server corridor
export const servers: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a10floor" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0a1a3a" />
						<stop offset="1" stopColor="#1a3a7a" />
					</linearGradient>
					<radialGradient id="a10end" cx="960" cy="520" r="300" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#bfe0ff" stopOpacity="0.9" />
						<stop offset="1" stopColor="#3a7acc" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width="1920" height="1080" fill="#050a1a" />
				<polygon points="0,1080 1920,1080 1010,560 910,560" fill="url(#a10floor)" />
				<polygon points="0,0 1920,0 1010,480 910,480" fill="#08122a" />
				{range(9).map((i) => (
					<polygon key={`lt${i}`} points={`${930 - i * 3},${482 - i * 2} ${990 + i * 3},${482 - i * 2} ${1920 - i * 40},${0} ${0 + i * 40},0`} fill="#9fd0ff" opacity={i === 0 ? 0.05 : 0} />
				))}
				<rect x="940" y="440" width="40" height="8" fill="#cfe8ff" />
				{/* racks receding on both sides */}
				{range(8).map((k) => {
					const t0 = k / 8;
					const t1 = (k + 0.85) / 8;
					const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.pow(t, 0.55);
					const xl0 = lerp(0, 910, t0);
					const xl1 = lerp(0, 910, t1);
					const yt0 = lerp(0, 480, t0);
					const yt1 = lerp(0, 480, t1);
					const yb0 = lerp(1080, 560, t0);
					const yb1 = lerp(1080, 560, t1);
					const xr0 = 1920 - xl0;
					const xr1 = 1920 - xl1;
					return (
						<g key={k}>
							<polygon points={`${xl0},${yt0} ${xl1},${yt1} ${xl1},${yb1} ${xl0},${yb0}`} fill="#0e1a36" stroke="#1e3a6a" strokeWidth="2" />
							<polygon points={`${xr0},${yt0} ${xr1},${yt1} ${xr1},${yb1} ${xr0},${yb0}`} fill="#0c1630" stroke="#1e3a6a" strokeWidth="2" />
							{range(10).map((r) =>
								range(3).map((c) => {
									const ty = 0.15 + r * 0.075;
									const tx = 0.25 + c * 0.25;
									const xL = xl0 + (xl1 - xl0) * tx;
									const yL = yt0 + (yb0 - yt0) * ty + ((yt1 - yt0) - 0) * tx * 0.5;
									const xR = xr0 + (xr1 - xr0) * tx;
									const on = Math.sin(f * (0.2 + random(`led${k}${r}${c}`) * 0.6) + k * 3 + r) > 0.2;
									const amber = random(`la${k}${r}${c}`) < 0.18;
									const s = 4 * (1 - t0 * 0.8);
									return (
										<g key={`${r}-${c}`}>
											<rect x={xL} y={yL} width={s} height={s * 0.7} fill={amber ? '#ffb45c' : '#5ab8ff'} opacity={on ? 1 : 0.25} />
											<rect x={xR - s} y={yL} width={s} height={s * 0.7} fill={amber ? '#ffb45c' : '#5ab8ff'} opacity={on ? 0.3 : 1} />
										</g>
									);
								}),
							)}
						</g>
					);
				})}
				<rect width="1920" height="1080" fill="url(#a10end)" />
				{range(10).map((i) => (
					<rect key={`fr${i}`} x={0} y={600 + i * 48} width={1920} height={2} fill="#8ac8ff" opacity={0.06} />
				))}
			</Svg>
		),
	},
];

// ====================================================== A12 US Capitol at dusk
export const capitol: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => (
			<Svg>
				<defs>
					<linearGradient id="a12sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0e1436" />
						<stop offset="0.55" stopColor="#2a3a72" />
						<stop offset="0.8" stopColor="#7a5a8a" />
					</linearGradient>
				</defs>
				<rect width="1920" height="1080" fill="url(#a12sky)" />
				{range(24).map((i) => (
					<Sparkle key={i} x={random(`cs${i}`) * 1920} y={20 + random(`cy${i}`) * 300} r={2.5 + random(`cr${i}`) * 3.5} phase={f * 0.07 + i * 1.9} color="#e8ecff" />
				))}
				<g transform={`translate(${-f * 0.12},0)`}>
					<Cumulus id="c1" x={300} y={420} w={520} h={110} shadow="#2e3466" lit="#6a5a8a" rim="#b08aa8" light={[0.4, 0.6]} puffs={7} />
					<Cumulus id="c2" x={1660} y={380} w={560} h={120} shadow="#2e3466" lit="#6a5a8a" rim="#b08aa8" light={[-0.4, 0.6]} puffs={8} />
				</g>
			</Svg>
		),
	},
	{
		depth: 0.6,
		node: (f) => {
			const lit = (i: number) => 0.7 + 0.3 * Math.sin(f * 0.05 + i);
			const LIT = '#e9e4ee';
			const SH = '#9a98b8';
			return (
				<Svg>
					{/* wings */}
					{[300, 1120].map((x, w) => (
						<g key={x}>
							<rect x={x} y={560} width={500} height={150} fill={LIT} />
							<rect x={x} y={560} width={500} height={14} fill="#fff" />
							<rect x={x + (w ? 0 : 380)} y={560} width={120} height={150} fill={SH} opacity="0.5" />
							{range(12).map((i) => (
								<rect key={i} x={x + 20 + i * 40} y={590} width={8} height={110} fill={SH} />
							))}
							{range(11).map((i) => (
								<rect key={`w${i}`} x={x + 34 + i * 40} y={610} width={12} height={20} fill="#ffcf7a" opacity={lit(i + w * 5)} />
							))}
							<polygon points={`${x + 180},560 ${x + 250},526 ${x + 320},560`} fill={LIT} />
						</g>
					))}
					{/* central block + portico */}
					<rect x="790" y="520" width="340" height="190" fill={LIT} />
					<polygon points="830,540 960,488 1090,540" fill="#fff" />
					<polygon points="850,536 960,494 1070,536" fill={SH} opacity="0.4" />
					{range(8).map((i) => (
						<rect key={i} x={842 + i * 32} y={548} width={10} height={150} fill={SH} />
					))}
					{/* drum, peristyle, dome, lantern, statue */}
					<rect x="830" y="420" width="260" height="104" fill={LIT} />
					{range(13).map((i) => (
						<rect key={i} x={836 + i * 20} y={428} width={7} height={92} fill={SH} />
					))}
					<rect x="822" y="412" width="276" height="12" fill="#fff" />
					<rect x="860" y="350" width="200" height="64" fill={LIT} />
					{range(9).map((i) => (
						<rect key={i} x={872 + i * 21} y={362} width={10} height={36} rx={4} fill="#ffcf7a" opacity={lit(i)} />
					))}
					<path d="M868,352 C868,250 910,212 960,206 C1010,212 1052,250 1052,352 Z" fill={LIT} />
					<path d="M960,206 C1010,212 1052,250 1052,352 L1010,352 C1008,270 990,224 960,206 Z" fill={SH} opacity="0.6" />
					{range(7).map((i) => (
						<path key={i} d={`M${960 + (i - 3) * 2},208 Q${960 + (i - 3) * 30},260 ${960 + (i - 3) * 30},352`} stroke={SH} strokeWidth="2" fill="none" />
					))}
					<rect x="944" y="176" width="32" height="34" fill={LIT} />
					{range(4).map((i) => (
						<rect key={i} x={948 + i * 8} y={180} width={3} height={26} fill={SH} />
					))}
					<path d="M940,178 Q960,160 980,178 Z" fill={LIT} />
					<path d="M956,160 L964,160 L966,134 L960,126 L954,134 Z" fill="#2a2e4a" />
					{/* steps, lawn, trees */}
					<polygon points="840,710 1080,710 1140,760 780,760" fill="#c9c6d8" />
					<rect x="0" y="708" width="1920" height="372" fill="#1a2a2a" />
					<path d="M0,760 C500,740 1400,740 1920,770 L1920,1080 L0,1080 Z" fill="#12201e" />
					{[120, 220, 1700, 1800].map((x, i) => (
						<circle key={x} cx={x} cy={680 + (i % 2) * 20} r={90} fill="#0c1614" />
					))}
				</Svg>
			);
		},
	},
];

// ===================================================== A13 polling place
export const polling: LayerSpec[] = [
	{
		depth: 0,
		node: (f) => {
			const flick = 0.92 + 0.08 * Math.sin(f * 0.13);
			return (
				<Svg>
					<defs>
						<linearGradient id="a13wall" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#5a4636" />
							<stop offset="1" stopColor="#8a6e52" />
						</linearGradient>
						<radialGradient id="a13pool" cx="960" cy="760" r="520" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ffc777" stopOpacity="0.5" />
							<stop offset="1" stopColor="#ffc777" stopOpacity="0" />
						</radialGradient>
					</defs>
					<rect width="1920" height="1080" fill="url(#a13wall)" />
					{[480, 960, 1440].map((x) => (
						<g key={x}>
							<rect x={x - 90} y={30} width={180} height={14} rx={6} fill="#fff4d8" opacity={flick} />
							<polygon points={`${x - 90},44 ${x + 90},44 ${x + 220},400 ${x - 220},400`} fill="#ffe6b0" opacity={0.08 * flick} />
						</g>
					))}
					{/* the closed door, light leaking around it */}
					<rect x="830" y="260" width="260" height="460" fill="#3a281c" />
					<rect x="850" y="280" width="220" height="430" fill="#7a4a2a" stroke={LINE} strokeWidth="3" />
					<rect x="850" y="280" width="60" height="430" fill="#5a3420" />
					<rect x="870" y="310" width="180" height="150" rx="4" fill="none" stroke="#5a3420" strokeWidth="4" />
					<rect x="870" y="490" width="180" height="190" rx="4" fill="none" stroke="#5a3420" strokeWidth="4" />
					<circle cx="1046" cy="500" r="9" fill="#e8c27a" stroke={LINE} strokeWidth="2" />
					<rect x="850" y="708" width="220" height="6" fill="#ffd89a" opacity={0.9 * flick} />
					<polygon points="850,714 1070,714 1180,820 740,820" fill="#ffd89a" opacity={0.18 * flick} />
					{/* polished floor */}
					<rect x="0" y="720" width="1920" height="360" fill="#6a4a30" />
					{range(9).map((i) => (
						<rect key={i} x={0} y={730 + i * 40} width={1920} height={2} fill="#2a1a10" opacity="0.4" />
					))}
					<rect x="900" y="730" width="120" height="300" fill="#ffd89a" opacity="0.08" />
					<rect width="1920" height="1080" fill="url(#a13pool)" />
					{/* voting booths with plain curtains (no signage) */}
					{[1340, 1560].map((x) => (
						<g key={x}>
							<rect x={x} y={360} width={180} height={380} fill="#4a5a7a" stroke={LINE} strokeWidth="2.6" />
							<path d={`M${x + 10},${370} ${range(6).map((k) => `Q${x + 25 + k * 30},${380} ${x + 40 + k * 30},${370}`).join(' ')}`} stroke="#2a3450" strokeWidth="3" fill="none" />
							{range(5).map((k) => (
								<path key={k} d={`M${x + 30 + k * 30},380 L${x + 30 + k * 30 + Math.sin(f * 0.04 + k) * 2},730`} stroke="#3a4a68" strokeWidth="4" />
							))}
							<rect x={x} y={360} width={180} height={12} fill="#7a8aaa" />
						</g>
					))}
					{/* ballot box, blank */}
					<rect x="330" y="700" width="300" height="40" fill="#5a4030" stroke={LINE} strokeWidth="2.4" />
					<rect x="360" y="560" width="240" height="140" rx="8" fill="#9aa6b8" stroke={LINE} strokeWidth="3" />
					<rect x="360" y="560" width="70" height="140" rx="6" fill="#6a7690" />
					<rect x="430" y="574" width="110" height="10" rx="4" fill="#2a2e3a" />
					<rect x="590" y="566" width="6" height="128" fill="#fff" opacity="0.5" />
				</Svg>
			);
		},
	},
];
