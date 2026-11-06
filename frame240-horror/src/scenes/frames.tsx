// Recurring LAYOUT compositions (guides for the image model). Each returns full-frame SVG
// content inside a Stage camera.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hallway, type HallProps} from '../layout/Hallway';
import {Mara, MaraBust, type Expr} from '../layout/Mara';
import {PictureSvg, type PicId} from '../layout/pictures';
import {Chair, Closet, Workroom, type ClosetView} from '../layout/Rooms';
import {Stage, type CamPos} from '../utils/scene';

export const GLOW = '#9fc4ff';
export const WHITE_LIGHT = '#ffffff';

type Bust = {
	r?: number;
	cx?: number;
	cy?: number;
	expr?: Expr;
	mouth?: number;
	gaze?: [number, number];
	yaw?: number;
	back?: boolean;
	tilt?: number;
	eyesClosed?: boolean;
	light?: string;
	phoneEar?: 'L' | 'R';
	phoneFront?: boolean;
	handMouth?: boolean;
	chinHand?: boolean;
};

/** Mara at her desk seen from the monitor: she faces the camera, the dark doorway behind her. */
export const FrontMara: React.FC<{f: number; d: number; b?: Bust; hall?: HallProps; from?: CamPos; to?: CamPos; drained?: number; glow?: string}> = ({f, d, b = {}, hall, from, to, drained = 0, glow}) => (
	<Stage f={f} d={d} from={from} to={to}>
		<Workroom view="front" hall={hall ?? {light: 'night'}} drained={drained} glow={glow}>
			<MaraBust r={b.r ?? 150} cx={b.cx ?? 1140} cy={b.cy ?? 560} expr={b.expr ?? 'neutral'} light={b.light ?? glow ?? GLOW} {...b} />
		</Workroom>
	</Stage>
);

/** A face close-up on a dark background (cx, cy face centre). */
export const FaceClose: React.FC<{f: number; d: number; b?: Bust; bg?: string; from?: CamPos; to?: CamPos; children?: React.ReactNode}> = ({f, d, b = {}, bg = '#0b0f18', from, to, children}) => (
	<Stage f={f} d={d} from={from} to={to} bg={bg}>
		<rect x={0} y={0} width={1920} height={1080} fill={bg} />
		{children}
		<MaraBust r={b.r ?? 250} cx={b.cx ?? 960} cy={b.cy ?? 470} expr={b.expr ?? 'uneasy'} light={b.light ?? GLOW} {...b} />
	</Stage>
);

/** The hallway (full frame) with a camera framing. */
export const Hall: React.FC<{f: number; d: number; h?: HallProps; from?: CamPos; to?: CamPos; children?: React.ReactNode}> = ({f, d, h = {}, from, to, children}) => (
	<Stage f={f} d={d} from={from} to={to}>
		<Hallway {...h} />
		{children}
	</Stage>
);

/** The workroom, any view, with optional figure(s). */
export const Room: React.FC<{f: number; d: number; view: Parameters<typeof Workroom>[0]['view']; screen?: PicId; hall?: HallProps; drained?: number; cracked?: boolean; from?: CamPos; to?: CamPos; glow?: string; children?: React.ReactNode}> = ({
	f,
	d,
	view,
	screen,
	hall,
	drained,
	cracked,
	from,
	to,
	glow,
	children,
}) => (
	<Stage f={f} d={d} from={from} to={to}>
		<Workroom view={view} screen={screen ? <PictureSvg id={screen} /> : undefined} hall={hall} drained={drained} cracked={cracked} glow={glow}>
			{children}
		</Workroom>
	</Stage>
);

/** The closet, any view. */
export const InCloset: React.FC<{f: number; d: number; view: ClosetView; from?: CamPos; to?: CamPos; dent?: number; face?: number; bulge?: number; children?: React.ReactNode}> = ({f, d, view, from, to, dent, face, bulge, children}) => (
	<Stage f={f} d={d} from={from} to={to}>
		<Closet view={view} dent={dent} face={face} bulge={bulge}>
			{children}
		</Closet>
	</Stage>
);

/** Mara sitting at her desk in the wide workroom view (profile, facing the monitor on the right). */
export const SeatedMara: React.FC<{expr?: Expr; yaw?: number; back?: boolean; lean?: number; armsUp?: number; light?: string; tilt?: number; gaze?: [number, number]}> = ({expr = 'tired', yaw = 1, back = false, lean = 8, armsUp = 1, light = GLOW, tilt = 0, gaze}) => (
	<g>
	<Chair x={960} y={652} s={0.62} back={back ? 'behind' : 'L'} />
	<Mara
		x={930}
		y={640}
		s={0.62}
		yaw={yaw}
		back={back}
		lean={lean}
		tilt={tilt}
		expr={expr}
		gaze={gaze}
		armR={[armsUp ? 60 : 10, armsUp ? 30 : 0]}
		armL={[armsUp ? 55 : 5, armsUp ? 35 : 0]}
		legL={[80, -85]}
		legR={[76, -80]}
		light={light}
	/>
	</g>
);

/** Full-frame picture (a canvas picture shown as a whole screen). */
export const FullPicture: React.FC<{id: PicId; f: number; d: number; z?: [number, number]; focus?: [number, number]}> = ({id, f, d, z = [1, 1.08], focus = [0.5, 0.5]}) => {
	const t = Math.min(1, f / Math.max(1, d - 1));
	const k = z[0] + (z[1] - z[0]) * t * t * (3 - 2 * t);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<svg viewBox="0 0 1920 1080" style={{width: '100%', height: '100%', transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `scale(${k})`}}>
				<PictureSvg id={id} />
			</svg>
		</AbsoluteFill>
	);
};
