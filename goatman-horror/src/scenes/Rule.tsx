// 5. THE RULE - a whispered conversation through a one-inch gap.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

const H = 'c_23_gap_harris';
const S = 'c_24_gap_sarah';
/** Harris speaks through the gap: his talking frame, the camera creeping in line by line. */
const h = (id: string, line: string, z: number, extra = {}) => again(id, line, H, {talk: [line], move: push(z, z + 0.05), ...extra});
const s = (id: string, line: string, z: number) => again(id, line, S, {talk: [line], move: push(z, z + 0.04)});

export const Rule: React.FC = () => (
	<Shots
		shots={[
			s('e_00', 'sarah_003_what_reaches', 1.02),
			h('e_01', 'harris_003_once_every_month', 1.04),
			s('e_02', 'sarah_004_what_does', 1.06),
			again('e_03_swallow', 'narrator_087_swallowed', H, {move: push(1.14, 1.18, 0.5, 0.55)}),
			h('e_04', 'harris_004_dont_know', 1.08),
			s('e_05', 'sarah_005_what_does_it_want', 1.08),
			again('e_06_stare', 'narrator_088_stared', H, {move: push(1.2, 1.24, 0.5, 0.4)}),
			h('e_07', 'harris_005_one_person', 1.22),
			s('e_08', 'sarah_006_what', 1.12),
			h('e_09', 'harris_006_every_floor', 1.12),
			again('e_10_laugh', 'narrator_089_laughed', S, {move: push(1.1, 1.12)}),
			s('e_11', 'sarah_007_what_agreement', 1.1),
			h('e_12', 'harris_007_leaves_others', 1.14),
			s('e_13', 'sarah_008_if_you_dont', 1.14),
			again('e_14_tears', 'narrator_090_eyes_filled', H, {seq: [['base', 0], ['tears', 0.35]], move: push(1.16, 1.24, 0.5, 0.42)}),
			h('e_15', 'harris_008_last_time', 1.18),
			// "I stepped backward." - the flat, the door open an inch
			shot('e_16_step_back', 'narrator_091_stepped_backward', 'flat', {
				chars: ['sarah'],
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'Wide shot of the dark living room: Sarah takes a step backward away from her front door, which stands open just an inch - a thin vertical line of yellow-green corridor light along its edge; her arms close to her body, frightened.',
				move: push(1.02, 1.08),
			}, {cam: {z: 1.35, cx: 940, cy: 520}, kids: <Person who="sarah" x={760} y={900} h={560} facing="right" />}),
			s('e_17', 'sarah_009_holding_breath', 1.12),
			// "It hears breathing. Loud breathing, crying, screaming. Those things attract it..." - the frozen hallway
			h('e_18', 'harris_009_hears_breathing', 1.1),
			again('e_19_cover', 'harris_009_hears_breathing', 'd_11_mother', {show: 'cover', move: push(1.1, 1.16, 0.55, 0.45)}, {frac: 0.3}),
			again('e_20_frozen', 'harris_009_hears_breathing', 'd_08_still', {move: push(1.12, 1.18)}, {frac: 0.55}),
			h('e_21', 'harris_009_hears_breathing', 1.2, {}),
			// "A heavy thud echoed from downstairs." / "Mr. Harris flinched."
			again('e_22_thud', 'narrator_092_heavy_thud', 'd_13_stairwell', {grade: 1.6, fx: 'shake', move: push(1.08, 1.1, 0.45, 0.6)}),
			again('e_23_flinch', 'narrator_093_flinched', H, {show: 'look', fx: 'shake', move: push(1.1, 1.12)}),
			h('e_24', 'harris_010_stay_calm', 1.16),
			// "He stepped away from the door." - only the sliver of light
			again('e_25_away', 'narrator_094_stepped_away', 'c_22_chain', {show: 'gap', move: push(1.08, 1.14)}),
			// "I closed it and turned the lock."
			again('e_26_lock', 'narrator_095_turned_lock', 'c_17_door', {move: push(1.1, 1.18, 0.5, 0.45)}),
			// "My hands were shaking."
			close('e_27_hands', 'narrator_096_hands_shaking', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				fx: 'tremble',
				mood: MOOD.flat,
				prompt: 'Close-up in the dark: Sarah\'s trembling hands on the brass deadbolt and the door handle of her front door, knuckles white, natural hands with five fingers each; a faint stripe of orange streetlight.',
				move: push(1.03, 1.08),
			}, <>
				<rect x={600} y={0} width={900} height={1080} fill="#3a2a1f" />
				<circle cx={960} cy={420} r={50} fill="#b8902e" />
				<circle cx={860} cy={520} r={70} fill="#f0cdb4" />
				<circle cx={1060} cy={560} r={70} fill="#f0cdb4" />
			</>),
			// "I wanted to believe the old man had lost his mind."
			again('e_28_believe', 'narrator_097_lost_his_mind', 'c_08_dread', {move: push(1.04, 1.12, 0.5, 0.42), blink: true}),
			// "But another scream came from downstairs."
			again('e_29_scream', 'narrator_098_another_scream', 'd_17_sarah_afraid', {fx: 'shake', move: push(1.12, 1.2, 0.5, 0.42)}),
			// "Then a long, wet dragging sound."
			again('e_30_wet', 'narrator_099_wet_dragging', 'd_15_sack', {show: 'sack2', move: push(1.06, 1.18)}),
			// "And I knew he was telling the truth."
			again('e_31_truth', 'narrator_100_truth', 'c_08_dread', {move: push(1.14, 1.3, 0.5, 0.4)}),
		]}
	/>
);
