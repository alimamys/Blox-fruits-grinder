// Helpers shared by the scenes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captain, Crew1, Daniel, Emma, OldWoman} from '../components/characters/Cast';
import type {StickProps} from '../components/characters/StickPerson';
import {OceanNight} from '../components/environments/Outdoor';
import {FONT} from '../utils/fonts';
import {clamp} from '../utils/anim';
import {Cam, Svg, type SceneApi} from '../utils/scene';

/** Mouth openness (0..1) while any of the given lines is being spoken. */
export const talkOf = (api: SceneApi, sf: number, ...ids: string[]) => {
	for (const id of ids) {
		if (!api.has(id)) continue;
		const a = api.at(id);
		const b = api.end(id);
		if (sf >= a && sf < b - 2) return 0.35 + 0.65 * Math.abs(Math.sin((sf - a) * 0.75)) * (0.6 + 0.4 * Math.sin(sf * 0.31));
	}
	return 0;
};

/** y for a figure so that its head centre lands on `cy` at scale `s`. */
export const headY = (cy: number, s: number, sitting = false) => cy + (sitting ? 232 : 262) * s;

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
