// 4. ONE STEP CLOSER - every replay brings him closer; the real hallway behind her.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {EditorShot} from '../components/ui/Editor';
import {restyleSrc} from '../components/fx/Restyled';
import {Hallway} from '../layout/Hallway';
import {Mara} from '../layout/Mara';
import {PictureBox, type PicId} from '../layout/pictures';
import {Chair, WallClose} from '../layout/Rooms';
import {FONT} from '../utils/fonts';
import {Shots, Stage} from '../utils/scene';
import {MOOD} from './common';
import {FaceClose, FrontMara, FullPicture, GLOW, Hall, Room} from './frames';

const STRIP = (last: PicId): PicId[] => [...Array.from({length: 11}, () => 'canvas_empty' as PicId), last];
const play = (from: PicId, to: PicId) => ({f, d}: {f: number; d: number}) => {
	const p = f / Math.max(1, d - 1);
	const last = p > 0.85;
	return (
		<EditorShot
			f={f}
			d={d}
			total={240}
			strip={STRIP(last ? to : from)}
			picture={last ? to : 'canvas_empty'}
			frame={last ? 240 : 200 + Math.round((p / 0.85) * 39)}
			play={Math.min(1, p / 0.85)}
			playing={!last}
			push={[1.0, 1.03]}
		/>
	);
};

export const Closer: React.FC = () => (
	<Shots
		shots={[
			// "I stared at the screen for a long time."
			{
				id: 'cl_00_frozen',
				at: 'narrator_036_stared',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 170, cx: 1150, cy: 560, expr: 'uneasy'}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'From the monitor\'s point of view: Mara sits frozen, staring straight at the screen (towards the camera), her face lit cold blue; behind her, over her shoulder, the open doorway to the hallway is completely black.',
					parallax: true,
				},
			},
			// "Then I played the animation again." -> "The man was closer."
			{id: 'cl_01_play2', at: 'narrator_037_played_again', off: 0.6, render: play('canvas_man_mid', 'canvas_man_1m')},
			{id: 'cl_02_closer', at: 'narrator_038_man_closer', render: ({f, d}) => <FullPicture id="canvas_man_1m" f={f} d={d} z={[1.0, 1.1]} focus={[0.5, 0.45]} />},
			// "Not much. Maybe a meter."
			{
				id: 'cl_03_eyes_sweat',
				at: 'narrator_039_a_meter',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 480, cy: 560, expr: 'afraid', gaze: [0, 0.05]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Extreme close-up of Mara\'s eyes and forehead, a bead of sweat at her temple, eyes fixed on the screen, afraid. Cold monitor light, black around her.',
				},
			},
			// "I played it a third time." -> "Closer."
			{id: 'cl_04_play3', at: 'narrator_040_third_time', off: 0.5, render: play('canvas_man_1m', 'canvas_man_near')},
			{id: 'cl_05_near', at: 'narrator_041_closer', off: -0.1, render: ({f, d}) => <FullPicture id="canvas_man_near" f={f} d={d} z={[1.04, 1.12]} />},
			// "A fourth time."
			{
				id: 'cl_06_lip',
				at: 'narrator_042_fourth_time',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 250, cx: 1040, cy: 520, expr: 'afraid', mouth: 0.08}} />,
				art: {move: {z0: 1.1, z1: 1.13}, 
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Close shot from the monitor: Mara\'s lower lip trembling, eyes glassy with fear, her finger hovering; the black doorway behind her.',
				},
			},
			// "Closer."
			{id: 'cl_07_close', at: 'narrator_043_closer', off: -0.1, render: ({f, d}) => <FullPicture id="canvas_man_close" f={f} d={d} z={[1.06, 1.16]} focus={[0.5, 0.35]} />},
			// "He didn't walk." - onion skin
			{
				id: 'cl_08_onion',
				at: 'narrator_044_didnt_walk',
				render: ({f, d}) => (
					<EditorShot f={f} d={d} total={240} strip={STRIP('canvas_man_close')} picture="canvas_empty" frame={240} onion={['canvas_man_mid', 'canvas_man_1m', 'canvas_man_near', 'canvas_man_close']} push={[1.0, 1.06]} focus={[0.42, 0.42]} />
				),
			},
			// "There was no movement between positions." - the strip: no in-betweens
			{
				id: 'cl_09_strip',
				at: 'narrator_045_no_movement',
				render: ({f, d}) => (
					<EditorShot
						f={f}
						d={d}
						total={240}
						strip={['canvas_empty', 'canvas_empty', 'canvas_man_far', 'canvas_empty', 'canvas_man_mid', 'canvas_empty', 'canvas_man_1m', 'canvas_empty', 'canvas_man_near', 'canvas_empty', 'canvas_empty', 'canvas_man_close']}
						picture="canvas_man_close"
						frame={240}
						push={[1.6, 1.7]}
						focus={[0.5, 0.9]}
					/>
				),
			},
			// "He simply appeared somewhere new every time the animation reached its final frame."
			{
				id: 'cl_10_wide_dark',
				at: 'narrator_046_appeared',
				render: ({f, d}) => (
					<Room f={f} d={d} view="wide" screen="canvas_man_close">
						<g transform="translate(0 0)">
							<Mara x={930} y={640} s={0.62} yaw={1} lean={14} expr="afraid" armR={[60, 30]} armL={[55, 35]} legL={[80, -85]} legR={[76, -80]} light={GLOW} />
						</g>
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara', 'figure'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Wide shot of the dark workroom: Mara at her desk on the right, hunched towards the monitor, which shows the painted hallway with the tall dark man close in the frame. Behind her, on the left, the open doorway to the real hallway is pitch black - she has her back to it.',
				},
			},
			// "Like someone was drawing him in a different place."
			{
				id: 'cl_11_realisation',
				at: 'narrator_047_drawing_him',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 260, cy: 480, expr: 'shock', mouth: 0.1}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Close-up: Mara\'s face as a horrible thought lands - eyes wide, lips parted, colour drained from her face. Cold screen light, black around her.',
				},
			},
			// "I stopped the playback."
			{
				id: 'cl_12_stop',
				at: 'narrator_048_stopped',
				render: ({f, d}) => <EditorShot f={f} d={d} total={240} strip={STRIP('canvas_man_close')} picture="canvas_man_close" frame={240} playing={false} play={1} push={[1.25, 1.3]} focus={[0.2, 0.88]} cursor={[150, 860]} />,
			},
			// "For several seconds, I didn't move." - from deep in the dark hallway
			{
				id: 'cl_13_from_hall',
				at: 'narrator_049_didnt_move',
				render: ({f, d}) => (
					<Room f={f} d={d} view="fromHall" screen="canvas_man_close" from={{z: 1}} to={{z: 1.05}}>
						<g><Mara x={1000} y={720} s={0.36} back lean={6} armR={[40, 40]} armL={[-40, -40]} legL={[20, 0]} legR={[-20, 0]} /><Chair x={1000} y={724} s={0.36} back="behind" /></g>
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: ['hallway', 'workroom'],
					mood: 'From the darkness of the hallway: almost black foreground walls, and far away through the doorway the small cold-lit workroom.',
					prompt: 'View from deep inside the dark hallway, looking out through the doorway into the workroom: Mara sits small at her desk with her back to us, motionless, lit by her monitor. The hallway walls around the camera are almost black. As if something in the hallway is watching her.',
					dark: true,
				},
			},
			// "Then I heard something from my actual hallway."
			{
				id: 'cl_14_eyes_slide',
				at: 'narrator_050_heard_something',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 330, cx: 1000, cy: 470, expr: 'afraid', gaze: [-1, 0]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Close-up: Mara does not move her head; only her eyes slide sideways towards the doorway behind her, listening. Cold screen light, fear.',
				},
			},
			// AUDIO CUE: the scratch - the dark hallway trembles
			{id: 'cl_15_scratch', at: 'scratch_1', render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night'}} />, art: {kind: 'reuse', reuse: 'co_09_hall_dark', fx: 'tremble', move: {z0: 1.12, z1: 1.18}}},
			// "It sounded like someone dragging a pencil across a wall."
			{
				id: 'cl_16_wall_dark',
				at: 'narrator_051_pencil_wall',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="dark" />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: 'Near darkness, cold blue, the faint texture of the wallpaper catching moonlight.',
					prompt: 'Close-up on a stretch of the dark hallway wall at night: faint wallpaper texture, a skirting board at the bottom. Nothing on it. Empty and silent.',
					dark: true,
				},
			},
			// "I turned around."
			{
				id: 'cl_17_turn',
				at: 'narrator_052_turned_around',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return p < 0.34 ? (
						<FrontMara f={f} d={d} b={{r: 170, cx: 1150, cy: 560, expr: 'afraid'}} />
					) : p < 0.67 ? (
						<FrontMara f={f} d={d} b={{r: 170, cx: 1150, cy: 560, expr: 'afraid', yaw: -0.7, gaze: [-1, 0]}} />
					) : (
						<FrontMara f={f} d={d} b={{r: 170, cx: 1150, cy: 560, back: true}} />
					);
				},
				art: {
					kind: 'action',
					keys: 3,
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt:
						'From the monitor, the black doorway behind her. Keyframe 1: Mara facing the screen (the camera), afraid. Keyframe 2: she turns her head and shoulders to look back over her shoulder at the doorway, terrified. Keyframe 3: she has turned fully around in her chair, her back to us, facing the dark doorway; we see her messy bun with the yellow pencil.',
				},
			},
			// "The hallway was empty."
			{id: 'cl_18_empty', at: 'narrator_053_empty', render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night'}} />, art: {kind: 'reuse', reuse: 'co_09_hall_dark', move: {z0: 1.0, z1: 1.07}}},
			// "But the ceiling light was flickering."
			{
				id: 'cl_19_light',
				at: 'narrator_054_flickering',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 3.2, cx: 900, cy: 260}}>
						<Hallway light="dim" bulb={1} />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'hallway',
					fx: 'flicker',
					mood: 'Dark hallway; the dome ceiling light glows a weak sickly yellow, the brown water stain beside it.',
					prompt: 'Close-up looking up at the hallway\'s dome ceiling light, switched on, weak sickly yellow glow, the brown water stain on the ceiling beside it, the rest dark.',
				},
			},
			// "Exactly like the one in my animation." - split screen, both lights flicker together
			{
				id: 'cl_20_split',
				at: 'narrator_055_like_my_animation',
				render: ({f}) => {
					const on = (Math.floor(f / 2) * 7919) % 10 > 3;
					const real = restyleSrc('cl_19_light');
					return (
						<AbsoluteFill style={{background: '#000', flexDirection: 'row'}}>
							<div style={{flex: 1, overflow: 'hidden', position: 'relative', borderRight: '3px solid #000', filter: on ? 'none' : 'brightness(0.3)'}}>
								<div style={{position: 'absolute', inset: 0, transform: 'scale(3.2)', transformOrigin: '47% 24%'}}>
									<PictureBox id="canvas_empty" />
								</div>
								<div style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.mono, fontSize: 26, color: '#ddd'}}>ANIMATION</div>
							</div>
							<div style={{flex: 1, overflow: 'hidden', position: 'relative', filter: on ? 'none' : 'brightness(0.3)'}}>
								{real ? (
									<Img src={staticFile(real)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
								) : (
									<svg viewBox="0 0 960 1080" style={{width: '100%', height: '100%'}}>
										<g transform="translate(-1400 -300) scale(2.4)">
											<Hallway light="dim" bulb={1} />
										</g>
									</svg>
								)}
								<div style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.mono, fontSize: 26, color: '#ddd'}}>HALLWAY</div>
							</div>
						</AbsoluteFill>
					);
				},
			},
		]}
	/>
);

