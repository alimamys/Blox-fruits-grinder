// 6. TODAY - the police; she is 34 and the house is hers; her son sleeps in the little bedroom; at breakfast:
// "Who's the skinny man?"; the first time, it only watches - and it is at the foot of his bed.
import React from 'react';
import {Son} from '../components/characters/Cast';
import {LieInBed} from '../stick/bed';
import {GEO, shot, Shots, useStick, type Shot} from '../stick/kit';
import {Glow} from '../stick/props';
import {Rake} from '../stick/rake';
import {Kitchen, RoomClock} from './common';

const B = GEO.bed;
const PILLOW_X = 312;

export const Today: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tLast = T('narrator_037_first_time');
	const shots: Shot[] = [
		// "The police said he must have walked out in the night..."
		shot(T('narrator_033_police'), 'exterior_day', 1.0, 1.08, [960, 540], [960, 520], {light: 'grey'}),
		// "I'm thirty-four now..."
		shot(T('narrator_034_thirty_four'), 'kitchen_day', 1.2, 1.3, [760, 640], [700, 650], {tag: 'alone', light: 'grey'}),
		// "My son is nine. He sleeps in the little bedroom at the end of the hall."
		shot(T('narrator_035_son'), 'bedroom_night', 1.3, 1.45, [600, 640], [480, 660], {tag: 'son'}),
		// "This morning, at breakfast, he asked me a question."
		shot(T('narrator_036_question'), 'kitchen_day', 1.05, 1.1, [920, 580], [900, 590], {tag: 'two'}),
		// SON: "Mom? Who's the skinny man?"
		shot(T('son_001_skinny_man'), 'kitchen_day', 2.3, 2.4, [1180, 700], [1180, 700], {tag: 'two'}),
		// SON: "The one who sits at the end of my bed..."
		shot(T('son_002_watches'), 'kitchen_day', 2.5, 2.6, [1180, 690], [1180, 690], {tag: 'two'}),
		// her face
		shot(end('son_002_watches'), 'kitchen_day', 2.8, 3.0, [640, 690], [640, 690], {tag: 'two'}),
		// "The first time, it only watches." - his room, tonight: it is at the foot of his bed
		shot(tLast, 'bedroom_night', 1.1, 1.6, [700, 620], [760, 570], {tag: 'last'}),
	];
	const world = (s: Shot) => {
		if (s.set === 'bedroom_night') {
			return (
				<g>
					<Glow cx={470} cy={330} r={420} color="#b9cdf2" k={0.35} />
					<RoomClock f={f} text={s.tag === 'last' ? '4:00' : '9:12'} />
					<LieInBed b={B} is={Son} px={PILLOW_X} s={1.75} child frame={f} id="son" p={{eyes: 'closed', brows: 'flat', mouth: 'flat'}} />
					{s.tag === 'last' ? <Rake x={1010} y={B.quilt - 34} s={1.35} frame={f} pose="side" dir={-1} lean={0.15} /> : null}
				</g>
			);
		}
		if (s.set !== 'kitchen_day') return null;
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
