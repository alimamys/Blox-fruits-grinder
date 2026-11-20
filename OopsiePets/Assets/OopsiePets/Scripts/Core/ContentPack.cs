using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// A bundle of content (pets, accessories, stickers, decorations). The starter pack is free.
    /// Future premium packs plug in here; unlocking goes through <see cref="Entitlements"/>, which is
    /// local-only today. No payment code exists in this version by design.
    /// </summary>
    [CreateAssetMenu(menuName = "Oopsie Pets/Content Pack", fileName = "ContentPack")]
    public class ContentPack : ScriptableObject
    {
        public string id;
        public string displayName;
        public bool isFree = true;
        [Tooltip("Store product id for a future parent-facing purchase flow. Unused in this version.")]
        public string futureProductId;
        public List<PetDefinition> pets = new List<PetDefinition>();
        public List<AccessoryDefinition> accessories = new List<AccessoryDefinition>();
        public List<StickerDefinition> stickers = new List<StickerDefinition>();
    }

    /// <summary>Which packs are available. Today: free packs only; purchases are deliberately not implemented.</summary>
    public static class Entitlements
    {
        public static bool IsUnlocked(ContentPack pack) => pack != null && pack.isFree;
    }
}
