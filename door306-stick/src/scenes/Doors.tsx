// 1. THE DOORS - cold open. 3:06 a.m.: every door in the building opens; the neighbours stand in the hallway,
// still, facing the stairs; something heavy comes up, dragging something; the first glimpse; the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Harris, RobeWoman, Sarah, TShirt} from '../components/characters/Cast';
import {Creature} from '../components/characters/Creature';
import {Disclaimer, LockScreen, PhoneFrame, TitleCard} from '../components/ui/Phone';
import {FPS} from '../data/timeline';
import {Flicker, HallDoor, peepOverlay, residentsPersp} from '../stick/d306';
import {Person} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, stairPt, useStick, walk} from '../stick/kit';
import {boxesOf, Group, type Spec} from '../stick/places';

export const Doors: React.FC = () => {
	const {f, t, at, end, word, total} = useStick();
	const t01 = at('narrator_001_sleepwalking');
	const t02 = at('narrator_002_exactly_306');
	const tOpen = word('narrator_002_exactly_306', 'heard', 0.6);
	const t03 = at('narrator_003_not_one_or_two');
	const t04 = at('narrator_004_all_of_them');
	const tW = at('doors_wide');
	const t05 = at('narrator_005_peephole');
	const t06 = at('narrator_006_every_neighbor');
	const t09 = at('narrator_009_nobody_talking');
	const tH = at('held_breath');
	const t11 = at('narrator_011_coming_up');
	const t14 = at('narrator_014_finally_saw');
	const t15 = at('narrator_015_so_afraid');
	const tG = at('creature_glimpse');
	const tB = at('cut_black');
	const tT = at('title');
	if (t < t01) {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<Disclaimer f={f} d={Math.round(t01 * FPS)} />
			</AbsoluteFill>
		);
	}
	if (t >= tT) return <TitleCard f={f - Math.round(tT * FPS)} d={Math.round((total - tT) * FPS)} />;
	if (t >= tB) return <AbsoluteFill style={{background: '#000'}} />;
	if (t >= t02 && t < tOpen) {
		const lf = f - Math.round(t02 * FPS);
		return (
			<PhoneFrame f={lf} d={Math.round((tOpen - t02) * FPS)}>
				<LockScreen time="3:06" glow={Math.min(1, lf / 6)} />
			</PhoneFrame>
		);
	}
	const H = GEO.hall;
	// side hallway: doors swing open one after another; people step out and stand facing the stairs (right)
	const open = (i: number, t0: number) => ramp(t, t0 + i * 0.55, t0 + i * 0.55 + 0.5);
	const step = (i: number, t0: number, d: readonly [number, number, number, number], C: React.FC<Record<string, unknown>>, name: string) => {
		const ts = t0 + i * 0.55 + 0.6;
		const k = ramp(t, ts, ts + 0.9);
		if (t < ts) return null;
		const x = (d[0] + d[2]) / 2 + k * 40;
		return <Person key={name} is={C} name={name} x={x} y={lerp(H.floor - 30, H.floor + 30, k)} s={1.5} frame={f} turn={0.7} look={[1, 0]} eyes="dot" mouth="flat" idle={false} />;
	};
	const sideWorld = (
		<g>
			<HallDoor r={H.doors[0]} open={open(0, tOpen)} />
			<HallDoor r={H.doors[2]} open={open(1, tOpen)} />
			<HallDoor r={H.doors[1]} open={t >= t03 ? open(0, t03 + 0.2) : 0} />
			{step(0, tOpen, H.doors[0], Harris as never, 'harris')}
			{step(1, tOpen, H.doors[2], RobeWoman as never, 'robewoman')}
			{t >= t03 ? step(0, t03 + 0.2, H.doors[1], TShirt as never, 'tshirt') : null}
		</g>
	);
	// the peephole view: everybody, backs to us, facing the stairs; the head rising at the far end
	const res: Spec[] = residentsPersp(f, 'stairs', {}, []).map((p) => ({...p, idle: false}));
	const st = GEO.persp.stairs;
	const headK = ramp(t, t14 + 0.3, t15 + 0.4);
	const glimpse = t >= t14;
	// the stairwell: a long shadow climbing the wall
	const shadowK = (t - t11) / Math.max(1, t14 - t11);
	const [sx, sy] = stairPt(Math.min(0.55, shadowK * 0.6));
	const stillBoxes = boxesOf([330, 915, 1400].map((x) => ({is: Harris, name: 'p', x, y: H.floor + 30, s: 1.5})));
	const shots = [
		shot(t01, 'exterior_night', 1.0, 1.55, [960, 540], [960, 300]),
		shot(tOpen, 'hallway_night', 1.0, 1.0, [960, 540]),
		shot(t04, 'hallway_persp_night', 1.0, 1.04, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t05, 'flat_night_bare', 2.4, 2.5, [1530, 540], [1530, 530]),
		shot(t06, 'hallway_persp_night', 1.0, 1.1, [950, 560], [950, 560], {tag: 'peep'}),
		fshot(stillBoxes, t09, 'hallway_night', 2.0, [915, 600]),
		shot(tH, 'hallway_persp_night', 1.1, 1.12, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t11, 'stairwell_night', 1.0, 1.1, [960, 540], [900, 560]),
		shot(t14, 'hallway_persp_night', 1.3, 2.4, [950, 560], [950, 540], {tag: 'peep'}),
		shot(t15, 'flat_night_bare', 3.0, 3.2, [1530, 520], [1530, 515]),
		shot(tG, 'stairwell_night', 2.6, 2.9, [1180, 300], [1180, 290]),
	];
	const world = (set: string) => {
		if (set === 'exterior_night') return null;
		if (set === 'hallway_night') {
			if (t >= t09) {
				// still, facing the stairs; nobody breathing
				const still: Spec[] = [
					{is: Harris, name: 'harris', x: 330, y: H.floor + 30, s: 1.5, frame: f, turn: 0.7, look: [1, 0], idle: false},
					{is: TShirt, name: 'tshirt', x: 915, y: H.floor + 30, s: 1.5, frame: f, turn: 0.7, look: [1, 0], idle: false},
					{is: RobeWoman, name: 'robewoman', x: 1400, y: H.floor + 30, s: 1.5, frame: f, turn: 0.7, look: [1, 0], idle: false},
				];
				return (
					<g>
						{H.doors.map((d, i) => <HallDoor key={i} r={d} open={1} />)}
						<Group people={still} />
					</g>
				);
			}
			return sideWorld;
		}
		if (set === 'flat_night_bare') {
			return (
				<Person is={Sarah} name="sarah" x={1540} y={GEO.flat.floor} s={1.6} frame={f} turn={0.75} lean={8} look={[1, -0.2]} eyes={t >= t15 ? 'wide' : 'dot'} brows="worried" mouth={t >= t15 ? 'o' : 'flat'} />
			);
		}
		if (set === 'stairwell_night') {
			if (t >= tG) {
				return (
					<g>
						<Creature x={1150} y={GEO.stair.landing4 + 30} s={1.25} frame={f} view="front" tilt={48} />
						<Flicker f={f} k={1} />
					</g>
				);
			}
			return (
				<g>
					{/* the shadow on the wall: something tall, bent, an arm hanging low */}
					<g opacity={0.55} transform={`translate(${sx + 120} ${sy - 40}) scale(1.4 1.7) skewX(-18)`}>
						<path d="M0,0 C-10,-120 10,-230 -10,-300 C-40,-330 -60,-300 -50,-270 C-80,-200 -60,-80 -70,0 Z M-50,-230 C-90,-160 -100,-60 -110,10 L-96,12 C-80,-60 -66,-150 -40,-210 Z" fill="#05070a" />
					</g>
					<Flicker f={f} k={0.6} />
				</g>
			);
		}
		// the peephole hallway
		return (
			<g>
				{glimpse ? (
					<g>
						<defs>
							<clipPath id="stairsClip">
								<rect x={st[0]} y={st[1] - 200} width={st[2] - st[0]} height={st[3] - st[1] + 200} />
							</clipPath>
						</defs>
						<g clipPath="url(#stairsClip)">
							<Creature x={(st[0] + st[2]) / 2} y={st[3] + lerp(330, 40, headK)} s={0.52} frame={f} view="front" tilt={40} />
						</g>
					</g>
				) : null}
				<Group people={res} />
				{glimpse ? <Flicker f={f} k={0.35} /> : null}
			</g>
		);
	};
	void end;
	void walk;
	return <Shots shots={shots} world={(s) => world(s.set)} overlay={peepOverlay} />;
};
