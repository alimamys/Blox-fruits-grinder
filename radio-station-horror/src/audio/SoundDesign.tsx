// Places every sound in the video, driven entirely by src/data/script.ts:
//   • ambience beds per chapter
//   • sound-effect cues per beat
//   • voice files (per beat, per chapter, or one continuous narrator.wav)
// Any missing file is skipped silently.
import React from 'react';
import {Sequence} from 'remotion';
import {FPS} from '../config';
import {TIMELINE} from '../data/timeline';
import {findAudio, findSfx, NARRATOR_FILE, NARRATOR_START_CHAPTER} from './audioFiles';
import {SafeAudio} from './SafeAudio';
import {fadeVolume} from './volume';

type Props = {
	sfxVolume: number;
	voiceVolume: number;
};

const sec = (s: number | undefined) => Math.round((s ?? 0) * FPS);

export const SoundDesign: React.FC<Props> = ({sfxVolume, voiceVolume}) => {
	const elements: React.ReactNode[] = [];

	for (const ch of TIMELINE) {
		// --- Ambience beds -----------------------------------------------------
		(ch.ambience ?? []).forEach((amb, i) => {
			const src = findSfx(amb.sfx);
			if (!src) {
				return;
			}
			const from = ch.start + (amb.from ? ch.byId[amb.from]?.start ?? 0 : 0);
			const to = ch.start + (amb.until ? ch.byId[amb.until]?.start ?? ch.frames : ch.frames);
			const frames = to - from;
			if (frames <= 0) {
				return;
			}
			elements.push(
				<Sequence key={`amb-${ch.id}-${i}`} from={from} durationInFrames={frames} name={`♪ ${amb.sfx} (bed)`} layout="none">
					<SafeAudio
						src={src}
						loop
						volume={fadeVolume(amb.volume * sfxVolume, frames, sec(amb.fadeIn ?? 0.3), sec(amb.fadeOut ?? 0.15))}
					/>
				</Sequence>,
			);
		});

		// --- Per-beat cues + voice files ---------------------------------------
		for (const beat of ch.beats) {
			(beat.sfx ?? []).forEach((cue, i) => {
				const src = findSfx(cue.sfx);
				if (!src) {
					return;
				}
				const from = beat.absStart + sec(cue.at);
				const frames = cue.dur ? sec(cue.dur) : undefined;
				elements.push(
					<Sequence key={`sfx-${ch.id}-${beat.id}-${i}`} from={from} durationInFrames={frames} name={`♪ ${cue.sfx}`} layout="none">
						<SafeAudio
							src={src}
							loop={cue.loop}
							playbackRate={cue.playbackRate}
							volume={fadeVolume((cue.volume ?? 1) * sfxVolume, frames ?? Infinity, sec(cue.fadeIn), sec(cue.fadeOut))}
						/>
					</Sequence>,
				);
			});

			if (beat.speaker !== 'sfx' && beat.speaker !== 'silence') {
				const voice = findAudio(`audio/voice/${ch.id}/${beat.id}`);
				if (voice) {
					elements.push(
						<Sequence key={`vo-${ch.id}-${beat.id}`} from={beat.absStart} name={`🎙 ${beat.id}`} layout="none">
							<SafeAudio src={voice} volume={voiceVolume} />
						</Sequence>,
					);
				}
			}
		}

		// --- One narration file per chapter ------------------------------------
		const chapterVoice = findAudio(`audio/narration/${ch.id}`);
		if (chapterVoice) {
			elements.push(
				<Sequence key={`chvo-${ch.id}`} from={ch.start} durationInFrames={ch.frames} name={`🎙 ${ch.id}`} layout="none">
					<SafeAudio src={chapterVoice} volume={voiceVolume} />
				</Sequence>,
			);
		}
	}

	// --- One continuous narrator.wav ---------------------------------------------
	const narrator = findAudio(NARRATOR_FILE);
	const narratorStart = TIMELINE.find((c) => c.id === NARRATOR_START_CHAPTER)?.start ?? 0;
	if (narrator) {
		elements.push(
			<Sequence key="narrator" from={narratorStart} name="🎙 narrator.wav" layout="none">
				<SafeAudio src={narrator} volume={voiceVolume} />
			</Sequence>,
		);
	}

	return <>{elements}</>;
};
