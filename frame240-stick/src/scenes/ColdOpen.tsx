// 1. COLD OPEN - the frame that shouldn't exist.
import React from 'react';
import {Mara} from '../components/characters/Cast';
import {Disclaimer, TitleCard} from '../components/ui/Phone';
import {PictureBox, type PicId} from '../layout/pictures';
import {ChairSeat, Flicker, OfficeChair, Rain, TallMan} from '../stick/f240';
import {Person} from '../stick/goat';
import {GEO, ramp, shot, Shots, ui, useStick} from '../stick/kit';
import {AtDesk, ed, full, MS, prog} from './common';

const STRIP: PicId[] = Array.from({length: 12}, () => 'canvas_empty' as PicId);
const STRIP240: PicId[] = [...STRIP.slice(1), 'canvas_man_far'];

export const ColdOpen: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots = [
		// black; a double click; a 3-frame flash of the figure; the disclaimer
		ui(0, (fl, d) => (
			<>
				{fl >= 35 && fl < 38 ? <PictureBox id="canvas_man_far" style={{filter: 'brightness(0.8) contrast(1.2)'}} /> : null}
				<Disclaimer f={fl} d={d} />
			</>
		)),
		// "There were 239 frames in my animation when I went to bed."
		ui(T('narrator_001_239_frames'), ed('canvas_empty', 239, {total: 239, strip: STRIP, push: [1.08, 1.16], focus: [0.45, 0.88]})),
		// "...there were 240." - a new cell slides onto the end of the strip
		ui(T('narrator_002_240', 0.55), (fl, d) => ed('canvas_empty', 240, {strip: STRIP240, newCell: prog(fl, 8), push: [1.18, 1.3], focus: [0.92, 0.9]})(fl, d)),
		// "In the extra frame, a man was standing in my hallway." - full-screen flash, then the canvas
		ui(T('narrator_003_extra_frame', 0.42), (fl, d) => (fl < 5 ? full('canvas_man_far')(fl, d) : ed('canvas_man_far', 240, {strip: STRIP240, push: [1.0, 1.1], focus: [0.42, 0.42]})(fl, d))),
		// "I hadn't drawn him."
		shot(T('narrator_004_hadnt_drawn'), 'room_front_night', 2.3, 2.45, [870, 650], [870, 655], {tag: 'face'}),
		// "...he was closer."
		ui(T('narrator_005_closer', 0.5), full('canvas_man_mid', [1.02, 1.12])),
		// "I know how ridiculous that sounds." - the whole room, the dark doorway behind her
		shot(T('narrator_006_ridiculous'), 'room_front_night', 1.0, 1.06, [960, 540], [930, 560]),
		// "A drawing can't move by itself. An animation can't create new frames."
		shot(T('narrator_007_cant_move'), 'room_side_night', 1.45, 1.55, [820, 620], [860, 610], {tag: 'side'}),
		// "At least, that's what I believed."
		shot(T('narrator_008_believed'), 'room_front_night', 4.2, 4.45, [865, 668], [865, 672], {tag: 'eyes'}),
		// "Until that night." - the real hallway, dark
		shot(T('narrator_009_until_that_night'), 'hall_persp_night', 1.0, 1.08, [960, 540], [930, 520], {light: 'black'}),
		// the figure at the end of the REAL hallway, head bent to one side
		shot(at('figure_reveal'), 'hall_persp_night', 1.12, 1.22, [920, 520], [910, 500], {light: 'black', shake: 3, tag: 'figure'}),
		// hard black + one dry scratch
		shot(at('cut_black'), 'black', 1, 1, [960, 540]),
		// FRAME 240
		ui(at('title'), (fl, d) => <TitleCard f={fl} d={d} />),
	];
	const tEyes = T('narrator_008_believed');
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'room_front_night') {
			const eyes = s.tag === 'eyes';
			return <AtDesk f={f} m={{eyes: eyes && t > tEyes + 1.2 ? 'wide' : 'dot', brows: 'worried', look: [0, 0.15], mouth: 'flat'}} />;
		}
		if (s.set === 'room_side_night')
			return (
				<g>
					<OfficeChair x={MS.x} y={MS.y} s={MS.s} frame={f} view="front" />
					<Person is={Mara} name="mara" x={MS.x} y={MS.y} s={MS.s} pose="sit" frame={f} turn={0.4} look={[1, -0.1]} brows="flat" arms={{l: [20, -70], r: [68 + Math.sin(t * 2.4) * 4, -34]}} light="screen" />
					<ChairSeat x={MS.x} y={MS.y} s={MS.s} frame={f} />
					<Rain box={[1000, 40, 1595, 530]} frame={f} opacity={0.4} />
				</g>
			);
		if (s.set === 'hall_persp_night') {
			const D = GEO.persp.bedDoor;
			return (
				<g>
					{s.tag === 'figure' ? <TallMan x={(D[0] + D[2]) / 2} y={D[3]} s={1.38} frame={f} /> : null}
					<Flicker f={f} k={s.tag === 'figure' ? 0.6 * ramp(t, at('figure_reveal'), at('figure_reveal') + 0.3) : 0} />
				</g>
			);
		}
		return null;
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
