// Thumbnails for "The Rake", in the look of the other stick films: bright, big cartoon faces, 1-3 words.
// Each shows a real moment of the film.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Lily, LilyAdult, PAL, Son} from '../components/characters/Cast';
import {RoomClock} from '../scenes/common';
import {LieInBed} from '../stick/bed';
import {GEO, Stage} from '../stick/kit';
import {BedClock, Glow} from '../stick/props';
import {Rake} from '../stick/rake';
import {FONT, loadAllFonts} from '../utils/fonts';

loadAllFonts();
const B = GEO.bed;

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
	const pop: React.CSSProperties = {filter: 'brightness(1.5) contrast(1.15) saturate(1.25)'};
	if (v === 'A') {
		// IT'S ON MY BED. - Lily awake at 4:00, the thing bent right down over her face
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="bedroom_night" z={1.85} f={[520, 600]} t={0}>
						<Glow cx={470} cy={330} r={420} color="#b9cdf2" k={0.45} />
						<RoomClock f={0} text="4:00" />
						<LieInBed b={B} is={Lily} px={312} s={1.75} child frame={0} id="thA" skin={PAL.lily.skin} p={{eyes: 'wide', brows: 'raised', mouth: 'scream', look: [1, -0.6], idle: false}} />
						<g transform={`rotate(-20 640 ${B.quilt - 34})`}>
							<Rake x={600} y={B.quilt - 34} s={1.35} frame={5} pose="side" dir={-1} lean={1} mouth={0.45} qa={false} />
						</g>
					</Stage>
				</AbsoluteFill>
				<Words x={40} y={60} rot={3} align="right" lines={[{t: "IT'S ON", c: '#ffffff', size: 160}, {t: 'MY BED.', c: '#ff3b2f', size: 160}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// DON'T WAKE UP. - Sam asleep in his new room 800 miles away; it is crouched on his bed anyway
		const SB = GEO.son;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="sonroom_night" z={1.55} f={[700, 600]} t={0}>
						<Glow cx={720} cy={300} r={460} color="#a9d2e6" k={0.4} />
						<BedClock x={GEO.sonRoom.clock[0]} y={GEO.sonRoom.clock[1]} text="4:00" frame={0} />
						<LieInBed b={SB} is={Son} px={262} s={1.75} child frame={0} id="thB" skin={PAL.son.skin} p={{eyes: 'closed', brows: 'flat', mouth: 'flat', idle: false}} />
						<Rake x={900} y={SB.quilt - 30} s={1.45} frame={5} pose="side" dir={-1} lean={0.5} qa={false} />
					</Stage>
				</AbsoluteFill>
				<Words x={40} y={40} rot={-3} lines={[{t: "DON'T", c: '#ffffff', size: 170}, {t: 'WAKE UP.', c: '#ff3b2f', size: 170}]} />
			</AbsoluteFill>
		);
	}
	// I TOOK HIS PLACE. - Lily grown up, lying in her son's bed at 4:00, eyes open; its face right over hers
	const SB = GEO.son;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={pop}>
				<Stage set="sonroom_night" z={2.3} f={[400, 600]} t={0}>
					<Glow cx={720} cy={300} r={460} color="#a9d2e6" k={0.45} />
					<BedClock x={GEO.sonRoom.clock[0]} y={GEO.sonRoom.clock[1]} text="4:00" frame={0} />
					<LieInBed b={SB} is={LilyAdult} px={262} s={1.15} frame={0} id="thC" skin={PAL.lilyAdult.skin} longHair={PAL.lilyAdult.hair} shoulder={PAL.lilyAdult.shirt} p={{eyes: 'wide', brows: 'angry', mouth: 'o', look: [1, -0.4], idle: false}} />
					<g transform={`rotate(-24 620 ${SB.quilt - 30})`}>
						<Rake x={580} y={SB.quilt - 30} s={1.35} frame={5} pose="side" dir={-1} lean={1} mouth={0.5} qa={false} />
					</g>
				</Stage>
			</AbsoluteFill>
			<Words x={40} y={60} rot={3} align="right" lines={[{t: 'I TOOK', c: '#ffffff', size: 160}, {t: 'HIS PLACE.', c: '#ff3b2f', size: 160}]} />
		</AbsoluteFill>
	);
};
