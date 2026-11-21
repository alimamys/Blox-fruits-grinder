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

    /// <summary>
    /// What the family owns. The first three pets are free; the full version (one product) opens the rest.
    /// IMPORTANT: in this build the full version is a TEST switch in the parent settings. No store, no
    /// payment and no receipt check exist yet; a real purchase flow (Google Play Billing / App Store via
    /// Unity IAP, behind the parent gate) must replace <see cref="SetFullVersionForTesting"/> once the store
    /// accounts and the children's-privacy and families-policy review are done.
    /// </summary>
    public static class Entitlements
    {
        /// <summary>The store product the full version would be sold as (not live).</summary>
        public const string FullVersionProductId = "oopsiepets.fullversion";

        public static bool FullVersion => SaveSystem.Data.fullVersion;

        public static bool IsUnlocked(ContentPack pack) => pack != null && (pack.isFree || FullVersion);

        /// <summary>Test-only switch (no payment). Saved on the device.</summary>
        public static void SetFullVersionForTesting(bool on)
        {
            SaveSystem.Data.fullVersion = on;
            SaveSystem.Save();
        }
    }
}
