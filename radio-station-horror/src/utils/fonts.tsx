// Fonts are bundled locally from @fontsource (SIL Open Font License) so the
// video renders offline and identically on every machine.
import '@fontsource/caveat/latin-400.css';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/comic-neue/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/old-standard-tt/latin-400.css';
import '@fontsource/old-standard-tt/latin-700.css';
import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/permanent-marker/latin-400.css';
import '@fontsource/reenie-beanie/latin-400.css';
import '@fontsource/share-tech-mono/latin-400.css';
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/unifrakturmaguntia/latin-400.css';
import '@fontsource/vt323/latin-400.css';
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

export const FONT = {
	/** MS Paint text-tool vibe for in-world labels ("6B", signs). */
	paint: '"Comic Neue", "Comic Sans MS", sans-serif',
	/** Marker annotations / chapter labels. */
	marker: '"Permanent Marker", "Comic Neue", sans-serif',
	/** Cold, even radio messages. */
	radio: '"Share Tech Mono", "Courier New", monospace',
	/** CCTV / TV / LED readouts. */
	vcr: '"VT323", "Courier New", monospace',
	/** Victor's notebook handwriting. */
	hand: '"Caveat", cursive',
	scrawl: '"Reenie Beanie", "Caveat", cursive',
	/** Case files, typewritten labels. */
	typewriter: '"Special Elite", "Courier New", monospace',
	/** Newspaper. */
	masthead: '"UnifrakturMaguntia", serif',
	headline: '"Oswald", "Impact", sans-serif',
	print: '"Old Standard TT", "Times New Roman", serif',
	/** Clean UI text (disclaimer, phone UI). */
	ui: '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const FAMILIES: Array<[string, string]> = [
	['Caveat', '400'],
	['Caveat', '700'],
	['Comic Neue', '700'],
	['Inter', '400'],
	['Inter', '600'],
	['Old Standard TT', '400'],
	['Old Standard TT', '700'],
	['Oswald', '500'],
	['Oswald', '700'],
	['Permanent Marker', '400'],
	['Reenie Beanie', '400'],
	['Share Tech Mono', '400'],
	['Special Elite', '400'],
	['UnifrakturMaguntia', '400'],
	['VT323', '400'],
];

/** Blocks rendering until every font face has loaded (prevents fallback-font frames). */
export const FontLoader: React.FC = () => {
	const [handle] = useState(() => delayRender('Loading fonts'));
	useEffect(() => {
		Promise.all(FAMILIES.map(([family, weight]) => document.fonts.load(`${weight} 40px "${family}"`)))
			.catch((err) => {
				// A missing font must never break the render – fall back silently.
				console.warn('Font loading failed', err);
			})
			.finally(() => continueRender(handle));
	}, [handle]);
	return null;
};
