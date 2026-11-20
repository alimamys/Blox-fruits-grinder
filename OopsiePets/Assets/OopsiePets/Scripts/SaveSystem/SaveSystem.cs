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

        public static void Save()
        {
            if (Data == null) return;
            try
            {
                Directory.CreateDirectory(Dir);
                File.WriteAllText(TempPath, JsonUtility.ToJson(Data, true));
                if (File.Exists(MainPath)) File.Copy(MainPath, BackupPath, true);
                if (File.Exists(MainPath)) File.Delete(MainPath);
                File.Move(TempPath, MainPath);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[OopsiePets] Could not save progress: {e.Message}");
            }
        }

        /// <summary>Parent-facing reset. Keeps volume settings.</summary>
        public static void ResetProgress()
        {
            var settings = Data?.settings ?? new SaveData.Settings();
            Data = new SaveData { settings = settings };
            Save();
        }
    }
}
