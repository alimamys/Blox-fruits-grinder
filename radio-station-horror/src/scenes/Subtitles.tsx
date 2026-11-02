// Optional burned-in narration subtitles (off by default – see DEFAULT_PROPS).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../utils/fonts';
import {useChapter} from '../utils/timeline-context';

export const Subtitles: React.FC = () => {
	const ch = useChapter();
	const f = useCurrentFrame();
	const b = ch.beats.find((x) => f >= x.start && f < x.end);
	if (!b || !b.text || b.speaker === 'sfx' || b.speaker === 'silence') {
		return null;
	}
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60, pointerEvents: 'none'}}>
			<div
				style={{
					maxWidth: 1500,
					textAlign: 'center',
					fontFamily: FONT.ui,
					fontWeight: 600,
					fontSize: 44,
					lineHeight: 1.3,
					color: b.speaker === 'radio' ? '#ffcf8a' : '#ffffff',
					background: 'rgba(0,0,0,0.6)',
					padding: '10px 28px',
					borderRadius: 8,
				}}
			>
				{b.text}
			</div>
		</AbsoluteFill>
	);
};
