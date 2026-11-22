using System;
using System.Collections.Generic;

namespace OopsiePets
{
    /// <summary>Everything saved on the device. Plain JSON, no account, no network.</summary>
    [Serializable]
    public class SaveData
    {
        public const int CurrentVersion = 4;

        public int version = CurrentVersion;
        /// <summary>The version the file had when it was loaded (before <see cref="Sanitize"/>), for migrations.</summary>
        [NonSerialized] public int loadedVersion = CurrentVersion;
        public List<string> stickers = new List<string>();
        public List<string> unlockedPets = new List<string>();
        public List<PetSave> pets = new List<PetSave>();
        public List<string> decorations = new List<string>();
        [UnityEngine.Tooltip("Full version owned. TEST ONLY in this build: set from the parent settings, no payment (version 3+).")]
        public bool fullVersion;
        [UnityEngine.Tooltip("Locked friends whose padlock has already popped open (so it celebrates once).")]
        public List<string> celebrated = new List<string>();
        public Settings settings = new Settings();

        [Serializable]
        public class Settings
        {
            public float musicVolume = 0.7f;
            public float soundVolume = 1f;
        }

        [Serializable]
        public class PetSave
        {
            public string petId;
            public List<string> accessories = new List<string>();
            public List<int> completedActivities = new List<int>();
            public int careCount;
            [UnityEngine.Tooltip("The pet's starting outfit (its own accessory) has been put on once.")]
            public bool outfitSet;
            [UnityEngine.Tooltip("Rainbow coat on (offered after the pet's first full visit).")]
            public bool rainbow;
            [UnityEngine.Tooltip("A full visit with this pet has been finished (version 4+). Unlocks friends and the rainbow coat.")]
            public bool completed;
        }

        public PetSave Pet(string id)
        {
            foreach (var p in pets) if (p.petId == id) return p;
            var n = new PetSave { petId = id };
            pets.Add(n);
            return n;
        }

        /// <summary>Repairs anything missing after loading an older or partly broken file.</summary>
        public void Sanitize()
        {
            loadedVersion = version;
            stickers ??= new List<string>();
            unlockedPets ??= new List<string>();
            celebrated ??= new List<string>();
            pets ??= new List<PetSave>();
            decorations ??= new List<string>();
            settings ??= new Settings();
            settings.musicVolume = Clamp01(settings.musicVolume);
            settings.soundVolume = Clamp01(settings.soundVolume);
            unlockedPets.RemoveAll(string.IsNullOrEmpty);
            celebrated.RemoveAll(string.IsNullOrEmpty);
            pets.RemoveAll(p => p == null || string.IsNullOrEmpty(p.petId));
            foreach (var p in pets)
            {
                p.accessories ??= new List<string>();
                p.completedActivities ??= new List<int>();
            }
            version = CurrentVersion;
        }

        static float Clamp01(float v) => float.IsNaN(v) ? 1f : Math.Max(0f, Math.Min(1f, v));
    }
}
