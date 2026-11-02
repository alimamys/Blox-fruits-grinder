// Cast presets so every character looks the same in every scene.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../utils/palette';
import type {StickPersonProps} from './StickPerson';
import {StickPerson} from './StickPerson';

type P = Omit<StickPersonProps, 'x' | 'y'> & {x: number; y: number};

/** Natural blinking: returns true for ~3 frames every few seconds. */
export const useBlink = (seed = 0, every = 97): boolean => {
	const f = useCurrentFrame();
	return (f + seed * 37) % every < 3;
};

/** Adam: pale round face, short black hair, blue shirt, dark pants. */
export const Adam: React.FC<P> = (p) => {
	const blink = useBlink(1);
	return <StickPerson shirt={C.blue} pants={C.pants} skin={C.skin} hair="short" hairColor={C.hair} outfit="tee" seed={1} blink={blink} {...p} />;
};

/** The neighbour in 6A: bald with side tufts, moustache. */
export const Neighbor: React.FC<P> = (p) => {
	const blink = useBlink(2, 83);
	return <StickPerson shirt={C.green} pants="#3a3a4a" hair="sideTufts" hairColor="#6b5a4a" mustache seed={2} blink={blink} {...p} />;
};

/** Victor Hale: thin, pale, slicked hair, old brown cardigan, bare feet. */
export const Victor: React.FC<P> = (p) => (
	<StickPerson shirt="#6d5a3a" pants="#4a4234" hair="slick" hairColor="#4b4439" outfit="cardigan" build="thin" barefoot skin={C.victorSkin} seed={3} {...p} />
);

/** Market seller: cap, beard, glasses, brown vest. */
export const Seller: React.FC<P> = (p) => {
	const blink = useBlink(4, 71);
	return <StickPerson shirt={C.brown} pants="#3b3b3b" hair="cap" hairColor="#5a3a1a" outfit="vest" beard glasses seed={4} blink={blink} {...p} />;
};

/** Daniel: university student, curly brown hair, green hoodie. */
export const Daniel: React.FC<P> = (p) => {
	const blink = useBlink(5, 89);
	return <StickPerson shirt="#3e8e4a" pants="#2a3550" hair="curly" hairColor="#6b3e1e" outfit="hoodie" seed={5} blink={blink} {...p} />;
};

export const Police: React.FC<P> = (p) => <StickPerson shirt={C.navy} pants={C.navy} hair="police" outfit="uniform" seed={6} {...p} />;

export const BlueCoatWoman: React.FC<P> = (p) => <StickPerson shirt={C.blueDark} pants={C.ink} hair="long" hairColor={C.ink} outfit="coat" seed={7} {...p} />;
