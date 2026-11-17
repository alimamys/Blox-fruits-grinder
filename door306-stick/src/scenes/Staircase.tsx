// 9. THE STAIRCASE - the ice-cold grip on my ankle; pulled across the floor; dragged out into the corridor past
// every neighbour. "I'm sorry." Down the first step. They close their doors, one by one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Boy, Harris, Mother, OldMan, RobeMan, RobeWoman, Sarah, Shawl, TShirt} from '../components/characters/Cast';
import {Creature, Sack} from '../components/characters/Creature';
import {Flicker, HallDoor, SarahDown} from '../stick/d306';
import {Person, QAShape} from '../stick/goat';
import {fshot, GEO, INK, lerp, ramp, shot, Shots, stairPt, useStick, walk} from '../stick/kit';
import {boxesOf, Group, type Spec} from '../stick/places';
import {FlatDoorOpen} from './Offering';

const SK = '#8d8a84';

export const Staircase: React.FC = () => {
	const {f, t, at, talk, total} = useStick();
	const t179 = at('narrator_179_almost_bedroom');
	const t180 = at('narrator_180_ankle');
	const t182 = at('narrator_182_fell');
	const t183 = at('narrator_183_carpet');
	const t184 = at('narrator_184_pulling');
	const t185 = at('narrator_185_fingernails');
	const t186 = at('narrator_186_doorframe');
	const t188 = at('narrator_188_harder');
	const t189 = at('narrator_189_corridor');
	const t190 = at('narrator_190_watching');
	const s14 = at('sarah_014_help_me');
	const t191 = at('narrator_191_nobody_moved');
	const t192 = at('narrator_192_mother_held');
	const t193 = at('narrator_193_old_man_floor');
	const t194 = at('narrator_194_reached_harris');
	const h12 = at('harris_012_im_sorry');
	const t197 = at('narrator_197_stepped_aside');
	const t198 = at('narrator_198_toward_stairs');
	const t199 = at('narrator_199_sack_behind');
	const t201 = at('narrator_201_railing');
	const t203 = at('narrator_203_first_step');
	const t205 = at('narrator_205_looked_back');
	const t209 = at('narrator_209_closing_doors');
	const tDC = at('doors_close');
	const t211 = at('narrator_211_my_screams');
	const tFD = at('fade_dark');
	const tSE = at('silence_end');
	const sar = talk('sarah');
	const har = talk('harris');
	if (t >= tSE) return <AbsoluteFill style={{background: '#000'}} />;
	const F = GEO.flat;
	const H = GEO.hall;
	// ---- the flat: run, the grip, the fall, pulled back across the floor to the door
	const run = walk(t, t179 - 0.4, t180, 520, 360, 1.6);
	const down = t >= t182;
	const pull = ramp(t, t184, t186) * 520;
	const lyX = 640 + pull; // centre of her body (head to the left)
	const ankle: [number, number] = down ? [lyX + 240, F.floor - 30] : [run.x + 10, F.floor - 10];
	const armFrom: [number, number] = [1560, 640];
	// ---- the hallway: dragged from her door to the stairs past the residents
	const dragK = ramp(t, t189, t198 + 3);
	const cX = lerp(980, 1760, dragK) + (t >= t194 && t < t197 ? 0 : 0);
	const gripX = cX - 190;
	const harrisX = t < t197 ? 1690 : lerp(1690, 1540, ramp(t, t197, t197 + 1.2));
	const residents: Spec[] = [
		{is: RobeWoman, name: 'robewoman', x: 120, y: H.floor - 25, s: 1.3, frame: f},
		{is: Mother, name: 'mother', x: 300, y: H.floor - 25, s: 1.3, frame: f, arms: 'hug', overlapOk: true},
		{is: Boy, name: 'boy', x: 300, y: H.floor - 13, s: 1.3, frame: f, tears: 1, eyes: 'squint', overlapOk: true},
		{is: RobeMan, name: 'robeman', x: 520, y: H.floor - 25, s: 1.3, frame: f},
		{is: TShirt, name: 'tshirt', x: 1100, y: H.floor - 25, s: 1.3, frame: f},
		{is: Shawl, name: 'shawl', x: 1265, y: H.floor - 25, s: 1.3, frame: f},
		{is: OldMan, name: 'oldman', x: 1405, y: H.floor - 25, s: 1.3, frame: f, look: t >= t193 ? [0, 1] : [-0.4, 0.4], shiver: 1.4, eyes: t >= t193 ? 'squint' : 'dot'},
	].map((p) => ({look: [Math.sign(cX - 200 - p.x) * 0.8, 0.4], mouth: 'flat', brows: 'sad', eyes: 'dot', ...p})) as Spec[];
	// they go back in and close their doors, one by one
	const closing = t >= t209;
	const doorsClosed = (i: number) => ramp(t, t209 + 0.3 + i * 0.9, t209 + 0.9 + i * 0.9);
	const shown = (p: Spec, i: number) => !(closing && t > t209 + 0.2 + i * 0.6);
	const harris: Spec = {is: Harris, name: 'harris', x: harrisX, y: H.floor - 25, s: 1.3, frame: f, look: t >= t195() ? [-1, 0.5] : [0, 1], tears: 1, brows: 'sad', mouth: har.talk > 0 ? 'open' : 'frown', talk: har.talk, viseme: har.viseme, edge: harrisX > 1650};
	function t195() {
		return at('narrator_195_looked_at_me');
	}
	// ---- the stairs: going down
	const descK = ramp(t, t203, t211 + 4);
	const [sx, sy] = stairPt(lerp(0.97, 0.0, descK));
	const shots = [
		shot(t179, 'flat_night_bare', 1.0, 1.0, [960, 540]),
		shot(t180, 'flat_night_bare', 1.35, 1.4, [760, 700], [760, 700]),
		shot(t182, 'flat_night_bare', 1.15, 1.2, [900, 640], [900, 640], {shake: 6}),
		shot(t185, 'flat_night_bare', 2.2, 2.3, [0, 0], [0, 0], {track: () => [lyX - 200, 900]}),
		shot(t186, 'flat_night_bare', 1.7, 1.75, [1500, 760], [1500, 760]),
		shot(t189, 'hallway_night', 1.0, 1.0, [960, 540]),
		fshot(boxesOf([...residents, harris]), t190, 'hallway_night', 1.5, [700, 640]),
		shot(s14, 'hallway_night', 1.0, 1.06, [960, 540], [880, 600]),
		shot(t191, 'hallway_night', 1.0, 1.0, [960, 540]),
		shot(t192, 'hallway_night', 1.45, 1.45, [560, 700], [560, 700]),
		shot(t193, 'hallway_night', 2.2, 2.3, [1405, 620], [1405, 620]),
		shot(t194, 'hallway_night', 1.5, 1.5, [1450, 640], [1450, 640]),
		fshot(boxesOf([...residents, harris]), h12 - 0.15, 'hallway_night', 2.3, [harrisX, 600]),
		shot(t197, 'hallway_night', 1.0, 1.0, [960, 540]),
		shot(t201, 'stairwell_night', 1.0, 1.0, [960, 540], [960, 540]),
		shot(t203, 'stairwell_night', 1.0, 1.0, [960, 540]),
		shot(t205, 'hallway_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'fluoro'}),
		shot(t211, 'stairwell_night', 1.0, 1.0, [960, 540]),
	];
	const world = (set: string) => {
		if (set === 'flat_night_bare') {
			const lyingP = {eyes: 'wide', brows: 'worried', mouth: sar.talk > 0 ? 'scream' : 'scream', talk: sar.talk};
			if (t >= t186) {
				// lying at the threshold, feet already out in the hallway, her hands on the door frame - slipping
				const slip = ramp(t, t188, t189);
				return (
					<g>
						<FlatDoorOpen open={0.95} />
						<SarahDown x={1600 + slip * 60} y={F.floor + 20} s={1.6} frame={f} dir={-1} face={lyingP} />
					</g>
				);
			}
			return (
				<g>
					<FlatDoorOpen open={0.95}>
						<Creature x={1590} y={F.door[3] - 4} s={1.22} frame={f} view="front" tilt={60} bend={1} reach={t >= t180 ? [(ankle[0] - 1590) / 1.22, (ankle[1] - F.door[3]) / 1.22] : null} />
					</FlatDoorOpen>
					{t >= t180 ? (
						// the arm across the floor, out of the doorway (it is longer than the room)
						<g>
							<path d={`M${armFrom[0]},${armFrom[1]} Q${(armFrom[0] + ankle[0]) / 2},${F.floor + 10} ${ankle[0]},${ankle[1]}`} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
							<path d={`M${armFrom[0]},${armFrom[1]} Q${(armFrom[0] + ankle[0]) / 2},${F.floor + 10} ${ankle[0]},${ankle[1]}`} fill="none" stroke={SK} strokeWidth={15} strokeLinecap="round" />
						</g>
					) : null}
					{down ? (
						<g>
							<SarahDown x={lyX} y={F.floor + 20} s={1.6} frame={f} dir={-1} face={lyingP} />
							{t >= t185 ? [0, 1, 2, 3].map((i) => <path key={i} d={`M${lyX - 250 - i * 6},${F.floor + 24 + i * 5} l${pull > 0 ? 60 : 0},0`} stroke="#d9cbb0" strokeWidth={2} opacity={0.7} />) : null}
						</g>
					) : (
						<Person is={Sarah} name="sarah" x={run.x} y={F.floor} s={1.6} frame={f} pose={run.moving ? 'run' : 'stand'} turn={-0.8} phase={run.phase} eyes="wide" brows="worried" mouth="scream" />
					)}
					{t >= t180 ? <circle cx={ankle[0]} cy={ankle[1]} r={14} fill={SK} stroke={INK} strokeWidth={4} /> : null}
					{t >= t183 && t < t184 + 1 ? <rect x={GEO.flat.rug[0] - 4} y={GEO.flat.rug[1]} width={10} height={GEO.flat.rug[3] - GEO.flat.rug[1]} fill="#5a2a2a" /> : null}
				</g>
			);
		}
		if (set === 'stairwell_night') {
			if (t < t203) {
				// her hand reaching for the railing at the top, the long fingers tightening on her ankle
				return (
					<g>
						<Creature x={1500} y={GEO.stair.landing4 + 10} s={0.78} frame={f} view="side" left tilt={24} grip={[-160, -30]} />
						<SarahDown x={1690} y={GEO.stair.landing4 + 14} s={0.85} frame={f} dir={1} face={{mouth: 'scream'}} />
						<Flicker f={f} k={0.4} />
					</g>
				);
			}
			const fade = ramp(t, tFD, tSE);
			return (
				<g>
					<g transform={`translate(${sx + 180} ${sy - 140}) rotate(-36)`}>
						<SarahDown x={0} y={0} s={1.0} frame={f} dir={1} face={{mouth: 'scream'}} qa={false} />
					</g>
					<QAShape name="sarah (on the stairs)" x0={sx + 50} y0={sy - 290} x1={sx + 330} y1={sy - 60} small overlapOk />
					<Creature x={sx} y={sy} s={0.95} frame={f} view="side" left walking phase={t * 5} tilt={24} grip={[-150, -60]} />
					<Sack x={sx - 120} y={sy + 70} s={0.6} frame={f} moving={0.5} />
					<Flicker f={f} k={0.5} />
					<rect x={-100} y={-100} width={2200} height={1300} fill="#000" opacity={fade} />
				</g>
			);
		}
		// the hallway
		const dragging = t < t201;
		const visible = residents.filter((p, i) => shown(p, i));
		return (
			<g>
				{H.doors.map((d, i) => (
					<HallDoor key={i} r={d} open={i === 1 ? 1 : 1 - doorsClosed(i === 0 ? 0 : 1)} />
				))}
				<Group people={t < t197 ? [...visible, harris] : [...visible, harris].filter(() => true)} />
				{dragging && t < t205 ? (
					<g>
						<SarahDown x={gripX - 240} y={H.floor + 52} s={1.4} frame={f} dir={-1} face={{mouth: sar.talk > 0 ? 'scream' : 'o', talk: sar.talk}} reach={t >= s14} />
						<Creature x={cX} y={H.floor + 52} s={1.05} frame={f} view="side" walking={t < t194 || t >= t197} phase={t * 4} tilt={24} grip={[-180, -30]} />
						{t >= t199 ? <Sack x={cX - 560} y={H.floor + 60} s={0.65} frame={f} moving={1} /> : null}
					</g>
				) : null}
			</g>
		);
	};
	void total;
	void tDC;
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
