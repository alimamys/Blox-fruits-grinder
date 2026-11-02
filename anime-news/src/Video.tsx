import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {FilmTexture, IllustrationMark, Subtitles, TempFlag} from './components/Overlays';
import {Narration, SoundDesign} from './components/Sound';
import {ensureFonts} from './lib/fonts';
import {C} from './lib/theme';
import {registry, SCENES} from './lib/timeline';
import {AnimaticScene} from './scenes/AnimaticScene';
import {S01ColdOpen, s01Cuts} from './scenes/S01ColdOpen';
import {BUILT_CHAPTERS} from './scenes/Chapters';

ensureFonts();

const BUILT: Record<string, React.FC> = {S01: S01ColdOpen, ...BUILT_CHAPTERS};

/** stem: render only narration ('vo') or only music/SFX ('bed') for mix checks. */
export type VideoProps = {mode: 'preview' | 'main'; durationInFrames: number; stem?: 'all' | 'vo' | 'bed'};

export const Video: React.FC<VideoProps> = ({mode, durationInFrames, stem = 'all'}) => {
	const firstPicture = s01Cuts().c1.s;
	const assetIds = registry.assets.filter((a) => mode === 'main' || a.inPreview).map((a) => a.id);
	return (
		<AbsoluteFill style={{background: C.ink}}>
			{SCENES.map((s) => {
				const Built = BUILT[s.id];
				return (
					<Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationFrames} name={`${s.id} ${s.chapter}`}>
						{Built ? <Built /> : <AnimaticScene sceneId={s.id} />}
					</Sequence>
				);
			})}
			<FilmTexture />
			<IllustrationMark from={firstPicture} />
			<TempFlag from={firstPicture} to={durationInFrames} assetIds={assetIds} />
			<Subtitles />
			{stem !== 'bed' ? <Narration /> : null}
			{stem !== 'vo' ? <SoundDesign totalFrames={durationInFrames} /> : null}
		</AbsoluteFill>
	);
};
