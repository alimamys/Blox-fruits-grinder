// LAYOUT GUIDES for the image model, built on the location references themselves
// (public/locs/*.jpg, made from references/locations): the camera is a crop/zoom of the real
// location art, and simple mannequins (Person.tsx) mark who stands where. Because the guide
// IS the location, the generated frame keeps the corridor's real geometry.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import type {LocRef} from '../data/art';
import {Svg} from '../utils/scene';

export interface PlateCam {
	/** zoom (1 = the whole reference) */
	z?: number;
	/** centre of the view in reference pixels (1920x1080) */
	cx?: number;
	cy?: number;
}

/** A location reference as the background of a layout, with an SVG layer in the same space. */
export const Plate: React.FC<{loc: LocRef; cam?: PlateCam; dim?: number; tint?: string; flip?: boolean; children?: React.ReactNode}> = ({
	loc,
	cam = {},
	dim = 0,
	tint,
	flip = false,
	children,
}) => {
	const z = cam.z ?? 1;
	const cx = cam.cx ?? 960;
	const cy = cam.cy ?? 540;
	const tx = 960 - cx * z;
	const ty = 540 - cy * z;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})${flip ? ' scaleX(-1) translateX(-1920px)' : ''}`}}>
				<Img src={staticFile(`locs/${loc}.jpg`)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
				{dim > 0 ? <AbsoluteFill style={{background: '#000', opacity: dim}} /> : null}
				{tint ? <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} /> : null}
				<Svg>{children}</Svg>
			</div>
		</AbsoluteFill>
	);
};

/** A plain dark stage for close-ups that do not show the location (mannequin only). */
export const DarkStage: React.FC<{bg?: string; children?: React.ReactNode}> = ({bg = '#0b0d12', children}) => (
	<AbsoluteFill style={{background: bg}}>
		<Svg>{children}</Svg>
	</AbsoluteFill>
);
