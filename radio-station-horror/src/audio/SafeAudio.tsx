import React from 'react';
import {Html5Audio} from 'remotion';
import type {VolumeProp} from './volume';

type Props = {
	/** URL from findAudio()/findSfx(). When null nothing is rendered – missing files never crash. */
	src: string | null;
	volume?: VolumeProp;
	loop?: boolean;
	playbackRate?: number;
	name?: string;
};

/** <Html5Audio> that silently renders nothing when the file is missing or fails to load. */
export const SafeAudio: React.FC<Props> = ({src, volume = 1, loop, playbackRate, name}) => {
	if (!src) {
		return null;
	}
	return (
		<Html5Audio
			src={src}
			volume={volume}
			loop={loop}
			playbackRate={playbackRate}
			name={name}
			onError={(err) => {
				console.warn(`Audio failed to load: ${src}`, err);
			}}
		/>
	);
};
