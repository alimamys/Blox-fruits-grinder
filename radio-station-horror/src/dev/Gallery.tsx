// Dev-only composition: one frame per reusable set/component, for quick visual checks
// (`npx remotion still src/index.ts Gallery out/g.png --frame=N`).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CCTVOverlay, CCTV_FILTER} from '../components/CCTVOverlay';
import {DocCamera} from '../components/DocCamera';
import {ApartmentScenePhoto, CaseFolder, PhotoPrint, VictorPortrait} from '../components/EvidencePhoto';
import {NotebookPage} from '../components/NotebookPage';
import {OldNewspaper} from '../components/OldNewspaper';
import {RadioText} from '../components/RadioText';
import {RadioVoiceScreen} from '../components/RadioVoiceScreen';
import {ApartmentRoom, FLOOR_Y} from '../components/sets/ApartmentRoom';
import {BED_SIT_Y, Bedroom} from '../components/sets/Bedroom';
import {CCTVFigure, CCTVHallway} from '../components/sets/CCTVHallway';
import {Building, MotelExterior, Street} from '../components/sets/Exteriors';
import {DormRoom, Elevator, Hallway, Market} from '../components/sets/Interiors';
import {MotelRoom} from '../components/sets/MotelRoom';
import {Layer, Stage} from '../components/Stage';
import {POSES, StickPerson} from '../components/StickPerson';
import {TrainScene} from '../components/TrainScene';
import {FontLoader} from '../utils/fonts';

const Views: Array<() => React.ReactNode> = [
	() => (
		<Stage>
			<Layer>
				<ApartmentRoom light={1} radio={{power: 1, speaking: 1}} door={{gapLight: 1, feet: 1}}>
					<StickPerson x={1380} y={FLOOR_Y} pose={POSES.sit} facing={-1} expression="scared" />
				</ApartmentRoom>
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<Bedroom light={0} lurk={0.6} clockSpeaking={1}>
					<StickPerson x={950} y={BED_SIT_Y} pose={POSES.sitHug} expression="terrified" />
				</Bedroom>
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<MotelRoom tv={{on: 1, text: 'RETURN HOME.'}}>
					<StickPerson x={880} y={840} pose={POSES.stand} facing={-1} expression="scared" />
				</MotelRoom>
			</Layer>
		</Stage>
	),
	() => (
		<Stage cam={{x: 960, y: 300, zoom: 0.55}}>
			<Layer>
				<Building scratch={0.5} hand={1} annotate={1} />
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<Elevator panel={0.4} dust={1} />
				<StickPerson x={960} y={860} expression="scared" />
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<Market radioOnTable />
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<DormRoom light={0}>
					<StickPerson x={1000} y={834} pose={POSES.sitUp} hair="curly" shirt="#3e8e4a" outfit="hoodie" expression="scared" />
				</DormRoom>
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<TrainScene train="red" doorsOpen={1} />
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<Hallway />
			</Layer>
		</Stage>
	),
	() => (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: CCTV_FILTER}}>
				<CCTVHallway doorOpen={0.6} />
				<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute'}}>
					<CCTVFigure X={-0.4} Z={5.5} kind="victor" facing={1} lookUp={1} smile={1} />
					<CCTVFigure X={0.2} Z={3} kind="adam" gait={2} phase={1} />
				</svg>
			</AbsoluteFill>
			<CCTVOverlay camera="MOTEL CAMERA 03" date="NOV-06" time="01:17:42" />
		</AbsoluteFill>
	),
	() => (
		<DocCamera x={750} y={900} zoom={0.52}>
			<OldNewspaper highlightHeadline={1} circleName={1} />
		</DocCamera>
	),
	() => (
		<DocCamera x={650} y={850} zoom={0.6}>
			<NotebookPage highlightName={1} highlightDate={1} highlightPhone={1} circle={1} />
		</DocCamera>
	),
	() => (
		<AbsoluteFill>
			<CaseFolder>
				<PhotoPrint rotate={-4} style={{left: 160, top: 220}} caption="HALE, V. — 1985">
					<VictorPortrait width={360} height={450} />
				</PhotoPrint>
				<PhotoPrint rotate={3} style={{left: 760, top: 300}} caption="SCENE 4 — DESK">
					<ApartmentScenePhoto width={880} height={605} />
				</PhotoPrint>
			</CaseFolder>
		</AbsoluteFill>
	),
	() => (
		<RadioVoiceScreen level={0.8} face={0.4}>
			<RadioText text="DO NOT OPEN THE DOOR" top={50} />
		</RadioVoiceScreen>
	),
	() => (
		<Stage>
			<Layer>
				<MotelExterior />
			</Layer>
		</Stage>
	),
	() => (
		<Stage>
			<Layer>
				<Street day />
				<StickPerson x={1200} y={860} hair="long" shirt="#1d47a3" outfit="coat" />
			</Layer>
		</Stage>
	),
];

export const GALLERY_FRAMES = Views.length;

export const Gallery: React.FC = () => {
	const f = useCurrentFrame();
	const View = Views[f % Views.length];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<FontLoader />
			{View()}
		</AbsoluteFill>
	);
};
