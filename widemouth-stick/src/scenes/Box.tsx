// 5. THE BOX - "I'm going to teach you how to juggle." A box full of knives.
import React from 'react';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

const WM_TALK = ['widemouth_001_call_me', 'widemouth_002_friend', 'widemouth_003_other_friends', 'widemouth_004_good', 'widemouth_006_secret_game', 'widemouth_008_juggle'];

export const Box: React.FC = () => (
	<Shots
		shots={[
			// "The next morning, he came back with a little cardboard box."
			shot('b_01_box', 'narrator_042_cardboard_box', 'bedroom', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.morning,
				prompt: 'Morning: MR. WIDEMOUTH on the floorboards beside the bed, pushing a small closed cardboard box across the floor toward the bed with both little hands, looking up toward the bed with his sweet ear-to-ear smile. Pale gold sun on the floor.',
				move: push(1.02, 1.1, 0.4, 0.65),
			}, {cam: {z: 2.0, cx: 620, cy: 760}, kids: <>
				<WideFig x={560} y={960} h={220} facing="right" />
				<rect x={680} y={850} width={160} height={110} fill="#b88b55" />
			</>}),
			// "I'm going to teach you how to juggle."
			again('b_02_juggle', 'widemouth_008_juggle', 'u_02_wm', {talk: WM_TALK, move: push(1.04, 1.1, 0.5, 0.45), grade: 1.08}),
			// "I looked inside."
			again('b_03_look', 'narrator_043_looked_inside', 'u_01_lean', {move: push(1.08, 1.16, 0.5, 0.36)}),
			// "It was full of knives."
			close('b_04_knives', 'narrator_044_knives', {
				noPeople: true,
				quality: 'high',
				mood: 'Pale morning light falling into an open cardboard box on a wooden floor.',
				prompt: 'Looking straight down into an open, small cardboard box on the floorboards: it is filled with a jumble of clean kitchen knives of every size - bread knives, steak knives, paring knives, a cleaver - wooden and black handles crossed every which way, the clean blades catching the light. Nothing else. No blood, no people.',
				move: push(1.06, 1.16, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#6b4a2b" />
				<rect x={460} y={160} width={1000} height={760} fill="#b88b55" />
				<rect x={520} y={220} width={880} height={640} fill="#3a2a1c" />
				<line x1={600} y1={300} x2={1300} y2={760} stroke="#d8dde2" strokeWidth={30} />
				<line x1={1300} y1={300} x2={640} y2={780} stroke="#d8dde2" strokeWidth={24} />
			</>),
			// "I can't! My mom will kill me!"
			close('b_05_scared', 'eli_005_mom_kill_me', {
				chars: ['eli'],
				loc: 'bedroom',
				quality: 'high',
				mood: MOOD.morning,
				prompt: 'Close-up: little ELI pressed back against his pillow, clutching the quilt up to his chest with both hands, eyes wide with fright, whispering frantically, shaking his head. Morning sun on the wall behind him.',
				fx: 'tremble',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#7a6048" />
				<Person who="eli" x={960} y={1800} h={1600} facing="front" />
			</>),
			// "It's more fun with these."
			close('b_06_flat', 'widemouth_009_more_fun', {
				chars: ['widemouth'],
				loc: 'bedroom',
				quality: 'high',
				mood: MOOD.morning,
				prompt: 'MR. WIDEMOUTH beside the bed, seen from the pillow: he holds up one kitchen knife by its wooden handle like a juggling pin, the clean blade pointing at the ceiling, and his face is completely FLAT - no smile at all, the long mouth a straight line, the black eyes staring. The open box at his feet. No blood.',
				move: push(1.03, 1.12, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#7a6048" />
				<WideFig x={960} y={1180} h={900} />
				<rect x={1270} y={300} width={30} height={300} fill="#d8dde2" />
			</>),
			// "When I pushed the box away, the smile was gone."
			again('b_07_gone', 'narrator_045_smile_gone', 'b_06_flat', {move: push(1.12, 1.24, 0.48, 0.4)}),
			// "He took his knives and slid back under my bed."
			shot('b_08_drag', 'narrator_046_slid_back', 'bedroom', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Low by the floor: the small cardboard box being dragged into the black gap under the bed, half of it already gone behind the lifted white bed skirt, scrape marks in the dust on the floorboards. No creature visible, only the box disappearing into the dark.',
				move: push(1.02, 1.1, 0.42, 0.72),
			}, {cam: {z: 2.4, cx: 520, cy: 780}, kids: <rect x={480} y={820} width={160} height={100} fill="#b88b55" />}),
			// "That was the night I started wondering how much of his time he spent down there."
			again('b_09_wonder', 'narrator_047_wondering', 'h_04_listen', {move: push(1.16, 1.26, 0.28, 0.42)}),
			// "Right underneath me."
			close('b_10_under', 'narrator_048_underneath', {
				chars: ['eli', 'widemouth'],
				loc: 'bedroom',
				quality: 'high',
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'A night cross-section view at floor level: the bed seen side-on, little ELI asleep on top under the quilt in cold moonlight - and BELOW, in the pitch-black space under the bed, MR. WIDEMOUTH lies on his back among the dust, wide awake, his two glossy black eyes open and staring straight up at the mattress, a thin line of moonlight across his long closed smile. The box of knives beside him in the dark. Creepy, still, not gory.',
				move: push(1.02, 1.14, 0.5, 0.66),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#0b0f1a" />
				<rect x={200} y={360} width={1500} height={120} fill="#2a3a5a" />
				<rect x={200} y={480} width={1500} height={40} fill="#3a2a1c" />
				<rect x={240} y={520} width={1420} height={340} fill="#050507" />
				<ellipse cx={960} cy={760} rx={220} ry={80} fill="#3a3a3a" />
			</>),
			again('b_11_dark', 'under', 'b_10_under', {move: push(1.14, 1.24, 0.5, 0.72), grade: 0.85}),
		]}
	/>
);
