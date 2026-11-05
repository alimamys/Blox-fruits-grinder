// Outdoor environments: <OceanNight/>, <FerryExterior/>, <Harbor/>, <Underwater/>.
// Layered SVG with gradient depth (sky glow, horizon haze, darker foreground water,
// moon glints, fog banks). No photorealism. The sea is almost black.
import React from 'react';
import {h01, h1, wob} from '../../utils/rough';
import {INK as KINK, ShadeDefs, makeInk, qd, shadeUrls, useUid} from './kit';

const INK = KINK;

export type SeaMood = 'night' | 'red' | 'day' | 'dark';

const SEA = {
	night: {sky: ['#020309', '#070d1a', '#0c1628'], sea: ['#08101d', '#070d18', '#060b14', '#050912', '#04070f', '#03060c', '#02040a'], crest: '#1d2d48', haze: '#1a2a44', glint: '#b9c8de'},
	dark: {sky: ['#000', '#020307', '#04070d'], sea: ['#04070c', '#03060a', '#030509', '#020407', '#020306', '#010205', '#010104'], crest: '#0e1626', haze: '#0c1422', glint: '#7f8ca0'},
	red: {sky: ['#080000', '#140303', '#1e0606'], sea: ['#180405', '#140304', '#110304', '#0e0203', '#0b0202', '#080102', '#060101'], crest: '#3a0d0d', haze: '#3a0c0c', glint: '#ff8a7a'},
	day: {sky: ['#7fb3e0', '#a9cdea', '#d6e8f3'], sea: ['#3d6f99', '#386894', '#33618c', '#2d5a84', '#28527b', '#234b72', '#1f456a'], crest: '#cfe3f2', haze: '#e4eef5', glint: '#ffffff'},
};

/** OceanNight - layered waves with depth. `calm` (0..1) makes the sea unnaturally still. */
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
	const uid = useUid('sea');
	const pal = SEA[mood];
	const layers = pal.sea.length;
	const still = 1 - 0.93 * calm;
	const waves: React.ReactNode[] = [];
	const crests: string[] = [];
	const yOf = (i: number) => horizon + Math.pow(i / (layers - 1), 1.6) * (1080 - horizon + 80) + 4;
	const aOf = (i: number) => (2 + (i / (layers - 1)) * 18) * still;
	for (let i = 0; i < layers; i++) {
		const depth = i / (layers - 1);
		const y0 = yOf(i);
		const A = aOf(i);
		// fill only down to where the next (nearer) layer is guaranteed to cover
		const bottom = i < layers - 1 ? Math.min(1200, yOf(i + 1) + aOf(i + 1) * 1.4 + 6) : 1200;
		const W = 180 + depth * 420;
		const ph = (f / 30) * (0.8 + depth * 1.2) * speed * still + i * 1.7;
		const pts: Array<[number, number]> = [];
		for (let x = -120; x <= 2040; x += 60) {
			pts.push([x, y0 + A * Math.sin((x / W) * Math.PI * 2 + ph) + A * 0.35 * Math.sin((x / (W * 0.37)) * Math.PI * 2 - ph * 1.6)]);
		}
		const top = wob(pts, i * 13 + 5, 0.8 * still + 0.2, false);
		waves.push(<path key={`w${i}`} d={`${top} L2040,${bottom.toFixed(0)} L-120,${bottom.toFixed(0)} Z`} fill={pal.sea[i]} />);
		if (i > 0 && i < layers - 1) crests.push(top);
	}
	// moon / sky glints on wave tops: a shimmering column under the moon plus a few strays
	const moonX = 1500;
	const glints: string[] = [];
	const gN = moon ? 34 : 14;
	for (let i = 0; i < gN; i++) {
		const tw = Math.floor(f / 5 + i * 3);
		if (h01(i, tw % 7, 3) < 0.35 * (1 - calm * 0.5)) continue;
		const t = h01(i, 2);
		const y = horizon + 6 + Math.pow(t, 1.7) * (1080 - horizon);
		const spread = moon && i < 26 ? 30 + t * 220 : 900;
		const x = (moon && i < 26 ? moonX : 960) + h1(i, 5, tw % 4) * spread;
		const w = 6 + t * 30;
		glints.push(`M${(x - w / 2).toFixed(1)},${y.toFixed(1)}L${(x + w / 2).toFixed(1)},${y.toFixed(1)}`);
	}
	return (
		<g>
			<defs>
				<linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={pal.sky[0]} />
					<stop offset="0.7" stopColor={pal.sky[1]} />
					<stop offset="1" stopColor={pal.sky[2]} />
				</linearGradient>
				<linearGradient id={`${uid}hz`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={pal.haze} stopOpacity={0} />
					<stop offset="0.5" stopColor={pal.haze} stopOpacity={0.55} />
					<stop offset="1" stopColor={pal.haze} stopOpacity={0} />
				</linearGradient>
				<linearGradient id={`${uid}deep`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity={0} />
					<stop offset="1" stopColor="#000" stopOpacity={mood === 'day' ? 0.15 : 0.45} />
				</linearGradient>
				<radialGradient id={`${uid}fog`}>
					<stop offset="0" stopColor="#9aa7b8" stopOpacity="0.35" />
					<stop offset="1" stopColor="#9aa7b8" stopOpacity="0" />
				</radialGradient>
				<radialGradient id={`${uid}moon`}>
					<stop offset="0" stopColor="#dfe6ef" stopOpacity="0.35" />
					<stop offset="1" stopColor="#dfe6ef" stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect x={-200} y={-200} width={2320} height={horizon + 210} fill={`url(#${uid}sky)`} />
			{stars && mood !== 'day'
				? [0, 1, 2].map((band) => (
						<path
							key={`st${band}`}
							d={Array.from({length: 46}, (_, i) => {
								const o = h01(i, Math.floor(f / 20) % 3 === 0 ? 4 : 5);
								if (Math.min(2, Math.floor(o * 3)) !== band) return '';
								const r = h01(i, 3) * 1.6 + 0.5;
								const cx = h01(i, 1) * 1920;
								const cy = h01(i, 2) * (horizon - 60);
								return `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(2 * r).toFixed(2)},0a${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(-2 * r).toFixed(2)},0`;
							}).join('')}
							fill="#cfd8e6"
							fillOpacity={0.33 + band * 0.17}
						/>
					))
				: null}
			{moon ? (
				<g>
					<circle cx={moonX} cy={170} r={120} fill="#dfe6ef" fillOpacity={0.035} />
					<circle cx={moonX} cy={170} r={70} fill="#dfe6ef" fillOpacity={0.05} />
					<circle cx={moonX} cy={170} r={34} fill="#d9dde3" fillOpacity={0.3} />
					<circle cx={moonX + 9} cy={164} r={30} fill={pal.sky[1]} fillOpacity={0.16} />
				</g>
			) : null}
			{glow ? <ellipse cx={960} cy={horizon} rx={900} ry={50} fill={glow} fillOpacity={0.18} /> : null}
			<rect x={-200} y={horizon - 70} width={2320} height={140} fill={`url(#${uid}hz)`} fillOpacity={0.7} />
			{waves}
			<path d={crests.join('')} fill="none" stroke={pal.crest} strokeWidth={2.5} strokeOpacity={0.32 * (0.4 + still * 0.6)} />
			<path d={glints.join('')} stroke={pal.glint} strokeWidth={2} strokeLinecap="round" strokeOpacity={moon ? 0.45 : 0.22}  fill="none" />
			<path d={`M-120,${horizon}L2040,${horizon}`} stroke={pal.crest} strokeWidth={2} strokeOpacity={0.45}  fill="none" />
			{fog > 0
				? [0, 1, 2, 3].map((i) => (
						<ellipse
							key={`fog${i}`}
							cx={((i * 610 + f * (0.4 + i * 0.15)) % 2600) - 340}
							cy={horizon - 10 + i * 40}
							rx={700}
							ry={90 + i * 20}
							fill={`url(#${uid}fog)`}
							fillOpacity={fog}
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
	const uid = useUid('fx');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 500);
	const rot = Math.sin(f / 48) * 0.8 * rock;
	const bob = Math.sin(f / 37) * 4 * rock;
	const win = lights === 'on' ? '#ffd56a' : lights === 'dim' ? '#9a7a3a' : lights === 'red' ? '#a3191b' : '#121418';
	const lit = lights !== 'off';
	const hullTop = day ? '#f4f4f2' : '#d9dce2';
	const hullLow = '#173a6b';
	const windows = (x0: number, x1: number, yy: number, w: number, h: number, n: number, seed: number) =>
		Array.from({length: n}, (_, i) => {
			const wx = x0 + ((x1 - x0) * (i + 0.5)) / n - w / 2;
			const flick = lights === 'on' && h01(i, seed, Math.floor(f / 9)) > 0.985 ? 0.6 : 1;
			return <path key={`${seed}-${i}`} d={ink.rect(wx, yy, w, h, seed + i, 0.7)} fill={win} opacity={flick} stroke={INK} strokeWidth={3} />;
		});
	const glowBand = (x0: number, x1: number, yy: number, h: number, k: string) =>
		lit && !day ? <rect key={k} x={x0 - 20} y={yy - 18} width={x1 - x0 + 40} height={h + 36} rx={30} fill={win} fillOpacity={lights === 'on' ? 0.16 : 0.1} /> : null;
	const hull: Array<[number, number]> = [[-575, -128], [560, -128], [640, -150], [540, 12], [-555, 12]];
	return (
		<g>
			<ShadeDefs id={uid} glow={win} />
			{/* dark reflection of the hull + light spill on the water */}
			<g transform={`translate(${x},${y + 14 * s}) scale(${s},${-0.35 * s})`} opacity={day ? 0.18 : 0.35}>
				<path d={qd([[-555, 0], [540, 0], [600, 150], [-560, 150]])} fill={day ? '#1c3550' : '#020407'} />
			</g>
			{reflections && lit ? (
				<path
					d={Array.from({length: 60}, (_, i) => {
						const t = Math.floor(f / 5);
						const cx = x + (-470 + (i % 20) * 46 + h1(i, t % 5) * 10) * s;
						const yy = y + (20 + Math.floor(i / 20) * 16 + h01(i, 3) * 8) * s;
						const w = (8 + h01(i, 9, t % 7) * 26) * s;
						return h01(i, t % 3, 4) < 0.25 ? '' : `M${(cx - w / 2).toFixed(1)},${yy.toFixed(1)}L${(cx + w / 2).toFixed(1)},${yy.toFixed(1)}`;
					}).join('')}
					stroke={win}
					strokeWidth={3 * s}
					strokeLinecap="round"
					strokeOpacity={lights === 'on' ? 0.42 : 0.28}
				/>
			) : null}
			{/* wake */}
			{wake > 0
				? [0, 1, 2].map((i) => (
						<path
							key={`wake${i}`}
							d={ink.line(x - 560 * s, y + 8 * s + i * 7, x - (900 + i * 300 + ((f * 3) % 120)) * s, y + (16 + i * 12) * s, 70 + i, 2, 4)}
							stroke={day ? '#fff' : '#8fa3bd'}
							strokeWidth={(5 - i) * s}
							strokeOpacity={wake * (0.5 - i * 0.12)}
							fill="none"
						/>
					))
				: null}
			{ripples.map((r, i) => {
				const d = f - r.at;
				if (d < 0 || d > 70) return null;
				return [0, 1, 2].map((k) => {
					const rr = (d * 6 + k * 40) * s;
					return <ellipse key={`rp${i}-${k}`} cx={x + r.x * s} cy={y + 14 * s} rx={rr} ry={rr * 0.18} fill="none" stroke="#9fb3cc" strokeWidth={3} strokeOpacity={Math.max(0, 0.6 - d / 70 - k * 0.12)} />;
				});
			})}
			<g transform={`translate(${x},${y + bob}) rotate(${rot}) scale(${s})`}>
				{/* superstructure: lower level */}
				{glowBand(-450, 360, -190, 34, 'g1')}
				<path d={ink.poly([[-470, -122], [390, -122], [370, -212], [-470, -212]], 1, 1.4)} fill={hullTop} stroke={INK} strokeWidth={6} />
				<path d={qd([[-470, -150], [383, -150], [390, -122], [-470, -122]])} fill="#000" fillOpacity={0.12} />
				<path d={qd([[-470, -212], [370, -212], [372, -200], [-470, -200]])} fill="#000" fillOpacity={0.2} />
				{windows(-450, 360, -190, 30, 34, 17, 10)}
				{/* upper level */}
				{glowBand(-360, 270, -268, 30, 'g2')}
				<path d={ink.poly([[-380, -212], [300, -212], [280, -288], [-380, -288]], 2, 1.4)} fill={hullTop} stroke={INK} strokeWidth={6} />
				<path d={qd([[-380, -236], [293, -236], [300, -212], [-380, -212]])} fill="#000" fillOpacity={0.12} />
				<path d={qd([[-380, -288], [280, -288], [282, -278], [-380, -278]])} fill="#000" fillOpacity={0.18} />
				{windows(-360, 270, -268, 28, 30, 13, 30)}
				{/* lifeboats */}
				{[[-330, -200, -215, -318], [-60, 70, 55, -48]].map(([a, b, c2, d2], i) => (
					<g key={`lb${i}`}>
						<path d={ink.poly([[a, -300], [b, -300], [c2, -322], [d2, -322]], 3 + i, 1)} fill="#e26a1c" stroke={INK} strokeWidth={4} />
						<path d={qd([[a, -300], [b, -300], [c2, -310], [d2, -310]])} fill="#000" fillOpacity={0.25} />
						<path d={`M${d2 + 8},-319L${c2 - 8},-319`} stroke="#fff" strokeWidth={2} strokeOpacity={0.35}  fill="none" />
					</g>
				))}
				{/* bridge */}
				<path d={ink.poly([[110, -288], [330, -288], [350, -346], [130, -346]], 5, 1.4)} fill={hullTop} stroke={INK} strokeWidth={6} />
				<path d={ink.poly([[140, -308], [335, -308], [342, -334], [146, -334]], 6, 1)} fill={lights === 'off' ? '#0c0f14' : lights === 'red' ? '#4a0a0a' : '#2d3d52'} stroke={INK} strokeWidth={4} />
				<path d={qd([[150, -332], [200, -332], [185, -310], [146, -310]])} fill="#fff" fillOpacity={0.12} />
				{/* funnel (cylinder shading) */}
				<path d={ink.poly([[-215, -288], [-120, -288], [-130, -392], [-205, -392]], 7, 1.4)} fill="#1b3f73" stroke={INK} strokeWidth={6} />
				<path d={qd([[-200, -290], [-180, -290], [-185, -390], [-200, -390]])} fill="#fff" fillOpacity={0.18} />
				<path d={qd([[-140, -290], [-122, -290], [-131, -390], [-145, -390]])} fill="#000" fillOpacity={0.25} />
				<path d={ink.poly([[-210, -350], [-126, -350], [-127, -366], [-208, -366]], 8, 0.8)} fill="#e8c547" stroke={INK} strokeWidth={3} />
				{/* mast + navigation lights */}
				<path d={ink.line(230, -346, 230, -460, 9, 1, 2)} stroke={INK} strokeWidth={6} />
				<circle cx={230} cy={-462} r={8} fill="#fff" fillOpacity={lights === 'off' ? 0.25 : 1} />
				{lit ? <circle cx={230} cy={-462} r={18} fill="#fff" fillOpacity={0.16} /> : null}
				{lit ? <circle cx={230} cy={-462} r={34} fill="#fff" fillOpacity={0.06} /> : null}
				<circle cx={350} cy={-300} r={7} fill="#2fe06a" fillOpacity={lights === 'off' ? 0.2 : 1} />
				{lit ? <circle cx={350} cy={-300} r={16} fill="#2fe06a" fillOpacity={0.2} /> : null}
				{lit ? <circle cx={350} cy={-300} r={30} fill="#2fe06a" fillOpacity={0.07} /> : null}
				<circle cx={-470} cy={-140} r={6} fill="#ff3b30" fillOpacity={lights === 'off' ? 0.2 : 0.4 + 0.6 * (Math.floor(f / 15) % 2)} />
				{/* hull: shaded topsides, dark bottom, sheer highlight, waterline foam */}
				<path d={ink.poly(hull, 11, 1.6)} fill={hullTop} stroke={INK} strokeWidth={7} />
				<path d={qd([[-575, -128], [560, -128], [563, -110], [-572, -110]])} fill="#fff" fillOpacity={0.12} />
				<path d={ink.poly([[-560, -40], [585, -40], [540, 12], [-555, 12]], 12, 1.2)} fill={hullLow} stroke={INK} strokeWidth={6} />
				<path d={qd([[-558, -12], [562, -12], [540, 12], [-555, 12]])} fill="#000" fillOpacity={0.3} />
				<path d={ink.line(-560, -52, 590, -52, 13, 1, 6)} stroke="#e8c547" strokeWidth={6} />
				<path d={ink.line(-565, -122, 600, -122, 14, 0.8, 6)} stroke="#fff" strokeWidth={3} strokeOpacity={day ? 0.8 : 0.45}  fill="none" />
				{/* portholes */}
				{Array.from({length: 9}, (_, i) => (
					<g key={`ph${i}`}>
						{lit ? <circle cx={-430 + i * 110} cy={-92} r={18} fill={win} fillOpacity={0.15} /> : null}
						<circle cx={-430 + i * 110} cy={-92} r={9} fill={lights === 'off' ? '#111' : lights === 'red' ? '#7a1515' : '#e9c25a'} stroke={INK} strokeWidth={3} />
					</g>
				))}
				<text x={20} y={-62} fontFamily="Permanent Marker" fontSize={40} fill="#13294d" textAnchor="middle" letterSpacing={3}>
					NORTH STAR 8
				</text>
				<path d={ink.line(-555, 10, 545, 10, 15, 2, 10)} stroke={day ? '#fff' : '#9fb3cc'} strokeWidth={4} strokeOpacity={0.5} fill="none" />
				{/* stern rail (rear deck) */}
				<path d={ink.line(-575, -165, -470, -165, 16, 0.8, 3)} stroke={INK} strokeWidth={4} />
				{[-570, -545, -520, -495].map((px, i) => (
					<path key={`rl${i}`} d={ink.line(px, -128, px, -165, 17 + i, 0.6, 1)} stroke={INK} strokeWidth={3} />
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
	const uid = useUid('hb');
	const S = shadeUrls(uid);
	const ink = makeInk(f, 900);
	if (distant) {
		return (
			<g>
				<ShadeDefs id={uid} glow="#ffb35c" />
				<ellipse cx={960} cy={horizon} rx={620} ry={60} fill={S.gl} fillOpacity={0.6} />
				{Array.from({length: 38}, (_, i) => {
					const x = 520 + h01(i, 1) * 900;
					const y = horizon - 4 - h01(i, 2) * 26;
					const c = h01(i, 3) > 0.7 ? '#ff9b3d' : '#ffe08a';
					return <circle key={i} cx={x} cy={y} r={1.6 + h01(i, 4) * 1.6} fill={c} fillOpacity={0.6 + 0.4 * h01(i, Math.floor(f / 10))} />;
				})}
				<path
					d={Array.from({length: 16}, (_, i) => {
						const x = 540 + h01(i, 1) * 860;
						return `M${x.toFixed(1)},${horizon + 4}L${x.toFixed(1)},${horizon + 14 + h01(i, 6, Math.floor(f / 8)) * 20}`;
					}).join('')}
					stroke="#ffcf7a"
					strokeWidth={2}
					strokeOpacity={0.25}
				/>
			</g>
		);
	}
	const buildings = Array.from({length: 14}, (_, i) => {
		const w = 90 + h01(i, 1, variant === 'port' ? 1 : 2) * 120;
		const h = 80 + h01(i, 2) * (variant === 'port' ? 220 : 110);
		const x = -60 + i * 145;
		return {x, w, h};
	});
	const lamps = [180, 520, 860, 1200, 1540, 1860];
	return (
		<g>
			<ShadeDefs id={uid} glow="#ffad4d" />
			{buildings.map((bd, i) => {
				const dep = 26 + h01(i, 8) * 18;
				const top = horizon - bd.h;
				return (
					<g key={i}>
						{/* side face (receding to the right) + roof face: buildings as boxes */}
						<path d={qd([[bd.x + bd.w, top], [bd.x + bd.w + dep, top - dep * 0.45], [bd.x + bd.w + dep, horizon], [bd.x + bd.w, horizon]])} fill="#05070c" stroke="#000" strokeWidth={2} />
						<path d={qd([[bd.x, top], [bd.x + bd.w, top], [bd.x + bd.w + dep, top - dep * 0.45], [bd.x + dep, top - dep * 0.45]])} fill="#151b27" stroke="#000" strokeWidth={2} />
						<path d={ink.rect(bd.x, top, bd.w, bd.h + 4, i, 1)} fill="#0b0f18" stroke="#000" strokeWidth={3} />
						<rect x={bd.x} y={top} width={bd.w} height={bd.h} fill={S.hl} fillOpacity={0.25} />
						{Array.from({length: Math.floor(bd.h / 34)}, (_, r) =>
							Array.from({length: Math.floor(bd.w / 30)}, (_, c) =>
								h01(i, r, c) > 0.55 ? <rect key={`${r}-${c}`} x={bd.x + 10 + c * 30} y={top + 14 + r * 34} width={12} height={14} fill="#f6d27a" fillOpacity={0.75} /> : null,
							),
						)}
					</g>
				);
			})}
			{/* quay: top face + front face */}
			<path d={qd([[-60, horizon - 14], [1980, horizon - 14], [1960, horizon], [-40, horizon]])} fill="#3a3e46" />
			<path d={ink.poly([[-40, horizon], [1960, horizon], [1960, horizon + 70], [-40, horizon + 70]], 40, 1.2)} fill="#24272d" stroke="#000" strokeWidth={4} />
			<rect x={-40} y={horizon} width={2000} height={70} fill={S.dn} fillOpacity={0.6} />
			{/* light reflections in the water below the quay */}
			<path
				d={lamps
					.map((lx, i) =>
						Array.from({length: 5}, (_, k) => {
							const yy = horizon + 82 + k * 14;
							const w = 10 + h01(i, k, Math.floor(f / 6)) * 26;
							return `M${(lx - w / 2).toFixed(1)},${yy}L${(lx + w / 2).toFixed(1)},${yy}`;
						}).join(''),
					)
					.join('')}
				stroke="#ffc26b"
				strokeWidth={3}
				strokeOpacity={0.3}
			/>
			{lamps.map((lx, i) => (
				<g key={`lamp${i}`}>
					<ellipse cx={lx} cy={horizon - 110} rx={150} ry={150} fill={S.gl} />
					<path d={ink.line(lx, horizon, lx, horizon - 140, 50 + i, 0.8, 2)} stroke="#111" strokeWidth={6} />
					<circle cx={lx} cy={horizon - 144} r={9} fill="#ffc26b" />
					<ellipse cx={lx} cy={horizon - 6} rx={70} ry={10} fill="#ffad4d" fillOpacity={0.2} />
				</g>
			))}
			<g transform={`translate(${variant === 'port' ? 1260 : 380}, ${horizon - 250})`}>
				<path d={qd([[420, 0], [440, -10], [440, 60], [420, 70]])} fill="#081a30" stroke="#000" strokeWidth={3} />
				<path d={ink.rect(0, 0, 420, 70, 60, 1)} fill="#0e2340" stroke="#000" strokeWidth={4} />
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
								<ellipse cx={80} cy={-70} rx={180} ry={110} fill={on ? '#2a5bff' : '#ff2a2a'} fillOpacity={0.16} />
								<ellipse cx={95} cy={4} rx={110} ry={10} fill="#000" fillOpacity={0.4} />
								<path d={ink.poly([[0, 0], [190, 0], [175, -55], [135, -60], [110, -95], [40, -95], [20, -55], [0, -50]], 70 + i, 1.2)} fill="#e9ecef" stroke="#000" strokeWidth={5} />
								<path d={qd([[0, -30], [190, -30], [190, 0], [0, 0]])} fill="#000" fillOpacity={0.15} />
								<path d={qd([[48, -88], [104, -88], [125, -58], [40, -58]])} fill="#2d3d52" fillOpacity={0.8} />
								<path d={ink.rect(10, -40, 170, 14, 72 + i, 0.6)} fill="#1d3f9a" />
								<rect x={55} y={-108} width={30} height={12} fill={on ? '#2a5bff' : '#330'} />
								<rect x={85} y={-108} width={30} height={12} fill={on ? '#300' : '#ff2a2a'} />
								<circle cx={40} cy={2} r={20} fill="#111" />
								<circle cx={150} cy={2} r={20} fill="#111" />
								<circle cx={40} cy={2} r={8} fill="#555" />
								<circle cx={150} cy={2} r={8} fill="#555" />
							</g>
						);
					})
				: null}
		</g>
	);
};

/** Looking up at the hull from below the surface. Nothing visible. Nothing. */
export const Underwater: React.FC<{f: number; pulse?: number[]}> = ({f, pulse = []}) => {
	const uid = useUid('uw');
	const ink = makeInk(f, 990);
	const glow = pulse.reduce((a, at) => a + Math.max(0, 1 - Math.abs(f - at) / 20), 0);
	const surf = Array.from({length: 34}, (_, i) => [-80 + i * 62, 210 + Math.sin(i * 0.9 + f / 14) * 8] as [number, number]);
	const hullPts: Array<[number, number]> = [[260, 150], [1660, 150], [1500, 330], [420, 330]];
	return (
		<g>
			<defs>
				<linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#14283d" />
					<stop offset="0.45" stopColor="#081321" />
					<stop offset="1" stopColor="#010204" />
				</linearGradient>
				<linearGradient id={`${uid}ray`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#6f93b8" stopOpacity={0.16} />
					<stop offset="1" stopColor="#6f93b8" stopOpacity={0} />
				</linearGradient>
				<linearGradient id={`${uid}hull`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0d1620" />
					<stop offset="1" stopColor="#020305" />
				</linearGradient>
			</defs>
			<rect x={-100} y={-100} width={2120} height={1280} fill={`url(#${uid}w)`} />
			{/* surface seen from below (bright skin) + caustic shimmer */}
			<path d={wob(surf, 990, 1.2, false) + ' L2040,-100 L-80,-100 Z'} fill="#1b3048" fillOpacity={0.85} />
			<path d={wob(surf, 990, 1.2, false)} stroke="#5d7c9c" strokeWidth={3} strokeOpacity={0.5} fill="none" />
			<path
				d={Array.from({length: 26}, (_, i) => {
					const x = h01(i, 1) * 1920;
					const y = 150 + h01(i, 2) * 50 + Math.sin(f / 10 + i) * 6;
					const w = 20 + h01(i, 3) * 40;
					return `M${x.toFixed(1)},${y.toFixed(1)}q${w / 2},${-6} ${w},0`;
				}).join('')}
				stroke="#8fb0d0"
				strokeWidth={2}
				strokeOpacity={0.25}
				fill="none"
			/>
			{/* light rays fanning down from the surface */}
			{[0, 1, 2, 3, 4].map((i) => {
				const x0 = 120 + i * 430 + Math.sin(f / 40 + i) * 30;
				return <path key={i} d={`M${x0},210 L${x0 + 90},210 L${x0 + 260 + Math.sin(f / 33 + i) * 40},1080 L${x0 - 140},1080 Z`} fill={`url(#${uid}ray)`} />;
			})}
			{/* hull underside: dark shaded plates, keel */}
			<path d={ink.poly(hullPts, 2, 2)} fill={`url(#${uid}hull)`} stroke="#000" strokeWidth={6} />
			<path d={ink.line(420, 300, 1500, 300, 3, 1, 6)} stroke="#1f2c3a" strokeWidth={3} strokeOpacity={0.8}  fill="none" />
			<path d={ink.line(960, 150, 960, 330, 4, 0.8, 2)} stroke="#000" strokeWidth={10} strokeOpacity={0.6}  fill="none" />
			<path d={ink.line(300, 160, 1620, 160, 5, 0.8, 6)} stroke="#3a5470" strokeWidth={3} strokeOpacity={0.5}  fill="none" />
			{/* drifting particles */}
			<path
				d={Array.from({length: 60}, (_, i) => {
					const cx = (h01(i, 1) * 1920 + f * (0.2 + h01(i, 2) * 0.3)) % 1920;
					const cy = (h01(i, 3) * 1080 - f * 0.15 * h01(i, 4) + 1080) % 1080;
					const r = 1 + h01(i, 5) * 1.8;
					return `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0`;
				}).join('')}
				fill="#9fb6cf"
				fillOpacity={0.25}
			/>
			{glow > 0 ? <rect x={-100} y={-100} width={2120} height={1280} fill="#3a4f68" fillOpacity={Math.min(0.25, glow * 0.2)} /> : null}
		</g>
	);
};

export const wobbleSeed = (n: number) => Math.round(h1(n) * 1000);
