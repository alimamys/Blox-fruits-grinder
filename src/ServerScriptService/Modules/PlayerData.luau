--[[
	PlayerData  (ModuleScript)
	Location: ServerScriptService.Modules.PlayerData

	Server-only player progression: Level, XP, Money (shown in leaderstats)
	plus a "Kills" attribute and an "XPRequired" attribute on the Player.

	Only the server can change these values. Clients see them through the
	normal replication of leaderstats and Player attributes.

	PlayerData.Init() is idempotent: both CombatServer and QuestServer call it,
	and whichever runs first does the setup.

	NOTE: data is in memory only (resets when you leave). See README for how
	to add DataStoreService saving.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))

local Progression = GameConfig.Progression

type Profile = {
	Level: IntValue,
	XP: IntValue,
	Money: IntValue,
}

local PlayerData = {}

local initialized = false
local profiles: { [Player]: Profile } = {}

-- Fired as (player, newLevel, levelsGained). Server-side only.
local levelUpEvent = Instance.new("BindableEvent")
PlayerData.LevelUp = levelUpEvent.Event

local function isPositiveNumber(value: any): boolean
	return type(value) == "number" and value == value and value > 0 and value < math.huge
end

function PlayerData.GetXPRequired(level: number): number
	-- Guard the (user-editable) formula against returning 0 / negative / NaN,
	-- which would otherwise cause an infinite level-up loop.
	local ok, required = pcall(Progression.XPRequired, level)
	if not ok or type(required) ~= "number" or required ~= required then
		required = 100
	end
	return math.max(1, math.floor(required))
end

local function createIntValue(parent: Instance, name: string, value: number): IntValue
	local intValue = Instance.new("IntValue")
	intValue.Name = name
	intValue.Value = value
	intValue.Parent = parent
	return intValue
end

local function setupPlayer(player: Player)
	if profiles[player] then
		return
	end

	-- Remove any stale leaderstats (e.g. from another script) to avoid duplicates.
	local existing = player:FindFirstChild("leaderstats")
	if existing then
		existing:Destroy()
	end

	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"

	local profile: Profile = {
		Level = createIntValue(leaderstats, "Level", Progression.StartingLevel),
		XP = createIntValue(leaderstats, "XP", Progression.StartingXP),
		Money = createIntValue(leaderstats, "Money", Progression.StartingMoney),
	}

	leaderstats.Parent = player
	profiles[player] = profile

	player:SetAttribute("Kills", 0)
	player:SetAttribute("XPRequired", PlayerData.GetXPRequired(profile.Level.Value))
end

function PlayerData.Init()
	if initialized then
		return
	end
	initialized = true

	Players.PlayerAdded:Connect(setupPlayer)
	Players.PlayerRemoving:Connect(function(player)
		profiles[player] = nil -- prevent memory leaks
	end)

	-- Players who joined before this script ran (common in Play Solo).
	for _, player in Players:GetPlayers() do
		setupPlayer(player)
	end
end

-- Returns the profile, creating it on demand if the player is still in game.
function PlayerData.GetProfile(player: Player): Profile?
	local profile = profiles[player]
	if not profile and player.Parent == Players then
		setupPlayer(player)
		profile = profiles[player]
	end
	return profile
end

function PlayerData.GetLevel(player: Player): number
	local profile = PlayerData.GetProfile(player)
	return if profile then profile.Level.Value else Progression.StartingLevel
end

--[[
	Adds XP and processes level-ups. Supports multiple level-ups at once:
	  while XP >= XPRequired(Level): XP -= XPRequired(Level); Level += 1
]]
function PlayerData.AddXP(player: Player, amount: number)
	if not isPositiveNumber(amount) then
		return
	end
	local profile = PlayerData.GetProfile(player)
	if not profile then
		return
	end

	local level = profile.Level.Value
	local xp = profile.XP.Value + math.floor(amount)
	local levelsGained = 0

	while level < Progression.MaxLevel do
		local required = PlayerData.GetXPRequired(level)
		if xp < required then
			break
		end
		xp -= required
		level += 1
		levelsGained += 1
	end

	profile.Level.Value = level
	profile.XP.Value = xp
	player:SetAttribute("XPRequired", PlayerData.GetXPRequired(level))

	if levelsGained > 0 then
		levelUpEvent:Fire(player, level, levelsGained)
	end
end

function PlayerData.AddMoney(player: Player, amount: number)
	if not isPositiveNumber(amount) then
		return
	end
	local profile = PlayerData.GetProfile(player)
	if profile then
		profile.Money.Value += math.floor(amount)
	end
end

function PlayerData.AddKill(player: Player)
	if player.Parent ~= Players then
		return
	end
	local kills = player:GetAttribute("Kills")
	player:SetAttribute("Kills", (if type(kills) == "number" then kills else 0) + 1)
end

return PlayerData
