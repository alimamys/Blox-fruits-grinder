// 2. THE NEW APARTMENT - three weeks earlier; then the night it started.
import React from 'react';
import {LockScreen} from '../components/ui/Phone';
import {Person} from '../layout/Person';
import {Plate} from '../layout/Plate';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, phone, push, shot} from './kit';

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
			// "The landlord told me the previous tenant had moved out unexpectedly..." - push in on his smile
			again('a_05_landlord_smile', 'narrator_020_previous_tenant', 'a_04_keys', {move: push(1.12, 1.45, 0.36, 0.38)}),
			// "He even waived the security deposit." - the key in his open palm
			again('a_06_key_palm', 'narrator_021_waived_deposit', 'a_04_keys', {move: push(1.5, 1.7, 0.5, 0.55)}),
			// "I thought I'd gotten lucky." - Sarah, pleased
			again('a_07_lucky', 'narrator_022_lucky', 'a_04_keys', {move: push(1.35, 1.45, 0.66, 0.4), blink: true}),
			// "I had no idea what happened to the woman who lived there before me." - what she left behind
			shot('a_08_left_behind', 'narrator_023_no_idea', 'flat', {
				noPeople: true,
				quality: 'medium',
				mood: 'Night, the flat dark, one stripe of orange streetlight across the shelf.',
				prompt: 'Close on a dusty shelf in a dark corner of the flat: a woman\'s hairbrush with long dark hairs caught in it and a small picture frame lying face down, forgotten. Still and ominous.',
				move: push(1.04, 1.14),
			}, {cam: {z: 2.6, cx: 1390, cy: 420}}),
			// asleep, then the clicking: her eyes open in the dark
			again('a_09_asleep', 'asleep', 'd_02_wakes', {seq: [['closed', 0], ['base', 0.55]], move: push(1.1, 1.16, 0.5, 0.45)}),
			// "I checked my phone." / "3:06 AM."
			phone('a_10_phone', 'narrator_025_checked_phone', ({f}) => <LockScreen time="3:06" glow={Math.min(1, f / 5)} />),
			// "Then I heard a door opening. Followed by another. And another." - she sits up, listening
			shot('a_11_sits_up', 'narrator_027_door_opening', 'bedroom', {
				chars: ['sarah'],
				quality: 'high',
				blink: true,
				mood: MOOD.bedroom,
				prompt: 'Sarah sits up in bed in the dark bedroom, the duvet around her waist, turning her head toward the half-open bedroom door, listening, frightened. Orange streetlight stripes on the wall.',
				move: push(1.04, 1.1, 0.5, 0.45),
			}, {cam: {z: 1.5, cx: 620, cy: 560}, kids: <Person who="sarah" x={600} y={820} h={420} facing="right" />}),
			// "I got out of bed and walked toward my front door."
			shot('a_12_to_door', 'narrator_030_got_out_of_bed', 'flat', {
				chars: ['sarah'],
				quality: 'medium',
				mood: MOOD.flat,
				prompt: 'Wide shot of the dark living room at night: Sarah, barefoot, walks slowly away from us toward the front door at the back of the room, one hand reaching out in the dark; the thin yellow-green line of corridor light under the door.',
				move: push(1.02, 1.12, 0.48, 0.5),
			}, {kids: <Person who="sarah" x={1000} y={900} h={520} facing="back" pose="reach" />}),
			// "When I looked through the peephole, I saw my elderly neighbor, Mr. Harris..."
			again('a_13_peephole', 'narrator_031_mr_harris', 'd_06_eye_peephole', {move: push(1.05, 1.12, 0.55, 0.45), blink: true}),
			again('a_14_pov_harris', 'narrator_031_mr_harris', 'd_07_peephole_pov', {move: push(1.0, 1.25, 0.5, 0.48)}, {frac: 0.45}),
			// "His apartment door was wide open."
			again('a_15_harris_door', 'narrator_032_door_wide_open', 'd_10_harris_frozen', {move: push(1.0, 1.06, 0.45, 0.5)}),
			// "Behind him stood several other residents." / "All facing the stairs."
			again('a_16_others', 'narrator_033_several_others', 'd_07_peephole_pov', {move: {z0: 1.2, z1: 1.2, x0: 0.62, y0: 0.5, x1: 0.72, y1: 0.5}}),
			again('a_17_facing', 'narrator_034_facing_stairs', 'd_08_still', {move: push(1.08, 1.14)}),
			// "I whispered through the door." + SARAH: "Mr. Harris? Is everything okay?"
			close('a_18_whisper', 'narrator_035_whispered', {
				kind: 'talk',
				chars: ['sarah'],
				loc: 'flat',
				quality: 'high',
				talk: ['sarah_001_is_everything_okay'],
				blink: true,
				mood: MOOD.flat,
				prompt: 'Close-up inside her dark flat: Sarah\'s face right against the inside of her front door, cheek near the wood, whispering through the door, frightened; the faint yellow-green light from the peephole on her face.',
				move: push(1.03, 1.08, 0.5, 0.45),
			}, <>
				<rect x={1150} y={0} width={770} height={1080} fill="#3a2a1f" />
				<Person who="sarah" x={930} y={1700} h={1600} facing="right" />
			</>),
			// "He slowly turned his eyes toward my apartment." / "His face went pale."
			again('a_19_eyes', 'narrator_036_turned_eyes', 'd_10_harris_frozen', {seq: [['base', 0], ['eyes', 0.45]], move: push(1.08, 1.22, 0.45, 0.42)}),
			again('a_20_pale', 'narrator_037_pale', 'd_10_harris_frozen', {show: 'eyes', move: push(1.25, 1.32, 0.45, 0.38)}),
			// "Then he raised a trembling finger to his lips." / "Telling me to be quiet."
			again('a_21_finger', 'narrator_038_finger_lips', 'd_10_harris_frozen', {seq: [['eyes', 0], ['finger', 0.35]], fx: 'tremble', move: push(1.15, 1.25, 0.45, 0.4)}),
			again('a_22_quiet', 'narrator_039_be_quiet', 'd_10_harris_frozen', {show: 'finger', move: push(1.3, 1.42, 0.45, 0.38)}),
		]}
	/>
);
