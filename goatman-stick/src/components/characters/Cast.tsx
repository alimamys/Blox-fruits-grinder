// The cast of "11 of Us Went Camping" as stick figures, in the style of the earlier films.
// Colours follow the old character sheets so everyone stays recognisable.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
type Pal = StickProps['palette'];
const mk = (base: Partial<StickProps> & {palette: Pal}) => {
	const C: React.FC<P> = (p) => <StickPerson {...base} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	marcus: {skin: '#6b4630', shirt: '#8e2a2a', pants: '#1f2a44', hair: '#17110d', shoes: '#efefef'},
	marcusAdult: {skin: '#6b4630', shirt: '#4b5563', pants: '#2a2f3a', hair: '#17110d', shoes: '#d8d8d8'},
	wyatt: {skin: '#f1d0b5', shirt: '#5d6b3c', pants: '#5d6d86', hair: '#d9b45e', shoes: '#5a3d26'},
	dez: {skin: '#5a3a26', shirt: '#8a8f96', pants: '#1e1e1e', hair: '#141010', shoes: '#2a2a2a'},
	ray: {skin: '#7a5034', shirt: '#e2b33a', pants: '#b49a6e', hair: '#1a1410', shoes: '#d9d9d9'},
	nia: {skin: '#6e4a33', shirt: '#b49ad6', pants: '#1f1f24', hair: '#1a1410', shoes: '#ededed'},
	tasha: {skin: '#8a5c3c', shirt: '#e88a3a', pants: '#6e8db5', hair: '#1c1410', shoes: '#f0e6d6'},
	kayla: {skin: '#7b5236', shirt: '#e6a3b0', pants: '#2b2b30', hair: '#1a1410', shoes: '#ffffff'},
	lucia: {skin: '#c99a76', shirt: '#3e6b45', pants: '#2f3340', hair: '#2a1d14', shoes: '#8a6a4a'},
	jalen: {skin: '#4f3322', shirt: '#ece6d6', pants: '#2e2e33', hair: '#141010', shoes: '#ffffff'},
	andre: {skin: '#5e3d28', shirt: '#2c4f9a', pants: '#1f1f24', hair: '#141010', shoes: '#e0e0e0'},
	malik: {skin: '#8d6244', shirt: '#2a2f3a', pants: '#3a3f4a', hair: '#141010', shoes: '#cfcfcf'},
	dawes: {skin: '#e6b896', shirt: '#6a4a2e', pants: '#3d4f6e', hair: '#8a8a86', shoes: '#3a2a1c'},
	cole: {skin: '#e9c2a0', shirt: '#a8352c', pants: '#3d4f6e', hair: '#6b4a2e', shoes: '#3a2a1c'},
	// the thing, wearing Nia: same clothes, grey pallor
	wrongNia: {skin: '#a7a9a6', shirt: '#9d91ad', pants: '#1f1f24', hair: '#1a1410', shoes: '#cfcfcf'},
	// the one too many: an ordinary-looking teenager nobody can place
	stranger: {skin: '#8c6a52', shirt: '#5b5f66', pants: '#2a2d33', hair: '#1a1410', shoes: '#9a9a9a'},
	// the figures in the trees, facing away: all shadow
	shadow: {skin: '#15161a', shirt: '#121316', pants: '#101114', hair: '#0c0c0e', shoes: '#0c0c0e'},
};

export const Marcus = mk({hair: 'buzz', seed: 51, palette: PAL.marcus});
export const MarcusAdult = mk({hair: 'buzz', seed: 52, mustache: '#17110d', palette: PAL.marcusAdult});
export const Wyatt = mk({hair: 'medium', seed: 53, palette: PAL.wyatt});
export const Dez = mk({hair: 'buzz', seed: 54, palette: PAL.dez});
export const Ray = mk({hair: 'curly', glasses: true, seed: 55, palette: PAL.ray});
export const Nia = mk({hair: 'long', female: true, seed: 56, palette: PAL.nia});
export const Tasha = mk({hair: 'bun', female: true, seed: 57, palette: PAL.tasha});
export const Kayla = mk({hair: 'short', female: true, seed: 58, palette: PAL.kayla});
export const Lucia = mk({hair: 'long', female: true, seed: 59, palette: PAL.lucia});
export const Jalen = mk({hair: 'buzz', hat: 'cap', hatColor: '#b8322a', seed: 60, palette: PAL.jalen});
export const Andre = mk({hair: 'buzz', seed: 61, palette: PAL.andre});
export const Malik = mk({hair: 'short', seed: 62, palette: PAL.malik});
export const Dawes = mk({hair: 'grayShort', hat: 'cap', hatColor: '#4a5a36', mustache: '#9a9a96', wrinkles: true, seed: 63, palette: PAL.dawes});
export const Cole = mk({hair: 'buzz', seed: 64, palette: PAL.cole});
export const WrongNia = mk({hair: 'long', female: true, seed: 56, eyes: 'gray', mouth: 'open', palette: PAL.wrongNia});
export const Stranger = mk({hair: 'short', seed: 66, palette: PAL.stranger});
export const Shadow = mk({hair: 'none', seed: 65, eyes: 'none', mouth: 'flat', palette: PAL.shadow});

/** the eleven at the camp, in a fixed order (index 0 = Marcus) */
export const ELEVEN = [Marcus, Dez, Ray, Nia, Wyatt, Tasha, Kayla, Lucia, Jalen, Andre, Malik];
export const ELEVEN_NAMES = ['marcus', 'dez', 'ray', 'nia', 'wyatt', 'tasha', 'kayla', 'lucia', 'jalen', 'andre', 'malik'] as const;
/** scale per person (Dez is big, Ray is the youngest) */
export const ELEVEN_S = [1, 1.12, 0.9, 0.97, 1.02, 0.96, 0.95, 0.97, 1, 1.03, 1.01];
