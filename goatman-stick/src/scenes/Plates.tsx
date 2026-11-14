// 9. PLATES - twelve years later in Chicago: six friends over for the game. Seven on the couch,
// eight greasy plates. From behind the bathroom door I always keep shut, that smell. Count them.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Andre, Jalen, Kayla, Lucia, Malik, MarcusAdult, Tasha} from '../components/characters/Cast';
import {BigWords, Counts, Person, Plates as PaperPlates, Smell, TitleCardGoat} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, Group, headOf, type Spec} from '../stick/places';

export const Plates: React.FC = () => {
	const {f, t, at, total} = useStick();
	const t141 = at('narrator_141_twelve_years');
	const t143 = at('narrator_143_six_friends');
	const t144 = at('narrator_144_plates');
	const t145 = at('narrator_145_cleaning');
	const t146 = at('narrator_146_seven_couch');
	const t147 = at('narrator_147_eight_plates');
	const t148 = at('narrator_148_again');
	const t149 = at('narrator_149_eight');
	const t150 = at('narrator_150_bathroom');
	const t151 = at('narrator_151_that_smell');
	const tCB = at('cut_black_end');
	const t153 = at('narrator_153_next_time');
	const t154 = at('narrator_154_count_them');
	const t155 = at('narrator_155_count_plates');
	const tCr = at('credit');
	if (t >= tCr) return <TitleCardGoat f={f - Math.round(tCr * 24)} d={Math.round((total - tCr) * 24)} credit />;
	if (t >= tCB) {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				{t >= t154 ? <BigWords text="COUNT THEM." size={150} k={ramp(t, t154, t154 + 0.3)} /> : null}
				{t >= t155 ? <BigWords text="THEN COUNT THE PLATES." size={96} k={ramp(t, t155, t155 + 0.3)} color="#ff4a3a" y={160} /> : null}
				{t >= t153 && t < t154 ? <g /> : null}
			</AbsoluteFill>
		);
	}
	const A = GEO.apartment;
	const cheer = t >= t143 && t < t145;
	// six friends: four on the couch, two on the floor-end of it standing; Marcus sets out plates, then clears
	const S = 1.35;
	const couch: Spec[] = [
		{is: Tasha, name: 'f1', x: 600, y: A.couchSeat + 72 * S, s: S, pose: 'sit'},
		{is: Jalen, name: 'f2', x: 760, y: A.couchSeat + 72 * S, s: S, pose: 'sit'},
		{is: Kayla, name: 'f3', x: 920, y: A.couchSeat + 72 * S, s: S, pose: 'sit'},
		{is: Andre, name: 'f4', x: 1080, y: A.couchSeat + 72 * S, s: S, pose: 'sit'},
		{is: Lucia, name: 'f5', x: 1240, y: A.couchSeat + 72 * S, s: S, pose: 'sit'},
		{is: Malik, name: 'f6', x: 1440, y: A.floor + 10, s: 1.45},
	].map((p) => ({...p, frame: f, arms: cheer && p.name.length % 2 === 0 ? 'armsUp' : 'down', mouth: cheer ? 'laugh' : t >= t146 ? 'flat' : 'smile', look: [0, 0.3]}));
	const mw = walk(t, t145 + 0.2, t145 + 1.6, 380, 470, 1.45);
	const marcus: Spec = {is: MarcusAdult, name: 'marcus', x: t < t145 ? 380 : mw.x, y: A.floor + 10, s: 1.45, frame: f, arms: t >= t144 && t < t145 ? 'handsForward' : t >= t145 && t < t146 ? 'handsForward' : 'down', look: t >= t150 ? [1, -0.1] : [1, 0.5], eyes: t >= t149 ? 'wide' : 'dot', brows: t >= t147 ? 'worried' : 'none', mouth: t >= t147 ? 'flat' : 'smile'};
	// seven on the couch: Marcus sits down at the end at "seven"
	const sevenSit = t >= t146 && t < t150;
	const people = [...couch, sevenSit ? {...marcus, x: 440, y: A.couchSeat + 72 * S, s: S, pose: 'sit' as const} : marcus];
	const nPlates = t < t144 ? 0 : t < t145 ? Math.min(8, Math.floor((t - t144) * 3) + 1) : 8;
	const plateXs = Array.from({length: 8}, (_, i) => lerp(A.table[0] + 50, A.table[2] - 50, i / 7));
	const sevenHeads = people.slice().sort((a, b) => a.x - b.x).map(headOf);

	const shots = [
		shot(0, 'city_night', 1.0, 1.05, [960, 540], [960, 560]),
		shot(t141, 'apartment_night', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(people), t147, 'apartment_night', 1.6, [915, 760]),
		shot(t148, 'apartment_night', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(people), t150, 'apartment_night', 2.2, [1610, 560]),
	];
	const world = (set: string) => {
		if (set !== 'apartment_night') return null;
		return (
			<g>
				{t >= t143 ? <Group people={people} /> : <Person is={MarcusAdult} name="marcus" x={960} y={A.couchSeat + 72 * S} s={S} pose="sit" frame={f} look={[0, 0.3]} mouth="flat" />}
				<PaperPlates n={nPlates} x0={plateXs[0]} x1={plateXs[7]} y={A.table[1] - 4} frame={f} />
				{t >= t146 && t < t147 ? <Counts heads={sevenHeads} t0={t146 + 0.2} t={t} step={0.22} /> : null}
				{t >= t147 && t < t148 ? <Counts heads={plateXs.map((x) => [x, A.table[1] + 10] as [number, number])} t0={t147 + 0.2} t={t} step={0.2} s={0.7} color="#ff7a5a" /> : null}
				<Smell k={t >= t151 ? ramp(t, t151, t151 + 1.2) : 0} frame={f} x0={1500} x1={1720} y0={420} y1={780} color="#b9c9a2" />
				{t >= t150 ? <rect x={A.bathDoor[0]} y={A.bathDoor[3] - 6} width={A.bathDoor[2] - A.bathDoor[0]} height={6} fill="#ffe9a8" opacity={0.4 + 0.4 * Math.abs(Math.sin(f / 3))} /> : null}
			</g>
		);
	};
	return (
		<>
			<Shots shots={shots} world={(s) => world(s.set)} />
			{t >= t149 && t < t150 ? <BigWords text="8" size={240} k={ramp(t, t149, t149 + 0.2)} color="#ff4a3a" y={-300} /> : null}
		</>
	);
};
