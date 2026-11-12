// 4. TRAMPOLINE - down the hall to the empty room; he pushes the window open; the long way down;
// the game; "Maybe another time."; the snarl; disappointment.
import React from 'react';
import {Eli} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {BEDS, GEO, gait, hallScale, lerp, ramp, Sash, shot, Shots, Trampoline as Tramp, useStick, walk} from '../stick/kit';
import {BedScene, KID_S, WM_S} from '../stick/rooms';

export const Trampoline: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t32 = at('narrator_032_hall');
	const t33 = at('narrator_033_not_allowed');
	const t34 = at('narrator_034_room_empty');
	const tWin = word('narrator_034_room_empty', 'window', 0.85);
	const t35 = at('narrator_035_pushed_open');
	const tPush = word('narrator_035_pushed_open', 'pushed', 0.55);
	const t36 = at('narrator_036_long_way');
	const w07 = at('widemouth_007_how_to_play');
	const wTramp = word('widemouth_007_how_to_play', 'trampoline', 0.25);
	const wJump = word('widemouth_007_how_to_play', 'jump', 0.45);
	const wBounce = word('widemouth_007_how_to_play', 'bounce', 0.75);
	const t37 = at('narrator_037_almost_see');
	const e04 = at('eli_004_far_down');
	const t38 = at('narrator_038_face_changed');
	const t39 = at('narrator_039_snarled');
	const t40 = at('narrator_040_disappointed');
	const t41 = at('narrator_041_rest_of_day');
	const wmT = talk('widemouth');
	const eliT = talk('eli');

	const er = GEO.emptyroom;
	const sillX = (er.opening[0] + er.opening[2]) / 2;
	// empty room: they come in from the left; he runs to the window and climbs onto the sill
	const eliW = walk(t, tWin - 0.2, t35 + 0.6, -160, 560, KID_S);
	const wmIn = walk(t, tWin - 0.5, t35 - 0.1, -80, 700, WM_S);
	const wmRun = walk(t, t35 + 0.1, t35 + 1.0, 700, sillX - 60, WM_S);
	const climb = ramp(t, t35 + 1.0, t35 + 1.4);
	const onSill = t > t35 + 1.0;
	const wmX = t < t35 + 0.1 ? wmIn.x : onSill ? lerp(sillX - 60, sillX, climb) : wmRun.x;
	const wmY = onSill ? lerp(er.ground, er.sill, climb) - Math.sin(climb * Math.PI) * 60 : er.ground;
	const up = ramp(t, tPush, tPush + 0.8);
	const bounce = t > wBounce && t < end('widemouth_007_how_to_play') ? Math.abs(Math.sin((t - wBounce) * 6)) * 34 : 0;
	const back = t > e04 ? ramp(t, e04, e04 + 1.2) : 0;
	const eliX = t < t36 ? eliW.x : lerp(560, 470, back);
	const snarl = t >= t39 && t < t40;
	const wmMouth = t >= t38 && t < t39 ? 'flat' : snarl ? 'snarl' : t >= t40 ? 'sad' : 'smile';

	const hallK = (t - t32) / (t33 - t32);
	const hallY = lerp(1060, 870, Math.min(1, hallK));
	const tug = Math.max(0, Math.sin((t - t33) * 5));

	const shots = [
		shot(t32, 'hallway', 1.0, 1.1, [960, 560], [960, 600]),
		shot(t33, 'hallway', 1.9, 2.0, [960, 720], [960, 730]),
		shot(t34, 'emptyroom', 1.0, 1.04, [960, 540]),
		shot(t35, 'emptyroom', 1.05, 1.25, [900, 560], [960, 520]),
		shot(t36, 'window_down', 1.0, 1.18, [960, 540], [1040, 560]),
		shot(w07, 'emptyroom', 1.7, 1.85, [sillX - 60, 560], [sillX - 60, 560]),
		shot(wTramp - 0.2, 'window_down', 1.15, 1.25, [1040, 560]),
		shot(wJump - 0.15, 'emptyroom', 1.9, 2.1, [sillX, 560], [sillX, 540]),
		shot(t37, 'window_down', 1.1, 1.45, [1060, 560], GEO.window_down.target as unknown as [number, number]),
		shot(e04 - 0.2, 'emptyroom', 1.6, 1.7, [620, 600], [600, 600]),
		shot(t38, 'emptyroom', 3.0, 3.3, [sillX, er.sill - 128 * WM_S], [sillX, er.sill - 128 * WM_S]),
		shot(t39, 'emptyroom', 3.4, 3.9, [sillX, er.sill - 128 * WM_S], [sillX, er.sill - 128 * WM_S], {shake: 7}),
		shot(t40, 'emptyroom', 2.4, 2.6, [sillX, er.sill - 110 * WM_S]),
		shot(t41, 'bedroom_day', 1.0, 1.08, [800, 580], [700, 640]),
	];

	const world = (set: string) => {
		if (set === 'hallway') {
			if (t < t33) {
				const s = hallScale(hallY);
				const wY = hallY - 60;
				const ws = hallScale(wY);
				const ph = (hallK * 260) / 30;
				return (
					<g>
						<Widemouth x={900} y={wY} s={WM_S * 1.25 * ws * 1.9} frame={f} walking phase={ph * 1.6} arms="reach" flip look={[0, 0]} />
						<Eli x={990} y={hallY} s={KID_S * 1.25 * s} frame={f} back pose="walk" phase={ph} />
					</g>
				);
			}
			const y = 900;
			const s = hallScale(y);
			return (
				<g>
					<Eli x={1010} y={y} s={KID_S * 1.25 * s} frame={f} lean={-6 + tug * 5} brows="worried" mouth="frown" look={[-0.8, 0.5]} arms={{l: [60 + tug * 10, -10], r: [10, 0]}} />
					<Widemouth x={870 - tug * 6} y={y - 6} s={WM_S * 1.25 * s * 1.6} frame={f} arms="reach" mouth="smile" look={[1, -0.6]} />
				</g>
			);
		}
		if (set === 'window_down') {
			const imagined = t >= wTramp - 0.2 && t < t37 ? 0.45 : t >= t37 ? ramp(t, t37 + 0.5, t37 + 2.5) : 0;
			const [x, y] = GEO.window_down.target;
			return (
				<g>
					{imagined > 0 ? (
						<g style={{filter: t >= t37 ? `blur(${(1 - imagined) * 4}px)` : undefined}}>
							<Tramp x={x} y={y + Math.sin(t * 2) * 4} s={0.9} opacity={imagined} frame={f} />
						</g>
					) : null}
				</g>
			);
		}
		if (set === 'emptyroom') {
			const showEli = t >= tWin - 0.2;
			return (
				<g>
					<Sash up={up} />
					{t >= tWin - 0.5 ? (
						<Widemouth
							x={wmX}
							y={wmY - bounce}
							s={WM_S}
							frame={f}
							walking={(wmIn.moving && t < t35) || wmRun.moving}
							phase={wmX / (14 * WM_S)}
							mouth={wmMouth as 'flat' | 'snarl' | 'sad' | 'smile'}
							talk={wmT.talk}
							earsBack={snarl}
							arms={t >= w07 && t < end('widemouth_007_how_to_play') ? (bounce ? 'up' : 'reach') : onSill && t < t36 ? 'up' : 'down'}
							flip={t >= w07 && t < wBounce}
							look={onSill ? [-0.9, 0.3] : [1, 0]}
						/>
					) : null}
					{showEli ? (
						<Eli
							x={eliX}
							y={er.ground}
							s={KID_S}
							frame={f}
							{...(t < t36 ? gait(eliW) : back > 0 && back < 1 ? {pose: 'walk' as const, turn: -0.6, phase: (560 - eliX) / (30 * KID_S)} : {pose: 'stand' as const})}
							look={[1, -0.4]}
							eyes={snarl ? 'wide' : t > t37 && t < e04 ? 'squint' : 'dot'}
							brows={snarl || t >= e04 ? 'worried' : 'none'}
							mouth={eliT.talk > 0 ? 'open' : snarl ? 'o' : 'flat'}
							talk={eliT.talk}
							viseme={eliT.viseme}
							pale={t > t37 ? 0.25 : 0}
							sweat={t > t37 && t < t41}
						/>
					) : null}
				</g>
			);
		}
		// the rest of the day: Eli in bed, nothing moves, the light fades
		const dusk = ramp(t, t41 + 0.5, end('narrator_041_rest_of_day') + 0.8);
		const b = BEDS.bedroom_day;
		return (
			<g>
				<BedScene set="bedroom_day" light="day" frame={f} bed={{mode: 'sit', p: {mouth: 'flat', brows: 'sad', look: [0.6, 0.9]}}} id="tr" skirt={{cx: 665, h: 0}} />
				<rect x={0} y={0} width={1920} height={1080} fill="#1b2340" opacity={dusk * 0.55} />
				<rect x={b.x0} y={b.skirtBottom} width={b.x1 - b.x0} height={b.gap - b.skirtBottom + 4} fill="#000" opacity={0.5} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
