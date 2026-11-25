// 4. THE HALL - gold from floor to ceiling; the veiled bride; the mother of the bride's ice-cold fingers; "Play. And
// do not stop until the bride has gone."; the guests dance, clap like one person; the lights flicker; their eyes shine.
import React from 'react';
import {Bride, Mother, Noura} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {GEO, ramp, shot, Shots, useStick, type Shot} from '../stick/kit';
import {Dark, Glow, Haze} from '../stick/props';
import {Band, Guests} from './common';

export const BRIDE = {x: 924, y: 790, s: 1.25};
export const BAND = {x0: 160, y: 1040, s: 1.45};

/** the bride on her chair, veiled, never moving */
export const TheBride: React.FC<{f: number}> = ({f}) => <Person is={Bride} name="bride" x={BRIDE.x} y={BRIDE.y} s={BRIDE.s} pose="sit" frame={f} idle={false} arms="lap" overlapOk noqa />;

export const Hall: React.FC = () => {
	const {f, t, at, end, talk, word} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tPlay = at('play');
	const t14 = T('yadda_014_eyes');
	const shots: Shot[] = [
		// the doors open: the golden hall
		shot(at('doors'), 'hall_gold', 1.0, 1.05, [960, 540], [960, 560], {light: 'warm', tag: 'wide'}),
		// "Inside, the women's hall was gold from the floor to the ceiling..." - across the hall to the bride
		shot(T('yadda_010_gold'), 'hall_gold', 1.05, 1.5, [760, 600], [925, 560], {light: 'warm', tag: 'wide'}),
		// "The mother of the bride took Noura's hand. Her fingers were ice cold."
		shot(T('yadda_011_cold'), 'hall_gold', 2.0, 2.15, [520, 760], [520, 760], {light: 'warm', tag: 'hand'}),
		// MOTHER: "Play. And do not stop until the bride has gone."
		shot(T('mother_003_play'), 'hall_gold', 2.8, 3.0, [420, 690], [420, 685], {light: 'warm', tag: 'hand'}),
		// they start to play; the guests rise
		shot(tPlay, 'hall_gold', 1.25, 1.3, [700, 760], [760, 760], {light: 'warm', tag: 'play'}),
		// "So they played. And the guests danced."
		shot(T('yadda_012_danced'), 'hall_gold', 1.05, 1.1, [960, 600], [960, 580], {light: 'warm', tag: 'dance'}),
		// "Hundreds of hands, clapping on exactly the same beat. Like one person."
		shot(T('yadda_013_one_person'), 'hall_gold', 1.7, 1.8, [1250, 800], [1240, 800], {light: 'warm', tag: 'clap'}),
		// "Nobody touched the food. Nobody spoke. And when the lights flickered, their eyes shone..."
		shot(t14, 'hall_gold', 1.9, 2.0, [1600, 790], [1560, 790], {light: 'warm', tag: 'food'}),
		shot(word('yadda_014_eyes', 'lights', 0.47), 'hall_gold', 1.45, 1.5, [1180, 760], [1180, 760], {light: 'warm', tag: 'eyes'}),
		shot(at('flicker'), 'hall_gold', 1.5, 1.55, [1180, 780], [1180, 780], {light: 'warm', tag: 'eyes'}),
	];
	const world = (s: Shot) => {
		const md = talk('mother');
		const playing = t > tPlay + 0.2;
		// the lights stutter, then go out: only their eyes are left
		const tFl = word('yadda_014_eyes', 'flickered', 0.5);
		const tOut = word('yadda_014_eyes', 'eyes', 0.63);
		const stut = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1][Math.floor(f / 2) % 16];
		const dark = s.tag === 'eyes' ? (t < tFl ? 0 : t < tOut ? (stut ? 0.9 : 0.08) : 0.94) : 0;
		const doors = s.tag === 'wide' ? 1 - ramp(t, at('doors'), at('doors') + 1.0) : 0;
		const mode = !playing ? 'stand' : s.tag === 'clap' ? 'clap' : 'dance';
		if (s.tag === 'hand')
			return (
				<g>
					<Haze t={t} />
					<TheBride f={f} />
					<Person is={Mother} name="mother" x={420} y={1060} s={1.75} frame={f} turn={0.5} look={[1, 0]} talk={md.talk} viseme={md.viseme} mouth="smile" arms={{l: [10, 0], r: [52, -30]}} idle={false} />
					<Person is={Noura} name="noura" x={640} y={1060} s={1.6} frame={f} turn={-0.5} look={[-1, -0.1]} prop="tar" arms={{l: [22, -105], r: [52, -30]}} eyes={t > T('yadda_011_cold', 0.6) ? 'wide' : 'dot'} brows="worried" />
				</g>
			);
		return (
			<g>
				<Haze t={t} />
				<TheBride f={f} />
				<Guests f={f} t={t} mode={mode} glow={s.tag === 'eyes'} look={s.tag === 'eyes' ? [-0.4, 0] : undefined} />
				{t > tPlay - 0.1 ? <Band f={f} t={t} x0={BAND.x0} y={BAND.y} s={BAND.s} play={playing ? 1 : 0} {...(s.tag === 'eyes' ? {nouraP: {edge: true}, drummerP: {edge: true}, othersP: {edge: true}} : {})} /> : null}
				{dark > 0 ? <Dark k={dark} /> : null}
				{dark > 0.5 ? <Guests f={f} t={t} mode={mode} glow look={[-0.4, 0]} eyesOnly /> : null}
				{doors > 0 ? <Dark k={doors} /> : null}
				<Glow cx={960} cy={120} r={500} color="#fff2c4" k={s.tag === 'eyes' ? 0 : 0.3} />
			</g>
		);
	};
	void GEO;
	return <Shots shots={shots} world={(s) => world(s)} />;
};
