// 8. NINE - we walk out; two days later Wyatt tells me: at four in the morning the bathroom door opened,
// someone picked its way between us and lay down next to me. Eight of us. Nine on the floor.
// The bathroom window had no screen. And when we walked out, it walked out with us.
import React from 'react';
import {Cole, Marcus, PAL, Stranger, Wyatt} from '../components/characters/Cast';
import {BigWords, Chair, DoorOpen, Person, Sleeper} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {clearingSpec, Group, type Spec} from '../stick/places';

const LINE = ['marcus', 'ray', 'dez', 'tasha', 'jalen', 'malik', 'cole', 'wyatt'];
// sleeping bags in two rows; the gap in the back row (x 1130) is where it lies down, next to Marcus
const SLEEP = [
	{name: 'ray', x: 300, y: 1060, bag: '#3a6ea8', p: PAL.ray, dir: 1 as const},
	{name: 'tasha', x: 700, y: 1060, bag: '#b8574a', p: PAL.tasha, dir: 1 as const},
	{name: 'dez', x: 1100, y: 1060, bag: '#4f6b3a', p: PAL.dez, dir: 1 as const},
	{name: 'jalen', x: 260, y: 935, bag: '#7a4f8a', p: PAL.jalen, dir: 1 as const},
	{name: 'marcus', x: 720, y: 935, bag: '#8e2a2a', p: PAL.marcus, dir: 1 as const},
	{name: 'cole', x: 1500, y: 1060, bag: '#a8352c', p: PAL.cole, dir: -1 as const},
];
const IT_SLOT = {x: 1120, y: 935};

export const Nine: React.FC = () => {
	const {f, t, at, word} = useStick();
	const t122 = at('narrator_122_sunrise');
	const t123 = at('narrator_123_wouldnt_look');
	const t124 = at('narrator_124_two_days');
	const t4 = at('four_am');
	const t126 = at('narrator_126_bathroom');
	const t127 = at('narrator_127_lay_down');
	const tLay = word('narrator_127_lay_down', 'lay', 0.75);
	const t128 = at('narrator_128_closed_eyes');
	const t129 = at('narrator_129_counted');
	const t130 = at('narrator_130_eight');
	const t131 = at('narrator_131_nine');
	const t132 = at('narrator_132_didnt_scream');
	const t133 = at('narrator_133_pretending');
	const tSat = word('narrator_133_pretending', 'sat', 0.4);
	const tShook = word('narrator_133_pretending', 'shook', 0.8);
	const t134 = at('narrator_134_window');
	const t137 = at('narrator_137_walked_out');
	const t138 = at('narrator_138_back_of_line');
	const t139 = at('narrator_139_eyes');
	const t140 = at('narrator_140_trees');
	const tT = at('trees');
	const T = GEO.trailer;
	const tr = GEO.trail.ground;

	// ---- walking out at sunrise, single file left to right; later the extra one at the back
	const line = (withIt: boolean, t0: number, t1: number, x0: number, x1: number) => {
		const names = withIt ? [...LINE, 'it'] : LINE.filter((n) => !(n === 'wyatt' && t < t123));
		return names.map((n, i): Spec => {
			const w = walk(t, t0, t1, x0 - i * 190, x1 - i * 190, 1.15);
			const C2 = n === 'it' ? Stranger : n === 'cole' ? Cole : clearingSpec(n).is;
			return {is: C2, name: n, x: w.x, y: tr + 10, s: 1.15, frame: f, pose: w.moving ? 'walk' : 'stand', turn: 0.8, phase: w.phase, edge: true, look: n === 'wyatt' && t >= t123 ? [0, 1] : [1, 0], pale: n === 'wyatt' ? 0.35 : 0, prop: n === 'cole' ? 'rifle' : 'none', arms: n === 'cole' ? 'hold' : 'down'};
		});
	};
	// ---- 4 a.m.: Wyatt in the chair by the door; the others asleep on the floor; the bathroom door opens
	const bathOpen = ramp(t, t126 + 0.3, t126 + 1.8) * (t < t134 ? 1 : 0);
	const it = walk(t, t127 + 0.4, tLay, T.bath[0] + 60, IT_SLOT.x, 1.4);
	const lying = t >= tLay;
	const sitUp = t >= tSat && t < tShook + 3 ? ramp(t, tSat, tSat + 0.6) : 0;

	// QA boxes on the trailer floor (heads of the sleepers, Wyatt in the chair) for fitted close-ups
	const floorBoxes: Array<[number, number, number]> = [...SLEEP.map((s2) => s2.x + s2.dir * 1.15 * -124), IT_SLOT.x + 143].map((hx) => [hx - 53, hx + 53, 800] as [number, number, number]).concat([[1560 - 73, 1560 + 73, 600]]);
	const farmBoxes: Array<[number, number, number]> = [...Array.from({length: 7}, (_, i) => 1500 - i * 150), 450].map((x) => [x - 60, x + 60, 990 - 307 * 1.15]);
	const shots = [
		shot(0, 'trail_day', 1.0, 1.0, [960, 540]),
		shot(t124, 'farm_day', 1.5, 1.55, [1350, 640], [1350, 640]),
		shot(t4, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'dim'}),
		fshot(floorBoxes, t126, 'trailer_night', 1.7, [1650, 600], {light: 'dim'}),
		shot(t127, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'dim'}),
		shot(t128, 'trailer_night', 2.4, 2.4, [1080, 860], [1080, 860], {light: 'dim'}),
		shot(t129, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'dim'}),
		fshot(floorBoxes, t132, 'trailer_night', 2.0, [1560, 640], {light: 'dim'}),
		shot(t133, 'trailer_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'dim'}),
		fshot(floorBoxes, tSat - 0.1, 'trailer_night', 1.8, [IT_SLOT.x, 780], {light: 'dim'}),
		shot(t134, 'bathroom_night', 1.0, 1.25, [960, 540], [970, 420]),
		shot(t137, 'trail_day', 1.0, 1.0, [960, 540]),
		shot(t138, 'farm_day', 1.0, 1.0, [960, 540]),
		fshot(farmBoxes, t139, 'farm_day', 2.2, [530, 700]),
		shot(t140, 'farm_day', 1.0, 1.0, [960, 540]),
	];
	const world = (set: string) => {
		if (set === 'trail_day') {
			const people = t < t137 ? line(false, 0.2, t124 - 0.2, -150, 2600) : line(true, t137, t138 + 0.2, -150, 2900);
			return <Group people={people} />;
		}
		if (set === 'farm_day') {
			if (t < t4) {
				return (
					<g>
						<Person is={Wyatt} name="wyatt" x={1240} y={980} s={1.3} frame={f} look={[1, 0.6]} pale={0.3} mouth="flat" talk={Math.max(0, Math.sin(t * 10)) * 0.4} />
						<Person is={Marcus} name="marcus" x={1460} y={985} s={1.3} frame={f} look={[-1, 0]} brows="worried" mouth="flat" flip />
					</g>
				);
			}
			// the line arrives at Wyatt's house; the last one stops, looks at Wyatt, steps back into the trees
			const arrive = (i: number) => lerp(-200 - i * 170, 1500 - i * 150, ramp(t, t138, t138 + 3.5));
			const names = ['marcus', 'ray', 'dez', 'tasha', 'jalen', 'malik', 'wyatt'];
			const lineUp: Spec[] = names.map((n, i) => ({is: clearingSpec(n).is, name: n, x: arrive(i), y: 990, s: 1.15, frame: f, pose: t < t138 + 3.5 ? 'walk' : 'stand', turn: 0.8, phase: arrive(i) / 34, edge: true, look: n === 'wyatt' && t >= t139 ? [-1, 0] : [1, 0]}));
			const itX = t < t140 ? Math.min(arrive(names.length), 450) : lerp(450, -260, ramp(t, t140 + 0.3, t140 + 2.4));
			const itOn = t < tT;
			return (
				<g>
					<Group people={lineUp} />
					{itOn ? (
						<g opacity={t >= t140 ? 1 - ramp(t, t140 + 1.6, t140 + 2.4) : 1}>
							<Person is={Stranger} name="it" x={itX} y={990} s={1.15} frame={f} pose={t >= t140 + 0.3 || t < t139 ? 'walk' : 'stand'} turn={t >= t140 ? -0.8 : 0.8} phase={itX / 34} eyes={t >= t139 ? 'gray' : 'dot'} look={t >= t139 && t < t140 ? [1, 0] : [1, 0]} mouth="flat" edge />
						</g>
					) : null}
				</g>
			);
		}
		if (set === 'bathroom_night') return null;
		// the trailer at four in the morning
		const eight = t >= t130 && t < t131;
		const nine = t >= t131 && t < t132;
		return (
			<g>
				<DoorOpen r={T.bath} open={bathOpen} />
				{SLEEP.map((s2) => (
					<Sleeper key={s2.name} name={s2.name} x={s2.x} y={s2.y} s={1.15} bag={s2.bag} skin={s2.p.skin} hair={s2.p.hair} dir={s2.dir} frame={f} eyes="closed" />
				))}
				{lying ? (
					<Sleeper name="it" x={IT_SLOT.x} y={IT_SLOT.y} s={1.15} bag="#2a2d33" skin={PAL.stranger.skin} hair={PAL.stranger.hair} dir={-1} frame={f} eyes={t >= t128 + 1 && sitUp === 0 ? 'closed' : 'open'} sitUp={sitUp} shake={t >= tShook ? 1.4 : 0} />
				) : t >= t127 + 0.3 ? (
					<Person is={Stranger} name="it" x={it.x} y={T.floor + 30} s={1.4} frame={f} pose={it.moving ? 'walk' : 'stand'} turn={-0.8} phase={it.phase * 0.6} look={[-1, 0.5]} overlapOk />
				) : null}
				<Chair x={1560} y={T.floor + 10} s={1.4} frame={f} />
				<Person is={Wyatt} name="wyatt" x={1560} y={T.floor + 10} s={1.4} frame={f} pose="sit" prop="rifle" arms="hold" eyes={t >= t133 ? 'squint' : t >= t126 ? 'wide' : 'squint'} pale={t >= t126 ? 0.35 : 0} sweat={t >= t129} look={[-1, 0.6]} mouth="flat" />
				{eight || nine ? <g /> : null}
			</g>
		);
	};
	return (
		<>
			<Shots shots={shots} world={(s) => world(s.set)} />
			{t >= t130 && t < t131 ? <BigWords text="8" size={240} k={ramp(t, t130, t130 + 0.2)} color="#ffd21a" y={-300} /> : null}
			{t >= t131 && t < t132 ? <BigWords text="9" size={240} k={ramp(t, t131, t131 + 0.15)} color="#ff4a3a" y={-300} /> : null}
		</>
	);
};
