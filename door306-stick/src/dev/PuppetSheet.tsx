// Puppet check: every view and pose of the painted puppets.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Harris, Sarah} from '../components/characters/Cast';
import {walkPhase} from '../components/characters/StickPerson';

export const PuppetSheet: React.FC = () => {
	const f = useCurrentFrame();
	const row = (C: typeof Sarah, y: number) => (
		<g>
			<C x={160} y={y} s={1.15} frame={f} />
			<C x={400} y={y} s={1.15} frame={f} mouth="open" talk={0.8} eyes="wide" brows="worried" />
			<C x={640} y={y} s={1.15} frame={f} turn={0.8} pose="walk" phase={walkPhase(f * 6, 1.15)} />
			<C x={880} y={y} s={1.15} frame={f} turn={-0.8} />
			<C x={1120} y={y} s={1.15} frame={f} back />
			<C x={1360} y={y} s={1.15} frame={f} pose="sit" mouth="smile" />
			<C x={1600} y={y} s={1.15} frame={f} arms="fingerLips" eyes="squint" />
			<C x={1800} y={y} s={1.15} frame={f} arms="armsUp" mouth="scream" eyes="wide" />
		</g>
	);
	return (
		<AbsoluteFill style={{background: '#d9d4c6'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				{row(Sarah, 500)}
				{row(Harris, 1040)}
			</svg>
		</AbsoluteFill>
	);
};
