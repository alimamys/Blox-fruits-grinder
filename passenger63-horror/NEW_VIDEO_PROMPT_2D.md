Make a new animated horror video for YouTube from my script at the bottom of this message. Use the same production pipeline as "The 63rd Passenger", but draw it in a **semi-realistic 2D animation style** instead of stick figures.

## Target look
- Match `passenger63-horror/style-samples/animated2d.png` exactly. Pass it as the style reference with every image request. The style text it was made with: *"semi-realistic 2D animated series for adults - clean line art, cel-shaded characters with natural proportions and very expressive eyes, painted atmospheric backgrounds, cinematic moody lighting"*, plus the colour mood of each scene.
- Horror comes from faces, so fear must read clearly on a phone screen: wide eyes, tense mouths, strong lighting on faces, deep shadows around them.

## Reference project
- Repo `alimamys/Blox-fruits-grinder`, folder `passenger63-horror/`. It lives on branch `claude/sleepy-wozniak-xsgz3e` until it is merged into the default branch, so fetch that branch if the folder is missing.
- Read these first:
  - `passenger63-horror/README.md`
  - `src/data/voiceLines.ts`, `src/data/voiceConfig.ts`, `src/data/timeline.ts`, `src/data/edit.ts`
  - one scene, `src/scenes/Hook.tsx`
  - `src/components/fx/Restyled.tsx`
  - `scripts/images/restyle.py`, `scripts/images/thumbnail_gen.py`, `scripts/images/style_samples.py`
  - `scripts/voice/tighten.py`, `scripts/make_thumbnails.py`
- Build the new film as a copy: a new folder named after the title, copied from `passenger63-horror` without `node_modules`, `out`, `build`, `public/audio`, `public/restyle`, `public/plates` or `style-samples`.
  - Reuse the engine: timeline, voices, sound effects, subtitles, the redraw layer and all scripts.
  - Replace the story parts. Rename the composition.
  - Leave `passenger63-horror` untouched.

## How the picture is made in this style
- **Layouts in code, final art from the image model.**
  - Build every shot in code first, as before. That code version is only a **layout guide**: who is where, poses, camera angle, props and on-screen text.
  - Then generate the final frame with the image-edit API (gpt-image-2, quality high). Pass:
    - the layout keyframe;
    - the character sheets of everyone in the shot;
    - the location reference;
    - `style-samples/animated2d.png`.
  - The prompt must say to take only composition, poses and positions from the layout. The drawing style comes from the style reference, and the characters must match their sheets exactly: face, hair, clothes, colours.
  - Extend `restyle.py` (a `STYLE=semi2d` mode) and its `openai_edit` so that multiple reference images can be passed.
- **Character sheets first.** For every recurring character:
  - Write a short visual spec: age, build, face, hair, clothes and colours, one distinctive item.
  - Generate a sheet in the style: front, three-quarter and side views, full body, plus expressions (neutral, uneasy, terrified, screaming or crying).
- **Location references.** Generate one establishing reference image for every recurring location.
- **Action shots:** 2–3 keyframes per shot (k0/k1/k2) that show the action progressing (reaching the bench, standing up, turning around), joined by short crossfades and camera moves.
  - If I have put a key for an image-to-video service in the environment, use it to animate the key action shots into short clips instead.
  - Don't use the stick-figure animation over plates in this style; it would clash.
- **Lip sync:**
  - For each talking shot, generate a second version of the same frame where only the speaker's mouth is open (`MOUTH_VARIANTS` in `restyle.py`). Swap between the two in time with the voice envelope; `Restyled.tsx` already supports this through `talk.src`.
  - Turn off the drawn ellipse mouth overlay for this style.
- **Motion comic polish:** a slow push and handheld drift on every still, plus flicker, shake, tremble and glitch effects on the right beats. Add parallax wherever a foreground layer is easy to separate.
- **Screens stay code-drawn:** documents, phones, manifests, CCTV overlays and maps keep their crisp code version. Pictures shown on those screens (photos, CCTV footage) are drawn in the style.

## Steps (send me progress at each checkpoint)
1. **Plan and cost estimate.**
   - Split my script into scenes and voice lines. The narrator never reads dialogue; every character speaks in their own voice.
   - Cast Fish Audio voices (`scripts/voice/fish_cast.py`). No celebrity or film-character voice clones.
   - List the shots, including which are action shots and which are talking shots.
   - Estimate the cost:
     - images: about $0.20 each, covering character sheets, locations, every shot, the mouth variants and about 10% retries. That is usually $45–55 for a 10-minute film;
     - Fish Drama 3: about $10 per million characters, so about $0.10.
   - **Wait for my OK before spending anything.**
2. **Character sheets and location references.** Send them to me, and **wait for my OK**. These fix the look for the whole film.
3. **Voices.**
   - Generate with `FISH_MODEL=drama-3`.
   - Run the Whisper QA (`scripts/voice/qa_voices.py`) and re-roll flagged lines best-of-3.
   - Run `scripts/voice/tighten.py`, then retime, then `scripts/voice/speech_timing.py`.
4. **Edit.**
   - About 10 minutes (or my target below).
   - Quick and exciting all the way: a cold-open hook in the first 10 seconds, no slow stretches, every scene ending on a reveal or a hit.
   - Cut boring lines with `src/data/edit.ts`.
5. **First minute.** Make the layouts and final art for the first minute only, render it, and **send it to me before doing the rest.**
6. **The rest of the film:**
   - shot map, then keyframes, then mouth keys;
   - generate the frames and mouth variants;
   - then the manifest.
7. **Review every frame** side by side with its layout, and against the character sheets. Regenerate or replace anything that breaks the rules below.
8. **Render** the full film (`scripts/render.mjs`, 4 cores, with the pre-installed headless Chromium under `/opt/pw-browsers`, because Remotion's own browser download is blocked).
   - Check every segment with contact sheets: images match their lines, mouths open on the right words, subtitles are in sync.
   - Master to −15 LUFS.
   - Send me a 720p preview and make a 1080p upload copy.
9. **YouTube package:**
   - a title plus 2 alternatives;
   - a description with a spoiler-free hook, chapters from `npm run check`, the fiction disclaimer, 3 hashtags, and the full sound credits, including every CC-BY attribution;
   - tags;
   - **3 thumbnails in the same 2D style**, drawn from the character sheets. Each needs:
     - a terrified face;
     - one clear mystery (a red circle or arrow, or a "WHO IS SHE?" style question);
     - at most 4 words, added as crisp text in code;
     - bright contrast that reads on a phone.
10. **Commit and push** to the session's branch after every milestone. No pull request unless I ask.

## Quality rules (treat them as hard requirements)
- **Consistency:**
  - Every character looks the same in every shot: face, hair, age, clothes, colours, and any badge or prop.
  - Each location keeps its layout and lighting.
  - Check this shot by shot against the sheets.
- **Bodies:**
  - People sit **on** seats and benches, never through them.
  - Couples lean naturally, for example her head on his shoulder.
  - Hands have five fingers, with no extra or missing limbs.
  - Poses are natural, never stiff.
- **Faces:** expressive and readable, with emotions that match the line and the moment. Mouths are open only while that character speaks.
- **3D-feeling environments:** depth, perspective and atmospheric light.
- **Sound:**
  - Every visible action has a real sound (knocks, doors, footsteps, impacts) from real recordings (CC0 or CC-BY).
  - Ambience beds fade in and out instead of starting and stopping abruptly.
  - Dialogue is ducked over music and ambience.
  - Nothing should sound synthetic.
- **Images must make sense:**
  - No invented people, reflections, ghosts, garbled text or wrong numbers.
  - Nothing that contradicts the story, such as a character appearing in photos they shouldn't be in.
  - If a frame adds or loses anything, regenerate it once with a sharper prompt. If it fails again, use the layout version or simplify the shot, and note the reason in a comment.
  - Anything that must keep moving (running clocks, progress bars, a circle drawing on) stays code-drawn.
- Burned-in, word-timed subtitles with speaker tags.
- A one-line fiction disclaimer at the start.

## Rules
- API keys: read `FISH_API_KEY` and `OPENAI_API_KEY` (and any video-service key I add) from the environment.
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
