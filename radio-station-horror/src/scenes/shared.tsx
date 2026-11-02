// Helpers shared by all chapter scenes.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BEEP_SPACING_S, FPS, KNOCK_SPACING_S} from '../config';
import {CRTNoise, Vignette} from '../components/CRTNoise';
import {RadioText} from '../components/RadioText';
import {Grain} from '../components/StaticOverlay';
import {ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {noise1} from '../utils/random';
import type {ShotApi} from '../utils/timeline-context';
import {useShot} from '../utils/timeline-context';

/** Voice level of the station right now (0..1), with a syllable-like flutter. */
export const radioLevel = (api: ShotApi): number => {
	const b = api.current;
	if (!b || b.speaker !== 'radio') {
		return 0;
	}
	const local = api.f - api.at(b.id);
	const env = ramp(local, 0, 4) * ramp(local, b.frames - 8, b.frames, 1, 0.15);
	return env * (0.55 + 0.45 * Math.abs(noise1(api.f * 0.35, 3)));
};

/** 0..1 flash for each beep of a BEEP. BEEP. BEEP. group starting at beat `beep1`. */
export const beepFlash = (api: ShotApi, beat = 'beep1'): number => {
	if (!api.chapter.byId[beat]) {
		return 0;
	}
	return beepFlashAt(api.f, api.at(beat));
};

/** Same as beepFlash but with an explicit start frame. */
export const beepFlashAt = (f: number, start: number): number => {
	const sp = Math.round(BEEP_SPACING_S * FPS);
	let v = 0;
	for (let i = 0; i < 3; i++) {
		const t = f - (start + i * sp);
		if (t >= 0 && t < 9) {
			v = Math.max(v, 1 - t / 9);
		}
	}
	return v;
};

/** Impulse 0..1 for each knock in a KNOCK group starting at `beat` (+ optional delay in seconds). */
export const knockHit = (api: ShotApi, beat: string, delay = 0, count = 3): number => {
	const start = api.at(beat) + Math.round(delay * FPS);
	const sp = Math.round(KNOCK_SPACING_S * FPS);
	let v = 0;
	for (let i = 0; i < count; i++) {
		const t = api.f - (start + i * sp);
		if (t >= 0) {
			v = Math.max(v, Math.exp(-t / 4));
		}
	}
	return v;
};

/** Shows the current radio beat's on-screen text (uppercase, flickering). */
export const AutoRadioText: React.FC<{top?: number; size?: number; color?: string; glitch?: number; beats?: string[]}> = ({top = 50, size = 92, color, glitch = 0.35, beats}) => {
	const api = useShot();
	const b = api.current;
	if (!b || !b.onScreen || (b.speaker !== 'radio' && !beats?.includes(b.id))) {
		return null;
	}
	if (beats && !beats.includes(b.id)) {
		return null;
	}
	return <RadioText key={b.id} text={b.onScreen} start={api.at(b.id)} end={api.end(b.id)} top={top} size={size} color={color} glitch={glitch} seed={b.start} panel />;
};

/** Cartoon-scene finishing: film grain + soft vignette (+ optional chapter label). */
export const CartoonFinish: React.FC<{vignette?: number; grain?: number}> = ({vignette = 0.55, grain = 0.06}) => (
	<>
		<Grain opacity={grain} />
		<Vignette strength={vignette} />
	</>
);

/** Small typewriter chapter label in the lower left. */
export const ChapterLabel: React.FC<{text: string; duration?: number}> = ({text, duration = 90}) => {
	const f = useCurrentFrame();
	if (f > duration) {
		return null;
	}
	const chars = Math.min(text.length, Math.floor(f * 1.3));
	const op = ramp(f, duration - 12, duration, 1, 0);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 80,
					bottom: 70,
					fontFamily: FONT.typewriter,
					fontSize: 38,
					color: '#f1ede2',
					letterSpacing: 3,
					opacity: op,
					textShadow: '0 2px 8px rgba(0,0,0,0.9)',
					borderLeft: '4px solid #d7262b',
					paddingLeft: 18,
				}}
			>
				{text.slice(0, chars)}
				<span style={{opacity: f % 16 < 8 ? 1 : 0}}>▌</span>
			</div>
		</AbsoluteFill>
	);
};

/** Black frame with optional analog finishing (used for transitions). */
export const Black: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#000'}}>{children}</AbsoluteFill>;

export const AnalogFinish: React.FC<{scan?: number}> = ({scan = 0.25}) => <CRTNoise scanlines={scan} roll={0.05} vignette={0.7} />;
