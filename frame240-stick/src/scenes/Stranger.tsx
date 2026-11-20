// 3. THE STRANGER - frame 240, the man in it, the layers, the lasso, play.
import React from 'react';
import {Mara} from '../components/characters/Cast';
import {EditorShot} from '../components/ui/Editor';
import {manBoxOf, type PicId} from '../layout/pictures';
import {ChairSeat, OfficeChair, Rain} from '../stick/f240';
import {Person} from '../stick/goat';
import {shot, Shots, ui, useStick} from '../stick/kit';
import {AtDesk, ed, full, MS, prog} from './common';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_man_far'];
const E = {total: 240, strip: STRIP};
const FAR = manBoxOf('far');

export const Stranger: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t20 = T('narrator_020_clicked');
	const t34 = T('narrator_034_pressed_play');
	const shots = [
		// "At first, I thought I'd accidentally duplicated something."
		ui(T('narrator_019_duplicated'), (fl, d) => ed('canvas_empty', fl < d * 0.5 ? 238 : 239, {...E, push: [1.7, 1.85], focus: [0.86, 0.88]})(fl, d)),
		// "I clicked on the final frame." - her hand on the stylus, from the side
		shot(t20, 'room_side_night', 2.3, 2.4, [860, 700], [880, 700], {tag: 'click'}),
		// "There was a man standing at the far end of the hallway."
		ui(T('narrator_021_man_standing'), (fl, d) => ed('canvas_man_far', 240, {...E, zoom: {z: 1 + 0.25 * prog(fl, d), cx: 0.5, cy: 0.45}, push: [1.0, 1.05], focus: [0.42, 0.42]})(fl, d)),
		// "He was very tall. Taller than the doorframe."
		ui(T('narrator_022_very_tall'), ed('canvas_man_detail', 240, {...E, zoomLabel: '400%', push: [1.15, 1.22], focus: [0.42, 0.4]})),
		// "His arms hung straight down, and his head tilted slightly forward..."
		ui(T('narrator_023_arms_hung'), (fl, d) => full('canvas_man_detail', [1.6, 1.6], [0.5, 0.2 + 0.6 * prog(fl, d)])(fl, d)),
		// "His face was almost completely hidden."
		ui(T('narrator_024_face_hidden'), full('canvas_face', [1.0, 1.1])),
		// "But something about the drawing bothered me."
		shot(T('narrator_025_bothered'), 'room_front_night', 1.9, 2.05, [900, 640], [880, 650], {tag: 'bothered'}),
		// "It matched my animation style perfectly."
		ui(T('narrator_026_my_style'), ed('canvas_man_far', 240, {...E, zoom: {z: 3.2, cx: 0.47, cy: 0.42}, zoomLabel: '400%', push: [1.0, 1.04]})),
		// "The same brush texture. The same lighting. Even the same shadows." - three crops
		ui(T('narrator_027_same_brush'), (fl, d) => {
			const p = fl / Math.max(1, d - 1);
			const crop = p < 0.33 ? {z: 4, cx: 0.32, cy: 0.5} : p < 0.66 ? {z: 3.5, cx: 0.47, cy: 0.12} : {z: 3.5, cx: 0.5, cy: 0.82};
			return ed('canvas_man_far', 240, {...E, zoom: crop, zoomLabel: '400%', push: [1.0, 1.0]})(fl, d);
		}),
		// "I checked the layers."
		ui(T('narrator_028_layers'), ed('canvas_man_far', 240, {...E, push: [1.0, 1.3], focus: [0.9, 0.2], cursor: [1600, 140]})),
		// "Background. Lighting. Ceiling. Door."
		ui(T('narrator_029_background_door'), (fl, d) => {
			const i = Math.min(3, Math.floor((fl / Math.max(1, d - 1)) * 4));
			return ed('canvas_man_far', 240, {...E, layer: 3 - i, push: [1.45, 1.5], focus: [0.9, 0.18], cursor: [1700, 112 + (3 - i) * 67]})(fl, d);
		}),
		// "There was no layer containing a man."
		ui(T('narrator_030_no_layer'), ed('canvas_man_far', 240, {...E, push: [1.1, 1.0], focus: [0.6, 0.35]})),
		// "I tried selecting him."
		ui(T('narrator_031_selecting'), (fl, d) => ed('canvas_man_far', 240, {...E, lasso: prog(fl, d, 0.05, 0.9), manBox: FAR, zoom: {z: 1.4, cx: 0.48, cy: 0.43}, zoomLabel: '140%', push: [1.0, 1.06], focus: [0.42, 0.4]})(fl, d)),
		// "Nothing."
		ui(T('narrator_032_nothing', 0) - 0.1, (fl, d) => ed('canvas_man_far', 240, {...E, lasso: 1, lassoFail: true, manBox: FAR, zoom: {z: 1.4, cx: 0.48, cy: 0.43}, zoomLabel: '140%', toast: fl > 3 ? 'No pixels selected' : null, push: [1.06, 1.08], focus: [0.42, 0.4]})(fl, d)),
		// "He was part of the picture."
		shot(T('narrator_033_part_of_picture'), 'room_front_night', 2.4, 2.55, [870, 650], [870, 655], {tag: 'uneasy'}),
		// "Then I pressed play again." - side view, her finger on the keyboard
		shot(t34, 'room_side_night', 1.9, 2.0, [820, 640], [840, 640], {tag: 'play'}),
		// the animation plays; at the last frame the man stands halfway down the hall
		ui(at('playback_1'), (fl, d) => {
			const p = fl / Math.max(1, d - 1);
			const last = p > 0.93;
			return (
				<EditorShot
					f={fl}
					d={d}
					{...E}
					picture={last ? 'canvas_man_mid' : 'canvas_empty'}
					frame={last ? 240 : 200 + Math.round(p * 39)}
					play={Math.min(1, p)}
					playing={!last}
					zoom={{z: last ? 1.0 : 1 + 0.35 * p, cx: 0.5, cy: 0.5}}
					dim={!last && fl % 23 < 2 ? 0.4 : 0}
					push={[1.0, 1.02]}
				/>
			);
		}),
		// "He had moved." (whispered)
		shot(T('narrator_035_he_had_moved'), 'room_front_night', 3.6, 3.9, [865, 665], [865, 670], {tag: 'moved'}),
	];
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'room_side_night') {
			const press = s.tag === 'play' ? Math.max(0, Math.sin(Math.min(1, (t - t34) / 1.2) * Math.PI)) : s.tag === 'click' ? Math.max(0, Math.sin(Math.min(1, (t - t20) / 0.9) * Math.PI)) : 0;
			return (
				<g>
					<OfficeChair x={MS.x} y={MS.y} s={MS.s} frame={f} view="front" />
					<Person is={Mara} name="mara" x={MS.x} y={MS.y} s={MS.s} pose="sit" frame={f} turn={0.4} look={[1, -0.1]} brows="flat" arms={{l: [20, -70], r: [68 - press * 8, -34 + press * 22]}} light="screen" />
					<ChairSeat x={MS.x} y={MS.y} s={MS.s} frame={f} />
					<Rain box={[1000, 40, 1595, 530]} frame={f} opacity={0.4} />
				</g>
			);
		}
		if (s.tag === 'bothered') return <AtDesk f={f} m={{brows: 'worried', look: [0.1, 0.2], tilt: 6}} />;
		if (s.tag === 'uneasy') return <AtDesk f={f} m={{brows: 'worried', mouth: 'frown', look: [0, 0.1]}} />;
		if (s.tag === 'moved') return <AtDesk f={f} m={{eyes: 'wide', brows: 'worried', mouth: 'o', shiver: 0.6}} />;
		return null;
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
