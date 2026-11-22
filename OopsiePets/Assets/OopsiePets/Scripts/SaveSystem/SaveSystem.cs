using System;
using System.IO;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Local save: JSON in Application.persistentDataPath. Writes go to a temp file first and the previous
    /// save is kept as a backup, so a crash mid-write or a corrupted file never loses progress.
    /// </summary>
    public static class SaveSystem
    {
        public static SaveData Data { get; private set; }
        public static string LastLoadNote { get; private set; } = "";

        static string Dir => Application.persistentDataPath;
        static string MainPath => Path.Combine(Dir, "oopsiepets_save.json");
        static string BackupPath => Path.Combine(Dir, "oopsiepets_save.bak");
        static string TempPath => Path.Combine(Dir, "oopsiepets_save.tmp");

        public static SaveData Load()
        {
            var main = TryRead(MainPath, out var mainNote);
            if (main != null)
            {
                Data = main;
                LastLoadNote = "main";
            }
            else
            {
                var backup = TryRead(BackupPath, out var backupNote);
                Data = backup ?? new SaveData();
                LastLoadNote = backup != null ? $"backup (main {mainNote})" : $"new (main {mainNote}, backup {backupNote})";
            }
            Data.Sanitize();
            return Data;
        }

        static SaveData TryRead(string path, out string note)
        {
            note = "";
            try
            {
                if (!File.Exists(path)) { note = "missing"; return null; }
                var json = File.ReadAllText(path);
                if (string.IsNullOrWhiteSpace(json)) { note = "empty"; return null; }
                var d = JsonUtility.FromJson<SaveData>(json);
                note = d == null ? "unreadable" : "ok";
                return d;
            }
            catch (Exception e)
            {
                note = "corrupt: " + e.GetType().Name;
                Debug.LogWarning($"[OopsiePets] Save file {Path.GetFileName(path)} could not be read ({e.GetType().Name}); using backup/defaults.");
                return null;
            }
        }

        /// <summary>Writes the save. Returns false if it could not be written (the purchase flow then
        /// leaves the store order unconfirmed, so it is delivered again on the next launch).</summary>
        public static bool Save()
        {
            if (Data == null) return false;
            try
            {
                Directory.CreateDirectory(Dir);
                File.WriteAllText(TempPath, JsonUtility.ToJson(Data, true));
                if (File.Exists(MainPath)) File.Copy(MainPath, BackupPath, true);
                if (File.Exists(MainPath)) File.Delete(MainPath);
                File.Move(TempPath, MainPath);
                return true;
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[OopsiePets] Could not save progress: {e.Message}");
                return false;
            }
        }

        /// <summary>Parent-facing reset. Keeps volume settings.</summary>
        public static void ResetProgress()
        {
            // Starting over erases play progress, never what the family owns (the full version).
            var settings = Data?.settings ?? new SaveData.Settings();
            var old = Data;
            Data = new SaveData { settings = settings };
            if (old != null)
            {
                Data.fullVersion = old.fullVersion;
                Data.fullVersionSource = old.fullVersionSource;
                Data.purchaseTransactions = old.purchaseTransactions ?? new System.Collections.Generic.List<string>();
            }
            Save();
        }
    }
}
