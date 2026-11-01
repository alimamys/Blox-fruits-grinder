/**
 * A14 editorial-object close-ups (TEMPORARY anime-style placeholders):
 * shopping receipt (no prices), student notebook (no text), expense ledger
 * (no figures). Painted, softly lit, with gentle motion.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {range} from './paint';

const LINE = '#2a1a1c';

const Frame: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg viewBox="0 0 1920 1080" width="100%" height="100%">
			{children}
		</svg>
	</AbsoluteFill>
);

export const ReceiptShot: React.FC = () => {
	const f = useCurrentFrame();
	const curl = Math.sin(f * 0.06) * 4;
	return (
		<Frame bg="#3a2e28">
			<defs>
				<radialGradient id="rcl" cx="1100" cy="300" r="900" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#ffe2b0" stopOpacity="0.45" />
					<stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect width="1920" height="1080" fill="#5a4436" />
			{range(8).map((i) => (
				<rect key={i} x={0} y={i * 140} width={1920} height={6} fill="#4a362a" />
			))}
			<rect width="1920" height="1080" fill="url(#rcl)" />
			<g transform={`rotate(${-8 + curl * 0.2},960,540)`}>
				<path d={`M720,80 L1180,80 L1180,${960 + curl} L1150,${990 + curl} L1120,${960 + curl} L1090,${990 + curl} L1060,${960 + curl} L1030,${990 + curl} L1000,${960 + curl} L970,${990 + curl} L940,${960 + curl} L910,${990 + curl} L880,${960 + curl} L850,${990 + curl} L820,${960 + curl} L790,${990 + curl} L760,${960 + curl} L720,${990 + curl} Z`} fill="#f7f3ea" stroke={LINE} strokeWidth="3" />
				<rect x="720" y="80" width="80" height="910" fill="#d8d2c6" opacity="0.6" />
				<rect x="800" y="140" width="300" height="22" rx="6" fill="#c9c2b6" />
				{range(14).map((i) => (
					<g key={i}>
						<rect x={800} y={220 + i * 48} width={180 + ((i * 37) % 90)} height={12} rx={5} fill="#d6cfc2" />
						<rect x={1040} y={220 + i * 48} width={60} height={12} rx={5} fill="#d6cfc2" />
					</g>
				))}
				<rect x="800" y="910" width="300" height="4" fill="#c9c2b6" />
			</g>
			<rect x={(f * 6) % 2600 - 600} y={0} width={180} height={1080} fill="#fff" opacity="0.05" transform="skewX(-20)" />
		</Frame>
	);
};

export const NotebookShot: React.FC = () => {
	const f = useCurrentFrame();
	const page = Math.max(0, Math.sin(f * 0.05)) * 10;
	return (
		<Frame bg="#2e3a52">
			<rect width="1920" height="1080" fill="#3a4a66" />
			<circle cx="1600" cy="160" r="500" fill="#ffe2b0" opacity="0.12" />
			<g transform="rotate(4,960,560)">
				<rect x="380" y="180" width="1160" height="760" rx="18" fill="#1d3a6a" stroke={LINE} strokeWidth="3" />
				<path d={`M400,200 L950,200 L950,920 L400,920 Z`} fill="#fbf8f0" stroke={LINE} strokeWidth="2.6" />
				<path d={`M970,200 L1520,${200 - page} L1520,${920 - page} L970,920 Z`} fill="#fbf8f0" stroke={LINE} strokeWidth="2.6" />
				<rect x="944" y="200" width="32" height="720" fill="#d8d2c6" />
				{range(16).map((i) => (
					<g key={i}>
						<line x1="420" y1={250 + i * 42} x2="930" y2={250 + i * 42} stroke="#a9c4e8" strokeWidth="2" />
						<line x1="990" y1={250 + i * 42 - page * (i / 16)} x2="1500" y2={250 + i * 42 - page * (i / 16)} stroke="#a9c4e8" strokeWidth="2" />
					</g>
				))}
				<line x1="480" y1="210" x2="480" y2="910" stroke="#f0a0a0" strokeWidth="2" />
				{/* doodles only, no writing */}
				<path d="M1080,330 q40,-60 80,0 t80,0" stroke="#5a6a8a" strokeWidth="3" fill="none" />
				<circle cx="1300" cy="520" r="40" stroke="#5a6a8a" strokeWidth="3" fill="none" />
				<path d="M560,600 l60,-40 l60,40 l-60,40 Z" stroke="#5a6a8a" strokeWidth="3" fill="none" />
				{/* pencil */}
				<g transform={`rotate(${-30 + Math.sin(f * 0.04) * 2},1200,820)`}>
					<rect x="1000" y="800" width="380" height="34" rx="6" fill="#f2c13a" stroke={LINE} strokeWidth="2.6" />
					<rect x="1000" y="800" width="380" height="10" fill="#ffe08a" />
					<polygon points="1380,800 1430,817 1380,834" fill="#e8c9a0" stroke={LINE} strokeWidth="2.4" />
					<polygon points="1418,813 1430,817 1418,821" fill="#2a2a2a" />
					<rect x="970" y="800" width="34" height="34" rx="6" fill="#e86a6a" stroke={LINE} strokeWidth="2.4" />
				</g>
			</g>
		</Frame>
	);
};

export const LedgerShot: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Frame bg="#0c1424">
			<rect width="1920" height="1080" fill="#0e1830" />
			<circle cx="400" cy="200" r="700" fill="#5ab8ff" opacity="0.08" />
			<g transform="rotate(-6,960,560)">
				<rect x="300" y="160" width="1320" height="800" rx="12" fill="#1a2a3a" stroke={LINE} strokeWidth="3" />
				<rect x="320" y="180" width="640" height="760" fill="#eef2f0" />
				<rect x="980" y="180" width="620" height="760" fill="#eef2f0" />
				{range(20).map((i) => (
					<g key={i}>
						<line x1="320" y1={240 + i * 34} x2="960" y2={240 + i * 34} stroke="#9fc7b8" strokeWidth="1.6" />
						<line x1="980" y1={240 + i * 34} x2="1600" y2={240 + i * 34} stroke="#9fc7b8" strokeWidth="1.6" />
					</g>
				))}
				{[520, 680, 820, 1180, 1340, 1480].map((x) => (
					<line key={x} x1={x} y1="200" x2={x} y2="930" stroke="#e0a0a0" strokeWidth="2" />
				))}
				{/* blank cells, no figures */}
				<rect x="960" y="180" width="20" height="760" fill="#c9d2d0" />
				<g transform={`translate(${Math.sin(f * 0.03) * 10},0)`}>
					<rect x="1180" y="700" width="420" height="22" rx="10" fill="#1d2a4a" stroke={LINE} strokeWidth="2.4" transform="rotate(28,1390,711)" />
				</g>
			</g>
			<rect x="0" y={(f * 3) % 1400 - 300} width="1920" height="120" fill="#9fd0ff" opacity="0.05" />
		</Frame>
	);
};
