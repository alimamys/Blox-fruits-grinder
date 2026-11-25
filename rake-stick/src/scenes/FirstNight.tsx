// 1. THE FIRST NIGHT - 4:00 a.m.; something crouched halfway up her bed; it watches; she hides; it's gone.
import React from 'react';
import {Lily} from '../components/characters/Cast';
import {HideInBed, LieInBed} from '../stick/bed';
import {GEO, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Glow} from '../stick/props';
import {Rake} from '../stick/rake';
import {RoomClock, TitleCard} from './common';

const B = GEO.bed;
const PILLOW_X = 312;
/** where it crouches: halfway up the blanket, over her knees */
const ON_BED = {x: 700, y: B.quilt - 34, s: 1.35};

export const FirstNight: React.FC = () => {
	const {f, t, at, end, word} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tSomething = word('narrator_001_woke_up', 'something', 0.6);
	const t7 = T('narrator_007_counted');
	const tGone = T('narrator_008_gone');
	const shots: Shot[] = [
		// 3:59 -> 4:00, her face beside the clock
		shot(0, 'bedroom_night', 3.6, 3.8, [230, 760], [240, 755], {tag: 'clock'}),
		// "When I was nine, I woke up at four in the morning..." - her eyes open
		shot(T('narrator_001_woke_up'), 'bedroom_night', 2.8, 2.9, [360, 690], [360, 690], {tag: 'wake'}),
		// "...and something was sitting on my bed." - the room: it is there
		shot(tSomething, 'bedroom_night', 1.25, 1.32, [640, 650], [640, 640], {tag: 'reveal'}),
		// "Not at the end of it, where a dog would sleep. It was halfway up the blanket, crouched over my knees."
		shot(T('narrator_002_not_the_end'), 'bedroom_pov_night', 1.0, 1.12, [960, 560], [935, 600], {tag: 'pov'}),
		// "It was shaped like a man... Skin the colour of candle wax."
		shot(T('narrator_003_thin_man'), 'bedroom_pov_night', 1.6, 1.75, [935, 640], [935, 600], {tag: 'pov'}),
		// "Its hands were spread on the blanket... like the teeth of a rake."
		shot(T('narrator_004_claws'), 'bedroom_pov_night', 3.0, 3.2, [935, 905], [925, 905], {tag: 'pov'}),
		// "And it was looking at me."
		shot(T('narrator_005_looking'), 'bedroom_pov_night', 3.4, 3.9, [925, 560], [925, 555], {tag: 'pov'}),
		// it watches: her face, frozen
		shot(at('stare'), 'bedroom_night', 3.2, 3.3, [350, 690], [350, 690], {tag: 'stare'}),
		// "It didn't blink. It didn't breathe. It just watched."
		shot(T('narrator_006_watched'), 'bedroom_night', 1.7, 1.78, [560, 640], [580, 640], {tag: 'reveal'}),
		// "I pulled the covers over my face and counted to ten."
		shot(t7, 'bedroom_night', 1.7, 1.75, [560, 650], [560, 650], {tag: 'hide'}),
		shot(at('count'), 'bedroom_night', 1.95, 2.0, [540, 600], [540, 600], {tag: 'hide', shake: 1}),
		// "When I looked again, it was gone."
		shot(tGone, 'bedroom_night', 1.25, 1.25, [640, 650], [640, 650], {tag: 'gone'}),
		ui(at('title'), (fl, d) => <TitleCard f={fl} d={d} />),
	];
	const world = (s: Shot) => {
		const moon = <Glow cx={470} cy={330} r={420} color="#b9cdf2" k={0.35} />;
		if (s.set === 'bedroom_pov_night')
			return (
				<g>
					<Glow cx={330} cy={300} r={500} color="#b9cdf2" k={0.3} />
					<Rake x={930} y={930} s={1.9} frame={f} pose="front" lean={s.tag === 'pov' && t > T('narrator_005_looking') ? 0.5 : 0.25} />
				</g>
			);
		const clockText = s.tag === 'clock' && t < 1.2 ? '3:59' : '4:00';
		const awake = !(s.tag === 'clock' && t < 1.6);
		if (s.tag === 'hide')
			return (
				<g>
					{moon}
					<RoomClock f={f} text={clockText} />
					<HideInBed b={B} px={PILLOW_X} frame={f} id="hide" shiver={1.2} />
					<Rake {...ON_BED} frame={f} pose="side" dir={-1} />
				</g>
			);
		const showRake = s.tag === 'reveal';
		return (
			<g>
				{moon}
				<RoomClock f={f} text={clockText} />
				<LieInBed
					b={B}
					is={Lily}
					px={PILLOW_X}
					s={1.75}
					child
					frame={f}
					id="lily"
					p={{eyes: awake ? 'wide' : 'closed', brows: awake ? 'worried' : 'flat', look: s.tag === 'gone' ? [1, -0.3] : [1, -0.6], idle: s.tag !== 'stare', mouth: s.tag === 'gone' ? 'o' : 'flat'}}
				/>
				{showRake ? <Rake {...ON_BED} frame={f} pose="side" dir={-1} opacity={s.tag === 'reveal' && t < tSomething + 0.4 ? ramp(t, tSomething, tSomething + 0.4) : 1} /> : null}
			</g>
		);
	};
	void tGone;
	return <Shots shots={shots} world={(s) => world(s)} />;
};
