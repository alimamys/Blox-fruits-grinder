import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');

// The cloud sandbox ships a headless Chromium; on your own machine Remotion
// downloads its own Chrome Headless Shell automatically, so nothing to set.
const sandboxShell =
	'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (existsSync(sandboxShell)) {
	Config.setBrowserExecutable(sandboxShell);
}
