// 8. THE OFFERING - a key in the lock.
import React from 'react';
import {CreatureFig, Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

const GAP_LIGHT = 'Inside the dark flat; the yellow-green corridor light floods in through the gap of the forced-open door.';

export const Offering: React.FC = () => (
	<Shots
		shots={[
			again('h_00_sofa', 'narrator_154_pushed_sofa', 'g_02_sofa', {show: 'pushed', move: push(1.06, 1.12)}),
			// "Then the dining table."
			shot('h_01_table', 'narrator_155_dining_table', 'flat', {
				chars: ['sarah'],
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'The dark living room: Sarah shoves the small round wooden dining table hard against the mustard sofa that blocks the front door, building a barricade; chairs knocked over.',
				fx: 'shake',
				move: push(1.04, 1.1),
			}, {cam: {z: 1.4, cx: 940, cy: 560}, kids: <Person who="sarah" x={1180} y={900} h={500} facing="left" pose="reach" />}),
			// "I pulled as hard as I could on the handle to make sure it was locked."
			close('h_02_handle', 'narrator_156_pulled_handle', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				fx: 'tremble',
				mood: MOOD.flat,
				prompt: 'Close-up: Sarah\'s two hands grip the brass handle of her front door and pull with all her strength, knuckles white, the deadbolt locked above; her pale face strained at the edge of frame. Natural hands, five fingers each.',
				move: push(1.03, 1.08),
			}, <>
				<rect x={500} y={0} width={1100} height={1080} fill="#3a2a1f" />
				<circle cx={900} cy={560} r={80} fill="#f0cdb4" />
				<circle cx={1060} cy={580} r={80} fill="#f0cdb4" />
			</>),
			// "Outside, the footsteps stopped." / "The entire hallway went silent." - the barricaded door; shadows break the light under it
			shot('h_03_barricade', 'narrator_157_footsteps_stopped', 'flat', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'The front door from inside, barricaded: the mustard sofa and the round table shoved against it; the thin yellow-green line of corridor light shines under the door. Nobody visible.',
				variants: [
					{name: 'feet', prompt: 'Two dark shadows of feet now break the yellow-green line of light under the door - someone is standing right outside. Nothing else changes.'},
					{name: 'open', prompt: 'The door has been forced open a hand\'s width: yellow-green corridor light floods through the gap, and the sofa and table have been pushed back across the floor. Nothing else changes.'},
				],
				seq: [
					['base', 0],
					['feet', 0.6],
				],
				move: push(1.02, 1.08, 0.5, 0.55),
			}, {cam: {z: 1.6, cx: 920, cy: 480}}),
			again('h_04_silent', 'narrator_158_silent', 'h_03_barricade', {show: 'feet', move: push(1.1, 1.18, 0.5, 0.6)}),
			// "Then I heard something that made my blood run cold."
			again('h_05_cold', 'narrator_159_blood_cold', 'c_08_dread', {move: push(1.1, 1.2, 0.5, 0.42), blink: true}),
			// "A key." / "Sliding into my lock." - the thumb-turn of the deadbolt from inside
			close('h_06_lock', 'narrator_160_a_key', {
				loc: 'flat',
				noPeople: true,
				quality: 'medium',
				mood: 'Darkness; a sliver of yellow-green light around the edge of the door.',
				prompt: 'Extreme close-up of the inside of Sarah\'s front door in the dark: the brass deadbolt thumb-turn, set horizontal (locked). Nobody visible.',
				variants: [{name: 'turned', prompt: 'The brass deadbolt thumb-turn has now rotated to vertical by itself - unlocked from outside with a key. Nothing else changes.'}],
				move: push(1.04, 1.14),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a2a1f" />
				<circle cx={960} cy={540} r={160} fill="#b8902e" />
				<rect x={860} y={510} width={200} height={60} fill="#7a5c1e" />
			</>),
			again('h_07_sliding', 'narrator_161_sliding', 'h_06_lock', {move: push(1.14, 1.24)}),
			// SARAH: "No. No, please!"
			close('h_08_panic', 'sarah_010_no_please', {
				kind: 'talk',
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				talk: ['sarah_010_no_please', 'sarah_011_stop_please', 'sarah_012_dont_do_this'],
				mood: GAP_LIGHT,
				prompt: 'Close-up from the waist up: Sarah in panic, leaning against her front door with EXACTLY TWO hands - both palms flat on the door - eyes wide, pleading, tears; light from the corridor striping her face. Nothing else in the foreground: no other hands, arms, feet or people anywhere in the frame.',
				move: push(1.03, 1.08),
			}, <Person who="sarah" x={960} y={1700} h={1500} facing="front" />),
			// "The lock turned." / "The door began opening." / "The furniture scraped across the floor."
			again('h_09_turned', 'narrator_162_lock_turned', 'h_06_lock', {show: 'turned', fx: 'shake', move: push(1.2, 1.24)}),
			again('h_10_opening', 'narrator_163_door_opening', 'h_03_barricade', {seq: [['feet', 0], ['open', 0.3]], fx: 'shake', move: push(1.1, 1.14, 0.5, 0.55)}),
			again('h_11_scrape', 'narrator_164_furniture_scraped', 'h_03_barricade', {show: 'open', fx: 'shake', move: push(1.14, 1.22, 0.5, 0.55)}),
			// "I pushed against it with everything I had."
			shot('h_12_push', 'narrator_165_pushed', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				fx: 'shake',
				mood: GAP_LIGHT,
				prompt: 'Sarah throws her whole body against the sofa and the door, straining, teeth gritted, bare feet slipping on the floorboards, as the door is forced open a hand\'s width against her; corridor light floods through the gap.',
				move: push(1.04, 1.1),
			}, {cam: {z: 1.7, cx: 900, cy: 520}, kids: <Person who="sarah" x={1060} y={880} h={540} facing="left" pose="reach" tilt={-18} />}),
			again('h_13_stop', 'sarah_011_stop_please', 'h_08_panic', {talk: ['sarah_011_stop_please'], fx: 'shake', move: push(1.08, 1.12)}),
			again('h_14_continued', 'narrator_166_continued_opening', 'h_03_barricade', {show: 'open', move: push(1.22, 1.36, 0.5, 0.5)}),
			// "Through the gap, I saw Mr. Harris." / "He was holding a master key."
			close('h_15_harris_key', 'narrator_167_saw_harris', {
				kind: 'talk',
				chars: ['harris'],
				loc: 'hallway_cross',
				quality: 'high',
				talk: ['harris_011_shes_yours'],
				mood: 'The yellow-green corridor light seen through the gap of a forced-open door.',
				prompt: 'Through the hand-wide gap of the forced-open door: Mr. Harris in the corridor holding up a heavy ring of brass master keys, crying, his face wet with tears; the dark doorframe and the edge of the sofa in the foreground.',
				variants: [{name: 'away', prompt: 'Mr. Harris now looks down and away, unable to meet our eyes, the keys hanging in his hand. Nothing else changes.'}],
				move: push(1.03, 1.08),
			}, <>
				<rect x={0} y={0} width={700} height={1080} fill="#2a1d14" />
				<rect x={1300} y={0} width={620} height={1080} fill="#2a1d14" />
				<rect x={700} y={0} width={600} height={1080} fill="#8b8c5a" />
				<Person who="harris" x={1000} y={1400} h={1200} facing="front" pose="reach" />
			</>),
			again('h_16_key', 'narrator_168_master_key', 'h_15_harris_key', {move: push(1.2, 1.3, 0.56, 0.6)}),
			// "Behind him stood the creature." - reveal
			close('h_17_creature', 'narrator_169_behind_him', {
				chars: ['creature', 'harris'],
				loc: 'hallway_cross',
				quality: 'high',
				mood: MOOD.hallDark,
				prompt: 'Through the gap of the forced-open door: behind Mr. Harris, filling the corridor, the creature looms - nearly seven feet, hunched, its head bent so far sideways it almost touches its own shoulder, grey skin in the flickering light; its jaw closed for now.',
				variants: [{name: 'jaw', prompt: 'The creature\'s jaw has slowly dropped open far too wide - a dark, hollow, toothless mouth. Nothing else changes. No blood.'}],
				fx: 'flicker',
				move: push(1.02, 1.1, 0.5, 0.4),
			}, <>
				<rect x={0} y={0} width={600} height={1080} fill="#2a1d14" />
				<rect x={1320} y={0} width={600} height={1080} fill="#2a1d14" />
				<rect x={600} y={0} width={720} height={1080} fill="#8b8c5a" />
				<CreatureFig x={1000} y={1500} h={1500} />
				<Person who="harris" x={840} y={1500} h={900} facing="front" />
			</>),
			again('h_18_reveal', 'creature_reveal', 'h_17_creature', {fx: 'shake', move: push(1.1, 1.14, 0.5, 0.38)}),
			// "Its head was bent sideways..." / "Its mouth slowly opened." / "And for the first time, it spoke."
			again('h_19_head', 'narrator_170_head_sideways', 'h_17_creature', {move: push(1.14, 1.3, 0.52, 0.3)}),
			again('h_20_mouth', 'narrator_171_mouth_opened', 'h_17_creature', {seq: [['base', 0], ['jaw', 0.4]], move: push(1.3, 1.36, 0.52, 0.3)}),
			again('h_21_spoke', 'narrator_172_spoke', 'h_17_creature', {show: 'jaw', move: push(1.36, 1.46, 0.52, 0.3)}),
			// CREATURE: "You promised me one."
			again('h_22_promised', 'creature_001_promised', 'h_17_creature', {show: 'jaw', fx: 'glitch', move: push(1.5, 1.58, 0.52, 0.3)}),
			// "Mr. Harris began crying." / "Mr. Harris, please! Don't do this!" / "He couldn't look at me." / "She's yours."
			again('h_23_crying', 'narrator_173_harris_crying', 'h_15_harris_key', {move: push(1.1, 1.18, 0.5, 0.4)}),
			again('h_24_please', 'sarah_012_dont_do_this', 'h_08_panic', {talk: ['sarah_012_dont_do_this'], fx: 'shake', move: push(1.1, 1.14)}),
			again('h_25_look_away', 'narrator_174_couldnt_look', 'h_15_harris_key', {show: 'away', move: push(1.14, 1.2, 0.5, 0.4)}),
			again('h_26_yours', 'harris_011_shes_yours', 'h_15_harris_key', {talk: ['harris_011_shes_yours'], move: push(1.22, 1.3, 0.5, 0.38)}),
			// "The creature bent down." / "Its impossibly long arm reached through the doorway."
			again('h_27_bent', 'narrator_175_bent_down', 'h_17_creature', {show: 'jaw', move: push(1.1, 1.3, 0.5, 0.5)}),
			shot('h_28_arm', 'narrator_176_arm_reached', 'flat', {
				chars: ['creature'],
				quality: 'high',
				fx: 'shake',
				mood: GAP_LIGHT,
				prompt: 'Inside the dark flat: through the gap of the forced-open front door, the creature\'s impossibly long, thin grey arm snakes in over the barricade toward the camera, the long grey fingers spread and reaching; yellow-green light behind it.',
				move: push(1.02, 1.16, 0.5, 0.48),
			}, {cam: {z: 1.6, cx: 920, cy: 460}, kids: <path d="M920,300 Q1100,500 1500,760" stroke="#8d8f8a" strokeWidth={40} fill="none" />}),
			again('h_29_reach', 'arm_reach', 'h_28_arm', {fx: 'shake', move: push(1.25, 1.4, 0.6, 0.6)}),
			// "I screamed." (+ the scream)
			close('h_30_scream', 'narrator_177_screamed', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				fx: 'shake',
				mood: GAP_LIGHT,
				prompt: 'Close-up: Sarah screaming in pure terror, mouth wide open, eyes huge, her TWO hands raised, falling backward; from the right edge of the frame only the creature\'s impossibly long, thin, bony GREY fingers reach toward her (clearly grey and inhuman, not a human hand); corridor light slashing across her face.',
				move: push(1.04, 1.12),
			}, <Person who="sarah" x={960} y={1700} h={1500} facing="front" pose="coverMouth" />),
			// "And ran." - she runs for the bedroom
			shot('h_31_run', 'narrator_178_ran', 'flat', {
				chars: ['sarah'],
				quality: 'medium',
				fx: 'shake',
				mood: MOOD.flat,
				prompt: 'Sarah runs barefoot through the dark living room toward the short corridor to her bedroom, her hair flying, glancing back over her shoulder in terror; motion and panic.',
				move: {z0: 1.04, z1: 1.14, x0: 0.4, y0: 0.5, x1: 0.62, y1: 0.48},
			}, {cam: {z: 1.3, cx: 1200, cy: 520}, kids: <Person who="sarah" x={1300} y={900} h={520} facing="right" pose="reach" />}),
		]}
	/>
);
