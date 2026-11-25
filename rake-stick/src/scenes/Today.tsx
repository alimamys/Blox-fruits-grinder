// 7. TODAY - Mom and Lily moved 800 miles away; she grew up, had a son, told herself it was the house.
// Sam is nine. At breakfast: "Who's the skinny man? ... He just watches." It was never the house. It was us.
import React from 'react';
import {Son} from '../components/characters/Cast';
import {LieInBed} from '../stick/bed';
import {GEO, shot, Shots, useStick, type Shot} from '../stick/kit';
import {BedClock, Glow} from '../stick/props';
import {Rake} from '../stick/rake';
import {Kitchen} from './common';

const SB = GEO.son;

/** Sam asleep in his room at night (the clock on his nightstand) */
export const SamAsleep: React.FC<{f: number; clock?: string; eyes?: 'closed' | 'wide'}> = ({f, clock = '4:00', eyes = 'closed'}) => (
	<g>
		<Glow cx={720} cy={300} r={460} color="#a9d2e6" k={0.3} />
		<BedClock x={GEO.sonRoom.clock[0]} y={GEO.sonRoom.clock[1]} text={clock} frame={f} />
		<LieInBed b={SB} is={Son} px={262} s={1.75} child frame={f} id="sam" p={{eyes, brows: eyes === 'wide' ? 'worried' : 'flat', mouth: eyes === 'wide' ? 'o' : 'flat', look: [1, -0.5]}} />
	</g>
);

export const Today: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots: Shot[] = [
		// "Mom and I moved eight hundred miles away. I never went back to that house."
		shot(T('narrator_041_moved'), 'newhouse_day', 1.0, 1.08, [960, 560], [960, 540]),
		// "I grew up. I had a son. For twenty-five years, I told myself it was the house."
		shot(T('narrator_042_grew_up'), 'kitchen2_day', 1.15, 1.22, [760, 640], [720, 650], {tag: 'alone'}),
		// "Sam is nine now. This morning, at breakfast, he asked me a question."
		shot(T('narrator_043_sam'), 'kitchen2_day', 1.05, 1.1, [920, 600], [900, 610], {tag: 'two'}),
		// SAM: "Mom? Who's the skinny man?"
		shot(T('son_001_skinny_man'), 'kitchen2_day', 2.3, 2.4, [1230, 700], [1230, 700], {tag: 'two'}),
		// SAM: "The one who sits at the end of my bed. He doesn't do anything. He just watches."
		shot(T('son_002_watches'), 'kitchen2_day', 2.5, 2.6, [1230, 690], [1230, 690], {tag: 'two'}),
		// "It was never the house." - her face
		shot(T('narrator_044_never_house'), 'kitchen2_day', 2.8, 3.0, [600, 690], [600, 690], {tag: 'two'}),
		// "It was us." - his room, that night: at the end of his bed, it watches
		shot(T('narrator_045_us'), 'sonroom_night', 1.15, 1.35, [700, 600], [760, 580], {tag: 'watch'}),
	];
	const world = (s: Shot) => {
		if (s.set === 'sonroom_night')
			return (
				<g>
					<SamAsleep f={f} />
					<Rake x={985} y={SB.quilt - 30} s={1.35} frame={f} pose="side" dir={-1} lean={0.15} />
				</g>
			);
		if (s.set !== 'kitchen2_day') return null;
		const sd = talk('son');
		const frozen = t > T('son_001_skinny_man', 0.3);
		if (s.tag === 'alone') return <Kitchen f={f} left="adult" right={null} l={{look: [1, 0.3], eyes: 'dot', brows: 'flat', mouth: 'flat', arms: {l: [28, -64], r: [40, -100]}}} />;
		return (
			<Kitchen
				f={f}
				left="adult"
				right="son"
				l={{look: [1, 0], eyes: frozen ? 'wide' : 'dot', brows: frozen ? 'worried' : 'flat', mouth: frozen ? 'flat' : 'smile', idle: !frozen, arms: frozen ? {l: [28, -64], r: [40, -100]} : {l: [28, -64], r: [36, -80]}}}
				r={{talk: sd.talk, viseme: sd.viseme, look: [-1, 0], eyes: 'dot', brows: 'flat', mouth: 'smile'}}
			/>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
