// "The Jinn Wedding" props in the stick look: glow pools, the lights going out, the black car, incense smoke, the
// old phone ringing, footprints and hoofprints in the sand, horned shadows on the walls, incense haze.
import React from 'react';
import {boilOf, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';
import {INK} from './kit';

/** soft light pool (lamp, windows, headlights) */
export const Glow: React.FC<{cx: number; cy: number; r: number; color?: string; k?: number}> = ({cx, cy, r, color = '#9fc4ff', k = 1}) => {
	const id = `g${Math.round(cx)}_${Math.round(cy)}_${Math.round(r)}_${color.slice(1)}`;
	return (
		<g>
			<defs>
				<radialGradient id={id}>
					<stop offset="0" stopColor={color} stopOpacity={0.5 * k} />
					<stop offset="1" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
		</g>
	);
};

/** the room going darker (k 0..1), optionally stuttering like failing lights */
export const Dark: React.FC<{k: number; f?: number; stutter?: boolean}> = ({k, f = 0, stutter = false}) => {
	if (k <= 0) return null;
	const on = stutter ? [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1][Math.floor(f / 2) % 16] : 1;
	return <rect x={-400} y={-400} width={2720} height={1880} fill="#03040a" opacity={on ? k : Math.min(0.94, k + 0.45)} />;
};

/** the long black car (side view, facing right); `dist` turns the wheels; `inside` is drawn in the windows;
 *  `lights` adds headlights shining ahead */
export const Car: React.FC<{x: number; y: number; s?: number; frame: number; dist?: number; inside?: React.ReactNode; lights?: boolean; id?: string}> = ({x, y, s = 1, frame, dist = 0, inside, lights = false, id = 'car'}) => {
	const sd = 860 + boilOf(frame, 4) * 7;
	const rot = (dist / 40) * (180 / Math.PI);
	const wheel = (wx: number, k: number) => (
		<g key={k}>
			<path d={wobCircle(wx, -38, 38, sd + k, 0.7, 12)} fill="#151515" stroke={INK} strokeWidth={5} />
			<g transform={`rotate(${-rot} ${wx} -38)`}>
				<circle cx={wx} cy={-38} r={16} fill="#a9aeb3" stroke={INK} strokeWidth={3} />
				<path d={`M${wx - 12},-38 H${wx + 12} M${wx},-50 V-26`} stroke="#555" strokeWidth={3} />
			</g>
		</g>
	);
	const win: Pt[] = [[-200, -150], [110, -150], [160, -224], [-150, -224]];
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{lights ? (
				<g>
					<path d="M300,-110 L1100,-260 L1100,60 Z" fill="#fff4c8" opacity={0.18} />
					<path d="M300,-110 L900,-200 L900,10 Z" fill="#fff4c8" opacity={0.18} />
				</g>
			) : null}
			<ellipse cx={0} cy={-2} rx={320} ry={13} fill="#000" opacity={0.35} />
			<path d={wobPoly([[-320, -60], [-310, -150], [-170, -244], [180, -244], [270, -150], [310, -70], [300, -50], [-310, -50]], sd + 10, 1)} fill="#17181c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
			<path d={wobLine(-300, -112, 300, -112, sd + 14, 0.6)} stroke="#3a3c44" strokeWidth={4} />
			<defs>
				<clipPath id={`cw_${id}`}>
					<path d={wobPoly(win, sd + 11, 0.5)} />
				</clipPath>
			</defs>
			<path d={wobPoly(win, sd + 11, 0.5)} fill="#2a3242" stroke={INK} strokeWidth={5} />
			<g clipPath={`url(#cw_${id})`}>{inside}</g>
			<path d={wobPoly(win, sd + 11, 0.5)} fill="#dfe8f0" opacity={0.1} />
			<path d={wobLine(-30, -224, -30, -150, sd + 12, 0.5)} stroke={INK} strokeWidth={6} />
			<path d={wobCircle(296, -104, 12, sd + 13, 0.5, 8)} fill={lights ? '#fff6c8' : '#9a9070'} stroke={INK} strokeWidth={3} />
			<path d={wobCircle(-306, -104, 9, sd + 15, 0.5, 8)} fill="#a8241c" stroke={INK} strokeWidth={3} />
			{wheel(-190, 1)}
			{wheel(190, 2)}
		</g>
	);
};

/** incense smoke curling up from (x,y): a few soft wisps drifting and swaying */
export const Smoke: React.FC<{x: number; y: number; h?: number; t: number; k?: number; color?: string}> = ({x, y, h = 360, t, k = 1, color = '#e9e4f2'}) => (
	<g opacity={0.55 * k}>
		{[0, 1, 2].map((i) => {
			const ph = t * 0.6 + i * 2.1;
			const pts: string[] = [];
			for (let j = 0; j <= 12; j++) {
				const u = j / 12;
				const xx = x + Math.sin(ph + u * 5.5) * (10 + 60 * u) * (0.6 + i * 0.25);
				const yy = y - u * h * (0.8 + i * 0.15);
				pts.push(`${j ? 'L' : 'M'}${xx.toFixed(1)},${yy.toFixed(1)}`);
			}
			return <path key={i} d={pts.join(' ')} fill="none" stroke={color} strokeWidth={10 - i * 2.5} strokeLinecap="round" opacity={0.5 - i * 0.12} />;
		})}
	</g>
);

/** a ringing phone: little shake lines on both sides (call while it rings) */
export const Rings: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => {
	const on = Math.floor(f / 6) % 2 === 0;
	if (!on) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
			{[-1, 1].map((sg) => (
				<g key={sg}>
					<path d={`M${sg * 70},-30 Q${sg * 84},0 ${sg * 70},30`} />
					<path d={`M${sg * 92},-44 Q${sg * 110},0 ${sg * 92},44`} />
				</g>
			))}
		</g>
	);
};

/** prints pressed into the sand: footprints (shoe soles) and small split hoofprints, scattered over an area */
export const Prints: React.FC<{x0: number; x1: number; y0: number; y1: number; feet?: number; hooves?: number; seed?: number; k?: number}> = ({x0, x1, y0, y1, feet = 10, hooves = 60, seed = 7, k = 1}) => {
	const r = (i: number, j: number) => {
		const v = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
		return v - Math.floor(v);
	};
	const shown = (n: number) => Math.floor(n * k);
	return (
		<g>
			{Array.from({length: shown(feet)}, (_, i) => {
				const x = x0 + (x1 - x0) * (0.15 + 0.7 * (i / Math.max(1, feet - 1)));
				const y = y0 + (y1 - y0) * (0.45 + 0.15 * Math.sin(i * 1.7)) + (i % 2 ? 14 : -14);
				return <ellipse key={`f${i}`} cx={x} cy={y} rx={18} ry={8} fill="#8a7458" opacity={0.6} transform={`rotate(-8 ${x} ${y})`} />;
			})}
			{Array.from({length: shown(hooves)}, (_, i) => {
				const x = x0 + (x1 - x0) * r(i, 1);
				const y = y0 + (y1 - y0) * r(i, 2);
				return (
					<g key={`h${i}`} opacity={0.75}>
						<path d={`M${x - 7},${y} q3,-9 6,0 z M${x + 1},${y} q3,-9 6,0 z`} fill="#5c4a36" />
					</g>
				);
			})}
		</g>
	);
};

/** a horned shadow on the wall behind the dancers (cast by something that is not a woman) */
export const HornShadow: React.FC<{x: number; y: number; s?: number; t: number; k?: number}> = ({x, y, s = 1, t, k = 1}) => {
	const sway = Math.sin(t * 2.2 + x * 0.01) * 10;
	return (
		<g transform={`translate(${x + sway} ${y}) scale(${s})`} opacity={0.42 * k} fill="#1a1208">
			<path d="M-40,0 C-46,-90 -34,-170 0,-190 C34,-170 46,-90 40,0 Z" />
			<ellipse cx={0} cy={-226} rx={30} ry={36} />
			<path d="M-18,-252 C-40,-300 -70,-306 -86,-288 C-62,-292 -44,-280 -30,-250 Z" />
			<path d="M18,-252 C40,-300 70,-306 86,-288 C62,-292 44,-280 30,-250 Z" />
			<path d="M-24,-236 L-46,-226 L-26,-220 Z M24,-236 L46,-226 L26,-220 Z" />
		</g>
	);
};

/** blue incense haze hanging in a big room */
export const Haze: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
	<g opacity={0.22 * k}>
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={(400 + i * 600 + t * 18 * (i % 2 ? 1 : -1)) % 2200 - 100} cy={300 + i * 140} rx={700} ry={120} fill="#9fb4e8" />
		))}
	</g>
);

/** red marks on the drummers' hands (they played until their hands bled) */
export const BloodDots: React.FC<{pts: Pt[]}> = ({pts}) => (
	<g>
		{pts.map(([x, y], i) => (
			<path key={i} d={wobEllipse(x, y, 6, 4, 9100 + i, 0.4)} fill="#a8161c" opacity={0.85} />
		))}
	</g>
);

export {wobLine};
