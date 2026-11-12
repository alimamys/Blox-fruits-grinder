// Character sheet for the stick-figure remake: every cast member and Mr. Widemouth's main states.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Dad, Eli, EliAdult, Leo, Mom} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';

const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
	<text x={x} y={y} textAnchor="middle" fontFamily="Patrick Hand, Comic Sans MS, sans-serif" fontSize={30} fill="#1d2430">
		{t}
	</text>
);

export const StickSheet: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#e9e4d6'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080}>
				<line x1={0} y1={470} x2={1920} y2={470} stroke="#c9c1ad" strokeWidth={3} />
				<line x1={0} y1={1000} x2={1920} y2={1000} stroke="#c9c1ad" strokeWidth={3} />
				<Eli x={170} y={450} frame={f} mouth="smile" />
				<Label x={170} y={510} t="Eli (5)" />
				<Mom x={420} y={450} frame={f} mouth="smile" s={0.95} />
				<Label x={420} y={510} t="Mom" />
				<Dad x={680} y={450} frame={f} mouth="flat" />
				<Label x={680} y={510} t="Dad" />
				<EliAdult x={950} y={450} frame={f} mouth="faint" />
				<Label x={950} y={510} t="Eli (30)" />
				<Leo x={1170} y={450} frame={f} mouth="grin" />
				<Label x={1170} y={510} t="Leo (5)" />
				<Eli x={1380} y={450} frame={f} mouth="o" eyes="wide" brows="worried" pale={0.3} />
				<Label x={1380} y={510} t="Eli scared" />
				<Eli x={1600} y={450} frame={f} pose="sit" mouth="flat" eyes="closed" />
				<Label x={1600} y={510} t="Eli sitting" />
				<Eli x={1800} y={450} frame={f} back />
				<Label x={1800} y={510} t="Eli back" />

				<Widemouth x={180} y={980} frame={f} mouth="smile" />
				<Label x={180} y={1045} t="Mr. Widemouth" />
				<Widemouth x={460} y={980} frame={f} mouth="smile" arms="wave" knife />
				<Label x={460} y={1045} t="wave + knife" />
				<Widemouth x={740} y={980} frame={f} mouth="grin" arms="reach" />
				<Label x={740} y={1045} t="grin" />
				<Widemouth x={1020} y={980} frame={f} mouth="smile" talk={0.8} />
				<Label x={1020} y={1045} t="talking" />
				<Widemouth x={1300} y={980} frame={f} mouth="snarl" earsBack />
				<Label x={1300} y={1045} t="the snarl" />
				<Widemouth x={1580} y={980} frame={f} mouth="sad" />
				<Label x={1580} y={1045} t="sad" />
				<g>
					<Widemouth x={1800} y={940} frame={f} mouth="smile" peek glow />
					<rect x={1700} y={900} width={200} height={100} fill="#6e5a46" stroke="#141414" strokeWidth={5} />
				</g>
				<Label x={1800} y={1045} t="under the bed" />
			</svg>
		</AbsoluteFill>
	);
};
