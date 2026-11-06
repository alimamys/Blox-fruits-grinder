// 2. A NORMAL NIGHT - Mara, her work, her hallway.
import React from 'react';
import {EditorShot} from '../components/ui/Editor';
import {Hallway} from '../layout/Hallway';
import {MaraBust} from '../layout/Mara';
import {DeskInsert, Exterior} from '../layout/Rooms';
import type {PicId} from '../layout/pictures';
import {Shots, Stage} from '../utils/scene';
import {MOOD, prog} from './common';
import {FrontMara, Room, SeatedMara} from './frames';

const STRIP: PicId[] = Array.from({length: 12}, () => 'canvas_empty' as PicId);

export const NormalNight: React.FC = () => (
	<Shots
		shots={[
			// "My name is Mara. I'm a freelance animator." - the building in the rain
			{
				id: 'nn_00_exterior',
				at: 'narrator_010_name_mara',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08, cx: 1120, cy: 500}}>
						<Exterior />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'exterior',
					mood: 'Rainy night, wet dark street, cold blue; one warm-white window glowing on the third floor.',
					prompt: 'A modest four-storey apartment block at night in heavy rain, almost every window dark; one window on the third floor glows with the cold light of a computer monitor. Painted rain streaks, wet reflections at street level.',
				},
			},
			{
				id: 'nn_01_workroom_wide',
				at: 'narrator_010_name_mara',
				frac: 0.5,
				render: ({f, d}) => (
					<Room f={f} d={d} view="wide" screen="canvas_empty">
						<SeatedMara expr="tired" />
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.night,
					prompt: 'Establishing shot of Mara\'s cramped workroom at night: Mara, in her oversized burnt-orange sweatshirt, sits on an office chair at her desk on the right, in profile, working at her glowing monitor; rain runs down the window above the desk; behind her on the left the open doorway to the dark hallway. Calm and ordinary, a little lonely.',
					parallax: true,
				},
			},
			// "Most nights, I work until two or three in the morning."
			{
				id: 'nn_02_tired',
				at: 'narrator_011_most_nights',
				render: ({f, d}) => {
					const k = prog(f, d) > 0.5;
					return (
						<FrontMara
							f={f}
							d={d}
							b={k ? {r: 160, cy: 560, expr: 'tired', gaze: [0, 0.1]} : {r: 160, cy: 560, expr: 'tired', eyesClosed: true, handMouth: false, chinHand: false}}
						/>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.night,
					prompt:
						'Medium shot from the monitor: Mara at her desk late at night, the dark doorway behind her. Keyframe 1: she rubs her tired eyes with the heel of one hand. Keyframe 2: she sips from a mug of cold coffee, looking back at the screen. Tired but calm, a normal night.',
				},
			},
			// "It's quieter then. No phone calls. No interruptions."
			{
				id: 'nn_03_phone_mug',
				at: 'narrator_011_most_nights',
				frac: 0.55,
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1}} to={{z: 1.06}}>
						<DeskInsert kind="phoneMug" />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'workroom',
					mood: MOOD.night,
					prompt: 'Close-up on the desk: her phone lying face down beside a white mug of cold coffee, rain on the dark window behind, cool monitor light across the desk. Quiet, still.',
				},
			},
			// "That night, I was finishing a short animation of an empty apartment hallway."
			{
				id: 'nn_04_ots_monitor',
				at: 'narrator_012_finishing',
				render: ({f, d}) => (
					<Room f={f} d={d} view="ots" screen="canvas_empty">
						<MaraBust r={150} cx={300} cy={760} back yaw={0} />
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.night,
					prompt: 'Over Mara\'s shoulder (her messy bun with the yellow pencil in the foreground left, out of focus): her big monitor shows a painted animation frame of an empty apartment hallway with a dim ceiling light and a closed door at the end. The screen shows only the picture and plain dark software panels, no readable text.',
					parallax: true,
				},
			},
			// "Nothing complicated. A flickering ceiling light, a few shadows, and a slow movement toward a closed bedroom door."
			{
				id: 'nn_05_animation_plays',
				at: 'narrator_013_nothing_complicated',
				render: ({f, d}) => (
					<EditorShot
						f={f}
						d={d}
						picture="canvas_empty"
						frame={200 + Math.round(prog(f, d) * 39)}
						total={239}
						strip={STRIP}
						play={prog(f, d)}
						playing
						zoom={{z: 1 + 0.3 * prog(f, d), cx: 0.5, cy: 0.5}}
						dim={f % 19 < 2 ? 0.35 : 0}
						push={[1, 1.04]}
					/>
				),
			},
			// "I'd used my own hallway as a reference." - match cut to the real one, lit
			{
				id: 'nn_06_hall_lit',
				at: 'narrator_014_own_hallway',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1}} to={{z: 1.06}}>
						<Hallway light="lit" bulb={1} />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: 'Night, the hallway ceiling light ON: weak warm yellow light, soft shadows, cold blue darkness at the edges.',
					prompt: 'The real apartment hallway with its ceiling light on, exactly as in the location reference and in the same one-point perspective: old beige carpet runner with a stain, white walls, the dome light with a brown water stain beside it, the closed bedroom door at the end. Empty.',
				},
			},
			// "The little crack above the doorframe, the old carpet, even the stain on the ceiling."
			{
				id: 'nn_07_details',
				at: 'narrator_015_crack_carpet_stain',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					const cam = p < 0.34 ? {z: 5, cx: 960, cy: 380} : p < 0.62 ? {z: 3.2, cx: 990, cy: 900} : {z: 4.4, cx: 1000, cy: 250};
					return (
						<Stage f={f} d={d} from={cam}>
							<Hallway light="lit" bulb={1} />
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 3,
					cuts: [0, 0.34, 0.62],
					loc: 'hallway',
					mood: 'Warm weak ceiling light, soft shadows.',
					prompt:
						'Three close-up details of the same lit hallway. Keyframe 1: the hairline crack in the plaster just above the frame of the closed bedroom door. Keyframe 2: the worn old beige carpet runner with its one brown stain. Keyframe 3: the brown water stain on the ceiling beside the dome light.',
				},
			},
			// "I'd been staring at the same ten seconds of animation for nearly three hours."
			{
				id: 'nn_08_exhausted',
				at: 'narrator_016_three_hours',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 230, cx: 1040, cy: 520, expr: 'tired', chinHand: true}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.night,
					prompt: 'Close shot from the monitor: Mara exhausted, chin resting on her hand, eyelids heavy, the glow of the screen reflected in her eyes. The dark doorway behind her, out of focus.',
				},
			},
			// "Eventually, I saved the project, closed my eyes for a moment, and checked the timeline one last time."
			{
				id: 'nn_09_save_rest_check',
				at: 'narrator_017_saved',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return p < 0.34 ? (
						<FrontMara f={f} d={d} b={{r: 150, cy: 600, expr: 'focused', gaze: [0, 0.8]}} />
					) : p < 0.67 ? (
						<FrontMara f={f} d={d} b={{r: 140, cy: 520, expr: 'tired', eyesClosed: true, tilt: -8}} />
					) : (
						<FrontMara f={f} d={d} b={{r: 175, cy: 590, expr: 'neutral', gaze: [0, 0.2]}} />
					);
				},
				art: {
					kind: 'action',
					keys: 3,
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.night,
					prompt:
						'Medium shot from the monitor, the dark doorway behind her. Keyframe 1: Mara looks down at her keyboard, pressing the keys to save. Keyframe 2: she leans back in her chair with her eyes closed, head tipped back, resting. Keyframe 3: she leans in towards the screen again, eyes open, checking one last time.',
				},
			},
			// "That's when I noticed the extra frame." - push in; the cursor stops on frame 240
			{
				id: 'nn_10_cursor_240',
				at: 'narrator_018_extra_frame',
				render: ({f, d}) => {
					const t = prog(f, d, 0, 0.7);
					return (
						<EditorShot
							f={f}
							d={d}
							picture="canvas_empty"
							frame={t > 0.95 ? 240 : 239}
							total={240}
							strip={[...STRIP.slice(1), 'canvas_man_far']}
							cursor={[300 + 1450 * t, 1010 - 40 * t]}
							push={[1.0, 1.35]}
							focus={[0.9, 0.9]}
						/>
					);
				},
			},
		]}
	/>
);

