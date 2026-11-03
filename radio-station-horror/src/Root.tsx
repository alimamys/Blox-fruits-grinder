import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {COMPOSITION_ID, DEFAULT_PROPS, FPS, HEIGHT, WIDTH} from './config';
import {TOTAL_FRAMES} from './data/timeline';
import type {ContactSheetProps} from './dev/ContactSheet';
import {ContactSheet} from './dev/ContactSheet';
import {Gallery, GALLERY_FRAMES} from './dev/Gallery';
import {RadioStationHorror} from './RadioStationHorror';
import {Thumbnail} from './Thumbnail';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id={COMPOSITION_ID}
				component={RadioStationHorror}
				durationInFrames={TOTAL_FRAMES}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={DEFAULT_PROPS}
			/>
			<Still id="Thumbnail" component={Thumbnail} width={WIDTH} height={HEIGHT} />
			<Folder name="Dev">
				{/* One frame per reusable set / evidence component – handy when editing artwork. */}
				<Composition id="Gallery" component={Gallery} durationInFrames={GALLERY_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
				{/* Renders chosen frames of the main video (pass --props='{"frames":[...]}' --frames=0-N). */}
				<Composition
					id="ContactSheet"
					component={ContactSheet}
					durationInFrames={TOTAL_FRAMES}
					fps={FPS}
					width={WIDTH}
					height={HEIGHT}
					defaultProps={{frames: [0]} as ContactSheetProps}
				/>
			</Folder>
		</>
	);
};
