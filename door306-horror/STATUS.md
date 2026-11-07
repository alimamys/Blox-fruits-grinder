# Never Open Your Door at 3:06 AM: production status

The plan is in [`PLAN.md`](PLAN.md) and the script, word for word, in [`SCRIPT.md`](SCRIPT.md).

## Decisions

- **Title:** "Never Open Your Door at 3:06 AM". YouTube alternatives: "My Rent Was Too Cheap… Now I Know Why" and "My Neighbors Chose Me".
- **Length:** the whole script is kept (no cuts); it runs about 13:15.
- **Look:** images come from ChatGPT's image model (gpt-image-2), in the same semi-realistic 2D style as Frame 240.
- **Motion:** made in code from those images (below). MiniMax video was tried, but the account had no credit, and the user chose to continue without it.
- **Violence:** implied, with no gore.
- **Scene 10:** wordless apart from the phone call. The notebook, the advert and the clock are drawn in code.
- **The landlord's text message:** shown on Sarah's phone, not read aloud.

## How the pictures move

- **Layouts:** every shot is drawn first as a layout on the real location reference (`src/layout/Plate.tsx`), with simple mannequins (`Person.tsx`) marking who stands where.
- **Final frames:** `scripts/images/restyle.py gen` generates each frame from the layout, the character sheets, the location reference and the style reference.
- **Animation drawings:** `restyle.py anim` makes extra drawings as edits of the finished frame and merges them back onto it, so the background never shifts. They are played in sequence (`art.seq`):
  - an eye snapping open or widening;
  - the sack sliding into view, then moving;
  - the creature's fingers curling round the railing;
  - the neighbours turning to face Sarah's door;
  - Mr. Harris's finger rising to his lips, and his tears;
  - the jaw dropping open.
- **Blinks:** an eyes-closed drawing is merged in the eye area only and blinked at natural, seeded intervals.
- **Doors:** a doors-open (or doors-closed) drawing is used. Each door is found as a whole rectangle and revealed from the latch edge, one door after another.
- **Peephole:** a fisheye lens and a round vignette are baked into the frame files.
- **Lip sync:** mouth-open variants (`restyle.py mouths`), timed to the measured voice envelope.
- **Camera and effects:** push, drift, flicker, shake, tremble, glitch and pulse. The camera is always clamped so the picture covers the whole frame, and there is a per-shot brightness setting (`grade`).

## Done

- **Cast and locations:** 7 character sheets and 8 locations ($3.67). The mother and boy were redesigned so they look nothing like Sarah, and drawn-in letterbox bars were cropped from 4 references.
- **Voices:**
  - 254 lines with Fish Drama 3. Whisper QA flags 0 of 252 (the 2 wordless screams are not checked).
  - Tightened without cuts: pauses inside lines capped at about 0.26 s, narration up to 1.3× with pitch kept, gaps between lines at 45%, dramatic holds up to 0.65 s.
  - New voice effects: through a door, through the door gap, and the creature.
- **Sound effects:** 42 new real-recording SFX (CC0/CC-BY, credits in `public/audio/sfx/CREDITS.md`) plus the 50 reused from Frame 240.
- **First minute:** approved by the user (`previews/door306_first_minute_720p.mp4`, −15.2 LUFS).
- **Scenes 2–10:** written. There are 282 shots: 69 new stills, 9 talking frames, 185 reuses and 19 code shots.
- **Art:**
  - 78 frames, 41 animation drawings and 9 lip-sync mouths, each reviewed against its layout and sheets.
  - 3 frames were regenerated once with sharper prompts (Sarah's dread close-up, the head rising, the creature's face); the originals are in `build/rejected/`.
- **Full film:** `out/door306_1080p_upload.mp4` (not committed, about 750 MB).
  - 1920×1080, 24 fps, 19,073 frames, 13:14.7.
  - −15.1 LUFS, LRA 5.4, true peak −1.9 dBTP; the final black hold is digital silence (−91 dB).
  - A gentle shadow-lifting curve was applied so the night shots read on a phone (dark shots go from about 17 to 24 average brightness).
- **Preview:** `previews/door306_full_720p.mp4` (49.5 MB).
- **Checks:**
  - contact sheets, one frame every 4 s: `previews/check_contact_*.jpg`;
  - lip-sync sheet: `previews/check_lipsync.jpg`. 7 of 8 talking shots open on the words and close in the pauses; the eighth is a scream drawn with the mouth open.
- **YouTube:** `youtube/` holds:
  - `TITLE_AND_TAGS.txt` (title, 2 alternatives, 15 tags);
  - `DESCRIPTION.txt` (spoiler-free hook, 10 chapters, the fiction disclaimer, 3 hashtags, 32 CC-BY credits);
  - three thumbnails composed from film frames, at no image cost: `thumbnail_A_they_chose_me.jpg`, `thumbnail_B_306am.jpg`, `thumbnail_C_dont_open.jpg`.

## Cost

- **Images:** $29.57 of the $40 cap, from 148 image requests (cost log at `logs/image_costs.jsonl`).
- **Voices:** about $0.14.
- **MiniMax:** $0.

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
