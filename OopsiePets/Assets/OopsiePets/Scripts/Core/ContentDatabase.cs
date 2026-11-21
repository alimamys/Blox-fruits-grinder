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

        /// <summary>Every pet in packs the family owns (free packs today), whether or not the child has met it yet.</summary>
        public IEnumerable<PetDefinition> AvailablePets()
        {
            foreach (var p in packs)
                if (Entitlements.IsUnlocked(p))
                    foreach (var pet in p.pets) yield return pet;
        }

        /// <summary>Pets living in the clubhouse: the starters plus every friend earned from the gift box.</summary>
        public IEnumerable<PetDefinition> UnlockedPets()
        {
            foreach (var pet in AvailablePets())
                if (IsUnlocked(pet)) yield return pet;
        }

        public static bool IsUnlocked(PetDefinition pet) =>
            pet != null && (pet.startsUnlocked || SaveSystem.Data.unlockedPets.Contains(pet.id));

        /// <summary>The friend waiting in the gift box, or null once everyone has arrived.</summary>
        public PetDefinition NextFriend()
        {
            PetDefinition next = null;
            foreach (var pet in AvailablePets())
                if (!IsUnlocked(pet) && (next == null || pet.unlockOrder < next.unlockOrder)) next = pet;
            return next;
        }

        public IEnumerable<AccessoryDefinition> AvailableAccessories()
        {
            foreach (var p in packs)
                if (Entitlements.IsUnlocked(p))
                    foreach (var a in p.accessories) yield return a;
        }

        /// <summary>Accessories in the dress-up tray: the starters plus presents brought by friends who have arrived.</summary>
        public IEnumerable<AccessoryDefinition> UnlockedAccessories()
        {
            foreach (var a in AvailableAccessories())
            {
                var bringer = BroughtBy(a);
                if (bringer == null || IsUnlocked(bringer)) yield return a;
            }
        }

        public PetDefinition BroughtBy(AccessoryDefinition a)
        {
            foreach (var pet in AvailablePets())
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
            foreach (var p in AvailablePets()) if (p.id == id) return p;
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

    /// <summary>
    /// How friends are earned: every finished full care visit drops one heart into the gift box; a full box
    /// opens to let the next friend out. No timers, no purchases, nothing can be lost.
    /// </summary>
    public static class FriendGiftRules
    {
        public const int HeartsPerFriend = 3;

        /// <summary>Set when a heart was just earned, so the clubhouse can show it flying into the box.</summary>
        public static bool HeartJustEarned;

        public static bool Ready(ContentDatabase db) => db.NextFriend() != null && SaveSystem.Data.giftHearts >= HeartsPerFriend;

        /// <summary>Called after a full care visit. Returns true if a heart was added.</summary>
        public static bool AwardHeart(ContentDatabase db)
        {
            var d = SaveSystem.Data;
            if (db.NextFriend() == null || d.giftHearts >= HeartsPerFriend) return false;
            d.giftHearts++;
            HeartJustEarned = true;
            SaveSystem.Save();
            return true;
        }

        /// <summary>Lets the next friend out of the box: unlocks it, puts on its present, and starts a new box.</summary>
        public static PetDefinition OpenGift(ContentDatabase db)
        {
            var friend = db.NextFriend();
            if (friend == null) return null;
            Unlock(friend);
            SaveSystem.Data.giftHearts = 0;
            SaveSystem.Save();
            return friend;
        }

        /// <summary>Grown-up shortcut from the settings: every friend arrives at once.</summary>
        public static int UnlockAll(ContentDatabase db)
        {
            int n = 0;
            for (var f = db.NextFriend(); f != null; f = db.NextFriend()) { Unlock(f); n++; }
            SaveSystem.Data.giftHearts = 0;
            SaveSystem.Save();
            return n;
        }

        static void Unlock(PetDefinition friend)
        {
            var d = SaveSystem.Data;
            if (!d.unlockedPets.Contains(friend.id)) d.unlockedPets.Add(friend.id);
            if (friend.giftAccessory != null)
            {
                var save = d.Pet(friend.id);
                save.accessories.RemoveAll(id => id == friend.giftAccessory.id);
                save.accessories.Add(friend.giftAccessory.id);
            }
        }
    }
}
