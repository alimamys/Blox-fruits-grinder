// Thumbnails for the stick "Frame 240", in the look of the other stick films: bright, big cartoon faces, 1-3 words.
// Each shows a real moment of the film.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EditorShot} from '../components/ui/Editor';
import {AtDesk} from '../scenes/common';
import {WALL_MAN} from '../scenes/WhiteOnWhite';
import {Emboss, Glow, manOutline, TallMan} from '../stick/f240';
import {GEO, Stage} from '../stick/kit';
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
	const pop: React.CSSProperties = {filter: 'brightness(1.45) contrast(1.15) saturate(1.3)'};
	if (v === 'A') {
		// HE'S CLOSER. - Mara at her desk, terrified; the man has come right up to the doorway behind her
		const D = GEO.front.door;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="room_front_night" z={1.3} f={[1130, 560]} t={0}>
						<AtDesk f={30} phone={false} m={{eyes: 'wide', brows: 'raised', mouth: 'scream', look: [0.6, -0.2], frame: null}}>
							<defs>
								<clipPath id="thA">
									<rect x={D[0]} y={D[1]} width={D[2] - D[0]} height={D[3] - D[1]} />
								</clipPath>
							</defs>
							<g clipPath="url(#thA)">
								<Glow cx={1440} cy={520} r={330} color="#b9cdf2" k={0.9} />
								<TallMan x={1488} y={1010} s={2.05} frame={0} stoop={0.25} qa={false} twitch={false} />
							</g>
						</AtDesk>
					</Stage>
				</AbsoluteFill>
				<Words x={50} y={50} rot={-3} lines={[{t: "HE'S", c: '#ffffff', size: 170}, {t: 'CLOSER.', c: '#ff3b2f', size: 170}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// I DIDN'T DRAW HIM. - her animation, frame 240 of 240, the man in it
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={{filter: 'brightness(1.25) contrast(1.1) saturate(1.2)'}}>
					<EditorShot f={0} d={10} picture="canvas_man_near" frame={240} total={240} push={[1.3, 1.3]} focus={[0.3, 0.45]} />
				</AbsoluteFill>
				<Words x={30} y={70} rot={3} align="right" lines={[{t: "I DIDN'T", c: '#ffffff', size: 150}, {t: 'DRAW', c: '#ffd21a', size: 150}, {t: 'HIM.', c: '#ffd21a', size: 150}]} />
			</AbsoluteFill>
		);
	}
	// LOOK CLOSER. - the white wall, the faint white outline of the man, Mara turned toward it
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Stage set="room_front_night" z={1.4} f={[1060, 560]} t={0} wash={1}>
				<AtDesk f={30} wash={1} phone={false} m={{turn: 0.6, look: [1, -0.4], eyes: 'wide', brows: 'raised', mouth: 'o', frame: null}}>
					{manOutline(WALL_MAN.x, WALL_MAN.y, WALL_MAN.s).map((d, i) => (
						<Emboss key={i} d={d} k={1} w={10} />
					))}
				</AtDesk>
				<ellipse cx={1104} cy={300} rx={88} ry={98} fill="none" stroke="#ff2626" strokeWidth={12} />
			</Stage>
			<Words x={40} y={40} rot={-3} align="left" lines={[{t: 'LOOK', c: '#ffffff', size: 170}, {t: 'CLOSER.', c: '#ff3b2f', size: 170}]} />
		</AbsoluteFill>
	);
};
