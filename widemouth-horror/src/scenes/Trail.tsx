// 7. THE TRAIL - outside at last. The deer trail into the woods. "You're not ready yet. But soon."
import React from 'react';
import {Person, WideFig} from '../layout/Person';
import {Shots} from '../utils/scene';
import {MOOD} from './common';
import {again, close, push, shot} from './kit';

const TRAIL_TALK = ['widemouth_012_show_you', 'widemouth_013_important_path', 'widemouth_014_not_ready'];

export const Trail: React.FC = () => (
	<Shots
		shots={[
			// "When I finally got better, my mom said I could go outside."
			shot('r_00_door', 'porch_day', 'woods', {
				chars: ['eli', 'parents'],
				quality: 'medium',
				mood: MOOD.porch,
				prompt: 'The back porch of the farmhouse on a pale spring morning: the screen door open, MOM in the doorway smiling, and little ELI (5, healthy again, a blue windbreaker, jeans and sneakers) stepping out onto the porch boards into the thin sunshine. ONLY Mom and Eli - Dad is not here.',
				move: push(1.02, 1.08, 0.3, 0.45),
			}, {cam: {z: 1.5, cx: 520, cy: 440}, kids: <>
				<Person who="mom" x={300} y={560} h={300} facing="right" />
				<Person who="eli" x={500} y={580} h={180} facing="right" />
			</>}),
			// "He was waiting for me on the back porch."
			shot('r_01_steps', 'narrator_062_porch', 'woods', {
				chars: ['widemouth'],
				quality: 'high',
				mood: MOOD.porch,
				prompt: 'MR. WIDEMOUTH sits on the bottom step of the wooden back porch in the thin morning sun, small and ash-grey, his little hands on his knees, smiling his sweet ear-to-ear smile up toward the porch door, waiting. The grey woods behind.',
				move: push(1.04, 1.14, 0.35, 0.6),
			}, {cam: {z: 2.2, cx: 620, cy: 620}, kids: <WideFig x={640} y={720} h={150} facing="left" />}),
			// "I want to show you something. It's safe. I promise."
			again('r_02_show', 'widemouth_012_show_you', 'r_01_steps', {move: push(1.14, 1.24, 0.38, 0.55)}),
			// "He led me to the edge of the woods behind the house, where a narrow deer trail..."
			shot('r_03_edge', 'narrator_063_deer_trail', 'woods', {
				chars: ['eli', 'widemouth'],
				quality: 'high',
				mood: MOOD.porch,
				prompt: 'Seen from behind across the dry grass: little ELI in his blue windbreaker walking toward the edge of the woods, led by the hand by the small ash-grey MR. WIDEMOUTH, toward the dark mouth of a narrow deer trail that disappears between the bare birches and pines.',
				move: push(1.0, 1.12, 0.62, 0.5),
			}, {kids: <>
				<Person who="eli" x={1080} y={760} h={220} facing="back" />
				<WideFig x={1150} y={760} h={80} facing="back" />
			</>}),
			// "The woods were completely silent. No birds. Just the sound of his little feet on the dead leaves."
			close('r_04_feet', 'narrator_064_silent', {
				chars: ['eli', 'widemouth'],
				loc: 'woods',
				quality: 'medium',
				mood: MOOD.trail,
				prompt: 'Close at ground level on the deer trail: a carpet of dead brown leaves, little Eli\'s sneakers walking, and beside them two small ash-grey furry feet with short dark claws pattering over the leaves. Grey-green light, bare trunks behind, utterly still.',
				move: {z0: 1.08, z1: 1.08, x0: 0.4, y0: 0.6, x1: 0.6, y1: 0.6},
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a3a2a" />
				<rect x={0} y={700} width={1920} height={380} fill="#6b4a2b" />
				<rect x={600} y={640} width={180} height={90} fill="#3a5a8a" />
				<ellipse cx={1150} cy={760} rx={90} ry={40} fill="#8e8c88" />
			</>),
			// "This is a very important path..."
			close('r_05_path', 'widemouth_013_important_path', {
				kind: 'talk',
				chars: ['widemouth'],
				loc: 'woods',
				quality: 'high',
				mood: MOOD.trail,
				prompt: 'On the narrow deer trail in the still grey woods: MR. WIDEMOUTH stands in the dead leaves, turned back to face the camera, one small hand pointing down the trail behind him into the darker trees, his ear-to-ear smile gentle and proud, his black eyes shining. Bare trunks and pines close in on both sides.',
				talk: TRAIL_TALK,
				move: push(1.03, 1.1, 0.5, 0.5),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#3a3a2a" />
				<rect x={0} y={760} width={1920} height={320} fill="#6b4a2b" />
				<WideFig x={960} y={1000} h={620} arm="tug" facing="front" />
			</>),
			// "He looked up at me with those shiny black eyes."
			close('r_06_eyes', 'narrator_065_black_eyes', {
				chars: ['widemouth'],
				loc: 'woods',
				quality: 'high',
				mood: MOOD.trail,
				prompt: 'Extreme close-up of MR. WIDEMOUTH\'s two big glossy black eyes looking UP at the camera, no whites at all, the tiny reflection of a small boy and the bare branches curved in their wet black surface. Ash-grey fur around them.',
				move: push(1.04, 1.12, 0.5, 0.45),
			}, <>
				<rect x={0} y={0} width={1920} height={1080} fill="#8e8c88" />
				<circle cx={640} cy={520} r={260} fill="#050505" />
				<circle cx={1280} cy={520} r={260} fill="#050505" />
			</>),
			// "You're not ready yet. But soon."
			again('r_07_soon', 'widemouth_014_not_ready', 'r_05_path', {talk: TRAIL_TALK, move: push(1.12, 1.22, 0.5, 0.45), grade: 0.9}),
			// the trail disappearing into the trees
			shot('r_08_trail', 'trail_dark', 'woods', {
				noPeople: true,
				quality: 'medium',
				mood: MOOD.trail,
				prompt: 'The narrow deer trail winding away between bare trunks and dark pines, deeper into the woods, the far end swallowed by shadow. Dead leaves, total stillness. No people.',
				move: push(1.0, 1.14, 0.62, 0.5),
			}, {cam: {z: 2.0, cx: 1180, cy: 540}}),
		]}
	/>
);
