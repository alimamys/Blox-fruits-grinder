// 4. DAD READS IT - the kitchen at dusk; he reads it twice; "I know, bug."; he'll sleep in her room; "Then it'll find me."
import React from 'react';
import {Lily, PAL} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {shot, Shots, useStick, type Shot} from '../stick/kit';
import {Diary as Notebook, Glow} from '../stick/props';
import {Kitchen, SEAT} from './common';

export const DadReads: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots: Shot[] = [
		// "I showed him the diary. I watched him read it twice."
		shot(T('narrator_021_showed'), 'kitchen_day', 1.1, 1.15, [900, 600], [880, 600], {light: 'dusk', tag: 'two'}),
		// DAD: "Where did you find this?"
		shot(T('dad_002_where'), 'kitchen_day', 2.1, 2.2, [600, 700], [600, 700], {light: 'dusk', tag: 'two'}),
		// LILY: "Dad, it said the second time it comes closer. It was on my bed..."
		shot(T('lily_003_closer'), 'kitchen_day', 2.2, 2.3, [1200, 680], [1200, 680], {light: 'dusk', tag: 'two'}),
		// DAD: "I know, bug. I know."
		shot(T('dad_003_i_know'), 'kitchen_day', 2.6, 2.75, [600, 690], [600, 695], {light: 'dusk', tag: 'two'}),
		// "He didn't say 'it was a dream' this time. He said I was sleeping with Mom tonight..."
		shot(T('narrator_022_not_a_dream'), 'kitchen_day', 1.3, 1.35, [860, 620], [860, 620], {light: 'dusk', tag: 'two'}),
		// LILY: "But what if it comes back?"
		shot(T('lily_004_what_if'), 'kitchen_day', 2.4, 2.5, [1200, 680], [1200, 680], {light: 'dusk', tag: 'two'}),
		// DAD: "Then it'll find me."
		shot(T('dad_004_find_me'), 'kitchen_day', 2.9, 3.1, [600, 690], [600, 690], {light: 'dusk', tag: 'two'}),
		// night falls on the house
		shot(at('night_falls'), 'exterior_night', 1.0, 1.08, [960, 560], [1060, 480]),
	];
	const world = (s: Shot) => {
		if (s.set === 'exterior_night') {
			const lit = t < at('night_falls') + 1.0;
			return lit ? <Glow cx={1100} cy={480} r={110} color="#ffd98a" k={0.8} /> : null;
		}
		const ld = talk('lily');
		const dd = talk('dad');
		const reading = t < T('dad_002_where');
		return (
			<g>
				{/* she stands at his side; he holds the diary */}
				<Kitchen
					f={f}
					right={null}
					l={{talk: dd.talk, viseme: dd.viseme, look: reading ? [0, 0.9] : [1, -0.2], brows: 'worried', eyes: t > T('dad_003_i_know') ? 'dot' : 'wide', mouth: t > T('dad_004_find_me') ? 'flat' : 'frown', arms: {l: [24, -100], r: [24, -100]}}}
				/>
				<Notebook x={SEAT.left.x} y={SEAT.left.y - 250} s={1.1} frame={f} open={reading ? 1 : 0.5} />
				<Person is={Lily} name="lily" x={1180} y={1110} s={2.0} child frame={f} palette={PAL.lilyDay} talk={ld.talk} viseme={ld.viseme} look={[-1, 0]} eyes="wide" brows="worried" mouth="frown" tears={t > T('lily_003_closer') && t < T('dad_003_i_know', 1) ? 0.6 : 0} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
