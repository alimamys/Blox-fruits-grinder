// 7. THE TRAIL - better at last; he waits on the back porch; the deer trail into the silent woods;
// "You're not ready yet. But soon."
import React from 'react';
import {Eli, Mom, PALETTES} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {GEO, gait, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {ADULT_S, KID_S, WM_S} from '../stick/rooms';

export const Trail: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t61 = at('narrator_061_better');
	const t62 = at('narrator_062_porch');
	const w12 = at('widemouth_012_show_you');
	const t63 = at('narrator_063_deer_trail');
	const t64 = at('narrator_064_silent');
	const w13 = at('widemouth_013_important_path');
	const t65 = at('narrator_065_black_eyes');
	const w14 = at('widemouth_014_not_ready');
	const tDark = at('trail_dark');
	const wmT = talk('widemouth');
	const pg = GEO.porch_day;

	// porch: out of the back door, along the deck, down the steps; he waits on the grass
	const deck = walk(t, t61 + 0.5, t62 + 0.4, 330, 860, KID_S);
	const stepK = ramp(t, t62 + 0.4, t62 + 1.6);
	const eliPorchX = t < t62 + 0.4 ? deck.x : lerp(860, 1010, stepK);
	const eliPorchY = t < t62 + 0.4 ? pg.deck : lerp(pg.deck, pg.ground - 40, stepK);
	const WMX = 1300;
	// woods edge: from the front of the meadow toward the trail, getting smaller
	const edgeK = ramp(t, t63 + 0.3, t64 - 0.1);
	const edgeY = lerp(1080, 800, edgeK);
	const edgeS = lerp(1, 0.35, edgeK);
	// the trail, side-on: walking left to right
	const tr = walk(t, t64, w14 - 0.3, 300, 1300, KID_S * 0.9);
	const shots = [
		shot(0, 'porch_day', 1.0, 1.03, [960, 540]),
		shot(t62, 'porch_day', 1.2, 1.3, [1050, 620], [1100, 640]),
		shot(w12 - 0.2, 'porch_day', 2.2, 2.4, [WMX - 40, pg.ground - 140], [WMX - 40, pg.ground - 150]),
		shot(t63, 'woods_edge', 1.0, 1.15, [960, 600], [960, 560]),
		shot(t64, 'woods_trail', 1.15, 1.2, [0, 0], [0, 0], {track: () => [tr.x + 80, 620]}),
		shot(t65, 'woods_trail', 2.6, 2.9, [tr.x + 140, GEO.woods_trail.ground - 130 * WM_S]),
		shot(w14 - 0.2, 'woods_trail', 3.0, 3.5, [tr.x + 150, GEO.woods_trail.ground - 128 * WM_S], [tr.x + 150, GEO.woods_trail.ground - 130 * WM_S]),
		shot(tDark, 'woods_edge', 1.5, 2.2, [960, 560], [960, 500]),
	];
	const world = (set: string) => {
		if (set === 'porch_day') {
			const momOn = t >= t61 && t < w12;
			return (
				<g>
					{momOn ? <Mom x={300} y={pg.deck - 4} s={ADULT_S * 0.86} frame={f} arms={t < t61 + 2 ? 'wave' : 'down'} mouth="smile" look={[1, 0]} /> : null}
					{t >= t61 + 0.3 ? <Eli x={eliPorchX} y={eliPorchY} s={KID_S * 0.9} frame={f} palette={PALETTES.eliDay} {...(deck.moving || (stepK > 0 && stepK < 1) ? {pose: 'walk' as const, turn: 0.8, phase: eliPorchX / (30 * KID_S * 0.9)} : {})} mouth={t < t62 ? 'smile' : 'flat'} look={t >= t62 ? [1, 0.4] : [1, 0]} /> : null}
					{t >= t62 ? <Widemouth x={WMX} y={pg.ground} s={WM_S} frame={f} mouth="smile" talk={wmT.talk} look={[-1, -0.6]} arms={t >= w12 + 0.3 && t < end('widemouth_012_show_you') ? 'reach' : 'down'} flip={false} /> : null}
				</g>
			);
		}
		if (set === 'woods_edge') {
			if (t >= tDark) return null;
			return (
				<g>
					<Widemouth x={lerp(820, 940, edgeK)} y={edgeY - 10} s={WM_S * edgeS * 1.2} frame={f} walking={edgeK > 0 && edgeK < 1} phase={edgeK * 40} />
					<Eli x={lerp(1060, 990, edgeK)} y={edgeY} s={KID_S * edgeS} frame={f} back palette={PALETTES.eliDay} pose={edgeK > 0 && edgeK < 1 ? 'walk' : 'stand'} phase={edgeK * 26} />
				</g>
			);
		}
		// woods_trail
		const g = GEO.woods_trail.ground;
		const stopped = t >= t65;
		const wm = stopped ? {x: tr.x + 150, walking: false} : {x: tr.x + 150, walking: tr.moving};
		return (
			<g>
				<Eli x={tr.x} y={g + 6} s={KID_S * 0.9} frame={f} palette={PALETTES.eliDay} {...(stopped ? {pose: 'stand' as const, turn: 0.3} : gait(tr))} look={[1, 0.5]} brows={t >= t65 ? 'worried' : 'none'} mouth="flat" />
				<Widemouth x={wm.x} y={g} s={WM_S} frame={f} walking={wm.walking} phase={tr.x / (14 * WM_S)} mouth={t > w14 + 1.0 ? 'grin' : 'smile'} talk={wmT.talk} look={stopped ? [-1, -1] : [1, 0]} flip={stopped} tilt={stopped ? -6 : 0} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
