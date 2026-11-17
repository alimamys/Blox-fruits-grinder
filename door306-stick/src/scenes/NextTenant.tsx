// 10. THE NEXT TENANT - a bright, ordinary morning. Neighbours say good morning; Mr. Harris with his coffee.
// The landlord finds her phone, takes her name off the mailbox, crosses it out in the notebook, posts the ad.
// "It's a very quiet building." Then 3:05:58... 3:06. Click. Click. Every door.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Boy, Harris, Landlord, Mother, RobeWoman, Shawl, TShirt} from '../components/characters/Cast';
import {Prop} from '../components/characters/Creature';
import {AdScreen, Clock, NamesPage, NewPage, TheEnd} from '../components/ui/Paper';
import {FPS} from '../data/timeline';
import {HallDoor} from '../stick/d306';
import {Person} from '../stick/goat';
import {GEO, gait, INK, ramp, shot, Shots, useStick, walk} from '../stick/kit';
import {Group, type Spec} from '../stick/places';
import {FLAT_PROPS} from './NewApartment';
import {FlatDoorOpen} from './Offering';

export const NextTenant: React.FC = () => {
	const {f, t, at, talk, total} = useStick();
	const m = (id: string) => at(id);
	const tKids = m('morning_kids');
	const tGreet = m('morning_greet');
	const tCoffee = m('harris_coffee');
	const tEnter = m('landlord_enters');
	const tPhone = m('phone_found');
	const tDrawer = m('phone_drawer');
	const tMail = m('mailbox');
	const tNote = m('notebook');
	const tNames = m('names_crossed');
	const tNew = m('new_page');
	const tAd = m('laptop_ad');
	const tRing = m('phone_rings');
	const tGlance = m('glance_notebook');
	const tL3 = m('landlord_003_very_friendly');
	const tWiden = m('smile_widens');
	const tCB = m('cut_black_2');
	const t58 = m('clock_58');
	const t59 = m('clock_59');
	const t00 = m('clock_00');
	const tC1 = m('click_1');
	const tC2 = m('click_2');
	const tAll = m('doors_all');
	const tEnd = m('the_end');
	const lan = talk('landlord');
	const ins = (a: number, b: number) => [f - Math.round(a * FPS), Math.round((b - a) * FPS)] as const;
	// full-screen paper and screens
	if (t >= tNames && t < tNew) {
		const [lf, d] = ins(tNames, tNew);
		return <NamesPage f={lf} d={d} strike={Math.min(1, Math.max(0, (lf - d * 0.35) / (d * 0.35)))} />;
	}
	if (t >= tNew && t < tAd) {
		const [lf, d] = ins(tNew, tAd);
		return <NewPage f={lf} d={d} />;
	}
	if (t >= tAd && t < tRing) {
		const [lf, d] = ins(tAd, tRing);
		return <AdScreen f={lf} d={d} />;
	}
	if (t >= tGlance && t < tL3) {
		const [lf, d] = ins(tGlance, tL3);
		return <NamesPage f={lf + 40} d={d + 40} />;
	}
	if (t >= tCB && t < t58) return <AbsoluteFill style={{background: '#000'}} />;
	if (t >= t58 && t < tC1) return <Clock time={t < t59 ? '3:05:58' : t < t00 ? '3:05:59' : '3:06:00'} f={f} />;
	if (t >= tEnd) {
		const [lf, d] = ins(tEnd, total);
		return <TheEnd f={lf} d={d} />;
	}
	const HD = GEO.hallDay;
	const kids = walk(t, tKids + 0.1, tGreet - 0.2, -100, 1200, 1.5);
	const momW = walk(t, tKids + 0.4, tGreet - 0.1, -260, 1040, 1.5);
	const llW = walk(t, tEnter + 0.4, tPhone, 1600, 1100, 1.6);
	const lobbyW = walk(t, tMail, tMail + 1.6, 1500, 1000, 1.6);
	const cardOut = ramp(t, tMail + 1.8, tNote - 0.3);
	const shots = [
		shot(0, 'exterior_day', 1.0, 1.04, [960, 540], [960, 520]),
		shot(tKids, 'hallway_day', 1.0, 1.0, [960, 540]),
		shot(tGreet, 'hallway_day', 1.4, 1.45, [1150, 600], [1150, 600]),
		shot(tCoffee, 'hallway_day', 1.8, 1.85, [400, 580], [400, 575]),
		shot(tEnter, 'flat_day_bare', 1.0, 1.0, [960, 540]),
		shot(tPhone, 'flat_day_bare', 1.9, 2.0, [1060, 640], [1060, 640]),
		shot(tMail, 'lobby_day', 1.0, 1.0, [960, 540]),
		shot(tMail + 1.8, 'lobby_day', 2.3, 2.4, [860, 480], [860, 480]),
		shot(tNote, 'office_day', 1.25, 1.3, [835, 560], [835, 560]),
		shot(tRing, 'office_day', 1.6, 1.65, [835, 500], [835, 495]),
		shot(tL3, 'office_day', 1.9, 1.95, [835, 470], [835, 465]),
		shot(tWiden, 'office_day', 2.5, 2.6, [835, 430], [835, 425]),
		shot(tC1, 'hallway_night', 1.0, 1.0, [960, 540]),
	];
	const world = (set: string) => {
		if (set === 'exterior_day') return null;
		if (set === 'hallway_day') {
			const greetP: Spec[] = [
				{is: TShirt, name: 'tshirt', x: 980, y: HD.floor + 30, s: 1.5, frame: f, arms: 'wave', mouth: 'smile', look: [1, 0], turn: 0.4},
				{is: Shawl, name: 'shawl', x: 1330, y: HD.floor + 30, s: 1.5, frame: f, arms: t > tGreet + 0.6 ? 'wave' : 'down', mouth: 'smile', look: [-1, 0], turn: -0.4},
				{is: RobeWoman, name: 'robewoman', x: 1520, y: HD.floor + 30, s: 1.5, frame: f, mouth: 'smile', look: [-1, 0]},
			];
			if (t >= tCoffee) {
				return (
					<g>
						<Person is={Harris} name="harris" x={360} y={HD.floor + 30} s={1.6} frame={f} arms="holdOne" look={[1, 0]} brows="sad" mouth="flat" />
						<g transform={`translate(${360 + 30} ${HD.floor + 30 - 1.6 * 150})`}>
							<rect x={-14} y={-26} width={28} height={30} rx={4} fill="#eae4d6" stroke={INK} strokeWidth={4} />
							<path d="M14,-18 q12,0 12,10 q0,10 -12,10" fill="none" stroke={INK} strokeWidth={4} />
							{[0, 1].map((i) => (
								<path key={i} d={`M${-6 + i * 10},${-34 - ((f * 1.2 + i * 12) % 26)} q6,-8 0,-16`} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
							))}
						</g>
					</g>
				);
			}
			if (t >= tGreet) return <Group people={greetP} />;
			return (
				<g>
					<Person is={Mother} name="mother" x={momW.x} y={HD.floor + 30} s={1.5} frame={f} {...gait(momW)} mouth="smile" edge={momW.x < 100} />
					<Person is={Boy} name="boy" x={kids.x} y={HD.floor + 40} s={1.5} frame={f} {...(kids.moving ? {pose: 'run', turn: 0.8, phase: kids.phase} : {})} mouth="laugh" edge={kids.x < 100} />
				</g>
			);
		}
		if (set === 'flat_day_bare') {
			const has = t < tDrawer;
			return (
				<g>
					<FlatDoorOpen open={0.6} />
					<Prop name="table" x={FLAT_PROPS.table.x} y={FLAT_PROPS.table.y} w={FLAT_PROPS.table.w} />
					<Prop name="sofa" x={FLAT_PROPS.sofa.x} y={FLAT_PROPS.sofa.y} w={FLAT_PROPS.sofa.w} />
					{t < tPhone + 0.8 ? <rect x={1010} y={GEO.flat.floor - 8} width={46} height={22} rx={4} fill="#1d1d22" stroke={INK} strokeWidth={3} transform={`rotate(-12 1033 ${GEO.flat.floor})`} /> : null}
					<Person is={Landlord} name="landlord" x={llW.x} y={GEO.flat.floor} s={1.6} frame={f} {...gait(llW)} look={[0, 1]} lean={t >= tPhone && t < tPhone + 1 ? 16 : 0} mouth="flat" prop={t >= tPhone + 0.8 && has ? 'phone' : 'none'} propGlow="#2a3550" arms={t >= tPhone + 0.8 && has ? 'holdOne' : 'down'} />
				</g>
			);
		}
		if (set === 'lobby_day') {
			return (
				<g>
					<Person is={Landlord} name="landlord" x={lobbyW.x} y={GEO.lobby.floor} s={1.6} frame={f} {...gait(lobbyW)} arms={t >= tMail + 1.8 ? {l: [10, 0], r: [150, 20]} : 'down'} look={[-1, -0.5]} mouth="flat" />
					<rect x={865 - cardOut * 40} y={410} width={56} height={16} fill="#f2efe6" stroke={INK} strokeWidth={2} opacity={1} transform={`rotate(${-cardOut * 20} 893 418)`} />
				</g>
			);
		}
		if (set === 'office_day') {
			const O = GEO.office;
			const phone = t >= tRing;
			return (
				<g>
					<defs>
						<clipPath id="behindDesk">
							<rect x={0} y={0} width={1920} height={O.desk[1] + 6} />
						</clipPath>
					</defs>
					<g clipPath="url(#behindDesk)">
						<Person is={Landlord} name="landlord" x={835} y={O.desk[1] + 140} s={1.6} frame={f} pose="sit" look={phone ? [0.3, 0] : [0, 1]} arms={phone ? 'phoneEar' : 'lap'} prop={phone ? 'handset' : 'none'} mouth={lan.talk > 0 ? 'open' : t >= tWiden ? 'grin' : phone ? 'smile' : 'flat'} talk={lan.talk} viseme={lan.viseme} />
					</g>
					<Prop name="notebook" x={1010} y={O.desk[1] + 8} w={110} />
				</g>
			);
		}
		// 3:06 again: one door, another, then all of them; the neighbours step out
		const o1 = ramp(t, tC1, tC1 + 0.6);
		const o2 = ramp(t, tC2, tC2 + 0.6);
		const o3 = ramp(t, tAll, tAll + 0.6);
		return (
			<g>
				<HallDoor r={GEO.hall.doors[0]} open={o1} />
				<HallDoor r={GEO.hall.doors[2]} open={o2} />
				<HallDoor r={GEO.hall.doors[1]} open={o3} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
