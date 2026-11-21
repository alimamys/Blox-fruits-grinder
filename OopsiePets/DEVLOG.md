# Oopsie Pets! — Development Log

Unity project: this folder (`OopsiePets/`). Game code and assets: `Assets/OopsiePets/`.
**Start scene:** `Assets/OopsiePets/Scenes/OopsiePets_Main.unity` (build index 0).
Raw generated art, prompts and art tools: `ArtSource/` (outside `Assets/`, not shipped).

## Environment
- Unity 6000.6.10f1, URP 17.6 (2D renderer), Input System 1.20 only (`activeInputHandler = 1`).
- Packages added beyond the 2D URP template: `com.unity.pipeline` (agent control of the Editor),
  TextMesh Pro essentials (imported into `Assets/TextMesh Pro`).
- Modules installed: WebGL, Android (SDK/NDK/OpenJDK via Unity Hub modules).
- Local only: no Unity Cloud link, no accounts, crash reporting/analytics/performance reporting
  disabled in Player Settings (children's privacy).

## How the project is built (re-runnable)
Menu **Oopsie Pets** in the Editor (or `unity command script eval` with the same methods):
1. `Oopsie Pets/0. Configure Player Settings` — name, portrait, Android id `com.oopsiepets.game`,
   IL2CPP + ARM64, app icon, privacy settings.
2. `Oopsie Pets/1. Configure Sprites` — import settings for everything in `Art/` (pivots from
   `Data/rig_layout.json`, ASTC 6x6 on Android, readable mud textures, 9-slice panels).
3. `Oopsie Pets/2. Build Data And Prefabs` — `Data/` ScriptableObjects (pets, accessories,
   stickers, content packs, face set) and `Prefabs/` (pet rigs, bubble, accessory button).
4. `Oopsie Pets/3. Build Scene` — rewrites `Scenes/OopsiePets_Main.unity` and the build list.
Step 3 overwrites the scene: make scene edits in `Editor/OopsieScene.cs`, or stop using the builder.

## Friends to unlock (added 2026-11-21)
- Starters: puppy, kitten, bunny. Earned friends (free `FriendsPack`, earned by play, never bought),
  in order: Bao the panda, Rosie the piglet, Cotton the lamb, Sparkle the unicorn foal.
- **Gift box** (`Core/FriendGift`): a present in the clubhouse with three heart slots on its front.
  Every finished *full* care visit adds one heart (`FriendGiftRules.AwardHeart`, called by
  `CareSession`); the heart flies into the box when the child gets home. With three hearts the box
  wiggles and sparkles and a pointing hand invites a tap; tapping pops the lid, the next friend
  jumps out wearing the present it brought (bow tie, star clip, beanie, crown — these then appear
  in the dress-up tray), everyone cheers, and the room rearranges to give it a bed.
- No timers, nothing can be lost, no reading needed. A full box takes priority over the "Oopsie!"
  muddy visitor; a friend who has never been cared for comes back muddy like the starters do.
- **Clubhouse layout** (`Core/Clubhouse`): beds are created at runtime from hand-placed layouts for
  3 to 7 spots (pets + gift box), front row staggered between the back row; pets shrink a little
  as the room fills (scale 0.46 → 0.34).
- **Per-pet surprises** (`PetQuirk` flags on `PetDefinition`, replacing voice checks): kitten
  sneezes a giant bubble, bubbles land on the bunny's ears, the piglet gets one more mud splat
  mid-bath ("Oopsie!") and arrives extra muddy, the lamb has extra tufts and a fluffy "poof", the
  panda rolls head over heels on big pops (new `Roll` reaction), the unicorn sprinkles stars on
  every reaction and pop. New synthesized voices: oink, baa, panda squeak, unicorn trill.
- Album: 12 slots (3 per row, 2 rows per page); friends' stickers first, so friends not met yet
  show as soft faded shapes. Dress-up tray: one row for up to 6 items, two even rows above that.
- Grown-up settings (behind the parent gate): "Let all friends in now" unlocks everyone at once.
- Save format version 2 adds `giftHearts`; version-1 saves load unchanged (starters only, 0 hearts).

## Playing outside (added 2026-11-21)
- Problem fixed: once every pet had had its first bath, pets only came back muddy right after a
  visit and only half the time, and never while the child waited, so progress (hearts) could stall.
- Every full visit now starts in the **garden** (`Activities/Outdoor/OutdoorActivity`), where each pet
  plays with its own toy (`ToyKind` on `PetDefinition`) and gets muddy; then wash → bubbles → brush →
  dress-up → sticker + gift-box heart. A pet that is already muddy (an "Oopsie!" visitor) skips the
  garden (`CareSession.CleanUp`). The big button in the care menu shows the pet's own toy.
- Toys (`PlayToy` subclasses; taps are forgiving, almost anywhere on the lawn works):
  - Puppy `FrisbeeToy`: tap to throw, the puppy fetches (from the puddle) and brings it back. 3 rounds.
  - Kitten `YarnToy`: drag the yarn or tap to roll it; the kitten pounces each time. 4 rounds.
  - Bunny `CarrotToy`: tap a carrot; the bunny digs (dirt flies), pulls it out and munches it. 3.
  - Panda `SwingToy`: each tap pushes the swing higher; the 3rd push launches a roll into the puddle.
  - Piglet `DuckToy`: tap and the rubber duck squeaks; the piglet jumps into the big puddle. 3.
  - Lamb `TrampolineToy`: bigger bounces (a flip on the 2nd); the 3rd lands in the puddle.
  - Unicorn `HoopToy`: trots up and leaps through the rainbow hoop into the puddle. 3.
- The mud is made of real `MudSpot`s (`MudSpot.Splat`), so the bath that follows cleans exactly the
  splats the child saw (topped up to the usual amount). Leaving the garden after a splash brings the
  pet home muddy as the "Oopsie!" visitor. When the clubhouse is quiet for 9 s, the hand points at a
  pet, so there is always a next step.
- Art (batch 5, `jobs_batch5.json`): garden background, frisbee, yarn, rubber duck, carrot, carrot
  patch, mud puddle, trampoline, rainbow hoop, rope swing (split into stretchable ropes + seat).

## Clean pets, "wants to play" (added 2026-11-21)
- Pets never arrive muddy on their own any more (not on first launch, not after visits, not new
  friends): mud only comes from playing in the garden. The one exception is a pet whose play was cut
  short with the home button: it comes home muddy and asks for its bath.
- One pet at a time **wants to play** (`Core/WantsToPlay`): a thought bubble with its own toy floats
  above its head and it yawns every few seconds (new `Yawn` reaction and expression). Tapping it goes
  straight to the garden (full visit); other pets still open the care menu. A friend that just came
  out of the gift box wants to play first; otherwise the pet that has played least (not the one just
  cared for). The hand hint points at it 2.5 s after entering the clubhouse and when idle.
- Thought bubble drawn in code (`ArtSource/tools/make_thought_bubble.py`); the panda's icon is a
  drawn swing (branch, thick ropes, seat) because the swing seat alone did not read at that size.

## Fixes (2026-11-21, after feedback)
- **Yarn ball** (`YarnToy`): now rolls like a ball. Tap anywhere and it rolls to that spot; hold and it
  follows the finger; flick it and it keeps rolling, slowing down and bouncing off the lawn edges; it
  spins by the distance travelled. A loose string trails behind it (a small rope simulation drawn
  with two `LineRenderer`s, lavender over a plum edge, material `Data/StringUnlit.mat`).
- **Heart stuck on screen**: the heart flying into the gift box was a loose object; if the room
  changed during its 2-second flight (e.g. tapping the pet that wants to play), it stayed on top of
  every screen. It now belongs to the gift box and lands instantly when interrupted. Reproduced
  before the fix (1 stray heart), 0 after.
- **Hand pointed at pets instead of the full gift box**: the box only counted as "ready" after the
  last heart landed, so the pet hint started first and blocked the gift hint. A full box (by saved
  hearts) now always comes first: no pet shows "wants to play" until it is opened, and the hand
  points at the box (checked in captures).
- `AgentScripts/restart_editor.sh`: restarts the display and Editor after a container restart and
  dismisses Unity's scene-backup prompt.

## Longer bath time and grooming (added 2026-11-21)
A full visit is now: play outside → **shampoo** → wash (scrub, then **rinse**) → bubbles → **dry** →
brush fur → **brush teeth** → dress-up → sticker + heart. The menu's bath button runs shampoo → wash
→ dry (`CareSession.Bath`) and the brush button runs fur → teeth (`CareSession.Grooming`).
- `ShampooActivity`: tap the pet to squeeze 5 pink dollops on, then rub them in until each turns into
  white lather (`SoapSuds`); the lather stays on for the wash.
- `WashActivity`: more mud (4-5 on the head, 5-6 on the body) and slower scrubbing (0.3); the sponge
  squashes the lather down; then the shower comes out and the child sprays the suds away (the suds
  puff back up first so there is something to rinse).
- `DryActivity`: the pet stands dripping on a fluffy bath mat, fur slightly cooler in colour; rub
  with the towel until all 10 drops are gone; the colour comes back and it gives a fluffy shake.
- `BrushActivity`: more tangles (4-5 head, 4-6 body) and slower brushing (0.24).
- `TeethActivity`: the pet is shown big and opens wide (drawn mouth with 9 teeth); 6 random teeth
  have sugar specks; brush each until it sparkles, then tap the rinse cup for a gargle and a shiny smile.
- Art: `jobs_batch6.json` (shampoo bottle, shower head, towel, toothbrush, rinse cup, bath mat) and
  `tools/make_bath_bits.py` (open mouth with teeth, water drop, sugar specks).
- Verified in Play mode: a full puppy visit through every step (0 errors), the piglet's bath routine
  from the menu, captures of each step; web build in Chromium: garden → shampoo dollops land.

## Architecture (Assets/OopsiePets/Scripts)
- `Core/GameFlow` — one scene, three screens (clubhouse, care, album) with fades; loads the save.
- `Core/InputRouter` — full-screen UI catcher behind the buttons; forgiving taps (nearest
  `ITappable` within a finger radius) and drag events for tools. Works for mouse and touch.
- `Characters/` — `PetDefinition` (data: voice, personality, idle motion, accessory reactions),
  `PetRig` (layered parts + anchors), `PetAnimator` (code-driven idle, blink, tail/ears and 12
  reactions), `PetView` (tappable pet), `FaceSet` (shared eyes/mouths).
- `Activities/` — `Activity` base, `WashActivity` (+`MudSpot` pixel-wipe), `BubbleActivity`
  (+`Bubble`), `BrushActivity` (+`FurTuft`), `DressUpActivity`, `CareSession` (sequencing, next
  button, sticker reward). Pet-specific surprises: kitten sneezes a giant bubble, bubbles land on
  the bunny's ears, wash sneeze, muddy "Oopsie!" arrivals.
- `SaveSystem/` — JSON at `persistentDataPath/oopsiepets_save.json`, temp-file write + `.bak`
  backup, corrupt/missing files fall back to backup, then defaults.
- `Progression/` — stickers, accessories, `ContentPack` + `Entitlements` (free packs only; empty
  locked placeholders for Fantasy Pets, Farm Friends, Decorations; no purchase code).
- `Audio/` — `AudioManager` + `Synth`: every sound synthesized at startup (original); assign
  recorded clips on the AudioManager to replace any of them.
- `UI/` — care menu, progress stars, finger hint, candy buttons, reward, album, parent gate,
  settings, safe area.

## Art pipeline (ArtSource/)
1. `jobs_batch*.json`: image prompts (OpenAI Images API: `gpt-image-2` for opaque backgrounds,
   `gpt-image-1.5` for transparent sprites, edits with the pet reference for consistency).
   Style prefix + every prompt recorded in `asset_manifest.json`. Runner: `tools/gen_images.py`
   (needs an OpenAI API key; in cloud sessions it is injected by the network proxy).
2. `tools/slice_sheets.py` (optional name filters, so earlier hand-cleaned sprites are not redone) →
   `tools/clean_faces.py` (removes model-drawn mouths) → `tools/make_faces.py` (eyes/mouths) →
   `tools/make_ui.py` (blank buttons, panels, sliders) → `tools/rig_preview.py` + `rig_layout.json`
   (rig fitting) → `tools/finalize_art.py` (resize/copy; `--no-backgrounds` for partial runs) →
   `tools/pad_to_4.py` (pads to multiples of 4 px for GPU compression and rescales rig pivots;
   run it last, once per new sprite) → `tools/make_assets_md.py` (regenerates `ASSETS.md`).
3. Batch 4 (friends): `jobs_batch4a.json` (references, gift box, accessories), `jobs_batch4b.json`
   (parts sheets, stickers), `jobs_batch4c.json` (unicorn head redo). 42 generated images in total.

## Verified (Play mode in the Editor, 2026-11-20)
Driven by `AgentScripts/PlayTest.cs` (pointer events into InputRouter, UI clicks via EventSystem)
and `AgentScripts/MouseTest.cs` (Input System mouse events through the UI input module):
- Clubhouse: 3 pets idle on beds; muddy visitor arrives; tap opens care menu (or bath for visitor).
- Puppy, kitten and bunny: wash (pixel mud removal, 3 stars, completion + next), bubbles (10 pops,
  giant bubble / ear bubbles), brush (tufts settle), dress-up (accessories attach per pet), Done →
  sticker reward → home with outfit kept.
- Single-activity revisit from the care menu (bubbles only → home, no sticker).
- Album shows collected vs. not-yet-found stickers; back button.
- Parent gate (number words) → settings; music volume change saved.
- Persistence across Play sessions (stickers + outfits reload).
- Save corruption: corrupt main → backup used; both corrupt → defaults, no crash.
- Zero console errors in Play mode (the 2 FMOD errors are the container having no audio device).

Web build (WebGL, `Oopsie Pets/Build/Web (WebGL)`, 24 MB, gzip with decompression fallback; now Brotli, see below)
tested in headless Chromium with real browser mouse events: loads in ~2 s, clicking the muddy
puppy opens the wash, dragging the sponge cleans all mud (3 stars, next button), no page errors.

Android APK (`Builds/Android/OopsiePets.apk`, 38 MB) built and inspected with aapt/apksigner:
`com.oopsiepets.game` 0.1.0 (1), min SDK 26, target SDK 36, arm64-v8a, debug-signed.

## Verified (2026-11-21, friends update)
Play mode in the Editor (`AgentScripts/pt.sh` + `PlayTest.cs`, captures with `AgentScripts/cap.sh`):
- Old version-1 save loads: 3 starters, 0 hearts, gift box shown; fresh save: same, puppy arrives muddy.
- Full care visit → heart flies into the box; third heart → box wiggles, hand hint appears.
- Tapping the full box → lid off, panda jumps out wearing its bow tie, room rearranges (4 → 5 spots),
  new empty box; unlock survives a Play-mode restart.
- Panda full visit (wash, bubbles, brush, dress-up with two-row tray, panda sticker reward).
- Piglet wash: extra splat appears at ~55% (8 → 9 spots), stars do not drop, wash completes.
- Lamb full visit: 8 tufts (2 extra), all brushed, completes. Unicorn full visit completes.
- Panda `Roll`: sampled rotation 350° → 171° → 0° (one full flip around its middle).
- All 10 accessories checked on all 7 pets (captures); layouts for 4, 5, 6 and 7 spots checked.
- Album (12 slots, friends first) and grown-up settings ("Let all friends in now") checked.
- Console: 0 errors after fixing the dress-up "Stars inactive" coroutine error (12 per visit before).
Web build: 9.5 MB data + 7.5 MB code (Brotli), loads in 2.5 s in headless Chromium; real mouse
clicks open the bath from the muddy puppy and scrubbing cleans it (3 stars); no page errors.
Android APK: 37.7 MB, `com.oopsiepets.game` 0.1.0 (1), target SDK 36, arm64-v8a, debug-signed.

## Verified (2026-11-21, garden update)
Play mode (`pt.sh PlayOutside` taps where the hint points; the yarn gets rolled around):
- All 7 toys played to the end from a clean pet: frisbee 9 splats, yarn 5, carrots 6, swing 5,
  duck 6, trampoline 5, hoop 6; the pet hops to the middle of the lawn for its "Oopsie!".
- Garden → wash: the 6 garden splats were kept and topped up to 8; the wash completed.
- With 6 pets and the unicorn still in the box: a full visit starting outdoors gave heart 1, a muddy
  visitor's visit gave heart 2 (progress no longer depends on random muddy visitors).
- Home pressed mid-play after a splash: the piglet came home as the muddy visitor.
- Quiet clubhouse: the hand hint appeared after ~10 s. Care menu shows each pet's toy icon.
- Console: 0 errors.
Web build (10.4 MB data, Brotli) in headless Chromium with real clicks: kitten's menu shows the yarn,
the garden opens, five taps play it through (muddy, 3 stars, next button); no page errors.

## Verified (2026-11-21, wants-to-play update)
- Fresh save: 3 clean pets, no visitor, one pet with the bubble (bunny), hand hint after 2.5 s.
- Tapping that pet opens the garden directly; after the full visit: no muddy visitor (checked 9 s
  later), the bubble moved to another pet (puppy), heart earned.
- Gift box opened → panda joins, wants to play (swing bubble, hand hint); every other pet clean.
- Bubble placement checked with 4, 5 and 7 pets; yawn captured (eyes shut, mouth open). 0 errors.
- Web build in headless Chromium: the page finds the pet with the bubble from the screenshot, one
  click opens that pet's garden; no page errors.

## Not verified / known gaps
- The APK has not been installed on a phone. Unity adds the INTERNET permission automatically;
  the game never uses the network, so consider removing it (manifest override) before a
  Google Play Families submission.
- Sound was not heard (no audio device in the cloud container); playback calls run without errors.
- Real touch on a phone and a physical mouse were not tested (headless display).
- Performance on a real Android phone not measured (the container renders in software, ~10 fps).
- No AudioMixer (volumes go through a code gain layer); no sprite atlas yet.
- Decorations: save field exists, no decoration content or UI yet. iOS not configured.
- Friends update: the star sprinkle on the unicorn's bubble pops and the lamb's "poof" are too short
  to catch in a still capture; their code ran without errors but was not seen on screen. The new
  voices (oink, baa, squeak, trill) were not heard (no audio device).
- Garden update: new sounds (boing, squeak) not heard; toy feel (throw distance, swing timing) only
  tested with scripted taps and mouse clicks, not by children or on a phone.
- Animation is code-driven on layered sprites (no Animator controllers / 2D bones); limbs are part
  of the body sprite, so there is no separate wave-with-paw animation (dance/wiggle instead).

## Android
- Build profile: `Assets/Settings/Build Profiles/Android.asset`. Command line (project closed):
  `unity build --profile "Assets/Settings/Build Profiles/Android.asset" -o Builds/Android/OopsiePets.apk`
- Settings: IL2CPP, ARM64, min SDK 26 / target SDK 36 (Unity defaults), portrait only,
  id `com.oopsiepets.game`, version 0.1.0 (1). The APK is signed with the debug key (test only).
- Before publishing: change the package id, create an upload keystore (Project Settings > Player >
  Publishing Settings), build an AAB, and complete Google Play Families / Data safety forms
  (the game collects no data and has no ads, accounts or network use).
- Cloud container only: Gradle needs the session proxy, set in `~/.gradle/gradle.properties`
  (systemProp.https.proxyHost/Port + trustStore). Not needed on a normal computer.

## Running the Editor headless (cloud container notes)
- `Xvfb :99 -screen 0 1920x1200x24 &` then `AgentScripts/start_editor.sh` (clicks Unity's
  "running as root" warning).
- Package downloads need `cdn.packages.unity.com`; Android SDK/NDK need `dl.google.com`.
- `AgentScripts/recompile.sh` recompiles and prints errors.
