# The Jinn Wedding (stick-figure film): status

**Done.** The whole film is rendered, checked and packaged for YouTube (`youtube/UPLOAD.txt`).

- **Story:** the legend's own names and beats (Noura the taqaqa and her band, Sabahiya, 1997, the call from the mother
  of the bride, 500 dinars, the silent driver, the unknown house, the guests' eyes and hooves, the sounds behind the
  walls, playing until dawn, the man in the sand, the ruin, the hoofprints, Noura never singing at a wedding again,
  the crime magazine without her name), framed by a girl and her yadda in the majlis. Told as an unproven legend; it
  makes no claim about any real person.
- **Length:** 5:09 (7427 frames at 24 fps), 44 voice lines, all passing Whisper QA.
- **Frame QA:** `node scripts/qa.mjs --every=2`: 0 findings over all frames.
- **Sound:** the first full render had only the voices: the audio manifest had been written before the sounds were
  in place, so every bed and effect was skipped as "missing". Fixed with `npm run retime`, and `npm run check` now
  warns about any sound that is on disk but not in the manifest. The mix was then set against the voices (the
  wedding drums about 5 dB under speech in the pauses and about 12 dB under it behind the narration, no chatter in
  the jinn's hall because "nobody spoke"), the sounds behind the walls land on Yadda's words, and the hooves are
  snapped to the drum loop's beat grid so they click in time with the drums.
- **Costs:** images $0.16 (8 plates) and Fish voices about $0.10 (generation and casting auditions) - about $0.26,
  within the $0.40 estimate.
