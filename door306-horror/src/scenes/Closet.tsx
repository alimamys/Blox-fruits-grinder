// 10. THE RECORDING and 11. THE LAST SELECTION - in the closet, whispering into her
// phone camera; the face in the door; the selection; the cursor; white.
import React from 'react';
import {BigCursor, CrawlingDashes, MarchingAnts, RecHud} from '../components/ui/Phone';
import {Mara, MaraBust} from '../layout/Mara';
import {Closet as ClosetSet} from '../layout/Rooms';
import {FPS, TIMELINE, TIMELINE_FULL} from '../data/timeline';
import {useSettings} from '../data/settings';
import {Shots, Stage, type ShotProps} from '../utils/scene';
import {MOOD, mouthOf, prog, White} from './common';
import {InCloset} from './frames';

const PH = '#d9e8ff';
// the REC timer keeps running across the closet shots (she started recording 41 s before
// the first line we hear)
const Rec: React.FC<{t: number}> = ({t}) => {
	const tl = useSettings().edit === 'full' ? TIMELINE_FULL : TIMELINE;
	const start = tl.markers['mara_012_where_i_am']?.start ?? 0;
	return <RecHud seconds={41 + t - start} />;
};
const rec = (_base: number) => ({sf, api}: ShotProps) => <Rec t={api.scene.start + sf / FPS} />;

/** E: closet wide - knees up on the floor, the phone the only light. */
const angleE = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<InCloset f={f} d={d} view="wide">
		<Mara x={980} y={900} s={0.62} yaw={0.15} expr="afraid" mouth={mouthOf(api, sf, ...talk)} armR={[-25, 150]} armL={[30, -110]} legL={[172, -172]} legR={[-172, 172]} thighK={1.15} kneesUp phoneIn="R" light={PH} />
	</InCloset>
);
/** F: the phone camera's view of her face (front camera, close). */
const closeUp = (expr: 'afraid' | 'cry' | 'terrified' | 'whisper', gaze: [number, number] = [0, 0]) => (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<InCloset f={f} d={d} view="face">
		<MaraBust r={300} cx={960} cy={500} expr={expr} gaze={gaze} light={PH} mouth={mouthOf(api, sf, ...talk)} />
	</InCloset>
);
const angleF = closeUp('afraid');
const angleF2 = closeUp('cry');
const angleF3 = closeUp('terrified');
const angleF4 = closeUp('whisper', [0, -1]);

const TOP_BOX: [number, number, number, number] = [620, 300, 1300, 860];

export const Recording: React.FC = () => (
	<Shots
		shots={[
			// "That's where I am now." / "Inside the storage closet."
			{
				id: 're_00_closet_wide',
				at: 'mara_012_where_i_am',
				render: angleE(['mara_012_where_i_am', 'mara_013_closet']),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'closet',
					mood: MOOD.closet,
					prompt: 'Inside the tiny dark storage closet: Mara sits on the floor with her knees pulled up to her chest, holding her phone in front of her face to record herself; its cold screen light is the only light, on her face. Shelves with boxes and coats around her, the white door with a thin line of light under it on the right. Mouth closed.',
					talk: ['mara_012_where_i_am', 'mara_013_closet'],
				},
			},
			// "I started recording this because I don't know what else to do." (phone camera)
			{
				id: 're_01_phone_cam',
				at: 'mara_014_recording',
				render: angleF(['mara_014_recording', 'mara_015_moving_outside']),
				overlay: rec(41),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'closet',
					mood: MOOD.closet,
					prompt: 'Seen through her phone\'s front camera, very close: Mara\'s face lit cold white-blue by the phone screen, whispering, exhausted and afraid, strands of hair loose; the white closet wall barely visible in the dark behind her. Mouth closed.',
					talk: ['mara_014_recording', 'mara_015_moving_outside'],
				},
			},
			// "Sometimes the scratching stops."
			{
				id: 're_02_door_inside',
				at: 'mara_016_scratching_stops',
				render: ({f, d}) => <InCloset f={f} d={d} view="door" />,
				art: {kind: 'still', loc: 'closet', mood: MOOD.closet, prompt: 'From where Mara sits on the floor: the inside of the white closet door, a thin bright line of light under it, the handle. Dark, still.', dark: true},
			},
			// "And when it does, I hear something even worse."
			{id: 're_03_worse', at: 'mara_017_even_worse', render: angleF(['mara_017_even_worse']), overlay: rec(41), art: {kind: 'reuse', reuse: 're_01_phone_cam', talk: ['mara_017_even_worse'], move: {z0: 1.06, z1: 1.1}}},
			// "A soft dragging sound."
			{
				id: 're_04_gap',
				at: 'mara_018_dragging',
				render: ({f, d}) => <InCloset f={f} d={d} view="gap" />,
				art: {kind: 'still', loc: 'closet', mood: MOOD.closet, prompt: 'Very low and close: the gap beneath the closet door, a thin strip of pale light from the hallway; no shadow in it. The floor and the bottom of the white door in darkness.', dark: true},
			},
			// "Like someone tracing a finger over paper." (F2, crying)
			{
				id: 're_05_phone_cry',
				at: 'mara_019_finger_paper',
				render: angleF2(['mara_019_finger_paper']),
				overlay: rec(41),
				art: {kind: 'talk', chars: ['mara'], loc: 'closet', mood: MOOD.closet, prompt: 'Through her phone\'s front camera, close: Mara crying silently, tears on her cheeks, whispering, face lit by the phone, darkness around. Mouth closed.', talk: ['mara_019_finger_paper']},
			},
			// "I've been watching the gap beneath the closet door." / "There hasn't been a shadow."
			{id: 're_06_gap2', at: 'mara_020_gap', render: ({f, d}) => <InCloset f={f} d={d} view="gap" />, art: {kind: 'reuse', reuse: 're_04_gap', move: {z0: 1.04, z1: 1.1}}},
			{id: 're_07_gap3', at: 'mara_021_no_shadow', render: ({f, d}) => <InCloset f={f} d={d} view="gap" />, art: {kind: 'reuse', reuse: 're_04_gap', move: {z0: 1.25, z1: 1.32, y0: 0.72, y1: 0.72}}},
			// "Not once."
			{id: 're_08_not_once', at: 'mara_022_not_once', render: angleF2(['mara_022_not_once']), overlay: rec(41), art: {kind: 'reuse', reuse: 're_05_phone_cry', talk: ['mara_022_not_once'], move: {z0: 1.08, z1: 1.1}}},
			// "I think I finally understand why."
			{id: 're_09_understand', at: 'mara_023_understand', render: angleE(['mara_023_understand']), art: {kind: 'reuse', reuse: 're_00_closet_wide', talk: ['mara_023_understand'], move: {z0: 1.1, z1: 1.16}}},
			// "When I painted over that man, I didn't destroy him."
			{id: 're_10_didnt_destroy', at: 'mara_024_didnt_destroy', render: angleF2(['mara_024_didnt_destroy']), overlay: rec(41), art: {kind: 'reuse', reuse: 're_05_phone_cry', talk: ['mara_024_didnt_destroy'], move: {z0: 1.1, z1: 1.14}}},
			// "I changed his color."
			{id: 're_11_color', at: 'mara_025_changed_color', render: angleF(['mara_025_changed_color']), overlay: rec(41), art: {kind: 'reuse', reuse: 're_01_phone_cam', talk: ['mara_025_changed_color'], move: {z0: 1.12, z1: 1.16}}},
			// "I made him invisible against anything white."
			{
				id: 're_12_white_walls',
				at: 'mara_026_invisible',
				render: ({f, d}) => (
					<Stage f={f} d={d} from={{z: 1.0}} to={{z: 1.04}}>
						<ClosetSet view="top">
							<Mara x={960} y={640} s={0.42} expr="afraid" armR={[-25, 150]} armL={[30, -110]} legL={[172, -172]} legR={[-172, 172]} thighK={1.15} kneesUp phoneIn="R" light={PH} />
						</ClosetSet>
					</Stage>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'closet', mood: MOOD.closet, prompt: 'High angle looking down into the tiny closet: Mara small on the floor, hugging her knees, lit by her phone, surrounded on every side by blank white walls that disappear into the dark.'},
			},
			// "And nearly every wall in this apartment is white."
			{id: 're_13_every_wall', at: 'mara_027_every_wall', render: angleE(['mara_027_every_wall']), art: {kind: 'reuse', reuse: 're_00_closet_wide', talk: ['mara_027_every_wall'], move: {z0: 1.16, z1: 1.22}}},
			// four seconds of silence - the gap under the door
			{id: 're_14_silence', at: 'closet_silence', render: ({f, d}) => <InCloset f={f} d={d} view="gap" />, art: {kind: 'reuse', reuse: 're_04_gap', move: {z0: 1.12, z1: 1.14}}},
			// "There's something touching the closet door."
			{
				id: 're_15_door_touch',
				at: 'mara_028_touching_door',
				render: ({f, d}) => <InCloset f={f} d={d} view="door" dent={f / Math.max(1, d) < 0.5 ? 0 : 0.6} />,
				art: {
					kind: 'action',
					keys: 2,
					loc: 'closet',
					mood: MOOD.closet,
					prompt: 'The inside of the white closet door in the dark. Keyframe 1: the door, still. Keyframe 2: a tiny indentation has appeared in the white surface near the handle, as if something is pressing gently from the other side.',
					dark: true,
				},
			},
		]}
	/>
);

export const LastSelection: React.FC = () => (
	<Shots
		shots={[
			// "There's a face."
			{
				id: 'ls_00_face_door',
				at: 'mara_029_a_face',
				render: ({f, d}) => <InCloset f={f} d={d} view="door" face={0.7} />,
				art: {
					kind: 'still',
					chars: ['figure'],
					loc: 'closet',
					mood: MOOD.closet,
					prompt: 'Close on the white closet door from inside: the faint relief of a face pressing into the door from the other side, white on white - the curve of a brow, two hollow eye shapes, a nose, a closed mouth - visible only by the thinnest shadows. No colour, no features drawn on the surface.',
				},
			},
			// "I can see it now." (F3, terrified)
			{
				id: 'ls_01_phone_terror',
				at: 'mara_030_see_it_now',
				render: angleF3(['mara_030_see_it_now']),
				overlay: rec(78),
				art: {kind: 'talk', chars: ['mara'], loc: 'closet', mood: MOOD.closet, prompt: 'Through her phone\'s front camera: Mara\'s face, eyes fixed past the phone on the door, pure terror, tears, trembling, lit by the phone. Mouth closed.', talk: ['mara_030_see_it_now']},
			},
			// "It's pressed against the other side."
			{id: 'ls_02_face_closer', at: 'mara_031_pressed', render: ({f, d}) => <InCloset f={f} d={d} view="door" face={0.7} />, art: {kind: 'reuse', reuse: 'ls_00_face_door', move: {z0: 1.2, z1: 1.32, x0: 0.5, y0: 0.42}}},
			// "But it's not coming through."
			{id: 'ls_03_not_through', at: 'mara_032_not_coming_through', render: angleF3(['mara_032_not_coming_through']), overlay: rec(78), art: {kind: 'reuse', reuse: 'ls_01_phone_terror', talk: ['mara_032_not_coming_through'], move: {z0: 1.06, z1: 1.1}}},
			// "It's just... looking at me."
			{
				id: 'ls_04_eyes',
				at: 'mara_033_looking_at_me',
				render: ({f, d}) => (
					<InCloset f={f} d={d} view="face">
						<MaraBust r={540} cx={960} cy={600} expr="terrified" light={PH} />
					</InCloset>
				),
				art: {kind: 'still', chars: ['mara'], loc: 'closet', mood: MOOD.closet, prompt: 'Extreme close-up of Mara\'s eyes in the phone light, frozen, wet, unable to look away from the door.'},
			},
			// the white surface bulges inward
			{
				id: 'ls_05_bulge',
				at: 'bulge',
				render: ({f, d}) => <InCloset f={f} d={d} view="door" bulge={0.8} />,
				art: {kind: 'still', loc: 'closet', fx: 'tremble', mood: MOOD.closet, noPeople: true, prompt: 'Close on the white closet door from inside, filling the frame: the door surface bulges inward towards the camera like stretched paper, a soft rounded swelling in the middle of the door, shadows around its edge. Nothing and nobody else is in the frame - whatever pushes is on the other side of the door, unseen.'},
			},
			// "Wait."
			{id: 'ls_06_wait', at: 'mara_034_wait', render: angleF3(['mara_034_wait']), overlay: rec(78), art: {kind: 'reuse', reuse: 'ls_01_phone_terror', talk: ['mara_034_wait'], move: {z0: 1.1, z1: 1.12}}},
			// "There are little lines appearing around me." - top-down; code dashes crawl
			{
				id: 'ls_07_top',
				at: 'mara_035_little_lines',
				render: ({f, d}) => (
					<Stage f={f} d={d}>
						<ClosetSet view="top">
							<Mara x={960} y={640} s={0.5} expr="terrified" gaze={[0, 1]} armR={[-25, 150]} armL={[30, -110]} legL={[172, -172]} legR={[-172, 172]} thighK={1.15} kneesUp phoneIn="R" light={PH} />
						</ClosetSet>
					</Stage>
				),
				overlay: ({f, d}) => <CrawlingDashes f={f} amount={0.25 + 0.2 * prog(f, d)} />,
				art: {kind: 'still', chars: ['mara'], loc: 'closet', mood: MOOD.closet, prompt: 'Straight down from above into the tiny closet: Mara curled on the floor hugging her knees, looking down at the floor around her, lit by her phone; the floor and walls around her in the dark.'},
			},
			// "On the floor." / "On the walls." / "They're moving."
			{id: 'ls_08_floor', at: 'mara_036_floor', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f}) => <CrawlingDashes f={f} amount={0.5} />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.05, z1: 1.08}}},
			{id: 'ls_09_walls', at: 'mara_037_walls', render: angleE([]), overlay: ({f}) => <CrawlingDashes f={f} amount={0.7} seed={3} />, art: {kind: 'reuse', reuse: 're_00_closet_wide', move: {z0: 1.0, z1: 1.04}}},
			{id: 'ls_10_moving', at: 'mara_038_moving', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f}) => <CrawlingDashes f={f} amount={1} seed={5} />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.08, z1: 1.1}}},
			// "Like..." / "Like a selection box."
			{id: 'ls_11_like', at: 'mara_039_like', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f, d}) => <MarchingAnts f={f} box={TOP_BOX} segments={prog(f, d)} />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.1, z1: 1.1}}},
			{id: 'ls_12_selection_box', at: 'mara_040_selection_box', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f}) => <MarchingAnts f={f} box={TOP_BOX} handles />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.1, z1: 1.04}}},
			// "Oh no."
			{
				id: 'ls_13_oh_no',
				at: 'mara_041_oh_no',
				render: angleF3(['mara_041_oh_no']),
				overlay: ({f}) => <MarchingAnts f={f} box={[60, 60, 1860, 1020]} />,
				art: {kind: 'reuse', reuse: 'ls_01_phone_terror', talk: ['mara_041_oh_no'], move: {z0: 1.12, z1: 1.16}},
			},
			// "Someone's selecting me."
			{id: 'ls_14_selecting', at: 'mara_042_selecting_me', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f}) => <MarchingAnts f={f} box={TOP_BOX} handles />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.04, z1: 1.14}}},
			// a distant mouse click - the handles flash
			{id: 'ls_15_click', at: 'click_far', render: ({f, d}) => <InCloset f={f} d={d} view="top" />, overlay: ({f}) => <MarchingAnts f={f} box={TOP_BOX} handles opacity={f % 6 < 3 ? 1 : 0.4} />, art: {kind: 'reuse', reuse: 'ls_07_top', move: {z0: 1.14, z1: 1.16}}},
			// "I'm not the one drawing anymore." (F4, barely audible, looking up)
			{
				id: 'ls_16_not_drawing',
				at: 'mara_043_not_drawing',
				render: angleF4(['mara_043_not_drawing']),
				overlay: ({f}) => <MarchingAnts f={f} box={[60, 60, 1860, 1020]} handles />,
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'closet',
					mood: MOOD.closet,
					prompt: 'Close-up: Mara lifts her eyes slowly towards the dark ceiling above her, resigned, hollow, tears drying, lit from below by her phone. Mouth closed.',
					talk: ['mara_043_not_drawing'],
				},
			},
			// a huge white cursor glides over the dark closet wall and stops above her
			{
				id: 'ls_17_cursor',
				at: 'cursor',
				render: angleE([]),
				overlay: ({f, d}) => {
					const t = prog(f, d, 0, 0.8);
					return <BigCursor x={1700 - 760 * t} y={-200 + 330 * t} press={f > d - 4 ? 1 : 0} />;
				},
				art: {kind: 'reuse', reuse: 're_00_closet_wide', move: {z0: 1.0, z1: 1.04}},
			},
			// one final click - cut to pure white
			{id: 'ls_18_white', at: 'final_click', render: () => <White />},
		]}
	/>
);

export const End: React.FC = () => <White />;
