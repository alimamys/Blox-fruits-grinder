--[[
	AutoGrindGuiController  (LocalScript)
	Location: StarterGui.AutoGrindGui.AutoGrindGuiController
	          (AutoGrindGui is a ScreenGui with ResetOnSpawn = false)

	Builds the Auto Grind window from standard Roblox UI objects:
	  dark rounded window, draggable title bar, green ON / red OFF toggles,
	  target dropdown, numeric inputs, live status/kills/quest/level read-out.

	Talks to AutoGrindController through ReplicatedStorage.Shared.AutoGrindState
	and to the server only via QuestRemote ("SetAutoQuest").
	Everything displayed about kills / quests / level comes from server-owned
	Player attributes and leaderstats.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local screenGui = script.Parent
if screenGui:IsA("ScreenGui") then
	screenGui.ResetOnSpawn = false -- keep the window (and this script) across respawns
	screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
end

local Shared = ReplicatedStorage:WaitForChild("Shared", 15)
if not Shared then
	warn("[AutoGrindGui] ReplicatedStorage.Shared is missing - see README setup.")
	return
end
local GameConfig = require(Shared:WaitForChild("GameConfig"))
local State = require(Shared:WaitForChild("AutoGrindState"))

local remotesFolder = ReplicatedStorage:WaitForChild(GameConfig.Folders.Remotes, 15)
local questRemote = remotesFolder and remotesFolder:WaitForChild(GameConfig.RemoteNames.QuestRemote, 15)
if not questRemote then
	warn("[AutoGrindGui] Remotes.QuestRemote missing - Auto Quest button disabled.")
end

------------------------------------------------------------------------
-- Style
------------------------------------------------------------------------
local COLORS = {
	Background = Color3.fromRGB(24, 24, 30),
	TitleBar = Color3.fromRGB(32, 32, 40),
	Field = Color3.fromRGB(40, 40, 50),
	FieldHover = Color3.fromRGB(52, 52, 64),
	Stroke = Color3.fromRGB(60, 60, 75),
	Text = Color3.fromRGB(235, 235, 240),
	SubText = Color3.fromRGB(160, 160, 175),
	On = Color3.fromRGB(46, 170, 90),
	Off = Color3.fromRGB(190, 55, 55),
	Accent = Color3.fromRGB(90, 140, 255),
	Disabled = Color3.fromRGB(70, 70, 80),
}
local FONT = Enum.Font.GothamMedium
local FONT_BOLD = Enum.Font.GothamBold
local WINDOW_WIDTH = 270
local ROW_HEIGHT = 30

------------------------------------------------------------------------
-- UI helpers
------------------------------------------------------------------------
local function addCorner(parent: Instance, radius: number?)
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, radius or 6)
	corner.Parent = parent
end

local function addStroke(parent: Instance)
	local stroke = Instance.new("UIStroke")
	stroke.Color = COLORS.Stroke
	stroke.Thickness = 1
	stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
	stroke.Parent = parent
end

local function addPadding(parent: Instance, pixels: number)
	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, pixels)
	padding.PaddingBottom = UDim.new(0, pixels)
	padding.PaddingLeft = UDim.new(0, pixels)
	padding.PaddingRight = UDim.new(0, pixels)
	padding.Parent = parent
end

local function makeLabel(parent: Instance, text: string, props: { [string]: any }?): TextLabel
	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Font = FONT
	label.TextSize = 14
	label.TextColor3 = COLORS.Text
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Text = text
	label.Size = UDim2.new(1, 0, 0, ROW_HEIGHT)
	if props then
		for key, value in props do
			(label :: any)[key] = value
		end
	end
	label.Parent = parent
	return label
end

local function makeButton(parent: Instance, text: string, props: { [string]: any }?): TextButton
	local button = Instance.new("TextButton")
	button.AutoButtonColor = true
	button.BackgroundColor3 = COLORS.Field
	button.Font = FONT_BOLD
	button.TextSize = 14
	button.TextColor3 = COLORS.Text
	button.Text = text
	button.Size = UDim2.new(1, 0, 0, ROW_HEIGHT)
	addCorner(button)
	if props then
		for key, value in props do
			(button :: any)[key] = value
		end
	end
	button.Parent = parent
	return button
end

local layoutCounter = 0
local function nextOrder(): number
	layoutCounter += 1
	return layoutCounter
end

-- A row with a label on the left and a widget area on the right.
local function makeRow(parent: Instance, labelText: string): Frame
	local row = Instance.new("Frame")
	row.BackgroundTransparency = 1
	row.Size = UDim2.new(1, 0, 0, ROW_HEIGHT)
	row.LayoutOrder = nextOrder()
	row.Parent = parent
	makeLabel(row, labelText, { Size = UDim2.new(0.5, 0, 1, 0), TextColor3 = COLORS.SubText })
	return row
end

local function makeInfoRow(parent: Instance, labelText: string, initialValue: string): TextLabel
	local row = makeRow(parent, labelText)
	row.Size = UDim2.new(1, 0, 0, 22)
	return makeLabel(row, initialValue, {
		Position = UDim2.new(0.42, 0, 0, 0),
		Size = UDim2.new(0.58, 0, 1, 0),
		TextXAlignment = Enum.TextXAlignment.Right,
		TextTruncate = Enum.TextTruncate.AtEnd,
	})
end

local function setToggleVisual(button: TextButton, label: string, isOn: boolean)
	button.Text = ("%s: %s"):format(label, if isOn then "ON" else "OFF")
	button.BackgroundColor3 = if isOn then COLORS.On else COLORS.Off
end

local function formatNumber(value: number): string
	if value == math.floor(value) then
		return tostring(value)
	end
	return string.format("%.2f", value)
end

------------------------------------------------------------------------
-- Window
------------------------------------------------------------------------
local oldWindow = screenGui:FindFirstChild("AutoGrindWindow")
if oldWindow then
	oldWindow:Destroy()
end

local window = Instance.new("Frame")
window.Name = "AutoGrindWindow"
window.BackgroundColor3 = COLORS.Background
window.Position = UDim2.new(0, 20, 0.5, -220)
window.Size = UDim2.new(0, WINDOW_WIDTH, 0, 0)
window.AutomaticSize = Enum.AutomaticSize.Y
window.Parent = screenGui
addCorner(window, 10)
addStroke(window)

local windowLayout = Instance.new("UIListLayout")
windowLayout.SortOrder = Enum.SortOrder.LayoutOrder
windowLayout.Parent = window

-- Title bar (drag handle)
local titleBar = Instance.new("Frame")
titleBar.Name = "TitleBar"
titleBar.BackgroundColor3 = COLORS.TitleBar
titleBar.Size = UDim2.new(1, 0, 0, 36)
titleBar.LayoutOrder = 1
titleBar.Active = true
titleBar.Parent = window
addCorner(titleBar, 10)

makeLabel(titleBar, "AUTO GRIND", {
	Font = FONT_BOLD,
	TextSize = 16,
	Position = UDim2.new(0, 12, 0, 0),
	Size = UDim2.new(1, -60, 1, 0),
})

local collapseButton = makeButton(titleBar, "–", {
	Size = UDim2.new(0, 28, 0, 24),
	Position = UDim2.new(1, -34, 0.5, -12),
	BackgroundColor3 = COLORS.Field,
})

-- Content
local content = Instance.new("Frame")
content.Name = "Content"
content.BackgroundTransparency = 1
content.Size = UDim2.new(1, 0, 0, 0)
content.AutomaticSize = Enum.AutomaticSize.Y
content.LayoutOrder = 2
content.Parent = window
addPadding(content, 10)

local contentLayout = Instance.new("UIListLayout")
contentLayout.SortOrder = Enum.SortOrder.LayoutOrder
contentLayout.Padding = UDim.new(0, 6)
contentLayout.Parent = content

------------------------------------------------------------------------
-- Controls
------------------------------------------------------------------------
-- [ Auto Grind: OFF ]
local grindButton = makeButton(content, "", { LayoutOrder = nextOrder(), Size = UDim2.new(1, 0, 0, 36) })

-- Target: [ Bandit ▼ ]
local targetRow = makeRow(content, "Target:")
local targetButton = makeButton(targetRow, "", {
	Position = UDim2.new(0.42, 0, 0, 0),
	Size = UDim2.new(0.58, 0, 1, 0),
	Font = FONT,
})

local dropdown = Instance.new("Frame")
dropdown.Name = "TargetDropdown"
dropdown.BackgroundColor3 = COLORS.TitleBar
dropdown.Size = UDim2.new(1, 0, 0, 0)
dropdown.AutomaticSize = Enum.AutomaticSize.Y
dropdown.LayoutOrder = nextOrder()
dropdown.Visible = false
dropdown.Parent = content
addCorner(dropdown)
addPadding(dropdown, 4)
local dropdownLayout = Instance.new("UIListLayout")
dropdownLayout.SortOrder = Enum.SortOrder.LayoutOrder
dropdownLayout.Padding = UDim.new(0, 4)
dropdownLayout.Parent = dropdown

local targetOptions = table.clone(GameConfig.EnemyTypeOrder)
table.insert(targetOptions, GameConfig.AnyEnemy)
for index, enemyType in targetOptions do
	local option = makeButton(dropdown, enemyType, {
		LayoutOrder = index,
		Size = UDim2.new(1, 0, 0, 26),
		Font = FONT,
	})
	option.MouseButton1Click:Connect(function()
		State.Set("TargetType", enemyType)
		dropdown.Visible = false
	end)
end

-- Numeric TextBox bound to a State key.
local function makeNumberInput(labelText: string, stateKey: string)
	local row = makeRow(content, labelText)
	local box = Instance.new("TextBox")
	box.BackgroundColor3 = COLORS.Field
	box.Font = FONT
	box.TextSize = 14
	box.TextColor3 = COLORS.Text
	box.ClearTextOnFocus = false
	box.Position = UDim2.new(0.42, 0, 0, 0)
	box.Size = UDim2.new(0.58, 0, 1, 0)
	box.Text = formatNumber(State.Get(stateKey))
	box.Parent = row
	addCorner(box)

	box.FocusLost:Connect(function()
		-- State sanitises/clamps; invalid input reverts below.
		State.Set(stateKey, tonumber(box.Text))
		box.Text = formatNumber(State.Get(stateKey))
	end)
	return box
end

local attackDistanceBox = makeNumberInput("Attack Distance:", "AttackDistance")
local attackDelayBox = makeNumberInput("Attack Delay:", "AttackDelay")
local searchRangeBox = makeNumberInput("Search Range:", "MaxSearchDistance")

-- Auto Quest: [ OFF ]
local questButton = makeButton(content, "", { LayoutOrder = nextOrder() })

-- Divider
local divider = Instance.new("Frame")
divider.BackgroundColor3 = COLORS.Stroke
divider.BorderSizePixel = 0
divider.Size = UDim2.new(1, 0, 0, 1)
divider.LayoutOrder = nextOrder()
divider.Parent = content

-- Read-outs
local currentTargetLabel = makeInfoRow(content, "Current Target:", "None")
local statusLabel = makeInfoRow(content, "Status:", "Idle")
local killsLabel = makeInfoRow(content, "Kills:", "0")
local questLabel = makeInfoRow(content, "Quest:", "None")
local levelLabel = makeInfoRow(content, "Level:", "1")
local xpLabel = makeInfoRow(content, "XP:", "0 / 0")
local moneyLabel = makeInfoRow(content, "Money:", "0")

local toastLabel = makeLabel(content, "", {
	LayoutOrder = nextOrder(),
	Size = UDim2.new(1, 0, 0, 0),
	AutomaticSize = Enum.AutomaticSize.Y,
	TextWrapped = true,
	TextColor3 = COLORS.On,
	Visible = false,
})

local hintLabel = makeLabel(content, "Press G to toggle Auto Grind", {
	LayoutOrder = nextOrder(),
	Size = UDim2.new(1, 0, 0, 18),
	TextSize = 12,
	TextColor3 = COLORS.SubText,
})

------------------------------------------------------------------------
-- Refresh functions
------------------------------------------------------------------------
local STATUS_COLORS = {
	Attacking = COLORS.On,
	Moving = COLORS.Accent,
	Searching = COLORS.Text,
	Waiting = COLORS.SubText,
	Dead = COLORS.Off,
	Respawning = COLORS.Off,
	Idle = COLORS.SubText,
}

local function isQuestControllingTarget(): boolean
	local questTarget = player:GetAttribute("QuestTarget")
	return player:GetAttribute("AutoQuest") == true and type(questTarget) == "string" and questTarget ~= ""
end

local function refreshGrindButton()
	setToggleVisual(grindButton, "Auto Grind", State.Get("Enabled") == true)
end

local function refreshTargetButton()
	if isQuestControllingTarget() then
		targetButton.Text = tostring(player:GetAttribute("QuestTarget")) .. " (Quest)"
		targetButton.BackgroundColor3 = COLORS.Disabled
		dropdown.Visible = false
	else
		targetButton.Text = tostring(State.Get("TargetType")) .. " ▼"
		targetButton.BackgroundColor3 = COLORS.Field
	end
end

local function refreshQuestButton()
	setToggleVisual(questButton, "Auto Quest", player:GetAttribute("AutoQuest") == true)
	if not questRemote then
		questButton.BackgroundColor3 = COLORS.Disabled
	end
end

local function refreshQuestLabel()
	local questName = player:GetAttribute("QuestName")
	if type(questName) == "string" and questName ~= "" then
		questLabel.Text = ("%s — %d / %d"):format(
			questName,
			tonumber(player:GetAttribute("QuestProgress")) or 0,
			tonumber(player:GetAttribute("QuestRequired")) or 0
		)
	else
		questLabel.Text = "None"
	end
end

local function refreshKills()
	killsLabel.Text = tostring(player:GetAttribute("Kills") or 0)
end

local function refreshStatus()
	local status = State.Get("Status")
	statusLabel.Text = status
	statusLabel.TextColor3 = STATUS_COLORS[status] or COLORS.Text
end

local leaderstats: Instance? = nil
local function readStat(name: string): number
	local stat = leaderstats and leaderstats:FindFirstChild(name)
	return if stat and stat:IsA("IntValue") then stat.Value else 0
end

local function refreshProgress()
	levelLabel.Text = tostring(readStat("Level"))
	xpLabel.Text = ("%d / %d"):format(readStat("XP"), tonumber(player:GetAttribute("XPRequired")) or 0)
	moneyLabel.Text = tostring(readStat("Money"))
end

local toastToken = 0
local function showToast(message: string, color: Color3?)
	toastToken += 1
	local token = toastToken
	toastLabel.Text = message
	toastLabel.TextColor3 = color or COLORS.On
	toastLabel.Visible = true
	task.delay(4, function()
		if toastToken == token then
			toastLabel.Visible = false
		end
	end)
end

------------------------------------------------------------------------
-- Input handlers
------------------------------------------------------------------------
grindButton.MouseButton1Click:Connect(function()
	State.Set("Enabled", not State.Get("Enabled"))
end)

targetButton.MouseButton1Click:Connect(function()
	if isQuestControllingTarget() then
		showToast("Auto Quest is choosing the target.", COLORS.SubText)
		return
	end
	dropdown.Visible = not dropdown.Visible
end)

local questClickDebounce = false
questButton.MouseButton1Click:Connect(function()
	if not questRemote or questClickDebounce then
		return
	end
	questClickDebounce = true
	-- Ask the server; the button updates when the server changes the attribute.
	questRemote:FireServer("SetAutoQuest", player:GetAttribute("AutoQuest") ~= true)
	task.delay(0.4, function()
		questClickDebounce = false
	end)
end)

collapseButton.MouseButton1Click:Connect(function()
	content.Visible = not content.Visible
	collapseButton.Text = if content.Visible then "–" else "+"
end)

------------------------------------------------------------------------
-- Dragging (title bar). One global InputChanged connection for the GUI's
-- lifetime; the per-drag input.Changed connection is disconnected on release.
------------------------------------------------------------------------
local dragging = false
local dragStart = Vector3.zero
local windowStart = window.Position

titleBar.InputBegan:Connect(function(input)
	if input.UserInputType ~= Enum.UserInputType.MouseButton1 and input.UserInputType ~= Enum.UserInputType.Touch then
		return
	end
	dragging = true
	dragStart = input.Position
	windowStart = window.Position

	local releaseConnection: RBXScriptConnection? = nil
	releaseConnection = input.Changed:Connect(function()
		if input.UserInputState == Enum.UserInputState.End then
			dragging = false
			if releaseConnection then
				releaseConnection:Disconnect()
			end
		end
	end)
end)

UserInputService.InputChanged:Connect(function(input)
	if not dragging then
		return
	end
	if input.UserInputType ~= Enum.UserInputType.MouseMovement and input.UserInputType ~= Enum.UserInputType.Touch then
		return
	end
	local delta = input.Position - dragStart
	window.Position = UDim2.new(
		windowStart.X.Scale,
		windowStart.X.Offset + delta.X,
		windowStart.Y.Scale,
		windowStart.Y.Offset + delta.Y
	)
end)

------------------------------------------------------------------------
-- Data bindings
------------------------------------------------------------------------
State.Changed:Connect(function(key, value)
	if key == "Enabled" then
		refreshGrindButton()
	elseif key == "TargetType" then
		refreshTargetButton()
	elseif key == "Status" then
		refreshStatus()
	elseif key == "CurrentTarget" then
		currentTargetLabel.Text = tostring(value)
	elseif key == "AttackDistance" then
		attackDistanceBox.Text = formatNumber(value)
	elseif key == "AttackDelay" then
		attackDelayBox.Text = formatNumber(value)
	elseif key == "MaxSearchDistance" then
		searchRangeBox.Text = formatNumber(value)
	end
end)

for _, attributeName in { "AutoQuest", "QuestTarget" } do
	player:GetAttributeChangedSignal(attributeName):Connect(function()
		refreshQuestButton()
		refreshTargetButton()
	end)
end
for _, attributeName in { "QuestName", "QuestProgress", "QuestRequired" } do
	player:GetAttributeChangedSignal(attributeName):Connect(refreshQuestLabel)
end
player:GetAttributeChangedSignal("Kills"):Connect(refreshKills)
player:GetAttributeChangedSignal("XPRequired"):Connect(refreshProgress)

if questRemote then
	questRemote.OnClientEvent:Connect(function(eventName, data)
		if eventName == "QuestCompleted" and type(data) == "table" then
			showToast(("%s complete! +%s XP, +%s Money"):format(
				tostring(data.Name),
				tostring(data.RewardXP),
				tostring(data.RewardMoney)
			))
		elseif eventName == "QuestStarted" and type(data) == "table" then
			showToast(("Started %s"):format(tostring(data.Name)), COLORS.Accent)
		elseif eventName == "LevelUp" and type(data) == "table" then
			showToast(("Level up! You are now level %s"):format(tostring(data.Level)), COLORS.On)
		elseif eventName == "QuestError" then
			showToast("Quest error: " .. tostring(data), COLORS.Off)
		end
	end)
end

-- leaderstats is created by the server; wait for it without blocking the UI.
task.spawn(function()
	local stats = player:WaitForChild("leaderstats", 30)
	if not stats then
		return
	end
	leaderstats = stats
	for _, statName in { "Level", "XP", "Money" } do
		local stat = stats:WaitForChild(statName, 10)
		if stat and stat:IsA("IntValue") then
			stat.Changed:Connect(refreshProgress)
		end
	end
	refreshProgress()
end)

-- Initial paint
refreshGrindButton()
refreshTargetButton()
refreshQuestButton()
refreshQuestLabel()
refreshKills()
refreshStatus()
currentTargetLabel.Text = State.Get("CurrentTarget")
hintLabel.Visible = UserInputService.KeyboardEnabled
