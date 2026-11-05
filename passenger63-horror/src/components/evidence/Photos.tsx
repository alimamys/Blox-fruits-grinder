// Photographs and close-up objects: <PhotoEvidence/>, <PhotoLook/>, <HarborPhoto/>,
// <DaylightPhoto/>, <WeddingRing/>, plus the story photos (wedding, honeymoon,
// christmas, grandmother).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01, h1, wobPoly, wobRect} from '../../utils/rough';
import {Daniel, Emma, OldWoman, Passenger, PALETTES, Captain, Crew1, Crew2, Purser} from '../characters/Cast';
import {StickPerson} from '../characters/StickPerson';
import {FerryExterior, OceanNight} from '../environments/Outdoor';

/** Photographic treatment: grade, softness, grain, vignette, optional date stamp. */
export const PhotoLook: React.FC<{
	f: number;
	children: React.ReactNode;
	night?: boolean;
	stamp?: string;
	sepia?: number;
	blur?: number;
	grain?: number;
}> = ({f, children, night = false, stamp, sepia = 0, blur = 0.8, grain = 0.18}) => (
	<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
		<AbsoluteFill
			style={{
				filter: `blur(${blur}px) contrast(${night ? 1.15 : 1.05}) saturate(${night ? 0.75 : 1.1}) sepia(${sepia}) brightness(${night ? 0.95 : 1.04})`,
			}}
		>
			{children}
		</AbsoluteFill>
		{night ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,160,70,0.12), rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} /> : null}
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile(`textures/grain_${f % 4}.png`)})`,
				backgroundSize: '256px 256px',
				opacity: grain,
				mixBlendMode: 'overlay',
			}}
		/>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'}} />
		{stamp ? (
			<div style={{position: 'absolute', right: 50, bottom: 36, fontFamily: FONT.mono, fontSize: 38, color: night ? '#f1f1f1' : '#ff9f3a', textShadow: '0 0 6px rgba(0,0,0,0.8)', letterSpacing: 2}}>{stamp}</div>
		) : null}
	</AbsoluteFill>
);

/** A printed photograph lying on a table. */
export const PhotoEvidence: React.FC<{
	f: number;
	children: React.ReactNode;
	rot?: number;
	x?: number;
	y?: number;
	w?: number;
	h?: number;
	stamp?: string;
	sepia?: number;
	scale?: number;
	opacity?: number;
}> = ({f, children, rot = -2, x = 960, y = 540, w = 1200, h = 800, stamp, sepia = 0, scale = 1, opacity = 1}) => (
	<div
		style={{
			position: 'absolute',
			left: x - (w / 2 + 30),
			top: y - (h / 2 + 30),
			width: w + 60,
			height: h + 110,
			background: '#f6f3ea',
			boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
			transform: `rotate(${rot}deg) scale(${scale})`,
			opacity,
		}}
	>
		<div style={{position: 'absolute', left: 30, top: 30, width: w, height: h, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${w / 1920}, ${h / 1080})`, transformOrigin: '0 0'}}>
				<PhotoLook f={f} sepia={sepia} stamp={stamp}>
					{children}
				</PhotoLook>
			</div>
		</div>
	</div>
);

const svgWrap = (children: React.ReactNode, bg = '#000') => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080">
			{children}
		</svg>
	</AbsoluteFill>
);

/* --------------------------- story photographs --------------------------- */

export const WeddingPhoto: React.FC<{f: number}> = () =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#efe6d8" />
			<path d="M560,1080 L560,300 Q960,40 1360,300 L1360,1080" fill="#e2d4bd" stroke="#8a7a62" strokeWidth={10} />
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<circle key={i} cx={600 + i * 150} cy={300 - Math.sin((i / 5) * Math.PI) * 200} r={40} fill={i % 2 ? '#f5c1cf' : '#fff'} stroke="#8a7a62" strokeWidth={4} />
			))}
			<rect x={0} y={900} width={1920} height={180} fill="#b7a58a" />
			<path d="M860,900 L1060,900 L1180,1080 L740,1080 Z" fill="#9a2a3a" opacity={0.7} />
			{/* Emma alone at the altar, the place beside her empty */}
			<Emma x={1040} y={930} s={1.25} frame={null} mouth="smile" arms="hold" palette={{...PALETTES.emma, shirt: '#fbfbf7', pants: '#fbfbf7'}} />
			<path d="M1000,700 l40,-30 l40,30" fill="#ffd1dc" stroke="#111" strokeWidth={3} />
		</g>,
		'#efe6d8',
	);

export const HoneymoonPhoto: React.FC<{f: number}> = () =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#3b2a24" />
			{Array.from({length: 7}, (_, i) => (
				<circle key={i} cx={200 + i * 260} cy={140} r={14} fill="#ffd27a" opacity={0.8} />
			))}
			<rect x={300} y={720} width={1320} height={60} fill="#f2ead7" stroke="#111" strokeWidth={6} />
			<rect x={340} y={780} width={30} height={300} fill="#5a3a2a" />
			<rect x={1550} y={780} width={30} height={300} fill="#5a3a2a" />
			<rect x={950} y={640} width={20} height={80} fill="#f7f1e3" />
			<ellipse cx={960} cy={630} rx={8} ry={14} fill="#ffcf4a" />
			<circle cx={960} cy={630} r={60} fill="#ffcf4a" opacity={0.15} />
			{/* Emma at dinner. Opposite: an empty chair. */}
			<Emma x={620} y={980} s={1.3} frame={null} pose="sit" mouth="grin" arms="handsForward" />
			<g>
				<path d="M1230,560 L1400,560 L1400,820 L1230,820 Z" fill="#6b3a2a" stroke="#111" strokeWidth={6} />
				<path d="M1210,820 L1420,820 L1420,860 L1210,860 Z" fill="#6b3a2a" stroke="#111" strokeWidth={6} />
			</g>
		</g>,
		'#3b2a24',
	);

export const ChristmasPhoto: React.FC<{f: number}> = () =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#4a2a2a" />
			<path d="M1500,150 L1700,800 L1300,800 Z" fill="#1f5a2e" stroke="#111" strokeWidth={6} />
			{Array.from({length: 14}, (_, i) => (
				<circle key={i} cx={1380 + h01(i, 1) * 240} cy={330 + h01(i, 2) * 440} r={12} fill={['#ff4d4d', '#ffd24d', '#4db8ff'][i % 3]} />
			))}
			<rect x={1440} y={800} width={120} height={80} fill="#5a3a2a" />
			<rect x={200} y={640} width={1000} height={280} rx={40} fill="#7a2f2f" stroke="#111" strokeWidth={8} />
			<Emma x={460} y={900} s={1.2} frame={null} pose="sit" mouth="smile" arms="relaxed" palette={{...PALETTES.emma, shirt: '#2f6b3a'}} hat="beanie" />
			{/* the empty place beside her */}
			<path d="M760,560 L1000,560 L1000,880 L760,880 Z" fill="#7a2f2f" stroke="#111" strokeWidth={6} />
		</g>,
		'#4a2a2a',
	);

export const RestaurantPhoto = HoneymoonPhoto;

/** Old snapshot: grandmother with little Daniel (a ferry in the background). */
export const GrandmaKidPhoto: React.FC<{f: number}> = ({f}) =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#a9c7de" />
			<rect y={560} width={1920} height={520} fill="#6a93b5" />
			<FerryExterior f={0} x={1450} y={600} s={0.35} lights="off" wake={0} rock={0} reflections={false} day />
			<rect y={830} width={1920} height={250} fill="#d9c49a" />
			<OldWoman x={760} y={960} s={1.3} mouth="smile" />
			<StickPerson x={1060} y={960} s={1.25} child frame={null} palette={{...PALETTES.daniel, shirt: '#3a76d6'}} hair="short" mouth="grin" arms="armsUp" seed={5} />
		</g>,
		'#a9c7de',
	);

export const GrandmaPortrait: React.FC<{f: number; ribbon?: boolean; tilt?: number}> = ({ribbon = false, tilt = 6}) =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#cdbfa6" />
			<OldWoman x={960} y={1260} s={3.2} mouth="smile" tilt={tilt} />
			{ribbon ? <path d="M1920,0 L1700,0 L1920,220 Z M1640,0 L1920,280" fill="#111" stroke="#111" strokeWidth={30} /> : null}
		</g>,
		'#cdbfa6',
	);

export const BroochCloseup: React.FC<{f: number}> = () =>
	svgWrap(
		<g>
			<rect width={1920} height={1080} fill="#121214" />
			<ellipse cx={960} cy={540} rx={330} ry={290} fill="#c9ced3" stroke="#7a8288" strokeWidth={22} />
			<ellipse cx={960} cy={540} rx={250} ry={210} fill="#dfe3e7" stroke="#9aa1a7" strokeWidth={10} />
			<text x={960} y={640} textAnchor="middle" fontFamily={FONT.hand} fontSize={300} fill="#8a9298" opacity={0.85}>
				37
			</text>
			{Array.from({length: 18}, (_, i) => {
				const a = (i / 18) * Math.PI * 2;
				return <circle key={i} cx={960 + Math.cos(a) * 300} cy={540 + Math.sin(a) * 262} r={14} fill="#e9edf0" stroke="#7a8288" strokeWidth={4} />;
			})}
		</g>,
		'#121214',
	);

/* ------------------------- harbour-control photo ------------------------- */

/** NORTH STAR 8 alongside at Port Mason, 00:26:14 - Emma alone, the old woman at the
 *  end of the gangway. Key positions are exported for camera zooms. */
export const HARBOR_PHOTO_SPOTS = {
	captain: {cx: 1050, cy: 480, z: 3.4},
	crew: {cx: 940, cy: 540, z: 2.6},
	emma: {cx: 725, cy: 650, z: 3.4},
	woman: {cx: 470, cy: 820, z: 3.6},
	stamp: {cx: 1560, cy: 1010, z: 2.4},
};

export const HarborPhoto: React.FC<{f: number; stamp?: boolean; people?: boolean}> = ({f, stamp = true, people: withPeople = true}) => {
	const walkers: React.ReactNode[] = [];
	// gangway runs from (1120, 500) on the ferry down to (430, 860) on the quay
	const along = (t: number): [number, number] => [1120 - 690 * t, 500 + 360 * t];
	const people: Array<{t: number; who: string; id?: number}> = [
		{t: 0.1, who: 'captain'},
		{t: 0.19, who: 'crew1'},
		{t: 0.26, who: 'crew2'},
		{t: 0.33, who: 'purser'},
		{t: 0.41, who: 'p', id: 3},
		{t: 0.47, who: 'p', id: 8},
		{t: 0.55, who: 'emma'},
		{t: 0.66, who: 'p', id: 14},
		{t: 0.73, who: 'p', id: 21},
		{t: 0.8, who: 'p', id: 5},
	];
	for (const p of withPeople ? people : []) {
		const [x, y] = along(p.t);
		const common = {x, y, s: 0.42, frame: null as null, pose: 'walk' as const, phase: p.t * 9};
		if (p.who === 'captain') walkers.push(<Captain key="c" {...common} />);
		else if (p.who === 'crew1') walkers.push(<Crew1 key="c1" {...common} />);
		else if (p.who === 'crew2') walkers.push(<Crew2 key="c2" {...common} />);
		else if (p.who === 'purser') walkers.push(<Purser key="pu" {...common} />);
		else if (p.who === 'emma') walkers.push(<Emma key="e" {...common} mouth="flat" />);
		else walkers.push(<Passenger key={`p${p.id}`} id={p.id ?? 1} {...common} opacity={1} />);
	}
	return (
		<AbsoluteFill style={{background: '#05070b'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<defs>
					<radialGradient id="sodium">
						<stop offset="0" stopColor="#ffb25a" stopOpacity="0.55" />
						<stop offset="1" stopColor="#ffb25a" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width={1920} height={1080} fill="#07090f" />
				<rect y={0} width={1920} height={420} fill="#0b0f18" />
				{/* terminal building */}
				<rect x={0} y={250} width={520} height={420} fill="#151a22" />
				{Array.from({length: 18}, (_, i) => (
					<rect key={i} x={30 + (i % 6) * 80} y={300 + Math.floor(i / 6) * 90} width={50} height={50} fill="#ffcf7a" opacity={h01(i, 4) > 0.4 ? 0.7 : 0.1} />
				))}
				<text x={260} y={235} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={36} fill="#e8eef5">
					PORT MASON
				</text>
				{/* water + docked ferry */}
				<rect y={600} width={1920} height={480} fill="#05080d" />
				<FerryExterior f={0} x={1420} y={640} s={1.05} lights="on" wake={0} rock={0} />
				{/* quay */}
				<path d="M0,820 L1920,860 L1920,1080 L0,1080 Z" fill="#2a2c31" />
				<path d="M0,820 L1920,860" stroke="#c9b25a" strokeWidth={8} opacity={0.6} />
				{/* lamps */}
				{[150, 760, 1300].map((lx, i) => (
					<g key={i}>
						<circle cx={lx} cy={560} r={260} fill="url(#sodium)" />
						<rect x={lx - 5} y={560} width={10} height={290} fill="#111" />
						<circle cx={lx} cy={556} r={14} fill="#ffd28a" />
					</g>
				))}
				{/* gangway */}
				<path d="M1150,480 L1170,520 L455,900 L400,880 Z" fill="#8f949b" stroke="#111" strokeWidth={6} />
				<path d="M1150,440 L400,840" stroke="#d9dde2" strokeWidth={6} />
				{walkers}
				{/* at the very end of the gangway, facing the camera */}
				{withPeople ? <OldWoman x={470} y={900} s={0.5} mouth="faint" /> : null}
				<rect width={1920} height={1080} fill="#000" opacity={0.08} />
			</svg>
			{stamp ? (
				<div style={{position: 'absolute', left: 40, top: 30, fontFamily: FONT.mono, fontSize: 30, color: '#f0f0f0', textShadow: '0 0 6px #000'}}>PORT MASON VTS · CAM 2 · BERTH 3</div>
			) : null}
			{stamp ? (
				<div style={{position: 'absolute', right: 40, bottom: 40, fontFamily: FONT.mono, fontSize: 46, color: '#fff', textShadow: '0 0 6px #000'}}>00:26:14</div>
			) : null}
		</AbsoluteFill>
	);
};

/* ----------------------------- final daylight photo ----------------------------- */

export const DAYLIGHT_SPOTS = {
	back: {cx: 1560, cy: 560, z: 2.4},
	pair: {cx: 1600, cy: 565, z: 3.6},
	daniel: {cx: 1660, cy: 548, z: 5.2},
};

export const DaylightPhoto: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill style={{background: '#9cc6ea'}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080">
			<OceanNight f={0} horizon={420} mood="day" stars={false} />
			{/* deck */}
			<path d="M0,560 L1920,520 L1920,1080 L0,1080 Z" fill="#cfd4da" />
			<path d="M0,560 L1920,520" stroke="#fff" strokeWidth={14} />
			{Array.from({length: 14}, (_, i) => (
				<line key={i} x1={i * 150} y1={555 - i * 3} x2={i * 150} y2={470 - i * 3} stroke="#fff" strokeWidth={8} />
			))}
			<line x1={0} y1={470} x2={1920} y2={430} stroke="#fff" strokeWidth={10} />
			{/* crowded, harmless */}
			{Array.from({length: 16}, (_, i) => (
				<Passenger key={i} id={i + 30} x={120 + i * 85 + (i % 3) * 20} y={760 + (i % 4) * 70} s={0.62 + (i % 4) * 0.05} frame={null} mouth={i % 3 ? 'smile' : 'grin'} arms={i % 5 === 0 ? 'wave' : 'relaxed'} />
			))}
			{/* the same bench at the very back: backrest behind them, seat under them */}
			<ellipse cx={1605} cy={641} rx={170} ry={7} fill="#000" opacity={0.18} />
			<rect x={1468} y={600} width={10} height={40} fill="#4a3320" />
			<rect x={1732} y={600} width={10} height={40} fill="#4a3320" />
			<rect x={1460} y={566} width={290} height={11} fill="#8a6440" stroke="#111" strokeWidth={3} />
			<rect x={1460} y={582} width={290} height={11} fill="#7a5532" stroke="#111" strokeWidth={3} />
			<path d="M1452,605 L1758,605 L1764,611 L1446,611 Z" fill="#9a7450" stroke="#111" strokeWidth={3} />
			<rect x={1446} y={611} width={318} height={9} fill="#6b4a2b" stroke="#111" strokeWidth={3} />
			<OldWoman x={1540} y={640} s={0.42} pose="sit" mouth="faint" />
			<Daniel x={1660} y={640} s={0.42} frame={null} pose="sit" arms="fingerLips" mouth="flat" eyes="dot" look={[0, 0]} />
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(255,250,230,0.12), rgba(0,0,0,0))'}} />
		<div style={{position: 'absolute', display: 'none'}}>{h1(f)}</div>
	</AbsoluteFill>
);

/* --------------------------------- ring --------------------------------- */

/** Extreme close-up of the wedding ring. `turn` 0..1 rotates the inside engraving into view. */
export const WeddingRing: React.FC<{f: number; turn: number; expected?: number; reveal37?: boolean}> = ({f, turn, expected = 0, reveal37 = true}) => {
	const rx = 520;
	const ry = 300 - turn * 70;
	const cx = 960;
	const cy = 560;
	const band = 90;
	// engraving travels along the inner band from the far side to the front
	const ang = Math.PI * (1.15 - turn * 0.68);
	const ex = cx + Math.cos(ang) * (rx - band * 0.9);
	const ey = cy + Math.sin(ang) * (ry - band * 0.6) * -1 + 40;
	const squash = Math.max(0.15, Math.abs(Math.sin(ang)));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2320, #070605 70%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{transform: `rotate(${-8 + turn * 14}deg)`}}>
				<defs>
					<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#fff2b0" />
						<stop offset="0.3" stopColor="#d4a637" />
						<stop offset="0.6" stopColor="#8a6514" />
						<stop offset="1" stopColor="#f0cf6a" />
					</linearGradient>
					<linearGradient id="goldIn" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#6e500f" />
						<stop offset="1" stopColor="#e2b94d" />
					</linearGradient>
				</defs>
				<ellipse cx={cx} cy={cy + 40} rx={rx} ry={ry} fill="url(#goldIn)" />
				<ellipse cx={cx} cy={cy + 40} rx={rx - band} ry={ry - band * 0.7} fill="#0d0a08" />
				<path
					d={`M${cx - rx},${cy + 40} A${rx},${ry} 0 0,0 ${cx + rx},${cy + 40} L${cx + rx},${cy + 120} A${rx},${ry} 0 0,1 ${cx - rx},${cy + 120} Z`}
					fill="url(#gold)"
					stroke="#5a420c"
					strokeWidth={4}
				/>
				<ellipse cx={cx} cy={cy + 40} rx={rx} ry={ry} fill="none" stroke="#fff3c4" strokeWidth={6} opacity={0.6} />
				{reveal37 ? (
					<text
						x={0}
						y={0}
						transform={`translate(${ex},${ey}) scale(${squash},1)`}
						textAnchor="middle"
						fontFamily={FONT.type}
						fontSize={120}
						fill="#3b2a07"
						opacity={clamp(turn * 1.6 - 0.2)}
						style={{filter: 'drop-shadow(0 2px 0 rgba(255,230,150,0.5))'}}
					>
						37
					</text>
				) : null}
				<ellipse cx={cx - 220} cy={cy - 80} rx={90} ry={22} fill="#fff" opacity={0.25 + 0.1 * Math.sin(f / 10)} />
			</svg>
			{expected > 0 ? (
				<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT.hand, fontSize: 150, color: '#f2e2b0', opacity: expected * 0.75, textShadow: '0 0 30px rgba(255,220,140,0.6)'}}>D + E</div>
			) : null}
		</AbsoluteFill>
	);
};

export const PhotoImg: React.FC<{src: string}> = ({src}) => <Img src={staticFile(src)} />;
export const _w = wobPoly;
export const _r = wobRect;
