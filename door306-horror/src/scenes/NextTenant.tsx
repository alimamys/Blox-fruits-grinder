// 10. THE NEXT TENANT - a bright morning; the notebook; the advert; "a very quiet building".
import React from 'react';
import {AdScreen, Clock, NamesPage, NewPage, TheEnd} from '../components/ui/Paper';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {Black, MOOD} from './common';
import {again, close, code, push, shot} from './kit';

export const NextTenant: React.FC = () => (
	<Shots
		shots={[
			// the following morning
			shot('j_01_morning', 'morning_ext', 'exterior', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'MORNING (not night): the old red-brick apartment building in bright, clean morning sunshine, a blue sky, birds on the bare branches, sunlight glinting in the windows. Peaceful and ordinary. Nobody on the street.',
				move: push(1.0, 1.08, 0.5, 0.48),
			}),
			// children leave for school
			shot('j_02_kids', 'morning_kids', 'exterior', {
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'MORNING sunshine at the entrance of the brick building: two cheerful school children with backpacks hurry down the three front steps toward the street, one waving back at the door. Bright and ordinary.',
				move: push(1.03, 1.08),
			}, {cam: {z: 3.0, cx: 990, cy: 930}, kids: <>
				<Person who="beard" x={940} y={1060} h={90} facing="front" />
				<Person who="blanket" x={1040} y={1070} h={85} facing="front" />
			</>}),
			// neighbours greet each other
			shot('j_03_greet', 'morning_greet', 'lobby', {
				chars: ['residents'],
				quality: 'medium',
				mood: MOOD.morning,
				prompt: 'Morning light in the small lobby: the bearded man (white T-shirt, now dressed for work) and the curly-haired woman pass each other by the mailboxes and nod good morning with polite, tired smiles, as if nothing happened.',
				move: push(1.03, 1.08),
			}, {cam: {z: 1.3, cx: 900, cy: 600}, kids: <>
				<Person who="beard" x={700} y={1000} h={560} facing="right" />
				<Person who="blanket" x={1100} y={1000} h={520} facing="left" />
			</>}),
			// Mr. Harris sits beside his window, drinking coffee
			close('j_04_coffee', 'harris_coffee', {
				chars: ['harris'],
				quality: 'high',
				blink: true,
				mood: MOOD.morning,
				prompt: 'Mr. Harris sits in an armchair beside his sunny window in his own small flat, holding a cup of coffee in both hands, looking out at the bright morning, calm, his face empty. Warm sunlight, plants on the sill.',
				move: push(1.03, 1.08),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#d8c9a4" />
				<rect x={1100} y={120} width={700} height={700} fill="#f3ecd2" />
				<Person who="harris" x={760} y={1000} h={760} facing="right" />
			</>),
			// the landlord enters Sarah's empty apartment
			shot('j_05_enters', 'landlord_enters', 'flat', {
				chars: ['landlord'],
				quality: 'medium',
				mood: 'Morning: daylight through the blinds of Sarah\'s flat; dust in the air; the room still and empty.',
				prompt: 'DAYTIME in Sarah\'s flat: the landlord steps in through the front door, which stands open; the mustard sofa and the round table have been shoved back from the door at odd angles, a chair on its side, the rug rucked up. Nobody else.',
				move: push(1.02, 1.08),
			}, {kids: <Person who="landlord" x={920} y={720} h={560} facing="front" />}),
			// he finds her phone lying near the door; the screen is cracked
			close('j_06_phone', 'phone_found', {
				loc: 'flat',
				noPeople: true,
				quality: 'medium',
				mood: 'Morning daylight across the floorboards.',
				prompt: 'Close-up on the floorboards near the front door in daylight: Sarah\'s phone lies face up, its screen cracked in a spider-web pattern and dark. Nothing else. No blood.',
				move: push(1.04, 1.12),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#8a6a4a" />
				<rect x={800} y={380} width={320} height={560} rx={36} fill="#111" transform="rotate(-12 960 660)" />
			</>),
			// he picks it up, switches it off, and places it in a drawer
			close('j_07_drawer', 'phone_drawer', {
				chars: ['landlord'],
				loc: 'flat',
				quality: 'medium',
				mood: 'Morning daylight.',
				prompt: 'Close-up: the landlord\'s hand, gold wedding ring visible, lays the dark cracked phone into an open wooden drawer full of other old phones and keys, about to slide it shut. Natural hand, five fingers.',
				move: push(1.03, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#6b4b30" />
				<rect x={400} y={500} width={1100} height={500} fill="#3a2414" />
				<circle cx={1100} cy={420} r={90} fill="#efc3a4" />
			</>),
			// then he removes Sarah's name from the mailbox
			close('j_08_mailbox', 'mailbox', {
				chars: ['landlord'],
				loc: 'lobby',
				quality: 'medium',
				mood: 'Morning light in the lobby.',
				prompt: 'Close-up at the wall of old brass mailboxes in the lobby: the landlord\'s fingers slide a small white name card out of the holder on one mailbox door; the card is blank on the side we see. Natural hand.',
				move: push(1.04, 1.1),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#7a6232" />
				<rect x={760} y={420} width={400} height={120} fill="#f0ece0" />
				<circle cx={1200} cy={480} r={80} fill="#efc3a4" />
			</>),
			// back in his office, he opens an old notebook
			shot('j_09_office', 'notebook', 'office', {
				chars: ['landlord'],
				quality: 'medium',
				mood: MOOD.office,
				prompt: 'The landlord sits at his desk in his office in warm morning light and opens an old leather-bound notebook, his face calm and friendly; the laptop and the beige desk phone beside him.',
				move: push(1.02, 1.08),
			}, {cam: {z: 1.4, cx: 1100, cy: 640}, kids: <Person who="landlord" x={1050} y={1000} h={560} facing="front" />}),
			// dozens of names, every one crossed out (Sarah's is the last)
			code('j_10_names', 'names_crossed', ({f, d}) => <NamesPage f={f} d={d} strike={Math.min(1, Math.max(0, (f - d * 0.35) / (d * 0.35)))} />),
			// the new page
			code('j_11_new_page', 'new_page', ({f, d}) => <NewPage f={f} d={d} />),
			// the new advertisement
			code('j_12_ad', 'laptop_ad', ({f, d}) => <AdScreen f={f} d={d} />),
			// his phone rings - the call
			shot('j_13_call', 'phone_rings', 'office', {
				kind: 'talk',
				chars: ['landlord'],
				quality: 'high',
				talk: ['landlord_001_of_course', 'landlord_002_lovely_place', 'landlord_003_very_friendly', 'landlord_004_not_at_all', 'landlord_005_quiet_building'],
				mood: MOOD.office,
				prompt: 'Medium close-up: the landlord at his desk holds the receiver of the old beige desk phone to his ear, smiling warmly and pleasantly, the open notebook in front of him.',
				variants: [{name: 'wide', prompt: 'His smile has widened - broad and pleasant - but his eyes have gone cold and empty. Nothing else changes.'}],
				move: push(1.02, 1.06),
			}, {cam: {z: 2.0, cx: 1050, cy: 560}, kids: <Person who="landlord" x={1050} y={1000} h={600} facing="front" pose="fingerLips" />}),
			again('j_14_caller', 'caller_001_still_available', 'j_13_call', {move: push(1.06, 1.1)}),
			again('j_15_l1', 'landlord_001_of_course', 'j_13_call', {talk: ['landlord_001_of_course'], move: push(1.1, 1.12)}),
			again('j_16_c2', 'caller_002_too_good', 'j_13_call', {move: push(1.12, 1.16)}),
			again('j_17_smiles', 'landlord_smiles', 'j_13_call', {seq: [['base', 0], ['wide', 0.5]], move: push(1.16, 1.18)}),
			again('j_18_l2', 'landlord_002_lovely_place', 'j_13_call', {talk: ['landlord_002_lovely_place'], move: push(1.12, 1.16)}),
			again('j_19_c3', 'caller_003_neighbors', 'j_13_call', {move: push(1.16, 1.18)}),
			code('j_20_glance', 'glance_notebook', ({f, d}) => <NamesPage f={f + 40} d={d + 40} />),
			again('j_21_l3', 'landlord_003_very_friendly', 'j_13_call', {talk: ['landlord_003_very_friendly'], move: push(1.16, 1.22)}),
			again('j_22_c4', 'caller_004_noisy', 'j_13_call', {move: push(1.2, 1.24)}),
			again('j_23_widens', 'smile_widens', 'j_13_call', {seq: [['base', 0], ['wide', 0.35]], move: push(1.24, 1.32, 0.5, 0.42)}),
			again('j_24_l4', 'landlord_004_not_at_all', 'j_13_call', {show: 'wide', move: push(1.32, 1.36, 0.5, 0.42)}),
			again('j_25_pause', 'brief_pause', 'j_13_call', {show: 'wide', move: push(1.36, 1.4, 0.5, 0.42)}),
			again('j_26_quiet', 'landlord_005_quiet_building', 'j_13_call', {talk: ['landlord_005_quiet_building'], move: push(1.4, 1.55, 0.5, 0.4)}),
			// cut to black; the clock; CLICK; one door, another, then dozens
			code('j_27_black', 'cut_black_2', () => <Black />),
			code('j_28_58', 'clock_58', ({f}) => <Clock time="3:05:58" f={f} />),
			code('j_29_59', 'clock_59', ({f}) => <Clock time="3:05:59" f={f} />),
			code('j_30_00', 'clock_00', ({f}) => <Clock time="3:06:00" f={f} />),
			again('j_31_click1', 'click_1', 'd_04_cross_doors', {doors: {prompt: '', start: 0.05, stagger: 9, swing: 0.5}, move: push(1.04, 1.06)}),
			again('j_32_click2', 'click_2', 'd_04_cross_doors', {doors: {prompt: '', start: -1, stagger: 0.95, swing: 0.5}, move: push(1.06, 1.08)}),
			again('j_33_all', 'doors_all', 'd_01_corridor_doors', {doors: {prompt: '', start: 0.03, stagger: 0.05, swing: 0.4}, fx: 'flicker', move: push(1.02, 1.12, 0.52, 0.47)}),
			code('j_34_end', 'the_end', ({f, d}) => <TheEnd f={f} d={d} />),
		]}
	/>
);
