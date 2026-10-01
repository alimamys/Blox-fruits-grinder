--[[
	CombatServer  (Script)
	Location: ServerScriptService.CombatServer

	Server-authoritative combat. Clients only ASK to attack a target:
		AttackEnemy:FireServer(enemyModel)

	The client never sends damage. Every request is validated:
	  1. flood limit (MaxRequestsPerSecond)
	  2. attack cooldown (server clock)
	  3. target is a real, living enemy inside Workspace.Enemies
	  4. attacker has a living character with a HumanoidRootPart
	  5. attacker is within MaximumAttackRange (+ small latency tolerance)
	Only then does the server apply DamagePerHit.

	Kill credit goes to the player who lands the killing blow, exactly once
	per enemy (KillCredited attribute), even if many players attack it.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Modules = ServerScriptService:WaitForChild("Modules")

local GameConfig = require(Shared:WaitForChild("GameConfig"))
local EnemyUtil = require(Shared:WaitForChild("EnemyUtil"))
local PlayerData = require(Modules:WaitForChild("PlayerData"))
local QuestManager = require(Modules:WaitForChild("QuestManager"))
local Remotes = require(Modules:WaitForChild("Remotes"))
local RateLimiter = require(Modules:WaitForChild("RateLimiter"))

local Combat = GameConfig.Combat

PlayerData.Init()

local attackRemote = Remotes.get(GameConfig.RemoteNames.AttackEnemy)
local floodLimiter = RateLimiter.new(Combat.MaxRequestsPerSecond, 1)
local lastAttackTime: { [Player]: number } = {}

local function getAliveCharacter(player: Player): (Model?, Humanoid?, BasePart?)
	local character = player.Character
	if not character or not character.Parent then
		return nil, nil, nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or humanoid.Health <= 0 or not rootPart or not rootPart:IsA("BasePart") then
		return nil, nil, nil
	end
	return character, humanoid, rootPart
end

-- Award a kill exactly once per enemy.
local function creditKill(player: Player, enemy: Model)
	if enemy:GetAttribute("KillCredited") then
		return
	end
	enemy:SetAttribute("KillCredited", true)
	enemy:SetAttribute("KilledBy", player.UserId)

	local enemyType = EnemyUtil.getEnemyType(enemy)
	local stats = GameConfig.Enemies[enemyType]

	PlayerData.AddKill(player)
	if stats then
		PlayerData.AddXP(player, stats.XPReward)
		PlayerData.AddMoney(player, stats.MoneyReward)
	end
	QuestManager.OnEnemyKilled(player, enemyType)
end

local function handleAttack(player: Player, target: any)
	-- 1. Flood protection (drops spam before doing any work).
	if not floodLimiter:Allow(player) then
		return
	end

	-- 2. Cooldown, measured with the SERVER clock.
	local now = os.clock()
	local lastTime = lastAttackTime[player]
	if lastTime and now - lastTime < Combat.AttackCooldown then
		return
	end

	-- 3. Target must be a real living enemy in Workspace.Enemies.
	--    isValidEnemy type-checks first, so tables/strings/nil are rejected safely.
	local isValid, enemyHumanoid, enemyRoot = EnemyUtil.isValidEnemy(target, nil)
	if not isValid or not enemyHumanoid or not enemyRoot then
		return
	end

	-- 4. Attacker must be alive.
	local character, _, rootPart = getAliveCharacter(player)
	if not character or not rootPart then
		return
	end

	-- 5. Range check using server-side positions.
	local distance = (rootPart.Position - enemyRoot.Position).Magnitude
	if distance > Combat.MaximumAttackRange + Combat.RangeTolerance then
		return
	end

	-- All checks passed: consume the cooldown and apply damage.
	lastAttackTime[player] = now
	enemyHumanoid:TakeDamage(Combat.DamagePerHit)

	-- Remote events are processed one at a time on the server, so when two
	-- players hit the same enemy only the hit that takes Health to 0 gets here
	-- (later hits fail the "alive" check in step 3).
	if enemyHumanoid.Health <= 0 then
		creditKill(player, target :: Model)
	end
end

-- Extra arguments (e.g. a fake "damage" value) are simply ignored.
attackRemote.OnServerEvent:Connect(function(player, target)
	local ok, err = pcall(handleAttack, player, target)
	if not ok then
		warn("[CombatServer] attack error: " .. tostring(err))
	end
end)

Players.PlayerRemoving:Connect(function(player)
	lastAttackTime[player] = nil
	floodLimiter:Remove(player)
end)
