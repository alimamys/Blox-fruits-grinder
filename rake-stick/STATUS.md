# The Rake (stick-figure film): status

**Done (version 2).** The whole film is rendered, checked and packaged for YouTube.

## Version 2 (after review)

- **Story:** the ending was rewritten so it makes sense and lands harder. The torn-out diary pages show that in 1984
  Grandpa lay down in Danny's bed and was taken ("it never takes the child, it takes whoever lies down in the child's
  place"); Dad knew and took Lily's place anyway. Lily and her mom move 800 miles away; 25 years later her son Sam is
  visited in their new house ("it was never the house - it was us"). On the third night Lily lies down in his bed;
  the Rake climbs up to her face and says "Lily". Her letter to Sam is the closing thought: it never wanted
  children, it waits to see who will lie down in their place - and maybe that is what keeps it alive.
- **Drawing fixes:** people in bed read as one body under the blanket: the head on the dented pillow (only the
  hair on the head - no ponytail or hanging hair beside it; grown-up Lily's long hair fanned out on the pillow), a
  sliver of neck going under the blanket, the blanket pulled up to the shoulders in the painted quilt's own colours
  with the sheet turned down and the body's shape (chest, knees, feet) and soft folds; closed eyes for sleepers.
  Her parents' bed was repainted with the quilt pulled up to the pillows (`master_night.jpg`; old one kept as
  `master_night_open.jpg`). The Rake has knuckled four-fingered hands with hooked claws on all four limbs and a
  crawl cycle. Pages (Grandma's diary, the torn-out pages, Lily's letter) are written one line at a time, in step
  with the voice.
- **Length:** 6:45 (two minor lines and some silent holds trimmed to stay under 7:00).

## Numbers

- **Spend:** images $0.26 (13 plates, gpt-image-1-mini medium, `logs/image_costs.jsonl`), voices about $0.10 (Fish
  Audio Drama 3, 77 lines incl. retakes). About $0.36 in all, inside the $1.00 cap.
- **Files** (not committed): `out/rake_1080p_send.mp4` (357 MB, sent) and `out/rake_1080p_upload.mp4` (499 MB):
  1920x1080, 24 fps, 9,718 frames, 6:44.9.
- **Audio:** -15.0 LUFS integrated, LRA 5.2, peak -2.6 dBFS; the only silence over 2 s is the final 2.5 s of black.
- **Frame QA:** 0 findings on every 2nd frame of the whole film (`logs/qa.txt`).
- **Preview:** `previews/rake_stick_720p.mp4` (23 MB). Contact sheets every 4 s: `previews/check_contact_*.jpg`.

## YouTube

`youtube/UPLOAD.txt`: title (plus 2 alternatives), description with chapters, the legend credit and the CC-BY sound
credits, tags, settings, pinned comment. Thumbnails drawn in code (`src/dev/Thumbs.tsx`):
`thumbnail_A_its_on_my_bed.jpg` (first choice), `thumbnail_C_i_took_his_place.jpg` (Test & Compare),
`thumbnail_B_dont_wake_up.jpg` (spare).
