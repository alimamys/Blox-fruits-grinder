// 2. THE EMPTY HOUSE - always moving; the farmhouse on the hill; the noises; the birthday, the fever, the boxes.
import React from 'react';
import {Dad, Doctor, Eli, Mom, PALETTES} from '../components/characters/Cast';
import {BEDS, Cake, GEO, gait, MovingBox, ramp, shot, Shots, Tint, Truck, useStick, walk} from '../stick/kit';
import {ADULT_S, BedScene, KID_S} from '../stick/rooms';

export const House: React.FC = () => {
	const {f, t, at, end, word} = useStick();
	const L = (id: string) => at(id);
	const t09 = L('narrator_009_never_stayed');
	const t10 = L('narrator_010_chased_jobs');
	const t11 = L('narrator_011_farmhouse');
	const t12 = L('narrator_012_too_big');
	const tRooms = word('narrator_012_too_big', 'rooms', 0.5);
	const t13 = L('narrator_013_noises');
	const tTaps = word('narrator_013_noises', 'taps', 0.75);
	const t14 = L('narrator_014_settle');
	const tMom = word('narrator_014_settle', 'mom', 0.55);
	const t15 = L('narrator_015_sick');
	const tSick = word('narrator_015_sick', 'sick', 0.85);
	const t16 = L('narrator_016_fever');
	const t17 = L('narrator_017_boxes');
	const t18 = L('narrator_018_empty_room');
	const tGinger = word('narrator_018_empty_room', 'ginger', 0.7);
	const t19 = L('narrator_019_bored');
	const t20 = L('narrator_020_showed_up');
	const tSk = L('bed_skirt');
	const bd = BEDS.bedroom_day;

	// the truck passing on the road (two passes: two different moves)
	const pass = (t0: number, t1: number) => ({x: 2500 - ((t - t0) / (t1 - t0)) * 3300, dist: (t - t0) * 260});
	const shots = [
		shot(0, 'farmhouse_day', 1.0, 1.04, [960, 540], [980, 530]),
		shot(t09, 'road_day', 1.0, 1.03, [960, 560]),
		shot(t10, 'road_day', 1.25, 1.25, [960, 600], [960, 600], {light: 'grey'}),
		shot(t11, 'farmhouse_day', 1.0, 1.1, [900, 560], [1000, 580]),
		shot(tRooms - 0.1, 'hallway', 1.0, 1.12, [960, 560], [960, 560]),
		shot(t13, 'hallway', 1.05, 1.5, [960, 560], [960, 570], {light: 'dark'}),
		shot(tTaps - 0.2, 'bedroom_night', 1.6, 1.75, [420, 560], [400, 560]),
		shot(t14, 'kitchen_night', 1.0, 1.05, [960, 560], [960, 580], {light: 'warm'}),
		shot(t15, 'kitchen_night', 1.6, 1.7, [600, 640], [600, 650], {light: 'warm'}),
		shot(tSick - 0.15, 'bedroom_day', 1.5, 1.6, [520, 560], [520, 580]),
		shot(t16, 'bedroom_day', 1.0, 1.05, [900, 560], [880, 560]),
		shot(t17, 'bedroom_day', 1.0, 1.08, [960, 560], [1200, 560]),
		shot(t18, 'bedroom_day', 2.4, 1.4, [1150, 660], [900, 600]),
		shot(t19, 'bedroom_day', 1.0, 1.04, [700, 560]),
		shot(t20, 'bedroom_day', 1.15, 1.9, [600, 600], [665, 770]),
	];

	const world = (set: string) => {
		if (set === 'road_day') {
			const p = t < t10 ? pass(t09, t10 + 0.2) : pass(t10, t11 + 0.2);
			return (
				<Truck x={p.x} y={GEO.road_day.ground} s={0.7} frame={f} dist={p.dist} inside={<Eli x={-232} y={-148} s={0.78} frame={f} pose="sit" look={[-1, 0]} palette={PALETTES.eliDay} />} />
			);
		}
		if (set === 'farmhouse_day') {
			const g = GEO.farmhouse_day.ground;
			const dad = walk(t, t11 + 0.4, t12 + 2.2, 700, 1080, 1.05);
			const mom = walk(t, t11 + 0.9, t12 + 2.6, 640, 950, 1.0);
			const eli = walk(t, t11 + 0.6, t12 + 2.0, 780, 1250, 0.7);
			const fam = t >= t11;
			return (
				<g>
					<Truck x={430} y={g} s={0.62} frame={f} />
					{fam ? (
						<>
							<Mom x={mom.x} y={g + 18} s={1.0} frame={f} {...gait(mom)} />
							<Dad x={dad.x} y={g + 22} s={1.05} frame={f} {...gait(dad)} arms="hold" />
							<MovingBox x={dad.x + (dad.moving ? 20 : 0)} y={g + 22 - 132} w={84} h={64} frame={f} />
							<Eli x={eli.x} y={g + 30} s={1.0} frame={f} {...gait(eli)} palette={PALETTES.eliDay} look={[0.3, -1]} mouth="smile" />
						</>
					) : null}
				</g>
			);
		}
		if (set === 'hallway') {
			if (t >= t13) return null;
			return (
				<Eli x={960} y={1075} s={KID_S * 1.25} frame={f} back palette={PALETTES.eliDay} />
			);
		}
		if (set === 'bedroom_night') {
			return <BedScene set="bedroom_night" light="night" frame={f} bed={{mode: 'lie', p: {eyes: 'wide', look: [-0.9, -0.6], brows: 'worried'}}} id="hn" />;
		}
		if (set === 'kitchen_night') {
			const g = GEO.kitchen_night.ground;
			const birthday = t >= t15;
			const sayDad = t < tMom;
			return (
				<Tint light="warm">
					{birthday ? <Cake x={590} y={GEO.kitchen_night.table[1] + 4} s={0.8} frame={f} lit={t < t15 + 1.4} /> : null}
					<Dad x={1060} y={g} s={ADULT_S} frame={f} arms={!birthday && sayDad ? 'shrug' : birthday ? 'hipsHands' : 'down'} mouth={!birthday && sayDad ? 'faint' : 'smile'} look={[-0.6, 0.2]} />
					<Mom x={1560} y={g} s={ADULT_S * 0.97} frame={f} arms={!birthday && !sayDad ? 'folded' : 'down'} mouth="smile" tilt={!birthday && !sayDad ? -8 : 0} look={[-0.8, 0.3]} />
					<Eli x={700} y={g + 40} s={KID_S} frame={f} palette={PALETTES.eliDay} mouth={birthday && t < t15 + 1.4 ? 'o' : 'smile'} look={birthday ? [-0.6, 0.4] : [sayDad ? 1 : 1, -0.6]} />
				</Tint>
			);
		}
		// bedroom_day
		const sickP = {pale: 0.35, eyes: 'squint' as const, brows: 'sad' as const, sweat: true, mouth: 'flat' as const};
		if (t < t16) return <BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'lie', p: sickP}} id="hd" />;
		if (t < t17) {
			const g = bd.front;
			const doctorTalk = Math.max(0, Math.sin(t * 13)) * (t < end('narrator_016_fever') ? 0.7 : 0);
			return (
				<BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'lie', p: {...sickP, look: [1, -0.3]}}} id="hd"
					front={
						<>
							<Mom x={1580} y={g + 10} s={ADULT_S} frame={f} arms="folded" brows="worried" mouth="flat" look={[-1, 0.2]} />
							<Doctor x={1220} y={g} s={ADULT_S} frame={f} arms={t > word('narrator_016_fever', 'weeks', 0.4) ? 'point' : 'down'} flip mouth="open" talk={doctorTalk} look={[-1, 0.4]} />
						</>
					}
				/>
			);
		}
		if (t < t18) {
			const dad = walk(t, t17 + 0.2, t17 + 2.6, 2100, 1360, 1);
			const placed = t > t17 + 2.9;
			const dadBack = walk(t, t17 + 3.3, t17 + 5.6, 1360, 2200, 1);
			const x = placed ? dadBack.x : dad.x;
			const w = placed ? dadBack : dad;
			return (
				<BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'sit', p: {pale: 0.25, mouth: 'flat', brows: 'sad', look: [1, 0]}}} id="hd"
					front={
						<>
							{placed ? <MovingBox x={1395} y={bd.front - 10} w={170} h={120} frame={f} seed={2} /> : null}
							<Dad x={x} y={bd.front + 14} s={ADULT_S} frame={f} {...gait(w)} arms={placed ? 'down' : 'hold'} />
							{!placed ? <MovingBox x={x - 10} y={bd.front + 14 - 236} w={150} h={110} frame={f} seed={2} /> : null}
						</>
					}
				/>
			);
		}
		if (t < t19) {
			const mom = walk(t, tGinger - 0.6, tGinger + 1.6, 2100, 1400, 1);
			return <BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'sit', p: {mouth: 'faint', look: [1, 0.2]}}} id="hd" front={t > tGinger - 0.6 ? <Mom x={mom.x} y={bd.front + 10} s={ADULT_S} frame={f} {...gait(mom)} mouth="smile" /> : null} />;
		}
		// bored, then the skirt
		const sigh = Math.sin(t * 1.3) * 3;
		const rustle = t > tSk ? Math.abs(Math.sin((t - tSk) * 20)) * 16 * (1 - ramp(t, tSk + 0.6, tSk + 1.2)) : 0;
		return (
			<BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'lie', blanketWob: sigh, p: {eyes: t > tSk ? 'wide' : 'squint', mouth: 'flat', look: t > tSk ? [0.8, 0.8] : [Math.sin(t * 0.6) * 0.8, -0.6]}}} id="hd" skirt={{cx: 665, h: rustle}} />
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
