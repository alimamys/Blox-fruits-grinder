--[[
	EnemySpawner  (ModuleScript)
	Location: ServerScriptService.Modules.EnemySpawner

	Spawns and respawns NPCs from spawn points.

	Spawn points: any BasePart inside Workspace.EnemySpawns (sub-folders OK)
	with these attributes:
	  EnemyType   (string)  REQUIRED  name of a model in ServerStorage.EnemyTemplates
	  RespawnTime (number)  optional  seconds, default GameConfig.Spawning.DefaultRespawnTime
	  WanderRadius(number)  optional  overrides the enemy type's WanderRadius

	Each spawn point owns at most ONE live enemy. When that enemy dies (or is
	removed), the spawn waits RespawnTime and clones a fresh one.

	Race-condition guards:
	  * each spawn has a Generation counter; a pending respawn only runs if the
	    generation is unchanged, so "Died" + "removed" can never spawn two NPCs
	  * a removed spawn point cancels its pending respawn
]]

local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared:WaitForChild("GameConfig"))
local EnemyUtil = require(Shared:WaitForChild("EnemyUtil"))

local Spawning = GameConfig.Spawning

type SpawnState = {
	Generation: number,
	Enemy: Model?,
	Connections: { RBXScriptConnection },
}

local EnemySpawner = {}

local started = false
local spawnStates: { [BasePart]: SpawnState } = {}
local warnedMissingTemplates: { [string]: boolean } = {}

local function disconnectAll(connections: { RBXScriptConnection })
	for _, connection in connections do
		connection:Disconnect()
	end
	table.clear(connections)
end

local function getOrCreateFolder(parent: Instance, name: string): Instance
	local folder = parent:FindFirstChild(name)
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = name
		folder.Parent = parent
	end
	return folder
end

local function getRespawnTime(spawnPart: BasePart): number
	local respawnTime = spawnPart:GetAttribute("RespawnTime")
	if type(respawnTime) ~= "number" or respawnTime ~= respawnTime or respawnTime < 0 then
		return Spawning.DefaultRespawnTime
	end
	return respawnTime
end

local function getTemplate(enemyType: string): Model?
	local templates = ServerStorage:FindFirstChild(GameConfig.Folders.EnemyTemplates)
	local template = templates and templates:FindFirstChild(enemyType)
	if template and template:IsA("Model") then
		return template
	end
	if not warnedMissingTemplates[enemyType] then
		warnedMissingTemplates[enemyType] = true
		warn(("[EnemySpawner] Missing template ServerStorage.%s.%s"):format(GameConfig.Folders.EnemyTemplates, enemyType))
	end
	return nil
end

-- Upright CFrame at the spawn point (ignores any tilt of the spawn part).
local function getSpawnCFrame(spawnPart: BasePart): CFrame
	local _, yRotation, _ = spawnPart.CFrame:ToOrientation()
	local position = spawnPart.Position + Vector3.new(0, Spawning.SpawnHeightOffset, 0)
	return CFrame.new(position) * CFrame.Angles(0, yRotation, 0)
end

local spawnEnemy: (BasePart) -> ()

local function scheduleRespawn(spawnPart: BasePart, state: SpawnState, delaySeconds: number)
	local generation = state.Generation
	task.delay(delaySeconds, function()
		-- Abort if the spawn point was removed or something already respawned.
		if spawnStates[spawnPart] ~= state or state.Generation ~= generation or state.Enemy then
			return
		end
		spawnEnemy(spawnPart)
	end)
end

-- Called when the enemy dies or leaves Workspace.Enemies. Runs at most once
-- per enemy because it checks state.Enemy and disconnects everything.
local function onEnemyGone(spawnPart: BasePart, state: SpawnState, enemy: Model, died: boolean)
	if state.Enemy ~= enemy then
		return
	end
	state.Enemy = nil
	disconnectAll(state.Connections)

	if died then
		-- Leave the body briefly, then clean it up.
		task.delay(Spawning.CorpseLifetime, function()
			if enemy.Parent then
				enemy:Destroy()
			end
		end)
	end

	if spawnStates[spawnPart] == state then
		scheduleRespawn(spawnPart, state, getRespawnTime(spawnPart))
	end
end

spawnEnemy = function(spawnPart: BasePart)
	local state = spawnStates[spawnPart]
	if not state or state.Enemy then
		return
	end

	local enemyType = spawnPart:GetAttribute("EnemyType")
	if type(enemyType) ~= "string" or enemyType == "" then
		warn(("[EnemySpawner] Spawn point %s has no EnemyType attribute"):format(spawnPart:GetFullName()))
		return
	end

	local template = getTemplate(enemyType)
	if not template then
		scheduleRespawn(spawnPart, state, Spawning.RetryDelay) -- retry later, maybe it gets added
		return
	end

	local enemy = template:Clone()
	local humanoid, rootPart = EnemyUtil.getParts(enemy)
	if not humanoid or not rootPart then
		warn(("[EnemySpawner] Template %s needs a Humanoid and a HumanoidRootPart"):format(enemyType))
		enemy:Destroy()
		return
	end

	state.Generation += 1

	enemy.Name = enemyType
	enemy:SetAttribute("EnemyType", enemyType)
	enemy:SetAttribute("HomePosition", spawnPart.Position)
	enemy:SetAttribute("KillCredited", nil)
	local wanderRadius = spawnPart:GetAttribute("WanderRadius")
	if type(wanderRadius) == "number" then
		enemy:SetAttribute("WanderRadius", wanderRadius)
	end

	-- Apply configured stats (overrides whatever the template had).
	local stats = GameConfig.Enemies[enemyType]
	if stats then
		humanoid.MaxHealth = stats.MaxHealth
		humanoid.Health = stats.MaxHealth
		humanoid.WalkSpeed = stats.WalkSpeed
	end
	humanoid.BreakJointsOnDeath = false

	if not enemy.PrimaryPart then
		enemy.PrimaryPart = rootPart
	end
	-- Stream the whole model at once so clients never see a model without its root.
	enemy.ModelStreamingMode = Enum.ModelStreamingMode.Atomic
	enemy:PivotTo(getSpawnCFrame(spawnPart))

	local enemiesFolder = getOrCreateFolder(Workspace, GameConfig.Folders.Enemies)
	enemy.Parent = enemiesFolder

	-- SECURITY: keep NPC physics on the server. Otherwise a nearby client gets
	-- network ownership and an exploiter could fling/teleport the NPC.
	if rootPart:CanSetNetworkOwnership() then
		rootPart:SetNetworkOwner(nil)
	end

	state.Enemy = enemy
	table.insert(
		state.Connections,
		humanoid.Died:Connect(function()
			onEnemyGone(spawnPart, state, enemy, true)
		end)
	)
	table.insert(
		state.Connections,
		enemy.AncestryChanged:Connect(function()
			if enemy.Parent ~= enemiesFolder then
				onEnemyGone(spawnPart, state, enemy, false)
			end
		end)
	)
end

local function registerSpawn(instance: Instance)
	if not instance:IsA("BasePart") or spawnStates[instance] then
		return
	end
	local state: SpawnState = { Generation = 0, Enemy = nil, Connections = {} }
	spawnStates[instance] = state
	spawnEnemy(instance)
end

local function unregisterSpawn(instance: Instance)
	if not instance:IsA("BasePart") then
		return
	end
	local state = spawnStates[instance]
	if not state then
		return
	end
	-- Pending respawns see spawnStates[spawnPart] ~= state and cancel themselves.
	spawnStates[instance] = nil
	disconnectAll(state.Connections)
	state.Enemy = nil -- the live NPC (if any) stays in the world but won't respawn
end

function EnemySpawner.Start()
	if started then
		return
	end
	started = true

	getOrCreateFolder(Workspace, GameConfig.Folders.Enemies)

	local spawnsFolder = Workspace:FindFirstChild(GameConfig.Folders.EnemySpawns)
	if not spawnsFolder then
		warn("[EnemySpawner] Workspace.EnemySpawns not found - creating an empty folder. Add spawn Parts to it.")
		spawnsFolder = getOrCreateFolder(Workspace, GameConfig.Folders.EnemySpawns)
	end

	-- Hand-placed NPCs (no spawn point): still keep their physics on the server.
	for _, enemy in getOrCreateFolder(Workspace, GameConfig.Folders.Enemies):GetChildren() do
		local _, rootPart = EnemyUtil.getParts(enemy)
		if rootPart and rootPart:CanSetNetworkOwnership() then
			rootPart:SetNetworkOwner(nil)
		end
	end

	spawnsFolder.DescendantAdded:Connect(registerSpawn)
	spawnsFolder.DescendantRemoving:Connect(unregisterSpawn)
	for _, descendant in spawnsFolder:GetDescendants() do
		registerSpawn(descendant)
	end
end

return EnemySpawner
