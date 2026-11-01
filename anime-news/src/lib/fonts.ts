import '@fontsource/oswald/400.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/jetbrains-mono/500.css';
import {continueRender, delayRender} from 'remotion';

// Fonts are bundled from npm (@fontsource) so renders never depend on the
// network. Block rendering until every face used on screen has loaded.
const faces = [
	'400 40px "Oswald"',
	'600 40px "Oswald"',
	'700 40px "Oswald"',
	'600 40px "Noto Sans"',
	'700 40px "Noto Sans"',
	'500 16px "JetBrains Mono"',
];

let started = false;
export const ensureFonts = () => {
	if (started || typeof document === 'undefined') return;
	started = true;
	const handle = delayRender('Loading fonts');
	Promise.all(faces.map((f) => document.fonts.load(f)))
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};
