--[[
	QuestServer  (Script)
	Location: ServerScriptService.QuestServer

	Handles client quest requests through ReplicatedStorage.Remotes.QuestRemote:
		QuestRemote:FireServer("SetAutoQuest", true/false)
		QuestRemote:FireServer("StartQuest", "BanditQuest")
		QuestRemote:FireServer("AbandonQuest")

	The client can only *ask*. Level requirements, kill counting and rewards
	are all decided by QuestManager on the server.

	Server -> client notifications on the same remote:
		"QuestStarted", "QuestCompleted", "QuestAbandoned", "QuestError", "LevelUp"
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Modules = ServerScriptService:WaitForChild("Modules")

local GameConfig = require(Shared:WaitForChild("GameConfig"))
local PlayerData = require(Modules:WaitForChild("PlayerData"))
local QuestManager = require(Modules:WaitForChild("QuestManager"))
local Remotes = require(Modules:WaitForChild("Remotes"))
local RateLimiter = require(Modules:WaitForChild("RateLimiter"))

local questRemote = Remotes.get(GameConfig.RemoteNames.QuestRemote)

PlayerData.Init()
QuestManager.Init(questRemote)

local limiter = RateLimiter.new(5, 1) -- 5 quest requests per second per player

local handlers: { [string]: (Player, any) -> () } = {
	SetAutoQuest = function(player, enabled)
		if type(enabled) ~= "boolean" then
			return
		end
		QuestManager.SetAutoQuest(player, enabled)
	end,

	StartQuest = function(player, questId)
		if type(questId) ~= "string" or #questId > 64 then
			return
		end
		local ok, reason = QuestManager.StartQuest(player, questId)
		if not ok then
			questRemote:FireClient(player, "QuestError", reason)
		end
	end,

	AbandonQuest = function(player)
		QuestManager.AbandonQuest(player)
	end,
}

questRemote.OnServerEvent:Connect(function(player, action, payload)
	if not limiter:Allow(player) then
		return
	end
	if type(action) ~= "string" then
		return
	end
	local handler = handlers[action]
	if not handler then
		return
	end
	local ok, err = pcall(handler, player, payload)
	if not ok then
		warn("[QuestServer] " .. tostring(err))
	end
end)

PlayerData.LevelUp:Connect(function(player, newLevel, levelsGained)
	if player.Parent == Players then
		questRemote:FireClient(player, "LevelUp", { Level = newLevel, LevelsGained = levelsGained })
	end
end)

Players.PlayerRemoving:Connect(function(player)
	limiter:Remove(player)
end)
