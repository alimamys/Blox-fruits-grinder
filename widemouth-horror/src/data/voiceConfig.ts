// Central voice casting ("Mr. Widemouth"). ONE place decides what every character sounds like, so a
// voice never drifts between lines. scripts/voice/generate_voices.py reads this file
// (via scripts/export-voice-data.mjs) - change a voice here, then regenerate that
// character only:   npm run generate-voices -- --character eli
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

// Eli tells the story twenty-five years later (narrator: the channel's voice from the last film); Eli at
// five and his son Leo are child voices inside the scenes. Mr. Widemouth is a high, playful, sing-song
// voice (the most pitch movement of the four creature auditions, 5 semitones), flattened by the
// 'thing' post effect only on his last lines. Fish voices are generic public-library voices (no
// celebrity or film-character clones), auditioned with scripts/voice/fish_cast.py
// (build/fish_cast/*_reel.wav) and chosen in CAST below. Mom is Selene: the only audition that read
// her line word for word, at a natural adult pitch.
// Every voice uses Fish's Drama 3 model; the narrator also samples a little wider (temperature /
// top_p 0.9) so his read never goes flat.
const DRAMA = 'drama-3';
const CAST = {
	// the channel's narrator (chosen after 22 auditions on the last film)
	narrator: {referenceId: '0327fdb5da9e4fd782899a8058c8ae2b', voiceName: 'Narrator (young male)', model: DRAMA, temperature: 0.9, topP: 0.9},
	eli: {referenceId: '829184c635314c9485e48690116ff8ad', voiceName: 'Child voice boy', model: DRAMA},
	widemouth: {referenceId: 'a53517d5d4dc43248e4436b599a34c26', voiceName: 'Gremlin (high, playful)', model: DRAMA},
	mom: {referenceId: 'b347db033a6549378b48d00acb0d06cd', voiceName: 'Selene (soft, calm)', model: DRAMA},
	dad: {referenceId: '536d3a5e000945adb7038665781a4aca', voiceName: 'Ethan (middle-aged, clear)', model: DRAMA},
	leo: {referenceId: '4fcb3a423c61415fb35604eba567d95f', voiceName: 'Energetic Child', model: DRAMA},
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
	narrator: v('narrator', 'Eli (narration, 30)', 'narrator',
		'Eli at 30, telling what happened when he was five. Close, quiet, haunted; wistful in the memories, whispered at the scares.',
		{...CAST.narrator, speed: 1.0}, {}, M),
	eli: v('eli', 'Eli (5)', 'eli', 'Eli at five: small, sick, curious, then frightened.', {...CAST.eli}, {pan: -0.05}, M),
	widemouth: v('widemouth', 'Mr. Widemouth', 'widemouth',
		'A small creature: sweet, sing-song and coaxing, going flat and cold when refused.', {...CAST.widemouth}, {pan: 0.08}, M),
	mom: v('mom', 'Mom', 'mom', 'Eli\'s mother: gentle, tired, kind.', {...CAST.mom}, {pan: 0.05, lufs: -20}, F),
	dad: v('dad', 'Dad', 'dad', 'Eli\'s father: tired and warm at four in the morning.', {...CAST.dad}, {pan: -0.05, lufs: -20}, M),
	leo: v('leo', 'Leo (5)', 'leo', 'Eli\'s son today: happy, chatty, then a delighted whisper.', {...CAST.leo}, {pan: 0.05}, M),
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
