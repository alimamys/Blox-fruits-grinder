// 7. THE REALIZATION - they are facing her door.
import React from 'react';
import {MessageScreen} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, phone, push, shot} from './kit';

export const Realization: React.FC = () => (
	<Shots
		shots={[
			again('g_00_back', 'narrator_129_backed_away', 'e_16_step_back', {move: push(1.06, 1.12)}),
			again('g_01_heart', 'narrator_130_heart_pounding', 'c_08_dread', {fx: 'pulse', move: {z0: 1.12, z1: 1.2, x0: 0.5, y0: 0.42}, blink: true}),
			// "I started dragging my sofa toward the entrance."
			shot('g_02_sofa', 'narrator_131_sofa', 'flat', {
				chars: ['sarah'],
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'The dark living room: Sarah, bent low and straining, drags the old mustard-yellow sofa across the floorboards toward the front door, the rug bunching up under it.',
				variants: [{name: 'pushed', prompt: 'The mustard sofa is now shoved right up against the front door, blocking it; Sarah stands beside it, out of breath. Nothing else changes.'}],
				seq: [
					['base', 0],
					['pushed', 0.62],
				],
				move: push(1.02, 1.08),
			}, {cam: {z: 1.3, cx: 760, cy: 560}, kids: <Person who="sarah" x={620} y={900} h={480} facing="right" pose="reach" />}),
			// "Then a thought crossed my mind." / every floor / "Who was it supposed to take from mine?"
			again('g_03_thought', 'narrator_132_thought', 'c_08_dread', {move: push(1.04, 1.1, 0.5, 0.42)}),
			again('g_04_floors', 'narrator_133_every_floor', 'd_09_facing_stairs', {move: push(1.0, 1.08)}),
			again('g_05_mine', 'narrator_134_from_mine', 'c_08_dread', {move: push(1.2, 1.34, 0.5, 0.4), blink: true}),
			// "I looked through the peephole again." / "Something had changed."
			again('g_06_peep', 'narrator_135_peephole_again', 'd_06_eye_peephole', {move: push(1.1, 1.16, 0.55, 0.45)}),
			again('g_07_changed', 'narrator_136_changed', 'd_07_peephole_pov', {move: push(1.0, 1.04)}),
			// "My neighbors weren't facing the staircase anymore." / "They were facing my apartment."
			again('g_08_turn', 'narrator_137_not_facing', 'd_07_peephole_pov', {seq: [['base', 0], ['turned', 0.5]], move: push(1.04, 1.08)}),
			again('g_09_facing', 'narrator_138_facing_mine', 'd_07_peephole_pov', {show: 'turned', move: push(1.08, 1.2)}),
			again('g_10_every', 'narrator_139_every_one', 'd_07_peephole_pov', {show: 'turned', move: {z0: 1.35, z1: 1.35, x0: 0.3, y0: 0.5, x1: 0.7, y1: 0.5}}),
			// "Mr. Harris stood in the middle of the hallway with tears streaming down his cheeks."
			again('g_11_tears', 'narrator_140_tears', 'd_10_harris_frozen', {show: 'tears', move: push(1.05, 1.22, 0.45, 0.4)}),
			// "The woman with the child wouldn't look at me."
			again('g_12_away', 'narrator_141_wouldnt_look', 'd_11_mother', {show: 'away', move: push(1.06, 1.12)}),
			// "I suddenly remembered the landlord." / cheap rent / waived deposit / how quickly
			again('g_13_landlord', 'narrator_142_landlord', 'a_04_keys', {move: push(1.3, 1.4, 0.36, 0.38), grade: 0.85}),
			again('g_14_rent', 'narrator_143_cheap_rent', 'a_02_day_wide', {move: push(1.04, 1.1), grade: 0.85}),
			again('g_15_deposit', 'narrator_144_waived', 'a_04_keys', {move: push(1.6, 1.7, 0.5, 0.55), grade: 0.85}),
			again('g_16_quickly', 'narrator_145_how_quickly', 'a_01_moving_in', {move: push(1.1, 1.3, 0.62, 0.4), grade: 0.85}),
			// "I grabbed my phone." / "There was one message." / "From my landlord." + the message
			again('g_17_phone', 'narrator_146_grabbed_phone', 'c_13_call', {move: push(1.06, 1.12), blink: true}),
			phone('g_18_message', 'narrator_147_one_message', ({f}) => (
				<MessageScreen from="Landlord" text="I'm sorry, Sarah. We all have families." t={(f - 30) / 10} />
			)),
			// "I stared at those words." - her face in the phone's light
			shot('g_19_stare', 'narrator_149_stared', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				blink: true,
				mood: 'Darkness; only the cold white light of her phone screen on her face from below.',
				prompt: 'Close-up: Sarah stares down at her phone in the dark, its cold white light on her face from below, her eyes wet, her mouth slightly open in disbelief; betrayed and terrified.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, {cam: {z: 2.4, cx: 760, cy: 400}, kids: <Person who="sarah" x={760} y={860} h={620} facing="front" />}),
			again('g_20_sense', 'narrator_150_sense', 'g_19_stare', {move: push(1.1, 1.18, 0.5, 0.4), blink: true}),
			// "The creature didn't randomly choose someone." / "The residents chose."
			again('g_21_chose', 'narrator_151_not_randomly', 'd_07_peephole_pov', {show: 'turned', move: push(1.0, 1.1)}),
			again('g_22_residents', 'narrator_152_residents_chose', 'd_07_peephole_pov', {show: 'turned', move: push(1.4, 1.5, 0.5, 0.42)}),
			// "And they had chosen me."
			again('g_23_me', 'narrator_153_chosen_me', 'g_19_stare', {fx: 'pulse', move: push(1.2, 1.36, 0.5, 0.4)}),
		]}
	/>
);
