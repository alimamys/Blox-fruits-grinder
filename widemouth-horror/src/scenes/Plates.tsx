// 9. PLATES - twelve years later in Chicago. Seven on the couch, eight plates. Count them.
import React from 'react';
import {CountMark} from '../components/ui/Count';
import {CreditCard} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {Black, MOOD} from './common';
import {again, close, code, push, shot} from './kit';

export const Plates: React.FC = () => (
	<Shots
		shots={[
			shot('p_00_city', 'city', 'apartment', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.apartment,
				prompt: 'The Chicago skyline at night through the big window of a small apartment, the room dark in the foreground, the TV glow on the wall. No people.',
				move: push(1.02, 1.1, 0.55, 0.35),
			}, {cam: {z: 2.0, cx: 1300, cy: 360}}),
			shot('p_01_marcus', 'narrator_141_twelve_years', 'apartment', {
				chars: ['marcusAdult'],
				quality: 'high',
				blink: true,
				mood: MOOD.apartment,
				prompt: 'ADULT MARCUS (28, short beard, grey crewneck sweatshirt) sits alone on the grey couch in his apartment at night, lit by the cold TV glow, staring past the screen, quiet and tired.',
				move: push(1.02, 1.08, 0.6, 0.5),
			}, {cam: {z: 1.6, cx: 1200, cy: 640}, kids: <Person who="marcusAdult" x={1220} y={900} h={420} facing="front" />}),
			shot('p_02_party', 'narrator_143_six_friends', 'apartment', {
				chars: ['marcusAdult'],
				quality: 'medium',
				mood: 'Night in the small Chicago apartment, the TV bright with a football game, a warm lamp, a relaxed party.',
				prompt: 'Game night in the small apartment: adult Marcus and six friends in their late twenties crowd the grey couch and chairs watching football on the big TV, pizza boxes open on the coffee table, Marcus setting out a stack of paper plates; everyone laughing.',
				move: push(1.0, 1.06, 0.55, 0.6),
			}, {kids: <Person who="marcusAdult" x={1100} y={900} h={420} facing="left" pose="reach" />}),
			again('p_03_plates', 'narrator_144_plates', 'p_02_party', {move: push(1.1, 1.18, 0.5, 0.75)}),
			shot('p_04_clean', 'narrator_145_cleaning', 'apartment', {
				chars: ['marcusAdult'],
				quality: 'medium',
				mood: 'Later that night: the TV on mute, the lamp low.',
				prompt: 'Later that night: the game is over; adult Marcus bends over the low coffee table gathering the greasy paper plates into a stack, the empty pizza boxes beside them, his friends still slouched on the couch behind him, chatting.',
				move: push(1.02, 1.08, 0.5, 0.65),
			}, {cam: {z: 1.4, cx: 900, cy: 700}, kids: <Person who="marcusAdult" x={900} y={980} h={480} facing="left" pose="reach" />}),
			again('p_05_seven', 'narrator_146_seven_couch', 'p_02_party', {move: push(1.04, 1.1, 0.6, 0.5), grade: 0.85}, {overlay: (p) => <CountMark {...p} n="7" from={4} x={0.82} y={0.28} size={300} />}),
			close('p_06_eight', 'narrator_147_eight_plates', {
				loc: 'apartment',
				noPeople: true,
				quality: 'medium',
				mood: 'Close on the coffee table under the cold TV light.',
				prompt: 'Close-up on the low wooden coffee table at night: a row of used, greasy paper plates laid out side by side, crusts and grease stains on each, beside empty pizza boxes. No people, no hands.',
				move: {z0: 1.6, z1: 1.6, x0: 0.3, y0: 0.6, x1: 0.7, y1: 0.55},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a2a1c" />
				<ellipse cx={960} cy={620} rx={760} ry={180} fill="#e9e4d6" />
			</>, {overlay: (p) => <CountMark {...p} n="8" red from={6} x={0.5} y={0.28} size={360} />}),
			close('p_07_frozen', 'narrator_148_again', {
				chars: ['marcusAdult'],
				loc: 'apartment',
				quality: 'high',
				blink: true,
				mood: MOOD.apartment,
				prompt: 'Close-up: ADULT MARCUS holding a stack of greasy paper plates, frozen, his eyes moving across the couch, counting, the blood draining from his face in the cold TV light.',
				move: push(1.03, 1.12, 0.5, 0.42),
			}, <Person who="marcusAdult" x={960} y={1900} h={1700} facing="front" />, {bg: '#1c2230'}),
			again('p_08_eight', 'narrator_149_eight', 'p_06_eight', {move: {z0: 1.7, z1: 1.8, x0: 0.62, y0: 0.58, x1: 0.68, y1: 0.55}, fx: 'pulse'}, {overlay: (p) => <CountMark {...p} n="8" red x={0.5} y={0.3} size={380} />}),
			shot('p_09_door', 'narrator_150_bathroom', 'apartment', {
				noPeople: true,
				quality: 'medium',
				dark: true,
				mood: 'Night: the short hallway in shadow, the TV glow fading at its mouth.',
				prompt: 'The short dark hallway of the apartment leading to a CLOSED white bathroom door at its end; a thin line of cold light under the door. No people.',
				variants: [{name: 'shadow', prompt: 'In the thin line of light under the closed bathroom door, the shadows of two feet now stand just behind it. Nothing else changes.'}],
				seq: [['base', 0], ['shadow', 0.6]],
				move: push(1.0, 1.16, 0.72, 0.5),
			}, {cam: {z: 2.4, cx: 1440, cy: 480}}),
			again('p_10_smell', 'narrator_151_that_smell', 'p_09_door', {show: 'shadow', move: push(1.16, 1.26, 0.72, 0.55)}),
			again('p_11_lightning', 'narrator_152_lightning', 'p_07_frozen', {move: push(1.12, 1.24, 0.5, 0.4), fx: 'flicker'}),
			code('p_12_black', 'cut_black_end', () => <Black />),
			code('p_13_credit', 'credit', ({f, d}) => <CreditCard f={f} d={d} />),
		]}
	/>
);
