import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {GoatmanHorror} from './GoatmanHorror';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the whole script (about 10:45), timed from the real voice files. */}
		<Composition
			id="GoatmanHorror"
			component={GoatmanHorror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Identical edit (kept for the shared tooling). */}
		<Composition
			id="GoatmanHorrorFull"
			component={GoatmanHorror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
	</>
);
