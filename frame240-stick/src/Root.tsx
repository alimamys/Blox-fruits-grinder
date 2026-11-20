import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {Frame240Horror} from './Frame240Horror';
import {Sheet, SHEET_FRAMES} from './dev/Sheet';
import {Thumb} from './dev/Thumbs';

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
		{/* Dev only: one frame per set-up (cast, sets, screens). */}
		<Composition id="Sheet" component={Sheet} durationInFrames={SHEET_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
		{(['A', 'B', 'C'] as const).map((v) => (
			<Composition key={v} id={`Thumb${v}`} component={Thumb} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{v}} />
		))}
	</>
);
