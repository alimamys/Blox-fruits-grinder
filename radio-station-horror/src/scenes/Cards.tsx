// Disclaimer, title card and end card.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CRTNoise} from '../components/CRTNoise';
import {RadioText} from '../components/RadioText';
import {SpeechWave} from '../components/SpeechWave';
import {StaticOverlay} from '../components/StaticOverlay';
import {ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {useShot} from '../utils/timeline-context';
import {beepFlashAt} from './shared';

// 0:00 – plain, readable, short. Then smash cut into the hook.
export const Disclaimer: React.FC = () => {
	const {f, dur} = useShot();
	const op = ramp(f, 0, 8) * ramp(f, dur - 4, dur, 1, 0);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: op, textAlign: 'center', color: '#f2f2f2', fontFamily: FONT.ui, maxWidth: 1300}}>
				<div style={{fontSize: 64, fontWeight: 600, letterSpacing: 10, marginBottom: 44}}>DISCLAIMER</div>
				<div style={{fontSize: 40, lineHeight: 1.5, opacity: 0.92}}>
					This story is fictional and created for entertainment purposes.
					<br />
					All characters, events, recordings, documents and CCTV footage shown are fictional or dramatized.
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const TitleCard: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const flash = beepFlashAt(f, 9);
	const op = ramp(f, 4, 14) * ramp(f, dur - 18, dur, 1, 0);
	return (
		<AbsoluteFill style={{background: '#030303'}}>
			<StaticOverlay opacity={0.35 * ramp(f, 0, 6, 1, 0.25) + flash * 0.1} blend="screen" seed={404} tear={0.6} />
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
				<SpeechWave x={360} y={760} w={1200} h={120} level={0.15 + flash * 0.8} mode={flash > 0.1 ? 'beep' : 'noise'} color="#ff6a1c" seed={9} />
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: op}}>
				<div style={{fontFamily: FONT.vcr, fontSize: 40, color: '#ff8a3a', letterSpacing: 12}}>07.117 MHz</div>
			</div>
			<RadioText text={'THE RADIO STATION\nTHAT KNEW HIS NAME'} start={4} end={dur - 4} top={48} size={100} glitch={0.45} seed={77} />
			<CRTNoise scanlines={0.35} roll={0.1} vignette={0.8} />
		</AbsoluteFill>
	);
};

export const EndCard: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const tStart = api.at('title');
	const tEnd = api.end('title');
	const op = ramp(f, tStart, tStart + 10) * ramp(f, tEnd - 16, tEnd, 1, 0);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{f >= tStart && f < tEnd && (
				<>
					<StaticOverlay opacity={0.12 * op} blend="screen" seed={505} />
					<RadioText text={'THE RADIO STATION\nTHAT KNEW HIS NAME'} start={tStart} end={tEnd} top={46} size={84} glitch={0.25} seed={505} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: FONT.vcr, fontSize: 40, color: '#ff8a3a', letterSpacing: 10, opacity: op * 0.8}}>
						0117
					</div>
					<CRTNoise scanlines={0.3} roll={0.06} vignette={0.85} />
				</>
			)}
		</AbsoluteFill>
	);
};
