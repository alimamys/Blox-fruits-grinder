// 2. THE EMPTY HOUSE - the farmhouse on the hill, the noises, the fever, the boxes. Then something
// under the bed.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

/** Eli lying in his bed (the bedroom plate), seen from the doorway. */
export const EliInBed: React.FC<{sit?: boolean}> = ({sit = false}) =>
	sit ? (
		<Person who="eli" x={720} y={600} h={260} facing="left" />
	) : (
		<>
			<rect x={300} y={470} width={470} height={70} rx={30} fill="#7f9cc0" />
			<circle cx={790} cy={482} r={40} fill="#efcfb4" />
		</>
	);

export const House: React.FC = () => (
	<Shots
		shots={[
			// "When I was little, my family never stayed anywhere for long."
			shot('h_00_farmhouse', 'farmhouse', 'farmhouse', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.grey,
				prompt: 'The big old white farmhouse alone on top of its grassy hill under a low grey spring sky, a dirt driveway winding up to it, dark pines and bare birches around. No people.',
				move: {z0: 1.12, z1: 1.02, x0: 0.6, y0: 0.35, x1: 0.55, y1: 0.45},
			}),
			// "My dad chased jobs, and we followed him, from one rented house to the next."
			shot('h_01_moving_in', 'narrator_010_chased_jobs', 'farmhouse', {
				chars: ['parents', 'eli'],
				quality: 'medium',
				mood: MOOD.grey,
				prompt: 'Moving in: on the dirt driveway in front of the farmhouse porch, DAD carries a big cardboard box up the porch steps, MOM follows with a lamp and a bag, and little ELI (5, a blue windbreaker over his clothes) trails behind holding a picture book, looking up at the big house. A rusty station wagon packed with boxes on the drive.',
				move: push(1.02, 1.08, 0.6, 0.45),
			}, {cam: {z: 2.4, cx: 1240, cy: 300}, kids: <>
				<Person who="dad" x={1180} y={420} h={190} facing="back" pose="carryBox" />
				<Person who="mom" x={1080} y={440} h={180} facing="back" />
				<Person who="eli" x={980} y={460} h={110} facing="back" />
			</>}),
			// "That spring, it was a big old farmhouse on a hill outside a tiny town in Maine."
			again('h_02_hill', 'narrator_011_farmhouse', 'h_00_farmhouse', {move: {z0: 1.0, z1: 1.14, x0: 0.5, y0: 0.55, x1: 0.62, y1: 0.3}}),
			// "It was far too big for the three of us..."
			shot('h_03_hall', 'narrator_012_too_big', 'hallway', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.hallDay,
				prompt: 'The long upstairs hallway of the farmhouse: faded striped wallpaper, a row of CLOSED doors on both sides, a worn runner on the floorboards, one door at the far end standing half open onto grey light. No people. Too long, too quiet.',
				move: push(1.0, 1.12, 0.52, 0.42),
			}),
			// "At night, the house made noises. Long creaks in the hallway. Little taps inside the walls."
			shot('h_04_listen', 'narrator_013_noises', 'bedroom', {
				chars: ['eli'],
				quality: 'high',
				blink: true,
				dark: true,
				mood: MOOD.bedNight,
				prompt: 'Night in Eli\'s bedroom: little ELI lies in his narrow bed under the patchwork quilt pulled up to his chin, wide awake, his eyes turned toward the wall, listening. Cold blue moonlight through the thin curtains, stacked moving boxes as dark shapes.',
				move: push(1.06, 1.16, 0.3, 0.42),
			}, {cam: {z: 1.7, cx: 520, cy: 480}, kids: <EliInBed />}),
			// "My dad said old houses settle. My mom said I had a big imagination."
			shot('h_05_tuck', 'narrator_014_settle', 'bedroom', {
				chars: ['parents', 'eli'],
				quality: 'medium',
				mood: 'Evening in Eli\'s bedroom: one warm bedside lamp, soft brown shadows.',
				prompt: 'Evening in Eli\'s bedroom: MOM sits on the edge of the bed tucking the quilt around little ELI with a gentle smile, DAD leans in the doorway on the right with a tired, amused grin, his glasses catching the warm lamp light. Moving boxes stacked against the wall.',
				move: push(1.02, 1.08, 0.45, 0.45),
			}, {kids: <>
				<EliInBed />
				<Person who="mom" x={560} y={760} h={420} facing="left" />
				<Person who="dad" x={1450} y={900} h={640} facing="left" />
			</>}),
			// "The day after my fifth birthday, I got sick."
			close('h_06_cake', 'narrator_015_sick', {
				noPeople: true,
				quality: 'medium',
				mood: 'A grey morning in a farmhouse kitchen: flat window light.',
				prompt: 'Close-up on a kitchen table the morning after a child\'s birthday: a half-eaten homemade chocolate cake on a plate with FIVE burnt-out birthday candles still in it, a few crumpled paper party hats and a deflated balloon beside it. No people, no text.',
				move: push(1.03, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#4a3a2c" />
				<ellipse cx={960} cy={640} rx={420} ry={150} fill="#e9e4d6" />
				<ellipse cx={960} cy={560} rx={300} ry={120} fill="#4a2a1a" />
			</>),
			// "A fever that wouldn't break. The doctor said weeks in bed..."
			close('h_07_fever', 'narrator_016_fever', {
				chars: ['eli', 'parents'],
				loc: 'bedroom',
				quality: 'high',
				mood: MOOD.sickroom,
				prompt: 'Close-up: little ELI lying on his pillow, flushed and feverish, damp hair stuck to his forehead, eyes half-closed and glassy; MOM\'s hand (cream cardigan sleeve) rests on his forehead from the left edge of the frame. Only Mom\'s hand and sleeve are in frame, not her face.',
				move: push(1.03, 1.1, 0.55, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#5a4a3a" />
				<ellipse cx={1060} cy={700} rx={600} ry={260} fill="#e9e4d6" />
				<circle cx={1060} cy={560} r={210} fill="#efcfb4" />
				<rect x={0} y={420} width={860} height={90} fill="#e4d8bf" />
			</>),
			// "...everything I owned was taped up in cardboard boxes."
			shot('h_08_boxes', 'narrator_017_boxes', 'bedroom', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Eli\'s bedroom: cardboard moving boxes stacked high against the wall by the window, every one taped shut, a roll of packing tape on top. No people, no writing on the boxes.',
				move: {z0: 1.1, z1: 1.1, x0: 0.6, y0: 0.45, x1: 0.75, y1: 0.45},
			}, {cam: {z: 1.6, cx: 1300, cy: 520}}),
			// "My room was empty except for my bed, a stack of picture books, and the ginger ale..."
			shot('h_09_stool', 'narrator_018_empty_room', 'bedroom', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Close on the little wooden stool beside the bed: a stack of worn children\'s picture books and a glass of fizzy ginger ale with a bendy straw, bubbles rising, a few cracker crumbs. The edge of the quilt and the white bed skirt behind it. No people, no readable titles.',
				move: push(1.04, 1.12, 0.4, 0.5),
			}, {cam: {z: 2.2, cx: 360, cy: 700}}),
			// "I had never been so bored in my life."
			shot('h_10_bored', 'narrator_019_bored', 'bedroom', {
				chars: ['eli'],
				quality: 'medium',
				mood: MOOD.sickroom,
				prompt: 'Eli\'s bare bedroom seen from the doorway: little ELI lies on his back in the narrow bed, arms flopped out on the quilt, staring up at the ceiling, utterly bored. The boxes, the stool with the books and ginger ale, grey window light.',
				move: push(1.0, 1.06, 0.35, 0.5),
			}, {kids: <EliInBed />}),
			// "That's when he showed up." + the bed skirt stirs
			shot('h_11_skirt', 'narrator_020_showed_up', 'bedroom', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.sickroom,
				prompt: 'Low angle, close to the floorboards: the white ruffled bed skirt hanging down to the floor, and the pitch-black gap beneath the bed. Nothing visible in the dark yet. Grey daylight on the floor.',
				variants: [{name: 'eyes', prompt: 'The bed skirt is now lifted a little at one spot, and from the black gap underneath, MR. WIDEMOUTH peeks out: only the top of his round ash-grey head, the crooked ears and two big glossy black eyes, catching the light. Everything else stays identical.'}],
				seq: [
					['base', 0],
					['eyes', 0.6],
				],
				move: push(1.04, 1.14, 0.45, 0.72),
			}, {cam: {z: 2.4, cx: 520, cy: 760}}),
			again('h_12_eyes', 'bed_skirt', 'h_11_skirt', {show: 'eyes', move: push(1.14, 1.22, 0.45, 0.74)}),
		]}
	/>
);
