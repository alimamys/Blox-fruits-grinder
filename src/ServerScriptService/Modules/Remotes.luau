--[[
	Remotes  (ModuleScript)
	Location: ServerScriptService.Modules.Remotes

	Returns the RemoteEvents in ReplicatedStorage.Remotes, creating the folder
	or the remote if they are missing. This means the game still works if you
	forget to create a remote by hand (clients use WaitForChild with a timeout).
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GameConfig"))

local Remotes = {}

local function getRemotesFolder(): Folder
	local folder = ReplicatedStorage:FindFirstChild(GameConfig.Folders.Remotes)
	if folder and not folder:IsA("Folder") then
		warn("[Remotes] ReplicatedStorage.Remotes exists but is not a Folder")
	end
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = GameConfig.Folders.Remotes
		folder.Parent = ReplicatedStorage
	end
	return folder :: Folder
end

-- No yielding happens between the FindFirstChild and the creation, so two
-- server scripts calling this at the same time can never create duplicates.
function Remotes.get(name: string): RemoteEvent
	local folder = getRemotesFolder()
	local remote = folder:FindFirstChild(name)
	if remote and not remote:IsA("RemoteEvent") then
		error(("[Remotes] %s exists but is a %s, expected RemoteEvent"):format(name, remote.ClassName))
	end
	if not remote then
		remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
	end
	return remote :: RemoteEvent
end

return Remotes
