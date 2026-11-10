# Mr. Widemouth - status: DONE

| Step | State |
|---|---|
| Script (own words) and plan | done (`SCRIPT.md`, `PLAN.md`) |
| Look-dev: 5 character sheets, 9 location plates | done |
| Voices: 113 lines, Fish Drama 3, best of 3, QA 0 flagged | done |
| Sound: 19 new sounds (16 from CC0 recordings) + an original synthesised music-box waltz | done |
| Art: 120 shots (77 frames generated incl. 2 redraws, 39 re-uses), 17 animation drawings, 6 lip-sync mouths | done |
| Full render | done: 10:22.7, 14,944 frames, 1080p24 |
| Upload copy `out/widemouth_1080p_upload.mp4` (not committed, 660 MB) | -15.0 LUFS, LRA 7.7 LU, true peak -2.4 dBFS; no silent second anywhere |
| Preview `previews/widemouth_full_720p.mp4` (42.0 MB) | -15.1 LUFS, peak -2.2 dBFS |
| Frame review | `previews/check_contact_01-07.jpg` (one frame every 4 s) |
| YouTube package | `youtube/` - title, alternatives, tags, pinned comment, description (4,373 chars, 9 chapters, credit to PerfectCircle35), 3 mystery thumbnails |

Image spend: $23.92 of the $30 cap (ledger `logs/image_costs.jsonl`).

Fixes made during review: the birthday cake's sixth candle painted out; the wave drawings re-merged for a dark frame;
the porch removed from the present-day trail shots (cropped, and one frame redrawn); the hiding-under-the-blanket shot redrawn.

Second review (user): the final scene (9:03 on) had no sound at all - a rule left over from Frame 240 muted any
scene called 'end'; now opt-in and off. Lip sync now per syllable (on twos) instead of 'open while loud'; two
creature mouths redrawn; blinks always close both eyes. New last beat: Mr. Widemouth whispers "Hello again, Eli."
over the shot under Leo's bed, his music box running down under the credit (verified by transcription).

Third review (user): his mouth opened only on one side / half -> opened in code along his whole lip line
(scripts/images/open_mouth.py; half and full drawings, per syllable); the credit card at the end replaced by
the end title MR. WIDEMOUTH (credit stays in the YouTube description); his cut-off-looking left ear in the
window shot redrawn and patched (scripts/images/fix_ear.py). Re-rendered: 10:22.7, 14,944 frames, -15.0 LUFS,
no silent second.
