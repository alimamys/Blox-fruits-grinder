# Oopsie Pets! — Development Log

Unity project: this folder (`OopsiePets/`). Game code and assets: `Assets/OopsiePets/`.
Raw generated art, prompts and art tools: `ArtSource/` (outside `Assets/`, not shipped).

## Environment (as of 2026-11-20)
- Unity 6000.6.10f1, URP 17.6 (2D renderer), Input System 1.20 only (`activeInputHandler = 1`).
- Packages added beyond the 2D URP template: `com.unity.pipeline` (agent control of the Editor).
- Modules installed: WebGL, Android (SDK/NDK/OpenJDK via Unity Hub modules).
- Local only: no Unity Cloud link, no player accounts, no analytics (children's privacy).

## Art pipeline
1. `ArtSource/jobs_batch*.json`: image-generation prompts (OpenAI Images API, `gpt-image-2` for
   opaque backgrounds, `gpt-image-1.5` for transparent sprites; style prefix in
   `ArtSource/asset_manifest.json`).
2. `ArtSource/tools/slice_sheets.py`: splits sheets into sprites (alpha islands, trimmed).
3. `ArtSource/tools/clean_faces.py`: inpaints the mouths the model drew on "blank" heads.
4. `ArtSource/tools/make_faces.py`: draws the shared eye/mouth overlay sprites.
5. `ArtSource/tools/rig_preview.py` + `ArtSource/rig_layout.json`: fits each pet's layered rig
   against its reference portrait (copied to `Assets/OopsiePets/Data/rig_layout.json`).
6. `ArtSource/tools/finalize_art.py`: resizes and copies into `Assets/OopsiePets/Art/`.

## Status
- [x] Phase 1 inspection, folders, style guide (`Assets/OopsiePets/Docs/StyleGuide.md`)
- [x] Phase 2 art: 30 generated images → 80 sprites (3 pets as layered rigs, backgrounds, props, UI, stickers)
- [x] Runtime scripts written (46 files, `Assets/OopsiePets/Scripts/`)
- [ ] Editor scene builder (`Assets/OopsiePets/Editor/OopsieBuilder.cs`) → scene, prefabs, data assets
- [ ] Compile clean, Play-mode verification of every activity
- [ ] Android build

## Running the Editor headless (cloud container notes)
- `Xvfb :99 -screen 0 1920x1200x24 &` then `DISPLAY=:99 unity open <project>`.
- Unity shows a "running as root" dialog in containers: click "Continue anyway"
  (`DISPLAY=:99 xdotool mousemove 280 98 click 1`).
- Package downloads need `cdn.packages.unity.com`; Android SDK needs `dl.google.com`.
