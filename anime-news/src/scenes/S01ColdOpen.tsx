/**
 * S01 | COLD OPEN — every cut is derived from the narration cue timings in
 * src/generated/timeline.json, so replacing the scratch voice with the final
 * recording re-times the whole sequence automatically.
 */
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {anchorOf, Plate} from '../components/Plate';
import {at, camLerp, drift, easeOut, ramp} from '../lib/motion';
import {localCue, scene} from '../lib/timeline';
import {C, FONT} from '../lib/theme';

export const s01Cuts = () => {
	const c = (n: number) => localCue('S01', `S01_0${n}`);
	const [c1, c2, c3, c4, c5, c6, c7] = [1, 2, 3, 4, 5, 6, 7].map(c);
	const end = scene('S01').durationFrames;
	const portraitEnd = c2.s + Math.round(c2.d * 0.55); // cut to the empty chair on "...without a majority"
	const bagEnd = c3.s + Math.round(c3.d * 0.5);
	return {c1, c2, c3, c4, c5, c6, c7, end, portraitEnd, bagEnd};
};

const Shot: React.FC<{from: number; to: number; children: React.ReactNode; name: string}> = ({from, to, children, name}) => (
	<Sequence from={from} durationInFrames={Math.max(1, to - from)} name={name} layout="none">
		{children}
	</Sequence>
);

// 1. "Talks without a deal": hard cut from black to the red light on the water, reveal the ship.
const GulfReveal: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const start = at(anchorOf('A01', 'navReflection'), 2.7);
	const mid = at(anchorOf('A01', 'navLight'), 2.2);
	const end = {x: 0.47, y: 0.52, z: 1.2};
	const cam = f < 8 ? camLerp(f, 0, 8, start, {...start, z: 2.6}) : f < 16 ? camLerp(f, 8, 16, {...start, z: 2.6}, mid) : camLerp(f, 16, dur, mid, end, easeOut);
	return <Plate assetId="A01" cam={cam} sway />;
};

// 2a. "An election without a majority": close crop of the portrait.
const PortraitClose: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const eyes = anchorOf('A05', 'eyes');
	const cam = camLerp(f, 0, dur, at(eyes, 3.0), at(eyes, 3.18));
	const blink = f >= dur - 9 && f < dur - 6; // used only if netanyahu_portrait.blink.png exists
	return (
		<AbsoluteFill>
			<Plate assetId="A05" cam={cam} variant={blink ? 'blink' : undefined} />
			<AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 40%)`}} />
		</AbsoluteFill>
	);
};

// 2b. cut to an empty parliamentary chair.
const EmptyChair: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const chair = anchorOf('A15', 'emptyChair');
	return <Plate assetId="A15" cam={camLerp(f, 0, dur, at(chair, 1.75), at(chair, 1.6))} />;
};

// 3a. "Families": anonymous evacuee's hand holding a travel bag.
const HandBag: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const a = anchorOf('A06', 'handBag');
	return <Plate assetId="A06" cam={camLerp(f, 0, dur, {x: a[0] - 0.02, y: a[1], z: 2.6}, {x: a[0] + 0.01, y: a[1] - 0.01, z: 2.7})} />;
};

// 3b. then the bus window.
const BusWindow: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const w = anchorOf('A06', 'window');
	return <Plate assetId="A06" cam={camLerp(f, 0, dur, {x: w[0] - 0.08, y: w[1], z: 1.75}, {x: w[0] - 0.02, y: w[1], z: 1.85})} />;
};

// 4a. "AI boom": the analyst at the dark screen.
const AnalystWide: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return <Plate assetId="A11" cam={camLerp(f, 0, dur, {x: 0.42, y: 0.46, z: 1.22}, {x: 0.46, y: 0.45, z: 1.36})} />;
};

// 4b. "...when does the spending pay off?": push into the face reflected in the blank monitor.
const AnalystReflection: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const r = anchorOf('A11', 'reflection');
	const blink = f >= 14 && f < 17;
	return <Plate assetId="A11" cam={camLerp(f, 0, dur, at(r, 2.2), at(r, 2.55))} variant={blink ? 'blink' : undefined} />;
};

// 5–6. Five narrow panels align, then the title reveal.
const PANELS = [
	{id: 'A01', anchor: 'ship', z: 1.5, label: 'GULF'},
	{id: 'A05', anchor: 'face', z: 1.35, label: 'ISRAEL'},
	{id: 'A06', anchor: 'face', z: 1.4, label: 'UKRAINE'},
	{id: 'A08', anchor: 'placards', z: 1.3, label: 'FRANCE'},
	{id: 'A11', anchor: 'reflection', z: 1.45, label: 'MARKETS'},
];

const FivePanels: React.FC<{titleAt: number; sweepAt: number}> = ({titleAt, sweepAt}) => {
	const f = useCurrentFrame();
	const W = 292;
	const H = 580;
	const GAP = 22;
	const x0 = (1920 - (W * 5 + GAP * 4)) / 2;
	const y0 = 205; // clear of the top-right marks, above the subtitle band
	const dim = ramp(f, titleAt, titleAt + 8, 1, 0.3);
	const recede = ramp(f, titleAt, titleAt + 14, 1, 0.95);
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<AbsoluteFill style={{transform: `scale(${recede})`, filter: `brightness(${dim}) saturate(${0.6 + 0.4 * dim})`}}>
				{PANELS.map((p, i) => {
					const d = i * 3;
					const enter = ramp(f, d, d + 14, 0, 1, easeOut);
					const dir = i % 2 ? -1 : 1;
					const a = anchorOf(p.id, p.anchor);
					const cam = {x: a[0] + drift(f, i, 0.6) * 0.01, y: a[1] + (f / 400) * dir, z: p.z};
					// amber sheen sweeping across on "One turbulent week."
					const sweep = ramp(f, sweepAt + i * 2, sweepAt + i * 2 + 10, -0.4, 1.4);
					return (
						<div
							key={p.id}
							style={{
								position: 'absolute',
								left: x0 + i * (W + GAP),
								top: y0 + dir * 140 * (1 - enter),
								width: W,
								height: H,
								opacity: enter,
								outline: `2px solid rgba(229,154,59,${0.25 + 0.35 * enter})`,
								overflow: 'hidden',
							}}
						>
							<Plate assetId={p.id} cam={cam} width={W} height={H} tag="compact" />
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `linear-gradient(105deg, rgba(240,190,115,0) ${(sweep - 0.15) * 100}%, rgba(240,190,115,0.32) ${sweep * 100}%, rgba(240,190,115,0) ${(sweep + 0.15) * 100}%)`,
									mixBlendMode: 'screen',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									bottom: 0,
									padding: '28px 0 12px',
									textAlign: 'center',
									fontFamily: FONT.display,
									fontWeight: 600,
									fontSize: 24,
									letterSpacing: '0.3em',
									color: C.paper,
									background: 'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))',
								}}
							>
								{p.label}
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
			{f >= titleAt ? <TitleReveal f={f - titleAt} /> : null}
		</AbsoluteFill>
	);
};

const TitleReveal: React.FC<{f: number}> = ({f}) => {
	const wipe = ramp(f, 0, 9, 0, 100, easeOut);
	const bar = ramp(f, 4, 13, 0, 560, easeOut);
	const sub = ramp(f, 8, 16, 0, 1, easeOut);
	const meta = ramp(f, 14, 22, 0, 1, easeOut);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 110}}>
			<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 28, letterSpacing: '0.42em', color: C.amber, opacity: meta, marginBottom: 14}}>
				26 OCT–1 NOV 2026
			</div>
			<div
				style={{
					fontFamily: FONT.display,
					fontWeight: 700,
					fontSize: 138,
					lineHeight: 1,
					letterSpacing: '0.035em',
					color: C.paper,
					textShadow: `6px 6px 0 ${C.ink}`,
					clipPath: `inset(-20px ${100 - wipe}% -20px 0)`,
				}}
			>
				THE WEEK IN ANIME
			</div>
			<div style={{width: bar, height: 8, background: C.red, margin: '18px 0 20px'}} />
			<div
				style={{
					fontFamily: FONT.display,
					fontWeight: 600,
					fontSize: 56,
					letterSpacing: '0.2em',
					color: C.amberSoft,
					opacity: sub,
					transform: `translateY(${(1 - sub) * 16}px)`,
				}}
			>
				POWER UNDER PRESSURE
			</div>
			<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 27, color: C.paper, opacity: 0.85 * meta, marginTop: 26}}>
				Animated illustrations of reported events
			</div>
		</AbsoluteFill>
	);
};

export const S01ColdOpen: React.FC = () => {
	const k = s01Cuts();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* frames 0..c1.s are black: radio click + synth pulse only */}
			<Shot name="1 gulf reveal" from={k.c1.s} to={k.c2.s}>
				<GulfReveal dur={k.c2.s - k.c1.s} />
			</Shot>
			<Shot name="2a portrait close" from={k.c2.s} to={k.portraitEnd}>
				<PortraitClose dur={k.portraitEnd - k.c2.s} />
			</Shot>
			<Shot name="2b empty chair" from={k.portraitEnd} to={k.c3.s}>
				<EmptyChair dur={k.c3.s - k.portraitEnd} />
			</Shot>
			<Shot name="3a hand + bag" from={k.c3.s} to={k.bagEnd}>
				<HandBag dur={k.bagEnd - k.c3.s} />
			</Shot>
			<Shot name="3b bus window" from={k.bagEnd} to={k.c4.s}>
				<BusWindow dur={k.c4.s - k.bagEnd} />
			</Shot>
			<Shot name="4a analyst" from={k.c4.s} to={k.c5.s}>
				<AnalystWide dur={k.c5.s - k.c4.s} />
			</Shot>
			<Shot name="4b reflection" from={k.c5.s} to={k.c6.s}>
				<AnalystReflection dur={k.c6.s - k.c5.s} />
			</Shot>
			<Shot name="5-6 panels + title" from={k.c6.s} to={k.end}>
				<FivePanels titleAt={k.c7.s - k.c6.s} sweepAt={Math.round(k.c6.d * 0.5)} />
			</Shot>
		</AbsoluteFill>
	);
};
