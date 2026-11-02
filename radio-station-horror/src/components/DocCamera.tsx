// Camera for HTML documents (newspaper, notebook, UI screens): puts point
// (x, y) of the content at the centre of the frame at the given zoom.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../config';

export const DocCamera: React.FC<{x: number; y: number; zoom: number; rot?: number; bg?: string; children: React.ReactNode}> = ({
	x,
	y,
	zoom,
	rot = 0,
	bg = '#111',
	children,
}) => (
	<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transformOrigin: '0 0',
				transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) rotate(${rot}deg) scale(${zoom}) translate(${-x}px, ${-y}px)`,
			}}
		>
			{children}
		</div>
	</AbsoluteFill>
);
