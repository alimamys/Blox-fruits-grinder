// 3. UNDER THE BED - meeting Mr. Widemouth. Sweet at first; the first lie.
import React from 'react';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';
import {EliInBed} from './House';

const WM_TALK = ['widemouth_001_call_me', 'widemouth_002_friend', 'widemouth_003_other_friends', 'widemouth_004_good', 'widemouth_006_secret_game', 'widemouth_008_juggle'];
const ELI_TALK = ['eli_001_a_toy', 'eli_002_move', 'eli_003_nobody'];

export const UnderBed: React.FC = () => (
	<Shots
		shots={[
			// "I don't remember the first time I saw him. I only remember asking his name."
			close('u_01_lean', 'narrator_021_first_time', {
				chars: ['eli'],
				loc: 'bedroom',
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Little ELI, pale and feverish in striped pyjamas, leans over the edge of his bed on his tummy, looking DOWN at the floor beside the bed with shy curiosity, one hand dangling toward the floorboards. Seen from low by the floor, the quilt edge and white bed skirt in the foreground.',
				move: push(1.02, 1.08, 0.5, 0.4),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#5a4a3a" />
				<rect x={0} y={600} width={1920} height={480} fill="#6b4a2b" />
				<Person who="eli" x={960} y={1000} h={700} facing="front" tilt={-70} />
			</>),
			// "Call me Mr. Widemouth."
			close('u_02_wm', 'widemouth_001_call_me', {
				kind: 'talk',
				chars: ['widemouth'],
				loc: 'bedroom',
				quality: 'high',
				mood: MOOD.sickroom,
				prompt: 'MR. WIDEMOUTH\'s head and shoulders rising above the edge of the mattress, seen from Eli\'s pillow: the huge round ash-grey head, crooked ears (the left one bent), big glossy black eyes, and a sweet closed-mouth smile stretching from ear to ear. He looks straight at the camera, friendly. The patchwork quilt in the foreground, the bedroom wall behind.',
				talk: WM_TALK,
				move: push(1.02, 1.08, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#6b5a48" />
				<WideFig x={960} y={1180} h={900} />
				<rect x={0} y={860} width={1920} height={220} fill="#9a6a5a" />
			</>),
			// "It suited him."
			again('u_03_suited', 'narrator_022_suited', 'u_02_wm', {move: push(1.08, 1.14, 0.5, 0.42)}),
			// "He was about the size of a cat..."
			shot('u_04_size', 'narrator_023_size_of_cat', 'bedroom', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.sickroom,
				prompt: 'MR. WIDEMOUTH standing on the bare floorboards beside the bed in full view, the size of a cat: a small furry ash-grey body, a head far too big and round for it, glossy black eyes, crooked ears, and a closed smile from ear to ear. A picture book lies on the floor beside him for scale. He stands with his little arms at his sides, looking up toward the bed.',
				move: push(1.02, 1.1, 0.45, 0.62),
			}, {cam: {z: 1.9, cx: 600, cy: 700}, kids: <WideFig x={620} y={960} h={260} facing="right" />}),
			// "But his mouth was the biggest thing of all."
			close('u_05_mouth', 'narrator_024_mouth', {
				chars: ['widemouth'],
				loc: 'bedroom',
				quality: 'high',
				mood: MOOD.sickroom,
				prompt: 'Extreme close-up on MR. WIDEMOUTH\'s face: the glossy black eyes at the top of the frame, and the closed, thin-lipped smile stretching across his whole round ash-grey face, almost from one crooked ear to the other. Soft fur, sweet - and a little too wide.',
				variants: [{name: 'wide', prompt: 'His smile now spreads even wider and parts slightly, showing a long row of small, neat, slightly too-many white teeth. Eyes, fur and everything else stay identical.'}],
				seq: [
					['base', 0],
					['wide', 0.55],
				],
				move: push(1.04, 1.14, 0.5, 0.55),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#6b5a48" />
				<WideFig x={960} y={1700} h={2400} />
			</>),
			// "He looked like one of those talking toy pets every kid wanted that year."
			again('u_06_toy', 'narrator_025_toy_pets', 'u_04_size', {move: {z0: 1.1, z1: 1.18, x0: 0.42, y0: 0.6, x1: 0.48, y1: 0.5}}),
			// "Are you a toy?"
			close('u_07_eli', 'eli_001_a_toy', {
				kind: 'talk',
				chars: ['eli'],
				loc: 'bedroom',
				quality: 'high',
				blink: true,
				mood: MOOD.sickroom,
				prompt: 'Medium close-up of little ELI propped up on his pillow in striped pyjamas, pale with fever, leaning slightly toward the edge of the bed, curious and a little shy, talking to someone just out of frame on the RIGHT. Soft grey window light.',
				talk: ELI_TALK,
				move: push(1.02, 1.07, 0.45, 0.42),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#5a4a3a" />
				<Person who="eli" x={860} y={1700} h={1500} facing="right" />
			</>),
			// "Toys can't be your friend. I can." / "Do you have any other friends?"
			again('u_08_friend', 'widemouth_002_friend', 'u_02_wm', {talk: WM_TALK, move: push(1.06, 1.1, 0.5, 0.45)}),
			again('u_09_others', 'widemouth_003_other_friends', 'u_02_wm', {talk: WM_TALK, move: push(1.1, 1.16, 0.5, 0.42)}),
			// "We move too much."
			again('u_10_move', 'eli_002_move', 'u_07_eli', {talk: ELI_TALK, move: push(1.07, 1.12, 0.45, 0.42)}),
			// "Good. Then you have me."
			again('u_11_good', 'widemouth_004_good', 'u_05_mouth', {show: 'wide', move: push(1.14, 1.22, 0.5, 0.58)}),
			// "Whenever my mom came up the stairs, he slid under my bed. Fast."
			shot('u_12_slide', 'narrator_026_slid', 'bedroom', {
				chars: ['widemouth'],
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Low angle by the bed: the white bed skirt swinging hard where something just shot underneath it - only a blur of ash-grey fur and one small foot vanishing into the black gap under the bed. Grey daylight on the floorboards.',
				move: push(1.02, 1.1, 0.4, 0.7),
			}, {cam: {z: 2.2, cx: 560, cy: 760}, kids: <WideFig x={640} y={900} h={160} facing="left" />}),
			// "If your parents see me, they won't let us play anymore."
			again('u_13_whisper', 'widemouth_005_parents', 'h_11_skirt', {show: 'eyes', move: push(1.16, 1.26, 0.45, 0.74)}),
			// "For the first few days, all he wanted to do was look at my books."
			shot('u_14_books', 'narrator_027_books', 'bedroom', {
				chars: ['eli', 'widemouth'],
				quality: 'high',
				mood: MOOD.morning,
				prompt: 'Morning in Eli\'s bedroom: MR. WIDEMOUTH sits on the patchwork quilt at the foot of the bed with a big open picture book in his small lap, completely absorbed in it; little ELI sits up against his pillow watching him, smiling weakly. Pale gold sun through the curtains.',
				move: push(1.02, 1.08, 0.3, 0.45),
			}, {cam: {z: 1.6, cx: 520, cy: 520}, kids: <>
				<EliInBed sit />
				<WideFig x={260} y={600} h={170} facing="right" />
			</>}),
			// "He turned the pages slowly, staring at every picture..."
			close('u_15_pages', 'narrator_028_pages', {
				chars: ['widemouth'],
				loc: 'bedroom',
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Close-up over a big open children\'s picture book lying on a patchwork quilt: a painted illustration of a red barn and a white farmhouse on a hill. Two small ash-grey furry hands with short dark claws hold the edge of the page, about to turn it. No text on the pages.',
				variants: [{name: 'turn', prompt: 'The small furry hand has now lifted the page halfway, curving it up in mid-turn, showing a glimpse of the next painted picture of a dark wood. Everything else stays identical.'}],
				seq: [
					['base', 0],
					['turn', 0.5],
				],
				move: push(1.03, 1.1, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#9a6a5a" />
				<rect x={360} y={240} width={1200} height={640} fill="#efe8d8" />
				<circle cx={420} cy={820} r={70} fill="#8e8c88" />
				<circle cx={1500} cy={820} r={70} fill="#8e8c88" />
			</>),
			// "Once, my mom came in a little too fast. The bed skirt was still swinging..."
			shot('u_16_door', 'narrator_029_too_fast', 'bedroom', {
				chars: ['parents', 'eli'],
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Eli\'s bedroom: MOM has just hurried into the room and stands among the moving boxes on the RIGHT holding a glass of ginger ale, gentle and a little surprised, looking at the bed; the white bed skirt is still swinging. Little ELI sits stiffly against his pillow at the head of the bed. ONLY Mom - Dad is not here.',
				move: push(1.02, 1.1, 0.7, 0.45),
			}, {kids: <>
				<EliInBed sit />
				<Person who="mom" x={1500} y={900} h={620} facing="left" />
			</>}),
			// "Who were you talking to, sweetheart?"
			again('u_17_who', 'mom_001_who', 'u_16_door', {move: push(1.2, 1.32, 0.78, 0.4)}),
			// "Nobody."
			again('u_18_nobody', 'eli_003_nobody', 'u_07_eli', {talk: ELI_TALK, move: push(1.1, 1.16, 0.45, 0.4)}),
			// "It was the first time I ever lied to her. He had asked me to."
			close('u_19_under', 'narrator_030_lied', {
				chars: ['parents', 'widemouth'],
				loc: 'bedroom',
				quality: 'medium',
				dark: true,
				mood: 'The view from under the bed: near-black, a strip of daylight under the hem of the bed skirt.',
				prompt: 'The view from UNDER the bed, looking out: almost total darkness, the underside of the bed slats above, and a narrow bright strip of daylight between the bed skirt hem and the floor, through which we see MOM\'s slippered feet standing by the door. In the dark foreground, the curve of a round furry ash-grey head and one crooked ear in silhouette, watching her.',
				move: push(1.02, 1.08, 0.55, 0.6),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#07070a" />
				<rect x={0} y={620} width={1920} height={140} fill="#9a8a72" />
				<rect x={1260} y={680} width={60} height={70} fill="#e4d8bf" />
				<circle cx={420} cy={760} r={260} fill="#2a2a2a" />
			</>),
			// "Then, one morning, he was waiting for me with a huge smile."
			shot('u_20_waiting', 'narrator_031_huge_smile', 'bedroom', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.morning,
				prompt: 'Morning: MR. WIDEMOUTH sits perfectly upright at the foot of Eli\'s bed on the patchwork quilt, little hands folded, his black eyes shining, his mouth stretched in a HUGE closed smile from ear to ear - waiting. Pale gold sun through the curtains, dust in the light.',
				move: push(1.02, 1.12, 0.32, 0.45),
			}, {cam: {z: 1.9, cx: 460, cy: 560}, kids: <WideFig x={330} y={640} h={200} />}),
			// "I have a new game. A secret game."
			again('u_21_game', 'widemouth_006_secret_game', 'u_02_wm', {talk: WM_TALK, move: push(1.1, 1.18, 0.5, 0.42), grade: 1.08}),
		]}
	/>
);
