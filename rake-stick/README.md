# The Rake ("It Visits Three Times") — stick-figure film

A ~5-minute horror short in the code-drawn stick-figure style of the stick Mr. Widemouth, Goatman, 3:06 and Frame 240
films. The script (`SCRIPT.md`) is our own story built on the Rake, an internet legend created anonymously on 4chan.

Lily is nine when she wakes at 4:00 a.m. with something crouched halfway up her bed. Her grandmother's 1984 diary
says it visits three times, and the third time it says your name. Her dad, Danny, swaps beds with her. Twenty-five
years later her own son asks who the skinny man at the end of his bed is.

## How it is made

- **Voices:** Fish Audio (Drama 3), cast in `src/data/voiceConfig.ts`, lines in `src/data/voiceLines.ts`, checked
  with Whisper (`scripts/voice/qa_voices.py --provider fish`). Timing comes from the real audio (`speechTiming.json`).
- **Backgrounds:** eight sets drawn as rough code layouts (`scripts/images/stick_sets.py`) and repainted by
  gpt-image-1-mini at medium quality (`scripts/images/stick_plates.py`, ledger `logs/image_costs.jsonl`).
- **Cast in code:** Lily, Dad, Mom, Lily grown up and her son (`src/components/characters/Cast.tsx`, on
  `StickPerson`), and the Rake itself (`src/stick/rake.tsx`: crouched front / side / standing poses, a head that
  jerks like a puppet's, a mouth that opens with its one line).
- **Scenes:** `src/scenes/*.tsx`, one per chapter, built with the stick kit (`src/stick/kit.tsx`): a shot list per
  scene (`shot()` on a set, `ui()` for full-screen pages such as the diary), cut on the real voice lines. Beds,
  blankets, the diary, the clock and the torn blanket are in `src/stick/bed.tsx` and `src/stick/props.tsx`.
- **Frame QA:** every character registers its box; `node scripts/qa.mjs --every=2` reports heads cut off, bodies cut
  by the frame edges, people hidden behind each other or too small.
- **Thumbnails:** compositions `ThumbA/B/C` (`src/dev/Thumbs.tsx`), rendered by `node scripts/thumbs.mjs`.

## Commands

```bash
npx remotion bundle src/index.ts --out-dir=build/bundle --log=warn   # bundle for the review / QA scripts
```

```bash
node scripts/sheet.mjs firstNight,breakfast && python3 scripts/tile.py firstNight,breakfast   # review sheets
```

```bash
node scripts/qa.mjs --every=2      # frame QA over the whole film (uses build/bundle)
```

```bash
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/render.mjs --concurrency=4 && sh scripts/post_render.sh
```

The render needs `REMOTION_BROWSER_EXECUTABLE` on this machine: without it the Remotion CLI tries to download a
browser and fails. `node_modules`, `.venv`, `.venv-chatterbox` and `.voice-models` are symlinks to
`../frame240-horror`. API keys are read from the git-ignored `.env`.
