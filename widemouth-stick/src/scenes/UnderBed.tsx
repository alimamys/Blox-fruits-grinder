// 3. UNDER THE BED - the first meeting, the toy-pet look, "Good. Then you have me.", the books,
// Mom coming in too fast, the first lie, and the morning he waits with a huge smile.
import React from 'react';
import {Mom} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {BEDS, Book, boilOfF, clamp01, gait, INK, lerp, ramp, shot, Shots, skirtArch, Tint, useStick, walk, wobCircle, wobEllipse, wobPoly} from '../stick/kit';
import {ADULT_S, BedScene, KID_S, WM_S} from '../stick/rooms';

const b = BEDS.bedroom_day;
const CX = 665;
const ROOM_X = 1300;
const ELI_HEAD: [number, number] = [(b.pillow[0] + b.pillow[1]) / 2 + 22, b.quilt + 100 - 209 * 0.62 * KID_S];

/** "one of those talking toy pets every kid wanted that year": an old TV advert. */
const TvAdvert: React.FC<{f: number}> = ({f}) => {
	const bounce = Math.abs(Math.sin(f / 5)) * 40;
	const sd = 1200 + boilOfF(f);
	return (
		<g>
			<rect width={1920} height={1080} fill="#2b2220" />
			<path d={wobPoly([[470, 170], [1450, 170], [1450, 900], [470, 900]], sd, 2)} fill="#5a4636" stroke={INK} strokeWidth={10} />
			<rect x={540} y={230} width={720} height={560} rx={60} fill="#7fd0e8" stroke={INK} strokeWidth={8} />
			<defs>
				<clipPath id="tvScreen">
					<rect x={540} y={230} width={720} height={560} rx={60} />
				</clipPath>
			</defs>
			<g clipPath="url(#tvScreen)">
				{Array.from({length: 14}, (_, i) => (
					<path key={i} d={`M${560 + ((i * 97 + f * 6) % 700)},${260 + ((i * 53) % 480)} l10,22 l22,4 l-18,14 l6,24 l-20,-12 l-20,12 l6,-24 l-18,-14 l22,-4 z`} fill="#fff7b0" opacity={0.8} />
				))}
				<g transform={`translate(900 ${700 - bounce})`}>
					<ellipse cx={0} cy={0} rx={150} ry={130} fill="#c77dd6" stroke={INK} strokeWidth={7} />
					<path d="M-110,-90 L-150,-190 L-60,-120 Z M110,-90 L150,-190 L60,-120 Z" fill="#c77dd6" stroke={INK} strokeWidth={6} />
					{[-1, 1].map((s) => (
						<g key={s}>
							<circle cx={s * 50} cy={-30} r={40} fill="#fff" stroke={INK} strokeWidth={5} />
							<circle cx={s * 50 + 6} cy={-24} r={18} fill="#111" />
						</g>
					))}
					<path d="M-26,24 L26,24 L0,52 Z" fill="#ffb347" stroke={INK} strokeWidth={4} />
					<ellipse cx={-60} cy={128} rx={40} ry={16} fill="#ffb347" stroke={INK} strokeWidth={4} />
					<ellipse cx={60} cy={128} rx={40} ry={16} fill="#ffb347" stroke={INK} strokeWidth={4} />
				</g>
			</g>
			{[1340, 1395].map((x) => (
				<circle key={x} cx={x} cy={300} r={22} fill="#c9b79c" stroke={INK} strokeWidth={5} />
			))}
			<path d={wobPoly([[1320, 700], [1420, 700], [1420, 860], [1320, 860]], sd + 1, 1)} fill="#3a2e24" stroke={INK} strokeWidth={4} />
		</g>
	);
};

export const UnderBed: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t21 = at('narrator_021_first_time');
	const tLift = t21 + 1.7;
	const tOut = t21 + 3.0;
	const tGo = tOut + 0.6;
	const tStop = tGo + 1.9;
	const w01 = at('widemouth_001_call_me');
	const t22 = at('narrator_022_suited');
	const t23 = at('narrator_023_size_of_cat');
	const t24 = at('narrator_024_mouth');
	const tBig = word('narrator_024_mouth', 'biggest', 0.3);
	const t25 = at('narrator_025_toy_pets');
	const e01 = at('eli_001_a_toy');
	const w02 = at('widemouth_002_friend');
	const w03 = at('widemouth_003_other_friends');
	const e02 = at('eli_002_move');
	const w04 = at('widemouth_004_good');
	const t26 = at('narrator_026_slid');
	const tSlid = word('narrator_026_slid', 'slid', 0.6);
	const w05 = at('widemouth_005_parents');
	const t27 = at('narrator_027_books');
	const t28 = at('narrator_028_pages');
	const t29 = at('narrator_029_too_fast');
	const tOpened = word('narrator_029_too_fast', 'opened', 0.75);
	const m01 = at('mom_001_who');
	const e03 = at('eli_003_nobody');
	const t30 = at('narrator_030_lied');
	const t31 = at('narrator_031_huge_smile');
	const w06 = at('widemouth_006_secret_game');

	const wmT = talk('widemouth');
	const eliT = talk('eli');
	const momT = talk('mom');

	// ---- the skirt: peek, push out, dive back (x2)
	const tDive = tSlid + 0.45;
	const tLeap = t29 + 0.25;
	const skirtH =
		skirtArch(t, [
			{up: tLift, down: tOut + 0.55, h: 62},
			{up: tOut - 0.15, down: tOut + 0.55, h: 100},
			{up: tDive - 0.1, down: tDive + 0.45, h: 120},
			{up: tLeap + 0.3, down: tLeap + 0.62, h: 125},
		]) +
		(t >= w05 - 0.2 && t < end('widemouth_005_parents') + 0.4 ? 78 * ramp(t, w05 - 0.2, w05 + 0.1) * (1 - ramp(t, end('widemouth_005_parents'), end('widemouth_005_parents') + 0.3)) : 0) +
		(t > t21 + 0.6 && t < t21 + 1.3 ? Math.abs(Math.sin((t - t21) * 20)) * 12 : 0);

	// ---- where he is
	type S = {x: number; y: number; under: number; walking?: boolean; phase?: number; onBed?: boolean; flip?: boolean};
	let wm: S;
	if (t < tOut) wm = {x: CX, y: b.gap - 22, under: 1};
	else if (t < tGo) {
		const k = ramp(t, tOut, tOut + 0.5);
		wm = {x: CX, y: lerp(b.gap - 22, b.front, k), under: 1 - ramp(t, tOut - 0.1, tOut + 0.35)};
	} else if (t < tSlid) {
		const w = walk(t, tGo, tStop, CX, ROOM_X, WM_S);
		wm = {x: w.x, y: b.front, under: 0, walking: w.moving, phase: (w.x - CX) / (14 * WM_S)};
	} else if (t < w05 - 0.3) {
		const kRun = clamp01((t - tSlid) / 0.4);
		const kIn = ramp(t, tDive - 0.05, tDive + 0.3);
		wm = {x: lerp(ROOM_X, CX, kRun), y: lerp(b.front, b.gap - 22, kIn), under: kIn, walking: kRun < 1, phase: (ROOM_X - lerp(ROOM_X, CX, kRun)) / (14 * WM_S), flip: true};
	} else if (t < t27) wm = {x: CX, y: b.gap - 22, under: 0.75};
	else if (t < tLeap) wm = {x: 760, y: b.quilt + 34, under: 0, onBed: true, flip: true};
	else if (t < t30) {
		const k = clamp01((t - tLeap) / 0.45);
		const hop = Math.sin(k * Math.PI) * 60;
		const kIn = ramp(t, tLeap + 0.35, tLeap + 0.6);
		wm = {x: lerp(760, CX, k), y: lerp(b.quilt + 34, b.gap - 22, k) - hop, under: kIn, onBed: k < 0.5};
	} else if (t < t31) wm = {x: CX, y: b.gap - 22, under: 1};
	else wm = {x: 600, y: b.quilt + 30, under: 0, onBed: true, flip: true};

	const smileGrin = (t > tBig && t < t25) || (t > w04 + 0.6 && t < t26) || t > t31 + 0.8;
	const wmLookEli: [number, number] = [-0.9, -0.3];
	const tilt = t > w03 && t < e02 + 0.5 ? 10 : t > t22 && t < t23 ? -8 : 0;
	const wmProps = {
		mouth: (smileGrin ? 'grin' : 'smile') as 'grin' | 'smile',
		talk: wmT.talk,
		arms: (t > w01 + 0.2 && t < end('widemouth_001_call_me') - 0.3 ? 'wave' : t >= t27 && t < t29 ? 'reach' : 'down') as 'wave' | 'reach' | 'down',
		look: (t < tStop ? [0.6, 0] : t >= t27 && t < t29 ? [1, 0.7] : t > t26 && t < tSlid ? [1, 0] : wmLookEli) as [number, number],
		walking: wm.walking,
		phase: wm.phase,
		flip: wm.flip,
		tilt,
		earsBack: false,
	};

	// ---- Eli
	const scared = t > tLift + 0.3 && t < w01 + 1;
	const eliLook: [number, number] = t < tLift ? [0.3, -0.2] : t < tGo ? [0.8, 0.7] : t < tStop ? [1, 0.4] : t >= t27 && t < t29 ? [0.9, 0.7] : t >= m01 && t < t30 ? [1, 0] : [1, 0.3];
	const guilty = t >= e03 && t < t31;
	const eliP = {
		eyes: (t > tOut && t < tStop + 1 ? 'wide' : guilty && t > t30 ? 'dot' : 'dot') as 'wide' | 'dot',
		mouth: (eliT.talk > 0 ? 'open' : scared && t < tStop ? 'o' : t >= e02 && t < w04 ? 'frown' : t > w02 + 2.5 && t < w03 ? 'smile' : 'flat') as 'open' | 'o' | 'frown' | 'smile' | 'flat',
		brows: (scared ? 'worried' : t >= e01 - 0.3 && t < e01 + 2 ? 'raised' : t >= e02 && t < w04 + 1 ? 'sad' : guilty ? 'sad' : 'none') as 'worried' | 'raised' | 'sad' | 'none',
		talk: eliT.talk,
		viseme: eliT.viseme,
		look: (guilty && t > e03 + 0.4 ? [0.3, 1] : eliLook) as [number, number],
	};

	// ---- Mom
	const mom = walk(t, tOpened - 0.5, tOpened + 1.4, 2150, 1420, 1);
	const momOn = t >= tOpened - 0.5 && t < t30;

	// ---- book pages
	const pageT = t >= t28 ? (t - t28) / 2.4 : 0;
	const turn = t >= t28 ? clamp01((pageT % 1) * 2.2 - 1.0) : 0;
	const page = Math.floor(pageT);

	const eliX = ELI_HEAD[0];
	const wmFace: [number, number] = [ROOM_X, b.front - 128 * WM_S];
	const shots = [
		shot(t21, 'bedroom_day', 1.12, 1.18, [760, 640], [740, 640]),
		shot(tLift - 0.15, 'bedroom_day', 2.3, 2.45, [CX, 790], [CX, 805]),
		shot(tOut + 0.45, 'bedroom_day', 1.05, 1.1, [1000, 600], [1040, 620]),
		shot(w01 - 0.2, 'bedroom_day', 2.2, 2.4, [ROOM_X, 800], [ROOM_X, 815]),
		shot(t22, 'bedroom_day', 2.2, 2.3, [eliX + 40, 540]),
		shot(t23, 'bedroom_day', 1.15, 1.75, [820, 640], [1180, 780]),
		shot(t24, 'bedroom_day', 3.0, 3.6, wmFace, [wmFace[0], wmFace[1] + 10]),
		shot(t25, 'black', 1.0, 1.06, [960, 540]),
		shot(e01 - 0.25, 'bedroom_day', 2.3, 2.45, [eliX + 30, 560]),
		shot(w02 - 0.2, 'bedroom_day', 2.5, 2.9, [ROOM_X - 20, 820], [ROOM_X, 840]),
		shot(e02 - 0.2, 'bedroom_day', 2.4, 2.6, [eliX + 30, 560]),
		shot(w04 - 0.2, 'bedroom_day', 2.6, 3.5, [ROOM_X, 830], wmFace),
		shot(t26, 'bedroom_day', 1.0, 1.04, [960, 560]),
		shot(w05 - 0.3, 'bedroom_day', 2.7, 2.9, [CX, 830], [CX, 840]),
		shot(t27, 'bedroom_day', 1.6, 1.7, [560, 580], [580, 590]),
		shot(t28, 'bedroom_day', 2.6, 3.0, [680, 620], [700, 640]),
		shot(t29, 'bedroom_day', 1.0, 1.02, [960, 540]),
		shot(m01 - 0.2, 'bedroom_day', 1.7, 1.8, [1300, 520], [1320, 520]),
		shot(e03 - 0.2, 'bedroom_day', 2.4, 2.5, [eliX + 30, 560]),
		shot(t30, 'bedroom_day', 2.6, 3.1, [eliX + 30, 560], [eliX + 10, 520]),
		shot(t31, 'bedroom_day', 1.6, 1.75, [480, 560], [500, 560]),
		shot(w06 - 0.2, 'bedroom_day', 2.6, 3.0, [600, 520], [600, 510]),
	];

	const world = (set: string) => {
		if (set === 'black') return <TvAdvert f={f} />;
		const lying = t >= t31;
		const book = t >= t27 && t < tLeap + 0.2 ? <Tint light="day"><Book x={640} y={b.quilt + 52} w={150} turn={turn} page={page} frame={f} /></Tint> : null;
		const onBed = wm.onBed;
		const wmEl = <Widemouth frame={f} x={wm.x} y={wm.y} s={WM_S} {...wmProps} />;
		return (
			<BedScene
				set="bedroom_day"
				light="day"
				frame={f}
				id="ub"
				bed={lying ? {mode: 'lie', p: {eyes: t < t31 + 0.9 ? 'closed' : 'wide', mouth: 'o', look: [1, -0.5], brows: 'worried'}} : {mode: 'sit', p: eliP}}
				skirt={{cx: CX, h: skirtH}}
				wm={onBed ? undefined : {...wmProps, x: wm.x, y: wm.y, under: wm.under}}
				front={
					<>
						{book}
						{onBed ? wmEl : null}
						{momOn ? <Mom x={mom.x} y={b.front + 10} s={ADULT_S} frame={f} {...gait(mom)} mouth={momT.talk > 0 ? 'open' : 'smile'} talk={momT.talk} viseme={momT.viseme} look={[-1, 0.2]} tilt={t > m01 ? -6 : 0} /> : null}
					</>
				}
			/>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
