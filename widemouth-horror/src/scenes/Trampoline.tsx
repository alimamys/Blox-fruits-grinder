// 4. TRAMPOLINE - the empty room at the end of the hall, the open window, the long drop. The snarl.
import React from 'react';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const Trampoline: React.FC = () => (
	<Shots
		shots={[
			// "...he tugged my hand and led me down the hall, to the room at the very end."
			shot('t_01_hall', 'narrator_032_hall', 'hallway', {
				chars: ['eli', 'widemouth'],
				quality: 'high',
				mood: MOOD.hallDay,
				prompt: 'The long upstairs hallway seen from behind: little ELI in striped pyjamas and socks walks away from the camera down the hall, being led by the hand by MR. WIDEMOUTH, the small ash-grey creature walking ahead of him and tugging his fingers, toward the half-open door at the far end with grey light behind it. Dim, brown, quiet.',
				move: push(1.0, 1.1, 0.5, 0.5),
			}, {kids: <>
				<Person who="eli" x={900} y={860} h={300} facing="back" />
				<WideFig x={1010} y={860} h={110} facing="back" />
			</>}),
			// "I wasn't allowed out of bed. He kept tugging until I went anyway."
			close('t_02_tug', 'narrator_033_not_allowed', {
				chars: ['eli', 'widemouth'],
				loc: 'hallway',
				quality: 'medium',
				mood: MOOD.hallDay,
				prompt: 'Close-up at knee height in the dim hallway: a small ash-grey furry hand with short dark claws firmly gripping two of little Eli\'s fingers and pulling, Eli\'s striped pyjama sleeve and his socked feet half a step behind, hesitating. Worn floor runner below.',
				move: {z0: 1.06, z1: 1.1, x0: 0.45, y0: 0.5, x1: 0.55, y1: 0.5},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#4a3a2c" />
				<rect x={300} y={300} width={600} height={140} fill="#7f9cc0" />
				<circle cx={980} cy={380} r={80} fill="#efcfb4" />
				<ellipse cx={1250} cy={420} rx={260} ry={110} fill="#8e8c88" />
			</>),
			// "The room was completely empty. Bare floorboards. No furniture. Just one window."
			shot('t_03_room', 'narrator_034_room_empty', 'emptyroom', {
				chars: ['eli'],
				quality: 'medium',
				mood: MOOD.emptyDay,
				prompt: 'The empty room at the end of the hall: bare dusty floorboards, peeling wallpaper, no furniture at all, a single tall window in the far wall full of white sky. Little ELI in striped pyjamas stands just inside the doorway on the LEFT, small in the big bare room.',
				move: push(1.0, 1.08, 0.5, 0.45),
			}, {kids: <Person who="eli" x={520} y={960} h={360} facing="right" />}),
			// "He ran across the room and pushed it wide open."
			shot('t_04_window', 'narrator_035_pushed_open', 'emptyroom', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.emptyDay,
				prompt: 'MR. WIDEMOUTH stands on the windowsill of the tall window in the empty room, seen from behind, his little arms pushing up the bottom sash; the window is still closed, white sky and the hillside beyond the glass.',
				variants: [{name: 'open', prompt: 'The bottom sash is now pushed all the way up - the window is WIDE OPEN, wind blowing in and lifting the dust, the ash-grey fur ruffling. Everything else stays identical.'}],
				seq: [
					['base', 0],
					['open', 0.42],
				],
				move: push(1.02, 1.12, 0.5, 0.35),
			}, {cam: {z: 1.7, cx: 960, cy: 420}, kids: <WideFig x={950} y={560} h={200} facing="back" />}),
			// "The house sat on a hill, so the ground below that window was a long, long way down."
			close('t_05_drop', 'narrator_036_long_way', {
				loc: 'farmhouse',
				noPeople: true,
				quality: 'medium',
				mood: MOOD.grey,
				prompt: 'Looking straight DOWN from a high open window: the white clapboard wall of the farmhouse falling away below the windowsill, and far, far below, the steep rocky hillside dropping away, grey stones and dry grass. Dizzying height. No people.',
				move: {z0: 1.0, z1: 1.18, x0: 0.5, y0: 0.6, x1: 0.5, y1: 0.75},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#5a6a4a" />
				<rect x={0} y={0} width={1920} height={140} fill="#e8e6df" />
				<polygon points="0,140 1920,140 1400,1080 520,1080" fill="#cfd3d6" />
			</>),
			// "Here's how you play..."
			shot('t_06_play', 'widemouth_007_how_to_play', 'emptyroom', {
				kind: 'talk',
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.emptyDay,
				prompt: 'MR. WIDEMOUTH stands on the sill of the WIDE-OPEN window in the empty room, turned around to face the camera, his small arms spread out in invitation, his black eyes shining and his ear-to-ear smile sweet and eager, the white sky and the long drop behind him. Wind ruffles his ash-grey fur.',
				talk: ['widemouth_007_how_to_play'],
				move: push(1.06, 1.16, 0.5, 0.35),
			}, {cam: {z: 2.0, cx: 960, cy: 400}, kids: <WideFig x={950} y={560} h={220} />}),
			// "I was five. I had a fever. For one second, I could almost see it."
			close('t_07_dream', 'narrator_037_almost_see', {
				loc: 'farmhouse',
				noPeople: true,
				quality: 'medium',
				mood: 'A hazy, overexposed fever-dream light, soft and glowing at the edges.',
				prompt: 'A fever-dream vision looking down from the high window: far below on the grassy hillside, a big round soft blue trampoline glows softly in the grass, hazy and too bright, like something half-imagined, the edges of the picture blurred and glowing. No people.',
				fx: 'pulse',
				move: push(1.04, 1.12, 0.5, 0.7),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#7a8a6a" />
				<ellipse cx={960} cy={760} rx={300} ry={110} fill="#3a6aa8" />
			</>),
			// "It's really far down. Maybe another time."
			again('t_08_far', 'eli_004_far_down', 't_03_room', {move: push(1.3, 1.42, 0.28, 0.62)}),
			// "His face changed." / "His lips peeled back..."
			close('t_09_face', 'narrator_038_face_changed', {
				chars: ['widemouth'],
				loc: 'emptyroom',
				quality: 'high',
				mood: MOOD.emptyDay,
				prompt: 'Close-up of MR. WIDEMOUTH\'s face against the bright open window: the sweet smile has gone completely flat, his black eyes fixed and cold, the fur on his round head bristling slightly. Backlit by white sky.',
				variants: [
					{name: 'snarl', prompt: 'He now SNARLS: his lips peeled far back over the enormous ear-to-ear mouth, showing rows of small sharp teeth, the black eyes narrowed, ears flattened. Creepy, not gory. Everything else stays identical.'},
					{name: 'sad', prompt: 'The snarl is gone: his mouth is closed in a small drooping line, the crooked ears hang down, the black eyes look down and away - disappointed, sulking. Everything else stays identical.'},
				],
				seq: [
					['base', 0],
					['snarl', 0.32],
				],
				move: push(1.04, 1.14, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#d8dcdf" />
				<WideFig x={960} y={1700} h={2400} mouth="snarl" />
			</>),
			// "Then it was gone. He just looked... disappointed."
			again('t_10_sad', 'narrator_040_disappointed', 't_09_face', {show: 'sad', move: push(1.1, 1.06, 0.5, 0.5)}),
			// "He spent the rest of the day under my bed, without making a sound."
			again('t_11_quiet', 'narrator_041_rest_of_day', 'h_11_skirt', {move: push(1.0, 1.08, 0.45, 0.68), grade: 0.82}),
		]}
	/>
);
