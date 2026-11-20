using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Awards stickers after a full care session. A pet's own sticker comes first; after that the child
    /// discovers the other stickers in random order; once everything is collected any sticker can come again.
    /// No timers, streaks or scarcity.
    /// </summary>
    public static class StickerBook
    {
        public static StickerDefinition Award(ContentDatabase db, PetDefinition pet)
        {
            var data = SaveSystem.Data;
            StickerDefinition pick = null;
            if (pet != null && pet.sticker != null && !data.stickers.Contains(pet.sticker.id))
                pick = pet.sticker;
            if (pick == null)
            {
                var all = db.AllStickers().ToList();
                var missing = all.Where(s => !data.stickers.Contains(s.id) && (s.pet == null || s.pet == pet)).ToList();
                var pool = missing.Count > 0 ? missing : all;
                if (pool.Count > 0) pick = pool[Random.Range(0, pool.Count)];
            }
            if (pick != null && !data.stickers.Contains(pick.id)) data.stickers.Add(pick.id);
            SaveSystem.Save();
            return pick;
        }

        public static bool Has(StickerDefinition s) => s != null && SaveSystem.Data.stickers.Contains(s.id);

        public static int Count => SaveSystem.Data.stickers.Count;
    }
}
