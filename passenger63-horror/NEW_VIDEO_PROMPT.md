Make a new animated horror video for YouTube, in exactly the same style and quality as "The 63rd Passenger", from my script at the bottom of this message.

## Reference project
- Repo `alimamys/Blox-fruits-grinder`, folder `passenger63-horror/`. It lives on branch `claude/sleepy-wozniak-xsgz3e` until it is merged into the default branch, so fetch that branch if the folder is missing. It is a Remotion + React/TypeScript film with the whole pipeline:
  - Fish Audio voices
  - Whisper lip sync and word-timed subtitles
  - real sound effects and ambience
  - gpt-image-2 redraws of every shot
  - animated shots over redrawn background plates
  - segmented render with a loudness master
  - a YouTube package
- Read these first:
  - `passenger63-horror/README.md`
  - `src/data/voiceLines.ts`, `src/data/voiceConfig.ts`, `src/data/timeline.ts`, `src/data/edit.ts`
  - one scene, `src/scenes/Hook.tsx`
  - `src/components/characters/StickPerson.tsx`, `src/components/environments/Plates.tsx`, `src/components/fx/Restyled.tsx`
  - `scripts/images/restyle.py`, `scripts/voice/tighten.py`, `scripts/make_thumbnails.py`, `scripts/images/thumbnail_gen.py`
- Build the new film as a copy: a new folder named after the title, copied from `passenger63-horror` without `node_modules`, `out`, `build`, `public/audio`, `public/restyle` or `public/plates`.
  - Reuse the engine: characters, environments, fx and all scripts.
  - Replace the story parts: voice lines, cast, scenes, evidence screens, and environments where needed. Rename the composition.
  - Leave `passenger63-horror` untouched.

## Steps (send me progress at each checkpoint)
1. **Plan and cost estimate.**
   - Split my script into scenes and voice lines. The narrator never reads dialogue; every character speaks in their own voice.
   - Cast each character to a Fish Audio voice (`scripts/voice/fish_cast.py`). No celebrity or film-character voice clones.
   - List the shots per scene.
   - Estimate the cost:
     - Fish Drama 3: about $10 per million characters, so a 10-minute film is about $0.10.
     - gpt-image-2: about $0.20 per image. A 10-minute film needs about 150–180 images (about $30–36) plus about 10 background plates (about $2).
   - Show me the plan and the estimate, then **wait for my OK before spending anything.**
2. **Voices.**
   - Generate with `FISH_MODEL=drama-3`.
   - Run the Whisper QA (`scripts/voice/qa_voices.py`) and re-roll flagged lines best-of-3.
   - Run `scripts/voice/tighten.py` to keep the pacing tight, then retime.
   - Run `scripts/voice/speech_timing.py` for word timings.
3. **Edit.**
   - About 10 minutes (or my target below).
   - Quick and exciting the whole way: a cold-open hook in the first 10 seconds, no slow stretches, every scene ending on a reveal or a hit.
   - Cut boring lines with the short-edit mechanism in `src/data/edit.ts`.
4. **Picture.**
   - Build every shot in code first: stick figures, 3D-looking rooms, evidence screens.
   - Render the **first minute** and send it to me before going on.
5. **Redraws.** Run the image pipeline in this order:
   `shotmap.mjs` → `keyframes.mjs` → `mouthkeys.mjs` → `plates.mjs` → `restyle.py plan` → `gen` → `align` → `mouths` → `manifest`.
6. **Review every redraw** side by side with its source (`review.py pairs`, plus the plates). Fix or skip anything that breaks the rules below.
7. **Render** the full film (`scripts/render.mjs`, 4 cores, with the pre-installed headless Chromium under `/opt/pw-browsers`, because Remotion's own browser download is blocked).
   - Check every segment with contact sheets: each image matches its line, subtitles and lip sync are in sync, nobody floats above a seat.
   - Master to −15 LUFS.
   - Send me a 720p preview and make a 1080p upload copy.
8. **YouTube package:**
   - a title plus 2 alternatives;
   - a description with a spoiler-free hook, chapters taken from `npm run check`, the fiction disclaimer, 3 hashtags, and the full sound credits, including every CC-BY attribution;
   - tags;
   - **3 thumbnails built for curiosity**, at least one a new scene drawn by gpt-image-2 from the film's own frames. Each needs:
     - a frightened face;
     - one clear mystery (a red circle or arrow, a "WHO IS SHE?" style question);
     - at most 4 words, added as crisp text in code;
     - bright contrast that reads on a phone.
9. **Commit and push** to the session's branch after every milestone. No pull request unless I ask.

## Quality rules (from my feedback on the last film; treat them as hard requirements)
- **Style:** the same stick-figure look as The 63rd Passenger, at high quality. The redraws keep the characters, colours, composition and on-screen text of the code version, and every character looks the same from shot to shot.
- **Bodies:**
  - People sit **on** seats and benches, hips on the seat and hands in the lap; nobody stands through furniture.
  - A couple leans naturally, for example her head on his shoulder.
  - Walks have planted feet, with no sideways sliding and no stiff or awkward arms.
- **Real movement wherever the story has action** (walking up to someone, standing up, running, searching): animated characters over redrawn background plates, registered with `restyle.py align` so they sit and stand exactly on the furniture.
- **Lip sync and subtitles:** mouths move with every voice line, with burned-in, word-timed subtitles and speaker tags.
- **3D environments:** depth, shading and perspective, not flat colour blocks.
- **Sound:**
  - Every visible action has a real sound (knocks, doors, footsteps, impacts) from real recordings (CC0 or CC-BY).
  - Ambience beds fade in and out instead of starting and stopping abruptly.
  - Dialogue is ducked over music and ambience.
  - Nothing should sound synthetic.
- **Images must make sense:**
  - No invented people, reflections, ghosts, extra limbs or garbled text.
  - Nothing that contradicts the story, such as a character appearing in photos they shouldn't be in.
  - If a redraw adds or loses anything, that shot stays code-drawn (`FORCE_SKIP`, with the reason written in a comment).
  - These also stay code-drawn:
    - anything that must keep moving (running clocks, progress bars, a circle drawing on);
    - text-heavy screens;
    - near-black frames.
- A one-line fiction disclaimer at the start.

## Rules
- API keys: read `FISH_API_KEY` and `OPENAI_API_KEY` from the environment (I set them in the environment settings).
  - Never print or commit them, and never ask me to paste keys into chat.
  - If a key is missing or out of credit, tell me, and carry on with the parts that don't need it.
- Ask me before spending more than the estimate I approved.
- Before you say something is finished, show me evidence that it works: frames, numbers, audio checks.

## My video
Title (optional):
Target length (optional, default about 10 minutes):
Notes (optional):

SCRIPT:
<<< paste the full script here >>>
