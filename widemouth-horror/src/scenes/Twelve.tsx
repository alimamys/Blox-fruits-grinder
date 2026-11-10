// 1. TWELVE - cold open. Three packs, twelve hot dogs, eleven of us. Then the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CountMark} from '../components/ui/Count';
import {Disclaimer, TitleCard} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {Shots, type ShotProps} from '../utils/scene';
import {Black, MOOD} from './common';
import {again, close, code, push, shot} from './kit';

/** Everyone crammed into the trailer at night: benches, floor, the door - eleven of them. */
export const TrailerCrowd: React.FC<{shadow?: boolean}> = ({shadow = false}) => (
	<>
		<Person who="kayla" x={700} y={700} h={300} facing="front" />
		<Person who="jamal" x={820} y={700} h={330} facing="front" />
		<Person who="nia" x={940} y={705} h={310} facing="front" />
		<Person who="tasha" x={1060} y={700} h={320} facing="front" />
		<Person who="dez" x={1260} y={760} h={480} facing="left" />
		<Person who="andre" x={1500} y={1000} h={520} facing="left" />
		<Person who="jada" x={1720} y={1020} h={480} facing="left" />
		<Person who="trey" x={560} y={760} h={430} facing="right" />
		<Person who="wyatt" x={420} y={800} h={470} facing="right" />
		<Person who="ray" x={250} y={900} h={420} facing="right" />
		{shadow ? <Person who="figure" x={1180} y={705} h={330} facing="front" /> : <Person who="marcus" x={130} y={1000} h={560} facing="right" />}
	</>
);

const Open: React.FC<ShotProps> = ({f, d}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Disclaimer f={f} d={d} />
	</AbsoluteFill>
);

export const Twelve: React.FC = () => (
	<Shots
		shots={[
			code('t_00_open', 'open_black', (p) => <Open {...p} />),
			// "Three packs of hot dogs. Four in each pack."
			shot('t_01_packs', 'narrator_001_three_packs', 'trailer', {
				chars: ['marcus'],
				quality: 'high',
				mood: MOOD.trailerNight,
				prompt: 'Close-up on the tiny counter beside the trailer\'s two-burner camp stove at night: three torn-open packs of hot dogs, a dented pot of steaming water on the burner with hot dogs bobbing in it, and Marcus\'s hands (dark-red hoodie sleeves) dropping the last hot dogs from a pack into the pot. Steam curls up into the weak warm light. Only his hands and forearms are in frame.',
				variants: [{name: 'steam', prompt: 'The steam has drifted into a different swirl and one more hot dog has dropped into the pot with a small splash. Nothing else changes.'}],
				seq: [
					['base', 0],
					['steam', 0.55],
				],
				move: push(1.03, 1.12, 0.35, 0.55),
			}, {cam: {z: 2.6, cx: 260, cy: 600}, kids: <rect x={60} y={560} width={340} height={60} fill="#8a1f22" />, overlay: (p) => <CountMark {...p} n="12" from={Math.round(p.d * 0.62)} x={0.8} y={0.4} />}),
			// "I know, because I cooked every one of them myself."
			shot('t_03_stove', 'narrator_003_cooked_myself', 'trailer', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'high',
				blink: true,
				mood: MOOD.trailerNight,
				prompt: 'Medium shot inside the cramped trailer at night: Marcus stands at the little stove on the LEFT, turning hot dogs in the steaming pot with a fork, the steam lit by the weak ceiling light; behind him on the benches the other teenagers sit squeezed together in the warm gloom, talking quietly, tired and uneasy.',
				move: push(1.02, 1.08, 0.3, 0.5),
			}, {cam: {z: 1.25, cx: 700, cy: 600}, kids: <>
				<Person who="nia" x={900} y={700} h={300} facing="front" />
				<Person who="jamal" x={780} y={700} h={320} facing="front" />
				<Person who="tasha" x={1020} y={700} h={310} facing="front" />
				<Person who="marcus" x={330} y={980} h={640} facing="left" />
			</>}),
			// "Everybody got one."
			shot('t_04_plates', 'narrator_004_everybody_one', 'trailer', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.trailerNight,
				prompt: 'Inside the trailer at night: Marcus hands a paper plate with one hot dog in a bun to Nia on the bench; the others around the little table already eat from paper plates on their knees. Cramped, warm, ordinary - almost cozy.',
				move: push(1.02, 1.07),
			}, {cam: {z: 1.2, cx: 980, cy: 640}, kids: <>
				<Person who="kayla" x={760} y={700} h={300} facing="front" />
				<Person who="nia" x={900} y={705} h={310} facing="front" />
				<Person who="andre" x={1080} y={700} h={330} facing="front" />
				<Person who="marcus" x={1350} y={1000} h={600} facing="left" pose="reach" />
			</>}),
			// "An hour later, my cousin walked to the stove for seconds..."
			shot('t_05_ray_pot', 'narrator_005_seconds', 'trailer', {
				chars: ['cousins'],
				quality: 'high',
				blink: true,
				mood: MOOD.trailerNight,
				prompt: 'Medium close-up at the trailer\'s little stove: RAY (round glasses, twists, mustard-yellow T-shirt) holds up the pot lid and peers into the EMPTY pot - only water left, no hot dogs - frowning, annoyed and hungry. Weak warm ceiling light.',
				variants: [{name: 'turn', prompt: 'Ray now turns his head toward the camera with an annoyed, accusing look, eyebrows raised behind his round glasses, as if asking a question. Nothing else changes.'}],
				seq: [
					['base', 0],
					['turn', 0.62],
				],
				move: push(1.03, 1.1, 0.4, 0.45),
			}, {cam: {z: 2.2, cx: 300, cy: 560}, kids: <Person who="ray" x={420} y={1050} h={760} facing="left" />}),
			// "I hadn't."
			close('t_06_hadnt', 'narrator_006_hadnt', {
				chars: ['marcus'],
				loc: 'trailer',
				quality: 'high',
				blink: true,
				mood: MOOD.trailerNight,
				prompt: 'Close-up of Marcus in the dim trailer, a paper plate with ONE untouched hot dog in his hand, staring at his cousin with confusion turning to unease, his brows drawing together.',
				move: push(1.03, 1.08, 0.5, 0.42),
			}, <Person who="marcus" x={960} y={1900} h={1700} facing="front" />, {bg: '#3a2a1c'}),
			// "There were eleven of us in that trailer."
			shot('t_07_crowd', 'narrator_007_eleven_of_us', 'trailer', {
				chars: ['marcus', 'wyatt', 'cousins', 'others'],
				quality: 'high',
				mood: MOOD.trailerNight,
				prompt: 'Wide shot of the cramped trailer at night, packed with teenagers: on the back bench and around the little table sit Kayla, Jamal, Nia and Tasha; Dez leans by the front door; Andre and Jada sit on the bench in the right foreground; Trey, Wyatt and Ray sit on the floor on the left by the stove; Marcus stands in the left foreground. Paper plates on knees, tired faces in the weak warm light, the windows black.',
				move: push(1.0, 1.06, 0.5, 0.5),
			}, {kids: <TrailerCrowd />, overlay: (p) => <CountMark {...p} n="11" from={Math.round(p.d * 0.45)} x={0.83} y={0.3} size={260} />}),
			// "Twelve hot dogs were gone."
			close('t_08_empty_pot', 'narrator_008_twelve_gone', {
				loc: 'trailer',
				noPeople: true,
				quality: 'medium',
				mood: MOOD.trailerNight,
				prompt: 'Close-up on the trailer\'s little counter at night: the dented pot sitting EMPTY on the cold burner, three crumpled, empty hot dog packs beside it, a stack of used paper plates. Nobody in frame. Weak warm light, deep shadow.',
				move: push(1.04, 1.12),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a2a1c" />
				<rect x={600} y={480} width={520} height={300} rx={40} fill="#8d8d88" />
			</>),
			// "Something had been sitting with us."
			shot('t_09_bench', 'narrator_009_sitting_with_us', 'trailer', {
				chars: ['cousins', 'others', 'thing'],
				quality: 'high',
				mood: MOOD.trailerNight,
				prompt: 'The back bench of the trailer at night, seen side-on: a row of teenagers squeezed shoulder to shoulder with paper plates on their knees - Kayla, Jamal, Nia, Tasha - and at the very RIGHT end of the bench one more person whose face is lost in deep shadow: we cannot tell who it is, only the dark shape of a head and shoulders sitting perfectly still. Everyone else is relaxed; nobody looks at it.',
				move: {z0: 1.06, z1: 1.12, x0: 0.35, y0: 0.5, x1: 0.62, y1: 0.48},
			}, {cam: {z: 1.6, cx: 900, cy: 600}, kids: <TrailerCrowd shadow />}),
			// "Eating with us."
			close('t_10_hand', 'narrator_010_eating_with_us', {
				chars: ['thing'],
				loc: 'trailer',
				quality: 'high',
				dark: true,
				mood: MOOD.trailerNight,
				prompt: 'Extreme close-up in the dim trailer: a paper plate resting on a pair of knees in dark trousers, and a hand slowly lifting a half-eaten hot dog off it. The hand is ordinary at first glance - but the fingers are a little too long and the skin a shade too grey. No face in frame.',
				move: push(1.04, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#2a1d14" />
				<ellipse cx={960} cy={760} rx={420} ry={110} fill="#e9e4d6" />
				<circle cx={1080} cy={560} r={70} fill="#8d8f8a" />
			</>),
			// "For a whole day."
			again('t_11_day', 'narrator_011_whole_day', 't_07_crowd', {move: push(1.06, 1.14, 0.62, 0.45)}),
			// "And not one of us could tell you whose face it was wearing."
			close('t_12_face', 'narrator_012_whose_face', {
				chars: ['thing'],
				loc: 'trailer',
				quality: 'high',
				dark: true,
				mood: 'Near darkness inside the trailer: one sliver of warm light across part of a face.',
				prompt: 'Extreme close-up in the dark: a teenager\'s face almost entirely in shadow - we cannot tell who it is. A single thin sliver of warm light crosses one wide, fixed, unblinking eye and the corner of a slack, slightly open mouth. Utterly still. Unsettling, not gory.',
				move: push(1.02, 1.1, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#07070a" />
				<circle cx={960} cy={520} r={330} fill="#16161a" />
				<rect x={700} y={430} width={520} height={60} fill="#7a6040" />
			</>),
			again('t_13_faces', 'faces', 't_09_bench', {move: {z0: 1.12, z1: 1.2, x0: 0.4, y0: 0.5, x1: 0.68, y1: 0.48}, grade: 0.85}),
			code('t_14_black', 'cut_black', () => <Black />),
			code('t_15_title', 'title', ({f, d}) => <TitleCard f={f} d={d} />),
		]}
	/>
);
