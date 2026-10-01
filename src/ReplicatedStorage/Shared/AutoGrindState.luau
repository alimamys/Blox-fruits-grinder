--[[
	AutoGrindState  (ModuleScript)
	Location: ReplicatedStorage.Shared.AutoGrindState

	Tiny client-side state store shared between the AutoGrindController
	(StarterPlayerScripts) and the GUI (StarterGui). All LocalScripts on one
	client share the same required module, so both see the same values.

	Only the CLIENT uses this module. Nothing here is trusted by the server.

	Usage:
		AutoGrindState.Get("Enabled")
		AutoGrindState.Set("AttackDistance", 6)   -- value is sanitised/clamped
		AutoGrindState.Changed:Connect(function(key, value) ... end)
]]

local GameConfig = require(script.Parent:WaitForChild("GameConfig"))

local AutoGrindState = {}

local values = {
	Enabled = false,
	TargetType = GameConfig.AutoGrind.DefaultTarget,
	AttackDistance = GameConfig.AutoGrind.AttackDistance,
	AttackDelay = math.max(GameConfig.AutoGrind.AttackDelay, GameConfig.GetMinAttackDelay()),
	MaxSearchDistance = GameConfig.AutoGrind.MaxSearchDistance,
	Status = "Idle",
	CurrentTarget = "None",
}

local function clampNumber(value: any, minValue: number, maxValue: number): number?
	local number = tonumber(value)
	if number == nil or number ~= number then -- reject nil and NaN
		return nil
	end
	return math.clamp(number, minValue, maxValue)
end

-- Each sanitiser returns the cleaned value, or nil to reject the change.
local sanitizers = {
	Enabled = function(value)
		return value == true
	end,
	TargetType = function(value)
		if value == GameConfig.AnyEnemy or GameConfig.IsKnownEnemyType(value) then
			return value
		end
		return nil
	end,
	AttackDistance = function(value)
		return clampNumber(value, GameConfig.AutoGrind.MinAttackDistance, GameConfig.GetMaxAttackDistance())
	end,
	AttackDelay = function(value)
		return clampNumber(value, GameConfig.GetMinAttackDelay(), GameConfig.AutoGrind.MaxAttackDelay)
	end,
	MaxSearchDistance = function(value)
		return clampNumber(value, GameConfig.AutoGrind.MinSearchDistance, GameConfig.AutoGrind.MaxAllowedSearchDistance)
	end,
	Status = function(value)
		return if type(value) == "string" then value else nil
	end,
	CurrentTarget = function(value)
		return if type(value) == "string" then value else nil
	end,
}

local changedEvent = Instance.new("BindableEvent")
AutoGrindState.Changed = changedEvent.Event

function AutoGrindState.Get(key: string): any
	return values[key]
end

-- Returns true if the value changed.
function AutoGrindState.Set(key: string, value: any): boolean
	local sanitize = sanitizers[key]
	if not sanitize then
		warn(("[AutoGrindState] Unknown key '%s'"):format(tostring(key)))
		return false
	end

	local cleanValue = sanitize(value)
	if cleanValue == nil then
		-- Fire anyway so UIs can revert an invalid TextBox entry.
		changedEvent:Fire(key, values[key])
		return false
	end

	if values[key] == cleanValue then
		return false
	end

	values[key] = cleanValue
	changedEvent:Fire(key, cleanValue)
	return true
end

return AutoGrindState
