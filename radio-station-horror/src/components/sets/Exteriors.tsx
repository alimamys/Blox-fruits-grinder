// Outdoor sets: Adam's apartment building, a street, the motel exterior.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../../utils/fonts';
import {C} from '../../utils/palette';
import {hash1} from '../../utils/random';
import {useBoil, wobEllipse, wobLine, wobPath, wobRect} from '../../utils/wobble';

const Stars: React.FC<{w: number; h: number; y0?: number; seed?: number}> = ({w, h, y0 = 0, seed = 1}) => {
	const f = useCurrentFrame();
	return (
		<g>
			{Array.from({length: 40}).map((_, i) => (
				<circle
					key={i}
					cx={hash1(i, seed) * w - 200}
					cy={y0 + hash1(i, seed + 1) * h}
					r={1.5 + hash1(i, seed + 2) * 2}
					fill="#e9ecff"
					opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))}
				/>
			))}
		</g>
	);
};

// ------------------------------------------------------------ building ------
/** Ground level of the building set. Floor n (1 = ground floor) spans [GROUND - n*FLOOR_H, GROUND - (n-1)*FLOOR_H]. */
export const BUILDING = {ground: 1000, floorH: 190, x: 640, w: 640, floors: 8};
export const floorTop = (n: number) => BUILDING.ground - n * BUILDING.floorH;
/** Centre of Adam's 6th-floor window. */
export const ADAM_WINDOW = {x: BUILDING.x + 460, y: floorTop(6) + 95, w: 120, h: 110};

export const Building: React.FC<{
	/** 0..1 how far the long fingers have dragged across Adam's window. */
	scratch?: number;
	/** Show the scratching hand. */
	hand?: number;
	/** Adam's silhouette behind the curtains. */
	adamShadow?: boolean;
	/** Red marker annotations ("6TH FLOOR"). */
	annotate?: number;
}> = ({scratch = 0, hand = 0, adamShadow = true, annotate = 0}) => {
	const b = useBoil();
	const top = floorTop(BUILDING.floors);
	const wins: React.ReactNode[] = [];
	for (let n = 1; n <= BUILDING.floors; n++) {
		for (let k = 0; k < 3; k++) {
			const wx = BUILDING.x + 80 + k * 160;
			const wy = floorTop(n) + 95 - 55;
			const isAdam = n === 6 && k === 2;
			const lit = isAdam || hash1(n * 10 + k, 4) > 0.72;
			wins.push(
				<path key={`${n}-${k}`} d={wobRect(wx, wy, 120, 110, 700 + n * 5 + k + b, 2)} fill={isAdam ? '#e0b84a' : lit ? '#c9a640' : '#0d1330'} stroke={C.ink} strokeWidth={6} />,
			);
		}
	}
	const aw = ADAM_WINDOW;
	return (
		<g>
			<rect x={-2000} y={-1400} width={6000} height={3000} fill={C.night} />
			<Stars w={2400} h={1600} y0={-1400} />
			<path d={wobEllipse(1600, -900, 70, 70, 701 + b, 2)} fill="#f2efd8" />
			{/* neighbouring buildings */}
			<path d={wobRect(-100, 300, 560, 800, 702 + b, 3)} fill="#0f1534" stroke={C.ink} strokeWidth={6} />
			<path d={wobRect(1460, 100, 600, 1000, 703 + b, 3)} fill="#111839" stroke={C.ink} strokeWidth={6} />
			{/* the building */}
			<path d={wobRect(BUILDING.x, top, BUILDING.w, BUILDING.ground - top, 704 + b, 3)} fill="#3a3f5c" stroke={C.ink} strokeWidth={8} />
			{Array.from({length: BUILDING.floors - 1}).map((_, i) => (
				<path key={i} d={wobLine(BUILDING.x, floorTop(i + 1), BUILDING.x + BUILDING.w, floorTop(i + 1), 705 + i + b, 2)} stroke="#2a2e45" strokeWidth={6} />
			))}
			{wins}
			{/* Adam's curtains + silhouette */}
			<rect x={aw.x - 60} y={aw.y - 55} width={120} height={110} fill="#e0b84a" />
			<path d={wobRect(aw.x - 60, aw.y - 55, 58, 110, 720 + b, 1.5)} fill={C.maroon} opacity={0.85} stroke={C.ink} strokeWidth={3} />
			<path d={wobRect(aw.x + 2, aw.y - 55, 58, 110, 721 + b, 1.5)} fill={C.maroon} opacity={0.85} stroke={C.ink} strokeWidth={3} />
			{adamShadow && (
				<g opacity={0.55}>
					<circle cx={aw.x - 18} cy={aw.y - 12} r={11} fill="#1a0a10" />
					<rect x={aw.x - 26} y={aw.y} width={16} height={40} fill="#1a0a10" />
				</g>
			)}
			{scratch > 0 &&
				[0, 1, 2, 3].map((i) => (
					<path key={i} d={wobLine(aw.x - 58, aw.y - 30 + i * 14, aw.x - 58 + 116 * scratch, aw.y - 24 + i * 14, 730 + i + b, 1)} stroke="#f4f4ff" strokeWidth={3} />
				))}
			<path d={wobRect(aw.x - 60, aw.y - 55, 120, 110, 722 + b, 2)} fill="none" stroke={C.ink} strokeWidth={6} />
			{/* the hand: long grey fingers dragging across the glass */}
			{hand > 0 && (
				<g opacity={hand}>
					{[0, 1, 2, 3].map((i) => {
						const tipX = aw.x - 58 + 116 * scratch;
						return (
							<path
								key={i}
								d={wobPath([[tipX - 150, aw.y - 70 + i * 6], [tipX - 50, aw.y - 46 + i * 12], [tipX, aw.y - 30 + i * 14]], 740 + i + b, 2)}
								stroke="#0a0a0c"
								strokeWidth={9}
								strokeLinecap="round"
								fill="none"
							/>
						);
					})}
					<path d={wobPath([[aw.x - 58 + 116 * scratch - 150, aw.y - 70], [aw.x - 58 + 116 * scratch - 320, aw.y - 160]], 750 + b, 3)} stroke="#0a0a0c" strokeWidth={22} strokeLinecap="round" fill="none" />
				</g>
			)}
			{/* entrance + street */}
			<path d={wobRect(BUILDING.x + 260, BUILDING.ground - 150, 120, 150, 760 + b, 2)} fill="#c9a640" stroke={C.ink} strokeWidth={6} />
			<rect x={-2000} y={BUILDING.ground} width={6000} height={600} fill="#1d1d24" />
			<path d={wobLine(-2000, BUILDING.ground, 4000, BUILDING.ground, 761 + b, 2)} stroke={C.ink} strokeWidth={8} />
			{[-200, 300, 800, 1300, 1800].map((x, i) => (
				<rect key={i} x={x} y={BUILDING.ground + 120} width={140} height={14} fill="#c9c08a" opacity={0.7} />
			))}
			{/* street lamp */}
			<path d={wobLine(420, BUILDING.ground, 420, BUILDING.ground - 300, 762 + b, 2)} stroke={C.ink} strokeWidth={12} />
			<path d={wobEllipse(450, BUILDING.ground - 300, 40, 14, 763 + b, 2)} fill={C.lamp} stroke={C.ink} strokeWidth={5} />
			<ellipse cx={450} cy={BUILDING.ground - 140} rx={130} ry={180} fill={C.lamp} opacity={0.08} />
			{/* tiny car for scale */}
			<g transform={`translate(1120 ${BUILDING.ground - 50})`}>
				<path d={wobRect(0, 0, 150, 40, 764 + b, 2)} fill={C.red} stroke={C.ink} strokeWidth={5} />
				<path d={wobRect(30, -26, 80, 30, 765 + b, 2)} fill={C.red} stroke={C.ink} strokeWidth={5} />
				<circle cx={32} cy={42} r={14} fill={C.ink} />
				<circle cx={118} cy={42} r={14} fill={C.ink} />
			</g>
			{annotate > 0 && (
				<g opacity={annotate}>
					<path d={wobPath([[aw.x + 260, aw.y - 120], [aw.x + 140, aw.y - 60], [aw.x + 75, aw.y - 10]], 770 + b, 3)} stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" />
					<path d={wobPath([[aw.x + 92, aw.y - 40], [aw.x + 72, aw.y - 8], [aw.x + 110, aw.y - 4]], 771 + b, 2)} stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					<text x={aw.x + 250} y={aw.y - 140} fontFamily={FONT.marker} fontSize={64} fill={C.red} transform={`rotate(-6 ${aw.x + 250} ${aw.y - 140})`}>
						6TH FLOOR
					</text>
					{[1, 2, 3, 4, 5, 6].map((n) => (
						<text key={n} x={BUILDING.x - 70} y={floorTop(n) + 120} fontFamily={FONT.marker} fontSize={60} fill={C.red} textAnchor="middle">
							{n}
						</text>
					))}
				</g>
			)}
		</g>
	);
};

// -------------------------------------------------------------- street -------
export const Street: React.FC<{day?: boolean; ground?: number; scroll?: number}> = ({day = false, ground = 860, scroll = 0}) => {
	const b = useBoil();
	const sky = day ? '#9cc4e8' : C.night;
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={ground + 400} fill={sky} />
			{!day && <Stars w={2400} h={500} y0={-100} seed={3} />}
			<g transform={`translate(${-(scroll % 600)} 0)`}>
				{Array.from({length: 7}).map((_, i) => {
					const x = -400 + i * 600;
					const h = 420 + (i % 3) * 120;
					return (
						<g key={i}>
							<path d={wobRect(x, ground - h, 520, h, 800 + i + b, 3)} fill={day ? ['#c98a5a', '#9a9aa8', '#b8a07a'][i % 3] : ['#151b3c', '#1a2045', '#11173a'][i % 3]} stroke={C.ink} strokeWidth={6} />
							{[0, 1, 2].map((k) => (
								<path key={k} d={wobRect(x + 50 + k * 150, ground - h + 60, 90, 90, 810 + i * 3 + k + b, 2)} fill={day ? '#d8eefc' : hash1(i * 3 + k, 2) > 0.6 ? '#c9a640' : '#0b1028'} stroke={C.ink} strokeWidth={5} />
							))}
						</g>
					);
				})}
			</g>
			<rect x={-400} y={ground} width={2720} height={700} fill={day ? '#8d8d93' : '#1d1d24'} />
			<path d={wobLine(-400, ground, 2320, ground, 830 + b, 2)} stroke={C.ink} strokeWidth={8} />
			<rect x={-400} y={ground + 110} width={2720} height={10} fill={day ? '#6c6c72' : '#121216'} />
		</g>
	);
};

// -------------------------------------------------------- motel exterior ----
export const MotelExterior: React.FC<{roomLit?: boolean; flicker?: number; escape?: number}> = ({roomLit = true, flicker = 1, escape = 0}) => {
	const b = useBoil();
	const ground = 900;
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={1400} fill={C.motelNight} />
			<Stars w={2400} h={500} y0={-100} seed={9} />
			{/* two-storey motel */}
			<path d={wobRect(300, 360, 1300, 540, 900 + b, 3)} fill="#6c5f3a" stroke={C.ink} strokeWidth={8} />
			<path d={wobLine(300, 630, 1600, 630, 901 + b, 2)} stroke={C.ink} strokeWidth={10} />
			{Array.from({length: 6}).map((_, i) => (
				<g key={i}>
					<path d={wobRect(360 + i * 205, 430, 90, 180, 902 + i + b, 2)} fill="#4a3a22" stroke={C.ink} strokeWidth={5} />
					<path d={wobRect(360 + i * 205, 700, 90, 180, 910 + i + b, 2)} fill="#4a3a22" stroke={C.ink} strokeWidth={5} />
					<path
						d={wobRect(465 + i * 205, 460, 70, 70, 920 + i + b, 2)}
						fill={i === 4 ? (roomLit ? '#d8c060' : '#14140c') : hash1(i, 5) > 0.5 ? '#a89040' : '#1a1a12'}
						stroke={C.ink}
						strokeWidth={5}
					/>
				</g>
			))}
			{/* fire escape on the right */}
			<g stroke="#2a2a2a" strokeWidth={8} fill="none">
				<path d={wobPath([[1600, 610], [1760, 610]], 930 + b, 1.5)} />
				<path d={wobPath([[1600, 480], [1760, 480]], 931 + b, 1.5)} />
				<path d={wobPath([[1760, 610], [1640, 760], [1760, 900]], 932 + b, 2)} />
				<path d={wobPath([[1760, 480], [1760, 900]], 933 + b, 1.5)} />
			</g>
			<rect x={-400} y={ground} width={2720} height={500} fill="#1a1a20" />
			{/* neon sign */}
			<g transform="translate(60 120)">
				<path d={wobLine(120, 120, 120, 780, 940 + b, 2)} stroke={C.ink} strokeWidth={16} />
				<path d={wobRect(0, 0, 260, 120, 941 + b, 2)} fill="#1a0a0a" stroke={C.ink} strokeWidth={6} />
				<text x={130} y={88} fontFamily={FONT.headline} fontWeight={700} fontSize={76} fill={C.red} textAnchor="middle" opacity={flicker} style={{filter: 'drop-shadow(0 0 12px #ff3030)'}}>
					MOTEL
				</text>
				<text x={130} y={170} fontFamily={FONT.headline} fontSize={40} fill="#ff8a30" textAnchor="middle" opacity={0.85}>
					VACANCY
				</text>
			</g>
			{escape > 0 && <rect x={1290} y={465} width={60} height={60} fill="#0b0d14" opacity={escape} />}
		</g>
	);
};
