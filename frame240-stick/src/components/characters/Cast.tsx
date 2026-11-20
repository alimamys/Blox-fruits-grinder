// The cast of "Frame 240" as code-drawn stick figures (the look of the stick Mr. Widemouth, Goatman and 3:06):
// round heads, dot eyes, tube limbs, thick hand-drawn outlines, flat colours. Hana is a voice on the phone only;
// the man is drawn by TallMan (src/stick/f240.tsx).
import React from 'react';
import {StickPerson, type StickProps} from './StickPerson';

type P = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};

// Mara: early thirties, oversized burnt-orange sweatshirt, dark grey joggers, grey socks, brown hair in a messy bun
export const PAL = {
	mara: {skin: '#efc6a2', shirt: '#c4572a', pants: '#45474d', hair: '#4b2f20', shoes: '#a3a39e'},
};

export const Mara: React.FC<P> = (p) => <StickPerson female hair="bun" seed={41} {...p} palette={p.palette ?? PAL.mara} />;
