// 5. THE RULE - through the inch-wide gap: once every month, always at 3:06; one person from every floor; that's
// the agreement. It hears breathing. A thud below. The door shut, the lock turned. Another scream.
import React from 'react';
import {Prop} from '../components/characters/Creature';
import {Flicker, HarrisAtGap, HallDoor, SarahAtGap} from '../stick/d306';
import {GEO, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {LINE_BY_ID} from '../data/voiceLines';
import {Person} from '../stick/goat';
import {Harris, Sarah} from '../components/characters/Cast';
import {FLAT_PROPS} from './NewApartment';

export const Rule: React.FC = () => {
	const {f, t, at, end, talk, api} = useStick();
	const ids = Object.keys(api.scene.markers);
	const t87 = at('narrator_087_swallowed');
	const t88 = at('narrator_088_stared');
	const t89 = at('narrator_089_laughed');
	const t90 = at('narrator_090_eyes_filled');
	const t91 = at('narrator_091_stepped_backward');
	const t92 = at('narrator_092_heavy_thud');
	const t93 = at('narrator_093_flinched');
	const t94 = at('narrator_094_stepped_away');
	const t95 = at('narrator_095_turned_lock');
	const t96 = at('narrator_096_hands_shaking');
	const t97 = at('narrator_097_lost_his_mind');
	const t98 = at('narrator_098_another_scream');
	const tS2 = at('scream_2');
	const t99 = at('narrator_099_wet_dragging');
	const tWD = at('wet_drag');
	const t100 = at('narrator_100_truth');
	const sar = talk('sarah');
	const har = talk('harris');
	const tears = t >= t90 ? 1 : 0;
	const back = t >= t91 && t < t95 ? walk(t, t91 + 0.1, t91 + 1.0, 1392, 1300, 1.6) : null;
	const away = walk(t, t94 + 0.2, t94 + 2.4, 1080, 360, 1.6);
	const shut = t >= t95;
	// one shot per line: Sarah when she speaks (and on her own reactions), Mr. Harris when he does
	const shots = ids
		.filter((id) => !id.startsWith('narrator_09') || ['narrator_090_eyes_filled'].includes(id))
		.filter((id) => at(id) < t92)
		.map((id) => {
			const who = LINE_BY_ID[id]?.character;
			const onHarris = who === 'harris' || id === 'narrator_087_swallowed' || id === 'narrator_088_stared' || id === 'narrator_090_eyes_filled';
			return onHarris ? shot(at(id) - 0.1, 'hallway_night', 2.2, 2.25, [1080, 560], [1080, 560]) : shot(at(id) - 0.1, 'flat_night_bare', 2.2, 2.25, [1450, 560], [1450, 560]);
		});
	shots.push(
		shot(t92, 'hallway_night', 2.0, 2.0, [1080, 560], [1080, 560], {shake: 10}),
		shot(t94, 'hallway_night', 1.0, 1.0, [960, 540]),
		shot(t95, 'flat_night_bare', 1.6, 1.6, [1450, 600], [1450, 600]),
		shot(t96, 'flat_night_bare', 2.6, 2.7, [1380, 600], [1380, 600]),
		shot(t98, 'stairwell_night', 1.0, 1.0, [960, 540], [960, 540], {shake: 9}),
		shot(t99, 'stairwell_night', 1.5, 1.6, [430, 740], [430, 740]),
		shot(t100, 'flat_night_bare', 2.8, 3.0, [1400, 540], [1400, 535]),
	);
	shots.sort((a, b) => a.t - b.t);
	const world = (set: string) => {
		if (set === 'stairwell_night') {
			const k = ramp(t, t99, tWD + 2);
			return (
				<g>
					<ellipse cx={300 + k * 200} cy={GEO.stair.landing3 - 6} rx={120} ry={16} fill="#2a0f0f" opacity={0.5} />
					<Flicker f={f} k={t >= t98 && t < t99 ? 1 : 0.3} />
				</g>
			);
		}
		if (set === 'hallway_night') {
			if (t >= t94) {
				return (
					<g>
						<HallDoor r={GEO.hall.doors[0]} open={1} />
						<HallDoor r={GEO.hall.doors[2]} open={1} />
						<Person is={Harris} name="harris" x={away.x} y={GEO.hall.floor + 25} s={1.6} frame={f} {...(away.moving ? {pose: 'walk', turn: -0.8, phase: away.phase} : {turn: 0.6, look: [1, 0]})} tears={1} brows="sad" mouth="frown" edge={away.x < 200} />
					</g>
				);
			}
			return (
				<g>
					<HallDoor r={GEO.hall.doors[0]} open={1} />
					<HallDoor r={GEO.hall.doors[2]} open={1} />
					<HarrisAtGap f={f} gap={1} p={{mouth: har.talk > 0 ? 'open' : 'frown', talk: har.talk, viseme: har.viseme, tears, brows: t >= t90 ? 'sad' : 'worried', look: t >= t88 && t < t89 ? [-1, -0.1] : [-1, 0], eyes: t >= t93 && t < t94 ? 'squint' : 'wide'}} />
				</g>
			);
		}
		// the flat
		const props = (
			<g>
				<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
				<Prop name="sofa" x={FLAT_PROPS.sofa.x} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} />
			</g>
		);
		if (shut) {
			return (
				<g>
					{props}
					<Person is={Sarah} name="sarah" x={t >= t96 ? 1380 : 1420} y={GEO.flat.floor} s={1.6} frame={f} turn={t >= t96 ? 0 : 0.6} arms={t >= t95 && t < t96 ? {l: [8, 4], r: [30, -40]} : t >= t96 ? 'handsForward' : 'down'} shiver={t >= t96 ? 1.6 : 0.5} eyes="wide" brows="worried" mouth={t >= t98 ? 'o' : 'flat'} look={t >= t96 && t < t97 ? [0, 1] : [1, 0]} />
				</g>
			);
		}
		return (
			<g>
				{props}
				<SarahAtGap
					f={f}
					gap={1}
					x={back ? back.x : 1392}
					p={{
						mouth: sar.talk > 0 ? 'open' : t >= t89 && t < at('sarah_007_what_agreement') ? 'grin' : 'flat',
						talk: sar.talk,
						viseme: sar.viseme,
						...(back ? {pose: back.moving ? 'walk' : 'stand', turn: back.moving ? -0.6 : 0.6, phase: back.phase, arms: 'down'} : {}),
						brows: t >= t89 && t < at('sarah_007_what_agreement') ? 'raised' : 'worried',
					}}
				/>
			</g>
		);
	};
	void end;
	void t87;
	void tS2;
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
