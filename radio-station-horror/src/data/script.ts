/*
 * ============================================================================
 *  THE RADIO STATION THAT KNEW HIS NAME — script & timing data
 * ============================================================================
 *
 *  This is the ONE file to edit when re-timing the video.
 *
 *  Every chapter is a list of "beats". A beat is one narration / dialogue line
 *  (or a beep, knock or pause) with a duration in SECONDS. Scenes never use
 *  hard-coded frame numbers for story timing – they ask for "the start of
 *  beat X" – so changing a `dur` here moves every animation, cut, on-screen
 *  text and sound cue attached to that beat.
 *
 *  Workflow once a narrator recording exists:
 *    1. `npm run script:export` writes narration-script.md (timecoded script)
 *       and captions.srt using the current timings.
 *    2. Record / generate narration. Either:
 *         a) one file per beat:  public/audio/voice/<chapterId>/<beatId>.wav
 *            (the beat duration should be >= the clip length), or
 *         b) one file per chapter: public/audio/narration/<chapterId>.wav, or
 *         c) one long file:       public/audio/narrator.wav
 *    3. Adjust the `dur` values below until picture and voice line up.
 *
 *  Helpers:
 *    n(id, text, dur)            narrator line
 *    r(id, text, dur)            the radio voice (text is also flashed on screen in caps)
 *    v(speaker, id, text, dur)   character dialogue (neighbor / adam / seller / victor)
 *    beeps()                     BEEP. BEEP. BEEP. (three beats, plays three_beeps.wav)
 *    knocks(id)                  KNOCK. KNOCK. KNOCK. (plays knocking.wav)
 *    pause(id, dur)              silence
 *  Omit `dur` to let it be estimated from the word count.
 * ============================================================================
 */
import {BEEP_SPACING_S} from '../config';
import type {Beat, Chapter, SfxCue, Speaker} from './types';

type Extra = Partial<Omit<Beat, 'id' | 'speaker' | 'text'>>;

/** Rough reading speed used when a beat has no explicit duration. */
const WORDS_PER_SECOND: Record<Speaker, number> = {
	narrator: 2.8,
	radio: 2.0, // the station speaks slowly and evenly
	neighbor: 2.6,
	adam: 2.6,
	seller: 2.4,
	victor: 2.0,
	sfx: 3,
	silence: 3,
};

export const estimateDuration = (text: string, speaker: Speaker): number => {
	const words = text.split(/\s+/).filter(Boolean).length;
	const ellipses = (text.match(/\.\.\./g) ?? []).length;
	return Math.max(0.8, words / WORDS_PER_SECOND[speaker] + 0.35 + ellipses * 0.4);
};

const make = (speaker: Speaker, id: string, text: string, dur?: number, extra: Extra = {}): Beat => ({
	id,
	speaker,
	text,
	dur: dur ?? estimateDuration(text, speaker),
	...extra,
});

const n = (id: string, text: string, dur?: number, extra?: Extra) => make('narrator', id, text, dur, extra);
const r = (id: string, text: string, dur?: number, extra?: Extra) =>
	make('radio', id, text, dur, {onScreen: text.toUpperCase(), ...extra});
const v = (speaker: Speaker, id: string, text: string, dur?: number, extra?: Extra) =>
	make(speaker, id, text, dur, extra);
const pause = (id: string, dur: number, extra?: Extra) => make('silence', id, '', dur, extra);

const sfx = (name: SfxCue['sfx'], opts: Omit<SfxCue, 'sfx'> = {}): SfxCue => ({sfx: name, ...opts});

/** The recurring motif. Three beats of exactly BEEP_SPACING_S each. */
const beeps = (volume = 0.7): Beat[] => [
	make('sfx', 'beep1', 'BEEP.', BEEP_SPACING_S, {sfx: [sfx('three_beeps', {volume})]}),
	make('sfx', 'beep2', 'BEEP.', BEEP_SPACING_S),
	make('sfx', 'beep3', 'BEEP.', BEEP_SPACING_S + 0.25),
];

const knocks = (id: string, volume = 0.9, dur = 2.0): Beat =>
	make('sfx', id, 'KNOCK. KNOCK. KNOCK.', dur, {sfx: [sfx('knocking', {volume})]});

// ---------------------------------------------------------------------------
// Voice-over fitting
//
// When a voice clip exists for a beat (public/audio/voice/<chapter>/<beat>.*, its
// length listed in src/data/voice-durations.json), the beat lasts exactly
// clip length + gap, so the video follows the voice-over. Beats listed in
// HOLD_BEATS keep their authored `dur` as a minimum – those are the suspense
// pauses. Beats without a clip use their authored `dur` unchanged.
export const VOICE_GAP: Record<Speaker, number> = {
	narrator: 0.28,
	radio: 0.5,
	neighbor: 0.45,
	adam: 0.45,
	seller: 0.5,
	victor: 0.6,
	sfx: 0,
	silence: 0,
};
/** Extra pause after lines that trail off ("Three seconds later..."). */
export const ELLIPSIS_GAP = 0.5;
/** No voiced beat is shorter than this (seconds) – avoids flash cuts. */
export const MIN_VOICED_BEAT = 0.8;
/** Extra breath after the last spoken line of each chapter. */
export const CHAPTER_END_GAP = 0.8;

/** Suspense beats that keep their authored duration even when the voice clip is shorter. */
export const HOLD_BEATS: Partial<Record<Chapter['id'], string[]>> = {
	coldOpen: ['adam', 'clockTime', 'threeSeconds', 'silent', 'good', 'switchedOff'],
	radioReturns: ['at117', 'staredScreen'],
	protecting: ['fiveMin', 'sixthFloor', 'mistake'],
	theBed: ['dontLook', 'underneath', 'breathed', 'nothingElse'],
	victorHale: ['year', 'exceptHim', 'stoppedBreathing', 'adamRahman', 'tomorrow'],
	motel: ['nothing', 'sittingOnIt', 'wasAMan', 'victorHale', 'located', 'didntStop'],
	aftermath: ['smiled', 'neverFound'],
	daniel: ['again', 'because', 'breathing'],
};

/**
 * Beats whose combined length must not change, whatever the voice clips do.
 * The last beat of each group absorbs the difference.
 */
export const FIXED_TOTALS: Array<{chapter: Chapter['id']; beats: string[]; total: number}> = [
	// CCTV: Victor walks out exactly 11 s after Adam (see scenes/Aftermath.tsx)
	{chapter: 'aftermath', beats: ['adamRan', 'elevenLater'], total: 11.7},
];

// ---------------------------------------------------------------------------

export const CHAPTERS: Chapter[] = [
	{
		id: 'disclaimer',
		title: 'Disclaimer',
		beats: [pause('disclaimer', 4.6)],
	},

	// 0:05 ------------------------------------------------------------------
	{
		id: 'coldOpen',
		title: 'Cold open',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.35, fadeIn: 0.5, until: 'clockTime'},
			{sfx: 'low_ambient_hum', volume: 0.4, from: 'womanSaid', until: 'switchedOff', fadeIn: 1},
		],
		beats: [
			n('stoppedMusic', "At 1:17 in the morning, Adam's radio stopped playing music.", 2.85),
			n('static', 'Static.', 1.05, {sfx: [sfx('radio_static', {volume: 0.55, dur: 2.6, fadeOut: 0.4})]}),
			n('threeBeeps', 'Then three beeps.', 1.1),
			...beeps(),
			n('numbersIntro', "A woman's voice began reading numbers.", 1.9, {
				sfx: [sfx('radio_static', {volume: 0.15, dur: 6.5, fadeIn: 0.3, fadeOut: 0.5})],
			}),
			r('numbers', 'Seven... four... two... nine...', 2.85, {onScreen: '7 . . . 4 . . . 2 . . . 9'}),
			n('almostChanged', 'Adam almost changed the station.', 1.6),
			n('voiceSaid', 'Then the voice said:', 1.05),
			r('adam', 'Adam.', 1.75, {sfx: [sfx('radio_static', {volume: 0.35, dur: 0.6, fadeOut: 0.3})]}),
			n('handFroze', 'His hand froze.', 1.1),
			n('hissed', 'The radio hissed.', 1.2, {sfx: [sfx('radio_static', {volume: 0.45, dur: 1.4, fadeIn: 0.2, fadeOut: 0.5})]}),
			n('then1', 'Then:', 0.65),
			r('apartment', 'Apartment 6B.', 1.6),
			n('lookedDoor', 'Adam slowly looked toward his front door.', 2.05),
			n('hisApartment', 'That was his apartment.', 1.25),
			n('continued', 'The voice continued.', 1.05),
			r('oneSeventeen', 'One seventeen.', 1.4),
			n('lookedClock', 'Adam looked at the clock.', 1.2),
			n('clockTime', '1:17 AM.', 1.4, {onScreen: '1:17 AM'}),
			n('womanSaid', 'Then the woman said:', 1.05),
			r('doNotOpen', 'Do not open the door.', 1.9),
			n('threeSeconds', 'Three seconds later...', 2.05),
			n('someoneKnocked', 'someone knocked.', 0.95),
			knocks('knock1', 0.85),
			n('staredRadio', 'Adam stared at the radio.', 1.25),
			n('knockAgain', 'The knocking came again.', 1.2),
			n('harder', 'Harder.', 0.7),
			knocks('knock2', 1.25),
			n('mansVoice', "Then a man's voice came from the hallway.", 1.8),
			v('neighbor', 'adamQ', 'Adam?', 1.05),
			n('knewVoice', 'Adam knew that voice.', 1.1),
			n('itWasNeighbor', 'It was his neighbor.', 1.1),
			v('neighbor', 'openUp', 'Adam, open up. I need help.', 2.0),
			n('movedDoor', 'Adam moved toward the door.', 1.35),
			n('crackled', 'The radio crackled.', 1.05, {sfx: [sfx('radio_static', {volume: 0.6, dur: 1.1, fadeOut: 0.3})]}),
			r('doNot', 'DO NOT.', 1.25),
			n('stopped', 'He stopped.', 0.85),
			n('knockedAgain', 'Outside, his neighbor knocked again.', 1.6, {sfx: [sfx('knocking', {volume: 0.6, at: 0.9})]}),
			v('neighbor', 'please1', 'Adam, please.', 1.2),
			n('strange', 'Then something strange happened.', 1.5),
			n('repeated', "The neighbor's voice repeated.", 1.35),
			n('exactly', 'Exactly the same.', 1.05),
			n('sameTone', 'Same tone.', 0.8),
			n('samePause', 'Same pause.', 0.85),
			v('neighbor', 'please2', 'Adam, please.', 1.1),
			n('again', 'Again.', 0.65),
			v('neighbor', 'please3', 'Adam, please.', 1.1),
			n('recording', 'Like a recording.', 1.25),
			n('steppedBack', 'Adam stepped backward.', 1.2),
			n('silent', 'The hallway went silent.', 1.8),
			n('radioSaid', 'Then the radio said:', 1.05),
			r('good', 'Good.', 1.4),
			n('switchedOff', 'And switched itself off.', 1.9, {sfx: [sfx('electrical_buzz', {volume: 0.35, at: 0.4, dur: 0.5, fadeOut: 0.2})]}),
		],
	},

	{
		id: 'titleCard',
		title: 'Title card',
		beats: [
			pause('title', 4.2, {
				sfx: [sfx('radio_static', {volume: 0.4, dur: 4.2, fadeIn: 0.1, fadeOut: 1.2}), sfx('three_beeps', {volume: 0.35, at: 0.3})],
			}),
		],
	},

	// ~1:30 -----------------------------------------------------------------
	{
		id: 'radioReturns',
		title: 'The radio returns',
		label: 'PART 1 — THE RADIO RETURNS',
		ambience: [{sfx: 'low_ambient_hum', volume: 0.25, fadeIn: 1, until: 'severalMinutes', fadeOut: 1}],
		beats: [
			n('didntSleep', "Adam didn't sleep.", 1.25),
			n('radioOld', 'The radio was old.', 1.1),
			n('boughtIt', 'He had bought it three days earlier from a second-hand market because he liked vintage electronics.', 3.95),
			n('shortwave', 'Shortwave.', 0.7),
			n('am', 'AM.', 0.6),
			n('fm', 'FM.', 0.6),
			n('nothingSpecial', 'Nothing special.', 0.95),
			n('thought', "At least that's what he thought.", 1.5),
			n('checkedHall', 'The next morning, Adam checked the hallway.', 1.8),
			n('nobody', 'Nobody.', 0.8),
			n('knockedNeighbor', "He knocked on his neighbor's door.", 1.4),
			n('pajamas', 'The neighbor answered in pajamas.', 1.4),
			n('askedCome', 'Adam asked if he had come by during the night.', 1.8),
			n('confused', 'The man looked confused.', 1.1),
			v('neighbor', 'no', 'No.', 0.8),
			n('laughed', 'Adam laughed nervously.', 1.1),
			v('adam', 'sure', 'Are you sure?', 0.95),
			v('neighbor', 'asleep', 'I was asleep.', 1.05),
			n('didntTell', "Adam didn't tell him the rest.", 1.4),
			n('unplugged', 'That evening, Adam unplugged the radio.', 1.75),
			n('at117', 'At 1:17 AM...', 1.35),
			n('turnedOn', 'it turned on anyway.', 1.25, {sfx: [sfx('tv_on', {volume: 0.4})]}),
			...beeps(),
			n('sameVoice', "The same woman's voice.", 1.2),
			r('adam', 'Adam.', 1.4),
			n('stomach', 'His stomach dropped.', 1.1),
			n('then', 'Then:', 0.6),
			r('redTrain', 'Do not take the red train tomorrow.', 2.35),
			n('static', 'Static.', 0.8, {sfx: [sfx('radio_static', {volume: 0.5, dur: 1.3, fadeOut: 0.4})]}),
			n('thatWasAll', 'That was all.', 0.85),
			n('severalMinutes', 'Adam stared at the radio for several minutes.', 1.9),
			n('almostIgnored', 'The next morning he almost ignored it.', 1.6),
			n('fastest', 'The red train was the fastest route to work.', 1.8, {sfx: [sfx('train', {volume: 0.4, dur: 5, fadeIn: 0.5, fadeOut: 1})]}),
			n('ridiculous', 'He told himself the whole thing was ridiculous.', 1.9),
			n('atStation', 'But at the station...', 1.2),
			n('heStopped', 'he stopped.', 0.95),
			n('slowerLine', 'He took the slower line instead.', 1.4, {sfx: [sfx('train', {volume: 0.25, dur: 3, fadeIn: 0.3, fadeOut: 1})]}),
			n('alerts', 'Twenty minutes later, his phone filled with alerts.', 2.05, {
				sfx: [sfx('phone_buzz', {volume: 0.5, at: 0.5}), sfx('phone_buzz', {volume: 0.5, at: 1.05}), sfx('phone_buzz', {volume: 0.5, at: 1.55})],
			}),
			n('fire', 'An electrical fire had shut down the red line.', 1.9),
			n('injured', 'Several people were injured.', 1.25),
			n('staredScreen', 'Adam stared at the screen.', 1.6),
		],
	},

	// ~2:45 -----------------------------------------------------------------
	{
		id: 'protecting',
		title: 'It starts protecting him',
		label: 'PART 2 — IT STARTS PROTECTING HIM',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.3, fadeIn: 1, until: 'fiveMin', fadeOut: 0.6},
			{sfx: 'low_ambient_hum', volume: 0.3, from: 'obeying', until: 'mistake', fadeIn: 1, fadeOut: 1},
		],
		beats: [
			n('waited', 'That night... he waited for 1:17.', 1.9),
			...beeps(),
			r('curtains', 'Close your curtains.', 1.4),
			n('did1', 'He did.', 0.65),
			r('kitchen', 'Turn off the kitchen light.', 1.5),
			n('did2', 'He did.', 0.65),
			r('lockDoor', 'Lock the bedroom door.', 1.4),
			n('did3', 'He did.', 0.65),
			n('then', 'Then:', 0.6),
			r('dontLook', 'Do not look outside.', 1.6),
			n('didnt', "Adam didn't.", 0.95),
			n('fiveMin', 'Five minutes later...', 1.4),
			n('scratched', 'something scratched along his window.', 1.75, {sfx: [sfx('scratching', {volume: 0.7, at: 0.5, dur: 4.6, fadeOut: 0.5})]}),
			n('slowly', 'Slowly.', 0.8),
			n('oneSide', 'From one side...', 1.05),
			n('toOther', 'to the other.', 1.1),
			n('sixthFloor', 'He lived on the sixth floor.', 1.9),
			n('obeying', 'After that, Adam started obeying.', 1.6),
			n('everyNight', 'Every night, the station gave him instructions.', 1.9),
			r('noPhone', 'Do not answer your phone.', 1.5),
			r('stairs', 'Take the stairs tomorrow.', 1.4),
			r('blueCoat', 'Do not speak to the woman in the blue coat.', 2.05),
			r('sunset', 'Stay home after sunset.', 1.5),
			n('ignoredOne', 'And every time Adam ignored one...', 1.6),
			n('somethingHappened', 'something happened.', 1.05),
			n('answeredCall', 'Once, he answered a call when the radio told him not to.', 2.2, {
				sfx: [sfx('phone_buzz', {volume: 0.5}), sfx('phone_buzz', {volume: 0.5, at: 0.6})],
			}),
			n('nobodySpoke', 'Nobody spoke.', 0.95),
			n('bathroom', 'But afterward, he heard breathing from inside his bathroom.', 2.35, {sfx: [sfx('breathing', {volume: 0.6, at: 1.2})]}),
			n('elevator', 'Another time, he took the elevator instead of the stairs.', 2.15),
			n('betweenFloors', 'It stopped between floors.', 1.2, {sfx: [sfx('impact', {volume: 0.4, at: 0.2})]}),
			n('lightsOut', 'The lights went out.', 1.1, {sfx: [sfx('electrical_buzz', {volume: 0.4, dur: 0.6, fadeOut: 0.2})]}),
			n('whispered', 'Then somebody whispered his name from above the ceiling panel.', 2.55, {sfx: [sfx('whisper', {volume: 0.7, at: 2.0})]}),
			n('stoppedQuestioning', 'Adam stopped questioning the radio.', 1.6),
			n('trusted', 'He trusted it.', 1.05),
			n('mistake', 'That was the mistake.', 1.9),
		],
	},

	// ~3:45 -----------------------------------------------------------------
	{
		id: 'theBed',
		title: 'The bed',
		label: 'PART 3 — THE BED',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.3, fadeIn: 1, until: 'dontLook', fadeOut: 0.3},
			{sfx: 'low_ambient_hum', volume: 0.2, from: 'cold', until: 'staredFloor', fadeIn: 1.5},
		],
		beats: [
			n('oneNight', 'One night, the voice said:', 1.2),
			r('chair', 'Move the chair in front of your door.', 1.9),
			n('did1', 'Adam did.', 0.7),
			r('lights', 'Switch off every light.', 1.4),
			n('did2', 'He did.', 0.65),
			r('phone', 'Put your phone in the kitchen.', 1.6),
			n('hesitated', 'He hesitated.', 0.95),
			n('obeyed', 'Then obeyed.', 0.85),
			r('bedroom', 'Go to your bedroom.', 1.25),
			n('walked', 'Adam walked inside.', 1.05),
			r('closeDoor', 'Close the door.', 1.1),
			n('closed', 'He closed it.', 0.8),
			r('dontLeave', 'Do not leave until morning.', 1.6),
			n('sat', 'Adam sat on the bed.', 1.1),
			n('finalInstruction', 'Then came the final instruction.', 1.5),
			r('dontLook', 'Do not look underneath.', 2.05),
			n('cold', "Adam's entire body went cold.", 1.5),
			n('livingRoom', 'The radio was in the living room.', 1.5),
			n('alarmClock', 'But the voice was suddenly coming from the small speaker on his bedside alarm clock.', 3.3),
			r('dontLookBed', 'Do not look underneath the bed.', 2.05),
			n('staredFloor', 'Adam stared at the floor.', 1.25),
			n('shifted', 'Something beneath him shifted.', 1.4, {sfx: [sfx('creak', {volume: 0.35, at: 0.3})]}),
			n('slightly', 'Very slightly.', 1.05),
			n('feet', 'He pulled his feet onto the mattress.', 1.6),
			n('creaked', 'The bed creaked.', 1.1, {sfx: [sfx('creak', {volume: 0.6})]}),
			n('underneath', 'Then something underneath it...', 1.75),
			n('breathed', 'breathed.', 1.9, {sfx: [sfx('breathing', {volume: 0.9, at: 0.1})]}),
			n('covered', 'Adam covered his mouth.', 1.25),
			n('voiceSaid', 'The voice said:', 0.8),
			r('good', 'Good.', 1.25),
			n('nothingElse', 'Nothing else happened.', 1.35),
			n('sunrise', 'At sunrise, he ran out of the apartment.', 1.9),
		],
	},

	// ~4:40 -----------------------------------------------------------------
	{
		id: 'victorHale',
		title: 'Victor Hale',
		label: 'PART 4 — VICTOR HALE',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.15, fadeIn: 1, until: 'searched', fadeOut: 1},
			{sfx: 'low_ambient_hum', volume: 0.3, from: 'searched', until: 'stoppedBreathing', fadeIn: 1, fadeOut: 0.2},
		],
		beats: [
			n('decided', 'Adam decided to find out where the radio had come from.', 2.2),
			n('market', 'He returned to the market.', 1.1),
			n('remembered', 'The seller remembered it.', 1.1),
			n('receiver', 'An old black shortwave receiver.', 1.4),
			n('clearance', 'He told Adam it had come from an apartment clearance.', 2.05),
			n('disappeared', 'The previous owner had disappeared.', 1.6),
			n('askedWhen', 'Adam asked when.', 0.85),
			v('seller', 'year', '1987.', 1.2),
			n('adamLaughed', 'Adam laughed.', 0.8),
			n('sellerDidnt', "The seller didn't.", 1.05),
			v('seller', 'alone', 'He lived alone.', 1.25),
			n('locked', 'Police found his apartment locked from the inside.', 2.0),
			n('food', 'Food on the table.', 0.95),
			n('wallet', 'Wallet.', 0.65),
			n('keys', 'Keys.', 0.65),
			n('shoes', 'Shoes.', 0.7),
			n('everything', 'Everything still there.', 1.1),
			n('exceptHim', 'Except him.', 1.35),
			n('searched', 'Adam searched online.', 1.1),
			n('archive', 'Eventually, he found an old newspaper archive.', 1.8),
			n('article', 'A small article.', 0.95),
			n('headline', 'LOCAL RADIO ENTHUSIAST MISSING WITHOUT TRACE.', 2.35),
			n('name', "The man's name was Victor Hale.", 1.6),
			n('photos', 'Police photographs showed his apartment.', 1.75),
			n('onDesk', 'On the desk...', 1.1),
			n('adamsRadio', "was Adam's radio.", 1.5),
			n('somethingElse', 'Then Adam found something else.', 1.4),
			n('notebookScan', "A scan of Victor's notebook.", 1.25),
			n('pages', 'Pages and pages of frequencies.', 1.5),
			n('numbers', 'Numbers.', 0.65),
			n('times', 'Times.', 0.65),
			n('names', 'Names.', 0.7),
			n('meaningless', 'Most were meaningless.', 1.1),
			n('recognized', 'Until Adam recognized one.', 1.35),
			n('phoneNumber', 'His own phone number.', 1.25),
			n('from1987', 'Written in a notebook from 1987.', 1.75),
			n('stoppedBreathing', 'Adam stopped breathing.', 1.5),
			n('belowIt', 'Below it was his name.', 1.2),
			n('adamRahman', 'ADAM RAHMAN.', 1.5, {onScreen: 'ADAM RAHMAN'}),
			n('beside', 'And beside his name:', 1.1),
			n('time', '1:17 AM.', 1.1, {onScreen: '1:17 AM'}),
			n('date', 'NOVEMBER 6.', 1.25, {onScreen: 'NOVEMBER 6'}),
			n('tomorrow', 'Tomorrow.', 1.9, {sfx: [sfx('impact', {volume: 0.5, at: 0.05})]}),
		],
	},

	// ~5:55 -----------------------------------------------------------------
	{
		id: 'motel',
		title: 'The motel',
		label: 'PART 5 — THE MOTEL',
		ambience: [
			{sfx: 'motel_ambience', volume: 0.35, fadeIn: 1, until: 'tvOn'},
			{sfx: 'electrical_buzz', volume: 0.12, from: 'filled', until: 'staredTv', fadeIn: 0.5, fadeOut: 0.5},
			{sfx: 'motel_ambience', volume: 0.25, from: 'staredTv', until: 'located', fadeIn: 1},
		],
		beats: [
			n('didntGoHome', "Adam didn't go home.", 1.05),
			n('booked', 'He booked a motel across town.', 1.35),
			n('leftRadio', 'Left the radio in his apartment.', 1.35),
			n('phoneOff', 'Turned off his phone.', 1.1),
			n('at116', 'At 1:16 AM, he sat on the motel bed staring at the clock.', 2.55),
			n('t117', '1:17.', 1.1),
			n('nothing', 'Nothing.', 1.1),
			n('almostLaughed', 'He almost laughed.', 1.05),
			n('tvOn', 'Then the television turned on.', 1.35, {sfx: [sfx('tv_on', {volume: 0.6})]}),
			n('static', 'Static.', 0.7, {sfx: [sfx('radio_static', {volume: 0.45, dur: 3.6, fadeOut: 0.4})]}),
			...beeps(),
			n('filled', "The woman's voice filled the room.", 1.4),
			r('adam', 'Adam.', 1.2),
			n('backed', 'He backed toward the door.', 1.1),
			r('returnHome', 'Return home.', 1.25),
			n('shook', 'Adam shook his head.', 0.95),
			v('adam', 'no1', 'No.', 0.7),
			n('sharpened', 'The static sharpened.', 1.05, {sfx: [sfx('radio_static', {volume: 0.7, dur: 1.4, fadeOut: 0.3})]}),
			r('returnHome2', 'RETURN HOME.', 1.25),
			v('adam', 'no2', 'No.', 0.8),
			n('changed', 'Then the voice changed.', 1.1),
			n('notAngry', 'Not angry.', 0.7),
			n('calm', 'Calm.', 0.65),
			n('disappointed', 'Almost disappointed.', 1.2),
			r('subjectLeft', 'Subject has left designated location.', 2.35),
			n('froze', 'Adam froze.', 0.8),
			n('subjectQ', 'Subject?', 0.95),
			n('continued', 'The voice continued.', 0.85),
			r('correction', 'Correction required.', 1.6),
			n('handle', 'He grabbed the door handle.', 1.1),
			n('lockedDoor', 'Locked.', 0.7),
			n('pulled', 'He pulled harder.', 0.8),
			n('nothing2', 'Nothing.', 0.8),
			n('tvSaid', 'Then the television said:', 1.05),
			r('dontTurn', 'Do not turn around.', 1.75),
			n('breathStopped', "Adam's breathing stopped.", 1.25),
			n('behindHim', 'Something behind him...', 1.25),
			n('shiftedBed', 'shifted on the bed.', 1.1, {sfx: [sfx('creak', {volume: 0.5})]}),
			n('sank', 'The mattress sank.', 1.05),
			n('slowly', 'Slowly.', 0.8),
			n('satDown', 'As if someone had just sat down.', 1.6),
			n('staredTv', 'Adam stared at the dark TV screen.', 1.5),
			n('reflection', 'In the reflection...', 1.2),
			n('seeBed', 'he could see the bed behind him.', 1.5),
			n('sittingOnIt', 'And sitting on it...', 1.35),
			n('wasAMan', 'was a man.', 1.25),
			n('thin', 'Thin.', 0.65),
			n('pale', 'Pale.', 0.65),
			n('clothes', 'Wearing clothes that looked decades old.', 1.75),
			n('recognizedPhoto', 'Adam recognized him from the newspaper photograph.', 2.0),
			n('victorHale', 'Victor Hale.', 1.2),
			n('finger', 'Victor lifted one finger to his lips.', 1.6),
			n('pointed', 'Then pointed beneath the bed.', 1.4),
			n('didntMove', "Adam didn't move.", 0.95),
			n('whispered', 'Victor whispered:', 0.85),
			v('victor', 'notWarning', "It isn't warning you.", 1.6, {onScreen: "it isn't warning you."}),
			n('staredHim', 'Adam stared at him.', 0.95),
			n('trembled', "Victor's voice trembled.", 1.1),
			v('victor', 'tellingIt', "It's telling it where you are.", 1.9, {onScreen: "it's telling it where you are."}),
			n('crackled', 'The television crackled.', 1.05, {sfx: [sfx('radio_static', {volume: 0.5, dur: 1.2})]}),
			r('located', 'SUBJECT LOCATED.', 1.6, {sfx: [sfx('radio_static', {volume: 0.8, dur: 2.0, fadeOut: 0.2})]}),
			n('hitFloor', 'Something underneath the bed hit the floor.', 1.6, {sfx: [sfx('impact', {volume: 1})]}),
			n('hard', 'Hard.', 0.7),
			n('vanished', 'Victor vanished.', 1.05),
			n('ranWindow', 'Adam ran for the window.', 1.05),
			n('bedLifted', 'Behind him, the bed lifted off the ground.', 1.65, {sfx: [sfx('creak', {volume: 0.8, playbackRate: 0.7})]}),
			n('notTipped', 'Not tipped.', 0.7),
			n('lifted', 'Lifted.', 0.8),
			n('standingUp', 'As if something underneath it was standing up.', 1.9, {sfx: [sfx('breathing', {volume: 0.8, playbackRate: 0.75})]}),
			n('lightsExploded', 'The lights exploded.', 1.2, {
				sfx: [sfx('glass_break', {volume: 0.9}), sfx('electrical_buzz', {volume: 0.6, dur: 0.5, fadeOut: 0.2})],
			}),
			n('smashed', 'Adam smashed the window with a chair and climbed onto the fire escape.', 2.6, {
				sfx: [sfx('glass_break', {volume: 1, at: 0.5}), sfx('impact', {volume: 0.4, at: 0.45})],
			}),
			n('behindTv', 'Behind him... the television screamed through static:', 2.05),
			r('dontLeave', 'DO NOT LEAVE.', 1.4, {sfx: [sfx('radio_static', {volume: 0.9, dur: 1.8, fadeOut: 0.3})]}),
			n('jumped', 'Adam jumped down the stairs.', 1.2),
			n('ran', 'Ran.', 0.65),
			n('didntStop', "Didn't stop.", 1.4),
		],
	},

	// ~7:10 -----------------------------------------------------------------
	{
		id: 'aftermath',
		title: 'Aftermath / CCTV',
		label: 'PART 6 — AFTERMATH',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.2, fadeIn: 1, until: 'noOne', fadeOut: 0.5},
			// faint fluorescent hum under the CCTV, so the 11-second wait is quiet but not dead
			{sfx: 'electrical_buzz', volume: 0.07, from: 'adamRan', until: 'cutStatic', fadeIn: 0.5, fadeOut: 0.2},
		],
		beats: [
			n('policeFound', 'Police found the motel room empty.', 1.5),
			n('overturned', 'The bed had been overturned.', 1.25),
			n('tvStillOn', 'The television was still on.', 1.25, {sfx: [sfx('radio_static', {volume: 0.25, dur: 1.6, fadeIn: 0.2, fadeOut: 0.4})]}),
			n('noOne', 'No one could explain the recording captured by the motel hallway camera.', 2.85),
			// CCTV: Victor walks out EXACTLY 11 seconds after Adam (the CCTV scene enforces this);
			// keep adamRan + elevenLater ≈ 11 s so the narration lands on Victor's exit.
			n('adamRan', 'At 1:17 AM, Adam ran from the room.', 3.0),
			n('elevenLater', 'Eleven seconds later...', 8.7),
			n('someoneElse', 'someone else walked out.', 1.4),
			n('thinMan', 'A thin man.', 0.95),
			n('oldClothes', 'Old-fashioned clothes.', 1.1),
			n('bareFeet', 'Bare feet.', 0.95),
			n('victor', 'Victor Hale.', 1.1),
			n('since1987', 'The man who had disappeared in 1987.', 1.8),
			n('stood', 'He stood in the hallway...', 1.4),
			n('looked', 'looked directly at the camera...', 1.75),
			n('smiled', 'and smiled.', 1.75),
			n('cutStatic', 'Then the footage cut to static.', 1.6, {sfx: [sfx('radio_static', {volume: 0.8, dur: 2.0, fadeOut: 0.6})]}),
			n('neverFound', 'Adam was never found.', 2.2),
		],
	},

	// ~7:00+ ----------------------------------------------------------------
	{
		id: 'daniel',
		title: 'Daniel',
		ambience: [
			{sfx: 'low_ambient_hum', volume: 0.2, fadeIn: 1, until: 'oneMorning'},
			{sfx: 'low_ambient_hum', volume: 0.3, from: 'oneMorning', until: 'breathing', fadeIn: 1, fadeOut: 0.1},
		],
		beats: [
			n('cleared', 'Three weeks later, his apartment was cleared.', 1.8),
			n('thrownAway', 'Most of his belongings were thrown away.', 1.6),
			n('sold', 'The old radio was sold.', 1.1),
			n('again', 'Again.', 1.1),
			n('months', 'Months passed.', 1.25),
			n('oneMorning', 'Then, at 1:17 one morning...', 1.6),
			n('daniel', 'a university student named Daniel woke to static in his bedroom.', 2.7, {
				sfx: [sfx('radio_static', {volume: 0.3, dur: 3.4, fadeIn: 0.4, fadeOut: 0.4})],
			}),
			n('bought', 'He had bought an old shortwave radio that afternoon.', 2.05),
			...beeps(),
			n('numbers', "A woman's voice began reading numbers.", 1.75),
			n('satUp', 'Daniel sat up.', 0.85),
			n('voiceSaid', 'Then the voice said:', 0.95),
			r('danielName', 'Daniel.', 1.4),
			n('froze', 'He froze.', 0.8),
			n('continued', 'The radio continued.', 0.95),
			r('room', 'Room 204.', 1.4),
			n('lookedDoor', 'Daniel slowly looked at his dorm room door.', 1.9),
			n('voiceSaid2', 'Then the voice said:', 1.05),
			r('dontLook', 'Do not look underneath the bed.', 2.35),
			n('pale', "Daniel's face went pale.", 1.6),
			n('because', 'Because something underneath him...', 2.55),
			n('breathing', 'had already started breathing.', 2.05),
			pause('breath', 1.7, {sfx: [sfx('breathing', {volume: 1, dur: 1.6, fadeOut: 0.1})]}),
		],
	},

	{
		id: 'endCard',
		title: 'Cut to black / end card',
		beats: [
			pause('black', 1.6),
			pause('title', 4.0, {sfx: [sfx('radio_static', {volume: 0.25, dur: 4, fadeIn: 0.5, fadeOut: 1.5})]}),
			pause('out', 1.2),
		],
	},
];
