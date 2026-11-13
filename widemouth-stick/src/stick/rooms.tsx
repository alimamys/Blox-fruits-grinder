// Recurring set-ups: the bedroom (Eli in bed, Mr. Widemouth under it), people in a room.
import React from 'react';
import {Eli, Leo} from '../components/characters/Cast';
import {Widemouth, type WidemouthProps} from '../components/characters/Widemouth';
import type {StickProps} from '../components/characters/StickPerson';
import {BEDS, Clip, holePath, INK, lapBlanket, lyingBlanket, Quilt, SkirtHem, SkirtHole, Tint, type BedGeo, type Light} from './kit';

export const KID_S = 1.9;
export const ADULT_S = 1.85;
export const WM_S = 0.9;

type KidProps = Omit<StickProps, 'palette'> & {palette?: StickProps['palette']};
export type InBed =
	| {mode: 'sit'; p?: Partial<KidProps>}
	| {mode: 'lie'; p?: Partial<KidProps>; blanketWob?: number}
	| {mode: 'hide'; shiver?: number}
	| {mode: 'none'};

/** Mr. Widemouth's state in a bedroom: `under` 0 = standing out in the room, 1 = crouched under the bed (seen only through the gap). */
export type WMIn = Partial<WidemouthProps> & {x: number; y?: number; under?: number; dark?: number; show?: boolean};

/** Eli (or Leo) sitting up in bed: he rises out of the painted quilt (cut along its top edge, so the plate's own
 *  quilt covers him from the waist down), hands resting on it, a soft shadow where he meets it. */
export const SitInBed: React.FC<{b: BedGeo; light: Light; frame: number; p?: Partial<KidProps>; id: string; who?: 'eli' | 'leo'}> = ({b, light, frame, p = {}, id, who = 'eli'}) => {
	const x = (b.pillow[0] + b.pillow[1]) / 2 + 22;
	const y = b.quilt + 100;
	const Kid = who === 'leo' ? Leo : Eli;
	return (
		<g>
			<ellipse cx={x} cy={b.edge + 3} rx={58} ry={8} fill="#000" opacity={0.22} />
			<Clip id={`${id}_waist`} d={`M0,0 H1920 V${b.edge + 1} H0 Z`} />
			<g clipPath={`url(#${id}_waist)`}>
				<Tint light={light}>
					<Kid x={x} y={y} s={KID_S} frame={frame} pose="sit" arms={{l: [25, -96], r: [25, -96]}} {...p} />
				</Tint>
			</g>
		</g>
	);
};

/** Lying in bed, head on the pillow, the blanket up to his chin. */
export const LieInBed: React.FC<{b: BedGeo; light: Light; frame: number; p?: Partial<KidProps>; id: string; wob?: number; who?: 'eli' | 'leo'}> = ({b, light, frame, p = {}, id, wob: w = 0, who = 'eli'}) => {
	const hx = (b.pillow[0] + b.pillow[1]) / 2 + 6;
	const hy = b.quilt - 34;
	const Kid = who === 'leo' ? Leo : Eli;
	const headUp = 262 * 0.62 * KID_S; // feet -> head centre
	return (
		<g>
			<Clip id={`${id}_chin`} d={`M0,0 H1920 V${hy + 44} H0 Z`} />
			<g clipPath={`url(#${id}_chin)`}>
				<Tint light={light}>
					<Kid x={hx} y={hy + headUp} s={KID_S} frame={frame} tilt={-12} arms="down" {...p} />
				</Tint>
			</g>
			<Tint light={light}>
				<Quilt id={`${id}_q`} cols={b.quiltCols} d={lyingBlanket(b, hx + 70, b.x1 - 40, w)} />
			</Tint>
		</g>
	);
};

/** Blanket pulled over his head: a trembling lump. */
export const HideInBed: React.FC<{b: BedGeo; light: Light; shiver?: number; frame: number; id: string}> = ({b, light, shiver = 1, frame, id}) => {
	const hx = (b.pillow[0] + b.pillow[1]) / 2;
	const j = Math.sin(frame * 2.1) * 2.5 * shiver;
	const top = b.quilt - 80 + j;
	const d = `M${b.x0 + 4},${b.skirtTop} L${b.x0 + 6},${top + 40} C${hx - 60},${top - 10} ${hx + 40},${top - 20} ${hx + 120},${top + 30} C${hx + 220},${top + 40} ${b.x1 - 160},${top + 26} ${b.x1 - 40},${top + 44} C${b.x1 - 10},${top + 50} ${b.x1},${top + 70} ${b.x1 + 2},${b.skirtTop} Z`;
	return (
		<Tint light={light}>
			<Quilt id={`${id}_q`} cols={b.quiltCols} d={d} />
		</Tint>
	);
};

/** The whole bed corner of a bedroom: Mr. Widemouth (under or out), the skirt gap, Eli in bed. */
export const BedScene: React.FC<{
	set: 'bedroom_night' | 'bedroom_day' | 'leoroom_day';
	light: Light;
	frame: number;
	bed: InBed;
	wm?: WMIn;
	skirt?: {cx: number; h: number; w?: number};
	behind?: React.ReactNode;
	front?: React.ReactNode;
	id?: string;
	who?: 'eli' | 'leo';
}> = ({set, light, frame, bed, wm, skirt, behind, front, id = 'bs', who = 'eli'}) => {
	const b = BEDS[set];
	const sk = skirt ?? {cx: 665, h: 0};
	const w = sk.w ?? 210;
	const under = wm?.under ?? 0;
	const wmy = (wm?.y ?? b.front) + under * 118;
	const lightK = 1 - (wm?.dark ?? under * 0.82);
	const wmS = (wm?.s ?? WM_S) * (1 - under * 0.06);
	return (
		<g>
			{light === 'night' || light === 'dark' ? <polygon points="1088,578 1440,578 1720,1080 1000,1080" fill="url(#moonBeam)" opacity={0.5} /> : null}
			{behind}
			<SkirtHole b={b} cx={sk.cx} w={w} h={sk.h} />
			{wm && wm.show !== false ? (
				<g clipPath={under > 0.5 ? `url(#${id}_hole)` : undefined}>
					<Clip id={`${id}_hole`} d={holePath(b, sk.cx, w, Math.max(sk.h, 1))} />
					<g filter={`url(#${id}_wml)`}>
						<Tint light={light}>
							<Widemouth frame={frame} {...wm} y={wmy} s={wmS} />
						</Tint>
					</g>
					<defs>
						<filter id={`${id}_wml`} colorInterpolationFilters="sRGB">
							<feColorMatrix type="matrix" values={`${lightK} 0 0 0 0  0 ${lightK} 0 0 0  0 0 ${lightK} 0 0  0 0 0 1 0`} />
						</filter>
					</defs>
					{lightK < 0.9
						? [-1, 1].map((sg) => <circle key={sg} cx={wm.x + (sg * 24 + 5) * wmS} cy={wmy + (-155 + (wm.tilt ? 0 : 0)) * wmS} r={4.2 * wmS} fill="#e9eeff" opacity={1 - lightK} />)
						: null}
				</g>
			) : null}
			<SkirtHem b={b} cx={sk.cx} w={w} h={sk.h} />
			{bed.mode === 'sit' ? <SitInBed b={b} light={light} frame={frame} p={bed.p} id={id} who={who} /> : null}
			{bed.mode === 'lie' ? <LieInBed b={b} light={light} frame={frame} p={bed.p} id={id} wob={bed.blanketWob} who={who} /> : null}
			{bed.mode === 'hide' ? <HideInBed b={b} light={light} shiver={bed.shiver} frame={frame} id={id} /> : null}
			{front}
		</g>
	);
};

/** Eli's empty bed (the blanket thrown back). */
export const EmptyBed: React.FC<{b: BedGeo; light: Light; id: string}> = ({b, light, id}) => {
	const x1 = b.x1 - 30;
	const d = `M${b.x0 + 200},${b.skirtTop} L${b.x0 + 210},${b.quilt - 4} C${b.x0 + 300},${b.quilt - 34} ${b.x0 + 380},${b.quilt - 50} ${b.x0 + 460},${b.quilt - 20} C${b.x0 + 560},${b.quilt - 4} ${x1 - 100},${b.quilt - 8} ${x1},${b.quilt + 6} L${x1 + 4},${b.skirtTop} Z`;
	return (
		<Tint light={light}>
			<Quilt id={`${id}_q`} cols={b.quiltCols} d={d} />
			<path d={`M${b.x0 + 60},${b.quilt + 2} L${b.x0 + 200},${b.quilt + 2}`} stroke={INK} strokeOpacity={0.2} strokeWidth={4} />
		</Tint>
	);
};
