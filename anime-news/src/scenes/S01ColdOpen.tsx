/**
 * S01 | COLD OPEN — every cut is derived from the narration cue timings in
 * src/generated/timeline.json, so replacing the voice with a final recording
 * re-times the whole sequence automatically.
 *
 * Every shot carries continuous motion on several levels: animated plate
 * (characters blink/breathe/glance, water, smoke, crowd), a handheld camera,
 * and atmosphere FX (dust, haze, passing light) that also work on final art.
 */
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {anchorOf, Plate, TempTag} from '../components/Plate';
import {Embers, Flash, Handheld, Haze, LightSweep, Motes, SpeedLines, handheld} from '../components/fx';
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

const overshoot = Easing.out(Easing.back(1.7));

// 1. "Talks without a deal": hard cut from black to the red light on the water, reveal the ship.
const GulfReveal: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const start = at(anchorOf('A01', 'navReflection'), 2.7);
	const mid = at(anchorOf('A01', 'navLight'), 2.2);
	const end = {x: 0.47, y: 0.52, z: 1.2};
	const cam = f < 8 ? camLerp(f, 0, 8, start, {...start, z: 2.6}) : f < 16 ? camLerp(f, 8, 16, {...start, z: 2.6}, mid) : camLerp(f, 16, dur, mid, end, easeOut);
	return (
		<AbsoluteFill>
			<Handheld amp={0.7} seed={1}>
				<Plate assetId="A01" cam={cam} sway tag="none" />
				<Haze y={470} h={130} opacity={0.16} speed={0.8} />
			</Handheld>
			<TempTag id="A01" />
		</AbsoluteFill>
	);
};

// 2a. "An election without a majority": close crop of the (silent) portrait.
const PortraitClose: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const eyes = anchorOf('A05', 'eyes');
	const cam = camLerp(f, 0, dur, at(eyes, 2.9), at(eyes, 3.15));
	const blink = f >= dur - 9 && f < dur - 6; // only if netanyahu_portrait.blink.png is supplied
	return (
		<AbsoluteFill>
			<Handheld amp={0.5} seed={2}>
				<Plate assetId="A05" cam={cam} variant={blink ? 'blink' : undefined} tag="none" />
			</Handheld>
			<Motes count={70} seed="pm" drift={[0.4, -0.6]} size={3.2} />
			<LightSweep period={46} offset={10} strength={0.16} />
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 40%)'}} />
			<TempTag id="A05" />
		</AbsoluteFill>
	);
};

// 2b. cut to an empty parliamentary chair.
const EmptyChair: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const chair = anchorOf('A15', 'emptyChair');
	return (
		<AbsoluteFill>
			<Handheld amp={0.45} seed={3}>
				<Plate assetId="A15" cam={camLerp(f, 0, dur, at(chair, 1.8), at(chair, 1.58))} tag="none" />
			</Handheld>
			<Haze y={260} h={220} color="240,170,90" opacity={0.12} speed={0.5} />
			<Motes count={110} seed="cm" drift={[0.15, -0.25]} size={2.6} color="#ffd59a" />
			<TempTag id="A15" />
		</AbsoluteFill>
	);
};

// 3a. "Families": anonymous evacuee's hand gripping a travel bag (bus vibration).
const HandBag: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const a = anchorOf('A06', 'handBag');
	return (
		<AbsoluteFill>
			<Handheld amp={0.8} seed={4} shake={3}>
				<Plate assetId="A06" cam={camLerp(f, 0, dur, {x: a[0] - 0.02, y: a[1], z: 2.5}, {x: a[0] + 0.015, y: a[1] - 0.015, z: 2.65})} tag="none" />
			</Handheld>
			<LightSweep period={30} offset={8} color="190,215,255" strength={0.12} angle={115} />
			<TempTag id="A06" />
		</AbsoluteFill>
	);
};

// 3b. then the bus window: the civilian watches the road.
const BusWindow: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const w = anchorOf('A06', 'window');
	return (
		<AbsoluteFill>
			<Handheld amp={0.8} seed={5} shake={2.5}>
				<Plate assetId="A06" cam={camLerp(f, 0, dur, {x: w[0] - 0.13, y: w[1] + 0.02, z: 1.7}, {x: w[0] - 0.06, y: w[1], z: 1.82})} sway tag="none" />
			</Handheld>
			<LightSweep period={36} color="190,215,255" strength={0.1} angle={115} />
			<TempTag id="A06" />
		</AbsoluteFill>
	);
};

// 4a. "AI boom": the analyst at the dark screen.
const AnalystWide: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Handheld amp={0.4} seed={6}>
				<Plate assetId="A11" cam={camLerp(f, 0, dur, {x: 0.42, y: 0.47, z: 1.2}, {x: 0.47, y: 0.45, z: 1.38})} tag="none" />
			</Handheld>
			<Motes count={40} seed="am" drift={[0.1, -0.2]} size={2.2} color="#ff7a5a" opacity={0.5} />
			<TempTag id="A11" />
		</AbsoluteFill>
	);
};

// 4b. "...when does the spending pay off?": push into the face reflected in the blank monitor.
const AnalystReflection: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const r = anchorOf('A11', 'reflection');
	const blink = f >= 14 && f < 17; // only if market_analyst.blink.png is supplied
	return (
		<AbsoluteFill>
			<Handheld amp={0.35} seed={7}>
				<Plate assetId="A11" cam={camLerp(f, 0, dur, at(r, 2.1), at(r, 2.6))} variant={blink ? 'blink' : undefined} tag="none" />
			</Handheld>
			<LightSweep period={60} color="255,120,100" strength={0.08} angle={90} width={6} />
			<TempTag id="A11" />
		</AbsoluteFill>
	);
};

// 5–6. Five narrow panels align, then the title reveal.
const PANELS = [
	{id: 'A01', anchor: 'ship', z: 1.5, label: 'GULF'},
	{id: 'A05', anchor: 'face', z: 1.35, label: 'ISRAEL'},
	{id: 'A06', anchor: 'face', z: 1.4, label: 'UKRAINE'},
	{id: 'A08', anchor: 'placards', z: 1.3, label: 'FRANCE'},
	{id: 'A11', anchor: 'analyst', z: 1.45, label: 'MARKETS'},
];

const FivePanels: React.FC<{titleAt: number; sweepAt: number}> = ({titleAt, sweepAt}) => {
	const f = useCurrentFrame();
	const W = 292;
	const H = 580;
	const GAP = 22;
	const x0 = (1920 - (W * 5 + GAP * 4)) / 2;
	const y0 = 205; // clear of the top-right marks, above the subtitle band
	const dim = ramp(f, titleAt, titleAt + 8, 1, 0.28);
	const recede = ramp(f, titleAt, titleAt + 14, 1, 0.94);
	// a jolt on "One turbulent week."
	const jolt = f >= sweepAt && f < sweepAt + 14 ? handheld(f, ramp(f, sweepAt, sweepAt + 14, 2.2, 0), 9) : {x: 0, y: 0, r: 0};
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<SpeedLines opacity={ramp(f, 0, 10, 0, 0.07)} inner={420} count={70} />
			<AbsoluteFill style={{transform: `translate(${jolt.x}px, ${jolt.y}px) rotate(${jolt.r}deg) scale(${recede})`, filter: `brightness(${dim}) saturate(${0.6 + 0.4 * dim})`}}>
				{PANELS.map((p, i) => {
					const d = i * 3;
					const enter = interpolate(f, [d, d + 13], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: overshoot});
					const fade = ramp(f, d, d + 5, 0, 1);
					const dir = i % 2 ? -1 : 1;
					const a = anchorOf(p.id, p.anchor);
					const cam = {x: a[0] + drift(f, i, 0.6) * 0.012, y: a[1] + (f / 360) * dir * 0.5, z: p.z + f * 0.0015};
					const sweep = ramp(f, sweepAt + i * 2, sweepAt + i * 2 + 10, -0.4, 1.4);
					const land = ramp(f, d + 8, d + 14, 0.5, 0);
					return (
						<div
							key={p.id}
							style={{
								position: 'absolute',
								left: x0 + i * (W + GAP),
								top: y0 + dir * 150 * (1 - enter),
								width: W,
								height: H,
								opacity: fade,
								outline: `2px solid rgba(229,154,59,${0.3 + 0.4 * fade})`,
								overflow: 'hidden',
							}}
						>
							<Plate assetId={p.id} cam={cam} width={W} height={H} tag="compact" />
							<div style={{position: 'absolute', inset: 0, background: '#fff6e6', opacity: land, mixBlendMode: 'screen'}} />
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `linear-gradient(105deg, rgba(240,190,115,0) ${(sweep - 0.15) * 100}%, rgba(240,190,115,0.36) ${sweep * 100}%, rgba(240,190,115,0) ${(sweep + 0.15) * 100}%)`,
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

const TITLE = 'THE WEEK IN ANIME';

const TitleReveal: React.FC<{f: number}> = ({f}) => {
	const bar = ramp(f, 6, 15, 0, 560, easeOut);
	const sub = ramp(f, 10, 18, 0, 1, easeOut);
	const meta = ramp(f, 16, 24, 0, 1, easeOut);
	const push = 1 + ramp(f, 0, 90, 0, 0.04, (t) => t);
	const glint = ramp(f, 14, 30, -20, 120, (t) => t);
	const ab = ramp(f, 0, 10, 7, 0); // chromatic split on the slam, settling to zero
	const letters = TITLE.split('');
	return (
		<AbsoluteFill>
			<SpeedLines opacity={ramp(f, 0, 6, 0, 0.16) * ramp(f, 30, 60, 1, 0.55)} inner={360} />
			<Embers count={46} seed="te" opacity={ramp(f, 4, 20, 0, 0.75)} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 110, transform: `scale(${push})`}}>
				<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 28, letterSpacing: '0.42em', color: C.amber, opacity: meta, marginBottom: 14}}>
					26 OCT–1 NOV 2026
				</div>
				<div style={{position: 'relative'}}>
					<div style={{display: 'flex', fontFamily: FONT.display, fontWeight: 700, fontSize: 138, lineHeight: 1, letterSpacing: '0.035em', color: C.paper}}>
						{letters.map((ch, i) => {
							const t0 = i * 0.9;
							const p = interpolate(f, [t0, t0 + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: overshoot});
							const o = ramp(f, t0, t0 + 3, 0, 1);
							return (
								<span
									key={i}
									style={{
										display: 'inline-block',
										whiteSpace: 'pre',
										opacity: o,
										transform: `translateY(${(1 - p) * -40}px) scale(${1.9 - 0.9 * p})`,
										textShadow: `${ab}px 0 0 rgba(255,60,60,0.7), ${-ab}px 0 0 rgba(80,200,255,0.6), 6px 6px 0 ${C.ink}`,
									}}
								>
									{ch}
								</span>
							);
						})}
					</div>
					{/* glint travelling across the letters */}
					<div
						aria-hidden
						style={{
							position: 'absolute',
							inset: 0,
							fontFamily: FONT.display,
							fontWeight: 700,
							fontSize: 138,
							lineHeight: 1,
							letterSpacing: '0.035em',
							color: 'transparent',
							backgroundImage: `linear-gradient(110deg, rgba(255,255,255,0) ${glint - 8}%, rgba(255,250,235,0.95) ${glint}%, rgba(255,255,255,0) ${glint + 8}%)`,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							whiteSpace: 'pre',
						}}
					>
						{TITLE}
					</div>
				</div>
				<div style={{width: bar, height: 8, background: C.red, margin: '18px 0 20px', boxShadow: `0 0 ${18 * sub}px rgba(215,38,46,0.8)`}} />
				<div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 56, letterSpacing: `${0.2 + 0.1 * (1 - sub)}em`, color: C.amberSoft, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`}}>
					POWER UNDER PRESSURE
				</div>
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 27, color: C.paper, opacity: 0.85 * meta, marginTop: 26}}>
					Animated illustrations of reported events
				</div>
			</AbsoluteFill>
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
				<Flash at={0} dur={5} strength={0.3} />
				<Flash at={k.c7.s - k.c6.s} dur={6} strength={0.35} />
			</Shot>
		</AbsoluteFill>
	);
};
