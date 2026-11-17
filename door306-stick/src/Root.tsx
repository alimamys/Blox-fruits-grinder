import React from 'react';
import {Composition} from 'remotion';
import {Thumb} from './dev/Thumbs';
import {PuppetSheet} from './dev/PuppetSheet';
import {PUPPET_TEST_FRAMES, PuppetTest} from './dev/PuppetTest';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {Door306Horror} from './Door306Horror';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the whole script (12-13 min), timed from the real voice files. */}
		<Composition
			id="Door306Horror"
			component={Door306Horror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Identical edit (kept for the shared tooling). */}
		<Composition
			id="Door306HorrorFull"
			component={Door306Horror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
		<Composition id="PuppetSheet" component={PuppetSheet} durationInFrames={48} fps={24} width={1920} height={1080} />
		<Composition id="PuppetTest" component={PuppetTest} durationInFrames={PUPPET_TEST_FRAMES} fps={24} width={1920} height={1080} />
		{(['A', 'B', 'C'] as const).map((v) => (
			<Composition key={v} id={`Thumb${v}`} component={Thumb} durationInFrames={1} fps={24} width={1920} height={1080} defaultProps={{v}} />
		))}
	</>
);
