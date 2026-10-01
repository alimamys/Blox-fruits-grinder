--[[
	MovementController  (ModuleScript)
	Location: StarterPlayer.StarterPlayerScripts.MovementController

	Moves the local character toward a (possibly moving) target part using
	legitimate movement only:
	  * close range / similar height -> Humanoid:MoveTo straight at the target
	  * long range / obstacles       -> PathfindingService waypoints + Humanoid:MoveTo
	No teleporting, no CFrame movement.

	The destination is re-evaluated every UpdateInterval, so it keeps up with
	NPCs that walk around. It stops StopDistance studs from the target and
	automatically resumes if the target moves away.

	local movement = MovementController.new()
	movement:SetCharacter(character)
	movement:Follow(enemyRootPart, 7)   -- non-blocking, safe to call every tick
	movement:Stop()
]]

local PathfindingService = game:GetService("PathfindingService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))

local Settings = GameConfig.Movement

local MovementController = {}
MovementController.__index = MovementController

-- Horizontal distance (ignores height), so small Y differences don't matter.
local function flatDistance(a: Vector3, b: Vector3): number
	local delta = a - b
	return Vector3.new(delta.X, 0, delta.Z).Magnitude
end

-- A point between us and the target, slightly inside the stop radius.
local function getApproachPoint(fromPosition: Vector3, targetPosition: Vector3, stopDistance: number): Vector3
	local flatOffset = Vector3.new(targetPosition.X - fromPosition.X, 0, targetPosition.Z - fromPosition.Z)
	if flatOffset.Magnitude < 0.01 then
		return targetPosition
	end
	local standOff = math.max(stopDistance - 1.5, 1)
	return targetPosition - flatOffset.Unit * standOff
end

function MovementController.new()
	local self = setmetatable({}, MovementController)
	self._humanoid = nil :: Humanoid?
	self._rootPart = nil :: BasePart?
	self._target = nil :: BasePart?
	self._stopDistance = GameConfig.AutoGrind.AttackDistance
	self._followToken = 0 -- incremented to cancel the running follow loop
	self._isFollowing = false
	self._arrived = false
	return self
end

function MovementController:SetCharacter(character: Model?)
	self:Stop()
	self._humanoid = nil
	self._rootPart = nil
	if character then
		local humanoid = character:FindFirstChildOfClass("Humanoid")
		local rootPart = character:FindFirstChild("HumanoidRootPart")
		if humanoid and rootPart and rootPart:IsA("BasePart") then
			self._humanoid = humanoid
			self._rootPart = rootPart
		end
	end
end

function MovementController:IsFollowing(): boolean
	return self._isFollowing
end

function MovementController:HasArrived(): boolean
	return self._isFollowing and self._arrived
end

-- Cancel the follow loop without halting the character (used when switching targets).
function MovementController:_cancel()
	self._followToken += 1
	self._isFollowing = false
	self._target = nil
	self._arrived = false
end

-- Cancel and stand still.
function MovementController:Stop()
	local wasFollowing = self._isFollowing
	self:_cancel()
	local humanoid, rootPart = self._humanoid, self._rootPart
	if wasFollowing and humanoid and rootPart and humanoid.Health > 0 and rootPart.Parent then
		humanoid:MoveTo(rootPart.Position)
	end
end

function MovementController:Follow(targetPart: BasePart, stopDistance: number)
	self._stopDistance = stopDistance
	if self._isFollowing and self._target == targetPart then
		return -- already following this target; just updated the stop distance
	end
	self:_cancel()
	if not self._humanoid or not self._rootPart then
		return
	end
	self._target = targetPart
	self._isFollowing = true
	task.spawn(self._followLoop, self, self._followToken)
end

-- Returns waypoints or nil. A fresh Path per computation means an old
-- (cancelled) loop can never read results computed for a newer one.
function MovementController:_computePath(fromPosition: Vector3, toPosition: Vector3): { PathWaypoint }?
	local path = PathfindingService:CreatePath({
		AgentRadius = Settings.AgentRadius,
		AgentHeight = Settings.AgentHeight,
		AgentCanJump = Settings.AgentCanJump,
		WaypointSpacing = Settings.WaypointSpacing,
	})
	local ok = pcall(function()
		path:ComputeAsync(fromPosition, toPosition)
	end)
	if not ok or path.Status ~= Enum.PathStatus.Success then
		return nil
	end
	return path:GetWaypoints()
end

function MovementController:_followLoop(token: number)
	local waypoints: { PathWaypoint }? = nil
	local waypointIndex = 0
	local lastPathTime = -math.huge
	local lastPathGoal: Vector3? = nil
	local stuckCheckTime = os.clock()
	local stuckCheckPosition: Vector3? = nil

	while self._followToken == token do
		local humanoid, rootPart, target = self._humanoid, self._rootPart, self._target
		if not humanoid or not rootPart or not target then
			break
		end
		if humanoid.Health <= 0 or not rootPart.Parent or not target.Parent then
			break -- character died or target removed; caller decides what next
		end

		local myPosition = rootPart.Position
		local targetPosition = target.Position
		local distance = flatDistance(myPosition, targetPosition)

		-- Hysteresis: stop at StopDistance, but only resume beyond StopDistance + ResumeSlack,
		-- so the character doesn't jitter at the edge of the range.
		local resumeDistance = self._stopDistance + Settings.ResumeSlack
		if distance <= self._stopDistance or (self._arrived and distance <= resumeDistance) then
			if not self._arrived then
				humanoid:MoveTo(myPosition) -- halt
			end
			self._arrived = true
			waypoints = nil
			stuckCheckPosition = nil
		else
			self._arrived = false

			local heightDifference = math.abs(targetPosition.Y - myPosition.Y)
			local useDirect = distance <= Settings.DirectMoveDistance
				and heightDifference <= Settings.DirectMaxHeightDifference

			if useDirect then
				waypoints = nil
				humanoid:MoveTo(getApproachPoint(myPosition, targetPosition, self._stopDistance))
			else
				local now = os.clock()
				local needsPath = waypoints == nil
					or now - lastPathTime >= Settings.RepathInterval
					or (lastPathGoal ~= nil and flatDistance(lastPathGoal, targetPosition) > Settings.RepathDistance)

				if needsPath then
					waypoints = self:_computePath(myPosition, targetPosition)
					if self._followToken ~= token then
						break -- cancelled while ComputeAsync was yielding
					end
					lastPathTime = os.clock()
					lastPathGoal = targetPosition
					waypointIndex = 2 -- waypoint 1 is our own starting position
				end

				local waypoint = waypoints and waypoints[waypointIndex]
				if waypoint and flatDistance(rootPart.Position, waypoint.Position) <= Settings.WaypointReachDistance then
					waypointIndex += 1
					waypoint = waypoints and waypoints[waypointIndex]
				end

				if waypoint then
					if waypoint.Action == Enum.PathWaypointAction.Jump then
						humanoid.Jump = true
					end
					humanoid:MoveTo(waypoint.Position)
				else
					-- No path (or path finished): fall back to walking straight.
					waypoints = nil
					humanoid:MoveTo(getApproachPoint(myPosition, targetPosition, self._stopDistance))
				end
			end

			-- Stuck detection: barely moved for a while -> jump and force a repath.
			local now = os.clock()
			if stuckCheckPosition == nil then
				stuckCheckPosition = myPosition
				stuckCheckTime = now
			elseif now - stuckCheckTime >= Settings.StuckCheckInterval then
				if (myPosition - stuckCheckPosition).Magnitude < Settings.StuckMinMovement then
					humanoid.Jump = true
					waypoints = nil
					lastPathTime = -math.huge
				end
				stuckCheckPosition = myPosition
				stuckCheckTime = now
			end
		end

		task.wait(Settings.UpdateInterval)
	end

	-- Only clear state if no newer Follow() replaced this loop.
	if self._followToken == token then
		self._isFollowing = false
		self._target = nil
		self._arrived = false
	end
end

return MovementController
