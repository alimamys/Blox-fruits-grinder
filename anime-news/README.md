# THE WEEK IN ANIME: POWER UNDER PRESSURE

Remotion + React + TypeScript project for the weekly anime-style news recap, week ending Sunday 1 November 2026 (coverage 26 Oct–1 Nov 2026), built from `anime_news_2026-11-01_production_script.txt`.

1920×1080 · 24 fps · H.264 + AAC · yellow sentence-case subtitles on a dark lower band · SRT export.

## Status

| Part | State |
|---|---|
| Project, data model, timing engine, caption/SRT export | done |
| **Opening preview** (`OpeningPreview`, S01 cold open + S02 opening shot) | built; rendered to `out/preview/opening_preview.mp4` + `.srt` |
| Rest of S02 and S03–S07 (`Main`) | timed **animatic** only: correct narration/caption timing, planned plate per storyboard cue, cue text on screen; factual overlays not built yet |
| Artwork | **TEMPORARY placeholders** (code blockouts), see `ASSETS.md` |
| Narration | **TEMPORARY scratch TTS** (offline SVOX Pico), see `ASSETS.md` |
| SFX / music | **TEMPORARY procedural** sounds generated in code, see `ASSETS.md` |
| Cutdown (70 s) | not started |

Every render shows a red **ANIMATIC · TEMPORARY** flag listing what is still temporary; each placeholder plate is labelled with its asset ID and the exact file it is waiting for. The flag disappears once everything is final.

### About the preview length

The brief's opening is 20 s, but with real narration timing the cold open ends at 18.9 s and the narrator is mid-sentence at 20 s ("We start in the Gulf, where diplomacy continued under the threat of renewed strikes."). The brief also requires that no clip truncates narration, so `OpeningPreview` runs to the end of that sentence (24.9 s with the scratch voice). The length re-computes automatically from the final recording.

## Quick start

```bash
npm install
npm run studio            # interactive preview in the browser
npm run render:preview    # out/preview/opening_preview.mp4 + .srt
npm run render:main       # full-length animatic + .srt (slow)
npm run assets:check      # what is supplied vs placeholder
npm run checklist         # regenerate ASSETS.md
```

Regenerating the temporary media (only needed if you delete it): `npm run audio:scratch` (needs `pico2wave` or `espeak-ng`), `npm run audio:sfx` and `npm run textures` (Python 3 + numpy + Pillow).

## Replacing placeholders

1. **Artwork** → `public/assets/<file>.png` using the filenames and prompts in `ASSETS.md` (2560×1440+, 16:9, no baked-in text). Optional layer files (`<key>.<layer>.png`) switch on real parallax; optional variants (`<key>.blink.png` …) add blinks.
2. **Narration** → `public/audio/narration/<CUE_ID>.wav`, one file per line, tight-trimmed. Or record one take per chapter and split it:
   `python3 scripts/split_take.py S01 S01_take.wav --dry-run` (then without `--dry-run`).
3. **SFX / music** → `public/audio/sfx/<name>.wav` with the names in `ASSETS.md`.
4. `npm run render:preview`. `scripts/build-timeline.mjs` re-measures every audio file, so cuts, captions and the SRT re-time from the real recording.

If delivered art is composed differently from the brief's layout notes, adjust the `anchors` for that asset in `src/data/assets.json`: the camera crops target those points.

## How it is organised

```
src/data/script.json        scenes as data: narration (verbatim), caption cues, pauses, visual cues,
                            sound cues, source IDs, asset IDs, planned timecodes
src/data/assets.json        A01–A15: filenames, prompts, composition notes, crop anchors, layers, variants
src/data/sources.json       F01–F06 with links and fact notes
src/generated/              timeline.json + media-status.json (written by scripts/build-timeline.mjs)
src/lib/timeline.ts         typed scenes (id, startFrame, durationFrames, narration, sourceIds,
                            assetPaths, captionCues, visualCues, soundCues)
src/components/Plate.tsx    one illustration seen through a virtual camera; real art (layered or flat)
                            or a labelled placeholder; restrained parallax, water shimmer, variants
src/components/placeholders.tsx   TEMP code-drawn blockouts (no likenesses of real people)
src/components/Overlays.tsx subtitles, ANIMATED ILLUSTRATION mark, TEMP flag, labels, film grain
src/components/Sound.tsx    narration + beds/hits, beds ducked under speech
src/scenes/S01ColdOpen.tsx  cold open; all cuts derived from narration cue timings
src/scenes/S02Gulf.tsx      S02 visual cue 1 (wide Gulf), then animatic
src/scenes/AnimaticScene.tsx  timed animatic for chapters not yet built
scripts/                    timeline builder, SRT export, checklist, take splitter, TEMP audio/texture generators
```

Timing model: each scene = lead-in + Σ(line audio + pause after line) + tail. Lines, pauses, lead-ins and tails live in `script.json`; storyboard triggers ("On 'Five stories'…") are expressed as cue IDs so they move with the audio.

## Editorial safeguards built in

- Narration text in `script.json` is checked to match the brief verbatim (511 words), and the caption cues join back to it exactly.
- All dates, labels and (later) numbers are rendered in code, never baked into artwork; placeholder prompts forbid text in images.
- Public figures stay silent; placeholder portraits are generic silhouettes, not likenesses.
- The cold open shows no financial figures, signatures, handshakes, projected winners or invented outcomes.
- "ANIMATED ILLUSTRATION" mark on every picture frame; title card states "Animated illustrations of reported events".

## Sources (reporting cutoff 1 November 2026)

- **F01 Gulf mediation**: [Al-Monitor/Reuters](https://www.al-monitor.com/originals/2026/11/iran-qatari-mediators-hold-third-day-talks-end-us-iran-war) · [AP](https://apnews.com/article/b918f44d8f212d7daf7f2f9a98c91a0b)
- **F02 Israeli election**: [The Times of Israel](https://www.timesofisrael.com/liveblog_entry/central-elections-committee-publishes-final-election-results-knesset-to-be-sworn-in-nov-10/) · [AP](https://apnews.com/article/3a793c0d07fdfe515390524b849d8674) · [AP via AFN](https://api.afn.net/ap/israel-anti-semitism/difficult-negotiations-lie-ahead-in-israel-after-no-clear-election-winner/)
- **F03 Oleshky evacuation**: [Reuters via Investing.com](https://www.investing.com/news/world-news/starved-residents-of-russianoccupied-oleshky-return-to-ukraine-during-a-rare-local-ceasefire-4989296) · [AP via ABC News](https://abcnews.com/International/wireStory/evacuees-reunite-family-ukrainian-belarusian-border-after-fleeing-137730820)
- **F04 France protests**: [AFP](https://www.afp.com/en/clashes-break-out-hundreds-thousands-protest-france) · [AP](https://apnews.com/article/362a7cb69871ab21bd894290dad639f5)
- **F05 US market sell-off**: [Reuters via The Star](https://www.thestar.com.my/tech/tech-news/2026/10/31/midterm-us-elections-earnings-jobs-data-loom-for-ai-wary-stock-market) · [AP](https://apnews.com/article/16c266731fdf64178f38070af2b42497)
- **F06 US midterms**: [FEC](https://www.fec.gov/updates/last-minute-disclosure-periods-reminder/) · [AP via Arkansas Advocate](https://arkansasadvocate.com/2026/11/01/a-midterm-crossroads-for-both-parties-eyeing-the-beginning-of-the-end-of-the-trump-era/)

Visual reference R01 (PsyopAnime, "Trump Declares War") informed only the general look; all shots, timing and sound are original.

## Licensing of what is in this repo

Placeholder art, procedural SFX and grain textures are generated by code in this project. Fonts are Oswald, Noto Sans and JetBrains Mono (SIL OFL, via @fontsource). The scratch voice is SVOX Pico output (Apache-2.0 engine) and is for internal timing only.
