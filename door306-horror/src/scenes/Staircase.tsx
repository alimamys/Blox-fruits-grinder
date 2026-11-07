// 9. THE STAIRCASE - dragged past every neighbour; their doors close one by one.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {CreatureFig, Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {Black, MOOD, prog} from './common';
import {again, close, code, push, shot} from './kit';

const CORRIDOR = 'Night, the corridor\'s sickly yellow-green fluorescent light, one tube flickering, cold blue shadows.';

export const Staircase: React.FC = () => (
	<Shots
		shots={[
			again('i_00_almost', 'narrator_179_almost_bedroom', 'h_31_run', {fx: 'shake', move: push(1.14, 1.24, 0.62, 0.48)}),
			// "Then something wrapped around my ankle." / "The grip was ice cold."
			close('i_01_ankle', 'narrator_180_ankle', {
				chars: ['creature', 'sarah'],
				loc: 'flat',
				quality: 'high',
				fx: 'shake',
				mood: MOOD.flat,
				prompt: 'Close-up on the dark floorboards: impossibly long, thin grey fingers wrapped tight around Sarah\'s bare ankle (her grey sweatpant leg), gripping; cold, bony, terrible. No blood.',
				move: push(1.03, 1.12),
			}, <>
				<rect x={0} y={700} width={1920} height={380} fill="#3a2a1f" />
				<rect x={700} y={380} width={500} height={160} rx={60} fill="#b9bcbf" />
				<path d="M1500,200 Q1250,420 1000,470" stroke="#8d8f8a" strokeWidth={36} fill="none" />
			</>),
			again('i_02_cold', 'narrator_181_ice_cold', 'i_01_ankle', {move: push(1.16, 1.26)}),
			// "I fell so hard that the air left my lungs."
			shot('i_03_fall', 'narrator_182_fell', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				fx: 'shake',
				mood: MOOD.flat,
				prompt: 'Low angle in the dark short corridor of her flat: Sarah has fallen flat on her front on the floorboards, winded, gasping, one arm stretched toward the bedroom door ahead, her hair over her face; something unseen holds her ankle behind her (out of frame).',
				move: push(1.04, 1.1),
			}, {cam: {z: 1.6, cx: 1380, cy: 600}, kids: <Person who="sarah" x={1380} y={880} h={520} facing="left" tilt={-80} />}),
			// "I grabbed the edge of the carpet."
			close('i_04_rug', 'narrator_183_carpet', {
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				mood: MOOD.flat,
				prompt: 'Close-up: Sarah\'s hands claw at the edge of the faded rug on the dark floorboards, fingers digging in, the rug bunching as she is pulled backward. Natural hands, five fingers each.',
				variants: [{name: 'scratch', prompt: 'Her fingernails now scrape across the bare floorboards, leaving pale scratch marks in the wood, the rug pulled out of her grip. Nothing else changes. No blood.'}],
				move: push(1.03, 1.08),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a2a1f" />
				<rect x={0} y={500} width={1920} height={200} fill="#6b4b3a" />
				<circle cx={800} cy={600} r={80} fill="#f0cdb4" />
				<circle cx={1100} cy={620} r={80} fill="#f0cdb4" />
			</>),
			// "The creature began pulling me backward." - the floor slides away
			again('i_05_pulling', 'narrator_184_pulling', 'i_03_fall', {fx: 'shake', move: {z0: 1.12, z1: 1.12, x0: 0.42, y0: 0.5, x1: 0.62, y1: 0.5}}),
			// "My fingernails scraped across the floor."
			again('i_06_nails', 'narrator_185_fingernails', 'i_04_rug', {seq: [['base', 0], ['scratch', 0.3]], fx: 'tremble', move: push(1.06, 1.14)}),
			// "I grabbed the doorframe." / hold on / harder
			shot('i_07_doorframe', 'narrator_186_doorframe', 'flat', {
				chars: ['sarah'],
				quality: 'high',
				mood: 'Corridor light floods in through the wide-open front door; the flat dark around it.',
				prompt: 'At her wide-open front door: Sarah, on her stomach on the floor, clings to the wooden doorframe with both hands, her body stretched out as she is being dragged backward out into the corridor; her face contorted with effort and terror.',
				move: push(1.03, 1.1),
			}, {cam: {z: 1.7, cx: 920, cy: 560}, kids: <Person who="sarah" x={920} y={840} h={520} facing="front" pose="reach" tilt={70} />}),
			again('i_08_hold', 'narrator_187_hold_on', 'i_07_doorframe', {move: push(1.12, 1.2), fx: 'tremble'}),
			again('i_09_harder', 'narrator_188_harder', 'i_07_doorframe', {fx: 'shake', move: push(1.2, 1.14)}),
			// "I was dragged out into the corridor." - beat: dragged out
			shot('i_10_corridor', 'narrator_189_corridor', 'hallway_cross', {
				chars: ['sarah', 'creature'],
				quality: 'high',
				fx: 'shake',
				mood: CORRIDOR,
				prompt: 'In the corridor: Sarah is dragged on her back across the green carpet by her ankle, arms flailing; only the creature\'s long grey arm is visible, reaching in from the left edge of frame and holding her ankle; doors around them.',
				move: {z0: 1.06, z1: 1.06, x0: 0.6, y0: 0.55, x1: 0.42, y1: 0.55},
			}, {cam: {z: 1.4, cx: 960, cy: 640}, kids: <Person who="sarah" x={1000} y={980} h={500} facing="front" tilt={-75} />}),
			// "Every neighbor was watching."
			again('i_11_watching', 'narrator_190_watching', 'd_07_peephole_pov', {show: 'turned', move: push(1.04, 1.1)}),
			// SARAH: "HELP ME! SOMEBODY HELP ME!"
			shot('i_12_help', 'sarah_014_help_me', 'hallway_cross', {
				kind: 'talk',
				chars: ['sarah'],
				quality: 'high',
				talk: ['sarah_014_help_me', 'sarah_015_you_can_stop'],
				mood: CORRIDOR,
				prompt: 'Close on Sarah lying on the corridor carpet, being dragged, reaching one hand toward the camera (toward her neighbours), screaming for help, tears on her face, hair spread on the carpet.',
				fx: 'tremble',
				move: push(1.03, 1.08),
			}, {cam: {z: 2.0, cx: 960, cy: 820}, kids: <Person who="sarah" x={960} y={1060} h={560} facing="front" pose="reach" />}),
			// "Nobody moved." / the mother / the old man
			again('i_13_nobody', 'narrator_191_nobody_moved', 'd_07_peephole_pov', {show: 'turned', move: push(1.2, 1.24)}),
			again('i_14_mother', 'narrator_192_mother_held', 'd_11_mother', {show: 'away', move: push(1.1, 1.18)}),
			again('i_15_oldman', 'narrator_193_old_man_floor', 'c_05_oldman', {fx: 'tremble', move: push(1.08, 1.14)}),
			// "I reached toward Mr. Harris." + "Please! You can stop this!"
			again('i_16_reach', 'narrator_194_reached_harris', 'i_12_help', {move: push(1.1, 1.14)}),
			again('i_17_stop', 'sarah_015_you_can_stop', 'i_12_help', {talk: ['sarah_015_you_can_stop'], move: push(1.14, 1.2)}),
			// "He looked at me." / might help / "I'm sorry."
			again('i_18_looked', 'narrator_195_looked_at_me', 'd_10_harris_frozen', {show: 'tears', move: push(1.12, 1.18, 0.45, 0.4)}),
			again('i_19_might', 'narrator_196_might_help', 'd_10_harris_frozen', {show: 'tears', move: push(1.2, 1.4, 0.45, 0.38)}),
			// "Then he stepped aside."
			shot('i_20_aside', 'narrator_197_stepped_aside', 'hallway_cross', {
				chars: ['harris'],
				quality: 'high',
				mood: CORRIDOR,
				prompt: 'Mr. Harris steps aside against the wall of the corridor, eyes on the floor, crying, making way; the dark open doorway of his flat beside him.',
				move: push(1.03, 1.1),
			}, {cam: {z: 2.0, cx: 900, cy: 480}, kids: <Person who="harris" x={880} y={820} h={470} facing="right" />}),
			// "The creature dragged me toward the stairs." - from the stairwell end
			shot('i_21_to_stairs', 'narrator_198_toward_stairs', 'hallway', {
				chars: ['creature', 'sarah'],
				quality: 'high',
				fx: 'flicker',
				mood: CORRIDOR,
				prompt: 'Down the long corridor toward the black stairwell opening at the far end: the hunched grey creature, seen from behind, drags Sarah by the ankle along the green carpet toward the stairs, the stained sack dragging behind it; Sarah\'s arms trailing.',
				move: push(1.03, 1.12, 0.52, 0.5),
			}, {kids: <>
				<CreatureFig x={1000} y={760} h={360} />
				<Person who="sarah" x={1000} y={900} h={300} facing="back" tilt={-80} />
			</>}),
			again('i_22_sack', 'narrator_199_sack_behind', 'f_13_sack', {show: 'bulge', grade: 1.3, move: push(1.06, 1.14)}),
			again('i_23_moving', 'narrator_200_still_moving', 'f_13_sack', {seq: [['base', 0], ['bulge', 0.25], ['base', 0.5], ['bulge', 0.72]], grade: 1.3, move: push(1.14, 1.22)}),
			// "I tried to grab the railing." / "But its fingers tightened around my ankle."
			close('i_24_railing', 'narrator_201_railing', {
				chars: ['sarah'],
				loc: 'stairwell',
				quality: 'high',
				mood: MOOD.stair,
				prompt: 'Close-up at the top of the stairs: Sarah\'s hand reaches desperately for the black metal railing posts, fingertips just brushing the metal, slipping away; flickering light.',
				fx: 'tremble',
				move: push(1.03, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#1d2620" />
				<path d="M200,300 L1800,300 M500,300 L500,1080 M1000,300 L1000,1080 M1500,300 L1500,1080" stroke="#4a514a" strokeWidth={30} />
				<circle cx={1100} cy={520} r={80} fill="#f0cdb4" />
			</>),
			again('i_25_tightened', 'narrator_202_tightened', 'i_01_ankle', {fx: 'shake', move: push(1.26, 1.36)}),
			// SARAH (crying): "Please... I don't want to die..."
			shot('i_26_top_step', 'sarah_016_dont_want_to_die', 'stairwell', {
				kind: 'talk',
				chars: ['sarah'],
				quality: 'high',
				talk: ['sarah_016_dont_want_to_die'],
				mood: MOOD.stair,
				prompt: 'Close on Sarah lying on her back on the top concrete steps of the stairwell, being pulled down, crying, tears streaming, pleading, her hair spilling over the step; flickering caged light above.',
				move: push(1.03, 1.08),
			}, {cam: {z: 2.0, cx: 900, cy: 520}, kids: <Person who="sarah" x={900} y={760} h={520} facing="front" tilt={-70} />}),
			// "It pulled me down the first step." / "Then another."
			again('i_27_first', 'narrator_203_first_step', 'i_21_to_stairs', {fx: 'shake', move: push(1.5, 1.7, 0.52, 0.45)}),
			again('i_28_another', 'narrator_204_another', 'd_13_stairwell', {grade: 1.6, fx: 'shake', move: push(1.1, 1.14, 0.45, 0.6)}),
			// "I looked back." - from the stairs, back along the corridor: the neighbours in their doorways
			again('i_29_back', 'narrator_205_looked_back', 'i_26_top_step', {move: push(1.12, 1.18)}),
			shot('i_30_lookback', 'narrator_206_still_standing', 'hallway', {
				chars: ['harris', 'mother', 'residents'],
				quality: 'high',
				mood: CORRIDOR,
				prompt: 'From the top of the stairs looking back up the long corridor: the residents and Mr. Harris stand in the open doorways of their flats along both walls, all watching us in silence, expressionless; every door wide open.',
				doors: {prompt: 'Every door along the corridor is now CLOSED and nobody is visible - the corridor is empty and silent. Nothing else changes.', start: 99, loose: true},
				move: push(1.02, 1.06),
			}, {kids: <>
				<Person who="oldman" x={795} y={765} h={300} facing="front" />
				<Person who="lilac" x={1235} y={765} h={300} facing="front" />
				<Person who="mother" x={670} y={905} h={520} facing="front" pose="holdChild" />
				<Person who="harris" x={1350} y={905} h={520} facing="front" />
				<Person who="robe" x={300} y={1120} h={900} facing="front" />
				<Person who="beard" x={1660} y={1130} h={950} facing="front" />
			</>}),
			again('i_31_watching', 'narrator_207_watching', 'i_30_lookback', {move: push(1.1, 1.16)}),
			again('i_32_word', 'narrator_208_not_a_word', 'd_08_still', {move: push(1.14, 1.2)}),
			// "Then, slowly, they began closing their doors." / "One by one." + beat - the doors close
			again('i_33_closing', 'narrator_209_closing_doors', 'i_30_lookback', {doors: {prompt: '', start: 0.35, stagger: 1.1, swing: 0.6}, move: push(1.06, 1.14)}),
			again('i_34_closed', 'narrator_210_one_by_one', 'i_30_lookback', {show: 'open', move: push(1.14, 1.2)}),
			// "Until the only sounds left were my screams..." / "And the thing dragging me down the staircase." - into the dark
			again('i_35_screams', 'narrator_211_my_screams', 'd_13_stairwell', {grade: 1.2, move: push(1.06, 1.3, 0.45, 0.65)}),
			code('i_36_fade', 'narrator_212_dragging_down', ({f, d}) => (
				<AbsoluteFill style={{background: '#000'}}>
					<AbsoluteFill style={{opacity: 1 - prog(f, d * 3.2)}}>
						<StairFade f={f} />
					</AbsoluteFill>
				</AbsoluteFill>
			)),
			code('i_37_black', 'fade_dark', () => <Black />),
		]}
	/>
);

/** The stairwell frame sinking into black (plain image, no art pipeline needed). */
const StairFade: React.FC<{f: number}> = ({f}) => (
	<Img src={staticFile('restyle/d_13_stairwell_k1.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `scale(${1.3 + f * 0.002})`, filter: 'brightness(1.1)'}} />
);
