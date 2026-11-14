// 3. FACING AWAY - Wyatt, Dez and Nia walk him home at dusk; the copper smell; running; they burst in;
// what Nia's flashlight found on the trail: men standing in the trees with their backs to them.
import React from 'react';
import {Dez, Nia, Wyatt} from '../components/characters/Cast';
import {BackTurned} from '../components/characters/Thing';
import {Beam, Campfire, DoorOpen, Person, QAShape, Smell} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, clearingSpec, Group, trailerSpec, type Spec} from '../stick/places';

const EIGHT = ['marcus', 'ray', 'kayla', 'tasha', 'jalen', 'malik', 'lucia', 'andre'];

export const FacingAway: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t24 = at('narrator_024_around_seven');
	const t25 = at('narrator_025_dez_nia');
	const tWent = word('narrator_025_dez_nia', 'went', 0.4);
	const t26 = at('narrator_026_forty_minutes');
	const t27 = at('narrator_027_copper');
	const t28 = at('narrator_028_stoves');
	const t29 = at('narrator_029_running');
	const t30 = at('narrator_030_burst_out');
	const t31 = at('narrator_031_dez_crying');
	const t32 = at('narrator_032_toughest');
	const w01 = at('wyatt_001_lock_door');
	const tL = at('locked');
	const t33 = at('narrator_033_pig');
	const t34 = at('narrator_034_flashlight');
	const tMan = word('narrator_034_flashlight', 'man', 0.6);
	const t35 = at('narrator_035_just_standing');
	const t36 = at('narrator_036_back_to_them');
	const t37 = at('narrator_037_another');
	const t38 = at('narrator_038_closer');
	const t39 = at('narrator_039_facing_away');
	const t40 = at('narrator_040_gibbering');
	const t41 = at('narrator_041_jerking');
	const t42 = at('narrator_042_stepped_out');
	const tSO = at('stepped_out');
	const wyT = talk('wyatt');
	const C = GEO.clearing;

	// ---- dusk: all eleven by the fire, then the three walk off to the right
	const three = ['wyatt', 'dez', 'nia'];
	const DUSK: Record<string, [number, number, number]> = {
		marcus: [260, 1045, 1.28], ray: [460, 1045, 1.28], kayla: [660, 1045, 1.28], tasha: [160, 920, 1.08], jalen: [360, 920, 1.08], malik: [560, 920, 1.08], lucia: [1000, 920, 1.08], andre: [1170, 920, 1.08],
		dez: [1380, 1045, 1.28 * 1.1], nia: [1560, 1045, 1.28], wyatt: [1740, 1045, 1.28],
	};
	const at3 = (n: string, extra: Record<string, unknown>) => {
		const [x, y, sc] = DUSK[n];
		return clearingSpec(n, {x, y, s: sc, ...extra});
	};
	const duskPeople: Spec[] = [...EIGHT, ...three].map((n) => {
		const sp = at3(n, {frame: f, look: three.includes(n) ? [1, 0] : [0.6, 0.2]});
		if (three.includes(n)) {
			const w = walk(t, tWent + three.indexOf(n) * 0.35, tWent + 4 + three.indexOf(n) * 0.35, sp.x, 2150 + three.indexOf(n) * 120, sp.s);
			return {...sp, x: w.x, ...(w.moving ? {pose: 'walk', turn: 0.8, phase: w.phase} : {}), edge: true, prop: n === 'nia' ? 'flashlight' : 'none'};
		}
		return sp;
	});
	// ---- night at the fire: the eight left behind
	const smellK = t >= t26 + 1 ? ramp(t, t26 + 1, t27 + 1) : 0;
	const nightPeople: Spec[] = EIGHT.map((n) =>
		at3(n, {
			...(n === 'lucia' ? {x: 860, y: 1045, s: 1.28} : {}),
			...(n === 'andre' ? {x: 760, y: 920, s: 1.08} : {}),
			frame: f,
			look: t >= t29 ? [1, -0.1] : [0.4, 0.3],
			eyes: t >= t29 ? 'wide' : t >= t27 ? 'squint' : 'dot',
			brows: t >= t27 ? 'worried' : 'none',
			mouth: t >= t29 ? 'o' : t >= t27 ? 'frown' : 'smile',
			arms: t >= t27 && t < t29 && n.length % 2 ? 'fingerLips' : 'down',
		}),
	);
	// they burst out of the dark from the left and run into the trailer
	const run = (i: number) => {
		const t0 = t30 + 0.2 + i * 0.25;
		const k = ramp(t, t0, t0 + 1.7);
		return {x: lerp(2100, C.door[0] + 70, k), in: t > t0 + 1.75, moving: k > 0 && k < 1};
	};
	const doorOpen = t >= t30 + 1.2 && t < t30 + 3 ? 1 : 0;
	const runners = [Wyatt, Dez, Nia].map((C2, i) => {
		const r = run(i);
		if (r.in || t < t30) return null;
		return <Person key={i} is={C2} name={three[i]} x={r.x} y={C.steps[3] + 40 + i * 30} s={1.15} frame={f} pose="run" turn={-0.8} phase={r.x / 50} eyes="wide" mouth="o" edge overlapOk />;
	});

	// ---- inside: Dez crying, Wyatt at the door
	const inside: Spec[] = ['ray', 'marcus', 'wyatt', 'nia', 'kayla', 'lucia', 'tasha', 'andre', 'dez', 'jalen', 'malik'].map((n) => {
		const o: Record<string, unknown> = {frame: f, look: [0.6, 0], brows: 'worried', mouth: 'flat'};
		if (n === 'dez') return trailerSpec('dez', {...o, x: 780, y: GEO.trailer.seat + 72 * 1.3 * 1.1, s: 1.3 * 1.1, pose: 'sit', tears: 1, mouth: 'wobbly', eyes: 'squint', brows: 'sad', look: [0, 0.6]});
		if (n === 'wyatt') return trailerSpec('wyatt', {...o, x: 1500, mouth: wyT.talk > 0 ? 'shout' : 'flat', talk: wyT.talk, viseme: wyT.viseme, arms: t >= w01 ? 'point' : 'down', look: [-1, 0]});
		if (n === 'dez' || n === 'thing') return trailerSpec(n, o);
		return trailerSpec(n === 'nia' ? 'nia' : n, o);
	}).filter((p) => p.name !== 'thing');
	// nobody may stand where Wyatt and Dez went: move the two that were there
	for (const p of inside) {
		if (p.name === 'dez') continue;
		if (p.name === 'jalen') p.x = 1640;
		if (p.name === 'malik') p.x = 1790;
	}
	const insideB = boxesOf(inside);

	// ---- the trail at night, from the side: three walking left to right with the torch
	const TR = GEO.trail.ground;
	const walkK = (t - t34) / Math.max(1, t40 - t34);
	const baseX = lerp(260, 760, Math.min(1, walkK));
	const fig1 = {x: 1420, y: 860};
	const fig2 = {x: lerp(280, 520, ramp(t, t38, t38 + 0.8)), y: lerp(860, 905, ramp(t, t38, t38 + 0.8))};
	const showFig1 = t >= tMan - 0.1;
	const showFig2 = t >= t37 + 0.3;
	const jerk = t >= t40 ? 1 : 0;
	const beamTo: [number, number] = t >= t41 ? [lerp(fig1.x, 200, ramp(t, t41, t41 + 0.4)), 640] : t >= t37 ? [lerp(fig1.x, fig2.x, ramp(t, t37, t37 + 0.5)), 650] : [fig1.x, 650];
	const trailPeople: Spec[] = [
		{is: Wyatt, name: 'wyatt', x: baseX + 260, y: TR + 10, s: 1.25, frame: f, pose: t < t35 ? 'walk' : 'stand', turn: 0.8, phase: baseX / 34, look: [1, 0], eyes: t >= t35 ? 'wide' : 'dot', mouth: t >= t40 ? 'o' : 'flat'},
		{is: Dez, name: 'dez', x: baseX, y: TR + 12, s: 1.25 * 1.1, frame: f, pose: t < t35 ? 'walk' : 'stand', turn: 0.8, phase: baseX / 34 + 1, look: [1, 0], eyes: t >= t35 ? 'wide' : 'dot', brows: t >= t37 ? 'worried' : 'none'},
		{is: Nia, name: 'nia', x: baseX + 130, y: TR + 14, s: 1.2, frame: f, pose: t < t35 ? 'walk' : 'stand', turn: t >= t37 && t < t41 ? -0.3 : 0.8, phase: baseX / 34 + 2, look: t >= t37 && t < t41 ? [-1, -0.2] : [1, -0.2], eyes: 'wide', mouth: t >= t40 ? 'o' : 'flat', prop: 'flashlight'},
	];
	const niaHand: [number, number] = [baseX + 130 + 40, TR + 14 - 150];

	const shots = [
		shot(0, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'dusk'}),
		shot(t26, 'clearing_night', 1.0, 1.0, [960, 540]),
		fshot(boxesOf(nightPeople), t27, 'clearing_night', 1.6, [520, 700]),
		shot(t28, 'trailer_night', 1.6, 1.65, [330, 600], [320, 600], {light: 'warm'}),
		shot(t29, 'clearing_night', 1.0, 1.0, [960, 540]),
		fshot(insideB, t31, 'trailer_night', 2.2, [780, 600], {light: 'warm'}),
		fshot(insideB, t32, 'trailer_night', 2.8, [780, 560], {light: 'warm'}),
		fshot(insideB, w01 - 0.2, 'trailer_night', 2.2, [1600, 620], {light: 'warm'}),
		shot(tL, 'trailer_night', 3.0, 3.0, [1600, 540], [1600, 540], {light: 'warm'}),
		shot(t33, 'farm_day', 1.5, 1.6, [560, 780], [560, 790], {light: 'grey'}),
		shot(t34, 'trail_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'torch'}),
		shot(t35, 'trail_night', 2.0, 2.15, [fig1.x, 700], [fig1.x, 690], {light: 'torch'}),
		shot(t37, 'trail_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'torch'}),
		shot(t38, 'trail_night', 1.6, 1.7, [520, 700], [500, 690], {light: 'torch'}),
		shot(t40, 'trail_night', 1.0, 1.0, [960, 540], [960, 540], {light: 'torch', shake: 5}),
		shot(t42, 'clearing_night', 1.0, 1.0, [960, 540]),
		shot(tSO, 'clearing_night', 2.0, 2.1, [1700, 620], [1710, 620]),
	];

	const world = (set: string) => {
		if (set === 'clearing_day') {
			return (
				<g>
					<Campfire x={C.fire[0]} y={C.fire[1]} s={0.9} frame={f} />
					<Group people={duskPeople} />
				</g>
			);
		}
		if (set === 'clearing_night') {
			const stepped = t >= t42 + 1.2;
			return (
				<g>
					<Campfire x={C.fire[0]} y={C.fire[1]} s={0.9} frame={f} />
					<DoorOpen r={C.door} open={doorOpen} />
					<Group people={nightPeople} />
					{runners}
					<Smell k={smellK * (t < t29 ? 1 : 0.5)} frame={f} color="#c98a6a" y0={380} y1={980} />
					{t >= t42 ? (
						<g opacity={ramp(t, t42 + 1.0, t42 + 1.8)}>
							<BackTurned x={1800} y={780} s={0.8} frame={f} />
							<QAShape name="figure" x0={1752} y0={500} x1={1848} y1={780} />
						</g>
					) : null}
					{!stepped && t >= t42 ? null : null}
				</g>
			);
		}
		if (set === 'trailer_night') {
			if (t < t31) {
				const stove: Spec[] = [trailerSpec('marcus', {frame: f, arms: 'handsForward', look: [-1, 0.4], brows: 'worried'}), trailerSpec('ray', {frame: f, look: [1, 0.3], brows: 'worried'}), trailerSpec('wyatt', {name: 'andre', is: trailerSpec('andre').is, frame: f, look: [-1, 0.3]})];
				return <Group people={stove} />;
			}
			return (
				<g>
					<Group people={inside} />
				</g>
			);
		}
		if (set === 'farm_day') {
			// the pigpen: the broken rail, churned mud, a dark stain - and flies
			return (
				<g>
					<ellipse cx={600} cy={850} rx={120} ry={26} fill="#3a1d16" opacity={0.55} />
					{[0, 1, 2, 3, 4].map((i) => (
						<circle key={i} cx={600 + Math.sin(f / 5 + i * 2) * 60} cy={790 + Math.cos(f / 4 + i) * 30} r={3} fill="#111" />
					))}
				</g>
			);
		}
		// the trail
		const lit = (x: number) => Math.abs(beamTo[0] - x) < 260;
		return (
			<g>
				<Beam from={niaHand} to={beamTo} w={150} k={1.2} />
				{showFig1 ? (
					<g opacity={lit(fig1.x) ? 1 : 0.35}>
						<BackTurned x={fig1.x} y={fig1.y} s={1.15} frame={f} jerk={jerk} />
						<QAShape name="figure1" x0={fig1.x - 60} y0={fig1.y - 400} x1={fig1.x + 60} y1={fig1.y} />
					</g>
				) : null}
				{showFig2 ? (
					<g opacity={lit(fig2.x) ? 1 : 0.35}>
						<BackTurned x={fig2.x} y={fig2.y} s={1.15} frame={f} jerk={jerk} />
						<QAShape name="figure2" x0={fig2.x - 60} y0={fig2.y - 400} x1={fig2.x + 60} y1={fig2.y} />
					</g>
				) : null}
				<Group people={trailPeople} />
			</g>
		);
	};
	void end;
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
