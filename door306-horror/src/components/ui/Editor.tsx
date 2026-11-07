// Mara's animation software - crisp code UI (final art, never redrawn by the image model).
// A fictional, generic 2D animation app: tools on the left, the canvas, the layers panel on
// the right and the frame timeline along the bottom. The picture on the canvas is drawn in
// the film's style (src/layout/pictures.tsx).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../../utils/fonts';
import {PictureBox, type PicId} from '../../layout/pictures';

const UI = {
	bg: '#16171b',
	panel: '#1e2025',
	panel2: '#25272d',
	line: '#33363e',
	text: '#c9ccd3',
	dim: '#7c818c',
	accent: '#e8833a',
	red: '#ff3b30',
	sel: '#2f3e5c',
};

export const CANVAS_BOX = {x: 96, y: 64, w: 1344, h: 756};

export const LAYERS = ['Door', 'Ceiling', 'Lighting', 'Background'];

export interface EditorProps {
	f: number;
	/** picture on the canvas */
	picture: PicId;
	/** frame counter */
	frame: number;
	total: number;
	/** cells shown in the strip: picture per cell (the last cell is `total`) */
	strip?: PicId[];
	/** 0..1 the new cell sliding into the strip */
	newCell?: number;
	/** the playhead runs (0..1 through the strip) */
	play?: number | null;
	playing?: boolean;
	/** highlight a layer row (index in LAYERS) */
	layer?: number | null;
	/** zoom into the canvas picture: z around (cx, cy) in canvas fractions */
	zoom?: {z: number; cx: number; cy: number};
	/** zoom label */
	zoomLabel?: string;
	/** lasso being drawn around the man (0..1) and then failing */
	lasso?: number;
	lassoFail?: boolean;
	/** red line being drawn across the canvas wall (0..1) */
	redLine?: number;
	/** white brush strokes over the man (0..1) */
	paint?: number;
	/** where the man is on the canvas (canvas fractions) for the strokes and the lasso */
	manBox?: [number, number, number, number];
	/** onion skin: faint overlays of other pictures */
	onion?: PicId[];
	/** brush panel visible with white selected */
	brushPanel?: boolean;
	/** status toast */
	toast?: string | null;
	/** window closing (0..1) then reopening (1..2) */
	reopen?: number;
	/** mouse cursor position (screen px) */
	cursor?: [number, number] | null;
	/** the whole screen darkened (reflection / dim room) */
	dim?: number;
	title?: string;
}

const Icon: React.FC<{i: number; active?: boolean}> = ({i, active}) => {
	const shapes = [
		<path key="b" d="M8,26 L22,8 L26,12 L12,30 Z M6,32 L10,28" stroke="currentColor" strokeWidth={2.5} fill="none" />,
		<rect key="e" x={8} y={12} width={20} height={14} rx={3} transform="rotate(-30 18 19)" stroke="currentColor" strokeWidth={2.5} fill="none" />,
		<path key="l" d="M18,8 C30,8 30,22 18,22 C8,22 8,12 14,10 M14,22 L12,32" stroke="currentColor" strokeWidth={2.5} fill="none" />,
		<path key="m" d="M18,6 V30 M6,18 H30 M18,6 l-4,4 M18,6 l4,4 M18,30 l-4,-4 M18,30 l4,-4" stroke="currentColor" strokeWidth={2.5} fill="none" />,
		<path key="d" d="M10,28 L24,14 L28,18 L14,32 Z M24,14 L26,8 L32,10 L28,18" stroke="currentColor" strokeWidth={2.5} fill="none" />,
		<rect key="s" x={8} y={8} width={20} height={20} strokeDasharray="4 3" stroke="currentColor" strokeWidth={2.5} fill="none" />,
	];
	return (
		<div style={{width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: active ? UI.sel : 'transparent', color: active ? '#fff' : UI.dim}}>
			<svg width={36} height={36} viewBox="0 0 36 36">
				{shapes[i]}
			</svg>
		</div>
	);
};

export const Editor: React.FC<EditorProps> = ({
	f,
	picture,
	frame,
	total,
	strip,
	newCell = 1,
	play = null,
	playing = false,
	layer = null,
	zoom,
	zoomLabel,
	lasso = 0,
	lassoFail = false,
	redLine = 0,
	paint = 0,
	manBox = [0.44, 0.08, 0.6, 0.98],
	onion = [],
	brushPanel = false,
	toast = null,
	reopen = 0,
	cursor = null,
	dim = 0,
	title = 'hallway_loop_v12',
}) => {
	const cells = strip ?? Array.from({length: 12}, () => 'canvas_empty' as PicId);
	const firstFrame = total - cells.length + 1;
	const z = zoom ?? {z: 1, cx: 0.5, cy: 0.5};
	const closing = reopen > 0 && reopen < 1 ? reopen : reopen >= 1 && reopen < 2 ? 2 - reopen : 0;
	const [mx0, my0, mx1, my1] = manBox;
	const cw = CANVAS_BOX.w;
	const ch = CANVAS_BOX.h;
	// lasso path around the man's box
	const lassoPath = (() => {
		const pts: string[] = [];
		const n = 40;
		const cx = ((mx0 + mx1) / 2) * cw;
		const cy = ((my0 + my1) / 2) * ch;
		const rx = ((mx1 - mx0) / 2) * cw * 1.25;
		const ry = ((my1 - my0) / 2) * ch * 1.05;
		const m = Math.round(n * Math.min(1, lasso));
		for (let i = 0; i <= m; i++) {
			const a = (i / n) * Math.PI * 2 - Math.PI / 2;
			const wob = 1 + 0.06 * Math.sin(i * 1.7);
			pts.push(`${cx + Math.cos(a) * rx * wob},${cy + Math.sin(a) * ry * wob}`);
		}
		return pts.length > 1 ? `M${pts.join(' L')}` : '';
	})();
	// white strokes painted over the man: legs, then arms, then head
	const strokes = (() => {
		if (paint <= 0) return null;
		const x0 = mx0 * cw;
		const x1 = mx1 * cw;
		const y0 = my0 * ch;
		const y1 = my1 * ch;
		const w = x1 - x0;
		const h = y1 - y0;
		const list: Array<[number, number, number, number]> = [];
		const rows = 14;
		for (let i = 0; i < rows; i++) {
			const yy = y1 - (h * (i + 0.5)) / rows;
			list.push([x0 - w * 0.2, yy, x1 + w * 0.2, yy + (i % 2 ? 18 : -18)]);
		}
		const shown = paint * rows;
		return list.map(([a, b, c, d], i) => {
			const k = Math.max(0, Math.min(1, shown - i));
			if (k <= 0) return null;
			const ex = i % 2 ? c - (c - a) * k : a + (c - a) * k;
			return <path key={i} d={`M${i % 2 ? c : a},${b} L${ex},${d}`} stroke="#f6f5f1" strokeWidth={h / rows + 26} strokeLinecap="round" opacity={0.97} />;
		});
	})();
	return (
		<AbsoluteFill style={{background: UI.bg, fontFamily: FONT.ui, color: UI.text}}>
			{/* title bar */}
			<div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 44, background: UI.panel, borderBottom: `1px solid ${UI.line}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 18px', fontSize: 17}}>
				<div style={{display: 'flex', gap: 8}}>
					{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
						<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
					))}
				</div>
				{['File', 'Edit', 'View', 'Layer', 'Animation', 'Window'].map((m) => (
					<span key={m} style={{color: UI.dim}}>
						{m}
					</span>
				))}
				<span style={{marginLeft: 'auto', marginRight: 'auto', color: UI.text, fontWeight: 600}}>{title}.anim</span>
				<span style={{color: UI.dim, fontFamily: FONT.mono, fontSize: 15}}>{zoomLabel ?? `${Math.round(z.z * 100)}%`}</span>
			</div>
			{/* tools */}
			<div style={{position: 'absolute', left: 0, top: 44, width: 72, bottom: 0, background: UI.panel, borderRight: `1px solid ${UI.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 14}}>
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<Icon key={i} i={i} active={(i === 0 && (paint > 0 || brushPanel || redLine > 0)) || (i === 2 && lasso > 0)} />
				))}
				<div style={{marginTop: 18, width: 40, height: 40, borderRadius: 6, background: brushPanel || paint > 0 ? '#f6f5f1' : redLine > 0 ? '#d0141c' : '#111', border: '2px solid #555'}} />
			</div>
			{/* canvas */}
			<div style={{position: 'absolute', left: CANVAS_BOX.x, top: CANVAS_BOX.y, width: cw, height: ch, overflow: 'hidden', background: '#000', boxShadow: '0 0 0 1px #000, 0 10px 40px rgba(0,0,0,0.6)'}}>
				<div style={{position: 'absolute', inset: 0, transformOrigin: `${z.cx * 100}% ${z.cy * 100}%`, transform: `scale(${z.z})`}}>
					<PictureBox id={picture} />
					{onion.map((o, i) => (
						<div key={o} style={{position: 'absolute', inset: 0, opacity: 0.22 + 0.06 * i, mixBlendMode: 'screen'}}>
							<PictureBox id={o} />
						</div>
					))}
					<svg viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
						{redLine > 0 ? (
							<line x1={cw * 0.62} y1={ch * 0.47} x2={cw * 0.62 + (cw * 0.3) * redLine} y2={ch * 0.47 + ch * 0.04 * redLine} stroke="#d0141c" strokeWidth={9} strokeLinecap="round" />
						) : null}
						{strokes}
						{lasso > 0 ? (
							<path d={lassoPath} fill={lassoFail ? 'rgba(255,59,48,0.08)' : 'none'} stroke={lassoFail ? UI.red : '#fff'} strokeWidth={2.5} strokeDasharray="10 7" strokeDashoffset={-f * 1.5} />
						) : null}
					</svg>
				</div>
				{dim > 0 ? <div style={{position: 'absolute', inset: 0, background: '#000', opacity: dim}} /> : null}
			</div>
			{/* layers panel */}
			<div style={{position: 'absolute', left: 1456, top: 44, right: 0, height: 790, background: UI.panel, borderLeft: `1px solid ${UI.line}`}}>
				<div style={{padding: '16px 20px', fontSize: 15, letterSpacing: 2, color: UI.dim, fontWeight: 700, borderBottom: `1px solid ${UI.line}`}}>LAYERS</div>
				{LAYERS.map((name, i) => (
					<div
						key={name}
						style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: `1px solid ${UI.line}`, background: layer === i ? UI.sel : 'transparent', fontSize: 21, color: layer === i ? '#fff' : UI.text}}
					>
						<svg width={24} height={24} viewBox="0 0 24 24">
							<path d="M2,12 C6,5 18,5 22,12 C18,19 6,19 2,12 Z" stroke="currentColor" strokeWidth={2} fill="none" />
							<circle cx={12} cy={12} r={3.5} fill="currentColor" />
						</svg>
						<div style={{width: 74, height: 42, background: '#0d0e11', border: `1px solid ${UI.line}`, overflow: 'hidden'}}>
							<PictureBox id="canvas_empty" style={{opacity: 0.6}} />
						</div>
						<span>{name}</span>
					</div>
				))}
				{brushPanel ? (
					<div style={{margin: 18, padding: 16, background: UI.panel2, borderRadius: 10, fontSize: 18}}>
						<div style={{color: UI.dim, fontSize: 14, letterSpacing: 2, fontWeight: 700, marginBottom: 12}}>BRUSH</div>
						<div style={{display: 'flex', gap: 10, marginBottom: 14}}>
							{['#111', '#d0141c', '#3a6df0', '#f6f5f1'].map((c) => (
								<div key={c} style={{width: 44, height: 44, borderRadius: 8, background: c, outline: c === '#f6f5f1' ? `3px solid ${UI.accent}` : 'none', outlineOffset: 2}} />
							))}
						</div>
						<div style={{display: 'flex', justifyContent: 'space-between'}}>
							<span>Size</span>
							<span style={{fontFamily: FONT.mono}}>320 px</span>
						</div>
						<div style={{height: 6, background: '#3a3d45', borderRadius: 3, marginTop: 8}}>
							<div style={{width: '88%', height: 6, background: UI.accent, borderRadius: 3}} />
						</div>
					</div>
				) : null}
			</div>
			{/* timeline */}
			<div style={{position: 'absolute', left: 72, top: 834, right: 0, bottom: 0, background: UI.panel, borderTop: `1px solid ${UI.line}`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 18, height: 54, padding: '0 22px', borderBottom: `1px solid ${UI.line}`}}>
					<svg width={30} height={30} viewBox="0 0 30 30">
						{playing ? (
							<g fill={UI.text}>
								<rect x={7} y={6} width={6} height={18} />
								<rect x={17} y={6} width={6} height={18} />
							</g>
						) : (
							<path d="M8,5 L25,15 L8,25 Z" fill={UI.text} />
						)}
					</svg>
					<svg width={26} height={26} viewBox="0 0 26 26">
						<rect x={5} y={5} width={16} height={16} fill={UI.dim} />
					</svg>
					<span style={{fontFamily: FONT.mono, fontSize: 26, color: '#fff', fontWeight: 700, marginLeft: 12}}>
						{String(frame).padStart(3, '0')} <span style={{color: UI.dim, fontWeight: 400}}>/ {total}</span>
					</span>
					<span style={{fontFamily: FONT.mono, fontSize: 18, color: UI.dim, marginLeft: 'auto'}}>24 fps</span>
				</div>
				{/* ruler */}
				<div style={{position: 'relative', height: 26, borderBottom: `1px solid ${UI.line}`}}>
					{cells.map((_, i) => (
						<span key={i} style={{position: 'absolute', left: 22 + i * 152, top: 3, fontFamily: FONT.mono, fontSize: 15, color: firstFrame + i === frame ? '#fff' : UI.dim}}>
							{firstFrame + i}
						</span>
					))}
				</div>
				{/* frame cells */}
				<div style={{position: 'relative', height: 140}}>
					{cells.map((pic, i) => {
						const last = i === cells.length - 1;
						const slide = last ? newCell : 1;
						const cur = firstFrame + i === frame;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: 16 + i * 152,
									top: 14,
									width: 140,
									height: 79,
									opacity: slide,
									transform: `translateX(${(1 - slide) * 60}px)`,
									outline: cur ? `3px solid ${last ? UI.red : UI.accent}` : `1px solid ${UI.line}`,
									outlineOffset: cur ? 2 : 0,
									background: '#0d0e11',
									overflow: 'hidden',
								}}
							>
								<PictureBox id={pic} />
							</div>
						);
					})}
					{play !== null ? <div style={{position: 'absolute', left: 16 + play * (cells.length * 152 - 12), top: -28, width: 3, height: 160, background: UI.red, boxShadow: '0 0 8px rgba(255,59,48,0.8)'}} /> : null}
				</div>
			</div>
			{toast ? (
				<div style={{position: 'absolute', left: CANVAS_BOX.x + cw / 2 - 170, top: 720, width: 340, padding: '14px 0', textAlign: 'center', background: 'rgba(30,32,37,0.95)', border: `1px solid ${UI.line}`, borderRadius: 10, fontSize: 22, color: '#fff'}}>
					{toast}
				</div>
			) : null}
			{cursor ? (
				<svg width={40} height={52} viewBox="0 0 20 26" style={{position: 'absolute', left: cursor[0], top: cursor[1]}}>
					<path d="M1,1 L1,20 L6,15 L9.5,23 L12.5,21.8 L9,14 L16,14 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
				</svg>
			) : null}
			{closing > 0 ? <AbsoluteFill style={{background: '#0a0b0e', opacity: closing}} /> : null}
		</AbsoluteFill>
	);
};

/** The editor seen as a whole screen with a slow camera push (for code-only shots). */
export const EditorShot: React.FC<EditorProps & {d: number; push?: [number, number]; focus?: [number, number]}> = ({d, push = [1, 1.06], focus = [0.45, 0.45], ...p}) => {
	const t = Math.min(1, p.f / Math.max(1, d - 1));
	const e = t * t * (3 - 2 * t);
	const z = push[0] + (push[1] - push[0]) * e;
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
			<AbsoluteFill style={{transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `scale(${z})`}}>
				<Editor {...p} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
