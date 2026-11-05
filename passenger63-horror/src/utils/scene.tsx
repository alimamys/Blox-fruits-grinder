import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {FPS, type SceneTiming} from '../data/timeline';
import {clamp, easeInOut, rocking, shake as shakeFn} from './anim';

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
			// a marker trimmed in the "tight" edit - fall back to the scene start
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
	/** marker id (voice line or beat) the cut lands on, or an absolute scene frame */
	at: string | number;
	/** seconds offset from the marker start */
	off?: number;
	/** cut at a fraction through the marker instead of its start */
	frac?: number;
	render: (p: ShotProps) => React.ReactNode;
}

const ShotBody: React.FC<{render: ShotSpec['render']; d: number; from: number; api: SceneApi}> = ({render, d, from, api}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill>{render({f, d, sf: f + from, from, api})}</AbsoluteFill>;
};

/**
 * Cuts land exactly on voice-line / beat markers. Each shot lasts until the next
 * shot's start, so changing the audio retimes every cut automatically.
 */
export const Shots: React.FC<{shots: ShotSpec[]}> = ({shots}) => {
	const api = useScene();
	const starts = shots.map((s) => {
		if (typeof s.at === 'number') return s.at;
		if (s.frac !== undefined) return api.frac(s.at, s.frac);
		return api.at(s.at, s.off ?? 0);
	});
	// keep cuts monotonic even if a marker was trimmed
	for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1]);
	starts[0] = 0;
	return (
		<>
			{shots.map((s, i) => {
				const from = starts[i];
				const to = i === shots.length - 1 ? api.total : starts[i + 1];
				if (to <= from) return null;
				return (
					<Sequence key={i} from={from} durationInFrames={to - from} name={`shot ${i + 1}`}>
						<ShotBody render={s.render} d={to - from} from={from} api={api} />
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
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({f, d, from = {}, to, rock = 0, shakeAt = [], shakeAmp = 14, ease = easeInOut, children, style}) => {
	const a = {cx: 960, cy: 540, z: 1, r: 0, ...from};
	const b = {...a, ...(to ?? {})};
	const t = ease(clamp(f / Math.max(1, d - 1)));
	const cx = a.cx + (b.cx - a.cx) * t;
	const cy = a.cy + (b.cy - a.cy) * t;
	const z = a.z + (b.z - a.z) * t;
	const r = a.r + (b.r - a.r) * t;
	const rk = rocking(f, rock);
	const [sx, sy] = shakeFn(f, shakeAt, shakeAmp);
	const tx = 960 - cx * z + sx;
	const ty = 540 - cy * z + sy + rk.dy;
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
					transform: `translate(${tx}px, ${ty}px) rotate(${r + rk.rot}deg) scale(${z})`,
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

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
	children: React.ReactNode;
	overlay?: React.ReactNode;
}> = ({f, d, from, to, rock, shakeAt, shakeAmp, bg = '#05070c', children, overlay}) => (
	<AbsoluteFill style={{background: bg}}>
		<Cam f={f} d={d} from={from} to={to} rock={rock} shakeAt={shakeAt} shakeAmp={shakeAmp}>
			<Svg>{children}</Svg>
		</Cam>
		{overlay}
	</AbsoluteFill>
);
