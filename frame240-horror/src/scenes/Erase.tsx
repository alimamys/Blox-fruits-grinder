// 7. TRYING TO ERASE HIM - the red line, the white brush, the silence.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {EditorShot} from '../components/ui/Editor';
import {restyleSrc} from '../components/fx/Restyled';
import {Hallway} from '../layout/Hallway';
import {Mara} from '../layout/Mara';
import {PictureBox, type PicId} from '../layout/pictures';
import {Chair, DeskInsert} from '../layout/Rooms';
import {FONT} from '../utils/fonts';
import {Shots, Stage} from '../utils/scene';
import {MOOD, prog} from './common';
import {FaceClose, FrontMara, GLOW, Hall, Room} from './frames';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_man_close'];
// measured on the generated canvas_man_close picture (layout manBox(0.08) differs)
const CLOSE: [number, number, number, number] = [0.435, 0.01, 0.59, 1.0];
const E = {total: 240, strip: STRIP, frame: 240};
const paintShot = (a: number, b: number) => ({f, d}: {f: number; d: number}) => (
	<EditorShot f={f} d={d} {...E} picture="canvas_man_close" paint={a + (b - a) * prog(f, d, 0, 0.95)} manBox={CLOSE} brushPanel push={[1.0, 1.04]} focus={[0.42, 0.42]} />
);

const Split: React.FC<{label?: boolean; measure?: boolean}> = ({measure = false}) => {
	const real = restyleSrc('er_05_red_wall');
	return (
		<AbsoluteFill style={{background: '#000', flexDirection: 'row'}}>
			<div style={{flex: 1, position: 'relative', overflow: 'hidden', borderRight: '3px solid #000'}}>
				<PictureBox id="canvas_man_close" />
				<svg viewBox="0 0 960 1080" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
					<line x1={600} y1={500} x2={900} y2={540} stroke="#d0141c" strokeWidth={10} strokeLinecap="round" />
					{measure ? <path d="M600,470 L900,510 M600,455 L600,485 M900,495 L900,525" stroke="#fff" strokeWidth={3} /> : null}
				</svg>
				<div style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.mono, fontSize: 26, color: '#ddd'}}>ANIMATION</div>
			</div>
			<div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
				{real ? (
					<Img src={staticFile(real)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				) : (
					<svg viewBox="0 0 960 1080" style={{width: '100%', height: '100%'}}>
						<g transform="translate(-480 0)">
							<Hallway light="night" redLine={1} />
						</g>
					</svg>
				)}
				{measure ? (
					<svg viewBox="0 0 960 1080" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
						<path d="M600,470 L900,510 M600,455 L600,485 M900,495 L900,525" stroke="#fff" strokeWidth={3} />
					</svg>
				) : null}
				<div style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.mono, fontSize: 26, color: '#ddd'}}>MY WALL</div>
			</div>
		</AbsoluteFill>
	);
};

export const Erase: React.FC = () => (
	<Shots
		shots={[
			// "I needed to know whether I could change it."
			{
				id: 'er_00_frantic',
				at: 'narrator_078_change_it',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 210, cx: 1040, cy: 530, expr: 'focused', gaze: [0, 0.3]}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.cold, prompt: 'From the monitor: Mara, frantic and determined, leaning towards the screen and gripping her stylus, jaw clenched, eyes darting over the canvas. Black doorway behind.'},
			},
			// "I picked up my stylus and drew a red line across the hallway wall in the animation."
			{
				id: 'er_01_stylus_red',
				at: 'narrator_079_red_line',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.02}} to={{z: 1.1}}>
						<DeskInsert kind="stylus" glow="#ff6a5a" />
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.red, prompt: 'Insert: Mara\'s hand pressing the black stylus hard onto the pen tablet, a faint red glow from the screen on her knuckles. Natural hand, five fingers.'},
			},
			{
				id: 'er_02_canvas_red',
				at: 'narrator_079_red_line',
				frac: 0.55,
				render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_close" redLine={prog(f, d, 0.05, 0.8)} push={[1.1, 1.18]} focus={[0.6, 0.45]} />,
			},
			// "Immediately, I heard a long scraping noise."
			{
				id: 'er_03_freeze',
				at: 'narrator_080_scraping',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 280, cy: 480, expr: 'shock', gaze: [-0.8, 0]}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.open, prompt: 'Close-up: Mara freezes, eyes snapping sideways towards the sound behind her, stylus still in hand, cold screen light.'},
			},
			// "I looked behind me." - seen from the hallway, she turns towards us
			{
				id: 'er_04_look_behind',
				at: 'narrator_081_looked_behind',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Room f={f} d={d} view="fromHall" screen="canvas_man_close" from={{z: 1.25, cy: 600}}>
							{p < 0.5 ? (
								<g><Mara x={1000} y={720} s={0.36} back armR={[40, 40]} armL={[-40, -40]} legL={[20, 0]} legR={[-20, 0]} /><Chair x={1000} y={724} s={0.36} back="behind" /></g>
							) : (
								<g><Chair x={1000} y={724} s={0.36} back="behind" /><Mara x={1000} y={720} s={0.36} yaw={0.2} expr="terrified" armR={[20, 20]} armL={[-30, -20]} legL={[60, -60]} legR={[-60, 60]} thighK={0.5} light={GLOW} /></g>
							)}
						</Room>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: ['hallway', 'workroom'],
					mood: 'From the dark hallway towards the lit workroom.',
					chainKeys: true,
					prompt: 'From inside the dark hallway, looking through the doorway at Mara at her desk. Keyframe 1: her back to us, hunched over the glowing monitor. Keyframe 2: she has twisted round in her chair and looks straight towards us - towards the hallway - terrified.',
				},
			},
			// "A red line had appeared on my real wall."
			{
				id: 'er_05_red_wall',
				at: 'narrator_082_real_wall',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night', redLine: 1}} from={{z: 1.5, cx: 1250, cy: 540}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: 'Dark hallway, cold blue moonlight; one vivid red stroke on the wall.',
					prompt: 'The dark real hallway: a long straight red line, like a stroke of red digital paint, runs across the right-hand wall at chest height. Nobody there.',
					dark: true,
				},
			},
			// "The exact same length." / "The exact same position."
			{id: 'er_06_split', at: 'narrator_083_same_length', render: () => <Split />},
			{id: 'er_07_split_measure', at: 'narrator_084_same_position', render: () => <Split measure />},
			// "My hands started shaking."
			{
				id: 'er_08_hands_shake',
				at: 'narrator_085_hands_shaking',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<DeskInsert kind="hands" />
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', fx: 'tremble', mood: MOOD.cold, prompt: 'Insert: both of Mara\'s hands hovering over the pen tablet, trembling, the stylus in her right hand, cold screen light. Natural hands, five fingers each.'},
			},
			// "If the animation could change the apartment, maybe I could use it to stop the man."
			{
				id: 'er_09_jaw_set',
				at: 'narrator_086_stop_the_man',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 220, cx: 1030, cy: 520, expr: 'focused'}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.cold, prompt: 'From the monitor: Mara, pale but resolved, jaw set, staring hard at the canvas; she has an idea. Black doorway behind her.'},
			},
			// "I selected a thick white brush."
			{id: 'er_10_brush', at: 'narrator_087_white_brush', render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_man_close" brushPanel push={[1.3, 1.36]} focus={[0.92, 0.45]} cursor={[1700, 300]} />},
			// "Then I started painting over him." / legs / arms / head
			{id: 'er_11_paint', at: 'narrator_088_painting_over', render: paintShot(0, 0.12)},
			{id: 'er_12_legs', at: 'narrator_089_legs', render: paintShot(0.12, 0.38)},
			{id: 'er_13_arms', at: 'narrator_090_arms', render: paintShot(0.38, 0.62)},
			{id: 'er_14_head', at: 'narrator_091_head', render: paintShot(0.62, 0.86)},
			{id: 'er_15_last_strokes', at: 'painting', render: paintShot(0.86, 1)},
			// "I kept painting until the entire figure disappeared into the white background."
			{
				id: 'er_16_white_face',
				at: 'narrator_092_disappeared',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 270, cy: 480, expr: 'focused', light: '#ffffff'}} bg="#0a0c10" />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.whiteGlow, prompt: 'Close-up: Mara painting furiously, her face lit pure white by the now almost entirely white screen in front of her, eyes wide and glassy, the dark room behind her.'},
			},
			// "I flattened the layer." / "Saved the project."
			{id: 'er_17_flatten', at: 'narrator_093_flattened', render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_white" toast={f > 4 ? 'Layers flattened' : null} push={[1.0, 1.04]} />},
			{id: 'er_18_saved', at: 'narrator_094_saved', render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_white" toast={f > 4 ? 'Project saved' : null} push={[1.04, 1.08]} />},
			// "And waited."
			{
				id: 'er_19_waited',
				at: 'narrator_095_waited',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 160, cx: 1150, cy: 570, expr: 'uneasy', light: '#ffffff'}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.whiteGlow, prompt: 'From the white-glowing monitor: Mara sits rigid in her chair, not breathing, waiting; her face lit white; behind her the doorway to the hallway is black.', parallax: true},
			},
			// AUDIO CUE: the scratching stops. Absolute silence.
			{id: 'er_20_silence', at: 'silence_waited', render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night'}} />, art: {kind: 'reuse', reuse: 'co_09_hall_dark', move: {z0: 1.04, z1: 1.04}}},
			// "For a few seconds, nothing happened."
			{id: 'er_21_still_waiting', at: 'narrator_096_nothing_happened', render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 160, cx: 1150, cy: 570, expr: 'uneasy'}} />, art: {kind: 'reuse', reuse: 'er_19_waited', move: {z0: 1.06, z1: 1.12}}},
			// "I thought I'd done it."
			{
				id: 'er_22_exhale',
				at: 'narrator_097_done_it',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 170, cx: 1120, cy: 600, expr: 'relief', eyesClosed: true, tilt: -6}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.whiteGlow, prompt: 'From the monitor: Mara lets out a long breath, shoulders dropping, eyes closed, a shaky half-smile of relief; the white screen light on her face.'},
			},
			// "I thought I'd erased him."
			{id: 'er_23_canvas_white', at: 'narrator_098_erased_him', render: ({f, d}) => <EditorShot f={f} d={d} {...E} picture="canvas_white" push={[1.0, 1.12]} focus={[0.42, 0.42]} />},
			// "But I hadn't erased him."
			{
				id: 'er_24_relief_fades',
				at: 'narrator_099_hadnt_erased',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 480, expr: 'uneasy', light: '#ffffff'}} />,
				art: {kind: 'still', chars: ['mara'], loc: 'workroom', mood: MOOD.whiteGlow, prompt: 'Close-up: the relief draining from Mara\'s face, replaced by unease as she notices something off-screen. White screen light, darkness around.'},
			},
			// "I'd made a much worse mistake." - the hallway starts to drain white
			{
				id: 'er_25_draining',
				at: 'narrator_100_worse_mistake',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<Hallway light="dim" />
						<rect x={0} y={0} width={1920} height={1080} fill="#efeee9" opacity={0.35} />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: ['hallway', 'white'],
					fx: 'whiteout',
					mood: 'The hallway half drained of colour: greys going pale, shadows thinning, as if the picture is fading to blank paper.',
					prompt: 'The hallway in the same one-point perspective, but its colours are fading: the walls paling towards flat white, the shadows thinning out, textures disappearing. Empty.',
				},
			},
		]}
	/>
);
