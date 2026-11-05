// <PassengerManifest/> - North Star Ferries' (fictional) manifest system.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../utils/anim';
import {FONT} from '../../utils/fonts';
import {h01, h1} from '../../utils/rough';

const FIRST = ['Aaron', 'Abigail', 'Adam', 'Alice', 'Amir', 'Anna', 'Ben', 'Beth', 'Callum', 'Chloe', 'Connor', 'Dana', 'David', 'Eli', 'Ella', 'Farah', 'Fiona', 'George', 'Grace', 'Hannah', 'Harry', 'Imran', 'Isla', 'Jack', 'Jade', 'James', 'Jenny', 'Joel', 'Karen', 'Kofi', 'Laura', 'Leo', 'Lily', 'Lucy', 'Mark', 'Maya', 'Michael', 'Mia', 'Nadia', 'Nathan', 'Nina', 'Oliver', 'Olivia', 'Omar', 'Paul', 'Priya', 'Rachel', 'Ryan', 'Sam', 'Sophie', 'Tom', 'Tara', 'Victor', 'Will', 'Yusuf', 'Zoe'];
const LAST = ['Adams', 'Baker', 'Bell', 'Brooks', 'Carter', 'Chen', 'Cole', 'Davies', 'Doyle', 'Evans', 'Fisher', 'Foster', 'Grant', 'Gray', 'Hall', 'Hughes', 'Hunt', 'Iqbal', 'Jones', 'Kaur', 'Kelly', 'Lewis', 'Lowe', 'Marsh', 'Mason', 'Moore', 'Nash', 'Novak', 'Owens', 'Patel', 'Price', 'Quinn', 'Reid', 'Rhodes', 'Shaw', 'Silva', 'Stone', 'Turner', 'Walsh', 'Ward', 'Webb', 'Wells', 'Young'];

/** The 62 names of the 11:28 PM sailing. #36 Sarah Mills, #37 Daniel Clarke, #38 Emma Clarke. */
export const MANIFEST_NAMES: string[] = Array.from({length: 62}, (_, i) => {
	const n = i + 1;
	if (n === 36) return 'Sarah Mills';
	if (n === 37) return 'Daniel Clarke';
	if (n === 38) return 'Emma Clarke';
	return `${FIRST[Math.floor(h01(n, 1) * FIRST.length)]} ${LAST[Math.floor(h01(n, 2) * LAST.length)]}`;
});

const seatFor = (name: string, n: number) => {
	if (name === 'Daniel Clarke') return '18B';
	if (name === 'Emma Clarke') return '18A';
	if (name === 'Sarah Mills') return '17F';
	const row = 5 + Math.floor(h01(n, 7) * 18);
	return `${row}${'ABCDEF'[Math.floor(h01(n, 8) * 6)]}`;
};

export interface ManifestRow {
	n: number;
	name: string;
	seat: string;
	ticket: string;
	type: string;
	status: string;
}

export const manifestRows = (erased: boolean): ManifestRow[] => {
	const names = erased ? MANIFEST_NAMES.filter((x) => x !== 'Daniel Clarke') : MANIFEST_NAMES;
	return names.map((name, i) => {
		const orig = MANIFEST_NAMES.indexOf(name) + 1;
		return {
			n: i + 1,
			name,
			seat: seatFor(name, orig),
			ticket: `NS8-${(48213 + orig * 37).toString().padStart(6, '0')}`,
			type: h01(orig, 3) > 0.8 ? 'CHILD' : h01(orig, 4) > 0.85 ? 'CONCESSION' : 'ADULT',
			status: 'BOARDED',
		};
	});
};

export const PassengerManifest: React.FC<{
	f: number;
	erased?: boolean;
	/** frame at which the list refreshes from full to erased */
	refreshAt?: number;
	countLabel?: string;
	highlight?: string;
	/** first visible row (fractional for smooth scroll) */
	scroll?: number;
	visibleRows?: number;
	zoom?: number;
	device?: 'desktop' | 'tablet';
	glitch?: boolean;
	ghost63?: boolean;
	focusY?: number;
}> = ({f, erased = false, refreshAt, countLabel, highlight, scroll = 0, visibleRows = 12, zoom = 1, device = 'desktop', glitch = false, ghost63 = false, focusY = 540}) => {
	const refreshing = refreshAt !== undefined && f >= refreshAt - 14 && f < refreshAt;
	const isErased = erased || (refreshAt !== undefined && f >= refreshAt);
	const rows = manifestRows(isErased);
	const count = countLabel ?? `${rows.length}`;
	const start = Math.max(0, Math.floor(scroll));
	const sub = scroll - start;
	const shown = rows.slice(start, start + visibleRows + 1);
	const rowH = 58;
	const g = glitch && h01(f, 9) > 0.55;
	return (
		<AbsoluteFill style={{background: device === 'tablet' ? '#11151c' : '#0d1117', alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					width: device === 'tablet' ? 1500 : 1780,
					height: device === 'tablet' ? 930 : 1000,
					background: '#f5f7fa',
					borderRadius: device === 'tablet' ? 36 : 8,
					border: device === 'tablet' ? '26px solid #1c1f25' : '2px solid #2a313c',
					overflow: 'hidden',
					fontFamily: FONT.ui,
					transform: `scale(${zoom})`,
					transformOrigin: `50% ${focusY}px`,
					position: 'relative',
					boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
					filter: g ? 'hue-rotate(40deg) saturate(2)' : undefined,
				}}
			>
				<div style={{background: '#0f2c57', color: '#fff', padding: '20px 34px', display: 'flex', alignItems: 'center', gap: 22}}>
					<svg width={46} height={46} viewBox="0 0 46 46">
						<polygon points="23,2 28,18 45,18 31,28 36,44 23,34 10,44 15,28 1,18 18,18" fill="#e8c547" />
					</svg>
					<div style={{fontWeight: 800, fontSize: 30, letterSpacing: 1}}>NORTH STAR FERRIES</div>
					<div style={{opacity: 0.75, fontSize: 24}}>Passenger Manifest System</div>
					<div style={{marginLeft: 'auto', fontFamily: FONT.mono, fontSize: 22, opacity: 0.85}}>v4.2.1 · CREW TERMINAL 02</div>
				</div>
				<div style={{display: 'flex', alignItems: 'center', padding: '18px 34px', borderBottom: '2px solid #d9dee6', gap: 40, background: '#fff'}}>
					<div>
						<div style={{fontSize: 18, color: '#68768a', fontWeight: 600}}>SAILING</div>
						<div style={{fontSize: 28, fontWeight: 700, color: '#111b2a'}}>NS8-2328 · Bell Island → Port Mason</div>
					</div>
					<div>
						<div style={{fontSize: 18, color: '#68768a', fontWeight: 600}}>DEPARTED</div>
						<div style={{fontSize: 28, fontWeight: 700, color: '#111b2a', fontFamily: FONT.mono}}>23:28</div>
					</div>
					<div style={{marginLeft: 'auto', textAlign: 'right'}}>
						<div style={{fontSize: 18, color: '#68768a', fontWeight: 600}}>PASSENGERS</div>
						<div style={{fontSize: 54, fontWeight: 800, color: isErased ? '#b3261e' : '#111b2a', fontFamily: FONT.mono, lineHeight: 1}}>
							{ghost63 && h01(Math.floor(f / 2), 63) > 0.93 ? '63' : count}
						</div>
					</div>
					<div style={{padding: '12px 20px', background: refreshing ? '#d9e6f7' : '#e8eef6', borderRadius: 10, fontWeight: 700, color: '#0f2c57', fontSize: 22, display: 'flex', alignItems: 'center', gap: 10}}>
						<span style={{display: 'inline-block', transform: `rotate(${refreshing ? f * 30 : 0}deg)`}}>⟳</span> REFRESH
					</div>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: '90px 1fr 140px 260px 200px 200px', padding: '12px 34px', fontSize: 19, fontWeight: 700, color: '#68768a', letterSpacing: 1, borderBottom: '2px solid #e3e7ee'}}>
					<div>#</div>
					<div>PASSENGER</div>
					<div>SEAT</div>
					<div>TICKET</div>
					<div>TYPE</div>
					<div>STATUS</div>
				</div>
				<div style={{position: 'relative', height: rowH * visibleRows, overflow: 'hidden'}}>
					{refreshing ? (
						<div style={{position: 'absolute', inset: 0, background: 'rgba(245,247,250,0.85)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#0f2c57', fontWeight: 700}}>
							Refreshing manifest…
						</div>
					) : null}
					<div style={{transform: `translateY(${-sub * rowH}px)`}}>
						{shown.map((r) => {
							const hl = highlight && r.name === highlight;
							const jit = g ? h1(f, r.n) * 14 : 0;
							return (
								<div
									key={`${r.n}-${r.name}`}
									style={{
										display: 'grid',
										gridTemplateColumns: '90px 1fr 140px 260px 200px 200px',
										padding: '0 34px',
										height: rowH,
										alignItems: 'center',
										fontSize: 26,
										color: '#1b2533',
										background: hl ? '#fff2b8' : r.n % 2 ? '#ffffff' : '#f3f6fa',
										borderBottom: '1px solid #e6eaf0',
										fontWeight: hl ? 700 : 500,
										transform: `translateX(${jit}px)`,
									}}
								>
									<div style={{fontFamily: FONT.mono}}>{r.n}</div>
									<div>{r.name}</div>
									<div style={{fontFamily: FONT.mono}}>{r.seat}</div>
									<div style={{fontFamily: FONT.mono, fontSize: 22}}>{r.ticket}</div>
									<div style={{fontSize: 20, color: '#55627a'}}>{r.type}</div>
									<div style={{fontSize: 20, color: '#1f7a3e', fontWeight: 700}}>● {r.status}</div>
								</div>
							);
						})}
					</div>
				</div>
				<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 34px', background: '#eef2f7', fontSize: 20, color: '#55627a', display: 'flex', justifyContent: 'space-between'}}>
					<span>Crew 6 · Vehicles 0 · Capacity 240</span>
					<span style={{fontFamily: FONT.mono}}>LAST SYNC {isErased ? '00:31:52' : '00:16:40'}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Single passenger record card (age, travelling with...). */
export const PassengerRecord: React.FC<{f: number; status?: string}> = ({f, status = 'ON BOARD'}) => {
	const o = clamp(f / 6);
	return (
		<AbsoluteFill style={{background: '#0d1117', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: 1300, background: '#fff', borderRadius: 12, overflow: 'hidden', fontFamily: FONT.ui, opacity: o, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
				<div style={{background: '#0f2c57', color: '#fff', padding: '22px 36px', fontSize: 28, fontWeight: 800}}>PASSENGER RECORD · 37 of 62</div>
				<div style={{padding: '36px 40px', display: 'grid', gridTemplateColumns: '260px 1fr', rowGap: 26, fontSize: 36, color: '#1b2533'}}>
					<div style={{color: '#68768a', fontSize: 26, fontWeight: 600}}>NAME</div>
					<div style={{fontWeight: 800}}>DANIEL CLARKE</div>
					<div style={{color: '#68768a', fontSize: 26, fontWeight: 600}}>SEAT</div>
					<div style={{fontFamily: FONT.mono}}>18B</div>
					<div style={{color: '#68768a', fontSize: 26, fontWeight: 600}}>AGE</div>
					<div>32</div>
					<div style={{color: '#68768a', fontSize: 26, fontWeight: 600}}>TRAVELLING WITH</div>
					<div>EMMA CLARKE (#38, spouse)</div>
					<div style={{color: '#68768a', fontSize: 26, fontWeight: 600}}>STATUS</div>
					<div style={{color: '#1f7a3e', fontWeight: 800}}>● {status}</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
