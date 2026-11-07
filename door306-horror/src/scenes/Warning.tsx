// 5. THE WARNING - Mara calls Hana (voice only, on the phone).
import React from 'react';
import {EditorShot} from '../components/ui/Editor';
import {CallScreen, PhoneFrame, ThreadScreen} from '../components/ui/Phone';
import type {PicId} from '../layout/pictures';
import {Shots, type ShotProps} from '../utils/scene';
import {mouthOf} from './common';
import {FrontMara, Hall, Room} from './frames';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_man_close'];

// Mara on the phone. A: medium, phone at her right ear; B: close-up; B2: closer, more scared.
const angleA = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<FrontMara f={f} d={d} b={{r: 150, cx: 1120, cy: 560, expr: 'afraid', phoneEar: 'R', mouth: mouthOf(api, sf, ...talk)}} />
);
const angleB = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<FrontMara f={f} d={d} b={{r: 250, cx: 1000, cy: 500, expr: 'afraid', phoneEar: 'R', mouth: mouthOf(api, sf, ...talk)}} />
);
const angleB2 = (talk: string[]) => ({f, d, sf, api}: ShotProps) => (
	<FrontMara f={f} d={d} b={{r: 300, cx: 960, cy: 480, expr: 'terrified', phoneEar: 'R', gaze: [0, 0.05], mouth: mouthOf(api, sf, ...talk)}} />
);

const PHONE_MOOD = 'Dark workroom at night; the monitor\'s cold glow and her phone light her face; the doorway behind her black.';

export const Warning: React.FC = () => (
	<Shots
		shots={[
			// "I called Hana."
			{
				id: 'wa_00_calling',
				at: 'narrator_056_called_hana',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d}>
						<CallScreen f={f} time="2:47" />
					</PhoneFrame>
				),
			},
			// "She'd worked with me on animation projects before..." - angle A (talking frame)
			{
				id: 'wa_01_phone_a',
				at: 'narrator_057_hana_worked',
				render: angleA([]),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'workroom',
					mood: PHONE_MOOD,
					prompt: 'Medium shot from the monitor: Mara holds her phone to her right ear, waiting for an answer, tense and afraid, mouth closed; the open doorway behind her is black.',
					talk: [],
				},
			},
			// HANA: "Mara? It's almost three in the morning."
			{id: 'wa_02_hana_sleepy', at: 'hana_001_three_am', off: -0.2, render: angleA([]), art: {kind: 'reuse', reuse: 'wa_01_phone_a', move: {z0: 1.04, z1: 1.08}}},
			// MARA: "I need you to look at something. I'm sending you a screenshot."
			{id: 'wa_03_mara_need', at: 'mara_001_look_at_something', render: angleA(['mara_001_look_at_something']), art: {kind: 'reuse', reuse: 'wa_01_phone_a', talk: ['mara_001_look_at_something'], move: {z0: 1.08, z1: 1.12}}},
			// notification: the screenshot goes out
			{
				id: 'wa_04_sent',
				at: 'notification',
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d}>
						<ThreadScreen f={f} picture="canvas_man_1m" sent={Math.min(1, f / 8)} delivered={f > 14} />
					</PhoneFrame>
				),
			},
			// HANA: "What's this?"
			{
				id: 'wa_05_typing',
				at: 'hana_002_whats_this',
				off: -0.2,
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d}>
						<ThreadScreen f={f} picture="canvas_man_1m" typing />
					</PhoneFrame>
				),
			},
			// MARA: "Tell me if you can see the man in the hallway." - angle B (talking frame)
			{
				id: 'wa_06_phone_b',
				at: 'mara_002_see_the_man',
				render: angleB(['mara_002_see_the_man']),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'workroom',
					mood: PHONE_MOOD,
					prompt: 'Close-up from the monitor: Mara with the phone pressed to her right ear, eyes fixed on the screen in front of her, frightened, mouth closed. Dark doorway behind her, out of focus.',
					talk: ['mara_002_see_the_man'],
				},
			},
			// HANA: "Yeah. He's creepy. Did you draw him?"
			{id: 'wa_07_hana_creepy', at: 'hana_003_creepy', render: angleB([]), art: {kind: 'reuse', reuse: 'wa_06_phone_b', move: {z0: 1.06, z1: 1.1}}},
			// MARA: "No."
			{id: 'wa_08_no', at: 'mara_003_no', off: -0.1, render: angleB(['mara_003_no']), art: {kind: 'reuse', reuse: 'wa_06_phone_b', talk: ['mara_003_no'], move: {z0: 1.12, z1: 1.16, y0: 0.45, y1: 0.45}}},
			// HANA: "What do you mean, no?" - angle B2 (talking frame)
			{
				id: 'wa_09_phone_b2',
				at: 'hana_004_what_do_you_mean',
				render: angleB2([]),
				art: {
					kind: 'talk',
					chars: ['mara'],
					loc: 'workroom',
					mood: PHONE_MOOD,
					prompt: 'Tighter close-up from the monitor: Mara, phone at her right ear, more scared now - eyes wide and wet, brows pulled up, mouth closed tight. The black doorway is just visible behind her head.',
					talk: [],
				},
			},
			// MARA: "He wasn't there before. And every time I play the animation, he gets closer."
			{id: 'wa_10_gets_closer', at: 'mara_004_gets_closer', render: angleB2(['mara_004_gets_closer']), art: {kind: 'reuse', reuse: 'wa_09_phone_b2', talk: ['mara_004_gets_closer'], move: {z0: 1.04, z1: 1.1}}},
			// silence on the line: the monitor across the dark room, the man on it
			{
				id: 'wa_11_monitor_across',
				at: 'silence_call',
				render: ({f, d}) => <Room f={f} d={d} view="monitorAcross" screen="canvas_man_close" />,
				art: {
					kind: 'still',
					chars: ['figure'],
					loc: 'workroom',
					mood: 'Almost black room; the monitor the only light, casting a cold glow on the desk.',
					prompt: 'Across the dark room: the monitor glows on the desk, showing the painted hallway with the tall dark man standing close, head bent. Rain on the dark window to the side. Nobody in the room.',
					dark: true,
				},
			},
			// HANA (serious): "Okay. Stop playing it. Close the program."
			{id: 'wa_12_hana_serious', at: 'hana_005_stop_playing', render: angleB2([]), art: {kind: 'reuse', reuse: 'wa_09_phone_b2', move: {z0: 1.1, z1: 1.14}}},
			// MARA: "I already tried. It keeps reopening the same frame."
			{
				id: 'wa_13_reopen',
				at: 'mara_005_reopening',
				render: ({f, d}) => <EditorShot f={f} d={d} total={240} strip={STRIP} picture="canvas_man_close" frame={240} reopen={Math.min(2, (f / Math.max(1, d - 1)) * 2.4)} push={[1.0, 1.04]} />,
			},
			// HANA: "Then turn the computer off. And get out of that apartment."
			{
				id: 'wa_14_turn_to_hall',
				at: 'hana_006_get_out',
				render: ({f, d}) => <FrontMara f={f} d={d} b={{r: 170, cx: 1140, cy: 560, expr: 'terrified', phoneEar: 'R', yaw: -0.65, gaze: [-1, 0]}} />,
				art: {
					kind: 'still',
					chars: ['mara'],
					loc: 'workroom',
					mood: PHONE_MOOD,
					prompt: 'From the monitor: Mara, phone still at her ear, turns her head to look back over her shoulder at the black doorway behind her, terrified, listening.',
				},
			},
			// AUDIO CUE: the scratching again, louder - low along the hallway floor
			{
				id: 'wa_15_hall_floor',
				at: 'scratch_2',
				render: ({f, d}) => <Hall f={f} d={d} h={{light: 'night'}} from={{z: 1.7, cx: 960, cy: 820}} />,
				art: {
					kind: 'still',
					loc: 'hallway',
					fx: 'tremble',
					mood: 'Near darkness, cold blue moonlight along the floor.',
					prompt: 'Low angle along the dark hallway floor at night: the carpet runner leading away to the closed bedroom door at the far end. Empty. Deep shadow.',
					dark: true,
				},
			},
		]}
	/>
);
