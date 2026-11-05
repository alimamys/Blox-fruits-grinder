// THE 63RD PASSENGER - root composition.
// Scenes are placed from the computed timeline (src/data/timeline.ts); nothing here
// hardcodes a duration.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AudioLayer} from './audio/AudioLayer';
import {Grain, Vignette} from './components/fx/Fx';
import {SettingsProvider, type VideoSettings} from './data/settings';
import {TIMELINE, TIMELINE_TIGHT} from './data/timeline';
import {SCENE_COMPONENTS} from './scenes';
import {loadAllFonts} from './utils/fonts';
import {SceneProvider} from './utils/scene';

loadAllFonts();

const GlobalFx: React.FC<{end: number}> = ({end}) => {
	const f = useCurrentFrame();
	if (f >= end) return null; // the final black stays perfectly black
	return (
		<>
			<Grain f={f} />
			<Vignette />
		</>
	);
};

export const Passenger63Horror: React.FC<VideoSettings> = (settings) => {
	const tl = settings.edit === 'tight' ? TIMELINE_TIGHT : TIMELINE;
	const endScene = tl.scenes[tl.scenes.length - 1];
	return (
		<SettingsProvider value={settings}>
			<AbsoluteFill style={{background: '#000'}}>
				{tl.scenes.map((s) => {
					const C = SCENE_COMPONENTS[s.id];
					if (!C) return null;
					return (
						<Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames} name={`${s.index}. ${s.name}`}>
							<SceneProvider scene={s}>
								<C />
							</SceneProvider>
						</Sequence>
					);
				})}
				<GlobalFx end={endScene.startFrame} />
				{settings.audio ? <AudioLayer timeline={tl} /> : null}
			</AbsoluteFill>
		</SettingsProvider>
	);
};
