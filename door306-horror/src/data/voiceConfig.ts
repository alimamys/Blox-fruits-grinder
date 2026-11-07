// Central voice casting ("Never Open Your Door at 3:06 AM"). ONE place decides what every character sounds like, so a
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
		fish: {referenceId: string; voiceName: string; speed?: number; model?: string};
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

// Sarah narrates her own story, so the narrator and Sarah share ONE Fish voice: the narration
// is a close, dry voice-over; her lines inside the scene are performed live with room acoustics.
// Fish voices are generic public-library voices (no celebrity or film-character clones),
// auditioned with scripts/voice/fish_cast.py (build/fish_cast/*_reel.wav).
const SARAH_FISH = {referenceId: '933563129e564b19a115bedd57b7406a', voiceName: 'Sarah (young, soft, breathy)'};

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
	fish: {referenceId: string; voiceName: string; speed?: number},
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
	narrator: v('narrator', 'Sarah (narration)', 'narrator',
		'Sarah, 28, telling what happened to her. Quiet, close, frightened; conversational, never theatrical. Slides from unease to terror.',
		{...SARAH_FISH, speed: 1.0}, {}, F),
	sarah: v('sarah', 'Sarah', 'sarah',
		'The same woman in the moment: whispering through the door, nervous questions, then panic, screaming and crying.',
		{...SARAH_FISH}, {}, F),
	harris: v('harris', 'Mr. Harris', 'harris',
		'An elderly man of about 76, kind, frightened, guilty. Almost always whispering; shaky, breaking into tears.',
		{referenceId: 'd5b3a0954fba413b924daa64cf19fcf4', voiceName: 'FINN (old, warm)'}, {tremor: 0.35, pan: 0.05, lufs: -20}, M),
	creature: v('creature', 'The creature', 'creature',
		'One line. A deep, broken, wet voice that should not be able to speak.',
		{referenceId: '9ef1568dbcb041969b70f17a83a2d9a9', voiceName: 'demon-monster (deep, raspy)'}, {pitchSemitones: -3.5, lufs: -19}, M),
	landlord: v('landlord', 'The landlord', 'landlord',
		'About 55, warm, friendly, a salesman\'s ease; the friendliness is a little too smooth.',
		{referenceId: '536d3a5e000945adb7038665781a4aca', voiceName: 'Ethan (middle-aged, clear)'}, {pan: 0, lufs: -19}, M),
	caller: v('caller', 'Young woman (phone)', 'caller',
		'A cheerful young woman calling about the flat, heard through the landlord\'s phone.',
		{referenceId: 'b545c585f631496c914815291da4e893', voiceName: 'Friendly Women (young, bright)'}, {pan: 0.1, lufs: -21}, F),
	womanBelow: v('womanBelow', 'A woman downstairs', 'below',
		'A mother downstairs, crying and begging, heard through the floor.',
		{referenceId: 'f6a19fe5ab494e1fa51bb1476d583a44', voiceName: 'Abby (US, warm)'}, {pan: -0.2, lufs: -21}, F),
	manBelow: v('manBelow', 'A man downstairs', 'below',
		'A man downstairs whispering frantically, heard through the floor.',
		{referenceId: '0327fdb5da9e4fd782899a8058c8ae2b', voiceName: 'Narrator (male, young)'}, {pan: 0.2, lufs: -21}, M),
	manThird: v('manThird', 'A man on the third floor', 'below',
		'A father on the third floor begging for his life, heard from the stairwell below.',
		{referenceId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', voiceName: 'Sleepless historian (middle-aged)'}, {pan: -0.1, lufs: -21}, M),
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
