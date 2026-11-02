/**
 * Editorial anime portraits of the two public figures named in the script
 * (brief A03, A05): neutral, silent, respectful — no caricature, no speech,
 * no invented action. Code-drawn stand-ins until commissioned portraits are
 * supplied. Motion is limited to blinks, breathing and a slight head drift.
 */
import React from 'react';
import {random} from 'remotion';
import {blinkAt, breathe} from '../fx';
import type {LayerSpec} from '../placeholders';

const LINE = '#2a1a1c';
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{children}
	</svg>
);

/** Neutral studio-style backdrop: soft gradient and out-of-focus lights. */
const backdrop = (key: string, top: string, bottom: string, bokeh: string[]): LayerSpec => ({
	depth: 0,
	node: (f) => (
		<Svg>
			<defs>
				<linearGradient id={`pbg${key}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={top} />
					<stop offset="1" stopColor={bottom} />
				</linearGradient>
			</defs>
			<rect width="1920" height="1080" fill={`url(#pbg${key})`} />
			{Array.from({length: 26}, (_, i) => (
				<circle
					key={i}
					cx={random(`${key}bx${i}`) * 1920 + Math.sin(f * 0.01 + i) * 10}
					cy={random(`${key}by${i}`) * 900}
					r={24 + random(`${key}br${i}`) * 70}
					fill={bokeh[i % bokeh.length]}
					opacity={0.08 + 0.1 * Math.abs(Math.sin(f * 0.02 + i))}
				/>
			))}
			<rect x="0" y="0" width="1920" height="1080" fill="#000" opacity="0.15" />
		</Svg>
	),
});

type EyeProps = {cx: number; cy: number; w: number; h: number; blink: number; look: number; iris: string; lineW?: number};
/** Adult (older) anime eye: narrower opening, heavy upper lid line, small iris, one highlight. */
const Eye: React.FC<EyeProps & {id: string}> = ({id, cx, cy, w, h, blink, look, iris, lineW = 3.6}) => {
	if (blink > 0.55) return <path d={`M${cx - w / 2},${cy} Q${cx},${cy + h * 0.45} ${cx + w / 2},${cy - h * 0.05}`} stroke={LINE} strokeWidth={lineW} fill="none" strokeLinecap="round" />;
	const o = 1 - blink * 0.6;
	const white = `M${cx - w / 2},${cy} Q${cx - w * 0.1},${cy - h * o} ${cx + w / 2},${cy - h * 0.15} Q${cx + w * 0.1},${cy + h * 0.55} ${cx - w / 2},${cy} Z`;
	return (
		<g>
			<clipPath id={`pe-${id}`}>
				<path d={white} />
			</clipPath>
			<path d={white} fill="#f4efe8" />
			<g clipPath={`url(#pe-${id})`}>
				<path d={white} fill="#c8b8b0" transform={`translate(0,${-h * 0.55})`} opacity="0.55" />
				<circle cx={cx + look} cy={cy - h * 0.2} r={h * 0.55} fill={iris} stroke={LINE} strokeWidth="1.2" />
				<circle cx={cx + look} cy={cy - h * 0.15} r={h * 0.26} fill="#140c0a" />
				<circle cx={cx + look - h * 0.2} cy={cy - h * 0.38} r={h * 0.13} fill="#fff" />
			</g>
			<path d={`M${cx - w / 2 - 4},${cy + 2} Q${cx - w * 0.1},${cy - h * o - 3} ${cx + w / 2 + 3},${cy - h * 0.18}`} stroke={LINE} strokeWidth={lineW} fill="none" strokeLinecap="round" />
			<path d={`M${cx - w * 0.3},${cy + h * 0.32} Q${cx + w * 0.05},${cy + h * 0.5} ${cx + w * 0.42},${cy + h * 0.1}`} stroke={LINE} strokeWidth={lineW * 0.4} fill="none" />
		</g>
	);
};

// ============================================================ A05
/** Benjamin Netanyahu — editorial anime portrait, 3/4 view facing screen-left. */
export const netanyahuPortrait: LayerSpec[] = [
	backdrop('a05', '#1c2333', '#0d0f16', ['#f0b46a', '#9ab8e8', '#f0d8a8']),
	{
		depth: 1,
		node: (f) => {
			const SKIN = '#e8c0a4';
			const SH = '#c18c76';
			const SH2 = '#a06f63';
			const HAIR = '#c9ccd4';
			const HAIR_SH = '#8e93a2';
			const HAIR_HI = '#f1f3f8';
			const AGE = '#b07e6e';
			const blink = blinkAt(f, 31, 60, 110);
			const br = breathe(f, 0.3, 110);
			const turn = Math.sin(f * 0.016) * 1.2;
			const look = -2 + Math.sin(f * 0.012) * 1.5;
			return (
				<Svg>
					<g transform={`translate(1110,438) scale(1.18) rotate(${turn}) translate(0,${br * 1.4})`}>
						<path d="M-60,170 L64,176 L68,270 L-64,266 Z" fill={SKIN} stroke={LINE} strokeWidth="2.4" />
						<path d="M-60,170 L64,176 L66,222 Q0,200 -62,218 Z" fill={SH} />
						<path d="M128,-26 C156,-36 166,8 154,44 C146,66 130,70 124,58" fill={SKIN} stroke={LINE} strokeWidth="2.4" />
						<path d="M140,-8 C150,6 148,28 138,42" stroke={SH2} strokeWidth="2.2" fill="none" />
						<path d="M108,-150 C134,-90 140,-10 132,62 C124,126 98,172 56,200 C28,216 -12,218 -44,204 C-80,186 -104,150 -112,100 C-118,56 -120,6 -116,-44 C-112,-94 -106,-132 -92,-162 Z" fill={SKIN} stroke={LINE} strokeWidth="2.8" strokeLinejoin="round" />
						<path d="M108,-150 C134,-90 140,-10 132,62 C124,126 98,172 56,200 C72,142 82,80 78,8 C74,-62 66,-112 54,-152 Z" fill={SH} />
						<path d="M-110,-50 C-70,-58 -26,-56 -4,-44 C28,-56 74,-60 112,-50 L112,-38 C74,-46 30,-42 -2,-30 C-26,-42 -70,-44 -110,-38 Z" fill={SH} opacity="0.6" />
						<path d="M-106,-64 C-88,-78 -58,-82 -32,-72 L-34,-62 C-58,-68 -86,-66 -104,-54 Z" fill="#6f6a72" stroke={LINE} strokeWidth="1.4" />
						<path d="M6,-74 C34,-86 74,-84 102,-70 L100,-60 C74,-70 36,-70 8,-62 Z" fill="#6f6a72" stroke={LINE} strokeWidth="1.4" />
						<Eye id="bn-f" cx={-66} cy={-26} w={46} h={16} blink={blink} look={look * 0.8} iris="#5d6f80" />
						<Eye id="bn-n" cx={50} cy={-26} w={56} h={18} blink={blink} look={look} iris="#5d6f80" />
						<path d="M-88,-4 Q-66,6 -44,-2 M24,-2 Q50,10 78,0" stroke={AGE} strokeWidth="1.8" fill="none" />
						<path d="M-30,-18 C-36,8 -46,34 -52,56 C-48,68 -38,72 -26,70" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
						<path d="M-26,70 C-16,76 -4,74 6,68" stroke={LINE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
						<path d="M-24,-10 C-16,16 -8,44 -4,66 L4,66 C2,44 -6,16 -14,-10 Z" fill={SH} opacity="0.55" />
						<path d="M-78,-112 Q-14,-124 60,-114 M-68,-98 Q-14,-108 52,-100" stroke={AGE} strokeWidth="1.6" fill="none" opacity="0.6" />
						<path d="M-42,88 Q-62,114 -62,142 M34,88 Q58,116 52,146" stroke={AGE} strokeWidth="2.2" fill="none" />
						<path d="M-46,136 Q-12,130 26,138" stroke={LINE} strokeWidth="2.8" fill="none" strokeLinecap="round" />
						<path d="M-30,150 Q-10,156 10,150" stroke={SH2} strokeWidth="1.8" fill="none" />
						<path d="M132,62 C124,126 98,172 56,200" stroke="#f0b46a" strokeWidth="3.2" fill="none" opacity="0.7" />
						{/* silver hair, swept back from a side part, receding at the temples */}
						<path d="M-112,-74 C-118,-120 -104,-170 -60,-196 C-10,-226 70,-226 126,-196 C166,-170 178,-110 168,-60 C162,-30 150,-10 140,4 L134,-40 C130,-90 112,-124 80,-138 C40,-152 -10,-150 -50,-140 C-70,-120 -86,-100 -100,-80 Z" fill={HAIR} stroke={LINE} strokeWidth="2.8" strokeLinejoin="round" />
						<path d="M80,-138 C112,-124 130,-90 134,-40 L140,4 C150,-10 162,-30 168,-60 C178,-110 166,-170 126,-196 C150,-160 140,-150 80,-138 Z" fill={HAIR_SH} />
						<path d="M-60,-150 C-40,-192 20,-210 84,-198 C40,-186 0,-172 -30,-146 Z" fill={HAIR_HI} opacity="0.6" />
						<path d="M-40,-150 C10,-168 70,-176 124,-168" stroke={HAIR_SH} strokeWidth="3" fill="none" strokeLinecap="round" />
						<path d="M-50,-176 C0,-200 70,-204 140,-176 M-24,-160 C24,-180 84,-186 152,-150 M4,-146 C44,-160 104,-160 158,-118" stroke={HAIR_SH} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />
						<path d="M-40,-192 C10,-214 70,-214 112,-196" stroke={HAIR_HI} strokeWidth="5" fill="none" strokeLinecap="round" />
						<path d="M132,-40 C138,-20 140,-6 136,12" stroke={HAIR} strokeWidth="9" fill="none" strokeLinecap="round" />
					</g>
					{/* suit, shirt, tie */}
					<g transform={`translate(0,${20 + br * 3})`}>
						<path d="M760,1080 C770,900 830,790 950,740 C1010,716 1060,700 1110,698 C1170,700 1230,716 1290,742 C1400,790 1460,900 1470,1080 Z" fill="#1c2638" stroke={LINE} strokeWidth="3.2" />
						<path d="M1290,742 C1400,790 1460,900 1470,1080 L1360,1080 C1350,940 1320,820 1250,760 Z" fill="#111827" />
						<path d="M1050,700 L1110,780 L1170,700 L1150,690 L1110,740 L1070,690 Z" fill="#f2f2f4" stroke={LINE} strokeWidth="2.4" />
						<path d="M1096,742 L1124,742 L1134,960 L1110,990 L1086,960 Z" fill="#2b3f6e" stroke={LINE} strokeWidth="2.4" />
						<path d="M1096,742 L1106,742 L1098,968 L1086,960 Z" fill="#1d2c52" />
						<path d="M1010,712 L1060,860 L1000,900 M1210,712 L1160,860 L1220,900" stroke={LINE} strokeWidth="2.6" fill="none" />
						<path d="M1290,742 C1380,780 1440,860 1462,980" stroke="#f0b46a" strokeWidth="4" fill="none" opacity="0.6" />
					</g>
				</Svg>
			);
		},
	},
];

// ============================================================ A03
/** Abbas Araghchi — editorial anime portrait, 3/4 view facing screen-left. */
export const araghchiPortrait: LayerSpec[] = [
	backdrop('a03', '#2a2320', '#12100e', ['#e8c27a', '#c9a46a', '#9ab0c8']),
	{
		depth: 1,
		node: (f) => {
			const SKIN = '#e2b89c';
			const SH = '#b8866f';
			const SH2 = '#996a5e';
			const HAIR = '#a9adb6';
			const HAIR_SH = '#7c818c';
			const BEARD = '#b4b7be';
			const BEARD_SH = '#80858f';
			const blink = blinkAt(f, 47, 64, 112);
			const br = breathe(f, 1.2, 104);
			const turn = Math.sin(f * 0.014 + 1) * 1.1;
			const look = -1.5 + Math.sin(f * 0.013) * 1.5;
			const g = (f % 120) / 120; // occasional lens glint
			const gx = -140 + g * 380;
			return (
				<Svg>
					<g transform={`translate(1110,440) scale(1.18) rotate(${turn}) translate(0,${br * 1.4})`}>
						<path d="M-58,166 L62,172 L66,266 L-62,262 Z" fill={SKIN} stroke={LINE} strokeWidth="2.4" />
						<path d="M124,-22 C152,-32 162,10 150,44 C142,64 126,68 120,56" fill={SKIN} stroke={LINE} strokeWidth="2.4" />
						<path d="M104,-148 C128,-90 134,-12 128,56 C120,118 96,164 54,192 C26,208 -12,210 -42,196 C-78,178 -100,144 -108,96 C-114,54 -116,4 -112,-44 C-108,-92 -102,-130 -88,-160 Z" fill={SKIN} stroke={LINE} strokeWidth="2.8" strokeLinejoin="round" />
						<path d="M104,-148 C128,-90 134,-12 128,56 C120,118 96,164 54,192 C70,136 80,74 76,6 C72,-62 64,-110 52,-150 Z" fill={SH} />
						{/* trimmed grey beard and moustache */}
						<path d="M128,40 C124,112 98,164 54,194 C26,210 -12,212 -42,198 C-78,180 -100,146 -108,100 C-92,120 -74,130 -58,128 C-46,152 -12,162 18,152 C42,142 58,122 64,100 C88,96 112,76 128,40 Z" fill={BEARD} stroke={LINE} strokeWidth="2.2" strokeLinejoin="round" />
						<path d="M128,40 C124,112 98,164 54,194 C64,152 76,110 84,80 C102,74 118,60 128,40 Z" fill={BEARD_SH} />
						<path d="M-60,96 C-44,86 -12,84 10,90 C26,84 50,86 62,98 C44,104 24,106 8,102 C-14,108 -42,106 -60,96 Z" fill={BEARD} stroke={LINE} strokeWidth="1.8" />
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<path key={i} d={`M${-64 + i * 32},${152 + (i % 2) * 6} l4,10`} stroke={BEARD_SH} strokeWidth="2" />
						))}
						<path d="M-36,120 Q-8,126 22,120" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
						<path d="M-104,-62 C-84,-74 -56,-76 -32,-68 L-34,-58 C-56,-64 -82,-62 -102,-52 Z" fill="#7a7e88" stroke={LINE} strokeWidth="1.3" />
						<path d="M6,-70 C34,-80 72,-78 98,-64 L96,-56 C70,-66 36,-66 8,-58 Z" fill="#7a7e88" stroke={LINE} strokeWidth="1.3" />
						<Eye id="aa-f" cx={-64} cy={-22} w={44} h={16} blink={blink} look={look * 0.8} iris="#4a3426" />
						<Eye id="aa-n" cx={50} cy={-22} w={54} h={17} blink={blink} look={look} iris="#4a3426" />
						<path d="M-84,-2 Q-64,6 -44,0 M26,0 Q50,10 74,2" stroke={SH2} strokeWidth="1.5" fill="none" opacity="0.8" />
						<path d="M-28,-14 C-34,10 -44,34 -50,54 C-46,66 -36,70 -24,68" stroke={LINE} strokeWidth="2.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
						<path d="M-22,-8 C-14,16 -8,42 -4,64 L4,64 C2,42 -4,14 -12,-8 Z" fill={SH} opacity="0.55" />
						{/* thin rimless glasses + occasional glint */}
						<clipPath id="aa-lens">
							<rect x={-96} y={-44} width={64} height={40} rx={8} />
							<rect x={12} y={-46} width={78} height={42} rx={8} />
						</clipPath>
						<rect x={-96} y={-44} width={64} height={40} rx={8} fill="#c8d6ea" opacity="0.12" stroke="#8d97aa" strokeWidth="1.5" />
						<rect x={12} y={-46} width={78} height={42} rx={8} fill="#c8d6ea" opacity="0.12" stroke="#8d97aa" strokeWidth="1.5" />
						<path d="M-32,-30 Q-10,-38 12,-30" stroke="#8d97aa" strokeWidth="1.8" fill="none" />
						<path d="M90,-32 L124,-20" stroke="#8d97aa" strokeWidth="1.8" />
						<g clipPath="url(#aa-lens)">
							<rect x={gx} y={-80} width={12} height={110} fill="#fff" opacity="0.75" transform={`rotate(25,${gx},-20)`} />
						</g>
						{/* short grey hair, receding, neatly cut */}
						<path d="M-108,-84 C-116,-140 -72,-190 -4,-200 C66,-208 132,-176 148,-112 C156,-72 148,-34 132,-6 L124,-48 C120,-96 102,-124 70,-132 C24,-142 -36,-136 -80,-116 C-94,-104 -102,-94 -108,-84 Z" fill={HAIR} stroke={LINE} strokeWidth="2.8" strokeLinejoin="round" />
						<path d="M70,-132 C102,-124 120,-96 124,-48 L132,-6 C148,-34 156,-72 148,-112 C136,-162 104,-188 66,-196 C92,-172 104,-150 70,-132 Z" fill={HAIR_SH} />
						<path d="M-70,-170 C-20,-192 50,-194 110,-170 M-60,-150 C-10,-170 50,-172 120,-146" stroke={HAIR_SH} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.8" />
						<path d="M-60,-178 C-10,-198 56,-198 104,-178" stroke="#dfe2e8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
						<path d="M128,56 C120,118 96,164 54,192" stroke="#e8c27a" strokeWidth="3.2" fill="none" opacity="0.6" />
					</g>
					{/* dark suit, white shirt buttoned, no tie */}
					<g transform={`translate(0,${20 + br * 3})`}>
						<path d="M770,1080 C780,900 836,792 950,744 C1010,718 1060,704 1110,702 C1166,704 1222,718 1282,746 C1392,794 1450,900 1460,1080 Z" fill="#26282e" stroke={LINE} strokeWidth="3.2" />
						<path d="M1282,746 C1392,794 1450,900 1460,1080 L1350,1080 C1340,940 1310,822 1244,764 Z" fill="#17181c" />
						<path d="M1040,704 L1110,800 L1180,704 L1170,736 L1110,840 L1050,736 Z" fill="#f4f4f2" stroke={LINE} strokeWidth="2.4" />
						<path d="M1068,700 L1110,744 L1152,700" stroke={LINE} strokeWidth="2.4" fill="#f4f4f2" />
						<circle cx="1110" cy="770" r="4" fill="#c8c8c8" stroke={LINE} strokeWidth="1.4" />
						<path d="M1000,716 L1060,870 L996,910 M1220,716 L1160,870 L1224,910" stroke={LINE} strokeWidth="2.6" fill="none" />
					</g>
				</Svg>
			);
		},
	},
];
