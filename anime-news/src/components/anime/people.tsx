/**
 * Anonymous illustrative people for the Ukraine arrival scene (original,
 * not depicting any real survivor). Hands are kept hidden or very simple.
 */
import React from 'react';
import {blinkAt, breathe} from '../fx';

const LINE = '#2a1a1c';

/** Two adults in a quiet embrace: one seen from behind, one facing camera with closed, tearful eyes. */
export const Reunion: React.FC<{f: number}> = ({f}) => {
	const sway = Math.sin(f * 0.035) * 1.1;
	const br = breathe(f, 0.5, 90);
	const sob = Math.sin(f * 0.5) * Math.max(0, Math.sin(f * 0.04)) * 1.2; // shoulders tremble now and then
	const tear = 0.5 + 0.5 * Math.sin(f * 0.12);
	const squeeze = 0.5 + 0.5 * Math.sin(f * 0.05);
	return (
		<g transform={`rotate(${sway},845,1000)`}>
			{/* B: relative facing camera (behind A) — body */}
			<g transform={`translate(0,${br * 1.5 + sob})`}>
				<path d="M842,566 C884,532 966,526 1006,562 C1040,604 1050,720 1040,860 L930,860 L900,610 Z" fill="#a38c62" stroke={LINE} strokeWidth="3" />
				<path d="M1006,562 C1040,604 1050,720 1040,860 L1010,860 C1016,740 1008,630 984,580 Z" fill="#6f5e43" />
				<path d="M940,540 L990,548 L1000,580 L950,572 Z" fill="#5a6a7a" stroke={LINE} strokeWidth="2.4" />
			</g>
			{/* A's arm over B's shoulder (hand hidden behind B's head) */}
			<path d="M884,592 C906,566 930,530 958,512 L986,532 C962,552 938,592 918,620 Z" fill="#34405a" stroke={LINE} strokeWidth="3" />
			<path d="M884,592 C906,566 930,530 958,512 L966,520 C942,544 920,580 900,610 Z" fill="#1f2738" />
			{/* B: head with grey hair in a bun, eyes closed, tears */}
			<g transform={`translate(0,${br + sob * 0.6}) rotate(${-3 + squeeze},905,500)`}>
				<path d="M884,500 L928,504 L930,540 L886,538 Z" fill="#e6bfa6" stroke={LINE} strokeWidth="2.4" />
				<circle cx="944" cy="370" r="26" fill="#b9b3c2" stroke={LINE} strokeWidth="2.6" />
				<path d="M855,440 C855,395 885,375 912,377 C945,380 962,405 960,445 C958,480 938,505 908,508 C880,506 858,482 855,440 Z" fill="#efc8b0" stroke={LINE} strokeWidth="2.8" />
				<path d="M855,440 C858,482 880,506 908,508 C890,490 880,460 884,420 Z" fill="#cf9e88" />
				<path d="M850,430 C846,380 890,356 920,360 C956,364 972,396 966,440 L956,420 L948,436 L938,410 L926,428 L916,404 L902,424 L890,402 L876,426 L864,410 Z" fill="#b9b3c2" stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
				<path d="M870,388 Q910,370 950,388" stroke="#ece8f2" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
				{/* closed, squeezed eyes */}
				<path d={`M868,${448 - squeeze} Q882,${456 + squeeze} 896,${448 - squeeze}`} stroke={LINE} strokeWidth="3.2" fill="none" strokeLinecap="round" />
				<path d={`M916,${448 - squeeze} Q930,${456 + squeeze} 944,${448 - squeeze}`} stroke={LINE} strokeWidth="3.2" fill="none" strokeLinecap="round" />
				<path d="M868,430 L892,426 M920,426 L944,430" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
				<path d="M862,462 L868,458 M948,458 L954,462" stroke="#a9786e" strokeWidth="1.6" />
				{/* tears */}
				<path d={`M890,458 Q893,${468 + tear * 6} 889,${474 + tear * 8} Q885,${468 + tear * 6} 890,458 Z`} fill="#bfe3ff" stroke="#6aa7d8" strokeWidth="1.2" />
				<circle cx="889" cy={466 + tear * 6} r="1.6" fill="#fff" />
				<ellipse cx="878" cy="472" rx="12" ry="5" fill="#ec8f8f" opacity="0.4" />
				<ellipse cx="936" cy="472" rx="12" ry="5" fill="#ec8f8f" opacity="0.4" />
				<path d="M896,482 Q906,490 916,482 Q906,486 896,482 Z" fill="#7a2a2e" stroke={LINE} strokeWidth="2" />
			</g>
			{/* B's arm around A's back; its end tucks under A's hair */}
			<path d="M690,700 C702,650 746,600 802,572 L816,604 C772,624 732,668 714,722 Z" fill="#a38c62" stroke={LINE} strokeWidth="3" />
			<path d="M690,700 C702,650 746,600 802,572 L806,584 C760,606 724,650 704,712 Z" fill="#c9b184" />
			{/* A: seen from behind — coat, scarf, dark bob */}
			<g transform={`translate(0,${br * 2})`}>
				<path d="M700,600 C736,560 858,552 904,596 C940,656 960,820 975,1090 L630,1090 C648,870 660,670 700,600 Z" fill="#34405a" stroke={LINE} strokeWidth="3" />
				<path d="M700,600 C660,670 648,870 630,1090 L720,1090 C710,900 716,720 744,610 Z" fill="#1f2738" />
				<path d="M904,596 C940,656 960,820 975,1090" stroke="#ffd29a" strokeWidth="4" fill="none" opacity="0.7" />
				<path d="M760,640 C790,700 800,800 790,900" stroke={LINE} strokeWidth="2.2" fill="none" opacity="0.7" />
				<path d="M748,560 C790,590 860,592 892,566 L898,600 C860,626 784,624 744,596 Z" fill="#8f3b31" stroke={LINE} strokeWidth="2.6" />
			</g>
			<g transform={`translate(0,${br * 1.6}) rotate(${2 - squeeze},820,560)`}>
				<path d="M748,486 C746,426 794,396 836,400 C878,404 904,440 900,494 C897,540 870,578 828,582 C788,584 752,560 750,520 Z" fill="#33263a" stroke={LINE} strokeWidth="3" />
				<path d="M770,430 Q820,402 872,420" stroke="#9a86b0" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
				<path d="M760,470 Q770,520 790,556 M820,440 Q824,500 818,570 M870,460 Q874,520 860,566" stroke="#1c1522" strokeWidth="4" fill="none" strokeLinecap="round" />
				{[0, 1, 2].map((i) => (
					<path key={i} transform={`rotate(${Math.sin(f * 0.08 + i) * 2.5},${780 + i * 40},560)`} d={`M${770 + i * 40},560 L${780 + i * 40},590 L${792 + i * 40},560 Z`} fill="#33263a" />
				))}
				<path d="M900,494 C897,540 870,578 828,582" stroke="#ffd29a" strokeWidth="3" fill="none" opacity="0.6" />
			</g>
		</g>
	);
};

/** Small background volunteer at the tea table; optionally holding out a cup. */
export const Volunteer: React.FC<{x: number; y: number; s: number; f: number; hair: string; vest: string; offer?: boolean; seed?: number}> = ({x, y, s, f, hair, vest, offer, seed = 0}) => {
	const blink = blinkAt(f, 20 + seed, 60, 110);
	const reach = offer ? 0.5 + 0.5 * Math.sin(f * 0.05 + seed) : 0;
	const bob = breathe(f, seed, 100) * 1.5;
	return (
		<g transform={`translate(${x},${y + bob}) scale(${s})`}>
			<path d="M-46,120 C-48,40 -30,8 0,6 C30,8 48,40 46,120 Z" fill="#3a4a5e" stroke={LINE} strokeWidth="2.4" />
			<path d="M-34,24 L34,24 L38,110 L-38,110 Z" fill={vest} stroke={LINE} strokeWidth="2" />
			<path d="M-34,60 L34,60" stroke="#f2f2e8" strokeWidth="5" opacity="0.8" />
			{offer ? (
				<g transform={`translate(${26 + reach * 16},${46 - reach * 6})`}>
					<path d="M-14,-6 L26,-6" stroke="#3a4a5e" strokeWidth="16" strokeLinecap="round" />
					<path d="M22,-18 L40,-18 L37,6 L25,6 Z" fill="#f4efe6" stroke={LINE} strokeWidth="2" />
					<path d={`M30,-22 q5,-8 0,-16`} stroke="#ffffff" strokeWidth="2" fill="none" opacity={0.5 + 0.3 * Math.sin(f * 0.2)} />
				</g>
			) : null}
			<ellipse cx="0" cy="-22" rx="22" ry="25" fill="#f0c8ae" stroke={LINE} strokeWidth="2.2" />
			<path d="M-23,-26 C-26,-54 22,-60 24,-28 L16,-36 L6,-26 L-4,-38 L-14,-28 Z" fill={hair} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
			{blink > 0.5 ? (
				<path d="M-12,-18 L-4,-18 M6,-18 L14,-18" stroke={LINE} strokeWidth="2" />
			) : (
				<g>
					<ellipse cx="-8" cy="-18" rx="3" ry="4.5" fill={LINE} />
					<ellipse cx="10" cy="-18" rx="3" ry="4.5" fill={LINE} />
					<circle cx="-9" cy="-20" r="1.1" fill="#fff" />
					<circle cx="9" cy="-20" r="1.1" fill="#fff" />
				</g>
			)}
			<path d="M-4,-4 Q1,-1 6,-4" stroke={LINE} strokeWidth="1.8" fill="none" />
		</g>
	);
};

/** Tiny distant figure with a bag (background walkers). */
export const Walker: React.FC<{x: number; y: number; s: number; f: number; coat: string; seed: number}> = ({x, y, s, f, coat, seed}) => {
	const step = Math.sin(f * 0.25 + seed);
	return (
		<g transform={`translate(${x + f * 0.15 * (seed % 2 ? 1 : -1)},${y - Math.abs(step) * 2}) scale(${s})`}>
			<path d="M-14,40 L-10,90 M14,40 L10,90" stroke="#2a2a34" strokeWidth="8" strokeLinecap="round" transform={`rotate(${step * 6},0,40)`} />
			<path d="M-22,48 C-24,10 -12,-6 0,-6 C12,-6 24,10 22,48 Z" fill={coat} stroke={LINE} strokeWidth="2" />
			<circle cx="0" cy="-18" r="12" fill="#e9c2a8" stroke={LINE} strokeWidth="2" />
			<path d="M-12,-20 C-12,-34 12,-34 12,-20 Z" fill="#2c2a35" />
			<rect x="16" y="24" width="18" height="16" rx="4" fill="#5b4334" stroke={LINE} strokeWidth="1.6" />
		</g>
	);
};
