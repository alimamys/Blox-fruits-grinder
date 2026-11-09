// 8. NINE - what Wyatt saw at four in the morning; the open window; it walked out with us.
import React from 'react';
import {CountMark} from '../components/ui/Count';
import {Person} from '../layout/Person';
import {Shots, type ShotProps} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

/** The bathroom door at the back of the dark trailer swings inward onto blackness (drawn in code over the
 *  frame: the door in n_05 is at x 537-693, y 84-795, knob on the left; the frame is shown at the camera
 *  clamp's 1.015 zoom, so the door rectangle is mapped the same way). */
const BathroomDoorOpens: React.FC<ShotProps> = ({f, d}) => {
	const k = (x: number, c: number) => c + (x - c) * 1.015;
	const t = Math.min(1, Math.max(0, (f - d * 0.18) / (24 * 0.9)));
	const open = t * t * (3 - 2 * t) * 0.8;
	const x0 = k(537, 960);
	const x1 = k(693, 960);
	const y0 = k(84, 540);
	const y1 = k(795, 540);
	const xe = x0 + (x1 - x0) * open;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			<polygon points={`${x0},${y0} ${xe},${y0 + 10 * open} ${xe},${y1 - 6 * open} ${x0},${y1}`} fill="#010102" opacity={0.96} />
			{open > 0.02 ? <line x1={xe} y1={y0 + 10 * open} x2={xe} y2={y1 - 6 * open} stroke="#4a4c55" strokeWidth={3} opacity={0.7} /> : null}
		</svg>
	);
};

export const Nine: React.FC = () => (
	<Shots
		shots={[
			shot('n_00_walk', 'walk_out', 'trail', {
				chars: ['marcus', 'cousins', 'others', 'wyatt'],
				quality: 'medium',
				mood: 'Early morning on the forest trail: pale grey-gold light, mist between the trunks.',
				prompt: 'Early morning on the forest trail: the exhausted teenagers - Marcus, Dez, Ray, Tasha, Kayla, Trey - walk up the path in a ragged line with their bags; WYATT trails at the very back with his rifle pointing at the ground, white as a sheet, staring at nobody.',
				move: push(1.0, 1.08, 0.5, 0.5),
			}, {kids: <>
				<Person who="dez" x={980} y={640} h={200} facing="back" />
				<Person who="marcus" x={940} y={700} h={240} facing="back" />
				<Person who="ray" x={1010} y={740} h={240} facing="back" />
				<Person who="tasha" x={900} y={800} h={300} facing="back" />
				<Person who="wyatt" x={1000} y={960} h={420} facing="front" />
			</>}),
			again('n_01_look', 'narrator_123_wouldnt_look', 'n_00_walk', {move: push(1.1, 1.22, 0.52, 0.72)}),
			shot('n_02_porch', 'narrator_124_two_days', 'farm', {
				chars: ['wyatt', 'marcus'],
				quality: 'medium',
				mood: 'Two days later, an overcast afternoon at the farm.',
				prompt: 'Two days later: WYATT and Marcus sit side by side on the steps of the Dawes farmhouse porch; Wyatt stares at his hands and talks quietly, haunted; Marcus listens, turning to look at him with dread.',
				move: push(1.02, 1.08, 0.3, 0.5),
			}, {cam: {z: 2.0, cx: 500, cy: 560}, kids: <>
				<Person who="wyatt" x={460} y={720} h={300} facing="right" />
				<Person who="marcus" x={600} y={720} h={300} facing="left" />
			</>}),
			shot('n_03_four', 'four_am', 'trailer', {
				chars: ['wyatt', 'marcus', 'cousins', 'others'],
				quality: 'medium',
				dark: true,
				mood: MOOD.trailerDark,
				prompt: 'Four in the morning inside the dark trailer: WYATT slumps in a chair by the front door, the rifle across his knees, eyelids drooping; everyone else lies asleep on the floor and the benches in sleeping bags - Marcus nearest the camera. Only grey-blue light at the blind.',
				move: push(1.0, 1.06),
			}, {kids: <>
				<Person who="wyatt" x={1260} y={760} h={480} facing="left" />
				<Person who="marcus" x={760} y={1000} h={500} facing="right" tilt={-80} />
			</>}),
			again('n_04_fight', 'narrator_125_four_am', 'n_03_four', {move: push(1.08, 1.16, 0.66, 0.45)}),
			shot('n_05_bathroom', 'narrator_126_bathroom', 'trailer', {
				noPeople: true,
				quality: 'medium',
				dark: true,
				mood: MOOD.trailerDark,
				prompt: 'The narrow bathroom door at the end of the dark trailer, closed. Grey-blue darkness, the floor in shadow. Nobody visible.',
				move: {z0: 1.0, z1: 1.0, x0: 0.5, y0: 0.5},
			}, {cam: {z: 2.0, cx: 560, cy: 400}, overlay: (p) => <BathroomDoorOpens {...p} />}),
			shot('n_06_lies', 'narrator_127_lay_down', 'trailer', {
				chars: ['thing', 'marcus'],
				quality: 'medium',
				dark: true,
				mood: MOOD.trailerDark,
				prompt: 'Floor level in the dark trailer: Marcus asleep in a sleeping bag on the floor, and right beside him a dark human SHAPE lying down on its side, facing him, so close it almost touches him. We cannot see its face - only a silhouette and the faint grey of a cheek.',
				move: push(1.02, 1.1, 0.5, 0.5),
			}, {cam: {z: 1.6, cx: 900, cy: 820}, kids: <>
				<Person who="marcus" x={700} y={900} h={420} facing="right" tilt={-85} />
				<Person who="figure" x={1100} y={860} h={420} facing="left" tilt={85} />
			</>}),
			again('n_07_eyes', 'narrator_128_closed_eyes', 'n_06_lies', {move: push(1.14, 1.24, 0.6, 0.5), grade: 0.85}),
			close('n_08_counts', 'narrator_129_counted', {
				chars: ['wyatt'],
				loc: 'trailer',
				quality: 'high',
				dark: true,
				mood: MOOD.trailerDark,
				prompt: 'Extreme close-up in the dark: WYATT\'s wide, terrified eyes in the grey light from the blind, moving from body to body on the floor, counting. Sweat on his forehead. He does not dare to move.',
				move: push(1.04, 1.12, 0.5, 0.45),
			}, <Person who="wyatt" x={960} y={2300} h={2400} facing="front" />, {bg: '#141416'}),
			again('n_09_eight', 'narrator_130_eight', 'n_03_four', {move: push(1.12, 1.18, 0.4, 0.6)}, {overlay: (p) => <CountMark {...p} n="8" x={0.78} y={0.3} size={300} />}),
			again('n_10_nine', 'narrator_131_nine', 'n_06_lies', {move: push(1.1, 1.16, 0.55, 0.5), fx: 'pulse'}, {overlay: (p) => <CountMark {...p} n="9" red x={0.5} y={0.3} size={380} />}),
			again('n_11_rifle', 'narrator_132_didnt_scream', 'n_08_counts', {move: push(1.12, 1.18, 0.5, 0.45)}),
			shot('n_12_sits_up', 'narrator_133_pretending', 'trailer', {
				chars: ['thing'],
				quality: 'medium',
				dark: true,
				mood: MOOD.trailerDark,
				prompt: 'The dark trailer floor among the sleeping teenagers: a dark FIGURE has sat up among them and slowly turns its head to look at each sleeper in turn; its face stays in shadow. Unnaturally still, then its shoulders hunch up as if laughing without a sound.',
				fx: 'tremble',
				move: push(1.02, 1.1, 0.5, 0.5),
			}, {cam: {z: 1.5, cx: 900, cy: 760}, kids: <Person who="figure" x={900} y={980} h={420} facing="front" />}),
			shot('n_13_window', 'narrator_134_window', 'trailer', {
				noPeople: true,
				quality: 'medium',
				mood: 'Morning: pale daylight pours in through a small open window.',
				prompt: 'Inside the trailer\'s tiny bathroom in morning light: the small window above the toilet is pushed WIDE OPEN, with NO SCREEN, pale daylight and pine branches outside; a faint grey smear on the sill. Nobody in frame.',
				move: push(1.02, 1.12, 0.5, 0.4),
			}, {cam: {z: 2.2, cx: 560, cy: 360}}),
			again('n_14_screen', 'narrator_135_no_screen', 'n_13_window', {move: push(1.12, 1.2, 0.5, 0.35)}),
			shot('n_15_line', 'narrator_137_walked_out', 'trail', {
				chars: ['marcus', 'cousins', 'others', 'thing'],
				quality: 'medium',
				mood: 'Morning on the forest trail, mist, pale light.',
				prompt: 'Morning on the forest trail, seen from behind: the line of teenagers walking away up the path - and at the very BACK of the line, a little apart, one more figure in dark clothes walking with them, head slightly bowed. Nobody has noticed it.',
				move: push(1.0, 1.08, 0.5, 0.6),
			}, {kids: <>
				<Person who="dez" x={980} y={640} h={200} facing="back" />
				<Person who="marcus" x={940} y={700} h={240} facing="back" />
				<Person who="tasha" x={900} y={780} h={280} facing="back" />
				<Person who="figure" x={1020} y={930} h={380} facing="back" />
			</>}),
			again('n_16_back', 'narrator_138_back_of_line', 'n_15_line', {move: push(1.1, 1.24, 0.53, 0.75)}),
			close('n_17_looks', 'narrator_139_eyes', {
				chars: ['thing'],
				loc: 'trail',
				quality: 'high',
				mood: 'Morning in the woods, but deep shade under the trees.',
				prompt: 'Close-up on the forest trail in deep shade: the figure at the back of the line has stopped and turned - a face almost entirely in shadow under the trees, only two pale eyes looking straight into the camera, fixed, unblinking, and the slack edge of a mouth. Not gory, just wrong.',
				move: push(1.02, 1.14, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#1d2418" />
				<circle cx={960} cy={500} r={300} fill="#262626" />
			</>),
			shot('n_18_trees', 'narrator_140_trees', 'trail', {
				noPeople: true,
				quality: 'medium',
				mood: 'Morning: pale light in the woods, a little mist, perfectly still.',
				prompt: 'The empty forest trail in the morning: ferns, trunks and mist, perfectly still - whatever was here has gone back into the trees. No people.',
				move: push(1.0, 1.1, 0.5, 0.45),
			}, {}),
		]}
	/>
);
