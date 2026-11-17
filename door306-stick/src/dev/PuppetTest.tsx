// PUPPET TEST: ~30 s of scene 4 ("three very soft knocks" .. "Listen carefully") with the painted puppets,
// animated on the stick skeleton, on two low-quality painted plates.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import manifest from '../data/generated/audioManifest.json';
import {envelopeAt, visemeAt, wordsOf} from '../data/speech';
import {LINE_BY_ID} from '../data/voiceLines';
import {Harris, Sarah} from '../components/characters/Cast';
import {DoorOpen, Person, PlateShake} from '../stick/goat';
import {camOf, clamp01, lerp, ramp, Stage, walk, type SetId} from '../stick/kit';
import {FONT, loadAllFonts} from '../utils/fonts';

loadAllFonts();
const FPS = 24;
type Who = 'narrator' | 'harris' | 'sarah';
const SEQ: Array<{id: string; who: Who; gap: number}> = [
	{id: 'narrator_081_three_knocks', who: 'narrator', gap: 0.6},
	{id: 'narrator_082_froze', who: 'narrator', gap: 1.9},
	{id: 'harris_001_its_me', who: 'harris', gap: 0.7},
	{id: 'narrator_083_hesitated', who: 'narrator', gap: 0.6},
	{id: 'narrator_084_chain', who: 'narrator', gap: 1.0},
	{id: 'narrator_085_trembling', who: 'narrator', gap: 0.5},
	{id: 'sarah_002_whats_happening', who: 'sarah', gap: 0.4},
	{id: 'narrator_086_looked_staircase', who: 'narrator', gap: 0.5},
	{id: 'harris_002_listen_carefully', who: 'harris', gap: 0.45},
];
const FILES = (manifest as unknown as {files: Record<string, {duration: number}>}).files;
let acc = 0;
const LINES = SEQ.map((l) => {
	acc += l.gap;
	const d = FILES[`${l.who}/${l.id}.wav`].duration;
	const o = {...l, start: acc, end: acc + d};
	acc += d;
	return o;
});
export const PUPPET_TEST_FRAMES = Math.ceil((acc + 1.5) * FPS);
const L = Object.fromEntries(LINES.map((l) => [l.id, l]));
const word = (id: string, w: string) => {
	const hit = wordsOf(id).find((x) => x[0].toLowerCase().replace(/[^a-z']/g, '') === w);
	return L[id].start + (hit ? hit[1] : 0);
};
const talkOf = (who: Who, t: number) => {
	const tq = (Math.floor((t * FPS) / 2) * 2) / FPS;
	for (const l of LINES) {
		if (l.who !== who || tq < l.start || tq >= l.end) continue;
		const e = envelopeAt(l.id, tq - l.start) ?? 0;
		return {talk: e > 0.12 ? Math.min(1, e * 1.25) : 0, viseme: visemeAt(l.id, tq - l.start)};
	}
	return {talk: 0, viseme: 'm' as const};
};

// set geometry measured on the plates
const FLAT = {door: [1440, 250, 1700, 830] as const, floor: 960};
const HALL = {door: [740, 300, 1010, 822] as const, floor: 955};

const Subtitle: React.FC<{t: number}> = ({t}) => {
	const l = LINES.find((x) => t >= x.start && t < x.end + 0.25);
	if (!l) return null;
	const words = wordsOf(l.id);
	const chunks: Array<{a: number; s: string}> = [];
	let cur: Array<[string, number]> = [];
	const flush = () => {
		if (cur.length) chunks.push({a: cur[0][1], s: cur.map((x) => x[0]).join(' ')});
		cur = [];
	};
	words.forEach(([w, ws]) => {
		cur.push([w, ws]);
		if ((/[.!?]$/.test(w) && !/^(Mr|Mrs)\.$/.test(w)) || cur.length >= 8) flush();
	});
	flush();
	const c = [...chunks].reverse().find((x) => t - l.start >= x.a - 0.05) ?? chunks[0] ?? {s: LINE_BY_ID[l.id]?.text ?? ''};
	const name = l.who === 'narrator' ? null : l.who.toUpperCase();
	return (
		<div style={{position: 'absolute', bottom: 64, width: '100%', textAlign: 'center'}}>
			{name ? <div style={{display: 'inline-block', fontFamily: FONT.ui, fontWeight: 800, fontSize: 22, background: l.who === 'harris' ? '#d9b38c' : '#9fc79a', padding: '2px 12px', borderRadius: 6, marginBottom: 8}}>{name}</div> : null}
			<div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 56, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill'}}>{c.s}</div>
		</div>
	);
};

export const PuppetTest: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const t81 = L.narrator_081_three_knocks.start;
	const knocks = [word('narrator_081_three_knocks', 'knocks') + 0.15, word('narrator_081_three_knocks', 'knocks') + 0.55, word('narrator_081_three_knocks', 'knocks') + 0.95];
	const t82 = L.narrator_082_froze.start;
	const h1 = L.harris_001_its_me.start;
	const t83 = L.narrator_083_hesitated.start;
	const t84 = L.narrator_084_chain.start;
	const tOpen = word('narrator_084_chain', 'opened');
	const t85 = L.narrator_085_trembling.start;
	const s2 = L.sarah_002_whats_happening.start;
	const t86 = L.narrator_086_looked_staircase.start;
	const h2 = L.harris_002_listen_carefully.start;
	const sar = talkOf('sarah', t);
	const har = talkOf('harris', t);
	const knocking = knocks.some((k) => t >= k && t < k + 0.12);
	const frozen = t >= knocks[0];

	// Sarah: on the phone by the sofa; freezes; walks to the door; leans to the gap
	const sw = walk(t, t83 + 0.2, t84 + 1.0, 960, 1392, 1.6);
	const doorGap = ramp(t, tOpen, tOpen + 0.6);
	type Shot = {t: number; set: SetId; z: number; f: [number, number]};
	const shots: Shot[] = [
		{t: 0, set: 'flat_night', z: 1.0, f: [960, 540]},
		{t: t82, set: 'flat_night', z: 2.3, f: [960, 560]},
		{t: h1 - 0.2, set: 'flat_night', z: 1.7, f: [1450, 580]},
		{t: t83, set: 'flat_night', z: 1.15, f: [1250, 560]},
		{t: tOpen - 0.2, set: 'flat_night', z: 2.2, f: [1460, 560]},
		{t: t85, set: 'hallway_night', z: 1.25, f: [1000, 560]},
		{t: s2, set: 'hallway_night', z: 2.1, f: [1020, 560]},
		{t: t86, set: 'hallway_night', z: 1.15, f: [1200, 560]},
		{t: h2 - 0.15, set: 'hallway_night', z: 2.2, f: [1080, 560]},
	];
	let si = 0;
	for (let i = 0; i < shots.length; i++) if (t >= shots[i].t) si = i;
	const sh = shots[si];
	void camOf;
	const lookStairs = t >= t86 + 0.4 && t < h2 + 0.2;

	const world =
		sh.set === 'flat_night' ? (
			<g>
				<PlateShake plate="flat_night" x0={FLAT.door[0] - 10} y0={FLAT.door[1] - 10} x1={FLAT.door[2] + 10} y1={FLAT.door[3] + 10} k={knocking ? 0.5 : 0} frame={f} />
				{doorGap > 0 ? (
					<g>
						<rect x={FLAT.door[0] + 6} y={FLAT.door[1] + 6} width={34 * doorGap} height={FLAT.door[3] - FLAT.door[1] - 12} fill="#d9e2a0" opacity={0.75} />
						<path d={`M${FLAT.door[0] + 4},${490} q${18 * doorGap},12 ${34 * doorGap},0`} fill="none" stroke="#c9c9c9" strokeWidth={4} />
					</g>
				) : null}
				<Person
					is={Sarah}
					name="sarah"
					x={sw.x}
					y={FLAT.floor}
					s={1.6}
					frame={f}
					{...(sw.moving ? {pose: 'walk', turn: 0.8, phase: sw.phase} : {turn: t >= t84 + 1 ? 0.6 : 0})}
					prop={t < t82 + 1.2 ? 'phone' : 'none'}
					propGlow="#9fc3ff"
					arms={t < t82 + 1.2 ? 'phoneEar' : t >= tOpen ? {l: [8, 4], r: [24, -14]} : 'down'}
					look={t < knocks[0] ? [0.3, 0.6] : [1, -0.1]}
					eyes={frozen ? 'wide' : 'dot'}
					brows={frozen ? 'worried' : 'none'}
					mouth={frozen ? 'o' : 'flat'}
					lean={t >= tOpen ? 6 : 0}
					shiver={frozen && t < t83 ? 0.8 : 0}
				/>
			</g>
		) : (
			<g>
				<rect x={HALL.door[0] + 8} y={HALL.door[1] + 8} width={30} height={HALL.door[3] - HALL.door[1] - 16} fill="#0b0d14" />
				<path d={`M${HALL.door[0] + 8},${560} q15,12 30,0`} fill="none" stroke="#c9c9c9" strokeWidth={4} />
				{/* her eye in the gap */}
				<circle cx={HALL.door[0] + 24} cy={505} r={5} fill="#fff" opacity={0.85} />
				<circle cx={HALL.door[0] + 25} cy={505} r={2.6} fill="#111" />
				<Person
					is={Harris}
					name="harris"
					x={HALL.door[0] + 330}
					y={HALL.floor + 25}
					s={1.6}
					frame={f}
					shiver={1.0}
					turn={lookStairs ? 0.7 : -0.25}
					look={lookStairs ? [1, 0] : [-1, 0]}
					eyes="wide"
					brows="worried"
					arms={t >= h2 + 0.3 && t < h2 + 2.6 ? 'fingerLips' : 'down'}
					mouth={har.talk > 0 ? 'open' : 'frown'}
					talk={har.talk}
					viseme={har.viseme}
					pale={0.25}
				/>
			</g>
		);
	const fadeIn = clamp01(t / 0.5);
	const fadeOut = 1 - clamp01((t - (PUPPET_TEST_FRAMES / FPS - 1)) / 0.9);
	void sar;
	void lerp;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
				<Stage set={sh.set} z={sh.z} f={sh.f} t={t} light={sh.set === 'flat_night' ? 'night' : 'day'}>
					{world}
				</Stage>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
			</AbsoluteFill>
			<Subtitle t={t} />
			<Audio src={staticFile('audio/sfx/apartment_tone.wav')} volume={0.18} />
			{knocks.map((k, i) => (
				<Sequence key={i} from={Math.round(k * FPS)}>
					<Audio src={staticFile('audio/sfx/knock_soft.wav')} volume={0.6} endAt={12} />
				</Sequence>
			))}
			<Sequence from={Math.round((tOpen - 0.4) * FPS)}>
				<Audio src={staticFile('audio/sfx/chain_slide.wav')} volume={0.5} />
			</Sequence>
			<Sequence from={Math.round(tOpen * FPS)}>
				<Audio src={staticFile('audio/sfx/door_latch.wav')} volume={0.45} />
			</Sequence>
			{LINES.map((l) => (
				<Sequence key={l.id} from={Math.round(l.start * FPS)}>
					<Audio src={staticFile(`audio/${l.who}/${l.id}.wav`)} volume={l.who === 'harris' ? 0.85 : 1} />
				</Sequence>
			))}
			{void t81}
		</AbsoluteFill>
	);
};
