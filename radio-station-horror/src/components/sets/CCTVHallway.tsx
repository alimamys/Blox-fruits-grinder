// Motel hallway seen from a fixed ceiling camera – drawn in perspective with
// gradients and soft shading so it reads as "real footage", not MS Paint.
import React, {useId} from 'react';

const F = 820;
const CX = 960;
const CY = 250;
const CAM_X = 0.9;
const CAM_Y = 2.45;
const HALF_W = 1.5;
const CEIL = 2.6;

/** World (metres) → screen. X across, Y up, Z forward from the camera. */
export const proj = (X: number, Y: number, Z: number): [number, number] => [CX + (F * (X - CAM_X)) / Z, CY - (F * (Y - CAM_Y)) / Z];

const pts = (...p: Array<[number, number]>) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** Room door on the left wall (where Adam and Victor come out). */
export const ROOM_DOOR = {z0: 5.0, z1: 6.0};

export const CCTVHallway: React.FC<{doorOpen?: number; lightFlicker?: number}> = ({doorOpen = 0, lightFlicker = 1}) => {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const zNear = 0.35;
	const zFar = 17;
	const fl = (x: number, z: number) => proj(x, 0, z);
	const cl = (x: number, z: number) => proj(x, CEIL, z);
	const door = (side: -1 | 1, z0: number, z1: number, open = 0, key = '') => {
		const X = side * HALF_W;
		const a = proj(X, 0, z0);
		const b = proj(X, 0, z1);
		const c = proj(X, 2.1, z1);
		const d = proj(X, 2.1, z0);
		// open door swings into the hallway
		const oz = z0 + (z1 - z0) * (1 - open);
		const ox = X - side * open * (z1 - z0) * 0.9;
		const e = proj(ox, 0, oz);
		const g = proj(ox, 2.1, oz);
		return (
			<g key={key}>
				<polygon points={pts(proj(X, 0, z0 - 0.08), proj(X, 0, z1 + 0.08), proj(X, 2.2, z1 + 0.08), proj(X, 2.2, z0 - 0.08))} fill="#3b352c" />
				<polygon points={pts(a, b, c, d)} fill={open > 0 ? '#0d0c0b' : `url(#door${id})`} />
				{open > 0 && <polygon points={pts(a, e, g, d)} fill={`url(#door${id})`} />}
				{open <= 0 && <circle cx={(proj(X, 1.0, z0 + (z1 - z0) * 0.85))[0]} cy={(proj(X, 1.0, z0 + (z1 - z0) * 0.85))[1]} r={30 / z0} fill="#b8b09a" />}
			</g>
		);
	};
	return (
		<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id={`floor${id}`} x1="0" y1="1" x2="0" y2="0">
					<stop offset="0%" stopColor="#5b4c3c" />
					<stop offset="100%" stopColor="#2a241e" />
				</linearGradient>
				<linearGradient id={`wallL${id}`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#bfb49a" />
					<stop offset="100%" stopColor="#6e6656" />
				</linearGradient>
				<linearGradient id={`wallR${id}`} x1="1" y1="0" x2="0" y2="0">
					<stop offset="0%" stopColor="#a49a82" />
					<stop offset="100%" stopColor="#6a624f" />
				</linearGradient>
				<linearGradient id={`door${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#6e5338" />
					<stop offset="100%" stopColor="#4a3624" />
				</linearGradient>
				<radialGradient id={`lamp${id}`}>
					<stop offset="0%" stopColor="#fffbe8" stopOpacity={0.95} />
					<stop offset="100%" stopColor="#fffbe8" stopOpacity={0} />
				</radialGradient>
				<filter id={`soft${id}`}>
					<feGaussianBlur stdDeviation={1.2} />
				</filter>
			</defs>
			<g filter={`url(#soft${id})`}>
				<rect width={1920} height={1080} fill="#14110e" />
				{/* ceiling */}
				<polygon points={pts(cl(-HALF_W, zNear), cl(HALF_W, zNear), cl(HALF_W, zFar), cl(-HALF_W, zFar))} fill="#8a8574" />
				{/* walls */}
				<polygon points={pts(fl(-HALF_W, zNear), fl(-HALF_W, zFar), cl(-HALF_W, zFar), cl(-HALF_W, zNear))} fill={`url(#wallL${id})`} />
				<polygon points={pts(fl(HALF_W, zNear), fl(HALF_W, zFar), cl(HALF_W, zFar), cl(HALF_W, zNear))} fill={`url(#wallR${id})`} />
				{/* floor + carpet runner */}
				<polygon points={pts(fl(-HALF_W, zNear), fl(HALF_W, zNear), fl(HALF_W, zFar), fl(-HALF_W, zFar))} fill={`url(#floor${id})`} />
				<polygon points={pts(fl(-0.8, zNear), fl(0.8, zNear), fl(0.8, zFar), fl(-0.8, zFar))} fill="#5a2c26" opacity={0.75} />
				{Array.from({length: 14}).map((_, i) => {
					const z = 2 + i * 1.1;
					return <polygon key={i} points={pts(fl(-0.8, z), fl(0.8, z), fl(0.8, z + 0.12), fl(-0.8, z + 0.12))} fill="#3c1c18" opacity={0.6} />;
				})}
				{/* skirting boards */}
				<polygon points={pts(fl(-HALF_W, zNear), fl(-HALF_W, zFar), proj(-HALF_W, 0.12, zFar), proj(-HALF_W, 0.12, zNear))} fill="#3a3024" />
				<polygon points={pts(fl(HALF_W, zNear), fl(HALF_W, zFar), proj(HALF_W, 0.12, zFar), proj(HALF_W, 0.12, zNear))} fill="#3a3024" />
				{/* doors */}
				{door(-1, ROOM_DOOR.z0, ROOM_DOOR.z1, doorOpen, 'room')}
				{door(-1, 9.5, 10.4, 0, 'l2')}
				{door(-1, 13.6, 14.3, 0, 'l3')}
				{door(1, 3.4, 4.6, 0, 'r1')}
				{door(1, 7.6, 8.6, 0, 'r2')}
				{door(1, 11.8, 12.6, 0, 'r3')}
				{/* far end: exit door */}
				<polygon points={pts(proj(-0.5, 0, zFar), proj(0.5, 0, zFar), proj(0.5, 2.1, zFar), proj(-0.5, 2.1, zFar))} fill="#3d3a33" />
				<rect x={proj(-0.25, 2.3, zFar)[0]} y={proj(-0.25, 2.3, zFar)[1]} width={24} height={10} fill="#7dff9a" opacity={0.8} />
				{/* ceiling lights with glow */}
				{[3, 7, 11, 15].map((z, i) => {
					const [x, y] = proj(0, CEIL - 0.02, z);
					const glow = (i === 1 ? lightFlicker : 1) * (2600 / z);
					return (
						<g key={z}>
							<ellipse cx={x} cy={y + 4} rx={glow * 0.5} ry={glow * 0.3} fill={`url(#lamp${id})`} opacity={0.55} />
							<ellipse cx={x} cy={y} rx={300 / z} ry={60 / z} fill="#fffef4" opacity={i === 1 ? lightFlicker : 1} />
						</g>
					);
				})}
				{/* pools of light on the floor */}
				{[3, 7, 11].map((z) => {
					const [x, y] = proj(0, 0, z);
					return <ellipse key={z} cx={x} cy={y} rx={2200 / z} ry={500 / z} fill="#fff3d0" opacity={0.08} />;
				})}
			</g>
		</svg>
	);
};

/** A soft, shaded human figure for the CCTV footage (not a stick figure). */
export const CCTVFigure: React.FC<{
	X: number;
	Z: number;
	/** Walk/run phase (radians). */
	phase?: number;
	/** 0 = standing, 1 = walking, 2 = running. */
	gait?: number;
	/** 0 = walking away / side, 1 = facing camera. */
	facing?: number;
	/** Look up into the lens 0..1. */
	lookUp?: number;
	smile?: number;
	kind: 'adam' | 'victor';
	opacity?: number;
	/** Extra motion blur. */
	blur?: number;
}> = ({X, Z, phase = 0, gait = 0, facing = 0, lookUp = 0, smile = 0, kind, opacity = 1, blur = 1.6}) => {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const [fx, fy] = proj(X, 0, Z);
	const s = F / Z / 100; // pixels per cm
	const height = kind === 'victor' ? 182 : 176;
	const thin = kind === 'victor' ? 0.82 : 1;
	const shirt = kind === 'victor' ? '#c9c4b4' : '#56627a';
	const pants = kind === 'victor' ? '#3a362e' : '#25272c';
	const skin = kind === 'victor' ? '#e2ddd2' : '#d6c8b6';
	const hair = kind === 'victor' ? '#3a352e' : '#141210';
	const swing = Math.sin(phase) * (gait === 2 ? 34 : gait === 1 ? 16 : 0);
	const bob = gait ? Math.abs(Math.sin(phase)) * (gait === 2 ? 6 : 2) : 0;
	const lean = gait === 2 ? 10 : 0;
	const H = height * s;
	const hipY = fy - H * 0.53 - bob * s;
	const shoulderY = fy - H * 0.82 - bob * s;
	const headY = fy - H * 0.92 - bob * s - lookUp * 2 * s;
	const headR = 11 * s;
	const legW = 13 * s * thin;
	const leg = (dir: number) => {
		const a = (dir * swing * Math.PI) / 180;
		const kx = fx + dir * 6 * s + Math.sin(a) * H * 0.26;
		const ky = hipY + Math.cos(a) * H * 0.26;
		const footX = kx + Math.sin(a * (gait === 2 ? 0.3 : 0.8)) * H * 0.25;
		const footY = Math.min(fy, ky + H * 0.26);
		return (
			<g key={dir}>
				<path d={`M ${fx + dir * 6 * s} ${hipY} L ${kx} ${ky} L ${footX} ${footY}`} stroke={pants} strokeWidth={legW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
				<ellipse cx={footX + 3 * s} cy={footY} rx={9 * s} ry={4 * s} fill={kind === 'victor' ? skin : '#111'} />
			</g>
		);
	};
	const arm = (dir: number) => {
		const a = (-dir * swing * (gait === 2 ? 1.4 : 1) * Math.PI) / 180;
		const sx = fx + dir * 20 * s * thin;
		const ex = sx + Math.sin(a) * H * 0.18 + dir * 3 * s;
		const ey = shoulderY + Math.cos(a) * H * 0.18;
		const hx = ex + Math.sin(a + (gait === 2 ? -0.9 * dir : 0)) * H * 0.17;
		const hy = ey + Math.cos(a) * H * 0.17;
		return (
			<g key={`a${dir}`}>
				<path d={`M ${sx} ${shoulderY + 3 * s} L ${ex} ${ey} L ${hx} ${hy}`} stroke={shirt} strokeWidth={10 * s * thin} strokeLinecap="round" strokeLinejoin="round" fill="none" />
				<circle cx={hx} cy={hy} r={4.5 * s} fill={skin} />
			</g>
		);
	};
	return (
		<g opacity={opacity} transform={`rotate(${lean} ${fx} ${fy})`}>
			<defs>
				<filter id={`fb${id}`} x="-50%" y="-20%" width="200%" height="140%">
					<feGaussianBlur stdDeviation={blur} />
				</filter>
				<linearGradient id={`torso${id}`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor={shirt} stopOpacity={0.75} />
					<stop offset="50%" stopColor={shirt} />
					<stop offset="100%" stopColor={shirt} stopOpacity={0.6} />
				</linearGradient>
			</defs>
			<g filter={`url(#fb${id})`}>
				<ellipse cx={fx} cy={fy} rx={26 * s} ry={6 * s} fill="#000" opacity={0.35} />
				{leg(-1)}
				{leg(1)}
				{arm(-1)}
				<path
					d={`M ${fx - 21 * s * thin} ${shoulderY} Q ${fx} ${shoulderY - 5 * s} ${fx + 21 * s * thin} ${shoulderY} L ${fx + 15 * s * thin} ${hipY + 4 * s} L ${fx - 15 * s * thin} ${hipY + 4 * s} Z`}
					fill={`url(#torso${id})`}
				/>
				{arm(1)}
				<rect x={fx - 4 * s} y={shoulderY - 8 * s} width={8 * s} height={9 * s} fill={skin} />
				<ellipse cx={fx} cy={headY} rx={headR * 0.85 * (kind === 'victor' ? 0.92 : 1)} ry={headR * 1.08} fill={facing > 0.5 ? skin : hair} />
				{facing > 0.5 && (
					<g>
						<path d={`M ${fx - headR * 0.85} ${headY - headR * 0.25} Q ${fx} ${headY - headR * 1.5} ${fx + headR * 0.85} ${headY - headR * 0.25} Q ${fx} ${headY - headR * 0.75} ${fx - headR * 0.85} ${headY - headR * 0.25} Z`} fill={hair} />
						<ellipse cx={fx - headR * 0.33} cy={headY + headR * 0.05} rx={headR * 0.2} ry={headR * 0.13} fill="#1a1612" opacity={0.85} />
						<ellipse cx={fx + headR * 0.33} cy={headY + headR * 0.05} rx={headR * 0.2} ry={headR * 0.13} fill="#1a1612" opacity={0.85} />
						<path
							d={`M ${fx - headR * (0.42 + smile * 0.12)} ${headY + headR * (0.48 - smile * 0.1)} Q ${fx} ${headY + headR * (0.48 + smile * 0.75)} ${fx + headR * (0.42 + smile * 0.12)} ${headY + headR * (0.48 - smile * 0.1)}`}
							stroke="#1a1410"
							strokeWidth={Math.max(1.4, headR * (0.1 + smile * 0.06))}
							fill="none"
						/>
					</g>
				)}
			</g>
		</g>
	);
};
