// Thumbnails for "The Jinn Wedding", in the look of the other stick films: bright, big cartoon faces, 1-3 words.
// Each shows a real moment of the film.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bride, Noura} from '../components/characters/Cast';
import {Guests} from '../scenes/common';
import {Person} from '../stick/goat';
import {Stage} from '../stick/kit';
import {Dark, Glow, Haze, Prints} from '../stick/props';
import {FONT, loadAllFonts} from '../utils/fonts';

loadAllFonts();

const Words: React.FC<{lines: Array<{t: string; c: string; size: number; ar?: boolean}>; x: number; y: number; rot?: number; align?: 'left' | 'right'}> = ({lines, x, y, rot = -4, align = 'left'}) => (
	<div style={{position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? x : undefined, top: y, transform: `rotate(${rot}deg)`, textAlign: align}}>
		{lines.map((l, i) => (
			<div
				key={i}
				style={{
					fontFamily: l.ar ? '"DejaVu Sans", "FreeSerif", sans-serif' : FONT.ui,
					fontWeight: 800,
					fontSize: l.size,
					lineHeight: 0.98,
					color: l.c,
					WebkitTextStroke: l.ar ? '6px #000' : '14px #000',
					paintOrder: 'stroke fill',
					letterSpacing: 1,
					direction: l.ar ? 'rtl' : 'ltr',
					textShadow: '0 10px 0 rgba(0,0,0,0.55)',
				}}
			>
				{l.t}
			</div>
		))}
	</div>
);

export const Thumb: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
	const pop: React.CSSProperties = {filter: 'brightness(1.3) contrast(1.15) saturate(1.25)'};
	if (v === 'A') {
		// LOOK AT THEIR FEET - hooves under the shining dresses, and Noura's face
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="hall_gold" z={2.6} f={[1260, 930]} t={0} light="warm">
						<Guests f={0} t={0.4} mode="dance" hooves hemLift={1} />
					</Stage>
				</AbsoluteFill>
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<Glow cx={330} cy={700} r={600} color="#ffe2a0" k={0.6} />
					<Noura x={330} y={2050} s={5.6} frame={0} eyes="wide" brows="raised" mouth="scream" look={[0.6, 0.9]} idle={false} />
				</svg>
				<Words x={760} y={40} rot={-3} lines={[{t: 'LOOK AT', c: '#fff', size: 170}, {t: 'THEIR FEET', c: '#ffd34a', size: 200}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// the hall in the dark: only their eyes, and the veiled bride
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="hall_gold" z={1.35} f={[960, 720]} t={0} light="warm">
						<Haze t={0} />
						<Person is={Bride} name="bride" x={924} y={790} s={1.25} pose="sit" frame={0} idle={false} arms="lap" noqa />
						<Guests f={0} t={0.2} mode="dance" glow />
						<Dark k={0.8} />
						<Guests f={0} t={0.2} mode="dance" glow eyesOnly />
						<Glow cx={924} cy={600} r={260} color="#f4efe4" k={0.35} />
					</Stage>
				</AbsoluteFill>
				<Words x={60} y={40} rot={-3} lines={[{t: 'THE JINN', c: '#fff', size: 180}, {t: 'WEDDING', c: '#ffd34a', size: 200}, {t: 'عرس الجن', c: '#e9c25a', size: 120, ar: true}]} />
			</AbsoluteFill>
		);
	}
	// C: in the morning the house was a ruin - and the hoofprints all around their footprints
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={pop}>
				<Stage set="ruin_dawn" z={1.2} f={[900, 600]} t={0}>
					<g transform="translate(0 0)">
						<Prints x0={200} x1={1700} y0={1000} y1={1075} feet={10} hooves={90} seed={5} />
					</g>
					<Person is={Noura} name="noura" x={1300} y={1075} s={2.2} frame={0} back arms="down" idle={false} noqa />
				</Stage>
			</AbsoluteFill>
			<Words x={60} y={50} rot={-3} lines={[{t: 'THE HOUSE', c: '#fff', size: 170}, {t: "WASN'T THERE", c: '#ffd34a', size: 170}]} />
			<Words x={60} y={820} rot={-2} lines={[{t: 'KUWAIT, 1997', c: '#fff', size: 110}]} />
		</AbsoluteFill>
	);
};
