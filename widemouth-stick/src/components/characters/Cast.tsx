// The cast of "Mr. Widemouth" as stick figures, in the style of the earlier films (The Missing Passenger,
// The Radio Station, Floor 14): round heads, dot eyes, tube limbs, thick hand-drawn outlines, flat colours.
// Colours and features are fixed here so every character stays the same for the whole film.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};

export const PALETTES = {
	eli: {skin: '#f3d4bb', shirt: '#6f93c8', pants: '#6f93c8', hair: '#8a5a2b', shoes: '#e9e4d8'}, // blue pyjamas, socks
	eliDay: {skin: '#f3d4bb', shirt: '#2f63c4', pants: '#3b4a6b', hair: '#8a5a2b', shoes: '#ddd'},
	mom: {skin: '#f2d2bd', shirt: '#e6d8b8', pants: '#3b5a86', hair: '#a4482a', shoes: '#4a3524'}, // cream cardigan, jeans
	dad: {skin: '#e8c4a2', shirt: '#22314f', pants: '#3b5a86', hair: '#3a2a1c', shoes: '#2a1d14'}, // navy work jacket
	eliAdult: {skin: '#efcfb0', shirt: '#2f5a3a', pants: '#1f2b3d', hair: '#7a5230', shoes: '#4a3524'}, // green flannel
	leo: {skin: '#f5d8c2', shirt: '#e8dcb4', pants: '#e8dcb4', hair: '#a06a35', shoes: '#ffffff'}, // dinosaur pyjamas
};

/** ELI at five: small, messy brown hair, blue-and-white striped pyjamas. */
export const Eli: React.FC<P> = (p) => <StickPerson child hair="short" seed={41} {...p} pj={p.pj ?? (!p.palette || p.palette === PALETTES.eli ? '#e9eef6' : undefined)} palette={p.palette ?? PALETTES.eli} />;

/** MOM: auburn ponytail, cream cardigan, jeans. */
export const Mom: React.FC<P> = (p) => <StickPerson female hair="ponytail" seed={42} {...p} palette={p.palette ?? PALETTES.mom} />;

/** DAD: short dark hair, glasses, navy work jacket. */
export const Dad: React.FC<P> = (p) => <StickPerson hair="short" glasses seed={43} {...p} palette={p.palette ?? PALETTES.dad} />;

/** ELI at thirty: same brown hair, green flannel. */
export const EliAdult: React.FC<P> = (p) => <StickPerson hair="short" seed={44} {...p} palette={p.palette ?? PALETTES.eliAdult} />;

/** LEO, his son, five: curly hair, cream dinosaur pyjamas. */
export const Leo: React.FC<P> = (p) => <StickPerson child hair="curly" pj="#9cc48f" seed={45} {...p} palette={p.palette ?? PALETTES.leo} />;

/** The family doctor: white coat, grey hair, glasses. */
export const Doctor: React.FC<P> = (p) => (
	<StickPerson hair="grayShort" glasses longCoat seed={46} {...p} palette={p.palette ?? {skin: '#e9c9a8', shirt: '#f1f1ee', pants: '#4a4f58', hair: '#b9b9b9', shoes: '#2a1d14'}} />
);
