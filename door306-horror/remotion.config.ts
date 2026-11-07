// Remotion CLI configuration for "Frame 240".
// See README.md for render instructions.
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Uncomment to use a specific local Chrome/Chromium build instead of the one
// Remotion downloads (useful for fully offline machines), or set the env var
// REMOTION_BROWSER_EXECUTABLE when using `npm run render`:
// Config.setBrowserExecutable('/path/to/chrome-headless-shell');
