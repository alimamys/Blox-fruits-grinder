# The 63rd Passenger

A complete stick‑figure maritime horror documentary built with **Remotion + React + TypeScript**.
It mixes deliberately crude MS‑Paint‑style animation with realistic‑looking (fictional) evidence inserts and a full voice cast.

- **Composition:** `Passenger63Horror`, 1920×1080, 16:9, 30 fps (plus `Passenger63HorrorTight`, a shorter alternative edit)
- **Story:** every beat from the disclaimer to the final *"Sixty‑four."* and the cut to black
- **Voices:** 331 performed lines (narrator, Daniel, Emma, the old woman, captain, two crew, harbor control, PA, police, 15 passenger fragments), generated locally and already included
- **Sound:** 60+ procedurally synthesised effects and ambience beds, including the three hull THUDs, the knocking, scratching, PA static, marine‑radio squelch, phones and alarms
- **Timing:** every cut, reveal and sound cue is computed from the **real WAV durations**

> Everything in this video is fictional. All organisations (North Star Ferries, Port Mason Harbor Control, Port Mason Police Service, Corvan Coast Civil Registry) are invented.

---

## Install

```bash
npm install
```

## Preview

```bash
npm run start
```

This opens Remotion Studio. Pick **Passenger63Horror**. The *Props* panel has switches for evidence inserts, CCTV chrome, grain, audio and the edit (see [Switches](#switches)).

## Render

```bash
npx remotion render Passenger63Horror out/passenger63.mp4
```

Or render and master the loudness to about −15 LUFS integrated / −1.5 dBTP:

```bash
npm run render
```

That writes `out/passenger63.mp4`. Use `npm run render -- --tight` for the shorter edit, and `npm run audio-preview` for a mastered WAV of the soundtrack alone.

Offline machines: rendering needs no internet. All fonts, textures, voices and SFX are local. If Remotion cannot download its headless Chrome, point it at any local Chrome or Chromium:

```bash
REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell npm run render
```

You can also pass `--browser-executable=...` to `npx remotion render`, or uncomment `Config.setBrowserExecutable` in `remotion.config.ts`.

### npm scripts

| script | what it does |
| --- | --- |
| `npm run start` | Remotion Studio preview |
| `npm run render` | render + loudness‑master → `out/passenger63.mp4` (`-- --tight` for the short edit) |
| `npm run audio-preview` | mastered soundtrack only → `out/passenger63_audio_preview.wav` |
| `npm run generate-voices` | (re)generate voice lines, then retime |
| `npm run retime` | re‑measure every WAV and update the timeline |
| `npm run build-sfx` | re‑synthesise all sound effects |
| `npm run check` | scene‑by‑scene timing report + asset sanity checks |
| `npm run typecheck` | TypeScript check |

---

## Runtime

| edit | length | composition |
| --- | --- | --- |
| Full story, exactly as written | **16:15** | `Passenger63Horror` |
| Tight edit | **14:39** | `Passenger63HorrorTight` |

The brief targets 7–9 minutes, but the story itself is about 1,800 words. At the requested 130–155 words per minute, that is 12–14 minutes of speech before any pauses or suspense holds. The narrator here averages 148 wpm while speaking.

The default is therefore the **complete, unabridged story**, voiced at natural pace. The tight edit drops 31 narration lines whose information the picture already carries (listed in `src/data/edit.ts`). No dialogue, reveal or story beat is removed.

To get closer to 9 minutes you would need to abridge the script. To do that, add more line ids to `TRIM_IN_TIGHT_EDIT`, or remove steps from scenes in `src/data/timeline.ts`. Everything retimes automatically.

---

## How it fits together

```
src/
  Root.tsx                    compositions (durations come from the timeline)
  Passenger63Horror.tsx       places every scene + the audio layer
  data/
    timeline.ts               THE single source of timing: scenes, steps, beats, SFX cues, ambience automation
    voiceLines.ts             every line: id, character, text, emotion, intensity, pace, volume,
                              pauseBefore/After, audioEffect, pan, breath, fear level, direction, filename
    voiceConfig.ts            casting: one voice per character for every provider
    edit.ts                   full / tight edit
    settings.tsx              render switches (evidence, CCTV chrome, grain, audio)
    generated/audioManifest.json   real WAV durations (written by `npm run retime`)
  scenes/                     one module per sequence (Hook, Departure, Recognition, Erasure, Hull,
                              Navigation, OtherFerry, GrandmotherCalls + PeopleInWater, Vanish, Police,
                              Cctv, Finale/End)
  components/
    characters/               <StickPerson/>, <Daniel/>, <Emma/>, <OldWoman/>, <Captain/>, crew, police
    environments/             <OceanNight/>, <FerryExterior/>, <Harbor/>, <Underwater/>, <PassengerCabin/>,
                              <CabinRow/>, <RearDeck/>, <Bridge/>, <FerryCorridor/>, <FerryWindow/>,
                              <EngineRoomDoor/>, <CeilingSpeaker/>, <CrowdHead/>
    evidence/                 <PassengerManifest/>, <PhoneScreen/>, <MarineRadio/>, <RadarScreen/>,
                              <NavScreen/>, <Compass/>, <HarborControl/>, <CCTVOverlay/>, <PoliceCaseFile/>,
                              <DatabaseSearch/>, <CivilRecord/>, <DriverLicense/>, <PhotoEvidence/>,
                              <HarborPhoto/>, <DaylightPhoto/>, <WeddingRing/>
    fx/                       <PassengerCounter/>, <PAOverlay/>, <EmergencyLights/>, grain, glitch, labels
  audio/AudioLayer.tsx        voices, SFX and ambience beds (ducked under speech)
  utils/                      wobbly "MS Paint" line generator, camera, shot system, fonts
public/
  audio/<character>/*.wav     voice lines (narrator/, daniel/, emma/, old-woman/, captain/, crew/,
                              harbor/, pa/, police/, crowd/)
  audio/sfx/*.wav             sound effects + ambience beds
  fonts/, textures/           bundled fonts (SIL OFL) and noise textures
scripts/
  voice/                      Python voice pipeline (providers, SSML, post-processing DSP)
  sfx/build_sfx.py            procedural sound design
  retime.mjs, check.mjs, render.mjs, stills.mjs, generate-voices.mjs, export-voice-data.mjs
voice-scripts/                generated performance script, SSML (Azure / Polly) and acting instructions
```

### How scene duration is configured

There are **no hard‑coded scene durations**. Each scene in `src/data/timeline.ts` is an ordered list of *steps*:

```ts
steps: [
  'narrator_103_hit',              // a voice line: its real WAV length + its pauses
  b('thud_1', 1.3, 'THUD 1'),      // a silent beat that holds the picture for 1.3 s
  'narrator_104_stopped',
  ...
]
```

A line's start time is the previous step's end, plus that line's `pauseBefore`. The step after it begins once the line's real duration and its `pauseAfter` have passed. A scene ends after its last step plus `tail`. The timeline exposes each scene's name, `start`, `duration`, `narrationText`, `dialogueIds` and computed markers.

Visuals cut on those markers. In `src/scenes/*.tsx`, each shot says which marker it lands on:

```tsx
{at: 'oldwoman_003_passenger37', off: -0.1, render: ({f, d}) => ...}
{at: 'narrator_022_alive', frac: 0.62, render: ...}   // 62 % through the line
```

Sound effects and ambience automation use the same markers, for example `{sound: 'impact_hull', at: 'thud_1'}`. If a voice file changes length, everything after it moves with it.

### How to alter timing

- **A pause:** edit `pauseBefore` / `pauseAfter` of the line in `src/data/voiceLines.ts`.
- **A suspense hold:** edit the beat's `hold` in `src/data/timeline.ts`.
- **A sound cue:** change its `at` marker or `offset` (seconds) in the scene's `sfx` list.
- **Ambience:** each scene has starting bed levels (`beds`) plus `bedAutomation` points, such as the instant cut at the blackout or near‑silence for the people in the water.
- Run `npm run check` to see the new scene start times and total length.

---

## Voices

### Which TTS provider is configured

The default provider is **Kokoro v1.0**, a local, offline neural TTS model (Apache‑2.0), run through `kokoro-onnx`. No API key is needed. All 331 lines in `public/audio` were generated with it.

The cast is defined once, in `src/data/voiceConfig.ts`:

| character | Kokoro voice (blend) | post |
| --- | --- | --- |
| Narrator | am_michael 80% + bm_george 20% (neutral international male) | −0.4 st, close‑mic EQ |
| Daniel | am_puck | small cabin room |
| Emma | af_heart | small cabin room |
| **Old woman** | bf_emma 60% + af_nicole 40% (soft, breathy, British) | −1 st, very subtle drifting age tremor, slower |
| Captain | bm_george | −0.6 st |
| Crew 1 / crew 2 | am_fenrir / af_sarah | room |
| Harbor control | am_onyx + am_eric | VHF radio chain |
| PA | bf_isabella, **morphing** toward the old woman across lines (35% → 75% → 95%) | PA chain fading from full to almost dry |
| Police | bm_fable | room |
| Passengers | 12 different voices, round‑robin | room, low‑passed, panned |

The same file holds voice ids for **ElevenLabs, OpenAI (gpt‑4o‑mini‑tts), Azure Speech and Amazon Polly**. Switch every character to a better or more expressive provider without touching the timeline.

### Where API credentials go

Create a `.env` file in this folder (it is git‑ignored), or export the variables in your shell:

```
ELEVENLABS_API_KEY=...
OPENAI_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=westeurope
AWS_ACCESS_KEY_ID=... / AWS_SECRET_ACCESS_KEY=... / AWS_REGION=...   (Polly, needs `pip install boto3`)
```

For ElevenLabs, also replace the `REPLACE_WITH_..._VOICE_ID` placeholders in `voiceConfig.ts` with your chosen voice ids. With `eleven_v3`, emotion tags such as `[whispers]` and `[crying]` are added automatically.

Missing credentials never break the project. The generator writes the scripts and SSML, prints what is missing, and the video keeps rendering with whatever audio exists.

### How to generate all voices

One‑time setup for the local generator (Python 3.10+):

```bash
python3 -m venv .venv
```

```bash
.venv/bin/pip install -r scripts/voice/requirements.txt
```

```bash
.venv/bin/python scripts/voice/download_models.py
```

The last command downloads about 350 MB into `.voice-models/`. Then generate:

```bash
npm run generate-voices
```

For another provider:

```bash
npm run generate-voices -- --provider openai
```

`generate-voices` exports the TS data, synthesises every changed line, post‑processes it, and **retimes the project**. Only lines whose text, casting or settings changed are regenerated; `public/audio/.voice-cache.json` tracks this. Add `--force` to redo everything.

### How to regenerate one character only

```bash
npm run generate-voices -- --character oldWoman
```

```bash
npm run generate-voices -- --only narrator_009_someone,oldwoman_final_64
```

### Where voice files are stored

`public/audio/<folder>/<line id>.wav` holds 24 kHz, 16‑bit, loudness‑normalised files, mono except the deliberately panned lines. The names are descriptive: `narrator_001_hook.wav`, `crew_001_ticket.wav`, `oldwoman_002_waiting.wav`, `harbor_004_docked.wav`, `pa_001_passenger37.wav`, `oldwoman_final_64.wav`, and so on.

**Where narration.wav goes:** the narration is one file per line in `public/audio/narrator/`. To use a single recorded narration take, split it at the line boundaries, then save each piece over the matching `narrator_NNN_*.wav`. The ids and text are in `voice-scripts/performance_script.md`. **Character voices** go in their own folders the same way, and **sound effects** go in `public/audio/sfx/`.

### How emotional metadata works

Every line carries `emotion`, `intensity` (0–1), `pace`, `volume`, `pauseBefore` / `pauseAfter`, `fearLevel` (1 confusion → 5 terror), `breath`, `audioEffect`, `pan` and a free‑text `direction`. Providers interpret it as follows:

- **Kokoro** has no emotion input. It realises the metadata through pace, varied sentence and clause pauses (deliberately not uniform), gain, breath SFX placed before or after the line, and the post chain: whisper vocoder, shout saturation, PA, radio, distance, tremor.
- **OpenAI** receives natural‑language acting instructions built from the metadata (see `voice-scripts/acting_instructions.json`).
- **Azure** gets SSML with `mstts:express-as` styles, prosody and breaks (`voice-scripts/ssml_azure.json`).
- **Polly** gets SSML prosody and breaks (`voice-scripts/ssml_polly.json`).
- **ElevenLabs** maps intensity to stability and style, plus v3 audio tags.
- **Human actors:** `voice-scripts/performance_script.md` is a complete, scene‑by‑scene recording script with every direction.

The post chain (`scripts/voice/postprocess.py`) does the following:

- **Marine radio:** HP about 300 Hz, LP about 3.4 kHz, compression, static, squelch and TX clicks.
- **PA:** low‑pass, metallic echo, mild distortion and hiss, reduced line by line as the voice becomes personal.
- **Phone:** narrow band.
- **Whisper:** noise vocoder blended with the voice.
- **Final "Sixty‑four":** whispered, dry, close, slightly behind and right, with a barely audible second whisper at about −27 dB.
- **Every line:** de‑essing, gentle compression, silence trimming and loudness normalisation.

The old woman never gets heavy pitching, reversal, growls or demon layers.

### How to replace any voice manually

Record or export a WAV and save it over the file with the same name, for example `public/audio/old-woman/oldwoman_003_passenger37.wav`. Any sample rate works, mono or stereo. Then run:

```bash
npm run retime
```

### How scene timing updates after regeneration

`npm run retime`, which `generate-voices` also runs, reads the header of every WAV. It writes the real durations to `src/data/generated/audioManifest.json`. `timeline.ts` rebuilds every start, duration, cut, SFX cue and ambience ramp from those durations, so visuals follow the voices. If a file is missing, its line is timed from a words‑per‑minute estimate and simply stays silent.

---

## Sound effects

All effects are synthesised by `scripts/sfx/build_sfx.py` (`npm run build-sfx`) from noise, oscillators and resonators. The set includes `ocean_ambience`, `ferry_engine`, `wind`, `metal_creak`, `impact_hull` (+ `_l` / `_r` so the three THUDs move across the stereo field), `knocking_hull`, `scratch_hull`, `pa_static`, `marine_radio`, `radio_static`, `phone_alert`, `phone_ring`, `crowd_murmur` (layered TTS babble), `emergency_alarm`, `light_flicker`, `lights_off`, `water_splash`, `water_lap`, `heartbeat`, `cctv_static`, `low_horror_drone`, breaths, distant screams, footsteps on steel, the slap, the ferry horn and more.

To upgrade one, drop a real recording with the same file name into `public/audio/sfx/`, then run `npm run retime`. A missing file is silent, never an error. Search `AUDIO CUE` in `src/data/timeline.ts` for the key cues.

Mix philosophy: voices on top; effects lower; ambience beds quiet and ducked by about 5 dB under any speech. There is no music bed, only a very low drone that drops out for the old woman, the harbor reveal, the people in the water and the ending. The final scene is silence, a phone notification, two seconds of nothing, the whisper, then hard black with two seconds of total silence.

---

## Switches

These are Remotion input props, set in the Studio *Props* panel or with `--props`:

| prop | default | effect |
| --- | --- | --- |
| `evidenceInserts` | `true` | `false` replaces the realistic manifest, harbor, police and phone UIs with crude hand‑drawn cards carrying the same key text |
| `cctvOverlay` | `true` | `false` removes the CCTV chrome (noise, blocks, scanlines, labels) and keeps a plain timestamp |
| `grain` | `true` | film grain + vignette |
| `audio` | `true` | mute everything (fast visual checks) |
| `edit` | `'full'` | `'tight'` for the shorter edit |

```bash
npx remotion render Passenger63Horror out/no-evidence.mp4 --props='{"evidenceInserts":false,"cctvOverlay":false}'
```

## Replacing synthetic visuals

Every visual is a React component, so you can swap one in a single place:

- **Characters:** colours and features for each character are fixed in `components/characters/Cast.tsx`.
- **Locations:** these live in `components/environments/`.
- **Evidence screens:** these live in `components/evidence/`.

To use real images or footage, put the file in `public/` and render it with Remotion's `<Img src={staticFile('...')}/>` or `<OffthreadVideo/>` inside the relevant shot in `src/scenes/*.tsx`. Each shot is one entry in a `Shots` list, keyed to the voice line it cuts on.

---

## Notes for the editor

- **Easter eggs** (never mentioned in narration):
  - The old woman is visible as a tiny figure on the rear deck in the very first exterior shot, and through the rear‑door window before the reveal.
  - The boarding‑gate counter flashes `063` for two frames, and the manifest's passenger count blinks to 63 during the boarding‑list check.
  - Daniel's reflection vanishes from the window for a moment.
  - Her silver brooch reads `37`.
  - Two of the passengers in the harbor photo are semi‑transparent.
  - One of the people in the water has Daniel's blue jacket.
  - A tiny black‑coated woman stands in the background of the wedding, honeymoon and Christmas photos.
  - The CCTV frame before the one frame shows two faint hands on the empty seat.
  - When the phone goes black, something faint stands behind Emma in its reflection.
  - The old woman's outline is the only thing in the film that never "boils".
- **The one CCTV frame** is a single 1/30 s frame at the `cctv_glitch` beat. Pause on it.
- **"Earlier that night":** the script's *FOUR HOURS EARLIER* heading contradicts the story's own clock (11:28 PM departure, 12:17 AM count), so the time card reads *EARLIER THAT NIGHT · 11:28 PM*.
- **Two lines were added for character:** a sleepy *"Wake me up when we're home." / "Mm‑hm. Go to sleep."* so Emma and Daniel start in normal life, a second *"Daniel!"* after the scream, and passenger fragments. Remove them from `timeline.ts` if you want the script word for word.

## Credits / licences

- Fonts: Patrick Hand, Permanent Marker, Special Elite, IBM Plex Mono and Inter, all under the SIL Open Font License, bundled in `public/fonts`.
- Voices: generated with Kokoro‑82M (Apache‑2.0) via `kokoro-onnx`.
- All sound effects, textures and visuals are generated by this project.
