// 6. THE CREATURE - it climbs into the light.
import React from 'react';
import {CreatureFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {BackCrowd} from './Doors';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const Creature: React.FC = () => (
	<Shots
		shots={[
			again('f_00_peephole', 'narrator_101_back_to_peephole', 'd_06_eye_peephole', {move: push(1.06, 1.14, 0.55, 0.45), blink: true}),
			// "The lights above the staircase began flickering." - through the peephole, the stair end
			shot('f_01_stair_end', 'narrator_102_flickering', 'hallway_cross', {
				noPeople: true,
				quality: 'medium',
				peephole: true,
				fx: 'flicker',
				mood: MOOD.hallDark,
				prompt: 'The left end of the corridor where the stairwell opens, the black metal railing going down into darkness; the fluorescent tube above the stairs flickering, half the corridor in deep shadow. Nobody visible.',
				move: push(1.02, 1.1, 0.45, 0.5),
			}, {cam: {z: 1.8, cx: 560, cy: 470}}),
			// "Then I saw something moving in the darkness."
			again('f_02_moving', 'narrator_103_moving_darkness', 'f_01_stair_end', {fx: 'flicker', move: push(1.1, 1.22, 0.45, 0.55)}),
			// "At first, it looked like a man's hand gripping the railing." / too long / curled
			again('f_03_hand', 'narrator_104_mans_hand', 'd_18_fingers', {show: 'f1', fx: 'flicker', move: push(1.02, 1.12)}),
			again('f_04_too_long', 'narrator_105_too_long', 'd_18_fingers', {show: 'f1', move: push(1.25, 1.35, 0.62, 0.42)}),
			again('f_05_curled', 'narrator_106_curled', 'd_18_fingers', {seq: [['f1', 0], ['f2', 0.45]], move: push(1.15, 1.22, 0.6, 0.45)}),
			again('f_06_grip', 'fingers_curl', 'd_18_fingers', {show: 'f2', fx: 'flicker', move: push(1.3, 1.4, 0.62, 0.42)}),
			// "Then a head appeared." - rising above the top step (through the peephole)
			close('f_07_head', 'narrator_107_head_appeared', {
				chars: ['creature'],
				loc: 'stairwell',
				quality: 'high',
				mood: MOOD.hallDark,
				prompt: 'Close-up at the top of the dark stairwell in a burst of flickering light: beside the black metal railing, just above the edge of the top concrete step, the crown of the creature\'s grey, bony head with sparse lank dark hair is rising into view, bent forward at an impossible angle. Only the top of the head is visible.',
				variants: [{name: 'up', prompt: 'The creature\'s head and bony grey shoulders have now risen above the top step, the head bent forward and sideways at an impossible angle, one small sunken pale eye catching the light. Nothing else changes.'}],
				seq: [
					['base', 0],
					['up', 0.6],
				],
				fx: 'flicker',
				grade: 1.4,
				move: push(1.03, 1.1, 0.5, 0.55),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#1d2620" />
				<rect x={0} y={760} width={1920} height={320} fill="#3a3f3a" />
				<path d="M1300,300 L1300,1080 M1600,300 L1600,1080 M1100,300 L1900,300" stroke="#4a514a" strokeWidth={26} />
				<ellipse cx={800} cy={770} rx={150} ry={70} fill="#8d8f8a" />
			</>),
			// "It was bent forward at an impossible angle."
			again('f_08_bent', 'narrator_108_bent_forward', 'f_07_head', {show: 'up', grade: 1.4, move: push(1.15, 1.32, 0.45, 0.72)}),
			// "The thing had to be nearly seven feet tall." - the full figure at the end of the corridor, beyond the frozen neighbours
			shot('f_09_full', 'narrator_109_seven_feet', 'hallway', {
				chars: ['creature', 'mother', 'residents'],
				quality: 'high',
				mood: MOOD.hallDark,
				prompt: 'The long corridor from the window end: the residents stand frozen with their backs to us; at the far end, in the stairwell opening, the creature stands at its full height - nearly seven feet, hunched, its bent head touching the top of the opening, arms hanging to its shins, grey skin catching the flickering light, dragging the stained sack.',
				fx: 'flicker',
				move: push(1.02, 1.1, 0.52, 0.45),
			}, {kids: <>
				<CreatureFig x={1010} y={680} h={400} />
				<BackCrowd />
			</>}),
			// "Its shoulders scraped against the walls as it climbed."
			close('f_10_shoulder', 'narrator_110_shoulders_scraped', {
				chars: ['creature'],
				loc: 'stairwell',
				quality: 'high',
				mood: MOOD.stair,
				prompt: 'Close side view in the narrow stairwell: the creature\'s bony grey shoulder and upper arm scrape along the pale-green plaster wall as it climbs, flaking the paint; its head bent sideways out of frame at the top; flickering caged light.',
				fx: 'tremble',
				move: {z0: 1.04, z1: 1.12, x0: 0.6, y0: 0.5, x1: 0.42, y1: 0.45},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3b4a40" />
				<g opacity={0.9}>
					<CreatureFig x={1000} y={1900} h={2000} lean={-10} />
				</g>
			</>),
			// "Its arms hung so low that its fingers almost touched the steps."
			shot('f_11_arms', 'narrator_111_arms_low', 'stairwell', {
				chars: ['creature'],
				quality: 'high',
				mood: MOOD.stair,
				prompt: 'Low angle on the concrete steps: the creature\'s impossibly long, thin grey arms hang straight down past its knees, the long fingertips nearly brushing the steps as it climbs; its body above out of frame in shadow; flickering light.',
				fx: 'flicker',
				move: {z0: 1.03, z1: 1.1, x0: 0.5, y0: 0.6, x1: 0.5, y1: 0.45},
			}, {cam: {z: 2.0, cx: 700, cy: 700}, kids: <CreatureFig x={700} y={1500} h={1300} />}),
			// "And behind it..." / "It was dragging a large, stained sack." / "Something inside the sack moved."
			again('f_12_behind', 'narrator_112_behind_it', 'f_09_full', {fx: 'flicker', move: push(1.3, 1.5, 0.52, 0.45)}),
			shot('f_13_sack', 'narrator_113_sack', 'stairwell', {
				chars: ['creature'],
				quality: 'medium',
				dark: true,
				grade: 1.3,
				mood: MOOD.stair,
				prompt: 'On the concrete steps in the flickering dark: a long grey bony hand drags a large, coarse, grimy, darkly stained burlap sack up the steps by its rope-tied neck; only the hand and the sack are in frame.',
				variants: [{name: 'bulge', prompt: 'Something INSIDE the stained burlap sack has moved: the sack bulges and twists on one side, as if pushed from within. Nothing else changes.'}],
				move: push(1.04, 1.1, 0.5, 0.55),
			}, {cam: {z: 2.2, cx: 760, cy: 760}}),
			again('f_14_moved', 'narrator_114_sack_moved', 'f_13_sack', {grade: 1.3, seq: [['base', 0], ['bulge', 0.3], ['base', 0.55], ['bulge', 0.75]], move: push(1.12, 1.2)}),
			// "I covered my mouth."
			again('f_15_cover', 'narrator_115_covered_mouth', 'd_17_sarah_afraid', {move: push(1.12, 1.2, 0.5, 0.4), blink: true}),
			// "The creature climbed another step." / "Then another."
			again('f_16_step', 'narrator_116_another_step', 'f_10_shoulder', {fx: 'shake', move: push(1.1, 1.14, 0.5, 0.45)}),
			again('f_17_step', 'narrator_117_then_another', 'f_09_full', {fx: 'shake', move: push(1.5, 1.7, 0.52, 0.42)}),
			// "Its skin looked grey and stretched tightly over its bones." / "Its mouth hung open." / "Far too wide for a human face."
			close('f_18_face', 'narrator_118_grey_skin', {
				chars: ['creature'],
				loc: 'stairwell',
				quality: 'high',
				mood: MOOD.hallDark,
				prompt: 'EXTREME CLOSE-UP of the creature\'s head only, filling the frame, in profile in the flickering dark: its head bent forward and to one side, grey waxy skin stretched tight over the skull and the bones of its jaw and neck, a small sunken pale eye, sparse lank dark hair; its jaw closed for now. Frightening, not gory.',
				variants: [{name: 'jaw', prompt: 'The creature\'s jaw has dropped open FAR too wide - a dark, hollow, toothless mouth hanging down past where any human jaw could go. Nothing else changes. No blood.'}],
				move: push(1.03, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#1d2620" />
				<ellipse cx={960} cy={540} rx={520} ry={640} fill="#8d8f8a" transform="rotate(-40 960 540)" />
			</>),
			again('f_19_mouth', 'narrator_119_mouth_open', 'f_18_face', {seq: [['base', 0], ['jaw', 0.35]], fx: 'flicker', move: push(1.1, 1.16)}),
			again('f_20_wide', 'narrator_120_too_wide', 'f_18_face', {show: 'jaw', move: push(1.18, 1.32, 0.52, 0.58)}),
			// "It stopped at the third-floor landing." - from above, through the railings
			shot('f_21_landing', 'narrator_121_third_floor', 'stairwell', {
				chars: ['creature'],
				quality: 'high',
				dark: true,
				grade: 1.3,
				mood: MOOD.stair,
				prompt: 'Looking straight down through the gap between the stair railings to the third-floor landing below: the hunched grey creature has stopped on the landing in front of a half-open apartment door with warm light behind it, the stained sack at its feet; seen from above, small and terrible.',
				move: push(1.04, 1.12, 0.5, 0.55),
			}, {cam: {z: 1.3, cx: 880, cy: 620}, kids: <CreatureFig x={880} y={760} h={220} />}),
			// "A man began begging." + "Please! I have children!"
			again('f_22_begging', 'narrator_122_begging', 'f_21_landing', {grade: 1.3, move: push(1.14, 1.3, 0.5, 0.58)}),
			// "There was a sharp cry." / "Then silence."
			again('f_23_cry', 'narrator_123_sharp_cry', 'd_17_sarah_afraid', {fx: 'shake', move: push(1.16, 1.22, 0.5, 0.42)}),
			again('f_24_silence', 'narrator_124_silence', 'b_12_below', {show: 'closed', grade: 1.0, move: push(1.1, 1.12, 0.5, 0.55)}),
			// "The sack scraped across the concrete again."
			again('f_25_sack', 'narrator_125_sack_scraped', 'f_13_sack', {show: 'bulge', grade: 1.3, move: push(1.1, 1.18)}),
			// "The creature continued climbing." - beat: climb
			again('f_26_climb', 'narrator_126_continued', 'f_11_arms', {fx: 'shake', move: push(1.08, 1.16, 0.5, 0.45)}),
			// "Toward the fourth floor." / "Toward me."
			again('f_27_fourth', 'narrator_127_fourth_floor', 'f_09_full', {fx: 'flicker', move: push(1.7, 2.0, 0.52, 0.42)}),
			again('f_28_me', 'narrator_128_toward_me', 'd_14_eye_wide', {show: 'wide', move: push(1.1, 1.2)}),
		]}
	/>
);
