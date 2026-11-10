// 6. THE NIGHTS - the grin at the edge of the mattress, the whispering until dawn, waking at the
// open window. "Almost."
import React from 'react';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const Nights: React.FC = () => (
	<Shots
		shots={[
			// "After that, he woke me up at night."
			close('n_01_wake', 'narrator_049_woke_me', {
				chars: ['eli'],
				loc: 'bedroom',
				quality: 'high',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'Close-up at night: little ELI asleep on his pillow, seen from the side, his eyes CLOSED, the quilt up to his chin, cold blue moonlight across his face.',
				variants: [{name: 'open', prompt: 'His eyes are now OPEN wide, staring sideways toward the edge of the mattress, frightened. Everything else stays identical.'}],
				seq: [
					['base', 0],
					['open', 0.55],
				],
				move: push(1.7, 1.85, 0.3, 0.33), // tight on his face so the eyes opening read
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#0f1626" />
				<ellipse cx={960} cy={760} rx={900} ry={240} fill="#c8ccd4" />
				<circle cx={900} cy={560} r={220} fill="#efcfb4" />
			</>),
			// "...that wide grin would be right at the edge of my mattress."
			close('n_02_grin', 'narrator_050_grin', {
				kind: 'talk',
				chars: ['widemouth'],
				loc: 'bedroom',
				quality: 'high',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'In the dark, at the very edge of the mattress, seen from Eli\'s pillow: only the upper half of MR. WIDEMOUTH\'s round head rises above the quilt edge - two huge glossy black eyes catching the moonlight and an enormous ear-to-ear GRIN, inches away. Everything else is blue-black shadow.',
				talk: ['widemouth_010_real_trampoline'],
				move: push(1.03, 1.12, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#070a12" />
				<WideFig x={960} y={1300} h={1100} mouth="grin" />
				<rect x={0} y={880} width={1920} height={200} fill="#2a3a5a" />
			</>),
			// "I put a real trampoline under the window..."
			again('n_03_whisper', 'widemouth_010_real_trampoline', 'n_02_grin', {talk: ['widemouth_010_real_trampoline'], move: push(1.12, 1.2, 0.5, 0.5)}),
			// "I'd tell him no and squeeze my eyes shut."
			close('n_04_shut', 'narrator_051_squeeze', {
				chars: ['eli'],
				loc: 'bedroom',
				quality: 'high',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'Close-up at night: little ELI with the quilt pulled up over his nose, his eyes SQUEEZED tightly shut, brows knotted, small fingers gripping the quilt edge. Cold blue moonlight.',
				fx: 'tremble',
				move: push(1.04, 1.1, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#0f1626" />
				<circle cx={960} cy={480} r={300} fill="#efcfb4" />
				<rect x={0} y={560} width={1920} height={520} fill="#9a6a5a" />
			</>),
			// "But he didn't leave."
			again('n_05_stay', 'narrator_052_didnt_leave', 'n_02_grin', {move: push(1.0, 1.06, 0.5, 0.5), grade: 0.85}),
			// "He'd stay there, whispering about the window, until the sky outside turned grey."
			shot('n_06_dawn', 'narrator_053_until_grey', 'bedroom', {
				noPeople: true,
				quality: 'medium',
				mood: 'Just before dawn: the window turning a cold pale grey, the room still dark blue.',
				prompt: 'Eli\'s bedroom window just before dawn: the sky outside turning cold pale grey behind the thin curtains, the stacked boxes and the room still in dark blue shadow. No people.',
				move: push(1.0, 1.08, 0.75, 0.3),
			}, {cam: {z: 1.8, cx: 1400, cy: 340}}),
			// "He wasn't fun anymore."
			again('n_07_notfun', 'narrator_054_not_fun', 'n_04_shut', {move: push(1.1, 1.16, 0.5, 0.42)}),
			// the dark bedroom - "Then, one night, I woke up cold." / "I wasn't in my bed."
			shot('n_08_empty_bed', 'night_room', 'bedroom', {
				noPeople: true,
				quality: 'medium',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'Eli\'s bedroom at night: the bed is EMPTY, the quilt thrown back, the pillow dented, the thin curtains lifting in a cold draught. Cold blue moonlight. No people.',
				move: push(1.0, 1.1, 0.3, 0.45),
			}, {cam: {z: 1.4, cx: 600, cy: 520}}),
			again('n_09_not_in_bed', 'narrator_056_not_in_bed', 'n_08_empty_bed', {move: push(1.1, 1.2, 0.25, 0.45)}),
			// "I was standing in the empty room at the end of the hall. The window was wide open..."
			shot('n_10_sill', 'narrator_057_sill', 'emptyroom', {
				chars: ['eli'],
				quality: 'high',
				dark: true,
				mood: MOOD.emptyNight,
				prompt: 'The empty room at night, seen from the doorway behind him: little ELI in striped pyjamas stands at the WIDE-OPEN tall window with his back to us, his small hands at his sides, his bare feet right at the low windowsill, the night wind lifting his hair and the edges of his pyjamas. Black sky and cold moonlight beyond the window. He is perfectly still.',
				move: push(1.0, 1.12, 0.5, 0.45),
			}, {kids: <Person who="eli" x={950} y={700} h={300} facing="back" />}),
			// "I don't know how I got there."
			close('n_11_toes', 'narrator_058_dont_know', {
				chars: ['eli'],
				loc: 'emptyroom',
				quality: 'medium',
				dark: true,
				mood: MOOD.emptyNight,
				prompt: 'Close-up at floor level by the open window at night: a little boy\'s bare feet and the hems of striped pyjama trousers standing on the bare floorboards right at the low wooden windowsill, the toes curled tight against the cold. Beyond the sill only black night air. Cold moonlight.',
				move: push(1.03, 1.1, 0.5, 0.6),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#0b0f1a" />
				<rect x={0} y={700} width={1920} height={380} fill="#3a2a1c" />
				<rect x={0} y={640} width={1920} height={60} fill="#cfd3d6" />
				<ellipse cx={860} cy={820} rx={90} ry={50} fill="#efcfb4" />
				<ellipse cx={1060} cy={820} rx={90} ry={50} fill="#efcfb4" />
			</>),
			// "Behind me, in the dark, something whispered."
			shot('n_12_behind', 'narrator_059_whispered', 'emptyroom', {
				chars: ['widemouth'],
				quality: 'high',
				dark: true,
				mood: MOOD.emptyNight,
				prompt: 'The empty room at night, looking back from the open window toward the dark doorway on the LEFT: in the black doorway, low to the floor, two glossy black eyes and a long pale ear-to-ear GRIN are faintly visible, the rest of MR. WIDEMOUTH lost in shadow. Moonlight across the bare floor.',
				move: push(1.02, 1.12, 0.22, 0.6),
			}, {kids: <WideFig x={300} y={900} h={220} mouth="grin" />}),
			// "Almost."
			again('n_13_almost', 'widemouth_011_almost', 'n_12_behind', {move: push(1.5, 1.7, 0.2, 0.62), fx: 'pulse'}),
			// "I ran back to my bed and pulled the blanket over my head..."
			shot('n_14_blanket', 'narrator_060_ran_back', 'bedroom', {
				chars: ['eli'],
				quality: 'medium',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'Eli\'s bed at night, seen from the side: little ELI is hiding COMPLETELY under the patchwork quilt, pulled right over his head - the quilt bulges clearly over a small curled-up child-sized body from the pillow to the knees, one small hand clutching its edge from inside, a few strands of light-brown hair at the top. The white bed skirt hangs to the floor below. Cold blue moonlight.',
				fx: 'tremble',
				move: push(1.3, 1.45, 0.42, 0.38),
			}, {cam: {z: 1.6, cx: 520, cy: 560}, kids: <rect x={300} y={450} width={500} height={110} rx={50} fill="#9a6a5a" />}),
		]}
	/>
);
