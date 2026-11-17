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

/** Colour moods (sent with every image request of the scene). */
export const MOOD = {
	hall: 'Night, 3:06 am: the corridor\'s fluorescent tubes give a sickly yellow-green light; cold blue shadows; the stairwell opening black.',
	hallDark: 'Near darkness: one flickering fluorescent tube, sickly yellow-green light in short bursts, deep blue-black shadows.',
	flat: 'Night inside Sarah\'s flat, lights off: deep blue shadows, orange streetlight in stripes through the blinds, a thin yellow-green line of corridor light under the front door.',
	peep: 'Seen through a door peephole: the corridor\'s yellow-green fluorescent light, cold shadows.',
	bedroom: 'Night, dark blue bedroom, orange stripes of streetlight across the bed.',
	stair: 'The dark stairwell: one dim caged bulb flickering, sickly green-grey light, the lower flights fading into black.',
	day: 'Three weeks earlier, a calm overcast afternoon: soft daylight, muted warm colours - ordinary and safe.',
	night: 'Night, about 3 am: deep blue, one sodium streetlight, every window dark.',
	morning: 'The following morning: clean warm sunlight, birds, an ordinary bright day.',
	office: 'Morning in the landlord\'s office: warm daylight through dusty blinds, the green desk lamp on.',
};
