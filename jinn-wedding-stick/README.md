# The Jinn Wedding (عرس الجن) - stick-figure film

A 5:09 horror short in the code-drawn stick-figure style of the stick Mr. Widemouth, Goatman, 3:06, Frame 240 and
The Rake films. It retells the Kuwaiti urban legend of Noura the taqaqa, told as a legend (`SCRIPT.md`): the names,
place and year are the legend's own, the wording and the grandmother's frame story are ours.

A grown woman remembers a winter night in her grandmother's majlis: "Yadda, tell me a scary one. A true one." In
Sabahiya in 1997, Noura, the most famous wedding singer in Kuwait, is booked by "the mother of the bride" for five
hundred dinars. A silent driver takes her band past the last houses into the dark, to a house blazing with light that
nobody has ever seen. The guests clap like one person; when the lights flicker their eyes shine; under their long
dresses they have hooves. "Keep playing. Whatever you see, do not stop." At dawn they are paid and walk out - and a man
in the sand asks what they are doing at a house that has been empty for years. Behind them is a burned ruin, and all
around their footprints, hundreds of small hoofprints. Back in the majlis: "Nobody ever proved it happened. And nobody
ever proved it didn't." The old phone rings.

## How it is made

- **Voices:** Fish Audio (Drama 3) with generic Arabic / Khaleeji library voices (no cloned real people), cast in
  `src/data/voiceConfig.ts`, lines in `src/data/voiceLines.ts`, checked with Whisper
  (`scripts/voice/qa_voices.py --provider fish`). Timing comes from the real audio (`speechTiming.json`).
- **Backgrounds:** eight sets (the majlis, Noura's living room, a happy wedding, the street, the desert road, the
  mansion, the gold hall, the ruin at dawn) drawn as rough code layouts (`scripts/images/stick_sets.py`) and repainted
  by gpt-image-1-mini at medium quality (`scripts/images/stick_plates.py`, ledger `logs/image_costs.jsonl`).
- **Cast in code:** Yadda, the girl, Noura and her band, the mother of the bride, the veiled bride, the driver, the
  old man and the wedding guests (`src/components/characters/Cast.tsx`, on `StickPerson`, which now dresses people
  in a daraa / abaya / dishdasha (`robe`), a shayla / ghutra / veil (`headwear`), gold, hooves under a lifted hem,
  glowing eyes, a seated long dress, and the frame drum (tar), barrel drum (tabl), finjan, dallah and phone receiver).
- **Scenes:** `src/scenes/*.tsx`, one per chapter, built with the stick kit (`src/stick/kit.tsx`): a shot list per
  scene (`shot()` on a set, `ui()` for full-screen pages such as the title, the 1997 Kuwaiti newspaper front page and the sand at
  dawn), cut on the real voice lines. The band, the guests (dance / clap in unison / freeze, hooves, eyes only in the
  dark), the title and the newspaper page (Arabic, thuluth masthead, Hijri and Gregorian dates, halftone photo, GPL Arabic fonts in `public/fonts/arabic`) are in `src/scenes/common.tsx`; the car, smoke, rings, prints, horned shadows and
  haze in `src/stick/props.tsx`.
- **Sound:** the wedding drums (tabl, riq and a hall of clapping women at 100 BPM), the crowd, the hooves on marble,
  the braying, laughing and singing behind the walls and the coffee are built from CC0 / CC-BY recordings by
  `scripts/sfx/build_jinn_sfx.py`; the other sounds are the shared ones from the earlier films.
  `python3 scripts/sfx/jinn_credits.py` writes `public/audio/sfx/CREDITS.md`.
- **Frame QA:** every character registers its box; `node scripts/qa.mjs --every=2` reports heads cut off, bodies cut
  by the frame edges, people hidden behind each other or too small. Crowd extras may be cut by the frame sides.
- **Thumbnails:** compositions `ThumbA/B/C` (`src/dev/Thumbs.tsx`), rendered by `node scripts/thumbs.mjs`.

## Commands

```bash
npx remotion bundle src/index.ts --out-dir=build/bundle --log=warn   # bundle for the review / QA scripts
```

```bash
node scripts/sheet.mjs majlis,hall --every=30 && python3 scripts/tile.py majlis,hall   # review sheets
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
