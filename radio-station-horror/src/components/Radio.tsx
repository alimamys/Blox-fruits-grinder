// The old black shortwave radio – the most important prop in the video.
// Body 560×320 at scale 1; (x, y) is the top-left corner of the body.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {hash1} from '../utils/random';
import {useBoil, wobEllipse, wobLine, wobPath, wobRect} from '../utils/wobble';

export type RadioProps = {
	x: number;
	y: number;
	scale?: number;
	/** 0..1 power. 0 = dead, 1 = fully lit. */
	power?: number;
	/** 0..1 the station is speaking (grille pulses, sound arcs). */
	speaking?: number;
	/** 0..1 position of the tuning needle. */
	tuning?: number;
	/** LED read-out text. Defaults to a frequency. */
	readout?: string;
	/** Extra random flicker of the display (0..1). */
	flicker?: number;
	/** Show a red "standby" LED even when off. */
	standby?: boolean;
	seed?: number;
	/** Rotate the big dial (degrees). */
	dial?: number;
	/** Draw the power cable, optionally unplugged. */
	cable?: 'none' | 'plugged' | 'unplugged';
	/** Musical notes floating out (normal music playing). */
	music?: number;
};

export const RADIO_W = 560;
export const RADIO_H = 320;

export const Radio: React.FC<RadioProps> = ({
	x,
	y,
	scale = 1,
	power = 0,
	speaking = 0,
	tuning = 0.42,
	readout,
	flicker = 0,
	standby = false,
	seed = 3,
	dial,
	cable = 'none',
	music = 0,
}) => {
	const frame = useCurrentFrame();
	const boil = useBoil();
	const sd = seed * 17 + boil;
	const flick = flicker > 0 ? 1 - flicker * (hash1(Math.floor(frame / 2), seed) > 0.55 ? 0.8 : 0) : 1;
	const p = Math.max(0, Math.min(1, power)) * flick;
	const lit = p > 0.02;
	const read = readout ?? (7.0 + tuning * 4.4).toFixed(2);
	const dialAngle = dial ?? tuning * 300 - 150;
	const pulse = speaking * (0.5 + 0.5 * Math.sin(frame * 1.3) * Math.sin(frame * 0.37 + 1));

	// frequency scale ticks
	const scaleX0 = 312;
	const scaleX1 = 522;
	const needleX = scaleX0 + 10 + tuning * (scaleX1 - scaleX0 - 20);

	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			{/* glow on surroundings */}
			{lit && <ellipse cx={420} cy={95} rx={260} ry={150} fill={C.radioGlow} opacity={0.12 * p} />}

			{/* cable */}
			{cable !== 'none' && (
				<g>
					<path
						d={
							cable === 'plugged'
								? wobPath([[540, 280], [610, 300], [680, 330], [760, 330]], sd + 1, 2)
								: wobPath([[540, 280], [600, 315], [650, 330], [700, 322]], sd + 1, 2)
						}
						stroke={C.ink}
						strokeWidth={9}
						fill="none"
						strokeLinecap="round"
					/>
					<path d={wobRect(cable === 'plugged' ? 752 : 692, 308, 34, 26, sd + 2, 1.5)} fill="#3a3a3a" stroke={C.ink} strokeWidth={4} />
					{cable === 'plugged' && (
						<>
							<line x1={786} y1={314} x2={804} y2={314} stroke="#bbb" strokeWidth={4} />
							<line x1={786} y1={328} x2={804} y2={328} stroke="#bbb" strokeWidth={4} />
						</>
					)}
					{cable === 'unplugged' && (
						<>
							<line x1={726} y1={314} x2={744} y2={314} stroke="#bbb" strokeWidth={4} />
							<line x1={726} y1={328} x2={744} y2={328} stroke="#bbb" strokeWidth={4} />
						</>
					)}
				</g>
			)}

			{/* antenna */}
			<path d={wobLine(470, 6, 280, -330, sd + 3, 2)} stroke="#9aa0aa" strokeWidth={7} strokeLinecap="round" fill="none" />
			<path d={wobLine(470, 6, 410, -100, sd + 4, 1.5)} stroke="#c6cbd3" strokeWidth={10} strokeLinecap="round" fill="none" />
			<circle cx={280} cy={-330} r={10} fill="#c6cbd3" stroke={C.ink} strokeWidth={4} />

			{/* handle */}
			<path d={wobPath([[80, 10], [100, -50], [200, -60], [260, -60], [360, -50], [380, 10]], sd + 5, 2)} stroke={C.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
			<path d={wobPath([[80, 10], [100, -50], [200, -60], [260, -60], [360, -50], [380, 10]], sd + 5, 2)} stroke="#2b2b31" strokeWidth={12} fill="none" strokeLinecap="round" />

			{/* body */}
			<path d={wobRect(0, 0, RADIO_W, RADIO_H, sd + 6, 3)} fill={C.radioBody} stroke={C.ink} strokeWidth={8} />
			<path d={wobRect(10, 10, RADIO_W - 20, RADIO_H - 20, sd + 7, 2.5)} fill="none" stroke={C.radioRim} strokeWidth={4} />

			{/* speaker grille */}
			<g transform={`translate(150 170) scale(${1 + pulse * 0.035})`}>
				<path d={wobEllipse(0, 0, 112, 112, sd + 8, 3)} fill="#0e0e11" stroke={C.radioRim} strokeWidth={5} />
				{Array.from({length: 9}).map((_, i) => {
					const yy = -84 + i * 21;
					const half = Math.sqrt(Math.max(0, 100 * 100 - yy * yy));
					return <path key={i} d={wobLine(-half, yy, half, yy, sd + 20 + i, 1.5)} stroke="#2e2f37" strokeWidth={8} strokeLinecap="round" />;
				})}
				<circle r={14} fill="#26272e" stroke={C.radioRim} strokeWidth={3} />
			</g>

			{/* model plate (rewatch detail: SW-117) */}
			<path d={wobRect(92, 290, 116, 20, sd + 9, 1)} fill="#2b2b31" stroke={C.radioRim} strokeWidth={2} />
			<text x={150} y={305} fontFamily={FONT.vcr} fontSize={17} fill="#8a8c96" textAnchor="middle" letterSpacing={2}>
				SW-117
			</text>

			{/* frequency scale window */}
			<path d={wobRect(scaleX0 - 12, 30, scaleX1 - scaleX0 + 24, 104, sd + 10, 2)} fill={lit ? C.radioGlow : C.radioDisplayOff} stroke={C.ink} strokeWidth={6} opacity={1} />
			{lit && <rect x={scaleX0 - 8} y={34} width={scaleX1 - scaleX0 + 16} height={96} fill={C.radioGlowHot} opacity={0.35 * p} />}
			{Array.from({length: 22}).map((_, i) => {
				const xx = scaleX0 + 4 + i * ((scaleX1 - scaleX0 - 8) / 21);
				const tall = i % 3 === 0;
				return <line key={i} x1={xx} y1={80} x2={xx} y2={tall ? 60 : 70} stroke={lit ? '#5a1a00' : '#3d1a10'} strokeWidth={tall ? 3 : 2} />;
			})}
			{['3', '5', '7', '9', '11', '15'].map((t, i) => (
				<text key={t} x={scaleX0 + 12 + i * 37} y={104} fontFamily={FONT.vcr} fontSize={22} fill={lit ? '#5a1a00' : '#3d1a10'} textAnchor="middle">
					{t}
				</text>
			))}
			{/* LED readout */}
			<rect x={scaleX0 + 120} y={36} width={84} height={22} fill={lit ? '#3a0b00' : '#1a0703'} />
			<text x={scaleX0 + 162} y={54} fontFamily={FONT.vcr} fontSize={22} fill={lit ? '#ffcf8a' : '#3a1a10'} textAnchor="middle" opacity={lit ? 0.6 + 0.4 * p : 1}>
				{read}
			</text>
			{/* tuning needle: yellow-green when active */}
			<line x1={needleX} y1={36} x2={needleX} y2={128} stroke={lit ? C.tune : '#4a4a30'} strokeWidth={5} />
			{lit && <line x1={needleX} y1={36} x2={needleX} y2={128} stroke={C.tune} strokeWidth={14} opacity={0.25 * p} />}

			{/* knobs */}
			<g transform={`translate(330 238)`}>
				<path d={wobEllipse(0, 0, 24, 24, sd + 11, 1.5)} fill="#2b2c33" stroke={C.ink} strokeWidth={5} />
				<line x1={0} y1={0} x2={0} y2={-18} stroke="#9aa0aa" strokeWidth={4} />
			</g>
			<g transform={`translate(430 230) rotate(${dialAngle})`}>
				<path d={wobEllipse(0, 0, 62, 62, sd + 12, 2)} fill="#26272e" stroke={C.ink} strokeWidth={6} />
				{Array.from({length: 16}).map((_, i) => {
					const a = (i / 16) * Math.PI * 2;
					return <line key={i} x1={Math.cos(a) * 50} y1={Math.sin(a) * 50} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke="#4a4c56" strokeWidth={4} />;
				})}
				<path d={wobEllipse(0, 0, 34, 34, sd + 13, 1.5)} fill="#33353d" stroke={C.ink} strokeWidth={4} />
				<line x1={0} y1={-6} x2={0} y2={-44} stroke={C.white} strokeWidth={5} strokeLinecap="round" />
			</g>
			<g transform={`translate(522 244)`}>
				<path d={wobEllipse(0, 0, 18, 18, sd + 14, 1.2)} fill="#2b2c33" stroke={C.ink} strokeWidth={4} />
				<line x1={0} y1={0} x2={10} y2={-10} stroke="#9aa0aa" strokeWidth={3} />
			</g>

			{/* power LED */}
			<circle cx={290} cy={160} r={8} fill={lit || standby ? C.red : '#3a1010'} stroke={C.ink} strokeWidth={3} />
			{(lit || standby) && <circle cx={290} cy={160} r={16} fill={C.red} opacity={0.25} />}

			{/* feet */}
			<path d={wobRect(40, RADIO_H, 50, 14, sd + 15, 1)} fill={C.ink} />
			<path d={wobRect(RADIO_W - 90, RADIO_H, 50, 14, sd + 16, 1)} fill={C.ink} />

			{/* sound arcs while speaking */}
			{speaking > 0.05 &&
				[0, 1, 2].map((i) => {
					const ph = ((frame * 0.06 + i / 3) % 1);
					const r = 130 + ph * 110;
					return (
						<path
							key={i}
							d={`M ${150 - r * 0.62} ${170 - r * 0.78} A ${r} ${r} 0 0 0 ${150 - r * 0.62} ${170 + r * 0.78}`}
							stroke={C.radioGlowHot}
							strokeWidth={7}
							fill="none"
							strokeLinecap="round"
							opacity={speaking * (1 - ph) * 0.8}
						/>
					);
				})}

			{/* music notes */}
			{music > 0.02 &&
				[0, 1, 2, 3].map((i) => {
					const ph = (frame * 0.012 + i * 0.25) % 1;
					const nx = 130 + i * 70 + Math.sin(frame * 0.08 + i) * 20;
					const ny = -40 - ph * 260;
					return (
						<g key={i} transform={`translate(${nx} ${ny})`} opacity={music * Math.sin(ph * Math.PI)}>
							<ellipse cx={0} cy={0} rx={14} ry={10} fill={C.yellow} stroke={C.ink} strokeWidth={4} transform="rotate(-20)" />
							<line x1={12} y1={-2} x2={12} y2={-48} stroke={C.ink} strokeWidth={5} />
							{i % 2 === 0 && <path d="M 12 -48 Q 30 -40 26 -24" stroke={C.ink} strokeWidth={5} fill="none" />}
						</g>
					);
				})}
		</g>
	);
};
