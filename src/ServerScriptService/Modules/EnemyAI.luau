--[[
	EnemyAI  (ModuleScript)
	Location: ServerScriptService.Modules.EnemyAI

	Very small server-side NPC brain so the grinder has something realistic to
	deal with (enemies that walk away, chase you and hit back):
	  * no player nearby  -> wander around the spawn (HomePosition attribute)
	  * player in AggroRange -> chase
	  * player in AttackRange -> hit the player every AttackInterval
	  * strayed beyond LeashRange -> walk home

	ONE loop updates every enemy (no per-NPC threads or RunService connections).
	Disable with GameConfig.EnemyAI.Enabled = false.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared:WaitForChild("GameConfig"))
local EnemyUtil = require(Shared:WaitForChild("EnemyUtil"))

local AISettings = GameConfig.EnemyAI

type Brain = {
	LastAttack: number,
	NextWander: number,
}

local EnemyAI = {}

local started = false
local brains: { [Instance]: Brain } = {}
local random = Random.new()

local function getAlivePlayerRoot(player: Player): (Humanoid?, BasePart?)
	local character = player.Character
	if not character then
		return nil, nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or humanoid.Health <= 0 or not rootPart or not rootPart:IsA("BasePart") then
		return nil, nil
	end
	return humanoid, rootPart
end

local function findNearestPlayer(position: Vector3, range: number): (Humanoid?, BasePart?, number)
	local bestHumanoid, bestRoot, bestDistance = nil, nil, range
	for _, player in Players:GetPlayers() do
		local humanoid, rootPart = getAlivePlayerRoot(player)
		if humanoid and rootPart then
			local distance = (rootPart.Position - position).Magnitude
			if distance <= bestDistance then
				bestHumanoid, bestRoot, bestDistance = humanoid, rootPart, distance
			end
		end
	end
	return bestHumanoid, bestRoot, bestDistance
end

local function updateEnemy(enemy: Model, humanoid: Humanoid, rootPart: BasePart, now: number)
	local stats = GameConfig.Enemies[EnemyUtil.getEnemyType(enemy)]
	if not stats then
		return
	end

	local brain = brains[enemy]
	if not brain then
		brain = { LastAttack = 0, NextWander = now + random:NextNumber(0, AISettings.WanderIntervalMax) }
		brains[enemy] = brain
	end

	local position = rootPart.Position
	local home = enemy:GetAttribute("HomePosition")
	if typeof(home) ~= "Vector3" then
		home = position
	end

	-- Leash: never get dragged across the map.
	if (position - home).Magnitude > stats.LeashRange then
		humanoid:MoveTo(home)
		return
	end

	local targetHumanoid, targetRoot, distance = findNearestPlayer(position, stats.AggroRange)
	if targetHumanoid and targetRoot then
		if distance <= stats.AttackRange then
			humanoid:MoveTo(position) -- stand still and fight
			if stats.Damage > 0 and now - brain.LastAttack >= stats.AttackInterval then
				brain.LastAttack = now
				targetHumanoid:TakeDamage(stats.Damage)
			end
		else
			humanoid:MoveTo(targetRoot.Position)
		end
		return
	end

	-- Idle wander around home.
	if now >= brain.NextWander then
		brain.NextWander = now + random:NextNumber(AISettings.WanderIntervalMin, AISettings.WanderIntervalMax)
		local radius = enemy:GetAttribute("WanderRadius")
		if type(radius) ~= "number" then
			radius = stats.WanderRadius
		end
		local angle = random:NextNumber(0, math.pi * 2)
		local offset = Vector3.new(math.cos(angle), 0, math.sin(angle)) * random:NextNumber(0, radius)
		humanoid:MoveTo(home + offset)
	end
end

local function tick()
	local enemiesFolder = EnemyUtil.getEnemiesFolder()
	local now = os.clock()
	local seen = {}

	if enemiesFolder then
		for _, enemy in enemiesFolder:GetChildren() do
			local isValid, humanoid, rootPart = EnemyUtil.isValidEnemy(enemy, nil)
			if isValid and humanoid and rootPart then
				seen[enemy] = true
				-- pcall: one broken NPC must never stop the loop for the others.
				local ok, err = pcall(updateEnemy, enemy :: Model, humanoid, rootPart, now)
				if not ok then
					warn("[EnemyAI] " .. tostring(err))
				end
			end
		end
	end

	-- Forget dead / removed enemies (prevents memory leaks).
	for enemy in brains do
		if not seen[enemy] then
			brains[enemy] = nil
		end
	end
end

function EnemyAI.Start()
	if started or not AISettings.Enabled then
		return
	end
	started = true
	task.spawn(function()
		while true do
			tick()
			task.wait(AISettings.TickInterval)
		end
	end)
end

return EnemyAI
