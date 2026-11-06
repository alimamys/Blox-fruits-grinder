// Dev composition "RefLayouts": one frame per reference layout, rendered by
// scripts/images/pictures.mjs for the image model:
//   - pic:<id>  the canvas pictures shown on screens (src/layout/pictures.tsx)
//   - loc:<id>  composition guides for the location references (lookdev)
import React from 'react';
import {AbsoluteFill, getInputProps, useCurrentFrame} from 'remotion';
import {Hallway} from '../layout/Hallway';
import {PICTURES, PictureLayout, type PicId} from '../layout/pictures';
import {Closet, Exterior, Workroom} from '../layout/Rooms';

const LOCS: Record<string, React.ReactNode> = {
	workroom: <Workroom view="wide" hall={{light: 'night'}} />,
	hallway: <Hallway light="night" />,
	closet: <Closet view="wide" />,
	white: <Hallway light="white" flat noDoor={false} />,
	exterior: <Exterior />,
};

export const REF_IDS: string[] = [...Object.keys(PICTURES).map((p) => `pic:${p}`), ...Object.keys(LOCS).map((l) => `loc:${l}`)];

export const RefLayouts: React.FC = () => {
	const f = useCurrentFrame();
	const id = REF_IDS[Math.min(REF_IDS.length - 1, f)];
	if ((getInputProps() as {logRefs?: boolean}).logRefs && f === 0) {
		console.log('F240REFS ' + JSON.stringify({ids: REF_IDS, pictures: PICTURES}));
	}
	const [kind, name] = id.split(':');
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg viewBox="0 0 1920 1080" style={{width: '100%', height: '100%'}}>
				{kind === 'pic' ? <PictureLayout id={name as PicId} /> : LOCS[name]}
			</svg>
		</AbsoluteFill>
	);
};
