using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Awards a sticker after a full care visit. The first time, it is always the pet's own sticker. After
    /// that the child finds the general stickers (paw, rainbow, star, heart) in random order, and once those
    /// are collected the pet's own sticker comes again. A visit never shows another friend's sticker (that
    /// friend's sticker belongs to finishing that friend). No timers, streaks or scarcity.
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
                var missing = db.AllStickers().Where(s => s != null && s.pet == null && !data.stickers.Contains(s.id)).ToList();
                if (missing.Count > 0) pick = missing[Random.Range(0, missing.Count)];
                else pick = pet != null ? pet.sticker : null; // everything found: this friend's own sticker again
            }
            if (pick != null && !data.stickers.Contains(pick.id)) data.stickers.Add(pick.id);
            SaveSystem.Save();
            return pick;
        }

        public static bool Has(StickerDefinition s) => s != null && SaveSystem.Data.stickers.Contains(s.id);

        public static int Count => SaveSystem.Data.stickers.Count;
    }
}
