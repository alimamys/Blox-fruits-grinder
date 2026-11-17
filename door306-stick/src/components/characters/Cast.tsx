// The cast of "3:06" as code-drawn stick figures (the look of the new Mr. Widemouth and Goatman): round heads,
// dot eyes, tube limbs, thick hand-drawn outlines, flat colours. Colours follow the original character sheets.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
const mk = (base: Partial<StickProps> & {palette: StickProps['palette']}) => {
	const C: React.FC<P> = (p) => <StickPerson {...base} {...p} palette={p.palette ?? base.palette} />;
	return C;
};

export const PAL = {
	sarah: {skin: '#f3d2b8', shirt: '#7f9a6e', pants: '#a3a6ad', hair: '#a4482a', shoes: '#f3d2b8'}, // sage pyjama top, barefoot
	harris: {skin: '#ecc9a8', shirt: '#5a4030', pants: '#8f8f93', hair: '#e2e2de', shoes: '#4a3524'}, // brown cardigan
	mother: {skin: '#efc49a', shirt: '#8b8f99', pants: '#9db4d0', hair: '#141414', shoes: '#efc49a'}, // grey cardigan, blue nightgown
	boy: {skin: '#e9bb93', shirt: '#22365e', pants: '#22365e', hair: '#141414', shoes: '#e9bb93'}, // star pyjamas
	oldman: {skin: '#ecbb92', shirt: '#dcd6cc', pants: '#cfc9c0', hair: '#ececea', shoes: '#5a4a3a'}, // striped pyjamas
	robeman: {skin: '#e9ad80', shirt: '#1f3150', pants: '#1f3150', hair: '#8a8a86', shoes: '#3a3a40'}, // navy bathrobe
	tshirt: {skin: '#7a4f33', shirt: '#f2f0ec', pants: '#a03030', hair: '#141414', shoes: '#7a4f33'}, // white T-shirt, plaid trousers
	shawl: {skin: '#c48f66', shirt: '#e6d6b8', pants: '#efe9de', hair: '#3a2416', shoes: '#e2d6c0'}, // cream blanket
	robewoman: {skin: '#ebb88a', shirt: '#a985b8', pants: '#a985b8', hair: '#a3a3a3', shoes: '#b7a1c4'}, // lilac gown
	landlord: {skin: '#e6b086', shirt: '#4d525a', pants: '#4a3a2c', hair: '#7a6450', shoes: '#2a1d14'}, // grey sweater vest
};

export const Sarah = mk({female: true, hair: 'medium', seed: 71, palette: PAL.sarah});
export const Harris = mk({hair: 'grayShort', wrinkles: true, glasses: false, seed: 72, palette: {...PAL.harris, shirt: '#ece4d4'}, open: '#5a4030'});
export const Mother = mk({female: true, hair: 'medium', seed: 73, palette: {...PAL.mother, shirt: '#9db4d0'}, open: '#8b8f99'});
export const Boy = mk({child: true, hair: 'short', seed: 74, palette: PAL.boy, stripe: '#e8c84a'});
export const OldMan = mk({hair: 'grayShort', wrinkles: true, seed: 75, palette: PAL.oldman, pj: '#b9b3a8'});
export const RobeMan = mk({hair: 'grayShort', mustache: '#9a9a96', seed: 76, palette: PAL.robeman, stripe: '#2c4570'});
export const TShirt = mk({hair: 'buzz', mustache: '#141414', seed: 77, palette: PAL.tshirt});
export const Shawl = mk({female: true, hair: 'curly', seed: 78, palette: {...PAL.shawl, shirt: '#efe9de'}, open: '#e6d6b8'});
export const RobeWoman = mk({female: true, hair: 'curly', wrinkles: true, seed: 79, palette: {...PAL.robewoman, shirt: '#efe4d0'}, open: '#a985b8'});
export const Landlord = mk({hair: 'short', seed: 80, palette: {...PAL.landlord, shirt: '#8aa6c8'}, sweater: '#4d525a'});

export const RESIDENTS = {mother: Mother, boy: Boy, oldman: OldMan, robeman: RobeMan, tshirt: TShirt, shawl: Shawl, robewoman: RobeWoman, harris: Harris};
