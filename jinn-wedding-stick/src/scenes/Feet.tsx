// 5. THE FEET - the youngest drummer whispers "Look at their feet"; under the long dresses, hooves, clicking on the
// marble in time with the drums. Back in the majlis the girl hides her face: "Did they run away?" - "Run? Where to?"
// "We have to go." - "Keep playing. Whatever you see, do not stop." - sounds behind the walls; horned shadows.
import React from 'react';
import {GEO, ramp, shot, Shots, useStick, type Shot} from '../stick/kit';
import {Dark, Glow, Haze, HornShadow} from '../stick/props';
import {Band, Guests, MajlisPeople, tarArms} from './common';
import {BAND, TheBride} from './Hall';

const NX = BAND.x0 + 150 * BAND.s * 0.66; // Noura
const DX = BAND.x0 + 2 * 150 * BAND.s * 0.66; // the drummer

export const Feet: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots: Shot[] = [
		// "The youngest girl in the band leaned close to Noura, still drumming."
		shot(T('yadda_015_youngest'), 'hall_gold', 1.6, 1.75, [520, 860], [460, 900], {light: 'warm', tag: 'band'}),
		// DRUMMER (whispering): "Noura. Look at their feet."
		shot(T('drummer_001_feet'), 'hall_gold', 2.7, 2.9, [(NX + DX) / 2, 860], [(NX + DX) / 2, 860], {light: 'warm', tag: 'band'}),
		// Noura looks down
		shot(at('look'), 'hall_gold', 2.8, 2.85, [NX, 850], [NX, 860], {light: 'warm', tag: 'band'}),
		// "Under the long dresses, where their feet should be, there were hooves..." - down at the marble
		shot(T('yadda_016_hooves'), 'hall_gold', 2.0, 2.3, [1200, 900], [1240, 960], {light: 'warm', tag: 'feet'}),
		shot(at('hooves'), 'hall_gold', 3.0, 3.3, [1200, 1000], [1240, 1010], {light: 'warm', tag: 'feet'}),
		// the majlis: the girl hides her face - "Yadda! Did they run away?"
		shot(T('girl_002_run'), 'majlis_night', 2.4, 2.6, [780, 560], [790, 560], {light: 'warm', tag: 'majlis'}),
		// "Run? Where to? Nobody knew where that house was."
		shot(T('yadda_017_where'), 'majlis_night', 2.4, 2.7, [480, 540], [470, 540], {light: 'warm', tag: 'majlis'}),
		// DRUMMER: "We have to go."
		shot(T('drummer_002_go'), 'hall_gold', 2.9, 2.95, [DX + 120, 850], [DX + 120, 850], {light: 'warm', tag: 'band'}),
		// NOURA (smiling, through her teeth): "Keep playing. Whatever you see, do not stop."
		shot(T('noura_002_keep'), 'hall_gold', 2.75, 2.85, [NX, 840], [NX, 840], {light: 'warm', tag: 'band'}),
		// "...other sounds. Something braying behind the walls..." - horned shadows on the walls
		shot(T('yadda_018_sounds'), 'hall_gold', 1.0, 1.06, [960, 560], [920, 590], {light: 'warm', tag: 'walls'}),
	];
	const world = (s: Shot) => {
		const dd = talk('drummer');
		const nd = talk('noura');
		const gd = talk('girl');
		const yd = talk('yadda');
		if (s.tag === 'majlis')
			return (
				<g>
					<Glow cx={160} cy={240} r={520} color="#ffd59a" k={0.3} />
					<MajlisPeople
						f={f}
						t={t}
						smoke={0.7}
						y={{talk: yd.talk, viseme: yd.viseme, mouth: 'flat', eyes: 'squint', brows: 'flat', look: [1, -0.1]}}
						g={{talk: gd.talk, viseme: gd.viseme, arms: t < end('girl_002_run') - 0.2 ? {l: [40, -118], r: [40, -118]} : 'hugKnees', eyes: 'wide', brows: 'worried', mouth: 'o', look: [-1, 0], lean: -6}}
					/>
				</g>
			);
		const leaning = ramp(t, T('yadda_015_youngest', 0.3), T('yadda_015_youngest', 0.8));
		const looked = t > at('look') + 0.3;
		const afterKeep = t > T('noura_002_keep');
		const knowing = t > at('look') + 0.6;
		const sounds = s.tag === 'walls';
		const guests = (
			<Guests
				f={f}
				t={t}
				mode="dance"
				bg={s.tag !== 'walls'}
				hooves={knowing || s.tag === 'feet'}
				hemLift={s.tag === 'feet' ? 1 : knowing ? 0.5 : 0}
				look={knowing ? [-0.5, 0.1] : undefined}
			/>
		);
		return (
			<g>
				<Haze t={t} />
				{sounds
					? [180, 470, 1500, 1760].map((x, i) => <HornShadow key={x} x={x} y={GEO.hall.wallY + 120} s={1.3 + (i % 2) * 0.25} t={t + i} k={ramp(t, T('yadda_018_sounds', 0.2 + i * 0.12), T('yadda_018_sounds', 0.35 + i * 0.12))} />)
					: null}
				<TheBride f={f} />
				{guests}
				<Band
					f={f}
					t={t}
					x0={BAND.x0}
					y={BAND.y}
					s={BAND.s}
					play={1}
					drummerP={{
						lean: -16 * leaning,
						tilt: -10 * leaning,
						talk: dd.talk,
						viseme: dd.viseme,
						eyes: 'wide',
						brows: 'worried',
						mouth: dd.talk > 0.05 ? 'flat' : 'wobbly',
						look: [-1, 0.1],
						arms: tarArms(t, 0.12, 0.5),
					}}
					nouraP={{
						talk: nd.talk,
						viseme: nd.viseme,
						look: looked && !afterKeep ? [0.5, 1] : [0.3, 0],
						eyes: looked ? 'wide' : 'dot',
						brows: looked ? 'worried' : 'flat',
						mouth: afterKeep || t > T('drummer_002_go') ? 'grin' : looked ? 'o' : 'smile',
						tilt: looked && !afterKeep ? 8 : 0,
					}}
				/>
				{sounds ? <Dark k={0.25} /> : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
