# 11 of Us Went Camping. 12 Came Back. — production status

The plan is in [`PLAN.md`](PLAN.md); the script, in our own words, is in [`SCRIPT.md`](SCRIPT.md).

## Decisions

- **Story:** a new retelling of "Anansi's Goatman Story" (4chan /x/, 2012, via the Creepypasta Wiki).
  - The characters are renamed and the story is told in our own words.
  - It opens on a hook (the twelve hot dogs).
  - The ending is new: a present-day epilogue (count the plates).
  - There are no religious lines.
- **Look and pipeline:** the same as "Never Open Your Door at 3:06 AM".
  - Frames come from gpt-image-2, built on code layouts and character sheets.
  - Voices are Fish Drama 3.
  - Motion is limited animation in code.
- **The monster is never shown clearly.** It appears as figures with their backs turned, the wrong Nia, a low shape in shadow, and a goat silhouette in the legend.
- **Motif:** every count is written onto the frame as a scratched number (`src/components/ui/Count.tsx`).
- **Credit:** shown on the end card and in the description.

## Done

- **Project:** copied from the 3:06 pipeline (composition `GoatmanHorror`).
  - The look bible, voice effects and timeline are new.
- **Lookdev:** 9 character sheets and 6 locations, $3.21.
  - Board: `previews/goatman_cast_and_locations.jpg`.
- **Voices:** 167 lines, Fish Drama 3, 7,549 characters (under $1).
  - Casting:
    - narrator "Black (young man, deep, smooth)";
    - Marcus "Young teenager (boy, deep)";
    - Wyatt "boy (young)"; the thing uses Wyatt's voice;
    - Ray "boy (young, relaxed)";
    - Nia "black girl talking";
    - Mr. Dawes "redneck (old, Southern)";
    - Cole "HillBilly".
  - Whisper QA: unclear takes re-recorded. The remaining flags are Whisper mishearing the names Dez and Wyatt.
  - New effects: `outdoor`, `trailer`, and `thing` (the voice at the door, re-timed syllable by syllable with no human rhythm).
- **Sound:** 23 new sounds from real recordings (CC0 and CC-BY), built by `scripts/sfx/build_goatman_sfx.py`, with credits in `public/audio/sfx/CREDITS.md`.
  - Beds: woods by day and night, campfire, creek, trailer, city.
  - Rifle shot with a forest echo, the trailer's metal door, gibbering, an animal scream, and more.
- **Length:** 10:14 with the whole script.
  - Pauses between lines run at 60%, and dramatic holds are kept up to 0.75 s.
- **Scenes 1–2 (the hook, the title, the woods):** in final art.
  - 20 frames, 9 animation drawings and 1 lip-sync mouth.
  - Preview: `previews/goatman_scenes1-2_720p.mp4` (1:49.7, −15.0 LUFS).
- **Scenes 3–9:** written and laid out (160 shots in all).
  - 72 new frames, 8 mouths and about 9 drawings are left to generate.

## Cost

- **Images:** $11.24 of the $30 cap so far.
- **Estimate for the rest:** about $15. Thumbnails are about $0.75.
- **Voices:** under $1.

## Resume

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

```bash
node scripts/images/shotmap.mjs && node scripts/images/keyframes.mjs && .venv/bin/python scripts/images/restyle.py plan
```

```bash
.venv/bin/python scripts/images/restyle.py gen --workers 4 && .venv/bin/python scripts/images/restyle.py anim --workers 4
```

```bash
MOUTH_VARIANTS=1 .venv/bin/python scripts/images/restyle.py mouths && .venv/bin/python scripts/images/restyle.py manifest
```

```bash
node scripts/render.mjs --concurrency=4
```
