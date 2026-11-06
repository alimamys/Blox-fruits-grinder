# Frame 240 — production plan (step 1, awaiting your OK)

A semi-realistic 2D horror short (about 10 minutes) built on the "The 63rd Passenger" engine, drawn in the style of `passenger63-horror/style-samples/animated2d.png`.

Nothing has been spent yet. Before anything is generated, I need your OK on this plan and the two API keys below.

---

## 0. Blockers

| what | status | effect |
| --- | --- | --- |
| `OPENAI_API_KEY` | **not set** in this environment | No character sheets, locations or frames can be generated until it is added. |
| `FISH_API_KEY` | **not set** | No casting auditions or voices. |
| image-to-video key (Runway, Luma, Kling, fal, Replicate…) | none found | Action shots will use 2–3 keyframes joined by crossfades and camera moves, as the brief says. |

Add the keys as environment secrets for this cloud environment, not in chat. While they're missing, I can do all the free work: copy the project, write the voice-line data and timeline, build every layout in code, build the real-recording SFX, and run the timing checks. Timings use word-rate estimates until the voices exist.

## 1. Decisions to confirm

1. **Title:** **Frame 240**. Alternatives: *The 240th Frame*, *White on White*. The folder will be `frame240-horror/` and the composition `Frame240Horror`.
2. **Who speaks:** Mara narrates her own story in the first person, so her narration and her live lines use the same Fish voice.
   - **Narration:** close-mic voice-over with no subtitle tag.
   - **Live lines:** the two phone calls, "Oh God", and the whole closet recording. These are performed in the scene, tagged **MARA** in the subtitles and lip-synced.
   - **Hana:** her own voice, through a phone filter, tagged **HANA**. She is never seen (voice only, as your notes say). Her phone contact shows an initial avatar.
3. **Script fixes.** The dialogue wording is unchanged, apart from these:
   - Scene 8 contains third-person lines ("*Mara turned toward her own wall. For the first time, she noticed…*"). In a first-person film these would be read by a narrator who doesn't exist, so I rewrote them in the first person: "*I turned toward my own wall. For the first time, I noticed a faint outline…*".
   - Scene 11, "*The white surface begins to bulge inward.*", reads as a stage direction. It is shown, not spoken.
   - Scene 10 is filmed on camera: she whispers into her phone's front camera, with a code-drawn `REC` timer. This turns the climax into talking shots of her face.
   - "Pause", "Silence" and "Audio:" notes become timeline beats and sound cues. Numbers are spoken as words ("two hundred and thirty-nine").
4. **Frame rate:** 24 fps, from your production table, instead of the engine's 30. I'll patch the few scripts that hard-code 30.
5. **Length:** the 192 lines (1,272 words) come out at roughly 9:40–10:20 once voiced. The plan keeps every line and tightens the pauses.
   - If the voiced cut runs past 10:15, these lines go first, in `edit.ts`: "*There was no movement between positions.*" (it repeats "He didn't walk"), "*I wasn't going to spend another second trying to understand it.*", and "*For a few seconds, nothing happened.*".
6. **Hook:** the black screen with the fan hum carries a one-line fiction disclaimer. The extra frame with the man flashes at about 0:08, on "*a man was standing in my hallway*". The cold open ends on the bent-headed figure in the real hallway, a dry scratch, and black, then the **FRAME 240** title over silence.
7. **Ending:** a final click, a cut to pure white, and 3 s of complete silence. Then the film ends.

---

## 2. Scenes and voice lines

Totals: **192 lines**, of which 135 are Mara's narration, 43 are Mara on screen, and 14 are Hana. That is 1,272 words and about 6,900 characters. The IDs are filenames, as in the engine.

#### Scene 1 — Cold open — the frame that shouldn't exist  (`coldOpen`)
Delivery: quiet, uneasy; a confession.

| id | who | line |
| --- | --- | --- |
| `narrator_001_two_hundred` | Mara (V.O.) | There were 239 frames in my animation when I went to bed. |
| `narrator_002_when_opened` | Mara (V.O.) | When I opened it again, there were 240. |
| `narrator_003_extra_frame` | Mara (V.O.) | In the extra frame, a man was standing in my hallway. |
| `narrator_004_drawn` | Mara (V.O.) | I hadn't drawn him. |
| `narrator_005_next_time` | Mara (V.O.) | And the next time I pressed play, he was closer. |
| `narrator_006_know_how` | Mara (V.O.) | I know how ridiculous that sounds. |
| `narrator_007_drawing_move` | Mara (V.O.) | A drawing can't move by itself. An animation can't create new frames. |
| `narrator_008_least_believed` | Mara (V.O.) | At least, that's what I believed. |
| `narrator_009_until_that` | Mara (V.O.) | Until that night. |

#### Scene 2 — A normal night  (`normalNight`)
Delivery: warm, tired, ordinary — the calm before.

| id | who | line |
| --- | --- | --- |
| `narrator_010_name_mara` | Mara (V.O.) | My name is Mara. I'm a freelance animator. |
| `narrator_011_most_nights` | Mara (V.O.) | Most nights, I work until two or three in the morning. It's quieter then. No phone calls. No interruptions. |
| `narrator_012_that_night` | Mara (V.O.) | That night, I was finishing a short animation of an empty apartment hallway. |
| `narrator_013_nothing_complicated` | Mara (V.O.) | Nothing complicated. A flickering ceiling light, a few shadows, and a slow movement toward a closed bedroom door. |
| `narrator_014_used_own` | Mara (V.O.) | I'd used my own hallway as a reference. |
| `narrator_015_little_crack` | Mara (V.O.) | The little crack above the doorframe, the old carpet, even the stain on the ceiling. It was all there. |
| `narrator_016_staring_same` | Mara (V.O.) | I'd been staring at the same ten seconds of animation for nearly three hours. |
| `narrator_017_eventually_saved` | Mara (V.O.) | Eventually, I saved the project, closed my eyes for a moment, and checked the timeline one last time. |
| `narrator_018_when_noticed` | Mara (V.O.) | That's when I noticed the extra frame. |

#### Scene 3 — The stranger  (`stranger`)
Delivery: curious → unsettled; ends on a whisper.

| id | who | line |
| --- | --- | --- |
| `narrator_019_first_thought` | Mara (V.O.) | At first, I thought I'd accidentally duplicated something. |
| `narrator_020_clicked_final` | Mara (V.O.) | I clicked on the final frame. |
| `narrator_021_man_standing` | Mara (V.O.) | There was a man standing at the far end of the hallway. |
| `narrator_022_very_tall` | Mara (V.O.) | He was very tall. Taller than the doorframe. |
| `narrator_023_arms_hung` | Mara (V.O.) | His arms hung straight down, and his head tilted slightly forward, as though he were examining something on the floor. |
| `narrator_024_face_almost` | Mara (V.O.) | His face was almost completely hidden. |
| `narrator_025_something_about` | Mara (V.O.) | But something about the drawing bothered me. |
| `narrator_026_matched_animation` | Mara (V.O.) | It matched my animation style perfectly. |
| `narrator_027_same_brush` | Mara (V.O.) | The same brush texture. The same lighting. Even the same shadows. |
| `narrator_028_checked_layers` | Mara (V.O.) | I checked the layers. |
| `narrator_029_background_lighting` | Mara (V.O.) | Background. Lighting. Ceiling. Door. |
| `narrator_030_layer_containing` | Mara (V.O.) | There was no layer containing a man. |
| `narrator_031_tried_selecting` | Mara (V.O.) | I tried selecting him. |
| `narrator_032_nothing` | Mara (V.O.) | Nothing. |
| `narrator_033_part_picture` | Mara (V.O.) | He was part of the picture. |
| `narrator_034_pressed_play` | Mara (V.O.) | Then I pressed play again. |
| `narrator_035_moved` | Mara (V.O.) | He had moved. |

#### Scene 4 — One step closer  (`closer`)
Delivery: controlled fear; short lines land like hits.

| id | who | line |
| --- | --- | --- |
| `narrator_036_stared_screen` | Mara (V.O.) | I stared at the screen for a long time. |
| `narrator_037_played_animation` | Mara (V.O.) | Then I played the animation again. |
| `narrator_038_man_closer` | Mara (V.O.) | The man was closer. |
| `narrator_039_much_maybe` | Mara (V.O.) | Not much. Maybe a meter. |
| `narrator_040_played_third` | Mara (V.O.) | I played it a third time. |
| `narrator_041_closer` | Mara (V.O.) | Closer. |
| `narrator_042_fourth_time` | Mara (V.O.) | A fourth time. |
| `narrator_043_closer` | Mara (V.O.) | Closer. |
| `narrator_044_walk` | Mara (V.O.) | He didn't walk. |
| `narrator_045_movement_between` | Mara (V.O.) | There was no movement between positions. |
| `narrator_046_simply_appeared` | Mara (V.O.) | He simply appeared somewhere new every time the animation reached its final frame. |
| `narrator_047_someone_drawing` | Mara (V.O.) | Like someone was drawing him in a different place. |
| `narrator_048_stopped_playback` | Mara (V.O.) | I stopped the playback. |
| `narrator_049_several_seconds` | Mara (V.O.) | For several seconds, I didn't move. |
| `narrator_050_heard_something` | Mara (V.O.) | Then I heard something from my actual hallway. |
| `narrator_051_sounded_someone` | Mara (V.O.) | It sounded like someone dragging a pencil across a wall. |
| `narrator_052_turned_around` | Mara (V.O.) | I turned around. |
| `narrator_053_hallway_empty` | Mara (V.O.) | The hallway was empty. |
| `narrator_054_ceiling_light` | Mara (V.O.) | But the ceiling light was flickering. |
| `narrator_055_exactly_one` | Mara (V.O.) | Exactly like the one in my animation. |

#### Scene 5 — The warning  (`warning`)
Delivery: Hana sleepy → serious; Mara tight, trying to stay calm.

| id | who | line |
| --- | --- | --- |
| `narrator_056_called_hana` | Mara (V.O.) | I called Hana. |
| `narrator_057_worked_animation` | Mara (V.O.) | She'd worked with me on animation projects before. If anyone could explain this, she could. |
| `hana_001_mara_almost` | **HANA** (phone) | Mara? It's almost three in the morning. |
| `mara_001_need_you` | **MARA** (on screen) | I need you to look at something. I'm sending you a screenshot. |
| `hana_002_whats` | **HANA** (phone) | What's this? |
| `mara_002_tell_if` | **MARA** (on screen) | Tell me if you can see the man in the hallway. |
| `hana_003_yeah_creepy` | **HANA** (phone) | Yeah. He's creepy. Did you draw him? |
| `mara_003_no` | **MARA** (on screen) | No. |
| `hana_004_do_you` | **HANA** (phone) | What do you mean, no? |
| `mara_004_before_every` | **MARA** (on screen) | He wasn't there before. And every time I play the animation, he gets closer. |
| `hana_005_okay_stop` | **HANA** (phone) | Okay. Stop playing it. Close the program. |
| `mara_005_already_tried` | **MARA** (on screen) | I already tried. It keeps reopening the same frame. |
| `hana_006_turn_computer` | **HANA** (phone) | Then turn the computer off. And get out of that apartment. |

#### Scene 6 — The hallway changes  (`hallway`)
Delivery: creeping dread → first real panic.

| id | who | line |
| --- | --- | --- |
| `narrator_058_grabbed_keys` | Mara (V.O.) | I grabbed my keys. |
| `narrator_059_going_spend` | Mara (V.O.) | I wasn't going to spend another second trying to understand it. |
| `narrator_060_when_reached` | Mara (V.O.) | But when I reached the hallway, something was wrong. |
| `narrator_061_carpet_looked` | Mara (V.O.) | The carpet looked different. |
| `narrator_062_same_stain` | Mara (V.O.) | The same stain appeared every few feet, repeating in a perfect pattern. |
| `narrator_063_crack_above` | Mara (V.O.) | The crack above the bedroom door was no longer just a crack. |
| `narrator_064_thin_black` | Mara (V.O.) | It was a thin, black line. Almost like a pencil mark. |
| `narrator_065_moved_closer` | Mara (V.O.) | I moved closer. |
| `narrator_066_entire_wall` | Mara (V.O.) | The entire wall looked wrong. |
| `narrator_067_too_smooth` | Mara (V.O.) | Too smooth. Too flat. |
| `narrator_068_someone_painted` | Mara (V.O.) | Like someone had painted over a photograph. |
| `narrator_069_reached_out` | Mara (V.O.) | I reached out and touched the surface. |
| `narrator_070_felt_paper` | Mara (V.O.) | It felt like paper. |
| `narrator_071_from_behind` | Mara (V.O.) | Then, from behind the bedroom door, I heard a sound. |
| `narrator_072_three_gentle` | Mara (V.O.) | Three gentle taps. |
| `narrator_073_same_scratching` | Mara (V.O.) | The same scratching noise I'd heard through my computer speakers. |
| `narrator_074_ran_back` | Mara (V.O.) | I ran back to the desk. |
| `narrator_075_first_time` | Mara (V.O.) | And for the first time, I understood. |
| `narrator_076_animation_copying` | Mara (V.O.) | The animation wasn't copying my hallway anymore. |
| `narrator_077_hallway_copying` | Mara (V.O.) | My hallway was copying the animation. |

#### Scene 7 — Trying to erase him  (`erase`)
Delivery: frantic purpose → false relief → dread.

| id | who | line |
| --- | --- | --- |
| `narrator_078_needed_know` | Mara (V.O.) | I needed to know whether I could change it. |
| `narrator_079_picked_up` | Mara (V.O.) | I picked up my stylus and drew a red line across the hallway wall in the animation. |
| `narrator_080_immediately_heard` | Mara (V.O.) | Immediately, I heard a long scraping noise. |
| `narrator_081_looked_behind` | Mara (V.O.) | I looked behind me. |
| `narrator_082_red_line` | Mara (V.O.) | A red line had appeared on my real wall. |
| `narrator_083_exact_same` | Mara (V.O.) | The exact same length. |
| `narrator_084_exact_same` | Mara (V.O.) | The exact same position. |
| `narrator_085_hands_started` | Mara (V.O.) | My hands started shaking. |
| `narrator_086_if_animation` | Mara (V.O.) | If the animation could change the apartment, maybe I could use it to stop the man. |
| `narrator_087_selected_thick` | Mara (V.O.) | I selected a thick white brush. |
| `narrator_088_started_painting` | Mara (V.O.) | Then I started painting over him. |
| `narrator_089_first_legs` | Mara (V.O.) | First his legs. |
| `narrator_090_arms` | Mara (V.O.) | Then his arms. |
| `narrator_091_strange_angle` | Mara (V.O.) | Then the strange angle of his head. |
| `narrator_092_kept_painting` | Mara (V.O.) | I kept painting until the entire figure disappeared into the white background. |
| `narrator_093_flattened_layer` | Mara (V.O.) | I flattened the layer. |
| `narrator_094_saved_project` | Mara (V.O.) | Saved the project. |
| `narrator_095_waited` | Mara (V.O.) | And waited. |
| `narrator_096_few_seconds` | Mara (V.O.) | For a few seconds, nothing happened. |
| `narrator_097_thought_done` | Mara (V.O.) | I thought I'd done it. |
| `narrator_098_thought_erased` | Mara (V.O.) | I thought I'd erased him. |
| `narrator_099_erased` | Mara (V.O.) | But I hadn't erased him. |
| `narrator_100_made_much` | Mara (V.O.) | I'd made a much worse mistake. |

#### Scene 8 — White on white  (`whiteOnWhite`)
Delivery: hushed; Hana quietly terrified; Mara breathless.

| id | who | line |
| --- | --- | --- |
| `narrator_101_noticed_changes` | Mara (V.O.) | I noticed the changes slowly. |
| `narrator_102_wallpaper_lost` | Mara (V.O.) | The wallpaper had lost its texture. |
| `narrator_103_shadows_around` | Mara (V.O.) | The shadows around the doorframe had disappeared. |
| `narrator_104_even_stains` | Mara (V.O.) | Even the stains were gone. |
| `narrator_105_apartment_looked` | Mara (V.O.) | My apartment looked like an unfinished drawing. |
| `narrator_106_called_hana` | Mara (V.O.) | I called Hana again. |
| `mara_006_think_got` | **MARA** (on screen) | I think I got rid of him. |
| `hana_007_did_you` | **HANA** (phone) | What did you do? |
| `mara_007_painted_over` | **MARA** (on screen) | I painted over him. He's gone. |
| `hana_008_mara_listen` | **HANA** (phone) | Mara, listen to me. |
| `mara_008_line` | **MARA** (on screen) | What? |
| `hana_009_looking_screenshot` | **HANA** (phone) | I'm looking at the screenshot you sent earlier. |
| `mara_009_okay` | **MARA** (on screen) | Okay? |
| `hana_010_zoomed_man` | **HANA** (phone) | I zoomed in on the man. |
| `hana_011_light_casting` | **HANA** (phone) | The light is casting a shadow behind him. |
| `mara_010_line` | **MARA** (on screen) | So? |
| `hana_012_look_where` | **HANA** (phone) | Look at where the shadow ends. |
| `hana_013_standing_right` | **HANA** (phone) | He's standing right against the white wall. |
| `narrator_107_turned_toward` | Mara (V.O.) | I turned toward my own wall. |
| `narrator_108_first_time` | Mara (V.O.) | For the first time, I noticed a faint outline. |
| `narrator_109_black` | Mara (V.O.) | Not black. |
| `narrator_110_gray` | Mara (V.O.) | Not gray. |
| `narrator_111_white` | Mara (V.O.) | White. |
| `narrator_112_almost_exact` | Mara (V.O.) | Almost the exact same color as the paint. |
| `mara_011_oh_god` | **MARA** (on screen) | Oh God. |

#### Scene 9 — Inside the wall  (`insideWall`)
Delivery: escalating panic; Hana screaming through the phone.

| id | who | line |
| --- | --- | --- |
| `narrator_113_backed_away` | Mara (V.O.) | I backed away. |
| `narrator_114_shape_moved` | Mara (V.O.) | The shape moved. |
| `narrator_115_person_walking` | Mara (V.O.) | Not like a person walking. |
| `narrator_116_more_drawing` | Mara (V.O.) | More like a drawing being stretched across paper. |
| `narrator_117_outline_hand` | Mara (V.O.) | The outline of a hand appeared near the ceiling. |
| `narrator_118_elbow` | Mara (V.O.) | Then an elbow. |
| `narrator_119_curve_head` | Mara (V.O.) | Then the curve of a head. |
| `narrator_120_could_barely` | Mara (V.O.) | I could barely see it unless I tilted my phone flashlight sideways. |
| `narrator_121_worst_part` | Mara (V.O.) | And the worst part was how quietly it moved. |
| `narrator_122_breathing` | Mara (V.O.) | No breathing. |
| `narrator_123_footsteps` | Mara (V.O.) | No footsteps. |
| `narrator_124_that_horrible` | Mara (V.O.) | Just that horrible scratching sound. |
| `narrator_125_coming_from` | Mara (V.O.) | It was coming from inside the walls now. |
| `narrator_126_grabbed_computer` | Mara (V.O.) | I grabbed the computer and tried to smash the screen. |
| `narrator_127_image_stayed` | Mara (V.O.) | But the image stayed there. |
| `narrator_128_man_gone` | Mara (V.O.) | The man was gone from the drawing. |
| `narrator_129_place_blank` | Mara (V.O.) | In his place was a blank white space. |
| `narrator_130_through_that` | Mara (V.O.) | And through that blank space, something was slowly pushing outward. |
| `narrator_131_heard_hana` | Mara (V.O.) | I heard Hana shouting through my phone. |
| `hana_014_mara_get` | **HANA** (phone) | Mara! Get out! Get out right now! |
| `narrator_132_ran_front` | Mara (V.O.) | I ran for the front door. |
| `narrator_133_handle` | Mara (V.O.) | There was no handle. |
| `narrator_134_even_door` | Mara (V.O.) | There wasn't even a door anymore. |
| `narrator_135_smooth_white` | Mara (V.O.) | Just a smooth white rectangle where the entrance had been. |

#### Scene 10 — The recording  (`recording`)
Delivery: on camera, whispering into her phone; barely holding together.

| id | who | line |
| --- | --- | --- |
| `mara_012_where_am` | **MARA** (on screen) | That's where I am now. |
| `mara_013_inside_storage` | **MARA** (on screen) | Inside the storage closet. |
| `mara_014_started_recording` | **MARA** (on screen) | I started recording this because I don't know what else to do. |
| `mara_015_can_still` | **MARA** (on screen) | I can still hear it moving around outside. |
| `mara_016_sometimes_scratching` | **MARA** (on screen) | Sometimes the scratching stops. |
| `mara_017_when_does` | **MARA** (on screen) | And when it does, I hear something even worse. |
| `mara_018_soft_dragging` | **MARA** (on screen) | A soft dragging sound. |
| `mara_019_someone_tracing` | **MARA** (on screen) | Like someone tracing a finger over paper. |
| `mara_020_ive_watching` | **MARA** (on screen) | I've been watching the gap beneath the closet door. |
| `mara_021_hasnt_shadow` | **MARA** (on screen) | There hasn't been a shadow. |
| `mara_022_once` | **MARA** (on screen) | Not once. |
| `mara_023_think_finally` | **MARA** (on screen) | I think I finally understand why. |
| `mara_024_when_painted` | **MARA** (on screen) | When I painted over that man, I didn't destroy him. |
| `mara_025_changed_color` | **MARA** (on screen) | I changed his color. |
| `mara_026_made_invisible` | **MARA** (on screen) | I made him invisible against anything white. |
| `mara_027_nearly_every` | **MARA** (on screen) | And nearly every wall in this apartment is white. |
| `mara_028_something_touching` | **MARA** (on screen) | There's something touching the closet door. |

#### Scene 11 — The last selection  (`lastSelection`)
Delivery: shaking whisper → barely audible.

| id | who | line |
| --- | --- | --- |
| `mara_029_face` | **MARA** (on screen) | There's a face. |
| `mara_030_can_see` | **MARA** (on screen) | I can see it now. |
| `mara_031_pressed_against` | **MARA** (on screen) | It's pressed against the other side. |
| `mara_032_coming_through` | **MARA** (on screen) | But it's not coming through. |
| `mara_033_looking` | **MARA** (on screen) | It's just... looking at me. |
| `mara_034_wait` | **MARA** (on screen) | Wait. |
| `mara_035_little_lines` | **MARA** (on screen) | There are little lines appearing around me. |
| `mara_036_floor` | **MARA** (on screen) | On the floor. |
| `mara_037_walls` | **MARA** (on screen) | On the walls. |
| `mara_038_theyre_moving` | **MARA** (on screen) | They're moving. |
| `mara_039_line` | **MARA** (on screen) | Like... |
| `mara_040_selection_box` | **MARA** (on screen) | Like a selection box. |
| `mara_041_oh` | **MARA** (on screen) | Oh no. |
| `mara_042_someones_selecting` | **MARA** (on screen) | Someone's selecting me. |
| `mara_043_one_drawing` | **MARA** (on screen) | I'm not the one drawing anymore. |

---

## 3. Casting (Fish Audio, generic library voices only)

These are shortlists from Fish's public library: no celebrity or film-character clones, all English. Once `FISH_API_KEY` is set, `scripts/voice/fish_cast.py` auditions each candidate on two real lines. Whisper scores each take for accuracy, pace and pitch, and I send you a reel per character. Auditions cost about $0.01.

| character | brief | candidates (first = my pick going in) |
| --- | --- | --- |
| **Mara**: narration and on-screen lines | female, early 30s, conversational, restrained; slides from curiosity to controlled panic; must whisper well | 1. [Female Voice](https://fish.audio/m/2a9605eeafe84974b5b20628d42c0060): calm, reflective, smooth · 2. [STORYTELLING VOICE](https://fish.audio/m/836513f294d64aec8403226e69268b1b): young, measured, mysterious · 3. [horror (female)](https://fish.audio/m/ef4741fd388e42848acaea777b643703): soft, breathy storyteller · 4. [Woman](https://fish.audio/m/57d4a7fa3d944ca5b2407f916ce5f4d5): warm, sincere |
| **Hana**: phone only | female, 30ish friend and fellow animator; sleepy, then serious, then screaming; must be told apart from Mara instantly through a phone filter | 1. [Yorkshire Woman](https://fish.audio/m/bebd3797a58b4b3d9934bf86776b7d2b): friendly Northern English, and the accent separates her from Mara · 2. [calm woman](https://fish.audio/m/0f2279f5f3894673a675eb85a61e1e2e): clear, friendly · 3. [Female](https://fish.audio/m/b88bf358091e4e22924af8e0580beafb): relaxed, conversational · 4. [Woman](https://fish.audio/m/7b0e224b87454737a05e573d318e89ba): mature, measured |

The model is **Drama 3** (`FISH_MODEL=drama-3`). Emotions go in as tags such as `[whispering]`, `[terrified]` and `[sleepy]`. The voice post-processing is:

| line type | post chain |
| --- | --- |
| Mara's narration | dry, close |
| Mara on screen | small room (apartment); closet scenes almost dry, close, slightly breathy |
| Hana | the engine's `phone` chain |
| Hana, "Get out! Get out right now!" | `phone` plus `distant`, shouting from a phone lying on the floor |

After generation: Whisper QA, flagged lines re-rolled best-of-3, then `tighten.py`, `retime.mjs` and `speech_timing.py`.

---

## 4. Look bible

**Style reference (every request):** `style-samples/animated2d.png`, plus the text "*semi-realistic 2D animated series for adults - clean line art, cel-shaded characters with natural proportions and very expressive eyes, painted atmospheric backgrounds, cinematic moody lighting*" and the scene's colour mood. Fear has to read on a phone: wide eyes, tense mouths, strong key light on faces and deep shadow around them.

### Characters (sheets: front, three-quarter and side views, full body, plus expressions)

- **Mara**, 32, freelance animator.
  - **Build and face:** slim, average height. Light olive skin, oval face, large dark-brown expressive eyes, thick dark brows, faint tired shadows under the eyes.
  - **Hair:** dark brown, shoulder length, in a messy low bun with loose strands framing her face.
  - **Clothes:** oversized **burnt-orange crew-neck sweatshirt** with the sleeves pushed to her forearms, charcoal-grey sweatpants and thick grey wool socks. No jewellery.
  - **Distinctive item:** a **yellow pencil stuck through her bun**. It is in every shot, and it is the "drawing" motif.
  - **Sheets:** (a) turnaround: front, three-quarter and side, full body; (b) expressions: neutral, uneasy, terrified, screaming, crying.
- **The figure ("the man")**.
  - **Shape:** impossibly tall and thin, with his head above a 2 m doorframe. Long arms hang straight down past his knees, the shoulders are narrow and sloped, and the head tilts forward and is bent unnaturally to one side.
  - **Face:** always in shadow, with no features drawn.
  - **Surface:** painted in the same brush texture as the hallway around him. He reads as a smoky charcoal silhouette in a shapeless dark garment, never detailed.
  - **White version** (after scene 7): the same shape painted flat white, visible only as faint outlines and tiny cast shadows.
  - **Sheet:** front, side and three-quarter views; the head-bent pose in a doorway; the white-on-white version; a hand pushing out through a white surface.
  - He stays mostly hidden in the film. The sheet only exists to keep his shape consistent.
- **Hana**: voice only, so no sheet.

### Locations (one establishing reference each)

1. **Workroom.** A cramped living-room corner at night.
   - **Desk:** a big monitor, a pen tablet, a mug and blank sticky notes.
   - **Window:** streaked with rain.
   - **Behind her chair:** the open doorway into the dark hallway.
   - **Light:** cold blue moonlight against the monitor glow on her face.
2. **Hallway**, seen from the living-room end.
   - **Floor and walls:** an old beige carpet runner and white walls with faint wallpaper texture.
   - **Ceiling:** one dome ceiling light with a brown water stain beside it.
   - **Far end:** a hairline crack above the frame of the closed bedroom door.
   - **Side doors:** the front door on the left near the camera, and the storage-closet door on the right, halfway along.
   - **Light:** cold night blue and a weak yellow bulb.
   - **The canvas:** Mara's animation shows this same composition. The real hallway and the canvas match-cut.
3. **Storage closet.**
   - **Room:** tiny, with white walls, shelves of boxes, a vacuum and coats on hooks.
   - **Door:** white, with a thin gap of light under it.
   - **Light:** her phone is the only light.
4. **White apartment.** The hallway and workroom drained into an "unfinished drawing": flat white, no texture, no shadows, only faint outlines. The front door is a smooth white rectangle with no handle.

### Colour moods per scene

| scene | colour mood |
| --- | --- |
| 1 | black with monitor blue |
| 2 | warm screen light, cold rain blue |
| 3–4 | cold blue; the monitor lights her face |
| 5 | phone glow |
| 6 | a white flashlight cone in the dark |
| 7 | a red accent (the red line), then white screen glow |
| 8 | drained greys and whites |
| 9 | harsh flashlight on white |
| 10–11 | dark closet, phone light, white door |

### Generation rules (built into `restyle.py STYLE=semi2d`)

- **Inputs** for each frame, through the edits endpoint:
  - the code-drawn layout keyframe;
  - the sheets of everyone in the shot;
  - the location reference;
  - `animated2d.png`.
- **Prompt:**
  - take only composition, poses and positions from the layout;
  - the style comes from the style reference;
  - the characters must match their sheets exactly (face, hair, pencil, sweatshirt);
  - add no people, reflections, ghosts or text.
- **Screen pictures:** every picture on Mara's canvas is an edit of one base frame, *CANVAS-EMPTY*, so the background never changes between positions of the man.
- **Mouth variants** (`MOUTH_VARIANTS`): an edit of the finished frame where only her mouth opens. The drawn-ellipse mouth is switched off.
- **Cost logging:** the API's token usage for every call is logged to `build/image_costs.jsonl`. The run stops at the budget you approve (`IMAGE_BUDGET_USD`).
- **Parallax:** on about 15–20 shots with a clean foreground (over-the-shoulder shots, the door frame, her silhouette against the monitor). I'll separate the layers locally with a free segmentation model, so this costs no extra images.

---

## 5. Shot list

### Shot types

| type | what it is | new images |
| --- | --- | --- |
| **CODE** | crisp code-drawn UI: the timeline, layers panel, phone, `REC` overlay, marching ants, cursor, title, black or white | 0 |
| **SCREEN** | code UI around a drawn canvas picture | 1, the first time the picture appears |
| **STILL** | one generated frame | 1 |
| **ACTION** | k0, k1 and k2 keyframes | 2–3 |
| **TALK** | the frame plus a mouth-open variant | 1 + 1 |
| **REUSE** | an earlier image, with a new crop, move or effect | 0 |

### Summary

| scene | shots | stills, action frames and canvas pictures | mouth variants | action shots | talking frames |
| --- | --- | --- | --- | --- | --- |
| 1 Cold open | 12 | 9 | – | – | – |
| 2 A normal night | 11 | 14 | – | rubbing eyes, then the mug; save, eyes shut, lean in | – |
| 3 The stranger | 18 | 7 | – | – | – |
| 4 One step closer | 21 | 15 | – | **turning around** (3 keys) | – |
| 5 The warning | 16 | 6 | 3 | – | Mara on the phone, 3 angles |
| 6 The hallway changes | 21 | 24 | – | **standing up and walking**; **reaching for the wall**; **running back** | – |
| 7 Trying to erase him | 23 | 14 | – | **looking behind** | – |
| 8 White on white | 26 | 16 | 3 | **turning to the wall**; **shoulder peeling out** | 2 phone angles; "Oh God" |
| 9 Inside the wall | 25 | 27 | – | **backing away**; the shape shifts; **tilting the flashlight**; **smashing the monitor** (3 keys); **fingers through the screen**; **running to the door** | – |
| 10 The recording | 18 | 8 | 3 | the door being touched | closet wide; phone-camera close-up; crying close-up |
| 11 The last selection | 16 | 6 | 2 | – | terrified close-up; final whisper |
| **total** | **≈207 shots** (average 2.9 s) | **146** | **11** | | |

### Shot by shot

Each list shows the cue line, then the shot type and what is on screen. The `[n]` at the end of an item is how many new images it needs.

#### Scene 1, cold open (about 0:00–0:42)

- **Black:** fan hum and a mouse click; the disclaimer line. CODE.
- **"239 frames…":** the timeline UI with the counter at 239 and a strip of hallway thumbnails. SCREEN, *CANVAS-EMPTY* [1].
- **"…there were 240":** the counter flips and a new cell slides in. CODE.
- **"In the extra frame…":** a 4-frame full-screen flash of the man at the far end of the hall, then a hold. SCREEN, *CANVAS-MAN-FAR* [1].
- **"I hadn't drawn him":** Mara, extreme close-up, lit by the monitor, uneasy. STILL [1].
- **"…he was closer":** the canvas with the man halfway down the hall. SCREEN, *CANVAS-MAN-MID* [1].
- **"I know how ridiculous…":** Mara at her desk, with the dark doorway behind her. STILL [1].
- **"A drawing can't move…":** her hand and stylus on the tablet. STILL [1].
- **"…what I believed":** her eyes, extreme close-up. STILL [1].
- **"Until that night":** the real hallway, dark, seen from the desk (*HALL-DARK*). STILL [1].
- **Beat:** the bent-headed figure at the end of the real hallway, with a glitch, then black and a dry scratch. STILL [1].
- **Title:** FRAME 240. CODE.

#### Scene 2, a normal night

- **"My name is Mara":** the exterior, rain, one lit window [1], then the wide workroom establishing shot [1]. STILL.
- **"Most nights…":** she rubs her eyes, then sips from the mug. ACTION [2].
- **"No phone calls…":** her phone face-down next to a cold mug. STILL [1].
- **"…finishing a short animation":** over the shoulder onto the monitor. STILL [1].
- **"Nothing complicated…":** the animation plays, pushing toward the door with the light flickering. SCREEN, reuse.
- **"my own hallway":** a match cut to the real hallway, lit (*HALL-LIT*). STILL [1].
- **"crack… carpet… stain":** three detail inserts. ACTION-style [3].
- **"staring… three hours":** Mara exhausted, the screen reflected in her eyes. STILL [1].
- **"saved… closed my eyes… checked":** Ctrl+S, eyes shut leaning back, then leaning in. ACTION [3].
- **"…the extra frame":** a push into the timeline; the cursor stops on 240. CODE.

#### Scene 3, the stranger

- **"duplicated something":** timeline extreme close-up, frames 238 to 240. CODE.
- **"I clicked":** a stylus click insert. STILL [1].
- **"a man standing…":** SCREEN, reuse.
- **"Taller than the doorframe":** his head above the frame. SCREEN, *CANVAS-MAN-DETAIL* [1].
- **"arms hung…":** a tilt down the same picture. Reuse.
- **"face… hidden":** SCREEN, *CANVAS-FACE* [1].
- **"bothered me":** Mara leaning in. STILL [1].
- **"matched my style… brush, lighting, shadows":** 400% zoom crops. CODE, reuse.
- **"layers… Background. Lighting. Ceiling. Door… no layer":** the layers panel, each layer clicked. CODE.
- **"tried selecting him… Nothing":** a lasso marquee that collapses. CODE, reuse.
- **"part of the picture":** Mara uneasy. STILL [1].
- **"pressed play":** a finger on the space bar. STILL [1].
- **Playback beat:** about 4 s; the last frame jumps to *CANVAS-MAN-MID*. Reuse.
- **"He had moved":** her eyes widen, extreme close-up. STILL [1].

#### Scene 4, one step closer

- **"stared…":** Mara frozen, seen from the monitor, with the doorway black behind her. STILL [1].
- **"played it again… closer… a meter":** SCREEN, *CANVAS-MAN-1M* [1], and her eyes, extreme close-up [1].
- **"third time… Closer":** *CANVAS-MAN-NEAR* [1].
- **"fourth time":** her lip trembles [1].
- **"Closer":** *CANVAS-MAN-CLOSE*, filling the frame [1].
- **"didn't walk / no movement":** an onion-skin overlay of every position. CODE, reuse.
- **"appeared somewhere new…":** over the shoulder; the monitor and the dark doorway together [1].
- **"drawing him in a different place":** her realisation [1].
- **"stopped the playback":** CODE.
- **"several seconds":** from deep in the dark hallway, looking at her back [1].
- **"heard something":** her eyes slide sideways [1].
- **Scratch beat:** *HALL-DARK* trembles. Reuse.
- **"pencil across a wall":** the dark wall, close [1].
- **"I turned around":** ACTION [3].
- **"empty":** reuse.
- **"ceiling light flickering":** STILL with flicker [1].
- **"Exactly like the one in my animation":** a split screen with both lights flickering in sync. CODE, reuse.

#### Scene 5, the warning

- **"I called Hana":** the phone calling UI. CODE.
- **Phone call:** angle A, a medium shot with the phone at her ear [1, plus mouth 1]; angle B, a close-up [1, plus mouth 1]; angle B2, more scared [1, plus mouth 1]. Hana's lines play over Mara listening, with her mouth closed.
- **Notification beat:** a message thread with the screenshot. CODE, reuse.
- **Silence beat:** the monitor across the dark room with the man on it [1].
- **"keeps reopening the same frame":** the window closes and reopens on 240. CODE.
- **"get out of that apartment":** Mara turns toward the hallway [1].
- **Louder scratch:** a low angle along the hallway floor [1].

#### Scene 6, the hallway changes

- **Keys snatched** [1].
- **Stands up, walks to the doorway:** ACTION [2].
- **At the mouth of the hallway**, flashlight on [1].
- **Carpet** [1].
- **Stains repeating in a perfect pattern** [1].
- **Doorframe crack** [1], then a pencil-line extreme close-up [1].
- **"I moved closer":** walking toward the camera [1].
- **"wall looked wrong / too flat":** the wall [1] and her face [1].
- **"painted over a photograph":** wall detail [1].
- **Reaching out, then a fingertip on the wall:** ACTION [2].
- **"felt like paper":** her face [1].
- **Beat:** the fingertip [1], with a code-drawn pencil line following it.
- **"behind the bedroom door":** [1].
- **Three taps:** the door, with a tiny shake on each tap [1].
- **"scratching noise":** Mara terrified [1].
- **Runs back to the desk:** ACTION [2].
- **"I understood":** [1].
- **"wasn't copying my hallway":** *CANVAS-PATTERN* [1].
- **"My hallway was copying the animation":** a match cut to the real hallway with the repeating stains [1].

#### Scene 7, trying to erase him

- **Frantic, gripping the stylus** [1].
- **The red line:** a hand insert [1], then a CODE red line drawing itself on the canvas.
- **The scraping noise:** she freezes [1].
- **"looked behind me":** ACTION [2].
- **The red line on the real wall** [1].
- **"same length / same position":** a split screen. CODE.
- **Hands shaking:** tremble [1].
- **"maybe I could use it":** jaw set [1].
- **White brush and the strokes over legs, arms and head:** CODE strokes painted live over *CANVAS-MAN-CLOSE*.
- **"until the entire figure disappeared":** her face lit pure white by the screen [1].
- **Flatten and save:** CODE.
- **"And waited":** [1].
- **Silence beat:** reuse.
- **"I'd done it":** she exhales [1].
- **"erased him":** *CANVAS-WHITE-SMEAR* [1].
- **"hadn't erased him":** her relief fading [1].
- **"much worse mistake":** the hallway starting to drain white [1].

#### Scene 8, white on white

- **The changes:** the drained workroom [1], a flat wall [1], the shadowless doorframe [1], the ceiling without its stain [1], and the white hallway wide [1].
- **The second call:** angle C, in the white room [1, plus mouth 1]; angle D, a close-up [1, plus mouth 1].
- **The screenshot:** a CODE phone thread, then a zoom into *SCREENSHOT-SHADOW* [1], panning along the shadow to the pale shape.
- **"right against the white wall":** her realisation [1].
- **"I turned toward my own wall":** ACTION [2].
- **The faint outline** [1].
- **"Not black. Not gray.":** her eyes [1].
- **"White.":** reuse.
- **The shoulder separating from the wall:** ACTION [2].
- **"Oh God":** TALK [1, plus mouth 1].
- **The wet peel:** a tremble on the reused frame.

#### Scene 9, inside the wall

- **Backing away:** ACTION [2].
- **The shape moves:** ACTION [2].
- **Her face** [1].
- **The stretched shape** [1].
- **Hand, elbow, head**, one image each [3].
- **The flashlight tilting:** a flat beam, then a raking beam that shows the relief. ACTION [2].
- **"No breathing":** a hand over her mouth [1].
- **"No footsteps":** white carpet [1].
- **"inside the walls":** her back pressed to the opposite wall [1].
- **Smashing the monitor:** grab, swing, cracked. ACTION [3].
- **"the image stayed there":** the cracked screen still glowing [1].
- **"blank white space":** *CANVAS-BLANK* [1].
- **"pushing outward":** the screen bulges, then white fingertips come through and cast tiny shadows. ACTION [2].
- **Hana shouting:** the phone on the floor [1].
- **Running to the front door:** ACTION [2].
- **"no handle":** her hand on smooth white [1].
- **"no door":** a white rectangle [1].
- **"smooth white rectangle":** her back against it, screaming [1].
- **The impact:** a shake.

#### Scene 10, the recording (talking shots)

- **Talking frames:** a closet wide shot, knees up, phone light, angle E [1, plus mouth 1]; a phone-camera close-up with the CODE `REC` timer, angle F [1, plus mouth 1]; a crying close-up, angle F2 [1, plus mouth 1].
- **Inserts:** the closet door from inside [1], the gap beneath the door [1], and the white walls around her [1].
- **The 3–4 s silence:** on the door gap.
- **"something touching the closet door":** ACTION [2], ending in a faint dent by the handle.

#### Scene 11, the last selection

- **"There's a face":** the door, with a face barely pressing through the white [1].
- **Talking frames:** a terrified, tearful close-up, F3 [1, plus mouth 1]; the final barely-there whisper looking up, F4 [1, plus mouth 1].
- **"looking at me":** her eyes, frozen [1].
- **The bulge inward** [1].
- **"little lines… a selection box… selecting me":** a top-down wide of the closet [1] with CODE marching ants that crawl over the floor and walls and close into a marquee with handles.
- **The giant white cursor:** CODE; it glides in and stops above her.
- **The final click:** CODE pure white, then 3 s of silence.

---

## 6. Cost estimate

| item | images | at $0.20 | at about $0.25 (with references) |
| --- | --- | --- | --- |
| character sheets (Mara turnaround, Mara expressions, the figure) | 3 | $0.60 | $0.75 |
| location references (workroom, hallway, closet, white apartment) | 4 | $0.80 | $1.00 |
| shot frames (stills, action keys, canvas pictures) | 146 | $29.20 | $36.50 |
| mouth variants | 11 | $2.20 | $2.75 |
| thumbnails (3) | 3 | $0.60 | $0.75 |
| retries, about 10% | 17 | $3.40 | $4.25 |
| **images, total** | **184** | **$36.80** | **$46.00** |
| Fish Drama 3: casting, about 6,900 characters plus tags, best-of-3 re-rolls (about 14,000 characters) | – | | **about $0.15** |
| **total** | | **about $37** | **about $46** |

The previous film's $0.20 per image came from single-image edits. This style sends three to five reference images with every request, and those input tokens cost extra. I expect $0.22–0.27 per image.

I'll measure the real figure on the first seven images (the sheets and locations) and report it before going further. **Requested approval: up to $50 for images, plus $0.20 for Fish.** The scripts stop on their own at that cap.

---

## 7. Order of work after your OK

1. **Build.** Copy the engine into `frame240-horror/`, leaving out `node_modules`, `out`, `build`, `public/audio`, `public/restyle`, `public/plates` and `style-samples`. Rename the composition and replace the story data, scenes and layouts. Patch the engine for 24 fps and the `semi2d` restyle mode. Build the new real-recording SFX:
   - the computer fan, rain, the ceiling-light buzz and the closet room tone;
   - pencil on a wall, the stylus, the keyboard and space bar, the mouse click, the chair, the keys;
   - footsteps and running on carpet, knuckle taps on a wooden door, a long scrape, a wet peel, a thud through drywall, a monitor smash;
   - paper being dragged, the phone ring and notification.
2. **Checkpoint: sheets and locations.** Generate the 3 character sheets and 4 locations, send them to you, and **wait for your OK**.
3. **Voices.** Casting reels, Drama 3, QA and re-rolls, `tighten.py`, retime, speech timing.
4. **Edit.** Run `npm run check` and tighten to about 10:00.
5. **Checkpoint: first minute.** Layouts, final art and a render of the first minute, sent to you before the rest.
6. **The rest of the film.** Shot map, keyframes, mouth keys, generation, manifest.
7. **Frame review.** Every frame side by side with its layout and against the sheets; failures regenerated once, then simplified, with the reason noted in a comment.
8. **Full render.** 4 cores, the headless Chromium under `/opt/pw-browsers`, contact-sheet checks, −15 LUFS. Then a 720p preview for you and a 1080p upload copy.
9. **YouTube package.** Title plus 2 alternatives, the description (hook, chapters, disclaimer, 3 hashtags, every CC-BY credit), tags and 3 thumbnails in the style.
10. **Commit and push** after every milestone to `claude/eager-volta-z6vpfo`. No pull request.
