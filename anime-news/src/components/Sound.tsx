/**
 * Narration + sound design. Music/ambience beds duck under speech, computed
 * from the same cue timings as the captions. Every file resolves to the final
 * version in public/audio/sfx/ when supplied, otherwise the procedural TEMP
 * version in public/audio/sfx_temp/.
 */
import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {ALL_CUES, media, scene} from '../lib/timeline';
import {ramp} from '../lib/motion';
import {s01Cuts} from '../scenes/S01ColdOpen';

const sfx = (name: string) => {
	const f = media.sfx[name]?.file;
	return f ? staticFile(f) : null;
};

/** 0 when silent, 1 while the narrator speaks (with short ramps). */
const speech = (absFrame: number) => {
	let v = 0;
	for (const c of ALL_CUES) {
		if (absFrame < c.startFrame - 6 || absFrame > c.endFrame + 10) continue;
		const inR = ramp(absFrame, c.startFrame - 6, c.startFrame, 0, 1);
		const outR = ramp(absFrame, c.endFrame, c.endFrame + 10, 1, 0);
		v = Math.max(v, Math.min(inR, outR));
	}
	return v;
};

export const Narration: React.FC = () => (
	<>
		{ALL_CUES.filter((c) => c.audio).map((c) => (
			<Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationFrames + 4} name={`VO ${c.id}${c.audioKind === 'scratch' ? ' (TEMP TTS)' : ''}`} layout="none">
				<Html5Audio src={staticFile(c.audio!)} />
			</Sequence>
		))}
	</>
);

const Bed: React.FC<{name: string; from: number; dur: number; volume: (abs: number) => number}> = ({name, from, dur, volume}) => {
	const src = sfx(name);
	if (!src || dur <= 0) return null;
	return (
		<Sequence from={from} durationInFrames={dur} name={`bed ${name}`} layout="none">
			<Html5Audio src={src} loop loopVolumeCurveBehavior="extend" volume={(f) => Math.max(0, volume(from + f))} />
		</Sequence>
	);
};

const Hit: React.FC<{name: string; at: number; volume: number; label: string}> = ({name, at, volume, label}) => {
	const src = sfx(name);
	if (!src) return null;
	return (
		<Sequence from={at} durationInFrames={36} name={label} layout="none">
			<Html5Audio src={src} volume={volume} />
		</Sequence>
	);
};

export const SoundDesign: React.FC<{totalFrames: number}> = ({totalFrames}) => {
	const s1 = scene('S01');
	const s2 = scene('S02');
	const k = s01Cuts();
	const s2End = s2.startFrame + s2.durationFrames;
	return (
		<>
			{/* S01: single radio click, low synth pulse, bass accents at cuts (none under the first words) */}
			<Hit name="radio_click" at={2} volume={0.55} label="radio click" />
			<Bed
				name="synth_pulse_bed"
				from={0}
				dur={totalFrames}
				volume={(a) => {
					// full level for the cold open, pulls back under the Gulf ambience
					const lvl = ramp(a, s2.startFrame - 12, s2.startFrame + 12, 0.34, 0.13);
					return ramp(a, 0, 20, 0, 1) * lvl * (1 - 0.45 * speech(a));
				}}
			/>
			{[
				{at: k.c2.s, v: 0.5},
				{at: k.c3.s, v: 0.45},
				{at: k.c4.s, v: 0.5},
				{at: k.c6.s, v: 0.55},
				{at: k.c7.s, v: 0.6},
			].map((h) => (
				<Hit key={h.at} name="bass_accent" at={s1.startFrame + h.at} volume={h.v} label="bass accent" />
			))}
			{/* S02: distant water and a restrained ticking motif; low tension */}
			<Bed
				name="water_distant"
				from={s2.startFrame - 8}
				dur={Math.min(totalFrames, s2End + 12) - (s2.startFrame - 8)}
				volume={(a) => ramp(a, s2.startFrame - 8, s2.startFrame + 16, 0, 0.55) * ramp(a, s2End - 12, s2End + 12, 1, 0) * (1 - 0.35 * speech(a))}
			/>
			<Bed
				name="tick_motif"
				from={s2.startFrame + 10}
				dur={Math.min(totalFrames, s2End) - (s2.startFrame + 10)}
				volume={(a) => ramp(a, s2.startFrame + 10, s2.startFrame + 40, 0, 0.2) * ramp(a, s2End - 24, s2End, 1, 0) * (1 - 0.3 * speech(a))}
			/>
		</>
	);
};
