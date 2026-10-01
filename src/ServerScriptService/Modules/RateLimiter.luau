--[[
	RateLimiter  (ModuleScript)
	Location: ServerScriptService.Modules.RateLimiter

	Fixed-window, per-player request limiter for RemoteEvents.
	Drops requests from clients that spam a remote (exploit / flood protection).

	local limiter = RateLimiter.new(8, 1) -- 8 requests per 1 second
	if not limiter:Allow(player) then return end
	limiter:Remove(player) -- on PlayerRemoving (prevents memory leaks)
]]

local RateLimiter = {}
RateLimiter.__index = RateLimiter

function RateLimiter.new(maxRequests: number, windowSeconds: number)
	local self = setmetatable({}, RateLimiter)
	self._maxRequests = maxRequests
	self._windowSeconds = windowSeconds
	self._buckets = {} :: { [Player]: { WindowStart: number, Count: number } }
	return self
end

function RateLimiter:Allow(player: Player): boolean
	local now = os.clock()
	local bucket = self._buckets[player]
	if not bucket or now - bucket.WindowStart >= self._windowSeconds then
		bucket = { WindowStart = now, Count = 0 }
		self._buckets[player] = bucket
	end
	bucket.Count += 1
	return bucket.Count <= self._maxRequests
end

function RateLimiter:Remove(player: Player)
	self._buckets[player] = nil
end

return RateLimiter
