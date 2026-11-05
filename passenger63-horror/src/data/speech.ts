// Word timings + mouth envelopes measured from the real voice files
// (scripts/voice/speech_timing.py -> src/data/generated/speechTiming.json).
// Used for lip sync (talk + viseme) and for the subtitles.
import timing from './generated/speechTiming.json';
import type {Viseme} from '../components/characters/StickPerson';

type Entry = {w: Array<[string, number, number]>; e: string};
const DATA = timing as unknown as Record<string, Entry>;

export const hasSpeech = (id: string) => Boolean(DATA[id]);

/** Words of a line with their times (seconds from the line start). */
export const wordsOf = (id: string): Array<[string, number, number]> => DATA[id]?.w ?? [];

/** Mouth openness 0..1 at `t` seconds into the line (null when there is no data). */
export const envelopeAt = (id: string, t: number): number | null => {
	const e = DATA[id]?.e;
	if (!e) return null;
	const i = t * 30;
	const a = Math.max(0, Math.min(e.length - 1, Math.floor(i)));
	const b = Math.min(e.length - 1, a + 1);
	const fr = i - Math.floor(i);
	const va = Number(e[a]) / 9;
	const vb = Number(e[b]) / 9;
	return va + (vb - va) * fr;
};

const visemeForWord = (word: string, frac: number): Viseme => {
	const s = word.toLowerCase().replace(/[^a-z]/g, '');
	if (!s) return 'a';
	if (frac < 0.2 && /^[mbp]/.test(s)) return 'm';
	const vowels = s.match(/[aeiouy]+/g) ?? ['a'];
	const v = vowels[Math.min(vowels.length - 1, Math.floor(frac * vowels.length))];
	if (/^(oo|o|u|ou|ow|w)/.test(v) || v === 'oa' || v === 'oi') return 'o';
	if (/^(ee|ea|ie|i|e|y|ey)/.test(v)) return 'e';
	return 'a';
};

/** Mouth shape at `t` seconds into the line. */
export const visemeAt = (id: string, t: number): Viseme => {
	const w = DATA[id]?.w;
	if (!w || !w.length) return 'a';
	let cur = w[0];
	for (const x of w) {
		if (x[1] <= t) cur = x;
		else break;
	}
	const [word, a, b] = cur;
	if (t > b + 0.08) return 'm';
	return visemeForWord(word, Math.max(0, Math.min(0.999, (t - a) / Math.max(0.05, b - a))));
};
