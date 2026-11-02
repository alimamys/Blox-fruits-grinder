// Dev-only: renders arbitrary frames of the main video, one per output frame.
//   npx remotion render src/index.ts ContactSheet out/sheet --sequence --frames=0-1 --props='{"frames":[100,200]}'
import React from 'react';
import {Freeze, useCurrentFrame} from 'remotion';
import {DEFAULT_PROPS} from '../config';
import {RadioStationHorror} from '../RadioStationHorror';

export type ContactSheetProps = {frames: number[]};

export const ContactSheet: React.FC<ContactSheetProps> = ({frames}) => {
	const i = useCurrentFrame();
	const frame = frames[Math.min(i, frames.length - 1)] ?? 0;
	return (
		<Freeze frame={frame}>
			<RadioStationHorror {...DEFAULT_PROPS} />
		</Freeze>
	);
};
