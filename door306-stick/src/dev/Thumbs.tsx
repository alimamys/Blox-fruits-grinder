// Thumbnails for the stick "3:06", in the look of the earlier films: bright, big cartoon faces, 1-3 words.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sarah} from '../components/characters/Cast';
import {Creature} from '../components/characters/Creature';
import {Peephole, residentsPersp} from '../stick/d306';
import {Stage} from '../stick/kit';
import {Group} from '../stick/places';
import {FlatDoorOpen} from '../scenes/Offering';
import {FONT, loadAllFonts} from '../utils/fonts';

loadAllFonts();

const Words: React.FC<{lines: Array<{t: string; c: string; size: number}>; x: number; y: number; rot?: number; align?: 'left' | 'right'}> = ({lines, x, y, rot = -4, align = 'left'}) => (
	<div style={{position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? x : undefined, top: y, transform: `rotate(${rot}deg)`, textAlign: align}}>
		{lines.map((l, i) => (
			<div key={i} style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: l.size, lineHeight: 0.98, color: l.c, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', letterSpacing: 1, textShadow: '0 10px 0 rgba(0,0,0,0.55)'}}>
				{l.t}
			</div>
		))}
	</div>
);

export const Thumb: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
	const pop: React.CSSProperties = {filter: 'brightness(1.4) contrast(1.15) saturate(1.3)'};
	if (v === 'A') {
		// THEY ALL TURNED: the peephole, every neighbour facing my door, the thing at the end of the hall
		const res = residentsPersp(30, 'door').map((p) => ({...p, idle: false, frame: null}));
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="hallway_persp_night" z={1.05} f={[950, 560]} t={0} over={<Peephole r={520} />}>
						<defs>
							<clipPath id="tA">
								<rect x={820} y={180} width={260} height={480} />
							</clipPath>
						</defs>
						<g clipPath="url(#tA)">
							<Creature x={950} y={700} s={0.6} frame={30} view="front" tilt={40} qa={false} />
						</g>
						<Group people={res} />
					</Stage>
				</AbsoluteFill>
				<Words x={40} y={60} rot={-3} lines={[{t: 'THEY ALL', c: '#ffffff', size: 150}, {t: 'TURNED.', c: '#ff3b2f', size: 150}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// DON'T OPEN IT: the door open a crack, its face in the gap; Sarah screaming in front
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="flat_night_bare" z={1.5} f={[1300, 520]} t={0}>
						<FlatDoorOpen open={0.85}>
							<Creature x={1545} y={830} s={1.0} frame={30} view="front" tilt={-34} talk={0.6} qa={false} />
						</FlatDoorOpen>
						<Sarah x={1060} y={1000} s={1.6} frame={null} eyes="wide" brows="worried" mouth="scream" look={[1, -0.3]} turn={0.4} arms={{l: [40, -120], r: [40, -120]}} />
					</Stage>
				</AbsoluteFill>
				<Words x={40} y={40} rot={-4} lines={[{t: "DON'T", c: '#ffffff', size: 170}, {t: 'OPEN IT.', c: '#ffd21a', size: 170}]} />
			</AbsoluteFill>
		);
	}
	// 3:06 AM: the clock and the creature's head
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={pop}>
				<Stage set="stairwell_night" z={2.3} f={[1190, 260]} t={0}>
					<Creature x={1190} y={525} s={1.0} frame={30} view="front" tilt={48} qa={false} />
				</Stage>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 60, top: 60, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 210, color: '#ff3b2f', textShadow: '0 0 40px rgba(255,40,30,0.6), 0 8px 0 #000'}}>3:06</div>
			<Words x={60} y={300} rot={0} lines={[{t: 'AM', c: '#ffffff', size: 120}]} />
		</AbsoluteFill>
	);
};
