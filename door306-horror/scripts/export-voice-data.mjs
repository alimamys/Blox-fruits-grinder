#!/usr/bin/env node
// Exports src/data/voiceLines.ts + voiceConfig.ts to build/voice-data.json so the
// Python voice generator can read exactly the same casting and line metadata that
// the Remotion project uses. No ts-node needed: we transpile with `typescript`.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'build', 'voice-data-cjs');
fs.mkdirSync(outDir, {recursive: true});

const files = ['types', 'voiceConfig', 'voiceLines'];
for (const f of files) {
	const src = fs.readFileSync(path.join(root, 'src', 'data', `${f}.ts`), 'utf8');
	let {outputText} = ts.transpileModule(src, {
		compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true},
	});
	outputText = outputText.replace(/require\("\.\/(\w+)"\)/g, 'require("./$1.cjs")');
	fs.writeFileSync(path.join(outDir, `${f}.cjs`), outputText);
}

const require = createRequire(import.meta.url);
const {VOICE_LINES} = require(path.join(outDir, 'voiceLines.cjs'));
const {VOICES, CROWD_VOICE_POOL, ELEVEN_CROWD_POOL, EMOTION_DIRECTIONS, DEFAULT_PROVIDER} = require(path.join(outDir, 'voiceConfig.cjs'));

const data = {VOICE_LINES, VOICES, CROWD_VOICE_POOL, ELEVEN_CROWD_POOL, EMOTION_DIRECTIONS, DEFAULT_PROVIDER};
const out = path.join(root, 'build', 'voice-data.json');
fs.writeFileSync(out, JSON.stringify(data, null, 2));
console.log(`Exported ${VOICE_LINES.length} voice lines for ${Object.keys(VOICES).length} characters -> ${path.relative(root, out)}`);
