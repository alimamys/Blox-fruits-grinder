// 3. THE STRANGER - frame 240, the man in it, no layer, he moves.
import React from 'react';
import {EditorShot} from '../components/ui/Editor';
import {manBox} from '../layout/Hallway';
import {DeskInsert} from '../layout/Rooms';
import type {PicId} from '../layout/pictures';
import {Shots, Stage} from '../utils/scene';
import {MOOD, prog} from './common';
import {FaceClose, FrontMara, FullPicture} from './frames';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_man_far'];
const E = {total: 240, strip: STRIP};
const FAR = manBox(0.93);

export const Stranger: React.FC = () => (
	<Shots
		shots={[
			// "At first, I thought I'd accidentally duplicated something." - timeline extreme close-up
			{
				id: 'st_00_timeline_ecu',
				at: 'narrator_019_duplicated',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_empty" frame={f < d * 0.5 ? 238 : 239} push={[1.7, 1.85]} focus={[0.86, 0.88]} />,
			},
			// "I clicked on the final frame."
			{
				id: 'st_01_stylus_tap',
				at: 'narrator_020_clicked',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.08, cx: 960, cy: 600}}>
						<DeskInsert kind="stylus" />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Tight insert: the tip of Mara\'s black stylus touching down on the dark pen tablet, her fingers around it, the sleeve of the burnt-orange sweatshirt at the edge of frame, cold monitor light.',
				},
			},
			// "There was a man standing at the far end of the hallway."
			{
				id: 'st_02_man_far',
				at: 'narrator_021_man_standing',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} zoom={{z: 1 + 0.25 * prog(f, d), cx: 0.5, cy: 0.45}} push={[1.0, 1.05]} focus={[0.42, 0.42]} />,
			},
			// "He was very tall. Taller than the doorframe."
			{
				id: 'st_03_detail',
				at: 'narrator_022_very_tall',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_detail" frame={240} zoomLabel="400%" push={[1.15, 1.22]} focus={[0.42, 0.4]} />,
			},
			// "His arms hung straight down, and his head tilted slightly forward..." - tilt down the figure
			{
				id: 'st_04_detail_tilt',
				at: 'narrator_023_arms_hung',
				render: ({f, d}) => <FullPicture id="canvas_man_detail" f={f} d={d} z={[1.6, 1.6]} focus={[0.5, 0.2 + 0.6 * prog(f, d)]} />,
			},
			// "His face was almost completely hidden."
			{
				id: 'st_05_face',
				at: 'narrator_024_face_hidden',
				render: ({f, d}) => <FullPicture id="canvas_face" f={f} d={d} z={[1.0, 1.1]} />,
			},
			// "But something about the drawing bothered me."
			{
				id: 'st_06_bothered',
				at: 'narrator_025_bothered',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 230, cx: 1060, cy: 530, expr: 'focused', gaze: [0, 0.05]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'From the monitor: Mara leans in close to the screen, frowning, studying something; the cold screen light on her face, the black doorway behind her.',
				},
			},
			// "It matched my animation style perfectly." - 400% on the brushwork
			{
				id: 'st_07_brushwork',
				at: 'narrator_026_my_style',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} zoom={{z: 3.2, cx: 0.53, cy: 0.42}} zoomLabel="400%" push={[1.0, 1.04]} />,
			},
			// "The same brush texture. The same lighting. Even the same shadows." - three crops
			{
				id: 'st_08_three_crops',
				at: 'narrator_027_same_brush',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					const crop = p < 0.33 ? {z: 4, cx: 0.4, cy: 0.5} : p < 0.66 ? {z: 3.5, cx: 0.52, cy: 0.17} : {z: 3.5, cx: 0.5, cy: 0.7};
					return <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} zoom={crop} zoomLabel="400%" push={[1.0, 1.0]} />;
				},
			},
			// "I checked the layers."
			{
				id: 'st_09_layers',
				at: 'narrator_028_layers',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} push={[1.0, 1.3]} focus={[0.9, 0.2]} cursor={[1600, 140]} />,
			},
			// "Background. Lighting. Ceiling. Door."
			{
				id: 'st_10_layer_clicks',
				at: 'narrator_029_background_door',
				render: ({f, d}) => {
					const i = Math.min(3, Math.floor((f / Math.max(1, d)) * 4));
					return <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} layer={3 - i} push={[1.45, 1.5]} focus={[0.9, 0.18]} cursor={[1700, 112 + (3 - i) * 67]} />;
				},
			},
			// "There was no layer containing a man."
			{
				id: 'st_11_no_layer',
				at: 'narrator_030_no_layer',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} push={[1.1, 1.0]} focus={[0.6, 0.35]} />,
			},
			// "I tried selecting him."
			{
				id: 'st_12_lasso',
				at: 'narrator_031_selecting',
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} lasso={prog(f, d, 0.05, 0.9)} manBox={FAR} zoom={{z: 1.6, cx: 0.5, cy: 0.45}} zoomLabel="160%" push={[1.0, 1.06]} focus={[0.42, 0.4]} />,
			},
			// "Nothing."
			{
				id: 'st_13_lasso_fail',
				at: 'narrator_032_nothing',
				off: -0.1,
				render: ({f, d}) => (
					<EditorShot f={f} d={d} {...E} picture="canvas_man_far" frame={240} lasso={1} lassoFail manBox={FAR} zoom={{z: 1.6, cx: 0.5, cy: 0.45}} zoomLabel="160%" toast={f > 3 ? 'No pixels selected' : null} push={[1.06, 1.08]} focus={[0.42, 0.4]} />
				),
			},
			// "He was part of the picture."
			{
				id: 'st_14_part_of_picture',
				at: 'narrator_033_part_of_picture',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 280, cy: 490, expr: 'uneasy', gaze: [0.05, 0]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Close-up of Mara\'s face in the monitor light, uneasy, pale, eyes fixed on the screen; the realisation that something is wrong settling in. Darkness all around.',
				},
			},
			// "Then I pressed play again."
			{
				id: 'st_15_spacebar',
				at: 'narrator_034_pressed_play',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.1, cx: 960, cy: 640}}>
						<DeskInsert kind="spacebar" press={prog(f, d, 0.5, 0.7)} />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Insert: Mara\'s fingers pressing the space bar of a dark keyboard, cold monitor light. Natural hand, five fingers.',
				},
			},
			// the animation plays; at the last frame the man stands halfway down the hall
			{
				id: 'st_16_playback',
				at: 'playback_1',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					const last = p > 0.93;
					return (
						<EditorShot
							f={f}
							d={d}
							{...E}
							picture={last ? 'canvas_man_mid' : 'canvas_empty'}
							frame={last ? 240 : 200 + Math.round(p * 39)}
							play={Math.min(1, p)}
							playing={!last}
							zoom={{z: last ? 1.0 : 1 + 0.35 * p, cx: 0.5, cy: 0.5}}
							dim={!last && f % 23 < 2 ? 0.4 : 0}
							push={[1.0, 1.02]}
						/>
					);
				},
			},
			// "He had moved." (whispered)
			{
				id: 'st_17_eyes_widen',
				at: 'narrator_035_he_had_moved',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 520, cy: 600, expr: 'afraid'}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Extreme close-up of Mara\'s eyes going wide with fear, the screen light reflected in them, brows raised and pulled together. Pure dread.',
				},
			},
		]}
	/>
);
