// 5. THE WARNING - the call to Hana (voice only, on the phone), the screenshot, "get out".
import React from 'react';
import {CallScreen, PhoneFrame, ThreadScreen} from '../components/ui/Phone';
import {Flicker} from '../stick/f240';
import {shot, Shots, ui, useStick} from '../stick/kit';
import {AtDesk, ed} from './common';

export const Warning: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tS = at('scratch_2');
	const shots = [
		// "I called Hana."
		ui(T('narrator_056_called_hana'), (fl, d) => (
			<PhoneFrame f={fl} d={d}>
				<CallScreen f={fl} time="2:47" />
			</PhoneFrame>
		)),
		// "She'd worked with me on animation projects before..."
		shot(T('narrator_057_hana_worked'), 'room_front_night', 1.55, 1.65, [920, 620], [900, 630], {tag: 'call'}),
		// HANA: "Mara? It's almost three in the morning."
		shot(T('hana_001_three_am') - 0.2, 'room_front_night', 2.1, 2.2, [880, 645], [880, 650], {tag: 'call'}),
		// MARA: "I need you to look at something. I'm sending you a screenshot."
		shot(T('mara_001_look_at_something'), 'room_front_night', 2.2, 2.3, [880, 650], [880, 650], {tag: 'call'}),
		// the screenshot goes
		ui(at('notification'), (fl, d) => (
			<PhoneFrame f={fl} d={d}>
				<ThreadScreen f={fl} picture="canvas_man_1m" sent={Math.min(1, fl / 8)} delivered={fl > 14} />
			</PhoneFrame>
		)),
		// HANA: "What's this?"
		ui(T('hana_002_whats_this') - 0.2, (fl, d) => (
			<PhoneFrame f={fl} d={d}>
				<ThreadScreen f={fl} picture="canvas_man_1m" typing />
			</PhoneFrame>
		)),
		// MARA: "Tell me if you can see the man in the hallway." - the dark doorway behind her
		shot(T('mara_002_see_the_man'), 'room_front_night', 1.35, 1.42, [1060, 590], [1080, 585], {tag: 'call'}),
		// HANA: "Yeah. He's creepy. Did you draw him?"
		shot(T('hana_003_creepy'), 'room_front_night', 2.2, 2.3, [880, 650], [880, 652], {tag: 'call'}),
		// MARA: "No."
		shot(T('mara_003_no') - 0.1, 'room_front_night', 2.8, 2.9, [868, 660], [868, 662], {tag: 'call'}),
		// HANA: "What do you mean, no?"
		shot(T('hana_004_what_do_you_mean'), 'room_front_night', 1.7, 1.75, [940, 620], [940, 620], {tag: 'call'}),
		// MARA: "He wasn't there before. And every time I play the animation, he gets closer."
		shot(T('mara_004_gets_closer'), 'room_front_night', 1.25, 1.35, [1040, 580], [1060, 580], {tag: 'call'}),
		// silence on the line - the doorway
		shot(at('silence_call'), 'room_front_night', 2.6, 2.75, [1430, 560], [1430, 560], {tag: 'call'}),
		// HANA (serious): "Okay. Stop playing it. Close the program."
		shot(T('hana_005_stop_playing'), 'room_front_night', 2.2, 2.3, [880, 648], [880, 650], {tag: 'call'}),
		// MARA: "I already tried. It keeps reopening the same frame." - the window closes and comes back
		ui(T('mara_005_reopening'), (fl, d) => ed('canvas_man_close', 240, {reopen: Math.min(2, (fl / Math.max(1, d - 1)) * 2.4), push: [1.0, 1.04]})(fl, d)),
		// HANA: "Then turn the computer off. And get out of that apartment."
		shot(T('hana_006_get_out'), 'room_front_night', 2.5, 2.65, [870, 655], [870, 660], {tag: 'call'}),
		// the scratching again, louder - she turns toward the doorway
		shot(tS, 'room_front_night', 1.35, 1.45, [1080, 590], [1120, 580], {tag: 'scratch', shake: 2}),
	];
	const world = (s: (typeof shots)[number]) => {
		const m = talk('mara');
		const scared = t > T('mara_004_gets_closer');
		const look: [number, number] = s.tag === 'scratch' ? [1, 0] : [0, 0.1];
		return (
			<g>
				<AtDesk
					f={f}
					phone={false}
					m={{
						prop: 'phone',
						arms: {l: [28, -64], r: [70, 139]},
						talk: m.talk,
						viseme: m.viseme,
						brows: 'worried',
						eyes: s.tag === 'scratch' || t > T('hana_006_get_out') ? 'wide' : 'dot',
						mouth: scared ? 'frown' : 'flat',
						look,
						turn: s.tag === 'scratch' ? Math.min(0.6, (t - tS) * 1.5) : 0,
						shiver: t > T('hana_006_get_out') ? 0.7 : 0,
					}}
				/>
				<Flicker f={f} k={0} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
