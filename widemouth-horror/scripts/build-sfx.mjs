#!/usr/bin/env node
// npm run build-sfx - synthesise every sound effect into public/audio/sfx, then retime.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const py =
	process.env.PYTHON ||
	['.venv/bin/python', '.venv/Scripts/python.exe'].map((p) => path.join(root, p)).find((p) => fs.existsSync(p)) ||
	(process.platform === 'win32' ? 'python' : 'python3');
const r = spawnSync(py, ['scripts/sfx/build_sfx.py', ...process.argv.slice(2)], {stdio: 'inherit', cwd: root});
if (r.status !== 0) process.exit(r.status ?? 1);
spawnSync(process.execPath, ['scripts/retime.mjs'], {stdio: 'inherit', cwd: root});
