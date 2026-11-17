// 4. THE NEIGHBORS - they are expecting it. No signal. Three soft knocks.
import React from 'react';
import {NoSignalScreen} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, phone, push, shot} from './kit';

/** Sarah's face close to the door in the dark - reused whenever she realises something. */
const SARAH_DREAD = 'EXTREME CLOSE-UP of Sarah\'s face only - forehead to chin filling the frame - in the dark flat, her back against her front door, staring into the darkness, her face pale, eyes wide and glassy as a terrible thought dawns on her; faint yellow-green light from under the door on her chin.';

export const Neighbors: React.FC = () => (
	<Shots
		shots={[
			again('c_00_peephole', 'narrator_063_peephole_again', 'd_06_eye_peephole', {move: push(1.04, 1.1, 0.55, 0.45), blink: true}),
			again('c_01_same', 'narrator_064_same_positions', 'd_07_peephole_pov', {move: push(1.0, 1.08)}),
			// "A mother was holding her little boy against her chest." / crying silently / covered his mouth
			again('c_02_mother', 'narrator_065_mother', 'd_11_mother', {move: push(1.02, 1.08)}),
			again('c_03_crying', 'narrator_066_crying_silently', 'd_11_mother', {show: 'cry', move: push(1.08, 1.14, 0.55, 0.45)}),
			again('c_04_cover', 'narrator_067_covered_mouth', 'd_11_mother', {seq: [['cry', 0], ['cover', 0.38]], move: push(1.12, 1.2, 0.55, 0.45)}),
			// "An old man near the staircase was shaking so badly that he could barely stand."
			shot('c_05_oldman', 'narrator_068_old_man', 'hallway_cross', {
				chars: ['residents'],
				quality: 'high',
				fx: 'tremble',
				mood: MOOD.hall,
				prompt: 'Medium shot near the stairwell at the left end of the corridor: ONLY the very old bald man in grey striped pyjamas, standing on the RIGHT half of the frame in strict side PROFILE, his face, nose and body pointing to the LEFT edge of the frame where the black stair railing and the stairs are (we see his right ear and right cheek), staring at the stairs, shaking so badly he can barely stand, one hand pressed flat against the wall, his knees buckling, eyes wide with terror. Nobody else in the frame.',
				move: push(1.03, 1.1, 0.45, 0.45),
			}, {cam: {z: 2.1, cx: 640, cy: 520}, kids: <Person who="oldman" x={760} y={885} h={470} facing="left" />}),
			// "But nobody moved." / "Nobody tried to escape."
			again('c_06_nobody', 'narrator_069_nobody_moved', 'd_09_facing_stairs', {move: push(1.04, 1.1, 0.52, 0.47)}),
			again('c_07_escape', 'narrator_070_nobody_escape', 'd_07_peephole_pov', {move: {z0: 1.25, z1: 1.3, x0: 0.33, y0: 0.5, x1: 0.3, y1: 0.5}}),
			// "That's when something occurred to me."
			shot('c_08_dread', 'narrator_071_occurred', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				blink: true,
				mood: MOOD.flat,
				prompt: SARAH_DREAD,
				move: push(1.03, 1.08, 0.5, 0.42),
			}, {cam: {z: 5.0, cx: 920, cy: 250}, kids: <Person who="sarah" x={920} y={780} h={600} facing="front" />}),
			// "They weren't surprised by any of this." / "They were expecting it."
			again('c_09_not_surprised', 'narrator_072_not_surprised', 'd_08_still', {move: push(1.06, 1.14)}),
			again('c_10_expecting', 'narrator_073_expecting', 'd_10_harris_frozen', {move: push(1.12, 1.2, 0.45, 0.42)}),
			// "Whatever was coming up those stairs, every person in that hallway knew exactly what it was."
			again('c_11_knew', 'narrator_074_knew_exactly', 'd_07_peephole_pov', {move: push(1.0, 1.16)}),
			// "Except me."
			again('c_12_except', 'narrator_075_except_me', 'c_08_dread', {move: push(1.2, 1.3, 0.5, 0.4), blink: true}),
			// "I grabbed my phone and called the police."
			shot('c_13_call', 'narrator_076_called_police', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				blink: true,
				mood: 'Darkness; her phone screen lights her face cold blue-white from below.',
				prompt: 'Medium close-up in the dark living room: Sarah holds her phone to her ear with a trembling hand, her face lit cold blue-white by the screen, eyes darting toward the front door, whispering into the phone.',
				move: push(1.03, 1.08, 0.5, 0.45),
			}, {cam: {z: 2.0, cx: 760, cy: 420}, kids: <Person who="sarah" x={760} y={860} h={620} facing="front" pose="fingerLips" />}),
			phone('c_14_no_signal', 'narrator_077_no_signal', ({f}) => <NoSignalScreen f={f} />),
			again('c_15_again', 'narrator_078_tried_again', 'c_13_call', {move: push(1.1, 1.16, 0.5, 0.42), blink: true}),
			phone('c_16_nothing', 'narrator_079_nothing', ({f}) => <NoSignalScreen f={f} attempt={2} />, {tilt: 3}),
			// "Then there were three very soft knocks on my door." - the door from inside
			shot('c_17_door', 'narrator_081_three_knocks', 'flat', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'Sarah\'s front door from inside in the dark: the dark wood, the brass peephole glowing faintly yellow-green, the brass security chain fastened, the deadbolt, and the thin yellow-green line of corridor light under the door. Nobody visible.',
				move: push(1.02, 1.1, 0.5, 0.48),
			}, {cam: {z: 1.9, cx: 920, cy: 400}}),
			again('c_18_knocks', 'knocks', 'c_17_door', {fx: 'shake', move: push(1.12, 1.14, 0.5, 0.45)}),
			again('c_19_froze', 'narrator_082_froze', 'c_08_dread', {move: push(1.12, 1.16, 0.5, 0.42)}),
			// MR. HARRIS (whispering): "Sarah. It's me. Open the door just a little." - his face at the peephole
			close('c_20_harris_peep', 'harris_001_its_me', {
				kind: 'talk',
				chars: ['harris'],
				loc: 'hallway_cross',
				quality: 'high',
				talk: ['harris_001_its_me'],
				mood: MOOD.peep,
				prompt: 'Seen through the door peephole: Mr. Harris\'s frightened old face very close to the door, filling the middle of the view, eyes wet and wide, whispering; the yellow-green corridor behind him.',
				move: push(1.0, 1.05),
			}, <Person who="harris" x={960} y={2100} h={2000} facing="front" />, {bg: '#5b5a3c'}),
			again('c_21_hesitated', 'narrator_083_hesitated', 'c_17_door', {move: push(1.14, 1.2, 0.5, 0.42)}),
			// "Then I unlocked the chain and opened it barely an inch."
			close('c_22_chain', 'narrator_084_chain', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'medium',
				dark: true,
				mood: MOOD.flat,
				prompt: 'Close-up in the dark: Sarah\'s hand slides the brass security chain off its track on the inside of her dark front door; the door is still closed.',
				variants: [{name: 'gap', prompt: 'The door is now open about an inch: a thin vertical sliver of yellow-green corridor light shines through the gap along the door\'s edge, and the chain hangs loose. Nothing else changes.'}],
				seq: [
					['base', 0],
					['gap', 0.55],
				],
				move: push(1.03, 1.08),
			}, <>
				<rect x={700} y={0} width={560} height={1080} fill="#3a2a1f" />
				<rect x={1000} y={380} width={200} height={20} fill="#b8902e" />
				<circle cx={980} cy={430} r={40} fill="#f0cdb4" />
			</>),
			// "Mr. Harris was trembling." - through the one-inch gap (the conversation frame)
			close('c_23_gap_harris', 'narrator_085_trembling', {
				kind: 'talk',
				chars: ['harris'],
				loc: 'hallway_cross',
				quality: 'high',
				fx: 'tremble',
				talk: ['harris_002_listen_carefully'],
				mood: 'Inside the dark flat; the corridor\'s yellow-green light comes only through a one-inch gap in the door.',
				prompt: 'Through a narrow vertical gap of a barely opened door, seen from the dark inside of the flat: Mr. Harris\'s frightened face in the sliver of yellow-green corridor light, eyes wet, trembling, whispering close to the gap. Dark wood fills the rest of the frame.',
				variants: [
					{name: 'look', prompt: 'Mr. Harris now looks to his left, toward the stairs down the corridor, terrified. Nothing else changes.'},
					{name: 'tears', prompt: 'Mr. Harris\'s eyes have filled with tears that run down his cheeks. Nothing else changes.'},
				],
				move: push(1.02, 1.06),
			}, <>
				<rect x={0} y={0} width={820} height={1080} fill="#2a1d14" />
				<rect x={1100} y={0} width={820} height={1080} fill="#2a1d14" />
				<rect x={820} y={0} width={280} height={1080} fill="#8b8c5a" />
				<Person who="harris" x={960} y={1700} h={1500} facing="front" />
			</>),
			// SARAH: "What's happening? What was that scream?" - her face at the gap
			close('c_24_gap_sarah', 'sarah_002_whats_happening', {
				kind: 'talk',
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				talk: ['sarah_002_whats_happening'],
				mood: 'Darkness inside the flat; a vertical sliver of yellow-green light from the door gap falls across one side of her face.',
				prompt: 'Close-up: Sarah\'s face pressed close to the one-inch gap of her barely opened front door, whispering urgently through it, frightened; a vertical stripe of yellow-green corridor light across her eye and mouth, the rest in darkness.',
				move: push(1.02, 1.06),
			}, <>
				<rect x={1150} y={0} width={770} height={1080} fill="#2a1d14" />
				<rect x={1110} y={0} width={40} height={1080} fill="#cfd59a" />
				<Person who="sarah" x={900} y={1750} h={1600} facing="right" />
			</>),
			// "He looked toward the staircase."
			again('c_25_look', 'narrator_086_looked_staircase', 'c_23_gap_harris', {show: 'look', move: push(1.06, 1.1)}),
			// MR. HARRIS: "Listen carefully. Whatever you do, don't make a sound when it reaches this floor."
			again('c_26_listen', 'harris_002_listen_carefully', 'c_23_gap_harris', {talk: ['harris_002_listen_carefully'], move: push(1.08, 1.16)}),
		]}
	/>
);
