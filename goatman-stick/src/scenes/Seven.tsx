// 6. SEVEN - four go home, Wyatt goes for his rifle: "seven of us" (one of them the stranger). In the
// afternoon "Nia" stands by the dead fire pit, shaking with a silent laugh. Wyatt bangs on the door; every
// time he looks back she is closer. "Why are there only six of you?"
import React from 'react';
import {Marcus, WrongNia, Wyatt} from '../components/characters/Cast';
import {BigWords, Counts, DoorOpen, Person, Smell} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, clearingSpec, Group, headOf, trailerSpec, type Spec} from '../stick/places';

const SIX = ['marcus', 'ray', 'dez', 'tasha', 'jalen', 'malik'];
const LEAVING = ['nia', 'kayla', 'lucia', 'andre'];

export const Seven: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t75 = at('narrator_075_sunrise');
	const t76 = at('narrator_076_keys');
	const t77 = at('narrator_077_rifle');
	const t78 = at('narrator_078_seven_left');
	const t79 = at('narrator_079_at_least');
	const tA = at('afternoon');
	const t80 = at('narrator_080_nia_back');
	const t81 = at('narrator_081_fire_pit');
	const t82 = at('narrator_082_back_to_us');
	const t83 = at('narrator_083_faint');
	const t84 = at('narrator_084_silent');
	const t85 = at('narrator_085_shoulders');
	const t87 = at('narrator_087_no_sound');
	const t88 = at('narrator_088_froze');
	const m02 = at('marcus_002_get_back');
	const t89 = at('narrator_089_blinds');
	const t90 = at('narrator_090_twenty');
	const t91 = at('narrator_091_slammed');
	const w02 = at('wyatt_002_let_me_in');
	const t92 = at('narrator_092_with_rifle');
	const t93 = at('narrator_093_turned_to_watch');
	const t94 = at('narrator_094_never_saw');
	const t95 = at('narrator_095_closer');
	const tLooked = word('narrator_095_closer', 'looked', 0.5);
	const t96 = at('narrator_096_went_pale');
	const w03 = at('wyatt_003_only_six');
	const t97 = at('narrator_097_math');
	const t98 = at('narrator_098_six');
	const t99 = at('narrator_099_all_afternoon');
	const t100 = at('narrator_100_math');
	const t101 = at('narrator_101_inside_again');
	const t102 = at('narrator_102_when_it_left');
	const wyT = talk('wyatt');
	const marT = talk('marcus');
	const C = GEO.clearing;

	// ---- morning: four walk off to the left, Wyatt to the right
	// the four who go home stand at the left end, Wyatt at the right end: nobody walks through anybody
	const MORN: Record<string, [number, number, number]> = {
		kayla: [120, 1045, 1.28], nia: [300, 1045, 1.28], lucia: [480, 1045, 1.28], andre: [660, 1045, 1.28], marcus: [1000, 1045, 1.28], ray: [1200, 1045, 1.28 * 0.9], dez: [1400, 1045, 1.28 * 1.1],
		tasha: [900, 920, 1.08], jalen: [1100, 920, 1.08], malik: [1300, 920, 1.08], wyatt: [1560, 920, 1.08],
	};
	const morning: Spec[] = [...SIX, ...LEAVING, 'wyatt'].map((n) => {
		const [mx, my, ms] = MORN[n];
		const sp = clearingSpec(n, {x: mx, y: my, s: ms, frame: f, look: [0, 0.2], mouth: 'flat'});
		if (LEAVING.includes(n)) {
			// leftmost leaves first, so nobody catches up with anybody
			const i = [...LEAVING].sort((a, b) => MORN[a][0] - MORN[b][0]).indexOf(n);
			const t0 = t75 + 0.6 + i * 0.45;
			const w = walk(t, t0, t0 + (sp.x + 260) / 300, sp.x, -260, sp.s);
			return {...sp, x: w.x, ...(w.moving ? {pose: 'walk', turn: -0.8, phase: w.phase} : {}), edge: true};
		}
		if (n === 'wyatt') {
			const w = walk(t, t77 + 0.3, t77 + 3.2, sp.x, 2150, sp.s);
			return {...sp, x: w.x, ...(w.moving ? {pose: 'walk', turn: 0.8, phase: w.phase} : {}), edge: true};
		}
		if (n === 'marcus' && t >= t76 && t < t77) return {...sp, arms: 'shrug', mouth: 'faint'};
		return {...sp, look: t >= t75 && t < t77 ? [-1, 0] : [0, 0.2]};
	});
	// "seven of us": six + the stranger standing in Nia's old place
	const seven: Spec[] = [...SIX.map((n) => clearingSpec(n, {frame: f, mouth: 'flat'})), clearingSpec('nia', {is: trailerSpec('thing').is, name: 'thing', frame: f, mouth: 'flat', look: [0, 0]})];
	const sevenHeads = [...seven].sort((a, b) => a.x - b.x).map(headOf);
	const thing7 = seven.find((p) => p.name === 'thing')!;

	// ---- the afternoon, inside: six + the stranger; later the stranger is gone
	const strangerGone = t >= t91;
	const insideDay: Spec[] = [...SIX, 'thing'].filter((n) => !(n === 'thing' && strangerGone)).map((n) =>
		trailerSpec(n, {frame: f, look: t >= t80 && t < t89 ? [0.4, 0] : [0.2, 0.2], mouth: 'flat', eyes: t >= t91 ? 'wide' : 'dot', brows: t >= t81 ? 'worried' : 'none', ...(n === 'thing' ? {look: [0, 0], eyes: 'dot'} : {})}),
	);
	const wyIn = t >= t96 ? trailerSpec('wyatt', {x: 1380, frame: f, prop: 'rifle', arms: 'hold', pale: 0.4, eyes: 'wide', brows: 'worried', mouth: wyT.talk > 0 ? 'open' : 'flat', talk: wyT.talk, viseme: wyT.viseme, look: [-1, 0]}) : null;
	const insideAll = wyIn ? [...insideDay, wyIn] : insideDay;
	const sixHeads = insideDay.filter((p) => p.name !== 'thing').sort((a, b) => a.x - b.x).map(headOf);
	const Bin = boxesOf(insideAll);

	// ---- "Nia" by the dead fire pit, facing the trailer (us); she gets closer every time Wyatt looks back
	const shake = t >= t85 && t < t88 ? 1.6 : 0;
	const niaPos = (): [number, number] => {
		if (t < t93) return [C.fire[0], 1000];
		if (t < t94) return [C.fire[0] + 80, 1000];
		if (t < t95) return [C.fire[0] + 230, 1010];
		if (t < tLooked) return [C.fire[0] + 380, 1020];
		return [C.fire[0] + 330, 1030];
	};
	const [nx, ny] = niaPos();
	const wrong = <Person is={WrongNia} name="wrong-nia" x={nx} y={ny} s={1.28} frame={f} shiver={shake} mouth={t >= t86x(t85) ? 'laugh' : 'open'} look={t >= t93 ? [1, -0.2] : [0, 0]} />;
	function t86x(a: number) {
		return a + 1.2;
	}
	// a girl walks out toward her and freezes halfway; Marcus shouts from the steps
	const tash = walk(t, t88 + 0.1, t88 + 1.8, C.door[0] + 60, 940, 1.28);
	const tashBack = walk(t, m02 + 0.6, m02 + 1.8, 940, C.door[0] + 240, 1.28);
	// Wyatt crossing the clearing to the door, looking back
	const wyX = t < t93 ? 1700 : lerp(1700, C.door[0] + 160, ramp(t, t93, t96 - 0.3));

	const shots = [
		shot(0, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'dawn'}),
		shot(t78, 'clearing_day', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(seven), t79, 'clearing_day', 1.8, [thing7.x, headOf(thing7)[1] + 200]),
		shot(tA, 'trailer_day', 1.0, 1.0, [960, 540]),
		shot(t81, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t82, 'clearing_day', 2.3, 2.45, [C.fire[0], 700], [C.fire[0], 690]),
		shot(t83, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t85, 'clearing_day', 2.6, 2.6, [C.fire[0], 680], [C.fire[0], 680]),
		shot(t88, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t89, 'trailer_day', 1.0, 1.0, [960, 540]),
		shot(t90, 'clearing_day', 1.7, 1.75, [C.fire[0], 700], [C.fire[0], 700]),
		shot(t91, 'trailer_day', 1.0, 1.0, [960, 540], [960, 540], {shake: 9}),
		shot(w02 - 0.1, 'clearing_day', 1.45, 1.45, [1300, 660], [1300, 660]),
		shot(t93, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t94, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t95, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(tLooked, 'clearing_day', 1.0, 1.0, [960, 540]),
		fshot(Bin, t96, 'trailer_day', 1.8, [1380, 600]),
		fshot(Bin, w03 - 0.1, 'trailer_day', 2.3, [1380, 560]),
		shot(t97, 'trailer_day', 1.0, 1.0, [960, 540]),
		shot(t99, 'trailer_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'dawn'}),
		shot(t100, 'trailer_day', 1.0, 1.0, [960, 540]),
		shot(t102, 'trailer_day', 2.7, 2.7, [780, 690], [780, 690]),
	];

	const world = (set: string) => {
		if (set === 'clearing_day') {
			if (t < tA) {
				const people = t >= t78 ? seven : morning;
				return (
					<g>
						<Group people={people} />
						{t >= t78 && t < t79 ? <Counts heads={sevenHeads} t0={t78 + 0.3} t={t} step={0.3} /> : null}
					</g>
				);
			}
			// afternoon outside: the girl by the fire pit; the slats when we watch through the blind
			const blinds = t >= t90 && t < t91;
			const tashOn = t >= t88 + 0.1 && t < m02 + 1.8;
			const marcusOut = t >= m02 - 0.2 && t < t89;
			return (
				<g>
					<DoorOpen r={C.door} open={t >= t88 && t < t89 ? 1 : 0} />
					{wrong}
					{marcusOut ? <Person is={Marcus} name="marcus" x={C.door[0] + 70} y={C.steps[1] + 70} s={1.15} frame={f} mouth={marT.talk > 0 ? 'shout' : 'flat'} talk={marT.talk} viseme={marT.viseme} arms="point" look={[-1, 0.2]} flip /> : null}
					{tashOn ? <Person is={clearingSpec('tasha').is} name="tasha" x={t < m02 + 0.6 ? tash.x : tashBack.x} y={1040} s={1.28} frame={f} pose={(tash.moving && t < m02) || tashBack.moving ? 'walk' : 'stand'} turn={t < m02 + 0.6 ? -0.8 : 0.8} phase={tash.phase + tashBack.phase} look={[-1, 0]} eyes="wide" brows="worried" /> : null}
					{t >= w02 - 0.1 && t < t96 ? (
						<Person is={Wyatt} name="wyatt" x={t < t93 ? C.door[0] + 160 : wyX} y={C.steps[3] + 40} s={1.2} frame={f} prop="rifle" arms="hold" pose={t >= t93 && t < t96 - 0.3 ? 'walk' : 'stand'} turn={t >= t93 ? -0.6 : 0} phase={wyX / 34} mouth={wyT.talk > 0 ? 'shout' : 'flat'} talk={wyT.talk} viseme={wyT.viseme} look={t >= t93 ? [1, 0] : [-1, -0.2]} />
					) : null}
					<Smell k={t >= t83 && t < t88 ? 0.45 : 0} frame={f} y0={500} y1={1000} />
					{blinds ? (
						<g>
							{Array.from({length: 16}, (_, i) => (
								<rect key={i} x={0} y={i * 68} width={1920} height={26} fill="#d9d2bd" stroke="#8a8270" strokeWidth={3} />
							))}
						</g>
					) : null}
				</g>
			);
		}
		// trailer by day
		const people = t >= t99 && t < t100 ? [...SIX, 'thing'].map((n) => trailerSpec(n, {frame: f, mouth: 'smile', look: [0.2, 0.2]})) : insideAll;
		const peering = t >= t89 && t < t91;
		const ppl = peering
			? people.map((p) => (p.name === 'marcus' ? {...p, x: 900, y: 990, look: [0, -1], arms: 'handsForward'} : p))
			: people;
		return (
			<g>
				<DoorOpen r={GEO.trailer.door} open={t >= t96 - 0.4 && t < t96 + 0.6 ? 1 : 0} />
				<Group people={ppl} />
				{t >= t98 && t < t99 ? <Counts heads={sixHeads} t0={t98} t={t} step={0.16} /> : null}
				{t >= t102 ? <ellipse cx={780} cy={GEO.trailer.seat + 6} rx={50} ry={8} fill="#000" opacity={0.25} /> : null}
			</g>
		);
	};
	return (
		<>
			<Shots shots={shots} world={(s) => world(s.set)} />
			{t >= t97 && t < t98 ? <BigWords text="11 − 4 − 1 = 6" size={130} k={ramp(t, t97 + 0.2, t97 + 0.5)} y={-300} /> : null}
			{t >= t101 && t < t102 ? <BigWords text="7?" size={180} k={ramp(t, t101, t101 + 0.3) * 0.9} color="#ff4a3a" y={-300} /> : null}
		</>
	);
};
