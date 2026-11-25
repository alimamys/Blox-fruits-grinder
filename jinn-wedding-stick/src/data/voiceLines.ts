// Every spoken line in "The Jinn Wedding" (عرس الجن), in story order.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the
//    TTS engine reads (numbers spelled out, pauses written as "..." etc).
//  - pauseBefore / pauseAfter are deliberately NOT uniform. Normal sentences get
//    0.2-0.45 s, reveals 0.7-1.3 s; the big suspense holds are timeline beats.
//  - fearLevel: 1 confusion, 2 unease, 3 controlled fear, 4 panic, 5 terror.
//  - Yadda (the grandmother) tells the legend in the majlis; the girl, grown up, says only the opening line ('narrator').
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	yadda: 'none',
	girl: 'room',
	noura: 'room',
	mother: 'room',
	drummer: 'room',
	man: 'distant',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'warm',
	yadda: 'serious',
	girl: 'casual',
	noura: 'serious',
	mother: 'unnaturally_calm',
	drummer: 'afraid',
	man: 'serious',
};

type Opts = Partial<Omit<VoiceLine, 'id' | 'character' | 'text' | 'scene' | 'filename'>>;

const line = (scene: string, character: CharacterId, id: string, text: string, o: Opts = {}): VoiceLine => ({
	id,
	character,
	text,
	scene,
	emotion: o.emotion ?? DEFAULT_EMOTION[character],
	intensity: o.intensity ?? 0.4,
	pace: o.pace ?? 1,
	volume: o.volume ?? 1,
	pauseBefore: o.pauseBefore ?? 0,
	pauseAfter: o.pauseAfter ?? 0.35,
	audioEffect: o.audioEffect ?? DEFAULT_EFFECT[character],
	pan: o.pan ?? VOICES[character].post.pan,
	filename: `${VOICES[character].folder}/${id}.wav`,
	fearLevel: o.fearLevel ?? 0,
	breath: o.breath ?? 'none',
	direction: o.direction ?? '',
	spokenText: o.spokenText,
	blendTo: o.blendTo,
	voiceTweak: o.voiceTweak,
	fishTags: o.fishTags,
});

/** A scene's line makers; `d` holds that scene's default options for the narrator. */
const scene = (s: string, d: Opts = {}) => ({
	n: (id: string, text: string, o: Opts = {}) => line(s, 'narrator', id, text, o),
	y: (id: string, text: string, o: Opts = {}) => line(s, 'yadda', id, text, {...d, ...o}),
	g: (id: string, text: string, o: Opts = {}) => line(s, 'girl', id, text, o),
	no: (id: string, text: string, o: Opts = {}) => line(s, 'noura', id, text, o),
	m: (id: string, text: string, o: Opts = {}) => line(s, 'mother', id, text, o),
	dr: (id: string, text: string, o: Opts = {}) => line(s, 'drummer', id, text, o),
	man: (id: string, text: string, o: Opts = {}) => line(s, 'man', id, text, o),
});

// ---------------------------------------------------------------------------
// 1. THE MAJLIS - "once, a long time ago, my grandmother told me a story"
// ---------------------------------------------------------------------------
const c1 = scene('majlis', {emotion: 'warm', intensity: 0.35});
const MAJLIS: VoiceLine[] = [
	c1.n('narrator_001_once', 'Once, a long time ago, when I was a little girl, my grandmother told me a story. I have never forgotten it.', {pace: 0.95, pauseAfter: 0.6, fishTags: '[soft, nostalgic]'}),
	c1.g('girl_001_scary', 'Yadda, tell me a scary one. A true one.', {emotion: 'casual', intensity: 0.5, pauseAfter: 0.4, fishTags: '[excited, playful]'}),
	c1.y('yadda_001_true', "A true one?... Nobody knows if this one is true. But everybody in Kuwait knows it.", {pace: 0.92, pauseAfter: 0.5, fishTags: '[warm, amused, then serious]'}),
	c1.y('yadda_002_sabahiya', 'It happened in Sabahiya, in nineteen ninety-seven. To a singer called Noura.', {pace: 0.9, pauseAfter: 0.8, fishTags: '[low, mysterious]'}),
];

// ---------------------------------------------------------------------------
// 2. THE CALL - the most famous taqaqa in Kuwait; the mother of the bride; five hundred dinars
// ---------------------------------------------------------------------------
const c2 = scene('call', {emotion: 'serious', intensity: 0.35});
const CALL: VoiceLine[] = [
	c2.y('yadda_003_famous', 'In those days, Noura was the most famous taqaqa in Kuwait. A wedding singer. She and her band of women, with their drums and their old songs, were booked months ahead, all over the Gulf.', {spokenText: 'In those days, Noura was the most famous tagaga in Kuwait. A wedding singer. She and her band of women, with their drums and their old songs, were booked months ahead, all over the Gulf.', pauseAfter: 0.45}),
	c2.y('yadda_004_phone', "One quiet evening, the phone rang. A woman's voice. She said she was the mother of the bride.", {pauseAfter: 0.4}),
	c2.m('mother_001_tomorrow', 'We are having a wedding tomorrow night, in Sabahiya. My daughter wants only you.', {audioEffect: 'phone', pauseAfter: 0.4, fishTags: '[warm, very calm, slow]'}),
	c2.no('noura_001_booked', "I'm sorry. We're fully booked.", {emotion: 'professional', intensity: 0.4, pauseAfter: 0.5, fishTags: '[polite, firm]'}),
	c2.m('mother_002_dinars', 'Five hundred dinars.', {audioEffect: 'phone', pace: 0.85, pauseAfter: 0.8, fishTags: '[calm, slow, certain]'}),
	c2.y('yadda_005_fortune', 'Five hundred dinars, in those days, was a fortune. So Noura said yes.', {pauseAfter: 0.5}),
];

// ---------------------------------------------------------------------------
// 3. THE DRIVE - the silent driver; past the last houses of Sabahiya; a house blazing with light
// ---------------------------------------------------------------------------
const c3 = scene('drive', {emotion: 'uneasy', intensity: 0.4, fearLevel: 1});
const DRIVE: VoiceLine[] = [
	c3.y('yadda_006_car', 'The next night, a car came for them. The driver never said one word.', {pauseAfter: 0.45}),
	c3.y('yadda_007_dark', 'They drove past the last houses of Sabahiya, and kept going, into the dark.', {pauseAfter: 0.5}),
	c3.y('yadda_008_house', 'Then, out of nowhere, a house. Huge, and blazing with light.', {pace: 0.92, pauseAfter: 0.5}),
	c3.y('yadda_009_never_seen', 'Noura had sung in every big house in Kuwait. She had never seen this one.', {pace: 0.92, pauseAfter: 0.7}),
];

// ---------------------------------------------------------------------------
// 4. THE HALL - gold; the veiled bride; ice-cold fingers; "do not stop"; clapping like one person
// ---------------------------------------------------------------------------
const c4 = scene('hall', {emotion: 'uneasy', intensity: 0.45, fearLevel: 2});
const HALL: VoiceLine[] = [
	c4.y('yadda_010_gold', 'Inside, the women\'s hall was gold from the floor to the ceiling. Hundreds of guests in shining dresses. So much incense the air was blue. And at the far end, on a stage, the bride, under a heavy veil.', {pauseAfter: 0.45}),
	c4.y('yadda_011_cold', "The mother of the bride took Noura's hand. Her fingers were ice cold.", {pace: 0.92, pauseAfter: 0.5}),
	c4.m('mother_003_play', 'Play. And do not stop until the bride has gone.', {pace: 0.88, pauseAfter: 0.6, fishTags: '[calm, low, a command]'}),
	c4.y('yadda_012_danced', 'So they played. And the guests danced.', {pauseAfter: 0.4}),
	c4.y('yadda_013_one_person', 'Hundreds of hands, clapping on exactly the same beat. Like one person.', {pace: 0.92, pauseAfter: 0.45}),
	c4.y('yadda_014_eyes', 'Nobody touched the food. Nobody spoke. And when the lights flickered, their eyes shone, like a cat\'s eyes in the dark.', {pace: 0.92, pauseAfter: 0.6, fearLevel: 3}),
];

// ---------------------------------------------------------------------------
// 5. THE FEET - "look at their feet"; hooves; the girl in the majlis; keep playing; the sounds
// ---------------------------------------------------------------------------
const c5 = scene('feet', {emotion: 'afraid', intensity: 0.5, fearLevel: 3});
const FEET: VoiceLine[] = [
	c5.y('yadda_015_youngest', 'The youngest girl in the band leaned close to Noura, still drumming.', {pauseAfter: 0.3}),
	c5.dr('drummer_001_feet', 'Noura. Look at their feet.', {pace: 0.9, pauseAfter: 0.7, fishTags: '[whispering, terrified]'}),
	c5.y('yadda_016_hooves', 'Under the long dresses, where their feet should be, there were hooves. Some like a goat. Some like a donkey. Clicking on the marble, in time with the drums.', {pace: 0.92, pauseAfter: 0.6, fearLevel: 4}),
	c5.g('girl_002_run', 'Yadda! Did they run away?', {emotion: 'afraid', intensity: 0.6, pauseAfter: 0.35, fishTags: '[scared, muffled]'}),
	c5.y('yadda_017_where', 'Run? Where to? Nobody knew where that house was.', {pace: 0.92, pauseAfter: 0.6}),
	c5.dr('drummer_002_go', 'We have to go.', {pauseAfter: 0.3, fishTags: '[whispering, panicked]'}),
	c5.no('noura_002_keep', 'Keep playing. Whatever you see, do not stop.', {emotion: 'afraid', intensity: 0.6, pauseAfter: 0.6, fishTags: '[whispering through a smile, steady, afraid]'}),
	c5.y('yadda_018_sounds', 'And under the music, they began to hear other sounds. Something braying behind the walls. Laughing that was not laughing. And voices singing along with Noura\'s songs, in a language none of them knew.', {pace: 0.92, pauseAfter: 0.7, fearLevel: 4}),
];

// ---------------------------------------------------------------------------
// 6. UNTIL DAWN - bleeding hands; the veil never lifted; "Enough. Thank you, Noura."
// ---------------------------------------------------------------------------
const c6 = scene('dawn', {emotion: 'afraid', intensity: 0.45, fearLevel: 3});
const DAWN: VoiceLine[] = [
	c6.y('yadda_019_all_night', 'They played all night. Their hands cracked and bled on the drums. They smiled, and sang, and never looked down.', {pauseAfter: 0.45}),
	c6.y('yadda_020_veil', 'The bride never lifted her veil.', {pace: 0.88, pauseAfter: 0.6}),
	c6.y('yadda_021_silent', 'Just before dawn, the mother of the bride raised her hand, and the hall went silent.', {pauseAfter: 0.6}),
	c6.m('mother_004_enough', 'Enough. Thank you, Noura. You were everything they said.', {pace: 0.9, pauseAfter: 0.6, fishTags: '[warm, calm, satisfied]'}),
	c6.y('yadda_022_paid', 'They were paid, exactly as promised. And they walked out into the grey morning, shaking, without a word.', {pauseAfter: 0.5}),
];

// ---------------------------------------------------------------------------
// 7. THE MAN AT DAWN - "Nobody lives in this house"; the ruin; the hoofprints
// ---------------------------------------------------------------------------
const c7 = scene('outside', {emotion: 'serious', intensity: 0.45, fearLevel: 3});
const OUTSIDE: VoiceLine[] = [
	c7.y('yadda_023_man', 'Outside, a man was standing in the sand, staring at them.', {pauseAfter: 0.4}),
	c7.man('man_001_empty', 'What are you doing here? Nobody lives in this house. It has been empty for years.', {audioEffect: 'none', pauseAfter: 0.7, fishTags: '[puzzled, gruff, worried]'}),
	c7.y('yadda_024_turned', 'Slowly, Noura turned around.', {pace: 0.85, pauseAfter: 0.8}),
	c7.y('yadda_025_ruin', 'The house was a ruin. Broken windows. Sand blowing through the doorway. The walls black from an old fire. No lights. No cars. No music.', {pace: 0.92, pauseAfter: 0.5, fearLevel: 4}),
	c7.y('yadda_026_hoofprints', 'Only their footprints in the sand. And all around them, hundreds of small hoofprints.', {pace: 0.88, pauseAfter: 1.0, fearLevel: 4}),
];

// ---------------------------------------------------------------------------
// 8. THE MAJLIS AGAIN - never sang at a wedding again; the newspaper; "ask whose wedding it is"
// ---------------------------------------------------------------------------
const c8 = scene('ending', {emotion: 'serious', intensity: 0.4, fearLevel: 2});
const ENDING: VoiceLine[] = [
	c8.y('yadda_027_never', 'After that night, Noura never sang at a wedding again. People say she never told anyone why.', {pace: 0.92, pauseAfter: 0.45}),
	c8.y('yadda_028_newspaper', 'A newspaper printed the story, without her name. And since then, it has been told a thousand ways.', {pauseAfter: 0.5}),
	c8.g('girl_003_true', 'Is it true, Yadda?', {emotion: 'uneasy', intensity: 0.5, pauseAfter: 0.5, fishTags: '[quiet, unsure]'}),
	c8.y('yadda_029_nobody', "Nobody ever proved it happened. And nobody ever proved it didn't.", {pace: 0.9, pauseAfter: 0.7}),
	c8.y('yadda_030_listen', 'But listen to me, habibti. If a stranger ever calls you, and offers far too much to sing at a wedding you never heard of...', {pace: 0.9, pauseAfter: 0.5, fishTags: '[low, serious, slow]'}),
	c8.y('yadda_031_whose', 'Ask whose wedding it is.', {pace: 0.82, pauseAfter: 1.0, fishTags: '[whispering]'}),
];

export const VOICE_LINES: VoiceLine[] = [...MAJLIS, ...CALL, ...DRIVE, ...HALL, ...FEET, ...DAWN, ...OUTSIDE, ...ENDING];
export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
