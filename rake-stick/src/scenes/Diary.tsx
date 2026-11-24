// 3. THE DIARY - the attic; the blue notebook; grandmother's 1984 entry (her handwriting appears as she reads);
// the torn-out pages; Danny was Dad; his room is hers now.
import React from 'react';
import {Lily, PAL} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {GEO, lerp, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Diary as Notebook, Glow} from '../stick/props';
import {DiaryPage, reveal} from './common';

/** the page as she wrote it: [line id, text, word that starts it (or '' for the line's start), word that ends it] */
const ENTRY: Array<[string, string, string, string]> = [
	['grandma_001_june', 'Something came into the house last night.', 'something', ''],
	['grandma_002_danny', "It sat on Danny's bed and watched him sleep.", '', ''],
	['grandma_003_mother', 'My mother told me about it when I was a girl.', '', 'girl'],
	['grandma_003_mother', 'I thought it was a story to keep children in bed.', 'thought', ''],
	['grandma_004_rule', 'The first time, it only watches.', '', 'watches'],
	['grandma_004_rule', 'The second time, it comes closer.', 'second', 'closer'],
	['grandma_004_rule', 'The third time... it says your name.', 'third', ''],
	['grandma_005_our_room', 'Danny sleeps in our room now.', '', 'now'],
	['grandma_005_our_room', 'I will not let it come back.', 'will', ''],
];

export const Diary: React.FC = () => {
	const {f, t, at, end, word} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t15 = T('narrator_015_attic');
	const t16 = T('narrator_016_notebook');
	const w0 = (id: string, w: string) => (w ? word(id, w, 0) - 0.3 : at(id));
	const w1 = (id: string, w: string) => (w ? word(id, w, 1) + 0.35 : end(id));
	const lines = (): Array<[string, number]> => ENTRY.map(([id, txt, a, b]) => [txt, reveal(t, w0(id, a), w1(id, b))]);
	const shots: Shot[] = [
		// "That weekend, Dad sent me up to the attic to find the box fan."
		shot(t15, 'attic_day', 1.0, 1.05, [960, 560], [940, 580], {tag: 'climb'}),
		shot(at('attic'), 'attic_day', 1.05, 1.1, [940, 580], [900, 600], {tag: 'look'}),
		// "Behind the boxes there was a little blue notebook with a broken lock..."
		shot(t16, 'attic_day', 1.9, 2.0, [380, 760], [400, 760], {tag: 'find'}),
		// "Most of it was boring... and then, near the end, the handwriting changed."
		shot(T('narrator_017_changed'), 'attic_day', 1.6, 1.7, [900, 760], [900, 760], {tag: 'read'}),
		// the page, then the entry, line by line in her handwriting
		ui(at('page'), (fl) => <DiaryPage f={fl} lines={[]} />),
		ui(T('grandma_001_june'), (fl) => <DiaryPage f={fl} lines={lines()} />),
		// "My mother told me about it when I was a girl..." - Lily reading
		shot(T('grandma_003_mother'), 'attic_day', 2.4, 2.5, [900, 760], [900, 765], {tag: 'read'}),
		ui(T('grandma_004_rule'), (fl, d) => <DiaryPage f={fl} lines={lines()} z={1 + 0.06 * (fl / Math.max(1, d))} />),
		// "That was the last page. The rest had been torn out."
		ui(T('narrator_018_last_page'), (fl) => <DiaryPage f={fl} lines={ENTRY.map(([, txt]) => [txt, 1])} torn />),
		// "My dad's name is Daniel. When he was a boy, everyone called him Danny."
		shot(T('narrator_019_daniel'), 'attic_day', 2.8, 2.95, [900, 770], [900, 775], {tag: 'realize'}),
		// "And his room, the little bedroom at the end of the hall, was mine now." - its door
		shot(T('narrator_020_mine_now'), 'hallway_night', 1.0, 1.7, [960, 560], [1630, 520], {light: 'dim'}),
		shot(at('realize'), 'attic_day', 3.2, 3.3, [900, 740], [900, 740], {tag: 'realize'}),
	];
	const world = (s: Shot) => {
		if (s.set !== 'attic_day') return null;
		const beam = <Glow cx={900} cy={760} r={460} color="#ffe2a0" k={0.45} />;
		if (s.tag === 'climb') {
			// she comes up through the hatch
			const up = ramp(t, t15 + 0.6, t15 + 2.6);
			return (
				<g>
					{beam}
					<defs>
						<clipPath id="hatch">
							<rect x={0} y={0} width={1920} height={1032} />
						</clipPath>
					</defs>
					<g clipPath="url(#hatch)">
						<Person is={Lily} name="lily" x={870} y={lerp(1400, 1040, up)} s={2.0} child frame={f} palette={PAL.lilyDay} look={[0, -0.4]} noqa={up < 0.95} />
					</g>
				</g>
			);
		}
		if (s.tag === 'look') return <g>{beam}<Person is={Lily} name="lily" x={870} y={1040} s={2.0} child frame={f} palette={PAL.lilyDay} turn={-0.5} look={[-1, 0]} /></g>;
		if (s.tag === 'find')
			return (
				<g>
					{beam}
					<Person is={Lily} name="lily" x={470} y={1040} s={2.0} child frame={f} palette={PAL.lilyDay} turn={-0.4} look={[-0.6, 0.6]} arms={{l: [70, -40], r: [10, 0]}} />
					<Notebook x={330} y={905} s={0.8} open={0} frame={f} />
				</g>
			);
		// reading on the floor in the beam of light
		const scared = s.tag === 'realize';
		return (
			<g>
				{beam}
				<Person is={Lily} name="lily" x={900} y={GEO.attic.floor + 25} s={2.0} child pose="floor" frame={f} palette={PAL.lilyDay} arms={{l: [-10, -60], r: [-10, -60]}} look={scared ? [0, -0.2] : [0, 0.9]} eyes={scared ? 'wide' : 'dot'} brows={scared ? 'worried' : 'flat'} mouth={scared ? 'o' : 'flat'} idle={!(s.tag === 'realize' && t > at('realize'))} />
				<Notebook x={900} y={GEO.attic.floor - 60} s={1.0} frame={f} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
