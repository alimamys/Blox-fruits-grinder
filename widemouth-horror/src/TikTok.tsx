// TikTok episodes of the ORIGINAL "Mr. Widemouth": 1080x1920, one part of the film (from..to seconds of
// public/tiktok/clean.mp4 - the film rendered without burned-in subtitles), laid out for a phone:
//   - the episode title and "PART n / N" at the top (below TikTok's top bar)
//   - the full 16:9 picture (nothing cropped) over a blurred, zoomed copy of itself
//   - the film's own word-timed karaoke captions, bigger, under the picture, clear of TikTok's buttons
//   - a short end card: "PART n+1 ->" or "THE END"
import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Subtitles} from './components/fx/Subtitles';
import {FPS, TIMELINE} from './data/timeline';
import {FONT, loadAllFonts} from './utils/fonts';

loadAllFonts();

export type TikTokProps = {part: number; total: number; from: number; to: number};
export const TIKTOK_END = 36; // end card, frames
const SRC = staticFile('tiktok/clean.mp4');
const VIDEO_TOP = 470;
const VIDEO_H = 608;

export const tiktokDuration = (p: TikTokProps) => Math.round((p.to - p.from) * FPS) + TIKTOK_END;

export const TikTokPart: React.FC<TikTokProps> = ({part, total, from, to}) => {
	const f = useCurrentFrame();
	const fromF = Math.round(from * FPS);
	const len = Math.round((to - from) * FPS);
	const vol = (fr: number) => interpolate(fr, [len - 14, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const last = part === total;
	const endK = interpolate(f, [len, len + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Sequence durationInFrames={len}>
				{/* blurred, zoomed copy of the picture filling the phone screen */}
				<AbsoluteFill>
					<OffthreadVideo src={SRC} startFrom={fromF} endAt={fromF + len} muted style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(30px) brightness(0.42) saturate(1.15)', transform: 'scale(1.08)'}} />
				</AbsoluteFill>
				<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)'}} />
				{/* the full 16:9 picture */}
				<div style={{position: 'absolute', left: 0, top: VIDEO_TOP, width: 1080, height: VIDEO_H, boxShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>
					<OffthreadVideo src={SRC} startFrom={fromF} endAt={fromF + len} volume={vol} style={{width: 1080, height: VIDEO_H, display: 'block'}} />
				</div>
			</Sequence>
			{/* title + part */}
			<div style={{position: 'absolute', top: 236, left: 0, right: 0, textAlign: 'center', opacity: 1 - endK}}>
				<div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 84, color: '#f4efe4', letterSpacing: 3, textShadow: '0 6px 0 #000, 0 0 24px rgba(0,0,0,0.8)'}}>MR. WIDEMOUTH</div>
				<div style={{display: 'inline-block', marginTop: 14, fontFamily: FONT.ui, fontWeight: 800, fontSize: 46, color: '#fff', background: '#d7261e', padding: '6px 26px', borderRadius: 12, boxShadow: '0 6px 0 #000'}}>
					PART {part} / {total}
				</div>
			</div>
			{/* the film's own captions, bigger, under the picture (kept left of TikTok's buttons) */}
			<Sequence from={-fromF} durationInFrames={fromF + len}>
				<div style={{position: 'absolute', left: (1080 - 688 * 1.25) / 2, top: VIDEO_TOP + VIDEO_H + 16, width: 688, height: 300, transform: 'scale(1.25)', transformOrigin: '0 0'}}>
					<Subtitles timeline={TIMELINE} />
				</div>
			</Sequence>
			{/* end card */}
			{f >= len ? (
				<AbsoluteFill style={{background: '#000', opacity: endK, alignItems: 'center', justifyContent: 'center'}}>
					<div style={{textAlign: 'center', fontFamily: FONT.ui, fontWeight: 800, color: '#f4efe4'}}>
						{last ? (
							<div style={{fontSize: 120, letterSpacing: 8}}>THE END</div>
						) : (
							<>
								<div style={{fontSize: 64, color: '#bbb', letterSpacing: 4}}>MR. WIDEMOUTH</div>
								<div style={{fontSize: 150, color: '#ff3b2f', marginTop: 10}}>PART {part + 1} →</div>
								<div style={{fontSize: 46, marginTop: 30, color: '#ddd'}}>Follow so you don't miss it</div>
							</>
						)}
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
