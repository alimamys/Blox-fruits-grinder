# Frame 240 (stick-figure version): status

**Done.** The whole film is rendered, checked and packaged for YouTube.

## Decisions

- **Same film, new picture:** every voice line, sound, pause and cut point comes from `../frame240-horror`, so the
  length (10:40) and the chapter times are identical. The original project is not modified.
- **Look:** the code-drawn stick style of the stick Mr. Widemouth, Goatman and 3:06. The cast is drawn in code; only the
  six empty backgrounds are AI-painted.
- **The man:** a very tall, thin black figure, arms hanging straight down, head bent hard to one side, no face. After
  he is painted out he is only ever a white shape pressing out from under white surfaces.
- **The white apartment:** the "unfinished drawing" versions of the sets are traced from the painted plates in code
  (free, and pixel-aligned with them), so the rooms can fade from colour into pencil lines.

## Numbers

- **Images:** $0.12 of the $1.50 cap (6 plates, gpt-image-1-mini, medium; `logs/image_costs.jsonl`). Voices: reused, $0.
- **Upload files** (not committed): `out/frame240_1080p_upload.mp4` (752 MB) and `out/frame240_1080p_send.mp4` (469 MB,
  two-pass 5.6 Mbit/s, the copy sent; looks the same at 1:1): 1920x1080, 24 fps, 15,367 frames, 10:40.3.
- **Audio:** -15.1 LUFS integrated, LRA 6.0, peak -1.6 dBFS; the final 3 s of white are digital silence.
- **Frame QA:** 0 findings on every 2nd frame of the whole film (`logs/qa.txt`). The first full pass had 109 findings in
  3 close-ups (Mara's head clipped by the frame edge); those shots were reframed.
- **Preview:** `previews/frame240_stick_720p.mp4` (37 MB). Contact sheets every 4 s: `previews/check_contact_*.jpg`.

## YouTube

`youtube/UPLOAD.txt` has the title (plus 2 alternatives), the description with chapters and the CC-BY sound credits,
tags, settings and a pinned comment. Thumbnails, drawn in code from real moments of the film:

- `thumbnail_A_hes_closer.jpg`: HE'S CLOSER. (first choice)
- `thumbnail_B_i_didnt_draw_him.jpg`: I DIDN'T DRAW HIM. (Test & Compare)
- `thumbnail_C_look_closer.jpg`: LOOK CLOSER. (spare)
