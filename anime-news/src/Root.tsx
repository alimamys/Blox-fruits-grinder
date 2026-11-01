import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, PREVIEW_FRAMES, TOTAL_FRAMES, WIDTH} from './lib/timeline';
import {Video} from './Video';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Opening preview: 20 s, extended to the end of the sentence running at 20 s */}
		<Composition
			id="OpeningPreview"
			component={Video}
			durationInFrames={PREVIEW_FRAMES}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{mode: 'preview' as const, durationInFrames: PREVIEW_FRAMES}}
		/>
		{/* Full edition: S01 + S02 opening built, remaining chapters as a timed animatic */}
		<Composition
			id="Main"
			component={Video}
			durationInFrames={TOTAL_FRAMES}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{mode: 'main' as const, durationInFrames: TOTAL_FRAMES}}
		/>
	</>
);
