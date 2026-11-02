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

const Hit: React.FC<{name: string; at: number; volume: number; label: string; dur?: number}> = ({name, at, volume, label, dur = 90}) => {
	const src = sfx(name);
	if (!src) return null;
	return (
		<Sequence from={at} durationInFrames={dur} name={label} layout="none">
			<Html5Audio src={src} volume={volume} />
		</Sequence>
	);
};

/** Ambience between two absolute frames with short fades, ducked under speech. */
const Amb: React.FC<{name: string; from: number; to: number; vol: number; fade?: number; duck?: number}> = ({name, from, to, vol, fade = 4, duck = 0.88}) => (
	<Bed name={name} from={from} dur={to - from} volume={(a) => vol * ramp(a, from, from + fade, 0, 1) * ramp(a, to - fade, to, 1, 0) * (1 - duck * speech(a))} />
);

/** Absolute frames of a cue: cue('S03','05') → {s, e}. */
const cue = (sceneId: string, nn: string) => {
	const c = scene(sceneId).cues.find((x) => x.id === `${sceneId}_${nn}`)!;
	return {s: c.startFrame, e: c.endFrame, d: c.durationFrames};
};
const startOf = (id: string) => scene(id).startFrame;
const endOf = (id: string) => scene(id).startFrame + scene(id).durationFrames;

export const SoundDesign: React.FC<{totalFrames: number}> = ({totalFrames}) => {
	const k = s01Cuts();
	const o = startOf('S01');
	const S = ['S02', 'S03', 'S04', 'S05', 'S06', 'S07'].map((id) => ({id, a: startOf(id), b: Math.min(totalFrames, endOf(id))}));
	const [s2, s3, s4, s5, s6, s7] = S;
	const reunion = cue('S04', '09').s;
	const finalAt = cue('S07', '08').e + 16;
	// score level per chapter (the brief: lower under Ukraine and the reunion; silence at the end)
	const scoreLevel = (a: number) => {
		const xf = (at: number, from: number, to: number) => ramp(a, at - 12, at + 12, from, to);
		let v = xf(s2.a, 0.08, 0.05);
		if (a > s3.a - 12) v = xf(s3.a, 0.05, 0.05);
		if (a > s4.a - 12) v = xf(s4.a, 0.05, 0.035);
		if (a > reunion - 24) v = ramp(a, reunion - 24, reunion + 24, 0.035, 0.03);
		if (a > s5.a - 12) v = xf(s5.a, 0.03, 0.045);
		if (a > s6.a - 12) v = xf(s6.a, 0.045, 0.035);
		if (a > s7.a - 12) v = xf(s7.a, 0.035, 0.05);
		if (a > finalAt - 60) v = ramp(a, finalAt - 60, finalAt, 0.05, 0);
		return v;
	};
	return (
		<>
			{/* ---------- S01: radio click on black, tension bed, accents at cuts (none under the first words) */}
			<Hit name="radio_click" at={2} volume={0.22} label="radio click" />
			<Bed name="synth_pulse_bed" from={0} dur={Math.min(totalFrames, finalAt)} volume={(a) => ramp(a, 0, 20, 0, 1) * scoreLevel(a) * (1 - 0.92 * speech(a))} />
			{[
				{at: k.c2.s, v: 0.16},
				{at: k.c3.s, v: 0.14},
				{at: k.c4.s, v: 0.16},
			].map((h) => (
				<Hit key={h.at} name="bass_accent" at={o + h.at - 9} volume={h.v * 0.6} label="bass accent" />
			))}
			<Amb name="monitor_hum" from={o + k.c4.s} to={o + k.c6.s} vol={0.06} />
			<Hit name="whoosh" at={o + k.c6.s - 8} volume={0.12} label="whoosh into panels" />
			<Hit name="riser" at={o + k.c7.s - 62} volume={0.06} label="riser" />
			<Hit name="title_hit" at={o + k.c7.s - 7} volume={0.12} label="title hit" />
			<Hit name="glint" at={o + k.c7.s + 14} volume={0.06} label="title glint" />

			{/* chapter transitions */}
			{S.map((c) => (
				<Hit key={c.id} name="whoosh" at={c.a - 6} volume={0.07} label={`whoosh into ${c.id}`} />
			))}

			{/* ---------- S02 Gulf: distant water and a restrained ticking motif */}
			<Amb name="water_distant" from={s2.a - 8} to={s2.b + 8} vol={0.14} fade={16} />
			<Amb name="tick_motif" from={s2.a + 10} to={s2.b} vol={0.04} fade={24} />

			{/* ---------- S03 Israel: room tone, paper movement, three subdued number clicks */}
			<Amb name="room_tone" from={s3.a} to={s3.b} vol={0.07} fade={12} />
			<Hit name="paper_rustle" at={s3.a + 2} volume={0.15} label="paper" />
			<Hit name="paper_rustle" at={cue('S03', '05').s - 16} volume={0.12} label="paper" />
			{['02', '03', '04'].map((n) => (
				<Hit key={n} name="number_click" at={cue('S03', n).e} volume={0.22} label={`number click ${n}`} />
			))}
			<Hit name="glint" at={cue('S03', '05').s - 6} volume={0.05} label="61 tone" />

			{/* ---------- S04 Ukraine: lower score, quiet arrival ambience; gentle reunion */}
			<Amb name="arrival_ambience" from={s4.a} to={s4.b} vol={0.12} fade={14} />

			{/* ---------- S05 France: low crowd ambience; clash sound distant and brief */}
			<Amb name="crowd_murmur" from={s5.a} to={cue('S05', '07').s + 4} vol={0.11} fade={12} />
			<Hit name="distant_unrest" at={cue('S05', '07').s + 4} volume={0.08} label="distant unrest" dur={110} />
			<Amb name="crowd_murmur" from={cue('S05', '08').s - 30} to={s5.b} vol={0.09} fade={14} />

			{/* ---------- S06 Markets: restrained electronic pulse, monitor and key accents */}
			<Amb name="electronic_pulse" from={s6.a} to={s6.b} vol={0.06} fade={16} />
			<Amb name="monitor_hum" from={s6.a} to={s6.b} vol={0.07} fade={16} />
			<Hit name="number_click" at={cue('S06', '02').e} volume={0.2} label="S&P reveal" />
			<Hit name="number_click" at={cue('S06', '03').e} volume={0.2} label="Nasdaq reveal" />

			{/* ---------- S07: calendar turn, one returning pulse, quiet final tone, then silence */}
			<Hit name="calendar_flip" at={cue('S07', '01').e + 2} volume={0.25} label="calendar turn" />
			<Hit name="bass_accent" at={cue('S07', '02').s - 9} volume={0.12} label="returning pulse" />
			<Amb name="room_tone" from={cue('S07', '06').s - 20} to={finalAt} vol={0.05} fade={20} />
			<Hit name="final_tone" at={finalAt - 6} volume={0.28} label="final tone" dur={150} />
		</>
	);
};
