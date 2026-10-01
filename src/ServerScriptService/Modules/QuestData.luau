--[[
	QuestData  (ModuleScript)
	Location: ServerScriptService.Modules.QuestData

	Quest definitions. Kept on the server so clients cannot read or alter
	rewards. Add more quests by adding entries; Ids must be unique and Target
	must match a key in GameConfig.Enemies.
]]

return {
	{
		Id = "BanditQuest",
		Name = "Bandit Quest",
		RequiredLevel = 1,
		Target = "Bandit",
		RequiredKills = 5,
		RewardXP = 250,
		RewardMoney = 100,
	},
	{
		Id = "DesertBanditQuest",
		Name = "Desert Bandit Quest",
		RequiredLevel = 20,
		Target = "DesertBandit",
		RequiredKills = 8,
		RewardXP = 500,
		RewardMoney = 250,
	},
}
