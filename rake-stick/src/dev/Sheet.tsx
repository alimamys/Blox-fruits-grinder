// Dev only: one frame per set-up, to check the cast, the thing and the sets before the scenes.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Dad, Lily, Mom, PAL} from '../components/characters/Cast';
import {HideInBed, LieInBed} from '../stick/bed';
import {Person} from '../stick/goat';
import {GEO, Stage} from '../stick/kit';
import {BedClock, Diary, Glow, Table, Tears} from '../stick/props';
import {Rake} from '../stick/rake';

export const SHEET_FRAMES = 8;
const MASTER_Q = ['#bc966f', '#b48d67', '#b48d67', '#bc966f'];

export const Sheet: React.FC = () => {
	const i = useCurrentFrame();
	const f = 40 + i * 13;
	const t = f / 24;
	const B = GEO.bed;
	if (i === 0)
		return (
			<Stage set="bedroom_night" z={1.6} f={[600, 640]} t={t}>
				<BedClock x={GEO.room.clock[0]} y={GEO.room.clock[1] + 20} text="4:00" frame={f} />
				<LieInBed b={B} is={Lily} px={312} s={1.75} child frame={f} id="l0" shirt={PAL.lily.shirt} skin={PAL.lily.skin} p={{eyes: 'wide', brows: 'worried'}} />
				<Rake x={760} y={B.quilt - 34} s={1.35} frame={f} pose="side" dir={-1} />
			</Stage>
		);
	if (i === 1)
		return (
			<Stage set="bedroom_pov_night" z={2.4} f={[935, 860]} t={t}>
				<Rake x={930} y={930} s={1.9} frame={f} pose="front" lean={0.3} />
			</Stage>
		);
	if (i === 2)
		return (
			<Stage set="kitchen_day" z={1} f={[960, 540]} t={t}>
				<Person is={Dad} name="dad" x={620} y={1150} s={2.0} pose="sit" frame={f} arms={{l: [28, -64], r: [28, -64]}} />
				<Person is={Lily} name="lily" x={1180} y={995} s={2.0} child pose="sit" frame={f} palette={PAL.lilyDay} arms={{l: [28, -64], r: [28, -64]}} eyes="wide" />
				<Table y={950} frame={f} items={[{kind: 'plate', x: 620}, {kind: 'mug', x: 820}, {kind: 'plate', x: 1180}]} />
			</Stage>
		);
	if (i === 3)
		return (
			<Stage set="attic_day" z={1} f={[960, 540]} t={t}>
				<Person is={Lily} name="lily" x={900} y={1010} s={2.0} child pose="floor" frame={f} palette={PAL.lilyDay} arms={{l: [-10, -60], r: [-10, -60]}} look={[0, 0.9]} />
				<Diary x={900} y={930} s={1.0} frame={f} />
			</Stage>
		);
	if (i === 4)
		return (
			<Stage set="hallway_night" z={1} f={[960, 540]} t={t}>
				<Person is={Lily} name="lily" x={1100} y={GEO.hall.floor} s={2.3} child pose="run" turn={0.8} phase={f / 3} frame={f} eyes="wide" mouth="o" />
				<Rake x={600} y={GEO.hall.floor} s={1.6} frame={f} pose="stand" />
			</Stage>
		);
	if (i === 5)
		return (
			<Stage set="master_night" z={1.5} f={[620, 640]} t={t}>
				<LieInBed b={GEO.master} is={Mom} px={215} s={1.3} frame={f} id="m" shirt={PAL.mom.shirt} skin={PAL.mom.skin} p={{eyes: 'closed'}} />
				<LieInBed b={GEO.master} is={Lily} px={430} s={1.6} child frame={f} id="l" shirt={PAL.lily.shirt} skin={PAL.lily.skin} dy={14} p={{eyes: 'wide', look: [1, 0]}} />
			</Stage>
		);
	if (i === 6)
		return (
			<Stage set="bedroom_night" z={1.8} f={[560, 640]} t={t}>
				<LieInBed b={B} is={Dad} px={312} s={1.2} frame={f} id="d" shirt={PAL.dad.shirt} skin={PAL.dad.skin} p={{eyes: 'wide', brows: 'worried', mouth: 'o', look: [1, -0.7]}} />
				<Rake x={900} y={B.quilt - 34} s={1.35} frame={f} pose="side" dir={-1} lean={0.6} mouth={0.4} />
			</Stage>
		);
	return (
		<Stage set="bedroom_night" z={1.3} f={[700, 700]} t={t}>
			<Glow cx={700} cy={760} r={500} color="#ffe2a0" k={0.5} />
			<Tears a={[460, 790]} b={[1120, 800]} k={1} />
			<Person is={Lily} name="lily" x={1300} y={GEO.room.stand} s={2.1} child frame={f} eyes="wide" mouth="o" brows="worried" look={[-1, 0.2]} />
		</Stage>
	);
};
