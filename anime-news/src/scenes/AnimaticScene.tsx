/**
 * Timing animatic for chapters not yet built: shows the planned plate for each
 * storyboard visual cue (placeholder or supplied art) with the cue text, so the
 * full 4-minute narration, captions and pacing can be reviewed now.
 * Factual overlays (maps, seat tiles, market figures, date cards) are NOT
 * drawn here yet — they will be rendered in code when each chapter is built.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Plate} from '../components/Plate';
import {ramp} from '../lib/motion';
import {scene} from '../lib/timeline';
import {C, FONT, SAFE, SUB_BAND_H} from '../lib/theme';

// visual cue number → planned plate
const PLAN: Record<string, Record<number, string>> = {
	S02: {1: 'A01', 2: 'A03', 3: 'A02', 4: 'A01', 5: 'A02', 6: 'A02', 7: 'A02'},
	S03: {1: 'A04', 2: 'A05', 3: 'A05', 4: 'A05', 5: 'A15', 6: 'A05', 7: 'A15'},
	S04: {1: 'A06', 2: 'A07', 3: 'A06', 4: 'A14', 5: 'A06', 6: 'A06', 7: 'A07'},
	S05: {1: 'A08', 2: 'A14', 3: 'A08', 4: 'A08', 5: 'A09', 6: 'A08', 7: 'A09'},
	S06: {1: 'A11', 2: 'A11', 3: 'A11', 4: 'A11', 5: 'A10', 6: 'A11', 7: 'A11'},
	S07: {1: 'A14', 2: 'A12', 3: 'A13', 4: 'A02', 5: 'A13', 6: 'A13'},
};

export const AnimaticScene: React.FC<{sceneId: string; offset?: number}> = ({sceneId, offset = 0}) => {
	const f = useCurrentFrame() + offset; // frame relative to scene start
	const s = scene(sceneId);
	const vcs = s.visualCues.map((v) => ({...v, local: v.frame - s.startFrame})).sort((a, b) => a.local - b.local);
	let idx = 0;
	vcs.forEach((v, i) => {
		if (f >= v.local) idx = i;
	});
	const v = vcs[idx];
	const next = vcs[idx + 1]?.local ?? s.durationFrames;
	const assetId = PLAN[sceneId]?.[v.n] ?? s.assetIds[0];
	const t = f - v.local;
	const cam = {x: 0.5 + 0.03 * Math.sin(idx * 2.1) + t * 0.0002, y: 0.5, z: 1.08 + ramp(t, 0, next - v.local, 0, 0.1)};
	return (
		<AbsoluteFill>
			<Plate assetId={assetId} cam={cam} />
			<div
				style={{
					position: 'absolute',
					left: SAFE.x,
					bottom: SUB_BAND_H + 28,
					maxWidth: 980,
					background: 'rgba(7,9,13,0.8)',
					borderLeft: `5px solid ${C.amber}`,
					padding: '12px 18px',
				}}
			>
				<div style={{fontFamily: FONT.mono, fontSize: 16, color: C.amberSoft, letterSpacing: '0.08em'}}>
					ANIMATIC · NOT YET BUILT · {sceneId} {s.chapter.toUpperCase()} · VISUAL CUE {v.n}
				</div>
				<div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: C.paper, marginTop: 6, lineHeight: 1.3}}>{v.text}</div>
			</div>
		</AbsoluteFill>
	);
};
