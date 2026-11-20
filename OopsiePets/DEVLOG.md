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
2. `tools/slice_sheets.py` → `tools/clean_faces.py` (removes model-drawn mouths) →
   `tools/make_faces.py` (eyes/mouths) → `tools/make_ui.py` (blank buttons, panels, sliders) →
   `tools/rig_preview.py` + `rig_layout.json` (rig fitting) → `tools/finalize_art.py` (resize/copy).

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

## Not verified / known gaps
- Sound was not heard (no audio device in the cloud container); playback calls run without errors.
- Real touch on a phone and a physical mouse were not tested (headless display).
- Performance on a real Android phone not measured (the container renders in software, ~10 fps).
- No AudioMixer (volumes go through a code gain layer); no sprite atlas yet.
- Decorations: save field exists, no decoration content or UI yet. iOS not configured.
- Animation is code-driven on layered sprites (no Animator controllers / 2D bones); limbs are part
  of the body sprite, so there is no separate wave-with-paw animation (dance/wiggle instead).

## Running the Editor headless (cloud container notes)
- `Xvfb :99 -screen 0 1920x1200x24 &` then `AgentScripts/start_editor.sh` (clicks Unity's
  "running as root" warning).
- Package downloads need `cdn.packages.unity.com`; Android SDK/NDK need `dl.google.com`.
- `AgentScripts/recompile.sh` recompiles and prints errors.
