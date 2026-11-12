// Thumbnails for the stick-figure "Mr. Widemouth", in the look of the earlier films' thumbnails:
// big cartoon faces, bright high contrast, 1-3 words of bold outlined text, a red arrow.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Eli} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {BEDS, GEO, Stage} from '../stick/kit';
import {BedScene} from '../stick/rooms';
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

const Arrow: React.FC<{x: number; y: number; rot: number; s?: number}> = ({x, y, rot, s = 1}) => (
	<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
			<path d="M0,-28 L170,-28 L170,-70 L260,0 L170,70 L170,28 L0,28 Z" fill="#e3261b" stroke="#000" strokeWidth={10} strokeLinejoin="round" />
		</g>
	</svg>
);

const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '255,236,170', o = 0.55}) => (
	<AbsoluteFill style={{background: `radial-gradient(circle at ${x}px ${y}px, rgba(${c},${o}) 0px, rgba(${c},0) ${r}px)`, mixBlendMode: 'screen'}} />
);

export const Thumb: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
	const pop: React.CSSProperties = {filter: 'brightness(1.35) contrast(1.18) saturate(1.35)'};
	if (v === 'A') {
		// UNDER MY BED: his grin in the gap under the bed skirt, Eli's scared face above
		const b = BEDS.bedroom_night;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="bedroom_night" z={2.5} f={[600, 790]} t={0}>
						<BedScene set="bedroom_night" light="night" frame={30} id="ta" bed={{mode: 'none'}} skirt={{cx: 640, h: 100, w: 260}} wm={{x: 640, y: b.gap - 22, under: 0.62, dark: 0.15, mouth: 'grin', look: [-0.4, -0.6], glow: true}} />
					</Stage>
				</AbsoluteFill>
				<Glow x={1060} y={700} r={360} />
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
					<Eli x={330} y={1330} s={3.6} frame={null} eyes="wide" brows="worried" mouth="scream" pale={0.15} look={[1, 0.8]} sweat />
				</svg>
				<Arrow x={700} y={470} rot={30} s={1.1} />
				<Words x={70} y={56} align="right" rot={-3} lines={[{t: 'UNDER', c: '#ffffff', size: 190}, {t: 'MY BED', c: '#ffd21a', size: 190}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// HE HAD A KNIFE: waving goodbye from the window
		const [x0, , x1] = GEO.window_out_night.pane;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="window_out_night" z={1.55} f={[(x0 + x1) / 2 + 40, 690]} t={0}>
						<g>
							<rect x={x0} y={524} width={x1 - x0} height={372} fill="#2a3346" />
							<Widemouth x={(x0 + x1) / 2} y={GEO.window_out_night.sill} s={1.3} frame={null} knife arms="wave" mouth="grin" look={[0, 0.3]} glow />
						</g>
					</Stage>
				</AbsoluteFill>
				<Glow x={960} y={560} r={420} c="200,220,255" o={0.4} />
				<Words x={60} y={40} rot={-4} lines={[{t: 'HE HAD', c: '#ffffff', size: 170}, {t: 'A KNIFE', c: '#ff3b2f', size: 170}]} />
				<Arrow x={420} y={830} rot={-8} s={1.0} />
			</AbsoluteFill>
		);
	}
	// HELLO AGAIN: years later, under his son's bed
	const lb = BEDS.leoroom_day;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{filter: 'brightness(1.2) contrast(1.2) saturate(1.3)'}}>
				<Stage set="leoroom_day" z={3.0} f={[665, 805]} t={0} light="dark">
					<BedScene set="leoroom_day" light="dark" frame={30} id="tc" who="leo" bed={{mode: 'none'}} skirt={{cx: 665, h: 96, w: 260}} wm={{x: 665, y: lb.gap - 22, under: 0.58, dark: 0.05, mouth: 'grin', look: [0, -0.3], glow: true}} />
				</Stage>
			</AbsoluteFill>
			<Glow x={960} y={760} r={420} c="220,230,255" o={0.45} />
			<Words x={0} y={60} rot={0} lines={[{t: 'HELLO AGAIN.', c: '#ffffff', size: 200}]} />
		</AbsoluteFill>
	);
};
