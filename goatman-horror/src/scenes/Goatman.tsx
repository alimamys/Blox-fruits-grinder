// 4. THE GOATMAN - Ray's legend; the smell switches off; a perfectly normal day.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const Goatman: React.FC = () => (
	<Shots
		shots={[
			close('g_00_ray_quiet', 'narrator_043_ray_quiet', {
				kind: 'talk',
				chars: ['cousins'],
				loc: 'trailer',
				quality: 'high',
				talk: ['ray_001_goatman'],
				mood: MOOD.trailerNight,
				prompt: 'Close-up inside the trailer: RAY (round glasses, twists, mustard T-shirt) sits on the floor hugging his knees, very quiet, staring at nothing with frightened eyes behind his glasses, his lips barely moving as he whispers.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <Person who="ray" x={960} y={1900} h={1600} facing="front" />, {bg: '#3a2a1c'}),
			again('g_01_ray_talk', 'ray_001_goatman', 'g_00_ray_quiet', {talk: ['ray_001_goatman'], move: push(1.1, 1.16, 0.5, 0.42)}),
			again('g_02_shut_up', 'narrator_044_shut_up', 't_07_crowd', {move: push(1.08, 1.12, 0.3, 0.55)}),
			shot('g_03_legend', 'narrator_046_stories', 'trail', {
				chars: ['thing'],
				quality: 'medium',
				dark: true,
				mood: 'An old campfire legend: moonless mist between black pine trunks, cold blue-grey haze.',
				prompt: 'The legend: deep in the misty pine woods at night, the dark SILHOUETTE of a tall man with a GOAT\'S HEAD and long curved horns stands between the trunks, half dissolved in fog, only its outline visible. No face, no detail - a shape from a story.',
				move: push(1.0, 1.1, 0.5, 0.45),
			}, {kids: <Person who="figure" x={980} y={760} h={520} facing="front" />}),
			again('g_04_never', 'narrator_047_never_see', 'g_03_legend', {move: push(1.1, 1.2, 0.5, 0.4), grade: 0.6}),
			again('g_05_faces', 'narrator_048_wears_faces', 't_12_face', {move: push(1.08, 1.18, 0.5, 0.45)}),
			again('g_06_group', 'narrator_049_walks_into', 't_09_bench', {move: {z0: 1.1, z1: 1.18, x0: 0.35, y0: 0.5, x1: 0.68, y1: 0.48}}),
			again('g_07_stopped', 'narrator_050_smell_stopped', 't_06_hadnt', {move: push(1.08, 1.14, 0.5, 0.42), blink: true}),
			shot('g_08_morning', 'morning', 'clearing', {
				chars: ['marcus', 'cousins', 'others', 'wyatt'],
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Early morning in the clearing, mist between the pines: the teenagers sit around the cold fire pit eating cereal out of paper cups, laughing, Dez imitating a monster with his arms up, Marcus rolling his eyes and grinning. Relief.',
				move: push(1.02, 1.08),
			}, {kids: <>
				<Person who="dez" x={900} y={820} h={360} facing="front" />
				<Person who="marcus" x={700} y={850} h={330} facing="right" />
				<Person who="ray" x={1100} y={840} h={280} facing="left" />
				<Person who="tasha" x={1250} y={830} h={320} facing="left" />
				<Person who="wyatt" x={560} y={830} h={330} facing="right" />
			</>}),
			again('g_09_laugh', 'narrator_053_local_guys', 'g_08_morning', {move: push(1.1, 1.16, 0.45, 0.5)}),
			shot('g_10_football', 'narrator_054_normal', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.day,
				prompt: 'A bright ordinary afternoon in the clearing: the teenagers play touch football between the trailers, Andre throwing, Marcus diving for the ball, Kayla and Jada cheering on a log - completely normal summer fun.',
				move: push(1.0, 1.06),
			}, {kids: <>
				<Person who="andre" x={700} y={800} h={340} facing="right" />
				<Person who="marcus" x={1150} y={820} h={330} facing="left" pose="reach" />
				<Person who="jamal" x={1000} y={790} h={340} facing="left" />
				<Person who="kayla" x={480} y={870} h={300} facing="right" />
			</>}),
			again('g_11_worst', 'narrator_055_worst_part', 'g_10_football', {move: push(1.08, 1.16), grade: 0.8}),
		]}
	/>
);
