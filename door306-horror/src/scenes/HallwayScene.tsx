// 6. THE HALLWAY CHANGES - the flashlight, the repeating stains, the paper wall, three taps.
import React from 'react';
import {EditorShot} from '../components/ui/Editor';
import {PencilTrail} from '../components/ui/Phone';
import {Hallway} from '../layout/Hallway';
import {HandShape, Mara} from '../layout/Mara';
import type {PicId} from '../layout/pictures';
import {DeskInsert, WallClose} from '../layout/Rooms';
import {Shots, Stage} from '../utils/scene';
import {MOOD, prog} from './common';
import {FaceClose, FrontMara, Hall, Room, SeatedMara} from './frames';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_pattern'];
const FL = '#f4f2ea';

export const HallwayScene: React.FC = () => (
	<Shots
		shots={[
			// "I grabbed my keys."
			{
				id: 'ha_00_keys',
				at: 'narrator_058_keys',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<DeskInsert kind="keys" press={prog(f, d, 0, 0.5)} />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Insert: Mara\'s hand snatching a ring of house keys off the desk, motion and urgency, cold monitor light. Natural hand, five fingers.',
				},
			},
			// "I wasn't going to spend another second trying to understand it."
			{
				id: 'ha_01_stand_go',
				at: 'narrator_059_another_second',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Room f={f} d={d} view="wide" screen="canvas_man_close">
							{p < 0.5 ? (
								<Mara x={930} y={560} s={0.62} yaw={-0.6} lean={-20} expr="afraid" armR={[30, 10]} armL={[-20, -30]} legL={[40, -30]} legR={[20, -10]} phoneIn="R" />
							) : (
								<Mara x={560} y={520} s={0.62} yaw={-1} lean={-6} expr="afraid" armR={[-30, -60]} armL={[30, 20]} legL={[-25, 10]} legR={[20, 0]} phoneIn="R" />
							)}
						</Room>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt:
						'Wide shot of the workroom, desk and glowing monitor on the right, the black doorway on the left. Keyframe 1: Mara pushes herself up out of her chair, phone in hand, looking towards the doorway. Keyframe 2: she walks towards the doorway with her phone held out in front of her, its flashlight on.',
				},
			},
			// "But when I reached the hallway, something was wrong."
			{
				id: 'ha_02_hall_mouth',
				at: 'narrator_060_something_wrong',
				render: ({f, d}) => (
					<Hall f={f} d={d} h={{light: 'flash', flash: [1040, 560]}}>
						<Mara x={360} y={760} s={0.95} back lean={4} armR={[100, -10]} armL={[10, 0]} legL={[5, 0]} legR={[-5, 0]} phoneIn="R" />
					</Hall>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Mara seen from behind in the left foreground at the mouth of the dark hallway, holding up her phone; its flashlight throws a white cone down the hallway walls. The rest is darkness.',
					parallax: true,
				},
			},
			// "The carpet looked different."
			{
				id: 'ha_03_carpet',
				at: 'narrator_061_carpet',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 880]}} from={{z: 2.2, cx: 960, cy: 880}} />,
				art: {kind: 'still', loc: 'hallway', mood: MOOD.flash, prompt: 'The flashlight beam on the old beige carpet runner in the dark hallway, close. Something about it looks wrong.', dark: true},
			},
			// "The same stain appeared every few feet, repeating in a perfect pattern."
			{
				id: 'ha_04_stains',
				at: 'narrator_062_same_stain',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 820], pattern: true}} from={{z: 1.4, cx: 960, cy: 760}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'The flashlight sweeps down the carpet runner: the same brown stain appears again and again every few feet, identical copies in a perfect regular row, like a repeated texture. Unnatural.',
					dark: true,
				},
			},
			// "The crack above the bedroom door was no longer just a crack."
			{
				id: 'ha_05_doorframe',
				at: 'narrator_063_crack',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 380], pencilCrack: true}} from={{z: 2.6, cx: 960, cy: 430}} />,
				art: {kind: 'still', loc: 'hallway', mood: MOOD.flash, noPeople: true, prompt: 'A white flashlight beam (from off-camera) finds the closed bedroom door at the end of the empty hallway and the wall above its frame. Nobody is in the frame.', dark: true},
			},
			// "It was a thin, black line. Almost like a pencil mark."
			{
				id: 'ha_06_pencil_crack',
				at: 'narrator_064_pencil_mark',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 370], pencilCrack: true}} from={{z: 6, cx: 950, cy: 368}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Extreme close-up of the plaster just above the bedroom doorframe in the flashlight: the old crack has become a crisp, thin, perfectly black line, exactly like a pencil stroke drawn on the wall.',
				},
			},
			// "I moved closer."
			{
				id: 'ha_07_walk_toward',
				at: 'narrator_065_moved_closer',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.08}} bg="#05070c">
						<rect x={0} y={0} width={1920} height={1080} fill="#06080d" />
						<Mara x={960} y={640} s={0.9} yaw={0} expr="afraid" armR={[25, 115]} armL={[10, 0]} legL={[8, 0]} legR={[-12, 5]} phoneIn="R" light={FL} />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Mara walks slowly down the dark hallway towards the camera, holding her phone up with its flashlight on, the light bouncing back onto her frightened face. Darkness behind her.',
				},
			},
			// "The entire wall looked wrong."
			{
				id: 'ha_08_wall',
				at: 'narrator_066_wall_wrong',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="flash" />
					</Stage>
				),
				art: {kind: 'still', loc: 'hallway', mood: MOOD.flash, prompt: 'The hallway wall in the flashlight beam, close: the wallpaper texture looks strangely printed and shadowless. Nothing else.'},
			},
			// "Too smooth. Too flat."
			{
				id: 'ha_09_face_flash',
				at: 'narrator_067_too_smooth',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 250, cy: 470, expr: 'uneasy', light: FL, gaze: [-0.4, 0]}} bg="#05070c" />,
				art: {kind: 'still', chars: ['mara'], loc: 'hallway', mood: MOOD.flash, prompt: 'Close-up: Mara\'s face lit from below by the white phone flashlight, uneasy, studying the wall beside her. Black hallway around her.'},
			},
			// "Like someone had painted over a photograph."
			{
				id: 'ha_10_painted_photo',
				at: 'narrator_068_photograph',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.4}}>
						<WallClose tone="flash" />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Very close on the hallway wall in the flashlight: it looks like a photograph of a wall that someone painted over - flat, glossy, too smooth, with faint brush strokes on top of a printed wallpaper pattern and no real depth.',
				},
			},
			// "I reached out and touched the surface."
			{
				id: 'ha_11_reach',
				at: 'narrator_069_touched',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Stage f={f} d={d}>
							<WallClose tone="flash" />
							<HandShape p={[p < 0.5 ? 1500 : 1300, p < 0.5 ? 900 : 640]} a={p < 0.5 ? -60 : -75} s={4.2} />
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Close on the wall in the flashlight. Keyframe 1: Mara\'s hand reaching in from the right towards the wall, fingers hesitant. Keyframe 2: her index fingertip touching the wall surface. Natural hand, five fingers.',
				},
			},
			// "It felt like paper."
			{
				id: 'ha_12_paper_face',
				at: 'narrator_070_paper',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 470, expr: 'shock', light: FL, gaze: [-0.6, 0.2]}} bg="#05070c" />,
				art: {kind: 'still', chars: ['mara'], loc: 'hallway', mood: MOOD.flash, prompt: 'Close-up: Mara\'s face in the flashlight, shocked, staring at her own fingertip on the wall; disbelief turning into fear.'},
			},
			// a faint black line follows her fingertip
			{
				id: 'ha_13_fingertip',
				at: 'finger_line',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="flash" fingertip />
					</Stage>
				),
				// the line grows along the wall up to her fingertip (measured in the generated frame:
				// fingertip at 500,400 -> 472,392 on screen at the locked 1.06 zoom)
				overlay: ({f, d}) => <PencilTrail from={[150, 322]} to={[468, 392]} t={prog(f, d, 0.05, 0.9)} width={5} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'Close-up: Mara\'s index fingertip pressed against the flat wall in the flashlight, her hand coming in from the right. The wall is clean (no line yet). Natural hand, five fingers.',
					move: {z0: 1.06, z1: 1.06, x0: 0.5, y0: 0.5},
				},
			},
			// "Then, from behind the bedroom door, I heard a sound."
			{
				id: 'ha_14_bedroom_door',
				at: 'narrator_071_behind_door',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 560], pattern: true, pencilCrack: true}} from={{z: 1.6, cx: 960, cy: 520}} to={{z: 1.75, cx: 960, cy: 520}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: MOOD.flash,
					prompt: 'The closed bedroom door at the end of the dark hallway, caught in the white flashlight beam; the pencil-line crack above its frame; the repeated stains on the carpet leading to it.',
					dark: true,
				},
			},
			// "Three gentle taps." then tap. tap. tap. - a cut and a jolt on each tap
			{
				id: 'ha_15_door_close',
				at: 'narrator_072_three_taps',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash', flash: [960, 560], pencilCrack: true}} from={{z: 3.0, cx: 960, cy: 560}} />,
				art: {kind: 'still', loc: 'hallway', mood: MOOD.flash, prompt: 'Close on the closed bedroom door in the flashlight, the brass handle, the panels. Silence. Something is behind it.', dark: true},
			},
			{id: 'ha_16_tap1', at: 'taps', off: 0.3, render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash'}} />, art: {kind: 'reuse', reuse: 'ha_15_door_close', fx: 'shake', move: {z0: 1.1, z1: 1.1}}},
			{id: 'ha_17_tap2', at: 'taps', off: 1.0, render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash'}} />, art: {kind: 'reuse', reuse: 'ha_15_door_close', fx: 'shake', move: {z0: 1.22, z1: 1.22}}},
			{id: 'ha_18_tap3', at: 'taps', off: 1.7, render: ({f, d}) => <Hall f={f} d={d} h={{light: 'flash'}} />, art: {kind: 'reuse', reuse: 'ha_15_door_close', fx: 'shake', move: {z0: 1.36, z1: 1.4}}},
			// "The same scratching noise I'd heard through my computer speakers."
			{
				id: 'ha_19_terrified',
				at: 'narrator_073_same_scratching',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 470, expr: 'terrified', light: FL}} bg="#05070c" />,
				art: {kind: 'still', chars: ['mara'], loc: 'hallway', mood: MOOD.flash, prompt: 'Close-up: Mara frozen in the hallway, terrified, eyes huge, mouth tense, flashlight under her face, the darkness pressing in around her.'},
			},
			// "I ran back to the desk."
			{
				id: 'ha_20_run_back',
				at: 'narrator_074_ran_back',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return p < 0.5 ? (
						<Hall f={f} d={d} h={{light: 'flash', flash: [700, 700]}}>
							<Mara x={760} y={720} s={0.9} yaw={-0.8} lean={-14} expr="terrified" armR={[-40, -60]} armL={[50, 40]} legL={[-40, 40]} legR={[35, 20]} phoneIn="R" light={FL} />
						</Hall>
					) : (
						<Room f={f} d={d} view="wide" screen="canvas_man_close">
							<SeatedMara expr="terrified" lean={20} />
						</Room>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: ['hallway', 'workroom'],
					mood: MOOD.flash,
					prompt: 'Keyframe 1: in the dark hallway, Mara spins round and runs back towards the camera, terrified, phone light swinging. Keyframe 2: in the workroom, she drops back into her desk chair in front of the glowing monitor, breathless.',
				},
			},
			// "And for the first time, I understood."
			{
				id: 'ha_21_understood',
				at: 'narrator_075_understood',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 200, cx: 1060, cy: 540, expr: 'shock'}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.cold, prompt: 'From the monitor: Mara back at her desk, breathing hard, staring at the screen as she finally understands. Cold light on her face, the black doorway behind her.'},
			},
			// "The animation wasn't copying my hallway anymore."
			{
				id: 'ha_22_canvas_pattern',
				at: 'narrator_076_not_copying',
				render: ({f, d}) => <EditorShot f={f} d={d} total={240} strip={STRIP} picture="canvas_pattern" frame={240} push={[1.0, 1.1]} focus={[0.42, 0.45]} />,
			},
			// "My hallway was copying the animation." - match cut, same composition
			{
				id: 'ha_23_hall_copy',
				at: 'narrator_077_copying_animation',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<Hallway light="night" pattern pencilCrack />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: 'Night, dark, cold blue moonlight.',
					prompt: 'The real hallway in the dark, in exactly the same one-point perspective as the animation: the brown stain repeated down the carpet in a perfect row, the crisp black pencil line above the bedroom door. Empty, wrong, silent.',
					dark: true,
				},
			},
		]}
	/>
);

