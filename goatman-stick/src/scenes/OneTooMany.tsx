// 5. ONE TOO MANY - the second night: ghost stories, the smell, everybody in the trailer; I cook twelve hot
// dogs; "Yo, why'd you take two?"; I count - eleven; Nia screams; we spill outside; eleven again.
import React from 'react';
import {Stranger, PAL} from '../components/characters/Cast';
import {BigWords, Campfire, Counts, DoorOpen, Person, PotTop, Smell} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, clearingSpec, Group, headOf, TRAILER_ALL, trailerSpec, type Spec} from '../stick/places';

const ELEVEN = ['marcus', 'ray', 'dez', 'nia', 'kayla', 'tasha', 'jalen', 'malik', 'lucia', 'andre', 'wyatt'];

export const OneTooMany: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t56 = at('narrator_056_second_night');
	const t57 = at('narrator_057_gagging');
	const t58 = at('narrator_058_crowded');
	const t59 = at('narrator_059_so_i_cooked');
	const t60 = at('narrator_060_three_packs');
	const t61 = at('narrator_061_you_know');
	const r02 = at('ray_002_took_two');
	const m01 = at('marcus_001_twelve');
	const t62 = at('narrator_062_stopped');
	const t63 = at('narrator_063_counted');
	const tCount = at('counting');
	const t64 = at('narrator_064_eleven');
	const t65 = at('narrator_065_nia_screaming');
	const n01 = at('nia_001_get_it_out');
	const t66 = at('narrator_066_crashed');
	const t67 = at('narrator_067_counted_again');
	const t68 = at('narrator_068_eleven');
	const t69 = at('narrator_069_sticks');
	const t70 = at('narrator_070_empty');
	const t71 = at('narrator_071_knee');
	const t72 = at('narrator_072_not_words');
	const t73 = at('narrator_073_its_face');
	const t74 = at('narrator_074_neither');
	const rayT = talk('ray');
	const marT = talk('marcus');
	const niaT = talk('nia');
	const C = GEO.clearing;

	// ---- around the fire
	const fire: Spec[] = ELEVEN.map((n) =>
		clearingSpec(n, {
			frame: f,
			look: n === 'andre' ? [-1, 0] : [0.5, 0.3],
			prop: n === 'andre' && t < t57 ? 'flashlight' : 'none',
			arms: n === 'andre' && t < t57 ? 'phoneEar' : n === 'kayla' && t >= t57 ? 'fingerLips' : 'down',
			mouth: n === 'andre' && t < t57 ? 'grin' : t >= t57 ? 'frown' : 'smile',
			eyes: t >= t57 ? 'squint' : 'dot',
			lean: n === 'kayla' && t >= t57 ? 14 : 0,
		}),
	);
	// ---- in the trailer, with one too many
	const ray0 = trailerSpec('ray');
	const rayW = walk(t, r02 - 1.2, r02 - 0.2, ray0.x, 220, ray0.s);
	const panic = t >= t65;
	const inside: Spec[] = TRAILER_ALL.map((n) => {
		const o: Record<string, unknown> = {frame: f, look: [0.2, 0.2], mouth: 'flat'};
		if (n === 'marcus') Object.assign(o, {arms: t < r02 ? 'handsForward' : 'down', look: t >= r02 && t < t62 ? [-1, 0] : [-0.8, 0.4], mouth: marT.talk > 0 ? 'open' : 'flat', talk: marT.talk, viseme: marT.viseme, brows: t >= t62 ? 'worried' : 'none', eyes: t >= t62 ? 'wide' : 'dot'});
		if (n === 'ray') Object.assign(o, {x: rayW.x, ...(rayW.moving ? {pose: 'walk', turn: 0.8, phase: rayW.phase} : {}), look: [1, 0], mouth: rayT.talk > 0 ? 'open' : 'flat', talk: rayT.talk, viseme: rayT.viseme});
		if (n === 'nia') Object.assign(o, panic ? {pose: 'stand', y: 990, s: 1.45, x: 600, mouth: niaT.talk > 0 ? 'scream' : 'scream', talk: niaT.talk, eyes: 'wide', brows: 'worried', arms: 'armsUp', look: [1, 0]} : {});
		if (n === 'thing') Object.assign(o, {look: [-1, 0.2], lean: t >= t65 - 1.5 && t < t65 ? -14 : 0, mouth: t >= t65 - 1.5 && t < t65 ? 'open' : 'flat', talk: t >= t65 - 1.5 && t < t65 ? 0.3 : 0, eyes: t >= t63 ? 'none' : 'dot'});
		if (panic && n !== 'nia' && n !== 'thing') Object.assign(o, {eyes: 'wide', mouth: 'o', look: [-0.6, 0], brows: 'worried'});
		return trailerSpec(n, o);
	}).filter((p) => !(p.name === 'thing' && t >= t65 + 0.4));
	const B = boxesOf(inside);
	const elevenHeads = inside.filter((p) => p.name !== 'thing').sort((a, b) => a.x - b.x).map(headOf);
	const marcus = inside.find((p) => p.name === 'marcus')!;
	const nia = inside.find((p) => p.name === 'nia')!;

	// ---- spilling out of the door into the clearing
	const outK = (i: number) => ramp(t, t66 + 0.2 + i * 0.18, t66 + 1.4 + i * 0.18);
	const out: Spec[] = ELEVEN.map((n, i) => {
		const home = clearingSpec(n, {frame: f, eyes: 'wide', mouth: 'o', brows: 'worried', look: [0.6, -0.2]});
		const k = outK(i);
		const x = lerp(C.door[0] + 70, home.x, k);
		const y = lerp(C.steps[3] + 30, home.y, k);
		const withSticks = t >= t69 && i < 5;
		if (t < t66 + 0.2 + i * 0.18) return null;
		const toDoor = t >= t69 && i < 5 ? ramp(t, t69 + 0.4, t69 + 2.4) : 0;
		return {
			...home,
			x: lerp(x, C.door[0] - 120 + i * 60, toDoor),
			y: lerp(y, 1010, toDoor),
			...(k > 0 && k < 1 ? {pose: 'run', turn: home.x > C.door[0] ? 0.8 : -0.8, phase: k * 18} : {}),
			prop: withSticks ? (i % 2 ? 'stick' : 'flashlight') : 'none',
			arms: withSticks && i % 2 ? 'holdOne' : 'down',
			overlapOk: k > 0 && k < 1,
		};
	}).filter(Boolean) as Spec[];
	const outHeads = out.slice().sort((a, b) => a.x - b.x).map(headOf);

	const W = {light: 'warm' as const};
	const shots = [
		shot(0, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(t57, 'clearing_night', 1.75, 1.75, [1371, 680], [1371, 680]),
		shot(t58, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		fshot(B, t59, 'trailer_night', 2.2, [marcus.x, headOf(marcus)[1] + 170], W),
		shot(t60, 'black', 1.0, 1.04, [960, 540]),
		shot(t61, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		fshot(B, r02 - 0.2, 'trailer_night', 1.9, [280, 620], W),
		fshot(B, m01 - 0.1, 'trailer_night', 2.5, [marcus.x, headOf(marcus)[1] + 130], W),
		fshot(B, t62, 'trailer_night', 3.0, [marcus.x, headOf(marcus)[1] + 100], W),
		shot(t63, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		fshot(B, t65, 'trailer_night', 2.0, [700, 620], W),
		shot(t66, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(t69, 'clearing_night', 1.5, 1.5, [1450, 640], [1450, 640]),
		shot(t70, 'trailer_night', 1.0, 1.04, [960, 540], [960, 560], W),
		fshot(B, t71, 'trailer_night', 2.2, [710, 640], {light: 'dark'}),
		fshot(B, t72, 'trailer_night', 3.0, [710, 560], {light: 'dark'}),
		fshot(B, t73, 'trailer_night', 3.2, [780, 560], {light: 'dark'}),
		shot(t74, 'clearing_night', 1.0, 1.0, [960, 540]),
	];

	const world = (set: string) => {
		if (set === 'black') return <PotTop n={12} frame={f} />;
		if (set === 'clearing_night') {
			if (t < t66) {
				return (
					<g>
						<Campfire x={C.fire[0]} y={C.fire[1]} s={0.9} frame={f} />
						<Group people={fire} />
						<Smell k={ramp(t, t57, t57 + 1)} frame={f} color="#c98a6a" y0={380} y1={980} />
					</g>
				);
			}
			// going back in: only the four with sticks and torches, walking up to the door in single file
			const four = ['dez', 'jalen', 'andre', 'wyatt'];
			const sticks: Spec[] = four.map((n, i) => {
				const w = walk(t, t69 + 0.2 + i * 0.3, t69 + 2.6 + i * 0.3, 1950 + i * 200, C.door[0] + 120 + i * 170, 1.28);
				return clearingSpec(n, {x: w.x, y: 1030, frame: f, ...(w.moving ? {pose: 'walk', turn: -0.8, phase: w.phase} : {}), prop: i % 2 ? 'stick' : 'flashlight', arms: i % 2 ? 'holdOne' : 'down', look: [-1, -0.1], brows: 'worried', edge: w.x > 1800});
			});
			const people = t >= t74 ? ELEVEN.map((n, i) => clearingSpec(n, {frame: f, look: [i % 2 ? -1 : 1, 0.1], brows: 'worried', mouth: 'flat'})) : t >= t69 ? sticks : out;
			return (
				<g>
					<Campfire x={C.fire[0]} y={C.fire[1]} s={0.8} lit={0.6} frame={f} />
					<DoorOpen r={C.door} open={t < t70 ? 1 : 0} />
					<Group people={people} />
					{t >= t67 && t < t69 ? <Counts heads={outHeads} t0={t67 + 0.3} t={t} step={Math.min(0.2, (t68 - t67 - 0.4) / 11)} /> : null}
					{t >= t68 && t < t69 ? <g /> : null}
				</g>
			);
		}
		// trailer
		if (t >= t70 && t < t71) return null; // empty
		if (t >= t71) {
			// the flashback: Nia on the bench, the one beside her with its hand on her knee, whispering
			const two: Spec[] = [trailerSpec('nia', {frame: f, eyes: 'wide', brows: 'worried', look: [1, 0], mouth: 'flat'}), trailerSpec('thing', {frame: f, arms: 'grabLeft', lean: -12, look: [-1, 0.2], mouth: t >= t72 ? 'open' : 'flat', talk: t >= t72 && t < t73 ? Math.max(0, Math.sin(t * 17)) * 0.5 : 0, eyes: t >= t73 ? 'none' : 'dot', palette: t >= t73 ? {...PAL.stranger, skin: [PAL.dez, PAL.lucia, PAL.tasha, PAL.andre][Math.floor(f / 4) % 4].skin} : undefined})];
			return (
				<g>
					<Group people={two} />
					{t >= t72 && t < t73
						? [0, 1, 2].map((i) => <path key={i} d={`M${740 - i * 18},${470 + i * 12} q-14,-10 -28,0 q-14,10 -28,0`} fill="none" stroke="#d9d2b8" strokeWidth={3} opacity={0.7} />)
						: null}
				</g>
			);
		}
		return (
			<g>
				<Group people={inside} />
				{t >= tCount && t < t65 ? <Counts heads={elevenHeads} t0={tCount} t={t} step={Math.min(0.24, (t64 - tCount + 0.6) / 11)} /> : null}
				{t >= t64 && t < t65 ? <g /> : null}
			</g>
		);
	};
	void end;
	void nia;
	void Stranger;
	void Person;
	return (
		<>
			<Shots shots={shots} world={(s) => world(s.set)} />
			{t >= t64 && t < t65 ? <BigWords text="11" size={220} k={ramp(t, t64, t64 + 0.2)} color="#ffd21a" y={-260} /> : null}
			{t >= t68 && t < t69 ? <BigWords text="11" size={220} k={ramp(t, t68, t68 + 0.2)} color="#ffd21a" y={-260} /> : null}
		</>
	);
};
