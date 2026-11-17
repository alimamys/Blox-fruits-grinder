// 7. THE REALIZATION - the sofa toward the door; one person from every floor - who from mine? Through the
// peephole: they have all turned to face my door. The landlord, the cheap rent. One message.
import React from 'react';
import {Landlord, Sarah} from '../components/characters/Cast';
import {Prop} from '../components/characters/Creature';
import {MessageScreen, PhoneFrame} from '../components/ui/Phone';
import {FPS} from '../data/timeline';
import {peepOverlay, residentsPersp} from '../stick/d306';
import {Person} from '../stick/goat';
import {fshot, GEO, lerp, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {boxesOf, Group, type Spec} from '../stick/places';
import {FLAT_PROPS} from './NewApartment';

export const SOFA_AT_DOOR = 1330;

export const Realization: React.FC = () => {
	const {f, t, at} = useStick();
	const t129 = at('narrator_129_backed_away');
	const t130 = at('narrator_130_heart_pounding');
	const t131 = at('narrator_131_sofa');
	const tSofa = at('sofa');
	const t132 = at('narrator_132_thought');
	const t135 = at('narrator_135_peephole_again');
	const t136 = at('narrator_136_changed');
	const t137 = at('narrator_137_not_facing');
	const t138 = at('narrator_138_facing_mine');
	const tNT = at('neighbors_turned');
	const t139 = at('narrator_139_every_one');
	const t140 = at('narrator_140_tears');
	const t141 = at('narrator_141_wouldnt_look');
	const t142 = at('narrator_142_landlord');
	const t146 = at('narrator_146_grabbed_phone');
	const t147 = at('narrator_147_one_message');
	const tMsg = at('message');
	const t149 = at('narrator_149_stared');
	const t151 = at('narrator_151_not_randomly');
	const t152 = at('narrator_152_residents_chose');
	const t153 = at('narrator_153_chosen_me');
	if (t >= t147 && t < t149) {
		const lf = f - Math.round(t147 * FPS);
		return (
			<PhoneFrame f={lf} d={Math.round((t149 - t147) * FPS)}>
				<MessageScreen from="Landlord" text="I'm sorry, Sarah. We all have families." t={(lf - 30) / 10} />
			</PhoneFrame>
		);
	}
	const F = GEO.flat;
	const back = walk(t, t129 + 0.2, t129 + 1.8, 1420, 1180, 1.6);
	// the sofa: she drags it from the middle of the room toward the door (it reaches the door in scene 8)
	const push = ramp(t, t131 + 0.3, tSofa + 1.5);
	const sofaX = lerp(FLAT_PROPS.sofa.x, SOFA_AT_DOOR - 80, push);
	const pushing = t >= t131 && t < t132;
	const toPeep = walk(t, t135 - 0.1, t135 + 0.9, sofaX - 250, 1500, 1.6);
	const sarahX = t < t131 ? back.x : t < t135 - 0.1 ? sofaX - 250 : toPeep.x;
	const turned = t >= t136;
	const res: Spec[] = residentsPersp(f, turned ? 'door' : 'stairs', {
		harris: {tears: t >= t140 ? 1 : 0, brows: 'sad', mouth: 'frown', look: [0, 0]},
		mother: {look: t >= t141 ? [-0.6, 1] : [0, 0], brows: 'sad'},
		boy: {look: [0, 0], tears: 1},
	}).map((p) => ({...p, idle: false, eyes: turned && p.name !== 'mother' ? 'dot' : p.eyes, look: p.look ?? [0, 0]}));
	const harris = res.find((p) => p.name === 'harris')!;
	const mother = res.find((p) => p.name === 'mother')!;
	const shots = [
		shot(t129, 'flat_night_bare', 1.2, 1.2, [1250, 580], [1250, 580]),
		shot(t130, 'flat_night_bare', 2.8, 3.0, [1180, 520], [1180, 515], {shake: 3}),
		shot(t131, 'flat_night_bare', 1.1, 1.1, [1100, 560], [1150, 560]),
		shot(t132, 'flat_night_bare', 2.6, 2.7, [sarahX + 20, 520], [sarahX + 20, 515]),
		shot(t135, 'flat_night_bare', 2.4, 2.5, [1530, 540], [1530, 530]),
		shot(t136, 'hallway_persp_night', 1.0, 1.0, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t138, 'hallway_persp_night', 1.0, 1.15, [950, 560], [950, 560], {tag: 'peep'}),
		fshot(boxesOf(res), t140, 'hallway_persp_night', 1.55, [harris.x - 40, 540], {tag: 'peep'}),
		fshot(boxesOf(res), t141, 'hallway_persp_night', 1.55, [mother.x, 560], {tag: 'peep'}),
		shot(t142, 'office_day', 1.0, 1.04, [960, 540], [1000, 540], {light: 'dawn'}),
		shot(t146, 'flat_night_bare', 2.4, 2.5, [sarahX + 20, 540], [sarahX + 20, 535]),
		shot(t149, 'flat_night_bare', 2.8, 3.0, [sarahX + 20, 520], [sarahX + 20, 515]),
		shot(t152, 'hallway_persp_night', 1.0, 1.04, [950, 560], [950, 560], {tag: 'peep'}),
		shot(t153, 'flat_night_bare', 3.0, 3.3, [sarahX + 20, 510], [sarahX + 20, 505]),
	];
	const world = (set: string) => {
		if (set === 'hallway_persp_night') {
			if (t < t136) return <Group people={residentsPersp(f, 'stairs').map((p) => ({...p, idle: false}))} />;
			return <Group people={res} />;
		}
		if (set === 'office_day') {
			// memory: the landlord smiling, sliding the keys across, the deposit waved away
			const k = ramp(t, t142, t146);
			return (
				<g>
					<Person is={Landlord} name="landlord" x={1000} y={GEO.office.floor - 20} s={1.6} frame={f} mouth="grin" look={[1, 0]} arms={k > 0.4 ? 'handsForward' : 'holdOne'} prop={k < 0.4 ? 'card' : 'none'} />
					<Person is={Sarah} name="sarah" x={1480} y={GEO.office.floor + 10} s={1.6} frame={f} mouth="smile" look={[-1, 0]} />
					<rect x={-100} y={-100} width={2200} height={1300} fill="#3a2a10" opacity={0.18} />
				</g>
			);
		}
		// the flat
		return (
			<g>
				<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
				<Prop name="sofa" x={sofaX} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} tilt={pushing ? Math.sin(t * 6) * 0.8 : 0} />
				<Person
					is={Sarah}
					name="sarah"
					x={sarahX}
					y={F.floor}
					s={1.6}
					frame={f}
					{...(t < t131 && back.moving ? {pose: 'walk', turn: -0.7, phase: back.phase} : pushing ? {pose: 'walk', turn: 0.8, phase: sofaX / 40, lean: 16, arms: 'handsForward'} : toPeep.moving ? {pose: 'walk', turn: 0.8, phase: toPeep.phase} : {turn: t >= t135 && t < t146 ? 0.7 : 0, lean: t >= t135 && t < t146 ? 8 : 0})}
					look={t >= t146 && t < t147 ? [0.2, 1] : [1, 0]}
					eyes="wide"
					brows={t >= t151 ? 'sad' : 'worried'}
					mouth={t >= t153 ? 'o' : 'flat'}
					shiver={t >= t130 && t < t131 ? 1.2 : 0.5}
					prop={t >= t146 ? 'phone' : 'none'}
					propGlow="#9fc3ff"
					tears={t >= t152 ? 1 : 0}
					edge={toPeep.moving}
					{...(t >= t146 ? {arms: 'holdOne'} : {})}
				/>
			</g>
		);
	};
	void t137;
	void tNT;
	void t139;
	void tMsg;
	return <Shots shots={shots} world={(s) => world(s.set)} overlay={peepOverlay} />;
};
