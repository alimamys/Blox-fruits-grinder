// 1. THE DOORS - cold open. 3:06 am: every door in the building opens.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disclaimer, LockScreen, PhoneFrame, TitleCard} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {DarkStage, Plate} from '../layout/Plate';
import {Shots, type ShotProps} from '../utils/scene';
import {Black, MOOD, prog} from './common';

/** Everyone in the corridor, seen from Sarah's door (the peephole view) - reused all film long. */
export const CrossCrowd: React.FC<{facing?: 'left' | 'front'}> = ({facing = 'left'}) => (
	<>
		<Person who="lilac" x={1165} y={830} h={430} facing={facing} />
		<Person who="harris" x={968} y={800} h={455} facing={facing} />
		<Person who="robe" x={745} y={860} h={520} facing={facing} />
		<Person who="oldman" x={590} y={885} h={470} facing={facing} pose="handOnWall" />
		<Person who="mother" x={1290} y={870} h={490} facing={facing} pose="holdChild" />
		<Person who="beard" x={1440} y={895} h={560} facing={facing} />
		<Person who="blanket" x={1600} y={915} h={510} facing={facing} />
	</>
);

/** The residents from behind, in the long corridor, facing the stairwell at the far end. */
export const BackCrowd: React.FC = () => (
	<>
		<Person who="oldman" x={1255} y={745} h={300} facing="back" pose="handOnWall" />
		<Person who="lilac" x={1130} y={770} h={330} facing="back" />
		<Person who="mother" x={860} y={790} h={370} facing="back" pose="holdChild" />
		<Person who="blanket" x={1010} y={830} h={430} facing="back" />
		<Person who="robe" x={720} y={905} h={560} facing="back" />
		<Person who="beard" x={1210} y={935} h={610} facing="back" />
	</>
);

const LightSlit: React.FC<ShotProps> = ({f}) => {
	// black; at 0.5 s a latch clicks and a door opens a crack: a blade of yellow-green light widens
	const open = Math.max(0, (f - 12) / 30);
	const w = 4 + 220 * Math.min(1, open * open);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{f >= 12 ? (
				<div style={{position: 'absolute', left: 960 - w / 2, top: 140, width: w, height: 800, background: 'linear-gradient(90deg, rgba(150,170,90,0) 0%, rgba(214,226,150,0.85) 50%, rgba(150,170,90,0) 100%)', filter: 'blur(6px)', opacity: Math.min(1, (f - 12) / 4)}} />
			) : null}
		</AbsoluteFill>
	);
};

export const Doors: React.FC = () => (
	<Shots
		shots={[
			// black; CLICK; one door opens a crack, then doors open all down the corridor; disclaimer
			{id: 'd_00_black', at: 0, render: LightSlit, overlay: ({f, d}) => <Disclaimer f={f} d={d} />},
			// "I thought my neighbors were sleepwalking." - the corridor: every door swings open, one after another
			{
				id: 'd_01_corridor_doors',
				at: 'narrator_001_sleepwalking',
				render: () => <Plate loc="hallway" />,
				art: {
					kind: 'still',
					loc: 'hallway',
					noPeople: true,
					quality: 'medium',
					mood: MOOD.hall,
					prompt: 'The fourth-floor corridor exactly as in the location reference, one-point perspective toward the black stairwell opening at the far end. Every apartment door is CLOSED. Empty, still, wrong.',
					doors: {prompt: 'Every apartment door along both walls now stands WIDE OPEN, swung inward into the dark flats; behind each doorway only darkness and the faint shape of a dark room. Nobody is visible.', start: 0.04, stagger: 0.24},
					move: {z0: 1.02, z1: 1.09, x0: 0.52, y0: 0.47},
				},
			},
			// "It was exactly 3:06 in the morning..." - Sarah's eyes snap open in the dark
			{
				id: 'd_02_wakes',
				at: 'narrator_002_exactly_306',
				render: () => (
					<Plate loc="bedroom" cam={{z: 1.9, cx: 560, cy: 620}}>
						<ellipse cx={560} cy={598} rx={34} ry={40} fill="#f0cdb4" />
						<path d="M520,590 Q560,540 600,590 L612,640 L508,640 Z" fill="#9a4a22" />
						<rect x={430} y={652} width={330} height={150} rx={30} fill="#e9e6df" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['sarah'],
					loc: 'bedroom',
					quality: 'high',
					mood: MOOD.bedroom,
					prompt: 'Close shot from above the bed: Sarah lies on her back under the white duvet, her head on the pillow, auburn hair spread out; her eyes have just snapped OPEN, staring up into the dark, frightened and listening. Orange streetlight stripes across the duvet.',
					variants: [{name: 'closed', prompt: 'Her eyes are CLOSED - she is asleep, her face relaxed. Nothing else changes.'}],
					seq: [
						['closed', 0],
						['base', 0.28],
					],
					move: {z0: 1.04, z1: 1.12, y0: 0.45},
				},
			},
			// her phone on the nightstand: 3:06
			{
				id: 'd_03_phone',
				at: 'narrator_002_exactly_306',
				frac: 0.5,
				render: ({f, d}) => (
					<PhoneFrame f={f} d={d} tilt={-6}>
						<LockScreen time="3:06" glow={Math.min(1, f / 6)} />
					</PhoneFrame>
				),
			},
			// "Not one or two." - across the corridor two doors open
			{
				id: 'd_04_cross_doors',
				at: 'narrator_003_not_one_or_two',
				render: () => <Plate loc="hallway_cross" />,
				art: {
					kind: 'still',
					loc: 'hallway_cross',
					noPeople: true,
					quality: 'medium',
					mood: MOOD.hall,
					prompt: 'The corridor seen straight across from Sarah\'s door, exactly as in the location reference: Mr. Harris\'s closed door straight ahead, the stairwell with its railing at the left end. Every door CLOSED. Empty.',
					doors: {prompt: 'Mr. Harris\'s door straight ahead and the door at the right edge now stand WIDE OPEN, swung inward; darkness inside. Nobody is visible.', start: 0.12, stagger: 0.5},
					move: {z0: 1.04, z1: 1.08},
				},
			},
			// "All of them." + the beat: the long corridor, every door standing open
			{
				id: 'd_05_all_open',
				at: 'narrator_004_all_of_them',
				render: () => <Plate loc="hallway" />,
				art: {kind: 'reuse', reuse: 'd_01_corridor_doors', show: 'open', move: {z0: 1.1, z1: 1.22, x0: 0.52, y0: 0.46}, fx: 'flicker'},
			},
			// "I looked through my peephole..." - her eye to the peephole
			{
				id: 'd_06_eye_peephole',
				at: 'narrator_005_peephole',
				render: () => (
					<DarkStage bg="#0c1018">
						<rect x={1080} y={0} width={840} height={1080} fill="#3a2a1f" />
						<circle cx={1090} cy={470} r={10} fill="#d8e2a0" />
						<Person who="sarah" x={930} y={1600} h={1500} facing="right" pose="reach" />
					</DarkStage>
				),
				art: {
					kind: 'still',
					chars: ['sarah'],
					loc: 'flat',
					quality: 'high',
					blink: true,
					mood: MOOD.flat,
					prompt: 'Close-up from the side inside her dark flat: Sarah, in profile facing right, presses her face to the inside of her dark wooden front door, her right eye at the small brass peephole, her fingertips flat on the wood. A tiny point of yellow-green corridor light from the peephole lights her eye and cheek; everything else is dark blue. Frightened, holding her breath.',
					move: {z0: 1.03, z1: 1.1, x0: 0.55, y0: 0.45},
				},
			},
			// "Every single neighbor was standing in the hallway." - THROUGH THE PEEPHOLE
			{
				id: 'd_07_peephole_pov',
				at: 'narrator_006_every_neighbor',
				render: () => (
					<Plate loc="hallway_cross">
						<CrossCrowd />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['harris', 'mother', 'residents'],
					loc: 'hallway_cross',
					quality: 'high',
					peephole: true,
					mood: MOOD.peep,
					prompt: 'Straight across the corridor from Sarah\'s door: Mr. Harris stands in his OPEN doorway in the middle (his dark flat behind him); the five residents from the residents sheet and the mother holding her boy stand along the corridor in front of the doors exactly where the layout puts them. ALL of them stand completely still and ALL face LEFT toward the stairwell at the left end - faces in profile, eyes wide, mouths shut. Nobody looks at the camera.',
					move: {z0: 1.0, z1: 1.04},
				},
			},
			// "Completely still." - two of them, frozen
			{
				id: 'd_08_still',
				at: 'narrator_007_still',
				render: () => (
					<Plate loc="hallway_cross" cam={{z: 2.3, cx: 700, cy: 520}}>
						<Person who="oldman" x={610} y={885} h={470} facing="left" pose="handOnWall" />
						<Person who="lilac" x={800} y={880} h={440} facing="left" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['residents'],
					loc: 'hallway_cross',
					quality: 'high',
					mood: MOOD.hall,
					prompt: 'Medium close-up in the corridor: the bald very old man (one hand flat against the wall) and the grey-haired woman in the lilac dressing gown stand side by side in profile, facing LEFT toward the stairs, utterly frozen - wide unblinking eyes, mouths shut, not breathing. Fluorescent light from above.',
					move: {z0: 1.06, z1: 1.1},
				},
			},
			// "Facing the staircase." - from behind them, the black stairwell at the end
			{
				id: 'd_09_facing_stairs',
				at: 'narrator_008_facing_stairs',
				render: () => (
					<Plate loc="hallway">
						<BackCrowd />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['mother', 'residents'],
					loc: 'hallway',
					quality: 'medium',
					mood: MOOD.hall,
					prompt: 'The long corridor from the window end, one-point perspective: the residents (the five from the residents sheet and the mother holding her boy) stand spread along the corridor where the layout puts them, their BACKS to us, all facing the black stairwell opening at the far end, completely still. Every apartment door stands open.',
					move: {z0: 1.02, z1: 1.08, x0: 0.52, y0: 0.47},
				},
			},
			// "Nobody was talking. Nobody was moving." - Mr. Harris, frozen in his doorway
			{
				id: 'd_10_harris_frozen',
				at: 'narrator_009_nobody_talking',
				render: () => (
					<Plate loc="hallway_cross" cam={{z: 2.6, cx: 968, cy: 450}}>
						<Person who="harris" x={968} y={800} h={455} facing="left" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['harris'],
					loc: 'hallway_cross',
					quality: 'high',
					mood: MOOD.hall,
					prompt: 'Close-up: Mr. Harris in his open doorway, three-quarter profile facing LEFT toward the stairs, frozen - pale, eyes wide and wet, lips pressed tightly shut, not breathing. His dark flat behind him. Harsh fluorescent light from above.',
					move: {z0: 1.04, z1: 1.1, y0: 0.45},
				},
			},
			// "And none of them seemed to be breathing." - the mother and her boy
			{
				id: 'd_11_mother',
				at: 'narrator_010_breathing',
				render: () => (
					<Plate loc="hallway_cross" cam={{z: 2.4, cx: 1290, cy: 520}}>
						<Person who="mother" x={1290} y={870} h={490} facing="left" pose="holdChild" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['mother'],
					loc: 'hallway_cross',
					quality: 'high',
					mood: MOOD.hall,
					prompt: 'Close-up in the corridor: the mother holds her little boy tight against her chest, both facing LEFT toward the stairs, frozen; her lips pressed together, not breathing; the boy\'s face pressed into her shoulder, eyes squeezed shut.',
					move: {z0: 1.04, z1: 1.09},
				},
			},
			// held breath: the peephole view again, total silence
			{id: 'd_12_held', at: 'held_breath', render: () => <Plate loc="hallway_cross" />, art: {kind: 'reuse', reuse: 'd_07_peephole_pov', move: {z0: 1.05, z1: 1.08}}},
			// "Then I heard something coming up the stairs." - a shadow climbs the stairwell wall
			{
				id: 'd_13_stairwell',
				at: 'narrator_011_coming_up',
				render: () => <Plate loc="stairwell" />,
				overlay: ({f, d}) => {
					const t = prog(f, d, 0.15, 1);
					return (
						<AbsoluteFill style={{pointerEvents: 'none'}}>
							<div style={{position: 'absolute', left: 260 + 120 * t, top: 760 - 330 * t, width: 260, height: 620, borderRadius: '45% 45% 30% 30%', background: 'rgba(0,0,0,0.62)', filter: 'blur(28px)', transform: 'skewX(-12deg) rotate(-8deg)', opacity: Math.min(1, t * 3)}} />
						</AbsoluteFill>
					);
				},
				art: {
					kind: 'still',
					loc: 'stairwell',
					noPeople: true,
					dark: true,
					quality: 'medium',
					mood: MOOD.stair,
					prompt: 'The stairwell from the fourth floor looking down the concrete flights, exactly as in the location reference. Dark; the caged bulb on the landing below barely lit. Empty.',
					fx: 'flicker',
					grade: 1.75,
					move: {z0: 1.04, z1: 1.1, x0: 0.45, y0: 0.6},
				},
			},
			// "Something heavy." - her eye at the peephole widens
			{
				id: 'd_14_eye_wide',
				at: 'narrator_012_heavy',
				render: () => (
					<DarkStage bg="#120f0c">
						<ellipse cx={960} cy={540} rx={300} ry={130} fill="#f0cdb4" />
						<circle cx={960} cy={540} r={95} fill="#6f8a73" />
						<circle cx={960} cy={540} r={40} fill="#0b0b0b" />
						<path d="M600,380 Q960,250 1320,380" stroke="#9a4a22" strokeWidth={40} fill="none" />
					</DarkStage>
				),
				art: {
					kind: 'still',
					chars: ['sarah'],
					quality: 'high',
					mood: 'Darkness; one small point of yellow-green light from the peephole falls on her eye.',
					prompt: 'Extreme close-up of Sarah\'s green-grey eye right next to the brass peephole of her door, a few auburn hair strands, faint freckles; the yellow-green light from the peephole glints in her iris. Frightened.',
					variants: [{name: 'wide', prompt: 'Her eye opens much WIDER in terror: the lids pull far apart, the pupil shrinks to a pinpoint, the brow lifts. Nothing else changes.'}],
					seq: [
						['base', 0],
						['wide', 0.4],
					],
					move: {z0: 1.02, z1: 1.07},
				},
			},
			// "Something dragging." - on the landing below, a stained sack slides into view
			{
				id: 'd_15_sack',
				at: 'narrator_013_dragging',
				render: () => <Plate loc="stairwell" cam={{z: 2.0, cx: 760, cy: 780}} />,
				art: {
					kind: 'still',
					loc: 'stairwell',
					noPeople: true,
					dark: true,
					quality: 'medium',
					mood: MOOD.stair,
					prompt: 'Close on the bottom of a concrete flight and the landing below it, dim flickering green-grey light. Empty.',
					variants: [
						{name: 'sack1', prompt: 'At the edge of the landing, the corner of a large, coarse, grimy, darkly stained burlap sack has slid into the light, dragged by something unseen. Nothing else changes.'},
						{name: 'sack2', prompt: 'More of the large grimy, darkly stained burlap sack has been dragged into view across the landing toward the steps, its rope-tied neck trailing. Nothing else changes.'},
					],
					seq: [
						['base', 0],
						['sack1', 0.3],
						['sack2', 0.68],
					],
					fx: 'flicker',
					move: {z0: 1.03, z1: 1.08},
				},
			},
			// "And when I finally saw what it was..." - push into the black stairwell at the end of the corridor
			{id: 'd_16_push_stairs', at: 'narrator_014_finally_saw', render: () => <Plate loc="hallway" />, art: {kind: 'reuse', reuse: 'd_09_facing_stairs', move: {z0: 1.08, z1: 1.55, x0: 0.52, y0: 0.42}}},
			// "I understood why everyone was so afraid." - Sarah, back to her door, hand over her mouth
			{
				id: 'd_17_sarah_afraid',
				at: 'narrator_015_so_afraid',
				render: () => (
					<Plate loc="flat" cam={{z: 2.1, cx: 920, cy: 420}}>
						<Person who="sarah" x={920} y={780} h={600} facing="front" pose="coverMouth" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['sarah'],
					loc: 'flat',
					quality: 'high',
					blink: true,
					fx: 'tremble',
					mood: MOOD.flat,
					prompt: 'Medium close-up: Sarah stands with her back pressed against the inside of her front door, one hand clamped over her mouth, eyes wide with terror, trembling; the thin yellow-green line of corridor light under the door behind her feet.',
					move: {z0: 1.05, z1: 1.12, y0: 0.42},
				},
			},
			// creature glimpse: long grey fingers curl over the railing
			{
				id: 'd_18_fingers',
				at: 'creature_glimpse',
				render: () => (
					<DarkStage bg="#0d120f">
						<path d="M0,820 L1920,300" stroke="#4a514a" strokeWidth={46} />
						<path d="M300,760 L300,1080 M800,620 L800,1080 M1300,480 L1300,1080" stroke="#4a514a" strokeWidth={22} />
					</DarkStage>
				),
				art: {
					kind: 'still',
					chars: ['creature'],
					loc: 'stairwell',
					quality: 'high',
					dark: true,
					noPeople: true,
					mood: MOOD.hallDark,
					prompt: 'Close-up in the dark stairwell: the black metal stair railing runs diagonally across the frame, lit in a short burst of flickering green-grey light. Nothing else.',
					variants: [
						{name: 'f1', prompt: 'Four impossibly long, thin, grey fingers - the creature\'s, as on its design sheet - have appeared over the top of the railing from below, their tips just curling over the metal. Nothing else changes.'},
						{name: 'f2', prompt: 'The impossibly long grey fingers (as on the creature\'s design sheet) now curl tightly all the way around the railing, gripping it; part of the bony grey hand is visible. Nothing else changes.'},
					],
					seq: [
						['base', 0],
						['f1', 0.22],
						['f2', 0.55],
					],
					fx: 'flicker',
					move: {z0: 1.02, z1: 1.1},
				},
			},
			{id: 'd_19_black', at: 'cut_black', render: () => <Black />},
			{id: 'd_20_title', at: 'title', render: ({f, d}) => <TitleCard f={f} d={d} />},
		]}
	/>
);
