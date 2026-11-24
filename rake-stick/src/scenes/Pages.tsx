// 6. THE MISSING PAGES - a week later, Dad's wallet; folded small inside it, the pages torn out of Grandma's diary:
// June 14th 1984, Robert lay down in Danny's bed and was taken; "it takes whoever lies down in the child's place."
// Dad tore them out himself when he was nine. He knew. He lay down in her bed anyway.
import React from 'react';
import {PAL} from '../components/characters/Cast';
import {INK, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {DiaryPage, Kitchen, pageLines, SEAT, type PageLine} from './common';

const PAGE: PageLine[] = [
	['grandma_006_june14', "Robert slept in Danny's bed last night,", 'robert', 'night'],
	['grandma_006_june14', 'so it would find him instead.', 'so', ''],
	['grandma_007_name', "At four o'clock, I heard it say his name.", '', 'name'],
	['grandma_007_name', 'My husband is gone.', 'my', ''],
	['grandma_008_rule', 'Mother was right.', '', 'right'],
	['grandma_008_rule', 'It never takes the child.', 'never', 'child'],
	['grandma_008_rule', "It takes whoever lies down in the child's place.", 'takes', ''],
];

/** Dad's brown wallet on the table, open, a small folded square of paper sticking out */
const Wallet: React.FC<{x: number; y: number; s?: number; k?: number}> = ({x, y, s = 1, k = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-62,-6 L62,-6 L58,22 L-58,22 Z" fill="#6b4a32" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
		<path d="M-58,-6 L-4,-26 L-2,-6 Z" fill="#7d573b" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
		<g transform={`translate(${8 + 24 * k} ${-18 - 20 * k}) rotate(${-8 - 10 * k})`}>
			<rect x={-22} y={-16} width={44} height={32} fill="#efe7cf" stroke={INK} strokeWidth={3} />
			<path d="M0,-16 V16 M-22,0 H22" stroke="#b9ad90" strokeWidth={2} />
		</g>
	</g>
);

export const Pages: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const t38 = T('narrator_038_wallet');
	const lines = () => pageLines(PAGE, t, at, end, word);
	const shots: Shot[] = [
		// "A week later, Mom gave me his wallet." - the kitchen at dusk, his chair empty
		shot(t38, 'kitchen_day', 1.12, 1.18, [900, 640], [940, 650], {light: 'dusk', tag: 'table'}),
		// "Folded inside it, very small, were the pages missing from Grandma's diary."
		shot(word('narrator_038_wallet', 'folded', 0.45) - 0.2, 'kitchen_day', 2.2, 2.4, [1180, 800], [1180, 790], {light: 'dusk', tag: 'table'}),
		// the pages, unfolded: June 14th, 1984
		ui(at('unfold'), (fl) => <DiaryPage f={fl} lines={[]} date="June 14th, 1984" tornOut rot={1.5} />),
		ui(T('grandma_006_june14'), (fl, d) => <DiaryPage f={fl} lines={lines()} date="June 14th, 1984" tornOut rot={1.5} z={1 + 0.05 * (fl / Math.max(1, d))} />),
		// "My dad tore those pages out himself, when he was nine. He knew exactly what was coming."
		shot(T('narrator_039_knew'), 'kitchen_day', 2.5, 2.65, [1200, 700], [1200, 700], {light: 'dusk', tag: 'table'}),
		// "And he lay down in my bed anyway." - his empty chair, his mug
		shot(T('narrator_040_anyway'), 'kitchen_day', 1.7, 2.1, [600, 780], [580, 800], {light: 'dusk', tag: 'empty'}),
	];
	const world = (s: Shot) => {
		if (s.set !== 'kitchen_day') return null;
		const ld = talk('lily');
		const crying = t > T('narrator_039_knew');
		const k = Math.min(1, Math.max(0, (t - word('narrator_038_wallet', 'folded', 0.45)) / 1.2));
		return (
			<g>
				<Kitchen
					f={f}
					left={null}
					right={s.tag === 'empty' ? null : 'lily'}
					dusk
					r={{talk: ld.talk, viseme: ld.viseme, palette: PAL.lilyDay, look: crying ? [0, -0.1] : [-0.2, 0.9], eyes: crying ? 'wide' : 'dot', brows: crying ? 'sad' : 'flat', mouth: crying ? 'wobbly' : 'flat', tears: crying ? 0.8 : 0, arms: {l: [40, -100], r: [40, -100]}}}
				/>
				<Wallet x={SEAT.right.x} y={942} s={1.1} k={k} />
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
