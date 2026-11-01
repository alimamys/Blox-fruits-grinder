/**
 * Factual on-screen graphics, all rendered in code (never inside artwork).
 * Every number/date here comes from the brief's verified fact notes F01–F06.
 * Animations reveal; they never count through intermediate values.
 */
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import geo from '../data/geo.json';
import {ramp, easeOut} from '../lib/motion';
import {Embers} from './fx';
import {C, FONT, SAFE, SUB_BAND_H} from '../lib/theme';

const pop = Easing.out(Easing.back(1.6));
const appear = (f: number, at: number, d = 8) => interpolate(f, [at, at + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
const popIn = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: pop});
const BOTTOM = SUB_BAND_H + 26; // keep graphics above the subtitle band

const panel: React.CSSProperties = {background: 'rgba(7,9,16,0.84)', boxShadow: '0 10px 40px rgba(0,0,0,0.45)'};

// ------------------------------------------------------------ simple labels
export const ChapterStrap: React.FC<{n: string; title: string; dur?: number}> = ({n, title, dur = 76}) => {
	const f = useCurrentFrame();
	if (f > dur) return null;
	const o = appear(f, 2) * ramp(f, dur - 8, dur, 1, 0);
	const w = ramp(f, 2, 14, 0, 100, easeOut);
	return (
		<div style={{position: 'absolute', left: SAFE.x, bottom: BOTTOM, opacity: o, display: 'flex', alignItems: 'center', gap: 16, clipPath: `inset(0 ${100 - w}% 0 0)`}}>
			<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: C.amber, lineHeight: 1}}>{n}</div>
			<div style={{...panel, padding: '8px 18px', fontFamily: FONT.display, fontWeight: 600, fontSize: 30, letterSpacing: '0.12em', color: C.paper}}>{title}</div>
		</div>
	);
};

export const SourceTag: React.FC<{text: string; from: number; to?: number}> = ({text, from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	return (
		<div style={{position: 'absolute', right: SAFE.x, bottom: BOTTOM, opacity: appear(f, from) * ramp(f, to - 6, to, 1, 0), fontFamily: FONT.display, fontWeight: 500, fontSize: 22, letterSpacing: '0.14em', color: 'rgba(237,230,214,0.9)', ...panel, padding: '6px 14px'}}>
			SOURCES · {text}
		</div>
	);
};

export const Tag: React.FC<{text: string; from: number; to?: number; color?: string; top?: number}> = ({text, from, to = 99999, color = C.paper, top = SAFE.top + 60}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	return (
		<div style={{position: 'absolute', left: SAFE.x, top, opacity: appear(f, from) * ramp(f, to - 6, to, 1, 0), fontFamily: FONT.display, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color, ...panel, padding: '6px 14px', borderLeft: `5px solid ${C.amber}`}}>
			{text}
		</div>
	);
};

/** Caption-style status label (e.g. TALKS CONTINUING, COALITION NEGOTIATIONS). */
export const StatusLabel: React.FC<{text: string; from: number; to?: number; accent?: string}> = ({text, from, to = 99999, accent = C.amber}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const p = popIn(f, from);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: BOTTOM + 30, pointerEvents: 'none'}}>
			<div style={{opacity: Math.min(1, p) * ramp(f, to - 6, to, 1, 0), transform: `scale(${0.9 + 0.1 * p})`, ...panel, borderTop: `5px solid ${accent}`, padding: '14px 34px', fontFamily: FONT.display, fontWeight: 700, fontSize: 52, letterSpacing: '0.16em', color: C.paper}}>
				{text}
			</div>
		</AbsoluteFill>
	);
};

export const NameTag: React.FC<{name: string; role: string; from: number; to?: number}> = ({name, role, from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const w = ramp(f, from, from + 12, 0, 100, easeOut);
	return (
		<div style={{position: 'absolute', left: SAFE.x + 20, bottom: BOTTOM + 40, clipPath: `inset(0 ${100 - w}% 0 0)`, opacity: ramp(f, to - 6, to, 1, 0)}}>
			<div style={{...panel, borderLeft: `6px solid ${C.amber}`, padding: '12px 22px 10px'}}>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em', color: C.paper}}>{name}</div>
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 26, color: C.amberSoft, marginTop: 2}}>{role}</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------- Hormuz map
type Geo = {bbox: number[]; countries: {name: string; rings: number[][][]}[]};
const project = (view: [number, number, number, number], W: number, H: number) => {
	const [x0, y0, x1, y1] = view;
	return ([lon, lat]: number[]) => [((lon - x0) / (x1 - x0)) * W, ((y1 - lat) / (y1 - y0)) * H];
};
const ringPath = (rings: number[][][], P: (p: number[]) => number[]) =>
	rings.map((r) => 'M' + r.map((p) => P(p).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join(' ');

export const HormuzMap: React.FC<{from: number; to?: number; dim?: number}> = ({from, to = 99999, dim = 1}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const W = 1120;
	const H = 620;
	const view: [number, number, number, number] = [54.0, 24.9, 59.6, 27.8];
	const P = project(view, W, H);
	const g = geo.hormuz as Geo;
	const o = appear(f, from, 10) * ramp(f, to - 8, to, 1, 0);
	const draw = ramp(f, from + 6, from + 26, 0, 1, easeOut);
	const [sx, sy] = P([56.45, 26.55]);
	const rx = (0.5 / (view[2] - view[0])) * W;
	const ry = (0.34 / (view[3] - view[1])) * H;
	const lbl = (t: string, lon: number, lat: number, size: number, color: string, italic = false) => {
		const [x, y] = P([lon, lat]);
		return (
			<text x={x} y={y} fontFamily={FONT.display} fontWeight={600} fontSize={size} letterSpacing="4" fill={color} textAnchor="middle" fontStyle={italic ? 'italic' : 'normal'}>
				{t}
			</text>
		);
	};
	return (
		<div style={{position: 'absolute', left: 1920 - SAFE.x - W, top: 196, width: W, height: H, opacity: o * dim, transform: `translateY(${(1 - o) * 20}px)`, ...panel, padding: 0, overflow: 'hidden', borderTop: `5px solid ${C.amber}`}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<linearGradient id="hzsea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#173a66" />
						<stop offset="1" stopColor="#0d2446" />
					</linearGradient>
				</defs>
				<rect width={W} height={H} fill="url(#hzsea)" />
				{g.countries.map((c) => (
					<path key={c.name} d={ringPath(c.rings, P)} fill={c.name === 'Iran' ? '#cdb78a' : '#bfa97c'} stroke="#6e5c3c" strokeWidth={1.6} strokeLinejoin="round" />
				))}
				{/* the strait: outlined waterway, drawn on */}
				<ellipse cx={sx} cy={sy} rx={rx} ry={ry} fill="#ffcf7a" opacity={0.12 * draw} />
				<ellipse cx={sx} cy={sy} rx={rx} ry={ry} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="14 10" pathLength={100} strokeDashoffset={-f * 0.3} opacity={draw} />
				{lbl('IRAN', 58.4, 27.45, 30, '#4a3a22')}
				{lbl('OMAN', 56.15, 25.62, 22, '#4a3a22')}
				{lbl('UAE', 55.55, 25.12, 22, '#4a3a22')}
				{lbl('GULF', 54.75, 26.35, 22, '#9fc0e8', true)}
				{lbl('GULF OF OMAN', 58.55, 25.25, 22, '#9fc0e8', true)}
				<g opacity={draw}>
					<line x1={sx + rx * 0.75} y1={sy + ry * 0.65} x2={sx + rx * 1.7} y2={sy + ry * 1.5} stroke={C.paper} strokeWidth={2} />
					<rect x={sx + rx * 1.7 - 4} y={sy + ry * 1.5 - 4} width={286} height={42} fill="rgba(7,9,16,0.85)" />
					<text x={sx + rx * 1.7 + 10} y={sy + ry * 1.5 + 26} fontFamily={FONT.display} fontWeight={700} fontSize={28} letterSpacing="3" fill={C.paper}>
						STRAIT OF HORMUZ
					</text>
				</g>
				<text x={W - 14} y={H - 12} textAnchor="end" fontFamily={FONT.body} fontSize={15} fill="rgba(237,230,214,0.6)">
					Map: Natural Earth
				</text>
			</svg>
		</div>
	);
};

/** POSSIBLE AGREEMENT → PROPOSED REOPENING WITHIN 2 DAYS (condition first). */
export const ConditionCard: React.FC<{from: number; numberAt: number; to?: number}> = ({from, numberAt, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const a = popIn(f, from);
	const arrow = ramp(f, numberAt - 6, numberAt + 4, 0, 1, easeOut);
	const b = popIn(f, numberAt);
	const out = ramp(f, to - 8, to, 1, 0);
	const box = (text: string, p: number, accent: string) => (
		<div style={{opacity: Math.min(1, p) * out, transform: `scale(${0.85 + 0.15 * p})`, ...panel, borderTop: `5px solid ${accent}`, padding: '18px 24px', fontFamily: FONT.display, fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', color: C.paper, textAlign: 'center'}}>
			{text}
		</div>
	);
	return (
		<div style={{position: 'absolute', left: SAFE.x, top: 250, width: 560, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12}}>
			{box('POSSIBLE AGREEMENT', a, C.slate)}
			<svg width="560" height="70" style={{opacity: arrow * out}}>
				<path d={`M280,6 L280,${6 + 48 * arrow}`} stroke={C.amber} strokeWidth="8" strokeLinecap="round" />
				<path d="M260,40 L280,62 L300,40" stroke={C.amber} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.9 ? 1 : 0} />
			</svg>
			{box('PROPOSED REOPENING WITHIN 2 DAYS', b, C.amber)}
		</div>
	);
};

// --------------------------------------------------------------- Israel seats
const BLOCS = [
	{n: 53, label: 'NETANYAHU BLOC', color: '#e59a3b'},
	{n: 48, label: 'MAIN OPPOSITION BLOC', color: '#6f93d6'},
	{n: 19, label: 'ARAB-LED PARTIES', color: '#3fb5a4'},
];

/** Three separate tiles (53 / 48 / 19), then three separate bars against the 61-seat line. */
export const SeatGraphic: React.FC<{reveal: [number, number, number]; barsAt: number; totalAt: number; highlightFrom?: number; highlightTo?: number; to?: number}> = ({
	reveal,
	barsAt,
	totalAt,
	highlightFrom = 99999,
	highlightTo = 99999,
	to = 99999,
}) => {
	const f = useCurrentFrame();
	if (f < reveal[0] - 2 || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	const bars = ramp(f, barsAt, barsAt + 14, 0, 1, easeOut);
	const hl = f >= highlightFrom && f < highlightTo ? ramp(f, highlightFrom, highlightFrom + 8, 0, 1) * ramp(f, highlightTo - 8, highlightTo, 1, 0) : 0;
	const BAR_X = 470;
	const PER = 7.2; // px per seat (120 seats = 864 px)
	const float = Math.sin(f * 0.06) * 4;
	const sheen = ((f * 1.6) % 260) - 80; // % across, loops
	return (
		<AbsoluteFill style={{opacity: out, transform: `translateY(${float}px)`}}>
			<AbsoluteFill style={{background: `linear-gradient(105deg, rgba(255,230,180,0) ${sheen - 10}%, rgba(255,230,180,0.07) ${sheen}%, rgba(255,230,180,0) ${sheen + 10}%)`, pointerEvents: 'none'}} />
			{/* phase 1: tiles */}
			{bars < 1 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 50, opacity: 1 - bars, transform: `translateY(${-bars * 40}px)`}}>
					{BLOCS.map((b, i) => {
						const p = popIn(f, reveal[i]);
						return (
							<div key={b.n} style={{width: 360, height: 300, opacity: Math.min(1, p), transform: `scale(${0.8 + 0.2 * p})`, ...panel, borderTop: `8px solid ${b.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 150, lineHeight: 1, color: C.paper}}>{b.n}</div>
								<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, letterSpacing: '0.14em', color: b.color, marginTop: 10}}>{b.label}</div>
								<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 20, color: 'rgba(237,230,214,0.7)', marginTop: 4}}>seats</div>
							</div>
						);
					})}
				</div>
			) : null}
			{/* phase 2: separate bars against the majority threshold */}
			{bars > 0 ? (
				<div style={{position: 'absolute', left: 230, width: 1460, top: 170, height: 600, opacity: bars, ...panel}}>
					<svg width="1460" height="600" viewBox="0 0 1460 600">
						{BLOCS.map((b, i) => {
							const y = 150 + i * 120;
							const w = b.n * PER * ramp(f, barsAt + 4 + i * 3, barsAt + 18 + i * 3, 0, 1, easeOut);
							const dim = hl > 0 && b.n !== 19 ? 1 - 0.6 * hl : 1;
							return (
								<g key={b.n} opacity={dim}>
									<text x={BAR_X - 24} y={y + 34} textAnchor="end" fontFamily={FONT.display} fontWeight={600} fontSize={30} letterSpacing="3" fill={b.color}>
										{b.label}
									</text>
									<rect x={BAR_X} y={y} width={120 * PER} height={50} fill="rgba(237,230,214,0.08)" opacity={ramp(f, totalAt, totalAt + 10, 0, 1)} />
									<rect x={BAR_X} y={y} width={w} height={50} fill={b.color} />
									{b.n === 19 && hl > 0 ? <rect x={BAR_X - 6} y={y - 6} width={b.n * PER + 12} height={62} fill="none" stroke="#fff" strokeWidth={4} opacity={hl} /> : null}
									<text x={BAR_X + 14} y={y + 40} fontFamily={FONT.display} fontWeight={700} fontSize={40} fill="#0b0d14" opacity={ramp(f, barsAt + 14 + i * 3, barsAt + 20 + i * 3, 0, 1)}>
										{b.n}
									</text>
								</g>
							);
						})}
						{/* 61-seat line */}
						<g opacity={ramp(f, barsAt + 12, barsAt + 22, 0, 1)}>
							<line x1={BAR_X + 61 * PER} y1={110} x2={BAR_X + 61 * PER} y2={530} stroke="#fff" strokeWidth={4} strokeDasharray="12 8" />
							<rect x={BAR_X + 61 * PER - 230} y={40} width={460} height={56} fill={C.red} />
							<text x={BAR_X + 61 * PER} y={80} textAnchor="middle" fontFamily={FONT.display} fontWeight={700} fontSize={32} letterSpacing="2" fill="#fff">
								61 FOR AN OUTRIGHT MAJORITY
							</text>
						</g>
						<text x={BAR_X + 120 * PER} y={575} textAnchor="end" fontFamily={FONT.display} fontWeight={600} fontSize={30} letterSpacing="3" fill={C.paper} opacity={ramp(f, totalAt, totalAt + 10, 0, 1)}>
							TOTAL SEATS: 120
						</text>
					</svg>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- Ukraine
export const RouteSchematic: React.FC<{from: number; to?: number}> = ({from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	const stops = ['OLESHKY', 'RUSSIA', 'BELARUS', 'UKRAINIAN-HELD TERRITORY'];
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 150, opacity: out}}>
			<div style={{...panel, padding: '26px 40px 22px', borderTop: `5px solid ${C.amber}`, opacity: appear(f, from)}}>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em', color: C.amber, marginBottom: 22}}>SCHEMATIC ROUTE</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					{stops.map((s, i) => {
						const at = from + 4 + i * 9;
						const p = popIn(f, at);
						return (
							<React.Fragment key={s}>
								{i > 0 ? (
									<svg width="70" height="40" style={{opacity: ramp(f, at - 6, at, 0, 1)}}>
										<path d={`M4,20 L${4 + 50 * ramp(f, at - 6, at, 0, 1)},20`} stroke={C.amber} strokeWidth="6" strokeLinecap="round" />
										<path d="M46,6 L64,20 L46,34" stroke={C.amber} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								) : null}
								<div style={{opacity: Math.min(1, p), transform: `scale(${0.85 + 0.15 * p})`, border: `3px solid ${i === 0 || i === 3 ? C.amber : 'rgba(237,230,214,0.6)'}`, padding: '14px 22px', fontFamily: FONT.display, fontWeight: 700, fontSize: 34, letterSpacing: '0.08em', color: C.paper, background: 'rgba(255,255,255,0.04)'}}>
									{s}
								</div>
							</React.Fragment>
						);
					})}
				</div>
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: 'rgba(237,230,214,0.75)', marginTop: 18}}>Not to scale — shows the reported sequence only, not the actual path.</div>
			</div>
		</AbsoluteFill>
	);
};

export const DateCard: React.FC<{title: string; lines: string[]; from: number; to?: number}> = ({title, lines, from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 150, opacity: out}}>
			<div style={{...panel, padding: '28px 54px', borderLeft: `8px solid ${C.amber}`, opacity: appear(f, from)}}>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 64, letterSpacing: '0.14em', color: C.paper}}>{title}</div>
				{lines.map((l, i) => (
					<div key={l} style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 40, letterSpacing: '0.1em', color: C.amberSoft, marginTop: 10, opacity: appear(f, from + 8 + i * 8), transform: `translateX(${(1 - appear(f, from + 8 + i * 8)) * -20}px)`}}>
						{l}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const UkraineInset: React.FC<{from: number; to?: number}> = ({from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const W = 800;
	const H = 540;
	const view: [number, number, number, number] = [22.0, 44.2, 40.5, 52.6];
	const P = project(view, W, H);
	const g = geo.ukraine as Geo;
	const o = appear(f, from, 10) * ramp(f, to - 8, to, 1, 0);
	const [ox, oy] = P([32.72, 46.62]);
	const pulse = 1 + 0.25 * Math.sin(f * 0.15);
	const lbl = (t: string, lon: number, lat: number, size: number, color: string, italic = false) => {
		const [x, y] = P([lon, lat]);
		return (
			<text x={x} y={y} fontFamily={FONT.display} fontWeight={600} fontSize={size} letterSpacing="4" fill={color} textAnchor="middle" fontStyle={italic ? 'italic' : 'normal'}>
				{t}
			</text>
		);
	};
	return (
		<div style={{position: 'absolute', left: 1920 - SAFE.x - W, top: 190, width: W, height: H + 84, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, ...panel, overflow: 'hidden', borderTop: `5px solid ${C.amber}`}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<rect width={W} height={H} fill="#1a3358" />
				{g.countries.map((c) => (
					<path key={c.name} d={ringPath(c.rings, P)} fill={c.name === 'Ukraine' ? '#d9c79c' : '#8f8a80'} stroke="#3a3428" strokeWidth={1.4} strokeLinejoin="round" />
				))}
				{lbl('UKRAINE', 31.0, 49.3, 34, '#3a2e18')}
				{lbl('RUSSIA', 38.6, 51.2, 24, '#2a2a2a')}
				{lbl('BELARUS', 28.0, 52.25, 22, '#2a2a2a')}
				{lbl('BLACK SEA', 31.2, 44.65, 20, '#9fc0e8', true)}
				<circle cx={ox} cy={oy} r={30 * pulse} fill="none" stroke={C.red} strokeWidth={3} opacity={0.7} />
				<circle cx={ox} cy={oy} r={22} fill={C.red} opacity={0.35} />
				<circle cx={ox} cy={oy} r={6} fill="#fff" stroke={C.red} strokeWidth={3} />
				<line x1={ox - 8} y1={oy + 8} x2={ox - 60} y2={oy + 50} stroke="#fff" strokeWidth={2} />
				<rect x={ox - 400} y={oy + 48} width={344} height={74} fill="rgba(7,9,16,0.88)" />
				<text x={ox - 386} y={oy + 78} fontFamily={FONT.display} fontWeight={700} fontSize={26} letterSpacing="3" fill={C.paper}>
					OLESHKY
				</text>
				<text x={ox - 386} y={oy + 108} fontFamily={FONT.display} fontWeight={600} fontSize={20} letterSpacing="2" fill={C.amberSoft}>
					LOCAL TRUCE AREA (APPROXIMATE)
				</text>
			</svg>
			<div style={{padding: '10px 18px', fontFamily: FONT.body, fontWeight: 600, fontSize: 19, color: 'rgba(237,230,214,0.8)'}}>
				Limited local truce only — fighting continued elsewhere. Internationally recognised borders; front lines not shown. Map: Natural Earth.
			</div>
		</div>
	);
};

// --------------------------------------------------------------- France
export const EstimateCard: React.FC<{from: number; extraAt: number; to?: number}> = ({from, extraAt, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const p = popIn(f, from);
	const out = ramp(f, to - 8, to, 1, 0);
	return (
		<div style={{position: 'absolute', left: SAFE.x + 20, top: 210, opacity: Math.min(1, p) * out, transform: `scale(${0.9 + 0.1 * p})`, transformOrigin: 'left top', ...panel, borderLeft: `8px solid ${C.amber}`, padding: '22px 36px'}}>
			<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 130, lineHeight: 1, color: C.paper}}>~320,000</div>
			<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 34, letterSpacing: '0.12em', color: C.amberSoft, marginTop: 12}}>GOVERNMENT ESTIMATE • 31 OCT</div>
			<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 28, color: 'rgba(237,230,214,0.85)', marginTop: 10, opacity: appear(f, extraAt)}}>Organizers estimated more.</div>
		</div>
	);
};

// --------------------------------------------------------------- markets
export const MarketTiles: React.FC<{spAt: number; ndAt: number; to?: number}> = ({spAt, ndAt, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < spAt - 2 || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	const tile = (name: string, value: string, at: number) => {
		const p = popIn(f, at);
		return (
			<div style={{opacity: Math.min(1, p), transform: `translateX(${(1 - Math.min(1, p)) * 40}px)`, ...panel, borderLeft: `8px solid ${C.red}`, padding: '18px 30px', marginBottom: 22, width: 620}}>
				<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 34, letterSpacing: '0.12em', color: C.paper}}>{name}</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 4}}>
					<svg width="56" height="50">
						<path d="M4,6 L52,6 L28,46 Z" fill="#ff4a4a" />
					</svg>
					<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 110, lineHeight: 1, color: '#ff5a50'}}>{value}</div>
				</div>
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: 'rgba(237,230,214,0.7)'}}>Daily change, Friday 30 Oct close</div>
			</div>
		);
	};
	return (
		<div style={{position: 'absolute', right: SAFE.x, top: 196, opacity: out}}>
			{tile('S&P 500', '−1.8%', spAt)}
			{f >= ndAt - 2 ? tile('NASDAQ COMPOSITE', '−2.9%', ndAt) : null}
		</div>
	);
};

// --------------------------------------------------------------- US
export const CalendarFlip: React.FC<{from: number; flipAt: number; to?: number}> = ({from, flipAt, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	const flip = ramp(f, flipAt, flipAt + 14, 0, 1, Easing.in(Easing.quad));
	const flip2 = ramp(f, flipAt + 14, flipAt + 28, 0, 1, Easing.in(Easing.quad));
	const page = (day: string, weekday: string) => (
		<div style={{position: 'absolute', inset: 0, top: 90, background: '#fbf7ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 18px 18px'}}>
			<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 230, lineHeight: 1, color: '#1d1b24'}}>{day}</div>
			<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 36, letterSpacing: '0.2em', color: '#7a6a5a'}}>{weekday}</div>
		</div>
	);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 130, opacity: out * appear(f, from)}}>
			<div style={{position: 'relative', width: 420, height: 470, perspective: 1200, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90, background: C.red, borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 48, letterSpacing: '0.2em', color: '#fff'}}>NOV 2026</div>
				{page('3', 'TUESDAY')}
				{flip2 < 1 ? (
					<div style={{position: 'absolute', inset: 0, transformOrigin: '50% 90px', transform: `rotateX(${-90 * flip2}deg)`, opacity: flip2 > 0 ? 1 : 0}}>{page('2', 'MONDAY')}</div>
				) : null}
				{flip < 1 ? <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 90px', transform: `rotateX(${-90 * flip}deg)`}}>{page('1', 'SUNDAY')}</div> : null}
				{[90, 210, 330].map((x) => (
					<div key={x} style={{position: 'absolute', left: x - 8, top: -14, width: 16, height: 40, borderRadius: 8, background: '#3a3a44'}} />
				))}
			</div>
		</AbsoluteFill>
	);
};

export const ResultBoard: React.FC<{from: number; to?: number}> = ({from, to = 99999}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const out = ramp(f, to - 8, to, 1, 0);
	const row = (name: string, i: number) => (
		<div key={name} style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 18, opacity: appear(f, from + 6 + i * 6)}}>
			<div style={{width: 200, fontFamily: FONT.display, fontWeight: 700, fontSize: 44, letterSpacing: '0.1em', color: C.paper}}>{name}</div>
			<div style={{width: 640, height: 54, border: '3px dashed rgba(237,230,214,0.5)'}} />
			<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: 'rgba(237,230,214,0.6)'}}>—</div>
		</div>
	);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 140, opacity: out}}>
			<div style={{...panel, padding: '30px 50px 34px', borderTop: `5px solid ${C.amber}`, opacity: appear(f, from)}}>
				<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, letterSpacing: '0.18em', color: C.amber}}>CONTROL OF CONGRESS</div>
				{row('HOUSE', 0)}
				{row('SENATE', 1)}
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: 'rgba(237,230,214,0.75)', marginTop: 20}}>Voting on 3 November. No results yet.</div>
			</div>
		</AbsoluteFill>
	);
};

export const FinalCard: React.FC<{from: number}> = ({from}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const o = appear(f, from, 14);
	const push = 1 + (f - from) * 0.0006;
	return (
		<AbsoluteFill style={{background: '#000', opacity: o, alignItems: 'center', justifyContent: 'center', paddingBottom: 60}}>
			<Embers count={34} seed="fc" opacity={0.55} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 60, transform: `scale(${push})`}}>
			<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 104, letterSpacing: '0.04em', color: C.paper}}>THE WEEK IN ANIME</div>
			<div style={{width: 420 * o, height: 7, background: C.red, margin: '16px 0 20px'}} />
			<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 40, letterSpacing: '0.22em', color: C.amberSoft}}>WEEK ENDING 1 NOV 2026</div>
			<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 28, color: 'rgba(237,230,214,0.8)', marginTop: 26, opacity: appear(f, from + 12)}}>Reporting sources in description</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
