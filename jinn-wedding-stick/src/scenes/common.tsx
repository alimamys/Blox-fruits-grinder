// Shared set-ups of "The Jinn Wedding": the majlis (Yadda and the girl on the low sofa), Noura's band drumming on the
// floor, the crowd of wedding guests, the title card, the crime magazine page and the sand close-up.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Band1, Band2, Drummer, Girl, Guest, Noura, Yadda} from '../components/characters/Cast';
import type {ArmSpec} from '../components/characters/StickPerson';
import {Person} from '../stick/goat';
import {clamp01, GEO} from '../stick/kit';
import {Smoke} from '../stick/props';
import {FONT} from '../utils/fonts';
import {boilOf, wobLine} from '../utils/rough';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PP = Record<string, any>;

/** the wedding groove (matches drums_wedding.wav): 100 BPM, eighths of 0.3 s */
export const BEAT = 0.3;
/** 0..1 drum stroke envelope on the band's beat (a sharp hit, quick release) */
export const stroke = (t: number, off = 0) => {
	const ph = ((t + off) / BEAT) % 1;
	return Math.max(0, 1 - ph * 3.2);
};

/** arms beating a frame drum held up in front of the chest: the left hand holds the rim, the right hand strikes */
export const tarArms = (t: number, off = 0, play = 1): ArmSpec => {
	const h = stroke(t, off) * play;
	return {l: [22, -105], r: [34 + 26 * h, -70 - 40 * h]};
};
/** arms on the tabl (barrel drum across the lap): both hands, alternating */
export const tablArms = (t: number, off = 0, play = 1): ArmSpec => {
	const a = stroke(t, off) * play;
	const b = stroke(t, off + BEAT / 2) * play;
	return {l: [24 + 18 * a, -100 + 20 * a], r: [24 + 18 * b, -100 + 20 * b]};
};
/** clapping hands: the hands meet in front of the chest on the clap, part a little in between */
export const clapArms = (t: number, off = 0): ArmSpec => {
	const h = Math.max(0, Math.cos(((t + off) / (BEAT * 4)) * Math.PI * 2));
	const open = 1 - Math.pow(h, 6);
	return {l: [25 + 20 * open, -141 - 24 * open], r: [25 + 20 * open, -141 - 24 * open]};
};

// ---------------------------------------------------------------------------------------------------- the majlis
export const MAJ = {yadda: {x: 470, y: 905, s: 2.0}, girl: {x: 780, y: 880, s: 2.3}};

/** Yadda and the girl on the majlis sofa, incense curling up on the left */
export const MajlisPeople: React.FC<{f: number; t: number; y?: PP; g?: PP; smoke?: number}> = ({f, t, y = {}, g = {}, smoke = 1}) => (
	<g>
		<Smoke x={GEO.majlis.incense[0]} y={GEO.majlis.incense[1]} t={t} k={smoke} h={420} />
		<Person is={Yadda} name="yadda" x={MAJ.yadda.x} y={MAJ.yadda.y} s={MAJ.yadda.s} pose="sit" frame={f} look={[1, 0]} edge {...y} />
		<Person is={Girl} name="girl" x={MAJ.girl.x} y={MAJ.girl.y} s={MAJ.girl.s} child pose="sit" frame={f} look={[-1, 0]} edge {...g} />
	</g>
);

// ---------------------------------------------------------------------------------------------------- the band
/** Noura's band sitting on the floor in a row, drumming (play 0..1); `nouraP`/`drummerP` override those two */
export const Band: React.FC<{f: number; t: number; x0: number; y: number; s: number; gap?: number; play?: number; nouraP?: PP; drummerP?: PP; othersP?: PP}> = ({
	f,
	t,
	x0,
	y,
	s,
	gap = 150,
	play = 1,
	nouraP = {},
	drummerP = {},
	othersP = {},
}) => (
	<g>
		<Person is={Band1} name="band1" x={x0} y={y} s={s} pose="floor" frame={f} prop="tabl" arms={tablArms(t, 0.0, play)} look={[0.6, 0]} overlapOk {...othersP} />
		<Person is={Noura} name="noura" x={x0 + gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.05, play)} look={[0.4, 0]} overlapOk {...nouraP} />
		<Person is={Drummer} name="drummer" x={x0 + 2 * gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.12, play)} look={[-0.3, 0]} overlapOk {...drummerP} />
		<Person is={Band2} name="band2" x={x0 + 3 * gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.2, play)} look={[-0.5, 0]} overlapOk {...othersP} />
	</g>
);

// ---------------------------------------------------------------------------------------------------- the guests
export type GuestMode = 'stand' | 'dance' | 'clap' | 'freeze';
/** where the guests stand in the gold hall: three rows getting nearer (and bigger) */
export const GUEST_SPOTS: Array<{x: number; y: number; s: number}> = [
	// an aisle is left open down the middle, so the bride on her chair can be seen from the doors
	...[570, 700, 1150, 1280].map((x) => ({x, y: 900, s: 1.0})),
	...[540, 700, 1170, 1330].map((x) => ({x, y: 975, s: 1.2})),
	...[770, 1150, 1400, 1640].map((x) => ({x, y: 1058, s: 1.45})),
];
/** the crowd of guests: dancing (swaying, hair swinging, arms up), clapping in perfect unison, or frozen; hooves and
 *  glowing eyes when asked */
export const Guests: React.FC<{f: number; t: number; mode: GuestMode; hooves?: boolean; hemLift?: number; glow?: boolean; look?: [number, number]; spots?: typeof GUEST_SPOTS; unison?: boolean; eyesOnly?: boolean; bg?: boolean}> = ({
	f,
	t,
	mode,
	hooves = false,
	hemLift = 0,
	glow = false,
	look,
	spots = GUEST_SPOTS,
	unison = true,
	eyesOnly = false,
	bg = false,
}) => (
	<g>
		{spots.map((p, n) => {
			const off = unison ? 0 : n * 0.07;
			const sway = mode === 'dance' ? Math.sin((t + off) * Math.PI * 2 * 0.83 + (unison ? 0 : n)) : 0;
			const arms: ArmSpec | 'armsUp' | 'down' =
				mode === 'clap' ? clapArms(t, off) : mode === 'dance' ? {l: [120 + 30 * sway, 10], r: [120 - 30 * sway, 10]} : 'down';
			return (
				<Person
					key={n}
					is={Guest}
					n={n}
					name={`guest${n}`}
					x={p.x + sway * 12 * p.s}
					y={p.y}
					s={p.s}
					frame={f}
					lean={sway * 7}
					tilt={sway * 8}
					arms={arms}
					hooves={hooves}
					hemLift={hemLift * (0.6 + 0.4 * Math.abs(sway))}
					eyes={glow ? 'glow' : 'dot'}
					look={look ?? [0, 0]}
					mouth="smile"
					idle={mode !== 'freeze'}
					overlapOk
					small={p.s < 1.2}
					eyesOnly={eyesOnly}
					noqa={eyesOnly || bg}
					edge
				/>
			);
		})}
	</g>
);

// ---------------------------------------------------------------------------------------------------- title
/** THE JINN WEDDING - عرس الجن, white on black, the incense smoke drifting through */
export const TitleCard: React.FC<{f: number; d: number}> = ({f, d}) => {
	const o = clamp01((f - 3) / 10) * clamp01((d - f) / 10);
	const t = f / 24;
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
				<Smoke x={760} y={1080} h={900} t={t} k={0.7} color="#c9c0dc" />
				<Smoke x={1180} y={1080} h={900} t={t + 3} k={0.6} color="#c9c0dc" />
			</svg>
			<div style={{opacity: o, textAlign: 'center', color: '#efe7d6'}}>
				<div style={{fontFamily: FONT.marker, fontSize: 150, letterSpacing: 8, textShadow: '0 8px 0 #000, 0 0 40px rgba(255,220,150,0.18)'}}>THE JINN WEDDING</div>
				<div style={{fontFamily: '"DejaVu Sans", "FreeSerif", sans-serif', fontSize: 84, marginTop: 6, color: '#d9b24a', direction: 'rtl'}}>عرس الجن</div>
				<div style={{fontFamily: FONT.ui, fontSize: 30, letterSpacing: 14, color: '#9a958a', marginTop: 18}}>A KUWAITI LEGEND</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------------------------------- the magazine
/** an old 1997 crime magazine page telling the story, the singer's name never printed */
export const MagazinePage: React.FC<{f: number; d: number}> = ({f, d}) => {
	const z = 1 + 0.06 * (f / Math.max(1, d));
	const sd = 6100 + boilOf(f, 4) * 7;
	return (
		<AbsoluteFill style={{background: '#151110', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
			<div
				style={{
					width: 1060,
					height: 980,
					background: 'linear-gradient(180deg, #efe6cf 0%, #e3d6b4 100%)',
					border: '6px solid #141414',
					borderRadius: 6,
					transform: `rotate(-3deg) scale(${z})`,
					padding: '40px 56px',
					position: 'relative',
					boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
					color: '#1c1a18',
				}}
			>
				<div style={{fontFamily: FONT.type, fontSize: 28, letterSpacing: 6, borderBottom: '4px solid #1c1a18', paddingBottom: 8}}>CRIME &amp; MYSTERY - 1997</div>
				<div style={{fontFamily: FONT.marker, fontSize: 70, lineHeight: '80px', marginTop: 22, color: '#8a1c18'}}>THE WEDDING IN THE HOUSE THAT ISN'T THERE</div>
				<svg viewBox="0 0 900 300" width={900} height={300} style={{marginTop: 18, border: '4px solid #1c1a18', background: '#9a9488'}}>
					<rect x={0} y={220} width={900} height={80} fill="#b0a68a" />
					<path d={`M240,230 L240,90 L660,90 L660,230 Z`} fill="#3a3632" stroke="#141414" strokeWidth={5} />
					{[290, 390, 510, 610].map((x) => (
						<rect key={x} x={x - 22} y={120} width={44} height={50} fill="#111" />
					))}
					<path d={wobLine(560, 90, 640, 60, sd, 1)} stroke="#141414" strokeWidth={5} />
				</svg>
				<div style={{fontFamily: FONT.type, fontSize: 25, lineHeight: '36px', marginTop: 20}}>
					A well-known wedding singer and her band say they played all night at a wedding in Sabahiya. In the morning, the house was a
					burned-out ruin. The singer has asked us not to print her name.
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------------------------------- the sand
/** the sand at dawn, close: the band's four trails of footprints walking away - and, all around them, hundreds of small
 *  cloven hoofprints (k 0..1: how many have been seen so far) */
export const SandClose: React.FC<{f: number; d: number; k: number}> = ({f, k}) => {
	const r = (i: number, j: number) => {
		const v = Math.sin(i * 127.1 + j * 311.7 + 74.7) * 43758.5453;
		return v - Math.floor(v);
	};
	const z = 1 + 0.05 * (f / 240);
	// four trails from the bottom left toward the top right
	const steps: Array<{x: number; y: number; a: number; side: number}> = [];
	for (let w = 0; w < 4; w++) {
		for (let i = 0; i < 9; i++) {
			const u = i / 8;
			const x = 260 + w * 150 + u * 1150 + Math.sin(u * 3 + w) * 30;
			const y = 1040 - u * 900 + w * 22;
			steps.push({x: x + (i % 2 ? 18 : -18), y, a: -38, side: i % 2});
		}
	}
	const nH = Math.round(320 * k);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #d8c7a2 0%, #c9b690 55%, #8f7f62 100%)', overflow: 'hidden'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{transform: `scale(${z})`}}>
				{Array.from({length: 46}, (_, i) => (
					<path key={i} d={`M${(i * 211) % 1920},${(i * 97) % 1080} q40,-10 80,0`} stroke="#b9a67f" strokeWidth={3} fill="none" opacity={0.55} />
				))}
				{steps.map((p, i) => (
					<g key={`f${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
						<ellipse cx={0} cy={-14} rx={17} ry={22} fill="#9a8664" />
						<ellipse cx={0} cy={22} rx={13} ry={14} fill="#9a8664" />
						<ellipse cx={-2} cy={-16} rx={14} ry={18} fill="#8a7656" />
						<ellipse cx={-2} cy={20} rx={10} ry={11} fill="#8a7656" />
					</g>
				))}
				{Array.from({length: nH}, (_, i) => {
					const x = 60 + 1800 * r(i, 1);
					const y = 50 + 980 * r(i, 2);
					const a = -60 + 120 * r(i, 3);
					const sc = 0.8 + 0.5 * r(i, 4);
					return (
						<g key={`h${i}`} transform={`translate(${x} ${y}) rotate(${a}) scale(${sc})`}>
							{[-1, 1].map((sg) => (
								<path key={sg} d={`M${sg * 3},10 C${sg * 3},-4 ${sg * 6},-14 ${sg * 11},-15 C${sg * 17},-12 ${sg * 16},4 ${sg * 13},11 Z`} fill="#4e3d2a" stroke="#c9b58c" strokeWidth={2} />
							))}
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
