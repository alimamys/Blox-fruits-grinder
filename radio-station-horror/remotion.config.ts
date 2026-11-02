// Remotion CLI configuration.
// Docs: https://www.remotion.dev/docs/config
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
// The whole video is generated procedurally (SVG + canvas), so the default
// concurrency is fine. Lower it with `--concurrency=2` on small machines.

// Optional: use an already-installed Chrome / Chromium instead of letting
// Remotion download its own headless shell (useful offline or in CI):
//   BROWSER_EXECUTABLE=/path/to/chrome npm run render
if (process.env.BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.BROWSER_EXECUTABLE);
}
