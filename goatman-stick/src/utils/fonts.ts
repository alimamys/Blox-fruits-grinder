// Fonts are bundled locally (public/fonts, SIL Open Font License) - no internet needed.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const FONTS: Array<[string, string, string]> = [
	['Patrick Hand', 'patrick-hand-latin-400-normal.woff2', '400'],
	['Permanent Marker', 'permanent-marker-latin-400-normal.woff2', '400'],
	['Special Elite', 'special-elite-latin-400-normal.woff2', '400'],
	['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', '400'],
	['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500'],
	['IBM Plex Mono', 'ibm-plex-mono-latin-700-normal.woff2', '700'],
	['Inter', 'inter-latin-400-normal.woff2', '400'],
	['Inter', 'inter-latin-500-normal.woff2', '500'],
	['Inter', 'inter-latin-600-normal.woff2', '600'],
	['Inter', 'inter-latin-700-normal.woff2', '700'],
	['Inter', 'inter-latin-800-normal.woff2', '800'],
];

let loaded = false;
export const loadAllFonts = () => {
	if (loaded) return;
	loaded = true;
	for (const [family, file, weight] of FONTS) {
		loadFont({family, url: staticFile(`fonts/${file}`), weight, format: 'woff2'}).catch((e) => console.warn('font', family, e));
	}
};

export const FONT = {
	hand: '"Patrick Hand", "Comic Sans MS", cursive',
	marker: '"Permanent Marker", "Patrick Hand", cursive',
	type: '"Special Elite", "Courier New", monospace',
	mono: '"IBM Plex Mono", "Courier New", monospace',
	ui: 'Inter, "Helvetica Neue", Arial, sans-serif',
};
