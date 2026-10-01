--[[
	StudioSetup  (run ONCE in the Roblox Studio Command Bar - View > Command Bar)

	Creates every non-script object the Auto Grind system needs:
	  ReplicatedStorage.Remotes.AttackEnemy / QuestRemote   (RemoteEvent)
	  ReplicatedStorage.Shared                               (Folder)
	  ServerScriptService.Modules                            (Folder)
	  ServerStorage.EnemyTemplates.Bandit / DesertBandit     (simple NPC rigs)
	  Workspace.Enemies                                      (Folder)
	  Workspace.EnemySpawns + 6 sample spawn Parts           (with attributes)
	  StarterGui.AutoGrindGui                                (ScreenGui, ResetOnSpawn = false)

	Safe to run more than once: existing objects are kept, never duplicated.
	(dist/AutoGrindInstaller.luau = this script + all the game scripts.)
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local ServerStorage = game:GetService("ServerStorage")
local StarterGui = game:GetService("StarterGui")
local Workspace = game:GetService("Workspace")

local function getOrCreate(parent: Instance, className: string, name: string): Instance
	local existing = parent:FindFirstChild(name)
	if existing then
		if not existing:IsA(className) then
			warn(("[Setup] %s exists but is a %s (expected %s)"):format(existing:GetFullName(), existing.ClassName, className))
		end
		return existing
	end
	local instance = Instance.new(className)
	instance.Name = name
	instance.Parent = parent
	print("[Setup] Created " .. instance:GetFullName())
	return instance
end

-- 1. Folders and remotes ------------------------------------------------
local remotes = getOrCreate(ReplicatedStorage, "Folder", "Remotes")
getOrCreate(remotes, "RemoteEvent", "AttackEnemy")
getOrCreate(remotes, "RemoteEvent", "QuestRemote")
getOrCreate(ReplicatedStorage, "Folder", "Shared")
getOrCreate(ServerScriptService, "Folder", "Modules")
getOrCreate(Workspace, "Folder", "Enemies")
local spawnsFolder = getOrCreate(Workspace, "Folder", "EnemySpawns")
local templates = getOrCreate(ServerStorage, "Folder", "EnemyTemplates")

local gui = getOrCreate(StarterGui, "ScreenGui", "AutoGrindGui") :: ScreenGui
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

-- 2. Enemy templates -----------------------------------------------------
-- A simple block NPC: HumanoidRootPart + welded visual parts + Humanoid.
-- RigType R15 + HipHeight lets a Humanoid stand and walk without Motor6D legs.
-- (For a nicer look: Avatar tab > Rig Builder, rename the rig, move it into
--  ServerStorage.EnemyTemplates. Any rig with Humanoid + HumanoidRootPart works.)
local function makePart(model: Model, name: string, size: Vector3, offset: Vector3, color: Color3, root: BasePart?): BasePart
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.Color = color
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Anchored = false
	part.CFrame = CFrame.new(offset)
	part.Parent = model
	if root then
		part.CanCollide = false
		part.Massless = true
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = root
		weld.Part1 = part
		weld.Parent = part
	end
	return part
end

local function buildEnemyTemplate(name: string, bodyColor: Color3, shirtColor: Color3, maxHealth: number, walkSpeed: number)
	if templates:FindFirstChild(name) then
		print("[Setup] Template " .. name .. " already exists - kept")
		return
	end

	local model = Instance.new("Model")
	model.Name = name

	local hipHeight = 2
	local rootY = hipHeight + 1 -- root is 2 studs tall, so its bottom sits at HipHeight

	local root = makePart(model, "HumanoidRootPart", Vector3.new(2, 2, 1), Vector3.new(0, rootY, 0), bodyColor, nil)
	root.Transparency = 1
	root.CanCollide = false

	local torso = makePart(model, "Torso", Vector3.new(2, 2, 1), Vector3.new(0, rootY, 0), shirtColor, root)
	torso.CanCollide = true -- body collider (sits above the floor at HipHeight)
	local head = makePart(model, "Head", Vector3.new(1.2, 1.2, 1.2), Vector3.new(0, rootY + 1.6, 0), bodyColor, root)
	makePart(model, "Left Arm", Vector3.new(1, 2, 1), Vector3.new(-1.5, rootY, 0), bodyColor, root)
	makePart(model, "Right Arm", Vector3.new(1, 2, 1), Vector3.new(1.5, rootY, 0), bodyColor, root)
	makePart(model, "Left Leg", Vector3.new(1, 2, 1), Vector3.new(-0.5, rootY - 2, 0), Color3.fromRGB(50, 50, 60), root)
	makePart(model, "Right Leg", Vector3.new(1, 2, 1), Vector3.new(0.5, rootY - 2, 0), Color3.fromRGB(50, 50, 60), root)

	local face = Instance.new("Decal")
	face.Name = "face"
	face.Texture = "rbxasset://textures/face.png"
	face.Face = Enum.NormalId.Front
	face.Parent = head

	local humanoid = Instance.new("Humanoid")
	humanoid.RigType = Enum.HumanoidRigType.R15
	humanoid.HipHeight = hipHeight
	humanoid.RequiresNeck = false
	humanoid.BreakJointsOnDeath = false
	humanoid.MaxHealth = maxHealth
	humanoid.Health = maxHealth
	humanoid.WalkSpeed = walkSpeed
	humanoid.DisplayName = name
	humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOn
	humanoid.Parent = model

	model.PrimaryPart = root
	model.Parent = templates
	print("[Setup] Created template ServerStorage.EnemyTemplates." .. name)
end

buildEnemyTemplate("Bandit", Color3.fromRGB(234, 184, 146), Color3.fromRGB(150, 40, 40), 100, 10)
buildEnemyTemplate("DesertBandit", Color3.fromRGB(200, 150, 110), Color3.fromRGB(210, 170, 70), 200, 12)

-- 3. Sample spawn points ---------------------------------------------------
local function makeSpawn(name: string, position: Vector3, enemyType: string, respawnTime: number, color: Color3)
	if spawnsFolder:FindFirstChild(name) then
		return
	end
	local part = Instance.new("Part")
	part.Name = name
	part.Size = Vector3.new(4, 1, 4)
	part.Position = position
	part.Anchored = true
	part.CanCollide = false
	part.CanQuery = false
	part.CanTouch = false
	part.Transparency = 0.6
	part.Color = color
	part.Material = Enum.Material.Neon
	part:SetAttribute("EnemyType", enemyType)
	part:SetAttribute("RespawnTime", respawnTime)
	part.Parent = spawnsFolder
	print("[Setup] Created spawn " .. part:GetFullName())
end

if #spawnsFolder:GetChildren() == 0 then
	local banditColor = Color3.fromRGB(200, 60, 60)
	local desertColor = Color3.fromRGB(220, 180, 70)
	makeSpawn("BanditSpawn1", Vector3.new(40, 0.5, 30), "Bandit", 5, banditColor)
	makeSpawn("BanditSpawn2", Vector3.new(55, 0.5, 45), "Bandit", 5, banditColor)
	makeSpawn("BanditSpawn3", Vector3.new(30, 0.5, 55), "Bandit", 5, banditColor)
	makeSpawn("DesertBanditSpawn1", Vector3.new(-60, 0.5, -50), "DesertBandit", 8, desertColor)
	makeSpawn("DesertBanditSpawn2", Vector3.new(-75, 0.5, -65), "DesertBandit", 8, desertColor)
	makeSpawn("DesertBanditSpawn3", Vector3.new(-50, 0.5, -75), "DesertBandit", 8, desertColor)
end

print("[Setup] Objects ready.")
