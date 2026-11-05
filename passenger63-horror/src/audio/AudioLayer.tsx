// All sound in the video: voices, sound effects and ambience beds.
//
// Safe loading: an <Audio> is only mounted when the file is listed in
// src/data/generated/audioManifest.json (written by `npm run retime`). Missing
// files are simply silent - the project always compiles and renders.
import React, {useMemo} from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {audioDuration, FPS, type BedKey, type Timeline} from '../data/timeline';
import type {BedName} from '../data/types';

/** Master gains. Voices sit on top; effects lower; beds are quiet and ducked. */
export const MIX = {
	voice: 1.0,
	sfx: 0.8,
	bed: 1.0,
	/** how far beds drop while someone is speaking (0..1) */
	duckDepth: 0.45,
};

const BED_FILES: Record<BedName, string> = {
	ocean: 'sfx/ocean_ambience.wav',
	engine: 'sfx/ferry_engine.wav',
	wind: 'sfx/wind.wav',
	drone: 'sfx/low_horror_drone.wav',
	crowd: 'sfx/crowd_murmur.wav',
	bridge: 'sfx/bridge_electronics.wav',
	emergency: 'sfx/emergency_hum.wav',
	room: 'sfx/room_tone.wav',
	daylight: 'sfx/daylight_ambience.wav',
};

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

const useDuck = (tl: Timeline) =>
	useMemo(() => {
		const n = tl.totalFrames + 1;
		const active = new Float32Array(n);
		for (const l of tl.lines) {
			if (l.overlay) continue;
			const a = Math.max(0, Math.floor(l.start * FPS));
			const b = Math.min(n - 1, Math.ceil(l.end * FPS));
			for (let i = a; i <= b; i++) active[i] = 1;
		}
		// attack ~4 frames, release ~12 frames
		const out = new Float32Array(n);
		let v = 0;
		for (let i = 0; i < n; i++) {
			const target = active[i];
			v += (target - v) * (target > v ? 0.3 : 0.08);
			out[i] = v;
		}
		// look-ahead so the duck starts just before the line
		const res = new Float32Array(n);
		for (let i = 0; i < n; i++) res[i] = Math.max(out[i], out[Math.min(n - 1, i + 3)]);
		return res;
	}, [tl]);

export const AudioLayer: React.FC<{timeline: Timeline}> = ({timeline: tl}) => {
	const duck = useDuck(tl);

	const voices = tl.lines
		.filter((l) => l.exists)
		.map((l, i) => {
			const from = Math.round(l.start * FPS);
			const dur = Math.ceil((l.end - l.start) * FPS) + 2;
			return (
				<Sequence key={`v${i}`} from={from} durationInFrames={dur} name={`voice ${l.line.id}`} layout="none">
					<Audio src={staticFile(`audio/${l.line.filename}`)} volume={l.volume * MIX.voice} />
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
			const fadeFrames = c.maxDuration !== undefined && c.maxDuration < len ? 9 : 0;
			const from = Math.round(c.start * FPS);
			if (from >= tl.totalFrames) return null;
			return (
				<Sequence key={`s${i}`} from={from} durationInFrames={Math.min(frames, tl.totalFrames - from)} name={`sfx ${c.sound}`} layout="none">
					<Audio
						src={staticFile(`audio/${file}`)}
						volume={(f) => c.volume * MIX.sfx * (fadeFrames ? Math.min(1, Math.max(0, (frames - f) / fadeFrames)) : 1)}
					/>
				</Sequence>
			);
		})
		.filter(Boolean);

	const beds: React.ReactNode[] = [];
	for (const [name, file] of Object.entries(BED_FILES) as Array<[BedName, string]>) {
		const len = audioDuration(file);
		if (len === null) continue;
		const keys = tl.beds[name];
		const tile = Math.floor(len * FPS) - 1;
		for (let k = 0; k * tile < tl.totalFrames; k++) {
			const start = k * tile;
			const dur = Math.min(tile, tl.totalFrames - start);
			// skip tiles where this bed is silent the whole time
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
							const dk = name === 'emergency' ? 1 : 1 - MIX.duckDepth * (duck[Math.min(duck.length - 1, g)] ?? 0);
							return Math.max(0, lvl * dk * MIX.bed);
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
