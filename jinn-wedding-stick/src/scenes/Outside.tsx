// 7. THE MAN AT DAWN - a man in the sand: "What are you doing here? Nobody lives in this house. It has been empty for
// years." Slowly, Noura turns around: a burned ruin; sand blowing through the doorway; only their footprints - and
// all around them, hundreds of small hoofprints.
import React from 'react';
import {Band1, Band2, Drummer, Noura, OldMan} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {GEO, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Glow, Prints} from '../stick/props';
import {SandClose} from './common';

const BANDX = [560, 680, 800, 920];

export const Outside: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tTurn = T('yadda_024_turned', 0.2);
	const tRuin = at('turn');
	const t26 = T('yadda_026_hoofprints');
	const shots: Shot[] = [
		// grey morning: the band in the sand, the house still behind them; a man on the right
		shot(at('morning'), 'mansion_night', 1.0, 1.05, [960, 560], [980, 580], {light: 'dawn', tag: 'sand'}),
		// "Outside, a man was standing in the sand, staring at them."
		shot(T('yadda_023_man'), 'mansion_night', 1.4, 1.45, [1060, 760], [1080, 760], {light: 'dawn', tag: 'sand'}),
		// MAN: "What are you doing here? Nobody lives in this house..."
		shot(T('man_001_empty'), 'mansion_night', 2.6, 2.75, [1500, 700], [1500, 700], {light: 'dawn', tag: 'sand'}),
		// "Slowly, Noura turned around."
		shot(T('yadda_024_turned'), 'mansion_night', 2.4, 2.5, [650, 720], [650, 720], {light: 'dawn', tag: 'sand'}),
		// the ruin
		shot(tRuin, 'ruin_dawn', 1.15, 1.0, [960, 560], [960, 540], {tag: 'ruin', shake: 0.6}),
		// "The house was a ruin. Broken windows. Sand blowing through the doorway. The walls black from an old fire."
		shot(T('yadda_025_ruin', 0.2), 'ruin_dawn', 1.6, 1.7, [560, 520], [1360, 520], {tag: 'ruin'}),
		shot(T('yadda_025_ruin', 0.7), 'ruin_dawn', 1.8, 2.0, [880, 820], [880, 840], {tag: 'door'}),
		// "Only their footprints in the sand. And all around them, hundreds of small hoofprints."
		ui(t26, (fl, d) => <SandClose f={fl} d={d} k={ramp(fl / 24, 0.4, Math.max(1, d / 24 - 0.6))} />),
	];
	const world = (s: Shot) => {
		const md = talk('man');
		if (s.tag === 'sand') {
			const turned = ramp(t, tTurn, tTurn + 1.2);
			return (
				<g>
					<Glow cx={1750} cy={760} r={1100} color="#f3c49a" k={0.9} />
					<Glow cx={1500} cy={300} r={900} color="#c9cbd6" k={0.6} />
					{[Noura, Band1, Drummer, Band2].map((C, i) => (
						<Person
							key={i}
							is={C}
							name={`b${i}`}
							x={BANDX[i]}
							y={GEO.mansion.ground + 40}
							s={1.35}
							frame={f}
							turn={0.6}
							back={i === 0 && turned > 0.5}
							look={[1, 0]}
							prop={i === 1 ? 'tabl' : 'tar'}
							arms="hold"
							eyes="squint"
							brows="sad"
							mouth="flat"
							overlapOk
						/>
					))}
					<Person is={OldMan} name="man" x={1500} y={GEO.mansion.ground + 50} s={1.5} frame={f} turn={-0.4} look={[-1, 0]} talk={md.talk} viseme={md.viseme} brows="worried" mouth="frown" arms="down" />
				</g>
			);
		}
		if (s.tag === 'door') {
			// sand blowing through the doorway
			const [x0, y0, x1, y1] = GEO.ruin.door;
			return (
				<g opacity={0.6}>
					{Array.from({length: 30}, (_, i) => {
						const r = (j: number) => {
							const v = Math.sin(i * 91.7 + j * 47.3) * 43758.5453;
							return v - Math.floor(v);
						};
						const u = (t * (0.35 + 0.3 * r(1)) + r(2)) % 1;
						const x = x0 - 120 + u * (x1 - x0 + 420);
						const y = y1 - 20 - r(3) * (y1 - y0 - 40) * 0.8 + Math.sin(t * 2.5 + i) * 14;
						const len = 24 + 40 * r(4);
						return <path key={i} d={`M${x},${y} q${len / 2},${-4 - 6 * r(5)} ${len},${2}`} stroke="#e8d6b0" strokeWidth={2 + 3 * r(6)} fill="none" strokeLinecap="round" opacity={Math.sin(u * Math.PI)} />;
					})}
				</g>
			);
		}
		// the ruin: their footprints, and the hoofprints all around
		return (
			<g>
				<Prints x0={300} x1={1600} y0={GEO.ruin.ground - 20} y1={GEO.ruin.ground + 30} feet={10} hooves={70} seed={5} k={ramp(t, tRuin, tRuin + 1.5)} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
