// 3. THE DRIVE - a black car comes for them; the driver never says a word; past the last houses of Sabahiya, into the
// dark; then, out of nowhere, a house blazing with light - one Noura had never seen.
import React from 'react';
import {Band1, Band2, Driver, Drummer, Noura} from '../components/characters/Cast';
import {StickPerson} from '../components/characters/StickPerson';
import {Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, useStick, walk, type Shot} from '../stick/kit';
import {Car, Glow} from '../stick/props';

/** the faces in the car windows: the driver in front, the women behind */
const Inside: React.FC<{f: number; scared?: boolean}> = ({f, scared}) => (
	<g>
		<rect x={-220} y={-240} width={400} height={100} fill="#0b0d14" />
		<StickPerson {...{headOnly: true}} hair="short" headwear="ghutra" seed={69} palette={{skin: '#5a4232', shirt: '#eee', pants: '#eee', hair: '#111', shoes: '#111'}} x={80} y={-40} s={0.55} frame={f} turn={0.6} eyes="none" mouth="flat" />
		{[-30, -110].map((x, i) => (
			<StickPerson key={x} {...{headOnly: true}} female hair="medium" headwear="shayla" headwearColor={i ? '#1f2a33' : '#efe2c4'} seed={63 + i} palette={{skin: '#c99068', shirt: '#a8323c', pants: '#a8323c', hair: '#111', shoes: '#111'}} x={x} y={-40} s={0.55} frame={f} look={[1, 0]} eyes={scared ? 'wide' : 'dot'} />
		))}
	</g>
);

export const Drive: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tCar = at('car');
	const t7 = T('yadda_007_dark');
	const shots: Shot[] = [
		// a black car waits outside; the women come out with their drums
		shot(tCar, 'street_night', 1.0, 1.06, [960, 600], [900, 620], {tag: 'street'}),
		// "The driver never said one word."
		shot(T('yadda_006_car', 0.35), 'street_night', 2.0, 2.15, [1230, 840], [1250, 840], {tag: 'street'}),
		// "They drove past the last houses of Sabahiya, and kept going, into the dark."
		shot(t7, 'desert_road_night', 1.0, 1.0, [960, 560], [960, 560], {tag: 'road'}),
		shot(at('road'), 'desert_road_night', 1.0, 1.06, [960, 600], [980, 600], {tag: 'road'}),
		// "Then, out of nowhere, a house. Huge, and blazing with light."
		shot(T('yadda_008_house'), 'mansion_night', 1.0, 1.12, [960, 540], [900, 520], {tag: 'house'}),
		// "Noura had sung in every big house in Kuwait. She had never seen this one."
		shot(T('yadda_009_never_seen'), 'mansion_night', 1.35, 1.5, [930, 720], [930, 690], {tag: 'look'}),
	];
	const world = (s: Shot) => {
		if (s.tag === 'street') {
			// the band walks from the gate to the car; then the car, the driver staring ahead
			const w = walk(t, tCar - 0.4, tCar + 1.6, 260, 760, 1.6);
			const inCar = t > tCar + 1.6;
			return (
				<g>
					<Glow cx={GEO.street.lamp[0]} cy={GEO.street.lamp[1]} r={420} color="#ffcf7a" k={0.4} />
					<Car x={1200} y={GEO.street.road} s={1.0} frame={f} inside={<Inside f={f} />} id="c1" />
					{!inCar ? (
						<g>
							{[Band1, Noura, Drummer, Band2].map((C, i) => (
								<Person key={i} is={C} name={`b${i}`} x={w.x - i * 95} y={GEO.street.road - 6} s={1.25} frame={f} pose={w.moving ? 'walk' : 'stand'} turn={0.8} phase={w.phase + i} prop={i === 0 ? 'tabl' : 'tar'} arms="hold" overlapOk />
							))}
						</g>
					) : null}
				</g>
			);
		}
		if (s.tag === 'road') {
			// across the empty desert road, headlights on
			const k = ramp(t, t7, at('road') + 2.4);
			const x = lerp(-500, 2300, k);
			return <Car x={x} y={GEO.road.road} s={0.85} frame={f} dist={x} lights inside={<Inside f={f} />} id="c2" />;
		}
		if (s.tag === 'house') {
			const k = ramp(t, T('yadda_008_house'), T('yadda_008_house') + 3.5);
			return (
				<g>
					<Glow cx={880} cy={560} r={700} color="#ffd27a" k={0.45} />
					<Car x={lerp(-500, 420, k)} y={GEO.mansion.ground + 40} s={0.62} frame={f} dist={lerp(-500, 420, k)} lights={k < 1} inside={<Inside f={f} />} id="c3" />
				</g>
			);
		}
		// the women out of the car, looking up at the house
		return (
			<g>
				<Glow cx={880} cy={560} r={700} color="#ffd27a" k={0.45} />
				{[Band1, Noura, Drummer, Band2].map((C, i) => (
					<Person key={i} is={C} name={`b${i}`} x={700 + i * 160} y={1050} s={1.15} frame={f} back arms="down" overlapOk />
				))}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
