--[[
	EnemyUtil  (ModuleScript)
	Location: ReplicatedStorage.Shared.EnemyUtil

	Enemy validation + nearest-enemy search. Used by:
	  * the client (AutoGrindController) to pick targets
	  * the server (CombatServer / EnemyAI) to validate targets

	The server always runs its OWN copy of this module, so client tampering
	cannot weaken server validation.
]]

local Workspace = game:GetService("Workspace")

local GameConfig = require(script.Parent:WaitForChild("GameConfig"))

local EnemyUtil = {}

function EnemyUtil.getEnemiesFolder(): Instance?
	return Workspace:FindFirstChild(GameConfig.Folders.Enemies)
end

-- The type of an enemy is its EnemyType attribute (set by EnemySpawner),
-- falling back to the model name for hand-placed NPCs.
function EnemyUtil.getEnemyType(model: Instance): string
	local enemyType = model:GetAttribute("EnemyType")
	if type(enemyType) == "string" and enemyType ~= "" then
		return enemyType
	end
	return model.Name
end

-- Returns the Humanoid and HumanoidRootPart of a model, or nil.
function EnemyUtil.getParts(model: Instance): (Humanoid?, BasePart?)
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	local rootPart = model:FindFirstChild("HumanoidRootPart")
	if not humanoid or not rootPart or not rootPart:IsA("BasePart") then
		return nil, nil
	end
	return humanoid, rootPart
end

--[[
	A valid enemy:
	  * is an Instance and a Model
	  * is a direct child of Workspace.Enemies (so players / random models never count)
	  * has a Humanoid and a HumanoidRootPart
	  * is alive (Health > 0)
	  * matches enemyName (nil or GameConfig.AnyEnemy = any type)

	Returns: isValid, humanoid, rootPart
]]
function EnemyUtil.isValidEnemy(instance: any, enemyName: string?): (boolean, Humanoid?, BasePart?)
	-- typeof() first: a RemoteEvent argument can be any value (table, string, nil...)
	if typeof(instance) ~= "Instance" or not instance:IsA("Model") then
		return false, nil, nil
	end

	local enemiesFolder = EnemyUtil.getEnemiesFolder()
	if not enemiesFolder or instance.Parent ~= enemiesFolder then
		return false, nil, nil
	end

	local humanoid, rootPart = EnemyUtil.getParts(instance)
	if not humanoid or not rootPart then
		return false, nil, nil
	end

	if humanoid.Health <= 0 or humanoid:GetState() == Enum.HumanoidStateType.Dead then
		return false, nil, nil
	end

	if enemyName ~= nil and enemyName ~= GameConfig.AnyEnemy and EnemyUtil.getEnemyType(instance) ~= enemyName then
		return false, nil, nil
	end

	return true, humanoid, rootPart
end

--[[
	Finds the closest valid enemy to originPosition.

	enemyName      : enemy type to look for (nil / "Any" = any type)
	originPosition : usually the player's HumanoidRootPart.Position
	maxDistance    : optional search radius (studs)
	ignore         : optional table { [Model] = truthy } of enemies to skip

	Returns: enemyModel?, rootPart?, distance
]]
function EnemyUtil.getNearestEnemy(
	enemyName: string?,
	originPosition: Vector3,
	maxDistance: number?,
	ignore: { [Instance]: any }?
): (Model?, BasePart?, number)
	local enemiesFolder = EnemyUtil.getEnemiesFolder()
	if not enemiesFolder then
		return nil, nil, math.huge
	end

	local bestEnemy: Model? = nil
	local bestRoot: BasePart? = nil
	-- Compare squared distances to avoid a square root per enemy.
	local bestDistanceSq = if maxDistance then maxDistance * maxDistance else math.huge

	for _, child in enemiesFolder:GetChildren() do
		if ignore and ignore[child] then
			continue
		end

		local isValid, _, rootPart = EnemyUtil.isValidEnemy(child, enemyName)
		if isValid and rootPart then
			local offset = rootPart.Position - originPosition
			local distanceSq = offset:Dot(offset)
			if distanceSq <= bestDistanceSq then
				bestDistanceSq = distanceSq
				bestEnemy = child :: Model
				bestRoot = rootPart
			end
		end
	end

	if not bestEnemy then
		return nil, nil, math.huge
	end
	return bestEnemy, bestRoot, math.sqrt(bestDistanceSq)
end

return EnemyUtil
