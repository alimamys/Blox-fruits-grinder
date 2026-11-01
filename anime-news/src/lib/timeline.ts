import timelineJson from '../generated/timeline.json';
import mediaJson from '../generated/media-status.json';
import scriptJson from '../data/script.json';
import registryJson from '../data/assets.json';
import sourcesJson from '../data/sources.json';

export type AudioKind = 'final' | 'scratch' | 'missing';

export type Cue = {
	id: string;
	text: string;
	startFrame: number;
	durationFrames: number;
	endFrame: number;
	seconds: number;
	audio: string | null;
	audioKind: AudioKind;
	captionStart: number;
	captionEnd: number;
};

/** Scene data: everything the brief asks to be stored per scene. */
export type Scene = {
	id: string;
	chapter: string;
	startFrame: number;
	durationFrames: number;
	planStartSec: number;
	planDurationSec: number;
	narration: string;
	sourceIds: string[];
	assetIds: string[];
	assetPaths: string[];
	cues: Cue[];
	visualCues: {n: number; frame: number; text: string}[];
	soundCues: {frame: number; text: string}[];
};

export type AssetStatus = {
	key: string;
	file: string | null;
	layers: {file: string; depth: number}[];
	variants: Record<string, string>;
	anchors: Record<string, number[]>;
};

type Timeline = {
	fps: number;
	width: number;
	height: number;
	totalFrames: number;
	narration: Record<AudioKind, number>;
	scenes: Omit<Scene, 'narration' | 'assetPaths'>[];
};

const tl = timelineJson as unknown as Timeline;
export const media = mediaJson as unknown as {
	assets: Record<string, AssetStatus>;
	sfx: Record<string, {file: string | null; temp: boolean}>;
};
export const registry = registryJson;
export const sources = sourcesJson.sources;

export const FPS = tl.fps;
export const WIDTH = tl.width;
export const HEIGHT = tl.height;
export const TOTAL_FRAMES = tl.totalFrames;

export const SCENES: Scene[] = tl.scenes.map((s) => {
	const src = scriptJson.scenes.find((x) => x.id === s.id)!;
	return {
		...s,
		narration: src.narration,
		assetPaths: s.assetIds.map((id) => {
			const a = registry.assets.find((r) => r.id === id)!;
			return `public/assets/${a.file}`;
		}),
	};
});

export const ALL_CUES: Cue[] = SCENES.flatMap((s) => s.cues);

export const scene = (id: string): Scene => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) throw new Error(`No scene ${id}`);
	return s;
};

/** Cue timing relative to its scene start. */
export const localCue = (sceneId: string, cueId: string) => {
	const s = scene(sceneId);
	const c = s.cues.find((x) => x.id === cueId);
	if (!c) throw new Error(`No cue ${cueId}`);
	return {s: c.startFrame - s.startFrame, e: c.endFrame - s.startFrame, d: c.durationFrames};
};

/**
 * The opening preview: 20 s, extended to the end of any narration cue that is
 * still running at 20 s so the narrator is never cut mid-sentence.
 */
export const PREVIEW_TARGET_FRAMES = 20 * FPS;
export const PREVIEW_FRAMES = (() => {
	const running = ALL_CUES.find((c) => c.startFrame < PREVIEW_TARGET_FRAMES && c.endFrame > PREVIEW_TARGET_FRAMES);
	return running ? running.endFrame + 8 : PREVIEW_TARGET_FRAMES;
})();

export const narrationIsTemp = (from: number, to: number) =>
	ALL_CUES.some((c) => c.startFrame < to && c.endFrame > from && c.audioKind !== 'final');

export const assetIsPlaceholder = (id: string) => !media.assets[id]?.file;
