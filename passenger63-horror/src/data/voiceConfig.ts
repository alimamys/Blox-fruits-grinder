// Central voice casting. ONE place decides what every character sounds like, so a
// voice never drifts between lines. scripts/voice/generate_voices.py reads this file
// (via scripts/export-voice-data.mjs) - change a voice here, then regenerate that
// character only:   npm run generate-voices -- --character oldWoman
import type {CharacterId} from './types';

export type ProviderName = 'kokoro' | 'elevenlabs' | 'openai' | 'azure' | 'polly';

/** Which provider `npm run generate-voices` uses unless --provider is passed. */
export const DEFAULT_PROVIDER: ProviderName = 'kokoro';

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

export const VOICES: Record<CharacterId, CharacterVoice> = {
	narrator: {
		character: 'narrator',
		displayName: 'Narrator',
		folder: 'narrator',
		description:
			'Adult male documentary storyteller. Warm but serious, close-mic, controlled, neutral international English. Never theatrical.',
		baseSpeed: 1.0,
		post: {pitchSemitones: -0.4, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['am_michael', 0.8], ['bm_george', 0.2]], lang: 'en-us'},
			elevenlabs: {voiceName: 'George', model: ELEVEN_MODEL},
			openai: {voice: 'onyx', model: OPENAI_MODEL},
			azure: {voice: 'en-GB-RyanNeural'},
			polly: {voice: 'Matthew', engine: 'generative'},
		},
	},
	daniel: {
		character: 'daniel',
		displayName: 'Daniel Clarke',
		folder: 'daniel',
		description: 'Male, early 30s. Grounded, tired, normal - slides from disbelief into fear and a hypnotised grief.',
		baseSpeed: 1.0,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['am_puck', 1]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Chris', model: ELEVEN_MODEL},
			openai: {voice: 'ash', model: OPENAI_MODEL},
			azure: {voice: 'en-US-GuyNeural'},
			polly: {voice: 'Stephen', engine: 'generative'},
		},
	},
	emma: {
		character: 'emma',
		displayName: 'Emma Clarke',
		folder: 'emma',
		description: 'Female, about 30. Natural, grounded, emotionally strong; sleepy and affectionate at first, then protective, angry, terrified, grieving.',
		baseSpeed: 1.0,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['af_heart', 1]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Sarah', model: ELEVEN_MODEL},
			openai: {voice: 'coral', model: OPENAI_MODEL},
			azure: {voice: 'en-US-JennyNeural'},
			polly: {voice: 'Danielle', engine: 'generative'},
		},
	},
	oldWoman: {
		character: 'oldWoman',
		displayName: 'The Old Woman',
		folder: 'old-woman',
		description:
			"Elderly woman. Soft, warm, patient, slightly breathy, slow, affectionate, no urgency. Sounds like someone's grandmother. NOT a monster, witch or demon.",
		baseSpeed: 0.86,
		post: {pitchSemitones: -1.0, tremor: 0.35, pan: 0.22, lufs: -20},
		providers: {
			kokoro: {blend: [['bf_emma', 0.6], ['af_nicole', 0.4]], lang: 'en-gb'},
			elevenlabs: {voiceName: 'Lily', model: ELEVEN_MODEL},
			openai: {voice: 'sage', model: OPENAI_MODEL},
			azure: {voice: 'en-GB-AbbiNeural'},
			polly: {voice: 'Amy', engine: 'generative'},
		},
	},
	captain: {
		character: 'captain',
		displayName: 'Captain',
		folder: 'captain',
		description: 'Male, 50s-60s. Authoritative, practical, calm under pressure, professional marine-radio cadence. Never screams.',
		baseSpeed: 0.95,
		post: {pitchSemitones: -0.6, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['bm_george', 1]], lang: 'en-gb'},
			elevenlabs: {voiceName: 'Daniel', model: ELEVEN_MODEL},
			openai: {voice: 'ballad', model: OPENAI_MODEL},
			azure: {voice: 'en-GB-ThomasNeural'},
			polly: {voice: 'Brian', engine: 'neural'},
		},
	},
	crew1: {
		character: 'crew1',
		displayName: 'Deckhand (crew 1)',
		folder: 'crew',
		description: 'Young adult male crew member. Professional customer-service voice, slightly tired, increasingly uncomfortable.',
		baseSpeed: 1.0,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['am_fenrir', 1]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Liam', model: ELEVEN_MODEL},
			openai: {voice: 'echo', model: OPENAI_MODEL},
			azure: {voice: 'en-US-DavisNeural'},
			polly: {voice: 'Gregory', engine: 'neural'},
		},
	},
	crew2: {
		character: 'crew2',
		displayName: 'Steward (crew 2)',
		folder: 'crew',
		description: 'Female crew member, counting heads under her breath.',
		baseSpeed: 1.0,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -21},
		providers: {
			kokoro: {blend: [['af_sarah', 1]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Laura', model: ELEVEN_MODEL},
			openai: {voice: 'shimmer', model: OPENAI_MODEL},
			azure: {voice: 'en-US-SaraNeural'},
			polly: {voice: 'Kimberly', engine: 'neural'},
		},
	},
	harbor: {
		character: 'harbor',
		displayName: 'Port Mason Harbor Control',
		folder: 'harbor',
		description: 'Calm, professional VTS radio operator. Realistic, slightly compressed, genuinely confused - NOT creepy.',
		baseSpeed: 1.02,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['am_onyx', 0.7], ['am_eric', 0.3]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Eric', model: ELEVEN_MODEL},
			openai: {voice: 'verse', model: OPENAI_MODEL},
			azure: {voice: 'en-US-TonyNeural'},
			polly: {voice: 'Joey', engine: 'neural'},
		},
	},
	pa: {
		character: 'pa',
		displayName: 'PA / Intercom',
		folder: 'pa',
		description:
			'Female ferry announcement voice. Starts as a normal recorded announcement; each line blends further toward the old woman until the PA filter is almost gone.',
		baseSpeed: 0.95,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['bf_isabella', 1]], lang: 'en-gb'},
			elevenlabs: {voiceName: 'Alice', model: ELEVEN_MODEL},
			openai: {voice: 'nova', model: OPENAI_MODEL},
			azure: {voice: 'en-GB-SoniaNeural'},
			polly: {voice: 'Emma', engine: 'neural'},
		},
	},
	police: {
		character: 'police',
		displayName: 'Police officer',
		folder: 'police',
		description: 'Male officer, tired and uncomfortable, trying to be kind.',
		baseSpeed: 0.97,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -19},
		providers: {
			kokoro: {blend: [['bm_fable', 1]], lang: 'en-gb'},
			elevenlabs: {voiceName: 'Roger', model: ELEVEN_MODEL},
			openai: {voice: 'fable', model: OPENAI_MODEL},
			azure: {voice: 'en-GB-AlfieNeural'},
			polly: {voice: 'Arthur', engine: 'neural'},
		},
	},
	crowd: {
		character: 'crowd',
		displayName: 'Passengers (crowd fragments)',
		folder: 'crowd',
		description: 'Background passengers. Each fragment uses a different voice from CROWD_VOICE_POOL, kept quiet and roomy.',
		baseSpeed: 1.05,
		post: {pitchSemitones: 0, tremor: 0, pan: 0, lufs: -24},
		providers: {
			kokoro: {blend: [['af_river', 1]], lang: 'en-us'},
			elevenlabs: {voiceName: 'Jessica', model: ELEVEN_MODEL},
			openai: {voice: 'alloy', model: OPENAI_MODEL},
			azure: {voice: 'en-US-AriaNeural'},
			polly: {voice: 'Ivy', engine: 'neural'},
		},
	},
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
	screaming: 'A real scream of the name, raw and desperate.',
};
