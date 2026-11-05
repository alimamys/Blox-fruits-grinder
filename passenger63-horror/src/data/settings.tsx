// Render-time switches. They are also exposed as Remotion input props, so they can
// be toggled in the Studio's props panel or from the CLI:
//   npx remotion render Passenger63Horror out/x.mp4 --props='{"evidenceInserts":false}'
import React, {createContext, useContext} from 'react';

export type VideoSettings = {
	/** Realistic documentary inserts (manifest UI, harbor control, police file...). When
	 *  false they are replaced by crude hand-drawn cards carrying the same key text. */
	evidenceInserts: boolean;
	/** CCTV chrome (timestamp, scanlines, noise, compression blocks). */
	cctvOverlay: boolean;
	/** Film grain + vignette over the whole video. */
	grain: boolean;
	/** Play voice / SFX / ambience (turn off for a silent visual check). */
	audio: boolean;
	/** Which edit to render. */
	edit: 'full' | 'tight';
};

export const DEFAULT_SETTINGS: VideoSettings = {
	evidenceInserts: true,
	cctvOverlay: true,
	grain: true,
	audio: true,
	edit: 'full',
};

const Ctx = createContext<VideoSettings>(DEFAULT_SETTINGS);
export const SettingsProvider: React.FC<{value: VideoSettings; children: React.ReactNode}> = ({value, children}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useSettings = () => useContext(Ctx);
