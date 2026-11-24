// Every spoken line in "The Rake" (It Visits Three Times), in story order.
//
// Conventions
//  - `id` === filename stem. Files live in public/audio/<character folder>/<id>.wav
//  - `text` is the script (what the subtitles show); `spokenText` (optional) is what the
//    TTS engine reads (numbers spelled out, pauses written as "..." etc).
//  - pauseBefore / pauseAfter are deliberately NOT uniform. Normal sentences get
//    0.2-0.45 s, reveals 0.7-1.3 s; the big suspense holds are timeline beats.
//  - fearLevel: 1 confusion, 2 unease, 3 controlled fear, 4 panic, 5 terror.
//  - Lily tells her own story at 34 ('narrator', no subtitle tag); everyone else is tagged in the subtitles.
import type {CharacterId, VoiceLine} from './types';
import {VOICES} from './voiceConfig';

const DEFAULT_EFFECT: Record<CharacterId, VoiceLine['audioEffect']> = {
	narrator: 'none',
	lily: 'room',
	dad: 'room',
	grandma: 'none',
	rake: 'door',
	son: 'room',
};

const DEFAULT_EMOTION: Record<CharacterId, VoiceLine['emotion']> = {
	narrator: 'serious',
	lily: 'uneasy',
	dad: 'warm',
	grandma: 'uneasy',
	rake: 'whispering',
	son: 'casual',
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
	n: (id: string, text: string, o: Opts = {}) => line(s, 'narrator', id, text, {...d, ...o}),
	l: (id: string, text: string, o: Opts = {}) => line(s, 'lily', id, text, o),
	d: (id: string, text: string, o: Opts = {}) => line(s, 'dad', id, text, o),
	g: (id: string, text: string, o: Opts = {}) => line(s, 'grandma', id, text, o),
	r: (id: string, text: string, o: Opts = {}) => line(s, 'rake', id, text, o),
	s: (id: string, text: string, o: Opts = {}) => line(s, 'son', id, text, o),
});

// ---------------------------------------------------------------------------
// 1. THE FIRST NIGHT
// ---------------------------------------------------------------------------
const c1 = scene('firstNight', {emotion: 'uneasy', intensity: 0.35, fearLevel: 2});
const FIRST_NIGHT: VoiceLine[] = [
	c1.n('narrator_001_woke_up', 'When I was nine, I woke up at four in the morning, and something was sitting on my bed.', {pace: 0.95, pauseAfter: 0.6, direction: 'Quiet, close, a confession. Let "on my bed" land.'}),
	c1.n('narrator_002_not_the_end', 'Not at the end of it, where a dog would sleep. It was halfway up the blanket, crouched over my knees.', {pauseAfter: 0.5}),
	c1.n('narrator_003_thin_man', 'It was shaped like a man. A very thin man. No hair. No clothes. Skin the colour of candle wax.', {spokenText: 'It was shaped like a man. A very thin man. No hair. No clothes. Skin the color of candle wax.', pace: 0.95, pauseAfter: 0.45}),
	c1.n('narrator_004_claws', 'Its hands were spread on the blanket, and the fingers were far too long. Each one ended in a curved yellow claw, like the teeth of a rake.', {pauseAfter: 0.5}),
	c1.n('narrator_005_looking', 'And it was looking at me.', {pace: 0.9, pauseAfter: 0.8, fishTags: '[whispering]'}),
	c1.n('narrator_006_watched', "It didn't blink. It didn't breathe. It just watched.", {pace: 0.95, pauseAfter: 0.55}),
	c1.n('narrator_007_counted', 'I pulled the covers over my face and counted to ten.', {pauseAfter: 0.4}),
	c1.n('narrator_008_gone', 'When I looked again, it was gone.', {pace: 0.95, pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// 2. GRANDMA'S HOUSE - breakfast
// ---------------------------------------------------------------------------
const c2 = scene('breakfast', {emotion: 'serious', intensity: 0.3, fearLevel: 1});
const BREAKFAST: VoiceLine[] = [
	c2.n('narrator_009_moved', "That summer, we had moved into my grandmother's old house. She'd died in the spring, and my dad couldn't bear to sell it.", {emotion: 'warm', pauseAfter: 0.4}),
	c2.n('narrator_010_his_room', 'I got the little bedroom at the end of the hall. The room that used to be his.', {pauseAfter: 0.45}),
	c2.n('narrator_011_told_him', 'At breakfast, I told him.', {pauseAfter: 0.3}),
	c2.l('lily_001_man_on_bed', 'Dad, there was a man on my bed last night. A skinny man with really long fingers.', {emotion: 'uneasy', intensity: 0.5, pauseAfter: 0.35, fishTags: '[serious, a little scared]'}),
	c2.d('dad_001_nightmare', "That's a nightmare, bug. New house, new noises. Everybody gets them.", {emotion: 'warm', intensity: 0.5, pauseAfter: 0.35, fishTags: '[warm, gently amused]'}),
	c2.l('lily_002_four', 'It was four o\'clock. I looked at the clock.', {emotion: 'serious', intensity: 0.5, pauseAfter: 0.7}),
	c2.n('narrator_012_stopped', 'My dad stopped buttering his toast.', {pace: 0.92, pauseAfter: 0.55}),
	c2.n('narrator_013_smiled', 'Just for a second. Then he smiled, kissed the top of my head, and told me to stop reading scary books before bed.', {pauseAfter: 0.4}),
	c2.n('narrator_014_didnt', "I didn't read scary books.", {pace: 0.95, pauseAfter: 0.6}),
];

// ---------------------------------------------------------------------------
// 3. THE DIARY - the attic
// ---------------------------------------------------------------------------
const c3 = scene('diary', {emotion: 'serious', intensity: 0.35, fearLevel: 2});
const DIARY: VoiceLine[] = [
	c3.n('narrator_015_attic', 'That weekend, Dad sent me up to the attic to find the box fan.', {pauseAfter: 0.35}),
	c3.n('narrator_016_notebook', "Behind the boxes there was a little blue notebook with a broken lock. My grandmother's handwriting. Nineteen eighty-four.", {pauseAfter: 0.45}),
	c3.n('narrator_017_changed', 'Most of it was boring. Church. Groceries. The weather. And then, near the end, the handwriting changed.', {pauseAfter: 0.5}),
	c3.g('grandma_001_june', 'June eleventh. Something came into the house last night.', {emotion: 'uneasy', intensity: 0.5, pace: 0.92, pauseAfter: 0.4, fishTags: '[quiet, frightened, reading aloud]'}),
	c3.g('grandma_002_danny', "It sat on Danny's bed and watched him sleep.", {emotion: 'afraid', intensity: 0.5, pace: 0.92, pauseAfter: 0.45}),
	c3.g('grandma_003_mother', 'My mother told me about it when I was a girl. I thought it was a story to keep children in bed.', {pauseAfter: 0.45}),
	c3.g('grandma_004_rule', 'The first time, it only watches. The second time, it comes closer. The third time... it says your name.', {emotion: 'afraid', intensity: 0.6, pace: 0.9, pauseAfter: 0.6, fishTags: '[slow, frightened]'}),
	c3.g('grandma_005_our_room', 'Danny sleeps in our room now. I will not let it come back.', {emotion: 'protective', intensity: 0.6, pauseAfter: 0.6}),
	c3.n('narrator_018_last_page', 'That was the last page. The rest had been torn out.', {pauseAfter: 0.5}),
	c3.n('narrator_019_daniel', "My dad's name is Daniel. When he was a boy, everyone called him Danny.", {pace: 0.95, pauseAfter: 0.5}),
	c3.n('narrator_020_mine_now', 'And his room, the little bedroom at the end of the hall, was mine now.', {pace: 0.92, pauseAfter: 0.8, fearLevel: 3}),
];

// ---------------------------------------------------------------------------
// 4. DAD READS IT
// ---------------------------------------------------------------------------
const c4 = scene('dadReads', {emotion: 'serious', intensity: 0.4, fearLevel: 3});
const DAD_READS: VoiceLine[] = [
	c4.n('narrator_021_showed', 'I showed him the diary. I watched him read it twice.', {pauseAfter: 0.5}),
	c4.d('dad_002_where', 'Where did you find this?', {emotion: 'uneasy', intensity: 0.6, pace: 0.95, pauseAfter: 0.3, fishTags: '[quiet, shaken]'}),
	c4.l('lily_003_closer', 'Dad, it said the second time it comes closer. It was on my bed. It was right on top of me.', {emotion: 'afraid', intensity: 0.7, pauseAfter: 0.4, fishTags: '[scared, close to tears]'}),
	c4.d('dad_003_i_know', 'I know, bug. I know.', {emotion: 'grieving', intensity: 0.6, pace: 0.9, pauseAfter: 0.6, fishTags: '[soft, frightened]'}),
	c4.n('narrator_022_not_a_dream', 'He didn\'t say "it was a dream" this time.', {pauseAfter: 0.4}),
	c4.n('narrator_023_sleep_with_mom', 'He said I was sleeping with Mom tonight. And he would sleep in my room.', {pauseAfter: 0.4}),
	c4.l('lily_004_what_if', 'But what if it comes back?', {emotion: 'afraid', intensity: 0.7, pauseAfter: 0.5}),
	c4.d('dad_004_find_me', "Then it'll find me.", {emotion: 'protective', intensity: 0.6, pace: 0.9, pauseAfter: 0.9, fishTags: '[quiet, resolved]'}),
];

// ---------------------------------------------------------------------------
// 5. THE THIRD NIGHT
// ---------------------------------------------------------------------------
const c5 = scene('thirdNight', {emotion: 'afraid', intensity: 0.45, fearLevel: 4});
const THIRD_NIGHT: VoiceLine[] = [
	c5.n('narrator_024_couldnt', "I tried to stay awake. I couldn't.", {pauseAfter: 0.5}),
	c5.n('narrator_025_four', 'I woke up at four in the morning.', {pace: 0.92, pauseAfter: 0.6}),
	c5.n('narrator_026_silent', 'The house was completely silent. No clock. No wind. Nothing.', {pace: 0.92, pauseAfter: 0.5}),
	c5.n('narrator_027_voice', 'And then, through the wall, very softly, I heard a voice I had never heard before. Thin and dry, like paper tearing.', {pauseAfter: 0.7, fishTags: '[whispering]'}),
	c5.r('rake_001_danny', 'Danny.', {spokenText: 'Danny...', pace: 0.8, pauseBefore: 0.3, pauseAfter: 1.2, fishTags: '[whispering, raspy, drawn out]'}),
	c5.n('narrator_028_mom', "Mom didn't wake up. I still don't know how she didn't wake up.", {pauseAfter: 0.4}),
	c5.n('narrator_029_ran', 'I ran down the hall. My bedroom door was open. The lamp was on.', {emotion: 'breathless', pace: 1.05, pauseAfter: 0.5}),
	c5.n('narrator_030_empty', 'And the bed was empty.', {pace: 0.9, pauseAfter: 0.8}),
	c5.n('narrator_031_torn', 'The blanket had been torn open in three long lines, from the pillow to the end of the bed. Like something had raked it.', {pace: 0.95, pauseAfter: 0.6}),
	c5.n('narrator_032_never_found', 'They never found him.', {pace: 0.9, pauseAfter: 1.0, emotion: 'grieving'}),
];

// ---------------------------------------------------------------------------
// 6. THE MISSING PAGES - in his wallet: what happened in 1984, and the real rule
// ---------------------------------------------------------------------------
const c6 = scene('pages', {emotion: 'grieving', intensity: 0.45, fearLevel: 3});
const PAGES: VoiceLine[] = [
	c6.n('narrator_038_wallet', "A week later, Mom gave me his wallet. Folded inside it, very small, were the pages missing from Grandma's diary.", {pauseAfter: 0.5}),
	c6.g('grandma_006_june14', "June fourteenth. Robert slept in Danny's bed last night, so it would find him instead.", {emotion: 'grieving', intensity: 0.6, pace: 0.92, pauseAfter: 0.4, fishTags: '[quiet, shaking, reading aloud]'}),
	c6.g('grandma_007_name', 'At four o\'clock, I heard it say his name. My husband is gone.', {emotion: 'grieving', intensity: 0.7, pace: 0.9, pauseAfter: 0.6, fishTags: '[broken, crying softly]'}),
	c6.g('grandma_008_rule', 'Mother was right. It never takes the child. It takes whoever lies down in the child\'s place.', {emotion: 'afraid', intensity: 0.6, pace: 0.9, pauseAfter: 0.8, fishTags: '[slow, hollow]'}),
	c6.n('narrator_039_knew', 'My dad tore those pages out himself, when he was nine. He knew exactly what was coming.', {pace: 0.95, pauseAfter: 0.5}),
	c6.n('narrator_040_anyway', 'And he lay down in my bed anyway.', {pace: 0.88, pauseAfter: 1.0, emotion: 'grieving', fishTags: '[quiet, holding back tears]'}),
];

// ---------------------------------------------------------------------------
// 7. TODAY - far away from that house; Sam is nine; "Who's the skinny man?"
// ---------------------------------------------------------------------------
const c7 = scene('today', {emotion: 'serious', intensity: 0.35, fearLevel: 3});
const TODAY: VoiceLine[] = [
	c7.n('narrator_041_moved', 'Mom and I moved eight hundred miles away. I never went back to that house.', {pauseAfter: 0.4}),
	c7.n('narrator_042_grew_up', 'I grew up. I had a son. For twenty-five years, I told myself it was the house.', {pauseAfter: 0.5}),
	c7.n('narrator_043_sam', 'Sam is nine now. This morning, at breakfast, he asked me a question.', {pauseAfter: 0.4}),
	c7.s('son_001_skinny_man', "Mom? Who's the skinny man?", {emotion: 'casual', intensity: 0.4, pauseAfter: 0.35, fishTags: '[curious, casual]'}),
	c7.s('son_002_watches', "The one who sits at the end of my bed. He doesn't do anything. He just watches.", {emotion: 'casual', intensity: 0.4, pauseAfter: 1.1, fishTags: '[matter-of-fact, calm]'}),
	c7.n('narrator_044_never_house', 'It was never the house.', {pace: 0.85, pauseAfter: 0.7, fishTags: '[quiet, horrified]'}),
	c7.n('narrator_045_us', 'It was us.', {pace: 0.8, pauseAfter: 1.0, fishTags: '[whispering]'}),
];

// ---------------------------------------------------------------------------
// 8. THE LAST NIGHT - the second visit; she lies down in his bed; 4:00; it climbs up to her face
// ---------------------------------------------------------------------------
const c8 = scene('lastNight', {emotion: 'afraid', intensity: 0.55, fearLevel: 5});
const LAST_NIGHT: VoiceLine[] = [
	c8.s('son_003_closer', 'Mom... he came closer last night. He put his hand on my knee.', {emotion: 'afraid', intensity: 0.6, pauseAfter: 0.8, fishTags: '[scared, small voice]'}),
	c8.n('narrator_046_third', 'Tonight is the third night.', {pace: 0.88, pauseAfter: 0.7}),
	c8.n('narrator_047_lay_down', 'I put Sam in my bed. Then I walked down the hall, and lay down in his.', {pace: 0.95, pauseAfter: 0.6}),
	c8.n('narrator_048_blanket', 'At four o\'clock, the blanket moved.', {pace: 0.9, pauseAfter: 0.6, fishTags: '[whispering]'}),
	c8.n('narrator_049_climbed', 'Something climbed up from the end of the bed. Slowly. Knees. Hands. Closer.', {pace: 0.9, pauseAfter: 0.5, fishTags: '[whispering, terrified]'}),
	c8.n('narrator_050_looked', "This time, I didn't hide. I looked right at it.", {pace: 0.92, pauseAfter: 0.6, fishTags: '[whispering, shaking]'}),
	c8.r('rake_002_lily', 'Lily.', {spokenText: 'Lily...', pace: 0.8, pauseBefore: 0.3, pauseAfter: 0.4, fishTags: '[whispering, raspy, drawn out]'}),
];

// ---------------------------------------------------------------------------
// 9. THE LETTER - morning; Sam finds her bed empty and the blue notebook on the pillow
// ---------------------------------------------------------------------------
const c9 = scene('letter', {emotion: 'warm', intensity: 0.4, fearLevel: 2});
const LETTER: VoiceLine[] = [
	c9.n('narrator_051_glad', "Sam. If you're reading this, it took me instead of you. I'm glad.", {pace: 0.92, pauseAfter: 0.6, fishTags: '[soft, tender]'}),
	c9.n('narrator_052_never_wanted', 'It never wanted children. It visits them three times... and waits to see who loves them enough to lie down in their place.', {pace: 0.92, pauseAfter: 0.6}),
	c9.n('narrator_053_someone', 'My grandfather did it for my dad. My dad did it for me. Someone always does. Maybe that is what keeps it alive.', {pace: 0.92, pauseAfter: 0.6}),
	c9.n('narrator_054_starve', 'Maybe if, just once, nobody lay down... it would finally starve.', {pace: 0.88, pauseAfter: 0.5, fishTags: '[slow, thoughtful]'}),
	c9.n('narrator_055_couldnt', "I couldn't find out. Not with you.", {pace: 0.88, pauseAfter: 0.9, fishTags: '[soft, close to tears]'}),
	c9.n('narrator_056_decide', "One day, your own child will ask you about the skinny man. And you'll have to decide.", {pace: 0.88, pauseAfter: 1.2, fishTags: '[quiet, heavy]'}),
];

export const VOICE_LINES: VoiceLine[] = [...FIRST_NIGHT, ...BREAKFAST, ...DIARY, ...DAD_READS, ...THIRD_NIGHT, ...PAGES, ...TODAY, ...LAST_NIGHT, ...LETTER];
export const LINE_BY_ID: Record<string, VoiceLine> = Object.fromEntries(VOICE_LINES.map((l) => [l.id, l]));
