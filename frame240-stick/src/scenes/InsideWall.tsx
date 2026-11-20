// 9. INSIDE THE WALL - the shape moves under the white surface: a hand, an elbow, a head; she smashes the screen;
// white fingers push out of the blank space; the front door is gone.
import React from 'react';
import {Mara} from '../components/characters/Cast';
import {FullPicture} from '../layout/pictures';
import {Emboss, Glow, handPath, manOutline} from '../stick/f240';
import {Beam, Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, ui, useStick, walk} from '../stick/kit';
import {wob, wobEllipse} from '../utils/rough';
import {AtDesk, hallPos, MF, prog} from './common';
import {WALL_MAN} from './WhiteOnWhite';

const PAPER = '#f4f3ee';
/** the shape under the side wall of the room (room_side, between the doorway and the window) */
const SIDE = {x: 600, y: 945, s: 1.8};

/** cracks across the monitor glass (world coords on room_side) */
const Cracks: React.FC<{k: number}> = ({k}) => {
	if (k <= 0) return null;
	const [x0, y0, x1, y1] = GEO.side.screen;
	const c: [number, number] = [x0 + (x1 - x0) * 0.42, y0 + (y1 - y0) * 0.45];
	const rays = [[-160, -110], [-150, 80], [40, -130], [170, -40], [150, 120], [-30, 140], [-170, -10]];
	return (
		<g stroke="#2a2c33" strokeWidth={3} fill="none" opacity={Math.min(1, k * 1.5)}>
			{rays.slice(0, Math.ceil(rays.length * k)).map(([dx, dy], i) => (
				<path key={i} d={wob([c, [c[0] + dx * 0.5, c[1] + dy * 0.5 + 8], [c[0] + dx, c[1] + dy]], 3400 + i, 3, false)} />
			))}
			<circle cx={c[0]} cy={c[1]} r={14} />
		</g>
	);
};

export const InsideWall: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t113 = T('narrator_113_backed_away');
	const t114 = T('narrator_114_shape_moved');
	const t116 = T('narrator_116_stretched');
	const t120 = T('narrator_120_flashlight');
	const t126 = T('narrator_126_smash');
	const tG = T('hana_014_get_out');
	const t132 = T('narrator_132_front_door');
	const t134 = T('narrator_134_no_door');
	const tI = at('impact');
	const shots = [
		// "I backed away."
		shot(t113, 'room_front_night', 1.15, 1.2, [960, 560], [940, 560], {wash: 1, tag: 'back'}),
		// "The shape moved." / "Not like a person walking." / "More like a drawing being stretched across paper."
		shot(t114, 'room_side_night', 1.0, 1.05, [960, 540], [900, 540], {wash: 1, tag: 'side'}),
		shot(T('narrator_115_not_walking'), 'room_side_night', 1.7, 1.75, [700, 560], [690, 560], {wash: 1, tag: 'wall'}),
		shot(t116, 'room_side_night', 1.7, 1.8, [700, 560], [700, 560], {wash: 1, tag: 'wall'}),
		// "The outline of a hand appeared near the ceiling." / "Then an elbow." / "Then the curve of a head."
		shot(T('narrator_117_hand'), 'room_side_night', 2.6, 2.7, [640, 240], [640, 240], {wash: 1, tag: 'parts'}),
		shot(T('narrator_118_elbow'), 'room_side_night', 2.6, 2.7, [580, 360], [580, 360], {wash: 1, tag: 'parts'}),
		shot(T('narrator_119_head'), 'room_side_night', 2.6, 2.75, [730, 420], [730, 420], {wash: 1, tag: 'parts'}),
		// "I could barely see it unless I tilted my phone flashlight sideways."
		shot(t120, 'room_side_night', 1.1, 1.15, [900, 540], [880, 540], {wash: 1, tag: 'torch'}),
		// "And the worst part was how quietly it moved."
		shot(T('narrator_121_quietly'), 'room_side_night', 1.6, 1.75, [700, 560], [680, 560], {wash: 1, tag: 'parts'}),
		// "No breathing." / "No footsteps."
		shot(T('narrator_122_no_breathing'), 'room_side_night', 2.6, 2.7, [1290, 470], [1290, 470], {wash: 1, tag: 'face'}),
		shot(T('narrator_123_no_footsteps'), 'room_side_night', 2.2, 2.3, [640, 400], [640, 400], {wash: 1, tag: 'parts'}),
		// "Just that horrible scratching sound."
		shot(T('narrator_124_scratching'), 'room_side_night', 2.6, 2.7, [640, 240], [640, 240], {wash: 1, tag: 'parts', shake: 3}),
		// "It was coming from inside the walls now."
		shot(T('narrator_125_inside_walls'), 'room_side_night', 1.0, 1.04, [960, 540], [960, 540], {wash: 1, tag: 'many'}),
		// "I grabbed the computer and tried to smash the screen."
		shot(t126, 'room_side_night', 1.4, 1.45, [1060, 560], [1060, 560], {wash: 1, tag: 'smash'}),
		// "But the image stayed there." / "The man was gone from the drawing." / "In his place was a blank white space."
		ui(T('narrator_127_image_stayed'), (fl, d) => (
			<>
				<FullPicture id="canvas_white" f={fl} d={d} z={[1.0, 1.04]} />
				<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
					{[[-700, -420], [-640, 380], [260, -520], [760, -160], [700, 470], [-80, 560], [-900, 20]].map(([dx, dy], i) => (
						<path key={i} d={wob([[820, 470], [820 + dx * 0.5, 470 + dy * 0.5 + 20], [820 + dx, 470 + dy]], 3500 + i, 6, false)} stroke="#15161a" strokeWidth={5} fill="none" />
					))}
				</svg>
			</>
		)),
		ui(T('narrator_128_gone_from_drawing'), (fl, d) => <FullPicture id="canvas_white" f={fl} d={d} z={[1.1, 1.25]} focus={[0.47, 0.45]} />),
		ui(T('narrator_129_blank_space'), (fl, d) => <FullPicture id="canvas_blank" f={fl} d={d} z={[1.4, 1.7]} focus={[0.47, 0.3]} />),
		// "And through that blank space, something was slowly pushing outward."
		ui(T('narrator_130_pushing_outward'), (fl, d) => <FullPicture id="canvas_blank" f={fl} d={d} z={[1.8, 2.1]} focus={[0.47, 0.25]} />),
		// white fingers push out, casting tiny shadows
		ui(at('fingers'), (fl, d) => (
			<div style={{position: 'absolute', inset: 0, transform: `translate(${Math.sin(fl * 2.1) * 4}px, ${Math.cos(fl * 1.7) * 3}px)`}}>
				<FullPicture id="canvas_fingers" f={fl} d={d} z={[1.0, 1.1]} focus={[0.5, 0.4]} />
			</div>
		)),
		// HANA (panicking): "Mara! Get out! Get out right now!"
		shot(tG, 'room_side_night', 1.0, 1.06, [960, 540], [800, 560], {wash: 1, tag: 'run'}),
		// "I ran for the front door."
		shot(t132, 'hall_persp_night', 1.0, 1.04, [960, 540], [880, 540], {wash: 1, tag: 'door', light: 'flash'}),
		// "There was no handle."
		shot(T('narrator_133_no_handle'), 'hall_persp_night', 1.6, 1.68, [560, 560], [550, 560], {wash: 1, tag: 'handle'}),
		// "There wasn't even a door anymore." / "Just a smooth white rectangle where the entrance had been."
		shot(t134, 'hall_persp_night', 1.6, 1.7, [560, 560], [560, 560], {wash: 1, tag: 'nodoor'}),
		shot(T('narrator_135_white_rectangle'), 'hall_persp_night', 1.25, 1.3, [500, 560], [500, 560], {wash: 1, tag: 'nodoor'}),
		// a low impact from inside the wall
		shot(tI, 'hall_persp_night', 2.0, 2.1, [860, 470], [860, 470], {wash: 1, tag: 'impact', shake: 10}),
	];

	// the shape under the side wall: drifts left and stretches, "like a drawing being stretched across paper"
	const drift = ramp(t, t114, end('narrator_116_stretched'));
	const sx = 1 + 0.32 * ramp(t, t116, end('narrator_116_stretched')) * (1 - ramp(t, t120, t120 + 2));
	const sideMan = (k: number) => {
		const x = lerp(SIDE.x + 60, SIDE.x - 40, drift);
		return (
			<g transform={`translate(${x} ${SIDE.y}) scale(${sx} ${1 / Math.sqrt(sx)}) translate(${-x} ${-SIDE.y})`}>
				{manOutline(x, SIDE.y, SIDE.s).map((d, i) => (
					<Emboss key={i} d={d} k={k} />
				))}
			</g>
		);
	};
	const parts = (k: number) => {
		const tt = (id: string) => ramp(t, T(id), T(id) + 1.2);
		const wig = Math.sin(t * 1.3) * 6;
		return (
			<g>
				<Emboss d={handPath(640 + wig, 220, 1.25, -12)} k={k * Math.max(tt('narrator_117_hand'), t > T('narrator_121_quietly') ? 1 : 0)} />
				<Emboss d={wob([[520, 470], [585, 360 + wig * 0.5], [640, 290]], 3600, 1, false)} k={k * tt('narrator_118_elbow')} w={10} />
				<Emboss d={wobEllipse(730 + wig * 0.4, 420, 52, 66, 3601, 0.6)} k={k * tt('narrator_119_head')} />
			</g>
		);
	};
	const maraSide = (o: Record<string, unknown> = {}) => <Person is={Mara} name="mara" x={1330} y={GEO.side.floor + 10} s={1.95} frame={f} turn={-0.45} look={[-1, -0.2]} eyes="wide" brows="worried" mouth="o" prop="phone" arms={{l: [10, 0], r: [40, -70]}} {...o} />;

	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'room_front_night') {
			// she gets up and backs away from the outline on the back wall
			const w = walk(t, t113 + 0.5, t113 + 2.6, MF.x, 560, 2.2);
			return (
				<AtDesk f={f} wash={1} phone={false} empty>
					{manOutline(WALL_MAN.x, WALL_MAN.y, WALL_MAN.s).map((d, i) => (
						<Emboss key={i} d={d} k={0.6} />
					))}
					<Person is={Mara} name="mara" x={w.x} y={MF.y} s={MF.s} frame={f} pose={w.moving ? 'walk' : 'stand'} phase={w.phase} turn={0.35} look={[1, -0.3]} eyes="wide" brows="worried" mouth="o" shiver={0.8} />
				</AtDesk>
			);
		}
		if (s.set === 'room_side_night') {
			switch (s.tag) {
				case 'side':
					return (
						<g>
							{sideMan(0.6)}
							{maraSide()}
						</g>
					);
				case 'wall':
					return sideMan(0.65);
				case 'parts':
					return (
						<g>
							{sideMan(0.25)}
							{parts(0.95)}
						</g>
					);
				case 'torch': {
					const hand: [number, number] = [1330 - 60, GEO.side.floor + 10 - 470];
					return (
						<g>
							<Glow cx={680} cy={480} r={420} color="#fff8dd" k={0.7} />
							{sideMan(0.6 + 0.35 * ramp(t, t120 + 0.4, t120 + 1.6))}
							{parts(0.8)}
							<Beam from={hand} to={[680, 480]} w={420} k={0.7} />
							{maraSide({arms: {l: [10, 0], r: [100, -30]}, turn: -0.6})}
						</g>
					);
				}
				case 'face':
					return (
						<g>
							{parts(0.6)}
							{maraSide({idle: false, mouth: 'flat'})}
						</g>
					);
				case 'many':
					return (
						<g>
							{sideMan(0.5)}
							{parts(0.9)}
							<Emboss d={handPath(1730, 760, 1.1, 160)} k={0.7} />
							<Emboss d={wobEllipse(330, 230, 46, 60, 3602, 0.6)} k={0.6} />
							{maraSide({shiver: 1.2})}
						</g>
					);
				case 'smash': {
					const hit = ramp(t, t126 + 0.8, t126 + 1.0);
					return (
						<g>
							<Cracks k={ramp(t, t126 + 0.9, t126 + 1.6)} />
							<Person is={Mara} name="mara" x={lerp(1300, 1220, hit)} y={GEO.side.floor + 10} s={1.95} frame={f} turn={-0.6} look={[-1, 0]} eyes="squint" brows="angry" mouth="shout" arms={{l: [lerp(60, 105, hit), -20], r: [lerp(-20, -55, hit), -30]}} />
						</g>
					);
				}
				case 'run': {
					const w = walk(t, tG + 0.3, tG + 2.4, 1330, 260, 1.95);
					return (
						<g>
							{sideMan(0.5)}
							{parts(0.8)}
							<Person is={Mara} name="mara" x={w.x} y={GEO.side.floor + 10} s={1.95} frame={f} pose={w.moving ? 'run' : 'stand'} turn={-0.8} phase={w.phase} eyes="wide" brows="worried" mouth="o" />
						</g>
					);
				}
			}
			return null;
		}
		// the hallway, white: the front door on the left wall loses its handle, then stops being a door
		const F = GEO.persp.front;
		const noHandle = s.tag !== 'door' ? 1 : ramp(t, t132 + 1.0, t132 + 1.6);
		const noDoor = s.tag === 'nodoor' ? ramp(t, t134, t134 + 2.2) : s.tag === 'impact' ? 1 : 0;
		const p = hallPos(0.18);
		const run = walk(t, t132 + 0.1, t132 + 1.4, 1250, 560, p.s);
		return (
			<g>
				{/* the handle and the deadbolt are painted out */}
				<rect x={GEO.persp.frontHandle[0] - 45} y={430} width={70} height={240} fill={PAPER} opacity={noHandle} />
				{/* then the door's own lines, leaving only a smooth white rectangle */}
				<path d={`M${F[0] + 30},${F[1] + 40} L${F[2] - 40},${F[1] + 150} L${F[2] - 40},${F[3] - 120} L${F[0] + 30},${F[3]} Z`} fill={PAPER} opacity={noDoor} />
				{noDoor > 0 ? <path d={`M${F[0]},${F[1]} L${F[2]},${F[1] + 120} L${F[2]},${F[3] - 90} L${F[0]},${F[3] + 30} Z`} fill="none" stroke="#dcdbd4" strokeWidth={3} opacity={noDoor} /> : null}
				{s.tag === 'door' ? <Person is={Mara} name="mara" x={run.x} y={p.y} s={p.s} frame={f} pose={run.moving ? 'run' : 'stand'} turn={run.moving ? -0.8 : -0.4} phase={run.phase} eyes="wide" brows="worried" mouth="o" arms={run.moving ? undefined : {l: [96, -10], r: [10, 0]}} /> : null}
				{s.tag === 'handle' || s.tag === 'nodoor' ? (
					<Person is={Mara} name="mara" x={860} y={p.y} s={p.s} frame={f} turn={-0.5} look={[-1, 0]} eyes="wide" brows="worried" mouth="o" arms={{l: [100 + Math.sin(t * 9) * 10, -10], r: [10, 0]}} shiver={1} />
				) : null}
				{s.tag === 'impact' ? <Person is={Mara} name="mara" x={860} y={p.y} s={p.s} frame={f} turn={0.2} eyes="wide" brows="raised" mouth="scream" arms="coverEars" shiver={2} /> : null}
				{s.tag === 'impact' ? <Emboss d={handPath(1010, 430, 1.8, 15)} k={ramp(t, tI, tI + 0.3)} w={12} /> : null}
			</g>
		);
	};
	void prog;
	return <Shots shots={shots} world={(s) => world(s)} />;
};
