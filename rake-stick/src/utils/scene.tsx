import React, {createContext, useContext} from 'react';
import {AbsoluteFill, getInputProps, Sequence, useCurrentFrame} from 'remotion';
import {FPS, type SceneTiming} from '../data/timeline';
import type {Art} from '../data/art';
import {RestyledStill, hasRestyle} from '../components/fx/Restyled';
import {clamp, easeInOut, rocking, shake as shakeFn} from './anim';

type Inputs = {restyled?: boolean; logShots?: boolean; layoutKey?: boolean};
const inputs = () => getInputProps() as Inputs;
/** Rendering a clean layout keyframe for the image model: fixed camera, no overlays. */
export const isLayoutKey = () => Boolean(inputs().layoutKey);

const SceneCtx = createContext<SceneTiming | null>(null);

export const SceneProvider: React.FC<{scene: SceneTiming; children: React.ReactNode}> = ({scene, children}) => (
	<SceneCtx.Provider value={scene}>{children}</SceneCtx.Provider>
);

export interface SceneApi {
	scene: SceneTiming;
	/** Frame (relative to the scene start) at which a marker starts (+ offset seconds). */
	at: (marker: string, offset?: number) => number;
	/** Frame at which a marker ends (+ offset seconds). */
	end: (marker: string, offset?: number) => number;
	/** Frame at a fraction through a marker. */
	frac: (marker: string, fr: number) => number;
	has: (marker: string) => boolean;
	total: number;
}

export const makeSceneApi = (scene: SceneTiming): SceneApi => {
	const get = (m: string) => {
		const s = scene.markers[m];
		if (!s) {
			// a marker cut from this edit - fall back to the scene start
			return {start: scene.start, end: scene.start};
		}
		return s;
	};
	return {
		scene,
		at: (m, o = 0) => Math.round((get(m).start + o - scene.start) * FPS),
		end: (m, o = 0) => Math.round((get(m).end + o - scene.start) * FPS),
		frac: (m, fr) => {
			const s = get(m);
			return Math.round((s.start + (s.end - s.start) * fr - scene.start) * FPS);
		},
		has: (m) => Boolean(scene.markers[m]),
		total: scene.durationInFrames,
	};
};

export const useScene = (): SceneApi => {
	const scene = useContext(SceneCtx);
	if (!scene) throw new Error('useScene() outside of a scene');
	return makeSceneApi(scene);
};

export interface ShotProps {
	/** frame within the shot */
	f: number;
	/** shot length in frames */
	d: number;
	/** frame within the scene */
	sf: number;
	/** shot start frame within the scene */
	from: number;
	api: SceneApi;
}

export interface ShotSpec {
	/** Stable shot id (file names of the generated art). Required for shots with `art`. */
	id?: string;
	/** marker id (voice line or beat) the cut lands on, or an absolute scene frame */
	at: string | number;
	/** seconds offset from the marker start */
	off?: number;
	/** cut at a fraction through the marker instead of its start */
	frac?: number;
	/** The code drawing. With `art`, it is only the LAYOUT GUIDE for the generated frame. */
	render: (p: ShotProps) => React.ReactNode;
	/** Crisp code-drawn elements laid over the generated frame (moving lines, cursors, UI). */
	overlay?: (p: ShotProps) => React.ReactNode;
	/** Art direction for the image model (src/data/art.ts). */
	art?: Art;
}

const ShotBody: React.FC<{spec: ShotSpec; d: number; from: number; api: SceneApi}> = ({spec, d, from, api}) => {
	const f = useCurrentFrame();
	const p = {f, d, sf: f + from, from, api};
	if (inputs().layoutKey) return <AbsoluteFill>{spec.render(p)}</AbsoluteFill>;
	const art = spec.art && spec.id && inputs().restyled !== false && hasRestyle(spec.id, spec.art) ? spec.art : null;
	return (
		<AbsoluteFill>
			{art ? <RestyledStill id={spec.id as string} art={art} f={f} d={d} sceneFrame={from + f} scene={api.scene} /> : spec.render(p)}
			{spec.overlay ? spec.overlay(p) : null}
		</AbsoluteFill>
	);
};

/**
 * Cuts land exactly on voice-line / beat markers. Each shot lasts until the next
 * shot's start, so changing the audio retimes every cut automatically.
 */
export const Shots: React.FC<{shots: ShotSpec[]}> = ({shots: all}) => {
	const api = useScene();
	// a shot cut on a line that is not in this edit is dropped - the previous shot runs on
	const shots = all.filter((s) => typeof s.at === 'number' || api.has(s.at));
	const starts = shots.map((s) => {
		if (typeof s.at === 'number') return s.at;
		if (s.frac !== undefined) return api.frac(s.at, s.frac);
		return api.at(s.at, s.off ?? 0);
	});
	// keep cuts monotonic even if a marker was trimmed
	for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1]);
	starts[0] = 0;
	// shot map for the image restyle pipeline (scripts/images/shotmap.mjs)
	if (inputs().logShots) {
		const list = shots.map((s, i) => ({
			id: s.id ?? null,
			at: s.at,
			from: api.scene.startFrame + starts[i],
			to: api.scene.startFrame + (i === shots.length - 1 ? api.total : starts[i + 1]),
			art: s.art ?? null,
			overlay: Boolean(s.overlay),
		}));
		console.log('F240SHOTS ' + JSON.stringify({scene: api.scene.id, shots: list}));
	}
	return (
		<>
			{shots.map((s, i) => {
				const from = starts[i];
				const to = i === shots.length - 1 ? api.total : starts[i + 1];
				if (to <= from) return null;
				return (
					<Sequence key={i} from={from} durationInFrames={to - from} name={`shot ${i + 1}`}>
						<ShotBody spec={s} d={to - from} from={from} api={api} />
					</Sequence>
				);
			})}
		</>
	);
};

export interface CamPos {
	cx?: number;
	cy?: number;
	z?: number;
	r?: number;
}

/**
 * Camera: centres the 1920x1080 stage on (cx, cy) at zoom z. Interpolates
 * between `from` and `to` over the shot with an ease. Optional ferry rocking and
 * impact shake.
 */
export const Cam: React.FC<{
	f: number;
	d: number;
	from?: CamPos;
	to?: CamPos;
	rock?: number;
	shakeAt?: number[];
	shakeAmp?: number;
	ease?: (t: number) => number;
	/** handheld drift amount (0 = locked off) */
	hand?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({f, d, from = {}, to, rock = 0, shakeAt = [], shakeAmp = 14, ease = easeInOut, hand = 1, children, style}) => {
	// layout keyframe for the image model: the camera holds its framing (the generated
	// frame gets its own push and drift in the film), no shake, no drift
	if (inputs().layoutKey) {
		to = undefined;
		rock = 0;
		shakeAt = [];
		hand = 0;
	}
	const a = {cx: 960, cy: 540, z: 1, r: 0, ...from};
	const b = {...a, ...(to ?? {})};
	const t = ease(clamp(f / Math.max(1, d - 1)));
	const cx = a.cx + (b.cx - a.cx) * t;
	const cy = a.cy + (b.cy - a.cy) * t;
	const z = a.z + (b.z - a.z) * t;
	const r = a.r + (b.r - a.r) * t;
	const rk = rocking(f, rock);
	const [sx, sy] = shakeFn(f, shakeAt, shakeAmp);
	// handheld drift: slow, smooth, never still (scaled by `hand`)
	const g = (f + seedOf(d)) / FPS;
	const hx = (Math.sin(g * 0.71) * 3.2 + Math.sin(g * 1.83 + 1.3) * 1.4) * hand;
	const hy = (Math.sin(g * 0.57 + 2.1) * 2.6 + Math.sin(g * 1.37 + 0.4) * 1.1) * hand;
	const hr = (Math.sin(g * 0.43 + 0.7) * 0.14) * hand;
	// a hair of over-scan so the drift never shows the stage edge
	const ze = z * (1 + 0.007 * hand);
	const tx = 960 - cx * ze + sx + hx;
	const ty = 540 - cy * ze + sy + rk.dy + hy;
	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					transformOrigin: '0 0',
					transform: `translate(${tx}px, ${ty}px) rotate(${r + rk.rot + hr}deg) scale(${ze})`,
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

const seedOf = (n: number) => (n * 37) % 997;

/** Full-stage SVG canvas (1920x1080 coordinates). */
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
		{children}
	</svg>
);

/** Convenience: camera + svg in one. */
export const Stage: React.FC<{
	f: number;
	d: number;
	from?: CamPos;
	to?: CamPos;
	rock?: number;
	shakeAt?: number[];
	shakeAmp?: number;
	bg?: string;
	hand?: number;
	children: React.ReactNode;
	overlay?: React.ReactNode;
}> = ({f, d, from, to, rock, shakeAt, shakeAmp, bg = '#05070c', hand = 1, children, overlay}) => (
	<AbsoluteFill style={{background: bg}}>
		<Cam f={f} d={d} from={from} to={to} rock={rock} shakeAt={shakeAt} shakeAmp={shakeAmp} hand={hand}>
			<Svg>{children}</Svg>
		</Cam>
		{overlay}
	</AbsoluteFill>
);
