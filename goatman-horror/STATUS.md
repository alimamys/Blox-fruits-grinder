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
- **Voices:** 167 lines, all on Fish **Drama 3**.
  - The narrator was re-cast after the first-minute review ("monotone"). 22 auditions across Drama 3 and s2.1-pro were measured by how much the pitch moves (`scripts/voice/narrator_audition.py`, reels in `previews/voice_audition/`).
  - The user chose A: Drama 3 "Narrator" (young male), sampled a little wider, with a direction on every line.
  - Takes were tightened (the earlier takes set the pace, up to 1.25×, gaps inside lines up to 0.3 s): 10.5 → 9.0 minutes of speech.
  - Whisper QA: the 3 remaining flags are near-homophones and the name Wyatt.
  - New effects: `outdoor`, `trailer`, and `thing` (the voice at the door, re-timed syllable by syllable with no human rhythm).
- **Sound:** 23 new sounds from real recordings (CC0 and CC-BY), built by `scripts/sfx/build_goatman_sfx.py`, with credits in `public/audio/sfx/CREDITS.md`.
  - Beds: woods by day and night, campfire, creek, trailer, city.
  - Rifle shot with a forest echo, the trailer's metal door, gibbering, an animal scream, and more.
- **Length:** 10:46 with the whole script.
- **Art:** 102 frames, 20 animation drawings and 10 lip-sync mouths, each reviewed.
  - 9 frames were redrawn for story logic or continuity: Cole kept appearing beside Mr. Dawes; a second Nia; crowds where only six remain; the wrong Nia's face too small; the trail silhouette lost.
  - Fix after review: animation drawings are merged as whole areas, so Ray's turn at the pot no longer shows two faces.
  - The trailer bathroom door opening is drawn in code.
- **Motif:** each count (12, 11, 6, 8, 9, 7, 8) is scratched onto the frame.
- **YouTube:** `youtube/` holds:
  - title and alternatives, 9 chapters, the description with the story credit (4,287 characters), tags and a pinned comment;
  - 3 mystery thumbnails: "COUNT THEM", "DON'T TURN AROUND", "WHO ATE IT?" ($0.74), and the phone-feed check `feed_preview.jpg`.

## Cost

- **Images:** $27.60 of the $30 cap: lookdev $3.21, frames $17.03, drawings $4.27, mouths $2.35, thumbnails $0.74.
- **Voices:** Fish, about 23,000 characters across all takes and auditions (well under $1).

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
