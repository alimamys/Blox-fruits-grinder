// 5. THE THIRD NIGHT - in her parents' bed; 4:00; silence; through the wall, "Danny..."; the hall; the lamp on;
// the bed empty, the blanket raked open; they never found him.
import React from 'react';
import {Dad, Lily, Mom} from '../components/characters/Cast';
import {LieInBed, PARENTS_BED, ParentsBed} from '../stick/bed';
import {DoorOpen, Person} from '../stick/goat';
import {GEO, ramp, shot, Shots, useStick, walk, type Shot} from '../stick/kit';
import {BedClock, Glow, Tears} from '../stick/props';
import {Rake} from '../stick/rake';
import {RoomClock} from './common';

const B = GEO.bed;
const PILLOW_X = 312;
/** the tears across her blanket, pillow end to foot */
const TEAR_A: [number, number] = [460, 790];
const TEAR_B: [number, number] = [1120, 800];

export const ThirdNight: React.FC = () => {
	const {f, t, at, end, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t29 = T('narrator_029_ran');
	const shots: Shot[] = [
		// "I tried to stay awake. I couldn't."
		shot(T('narrator_024_couldnt'), 'master_night', 1.25, 1.35, [760, 600], [640, 610], {tag: 'bed'}),
		// "I woke up at four in the morning."
		shot(T('narrator_025_four'), 'master_night', 2.6, 2.75, [470, 615], [465, 615], {tag: 'bed'}),
		shot(at('clock_400'), 'master_night', 3.6, 3.7, [215, 730], [215, 730], {tag: 'bed'}),
		// "The house was completely silent. No clock. No wind. Nothing."
		shot(T('narrator_026_silent'), 'master_night', 1.0, 1.08, [960, 540], [1000, 540], {tag: 'bed'}),
		// her room is behind that wall
		shot(at('silence'), 'master_night', 1.5, 1.9, [1580, 520], [1640, 520], {tag: 'bed'}),
		// "And then, through the wall, very softly, I heard a voice..."
		shot(T('narrator_027_voice'), 'master_night', 2.5, 2.65, [520, 610], [510, 610], {tag: 'bed'}),
		// RAKE: "Danny..." - on the other side of the wall
		shot(T('rake_001_danny') - 0.3, 'bedroom_night', 1.6, 2.6, [520, 640], [440, 620], {tag: 'danny'}),
		// "Mom didn't wake up."
		shot(T('narrator_028_mom'), 'master_night', 1.6, 1.7, [560, 600], [560, 600], {tag: 'up'}),
		// "I ran down the hall. My bedroom door was open. The lamp was on."
		shot(t29, 'hallway_night', 1.0, 1.0, [960, 560], [960, 560], {tag: 'run'}),
		// "And the bed was empty."
		shot(T('narrator_030_empty'), 'bedroom_night', 1.0, 1.1, [960, 540], [800, 600], {tag: 'empty', light: 'warm'}),
		// the torn blanket
		shot(at('torn'), 'bedroom_night', 2.0, 2.2, [700, 790], [880, 795], {tag: 'empty', light: 'warm'}),
		shot(T('narrator_031_torn'), 'bedroom_night', 1.6, 1.7, [800, 760], [780, 760], {tag: 'empty', light: 'warm'}),
		// "They never found him."
		shot(T('narrator_032_never_found'), 'bedroom_night', 1.05, 1.0, [960, 540], [960, 540], {tag: 'alone', light: 'warm'}),
	];
	const world = (s: Shot) => {
		if (s.set === 'master_night') {
			const awake = t > T('narrator_025_four') + 0.2;
			const lilyP = {eyes: awake ? 'wide' : 'closed', brows: awake ? 'worried' : 'flat', look: t > T('narrator_027_voice') ? [1, -0.2] : [0.4, -0.8], idle: !awake, mouth: 'flat'};
			return (
				<g>
					<Glow cx={1400} cy={300} r={560} color="#b9cdf2" k={0.3} />
					<BedClock x={PARENTS_BED.clock[0]} y={PARENTS_BED.clock[1]} text="4:00" frame={f} />
					<ParentsBed frame={f} mom={Mom} lily={Lily} momP={{eyes: 'closed', brows: 'flat', mouth: 'flat', idle: false}} lilyP={lilyP} />
				</g>
			);
		}
		if (s.tag === 'danny') {
			// Dad in her bed, eyes open; it is crouched right over him, its face at his
			const rt = talk('rake');
			const lean = ramp(t, T('rake_001_danny') - 0.3, T('rake_001_danny', 0.5));
			return (
				<g>
					<Glow cx={470} cy={330} r={420} color="#b9cdf2" k={0.35} />
					<RoomClock f={f} text="4:00" />
					<LieInBed b={B} is={Dad} px={PILLOW_X} s={1.2} frame={f} id="dad" p={{eyes: 'wide', brows: 'worried', look: [1, -0.7], mouth: 'o', idle: false}} />
					{/* it bends down from the hips until its face is just above his */}
					<g transform={`rotate(${-6 - 16 * lean} 640 ${B.quilt - 34})`}>
						<Rake x={600} y={B.quilt - 34} s={1.35} frame={f} pose="side" dir={-1} qa={false} lean={0.4 + lean * 0.6} mouth={Math.max(rt.talk * 0.9, t > T('rake_001_danny') && t < end('rake_001_danny') ? 0.25 : 0)} />
					</g>
				</g>
			);
		}
		if (s.tag === 'run') {
			// she runs from her parents' door to hers; it stands open, the lamp light spilling out
			const w = walk(t, t29 + 0.2, t29 + 2.4, 300, 1380, 2.0);
			const open = 1;
			return (
				<g>
					<DoorOpen r={GEO.hall.right} open={open} inside="#e7b866" panel="#4a3a30" />
					<Glow cx={1630} cy={600} r={420} color="#ffcf7a" k={0.5} />
					<Person is={Lily} name="lily" x={w.x} y={GEO.hall.floor} s={2.0} child frame={f} pose={w.moving ? 'run' : 'stand'} turn={w.moving ? 0.8 : 0.5} phase={w.phase} eyes="wide" brows="worried" mouth="o" look={[1, 0]} />
				</g>
			);
		}
		// her room, the lamp on: the bed empty, the blanket raked open in three long lines
		const lamp = (
			<g>
				<rect x={-100} y={-100} width={2120} height={1280} fill="#ffb04a" opacity={0.1} />
				<Glow cx={60} cy={740} r={640} color="#ffcf7a" k={0.85} />
				{/* the bedside lamp, switched on */}
				<path d="M48,812 L72,812 L66,790 L54,790 Z" fill="#5a4636" stroke="#141414" strokeWidth={4} strokeLinejoin="round" />
				<path d="M60,790 L60,752" stroke="#141414" strokeWidth={5} />
				<path d="M30,756 L90,756 L78,708 L42,708 Z" fill="#ffe3a0" stroke="#141414" strokeWidth={4} strokeLinejoin="round" />
			</g>
		);
		const torn = <Tears a={TEAR_A} b={TEAR_B} k={1} gap={30} />;
		if (s.tag === 'alone')
			return (
				<g>
					{lamp}
					{torn}
					<Person is={Lily} name="lily" x={1470} y={905} s={1.9} child frame={f} turn={-0.5} look={[-1, 0.3]} eyes="wide" brows="sad" mouth="frown" idle={false} />
				</g>
			);
		const inDoor = s.tag === 'empty' && t < at('torn');
		return (
			<g>
				{lamp}
				{torn}
				{inDoor ? <Person is={Lily} name="lily" x={1490} y={905} s={1.9} child frame={f} turn={-0.5} look={[-1, 0.2]} eyes="wide" brows="worried" mouth="o" /> : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
