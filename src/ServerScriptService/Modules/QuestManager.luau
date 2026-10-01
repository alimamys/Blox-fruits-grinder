--[[
	QuestManager  (ModuleScript)
	Location: ServerScriptService.Modules.QuestManager

	Server-authoritative quests:
	  * the server decides which quests a player may take (level check)
	  * kills are counted ONLY from CombatServer's verified kill credit
	  * rewards are paid ONLY here, once per completion

	Quest state is replicated to the owning client through Player attributes:
	  AutoQuest (bool), QuestId, QuestName, QuestTarget (string),
	  QuestProgress, QuestRequired (number)

	Notifications are sent with QuestRemote:FireClient(player, eventName, data).
]]

local Players = game:GetService("Players")

local Modules = script.Parent
local PlayerData = require(Modules:WaitForChild("PlayerData"))
local QuestData = require(Modules:WaitForChild("QuestData"))

type Quest = {
	Id: string,
	Name: string,
	RequiredLevel: number,
	Target: string,
	RequiredKills: number,
	RewardXP: number,
	RewardMoney: number,
}

type QuestState = {
	AutoQuest: boolean,
	Quest: Quest?,
	Progress: number,
}

local QuestManager = {}

local initialized = false
local questRemote: RemoteEvent? = nil
local questsById: { [string]: Quest } = {}
local states: { [Player]: QuestState } = {}

for _, quest in QuestData do
	if questsById[quest.Id] then
		warn("[QuestManager] Duplicate quest Id: " .. quest.Id)
	end
	questsById[quest.Id] = quest
end

local function notify(player: Player, eventName: string, data: any)
	if questRemote and player.Parent == Players then
		questRemote:FireClient(player, eventName, data)
	end
end

-- Push the quest state to the player's attributes (replicates to their client).
local function publish(player: Player, state: QuestState)
	local quest = state.Quest
	player:SetAttribute("AutoQuest", state.AutoQuest)
	player:SetAttribute("QuestId", if quest then quest.Id else "")
	player:SetAttribute("QuestName", if quest then quest.Name else "")
	player:SetAttribute("QuestTarget", if quest then quest.Target else "")
	player:SetAttribute("QuestProgress", if quest then state.Progress else 0)
	player:SetAttribute("QuestRequired", if quest then quest.RequiredKills else 0)
end

local function getState(player: Player): QuestState?
	local state = states[player]
	if not state and player.Parent == Players then
		state = { AutoQuest = false, Quest = nil, Progress = 0 }
		states[player] = state
		publish(player, state)
	end
	return state
end

-- Best quest = the highest RequiredLevel the player qualifies for.
function QuestManager.GetBestQuest(level: number): Quest?
	local best: Quest? = nil
	for _, quest in QuestData do
		if quest.RequiredLevel <= level and (best == nil or quest.RequiredLevel > best.RequiredLevel) then
			best = quest
		end
	end
	return best
end

function QuestManager.GetQuestById(questId: string): Quest?
	return questsById[questId]
end

function QuestManager.StartQuest(player: Player, questId: string): (boolean, string?)
	local state = getState(player)
	if not state then
		return false, "NoPlayerState"
	end
	if state.Quest then
		return false, "AlreadyOnQuest"
	end

	local quest = questsById[questId]
	if not quest then
		return false, "UnknownQuest"
	end
	if PlayerData.GetLevel(player) < quest.RequiredLevel then
		return false, "LevelTooLow"
	end

	state.Quest = quest
	state.Progress = 0
	publish(player, state)
	notify(player, "QuestStarted", { Name = quest.Name, Target = quest.Target, Required = quest.RequiredKills })
	return true, nil
end

local function startBestQuest(player: Player)
	local quest = QuestManager.GetBestQuest(PlayerData.GetLevel(player))
	if quest then
		QuestManager.StartQuest(player, quest.Id)
	end
end

function QuestManager.AbandonQuest(player: Player)
	local state = getState(player)
	if not state or not state.Quest then
		return
	end
	state.Quest = nil
	state.Progress = 0
	publish(player, state)
	notify(player, "QuestAbandoned", nil)
end

function QuestManager.SetAutoQuest(player: Player, enabled: boolean)
	local state = getState(player)
	if not state then
		return
	end
	state.AutoQuest = enabled
	publish(player, state)

	if enabled and not state.Quest then
		startBestQuest(player)
	end
end

local function completeQuest(player: Player, state: QuestState)
	local quest = state.Quest
	if not quest then
		return
	end

	-- Clear the quest BEFORE paying out. Nothing below yields, but clearing first
	-- guarantees a reward can never be paid twice for one completion.
	state.Quest = nil
	state.Progress = 0

	PlayerData.AddXP(player, quest.RewardXP)
	PlayerData.AddMoney(player, quest.RewardMoney)

	notify(player, "QuestCompleted", {
		Name = quest.Name,
		RewardXP = quest.RewardXP,
		RewardMoney = quest.RewardMoney,
		Level = PlayerData.GetLevel(player),
	})

	-- Auto Quest: immediately pick the best quest for the (possibly new) level.
	if state.AutoQuest then
		startBestQuest(player)
	end
	publish(player, state)
end

-- Called ONLY by CombatServer after a server-verified kill.
function QuestManager.OnEnemyKilled(player: Player, enemyType: string)
	local state = states[player]
	if not state or not state.Quest then
		return
	end
	if state.Quest.Target ~= enemyType then
		return
	end

	state.Progress += 1
	if state.Progress >= state.Quest.RequiredKills then
		completeQuest(player, state)
	else
		publish(player, state)
	end
end

function QuestManager.Init(remote: RemoteEvent)
	if initialized then
		return
	end
	initialized = true
	questRemote = remote

	Players.PlayerAdded:Connect(function(player)
		getState(player)
	end)
	Players.PlayerRemoving:Connect(function(player)
		states[player] = nil -- prevent memory leaks
	end)
	for _, player in Players:GetPlayers() do
		getState(player)
	end
end

return QuestManager
