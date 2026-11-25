// 8. THE MAJLIS AGAIN - Noura never sang at a wedding again; a newspaper printed it without her name; "Is it
// true, Yadda?" - "Nobody ever proved it happened. And nobody ever proved it didn't." - "...ask whose wedding it is."
// The old phone in the majlis rings. They both look at it.
import React from 'react';
import {GEO, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Dark, Glow, Rings} from '../stick/props';
import {MAJ, MajlisPeople, NewspaperPage} from './common';

export const Ending: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tPhone = at('phone');
	const shots: Shot[] = [
		// "After that night, Noura never sang at a wedding again..." - back in the majlis
		shot(T('yadda_027_never'), 'majlis_night', 1.15, 1.25, [880, 600], [760, 600], {light: 'warm'}),
		// "A newspaper printed the story, without her name..." - the front page of a 1997 Kuwaiti daily
		ui(T('yadda_028_newspaper'), (fl, d) => <NewspaperPage f={fl} d={d} />),
		// GIRL: "Is it true, Yadda?"
		shot(T('girl_003_true'), 'majlis_night', 2.6, 2.7, [740, 560], [740, 560], {light: 'warm'}),
		// "Nobody ever proved it happened. And nobody ever proved it didn't."
		shot(T('yadda_029_nobody'), 'majlis_night', 2.4, 2.6, [480, 540], [470, 540], {light: 'warm'}),
		// "But listen to me, habibti. If a stranger ever calls you..."
		shot(T('yadda_030_listen'), 'majlis_night', 1.5, 1.75, [620, 580], [560, 560], {light: 'warm'}),
		// "...ask whose wedding it is."
		shot(T('yadda_031_whose'), 'majlis_night', 2.6, 3.1, [470, 540], [470, 530], {light: 'warm'}),
		// the old phone rings; they both look at it
		shot(tPhone, 'majlis_night', 1.12, 1.12, [1100, 600], [1100, 600], {light: 'warm', tag: 'phone'}),
	];
	const world = (s: Shot) => {
		const yd = talk('yadda');
		const gd = talk('girl');
		const ringing = t >= tPhone;
		const dim = ramp(t, T('yadda_030_listen'), end('yadda_031_whose'));
		const lookPhone = ramp(t, tPhone + 0.3, tPhone + 0.8);
		return (
			<g>
				<Glow cx={160} cy={240} r={520} color="#ffd59a" k={0.35 * (1 - 0.5 * dim)} />
				<MajlisPeople
					f={f}
					t={t}
					smoke={1 - 0.4 * dim}
					y={{
						talk: yd.talk,
						viseme: yd.viseme,
						mouth: 'flat',
						eyes: ringing ? 'wide' : 'squint',
						brows: ringing ? 'raised' : 'flat',
						look: ringing ? [1, -0.2] : [1, -0.1],
						turn: ringing ? 0.3 * lookPhone : 0,
					}}
					g={{
						talk: gd.talk,
						viseme: gd.viseme,
						eyes: 'wide',
						brows: ringing ? 'raised' : 'worried',
						mouth: ringing ? 'o' : 'flat',
						look: ringing ? [1, -0.3] : [-1, -0.1],
						turn: ringing ? 0.4 * lookPhone : 0,
						arms: ringing ? 'hugKnees' : undefined,
					}}
				/>
				<Dark k={0.35 * dim} />
				{ringing && s.tag === 'phone' ? <Rings x={GEO.majlis.phone[0]} y={GEO.majlis.phone[1]} f={Math.round((t - tPhone) * 24)} s={0.8} /> : null}
			</g>
		);
	};
	void MAJ;
	return <Shots shots={shots} world={(s) => world(s)} />;
};
