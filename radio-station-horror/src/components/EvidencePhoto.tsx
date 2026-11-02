// "Realistic" fictional evidence: old photographs and case-file presentation.
// Deliberately different from the MS Paint style: gradients, blur, grain, sepia.
import React, {useId} from 'react';
import {FONT} from '../utils/fonts';

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');

/** Shared old-photo processing: sepia/fade + grain + slight blur. */
const PhotoDefs: React.FC<{id: string; sepia?: number; blur?: number}> = ({id, sepia = 1, blur = 1.1}) => (
	<defs>
		<filter id={`photo${id}`} x="-5%" y="-5%" width="110%" height="110%">
			<feGaussianBlur stdDeviation={blur} result="b" />
			<feColorMatrix
				in="b"
				type="matrix"
				values={
					sepia > 0
						? '0.39 0.77 0.19 0 0.02  0.35 0.69 0.17 0 0.0  0.27 0.53 0.13 0 -0.02  0 0 0 1 0'
						: '0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0'
				}
				result="c"
			/>
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.35 0" result="nn" />
			<feBlend in="c" in2="nn" mode="overlay" />
		</filter>
		<radialGradient id={`vig${id}`} cx="50%" cy="45%" r="70%">
			<stop offset="55%" stopColor="#000" stopOpacity={0} />
			<stop offset="100%" stopColor="#000" stopOpacity={0.55} />
		</radialGradient>
	</defs>
);

/** Victor Hale, c. 1985. viewBox 400×500. Resembles the figure in the motel and on CCTV. */
export const VictorPortrait: React.FC<{width?: number; height?: number; sepia?: number; blur?: number}> = ({width = 400, height = 500, sepia = 1, blur = 1.1}) => {
	const id = uid(useId());
	return (
		<svg viewBox="0 0 400 500" width={width} height={height} style={{display: 'block'}}>
			<PhotoDefs id={id} sepia={sepia} blur={blur} />
			<defs>
				<radialGradient id={`bg${id}`} cx="45%" cy="35%" r="75%">
					<stop offset="0%" stopColor="#a5a39c" />
					<stop offset="100%" stopColor="#4c4a45" />
				</radialGradient>
				<radialGradient id={`face${id}`} cx="45%" cy="38%" r="65%">
					<stop offset="0%" stopColor="#e6e1d6" />
					<stop offset="70%" stopColor="#bdb6a9" />
					<stop offset="100%" stopColor="#7d766a" />
				</radialGradient>
				<linearGradient id={`hair${id}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#4a443d" />
					<stop offset="45%" stopColor="#24211e" />
					<stop offset="100%" stopColor="#141210" />
				</linearGradient>
				<filter id={`soft${id}`}>
					<feGaussianBlur stdDeviation={6} />
				</filter>
			</defs>
			<g filter={`url(#photo${id})`}>
				<rect width={400} height={500} fill={`url(#bg${id})`} />
				{/* cardigan + shirt */}
				<path d="M 20 500 C 40 430 70 400 130 385 L 168 362 L 232 362 L 270 385 C 330 400 360 430 380 500 Z" fill="#3b352d" />
				<path d="M 168 362 L 200 430 L 232 362 L 214 360 L 200 392 L 186 360 Z" fill="#d9d4c8" />
				<path d="M 200 430 L 186 500 M 200 430 L 214 500" stroke="#26221d" strokeWidth={4} />
				<circle cx={206} cy={455} r={4} fill="#1d1a16" />
				<circle cx={207} cy={485} r={4} fill="#1d1a16" />
				{/* neck */}
				<path d="M 172 300 L 170 368 Q 200 380 230 368 L 228 300 Z" fill="#b3ac9f" />
				<path d="M 172 330 Q 200 350 228 330 L 228 300 L 172 300 Z" fill="#8a8377" opacity={0.6} />
				{/* ears */}
				<ellipse cx={120} cy={238} rx={13} ry={26} fill="#a8a194" />
				<ellipse cx={280} cy={238} rx={13} ry={26} fill="#a8a194" />
				{/* face: long and gaunt */}
				<ellipse cx={200} cy={228} rx={80} ry={110} fill={`url(#face${id})`} />
				<g filter={`url(#soft${id})`} opacity={0.75}>
					<ellipse cx={150} cy={268} rx={16} ry={30} fill="#8a8579" opacity={0.5} />
					<ellipse cx={250} cy={268} rx={16} ry={30} fill="#8a8579" opacity={0.5} />
					<ellipse cx={166} cy={212} rx={26} ry={16} fill="#4a443b" />
					<ellipse cx={234} cy={212} rx={26} ry={16} fill="#4a443b" />
					<ellipse cx={200} cy={322} rx={34} ry={10} fill="#857e72" />
				</g>
				{/* eyes */}
				<ellipse cx={166} cy={214} rx={12} ry={6} fill="#e3ded2" />
				<ellipse cx={234} cy={214} rx={12} ry={6} fill="#e3ded2" />
				<circle cx={167} cy={214} r={5} fill="#1a1714" />
				<circle cx={233} cy={214} r={5} fill="#1a1714" />
				<path d="M 146 196 Q 166 188 186 196" stroke="#2a2621" strokeWidth={4} fill="none" />
				<path d="M 214 196 Q 234 188 254 196" stroke="#2a2621" strokeWidth={4} fill="none" />
				{/* nose */}
				<path d="M 203 218 Q 196 250 190 268 Q 200 276 212 268" stroke="#6b6458" strokeWidth={3.5} fill="none" />
				{/* mouth: thin, not smiling */}
				<path d="M 172 298 Q 200 302 228 297" stroke="#4e463e" strokeWidth={4} fill="none" />
				{/* slicked hair with side part */}
				<path d="M 118 214 C 112 150 150 112 205 112 C 258 112 290 150 282 214 C 270 170 250 150 205 146 C 175 146 150 160 140 178 C 132 190 124 205 118 214 Z" fill={`url(#hair${id})`} />
				<path d="M 170 116 C 168 128 160 142 150 156" stroke="#5c564d" strokeWidth={2} fill="none" />
				<rect width={400} height={500} fill={`url(#vig${id})`} />
			</g>
		</svg>
	);
};

/** Police photograph of Victor's apartment, 1987: the radio is on the desk. viewBox 640×440. */
export const ApartmentScenePhoto: React.FC<{width?: number; height?: number}> = ({width = 640, height = 440}) => {
	const id = uid(useId());
	return (
		<svg viewBox="0 0 640 440" width={width} height={height} style={{display: 'block'}}>
			<PhotoDefs id={id} sepia={1} blur={0.9} />
			<defs>
				<linearGradient id={`wall${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#8e8a7c" />
					<stop offset="100%" stopColor="#6b675a" />
				</linearGradient>
				<linearGradient id={`desk${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#6e5338" />
					<stop offset="100%" stopColor="#3d2c1c" />
				</linearGradient>
				<radialGradient id={`flash${id}`} cx="48%" cy="40%" r="55%">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.35} />
					<stop offset="100%" stopColor="#fff" stopOpacity={0} />
				</radialGradient>
				<pattern id={`wp${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 20 4 C 26 12 26 20 20 28 C 14 20 14 12 20 4 Z" fill="#7a7668" opacity={0.6} />
				</pattern>
			</defs>
			<g filter={`url(#photo${id})`}>
				<rect width={640} height={440} fill={`url(#wall${id})`} />
				<rect width={640} height={300} fill={`url(#wp${id})`} />
				{/* shelf with equipment */}
				<rect x={40} y={60} width={200} height={10} fill="#4a3826" />
				<rect x={60} y={20} width={70} height={40} fill="#2b2b28" />
				<rect x={140} y={30} width={80} height={30} fill="#3a3a36" />
				{/* desk */}
				<path d="M 0 300 L 640 285 L 640 440 L 0 440 Z" fill={`url(#desk${id})`} />
				<path d="M 0 300 L 640 285 L 640 296 L 0 312 Z" fill="#8a6b4a" />
				{/* papers / notebooks */}
				<path d="M 420 300 L 540 292 L 552 318 L 430 326 Z" fill="#d8d2c0" />
				<path d="M 450 296 L 560 290 L 568 310 L 456 316 Z" fill="#c9c2ae" />
				{/* mug */}
				<path d="M 570 250 L 600 250 L 597 292 L 573 292 Z" fill="#a8a294" />
				<path d="M 600 260 Q 616 268 600 282" stroke="#a8a294" strokeWidth={5} fill="none" />
				{/* THE RADIO */}
				<g transform="translate(150 160)">
					<rect x={-4} y={-2} width={250} height={140} rx={8} fill="#141414" />
					<rect x={6} y={8} width={230} height={120} rx={6} fill="#1e1e1e" />
					<circle cx={66} cy={74} r={46} fill="#0d0d0d" />
					{Array.from({length: 7}).map((_, i) => (
						<line key={i} x1={30} y1={44 + i * 10} x2={102} y2={44 + i * 10} stroke="#2e2e2e" strokeWidth={4} />
					))}
					<rect x={130} y={22} width={96} height={44} rx={3} fill="#c9b98c" />
					{Array.from({length: 12}).map((_, i) => (
						<line key={i} x1={136 + i * 8} y1={40} x2={136 + i * 8} y2={i % 3 === 0 ? 30 : 35} stroke="#4a3c22" strokeWidth={1.5} />
					))}
					<line x1={176} y1={24} x2={176} y2={64} stroke="#2a2a14" strokeWidth={2} />
					<circle cx={178} cy={100} r={22} fill="#2a2a2a" stroke="#3a3a3a" strokeWidth={3} />
					<circle cx={140} cy={104} r={10} fill="#2a2a2a" />
					<circle cx={220} cy={104} r={8} fill="#2a2a2a" />
					<path d="M 200 -2 L 120 -120" stroke="#9a9a92" strokeWidth={4} />
					<path d="M 40 0 Q 50 -28 120 -30 Q 190 -28 200 0" stroke="#111" strokeWidth={9} fill="none" />
				</g>
				{/* desk lamp */}
				<path d="M 470 290 L 470 200 L 520 150" stroke="#2d2d2a" strokeWidth={7} fill="none" />
				<path d="M 500 130 L 560 150 L 540 180 Z" fill="#3a3a36" />
				<rect width={640} height={440} fill={`url(#flash${id})`} />
				<rect width={640} height={440} fill={`url(#vig${id})`} />
			</g>
		</svg>
	);
};

/** A physical photo print with white border, optional label and paper clip. */
export const PhotoPrint: React.FC<{
	children: React.ReactNode;
	caption?: string;
	rotate?: number;
	clip?: boolean;
	style?: React.CSSProperties;
	border?: number;
}> = ({children, caption, rotate = 0, clip = true, style, border = 22}) => (
	<div
		style={{
			position: 'absolute',
			background: '#efe9da',
			padding: border,
			paddingBottom: caption ? border + 44 : border,
			boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)',
			transform: `rotate(${rotate}deg)`,
			...style,
		}}
	>
		{children}
		{caption && (
			<div style={{position: 'absolute', left: border, right: border, bottom: 12, fontFamily: FONT.typewriter, fontSize: 24, color: '#2a2620', letterSpacing: 1}}>
				{caption}
			</div>
		)}
		{clip && (
			<svg width={60} height={120} viewBox="0 0 60 120" style={{position: 'absolute', top: -40, left: 40}}>
				<path d="M 18 110 L 18 20 Q 18 6 30 6 Q 42 6 42 20 L 42 96 Q 42 104 34 104 Q 26 104 26 96 L 26 30" stroke="#9aa0a6" strokeWidth={6} fill="none" strokeLinecap="round" />
			</svg>
		)}
	</div>
);

/** Manila case-folder background with typed label. Fills its parent. */
export const CaseFolder: React.FC<{caseNo?: string; children?: React.ReactNode}> = ({caseNo = '87-1106', children}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			background: 'radial-gradient(ellipse at 40% 35%, #d9b978 0%, #b8954f 60%, #8a6c33 100%)',
		}}
	>
		<div
			style={{
				position: 'absolute',
				left: 90,
				top: 70,
				padding: '10px 26px',
				background: '#f1ead6',
				fontFamily: FONT.typewriter,
				fontSize: 34,
				color: '#262219',
				boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
				transform: 'rotate(-1.2deg)',
			}}
		>
			CASE No. {caseNo} — HALE, VICTOR — MISSING PERSON
		</div>
		<div
			style={{
				position: 'absolute',
				right: 120,
				top: 60,
				fontFamily: FONT.typewriter,
				fontSize: 64,
				color: 'rgba(170,20,20,0.75)',
				border: '6px solid rgba(170,20,20,0.75)',
				padding: '4px 22px',
				transform: 'rotate(8deg)',
				letterSpacing: 4,
			}}
		>
			UNSOLVED
		</div>
		{children}
	</div>
);
