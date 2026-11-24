# The Rake (stick-figure film): status

**Done.** The whole film is rendered, checked and packaged for YouTube.

## Decisions

- **Story:** our own script (`SCRIPT.md`) built on the Rake, an internet legend created anonymously on 4chan: the hook
  is a 4:00 a.m. visit, the rule from grandmother's 1984 diary ("the first time, it only watches..."), Dad taking his
  daughter's bed, and the twist 25 years later with her son.
- **Length:** 5:02, under the 7-minute limit.
- **Look:** the code-drawn stick style of the earlier stick films. The cast and the Rake are drawn in code; only the
  eight empty backgrounds are AI-painted.

## Numbers

- **Spend:** images $0.158 (8 plates, gpt-image-1-mini medium, `logs/image_costs.jsonl`), voices about $0.07 (Fish
  Audio Drama 3). About $0.23 in all, inside the $1.00 cap.
- **Upload file** (not committed): `out/rake_1080p_upload.mp4` (391 MiB): 1920x1080, 24 fps, 7,243 frames, 5:01.8.
- **Audio:** -15.0 LUFS integrated, LRA 5.7, peak -2.7 dBFS; the only silence over 2.5 s is the final 2.5 s of black.
- **Frame QA:** 0 findings on every 2nd frame of the whole film (`logs/qa.txt`). Earlier passes found 72 frames in 5
  shots (a limb at the frame edge, two clipped heads, a sliver of Dad's hand); those shots were reframed.
- **Preview:** `previews/rake_stick_720p.mp4` (17 MB). Contact sheets every 4 s: `previews/check_contact_*.jpg`.

## YouTube

`youtube/UPLOAD.txt` has the title (plus 2 alternatives), the description with chapters, the legend credit and the
CC-BY sound credits, tags, settings and a pinned comment. Thumbnails, drawn in code (`src/dev/Thumbs.tsx`):

- `thumbnail_A_its_on_my_bed.jpg`: IT'S ON MY BED. (first choice)
- `thumbnail_B_dont_wake_up.jpg`: DON'T WAKE UP. (Test & Compare)
- `thumbnail_C_4am.jpg`: 4:00 AM (spare)
