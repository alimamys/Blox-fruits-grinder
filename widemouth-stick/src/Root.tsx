import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {WidemouthHorror} from './WidemouthHorror';
import {StickSheet} from './dev/StickSheet';
import {Thumb} from './dev/Thumbs';
import {STICK_TEST_FRAMES, StickTest} from './dev/StickTest';

export const RemotionRoot: React.FC = () => (
	<>
		{/* Main composition: the whole script (about 10:45), timed from the real voice files. */}
		<Composition
			id="WidemouthHorror"
			component={WidemouthHorror}
			durationInFrames={TIMELINE.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={DEFAULT_SETTINGS}
		/>
		{/* Identical edit (kept for the shared tooling). */}
		<Composition
			id="WidemouthHorrorFull"
			component={WidemouthHorror}
			durationInFrames={TIMELINE_FULL.totalFrames}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
			defaultProps={{...DEFAULT_SETTINGS, edit: 'full' as const}}
		/>
		<Composition id="StickTest" component={StickTest} durationInFrames={STICK_TEST_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
		{(['A', 'B', 'C'] as const).map((v) => (
			<Composition key={v} id={`Thumb${v}`} component={Thumb} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{v}} />
		))}
		<Composition id="StickSheet" component={StickSheet} durationInFrames={48} fps={FPS} width={WIDTH} height={HEIGHT} />
	</>
);
