// The full video. Chapters are laid out from src/data/timeline.ts (which is
// computed from src/data/script.ts), so re-timing never requires edits here.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SoundDesign} from './audio/SoundDesign';
import type {VideoProps} from './config';
import {TIMELINE} from './data/timeline';
import type {ChapterId} from './data/types';
import {Aftermath} from './scenes/Aftermath';
import {Disclaimer, EndCard, TitleCard} from './scenes/Cards';
import {ColdOpen} from './scenes/ColdOpen';
import {Daniel} from './scenes/Daniel';
import {Motel} from './scenes/Motel';
import {Protecting} from './scenes/Protecting';
import {RadioReturns} from './scenes/RadioReturns';
import {ChapterLabel} from './scenes/shared';
import {Subtitles} from './scenes/Subtitles';
import {TheBed} from './scenes/TheBed';
import {VictorHale} from './scenes/VictorHale';
import {FontLoader} from './utils/fonts';
import {ChapterProvider, Shot} from './utils/timeline-context';

const Whole: React.FC<{children: React.ReactNode; first: string; last: string}> = ({children, first, last}) => (
	<Shot from={first} to={last} name="Card">
		{children}
	</Shot>
);

const SCENES: Record<ChapterId, React.FC> = {
	disclaimer: () => (
		<Whole first="disclaimer" last="disclaimer">
			<Disclaimer />
		</Whole>
	),
	coldOpen: ColdOpen,
	titleCard: () => (
		<Whole first="title" last="title">
			<TitleCard />
		</Whole>
	),
	radioReturns: RadioReturns,
	protecting: Protecting,
	theBed: TheBed,
	victorHale: VictorHale,
	motel: Motel,
	aftermath: Aftermath,
	daniel: Daniel,
	endCard: () => (
		<Whole first="black" last="out">
			<EndCard />
		</Whole>
	),
};

export const RadioStationHorror: React.FC<VideoProps> = ({showSubtitles, showChapterLabels, sfxVolume, voiceVolume}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<FontLoader />
			{TIMELINE.map((ch) => {
				const Scene = SCENES[ch.id];
				return (
					<Sequence key={ch.id} from={ch.start} durationInFrames={ch.frames} name={ch.title}>
						<ChapterProvider id={ch.id}>
							<Scene />
							{showChapterLabels && ch.label && <ChapterLabel text={ch.label} />}
							{showSubtitles && <Subtitles />}
						</ChapterProvider>
					</Sequence>
				);
			})}
			<SoundDesign sfxVolume={sfxVolume} voiceVolume={voiceVolume} />
		</AbsoluteFill>
	);
};
