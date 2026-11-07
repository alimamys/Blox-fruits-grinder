// Headless Chromium for Remotion: REMOTION_BROWSER_EXECUTABLE, or the pre-installed
// Playwright headless shell under /opt/pw-browsers (Remotion's own download is blocked here).
import fs from 'node:fs';

const CANDIDATES = [
	process.env.REMOTION_BROWSER_EXECUTABLE,
	'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
];
export const browserExecutable = CANDIDATES.find((p) => p && fs.existsSync(p)) || undefined;
