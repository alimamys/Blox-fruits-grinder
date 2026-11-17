// 3. THE FOOTSTEPS - slow, heavy, uneven, coming up from below; a scraping; a woman begging, a man whispering,
// a scream; something dragged; a door closing; and the footsteps start again - closer.
import React from 'react';
import {Sarah} from '../components/characters/Cast';
import {Flicker, HallDoor} from '../stick/d306';
import {Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, stairPt, useStick, walk} from '../stick/kit';

const Shadow: React.FC<{x: number; y: number; k?: number}> = ({x, y, k = 0.55}) => (
	<g opacity={k} transform={`translate(${x} ${y}) scale(1.4 1.7) skewX(-18)`}>
		<path d="M0,0 C-10,-120 10,-230 -10,-300 C-40,-330 -60,-300 -50,-270 C-80,-200 -60,-80 -70,0 Z M-50,-230 C-90,-160 -100,-60 -110,10 L-96,12 C-80,-60 -66,-150 -40,-210 Z" fill="#05070a" />
	</g>
);

export const Footsteps: React.FC = () => {
	const {f, t, at} = useStick();
	const t40 = at('narrator_040_footsteps');
	const t41 = at('narrator_041_downstairs');
	const t45 = at('narrator_045_one_step');
	const t47 = at('narrator_047_scraping');
	const t49 = at('narrator_049_ear_door');
	const t50 = at('narrator_050_stopped');
	const t52 = at('narrator_052_womans_voice');
	const t54 = at('narrator_054_scream');
	const tS = at('scream_1');
	const t55 = at('narrator_055_terrible');
	const t58 = at('narrator_058_dragging_floor');
	const t59 = at('narrator_059_door_closing');
	const t60 = at('narrator_060_started_again');
	const t61 = at('narrator_061_closer');
	const t62 = at('narrator_062_coming_upstairs');
	const S = GEO.stair;
	const stepShake = (t >= t45 && t < t47 && (t - t45) % 1.1 < 0.12) ? 6 : 0;
	const screaming = t >= t54 && t < t55 + 0.5;
	const door3 = t >= t58 ? 0.35 * (1 - ramp(t, t59, t59 + 0.6)) : t >= t52 ? 0.12 : 0;
	const climbK = ramp(t, t60, t62 + 2.5);
	const [shx, shy] = stairPt(0.05 + 0.35 * climbK);
	const back = walk(t, t62 + 0.4, t62 + 2.2, 1420, 1100, 1.6);
	const shots = [
		shot(t40, 'flat_night_bare', 2.0, 2.1, [1400, 560], [1400, 550]),
		shot(t41, 'stairwell_night', 1.0, 1.06, [960, 540], [900, 600]),
		shot(t45, 'stairwell_night', 1.8, 1.9, [720, 820], [720, 820], {shake: stepShake}),
		shot(t47, 'stairwell_night', 1.5, 1.6, [520, 760], [520, 760]),
		shot(t49, 'flat_night_bare', 2.6, 2.7, [1440, 520], [1440, 515]),
		shot(t52, 'stairwell_night', 1.7, 1.8, [330, 640], [330, 640]),
		shot(t54, 'stairwell_night', 1.7, 1.7, [330, 640], [330, 640], {shake: 8}),
		shot(t55, 'flat_night_bare', 2.6, 2.8, [1430, 520], [1430, 515]),
		shot(t58, 'stairwell_night', 1.5, 1.55, [430, 680], [430, 680]),
		shot(t60, 'stairwell_night', 1.0, 1.0, [960, 540]),
		shot(t62, 'flat_night_bare', 1.4, 1.4, [1250, 600], [1250, 600]),
	];
	const world = (set: string) => {
		if (set === 'flat_night_bare') {
			const ear = t >= t49 && t < t55;
			const x = t >= t62 + 0.4 ? back.x : ear ? 1460 : 1420;
			return (
				<Person
					is={Sarah}
					name="sarah"
					x={x}
					y={GEO.flat.floor}
					s={1.6}
					frame={f}
					turn={t >= t62 + 0.4 && back.moving ? -0.8 : 0.7}
					pose={back.moving ? 'walk' : 'stand'}
					phase={back.phase}
					lean={ear ? 16 : 0}
					tilt={ear ? 18 : 0}
					look={[1, 0]}
					eyes={ear && t < t50 ? 'closed' : 'wide'}
					brows="worried"
					mouth={t >= t55 ? 'o' : 'flat'}
					arms={t >= t55 && t < t62 ? 'fingerLips' : ear ? {l: [8, 4], r: [40, -100]} : 'down'}
					shiver={t >= t55 ? 0.8 : 0}
				/>
			);
		}
		// the stairwell
		const lightK = screaming ? 1 : t >= t41 ? 0.35 : 0;
		return (
			<g>
				<HallDoor r={S.door3} open={door3} dark="#1d1a14" />
				{t >= t41 && t < t52 ? <Shadow x={lerp(560, 640, ramp(t, t41, t47))} y={S.landing3 - 10} k={0.5} /> : null}
				{t >= t47 && t < t52 ? <ellipse cx={lerp(380, 520, ramp(t, t47, t49))} cy={S.landing3 - 6} rx={110} ry={16} fill="#000" opacity={0.45} /> : null}
				{t >= t60 ? <Shadow x={shx + 100} y={shy - 30} k={0.55} /> : null}
				<Flicker f={f} k={lightK} />
			</g>
		);
	};
	void tS;
	void t61;
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
