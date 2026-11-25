// 1. THE MAJLIS - "Once, a long time ago, my grandmother told me a story." Yadda pours coffee; the girl asks for a
// scary one, a true one; "It happened in Sabahiya, in 1997. To a singer called Noura." - into the incense smoke.
import React from 'react';
import {GEO, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Dark, Glow} from '../stick/props';
import {MAJ, MajlisPeople, TitleCard} from './common';

export const Majlis: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots: Shot[] = [
		// out of the dark: the incense smoke
		shot(0, 'majlis_night', 3.0, 2.85, [180, 520], [220, 560], {light: 'warm'}),
		// "Once, a long time ago, when I was a little girl..." - the majlis
		shot(T('narrator_001_once', 0.3), 'majlis_night', 1.6, 1.08, [500, 620], [880, 560], {light: 'warm'}),
		// Yadda pours the coffee
		shot(at('pour'), 'majlis_night', 1.7, 1.75, [640, 640], [660, 640], {light: 'warm', tag: 'pour'}),
		// GIRL: "Yadda, tell me a scary one. A true one."
		shot(T('girl_001_scary'), 'majlis_night', 2.6, 2.7, [740, 560], [740, 560], {light: 'warm'}),
		// YADDA: "A true one?..."
		shot(T('yadda_001_true'), 'majlis_night', 2.5, 2.6, [470, 540], [470, 540], {light: 'warm'}),
		// "It happened in Sabahiya, in 1997. To a singer called Noura." - slow push in, into the smoke
		shot(T('yadda_002_sabahiya'), 'majlis_night', 2.9, 3.4, [400, 560], [150, 480], {light: 'warm'}),
		ui(at('title'), (fl, d) => <TitleCard f={fl} d={d} />),
	];
	const world = (s: Shot) => {
		const yd = talk('yadda');
		const gd = talk('girl');
		const pouring = s.tag === 'pour';
		return (
			<g>
				<Glow cx={160} cy={240} r={520} color="#ffd59a" k={0.35} />
				<MajlisPeople
					f={f}
					t={t}
					y={{
						talk: yd.talk,
						viseme: yd.viseme,
						prop: pouring ? 'dallah' : 'none',
						arms: pouring ? {l: [28, -64], r: [64, -50]} : undefined,
						mouth: t > T('yadda_002_sabahiya') ? 'flat' : 'smile',
						eyes: t > T('yadda_002_sabahiya', 0.4) ? 'squint' : 'dot',
						look: [1, -0.1],
					}}
					g={{talk: gd.talk, viseme: gd.viseme, prop: pouring ? 'finjan' : 'none', arms: pouring ? {l: [10, 0], r: [40, -80]} : undefined, eyes: t > T('yadda_001_true') ? 'wide' : 'dot', mouth: t > T('yadda_001_true') ? 'o' : 'smile', look: [-1, -0.1]}}
				/>
				<Dark k={1 - ramp(t, 0.6, 2.6)} />
			</g>
		);
	};
	void MAJ;
	return <Shots shots={shots} world={(s) => world(s)} />;
};
