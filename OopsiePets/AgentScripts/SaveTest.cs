using System.IO;
using OopsiePets;
using UnityEngine;

public static class SaveTest
{
    public static string Corruption()
    {
        string dir = Application.persistentDataPath;
        string main = Path.Combine(dir, "oopsiepets_save.json"), bak = Path.Combine(dir, "oopsiepets_save.bak");
        int before = SaveSystem.Data.stickers.Count;
        SaveSystem.Save();
        SaveSystem.Save(); // backup now holds the same progress as main
        string keepMain = File.ReadAllText(main), keepBak = File.ReadAllText(bak);

        File.WriteAllText(main, "{ \"stickers\": [ this is not json ");
        var a = SaveSystem.Load();
        string r1 = $"main corrupt -> {SaveSystem.LastLoadNote}, stickers {a.stickers.Count}/{before}";

        File.WriteAllText(main, "");
        File.WriteAllText(bak, "garbage");
        var b = SaveSystem.Load();
        string r2 = $"both corrupt -> {SaveSystem.LastLoadNote}, stickers {b.stickers.Count}, music {b.settings.musicVolume}";

        File.WriteAllText(main, keepMain);
        File.WriteAllText(bak, keepBak);
        var c = SaveSystem.Load();
        return $"{r1} | {r2} | restored -> {SaveSystem.LastLoadNote}, stickers {c.stickers.Count}";
    }
}
