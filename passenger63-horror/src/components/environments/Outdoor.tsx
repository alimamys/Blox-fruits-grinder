// Outdoor environments: <OceanNight/>, <FerryExterior/>, <Harbor/>, <Underwater/>.
// Simple layered SVG - no photorealism. The sea is almost black.
import React from 'react';
import {boilOf, h01, h1, wob, wobLine, wobPoly, wobRect} from '../../utils/rough';

const INK = '#0e0e10';

export type SeaMood = 'night' | 'red' | 'day' | 'dark';

const SEA = {
	night: {sky: ['#020309', '#070d1a', '#0c1628'], sea: ['#08101d', '#070d18', '#060b14', '#050912', '#04070f', '#03060c', '#02040a'], crest: '#1d2d48'},
	dark: {sky: ['#000', '#020307', '#04070d'], sea: ['#04070c', '#03060a', '#030509', '#020407', '#020306', '#010205', '#010104'], crest: '#0e1626'},
	red: {sky: ['#080000', '#140303', '#1e0606'], sea: ['#180405', '#140304', '#110304', '#0e0203', '#0b0202', '#080102', '#060101'], crest: '#3a0d0d'},
	day: {sky: ['#7fb3e0', '#a9cdea', '#d6e8f3'], sea: ['#3d6f99', '#386894', '#33618c', '#2d5a84', '#28527b', '#234b72', '#1f456a'], crest: '#cfe3f2'},
};

/** OceanNight - layered SVG waves. `calm` (0..1) makes the sea unnaturally still. */
export const OceanNight: React.FC<{
	f: number;
	horizon?: number;
	calm?: number;
	mood?: SeaMood;
	stars?: boolean;
	fog?: number;
	moon?: boolean;
	speed?: number;
	glow?: string;
}> = ({f, horizon = 560, calm = 0, mood = 'night', stars = true, fog = 0, moon = false, speed = 1, glow}) => {
	const pal = SEA[mood];
	const layers = pal.sea.length;
	const still = 1 - 0.93 * calm;
	const waves: React.ReactNode[] = [];
	for (let i = 0; i < layers; i++) {
		const depth = i / (layers - 1);
		const y0 = horizon + Math.pow(depth, 1.6) * (1080 - horizon + 80) + 4;
		const A = (2 + depth * 18) * still;
		const W = 180 + depth * 420;
		const ph = (f / 30) * (0.8 + depth * 1.2) * speed * still + i * 1.7;
		const pts: Array<[number, number]> = [];
		for (let x = -120; x <= 2040; x += 60) {
			pts.push([x, y0 + A * Math.sin((x / W) * Math.PI * 2 + ph) + A * 0.35 * Math.sin((x / (W * 0.37)) * Math.PI * 2 - ph * 1.6)]);
		}
		const top = wob(pts, i * 13 + 5, 1.2 * still + 0.2, false);
		waves.push(<path key={`w${i}`} d={`${top} L2040,1200 L-120,1200 Z`} fill={pal.sea[i]} />);
		if (i > 0 && i < layers - 1)
			waves.push(<path key={`c${i}`} d={top} fill="none" stroke={pal.crest} strokeWidth={1.5 + depth * 2} opacity={0.35 * (1 - depth * 0.4) * (0.4 + still * 0.6)} />);
	}
	return (
		<g>
			<defs>
				<linearGradient id={`sky-${mood}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={pal.sky[0]} />
					<stop offset="0.7" stopColor={pal.sky[1]} />
					<stop offset="1" stopColor={pal.sky[2]} />
				</linearGradient>
				<radialGradient id="fogGrad">
					<stop offset="0" stopColor="#9aa7b8" stopOpacity="0.35" />
					<stop offset="1" stopColor="#9aa7b8" stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect x={-200} y={-200} width={2320} height={horizon + 210} fill={`url(#sky-${mood})`} />
			{stars && mood !== 'day'
				? Array.from({length: 46}, (_, i) => (
						<circle key={i} cx={h01(i, 1) * 1920} cy={h01(i, 2) * (horizon - 60)} r={h01(i, 3) * 1.6 + 0.5} fill="#cfd8e6" opacity={0.25 + 0.5 * h01(i, Math.floor(f / 20) % 3 === 0 ? 4 : 5)} />
					))
				: null}
			{moon ? <circle cx={1500} cy={170} r={34} fill="#d9dde3" opacity={0.25} /> : null}
			{glow ? <ellipse cx={960} cy={horizon} rx={900} ry={50} fill={glow} opacity={0.18} /> : null}
			<path d={wobLine(-120, horizon, 2040, horizon, 7, 1, 8)} stroke={pal.crest} strokeWidth={2} opacity={0.45} />
			{waves}
			{fog > 0
				? [0, 1, 2, 3].map((i) => (
						<ellipse
							key={`fog${i}`}
							cx={((i * 610 + f * (0.4 + i * 0.15)) % 2600) - 340}
							cy={horizon - 10 + i * 40}
							rx={700}
							ry={90 + i * 20}
							fill="url(#fogGrad)"
							opacity={fog}
						/>
					))
				: null}
		</g>
	);
};

/** The ferry - NORTH STAR 8 - in side view. Origin = waterline centre. */
export const FerryExterior: React.FC<{
	f: number;
	x?: number;
	y?: number;
	s?: number;
	lights?: 'on' | 'off' | 'red' | 'dim';
	wake?: number;
	rock?: number;
	tinyWoman?: boolean;
	day?: boolean;
	ripples?: Array<{at: number; x: number}>;
	reflections?: boolean;
}> = ({f, x = 960, y = 640, s = 1, lights = 'on', wake = 1, rock = 1, tinyWoman = false, day = false, ripples = [], reflections = true}) => {
	const b = boilOf(f, 4);
	const sd = 500 + b * 3;
	const rot = Math.sin(f / 48) * 0.8 * rock;
	const bob = Math.sin(f / 37) * 4 * rock;
	const win = lights === 'on' ? '#ffd56a' : lights === 'dim' ? '#9a7a3a' : lights === 'red' ? '#a3191b' : '#121418';
	const hullTop = day ? '#f4f4f2' : '#d9dce2';
	const hullLow = '#173a6b';
	const windows = (x0: number, x1: number, yy: number, w: number, h: number, n: number, seed: number) =>
		Array.from({length: n}, (_, i) => {
			const wx = x0 + ((x1 - x0) * (i + 0.5)) / n - w / 2;
			const flick = lights === 'on' && h01(i, seed, Math.floor(f / 9)) > 0.985 ? 0.6 : 1;
			return <path key={`${seed}-${i}`} d={wobRect(wx, yy, w, h, sd + seed + i, 1)} fill={win} opacity={flick} stroke={INK} strokeWidth={3} />;
		});
	return (
		<g>
			{/* light spill on the water */}
			{reflections && lights !== 'off' ? (
				<g opacity={lights === 'on' ? 0.5 : 0.35}>
					{Array.from({length: 22}, (_, i) => {
						const rx = x + (-480 + i * 45) * s;
						const len = 30 + h01(i, 9, Math.floor(f / 6)) * 70;
						return <rect key={i} x={rx} y={y + 18 * s + h01(i, 3) * 20} width={10 * s} height={len * s} fill={win} opacity={0.15 + 0.25 * h01(i, Math.floor(f / 5))} />;
					})}
				</g>
			) : null}
			{/* wake */}
			{wake > 0
				? [0, 1, 2].map((i) => (
						<path
							key={`wake${i}`}
							d={wobLine(x - 560 * s, y + 8 * s + i * 7, x - (900 + i * 300 + ((f * 3) % 120)) * s, y + (16 + i * 12) * s, sd + 70 + i, 3, 4)}
							stroke={day ? '#fff' : '#8fa3bd'}
							strokeWidth={(5 - i) * s}
							opacity={wake * (0.5 - i * 0.12)}
							fill="none"
						/>
					))
				: null}
			{ripples.map((r, i) => {
				const d = f - r.at;
				if (d < 0 || d > 70) return null;
				return [0, 1, 2].map((k) => {
					const rr = (d * 6 + k * 40) * s;
					return <ellipse key={`rp${i}-${k}`} cx={x + r.x * s} cy={y + 14 * s} rx={rr} ry={rr * 0.18} fill="none" stroke="#9fb3cc" strokeWidth={3} opacity={Math.max(0, 0.6 - d / 70 - k * 0.12)} />;
				});
			})}
			<g transform={`translate(${x},${y + bob}) rotate(${rot}) scale(${s})`}>
				{/* superstructure */}
				<path d={wobPoly([[-470, -122], [390, -122], [370, -212], [-470, -212]], sd + 1, 2)} fill={hullTop} stroke={INK} strokeWidth={6} />
				{windows(-450, 360, -190, 30, 34, 17, 10)}
				<path d={wobPoly([[-380, -212], [300, -212], [280, -288], [-380, -288]], sd + 2, 2)} fill={hullTop} stroke={INK} strokeWidth={6} />
				{windows(-360, 270, -268, 28, 30, 13, 30)}
				{/* lifeboats */}
				<path d={wobPoly([[-330, -300], [-200, -300], [-215, -322], [-318, -322]], sd + 3, 2)} fill="#e26a1c" stroke={INK} strokeWidth={4} />
				<path d={wobPoly([[-60, -300], [70, -300], [55, -322], [-48, -322]], sd + 4, 2)} fill="#e26a1c" stroke={INK} strokeWidth={4} />
				{/* bridge */}
				<path d={wobPoly([[110, -288], [330, -288], [350, -346], [130, -346]], sd + 5, 2)} fill={hullTop} stroke={INK} strokeWidth={6} />
				<path d={wobPoly([[140, -308], [335, -308], [342, -334], [146, -334]], sd + 6, 1.5)} fill={lights === 'off' ? '#0c0f14' : lights === 'red' ? '#4a0a0a' : '#2d3d52'} stroke={INK} strokeWidth={4} />
				{/* funnel */}
				<path d={wobPoly([[-215, -288], [-120, -288], [-130, -392], [-205, -392]], sd + 7, 2)} fill="#1b3f73" stroke={INK} strokeWidth={6} />
				<path d={wobPoly([[-210, -350], [-126, -350], [-127, -366], [-208, -366]], sd + 8, 1)} fill="#e8c547" stroke={INK} strokeWidth={3} />
				{/* mast + navigation lights */}
				<path d={wobLine(230, -346, 230, -460, sd + 9, 1.5, 2)} stroke={INK} strokeWidth={6} />
				<circle cx={230} cy={-462} r={8} fill="#fff" opacity={lights === 'off' ? 0.25 : 1} />
				<circle cx={230} cy={-462} r={22} fill="#fff" opacity={lights === 'off' ? 0 : 0.18} />
				<circle cx={350} cy={-300} r={7} fill="#2fe06a" opacity={lights === 'off' ? 0.2 : 1} />
				<circle cx={350} cy={-300} r={18} fill="#2fe06a" opacity={lights === 'off' ? 0 : 0.2} />
				<circle cx={-470} cy={-140} r={6} fill="#ff3b30" opacity={lights === 'off' ? 0.2 : 0.4 + 0.6 * (Math.floor(f / 15) % 2)} />
				{/* hull */}
				<path d={wobPoly([[-575, -128], [560, -128], [640, -150], [540, 12], [-555, 12]], sd + 11, 2.5)} fill={hullTop} stroke={INK} strokeWidth={7} />
				<path d={wobPoly([[-560, -40], [585, -40], [540, 12], [-555, 12]], sd + 12, 2)} fill={hullLow} stroke={INK} strokeWidth={6} />
				<path d={wobLine(-560, -52, 590, -52, sd + 13, 1.5, 6)} stroke="#e8c547" strokeWidth={6} />
				{/* portholes */}
				{Array.from({length: 9}, (_, i) => (
					<circle key={`ph${i}`} cx={-430 + i * 110} cy={-92} r={9} fill={lights === 'off' ? '#111' : lights === 'red' ? '#7a1515' : '#e9c25a'} stroke={INK} strokeWidth={3} />
				))}
				<text x={20} y={-62} fontFamily="Permanent Marker" fontSize={40} fill="#13294d" textAnchor="middle" letterSpacing={3}>
					NORTH STAR 8
				</text>
				{/* stern rail (rear deck) */}
				<path d={wobLine(-575, -165, -470, -165, sd + 14, 1, 3)} stroke={INK} strokeWidth={4} />
				{[-570, -545, -520, -495].map((px, i) => (
					<path key={`rl${i}`} d={wobLine(px, -128, px, -165, sd + 15 + i, 0.8, 1)} stroke={INK} strokeWidth={3} />
				))}
				{tinyWoman ? (
					<g opacity={0.92}>
						<rect x={-536} y={-152} width={12} height={22} fill="#0b0b0c" />
						<circle cx={-530} cy={-157} r={5} fill="#d9d4cc" />
						<circle cx={-530} cy={-162} r={3} fill="#a9a9a6" />
					</g>
				) : null}
			</g>
		</g>
	);
};

/** Distant harbour lights / skyline. variant: 'port' (Port Mason) or 'island' (Bell Island). */
export const Harbor: React.FC<{
	f: number;
	variant?: 'port' | 'island';
	horizon?: number;
	police?: boolean;
	distant?: boolean;
	ferry?: React.ReactNode;
}> = ({f, variant = 'port', horizon = 600, police = false, distant = false, ferry}) => {
	const sd = 900 + boilOf(f, 4) * 3;
	if (distant) {
		return (
			<g>
				{Array.from({length: 38}, (_, i) => {
					const x = 520 + h01(i, 1) * 900;
					const y = horizon - 4 - h01(i, 2) * 26;
					const c = h01(i, 3) > 0.7 ? '#ff9b3d' : '#ffe08a';
					return <circle key={i} cx={x} cy={y} r={1.6 + h01(i, 4) * 1.6} fill={c} opacity={0.6 + 0.4 * h01(i, Math.floor(f / 10))} />;
				})}
				<ellipse cx={960} cy={horizon} rx={520} ry={22} fill="#ffb35c" opacity={0.08} />
			</g>
		);
	}
	const buildings = Array.from({length: 14}, (_, i) => {
		const w = 90 + h01(i, 1, variant === 'port' ? 1 : 2) * 120;
		const h = 80 + h01(i, 2) * (variant === 'port' ? 220 : 110);
		const x = -60 + i * 145;
		return {x, w, h};
	});
	return (
		<g>
			{buildings.map((bd, i) => (
				<g key={i}>
					<path d={wobRect(bd.x, horizon - bd.h, bd.w, bd.h + 4, sd + i, 1.5)} fill="#0b0f18" stroke="#000" strokeWidth={3} />
					{Array.from({length: Math.floor(bd.h / 34)}, (_, r) =>
						Array.from({length: Math.floor(bd.w / 30)}, (_, c) =>
							h01(i, r, c) > 0.55 ? <rect key={`${r}-${c}`} x={bd.x + 10 + c * 30} y={horizon - bd.h + 14 + r * 34} width={12} height={14} fill="#f6d27a" opacity={0.75} /> : null,
						),
					)}
				</g>
			))}
			{/* quay */}
			<path d={wobPoly([[-40, horizon], [1960, horizon], [1960, horizon + 70], [-40, horizon + 70]], sd + 40, 2)} fill="#24272d" stroke="#000" strokeWidth={4} />
			{[180, 520, 860, 1200, 1540, 1860].map((lx, i) => (
				<g key={`lamp${i}`}>
					<ellipse cx={lx} cy={horizon - 120} rx={90} ry={110} fill="#ffad4d" opacity={0.12} />
					<path d={wobLine(lx, horizon, lx, horizon - 140, sd + 50 + i, 1, 2)} stroke="#111" strokeWidth={6} />
					<circle cx={lx} cy={horizon - 144} r={9} fill="#ffc26b" />
				</g>
			))}
			<g transform={`translate(${variant === 'port' ? 1260 : 380}, ${horizon - 250})`}>
				<path d={wobRect(0, 0, 420, 70, sd + 60, 1.5)} fill="#0e2340" stroke="#000" strokeWidth={4} />
				<text x={210} y={47} textAnchor="middle" fontFamily="Patrick Hand" fontSize={36} fill="#eef3f8">
					{variant === 'port' ? 'PORT MASON FERRY TERMINAL' : 'BELL ISLAND TERMINAL'}
				</text>
			</g>
			{ferry}
			{police
				? [0, 1].map((i) => {
						const px = 300 + i * 360;
						const on = Math.floor(f / 6 + i) % 2;
						return (
							<g key={`pc${i}`} transform={`translate(${px}, ${horizon + 40})`}>
								<ellipse cx={80} cy={-70} rx={180} ry={110} fill={on ? '#2a5bff' : '#ff2a2a'} opacity={0.16} />
								<path d={wobPoly([[0, 0], [190, 0], [175, -55], [135, -60], [110, -95], [40, -95], [20, -55], [0, -50]], sd + 70 + i, 2)} fill="#e9ecef" stroke="#000" strokeWidth={5} />
								<path d={wobRect(10, -40, 170, 14, sd + 72 + i, 1)} fill="#1d3f9a" />
								<rect x={55} y={-108} width={30} height={12} fill={on ? '#2a5bff' : '#330'} />
								<rect x={85} y={-108} width={30} height={12} fill={on ? '#300' : '#ff2a2a'} />
								<circle cx={40} cy={2} r={20} fill="#111" />
								<circle cx={150} cy={2} r={20} fill="#111" />
							</g>
						);
					})
				: null}
		</g>
	);
};

/** Looking up at the hull from below the surface. Nothing visible. Nothing. */
export const Underwater: React.FC<{f: number; pulse?: number[]}> = ({f, pulse = []}) => {
	const sd = 990 + boilOf(f, 5);
	const glow = pulse.reduce((a, at) => a + Math.max(0, 1 - Math.abs(f - at) / 20), 0);
	return (
		<g>
			<defs>
				<linearGradient id="uw" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0d1b2c" />
					<stop offset="1" stopColor="#010204" />
				</linearGradient>
			</defs>
			<rect x={-100} y={-100} width={2120} height={1280} fill="url(#uw)" />
			{/* surface + hull from below */}
			<path d={wob(Array.from({length: 34}, (_, i) => [-80 + i * 62, 210 + Math.sin(i * 0.9 + f / 14) * 8] as [number, number]), sd, 2, false) + ' L2040,-100 L-80,-100 Z'} fill="#1b3048" opacity={0.8} />
			<path d={wobPoly([[260, 150], [1660, 150], [1500, 330], [420, 330]], sd + 2, 3)} fill="#05080c" stroke="#000" strokeWidth={6} />
			{/* faint light rays */}
			{[0, 1, 2, 3].map((i) => (
				<path key={i} d={`M${200 + i * 480},210 L${120 + i * 480 + Math.sin(f / 40 + i) * 30},1080 L${260 + i * 480},1080 Z`} fill="#3a5878" opacity={0.05} />
			))}
			{/* drifting particles */}
			{Array.from({length: 60}, (_, i) => (
				<circle key={`p${i}`} cx={(h01(i, 1) * 1920 + f * (0.2 + h01(i, 2) * 0.3)) % 1920} cy={(h01(i, 3) * 1080 - f * 0.15 * h01(i, 4) + 1080) % 1080} r={1 + h01(i, 5) * 1.8} fill="#9fb6cf" opacity={0.15 + 0.2 * h01(i, 6)} />
			))}
			{glow > 0 ? <rect x={-100} y={-100} width={2120} height={1280} fill="#3a4f68" opacity={Math.min(0.25, glow * 0.2)} /> : null}
		</g>
	);
};

export const wobbleSeed = (n: number) => Math.round(h1(n) * 1000);
