# Frame 240 — stick-figure version

The ~10:40 horror short "Frame 240" redrawn in the code-drawn stick-figure style of the stick Mr. Widemouth, Goatman
and 3:06 films. Voices, timing, sound design and subtitles are the same as `../frame240-horror` (which is not touched).

A freelance animator finds an extra frame in her animation, with a man standing in her hallway. Every time she presses
play, he is closer.

## How it is made

- **Backgrounds:** six sets drawn as rough code layouts (`scripts/images/stick_sets.py`) and repainted by
  gpt-image-1-mini at medium quality (`scripts/images/stick_plates.py`, $0.12 in all, ledger `logs/image_costs.jsonl`).
- **"Unfinished drawing" sets:** `scripts/images/white_plates.py` traces the ink lines of each plate onto flat paper,
  for free. The film fades a plate into its white version (`wash` on a shot) as the apartment turns white.
- **Cast in code:** Mara (`src/components/characters/Cast.tsx`, on `StickPerson`) and the tall man with the bent head
  (`TallMan` in `src/stick/f240.tsx`), plus the shapes that press out from under the white walls (`Emboss`).
- **Her animation:** the picture on her screen is the hallway plate itself, warmed to a dim bulb, with the man drawn in
  code at each distance (`src/layout/pictures.tsx`). The editor and phone screens are the original film's code UI.
- **Scenes:** `src/scenes/*.tsx`, one per chapter, built with the stick kit (`src/stick/kit.tsx`): a shot list per scene
  (`shot()` on the stage, `ui()` for a full-screen screen), cut on the real voice lines.
- **Frame QA:** every character registers its box; `node scripts/qa.mjs --every=2` reports heads cut off, bodies cut
  by the frame edges, people hidden behind each other or too small.

## Commands

```bash
node scripts/sheet.mjs coldOpen,normalNight && python3 scripts/tile.py coldOpen,normalNight   # review sheets
```

```bash
node scripts/qa.mjs --every=2      # frame QA over the whole film (uses build/bundle)
```

```bash
node scripts/render.mjs --concurrency=4 && sh scripts/post_render.sh   # render, master, preview, contact sheets
```

Remotion uses the pre-installed headless Chromium (`/opt/pw-browsers/...`). `node_modules`, `.venv` and
`.voice-models` are symlinks to `../frame240-horror`.
