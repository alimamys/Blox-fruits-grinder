import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {Passenger63Horror} from './Passenger63Horror';
import {CharacterSheet} from './dev/CharacterSheet';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the ~10 minute YouTube cut, timed from the real voice files. */}
		<Composition
			id="Passenger63Horror"
			component={Passenger63Horror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* The complete story at its original pacing (~16 min). */}
		<Composition
			id="Passenger63HorrorFull"
			component={Passenger63Horror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
		{/* Dev only: the character rig on one page. */}
		<Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
	</>
);
