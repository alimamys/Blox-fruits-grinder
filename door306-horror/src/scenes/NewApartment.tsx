// 2. THE NEW APARTMENT - three weeks earlier; then the night it started.
import React from 'react';
import {Person} from '../layout/Person';
import {Plate} from '../layout/Plate';
import {Shots} from '../utils/scene';
import {MOOD} from './common';

export const NewApartment: React.FC = () => (
	<Shots
		shots={[
			// the old brick building at night
			{
				id: 'a_00_exterior',
				at: 'exterior',
				render: () => <Plate loc="exterior" />,
				art: {
					kind: 'still',
					loc: 'exterior',
					noPeople: true,
					quality: 'medium',
					mood: MOOD.night,
					prompt: 'The old four-storey red-brick apartment building on its quiet street at night, exactly as in the location reference: bare trees, one sodium streetlight, every window dark except a faint yellow-green glow in the fourth-floor stairwell window. Empty street.',
					move: {z0: 1.0, z1: 1.08, x0: 0.5, y0: 0.5, x1: 0.55, y1: 0.45},
				},
			},
			// "I'd moved into the building three weeks earlier." - daytime: Sarah carries a box up the front steps; the landlord holds the door
			{
				id: 'a_01_moving_in',
				at: 'narrator_016_moved_in',
				render: () => (
					<Plate loc="exterior" cam={{z: 3.2, cx: 990, cy: 930}}>
						<Person who="landlord" x={1035} y={1040} h={150} facing="left" />
						<Person who="sarah" x={965} y={1060} h={140} facing="right" pose="carryBox" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['sarah', 'landlord'],
					loc: 'exterior',
					quality: 'medium',
					mood: MOOD.day,
					prompt: 'DAYTIME, three weeks earlier (not night): at the entrance of the old red-brick building, Sarah climbs the three front steps carrying a big cardboard moving box, smiling a little; the landlord holds the glass entrance door open for her with a broad friendly smile. Soft overcast daylight, ordinary and calm.',
					move: {z0: 1.02, z1: 1.08},
				},
			},
			// "It was an old, four-story apartment building on a quiet street." - the building by day
			{
				id: 'a_02_day_wide',
				at: 'narrator_017_old_building',
				render: () => <Plate loc="exterior" />,
				art: {
					kind: 'still',
					loc: 'exterior',
					noPeople: true,
					quality: 'medium',
					mood: MOOD.day,
					prompt: 'DAYTIME (not night): the same old four-storey red-brick apartment building on its quiet residential street, seen in soft overcast afternoon light - bare trees, a grey-blue sky, the streetlight off, curtains in the windows. Ordinary, a little tired, nothing special. Nobody on the street.',
					move: {z0: 1.0, z1: 1.06, x0: 0.5, y0: 0.52},
				},
			},
			// "Nothing special." - the lobby
			{
				id: 'a_03_lobby',
				at: 'narrator_018_nothing_special',
				render: () => <Plate loc="lobby" />,
				art: {
					kind: 'still',
					loc: 'lobby',
					noPeople: true,
					quality: 'medium',
					mood: MOOD.day,
					prompt: 'The small ground-floor lobby exactly as in the location reference: the wall of old brass mailboxes with blank name cards, the chipped black-and-white tiles, the foot of the stairs, daylight through the glass entrance door. Empty.',
					move: {z0: 1.03, z1: 1.08},
				},
			},
			// "But the rent was unbelievably cheap." - the landlord hands her the key in the empty flat
			{
				id: 'a_04_keys',
				at: 'narrator_019_rent_cheap',
				render: () => (
					<Plate loc="flat" cam={{z: 1.6, cx: 960, cy: 600}}>
						<Person who="landlord" x={760} y={1010} h={640} facing="right" pose="reach" />
						<Person who="sarah" x={1170} y={1020} h={600} facing="left" pose="reach" />
					</Plate>
				),
				art: {
					kind: 'still',
					chars: ['landlord', 'sarah'],
					loc: 'flat',
					quality: 'high',
					blink: true,
					mood: MOOD.day,
					prompt: 'DAYTIME, three weeks earlier, inside Sarah\'s new flat (same room as the location reference, but in soft daylight through the blinds, still empty apart from the mustard sofa and the round table): the landlord, smiling warmly, holds out a single brass key on his open palm toward Sarah; she reaches for it, pleased and a little surprised. His smile does not quite reach his eyes.',
					move: {z0: 1.03, z1: 1.09},
				},
			},
		]}
	/>
);
