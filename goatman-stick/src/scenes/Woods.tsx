// 2. THE WOODS - Chicago to Alabama; the clearing and the smell; the creek and Mr. Dawes with his shotgun;
// Wyatt joins; by sunset there are eleven of us.
import React from 'react';
import {Dawes, Marcus} from '../components/characters/Cast';
import {Campfire, Counts, Person, PlateShake, Smell} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, CAST, clearingSpec, Group, headOf, type Spec} from '../stick/places';

const TEN = ['marcus', 'dez', 'ray', 'nia', 'tasha', 'kayla', 'lucia', 'jalen', 'andre', 'malik'];

export const Woods: React.FC = () => {
	const {f, t, at, word, talk} = useStick();
	const t13 = at('narrator_013_sixteen');
	const t14 = at('narrator_014_land');
	const t15 = at('narrator_015_city_boy');
	const t16 = at('narrator_016_smell');
	const t17 = at('narrator_017_lightning');
	const t18 = at('narrator_018_let_it_go');
	const tC = at('creek');
	const t19 = at('narrator_019_creek');
	const tMoved = word('narrator_019_creek', 'bushes', 0.8);
	const t20 = at('narrator_020_shotgun');
	const tKid = word('narrator_020_shotgun', 'skinny', 0.6);
	const d01 = at('dawes_001_stick_together');
	const t21 = at('narrator_021_hang_out');
	const t22 = at('narrator_022_eleven');
	const t23 = at('narrator_023_remember');
	const tS = at('sunset');
	const dawesT = talk('dawes');
	const i0 = 0;
	const g = GEO.clearing.ground;

	// ---- the clearing by day: everybody walks in from the left, then mills about
	// single file, rightmost place first, same pace, so nobody walks through anybody
	const order = [...TEN].sort((a, b) => clearingSpec(b).x - clearingSpec(a).x);
	const arrive = (name: string): Spec => {
		const home = clearingSpec(name);
		const i = order.indexOf(name);
		const x0 = -160 - i * 190;
		const t0 = t13 + 0.2;
		const w = walk(t, t0, t0 + (home.x - x0) / 300, x0, home.x, home.s);
		return {...home, x: w.x, frame: f, ...(w.moving ? {pose: 'walk', turn: 0.8, phase: w.phase} : {}), edge: w.x < 200, prop: 'none'};
	};
	const smellK = ramp(t, t16 + 0.4, t16 + 1.4) * (1 - ramp(t, t18 + 0.5, t18 + 2));
	const marcusSniff = t >= t16 && t < t18 + 1;

	// ---- the creek: kids in the water, waist-deep
	const W = GEO.creek.water;
	const inWater = ['dez', 'ray', 'nia', 'tasha', 'jalen', 'andre'];
	const waterX = [300, 470, 640, 820, 1000, 1160];
	const bankKids = ['marcus', 'kayla', 'lucia', 'malik'];
	const bankX = [160, 1380, 1530, 1700];
	const bushK = t >= tMoved - 0.2 && t < t20 + 1.5 ? 1 : 0;
	const dawesIn = ramp(t, t20 + 0.2, t20 + 1.4);
	const dawesX = lerp(1560, 1420, dawesIn);
	const wyattX = lerp(1700, 1580, ramp(t, tKid - 0.2, tKid + 1.0));

	// ---- sunset by the fire: all eleven
	const eleven = [...TEN, 'wyatt'].map((n) => clearingSpec(n, {frame: f, look: [0, 0.4]}));
	const elevenHeads = [...eleven].sort((a, b) => a.x - b.x).map(headOf);

	const creekPeople: Spec[] = [
		...bankKids.map((n, i) => ({...clearingSpec(n), x: bankX[i], y: GEO.creek.bank + 20, s: 1.25, pose: 'stand', frame: f, look: [t >= t20 ? 1 : 0, 0], brows: t >= t20 ? 'worried' : 'none'})),
	] as Spec[];
	const swimBoxes: Array<[number, number, number]> = waterX.map((x) => [x - 62, x + 62, GEO.creek.water - 120]);
	const B_creek = [...boxesOf(creekPeople), ...swimBoxes, [1365, 1475, 400] as [number, number, number], [1525, 1635, 400] as [number, number, number]];

	const tmp = (tt: number) => TEN.map((n) => clearingSpec(n, {x: n === 'marcus' ? 560 : n === 'dez' ? 720 : n === 'ray' ? 860 : clearingSpec(n).x + 0 * tt}));
	void i0;
	const dragBoxes = boxesOf(tmp(t15));
	const smellBoxes = boxesOf(tmp(t16 + 3));
	const shots = [
		shot(0, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t13, 'city_night', 1.0, 1.04, [960, 560], [960, 560]),
		shot(t14, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(t15, 'clearing_day', 1.0, 1.0, [960, 540]),
		...(dragBoxes.length ? [] : []),
		shot(t16, 'clearing_day', 2.4, 2.4, [560, 640], [560, 640]),
		...(smellBoxes.length ? [] : []),
		shot(t18, 'clearing_day', 1.0, 1.0, [960, 540]),
		shot(tC, 'creek_day', 1.0, 1.0, [960, 540]),
		fshot(B_creek, t19, 'creek_day', 1.6, [1420, 640]),
		fshot(B_creek, t20, 'creek_day', 1.35, [1380, 620]),
		fshot(B_creek, d01 - 0.2, 'creek_day', 2.1, [1420, 560]),
		fshot(B_creek, t21, 'creek_day', 1.5, [1450, 620]),
		shot(t22, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		shot(t23, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
		shot(tS, 'clearing_day', 1.0, 1.0, [960, 540], [960, 540], {light: 'warm'}),
	];

	const world = (set: string) => {
		if (set === 'city_night') {
			const w = walk(t, t13 + 0.3, t14, 600, 1300, 1.6);
			return <Person is={Marcus} name="marcus" x={w.x} y={1005} s={1.6} frame={f} pose={w.moving ? 'walk' : 'stand'} turn={0.8} phase={w.phase} look={[1, -0.3]} />;
		}
		if (set === 'creek_day') {
			const ripple = (x: number, s: number) => <ellipse key={`r${x}`} cx={x} cy={W + 78} rx={70 * s} ry={10 * s} fill="none" stroke="#d8eef2" strokeWidth={4} opacity={0.7} />;
			return (
				<g>
					<PlateShake plate="creek_day" x0={1280} y0={480} x1={1760} y1={700} k={bushK} frame={f} />
					{t >= t20 ? (
						<g>
							<Person is={CAST.wyatt} name="wyatt" x={wyattX} y={710} s={1.0} frame={f} look={[-1, 0.3]} mouth={t >= t21 && t < t22 ? 'open' : 'flat'} talk={t >= t21 && t < t22 ? Math.max(0, Math.sin(t * 11)) * 0.6 : 0} />
							<Person is={Dawes} name="dawes" x={dawesX} y={712} s={1.06} frame={f} prop="shotgun" arms="holdOne" look={[-1, 0.5]} mouth={dawesT.talk > 0 ? 'open' : 'flat'} talk={dawesT.talk} viseme={dawesT.viseme} brows="flat" />
						</g>
					) : null}
					{inWater.map((n, i) => {
						const s = 1.2;
						const bob = Math.sin(f / 9 + i) * 3;
						const yFeet = W + 220;
						return (
							<g key={n}>
								<defs>
									<clipPath id={`wat_${n}`}>
										<rect x={0} y={0} width={1920} height={W + 76} />
									</clipPath>
								</defs>
								<g clipPath={`url(#wat_${n})`}>
									<Person is={CAST[n]} name={n} x={waterX[i]} y={yFeet + bob} s={s} frame={f} arms={t >= t20 ? 'down' : i % 2 ? 'armsUp' : 'wave'} mouth={t >= t20 ? 'o' : 'laugh'} look={[t >= tMoved ? 1 : 0, 0]} overlapOk />
								</g>
								{ripple(waterX[i], s)}
							</g>
						);
					})}
					<Group people={creekPeople} />
				</g>
			);
		}
		// the clearing
		if (t >= t22) {
			return (
				<g>
					<Campfire x={GEO.clearing.fire[0]} y={GEO.clearing.fire[1]} s={0.9} frame={f} />
					<Group people={eleven} />
					{t >= t22 && t < tS ? <Counts heads={elevenHeads} t0={t22 + 0.3} t={t} step={0.18} /> : null}
				</g>
			);
		}
		const people = TEN.map((n) => arrive(n));
		if (t >= t15) {
			// Dez and Ray drag the city boy toward the trees; he stops at the smell
			const m = people.find((p) => p.name === 'marcus')!;
			Object.assign(m, {x: 560, y: 1045, pose: 'stand', lean: t < t16 ? -8 : 0, look: marcusSniff ? [0.3, -0.8] : [1, 0], mouth: marcusSniff ? 'flat' : 'smile', brows: marcusSniff ? 'worried' : 'none', eyes: t >= t17 && t < t18 ? 'squint' : 'dot', arms: t < t16 ? 'handsForward' : t >= t18 ? 'shrug' : 'down'});
			const dz = people.find((p) => p.name === 'dez')!;
			const ry = people.find((p) => p.name === 'ray')!;
			Object.assign(dz, {x: 720, y: 1045, pose: 'stand', lean: t < t16 ? 8 : 0, arms: t < t16 ? 'grabLeft' : 'down', mouth: t < t16 ? 'laugh' : 'flat', look: t < t16 ? [-1, 0] : [-1, 0.2], edge: false});
			Object.assign(ry, {x: 860, y: 1045, pose: 'stand', lean: t < t16 ? 6 : 0, mouth: t < t16 ? 'grin' : 'flat', look: [-1, 0.2]});
		}
		return (
			<g>
				<Group people={people} />
				<Smell k={smellK} frame={f} x0={200} x1={1500} y0={380} y1={900} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};

