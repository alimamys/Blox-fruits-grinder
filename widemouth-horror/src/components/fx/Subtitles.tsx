// Burned-in subtitles, timed word by word from the real voice files
// (src/data/generated/speechTiming.json). Short phrases, the word being spoken
// lights up; character lines carry a small speaker tag.
import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {wordsOf} from '../../data/speech';
import {FPS, type Timeline} from '../../data/timeline';
import {FONT} from '../../utils/fonts';

const SPEAKER: Record<string, {name: string; color: string}> = {
	eli: {name: 'ELI', color: '#a9c4ea'},
	widemouth: {name: 'MR. WIDEMOUTH', color: '#ff8a7a'},
	mom: {name: 'MOM', color: '#f0c49a'},
	dad: {name: 'DAD', color: '#c8b89a'},
	leo: {name: 'LEO', color: '#d8d39a'},
};

/** Lines whose words are already shown big on screen. */
const NO_SUBS = new Set<string>([]);

interface Chunk {
	start: number;
	end: number;
	words: Array<{text: string; a: number; b: number}>;
	character: string;
	italic: boolean;
}

const MAX_CHARS = 34;
const MAX_WORDS = 7;

const buildChunks = (tl: Timeline): Chunk[] => {
	const out: Chunk[] = [];
	const lines = tl.lines.filter((l) => !l.overlay && l.exists && !l.line.noSubtitle && !NO_SUBS.has(l.line.id)).sort((a, b) => a.start - b.start);
	for (const l of lines) {
		let words = wordsOf(l.line.id).map(([text, a, b]) => ({text, a: l.start + a, b: l.start + b}));
		if (!words.length) {
			// no timing data: spread the script words over the line
			const toks = l.line.text.split(/\s+/).filter(Boolean);
			const span = (l.end - l.start) / Math.max(1, toks.length);
			words = toks.map((text, i) => ({text, a: l.start + i * span, b: l.start + (i + 1) * span}));
		}
		const italic = ['caller'].includes(l.line.character) || ['whisper', 'whisperClose', 'distant', 'door', 'marineRadio', 'pa', 'paSoft', 'multiSpeaker'].includes(l.line.audioEffect);
		let cur: Chunk['words'] = [];
		const flush = () => {
			if (!cur.length) return;
			out.push({start: cur[0].a - 0.06, end: cur[cur.length - 1].b, words: cur, character: l.line.character, italic});
			cur = [];
		};
		for (const w of words) {
			const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
			if (cur.length && (chars > MAX_CHARS || cur.length >= MAX_WORDS)) flush();
			cur.push(w);
			const t = w.text;
			const abbrev = /^(Mr|Mrs|Ms|Dr|St)\.$/.test(t); // "Mr. Widemouth" stays on one line
			if ((/[.?!:…]$/.test(t) && !abbrev) || t === '—' || (/,$/.test(t) && chars > 18)) flush();
		}
		flush();
	}
	// each chunk stays until the next one starts (max 0.6 s after its last word)
	for (let i = 0; i < out.length; i++) {
		const next = out[i + 1];
		const hold = out[i].end + 0.6;
		out[i].end = next ? Math.min(hold, next.start) : hold;
	}
	return out;
};

export const Subtitles: React.FC<{timeline: Timeline; until?: number}> = ({timeline, until}) => {
	const f = useCurrentFrame();
	const chunks = useMemo(() => buildChunks(timeline), [timeline]);
	if (until !== undefined && f >= until) return null;
	const t = f / FPS;
	// binary search for the chunk on screen
	let lo = 0;
	let hi = chunks.length - 1;
	let idx = -1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (chunks[mid].start <= t) {
			idx = mid;
			lo = mid + 1;
		} else hi = mid - 1;
	}
	if (idx < 0) return null;
	const c = chunks[idx];
	if (t >= c.end) return null;
	const age = (t - c.start) * FPS;
	const pop = Math.min(1, age / 3);
	const fade = Math.min(1, (c.end - t) * FPS / 3);
	const sp = SPEAKER[c.character];
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 64,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				pointerEvents: 'none',
				opacity: Math.min(pop, fade),
				transform: `scale(${0.94 + 0.06 * pop})`,
			}}
		>
			{sp ? (
				<div
					style={{
						fontFamily: FONT.ui,
						fontWeight: 800,
						fontSize: 24,
						letterSpacing: 3,
						color: '#0d0d10',
						background: sp.color,
						padding: '3px 14px',
						borderRadius: 6,
						marginBottom: 10,
						boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
					}}
				>
					{sp.name}
				</div>
			) : null}
			<div
				style={{
					maxWidth: 1500,
					textAlign: 'center',
					fontFamily: FONT.ui,
					fontWeight: 800,
					fontSize: 58,
					lineHeight: 1.15,
					fontStyle: c.italic ? 'italic' : 'normal',
					letterSpacing: 0.5,
				}}
			>
				{(() => {
					// exactly one highlighted word: the latest one that has started and not yet ended
					let ai = -1;
					c.words.forEach((w, i) => {
						if (t >= w.a - 0.03) ai = i;
					});
					if (ai >= 0 && t >= c.words[ai].b + 0.02) ai = -1;
					return c.words.map((w, i) => {
					const active = i === ai;
					const said = t >= w.b;
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								margin: '0 11px',
								color: active ? '#ffd84d' : said ? '#ffffff' : 'rgba(255,255,255,0.92)',
								transform: active ? 'scale(1.04)' : 'scale(1)',
								WebkitTextStroke: '10px #000',
								paintOrder: 'stroke fill',
								textShadow: '0 4px 14px rgba(0,0,0,0.85)',
							}}
						>
							{w.text}
						</span>
					);
					});
				})()}
			</div>
		</div>
	);
};
