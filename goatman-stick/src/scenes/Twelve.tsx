// 1. TWELVE - cold open: three packs of hot dogs, everybody got one, twelve gone, eleven of us,
// something sitting with us - and nobody can say whose face it was wearing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disclaimer} from '../components/ui/Phone';
import {PAL} from '../components/characters/Cast';
import {FPS} from '../data/timeline';
import {Counts, PotTop, TitleCardGoat} from '../stick/goat';
import {fshot, GEO, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, Group, headOf, TRAILER_ALL, trailerSpec, type Spec} from '../stick/places';

export const Twelve: React.FC = () => {
	const {f, t, at, end, total} = useStick();
	void end;
	const T1 = at('narrator_001_three_packs');
	const t02 = at('narrator_002_twelve');
	const t03 = at('narrator_003_cooked_myself');
	const t04 = at('narrator_004_everybody_one');
	const t05 = at('narrator_005_seconds');
	const t06 = at('narrator_006_hadnt');
	const t07 = at('narrator_007_eleven_of_us');
	const t08 = at('narrator_008_twelve_gone');
	const t09 = at('narrator_009_sitting_with_us');
	const t10 = at('narrator_010_eating_with_us');
	const t11 = at('narrator_011_whole_day');
	const t12 = at('narrator_012_whose_face');
	const tF = at('faces');
	const tB = at('cut_black');
	const tT = at('title');
	if (t < T1) {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<Disclaimer f={f} d={Math.round(T1 * FPS)} />
			</AbsoluteFill>
		);
	}
	if (t >= tT) return <TitleCardGoat f={f - Math.round(tT * FPS)} d={Math.round((total - tT) * FPS)} />;
	if (t >= tB) return <AbsoluteFill style={{background: '#000'}} />;

	const pot = GEO.trailer.pot;
	const ray = walk(t, t05 + 0.2, t05 + 1.6, 140, 210, 1.45);
	const eating = t >= t04;
	// the stranger's face will not settle on anybody
	const faces = [PAL.dez, PAL.lucia, PAL.jalen, PAL.kayla, PAL.andre];
	const flick = t >= t12 ? faces[Math.floor(f / 3) % faces.length] : null;
	const people: Spec[] = TRAILER_ALL.map((n) => {
		const o: Record<string, unknown> = {frame: f, prop: eating && n !== 'marcus' ? 'hotdog' : 'none', arms: eating && n !== 'marcus' ? 'holdOne' : undefined};
		if (n === 'marcus') Object.assign(o, {arms: 'handsForward', look: t >= t06 && t < t07 ? [0.4, 0] : [-0.8, 0.4], brows: t >= t06 ? 'worried' : 'none', mouth: t >= t06 ? 'flat' : 'faint', turn: -0.3});
		if (n === 'ray') Object.assign(o, {x: ray.x, ...(ray.moving ? {pose: 'walk', turn: 0.8, phase: ray.phase} : {}), look: t > t05 + 1.6 ? [1, 0] : [0.5, 0.5], mouth: t > t05 + 2 && t < t06 ? 'open' : 'smile', talk: t > t05 + 2 && t < t06 ? Math.max(0, Math.sin(t * 12)) * 0.6 : 0});
		if (n === 'thing') Object.assign(o, {look: [0, 0], mouth: 'flat', eyes: t >= t12 ? 'none' : 'dot', palette: flick ? {...PAL.stranger, skin: flick.skin, hair: flick.hair} : undefined});
		return trailerSpec(n, o);
	});
	const thing = people.find((p) => p.name === 'thing')!;
	const marcus = people.find((p) => p.name === 'marcus')!;
	const eleven = people.filter((p) => p.name !== 'thing').sort((a, b) => a.x - b.x).map(headOf);
	const thingHead = headOf(thing);
	const B = boxesOf(people);
	const W = {light: 'warm' as const};

	const shots = [
		fshot(B, T1, 'trailer_night', 2.3, [320, 600], W),
		shot(t02, 'black', 1, 1.04, [960, 540]),
		shot(t03, 'trailer_night', 1.94, 1.94, [495, 640], [495, 640], W),
		shot(t04, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		fshot(B, t05, 'trailer_night', 1.6, [330, 640], W),
		fshot(B, t06, 'trailer_night', 2.6, [marcus.x + 20, headOf(marcus)[1] + 110], W),
		shot(t07, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		shot(t08, 'black', 1.05, 1.0, [960, 540]),
		shot(t09, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], W),
		shot(t10, 'trailer_night', 2.69, 2.69, [773, thingHead[1] + 150], [773, thingHead[1] + 150], W),
		fshot(B, t11, 'trailer_night', 1.5, [thing.x + 60, 620], W),
		fshot(B, t12, 'trailer_night', 3.0, [thing.x, thingHead[1] + 95], W),
		fshot(B, tF, 'trailer_night', 3.4, [thing.x, thingHead[1] + 90], W),
	];
	const world = (set: string) => {
		if (set === 'black') return <PotTop n={t < t08 ? 12 : 0} frame={f} steam={t < t08} />;
		return (
			<g>
				<Group people={people} />
				{t >= t07 && t < t08 ? <Counts heads={eleven} t0={t07 + 0.3} t={t} step={Math.min(0.3, (end('narrator_007_eleven_of_us') - t07 - 0.4) / 11)} /> : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
// pot position used by the close-ups
export const POT = GEO.trailer.pot;
