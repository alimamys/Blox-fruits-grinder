// Thumbnails for the stick-figure Goatman, in the look of the earlier films: bright, big cartoon faces,
// 1-3 words of bold outlined text, a red arrow or circle.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BackTurned} from '../components/characters/Thing';
import {Nia} from '../components/characters/Cast';
import {Beam, Counts} from '../stick/goat';
import {Stage} from '../stick/kit';
import {Group, headOf, trailerSpec} from '../stick/places';
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
	const pop: React.CSSProperties = {filter: 'brightness(1.35) contrast(1.15) saturate(1.35)'};
	if (v === 'A') {
		// COUNT THEM.: the bench row with numbers - and one with no number, circled
		const names = ['nia', 'thing', 'kayla', 'lucia', 'tasha', 'andre'];
		const ppl = names.map((n) => trailerSpec(n, {frame: 30, idle: false, mouth: n === 'thing' ? 'flat' : 'o', eyes: n === 'thing' ? 'none' : 'wide', brows: n === 'thing' ? 'none' : 'worried', look: n === 'thing' ? [0, 0] : [0.4, -0.2]}));
		const heads = ppl.filter((p) => p.name !== 'thing').map(headOf);
		const th = headOf(ppl[1]);
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={pop}>
					<Stage set="trailer_night" z={1.75} f={[990, 640]} t={0} light="warm">
						<Group people={ppl} />
						<Counts heads={heads} t0={0} t={10} s={1.1} />
						<circle cx={th[0]} cy={th[1] + 70} r={110} fill="none" stroke="#e3261b" strokeWidth={12} />
					</Stage>
				</AbsoluteFill>
				<Words x={70} y={50} align="right" rot={-3} lines={[{t: 'COUNT', c: '#ffffff', size: 180}, {t: 'THEM.', c: '#ffd21a', size: 180}]} />
			</AbsoluteFill>
		);
	}
	if (v === 'B') {
		// DON'T LOOK: the torch catches a man standing in the trees with his back turned
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={{filter: 'brightness(1.6) contrast(1.2) saturate(1.2)'}}>
					<Stage set="trail_night" z={1.5} f={[1150, 600]} t={0} light="torch">
						<Beam from={[700, 820]} to={[1300, 600]} w={230} k={2.4} />
						<ellipse cx={1300} cy={640} rx={260} ry={330} fill="#fff4c8" opacity={0.18} />
						<BackTurned x={1300} y={900} s={1.25} frame={30} />
						<g transform="translate(560 0)">
							<Nia x={0} y={1000} s={1.3} frame={null} prop="flashlight" eyes="wide" brows="worried" mouth="o" look={[1, -0.2]} />
						</g>
					</Stage>
				</AbsoluteFill>
				<Words x={60} y={40} rot={-4} lines={[{t: "DON'T", c: '#ffffff', size: 180}, {t: 'LOOK.', c: '#ff3b2f', size: 180}]} />
			</AbsoluteFill>
		);
	}
	// 12?: eleven little figures in a row and a twelfth that's only a shadow
	const cols = ['#8e2a2a', '#8a8f96', '#e2b33a', '#b49ad6', '#5d6b3c', '#e88a3a', '#e6a3b0', '#3e6b45', '#ece6d6', '#2c4f9a', '#2a2f3a'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #3a2a1a 0%, #0b0806 70%)'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				{[...cols, '#141416'].map((c, i) => {
					const x = 960 + (i - 5.5) * 150;
					const dark = i === 11;
					return (
						<g key={i}>
							<circle cx={x} cy={690} r={52} fill={dark ? '#141416' : '#d8b89a'} stroke={dark ? '#e3261b' : '#000'} strokeWidth={dark ? 8 : 6} />
							{!dark ? (
								<>
									<circle cx={x - 16} cy={684} r={7} fill="#111" />
									<circle cx={x + 16} cy={684} r={7} fill="#111" />
								</>
							) : (
								<>
									<circle cx={x - 16} cy={684} r={6} fill="#fff7d0" />
									<circle cx={x + 16} cy={684} r={6} fill="#fff7d0" />
								</>
							)}
							<rect x={x - 46} y={752} width={92} height={150} rx={22} fill={c} stroke="#000" strokeWidth={6} />
						</g>
					);
				})}
			</svg>
			<Words x={0} y={80} rot={0} lines={[{t: '11 WENT IN.', c: '#ffffff', size: 170}, {t: '12 CAME OUT.', c: '#ff3b2f', size: 170}]} />
		</AbsoluteFill>
	);
};
