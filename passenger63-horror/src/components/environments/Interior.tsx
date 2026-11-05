// Interior environments: <PassengerCabin/>, <RearDeck/>, <Bridge/>, <FerryCorridor/>,
// <FerryWindow/>, <EngineRoomDoor/>, <CeilingSpeaker/> plus the lightweight
// <CrowdHead/> used for the 62 passengers (grouped, not individually animated).
import React from 'react';
import {boilOf, h01, wob, wobCircle, wobEllipse, wobLine, wobPoly, wobRect} from '../../utils/rough';
import {OceanNight} from './Outdoor';

const INK = '#121214';

const SKINS = ['#f1cfb0', '#d9a67c', '#8d5b3d', '#f3d3bd', '#c99772', '#e8bfa0', '#6b4630'];
const HAIRS = ['#2b1b12', '#111', '#6b4a2b', '#b08a4a', '#3a2a1f', '#999', '#5a2a1a'];
const SHIRTS = ['#6d8f4e', '#b8743a', '#5e5a8a', '#8a3b3b', '#3d7a7a', '#9a8a4a', '#4f5f74', '#7a5a7a', '#a66', '#567'];

export type Lights = 'on' | 'dim' | 'off' | 'red';

/** Cheap passenger: head + shoulders. Used in grouped crowds. */
export const CrowdHead: React.FC<{
	x: number;
	y: number;
	s?: number;
	id: number;
	back?: boolean;
	look?: number;
	mouth?: 'flat' | 'o' | 'scream' | 'smile';
	phone?: boolean;
	f: number;
	skin?: string;
	shirt?: string;
	hair?: string;
	dim?: number;
	eyes?: 'dot' | 'wide';
}> = ({x, y, s = 1, id, back = false, look = 0, mouth = 'flat', phone = false, f, skin, shirt, hair, dim = 0, eyes = 'dot'}) => {
	const sd = id * 17 + boilOf(f, 4) * 5;
	const sk = skin ?? SKINS[(id * 3) % SKINS.length];
	const sh = shirt ?? SHIRTS[(id * 7) % SHIRTS.length];
	const hr = hair ?? HAIRS[(id * 5) % HAIRS.length];
	const r = 30;
	const long = id % 3 === 0;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{long ? <path d={wobRect(-r - 6, -r - 50, 2 * r + 12, 60, sd + 1, 2)} fill={hr} stroke={INK} strokeWidth={4} /> : null}
			<path d={wobEllipse(0, 22, 52, 34, sd + 2, 2, 10)} fill={sh} stroke={INK} strokeWidth={5} />
			<path d={wobCircle(0, -30, r, sd + 3, 1.4, 10)} fill={back ? hr : sk} stroke={INK} strokeWidth={5} />
			{!back ? (
				<>
					<path d={wob([[-r - 2, -32], [-r * 0.8, -r - 18], [0, -r - 34], [r * 0.8, -r - 18], [r + 2, -32], [r * 0.4, -r - 8], [-r * 0.4, -r - 8]], sd + 4, 1.2)} fill={hr} stroke={INK} strokeWidth={4} />
					{eyes === 'wide' ? (
						<>
							<circle cx={-10 + look * 4} cy={-30} r={7} fill="#fff" stroke={INK} strokeWidth={2.5} />
							<circle cx={10 + look * 4} cy={-30} r={7} fill="#fff" stroke={INK} strokeWidth={2.5} />
							<circle cx={-10 + look * 6} cy={-30} r={3} fill={INK} />
							<circle cx={10 + look * 6} cy={-30} r={3} fill={INK} />
						</>
					) : (
						<>
							<circle cx={-10 + look * 5} cy={-31} r={4} fill={INK} />
							<circle cx={10 + look * 5} cy={-31} r={4} fill={INK} />
						</>
					)}
					{mouth === 'o' ? <ellipse cx={look * 4} cy={-14} rx={5} ry={6} fill="#3a1414" stroke={INK} strokeWidth={2.5} /> : null}
					{mouth === 'scream' ? <ellipse cx={look * 4} cy={-12} rx={8} ry={11} fill="#2a0d0d" stroke={INK} strokeWidth={3} /> : null}
					{mouth === 'smile' ? <path d={`M${-8 + look * 4},-16 Q${look * 4},-9 ${8 + look * 4},-16`} stroke={INK} strokeWidth={3} fill="none" /> : null}
					{mouth === 'flat' ? <path d={wobLine(-7 + look * 4, -14, 7 + look * 4, -14, sd + 5, 0.6, 1)} stroke={INK} strokeWidth={3} /> : null}
				</>
			) : null}
			{dim > 0 ? <ellipse cx={0} cy={-10} rx={72} ry={82} fill="#000" opacity={phone ? dim * 0.35 : dim} /> : null}
			{phone ? (
				<g>
					<ellipse cx={0} cy={-20} rx={80} ry={70} fill="#bfe0ff" opacity={0.28} />
					<path d={wobRect(-12, 0, 24, 36, sd + 6, 0.8)} fill="#dff0ff" stroke={INK} strokeWidth={3} />
				</g>
			) : null}
		</g>
	);
};

/** Geometry of the cabin perspective, shared by all cabin shots. */
export const CABIN = {vpx: 960, vpy: 470, rows: 10, cols: 3};
export const rowScale = (row: number) => 1 / (1 + row * 0.36);
export const seatPos = (row: number, side: -1 | 1, col: number) => {
	const sc = rowScale(row);
	const aisle = 95 * sc;
	const seatW = 150 * sc;
	const x = CABIN.vpx + side * (aisle + seatW * (col + 0.5));
	const y = CABIN.vpy + 640 * sc;
	return {x, y, s: sc};
};

export interface Occupant {
	row: number;
	side: -1 | 1;
	col: number;
	render: (pos: {x: number; y: number; s: number}) => React.ReactNode;
}

/** The passenger cabin, seen down the length of the ferry.
 *  facing 'aft'  - camera at the bow end looking back toward the rear doors (faces visible)
 *  facing 'fore' - camera at the stern end looking forward (backs of heads, front wall + screen) */
export const PassengerCabin: React.FC<{
	f: number;
	facing?: 'aft' | 'fore';
	lights?: Lights;
	occupancy?: number;
	empty?: string[];
	special?: Occupant[];
	doorFigure?: boolean;
	doorFigureOpacity?: number;
	headsLook?: number;
	crowdMouth?: 'flat' | 'o' | 'scream';
	phones?: number;
	shiftAway?: number;
	frontScreen?: React.ReactNode;
	seatLabels?: boolean;
	rows?: number;
	crowdEyes?: 'dot' | 'wide';
}> = ({
	f,
	facing = 'aft',
	lights = 'on',
	occupancy = 0.86,
	empty = [],
	special = [],
	doorFigure = false,
	doorFigureOpacity = 1,
	headsLook = 0,
	crowdMouth = 'flat',
	phones = 0,
	shiftAway = 0,
	frontScreen,
	seatLabels = false,
	rows = CABIN.rows,
	crowdEyes = 'dot',
}) => {
	const sd = 300 + boilOf(f, 4) * 3;
	const {vpx, vpy} = CABIN;
	const bw = {l: 700, r: 1220, t: 300, b: 650};
	const red = lights === 'red';
	const dark = lights === 'off';
	const wall = red ? '#4b1414' : dark ? '#0b0d12' : '#7e8a9b';
	const ceil = red ? '#3a0f0f' : dark ? '#07080b' : '#c3c8cf';
	const floor = red ? '#2a0909' : dark ? '#050608' : '#39404d';
	const lightStrip = lights === 'on' || lights === 'dim' ? '#fff9dc' : red ? '#ff4a3a' : '#333';
	const specialMap = new Map(special.map((o) => [`${o.row}:${o.side}:${o.col}`, o]));
	const emptySet = new Set(empty);

	const rowEls: React.ReactNode[] = [];
	for (let row = rows - 1; row >= 0; row--) {
		const sc = rowScale(row);
		for (const side of [-1, 1] as const) {
			for (let col = 0; col < CABIN.cols; col++) {
				const {x, y} = seatPos(row, side, col);
				const key = `${row}:${side}:${col}`;
				const id = row * 6 + (side > 0 ? 3 : 0) + col;
				const sp = specialMap.get(key);
				const occupied = !emptySet.has(key) && (sp || h01(id, 77) < occupancy);
				const seatBack = (
					<path
						key={`sb${key}`}
						d={wobPoly([[x - 66 * sc, y - (facing === 'aft' ? 150 : 95) * sc], [x + 66 * sc, y - (facing === 'aft' ? 150 : 95) * sc], [x + 62 * sc, y + 10 * sc], [x - 62 * sc, y + 10 * sc]], sd + id, 1.6 * sc)}
						fill={red ? '#5a1010' : dark ? '#0c1220' : '#2d4f86'}
						stroke={INK}
						strokeWidth={5 * sc}
					/>
				);
				const headrest = (
					<path key={`hr${key}`} d={wobRect(x - 44 * sc, y - (facing === 'aft' ? 150 : 95) * sc, 88 * sc, 26 * sc, sd + id + 500, 1 * sc)} fill={red ? '#8a5050' : dark ? '#16181c' : '#e8ebef'} stroke={INK} strokeWidth={3 * sc} />
				);
				const lean = shiftAway * (side * -1) * 40 * sc * (col === 2 ? 1 : col === 1 ? 0.6 : 0.3);
				let person: React.ReactNode = null;
				if (sp) person = sp.render({x, y: y - 30 * sc, s: sc});
				else if (occupied)
					person = (
						<CrowdHead
							key={`p${key}`}
							x={x + lean}
							y={y - (facing === 'aft' ? 62 : 70) * sc}
							s={sc * 1.05}
							id={id}
							back={facing === 'fore'}
							look={headsLook + (facing === 'aft' ? h01(id, 3) * 0.6 - 0.3 : 0)}
							mouth={crowdMouth === 'flat' ? (h01(id, 9) > 0.8 ? 'smile' : 'flat') : h01(id, 8) > 0.5 ? crowdMouth : 'o'}
							phone={phones > 0 && h01(id, 5) < phones}
							f={f}
							eyes={crowdEyes}
							dim={lights === 'off' ? 0.7 : 0}
						/>
					);
				if (facing === 'aft') {
					rowEls.push(seatBack, headrest);
					if (person) rowEls.push(<g key={`pp${key}`}>{person}</g>);
				} else {
					if (person) rowEls.push(<g key={`pp${key}`}>{person}</g>);
					rowEls.push(seatBack, headrest);
				}
				if (seatLabels && facing === 'fore' && row < 6) {
					rowEls.push(
						<text key={`lb${key}`} x={x} y={y - 60 * sc} textAnchor="middle" fontFamily="Patrick Hand" fontSize={26 * sc} fill="#fff">
							{`${14 + (5 - row)}${side < 0 ? 'ABC'[col] : 'DEF'[col]}`}
						</text>,
					);
				}
			}
		}
	}

	const windows = [0.25, 0.45, 0.62, 0.75, 0.85].map((t, i) => {
		const tx = (side: number, k: number) => (side < 0 ? 0 + (bw.l - 0) * k : 1920 - (1920 - bw.r) * k);
		const yTop = (k: number) => 230 + (bw.t + 30 - 230) * k * 1.0;
		const yBot = (k: number) => 520 + (bw.t + 150 - 520) * k;
		const k0 = t;
		const k1 = t + 0.08 * (1 - t) + 0.04;
		return [-1, 1].map((side) => (
			<path
				key={`win${i}${side}`}
				d={wobPoly([[tx(side, k0), yTop(k0)], [tx(side, k1), yTop(k1)], [tx(side, k1), yBot(k1)], [tx(side, k0), yBot(k0)]], sd + 40 + i * 2 + side, 1.5)}
				fill={red ? '#120202' : '#050a14'}
				stroke={INK}
				strokeWidth={5}
			/>
		));
	});

	return (
		<g>
			{/* ceiling, floor, walls */}
			<path d={wobPoly([[-50, -50], [1970, -50], [bw.r, bw.t], [bw.l, bw.t]], sd + 1, 2)} fill={ceil} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[-50, 1130], [1970, 1130], [bw.r, bw.b], [bw.l, bw.b]], sd + 2, 2)} fill={floor} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[870, 1130], [1050, 1130], [985, bw.b], [935, bw.b]], sd + 3, 2)} fill={red ? '#3a0c0c' : '#27406b'} opacity={0.9} />
			<path d={wobPoly([[-50, -50], [bw.l, bw.t], [bw.l, bw.b], [-50, 1130]], sd + 4, 2)} fill={wall} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[1970, -50], [bw.r, bw.t], [bw.r, bw.b], [1970, 1130]], sd + 5, 2)} fill={wall} stroke={INK} strokeWidth={5} />
			{windows}
			{/* ceiling light strips */}
			{[-1, 1].map((side) => (
				<g key={`ls${side}`}>
					<path d={wobLine(960 + side * 520, -40, 960 + side * 130, bw.t + 4, sd + 8 + side, 2, 3)} stroke={lightStrip} strokeWidth={16} opacity={lights === 'off' ? 0.15 : 1} />
					{lights === 'on' ? <path d={wobLine(960 + side * 520, -40, 960 + side * 130, bw.t + 4, sd + 8 + side, 2, 3)} stroke={lightStrip} strokeWidth={60} opacity={0.12} /> : null}
				</g>
			))}
			{/* end wall */}
			<path d={wobRect(bw.l, bw.t, bw.r - bw.l, bw.b - bw.t, sd + 9, 2)} fill={red ? '#561818' : dark ? '#0a0b0f' : '#97a1af'} stroke={INK} strokeWidth={5} />
			{facing === 'aft' ? (
				<g>
					<path d={wobRect(845, 380, 115, 270, sd + 10, 1.5)} fill={red ? '#5c2222' : '#b7bec7'} stroke={INK} strokeWidth={5} />
					<path d={wobRect(960, 380, 115, 270, sd + 11, 1.5)} fill={red ? '#5c2222' : '#b7bec7'} stroke={INK} strokeWidth={5} />
					<path d={wobRect(865, 402, 76, 110, sd + 12, 1.2)} fill="#081020" stroke={INK} strokeWidth={4} />
					<path d={wobRect(980, 402, 76, 110, sd + 13, 1.2)} fill="#081020" stroke={INK} strokeWidth={4} />
					<path d={wobLine(865, 470, 941, 470, sd + 14, 0.5, 2)} stroke="#2b3c55" strokeWidth={3} />
					<path d={wobLine(980, 470, 1056, 470, sd + 15, 0.5, 2)} stroke="#2b3c55" strokeWidth={3} />
					{doorFigure ? (
						<g opacity={doorFigureOpacity}>
							<rect x={1004} y={462} width={20} height={40} fill="#0a0a0b" />
							<circle cx={1014} cy={455} r={8} fill="#e2ddd5" />
							<circle cx={1014} cy={446} r={4.5} fill="#aaa" />
						</g>
					) : null}
					<path d={wobRect(905, 330, 110, 38, sd + 16, 1)} fill={red ? '#2b4a2b' : '#1f9a4b'} stroke={INK} strokeWidth={3} />
					<text x={960} y={358} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#eaffea">
						EXIT
					</text>
					<text x={960} y={630} textAnchor="middle" fontFamily="Patrick Hand" fontSize={18} fill="#222">
						REAR DECK
					</text>
				</g>
			) : (
				<g>
					<path d={wobRect(820, 330, 280, 160, sd + 17, 1.5)} fill="#0b0f16" stroke={INK} strokeWidth={5} />
					<g transform="translate(830, 340)">{frontScreen}</g>
					<path d={wobRect(735, 340, 60, 30, sd + 18, 1)} fill="#1f9a4b" stroke={INK} strokeWidth={3} />
					<path d={wobRect(1125, 340, 60, 30, sd + 19, 1)} fill="#1f9a4b" stroke={INK} strokeWidth={3} />
				</g>
			)}
			{rowEls}
		</g>
	);
};

/** Close view of one seat row by a big window. Characters are passed as children. */
export const CabinRow: React.FC<{
	f: number;
	lights?: Lights;
	labels?: [string, string];
	children?: React.ReactNode;
	reflection?: React.ReactNode;
	horizon?: number;
	calm?: number;
}> = ({f, lights = 'on', labels = ['18A', '18B'], children, reflection, horizon = 470, calm = 0}) => {
	const sd = 700 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#3c1010' : '#7f8b9c'} />
			{/* window */}
			<defs>
				<clipPath id="rowWin">
					<rect x={360} y={150} width={1200} height={440} rx={60} />
				</clipPath>
			</defs>
			<g clipPath="url(#rowWin)">
				<g transform="translate(0,-60)">
					<OceanNight f={f} horizon={horizon} mood={red ? 'red' : 'night'} calm={calm} stars />
				</g>
				{reflection}
			</g>
			<path d={wobPoly([[360, 150], [1560, 150], [1560, 590], [360, 590]], sd + 1, 2)} fill="none" stroke={INK} strokeWidth={14} />
			<path d={wobLine(960, 150, 960, 590, sd + 2, 1.5, 3)} stroke={INK} strokeWidth={12} />
			{/* rail */}
			<path d={wobLine(200, 640, 1720, 640, sd + 3, 2, 6)} stroke="#c0c6ce" strokeWidth={12} />
			<path d={wobLine(200, 640, 1720, 640, sd + 3, 2, 6)} stroke={INK} strokeWidth={3} opacity={0.6} />
			{/* seats */}
			{[600, 960, 1320].map((sx, i) => (
				<g key={i}>
					<path d={wobPoly([[sx - 150, 560], [sx + 150, 560], [sx + 140, 830], [sx - 140, 830]], sd + 10 + i, 2)} fill={red ? '#5a1010' : '#2d4f86'} stroke={INK} strokeWidth={6} />
					<path d={wobRect(sx - 95, 560, 190, 50, sd + 20 + i, 1.5)} fill={red ? '#8a5050' : '#e8ebef'} stroke={INK} strokeWidth={4} />
				</g>
			))}
			{labels.map((l, i) => (
				<g key={l}>
					<path d={wobRect(860 + i * 360 - 140, 520, 80, 34, sd + 30 + i, 1)} fill="#f2f2f2" stroke={INK} strokeWidth={3} />
					<text x={900 + i * 360 - 140} y={545} textAnchor="middle" fontFamily="Patrick Hand" fontSize={26} fill="#111">
						{l}
					</text>
				</g>
			))}
			{children}
			{/* seat cushions in front of legs */}
			{[600, 960, 1320].map((sx, i) => (
				<path key={`cu${i}`} d={wobPoly([[sx - 160, 822], [sx + 160, 822], [sx + 175, 930], [sx - 175, 930]], sd + 40 + i, 2)} fill={red ? '#4a0d0d' : '#243f6c'} stroke={INK} strokeWidth={6} />
			))}
			<rect x={-100} y={926} width={2120} height={260} fill={red ? '#220707' : '#353b47'} />
		</g>
	);
};

/** The rear deck: benches, railing, open black sea.
 *  view 'behind' - from behind the bench, facing the open sea (her back to us)
 *  view 'front'  - from the railing looking back at the bench and the lit cabin doors */
export const RearDeck: React.FC<{
	f: number;
	view?: 'behind' | 'front';
	lights?: Lights;
	calm?: number;
	fog?: number;
	children?: React.ReactNode;
	benchX?: number;
	seaChildren?: React.ReactNode;
	horizon?: number;
	doorsLit?: boolean;
}> = ({f, view = 'behind', lights = 'on', calm = 0, fog = 0.15, children, benchX = 960, seaChildren, horizon = 470, doorsLit = true}) => {
	const sd = 800 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	const deckCol = red ? '#2a0b0b' : lights === 'off' ? '#08090b' : '#4d535d';
	if (view === 'behind') {
		return (
			<g>
				<OceanNight f={f} horizon={horizon} calm={calm} fog={fog} mood={red ? 'red' : lights === 'off' ? 'dark' : 'night'} />
				{seaChildren}
				{/* deck */}
				<path d={wobPoly([[-60, 700], [1980, 700], [1980, 1140], [-60, 1140]], sd + 1, 2)} fill={deckCol} stroke={INK} strokeWidth={5} />
				{Array.from({length: 9}, (_, i) => (
					<path key={`pl${i}`} d={wobLine(-60, 740 + i * 46, 1980, 740 + i * 46, sd + 2 + i, 1.5, 4)} stroke="#000" strokeWidth={2} opacity={0.35} />
				))}
				{/* railing */}
				<path d={wobLine(-60, 610, 1980, 610, sd + 20, 2, 8)} stroke={red ? '#7a2a2a' : '#c9ced5'} strokeWidth={12} />
				<path d={wobLine(-60, 655, 1980, 655, sd + 21, 2, 8)} stroke={red ? '#7a2a2a' : '#c9ced5'} strokeWidth={8} />
				{Array.from({length: 13}, (_, i) => (
					<path key={`post${i}`} d={wobLine(-20 + i * 165, 604, -20 + i * 165, 705, sd + 30 + i, 1, 2)} stroke={red ? '#7a2a2a' : '#c9ced5'} strokeWidth={9} />
				))}
				{/* lifebuoy */}
				<g transform="translate(1610, 640)">
					<path d={wobCircle(0, 0, 42, sd + 40, 1.5)} fill="none" stroke="#e8521d" strokeWidth={20} />
					<path d={wobCircle(0, 0, 42, sd + 40, 1.5)} fill="none" stroke="#fff" strokeWidth={20} strokeDasharray="22 44" />
				</g>
				{/* stern lamp */}
				<path d={wobLine(260, 705, 260, 380, sd + 50, 1, 3)} stroke="#222" strokeWidth={10} />
				<circle cx={260} cy={372} r={14} fill={lights === 'off' ? '#222' : red ? '#ff3a2a' : '#fff2c4'} />
				<defs>
					<radialGradient id={`lampGlow${red ? 'r' : 'w'}`}>
						<stop offset="0" stopColor={red ? '#ff2a1a' : '#fff2c4'} stopOpacity="0.28" />
						<stop offset="1" stopColor={red ? '#ff2a1a' : '#fff2c4'} stopOpacity="0" />
					</radialGradient>
				</defs>
				{lights !== 'off' ? <ellipse cx={260} cy={420} rx={300} ry={300} fill={`url(#lampGlow${red ? 'r' : 'w'})`} /> : null}
				{/* bench (seen from behind) */}
				<g transform={`translate(${benchX},0)`}>
					<path d={wobRect(-230, 800, 460, 26, sd + 60, 1.5)} fill="#6b4a2b" stroke={INK} strokeWidth={5} />
					<path d={wobLine(-200, 826, -200, 900, sd + 61, 1, 1)} stroke={INK} strokeWidth={9} />
					<path d={wobLine(200, 826, 200, 900, sd + 62, 1, 1)} stroke={INK} strokeWidth={9} />
					{children}
					<path d={wobRect(-240, 740, 480, 22, sd + 63, 1.5)} fill="#7a5532" stroke={INK} strokeWidth={5} />
					<path d={wobRect(-240, 772, 480, 20, sd + 64, 1.5)} fill="#7a5532" stroke={INK} strokeWidth={5} />
				</g>
			</g>
		);
	}
	// view === 'front': looking from the railing back at the cabin
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#1a0505' : lights === 'off' ? '#030305' : '#0a0f19'} />
			{/* cabin wall */}
			<path d={wobPoly([[-60, 140], [1980, 140], [1980, 720], [-60, 720]], sd + 70, 2)} fill={red ? '#4a1212' : lights === 'off' ? '#0d0e12' : '#c8ccd2'} stroke={INK} strokeWidth={6} />
			{[160, 520, 1400, 1760].map((wx, i) => (
				<path
					key={`cw${i}`}
					d={wobRect(wx - 120, 240, 240, 170, sd + 71 + i, 1.5)}
					fill={lights === 'off' ? '#111' : red ? '#8a1a1a' : doorsLit ? '#ffe39a' : '#3a4250'}
					stroke={INK}
					strokeWidth={5}
				/>
			))}
			<path d={wobRect(820, 260, 140, 460, sd + 80, 1.5)} fill={red ? '#5c2222' : '#9aa3ae'} stroke={INK} strokeWidth={5} />
			<path d={wobRect(960, 260, 140, 460, sd + 81, 1.5)} fill={red ? '#5c2222' : '#9aa3ae'} stroke={INK} strokeWidth={5} />
			<path d={wobRect(845, 290, 90, 140, sd + 82, 1)} fill={lights === 'off' ? '#111' : red ? '#a02020' : '#ffe39a'} stroke={INK} strokeWidth={4} />
			<path d={wobRect(985, 290, 90, 140, sd + 83, 1)} fill={lights === 'off' ? '#111' : red ? '#a02020' : '#ffe39a'} stroke={INK} strokeWidth={4} />
			<path d={wobPoly([[-60, 720], [1980, 720], [1980, 1140], [-60, 1140]], sd + 84, 2)} fill={deckCol} stroke={INK} strokeWidth={5} />
			<g transform={`translate(${benchX},0)`}>
				<path d={wobRect(-240, 700, 480, 22, sd + 85, 1.5)} fill="#7a5532" stroke={INK} strokeWidth={5} />
				<path d={wobRect(-240, 732, 480, 20, sd + 86, 1.5)} fill="#7a5532" stroke={INK} strokeWidth={5} />
				{children}
				<path d={wobRect(-230, 840, 460, 26, sd + 87, 1.5)} fill="#6b4a2b" stroke={INK} strokeWidth={5} />
				<path d={wobLine(-200, 866, -200, 940, sd + 88, 1, 1)} stroke={INK} strokeWidth={9} />
				<path d={wobLine(200, 866, 200, 940, sd + 89, 1, 1)} stroke={INK} strokeWidth={9} />
			</g>
			{/* foreground railing */}
			<path d={wobLine(-60, 990, 1980, 990, sd + 90, 2, 8)} stroke={red ? '#7a2a2a' : '#c9ced5'} strokeWidth={14} />
			{Array.from({length: 13}, (_, i) => (
				<path key={`fp${i}`} d={wobLine(-20 + i * 165, 985, -20 + i * 165, 1100, sd + 91 + i, 1, 2)} stroke={red ? '#7a2a2a' : '#c9ced5'} strokeWidth={10} />
			))}
		</g>
	);
};

/** The bridge: big windows over a console of navigation electronics. */
export const Bridge: React.FC<{
	f: number;
	lights?: Lights;
	screens?: React.ReactNode;
	outside?: React.ReactNode;
	calm?: number;
	children?: React.ReactNode;
}> = ({f, lights = 'on', screens, outside, calm = 0, children}) => {
	const sd = 1100 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	return (
		<g>
			<defs>
				<clipPath id="bridgeWin">
					<path d="M80,90 L1840,90 L1780,520 L140,520 Z" />
				</clipPath>
			</defs>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#1c0606' : '#161b24'} />
			<g clipPath="url(#bridgeWin)">{outside ?? <OceanNight f={f} horizon={330} calm={calm} mood="dark" />}</g>
			<path d={wobPoly([[80, 90], [1840, 90], [1780, 520], [140, 520]], sd + 1, 2)} fill="none" stroke={INK} strokeWidth={18} />
			{[520, 960, 1400].map((mx, i) => (
				<path key={`mul${i}`} d={wobLine(mx, 90, mx + (mx - 960) * -0.05, 520, sd + 2 + i, 1.5, 2)} stroke={INK} strokeWidth={16} />
			))}
			{/* console */}
			<path d={wobPoly([[-60, 600], [1980, 600], [1980, 1140], [-60, 1140]], sd + 10, 2)} fill={red ? '#2a0c0c' : '#2b313c'} stroke={INK} strokeWidth={6} />
			<path d={wobPoly([[-60, 560], [1980, 560], [1980, 610], [-60, 610]], sd + 11, 2)} fill={red ? '#3a1212' : '#3c4452'} stroke={INK} strokeWidth={5} />
			{screens}
			{/* little indicator lights */}
			{Array.from({length: 18}, (_, i) => (
				<circle key={`led${i}`} cx={120 + i * 95} cy={1040} r={7} fill={h01(i, Math.floor(f / 20)) > 0.5 ? (i % 3 ? '#35d06a' : '#ffb02e') : '#1a1f1a'} />
			))}
			{children}
		</g>
	);
};

/** Metal corridor below decks. */
export const FerryCorridor: React.FC<{f: number; lights?: Lights; children?: React.ReactNode}> = ({f, lights = 'on', children}) => {
	const sd = 1200 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	const wall = red ? '#4a1010' : '#8d96a1';
	const back = {l: 780, r: 1140, t: 360, b: 640};
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#1a0404' : '#5f6772'} />
			<path d={wobPoly([[-50, -50], [1970, -50], [back.r, back.t], [back.l, back.t]], sd + 1, 2)} fill={red ? '#2d0808' : '#a7aeb7'} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[-50, 1130], [1970, 1130], [back.r, back.b], [back.l, back.b]], sd + 2, 2)} fill={red ? '#220606' : '#4b525d'} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[-50, -50], [back.l, back.t], [back.l, back.b], [-50, 1130]], sd + 3, 2)} fill={wall} stroke={INK} strokeWidth={5} />
			<path d={wobPoly([[1970, -50], [back.r, back.t], [back.r, back.b], [1970, 1130]], sd + 4, 2)} fill={wall} stroke={INK} strokeWidth={5} />
			<path d={wobRect(back.l, back.t, back.r - back.l, back.b - back.t, sd + 5, 2)} fill={red ? '#3a0c0c' : '#c0c6cd'} stroke={INK} strokeWidth={5} />
			<path d={wobRect(900, 400, 120, 240, sd + 6, 1.5)} fill={red ? '#5c1a1a' : '#8a939e'} stroke={INK} strokeWidth={5} />
			<text x={960} y={392} textAnchor="middle" fontFamily="Patrick Hand" fontSize={24} fill={red ? '#ffb3a8' : '#1a2230'}>
				BRIDGE
			</text>
			{/* pipes */}
			{[0, 1, 2].map((i) => (
				<path key={`pipe${i}`} d={wobLine(-50, 60 + i * 34, back.l, back.t + 10 + i * 8, sd + 10 + i, 1.5, 3)} stroke={red ? '#6a2020' : '#6b7480'} strokeWidth={18 - i * 3} />
			))}
			{/* side doors */}
			{[0.25, 0.55].map((k, i) => (
				<g key={`sd${i}`}>
					<path d={wobPoly([[1970 - (1970 - back.r) * k, 200 + 180 * k], [1970 - (1970 - back.r) * (k + 0.18), 200 + 180 * (k + 0.18)], [1970 - (1970 - back.r) * (k + 0.18), 1000 - 330 * (k + 0.18)], [1970 - (1970 - back.r) * k, 1000 - 330 * k]], sd + 20 + i, 1.5)} fill={red ? '#561616' : '#727c88'} stroke={INK} strokeWidth={5} />
				</g>
			))}
			{/* ceiling lamps */}
			{[0.15, 0.45, 0.7].map((k, i) => {
				const y = -50 + (back.t + 50) * k;
				return <path key={`cl${i}`} d={wobRect(960 - 160 * (1 - k), y, 320 * (1 - k), 18 * (1 - k) + 6, sd + 30 + i, 1)} fill={red ? '#ff3a2a' : lights === 'off' ? '#222' : '#fffbe0'} stroke={INK} strokeWidth={3} />;
			})}
			{children}
		</g>
	);
};

/** Close view of a cabin window with the passenger's reflection in the glass. */
export const FerryWindow: React.FC<{f: number; reflection?: React.ReactNode; reflectionOpacity?: number; lights?: Lights; children?: React.ReactNode}> = ({
	f,
	reflection,
	reflectionOpacity = 0.22,
	lights = 'on',
	children,
}) => {
	const sd = 1300 + boilOf(f, 4) * 3;
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={lights === 'red' ? '#3c1010' : '#7f8b9c'} />
			<defs>
				<clipPath id="fw">
					<rect x={180} y={90} width={1560} height={900} rx={110} />
				</clipPath>
			</defs>
			<g clipPath="url(#fw)">
				<rect x={0} y={0} width={1920} height={1080} fill="#03060c" />
				<g transform="translate(-200,-80) scale(1.2)">
					<OceanNight f={f} horizon={520} mood={lights === 'red' ? 'red' : 'night'} />
				</g>
				<g opacity={reflectionOpacity}>{reflection}</g>
				{children}
				{/* glass sheen */}
				<path d="M300,90 L700,90 L380,990 L180,990 Z" fill="#fff" opacity={0.03} />
			</g>
			<path d={wobPoly([[180, 90], [1740, 90], [1740, 990], [180, 990]], sd + 1, 2)} fill="none" stroke={INK} strokeWidth={22} />
		</g>
	);
};

/** A labelled steel door (storage, WC, engine room). */
export const EngineRoomDoor: React.FC<{f: number; label?: string; sub?: string; open?: number; lights?: Lights; beam?: boolean}> = ({
	f,
	label = 'ENGINE ROOM',
	sub = 'CREW ONLY',
	open = 0,
	lights = 'on',
	beam = false,
}) => {
	const sd = 1400 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#3a0d0d' : '#6c7580'} />
			{Array.from({length: 12}, (_, i) => (
				<circle key={i} cx={560 + (i % 6) * 160} cy={i < 6 ? 120 : 1000} r={7} fill="#3a3f47" />
			))}
			<path d={wobRect(620, 160, 680, 860, sd + 1, 2)} fill="#05070a" stroke={INK} strokeWidth={6} />
			<g transform={`translate(620,160) scale(${1 - open * 0.75},1)`}>
				<path d={wobRect(0, 0, 680, 860, sd + 2, 2)} fill={red ? '#6a2020' : '#9aa3ad'} stroke={INK} strokeWidth={7} />
				<path d={wobCircle(340, 230, 80, sd + 3, 2)} fill="#0c1018" stroke={INK} strokeWidth={8} />
				<path d={wobRect(110, 420, 460, 120, sd + 4, 1.5)} fill="#f2c94c" stroke={INK} strokeWidth={5} />
				<text x={340} y={478} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill="#1a1a1a">
					{label}
				</text>
				<text x={340} y={525} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill="#1a1a1a">
					{sub}
				</text>
				<path d={wobLine(600, 520, 650, 520, sd + 5, 1, 1)} stroke={INK} strokeWidth={16} />
			</g>
			{beam ? <path d="M960,1100 L700,300 L1220,300 Z" fill="#fff6c8" opacity={0.1} /> : null}
		</g>
	);
};

/** Ceiling PA speaker close-up. `active` 0..1 lights the grille. */
export const CeilingSpeaker: React.FC<{f: number; active?: number; lights?: Lights; level?: number}> = ({f, active = 0, lights = 'on', level = 0}) => {
	const sd = 1500 + boilOf(f, 4) * 3;
	const red = lights === 'red';
	return (
		<g>
			<rect x={-100} y={-100} width={2120} height={1300} fill={red ? '#2a0909' : '#b9bfc7'} />
			{Array.from({length: 6}, (_, i) => (
				<path key={i} d={wobLine(-100, 120 + i * 180, 2020, 120 + i * 180, sd + i, 1.5, 6)} stroke="#000" strokeWidth={3} opacity={0.25} />
			))}
			<path d={wobCircle(960, 540, 330, sd + 10, 3)} fill={red ? '#3c1010' : '#d6dade'} stroke={INK} strokeWidth={10} />
			<path d={wobCircle(960, 540, 270, sd + 11, 3)} fill={red ? '#1f0606' : '#2d3138'} stroke={INK} strokeWidth={8} />
			{Array.from({length: 13}, (_, r) =>
				Array.from({length: 13}, (_, c) => {
					const x = 960 + (c - 6) * 38;
					const y = 540 + (r - 6) * 38;
					if ((x - 960) ** 2 + (y - 540) ** 2 > 240 ** 2) return null;
					const pulse = level * (0.5 + 0.5 * Math.sin(f * 0.9 + r * 0.7 + c));
					return <circle key={`${r}-${c}`} cx={x} cy={y} r={9 + pulse * 3} fill={active > 0 ? `rgba(255,${red ? 80 : 230},${red ? 60 : 170},${0.15 + active * 0.5})` : '#111'} />;
				}),
			)}
			{active > 0 ? <circle cx={960} cy={540} r={420} fill={red ? '#ff3a2a' : '#fff1c2'} opacity={0.06 * active} /> : null}
		</g>
	);
};

export const Ellipsis = wobEllipse;
