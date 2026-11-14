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
	trailerNight: 'Night inside the old camping trailer: one weak, warm ceiling light, deep brown shadows in the corners, pitch-black night outside the small windows.',
	trailerDark: 'Inside the trailer in near darkness: only a thin grey-blue glow from the window blind; deep black shadows.',
	day: 'A hot late-summer afternoon in the Alabama pine woods: warm golden sunlight slanting through the trunks, long shadows, dust in the air.',
	creek: 'A hot afternoon at the creek: dappled green-gold sunlight on the water, shade under the leaning trees.',
	dusk: 'Dusk in the pine woods: deep blue sky between the trunks, the last orange light, the woods turning black.',
	fire: 'Night in the clearing: the campfire throws warm orange light on faces and the trailer sides; beyond its circle the pine woods are pitch black.',
	trailNight: 'Night on the forest trail: black woods, only the hard white cones of flashlights picking out tree trunks and ferns.',
	morning: 'Early morning in the clearing: pale mist between the pines, cool grey-gold light.',
	afternoonStill: 'Late afternoon in the clearing, the light going amber and flat, the woods unnaturally still.',
	apartment: 'Night in a small Chicago apartment: the cold blue glow of the TV, one warm lamp, city lights through the window.',
};
