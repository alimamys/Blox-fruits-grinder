// Goatman-specific pieces for the stick film: a QA-registered Person wrapper, sleepers, chair, campfire,
// the smell, counting badges, the trailer door, the pot of hot dogs, paper plates, muzzle flash, title card.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {FONT} from '../utils/fonts';
import {boilOf, wob, wobCircle, wobEllipse, wobLine, wobPoly, type Pt} from '../utils/rough';
import {clamp01, INK, lerp, qaAdd, ramp, Tint, useStageCtx} from './kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyP = Record<string, any>;

/** Any cast member, registered for the frame QA (box from position, scale and pose), tinted for the shot's light. */
export const Person: React.FC<AnyP & {is: React.FC<any>; name: string; edge?: boolean; overlapOk?: boolean; small?: boolean}> = ({is: C, name, edge, overlapOk, small, ...p}) => {
	const ctx = useStageCtx();
	const s = (p.s as number) ?? 1;
	const x = (p.x as number) ?? 0;
	const y = (p.y as number) ?? 0;
	const sit = p.pose === 'sit';
	const k = p.child ? 0.62 : 1;
	const headR = 36 * (p.child ? 1.08 : 1) * s;
	const top = y - (sit ? 209 : 262) * k * s - headR - 6 * s;
	qaAdd(ctx, {name, x0: x - 52 * s * k, x1: x + 52 * s * k, y0: top, y1: y, head: top + 2 * headR + 6 * s, edge, overlapOk, small});
	return (
		<Tint>
			<C {...p} />
		</Tint>
	);
};
/** register a non-person shape (the thing) for the QA */
export const QAShape: React.FC<{name: string; x0: number; y0: number; x1: number; y1: number; edge?: boolean; small?: boolean; overlapOk?: boolean}> = (b) => {
	qaAdd(useStageCtx(), {...b, head: b.y0 + (b.y1 - b.y0) * 0.25});
	return null;
};

/** Asleep (or pretending) on the trailer floor in a sleeping bag. dir 1 = head on the left. */
export const Sleeper: React.FC<{name: string; x: number; y: number; s?: number; bag: string; skin: string; hair: string; eyes?: 'closed' | 'open' | 'none'; dir?: 1 | -1; frame: number; sitUp?: number; shake?: number; dark?: boolean}> = ({
	name,
	x,
	y,
	s = 1,
	bag,
	skin,
	hair,
	eyes = 'closed',
	dir = 1,
	frame,
	sitUp = 0,
	shake = 0,
	dark = false,
}) => {
	const ctx = useStageCtx();
	const sd = 1500 + name.length * 31 + boilOf(frame, 4) * 7;
	const L = 300;
	const breath = Math.sin(frame / 24 * 2 * Math.PI / 3.8 + name.length) * 2;
	const hx = -L / 2 + 26;
	const hy = -48 - sitUp * 70;
	const j = shake ? Math.sin(frame * 2.2) * 3 * shake : 0;
	// QA on the head only: a sleeping bag running out of the frame is fine, a cut-off face is not
	const headX = x + dir * s * (-L / 2 + 26);
	qaAdd(ctx, {name, x0: headX - 46 * s, x1: headX + 46 * s, y0: y + (hy - 42) * s, y1: y + (hy + 40) * s, head: y + (hy + 40) * s, small: true, overlapOk: true});
	const face = dark ? '#3a3a40' : skin;
	return (
		<Tint>
			<g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
				<path d={wobPoly([[-L / 2, 0], [L / 2, 0], [L / 2, -70 - breath], [-L / 2 + 60, -78 - breath], [-L / 2, -60]], sd, 1)} fill={bag} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
				<path d={wobLine(-L / 2 + 70, -40, L / 2 - 10, -40, sd + 1, 0.8)} stroke="#000" strokeOpacity={0.18} strokeWidth={4} />
				<path d={wobEllipse(-L / 2 + 10, -18, 46, 20, sd + 2, 0.8)} fill="#e7e2d4" stroke={INK} strokeWidth={4} />
				<g transform={`translate(${hx + j} ${hy}) rotate(${-70 + sitUp * 70})`}>
					<path d={wobCircle(0, 0, 36, sd + 3, 1, 10)} fill={face} stroke={INK} strokeWidth={5} />
					<path d={`M-36,-4 C-34,-40 34,-40 36,-4 C24,-22 -24,-22 -36,-4 Z`} fill={hair} stroke={INK} strokeWidth={3} />
					{eyes === 'closed' ? (
						<>
							<path d="M-17,6 q6,5 12,0" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
							<path d="M5,6 q6,5 12,0" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
						</>
					) : eyes === 'open' ? (
						<>
							<circle cx={-11} cy={6} r={5} fill={INK} />
							<circle cx={11} cy={6} r={5} fill={INK} />
						</>
					) : null}
				</g>
			</g>
		</Tint>
	);
};

/** A folding chair (drawn behind a seated person: seat top at y - 72*s). */
export const Chair: React.FC<{x: number; y: number; s?: number; frame: number}> = ({x, y, s = 1, frame}) => {
	const sd = 1600 + boilOf(frame, 4) * 7;
	const seat = y - 72 * s;
	return (
		<Tint>
			<path d={wobLine(x - 40 * s, seat, x - 46 * s, y, sd, 0.6)} stroke={INK} strokeWidth={7} />
			<path d={wobLine(x + 40 * s, seat, x + 46 * s, y, sd + 1, 0.6)} stroke={INK} strokeWidth={7} />
			<path d={wobPoly([[x - 44 * s, seat - 8 * s], [x + 44 * s, seat - 8 * s], [x + 44 * s, seat + 6 * s], [x - 44 * s, seat + 6 * s]], sd + 2, 0.5)} fill="#7a7f86" stroke={INK} strokeWidth={4} />
			<path d={wobPoly([[x - 38 * s, seat - 150 * s], [x + 38 * s, seat - 150 * s], [x + 38 * s, seat - 100 * s], [x - 38 * s, seat - 100 * s]], sd + 3, 0.5)} fill="#7a7f86" stroke={INK} strokeWidth={4} />
			<path d={wobLine(x - 34 * s, seat - 100 * s, x - 34 * s, seat, sd + 4, 0.4)} stroke={INK} strokeWidth={6} />
			<path d={wobLine(x + 34 * s, seat - 100 * s, x + 34 * s, seat, sd + 5, 0.4)} stroke={INK} strokeWidth={6} />
		</Tint>
	);
};

/** Campfire in the stone ring: flames + glow. */
export const Campfire: React.FC<{x: number; y: number; s?: number; lit?: number; frame: number}> = ({x, y, s = 1, lit = 1, frame}) => {
	if (lit <= 0.01) return null;
	const f = frame;
	const flame = (dx: number, h: number, w: number, k: number, col: string) => {
		const sway = Math.sin(f / 3 + k * 1.7) * 8;
		const hh = h * (0.85 + Math.abs(Math.sin(f / 4 + k)) * 0.25) * lit;
		return <path key={k} d={`M${dx - w},0 Q${dx - w * 0.6 + sway * 0.3},${-hh * 0.5} ${dx + sway},${-hh} Q${dx + w * 0.6 + sway * 0.3},${-hh * 0.5} ${dx + w},0 Z`} fill={col} />;
	};
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<ellipse cx={0} cy={-60} rx={420} ry={300} fill="url(#glowWarm)" opacity={0.9 * lit} />
			<path d="M-70,6 L60,-14 M-60,-14 L70,6" stroke="#5a3a22" strokeWidth={16} strokeLinecap="round" />
			{flame(-30, 120, 34, 1, '#e8541e')}
			{flame(28, 140, 36, 2, '#e8541e')}
			{flame(0, 170, 40, 3, '#f08a24')}
			{flame(-14, 110, 24, 4, '#ffc93c')}
			{flame(16, 120, 22, 5, '#ffc93c')}
			{flame(0, 70, 16, 6, '#fff1a8')}
		</g>
	);
};

/** The smell: wavy greenish-grey lines drifting through the air. k 0..1 strength; colour shifts for "copper" / "burnt". */
export const Smell: React.FC<{k: number; frame: number; x0?: number; x1?: number; y0?: number; y1?: number; color?: string}> = ({k, frame, x0 = 0, x1 = 1920, y0 = 200, y1 = 900, color = '#b9c9a2'}) => {
	if (k <= 0.01) return null;
	const n = 9;
	return (
		<g opacity={Math.min(1, k)}>
			{Array.from({length: n}, (_, i) => {
				const y = lerp(y0, y1, (i + 0.5) / n) - ((frame * 1.4 + i * 37) % 120);
				const ph = frame / 9 + i;
				let d = `M${x0},${y}`;
				for (let x = x0; x <= x1; x += 80) d += ` Q${x + 40},${y + Math.sin(ph + x / 90) * 22} ${x + 80},${y}`;
				return <path key={i} d={d} fill="none" stroke={color} strokeWidth={5} strokeOpacity={0.22 + 0.18 * Math.sin(ph)} strokeLinecap="round" strokeDasharray="60 40" strokeDashoffset={-frame * 3 - i * 17} />;
			})}
		</g>
	);
};

/** Counting: numbers pop above heads one after another from t0. heads in world coords (head tops). */
export const Counts: React.FC<{heads: Pt[]; t0: number; t: number; step?: number; color?: string; hold?: number; s?: number}> = ({heads, t0, t, step = 0.32, color = '#ffd21a', hold = 99, s = 1}) => (
	<g>
		{heads.map(([x, y], i) => {
			const a = t0 + i * step;
			if (t < a || t > a + hold) return null;
			const pop = Math.min(1, (t - a) / 0.12);
			const sc = (0.6 + 0.4 * pop + (pop < 1 ? 0.15 : 0)) * s;
			return (
				<g key={i} transform={`translate(${x} ${y - 40 * s}) scale(${sc})`}>
					<circle r={34} fill="#111" stroke={color} strokeWidth={5} />
					<text y={14} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={40} fill={color}>
						{i + 1}
					</text>
				</g>
			);
		})}
	</g>
);

/** A door (rect) opened `open` 0..1: the dark gap and the door panel swinging toward us on its left hinge. */
export const DoorOpen: React.FC<{r: readonly [number, number, number, number]; open: number; inside?: string; panel?: string}> = ({r, open, inside = '#07080b', panel = '#c9c2b2'}) => {
	if (open <= 0.01) return null;
	const [x0, y0, x1, y1] = r;
	const w = (x1 - x0) * open;
	return (
		<g>
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={inside} />
			<path d={`M${x0},${y0} L${x0 - w * 0.25},${y0 - 10} L${x0 - w * 0.25},${y1 + 10} L${x0},${y1} Z`} fill={panel} stroke={INK} strokeWidth={4} />
		</g>
	);
};

/** The pot seen from above, with n hot dogs in it. */
export const PotTop: React.FC<{n: number; frame: number; steam?: boolean}> = ({n, frame, steam = true}) => {
	const sd = 1700 + boilOf(frame, 4) * 7;
	return (
		<g>
			<rect width={1920} height={1080} fill="#3a2a1c" />
			<path d={wobCircle(960, 560, 420, sd, 4, 16)} fill="#8d9298" stroke={INK} strokeWidth={10} />
			<path d={wobCircle(960, 560, 360, sd + 1, 3, 16)} fill="#5f8fa8" stroke={INK} strokeWidth={6} />
			{Array.from({length: n}, (_, i) => {
				const a = (i / Math.max(1, n)) * Math.PI * 2;
				const r = i < 4 ? 120 : i < 8 ? 230 : 40;
				const x = 960 + Math.cos(a + i) * r;
				const y = 560 + Math.sin(a + i) * r * 0.8;
				return (
					<g key={i} transform={`rotate(${(i * 47) % 180} ${x} ${y})`}>
						<rect x={x - 70} y={y - 16} width={140} height={32} rx={16} fill="#b5482f" stroke={INK} strokeWidth={5} />
						<path d={`M${x - 50},${y - 4} L${x + 50},${y - 4}`} stroke="#fff" strokeOpacity={0.3} strokeWidth={5} />
					</g>
				);
			})}
			{steam
				? [0, 1, 2].map((i) => (
						<path key={i} d={`M${860 + i * 100},${300 - ((frame * 2 + i * 40) % 120)} q20,-30 0,-60 q-20,-30 0,-60`} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={10} strokeLinecap="round" />
					))
				: null}
		</g>
	);
};

/** Paper plates on the coffee table (n of them, greasy). */
export const Plates: React.FC<{n: number; x0: number; x1: number; y: number; frame: number}> = ({n, x0, x1, y, frame}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const x = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1));
			const sd = 1800 + i * 9 + boilOf(frame, 4) * 7;
			return (
				<g key={i}>
					<path d={wobEllipse(x, y + (i % 2) * 8, 38, 12, sd, 0.6)} fill="#f4f1e8" stroke={INK} strokeWidth={3} />
					<ellipse cx={x + 6} cy={y - 1 + (i % 2) * 8} rx={14} ry={4} fill="#d98c3a" opacity={0.55} />
				</g>
			);
		})}
	</g>
);

/** Muzzle flash at a point. */
export const Flash: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
	k <= 0.01 ? null : (
		<g opacity={k}>
			<circle cx={x} cy={y} r={160} fill="url(#glowWarm)" />
			<path d={`M${x},${y - 70} L${x + 16},${y - 16} L${x + 70},${y} L${x + 16},${y + 16} L${x},${y + 70} L${x - 16},${y + 16} L${x - 70},${y} L${x - 16},${y - 16} Z`} fill="#fff1a8" stroke="#f08a24" strokeWidth={4} />
		</g>
	);

/** A torch beam from a hand toward a point. */
export const Beam: React.FC<{from: Pt; to: Pt; w?: number; k?: number}> = ({from, to, w = 160, k = 1}) => {
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const L = Math.hypot(dx, dy) || 1;
	const nx = -dy / L;
	const ny = dx / L;
	return <path d={`M${from[0]},${from[1]} L${to[0] + nx * w},${to[1] + ny * w} L${to[0] - nx * w},${to[1] - ny * w} Z`} fill="#fff4c8" opacity={0.16 * k} />;
};

/** Shake part of the painted plate itself (bushes rustling): the plate image, clipped to a region, jittered. */
export const PlateShake: React.FC<{plate: string; x0: number; y0: number; x1: number; y1: number; k: number; frame: number}> = ({plate, x0, y0, x1, y1, k, frame}) => {
	if (k <= 0.01) return null;
	const jx = Math.sin(frame * 1.7) * 7 * k;
	const jy = Math.cos(frame * 2.3) * 3 * k;
	const id = `shk${x0}${y0}`;
	return (
		<g>
			<defs>
				<clipPath id={id}>
					<ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id})`}>
				<image href={staticFile(`plates/${plate}.jpg`)} x={jx} y={jy} width={1920} height={1080} preserveAspectRatio="none" />
			</g>
		</g>
	);
};

/** Plain words on screen (counting maths, the last lines). */
export const BigWords: React.FC<{text: string; k?: number; size?: number; color?: string; y?: number}> = ({text, k = 1, size = 120, color = '#f3efe4', y = 0}) => (
	<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k, transform: `translateY(${y}px)`}}>
		<div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: size, color, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>{text}</div>
	</AbsoluteFill>
);

/** Title / end card: eleven little figures and a twelfth that is only a shadow. */
export const TitleCardGoat: React.FC<{f: number; d: number; credit?: boolean}> = ({f, d, credit = false}) => {
	const o = clamp01((f - 3) / 8) * clamp01((d - f) / 10);
	const k = ramp(f, 10, 40);
	const cols = ['#8e2a2a', '#8a8f96', '#e2b33a', '#b49ad6', '#5d6b3c', '#e88a3a', '#e6a3b0', '#3e6b45', '#ece6d6', '#2c4f9a', '#2a2f3a'];
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', opacity: o}}>
				{cols.map((c, i) => {
					const x = 960 + (i - 5.5) * 120;
					return (
						<g key={i}>
							<circle cx={x} cy={330} r={30} fill="#d8b89a" stroke="#fff" strokeOpacity={0.25} strokeWidth={3} />
							<rect x={x - 26} y={366} width={52} height={70} rx={14} fill={c} />
						</g>
					);
				})}
				<g opacity={k}>
					<circle cx={960 + 5.5 * 120} cy={330} r={30} fill="#141416" stroke="#555" strokeWidth={3} />
					<rect x={960 + 5.5 * 120 - 26} y={366} width={52} height={70} rx={14} fill="#141416" stroke="#555" strokeWidth={3} />
				</g>
			</svg>
			<div style={{opacity: o, marginTop: 260, textAlign: 'center', fontFamily: '"Permanent Marker", "Patrick Hand", cursive', color: '#f1ede2'}}>
				<div style={{fontSize: 96, letterSpacing: 4}}>11 OF US WENT CAMPING.</div>
				<div style={{fontSize: 96, letterSpacing: 4, color: '#e3392c', opacity: k}}>12 CAME BACK.</div>
				{credit ? (
					<div style={{fontFamily: FONT.ui, fontSize: 26, color: 'rgba(240,236,226,0.7)', marginTop: 28, letterSpacing: 1}}>Based on "Anansi's Goatman Story" by Anansi (2012), CC BY-SA 3.0</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

export {wob};
