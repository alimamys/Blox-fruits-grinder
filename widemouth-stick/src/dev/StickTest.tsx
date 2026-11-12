// STYLE TEST for the stick-figure "Mr. Widemouth": ~40 s of the first meeting, fully animated in code on one
// repainted background plate (public/plates/bedroom_night_g2_low.jpg). One continuous little world; the
// "shots" are only camera framings on it, so every cut matches.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import manifest from '../data/generated/audioManifest.json';
import {envelopeAt, visemeAt, wordsOf} from '../data/speech';
import {LINE_BY_ID} from '../data/voiceLines';
import {Eli} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {FONT, loadAllFonts} from '../utils/fonts';

loadAllFonts();
const FPS = 24;
const PLATE = 'plates/bedroom_night_g2_low.jpg';

type Who = 'narrator' | 'widemouth' | 'eli';
const SEQ: Array<{id: string; who: Who; gap: number}> = [
	{id: 'narrator_021_first_time', who: 'narrator', gap: 0.8},
	{id: 'widemouth_001_call_me', who: 'widemouth', gap: 0.35},
	{id: 'narrator_022_suited', who: 'narrator', gap: 0.4},
	{id: 'narrator_023_size_of_cat', who: 'narrator', gap: 0.35},
	{id: 'narrator_024_mouth', who: 'narrator', gap: 0.25},
	{id: 'eli_001_a_toy', who: 'eli', gap: 0.45},
	{id: 'widemouth_002_friend', who: 'widemouth', gap: 0.45},
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
export const STICK_TEST_FRAMES = Math.ceil((acc + 1.8) * FPS);
const L = Object.fromEntries(LINES.map((l) => [l.id, l]));
/** time (s) of a word inside a line */
const wordAt = (id: string, word: string, fallback = 0) => {
	const w = wordsOf(id).find((x) => x[0].toLowerCase().replace(/[^a-z]/g, '') === word);
	return L[id].start + (w ? w[1] : fallback);
};

// ---------------------------------------------------------------- helpers
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const ramp = (t: number, a: number, b: number) => smooth(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** mouth opening for whoever is speaking now, on twos like hand-drawn animation */
const talkOf = (who: Who, t: number) => {
	const tq = (Math.floor((t * FPS) / 2) * 2) / FPS;
	for (const l of LINES) {
		if (l.who !== who || tq < l.start || tq >= l.end) continue;
		const e = envelopeAt(l.id, tq - l.start) ?? 0;
		return {talk: e > 0.12 ? Math.min(1, e * 1.25) : 0, viseme: visemeAt(l.id, tq - l.start)};
	}
	return {talk: 0, viseme: 'm' as const};
};

// ---------------------------------------------------------------- the set (measured on the plate)
const BED = {skirtTop: 705, skirtBottom: 872, gapBottom: 895, liftX0: 560, liftX1: 770};
const ELI = {x: 335, y: 742, s: 1.9};
const WM_S = 0.9;
const FLOOR_Y = 962;

// the action, in seconds
const T = {
	rustle: 1.1,
	lift: 2.1,
	eyes: 2.5,
	out: 3.4,
	scurry: 4.0,
	stop: 6.0,
	drop: 3.95,
};

const NightTint: React.FC<{children: React.ReactNode; k?: number}> = ({children}) => <g filter="url(#night)">{children}</g>;

/** The whole little world at time t (seconds). */
const World: React.FC<{t: number; f: number}> = ({t, f}) => {
	// --- the bed skirt: a little rustle, then it is pushed up from beneath in an arch, then drops and swings
	const rustle = t > T.rustle && t < T.rustle + 0.7 ? Math.abs(Math.sin((t - T.rustle) * 22)) * 14 * (1 - (t - T.rustle) / 0.7) : 0;
	const peekLift = ramp(t, T.lift, T.lift + 0.3) * 62;
	const pushLift = ramp(t, T.out - 0.15, T.out + 0.2) * 105;
	const dropK = ramp(t, T.drop, T.drop + 0.14);
	const swingT = t - (T.drop + 0.14);
	const swing = swingT > 0 ? Math.max(0, Math.sin(swingT * 15)) * Math.exp(-swingT * 3.5) * 22 : 0;
	const archH = (rustle + peekLift + pushLift) * (1 - dropK) + swing;
	const ax0 = BED.liftX0, ax1 = BED.liftX1, axc = (BED.liftX0 + BED.liftX1) / 2, hem = BED.skirtBottom;
	const holeD = `M${ax0},${BED.gapBottom + 2} L${ax0},${hem} Q${axc},${hem - 2 * archH} ${ax1},${hem} L${ax1},${BED.gapBottom + 2} Z`;
	const hemD = `M${ax0 - 8},${hem + 1} Q${axc},${hem - 2 * archH} ${ax1 + 8},${hem + 1}`;

	// --- Mr. Widemouth's path: under the bed -> steps out -> scurries to the middle of the room
	const outK = ramp(t, T.out, T.out + 0.5);
	const crouch = 118 * (1 - ramp(t, T.out - 0.1, T.out + 0.35));
	const walkK = clamp01((t - T.scurry) / (T.stop - T.scurry));
	const wmX = lerp(665, 1290, walkK);
	const wmY = lerp(BED.gapBottom - 22, FLOOR_Y, outK) + crouch;
	const walking = t > T.scurry && t < T.stop;
	const phase = (wmX - 665) / (14 * WM_S);
	const wmVisible = t > T.lift + 0.15;
	const underBed = outK < 0.5;
	const wmLight = lerp(0.18, 1, ramp(t, T.out, T.out + 0.45));
	const wmScale = WM_S * lerp(0.94, 1, outK);
	const wmTalk = talkOf('widemouth', t);
	const waving = t > L.widemouth_001_call_me.start + 0.2 && t < L.widemouth_001_call_me.end - 0.3;
	const grin = t > wordAt('narrator_024_mouth', 'biggest', 2) ? 1 : 0;
	const lateSmile = t > wordAt('widemouth_002_friend', 'can', 3.6) + 0.25;
	const wmMouth = grin && t < L.eli_001_a_toy.start ? 'grin' : lateSmile ? 'grin' : 'smile';
	const lookAtEli: [number, number] = [-0.9, -0.2];
	const wmLook: [number, number] = t < T.stop ? [0.6, 0] : t < L.narrator_024_mouth.start ? lookAtEli : t < L.eli_001_a_toy.start ? [0, 0.2] : lookAtEli;
	const wmTilt = t > L.eli_001_a_toy.start + 0.6 && t < L.widemouth_002_friend.start + 1 ? 10 * ramp(t, L.eli_001_a_toy.start + 0.6, L.eli_001_a_toy.start + 1.1) : 0;

	// --- Eli: sitting up in bed, notices, watches, asks
	const eliTalk = talkOf('eli', t);
	const eliLook: [number, number] = t < T.rustle ? [0.2, -0.2] : t < T.scurry ? [0.8, 0.7] : t < T.stop ? [lerp(0.8, 1, walkK), 0.4] : [1, 0.35];
	const scared = t > T.eyes && t < L.widemouth_001_call_me.end;
	const eliEyes = t > T.out && t < T.stop + 1.2 ? 'wide' : 'dot';
	const eliMouth = eliTalk.talk > 0 ? 'open' : scared && t < T.stop ? 'o' : t > wordAt('widemouth_002_friend', 'can', 3.6) + 0.5 ? 'smile' : 'flat';
	const eliBrows = scared ? 'worried' : t > L.eli_001_a_toy.start - 0.3 && t < L.eli_001_a_toy.end + 0.3 ? 'raised' : 'none';
	const eliLean = t > T.out && t < T.stop + 0.6 ? -4 : 0;

	return (
		<g>
			<image href={staticFile(PLATE)} x={0} y={0} width={1920} height={1080} preserveAspectRatio="none" />
			{/* soft moonlight across the floor from the window */}
			<polygon points="1075,610 1430,610 1700,1080 1000,1080" fill="url(#moon)" opacity={0.55} />

			{/* the dark under the bed where the skirt is pushed up, with the hem folded over */}
			{archH > 0.5 ? <path d={holeD} fill="#06060a" /> : null}

			{/* Mr. Widemouth - only seen through the gap while he is still under the bed */}
			{wmVisible ? (
				<g clipPath={underBed ? 'url(#underBed)' : undefined}>
					<g filter="url(#wmLight)">
						<Widemouth
							x={wmX}
							y={wmY}
							s={wmScale}
							frame={f}
							walking={walking}
							phase={phase}
							mouth={wmMouth}
							talk={wmTalk.talk}
							arms={waving ? 'wave' : 'down'}
							look={wmLook}
							tilt={wmTilt}
						/>
					</g>
					{/* eye glints stay bright in the dark */}
					{wmLight < 0.9
						? [-1, 1].map((sg) => <circle key={sg} cx={wmX + (sg * 24 + 5) * wmScale} cy={wmY + (-150 - 5) * wmScale} r={4.2 * wmScale} fill="#e9eeff" opacity={1 - wmLight} />)
						: null}
				</g>
			) : null}
			{archH > 3 ? (
				<g opacity={clamp01((archH - 3) / 10)}>
					<path d={hemD} fill="none" stroke="#141414" strokeWidth={13} strokeLinecap="round" />
					<path d={hemD} fill="none" stroke="#7d8cab" strokeWidth={6} strokeLinecap="round" />
					{[-1, 1].map((sg) => (
						<path key={sg} d={`M${axc + sg * 34},${hem - archH * 0.92} Q${axc + sg * 30},${(hem - archH + BED.skirtTop) / 2} ${axc + sg * 22},${BED.skirtTop + 6}`} fill="none" stroke="#141414" strokeOpacity={0.45} strokeWidth={3} />
					))}
				</g>
			) : null}

			{/* Eli sitting up in bed, the quilt over his legs */}
			<g clipPath="url(#eliWaist)">
				<NightTint>
					<Eli x={ELI.x} y={ELI.y} s={ELI.s} frame={f} pose="sit" arms={{l: [34, -26], r: [34, -26]}} look={eliLook} eyes={eliEyes} mouth={eliMouth} brows={eliBrows} talk={eliTalk.talk} viseme={eliTalk.viseme} lean={eliLean} />
				</NightTint>
			</g>
			<path d="M222,712 L224,688 C230,672 262,666 300,668 C380,664 470,664 560,668 C600,670 640,672 668,680 L672,712 Z" fill="url(#quilt)" stroke="#141414" strokeWidth={5} strokeLinejoin="round" />
			<path d="M244,686 C330,679 470,679 650,690" fill="none" stroke="#141414" strokeOpacity={0.35} strokeWidth={3} />

			<defs>
				<clipPath id="underBed">
					<path d={holeD} />
				</clipPath>
				<filter id="wmLight" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${0.8 * wmLight} 0 0 0 0  0 ${0.8 * wmLight} 0 0 0.005  0 0 ${0.9 * wmLight} 0 ${0.03 * wmLight}  0 0 0 1 0`} />
				</filter>
				<clipPath id="eliWaist">
					<rect x={0} y={0} width={1920} height={700} />
				</clipPath>
				<linearGradient id="moon" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#9fb8ff" stopOpacity={0.0} />
					<stop offset="0.45" stopColor="#9fb8ff" stopOpacity={0.12} />
					<stop offset="1" stopColor="#9fb8ff" stopOpacity={0.2} />
				</linearGradient>
				<pattern id="quilt" width={70} height={60} patternUnits="userSpaceOnUse">
					<rect width={35} height={30} fill="#3b2c4f" />
					<rect x={35} width={35} height={30} fill="#4a3156" />
					<rect y={30} width={35} height={30} fill="#4a3156" />
					<rect x={35} y={30} width={35} height={30} fill="#2e2c47" />
					<path d="M35,0 V60 M0,30 H70" stroke="#1a1626" strokeWidth={2} />
				</pattern>
				{/* moonlit night: darken and cool the flat character colours to sit in the plate */}
				<filter id="night" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values="0.8 0 0 0 0  0 0.8 0 0 0.005  0 0 0.9 0 0.03  0 0 0 1 0" />
				</filter>
			</defs>
		</g>
	);
};

// ---------------------------------------------------------------- camera
type Shot = {from: number; z0: number; z1: number; f0: [number, number]; f1: [number, number]};
const S = (from: number, z0: number, z1: number, f0: [number, number], f1: [number, number] = f0): Shot => ({from, z0, z1, f0, f1});
const SHOTS: Shot[] = [
	S(0, 1.02, 1.08, [960, 560], [820, 600]),
	S(T.lift - 0.15, 2.3, 2.45, [665, 790], [665, 805]),
	S(T.out + 0.45, 1.05, 1.1, [1000, 600], [1040, 620]),
	S(L.widemouth_001_call_me.start - 0.2, 2.2, 2.4, [1290, 800], [1290, 815]),
	S(L.narrator_023_size_of_cat.start - 0.1, 1.15, 1.75, [820, 640], [1180, 760]),
	S(L.narrator_024_mouth.start - 0.1, 3.0, 3.5, [1290, 860], [1290, 875]),
	S(L.eli_001_a_toy.start - 0.25, 2.3, 2.45, [345, 560], [345, 575]),
	S(L.widemouth_002_friend.start - 0.3, 2.5, 3.1, [1270, 820], [1285, 850]),
];
const cameraAt = (t: number) => {
	let i = 0;
	for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].from) i = k;
	const sh = SHOTS[i];
	const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : STICK_TEST_FRAMES / FPS;
	const k = smooth(clamp01((t - sh.from) / (end - sh.from)));
	const z = lerp(sh.z0, sh.z1, k);
	let fx = lerp(sh.f0[0], sh.f1[0], k);
	let fy = lerp(sh.f0[1], sh.f1[1], k);
	const hw = 960 / z;
	const hh = 540 / z;
	fx = Math.max(hw, Math.min(1920 - hw, fx));
	fy = Math.max(hh, Math.min(1080 - hh, fy));
	return `translate(${960 - fx * z} ${540 - fy * z}) scale(${z})`;
};

// ---------------------------------------------------------------- subtitles
const Subtitle: React.FC<{t: number}> = ({t}) => {
	const l = LINES.find((x) => t >= x.start && t < x.end + 0.25);
	if (!l) return null;
	const words = wordsOf(l.id);
	const text = LINE_BY_ID[l.id]?.text ?? '';
	// whole clauses (a sentence, or a long sentence broken at a comma), never more than 9 words
	const chunks: Array<{a: number; s: string}> = [];
	let cur: Array<[string, number]> = [];
	const flush = () => {
		if (!cur.length) return;
		const n = Math.ceil(cur.length / 9);
		const per = Math.ceil(cur.length / n);
		for (let i = 0; i < cur.length; i += per) chunks.push({a: cur[i][1], s: cur.slice(i, i + per).map((x) => x[0]).join(' ')});
		cur = [];
	};
	words.forEach(([w, ws]) => {
		cur.push([w, ws]);
		const end = /[.!?]$/.test(w) && !/^(Mr|Mrs|Dr)\.$/.test(w);
		if (end || (/[,;:]$/.test(w) && cur.length >= 5)) flush();
	});
	flush();
	const lt = t - l.start;
	const c = chunks.length ? [...chunks].reverse().find((x) => lt >= x.a - 0.05) ?? chunks[0] : {s: text};
	return (
		<div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center'}}>
			<span style={{fontFamily: FONT.hand, fontSize: 54, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', letterSpacing: 0.5}}>{c.s}</span>
		</div>
	);
};

// ---------------------------------------------------------------- composition
export const StickTest: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const fadeIn = clamp01(t / 0.6);
	const fadeOut = 1 - clamp01((t - (STICK_TEST_FRAMES / FPS - 1.2)) / 1.0);
	// grain + vignette like the earlier films
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<g transform={cameraAt(t)}>
						<World t={t} f={f} />
					</g>
				</svg>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
			</AbsoluteFill>
			<Subtitle t={t} />
			{/* sound */}
			<Audio src={staticFile('audio/sfx/house_tone.wav')} volume={0.16} />
			<Sequence from={Math.round(T.rustle * FPS)}>
				<Audio src={staticFile('audio/sfx/cloth_rustle.wav')} volume={0.35} />
			</Sequence>
			<Sequence from={Math.round(T.lift * FPS)}>
				<Audio src={staticFile('audio/sfx/cloth_rustle.wav')} volume={0.55} />
			</Sequence>
			<Sequence from={Math.round(T.scurry * FPS)}>
				<Audio src={staticFile('audio/sfx/scurry.wav')} volume={0.5} />
			</Sequence>
			<Sequence from={Math.round((L.narrator_023_size_of_cat.start - 0.5) * FPS)}>
				<Audio src={staticFile('audio/sfx/musicbox_lullaby.wav')} volume={(fr) => 0.05 * Math.min(1, fr / 48)} />
			</Sequence>
			{LINES.map((l) => (
				<Sequence key={l.id} from={Math.round(l.start * FPS)}>
					<Audio src={staticFile(`audio/${l.who}/${l.id}.wav`)} volume={l.who === 'narrator' ? 1 : 0.95} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
