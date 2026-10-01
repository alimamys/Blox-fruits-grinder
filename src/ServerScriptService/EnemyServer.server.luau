--[[
	EnemyServer  (Script)
	Location: ServerScriptService.EnemyServer

	Starts enemy spawning/respawning and the lightweight server-side enemy AI.
]]

local ServerScriptService = game:GetService("ServerScriptService")

local Modules = ServerScriptService:WaitForChild("Modules")
local EnemySpawner = require(Modules:WaitForChild("EnemySpawner"))
local EnemyAI = require(Modules:WaitForChild("EnemyAI"))

EnemySpawner.Start()
EnemyAI.Start()
