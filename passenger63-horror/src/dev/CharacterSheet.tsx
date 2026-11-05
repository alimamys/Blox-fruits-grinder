// Dev-only: every pose of the rig on one page (npx remotion still CharacterSheet).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Captain, Crew1, Daniel, Emma, OldWoman} from '../components/characters/Cast';
import {walkPhase} from '../components/characters/StickPerson';

const SeatBox: React.FC<{x: number; y: number; s: number; w?: number}> = ({x, y, s, w = 1}) => (
	<g>
		<rect x={x - 80 * s * w} y={y - 175 * s} width={160 * s * w} height={100 * s} fill="#2d4f86" stroke="#111" strokeWidth={5} />
		<rect x={x - 80 * s * w} y={y - 80 * s} width={160 * s * w} height={10 * s} fill="#3f68a8" stroke="#111" strokeWidth={4} />
		<rect x={x - 80 * s * w} y={y - 70 * s} width={160 * s * w} height={24 * s} fill="#24406e" stroke="#111" strokeWidth={4} />
	</g>
);

export const CharacterSheet: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#8a96a6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<rect x={0} y={480} width={1920} height={600} fill="#59616e" />
				{/* row 1: stand / front walk / side walk / back walk / talk */}
				<Daniel x={140} y={470} s={1} frame={f} />
				<Crew1 x={340} y={470} s={1} frame={f} pose="walk" phase={walkPhase(f * 3, 1)} />
				<Crew1 x={540} y={470} s={1} frame={f} pose="walk" turn={0.9} phase={walkPhase(f * 3, 1)} />
				<Crew1 x={740} y={470} s={1} frame={f} pose="run" turn={-0.9} phase={walkPhase(f * 6, 1, 'run')} />
				<Emma x={940} y={470} s={1} frame={f} talk={0.8} viseme="a" brows="worried" />
				<Emma x={1120} y={470} s={1} frame={f} talk={0.6} viseme="o" />
				<Emma x={1300} y={470} s={1} frame={f} talk={0.6} viseme="e" />
				<Captain x={1500} y={470} s={1} frame={f} back pose="walk" phase={walkPhase(f * 3, 1)} />
				<OldWoman x={1720} y={470} s={1} />
				{/* row 2: seated */}
				<SeatBox x={160} y={1040} s={1.15} w={1.1} />
				<SeatBox x={340} y={1040} s={1.15} w={1.1} />
				<Emma x={190} y={1040} s={1.15} frame={f} pose="sit" lean={20} tilt={26} eyes="closed" mouth="smile" />
				<Daniel x={340} y={1040} s={1.15} frame={f} pose="sit" look={[0.9, -0.3]} />
				<SeatBox x={620} y={1040} s={1.15} />
				<Daniel x={620} y={1040} s={1.15} frame={f} pose="sit" arms="hold" prop="phone" />
				<rect x={760} y={1040 - 0.9 * 72 - 8} width={300} height={14} fill="#7a5532" stroke="#111" strokeWidth={4} />
				<rect x={760} y={1040 - 0.9 * 165} width={300} height={22} fill="#7a5532" stroke="#111" strokeWidth={4} />
				<OldWoman x={910} y={1040} s={0.9} pose="sit" />
				<rect x={1120} y={1040 - 0.9 * 72 - 8} width={300} height={14} fill="#7a5532" stroke="#111" strokeWidth={4} />
				<OldWoman x={1270} y={1040} s={0.9} pose="sit" back />
				<rect x={1120} y={1040 - 0.9 * 125} width={300} height={22} fill="#7a5532" stroke="#111" strokeWidth={4} />
				<Crew1 x={1600} y={1040} s={1.15} frame={f} pose="sit" arms="grabRight" talk={0.5} />
			</svg>
		</AbsoluteFill>
	);
};
