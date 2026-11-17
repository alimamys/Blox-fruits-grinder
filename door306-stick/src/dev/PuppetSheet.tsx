// Puppet check: the whole cast, the creature's poses and the props.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Boy, Harris, Landlord, Mother, OldMan, RobeMan, RobeWoman, Sarah, Shawl, TShirt} from '../components/characters/Cast';
import {Creature, Prop, Sack} from '../components/characters/Creature';

export const PuppetSheet: React.FC = () => {
	const f = useCurrentFrame();
	const cast = [Sarah, Harris, Mother, Boy, OldMan, RobeMan, TShirt, Shawl, RobeWoman, Landlord];
	return (
		<AbsoluteFill style={{background: '#d9d4c6'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				{cast.map((C, i) => (
					<C key={i} x={110 + i * 185} y={430} s={1.0} frame={f} mouth={i % 3 === 0 ? 'open' : 'flat'} talk={0.6} idle={false} />
				))}
				<Creature x={200} y={1060} s={1.4} frame={f} view="front" />
				<Creature x={520} y={1060} s={1.4} frame={f} view="side" walking phase={f / 4} grip={[-120, -40]} />
				<Sack x={290} y={1060} s={0.9} frame={f} />
				<Creature x={900} y={1060} s={1.4} frame={f} view="front" reach={[230, -200]} tilt={60} talk={0.8} />
				<Creature x={1280} y={1060} s={1.4} frame={f} view="back" />
				<Prop name="sofa" x={1600} y={1060} w={340} />
				<Prop name="table" x={1820} y={800} w={180} />
				<Prop name="chair" x={1660} y={800} w={80} />
				<Prop name="notebook" x={1820} y={640} w={110} />
			</svg>
		</AbsoluteFill>
	);
};
