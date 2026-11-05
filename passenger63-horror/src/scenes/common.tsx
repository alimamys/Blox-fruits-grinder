// Helpers shared by the scenes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Daniel, Emma, OldWoman} from '../components/characters/Cast';
import type {StickProps, Viseme} from '../components/characters/StickPerson';
import {envelopeAt, visemeAt} from '../data/speech';
import {FPS} from '../data/timeline';
import {OceanNight} from '../components/environments/Outdoor';
import {FONT} from '../utils/fonts';
import {clamp} from '../utils/anim';
import {Cam, Svg, type SceneApi} from '../utils/scene';

/**
 * Lip sync: mouth openness (0..1, from the measured voice envelope) and mouth shape
 * while any of the given lines is being spoken. Spread it onto a character:
 *   <Emma {...speak(api, sf, 'emma_009_stop')} />
 */
export const speak = (api: SceneApi, sf: number, ...ids: string[]): {talk: number; viseme: Viseme} => {
	for (const id of ids) {
		if (!api.has(id)) continue;
		const a = api.at(id);
		const b = api.end(id);
		if (sf >= a && sf < b) {
			const t = (sf - a) / FPS;
			const env = envelopeAt(id, t);
			if (env === null) return {talk: 0.35 + 0.65 * Math.abs(Math.sin((sf - a) * 0.75)) * (0.6 + 0.4 * Math.sin(sf * 0.31)), viseme: 'a'};
			return {talk: env, viseme: visemeAt(id, t)};
		}
	}
	return {talk: 0, viseme: 'm'};
};

/** Mouth openness only (see speak()). */
export const talkOf = (api: SceneApi, sf: number, ...ids: string[]) => speak(api, sf, ...ids).talk;

/** y for a figure so that its head centre lands on `cy` at scale `s`. */
export const headY = (cy: number, s: number, sitting = false) => cy + (sitting ? 209 : 262) * s;

type Who = 'daniel' | 'emma' | 'woman' | 'captain' | 'crew1';

const COMP: Record<Who, React.FC<any>> = {daniel: Daniel, emma: Emma, woman: OldWoman, captain: Captain, crew1: Crew1};

/** Big face close-up on a simple background. */
export const Closeup: React.FC<{
	who: Who;
	f: number;
	d: number;
	bg?: React.ReactNode;
	s?: number;
	cx?: number;
	cy?: number;
	push?: number;
	props?: Partial<StickProps>;
	color?: string;
}> = ({who, f, d, bg, s = 3.4, cx = 960, cy = 470, push = 0.06, props = {}, color = '#0a0f19'}) => {
	const C = COMP[who];
	return (
		<AbsoluteFill style={{background: color}}>
			<Cam f={f} d={d} from={{z: 1}} to={{z: 1 + push, cy: cy - 20}}>
				<Svg>
					{bg}
					<C x={cx} y={headY(cy, s)} s={s} frame={f} {...props} />
				</Svg>
			</Cam>
		</AbsoluteFill>
	);
};

/** Dark sea backdrop for close-ups on deck. */
export const SeaBg: React.FC<{f: number; calm?: number; mood?: 'night' | 'red' | 'dark'}> = ({f, calm = 0, mood = 'night'}) => <OceanNight f={f} horizon={620} calm={calm} mood={mood} />;

/** Plain chapter/time card. */
export const TimeCard: React.FC<{f: number; d: number; title: string; sub?: string}> = ({f, d, title, sub}) => {
	const o = clamp(f / 10) * clamp((d - f) / 8);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', opacity: o}}>
			<div style={{fontFamily: FONT.marker, fontSize: 96, color: '#f1f1f1', letterSpacing: 6}}>{title}</div>
			{sub ? <div style={{marginTop: 20, fontFamily: FONT.mono, fontSize: 46, color: '#9aa8bb', letterSpacing: 4}}>{sub}</div> : null}
		</AbsoluteFill>
	);
};

export const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;
