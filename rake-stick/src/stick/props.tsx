// "The Rake" props in the stick look: glow pools, a light flicker, the bedside clock, the kitchen table seen from the
// front, grandmother's blue diary, and the torn blanket.
import React from 'react';
import {boilOf, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';
import {INK} from './kit';

/** soft light pool (moon, lamp, phone) */
export const Glow: React.FC<{cx: number; cy: number; r: number; color?: string; k?: number}> = ({cx, cy, r, color = '#9fc4ff', k = 1}) => {
	const id = `g${Math.round(cx)}_${Math.round(cy)}_${Math.round(r)}`;
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

/** the room going darker (k 0..1), optionally stuttering */
export const Dark: React.FC<{k: number; f?: number; stutter?: boolean}> = ({k, f = 0, stutter = false}) => {
	if (k <= 0) return null;
	const on = stutter ? [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1][Math.floor(f / 2) % 16] : 1;
	return <rect x={-400} y={-400} width={2720} height={1880} fill="#03040a" opacity={on ? k : Math.min(0.92, k + 0.4)} />;
};

/** the little digital alarm clock: red 7-segment-ish digits */
export const BedClock: React.FC<{x: number; y: number; s?: number; text: string; frame: number}> = ({x, y, s = 1, text, frame}) => {
	const sd = 5100 + boilOf(frame, 4) * 7;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d={wobPoly([[-46, -2], [46, -2], [40, -48], [-40, -48]], sd, 0.5)} fill="#1c1c22" stroke={INK} strokeWidth={4} />
			<rect x={-34} y={-42} width={68} height={32} rx={4} fill="#0b0405" />
			<text x={0} y={-17} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight={700} fontSize={24} fill="#ff3b30" style={{filter: 'drop-shadow(0 0 4px #ff3b30)'}}>
				{text}
			</text>
		</g>
	);
};

/** the kitchen table seen from the front along the bottom of the frame: top edge at y; plates, toast, mugs */
export const Table: React.FC<{y: number; frame: number; x0?: number; x1?: number; items?: Array<{kind: 'plate' | 'mug' | 'diary'; x: number}>; tint?: string}> = ({y, frame, x0 = -200, x1 = 2120, items = [], tint}) => {
	const sd = 5200 + boilOf(frame, 4) * 7;
	return (
		<g>
			<path d={wobPoly([[x0, y], [x1, y], [x1, 1300], [x0, 1300]], sd, 1)} fill="#8a5a36" stroke={INK} strokeWidth={7} />
			<path d={wobPoly([[x0, y], [x1, y], [x1, y + 30], [x0, y + 30]], sd + 1, 0.8)} fill="#a8703f" stroke={INK} strokeWidth={6} />
			<path d={wobPoly([[x0, y + 6], [x1, y + 6], [x1, y + 16], [x0, y + 16]], sd + 2, 0.5)} fill="#e9e4d8" opacity={0.35} />
			{items.map((it, i) =>
				it.kind === 'plate' ? (
					<g key={i}>
						<path d={wobEllipse(it.x, y + 2, 76, 14, sd + 10 + i, 0.5)} fill="#f4f1e8" stroke={INK} strokeWidth={4} />
						<path d={wobPoly([[it.x - 34, y - 2], [it.x + 30, y - 2], [it.x + 26, y - 20], [it.x - 30, y - 20]], sd + 20 + i, 0.4)} fill="#d9a35a" stroke={INK} strokeWidth={3.5} />
					</g>
				) : it.kind === 'mug' ? (
					<g key={i}>
						<path d={wobPoly([[it.x - 28, y + 2], [it.x + 28, y + 2], [it.x + 26, y - 62], [it.x - 26, y - 62]], sd + 30 + i, 0.5)} fill="#d8e2ee" stroke={INK} strokeWidth={4.5} />
						<path d={`M${it.x + 28},${y - 50} q24,6 18,26 q-4,10 -18,8`} fill="none" stroke={INK} strokeWidth={5} />
					</g>
				) : (
					<g key={i}>
						<path d={wobPoly([[it.x - 60, y + 4], [it.x + 60, y + 4], [it.x + 54, y - 14], [it.x - 54, y - 14]], sd + 40 + i, 0.4)} fill="#3d6bb3" stroke={INK} strokeWidth={4} />
					</g>
				),
			)}
			{tint ? <rect x={x0} y={y - 120} width={x1 - x0} height={1500} fill={tint} opacity={0.3} /> : null}
		</g>
	);
};

/** grandmother's little blue notebook, open (k 0..1) or shut, held at x,y */
export const Diary: React.FC<{x: number; y: number; s?: number; open?: number; frame: number}> = ({x, y, s = 1, open = 1, frame}) => {
	const sd = 5300 + boilOf(frame, 4) * 7;
	const w = 46 + 44 * open;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d={wobPoly([[-w, -30], [w, -30], [w + 4, 30], [-w - 4, 30]], sd, 0.5)} fill="#3d6bb3" stroke={INK} strokeWidth={4} />
			{open > 0.2 ? (
				<g>
					<path d={wobPoly([[-w + 6, -26], [-2, -24], [-2, 26], [-w + 4, 26]], sd + 1, 0.4)} fill="#f4efe0" stroke={INK} strokeWidth={2.5} />
					<path d={wobPoly([[2, -24], [w - 6, -26], [w - 4, 26], [2, 26]], sd + 2, 0.4)} fill="#f4efe0" stroke={INK} strokeWidth={2.5} />
					{[-14, -4, 6, 16].map((ly) => (
						<g key={ly}>
							<path d={wobLine(-w + 14, ly, -10, ly, sd + 3 + ly, 0.6)} stroke="#4a4a6a" strokeWidth={2} />
							<path d={wobLine(10, ly, w - 14, ly, sd + 4 + ly, 0.6)} stroke="#4a4a6a" strokeWidth={2} />
						</g>
					))}
				</g>
			) : null}
		</g>
	);
};

/** three long rips in a blanket, from a to b (k 0..1 how far they have opened): ragged dark gaps with the white
 *  stuffing showing along their edges, slightly fanned like claw marks */
export const Tears: React.FC<{a: Pt; b: Pt; k?: number; gap?: number}> = ({a, b, k = 1, gap = 26}) => {
	const n = 14;
	const rip = (i: number) => {
		const a0: Pt = [a[0], a[1] + i * gap];
		const b0: Pt = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + i * gap * 1.35];
		const top: Pt[] = [];
		const bot: Pt[] = [];
		for (let j = 0; j <= n; j++) {
			const u = j / n;
			const x = a0[0] + (b0[0] - a0[0]) * u;
			const y = a0[1] + (b0[1] - a0[1]) * u;
			// widest in the middle, ragged edges
			const w = (3 + 11 * Math.sin(Math.PI * u)) * (1 + 0.12 * Math.sin(j * 1.3 + i * 1.9));
			top.push([x, y - w]);
			bot.push([x, y + w * (0.85 + 0.15 * Math.cos(j * 1.7 + i))]);
		}
		const poly = (pts: Pt[]) => pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
		const outer = `${poly(top)} ${poly([...bot].reverse()).replace('M', 'L')} Z`;
		const inner = `${poly(top.map(([x, y], j) => [x, y + Math.min(4, (j % 3) + 2)] as Pt))} ${poly([...bot].reverse().map(([x, y], j) => [x, y - Math.min(4, ((j + 1) % 3) + 2)] as Pt)).replace('M', 'L')} Z`;
		return (
			<g key={i}>
				<path d={outer} fill="#e9e4d8" stroke="#141414" strokeWidth={3} strokeLinejoin="round" />
				<path d={inner} fill="#08080c" />
			</g>
		);
	};
	return <g>{[-1, 0, 1].map(rip)}</g>;
};
