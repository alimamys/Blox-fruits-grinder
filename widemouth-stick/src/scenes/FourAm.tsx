// 8. FOUR A.M. - moving day; the missing steak knife; the quiet underneath; Dad carries him to the truck;
// "This is the last move, buddy."; and there he was, in my window.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dad, Eli, Mom, PALETTES} from '../components/characters/Cast';
import {DrivewayWorld, TRUCK, truckWindow, WindowWorld} from '../stick/exteriors';
import {BEDS, GEO, gait, MovingBox, OpenDrawer, ramp, shot, Shots, Tint, useStick, walk} from '../stick/kit';
import {ADULT_S, BedScene, KID_S} from '../stick/rooms';

export const FourAm: React.FC = () => {
	const {f, t, at, end, word, talk, total} = useStick();
	const t66 = at('narrator_066_moving_day');
	const t67 = at('narrator_067_didnt_tell');
	const t68 = at('narrator_068_searched');
	const m02 = at('mom_002_steak_knife');
	const t69 = at('narrator_069_nobody');
	const t70 = at('narrator_070_lay_awake');
	const t71 = at('narrator_071_four_am');
	const d01 = at('dad_001_last_move');
	const t72 = at('narrator_072_backed_out');
	const t73 = at('narrator_073_there_he_was');
	const t74 = at('narrator_074_you_know');
	const t75 = at('narrator_075_little_wave');
	const t76 = at('narrator_076_the_knife');
	const momT = talk('mom');
	const dadT = talk('dad');
	const g = GEO.driveway_night.ground;

	const go = t72 + 0.3;
	const distAt = (tt: number) => (tt > go ? 20 * (tt - go) + 1.2 * (tt - go) ** 2 : 0);
	const dist = distAt(t);
	const truckX = TRUCK.x - dist * TRUCK.s;
	const [wx, wy] = truckWindow(TRUCK.x, g);
	const carry = walk(t, t71 + 0.2, d01 - 0.3, 2050, wx + 60, 1.55);
	const doorX = wx - 250;
	const kd = GEO.kitchen_night;
	const fade = 1 - ramp(t, total - 0.6, total - 0.05);

	const shots = [
		shot(t66, 'bedroom_day', 1.0, 1.06, [960, 560]),
		shot(t67, 'bedroom_day', 1.8, 2.5, [480, 600], [420, 560]),
		shot(t68, 'kitchen_night', 1.0, 1.05, [1100, 560], [1150, 560], {light: 'warm'}),
		shot(m02 - 0.2, 'kitchen_night', 1.7, 1.8, [1380, 520], {light: 'warm'} as never),
		shot(t69, 'kitchen_night', 1.25, 1.3, [700, 600], [680, 600], {light: 'warm'}),
		shot(t70, 'bedroom_night', 1.3, 2.2, [520, 600], [640, 780]),
		shot(t71, 'driveway_night', 1.05, 1.1, [1100, 640], [900, 660]),
		shot(d01 - 0.2, 'driveway_night', 1.9, 2.05, [wx - 120, wy + 40], [wx - 120, wy + 30]),
		shot(t72, 'driveway_night', 2.6, 2.6, [0, 0], [0, 0], {track: (tt) => truckWindow(TRUCK.x - distAt(tt) * TRUCK.s, g)}),
		shot(t73, 'window_out_night', 1.3, 1.45, [963, 700], [963, 690]),
		shot(t74, 'driveway_night', 1.0, 1.08, [900, 600], [1000, 560]),
		shot(t75, 'window_out_night', 1.5, 1.7, [963, 690], [963, 670]),
		shot(t76, 'window_out_night', 2.0, 3.2, [930, 760], [884, 820]),
	];
	shots[3] = shot(m02 - 0.2, 'kitchen_night', 1.7, 1.8, [1380, 520], [1380, 520], {light: 'warm'});

	const world = (set: string) => {
		if (set === 'window_out_night') return <WindowWorld frame={f} still={t < t75} wave={t >= t75} />;
		if (set === 'driveway_night') {
			const inCab = t >= d01 - 0.3;
			const dadOn = t < t72;
			const dad = dadOn
				? inCab
					? {x: doorX, pose: 'stand' as const, look: [1, -0.3] as [number, number], mouth: (dadT.talk > 0 ? 'open' : 'smile') as 'open' | 'smile', talk: dadT.talk, viseme: dadT.viseme, turn: 0.35, tilt: 6}
					: {x: carry.x, ...gait(carry), arms: 'hold' as const, mouth: 'flat' as const}
				: undefined;
			return (
				<g>
					<DrivewayWorld frame={f} truckX={truckX} dist={dist} eliInCab={inCab} eli={{eyes: t >= t72 ? 'wide' : 'squint', look: t >= t72 ? [1, -0.8] : [-0.4, 0.4], brows: t >= t73 ? 'worried' : 'sad', mouth: 'flat'}} still={t < t75} wave={t >= t75} dad={dad} />
					{!inCab && dad ? (
						<Tint light="night">
							<Eli x={carry.x + 18} y={g + 10 - 175} s={1.0} frame={f} pose="sit" eyes="closed" tilt={14} arms="lap" />
						</Tint>
					) : null}
				</g>
			);
		}
		if (set === 'kitchen_night') {
			const open1 = ramp(t, t68 + 0.6, t68 + 1.0);
			const searching = t < m02;
			const momW = walk(t, t68 + 0.2, t68 + 0.6, 1600, 1410, 1);
			return (
				<Tint light="warm">
					<OpenDrawer x0={kd.drawer[0]} y0={kd.drawer[1]} x1={kd.drawer[2]} y1={kd.drawer[3]} open={open1} />
					<Mom x={momW.x} y={kd.ground} s={ADULT_S} frame={f} {...(searching ? {back: true, arms: 'grabLeft' as const} : {arms: 'hipsHands' as const, look: [-1, 0] as [number, number]})} mouth={momT.talk > 0 ? 'open' : 'flat'} talk={momT.talk} viseme={momT.viseme} brows={searching ? 'none' : 'raised'} />
					{t >= t69 ? (
						<>
							<Dad x={420} y={kd.ground} s={ADULT_S} frame={f} arms="shrug" mouth="flat" look={[1, 0]} />
							<Eli x={700} y={kd.ground + 30} s={KID_S} frame={f} palette={PALETTES.eli} pale={0.35} eyes="wide" brows="worried" mouth="flat" look={[0.3, 1]} />
						</>
					) : null}
				</Tint>
			);
		}
		if (set === 'bedroom_night') {
			return <BedScene set="bedroom_night" light="night" frame={f} bed={{mode: 'lie', p: {eyes: 'wide', look: [0.7, 1], brows: 'worried'}}} id="fa" />;
		}
		// bedroom_day: the boxes go out
		const b = BEDS.bedroom_day;
		const dadW = walk(t, t66 + 0.3, t66 + 3.2, 1350, 2150, 1);
		const momW = walk(t, t66 + 1.6, t66 + 4.6, 1250, 2150, 1);
		return (
			<BedScene
				set="bedroom_day"
				light="day"
				frame={f}
				id="fd"
				bed={{mode: 'sit', p: {look: t >= t67 ? [0.8, 1] : [1, 0], mouth: 'flat', brows: t >= t67 ? 'worried' : 'none', palette: PALETTES.eliDay}}}
				front={
					t < t67 ? (
						<>
							<Dad x={dadW.x} y={b.front + 14} s={ADULT_S} frame={f} {...gait(dadW)} arms="hold" />
							<MovingBox x={dadW.x + (dadW.moving ? 10 : 0)} y={b.front + 14 - 236} w={150} h={110} frame={f} seed={4} />
							<Mom x={momW.x} y={b.front + 10} s={ADULT_S} frame={f} {...gait(momW)} arms="hold" />
							<MovingBox x={momW.x + (momW.moving ? 10 : 0)} y={b.front + 10 - 226} w={120} h={90} frame={f} seed={5} />
						</>
					) : null
				}
			/>
		);
	};
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<Shots shots={shots} world={(s) => world(s.set)} />
		</AbsoluteFill>
	);
};
