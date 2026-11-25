// The cast of "The Jinn Wedding" as code-drawn stick figures (the look of the stick Mr. Widemouth, Goatman, 3:06 and
// The Rake): round heads, dot eyes, thick hand-drawn outlines, flat colours - dressed for Kuwait: daraa and shayla for
// the women, dishdasha and ghutra for the men, shining gowns and gold for the wedding guests.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
const mk = (base: Partial<StickProps> & {palette: StickProps['palette']}) => {
	const C: React.FC<P> = (p) => <StickPerson {...base} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	yadda: {skin: '#c99872', shirt: '#4a2a3e', pants: '#4a2a3e', hair: '#d6d2cc', shoes: '#2a2228'},
	girl: {skin: '#d7a77c', shirt: '#e99ab9', pants: '#e99ab9', hair: '#2a1c14', shoes: '#f4e9d6'},
	noura: {skin: '#c99068', shirt: '#a8323c', pants: '#a8323c', hair: '#1c1410', shoes: '#c9a23a'},
	band1: {skin: '#bf8a62', shirt: '#2f6f6a', pants: '#2f6f6a', hair: '#1c1410', shoes: '#c9a23a'},
	band2: {skin: '#d2a07a', shirt: '#c8742c', pants: '#c8742c', hair: '#1c1410', shoes: '#c9a23a'},
	drummer: {skin: '#d6a47c', shirt: '#6a4a9c', pants: '#6a4a9c', hair: '#1c1410', shoes: '#c9a23a'},
	mother: {skin: '#d9c2b0', shirt: '#121216', pants: '#121216', hair: '#0c0c0c', shoes: '#121216'},
	bride: {skin: '#e0c4ac', shirt: '#f6f1e8', pants: '#f6f1e8', hair: '#0c0c0c', shoes: '#f6f1e8'},
	driver: {skin: '#b07e58', shirt: '#eeeae0', pants: '#eeeae0', hair: '#1c1410', shoes: '#3a2a20'},
	man: {skin: '#a87650', shirt: '#e4dccb', pants: '#e4dccb', hair: '#bdb8b0', shoes: '#5a4030'},
};

/** Yadda, the grandmother in the majlis: black shayla, a plum daraa with gold embroidery, glasses */
export const Yadda = mk({female: true, hair: 'grayShort', seed: 61, palette: PAL.yadda, headwear: 'shayla', headwearColor: '#16141a', robe: {color: '#4a2a3e', trim: '#d6a83c', to: 'floor', flare: 18}, glasses: true, wrinkles: true});
/** the little girl, seven: a pink jalabiya, a ponytail */
export const Girl = mk({female: true, child: true, hair: 'ponytail', seed: 62, palette: PAL.girl, robe: {color: '#e99ab9', trim: '#ffffff', to: 'ankle', flare: 12}});
/** Noura the taqaqa: a red daraa with gold, a cream shayla, gold */
export const Noura = mk({female: true, hair: 'medium', seed: 63, palette: PAL.noura, headwear: 'shayla', headwearColor: '#efe2c4', robe: {color: '#a8323c', trim: '#e3b74a', to: 'floor', flare: 20}, gold: true});
/** the other women in her band */
export const Band1 = mk({female: true, hair: 'medium', seed: 64, palette: PAL.band1, headwear: 'shayla', headwearColor: '#1f2a33', robe: {color: '#2f6f6a', trim: '#e3b74a', to: 'floor', flare: 18}});
export const Band2 = mk({female: true, hair: 'medium', seed: 65, palette: PAL.band2, headwear: 'shayla', headwearColor: '#3a2418', robe: {color: '#c8742c', trim: '#f2e2b0', to: 'floor', flare: 18}});
/** the youngest drummer, about nineteen */
export const Drummer = mk({female: true, hair: 'medium', seed: 66, palette: PAL.drummer, headwear: 'shayla', headwearColor: '#d9c6e8', robe: {color: '#6a4a9c', trim: '#e3b74a', to: 'floor', flare: 16}});
/** the mother of the bride: very pale, a black abaya shot with gold, gold - and too calm */
export const Mother = mk({female: true, hair: 'bun', seed: 67, palette: PAL.mother, headwear: 'shayla', headwearColor: '#0e0e12', robe: {color: '#121216', trim: '#d9b24a', to: 'floor', flare: 24, shine: true}, gold: true});
/** the bride: a white gown, a heavy veil over her face */
export const Bride = mk({female: true, hair: 'long', seed: 68, palette: PAL.bride, headwear: 'veil', robe: {color: '#f6f1e8', trim: '#e3c46a', to: 'floor', flare: 30, shine: true}, gold: true});
/** the silent driver: white dishdasha and ghutra */
export const Driver = mk({hair: 'short', seed: 69, palette: PAL.driver, headwear: 'ghutra', robe: {color: '#eeeae0', to: 'ankle', flare: 8}});
/** the man at dawn: an old man, a red-checked ghutra, a grey moustache */
export const OldMan = mk({hair: 'grayShort', seed: 70, palette: PAL.man, headwear: 'ghutra', headwearColor: '#d7574c', robe: {color: '#e4dccb', to: 'ankle', flare: 8}, mustache: '#cfcac2', wrinkles: true});

/** the wedding guests: women in shining gowns (no head covering in the women's hall), gold, hair up or down */
const GUEST_GOWNS = ['#7a1f4a', '#1f5a7a', '#2c7a4a', '#9a7a1c', '#5a2c8a', '#a0402c', '#1f6f6a', '#8a2c6a', '#3a4a9a', '#b0603a'];
const GUEST_HAIR: Array<StickProps['hair']> = ['long', 'bun', 'medium', 'long', 'bun'];
const GUEST_SKIN = ['#d9c2b0', '#e2cbb8', '#d4b9a4', '#dcc6b2'];
export const Guest: React.FC<P & {n: number}> = ({n, ...p}) => {
	const gown = GUEST_GOWNS[n % GUEST_GOWNS.length];
	const pal = {skin: GUEST_SKIN[n % GUEST_SKIN.length], shirt: gown, pants: gown, hair: '#0e0c0a', shoes: '#d9b24a'};
	return <StickPerson female hair={GUEST_HAIR[n % GUEST_HAIR.length]} seed={80 + n} palette={pal} robe={{color: gown, trim: '#e3c46a', to: 'floor', flare: 22 + (n % 3) * 4, shine: true}} gold {...p} />;
};
