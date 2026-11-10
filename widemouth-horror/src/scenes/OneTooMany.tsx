// 5. ONE TOO MANY - the second night: the hot dogs, the count, Nia's scream.
import React from 'react';
import {CountMark} from '../components/ui/Count';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';
import {FireCircle} from './Woods';

export const OneTooMany: React.FC = () => (
	<Shots
		shots={[
			shot('o_00_ghost', 'ghost_stories', 'clearing', {
				chars: ['marcus', 'wyatt', 'cousins', 'others'],
				quality: 'medium',
				mood: 'One in the morning: the campfire burned down to a red glow, faces lit from below, the woods black.',
				prompt: 'One in the morning around the low campfire: ANDRE holds a flashlight under his chin telling a ghost story, the others lean in grinning and squealing - Marcus, Wyatt, Dez, Ray, Nia, Tasha, Jada, Kayla, Jamal, Trey - wrapped in hoodies, the pine woods pitch black behind them.',
				move: push(1.02, 1.08, 0.5, 0.6),
			}, {kids: <FireCircle />}),
			again('o_01_night', 'narrator_056_second_night', 'o_00_ghost', {move: push(1.08, 1.14, 0.45, 0.6)}),
			shot('o_02_gag', 'narrator_057_gagging', 'clearing', {
				chars: ['others', 'cousins'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'By the campfire at night: JADA doubles over gagging with a hand over her mouth, TASHA pulls her hoodie over her nose, RAY coughs - a sudden thick foul smell has rolled over the clearing.',
				move: push(1.03, 1.09),
			}, {cam: {z: 1.7, cx: 900, cy: 720}, kids: <>
				<Person who="jada" x={760} y={1000} h={440} facing="front" />
				<Person who="tasha" x={980} y={990} h={520} facing="front" />
				<Person who="ray" x={1200} y={1000} h={440} facing="left" />
			</>}),
			shot('o_03_crowd_in', 'narrator_058_crowded', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'Night: the teenagers crowd up the two metal steps and squeeze through the narrow door of the trailer, pushing, looking back over their shoulders at the black woods.',
				move: push(1.03, 1.1, 0.4, 0.5),
			}, {cam: {z: 1.8, cx: 520, cy: 520}, kids: <>
				<Person who="dez" x={500} y={700} h={330} facing="back" />
				<Person who="nia" x={600} y={720} h={300} facing="left" />
				<Person who="marcus" x={700} y={740} h={320} facing="left" />
			</>}),
			again('o_04_cook', 'narrator_059_so_i_cooked', 't_01_packs', {move: push(1.06, 1.14, 0.35, 0.55)}),
			again('o_05_packs', 'narrator_060_three_packs', 't_03_stove', {move: push(1.06, 1.12, 0.3, 0.5), blink: true}, {overlay: (p) => <CountMark {...p} n="12" from={6} x={0.8} y={0.38} size={240} />}),
			again('o_06_know', 'narrator_061_you_know', 't_04_plates', {move: push(1.06, 1.12)}),
			close('o_07_ray_talk', 'ray_002_took_two', {
				kind: 'talk',
				chars: ['cousins'],
				loc: 'trailer',
				quality: 'high',
				talk: ['ray_002_took_two'],
				mood: MOOD.trailerNight,
				prompt: 'Close-up: RAY by the little stove holding the dented pot lid, glaring sideways at the camera, annoyed, complaining, eyebrows up behind his round glasses.',
				move: push(1.02, 1.07),
			}, <Person who="ray" x={960} y={1900} h={1600} facing="front" />, {bg: '#3a2a1c'}),
			close('o_08_marcus_talk', 'marcus_001_twelve', {
				kind: 'talk',
				chars: ['marcus'],
				loc: 'trailer',
				quality: 'high',
				talk: ['marcus_001_twelve'],
				mood: MOOD.trailerNight,
				prompt: 'Close-up: Marcus in the dim trailer, a paper plate with ONE hot dog in his hand, answering his cousin with a confused shrug - then his eyes begin to drift toward the others.',
				move: push(1.02, 1.07, 0.5, 0.42),
			}, <Person who="marcus" x={960} y={1900} h={1700} facing="front" />, {bg: '#3a2a1c'}),
			again('o_09_stopped', 'narrator_062_stopped', 't_06_hadnt', {move: push(1.12, 1.2, 0.5, 0.4), blink: true}),
			again('o_10_counting', 'counting', 't_09_bench', {move: {z0: 1.1, z1: 1.18, x0: 0.3, y0: 0.5, x1: 0.7, y1: 0.48}}),
			again('o_11_eleven', 'narrator_064_eleven', 't_07_crowd', {move: push(1.04, 1.1), fx: 'pulse'}, {overlay: (p) => <CountMark {...p} n="11" red x={0.5} y={0.32} size={360} />}),
			close('o_12_nia_scream', 'narrator_065_nia_screaming', {
				chars: ['cousins'],
				loc: 'trailer',
				quality: 'high',
				fx: 'shake',
				mood: MOOD.trailerNight,
				prompt: 'Close-up: NIA (long box braids, lavender hoodie) on the bench in the trailer, hands clawing at her own cheeks, eyes squeezed with terror, SCREAMING, tears on her face.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <Person who="nia" x={960} y={1900} h={1600} facing="front" />, {bg: '#3a2a1c'}),
			again('o_13_nia', 'nia_001_get_it_out', 'o_12_nia_scream', {fx: 'shake', move: push(1.1, 1.16, 0.5, 0.42)}),
			shot('o_14_burst', 'narrator_066_crashed', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				fx: 'shake',
				mood: MOOD.fire,
				prompt: 'Night: the trailer door bangs open and the teenagers tumble out down the metal steps into the firelit clearing, falling over each other in panic, Dez dragging Nia by the hand.',
				move: push(1.04, 1.1, 0.35, 0.5),
			}, {cam: {z: 1.6, cx: 600, cy: 540}, kids: <>
				<Person who="dez" x={600} y={760} h={330} facing="front" />
				<Person who="nia" x={700} y={780} h={300} facing="front" />
				<Person who="marcus" x={860} y={820} h={340} facing="right" />
				<Person who="tasha" x={420} y={790} h={320} facing="right" />
			</>}),
			shot('o_15_count_out', 'narrator_067_counted_again', 'clearing', {
				chars: ['marcus', 'wyatt', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'Night by the campfire: the frightened teenagers stand huddled together in the firelight, and Marcus, in front of them, points at each one in turn with a shaking finger, counting under his breath.',
				move: push(1.03, 1.1, 0.5, 0.55),
			}, {cam: {z: 1.3, cx: 960, cy: 700}, kids: <>
				<Person who="marcus" x={1300} y={1000} h={520} facing="left" pose="reach" />
				<Person who="dez" x={700} y={880} h={420} facing="right" />
				<Person who="nia" x={800} y={870} h={360} facing="right" />
				<Person who="ray" x={900} y={880} h={320} facing="right" />
				<Person who="wyatt" x={1000} y={870} h={380} facing="right" />
				<Person who="tasha" x={600} y={870} h={380} facing="right" />
			</>, overlay: (p) => <CountMark {...p} n="11" from={Math.round(p.d * 0.55)} x={0.2} y={0.3} size={300} />}),
			shot('o_16_sticks', 'narrator_069_sticks', 'clearing', {
				chars: ['marcus', 'cousins'],
				quality: 'medium',
				mood: MOOD.fire,
				prompt: 'Night: DEZ and Marcus creep up the trailer steps holding thick sticks like bats, a flashlight beam pointing in through the half-open door; the others hang back by the fire.',
				move: push(1.02, 1.09, 0.4, 0.5),
			}, {cam: {z: 1.9, cx: 520, cy: 520}, kids: <>
				<Person who="dez" x={520} y={720} h={330} facing="back" />
				<Person who="marcus" x={640} y={740} h={320} facing="back" />
			</>}),
			shot('o_17_empty', 'narrator_070_empty', 'trailer', {
				noPeople: true,
				quality: 'medium',
				mood: 'The trailer in the dark, lit only by two flashlight beams from the doorway.',
				prompt: 'The inside of the trailer in flashlight beams: completely EMPTY - paper plates scattered on the floor and the benches, the pot on the stove, a sleeping bag, the bathroom door at the back slightly ajar on darkness. Nobody there.',
				move: push(1.0, 1.08),
			}, {}),
			close('o_18_nia_tells', 'narrator_071_knee', {
				chars: ['cousins'],
				loc: 'clearing',
				quality: 'high',
				blink: true,
				mood: MOOD.fire,
				prompt: 'Close-up of NIA by the fire later that night, a blanket around her shoulders, hugging her knees, staring into the flames with wet, haunted eyes as she speaks quietly.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <Person who="nia" x={960} y={1900} h={1600} facing="front" />, {bg: '#3a1e0c'}),
			close('o_19_whisper', 'narrator_072_not_words', {
				chars: ['thing', 'cousins'],
				loc: 'trailer',
				quality: 'high',
				dark: true,
				mood: 'Near darkness in the trailer; one sliver of warm light.',
				prompt: 'Extreme close-up in the dark trailer: NIA\'s frozen face in a sliver of light, eyes wide, while right beside her ear a shadowed mouth - the face it belongs to is lost in darkness - whispers something. A grey hand grips her knee.',
				move: push(1.03, 1.1, 0.45, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#0b0b0e" />
				<circle cx={760} cy={480} r={260} fill="#5f3c2a" />
				<circle cx={1180} cy={470} r={260} fill="#18181c" />
			</>),
			again('o_20_face', 'narrator_073_its_face', 'o_18_nia_tells', {move: push(1.1, 1.18, 0.5, 0.42), blink: true}),
		]}
	/>
);
