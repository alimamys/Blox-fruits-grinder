// 8. WHITE ON WHITE - the apartment drains to white; Hana sees the shadow; the outline.
import React from 'react';
import {PhoneFrame, ScreenshotView} from '../components/ui/Phone';
import {Hallway} from '../layout/Hallway';
import {MaraBust} from '../layout/Mara';
import {WallClose, Workroom} from '../layout/Rooms';
import {Shots, Stage, type ShotProps} from '../utils/scene';
import {MOOD, mouthOf, prog} from './common';
import {FaceClose, Room, SeatedMara} from './frames';

const WL = '#ffffff';
// Mara on the phone in the drained room. C: medium; D: close-up.
const angleC = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<Stage f={f} d={d}>
		<Workroom view="white">
			<MaraBust r={150} cx={1100} cy={560} expr="uneasy" phoneEar="R" light={WL} mouth={mouthOf(api, sf, ...talk)} />
		</Workroom>
	</Stage>
);
const angleD = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<Stage f={f} d={d}>
		<Workroom view="white">
			<MaraBust r={270} cx={980} cy={500} expr="afraid" phoneEar="R" light={WL} mouth={mouthOf(api, sf, ...talk)} />
		</Workroom>
	</Stage>
);

export const WhiteOnWhite: React.FC = () => (
	<Shots
		shots={[
			// "I noticed the changes slowly."
			{
				id: 'wh_00_drained_room',
				at: 'narrator_101_changes',
				render: ({f, d}) => (
					<Room f={f} d={d} view="wide" screen="canvas_white" drained={0.45}>
						<SeatedMara expr="uneasy" yaw={-0.4} light={WL} />
					</Room>
				),
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: ['workroom', 'white'],
					mood: MOOD.drained,
					prompt: 'Wide shot of the workroom, but its colours have drained to pale greys and whites, as if half-erased: Mara sits at her desk, turning to look around the room, uneasy; the monitor glows white; the doorway on the left is pale grey instead of black.',
				},
			},
			// "The wallpaper had lost its texture."
			{
				id: 'wh_01_flat_wall',
				at: 'narrator_102_wallpaper',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="flat" />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.drained, prompt: 'Close on a stretch of wall: the wallpaper pattern has gone, leaving a perfectly flat, blank, off-white surface with no texture at all, only a faint pencil-like outline of the skirting board.'},
			},
			// "The shadows around the doorframe had disappeared."
			{
				id: 'wh_02_doorframe',
				at: 'narrator_103_shadows_gone',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 2.6, cx: 960, cy: 520}}>
						<Hallway light="white" flat />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.drained, prompt: 'The bedroom door at the end of the hallway, but flat white with no shadows at all around its frame - just thin faint lines, like an unfinished drawing.'},
			},
			// "Even the stains were gone."
			{
				id: 'wh_03_ceiling',
				at: 'narrator_104_stains_gone',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 3.2, cx: 920, cy: 250}}>
						<Hallway light="white" flat />
					</Stage>
				),
				art: {kind: 'still', loc: 'white', mood: MOOD.drained, prompt: 'Looking up at the hallway ceiling and the dome light: the brown water stain is gone; the ceiling is blank flat white, the light fixture just a faint outline.'},
			},
			// "My apartment looked like an unfinished drawing."
			{
				id: 'wh_04_white_hall',
				at: 'narrator_105_unfinished',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<Hallway light="white" flat />
					</Stage>
				),
				art: {
					kind: 'still',
					loc: 'white',
					mood: MOOD.drained,
					prompt: 'The whole hallway in the same one-point perspective, drained to flat white: no textures, no shadows, only faint thin outlines of the doors, the carpet runner and the ceiling light - like an unfinished pencil drawing on white paper. Empty.',
				},
			},
			// "I called Hana again." - angle C (talking frame)
			{
				id: 'wh_05_phone_c',
				at: 'narrator_106_called_again',
				render: angleC([]),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.drained,
					prompt: 'Medium shot: Mara in the drained white room, phone at her right ear, shaky with relief but still frightened, mouth closed. The room behind her is flat pale white with only faint outlines.',
					talk: [],
				},
			},
			{id: 'wh_06_got_rid', at: 'mara_006_got_rid', off: -0.3, render: angleC(['mara_006_got_rid']), art: {kind: 'reuse', reuse: 'wh_05_phone_c', talk: ['mara_006_got_rid'], move: {z0: 1.05, z1: 1.09}}},
			{id: 'wh_07_hana_what', at: 'hana_007_what_did_you_do', render: angleC([]), art: {kind: 'reuse', reuse: 'wh_05_phone_c', move: {z0: 1.09, z1: 1.12}}},
			// "I painted over him. He's gone." - angle D (talking frame)
			{
				id: 'wh_08_phone_d',
				at: 'mara_007_painted_over',
				render: angleD(['mara_007_painted_over']),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.drained,
					prompt: 'Close-up: Mara with the phone at her right ear in the pale white room, listening hard, afraid, mouth closed; flat white background with faint lines.',
					talk: ['mara_007_painted_over'],
				},
			},
			// (long silence) HANA: "Mara, listen to me."
			{id: 'wh_09_hana_listen', at: 'hana_008_listen', off: -1.0, render: angleD([]), art: {kind: 'reuse', reuse: 'wh_08_phone_d', move: {z0: 1.04, z1: 1.12}}},
			{id: 'wh_10_what', at: 'mara_008_what', render: angleD(['mara_008_what']), art: {kind: 'reuse', reuse: 'wh_08_phone_d', talk: ['mara_008_what'], move: {z0: 1.12, z1: 1.14}}},
			// HANA: "I'm looking at the screenshot you sent earlier."
			{
				id: 'wh_11_screenshot',
				at: 'hana_009_screenshot',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d} tilt={2}>
						<ScreenshotView picture="canvas_man_1m" />
					</PhoneFrame>
				),
			},
			{id: 'wh_12_okay', at: 'mara_009_okay', render: angleD(['mara_009_okay']), art: {kind: 'reuse', reuse: 'wh_08_phone_d', talk: ['mara_009_okay'], move: {z0: 1.1, z1: 1.12}}},
			// HANA: "I zoomed in on the man."
			{
				id: 'wh_13_zoom',
				at: 'hana_010_zoomed',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d} tilt={2}>
						<ScreenshotView picture="canvas_man_1m" z={1 + 1.6 * prog(f, d, 0.15, 0.85)} cx={0.56} cy={0.5} />
					</PhoneFrame>
				),
			},
			// HANA: "The light is casting a shadow behind him."
			{
				id: 'wh_14_shadow',
				at: 'hana_011_shadow',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d} tilt={2} scale={0.95}>
						<ScreenshotView picture="screenshot_shadow" z={1.3} cx={0.4} cy={0.5} />
					</PhoneFrame>
				),
			},
			{id: 'wh_15_so', at: 'mara_010_so', render: angleD(['mara_010_so']), art: {kind: 'reuse', reuse: 'wh_08_phone_d', talk: ['mara_010_so'], move: {z0: 1.14, z1: 1.16}}},
			// HANA: "Look at where the shadow ends."
			{
				id: 'wh_16_shadow_ends',
				at: 'hana_012_shadow_ends',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d} tilt={2} scale={1.0}>
						<ScreenshotView picture="screenshot_shadow" z={1.3 + 0.9 * prog(f, d)} cx={0.4 + 0.4 * prog(f, d)} cy={0.5} />
					</PhoneFrame>
				),
			},
			// HANA (quietly): "He's standing right against the white wall."
			{
				id: 'wh_17_realisation',
				at: 'hana_013_against_wall',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<Workroom view="white">
							<MaraBust r={300} cx={960} cy={480} expr="shock" phoneEar="R" light={WL} />
						</Workroom>
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.drained, prompt: 'Close-up: Mara, phone at her ear, the understanding hitting her - eyes widening, lips parting, every bit of colour gone from her face. Flat white background.'},
			},
			// "I turned toward my own wall."
			{
				id: 'wh_18_turn_wall',
				at: 'narrator_107_turned_wall',
				render: ({f, d}) => {
					const p = f / Math.max(1, d - 1);
					return (
						<Stage f={f} d={d}>
							<Workroom view="white">
								{p < 0.5 ? <MaraBust r={200} cx={1000} cy={520} expr="afraid" phoneEar="R" light={WL} /> : <MaraBust r={200} cx={1000} cy={520} expr="afraid" yaw={-0.9} gaze={[-1, 0]} light={WL} />}
							</Workroom>
						</Stage>
					);
				},
				art: {
					kind: 'action',
					keys: 2,
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.drained,
					prompt: 'Medium close-up in the white room. Keyframe 1: Mara, phone at her ear, facing us, afraid. Keyframe 2: she has slowly turned her head to the side to look at the white wall next to her, the phone lowered.',
				},
			},
			// "For the first time, I noticed a faint outline."
			{
				id: 'wh_19_outline',
				at: 'narrator_108_faint_outline',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="white" shape="body" outline={0.3} />
					</Stage>
				),
				art: {
					kind: 'still',
					chars: ['figure'],
					loc: 'white',
					mood: MOOD.white,
					prompt: 'A flat white wall, close. Barely visible on it: a very faint outline of a tall human shape, white on white, only readable from the thinnest grey edge lines and a tiny shadow. Subtle - it should take a moment to see.',
				},
			},
			// "Not black."
			{
				id: 'wh_20_eyes',
				at: 'narrator_109_not_black',
				render: ({f, d}) => <FaceClose f={f} d={d} b={{r: 520, cy: 560, expr: 'afraid', light: WL, gaze: [-0.6, 0]}} bg="#d9d8d3" />,
				art: {kind: 'still', chars: ['mara'], loc: 'white', mood: MOOD.white, prompt: 'Extreme close-up of Mara\'s eyes in harsh white light, searching the wall to the side, pupils tiny, fear rising.'},
			},
			// "Not gray." / "White."
			{id: 'wh_21_not_gray', at: 'narrator_110_not_gray', render: ({f, d}) => <Stage f={f} d={d}><WallClose tone="white" shape="body" outline={0.3} /></Stage>, art: {kind: 'reuse', reuse: 'wh_19_outline', move: {z0: 1.15, z1: 1.2, x0: 0.5, y0: 0.4}}},
			{id: 'wh_22_white', at: 'narrator_111_white', render: ({f, d}) => <Stage f={f} d={d}><WallClose tone="white" shape="body" outline={0.3} /></Stage>, art: {kind: 'reuse', reuse: 'wh_19_outline', move: {z0: 1.35, z1: 1.45, x0: 0.5, y0: 0.35}}},
			// "Almost the exact same color as the paint." - a shoulder separates from the wall
			{
				id: 'wh_23_shoulder',
				at: 'narrator_112_same_color',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<WallClose tone="white" shape="shoulder" outline={f / Math.max(1, d) < 0.5 ? 0.2 : 0.6} />
					</Stage>
				),
				art: {
					kind: 'action',
					keys: 2,
					chars: ['figure'],
					loc: 'white',
					mood: MOOD.white,
					prompt: 'Close on the white wall. Keyframe 1: a faint shoulder-shaped outline, white on white, flat in the wall. Keyframe 2: the white shoulder has begun to separate from the wall, standing out in relief with a thin crescent of shadow beneath it, as if peeling away from the paper.',
				},
			},
			// MARA (breathless): "Oh God."
			{
				id: 'wh_24_oh_god',
				at: 'mara_011_oh_god',
				render: ({f, d, sf, api}) => <FaceClose f={f} d={d} b={{r: 280, cy: 470, expr: 'terrified', light: WL, mouth: mouthOf(api, sf, 'mara_011_oh_god')}} bg="#cfcec9" />,
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'white',
					mood: MOOD.white,
					prompt: 'Close-up: Mara\'s face in harsh white light against the pale wall, terrified, eyes enormous, breath caught, mouth closed tight.',
					talk: ['mara_011_oh_god'],
				},
			},
			// AUDIO CUE: a slow, wet peeling sound
			{id: 'wh_25_peel', at: 'peel', render: ({f, d}) => <Stage f={f} d={d}><WallClose tone="white" shape="shoulder" outline={0.6} /></Stage>, art: {kind: 'reuse', reuse: 'wh_23_shoulder', key: 1, fx: 'tremble', move: {z0: 1.1, z1: 1.25}}},
		]}
	/>
);
