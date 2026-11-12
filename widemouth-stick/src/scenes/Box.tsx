// 5. THE BOX - "I'm going to teach you how to juggle." A box full of knives. The smile goes.
import React from 'react';
import {Widemouth} from '../components/characters/Widemouth';
import {BEDS, KnifeBox, KnivesTopDown, lerp, ramp, shot, Shots, skirtArch, useStick, walk} from '../stick/kit';
import {BedScene, KID_S, WM_S} from '../stick/rooms';

const b = BEDS.bedroom_day;
const CX = 665;
const SPOT = 1180;

export const Box: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t42 = at('narrator_042_cardboard_box');
	const w08 = at('widemouth_008_juggle');
	const t43 = at('narrator_043_looked_inside');
	const t44 = at('narrator_044_knives');
	const e05 = at('eli_005_mom_kill_me');
	const w09 = at('widemouth_009_more_fun');
	const t45 = at('narrator_045_smile_gone');
	const tPushed = word('narrator_045_smile_gone', 'pushed', 0.3);
	const t46 = at('narrator_046_slid_back');
	const tSlid = word('narrator_046_slid_back', 'slid', 0.55);
	const t47 = at('narrator_047_wondering');
	const t48 = at('narrator_048_underneath');
	const tU = at('under');
	const wmT = talk('widemouth');
	const eliT = talk('eli');

	// he comes out pushing the little box, stops by the bed
	const inW = walk(t, t42 + 0.2, t42 + 2.4, 1650, SPOT, WM_S);
	const boxX = t < tPushed ? (t < t42 + 2.4 ? inW.x - 120 : SPOT - 120) : lerp(SPOT - 120, SPOT + 120, ramp(t, tPushed, tPushed + 0.4));
	const open = ramp(t, t43 + 0.2, t43 + 0.9);
	// he takes the box and goes back under the bed
	const goW = walk(t, tSlid - 0.4, tSlid + 0.5, SPOT, CX, WM_S);
	const kIn = ramp(t, tSlid + 0.45, tSlid + 0.75);
	const under = t > tSlid + 0.4 ? kIn : 0;
	const wmX = t < t42 + 2.4 ? inW.x : t < tSlid - 0.4 ? SPOT : goW.x;
	const wmY = lerp(b.front, b.gap - 22, under);
	const skirtH = skirtArch(t, [{up: tSlid + 0.3, down: tSlid + 0.9, h: 120}]);
	const cold = t >= w09;
	const wmMouth = cold ? 'flat' : 'grin';

	const shots = [
		shot(t42, 'bedroom_day', 1.0, 1.05, [960, 560]),
		shot(w08 - 0.2, 'bedroom_day', 2.3, 2.5, [SPOT - 40, 820], [SPOT - 40, 830]),
		shot(t43, 'bedroom_day', 3.0, 3.3, [SPOT - 120, 900], [SPOT - 120, 895]),
		shot(t44, 'black', 1.0, 1.12, [960, 540]),
		shot(e05 - 0.15, 'bedroom_day', 2.4, 2.5, [380, 540]),
		shot(w09 - 0.15, 'bedroom_day', 3.2, 3.5, [SPOT, b.front - 128 * WM_S]),
		shot(t45, 'bedroom_day', 1.25, 1.3, [850, 640], [870, 650]),
		shot(t47, 'bedroom_night', 1.4, 1.6, [520, 560], [600, 640]),
		shot(t48, 'bedroom_night', 1.8, 2.8, [620, 700], [CX, 850]),
		shot(tU, 'black', 1.0, 1.0, [960, 540]),
	];
	const world = (set: string) => {
		if (set === 'black') {
			if (t < tU) return <KnivesTopDown frame={f} />;
			const k = ramp(t, tU + 0.3, tU + 0.9);
			return (
				<g opacity={k}>
					{[-1, 1].map((sg) => (
						<g key={sg}>
							<circle cx={960 + sg * 70} cy={520} r={30} fill="#050505" stroke="#2a2c33" strokeWidth={3} />
							<circle cx={968 + sg * 70} cy={512} r={8} fill="#dfe6ff" />
						</g>
					))}
				</g>
			);
		}
		if (set === 'bedroom_night') {
			return <BedScene set="bedroom_night" light="night" frame={f} bed={{mode: 'lie', p: {eyes: 'wide', look: [0.6, 1], brows: 'worried'}}} id="bxn" />;
		}
		const holding = t > tSlid - 0.4;
		const boxEl = holding ? null : <KnifeBox x={boxX} y={b.front} s={0.75} open={open} frame={f} knives inside={open > 0.5} />;
		return (
			<BedScene
				set="bedroom_day"
				light="day"
				frame={f}
				id="bx"
				bed={{
					mode: 'sit',
					p: {
						look: t < t43 ? [1, 0.3] : t < e05 ? [1, 0.8] : [1, 0.3],
						eyes: t >= t44 && t < t46 ? 'wide' : 'dot',
						brows: t >= t44 && t < t47 ? 'worried' : 'none',
						mouth: eliT.talk > 0 ? 'shout' : t >= t44 && t < t46 ? 'o' : 'faint',
						talk: eliT.talk,
						viseme: eliT.viseme,
						arms: t >= e05 && t < t46 ? 'handsForward' : undefined,
						pale: t >= t44 && t < t47 ? 0.3 : 0,
					},
				}}
				skirt={{cx: CX, h: skirtH}}
				wm={{x: wmX, y: wmY, under, mouth: wmMouth, talk: wmT.talk, walking: inW.moving || goW.moving, phase: wmX / (14 * WM_S), arms: holding || inW.moving ? 'hold' : 'down', flip: goW.moving || under > 0, look: t >= w09 ? [0, 0] : [-0.9, -0.3], show: t >= t42 + 0.1}}
				behind={boxEl}
				front={holding && under < 0.5 ? <KnifeBox x={wmX - 4} y={wmY - 50} s={0.45} frame={f} knives={false} /> : null}
			/>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
