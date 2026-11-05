# The 63rd Passenger - performance script

Generated from `src/data/voiceLines.ts` by `npm run generate-voices -- --scripts-only`.
Use it for human voice actors or as a reference when re-voicing with another provider.

## Cast

- **Narrator** (`narrator`): Adult male documentary storyteller. Warm but serious, close-mic, controlled, neutral international English. Never theatrical.
- **Daniel Clarke** (`daniel`): Male, early 30s. Grounded, tired, normal - slides from disbelief into fear and a hypnotised grief.
- **Emma Clarke** (`emma`): Female, about 30. Natural, grounded, emotionally strong; sleepy and affectionate at first, then protective, angry, terrified, grieving.
- **The Old Woman** (`oldWoman`): Elderly woman. Soft, warm, patient, slightly breathy, slow, affectionate, no urgency. Sounds like someone's grandmother. NOT a monster, witch or demon.
- **Captain** (`captain`): Male, 50s-60s. Authoritative, practical, calm under pressure, professional marine-radio cadence. Never screams.
- **Deckhand (crew 1)** (`crew1`): Young adult male crew member. Professional customer-service voice, slightly tired, increasingly uncomfortable.
- **Steward (crew 2)** (`crew2`): Female crew member, counting heads under her breath.
- **Port Mason Harbor Control** (`harbor`): Calm, professional VTS radio operator. Realistic, slightly compressed, genuinely confused - NOT creepy.
- **PA / Intercom** (`pa`): Female ferry announcement voice. Starts as a normal recorded announcement; each line blends further toward the old woman until the PA filter is almost gone.
- **Police officer** (`police`): Male officer, tired and uncomfortable, trying to be kind.
- **Passengers (crowd fragments)** (`crowd`): Background passengers. Each fragment uses a different voice from CROWD_VOICE_POOL, kept quiet and roomy.

## Scene: hook

**NARRATOR** — "At 12:17 in the morning, the crew of the North Star ferry counted the passengers for the third time."  
<sub>`narrator/narrator_001_hook.wav` · serious · intensity 0.40 · pace 0.98 · fear 0 · fx none</sub>  
_Calm, close, conversational. A storyteller leaning in, not a trailer voice._

**NARRATOR** — "Sixty-three."  
<sub>`narrator/narrator_002_sixty_three.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  
_Subtle weight on the number. Do not punch it._

**NARRATOR** — "The captain looked at the manifest."  
<sub>`narrator/narrator_003_manifest.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-two names."  
<sub>`narrator/narrator_004_sixty_two_names.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "He counted again."  
<sub>`narrator/narrator_005_counted_again.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-three people."  
<sub>`narrator/narrator_006_sixty_three_people.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Nobody had boarded since departure. Nobody had fallen overboard."  
<sub>`narrator/narrator_007_nobody_boarded.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "There was only one conclusion."  
<sub>`narrator/narrator_008_one_conclusion.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Someone on the ferry... wasn't supposed to be there."  
<sub>`narrator/narrator_009_someone.wav` · uneasy · intensity 0.45 · pace 0.88 · fear 0 · fx none</sub>  
_Lower the voice slightly on the second half. Restraint. Do not shout._

**NARRATOR** — "They found her sitting alone at the very back."  
<sub>`narrator/narrator_010_found_her.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "An old woman. Black coat. Hands folded in her lap. Staring out at the ocean."  
<sub>`narrator/narrator_011_old_woman.wav` · serious · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  
_Each fragment its own small picture. Unhurried._

**NARRATOR** — "A crew member approached her."  
<sub>`narrator/narrator_012_approached.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DECKHAND (CREW 1)** — "Ma'am, can I see your ticket?"  
<sub>`crew/crew_001_ticket.wav` · professional · intensity 0.30 · pace 1.00 · fear 0 · fx room</sub>  
_Normal customer-service voice, a little tired. End of a long shift._

**NARRATOR** — "She didn't move."  
<sub>`narrator/narrator_013_didnt_move.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DECKHAND (CREW 1)** — "Ma'am?"  
<sub>`crew/crew_002_maam.wav` · uneasy · intensity 0.35 · pace 0.95 · fear 1 · fx room</sub>  
_Slight uncertainty._

**NARRATOR** — "Slowly... the woman turned around."  
<sub>`narrator/narrator_014_turned.wav` · serious · intensity 0.40 · pace 0.88 · fear 0 · fx none</sub>  

**NARRATOR** — "Her face was pale. Her eyes looked almost gray."  
<sub>`narrator/narrator_015_pale.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "She smiled. And said:"  
<sub>`narrator/narrator_016_smiled.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "I'm not a passenger."  
<sub>`old-woman/oldwoman_001_not_passenger.wav` · matter_of_fact · intensity 0.30 · pace 1.00 · fear 0 · fx none</sub>  
_Matter-of-fact. Mild. Like correcting a small misunderstanding._

**NARRATOR** — "The crew member swallowed."  
<sub>`narrator/narrator_017_swallowed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DECKHAND (CREW 1)** — "Then why are you on the ferry?"  
<sub>`crew/crew_003_why.wav` · uneasy · intensity 0.45 · pace 1.00 · fear 2 · fx room · breath shakyInhale</sub>  
_Now uncomfortable. Trying to stay polite._

**NARRATOR** — "The woman looked past him... toward the people inside."  
<sub>`narrator/narrator_018_looked_past.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "I'm waiting for someone."  
<sub>`old-woman/oldwoman_002_waiting.wav` · unnaturally_calm · intensity 0.35 · pace 0.97 · fear 0 · fx none</sub>  
_Tiny pause before "someone". Warm, patient._

**DECKHAND (CREW 1)** — "Who?"  
<sub>`crew/crew_004_who.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 2 · fx room</sub>  

**NARRATOR** — "Her smile disappeared."  
<sub>`narrator/narrator_019_smile_gone.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Passenger thirty-seven."  
<sub>`old-woman/oldwoman_003_passenger37.wav` · neutral · intensity 0.25 · pace 1.00 · fear 0 · fx none</sub>  
_Neutral. No menace. A fact._

**NARRATOR** — "The crew member checked the manifest."  
<sub>`narrator/narrator_020_checked.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Passenger 37. Daniel Clarke. Seat 18B."  
<sub>`narrator/narrator_021_daniel_clarke.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Alive. Thirty-two years old. Traveling with his wife."  
<sub>`narrator/narrator_022_alive.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "The crew member looked back at the old woman. She was still smiling."  
<sub>`narrator/narrator_023_looked_back.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then she said:"  
<sub>`narrator/narrator_024_then_she_said.wav` · serious · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "He shouldn't have come back."  
<sub>`old-woman/oldwoman_004_shouldnt.wav` · unnaturally_calm · intensity 0.30 · pace 0.95 · fear 0 · fx none</sub>  
_Very quiet. Almost to herself. A little sad._


## Scene: departure

**NARRATOR** — "The North Star left Bell Island at 11:28 PM."  
<sub>`narrator/narrator_025_left.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  
_Lighter. Plain exposition, conversational._

**NARRATOR** — "It was the last ferry of the night."  
<sub>`narrator/narrator_026_last_ferry.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-two passengers. Six crew."  
<sub>`narrator/narrator_027_counts.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Weather was calm. Visibility was good."  
<sub>`narrator/narrator_028_weather.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The crossing normally took fifty minutes."  
<sub>`narrator/narrator_029_crossing.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel and his wife, Emma, had spent three days visiting friends on the island."  
<sub>`narrator/narrator_030_daniel_emma.wav` · warm · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "They were tired."  
<sub>`narrator/narrator_031_tired.wav` · warm · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel sat by the window. Emma fell asleep against his shoulder."  
<sub>`narrator/narrator_032_window.wav` · warm · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Wake me up when we're home."  
<sub>`emma/emma_001_wake_me.wav` · sleepy · intensity 0.30 · pace 0.90 · fear 0 · fx room</sub>  
_Half asleep, mumbled into his shoulder, affectionate._

**DANIEL CLARKE** — "Mm-hm. Go to sleep."  
<sub>`daniel/daniel_001_go_sleep.wav` · tired · intensity 0.25 · pace 0.92 · fear 0 · fx room</sub>  
_Tired, gentle, normal. A man at the end of a holiday._

**NARRATOR** — "Nothing unusual happened for the first thirty minutes."  
<sub>`narrator/narrator_033_nothing_unusual.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then one of the crew members began the routine passenger count."  
<sub>`narrator/narrator_034_routine_count.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "He reached sixty-two. Normal."  
<sub>`narrator/narrator_035_reached_62.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "A few minutes later... he counted again."  
<sub>`narrator/narrator_036_few_minutes.wav` · serious · intensity 0.40 · pace 0.96 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-three."  
<sub>`narrator/narrator_037_sixty_three.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "He frowned. Started over."  
<sub>`narrator/narrator_038_frowned.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-three."  
<sub>`narrator/narrator_039_sixty_three_b.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "He called another crew member. She counted."  
<sub>`narrator/narrator_040_called.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**STEWARD (CREW 2)** — "Sixty-one... sixty-two... sixty-three."  
<sub>`crew/crew2_001_count.wav` · uneasy · intensity 0.30 · pace 0.95 · fear 1 · fx room</sub>  
_Counting under her breath; the last number slows down._

**NARRATOR** — "They checked the boarding list. Sixty-two."  
<sub>`narrator/narrator_041_boarding_list.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Nobody understood it."  
<sub>`narrator/narrator_042_nobody_understood.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Then they noticed the woman."  
<sub>`narrator/narrator_043_noticed.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**NARRATOR** — "She was sitting on a bench at the rear of the ferry. Alone."  
<sub>`narrator/narrator_044_bench.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Nobody remembered seeing her board."  
<sub>`narrator/narrator_045_nobody_remembered.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "No luggage. No handbag. No ticket in her hand."  
<sub>`narrator/narrator_046_no_luggage.wav` · uneasy · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Just the black coat. And those folded hands."  
<sub>`narrator/narrator_047_just_coat.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  


## Scene: recognition

**NARRATOR** — "The first crew member approached her. That was when she said she was waiting for Passenger 37."  
<sub>`narrator/narrator_048_approached.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel Clarke."  
<sub>`narrator/narrator_049_daniel.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The crew immediately went looking for him."  
<sub>`narrator/narrator_050_looking.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "They found Daniel still sitting beside Emma."  
<sub>`narrator/narrator_051_found_daniel.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DECKHAND (CREW 1)** — "Sir, do you know an elderly woman in a black coat?"  
<sub>`crew/crew_005_sir.wav` · professional · intensity 0.35 · pace 1.00 · fear 1 · fx room</sub>  
_Polite, procedural, a bit embarrassed to ask._

**NARRATOR** — "Daniel laughed."  
<sub>`narrator/narrator_052_laughed.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "No."  
<sub>`daniel/daniel_002_no.wav` · amused · intensity 0.30 · pace 1.00 · fear 0 · fx room</sub>  
_Easy, amused. Who would he know on a ferry at midnight?_

**NARRATOR** — "Then he saw her."  
<sub>`narrator/narrator_053_saw_her.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "His face changed instantly. Emma noticed."  
<sub>`narrator/narrator_054_face_changed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Daniel?"  
<sub>`emma/emma_002_daniel.wav` · confused · intensity 0.30 · pace 1.00 · fear 1 · fx room</sub>  
_Soft concern._

**NARRATOR** — "He didn't answer."  
<sub>`narrator/narrator_055_didnt_answer.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The woman lifted one hand. And gave him a tiny wave."  
<sub>`narrator/narrator_056_wave.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel stood up. Emma grabbed his arm."  
<sub>`narrator/narrator_057_stood.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "What is it?"  
<sub>`emma/emma_003_what_is_it.wav` · confused · intensity 0.40 · pace 1.00 · fear 1 · fx room</sub>  

**NARRATOR** — "Daniel whispered:"  
<sub>`narrator/narrator_058_whispered.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "That looks like my grandmother."  
<sub>`daniel/daniel_003_grandmother.wav` · confused · intensity 0.45 · pace 0.92 · fear 2 · fx whisper · breath shakyInhale</sub>  
_Confused, not theatrical. Half whispered, as if saying it out loud makes it real._

**NARRATOR** — "Emma stared at him."  
<sub>`narrator/narrator_059_stared.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "So?"  
<sub>`emma/emma_004_so.wav` · confused · intensity 0.30 · pace 1.00 · fear 1 · fx room</sub>  
_Normal confusion._

**NARRATOR** — "Daniel looked sick."  
<sub>`narrator/narrator_060_sick.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "She died twelve years ago."  
<sub>`daniel/daniel_004_died.wav` · afraid · intensity 0.40 · pace 0.90 · fear 3 · fx room</sub>  
_Quiet. Flat with shock._

**NARRATOR** — "Emma laughed because she thought he was joking."  
<sub>`narrator/narrator_061_laughed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel wasn't."  
<sub>`narrator/narrator_062_wasnt.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "His grandmother had practically raised him."  
<sub>`narrator/narrator_063_raised.wav` · warm · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "He knew her face. Her posture. The way she tilted her head when she smiled. Everything."  
<sub>`narrator/narrator_064_knew.wav` · warm · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "The only difference... was that she looked exactly as she had on the day she died."  
<sub>`narrator/narrator_065_only_difference.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "Same coat. Same hairstyle. Same silver brooch."  
<sub>`narrator/narrator_066_same.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel took one step toward her. Emma pulled him back."  
<sub>`narrator/narrator_067_step.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "No."  
<sub>`emma/emma_005_no.wav` · protective · intensity 0.60 · pace 1.00 · fear 2 · fx room</sub>  
_Immediate survival reaction. Low, firm._

**NARRATOR** — "The old woman smiled again."  
<sub>`narrator/narrator_068_smiled.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then every light on the ferry flickered."  
<sub>`narrator/narrator_069_flickered.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Once. Twice."  
<sub>`narrator/narrator_070_once_twice.wav` · serious · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Darkness."  
<sub>`narrator/narrator_071_darkness.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "People screamed."  
<sub>`narrator/narrator_072_screamed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Three seconds later... the lights returned."  
<sub>`narrator/narrator_073_three_seconds.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The bench was empty."  
<sub>`narrator/narrator_074_bench_empty.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "The woman was gone."  
<sub>`narrator/narrator_075_gone.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  


## Scene: erasure

**NARRATOR** — "Crew checked the rear deck. Nothing."  
<sub>`narrator/narrator_076_rear_deck.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "Bathrooms. Nothing."  
<sub>`narrator/narrator_077_bathrooms.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "Storage rooms. Nothing."  
<sub>`narrator/narrator_078_storage.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "They searched the entire vessel. She had vanished."  
<sub>`narrator/narrator_079_searched.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain ordered another passenger count."  
<sub>`narrator/narrator_080_another_count.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Sixty-two."  
<sub>`narrator/narrator_081_sixty_two.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Everyone relaxed."  
<sub>`narrator/narrator_082_relaxed.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then the purser looked at the manifest. And went completely still."  
<sub>`narrator/narrator_083_purser.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "There were now... sixty-one names."  
<sub>`narrator/narrator_084_sixty_one.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel Clarke was gone."  
<sub>`narrator/narrator_085_daniel_gone.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "Not physically. Daniel was standing right there."  
<sub>`narrator/narrator_086_not_physically.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "But his name had disappeared from the passenger list."  
<sub>`narrator/narrator_087_disappeared.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "They refreshed the system. Sixty-one passengers."  
<sub>`narrator/narrator_088_refreshed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel showed them his digital ticket. The QR code was blank."  
<sub>`narrator/narrator_089_ticket.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "He opened the booking email. Gone."  
<sub>`narrator/narrator_090_email.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma opened the reservation on her phone. Her booking showed:"  
<sub>`narrator/narrator_091_reservation.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "One passenger. Emma Clarke."  
<sub>`narrator/narrator_092_one_passenger.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel stared at the screen."  
<sub>`narrator/narrator_093_stared.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "That's impossible."  
<sub>`daniel/daniel_005_impossible.wav` · afraid · intensity 0.60 · pace 1.08 · fear 3 · fx room · breath fastBreathing</sub>  
_Sharper. Faster breathing. Controlled fear starting to slip._

**NARRATOR** — "The captain asked for identification."  
<sub>`narrator/narrator_094_identification.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel handed over his driver's license."  
<sub>`narrator/narrator_095_license.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain looked at it. Then at Daniel. Then back at the card."  
<sub>`narrator/narrator_096_looked.wav` · serious · intensity 0.40 · pace 0.96 · fear 0 · fx none</sub>  

**NARRATOR** — "The photograph was Daniel."  
<sub>`narrator/narrator_097_photo.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The name said:"  
<sub>`narrator/narrator_098_name_said.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Unknown."  
<sub>`narrator/narrator_099_unknown.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel grabbed it. The name was gone."  
<sub>`narrator/narrator_100_grabbed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma started shouting."  
<sub>`narrator/narrator_101_shouting.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "This isn't funny!"  
<sub>`emma/emma_006_not_funny.wav` · angry · intensity 0.75 · pace 1.08 · fear 3 · fx shout</sub>  
_Angry and scared, aimed at the crew. Not a scream._

**NARRATOR** — "Nobody was laughing."  
<sub>`narrator/narrator_102_nobody_laughing.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  


## Scene: hull

**NARRATOR** — "Then something hit the underside of the ferry."  
<sub>`narrator/narrator_103_hit.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Everyone stopped."  
<sub>`narrator/narrator_104_stopped.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Another impact."  
<sub>`narrator/narrator_105_another.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then another."  
<sub>`narrator/narrator_106_then_another.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "From beneath them."  
<sub>`narrator/narrator_107_beneath.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain looked toward the crew."  
<sub>`narrator/narrator_108_captain_crew.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "There was nothing on radar. No debris. No shallow water. They were in open sea."  
<sub>`narrator/narrator_109_radar.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then the knocking started."  
<sub>`narrator/narrator_110_knocking.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**NARRATOR** — "Not one knock. Many. All along the hull."  
<sub>`narrator/narrator_111_not_one.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Passengers moved away from the windows."  
<sub>`narrator/narrator_112_moved_away.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Somebody screamed."  
<sub>`narrator/narrator_113_screamed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then the PA system switched on."  
<sub>`narrator/narrator_114_pa_on.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "A woman's voice filled the ferry."  
<sub>`narrator/narrator_115_womans_voice.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PA / INTERCOM** — "Passenger thirty-seven."  
<sub>`pa/pa_001_passenger37.wav` · professional · intensity 0.25 · pace 1.00 · fear 0 · fx pa</sub>  
_A normal recorded ferry announcement._

**NARRATOR** — "Daniel went pale."  
<sub>`narrator/narrator_116_pale.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PA / INTERCOM** — "Please proceed to the rear deck."  
<sub>`pa/pa_002_proceed.wav` · professional · intensity 0.25 · pace 1.00 · fear 0 · fx pa</sub>  
_Still normal. Polite routine announcement._

**NARRATOR** — "Emma grabbed him."  
<sub>`narrator/narrator_117_grabbed.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "No."  
<sub>`emma/emma_007_no.wav` · afraid · intensity 0.55 · pace 1.00 · fear 3 · fx room · breath sharpInhale</sub>  

**PA / INTERCOM** — "Passenger thirty-seven..."  
<sub>`pa/pa_003_passenger37_soft.wav` · warm · intensity 0.30 · pace 0.92 · fear 0 · fx pa</sub>  
_Softer. The announcement voice is starting to sound like someone._

**NARRATOR** — "Then the voice changed. It became softer. Almost affectionate."  
<sub>`narrator/narrator_118_voice_changed.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**PA / INTERCOM** — "Daniel."  
<sub>`pa/pa_004_daniel.wav` · affectionate · intensity 0.35 · pace 0.90 · fear 0 · fx paSoft</sub>  
_Personal. Saying his name like family._

**NARRATOR** — "He started shaking."  
<sub>`narrator/narrator_119_shaking.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PA / INTERCOM** — "Your family is waiting."  
<sub>`pa/pa_005_family.wav` · affectionate · intensity 0.35 · pace 0.90 · fear 0 · fx paIntimate</sub>  
_Almost no PA filter now. Close and kind._

**NARRATOR** — "The captain turned the PA system off. The voice continued."  
<sub>`narrator/narrator_120_turned_off.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Daniel..."  
<sub>`old-woman/pa_006_daniel_2.wav` · affectionate · intensity 0.30 · pace 1.00 · fear 0 · fx paIntimate</sub>  
_Patient. Calling a child in for dinner._

**NARRATOR** — "The captain pulled the power cable. Still:"  
<sub>`narrator/narrator_121_cable.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Daniel..."  
<sub>`old-woman/pa_007_daniel_3.wav` · affectionate · intensity 0.30 · pace 0.95 · fear 0 · fx paIntimate</sub>  

**NARRATOR** — "Now the voice was coming from every speaker. Every radio. Every passenger's phone."  
<sub>`narrator/narrator_122_every_speaker.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Daniel..."  
<sub>`old-woman/pa_008_daniel_4.wav` · affectionate · intensity 0.30 · pace 1.00 · fear 0 · fx multiSpeaker</sub>  
_The same tender voice from everywhere at once._

**NARRATOR** — "One by one, phone screens lit up."  
<sub>`narrator/narrator_123_phones.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "No signal. No network. But every screen displayed the same message:"  
<sub>`narrator/narrator_124_no_signal.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel backed away. Emma held him."  
<sub>`narrator/narrator_125_backed_away.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  


## Scene: navigation

**NARRATOR** — "Then the ferry's engines slowed."  
<sub>`narrator/narrator_126_engines.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain rushed to the bridge."  
<sub>`narrator/narrator_127_rushed.wav` · serious · intensity 0.40 · pace 1.03 · fear 0 · fx none</sub>  

**NARRATOR** — "The navigation screen had gone blank."  
<sub>`narrator/narrator_128_nav_blank.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "GPS lost. Compass spinning. Radar empty."  
<sub>`narrator/narrator_129_gps.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "He looked out through the windshield."  
<sub>`narrator/narrator_130_windshield.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "No coastline. No lights. Nothing."  
<sub>`narrator/narrator_131_no_coast.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "They should have been ten minutes from port."  
<sub>`narrator/narrator_132_ten_minutes.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Instead... there was black ocean in every direction."  
<sub>`narrator/narrator_133_instead.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain radioed the harbor."  
<sub>`narrator/narrator_134_radioed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**CAPTAIN** — "Port Mason Control, this is North Star Eight. Do you copy?"  
<sub>`captain/captain_001_radio_call.wav` · professional · intensity 0.30 · pace 1.00 · fear 1 · fx room</sub>  
_Professional marine-radio cadence. Calm, procedural._

**CAPTAIN** — "Port Mason, North Star Eight."  
<sub>`captain/captain_002_radio_again.wav` · professional · intensity 0.35 · pace 1.00 · fear 1 · fx room</sub>  

**NARRATOR** — "A voice answered."  
<sub>`narrator/narrator_135_answered.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PORT MASON HARBOR CONTROL** — "North Star Eight, go ahead."  
<sub>`harbor/harbor_001_go_ahead.wav` · professional · intensity 0.20 · pace 1.00 · fear 0 · fx marineRadio</sub>  

**NARRATOR** — "The captain exhaled."  
<sub>`narrator/narrator_136_exhaled.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**CAPTAIN** — "We appear to have lost navigation. Request position check."  
<sub>`captain/captain_003_lost_nav.wav` · professional · intensity 0.30 · pace 1.00 · fear 1 · fx room · breath exhale</sub>  

**PORT MASON HARBOR CONTROL** — "North Star Eight... confirm vessel identification."  
<sub>`harbor/harbor_002_confirm.wav` · confused · intensity 0.25 · pace 1.00 · fear 0 · fx marineRadio</sub>  
_Slight hesitation. Checking something on a screen._

**CAPTAIN** — "North Star Eight."  
<sub>`captain/captain_004_ns8.wav` · confused · intensity 0.30 · pace 1.00 · fear 1 · fx room</sub>  

**NARRATOR** — "Another pause. The harbor operator sounded confused."  
<sub>`narrator/narrator_137_another_pause.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PORT MASON HARBOR CONTROL** — "Captain..."  
<sub>`harbor/harbor_003_captain.wav` · confused · intensity 0.30 · pace 0.95 · fear 0 · fx marineRadio</sub>  

**PORT MASON HARBOR CONTROL** — "North Star Eight docked twenty-three minutes ago."  
<sub>`harbor/harbor_004_docked.wav` · confused · intensity 0.35 · pace 0.96 · fear 0 · fx marineRadio</sub>  
_Genuinely confused. Realistic. Not spooky._

**NARRATOR** — "Nobody on the bridge spoke."  
<sub>`narrator/narrator_138_nobody_spoke.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain looked out at the black ocean."  
<sub>`narrator/narrator_139_looked_out.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**CAPTAIN** — "Negative. We're still at sea."  
<sub>`captain/captain_005_negative.wav` · confused · intensity 0.40 · pace 0.95 · fear 2 · fx room</sub>  
_Controlled confusion. He does not raise his voice._

**NARRATOR** — "The operator answered:"  
<sub>`narrator/narrator_140_operator.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**PORT MASON HARBOR CONTROL** — "Sir, I'm looking at your vessel right now."  
<sub>`harbor/harbor_005_looking.wav` · confused · intensity 0.35 · pace 1.00 · fear 0 · fx marineRadio</sub>  
_Plain, a little worried for him._


## Scene: otherFerry

**NARRATOR** — "The captain thought it was some kind of radio error."  
<sub>`narrator/narrator_141_radio_error.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then harbor control sent a photograph through the marine system."  
<sub>`narrator/narrator_142_photograph.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The image loaded slowly."  
<sub>`narrator/narrator_143_loaded.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "The North Star. Docked at Port Mason. Passengers walking off."  
<sub>`narrator/narrator_144_north_star.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Timestamp: 12:26 AM."  
<sub>`narrator/narrator_145_timestamp.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The current time was 12:49."  
<sub>`narrator/narrator_146_current_time.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The captain zoomed in."  
<sub>`narrator/narrator_147_zoomed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "There he was. Walking down the gangway. Same uniform. Same face."  
<sub>`narrator/narrator_148_there_he_was.wav` · uneasy · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Beside him were the same crew. Then the passengers."  
<sub>`narrator/narrator_149_same_crew.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma."  
<sub>`narrator/narrator_150_emma.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel stared over the captain's shoulder."  
<sub>`narrator/narrator_151_shoulder.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma was in the photograph. Alone."  
<sub>`narrator/narrator_152_alone.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel was missing."  
<sub>`narrator/narrator_153_missing.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Then somebody pointed."  
<sub>`narrator/narrator_154_pointed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "At the very end of the gangway... stood the old woman."  
<sub>`narrator/narrator_155_end_gangway.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Black coat. Watching the camera."  
<sub>`narrator/narrator_156_watching.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  


## Scene: grandmotherCalls

**NARRATOR** — "Daniel suddenly turned toward the rear of the ferry. Emma grabbed him."  
<sub>`narrator/narrator_157_turned.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Where are you going?"  
<sub>`emma/emma_008_where.wav` · protective · intensity 0.55 · pace 1.06 · fear 3 · fx room</sub>  

**NARRATOR** — "He didn't answer. He could hear something."  
<sub>`narrator/narrator_158_didnt_answer.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Not the announcement. A voice. His grandmother's voice."  
<sub>`narrator/narrator_159_not_announcement.wav` · uneasy · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Quiet. Coming from outside."  
<sub>`narrator/narrator_160_quiet.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Daniel."  
<sub>`old-woman/oldwoman_005_daniel.wav` · warm · intensity 0.30 · pace 1.00 · fear 0 · fx distant</sub>  
_From outside, behind him. Calm, like calling him in from the garden._

**NARRATOR** — "He began walking. Emma pulled harder."  
<sub>`narrator/narrator_161_walking.wav` · serious · intensity 0.40 · pace 1.03 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Stop!"  
<sub>`emma/emma_009_stop.wav` · protective · intensity 0.70 · pace 1.00 · fear 4 · fx shout</sub>  

**NARRATOR** — "He looked at her. Tears in his eyes."  
<sub>`narrator/narrator_162_looked_at_her.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "She used to say that."  
<sub>`daniel/daniel_006_used_to_say.wav` · grieving · intensity 0.55 · pace 0.88 · fear 3 · fx room · breath cryingBreath</sub>  
_Voice cracking slightly. Vulnerable, not dramatic._

**EMMA CLARKE** — "What?"  
<sub>`emma/emma_010_what.wav` · afraid · intensity 0.45 · pace 1.05 · fear 3 · fx room</sub>  

**DANIEL CLARKE** — "Exactly like that."  
<sub>`daniel/daniel_007_exactly.wav` · hypnotized · intensity 0.40 · pace 0.85 · fear 3 · fx whisper</sub>  
_Almost a whisper._

**EMMA CLARKE** — "Daniel, she's dead."  
<sub>`emma/emma_011_shes_dead.wav` · afraid · intensity 0.60 · pace 1.00 · fear 4 · fx room · breath fastBreathing</sub>  
_Firm but frightened. Trying to pull him back to reality._

**NARRATOR** — "He nodded."  
<sub>`narrator/narrator_163_nodded.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**DANIEL CLARKE** — "I know."  
<sub>`daniel/daniel_008_i_know.wav` · grieving · intensity 0.45 · pace 0.85 · fear 3 · fx room</sub>  

**NARRATOR** — "Then the old woman's voice came again."  
<sub>`narrator/narrator_164_again.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Daniel..."  
<sub>`old-woman/oldwoman_006_daniel_2.wav` · warm · intensity 0.30 · pace 1.00 · fear 0 · fx distant</sub>  
_Closer than before. Still unhurried._

**NARRATOR** — "He covered his ears."  
<sub>`narrator/narrator_165_covered.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The voice changed. Now it sounded younger. Kinder."  
<sub>`narrator/narrator_166_changed.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Come here, sweetheart."  
<sub>`old-woman/oldwoman_007_sweetheart.wav` · comforting · intensity 0.40 · pace 1.04 · fear 0 · fx none</sub>  
_Genuinely comforting. Loving. Younger and kinder than before._

**NARRATOR** — "Daniel started crying."  
<sub>`narrator/narrator_167_crying.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma slapped him. Hard."  
<sub>`narrator/narrator_168_slapped.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "He blinked. For a second... the voice stopped."  
<sub>`narrator/narrator_169_blinked.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Then someone screamed from the rear deck."  
<sub>`narrator/narrator_170_screamed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  


## Scene: peopleInWater

**NARRATOR** — "The old woman was back. Standing beside the railing."  
<sub>`narrator/narrator_171_back.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "This time... she wasn't alone."  
<sub>`narrator/narrator_172_not_alone.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "There were people in the water."  
<sub>`narrator/narrator_173_people.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Dozens of them. Floating upright."  
<sub>`narrator/narrator_174_dozens.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Not swimming. Just standing in the black ocean."  
<sub>`narrator/narrator_175_not_swimming.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Their heads and shoulders above the surface. All facing the ferry."  
<sub>`narrator/narrator_176_heads.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "The sea was perfectly still."  
<sub>`narrator/narrator_177_still.wav` · uneasy · intensity 0.40 · pace 0.88 · fear 0 · fx none</sub>  

**NARRATOR** — "One of them raised an arm."  
<sub>`narrator/narrator_178_raised.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Then another."  
<sub>`narrator/narrator_179_another.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Then all of them."  
<sub>`narrator/narrator_180_all.wav` · uneasy · intensity 0.40 · pace 0.88 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel stared."  
<sub>`narrator/narrator_181_stared.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The old woman smiled."  
<sub>`narrator/narrator_182_smiled.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "See?"  
<sub>`old-woman/oldwoman_008_see.wav` · warm · intensity 0.30 · pace 1.00 · fear 0 · fx none</sub>  
_Soft. Pleased, like showing a child a surprise._

**NARRATOR** — "She pointed toward the water."  
<sub>`narrator/narrator_183_pointed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**THE OLD WOMAN** — "Everyone came back."  
<sub>`old-woman/oldwoman_009_everyone.wav` · unnaturally_calm · intensity 0.30 · pace 0.95 · fear 0 · fx none</sub>  
_Calm. Content. As if this is good news._


## Scene: vanish

**NARRATOR** — "The ferry lights died."  
<sub>`narrator/narrator_184_lights_died.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Total darkness."  
<sub>`narrator/narrator_185_darkness.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Passengers screamed."  
<sub>`narrator/narrator_186_screamed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma held Daniel's arm with both hands."  
<sub>`narrator/narrator_187_held.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Something struck the side of the ferry. Hard."  
<sub>`narrator/narrator_188_struck.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "Then another impact."  
<sub>`narrator/narrator_189_another_impact.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then something began climbing."  
<sub>`narrator/narrator_190_climbing.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Against the metal hull. From below. All around them."  
<sub>`narrator/narrator_191_against.wav` · uneasy · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "People ran."  
<sub>`narrator/narrator_192_ran.wav` · serious · intensity 0.40 · pace 1.05 · fear 0 · fx none</sub>  

**NARRATOR** — "Emergency lights switched on. Red."  
<sub>`narrator/narrator_193_emergency.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel was gone."  
<sub>`narrator/narrator_194_gone.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma looked down. Her hands were empty."  
<sub>`narrator/narrator_195_looked_down.wav` · serious · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Daniel?!"  
<sub>`emma/emma_012_scream.wav` · screaming · intensity 1.00 · pace 1.00 · fear 5 · fx shout · breath raggedBreathing</sub>  
_One of the rare real screams. Raw. Ragged breathing afterwards._

**NARRATOR** — "She screamed his name."  
<sub>`narrator/narrator_196_screamed_name.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "Daniel!"  
<sub>`emma/emma_013_daniel_2.wav` · panicked · intensity 0.85 · pace 1.00 · fear 5 · fx shout</sub>  
_Turning in the dark, calling into the ship._

**NARRATOR** — "No answer."  
<sub>`narrator/narrator_197_no_answer.wav` · serious · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "She ran to the railing."  
<sub>`narrator/narrator_198_railing.wav` · serious · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "The old woman was gone too."  
<sub>`narrator/narrator_199_gone_too.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The ocean was empty. No floating people. No splash. No Daniel."  
<sub>`narrator/narrator_200_ocean_empty.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "Nothing."  
<sub>`narrator/narrator_201_nothing.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Then the engines suddenly roared back to life."  
<sub>`narrator/narrator_202_engines.wav` · serious · intensity 0.40 · pace 1.03 · fear 0 · fx none</sub>  

**NARRATOR** — "GPS returned. Radar returned."  
<sub>`narrator/narrator_203_gps.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The navigation screen showed: PORT MASON — 4.7 KM."  
<sub>`narrator/narrator_204_nav_showed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Five minutes later... they saw the harbor lights."  
<sub>`narrator/narrator_205_harbor_lights.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  


## Scene: police

**NARRATOR** — "Police were waiting when the ferry docked."  
<sub>`narrator/narrator_206_police_waiting.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma told them everything."  
<sub>`narrator/narrator_207_told.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel. The woman. The passenger count. The announcement. The people in the water."  
<sub>`narrator/narrator_208_list.wav` · neutral · intensity 0.40 · pace 1.02 · fear 0 · fx none</sub>  

**NARRATOR** — "The officers checked the manifest. Sixty-one passengers. No Daniel Clarke."  
<sub>`narrator/narrator_209_checked.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "They searched the booking database. Nothing."  
<sub>`narrator/narrator_210_database.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma showed them photographs. Wedding photos. Holiday pictures. Birthdays."  
<sub>`narrator/narrator_211_photographs.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "In every photograph... Emma was alone."  
<sub>`narrator/narrator_212_every.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "At their wedding... she stood by herself at the altar."  
<sub>`narrator/narrator_213_wedding.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "On their honeymoon... she sat alone at dinner."  
<sub>`narrator/narrator_214_honeymoon.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "At Christmas... an empty chair beside her."  
<sub>`narrator/narrator_215_christmas.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma screamed:"  
<sub>`narrator/narrator_216_emma_screamed.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**EMMA CLARKE** — "He's my husband!"  
<sub>`emma/emma_014_husband.wav` · grieving · intensity 0.85 · pace 1.00 · fear 4 · fx shout · breath cryingBreath</sub>  
_Grief and frustration. Nobody believes her._

**NARRATOR** — "Police checked government records."  
<sub>`narrator/narrator_217_records.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma Clarke. Thirty years old. Single. Never married."  
<sub>`narrator/narrator_218_record.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "She pulled Daniel's wedding ring from her pocket."  
<sub>`narrator/narrator_219_ring.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The officer looked uncomfortable."  
<sub>`narrator/narrator_220_uncomfortable.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**POLICE OFFICER** — "Whose is that?"  
<sub>`police/police_001_whose.wav` · professional · intensity 0.30 · pace 1.00 · fear 0 · fx room</sub>  
_Careful, gentle, uncomfortable._

**EMMA CLARKE** — "My husband's!"  
<sub>`emma/emma_015_husbands.wav` · grieving · intensity 0.75 · pace 1.00 · fear 4 · fx shout</sub>  

**POLICE OFFICER** — "Ma'am..."  
<sub>`police/police_002_maam.wav` · professional · intensity 0.30 · pace 0.90 · fear 0 · fx room</sub>  
_Sympathetic. He does not know what to say._

**NARRATOR** — "He turned the ring over. There was an engraving inside."  
<sub>`narrator/narrator_221_turned_ring.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma expected: D + E."  
<sub>`narrator/narrator_222_expected.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Instead it said:"  
<sub>`narrator/narrator_223_instead.wav` · serious · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "37."  
<sub>`narrator/narrator_224_37.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  


## Scene: cctv

**NARRATOR** — "Security footage from the ferry was reviewed the next morning."  
<sub>`narrator/narrator_225_security.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "For most of the crossing... Emma could be seen sitting beside an empty seat."  
<sub>`narrator/narrator_226_most.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Talking. Laughing. Resting her head against nothing."  
<sub>`narrator/narrator_227_talking.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**NARRATOR** — "At 12:17 AM... the footage distorted."  
<sub>`narrator/narrator_228_1217.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "One frame. Just one."  
<sub>`narrator/narrator_229_one_frame.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Daniel appeared beside her. Looking directly into the camera."  
<sub>`narrator/narrator_230_appeared.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**NARRATOR** — "Behind his seat... the old woman stood with both hands on his shoulders."  
<sub>`narrator/narrator_231_behind.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "The next frame... he was gone again."  
<sub>`narrator/narrator_232_next_frame.wav` · uneasy · intensity 0.40 · pace 0.92 · fear 0 · fx none</sub>  

**NARRATOR** — "Investigators never found an explanation."  
<sub>`narrator/narrator_233_never.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The ferry company replaced the camera system."  
<sub>`narrator/narrator_234_replaced.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The crew refused to work overnight crossings."  
<sub>`narrator/narrator_235_refused.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma stopped taking ferries entirely."  
<sub>`narrator/narrator_236_stopped.wav` · warm · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  


## Scene: finale

**NARRATOR** — "For almost a year... nothing happened."  
<sub>`narrator/narrator_237_year.wav` · neutral · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "Then one afternoon... Emma received a photograph from an unknown number."  
<sub>`narrator/narrator_238_afternoon.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "It showed the North Star ferry. Bright daylight. Crowded deck."  
<sub>`narrator/narrator_239_showed.wav` · neutral · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Emma almost deleted it."  
<sub>`narrator/narrator_240_almost_deleted.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then she zoomed in."  
<sub>`narrator/narrator_241_zoomed.wav` · serious · intensity 0.40 · pace 0.95 · fear 0 · fx none</sub>  

**NARRATOR** — "At the very back... the old woman was sitting on the same bench."  
<sub>`narrator/narrator_242_very_back.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "And beside her... was Daniel."  
<sub>`narrator/narrator_243_beside.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Same clothes. Same face. Exactly as he had looked the night he vanished."  
<sub>`narrator/narrator_244_same_clothes.wav` · uneasy · intensity 0.40 · pace 0.94 · fear 0 · fx none</sub>  

**NARRATOR** — "He was staring directly at the camera. One finger pressed against his lips."  
<sub>`narrator/narrator_245_staring.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "A message arrived."  
<sub>`narrator/narrator_246_message.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "DON'T LET HER COUNT YOU."  
<sub>`narrator/narrator_247_dont_let.wav` · whispering · intensity 0.40 · pace 0.88 · fear 0 · fx none</sub>  
_Read the message quietly, almost under the breath._

**NARRATOR** — "Emma's phone rang. Unknown number."  
<sub>`narrator/narrator_248_rang.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "She didn't answer."  
<sub>`narrator/narrator_249_didnt_answer.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "It stopped."  
<sub>`narrator/narrator_250_stopped.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "Then rang again."  
<sub>`narrator/narrator_251_again.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "She switched the phone off."  
<sub>`narrator/narrator_252_switched_off.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "The screen went black."  
<sub>`narrator/narrator_253_black.wav` · serious · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "For several seconds... nothing."  
<sub>`narrator/narrator_254_several.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  

**NARRATOR** — "Then the screen turned itself back on."  
<sub>`narrator/narrator_255_turned_on.wav` · uneasy · intensity 0.40 · pace 1.00 · fear 0 · fx none</sub>  

**NARRATOR** — "No call. No message. Just one number."  
<sub>`narrator/narrator_256_no_call.wav` · uneasy · intensity 0.40 · pace 0.93 · fear 0 · fx none</sub>  

**NARRATOR** — "And from somewhere behind Emma... an old woman's voice whispered:"  
<sub>`narrator/narrator_257_behind.wav` · uneasy · intensity 0.40 · pace 0.90 · fear 0 · fx none</sub>  
_Lowest, quietest narration in the piece._

**THE OLD WOMAN** — "Sixty-four."  
<sub>`old-woman/oldwoman_final_64.wav` · whispering · intensity 0.35 · pace 0.90 · fear 0 · fx whisperClose</sub>  
_Whispered very close to Emma, slightly behind and to the right. Calm. Not a monster. A grandmother counting._


## Scene: crowd

**PASSENGERS (CROWD FRAGMENTS)** — "Who is she?"  
<sub>`crowd/crowd_001_who_is_she.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "What happened?"  
<sub>`crowd/crowd_002_what_happened.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "What's going on?"  
<sub>`crowd/crowd_003_whats_going_on.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Did you feel that?"  
<sub>`crowd/crowd_004_feel_that.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Why did the lights go out?"  
<sub>`crowd/crowd_005_lights.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Oh my God..."  
<sub>`crowd/crowd_006_oh_god.wav` · afraid · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Get away from the windows!"  
<sub>`crowd/crowd_007_windows.wav` · panicked · intensity 0.40 · pace 1.00 · fear 0 · fx shout</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Where's the crew? Somebody get the crew!"  
<sub>`crowd/crowd_008_crew.wav` · panicked · intensity 0.40 · pace 1.00 · fear 0 · fx shout</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Help! Somebody help!"  
<sub>`crowd/crowd_009_help.wav` · panicked · intensity 0.40 · pace 1.00 · fear 0 · fx shout</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "What is that?"  
<sub>`crowd/crowd_010_what_is_that.wav` · afraid · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "It's under us. It's under us!"  
<sub>`crowd/crowd_011_under_us.wav` · panicked · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Everyone stay calm, please. Stay in your seats."  
<sub>`crowd/crowd_012_stay_calm.wav` · authoritative · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "My phone... what is this? It says thirty-seven."  
<sub>`crowd/crowd_013_phone.wav` · confused · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Look... look at the water."  
<sub>`crowd/crowd_014_look.wav` · afraid · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  

**PASSENGERS (CROWD FRAGMENTS)** — "Mum? Mum!"  
<sub>`crowd/crowd_015_mum.wav` · panicked · intensity 0.40 · pace 1.00 · fear 0 · fx crowdRoom</sub>  
