// 9. INSIDE THE WALL - the shape moves through the walls; the screen; no door.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hallway} from '../layout/Hallway';
import {HandShape, Mara} from '../layout/Mara';
import {PictureBox} from '../layout/pictures';
import {DeskInsert, Monitor, WallClose, Workroom} from '../layout/Rooms';
import {PictureSvg} from '../layout/pictures';
import {Shots, Stage} from '../utils/scene';
import {MOOD} from './common';
import {FaceClose, Room} from './frames';

const WL = '#ffffff';
const wall = (shape: Parameters<typeof WallClose>[0]['shape'], outline = 0.5, rake = false) => ({f, d}: {f: number; d: number}) => (
	<Stage f={f} d={d}>
		<WallClose tone="white" shape={shape} outline={outline} rake={rake} />
	</Stage>
);

export const InsideWall: React.FC = () => (
	<Shots
		shots={[
			// "I backed away."
			{
				id: 'iw_00_back_away',
				at: 'narrator_113_backed_away',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Stage f={f} d={d}>
							<Hallway light="white" flat />
							<Mara x={p < 0.5 ? 1180 : 1000} y={760} s={0.95} yaw={0.7} lean={-10} expr="terrified" armR={[30, 20]} armL={[-50, -30]} legL={[-20, 10]} legR={[25, 0]} phoneIn="L" light={WL} />
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.white,
					prompt: 'In the drained white hallway. Keyframe 1: Mara stands near the right wall staring at it, phone flashlight raised. Keyframe 2: she backs away from it towards the middle of the hallway, terrified, one hand out behind her.',
				},
			},
			// "The shape moved."
			{
				id: 'iw_01_shape_moves',
				at: 'narrator_114_shape_moved',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="white" shape="body" outline={0.5} shift={f / Math.max(1, d) < 0.5 ? -160 : 200} />
					</Stage>
				),
				art: {
					kind: 'action',
					keys: 2,
					chars: ['figure'],
					loc: 'white',
					mood: MOOD.white,
					noPeople: true,
					chainKeys: true,
					prompt: 'An empty white wall in flashlight, filling the frame, nobody in front of it. A raised human-shaped relief under the white surface, white on white, visible only by thin shadows at its edges. Keyframe 1: the shape on the left. Keyframe 2: the same shape has shifted to the right along the wall, the surface stretching.',
				},
			},
			// "Not like a person walking."
			{
				id: 'iw_02_face',
				at: 'narrator_115_not_walking',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 470, expr: 'terrified', light: WL, gaze: [0.6, 0]}} bg="#cfcec9" />,
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Close-up: Mara\'s face lit by her PHONE\'s flashlight (she holds her smartphone, not a torch), terrified, tracking something moving along the wall with her eyes. Pale white background.'},
			},
			// "More like a drawing being stretched across paper."
			{id: 'iw_03_stretched', at: 'narrator_116_stretched', render: wall('stretched', 0.6), art: {kind: 'still', chars: ['figure'], loc: 'white', mood: MOOD.white, noPeople: true, prompt: 'Close on an empty white wall filling the frame: the faint human outline is stretched sideways, long and thin and distorted, like a drawing being dragged across paper; the wall surface wrinkles slightly along it.'}},
			// "The outline of a hand appeared near the ceiling." / elbow / head
			{id: 'iw_04_hand', at: 'narrator_117_hand', render: wall('hand', 0.6), art: {kind: 'still', chars: ['figure'], loc: 'white', mood: MOOD.white, noPeople: true, prompt: 'Close on an empty white wall filling the frame, high up near the ceiling, just below the ceiling: the outline of a long-fingered hand pressing out from inside the wall, white on white, only its edges and tiny shadows visible.'}},
			{id: 'iw_05_elbow', at: 'narrator_118_elbow', render: wall('elbow', 0.6), art: {kind: 'still', chars: ['figure'], loc: 'white', mood: MOOD.white, noPeople: true, prompt: 'Close on an empty white wall filling the frame: the faint raised curve of a long bent elbow pushing out under the surface, white on white.'}},
			{id: 'iw_06_head', at: 'narrator_119_head', render: wall('head', 0.6), art: {kind: 'still', chars: ['figure'], loc: 'white', mood: MOOD.white, move: {z0: 1.2, z1: 1.26}, prompt: 'The white wall: the faint raised curve of a head, tilted and bent to one side, pressing out under the white surface; no face, just the shape and a thin shadow.'}},
			// "I could barely see it unless I tilted my phone flashlight sideways."
			{
				id: 'iw_07_rake',
				at: 'narrator_120_flashlight',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="white" shape="body" outline={f / Math.max(1, d) < 0.5 ? 0.1 : 0.7} />
					</Stage>
				),
				art: {
					kind: 'action',
					keys: 2,
					chars: ['figure'],
					loc: 'white',
					mood: MOOD.white,
					noPeople: true,
					chainKeys: true,
					prompt: 'Close on an empty white wall filling the frame, nobody in front of it. Keyframe 1: the flashlight (from off-camera) shines straight on: the wall looks perfectly blank and flat. Keyframe 2: the flashlight is tilted sideways, raking across the surface - now the low light reveals the raised relief of a tall human body under the white, with long shadows along its edges.',
				},
			},
			// "And the worst part was how quietly it moved."
			{id: 'iw_08_quiet', at: 'narrator_121_quietly', render: wall('body', 0.7), art: {kind: 'reuse', reuse: 'iw_07_rake', key: 1, move: {z0: 1.04, z1: 1.14}}},
			// "No breathing."
			{
				id: 'iw_09_hand_mouth',
				at: 'narrator_122_no_breathing',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 250, cy: 450, expr: 'terrified', light: WL, handMouth: true}} bg="#cfcec9" />,
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Close-up: Mara presses her hand over her mouth to stop herself breathing, eyes wide with terror, in her flashlight. Natural hand, five fingers.'},
			},
			// "No footsteps."
			{
				id: 'iw_10_carpet',
				at: 'narrator_123_no_footsteps',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.4, cx: 960, cy: 900}}>
						<Hallway light="white" flat />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.white, noPeople: true, prompt: 'Close on the empty hallway floor lit by a flashlight from off-camera: the carpet runner drained to flat white, no footprints, no marks, nothing. No hands, no people.'},
			},
			// "Just that horrible scratching sound."
			{id: 'iw_11_scratch', at: 'narrator_124_scratching', render: wall('hand', 0.6), art: {kind: 'reuse', reuse: 'iw_04_hand', fx: 'tremble', move: {z0: 1.1, z1: 1.18}}},
			// "It was coming from inside the walls now."
			{
				id: 'iw_12_against_wall',
				at: 'narrator_125_inside_walls',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<Hallway light="white" flat />
						<Mara x={430} y={800} s={1.0} yaw={0.5} lean={-6} expr="terrified" gaze={[0.8, -0.3]} armR={[20, 0]} armL={[-30, 0]} legL={[5, 0]} legR={[-5, 0]} phoneIn="R" light={WL} />
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Mara with her back pressed flat against the left wall of the white hallway, phone clutched to her chest, eyes darting across the walls and ceiling all around her. Every surface is flat white.'},
			},
			// "I grabbed the computer and tried to smash the screen."
			{
				id: 'iw_13_smash',
				at: 'narrator_126_smash',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Stage f={f} d={d}>
							<Workroom view="white">
								{p < 0.66 ? (
									<g>
										<Mara x={900} y={600} s={0.75} yaw={0.3} lean={p < 0.33 ? 0 : 16} expr="scream" armR={[p < 0.33 ? 160 : 120, 20]} armL={[p < 0.33 ? -160 : -120, -20]} legL={[10, 0]} legR={[-10, 0]} light={WL} />
										<Monitor x={760} y={p < 0.33 ? 40 : 220} w={340} screen={<PictureSvg id="canvas_white" />} angle={p < 0.33 ? 0 : 25} />
									</g>
								) : (
									<Monitor x={760} y={760} w={420} screen={<PictureSvg id="canvas_white" />} angle={8} cracked />
								)}
							</Workroom>
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 3,
					chars: ['mara'],
					loc: ['workroom', 'white'],
					mood: MOOD.drained,
					chainKeys: true,
					prompt: 'In the drained white workroom; Mara wears her BURNT-ORANGE sweatshirt in every keyframe. Keyframe 1: Mara lifts her monitor high above her head with both hands, screaming. Keyframe 2: she swings it down hard. Keyframe 3: the monitor lies face-up on the floor, its screen cracked into a spider web - but still glowing.',
				},
			},
			// "But the image stayed there."
			{
				id: 'iw_14_cracked_glow',
				at: 'narrator_127_image_stayed',
				render: ({f, d}) => <Room f={f} d={d} view="monitorAcross" screen="canvas_white" cracked />,
				art: {kind: 'still', loc: ['white', 'workroom'], fx: 'glitch', mood: MOOD.drained, noPeople: true, prompt: 'In the same drained white workroom as before (pale flat walls, faint outlines): the smashed monitor lying face-up on the pale floor, its screen cracked into a spider web, still glowing and still showing the painted hallway picture with a blank, flat white man-shaped space in it. Nobody in the room.'},
			},
			// "The man was gone from the drawing."
			{id: 'iw_15_gone', at: 'narrator_128_gone_from_drawing', render: ({f, d}) => <Room f={f} d={d} view="monitorAcross" screen="canvas_white" cracked />, art: {kind: 'reuse', reuse: 'iw_14_cracked_glow', move: {z0: 1.3, z1: 1.45, x0: 0.52, y0: 0.42}}},
			// "In his place was a blank white space." - the picture through the cracks
			{
				id: 'iw_16_blank',
				at: 'narrator_129_blank_space',
				render: ({f}) => (
					<AbsoluteFill style={{background: '#000'}}>
						<div style={{position: 'absolute', inset: 0, transform: `scale(${1.25 + f * 0.002})`, transformOrigin: '50% 40%'}}>
							<PictureBox id="canvas_white" />
						</div>
						<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
							<g stroke="rgba(255,255,255,0.8)" strokeWidth={3} fill="none">
								<path d="M820,520 L300,90 M820,520 L1500,160 M820,520 L1100,1080 M820,520 L120,880 M820,520 L1920,640 M820,520 L640,0" />
							</g>
						</svg>
					</AbsoluteFill>
				),
			},
			// "And through that blank space, something was slowly pushing outward."
			{
				id: 'iw_17_push_out',
				at: 'narrator_130_pushing_outward',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<rect x={0} y={0} width={1920} height={1080} fill="#08090c" />
						<Monitor x={260} y={140} w={1400} screen={<PictureSvg id="canvas_white" />} cracked />
						{f / Math.max(1, d) > 0.5 ? [0, 1, 2, 3].map((i) => <HandShape key={i} p={[860 + i * 40, 520]} a={180} s={0.8 + i * 0.05} color="#f4f3ef" />) : null}
					</Stage>
				),
				art: {
					kind: 'action',
					keys: 2,
					chars: ['figure'],
					loc: ['white', 'workroom'],
					mood: MOOD.drained,
					noPeople: true,
					chainKeys: true,
					prompt: 'Close on the cracked glowing monitor screen lying face-up on the pale floor of the drained white room - only the screen and the floor around it, nobody in the room. Keyframe 1: the blank white man-shaped space in the picture bulges outward through the cracked glass, as if something is pressing from inside. Keyframe 2: long thin WHITE fingertips have pushed out through the cracks, just far enough to cast tiny shadows on the glass. The tall man himself is NOT visible anywhere - only the white fingertips.',
				},
			},
			// white fingers emerge, casting tiny shadows
			{id: 'iw_18_fingers', at: 'fingers', render: ({f, d}) => <Stage f={f} d={d}><rect width={1920} height={1080} fill="#000" /></Stage>, art: {kind: 'reuse', reuse: 'iw_17_push_out', key: 1, fx: 'tremble', move: {z0: 1.1, z1: 1.3, x0: 0.48, y0: 0.48}}},
			// "I heard Hana shouting through my phone."
			{
				id: 'iw_19_phone_floor',
				at: 'narrator_131_hana_shouting',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<DeskInsert kind="phoneFloor" />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.white, prompt: 'Her phone lying face-up on the pale floor where she dropped it, its screen glowing with an active call. No readable text on the screen.'},
			},
			// HANA: "Mara! Get out! Get out right now!"
			{id: 'iw_20_get_out', at: 'hana_014_get_out', render: ({f, d}) => <Stage f={f} d={d}><DeskInsert kind="phoneFloor" /></Stage>, art: {kind: 'reuse', reuse: 'iw_19_phone_floor', fx: 'shake', move: {z0: 1.12, z1: 1.2}}},
			// "I ran for the front door."
			{
				id: 'iw_21_run_door',
				at: 'narrator_132_front_door',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Stage f={f} d={d}>
							<Hallway light="white" flat />
							<Mara x={p < 0.5 ? 1100 : 640} y={p < 0.5 ? 900 : 820} s={p < 0.5 ? 1.1 : 0.9} yaw={-0.9} lean={-16} expr="terrified" armR={[-50, -50]} armL={[50, 40]} legL={[-45, 40]} legR={[40, 20]} light={WL} />
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.white,
					prompt: 'In the white hallway. Keyframe 1: Mara bolts towards the front door on the left wall, running, terrified. Keyframe 2: she reaches the place where the front door should be, arm stretched out for the handle.',
				},
			},
			// "There was no handle."
			{
				id: 'iw_22_no_handle',
				at: 'narrator_133_no_handle',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="white" />
						<HandShape p={[960, 380]} a={0} s={6} />
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Close-up: Mara\'s hand flat against a smooth white surface exactly where the front door handle should be - there is nothing there, no handle, no seam. Natural hand, five fingers.'},
			},
			// "There wasn't even a door anymore."
			{
				id: 'iw_23_no_door',
				at: 'narrator_134_no_door',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.5, cx: 660, cy: 600}}>
						<Hallway light="white" flat noDoor />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.white, noPeople: true, prompt: 'The empty white hallway, nobody in it: the left wall where the front door used to be: only a smooth blank white rectangle, the faintest outline of where a door once was, no handle, no hinges, no gap.'},
			},
			// "Just a smooth white rectangle where the entrance had been."
			{
				id: 'iw_24_scream',
				at: 'narrator_135_white_rectangle',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 470, expr: 'scream', light: WL}} bg="#e6e5e0" />,
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Close-up: Mara with her back pressed against the smooth white rectangle where the door was, screaming in terror, tears in her eyes, the flat white surface behind her head.'},
			},
			// AUDIO CUE: a low impact from inside the wall
			{id: 'iw_25_impact', at: 'impact', render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 470, expr: 'scream'}} />, art: {kind: 'reuse', reuse: 'iw_24_scream', fx: 'shake', move: {z0: 1.12, z1: 1.16}}},
		]}
	/>
);
