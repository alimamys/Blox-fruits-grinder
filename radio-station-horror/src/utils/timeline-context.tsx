// Lets scenes say "from beat A to beat B" instead of hard-coding frames.
//
//   <Shot from="static" to="beep3" name="Radio close-up"> <RadioCloseUp /> </Shot>
//
// Inside a shot, useShot() returns the shot-local frame plus helpers that
// convert beat ids to shot-local frames.
import React, {createContext, useContext, useMemo} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {FPS} from '../config';
import type {BeatTiming, ChapterTiming} from '../data/timeline';
import {getChapter} from '../data/timeline';
import type {ChapterId} from '../data/types';

const ChapterCtx = createContext<ChapterTiming | null>(null);
const ShotCtx = createContext<{offset: number; frames: number} | null>(null);

export const ChapterProvider: React.FC<{id: ChapterId; children: React.ReactNode}> = ({id, children}) => {
	const ch = useMemo(() => getChapter(id), [id]);
	return <ChapterCtx.Provider value={ch}>{children}</ChapterCtx.Provider>;
};

export const useChapter = (): ChapterTiming => {
	const ch = useContext(ChapterCtx);
	if (!ch) {
		throw new Error('useChapter() must be used inside <ChapterProvider>');
	}
	return ch;
};

const beatOf = (ch: ChapterTiming, id: string): BeatTiming => {
	const b = ch.byId[id];
	if (!b) {
		throw new Error(`Beat "${id}" not found in chapter "${ch.id}". Check src/data/script.ts`);
	}
	return b;
};

type ShotProps = {
	/** First beat of the shot. */
	from: string;
	/** Last beat (inclusive). Defaults to `from`. */
	to?: string;
	/** Seconds to shift the cut (negative = earlier). */
	startOffset?: number;
	endOffset?: number;
	name?: string;
	children: React.ReactNode;
};

/** A camera shot spanning one or more beats of the current chapter. */
export const Shot: React.FC<ShotProps> = ({from, to, startOffset = 0, endOffset = 0, name, children}) => {
	const ch = useChapter();
	const a = beatOf(ch, from);
	const b = beatOf(ch, to ?? from);
	const start = Math.max(0, a.start + Math.round(startOffset * FPS));
	const end = Math.min(ch.frames, b.end + Math.round(endOffset * FPS));
	const frames = Math.max(1, end - start);
	const value = useMemo(() => ({offset: start, frames}), [start, frames]);
	return (
		<Sequence from={start} durationInFrames={frames} name={name ?? `${from}→${to ?? from}`}>
			<ShotCtx.Provider value={value}>{children}</ShotCtx.Provider>
		</Sequence>
	);
};

export type ShotApi = {
	/** Shot-local frame. */
	f: number;
	/** Shot length in frames. */
	dur: number;
	/** 0..1 progress through the shot. */
	p: number;
	/** Start of a beat, in shot-local frames (may be negative / beyond dur). */
	at: (beatId: string) => number;
	/** End of a beat, in shot-local frames. */
	end: (beatId: string) => number;
	/** Length of a beat in frames. */
	len: (beatId: string) => number;
	/** Seconds → frames. */
	s: (seconds: number) => number;
	/** True while the given beat is playing. */
	during: (beatId: string) => boolean;
	/** The beat currently playing (or undefined). */
	current: BeatTiming | undefined;
	chapter: ChapterTiming;
};

export const useShot = (): ShotApi => {
	const ch = useChapter();
	const shot = useContext(ShotCtx);
	const f = useCurrentFrame();
	const offset = shot?.offset ?? 0;
	const dur = shot?.frames ?? ch.frames;
	const chapterFrame = f + offset;
	return {
		f,
		dur,
		p: dur <= 1 ? 1 : Math.min(1, Math.max(0, f / (dur - 1))),
		at: (id) => beatOf(ch, id).start - offset,
		end: (id) => beatOf(ch, id).end - offset,
		len: (id) => beatOf(ch, id).frames,
		s: (sec) => Math.round(sec * FPS),
		during: (id) => {
			const b = beatOf(ch, id);
			return chapterFrame >= b.start && chapterFrame < b.end;
		},
		current: ch.beats.find((b) => chapterFrame >= b.start && chapterFrame < b.end),
		chapter: ch,
	};
};
