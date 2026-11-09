// 2. THE WOODS - Alabama, the trailers, the smell, the creek, Mr. Dawes, eleven by sunset.
import React from 'react';
import {CountMark} from '../components/ui/Count';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

/** All eleven around the fire pit in the clearing (sunset / night). */
export const FireCircle: React.FC = () => (
	<>
		<Person who="marcus" x={640} y={830} h={300} facing="right" />
		<Person who="ray" x={560} y={800} h={240} facing="right" />
		<Person who="dez" x={1180} y={800} h={330} facing="left" />
		<Person who="nia" x={1290} y={790} h={290} facing="left" />
		<Person who="wyatt" x={1390} y={800} h={310} facing="left" />
		<Person who="tasha" x={720} y={960} h={330} facing="back" />
		<Person who="andre" x={860} y={980} h={330} facing="back" />
		<Person who="jada" x={990} y={980} h={280} facing="back" />
		<Person who="kayla" x={460} y={760} h={280} facing="right" />
		<Person who="jamal" x={1500} y={780} h={320} facing="left" />
		<Person who="trey" x={1080} y={990} h={340} facing="back" />
	</>
);

export const Woods: React.FC = () => (
	<Shots
		shots={[
			// arrival in the clearing
			shot('w_00_arrive', 'arrive', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.day,
				prompt: 'Wide establishing shot of the clearing in the pine woods on a hot afternoon: the two old camping trailers, the shed, the stone fire pit, and a group of teenagers walking in along the dirt track from between the trees carrying duffel bags, a cooler and grocery bags - Dez in front, Marcus trailing behind looking around.',
				move: push(1.0, 1.06, 0.5, 0.5),
			}, {kids: <>
				<Person who="dez" x={1010} y={640} h={180} facing="front" />
				<Person who="ray" x={1080} y={640} h={140} facing="front" />
				<Person who="tasha" x={1140} y={625} h={160} facing="front" />
				<Person who="marcus" x={960} y={615} h={150} facing="front" />
			</>}),
			// "I was sixteen the summer my mom sent me down from Chicago..."
			shot('w_01_marcus', 'narrator_013_sixteen', 'clearing', {
				chars: ['marcus'],
				quality: 'high',
				blink: true,
				mood: MOOD.day,
				prompt: 'Medium shot: Marcus stands at the edge of the clearing with a duffel bag over his shoulder, his clean white sneakers in the rust-brown pine needles, squinting up at the towering pine trunks - a city kid completely out of place, half impressed, half wary.',
				move: push(1.02, 1.08, 0.45, 0.45),
			}, {cam: {z: 2.0, cx: 900, cy: 620}, kids: <Person who="marcus" x={900} y={900} h={600} facing="front" />}),
			again('w_02_land', 'narrator_014_land', 'w_00_arrive', {move: {z0: 1.12, z1: 1.18, x0: 0.3, y0: 0.45, x1: 0.7, y1: 0.45}}),
			// "My cousins couldn't wait to drag the city boy out into the wilderness."
			shot('w_03_cousins', 'narrator_015_city_boy', 'clearing', {
				chars: ['marcus', 'cousins'],
				quality: 'high',
				mood: MOOD.day,
				prompt: 'Medium shot in the sunny clearing: big DEZ grins and hooks a friendly arm around Marcus\'s neck, RAY laughs and points at Marcus\'s spotless white sneakers, NIA rolls her eyes with a smile; Marcus swats at a bug, unimpressed. Playful, warm, teasing.',
				move: push(1.02, 1.07),
			}, {cam: {z: 1.8, cx: 960, cy: 640}, kids: <>
				<Person who="dez" x={860} y={940} h={620} facing="right" pose="reach" />
				<Person who="marcus" x={1020} y={950} h={560} facing="front" />
				<Person who="ray" x={1240} y={960} h={460} facing="left" />
				<Person who="nia" x={640} y={950} h={520} facing="right" />
			</>}),
			// "The second we got to the clearing, I noticed the smell."
			close('w_04_smell', 'narrator_016_smell', {
				chars: ['marcus'],
				loc: 'clearing',
				quality: 'high',
				blink: true,
				mood: MOOD.day,
				prompt: 'Close-up of Marcus in the sunny clearing: he stops, nostrils flaring, sniffing the air, frowning, his eyes sliding sideways toward the trees - something smells wrong.',
				move: push(1.03, 1.09, 0.5, 0.42),
			}, <Person who="marcus" x={960} y={1900} h={1700} facing="front" />, {bg: '#7a5a2e'}),
			// "Sharp. Metallic. Like the air right before lightning hits."
			shot('w_05_air', 'narrator_017_lightning', 'clearing', {
				noPeople: true,
				quality: 'medium',
				fx: 'flicker',
				mood: 'The same hot afternoon, but the air hangs heavy and too still; a faint electric haze in the light between the pines.',
				prompt: 'Low angle looking straight up the towering pine trunks of the clearing to a hazy bright sky: the air thick and shimmering, dust motes hanging motionless in the slanting light, not a needle moving. Unnaturally still and charged, like the moment before a lightning strike. No people.',
				move: push(1.0, 1.1, 0.5, 0.4),
			}, {cam: {z: 1.6, cx: 1000, cy: 300}}),
			// "Nobody else seemed to care, so I let it go."
			shot('w_06_unload', 'narrator_018_let_it_go', 'clearing', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.day,
				prompt: 'The sunny clearing: the teenagers unload coolers and bags by the trailer steps, laughing and shoving each other; Andre lifts a cooler, Tasha and Jada carry grocery bags; Marcus stands a little apart, glances once more at the trees, then shrugs.',
				move: push(1.02, 1.07),
			}, {cam: {z: 1.3, cx: 700, cy: 600}, kids: <>
				<Person who="andre" x={560} y={760} h={330} facing="right" pose="carryBox" />
				<Person who="tasha" x={700} y={760} h={320} facing="right" />
				<Person who="jada" x={820} y={770} h={270} facing="left" />
				<Person who="dez" x={980} y={770} h={360} facing="left" />
				<Person who="marcus" x={1180} y={820} h={360} facing="left" />
			</>}),
			// the creek
			shot('w_07_creek', 'creek', 'creek', {
				chars: ['marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.creek,
				prompt: 'Wide shot of the creek on a hot afternoon: the teenagers swimming and splashing in the shallow amber water - Dez dunking Ray, Tasha and Andre splashing each other, Marcus sitting on a rock at the edge with his jeans rolled up, laughing. The bushes on the far bank are thick and green.',
				move: {z0: 1.0, z1: 1.1, x0: 0.45, y0: 0.5, x1: 0.62, y1: 0.4},
			}, {kids: <>
				<Person who="dez" x={900} y={820} h={300} facing="right" />
				<Person who="ray" x={1040} y={830} h={240} facing="left" />
				<Person who="tasha" x={1300} y={860} h={280} facing="left" />
				<Person who="andre" x={1460} y={870} h={300} facing="left" />
				<Person who="marcus" x={600} y={900} h={300} facing="right" />
			</>}),
			// "A man stepped out with a shotgun resting in the crook of his arm..."
			shot('w_09_dawes', 'narrator_020_shotgun', 'creek', {
				chars: ['adults', 'wyatt'],
				quality: 'high',
				mood: MOOD.creek,
				prompt: 'ONLY TWO PEOPLE in this frame: Mr. Dawes and Wyatt (Cole, the young man in the red check flannel, is NOT here). On the far bank of the creek, MR. DAWES steps out through the bushes: weathered, grey stubble, green cap, brown work jacket, a shotgun broken open and resting in the crook of his arm, barrels pointing down. Right behind him, skinny WYATT peers out from the leaves. They look across the water at the kids, not hostile, just watchful.',
				move: push(1.02, 1.08, 0.6, 0.45),
			}, {cam: {z: 1.6, cx: 1150, cy: 520}, kids: <>
				<Person who="dawes" x={1150} y={760} h={480} facing="front" />
				<Person who="wyatt" x={1330} y={760} h={430} facing="left" />
			</>}),
			// MR. DAWES: "You're Earl's people? Good. Listen..."
			close('w_10_dawes_talk', 'dawes_001_stick_together', {
				kind: 'talk',
				chars: ['adults'],
				loc: 'creek',
				quality: 'high',
				blink: true,
				talk: ['dawes_001_stick_together'],
				mood: MOOD.creek,
				prompt: 'ONLY MR. DAWES is in this frame - nobody behind him (Cole, the young man in the red check flannel, is NOT here). Medium close-up of MR. DAWES on the creek bank in dappled shade, the shotgun broken open over his arm, looking straight at the kids with serious, wary eyes, speaking slowly - a warning, not a threat.',
				move: push(1.02, 1.07, 0.5, 0.42),
			}, <Person who="dawes" x={960} y={1750} h={1500} facing="front" />, {bg: '#3e4a2a'}),
			// "His son, Wyatt, asked if he could hang out with us."
			shot('w_11_wyatt', 'narrator_021_hang_out', 'creek', {
				chars: ['wyatt', 'cousins'],
				quality: 'high',
				blink: true,
				mood: MOOD.creek,
				prompt: 'By the creek: WYATT, skinny and freckled, hands in his pockets, gives a shy hopeful half-smile; in the water in front of him RAY waves him in with a grin.',
				move: push(1.02, 1.08),
			}, {cam: {z: 1.8, cx: 900, cy: 600}, kids: <>
				<Person who="wyatt" x={980} y={880} h={560} facing="front" />
				<Person who="ray" x={720} y={980} h={380} facing="right" pose="reach" />
			</>}),
			// "By sunset, there were eleven of us." / "Remember that number."
			shot('w_12_sunset', 'narrator_022_eleven', 'clearing', {
				chars: ['marcus', 'wyatt', 'cousins', 'others'],
				quality: 'high',
				mood: 'Sunset in the clearing: the last deep-orange light through the pine trunks, the first campfire just lit, long shadows; the woods behind already going dark.',
				prompt: 'Wide shot of the clearing at sunset: ELEVEN teenagers sit on the log benches around the newly lit campfire - Marcus, Wyatt, Dez, Ray, Nia, Tasha, Jada, Kayla, Andre, Jamal and Trey - laughing, roasting nothing yet, the trailers behind them glowing orange, the pine woods darkening all around.',
				move: push(1.02, 1.08, 0.5, 0.55),
			}, {kids: <FireCircle />}),
			again('w_13_remember', 'narrator_023_remember', 'w_12_sunset', {move: push(1.1, 1.2, 0.5, 0.6)}, {overlay: (p) => <CountMark {...p} n="11" from={4} x={0.5} y={0.3} size={340} />}),
			again('w_14_dark', 'sunset', 'w_12_sunset', {move: push(1.2, 1.24, 0.5, 0.6), grade: 0.6}),
		]}
	/>
);
