// 1. THE WAVE - cold open. 4 a.m.: the moving truck at the bottom of the hill, Eli's face to the glass,
// and Mr. Widemouth in the bedroom window, waving goodbye with a steak knife in his other hand.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disclaimer} from '../components/ui/Phone';
import {FPS} from '../data/timeline';
import {DrivewayWorld, TRUCK, truckWindow, WindowWorld} from '../stick/exteriors';
import {GEO, ramp, shot, Shots, TitleCardStick, useStick} from '../stick/kit';

export const Wave: React.FC = () => {
	const {f, t, at, end, word, total} = useStick();
	const T1 = at('narrator_001_four_am');
	const T2 = at('narrator_002_truck');
	const T3 = at('narrator_003_window');
	const T4 = at('narrator_004_still');
	const T5 = at('narrator_005_waved');
	const T6 = at('narrator_006_knife');
	const T7 = at('narrator_007_didnt_wave');
	const T8 = at('narrator_008_best_friend');
	const TB = at('cut_black');
	const TT = at('title');
	if (t < T1) {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<Disclaimer f={f} d={Math.round(T1 * FPS)} />
			</AbsoluteFill>
		);
	}
	if (t >= TT) return <TitleCardStick f={f - Math.round(TT * FPS)} d={Math.round((total - TT) * FPS)} />;
	if (t >= TB) return <AbsoluteFill style={{background: '#000'}} />;

	const g = GEO.driveway_night.ground;
	const go = T5 + 0.4;
	const distAt = (tt: number) => (tt > go ? 26 * (tt - go) + 1.6 * (tt - go) ** 2 : 0);
	const dist = distAt(t);
	const truckX = TRUCK.x - dist * TRUCK.s;
	const waveAt = word('narrator_005_waved', 'lifted', 0.45);
	const waving = t > waveAt;
	const lightOff = ramp(t, end('narrator_008_best_friend') + 0.2, end('narrator_008_best_friend') + 0.5);
	const still = t >= T3 && t < waveAt;
	const sad = t >= T7;
	const eli = {
		eyes: (t > T3 ? 'wide' : 'dot') as 'wide' | 'dot',
		brows: (sad ? 'sad' : t > T3 ? 'worried' : 'none') as 'sad' | 'worried' | 'none',
		mouth: (sad ? 'flat' : t > T3 ? 'o' : 'flat') as 'flat' | 'o',
	};
	const win = (tt: number) => truckWindow(TRUCK.x - distAt(tt) * TRUCK.s, g);
	const knife: [number, number] = [884, 820];
	const shots = [
		shot(T1, 'driveway_night', 1.0, 1.07, [900, 600], [880, 640]),
		shot(T2, 'driveway_night', 3.1, 3.35, win(T2), win(T2)),
		shot(T3, 'driveway_night', 4.4, 4.9, [1549, 336], [1549, 338]),
		shot(T4, 'window_out_night', 1.3, 1.42, [963, 700], [963, 690]),
		shot(T5, 'driveway_night', 1.3, 1.36, [980, 620], [900, 640]),
		shot(waveAt - 0.1, 'window_out_night', 1.45, 1.62, [963, 690], [963, 670]),
		shot(T6, 'window_out_night', 2.0, 3.0, [930, 760], knife),
		shot(T7, 'driveway_night', 3.0, 3.1, [0, 0], [0, 0], {track: (tt) => win(tt)}),
		shot(T8, 'driveway_night', 1.0, 1.35, [960, 560], [1380, 420]),
	];
	return (
		<Shots
			shots={shots}
			world={(s) =>
				s.set === 'window_out_night' ? (
					<WindowWorld frame={f} still={still} wave={waving} />
				) : (
					<DrivewayWorld frame={f} truckX={truckX} dist={dist} eli={eli} wave={waving} still={still} lightOff={lightOff} truck={t < T8} />
				)
			}
		/>
	);
};
