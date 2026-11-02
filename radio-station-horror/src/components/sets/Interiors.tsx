// Smaller interior sets: building hallway, elevator, flea market, Daniel's dorm.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../../utils/fonts';
import {C} from '../../utils/palette';
import {useBoil, wobEllipse, wobLine, wobPoly, wobRect} from '../../utils/wobble';
import {Bed} from '../Bed';
import type {DoorProps} from '../Door';
import {Door} from '../Door';
import {Desk, Lamp, Window} from '../Furniture';

// -------------------------------------------------------------- hallway -----
export const Hallway: React.FC<{doorA?: Partial<DoorProps>; doorB?: Partial<DoorProps>; light?: number}> = ({doorA = {}, doorB = {}, light = 1}) => {
	const b = useBoil();
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={1220} fill="#6b6a55" />
			<rect x={-400} y={560} width={2720} height={260} fill="#5a5946" />
			<path d={wobLine(-400, 560, 2320, 560, 1000 + b, 1.5)} stroke={C.ink} strokeWidth={5} />
			<rect x={-400} y={820} width={2720} height={600} fill="#4b3a3a" />
			<path d={wobLine(-400, 820, 2320, 820, 1001 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			{[200, 960, 1720].map((x, i) => (
				<g key={x}>
					<rect x={x - 60} y={-10} width={120} height={22} fill={light > 0.5 ? '#fff6c8' : '#555'} stroke={C.ink} strokeWidth={4} />
					{light > 0.5 && <path d={`M ${x - 60} 12 L ${x + 60} 12 L ${x + 200} 820 L ${x - 200} 820 Z`} fill="#fff6c8" opacity={0.06} />}
					{i === 1 && <rect x={x - 26} y={160} width={52} height={70} fill="#2c6e3a" stroke={C.ink} strokeWidth={4} />}
				</g>
			))}
			<text x={960} y={208} fontFamily={FONT.paint} fontWeight={700} fontSize={26} fill="#f4f4f0" textAnchor="middle">
				EXIT
			</text>
			<Door x={300} y={320} w={240} h={500} label="6A" color="#8a5a33" seed={11} {...doorA} />
			<Door x={1380} y={320} w={240} h={500} label="6B" seed={12} {...doorB} />
			<path d={wobPoly([[620, 900], [1300, 900], [1360, 1000], [560, 1000]], 1002 + b, 3)} fill="#6b2a2a" opacity={0.5} />
		</g>
	);
};

// ------------------------------------------------------------- elevator -----
export const Elevator: React.FC<{floorText?: string; light?: number; panel?: number; dust?: number}> = ({floorText = '4', light = 1, panel = 0, dust = 0}) => {
	const b = useBoil();
	const f = useCurrentFrame();
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={1900} fill="#8d939c" />
			{/* back wall panels */}
			{[0, 1, 2].map((i) => (
				<path key={i} d={wobRect(440 + i * 360, 220, 320, 620, 1100 + i + b, 2)} fill="#a1a7b0" stroke={C.ink} strokeWidth={5} />
			))}
			<rect x={-400} y={860} width={2720} height={600} fill="#4a4c52" />
			<path d={wobLine(-400, 860, 2320, 860, 1105 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			<path d={wobLine(380, 860, 380, -400, 1106 + b, 1.5)} stroke={C.ink} strokeWidth={6} />
			<path d={wobLine(1540, 860, 1540, -400, 1107 + b, 1.5)} stroke={C.ink} strokeWidth={6} />
			{/* ceiling with hatch */}
			<rect x={-400} y={-400} width={2720} height={500} fill="#6d727a" />
			<path d={wobLine(-400, 100, 2320, 100, 1108 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			<g transform={`translate(${panel * 30} ${-panel * 8})`}>
				<path d={wobRect(820, 20, 280, 70, 1109 + b, 2)} fill="#7d828a" stroke={C.ink} strokeWidth={6} />
			</g>
			{panel > 0 && <rect x={822} y={22} width={panel * 36} height={66} fill="#000" />}
			{/* lights */}
			<rect x={500} y={40} width={200} height={26} fill={light > 0.5 ? '#f4f6ff' : '#333'} stroke={C.ink} strokeWidth={4} />
			<rect x={1220} y={40} width={200} height={26} fill={light > 0.5 ? '#f4f6ff' : '#333'} stroke={C.ink} strokeWidth={4} />
			{/* floor indicator */}
			<path d={wobRect(1640, 200, 160, 90, 1110 + b, 2)} fill="#111" stroke={C.ink} strokeWidth={6} />
			<text x={1720} y={268} fontFamily={FONT.vcr} fontSize={72} fill={C.red} textAnchor="middle">
				{floorText}
			</text>
			{/* buttons */}
			<path d={wobRect(1650, 360, 140, 280, 1111 + b, 2)} fill="#c9ccd2" stroke={C.ink} strokeWidth={5} />
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
				<circle key={i} cx={1690 + (i % 2) * 60} cy={400 + Math.floor(i / 2) * 60} r={16} fill={i === 5 ? C.yellow : '#e9e9e9'} stroke={C.ink} strokeWidth={4} />
			))}
			{/* dust falling from the hatch */}
			{dust > 0 &&
				Array.from({length: 8}).map((_, i) => (
					<circle key={i} cx={860 + i * 26} cy={100 + ((f * 3 + i * 40) % 300)} r={3} fill="#ccc" opacity={dust * 0.8} />
				))}
			{light < 1 && <rect x={-400} y={-400} width={2720} height={1900} fill="#000" opacity={(1 - light) * 0.95} />}
		</g>
	);
};

// --------------------------------------------------------------- market -----
export const Market: React.FC<{radioOnTable?: boolean; priceTag?: string; behindTable?: React.ReactNode}> = ({radioOnTable = false, priceTag = '$15', behindTable}) => {
	const b = useBoil();
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={1300} fill="#a9cbe6" />
			<path d={wobEllipse(1700, 120, 70, 70, 1200 + b, 2)} fill={C.yellow} stroke={C.ink} strokeWidth={5} />
			{/* background stalls */}
			{[-200, 1500].map((x, i) => (
				<g key={x}>
					<path d={wobRect(x, 420, 520, 400, 1201 + i + b, 3)} fill="#c8b07a" stroke={C.ink} strokeWidth={6} />
					<path d={wobPoly([[x - 30, 420], [x + 550, 420], [x + 500, 330], [x + 20, 330]], 1203 + i + b, 3)} fill={i ? C.green : C.blue} stroke={C.ink} strokeWidth={6} />
				</g>
			))}
			<rect x={-400} y={820} width={2720} height={700} fill="#8f8f8f" />
			<path d={wobLine(-400, 820, 2320, 820, 1205 + b, 2)} stroke={C.ink} strokeWidth={8} />
			{/* main stall awning */}
			<path d={wobLine(440, 260, 440, 820, 1206 + b, 2)} stroke={C.ink} strokeWidth={14} />
			<path d={wobLine(1480, 260, 1480, 820, 1207 + b, 2)} stroke={C.ink} strokeWidth={14} />
			{Array.from({length: 8}).map((_, i) => (
				<path
					key={i}
					d={wobPoly([[400 + i * 140, 200], [540 + i * 140, 200], [540 + i * 140, 300], [400 + i * 140, 300]], 1210 + i + b, 2)}
					fill={i % 2 ? C.white : C.red}
					stroke={C.ink}
					strokeWidth={5}
				/>
			))}
			<text x={960} y={175} fontFamily={FONT.marker} fontSize={64} fill={C.ink} textAnchor="middle">
				SECOND-HAND MARKET
			</text>
			{behindTable}
			{/* table */}
			<path d={wobRect(480, 600, 960, 40, 1220 + b, 2)} fill={C.wood} stroke={C.ink} strokeWidth={6} />
			<path d={wobRect(480, 640, 960, 180, 1221 + b, 2)} fill="#5a7ab0" stroke={C.ink} strokeWidth={6} />
			{/* junk */}
			<path d={wobRect(520, 470, 160, 130, 1222 + b, 2)} fill="#6a5030" stroke={C.ink} strokeWidth={5} />
			<path d={wobRect(538, 488, 110, 90, 1223 + b, 2)} fill="#203040" stroke={C.ink} strokeWidth={4} />
			<path d={wobEllipse(760, 590, 70, 14, 1224 + b, 2)} fill={C.ink} />
			<path d={wobEllipse(760, 580, 64, 10, 1225 + b, 2)} fill="#222" stroke="#555" strokeWidth={2} />
			<path d={wobRect(1250, 500, 70, 100, 1226 + b, 2)} fill={C.grayLight} stroke={C.ink} strokeWidth={5} />
			<path d={wobEllipse(1350, 560, 40, 40, 1227 + b, 2)} fill={C.white} stroke={C.ink} strokeWidth={5} />
			<line x1={1350} y1={560} x2={1350} y2={535} stroke={C.ink} strokeWidth={4} />
			<line x1={1350} y1={560} x2={1368} y2={560} stroke={C.ink} strokeWidth={4} />
			{radioOnTable && (
				<g>
					<path d={wobRect(1240, 610, 120, 60, 1228 + b, 2)} fill="#f4f0d8" stroke={C.ink} strokeWidth={4} />
					<text x={1300} y={655} fontFamily={FONT.marker} fontSize={36} fill={C.red} textAnchor="middle">
						{priceTag}
					</text>
				</g>
			)}
		</g>
	);
};

// ----------------------------------------------------------------- dorm -----
export const DORM_FLOOR = 840;
export const DORM_BED = {x: 760, w: 640};
export const DORM_RADIO = {x: 190, y: 480, scale: 0.4};

export const DormRoom: React.FC<{light?: number; door?: Partial<DoorProps>; lurk?: number; children?: React.ReactNode; overDark?: React.ReactNode; nightDarkness?: number}> = ({
	light = 0,
	door = {},
	lurk = 0,
	children,
	overDark,
	nightDarkness = 0.6,
}) => {
	const b = useBoil();
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={DORM_FLOOR + 400} fill="#24204a" />
			<rect x={-400} y={DORM_FLOOR} width={2720} height={700} fill="#3a3040" />
			<path d={wobLine(-400, DORM_FLOOR, 2320, DORM_FLOOR, 1300 + b, 1.5)} stroke={C.ink} strokeWidth={8} />
			{/* posters */}
			<g transform="rotate(-3 640 300)">
				<path d={wobRect(560, 200, 170, 230, 1301 + b, 2)} fill={C.yellow} stroke={C.ink} strokeWidth={5} />
				<path d={wobPoly([[645, 240], [665, 300], [725, 300], [675, 335], [695, 395], [645, 360], [595, 395], [615, 335], [565, 300], [625, 300]].map(([x, y]) => [x - 0, y] as [number, number]), 1302 + b, 1.5)} fill={C.red} stroke={C.ink} strokeWidth={4} transform="translate(0 -10) scale(0.9) translate(70 30)" />
			</g>
			<g transform="rotate(4 1100 280)">
				<path d={wobRect(1030, 190, 150, 190, 1303 + b, 2)} fill={C.white} stroke={C.ink} strokeWidth={5} />
				<text x={1105} y={250} fontFamily={FONT.marker} fontSize={30} fill={C.blue} textAnchor="middle">
					EXAMS
				</text>
				<text x={1105} y={300} fontFamily={FONT.marker} fontSize={30} fill={C.red} textAnchor="middle">
					!!!
				</text>
			</g>
			<Window x={1250} y={180} w={200} h={220} curtains={0.2} curtainColor="#3e6a3a" />
			<Desk x={120} y={640} w={520} h={200} color="#8a8a92" />
			{/* laptop */}
			<path d={wobPoly([[460, 640], [600, 640], [610, 650], [450, 650]], 1304 + b, 1)} fill="#555" stroke={C.ink} strokeWidth={4} />
			<path d={wobPoly([[470, 640], [480, 560], [600, 560], [592, 640]], 1305 + b, 1)} fill="#333" stroke={C.ink} strokeWidth={4} />
			<Door x={1600} y={340} w={240} h={500} label="204" color="#7a6a8a" {...door} />
			<Bed x={DORM_BED.x} y={DORM_FLOOR} w={DORM_BED.w} blanket="#2f6b4a" frame="#606a7a" head="right" lurk={lurk} />
			<Lamp x={560} y={640} scale={0.5} on={light} shade="#e8e8e8" />
			{children}
			{light < 1 && <rect x={-400} y={-400} width={2720} height={1900} fill={C.night} opacity={(1 - light) * nightDarkness} />}
			{/* the gap under the bed stays pitch black, whatever the lighting */}
			<rect x={DORM_BED.x + 8} y={DORM_FLOOR - 36} width={DORM_BED.w - 16} height={34} fill="#000" />
			{overDark}
		</g>
	);
};
