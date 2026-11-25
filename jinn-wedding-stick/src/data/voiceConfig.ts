// Central voice casting (Frame 240). ONE place decides what every character sounds like, so a
// voice never drifts between lines. scripts/voice/generate_voices.py reads this file
// (via scripts/export-voice-data.mjs) - change a voice here, then regenerate that
// character only:   npm run generate-voices -- --character hana
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

// Yadda (the grandmother) tells the legend in the majlis; the girl, grown up, opens it ('narrator'). Everyone speaks
// English with a Gulf accent: generic Fish public-library Arabic/Khaleeji voices reading English (no celebrity or
// character clones), auditioned with scripts/voice/fish_cast.py.
const FB = {
	f: {kokoro: {blend: [['af_heart', 1]] as Array<[string, number]>, lang: 'en-us' as const}, chatterbox: {reference: 'voice-references/narrator.wav', exaggeration: 0.5}, elevenlabs: {voiceName: 'Sarah', model: ELEVEN_MODEL}, openai: {voice: 'coral', model: OPENAI_MODEL}, azure: {voice: 'en-US-JennyNeural'}, polly: {voice: 'Danielle', engine: 'generative' as const}},
	m: {kokoro: {blend: [['am_michael', 1]] as Array<[string, number]>, lang: 'en-us' as const}, chatterbox: {reference: 'voice-references/narrator.wav', exaggeration: 0.5}, elevenlabs: {voiceName: 'Bill', model: ELEVEN_MODEL}, openai: {voice: 'ash', model: OPENAI_MODEL}, azure: {voice: 'en-US-GuyNeural'}, polly: {voice: 'Matthew', engine: 'generative' as const}},
};
const v = (character: CharacterId, displayName: string, description: string, fish: CharacterVoice['providers']['fish'], post: Partial<CharacterVoice['post']>, fb: 'f' | 'm'): CharacterVoice => ({
	character,
	displayName,
	folder: character,
	description,
	baseSpeed: 1.0,
	post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19, ...post},
	providers: {...FB[fb], fish},
});

export const VOICES: Record<CharacterId, CharacterVoice> = {
	narrator: v('narrator', 'The girl, grown up', 'The girl as a young woman, remembering: soft, warm, nostalgic, Gulf accent.',
		{referenceId: '0d5a7ad85f8e4dc19935b734ddbdd22a', voiceName: 'V Khaleeji (female, warm narration)'}, {}, 'f'),
	yadda: v('yadda', 'Yadda (grandmother)', 'The grandmother in the majlis telling the legend: old, warm, low, a born storyteller; Gulf accent.',
		{referenceId: '98d1974a78da46f9bad528667241cb70', voiceName: 'Old woman (deep, Arabic)', speed: 0.95}, {tremor: 0.12, lufs: -19}, 'f'),
	girl: v('girl', 'The girl (7)', 'The little girl in the majlis: curious, then scared; Gulf accent.',
		{referenceId: '60ddaa0fb7b74bd78928135b0ff7819d', voiceName: 'Cheerful Arab little girl'}, {pan: 0.08}, 'f'),
	noura: v('noura', 'Noura (the taqaqa)', 'Noura, a famous wedding singer in her forties: confident and polite, then holding her fear in.',
		{referenceId: '779cda8570924a0aa7b965840c097ab1', voiceName: 'Gulf woman (serious, confident)'}, {pan: -0.05}, 'f'),
	mother: v('mother', 'The mother of the bride', 'The mother of the bride: warm, unhurried, far too calm.',
		{referenceId: 'f85aca8cd5334a87aadef3aa7315635d', voiceName: 'Firm woman (middle-aged, Arabic)', speed: 0.92}, {lufs: -20}, 'f'),
	drummer: v('drummer', 'The youngest drummer', 'The youngest girl in the band, about nineteen: whispering, terrified.',
		{referenceId: '7255e8e666ef4fc7a2a327215bdb96fc', voiceName: 'Girl (Khaleeji, soft, breathy)'}, {pan: 0.1}, 'f'),
	man: v('man', 'The man at dawn', 'An older man standing in the sand at dawn: puzzled, gruff, worried.',
		{referenceId: 'c961db045a4e454cae0bad518350677c', voiceName: 'Old Arab man (warm, low)'}, {lufs: -20}, 'm'),
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
