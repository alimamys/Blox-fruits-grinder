// Redrawn background plates for animated shots.
//
// In an action shot (someone walks, stands up, grabs, runs...) the still parts of the
// picture are wrapped in <PlateBg id="..."> and the moving characters in <Anim>.
// - normal render: if public/plates/<id>.jpg exists (an image-model redraw of that
//   plate, scripts/images/restyle.py plates) it replaces the code-drawn background,
//   and the animated characters are drawn on top under the same camera;
// - plate-source render (input prop `plate: "<id>"`, scripts/images/plates.mjs): only
//   that plate is drawn, through a fixed wide camera, characters hidden.
// The plate camera frames the stage at zoom 0.9 around its centre, so the image covers
// stage coordinates x -106.7..2026.7, y -60..1140 - room for the shot's own moves.
import React from 'react';
import {getInputProps, staticFile} from 'remotion';
import plateManifest from '../../data/generated/plates.json';

const PLATES = new Set<string>((plateManifest as {plates?: string[]}).plates ?? []);
export const PLATE_ZOOM = 0.9;
export const PLATE_RECT = {x: 960 - 960 / PLATE_ZOOM, y: 540 - 540 / PLATE_ZOOM, w: 1920 / PLATE_ZOOM, h: 1080 / PLATE_ZOOM};

/** The plate being rendered as a source frame, if any. */
export const plateSourceId = (): string | null => (getInputProps() as {plate?: string}).plate ?? null;

export const PlateBg: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
	if ((getInputProps() as {logPlates?: boolean}).logPlates) console.log('P63PLATE ' + id);
	const src = plateSourceId();
	if (src) return src === id ? <>{children}</> : null;
	if (PLATES.has(id)) {
		return <image href={staticFile(`plates/${id}.jpg`)} x={PLATE_RECT.x} y={PLATE_RECT.y} width={PLATE_RECT.w} height={PLATE_RECT.h} preserveAspectRatio="none" />;
	}
	return <>{children}</>;
};

/** Moving characters of an animated shot (hidden while a plate source is rendered). */
export const Anim: React.FC<{children: React.ReactNode}> = ({children}) => (plateSourceId() ? null : <>{children}</>);
