/*
 * Prints every spoken beat as JSON (used by scripts/tts/generate_voices.py).
 *   npx tsx scripts/export-beats.ts > beats.json
 */
import {CHAPTERS} from '../src/data/script';

const out = CHAPTERS.flatMap((ch) =>
	ch.beats
		.filter((b) => b.text && b.speaker !== 'sfx' && b.speaker !== 'silence')
		.map((b) => ({chapter: ch.id, id: b.id, speaker: b.speaker, text: b.text, dur: b.dur})),
);
process.stdout.write(JSON.stringify(out, null, 1));
