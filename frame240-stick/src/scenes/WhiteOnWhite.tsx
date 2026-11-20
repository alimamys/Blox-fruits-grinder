// 8. WHITE ON WHITE - the apartment drains into an unfinished drawing; the call; the shadow in the screenshot;
// a faint white outline on her own wall.
import React from 'react';
import {PhoneFrame, ScreenshotView} from '../components/ui/Phone';
import {DrawnLine, Emboss, manOutline, Stain} from '../stick/f240';
import {ramp, shot, Shots, ui, useStick} from '../stick/kit';
import {AtDesk, prog} from './common';
import {RED_A, RED_B} from './Erase';

/** the man's outline on the back wall of her room (feet on the floor, between the sketches and the doorway) */
export const WALL_MAN = {x: 1140, y: 968, s: 1.9};

export const WhiteOnWhite: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t101 = T('narrator_101_changes');
	const t105 = T('narrator_105_unfinished');
	const t106 = T('narrator_106_called_again');
	const t107 = T('narrator_107_turned_wall');
	const t108 = T('narrator_108_faint_outline');
	const tP = at('peel');
	// the wash: 0.35 at the start (where scene 7 left it) -> fully white by "an unfinished drawing"
	const wash = (tt: number) => 0.35 + 0.65 * ramp(tt, t101, end('narrator_105_unfinished'));
	const shots = [
		// "I noticed the changes slowly."
		shot(t101, 'hall_persp_night', 1.0, 1.06, [940, 530], [930, 520], {wash, tag: 'hall'}),
		// "The wallpaper had lost its texture."
		shot(T('narrator_102_wallpaper'), 'hall_side_night', 2.0, 2.1, [880, 450], [900, 450], {wash}),
		// "The shadows around the doorframe had disappeared."
		shot(T('narrator_103_shadows_gone'), 'hall_side_night', 2.3, 2.4, [1420, 520], [1420, 520], {wash}),
		// "Even the stains were gone."
		shot(T('narrator_104_stains_gone'), 'hall_persp_night', 2.4, 2.5, [905, 960], [905, 960], {wash, tag: 'hall'}),
		// "My apartment looked like an unfinished drawing."
		shot(t105, 'room_front_night', 1.0, 1.05, [960, 540], [950, 545], {wash, tag: 'desk'}),
		// "I called Hana again."
		shot(t106, 'room_front_night', 1.55, 1.65, [920, 620], [900, 630], {wash: 1, tag: 'call'}),
		// MARA: "I think I got rid of him."  HANA: "What did you do?"  MARA: "I painted over him. He's gone."
		shot(T('mara_006_got_rid') - 0.3, 'room_front_night', 2.2, 2.3, [880, 650], [880, 650], {wash: 1, tag: 'call'}),
		shot(T('mara_007_painted_over'), 'room_front_night', 1.6, 1.7, [920, 625], [910, 630], {wash: 1, tag: 'call'}),
		// HANA: "Mara, listen to me."  MARA: "What?"  HANA: "I'm looking at the screenshot you sent earlier."
		shot(T('hana_008_listen') - 1.0, 'room_front_night', 2.4, 2.6, [875, 655], [875, 658], {wash: 1, tag: 'call'}),
		ui(T('hana_009_screenshot'), (fl, d) => (
			<PhoneFrame f={fl} d={d} tilt={2}>
				<ScreenshotView picture="canvas_man_1m" />
			</PhoneFrame>
		)),
		// MARA: "Okay?"
		shot(T('mara_009_okay'), 'room_front_night', 2.4, 2.5, [875, 655], [875, 655], {wash: 1, tag: 'call'}),
		// HANA: "I zoomed in on the man." / "The light is casting a shadow behind him."
		ui(T('hana_010_zoomed'), (fl, d) => (
			<PhoneFrame f={fl} d={d} tilt={2}>
				<ScreenshotView picture="canvas_man_1m" z={1 + 1.4 * prog(fl, d, 0.15, 0.85)} cx={0.44} cy={0.42} />
			</PhoneFrame>
		)),
		ui(T('hana_011_shadow'), (fl, d) => (
			<PhoneFrame f={fl} d={d} tilt={2} scale={0.95}>
				<ScreenshotView picture="screenshot_shadow" z={1.25} cx={0.56} cy={0.5} />
			</PhoneFrame>
		)),
		// MARA: "So?"
		shot(T('mara_010_so'), 'room_front_night', 2.6, 2.7, [870, 660], [870, 660], {wash: 1, tag: 'call'}),
		// HANA: "Look at where the shadow ends."
		ui(T('hana_012_shadow_ends'), (fl, d) => (
			<PhoneFrame f={fl} d={d} tilt={2} scale={1.0}>
				<ScreenshotView picture="screenshot_shadow" z={1.25 + 1.2 * prog(fl, d)} cx={0.56 + 0.21 * prog(fl, d)} cy={0.5} />
			</PhoneFrame>
		)),
		// HANA (quietly): "He's standing right against the white wall."
		shot(T('hana_013_against_wall'), 'room_front_night', 2.6, 2.8, [870, 655], [870, 660], {wash: 1, tag: 'call'}),
		// "Mara turned toward her own wall."
		shot(t107, 'room_front_night', 1.3, 1.36, [1040, 580], [1080, 570], {wash: 1, tag: 'turn'}),
		// "For the first time, she noticed a faint outline."
		shot(t108, 'room_front_night', 1.8, 1.9, [1060, 560], [1100, 540], {wash: 1, tag: 'outline'}),
		// "Not black." / "Not gray." / "White."
		shot(T('narrator_109_not_black'), 'room_front_night', 2.6, 2.7, [1140, 375], [1140, 375], {wash: 1, tag: 'outline'}),
		shot(T('narrator_110_not_gray'), 'room_front_night', 3.0, 3.1, [1150, 370], [1150, 370], {wash: 1, tag: 'outline'}),
		shot(T('narrator_111_white'), 'room_front_night', 3.6, 3.8, [1110, 320], [1110, 320], {wash: 1, tag: 'outline'}),
		// "Almost the exact same color as the paint."
		shot(T('narrator_112_same_color'), 'room_front_night', 1.5, 1.6, [1080, 560], [1100, 550], {wash: 1, tag: 'outline'}),
		// MARA (breathless): "Oh God."
		shot(T('mara_011_oh_god'), 'room_front_night', 2.4, 2.55, [890, 650], [890, 652], {wash: 1, tag: 'ohgod'}),
		// a slow, wet peeling: the shoulder lifts away from the wall
		shot(tP, 'room_front_night', 2.6, 2.75, [1130, 370], [1130, 370], {wash: 1, tag: 'peel', shake: 1.5}),
	];
	const outlineK = 0.32 + 0.3 * ramp(t, t108, T('narrator_112_same_color'));
	const peel = ramp(t, tP, end('peel'));
	const W = WALL_MAN;
	const wallMan = (k: number) => (
		<g>
			{manOutline(W.x, W.y, W.s).map((d, i) => (
				<Emboss key={i} d={d} k={k} />
			))}
			{peel > 0 ? (
				<g transform={`translate(${-14 * peel} ${8 * peel})`}>
					{manOutline(W.x, W.y, W.s, 0, ['shoulder']).map((d, i) => (
						<Emboss key={`p${i}`} d={d} k={0.6 + 0.6 * peel} w={8 + 10 * peel} />
					))}
				</g>
			) : null}
		</g>
	);
	const world = (s: (typeof shots)[number]) => {
		const w = typeof s.wash === 'function' ? s.wash(t) : s.wash ?? 0;
		if (s.tag === 'hall')
			return (
				<g opacity={1 - Math.min(1, w)}>
					{[870, 920, 1080, 1170].map((y, i) => (
						<Stain key={y} x={905} y={y} w={[120, 150, 190, 230][i]} frame={f} k={1.3} />
					))}
					<DrawnLine a={RED_A} b={RED_B} k={1} color="#d0141c" w={10} />
				</g>
			);
		if (s.set !== 'room_front_night') return null;
		const m = talk('mara');
		const onPhone = t >= t106 + 0.6 && t < t107;
		const phoneM = onPhone ? {prop: 'phone' as const, arms: {l: [28, -64], r: [70, 139]} as {l: [number, number]; r: [number, number]}} : {};
		switch (s.tag) {
			case 'desk':
				return <AtDesk f={f} wash={w} phone={false} m={{brows: 'worried', look: [0.3, -0.2]}} />;
			case 'call':
				return <AtDesk f={f} wash={1} phone={!onPhone} m={{...phoneM, talk: m.talk, viseme: m.viseme, brows: t > T('hana_008_listen') ? 'worried' : 'flat', eyes: t > T('hana_012_shadow_ends') ? 'wide' : 'dot', mouth: t > T('hana_013_against_wall') ? 'o' : 'flat'}} />;
			case 'turn': {
				const k = (t - t107) / 0.8;
				return (
					<AtDesk f={f} wash={1} phone={false} m={k < 1 ? {turn: 0.7 * Math.max(0, k), look: [1, 0], eyes: 'wide', brows: 'worried'} : {back: true}}>
						{wallMan(0.25)}
					</AtDesk>
				);
			}
			case 'outline':
			case 'peel':
				return (
					<AtDesk f={f} wash={1} phone={false} m={{back: true}}>
						{wallMan(outlineK)}
					</AtDesk>
				);
			case 'ohgod':
				return (
					<AtDesk f={f} wash={1} phone={false} m={{turn: 0.62, look: [1, -0.3], eyes: 'wide', brows: 'raised', mouth: 'o', shiver: 1.2, talk: m.talk, viseme: m.viseme}}>
						{wallMan(outlineK)}
					</AtDesk>
				);
			default:
				return <AtDesk f={f} wash={w} phone={false} />;
		}
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
