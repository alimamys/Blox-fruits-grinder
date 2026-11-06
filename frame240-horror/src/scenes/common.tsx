// Helpers shared by the scenes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {envelopeAt, visemeAt, type Viseme} from '../data/speech';
import {FPS} from '../data/timeline';
import {isLayoutKey, Stage, type CamPos, type SceneApi} from '../utils/scene';

/**
 * Lip sync for the code layouts (preview before the art exists): mouth openness while
 * any of the lines is spoken. Layout keyframes for the image model always have the mouth
 * CLOSED - the open-mouth variant is generated separately.
 */
export const speak = (api: SceneApi, sf: number, ...ids: string[]): {talk: number; viseme: Viseme} => {
	if (isLayoutKey()) return {talk: 0, viseme: 'm'};
	for (const id of ids) {
		if (!api.has(id)) continue;
		const a = api.at(id);
		const b = api.end(id);
		if (sf >= a && sf < b) {
			const t = (sf - a) / FPS;
			const env = envelopeAt(id, t);
			if (env === null) return {talk: 0.3 + 0.6 * Math.abs(Math.sin((sf - a) * 0.75)), viseme: 'a'};
			return {talk: env, viseme: visemeAt(id, t)};
		}
	}
	return {talk: 0, viseme: 'm'};
};

export const mouthOf = (api: SceneApi, sf: number, ...ids: string[]) => speak(api, sf, ...ids).talk;

/** Progress 0..1 through a shot with an ease. */
export const prog = (f: number, d: number, a = 0, b = 1) => {
	const t = Math.min(1, Math.max(0, (f / Math.max(1, d - 1) - a) / Math.max(0.001, b - a)));
	return t * t * (3 - 2 * t);
};

export const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;
export const White: React.FC = () => <AbsoluteFill style={{background: '#f6f6f3'}} />;

/** Shorthand: an SVG stage with an optional camera move. */
export const S: React.FC<{f: number; d: number; from?: CamPos; to?: CamPos; bg?: string; hand?: number; children: React.ReactNode}> = ({f, d, from, to, bg, hand, children}) => (
	<Stage f={f} d={d} from={from} to={to} bg={bg} hand={hand}>
		{children}
	</Stage>
);

/** Colour moods per scene (sent with every image request of the scene). */
export const MOOD = {
	open: 'Night. Near-black room, cold monitor blue on her face, deep shadows.',
	night: 'Night, rain on the window: cold blue moonlight against the warm-white glow of the monitor on her face.',
	cold: 'Cold blue night; the monitor is the only light on her face, deep shadows around her.',
	phone: 'Dark room; the glow of her phone and the monitor on her face.',
	flash: 'Darkness; the only light is the white cone of her phone flashlight, hard shadows.',
	red: 'Cold blue night with one vivid red accent; the monitor light on her face.',
	whiteGlow: 'The monitor is a bright white rectangle that lights her face pure white; everything else dark.',
	drained: 'Colours drained to pale greys and whites, almost no shadows - like an unfinished drawing; soft flat light.',
	white: 'Harsh white flashlight on flat white walls; almost no shadows; cold and empty.',
	closet: 'A dark closet; her phone screen is the only light, cold white-blue on her face, deep black around her.',
};
