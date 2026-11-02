// Converts the seconds-based script into frame-accurate timings.
// Nothing in here needs editing – change src/data/script.ts instead.
import {FPS} from '../config';
import {CHAPTERS} from './script';
import type {Beat, Chapter, ChapterId} from './types';

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
		for (const b of ch.beats) {
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
