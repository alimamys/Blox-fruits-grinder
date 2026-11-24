// 2. GRANDMA'S HOUSE - the house; her room was his; breakfast: "a man on my bed"; four o'clock; he stops.
import React from 'react';
import {Dad} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {shot, Shots, useStick, walk, type Shot} from '../stick/kit';
import {Kitchen, SEAT} from './common';

export const Breakfast: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t12 = T('narrator_012_stopped');
	const t13 = T('narrator_013_smiled');
	const shots: Shot[] = [
		// the house on a summer morning
		shot(0, 'exterior_day', 1.0, 1.06, [960, 560], [960, 540]),
		// "...my grandmother's old house..."
		shot(T('narrator_009_moved'), 'exterior_day', 1.06, 1.3, [960, 540], [1060, 480]),
		// "I got the little bedroom at the end of the hall. The room that used to be his." - the upstairs window
		shot(T('narrator_010_his_room'), 'exterior_day', 2.0, 2.4, [1090, 480], [1100, 480]),
		// "At breakfast, I told him."
		shot(T('narrator_011_told_him'), 'kitchen_day', 1.0, 1.06, [960, 560], [920, 560], {tag: 'k'}),
		// LILY: "Dad, there was a man on my bed last night..."
		shot(T('lily_001_man_on_bed'), 'kitchen_day', 2.0, 2.1, [1230, 700], [1230, 700], {tag: 'k'}),
		// DAD: "That's a nightmare, bug..."
		shot(T('dad_001_nightmare'), 'kitchen_day', 2.0, 2.05, [640, 700], [640, 700], {tag: 'k'}),
		// LILY: "It was four o'clock. I looked at the clock."
		shot(T('lily_002_four'), 'kitchen_day', 2.4, 2.5, [1230, 690], [1230, 695], {tag: 'k'}),
		// "My dad stopped buttering his toast."
		shot(t12, 'kitchen_day', 2.8, 2.95, [630, 690], [630, 695], {tag: 'k'}),
		// "Just for a second. Then he smiled, kissed the top of my head..."
		shot(t13, 'kitchen_day', 1.25, 1.25, [960, 600], [960, 600], {tag: 'kiss'}),
		// "I didn't read scary books."
		shot(T('narrator_014_didnt'), 'kitchen_day', 2.4, 2.5, [1230, 690], [1230, 690], {tag: 'k'}),
	];
	const world = (s: Shot) => {
		if (s.set !== 'kitchen_day') return null;
		const ld = talk('lily');
		const dd = talk('dad');
		const frozen = t >= t12 && t < t13 + 0.6;
		const lilyP = {talk: ld.talk, viseme: ld.viseme, eyes: 'wide' as const, brows: 'worried' as const, look: [-1, 0] as [number, number], mouth: 'flat' as const};
		if (s.tag === 'kiss') {
			// he gets up, comes round, kisses the top of her head
			const w = walk(t, t13 + 0.8, t13 + 2.2, SEAT.left.x, SEAT.right.x - 150, 2.0);
			const leaning = t > t13 + 2.2;
			return (
				<g>
					<Kitchen f={f} left={null} r={{...lilyP, look: [-0.6, -0.4], eyes: 'dot', brows: 'flat'}} />
					<Person is={Dad} name="dad" x={w.x} y={1020} s={2.0} frame={f} pose={w.moving ? 'walk' : 'stand'} turn={w.moving ? 0.8 : 0.4} phase={w.phase} lean={leaning ? 22 : 0} mouth="smile" eyes={leaning ? 'closed' : 'dot'} />
				</g>
			);
		}
		return (
			<Kitchen
				f={f}
				l={{talk: dd.talk, viseme: dd.viseme, mouth: frozen ? 'flat' : 'smile', idle: !frozen, eyes: frozen ? 'wide' : 'dot', look: [1, 0], arms: frozen ? {l: [28, -64], r: [44, -110]} : {l: [28, -64], r: [36, -80 + Math.sin(t * 6) * 10]}}}
				r={lilyP}
			/>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
