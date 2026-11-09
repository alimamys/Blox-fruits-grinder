// 3. THE FOOTSTEPS - something climbs the stairs; a scream on a floor below.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD, prog} from './common';
import {again, close, push, shot} from './kit';

/** A shadow sliding up the stairwell wall (code, over the art). */
export const StairShadow: React.FC<{f: number; d: number; x?: number; y?: number}> = ({f, d, x = 260, y = 760}) => {
	const t = prog(f, d, 0.1, 1);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: x + 120 * t, top: y - 330 * t, width: 260, height: 620, borderRadius: '45% 45% 30% 30%', background: 'rgba(0,0,0,0.62)', filter: 'blur(28px)', transform: 'skewX(-12deg) rotate(-8deg)', opacity: Math.min(1, t * 3)}} />
		</AbsoluteFill>
	);
};

export const Footsteps: React.FC = () => (
	<Shots
		shots={[
			// "That's when I heard the footsteps."
			again('b_00_listen', 'narrator_040_footsteps', 'd_06_eye_peephole', {move: push(1.08, 1.14, 0.55, 0.45), blink: true}),
			// "They were coming from downstairs."
			again('b_01_down', 'narrator_041_downstairs', 'd_13_stairwell', {grade: 1.75, fx: 'flicker', move: push(1.06, 1.12, 0.45, 0.6)}),
			// "Slow." - the top of the stairs, looking down into the dark
			shot('b_02_top_stairs', 'narrator_042_slow', 'stairwell', {
				noPeople: true,
				dark: true,
				quality: 'medium',
				grade: 1.5,
				mood: MOOD.stair,
				prompt: 'Low angle at the very top of the stairs on the fourth floor, looking down the first concrete steps into blackness; the black metal railing beside them; one caged bulb far below. Empty.',
				move: push(1.04, 1.08, 0.5, 0.55),
			}, {cam: {z: 1.8, cx: 1200, cy: 640}}),
			// "Heavy." / "Uneven." / "One step." / "Then another." - cutting on every step
			again('b_03_eye', 'narrator_043_heavy', 'd_06_eye_peephole', {move: push(1.18, 1.2, 0.58, 0.42), fx: 'shake'}),
			again('b_04_stairs', 'narrator_044_uneven', 'b_02_top_stairs', {grade: 1.5, move: push(1.12, 1.15, 0.5, 0.55), fx: 'shake'}),
			again('b_05_eye', 'narrator_045_one_step', 'd_14_eye_wide', {move: push(1.04, 1.06), fx: 'shake'}),
			again('b_06_stairs', 'narrator_046_then_another', 'd_13_stairwell', {grade: 1.75, move: push(1.12, 1.15, 0.45, 0.6), fx: 'shake'}),
			// "And after every few steps, there was a horrible scraping sound." / "Like someone dragging something heavy across concrete."
			again('b_07_scrape', 'narrator_047_scraping', 'd_15_sack', {seq: [['base', 0], ['sack1', 0.55]], move: push(1.04, 1.1)}),
			again('b_08_drag', 'narrator_048_dragging_concrete', 'd_15_sack', {seq: [['sack1', 0], ['sack2', 0.4]], move: push(1.1, 1.16)}),
			// "I pressed my ear against the door."
			close('b_09_ear', 'narrator_049_ear_door', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				blink: true,
				mood: MOOD.flat,
				prompt: 'Close-up in the dark: Sarah presses her ear and cheek flat against the inside of her wooden front door, eyes wide, holding her breath, listening; auburn hair falling over her face; a faint yellow-green glow from the door\'s edge.',
				move: push(1.03, 1.08),
			}, <>
				<rect x={960} y={0} width={960} height={1080} fill="#3a2a1f" />
				<Person who="sarah" x={760} y={1800} h={1700} facing="right" />
			</>),
			// "The footsteps stopped." / "For a few seconds, there was complete silence."
			again('b_10_stopped', 'narrator_050_stopped', 'd_09_facing_stairs', {move: push(1.1, 1.18, 0.52, 0.45)}),
			again('b_11_silence', 'narrator_051_silence', 'd_07_peephole_pov', {move: push(1.02, 1.1)}),
			// "Then I heard a woman's voice from somewhere below." - the landing below, a lit doorway
			shot('b_12_below', 'narrator_052_womans_voice', 'stairwell', {
				noPeople: true,
				dark: true,
				quality: 'medium',
				grade: 1.3,
				mood: MOOD.stair,
				prompt: 'Looking down through the gap between the stair railings to the third-floor landing far below: a door there stands half open and a sliver of warm yellow light spills from it across the dark landing. Nobody visible.',
				variants: [{name: 'closed', prompt: 'The door on the landing below is now CLOSED: the sliver of warm light is gone; the landing is dark. Nothing else changes.'}],
				move: push(1.04, 1.12, 0.5, 0.55),
			}, {cam: {z: 1.3, cx: 880, cy: 620}}),
			again('b_13_below', 'narrator_053_man_whispering', 'b_12_below', {grade: 1.3, move: push(1.12, 1.24, 0.5, 0.58)}),
			// "Then came a scream." - the scream
			again('b_14_scream', 'narrator_054_scream', 'd_17_sarah_afraid', {fx: 'shake', move: push(1.1, 1.18, 0.5, 0.42), blink: true}),
			// "A terrible, desperate scream." - the boy cries without a sound
			again('b_15_boy', 'narrator_055_terrible', 'd_11_mother', {show: 'cry', move: push(1.06, 1.12)}),
			// "It lasted only a few seconds."
			again('b_16_frozen', 'narrator_056_few_seconds', 'd_08_still', {move: push(1.12, 1.2)}),
			// "Suddenly, it stopped."
			again('b_17_dark', 'narrator_057_stopped', 'd_13_stairwell', {grade: 1.1, move: push(1.1, 1.12, 0.45, 0.6)}),
			// "I heard something dragging across the floor."
			again('b_18_drag', 'narrator_058_dragging_floor', 'd_15_sack', {show: 'sack2', move: push(1.14, 1.22)}),
			// "Then the sound of a door closing." - the light below goes out
			again('b_19_door', 'narrator_059_door_closing', 'b_12_below', {grade: 1.3, seq: [['base', 0], ['closed', 0.42]], move: push(1.2, 1.24, 0.5, 0.58)}),
			// "And the footsteps started again." - the shadow climbs
			again('b_20_again', 'narrator_060_started_again', 'b_02_top_stairs', {grade: 1.5, move: push(1.06, 1.16, 0.5, 0.55)}, {overlay: ({f, d}) => <StairShadow f={f} d={d} x={700} y={820} />}),
			// "This time, they were closer."
			again('b_21_closer', 'narrator_061_closer', 'd_06_eye_peephole', {move: push(1.2, 1.32, 0.6, 0.42)}),
			// "Whatever was down there was coming upstairs."
			again('b_22_up', 'narrator_062_coming_upstairs', 'd_14_eye_wide', {show: 'wide', move: push(1.05, 1.16)}),
		]}
	/>
);
