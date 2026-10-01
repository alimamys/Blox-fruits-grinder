# Auto Grind: NPC grinding system for your own Roblox game

An auto-grind / auto-quest system written in Luau for a Roblox game you own. It plays like an anime grinder: press **Auto Grind** and your character finds, approaches, attacks and kills NPCs one after another. **Auto Quest** picks the best quest for your level and turns it in.

It only uses standard Roblox APIs: PathfindingService, `Humanoid:MoveTo`, RemoteEvents and server-side damage. It has no exploits, no executors, no teleporting and no third-party game code. **All damage, kill counting, quest progress and rewards are handled on the server.**

---

## 1. Explorer hierarchy

```
ReplicatedStorage
├── Remotes                         Folder
│   ├── AttackEnemy                 RemoteEvent
│   └── QuestRemote                 RemoteEvent
└── Shared                          Folder
    ├── GameConfig                  ModuleScript   (all tunable values)
    ├── EnemyUtil                   ModuleScript   (getNearestEnemy / isValidEnemy)
    └── AutoGrindState              ModuleScript   (client state shared by controller + GUI)

ServerScriptService
├── CombatServer                    Script
├── QuestServer                     Script
├── EnemyServer                     Script
└── Modules                         Folder
    ├── EnemySpawner                ModuleScript
    ├── EnemyAI                     ModuleScript
    ├── QuestManager                ModuleScript
    ├── QuestData                   ModuleScript
    ├── PlayerData                  ModuleScript
    ├── Remotes                     ModuleScript
    └── RateLimiter                 ModuleScript

ServerStorage
└── EnemyTemplates                  Folder
    ├── Bandit                      Model  (Humanoid + HumanoidRootPart)
    └── DesertBandit                Model  (Humanoid + HumanoidRootPart)

Workspace
├── Enemies                         Folder  (live NPCs; filled at runtime)
└── EnemySpawns                     Folder
    ├── BanditSpawn1..3             Part    attrs: EnemyType="Bandit", RespawnTime=5
    └── DesertBanditSpawn1..3       Part    attrs: EnemyType="DesertBandit", RespawnTime=8

StarterPlayer
└── StarterPlayerScripts
    ├── AutoGrindController         LocalScript
    └── MovementController          ModuleScript

StarterGui
└── AutoGrindGui                    ScreenGui (ResetOnSpawn = false)
    └── AutoGrindGuiController      LocalScript
```

---

## 2. Installation (choose one)

### Option A: one-paste installer (fastest)
1. Open your place in Studio. A Baseplate place works fine.
2. **View → Command Bar**.
3. Open [`dist/AutoGrindInstaller.luau`](dist/AutoGrindInstaller.luau), copy the **whole file**, paste it into the Command Bar and press **Enter**.
4. The Output window should end with `[Installer] Done`.
5. Press **Play**.

The installer creates every folder, remote, NPC template, spawn point, Script, LocalScript and ModuleScript shown above. You can run it again safely: it updates the script sources and keeps everything else. If you edit files in `src/`, rebuild it with `python3 tools/build_installer.py`.

### Option B: Rojo
1. `rojo serve` in this folder, then connect from the Rojo Studio plugin. This syncs all scripts and the Remotes.
2. Paste [`tools/StudioSetup.luau`](tools/StudioSetup.luau) into the Command Bar once. This creates the NPC templates, spawn points and Workspace folders, which Rojo does not manage.

### Option C: by hand
1. Create the objects in section 1 using **+** in the Explorer.
2. For each script in the table below, insert the right class with the **exact name** and paste the file's contents.
3. Either paste `tools/StudioSetup.luau` into the Command Bar to create templates and spawns, or build them yourself as described in section 4.

---

## 3. Script reference

| # | Name | Class | Studio location | Source file |
|---|------|-------|-----------------|-------------|
| 1 | GameConfig | ModuleScript | ReplicatedStorage.Shared | [`src/ReplicatedStorage/Shared/GameConfig.luau`](src/ReplicatedStorage/Shared/GameConfig.luau) |
| 2 | EnemyUtil | ModuleScript | ReplicatedStorage.Shared | [`src/ReplicatedStorage/Shared/EnemyUtil.luau`](src/ReplicatedStorage/Shared/EnemyUtil.luau) |
| 3 | AutoGrindState | ModuleScript | ReplicatedStorage.Shared | [`src/ReplicatedStorage/Shared/AutoGrindState.luau`](src/ReplicatedStorage/Shared/AutoGrindState.luau) |
| 4 | Remotes | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/Remotes.luau`](src/ServerScriptService/Modules/Remotes.luau) |
| 5 | RateLimiter | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/RateLimiter.luau`](src/ServerScriptService/Modules/RateLimiter.luau) |
| 6 | EnemySpawner | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/EnemySpawner.luau`](src/ServerScriptService/Modules/EnemySpawner.luau) |
| 7 | EnemyAI | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/EnemyAI.luau`](src/ServerScriptService/Modules/EnemyAI.luau) |
| 8 | EnemyServer | Script | ServerScriptService | [`src/ServerScriptService/EnemyServer.server.luau`](src/ServerScriptService/EnemyServer.server.luau) |
| 9 | CombatServer | Script | ServerScriptService | [`src/ServerScriptService/CombatServer.server.luau`](src/ServerScriptService/CombatServer.server.luau) |
| 10 | PlayerData | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/PlayerData.luau`](src/ServerScriptService/Modules/PlayerData.luau) |
| 11 | QuestData | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/QuestData.luau`](src/ServerScriptService/Modules/QuestData.luau) |
| 12 | QuestManager | ModuleScript | ServerScriptService.Modules | [`src/ServerScriptService/Modules/QuestManager.luau`](src/ServerScriptService/Modules/QuestManager.luau) |
| 13 | QuestServer | Script | ServerScriptService | [`src/ServerScriptService/QuestServer.server.luau`](src/ServerScriptService/QuestServer.server.luau) |
| 14 | MovementController | ModuleScript | StarterPlayer.StarterPlayerScripts | [`src/StarterPlayer/StarterPlayerScripts/MovementController.luau`](src/StarterPlayer/StarterPlayerScripts/MovementController.luau) |
| 15 | AutoGrindController | LocalScript | StarterPlayer.StarterPlayerScripts | [`src/StarterPlayer/StarterPlayerScripts/AutoGrindController.client.luau`](src/StarterPlayer/StarterPlayerScripts/AutoGrindController.client.luau) |
| 16 | AutoGrindGuiController | LocalScript | StarterGui.AutoGrindGui (inside the ScreenGui) | [`src/StarterGui/AutoGrindGui/AutoGrindGuiController.client.luau`](src/StarterGui/AutoGrindGui/AutoGrindGuiController.client.luau) |

File extensions follow the Rojo convention: `.server.luau` is a **Script**, `.client.luau` is a **LocalScript**, and plain `.luau` is a **ModuleScript**. In Studio the instance name is the file name without the extension.

---

## 4. Build order and what each part does

### Step 1: Folders and remotes
* `ReplicatedStorage.Remotes` (Folder) holds `AttackEnemy` and `QuestRemote` (RemoteEvent).
* `ReplicatedStorage.Shared` (Folder) holds the three shared ModuleScripts.
* `ServerScriptService.Modules` (Folder) holds the server ModuleScripts.
* **If `Workspace.Enemies` does not exist:** in the Explorer, hover **Workspace**, click **+**, choose **Folder** and rename it to `Enemies`. Do the same for `EnemySpawns`. `EnemySpawner` also creates both folders at runtime if they are missing, and `Remotes.get()` creates missing remotes. Clients wait up to 15 s with `WaitForChild(name, timeout)` and print a warning instead of yielding forever.

### Step 2: Enemy templates and spawning
**Templates** (`ServerStorage.EnemyTemplates.<EnemyType>`) can be any Model that has:
* a **Humanoid**
* a part named **HumanoidRootPart**
* the model name equal to the enemy type (`Bandit`, `DesertBandit`)

`StudioSetup` builds simple block NPCs. For better-looking NPCs, use **Avatar → Rig Builder → R15**, rename the rig to `Bandit`, unanchor it and drag it into `ServerStorage.EnemyTemplates`.

**Spawn points** are Parts anywhere inside `Workspace.EnemySpawns`. Subfolders are fine. Set attributes in **Properties → Attributes → +**:

| Attribute | Type | Required | Example |
|-----------|------|----------|---------|
| `EnemyType` | string | yes | `Bandit` |
| `RespawnTime` | number | no (default 5) | `5` |
| `WanderRadius` | number | no | `15` |

`EnemySpawner` keeps exactly one NPC per spawn point. When the NPC dies, the body stays for `CorpseLifetime` seconds. After `RespawnTime`, the spawner clones a fresh NPC from the template, places it at the spawn and parents it to `Workspace.Enemies`. You can add spawn points while the game is running. Per-type stats (health, speed, XP, money, damage) are in `GameConfig.Enemies`.

`EnemyAI` is one server loop for all NPCs. Enemies wander near their spawn, chase players in `AggroRange`, hit back inside `AttackRange` and are leashed to home. Set `GameConfig.EnemyAI.Enabled = false` for passive dummies, or set `Damage = 0` per type.

### Step 3: Combat (`CombatServer`)
The client only calls `AttackEnemy:FireServer(enemyModel)`. The server:
1. drops floods above `MaxRequestsPerSecond` (8/s)
2. enforces `AttackCooldown` (0.35 s) using the **server** clock
3. checks the target is a Model **directly inside Workspace.Enemies**, with a Humanoid and HumanoidRootPart, and alive
4. checks the attacker's character exists and is alive
5. checks the distance between the two HumanoidRootParts is at most `MaximumAttackRange` (10) plus a 1.5-stud latency tolerance
6. applies `DamagePerHit` (20). Any damage value the client sends is ignored.
7. gives kill credit to the player who lands the killing blow, **once** (`KillCredited` attribute): +Kill, +XP, +Money, and quest progress

### Step 4: Player data (`PlayerData`)
`leaderstats` contains `Level`, `XP` and `Money` (IntValues). Player attributes `Kills` and `XPRequired` are also set. Change the formula in `GameConfig.Progression.XPRequired`; the default is `100 + Level * 50`. `AddXP` handles several level-ups at once: while `XP >= XPRequired(Level)`, it subtracts the requirement and adds a level. The formula is guarded, so a mistake that returns 0 or NaN cannot cause an infinite loop.

> Data is kept in memory only. To save it, load the values in `setupPlayer` and save them in `PlayerRemoving` / `game:BindToClose` with `DataStoreService:GetDataStore("PlayerData")` (enable *Studio Access to API Services* to test in Studio).

### Step 5: Quests (`QuestData`, `QuestManager`, `QuestServer`)
* Quests are defined in `QuestData`. They include Bandit Quest (Lv 1, 5 Bandits, 250 XP, 100 Money) and Desert Bandit Quest (Lv 20, 8 DesertBandits, 500 XP, 250 Money).
* With **Auto Quest** on, the server picks the quest with the highest `RequiredLevel` at or below your level. It counts only kills that `CombatServer` has verified, pays the reward once, then starts the next best quest.
* Quest state reaches the client through Player attributes: `AutoQuest`, `QuestName`, `QuestTarget`, `QuestProgress`, `QuestRequired`.
* Client requests are `QuestRemote:FireServer("SetAutoQuest", bool)`, `("StartQuest", id)` and `("AbandonQuest")`. Each one is type-checked and rate-limited.

### Step 6: Movement (`MovementController`)
* Within 35 studs at a similar height, the character walks straight with `Humanoid:MoveTo`. Beyond that, or with large height differences, it follows **PathfindingService** waypoints and jumps where the path needs it.
* The destination is updated every 0.1 s. Paths are recomputed when the target moves more than 4 studs, or every 1.5 s.
* It stops at `AttackDistance` and starts moving again once the target is `AttackDistance + 1` away. The 1-stud gap stops it jittering at the edge of range.
* If the character is stuck, it jumps and recomputes the path. Cancellation uses a token, so only one follow loop ever runs.

### Step 7: Auto Grind (`AutoGrindController`)
The loop works like this:
```
while Enabled:
    if character dead/missing -> wait (status Dead / Respawning)
    enemy = getNearestEnemy(target)        -- quest target if Auto Quest is on
    if none -> status Waiting, wait ScanInterval, rescan
    engage(enemy):
        follow it; when within AttackDistance -> face it (Y axis only),
        FireServer every AttackDelay, re-check alive every tick
        leave when it dies / disappears / is unreachable for 15 s (blacklisted 8 s)
        or a much closer enemy appears (automatic target switching)
```
* There is exactly one loop. Every start or stop increments `runId`, and older loops exit. It uses no RunService connections. Character connections are disconnected on respawn.
* The LocalScript is in **PlayerScripts**, which does not reset when you die, so grinding **resumes automatically after respawn**.
* **G** toggles Auto Grind.

**Attack animation.** Open **`ReplicatedStorage.Shared.GameConfig`** and find:
```lua
GameConfig.Animation = {
	AttackAnimationId = "rbxassetid://0",   -- <<< put your ID here
```
Replace `0` with your animation's asset ID, for example `"rbxassetid://1234567890"`. Create the animation with the Animation Editor and publish it **from the same account or group that owns the place**. Roblox will not play animations owned by someone else. While the ID is `0`, the animation is skipped.

### Step 8: GUI (`AutoGrindGuiController`)
The window is built from standard UI objects: a dark background, rounded corners (`UICorner`), a draggable title bar that works with mouse and touch, a collapse button, green ON / red OFF toggles, a target dropdown (Bandit / DesertBandit / Any), and inputs for Attack Distance, Attack Delay and Search Range. Bad input is clamped or reverted. Below the controls it shows the current target, a colour-coded status, kills, quest progress (`Bandit Quest — 3 / 5`), level, XP and money, and a toast message when a quest finishes or you level up. While Auto Quest is choosing the target, the dropdown shows `Bandit (Quest)` and is locked.

### Step 9: Integration
How the pieces connect:
* **GUI → `AutoGrindState` → AutoGrindController → MovementController.** All of this is local to the client.
* **AutoGrindController → `AttackEnemy` → CombatServer.** CombatServer then updates PlayerData (kills, XP, money) and QuestManager (quest progress, which may trigger a reward).
* **QuestServer / QuestManager → Player attributes → GUI and AutoGrindController.** The quest target set by the server becomes the controller's target.
* **EnemyServer → EnemySpawner and EnemyAI → Workspace.Enemies.**

Settings to tune are all in `GameConfig`:
* `Combat` – server combat: damage, cooldown, range
* `Enemies` – per-enemy-type stats
* `AutoGrind` – client grinding defaults
* `Movement` – pathfinding and movement tuning
* `Progression` – XP formula
* `Spawning` – respawn and corpse timing
* `Animation` – attack animation ID

If you want the attack distance above 9, raise `MaximumAttackRange`. The client limit is always `MaximumAttackRange - 1`.

---

## 5. Testing checklist

Start with **Play** (F5). For multi-player tests, use **Test → Clients and Servers → 2 Players → Start**.

| ✓ | Scenario | How | Expected |
|---|----------|-----|----------|
| ☐ | One enemy | Delete all spawns but `BanditSpawn1`, enable Auto Grind | Searching → Moving → Attacking, the Bandit dies in 5 hits, Kills = 1 |
| ☐ | Multiple enemies | Default 3 Bandit spawns | Kills them nearest-first and never idles while one is alive |
| ☐ | Target dies | Watch a kill | The next target is chosen within about 0.1 s, and the dead body is ignored |
| ☐ | Target disappears | During combat, in the server view (Test → Current: Server), delete the targeted NPC from `Workspace.Enemies` | Switches target immediately with no errors, and the spawn respawns the NPC after RespawnTime |
| ☐ | Player dies | Set `Damage = 200` for Bandit, or reset the character (Esc → R) | Status changes to **Dead** and movement stops |
| ☐ | Player respawns | After death | Status goes **Respawning** → Searching and grinding resumes without clicking anything |
| ☐ | No enemies available | Set the target to DesertBandit and delete its spawns | Status **Waiting**, rescans every second, no errors or lag |
| ☐ | Enemy walks away | Server view: drag the NPC 30 studs away, or let it wander | Status changes to Moving, the character follows and attacks again |
| ☐ | Auto Grind switched off during combat | Click the toggle while attacking | Stops at once: status **Idle**, no more attacks, character stands still |
| ☐ | Auto Grind switched on again | Click again, or press G | Resumes searching, with exactly one loop (attack rate does not double) |
| ☐ | Spam toggle | Toggle 20× quickly | Still only one loop and a normal attack rate |
| ☐ | Quest completed | Turn Auto Quest ON, kill 5 Bandits | A toast shows +250 XP / +100 Money, and the next quest starts automatically |
| ☐ | Player levels up | Kill Bandits, or temporarily set `RewardXP = 5000` | Level increases, XP rolls over, several level-ups happen from one reward, and the toast shows the new level |
| ☐ | Higher quest unlocks | Reach level 20 (raise `RewardXP` to test) | The next quest picked is Desert Bandit Quest and the target switches to DesertBandit |
| ☐ | Multiple players, same enemy | 2-player test, both grind Bandits | Only the player who lands the last hit gets the kill. There is no double credit and no errors |
| ☐ | Attack distance | Set it to 4, then 9; try entering 50 | The character stops at the new distance, and 50 is clamped to 9 |
| ☐ | Attack delay | Set it to 1, then try 0.1 | Attacks slow down; 0.1 is clamped to 0.4 |
| ☐ | Exploit: range | In a client Command Bar: `game.ReplicatedStorage.Remotes.AttackEnemy:FireServer(workspace.Enemies:GetChildren()[1])` while far away | No damage |
| ☐ | Exploit: spam | `for i=1,100 do …FireServer(enemy) end` while in range | At most 1 hit per 0.35 s |
| ☐ | Exploit: bad args | `FireServer("x")`, `FireServer({})`, `FireServer(workspace.Baseplate)`, and `QuestRemote:FireServer("StartQuest","DesertBanditQuest")` at Lv 1 | Ignored, or a `LevelTooLow` quest error |

---

## 6. Race conditions and RemoteEvent hardening

| Risk | Mitigation (where) |
|------|--------------------|
| Client sends a fake damage value | Remote takes only a target, and the server uses `DamagePerHit` (CombatServer) |
| Attack spam / cooldown bypass | Per-player cooldown on the server clock plus a requests-per-second flood limiter (CombatServer, RateLimiter) |
| Attacking from across the map | Range checked from server-side HumanoidRootPart positions (CombatServer) |
| Passing a player, part, table or string as the target | `typeof` / `IsA("Model")` checks, and the target must be a direct child of `Workspace.Enemies` (EnemyUtil) |
| Two players kill the same NPC in the same frame → double reward | Remote handlers run one at a time. The first hit to reach 0 HP credits the kill and later hits fail the alive check. A `KillCredited` attribute also guards it (CombatServer) |
| Quest reward paid twice | Quest is cleared before the reward is paid, and progress comes only from server kill credit (QuestManager) |
| Taking a quest above your level / unknown quest / fake progress | Level and quest ID validated on the server, and progress is never sent by the client (QuestManager, QuestServer) |
| Exploiter flings or teleports NPCs via physics ownership | NPC `HumanoidRootPart:SetNetworkOwner(nil)` keeps NPC physics on the server (EnemySpawner) |
| Died + Destroyed both firing → two NPCs spawn | Per-spawn `Generation` counter. The handler runs once per enemy, and a pending respawn is cancelled if its spawn point is removed (EnemySpawner) |
| Memory leaks from players leaving | Every per-player table is cleared on `PlayerRemoving` (CombatServer, PlayerData, QuestManager, RateLimiter) |
| Errors in one remote call breaking the handler | Handlers are wrapped in `pcall` |
| Several client grind loops after fast toggling | `runId` token, so older loops exit (AutoGrindController) |
| Stale path results after a target switch | A new `Path` per computation, and the follow-token is checked after `ComputeAsync` yields (MovementController) |
| Infinite yield on missing objects | `WaitForChild(name, timeout)` plus warnings, and the server creates missing remotes and folders |
| Server rejecting legit hits due to network jitter | Client minimum `AttackDelay` = `AttackCooldown + 0.05`, so the server cooldown stays strict without false rejections |

**Known limitation:** a client controls its own character's position, as in every Roblox game. An exploiter could teleport their own character next to enemies, and the range check would still pass. If you publish the game, add a server-side movement sanity check, for example by rejecting attacks when the HumanoidRootPart moved further than `WalkSpeed × elapsed × 1.5` since the last check.

---

## 7. Troubleshooting

* **Nothing happens when I press Auto Grind.** Check the Output window for `[AutoGrind]` warnings, which usually mean a missing object. Confirm the NPCs are inside `Workspace.Enemies` and that the target type matches their name or `EnemyType` attribute.
* **NPCs don't spawn.** Look for `[EnemySpawner] Missing template` in Output. The template name must match the spawn's `EnemyType` exactly.
* **NPCs fall over or sink.** Make sure template parts are **unanchored** and the Humanoid's `HipHeight` fits your rig. Rig Builder rigs already work.
* **Character won't path around a wall.** Increase `Movement.AgentRadius` or reduce `DirectMoveDistance` so pathfinding is used more often.
* **StreamingEnabled places:** NPCs further away than the streaming radius are not visible to the client, so they can't be targeted. Keep `Search Range` within your streaming radius.
