// A soft light falloff (radial gradient) - never a flat disc, which the image model would
// copy as a grey shape.
import React, {useId} from 'react';

export const Glow: React.FC<{cx: number; cy: number; rx: number; ry?: number; color?: string; opacity?: number}> = ({cx, cy, rx, ry, color = '#ffffff', opacity = 0.5}) => {
	const id = useId().replace(/:/g, '');
	return (
		<g>
			<defs>
				<radialGradient id={`g${id}`}>
					<stop offset="0%" stopColor={color} stopOpacity={opacity} />
					<stop offset="45%" stopColor={color} stopOpacity={opacity * 0.55} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fill={`url(#g${id})`} />
		</g>
	);
};
