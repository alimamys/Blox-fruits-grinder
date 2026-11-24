import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {RakeHorror} from './RakeHorror';
import {Sheet, SHEET_FRAMES} from './dev/Sheet';
import {Thumb} from './dev/Thumbs';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the ~10 minute YouTube cut, timed from the real voice files. */}
		<Composition
			id="RakeHorror"
			component={RakeHorror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Every line at its written pacing. */}
		<Composition
			id="RakeHorrorFull"
			component={RakeHorror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
		{/* Dev only: one frame per set-up (cast, the thing, sets). */}
		<Composition id="Sheet" component={Sheet} durationInFrames={SHEET_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
		{(['A', 'B', 'C'] as const).map((v) => (
			<Composition key={v} id={`Thumb${v}`} component={Thumb} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{v}} />
		))}
	</>
);
