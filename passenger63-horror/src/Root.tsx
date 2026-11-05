import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_TIGHT, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {Passenger63Horror} from './Passenger63Horror';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the complete story, timed from the real voice files. */}
		<Composition
			id="Passenger63Horror"
			component={Passenger63Horror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Shorter alternative edit (drops narration the picture already carries). */}
		<Composition
			id="Passenger63HorrorTight"
			component={Passenger63Horror}
			durationInFrames={TIMELINE_TIGHT.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'tight' as const}}
		/>
	</>
);
