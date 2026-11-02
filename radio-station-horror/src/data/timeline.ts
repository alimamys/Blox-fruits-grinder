// Converts the seconds-based script into frame-accurate timings.
// Nothing in here needs editing – change src/data/script.ts instead.
import {FPS} from '../config';
import {CHAPTERS, ELLIPSIS_GAP, FIXED_TOTALS, HOLD_BEATS, MIN_VOICED_BEAT, VOICE_GAP} from './script';
import type {Beat, Chapter, ChapterId} from './types';
import voiceDurations from './voice-durations.json';

const CLIPS = voiceDurations as Record<string, number>;

/** Beat length after fitting the voice clip (if any). */
const fittedDur = (chapter: ChapterId, b: Beat): number => {
	const clip = CLIPS[`${chapter}/${b.id}`];
	if (!clip) {
		return b.dur;
	}
	const gap = VOICE_GAP[b.speaker] + (b.text.trim().endsWith('...') ? ELLIPSIS_GAP : 0);
	const hold = HOLD_BEATS[chapter]?.includes(b.id) ? b.dur : MIN_VOICED_BEAT;
	return Math.max(hold, clip + gap);
};

const fittedChapter = (ch: Chapter): Beat[] => {
	const beats = ch.beats.map((b) => ({...b, dur: fittedDur(ch.id, b)}));
	for (const group of FIXED_TOTALS.filter((g) => g.chapter === ch.id)) {
		const members = group.beats.map((id) => beats.find((b) => b.id === id)).filter((b): b is Beat => Boolean(b));
		const last = members[members.length - 1];
		if (!last) {
			continue;
		}
		const others = members.slice(0, -1).reduce((sum, b) => sum + b.dur, 0);
		const lastClip = CLIPS[`${ch.id}/${last.id}`] ?? 0;
		last.dur = Math.max(lastClip + VOICE_GAP[last.speaker], group.total - others);
	}
	return beats;
};

export type BeatTiming = Beat & {
	/** Start frame relative to the chapter start. */
	start: number;
	/** End frame (exclusive) relative to the chapter start. */
	end: number;
	frames: number;
	/** Absolute start frame in the full video. */
	absStart: number;
};

export type ChapterTiming = Omit<Chapter, 'beats'> & {
	/** Absolute start frame. */
	start: number;
	frames: number;
	beats: BeatTiming[];
	byId: Record<string, BeatTiming>;
};

const build = (): {chapters: ChapterTiming[]; total: number} => {
	let cursorSec = 0;
	const chapters: ChapterTiming[] = [];
	for (const ch of CHAPTERS) {
		const chStartSec = cursorSec;
		const chStart = Math.round(chStartSec * FPS);
		const beats: BeatTiming[] = [];
		for (const b of fittedChapter(ch)) {
			const absStart = Math.round(cursorSec * FPS);
			cursorSec += b.dur;
			const absEnd = Math.round(cursorSec * FPS);
			beats.push({
				...b,
				start: absStart - chStart,
				end: absEnd - chStart,
				frames: absEnd - absStart,
				absStart,
			});
		}
		const chEnd = Math.round(cursorSec * FPS);
		const byId: Record<string, BeatTiming> = {};
		for (const b of beats) {
			if (byId[b.id]) {
				throw new Error(`Duplicate beat id "${b.id}" in chapter "${ch.id}"`);
			}
			byId[b.id] = b;
		}
		chapters.push({...ch, start: chStart, frames: chEnd - chStart, beats, byId});
	}
	return {chapters, total: Math.round(cursorSec * FPS)};
};

const built = build();

export const TIMELINE: ChapterTiming[] = built.chapters;
export const TOTAL_FRAMES: number = built.total;

export const getChapter = (id: ChapterId): ChapterTiming => {
	const ch = TIMELINE.find((c) => c.id === id);
	if (!ch) {
		throw new Error(`Unknown chapter ${id}`);
	}
	return ch;
};

export const formatTimecode = (frame: number): string => {
	const totalSec = frame / FPS;
	const m = Math.floor(totalSec / 60);
	const s = Math.floor(totalSec % 60);
	const ms = Math.round((totalSec - Math.floor(totalSec)) * 1000);
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
};
