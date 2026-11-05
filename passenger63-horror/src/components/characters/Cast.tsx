// Character presets - colours and features are fixed here so every character
// stays visually consistent for the whole video.
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
type PW = Omit<P, 'frame'> & {frame?: number | null};

export const PALETTES = {
	daniel: {skin: '#f1cfb0', shirt: '#2f63c4', pants: '#272a36', hair: '#2b1b12', shoes: '#151515'},
	emma: {skin: '#f3d3bd', shirt: '#7c1f33', pants: '#24232b', hair: '#2a1710', shoes: '#151515'},
	oldWoman: {skin: '#ece6dd', shirt: '#121214', pants: '#121214', hair: '#b5b5b2', shoes: '#0d0d0d'},
	captain: {skin: '#eac7a4', shirt: '#15264b', pants: '#101a33', hair: '#cfcfcf', shoes: '#0d0d0d'},
	crew1: {skin: '#d9a67c', shirt: '#1f3c6d', pants: '#1c2333', hair: '#20150e', shoes: '#111'},
	crew2: {skin: '#f0caa6', shirt: '#1f3c6d', pants: '#1c2333', hair: '#8a5a2b', shoes: '#111'},
	purser: {skin: '#c99772', shirt: '#1f3c6d', pants: '#1c2333', hair: '#111', shoes: '#111'},
	police: {skin: '#e3b894', shirt: '#1b2233', pants: '#151a26', hair: '#3a2a1f', shoes: '#0d0d0d'},
	operator: {skin: '#b98a63', shirt: '#4a5a6a', pants: '#2a2f38', hair: '#1a1a1a', shoes: '#111'},
};

export const CREW_STRIPE = '#e8c547';

/** DANIEL - blue jacket, dark trousers, short dark hair. */
export const Daniel: React.FC<P> = (p) => <StickPerson hair="short" seed={37} {...p} palette={p.palette ?? PALETTES.daniel} />;

/** EMMA - burgundy top, dark pants, medium-length dark hair. */
export const Emma: React.FC<P> = (p) => <StickPerson hair="medium" female seed={38} {...p} palette={p.palette ?? PALETTES.emma} />;

/**
 * THE OLD WOMAN - almost normal. Long black coat, silver brooch, grey bun, pale
 * face, grey dot eyes, faint smile, hands folded. Her outline NEVER boils (frame
 * null) - she is the only thing on screen that is perfectly still.
 */
export const OldWoman: React.FC<PW> = (p) => (
	<StickPerson
		hair="bun"
		female
		longCoat
		brooch
		wrinkles
		eyes="gray"
		mouth="faint"
		arms="folded"
		seed={63}
		{...p}
		frame={null}
		palette={p.palette ?? PALETTES.oldWoman}
	/>
);

/** CAPTAIN - older, navy uniform, captain hat, white mustache. */
export const Captain: React.FC<P> = (p) => (
	<StickPerson hair="grayShort" hat="captain" mustache="#e9e9e9" stripe="#d8b23a" wrinkles seed={8} {...p} palette={p.palette ?? PALETTES.captain} />
);

/** CREW 1 - young deckhand who approaches the woman. */
export const Crew1: React.FC<P> = (p) => <StickPerson hair="short" stripe={CREW_STRIPE} seed={11} {...p} palette={p.palette ?? PALETTES.crew1} />;

/** CREW 2 - steward who counts again. */
export const Crew2: React.FC<P> = (p) => <StickPerson hair="ponytail" female stripe={CREW_STRIPE} seed={12} {...p} palette={p.palette ?? PALETTES.crew2} />;

/** PURSER - glasses, same uniform. */
export const Purser: React.FC<P> = (p) => <StickPerson hair="buzz" glasses stripe={CREW_STRIPE} seed={13} {...p} palette={p.palette ?? PALETTES.purser} />;

export const PoliceOfficer: React.FC<P> = (p) => (
	<StickPerson hair="short" hat="police" vest="#c9e23d" vestText="POLICE" seed={21} {...p} palette={p.palette ?? PALETTES.police} />
);

export const HarborOperator: React.FC<P> = (p) => <StickPerson hair="curly" glasses seed={30} {...p} palette={p.palette ?? PALETTES.operator} />;

const PASSENGER_COLORS = ['#6d8f4e', '#b8743a', '#5e5a8a', '#8a3b3b', '#3d7a7a', '#9a8a4a', '#4f5f74', '#7a5a7a', '#a66', '#567'];
const SKINS = ['#f1cfb0', '#d9a67c', '#8d5b3d', '#f3d3bd', '#c99772', '#e8bfa0', '#6b4630'];
const HAIRS = ['#2b1b12', '#111', '#6b4a2b', '#b08a4a', '#3a2a1f', '#999', '#5a2a1a'];
const HAIR_STYLES = ['short', 'medium', 'curly', 'ponytail', 'buzz', 'long', 'short'] as const;

/** Generic passenger, deterministic look from `id`. */
export const Passenger: React.FC<P & {id: number}> = ({id, ...p}) => (
	<StickPerson
		hair={HAIR_STYLES[id % HAIR_STYLES.length]}
		female={id % 2 === 0}
		seed={100 + id}
		{...p}
		palette={
			p.palette ?? {
				skin: SKINS[(id * 3) % SKINS.length],
				shirt: PASSENGER_COLORS[(id * 7) % PASSENGER_COLORS.length],
				pants: id % 3 === 0 ? '#3b4a6b' : '#2a2a30',
				hair: HAIRS[(id * 5) % HAIRS.length],
				shoes: '#151515',
			}
		}
	/>
);
