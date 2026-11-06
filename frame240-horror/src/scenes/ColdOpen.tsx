// 1. COLD OPEN - the frame that shouldn't exist.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EditorShot} from '../components/ui/Editor';
import {Disclaimer, TitleCard} from '../components/ui/Phone';
import {DeskInsert} from '../layout/Rooms';
import {PictureBox, type PicId} from '../layout/pictures';
import {Shots, Stage} from '../utils/scene';
import {Black, MOOD, prog} from './common';
import {FaceClose, FullPicture, Hall, Room, SeatedMara} from './frames';

const STRIP: PicId[] = Array.from({length: 12}, () => 'canvas_empty' as PicId);
const STRIP240: PicId[] = [...STRIP.slice(1), 'canvas_man_far'];

export const ColdOpen: React.FC = () => (
	<Shots
		shots={[
			// black; fan hum; a double click; a 3-frame flash of the figure; the disclaimer
			{
				id: 'co_00_black',
				at: 0,
				render: ({f, d}) => (
					<AbsoluteFill style={{background: '#000'}}>
						{f >= 35 && f < 38 ? <PictureBox id="canvas_man_far" style={{filter: 'brightness(0.8) contrast(1.2)'}} /> : null}
					</AbsoluteFill>
				),
				overlay: ({f, d}) => <Disclaimer f={f} d={d} />,
			},
			// "There were 239 frames in my animation when I went to bed."
			{
				id: 'co_01_timeline239',
				at: 'narrator_001_239_frames',
				render: ({f, d}) => <EditorShot f={f} d={d} picture="canvas_empty" frame={239} total={239} strip={STRIP} push={[1.08, 1.16]} focus={[0.45, 0.88]} />,
			},
			// "...there were 240." - a new cell slides onto the end of the strip
			{
				id: 'co_02_timeline240',
				at: 'narrator_002_240',
				frac: 0.55,
				render: ({f, d}) => <EditorShot f={f} d={d} picture="canvas_empty" frame={240} total={240} strip={STRIP240} newCell={prog(f, 8)} push={[1.18, 1.3]} focus={[0.92, 0.9]} />,
			},
			// "In the extra frame, a man was standing in my hallway." - full-screen flash, then the canvas
			{
				id: 'co_03_extra_frame',
				at: 'narrator_003_extra_frame',
				frac: 0.42,
				render: ({f, d}) =>
					f < 5 ? <FullPicture id="canvas_man_far" f={f} d={d} /> : <EditorShot f={f} d={d} picture="canvas_man_far" frame={240} total={240} strip={STRIP240} push={[1.0, 1.1]} focus={[0.42, 0.42]} />,
			},
			// "I hadn't drawn him."
			{
				id: 'co_04_face_uneasy',
				at: 'narrator_004_hadnt_drawn',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 300, cy: 500, expr: 'uneasy', gaze: [0, 0.1]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Close-up of Mara\'s face lit only by the cold glow of her monitor, staring at the screen just off camera, uneasy: eyes slightly widened, lips pressed together. Everything around her face falls into darkness.',
					parallax: false,
				},
			},
			// "...he was closer."
			{
				id: 'co_05_closer',
				at: 'narrator_005_closer',
				frac: 0.5,
				render: ({f, d}) => <FullPicture id="canvas_man_mid" f={f} d={d} z={[1.02, 1.12]} />,
			},
			// "I know how ridiculous that sounds."
			{
				id: 'co_06_desk_wide',
				at: 'narrator_006_ridiculous',
				render: ({f, d}) => (
					<Room f={f} d={d} view="wide" screen="canvas_man_mid" hall={{light: 'night'}}>
						<SeatedMara expr="uneasy" />
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Wide shot of the dark workroom at night: Mara sits at her desk on the right in profile, facing her glowing monitor; the rainy window above the desk; behind her on the left, the open doorway to the pitch-black hallway. She looks small and alone.',
					parallax: true,
				},
			},
			// "A drawing can't move by itself. An animation can't create new frames."
			{
				id: 'co_07_stylus',
				at: 'narrator_007_cant_move',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<DeskInsert kind="stylus" />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.cold,
					prompt: 'Close-up insert: Mara\'s right hand holding a black stylus over a dark pen tablet on her desk, the burnt-orange sweatshirt sleeve pushed up her forearm, lit by the blue monitor glow. Natural hand, five fingers.',
				},
			},
			// "At least, that's what I believed."
			{
				id: 'co_08_eyes',
				at: 'narrator_008_believed',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 560, cy: 580, expr: 'uneasy'}} />,
				art: {move: {z0: 1.08, z1: 1.11}, 
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: MOOD.open,
					prompt: 'Extreme close-up of Mara\'s eyes and brows only, filling the frame, the monitor light reflected in her dark irises; unease building, her gaze fixed on the screen.',
				},
			},
			// "Until that night." - the real hallway from the desk, dark (HALL-DARK, reused later)
			{
				id: 'co_09_hall_dark',
				at: 'narrator_009_until_that_night',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night'}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					mood: 'Night. The real hallway in darkness: cold blue moonlight, the ceiling light off, deep black shadows, the bedroom door at the end barely visible.',
					prompt: 'The real apartment hallway at night, exactly as in the location reference, empty and dark, seen from the living-room end. Nobody in it.',
					dark: true,
				},
			},
			// the figure at the end of the REAL hallway, head bent unnaturally to one side
			{
				id: 'co_10_figure_real',
				at: 'figure_reveal',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night', man: 0.93}} />,
				art: {
					kind: 'still',
					chars: ['figure'],
					loc: 'hallway',
					fx: 'glitch',
					mood: 'Night, near darkness, cold blue moonlight; the figure is a darker shape in the dark.',
					prompt: 'The same dark hallway, but now the tall man from the figure sheet stands at the far end in front of the bedroom door, his head bent unnaturally to one side, arms hanging straight down, face hidden. He is only a silhouette in the dark.',
					dark: true,
				},
			},
			// hard black + one dry scratch
			{id: 'co_11_black', at: 'cut_black', render: () => <Black />},
			// FRAME 240
			{id: 'co_12_title', at: 'title', render: ({f, d}) => <TitleCard f={f} d={d} />},
		]}
	/>
);

