# The Radio Station That Knew His Name

A complete ~10-minute narrated YouTube horror video built with **React + Remotion + TypeScript**.

It is drawn on purpose in a crude, beginner MS Paint style: stick figures, flat colours and thick wobbly outlines that "boil" from frame to frame. Realistic-looking fictional evidence is cut in between: an old newspaper, police photographs, a scanned notebook, an archive search UI, a signal analyser and grainy motel CCTV.

- 1920×1080, 16:9, 30 fps, H.264 MP4
- Composition: **`RadioStationHorror`**, 18,691 frames (**10:23**), with a full voice-over at an unhurried pace
- All artwork is procedural SVG, canvas or CSS. No image assets are needed.
- Placeholder sound effects are synthesised automatically, so the video has sound design before you add any real audio.

> **Disclaimer:** the story, characters, recordings, documents, newspaper (*The Morning Record*) and CCTV footage are all fictional.

---

## Quick start

Requires Node.js 18 or newer.

```bash
cd radio-station-horror
npm install
npm run start          # opens Remotion Studio at http://localhost:3000
```

`npm run start` first runs `scripts/prepare-assets.mjs`. That script creates the `public/audio/` folders and generates the placeholder sound effects. It takes under a second.

## Rendering

```bash
npm run render
```

This writes **`out/radio-station-horror.mp4`** (H.264, CRF 18, 1920×1080, with audio). It is the same as running:

```bash
npx remotion render src/index.ts RadioStationHorror out/radio-station-horror.mp4 --codec=h264 --crf=18
```

Other useful commands:

| Command | What it does |
|---|---|
| `npm run render:fast` | Half-resolution draft (`out/radio-station-horror-draft.mp4`) |
| `npm run master` | Loudness-normalises the render to YouTube level (−14 LUFS) → `out/radio-station-horror-master.mp4`, using Remotion's bundled ffmpeg |
| `npm run still -- --frame=2000` | Single PNG of any frame |
| `npm run script:export` | Writes `narration-script.md` (timecoded recording script) and `captions.srt` (YouTube subtitles) |
| `npm run lint` | ESLint + TypeScript type-check |
| `npm run typecheck` | TypeScript only |

Remotion downloads its own headless Chrome the first time you render. If you are offline, or in CI, point it at an installed Chrome or Chromium instead:

```bash
BROWSER_EXECUTABLE=/path/to/chrome npm run render
```

On a 4-core machine a full 1080p render takes about 40–50 minutes with `--concurrency=4`; a half-resolution draft takes about a third of that.

---

## Project structure

```
radio-station-horror/
├── public/audio/              ← put your narration + sound effects here (see below)
├── scripts/
│   ├── prepare-assets.mjs     ← synthesises placeholder SFX (runs before start/render)
│   └── export-script.ts       ← timecoded narration script + captions.srt
└── src/
    ├── index.ts               ← Remotion entry
    ├── Root.tsx               ← compositions (RadioStationHorror + dev helpers)
    ├── RadioStationHorror.tsx ← lays chapters out from the timeline
    ├── config.ts              ← fps, size, beep/knock spacing, line-boil settings, default props
    ├── data/
    │   ├── script.ts          ← ★ THE SCRIPT: every line, its duration and its sound cues
    │   ├── timeline.ts        ← seconds → frames (no need to edit)
    │   └── types.ts
    ├── audio/                 ← safe optional audio loading + SoundDesign layer
    ├── components/            ← StickPerson, Radio, Door, Bed, DigitalClock, Phone, TrainScene,
    │   │                        SpeechWave, StaticOverlay, CRTNoise, CCTVOverlay, OldNewspaper,
    │   │                        NotebookPage, EvidencePhoto, RadioText, RadioVoiceScreen, Stage…
    │   └── sets/              ← ApartmentRoom, Bedroom, MotelRoom, CCTVHallway, Exteriors, Interiors
    ├── scenes/                ← one file per chapter (ColdOpen, RadioReturns, Protecting, TheBed,
    │                            VictorHale, Motel, Aftermath, Daniel, Cards)
    ├── utils/                 ← wobbly-line drawing, seeded noise, easing, fonts, timeline context
    └── dev/                   ← Gallery + ContactSheet compositions for checking artwork
```

### Chapter timing (current)

| Start | Chapter |
|---|---|
| 0:00 | Disclaimer (4.6 s) |
| 0:05 | Cold open: "Adam." / knocking / the repeating neighbour / "Good." |
| 1:35 | Title card |
| 1:40 | Part 1: The radio returns (unplugged, red train) |
| 2:59 | Part 2: It starts protecting him (6th-floor scratch, elevator) |
| 4:11 | Part 3: The bed |
| 5:12 | Part 4: Victor Hale (market, newspaper, police photos, notebook) |
| 6:31 | Part 5: The motel (TV reflection, SUBJECT LOCATED, the bed lifts) |
| 8:45 | Part 6: Aftermath (motel CCTV) |
| 9:27 | Daniel, then cut to black |
| 10:16 | End card (total 10:23) |

---|---|
| 0:00 | Disclaimer (4.4 s) |
| 0:04 | Cold open: "Adam." / knocking / the repeating neighbour / "Good." |
| 1:14 | Title card |
| 1:17 | Part 1: The radio returns (unplugged, red train) |
| 2:15 | Part 2: It starts protecting him (6th-floor scratch, elevator) |
| 3:09 | Part 3: The bed |
| 3:55 | Part 4: Victor Hale (market, newspaper, police photos, notebook) |
| 4:52 | Part 5: The motel (TV reflection, SUBJECT LOCATED, the bed lifts) |
| 6:30 | Part 6: Aftermath (motel CCTV) |
| 7:05 | Daniel, then cut to black |
| 7:43 | End card (total 7:49) |

---|---|
| 0:00 | Disclaimer (4.6 s) |
| 0:05 | Cold open: "Adam." / knocking / the repeating neighbour / "Good." |
| 1:19 | Title card |
| 1:23 | Part 1: The radio returns (unplugged, red train) |
| 2:20 | Part 2: It starts protecting him (6th-floor scratch, elevator) |
| 3:12 | Part 3: The bed |
| 3:56 | Part 4: Victor Hale (market, newspaper, police photos, notebook) |
| 4:52 | Part 5: The motel (TV reflection, SUBJECT LOCATED, the bed lifts) |
| 6:26 | Part 6: Aftermath (motel CCTV) |
| 7:01 | Daniel, then cut to black |
| 7:38 | End card |

---

## Changing narration timing

Everything time-related lives in **`src/data/script.ts`**. Each chapter is a list of *beats*, and each beat is one line of narration, dialogue, a beep group, a knock group or a pause:

```ts
n('lookedDoor', 'Adam slowly looked toward his front door.', 2.05),   // narrator, 2.05 s
r('apartment', 'Apartment 6B.', 1.6),                                 // radio voice (text also flashed on screen)
v('neighbor', 'openUp', 'Adam, open up. I need help.', 2.0),          // character dialogue
...beeps(),                                                           // BEEP. BEEP. BEEP. + three_beeps.wav
knocks('knock1', 0.85),                                               // KNOCK. KNOCK. KNOCK. + knocking.wav
```

- **Change a `dur`** (in seconds) and every shot, camera move, on-screen text and sound cue tied to that beat moves with it. Scenes never hard-code story frames. They ask for "the start of beat X" through `useShot().at('beatId')`.
- **Leave `dur` out** and it is estimated from the word count.
- **Sound cues** are attached to beats, e.g. `{sfx: [sfx('impact', {volume: 0.5, at: 0.05})]}`. Ambience beds are set per chapter with `ambience: [{sfx, volume, from, until}]`. Ending a bed just before a reveal creates the silence before a scare.
- **The CCTV rule:** in `aftermath`, Victor walks out *exactly* 11 seconds after Adam, enforced in `scenes/Aftermath.tsx`. Keep `adamRan` + `elevenLater` at about 11.7 s so the narration "someone else walked out" lands on Victor's exit.
- `BEEP_SPACING_S` and `KNOCK_SPACING_S` in `src/config.ts` must match the spacing in your `three_beeps.wav` and `knocking.wav`.

Workflow once you have a voice-over:

1. Run `npm run script:export` to get `narration-script.md` with every line's start time and duration.
2. Record the lines, or generate them line by line.
3. Drop the files in (see the next section), scrub through Studio, and adjust the `dur` values until picture and voice line up.

---

## Audio files

Every file is **optional**. Missing files are skipped silently. They never crash the Studio or a render; the check uses `getStaticFiles()`, see `src/audio/audioFiles.ts`. Supported formats: `.wav`, `.mp3`, `.ogg` and `.m4a`.

### Sound effects: `public/audio/<name>.wav`

| File | Used for |
|---|---|
| `low_ambient_hum.wav` | apartment room tone (looped bed) |
| `radio_static.wav` | static, hiss, crackles |
| `three_beeps.wav` | the BEEP. BEEP. BEEP. motif (beeps 0.8 s apart) |
| `knocking.wav` | KNOCK. KNOCK. KNOCK. (knocks 0.55 s apart) |
| `breathing.wav` | bathroom, under the bed, the final breath |
| `electrical_buzz.wav` | radio switching off, elevator lights, motel TV |
| `impact.wav` | "Tomorrow.", something hitting the floor |
| `glass_break.wav` | lights exploding, window smash |
| `motel_ambience.wav` | motel room tone (looped bed) |

Extra optional hooks: `scratching.wav`, `creak.wav`, `whisper.wav`, `phone_buzz.wav`, `tv_on.wav`, `train.wav`.

A real file at `public/audio/<name>.wav` always wins. Without one, the procedural placeholder in `public/audio/placeholders/` is used. Regenerate the placeholders with `node scripts/prepare-assets.mjs --force`, or disable them with `NO_PLACEHOLDER_AUDIO=1`.

### Narration and voices

**A complete voice-over is included.** All 312 spoken lines are in `public/audio/voice/<chapterId>/<beatId>.mp3`. They were generated with the open-weight [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) TTS model:

| Speaker | Voice | Treatment |
|---|---|---|
| Narrator | `am_michael`, speed 1.08 (unhurried) | light compression |
| Radio station (also via TV and alarm clock) | `bf_emma`, speed 0.88 | band-limited 300 Hz–3.4 kHz "broadcast", short echo |
| Neighbor | `am_puck` | muffled through the door in the cold open. The three "Adam, please." clips are **byte-identical** |
| Adam | `am_fenrir` | — |
| Seller | `bm_george` | — |
| Victor | `bm_fable`, slowed | thin, breathy, trembling |

The timeline fits itself to the clips. `src/data/voice-durations.json` lists each clip's length, and every voiced beat lasts `clip + gap`, so lines never overlap. The pauses between lines (`VOICE_GAP`, `ELLIPSIS_GAP`, `CHAPTER_END_GAP`) and the suspense beats that keep a longer authored pause (`HOLD_BEATS`) are all in `src/data/script.ts`. To change the speaking speed, edit `VOICES` in `scripts/tts/generate_voices.py` and regenerate.

**To use your own voice actor**, replace any clip with a recording of the same name (`.wav` / `.mp3` / `.ogg` / `.m4a`). Then update its length in `voice-durations.json`, or regenerate the whole file with the TTS script below.

**To regenerate the TTS** (e.g. with different voices or speeds, set in `VOICES` in the script):

```bash
python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile
# download kokoro-v1.0.onnx + voices-v1.0.bin from
# https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
npm run voices:beats
.tts/bin/python scripts/tts/generate_voices.py --beats beats.json --model kokoro-v1.0.onnx --voices voices-v1.0.bin
```

This needs `ffmpeg` on your PATH. If espeak-ng complains about a missing `phontab`, copy the `espeakng_loader/espeak-ng-data` folder to a short path and pass `--espeak-data <that path>`.

Alternative voice layouts are still supported:

| Location | Plays |
|---|---|
| `public/audio/narrator.wav` | One continuous narration track from the start of the cold open (0:04.6). |
| `public/audio/narration/<chapterId>.wav` | One file per chapter. |

If you use one of these, delete `public/audio/voice/` and empty `voice-durations.json` (`{}`) so the lines don't double up.

**The radio voice** should sound female, calm, even and emotionally neutral. It should be unsettling because it never sounds afraid. Light band-pass filtering (300 Hz–3.4 kHz) plus a little static sells the "broadcast".

Master volumes for SFX and voice are input props (see below).

---

## Input props (editable in Studio's right panel)

| Prop | Default | |
|---|---|---|
| `showSubtitles` | `false` | burn narration subtitles into the video |
| `showChapterLabels` | `true` | small "PART 2 — …" labels at chapter starts |
| `sfxVolume` | `1` | master volume for effects + ambience |
| `voiceVolume` | `1` | master volume for narration / voice files |

To render with props from the CLI:

```bash
npx remotion render src/index.ts RadioStationHorror out/subtitled.mp4 --props='{"showSubtitles":true,"showChapterLabels":true,"sfxVolume":1,"voiceVolume":1}'
```

---

## Style notes

- **Line boil:** every MS Paint shape is re-jittered every 4 frames, cycling through 3 variants, so held shots never freeze. Tune it or switch it off in `LINE_BOIL` in `src/config.ts`.
- **Camera:** `Stage` and `Layer` (`src/components/Stage.tsx`) give each set a virtual camera (`x`, `y`, `zoom`, `rot`), parallax depth, subtle handheld drift and impulse shake. `camKeys()` interpolates camera keyframes.
- **Fonts** are bundled locally through `@fontsource` (SIL Open Font License): Comic Neue, Permanent Marker, Share Tech Mono, VT323, Caveat, Reenie Beanie, Special Elite, UnifrakturMaguntia, Oswald, Old Standard TT and Inter.
- **Dev compositions** (Studio → "Dev" folder):
  - `Gallery` shows one frame per set and evidence component.
  - `ContactSheet` renders chosen frames of the main video: `--props='{"frames":[300,900]}' --frames=0-1`.

## Rewatch details (spoilers)

<details>
<summary>Things viewers may notice the second time</summary>

- Before Adam knows Victor exists, a pale figure appears in the living-room window reflection for a third of a second, as Adam steps back from the door.
- During "ADAM.", the static briefly forms eyes and a mouth.
- The radio's display sometimes reads **01.17**, and its model plate reads **SW-117**.
- During the nightly instructions, the shadow in the gap under Adam's bed grows a little each night.
- Victor's notebook contains `V. HALE 1:17 NOV 6` (crossed out), `it doesn't warn. it TELLS.`, `don't look under` and, faintly, **`DANIEL — rm 204`**.
- The newspaper photo of Victor matches the man in the motel reflection and on CCTV (thin, pale, slicked hair, cardigan).
- The CCTV timestamp reads **01:17:42** as Adam runs and **01:17:53** when Victor walks out.
- When Daniel buys the radio, its back panel is scratched with **V.H. 87** and **A.R.**
</details>
