--[[
	GameConfig  (ModuleScript)
	Location: ReplicatedStorage.Shared.GameConfig

	Central configuration shared by the server and the client.

	SECURITY NOTE: clients receive their own *copy* of this module. An exploiter
	editing their copy changes nothing on the server, because the server always
	validates with its own copy. So it is safe to keep combat numbers here.
]]

local GameConfig = {}

------------------------------------------------------------------------
-- Object names (change here if you rename folders / remotes in Studio)
------------------------------------------------------------------------
GameConfig.Folders = {
	Enemies = "Enemies", -- Workspace.Enemies         (live NPCs)
	EnemySpawns = "EnemySpawns", -- Workspace.EnemySpawns     (spawn point Parts)
	EnemyTemplates = "EnemyTemplates", -- ServerStorage.EnemyTemplates (NPC models to clone)
	Remotes = "Remotes", -- ReplicatedStorage.Remotes
}

GameConfig.RemoteNames = {
	AttackEnemy = "AttackEnemy",
	QuestRemote = "QuestRemote",
}

------------------------------------------------------------------------
-- Combat (server-authoritative; the server uses these to validate)
------------------------------------------------------------------------
GameConfig.Combat = {
	DamagePerHit = 20,
	AttackCooldown = 0.35, -- seconds between accepted hits per player
	MaximumAttackRange = 10, -- studs, HumanoidRootPart to HumanoidRootPart
	RangeTolerance = 1.5, -- extra studs allowed for network latency
	MaxRequestsPerSecond = 8, -- flood limit; requests above this are dropped
}

------------------------------------------------------------------------
-- Enemy types. Keys must match the template model names inside
-- ServerStorage.EnemyTemplates and the EnemyType attribute of spawn points.
------------------------------------------------------------------------
GameConfig.Enemies = {
	Bandit = {
		MaxHealth = 100,
		WalkSpeed = 10,
		XPReward = 25, -- XP per kill (quest rewards are separate)
		MoneyReward = 5,
		Damage = 5, -- damage the NPC deals to players (0 = harmless)
		AttackRange = 5,
		AttackInterval = 1.5,
		AggroRange = 25, -- NPC chases players inside this range
		LeashRange = 60, -- NPC returns home if it strays this far
		WanderRadius = 15,
	},
	DesertBandit = {
		MaxHealth = 200,
		WalkSpeed = 12,
		XPReward = 60,
		MoneyReward = 15,
		Damage = 10,
		AttackRange = 5,
		AttackInterval = 1.25,
		AggroRange = 30,
		LeashRange = 70,
		WanderRadius = 20,
	},
}

-- Order shown in the GUI target dropdown.
GameConfig.EnemyTypeOrder = { "Bandit", "DesertBandit" }

-- Special target value meaning "any enemy type".
GameConfig.AnyEnemy = "Any"

------------------------------------------------------------------------
-- Spawning
------------------------------------------------------------------------
GameConfig.Spawning = {
	DefaultRespawnTime = 5, -- used when a spawn point has no RespawnTime attribute
	CorpseLifetime = 2, -- seconds a dead NPC body stays before being removed
	SpawnHeightOffset = 3, -- studs above the spawn part
	RetryDelay = 10, -- retry delay if a template is missing
}

------------------------------------------------------------------------
-- Server-side enemy AI (wander / chase / hit back). Set Enabled = false
-- for completely passive training dummies.
------------------------------------------------------------------------
GameConfig.EnemyAI = {
	Enabled = true,
	TickInterval = 0.5,
	WanderIntervalMin = 3,
	WanderIntervalMax = 7,
}

------------------------------------------------------------------------
-- Player progression
------------------------------------------------------------------------
GameConfig.Progression = {
	StartingLevel = 1,
	StartingXP = 0,
	StartingMoney = 0,
	MaxLevel = 1000,
}

-- XP needed to go from `level` to `level + 1`. Edit this formula freely.
function GameConfig.Progression.XPRequired(level: number): number
	return 100 + (level * 50)
end

------------------------------------------------------------------------
-- Client Auto Grind defaults (players can change these in the GUI)
------------------------------------------------------------------------
GameConfig.AutoGrind = {
	DefaultTarget = "Bandit",

	AttackDistance = 7, -- where the character stops (studs)
	MinAttackDistance = 3,
	-- Max attack distance is derived: Combat.MaximumAttackRange - 1

	-- Client attack delay. Its minimum is AttackCooldown + NetworkBuffer so that
	-- network jitter never makes the server reject a hit for being "too early".
	AttackDelay = 0.4,
	NetworkBuffer = 0.05,
	MaxAttackDelay = 5,

	MaxSearchDistance = 500,
	MinSearchDistance = 20,
	MaxAllowedSearchDistance = 5000,

	ScanInterval = 1, -- wait between scans when no enemy exists
	StepInterval = 0.1, -- how often the engage loop re-evaluates
	AttackRangeSlack = 1, -- may attack up to AttackDistance + this
	RetargetInterval = 1, -- how often to look for a much closer enemy while moving
	RetargetMargin = 15, -- switch only if another enemy is this many studs closer
	ApproachTimeout = 15, -- give up on a target we cannot reach for this long
	BlacklistTime = 8, -- ignore an unreachable target for this long
}

------------------------------------------------------------------------
-- Client movement (PathfindingService + Humanoid:MoveTo)
------------------------------------------------------------------------
GameConfig.Movement = {
	UpdateInterval = 0.1, -- movement loop tick
	RepathInterval = 1.5, -- max age of a computed path
	RepathDistance = 4, -- recompute if the target moved more than this
	DirectMoveDistance = 35, -- closer than this: walk straight with MoveTo
	DirectMaxHeightDifference = 6, -- ...unless the height difference is large
	WaypointReachDistance = 3,
	ResumeSlack = 1, -- resume moving when target is StopDistance + this away
	StuckCheckInterval = 1.5,
	StuckMinMovement = 1, -- moved less than this in StuckCheckInterval = stuck

	AgentRadius = 2,
	AgentHeight = 5,
	AgentCanJump = true,
	WaypointSpacing = 4,
}

------------------------------------------------------------------------
-- Attack animation
------------------------------------------------------------------------
GameConfig.Animation = {
	-- >>> REPLACE THIS WITH YOUR OWN ANIMATION ID, e.g. "rbxassetid://1234567890" <<<
	-- "rbxassetid://0" means "no animation" and is skipped safely.
	AttackAnimationId = "rbxassetid://0",
	AttackAnimationSpeed = 1,
}

------------------------------------------------------------------------
-- Helpers
------------------------------------------------------------------------
function GameConfig.IsKnownEnemyType(enemyType: any): boolean
	return type(enemyType) == "string" and GameConfig.Enemies[enemyType] ~= nil
end

function GameConfig.GetMaxAttackDistance(): number
	return GameConfig.Combat.MaximumAttackRange - 1
end

function GameConfig.GetMinAttackDelay(): number
	return GameConfig.Combat.AttackCooldown + GameConfig.AutoGrind.NetworkBuffer
end

return GameConfig
