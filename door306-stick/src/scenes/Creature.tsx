// 6. THE CREATURE - the lights flicker; long fingers curl round the railing; the head rises; nearly seven feet,
// shoulders scraping the walls, arms almost to the steps, dragging a stained sack that moves. The third floor:
// begging, a sharp cry, silence. Then it climbs on. Toward the fourth floor. Toward me.
import React from 'react';
import {Sarah} from '../components/characters/Cast';
import {Creature as It, Sack} from '../components/characters/Creature';
import {Flicker, HallDoor, peepOverlay, residentsPersp} from '../stick/d306';
import {Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, stairPt, useStick} from '../stick/kit';
import {Group} from '../stick/places';
import {wob} from '../utils/rough';

const INK = '#141414';
const SK = '#8d8a84';

/** A long grey hand coming up from below and curling its fingers round the railing at (x, y). */
const RailHand: React.FC<{x: number; y: number; k: number; curl: number}> = ({x, y, k, curl}) => {
	const from: [number, number] = [x - 120, y + 360];
	const hx = lerp(from[0], x, k);
	const hy = lerp(from[1], y + 10, k);
	return (
		<g>
			<path d={`M${from[0] - 40},${from[1] + 300} Q${from[0]},${(from[1] + hy) / 2} ${hx},${hy}`} fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
			<path d={`M${from[0] - 40},${from[1] + 300} Q${from[0]},${(from[1] + hy) / 2} ${hx},${hy}`} fill="none" stroke={SK} strokeWidth={20} strokeLinecap="round" />
			{[-1.5, -0.5, 0.5, 1.5].map((i) => {
				const base: [number, number] = [hx + i * 9, hy - 6];
				const up: [number, number] = [base[0] + 14 + i * 4, base[1] - 70];
				const over: [number, number] = [up[0] + 30 * curl, up[1] - 10 + 50 * curl];
				const tip: [number, number] = [over[0] + 4 * curl, over[1] + 40 * curl];
				const d = wob([base, up, over, tip], 3000 + i * 7, 0.8, false);
				return (
					<g key={i}>
						<path d={d} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
						<path d={d} fill="none" stroke={SK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
					</g>
				);
			})}
		</g>
	);
};

export const Creature: React.FC = () => {
	const {f, t, at, end} = useStick();
	const t101 = at('narrator_101_back_to_peephole');
	const t102 = at('narrator_102_flickering');
	const t103 = at('narrator_103_moving_darkness');
	const t104 = at('narrator_104_mans_hand');
	const tFC = at('narrator_106_curled');
	const t107 = at('narrator_107_head_appeared');
	const tHR = at('head_rises');
	const t108 = at('narrator_108_bent_forward');
	const t110 = at('narrator_110_shoulders_scraped');
	const t112 = at('narrator_112_behind_it');
	const t114 = at('narrator_114_sack_moved');
	const t115 = at('narrator_115_covered_mouth');
	const t116 = at('narrator_116_another_step');
	const t118 = at('narrator_118_grey_skin');
	const t119 = at('narrator_119_mouth_open');
	const t121 = at('narrator_121_third_floor');
	const t122 = at('narrator_122_begging');
	const t123 = at('narrator_123_sharp_cry');
	const t124 = at('narrator_124_silence');
	const t125 = at('narrator_125_sack_scraped');
	const t126 = at('narrator_126_continued');
	const t127 = at('narrator_127_fourth_floor');
	const t128 = at('narrator_128_toward_me');
	const S = GEO.stair;
	const L3 = S.landing3;
	// rise from below the 3rd-floor landing, step onto it, walk to the door, then climb
	const rise = ramp(t, t107, tHR + 1.4);
	const onLanding = ramp(t, t108, t110 + 1);
	const toDoor = ramp(t, t116, t118);
	const climb = ramp(t, t126, t127 + 1);
	let cx = lerp(620, 560, onLanding);
	let cy = lerp(L3 + 560, L3, rise);
	if (t >= t116) cx = lerp(560, 470, toDoor);
	let view: 'front' | 'side' = 'side';
	let left = t >= t116 && t < t126;
	if (t >= t126) {
		const [px, py] = stairPt(0.02 + climb * 0.55);
		cx = px;
		cy = py;
		left = false;
	}
	if (t >= t118 && t < t121) view = 'front';
	const walking = (t >= t116 && t < t118) || (t >= t126 && climb < 1);
	const door3 = t >= t122 && t < t126 ? 0.4 : 0;
	const reachIn = t >= t122 && t < t124;
	const sackMoving = t >= t114 && t < t115 + 1 ? 1 : t >= t125 ? 0.6 : 0;
	const sackX = t >= t126 ? cx - 152 : cx + (left ? 152 : -152);
	const sackY = t >= t126 ? cy + 70 : L3;
	const res = residentsPersp(f, 'stairs').map((p) => ({...p, idle: false, shiver: 0.6}));
	const st = GEO.persp.stairs;
	const shots = [
		shot(t101, 'flat_night_bare', 2.4, 2.5, [1530, 540], [1530, 530]),
		shot(t102, 'hallway_persp_night', 1.0, 1.05, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t103, 'hallway_persp_night', 1.8, 2.0, [950, 520], [950, 515], {tag: 'peep'}),
		shot(t104, 'stairwell_night', 2.2, 2.4, [620, 760], [620, 740]),
		shot(t107, 'stairwell_night', 1.0, 1.0, [960, 540]),
		shot(t110, 'stairwell_night', 1.4, 1.45, [560, 640], [560, 640]),
		shot(t112, 'stairwell_night', 1.5, 1.5, [700, 760], [700, 760]),
		shot(t115, 'flat_night_bare', 2.6, 2.7, [1450, 540], [1450, 535]),
		shot(t116, 'stairwell_night', 1.15, 1.15, [700, 620], [700, 620]),
		shot(t118, 'stairwell_night', 3.2, 3.6, [470, 470], [470, 470]),
		shot(t121, 'stairwell_night', 1.4, 1.4, [450, 640], [450, 640]),
		shot(t123, 'stairwell_night', 1.4, 1.4, [450, 640], [450, 640], {shake: 10}),
		shot(t124, 'stairwell_night', 1.0, 1.0, [960, 540]),
		shot(t127, 'hallway_persp_night', 1.3, 1.9, [950, 540], [950, 520], {tag: 'peep'}),
		shot(t128, 'flat_night_bare', 2.8, 3.0, [1450, 530], [1450, 525]),
	];
	const world = (set: string) => {
		if (set === 'flat_night_bare') {
			return <Person is={Sarah} name="sarah" x={1500} y={GEO.flat.floor} s={1.6} frame={f} turn={0.7} lean={6} look={[1, -0.1]} eyes="wide" brows="worried" mouth="o" arms={t >= t115 ? 'fingerLips' : 'down'} shiver={0.8} pale={0.2} />;
		}
		if (set === 'hallway_persp_night') {
			const head = t >= t127 ? ramp(t, t127, t128) : t >= t103 ? 0.15 : 0;
			return (
				<g>
					<defs>
						<clipPath id="stairsClip6">
							<rect x={st[0]} y={st[1] - 250} width={st[2] - st[0]} height={st[3] - st[1] + 250} />
						</clipPath>
					</defs>
					{head > 0 ? (
						<g clipPath="url(#stairsClip6)">
							<It x={(st[0] + st[2]) / 2} y={st[3] + lerp(330, 10, head)} s={0.55} frame={f} view="front" tilt={40} qa={false} />
						</g>
					) : null}
					<Group people={res} />
					<Flicker f={f} k={t >= t102 ? 0.55 : 0} />
				</g>
			);
		}
		// the stairwell
		if (t < t107) {
			const curl = ramp(t, tFC, tFC + 1.2);
			return (
				<g>
					<RailHand x={612} y={772} k={ramp(t, t104, t104 + 1.6)} curl={curl} />
					<Flicker f={f} k={0.5} />
				</g>
			);
		}
		return (
			<g>
				<HallDoor r={S.door3} open={door3} dark="#1d1a14" />
				<defs>
					<clipPath id="landingClip">
						<rect x={0} y={0} width={1920} height={L3 + 8} />
					</clipPath>
				</defs>
				{t >= t112 ? <Sack x={sackX} y={sackY} s={0.75} frame={f} moving={sackMoving} /> : null}
				<g clipPath={t < t108 + 0.6 ? 'url(#landingClip)' : undefined}>
					<It
						x={cx}
						y={cy}
						s={0.95}
						frame={f}
						view={view}
						left={left}
						walking={walking}
						phase={t * 5}
						tilt={view === 'front' ? 50 : 22}
						hunch={0.7}
						talk={t >= t119 && t < t121 ? 0.7 : 0}
						qa={!(t < t108 + 0.6)}
						reach={reachIn ? [170, -330] : null}
						grip={t >= t112 && !reachIn ? [-160, -40] : null}
					/>
				</g>
				<Flicker f={f} k={t >= t123 && t < t124 ? 1 : 0.4} />
			</g>
		);
	};
	void end;
	return <Shots shots={shots} world={(s) => world(s.set)} overlay={peepOverlay} />;
};
