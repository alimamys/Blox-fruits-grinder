// Beds seen side-on (headboard left, as painted on the plates): a person lies with the head on the pillow and the
// blanket drawn in code over the body up to the chin (the figure is drawn standing, clipped at the chin, so only the
// head shows), or the blanket pulled over the head, or sitting up out of the quilt. Ported from the stick Widemouth.
import React from 'react';
import {Tint, INK, type BedGeo, type Light} from './kit';

const Clip: React.FC<{id: string; d: string}> = ({id, d}) => (
	<defs>
		<clipPath id={id}>
			<path d={d} />
		</clipPath>
	</defs>
);

/** a patchwork quilt filling path d */
export const Quilt: React.FC<{d: string; cols: string[]; id: string}> = ({d, cols, id}) => (
	<g>
		<defs>
			<pattern id={id} width={84} height={60} patternUnits="userSpaceOnUse">
				<rect width={42} height={30} fill={cols[0]} />
				<rect x={42} width={42} height={30} fill={cols[1]} />
				<rect y={30} width={42} height={30} fill={cols[2]} />
				<rect x={42} y={30} width={42} height={30} fill={cols[3]} />
				<path d="M42,0 V60 M0,30 H84" stroke="#000" strokeOpacity={0.3} strokeWidth={2} />
			</pattern>
		</defs>
		<path d={d} fill={`url(#${id})`} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
	</g>
);

/** the blanket over someone lying down, from the chin (chinX) to the foot of the bed (x1); `bump` raises it over the knees */
export const lyingBlanket = (b: BedGeo, chinX: number, x1: number, wob = 0, lift = 46) => {
	const top = b.quilt - lift + wob;
	return `M${chinX - 20},${b.skirtTop} L${chinX - 24},${top + 16} C${chinX - 10},${top - 6} ${chinX + 70},${top - 10} ${chinX + 160},${top - 2} C${(chinX + x1) / 2 + 60},${top + 6} ${x1 - 120},${top - 6} ${x1 - 40},${top + 8} C${x1 - 10},${top + 14} ${x1},${top + 30} ${x1 + 2},${b.skirtTop} Z`;
};

type AnyPerson = React.FC<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** lying on the pillow at px (pillow centre x), blanket up to the chin */
export const LieInBed: React.FC<{b: BedGeo; is: AnyPerson; px: number; s: number; child?: boolean; light?: Light; frame: number; p?: Record<string, unknown>; id: string; wob?: number; x1?: number; blanket?: boolean}> = ({
	b,
	is: P,
	px,
	s,
	child = false,
	light,
	frame,
	p = {},
	id,
	wob = 0,
	x1,
	blanket = true,
}) => {
	const k = child ? 0.62 : 1;
	const hy = b.pillowY - 30;
	const headUp = 262 * k * s;
	return (
		<g>
			<Clip id={`${id}_chin`} d={`M0,0 H1920 V${hy + 36 * s * (child ? 1.1 : 1)} H0 Z`} />
			<g clipPath={`url(#${id}_chin)`}>
				<Tint light={light}>
					<P x={px} y={hy + headUp} s={s} frame={frame} tilt={-14} arms="down" {...p} />
				</Tint>
			</g>
			{blanket ? (
				<Tint light={light}>
					<Quilt id={`${id}_q`} cols={b.quiltCols} d={lyingBlanket(b, px + 60 * s, x1 ?? b.x1 - 30, wob)} />
				</Tint>
			) : null}
		</g>
	);
};

/** the blanket pulled over the head: a trembling lump */
export const HideInBed: React.FC<{b: BedGeo; px: number; light?: Light; shiver?: number; frame: number; id: string}> = ({b, px, light, shiver = 1, frame, id}) => {
	const j = Math.sin(frame * 2.1) * 2.5 * shiver;
	const top = b.quilt - 90 + j;
	const d = `M${b.x0 + 30},${b.skirtTop} L${b.x0 + 32},${top + 50} C${px - 60},${top - 10} ${px + 40},${top - 20} ${px + 120},${top + 30} C${px + 220},${top + 40} ${b.x1 - 160},${top + 26} ${b.x1 - 50},${top + 44} C${b.x1 - 20},${top + 50} ${b.x1 - 10},${top + 70} ${b.x1 - 8},${b.skirtTop} Z`;
	return (
		<Tint light={light}>
			<Quilt id={`${id}_q`} cols={b.quiltCols} d={d} />
		</Tint>
	);
};

/** sitting up in bed at x: the figure rises out of the quilt (cut along its top edge), the code blanket over the lap */
export const SitInBed: React.FC<{b: BedGeo; is: AnyPerson; x: number; s: number; child?: boolean; light?: Light; frame: number; p?: Record<string, unknown>; id: string; lap?: boolean}> = ({b, is: P, x, s, child = false, light, frame, p = {}, id, lap = true}) => {
	const k = child ? 0.62 : 1;
	const y = b.quilt - 10 + 72 * k * s;
	return (
		<g>
			<Clip id={`${id}_waist`} d={`M0,0 H1920 V${b.quilt + 4} H0 Z`} />
			<g clipPath={`url(#${id}_waist)`}>
				<Tint light={light}>
					<P x={x} y={y} s={s} frame={frame} pose="sit" {...p} />
				</Tint>
			</g>
			{lap ? <Tint light={light}>
				<Quilt id={`${id}_lap`} cols={b.quiltCols} d={`M${x - 70 * s * k},${b.skirtTop} L${x - 66 * s * k},${b.quilt - 18} C${x},${b.quilt - 34} ${x + 200},${b.quilt - 30} ${b.x1 - 40},${b.quilt - 8} C${b.x1 - 10},${b.quilt} ${b.x1},${b.quilt + 20} ${b.x1 + 2},${b.skirtTop} Z`} />
			</Tint> : null}
		</g>
	);
};
