// 9. THE END OF THE TRAIL - twenty-five years later: the burned foundation, the deer trail, the cemetery of
// children. Then his son, five, and the friend with the big smile who lives under his bed.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EliAdult, Leo} from '../components/characters/Cast';
import {BEDS, Cake, Car, GEO, gait, lerp, ramp, shot, Shots, TitleCardStick, Tint, useStick, walk} from '../stick/kit';
import {ADULT_S, BedScene, KID_S, WM_S} from '../stick/rooms';

export const End: React.FC = () => {
	const {f, t, at, end, word, talk, total} = useStick();
	const t77 = at('narrator_077_drove_back');
	const t78 = at('narrator_078_house_gone');
	const t79 = at('narrator_079_found_trail');
	const t80 = at('narrator_080_expected');
	const t81 = at('narrator_081_deeper');
	const t82 = at('narrator_082_cemetery');
	const t83 = at('narrator_083_headstones');
	const t84 = at('narrator_084_children');
	const t85 = at('narrator_085_not_ready');
	const t86 = at('narrator_086_had_been');
	const tCB = at('cut_black_end');
	const t87 = at('narrator_087_son_five');
	const t88 = at('narrator_088_trampoline');
	const t89 = at('narrator_089_who_told');
	const l01 = at('leo_001_new_friend');
	const l02 = at('leo_002_under_bed');
	const tLL = at('last_look');
	const w15 = at('widemouth_015_hello_again');
	const tLH = at('last_hold');
	const tET = at('end_title');
	const leoT = talk('leo');
	const wmT = talk('widemouth');

	if (t >= tET) return <TitleCardStick f={f - Math.round(tET * 24)} d={Math.round((total - tET) * 24)} />;
	if (t >= tCB && t < t87) return <AbsoluteFill style={{background: '#000'}} />;

	const car = {x: 2400 - ((t - t77) / (t78 - t77 + 0.4)) * 3000, dist: (t - t77) * 200};
	const ruinsW = walk(t, t78 + 0.3, t78 + 4.2, -120, 560, ADULT_S * 0.75);
	const edgeK = ramp(t, t79 + 0.2, t80 - 0.1);
	const trW = walk(t, t80, t82 - 0.2, 200, 1400, ADULT_S * 0.8);
	const cemW = walk(t, t82 + 0.2, t82 + 2.4, -150, 380, ADULT_S * 0.8);
	const lb = BEDS.leoroom_day;
	const fadeEnd = 1 - ramp(t, end('last_hold') - 0.9, end('last_hold'));

	const shots = [
		shot(0, 'ruins_day', 1.0, 1.04, [960, 540], [960, 540], {light: 'grey'}),
		shot(t77, 'road_day', 1.0, 1.03, [960, 560], [960, 560], {light: 'grey'}),
		shot(t78, 'ruins_day', 1.0, 1.12, [800, 600], [900, 640], {light: 'grey'}),
		shot(t79, 'woods_edge', 1.0, 1.12, [960, 600], [960, 560], {light: 'grey'}),
		shot(t80, 'woods_trail', 1.15, 1.2, [0, 0], [0, 0], {light: 'grey', track: () => [trW.x + 40, 600]}),
		shot(t82, 'cemetery_day', 1.0, 1.04, [960, 540], [960, 540], {light: 'grey'}),
		shot(t83, 'cemetery_day', 1.6, 1.6, [520, 760], [1400, 760], {light: 'grey'}),
		shot(t84, 'cemetery_day', 2.3, 2.6, [960, 930], [960, 940], {light: 'grey'}),
		shot(t85, 'cemetery_day', 2.4, 2.6, [400, 640], [400, 650], {light: 'grey'}),
		shot(t86, 'cemetery_day', 1.8, 1.0, [400, 700], [960, 540], {light: 'grey'}),
		shot(t87, 'leoroom_day', 1.0, 1.05, [1100, 560], [1080, 560]),
		shot(t88, 'leoroom_day', 1.1, 1.15, [800, 560], [780, 560]),
		shot(t89, 'leoroom_day', 1.5, 1.6, [700, 600], [720, 600]),
		shot(l01 - 0.2, 'leoroom_day', 2.3, 2.5, [400, 560], [400, 560]),
		shot(l02 - 0.2, 'leoroom_day', 2.4, 2.8, [430, 580], [450, 620]),
		shot(tLL, 'leoroom_day', 2.6, 3.0, [665, 830], [665, 840], {light: 'dark'}),
		shot(w15 - 0.2, 'leoroom_day', 3.3, 3.8, [665, 845], [665, 850], {light: 'dark'}),
	];
	const world = (set: string) => {
		if (set === 'road_day') {
			return (
				<g>
					<rect width={1920} height={1080} fill="#8e959c" opacity={0.32} />
					<Car x={car.x} y={GEO.road_day.ground} s={0.9} frame={f} dist={car.dist} inside={<EliAdult x={-40} y={-112} s={0.36} frame={f} pose="sit" look={[-1, 0]} mouth="flat" />} />
				</g>
			);
		}
		if (set === 'ruins_day') {
			if (t < t78) return null;
			return <EliAdult x={ruinsW.x} y={GEO.ruins_day.ground + 20} s={ADULT_S * 0.75} frame={f} {...gait(ruinsW)} look={[1, 0.3]} mouth="flat" brows={ruinsW.moving ? 'none' : 'sad'} />;
		}
		if (set === 'woods_edge') {
			const y = lerp(1100, 820, edgeK);
			const s = lerp(ADULT_S * 0.9, ADULT_S * 0.3, edgeK);
			return <EliAdult x={lerp(1060, 975, edgeK)} y={y} s={s} frame={f} back pose={edgeK > 0 && edgeK < 1 ? 'walk' : 'stand'} phase={edgeK * 22} />;
		}
		if (set === 'woods_trail') {
			const darker = ramp(t, t81, t82);
			const glance = t > word('narrator_080_expected', 'tree', 0.3) && t < t81 ? [-1, -0.6] : [1, 0];
			return (
				<g>
					<EliAdult x={trW.x} y={GEO.woods_trail.ground + 8} s={ADULT_S * 0.8} frame={f} {...gait(trW)} look={glance as [number, number]} mouth="flat" />
					<rect width={1920} height={1080} fill="#0d1210" opacity={darker * 0.35} />
				</g>
			);
		}
		if (set === 'cemetery_day') {
			if (t >= t84 && t < t85) return null;
			const head = t >= t84 ? [0.2, 1] : [1, 0.2];
			return <EliAdult x={cemW.x} y={GEO.cemetery_day.ground} s={ADULT_S * 0.8} frame={f} {...gait(cemW)} look={head as [number, number]} brows={t >= t83 ? 'sad' : 'none'} mouth="flat" pale={t >= t84 ? 0.2 : 0} />;
		}
		// Leo's room
		if (t >= tLL) {
			const h = 58 * ramp(t, tLL + 0.2, tLL + 0.8);
			return (
				<g>
					<BedScene set="leoroom_day" light="dark" frame={f} id="ll" who="leo" bed={{mode: 'lie', p: {eyes: 'closed'}}} skirt={{cx: 665, h}} wm={{x: 665, y: lb.gap - 22, under: 0.72, dark: 0.55, mouth: 'grin', talk: wmT.talk, look: [0, 0.2]}} />
					<rect x={-50} y={-50} width={2020} height={1180} fill="#000" opacity={1 - fadeEnd} />
				</g>
			);
		}
		const bounce = t >= t88 && t < t89 ? Math.abs(Math.sin((t - t88) * 5)) * 110 : 0;
		const leoOnBed = t >= t88 && t < t89;
		const sitBed = t >= t89;
		const adultX = t < t89 ? 1600 : 1180;
		return (
			<BedScene
				set="leoroom_day"
				light="day"
				frame={f}
				id="lr"
				who="leo"
				bed={sitBed ? {mode: 'sit', p: {mouth: leoT.talk > 0 ? 'open' : 'smile', talk: leoT.talk, viseme: leoT.viseme, look: t >= l02 ? [0.5, 1] : [1, 0], eyes: t >= l02 ? 'squint' : 'dot', brows: t >= l02 ? 'raised' : 'none'}} : {mode: 'none'}}
				front={
					<>
						{!sitBed && !leoOnBed ? (
							<>
								<Cake x={1560} y={lb.front - 20} s={0.7} frame={f} />
								<Leo x={1330} y={lb.front + 20} s={KID_S} frame={f} mouth="grin" arms="armsUp" look={[1, 0.4]} />
							</>
						) : null}
						{leoOnBed ? <Leo x={600} y={lb.quilt + 20 - bounce} s={KID_S} frame={f} mouth="laugh" arms="armsUp" /> : null}
						<EliAdult x={adultX} y={sitBed ? lb.front - 10 : lb.front + 14} s={ADULT_S} frame={f} pose={sitBed ? 'sit' : 'stand'} look={sitBed ? [-1, -0.2] : [-1, 0.3]} mouth={t >= t88 ? 'flat' : 'smile'} brows={t >= t88 ? 'worried' : 'none'} pale={t >= l02 ? 0.3 : 0} flip={sitBed} />
					</>
				}
			/>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
