#!/usr/bin/env node
// npm run generate-voices [-- --character oldWoman | --only id1,id2 | --provider openai | --force | --scripts-only]
// 1) export TS voice data -> build/voice-data.json
// 2) run the Python generator with the forwarded arguments
// 3) retime: measure the real WAV durations and update the timeline manifest
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const run = (cmd, cmdArgs) => {
	const r = spawnSync(cmd, cmdArgs, {stdio: 'inherit', cwd: root});
	if (r.error) throw r.error;
	return r.status ?? 1;
};

const pickPython = () => {
	if (process.env.PYTHON) return process.env.PYTHON;
	for (const p of ['.venv/bin/python', '.venv/Scripts/python.exe']) {
		if (fs.existsSync(path.join(root, p))) return path.join(root, p);
	}
	return process.platform === 'win32' ? 'python' : 'python3';
};

if (run(process.execPath, ['scripts/export-voice-data.mjs']) !== 0) process.exit(1);
const status = run(pickPython(), ['scripts/voice/generate_voices.py', ...args]);
if (status === 1) process.exit(1);
// status 2 = provider unavailable: scripts were written, keep going so the manifest stays valid
if (!args.includes('--scripts-only')) run(process.execPath, ['scripts/retime.mjs']);
process.exit(status === 2 ? 0 : status);
