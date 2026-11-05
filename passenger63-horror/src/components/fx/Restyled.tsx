// High-quality redrawn shots (scripts/images/restyle.py): each illustrated shot of the
// code-rendered film is redrawn by an image model in the same stick-figure style and
// laid over the original shot. Camera drift, keyframe crossfades, mouth swaps in time
// with the voice and flicker/shake effects keep the stills alive. Shots without a
// redraw (text-heavy screens, black frames) show the code-rendered picture underneath.
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import manifest from '../../data/generated/restyle.json';
import {envelopeAt, visemeAt} from '../../data/speech';
import {FPS, type Timeline} from '../../data/timeline';
import {h01} from '../../utils/rough';

type Talk = {src?: string; lines: string[]; mouth?: [number, number, number, number]; skin?: string};
type Frame = {src: string; talk?: Talk[]};
type Shot = {id: string; from: number; to: number; frames: Frame[]; fx?: string | null};
const SHOTS = (manifest as {shots: Shot[]}).shots ?? [];

const Still: React.FC<{shot: Shot; lines: Record<string, {start: number; end: number}>; offset: number}> = ({shot, lines, offset}) => {
	const f = useCurrentFrame();
	const g = f + offset; // global frame
	const d = shot.to - shot.from;
	const t = Math.min(1, f / Math.max(1, d - 1));
	// slow push + handheld drift
	const seed = h01(shot.from, 7);
	const z = 1.035 + 0.045 * t;
	const px = (seed - 0.5) * 30 * t + Math.sin((g / FPS) * 0.71 + seed * 6) * 3 + Math.sin((g / FPS) * 1.83) * 1.2;
	const py = Math.sin((g / FPS) * 0.57 + seed * 4) * 2.4 + Math.sin((g / FPS) * 1.37 + 0.4) * 1;
	let sx = 0;
	let sy = 0;
	let bright = 1;
	if (shot.fx === 'shake') {
		const k = Math.exp(-f / 9) * 16;
		sx = Math.sin(f * 2.1) * k;
		sy = Math.cos(f * 2.7) * k * 0.8;
	} else if (shot.fx === 'tremble') {
		sx = (h01(f, 3) - 0.5) * 5;
		sy = (h01(f, 4) - 0.5) * 4;
	} else if (shot.fx === 'flicker') {
		bright = h01(Math.floor(f / 2), 11) > 0.3 ? 1 : 0.25;
	}
	// keyframes: equal thirds with 6-frame crossfades
	const n = shot.frames.length;
	const seg = d / n;
	const idx = Math.min(n - 1, Math.floor(f / seg));
	const into = f - idx * seg;
	const fade = idx > 0 ? Math.min(1, into / 6) : 1;
	// talking: swap to the open-mouth drawing while the line is loud
	const frame = shot.frames[idx];
	let src = frame.src;
	const mouths: Array<{box: [number, number, number, number]; open: number; vis: string; skin?: string}> = [];
	for (const tk of frame.talk ?? []) {
		for (const id of tk.lines) {
			const m = lines[id];
			if (!m) continue;
			const ts = g / FPS - m.start;
			if (ts >= 0 && g / FPS < m.end) {
				const e = envelopeAt(id, ts) ?? 0.5;
				if (e > 0.2) {
					if (tk.src) src = tk.src;
					else if (tk.mouth) mouths.push({box: tk.mouth, open: e, vis: visemeAt(id, ts), skin: tk.skin});
				}
			}
		}
	}
	const prev = idx > 0 && fade < 1 ? shot.frames[idx - 1].src : null;
	const style: React.CSSProperties = {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `translate(${px + sx}px, ${py + sy}px) scale(${z})`,
		filter: shot.fx === 'cctv' ? 'saturate(0.55) contrast(1.08)' : bright < 1 ? `brightness(${bright})` : undefined,
	};
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{prev ? <Img src={staticFile(prev)} style={style} /> : null}
			<Img src={staticFile(src)} style={{...style, opacity: fade}} />
			{mouths.length ? (
				// drawn mouth in time with the voice, placed where the character's mouth is
				<svg viewBox="0 0 1920 1080" style={{...style, objectFit: undefined}}>
					{mouths.map(({box: [cx, cy, w, h], open, vis, skin}, i) => {
						const k = w / 22; // marker was 22 px wide at the character's scale
						const rx = (vis === 'e' ? 9.5 : vis === 'o' ? 5.5 : 7.5) * k;
						const ry = (vis === 'e' ? 1.6 + open * 3.6 : 2 + open * 6.2) * k * (vis === 'o' ? 1.1 : 1);
						return (
							<g key={i}>
								{skin ? <ellipse cx={cx} cy={cy} rx={w * 0.62} ry={Math.max(h * 0.55, 4 * k)} fill={skin} /> : null}
								<ellipse cx={cx} cy={cy + ry * 0.25} rx={rx} ry={ry} fill="#3a1414" stroke="#141414" strokeWidth={Math.max(1.5, 1.9 * k)} />
								{open > 0.45 && vis !== 'o' ? <path d={`M${cx - rx * 0.6},${cy - ry * 0.35 + 1.5 * k} L${cx + rx * 0.6},${cy - ry * 0.35 + 1.5 * k}`} stroke="#f4efe6" strokeWidth={1.8 * k} strokeLinecap="round" /> : null}
							</g>
						);
					})}
				</svg>
			) : null}
			{shot.fx === 'glitch' && f % 3 === 0 ? <AbsoluteFill style={{background: 'rgba(255,255,255,0.08)', mixBlendMode: 'screen'}} /> : null}
			{shot.fx === 'cctv' ? (
				<>
					<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)'}} />
					<AbsoluteFill style={{backgroundImage: `url(${staticFile(`textures/grain_${f % 4}.png`)})`, backgroundPosition: `${(h01(f, 1) * 512) | 0}px ${(h01(f, 2) * 512) | 0}px`, opacity: 0.12, mixBlendMode: 'overlay'}} />
					<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
				</>
			) : null}
		</AbsoluteFill>
	);
};

export const RestyledLayer: React.FC<{timeline: Timeline}> = ({timeline}) => {
	const lines = useMemo(() => {
		const m: Record<string, {start: number; end: number}> = {};
		for (const l of timeline.lines) if (!l.overlay) m[l.line.id] = {start: l.start, end: l.end};
		return m;
	}, [timeline]);
	if (!SHOTS.length) return null;
	return (
		<>
			{SHOTS.filter((s) => s.to <= timeline.totalFrames).map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={`restyle ${s.id}`} layout="none">
					<Still shot={s} lines={lines} offset={s.from} />
				</Sequence>
			))}
		</>
	);
};

export const restyledShotCount = SHOTS.length;
