// Pictures shown ON SCREENS (Mara's canvas, the screenshot on the phone), stick-film version: her animation is
// the same hallway plate (public/plates/hall_persp_night.jpg) warmed to a dim yellow bulb, with the tall man
// drawn in code at each distance. Nothing here is generated per picture, so the hallway never changes between
// positions of the man - only he moves.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Stain, TallMan} from '../stick/f240';
import type {Pt} from '../utils/rough';
import {wobLine} from '../utils/rough';

export type PicId =
	| 'canvas_empty'
	| 'canvas_man_far'
	| 'canvas_man_mid'
	| 'canvas_man_1m'
	| 'canvas_man_near'
	| 'canvas_man_close'
	| 'canvas_man_detail'
	| 'canvas_face'
	| 'canvas_pattern'
	| 'canvas_white'
	| 'screenshot_shadow'
	| 'canvas_blank'
	| 'canvas_fingers';

type ManAt = {x: number; y: number; s: number; stoop?: number};
/** where the man stands in the picture (feet, scale), from the far end of the hallway to right in front of us */
export const MAN_AT: Record<'far' | 'mid' | '1m' | 'near' | 'close', ManAt> = {
	far: {x: 905, y: 826, s: 1.35},
	mid: {x: 905, y: 905, s: 1.75},
	'1m': {x: 905, y: 960, s: 2.0},
	near: {x: 905, y: 1060, s: 2.45},
	close: {x: 905, y: 1290, s: 3.3, stoop: 0.7},
};
/** the man's box as canvas fractions [x0, y0, x1, y1] (for the lasso and the white brush in the editor) */
export const manBoxOf = (k: keyof typeof MAN_AT): [number, number, number, number] => {
	const m = MAN_AT[k];
	return [(m.x - 60 * m.s) / 1920, Math.max(0, (m.y - (405 - (m.stoop ?? 0) * 60) * m.s) / 1080), (m.x + 60 * m.s) / 1920, Math.min(1, m.y / 1080)];
};

type Spec = {man?: keyof typeof MAN_AT; cam?: {z: number; cx: number; cy: number}; pattern?: boolean; pencilCrack?: boolean; painted?: boolean; shadow?: boolean; fingers?: boolean};
export const PICTURES: Record<PicId, Spec> = {
	canvas_empty: {},
	canvas_man_far: {man: 'far'},
	canvas_man_mid: {man: 'mid'},
	canvas_man_1m: {man: '1m'},
	canvas_man_near: {man: 'near'},
	canvas_man_close: {man: 'close'},
	canvas_man_detail: {man: 'far', cam: {z: 2.5, cx: 905, cy: 560}},
	canvas_face: {man: 'far', cam: {z: 5.2, cx: 880, cy: 330}},
	canvas_pattern: {man: 'close', pattern: true, pencilCrack: true},
	canvas_white: {man: 'close', painted: true},
	canvas_blank: {man: 'close', painted: true},
	canvas_fingers: {man: 'close', painted: true, fingers: true, cam: {z: 2.2, cx: 905, cy: 600}},
	screenshot_shadow: {man: '1m', shadow: true, cam: {z: 2.1, cx: 1120, cy: 560}},
};

/** her animation's warm, dim look (CSS, so it works inside any HTML screen) */
export const CANVAS_FILTER = 'sepia(0.62) saturate(1.45) brightness(1.3) contrast(1.04)';

const STAINS: Array<[number, number]> = [
	[870, 120],
	[920, 150],
	[1080, 190],
	[1170, 230],
];

/** the drawing on top of the plate, in 1920x1080 picture coordinates */
export const PictureDrawing: React.FC<{id: PicId; frame?: number}> = ({id, frame = 0}) => {
	const p = PICTURES[id];
	const m = p.man ? MAN_AT[p.man] : null;
	return (
		<g>
			{p.pattern ? STAINS.map(([y, w]) => <Stain key={y} x={905} y={y} w={w} frame={0} k={1.4} />) : null}
			{p.pencilCrack ? <path d={wobLine(975, 334, 1060, 200, 3300, 0.4)} stroke="#050505" strokeWidth={4} strokeLinecap="round" /> : null}
			{m && p.shadow ? (
				<g>
					{/* his shadow thrown on the right wall; where it ends, a pale man-shaped outline */}
					<g transform={`translate(${m.x + 420} ${m.y - 40}) skewX(-14) scale(0.9 1)`} opacity={0.42}>
						<TallMan x={0} y={0} s={m.s * 0.92} frame={frame} look="dark" twitch={false} qa={false} />
					</g>
					<TallMan x={m.x + 610} y={m.y - 60} s={m.s * 0.9} frame={frame} look="ghost" twitch={false} qa={false} opacity={0.75} />
				</g>
			) : null}
			{m ? <TallMan x={m.x} y={m.y} s={m.s} stoop={m.stoop ?? 0} frame={frame} look={p.painted ? 'paint' : 'dark'} twitch={false} qa={false} /> : null}
			{m && p.fingers ? (
				<g>
					{[-34, -12, 10, 30].map((dx, i) => (
						<g key={i}>
							<rect x={m.x + dx - 7 + 6} y={m.y - 760 + 6 - (i % 2) * 14} width={15} height={56} rx={7} fill="#000" opacity={0.18} />
							<rect x={m.x + dx - 7} y={m.y - 760 - (i % 2) * 14} width={15} height={56} rx={7} fill="#fbfbf8" stroke="#d7d6cf" strokeWidth={1.5} />
						</g>
					))}
				</g>
			) : null}
		</g>
	);
};

/** A picture as an HTML block filling its parent (the plate as <Img>, so renders wait for it). */
export const PictureBox: React.FC<{id: PicId; style?: React.CSSProperties; frame?: number}> = ({id, style, frame}) => {
	const p = PICTURES[id];
	const cam = p.cam;
	const tf = cam ? `translate(${((960 - cam.cx * cam.z) / 1920) * 100}%, ${((540 - cam.cy * cam.z) / 1080) * 100}%) scale(${cam.z})` : undefined;
	const {filter: extra, ...rest} = style ?? {};
	return (
		<div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#2a2216', ...rest}}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: tf, filter: [CANVAS_FILTER, extra].filter(Boolean).join(' ')}}>
				<Img src={staticFile('plates/hall_persp_night.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
				<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
					<PictureDrawing id={id} frame={frame} />
				</svg>
			</div>
		</div>
	);
};

/** The picture filling the frame, with a slow push (the screen shown full-screen). */
export const FullPicture: React.FC<{id: PicId; f: number; d: number; z?: [number, number]; focus?: [number, number]}> = ({id, f, d, z = [1, 1.08], focus = [0.5, 0.5]}) => {
	const t = Math.min(1, f / Math.max(1, d - 1));
	const k = z[0] + (z[1] - z[0]) * t * t * (3 - 2 * t);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `scale(${k})`}}>
				<PictureBox id={id} />
			</div>
		</div>
	);
};

export type {Pt};
