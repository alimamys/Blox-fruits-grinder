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
	truckNight: '4 a.m. before dawn: the cold blue-black dark of the truck cab, the faint green glow of the dashboard, frost on the glass; outside, the black hill and the pale farmhouse.',
	houseNight: '4 a.m. outside the farmhouse: deep blue-black night, a thin grey moon, one upstairs window faintly lit from inside.',
	grey: 'A grey spring afternoon in rural Maine: soft flat overcast light, cool and pale, wind in the dry grass.',
	sickroom: 'Eli\'s bedroom on a grey spring day: soft flat window light through the thin white curtains, warm brown shadows, a quiet sick-room stillness.',
	morning: 'Morning in Eli\'s bedroom: pale gold sunlight through the thin curtains, dust floating in the light, warm and soft.',
	bedNight: 'Night in Eli\'s bedroom: only cold blue moonlight through the thin curtains, the room in deep shadow, pitch black under the bed.',
	hallDay: 'The upstairs hallway by day: dim, brown and long, grey light from the far doorway.',
	emptyDay: 'The empty room at the end of the hall on a grey afternoon: hard white light from the single tall window, bare floorboards, dust in the air.',
	emptyNight: 'The empty room at night: the tall window wide open onto a black sky, cold moonlight across the bare floorboards, the rest in blue-black shadow.',
	kitchenNight: 'The farmhouse kitchen late at night: one warm yellow ceiling bulb, packed boxes on the counters, black windows.',
	porch: 'A pale spring morning behind the farmhouse: thin cool sunlight, bare birches, the woods grey and still.',
	trail: 'Inside the woods on the deer trail: cool grey-green light under bare trees and pines, a carpet of dead brown leaves, an unnatural stillness.',
	present: 'An overcast autumn afternoon twenty-five years later: flat grey light, wind in dry weeds, muted colours.',
	cemetery: 'Deep in the woods: cold grey-green light under tall pines, moss and lichen on old stone, utterly still.',
	leoRoom: 'Morning in Leo\'s bedroom today: warm sunlight through the window, cozy and safe, blue walls and dinosaur toys.',
	leoDim: 'Leo\'s bedroom in the late afternoon, the warm light going dim and amber, long shadows under the bed.',
};
