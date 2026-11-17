import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TIMELINE, TIMELINE_FULL, WIDTH} from './data/timeline';
import {DEFAULT_SETTINGS} from './data/settings';
import {WidemouthHorror} from './WidemouthHorror';
import {TikTokPart, tiktokDuration, type TikTokProps} from './TikTok';

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
		{/* TikTok episodes (vertical): render with --props='{"part":1,"total":6,"from":0,"to":116.5}' */}
		<Composition
			id="TikTokPart"
			component={TikTokPart}
			durationInFrames={tiktokDuration({part: 1, total: 6, from: 0, to: 116.5})}
			fps={FPS}
			width={1080}
			height={1920}
			defaultProps={{part: 1, total: 6, from: 0, to: 116.5} as TikTokProps}
			calculateMetadata={({props}) => ({durationInFrames: tiktokDuration(props)})}
		/>
	</>
);
