// 2. THE NEW APARTMENT - three weeks earlier: the old building, the cheap rent, the friendly landlord, the
// waived deposit. Then 3:06: clicking, doors opening; Mr. Harris in the hallway, finger to his lips.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Harris, Landlord, Sarah} from '../components/characters/Cast';
import {Prop} from '../components/characters/Creature';
import {LockScreen, PhoneFrame} from '../components/ui/Phone';
import {FPS} from '../data/timeline';
import {HallDoor, peepOverlay, residentsPersp} from '../stick/d306';
import {Person} from '../stick/goat';
import {fshot, GEO, gait, lerp, MovingBox, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, Group, type Spec} from '../stick/places';

export const FLAT_PROPS = {sofa: {x: 1000, y: 905, w: 420}, table: {x: 560, y: 900, w: 280}};

export const NewApartment: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t16 = at('narrator_016_moved_in');
	const t17 = at('narrator_017_old_building');
	const t18 = at('narrator_018_nothing_special');
	const t19 = at('narrator_019_rent_cheap');
	const t20 = at('narrator_020_previous_tenant');
	const t21 = at('narrator_021_waived_deposit');
	const t22 = at('narrator_022_lucky');
	const t23 = at('narrator_023_no_idea');
	const tA = at('asleep');
	const t24 = at('narrator_024_clicking');
	const t25 = at('narrator_025_checked_phone');
	const t27 = at('narrator_027_door_opening');
	const t28 = at('narrator_028_another');
	const t29 = at('narrator_029_and_another');
	const t30 = at('narrator_030_got_out_of_bed');
	const t31 = at('narrator_031_mr_harris');
	const t33 = at('narrator_033_several_others');
	const t35 = at('narrator_035_whispered');
	const s01 = at('sarah_001_is_everything_okay');
	const t36 = at('narrator_036_turned_eyes');
	const t37 = at('narrator_037_pale');
	const t38 = at('narrator_038_finger_lips');
	const t39 = at('narrator_039_be_quiet');
	const sar = talk('sarah');
	if (t >= t25 && t < t27) {
		const lf = f - Math.round(t25 * FPS);
		return (
			<PhoneFrame f={lf} d={Math.round((t27 - t25) * FPS)}>
				<LockScreen time="3:06" glow={Math.min(1, lf / 6)} />
			</PhoneFrame>
		);
	}
	const H = GEO.hall;
	const F = GEO.flat;
	// day: Sarah arrives with a box
	const arrive = walk(t, t16 + 0.2, t17 + 1.5, 300, 960, 1.15);
	const lobby = walk(t, t18, t19 - 0.2, 200, 1300, 1.6);
	// the landlord's office
	const officeP: Spec[] = [
		{is: Landlord, name: 'landlord', x: 1000, y: GEO.office.floor - 20, s: 1.6, frame: f, look: [-1, 0], mouth: t >= t20 && t < t22 ? 'open' : 'smile', talk: t >= t20 && t < t22 ? Math.max(0, Math.sin(t * 10)) * 0.6 : 0, arms: t >= t21 && t < t22 ? 'handsForward' : t >= t19 + 1 && t < t20 ? 'holdOne' : 'down'},
		{is: Sarah, name: 'sarah', x: 1480, y: GEO.office.floor + 10, s: 1.6, frame: f, look: [-1, 0], mouth: t >= t21 ? 'smile' : 'flat', brows: t >= t19 && t < t20 ? 'raised' : 'none'},
	];
	// first evening in the flat
	const unpack = walk(t, t22 + 0.2, t22 + 1.6, 1500, 1250, 1.6);
	// 3:06: out of bed (from the bedroom doorway) to the front door
	const toDoor = walk(t, t30 + 0.2, t31 - 0.1, 200, 1540, 1.6);
	const res = residentsPersp(f, 'stairs').map((p) => ({...p, idle: false}));
	const peepRes = res.filter((p) => t >= t33 || p.name === 'harris');
	// Harris in the side hallway: in front of the left door, facing the stairs; turns his eyes to Sarah's door
	const turnEyes = t >= t36;
	const harris: Spec = {is: Harris, name: 'harris', x: 560, y: H.floor + 30, s: 1.55, frame: f, turn: turnEyes ? 0 : 0.7, look: turnEyes ? [1, 0] : [1, 0], pale: t >= t37 ? 0.4 : 0.1, eyes: 'wide', brows: 'worried', mouth: 'flat', arms: t >= t38 ? 'fingerLips' : 'down', shiver: 0.4};
	const sarahDoor = t >= t35;
	const shots = [
		shot(0, 'exterior_day', 1.0, 1.0, [960, 540]),
		shot(t17, 'exterior_day', 1.0, 1.08, [960, 540], [960, 500]),
		shot(t18, 'lobby_day', 1.0, 1.0, [960, 540]),
		shot(t19, 'office_day', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(officeP), t20, 'office_day', 1.6, [1100, 560]),
		shot(t21, 'office_day', 1.25, 1.3, [1240, 600], [1240, 600]),
		shot(t22, 'flat_day_bare', 1.0, 1.0, [960, 540]),
		shot(t23, 'flat_night_bare', 1.0, 1.0, [960, 540]),
		shot(tA, 'exterior_night', 1.25, 1.4, [960, 300], [960, 260]),
		shot(t24, 'flat_night_bare', 1.0, 1.04, [960, 540], [960, 540]),
		shot(t27, 'hallway_night', 1.0, 1.0, [960, 540]),
		shot(t30, 'flat_night_bare', 1.0, 1.0, [960, 540]),
		shot(t31, 'hallway_persp_night', 1.0, 1.08, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t35, 'flat_night_bare', 2.4, 2.5, [1500, 540], [1500, 530]),
		shot(s01 + 0.3, 'hallway_night', 1.15, 1.2, [800, 540], [820, 540]),
		fshot(boxesOf([harris]), t36, 'hallway_night', 2.4, [560, 520]),
		fshot(boxesOf([harris]), t38, 'hallway_night', 2.7, [560, 500]),
	];
	const world = (set: string) => {
		if (set === 'exterior_day') {
			const g = GEO.ext.ground;
			return (
				<g>
					<Person is={Sarah} name="sarah" x={arrive.x} y={g} s={1.15} frame={f} {...gait(arrive)} arms="hold" mouth="smile" look={[1, -0.3]} edge />
					<MovingBox x={arrive.x + (arrive.moving ? 8 : 0)} y={g - 150} w={88} h={64} frame={f} />
				</g>
			);
		}
		if (set === 'lobby_day') {
			return (
				<g>
					<Person is={Sarah} name="sarah" x={lobby.x} y={GEO.lobby.floor} s={1.6} frame={f} {...gait(lobby)} arms="hold" mouth="smile" look={[1, 0]} edge />
					<MovingBox x={lobby.x + (lobby.moving ? 10 : 0)} y={GEO.lobby.floor - 205} w={120} h={86} frame={f} />
				</g>
			);
		}
		if (set === 'office_day') return <Group people={officeP} />;
		if (set === 'flat_day_bare') {
			return (
				<g>
					<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
					<Prop name="sofa" x={FLAT_PROPS.sofa.x} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} />
					<MovingBox x={1700} y={F.floor} w={150} h={110} frame={f} seed={3} />
					<Person is={Sarah} name="sarah" x={unpack.x} y={F.floor} s={1.6} frame={f} {...gait(unpack)} mouth="smile" arms={unpack.moving ? 'down' : 'hipsHands'} look={[-1, 0]} />
				</g>
			);
		}
		if (set === 'exterior_night') return null;
		if (set === 'hallway_night') {
			if (t < t30) {
				// door after door swings open (heard by Sarah); nobody yet
				return (
					<g>
						<HallDoor r={H.doors[0]} open={ramp(t, t27 + 0.3, t27 + 1)} />
						<HallDoor r={H.doors[2]} open={ramp(t, t28 + 0.1, t28 + 0.8)} />
					</g>
				);
			}
			return (
				<g>
					<HallDoor r={H.doors[0]} open={1} />
					<HallDoor r={H.doors[2]} open={1} />
					<HallDoor r={H.doors[1]} open={sarahDoor ? 0.18 : 0} dark="#1a2440" />
					<Person {...harris} />
				</g>
			);
		}
		if (set === 'flat_night_bare') {
			const props = (
				<g>
					<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
					<Prop name="sofa" x={FLAT_PROPS.sofa.x} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} />
				</g>
			);
			if (t < t30) return props;
			const atDoor = t >= t35;
			return (
				<g>
					{props}
					{atDoor ? <rect x={F.door[0] + 6} y={F.door[1] + 6} width={22} height={F.door[3] - F.door[1] - 12} fill="#d9e2a0" opacity={0.7} /> : null}
					<Person is={Sarah} name="sarah" x={atDoor ? 1420 : toDoor.x} y={F.floor} s={1.6} frame={f} {...(atDoor ? {turn: 0.7, lean: 6} : gait(toDoor))} look={[1, -0.1]} eyes="wide" brows="worried" mouth={sar.talk > 0 ? 'open' : 'flat'} talk={sar.talk} viseme={sar.viseme} edge={toDoor.x < 300} />
				</g>
			);
		}
		// peephole
		return <Group people={peepRes} />;
	};
	void word;
	void lerp;
	void t29;
	void t39;
	return <Shots shots={shots} world={(s) => world(s.set)} overlay={peepOverlay} />;
};
void AbsoluteFill;
