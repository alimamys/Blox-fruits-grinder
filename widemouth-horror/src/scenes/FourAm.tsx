// 8. FOUR A.M. - moving day. The missing steak knife. The truck, the window - the opening again.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const FourAm: React.FC = () => (
	<Shots
		shots={[
			// "Moving day came two weeks after I met him."
			shot('f_01_loading', 'narrator_066_moving_day', 'farmhouse', {
				chars: ['parents'],
				quality: 'medium',
				mood: MOOD.grey,
				prompt: 'Moving day at the farmhouse on the hill: a big rented moving truck backed up to the porch, its rear door open, DAD carrying a cardboard box up the ramp and MOM handing down a lamp from the porch. Grey afternoon.',
				move: push(1.02, 1.1, 0.62, 0.35),
			}, {cam: {z: 2.2, cx: 1240, cy: 320}, kids: <>
				<rect x={900} y={300} width={260} height={160} fill="#e8e6df" />
				<Person who="dad" x={1160} y={440} h={150} facing="left" pose="carryBox" />
				<Person who="mom" x={1300} y={420} h={140} facing="left" />
			</>}),
			// "I didn't tell him we were leaving..."
			shot('f_02_secret', 'narrator_067_didnt_tell', 'bedroom', {
				chars: ['eli'],
				quality: 'high',
				blink: true,
				mood: MOOD.sickroom,
				prompt: 'Little ELI (healthy now, in a blue T-shirt and jeans) sits very still on the edge of his bed in the stripped bedroom, hands in his lap, his eyes turned DOWN and sideways toward the bed skirt by his feet, wary, keeping a secret. Taped moving boxes everywhere.',
				move: push(1.02, 1.1, 0.4, 0.45),
			}, {cam: {z: 1.6, cx: 560, cy: 540}, kids: <Person who="eli" x={560} y={760} h={300} facing="front" />}),
			// "The night before we left, my mom searched the whole kitchen."
			close('f_03_kitchen', 'narrator_068_searched', {
				chars: ['parents'],
				quality: 'medium',
				mood: MOOD.kitchenNight,
				prompt: 'The farmhouse kitchen late at night, half packed: MOM pulls open drawer after drawer along the counter, searching, a puzzled frown, packed boxes stacked on the counters and table. ONLY Mom - Dad is not here.',
				move: push(1.02, 1.08, 0.45, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#5a4a32" />
				<rect x={0} y={620} width={1920} height={460} fill="#8a6a44" />
				<Person who="mom" x={760} y={1000} h={700} facing="right" />
			</>),
			// "Has anyone seen the big steak knife? It was right here in the drawer."
			close('f_04_drawer', 'mom_002_steak_knife', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.kitchenNight,
				prompt: 'Looking down into an open kitchen drawer under a warm yellow bulb: a wooden cutlery tray with forks, spoons and small knives in neat rows - and one long EMPTY slot where a big steak knife should be, its outline faintly pressed into the felt. No people.',
				move: push(1.04, 1.16, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#6b4a2b" />
				<rect x={360} y={200} width={1200} height={700} fill="#8a6a44" />
				<rect x={1200} y={260} width={120} height={580} fill="#3a2a1c" />
			</>),
			// "Nobody had."
			again('f_05_nobody', 'narrator_069_nobody', 'f_04_drawer', {move: push(1.16, 1.3, 0.62, 0.5), grade: 0.85}),
			// "That night I lay awake, listening to the quiet underneath me..."
			again('f_06_awake', 'narrator_070_lay_awake', 'h_04_listen', {move: push(1.0, 1.08, 0.3, 0.45), grade: 0.9}),
			// "My dad woke me at four in the morning and carried me out to the truck."
			shot('f_07_carry', 'narrator_071_four_am', 'farmhouse', {
				chars: ['parents', 'eli'],
				quality: 'high',
				dark: true,
				mood: MOOD.houseNight,
				prompt: 'Before dawn at the farmhouse: DAD walks down the porch steps toward the waiting moving truck, carrying little ELI asleep against his shoulder, wrapped in a knitted blanket. The porch light is a small warm pool in the blue-black dark. ONLY Dad and Eli.',
				move: push(1.02, 1.1, 0.6, 0.35),
			}, {cam: {z: 2.4, cx: 1240, cy: 300}, kids: <Person who="dad" x={1200} y={440} h={160} facing="left" pose="holdChild" />}),
			// "This is the last move, buddy. I promise. Then you can make some real friends."
			close('f_08_dad', 'dad_001_last_move', {
				chars: ['parents', 'eli'],
				loc: 'truck',
				quality: 'high',
				dark: true,
				mood: MOOD.truckNight,
				prompt: 'Inside the dark truck cab before dawn: DAD at the wheel (wire glasses, navy work jacket) turns to little ELI on the seat beside him with a tired, warm smile, one big hand resting on the boy\'s blanket-wrapped shoulder. Faint green dashboard glow on their faces. ONLY Dad and Eli.',
				move: push(1.02, 1.08, 0.42, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#121722" />
				<Person who="dad" x={700} y={1500} h={1300} facing="right" />
				<Person who="eli" x={1300} y={1400} h={800} facing="left" />
			</>),
			// "I looked up at the house as we backed out of the driveway."
			again('f_09_look', 'narrator_072_backed_out', 'w_01_truck', {move: push(1.06, 1.14, 0.62, 0.42)}),
			// "And there he was. In my window."
			again('f_10_there', 'narrator_073_there_he_was', 'w_03_window', {move: push(1.0, 1.3, 0.64, 0.24)}),
			// "You already know the rest."
			again('f_11_rest', 'narrator_074_you_know', 'w_04_still', {move: push(1.25, 1.34, 0.5, 0.37)}),
			// "The little wave."
			again('f_12_wave', 'narrator_075_little_wave', 'w_04_still', {show: 'up', move: push(1.45, 1.6, 0.5, 0.35)}),
			// "The steak knife."
			again('f_13_knife', 'narrator_076_the_knife', 'w_06_knife', {move: push(1.1, 1.2, 0.5, 0.55)}),
		]}
	/>
);
