// Dev only: one frame per set-up, to check the cast, the man, the sets and the screens before the scenes.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Mara} from '../components/characters/Cast';
import {EditorShot} from '../components/ui/Editor';
import {FullPicture, manBoxOf} from '../layout/pictures';
import {AtDesk, hallPos, MC, MS} from '../scenes/common';
import {ChairSeat, DrawnLine, Emboss, handPath, manOutline, OfficeChair, TallMan} from '../stick/f240';
import {Beam, Person} from '../stick/goat';
import {GEO, Stage} from '../stick/kit';

export const SHEET_FRAMES = 12;

export const Sheet: React.FC = () => {
	const i = useCurrentFrame();
	const f = 40 + i * 13;
	const t = f / 24;
	if (i === 0) return <Stage set="room_front_night" z={1} f={[960, 540]} t={t}><AtDesk f={f} m={{look: [0.2, 0.1], brows: 'worried'}} /></Stage>;
	if (i === 1) return <Stage set="room_front_night" z={2.1} f={[1000, 640]} t={t}><AtDesk f={f} m={{eyes: 'wide', brows: 'worried', mouth: 'o'}} man={{k: 1}} /></Stage>;
	if (i === 2) return <Stage set="room_front_night" z={1.25} f={[1100, 560]} t={t}><AtDesk f={f} m={{look: [0, 0]}} man={{k: 1}} /></Stage>;
	if (i === 3)
		return (
			<Stage set="room_side_night" z={1} f={[960, 540]} t={t}>
				<OfficeChair x={MS.x} y={MS.y} s={MS.s} frame={f} view="front" />
				<Person is={Mara} name="mara" x={MS.x} y={MS.y} s={MS.s} pose="sit" frame={f} turn={0.4} look={[1, -0.2]} arms={{l: [20, -70], r: [70, -30]}} light="screen" />
				<ChairSeat x={MS.x} y={MS.y} s={MS.s} frame={f} />
			</Stage>
		);
	if (i === 4) {
		const p = hallPos(0.3);
		return (
			<Stage set="hall_persp_night" z={1} f={[960, 540]} t={t} light="black">
				<TallMan x={905} y={826} s={1.35} frame={f} />
				<Beam from={[930, p.y - 300 * p.s]} to={[905, 700]} w={260} k={0.8} />
				<Person is={Mara} name="mara" x={930} y={p.y} s={p.s} back frame={f} pose="walk" phase={f / 4} arms={{l: [10, 0], r: [40, -40]}} light="flash" />
			</Stage>
		);
	}
	if (i === 5)
		return (
			<Stage set="hall_side_night" z={1} f={[960, 540]} t={t}>
				<DrawnLine a={[930, 520]} b={[1150, 560]} k={0.8} />
				<Person is={Mara} name="mara" x={860} y={GEO.hallSide.floor} s={1.65} back frame={f} arms={{l: [10, 0], r: [150, 10]}} />
			</Stage>
		);
	if (i === 6)
		return (
			<Stage set="closet_night" z={1.35} f={[860, 640]} t={t}>
				<Person is={Mara} name="mara" x={MC.x} y={MC.y} s={MC.s} pose="floor" frame={f} eyes="wide" brows="worried" prop="phone" light="screen" />
			</Stage>
		);
	if (i === 7) return <EditorShot f={30} d={60} picture="canvas_man_far" frame={240} total={240} />;
	if (i === 8) return <EditorShot f={30} d={60} picture="canvas_man_close" frame={240} total={240} paint={0.5} manBox={manBoxOf('close')} />;
	if (i === 9) return <FullPicture id="canvas_face" f={10} d={40} />;
	if (i === 10)
		return (
			<Stage set="hall_side_night" z={1} f={[960, 540]} t={t} wash={0.6}>
				<Person is={Mara} name="mara" x={420} y={GEO.hallSide.floor} s={1.65} frame={f} eyes="wide" brows="worried" mouth="o" prop="phone" />
			</Stage>
		);
	return (
		<Stage set="hall_side_night" z={1} f={[960, 540]} t={t} wash={1}>
			{manOutline(880, 900, 1.75, 0).map((d, k) => (
				<Emboss key={k} d={d} k={0.9} />
			))}
			<Emboss d={handPath(1150, 200, 1.3, 10)} k={1} />
		</Stage>
	);
};
