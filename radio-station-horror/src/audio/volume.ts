import {interpolate} from 'remotion';

export type VolumeProp = number | ((frame: number) => number);

/** Volume envelope with linear fade-in / fade-out (all values in frames). */
export const fadeVolume =
	(volume: number, totalFrames: number, fadeInFrames: number, fadeOutFrames: number) =>
	(f: number): number => {
		const fin = fadeInFrames > 0 ? interpolate(f, [0, fadeInFrames], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'}) : 1;
		const fout =
			fadeOutFrames > 0 && Number.isFinite(totalFrames)
				? interpolate(f, [totalFrames - fadeOutFrames, totalFrames], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})
				: 1;
		return Math.max(0, volume * Math.min(fin, fout));
	};
