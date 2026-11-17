// 8. THE OFFERING - the sofa and the table against the door; silence; a key slides into my lock; the door
// opens against the furniture; Mr. Harris with the master key, the creature behind him. "You promised me one."
// "She's yours." The arm reaches through the doorway. I ran.
import React from 'react';
import {Harris, Sarah} from '../components/characters/Cast';
import {Creature, Prop} from '../components/characters/Creature';
import {Person} from '../stick/goat';
import {GEO, INK, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {FLAT_PROPS} from './NewApartment';
import {SOFA_AT_DOOR} from './Realization';

/** The front door opening inward (hinges on the right): hallway light in the gap, the panel swinging toward us. */
export const FlatDoorOpen: React.FC<{open: number; children?: React.ReactNode}> = ({open, children}) => {
	const [x0, y0, x1, y1] = GEO.flat.door;
	const ix0 = x0 + 6;
	const ix1 = x1 - 6;
	const w = ix1 - ix0;
	const gapR = ix0 + w * open;
	const a = open * 75 * (Math.PI / 180);
	const pw = w * Math.cos(a);
	const grow = Math.sin(a) * 60;
	return (
		<g>
			<rect x={ix0} y={y0 + 6} width={w} height={y1 - y0 - 8} fill="#cfd49a" />
			<rect x={ix0} y={y1 - 70} width={w} height={64} fill="#4a6a46" />
			<defs>
				<clipPath id="flatDoorGap">
					<rect x={ix0} y={y0 + 6} width={Math.max(0, gapR - ix0)} height={y1 - y0 - 6} />
				</clipPath>
			</defs>
			<g clipPath="url(#flatDoorGap)">{children}</g>
			<path d={`M${ix1},${y0 + 6} L${ix1 - pw},${y0 + 6 - grow * 0.6} L${ix1 - pw},${y1 + grow * 0.4} L${ix1},${y1}`} fill="#6b4a30" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			<circle cx={ix1 - pw + 22} cy={(y0 + y1) / 2 + 20} r={10} fill="#c9a24a" stroke={INK} strokeWidth={3} />
		</g>
	);
};

export const Offering: React.FC = () => {
	const {f, t, at, talk} = useStick();
	const t154 = at('narrator_154_pushed_sofa');
	const t155 = at('narrator_155_dining_table');
	const t156 = at('narrator_156_pulled_handle');
	const t157 = at('narrator_157_footsteps_stopped');
	const t159 = at('narrator_159_blood_cold');
	const t160 = at('narrator_160_a_key');
	const tKey = at('key_in_lock');
	const s10 = at('sarah_010_no_please');
	const t162 = at('narrator_162_lock_turned');
	const t163 = at('narrator_163_door_opening');
	const t165 = at('narrator_165_pushed');
	const s11 = at('sarah_011_stop_please');
	const t166 = at('narrator_166_continued_opening');
	const t167 = at('narrator_167_saw_harris');
	const t169 = at('narrator_169_behind_him');
	const tCR = at('creature_reveal');
	const t170 = at('narrator_170_head_sideways');
	const t171 = at('narrator_171_mouth_opened');
	const c01 = at('creature_001_promised');
	const t173 = at('narrator_173_harris_crying');
	const s12 = at('sarah_012_dont_do_this');
	const t174 = at('narrator_174_couldnt_look');
	const h11 = at('harris_011_shes_yours');
	const t175 = at('narrator_175_bent_down');
	const t176 = at('narrator_176_arm_reached');
	const t177 = at('narrator_177_screamed');
	const t178 = at('narrator_178_ran');
	const sar = talk('sarah');
	const har = talk('harris');
	const cre = talk('creature');
	const F = GEO.flat;
	const D = F.door;
	// the barricade: sofa then table in front of the door
	const sofaIn = lerp(SOFA_AT_DOOR - 80, 1560, ramp(t, t154 + 0.2, t155 - 0.2));
	const tableIn = lerp(FLAT_PROPS.table.x, 1230, ramp(t, t155 + 0.1, t156 - 0.1));
	// the door forces them back as it opens
	const open = Math.min(0.95, ramp(t, t163, t165) * 0.2 + ramp(t, t166, t167) * 0.75);
	const shove = open * 330;
	const sofaX = sofaIn - shove;
	const tableX = tableIn - shove * 0.8;
	const sarahX = t < t154 ? SOFA_AT_DOOR - 330 : t < t155 ? sofaIn - 250 : t < t156 ? tableIn - 200 : t < t163 ? 1340 : tableX - 150;
	const run = walk(t, t178 + 0.1, t178 + 1.6, sarahX, 300, 1.6);
	const pushingBack = t >= t163 && t < t167;
	// through the gap: Mr. Harris with the master key, the creature behind him
	const hx = 1515;
	const crX = 1575;
	const bendK = ramp(t, t175, t176);
	const reach = t >= t176 ? ([(sarahX + 70 - crX) / 1.22, (700 - D[3]) / 1.22] as [number, number]) : null;
	const shots = [
		shot(t154, 'flat_night_bare', 1.15, 1.15, [1300, 560], [1300, 560]),
		shot(t156, 'flat_night_bare', 2.0, 2.0, [1380, 560], [1380, 560]),
		shot(t157, 'flat_night_bare', 2.6, 2.7, [1340, 560], [1340, 555]),
		shot(t160, 'flat_night_bare', 5.0, 5.4, [F.lock[0] + 6, F.lock[1] + 30], [F.lock[0] + 6, F.lock[1] + 30]),
		shot(s10 - 0.1, 'flat_night_bare', 2.6, 2.7, [1340, 560], [1340, 555]),
		shot(t162, 'flat_night_bare', 5.0, 5.0, [F.lock[0] + 6, F.lock[1] + 30], [F.lock[0] + 6, F.lock[1] + 30]),
		shot(t163, 'flat_night_bare', 1.25, 1.25, [1400, 560], [1400, 560], {shake: 4}),
		shot(t167, 'flat_night_bare', 1.45, 1.5, [1300, 540], [1300, 540]),
		shot(tCR, 'flat_night_bare', 1.6, 1.65, [1600, 520], [1600, 515]),
		shot(t170, 'flat_night_bare', 2.6, 2.8, [1560, 340], [1560, 335]),
		shot(t173, 'flat_night_bare', 2.4, 2.5, [hx, 470], [hx, 465]),
		shot(s12 - 0.1, 'flat_night_bare', 2.6, 2.7, [0, 0], [0, 0], {track: () => [sarahX + 20, 555]}),
		shot(t174, 'flat_night_bare', 2.4, 2.5, [hx, 470], [hx, 465]),
		shot(t175, 'flat_night_bare', 1.3, 1.3, [1250, 540], [1250, 540]),
		shot(t177, 'flat_night_bare', 2.4, 2.4, [0, 0], [0, 0], {shake: 8, track: () => [sarahX + 20, 555]}),
		shot(t178, 'flat_night_bare', 1.0, 1.0, [960, 540]),
	];
	const lockCU = (t >= t160 && t < s10 - 0.1) || (t >= t162 && t < t163);
	const world = () => {
		const keyIn = ramp(t, tKey, tKey + 0.8);
		const turnK = ramp(t, t162, t162 + 0.5);
		return (
			<g>
				{open > 0 ? (
					<FlatDoorOpen open={open}>
						{t >= t169 ? (
							<Creature x={crX} y={D[3] - 4} s={1.22} frame={f} view="front" tilt={t >= t170 ? 68 : 40} talk={cre.talk || (t >= t171 && t < c01 ? 0.5 : 0)} bend={bendK} reach={reach} />
						) : null}
						<Person is={Harris} name="harris" x={hx} y={D[3] + 4} s={1.42} frame={f} prop={t < t173 ? 'card' : 'none'} arms={t < t173 ? 'holdOne' : 'down'} tears={t >= t173 ? 1 : 0} look={t >= t174 ? [0.4, 1] : [-1, 0]} eyes={t >= t174 ? 'squint' : 'wide'} brows="sad" mouth={har.talk > 0 ? 'open' : 'frown'} talk={har.talk} viseme={har.viseme} overlapOk />
					</FlatDoorOpen>
				) : null}
				{/* the lock from inside: the key slides in, the thumb-turn rotates */}
				<g transform={`translate(${F.lock[0] + 6} ${F.lock[1] + 30})`}>
					{keyIn > 0 && open === 0 ? <circle r={4 + keyIn * 2} fill="#ffe9a0" opacity={0.5 * keyIn} /> : null}
					{open === 0 ? <rect x={-3} y={-12} width={6} height={24} rx={2} fill="#c9a24a" stroke={INK} strokeWidth={2} transform={`rotate(${turnK * 90})`} /> : null}
				</g>
				<Prop name="table" x={t >= t155 ? tableX : FLAT_PROPS.table.x} y={FLAT_PROPS.table.y + 40} w={FLAT_PROPS.table.w} />
				<Prop name="sofa" x={t >= t154 ? sofaX : SOFA_AT_DOOR - 80} y={FLAT_PROPS.sofa.y + 60} w={FLAT_PROPS.sofa.w} />
				{lockCU ? null : <Person
					is={Sarah}
					name="sarah"
					x={t >= t178 ? run.x : sarahX}
					y={F.floor + 40}
					s={1.6}
					frame={f}
					{...(t >= t178 ? {pose: 'run', turn: -0.8, phase: run.phase} : pushingBack ? {turn: 0.8, lean: 20, arms: 'handsForward'} : t >= t156 && t < t157 ? {turn: 0.7, arms: 'grabRight'} : {turn: 0.5})}
					look={[1, -0.1]}
					eyes="wide"
					brows="worried"
					mouth={sar.talk > 0 ? 'scream' : t >= t177 ? 'scream' : t >= t159 ? 'o' : 'flat'}
					talk={sar.talk}
					viseme={sar.viseme}
					shiver={t >= t159 ? 0.9 : 0}
					edge={run.x < 200}
				/>}
			</g>
		);
	};
	void s11;
	void h11;
	return <Shots shots={shots} world={() => world()} />;
};
