#!/usr/bin/env node
/*
 * Runs automatically before `npm start` and `npm run render`.
 *
 * 1. Creates the public/audio folder structure (where your real recordings go).
 * 2. Synthesises procedural PLACEHOLDER sound effects into
 *    public/audio/placeholders/ so the video has working sound design even
 *    before any real audio exists. Real files in public/audio/<name>.wav always
 *    take priority over placeholders.
 *
 * No dependencies – plain Node. Output is deterministic (seeded noise).
 * Use `node scripts/prepare-assets.mjs --force` to regenerate.
 * Set NO_PLACEHOLDER_AUDIO=1 to skip generating placeholders.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = path.join(root, 'public', 'audio');
const placeholderDir = path.join(audioDir, 'placeholders');
const force = process.argv.includes('--force');

for (const dir of [audioDir, path.join(audioDir, 'voice'), path.join(audioDir, 'narration'), placeholderDir]) {
	fs.mkdirSync(dir, {recursive: true});
}

if (process.env.NO_PLACEHOLDER_AUDIO) {
	console.log('[prepare-assets] NO_PLACEHOLDER_AUDIO set – skipping placeholder sound effects.');
	process.exit(0);
}

// Keep in sync with src/config.ts
const BEEP_SPACING_S = 0.8;
const KNOCK_SPACING_S = 0.55;

const SR = 22050;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- helpers ---
const prng = (seed) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const buf = (seconds) => new Float32Array(Math.round(seconds * SR));

const lowpass = (x, cutoff) => {
	const a = 1 - Math.exp((-TAU * cutoff) / SR);
	const y = new Float32Array(x.length);
	let s = 0;
	for (let i = 0; i < x.length; i++) {
		s += a * (x[i] - s);
		y[i] = s;
	}
	return y;
};
const highpass = (x, cutoff) => {
	const lp = lowpass(x, cutoff);
	const y = new Float32Array(x.length);
	for (let i = 0; i < x.length; i++) y[i] = x[i] - lp[i];
	return y;
};
const bandpass = (x, lo, hi) => lowpass(highpass(x, lo), hi);

const noise = (n, seed) => {
	const r = prng(seed);
	const y = new Float32Array(n);
	for (let i = 0; i < n; i++) y[i] = r() * 2 - 1;
	return y;
};
const brown = (n, seed) => {
	const r = prng(seed);
	const y = new Float32Array(n);
	let s = 0;
	for (let i = 0; i < n; i++) {
		s = (s + (r() * 2 - 1) * 0.02) * 0.998;
		y[i] = s * 8;
	}
	return y;
};

const add = (dst, src, offsetSec = 0, gain = 1) => {
	const o = Math.round(offsetSec * SR);
	for (let i = 0; i < src.length && o + i < dst.length; i++) {
		if (o + i >= 0) dst[o + i] += src[i] * gain;
	}
	return dst;
};

const envelope = (x, fn) => {
	for (let i = 0; i < x.length; i++) x[i] *= fn(i / SR, i / x.length);
	return x;
};

/** Crossfade the tail into the head so the file loops seamlessly. */
const makeLoop = (x, fadeSec) => {
	const f = Math.round(fadeSec * SR);
	const out = x.slice(0, x.length - f);
	for (let i = 0; i < f; i++) {
		const t = i / f;
		out[i] = out[i] * t + x[x.length - f + i] * (1 - t);
	}
	return out;
};

const normalize = (x, peak = 0.7) => {
	let m = 0;
	for (const v of x) m = Math.max(m, Math.abs(v));
	if (m > 0) for (let i = 0; i < x.length; i++) x[i] = (x[i] / m) * peak;
	return x;
};

const fadeEdges = (x, sec = 0.005) => {
	const f = Math.min(Math.round(sec * SR), Math.floor(x.length / 2));
	for (let i = 0; i < f; i++) {
		x[i] *= i / f;
		x[x.length - 1 - i] *= i / f;
	}
	return x;
};

const writeWav = (file, x) => {
	const data = Buffer.alloc(x.length * 2);
	for (let i = 0; i < x.length; i++) {
		const v = Math.max(-1, Math.min(1, x[i]));
		data.writeInt16LE(Math.round(v * 32767), i * 2);
	}
	const h = Buffer.alloc(44);
	h.write('RIFF', 0);
	h.writeUInt32LE(36 + data.length, 4);
	h.write('WAVE', 8);
	h.write('fmt ', 12);
	h.writeUInt32LE(16, 16);
	h.writeUInt16LE(1, 20); // PCM
	h.writeUInt16LE(1, 22); // mono
	h.writeUInt32LE(SR, 24);
	h.writeUInt32LE(SR * 2, 28);
	h.writeUInt16LE(2, 32);
	h.writeUInt16LE(16, 34);
	h.write('data', 36);
	h.writeUInt32LE(data.length, 40);
	fs.writeFileSync(file, Buffer.concat([h, data]));
};

// ------------------------------------------------------------- generators ---
const G = {
	low_ambient_hum() {
		const x = buf(8.5);
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			const lfo = 0.8 + 0.2 * Math.sin(TAU * 0.25 * t);
			x[i] = (Math.sin(TAU * 55 * t) * 0.6 + Math.sin(TAU * 110 * t) * 0.25 + Math.sin(TAU * 165 * t) * 0.08) * lfo;
		}
		add(x, lowpass(brown(x.length, 11), 300), 0, 0.35);
		return normalize(makeLoop(x, 0.5), 0.6);
	},
	radio_static() {
		const x = bandpass(noise(Math.round(4.5 * SR), 21), 400, 5000);
		const r = prng(22);
		// flutter + crackles
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			x[i] *= 0.7 + 0.3 * Math.sin(TAU * 3.1 * t) * Math.sin(TAU * 0.7 * t);
			if (r() < 0.0009) {
				const len = 40 + Math.floor(r() * 120);
				for (let k = 0; k < len && i + k < x.length; k++) x[i + k] += (r() * 2 - 1) * 1.6 * (1 - k / len);
			}
		}
		return normalize(makeLoop(x, 0.5), 0.6);
	},
	three_beeps() {
		const x = buf(BEEP_SPACING_S * 2 + 0.6);
		for (let b = 0; b < 3; b++) {
			const beep = buf(0.28);
			for (let i = 0; i < beep.length; i++) {
				const t = i / SR;
				beep[i] = Math.sin(TAU * 1000 * t) * 0.8 + Math.sin(TAU * 3000 * t) * 0.12;
			}
			add(x, fadeEdges(beep, 0.006), b * BEEP_SPACING_S);
		}
		add(x, bandpass(noise(x.length, 31), 500, 4000), 0, 0.04);
		return normalize(x, 0.6);
	},
	knocking() {
		const x = buf(KNOCK_SPACING_S * 2 + 0.6);
		const r = prng(41);
		for (let k = 0; k < 3; k++) {
			const knock = buf(0.35);
			const g = 0.85 + r() * 0.3;
			for (let i = 0; i < knock.length; i++) {
				const t = i / SR;
				const env = Math.exp(-t * 28);
				knock[i] = (Math.sin(TAU * 118 * t) * 0.9 + Math.sin(TAU * 190 * t) * 0.5 + Math.sin(TAU * 310 * t) * 0.25) * env * g;
			}
			const thump = envelope(lowpass(noise(Math.round(0.05 * SR), 42 + k), 1500), (t) => Math.exp(-t * 90));
			add(knock, thump, 0, 0.9);
			add(x, knock, k * KNOCK_SPACING_S + (r() - 0.5) * 0.02);
		}
		// small room
		const y = new Float32Array(x.length);
		const d = Math.round(0.031 * SR);
		for (let i = 0; i < x.length; i++) y[i] = x[i] + (i >= d ? y[i - d] * 0.35 : 0);
		return normalize(y, 0.8);
	},
	breathing() {
		const x = buf(3.4);
		const inhale = envelope(bandpass(noise(Math.round(1.3 * SR), 51), 700, 2600), (t, p) => Math.sin(Math.PI * p) ** 1.5 * (0.9 + 0.1 * Math.sin(TAU * 9 * t)));
		const exhale = envelope(bandpass(noise(Math.round(1.6 * SR), 52), 250, 1400), (t, p) => Math.sin(Math.PI * Math.pow(p, 0.6)) ** 1.2 * (0.85 + 0.15 * Math.sin(TAU * 13 * t)));
		add(x, inhale, 0.05, 0.8);
		add(x, exhale, 1.55, 1);
		return normalize(x, 0.7);
	},
	electrical_buzz() {
		const x = buf(2.5);
		const r = prng(61);
		let amp = 1;
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			if (i % 400 === 0) amp = 0.5 + r() * 0.6;
			let s = 0;
			for (let h = 1; h <= 9; h++) s += Math.sin(TAU * 120 * h * t) / h;
			x[i] = s * 0.5 * amp;
			if (r() < 0.002) x[i] += (r() * 2 - 1) * 2;
		}
		return normalize(makeLoop(lowpass(x, 3500), 0.3), 0.55);
	},
	impact() {
		const x = buf(2.6);
		let ph = 0;
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			const freq = 35 + 55 * Math.exp(-t * 6);
			ph += (TAU * freq) / SR;
			x[i] = Math.sin(ph) * Math.exp(-t * 3.2);
		}
		add(x, envelope(lowpass(noise(Math.round(0.4 * SR), 71), 900), (t) => Math.exp(-t * 14)), 0, 0.9);
		const y = new Float32Array(x.length);
		const d = Math.round(0.067 * SR);
		for (let i = 0; i < x.length; i++) y[i] = x[i] + (i >= d ? y[i - d] * 0.45 : 0);
		return normalize(fadeEdges(y, 0.002), 0.9);
	},
	glass_break() {
		const x = buf(2.2);
		add(x, envelope(highpass(noise(Math.round(0.25 * SR), 81), 1800), (t) => Math.exp(-t * 18)), 0, 1);
		const r = prng(82);
		for (let k = 0; k < 70; k++) {
			const at = Math.pow(r(), 1.8) * 1.5;
			const f = 2200 + r() * 6500;
			const len = 0.04 + r() * 0.18;
			const ting = buf(len);
			for (let i = 0; i < ting.length; i++) {
				const t = i / SR;
				ting[i] = Math.sin(TAU * f * t) * Math.exp(-t * (14 + r() * 4));
			}
			add(x, ting, at, 0.25 + r() * 0.35);
		}
		return normalize(x, 0.75);
	},
	motel_ambience() {
		const x = buf(8.5);
		add(x, lowpass(brown(x.length, 91), 500), 0, 0.6);
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			x[i] += (Math.sin(TAU * 120 * t) * 0.05 + Math.sin(TAU * 240 * t) * 0.03) * (0.8 + 0.2 * Math.sin(TAU * 0.5 * t));
		}
		return normalize(makeLoop(x, 0.5), 0.5);
	},
	scratching() {
		const x = bandpass(noise(Math.round(4.6 * SR), 101), 900, 4200);
		const r = prng(102);
		let g = 0;
		for (let i = 0; i < x.length; i++) {
			if (i % 700 === 0) g = r() < 0.75 ? 0.4 + r() * 0.8 : 0.05;
			const t = i / SR;
			const sweep = Math.min(1, t / 0.4) * Math.min(1, (4.6 - t) / 0.6);
			x[i] *= g * sweep * (0.7 + 0.3 * Math.sin(TAU * 23 * t));
		}
		return normalize(lowpass(x, 5000), 0.7);
	},
	creak() {
		const x = buf(1.6);
		let ph = 0;
		const r = prng(111);
		let g = 0;
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			const f = 95 - 30 * (t / 1.6) + Math.sin(TAU * 3 * t) * 6;
			ph += f / SR;
			const saw = (ph % 1) * 2 - 1;
			if (i % 180 === 0) g = 0.3 + r() * 0.7;
			x[i] = saw * g * Math.sin(Math.PI * Math.min(1, t / 1.6));
		}
		return normalize(bandpass(x, 150, 1800), 0.6);
	},
	whisper() {
		const x = envelope(bandpass(noise(Math.round(1.4 * SR), 121), 1800, 6000), (t) => {
			const s1 = Math.exp(-((t - 0.3) ** 2) / 0.012);
			const s2 = Math.exp(-((t - 0.8) ** 2) / 0.02);
			return s1 * 0.8 + s2;
		});
		return normalize(x, 0.6);
	},
	phone_buzz() {
		const x = buf(0.55);
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			const on = t < 0.22 || (t > 0.3 && t < 0.52) ? 1 : 0;
			x[i] = Math.sign(Math.sin(TAU * 170 * t)) * 0.6 * on;
		}
		return normalize(fadeEdges(lowpass(x, 900), 0.01), 0.5);
	},
	tv_on() {
		const x = buf(1.2);
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			x[i] = Math.sin(TAU * (7800 + 300 * t) * t) * 0.08 * Math.exp(-t * 1.5);
		}
		add(x, envelope(lowpass(noise(Math.round(0.12 * SR), 131), 600), (t) => Math.exp(-t * 30)), 0, 1);
		add(x, envelope(bandpass(noise(Math.round(0.9 * SR), 132), 500, 5000), (t, p) => Math.min(1, t * 20) * (1 - p)), 0.08, 0.4);
		return normalize(x, 0.6);
	},
	train() {
		const x = lowpass(brown(Math.round(5.5 * SR), 141), 250);
		const r = prng(142);
		for (let k = 0; k < 16; k++) {
			const clack = envelope(bandpass(noise(Math.round(0.08 * SR), 143 + k), 300, 2500), (t) => Math.exp(-t * 60));
			add(x, clack, 0.2 + k * 0.33 + (k % 2) * 0.09 + (r() - 0.5) * 0.02, 0.5);
		}
		return normalize(makeLoop(x, 0.5), 0.6);
	},
};

let made = 0;
for (const [name, gen] of Object.entries(G)) {
	const file = path.join(placeholderDir, `${name}.wav`);
	if (!force && fs.existsSync(file)) continue;
	writeWav(file, gen());
	made++;
}

const real = fs
	.readdirSync(audioDir)
	.filter((f) => /\.(wav|mp3|ogg|m4a)$/i.test(f));
console.log(
	`[prepare-assets] placeholder SFX: ${made ? `generated ${made}` : 'up to date'} (public/audio/placeholders). ` +
		`Real audio files found: ${real.length ? real.join(', ') : 'none yet'}.`,
);
