// Central voice casting ("11 of Us Went Camping. 12 Came Back."). ONE place decides what every character sounds like, so a
// voice never drifts between lines. scripts/voice/generate_voices.py reads this file
// (via scripts/export-voice-data.mjs) - change a voice here, then regenerate that
// character only:   npm run generate-voices -- --character harris
import type {CharacterId} from './types';

export type ProviderName = 'kokoro' | 'chatterbox' | 'fish' | 'elevenlabs' | 'openai' | 'azure' | 'polly';

/** Which provider `npm run generate-voices` uses unless --provider is passed. */
export const DEFAULT_PROVIDER: ProviderName = 'fish';

export interface KokoroVoice {
	/** A single Kokoro voice id, or a weighted blend of several (weights are normalised). */
	blend: Array<[string, number]>;
	lang: 'en-us' | 'en-gb';
}

export interface CharacterVoice {
	character: CharacterId;
	displayName: string;
	/** Sub-folder of public/audio the character's lines are written to. */
	folder: string;
	description: string;
	/** Base speaking speed (1 = provider default). Per-line `pace` multiplies this. */
	baseSpeed: number;
	/** Post-processing applied to every line of this character. */
	post: {
		/** Pitch shift in semitones. Kept tiny on purpose - no "demon" pitching. */
		pitchSemitones: number;
		/** Subtle age tremor (vibrato depth 0..1, 0 = off). */
		tremor: number;
		/** Default stereo position. */
		pan: number;
		/** Target loudness for the normalised take (LUFS, before mix gain). */
		lufs: number;
	};
	providers: {
		kokoro: KokoroVoice;
		/** ElevenLabs: a voice NAME from your account's voice list (premade voices work on every
		 *  account), or paste a voiceId from the Voice Library to override it. */
		/** Chatterbox (free, open-source, runs locally): clones the timbre of a short reference
		 *  clip and performs the line with emotion "exaggeration". Replace the reference WAV with
		 *  a real recording (10-20 s, clean, one speaker) to change the voice. */
		chatterbox: {reference: string; exaggeration: number; model?: 'standard' | 'turbo'};
		/** Fish Audio (https://fish.audio): a public library voice id (cast with
		 *  scripts/voice/fish_cast.py). `speed` multiplies the line pace. Key: FISH_API_KEY. */
		fish: {referenceId: string; voiceName: string; speed?: number; model?: string; temperature?: number; topP?: number};
		elevenlabs: {voiceName: string; voiceId?: string; model: string};
		openai: {voice: string; model: string};
		azure: {voice: string};
		polly: {voice: string; engine: 'neural' | 'generative' | 'standard'};
	};
}

// eleven_v3 understands inline audio tags ([whispers], [sighs], [crying]...), which is what
// fixes flat delivery. If your plan/API key cannot use v3 the generator falls back to
// eleven_multilingual_v2 automatically.
const ELEVEN_MODEL = 'eleven_v3';
const OPENAI_MODEL = 'gpt-4o-mini-tts';

// Marcus tells the story twelve years later (narrator, a close, dry voice-over); Marcus at 16 is a
// younger voice inside the scenes. The thing at the door speaks with WYATT's voice (same Fish
// reference), broken up by the 'thing' post effect. Fish voices are generic public-library voices
// (no celebrity or film-character clones), auditioned with scripts/voice/fish_cast.py
// (build/fish_cast/*_reel.wav) and chosen in CAST below.
// Every voice uses Fish's Drama 3 model (the expressive acting model of "Never Open Your Door at 3:06
// AM"); the narrator also samples a little wider (temperature / top_p 0.9) so his read never goes flat.
// The narrator was re-cast after the first-minute review ("monotone"): 22 auditions across Drama 3 and
// s2.1-pro, measured by how much the pitch moves (build/narrator_audition, previews/voice_audition).
const DRAMA = 'drama-3';
const CAST = {
	narrator: {referenceId: '0327fdb5da9e4fd782899a8058c8ae2b', voiceName: 'Narrator (young male)', model: DRAMA, temperature: 0.9, topP: 0.9},
	marcus: {referenceId: 'b841aacef7dc48f9b18b6e89bf573e80', voiceName: 'Young teenager (boy, deep)', model: DRAMA},
	wyatt: {referenceId: '4fbed27c40e3465f98bc777fd0cc35ff', voiceName: 'boy (young)', model: DRAMA},
	ray: {referenceId: 'd9ce1833c191476db346efb50aa20722', voiceName: 'boy (young, relaxed)', model: DRAMA},
	nia: {referenceId: 'ffd05ab81f184e10b6767e52342dd244', voiceName: 'black girl talking', model: DRAMA},
	dawes: {referenceId: 'fee420f4813d4318bfea84f8f6cac53f', voiceName: 'redneck (old, Southern)', model: DRAMA},
	cole: {referenceId: '061d766c12fb468ba644fda015e237fc', voiceName: 'HillBilly (Southern)', model: DRAMA},
};

/** Shared fallbacks for the providers this film does not use (Fish is the cast). */
const fallback = (kokoro: string, lang: 'en-us' | 'en-gb', openai: string, azure: string, polly: string, eleven: string) => ({
	kokoro: {blend: [[kokoro, 1]] as Array<[string, number]>, lang},
	chatterbox: {reference: 'voice-references/narrator.wav', exaggeration: 0.5},
	elevenlabs: {voiceName: eleven, model: ELEVEN_MODEL},
	openai: {voice: openai, model: OPENAI_MODEL},
	azure: {voice: azure},
	polly: {voice: polly, engine: 'generative' as const},
});

const v = (
	character: CharacterId,
	displayName: string,
	folder: string,
	description: string,
	fish: {referenceId: string; voiceName: string; speed?: number; model?: string; temperature?: number; topP?: number},
	post: Partial<CharacterVoice['post']>,
	fb: ReturnType<typeof fallback>,
): CharacterVoice => ({
	character,
	displayName,
	folder,
	description,
	baseSpeed: 1.0,
	post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19, ...post},
	providers: {...fb, fish},
});

const F = fallback('af_heart', 'en-us', 'coral', 'en-US-JennyNeural', 'Danielle', 'Sarah');
const M = fallback('am_michael', 'en-us', 'ash', 'en-US-GuyNeural', 'Matthew', 'Bill');

export const VOICES: Record<CharacterId, CharacterVoice> = {
	narrator: v('narrator', 'Marcus (narration, 28)', 'narrator',
		'Marcus at 28, telling it twelve years later. Low, close, dry; conversational, never theatrical. A man who still counts people.',
		{...CAST.narrator, speed: 1.0}, {}, M),
	marcus: v('marcus', 'Marcus (16)', 'marcus',
		'Marcus at 16 in the moment: a city kid, confused, then shouting.',
		{...CAST.marcus}, {pan: 0}, M),
	wyatt: v('wyatt', 'Wyatt', 'wyatt',
		'Wyatt, 16, a skinny Southern country boy: out of breath, terrified, whispering.',
		{...CAST.wyatt}, {pan: 0.05}, M),
	ray: v('ray', 'Ray', 'ray',
		'Ray, 15, the little cousin: whispering the legend, then annoyed about the hot dogs.',
		{...CAST.ray}, {pan: -0.08}, M),
	nia: v('nia', 'Nia', 'nia',
		'Nia, 16: one hysterical scream of a line.',
		{...CAST.nia}, {pan: 0.1}, F),
	dawes: v('dawes', 'Mr. Dawes', 'dawes',
		'Wyatt\'s father, about 50, Southern farmer: calm, serious, unhurried warning.',
		{...CAST.dawes}, {pan: 0.1, lufs: -20}, M),
	cole: v('cole', 'Cole', 'cole',
		'Wyatt\'s cousin, 19, Southern: easygoing and confused, then shouting at the treeline.',
		{...CAST.cole}, {pan: -0.05}, M),
	thing: v('thing', 'The voice at the door', 'thing',
		'Wyatt\'s own words in Wyatt\'s voice, with every human rhythm taken out (post effect "thing").',
		{...CAST.wyatt}, {lufs: -20}, M),
};

/** Distinct background voices for crowd fragments (Kokoro ids). Assigned round-robin per line. */
export const CROWD_VOICE_POOL: Array<{voice: string; lang: 'en-us' | 'en-gb'}> = [
	{voice: 'af_river', lang: 'en-us'},
	{voice: 'am_eric', lang: 'en-us'},
	{voice: 'bf_lily', lang: 'en-gb'},
	{voice: 'am_liam', lang: 'en-us'},
	{voice: 'af_jessica', lang: 'en-us'},
	{voice: 'bm_lewis', lang: 'en-gb'},
	{voice: 'af_nova', lang: 'en-us'},
	{voice: 'am_echo', lang: 'en-us'},
	{voice: 'bf_alice', lang: 'en-gb'},
	{voice: 'bm_daniel', lang: 'en-gb'},
	{voice: 'af_sky', lang: 'en-us'},
	{voice: 'af_alloy', lang: 'en-us'},
];

/** ElevenLabs premade voices rotated across the background passenger fragments. */
export const ELEVEN_CROWD_POOL = ['Jessica', 'Will', 'River', 'Charlie', 'Matilda', 'Callum', 'Aria', 'Charlotte', 'Bill', 'Laura', 'Liam', 'Sarah'];

/**
 * How emotion tags are realised per provider. Kokoro has no emotion control, so the
 * generator realises them through pace, punctuation, gain and the post chain; the
 * expressive providers get the instruction text / style directly.
 */
export const EMOTION_DIRECTIONS: Record<string, string> = {
	neutral: 'Natural and even.',
	warm: 'Warm, kind, unhurried.',
	serious: 'Serious, grounded, quietly attentive.',
	tired: 'Tired, late at night, low energy, relaxed.',
	sleepy: 'Half asleep, soft and mumbly, affectionate.',
	affectionate: 'Affectionate and gentle.',
	casual: 'Casual and relaxed, conversational.',
	amused: 'Lightly amused, a small laugh in the voice.',
	confused: 'Genuinely confused, not theatrical.',
	uneasy: 'Uneasy, slightly slower, holding something back.',
	afraid: 'Afraid; breath is tighter, voice a little thinner.',
	panicked: 'Panicked, fast, breathless, voice breaking.',
	grieving: 'Grief and frustration; the voice cracks.',
	whispering: 'Whispered, close, intimate.',
	authoritative: 'Calm authority, experienced, practical.',
	professional: 'Professional and procedural.',
	unnaturally_calm: 'Unnaturally calm and gentle; no urgency at all, as if this is ordinary.',
	matter_of_fact: 'Matter-of-fact, mild, like stating the weather.',
	comforting: 'Genuinely comforting, loving, like soothing a child.',
	distressed: 'Distressed, pleading, close to tears.',
	breathless: 'Breathless and shaky.',
	angry: 'Angry and frightened at the same time.',
	protective: 'Protective, urgent, holding on.',
	hypnotized: 'Distant and dreamy, almost hypnotised, very quiet.',
	screaming: 'A real scream, raw and desperate.',
	terrified: 'Terrified, trembling, fighting to keep the voice down.',
	shaking: 'Voice shaking, close to tears, barely holding together.',
};
