// 6. SEVEN - four go home, Wyatt goes for his rifle, "Nia" comes back. Six of us; we were seven.
import React from 'react';
import {CountMark} from '../components/ui/Count';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

/** The six who stayed (Marcus, Dez, Ray, Tasha, Kayla, Trey) - and, a little apart, one more. */
const Stayed: React.FC<{extra?: boolean}> = ({extra = true}) => (
	<>
		<Person who="marcus" x={700} y={900} h={420} facing="front" />
		<Person who="dez" x={840} y={890} h={470} facing="front" />
		<Person who="ray" x={960} y={900} h={350} facing="front" />
		<Person who="tasha" x={1070} y={895} h={410} facing="front" />
		<Person who="kayla" x={1180} y={900} h={390} facing="front" />
		<Person who="trey" x={1300} y={895} h={440} facing="front" />
		{extra ? <Person who="figure" x={1520} y={880} h={410} facing="left" /> : null}
	</>
);

export const Seven: React.FC = () => (
	<Shots
		shots={[
			shot('s_00_leave', 'sunrise', 'clearing', {
				chars: ['cousins', 'others'],
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Misty dawn in the clearing: four teenagers with backpacks - NIA, JADA, ANDRE and JAMAL - walk away down the dirt track into the pines; NIA looks back over her shoulder, pale and scared.',
				move: push(1.0, 1.08, 0.55, 0.5),
			}, {kids: <>
				<Person who="nia" x={1040} y={640} h={180} facing="left" />
				<Person who="jada" x={1100} y={640} h={160} facing="back" />
				<Person who="andre" x={1160} y={645} h={190} facing="back" />
				<Person who="jamal" x={1220} y={640} h={190} facing="back" />
			</>}),
			close('s_01_keys', 'narrator_076_keys', {
				chars: ['marcus'],
				loc: 'clearing',
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Insert close-up: Marcus\'s hand (dark-red hoodie sleeve) holding a ring of old keys - the trailer keys - in the misty morning light, the trailer door blurred behind. Natural hand, five fingers.',
				move: push(1.04, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#8a8476" />
				<rect x={700} y={420} width={520} height={260} fill="#6e4630" />
			</>),
			shot('s_02_wyatt_goes', 'narrator_077_rifle', 'clearing', {
				chars: ['wyatt'],
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Morning in the clearing: WYATT walks off between the pines toward his farm, glancing back once at the trailers, serious.',
				move: push(1.02, 1.08, 0.6, 0.5),
			}, {cam: {z: 1.6, cx: 1150, cy: 560}, kids: <Person who="wyatt" x={1180} y={760} h={380} facing="right" />}),
			shot('s_03_seven', 'narrator_078_seven_left', 'clearing', {
				chars: ['marcus', 'cousins', 'others', 'thing'],
				quality: 'high',
				mood: 'Midday in the clearing, flat bright light.',
				prompt: 'The teenagers who stayed stand in a loose group by the trailer steps in flat midday light: MARCUS, DEZ, RAY, TASHA, KAYLA and TREY, arguing and laughing - and at the right edge of the group, a little apart, ONE MORE person with their face turned away from us, standing too still. Nobody looks at them.',
				move: push(1.02, 1.07, 0.55, 0.55),
			}, {cam: {z: 1.25, cx: 1050, cy: 640}, kids: <Stayed />}),
			again('s_04_said', 'narrator_079_at_least', 's_03_seven', {move: push(1.1, 1.2, 0.8, 0.5), grade: 0.9}),
			shot('s_05_pit', 'afternoon', 'clearing', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.afternoonStill,
				prompt: 'Late afternoon: the dead fire pit in the empty clearing, grey ash, a thin curl of smoke, the light going amber and flat, the trailers silent, not a needle moving.',
				move: push(1.0, 1.06, 0.5, 0.7),
			}, {cam: {z: 1.4, cx: 920, cy: 760}}),
			shot('s_06_nia_back', 'narrator_080_nia_back', 'clearing', {
				chars: ['cousins'],
				quality: 'high',
				mood: MOOD.afternoonStill,
				prompt: 'NOBODY in the foreground - only the dark edges of the trailer\'s open doorway framing the view. Outside, in the otherwise EMPTY clearing, ONE girl with long box braids in a lavender hoodie - NIA - stands perfectly still beside the dead fire pit, medium size in frame, with her BACK to us, arms hanging at her sides. Amber flat light. Wrong somehow.',
				variants: [{name: 'hitch', prompt: 'Her shoulders are now hunched up high and her head tipped slightly forward, as if shaking with silent laughter. Nothing else changes.'}],
				move: push(1.02, 1.1, 0.5, 0.55),
			}, {cam: {z: 1.5, cx: 900, cy: 700}, kids: <Person who="nia" x={900} y={880} h={420} facing="back" />}),
			again('s_07_still', 'narrator_083_faint', 's_06_nia_back', {move: push(1.1, 1.16, 0.5, 0.55)}),
			again('s_08_silent', 'narrator_084_silent', 's_05_pit', {move: push(1.06, 1.14, 0.5, 0.65), grade: 0.85}),
			again('s_09_shake', 'narrator_085_shoulders', 's_06_nia_back', {
				seq: [['base', 0], ['hitch', 0.18], ['base', 0.3], ['hitch', 0.44], ['base', 0.56], ['hitch', 0.7], ['base', 0.82], ['hitch', 0.92]],
				fx: 'tremble',
				move: push(1.16, 1.3, 0.5, 0.5),
			}),
			shot('s_10_froze', 'narrator_088_froze', 'clearing', {
				chars: ['others', 'cousins'],
				quality: 'medium',
				mood: MOOD.afternoonStill,
				prompt: 'ONLY TWO PEOPLE in the whole frame. The empty clearing in amber light: KAYLA (green flannel, ponytail) has walked halfway across toward the girl with box braids and a lavender hoodie who stands by the fire pit with her back turned - and Kayla has frozen mid-step, one hand half raised, afraid. Nobody else anywhere.',
				move: push(1.02, 1.08),
			}, {cam: {z: 1.4, cx: 900, cy: 700}, kids: <>
				<Person who="kayla" x={620} y={900} h={420} facing="right" pose="reach" />
				<Person who="nia" x={1000} y={860} h={380} facing="back" />
			</>}),
			close('s_11_marcus_shout', 'marcus_002_get_back', {
				kind: 'talk',
				chars: ['marcus'],
				loc: 'clearing',
				quality: 'high',
				talk: ['marcus_002_get_back'],
				mood: MOOD.afternoonStill,
				prompt: 'Close-up: Marcus leaning out of the trailer doorway, gripping the frame, shouting urgently at someone outside, eyes wide with fear.',
				move: push(1.02, 1.06),
			}, <Person who="marcus" x={960} y={1900} h={1700} facing="front" />, {bg: '#8a6a3a'}),
			shot('s_12_blinds', 'narrator_089_blinds', 'trailer', {
				chars: ['cousins', 'others'],
				quality: 'medium',
				mood: 'Dusk inside the trailer, the blinds coming down, the light going grey-blue.',
				prompt: 'ONLY TWO PEOPLE in frame, close: inside the trailer at dusk, DEZ yanks a yellowed roll-down blind down over the window; TREY (flat-top, charcoal hoodie) sits on a chair at the one window left uncovered, peering out through the gap. Tense, silent.',
				move: push(1.02, 1.08, 0.65, 0.45),
			}, {cam: {z: 1.8, cx: 1400, cy: 520}, kids: <>
				<Person who="dez" x={1560} y={850} h={640} facing="right" pose="reach" />
				<Person who="trey" x={1240} y={900} h={560} facing="right" />
			</>}),
			again('s_13_twenty', 'narrator_090_twenty', 's_06_nia_back', {move: push(1.24, 1.3, 0.5, 0.5), grade: 0.75}),
			shot('s_14_door', 'narrator_091_slammed', 'trailer', {
				noPeople: true,
				quality: 'medium',
				fx: 'shake',
				mood: MOOD.trailerDark,
				prompt: 'Inside the dark trailer, close on the metal front door from inside: the door shudders in its frame under a blow from outside, the little window in it black, the knob rattling. Nobody in frame.',
				move: push(1.04, 1.1, 0.62, 0.4),
			}, {cam: {z: 2.0, cx: 1250, cy: 400}}),
			shot('s_15_wyatt_in', 'narrator_092_with_rifle', 'trailer', {
				chars: ['wyatt', 'marcus'],
				quality: 'medium',
				mood: MOOD.trailerDark,
				prompt: 'Inside the trailer at dusk: WYATT stumbles in through the door with his hunting rifle held pointing at the floor, sweaty and white-faced, Marcus pulling the door shut behind him.',
				move: push(1.02, 1.08, 0.6, 0.45),
			}, {cam: {z: 1.4, cx: 1200, cy: 560}, kids: <>
				<Person who="wyatt" x={1100} y={900} h={620} facing="left" />
				<Person who="marcus" x={1360} y={920} h={600} facing="left" pose="reach" />
			</>}),
			shot('s_16_closer', 'narrator_093_turned_to_watch', 'clearing', {
				chars: ['thing'],
				quality: 'high',
				mood: MOOD.afternoonStill,
				prompt: 'Medium close shot at dusk in the clearing: a girl stands a few metres away by the dead fire pit, FACING THE CAMERA, her face large and clearly visible - it is NIA (long box braids, lavender hoodie) but WRONG: skin a shade too grey, eyes fixed, glassy and unblinking, jaw hanging slack. She stands perfectly still. Nobody else in frame.',
				variants: [{name: 'closer', prompt: 'The same girl now stands much CLOSER to the camera, larger in frame, in exactly the same pose and with the same fixed stare - as if she moved without anyone seeing. Nothing else changes.'}],
				seq: [['base', 0], ['closer', 0.66]],
				move: push(1.02, 1.08, 0.5, 0.45),
			}, {cam: {z: 2.4, cx: 940, cy: 560}, kids: <Person who="wrongNia" x={940} y={900} h={560} facing="front" />}),
			close('s_17_pale', 'narrator_096_went_pale', {
				chars: ['wyatt'],
				loc: 'trailer',
				quality: 'high',
				blink: true,
				mood: MOOD.trailerDark,
				prompt: 'Close-up: WYATT inside the dim trailer, the rifle against his chest, his eyes moving from face to face, going pale as a sheet.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <Person who="wyatt" x={960} y={1900} h={1600} facing="front" />, {bg: '#2a2620'}),
			close('s_18_wyatt_whisper', 'wyatt_003_only_six', {
				kind: 'talk',
				chars: ['wyatt', 'marcus'],
				loc: 'trailer',
				quality: 'high',
				talk: ['wyatt_003_only_six'],
				mood: MOOD.trailerDark,
				prompt: 'Close two-shot in the dim trailer: WYATT leans in to whisper into Marcus\'s ear, terrified; Marcus, in the foreground, listens with dread creeping across his face.',
				move: push(1.02, 1.06),
			}, <>
				<Person who="wyatt" x={1180} y={1700} h={1400} facing="left" />
				<Person who="marcus" x={700} y={1800} h={1500} facing="right" />
			</>, {bg: '#2a2620'}),
			again('s_19_six', 'narrator_097_math', 's_03_seven', {move: push(1.06, 1.12, 0.45, 0.55)}, {overlay: (p) => <CountMark {...p} n="6" from={Math.round(p.d * 0.5)} red x={0.5} y={0.3} size={360} />}),
			again('s_20_were_seven', 'narrator_099_all_afternoon', 's_03_seven', {move: push(1.2, 1.4, 0.82, 0.5), grade: 0.85}),
			again('s_21_left', 'narrator_101_inside_again', 's_17_pale', {move: push(1.12, 1.2, 0.5, 0.42), blink: true}),
		]}
	/>
);
