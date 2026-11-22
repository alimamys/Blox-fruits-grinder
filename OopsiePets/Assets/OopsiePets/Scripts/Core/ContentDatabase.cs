using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>All content the game knows about, grouped in packs.</summary>
    [CreateAssetMenu(menuName = "Oopsie Pets/Content Database", fileName = "ContentDatabase")]
    public class ContentDatabase : ScriptableObject
    {
        public List<ContentPack> packs = new List<ContentPack>();
        public FaceSet defaultFace;

        /// <summary>Every pet in the game, in clubhouse order, whether or not it can be played with yet.</summary>
        public IEnumerable<PetDefinition> AllPets()
        {
            var all = new List<PetDefinition>();
            foreach (var p in packs)
                if (p != null)
                    foreach (var pet in p.pets) if (pet != null && !all.Contains(pet)) all.Add(pet);
            all.Sort((a, b) => a.unlockOrder.CompareTo(b.unlockOrder));
            return all;
        }

        /// <summary>Pets the child can play with right now.</summary>
        public IEnumerable<PetDefinition> PlayablePets()
        {
            foreach (var pet in AllPets())
                if (IsPlayable(pet)) yield return pet;
        }

        /// <summary>A pet counts as completed once a full visit with it has been finished.</summary>
        public static bool IsCompleted(PetDefinition pet) =>
            pet != null && SaveSystem.Data.Pet(pet.id).completed;

        /// <summary>
        /// Saves before version 4 counted a pet as completed when its sticker was owned, but a repeat visit
        /// could hand out another friend's sticker. Only pets that were really played through (their own
        /// sticker, a care visit and dress-up done) count as completed; stickers are never taken away.
        /// </summary>
        public void MigrateCompletion(SaveData d)
        {
            if (d.loadedVersion >= 4) return;
            foreach (var pet in AllPets())
            {
                var ps = d.Pet(pet.id);
                if (pet.sticker != null && d.stickers.Contains(pet.sticker.id) && ps.careCount > 0
                    && ps.completedActivities.Contains((int)ActivityKind.DressUp))
                    ps.completed = true;
            }
            d.loadedVersion = SaveData.CurrentVersion;
        }

        public bool IsPlayable(PetDefinition pet)
        {
            if (pet == null) return false;
            if (pet.access == PetAccess.Free) return true;
            if (!Entitlements.FullVersion) return false;
            var (have, need) = Progress(pet);
            return have >= need;
        }

        /// <summary>
        /// For friends that are earned by playing: how many of the friends they wait for are completed, out
        /// of how many. (0 of 0 for pets that need nothing beyond the full version.)
        /// </summary>
        public (int have, int need) Progress(PetDefinition pet)
        {
            int have = 0, need = 0;
            if (pet == null || pet.access <= PetAccess.FullVersion) return (0, 0);
            foreach (var other in AllPets())
            {
                if (other == pet) continue;
                bool counts = pet.access == PetAccess.AfterBasePets ? other.access <= PetAccess.FullVersion : other.access != PetAccess.Last;
                if (!counts) continue;
                need++;
                if (IsCompleted(other)) have++;
            }
            return (have, need);
        }

        public IEnumerable<AccessoryDefinition> AvailableAccessories()
        {
            foreach (var p in packs)
                if (p != null)
                    foreach (var a in p.accessories) if (a != null) yield return a;
        }

        /// <summary>Accessories in the dress-up tray: the starters plus each playable friend's own accessory.</summary>
        public IEnumerable<AccessoryDefinition> UnlockedAccessories()
        {
            foreach (var a in AvailableAccessories())
            {
                var bringer = BroughtBy(a);
                if (bringer == null || IsPlayable(bringer)) yield return a;
            }
        }

        public PetDefinition BroughtBy(AccessoryDefinition a)
        {
            foreach (var pet in AllPets())
                if (pet.giftAccessory == a) return pet;
            return null;
        }

        public IEnumerable<StickerDefinition> AllStickers()
        {
            foreach (var p in packs)
                foreach (var s in p.stickers) yield return s;
        }

        public PetDefinition Pet(string id)
        {
            foreach (var p in AllPets()) if (p.id == id) return p;
            return null;
        }

        public AccessoryDefinition Accessory(string id)
        {
            foreach (var a in AvailableAccessories()) if (a.id == id) return a;
            return null;
        }

        public StickerDefinition Sticker(string id)
        {
            foreach (var s in AllStickers()) if (s.id == id) return s;
            return null;
        }
    }
}
