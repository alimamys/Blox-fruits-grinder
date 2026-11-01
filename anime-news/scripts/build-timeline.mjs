#!/usr/bin/env node
// Builds src/generated/timeline.json and src/generated/media-status.json.
//
// * Narration: for every caption cue it uses public/audio/narration/<CUE>.wav
//   (FINAL, supplied by you) if present, otherwise the TEMP scratch file in
//   public/audio/narration_scratch/<CUE>.wav, otherwise a words-per-minute
//   estimate. Real audio durations decide every cut and caption time.
// * Artwork / SFX: records which files exist so the video can show
//   placeholders (clearly labelled) for anything missing.
//
// Usage: node scripts/build-timeline.mjs [--report]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const script = JSON.parse(readFileSync(join(ROOT, 'src/data/script.json'), 'utf8'));
const registry = JSON.parse(readFileSync(join(ROOT, 'src/data/assets.json'), 'utf8'));
const FPS = script.fps;
const NARRATION_EXTS = ['wav', 'mp3', 'm4a', 'flac'];
export const SFX_NAMES = ['radio_click', 'synth_pulse_bed', 'bass_accent', 'water_distant', 'tick_motif', 'whoosh', 'riser', 'title_hit', 'glint', 'bus_rumble', 'room_tone', 'monitor_hum'];

function ffprobeBin() {
  try {
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
    return 'ffprobe';
  } catch {
    const dir = join(ROOT, 'node_modules/@remotion');
    for (const d of existsSync(dir) ? readdirSync(dir) : []) {
      const p = join(dir, d, 'ffprobe');
      if (d.startsWith('compositor-') && existsSync(p)) return p;
    }
    throw new Error('ffprobe not found');
  }
}
const FFPROBE = ffprobeBin();
const seconds = (file) =>
  parseFloat(
    execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim(),
  );

function findAudio(dir, id) {
  for (const ext of NARRATION_EXTS) {
    const rel = `audio/${dir}/${id}.${ext}`;
    if (existsSync(join(PUB, rel))) return rel;
  }
  return null;
}

// ---------- narration timeline ----------
const scenes = [];
let frame = 0;
const counts = { final: 0, tts: 0, scratch: 0, missing: 0 };
for (const sc of script.scenes) {
  const sceneStart = frame;
  let t = sc.leadInFrames ?? 0;
  const cues = [];
  for (const c of sc.cues) {
    // priority: your recording > Kokoro neural TTS > old Pico scratch > estimate
    let audio = findAudio('narration', c.id);
    let kind = 'final';
    if (!audio) {
      audio = findAudio('narration_tts', c.id);
      kind = 'tts';
    }
    if (!audio) {
      audio = findAudio('narration_scratch', c.id);
      kind = audio ? 'scratch' : 'missing';
    }
    counts[kind]++;
    const secs = audio ? seconds(join(PUB, audio)) : (c.text.split(/[\s-]+/).length / 150) * 60;
    const dur = Math.ceil(secs * FPS);
    const start = sceneStart + t;
    cues.push({ id: c.id, text: c.text, startFrame: start, durationFrames: dur, endFrame: start + dur, seconds: +secs.toFixed(3), audio, audioKind: kind });
    t += dur + (c.pauseAfter ?? script.defaults.pauseAfterFrames);
  }
  t += sc.tailFrames ?? 0;
  const sceneEnd = sceneStart + t;
  // caption windows: from cue start until a short tail after the audio, never overlapping the next cue
  cues.forEach((c, i) => {
    const limit = i + 1 < cues.length ? cues[i + 1].startFrame : sceneEnd;
    c.captionStart = c.startFrame;
    c.captionEnd = Math.min(c.endFrame + script.defaults.captionTailFrames, limit);
  });
  const resolve = (trg) => {
    if (trg.at === 'sceneStart') return sceneStart;
    const c = cues.find((x) => x.id === trg.cue);
    if (!c) throw new Error(`Unknown cue ${trg.cue} in ${sc.id}`);
    return trg.at === 'end' ? c.endFrame : c.startFrame;
  };
  scenes.push({
    id: sc.id,
    chapter: sc.chapter,
    startFrame: sceneStart,
    durationFrames: t,
    planStartSec: sc.planStartSec,
    planDurationSec: sc.planDurationSec,
    sourceIds: sc.sourceIds,
    assetIds: sc.assetIds,
    cues,
    visualCues: sc.visualCues.map((v) => ({ n: v.n, frame: resolve(v.trigger), text: v.text })),
    soundCues: sc.soundCues.map((s) => ({ frame: resolve(s.trigger), text: s.text })),
  });
  frame = sceneEnd;
}
const timeline = { fps: FPS, width: script.width, height: script.height, totalFrames: frame, narration: counts, scenes };

// ---------- media status ----------
const has = (rel) => existsSync(join(PUB, rel));
const assets = {};
for (const a of registry.assets) {
  assets[a.id] = {
    key: a.key,
    file: has(`assets/${a.file}`) ? `assets/${a.file}` : null,
    layers: (a.layers ?? []).filter((l) => has(`assets/${l.file}`)).map((l) => ({ file: `assets/${l.file}`, depth: l.depth })),
    variants: Object.fromEntries(
      (a.variants ?? []).filter((v) => has(`assets/${v.file}`)).map((v) => [v.file.split('.').slice(-2, -1)[0], `assets/${v.file}`]),
    ),
    anchors: a.anchors,
  };
}
const sfx = {};
for (const n of SFX_NAMES) {
  const fin = ['wav', 'mp3', 'flac'].map((e) => `audio/sfx/${n}.${e}`).find(has);
  const tmp = `audio/sfx_temp/${n}.wav`;
  sfx[n] = fin ? { file: fin, temp: false } : has(tmp) ? { file: tmp, temp: true } : { file: null, temp: true };
}
mkdirSync(join(ROOT, 'src/generated'), { recursive: true });
writeFileSync(join(ROOT, 'src/generated/timeline.json'), JSON.stringify(timeline, null, 1) + '\n');
writeFileSync(join(ROOT, 'src/generated/media-status.json'), JSON.stringify({ assets, sfx }, null, 1) + '\n');

// ---------- console report ----------
const fmt = (f) => `${Math.floor(f / FPS / 60)}:${String(((f / FPS) % 60).toFixed(2)).padStart(5, '0')}`;
console.log(`Timeline: ${frame} frames = ${fmt(frame)} at ${FPS} fps (plan 4:00 / 5760 frames)`);
for (const s of scenes) {
  const delta = s.durationFrames / FPS - s.planDurationSec;
  console.log(
    `  ${s.id} ${fmt(s.startFrame)} +${(s.durationFrames / FPS).toFixed(2)}s (plan ${s.planDurationSec}s, ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}s)  ${s.chapter}`,
  );
}
console.log(`Narration cues: ${counts.final} final, ${counts.tts} AI voice (Kokoro, TEMP), ${counts.scratch} scratch TTS, ${counts.missing} missing (estimated)`);
const missingArt = registry.assets.filter((a) => !assets[a.id].file);
console.log(`Artwork: ${registry.assets.length - missingArt.length}/${registry.assets.length} supplied; PLACEHOLDER for ${missingArt.map((a) => a.id).join(', ') || 'none'}`);
console.log(`SFX: ${Object.entries(sfx).map(([k, v]) => `${k}=${v.file ? (v.temp ? 'TEMP' : 'final') : 'missing'}`).join(', ')}`);
if (process.argv.includes('--report')) {
  console.log('\nPreview (opening 20 s) needs:');
  for (const a of registry.assets.filter((x) => x.inPreview)) {
    console.log(`  [${assets[a.id].file ? 'x' : ' '}] ${a.id} public/assets/${a.file}`);
  }
  for (const s of scenes.slice(0, 2)) {
    for (const c of s.cues) {
      if (c.startFrame >= 20 * FPS) break;
      console.log(`  [${c.audioKind === 'final' ? 'x' : ' '}] public/audio/narration/${c.id}.wav  "${c.text}"`);
    }
  }
}
