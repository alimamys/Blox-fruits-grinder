// 4. THE GOATMAN - Ray's legend: a man's body, a goat's head; it wears faces and sits down among you.
// The smell stops like a switch. By morning it's "local guys messing with the city kid".
import React from 'react';
import {PAL, Stranger} from '../components/characters/Cast';
import {GoatShape} from '../components/characters/Thing';
import {Campfire, Person, QAShape, Smell} from '../stick/goat';
import {fshot, GEO, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, clearingSpec, Group, headOf, trailerSpec, type Spec} from '../stick/places';

const ELEVEN = ['ray', 'marcus', 'wyatt', 'nia', 'kayla', 'lucia', 'tasha', 'andre', 'dez', 'jalen', 'malik'];

export const Goatman: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t43 = at('narrator_043_ray_quiet');
	const r01 = at('ray_001_goatman');
	const t44 = at('narrator_044_shut_up');
	const t45 = at('narrator_045_kept_going');
	const t46 = at('narrator_046_stories');
	const t47 = at('narrator_047_never_see');
	const t48 = at('narrator_048_wears_faces');
	const t49 = at('narrator_049_walks_into');
	const t50 = at('narrator_050_smell_stopped');
	const tStop = word('narrator_050_smell_stopped', 'stopped', 0.85);
	const t51 = at('narrator_051_didnt_fade');
	const tM = at('morning');
	const t53 = at('narrator_053_local_guys');
	const t54 = at('narrator_054_normal');
	const t55 = at('narrator_055_worst_part');
	const rayT = talk('ray');

	const scared = t >= t49;
	const inside: Spec[] = ELEVEN.map((n) => {
		const o: Record<string, unknown> = {frame: f, look: n === 'ray' ? [1, 0.2] : [-0.9, 0.1], mouth: 'flat'};
		if (n === 'ray') Object.assign(o, {mouth: rayT.talk > 0 ? 'open' : 'flat', talk: rayT.talk || (t >= t45 && t < t46 ? Math.max(0, Math.sin(t * 11)) * 0.5 : 0), viseme: rayT.viseme, brows: 'worried', eyes: 'wide'});
		else if (t >= t44 && t < t45) Object.assign(o, {mouth: n.length % 2 ? 'shout' : 'open', talk: Math.max(0, Math.sin(t * 9 + n.length)) * 0.6, arms: n.length % 2 ? 'shrug' : 'point', look: [-1, 0]});
		if (scared && t < tM) Object.assign(o, {look: [0, -0.8], eyes: 'wide', mouth: 'o'});
		return trailerSpec(n, o);
	});
	const B = boxesOf(inside);
	const ray = inside.find((p) => p.name === 'ray')!;

	// the clearing, next day: laughing at the city kid
	const day: Spec[] = ELEVEN.map((n) =>
		clearingSpec(n, {
			frame: f,
			look: n === 'marcus' ? [1, 0] : [-0.8, 0],
			mouth: t < t54 ? (n === 'marcus' ? 'flat' : 'laugh') : 'smile',
			arms: t < t54 ? (n === 'marcus' ? 'shrug' : n.length % 3 === 0 ? 'point' : 'down') : 'down',
		}),
	);
	// the legend: a group by the fire, and one more walks in and stands with them
	const legend: Spec[] = ['marcus', 'ray', 'dez', 'nia', 'kayla', 'tasha', 'jalen', 'malik', 'lucia', 'andre'].map((n) => clearingSpec(n, {frame: f, look: [0.3, 0.4]}));
	const sw = walk(t, t49 + 0.3, t49 + 3.0, 2050, 1610, 1.08);
	const marcusDay = day.find((p) => p.name === 'marcus')!;

	const shots = [
		fshot(B, t43, 'trailer_night', 2.2, [ray.x + 40, headOf(ray)[1] + 170], {light: 'warm'}),
		fshot(B, r01 - 0.15, 'trailer_night', 2.7, [ray.x + 30, headOf(ray)[1] + 130], {light: 'warm'}),
		shot(t44, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		fshot(B, t45, 'trailer_night', 2.2, [ray.x + 40, headOf(ray)[1] + 170], {light: 'warm'}),
		shot(t46, 'trail_night', 1.0, 1.12, [960, 540], [960, 600], {light: 'torch'}),
		shot(t48, 'black', 1.0, 1.0, [960, 540]),
		shot(t49, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(t50, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		shot(tM, 'clearing_day', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(day), t55, 'clearing_day', 2.4, [marcusDay.x, headOf(marcusDay)[1] + 150]),
	];
	const world = (set: string) => {
		if (set === 'trail_night') {
			const k = ramp(t, t46 + 0.6, t46 + 2.0) * (1 - ramp(t, t47 + 0.4, t48 - 0.1));
			return (
				<g>
					<ellipse cx={960} cy={700} rx={430} ry={330} fill="#7d8aa8" opacity={0.55 * k} />
					<ellipse cx={960} cy={700} rx={260} ry={220} fill="#a9b4cc" opacity={0.35 * k} />
					<GoatShape x={960} y={940} s={1.35} frame={f} opacity={k * 0.92} />
					{k > 0.2 ? <QAShape name="goat" x0={860} y0={430} x1={1060} y1={940} /> : null}
				</g>
			);
		}
		if (set === 'black') {
			const faces = [PAL.dez, PAL.lucia, PAL.jalen, PAL.kayla, PAL.andre, PAL.tasha];
			const fc = faces[Math.floor(f / 4) % faces.length];
			return (
				<g>
					<rect width={1920} height={1080} fill="#0b0b0d" />
					<Person is={Stranger} name="stranger" x={960} y={1390} s={3.3} frame={f} idle={false} eyes={Math.floor(f / 4) % 3 === 0 ? 'none' : 'gray'} mouth="flat" look={[0, 0]} palette={{...PAL.stranger, skin: fc.skin, hair: fc.hair}} />
				</g>
			);
		}
		if (set === 'clearing_night') {
			return (
				<g>
					<Campfire x={GEO.clearing.fire[0]} y={GEO.clearing.fire[1]} s={0.9} frame={f} />
					<Group people={legend} />
					{t >= t49 + 0.3 ? <Person is={Stranger} name="stranger" x={sw.x} y={920} s={1.08} frame={f} pose={sw.moving ? 'walk' : 'stand'} turn={-0.8} phase={sw.phase} look={[-0.6, 0.3]} edge={sw.x > 1800} /> : null}
				</g>
			);
		}
		if (set === 'trailer_night') {
			const smellK = t >= t50 && t < tStop ? 1 : 0;
			return (
				<g>
					<Group people={inside} />
					<Smell k={smellK} frame={f} color="#c98a6a" y0={300} y1={900} />
				</g>
			);
		}
		// clearing by day
		void t51;
		void t53;
		return <Group people={day} />;
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
