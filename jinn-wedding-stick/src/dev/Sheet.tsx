// Dev only: the cast line-up and set checks.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Band1, Band2, Bride, Driver, Drummer, Girl, Guest, Mother, Noura, OldMan, Yadda} from '../components/characters/Cast';

export const SHEET_FRAMES = 3;

export const Sheet: React.FC = () => {
	const i = useCurrentFrame();
	if (i === 0)
		return (
			<AbsoluteFill style={{background: '#6f7f99'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<rect x={0} y={900} width={1920} height={180} fill="#5a4a3a" />
					<Yadda x={140} y={900} s={1.6} frame={40} />
					<Girl x={330} y={900} s={1.6} child frame={40} />
					<Noura x={520} y={900} s={1.6} frame={40} prop="tar" arms="hold" />
					<Band1 x={720} y={900} s={1.6} frame={40} prop="tabl" arms="hold" />
					<Band2 x={900} y={900} s={1.6} frame={40} />
					<Drummer x={1080} y={900} s={1.6} frame={40} prop="tar" arms="hold" />
					<Mother x={1270} y={900} s={1.6} frame={40} />
					<Bride x={1450} y={900} s={1.6} frame={40} />
					<Driver x={1630} y={900} s={1.6} frame={40} />
					<OldMan x={1800} y={900} s={1.6} frame={40} />
				</svg>
			</AbsoluteFill>
		);
	if (i === 1)
		return (
			<AbsoluteFill style={{background: '#3a2a3a'}}>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
					<rect x={0} y={900} width={1920} height={180} fill="#d9d2c4" />
					{[0, 1, 2, 3, 4].map((n) => (
						<Guest key={n} n={n} x={200 + n * 360} y={900} s={1.6} frame={40 + n * 5} hooves={n % 2 === 0} hemLift={n % 2 === 0 ? 0.8 : 0} eyes={n === 1 ? 'glow' : undefined} arms="armsUp" />
					))}
				</svg>
			</AbsoluteFill>
		);
	return (
		<AbsoluteFill style={{background: '#6f7f99'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<rect x={0} y={900} width={1920} height={180} fill="#5a4a3a" />
				<Yadda x={400} y={900} s={2.2} frame={40} pose="floor" prop="dallah" arms={{l: [28, -64], r: [70, -60]}} />
				<Girl x={900} y={900} s={2.2} child frame={40} pose="floor" />
				<Noura x={1400} y={900} s={2.2} frame={40} pose="floor" prop="tar" arms="hold" />
			</svg>
		</AbsoluteFill>
	);
};
