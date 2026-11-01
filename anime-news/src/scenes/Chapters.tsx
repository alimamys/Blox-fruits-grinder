/**
 * S02–S07, built shot by shot from the storyboard. Every cut, label and
 * graphic is keyed to narration cue timings (src/generated/timeline.json), so
 * the edit re-times itself when the final narration is recorded.
 */
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {anchorOf, Plate, TempTag} from '../components/Plate';
import {Flash, Handheld, Haze, LightSweep, Motes} from '../components/fx';
import {
	CalendarFlip,
	ChapterStrap,
	ConditionCard,
	DateCard,
	EstimateCard,
	FinalCard,
	HormuzMap,
	MarketTiles,
	NameTag,
	ResultBoard,
	RouteSchematic,
	SeatGraphic,
	SourceTag,
	StatusLabel,
	Tag,
	UkraineInset,
} from '../components/graphics';
import {LedgerShot, NotebookShot, ReceiptShot} from '../components/anime/objects';
import {Cam, camLerp, easeOut, ramp} from '../lib/motion';
import {scene} from '../lib/timeline';

// ------------------------------------------------------------ helpers
const cuesOf = (id: string) => {
	const s = scene(id);
	const m: Record<string, {s: number; e: number; d: number}> = {};
	s.cues.forEach((c) => (m[c.id.slice(4)] = {s: c.startFrame - s.startFrame, e: c.endFrame - s.startFrame, d: c.durationFrames}));
	return {c: m, end: s.durationFrames};
};

const Shot: React.FC<{from: number; to: number; name: string; children: React.ReactNode}> = ({from, to, name, children}) => (
	<Sequence from={from} durationInFrames={Math.max(1, to - from)} name={name} layout="none">
		{children}
	</Sequence>
);

/** One plate seen through a moving, handheld camera, with its placeholder tag. */
const PlateShot: React.FC<{id: string; dur: number; a: Cam; b: Cam; amp?: number; shake?: number; sway?: boolean; dim?: number; blur?: number; grade?: string; linear?: boolean; children?: React.ReactNode}> = ({
	id,
	dur,
	a,
	b,
	amp = 0.5,
	shake = 0,
	sway,
	dim = 0,
	blur = 0,
	grade,
	linear,
	children,
}) => {
	const f = useCurrentFrame();
	const cam = camLerp(f, 0, dur, a, b, linear ? (t) => t : undefined);
	return (
		<AbsoluteFill>
			<Handheld amp={amp} shake={shake} seed={id.charCodeAt(2)}>
				<AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
					<Plate assetId={id} cam={cam} sway={sway} tag="none" />
				</AbsoluteFill>
			</Handheld>
			{grade ? <AbsoluteFill style={{background: grade, mixBlendMode: 'soft-light'}} /> : null}
			{dim ? <AbsoluteFill style={{background: `rgba(4,6,12,${dim})`}} /> : null}
			{children}
			<TempTag id={id} />
		</AbsoluteFill>
	);
};

const ObjShot: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill>
		<Handheld amp={0.6} seed={21}>
			{children}
		</Handheld>
		<TempTag id="A14" />
	</AbsoluteFill>
);

const A = (id: string, name: string, z: number, dx = 0, dy = 0): Cam => {
	const [x, y] = anchorOf(id, name);
	return {x: x + dx, y: y + dy, z};
};

/** Three separately lit groups of desks (works on real chamber art too). */
const GroupLights: React.FC<{stagger?: boolean}> = ({stagger = true}) => {
	const f = useCurrentFrame();
	const groups = ['groupLeft', 'groupCentre', 'groupRight'].map((g) => anchorOf('A15', g));
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
			{groups.map(([x, y], i) => {
				const on = stagger ? ramp(f, 4 + i * 10, 16 + i * 10, 0, 1) : 1;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x * 1920 - 330,
							top: y * 1080 - 190,
							width: 660,
							height: 380,
							borderRadius: '50%',
							background: 'radial-gradient(ellipse at center, rgba(255,200,120,0.55), rgba(255,200,120,0) 70%)',
							opacity: on * (0.85 + 0.15 * Math.sin(f * 0.06 + i * 2)),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// ================================================================ S02
export const S02Full: React.FC = () => {
	const {c, end} = cuesOf('S02');
	const mapAt = c['04'].s + Math.round(c['04'].d * 0.55);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 gulf wide" from={0} to={c['02'].s}>
				<PlateShot id="A01" dur={c['02'].s} a={{x: 0.4, y: 0.5, z: 1.14}} b={{x: 0.57, y: 0.49, z: 1.18}} amp={0.45} sway linear>
					<Haze y={480} h={150} opacity={0.15} speed={0.6} seed={2} />
					<Motes count={30} seed="sg" drift={[-0.3, -0.1]} size={2} color="#f6c271" opacity={0.45} area={[0, 560, 1920, 520]} />
				</PlateShot>
			</Shot>
			<Shot name="V2 Araghchi (silhouette)" from={c['02'].s} to={c['03'].s}>
				<PlateShot id="A03" dur={c['03'].s - c['02'].s} a={A('A03', 'face', 1.25)} b={A('A03', 'face', 1.45)} amp={0.4}>
					<Motes count={50} seed="a3" drift={[0.3, -0.5]} size={3} />
				</PlateShot>
			</Shot>
			<Shot name="V3 corridor" from={c['03'].s} to={c['03'].s + Math.round(c['03'].d * 0.55)}>
				<PlateShot id="A02" dur={Math.round(c['03'].d * 0.55)} a={A('A02', 'corridor', 1.6)} b={A('A02', 'corridor', 2.1)} amp={0.4}>
					<Motes count={60} seed="a2" drift={[0.1, -0.2]} size={2.4} color="#ffd59a" />
				</PlateShot>
			</Shot>
			<Shot name="V3 table + folder" from={c['03'].s + Math.round(c['03'].d * 0.55)} to={c['04'].s}>
				<PlateShot id="A02" dur={c['04'].s - c['03'].s - Math.round(c['03'].d * 0.55)} a={{x: 0.62, y: 0.55, z: 1.25}} b={A('A02', 'folder', 1.55)} amp={0.4} />
			</Shot>
			<Shot name="foreign minister (silhouette)" from={c['04'].s} to={mapAt}>
				<PlateShot id="A03" dur={mapAt - c['04'].s} a={A('A03', 'face', 1.15)} b={A('A03', 'face', 1.3)} amp={0.35} />
			</Shot>
			<Shot name="V4-V5 Hormuz map + condition" from={mapAt} to={c['06'].s}>
				<PlateShot id="A01" dur={c['06'].s - mapAt} a={{x: 0.5, y: 0.5, z: 1.05}} b={{x: 0.55, y: 0.5, z: 1.1}} amp={0.3} dim={0.45} blur={3} sway />
			</Shot>
			<Shot name="V6 folder, unopened" from={c['06'].s} to={c['07'].s}>
				<PlateShot id="A02" dur={c['07'].s - c['06'].s} a={A('A02', 'folder', 2.0)} b={A('A02', 'folder', 2.25)} amp={0.35} />
			</Shot>
			<Shot name="shipping route" from={c['07'].s} to={c['08'].s}>
				<PlateShot id="A01" dur={c['08'].s - c['07'].s} a={A('A01', 'ship', 1.7, -0.04)} b={A('A01', 'ship', 1.85, 0.02)} amp={0.4} sway />
			</Shot>
			<Shot name="V7 desk lamp → match cut" from={c['08'].s} to={end}>
				<PlateShot id="A02" dur={end - c['08'].s} a={A('A02', 'lamp', 1.4)} b={A('A02', 'lamp', 3.0)} amp={0.3} />
				<LampBloom dur={end - c['08'].s} />
			</Shot>
			{/* graphics */}
			<Tag text="DOHA • 1 NOV 2026" from={c['02'].s} to={c['03'].s} />
			<NameTag name="ABBAS ARAGHCHI" role="Iran’s foreign minister" from={c['02'].s + 16} to={c['03'].s} />
			<Tag text="SYMBOLIC STAGING" from={c['03'].s + 6} to={c['04'].s} top={1080 - 230 - 40} />
			<NameTag name="ABBAS ARAGHCHI" role="Iran’s foreign minister" from={c['04'].s + 6} to={mapAt} />
			<HormuzMap from={mapAt} to={c['06'].s} dim={1} />
			<ConditionCard from={c['05'].s} numberAt={c['05'].s + 18} to={c['06'].s} />
			<StatusLabel text="TALKS CONTINUING" from={c['06'].s + 20} to={c['08'].s} />
			<SourceTag text="Reuters / AP • 1 NOV" from={c['08'].s + 10} to={end - 6} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="02" title="THE GULF: A PROPOSAL, NOT A DEAL" />
			</Sequence>
		</AbsoluteFill>
	);
};

/** Amber lamp glow swelling at the end of S02 (match cut into S03's light). */
const LampBloom: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const o = ramp(f, dur - 26, dur, 0, 0.9, easeOut);
	return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,236,190,1) 0%, rgba(255,190,110,0.8) 22%, rgba(255,150,60,0) 60%)', opacity: o, mixBlendMode: 'screen'}} />;
};

// ================================================================ S03
export const S03Israel: React.FC = () => {
	const {c, end} = cuesOf('S03');
	const portraitAt = c['01'].s + Math.round(c['01'].d * 0.5);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 Knesset exterior" from={0} to={portraitAt}>
				<PlateShot id="A04" dur={portraitAt} a={{x: 0.5, y: 0.42, z: 1.35}} b={A('A04', 'building', 1.12)} amp={0.35} />
				<Flash at={0} dur={10} color="#ffe9c0" strength={0.6} />
			</Shot>
			<Shot name="portrait (silhouette)" from={portraitAt} to={c['02'].s}>
				<PlateShot id="A05" dur={c['02'].s - portraitAt} a={A('A05', 'face', 1.2)} b={A('A05', 'face', 1.35)} amp={0.35} />
			</Shot>
			<Shot name="V2-V5 chamber + seats" from={c['02'].s} to={c['07'].s}>
				<PlateShot id="A15" dur={c['07'].s - c['02'].s} a={{x: 0.5, y: 0.45, z: 1.08}} b={{x: 0.5, y: 0.47, z: 1.16}} amp={0.25} dim={0.5} blur={4} />
			</Shot>
			<Shot name="V6 portrait + coalition label" from={c['07'].s} to={c['08'].s}>
				<PlateShot id="A05" dur={c['08'].s - c['07'].s} a={A('A05', 'face', 1.1)} b={A('A05', 'face', 1.3)} amp={0.3}>
					<Motes count={40} seed="cn" drift={[0.3, -0.4]} size={3} />
				</PlateShot>
			</Shot>
			<Shot name="19 seats, separate" from={c['08'].s} to={c['09'].s}>
				<PlateShot id="A15" dur={c['09'].s - c['08'].s} a={{x: 0.5, y: 0.46, z: 1.12}} b={{x: 0.5, y: 0.46, z: 1.18}} amp={0.25} dim={0.5} blur={4} />
			</Shot>
			<Shot name="V7 three separate groups" from={c['09'].s} to={end}>
				<PlateShot id="A15" dur={end - c['09'].s} a={{x: 0.5, y: 0.3, z: 1.4}} b={{x: 0.5, y: 0.34, z: 1.2}} amp={0.3}>
					<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(4,3,6,0.75) 78%)'}} />
					<GroupLights />
					<Motes count={60} seed="gl" drift={[0.1, -0.2]} size={2.4} color="#ffd59a" />
				</PlateShot>
			</Shot>
			<Tag text="ISRAEL • RESULTS RELEASED 30 OCT" from={c['01'].s} to={c['05'].s} />
			<SeatGraphic reveal={[c['02'].e, c['03'].e, c['04'].e]} barsAt={c['05'].s} totalAt={c['06'].s + 10} to={c['07'].s} />
			<StatusLabel text="COALITION NEGOTIATIONS" from={c['07'].s + 8} to={c['08'].s} />
			<SeatGraphic reveal={[c['08'].s, c['08'].s, c['08'].s]} barsAt={c['08'].s - 14} totalAt={c['08'].s - 14} highlightFrom={c['08'].s + 10} highlightTo={c['09'].s} to={c['09'].s} />
			<SourceTag text="AP / The Times of Israel" from={c['09'].s + 10} to={end - 6} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="03" title="ISRAEL: THE ARITHMETIC OF POWER" />
			</Sequence>
		</AbsoluteFill>
	);
};

// ================================================================ S04
const COLD = 'rgba(120,150,200,0.55)';
export const S04Ukraine: React.FC = () => {
	const {c, end} = cuesOf('S04');
	const teaAt = c['02'].s + Math.round(c['02'].d * 0.6);
	const boxesAt = c['05'].s + Math.round(c['05'].d * 0.55);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 bus window (cold morning)" from={0} to={c['02'].s}>
				<PlateShot id="A06" dur={c['02'].s} a={A('A06', 'window', 1.7, -0.14, 0.02)} b={A('A06', 'window', 1.8, -0.08)} amp={0.7} shake={2.5} sway grade={COLD} />
			</Shot>
			<Shot name="V2 buses arrive" from={c['02'].s} to={teaAt}>
				<PlateShot id="A07" dur={teaAt - c['02'].s} a={A('A07', 'buses', 1.5, -0.04)} b={A('A07', 'buses', 1.4, 0.02)} amp={0.45} grade={COLD} />
			</Shot>
			<Shot name="V2 volunteers, tea" from={teaAt} to={c['04'].s}>
				<PlateShot id="A07" dur={c['04'].s - teaAt} a={A('A07', 'tea', 2.0)} b={A('A07', 'tea', 2.2, 0.02)} amp={0.45} grade={COLD} />
			</Shot>
			<Shot name="V3 schematic route" from={c['04'].s} to={boxesAt}>
				<PlateShot id="A06" dur={boxesAt - c['04'].s} a={{x: 0.6, y: 0.4, z: 1.2}} b={{x: 0.64, y: 0.4, z: 1.25}} amp={0.4} shake={1.5} dim={0.55} blur={5} grade={COLD} />
			</Shot>
			<Shot name="V4 aid boxes, unbranded" from={boxesAt} to={c['06'].s}>
				<PlateShot id="A07" dur={c['06'].s - boxesAt} a={A('A07', 'boxes', 2.6)} b={A('A07', 'boxes', 2.9)} amp={0.4} grade={COLD} />
			</Shot>
			<Shot name="V5 truce date card" from={c['06'].s} to={c['07'].s}>
				<PlateShot id="A07" dur={c['07'].s - c['06'].s} a={{x: 0.5, y: 0.45, z: 1.05}} b={{x: 0.5, y: 0.45, z: 1.1}} amp={0.3} dim={0.55} blur={5} grade={COLD} />
			</Shot>
			<Shot name="V6 local inset" from={c['07'].s} to={c['09'].s}>
				<PlateShot id="A06" dur={c['09'].s - c['07'].s} a={{x: 0.7, y: 0.4, z: 1.3}} b={{x: 0.72, y: 0.4, z: 1.35}} amp={0.3} shake={1.5} dim={0.5} blur={5} grade={COLD} />
			</Shot>
			<Shot name="V7 reunion (illustrative)" from={c['09'].s} to={end}>
				<PlateShot id="A07" dur={end - c['09'].s} a={A('A07', 'embrace', 1.35, 0.02, 0.02)} b={A('A07', 'embrace', 1.85, 0, -0.02)} amp={0.3} linear>
					<LightSweep period={160} color="255,220,170" strength={0.12} />
					<Motes count={40} seed="ru" drift={[0.05, -0.15]} size={2.6} color="#fff2dc" opacity={0.5} />
				</PlateShot>
			</Shot>
			<Tag text="OLESHKY EVACUEES • ARRIVALS 31 OCT" from={c['02'].s} to={c['04'].s} />
			<RouteSchematic from={c['04'].s + 4} to={boxesAt} />
			<DateCard title="LOCAL TRUCE" lines={['BEGAN 27 OCT', 'SCHEDULED END 1 NOV EVENING']} from={c['06'].s + 2} to={c['07'].s} />
			<UkraineInset from={c['07'].s + 2} to={c['09'].s} />
			<Tag text="ILLUSTRATIVE SCENE" from={c['09'].s + 6} to={end - 6} />
			<SourceTag text="Reuters / AP • 31 OCT" from={c['10'].s} to={end - 6} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="04" title="UKRAINE: A NARROW OPENING" />
			</Sequence>
		</AbsoluteFill>
	);
};

// ================================================================ S05
export const S05France: React.FC = () => {
	const {c, end} = cuesOf('S05');
	const noteAt = c['03'].s + Math.round(c['03'].d * 0.5);
	const policeEnd = c['07'].s + Math.round(c['07'].d * 0.8);
	const broadAt = c['08'].s + Math.round(c['08'].d * 0.5);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 peaceful march, wide" from={0} to={c['03'].s}>
				<PlateShot id="A08" dur={c['03'].s} a={{x: 0.5, y: 0.5, z: 1.05}} b={A('A08', 'crowd', 1.25)} amp={0.45} />
			</Shot>
			<Shot name="V2 receipt (no prices)" from={c['03'].s} to={noteAt}>
				<ObjShot>
					<ReceiptShot />
				</ObjShot>
			</Shot>
			<Shot name="V2 student notebook" from={noteAt} to={c['04'].s}>
				<ObjShot>
					<NotebookShot />
				</ObjShot>
			</Shot>
			<Shot name="V3 march + estimate" from={c['04'].s} to={c['06'].s}>
				<PlateShot id="A08" dur={c['06'].s - c['04'].s} a={A('A08', 'placards', 1.3, 0.08)} b={A('A08', 'placards', 1.4, 0.12)} amp={0.45} />
			</Shot>
			<Shot name="V4 calm crowd, wide hold" from={c['06'].s} to={c['07'].s}>
				<PlateShot id="A08" dur={c['07'].s - c['06'].s} a={{x: 0.5, y: 0.55, z: 1.08}} b={{x: 0.5, y: 0.55, z: 1.03}} amp={0.3} />
			</Shot>
			<Shot name="V5 distant police lights (separate scene)" from={c['07'].s} to={policeEnd}>
				<PlateShot id="A09" dur={policeEnd - c['07'].s} a={A('A09', 'lights', 1.3)} b={A('A09', 'lights', 1.5)} amp={0.6} />
			</Shot>
			<Shot name="V6 peaceful group" from={policeEnd} to={broadAt}>
				<PlateShot id="A08" dur={broadAt - policeEnd} a={A('A08', 'crowd', 1.6, -0.1, 0.05)} b={A('A08', 'crowd', 1.7, -0.06, 0.05)} amp={0.45} />
			</Shot>
			<Shot name="V6 broad street" from={broadAt} to={c['10'].s}>
				<PlateShot id="A08" dur={c['10'].s - broadAt} a={{x: 0.5, y: 0.45, z: 1.15}} b={{x: 0.5, y: 0.45, z: 1.02}} amp={0.35} />
			</Shot>
			<Shot name="V7 red crossing signal → match cut" from={c['10'].s} to={end}>
				<PlateShot id="A08" dur={end - c['10'].s} a={A('A08', 'signal', 2.4)} b={A('A08', 'signal', 3.4)} amp={0.3} />
			</Shot>
			<EstimateCard from={c['04'].s + 4} extraAt={c['05'].s} to={c['06'].s} />
			<SourceTag text="AFP / AP • 31 OCT" from={c['08'].s + 10} to={c['10'].s} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="05" title="FRANCE: PRESSURE IN THE STREETS" />
			</Sequence>
		</AbsoluteFill>
	);
};

// ================================================================ S06
export const S06Markets: React.FC = () => {
	const {c, end} = cuesOf('S06');
	const ledgerAt = c['05'].s + Math.round(c['05'].d * 0.55);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 analyst, blank monitors" from={0} to={c['02'].s}>
				<PlateShot id="A11" dur={c['02'].s} a={{x: 0.55, y: 0.5, z: 1.25}} b={{x: 0.5, y: 0.48, z: 1.12}} amp={0.35} />
				<Flash at={0} dur={8} color="#ff5a4a" strength={0.35} />
			</Shot>
			<Shot name="V2-V4 analyst + daily figures" from={c['02'].s} to={c['05'].s}>
				<PlateShot id="A11" dur={c['05'].s - c['02'].s} a={A('A11', 'analyst', 1.3, 0.05)} b={A('A11', 'analyst', 1.42, 0.06)} amp={0.35} dim={0.25} />
			</Shot>
			<Shot name="V5 server corridor" from={c['05'].s} to={ledgerAt}>
				<PlateShot id="A10" dur={ledgerAt - c['05'].s} a={{x: 0.5, y: 0.5, z: 1.05}} b={{x: 0.5, y: 0.5, z: 1.5}} amp={0.3} />
			</Shot>
			<Shot name="V5 expense ledger (no figures)" from={ledgerAt} to={c['06'].s}>
				<ObjShot>
					<LedgerShot />
				</ObjShot>
			</Shot>
			<Shot name="V6 push toward the reflection" from={c['06'].s} to={c['08'].s}>
				<PlateShot id="A11" dur={c['08'].s - c['06'].s} a={A('A11', 'reflection', 1.6)} b={A('A11', 'reflection', 2.4)} amp={0.3} linear />
			</Shot>
			<Shot name="V7 hold the two figures" from={c['08'].s} to={end}>
				<PlateShot id="A11" dur={end - c['08'].s} a={{x: 0.45, y: 0.5, z: 1.2}} b={{x: 0.42, y: 0.5, z: 1.3}} amp={0.3} dim={0.35} />
			</Shot>
			<Tag text="US MARKETS • 30 OCT 2026 • DAILY CHANGE" from={c['02'].s} to={c['05'].s} />
			<MarketTiles spAt={c['02'].e} ndAt={c['03'].e} to={c['05'].s} />
			<MarketTiles spAt={c['08'].s} ndAt={c['08'].s + 6} />
			<SourceTag text="Reuters / AP • 30 OCT" from={c['09'].s} to={end - 6} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="06" title="MARKETS: THE COST OF THE AI RACE" />
			</Sequence>
		</AbsoluteFill>
	);
};

// ================================================================ S07
export const S07Ahead: React.FC = () => {
	const {c} = cuesOf('S07');
	const pollAt = c['02'].s + Math.round(c['02'].d * 0.62);
	const groupsAt = c['05'].s + Math.round(c['05'].d * 0.45);
	const black = c['08'].e + 16;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot name="V1 calendar 1 → 3 NOV" from={0} to={c['02'].s}>
				<PlateShot id="A13" dur={c['02'].s} a={{x: 0.5, y: 0.5, z: 1.1}} b={{x: 0.5, y: 0.5, z: 1.15}} amp={0.3} dim={0.5} blur={6} />
			</Shot>
			<Shot name="V2 US Capitol" from={c['02'].s} to={pollAt}>
				<PlateShot id="A12" dur={pollAt - c['02'].s} a={{x: 0.5, y: 0.5, z: 1.12}} b={A('A12', 'dome', 1.3)} amp={0.35} />
			</Shot>
			<Shot name="V2 polling place" from={pollAt} to={c['04'].s}>
				<PlateShot id="A13" dur={c['04'].s - pollAt} a={{x: 0.45, y: 0.55, z: 1.15}} b={{x: 0.5, y: 0.55, z: 1.2}} amp={0.35} />
			</Shot>
			<Shot name="V3 blank result board" from={c['04'].s} to={c['05'].s}>
				<PlateShot id="A12" dur={c['05'].s - c['04'].s} a={{x: 0.5, y: 0.45, z: 1.1}} b={{x: 0.5, y: 0.45, z: 1.15}} amp={0.3} dim={0.55} blur={5} />
			</Shot>
			<Shot name="V4 callback: unsigned folder" from={c['05'].s} to={groupsAt}>
				<PlateShot id="A02" dur={groupsAt - c['05'].s} a={A('A02', 'folder', 2.0)} b={A('A02', 'folder', 2.15)} amp={0.3} />
			</Shot>
			<Shot name="V4 callback: separate groups" from={groupsAt} to={c['06'].s}>
				<PlateShot id="A15" dur={c['06'].s - groupsAt} a={{x: 0.5, y: 0.42, z: 1.15}} b={{x: 0.5, y: 0.42, z: 1.1}} amp={0.3}>
					<GroupLights stagger={false} />
				</PlateShot>
			</Shot>
			<Shot name="polling place" from={c['06'].s} to={c['08'].s}>
				<PlateShot id="A13" dur={c['08'].s - c['06'].s} a={{x: 0.5, y: 0.5, z: 1.05}} b={A('A13', 'door', 1.25)} amp={0.3} />
			</Shot>
			<Shot name="V5 toward the unopened door" from={c['08'].s} to={black}>
				<PlateShot id="A13" dur={black - c['08'].s} a={A('A13', 'door', 1.3)} b={A('A13', 'door', 2.2)} amp={0.25} linear />
			</Shot>
			<Tag text="LOOKING AHEAD" from={c['01'].s} to={c['02'].s} />
			<CalendarFlip from={0} flipAt={c['01'].s + 14} to={c['02'].s} />
			<Tag text="3 NOV 2026 • CONTROL OF CONGRESS" from={c['02'].s} to={c['04'].s} />
			<ResultBoard from={c['04'].s + 2} to={c['05'].s} />
			<FinalCard from={black} />
			<SourceTag text="FEC / AP" from={c['07'].s} to={black} />
			<Sequence durationInFrames={80} layout="none">
				<ChapterStrap n="07" title="NEXT WEEK: THE VOTE AHEAD" />
			</Sequence>
		</AbsoluteFill>
	);
};

export const BUILT_CHAPTERS: Record<string, React.FC> = {
	S02: S02Full,
	S03: S03Israel,
	S04: S04Ukraine,
	S05: S05France,
	S06: S06Markets,
	S07: S07Ahead,
};

