# Frame 240: production status

The plan is in [`PLAN.md`](PLAN.md) and was approved:
- title "Frame 240";
- first-person "I turned";
- the bulge is shown, not spoken;
- the closet scenes are filmed on her phone camera;
- 24 fps;
- images capped at $50.

## Done (no API keys needed)

- **Engine:** copied from `passenger63-horror`, composition `Frame240Horror` at 24 fps. The story data is complete: 192 lines and 11 scenes, about 10:26 estimated before voicing (`npm run check`).
- **Shots:**
  - 216 shots, each with a stable id, a code layout and its art direction (`src/scenes/*.tsx`, `src/data/art.ts`).
  - Counts: 96 stills and talking frames, 17 action shots (38 keyframes), 49 reuses, and 54 code shots (editor, phone, `REC`, selection, cursor, title).
  - Layout review sheets: `build/review/layouts_*.jpg`, made by `node scripts/images/keyframes.mjs`.
- **`scripts/images/restyle.py` `STYLE=semi2d`:**
  - multi-reference edits (layout + character sheets + locations + style reference);
  - lookdev, canvas pictures, mouth variants merged in the mouth region only;
  - a manifest;
  - a cost ledger at `logs/image_costs.jsonl` with a hard stop at `IMAGE_BUDGET_USD=50`.
- **Voices:** casting candidates are in `scripts/voice/fish_cast.py`; Fish tags are set per line; `closet` acoustics; `tighten.py` has a words-per-second pacing fallback.
- **Sound effects:** 50 files built from CC0 and CC-BY recordings (`verify_sfx.py`: 0 flagged). The 6 CC-BY recordings are listed in `public/audio/sfx/CREDITS.md`.
- **First-minute animatic:** `previews/frame240_animatic_first_minute_720p.mp4` (layouts, scratch Kokoro voices, real SFX, −15 LUFS). With scratch voices the whole cut runs 9:04; Drama 3 is expected nearer 10:00. Rendering takes about 1:45 per minute at 1080p on 4 cores.

## Done with the keys (stored in the git-ignored `.env`)

- **Look:** character sheets and locations approved; first minute approved.
- **Art:** all 157 art shots have final frames (130 generated frames, 11 canvas pictures, 11 mouth variants).
  - Every frame was reviewed against its layout and the sheets (`build/review/`).
  - 24 frames were regenerated once with sharper prompts. The originals are kept in `build/rejected/`, with the reasons in the commit history.
- **Spend:** images **$47.42 of $50**, including the sheets, locations, 3 thumbnails and the regenerations (`logs/image_costs.jsonl`). Fish Drama 3 voices: about $0.09.
- **Voices:** Mara is "Female Voice"; Hana is "Yorkshire Woman". Whisper QA: 0 of 192 flagged. The cut runs **10:40**.
- **Mix:**
  - Mastered to −15 LUFS, with a pre-limiter so the gain stays linear and a −1.5 dBTP safety limiter.
  - Hana sits under the narration.
  - The final 3 s white hold is silent.
- **Render check fixes:**
  - The white brush strokes and the lasso are now anchored to where the man stands in the generated canvas pictures (measured on a grid), not the layout positions.
  - The final limiter is lowered to −2.5 dBFS so the AAC upload copy stays under −1.5 dBTP.
  - Lip sync is checked on the rendered film with `scripts/lipsync_sheet.py`.
- **YouTube:** `youtube/` holds `DESCRIPTION.txt`, `TITLE_AND_TAGS.txt` and three thumbnails (`thumbnail_A_doorway.jpg`, `thumbnail_B_frame240.jpg`, `thumbnail_C_wall.jpg`).

## Resume (in order)

```bash
bash scripts/setup_env.sh --asr
```

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

```bash
node scripts/images/refs.mjs && node scripts/images/shotmap.mjs && node scripts/images/keyframes.mjs && node scripts/images/mouthkeys.mjs
```

Step 2 is a checkpoint: generate the character sheets and locations (7 images, about $1.75), then send them for approval.

```bash
.venv/bin/python scripts/images/restyle.py lookdev && .venv/bin/python scripts/images/restyle.py cost
```

Step 3 is the voices. Casting reels first (about $0.01), then the full Drama 3 pass (about 8,900 characters, about $0.09), then QA, tightening, retiming and word timing.

```bash
node scripts/export-voice-data.mjs && .venv-chatterbox/bin/python scripts/voice/fish_cast.py narrator hana
```

```bash
FISH_MODEL=drama-3 npm run generate-voices -- --provider fish --force
```

```bash
.venv-chatterbox/bin/python scripts/voice/qa_voices.py --provider fish --retake-failed --best-of 3
```

```bash
.venv/bin/python scripts/voice/tighten.py --ids "$(node -e "console.log(require('./build/voice-data.json').VOICE_LINES.map(l=>l.id).join(','))")"
```

```bash
node scripts/retime.mjs && .venv-chatterbox/bin/python scripts/voice/speech_timing.py
```

Steps 5 and 6 are the art.
- First minute: run `restyle.py plan`, `pictures`, `gen --only <first-minute ids>`, `MOUTH_VARIANTS=1 restyle.py mouths`, then `manifest`.
- Then the rest, the same way.
