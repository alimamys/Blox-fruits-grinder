/**
 * Anime character rigs (original, anonymous / fictional people only).
 * Conventions: thin dark-brown lineart, large layered eyes with gradient irises
 * and twin highlights, hair as pointed clumps with a shine band, two-tone cel
 * shading, blush, rim light from the scene's key light.
 */
import React from 'react';
import {blinkAt, breathe} from '../fx';

const LINE = '#2a1a1c';

// ------------------------------------------------------------------ eyes
type EyeProps = {
	id: string;
	white: string; // path of the eye opening
	lash: string; // filled upper-lash shape
	lower: string; // stroked lower-lash curve
	closed: string; // stroked closed-eye arc
	iris: {cx: number; cy: number; rx: number; ry: number};
	look: [number, number];
	blink: number;
	lineW?: number;
	irisTop?: string;
	irisBottom?: string;
};

const Eye: React.FC<EyeProps> = ({id, white, lash, lower, closed, iris, look, blink, lineW = 2.2, irisTop = '#24130e', irisBottom = '#c9843f'}) => {
	if (blink > 0.55) return <path d={closed} stroke={LINE} strokeWidth={lineW * 1.8} fill="none" strokeLinecap="round" />;
	const sy = 1 - blink * 0.7;
	const cx = iris.cx + look[0];
	const cy = iris.cy + look[1];
	return (
		<g transform={`translate(0,${iris.cy - iris.ry}) scale(1,${sy}) translate(0,${-(iris.cy - iris.ry)})`}>
			<defs>
				<linearGradient id={`ir-${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={irisTop} />
					<stop offset="0.55" stopColor={irisTop} stopOpacity="0.85" />
					<stop offset="1" stopColor={irisBottom} />
				</linearGradient>
				<clipPath id={`ec-${id}`}>
					<path d={white} />
				</clipPath>
			</defs>
			<path d={white} fill="#fbf6ef" />
			<g clipPath={`url(#ec-${id})`}>
				{/* shadow cast by the upper lid */}
				<path d={white} fill="#c9b8c8" transform={`translate(0,${-iris.ry * 0.8})`} opacity="0.4" />
				<ellipse cx={cx} cy={cy} rx={iris.rx} ry={iris.ry} fill={`url(#ir-${id})`} stroke={LINE} strokeWidth={1.2} />
				<ellipse cx={cx} cy={cy + iris.ry * 0.12} rx={iris.rx * 0.46} ry={iris.ry * 0.5} fill="#130a08" />
				<ellipse cx={cx - iris.rx * 0.38} cy={cy - iris.ry * 0.42} rx={iris.rx * 0.34} ry={iris.ry * 0.3} fill="#fff" />
				<circle cx={cx + iris.rx * 0.42} cy={cy + iris.ry * 0.44} r={iris.rx * 0.15} fill="#fff" />
				<path d={`M${cx - iris.rx * 0.8},${cy + iris.ry * 0.55} Q${cx},${cy + iris.ry * 0.95} ${cx + iris.rx * 0.8},${cy + iris.ry * 0.55}`} stroke="#f2b36a" strokeWidth={1.4} fill="none" opacity="0.7" />
			</g>
			<path d={lash} fill={LINE} />
			<path d={lower} stroke={LINE} strokeWidth={lineW * 0.7} fill="none" strokeLinecap="round" />
		</g>
	);
};

// ======================================================= evacuee (A06)
/** Anonymous adult woman seated on an evacuation bus, 3/4 view facing the window (screen right). */
export const Evacuee: React.FC<{f: number}> = ({f}) => {
	const SKIN = '#f1cbb2';
	const SKIN_SH = '#cf9a86';
	const SKIN_SH2 = '#a9786e';
	const HAIR = '#33263a';
	const HAIR_SH = '#1c1522';
	const HAIR_HI = '#5e4b6e';
	const HAIR_SHINE = '#9a86b0';
	const RIM = '#d6e6ff';
	const COAT = '#34405a';
	const COAT_SH = '#1f2738';
	const COAT_HI = '#56627e';

	const blink = blinkAt(f, 6, 50, 90);
	const br = breathe(f, 1, 96);
	const jolt = Math.sin(f * 1.7) * 0.8 + Math.sin(f * 0.9) * 0.6;
	const cyc = (f % 150) / 150; // looks out of the window, down at the bag, back again
	const look = cyc < 0.55 ? 1 : cyc < 0.75 ? 1 - (cyc - 0.55) / 0.2 : (cyc - 0.75) / 0.25;
	const lx = -3 + 7 * look;
	const ly = 4 * (1 - look);
	const tilt = -3 + 4 * look;
	const grip = Math.max(0, Math.sin(f * 0.07)) ** 3;
	const bagSwing = Math.sin(f * 0.11) * 1.4 + jolt * 0.3;
	const hairSway = (i: number) => Math.sin(f * 0.09 + i) * 2.5 + jolt * 0.6;

	return (
		<g transform={`translate(0,${jolt})`}>
			{/* ---------------- body: coat, scarf (breathing) */}
			<g transform={`translate(770,360) translate(0,${br * 2.4})`}>
				<path d="M-150,172 C-215,205 -262,268 -282,420 L-300,760 L340,760 L318,420 C300,292 252,214 178,178 C120,158 60,160 18,168 C-40,174 -100,166 -150,172 Z" fill={COAT} stroke={LINE} strokeWidth="3" />
				<path d="M-150,172 C-215,205 -262,268 -282,420 L-300,760 L-120,760 C-150,600 -160,420 -120,260 C-110,220 -130,190 -150,172 Z" fill={COAT_SH} />
				<path d="M178,178 C252,214 300,292 318,420" stroke={RIM} strokeWidth="4" fill="none" opacity="0.7" />
				{/* coat folds and lapel */}
				<path d="M-20,230 C10,330 0,450 -30,600" stroke={LINE} strokeWidth="2.4" fill="none" opacity="0.8" />
				<path d="M120,240 C150,330 170,420 160,560" stroke={COAT_SH} strokeWidth="10" fill="none" />
				<path d="M60,200 L110,300 L80,320" stroke={LINE} strokeWidth="2.4" fill="none" />
				<path d="M-60,210 C-40,250 -40,300 -60,340" stroke={COAT_HI} strokeWidth="3" fill="none" opacity="0.6" />
				{/* rust scarf */}
				<path d="M-70,150 C-30,196 66,198 112,158 L124,196 C70,244 -30,246 -82,196 Z" fill="#8f3b31" stroke={LINE} strokeWidth="3" />
				<path d="M-70,150 C-50,175 -20,188 10,192 L6,232 C-30,230 -62,216 -82,196 Z" fill="#5f2620" />
				<path d="M20,236 L34,300 L60,296 L50,232 Z" fill="#7c3129" stroke={LINE} strokeWidth="2.4" />
			</g>

			{/* ---------------- head (3/4 view facing right) */}
			<g transform={`translate(770,360) rotate(${tilt}) translate(0,${br * 1.4})`}>
				{/* back hair */}
				<path
					transform={`rotate(${hairSway(0) * 0.3},0,-60)`}
					d="M-118,-60 C-130,-150 -40,-200 30,-188 C110,-178 140,-110 128,-40 C124,10 118,60 104,112 C96,132 80,138 70,128 L60,60 L-60,60 C-80,112 -100,142 -122,130 C-138,92 -130,20 -118,-60 Z"
					fill={HAIR_SH}
					stroke={LINE}
					strokeWidth="3"
				/>
				{/* neck */}
				<path d="M-32,96 L24,108 L28,178 L-36,172 Z" fill={SKIN} stroke={LINE} strokeWidth="2.6" />
				<path d="M-32,96 L24,108 L26,140 Q-6,126 -34,132 Z" fill={SKIN_SH} />
				{/* face */}
				<path d="M-86,-60 C-94,0 -88,56 -52,100 C-30,122 0,134 26,136 C46,128 66,108 80,74 C90,44 94,0 88,-60 Z" fill={SKIN} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
				<path d="M-86,-60 C-94,0 -88,56 -52,100 C-62,60 -70,16 -64,-34 Z" fill={SKIN_SH} />
				<path d="M88,-40 C92,0 88,44 80,74 C66,108 46,128 26,136" stroke={RIM} strokeWidth="3.5" fill="none" opacity="0.85" />
				{/* hard cel shadow cast by the fringe */}
				<path d="M-86,-60 L88,-60 L88,-30 L74,-36 L62,-20 L46,-38 L30,-16 L14,-36 L-4,-18 L-20,-38 L-38,-18 L-52,-38 L-70,-22 L-86,-34 Z" fill={SKIN_SH} />
				{/* blush */}
				<ellipse cx="-40" cy="44" rx="22" ry="8" fill="#ec8f8f" opacity="0.32" />
				<ellipse cx="58" cy="42" rx="13" ry="6" fill="#ec8f8f" opacity="0.32" />
				{/* eyes */}
				<Eye
					id="ev-n"
					white="M-76,6 C-66,-16 -30,-28 -6,8 C-14,32 -50,42 -72,22 Z"
					lash="M-84,8 L-94,-6 L-79,-1 C-66,-24 -28,-32 -1,6 L-7,11 C-30,-22 -64,-14 -77,8 Z"
					lower="M-68,28 C-50,40 -26,38 -12,24"
					closed="M-78,14 C-58,30 -24,30 -4,14"
					iris={{cx: -40, cy: 9, rx: 16, ry: 22}}
					look={[lx, ly]}
					blink={blink}
				/>
				<Eye
					id="ev-f"
					white="M28,12 C38,-16 66,-24 80,2 C72,28 46,36 32,26 Z"
					lash="M24,12 C36,-22 70,-30 82,0 L91,-9 L86,7 C70,-18 40,-14 29,15 Z"
					lower="M36,30 C50,36 66,32 74,20"
					closed="M28,16 C44,28 68,26 80,8"
					iris={{cx: 55, cy: 9, rx: 11, ry: 21}}
					look={[lx * 0.8, ly]}
					blink={blink}
				/>
				{/* brows: slightly raised at the inner ends (worried, restrained) */}
				<path d={`M-72,-30 Q-46,-${40 + look * 2} -16,-${46 + look * 2}`} stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
				<path d={`M30,-${48 + look * 2} Q56,-${46 + look * 2} 80,-32`} stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
				{/* nose and mouth */}
				<path d="M24,42 L32,58 L23,60" stroke={LINE} strokeWidth="2" fill="none" strokeLinejoin="round" />
				<path d="M8,86 Q20,84 32,88" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
				<path d="M14,94 Q20,96 26,94" stroke={SKIN_SH2} strokeWidth="1.6" fill="none" />
				{/* fringe (pointed clumps), side locks, shine band */}
				<path
					d="M-104,-70 C-100,-150 -20,-192 40,-180 C112,-168 138,-112 122,-40 L112,-34 L100,-66 L88,-30 L74,-62 L58,-36 L46,-68 L28,-28 L16,-64 L-4,-32 L-14,-66 L-34,-30 L-46,-64 L-66,-34 L-74,-58 L-92,-26 L-98,-46 Z"
					fill={HAIR}
					stroke={LINE}
					strokeWidth="3"
					strokeLinejoin="round"
				/>
				<path d="M-60,-100 Q-50,-60 -46,-60 M10,-120 Q18,-70 16,-60 M60,-110 Q66,-70 58,-18" stroke={HAIR_SH} strokeWidth="5" fill="none" strokeLinecap="round" />
				<path d="M-70,-122 Q-20,-152 40,-150 Q82,-142 106,-114 L98,-106 L88,-120 L78,-106 L66,-126 L54,-110 L40,-130 L26,-112 L12,-132 L-4,-114 L-20,-130 L-36,-110 L-50,-126 L-64,-108 Z" fill={HAIR_HI} opacity="0.9" />
				<path d="M-40,-134 Q0,-150 40,-146" stroke={HAIR_SHINE} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
				<path transform={`rotate(${hairSway(1)},-96,-40)`} d="M-98,-50 C-108,10 -102,72 -86,124 L-76,98 L-70,126 C-78,72 -80,12 -76,-40 Z" fill={HAIR} stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
				<path transform={`rotate(${hairSway(2)},110,-40)`} d="M112,-44 C118,18 112,72 96,118 L92,92 L84,114 C94,62 98,10 92,-40 Z" fill={HAIR} stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
				<path d="M122,-40 C126,0 120,60 104,112" stroke={RIM} strokeWidth="3" fill="none" opacity="0.6" />
			</g>

			{/* ---------------- bag + hand */}
			<g transform={`rotate(${bagSwing},575,700)`}>
				<path d="M512,786 Q575,700 646,786" stroke="#2a1d16" strokeWidth="13" fill="none" strokeLinecap="round" />
				<path d="M512,786 Q575,700 646,786" stroke="#5a4232" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
				<rect x="436" y="780" width="280" height="174" rx="34" fill="#5b4334" stroke={LINE} strokeWidth="3.2" />
				<path d="M436,820 Q436,780 470,780 L560,780 Q520,860 530,954 L470,954 Q436,954 436,920 Z" fill="#3f2d23" />
				<path d="M460,786 L700,786" stroke="#c9a27a" strokeWidth="3" opacity="0.7" />
				<path d="M452,846 L702,846" stroke={LINE} strokeWidth="2.6" />
				<path d="M452,850 L702,850" stroke="#8a6a52" strokeWidth="2" strokeDasharray="6 6" />
				<rect x="610" y="836" width="22" height="18" rx="3" fill="#b9a07a" stroke={LINE} strokeWidth="2" />
			</g>
			<g transform={`translate(${grip * -2},${grip * 3})`}>
				{/* sleeve */}
				<path d="M640,560 C664,610 652,670 626,716 L552,712 C574,662 584,612 570,566 Z" fill={COAT} stroke={LINE} strokeWidth="3" />
				<path d="M570,566 C584,612 574,662 552,712 L578,714 C598,664 604,612 594,566 Z" fill={COAT_SH} />
				{/* hand gripping the handle: back of the hand, thumb over the front, four curled fingers */}
				<path d="M556,706 C562,698 604,696 622,704 C628,720 626,738 620,750 L560,752 C553,740 551,722 556,706 Z" fill={SKIN} stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
				<path d="M556,706 C552,722 553,740 560,752 L572,752 C566,736 566,718 570,704 Z" fill={SKIN_SH} />
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={560 + i * 15} y={742 + grip * 2} width={15} height={22 - grip * 2} rx={7} fill={i === 0 ? SKIN_SH : SKIN} stroke={LINE} strokeWidth="2.2" />
				))}
				<path d="M560,716 C547,726 547,746 557,758 C563,763 572,758 570,749 C566,739 568,729 575,722 Z" fill={SKIN} stroke={LINE} strokeWidth="2.4" strokeLinejoin="round" />
				<path d="M566,744 Q591,739 618,744" stroke="#fff4ea" strokeWidth="1.6" fill="none" opacity="0.55" />
				<path d="M600,700 C612,702 620,708 622,716" stroke="#d6e6ff" strokeWidth="2.2" fill="none" opacity="0.7" />
			</g>
		</g>
	);
};

// ======================================================= analyst (A11)
/** Fictional adult financial analyst in profile, facing the monitor (screen right). */
export const Analyst: React.FC<{f: number}> = ({f}) => {
	const SKIN = '#e9bca6';
	const SKIN_SH = '#9e6c69';
	const HAIR = '#171a25';
	const HAIR_HI = '#3f4a6a';
	const RED = '#ff4a3d';

	const blink = blinkAt(f, 11, 46, 84);
	const br = breathe(f, 2, 120);
	const scan = Math.sin(f * 0.045) * 2.5;
	const furrow = 0.5 + 0.5 * Math.sin(f * 0.02);
	const glow = 0.8 + 0.2 * Math.sin(f * 1.3) * Math.sin(f * 0.21);
	const glint = (f % 96) / 96; // periodic lens glint sweep
	const g0 = -20 + glint * 260;

	return (
		<g>
			{/* torso: shirt, loosened tie */}
			<g transform={`translate(0,${br * 2})`}>
				<path d="M110,1080 C120,900 150,770 250,690 C320,640 430,628 520,650 C600,672 660,740 690,860 L720,1080 Z" fill="#c9ccd6" stroke={LINE} strokeWidth="3.2" />
				<path d="M110,1080 C120,900 150,770 250,690 C300,660 340,650 380,646 C300,720 260,880 270,1080 Z" fill="#8c90a0" />
				<path d="M520,650 C600,672 660,740 690,860" stroke={RED} strokeWidth="5" fill="none" opacity={0.75 * glow} />
				<path d="M400,650 L455,700 L505,648" stroke={LINE} strokeWidth="2.6" fill="#e2e4ea" />
				<path d="M444,690 L470,690 L486,820 L456,850 L432,818 Z" fill="#5c1d24" stroke={LINE} strokeWidth="2.6" />
				<path d="M444,690 L456,690 L446,830 L432,818 Z" fill="#3a1015" />
				<path d="M300,760 C320,820 330,900 320,1000" stroke="#7d8192" strokeWidth="4" fill="none" />
			</g>
			{/* head in profile */}
			<g transform={`translate(404,478) scale(1.38) translate(0,${br * 0.9}) rotate(${Math.sin(f * 0.015) * 1.2})`}>
				<path d="M-34,70 L30,82 L36,150 L-40,146 Z" fill={SKIN} stroke={LINE} strokeWidth="2.2" />
				<path d="M-34,70 L30,82 L32,108 Q0,96 -38,104 Z" fill={SKIN_SH} />
				<path
					d="M30,-110 C50,-100 60,-70 62,-44 L66,-30 C74,-14 84,0 90,8 L72,16 L76,28 L69,33 L74,42 C72,54 70,62 64,70 C50,86 30,96 6,96 C-20,94 -40,70 -46,40 L-60,-40 C-58,-90 -10,-118 30,-110 Z"
					fill={SKIN}
					stroke={LINE}
					strokeWidth="2.4"
					strokeLinejoin="round"
				/>
				<path d="M-60,-40 L-46,40 C-40,70 -20,94 6,96 C-6,70 -8,30 -2,-10 C2,-40 -20,-60 -60,-40 Z" fill={SKIN_SH} />
				<path d="M62,-44 L66,-30 C74,-14 84,0 90,8 L72,16 L76,28 L69,33 L74,42 C72,54 70,62 64,70" stroke={RED} strokeWidth="3.4" fill="none" opacity={glow} strokeLinejoin="round" />
				{/* ear */}
				<path d="M-30,-14 C-46,-20 -50,6 -40,20 C-34,30 -24,26 -22,16" fill={SKIN} stroke={LINE} strokeWidth="2" />
				<path d="M-36,-4 C-40,4 -38,12 -32,14" stroke={LINE} strokeWidth="1.4" fill="none" />
				{/* profile eye */}
				<Eye
					id="an"
					white="M30,-24 Q44,-30 56,-26 Q54,-16 48,-12 Q38,-12 31,-16 Z"
					lash="M24,-24 Q40,-36 58,-29 L62,-32 L58,-24 Q42,-31 27,-19 Z"
					lower="M33,-13 Q42,-10 50,-12"
					closed="M26,-20 Q42,-14 56,-22"
					iris={{cx: 47, cy: -20, rx: 5.5, ry: 8}}
					look={[scan, 0]}
					blink={blink}
					lineW={1.6}
					irisTop="#120a0a"
					irisBottom="#6a3a3a"
				/>
				<path d={`M24,${-42 + furrow * 2} Q42,${-50 + furrow * 3} 62,${-42 + furrow * 4}`} stroke={LINE} strokeWidth="2.8" fill="none" strokeLinecap="round" />
				{/* glasses: lens edge, frame, arm, and the anime lens glint */}
				<clipPath id="an-lens">
					<path d="M44,-38 L66,-36 L64,-6 L46,-8 Z" />
				</clipPath>
				<path d="M44,-38 L66,-36 L64,-6 L46,-8 Z" fill="#9fb4d8" opacity="0.18" stroke={LINE} strokeWidth="1.8" />
				<g clipPath="url(#an-lens)">
					<rect x={g0} y={-60} width="10" height="80" fill="#fff" opacity="0.9" transform={`rotate(25,${g0},-20)`} />
				</g>
				<path d="M44,-34 L-28,-26" stroke={LINE} strokeWidth="2" />
				{/* mouth corner */}
				<path d="M60,38 L70,37" stroke={LINE} strokeWidth="1.8" strokeLinecap="round" />
				{/* hair: spiky anime clumps + highlight */}
				<path
					d="M-66,-30 C-80,-100 -30,-150 30,-140 L58,-128 L44,-120 L78,-108 L52,-100 L74,-82 L46,-86 L54,-62 L32,-76 L22,-56 L8,-74 L-6,-52 L-18,-72 L-30,-48 L-40,-66 L-48,-20 L-56,30 L-70,10 Z"
					fill={HAIR}
					stroke={LINE}
					strokeWidth="2.4"
					strokeLinejoin="round"
				/>
				<path d="M-40,-118 Q0,-134 40,-126 L34,-118 L24,-124 L14,-114 L2,-124 L-10,-112 L-22,-122 L-34,-110 Z" fill={HAIR_HI} />
				<path d="M58,-128 L78,-108 L74,-82" stroke={RED} strokeWidth="2.4" fill="none" opacity={0.7 * glow} />
			</g>
		</g>
	);
};

// ======================================================= crowd person
const HAIRS = ['#1d1a20', '#4a2c22', '#6e3d24', '#c8a160', '#2c2a35', '#7a2a24'];
const CLOTHES = ['#2f4a6b', '#7a3a30', '#4f5d3a', '#2a2d36', '#6b6f82', '#8a6a3a', '#3a6a6a'];

/** Small anime background figure seen from behind/three-quarter, cel shaded. */
export const CrowdPerson: React.FC<{i: number}> = ({i}) => {
	const hair = HAIRS[i % HAIRS.length];
	const cloth = CLOTHES[(i * 3) % CLOTHES.length];
	const long = i % 3 === 0;
	return (
		<g>
			<path d="M-48,64 C-50,10 -30,-12 0,-14 C30,-12 50,10 48,64 Z" fill={cloth} stroke={LINE} strokeWidth="2.2" />
			<path d="M-48,64 C-50,10 -30,-12 0,-14 C-10,10 -14,40 -12,64 Z" fill="#000" opacity="0.28" />
			<path d="M30,-6 C44,6 48,30 48,64" stroke="#fff5e0" strokeWidth="2.2" fill="none" opacity="0.5" />
			<ellipse cx="0" cy="-40" rx="22" ry="25" fill="#e9c2a8" stroke={LINE} strokeWidth="2.2" />
			<path d={long ? 'M-26,-38 C-30,-70 26,-74 26,-40 C28,-20 24,6 18,18 L10,-20 L-12,-20 L-20,16 C-28,0 -28,-20 -26,-38 Z' : 'M-24,-36 C-28,-66 24,-72 25,-40 L18,-46 L10,-38 L2,-48 L-8,-38 L-16,-46 Z'} fill={hair} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
			<path d="M-12,-58 Q2,-64 14,-58" stroke="#fff" strokeWidth="2.4" fill="none" opacity="0.35" strokeLinecap="round" />
		</g>
	);
};
