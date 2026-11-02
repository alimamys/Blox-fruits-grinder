// Underground platform with an optional train (red line = fast, grey line = slow).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobLine, wobRect} from '../utils/wobble';

export const PLATFORM_Y = 760;

export type TrainSceneProps = {
	train?: 'red' | 'gray' | null;
	/** Horizontal offset of the train (0 = stopped in the station). */
	trainX?: number;
	doorsOpen?: number;
	/** Sign above the platform. */
	sign?: string;
	signColor?: string;
	children?: React.ReactNode;
	/** Smoke / fire glow (news insert). */
	fire?: number;
};

const Train: React.FC<{color: 'red' | 'gray'; x: number; doorsOpen: number}> = ({color, x, doorsOpen}) => {
	const b = useBoil();
	const body = color === 'red' ? C.red : '#9aa0aa';
	const stripe = color === 'red' ? C.yellow : C.blue;
	const cars = [0, 1, 2];
	return (
		<g transform={`translate(${x} 0)`}>
			{cars.map((c) => {
				const cx = -120 + c * 1000;
				return (
					<g key={c}>
						<path d={wobRect(cx, 380, 960, 330, 1400 + c + b, 3)} fill={body} stroke={C.ink} strokeWidth={8} />
						<rect x={cx + 6} y={600} width={948} height={26} fill={stripe} />
						{[
							[30, 140],
							[370, 220],
							[790, 140],
						].map(([wx, ww], w) => (
							<path key={w} d={wobRect(cx + wx, 430, ww, 120, 1410 + c * 4 + w + b, 2)} fill="#1b2340" stroke={C.ink} strokeWidth={6} />
						))}
						{[0, 1].map((d) => {
							const dx = cx + 270 + d * 420;
							const gap = doorsOpen * 50;
							return (
								<g key={d}>
									<rect x={dx - gap} y={420} width={gap * 2} height={290} fill="#0a0d1c" />
									<path d={wobRect(dx - 70 - gap, 420, 70, 290, 1420 + c * 2 + d + b, 2)} fill={body} stroke={C.ink} strokeWidth={5} />
									<path d={wobRect(dx + gap, 420, 70, 290, 1430 + c * 2 + d + b, 2)} fill={body} stroke={C.ink} strokeWidth={5} />
								</g>
							);
						})}
					</g>
				);
			})}
		</g>
	);
};

export const TrainScene: React.FC<TrainSceneProps> = ({train = null, trainX = 0, doorsOpen = 0, sign = 'RED LINE', signColor = C.red, children, fire = 0}) => {
	const b = useBoil();
	const f = useCurrentFrame();
	return (
		<g>
			{/* tiled wall */}
			<rect x={-400} y={-400} width={2720} height={1200} fill="#d8d4c4" />
			{Array.from({length: 24}).map((_, i) => (
				<line key={`h${i}`} x1={-400} y1={-300 + i * 50} x2={2320} y2={-300 + i * 50} stroke="#b9b4a2" strokeWidth={3} />
			))}
			<rect x={-400} y={300} width={2720} height={40} fill={signColor} />
			<path d={wobRect(700, 120, 520, 120, 1440 + b, 2)} fill="#1a1a1a" stroke={C.ink} strokeWidth={6} />
			<circle cx={770} cy={180} r={34} fill={signColor} stroke={C.white} strokeWidth={5} />
			<text x={1000} y={200} fontFamily={FONT.headline} fontWeight={700} fontSize={64} fill={C.white} textAnchor="middle">
				{sign}
			</text>
			{/* track pit */}
			<rect x={-400} y={700} width={2720} height={80} fill="#1a1a1e" />
			{train && <Train color={train} x={trainX} doorsOpen={doorsOpen} />}
			{/* platform */}
			<rect x={-400} y={PLATFORM_Y} width={2720} height={500} fill="#8f8c84" />
			<rect x={-400} y={PLATFORM_Y} width={2720} height={22} fill={C.yellow} />
			<path d={wobLine(-400, PLATFORM_Y, 2320, PLATFORM_Y, 1450 + b, 2)} stroke={C.ink} strokeWidth={8} />
			{fire > 0 && (
				<g>
					<rect x={-400} y={-400} width={2720} height={1600} fill="#ff6a1c" opacity={0.18 * fire * (0.8 + 0.2 * Math.sin(f * 0.5))} />
					{[0, 1, 2, 3, 4].map((i) => (
						<circle key={i} cx={300 + i * 330} cy={260 - ((f * 2 + i * 90) % 400)} r={110 + i * 10} fill="#2a2a2a" opacity={0.35 * fire} />
					))}
				</g>
			)}
			{children}
		</g>
	);
};
