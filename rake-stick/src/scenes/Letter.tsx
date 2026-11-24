// 9. THE LETTER - morning. Sam finds his bed empty, the blanket raked open, and Grandma's blue notebook on the pillow.
// On its last page, in his mother's handwriting: it never wanted children; it waits to see who loves them enough to
// lie down in their place; someone always does - maybe that is what keeps it alive. "And you'll have to decide."
import React from 'react';
import {Son} from '../components/characters/Cast';
import {Person} from '../stick/goat';
import {GEO, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {Diary as Notebook, Glow, Tears} from '../stick/props';
import {DiaryPage, pageLines, type PageLine} from './common';

const SD = GEO.sonDay;
const BLUE_PEN = '#1d3a8a';

const PAGE_A: PageLine[] = [
	['narrator_051_glad', "If you're reading this, it took me instead of you.", 'if', 'you'],
	['narrator_051_glad', "I'm glad.", "i'm", ''],
	['narrator_052_never_wanted', 'It never wanted children.', '', 'children'],
	['narrator_052_never_wanted', 'It visits them three times...', 'visits', 'times'],
	['narrator_052_never_wanted', 'and waits to see who loves them enough', 'waits', 'enough'],
	['narrator_052_never_wanted', 'to lie down in their place.', 'lie', ''],
];
const PAGE_B: PageLine[] = [
	['narrator_053_someone', 'My grandfather did it for my dad.', '', 'dad'],
	['narrator_053_someone', 'My dad did it for me.', 0.3, 'me'],
	['narrator_053_someone', 'Someone always does.', 'someone', 'does'],
	['narrator_053_someone', 'Maybe that is what keeps it alive.', 'maybe', ''],
	['narrator_054_starve', 'Maybe if, just once, nobody lay down...', '', 'down'],
	['narrator_054_starve', 'it would finally starve.', 'would', ''],
	['narrator_055_couldnt', "I couldn't find out. Not with you.", '', ''],
	['narrator_056_decide', 'One day, your own child will ask you', '', 'ask'],
	['narrator_056_decide', 'about the skinny man.', 'about', 'man'],
	['narrator_056_decide', "And you'll have to decide.", 'and', ''],
	['narrator_056_decide', '- Mom', 0.97, 1],
];

export const Letter: React.FC = () => {
	const {f, t, at, end, word} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const shots: Shot[] = [
		// morning: Sam in the doorway; his bed empty, the blanket raked open, the blue notebook on the pillow
		shot(at('morning'), 'sonroom_day', 1.0, 1.06, [960, 560], [900, 580], {tag: 'door'}),
		// the last page, in her handwriting
		ui(T('narrator_051_glad'), (fl, d) => <DiaryPage f={fl} date="Sam," lines={pageLines(PAGE_A, t, at, end, word)} ink={BLUE_PEN} rot={1} z={1 + 0.05 * (fl / Math.max(1, d))} />),
		// "My grandfather did it for my dad..." - Sam on the edge of the bed, reading
		shot(T('narrator_053_someone'), 'sonroom_day', 1.5, 1.6, [760, 680], [740, 690], {tag: 'read'}),
		ui(T('narrator_054_starve'), (fl) => <DiaryPage f={fl} date="" lines={pageLines(PAGE_B, t, at, end, word)} ink={BLUE_PEN} size={44} rot={1} />),
		// "I couldn't find out. Not with you." - his face
		shot(T('narrator_055_couldnt'), 'sonroom_day', 2.6, 2.75, [700, 620], [700, 615], {tag: 'read'}),
		// "One day, your own child will ask you about the skinny man. And you'll have to decide."
		ui(T('narrator_056_decide'), (fl, d) => <DiaryPage f={fl} date="" lines={pageLines(PAGE_B, t, at, end, word)} ink={BLUE_PEN} size={44} rot={1} z={1 + 0.06 * (fl / Math.max(1, d))} />),
		// Sam alone with the notebook, the end of his bed
		shot(at('last'), 'sonroom_day', 1.25, 1.0, [760, 650], [960, 540], {tag: 'hold'}),
	];
	const world = (s: Shot) => {
		const light = <Glow cx={560} cy={300} r={600} color="#fff1c4" k={0.35} />;
		const torn = <Tears a={[440, 830]} b={[1000, 850]} k={1} gap={34} />;
		if (s.tag === 'door')
			return (
				<g>
					{light}
					{torn}
					<Notebook x={250} y={738} s={0.9} open={0} frame={f} />
					<Person is={Son} name="sam" x={1620} y={SD.floor - 6} s={2.0} child frame={f} turn={-0.5} look={[-1, 0.3]} eyes="wide" brows="worried" mouth="o" />
				</g>
			);
		// on the edge of the bed with the notebook in his lap; at the end he holds it to his chest
		const crying = t > T('narrator_055_couldnt') - 0.2;
		const hold = s.tag === 'hold';
		return (
			<g>
				{light}
				{torn}
				<Person is={Son} name="sam" x={700} y={866} s={2.0} child pose="sit" frame={f} look={hold ? [0.2, -0.1] : [0, 0.9]} eyes={crying ? 'wide' : 'dot'} brows={crying ? 'sad' : 'flat'} mouth={crying ? 'wobbly' : 'flat'} tears={crying ? 0.9 : 0} arms={hold ? 'hug' : {l: [40, -110], r: [40, -110]}} />
				{hold ? <Notebook x={700} y={690} s={0.75} open={0} frame={f} /> : <Notebook x={700} y={760} s={0.95} open={1} frame={f} />}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
