// The cast of "3:06" as painted puppets on the stick skeleton (heads, hair and torsos painted by the image
// model, cut out; arms, legs, eyes, brows and mouths drawn by the code so everything can animate).
import React from 'react';
import puppets from '../../data/generated/puppets.json';
import {StickPerson, type Paint, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
const PUP = puppets as unknown as Record<string, Paint>;
const mk = (base: Partial<StickProps> & {palette: StickProps['palette']}, who?: string, tune: Partial<Paint> = {}) => {
	const paint = who && PUP[who] ? {...PUP[who], ...tune} : undefined;
	const C: React.FC<P> = (p) => <StickPerson {...base} paint={paint} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	sarah: {skin: '#f1c596', shirt: '#7d8062', pants: '#9a9da3', hair: '#8a4a26', shoes: '#f1c596'}, // barefoot
	harris: {skin: '#e9c6a6', shirt: '#413328', pants: '#8f8f93', hair: '#d8d8d4', shoes: '#4a3524'},
};

export const Sarah = mk({female: true, seed: 71, palette: PAL.sarah}, 'sarah');
export const Harris = mk({seed: 72, palette: PAL.harris, mustache: undefined}, 'harris', {headScale: 0.95});
