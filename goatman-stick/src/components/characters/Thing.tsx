// The thing in the woods, in the stick-figure world: the goat-headed shape from the legend, the low crawling
// shape, and the too-tall figure standing with its back turned (which can jerk and twitch).
import React from 'react';
import {boilOf, wob, wobCircle, wobEllipse, wobLine, type Pt} from '../../utils/rough';
import {Shadow} from './Cast';

const INK = '#0a0a0b';

/** "A man's body. A goat's head." - only ever a dark shape. */
export const GoatShape: React.FC<{x: number; y: number; s?: number; frame: number; opacity?: number}> = ({x, y, s = 1, frame, opacity = 1}) => {
	const sd = 1300 + boilOf(frame, 4) * 7;
	const sway = Math.sin(frame / 20) * 2;
	const body = '#121214';
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
			<path d={wob([[-14, -250], [14, -250], [16, -130], [-16, -130]], sd, 1)} fill={body} />
			<path d={wobLine(-10, -130, -18, 0, sd + 1, 1)} stroke={body} strokeWidth={20} strokeLinecap="round" />
			<path d={wobLine(10, -130, 18, 0, sd + 2, 1)} stroke={body} strokeWidth={20} strokeLinecap="round" />
			<path d={wobLine(-30, -245, -48, -120 + sway, sd + 3, 1.2)} stroke={body} strokeWidth={14} strokeLinecap="round" />
			<path d={wobLine(30, -245, 48, -120 - sway, sd + 4, 1.2)} stroke={body} strokeWidth={14} strokeLinecap="round" />
			<path d={wob([[-36, -260], [36, -260], [24, -238], [-24, -238]], sd + 5, 1)} fill={body} />
			{/* goat head: long face, ears out, horns curling back */}
			<path d={wob([[-22, -330], [22, -330], [16, -268], [0, -250], [-16, -268]], sd + 6, 1)} fill={body} />
			<path d={wob([[-20, -322], [-58, -312], [-24, -306]], sd + 7, 0.8)} fill={body} />
			<path d={wob([[20, -322], [58, -312], [24, -306]], sd + 8, 0.8)} fill={body} />
			<path d={`M-12,-328 C-30,-380 -80,-380 -70,-330`} fill="none" stroke={body} strokeWidth={10} strokeLinecap="round" />
			<path d={`M12,-328 C30,-380 80,-380 70,-330`} fill="none" stroke={body} strokeWidth={10} strokeLinecap="round" />
			<circle cx={-9} cy={-306} r={3.5} fill="#d9d2b8" opacity={0.85} />
			<circle cx={9} cy={-306} r={3.5} fill="#d9d2b8" opacity={0.85} />
		</g>
	);
};

/** The low thing that crawls out of the brush on long limbs. `phase` drives the limbs. */
export const Crawler: React.FC<{x: number; y: number; s?: number; frame: number; phase?: number; flip?: boolean; opacity?: number}> = ({x, y, s = 1, frame, phase = 0, flip = false, opacity = 1}) => {
	const sd = 1400 + boilOf(frame, 4) * 7;
	const c = '#3a3b44';
	const leg = (bx: number, k: number, o: number) => {
		const a = Math.sin(phase + o) * 18;
		const knee: Pt = [bx + a, -70 - Math.abs(Math.cos(phase + o)) * 12];
		const foot: Pt = [bx + a * 1.8 + 16, 0];
		return <path key={k} d={wob([[bx, -34], knee, foot], sd + k, 1, false)} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />;
	};
	return (
		<g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
			{leg(-60, 1, 0)}
			{leg(50, 2, Math.PI)}
			<path d={wobEllipse(-5, -40, 82, 20, sd + 3, 1.5)} fill={c} />
			{leg(-40, 4, Math.PI / 2)}
			{leg(70, 5, Math.PI * 1.5)}
			<path d={wobCircle(92, -48, 20, sd + 6, 1, 9)} fill={c} />
			<circle cx={100} cy={-52} r={4.5} fill="#fff7d0" />
			<circle cx={86} cy={-52} r={4.5} fill="#fff7d0" />
			<path d={wobEllipse(-5, -40, 82, 20, sd + 9, 1.5)} fill="none" stroke="#7a7f92" strokeWidth={3} opacity={0.7} />
		</g>
	);
};

/** A too-tall figure standing with its back turned. `jerk` 0..1 makes it twitch like something trying to move in a body. */
export const BackTurned: React.FC<{x: number; y: number; s?: number; frame: number; jerk?: number; opacity?: number}> = ({x, y, s = 1, frame, jerk = 0, opacity = 1}) => {
	const j = jerk > 0 ? (Math.floor(frame / 3) % 5 === 0 ? 1 : 0) * jerk : 0;
	return (
		<g opacity={opacity} transform={`translate(${x + j * 6} ${y}) rotate(${j * 5}) translate(${-x} ${-y})`}>
			<Shadow x={x} y={y} s={s * 1.15} frame={null} back tilt={j * 18 - 4} arms={{l: [6, 4], r: [6, 4]}} />
		</g>
	);
};
