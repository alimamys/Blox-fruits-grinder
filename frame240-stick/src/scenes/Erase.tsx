// 7. TRYING TO ERASE HIM - the red line comes true on the real wall; she paints him out with white.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Mara} from '../components/characters/Cast';
import {manBoxOf, PictureBox, type PicId} from '../layout/pictures';
import {ChairSeat, DrawnLine, OfficeChair, Rain} from '../stick/f240';
import {Person} from '../stick/goat';
import {ramp, shot, Shots, ui, useStick} from '../stick/kit';
import {FONT} from '../utils/fonts';
import {AtDesk, ed, MS, prog} from './common';

const STRIP: PicId[] = [...Array.from({length: 11}, () => 'canvas_empty' as PicId), 'canvas_man_close'];
const E = {total: 240, strip: STRIP};
const CLOSE = manBoxOf('close');
const paintShot = (a: number, b: number) => (f: number, d: number) => ed('canvas_man_close', 240, {...E, paint: a + (b - a) * prog(f, d, 0, 0.95), manBox: CLOSE, brushPanel: true, push: [1.0, 1.04], focus: [0.42, 0.42]})(f, d);
// the red line, in picture coordinates: the same place on her canvas and on her real wall (same hallway)
export const RED_A: [number, number] = [1190, 508];
export const RED_B: [number, number] = [1766, 551];

/** "The exact same length. The exact same position." - her animation and her real hallway, side by side */
const Split: React.FC<{measure?: boolean; f: number}> = ({measure = false, f}) => {
	const half = (real: boolean) => (
		<div style={{flex: 1, position: 'relative', overflow: 'hidden', borderRight: real ? undefined : '4px solid #000'}}>
			{/* the right part of the picture (x 1120..1920, where the line is) scaled up, so the man is not cut in half at the edge */}
			<div style={{position: 'absolute', left: -1120 * 1.2, top: -108, width: 1920, height: 1080, transform: 'scale(1.2)', transformOrigin: '0 0'}}>
				{real ? <Img src={staticFile('plates/hall_persp_night.jpg')} style={{width: 1920, height: 1080, filter: 'brightness(0.5) saturate(0.8)'}} /> : <PictureBox id="canvas_man_close" />}
				<svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: 1920, height: 1080}}>
					<line x1={RED_A[0]} y1={RED_A[1]} x2={RED_B[0]} y2={RED_B[1]} stroke="#d0141c" strokeWidth={10} strokeLinecap="round" />
					{measure ? <path d={`M${RED_A[0]},${RED_A[1] - 34} L${RED_B[0]},${RED_B[1] - 34} M${RED_A[0]},${RED_A[1] - 50} L${RED_A[0]},${RED_A[1] - 18} M${RED_B[0]},${RED_B[1] - 50} L${RED_B[0]},${RED_B[1] - 18}`} stroke="#fff" strokeWidth={4} opacity={Math.min(1, f / 8)} /> : null}
				</svg>
			</div>
			<div style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.mono, fontSize: 26, color: '#ddd'}}>{real ? 'MY WALL' : 'ANIMATION'}</div>
		</div>
	);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'row'}}>
			{half(false)}
			{half(true)}
		</div>
	);
};

export const Erase: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t79 = T('narrator_079_red_line');
	const t81 = T('narrator_081_looked_behind');
	const t82 = T('narrator_082_real_wall');
	const t100 = T('narrator_100_worse_mistake');
	const shots = [
		// "I needed to know whether I could change it."
		shot(T('narrator_078_change_it'), 'room_front_night', 2.2, 2.35, [875, 650], [875, 652], {tag: 'determined'}),
		// "I picked up my stylus and drew a red line across the hallway wall in the animation."
		shot(t79, 'room_side_night', 1.9, 2.0, [820, 640], [840, 640], {tag: 'draw'}),
		ui(T('narrator_079_red_line', 0.55), (fl, d) => ed('canvas_man_close', 240, {...E, redLine: prog(fl, d, 0.05, 0.8), push: [1.1, 1.18], focus: [0.6, 0.45]})(fl, d)),
		// "Immediately, I heard a long scraping noise."
		shot(T('narrator_080_scraping'), 'room_front_night', 1.3, 1.4, [1060, 600], [1080, 600], {tag: 'freeze', shake: 1.5}),
		// "I looked behind me."
		shot(t81, 'room_front_night', 1.4, 1.5, [1100, 580], [1150, 570], {tag: 'turn'}),
		// "A red line had appeared on my real wall."
		shot(t82, 'hall_persp_night', 1.35, 1.45, [1400, 540], [1440, 540], {light: 'black', tag: 'red'}),
		// "The exact same length." / "The exact same position."
		ui(T('narrator_083_same_length'), (fl) => <Split f={fl} />),
		ui(T('narrator_084_same_position'), (fl) => <Split f={fl} measure />),
		// "My hands started shaking."
		shot(T('narrator_085_hands_shaking'), 'room_front_night', 1.9, 2.0, [880, 640], [880, 640], {tag: 'hands'}),
		// "If the animation could change the apartment, maybe I could use it to stop the man."
		shot(T('narrator_086_stop_the_man'), 'room_front_night', 1.6, 1.7, [900, 625], [890, 630], {tag: 'determined'}),
		// "I selected a thick white brush."
		ui(T('narrator_087_white_brush'), ed('canvas_man_close', 240, {...E, brushPanel: true, push: [1.3, 1.36], focus: [0.92, 0.45], cursor: [1700, 300]})),
		// "Then I started painting over him." / "First his legs." / "Then his arms." / "Then the strange angle of his head."
		ui(T('narrator_088_painting_over'), paintShot(0, 0.12)),
		ui(T('narrator_089_legs'), paintShot(0.12, 0.38)),
		ui(T('narrator_090_arms'), paintShot(0.38, 0.62)),
		ui(T('narrator_091_head'), paintShot(0.62, 0.86)),
		ui(at('painting'), paintShot(0.86, 1)),
		// "I kept painting until the entire figure disappeared into the white background."
		ui(T('narrator_092_disappeared'), ed('canvas_white', 240, {...E, push: [1.0, 1.08], focus: [0.42, 0.42]})),
		// "I flattened the layer." / "Saved the project."
		ui(T('narrator_093_flattened'), (fl, d) => ed('canvas_white', 240, {...E, toast: fl > 4 ? 'Layers flattened' : null, push: [1.0, 1.04]})(fl, d)),
		ui(T('narrator_094_saved'), (fl, d) => ed('canvas_white', 240, {...E, toast: fl > 4 ? 'Project saved' : null, push: [1.04, 1.08]})(fl, d)),
		// "And waited."
		shot(T('narrator_095_waited'), 'room_front_night', 1.5, 1.55, [920, 620], [920, 620], {tag: 'wait'}),
		// the scratching stops: silence
		shot(at('silence_waited'), 'hall_persp_night', 1.04, 1.04, [930, 530], [930, 530], {light: 'black'}),
		// "For a few seconds, nothing happened."
		shot(T('narrator_096_nothing_happened'), 'room_front_night', 1.6, 1.7, [920, 620], [900, 630], {tag: 'wait'}),
		// "I thought I'd done it."
		shot(T('narrator_097_done_it'), 'room_front_night', 2.2, 2.3, [875, 650], [875, 650], {tag: 'relief'}),
		// "I thought I'd erased him."
		ui(T('narrator_098_erased_him'), ed('canvas_white', 240, {...E, push: [1.0, 1.12], focus: [0.42, 0.42]})),
		// "But I hadn't erased him."
		shot(T('narrator_099_hadnt_erased'), 'room_front_night', 2.8, 3.1, [868, 660], [868, 662], {tag: 'dread'}),
		// "I'd made a much worse mistake." - the hallway starts to drain white
		shot(t100, 'hall_persp_night', 1.0, 1.08, [960, 540], [930, 520], {wash: (tt: number) => 0.35 * ramp(tt, t100 + 0.3, end('narrator_100_worse_mistake') + 0.4)}),
	];
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'room_side_night') {
			const k = ramp(t, t79 + 0.5, t79 + 2.6);
			return (
				<g>
					<OfficeChair x={MS.x} y={MS.y} s={MS.s} frame={f} view="front" />
					<Person is={Mara} name="mara" x={MS.x} y={MS.y} s={MS.s} pose="sit" frame={f} turn={0.4} look={[1, -0.1]} brows="angry" arms={{l: [20, -70], r: [62 + 14 * Math.sin(k * Math.PI), -30]}} light="screen" />
					<ChairSeat x={MS.x} y={MS.y} s={MS.s} frame={f} />
					<Rain box={[1000, 40, 1595, 530]} frame={f} opacity={0.4} />
				</g>
			);
		}
		// the red line is on her real wall from now on
		if (s.set === 'hall_persp_night') return <DrawnLine a={RED_A} b={RED_B} k={1} color="#d0141c" w={10} />;
		switch (s.tag) {
			case 'determined':
				return <AtDesk f={f} phone={false} m={{brows: 'angry', mouth: 'flat', look: [0, 0.2]}} />;
			case 'freeze':
				return <AtDesk f={f} phone={false} m={{eyes: 'wide', brows: 'worried', mouth: 'o', idle: false}} />;
			case 'turn': {
				const k = (t - t81) / 0.7;
				return k < 1 ? <AtDesk f={f} phone={false} m={{turn: 0.7 * Math.max(0, k), look: [1, 0], eyes: 'wide', brows: 'worried'}} /> : <AtDesk f={f} phone={false} m={{back: true}} />;
			}
			case 'hands':
				return <AtDesk f={f} phone={false} m={{eyes: 'wide', brows: 'worried', mouth: 'wobbly', arms: {l: [24, -120], r: [24, -120]}, shiver: 1.4, look: [0, 0.4]}} />;
			case 'wait':
				return <AtDesk f={f} phone={false} m={{brows: 'worried', idle: false, look: [0, 0.1]}} />;
			case 'relief':
				return <AtDesk f={f} phone={false} m={{eyes: 'closed', brows: 'sad', mouth: 'faint', lean: -3}} />;
			case 'dread':
				return <AtDesk f={f} phone={false} m={{eyes: 'wide', brows: 'worried', mouth: 'frown', look: [0, -0.3 * ramp(t, T('narrator_099_hadnt_erased'), end('narrator_099_hadnt_erased'))]}} />;
			default:
				return <AtDesk f={f} phone={false} />;
		}
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
