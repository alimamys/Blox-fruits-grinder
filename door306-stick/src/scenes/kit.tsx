// Shorthand for the scene files: shots on a location plate, reused frames, phone screens.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Art, LocRef} from '../data/art';
import {PhoneFrame} from '../components/ui/Phone';
import {Plate, type PlateCam} from '../layout/Plate';
import type {ShotProps, ShotSpec} from '../utils/scene';

type At = string | number;

/** A new generated frame on a location plate (the layout guide), with mannequins as children. */
export const shot = (id: string, at: At, loc: LocRef, art: Omit<Art, 'kind'> & {kind?: Art['kind']}, opts: {cam?: PlateCam; kids?: React.ReactNode; off?: number; frac?: number; overlay?: ShotSpec['overlay']} = {}): ShotSpec => ({
	id,
	at,
	off: opts.off,
	frac: opts.frac,
	render: () => (
		<Plate loc={loc} cam={opts.cam}>
			{opts.kids}
		</Plate>
	),
	overlay: opts.overlay,
	art: {kind: 'still', loc, ...art} as Art,
});

/** A shot drawn on a plain dark stage (close-ups that do not show the location). */
export const close = (id: string, at: At, art: Omit<Art, 'kind'> & {kind?: Art['kind']}, draw: React.ReactNode, opts: {off?: number; frac?: number; overlay?: ShotSpec['overlay']; bg?: string} = {}): ShotSpec => ({
	id,
	at,
	off: opts.off,
	frac: opts.frac,
	render: () => (
		<AbsoluteFill style={{background: opts.bg ?? '#0b0d12'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{draw}
			</svg>
		</AbsoluteFill>
	),
	overlay: opts.overlay,
	art: {kind: 'still', ...art} as Art,
});

/** Show an already generated frame again: new crop, move, drawing or effect - no cost. */
export const again = (id: string, at: At, src: string, art: Partial<Art> = {}, opts: {off?: number; frac?: number; overlay?: ShotSpec['overlay']} = {}): ShotSpec => ({
	id,
	at,
	off: opts.off,
	frac: opts.frac,
	render: () => <AbsoluteFill style={{background: '#0b0d12'}} />,
	overlay: opts.overlay,
	art: {kind: 'reuse', reuse: src, ...art} as Art,
});

/** A code-drawn phone screen. */
export const phone = (id: string, at: At, screen: (p: ShotProps) => React.ReactNode, opts: {off?: number; frac?: number; tilt?: number} = {}): ShotSpec => ({
	id,
	at,
	off: opts.off,
	frac: opts.frac,
	render: (p) => (
		<PhoneFrame f={p.f} d={p.d} tilt={opts.tilt ?? -4}>
			{screen(p)}
		</PhoneFrame>
	),
});

/** Plain code shot. */
export const code = (id: string, at: At, render: (p: ShotProps) => React.ReactNode, opts: {off?: number; frac?: number} = {}): ShotSpec => ({id, at, off: opts.off, frac: opts.frac, render});

/** A move preset: push in toward (x, y). */
export const push = (z0: number, z1: number, x = 0.5, y = 0.5) => ({z0, z1, x0: x, y0: y});
