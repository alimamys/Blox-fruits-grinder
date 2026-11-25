// 2. THE CALL - Noura, the most famous taqaqa in Kuwait, at a happy wedding; then at home the phone rings: the mother
// of the bride; "We're fully booked." / "Five hundred dinars." - so Noura said yes.
import React from 'react';
import {Guest, Noura} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {GEO, shot, Shots, useStick, type Shot} from '../stick/kit';
import {Glow, Rings} from '../stick/props';
import {Band} from './common';

export const Call: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tRing = at('ring');
	const tPick = tRing + 1.25;
	const shots: Shot[] = [
		// "In those days, Noura was the most famous taqaqa in Kuwait..." - a happy wedding, the band playing
		shot(T('yadda_003_famous'), 'wedding_happy', 1.05, 1.25, [960, 560], [760, 720], {tag: 'happy'}),
		shot(T('yadda_003_famous', 0.55), 'wedding_happy', 2.0, 2.1, [700, 820], [760, 820], {tag: 'happy'}),
		// "One quiet evening, the phone rang."
		shot(T('yadda_004_phone'), 'noura_house', 1.0, 1.1, [960, 560], [1100, 600], {tag: 'home', light: 'warm'}),
		shot(tRing, 'noura_house', 1.9, 2.0, [1420, 700], [1440, 700], {tag: 'home', light: 'warm'}),
		// MOTHER (on the phone): "We are having a wedding tomorrow night..."
		shot(T('mother_001_tomorrow'), 'noura_house', 2.4, 2.5, [1570, 600], [1570, 600], {tag: 'home', light: 'warm'}),
		// NOURA: "I'm sorry. We're fully booked."
		shot(T('noura_001_booked'), 'noura_house', 2.6, 2.6, [1570, 590], [1570, 590], {tag: 'home', light: 'warm'}),
		// "Five hundred dinars." - her face
		shot(T('mother_002_dinars'), 'noura_house', 2.8, 3.4, [1570, 580], [1570, 570], {tag: 'home', light: 'warm'}),
		// "So Noura said yes."
		shot(T('yadda_005_fortune'), 'noura_house', 1.6, 1.7, [1480, 640], [1480, 640], {tag: 'home', light: 'warm'}),
	];
	const world = (s: Shot) => {
		if (s.tag === 'happy') {
			// an ordinary happy wedding: guests dancing on either side, the band on the floor in front of the stage
			const g = (n: number, x: number, y: number, sc: number) => {
				const sw = Math.sin(t * 2.6 + n);
				return <Person key={n} is={Guest} n={n + 3} name={`g${n}`} x={x + sw * 8} y={y} s={sc} frame={f} lean={sw * 6} tilt={sw * 6} arms={{l: [120 + 30 * sw, 10], r: [120 - 30 * sw, 10]}} mouth="grin" overlapOk edge />;
			};
			return (
				<g>
					{g(0, 330, 960, 1.2)}
					{g(1, 1600, 960, 1.2)}
					{g(2, 470, 1000, 1.3)}
					<Band f={f} t={t} x0={560} y={1050} s={1.45} nouraP={{mouth: 'open', talk: 0.5 + 0.4 * Math.sin(t * 7), eyes: 'closed'}} />
				</g>
			);
		}
		// at home: Noura by the phone
		const nd = talk('noura');
		const ringing = t >= tRing && t < tPick;
		const onPhone = t >= tPick;
		const shocked = t > T('mother_002_dinars');
		return (
			<g>
				<Glow cx={1130} cy={340} r={500} color="#ffd59a" k={0.35} />
				{ringing ? <Rings x={GEO.house.phone[0]} y={GEO.house.phone[1] - 20} f={Math.round((t - tRing) * 24)} s={0.6} /> : null}
				<Person
					is={Noura}
					name="noura"
					x={1580}
					y={GEO.house.floor}
					s={1.9}
					frame={f}
					turn={onPhone ? -0.2 : 0.5}
					look={onPhone ? [-0.4, 0] : [1, 0.2]}
					prop={onPhone ? 'receiver' : 'none'}
					arms={onPhone ? 'phoneEar' : 'down'}
					talk={nd.talk}
					viseme={nd.viseme}
					eyes={shocked ? 'wide' : 'dot'}
					brows={shocked ? 'raised' : 'flat'}
					mouth={shocked ? 'o' : 'flat'}
				/>
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
