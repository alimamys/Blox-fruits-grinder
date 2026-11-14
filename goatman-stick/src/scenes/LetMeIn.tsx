// 7. LET ME IN - Cole and his lantern: the girl on the trail who was a foot to the left. At eleven the smell
// turns to burnt hair; something scrapes the door and says Wyatt's words with no rhythm. At two, Cole fires.
import React from 'react';
import {Cole, WrongNia} from '../components/characters/Cast';
import {Crawler} from '../components/characters/Thing';
import {Campfire, DoorOpen, Flash, Person, PlateShake, QAShape, Smell} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, clearingSpec, Group, trailerSpec, type Spec} from '../stick/places';

const SIX = ['marcus', 'ray', 'dez', 'tasha', 'jalen', 'malik'];

export const LetMeIn: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t103 = at('narrator_103_cole');
	const c01 = at('cole_001_little_friend');
	const t104 = at('narrator_104_reached');
	const t105 = at('narrator_105_empty_air');
	const t106 = at('narrator_106_foot_left');
	const tW = at('night_wait');
	const t107 = at('narrator_107_eleven');
	const t109 = at('narrator_109_scraped');
	const t110 = at('narrator_110_voice');
	const th01 = at('thing_001_let_me_in');
	const t111 = at('narrator_111_wyatts_words');
	const t112 = at('narrator_112_wrong');
	const t2 = at('two_am');
	const t114 = at('narrator_114_two_am');
	const tFired = word('narrator_114_two_am', 'fired', 0.75);
	const c02 = at('cole_002_get_gone');
	const t115 = at('narrator_115_answered');
	const t117 = at('narrator_117_scream');
	const t118 = at('narrator_118_crawled');
	const t119 = at('narrator_119_fired');
	const t120 = at('narrator_120_until_dawn');
	const t121 = at('narrator_121_never_door');
	const tDQ = at('dawn_quiet');
	const coleT = talk('cole');
	const C = GEO.clearing;
	const T = GEO.trailer;

	// ---- sundown: Cole walks up with his lantern
	const cw = walk(t, t103 + 0.2, t103 + 2.8, 2100, 1500, 1.28);
	const dusk: Spec[] = [...SIX, 'wyatt'].map((n) => clearingSpec(n, {frame: f, look: [1, 0], mouth: 'flat'}));
	// ---- the trail, Cole's story: she lags behind, he reaches for her shoulder - empty air - she's a foot to the left
	const tr = GEO.trail.ground;
	const niaX = t < t105 ? 760 : 640;
	const niaOn = t < t105 || t >= t106;
	// ---- inside at night: the six, Wyatt, Cole by the door with the rifle
	// Dez sits on the bench now (Lucia's place), Cole stands by the door with the rifle
	const inside: Spec[] = [...SIX, 'wyatt'].map((n) =>
		trailerSpec(n, {frame: f, look: [1, 0], eyes: t >= t109 ? 'wide' : 'dot', brows: t >= t107 ? 'worried' : 'none', mouth: t >= t107 && t < t109 ? 'frown' : t >= t109 ? 'o' : 'flat', pale: t >= t111 ? 0.35 : 0, ...(n === 'wyatt' ? {x: 520} : {}), ...(n === 'dez' ? {x: 920, pose: 'sit', s: 1.3 * 1.1, y: T.seat + 72 * 1.3 * 1.1} : {}), ...(n === 'jalen' ? {x: 1660} : {})}),
	);
	inside.push({is: Cole, name: 'cole', x: 1480, y: 990, s: 1.5, frame: f, prop: 'rifle', arms: 'hold', look: [1, 0], brows: 'flat'});
	const Bin = boxesOf(inside);
	const doorJit = t >= t109 && t < t111 ? 1 : 0;
	// ---- two a.m.: Cole kicks the door open and fires into the sky; the crawler
	const crawlK = ramp(t, t118 + 0.3, t119 + 0.2);
	const backK = ramp(t, t119 + 0.5, t119 + 1.4);
	const crawlX = lerp(-120, 520, crawlK) - backK * 700;
	const fire1 = t >= tFired && t < tFired + 0.25 ? 1 : 0;
	const fire2 = t >= t119 + 0.2 && t < t119 + 0.45 ? 1 : 0;
	const cole = {x: C.door[0] + 60, y: C.steps[1] + 70, s: 1.2};
	const gunTip: [number, number] = [cole.x - 0.42 * 150 * cole.s - 10, cole.y - 205 * cole.s - 0.91 * 150 * cole.s];

	const shots = [
		shot(0, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'dusk'}),
		shot(c01 - 0.2, 'clearing_day', 1.8, 1.9, [1450, 600], [1450, 590], {light: 'dusk'}),
		shot(t104, 'trail_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'torch'}),
		shot(t105, 'trail_night', 1.6, 1.6, [760, 650], [760, 650], {light: 'torch'}),
		shot(tW, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		fshot(Bin, t109, 'trailer_night', 2.0, [1535, 560], {light: 'warm', shake: 3}),
		fshot(Bin, t111, 'trailer_night', 2.2, [520, 620], {light: 'warm'}),
		shot(t112, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		shot(t2, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(tFired - 0.05, 'clearing_night', 1.0, 1.0, [960, 540], [960, 540], {shake: 10}),
		shot(c02 - 0.1, 'clearing_night', 1.7, 1.8, [cole.x, 560], [cole.x, 560]),
		shot(t115, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(t117, 'clearing_night', 1.0, 1.0, [960, 540], [960, 540], {shake: 8}),
		shot(t118, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(t120, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(tDQ, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'dawn'}),
	];
	const world = (set: string) => {
		if (set === 'clearing_day') {
			return (
				<g>
					<Group people={dusk} />
					{t < tDQ ? <Person is={Cole} name="cole" x={cw.x} y={1045} s={1.28} frame={f} prop="lantern" pose={cw.moving ? 'walk' : 'stand'} turn={-0.8} phase={cw.phase} mouth={coleT.talk > 0 ? 'open' : 'flat'} talk={coleT.talk} viseme={coleT.viseme} look={[-1, 0]} edge={cw.x > 1800} /> : null}
				</g>
			);
		}
		if (set === 'trail_night') {
			return (
				<g>
					<Person is={Cole} name="cole" x={1000} y={tr + 10} s={1.3} frame={f} prop="lantern" arms={t >= t104 + 1 && t < t106 ? 'grabLeft' : 'down'} turn={-0.4} look={[-1, 0]} eyes={t >= t105 ? 'wide' : 'dot'} brows={t >= t105 ? 'worried' : 'none'} />
					{niaOn ? <Person is={WrongNia} name="wrong-nia" x={niaX} y={tr + 6} s={1.22} frame={f} mouth="grin" look={[1, 0]} /> : null}
				</g>
			);
		}
		if (set === 'trailer_night') {
			return (
				<g>
					<PlateShake plate="trailer_night" x0={T.door[0] - 20} y0={T.door[1] - 20} x1={T.door[2] + 20} y1={T.door[3] + 20} k={doorJit} frame={f} />
					<Group people={inside} />
					<Smell k={t >= t107 && t < t2 ? 0.8 : 0} frame={f} color="#9a6a5a" y0={300} y1={900} />
					{t >= t110 && t < t111
						? [0, 1, 2].map((i) => <path key={i} d={`M${1650 - i * 30},${520 - i * 40} q20,-20 0,-40`} fill="none" stroke="#e9e1c7" strokeWidth={5} opacity={0.4 + 0.3 * Math.sin(f / 3 + i)} />)
						: null}
				</g>
			);
		}
		// clearing at night
		const coleOut = t >= t114 && t < tDQ;
		return (
			<g>
				<Campfire x={C.fire[0]} y={C.fire[1]} s={0.6} lit={0.3} frame={f} />
				<DoorOpen r={C.door} open={coleOut ? 1 : 0} />
				<PlateShake plate="clearing_night" x0={0} y0={120} x1={1920} y1={560} k={t >= t115 && t < t118 ? 0.5 : 0} frame={f} />
				{coleOut ? <Person is={Cole} name="cole" x={cole.x} y={cole.y} s={cole.s} frame={f} prop="rifle" arms="hold" mouth={coleT.talk > 0 ? 'shout' : 'flat'} talk={coleT.talk} viseme={coleT.viseme} look={t >= t118 ? [-1, 0.5] : [-0.3, -0.8]} brows="angry" /> : null}
				<Flash x={gunTip[0]} y={gunTip[1]} k={fire1} />
				<Flash x={cole.x - 120} y={cole.y - 230} k={fire2} />
				{t >= t118 && t < t120 ? (
					<g>
						<Crawler x={crawlX} y={1010} s={1.6} frame={f} phase={t * 9} flip={backK > 0} />
						<QAShape name="crawler" x0={crawlX - 150} y0={880} x1={crawlX + 190} y1={1010} edge />
					</g>
				) : null}
				{t >= t120 && t < tDQ ? <rect width={1920} height={1080} fill="#4a5a7a" opacity={ramp(t, t120, t121 + 2) * 0.25} style={{mixBlendMode: 'screen'}} /> : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
