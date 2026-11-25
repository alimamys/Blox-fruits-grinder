# The Jinn Wedding (stick-figure film): status

**Done.** The whole film is rendered, checked and packaged for YouTube (`youtube/UPLOAD.txt`).

- **Story:** the legend's own names and beats (Noura the taqaqa and her band, Sabahiya, 1997, the call from the mother
  of the bride, 500 dinars, the silent driver, the unknown house, the guests' eyes and hooves, the sounds behind the
  walls, playing until dawn, the man in the sand, the ruin, the hoofprints, Noura never singing at a wedding again,
  the story printed without her name), framed by a girl and her yadda in the majlis. Told as an unproven legend; it
  makes no claim about any real person.
- **Length:** 5:09 (7427 frames at 24 fps), 44 voice lines, all passing Whisper QA.
- **Frame QA:** `node scripts/qa.mjs --every=2`: 0 findings over all frames.
- **Sound:** the first full render had only the voices: the audio manifest had been written before the sounds were
  in place, so every bed and effect was skipped as "missing". Fixed with `npm run retime`, and `npm run check` now
  warns about any sound that is on disk but not in the manifest. The mix was then set against the voices (the
  wedding drums about 5 dB under speech in the pauses and about 12 dB under it behind the narration, no chatter in
  the jinn's hall because "nobody spoke"), the sounds behind the walls land on Yadda's words, and the hooves are
  snapped to the drum loop's beat grid so they click in time with the drums.
- **Newspaper (after review):** the crime magazine became the front page of a 1990s Kuwaiti daily: an invented paper,
  "Sawt Al-Deera" (صوت الديرة), with a thuluth masthead, issue number, Saturday 6 Dhu al-Qadah 1417 / 15 March 1997,
  48 pages for 100 fils, the weather and contents "ears", a red kicker and a heavy headline ("A taqaqa and her band
  played a wedding until dawn... in an abandoned house!"), a halftone photo of the ruin and justified columns, with an
  English translation strip. Yadda's line now says "A newspaper printed the story" (re-voiced, Whisper QA passed).
- **Costs:** images $0.16 (8 plates) and Fish voices about $0.10 (generation and casting auditions) - about $0.26,
  within the $0.40 estimate.
