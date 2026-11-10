// 1. THE WAVE - cold open. 4 a.m., the moving truck, the little figure in the bedroom window waving
// goodbye with a steak knife in his other hand. Then the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disclaimer, TitleCard} from '../components/ui/Phone';
import {Person, WideFig} from '../layout/Person';
import {Shots, type ShotProps} from '../utils/scene';
import {Black, MOOD} from './common';
import {again, close, code, push, shot} from './kit';

const Open: React.FC<ShotProps> = ({f, d}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<Disclaimer f={f} d={d} />
	</AbsoluteFill>
);

/** The upstairs window from outside at night, Mr. Widemouth standing in it. */
export const WindowFig: React.FC<{arm?: 'wave' | 'none'}> = ({arm = 'none'}) => (
	<>
		<rect x={0} y={0} width={1920} height={1080} fill="#0d1220" />
		<rect x={560} y={80} width={800} height={920} fill="#cfd3d6" />
		<rect x={640} y={150} width={640} height={780} fill="#3a3326" stroke="#e8e6df" strokeWidth={22} />
		<line x1={960} y1={150} x2={960} y2={930} stroke="#e8e6df" strokeWidth={14} />
		<line x1={640} y1={540} x2={1280} y2={540} stroke="#e8e6df" strokeWidth={14} />
		<WideFig x={960} y={900} h={520} arm={arm} />
		{/* the steak knife in his other hand, point down */}
		<rect x={1036} y={770} width={20} height={60} fill="#5a3a22" />
		<polygon points="1036,830 1056,830 1048,960" fill="#d8dde2" />
	</>
);

export const Wave: React.FC = () => (
	<Shots
		shots={[
			code('w_00_open', 'open_black', (p) => <Open {...p} />),
			// "The last time I saw him, it was four in the morning."
			close('w_01_truck', 'narrator_001_four_am', {
				chars: ['eli'],
				loc: 'truck',
				quality: 'high',
				dark: true,
				mood: MOOD.truckNight,
				prompt: 'Inside the dark cab of an old moving truck at 4 a.m.: little ELI (5, striped blue-and-white pyjamas, a knitted blanket around his shoulders) kneels on the worn bench seat on the RIGHT, his face and both small hands against the cold side window, looking up and out at the night. The dashboard glows faint green on the left. Quiet, cold, sleepy.',
				move: push(1.02, 1.08, 0.62, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#121722" />
				<rect x={1180} y={60} width={700} height={560} fill="#1c2a44" />
				<Person who="eli" x={1300} y={1150} h={720} facing="right" />
				<rect x={0} y={560} width={760} height={200} fill="#1e2a22" />
			</>),
			// "I was five years old, sitting in the cab of my dad's moving truck..."
			close('w_02_glass', 'narrator_002_truck', {
				chars: ['eli'],
				loc: 'truck',
				quality: 'high',
				blink: true,
				dark: true,
				mood: MOOD.truckNight,
				prompt: 'Close-up through the truck\'s side window from OUTSIDE: little ELI\'s pale face pressed against the cold glass, his small hand flat on the pane beside it, his breath fogging a round patch, big hazel eyes looking up at something above and past the camera. Faint green dashboard glow behind him, frost at the edges of the glass.',
				move: push(1.03, 1.1, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#101826" />
				<Person who="eli" x={900} y={2100} h={1900} facing="front" />
				<circle cx={1300} cy={520} r={90} fill="#efcfb4" />
			</>, {bg: '#101826'}),
			// "And he was standing in my bedroom window."
			shot('w_03_window', 'narrator_003_window', 'farmhouse', {
				chars: ['widemouth'],
				quality: 'medium',
				dark: true,
				mood: MOOD.houseNight,
				prompt: 'The white farmhouse on its hill at 4 a.m., seen from the bottom of the dirt driveway: the house dark against a deep blue night sky, ONE upstairs window faintly lit from inside - and in that window stands a tiny dark figure with a huge round head and crooked ears, too small to make out clearly. Black pines around the hill.',
				move: push(1.0, 1.22, 0.64, 0.25),
			}, {kids: <WideFig x={1248} y={200} h={60} />}),
			// "Small. Perfectly still." / "...he lifted one tiny hand and waved goodbye."
			close('w_04_still', 'narrator_004_still', {
				chars: ['widemouth'],
				loc: 'farmhouse',
				quality: 'high',
				dark: true,
				mood: 'Night outside an upstairs window of the farmhouse: the window glass lit a dim warm amber from a lamp deep inside the room, the white clapboards around it blue-grey in the dark.',
				prompt: 'An upstairs window of the old farmhouse seen from outside at night, straight on. MR. WIDEMOUTH - a small cat-sized creature with ash-grey fur, a huge round head, glossy black eyes, crooked ears (the LEFT one bent over at the tip like a folded ear, never cut off flat) and a wide closed-mouth smile from ear to ear - stands INSIDE the dark bedroom on the windowsill, a hand\'s width BEHIND the glass. A dim amber lamp deep in the room behind him rims his fur with warm light, so his shape stands out with depth against the shadowy room behind (wallpaper, the corner of a moving box) - he is clearly a creature in the room, not a picture on the glass; faint reflections of the night sky lie on the glass in front of him. He stands perfectly still, looking straight down at the camera, arms at his sides, and in his LEFT hand (on the RIGHT side of the image) he holds a large kitchen steak knife with a wooden handle, point down, the clean blade catching the lamp light. No blood.',
				variants: [
					{name: 'up', prompt: 'Mr. Widemouth has now lifted his RIGHT hand (on the left side of the image) up beside his head, small palm open toward the camera, in a little goodbye wave. The steak knife stays in his other hand, point down. His smile and everything else stay exactly the same.'},
					{name: 'tilt', prompt: 'Mr. Widemouth has lifted his RIGHT hand (on the left side of the image) up beside his head in a little goodbye wave, the small palm tilted the other way, mid-wave. The steak knife stays in his other hand, point down. His smile and everything else stay exactly the same.'},
				],
				seq: [
					['base', 0],
					['up', 0.52],
					['tilt', 0.62],
					['up', 0.72],
					['tilt', 0.82],
					['up', 0.92],
				],
				move: push(1.32, 1.5, 0.5, 0.37),
			}, <WindowFig />, {bg: '#0d1220'}),
			// "In his other hand, he was holding a steak knife."
			close('w_06_knife', 'narrator_006_knife', {
				chars: ['widemouth'],
				loc: 'farmhouse',
				quality: 'high',
				dark: true,
				mood: 'Night: dim amber light from inside the window, deep blue shadow.',
				prompt: 'Close-up behind the window glass at night: Mr. Widemouth\'s small grey furry LEFT hand hanging at his side, loosely holding a large kitchen steak knife with a wooden handle, the point toward the windowsill. A thin line of light runs along the clean blade. Only his hand, arm and the edge of his furry body are in frame. Still and quiet, no blood.',
				move: push(1.04, 1.14, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#151824" />
				<ellipse cx={700} cy={400} rx={260} ry={420} fill="#8e8c88" />
				<rect x={900} y={420} width={60} height={160} fill="#6b4a2b" />
				<polygon points="910,580 950,580 935,980" fill="#d8dde2" />
			</>),
			// "I didn't wave back."
			again('w_07_didnt', 'narrator_007_didnt_wave', 'w_02_glass', {move: push(1.12, 1.2, 0.42, 0.42)}),
			// "He had been my best friend for two weeks." - pulling away up the drive
			again('w_08_best', 'narrator_008_best_friend', 'w_03_window', {move: {z0: 1.3, z1: 1.0, x0: 0.64, y0: 0.25, x1: 0.6, y1: 0.4}}),
			code('w_09_black', 'cut_black', () => <Black />),
			code('w_10_title', 'title', ({f, d}) => <TitleCard f={f} d={d} />),
		]}
	/>
);
