// All sound in the video: voices, sound effects and ambience beds.
//
// Safe loading: an <Audio> is only mounted when the file is listed in
// src/data/generated/audioManifest.json (written by `npm run retime`). Missing
// files are simply silent - the project always compiles and renders.
//
// Two Remotion facts shape this file:
// - a volume callback is evaluated once per VIDEO frame (ffmpeg `volume=...:eval=frame`
//   with one value per video frame, quantised to 1/97 steps), so ramps shorter than a
//   frame are impossible here. Click protection at the very start of every effect is
//   therefore baked into the files (scripts/sfx/build_real_sfx.py: every one-shot starts
//   on an exact zero with a 4 ms fade-in and ends on silence).
// - assets are placed with `adelay` rounded to whole milliseconds, so two tiles of a loop
//   can never be butted together sample-exactly. Beds therefore overlap: every bed file
//   ends with a copy of its first BED_TAIL seconds, tiles start every (length - BED_TAIL)
//   seconds and crossfade over that shared, identical audio (no click, no tempo hiccup
//   for the musical bed).
import React, {useMemo} from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {audioDuration, FPS, type BedKey, type Timeline} from '../data/timeline';
import type {BedName} from '../data/types';

/** Master gains. Voices sit on top; effects lower; beds are quiet and gently ducked. */
export const MIX = {
	voice: 1.0,
	sfx: 0.8,
	/** 0.8 (-1.9 dB) compensates the much shallower duck below: under dialogue the beds sit
	 *  ~1.4 dB above the old mix (0.8 * 0.78 vs 1.0 * 0.55), in pauses ~1.9 dB below it. */
	bed: 0.8,
	/** how far beds drop while someone is speaking (0..1). 0.22 ~ -2 dB: a dip, not a pump. */
	duckDepth: 0.22,
	/** duck attack / release time constants (seconds) */
	duckAttack: 0.15,
	duckRelease: 0.7,
	/** pauses between lines shorter than this keep the beds ducked (no swell in every gap) */
	duckBridge: 1.5,
	/** the duck starts this long before a line so it has settled when the voice comes in */
	duckLead: 0.2,
	/** truncated effects (maxDuration) fade out over this long */
	sfxFadeOut: 0.3,
};

/** Every bed file ends with a copy of its first BED_TAIL seconds (see header). */
const BED_TAIL = 0.5;

const BED_FILES: Record<BedName, string> = {
	house: 'sfx/house_tone.wav', // the old farmhouse: wind against the walls, the house settling
	day: 'sfx/woods_day.wav', // spring birds in the pines
	night: 'sfx/woods_night.wav', // spring night: peepers and crickets
	truck: 'sfx/truck_idle.wav', // the moving truck's diesel at 4 a.m.
	wind: 'sfx/hill_wind.wav', // wind over the hilltop and through the open window
	musicbox: 'sfx/musicbox_lullaby.wav', // Mr. Widemouth's lullaby (winds down out of tune)
	drone: 'sfx/low_horror_drone.wav',
	tension: 'sfx/tension_pulse.wav',
	heart: 'sfx/heartbeat_loop.wav',
	heartFast: 'sfx/heartbeat_fast.wav',
};

/** Beds that are never ducked under dialogue. */
const UNDUCKED = new Set<BedName>(['tension', 'heart', 'heartFast']);

const levelAt = (keys: BedKey[], t: number) => {
	if (!keys.length) return 0;
	if (t <= keys[0].t) return keys[0].v;
	let lo = 0;
	let hi = keys.length - 1;
	if (t >= keys[hi].t) return keys[hi].v;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (keys[mid].t <= t) lo = mid;
		else hi = mid;
	}
	const a = keys[lo];
	const b = keys[hi];
	if (b.t === a.t) return b.v;
	return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Per-frame duck amount 0..1 (1 = fully ducked). */
const useDuck = (tl: Timeline) =>
	useMemo(() => {
		const n = tl.totalFrames + 1;
		// 1) speech spans (overlay crowd fragments don't duck), started a little early
		const spans = tl.lines
			.filter((l) => !l.overlay && l.exists)
			.map((l) => [l.start - MIX.duckLead, l.end] as [number, number])
			.sort((a, b) => a[0] - b[0]);
		// 2) bridge short pauses: the beds stay down through a conversation instead of
		//    swelling up in every gap and dropping again at the next line
		const merged: Array<[number, number]> = [];
		for (const [a, b] of spans) {
			const last = merged[merged.length - 1];
			if (last && a - last[1] < MIX.duckBridge) last[1] = Math.max(last[1], b);
			else merged.push([a, b]);
		}
		const target = new Float32Array(n);
		for (const [a, b] of merged) {
			const i0 = Math.max(0, Math.floor(a * FPS));
			const i1 = Math.min(n - 1, Math.ceil(b * FPS));
			for (let i = i0; i <= i1; i++) target[i] = 1;
		}
		// 3) smooth one-pole follower with separate attack / release time constants
		const ka = 1 - Math.exp(-1 / (FPS * MIX.duckAttack));
		const kr = 1 - Math.exp(-1 / (FPS * MIX.duckRelease));
		const out = new Float32Array(n);
		let v = 0;
		for (let i = 0; i < n; i++) {
			const t = target[i];
			v += (t - v) * (t > v ? ka : kr);
			out[i] = v;
		}
		return out;
	}, [tl]);

/**
 * Optional dead silence from the start of one scene to the end of the film (Frame 240's white hold).
 * OFF in this film: it used to trigger on any scene called 'end', which silenced this film's whole final
 * scene (narration, beds and music from 9:03 on).
 */
const SILENT_FROM_SCENE: string | null = null;
const silenceFrom = (tl: Timeline) => {
	const s = SILENT_FROM_SCENE ? tl.scenes.find((x) => x.id === SILENT_FROM_SCENE) : undefined;
	return s ? s.startFrame : tl.totalFrames;
};

export const AudioLayer: React.FC<{timeline: Timeline}> = ({timeline: tl}) => {
	const duck = useDuck(tl);
	const cut = silenceFrom(tl);
	const tail = (from: number, f: number) => {
		// 2-frame fade into the silence (no click), then nothing
		const g = from + f;
		return g >= cut ? 0 : g >= cut - 2 ? (cut - g) / 3 : 1;
	};

	const voices = tl.lines
		.filter((l) => l.exists)
		.map((l, i) => {
			const from = Math.round(l.start * FPS);
			const dur = Math.ceil((l.end - l.start) * FPS) + 2;
			return (
				<Sequence key={`v${i}`} from={from} durationInFrames={dur} name={`voice ${l.line.id}`} layout="none">
					<Audio src={staticFile(`audio/${l.line.filename}`)} volume={(f) => l.volume * MIX.voice * tail(from, f)} />
				</Sequence>
			);
		});

	const sfx = tl.sfx
		.map((c, i) => {
			const file = `sfx/${c.sound}.wav`;
			const len = audioDuration(file);
			if (len === null) return null; // AUDIO CUE placeholder: file missing -> silent
			const play = Math.min(len, c.maxDuration ?? len);
			const frames = Math.max(1, Math.ceil(play * FPS));
			const from = Math.round(c.start * FPS);
			if (from >= cut) return null;
			const shown = Math.min(frames, tl.totalFrames - from);
			// cut short by maxDuration (or by the end of the video): fade out instead of chopping.
			// The fade is >= 0.25 s unless the cue itself is very short (then half of it).
			const truncated = (c.maxDuration !== undefined && c.maxDuration < len - 0.02) || shown < frames;
			const fadeFrames = truncated ? Math.max(1, Math.min(Math.round(MIX.sfxFadeOut * FPS), Math.floor(shown / 2))) : 0;
			const volume = (f: number) => {
				if (!fadeFrames) return c.volume * MIX.sfx * tail(from, f);
				// equal-power shaped fade reaching exactly 0 on the last frame
				const rest = clamp01((shown - 1 - f) / fadeFrames);
				return c.volume * MIX.sfx * Math.sin((rest * Math.PI) / 2) * tail(from, f);
			};
			return (
				<Sequence key={`s${i}`} from={from} durationInFrames={shown} name={`sfx ${c.sound}`} layout="none">
					<Audio src={staticFile(`audio/${file}`)} volume={volume} />
				</Sequence>
			);
		})
		.filter(Boolean);

	const beds: React.ReactNode[] = [];
	const tailF = Math.round(BED_TAIL * FPS);
	for (const [name, file] of Object.entries(BED_FILES) as Array<[BedName, string]>) {
		const len = audioDuration(file);
		const keys = tl.beds[name] as BedKey[] | undefined; // a bed the timeline doesn't automate is silent
		if (len === null || !keys?.length) continue;
		const loopF = Math.round((len - BED_TAIL) * FPS); // exact loop length in frames
		if (loopF < 2 * tailF) continue;
		const ducked = !UNDUCKED.has(name);
		for (let k = 0; k * loopF < tl.totalFrames; k++) {
			const start = k * loopF;
			const dur = Math.min(loopF + tailF, tl.totalFrames - start);
			// skip tiles where this bed is silent the whole time (incl. the crossfade overlap)
			let maxV = 0;
			for (let fr = start; fr <= start + dur; fr += 15) maxV = Math.max(maxV, levelAt(keys, fr / FPS));
			for (const key of keys) if (key.t * FPS >= start && key.t * FPS <= start + dur) maxV = Math.max(maxV, key.v);
			if (maxV <= 0.001) continue;
			beds.push(
				<Sequence key={`b${name}${k}`} from={start} durationInFrames={dur} name={`bed ${name}`} layout="none">
					<Audio
						src={staticFile(`audio/${file}`)}
						volume={(f) => {
							const g = start + f;
							const lvl = levelAt(keys, g / FPS);
							const dk = ducked ? 1 - MIX.duckDepth * (duck[Math.min(duck.length - 1, g)] ?? 0) : 1;
							// linear crossfade with the previous / next tile over the shared tail
							// (both play identical audio there, so the sum stays at unity gain)
							let xf = 1;
							if (k > 0 && f < tailF) xf = (f + 0.5) / tailF;
							else if (f >= loopF) xf = clamp01((loopF + tailF - f - 0.5) / tailF);
							return Math.max(0, lvl * dk * MIX.bed * xf * tail(start, f));
						}}
					/>
				</Sequence>,
			);
		}
	}

	return (
		<>
			{beds}
			{sfx}
			{voices}
		</>
	);
};
