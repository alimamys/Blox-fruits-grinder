// 10. THE RECORDING - in the closet, recording herself on her phone; the gap under the door, never a shadow.
// 11. THE LAST SELECTION - a face presses through the door; little dashes become a selection box around her;
//     a huge white cursor stops above her; one final click; white.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Mara} from '../components/characters/Cast';
import {CrawlingDashes, MarchingAnts, RecHud} from '../components/ui/Phone';
import {Emboss, facePaths, Glow, WorldCursor} from '../stick/f240';
import {Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, useStick, type Shot} from '../stick/kit';
import {MC} from './common';

const C = GEO.closet;
/** Mara's box on screen in the wide closet shot (z 1): the selection closes round it */
const SEL: [number, number, number, number] = [590, 600, 940, 1062];

/** Mara on the closet floor, knees up, the phone held up in front of her, recording */
const Huddled: React.FC<{f: number; talk?: number; viseme?: 'a' | 'e' | 'o' | 'm'; eyes?: 'dot' | 'wide' | 'closed'; tears?: number; look?: [number, number]; mouth?: 'flat' | 'o' | 'frown' | 'wobbly' | 'scream'; shiver?: number; phone?: boolean}> = ({
	f,
	talk = 0,
	viseme = 'm',
	eyes = 'wide',
	tears = 0,
	look = [0, 0],
	mouth = 'frown',
	shiver = 0.5,
	phone = true,
}) => (
	<g>
		<Glow cx={MC.x + 40} cy={MC.y - 300} r={330} color="#cfe0ff" k={0.75} />
		<Person is={Mara} name="mara" x={MC.x} y={MC.y} s={MC.s} pose="floor" frame={f} light="screen" eyes={eyes} brows="worried" mouth={mouth} talk={talk} viseme={viseme} tears={tears} look={look} shiver={shiver} prop={phone ? 'phone' : 'none'} arms={phone ? {l: [-6, -78], r: [60, 137]} : undefined} />
	</g>
);

const recOverlay = (start: number, t: number) => <RecHud seconds={41 + t - start} />;

export const Recording: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tS = at('closet_silence');
	const t28 = T('mara_028_touching_door');
	const cam = (tt: number) => shot(tt, 'closet_night', 3.0, 3.15, [790, 720], [790, 725], {tag: 'cam'});
	const gap = (tt: number, z = 3.0) => shot(tt, 'closet_night', z, z * 1.05, [1350, 940], [1350, 950], {tag: 'gap'});
	const shots: Shot[] = [
		// "That's where I am now."
		shot(T('mara_012_where_i_am'), 'closet_night', 1.0, 1.05, [960, 540], [920, 560], {tag: 'wide'}),
		// "Inside the storage closet."
		shot(T('mara_013_closet'), 'closet_night', 1.4, 1.5, [900, 700], [880, 710], {tag: 'wide'}),
		// "I started recording this because I don't know what else to do." - her phone's camera
		cam(T('mara_014_recording')),
		// "I can still hear it moving around outside."
		shot(T('mara_015_moving_outside'), 'closet_night', 2.0, 2.1, [1400, 540], [1400, 540], {tag: 'door'}),
		// "Sometimes the scratching stops." / "And when it does, I hear something even worse."
		cam(T('mara_016_scratching_stops')),
		// "A soft dragging sound." / "Like someone tracing a finger over paper."
		gap(T('mara_018_dragging')),
		shot(T('mara_019_finger_paper'), 'closet_night', 1.8, 1.9, [860, 720], [860, 720], {tag: 'wide'}),
		// "I've been watching the gap beneath the closet door." / "There hasn't been a shadow."
		gap(T('mara_020_gap'), 3.4),
		gap(T('mara_021_no_shadow'), 4.2),
		// "Not once."
		cam(T('mara_022_not_once')),
		// "I think I finally understand why."
		shot(T('mara_023_understand'), 'closet_night', 1.3, 1.4, [900, 640], [880, 650], {tag: 'wide'}),
		// "When I painted over that man, I didn't destroy him." / "I changed his color."
		cam(T('mara_024_didnt_destroy')),
		// "I made him invisible against anything white."
		shot(T('mara_026_invisible'), 'closet_night', 2.0, 2.1, [1400, 520], [1400, 520], {tag: 'door'}),
		// "And nearly every wall in this apartment is white."
		shot(T('mara_027_every_wall'), 'closet_night', 1.0, 1.06, [960, 540], [960, 540], {tag: 'wide'}),
		// four seconds of silence: the gap
		gap(tS, 3.2),
		// "There's something touching the closet door."
		shot(t28, 'closet_night', 2.0, 2.1, [1400, 540], [1400, 540], {tag: 'door', shake: 2}),
	];
	const world = (s: Shot) => {
		const m = talk('mara');
		const crying = t > T('mara_021_no_shadow');
		if (s.tag === 'door' || s.tag === 'gap') {
			const touch = s.tag === 'door' && t > t28 ? ramp(t, t28 + 0.3, t28 + 1.5) : 0;
			return (
				<g>
					<Emboss d={facePaths(1300, 520, 0.9)[0]} k={0.35 * touch} />
					<Huddled f={f} talk={m.talk} viseme={m.viseme} />
				</g>
			);
		}
		return <Huddled f={f} talk={m.talk} viseme={m.viseme} tears={crying ? 0.7 : 0} mouth={crying ? 'wobbly' : 'frown'} look={s.tag === 'cam' ? [0, 0] : [0.5, 0.2]} phone={s.tag !== 'cam'} />;
	};
	const firstCam = T('mara_014_recording');
	return <Shots shots={shots} world={(s) => world(s)} overlay={(s) => (s.tag === 'cam' ? recOverlay(firstCam, t) : null)} />;
};

export const LastSelection: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t29 = T('mara_029_a_face');
	const tB = at('bulge');
	const t35 = T('mara_035_little_lines');
	const t39 = T('mara_039_like');
	const t41 = T('mara_041_oh_no');
	const tC = at('cursor');
	const eC = end('cursor');
	const tF = at('final_click');
	const cam = (tt: number) => shot(tt, 'closet_night', 3.0, 3.15, [790, 720], [790, 725], {tag: 'cam'});
	const wide = (tt: number, tag: string) => shot(tt, 'closet_night', 1.0, 1.0, [960, 540], [960, 540], {tag});
	const shots: Shot[] = [
		// "There's a face."
		shot(t29, 'closet_night', 2.2, 2.35, [1300, 520], [1300, 520], {tag: 'face'}),
		// "I can see it now."
		cam(T('mara_030_see_it_now')),
		// "It's pressed against the other side."
		shot(T('mara_031_pressed'), 'closet_night', 2.7, 2.85, [1300, 520], [1300, 515], {tag: 'face'}),
		// "But it's not coming through."
		cam(T('mara_032_not_coming_through')),
		// "It's just... looking at me."
		shot(T('mara_033_looking_at_me'), 'closet_night', 3.2, 3.4, [1300, 500], [1300, 500], {tag: 'face'}),
		// the white surface bulges inward
		shot(tB, 'closet_night', 2.4, 2.6, [1300, 520], [1300, 520], {tag: 'face', shake: 2.5}),
		// "Wait."
		cam(T('mara_034_wait')),
		// "There are little lines appearing around me." / "On the floor." / "On the walls." / "They're moving."
		wide(t35, 'dashes'),
		shot(T('mara_036_floor'), 'closet_night', 1.6, 1.6, [800, 860], [800, 860], {tag: 'dashes'}),
		wide(T('mara_037_walls'), 'dashes'),
		shot(T('mara_038_moving'), 'closet_night', 1.3, 1.3, [820, 760], [820, 760], {tag: 'dashes'}),
		// "Like..." / "Like a selection box."
		wide(t39, 'ants'),
		// "Oh no." / "Someone's selecting me."
		cam(t41),
		wide(T('mara_042_selecting_me'), 'ants'),
		// a distant mouse click
		wide(at('click_far'), 'ants'),
		// "I'm not the one drawing anymore."
		cam(T('mara_043_not_drawing')),
		// a huge white cursor glides over the dark wall and stops directly above her
		wide(tC, 'cursor'),
		// one final click -> white
		shot(tF, 'paper', 1, 1, [960, 540], [960, 540], {tag: 'white'}),
	];
	const m = talk('mara');
	const faceK = ramp(t, t29 + 0.2, t29 + 2.5) * 0.55 + ramp(t, T('mara_031_pressed'), T('mara_033_looking_at_me', 1)) * 0.45;
	const bulge = ramp(t, tB, end('bulge'));
	const world = (s: Shot) => {
		if (s.tag === 'white') return null;
		const cur = s.tag === 'cursor' ? ramp(t, tC, eC - 0.15) : 0;
		return (
			<g>
				{faceK > 0 ? (
					<g>
						{bulge > 0 ? <ellipse cx={1300} cy={520} rx={150 + 60 * bulge} ry={190 + 70 * bulge} fill="#000" opacity={0.18 * bulge} /> : null}
						{facePaths(1300, 520, 0.95 + 0.1 * bulge).map((d, i) => (
							<Emboss key={i} d={d} k={Math.min(1, faceK + 0.3 * bulge)} w={8 + 6 * bulge} />
						))}
					</g>
				) : null}
				<Huddled f={f} talk={m.talk} viseme={m.viseme} tears={0.8} mouth={t > t41 ? 'scream' : 'wobbly'} look={s.tag === 'cam' ? [0, 0] : t > t35 ? [0, 0.8] : [0.6, -0.1]} shiver={1.2} eyes="wide" phone={s.tag !== 'cam'} />
				{s.tag === 'cursor' ? <WorldCursor x={lerp(1500, 790, cur)} y={lerp(-700, 110, cur)} size={480} press={t > eC - 0.1 ? 1 : 0} /> : null}
			</g>
		);
	};
	const overlay = (s: Shot) => {
		if (s.tag === 'cam') return <RecHud seconds={78 + t - T('mara_030_see_it_now')} />;
		if (s.tag === 'dashes') return <CrawlingDashes f={f} amount={Math.min(1, 0.25 + 0.75 * ramp(t, t35, T('mara_038_moving', 1)))} seed={3} />;
		if (s.tag === 'ants') {
			const grow = ramp(t, t39 + 0.2, t39 + 1.6);
			const box: [number, number, number, number] = t > T('mara_042_selecting_me') ? SEL : [lerp(60, SEL[0], grow), lerp(60, SEL[1], grow), lerp(1860, SEL[2], grow), lerp(1020, SEL[3], grow)];
			return <MarchingAnts f={f} box={box} handles={t > T('mara_040_selection_box')} opacity={s.tag === 'ants' && t > at('click_far') ? (f % 6 < 3 ? 1 : 0.4) : 1} />;
		}
		if (s.tag === 'cursor') return <MarchingAnts f={f} box={SEL} handles />;
		if (s.tag === 'white') return <AbsoluteFill style={{background: '#f6f6f3'}} />;
		return null;
	};
	return <Shots shots={shots} world={(s) => world(s)} overlay={(s) => overlay(s)} />;
};

export const End: React.FC = () => <AbsoluteFill style={{background: '#f6f6f3'}} />;
