// Paper + database evidence: <PoliceCaseFile/>, <DatabaseSearch/>, <CivilRecord/>,
// <DriverLicense/>, <DeparturesBoard/>, <DeckPlan/>, <GateCounter/>.
// All organisations are fictional.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01} from '../../utils/rough';
import {StickPerson} from '../characters/StickPerson';
import {PALETTES} from '../characters/Cast';

const paper: React.CSSProperties = {
	background: 'linear-gradient(180deg,#f4efe2,#ece5d3)',
	boxShadow: '0 30px 70px rgba(0,0,0,0.65)',
	color: '#1d1d1d',
};

export const PoliceCaseFile: React.FC<{f: number; stamp?: string; stampAt?: number; extra?: React.ReactNode; rot?: number}> = ({f, stamp, stampAt = 0, extra, rot = -1.2}) => {
	const st = stamp ? clamp((f - stampAt) / 4) : 0;
	return (
		<AbsoluteFill style={{background: '#1a1714', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{...paper, width: 1240, height: 980, transform: `rotate(${rot}deg)`, padding: '60px 80px', boxSizing: 'border-box', fontFamily: FONT.type, position: 'relative'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 24, borderBottom: '4px double #333', paddingBottom: 18}}>
					<svg width={90} height={100} viewBox="0 0 90 100">
						<path d="M45,4 L84,18 L80,60 Q74,86 45,96 Q16,86 10,60 L6,18 Z" fill="#1d2f5a" stroke="#111" strokeWidth={3} />
						<polygon points="45,26 51,42 68,42 54,52 59,68 45,58 31,68 36,52 22,42 39,42" fill="#d8b23a" />
					</svg>
					<div>
						<div style={{fontSize: 40, fontWeight: 700, letterSpacing: 2}}>PORT MASON POLICE SERVICE</div>
						<div style={{fontSize: 24}}>INCIDENT CASE FILE · RESTRICTED</div>
					</div>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: '330px 1fr', rowGap: 18, marginTop: 30, fontSize: 28}}>
					<div>CASE NO.</div>
					<div>PMPS-4417-63</div>
					<div>CLASSIFICATION</div>
					<div style={{fontWeight: 700}}>MISSING PERSON / MARITIME INCIDENT</div>
					<div>VESSEL</div>
					<div>NORTH STAR 8 (sailing NS8-2328, 23:28)</div>
					<div>REPORTING PARTY</div>
					<div>EMMA CLARKE</div>
					<div>SUBJECT</div>
					<div>"DANIEL CLARKE" (husband - per reporting party)</div>
					<div>MANIFEST</div>
					<div>61 PASSENGERS · 6 CREW · subject NOT LISTED</div>
					<div>BOOKING SYSTEM</div>
					<div>NO RECORD OF SUBJECT</div>
				</div>
				<div style={{marginTop: 34, fontSize: 25, lineHeight: 1.5, borderTop: '2px solid #999', paddingTop: 20}}>
					NOTES: R.P. states subject vanished from rear deck during power loss approx. 00:52. Crew corroborate unregistered elderly female passenger and the loss of
					navigation. No person seen entering water. Search of vessel negative.
				</div>
				{extra}
				{stamp ? (
					<div
						style={{
							position: 'absolute',
							right: 90,
							bottom: 110,
							transform: `rotate(-14deg) scale(${1.6 - 0.6 * st})`,
							opacity: st,
							border: '8px solid #b3261e',
							color: '#b3261e',
							padding: '10px 30px',
							fontSize: 64,
							fontFamily: FONT.ui,
							fontWeight: 800,
							letterSpacing: 6,
						}}
					>
						{stamp}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

export const DatabaseSearch: React.FC<{f: number; query: string; typeStart?: number; resultAt?: number; title?: string}> = ({f, query, typeStart = 0, resultAt = 40, title = 'PMPS RECORDS · BOOKING DATABASE QUERY'}) => {
	const typed = query.slice(0, Math.max(0, Math.floor((f - typeStart) / 1.5)));
	const searching = f >= typeStart + query.length * 1.5 && f < resultAt;
	const result = f >= resultAt;
	return (
		<AbsoluteFill style={{background: '#06090d', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono}}>
			<div style={{width: 1500, border: '2px solid #2b3b52', background: '#0b121c', borderRadius: 10, overflow: 'hidden'}}>
				<div style={{background: '#13233c', padding: '16px 28px', color: '#cfe0f5', fontSize: 26, fontFamily: FONT.ui, fontWeight: 700}}>{title}</div>
				<div style={{padding: 40, color: '#cfe0f5', fontSize: 34}}>
					<div style={{color: '#7f97b6', fontSize: 24}}>QUERY</div>
					<div style={{marginTop: 10, padding: '18px 22px', background: '#050a10', border: '2px solid #2b3b52', borderRadius: 6}}>
						{typed}
						<span style={{opacity: Math.floor(f / 8) % 2}}>▌</span>
					</div>
					<div style={{marginTop: 40, minHeight: 160}}>
						{searching ? <div style={{color: '#9fb2c8'}}>Searching 4 linked systems{'.'.repeat(1 + (Math.floor(f / 6) % 3))}</div> : null}
						{result ? (
							<div style={{display: 'inline-block', border: '5px solid #ff4d4d', color: '#ff4d4d', padding: '20px 40px', fontSize: 72, fontWeight: 700, letterSpacing: 6}}>NO RECORD FOUND</div>
						) : null}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const CivilRecord: React.FC<{f: number; reveal?: number}> = ({f, reveal = 1}) => {
	const rows: Array<[string, string, boolean?]> = [
		['NAME', 'EMMA CLARKE'],
		['AGE', '30'],
		['MARITAL STATUS', 'SINGLE', true],
		['MARRIAGE RECORDS', 'NONE — NEVER MARRIED', true],
		['DEPENDANTS', 'NONE'],
	];
	return (
		<AbsoluteFill style={{background: '#06090d', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui}}>
			<div style={{width: 1400, background: '#f7f8fa', borderRadius: 10, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
				<div style={{background: '#2d3b2d', color: '#fff', padding: '20px 34px', fontSize: 28, fontWeight: 800, letterSpacing: 1}}>CORVAN COAST CIVIL REGISTRY · PERSON RECORD</div>
				<div style={{padding: '30px 40px'}}>
					{rows.map(([k, v, red], i) => (
						<div key={k} style={{display: 'grid', gridTemplateColumns: '420px 1fr', padding: '18px 0', borderBottom: '1px solid #dde1e7', fontSize: 40, opacity: clamp(reveal * rows.length - i)}}>
							<div style={{color: '#6b7686', fontSize: 28, fontWeight: 600, alignSelf: 'center'}}>{k}</div>
							<div style={{fontWeight: 800, color: red ? '#b3261e' : '#1b2533'}}>{v}</div>
						</div>
					))}
				</div>
			</div>
			<div style={{position: 'absolute', bottom: 40, right: 60, color: '#475569', fontFamily: FONT.mono, fontSize: 20}}>QUERY BY PMPS · {f >= 0 ? '01:37:12' : ''}</div>
		</AbsoluteFill>
	);
};

/** Daniel's driving licence. `nameState`: 'name' | 'unknown' | letters fading (0..1 via erase) */
export const DriverLicense: React.FC<{f: number; unknownAt?: number; eraseFrom?: number; eraseDur?: number; tilt?: number; scale?: number}> = ({f, unknownAt, eraseFrom, eraseDur = 30, tilt = -3, scale = 1}) => {
	const unknown = unknownAt !== undefined && f >= unknownAt;
	const label = unknown ? 'UNKNOWN' : 'DANIEL CLARKE';
	const erase = eraseFrom !== undefined ? clamp((f - eraseFrom) / eraseDur) : 0;
	const glitch = unknownAt !== undefined && Math.abs(f - unknownAt) < 3;
	return (
		<AbsoluteFill style={{background: '#14161b', alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					width: 1240,
					height: 780,
					borderRadius: 36,
					transform: `rotate(${tilt}deg) scale(${scale})`,
					background: 'linear-gradient(135deg,#dfe9f2,#f5efe3 50%,#dce6ee)',
					boxShadow: '0 40px 90px rgba(0,0,0,0.7)',
					position: 'relative',
					overflow: 'hidden',
					fontFamily: FONT.ui,
					border: '2px solid #9aa7b6',
				}}
			>
				<div style={{background: '#1e4c7a', color: '#fff', padding: '22px 40px', fontSize: 40, fontWeight: 800, letterSpacing: 3}}>CORVAN COAST · DRIVER LICENCE</div>
				<div style={{position: 'absolute', left: 50, top: 140, width: 330, height: 420, background: '#cfd9e3', border: '4px solid #8a97a6', overflow: 'hidden'}}>
					<svg width={330} height={420} viewBox="-165 -380 330 420">
						<StickPerson frame={null} palette={PALETTES.daniel} hair="short" s={1.3} y={60} mouth="flat" arms="down" seed={37} />
					</svg>
				</div>
				<div style={{position: 'absolute', left: 430, top: 150, right: 40, color: '#1b2533'}}>
					<div style={{fontSize: 24, color: '#5a6a7e', fontWeight: 700}}>1. NAME</div>
					<div style={{fontSize: 62, fontWeight: 800, letterSpacing: 2, height: 80, color: unknown ? '#7a1a1a' : '#1b2533', transform: glitch ? 'translateX(8px)' : undefined}}>
						{label.split('').map((ch, i) => (
							<span key={i} style={{opacity: erase > 0 ? (h01(i, 37) * 0.8 + 0.1 < erase ? 0 : 1) : 1}}>
								{ch}
							</span>
						))}
					</div>
					<div style={{fontSize: 24, color: '#5a6a7e', fontWeight: 700, marginTop: 18}}>2. DATE OF BIRTH</div>
					<div style={{fontSize: 36, fontWeight: 700, fontFamily: FONT.mono}}>14.03.1994</div>
					<div style={{fontSize: 24, color: '#5a6a7e', fontWeight: 700, marginTop: 18}}>3. ADDRESS</div>
					<div style={{fontSize: 32, fontWeight: 600}}>22 Harbour Row, Port Mason</div>
					<div style={{fontSize: 24, color: '#5a6a7e', fontWeight: 700, marginTop: 18}}>4. LICENCE NO.</div>
					<div style={{fontSize: 34, fontWeight: 700, fontFamily: FONT.mono}}>CLARK-940314-D7</div>
				</div>
				<div style={{position: 'absolute', right: 60, bottom: 50, width: 150, height: 150, borderRadius: 75, background: 'conic-gradient(from 0deg, #f9c, #9cf, #cf9, #fc9, #f9c)', opacity: 0.35}} />
				<div style={{position: 'absolute', left: 50, bottom: 40, fontFamily: FONT.hand, fontSize: 52, color: '#22344d'}}>{erase > 0.5 ? '' : 'D. Clarke'}</div>
			</div>
		</AbsoluteFill>
	);
};

export const DeparturesBoard: React.FC<{f: number}> = ({f}) => {
	const rows = [
		['21:05', 'PORT MASON', 'NORTH STAR 5', 'DEPARTED'],
		['22:15', 'GULL POINT', 'SKUA', 'DEPARTED'],
		['23:28', 'PORT MASON', 'NORTH STAR 8', Math.floor(f / 20) % 2 ? 'DEPARTED' : 'DEPARTED'],
		['—', 'NO FURTHER SAILINGS TONIGHT', '', ''],
	];
	return (
		<AbsoluteFill style={{background: '#0a0a0c', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: 1650, background: '#111', border: '14px solid #2a2a2e', borderRadius: 14, padding: 30, fontFamily: FONT.mono}}>
				<div style={{color: '#ffcc33', fontSize: 40, letterSpacing: 6, marginBottom: 20}}>BELL ISLAND · DEPARTURES</div>
				{rows.map((r, i) => (
					<div key={i} style={{display: 'grid', gridTemplateColumns: '180px 1fr 380px 280px', padding: '14px 0', borderTop: '2px solid #222', fontSize: 46, color: i === 2 ? '#ffe680' : '#ffcc33', background: i === 2 ? 'rgba(255,204,51,0.08)' : undefined}}>
						<div>{r[0]}</div>
						<div>{r[1]}</div>
						<div>{r[2]}</div>
						<div style={{color: '#7fe07f'}}>{r[3]}</div>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

/** Boarding-gate counter. Briefly flashes 63 (an easter egg) when `ghostAt` is hit. */
export const GateCounter: React.FC<{f: number; passengers: number; crew?: number; ghostAt?: number}> = ({f, passengers, crew = 6, ghostAt}) => {
	const ghost = ghostAt !== undefined && f >= ghostAt && f < ghostAt + 2;
	return (
		<AbsoluteFill style={{background: '#0c0e12', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono}}>
			<div style={{display: 'flex', gap: 60}}>
				{[
					['PASSENGERS', ghost ? '063' : String(passengers).padStart(3, '0')],
					['CREW', String(crew).padStart(3, '0')],
				].map(([k, v]) => (
					<div key={k} style={{background: '#050505', border: '10px solid #2b2f36', borderRadius: 16, padding: '30px 50px', textAlign: 'center'}}>
						<div style={{color: '#8a96a8', fontSize: 34, letterSpacing: 6, fontFamily: FONT.ui, fontWeight: 700}}>{k}</div>
						<div style={{color: '#ff4a3d', fontSize: 220, lineHeight: 1.1, textShadow: '0 0 30px rgba(255,60,40,0.6)'}}>{v}</div>
					</div>
				))}
			</div>
			<div style={{position: 'absolute', bottom: 60, color: '#59657a', fontSize: 28}}>NS8 BOARDING GATE · BELL ISLAND · 23:21</div>
		</AbsoluteFill>
	);
};

/** Schematic deck plan with compartments ticked off as they are searched. */
export const DeckPlan: React.FC<{f: number; progress: number}> = ({progress}) => {
	const rooms = [
		['REAR DECK', 120, 260, 260, 300],
		['WC', 400, 260, 120, 140],
		['STORAGE', 400, 420, 120, 140],
		['PASSENGER CABIN', 540, 260, 620, 300],
		['CAFE', 1180, 260, 200, 140],
		['CREW', 1180, 420, 200, 140],
		['BRIDGE', 1400, 260, 260, 300],
		['ENGINE ROOM', 540, 600, 620, 160],
		['CAR DECK', 120, 600, 400, 160],
		['LOCKERS', 1180, 600, 480, 160],
	] as const;
	return (
		<AbsoluteFill style={{background: '#0b1626', fontFamily: FONT.mono}}>
			<svg width={1920} height={1080}>
				{Array.from({length: 40}, (_, i) => (
					<line key={i} x1={i * 50} y1={0} x2={i * 50} y2={1080} stroke="#13253f" />
				))}
				<text x={120} y={160} fill="#9fc4ff" fontSize={40} fontFamily={FONT.ui} fontWeight={800}>
					NORTH STAR 8 · DECK PLAN · SEARCH LOG
				</text>
				<path d="M100,240 L1700,240 L1820,520 L1700,800 L100,800 Z" fill="none" stroke="#9fc4ff" strokeWidth={4} />
				{rooms.map(([name, x, y, w, h], i) => {
					const done = progress * rooms.length > i;
					return (
						<g key={name}>
							<rect x={x} y={y} width={w} height={h} fill={done ? 'rgba(60,240,138,0.12)' : 'rgba(159,196,255,0.05)'} stroke="#9fc4ff" strokeWidth={2} />
							<text x={x + 14} y={y + 34} fill="#cfe0f5" fontSize={22}>
								{name}
							</text>
							{done ? (
								<text x={x + w - 60} y={y + h - 20} fill="#3cf08a" fontSize={44} fontWeight={700}>
									✓
								</text>
							) : null}
						</g>
					);
				})}
				<text x={120} y={900} fill={progress >= 1 ? '#ffb02e' : '#7f97b6'} fontSize={36}>
					{progress >= 1 ? 'ALL COMPARTMENTS CLEAR · NO UNREGISTERED PERSON FOUND' : 'SEARCH IN PROGRESS…'}
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const WeatherPanel: React.FC<{f: number}> = () => (
	<div style={{fontFamily: FONT.mono, color: '#cfe0f5', background: '#0b1626', border: '6px solid #22324a', borderRadius: 12, padding: '24px 34px', fontSize: 34, lineHeight: 1.5}}>
		<div style={{color: '#7f97b6', fontSize: 24}}>CONDITIONS 23:28</div>
		<div>WIND 4 KN SW</div>
		<div>VIS 10 NM</div>
		<div>SEA STATE 1 · CALM</div>
	</div>
);
