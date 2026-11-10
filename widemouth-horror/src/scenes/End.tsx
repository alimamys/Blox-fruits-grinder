// 9. THE END OF THE TRAIL - twenty-five years later: the burned house, the trail, the children's
// cemetery. Then home: my son turned five. "The one who lives under my bed."
import React from 'react';
import {CreditCard} from '../components/ui/Phone';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {Black, MOOD} from './common';
import {again, close, code, push, shot} from './kit';

export const End: React.FC = () => (
	<Shots
		shots={[
			// "Twenty-five years later, I drove back."
			shot('e_00_back', 'ruins', 'ruins', {
				chars: ['adult'],
				quality: 'medium',
				mood: MOOD.present,
				prompt: 'Twenty-five years later: ADULT ELI (30, short beard, dark-green flannel shirt) stands alone at the bottom of the overgrown hill beside his parked car on the old dirt track, looking up the slope toward the burned ruins at the top. ONLY adult Eli - the boy Leo is NOT here. Wind in the dry grass.',
				move: push(1.0, 1.08, 0.45, 0.6),
			}, {kids: <Person who="eliAdult" x={720} y={1000} h={300} facing="back" />}),
			// "The house was gone. It had burned down a few years after we left..."
			shot('e_01_ruins', 'narrator_078_house_gone', 'ruins', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.present,
				prompt: 'The top of the hill: the burned-out stone foundation of the old farmhouse, half buried in weeds and young birches, charred beams fallen across it, the lone brick chimney still standing. No people.',
				move: {z0: 1.2, z1: 1.3, x0: 0.45, y0: 0.55, x1: 0.6, y1: 0.5},
			}),
			// "I found the deer trail."
			shot('e_02_trail', 'narrator_079_found_trail', 'woods', {
				chars: ['adult'],
				quality: 'medium',
				mood: MOOD.present,
				prompt: 'The edge of the woods, twenty-five years later, no house any more: ADULT ELI stands with his back to us in the dry autumn grass, facing the narrow deer trail that still disappears between the bare birches and pines. ONLY adult Eli.',
				move: {z0: 1.55, z1: 1.62, x0: 0.66, y0: 0.5, x1: 0.68, y1: 0.48}, // crop out the old porch (the house is gone)
			}, {cam: {z: 1.3, cx: 1200, cy: 600}, kids: <Person who="eliAdult" x={1050} y={860} h={380} facing="back" />}),
			// "Part of me expected him to jump out from behind a tree..."
			close('e_03_walk', 'narrator_080_expected', {
				chars: ['adult'],
				loc: 'woods',
				quality: 'high',
				blink: true,
				mood: MOOD.trail,
				prompt: 'ADULT ELI walking slowly along the leaf-covered deer trail deep in the grey woods, seen from the front, his eyes searching the tree trunks on either side, tense and wary, hands in his jacket pockets. ONLY adult Eli.',
				move: {z0: 1.45, z1: 1.52, x0: 0.62, y0: 0.45, x1: 0.63, y1: 0.4}, // crop out the old porch
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a3a2a" />
				<Person who="eliAdult" x={960} y={1500} h={1200} facing="front" />
			</>),
			// "The trail went deeper into the woods than I remembered."
			again('e_04_deeper', 'narrator_081_deeper', 'r_08_trail', {move: push(1.6, 1.78, 0.68, 0.5), grade: 0.8}), // tight: no porch
			// "It ended at a cemetery."
			shot('e_05_cemetery', 'narrator_082_cemetery', 'cemetery', {
				chars: ['adult'],
				quality: 'medium',
				mood: MOOD.cemetery,
				prompt: 'A small forgotten cemetery deep in the pine woods, inside a rusted iron fence: rows and rows of SMALL, old, mossy headstones, all of them low and child-sized. ADULT ELI stands at the near edge with his back to us, very small, looking at them. ONLY adult Eli. No readable writing.',
				move: push(1.0, 1.1, 0.5, 0.5),
			}, {kids: <Person who="eliAdult" x={960} y={1060} h={420} facing="back" />}),
			// "Rows and rows of small, old headstones."
			close('e_06_rows', 'narrator_083_headstones', {
				loc: 'cemetery',
				noPeople: true,
				quality: 'medium',
				mood: MOOD.cemetery,
				prompt: 'Low, close along a row of small, old, weathered headstones in the pine needles, each one barely knee-high, covered in moss and lichen, the row receding into the grey woods. No readable writing. No people.',
				move: {z0: 1.08, z1: 1.08, x0: 0.35, y0: 0.5, x1: 0.65, y1: 0.5},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#2f3a2c" />
				<rect x={200} y={500} width={220} height={320} rx={60} fill="#8a8a80" />
				<rect x={700} y={540} width={180} height={260} rx={50} fill="#8a8a80" />
				<rect x={1100} y={570} width={150} height={220} rx={40} fill="#8a8a80" />
				<rect x={1450} y={590} width={120} height={180} rx={30} fill="#8a8a80" />
			</>),
			// "Most of them belonged to children."
			close('e_07_lamb', 'narrator_084_children', {
				loc: 'cemetery',
				noPeople: true,
				quality: 'medium',
				mood: MOOD.cemetery,
				prompt: 'Close-up on one tiny, old child\'s headstone sunk into the moss and pine needles: a small carved lamb lying on top of it, worn smooth by a hundred years of rain, lichen in the grooves. No readable writing. No people.',
				move: push(1.04, 1.12, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#2f3a2c" />
				<rect x={700} y={360} width={520} height={600} rx={60} fill="#8a8a80" />
				<ellipse cx={960} cy={340} rx={200} ry={80} fill="#a8a89c" />
			</>),
			// "He'd told me I wasn't ready."
			close('e_08_face', 'narrator_085_not_ready', {
				chars: ['adult'],
				loc: 'cemetery',
				quality: 'high',
				blink: true,
				mood: MOOD.cemetery,
				prompt: 'Close-up of ADULT ELI among the pines, staring down at the small headstones, his face drained of colour, the horror slowly dawning in his eyes, his jaw tight. ONLY adult Eli.',
				move: push(1.03, 1.12, 0.5, 0.42),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#2f3a2c" />
				<Person who="eliAdult" x={960} y={1900} h={1700} facing="front" />
			</>),
			// "Every one of them had been ready."
			again('e_09_every', 'narrator_086_had_been', 'e_05_cemetery', {move: {z0: 1.2, z1: 1.0, x0: 0.5, y0: 0.5, x1: 0.5, y1: 0.5}}),
			code('e_10_black', 'cut_black_end', () => <Black />),
			// "Last week, my son turned five."
			shot('e_11_leo', 'narrator_087_son_five', 'leoroom', {
				chars: ['adult'],
				quality: 'medium',
				mood: MOOD.leoRoom,
				prompt: 'Leo\'s bedroom today, on a sunny morning: LEO (5, curly light-brown hair, dinosaur-print pyjamas) sits on the round rug playing with toy dinosaurs, a shiny silver number-5 birthday balloon tied to the bedpost. ONLY Leo - adult Eli is NOT in this frame.',
				move: push(1.02, 1.08, 0.45, 0.6),
			}, {kids: <Person who="leo" x={760} y={1000} h={260} facing="right" />}),
			// "This morning, he asked me if we could get a trampoline."
			shot('e_12_ask', 'narrator_088_trampoline', 'leoroom', {
				chars: ['adult'],
				quality: 'high',
				mood: MOOD.leoRoom,
				prompt: 'Leo\'s sunny bedroom: ADULT ELI kneels on the rug at eye level with LEO, who bounces up on his toes, chattering excitedly with his hands spread wide; Eli smiles at him, amused. Both of them, side by side in profile.',
				move: push(1.02, 1.08, 0.5, 0.55),
			}, {cam: {z: 1.3, cx: 900, cy: 640}, kids: <>
				<Person who="leo" x={720} y={980} h={300} facing="right" />
				<Person who="eliAdult" x={1080} y={1000} h={360} facing="left" />
			</>}),
			// "I asked him who told him about trampolines."
			close('e_13_dad', 'narrator_089_who_told', {
				chars: ['adult'],
				loc: 'leoroom',
				quality: 'high',
				blink: true,
				mood: MOOD.leoRoom,
				prompt: 'Close-up of ADULT ELI kneeling in his son\'s sunny bedroom, his smile slowly fading, a flicker of unease in his eyes as he asks a question. ONLY adult Eli in frame.',
				move: push(1.03, 1.1, 0.5, 0.42),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a5a7a" />
				<Person who="eliAdult" x={960} y={1900} h={1700} facing="front" />
			</>),
			// "My new friend. The one with the big smile."
			close('e_14_leo_talk', 'leo_001_new_friend', {
				kind: 'talk',
				chars: ['adult'],
				loc: 'leoroom',
				quality: 'high',
				mood: MOOD.leoRoom,
				prompt: 'Close-up of LEO (5, curly light-brown hair, big hazel eyes, dinosaur-print pyjamas) in his sunny bedroom, beaming, chatting happily and proudly about his new friend. ONLY Leo in frame.',
				talk: ['leo_001_new_friend', 'leo_002_under_bed'],
				move: push(1.02, 1.08, 0.5, 0.42),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a5a7a" />
				<Person who="leo" x={960} y={1900} h={1700} facing="front" />
			</>),
			// "The one who lives under my bed."
			again('e_15_leo_whisper', 'leo_002_under_bed', 'e_14_leo_talk', {talk: ['leo_001_new_friend', 'leo_002_under_bed'], move: push(1.1, 1.2, 0.5, 0.4), grade: 0.9}),
			// the last look: under Leo's bed
			shot('e_16_last', 'last_look', 'leoroom', {
				chars: ['widemouth'],
				quality: 'high',
				dark: true,
				mood: MOOD.leoDim,
				prompt: 'Low by the floor in Leo\'s bedroom in the dim amber evening: the blue bed skirt of the dinosaur bed hangs to the floor, a toy dinosaur lying on its side on the rug, and in the pitch-black gap under the bed, two big glossy black eyes and a long, pale, ear-to-ear GRIN look out at us. Only the eyes and the grin are visible.',
				move: push(1.04, 1.2, 0.5, 0.78),
			}, {cam: {z: 2.4, cx: 960, cy: 820}, kids: <WideFig x={980} y={1100} h={300} mouth="grin" peek />}),
			code('e_17_credit', 'credit', ({f, d}) => <CreditCard f={f} d={d} />),
		]}
	/>
);
