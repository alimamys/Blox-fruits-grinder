/**
 * S02 | THE GULF — built so far: visual cue 1 (opening wide shot).
 * Remaining cues fall through to the timing animatic until they are built.
 */
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Plate, TempTag} from '../components/Plate';
import {Handheld, Haze, Motes} from '../components/fx';
import {camLerp} from '../lib/motion';
import {localCue, scene} from '../lib/timeline';
import {AnimaticScene} from './AnimaticScene';

// V1 "We start in the Gulf": wide sea-and-shipping plate, slow lateral move,
// two layers of water motion (near/far layers + sway; shimmer on flattened art).
const GulfWide: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const cam = camLerp(f, 0, dur, {x: 0.4, y: 0.5, z: 1.14}, {x: 0.57, y: 0.49, z: 1.16}, (t) => t);
	return (
		<AbsoluteFill>
			<Handheld amp={0.45} seed={12}>
				<Plate assetId="A01" cam={cam} sway waterHorizon={0.52} tag="none" />
				<Haze y={480} h={150} opacity={0.15} speed={0.6} seed={2} />
			</Handheld>
			<Motes count={30} seed="sg" drift={[-0.3, -0.1]} size={2} color="#f6c271" opacity={0.45} area={[0, 560, 1920, 520]} />
			<TempTag id="A01" />
		</AbsoluteFill>
	);
};

export const S02Gulf: React.FC = () => {
	const built = localCue('S02', 'S02_02').s; // V2 begins at "On Sunday"
	const dur = scene('S02').durationFrames;
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={built} name="V1 gulf wide" layout="none">
				<GulfWide dur={built} />
			</Sequence>
			<Sequence from={built} durationInFrames={dur - built} name="V2-V7 animatic" layout="none">
				<AnimaticScene sceneId="S02" offset={built} />
			</Sequence>
		</AbsoluteFill>
	);
};
