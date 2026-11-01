import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Plate} from './components/Plate';
import {ensureFonts} from './lib/fonts';

ensureFonts();

/** Dev-only: one plate at a given framing, for art review stills. */
export const PlateTest: React.FC<{assetId: string; x: number; y: number; z: number}> = ({assetId, x, y, z}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Plate assetId={assetId} cam={{x, y, z}} tag="none" />
	</AbsoluteFill>
);
