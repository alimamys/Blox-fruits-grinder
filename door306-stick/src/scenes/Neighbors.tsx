// 4. THE NEIGHBORS - the same positions; the mother covering her boy's mouth; the old man shaking by the stairs;
// they were expecting it. No signal. Then three soft knocks: Mr. Harris at the door.
import React from 'react';
import {Boy, Mother, OldMan, RobeMan, RobeWoman, Sarah, Shawl, TShirt} from '../components/characters/Cast';
import {Prop} from '../components/characters/Creature';
import {CallScreen, NoSignalScreen, PhoneFrame} from '../components/ui/Phone';
import {FPS} from '../data/timeline';
import {HallDoor, HarrisAtGap, peepOverlay, residentsPersp, SarahAtGap} from '../stick/d306';
import {Person, PlateShake} from '../stick/goat';
import {fshot, GEO, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, Group, type Spec} from '../stick/places';
import {FLAT_PROPS} from './NewApartment';

export const Neighbors: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t63 = at('narrator_063_peephole_again');
	const t64 = at('narrator_064_same_positions');
	const t65 = at('narrator_065_mother');
	const t66 = at('narrator_066_crying_silently');
	const t67 = at('narrator_067_covered_mouth');
	const t68 = at('narrator_068_old_man');
	const t69 = at('narrator_069_nobody_moved');
	const t71 = at('narrator_071_occurred');
	const t75 = at('narrator_075_except_me');
	const t76 = at('narrator_076_called_police');
	const t77 = at('narrator_077_no_signal');
	const t78 = at('narrator_078_tried_again');
	const t79 = at('narrator_079_nothing');
	const t80 = at('narrator_080_wifi');
	const t81 = at('narrator_081_three_knocks');
	const tK = at('knocks');
	const t82 = at('narrator_082_froze');
	const h1 = at('harris_001_its_me');
	const t83 = at('narrator_083_hesitated');
	const t84 = at('narrator_084_chain');
	const tOpen = word('narrator_084_chain', 'opened', 0.6);
	const t85 = at('narrator_085_trembling');
	const s2 = at('sarah_002_whats_happening');
	const t86 = at('narrator_086_looked_staircase');
	const h2 = at('harris_002_listen_carefully');
	const sar = talk('sarah');
	const har = talk('harris');
	// the phone
	if (t >= t76 && t < t81) {
		const lf = f - Math.round(t76 * FPS);
		const d = Math.round((t81 - t76) * FPS);
		const scr = t < t77 ? <CallScreen f={lf} name="911" /> : <NoSignalScreen f={lf} attempt={t >= t78 ? 2 : 1} />;
		return <PhoneFrame f={lf} d={d} tilt={t >= t78 ? 3 : -3}>{scr}</PhoneFrame>;
	}
	const H = GEO.hall;
	const F = GEO.flat;
	// side hallway close-ups: the mother and her boy; the old man by the stairs; the row of calm faces
	const covering = t >= t67 && t < t68;
	const mother: Spec = {is: Mother, name: 'mother', x: 560, y: H.floor + 30, s: 1.6, frame: f, arms: 'hug', look: [1, 0.2], eyes: 'dot', brows: 'sad', mouth: 'flat', overlapOk: true};
	const boy: Spec = {is: Boy, name: 'boy', x: 560, y: H.floor + 45, s: 1.6, frame: f, tears: t >= t66 ? 1 : 0, eyes: 'squint', brows: 'sad', mouth: covering ? 'flat' : t >= t66 + 1 ? 'wobbly' : 'flat', look: [0, 0], overlapOk: true};
	const oldman: Spec = {is: OldMan, name: 'oldman', x: 1500, y: H.floor + 30, s: 1.6, frame: f, shiver: 2.2, lean: -6, arms: {l: [10, 0], r: [70, -20]}, look: [1, 0.4], eyes: 'wide', brows: 'worried', mouth: 'wobbly', pale: 0.3};
	const row: Spec[] = [
		{is: RobeMan, name: 'robeman', x: 300, y: H.floor + 30, s: 1.55, frame: f},
		{is: Shawl, name: 'shawl', x: 640, y: H.floor + 30, s: 1.55, frame: f},
		{is: TShirt, name: 'tshirt', x: 1000, y: H.floor + 30, s: 1.55, frame: f},
		{is: RobeWoman, name: 'robewoman', x: 1360, y: H.floor + 30, s: 1.55, frame: f},
	].map((p) => ({...p, turn: 0.4, look: [1, 0], eyes: 'dot', mouth: 'flat', brows: 'flat', idle: false}));
	const res = residentsPersp(f, 'stairs').map((p) => ({...p, idle: false}));
	// the knock, the walk to the door, the chain
	const knocks = [tK + 0.05, tK + 0.45, tK + 0.85];
	const knocking = knocks.some((k) => t >= k && t < k + 0.12);
	const frozen = t >= tK;
	const sw = walk(t, t83 + 0.2, t84 + 1.0, 960, 1392, 1.6);
	const gap = ramp(t, tOpen, tOpen + 0.6);
	const lookStairs = t >= t86 + 0.4 && t < h2 + 0.2;
	const shots = [
		shot(t63, 'flat_night_bare', 2.4, 2.5, [1530, 540], [1530, 530]),
		shot(t64, 'hallway_persp_night', 1.0, 1.06, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t65, 'hallway_night', 1.75, 1.8, [560, 720], [560, 720]),
		fshot(boxesOf([oldman]), t68, 'hallway_night', 2.2, [1500, 560]),
		shot(t69, 'hallway_persp_night', 1.0, 1.04, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t71, 'hallway_night', 1.0, 1.04, [960, 540], [880, 540]),
		shot(t75, 'flat_night_bare', 2.8, 2.9, [1530, 525], [1530, 520]),
		shot(t81, 'flat_night_bare', 1.0, 1.0, [960, 540]),
		shot(t82, 'flat_night_bare', 2.3, 2.4, [960, 560], [960, 560]),
		shot(h1 - 0.2, 'flat_night_bare', 1.7, 1.7, [1450, 580], [1450, 580]),
		shot(t83, 'flat_night_bare', 1.15, 1.15, [1250, 560], [1250, 560]),
		shot(tOpen - 0.2, 'flat_night_bare', 2.2, 2.2, [1460, 560], [1460, 560]),
		shot(t85, 'hallway_night', 1.25, 1.25, [1000, 560], [1000, 560]),
		shot(s2, 'hallway_night', 2.1, 2.1, [1020, 560], [1020, 560]),
		shot(t86, 'hallway_night', 1.15, 1.15, [1200, 560], [1200, 560]),
		shot(h2 - 0.15, 'hallway_night', 2.2, 2.2, [1080, 560], [1080, 560]),
	];
	const world = (set: string) => {
		if (set === 'hallway_persp_night') return <Group people={res} />;
		if (set === 'hallway_night') {
			const doors = H.doors.map((d, i) => <HallDoor key={i} r={d} open={i === 1 ? 0 : 1} />);
			if (t < t68) {
				return (
					<g>
						{doors}
						<Group people={[mother, boy]} />
						{covering ? <circle cx={560} cy={H.floor + 45 - 1.6 * 0.62 * 262 + 14} r={16} fill="#ebbe89" stroke="#141414" strokeWidth={4} /> : null}
					</g>
				);
			}
			if (t < t69) return <g>{doors}<Group people={[oldman]} /></g>;
			if (t < t75) return <g>{doors}<Group people={row} /></g>;
			// Mr. Harris at Sarah's door
			return (
				<g>
					<HallDoor r={H.doors[0]} open={1} />
					<HallDoor r={H.doors[2]} open={1} />
					<HarrisAtGap f={f} gap={1} p={{turn: lookStairs ? 0.7 : -0.25, look: lookStairs ? [1, 0] : [-1, 0], arms: t >= h2 + 0.3 && t < h2 + 2.6 ? 'fingerLips' : 'down', mouth: har.talk > 0 ? 'open' : 'frown', talk: har.talk, viseme: har.viseme}} />
				</g>
			);
		}
		// the flat
		const props = (
			<g>
				<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
				<Prop name="sofa" x={FLAT_PROPS.sofa.x} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} />
			</g>
		);
		if (t < t81) {
			return (
				<g>
					{props}
					<Person is={Sarah} name="sarah" x={1540} y={F.floor} s={1.6} frame={f} turn={0.75} lean={8} look={[1, -0.2]} eyes="wide" brows="worried" mouth={t >= t75 ? 'o' : 'flat'} />
				</g>
			);
		}
		if (t >= tOpen - 0.2) {
			return (
				<g>
					{props}
					<SarahAtGap f={f} gap={gap} p={{mouth: sar.talk > 0 ? 'open' : 'o', talk: sar.talk, viseme: sar.viseme}} />
				</g>
			);
		}
		return (
			<g>
				<PlateShake plate="flat_night_bare" x0={F.door[0] - 10} y0={F.door[1] - 10} x1={F.door[2] + 10} y1={F.door[3] + 10} k={knocking ? 0.5 : 0} frame={f} />
				{props}
				<Person
					is={Sarah}
					name="sarah"
					x={sw.x}
					y={F.floor}
					s={1.6}
					frame={f}
					{...(sw.moving ? {pose: 'walk', turn: 0.8, phase: sw.phase} : {turn: 0})}
					prop={t < t82 + 1.2 ? 'phone' : 'none'}
					propGlow="#9fc3ff"
					arms={t < t82 + 1.2 ? 'phoneEar' : 'down'}
					look={frozen ? [1, -0.1] : [0.3, 0.6]}
					eyes={frozen ? 'wide' : 'dot'}
					brows={frozen ? 'worried' : 'none'}
					mouth={frozen ? 'o' : 'flat'}
					shiver={frozen && t < t83 ? 0.8 : 0}
				/>
			</g>
		);
	};
	void t79;
	void t80;
	return <Shots shots={shots} world={(s) => world(s.set)} overlay={peepOverlay} />;
};
