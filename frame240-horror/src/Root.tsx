import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {Frame240Horror} from './Frame240Horror';
import {REF_IDS, RefLayouts} from './dev/RefLayouts';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the ~10 minute YouTube cut, timed from the real voice files. */}
		<Composition
			id="Frame240Horror"
			component={Frame240Horror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Every line at its written pacing. */}
		<Composition
			id="Frame240HorrorFull"
			component={Frame240Horror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
		{/* Dev only: reference layouts for the image model (canvas pictures, location guides). */}
		<Composition id="RefLayouts" component={RefLayouts} durationInFrames={REF_IDS.length} fps={FPS} width={WIDTH} height={HEIGHT} />
	</>
);
