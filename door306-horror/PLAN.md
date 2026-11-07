# At 3:06 AM, Every Door Opened: production plan (step 1, waiting for approval)

The script is saved word for word in [`SCRIPT.md`](SCRIPT.md).

- **Project:** folder `door306-horror`, composition `Door306Horror`, 1920×1080 at 24 fps.
- **Base:** a copy of the Frame 240 pipeline. `frame240-horror` itself is never modified.

## Look

- **Style:** the same as Frame 240. Every image request gets the `animated2d.png` style reference and the same style text: "semi-realistic 2D animated series for adults - clean line art, cel-shaded characters with natural proportions and very expressive eyes, painted atmospheric backgrounds, cinematic moody lighting". Each scene adds its own colour mood:
  - **Hallway at 3:06:** sickly yellow-green fluorescent tubes, cold blue shadows, the stairwell black.
  - **Flicker:** the staircase lights strobe between that colour and darkness.
  - **Sarah's flat:** dark blue night, orange streetlight through the blinds, the peephole a small bright circle.
  - **Morning (scene 10):** warm, clean sunlight, which makes it worse.
  - **Landlord's office:** a warm desk lamp, deep brown shadows.
- **Shot pipeline:**
  - Every shot is drawn in code first as a layout. gpt-image-2 then redraws it as the final frame, using the character sheets, the location reference and the style reference.
  - Screens, phone messages, the notebook, the advert, the mailbox label and the clock stay code-drawn, so no text is ever garbled.

## Cast (character sheets made first)

| Character | Design | Voice (Fish Drama 3) |
|---|---|---|
| **Sarah** | Late 20s, shoulder-length auburn hair, pale, freckles; faded green long-sleeve pyjama top, grey sweatpants, barefoot | Young woman: quiet and frightened in narration, panicked in dialogue |
| **Mr. Harris** | About 75, thin, stooped, white stubble, brown cardigan over a vest, reading glasses on a cord | Soft, shaky elderly man, mostly whispering |
| **Mother and boy** | Woman in her 30s, dark hair tied back, nightgown; boy about 6 in dinosaur pyjamas | No lines |
| **Old man by the stairs** | About 85, bald, pyjamas, holding the wall | No lines |
| **Other neighbours** | 5 fixed residents in night clothes, drawn on one crowd sheet so the hallway always shows the same people | No lines |
| **Landlord** | About 55, friendly round face, grey sweater vest, rolled sleeves, wedding ring | Warm, friendly, slightly too smooth |
| **The creature** | Nearly 7 ft, grey skin stretched over bone, head bent at an impossible angle, fingers far too long, mouth hanging open too wide; drags a large stained sack | Deep male voice pitched down and distorted, on one line only |
| **Voices only** | The crying woman and the whispering man downstairs; the begging man on the 3rd floor; the young woman on the phone | Each a separate voice. Downstairs voices get "distant" processing, voices through the door get "muffled" processing. |

## Locations (reference images made first)

1. **The 4th-floor hallway:** old, narrow, worn green carpet, fluorescent tubes, numbered doors on both sides, the staircase with its metal railing at the far end.
2. **Sarah's flat:**
   - the front door with peephole and chain, sofa, dining table, the short corridor to the bedroom;
   - the bedroom.
3. **The stairwell and 3rd-floor landing:** concrete steps, metal railing, flickering light.
4. **The building outside:** an old four-storey brick block on a quiet street, at night and in the morning.
5. **The lobby mailboxes.**
6. **The landlord's office:** desk, old notebook, laptop.

The peephole view is the hallway art passed through a fisheye lens effect in code, with a dark round vignette, so every peephole shot matches.

## Motion (new)

1. **Code animation, in every shot, at no image cost:**
   - camera moves and handheld drift;
   - blinks: a closed-eyes variant merged only in the eye area, the same way the mouths work;
   - lip sync with mouth variants;
   - breathing and trembling of the character layer;
   - flickering lights;
   - parallax layers;
   - doors that really swing open: each door is cut from the art and turned in 3D, for the cold open and for the last shot, where dozens open at once;
   - shadows under doors, the peephole lens, and all screens and paper.
2. **Limited animation:** action shots get 3–6 drawings played "on threes", like TV animation, instead of 2–3 keyframes crossfaded. Examples: Mr. Harris raising a finger to his lips, the mother covering the boy's mouth, the neighbours turning to face her door.
3. **AI video clips, for about 30 key moments, which needs a video service:**
   - **The moments:** the fingers curling round the railing; the head rising into view; the creature climbing with the sack; the sack moving; the door pushed open against the furniture; the arm through the doorway; the ankle grab and the drag; the neighbours closing their doors one by one; the morning street.
   - **How:** each clip starts from our approved frame, and ends on one where the model supports it, so it keeps the same look. Each runs 4–8 s, about 3½ minutes in all. The clip's own audio is muted, and nobody talks in a clip, so lip sync stays ours.
   - **Service:** OpenAI no longer offers video on this key: it has no Sora models and `/v1/videos` returns 404 (checked 7 Nov 2026). From this environment only Google's Gemini API (Veo) is reachable; Runway, Kling, Luma, fal and Replicate are blocked by the network settings.
   - **Key needed:** `GEMINI_API_KEY`, added in the environment settings (never in chat). A new session picks it up.
   - **Checks before use:** list the models with the key (free), then make 3 test clips (about $3) to check the look, content filters and price.

## Length

- **As written:** about 1,530 spoken words. At Frame 240's pace that is about 12½–13 minutes, plus a silent scene 10.
- **For about 10 minutes:** let the pictures carry the purely descriptive lines, as with "the bulge is shown, not spoken" in Frame 240. The cut list is sent after voicing for approval, and nothing in the dialogue is cut.
- **Hook (first 10 s):** "I thought my neighbors were sleepwalking." over doors opening one after another, and the clock reaching 3:06.

## Content level

- **Taking people:** the abductions on the floors below are heard, not seen. We get sounds, shadows on the stairwell wall and the moving sack.
- **Sarah's drag:** shown, with no blood or gore.
- **The boy:** only ever held by his mother.
- **Why:** this keeps it YouTube-friendly and lowers the risk of content-filter refusals.

## Sound

- **Effects:** real CC0/CC-BY recordings, reusing Frame 240's verified library where it fits. New ones: many door latches and openings, heavy uneven footsteps on concrete, sack drag, scrapes, a key in a lock, the door chain, furniture scraping, a thud, fluorescent buzz and flicker, a clock tick, a heartbeat, held breath, and morning street ambience.
- **Mix:** ambience fades in and out; dialogue is ducked over music and ambience; mastered to −15 LUFS with true peak at or below −1.5 dBTP.
- **Subtitles:** burned-in, word-timed, with speaker tags.
- **Disclaimer:** the one-line fiction disclaimer.

## Steps and checkpoints (the same as Frame 240)

1. **This plan and cost estimate:** wait for OK.
2. **Character sheets and locations:**
   - include a side-by-side of high vs medium quality on 3 shots;
   - if a video key is present, make 3 test clips;
   - wait for OK.
3. **Voices:** Drama 3, Whisper QA with best-of-3 re-rolls, tighten, retime, word timing. Send the proposed cut list.
4. **Edit and layouts:** all shots in code.
5. **First minute in final art and motion:** send it, wait for OK.
6. **The rest of the film.**
7. **Review every frame and clip against its layout and the sheets:** regenerate once if needed, otherwise use the layout or simplify.
8. **Render and check:** contact sheets, the lip-sync sheet and loudness; send a 720p preview and keep a 1080p upload copy.
9. **YouTube package:** title, description with chapters, credits and hashtags, tags, and 3 thumbnails.
10. **Commit and push after every milestone:** to `claude/eager-volta-z6vpfo`, no pull request.

## Cost estimate

The image figures use the cautious rates in the cost log ($40 per million output tokens). Some sources list lower gpt-image-2 rates, so your OpenAI usage page may show less.

| Item | Amount | Estimate |
|---|---|---|
| Sheets and locations (high) | about 18 images | $4.50 |
| Frames (high for about 40 face close-ups, medium for the rest) | about 170 | $22 |
| Blink and mouth variants (medium) | about 40 | $3.60 |
| Limited-animation drawings (medium) | about 40 | $3.60 |
| Thumbnails | 3 | $0.75 |
| Regenerations (about 15%) | | $5 |
| **Images total** | | **about $40 (cap)** |
| AI video clips: about 200 s plus 30% retries at about $0.10–0.12 per second; price confirmed by the test first | about 30 clips | **about $30 (cap)** |
| Fish voices: about 11,000 characters including retakes | | about $0.20 |
| **Total** | | **about $70**, or about $40 without AI video |
