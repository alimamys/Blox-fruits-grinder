// 4. ONE STEP CLOSER - play, play, play; he gets closer each time; a scratch in the real hallway.
import React from 'react';
import {EditorShot} from '../components/ui/Editor';
import {FullPicture, type PicId} from '../layout/pictures';
import {Flicker} from '../stick/f240';
import {shot, Shots, ui, useStick} from '../stick/kit';
import {AtDesk, ed, full} from './common';

const STRIP = (last: PicId): PicId[] => [...Array.from({length: 11}, () => 'canvas_empty' as PicId), last];
const play = (from: PicId, to: PicId) => (f: number, d: number) => {
	const p = f / Math.max(1, d - 1);
	const last = p > 0.85;
	return (
		<EditorShot
			f={f}
			d={d}
			total={240}
			strip={STRIP(last ? to : from)}
			picture={last ? to : 'canvas_empty'}
			frame={last ? 240 : 200 + Math.round((p / 0.85) * 39)}
			play={Math.min(1, p / 0.85)}
			playing={!last}
			push={[1.0, 1.03]}
		/>
	);
};

export const Closer: React.FC = () => {
	const {f, t, at, end} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t52 = T('narrator_052_turned_around');
	const shots = [
		// "I stared at the screen for a long time."
		shot(T('narrator_036_stared'), 'room_front_night', 1.6, 1.75, [900, 620], [880, 640], {tag: 'stare'}),
		// "Then I played the animation again." / "The man was closer." / "Not much. Maybe a meter."
		ui(T('narrator_037_played_again') + 0.6, play('canvas_man_mid', 'canvas_man_1m')),
		ui(T('narrator_038_man_closer'), full('canvas_man_1m', [1.0, 1.1], [0.5, 0.45])),
		shot(T('narrator_039_a_meter'), 'room_front_night', 2.3, 2.4, [870, 650], [870, 650], {tag: 'worried'}),
		// "I played it a third time." / "Closer."
		ui(T('narrator_040_third_time') + 0.5, play('canvas_man_1m', 'canvas_man_near')),
		ui(T('narrator_041_closer') - 0.1, full('canvas_man_near', [1.04, 1.12])),
		// "A fourth time." / "Closer."
		ui(T('narrator_042_fourth_time') + 0.3, play('canvas_man_near', 'canvas_man_close')),
		ui(T('narrator_043_closer') - 0.1, full('canvas_man_close', [1.06, 1.16], [0.5, 0.35])),
		// "He didn't walk." - onion skin: every position at once, nothing in between
		ui(T('narrator_044_didnt_walk'), ed('canvas_empty', 240, {strip: STRIP('canvas_man_close'), onion: ['canvas_man_mid', 'canvas_man_1m', 'canvas_man_near', 'canvas_man_close'], push: [1.0, 1.06], focus: [0.42, 0.42]})),
		// "There was no movement between positions."
		ui(T('narrator_045_no_movement'), ed('canvas_man_close', 240, {strip: ['canvas_empty', 'canvas_empty', 'canvas_man_far', 'canvas_empty', 'canvas_man_mid', 'canvas_empty', 'canvas_man_1m', 'canvas_empty', 'canvas_man_near', 'canvas_empty', 'canvas_empty', 'canvas_man_close'], push: [1.6, 1.7], focus: [0.5, 0.9]})),
		// "He simply appeared somewhere new every time the animation reached its final frame." - the room, the doorway behind her
		shot(T('narrator_046_appeared'), 'room_front_night', 1.0, 1.18, [960, 540], [1080, 560], {tag: 'lean'}),
		// "Like someone was drawing him in a different place."
		shot(T('narrator_047_drawing_him'), 'room_front_night', 2.6, 2.8, [865, 655], [865, 660], {tag: 'shock'}),
		// "I stopped the playback."
		ui(T('narrator_048_stopped'), ed('canvas_man_close', 240, {strip: STRIP('canvas_man_close'), playing: false, play: 1, push: [1.25, 1.3], focus: [0.2, 0.88], cursor: [150, 860]})),
		// "For several seconds, I didn't move."
		shot(T('narrator_049_didnt_move'), 'room_front_night', 1.9, 1.9, [880, 640], [880, 640], {tag: 'frozen'}),
		// "Then I heard something from my actual hallway." - her eyes slide toward the doorway
		shot(T('narrator_050_heard_something'), 'room_front_night', 3.0, 3.2, [870, 660], [880, 660], {tag: 'listen'}),
		// a faint, slow scratch
		shot(at('scratch_1'), 'hall_persp_night', 1.12, 1.18, [930, 520], [930, 510], {light: 'black', shake: 1.5}),
		// "It sounded like someone dragging a pencil across a wall."
		shot(T('narrator_051_pencil_wall'), 'hall_persp_night', 1.6, 1.75, [1200, 520], [1250, 520], {light: 'black'}),
		// "I turned around." - she turns in her chair to face the doorway
		shot(t52, 'room_front_night', 1.3, 1.36, [1060, 600], [1100, 590], {tag: 'turn'}),
		// "The hallway was empty."
		shot(T('narrator_053_empty'), 'hall_persp_night', 1.0, 1.07, [960, 540], [930, 530], {light: 'black'}),
		// "But the ceiling light was flickering."
		shot(T('narrator_054_flickering'), 'hall_persp_night', 1.5, 1.6, [930, 200], [910, 260], {tag: 'flicker'}),
		// "Exactly like the one in my animation."
		ui(T('narrator_055_like_my_animation'), (fl, d) => (
			<>
				<FullPicture id="canvas_empty" f={fl} d={d} z={[1.5, 1.6]} focus={[0.47, 0.1]} />
				<div style={{position: 'absolute', inset: 0, background: '#000', opacity: [0, 0, 0.7, 0, 0.7, 0.7, 0, 0, 0, 0.7, 0, 0][Math.floor(fl / 2) % 12]}} />
			</>
		)),
	];
	const world = (s: (typeof shots)[number]) => {
		if (s.set === 'hall_persp_night') return <Flicker f={f} k={s.tag === 'flicker' ? 1 : 0} />;
		switch (s.tag) {
			case 'stare':
				return <AtDesk f={f} m={{brows: 'flat', look: [0, 0.15], eyes: 'dot'}} />;
			case 'worried':
				return <AtDesk f={f} m={{brows: 'worried', mouth: 'frown'}} />;
			case 'lean':
				return <AtDesk f={f} m={{brows: 'worried', lean: 0, look: [0, 0.2], mouth: 'flat'}} />;
			case 'shock':
				return <AtDesk f={f} m={{eyes: 'wide', brows: 'raised', mouth: 'o'}} />;
			case 'frozen':
				return <AtDesk f={f} m={{eyes: 'wide', brows: 'worried', idle: false, look: [0, 0.1]}} />;
			case 'listen':
				return <AtDesk f={f} m={{eyes: 'wide', brows: 'worried', look: [Math.min(1, (t - at('narrator_050_heard_something')) * 0.8), 0], idle: false}} />;
			case 'turn': {
				const k = (t - t52) / 0.7;
				return k < 1 ? <AtDesk f={f} m={{turn: 0.7 * Math.max(0, k), look: [1, 0], brows: 'worried', eyes: 'wide'}} /> : <AtDesk f={f} m={{back: true}} />;
			}
			default:
				return <AtDesk f={f} />;
		}
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
