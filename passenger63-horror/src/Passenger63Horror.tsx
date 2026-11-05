// THE 63RD PASSENGER - root composition.
// Scenes are placed from the computed timeline (src/data/timeline.ts); nothing here
// hardcodes a duration.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AudioLayer} from './audio/AudioLayer';
import {Grain, Vignette} from './components/fx/Fx';
import {Subtitles} from './components/fx/Subtitles';
import {SettingsProvider, type VideoSettings} from './data/settings';
import {TIMELINE, TIMELINE_FULL} from './data/timeline';
import {SCENE_COMPONENTS} from './scenes';
import {loadAllFonts} from './utils/fonts';
import {SceneProvider} from './utils/scene';

loadAllFonts();

/** Scene entrance: a short camera punch-in and a faint flash, so every new chapter hits. */
const SceneIn: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
	const f = useCurrentFrame();
	if (id === 'disclaimer' || id === 'end') return <>{children}</>;
	const t = Math.min(1, f / 10);
	const k = 1 + 0.06 * (1 - t) * (1 - t);
	return (
		<AbsoluteFill style={{transform: `scale(${k})`}}>
			{children}
			{f < 5 ? <AbsoluteFill style={{background: '#fff', opacity: 0.16 * (1 - f / 5)}} /> : null}
		</AbsoluteFill>
	);
};

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
	const tl = settings.edit === 'full' ? TIMELINE_FULL : TIMELINE;
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
								<SceneIn id={s.id}>
									<C />
								</SceneIn>
							</SceneProvider>
						</Sequence>
					);
				})}
				<GlobalFx end={endScene.startFrame} />
				{settings.subtitles !== false ? <Subtitles timeline={tl} until={endScene.startFrame} /> : null}
				{settings.audio ? <AudioLayer timeline={tl} /> : null}
			</AbsoluteFill>
		</SettingsProvider>
	);
};
