// 6. UNTIL DAWN - they play all night; hands cracked and bleeding on the drums; the bride never lifts her veil; the
// mother of the bride raises her hand - silence - "Enough. Thank you, Noura. You were everything they said."; paid.
import React from 'react';
import {Band1, Band2, Drummer, Mother, Noura} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {lerp, ramp, shot, Shots, useStick, walk, type Shot} from '../stick/kit';
import {BloodDots, Glow, Haze} from '../stick/props';
import {Band, Guests} from './common';
import {BAND, BRIDE, TheBride} from './Hall';

const NX = BAND.x0 + 150 * BAND.s * 0.66;

export const Dawn: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tHand = T('yadda_021_silent', 0.35);
	const tPaid = T('yadda_022_paid');
	const shots: Shot[] = [
		// "They played all night. Their hands cracked and bled on the drums..."
		shot(T('yadda_019_all_night'), 'hall_gold', 1.3, 1.4, [560, 820], [520, 840], {light: 'dim', tag: 'band'}),
		shot(T('yadda_019_all_night', 0.5), 'hall_gold', 2.7, 2.8, [NX + 60, 890], [NX + 60, 895], {light: 'dim', tag: 'band'}),
		// "The bride never lifted her veil."
		shot(T('yadda_020_veil'), 'hall_gold', 2.9, 3.1, [BRIDE.x, 560], [BRIDE.x, 560], {light: 'dim', tag: 'band'}),
		// "Just before dawn, the mother of the bride raised her hand, and the hall went silent."
		shot(T('yadda_021_silent'), 'hall_gold', 1.05, 1.1, [960, 580], [960, 580], {light: 'dim', tag: 'band'}),
		shot(at('silence'), 'hall_gold', 1.05, 1.05, [960, 580], [960, 580], {light: 'dim', tag: 'band'}),
		// MOTHER: "Enough. Thank you, Noura. You were everything they said."
		shot(T('mother_004_enough'), 'hall_gold', 2.2, 2.3, [470, 760], [480, 760], {light: 'dim', tag: 'band'}),
		// "They were paid, exactly as promised. And they walked out into the grey morning..."
		shot(tPaid, 'hall_gold', 1.8, 1.9, [520, 760], [520, 760], {light: 'dim', tag: 'paid'}),
		shot(T('yadda_022_paid', 0.55), 'hall_gold', 1.05, 1.0, [960, 560], [960, 560], {light: 'dim', tag: 'out'}),
	];
	const world = (s: Shot) => {
		const md = talk('mother');
		const stopped = t > tHand + 0.2;
		const hand = ramp(t, tHand, tHand + 0.5);
		// the mother of the bride steps down beside the band and raises her hand
		const mx = 640;
		if (s.tag === 'paid' || s.tag === 'out') {
			const w = walk(t, T('yadda_022_paid', 0.55), end('yadda_022_paid') + 1.0, 400, -300, 1.4);
			const out = s.tag === 'out';
			return (
				<g>
					<Haze t={t} k={0.6} />
					<TheBride f={f} />
					<Guests f={f} t={t} mode="freeze" look={[-0.6, 0]} />
					<Person is={Mother} name="mother" x={out ? 760 : mx} y={1060} s={1.6} frame={f} turn={-0.5} look={[-1, 0]} mouth="smile" arms={out ? 'down' : {l: [10, 0], r: [60, -40]}} prop={out ? 'none' : 'card'} />
					{!out ? (
						<Person is={Noura} name="noura" x={410} y={1060} s={1.55} frame={f} turn={0.5} look={[1, 0]} eyes="wide" brows="worried" mouth="flat" prop="tar" arms={{l: [22, -105], r: [60, -40]}} />
					) : (
						<g>
							{[Noura, Band1, Drummer, Band2].map((C, i) => (
								<Person key={i} is={C} name={`walker${i}`} x={w.x - i * 90} y={1066} s={1.3} frame={f} pose={w.moving ? 'walk' : 'stand'} turn={-0.8} phase={w.phase + i} prop={i === 1 ? 'tabl' : 'tar'} arms="hold" eyes="squint" brows="sad" overlapOk edge />
							))}
						</g>
					)}
				</g>
			);
		}
		const bleed = ramp(t, T('yadda_019_all_night', 0.4), T('yadda_019_all_night', 0.8));
		const S = BAND.s;
		const hands = (x: number): Array<[number, number]> => [[x + 4 * S, BAND.y - 50 * S], [x - 3 * S, BAND.y - 46 * S], [x + 27 * S, BAND.y - 22 * S], [x + 22 * S, BAND.y - 27 * S]];
		const blood: Array<[number, number]> = bleed > 0 ? [...hands(NX), ...hands(BAND.x0 + 2 * 150 * S * 0.66)] : [];
		const tired = {eyes: 'squint' as const, brows: 'sad' as const, mouth: 'smile' as const, tilt: 6};
		return (
			<g>
				<Haze t={t} k={0.7} />
				<Glow cx={960} cy={140} r={600} color="#c9d4ff" k={0.25 * ramp(t, T('yadda_021_silent'), T('yadda_021_silent') + 3)} />
				<TheBride f={f} />
				<Guests f={f} t={t} mode={stopped ? 'freeze' : 'dance'} look={stopped ? [-0.6, 0] : undefined} bg={s.z0 >= 1.6} />
				<Band
					f={f}
					t={t}
					x0={BAND.x0}
					y={BAND.y}
					s={BAND.s}
					play={stopped ? 0 : 1}
					nouraP={{...tired, eyes: stopped ? 'wide' : 'squint', look: stopped ? [1, -0.2] : [0.3, 0]}}
					drummerP={{...tired, eyes: stopped ? 'wide' : 'squint'}}
					othersP={tired}
				/>
				{blood.length ? <g opacity={bleed}><BloodDots pts={blood} /></g> : null}
				{t > tHand - 0.6 ? (
					<Person
						is={Mother}
						name="mother"
						x={lerp(780, mx, ramp(t, tHand - 0.6, tHand))}
						y={1060}
						s={1.6}
						frame={f}
						turn={-0.4}
						look={[-1, 0]}
						talk={md.talk}
						viseme={md.viseme}
						mouth="smile"
						arms={{l: [10, 0], r: [150 * hand + 20 * (1 - hand), 10 * hand]}}
						idle={false}
					/>
				) : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
