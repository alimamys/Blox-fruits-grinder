// 7. LET ME IN - Cole and the girl on the trail; the voice at the door; shots into the dark.
import React from 'react';
import {Person} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

export const LetMeIn: React.FC = () => (
	<Shots
		shots={[
			shot('l_00_cole', 'sundown', 'clearing', {
				chars: ['adults'],
				quality: 'medium',
				mood: MOOD.dusk,
				prompt: 'ONLY COLE in this frame (not Mr. Dawes): at dusk, COLE - stocky, buzz cut, patchy beard, red-and-black check flannel - walks up the dirt track into the clearing holding a big heavy-duty lantern flashlight, a hunting rifle slung on his shoulder, glancing back over his shoulder at the woods.',
				move: push(1.02, 1.08, 0.55, 0.5),
			}, {cam: {z: 1.7, cx: 1080, cy: 560}, kids: <Person who="cole" x={1080} y={740} h={360} facing="front" />}),
			again('l_01_cole2', 'narrator_103_cole', 'l_00_cole', {move: push(1.08, 1.16, 0.55, 0.45)}),
			close('l_02_cole_talk', 'cole_001_little_friend', {
				kind: 'talk',
				chars: ['adults'],
				loc: 'trailer',
				quality: 'high',
				talk: ['cole_001_little_friend'],
				mood: MOOD.trailerNight,
				prompt: 'ONLY COLE in this frame (not Mr. Dawes): medium close-up of COLE standing just inside the trailer door, lantern in hand, rifle on his shoulder, frowning in easygoing confusion as he talks.',
				move: push(1.02, 1.06, 0.5, 0.42),
			}, <Person who="cole" x={960} y={1850} h={1600} facing="front" />, {bg: '#3a2a1c'}),
			shot('l_03_reach', 'narrator_104_reached', 'trail', {
				chars: ['adults', 'thing'],
				quality: 'high',
				mood: 'Dusk on the forest trail: the last blue light, Cole\'s lantern throwing a warm cone ahead.',
				prompt: 'ONLY COLE and the girl (not Mr. Dawes): on the dusky forest trail, COLE reaches out a hand toward the shoulder of a girl with long box braids in a lavender hoodie standing in the middle of the path - but his hand closes on EMPTY AIR: she is standing a foot to the LEFT of where he reached, staring at him with a slack-jawed smile, skin a shade too grey.',
				move: push(1.02, 1.08, 0.5, 0.45),
			}, {cam: {z: 1.4, cx: 900, cy: 620}, kids: <>
				<Person who="cole" x={1200} y={900} h={540} facing="left" pose="reach" />
				<Person who="wrongNia" x={760} y={880} h={460} facing="right" />
			</>}),
			again('l_04_air', 'narrator_105_empty_air', 'l_03_reach', {move: push(1.12, 1.2, 0.55, 0.45)}),
			again('l_05_left', 'narrator_106_foot_left', 'l_03_reach', {move: push(1.2, 1.36, 0.4, 0.4)}),
			shot('l_06_wait', 'night_wait', 'trailer', {
				chars: ['adults', 'wyatt', 'marcus', 'cousins', 'others'],
				quality: 'medium',
				mood: MOOD.trailerNight,
				prompt: 'ONLY COLE of the adults is here (not Mr. Dawes). Late night inside the trailer: COLE and WYATT sit by the door with rifles across their knees pointing at the floor; Marcus, Dez, Ray, Tasha, Kayla and Trey huddle on the benches, nobody sleeping, everyone staring at the door.',
				move: push(1.0, 1.06),
			}, {kids: <>
				<Person who="cole" x={1180} y={860} h={560} facing="left" />
				<Person who="wyatt" x={1340} y={900} h={540} facing="left" />
				<Person who="marcus" x={600} y={780} h={420} facing="right" />
				<Person who="dez" x={760} y={720} h={330} facing="front" />
				<Person who="ray" x={880} y={720} h={290} facing="front" />
				<Person who="tasha" x={1000} y={720} h={310} facing="front" />
			</>}),
			again('l_07_smell', 'narrator_107_eleven', 'l_06_wait', {move: push(1.06, 1.12, 0.45, 0.5), fx: 'pulse'}),
			close('l_08_knob', 'narrator_109_scraped', {
				loc: 'trailer',
				noPeople: true,
				quality: 'medium',
				fx: 'tremble',
				mood: MOOD.trailerDark,
				prompt: 'Close-up in the dark on the inside of the trailer\'s thin metal door: the knob and the lock, the little black window above them; the door trembles faintly in its frame from something scraping on the outside. Nobody in frame.',
				move: push(1.04, 1.14),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#8a8a84" />
				<circle cx={1000} cy={600} r={70} fill="#5a5a55" />
				<rect x={760} y={100} width={420} height={300} fill="#101014" />
			</>),
			again('l_09_voice', 'narrator_110_voice', 'l_08_knob', {fx: 'tremble', move: push(1.14, 1.18)}),
			again('l_10_thing', 'thing_001_let_me_in', 'l_06_wait', {move: push(1.12, 1.2, 0.7, 0.5), fx: 'tremble'}),
			again('l_11_words', 'narrator_111_wyatts_words', 's_17_pale', {move: push(1.12, 1.2, 0.5, 0.42), blink: true}),
			again('l_12_rhythm', 'narrator_113_no_rhythm', 'l_08_knob', {move: push(1.18, 1.26), grade: 0.8}),
			shot('l_13_shot', 'narrator_114_two_am', 'clearing', {
				chars: ['adults'],
				quality: 'medium',
				mood: 'Two in the morning in the clearing: pitch black, the only light the lantern on the trailer steps and a muzzle flash.',
				prompt: 'ONLY ONE PERSON in the whole frame: COLE (red-and-black check flannel). Mr. Dawes and everyone else are NOT here. Two in the morning, COLE stands on the trailer steps with the door kicked open behind him, firing his hunting rifle STRAIGHT UP INTO THE SKY - a bright muzzle flash lights his face and the pine trunks; the lantern on the step throws long shadows. He is aiming at nobody, only the sky.',
				move: push(1.02, 1.08, 0.4, 0.45),
			}, {cam: {z: 1.7, cx: 520, cy: 520}, kids: <Person who="cole" x={520} y={720} h={420} facing="right" />}),
			close('l_14_cole_shout', 'cole_002_get_gone', {
				kind: 'talk',
				chars: ['adults'],
				loc: 'clearing',
				quality: 'high',
				talk: ['cole_002_get_gone'],
				mood: 'Night: lantern light from below on his face, black woods behind.',
				prompt: 'ONLY COLE (not Mr. Dawes): close-up of COLE on the trailer steps at night, the rifle pointed at the sky, shouting at the black tree line, terrified and furious, lit from below by the lantern.',
				move: push(1.02, 1.06),
			}, <Person who="cole" x={960} y={1850} h={1600} facing="front" />, {bg: '#1a120c'}),
			shot('l_15_treeline', 'narrator_115_answered', 'clearing', {
				noPeople: true,
				quality: 'medium',
				dark: true,
				mood: 'Night: the lantern light dies a few metres out; the tree line is a black wall.',
				prompt: 'Night: the black tree line across the clearing, barely lit by a lantern - between the trunks, the brush shivers and bends as if something is moving low inside it. No people, nothing clearly visible.',
				move: push(1.0, 1.1, 0.5, 0.45),
			}, {cam: {z: 1.6, cx: 1100, cy: 420}}),
			again('l_16_hoot', 'narrator_116_hooting', 'l_15_treeline', {fx: 'tremble', move: push(1.1, 1.18, 0.55, 0.45)}),
			again('l_17_scream', 'narrator_117_scream', 'l_15_treeline', {fx: 'shake', move: push(1.18, 1.24, 0.45, 0.45)}),
			shot('l_18_crawl', 'narrator_118_crawled', 'clearing', {
				chars: ['thing'],
				quality: 'medium',
				dark: true,
				mood: 'Night: only the lantern on the trailer steps lights the near ground; everything beyond is black.',
				prompt: 'Night, at ground level in the clearing: something LOW crawls out of the black brush toward the trailer on too-long limbs, mostly in shadow - only the edge of a pale, bony back and one long grey arm reach into the lantern light. No face, no detail, no gore.',
				move: push(1.0, 1.14, 0.5, 0.55),
			}, {cam: {z: 1.8, cx: 1150, cy: 720}, kids: <Person who="figure" x={1150} y={860} h={240} facing="left" tilt={-70} />}),
			again('l_19_fire2', 'narrator_119_fired', 'l_13_shot', {fx: 'whiteout', move: push(1.08, 1.12, 0.4, 0.45)}),
			again('l_20_dawn', 'narrator_120_until_dawn', 'l_06_wait', {move: push(1.12, 1.2), grade: 0.75}),
			again('l_21_door', 'narrator_121_never_door', 'l_08_knob', {move: push(1.0, 1.06), grade: 0.9}),
			again('l_22_dawn', 'dawn_quiet', 'l_06_wait', {move: push(1.2, 1.24), grade: 0.85}),
		]}
	/>
);
