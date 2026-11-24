// The cast of "The Rake" as code-drawn stick figures (the look of the stick Mr. Widemouth, Goatman and 3:06):
// round heads, dot eyes, tube limbs, thick hand-drawn outlines, flat colours. The thing itself is in src/stick/rake.tsx.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
const mk = (base: Partial<StickProps> & {palette: StickProps['palette']}) => {
	const C: React.FC<P> = (p) => <StickPerson {...base} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	lily: {skin: '#f1cfae', shirt: '#e7a9bb', pants: '#e7a9bb', hair: '#6b3f24', shoes: '#f1cfae'}, // pink pyjamas, barefoot
	lilyDay: {skin: '#f1cfae', shirt: '#f2c94c', pants: '#4f6fa6', hair: '#6b3f24', shoes: '#e9e9e9'}, // yellow T-shirt, jeans
	dad: {skin: '#e6bd98', shirt: '#5b7fa6', pants: '#3d3f46', hair: '#3b2a1e', shoes: '#2a2522'}, // blue shirt
	mom: {skin: '#f0c9a6', shirt: '#9db4d0', pants: '#9db4d0', hair: '#c8955a', shoes: '#f0c9a6'}, // blue nightgown
	lilyAdult: {skin: '#f1cfae', shirt: '#7d5f8f', pants: '#3d3f46', hair: '#6b3f24', shoes: '#2a2522'}, // plum sweater
	son: {skin: '#ecc6a2', shirt: '#4c8a5a', pants: '#3d4a60', hair: '#4a3020', shoes: '#ecc6a2'}, // green T-shirt
};

/** Lily at nine (pyjamas by default; pass palette={PAL.lilyDay} in daytime) */
export const Lily = mk({female: true, child: true, hair: 'ponytail', seed: 51, palette: PAL.lily, pj: '#f6d3dc'});
export const Dad = mk({hair: 'short', seed: 52, palette: PAL.dad});
export const Mom = mk({female: true, hair: 'medium', seed: 53, palette: PAL.mom});
/** Lily today, at 34 */
export const LilyAdult = mk({female: true, hair: 'long', seed: 54, palette: PAL.lilyAdult});
export const Son = mk({child: true, hair: 'short', seed: 55, palette: PAL.son});
