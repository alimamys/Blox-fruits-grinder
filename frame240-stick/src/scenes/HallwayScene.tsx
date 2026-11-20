// 6. THE HALLWAY CHANGES - the repeating stain, the pencil-line crack, the wall like paper, three taps.
import React from 'react';
import {Mara} from '../components/characters/Cast';
import type {PicId} from '../layout/pictures';
import {DrawnLine, Flicker, Glow, Stain} from '../stick/f240';
import {Beam, Person} from '../stick/goat';
import {clamp01, GEO, lerp, perspX, ramp, shot, Shots, ui, useStick, walk} from '../stick/kit';
import type {Pt} from '../utils/rough';
import {AtDesk, ed, hallPos, MF} from './common';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_pattern'];
/** the extra stains down the runner (feet y, width) */
const STAINS: Array<[number, number]> = [
	[870, 120],
	[920, 150],
	[1080, 190],
	[1170, 230],
];
const H = GEO.hallSide;

export const HallwayScene: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t58 = T('narrator_058_keys');
	const t59 = T('narrator_059_another_second');
	const t60 = T('narrator_060_something_wrong');
	const t62 = T('narrator_062_same_stain');
	const t64 = T('narrator_064_pencil_mark');
	const t65 = T('narrator_065_moved_closer');
	const t69 = T('narrator_069_touched');
	const tL = at('finger_line');
	const eL = end('finger_line');
	const t71 = T('narrator_071_behind_door');
	const tT = at('taps');
	const t74 = T('narrator_074_ran_back');
	const tapZ = (z: number, n: number) => shot(tT + [0.3, 1.0, 1.7][n], 'hall_side_night', z, z, [1420, 560], [1420, 560], {shake: 7, light: 'flash', tag: 'tap'});
	const shots = [
		// "I grabbed my keys." - she stands
		shot(t58, 'room_front_night', 1.3, 1.36, [980, 560], [990, 550], {tag: 'stand'}),
		// "I wasn't going to spend another second trying to understand it." - into the doorway
		shot(t59, 'room_front_night', 1.0, 1.15, [960, 540], [1300, 560], {tag: 'go'}),
		// "But when I reached the hallway, something was wrong."
		shot(t60, 'hall_persp_night', 1.0, 1.05, [960, 540], [940, 530], {tag: 'enter', light: 'black'}),
		// "The carpet looked different."
		shot(T('narrator_061_carpet'), 'hall_persp_night', 2.4, 2.55, [905, 980], [905, 960], {light: 'flash'}),
		// "The same stain appeared every few feet, repeating in a perfect pattern."
		shot(t62, 'hall_persp_night', 1.5, 1.6, [905, 860], [905, 830], {light: 'flash', tag: 'stains'}),
		// "The crack above the bedroom door was no longer just a crack."
		shot(T('narrator_063_crack'), 'hall_persp_night', 4.0, 4.3, [1000, 300], [1005, 295], {light: 'flash'}),
		// "It was a thin, black line. Almost like a pencil mark."
		shot(t64, 'hall_persp_night', 5.0, 5.3, [1005, 295], [1010, 290], {light: 'flash', tag: 'pencil'}),
		// "I moved closer." - along the side wall with the phone torch
		shot(t65, 'hall_side_night', 1.0, 1.05, [960, 540], [900, 560], {light: 'flash', tag: 'side'}),
		// "The entire wall looked wrong." / "Too smooth. Too flat." / "Like someone had painted over a photograph."
		shot(T('narrator_066_wall_wrong'), 'hall_side_night', 1.3, 1.36, [880, 520], [880, 520], {light: 'flash', tag: 'side'}),
		shot(T('narrator_067_too_smooth'), 'hall_side_night', 2.6, 2.75, [880, 440], [900, 440], {light: 'flash', tag: 'wall', wash: 0.16}),
		shot(T('narrator_068_photograph'), 'hall_side_night', 1.8, 1.9, [880, 480], [870, 480], {light: 'flash', tag: 'side', wash: 0.24}),
		// "I reached out and touched the surface." / "It felt like paper."
		shot(t69, 'hall_side_night', 1.6, 1.7, [880, 560], [880, 540], {light: 'flash', tag: 'touch', wash: 0.24}),
		shot(T('narrator_070_paper'), 'hall_side_night', 2.8, 2.9, [960, 470], [960, 470], {light: 'flash', tag: 'touch', wash: 0.24}),
		// a faint black line follows her fingertip
		shot(tL, 'hall_side_night', 2.6, 2.6, [1000, 480], [1040, 480], {light: 'flash', tag: 'touch', wash: 0.24}),
		// "Then, from behind the bedroom door, I heard a sound."
		shot(t71, 'hall_side_night', 1.25, 1.3, [960, 560], [990, 560], {light: 'flash', tag: 'listen', wash: 0.24}),
		// "Three gentle taps."  then tap. tap. tap. - a jolt on each
		shot(T('narrator_072_three_taps'), 'hall_side_night', 1.9, 2.0, [1420, 560], [1420, 560], {light: 'flash', tag: 'tap'}),
		tapZ(2.2, 0),
		tapZ(2.5, 1),
		tapZ(2.85, 2),
		// "The same scratching noise I'd heard through my computer speakers."
		shot(T('narrator_073_same_scratching'), 'hall_side_night', 2.2, 2.35, [760, 540], [770, 535], {light: 'flash', tag: 'listen', wash: 0.24}),
		// "I ran back to the desk."
		shot(t74, 'room_front_night', 1.0, 1.04, [960, 540], [940, 545], {tag: 'run'}),
		// "And for the first time, I understood."
		shot(T('narrator_075_understood'), 'room_front_night', 2.6, 2.9, [868, 655], [868, 660], {tag: 'understood'}),
		// "The animation wasn't copying my hallway anymore."
		ui(T('narrator_076_not_copying'), ed('canvas_pattern', 240, {strip: STRIP, push: [1.0, 1.1], focus: [0.42, 0.45]})),
		// "My hallway was copying the animation." - match cut: the real hallway, in her animation's light
		shot(T('narrator_077_copying_animation'), 'hall_persp_night', 1.0, 1.1, [960, 540], [930, 520], {light: 'canvas', tag: 'copy'}),
	];
	// her fingertip on the wall (world coords) during the finger line
	const lineA: Pt = [900, 470];
	const lineB: Pt = [1180, 500];
	const kLine = ramp(t, tL + 0.1, eL - 0.2);
	const tip: Pt = [lerp(lineA[0], lineB[0], kLine), lerp(lineA[1], lineB[1], kLine)];
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'room_front_night') {
			if (s.tag === 'stand') {
				const up = t > t58 + 0.6;
				return <AtDesk f={f} phone={up ? false : true} m={up ? {pose: 'stand', prop: 'phone', arms: {l: [10, 0], r: [22, -105]}, brows: 'angry', mouth: 'flat', look: [0.6, 0]} : {brows: 'angry', look: [0, 0.6]}} />;
			}
			if (s.tag === 'go') {
				const w = walk(t, t59 + 0.2, end('narrator_059_another_second') - 0.3, MF.x, 1490, 2.2);
				const k = clamp01((w.x - MF.x) / (1490 - MF.x));
				const gone = ramp(t, end('narrator_059_another_second') - 0.6, end('narrator_059_another_second') - 0.1);
				return (
					<AtDesk f={f} empty phone={false}>
						<g opacity={1 - gone}>
							<Person is={Mara} name="mara" x={w.x} y={lerp(MF.y, 1100, k)} s={lerp(MF.s, 2.1, k)} back frame={f} pose={w.moving ? 'walk' : 'stand'} phase={w.phase} prop="phone" />
						</g>
					</AtDesk>
				);
			}
			if (s.tag === 'run') {
				const w = walk(t, t74, t74 + 1.2, 1490, MF.x, 2.2);
				const k = clamp01((1490 - w.x) / (1490 - MF.x));
				const sat = t > t74 + 1.2;
				return sat ? (
					<AtDesk f={f} phone={false} m={{eyes: 'wide', brows: 'worried', mouth: 'o', shiver: 0.8}} />
				) : (
					<AtDesk f={f} empty phone={false}>
						<Person is={Mara} name="mara" x={w.x} y={lerp(1100, MF.y, k)} s={lerp(2.1, MF.s, k)} frame={f} pose="run" turn={-0.8} phase={w.phase} eyes="wide" brows="worried" mouth="o" prop="phone" />
					</AtDesk>
				);
			}
			return <AtDesk f={f} phone={false} m={{eyes: 'wide', brows: 'raised', mouth: 'o', shiver: 0.5}} />;
		}
		if (s.set === 'hall_persp_night') {
			const stainsK = s.tag === 'stains' ? (n: number) => ramp(t, t62 + 0.4 + n * 0.45, t62 + 0.6 + n * 0.45) : s.tag === 'copy' || t > t62 ? () => 1 : () => 0;
			const crack = GEO.persp.crack;
			const pencilK = s.tag === 'pencil' ? ramp(t, t64 + 0.2, t64 + 1.6) : s.tag === 'copy' ? 1 : 0;
			let mara: React.ReactNode = null;
			if (s.tag === 'enter') {
				const k = ramp(t, t60, t60 + 2.2) * 0.25;
				const p = hallPos(k);
				const hand: Pt = [perspX(p.y, -0.32) + 30 * p.s, p.y - 200 * p.s];
				mara = (
					<g>
						<Beam from={hand} to={[905, 640]} w={300} k={0.9} />
						<Person is={Mara} name="mara" x={perspX(p.y, -0.32)} y={p.y} s={p.s} back frame={f} pose={k < 0.24 ? 'walk' : 'stand'} phase={k * 40} arms={{l: [10, 0], r: [40, -60]}} prop="phone" light="flash" edge />
					</g>
				);
			}
			return (
				<g>
					{STAINS.map(([y, w], n) => (
						<Stain key={y} x={905} y={y} w={w} frame={f} k={1.3 * stainsK(n)} />
					))}
					{pencilK > 0 ? <path d={`M${crack[0][0]},${crack[0][1]} L${crack[1][0]},${crack[1][1]} L${crack[2][0]},${crack[2][1]}`} stroke="#050505" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pencilK} /> : null}
					{mara}
					{s.tag === 'copy' ? <Flicker f={f} k={0.25} /> : null}
				</g>
			);
		}
		// the hallway's side wall
		const pool = <Glow cx={s.tag === 'tap' ? 1420 : 960} cy={500} r={520} color="#fff6d8" k={0.55} />;
		const lineK = t >= tL ? kLine : 0;
		if (s.tag === 'side') {
			const w = walk(t, t65, t65 + 2.4, 330, 760, 1.65);
			return (
				<g>
					{pool}
					<Person is={Mara} name="mara" x={w.x} y={H.floor} s={1.65} frame={f} pose={w.moving ? 'walk' : 'stand'} turn={w.moving ? 0.8 : 0.3} phase={w.phase} prop="phone" arms={{l: [10, 0], r: [40, -60]}} eyes="dot" brows="worried" look={[0.6, -0.4]} />
				</g>
			);
		}
		if (s.tag === 'wall') return pool;
		if (s.tag === 'touch') {
			const reach = ramp(t, t69, t69 + 0.8);
			// she faces the wall (back to us); her right fingertip on the wall, walking along as the line follows it
			const S = 1.65;
			const x = tip[0] - 26 * S - 14;
			const sh: Pt = [x + 26 * S, H.floor - 213 * S];
			const aim = (Math.atan2(tip[0] - sh[0], tip[1] - sh[1]) * 180) / Math.PI;
			const moving = t > tL + 0.1 && t < eL - 0.2;
			return (
				<g>
					{pool}
					<DrawnLine a={lineA} b={lineB} k={lineK} w={4} />
					<Person is={Mara} name="mara" x={x} y={H.floor} s={S} back frame={f} pose={moving ? 'walk' : 'stand'} phase={(tip[0] - lineA[0]) / 30} arms={{l: [10, 0], r: [lerp(10, aim, reach), 0]}} />
				</g>
			);
		}
		if (s.tag === 'listen')
			return (
				<g>
					{pool}
					<DrawnLine a={lineA} b={lineB} k={1} w={4} />
					<Person is={Mara} name="mara" x={640} y={H.floor} s={1.65} frame={f} turn={0.55} look={[1, 0]} eyes="wide" brows="worried" mouth="o" prop="phone" arms={{l: [10, 0], r: [40, -60]}} shiver={t > t71 + 1 ? 0.6 : 0} />
				</g>
			);
		// the bedroom door, the taps
		return (
			<g>
				{pool}
				<DrawnLine a={lineA} b={lineB} k={1} w={4} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
