// The cast of "3:06" as painted puppets on the stick skeleton (heads, hair and torsos painted by the image
// model, cut out; arms, legs, eyes, brows and mouths drawn by the code so everything can animate).
import React from 'react';
import puppets from '../../data/generated/puppets.json';
import {StickPerson, type Paint, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
const PUP = puppets as unknown as Record<string, Paint>;
const mk = (base: Partial<StickProps> & {palette: StickProps['palette']}, who: string, tune: Partial<Paint> = {}) => {
	const paint = PUP[who] ? {...PUP[who], ...tune} : undefined;
	const C: React.FC<P> = (p) => <StickPerson {...base} paint={paint} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	sarah: {skin: '#f1c596', shirt: '#7d8062', pants: '#9a9da3', hair: '#8a4a26', shoes: '#f1c596'}, // barefoot
	harris: {skin: '#e9c6a6', shirt: '#413328', pants: '#8f8f93', hair: '#d8d8d4', shoes: '#4a3524'},
	mother: {skin: '#ebbe89', shirt: '#7c7571', pants: '#9db4d0', hair: '#141414', shoes: '#ebbe89'},
	boy: {skin: '#e1b089', shirt: '#182c4b', pants: '#182c4b', hair: '#141414', shoes: '#e1b089'},
	oldman: {skin: '#ecbb92', shirt: '#dbd5cd', pants: '#cfc9c0', hair: '#e6e6e2', shoes: '#5a4a3a'},
	robeman: {skin: '#e9ad80', shirt: '#1d2c44', pants: '#1d2c44', hair: '#8a8a86', shoes: '#3a3a40'},
	tshirt: {skin: '#865839', shirt: '#865839', pants: '#8a2b2b', hair: '#141414', shoes: '#865839'}, // bare arms, plaid pyjama trousers
	shawl: {skin: '#be8b63', shirt: '#d4c3a8', pants: '#ebe6dc', hair: '#3a2416', shoes: '#e2d6c0'},
	robewoman: {skin: '#e5b283', shirt: '#a685b2', pants: '#a685b2', hair: '#9a9a9a', shoes: '#b7a1c4'},
	landlord: {skin: '#e3ad81', shirt: '#8aa6c8', pants: '#4a3a2c', hair: '#7a6450', shoes: '#2a1d14'},
};

export const Sarah = mk({female: true, seed: 71, palette: PAL.sarah}, 'sarah');
export const Harris = mk({seed: 72, palette: PAL.harris}, 'harris');
export const Mother = mk({female: true, seed: 73, palette: PAL.mother}, 'mother');
export const Boy = mk({child: true, seed: 74, palette: PAL.boy}, 'boy');
export const OldMan = mk({seed: 75, palette: PAL.oldman, wrinkles: true}, 'oldman');
export const RobeMan = mk({seed: 76, palette: PAL.robeman, mustache: '#9a9a96'}, 'robeman');
export const TShirt = mk({seed: 77, palette: PAL.tshirt}, 'tshirt');
export const Shawl = mk({female: true, seed: 78, palette: PAL.shawl}, 'shawl');
export const RobeWoman = mk({female: true, seed: 79, palette: PAL.robewoman, wrinkles: true}, 'robewoman');
export const Landlord = mk({seed: 80, palette: PAL.landlord}, 'landlord');

/** the five residents + the mother and boy, in a fixed order */
export const RESIDENTS = {mother: Mother, boy: Boy, oldman: OldMan, robeman: RobeMan, tshirt: TShirt, shawl: Shawl, robewoman: RobeWoman, harris: Harris};
