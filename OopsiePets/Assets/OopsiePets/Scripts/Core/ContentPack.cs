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
    /// What the family owns. The first three pets are free; the full version (one non-consumable store
    /// product, <see cref="FullVersionProductId"/>) opens the rest. It is bought through
    /// <see cref="FullVersionStore"/> (Google Play / App Store via Unity IAP) from the parent settings,
    /// behind the parent gate. Editor, development builds and the web demo also have a test switch (no
    /// payment); a full version unlocked by that switch is ignored by release builds.
    /// </summary>
    public static class Entitlements
    {
        /// <summary>The store product id (create it with this id in Google Play Console / App Store Connect).</summary>
        public const string FullVersionProductId = "oopsiepets.fullversion";
        public const string SourceStore = "store";
        public const string SourceTest = "test";

        /// <summary>The test switch exists only where nobody can buy for real: the Editor, development
        /// builds and the web demo.</summary>
        public static bool TestUnlockAllowed =>
            Application.isEditor || Debug.isDebugBuild || Application.platform == RuntimePlatform.WebGLPlayer;

        public static bool FullVersion
        {
            get
            {
                var d = SaveSystem.Data;
                if (d == null || !d.fullVersion) return false;
                return d.fullVersionSource != SourceTest || TestUnlockAllowed;
            }
        }

        public static bool IsUnlocked(ContentPack pack) => pack != null && (pack.isFree || FullVersion);

        /// <summary>Test switch (no payment). Saved on the device; ignored by release builds.</summary>
        public static void SetFullVersionForTesting(bool on)
        {
            if (!TestUnlockAllowed) return;
            var d = SaveSystem.Data;
            if (d.fullVersionSource == SourceStore && !on) return; // never take away a real purchase
            d.fullVersion = on;
            d.fullVersionSource = on ? SourceTest : "";
            SaveSystem.Save();
        }

        /// <summary>
        /// A store purchase (new, re-delivered or restored) of the full version. Idempotent. Returns true
        /// once the unlock is safely saved; only then may the store order be confirmed.
        /// </summary>
        public static bool GrantFromStore(string transactionId)
        {
            var d = SaveSystem.Data;
            d.fullVersion = true;
            d.fullVersionSource = SourceStore;
            if (!string.IsNullOrEmpty(transactionId) && !d.purchaseTransactions.Contains(transactionId))
                d.purchaseTransactions.Add(transactionId);
            return SaveSystem.Save();
        }
    }
}
