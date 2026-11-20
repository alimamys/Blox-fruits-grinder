// Shared set-ups of the stick "Frame 240": Mara at her desk (seen from the monitor or from the side), the man in
// the doorway behind her, Mara in the hallway, Mara in the closet; and the screen shots (editor, full picture).
import React from 'react';
import {Mara} from '../components/characters/Cast';
import type {StickProps} from '../components/characters/StickPerson';
import {EditorShot} from '../components/ui/Editor';
import {FullPicture, type PicId} from '../layout/pictures';
import {DeskFront, Glow, OfficeChair, Rain, TallMan} from '../stick/f240';
import {Person} from '../stick/goat';
import {GEO, perspS} from '../stick/kit';

export const DESK_Y = 905;
/** Mara behind her desk, seen from the monitor (room_front_night) */
export const MF = {x: 860, y: 1150, s: 2.25};
/** Mara at the side of her desk (room_side_night) */
export const MS = {x: 600, y: 1045, s: 2.05};
/** Mara on the closet floor */
export const MC = {x: 760, y: 1040, s: 2.0};

type MaraP = Partial<StickProps>;

/** Mara in her chair behind the desk, lit by the screen; the man can stand in the doorway behind her. */
export const AtDesk: React.FC<{f: number; m?: MaraP; glow?: number; man?: {k: number; s?: number; look?: 'dark' | 'white' | 'ghost'} | null; children?: React.ReactNode; empty?: boolean; phone?: boolean; wash?: number}> = ({f, m = {}, glow = 1, man = null, children, empty = false, phone = true, wash = 0}) => {
	const drain = washCss(wash);
	const D = GEO.front.farDoor;
	return (
		<g>
			{wash < 0.6 ? <Rain box={[118, 68, 628, 655]} frame={f} opacity={0.55 * (1 - wash / 0.6)} /> : null}
			{man ? (
				<g opacity={man.k}>
					<defs>
						<clipPath id="doorway">
							<rect x={GEO.front.door[0]} y={GEO.front.door[1]} width={GEO.front.door[2] - GEO.front.door[0]} height={GEO.front.door[3] - GEO.front.door[1]} />
						</clipPath>
					</defs>
					<g clipPath="url(#doorway)">
						<TallMan x={(D[0] + D[2]) / 2} y={D[3]} s={man.s ?? 1.45} frame={f} look={man.look ?? 'dark'} name="man" />
					</g>
				</g>
			) : null}
			{children}
			{empty ? null : (
				<g>
					<Glow cx={MF.x} cy={MF.y - 470} r={520} color="#9fc4ff" k={0.55 * glow} />
					<g style={{filter: drain}}>
						<OfficeChair x={MF.x} y={MF.y} s={MF.s} frame={f} view="front" />
					</g>
					<Person is={Mara} name="mara" x={MF.x} y={MF.y} s={MF.s} pose="sit" frame={f} arms={{l: [28, -64], r: [28, -64]}} light="screen" {...m} />
				</g>
			)}
			<g style={{filter: drain}}>
				<DeskFront y={DESK_Y} frame={f} glow={glow * (1 - wash)} phone={phone} />
			</g>
		</g>
	);
};

/** the same colour drain as a plate's wash, as a CSS filter for code-drawn furniture */
export const washCss = (w: number) => {
	const d = Math.max(0, Math.min(1, w / 0.5));
	const l = Math.max(0, Math.min(1, (w - 0.4) / 0.6));
	return w > 0 ? `saturate(${1 - 0.95 * d}) brightness(${1 + 1.6 * d + 0.6 * l}) contrast(${1 - 0.5 * d})` : undefined;
};

/** feet height + scale for someone in the perspective hallway, k 0 (near, off the bottom) .. 1 (at the bedroom door) */
export const hallPos = (k: number) => {
	const y = 1230 - k * 400;
	return {y, s: perspS(y)};
};

/** the editor full-screen (the code UI from the original film, with the stick picture inside) */
export const ed = (picture: PicId, frame: number, extra: Partial<React.ComponentProps<typeof EditorShot>> = {}) => (f: number, d: number) => <EditorShot f={f} d={d} picture={picture} frame={frame} total={240} {...extra} />;
/** one picture full-screen */
export const full = (id: PicId, z: [number, number] = [1, 1.08], focus: [number, number] = [0.5, 0.5]) => (f: number, d: number) => <FullPicture id={id} f={f} d={d} z={z} focus={focus} />;

/** ease 0..1 through a shot */
export const prog = (f: number, d: number, a = 0, b = 1) => {
	const t = Math.min(1, Math.max(0, (f / Math.max(1, d - 1) - a) / Math.max(0.001, b - a)));
	return t * t * (3 - 2 * t);
};

export type {MaraP};
