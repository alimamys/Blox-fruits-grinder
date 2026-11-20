// 2. A NORMAL NIGHT - Mara, her work, her hallway.
import React from 'react';
import {Mara} from '../components/characters/Cast';
import type {PicId} from '../layout/pictures';
import {ChairSeat, Flicker, Glow, OfficeChair, Rain} from '../stick/f240';
import {Person} from '../stick/goat';
import {GEO, shot, Shots, ui, useStick} from '../stick/kit';
import type {Pt} from '../utils/rough';
import {AtDesk, ed, MS, prog} from './common';

const STRIP: PicId[] = Array.from({length: 12}, () => 'canvas_empty' as PicId);
const STRIP240: PicId[] = [...STRIP.slice(1), 'canvas_man_far'];

export const NormalNight: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t15 = T('narrator_015_crack_carpet_stain');
	const e15 = end('narrator_015_crack_carpet_stain');
	const t17 = T('narrator_017_saved');
	const e17 = end('narrator_017_saved');
	// the three details of the real hallway: the crack, the carpet stain, the ceiling stain
	const details: Array<[number, Pt]> = [
		[4.2, [1000, 300]],
		[3.2, [905, 990]],
		[4.0, [1120, 70]],
	];
	const dk = (t - t15) / Math.max(0.1, e15 - t15);
	const di = Math.min(2, Math.max(0, Math.floor(dk * 3)));
	const shots = [
		// "My name is Mara. I'm a freelance animator." - the building in the rain, one window lit
		shot(T('narrator_010_name_mara'), 'exterior_night', 1.0, 1.25, [960, 540], [1088, 520]),
		shot(T('narrator_010_name_mara', 0.5), 'room_side_night', 1.0, 1.06, [960, 540], [900, 560], {tag: 'side'}),
		// "Most nights, I work until two or three in the morning."
		shot(T('narrator_011_most_nights'), 'room_front_night', 1.6, 1.7, [920, 610], [910, 615], {tag: 'tired'}),
		// "It's quieter then. No phone calls. No interruptions." - the mug, the silent phone on the desk
		shot(T('narrator_011_most_nights', 0.55), 'room_front_night', 3.4, 3.5, [430, 860], [440, 860], {tag: 'desk'}),
		// "That night, I was finishing a short animation of an empty apartment hallway."
		shot(T('narrator_012_finishing'), 'room_side_night', 1.7, 1.85, [840, 560], [900, 540], {tag: 'side'}),
		// "Nothing complicated. A flickering ceiling light, a few shadows, a slow movement toward a closed bedroom door."
		ui(T('narrator_013_nothing_complicated'), (fl, d) =>
			ed('canvas_empty', 200 + Math.round(prog(fl, d) * 39), {total: 239, strip: STRIP, play: prog(fl, d), playing: true, zoom: {z: 1 + 0.3 * prog(fl, d), cx: 0.5, cy: 0.5}, dim: fl % 19 < 2 ? 0.35 : 0, push: [1, 1.04]})(fl, d),
		),
		// "I'd used my own hallway as a reference." - match cut to the real one, the bulb on
		shot(T('narrator_014_own_hallway'), 'hall_persp_night', 1.0, 1.06, [960, 540], [930, 530]),
		// "The little crack above the doorframe, the old carpet, even the stain on the ceiling."
		shot(t15, 'hall_persp_night', 1, 1, [960, 540], [960, 540], {tag: 'details'}),
		// "I'd been staring at the same ten seconds of animation for nearly three hours."
		shot(T('narrator_016_three_hours'), 'room_front_night', 2.2, 2.3, [880, 640], [875, 645], {tag: 'chin'}),
		// "Eventually, I saved the project, closed my eyes for a moment, and checked the timeline one last time."
		shot(t17, 'room_front_night', 1.5, 1.65, [930, 620], [900, 640], {tag: 'save'}),
		// "That's when I noticed the extra frame." - the playhead stops on 240
		ui(T('narrator_018_extra_frame'), (fl, d) => ed(fl < d * 0.45 ? 'canvas_empty' : 'canvas_man_far', 240, {strip: STRIP240, newCell: prog(fl, d, 0.3, 0.5), push: [1.25, 1.55], focus: [0.93, 0.92]})(fl, d)),
	];
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'exterior_night') {
			const w = GEO.ext.window;
			return (
				<g>
					<Rain box={[0, 0, 1920, 1080]} frame={f} n={90} opacity={0.35} />
					<Glow cx={(w[0] + w[2]) / 2} cy={(w[1] + w[3]) / 2} r={120} color="#cfe0ff" k={0.6 + 0.08 * Math.sin(t * 7)} />
				</g>
			);
		}
		if (s.set === 'room_side_night')
			return (
				<g>
					<OfficeChair x={MS.x} y={MS.y} s={MS.s} frame={f} view="front" />
					<Person is={Mara} name="mara" x={MS.x} y={MS.y} s={MS.s} pose="sit" frame={f} turn={0.4} look={[1, -0.1]} brows="flat" arms={{l: [20, -70], r: [68 + Math.sin(t * 2.4) * 5, -34 + Math.sin(t * 3.1) * 6]}} light="screen" />
					<ChairSeat x={MS.x} y={MS.y} s={MS.s} frame={f} />
					<Rain box={[1000, 40, 1595, 530]} frame={f} opacity={0.4} />
				</g>
			);
		if (s.set === 'room_front_night') {
			if (s.tag === 'tired') {
				const rub = Math.sin((t - at('narrator_011_most_nights')) * 1.4) > 0.2;
				return <AtDesk f={f} m={{eyes: rub ? 'closed' : 'squint', brows: 'sad', arms: rub ? {l: [28, -64], r: [-10, -165]} : {l: [28, -64], r: [28, -64]}}} />;
			}
			if (s.tag === 'chin') return <AtDesk f={f} m={{eyes: 'squint', brows: 'flat', tilt: -6, arms: {l: [28, -64], r: [-5, -150]}}} />;
			if (s.tag === 'save') {
				const k = (t - t17) / Math.max(0.1, e17 - t17);
				return k < 0.34 ? (
					<AtDesk f={f} m={{look: [0, 0.8], brows: 'flat'}} />
				) : k < 0.67 ? (
					<AtDesk f={f} m={{eyes: 'closed', tilt: -8, lean: -4, arms: {l: [10, -10], r: [10, -10]}}} />
				) : (
					<AtDesk f={f} m={{look: [0, 0.2], brows: 'flat'}} />
				);
			}
			return <AtDesk f={f} m={{brows: 'flat'}} />;
		}
		if (s.set === 'hall_persp_night')
			return (
				<g>
					<Flicker f={f} k={0.18} />
				</g>
			);
		return null;
	};
	// the details shot walks the camera: crack -> carpet stain -> ceiling stain
	const shotsCam = shots.map((s) => (s.tag === 'details' ? {...s, z0: details[di][0], z1: details[di][0] * 1.04, f0: details[di][1], f1: details[di][1]} : s));
	return <Shots shots={shotsCam} world={(s) => world(s)} />;
};
