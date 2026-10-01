--[[
	AutoGrindController  (LocalScript)
	Location: StarterPlayer.StarterPlayerScripts.AutoGrindController

	The Auto Grind brain. While AutoGrindState "Enabled" is true:
	  1. find the nearest valid enemy of the selected type (or the quest target)
	  2. walk to it (MovementController)
	  3. when within AttackDistance: face it and request attacks from the server
	  4. when it dies / disappears / is unreachable: pick the next one
	  5. no enemies: wait ScanInterval and scan again
	It survives death and respawns automatically (this script lives in
	PlayerScripts, which is NOT reset when the character respawns).

	The GUI toggles it through the shared AutoGrindState module.
	Optional: press G to toggle Auto Grind from the keyboard.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer

------------------------------------------------------------------------
-- Dependencies (WaitForChild with timeouts -> no silent infinite yields)
------------------------------------------------------------------------
local Shared = ReplicatedStorage:WaitForChild("Shared", 15)
if not Shared then
	warn("[AutoGrind] ReplicatedStorage.Shared is missing - see README setup.")
	return
end

local GameConfig = require(Shared:WaitForChild("GameConfig"))
local EnemyUtil = require(Shared:WaitForChild("EnemyUtil"))
local State = require(Shared:WaitForChild("AutoGrindState"))
local MovementController = require(script.Parent:WaitForChild("MovementController"))

local remotesFolder = ReplicatedStorage:WaitForChild(GameConfig.Folders.Remotes, 15)
local attackRemote = remotesFolder and remotesFolder:WaitForChild(GameConfig.RemoteNames.AttackEnemy, 15)
if not attackRemote then
	warn("[AutoGrind] ReplicatedStorage.Remotes.AttackEnemy is missing - see README setup.")
	return
end

local Settings = GameConfig.AutoGrind
local TOGGLE_KEY = Enum.KeyCode.G

------------------------------------------------------------------------
-- Runtime state
------------------------------------------------------------------------
local movement = MovementController.new()

local character: Model? = nil
local humanoid: Humanoid? = nil
local rootPart: BasePart? = nil
local isDead = false
local characterConnections: { RBXScriptConnection } = {}

local attackTrack: AnimationTrack? = nil
local lastAttackTime = -math.huge
local runId = 0 -- incremented on every start/stop; old loops exit when it changes

------------------------------------------------------------------------
-- Helpers
------------------------------------------------------------------------
local function setStatus(status: string)
	State.Set("Status", status)
end

local function setCurrentTarget(name: string)
	State.Set("CurrentTarget", name)
end

local function disconnectAll(connections: { RBXScriptConnection })
	for _, connection in connections do
		connection:Disconnect()
	end
	table.clear(connections)
end

local function flatDistance(a: Vector3, b: Vector3): number
	local delta = a - b
	return Vector3.new(delta.X, 0, delta.Z).Magnitude
end

local function isCharacterReady(): boolean
	return not isDead
		and humanoid ~= nil
		and rootPart ~= nil
		and humanoid.Health > 0
		and rootPart.Parent ~= nil
end

local function isRunActive(id: number): boolean
	return id == runId and State.Get("Enabled") == true
end

-- When Auto Quest is on (server attribute), the quest decides the target.
local function resolveTargetType(): string
	if player:GetAttribute("AutoQuest") == true then
		local questTarget = player:GetAttribute("QuestTarget")
		if type(questTarget) == "string" and questTarget ~= "" then
			return questTarget
		end
	end
	return State.Get("TargetType")
end

--[[
	getNearestEnemy(enemyName)
	Closest valid enemy (Model + Humanoid + HumanoidRootPart + alive + matching
	type) within MaxSearchDistance of the player's HumanoidRootPart.
	Returns: enemyModel?, enemyRootPart?, distance
]]
local function getNearestEnemy(enemyName: string, ignore: { [Instance]: any }?): (Model?, BasePart?, number)
	if not rootPart then
		return nil, nil, math.huge
	end
	return EnemyUtil.getNearestEnemy(enemyName, rootPart.Position, State.Get("MaxSearchDistance"), ignore)
end

-- Rotate only around the Y axis so the character never tilts.
local function faceTarget(targetPosition: Vector3)
	if not rootPart then
		return
	end
	local position = rootPart.Position
	local flatTarget = Vector3.new(targetPosition.X, position.Y, targetPosition.Z)
	if (flatTarget - position).Magnitude < 0.1 then
		return
	end
	local desired = CFrame.lookAt(position, flatTarget)
	-- Skip tiny corrections (avoids fighting the physics every tick).
	if rootPart.CFrame.LookVector:Dot(desired.LookVector) < 0.996 then
		rootPart.CFrame = desired
	end
end

------------------------------------------------------------------------
-- Attack animation
------------------------------------------------------------------------
local function loadAttackAnimation(newHumanoid: Humanoid)
	attackTrack = nil
	local animationId = GameConfig.Animation.AttackAnimationId
	if type(animationId) ~= "string" or animationId == "" or animationId == "rbxassetid://0" then
		return -- placeholder id: no animation
	end

	local animator = newHumanoid:FindFirstChildOfClass("Animator") or newHumanoid:WaitForChild("Animator", 5)
	if not animator or not animator:IsA("Animator") then
		return
	end

	local animation = Instance.new("Animation")
	animation.AnimationId = animationId
	local ok, track = pcall(function()
		return (animator :: Animator):LoadAnimation(animation)
	end)
	if ok and track then
		track.Priority = Enum.AnimationPriority.Action
		track.Looped = false
		attackTrack = track
	else
		warn("[AutoGrind] Could not load attack animation " .. animationId)
	end
end

local function stopAttackAnimation()
	if attackTrack and attackTrack.IsPlaying then
		attackTrack:Stop(0.1)
	end
end

local function performAttack(enemy: Model)
	attackRemote:FireServer(enemy) -- only the target; the server decides damage
	if attackTrack then
		attackTrack:Play(0.05, 1, GameConfig.Animation.AttackAnimationSpeed)
	end
end

------------------------------------------------------------------------
-- Engaging a single enemy
-- Returns a reason string: "TargetLost" | "Retarget" | "Unreachable" | "CharacterLost" | "Stopped"
------------------------------------------------------------------------
local function engageEnemy(enemy: Model, id: number, blacklist: { [Instance]: number }): string
	setCurrentTarget(enemy.Name)
	local lastInRangeTime = os.clock()
	local lastRetargetCheck = os.clock()

	while isRunActive(id) do
		if not isCharacterReady() or not rootPart then
			return "CharacterLost"
		end

		local targetType = resolveTargetType()
		local isValid, _, enemyRoot = EnemyUtil.isValidEnemy(enemy, targetType)
		if not isValid or not enemyRoot then
			return "TargetLost" -- died, despawned, or quest target changed
		end

		local attackDistance = State.Get("AttackDistance")
		local now = os.clock()
		local distance = flatDistance(rootPart.Position, enemyRoot.Position)
		local fullDistance = (rootPart.Position - enemyRoot.Position).Magnitude

		-- Keep following every tick: the MovementController stops by itself at
		-- AttackDistance and resumes if the enemy walks away.
		movement:Follow(enemyRoot, attackDistance)

		local inRange = distance <= attackDistance + Settings.AttackRangeSlack
			and fullDistance <= GameConfig.Combat.MaximumAttackRange

		if inRange then
			lastInRangeTime = now
			setStatus("Attacking")
			faceTarget(enemyRoot.Position)

			local attackDelay = State.Get("AttackDelay")
			if now - lastAttackTime >= attackDelay then
				lastAttackTime = now
				performAttack(enemy)
			end
			-- Sleep until the next attack is due (but re-check at least every StepInterval).
			local untilNextAttack = attackDelay - (os.clock() - lastAttackTime)
			task.wait(math.clamp(untilNextAttack, 0.03, Settings.StepInterval))
		else
			setStatus("Moving")

			-- Give up on targets we can't reach (walls, water, ledges...).
			if now - lastInRangeTime > Settings.ApproachTimeout then
				blacklist[enemy] = now + Settings.BlacklistTime
				return "Unreachable"
			end

			-- Automatic target switching: a much closer enemy appeared.
			if now - lastRetargetCheck >= Settings.RetargetInterval then
				lastRetargetCheck = now
				local closer, _, closerDistance = getNearestEnemy(targetType, blacklist)
				if closer and closer ~= enemy and closerDistance + Settings.RetargetMargin < fullDistance then
					return "Retarget"
				end
			end

			task.wait(Settings.StepInterval)
		end
	end

	return "Stopped"
end

------------------------------------------------------------------------
-- Main loop (exactly one runs at a time, enforced by runId)
------------------------------------------------------------------------
local function purgeBlacklist(blacklist: { [Instance]: number })
	local now = os.clock()
	for enemy, expiresAt in blacklist do
		if now >= expiresAt or not enemy.Parent then
			blacklist[enemy] = nil
		end
	end
end

local function grindLoop(id: number)
	local blacklist: { [Instance]: number } = {}

	while isRunActive(id) do
		if not isCharacterReady() then
			-- Dead / respawning: the character event handlers set the status.
			setCurrentTarget("None")
			task.wait(0.5)
			continue
		end

		purgeBlacklist(blacklist)
		setStatus("Searching")

		local enemy = getNearestEnemy(resolveTargetType(), blacklist)
		if enemy then
			engageEnemy(enemy, id, blacklist)
			stopAttackAnimation()
			task.wait() -- yield one frame so a failing target can never spin the loop
		else
			movement:Stop()
			setCurrentTarget("None")
			setStatus("Waiting")
			task.wait(Settings.ScanInterval)
		end
	end
end

local function startGrinding()
	runId += 1
	setStatus(if isCharacterReady() then "Searching" else "Respawning")
	task.spawn(grindLoop, runId)
end

local function stopGrinding()
	runId += 1 -- the running loop sees the new id and exits
	movement:Stop()
	stopAttackAnimation()
	setCurrentTarget("None")
	setStatus("Idle")
end

------------------------------------------------------------------------
-- Character lifecycle (death recovery + restart after respawn)
------------------------------------------------------------------------
local function onCharacterAdded(newCharacter: Model)
	disconnectAll(characterConnections)
	movement:SetCharacter(nil)
	character = newCharacter
	humanoid = nil
	rootPart = nil
	attackTrack = nil

	local newHumanoid = newCharacter:WaitForChild("Humanoid", 10)
	local newRoot = newCharacter:WaitForChild("HumanoidRootPart", 10)

	-- Another respawn may have happened while we were waiting.
	if player.Character ~= newCharacter then
		return
	end
	if not newHumanoid or not newHumanoid:IsA("Humanoid") or not newRoot or not newRoot:IsA("BasePart") then
		warn("[AutoGrind] Character is missing Humanoid or HumanoidRootPart")
		return
	end

	humanoid = newHumanoid
	rootPart = newRoot
	isDead = false
	movement:SetCharacter(newCharacter)
	loadAttackAnimation(newHumanoid)

	table.insert(
		characterConnections,
		newHumanoid.Died:Connect(function()
			isDead = true
			movement:Stop()
			stopAttackAnimation()
			setCurrentTarget("None")
			setStatus("Dead")
		end)
	)

	-- The grind loop is still running (if enabled) and picks up the new character.
	setStatus(if State.Get("Enabled") then "Searching" else "Idle")
end

local function onCharacterRemoving(oldCharacter: Model)
	if oldCharacter ~= character then
		return
	end
	disconnectAll(characterConnections)
	movement:SetCharacter(nil)
	character = nil
	humanoid = nil
	rootPart = nil
	attackTrack = nil
	isDead = true
	if State.Get("Enabled") then
		setStatus("Respawning")
	end
end

player.CharacterAdded:Connect(onCharacterAdded)
player.CharacterRemoving:Connect(onCharacterRemoving)
if player.Character then
	task.spawn(onCharacterAdded, player.Character)
end

------------------------------------------------------------------------
-- Toggle wiring
------------------------------------------------------------------------
State.Changed:Connect(function(key, value)
	if key == "Enabled" then
		if value then
			startGrinding()
		else
			stopGrinding()
		end
	end
end)

UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then
		return -- typing in chat / a TextBox
	end
	if input.KeyCode == TOGGLE_KEY then
		State.Set("Enabled", not State.Get("Enabled"))
	end
end)

-- If something enabled grinding before this script finished loading.
if State.Get("Enabled") then
	startGrinding()
end
