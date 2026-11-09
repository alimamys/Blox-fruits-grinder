// 3. FACING AWAY - the first night. Three go to Wyatt's house; three come running back.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const FacingAway: React.FC = () => (
	<Shots
		shots={[
			shot('f_00_leave', 'dusk_leave', 'clearing', {
				chars: ['wyatt', 'cousins'],
				quality: 'medium',
				mood: MOOD.dusk,
				prompt: 'Dusk in the clearing: WYATT, DEZ and NIA walk away down the dirt track between the dark pines with flashlights already on, their beams bobbing; the campfire glows in the foreground. Seen from behind.',
				move: push(1.0, 1.08, 0.55, 0.5),
			}, {kids: <>
				<Person who="wyatt" x={1040} y={620} h={170} facing="back" />
				<Person who="dez" x={1110} y={625} h={190} facing="back" />
				<Person who="nia" x={1175} y={625} h={160} facing="back" />
			</>}),
			again('f_01_seven', 'narrator_024_around_seven', 'f_00_leave', {move: push(1.08, 1.16, 0.55, 0.48)}),
			shot('f_02_fire', 'narrator_025_dez_nia', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'Night in the clearing: the rest of the teenagers sit around the crackling campfire - Marcus, Ray, Tasha, Jada, Kayla, Andre, Jamal and Trey - faces lit orange, toasting marshmallows on sticks, the pine woods pitch black behind them.',
				move: push(1.02, 1.08, 0.5, 0.6),
			}, {kids: <>
				<Person who="marcus" x={640} y={830} h={300} facing="right" />
				<Person who="ray" x={560} y={800} h={240} facing="right" />
				<Person who="tasha" x={720} y={960} h={330} facing="back" />
				<Person who="andre" x={860} y={980} h={330} facing="back" />
				<Person who="jada" x={990} y={980} h={280} facing="back" />
				<Person who="kayla" x={1250} y={800} h={290} facing="left" />
				<Person who="jamal" x={1380} y={800} h={320} facing="left" />
				<Person who="trey" x={1110} y={990} h={340} facing="back" />
			</>}),
			close('f_03_smell', 'narrator_026_forty_minutes', {
				chars: ['marcus'],
				loc: 'clearing',
				quality: 'high',
				blink: true,
				mood: MOOD.fire,
				prompt: 'Close-up of Marcus by the campfire at night, firelight on one side of his face: he wrinkles his nose at a bad smell and turns his head slowly toward the black woods, uneasy.',
				move: push(1.03, 1.09, 0.5, 0.42),
			}, <Person who="marcus" x={960} y={1900} h={1700} facing="front" />, {bg: '#3a1e0c'}),
			shot('f_04_copper', 'narrator_027_copper', 'clearing', {
				chars: ['cousins', 'others'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'By the campfire at night: RAY pulls the collar of his mustard T-shirt over his nose, TASHA grimaces and waves a hand in front of her face, ANDRE looks around for the source of the smell.',
				move: push(1.02, 1.07),
			}, {cam: {z: 1.7, cx: 900, cy: 700}, kids: <>
				<Person who="ray" x={760} y={980} h={460} facing="front" />
				<Person who="tasha" x={980} y={990} h={520} facing="front" />
				<Person who="andre" x={1180} y={1000} h={520} facing="left" />
			</>}),
			again('f_05_stoves', 'narrator_028_stoves', 't_08_empty_pot', {move: push(1.08, 1.16, 0.4, 0.5)}),

			shot('f_06_beams', 'narrator_029_running', 'clearing', {
				noPeople: true,
				quality: 'medium',
				fx: 'shake',
				mood: MOOD.fire,
				prompt: 'Night: the black mouth of the dirt track at the edge of the firelight, and deep inside the woods the white beams of flashlights swinging wildly between the pine trunks, coming fast. No people visible yet.',
				move: push(1.0, 1.12, 0.55, 0.5),
			}, {cam: {z: 1.6, cx: 1040, cy: 520}}),
			shot('f_07_burst', 'narrator_030_burst_out', 'clearing', {
				chars: ['wyatt', 'cousins'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'Night: WYATT, DEZ and NIA burst out of the dark woods into the firelight at full sprint, faces white with terror, flashlights swinging, racing past the campfire toward the trailer door. Motion and panic.',
				move: push(1.02, 1.1),
			}, {kids: <>
				<Person who="wyatt" x={880} y={820} h={420} facing="left" />
				<Person who="dez" x={1080} y={840} h={470} facing="left" />
				<Person who="nia" x={1250} y={830} h={410} facing="left" />
			</>}),
			shot('f_08_dez', 'narrator_031_dez_crying', 'trailer', {
				chars: ['cousins'],
				quality: 'high',
				mood: MOOD.trailerNight,
				prompt: 'Inside the trailer under the weak light: big muscular DEZ sits hunched on the bench with his face half in his hands, crying, shoulders shaking - the toughest person in the family, broken.',
				move: push(1.03, 1.1, 0.5, 0.45),
			}, {cam: {z: 1.9, cx: 860, cy: 560}, kids: <Person who="dez" x={860} y={800} h={560} facing="front" />}),
			close('f_09_wyatt_talk', 'wyatt_001_lock_door', {
				kind: 'talk',
				chars: ['wyatt'],
				loc: 'trailer',
				quality: 'high',
				talk: ['wyatt_001_lock_door'],
				mood: MOOD.trailerNight,
				prompt: 'Close-up: WYATT with his back pressed against the inside of the trailer door, sweaty, eyes wide with terror, out of breath, shouting at the others.',
				move: push(1.02, 1.06, 0.5, 0.42),
			}, <Person who="wyatt" x={960} y={1850} h={1600} facing="front" />, {bg: '#3a2a1c'}),
			close('f_10_lock', 'locked', {
				chars: ['marcus'],
				loc: 'trailer',
				quality: 'medium',
				mood: MOOD.trailerNight,
				prompt: 'Insert close-up: a hand in a dark-red hoodie sleeve turns the small lock knob on the inside of the trailer\'s metal door. Five fingers, natural hand.',
				move: push(1.04, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#8a8a84" />
				<circle cx={960} cy={540} r={70} fill="#5a5a55" />
				<rect x={1000} y={480} width={500} height={120} fill="#8a1f22" />
			</>),
			shot('f_11_pig', 'narrator_033_pig', 'farm', {
				chars: ['adults', 'wyatt'],
				quality: 'medium',
				mood: 'Overcast grey late afternoon at the farm, a few days earlier; flies in the air.',
				prompt: 'The Dawes farmyard: MR. DAWES and WYATT stand at the pig pen with the broken fence rail, staring down at something on the ground that the fence hides from us - we never see it. Grim faces, flies circling.',
				move: push(1.02, 1.08, 0.4, 0.55),
			}, {cam: {z: 1.4, cx: 700, cy: 640}, kids: <>
				<Person who="dawes" x={560} y={900} h={420} facing="right" />
				<Person who="wyatt" x={700} y={900} h={380} facing="right" />
			</>}),
			shot('f_12_figure', 'narrator_034_flashlight', 'trail', {
				chars: ['thing'],
				quality: 'high',
				mood: MOOD.trailNight,
				prompt: 'Night on the forest trail, seen along a flashlight beam: the hard white cone of light picks out a MAN standing perfectly still among the trees in the small hollow just off the path - tall, thin, dark clothes - with his BACK to the viewer. We see no face. Everything outside the beam is black.',
				move: push(1.0, 1.06, 0.6, 0.45),
			}, {kids: <Person who="figure" x={1240} y={700} h={420} facing="back" />}),
			again('f_13_back', 'narrator_035_just_standing', 'f_12_figure', {move: push(1.08, 1.22, 0.64, 0.42)}),
			shot('f_14_another', 'narrator_037_another', 'trail', {
				chars: ['thing'],
				quality: 'medium',
				mood: MOOD.trailNight,
				prompt: 'Night on the forest trail, the other side of the path: a flashlight beam swings onto a SECOND tall thin figure standing between the trunks much closer to the path, also perfectly still, also with its back turned. No face. Black woods all around.',
				move: push(1.02, 1.1, 0.35, 0.45),
			}, {kids: <Person who="figure" x={600} y={800} h={560} facing="back" />}),
			again('f_15_closer', 'narrator_038_closer', 'f_14_another', {move: push(1.12, 1.24, 0.33, 0.42)}),
			shot('f_16_frozen', 'narrator_040_gibbering', 'trail', {
				chars: ['wyatt', 'cousins'],
				quality: 'high',
				mood: 'Night on the trail: only their own shaking flashlights light their faces from below.',
				prompt: 'Night on the forest trail: WYATT, DEZ and NIA stand frozen shoulder to shoulder, their flashlights trembling, faces lit from below, eyes wide, listening to something in the dark woods on both sides of them.',
				move: push(1.02, 1.1, 0.5, 0.45),
			}, {cam: {z: 1.5, cx: 900, cy: 620}, kids: <>
				<Person who="nia" x={780} y={960} h={520} facing="front" />
				<Person who="dez" x={940} y={970} h={600} facing="front" />
				<Person who="wyatt" x={1100} y={960} h={560} facing="front" />
			</>}),
			shot('f_17_jerk', 'narrator_041_jerking', 'trail', {
				chars: ['thing'],
				quality: 'medium',
				fx: 'glitch',
				mood: MOOD.trailNight,
				prompt: 'Night: a flashlight beam catches a pale, blurred shape jerking itself between two tree trunks - too fast to see, limbs at wrong angles, smeared with motion blur. Unclear and wrong. Black woods.',
				move: push(1.04, 1.12),
			}, {cam: {z: 1.4, cx: 1000, cy: 520}, kids: <Person who="figure" x={1000} y={700} h={380} facing="left" tilt={-25} />}),
			shot('f_18_behind', 'narrator_042_stepped_out', 'clearing', {
				chars: ['thing'],
				quality: 'medium',
				dark: true,
				mood: MOOD.fire,
				prompt: 'Night, looking back down the dark dirt track from the edge of the campfire light: far down the path, where the firelight dies, a tall thin silhouette stands in the middle of the track, motionless. No details, only its shape.',
				move: push(1.0, 1.1, 0.55, 0.5),
			}, {cam: {z: 2.4, cx: 1080, cy: 520}, kids: <Person who="figure" x={1080} y={600} h={200} facing="front" />}),
			again('f_19_out', 'stepped_out', 'f_18_behind', {move: push(1.14, 1.3, 0.56, 0.48)}),
		]}
	/>
);
