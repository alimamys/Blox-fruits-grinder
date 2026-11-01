import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, Cam} from '../lib/motion';
import {media, registry} from '../lib/timeline';
import {C, FONT, SAFE} from '../lib/theme';
import {genericPlate, PLACEHOLDERS} from './placeholders';

type Props = {
	assetId: string;
	cam: Cam;
	/** container size in px (defaults to full frame) */
	width?: number;
	height?: number;
	/** optional variant suffix, e.g. "blink" → <key>.blink.png (ignored if not supplied) */
	variant?: string;
	/** placeholder label style */
	tag?: 'full' | 'compact' | 'none';
	/** gentle horizontal sway on near layers (water, smoke) */
	sway?: boolean;
	/** horizon for the shimmer on flattened real art (0-1); omit for none */
	waterHorizon?: number;
	style?: React.CSSProperties;
};

export const anchorOf = (assetId: string, name: string): number[] => {
	const a = registry.assets.find((x) => x.id === assetId);
	const anchors = (a?.anchors ?? {}) as Record<string, number[]>;
	return anchors[name] ?? [0.5, 0.5];
};

/**
 * One illustration "plate" seen through a virtual camera.
 * Uses the supplied artwork (layered if layer files exist) and otherwise a
 * clearly-labelled code placeholder with the same composition.
 */
export const Plate: React.FC<Props> = ({assetId, cam, width = 1920, height = 1080, variant, tag = 'full', sway, waterHorizon, style}) => {
	const frame = useCurrentFrame();
	const status = media.assets[assetId];
	const reg = registry.assets.find((a) => a.id === assetId)!;
	const isPlaceholder = !status?.file;

	// cover-fit a 16:9 canvas into the container, then apply the camera
	const s0 = Math.max(width / 1920, height / 1080);
	const CW = 1920 * s0;
	const CH = 1080 * s0;
	const z = Math.max(1, cam.z);
	const vw = width / (CW * z);
	const vh = height / (CH * z);
	const left = clamp(cam.x - vw / 2, 0, 1 - vw);
	const top = clamp(cam.y - vh / 2, 0, 1 - vh);

	type L = {depth: number; content: React.ReactNode};
	let layers: L[];
	const variantFile = variant ? status?.variants?.[variant] : undefined;
	if (!isPlaceholder && variantFile) {
		layers = [{depth: 0.5, content: <Img src={staticFile(variantFile)} style={imgStyle} />}];
	} else if (!isPlaceholder && status.layers.length >= 2) {
		layers = [...status.layers]
			.sort((a, b) => a.depth - b.depth)
			.map((l) => ({depth: l.depth, content: <Img src={staticFile(l.file)} style={imgStyle} />}));
	} else if (!isPlaceholder) {
		layers = [{depth: 0.5, content: <Img src={staticFile(status.file!)} style={imgStyle} />}];
	} else {
		const spec = PLACEHOLDERS[assetId] ?? genericPlate(assetId, reg.key);
		layers = spec.map((l) => ({depth: l.depth, content: l.node(frame)}));
	}
	const multi = layers.length > 1;

	return (
		<div style={{position: 'absolute', width, height, overflow: 'hidden', background: C.ink, ...style}}>
			<div
				style={{
					position: 'absolute',
					width: CW,
					height: CH,
					transformOrigin: '0 0',
					transform: `translate(${-left * CW * z}px, ${-top * CH * z}px) scale(${z})`,
				}}
			>
				{layers.map((l, i) => {
					// restrained parallax: near layers travel further than far ones
					const k = l.depth - 0.4;
					const dx = multi ? -(cam.x - 0.5) * CW * 0.05 * k + (sway && l.depth >= 0.6 ? Math.sin(frame * 0.045 + i) * 5 : 0) : 0;
					const dy = multi ? -(cam.y - 0.5) * CH * 0.03 * k : 0;
					const sc = multi ? 1 + 0.05 * Math.abs(k) : 1;
					return (
						<div key={i} style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${sc})`}}>
							{l.content}
						</div>
					);
				})}
				{!isPlaceholder && !multi && waterHorizon !== undefined ? (
					<WaterShimmer file={status.file!} horizon={waterHorizon} frame={frame} id={`${assetId}-${width}`} />
				) : null}
			</div>
			{isPlaceholder && tag !== 'none' ? <PlaceholderTag id={assetId} file={reg.file} compact={tag === 'compact'} /> : null}
		</div>
	);
};

const imgStyle: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};

/** Two-speed displacement shimmer on the water band of a flattened illustration. */
const WaterShimmer: React.FC<{file: string; horizon: number; frame: number; id: string}> = ({file, horizon, frame, id}) => {
	const fid = `water-${id}`;
	return (
		<>
			<svg width="0" height="0" style={{position: 'absolute'}}>
				<filter id={fid}>
					<feTurbulence type="fractalNoise" baseFrequency={`0.004 ${0.05 + 0.004 * Math.sin(frame * 0.07)}`} numOctaves={2} seed={Math.floor(frame / 2) % 50} />
					<feDisplacementMap in="SourceGraphic" scale={10} />
				</filter>
			</svg>
			<Img
				src={staticFile(file)}
				style={{...imgStyle, filter: `url(#${fid})`, clipPath: `inset(${(horizon * 100).toFixed(1)}% 0 0 0)`, opacity: 0.85}}
			/>
		</>
	);
};

/** Screen-space placeholder label; renders nothing once the real file is supplied. */
export const TempTag: React.FC<{id: string}> = ({id}) => {
	if (media.assets[id]?.file) return null;
	const reg = registry.assets.find((a) => a.id === id)!;
	return <PlaceholderTag id={id} file={reg.file} compact={false} />;
};

const PlaceholderTag: React.FC<{id: string; file: string; compact: boolean}> = ({id, file, compact}) =>
	compact ? (
		<div style={{position: 'absolute', left: 10, top: 10, ...tagBox, fontSize: 14, padding: '3px 7px'}}>{id} TEMP</div>
	) : (
		<div style={{position: 'absolute', left: SAFE.x, top: SAFE.top, ...tagBox}}>
			PLACEHOLDER ART · {id} · public/assets/{file}
		</div>
	);

const tagBox: React.CSSProperties = {
	fontFamily: FONT.mono,
	fontWeight: 500,
	fontSize: 15,
	color: 'rgba(255,255,255,0.88)',
	background: 'rgba(0,0,0,0.5)',
	borderLeft: `4px solid ${C.tempFlag}`,
	padding: '6px 12px',
	letterSpacing: '0.02em',
};
